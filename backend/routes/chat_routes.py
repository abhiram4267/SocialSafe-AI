

#version 2.1 - 4/1/2026


# from fastapi import APIRouter, Query, HTTPException
# from controllers.chat_controller import ChatController
# from typing import List

# router = APIRouter(
#     tags=["Chat Management"]
# )

# @router.get("/users")
# async def get_available_users(exclude: str = Query(..., description="The ID of the current logged-in user")):
#     """
#     Fetches all users from MongoDB except the current user.
#     Used for the 'All Charts' screen to start a new conversation.
#     """
#     try:
#         users = await ChatController.get_all_users_except(exclude)
#         return users
#     except Exception as e:
#         print(f"Error fetching users: {e}")
#         raise HTTPException(status_code=500, detail="Could not fetch users")

# @router.get("/history")
# async def get_chat_history(
#     senderId: str = Query(..., description="ID of the logged-in user"), 
#     receiverId: str = Query(..., description="ID of the person they are chatting with")
# ):
#     """
#     Fetches the last 100 messages between two specific users.
#     Used when opening the 'IndividualChat' screen.
#     """
#     try:
#         # We pass both IDs to the controller to find the shared conversation
#         history = await ChatController.get_history(senderId, receiverId)
#         return history
#     except Exception as e:
#         print(f"Error fetching history: {e}")
#         raise HTTPException(status_code=500, detail="Could not load chat history")



# #The Surveillance Toggle Endpoint
# @router.post("/surveillance/toggle")
# async def toggle_surveillance(data: dict):
#     my_id = data.get("myId")
#     target_id = data.get("targetId")
#     action = data.get("action") # "disable" means add to off-list, "enable" means remove

#     if action == "disable":
#         # Turn AI OFF: Add target to blacklist
#         await users_collection.update_one(
#             {"_id": ObjectId(my_id)},
#             {"$addToSet": {"surveillance_off_users": str(target_id)}}
#         )
#     else:
#         # Turn AI ON: Remove target from blacklist
#         await users_collection.update_one(
#             {"_id": ObjectId(my_id)},
#             {"$pull": {"surveillance_off_users": str(target_id)}}
#         )
#     return {"status": "success"}



# import uuid, os
# from fastapi import APIRouter, UploadFile, File, Form, Request, Query, HTTPException
# from database import users_collection
# from controllers.chat_controller import ChatController
# from controllers.text_controller import predict_text
# from controllers.image_controller import process_image
# from controllers.audio_controller import process_audio
# from controllers.video_controller import process_video
# from bson import ObjectId

# router = APIRouter()

# @router.post("/send")
# async def send_message_unified(
#     request: Request,
#     senderId: str = Form(...),
#     receiverId: str = Form(...),
#     msgType: str = Form(...), # "text", "image", "audio", "video"
#     text: str = Form(None),
#     file: UploadFile = File(None)
# ):
#     # 1. Privacy Logic
#     sender_doc = await users_collection.find_one({"_id": ObjectId(senderId)})
#     receiver_doc = await users_collection.find_one({"_id": ObjectId(receiverId)})
    
#     is_off = (str(receiverId) in sender_doc.get("surveillance_off_users", []) or 
#               str(senderId) in receiver_doc.get("surveillance_off_users", []))
#     is_surveillance_active = not is_off

#     prediction_result = {"prediction": "Safe", "confidence": "0%"}
#     final_content = text

#     # 2. Process AI Content
#     if msgType == "text":
#         if is_surveillance_active:
#             res = predict_text(text)
#             prediction_result = {"prediction": res["prediction"], "confidence": f"{res['confidence']}%"}
#     else:
#         # Save Media
#         filename = f"{uuid.uuid4()}_{file.filename}"
#         filepath = os.path.join("static/uploads", filename)
#         with open(filepath, "wb") as buffer:
#             buffer.write(await file.read())
        
#         final_content = f"http://10.81.95.247:8000/static/uploads/{filename}"

#         if is_surveillance_active:
#             # Wrap for controllers
#             class MockFile:
#                 async def read(self):
#                     with open(filepath, "rb") as f: return f.read()
#                 @property
#                 def filename(self): return filename

#             if msgType == "image": prediction_result = await process_image(MockFile())
#             elif msgType == "audio": prediction_result = await process_audio(MockFile())
#             elif msgType == "video": prediction_result = await process_video(MockFile())

#     # 3. Save to DB
#     data = {
#         "senderId": senderId,
#         "receiverId": receiverId,
#         "text": final_content,
#         "type": msgType,
#         "prediction": prediction_result.get("prediction", "Safe"),
#         "confidence": prediction_result.get("confidence", "0%")
#     }
#     saved_msg = await ChatController.save_message(data)

#     # 4. Signal Receiver via Socket
#     sio = request.app.state.sio
#     await sio.emit("receive_message", saved_msg, room=str(receiverId))

#     return saved_msg

# @router.get("/users")
# async def get_users(exclude: str):
#     return await ChatController.get_all_users_except(exclude)

# @router.get("/history")
# async def get_history(senderId: str, receiverId: str):
#     return await ChatController.get_history(senderId, receiverId)

# @router.post("/surveillance/toggle")
# async def toggle_surveillance(data: dict):
#     my_id, target_id, action = data.get("myId"), data.get("targetId"), data.get("action")
#     op = "$addToSet" if action == "disable" else "$pull"
#     await users_collection.update_one({"_id": ObjectId(my_id)}, {op: {"surveillance_off_users": str(target_id)}})
#     return {"status": "success"}




import uuid
import os
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, Form, Request, HTTPException, Query
from bson import ObjectId
from pydantic import BaseModel

# Database and Controllers
from database import users_collection
from controllers.chat_controller import ChatController

# AI Model Controllers
from controllers.text_controller import predict_text
from controllers.image_controller import process_image
from controllers.audio_controller import process_audio
from controllers.video_controller import process_video

router = APIRouter(tags=["Chat Management"])

# Helper to wrap a saved file path into an object the controllers can ".read()"
class MockFile:
    def __init__(self, filepath, filename):
        self.filepath = filepath
        self.filename = filename
    async def read(self):
        with open(self.filepath, "rb") as f:
            return f.read()
        
class BulkDeleteRequest(BaseModel):
    messageIds: list
    userId: str

class ForwardRequest(BaseModel):
    messageIds: list
    senderId: str
    receiverIds: list

@router.delete("/delete-bulk")
async def delete_bulk_messages(req: BulkDeleteRequest):
    """
    Deletes multiple selected messages.
    Checks userId to ensure only the owner can delete their messages.
    """
    try:
        result = await ChatController.delete_multiple_messages(req.messageIds, req.userId)
        if result["status"] == "error":
            raise HTTPException(status_code=400, detail=result["message"])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.post("/forward")
async def forward_messages(req: ForwardRequest):
    result = await ChatController.forward_messages(req.messageIds, req.senderId, req.receiverIds)
    if result["status"] == "error":
        raise HTTPException(status_code=400, detail=result["message"])
    return result

@router.post("/send")
async def send_message_unified(
    request: Request,
    senderId: str = Form(...),
    receiverId: str = Form(...),
    msgType: str = Form(...), # "text", "image", "audio", "video"
    text: str = Form(None), # Used for msgType="text"
    file: UploadFile = File(None) # Used for media types
):
    try:
        # 1. SURVEILLANCE / PRIVACY LOGIC
        # Fetch sender and receiver to check the trust blacklist
        sender_doc = await users_collection.find_one({"_id": ObjectId(senderId)})
        receiver_doc = await users_collection.find_one({"_id": ObjectId(receiverId)})

        if not sender_doc or not receiver_doc:
            raise HTTPException(status_code=404, detail="User not found")

        # 🚨 MUTUAL TRUST LOGIC (Both must agree)
        # Surveillance is ON by default. It turns OFF only if one of them TRUSTS the other.
        s_off_list = sender_doc.get("surveillance_off_users", [])
        r_off_list = receiver_doc.get("surveillance_off_users", [])
        
        is_off = (str(receiverId) in s_off_list and str(senderId) in r_off_list)
        is_surveillance_active = not is_off

        # Initialize default results
        prediction_label = "Safe"
        confidence_val = "0%"
        final_content = text

        # 2. CONTENT PROCESSING
        if msgType == "text":
            if is_surveillance_active and text:
                res = predict_text(text)
                prediction_label = res["prediction"]
                confidence_val = f"{res['confidence']}%"
        
        elif file:
            # A. Save Media to Server Disk
            ext = file.filename.split(".")[-1]
            unique_filename = f"{uuid.uuid4()}.{ext}"
            filepath = os.path.join("static", "uploads", unique_filename)
            
            content = await file.read()
            with open(filepath, "wb") as buffer:
                buffer.write(content)
            
            # This URL will be stored in the DB and sent to the receiver
            final_content = f"http://10.192.254.247:8000/static/uploads/{unique_filename}"

            # B. Run AI Models if Surveillance is Active
            if is_surveillance_active:
                media_mock = MockFile(filepath, unique_filename)
                
                if msgType == "image":
                    ai_res = await process_image(media_mock)
                    prediction_label = ai_res.get("prediction", "Safe")
                    confidence_val = ai_res.get("confidence", "0%")
                
                elif msgType == "audio":
                    ai_res = await process_audio(media_mock)
                    prediction_label = ai_res.get("prediction", "Safe")
                    confidence_val = ai_res.get("confidence", "0%")
                
                elif msgType == "video":
                    # Optimized Video Controller returns: 
                    # { prediction, visual_result, audio_result, audio_confidence }
                    ai_res = await process_video(media_mock)
                    
                    prediction_label = ai_res.get("prediction", "Safe")
                    vis_risk = ai_res.get("visual_result", "Safe")
                    aud_conf = ai_res.get("audio_confidence", "0%")
                    
                    # Fusion Confidence Logic:
                    # If visuals failed, we mention that. Otherwise use audio confidence score.
                    if vis_risk != "Safe":
                        confidence_val = f"Visual Risk ({vis_risk})"
                    else:
                        confidence_val = aud_conf

        # 3. CONSTRUCT MESSAGE OBJECT FOR DB
        message_data = {
            "senderId": senderId,
            "receiverId": receiverId,
            "text": final_content,
            "type": msgType,
            "prediction": prediction_label,
            "confidence": confidence_val,
            "timestamp": datetime.utcnow()
        }

        # Save to MongoDB
        saved_msg = await ChatController.save_message(message_data)

        # 4. REAL-TIME SIGNALING (Socket.io)
        # We poke the receiver so their app refreshes/shows the message instantly
        sio = request.app.state.sio
        await sio.emit("receive_message", saved_msg, room=str(receiverId))

        return saved_msg

    except Exception as e:
        print(f"❌ Error in unified send: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
    
@router.get("/search")
async def search_users(query: str = Query(...), myId: str = Query(...)):
    # This matches the name in the controller now
    return await ChatController.search_users(query, myId)

@router.get("/users")
async def get_available_users(exclude: str = Query(...)):
    """Used for the AllChatScreen to list people to chat with"""
    return await ChatController.get_all_users_except(exclude)

@router.get("/recent")
async def get_recent_chats(myId: str):
    return await ChatController.get_recent_chats(myId)


# Add this route to routes/chat_routes.py

@router.post("/sync-contacts")
async def sync_contacts(data: dict):
    """
    Accepts: { "myId": "...", "phones": ["...", "..."] }
    """
    my_id = data.get("myId")
    phones = data.get("phones")

    if not my_id or phones is None:
        raise HTTPException(status_code=400, detail="Missing myId or phones list")

    return await ChatController.find_users_by_contacts(phones, my_id)

@router.delete("/history/clear")
async def clear_history(senderId: str, receiverId: str):
    return await ChatController.clear_chat(senderId, receiverId)

@router.post("/block")
async def block_user(data: dict):
    return await ChatController.toggle_block(data['myId'], data['targetId'], data['action'])


@router.get("/history")
async def get_chat_history(senderId: str = Query(...), receiverId: str = Query(...)):
    """Loads past messages for the IndividualChat screen"""
    return await ChatController.get_history(senderId, receiverId)


@router.get("/surveillance/status")
async def get_surveillance_status(myId: str, targetId: str):
    # Check if I have disabled it for them
    me = await users_collection.find_one({"_id": ObjectId(myId), "surveillance_off_users": targetId})
    # Check if they have disabled it for me
    them = await users_collection.find_one({"_id": ObjectId(targetId), "surveillance_off_users": myId})
    
    return {
        "i_disabled": me is not None,
        "they_disabled": them is not None,
        "is_actually_private": (me is not None and them is not None)
    }


# @router.post("/surveillance/toggle")
# async def toggle_surveillance(data: dict):
#     """
#     Handles the 'Long Swipe Up' from the frontend.
#     action='disable' -> Add to off-list (AI goes OFF)
#     action='enable'  -> Remove from off-list (AI goes ON)
#     """
#     my_id = data.get("userId")
#     target_id = data.get("targetId")
#     action = data.get("action")

#     if not my_id or not target_id:
#         raise HTTPException(status_code=400, detail="Missing User or Recipient ID")

#     return await ChatController.toggle_target_surveillance(my_id, target_id, action)



@router.post("/surveillance/toggle")
async def toggle_surveillance(data: dict, request: Request):
    my_id = data.get("userId")
    target_id = data.get("targetId")
    action = data.get("action")

    # 1. Update Database (Your existing logic)
    await ChatController.toggle_target_surveillance(my_id, target_id, action)
    
    # 2. 🚨 SIGNAL THE OTHER USER
    sio = request.app.state.sio
    await sio.emit("privacy_updated", {"senderId": my_id, "action": action}, room=str(target_id))

    return {"status": "success"}