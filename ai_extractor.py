import os
import json
import re
import time
import mimetypes
from datetime import datetime
from pathlib import Path
from database import get_setting

# Import official google-genai SDK
try:
    from google import genai
    from google.genai import types
    HAS_GENAI = True
except ImportError:
    HAS_GENAI = False

SYSTEM_INSTRUCTION = """
คุณคือผู้ตรวจสอบบัญชีและวิเคราะห์เอกสารทางการเงินระดับมืออาชีพ (Professional Financial Auditor & Fact-based OCR Engine)
เป้าหมายของคุณคือ: "อ่านและสกัดข้อเท็จจริง (FACTS ONLY) 100% จากภาพเอกสารที่อัปโหลดเท่านั้น ห้ามแต่งเติมหรือสมมุติตัวเลขเด็ดขาด"

ประเภทเอกสารที่ต้องรองรับ:
1. สลิปโอนเงินธนาคารไทยทุกแห่ง (KBank, SCB, KTB, BBL, TTB, GSB, BAY, ธ.ก.ส., พร้อมเพย์ PromptPay, TrueMoney ฯลฯ)
2. สเตทเม้นท์ธนาคาร (Bank Statement) หรือ รายการเดินบัญชี (ซึ่งอาจมีหลายสิบรายการใน 1 หน้ากระดาษ)
3. ใบแจ้งหนี้/บิลบัตรเครดิต (Credit Card Statement / Slip)
4. ใบเสร็จรับเงิน / ใบกำกับภาษี (7-Eleven, Makro, Lotus, Big C, ปั๊มน้ำมัน, ร้านอาหาร, ร้านค้าทั่วไป)

กฎเกณฑ์ความถูกต้องระดับ Fact-Check (Strict Rules):
1. ยอดเงิน (Amount, Fee, VAT, Total):
   - อ่านตัวเลขจริงที่ปรากฏบนเอกสารเท่านั้น
   - แปลงเครื่องหมายลูกน้ำออก เช่น "1,450.50" -> 1450.50
   - หากมีค่าธรรมเนียม (Fee) หรือภาษีมูลค่าเพิ่ม (VAT 7%) ให้สกัดแยกออกมาตามจริง
2. วันที่ (Date) และ เวลา (Time):
   - แปลงเป็นรูปแบบมาตรฐานสากล YYYY-MM-DD เสมอ
   - หากเป็นปี พ.ศ. (เช่น 2567, 2568, 2569) ให้แปลงเป็น ค.ศ. เสมอ (เช่น 2567 -> 2024, 2568 -> 2025, 2569 -> 2026)
   - เดือนภาษาไทย (ม.ค. - ธ.ค.) ให้แปลงเป็นเลข 01 - 12
   - เวลา ให้สกัดเป็น HH:MM:SS (24 ชั่วโมง) หากไม่มีระบุวินาทีให้ใส่ :00
3. รหัสอ้างอิงธุรกรรม (Transaction Ref ID):
   - สกัดเลขอ้างอิงสลิป (เช่น 20260315..., 014075..., SCB-...) ออกมาให้ครบถ้วนทุกตัวอักษร ห้ามตกหล่น เพราะต้องใช้ในการ Audit Duplicate ตรวจสลิปซ้ำ
4. กรณีเป็นสเตทเม้นท์ (Statement) หรือเอกสารที่มีหลายรายการใน 1 รูปภาพ:
   - ตั้งค่า "is_multiple_transactions": true
   - สกัดทุกบรรทัดรายการย่อยออกมาไว้ในอาร์เรย์ "transactions" แต่ละรายการแยกออกจากกันอย่างสมบูรณ์
5. กรณีรูปภาพไม่ใช่เอกสารการเงิน มัว มองไม่เห็น หรืออ่านยอดเงินไม่ได้:
   - ให้ระบุ "doc_type": "unrecognized", "total_amount": 0.0 และระบุเหตุผลจริงใน "notes" (เช่น "ภาพเบลอ ไม่สามารถระบุยอดเงินได้") ห้ามเดาตัวเลขขึ้นมาเอง

รูปแบบโครงสร้างผลลัพธ์ JSON (Strict Output Schema):
{
  "doc_type": "bank_slip" | "statement" | "credit_card" | "receipt_invoice" | "unrecognized",
  "is_multiple_transactions": false,
  "transactions": [
    {
      "transaction_date": "YYYY-MM-DD",
      "transaction_time": "HH:MM:SS",
      "type": "expense" | "income" | "transfer",
      "amount": 0.00,
      "fee": 0.00,
      "vat": 0.00,
      "total_amount": 0.00,
      "category": "หมวดหมู่หลักภาษาไทย",
      "subcategory": "หมวดหมู่ย่อย",
      "payment_source": "ชื่อธนาคารหรือบัตร",
      "sender_name": "ชื่อผู้โอน",
      "sender_account": "เลขบัญชีผู้โอน",
      "payee_name": "ชื่อผู้รับ/ร้านค้า",
      "payee_account": "เลขบัญชีผู้รับ",
      "ref_number": "รหัสอ้างอิงธุรกรรม/เลขอ้างอิงสลิป",
      "items": ["รายการสินค้า/บริการ"],
      "notes": "รายละเอียดข้อเท็จจริงที่ตรวจพบ",
      "confidence_score": 0.98
    }
  ]
}
"""

PROMPT_USER = """
กรุณาตรวจสอบและถอดข้อเท็จจริง (FACTS ONLY) จากภาพเอกสารทางการเงินนี้อย่างละเอียดที่สุด ห้ามสมมุติข้อมูลขึ้นมาเอง และตอบกลับเฉพาะ JSON ตาม Schema ที่กำหนดเท่านั้น:
"""

def extract_with_gemini(image_path: str, api_key: str = None) -> dict:
    """
    Extracts real factual transaction data from an image using Gemini Vision API.
    Raises an error or reports true unreadable status if no API key or if image is unreadable.
    NO MOCKING. FACT ONLY.
    """
    if not api_key:
        api_key = get_setting("api_key", "") or os.environ.get("GEMINI_API_KEY", "")

    if not api_key:
        raise ValueError(
            "ยังไม่ได้ตั้งค่า Google Gemini API Key กรุณาระบุ API Key ที่ปุ่มตั้งค่า (Settings) บนหน้าเว็บ เพื่อเริ่มสแกนข้อมูลจริงจากสลิป"
        )

    if not HAS_GENAI:
        raise RuntimeError("ไม่พบไลบรารี google-genai กรุณาติดตั้งด้วยคำสั่ง pip install google-genai")

    mime_type, _ = mimetypes.guess_type(image_path)
    if not mime_type:
        mime_type = "image/jpeg"

    with open(image_path, "rb") as f:
        image_bytes = f.read()

    client = genai.Client(api_key=api_key)

    # Use state-of-the-art vision models
    candidate_models = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-1.5-pro"]
    
    last_err = None
    for model_name in candidate_models:
        try:
            image_part = types.Part.from_bytes(data=image_bytes, mime_type=mime_type)
            
            response = client.models.generate_content(
                model=model_name,
                contents=[image_part, PROMPT_USER],
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_INSTRUCTION,
                    response_mime_type="application/json",
                    temperature=0.0
                )
            )

            text = response.text.strip()
            # Clean markdown codeblocks if present
            if text.startswith("```json"):
                text = text[7:]
            if text.startswith("```"):
                text = text[3:]
            if text.endswith("```"):
                text = text[:-3]
            text = text.strip()

            parsed = json.loads(text)
            
            # Normalize schema: ensure 'transactions' list exists
            if "transactions" not in parsed or not isinstance(parsed["transactions"], list):
                # Single transaction wrapped
                single_tx = {
                    "transaction_date": parsed.get("transaction_date", ""),
                    "transaction_time": parsed.get("transaction_time", ""),
                    "type": parsed.get("type", "expense"),
                    "amount": float(parsed.get("amount", 0.0)),
                    "fee": float(parsed.get("fee", 0.0)),
                    "vat": float(parsed.get("vat", 0.0)),
                    "total_amount": float(parsed.get("total_amount", 0.0)),
                    "category": parsed.get("category", "ทั่วไป"),
                    "subcategory": parsed.get("subcategory", ""),
                    "payment_source": parsed.get("payment_source", ""),
                    "sender_name": parsed.get("sender_name", ""),
                    "sender_account": parsed.get("sender_account", ""),
                    "payee_name": parsed.get("payee_name", ""),
                    "payee_account": parsed.get("payee_account", ""),
                    "ref_number": str(parsed.get("ref_number", "")).strip(),
                    "items": parsed.get("items", []),
                    "notes": parsed.get("notes", ""),
                    "confidence_score": float(parsed.get("confidence_score", 1.0))
                }
                parsed["transactions"] = [single_tx]
            
            # Enrich each transaction
            for tx in parsed["transactions"]:
                if not tx.get("total_amount") or float(tx["total_amount"]) == 0.0:
                    tx["total_amount"] = float(tx.get("amount", 0.0)) + float(tx.get("fee", 0.0))
                time_str = tx.get("transaction_time", "00:00:00")
                tx["transaction_datetime"] = f"{tx.get('transaction_date', '')}T{time_str}"
                tx["doc_type"] = parsed.get("doc_type", "bank_slip")
                tx["raw_ai_response"] = text

            return parsed

        except Exception as e:
            last_err = e
            time.sleep(1)

    raise RuntimeError(f"การประมวลผลด้วย Gemini API ล้มเหลว: {str(last_err)}")
