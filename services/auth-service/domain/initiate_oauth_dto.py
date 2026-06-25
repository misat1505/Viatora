from typing import Optional

from pydantic import BaseModel


class InitiateOAuthDTO(BaseModel):
    state: Optional[str] = None


class InitiateOAuthResponseDTO(BaseModel):
    redirect_url: str
