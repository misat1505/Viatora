from pydantic import BaseModel


class ValidateTokenDTO(BaseModel):
    token: str
