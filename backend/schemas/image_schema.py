from pydantic import BaseModel
from datetime import datetime

class ImageResponse(BaseModel):
    transcription: str
    prediction: str
    confidence: str
    created_at: datetime