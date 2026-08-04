import os
import shutil
from datetime import datetime
from database import users_collection
from bson import ObjectId

# Directory to store profile pictures
PROFILE_PIC_DIR = "static/profile_pics"
os.makedirs(PROFILE_PIC_DIR, exist_ok=True)

class ProfileController:
    @staticmethod
    async def get_profile(user_id: str):
        user = await users_collection.find_one({"_id": ObjectId(user_id)})
        if user:
            user["_id"] = str(user["_id"])
            return user
        return None

    @staticmethod
    async def update_profile(user_id: str, data: dict, file=None):
        update_data = {
            "username": data.get("username"),
            "bio": data.get("bio"),
            "dob": data.get("dob"),
            "phone": data.get("phone")
        }

        # Handle Image Upload if a file is provided
        if file:
            file_extension = file.filename.split(".")[-1]
            file_name = f"profile_{user_id}.{file_extension}"
            file_path = os.path.join(PROFILE_PIC_DIR, file_name)
            
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            # Store the relative URL in the database
            update_data["profile_image"] = f"/static/profile_pics/{file_name}"

        # Update MongoDB
        result = await users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_data}
        )

        if result.modified_count > 0 or result.matched_count > 0:
            # Fetch the updated user to return to frontend
            updated_user = await users_collection.find_one({"_id": ObjectId(user_id)})
            updated_user["_id"] = str(updated_user["_id"])
            return updated_user
        
        return None