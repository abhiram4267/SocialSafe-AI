import os
import shutil
from datetime import datetime
from database import status_collection, blocked_users_collection # Ensure this is imported from database.py
from bson import ObjectId

# Create a directory to store status images/videos
UPLOAD_DIR = "static/status_media"
os.makedirs(UPLOAD_DIR, exist_ok=True)

async def create_status(user_id: str, username: str, status_type: str, content: str = None, file=None):
    """
    Logic to save status (Text, Image, or Video) to MongoDB
    """
    file_url = None
    
    # If it's media (image/video), save the file locally
    if status_type in ["image", "video"] and file:
        file_extension = file.filename.split(".")[-1]
        file_name = f"status_{user_id}_{int(datetime.now().timestamp())}.{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, file_name)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # This is the path we store in DB
        file_url = f"/static/status_media/{file_name}"

    status_doc = {
        "user_id": user_id,
        "username": username,
        "type": status_type, # 'text', 'image', 'video'
        "content": content if status_type == "text" else file_url,
        "created_at": datetime.utcnow() # MongoDB TTL index uses this to auto-delete after 24h
    }

    result = await status_collection.insert_one(status_doc)
    status_doc["_id"] = str(result.inserted_id)
    return status_doc

# async def get_all_statuses():
#     """
#     Groups individual statuses by user_id.
#     Returns: A list where each item is a User with an array of their updates.
#     """
#     pipeline = [
#         # 1. Sort everything by time (oldest to newest so they play in order)
#         {"$sort": {"created_at": 1}},
        
#         # 2. Group by user_id
#         {"$group": {
#             "_id": "$user_id",
#             "username": {"$first": "$username"},
#             # Push all updates into an array called 'updates'
#             "updates": {"$push": {
#                 "id": {"$toString": "$_id"},
#                 "type": "$type",
#                 "content": "$content",
#                 "created_at": "$created_at"
#             }},
#             # Keep track of the very last update time for sorting the main list
#             "last_update_time": {"$last": "$created_at"}
#         }},
        
#         # 3. Sort the final list so users with newest status are at the top
#         {"$sort": {"last_update_time": -1}}
#     ]
    
#     cursor = status_collection.aggregate(pipeline)
#     grouped_results = await cursor.to_list(length=100)
    
#     return grouped_results


async def get_all_statuses():
    """
    Groups individual statuses by user_id, excluding any users 
    present in the blocked_users_collection.
    """
    try:
        # 1. Fetch the list of blocked usernames
        # We only need the username field for the filter
        blocked_cursor = blocked_users_collection.find({}, {"username": 1})
        blocked_docs = await blocked_cursor.to_list(length=None)
        blocked_usernames = [doc["username"] for doc in blocked_docs]

        # 2. Build the pipeline
        pipeline = [
            # 🚨 NEW STEP: Filter out blocked users immediately
            # $nin means "Not In"
            {"$match": {"username": {"$nin": blocked_usernames}}},

            # 3. Sort everything by time (oldest to newest for the story flow)
            {"$sort": {"created_at": 1}},
            
            # 4. Group by user_id
            {"$group": {
                "_id": "$user_id",
                "username": {"$first": "$username"},
                "updates": {"$push": {
                    "id": {"$toString": "$_id"},
                    "type": "$type",
                    "content": "$content",
                    "created_at": "$created_at"
                }},
                "last_update_time": {"$last": "$created_at"}
            }},
            
            # 5. Sort final list so users with newest status appear first
            {"$sort": {"last_update_time": -1}}
        ]
        
        cursor = status_collection.aggregate(pipeline)
        grouped_results = await cursor.to_list(length=100)
        
        return grouped_results

    except Exception as e:
        print(f"❌ Error fetching statuses: {e}")
        return []

async def delete_specific_status(status_id: str, user_id: str):
    """
    Deletes a specific status update. 
    Checks user_id to ensure only the owner can delete it.
    """
    result = await status_collection.delete_one({
        "_id": ObjectId(status_id),
        "user_id": user_id
    })
    return result.deleted_count > 0