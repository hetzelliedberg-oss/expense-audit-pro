import os
import sys
from pathlib import Path
from huggingface_hub import HfApi

def deploy(token=None, space_name="expense-audit-pro"):
    if not token:
        token = os.environ.get("HF_TOKEN")
    if not token and len(sys.argv) > 1:
        token = sys.argv[1].strip()

    if not token:
        print("Error: Missing Hugging Face Token.")
        print("Usage: python deploy_hf.py <YOUR_HF_WRITE_TOKEN>")
        print("Create free token at: https://huggingface.co/settings/tokens (Role: Write)")
        return False

    api = HfApi(token=token)
    try:
        user_info = api.whoami()
        username = user_info.get("name")
        print(f"Logged in as Hugging Face user: {username}")
    except Exception as e:
        print(f"Authentication failed: {e}")
        return False

    repo_id = f"{username}/{space_name}"
    print(f"Creating/Checking Space: {repo_id} (Docker SDK)...")
    try:
        api.create_repo(
            repo_id=repo_id,
            repo_type="space",
            space_sdk="docker",
            exist_ok=True,
            private=False
        )
        print(f"Space ready at: https://huggingface.co/spaces/{repo_id}")
    except Exception as e:
        print(f"Note on create_repo: {e}")

    print("Uploading project files to Hugging Face Cloud...")
    current_dir = Path(__file__).resolve().parent
    try:
        api.upload_folder(
            folder_path=str(current_dir),
            repo_id=repo_id,
            repo_type="space",
            ignore_patterns=[
                ".git", ".git/**", "__pycache__", "__pycache__/**",
                "uploads/*", "exports/*", "*.pyc", "temp/*", ".env", ".vscode/**"
            ]
        )
        direct_url = f"https://{username.lower()}-{space_name.lower().replace('_', '-')}.hf.space"
        space_url = f"https://huggingface.co/spaces/{repo_id}"
        print("\n" + "="*60)
        print("SUCCESS! Deployed to Hugging Face Cloud successfully!")
        print(f"Space URL: {space_url}")
        print(f"Direct Web App URL: {direct_url}")
        print("You can access this URL anytime from mobile/PC even when local PC is shut down.")
        print("="*60 + "\n")
        return True
    except Exception as e:
        print(f"Upload failed: {e}")
        return False

if __name__ == "__main__":
    deploy()
