from datetime import datetime
from uuid import UUID

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


class DeleteAccountRequest(BaseModel):
    password: str


class UserProfileUpdateRequest(BaseModel):
    username: str | None = None
    photo_url: str | None = None


class InviteFriendRequest(BaseModel):
    friend_id: UUID


class NotifyRequest(BaseModel):
    message: str


class CreateGroupRequest(BaseModel):
    name: str
    privacy: str | None = None
    is_bingo: bool = False
    type: str | None = None


class TaskGroupEditRequest(BaseModel):
    name: str | None = None
    privacy: str | None = None
    is_bingo: bool | None = None


class TaskGroupAddFriendRequest(BaseModel):
    friend_id: UUID
    role: str


class TaskGroupChangeTypeRequest(BaseModel):
    new_type: str


class TaskCreateRequest(BaseModel):
    task_type: str
    name: str
    description: str | None = ""
    goal: float | None = None
    unit: str | None = None
    deadline: datetime | None = None
    frequency: str | None = None
    photo_required: bool = False
    color: str | None = None
    notifications: bool = False


class TaskEditRequest(BaseModel):
    name: str | None = None
    description: str | None = None
    goal: float | None = None


class TaskChangeTypeRequest(BaseModel):
    new_type: str


class TaskProgressUpdateRequest(BaseModel):
    delta_value: float
    message: str
    photo_url: str | None = None


class TaskParamsEditRequest(BaseModel):
    photo_required: bool | None = None
    color: str | None = None
    notifications: bool | None = None


class GroupMemberChangeRoleRequest(BaseModel):
    new_role: str


class GroupMemberRemoveRequest(BaseModel):
    take_progress: bool = False


class ProgressEntryCommentRequest(BaseModel):
    message: str
