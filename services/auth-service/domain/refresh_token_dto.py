from pydantic import BaseModel


class RefreshTokenDTO(BaseModel):
    refresh_token: str


class RefreshTokenResponseDTO(BaseModel):
    access_token: str
    refresh_token: str
    expires_in: int
