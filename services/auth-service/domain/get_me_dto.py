from pydantic import BaseModel


class GetMeDTO(BaseModel):
    user_id: str
