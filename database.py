import sqlite3
import json
import hashlib
from datetime import datetime
from pathlib import Path
from config import DATABASE_PATH

def get_db():
    conn = sqlite3.connect(DATABASE_PATH, timeout=30.0)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA synchronous=NORMAL;")
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    cursor.executescript("""
    CREATE TABLE IF NOT EXISTS batches (
        id TEXT PRIMARY KEY,
        name TEXT,
        total_files INTEGER DEFAULT 0,
        processed_files INTEGER DEFAULT 0,
        failed_files INTEGER DEFAULT 0,
        status TEXT DEFAULT 'pending',
        created_at TEXT,
        completed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        batch_id TEXT,
        file_name TEXT,
        file_path TEXT,
        file_hash TEXT,
        doc_type TEXT DEFAULT 'bank_slip',
        transaction_date TEXT,
        transaction_time TEXT,
        transaction_datetime TEXT,
        type TEXT DEFAULT 'expense',
        amount REAL DEFAULT 0.0,
        fee REAL DEFAULT 0.0,
        vat REAL DEFAULT 0.0,
        total_amount REAL DEFAULT 0.0,
        category TEXT DEFAULT 'ทั่วไป',
        subcategory TEXT DEFAULT '',
        payment_source TEXT DEFAULT '',
        sender_name TEXT DEFAULT '',
        sender_account TEXT DEFAULT '',
        payee_name TEXT DEFAULT '',
        payee_account TEXT DEFAULT '',
        ref_number TEXT DEFAULT '',
        items_json TEXT DEFAULT '[]',
        confidence_score REAL DEFAULT 1.0,
        notes TEXT DEFAULT '',
        audit_status TEXT DEFAULT 'clean',
        audit_note TEXT DEFAULT '',
        duplicate_of_id INTEGER,
        is_verified INTEGER DEFAULT 0,
        raw_ai_response TEXT,
        created_at TEXT,
        updated_at TEXT,
        FOREIGN KEY (batch_id) REFERENCES batches (id)
    );

    CREATE INDEX IF NOT EXISTS idx_trans_date ON transactions (transaction_date);
    CREATE INDEX IF NOT EXISTS idx_trans_month ON transactions (substr(transaction_date, 1, 7));
    CREATE INDEX IF NOT EXISTS idx_trans_ref ON transactions (ref_number);
    CREATE INDEX IF NOT EXISTS idx_trans_hash ON transactions (file_hash);
    CREATE INDEX IF NOT EXISTS idx_trans_audit ON transactions (audit_status);

    CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT,
        updated_at TEXT
    );
    """)

    # Default categories if needed
    cursor.execute("SELECT value FROM settings WHERE key = 'api_key'")
    if not cursor.fetchone():
        cursor.execute("INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES ('api_key', '', ?)",
                       (datetime.now().isoformat(),))

    conn.commit()
    conn.close()

def compute_file_hash(file_path):
    sha = hashlib.sha256()
    with open(file_path, "rb") as f:
        while chunk := f.read(65536):
            sha.update(chunk)
    return sha.hexdigest()

def get_setting(key, default=""):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT value FROM settings WHERE key = ?", (key,))
    row = cursor.fetchone()
    conn.close()
    return row["value"] if row else default

def set_setting(key, value):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, ?)",
                   (key, str(value), datetime.now().isoformat()))
    conn.commit()
    conn.close()

def create_batch(batch_id, name, total_files):
    conn = get_db()
    cursor = conn.cursor()
    now = datetime.now().isoformat()
    cursor.execute("""
        INSERT INTO batches (id, name, total_files, processed_files, failed_files, status, created_at)
        VALUES (?, ?, ?, 0, 0, 'processing', ?)
    """, (batch_id, name, total_files, now))
    conn.commit()
    conn.close()

def update_batch_progress(batch_id, processed_increment=0, failed_increment=0, status=None):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE batches
        SET processed_files = processed_files + ?,
            failed_files = failed_files + ?,
            status = COALESCE(?, status),
            completed_at = CASE WHEN ? IN ('completed', 'failed') THEN ? ELSE completed_at END
        WHERE id = ?
    """, (processed_increment, failed_increment, status, status, datetime.now().isoformat(), batch_id))
    conn.commit()
    conn.close()

def get_batch(batch_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM batches WHERE id = ?", (batch_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def insert_transaction(data):
    conn = get_db()
    cursor = conn.cursor()
    now = datetime.now().isoformat()
    
    total = float(data.get("amount", 0.0)) + float(data.get("fee", 0.0))
    if "total_amount" in data and float(data["total_amount"]) > 0:
        total = float(data["total_amount"])

    cursor.execute("""
        INSERT INTO transactions (
            batch_id, file_name, file_path, file_hash, doc_type,
            transaction_date, transaction_time, transaction_datetime, type,
            amount, fee, vat, total_amount, category, subcategory,
            payment_source, sender_name, sender_account, payee_name, payee_account,
            ref_number, items_json, confidence_score, notes,
            audit_status, audit_note, duplicate_of_id, is_verified, raw_ai_response,
            created_at, updated_at
        ) VALUES (
            ?, ?, ?, ?, ?,
            ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?,
            ?, ?, ?, ?,
            ?, ?, ?, ?, ?,
            ?, ?
        )
    """, (
        data.get("batch_id"),
        data.get("file_name", ""),
        data.get("file_path", ""),
        data.get("file_hash", ""),
        data.get("doc_type", "bank_slip"),
        data.get("transaction_date", ""),
        data.get("transaction_time", ""),
        data.get("transaction_datetime", ""),
        data.get("type", "expense"),
        float(data.get("amount", 0.0)),
        float(data.get("fee", 0.0)),
        float(data.get("vat", 0.0)),
        total,
        data.get("category", "ทั่วไป"),
        data.get("subcategory", ""),
        data.get("payment_source", ""),
        data.get("sender_name", ""),
        data.get("sender_account", ""),
        data.get("payee_name", ""),
        data.get("payee_account", ""),
        data.get("ref_number", "").strip(),
        json.dumps(data.get("items", []), ensure_ascii=False) if isinstance(data.get("items"), list) else str(data.get("items_json", "[]")),
        float(data.get("confidence_score", 1.0)),
        data.get("notes", ""),
        data.get("audit_status", "clean"),
        data.get("audit_note", ""),
        data.get("duplicate_of_id"),
        int(data.get("is_verified", 0)),
        data.get("raw_ai_response", ""),
        now, now
    ))
    trans_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return trans_id

def update_transaction(trans_id, update_dict):
    conn = get_db()
    cursor = conn.cursor()
    fields = []
    values = []
    for k, v in update_dict.items():
        fields.append(f"{k} = ?")
        values.append(v)
    fields.append("updated_at = ?")
    values.append(datetime.now().isoformat())
    values.append(trans_id)

    query = f"UPDATE transactions SET {', '.join(fields)} WHERE id = ?"
    cursor.execute(query, values)
    conn.commit()
    conn.close()

def get_transaction(trans_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM transactions WHERE id = ?", (trans_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def delete_transaction(trans_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM transactions WHERE id = ?", (trans_id,))
    conn.commit()
    conn.close()

def get_transactions_filtered(filters=None):
    filters = filters or {}
    conn = get_db()
    cursor = conn.cursor()

    query = "SELECT * FROM transactions WHERE 1=1"
    params = []

    if filters.get("start_date"):
        query += " AND transaction_date >= ?"
        params.append(filters["start_date"])

    if filters.get("end_date"):
        query += " AND transaction_date <= ?"
        params.append(filters["end_date"])

    if filters.get("category"):
        query += " AND category = ?"
        params.append(filters["category"])

    if filters.get("type"):
        query += " AND type = ?"
        params.append(filters["type"])

    if filters.get("payment_source"):
        query += " AND payment_source = ?"
        params.append(filters["payment_source"])

    if filters.get("audit_status"):
        if filters["audit_status"] == "warning":
            query += " AND audit_status != 'clean'"
        else:
            query += " AND audit_status = ?"
            params.append(filters["audit_status"])

    if filters.get("search"):
        s = f"%{filters['search']}%"
        query += " AND (payee_name LIKE ? OR sender_name LIKE ? OR notes LIKE ? OR ref_number LIKE ? OR subcategory LIKE ?)"
        params.extend([s, s, s, s, s])

    query += " ORDER BY transaction_date DESC, transaction_time DESC, id DESC"

    if filters.get("limit"):
        query += " LIMIT ?"
        params.append(int(filters["limit"]))

    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_daily_summary(month=None):
    conn = get_db()
    cursor = conn.cursor()
    
    query = """
        SELECT 
            transaction_date,
            COUNT(*) as count,
            SUM(CASE WHEN type = 'expense' THEN total_amount ELSE 0 END) as total_expense,
            SUM(CASE WHEN type = 'income' THEN total_amount ELSE 0 END) as total_income,
            SUM(CASE WHEN audit_status != 'clean' THEN 1 ELSE 0 END) as warning_count
        FROM transactions
        WHERE transaction_date IS NOT NULL AND transaction_date != ''
    """
    params = []
    if month:
        query += " AND substr(transaction_date, 1, 7) = ?"
        params.append(month)
        
    query += """
        GROUP BY transaction_date
        ORDER BY transaction_date DESC
    """
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_monthly_summary():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT 
            substr(transaction_date, 1, 7) as month,
            COUNT(*) as count,
            SUM(CASE WHEN type = 'expense' THEN total_amount ELSE 0 END) as total_expense,
            SUM(CASE WHEN type = 'income' THEN total_amount ELSE 0 END) as total_income,
            SUM(CASE WHEN audit_status != 'clean' THEN 1 ELSE 0 END) as warning_count
        FROM transactions
        WHERE transaction_date IS NOT NULL AND transaction_date != '' AND length(transaction_date) >= 7
        GROUP BY substr(transaction_date, 1, 7)
        ORDER BY month DESC
    """)
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_category_breakdown(start_date=None, end_date=None, trans_type='expense'):
    conn = get_db()
    cursor = conn.cursor()
    query = """
        SELECT 
            category,
            COUNT(*) as count,
            SUM(total_amount) as total
        FROM transactions
        WHERE type = ? AND transaction_date IS NOT NULL AND transaction_date != ''
    """
    params = [trans_type]
    if start_date:
        query += " AND transaction_date >= ?"
        params.append(start_date)
    if end_date:
        query += " AND transaction_date <= ?"
        params.append(end_date)
        
    query += """
        GROUP BY category
        ORDER BY total DESC
    """
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_statistics():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT 
            COUNT(*) as total_count,
            SUM(CASE WHEN type = 'expense' THEN total_amount ELSE 0 END) as total_expense,
            SUM(CASE WHEN type = 'income' THEN total_amount ELSE 0 END) as total_income,
            SUM(CASE WHEN audit_status != 'clean' THEN 1 ELSE 0 END) as total_flagged,
            SUM(is_verified) as total_verified
        FROM transactions
    """)
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else {
        "total_count": 0, "total_expense": 0.0, "total_income": 0.0,
        "total_flagged": 0, "total_verified": 0
    }
