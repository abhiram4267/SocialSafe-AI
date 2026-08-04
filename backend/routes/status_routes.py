from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from controllers.status_controller import create_status, get_all_statuses, delete_specific_status
from datetime import datetime

router = APIRouter()

@router.post("/upload")
async def upload_status(
    user_id: str = Form(...),
    username: str = Form(...),
    status_type: str = Form(...),
    content: str = Form(None),
    file: UploadFile = File(None)
):
    try:
        return await create_status(user_id, username, status_type, content, file)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/")
async def fetch_statuses():
    try:
        return await get_all_statuses()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.delete("/{status_id}")
async def remove_status(status_id: str, user_id: str):
    success = await delete_specific_status(status_id, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Status not found or unauthorized")
    return {"status": "success", "message": "Status deleted"}