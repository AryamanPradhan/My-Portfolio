"""
Portfolio Contact Form Backend
==============================
Handles form submissions from the portfolio frontend.
Workflow: Form Submit → Google Sheets → Discord Notification
"""

import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from routes import api

# Load environment variables
base_dir = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(base_dir, ".env"))

app = Flask(__name__)

# Guarantee JSON Responses for ALL errors
@app.errorhandler(Exception)
def handle_all_errors(e):
    try:
        from werkzeug.exceptions import HTTPException
        if isinstance(e, HTTPException):
            return jsonify(error=e.description), e.code
    except:
        pass
    return jsonify(error="Internal Server Error", details=str(e)), 500

# Security: CORS Restricted
allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")
CORS(app, origins=allowed_origins)

# Register API routes blueprint
app.register_blueprint(api, url_prefix='/api')

# Vercel expects the app object, it handles the serving itself.
# We no longer need the __main__ block.
