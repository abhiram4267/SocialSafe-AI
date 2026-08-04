from pydantic import BaseModel, Field
from datetime import datetime

class MessageCreate(BaseModel):
    senderId: str
    receiverId: str
    text: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)