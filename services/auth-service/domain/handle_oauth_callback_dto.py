from datetime import datetime
from typing import Optional

from domain.user_dto import UserDTO
from pydantic import BaseModel


class HandleOAuthCallbackDTO(BaseModel):
    code: str
    state: str


class HandleOAuthCallbackResponseDTO(BaseModel):
    access_token: str
    refresh_token: str
    expires_in: datetime
    user: UserDTO
    is_new_user: bool
    redirect_url: Optional[str]
