from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class MessageCreate(BaseModel):
    text: Optional[str] = None
    message_type: str

class MessageResponse(BaseModel):
    text: Optional[str]
    message_type: str
    created_at: datetime
