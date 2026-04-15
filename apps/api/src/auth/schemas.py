
from typing import Optional

from pydantic import BaseModel, Field


class User(BaseModel):
    id: Optional[str] = Field(alias="_id")
    name: str
    email: str
    password: str

class LoginBody(BaseModel):
    email: str
    password: str

class RegisterBody(BaseModel):
    name: str
    email: str
    password: str

class UserDto(BaseModel):
    id: str
    name: str
    email: str
