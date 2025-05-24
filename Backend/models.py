from pydantic import BaseModel
from typing import List

class Comment(BaseModel):
    user_email: str
    text: str
    timestamp: str

class ShareRequest(BaseModel):
    file_id: str
    share_with: str
