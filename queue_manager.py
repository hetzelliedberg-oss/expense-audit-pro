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
    """Processes a single uploaded document in the background."""
    try:
        # Step 1: Compute File Hash
        f_hash = compute_file_hash(file_path)

        # Step 2: AI OCR & Multimodal Extraction (Gemini)
        extracted = extract_with_gemini(file_path)

        # Step 3: Package Data
        tx_data = {
            "batch_id": batch_id,
            "file_name": file_name,
            "file_path": file_path,
            "file_hash": f_hash,
            "doc_type": extracted.get("doc_type", "bank_slip"),
            "transaction_date": extracted.get("transaction_date", ""),
            "transaction_time": extracted.get("transaction_time", ""),
            "transaction_datetime": extracted.get("transaction_datetime", ""),
            "type": extracted.get("type", "expense"),
            "amount": float(extracted.get("amount", 0.0)),
            "fee": float(extracted.get("fee", 0.0)),
            "vat": float(extracted.get("vat", 0.0)),
            "total_amount": float(extracted.get("total_amount", 0.0)),
            "category": extracted.get("category", "ทั่วไป"),
            "subcategory": extracted.get("subcategory", ""),
            "payment_source": extracted.get("payment_source", ""),
            "sender_name": extracted.get("sender_name", ""),
            "sender_account": extracted.get("sender_account", ""),
            "payee_name": extracted.get("payee_name", ""),
            "payee_account": extracted.get("payee_account", ""),
            "ref_number": extracted.get("ref_number", ""),
            "items": extracted.get("items", []),
            "confidence_score": float(extracted.get("confidence_score", 1.0)),
            "notes": extracted.get("notes", ""),
            "raw_ai_response": extracted.get("raw_ai_response", "")
        }

        # Step 4: Audit & Recheck (Duplicate detection, math check, reconciliation)
        audited_tx = audit_and_recheck_transaction(tx_data)

        # Step 5: Insert into database
        trans_id = insert_transaction(audited_tx)

        # Step 6: Update batch progress
        update_batch_progress(batch_id, processed_increment=1)
        logger.info(f"Batch {batch_id}: Successfully processed {file_name} -> Tx #{trans_id} (Audit: {audited_tx['audit_status']})")

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
