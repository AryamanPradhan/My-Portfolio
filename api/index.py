"""
Portfolio Contact Form Backend (Single-file for Vercel)
=======================================================
Consolidated logic with enhanced error handling and Vercel compatibility.
"""

import os
import json
import traceback
from datetime import datetime

from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# ── Setup ────────────────────────────────────────────────────────────────────
# Load .env if it exists (mostly for local development)
base_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(base_dir, ".env")
if os.path.exists(env_path):
    load_dotenv(env_path)

app = Flask(__name__)

# Security: CORS
allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")
CORS(app, origins=allowed_origins)

# ── Global Error Handler ─────────────────────────────────────────────────────
@app.errorhandler(Exception)
def handle_all_errors(e):
    from werkzeug.exceptions import HTTPException
    code = 500
    if isinstance(e, HTTPException):
        code = e.code
    
    return jsonify({
        "error": "Internal Server Error",
        "message": str(e),
        "trace": traceback.format_exc() if os.getenv("FLASK_ENV") == "development" else None
    }), code

# ── Google Sheets ────────────────────────────────────────────────────────────
SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
]

def append_to_sheet(data: dict):
    """Append a new lead row to the Google Sheet."""
    import gspread
    from google.oauth2.service_account import Credentials

    creds_json = os.getenv("GOOGLE_CREDENTIALS_JSON")
    if not creds_json:
        raise ValueError("GOOGLE_CREDENTIALS_JSON environment variable is not set.")

    try:
        creds_dict = json.loads(creds_json)
        credentials = Credentials.from_service_account_info(creds_dict, scopes=SCOPES)
        client = gspread.authorize(credentials)
    except Exception as e:
        raise ValueError(f"Failed to authenticate with Google: {e}")

    sheet_id = os.getenv("GOOGLE_SHEET_ID", "")
    sheet_name = os.getenv("GOOGLE_SHEET_NAME", "Portfolio Leads")

    try:
        if sheet_id:
            spreadsheet = client.open_by_key(sheet_id)
        else:
            spreadsheet = client.open(sheet_name)
    except Exception as e:
        # Fallback: try creating if not found
        try:
            spreadsheet = client.create(sheet_name)
            spreadsheet.share(None, perm_type="anyone", role="writer")
        except Exception as create_err:
            raise ValueError(f"Could not open or create spreadsheet: {e} | {create_err}")

    worksheet = spreadsheet.sheet1
    
    # Ensure headers
    try:
        existing = worksheet.row_values(1)
        if not existing:
            headers = ["Name", "Email", "Phone", "Business", "Goal", "Budget", "Project Detail", "Section", "Timestamp"]
            worksheet.append_row(headers)
    except:
        pass

    row = [
        data.get("name", ""),
        data.get("email", ""),
        data.get("phone", ""),
        data.get("business", ""),
        data.get("goal", ""),
        data.get("budget", ""),
        data.get("message", ""),
        data.get("section", "Unknown"),
        datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    ]

    worksheet.append_row(
        row,
        value_input_option="USER_ENTERED",
        insert_data_option="INSERT_ROWS",
        table_range="A1"
    )

# ── Discord ──────────────────────────────────────────────────────────────────
def send_discord_notification(data: dict):
    """Send a rich embed to a Discord webhook."""
    import requests as req

    webhook_url = os.getenv("DISCORD_WEBHOOK_URL")
    if not webhook_url or "YOUR_WEBHOOK" in webhook_url:
        return

    embed = {
        "title": "🔔 New Lead from Portfolio!",
        "color": 0xFFFFFF,
        "fields": [
            {"name": "👤 Name", "value": data.get("name", "N/A"), "inline": True},
            {"name": "📧 Email", "value": data.get("email", "N/A"), "inline": True},
            {"name": "📱 Phone", "value": data.get("phone", "N/A"), "inline": True},
            {"name": "📄 Section", "value": data.get("section", "Unknown"), "inline": True},
            {"name": "📝 Detail", "value": data.get("message", "N/A") or "No details", "inline": False},
        ],
        "timestamp": datetime.utcnow().isoformat(),
    }

    try:
        req.post(webhook_url, json={"username": "Portfolio Bot", "embeds": [embed]}, timeout=10)
    except Exception as e:
        print(f"Discord error: {e}")

# ── Routes ───────────────────────────────────────────────────────────────────
@app.route("/api/contact", methods=["POST"])
def handle_contact():
    """Main contact form endpoint."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        # Honeypot
        if data.get("honeypot"):
            return jsonify({"success": True, "message": "Message received"}), 200

        # Basic Validation
        if not data.get("name") or not data.get("email"):
            return jsonify({"error": "Name and Email are required"}), 400

        sheets_ok = False
        discord_ok = False

        # Sheets
        try:
            append_to_sheet(data)
            sheets_ok = True
        except Exception as e:
            print(f"Sheets Error: {e}")

        # Discord
        try:
            send_discord_notification(data)
            discord_ok = True
        except Exception as e:
            print(f"Discord Error: {e}")

        if sheets_ok or discord_ok:
            return jsonify({"success": True, "message": "Success"}), 200
        else:
            return jsonify({"error": "Internal services failed"}), 500

    except Exception as e:
        return jsonify({"error": "Server error", "details": str(e)}), 500

@app.route("/api/health")
def health():
    return jsonify({"status": "healthy", "time": datetime.now().isoformat()})

# Vercel entry point
app = app
