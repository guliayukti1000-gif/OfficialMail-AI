import os
import traceback
import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException

configuration = sib_api_v3_sdk.Configuration()
configuration.api_key['api-key'] = os.getenv("BREVO_API_KEY")

FROM_EMAIL = "officialmailai.hackathon@gmail.com"
FROM_NAME = "OfficialMail AI"


def send_single_email(to_email: str, subject: str, body: str):
    api_instance = sib_api_v3_sdk.TransactionalEmailsApi(
        sib_api_v3_sdk.ApiClient(configuration)
    )
    send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
        to=[{"email": to_email}],
        sender={"name": FROM_NAME, "email": FROM_EMAIL},
        subject=subject,
        text_content=body,
    )
    try:
        api_instance.send_transac_email(send_smtp_email)
    except ApiException as e:
        raise Exception(str(e))


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