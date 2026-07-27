from pydantic import BaseModel, ConfigDict


class AmenityOut(BaseModel):
    id: int
    name: str
    icon_key: str

    model_config = ConfigDict(from_attributes=True)
