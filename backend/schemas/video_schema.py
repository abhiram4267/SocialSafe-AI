from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class VideoResponse(BaseModel):
    filename: Optional[str] = "unknown"
    prediction: str
    visual_result: Optional[str] = "N/A"
    audio_transcript: Optional[str] = "N/A"
    audio_result: Optional[str] = "N/A"
    audio_confidence: Optional[str] = "0%"
    time_taken: Optional[str] = "0s"
    created_at: datetime