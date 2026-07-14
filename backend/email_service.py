import smtplib
import os
import traceback
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

GMAIL_ADDRESS = (os.getenv("GMAIL_ADDRESS") or "").strip()
GMAIL_APP_PASSWORD = (os.getenv("GMAIL_APP_PASSWORD") or "").strip().replace(" ", "")


def send_single_email(to_email: str, subject: str, body: str):
    msg = MIMEMultipart()
    msg["From"] = GMAIL_ADDRESS
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    server = smtplib.SMTP_SSL("smtp.gmail.com", 465)
    try:
        server.login(GMAIL_ADDRESS, GMAIL_APP_PASSWORD)
        server.sendmail(GMAIL_ADDRESS, to_email, msg.as_string())
    finally:
        server.quit()


def send_bulk_emails(emails: list):
    """
    emails = [{ "to": "...", "subject": "...", "body": "..." }, ...]
    """
    results = []
    for item in emails:
        try:
            send_single_email(item["to"], item["subject"], item["body"])
            results.append({"success": True, "to": item["to"]})
        except Exception as e:
            print(f"SEND ERROR for {item['to']}: {type(e).__name__}: {e}")
            traceback.print_exc()
            results.append({"success": False, "to": item["to"], "error": str(e)})
    return results