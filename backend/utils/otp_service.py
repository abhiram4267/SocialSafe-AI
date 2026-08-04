import random
import requests
import time

FAST2SMS_API_KEY = "uF485IkftDpjOKs2S8BtPi3JvQPEVMO00fyBhLAyTPDIha0MP3Ku70fqMTin"

# Store OTP with expiry
otp_store = {}

def generate_otp():
    return str(random.randint(100000, 999999))


def send_otp(phone: str):
    otp = generate_otp()

    url = "https://www.fast2sms.com/dev/bulkV2"

    payload = {
        "route": "q",
        "message": f"Your SocialSafe OTP is {otp}",
        "language": "english",
        "flash": 0,
        "numbers": phone  # 10 digit only
    }

    headers = {
        "authorization": FAST2SMS_API_KEY
    }

    response = requests.post(url, data=payload, headers=headers)

    print("STATUS:", response.status_code)
    print("RESPONSE:", response.text)

    # Store OTP with timestamp (5 min expiry)
    otp_store[phone] = {
        "otp": otp,
        "time": time.time()
    }

    return {"status": "sent"}


def verify_otp(phone: str, otp: str):
    data = otp_store.get(phone)

    if not data:
        return False

    stored_otp = data["otp"]
    created_time = data["time"]

    # ⏱ Expiry check (5 minutes)
    if time.time() - created_time > 300:
        print("OTP expired")
        otp_store.pop(phone, None)
        return False

    print("Stored OTP:", stored_otp)
    print("Entered OTP:", otp)

    if stored_otp == otp:
        otp_store.pop(phone, None)  # remove after success
        return True

    return False