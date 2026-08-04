
#version 2.1 - 4/1/2026

# controllers/chat_controller.py
from database import users_collection, messages_collection
from bson import ObjectId
from datetime import datetime
import pytz

IST = pytz.timezone('Asia/Kolkata')

class ChatController:
    @staticmethod
    async def save_message(data: dict):
        """Saves a message sent via Socket.io"""
        new_message = {
            "senderId": data.get("senderId"),
            "receiverId": data.get("receiverId"),
            "text": data.get("text"),
            "type": data.get("type", "text"), # text, image, audio, video
            "timestamp": datetime.now(IST),

            #AI model predictions are been added

            "prediction": data.get("prediction", "Safe"),
            "confidence": data.get("confidence", 0),
            "label_id": data.get("label_id", 0)
        }
        result = await messages_collection.insert_one(new_message)
        new_message["_id"] = str(result.inserted_id)

        if isinstance(new_message["timestamp"], datetime):
            new_message["timestamp"] = new_message["timestamp"].isoformat()

        return new_message
    
    @staticmethod
    async def delete_multiple_messages(message_ids: list, user_id: str):
        """Deletes multiple messages from MongoDB"""
        
        # Convert string IDs to ObjectIds
        obj_ids = [ObjectId(mid) for mid in message_ids]
        
        # Security: Only delete if the user is the sender (standard 'Delete for Everyone' logic)
        # Or remove the senderId check if you want 'Delete for Me' logic
        result = await messages_collection.delete_many({
            "_id": {"$in": obj_ids},
            "senderId": user_id 
        })
        
        return {"status": "success", "deleted_count": result.deleted_count}
    
    # @staticmethod
    # async def forward_messages(message_ids: list, new_sender_id: str, receiver_ids: list):
    #     """Clones existing messages for multiple new recipients"""
    #     try:
    #         from database import messages_collection
    #         import datetime

    #         # 1. Fetch original messages
    #         obj_ids = [ObjectId(mid) for mid in message_ids]
    #         originals = await messages_collection.find({"_id": {"$in": obj_ids}}).to_list(length=None)

    #         if not originals:
    #             return {"status": "error", "message": "Originals not found"}

    #         all_new_docs = []
    #         for target_user_id in receiver_ids:
    #             for msg in originals:
    #                 # Clone for each recipient
    #                 forwarded_doc = {
    #                     "senderId": new_sender_id,
    #                     "receiverId": str(target_user_id),
    #                     "text": msg["text"],
    #                     "type": msg["type"],
    #                     "prediction": msg.get("prediction", "Safe"),
    #                     "confidence": msg.get("confidence", "0%"),
    #                     "timestamp": datetime.datetime.utcnow(),
    #                     "is_forwarded": True
    #                 }
    #                 all_new_docs.append(forwarded_doc)

    #         # 2. Bulk Insert all clones
    #         if all_new_docs:
    #             await messages_collection.insert_many(all_new_docs)
            
    #         return {"status": "success", "recipients_count": len(receiver_ids)}
    #     except Exception as e:
    #         return {"status": "error", "message": str(e)}

    @staticmethod
    async def forward_messages(message_ids: list, new_sender_id: str, receiver_ids: list):
        try:
            from database import messages_collection, users_collection
            import datetime

            sender_doc = await users_collection.find_one({"_id": ObjectId(new_sender_id)})
            s_off_list = sender_doc.get("surveillance_off_users", [])

            obj_ids = [ObjectId(mid) for mid in message_ids]
            originals = await messages_collection.find({"_id": {"$in": obj_ids}}).to_list(length=None)

            all_new_docs = []
            for target_user_id in receiver_ids:
                receiver_doc = await users_collection.find_one({"_id": ObjectId(target_user_id)})
                if not receiver_doc: continue
                
                r_off_list = receiver_doc.get("surveillance_off_users", [])

                # 🚨 MUTUAL TRUST LOGIC
                # Only turn OFF if both users are in each other's lists
                is_off = (str(target_user_id) in s_off_list and str(new_sender_id) in r_off_list)
                is_surveillance_active = not is_off

                for msg in originals:
                    forwarded_doc = {
                        "senderId": new_sender_id,
                        "receiverId": str(target_user_id),
                        "text": msg["text"],
                        "type": msg["type"],
                        "timestamp": datetime.datetime.utcnow(),
                        "is_forwarded": True
                    }

                    if is_surveillance_active:
                        forwarded_doc["prediction"] = msg.get("prediction", "Safe")
                        forwarded_doc["confidence"] = msg.get("confidence", "0%")
                        forwarded_doc["label_id"] = msg.get("label_id", 0)
                    else:
                        # Mutual Trust established: AI is silenced
                        forwarded_doc["prediction"] = "Safe"
                        forwarded_doc["confidence"] = "0% (Mutual Privacy)"
                        forwarded_doc["label_id"] = 0

                    all_new_docs.append(forwarded_doc)

            if all_new_docs:
                await messages_collection.insert_many(all_new_docs)
            
            return {"status": "success", "recipients_count": len(receiver_ids)}
        except Exception as e:
            return {"status": "error", "message": str(e)}
    
    @staticmethod
    async def get_recent_chats(my_id: str):
        """
        Fetches users you have chatted with, including the last message, 
        sorted by the most recent activity.
        """
        pipeline = [
            # 1. Find all messages where I am either sender or receiver
            {"$match": {
                "$or": [
                    {"senderId": my_id},
                    {"receiverId": my_id}
                ]
            }},
            # 2. Sort by time descending
            {"$sort": {"timestamp": -1}},
            # 3. Group by the 'other' person in the conversation
            {"$group": {
                "_id": {
                    "$cond": [
                        {"$eq": ["$senderId", my_id]},
                        "$receiverId",
                        "$senderId"
                    ]
                },
                "lastMessage": {"$first": "$text"},
                "lastMessageType": {"$first": "$type"},
                "lastTimestamp": {"$first": "$timestamp"},
                "prediction": {"$first": "$prediction"}
            }},
            # 4. Join with 'users' collection to get their names/images
            {"$lookup": {
                "from": "users",
                "let": {"searchId": {"$toObjectId": "$_id"}},
                "pipeline": [
                    {"$match": {"$expr": {"$eq": ["$_id", "$$searchId"]}}}
                ],
                "as": "user_details"
            }},
            {"$unwind": "$user_details"},
            # 5. Final Sort: Most recent chat first
            {"$sort": {"lastTimestamp": -1}}
        ]

        cursor = messages_collection.aggregate(pipeline)
        results = await cursor.to_list(length=50)

        return [{
            "id": str(u["_id"]),
            "actual_name": u["user_details"].get("actual_name"),
            "username": u["user_details"].get("username"),
            "profile_image": u["user_details"].get("profile_image", ""),
            "lastMessage": u["lastMessage"],
            "lastMessageType": u["lastMessageType"],
            "lastTimestamp": u["lastTimestamp"],
            "prediction": u["prediction"]
        } for u in results]

    
    @staticmethod
    async def find_users_by_contacts(phone_list: list, my_id: str):
        """
        Cleans phone list and finds matching users in MongoDB
        """
        try:
            clean_numbers = []
            for num in phone_list:
                # Remove non-digits
                digits = "".join(filter(str.isdigit, str(num)))
                # Take last 10 digits for Indian numbers
                if len(digits) >= 10:
                    clean_numbers.append(digits[-10:])
            
            # Remove duplicates
            clean_numbers = list(set(clean_numbers))

            matches = []
            # Search users in DB
            async for user in users_collection.find({
                "phone": {"$in": clean_numbers},
                "_id": {"$ne": ObjectId(my_id)}
            }):
                matches.append({
                    "id": str(user["_id"]),
                    "actual_name": user.get("actual_name"),
                    "username": user.get("username"),
                    "profile_image": user.get("profile_image", "")
                })
            return matches
        except Exception as e:
            print(f"❌ Error in find_users_by_contacts: {e}")
            return []
    


    @staticmethod
    async def get_all_users_except(my_id: str):
        """Fetches users for the AllCharts screen"""
        users = []
        async for user in users_collection.find({"_id": {"$ne": ObjectId(my_id)}}):
            users.append({
                "id": str(user["_id"]),
                "username": user.get("username"),
                "actual_name": user.get("actual_name"),
                "profile_image": user.get("profile_image", "")
            })
        return users

    # @staticmethod
    # async def get_history(sender_id: str, receiver_id: str):
    #     """Fetches past messages between two users"""
    #     query = {
    #         "$or": [
    #             {"senderId": sender_id, "receiverId": receiver_id},
    #             {"senderId": receiver_id, "receiverId": sender_id}
    #         ]
    #     }
    #     messages = []
    #     # Sort by timestamp ascending (oldest to newest)
    #     async for msg in messages_collection.find(query).sort("timestamp", 1):
    #         msg["_id"] = str(msg["_id"])
    #         # Ensure timestamp is string for JSON if it's a datetime object
    #         if isinstance(msg.get("timestamp"), datetime):
    #             msg["timestamp"] = msg["timestamp"].isoformat()
    #         messages.append(msg)
    #     return messages

    @staticmethod
    async def get_history(sender_id: str, receiver_id: str, limit: int = 20, skip: int = 0):
        """Fetches past messages sorted by NEWEST first for inverted list"""
        query = {
            "$or": [
                {"senderId": sender_id, "receiverId": receiver_id},
                {"senderId": receiver_id, "receiverId": sender_id}
            ]
        }
        messages = []
        # 🚨 CHANGE: Sort by -1 (Descending) to get newest first
        cursor = messages_collection.find(query).sort("timestamp", -1).skip(skip).limit(limit)
        
        async for msg in cursor:
            msg["_id"] = str(msg["_id"])
            if isinstance(msg.get("timestamp"), datetime):
                msg["timestamp"] = msg["timestamp"].isoformat()
            messages.append(msg)
            
        return messages # Newest message is at index 0
    
    #Search for users by username
    @staticmethod
    async def search_users(query: str, my_id: str):
        """
        1. Finds users whose name/username contains the character
        2. Filters out the current user
        3. Returns 8 random selections from the matches
        """
        try:
            # Validate the my_id string is a proper MongoDB ObjectId
            if not ObjectId.is_valid(my_id):
                return []

            pipeline = [
                # Filter: Matches the query AND is not me
                {"$match": {
                    "_id": {"$ne": ObjectId(my_id)},
                    "$or": [
                        {"username": {"$regex": query, "$options": "i"}},
                        {"actual_name": {"$regex": query, "$options": "i"}}
                    ]
                }},
                # Randomly select 8 from the matches
                {"$sample": {"size": 8}}
            ]
            
            cursor = users_collection.aggregate(pipeline)
            results = await cursor.to_list(length=8)
            
            return [{
                "id": str(u["_id"]),
                "username": u.get("username"),
                "actual_name": u.get("actual_name"),
                "profile_image": u.get("profile_image", "")
            } for u in results]
        except Exception as e:
            print(f"Error in search_users: {e}")
            return []
        
    @staticmethod
    async def clear_chat(user_a: str, user_b: str):
        """Deletes all messages between two specific users"""
        query = {
            "$or": [
                {"senderId": user_a, "receiverId": user_b},
                {"senderId": user_b, "receiverId": user_a}
            ]
        }
        await messages_collection.delete_many(query)
        return {"status": "success"}

    @staticmethod
    async def toggle_block(my_id: str, target_id: str, action: str):
        """Adds or removes a user from the blocked_users array"""
        op = "$addToSet" if action == "block" else "$pull"
        await users_collection.update_one(
            {"_id": ObjectId(my_id)},
            {op: {"blocked_users": ObjectId(target_id)}}
        )
        return {"status": "success"}



    #Action can be "Surveillance" or "Unsurveillance"

    
    
    @staticmethod
    async def toggle_target_surveillance(my_id: str, target_id: str, action: str):
        """
        action='disable' -> I trust this person, turn AI OFF (Add to list)
        action='enable'  -> I don't trust them, turn AI ON (Remove from list)
        """
        # FIX: Changed 'user_collection' to 'users_collection' 
        # FIX: Standardized field name to 'surveillance_off_users'
        op = "$addToSet" if action == "disable" else "$pull"
        
        await users_collection.update_one(
            {"_id": ObjectId(my_id)},
            {op: {"surveillance_off_users": str(target_id)}}
        )
        return {"status": "success", "new_mode": action}


    # Action can be 'block' or 'unblock'
    @staticmethod
    async def toggle_block_user(my_id: str, target_id: str, action: str):
        """Action can be 'block' or 'unblock'"""
        if action == "block":
            # Add target_id to my blocked_users list (using $addToSet to avoid duplicates)
            await users_collection.update_one(
                {"_id": ObjectId(my_id)},
                {"$addToSet": {"blocked_users": ObjectId(target_id)}}
            )
        else:
            # Remove target_id from my blocked_users list
            await users_collection.update_one(
                {"_id": ObjectId(my_id)},
                {"$pull": {"blocked_users": ObjectId(target_id)}}
            )
        return {"status": "success", "action": action}


    #check if either user has blocked the other
    @staticmethod
    async def is_blocked(user_a: str, user_b: str):
        """Check if either user has blocked the other"""
        # 1. Did A block B?
        a_blocked_b = await users_collection.find_one({
            "_id": ObjectId(user_a), 
            "blocked_users": ObjectId(user_b)
        })
        # 2. Did B block A?
        b_blocked_a = await users_collection.find_one({
            "_id": ObjectId(user_b), 
            "blocked_users": ObjectId(user_a)
        })
        
        return True if (a_blocked_b or b_blocked_a) else False