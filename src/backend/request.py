from pydantic import BaseModel


class RegisterRequest(BaseModel):
    email: str
    username: str
    password: str
    photo_url: str | None = None


class LoginRequest(BaseModel):
    email: str
    password: str


class ChangePasswordRequest(BaseModel):
    email: str
    old_password: str
    new_password: str
