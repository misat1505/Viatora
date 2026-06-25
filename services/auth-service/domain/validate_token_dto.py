from pydantic import BaseModel


class ValidateTokenDTO(BaseModel):
    token: str


class ValidateTokenResponseDTO(BaseModel):
    valid: bool
    user_id: str
    email: str
    display_name: str
    avatar_url: str
    is_active: bool
    jti: str
