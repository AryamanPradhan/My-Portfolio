import os
from datetime import datetime
import gspread
from google.oauth2.service_account import Credentials

SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
]

def get_google_sheet():
    """Authenticate with Google and return the target worksheet."""
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    creds_file = os.getenv("GOOGLE_CREDENTIALS_FILE", "credentials.json")
    if not os.path.isabs(creds_file):
        creds_file = os.path.join(base_dir, creds_file)
    sheet_id = os.getenv("GOOGLE_SHEET_ID", "")
    sheet_name = os.getenv("GOOGLE_SHEET_NAME", "Portfolio Leads")

    import json
    creds_json = os.getenv("GOOGLE_CREDENTIALS_JSON")
    
    if creds_json:
        # Load from environment variable (preferred for production)
        try:
            creds_dict = json.loads(creds_json)
            credentials = Credentials.from_service_account_info(creds_dict, scopes=SCOPES)
        except Exception as e:
            print(f"Error loading credentials from env: {e}")
            credentials = Credentials.from_service_account_file(creds_file, scopes=SCOPES)
    else:
        # Load from local file (for local development)
        credentials = Credentials.from_service_account_file(creds_file, scopes=SCOPES)
        
    client = gspread.authorize(credentials)

    # Prefer opening by ID (only needs Sheets API, not Drive API)
    if sheet_id:
        spreadsheet = client.open_by_key(sheet_id)
    else:
        try:
            spreadsheet = client.open(sheet_name)
        except gspread.SpreadsheetNotFound:
            spreadsheet = client.create(sheet_name)
            spreadsheet.share(None, perm_type="anyone", role="writer")

    # Get or create the first worksheet with headers
    worksheet = spreadsheet.sheet1

    # Ensure headers exist
    existing = worksheet.row_values(1)
    headers = ["Name", "Email", "Phone", "Business", "Goal", "Budget", "Project Detail", "Section", "Timestamp"]
    if not existing:
        worksheet.append_row(headers)

    return worksheet

def append_to_sheet(data: dict):
    """Append a new lead row to the Google Sheet."""
    worksheet = get_google_sheet()

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
