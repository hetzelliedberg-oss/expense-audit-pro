import os
import uuid
import sys
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass
from pathlib import Path
from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
from config import BASE_DIR, UPLOAD_FOLDER, PORT, HOST, MAX_CONTENT_LENGTH, ALLOWED_EXTENSIONS
from database import (
    init_db,
    get_db,
    get_setting,
    set_setting,
    get_batch,
    insert_transaction,
    get_transactions_filtered,
    get_transaction,
    update_transaction,
    delete_transaction,
    get_daily_summary,
    get_monthly_summary,
    get_category_breakdown,
    get_statistics
)
from queue_manager import enqueue_batch
from audit_engine import recheck_all_transactions, audit_and_recheck_transaction
from exporter import export_transactions_to_excel, export_transactions_to_csv

app = Flask(__name__, static_folder="static", static_url_path="")
app.config["MAX_CONTENT_LENGTH"] = MAX_CONTENT_LENGTH
CORS(app)

# Initialize SQLite database
init_db()

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

# ----------------------------------------------------
# Static and Upload File Serving
# ----------------------------------------------------
@app.route("/")
def index():
    return send_from_directory("static", "index.html")

@app.route("/uploads/<path:filename>")
def serve_upload(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

# ----------------------------------------------------
# Batch Upload Endpoints (Unlimited Files)
# ----------------------------------------------------
@app.route("/api/upload", methods=["POST"])
def upload_files():
    """
    Accepts unlimited batch image files (e.g. 50, 100, 200+ images in one request).
    Saves them to disk and dispatches to background queue workers immediately.
    """
    if "files" not in request.files:
        return jsonify({"error": "No files provided"}), 400

    files = request.files.getlist("files")
    if not files or files[0].filename == "":
        return jsonify({"error": "Empty file list"}), 400

    batch_name = request.form.get("batch_name", f"Batch {datetime_stamp()}")
    saved_file_tuples = []

    for f in files:
        if f and allowed_file(f.filename):
            orig_name = f.filename
            ext = orig_name.rsplit(".", 1)[1].lower()
            unique_name = f"{uuid.uuid4().hex[:12]}_{orig_name}"
            dest_path = UPLOAD_FOLDER / unique_name
            f.save(str(dest_path))
            saved_file_tuples.append((orig_name, str(dest_path)))

    if not saved_file_tuples:
        return jsonify({"error": "No valid image files found"}), 400

    batch_id = enqueue_batch(batch_name, saved_file_tuples)

    return jsonify({
        "status": "queued",
        "batch_id": batch_id,
        "total_files": len(saved_file_tuples),
        "message": f"Enqueued {len(saved_file_tuples)} files for background AI processing."
    })

def datetime_stamp():
    from datetime import datetime
    return datetime.now().strftime("%Y-%m-%d %H:%M")

@app.route("/api/batch/<batch_id>/status", methods=["GET"])
def batch_status(batch_id):
    batch = get_batch(batch_id)
    if not batch:
        return jsonify({"error": "Batch not found"}), 404

    total = batch["total_files"] or 1
    done = (batch["processed_files"] or 0) + (batch["failed_files"] or 0)
    pct = round((done / total) * 100, 1)

    is_finished = done >= total
    if is_finished and batch["status"] == "processing":
        from database import update_batch_progress
        update_batch_progress(batch_id, status="completed")
        batch["status"] = "completed"

    return jsonify({
        "batch_id": batch["id"],
        "name": batch["name"],
        "total_files": batch["total_files"],
        "processed_files": batch["processed_files"],
        "failed_files": batch["failed_files"],
        "status": batch["status"],
        "percentage": pct,
        "is_finished": is_finished
    })

# ----------------------------------------------------
# Transactions API
# ----------------------------------------------------
@app.route("/api/transactions", methods=["GET"])
def list_transactions():
    filters = {
        "start_date": request.args.get("start_date"),
        "end_date": request.args.get("end_date"),
        "category": request.args.get("category"),
        "type": request.args.get("type"),
        "payment_source": request.args.get("payment_source"),
        "audit_status": request.args.get("audit_status"),
        "search": request.args.get("search"),
        "limit": request.args.get("limit")
    }
    txs = get_transactions_filtered(filters)
    
    # Add relative web URL for image file preview
    for t in txs:
        if t.get("file_path"):
            t["image_url"] = f"/uploads/{Path(t['file_path']).name}"
        else:
            t["image_url"] = ""

    return jsonify({"transactions": txs, "count": len(txs)})

@app.route("/api/transactions/<int:tx_id>", methods=["GET"])
def transaction_detail(tx_id):
    tx = get_transaction(tx_id)
    if not tx:
        return jsonify({"error": "Not found"}), 404
    if tx.get("file_path"):
        tx["image_url"] = f"/uploads/{Path(tx['file_path']).name}"
    return jsonify(tx)

@app.route("/api/transactions/<int:tx_id>", methods=["PUT"])
def edit_transaction(tx_id):
    tx = get_transaction(tx_id)
    if not tx:
        return jsonify({"error": "Not found"}), 404

    data = request.json or {}
    allowed_fields = [
        "transaction_date", "transaction_time", "type", "amount", "fee", "vat",
        "total_amount", "category", "subcategory", "payment_source", "sender_name",
        "payee_name", "ref_number", "notes", "is_verified", "audit_status", "audit_note"
    ]
    updates = {k: data[k] for k in allowed_fields if k in data}
    
    # If amount changed, re-calculate total if not provided
    if "amount" in updates and "total_amount" not in updates:
        fee = updates.get("fee", tx.get("fee", 0.0))
        updates["total_amount"] = float(updates["amount"]) + float(fee)

    update_transaction(tx_id, updates)
    return jsonify({"status": "updated", "id": tx_id})

@app.route("/api/transactions/<int:tx_id>", methods=["DELETE"])
def remove_transaction(tx_id):
    delete_transaction(tx_id)
    return jsonify({"status": "deleted", "id": tx_id})

# ----------------------------------------------------
# Analytics & Breakdown API
# ----------------------------------------------------
@app.route("/api/analytics/daily", methods=["GET"])
def daily_analytics():
    month = request.args.get("month")
    data = get_daily_summary(month)
    return jsonify({"daily": data})

@app.route("/api/analytics/monthly", methods=["GET"])
def monthly_analytics():
    data = get_monthly_summary()
    return jsonify({"monthly": data})

@app.route("/api/analytics/categories", methods=["GET"])
def category_analytics():
    start = request.args.get("start_date")
    end = request.args.get("end_date")
    t_type = request.args.get("type", "expense")
    data = get_category_breakdown(start, end, t_type)
    return jsonify({"categories": data})

@app.route("/api/analytics/stats", methods=["GET"])
def general_stats():
    data = get_statistics()
    return jsonify(data)

# ----------------------------------------------------
# Audit & Recheck Endpoints
# ----------------------------------------------------
@app.route("/api/audit/recheck-all", methods=["POST"])
def run_recheck():
    updated = recheck_all_transactions()
    return jsonify({
        "status": "rechecked",
        "updated_transactions": updated,
        "message": f"Audit recheck completed. Updated {updated} transaction audit statuses."
    })

@app.route("/api/audit/verify/<int:tx_id>", methods=["POST"])
def verify_tx(tx_id):
    update_transaction(tx_id, {
        "is_verified": 1,
        "audit_status": "clean",
        "audit_note": "ตรวจสอบและยืนยันโดยผู้ใช้งานแล้ว (Manually Verified)"
    })
    return jsonify({"status": "verified", "id": tx_id})

# ----------------------------------------------------
# Settings Endpoints (Gemini API Key)
# ----------------------------------------------------
@app.route("/api/settings", methods=["GET"])
def fetch_settings():
    api_key = get_setting("api_key", "")
    has_key = bool(api_key or os.environ.get("GEMINI_API_KEY"))
    masked = ""
    if api_key:
        masked = f"{api_key[:6]}...{api_key[-4:]}" if len(api_key) > 10 else "***"
    elif os.environ.get("GEMINI_API_KEY"):
        masked = "Configured via ENV"
    return jsonify({
        "has_api_key": has_key,
        "masked_key": masked
    })

@app.route("/api/settings", methods=["POST"])
def save_settings():
    data = request.json or {}
    key = data.get("api_key", "").strip()
    if key:
        set_setting("api_key", key)
        os.environ["GEMINI_API_KEY"] = key
    return jsonify({"status": "saved", "message": "Settings updated successfully."})



@app.route("/api/clear-all", methods=["POST"])
def clear_all_transactions():
    """Clears all transactions and batches for fresh testing."""
    conn = get_db()
    c = conn.cursor()
    c.execute("DELETE FROM transactions;")
    c.execute("DELETE FROM batches;")
    conn.commit()
    conn.close()
    return jsonify({"status": "cleared", "message": "All transactions cleared."})

# ----------------------------------------------------
# Export Endpoints (Excel & CSV)
# ----------------------------------------------------
@app.route("/api/export/excel", methods=["GET"])
def export_excel():
    filters = {
        "start_date": request.args.get("start_date"),
        "end_date": request.args.get("end_date"),
        "category": request.args.get("category"),
        "type": request.args.get("type"),
        "audit_status": request.args.get("audit_status"),
        "search": request.args.get("search")
    }
    file_path = export_transactions_to_excel(filters)
    return send_file(
        file_path,
        as_attachment=True,
        download_name=Path(file_path).name,
        mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )

@app.route("/api/export/csv", methods=["GET"])
def export_csv():
    filters = {
        "start_date": request.args.get("start_date"),
        "end_date": request.args.get("end_date"),
        "category": request.args.get("category"),
        "type": request.args.get("type"),
        "audit_status": request.args.get("audit_status"),
        "search": request.args.get("search")
    }
    file_path = export_transactions_to_csv(filters)
    return send_file(
        file_path,
        as_attachment=True,
        download_name=Path(file_path).name,
        mimetype="text/csv"
    )

if __name__ == "__main__":
    print(f"🚀 ExpenseAudit Pro starting at http://127.0.0.1:{PORT}")
    app.run(host=HOST, port=PORT, debug=True)
