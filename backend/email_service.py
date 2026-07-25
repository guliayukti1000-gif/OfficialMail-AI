import os
import traceback
import resend

resend.api_key = os.getenv("RESEND_API_KEY")

FROM_EMAIL = "OfficialMail AI <onboarding@resend.dev>"


def send_single_email(to_email: str, subject: str, body: str):
    resend.Emails.send({
        "from": FROM_EMAIL,
        "to": [to_email],
        "subject": subject,
        "text": body,
    })


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
