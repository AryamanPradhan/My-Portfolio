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

# Vercel expects the app object, it handles the serving itself.
# We no longer need the __main__ block.
