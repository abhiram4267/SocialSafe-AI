from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from controllers.profile_controller import ProfileController
from typing import Optional

router = APIRouter()

@router.get("/{user_id}")
async def get_user_profile(user_id: str):
    profile = await ProfileController.get_profile(user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="User not found")
    return profile

@router.put("/update")
async def update_user_profile(
    user_id: str = Form(...), # Keep this required to find the user
    username: Optional[str] = Form(None),
    bio: Optional[str] = Form(None),
    dob: Optional[str] = Form(None),
    phone: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None)
):
    # Ensure we don't pass None to the controller if we don't want to overwrite with null
    data = {
        "username": username,
        "bio": bio,
        "dob": dob,
        "phone": phone
    }
    
    # Remove keys that are None so they aren't updated in DB
    data = {k: v for k, v in data.items() if v is not None}
    
    updated_user = await ProfileController.update_profile(user_id, data, file)
    
    if not updated_user:
        raise HTTPException(status_code=400, detail="Update failed")
        
    return {"message": "Profile updated successfully", "user": updated_user}


@router.get("/{user_id}")
async def get_user_profile(user_id: str):
    profile = await ProfileController.get_profile(user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="User not found")
    # Make sure this 'profile' dictionary contains bio and last_seen
    return profile