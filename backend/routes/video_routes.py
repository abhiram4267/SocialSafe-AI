from fastapi import APIRouter, UploadFile, File, HTTPException
from controllers.video_controller import process_video
from schemas.video_schema import VideoResponse


router = APIRouter()

@router.post("/test-video", response_model=VideoResponse)
async def test_video(file: UploadFile = File(...)):
    try:
        return await process_video(file)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))