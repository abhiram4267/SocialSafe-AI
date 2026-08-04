from fastapi import APIRouter, UploadFile, File, HTTPException
from controllers.audio_controller import process_audio
from schemas.audio_schema import AudioResponse

router = APIRouter()

@router.post("/test-audio", response_model=AudioResponse)
async def test_audio(file: UploadFile = File(...)):
    try:
        return await process_audio(file)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
