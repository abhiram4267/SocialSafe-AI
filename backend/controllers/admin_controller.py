# from database import users_collection, messages_collection
# from bson import ObjectId

# class AdminController:
#     @staticmethod
#     async def get_dashboard_stats():
#         """Fetches all data required for the React Admin Dashboard"""
#         try:
#             # 1. Counts for the Cards
#             total_users = await users_collection.count_documents({})
#             total_messages = await messages_collection.count_documents({})
            
#             # Count specifically 'Bullying' and 'Cyberattack/Threat'
#             threats_query = {"prediction": {"$in": ["Harassment", "Cyberattack/Threat"]}}
#             threat_count = await messages_collection.count_documents(threats_query)

#             # 2. Data for the Pie Chart
#             # We count each category to send to Recharts
#             safe_count = await messages_collection.count_documents({"prediction": "Safe"})
#             harassment_count = await messages_collection.count_documents({"prediction": "Harassment"})
#             attack_count = await messages_collection.count_documents({"prediction": "Cyberattack/Threat"})

#             pie_data = [
#                 {"name": "Safe", "value": safe_count},
#                 {"name": "Harassment", "value": harassment_count},
#                 {"name": "Cyberattack", "value": attack_count}
#             ]

#             # 3. Recent Activity Logs (Last 10 messages)
#             recent_logs = []
#             cursor = messages_collection.find().sort("timestamp", -1).limit(10)
#             async for msg in cursor:
#                 # Find user name for the log
#                 user = await users_collection.find_one({"_id": ObjectId(msg["senderId"])})
#                 recent_logs.append({
#                     "id": str(msg["_id"]),
#                     "user": user.get("username") if user else "Unknown",
#                     "text": msg.get("text", "Media File")[:30] + "...", # Truncate for table
#                     "prediction": msg.get("prediction", "Safe"),
#                     "time": msg.get("timestamp").strftime("%I:%M %p") if msg.get("timestamp") else "Just now"
#                 })

#             return {
#                 "totalUsers": total_users,
#                 "totalMessages": total_messages,
#                 "accuracy": "92.8%", # This can be your trained model's F1-score
#                 "threatCount": threat_count,
#                 "pieData": pie_data,
#                 "recentLogs": recent_logs
#             }
#         except Exception as e:
#             print(f"Admin Stats Error: {e}")
#             return None


from database import users_collection, messages_collection, blocked_users_collection
from bson import ObjectId
from datetime import datetime, timedelta

class AdminController:
    # @staticmethod
    # async def get_dashboard_stats():
    #     """Fetches all data, filtering for scanned messages (confidence > 0%)"""
    #     try:
    #         # 1. Counts for the Cards
    #         total_users = await users_collection.count_documents({})
            
    #         # 🚨 FIX: Only count messages where confidence is NOT "0%"
    #         scanned_filter = {"confidence": {"$ne": "0%"}}
    #         total_scanned = await messages_collection.count_documents(scanned_filter)
            
    #         # 🚨 FIX: Count threats only among SCANNED messages
    #         threats_query = {
    #             "prediction": {"$in": ["Harassment", "Cyberattack/Threat"]},
    #             "confidence": {"$ne": "0%"} 
    #         }
    #         threat_count = await messages_collection.count_documents(threats_query)

    #         # 2. Data for the Pie Chart (Filter for Scanned messages only)
    #         safe_count = await messages_collection.count_documents({
    #             "prediction": {"$regex": "Safe", "$options": "i"}, # Catches "Safe" and "Safe Image"
    #             "confidence": {"$ne": "0%"}
    #         })
    #         harassment_count = await messages_collection.count_documents({
    #             "prediction": "Harassment",
    #             "confidence": {"$ne": "0%"}
    #         })
    #         attack_count = await messages_collection.count_documents({
    #             "prediction": "Cyberattack/Threat",
    #             "confidence": {"$ne": "0%"}
    #         })

    #         pie_data = [
    #             {"name": "Safe", "value": safe_count},
    #             {"name": "Harassment", "value": harassment_count},
    #             {"name": "Cyberattack", "value": attack_count}
    #         ]

    #         # 3. Recent Activity Logs (Last 10 scanned messages)
    #         recent_logs = []
    #         # We filter by confidence here too so the table only shows scanned items
    #         cursor = messages_collection.find(scanned_filter).sort("timestamp", -1).limit(10)
            
    #         async for msg in cursor:
    #             user = await users_collection.find_one({"_id": ObjectId(msg["senderId"])})
    #             recent_logs.append({
    #                 "id": str(msg["_id"]),
    #                 "user": user.get("username") if user else "Unknown",
    #                 "text": msg.get("text", "Media File")[:30] + "...",
    #                 "prediction": msg.get("prediction", "Safe"),
    #                 "time": msg.get("timestamp").strftime("%I:%M %p") if msg.get("timestamp") else "Just now"
    #             })

    #         return {
    #             "totalUsers": total_users,
    #             "totalMessages": total_scanned, # This is now 'Scanned Items'
    #             "accuracy": "92.8%",
    #             "threatCount": threat_count,
    #             "pieData": pie_data,
    #             "recentLogs": recent_logs
    #         }
    #     except Exception as e:
    #         print(f"Admin Stats Error: {e}")
    #         return None


    @staticmethod
    async def get_dashboard_stats():
        """Fetches stats, filtering for scanned messages and active users only"""
        try:
            # 1. Active User Count
            total_users = await users_collection.count_documents({})
            
            # Filter for messages that were actually scanned by AI
            scanned_filter = {"confidence": {"$ne": "0%"}}

            # 2. Scanned Items & Threats (Dynamic filtering logic)
            # Note: To be 100% accurate with deleted users in counts, 
            # you would need an aggregation lookup. 
            # For now, we use your existing count logic for performance.
            total_scanned = await messages_collection.count_documents(scanned_filter)
            
            threats_query = {
                "prediction": {"$in": ["Harassment", "Cyberattack/Threat"]},
                "confidence": {"$ne": "0%"} 
            }
            threat_count = await messages_collection.count_documents(threats_query)

            # 3. Pie Chart Data
            safe_count = await messages_collection.count_documents({
                "prediction": {"$regex": "Safe", "$options": "i"},
                "confidence": {"$ne": "0%"}
            })
            harassment_count = await messages_collection.count_documents({
                "prediction": "Harassment",
                "confidence": {"$ne": "0%"}
            })
            attack_count = await messages_collection.count_documents({
                "prediction": "Cyberattack/Threat",
                "confidence": {"$ne": "0%"}
            })

            pie_data = [
                {"name": "Safe", "value": safe_count},
                {"name": "Harassment", "value": harassment_count},
                {"name": "Cyberattack", "value": attack_count}
            ]

            # 4. Recent Activity Logs (MODIFIED: Filter out Unknowns)
            recent_logs = []
            # We fetch 50 instead of 10 to ensure we have enough valid ones after filtering deleted users
            cursor = messages_collection.find(scanned_filter).sort("timestamp", -1).limit(50)
            
            async for msg in cursor:
                # Look up participants in the active users collection
                sender = await users_collection.find_one({"_id": ObjectId(msg["senderId"])})
                receiver = await users_collection.find_one({"_id": ObjectId(msg["receiverId"])})

                # 🚨 MODIFICATION: Only add to logs if BOTH sender and receiver exist
                if sender and receiver:
                    recent_logs.append({
                        "id": str(msg["_id"]),
                        "user": sender.get("username"), # Guaranteed to exist here
                        "text": msg.get("text", "Media File")[:30] + "...",
                        "prediction": msg.get("prediction", "Safe"),
                        "time": msg.get("timestamp").strftime("%I:%M %p") if msg.get("timestamp") else "Just now"
                    })

                # Stop once we have found 10 valid active records
                if len(recent_logs) >= 10:
                    break

            return {
                "totalUsers": total_users,
                "totalMessages": total_scanned,
                "accuracy": "92.8%",
                "threatCount": threat_count,
                "pieData": pie_data,
                "recentLogs": recent_logs
            }
        except Exception as e:
            print(f"Admin Stats Error: {e}")
            return None
        

    # @staticmethod
    # async def get_flagged_messages():
    #     """Fetches only Harassment and Cyberattack messages for the Surveillance page"""
    #     try:
    #         logs = []
    #         # Filter for everything NOT safe
    #         query = {"prediction": {"$in": ["Harassment", "Cyberattack/Threat"]}}
    #         cursor = messages_collection.find(query).sort("timestamp", -1)
            
    #         async for msg in cursor:
    #             # Get Sender info
    #             sender = await users_collection.find_one({"_id": ObjectId(msg["senderId"])})
    #             # Get Receiver info
    #             receiver = await users_collection.find_one({"_id": ObjectId(msg["receiverId"])})
                
    #             logs.append({
    #                 "id": str(msg["_id"]),
    #                 "sender": sender.get("username") if sender else "Unknown",
    #                 "receiver": receiver.get("username") if receiver else "Unknown",
    #                 "text": msg.get("text", "Media Content"),
    #                 "prediction": msg.get("prediction"),
    #                 "confidence": msg.get("confidence"),
    #                 "time": msg.get("timestamp").strftime("%Y-%m-%d %I:%M %p")
    #             })
    #         return logs
    #     except Exception as e:
    #         print(f"Error: {e}")
    #         return []


    @staticmethod
    async def get_flagged_messages():
        """Fetches flagged messages only for users who still exist in the active collection"""
        try:
            logs = []
            # 1. Filter for threats
            query = {"prediction": {"$in": ["Harassment", "Cyberattack/Threat"]}}
            cursor = messages_collection.find(query).sort("timestamp", -1)
            
            async for msg in cursor:
                # 2. Look up Sender and Receiver in the ACTIVE users collection
                sender = await users_collection.find_one({"_id": ObjectId(msg["senderId"])})
                receiver = await users_collection.find_one({"_id": ObjectId(msg["receiverId"])})
                
                # 3. ONLY include the record if BOTH users exist
                # If one was deleted/moved to blocked_users, 'sender' or 'receiver' will be None
                if sender and receiver:
                    logs.append({
                        "id": str(msg["_id"]),
                        "sender": sender.get("username"),
                        "receiver": receiver.get("username"),
                        "text": msg.get("text", "Media Content"),
                        "prediction": msg.get("prediction"),
                        "confidence": msg.get("confidence"),
                        "time": msg.get("timestamp").strftime("%Y-%m-%d %I:%M %p")
                    })
            return logs
        except Exception as e:
            print(f"❌ Error fetching flagged messages: {e}")
            return []

    # Update get_all_users to include more info
    @staticmethod
    async def get_all_users_detailed():
        users = []
        async for u in users_collection.find({}):
            users.append({
                "id": str(u["_id"]),
                "username": u.get("username"),
                "name": u.get("actual_name"),
                "email": u.get("email"),
                "phone": u.get("phone"),
                "created": u.get("created_at").strftime("%Y-%m-%d") if u.get("created_at") else "N/A"
            })
        return users
    
    @staticmethod
    async def get_blocked_users():
        blocked_users = []
        async for u in blocked_users_collection.find({}):
            blocked_users.append({
                "id": str(u["_id"]),
                "username": u.get("username"),
                "name": u.get("actual_name"),
                "email": u.get("email"),
                "phone": u.get("phone"),
                "blocked_at": u.get("blocked_at").strftime("%Y-%m-%d") if u.get("blocked_at") else "N/A",
                "block_reason": u.get("block_reason", "N/A")
            })
        return blocked_users
    
    # @staticmethod
    # async def get_full_conversation(user_a: str, user_b: str):
    #     """Fetches the bidirectional chat history between two specific users"""
    #     try:
    #         # 1. Find the User Documents to get their Object IDs
    #         # We search by username because that's what the admin sees on screen
    #         u1 = await users_collection.find_one({"username": user_a})
    #         u2 = await users_collection.find_one({"username": user_b})

    #         if not u1 or not u2:
    #             print(f"❌ Audit Error: One of the users ({user_a} or {user_b}) not found.")
    #             return []

    #         u1_id = str(u1["_id"])
    #         u2_id = str(u2["_id"])

    #         # 2. Query: (A sent to B) OR (B sent to A)
    #         query = {
    #             "$or": [
    #                 {"senderId": u1_id, "receiverId": u2_id},
    #                 {"senderId": u2_id, "receiverId": u1_id}
    #             ]
    #         }

    #         messages = []
    #         # Sort by timestamp 1 (Oldest to Newest) to see the conversation flow
    #         cursor = messages_collection.find(query).sort("timestamp", 1)
            
    #         async for msg in cursor:
    #             messages.append({
    #                 "id": str(msg["_id"]),
    #                 "sender": user_a if msg["senderId"] == u1_id else user_b,
    #                 "text": msg.get("text", ""),
    #                 "type": msg.get("type", "text"),
    #                 "prediction": msg.get("prediction", "Safe"),
    #                 "confidence": msg.get("confidence", "0%"),
    #                 "time": msg["timestamp"].strftime("%I:%M %p") if msg.get("timestamp") else "Unknown"
    #             })
            
    #         print(f"✅ Audit: Found {len(messages)} messages between {user_a} and {user_b}")
    #         return messages

    #     except Exception as e:
    #         print(f"❌ Admin Controller History Error: {e}")
    #         return []


    @staticmethod
    async def get_full_conversation(user_a: str, user_b: str):
        """Fetches chat history and profile details for both users"""
        try:
            u1 = await users_collection.find_one({"username": user_a})
            u2 = await users_collection.find_one({"username": user_b})

            if not u1 or not u2:
                return {"messages": [], "participants": []}

            u1_id = str(u1["_id"])
            u2_id = str(u2["_id"])

            # Construct Participant Info for the Modal
            participants = [
                {"username": user_a, "email": u1.get("email"), "phone": u1.get("phone")},
                {"username": user_b, "email": u2.get("email"), "phone": u2.get("phone")}
            ]

            query = {
                "$or": [
                    {"senderId": u1_id, "receiverId": u2_id},
                    {"senderId": u2_id, "receiverId": u1_id}
                ]
            }

            messages = []
            cursor = messages_collection.find(query).sort("timestamp", 1)
            
            async for msg in cursor:
                messages.append({
                    "id": str(msg["_id"]),
                    "sender": user_a if msg["senderId"] == u1_id else user_b,
                    "text": msg.get("text", ""),
                    "type": msg.get("type", "text"),
                    "prediction": msg.get("prediction", "Safe"),
                    "confidence": msg.get("confidence", "0%"),
                    "time": msg["timestamp"].strftime("%I:%M %p") if msg.get("timestamp") else "Unknown"
                })
            
            # Return as an object containing both messages and participant info
            return {"messages": messages, "participants": participants}

        except Exception as e:
            print(f"❌ Admin Controller History Error: {e}")
            return {"messages": [], "participants": []}
        

    @staticmethod
    async def get_user_trend(period: str):
        now = datetime.utcnow()
        labels = []
        registered_data = []
        decreased_data = [] # Assuming you have a 'deleted_at' field for decreased users

        if period == "1week":
            days = 7
            for i in range(days - 1, -1, -1):
                date = now - timedelta(days=i)
                start = date.replace(hour=0, minute=0, second=0, microsecond=0)
                end = date.replace(hour=23, minute=59, second=59, microsecond=999)
                
                count = await users_collection.count_documents({"created_at": {"$gte": start, "$lte": end}})
                labels.append(date.strftime("%a")) # Mon, Tue...
                registered_data.append(count)
                # Mocking decreased data for this example
                decreased_data.append(0) 

        elif period == "1month":
            # Group by weeks or 4-day intervals
            for i in range(3, -1, -1):
                start = now - timedelta(days=(i+1)*7)
                end = now - timedelta(days=i*7)
                count = await users_collection.count_documents({"created_at": {"$gte": start, "$lte": end}})
                labels.append(f"Wk {4-i}")
                registered_data.append(count)
                decreased_data.append(0)

        elif period == "1year":
            for i in range(11, -1, -1):
                # Approximate months
                start = now - timedelta(days=(i+1)*30)
                end = now - timedelta(days=i*30)
                count = await users_collection.count_documents({"created_at": {"$gte": start, "$lte": end}})
                labels.append((now - timedelta(days=i*30)).strftime("%b"))
                registered_data.append(count)
                decreased_data.append(0)

        else: # Lifeline
            # Group by year
            current_year = now.year
            for i in range(2, -1, -1): # Last 3 years
                year = current_year - i
                start = datetime(year, 1, 1)
                end = datetime(year, 12, 31)
                count = await users_collection.count_documents({"created_at": {"$gte": start, "$lte": end}})
                labels.append(str(year))
                registered_data.append(count)
                decreased_data.append(0)

        return {
            "labels": labels,
            "datasets": [
                {"data": registered_data, "color": (lambda *args: f'rgba(34, 197, 94, 1)'), "label": "Registered"},
                {"data": decreased_data, "color": (lambda *args: f'rgba(239, 68, 68, 1)'), "label": "Decreased"}
            ]
        }
    
    # @staticmethod
    # async def report_users(usernames: list):
    #     results = []
    #     for username in usernames:
    #         # $inc handles the case where warning_count doesn't exist (treats as 0)
    #         user = await users_collection.find_one_and_update(
    #             {"username": username},
    #             {"$inc": {"warning_count": 1}}, 
    #             return_document=True
    #         )

    #         if user:
    #             # Fallback to 0 if for some reason the update failed to return count
    #             count = user.get("warning_count", 0)
    #             results.append({
    #                 "username": username,
    #                 "warning_count": count,
    #                 "exceeded_limit": count >= 5,
    #                 "actual_name": user.get("actual_name", "Unknown")
    #             })
        
    #     return results


    @staticmethod
    async def report_users(usernames: list):
        results = []
        for username in usernames:
            # 1. Update the warning count and get the LATEST document
            user = await users_collection.find_one_and_update(
                {"username": username},
                {"$inc": {"warning_count": 1}},
                return_document=True # This ensures we get the document with the new count
            )

            if user:
                count = user.get("warning_count", 0)
                is_exceeded = count >= 5
                
                if is_exceeded:
                    # --- HARD BLOCK LOGIC ---
                    
                    # 2. Prepare the data to be archived
                    # We take the entire user document and add blocking metadata
                    blocked_data = dict(user) 
                    blocked_data["blocked_at"] = datetime.utcnow()
                    blocked_data["block_reason"] = "Exceeded safety warning limit (5/5)"
                    
                    # 3. Insert the full user data into the blocked_users collection
                    await blocked_users_collection.insert_one(blocked_data)

                    # 4. Permanently delete from the active users collection
                    await users_collection.delete_one({"_id": user["_id"]})
                    
                    print(f"🚫 User {username} deleted and moved to Blocked Records.")

                results.append({
                    "username": username,
                    "warning_count": count,
                    "exceeded_limit": is_exceeded,
                    "actual_name": user.get("actual_name", "Unknown"),
                    "status": "Permanently Deleted & Blocked" if is_exceeded else "Warning Issued"
                })
        
        return results