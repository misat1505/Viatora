from pydantic import BaseModel


class LogoutDTO(BaseModel):
    user_id: str
    refresh_token: str
