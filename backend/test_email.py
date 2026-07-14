import smtplib
import os
from dotenv import load_dotenv

load_dotenv()

GMAIL_ADDRESS = os.getenv("GMAIL_ADDRESS").strip()
GMAIL_APP_PASSWORD = os.getenv("GMAIL_APP_PASSWORD").strip().replace(" ", "")

print(f"Using address: {GMAIL_ADDRESS}")
print(f"Password length: {len(GMAIL_APP_PASSWORD)}")

server = smtplib.SMTP_SSL("smtp.gmail.com", 465)
server.set_debuglevel(1)
server.login(GMAIL_ADDRESS, GMAIL_APP_PASSWORD)
print("LOGIN SUCCESSFUL")
server.quit()