# from motor.motor_asyncio import AsyncIOMotorClient
# import os
# from dotenv import load_dotenv

# load_dotenv()  # ✅ IMPORTANT

# MONGO_URI = os.getenv("MONGODB_URI")
# DB_NAME = os.getenv("DB_NAME")

# if not MONGO_URI or not DB_NAME:
#     raise RuntimeError("❌ MongoDB environment variables not loaded")

# client = AsyncIOMotorClient(MONGO_URI)
# db = client[DB_NAME]

# # Collections

# users_collection = db.get_collection("users")

# # For storing audio logs (your existing logic)
# audio_collection = db.get_collection("audio_logs")

# # For storing text chat logs and ML predictions
# messages_collection = db.get_collection("messages")

# print(f"✅ Connected to MongoDB: {DB_NAME}")




from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()  # ✅ IMPORTANT

MONGO_URI = os.getenv("MONGODB_URI")
DB_NAME = os.getenv("DB_NAME")

if not MONGO_URI or not DB_NAME:
    raise RuntimeError("❌ MongoDB environment variables not loaded")

client = AsyncIOMotorClient(MONGO_URI)
db = client[DB_NAME]

# --- Collections ---
users_collection = db.get_collection("users")
audio_collection = db.get_collection("audio_logs")
messages_collection = db.get_collection("messages")
blocked_users_collection = db.get_collection("blocked_users")

# ✅ New Status Collection
status_collection = db.get_collection("statuses")

# --- Database Initialization Logic ---
async def init_db():
    """
    Initializes database indexes, specifically the TTL index for Statuses.
    TTL (Time To Live) index automatically deletes documents after a certain time.
    """
    try:
        # Create an index on 'created_at' that expires after 86400 seconds (24 hours)
        # If the index already exists, MongoDB will skip this.
        await status_collection.create_index("created_at", expireAfterSeconds=86400)
        print("✅ MongoDB TTL Index initialized (24h expiration for statuses)")
    except Exception as e:
        print(f"❌ Error initializing indexes: {e}")

print(f"✅ Connected to MongoDB: {DB_NAME}")