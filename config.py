import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
UPLOAD_FOLDER = BASE_DIR / "uploads"
EXPORTS_FOLDER = BASE_DIR / "exports"
DATA_FOLDER = BASE_DIR / "data"

UPLOAD_FOLDER.mkdir(exist_ok=True, parents=True)
EXPORTS_FOLDER.mkdir(exist_ok=True, parents=True)
DATA_FOLDER.mkdir(exist_ok=True, parents=True)

DATABASE_PATH = str(DATA_FOLDER / "expense_audit.db")

# Load environment variable if exists
ENV_PATH = BASE_DIR / ".env"
if ENV_PATH.exists():
    try:
        with open(ENV_PATH, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    os.environ.setdefault(k.strip(), v.strip())
    except Exception:
        pass

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
PORT = int(os.environ.get("PORT", 5000))
HOST = os.environ.get("HOST", "0.0.0.0")

# Batch upload settings
MAX_WORKER_THREADS = 5
ALLOWED_EXTENSIONS = {
    "png", "jpg", "jpeg", "webp", "gif", "bmp", "tiff", "tif",
    "pdf", "heic", "heif", "jfif", "avif", "raw", "dng"
}
MAX_CONTENT_LENGTH = 1024 * 1024 * 1024  # 1 GB max per batch request
