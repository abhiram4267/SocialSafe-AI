from fastapi import APIRouter, HTTPException, Query
from controllers.admin_controller import AdminController

router = APIRouter(tags=["Admin Dashboard"])

@router.get("/stats")
async def get_admin_stats():
    stats = await AdminController.get_dashboard_stats()
    if stats is None:
        raise HTTPException(status_code=500, detail="Could not retrieve admin statistics")
    return stats


@router.get("/flagged")
async def get_flagged():
    return await AdminController.get_flagged_messages()

@router.get("/users/all")
async def get_users_all():
    return await AdminController.get_all_users_detailed()

@router.get("/users/block")
async def get_blocked_users():
    return await AdminController.get_blocked_users()

@router.get("/history") # 🚨 Changed from /history/{user_id}
async def get_conversation_audit(
    u1: str = Query(..., description="Username of the first person"),
    u2: str = Query(..., description="Username of the second person")
):
    """API for the MessageInfo page to load the full chat context"""
    history = await AdminController.get_full_conversation(u1, u2)
    
    # Even if history is empty, return a 200 OK with empty list [] 
    # to prevent React from crashing
    return history

@router.get("/user-stats")
async def user_stats(period: str = "1week"):
    return await AdminController.get_user_trend(period)

@router.post("/report")
async def report_user(data: dict):
    # data: { "usernames": ["user1", "user2"] }
    usernames = data.get("usernames", [])
    if not usernames:
        return {"error": "No users selected"}
    
    return await AdminController.report_users(usernames)