from pydantic import BaseModel


class RegisterRequest(BaseModel):
    email: str
    username: str
    password: str
    photo_url: str | None = None


class LoginRequest(BaseModel):
    email: str
    password: str
