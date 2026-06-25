from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class UserDTO(BaseModel):
    user_id: str
    email: str
    display_name: str
    avatar_url: Optional[str]
    is_active: bool
    created_at: datetime
    last_login_at: datetime
