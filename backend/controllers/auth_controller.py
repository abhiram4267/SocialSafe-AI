# from database import users_collection

# class AuthController:
#     @staticmethod
#     async def signup_user(user_data: dict):
#         # Check if email or username already exists
#         existing_user = await users_collection.find_one({
#             "$or": [
#                 {"email": user_data['email']},
#                 {"username": user_data['username']}
#             ]
#         })
        
#         if existing_user:
#             return {"error": "Email or Username already registered"}

#         # Remove confirm_password before saving
#         if 'confirm_password' in user_data:
#             del user_data['confirm_password']

#         # Save to MongoDB as plain text
#         result = await users_collection.insert_one(user_data)
#         return {"message": "User registered successfully", "id": str(result.inserted_id)}

#     @staticmethod
#     async def login_user(identifier, password):
#         # Find user by email OR username OR phone
#         user = await users_collection.find_one({
#             "$or": [
#                 {"email": identifier},
#                 {"username": identifier},
#                 {"phone": identifier}
#             ]
#         })
        
#         if not user:
#             return {"error": "User not found", "status": 200}

#         # Plain text password comparison
#         if user["password"] != password:
#             return {"error": "Invalid Password", "status": 201}

#         user["_id"] = str(user["_id"])
#         return {"message": "Login successful", "status": 202, "user": user}










# import re
# from datetime import datetime
# from database import users_collection

# class AuthController:
#     @staticmethod
#     async def signup_user(user_data: dict):
#         # 1. Server-side Phone Validation (10 digits)
#         if not re.match(r"^\d{10}$", user_data.get("phone", "")):
#             return {"error": "Invalid phone number. Must be 10 digits."}

#         # 2. Server-side Password Validation
#         password = user_data.get("password", "")
#         if not re.match(r"^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$", password):
#             return {"error": "Password does not meet security requirements."}

#         # 3. Check for existing user
#         existing_user = await users_collection.find_one({
#             "$or": [
#                 {"email": user_data.get('email')},
#                 {"username": user_data.get('username')},
#                 {"phone": user_data.get('phone')} # 👈 Good to check phone too
#             ]
#         })
        
#         if existing_user:
#             return {"error": "Email, Username, or Phone already registered"}

#         # 4. Prepare data for saving
#         if 'confirm_password' in user_data:
#             del user_data['confirm_password']

#         user_data["created_at"] = datetime.utcnow()
#         user_data["last_seen"] = datetime.utcnow()
#         user_data["is_online"] = True
#         user_data["profile_image"] = ""
#         user_data["blocked_users"] = []
#         user_data["surveillance_off_users"] = []
#         user_data["bio"] = "Hey there! I am using SocialSafe AI."

#         # 5. Save to MongoDB
#         result = await users_collection.insert_one(user_data)
#         return {
#             "message": "User registered successfully", 
#             "id": str(result.inserted_id),
#             "username": user_data["username"]
#         }



#     @staticmethod
#     async def login_user(login_data: dict):
#         # Frontend sends 'Email' and 'Password' (uppercase from your form state)
#         identifier = login_data.get("Email")
#         password = login_data.get("Password")

#         # 1. Find user by email or username
#         user = await users_collection.find_one({
#             "$or": [{"email": identifier}, {"username": identifier}]
#         })

#         if not user:
#             return {"status": 200, "data": {"message": "User not found"}}
        
#         # 2. Check password
#         if user["password"] != password:
#             return {"status": 201, "data": {"message": "Incorrect password"}}

#         # 3. SUCCESS - Return required fields for AsyncStorage
#         user_result = {
#             "id": str(user["_id"]),
#             "username": user["username"],
#             "actual_name": user.get("actual_name", ""),
#             "email": user["email"],
#             "password": user["password"] # To allow auto-login API calls
#         }

#         return {
#             "status": 202,
#             "data": {
#                 "message": "Login successful",
#                 "result": user_result
#             }
#         }





# import random
# import smtplib
# import os
# from email.mime.text import MIMEText
# from datetime import datetime, timedelta
# from database import users_collection
# from bson import ObjectId

# # Temporary storage for OTPs
# # In production, use Redis. For this project, a dictionary is fine.
# otp_storage = {}

# class AuthController:
#     @staticmethod
#     def generate_otp():
#         return str(random.randint(100000, 999999))
    

#     @staticmethod
#     async def is_username_taken(username: str):
#         user = await users_collection.find_one({"username": username})
#         return user is not None

#     @staticmethod
#     def send_email_otp(receiver_email, otp):
#         # 🚨 IMPORTANT: Use your Gmail and the 16-character "App Password"
#         sender_email = "vajjalaabhiram88@gmail.com" 
#         app_password = "pufz uzjt dikd stdf" 

#         subject = "SocialSafe-AI Verification Code"
#         body = f"Your verification code is: {otp}\n\nThis code will expire in 5 minutes."
        
#         msg = MIMEText(body)
#         msg['Subject'] = subject
#         msg['From'] = sender_email
#         msg['To'] = receiver_email

#         try:
#             with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
#                 server.login(sender_email, app_password)
#                 server.sendmail(sender_email, receiver_email, msg.as_string())
#             return True
#         except Exception as e:
#             print(f"❌ SMTP Error: {e}")
#             return False

#     @staticmethod
#     async def request_otp(email: str):
#         """Generates and sends an OTP to the provided email."""
#         otp = AuthController.generate_otp()
        
#         # Store OTP with a 5-minute expiration
#         otp_storage[email] = {
#             "otp": otp,
#             "expires": datetime.now() + timedelta(minutes=5)
#         }
        
#         print(f"🔹 Generated OTP for {email}: {otp}")
        
#         # Send the email
#         success = AuthController.send_email_otp(email, otp)
#         return success

#     @staticmethod
#     def verify_otp(email: str, user_otp: str):
#         """Checks if the OTP is valid and not expired."""
#         if email in otp_storage:
#             stored_data = otp_storage[email]
#             if datetime.now() < stored_data["expires"]:
#                 if stored_data["otp"] == user_otp:
#                     del otp_storage[email] # Delete after successful verify
#                     return True
#         return False

#     @staticmethod
#     async def signup_user(user_data: dict):
#         """Final step: Saves the user to MongoDB."""
#         # Check if user already exists
#         existing = await users_collection.find_one({"email": user_data['email']})
#         if existing:
#             return {"error": "Email already registered"}
        
#         # Remove confirm_password
#         if 'confirm_password' in user_data:
#             del user_data['confirm_password']
            
#         result = await users_collection.insert_one(user_data)
#         user_data["id"] = str(result.inserted_id)
#         return user_data

#     @staticmethod
#     async def login_user(data: dict):
#         """Handles login logic."""
#         identifier = data.get("Email")
#         password = data.get("Password")
        
#         user = await users_collection.find_one({
#             "$or": [{"email": identifier}, {"username": identifier}]
#         })
        
#         if not user:
#             return {"status": 200, "error": "User not found"}
        
#         if user["password"] != password:
#             return {"status": 201, "error": "Invalid Password"}
            
#         user["id"] = str(user["_id"])
#         del user["_id"]
#         return {"status": 202, "result": user}
    
    
import random
import smtplib
import os
import requests # Necessary if you use a real SMS API later
from email.mime.text import MIMEText
from datetime import datetime, timedelta
from database import users_collection, blocked_users_collection
from fastapi import HTTPException
from bson import ObjectId
import pytz


IST = pytz.timezone('Asia/Kolkata')

# Temporary storage for OTPs
otp_storage = {}

class AuthController:
    @staticmethod
    def generate_otp():
        return str(random.randint(100000, 999999))

    @staticmethod
    async def is_username_taken(username: str):
        user = await users_collection.find_one({"username": username})
        return user is not None

    # --- EMAIL SENDER ---
    @staticmethod
    def send_email_otp(receiver_email, otp):
        # 🚨 CONFIGURATION
        sender_email = "vajjalaabhiram88@gmail.com" 
        # Ensure there are NO SPACES in this 16-character string
        # app_password = "wjtv rxhp zclm kfqp".replace(" ", "")
        app_password = "wyiukhhralbaxchq"
        # app_password = "codr weru dznh wsgt" # Alternate App Password

        msg = MIMEText(f"Your SocialSafe-AI Verification code is: {otp}")
        msg['Subject'] = 'Account Verification'
        msg['From'] = sender_email
        msg['To'] = receiver_email

        try:
            # --- Switch to Port 587 (More stable for development) ---
            server = smtplib.SMTP('smtp.gmail.com', 587)
            server.starttls() # Secure the connection
            server.login(sender_email, app_password)
            server.sendmail(sender_email, receiver_email, msg.as_string())
            server.quit()
            print(f"✅ Email successfully sent to {receiver_email}")
            return True
        except Exception as e:
            print(f"❌ SMTP Error: {e}")
            return False

    # @staticmethod
    # async def request_otp(identifier: str):
    #     """Generates OTP and attempts to send, but returns True to allow testing."""
    #     otp = AuthController.generate_otp()
    #     otp_storage[identifier] = {
    #         "otp": otp,
    #         "expires": datetime.now() + timedelta(minutes=5)
    #     }
        
    #     print(f"\n🔑 [SERVER LOG] OTP FOR {identifier}: {otp} 🔑\n")
        
    #     if "@" in identifier:
    #         # We call the email function
    #         success = AuthController.send_email_otp(identifier, otp)
    #         # 🚨 DEVELOPMENT BYPASS: Always return True so the frontend doesn't crash
    #         # You can see the code in your terminal anyway.
    #         return True 
    #     else:
    #         return AuthController.send_sms_otp(identifier, otp)


    @staticmethod
    async def request_otp(identifier: str):
        # 1. Check if the user is in the BLOCKED collection
        is_blocked = await blocked_users_collection.find_one({
            "$or": [{"email": identifier}, {"phone": identifier}, {"username": identifier}]
        })
        if is_blocked:
            # We raise a specific message for blocked users
            raise HTTPException(status_code=403, detail="This account can't be used again due to harassment.")

        # 2. Check if the user already exists in the ACTIVE collection
        is_existing = await users_collection.find_one({
            "$or": [{"email": identifier}, {"phone": identifier}]
        })
        if is_existing:
            raise HTTPException(status_code=409, detail="This account is already registered. Please Login.")

        # 3. If neither, proceed with OTP generation
        otp = AuthController.generate_otp()
        otp_storage[identifier] = {
            "otp": otp,
            "expires": datetime.now() + timedelta(minutes=5)
        }
        
        print(f"\n🔑 [SERVER LOG] OTP FOR {identifier}: {otp} 🔑\n")
        
        if "@" in identifier:
            return AuthController.send_email_otp(identifier, otp)
        else:
            return AuthController.send_sms_otp(identifier, otp)
        
    @staticmethod
    def verify_otp(identifier: str, otp: str):
        data = otp_storage.get(identifier)

        if not data:
            return False

        stored_otp = data["otp"]
        expiry = data["expires"]

        print("Stored OTP:", stored_otp)
        print("Entered OTP:", otp)

        # ⏱ Check expiry
        if datetime.now() > expiry:
            print("OTP expired")
            otp_storage.pop(identifier, None)
            return False

        # 🔑 Compare correctly
        if str(stored_otp) == str(otp):
            otp_storage.pop(identifier, None)  # remove after success
            return True

        return False

    # --- PHONE SENDER (SMS) ---
    @staticmethod
    def send_sms_otp(phone_number, otp):
        """
        Sends OTP to mobile. 
        For now, this prints to the console (Simulation).
        """
        print(f"\n📱 [SMS GATEWAY] Sending to: {phone_number}")
        print(f"💬 Message: Your SocialSafe-AI verification code is {otp}")
        print(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")
        
        # --- Example for a real Indian SMS API (Fast2SMS) ---
        # url = "https://www.fast2sms.com/dev/bulkV2"
        # payload = {
        #     "variables_values": otp,
        #     "route": "otp",
        #     "numbers": phone_number,
        # }
        # headers = {'authorization': 'YOUR_API_KEY'}
        # response = requests.post(url, json=payload, headers=headers)
        # return response.status_code == 200

        return True # Return True to tell the frontend it was 'sent'


    # @staticmethod
    # def verify_otp(identifier: str, user_otp: str):
    #     """Generic verification for both Email and Phone."""
    #     if identifier in otp_storage:
    #         stored_data = otp_storage[identifier]
    #         if datetime.now() < stored_data["expires"]:
    #             if str(stored_data["otp"]) == str(user_otp):
    #                 # In a dual verification flow, you might want to wait 
    #                 # until both are done before deleting, or delete immediately.
    #                 del otp_storage[identifier] 
    #                 return True
    #     return False
    

    @staticmethod
    async def signup_user(user_data: dict):
        """Final step: Saves the user to MongoDB."""
        # 1. Check if email already exists
        existing = await users_collection.find_one({"email": user_data['email']})
        if existing:
            return {"error": "Email already registered"}
        
        # 2. Check if username already exists
        existing_user = await users_collection.find_one({"username": user_data['username']})
        if existing_user:
            return {"error": "Username already taken"}

        # 3. Create the document
        new_user = {
            "actual_name": user_data.get("actual_name"),
            "username": user_data.get("username"),
            "email": user_data.get("email"),
            "phone": user_data.get("phone"),
            "password": user_data.get("password"), 
            "surveillance_off_users": [],
            "created_at": datetime.utcnow(),
            "last_seen": datetime.utcnow(),
            "is_online": True,
            "blocked_users": [],
            "bio": "Hey there! I am using SocialSafe AI.",
            "profile_image": "",
            "warning_count": 0,
        }
            
        # 4. Insert into DB
        result = await users_collection.insert_one(new_user)
        
        # 🚨 THE FIX: Convert ObjectId to string so JSON can read it
        new_user["_id"] = str(result.inserted_id)
        new_user["id"] = str(result.inserted_id) # Add 'id' for frontend consistency
        
        return new_user

    # @staticmethod
    # async def signup_user(user_data: dict):
    #     """Final step: Saves the user to MongoDB."""
    #     # 1. Check if email already exists
    #     existing = await users_collection.find_one({"email": user_data['email']})
    #     if existing:
    #         return {"error": "Email already registered"}
        
    #     # 2. Check if username already exists
    #     existing_user = await users_collection.find_one({"username": user_data['username']})
    #     if existing_user:
    #         return {"error": "Username already taken"}

    #     # 3. Create the document
    #     new_user = {
    #         "actual_name": user_data.get("actual_name"),
    #         "username": user_data.get("username"),
    #         "email": user_data.get("email"),
    #         "phone": user_data.get("phone"),
    #         "password": user_data.get("password"), 
    #         "surveillance_off_users": [],
    #         "created_at": datetime.utcnow()
    #     }
            
    #     # 4. Insert into DB
    #     result = await users_collection.insert_one(new_user)
        
    #     # 🚨 THE FIX: Convert ObjectId to string so JSON can read it
    #     new_user["_id"] = str(result.inserted_id)
    #     new_user["id"] = str(result.inserted_id) # Add 'id' for frontend consistency
        
    #     return new_user

    # @staticmethod
    # async def login_user(data: dict):
    #     identifier = data.get("Email")
    #     password = data.get("Password")
        
    #     user = await users_collection.find_one({
    #         "$or": [{"email": identifier}, {"username": identifier}]
    #     })
        
    #     if not user:
    #         return {"status": 200, "error": "User not found"}
        
    #     if user["password"] != password:
    #         return {"status": 201, "error": "Invalid Password"}
        
    #     # Update last seen
    #     await users_collection.update_one({"_id": user["_id"]}, {"$set": {"last_seen": datetime.now(IST)}})
            
    #     user["id"] = str(user["_id"])
    #     del user["_id"]
    #     return {"status": 202, "result": user}


    @staticmethod
    async def login_user(data: dict):
        identifier = data.get("Email")
        password = data.get("Password")
        
        # 1. Check if the user exists in the BLOCKED collection
        is_blocked = await blocked_users_collection.find_one({
            "$or": [{"email": identifier}, {"username": identifier}]
        })
        
        if is_blocked:
            return {
                "status": 203, 
                "error": "This account has been parmenently blocked by the Admin for harassing others."
            }

        # 2. Proceed with normal user lookup
        user = await users_collection.find_one({
            "$or": [{"email": identifier}, {"username": identifier}]
        })
        
        if not user:
            return {"status": 200, "error": "User not found"}
        
        if user["password"] != password:
            return {"status": 201, "error": "Invalid Password"}
        
        # Update last seen
        await users_collection.update_one(
            {"_id": user["_id"]}, 
            {"$set": {"last_seen": datetime.now(IST)}}
        )
            
        user["id"] = str(user["_id"])
        del user["_id"]
        return {"status": 202, "result": user}


    @staticmethod
    async def reset_password(email: str, new_password: str):
        """Checks if the password is new and updates it."""
        # 1. Fetch the user's current record
        user = await users_collection.find_one({"email": email})
        
        if not user:
            return "user_not_found"

        # 2. Check if the new password is exactly the same as the stored one
        if user.get("password") == new_password:
            return "same_password_error"

        # 3. If it is different, perform the update
        result = await users_collection.update_one(
            {"email": email},
            {"$set": {"password": new_password}}
        )
        
        return "success" if result.modified_count > 0 else "update_failed"