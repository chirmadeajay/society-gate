import os
from twilio.rest import Client

ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID", "")
AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN", "")
TWILIO_WHATSAPP_NUMBER = os.getenv("TWILIO_WHATSAPP_NUMBER", "whatsapp:+14155238886")
APP_BASE_URL = os.getenv("APP_BASE_URL", "https://society-gate-backend-production.up.railway.app")


def send_approval_request(phone: str, visitor_id: int, visitor_name: str, flat: str):
    print(f"[WhatsApp] Sending to {phone}, visitor={visitor_name}, flat={flat}")
    print(f"[WhatsApp] SID={ACCOUNT_SID[:6]}... TOKEN={AUTH_TOKEN[:6]}...")
    try:
        client = Client(ACCOUNT_SID, AUTH_TOKEN)
        approve_url = f"{APP_BASE_URL}/approve/{visitor_id}"
        reject_url = f"{APP_BASE_URL}/reject/{visitor_id}"
        message_body = (
            f"Visitor at Gate!\n"
            f"Name: {visitor_name}\n"
            f"Flat: {flat}\n"
            f"Approve: {approve_url}\n"
            f"Reject: {reject_url}"
        )
        msg = client.messages.create(
            body=message_body,
            from_=TWILIO_WHATSAPP_NUMBER,
            to=f"whatsapp:{phone}"
        )
        print(f"[WhatsApp] Sent! SID={msg.sid}")
        return True
    except Exception as e:
        print(f"[WhatsApp Error] {e}")
        return False
