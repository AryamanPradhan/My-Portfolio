import os
import traceback
from datetime import datetime
from flask import Blueprint, request, jsonify
from flask import Blueprint, request, jsonify



api = Blueprint('api', __name__)
base_dir = os.path.dirname(os.path.abspath(__file__))

@api.route("/contact", methods=["POST"])
def handle_contact():
    """Handle incoming contact form submissions."""
    from services.sheets import append_to_sheet
    from services.discord import send_discord_notification
    try:
        data = request.get_json()

        # Validate required fields
        if not data:
            return jsonify({"error": "No data provided"}), 400

        # Honeypot Check: If the hidden field is filled, it's a bot.
        if data.get("honeypot"):
            print("Bot detected via honeypot -- ignoring submission.")
            return jsonify({"success": True, "message": "Message received"}), 200

        required_fields = ["name", "email", "phone"]
        missing = [f for f in required_fields if not data.get(f, "").strip()]

        if missing:
            return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), 400

        # Security: Input Validation (Max lengths)
        max_lengths = {
            "name": 100, "email": 150, "phone": 20, "business": 100,
            "goal": 200, "budget": 50, "message": 1000, "section": 50
        }

        for field, max_len in max_lengths.items():
            if len(data.get(field, "")) > max_len:
                return jsonify({"error": f"Field '{field}' exceeds limit."}), 400

        sheets_ok = False
        discord_ok = False

        # Step 1: Try storing in Google Sheets
        try:
            append_to_sheet(data)
            sheets_ok = True
        except Exception as e:
            print(f"Sheets Error: {e}")

        # Step 2: Send Discord notification
        try:
            send_discord_notification(data)
            discord_ok = True
        except Exception as e:
            print(f"Discord Error: {e}")

        if sheets_ok or discord_ok:
            return jsonify({"success": True, "message": "Sent!"}), 200
        else:
            return jsonify({"error": "Backend services failed (Sheets/Discord)."}), 500
            
    except Exception as global_err:
        # This catches "invisible" crashes (Imports, JSON errors, etc.)
        return jsonify({
            "error": "Critical Backend Crash",
            "details": str(global_err),
            "trace": traceback.format_exc()
        }), 500

@api.route("/health", methods=["GET"])
@limiter.exempt  # Health checks don't need rate limiting
def health_check():
    """Simple health check endpoint."""
    return jsonify({"status": "ok", "timestamp": datetime.now().isoformat()})
