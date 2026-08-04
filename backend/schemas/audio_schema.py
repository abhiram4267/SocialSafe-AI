from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class AudioResponse(BaseModel):
    transcription: str
    prediction: str
    confidence: str
    created_at: datetime
    transliterated: Optional[str] = ""

class AudioDB(BaseModel):
    filename: str
    file_type: str
    transcription: str
    prediction: str
    created_at: datetime
    
