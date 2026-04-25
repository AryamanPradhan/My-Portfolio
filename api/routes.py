import os
import traceback
from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

from services.sheets import append_to_sheet
from services.discord import send_discord_notification

api = Blueprint('api', __name__)
base_dir = os.path.dirname(os.path.abspath(__file__))

# Security: Rate Limiting based on IP address
limiter = Limiter(key_func=get_remote_address)

@api.route("/contact", methods=["POST"])
@limiter.limit("5 per minute")  # Enforce rate limit on contact form submissions
def handle_contact():
    """Handle incoming contact form submissions."""
    data = request.get_json()

    # Validate required fields
    if not data:
        return jsonify({"error": "No data provided"}), 400

    # Honeypot Check: If the hidden field is filled, it's a bot.
    # We return 200 (Success) so the bot thinks it succeeded, but we don't process it.
    if data.get("honeypot"):
        print("Bot detected via honeypot -- ignoring submission.")
        return jsonify({"success": True, "message": "Message received"}), 200

    required_fields = ["name", "email", "phone"]
    missing = [f for f in required_fields if not data.get(f, "").strip()]

    if missing:
        return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), 400

    # Security: Input Validation (Max lengths) to prevent DoS via payload size
    max_lengths = {
        "name": 100,
        "email": 150,
        "phone": 20,
        "business": 100,
        "goal": 200,
        "budget": 50,
        "message": 1000,
        "section": 50
    }

    for field, max_len in max_lengths.items():
        if len(data.get(field, "")) > max_len:
            return jsonify({"error": f"Field '{field}' exceeds maximum length of {max_len} characters."}), 400

    sheets_ok = False
    discord_ok = False

    # Step 1: Try storing in Google Sheets (non-fatal)
    try:
        append_to_sheet(data)
        print(f"Success: Lead saved to Sheets: {data.get('name')} ({data.get('email')})")
        sheets_ok = True
    except Exception as e:
        error_msg = f"Google Sheets error (non-fatal): {e}\n{traceback.format_exc()}"
        print(error_msg)
        log_path = os.path.join(base_dir, "error_log.txt")
        with open(log_path, "a") as f:
            f.write(f"\n--- {datetime.now()} ---\n{error_msg}")

    # Step 2: Send Discord notification (non-fatal)
    try:
        send_discord_notification(data)
        discord_ok = True
    except Exception as e:
        print(f"Discord error (non-fatal): {e}")

    # Return success if at least one channel worked
    if sheets_ok or discord_ok:
        return jsonify({"success": True, "message": "Thank you! We'll get back to you shortly."}), 200
    else:
        return jsonify({"error": "Something went wrong. Please try again later."}), 500

@api.route("/health", methods=["GET"])
@limiter.exempt  # Health checks don't need rate limiting
def health_check():
    """Simple health check endpoint."""
    return jsonify({"status": "ok", "timestamp": datetime.now().isoformat()})
