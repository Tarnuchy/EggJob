from datetime import datetime
from pydantic import BaseModel


class MessageResponse(BaseModel):
    message: str


class AuthResponse(BaseModel):
    account_id: str
    user_id: str
    email: str
    username: str
    photo_url: str | None = None
    access_token: str
    token_type: str = "bearer"


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


class TaskParamsResponse(BaseModel):
    photo_required: bool
    color: str | None = None
    notifications: bool


class TaskDetailResponse(BaseModel):
    task: TaskResponse
    params: TaskParamsResponse | None = None


class TaskListResponse(BaseModel):
    count: int
    items: list[TaskResponse]


class InvitationSummaryResponse(BaseModel):
    from_user_id: str
    to_user_id: str
    from_username: str | None = None
    to_username: str | None = None
    date: datetime


class InvitationListResponse(BaseModel):
    count: int
    items: list[InvitationSummaryResponse]


class NotificationSummaryResponse(BaseModel):
    id: str
    message: str
    active: bool
    date: datetime


class NotificationListResponse(BaseModel):
    count: int
    items: list[NotificationSummaryResponse]


class GroupMemberSummaryResponse(BaseModel):
    id: str
    user_id: str
    username: str | None = None
    role: str | None = None
    active: bool
    joined_at: datetime


class GroupMemberListResponse(BaseModel):
    count: int
    items: list[GroupMemberSummaryResponse]


class TaskProgressSummaryResponse(BaseModel):
    id: str
    group_member_id: str | None = None
    user_id: str | None = None
    status: str
    value: float
    type: str


class TaskProgressListResponse(BaseModel):
    count: int
    items: list[TaskProgressSummaryResponse]


class ProgressEntrySummaryResponse(BaseModel):
    id: str
    member_id: str
    value: float
    message: str
    photo_url: str | None = None
    created_at: datetime


class ProgressEntryListResponse(BaseModel):
    count: int
    items: list[ProgressEntrySummaryResponse]


class CommentSummaryResponse(BaseModel):
    id: str
    user_id: str
    message: str
    date: datetime


class CommentListResponse(BaseModel):
    count: int
    items: list[CommentSummaryResponse]


class ProgressValidationResponse(BaseModel):
    is_valid: bool


class FeedItemResponse(BaseModel):
    type: str
    created_at: datetime
    user_id: str
    username: str | None = None
    task_id: str | None = None
    group_id: str | None = None
    message: str
    value: float | None = None
    photo_url: str | None = None


class UserFeedResponse(BaseModel):
    count: int
    items: list[FeedItemResponse]


class RepeatableStreakResponse(BaseModel):
    progress_id: str
    task_id: str
    streak: int
    counter: int


class UserStatsResponse(BaseModel):
    active_tasks: int
    completed_tasks: int
    friends_count: int
    streaks: list[RepeatableStreakResponse]
