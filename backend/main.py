

# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# from contextlib import asynccontextmanager

# # Import the warmup function from your controller
# from controllers.image_controller import warmup_image_model
# from controllers.audio_controller import warmup_audio_models
# from controllers.video_controller import warmup_video_models


# from routes.text_routes import router as text_router
# from routes.image_routes import router as image_router
# from routes.audio_routes import router as audio_router
# from routes.video_routes import router as video_router


# # --- LIFESPAN CONFIGURATION ---
# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     # This code runs when the server starts
#     print("🚀 SocialSafe-AI: Loading models into RAM...")
#     try:
#         warmup_image_model() # This triggers get_image_model()

#         warmup_audio_models() # This triggers get audio_model()

#         warmup_video_models() # This triggers get video_model()

#         # load_text_model() # Uncomment if you want to warm up text model too
#         print("✅ SocialSafe-AI: All models are warm and ready!")
#     except Exception as e:
#         print(f"❌ Error during model warmup: {e}")
    
#     yield
#     # This code runs when the server shuts down
#     print("🛑 Server shutting down...")

# # Pass the lifespan to the FastAPI instance
# app = FastAPI(lifespan=lifespan)

# # CORS (React Native / Expo safe)
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# @app.get("/api")
# def home():
#     return {"message": "Backend is running successfully"}

# # Register auth routes
# from routes.auth_routes import router as auth_router
# app.include_router(auth_router, prefix="/api")

# # Register all routes
# app.include_router(text_router, prefix="/api")
# app.include_router(image_router, prefix="/api")
# app.include_router(audio_router, prefix="/api")
# app.include_router(video_router, prefix="/api")




#version 2.1 - 4/1/2026


# import os
# from fastapi.staticfiles import StaticFiles

# import socketio

# from controllers.text_controller import predict_text # Import your AI function
# from database import users_collection # Ensure this is imported
# from bson import ObjectId


# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# from contextlib import asynccontextmanager

# # --- IMPORT CHAT LOGIC ---
# from routes.chat_routes import router as chat_router
# from controllers.chat_controller import ChatController

# # --- IMPORT EXISTING CONTROLLERS ---
# from controllers.image_controller import warmup_image_model
# from controllers.audio_controller import warmup_audio_models
# from controllers.video_controller import warmup_video_models

# # --- IMPORT EXISTING ROUTES ---
# from routes.text_routes import router as text_router
# from routes.image_routes import router as image_router
# from routes.audio_routes import router as audio_router
# from routes.video_routes import router as video_router
# from routes.auth_routes import router as auth_router





# # --- 1. SOCKET.IO SETUP ---
# # cors_allowed_origins="*" allows your React Native app to connect
# sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins="*")

# # --- 2. LIFESPAN CONFIGURATION ---
# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     print("🚀 SocialSafe-AI: Loading models into RAM...")
#     try:
#         warmup_image_model()
#         warmup_audio_models()
#         warmup_video_models()
#         print("✅ SocialSafe-AI: All models are warm and ready!")
#     except Exception as e:
#         print(f"❌ Error during model warmup: {e}")
    
#     yield
#     print("🛑 Server shutting down...")

# # Pass the lifespan to the FastAPI instance
# app = FastAPI(lifespan=lifespan)




# # Create a folder for uploads if it doesn't exist
# UPLOAD_DIR = "static/uploads"
# os.makedirs(UPLOAD_DIR, exist_ok=True)

# # Mount the folder so files are accessible via URL
# app.mount("/static", StaticFiles(directory="static"), name="static")



# class LocalFile:
#     def __init__(self, path):
#         self.path = path
#         self.filename = os.path.basename(path)

#     async def read(self):
#         # Open the file stored on the backend disk
#         with open(self.path, "rb") as f:
#             return f.read()

# # --- 3. SOCKET.IO EVENTS (Real-time Logic) ---

# @sio.event
# async def connect(sid, environ):
#     print(f"Client Connected: {sid}")

# @sio.on("join")
# async def handle_join(sid, userId):
#     """
#     When a user opens the app, they join a 'room' named after their unique ID.
#     This allows us to send messages to them specifically later.
#     """
#     await sio.enter_room(sid, userId)
#     print(f"User {userId} joined their personal room.")


# # @sio.on("send_message")
# # async def handle_send_message(sid, data):
# #     try:
# #         sender_id = data['senderId']
# #         receiver_id = data['receiverId']
# #         text = data['text']

# #         sender_doc = await users_collection.find_one({"_id": ObjectId(sender_id)})
# #         receiver_doc = await users_collection.find_one({"_id": ObjectId(receiver_id)})

# #         # Default is ON. It only goes OFF if one of them added the other to the 'off' list.
# #         sender_trusts_receiver = str(receiver_id) in sender_doc.get("surveillance_off_users", [])
# #         receiver_trusts_sender = str(sender_id) in receiver_doc.get("surveillance_off_users", [])

# #         # AI Runs ONLY if BOTH haven't disabled it. 
# #         # (Or you can use OR logic if you want safety even if only 1 person wants it)
# #         if not sender_trusts_receiver and not receiver_trusts_sender and data.get("type") == "text":
# #             from controllers.text_controller import predict_text
# #             ai_result = predict_text(text)
# #             data["prediction"] = ai_result["prediction"]
# #             data["confidence"] = ai_result["confidence"]
# #         else:
# #             data["prediction"] = "Safe"
# #             data["confidence"] = 0

# #         saved_msg = await ChatController.save_message(data)
# #         await sio.emit("receive_message", saved_msg, room=receiver_id)
# #         await sio.emit("message_sent", saved_msg, room=sender_id)
        
# #     except Exception as e:
# #         print(f"❌ Error in handle_send_message: {e}")



# @sio.on("send_message")
# async def handle_send_message(sid, data):
#     try:
#         sender_id = data['senderId']
#         receiver_id = data['receiverId']
#         msg_type = data.get("type", "text")
#         text_content = data.get("text") # This is the URL or text

#         # 1. FETCH USER DOCS FOR SURVEILLANCE CHECK
#         sender_doc = await users_collection.find_one({"_id": ObjectId(sender_id)})
#         receiver_doc = await users_collection.find_one({"_id": ObjectId(receiver_id)})

#         # Surveillance is ON by default. It's OFF only if one trusts the other.
#         sender_trusts_receiver = str(receiver_id) in sender_doc.get("surveillance_off_users", [])
#         receiver_trusts_sender = str(sender_id) in receiver_doc.get("surveillance_off_users", [])
        
#         is_surveillance_active = not sender_trusts_receiver and not receiver_trusts_sender

#         # 2. DECIDE WHAT TO SAVE
#         if not is_surveillance_active:
#             # If surveillance is OFF, we force the prediction to "Safe"
#             data["prediction"] = "Safe"
#             data["confidence"] = "0%"
#         else:
#             # If surveillance is ON, we use the prediction already attached to 'data'
#             # (which was sent by the frontend after the API upload)
#             if msg_type == "text":
#                 from controllers.text_controller import predict_text
#                 res = predict_text(text_content)
#                 data["prediction"] = res["prediction"]
#                 data["confidence"] = f"{res['confidence']}%"

#         # 3. SAVE TO DB VIA CONTROLLER
#         # This will now include: senderId, receiverId, text (URL), type, prediction, confidence
#         saved_msg = await ChatController.save_message(data)
        
#         # 4. EMIT
#         await sio.emit("receive_message", saved_msg, room=receiver_id)
#         await sio.emit("message_sent", saved_msg, room=sender_id)

#     except Exception as e:
#         print(f"❌ Error: {e}")

# @sio.event
# async def disconnect(sid):
#     print(f"Client Disconnected: {sid}")



# # --- 4. MIDDLEWARE & ROUTES ---

# # CORS (React Native / Expo safe)
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# @app.get("/api")
# def home():
#     return {"message": "SocialSafe-AI Backend is running successfully"}

# # Register all routes
# app.include_router(auth_router, prefix="/api")
# app.include_router(text_router, prefix="/api")
# app.include_router(image_router, prefix="/api")
# app.include_router(audio_router, prefix="/api")
# app.include_router(video_router, prefix="/api")

# # Register the new Chat routes (for history and user lists)
# app.include_router(chat_router, prefix="/api/chat")

# # --- 5. WRAP APP WITH SOCKET.IO ---
# # This combines FastAPI and Socket.io into one running app
# socket_app = socketio.ASGIApp(sio, app)

# # To run this, use: uvicorn main:socket_app --host 0.0.0.0 --port 8000




import os
import socketio
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

# --- Imports ---
from database import users_collection
from database import init_db
from routes.chat_routes import router as chat_router
from routes.auth_routes import router as auth_router
from routes.status_routes import router as status_router
from routes.profile_routes import router as profile_router
from controllers.image_controller import warmup_image_model
from controllers.audio_controller import warmup_audio_models
from controllers.video_controller import warmup_video_models

# --- Admin Controlls ---
from routes.admin_routes import router as admin_router

# 1. Setup Socket.io
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins="*")

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 SocialSafe-AI: Warming up models...")
    try:
        await init_db()
        warmup_image_model()
        warmup_audio_models()
        warmup_video_models()
        print("✅ Models ready!")
    except Exception as e:
        print(f"❌ Warmup Error: {e}")
    yield
    print("🛑 Shutting down...")

app = FastAPI(lifespan=lifespan)
app.state.sio = sio # Store socket instance in app state

# 2. Static Files (For Image/Video/Audio URLs)
if not os.path.exists("static/uploads"):
    os.makedirs("static/uploads")
app.mount("/static", StaticFiles(directory="static"), name="static")

# 3. Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. Socket Events
@sio.on("join")
async def handle_join(sid, userId):
    await sio.enter_room(sid, str(userId))
    print(f"User {userId} joined room.")

# 5. Include Routes
app.include_router(auth_router, prefix="/api")
app.include_router(chat_router, prefix="/api/chat")
app.include_router(status_router, prefix="/api/status")
app.include_router(profile_router, prefix="/api/profile", tags=["Profile"])


# Admin Routes
app.include_router(admin_router, prefix="/api/admin")

# 6. Wrap App
socket_app = socketio.ASGIApp(sio, app)