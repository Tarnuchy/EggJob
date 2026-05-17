from pydantic import BaseModel


class MessageResponse(BaseModel):
    message: str


class AuthResponse(BaseModel):
    account_id: str
    user_id: str
    email: str
    username: str
    photo_url: str | None = None


class UserSummaryResponse(BaseModel):
    id: str
    username: str
    photo_url: str | None = None


class FriendsListResponse(BaseModel):
    count: int
    items: list[UserSummaryResponse]


class TaskGroupSummaryResponse(BaseModel):
    group_id: str
    name: str
    privacy: str | None = None
    type: str | None = None
    role: str | None = None
    is_bingo: bool
    task_count: int


class TaskGroupListResponse(BaseModel):
    count: int
    items: list[TaskGroupSummaryResponse]


class TaskGroupResponse(BaseModel):
    id: str
    name: str
    privacy: str | None = None
    type: str | None = None
    is_bingo: bool
    task_count: int
    invite_code: str | None = None


class TaskResponse(BaseModel):
    id: str
    name: str
    description: str
    goal: float | None = None
    unit: str | None = None
    type: str
    group_id: str
    owner_id: str | None = None


class ProgressValidationResponse(BaseModel):
    is_valid: bool
