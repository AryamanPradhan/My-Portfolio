"""
Portfolio Contact Form Backend (Single-file for Vercel)
=======================================================
All logic consolidated into one file to avoid Vercel import issues.
Workflow: Form Submit → Google Sheets → Discord Notification
"""

import os
import json
import traceback
from datetime import datetime

from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# ── Setup ────────────────────────────────────────────────────────────────────
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))

app = Flask(__name__)

allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")
CORS(app, origins=allowed_origins)


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
        raise ValueError("GOOGLE_CREDENTIALS_JSON env var is not set")

    creds_dict = json.loads(creds_json)
    credentials = Credentials.from_service_account_info(creds_dict, scopes=SCOPES)
    client = gspread.authorize(credentials)

    sheet_id = os.getenv("GOOGLE_SHEET_ID", "")
    sheet_name = os.getenv("GOOGLE_SHEET_NAME", "Portfolio Leads")

    if sheet_id:
        spreadsheet = client.open_by_key(sheet_id)
    else:
        try:
            spreadsheet = client.open(sheet_name)
        except gspread.SpreadsheetNotFound:
            spreadsheet = client.create(sheet_name)
            spreadsheet.share(None, perm_type="anyone", role="writer")

    worksheet = spreadsheet.sheet1

    existing = worksheet.row_values(1)
    headers = ["Name", "Email", "Phone", "Business", "Goal", "Budget",
               "Project Detail", "Section", "Timestamp"]
    if not existing:
        worksheet.append_row(headers)

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
        print("Warning: Discord webhook not configured -- skipping.")
        return

    embed = {
        "title": "🔔 New Lead from Portfolio!",
        "color": 0xFFFFFF,
        "fields": [
            {"name": "👤 Name",     "value": data.get("name", "N/A"),                          "inline": True},
            {"name": "📧 Email",    "value": data.get("email", "N/A"),                         "inline": True},
            {"name": "📱 Phone",    "value": data.get("phone", "N/A"),                         "inline": True},
            {"name": "🏢 Business", "value": data.get("business", "N/A") or "Not specified",   "inline": True},
            {"name": "🎯 Goal",     "value": data.get("goal", "N/A") or "Not specified",       "inline": True},
            {"name": "💰 Budget",   "value": data.get("budget", "N/A") or "Not specified",     "inline": True},
            {"name": "📝 Detail",   "value": data.get("message", "N/A") or "Not specified",    "inline": False},
            {"name": "📄 Section",  "value": data.get("section", "Unknown"),                   "inline": True},
        ],
        "timestamp": datetime.utcnow().isoformat(),
        "footer": {"text": "Aryaman Portfolio • Lead Capture"},
    }

    resp = req.post(webhook_url, json={"username": "Portfolio Bot", "embeds": [embed]})
    resp.raise_for_status()
    print("Success: Discord notification sent.")


# ── Routes ───────────────────────────────────────────────────────────────────
@app.route("/api/contact", methods=["POST"])
def handle_contact():
    """Handle incoming contact form submissions."""
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No data provided"}), 400

        # Honeypot bot detection
        if data.get("honeypot"):
            return jsonify({"success": True, "message": "Message received"}), 200

        # Required fields
        required_fields = ["name", "email", "phone"]
        missing = [f for f in required_fields if not data.get(f, "").strip()]
        if missing:
            return jsonify({"error": f"Missing: {', '.join(missing)}"}), 400

        # Max length validation
        max_lengths = {
            "name": 100, "email": 150, "phone": 20, "business": 100,
            "goal": 200, "budget": 50, "message": 1000, "section": 50
        }
        for field, max_len in max_lengths.items():
            if len(data.get(field, "")) > max_len:
                return jsonify({"error": f"'{field}' too long"}), 400

        sheets_ok = False
        discord_ok = False

        try:
            append_to_sheet(data)
            sheets_ok = True
        except Exception as e:
            print(f"Sheets Error: {e}")

        try:
            send_discord_notification(data)
            discord_ok = True
        except Exception as e:
            print(f"Discord Error: {e}")

        if sheets_ok or discord_ok:
            return jsonify({"success": True, "message": "Thank you! We'll get back to you shortly."}), 200
        else:
            return jsonify({"error": "Backend services failed.", "sheets": str(sheets_ok), "discord": str(discord_ok)}), 500

    except Exception as err:
        return jsonify({"error": "Server error", "details": str(err), "trace": traceback.format_exc()}), 500


@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({"status": "ok", "timestamp": datetime.now().isoformat()})
