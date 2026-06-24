from pydantic import BaseModel


class HandleOAuthCallbackDTO(BaseModel):
    code: str
