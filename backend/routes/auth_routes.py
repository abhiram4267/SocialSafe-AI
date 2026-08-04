


# from fastapi import APIRouter, HTTPException, Query
# from pydantic import BaseModel, validator
# from controllers.auth_controller import AuthController
# from database import users_collection
# from typing import Optional # 👈 Required for optional fields

# router = APIRouter()

# # --- Models for OTP Validation ---
# class OtpRequest(BaseModel):
#     # We make these optional so the frontend can send just email OR just phone
#     email: Optional[str] = None
#     phone: Optional[str] = None

# class VerifyRequest(BaseModel):
#     email: Optional[str] = None
#     phone: Optional[str] = None
#     otp: str

# # --- Models for Registration ---
# class SignupRequest(BaseModel):
#     username: str
#     actual_name: str
#     email: str
#     phone: str
#     password: str
#     confirm_password: str

#     @validator('email')
#     def email_must_be_gmail(cls, v):
#         if not v.lower().endswith('@gmail.com'):
#             raise ValueError('Email must be a @gmail.com address')
#         return v

# class LoginRequest(BaseModel):
#     Email: str  
#     Password: str

# class ResetPasswordRequest(BaseModel):
#     email: str
#     password: str


# @router.get("/check-username")
# async def check_username(username: str = Query(...)):
#     exists = await AuthController.is_username_taken(username)
#     if exists:
#         return {"exists": True, "message": "Username already taken"}
#     return {"exists": False}

# # --- OTP Endpoints ---

# # @router.post("/send-otp")
# # async def send_otp(req: OtpRequest):
# #     identifier = req.email if req.email else req.phone
# #     await AuthController.request_otp(identifier)
# #     # Always return success during development
# #     return {"status": "success", "message": "OTP processed. Check Gmail or Terminal."}

# @router.post("/send-otp")
# async def send_otp(req: OtpRequest):
#     identifier = req.email if req.email else req.phone
    
#     # The Controller now handles checking for Blocked/Existing users
#     try:
#         await AuthController.request_otp(identifier)
#         return {"status": "success", "message": "OTP processed successfully."}
#     except HTTPException as e:
#         # Rethrow the exception so FastAPI returns the correct status code and message
#         raise e
#     except Exception as e:
#         print(f"Error: {e}")
#         raise HTTPException(status_code=500, detail="Internal Server Error")

# @router.post("/verify-otp")
# async def verify_otp(req: VerifyRequest):
#     identifier = req.email if req.email else req.phone
    
#     if not identifier:
#         raise HTTPException(status_code=400, detail="Identifier is required")

#     # Checks if the OTP matches the one in temp memory for this specific identifier
#     is_valid = AuthController.verify_otp(identifier, req.otp)
    
#     if not is_valid:
#         raise HTTPException(status_code=400, detail="Invalid or Expired OTP")
        
#     return {"status": "success", "message": "Verification Successful"}


# @router.post("/check-availability") # Renamed for clarity
# async def check_availability(req: OtpRequest):
#     identifier = req.email if req.email else req.phone
#     await AuthController.validate_for_otp(identifier)
#     return {"status": "ok", "message": "Proceed to Firebase"}

# # --- Auth Endpoints ---

# @router.post("/signup")
# async def signup(request: SignupRequest):
#     if request.password != request.confirm_password:
#         raise HTTPException(status_code=400, detail="Passwords do not match")
    
#     response = await AuthController.signup_user(request.dict())
    
#     # If there is an error key in the dictionary, return it as a 400
#     if isinstance(response, dict) and "error" in response:
#         return {"status": "error", "message": response["error"]}
    
#     return {"status": "success", "user": response}

# @router.post("/login")
# async def login(request: LoginRequest):
#     response = await AuthController.login_user(request.dict())
#     return response

# @router.post("/forgot-password/send-otp")
# async def forgot_password_otp(req: OtpRequest):
#     # 1. Check if user exists first
#     user = await users_collection.find_one({"email": req.email})
#     if not user:
#         raise HTTPException(status_code=404, detail="No account found with this email")
    
#     # 2. Re-use your existing request_otp logic
#     await AuthController.request_otp(req.email)
#     return {"status": "success", "message": "Reset code sent to Gmail"}

# @router.post("/forgot-password/reset")
# async def reset_password_final(req: ResetPasswordRequest):
#     result = await AuthController.reset_password(req.email, req.password)
    
#     if result == "same_password_error":
#         # 🚨 This sends the specific message you want
#         raise HTTPException(
#             status_code=400, 
#             detail="New password cannot be the same as your old password. Please choose a different one."
#         )
    
#     if result == "user_not_found":
#         raise HTTPException(status_code=404, detail="User account not found.")
        
#     if result == "update_failed":
#         raise HTTPException(status_code=500, detail="Internal server error during update.")

#     return {"status": "success", "message": "Password updated successfully"}




from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, validator
from controllers.auth_controller import AuthController
from database import users_collection
from typing import Optional # 👈 Required for optional fields
from utils.otp_service import send_otp as send_sms_otp, verify_otp as verify_sms_otp

router = APIRouter()

# --- Models for OTP Validation ---
class OtpRequest(BaseModel):
    # We make these optional so the frontend can send just email OR just phone
    email: Optional[str] = None
    phone: Optional[str] = None

class VerifyRequest(BaseModel):
    email: Optional[str] = None
    phone: Optional[str] = None
    otp: str

# --- Models for Registration ---
class SignupRequest(BaseModel):
    username: str
    actual_name: str
    email: str
    phone: str
    password: str
    confirm_password: str

    @validator('email')
    def email_must_be_gmail(cls, v):
        if not v.lower().endswith('@gmail.com'):
            raise ValueError('Email must be a @gmail.com address')
        return v

class LoginRequest(BaseModel):
    Email: str  
    Password: str

class ResetPasswordRequest(BaseModel):
    email: str
    password: str


@router.get("/check-username")
async def check_username(username: str = Query(...)):
    exists = await AuthController.is_username_taken(username)
    if exists:
        return {"exists": True, "message": "Username already taken"}
    return {"exists": False}

# --- OTP Endpoints ---

# @router.post("/send-otp")
# async def send_otp(req: OtpRequest):
#     identifier = req.email if req.email else req.phone
#     await AuthController.request_otp(identifier)
#     # Always return success during development
#     return {"status": "success", "message": "OTP processed. Check Gmail or Terminal."}

@router.post("/send-otp")
async def send_otp(req: OtpRequest):
    identifier = req.email if req.email else req.phone
    
    # The Controller now handles checking for Blocked/Existing users
    try:
        await AuthController.request_otp(identifier)
        return {"status": "success", "message": "OTP processed successfully."}
    except HTTPException as e:
        # Rethrow the exception so FastAPI returns the correct status code and message
        raise e
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.post("/verify-otp")
async def verify_otp(req: VerifyRequest):
    identifier = req.email if req.email else req.phone
    
    if not identifier:
        raise HTTPException(status_code=400, detail="Identifier is required")

    # Checks if the OTP matches the one in temp memory for this specific identifier
    is_valid = AuthController.verify_otp(identifier, req.otp)
    
    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid or Expired OTP")
        
    return {"status": "success", "message": "Verification Successful"}


@router.post("/check-availability") # Renamed for clarity
async def check_availability(req: OtpRequest):
    identifier = req.email if req.email else req.phone
    await AuthController.validate_for_otp(identifier)
    return {"status": "ok", "message": "Proceed to Firebase"}

# --- Auth Endpoints ---

@router.post("/signup")
async def signup(request: SignupRequest):
    if request.password != request.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")
    
    response = await AuthController.signup_user(request.dict())
    
    # If there is an error key in the dictionary, return it as a 400
    if isinstance(response, dict) and "error" in response:
        return {"status": "error", "message": response["error"]}
    
    return {"status": "success", "user": response}

@router.post("/login")
async def login(request: LoginRequest):
    response = await AuthController.login_user(request.dict())
    return response

@router.post("/forgot-password/send-otp")
async def forgot_password_otp(req: OtpRequest):
    # 1. Check if user exists first
    user = await users_collection.find_one({"email": req.email})
    if not user:
        raise HTTPException(status_code=404, detail="No account found with this email")
    
    # 2. Re-use your existing request_otp logic
    await AuthController.request_otp(req.email)
    return {"status": "success", "message": "Reset code sent to Gmail"}

@router.post("/forgot-password/reset")
async def reset_password_final(req: ResetPasswordRequest):
    result = await AuthController.reset_password(req.email, req.password)
    
    if result == "same_password_error":
        # 🚨 This sends the specific message you want
        raise HTTPException(
            status_code=400, 
            detail="New password cannot be the same as your old password. Please choose a different one."
        )
    
    if result == "user_not_found":
        raise HTTPException(status_code=404, detail="User account not found.")
        
    if result == "update_failed":
        raise HTTPException(status_code=500, detail="Internal server error during update.")

    return {"status": "success", "message": "Password updated successfully"}



@router.post("/send-phone-otp")
async def send_phone_otp(data: dict):
    phone = data.get("phone")
    return send_sms_otp(phone)


@router.post("/verify-phone-otp")
async def verify_phone_otp(data: dict):
    phone = data.get("phone")
    otp = data.get("otp")

    if verify_sms_otp(phone, otp):   # ✅ FIX HERE
        return {"status": "success"}
    else:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    