import os
import requests
from datetime import datetime

def send_discord_notification(data: dict):
    """Send a rich embed to a Discord webhook."""
    webhook_url = os.getenv("DISCORD_WEBHOOK_URL")
    if not webhook_url or "YOUR_WEBHOOK" in webhook_url:
        print("Warning: Discord webhook not configured -- skipping notification.")
        return

    embed = {
        "title": "🔔 New Lead from Portfolio!",
        "color": 0xFFFFFF,  # White accent to match site aesthetic
        "fields": [
            {"name": "👤 Name", "value": data.get("name", "N/A"), "inline": True},
            {"name": "📧 Email", "value": data.get("email", "N/A"), "inline": True},
            {"name": "📱 Phone", "value": data.get("phone", "N/A"), "inline": True},
            {"name": "🏢 Business", "value": data.get("business", "N/A") or "Not specified", "inline": True},
            {"name": "🎯 Goal", "value": data.get("goal", "N/A") or "Not specified", "inline": True},
            {"name": "💰 Budget", "value": data.get("budget", "N/A") or "Not specified", "inline": True},
            {"name": "📝 Project Detail", "value": data.get("message", "N/A") or "Not specified", "inline": False},
            {"name": "📄 Section", "value": data.get("section", "Unknown"), "inline": True},
        ],
        "timestamp": datetime.utcnow().isoformat(),
        "footer": {"text": "Aryaman Portfolio • Lead Capture"},
    }

    payload = {
        "username": "Portfolio Bot",
        "embeds": [embed],
    }

    try:
        response = requests.post(webhook_url, json=payload)
        response.raise_for_status()
        print("Success: Discord notification sent.")
    except requests.exceptions.RequestException as e:
        print(f"Error: Discord notification failed: {e}")
