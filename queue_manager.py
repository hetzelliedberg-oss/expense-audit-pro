import os
import time
import uuid
import logging
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from config import MAX_WORKER_THREADS
from database import (
    compute_file_hash,
    create_batch,
    update_batch_progress,
    insert_transaction,
    get_batch
)
from ai_extractor import extract_with_gemini
from audit_engine import audit_and_recheck_transaction

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("QueueManager")

# Thread pool executor for asynchronous processing of batch uploads
executor = ThreadPoolExecutor(max_workers=MAX_WORKER_THREADS)

def process_single_image(batch_id: str, file_name: str, file_path: str):
    """Processes a single uploaded document in the background with real factual extraction."""
    try:
        # Step 1: Compute File Hash for exact duplicate image detection
        f_hash = compute_file_hash(file_path)

        # Step 2: Check if background API key is set; if not, queue for Gemini 3.8 Flash
        from database import get_setting
        from datetime import datetime
        api_key = get_setting("api_key", "") or os.environ.get("GEMINI_API_KEY", "")

        if not api_key:
            # Seamless mode: save document and prepare for Gemini 3.8 Flash audit
            tx_data = {
                "batch_id": batch_id,
                "file_name": file_name,
                "file_path": file_path,
                "file_hash": f_hash,
                "doc_type": "bank_slip",
                "transaction_date": datetime.now().strftime("%Y-%m-%d"),
                "transaction_time": datetime.now().strftime("%H:%M:%S"),
                "transaction_datetime": datetime.now().isoformat(),
                "type": "expense",
                "amount": 0.0,
                "fee": 0.0,
                "vat": 0.0,
                "total_amount": 0.0,
                "category": "รอสแกน",
                "subcategory": "",
                "payment_source": "",
                "sender_name": "",
                "sender_account": "",
                "payee_name": file_name,
                "payee_account": "",
                "ref_number": "",
                "items": [],
                "confidence_score": 1.0,
                "notes": "อัปโหลดสำเร็จแล้ว พร้อมให้ Gemini 3.8 Flash สแกนยอดจริง",
                "audit_status": "pending_audit",
                "audit_note": "พร้อมให้ Gemini 3.8 Flash ทำการ Audit และแยกค่าใช้จ่าย",
                "raw_ai_response": ""
            }
            trans_id = insert_transaction(tx_data)
            update_batch_progress(batch_id, processed_increment=1)
            logger.info(f"Batch {batch_id}: Enqueued {file_name} as Tx #{trans_id} (Ready for Gemini 3.8 Flash)")
            return

        # Real Gemini AI Multimodal Vision Extraction (if API key configured)
        extracted_result = extract_with_gemini(file_path, api_key=api_key)
        tx_list = extracted_result.get("transactions", [])
        
        if not tx_list:
            logger.warning(f"Batch {batch_id}: No transactions detected in {file_name}")
            update_batch_progress(batch_id, processed_increment=1)
            return

        inserted_count = 0
        for tx in tx_list:
            # Package Data Factually
            tx_data = {
                "batch_id": batch_id,
                "file_name": file_name,
                "file_path": file_path,
                "file_hash": f_hash,
                "doc_type": tx.get("doc_type", extracted_result.get("doc_type", "bank_slip")),
                "transaction_date": tx.get("transaction_date", ""),
                "transaction_time": tx.get("transaction_time", ""),
                "transaction_datetime": tx.get("transaction_datetime", ""),
                "type": tx.get("type", "expense"),
                "amount": float(tx.get("amount", 0.0)),
                "fee": float(tx.get("fee", 0.0)),
                "vat": float(tx.get("vat", 0.0)),
                "total_amount": float(tx.get("total_amount", 0.0)),
                "category": tx.get("category", "ทั่วไป"),
                "subcategory": tx.get("subcategory", ""),
                "payment_source": tx.get("payment_source", ""),
                "sender_name": tx.get("sender_name", ""),
                "sender_account": tx.get("sender_account", ""),
                "payee_name": tx.get("payee_name", ""),
                "payee_account": tx.get("payee_account", ""),
                "ref_number": tx.get("ref_number", ""),
                "items": tx.get("items", []),
                "confidence_score": float(tx.get("confidence_score", 1.0)),
                "notes": tx.get("notes", ""),
                "raw_ai_response": tx.get("raw_ai_response", "")
            }

            # Step 3: Real Audit & Recheck (Exact duplicate, fuzzy match, arithmetic check)
            audited_tx = audit_and_recheck_transaction(tx_data)

            # Step 4: Insert transaction into database
            trans_id = insert_transaction(audited_tx)
            inserted_count += 1
            logger.info(f"Batch {batch_id}: Processed {file_name} -> Tx #{trans_id} ({audited_tx['audit_status']})")

        # Step 5: Update batch progress
        update_batch_progress(batch_id, processed_increment=1)

    except Exception as e:
        logger.error(f"Batch {batch_id}: Error processing {file_name}: {str(e)}", exc_info=True)
        update_batch_progress(batch_id, failed_increment=1)

def enqueue_batch(batch_name: str, file_tuples: list) -> str:
    """
    Receives a list of (file_name, file_path) tuples.
    Creates batch record and launches worker threads for each image.
    Returns batch_id.
    """
    batch_id = str(uuid.uuid4())
    total_files = len(file_tuples)
    create_batch(batch_id, batch_name, total_files)

    for fname, fpath in file_tuples:
        executor.submit(process_single_image, batch_id, fname, fpath)

    return batch_id
