"""
Portfolio Contact Form Backend
==============================
Handles form submissions from the portfolio frontend.
Workflow: Form Submit → Google Sheets → Discord Notification
"""

import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

from routes import api, limiter

# Load environment variables
base_dir = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(base_dir, ".env"))

app = Flask(__name__)

# Security: CORS Restricted (using ALLOWED_ORIGINS from .env or fallback to *)
allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")
CORS(app, origins=allowed_origins)

# Initialize Flask-Limiter for rate limiting
limiter.init_app(app)

# Register API routes blueprint
app.register_blueprint(api, url_prefix='/api')

if __name__ == "__main__":
    port = int(os.getenv("FLASK_PORT", 5000))
    # By default, FLASK_DEBUG is False. Set to true in .env for development.
    debug_mode = os.getenv("FLASK_DEBUG", "False").lower() in ("true", "1", "t")
    
    print(f"Backend configured to run on port {port}")
    
    # Security: Use Waitress for production serving instead of Flask's built-in server
    if debug_mode:
        print("Running in DEBUG mode (Flask dev server)...")
        app.run(host="0.0.0.0", port=port, debug=True)
    else:
        print("Running in PRODUCTION mode (Waitress WSGI server)...")
        from waitress import serve
        serve(app, host="0.0.0.0", port=port)
