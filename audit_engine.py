import sqlite3
from database import get_db

def audit_and_recheck_transaction(tx_data: dict, current_tx_id: int = None) -> dict:
    """
    Performs comprehensive audit and recheck on an incoming transaction:
    1. Exact hash check (same file re-uploaded)
    2. Exact transaction ref_number check
    3. Fuzzy duplicate check (same date, same amount, same/similar payee)
    4. Mathematical validation (amount + fee == total_amount)
    
    Returns updated dict with audit_status, audit_note, and duplicate_of_id.
    """
    audit_status = "clean"
    audit_notes = []
    duplicate_of_id = None

    conn = get_db()
    cursor = conn.cursor()

    ref_number = (tx_data.get("ref_number") or "").strip()
    file_hash = (tx_data.get("file_hash") or "").strip()
    amount = float(tx_data.get("amount") or 0.0)
    fee = float(tx_data.get("fee") or 0.0)
    total_amount = float(tx_data.get("total_amount") or 0.0)
    tx_date = (tx_data.get("transaction_date") or "").strip()
    payee = (tx_data.get("payee_name") or "").strip()

    # Rule 1: Exact File Hash Match
    if file_hash:
        query = "SELECT id, ref_number, transaction_date, total_amount FROM transactions WHERE file_hash = ?"
        params = [file_hash]
        if current_tx_id:
            query += " AND id != ?"
            params.append(current_tx_id)
        cursor.execute(query, params)
        dup_file = cursor.fetchone()
        if dup_file:
            audit_status = "duplicate_exact"
            duplicate_of_id = dup_file["id"]
            audit_notes.append(f"รูปภาพซ้ำ 100% กับรายการ #{dup_file['id']} (ยอด {dup_file['total_amount']:,.2f} ฿)")

    # Rule 2: Exact Transaction Reference Number Match
    if ref_number and ref_number.lower() not in ["", "none", "null", "-", "n/a"] and audit_status != "duplicate_exact":
        query = "SELECT id, ref_number, transaction_date, total_amount, payee_name FROM transactions WHERE LOWER(ref_number) = LOWER(?)"
        params = [ref_number]
        if current_tx_id:
            query += " AND id != ?"
            params.append(current_tx_id)
        cursor.execute(query, params)
        dup_ref = cursor.fetchone()
        if dup_ref:
            audit_status = "duplicate_exact"
            duplicate_of_id = dup_ref["id"]
            audit_notes.append(f"พบรหัสอ้างอิงสลิปซ้ำกับรายการ #{dup_ref['id']} (Ref: {ref_number}, ยอด {dup_ref['total_amount']:,.2f} ฿)")

    # Rule 3: Fuzzy / Reconciliation Check
    # (Same Date + Same Amount + Similar Payee or Account)
    if audit_status == "clean" and tx_date and amount > 0:
        query = """
            SELECT id, ref_number, transaction_date, transaction_time, total_amount, payee_name, payment_source 
            FROM transactions 
            WHERE transaction_date = ? 
              AND ABS(total_amount - ?) < 0.01
        """
        params = [tx_date, total_amount]
        if current_tx_id:
            query += " AND id != ?"
            params.append(current_tx_id)
            
        cursor.execute(query, params)
        possible_dups = cursor.fetchall()
        for p in possible_dups:
            # Check if payee is similar or either is empty
            p_payee = (p["payee_name"] or "").strip()
            if not payee or not p_payee or (payee.lower() in p_payee.lower() or p_payee.lower() in payee.lower()):
                audit_status = "duplicate_fuzzy"
                duplicate_of_id = p["id"]
                audit_notes.append(
                    f"เตือนรายการซ้ำซ้อน: ยอดเงิน {total_amount:,.2f} ฿ ตรงกับรายการ #{p['id']} "
                    f"ในวันที่ {tx_date} (ร้านค้า: {p_payee or 'ไม่ระบุ'})"
                )
                break

    # Rule 4: Mathematical Reconciliation Check
    calc_total = amount + fee
    if total_amount > 0 and abs(calc_total - total_amount) > 0.05:
        if audit_status == "clean":
            audit_status = "math_mismatch"
        audit_notes.append(f"ยอดคำนวณไม่ตรงกัน: ยอดเงิน ({amount:,.2f}) + ค่าธรรมเนียม ({fee:,.2f}) != ยอดรวม ({total_amount:,.2f})")

    # Rule 5: Zero or Negative Amount Check
    if total_amount <= 0.0:
        if audit_status == "clean":
            audit_status = "manual_flag"
        audit_notes.append("ไม่พบยอดเงินหรือยอดเงินเป็น 0.00 บาท กรุณาตรวจสอบสลิปอีกครั้ง")

    conn.close()

    result = dict(tx_data)
    result["audit_status"] = audit_status
    result["audit_note"] = " | ".join(audit_notes) if audit_notes else "ผ่านการตรวจสอบ (Audit Clean)"
    result["duplicate_of_id"] = duplicate_of_id
    return result

def recheck_all_transactions():
    """Batch rechecks the entire database to refresh duplicate linkages."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM transactions ORDER BY id ASC")
    all_txs = [dict(r) for r in cursor.fetchall()]
    conn.close()

    updated_count = 0
    for tx in all_txs:
        audited = audit_and_recheck_transaction(tx, current_tx_id=tx["id"])
        if audited["audit_status"] != tx["audit_status"] or audited["audit_note"] != tx["audit_note"]:
            conn = get_db()
            c = conn.cursor()
            c.execute("""
                UPDATE transactions 
                SET audit_status = ?, audit_note = ?, duplicate_of_id = ?
                WHERE id = ?
            """, (audited["audit_status"], audited["audit_note"], audited["duplicate_of_id"], tx["id"]))
            conn.commit()
            conn.close()
            updated_count += 1

    return updated_count
