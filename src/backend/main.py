from uuid import UUID

from fastapi import Depends, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from src.backend.auth import assert_self, create_access_token, get_current_user
from src.backend.basics import router as basics_router
from src.backend.database import get_db, transaction
from src.backend.exceptions import *
from src.backend.media import router as media_router
from src.backend.models import *
from src.backend.request import *
from src.backend.response import (
    AuthResponse,
    MessageResponse,
    ProgressValidationResponse,
    TaskGroupResponse,
    TaskResponse,
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(basics_router)
app.include_router(media_router)


@app.exception_handler(ValidationError)
def handle_validation_error(_: Request, exc: ValidationError) -> JSONResponse:
    return JSONResponse(status_code=400, content={"detail": str(exc)})


@app.exception_handler(ConflictError)
def handle_conflict_error(_: Request, exc: ConflictError) -> JSONResponse:
    return JSONResponse(status_code=409, content={"detail": str(exc)})


@app.exception_handler(AuthenticationError)
def handle_authentication_error(_: Request, exc: AuthenticationError) -> JSONResponse:
    return JSONResponse(
        status_code=401,
        content={"detail": str(exc)},
        headers={"WWW-Authenticate": "Bearer"},
    )


@app.exception_handler(PermissionDeniedError)
def handle_permission_denied_error(_: Request, exc: PermissionDeniedError) -> JSONResponse:
    return JSONResponse(status_code=403, content={"detail": str(exc)})


@app.exception_handler(NotFoundError)
def handle_not_found_error(_: Request, exc: NotFoundError) -> JSONResponse:
    return JSONResponse(status_code=404, content={"detail": str(exc)})


@app.exception_handler(StateError)
def handle_state_error(_: Request, exc: StateError) -> JSONResponse:
    return JSONResponse(status_code=500, content={"detail": str(exc)})


@app.exception_handler(IntegrityError)
def handle_integrity_error(_: Request, __: IntegrityError) -> JSONResponse:
    return JSONResponse(status_code=409, content={"detail": "Integrity error"})


def _get_or_404(db: Session, model: type, **filters):
    instance = db.query(model).filter_by(**filters).first()
    if instance is None:
        raise NotFoundError(f"{model.__name__} not found")
    return instance


def _parse_enum(enum_cls: type, value: str | None, field_name: str):
    if value is None:
        return None
    try:
        return enum_cls(value)
    except ValueError as exc:
        raise ValidationError(f"Invalid {field_name}") from exc


def _parse_task_type(value: str | None) -> TaskType | None:
    if value is None:
        return None
    normalized = value.lower()
    if normalized == "onetime":
        normalized = "one_time"
    return _parse_enum(TaskType, normalized, "task_type")


def _auth_payload(account: Account, user: User) -> AuthResponse:
    return AuthResponse(
        account_id=str(account.id),
        user_id=str(user.id),
        email=account.email,
        username=user.username,
        photo_url=user.photoUrl,
        access_token=create_access_token(user_id=user.id, account_id=account.id),
        token_type="bearer",
    )


# ----------------------------------------------------------------------------
# Auth (publiczne — wydają token)
# ----------------------------------------------------------------------------
@app.post("/auth/register", status_code=201, response_model=AuthResponse)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    account = Account()
    with transaction(db):
        account.register(
            db_session=db,
            email=payload.email,
            username=payload.username,
            password=payload.password,
        )
        account.createUser(db_session=db, username=payload.username, photoUrl=payload.photo_url)
        user = account.user
        if user is None:
            raise StateError("User profile was not created")

    return _auth_payload(account=account, user=user)


@app.post("/auth/login", response_model=AuthResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    account = Account()
    with transaction(db):
        account.login(db_session=db, email=payload.email, password=payload.password)
        user = db.query(User).filter_by(accountID=account.id).first()
        if user is None:
            raise NotFoundError("User profile not found")

    return _auth_payload(account=account, user=user)


@app.post("/auth/password", response_model=MessageResponse)
def change_password(
    payload: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    account = current_user.account
    if account is None or account.email != payload.email:
        raise PermissionDeniedError("Cannot change another account's password")

    with transaction(db):
        account.changePassword(
            db_session=db,
            old_password=payload.old_password,
            new_password=payload.new_password,
        )

    return MessageResponse(message="password updated")


@app.post("/accounts/{account_id}/delete", response_model=MessageResponse)
def delete_account(
    account_id: UUID,
    payload: DeleteAccountRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.accountID != account_id:
        raise PermissionDeniedError("Cannot delete another account")
    account = _get_or_404(db, Account, id=account_id)
    with transaction(db):
        account.deleteAccount(password=payload.password, db_session=db)

    return MessageResponse(message="account_deleted")


# ----------------------------------------------------------------------------
# User-scoped actions (wymagają tokenu == user_id)
# ----------------------------------------------------------------------------
@app.patch("/users/{user_id}/profile", response_model=MessageResponse)
def update_profile(
    user_id: UUID,
    payload: UserProfileUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    assert_self(user_id, current_user)
    user = _get_or_404(db, User, id=user_id)
    with transaction(db):
        user.editProfile(db_session=db, username=payload.username, photoUrl=payload.photo_url)

    return MessageResponse(message="profile_updated")


@app.post("/users/{user_id}/friends/invitations", response_model=MessageResponse)
def invite_friend(
    user_id: UUID,
    payload: InviteFriendRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    assert_self(user_id, current_user)
    user = _get_or_404(db, User, id=user_id)
    with transaction(db):
        user.inviteFriend(db_session=db, friend_id=payload.friend_id)

    return MessageResponse(message="invitation_sent")


@app.post("/users/{user_id}/notifications", response_model=MessageResponse)
def create_notification(
    user_id: UUID,
    payload: NotifyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    assert_self(user_id, current_user)
    user = _get_or_404(db, User, id=user_id)
    with transaction(db):
        user.notify(db_session=db, message=payload.message)

    return MessageResponse(message="notification_created")


@app.post("/users/{user_id}/taskgroups", status_code=201, response_model=TaskGroupResponse)
def create_taskgroup(
    user_id: UUID,
    payload: CreateGroupRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    assert_self(user_id, current_user)
    user = _get_or_404(db, User, id=user_id)
    privacy = _parse_enum(PrivacyLevel, payload.privacy, "privacy") or PrivacyLevel.PUBLIC
    group_type = _parse_enum(TaskGroupType, payload.type, "type") or TaskGroupType.COMPETITIVE

    with transaction(db):
        group = user.createGroup(
            db_session=db,
            name=payload.name,
            privacy=privacy,
            isBingo=payload.is_bingo,
            type=group_type,
        )

    return TaskGroupResponse(
        id=str(group.id),
        name=group.name,
        privacy=group.privacy.value if group.privacy else None,
        type=group.type.value if group.type else None,
        is_bingo=group.isBingo,
        task_count=group.taskCount,
        invite_code=group.inviteCode,
    )


@app.delete("/friendships/{user_one_id}/{user_two_id}", response_model=MessageResponse)
def delete_friendship(
    user_one_id: UUID,
    user_two_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.id not in (user_one_id, user_two_id):
        raise PermissionDeniedError("Cannot delete a friendship you are not part of")
    friendship = db.query(Friendship).filter(
        ((Friendship.userOneID == user_one_id) & (Friendship.userTwoID == user_two_id))
        | ((Friendship.userOneID == user_two_id) & (Friendship.userTwoID == user_one_id))
    ).first()
    if friendship is None:
        raise NotFoundError("Friendship not found")

    with transaction(db):
        friendship.deleteFriend(db_session=db)

    return MessageResponse(message="friendship_deleted")


def _get_invitation(db: Session, from_user_id: UUID, to_user_id: UUID) -> Invitation:
    invitation = db.query(Invitation).filter_by(
        fromUserID=from_user_id,
        toUserID=to_user_id,
    ).first()
    if invitation is None:
        raise NotFoundError("Invitation not found")
    return invitation


@app.post("/invitations/{from_user_id}/{to_user_id}/accept", response_model=MessageResponse)
def accept_invitation(
    from_user_id: UUID,
    to_user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    assert_self(to_user_id, current_user)  # tylko adresat akceptuje
    invitation = _get_invitation(db, from_user_id, to_user_id)
    with transaction(db):
        invitation.accept(db_session=db)

    return MessageResponse(message="invitation_accepted")


@app.post("/invitations/{from_user_id}/{to_user_id}/reject", response_model=MessageResponse)
def reject_invitation(
    from_user_id: UUID,
    to_user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    assert_self(to_user_id, current_user)  # tylko adresat odrzuca
    invitation = _get_invitation(db, from_user_id, to_user_id)
    with transaction(db):
        invitation.reject(db_session=db)

    return MessageResponse(message="invitation_rejected")


@app.post("/invitations/{from_user_id}/{to_user_id}/cancel", response_model=MessageResponse)
def cancel_invitation(
    from_user_id: UUID,
    to_user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    assert_self(from_user_id, current_user)  # tylko nadawca anuluje
    invitation = _get_invitation(db, from_user_id, to_user_id)
    with transaction(db):
        invitation.cancel(db_session=db)

    return MessageResponse(message="invitation_canceled")


@app.post("/notifications/{notification_id}/read", response_model=MessageResponse)
def read_notification(
    notification_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notification = _get_or_404(db, Notification, id=notification_id)
    if notification.userID != current_user.id:
        raise PermissionDeniedError("Not your notification")
    with transaction(db):
        notification.read(db_session=db)

    return MessageResponse(message="notification_read")


@app.patch("/users/{user_id}/taskgroups/{group_id}", response_model=MessageResponse)
def edit_taskgroup(
    user_id: UUID,
    group_id: UUID,
    payload: TaskGroupEditRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    assert_self(user_id, current_user)
    group = _get_or_404(db, TaskGroup, id=group_id)
    privacy = _parse_enum(PrivacyLevel, payload.privacy, "privacy") if payload.privacy else None

    with transaction(db):
        group.edit(db_session=db, user_id=user_id, name=payload.name, privacy=privacy)

    return MessageResponse(message="taskgroup_updated")


@app.delete("/users/{user_id}/taskgroups/{group_id}", response_model=MessageResponse)
def delete_taskgroup(
    user_id: UUID,
    group_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    assert_self(user_id, current_user)
    group = _get_or_404(db, TaskGroup, id=group_id)
    with transaction(db):
        group.delete(db_session=db, user_id=user_id)

    return MessageResponse(message="taskgroup_deleted")


@app.post("/users/{user_id}/taskgroups/{group_id}/members", response_model=MessageResponse)
def add_taskgroup_member(
    user_id: UUID,
    group_id: UUID,
    payload: TaskGroupAddFriendRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    assert_self(user_id, current_user)
    group = _get_or_404(db, TaskGroup, id=group_id)
    role = _parse_enum(GroupRole, payload.role, "role")

    with transaction(db):
        group.addFriend(db_session=db, user_id=user_id, friend_id=payload.friend_id, role=role)

    return MessageResponse(message="member_added")


@app.post("/users/{user_id}/taskgroups/{group_id}/type", response_model=MessageResponse)
def change_taskgroup_type(
    user_id: UUID,
    group_id: UUID,
    payload: TaskGroupChangeTypeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    assert_self(user_id, current_user)
    group = _get_or_404(db, TaskGroup, id=group_id)
    new_type = _parse_enum(TaskGroupType, payload.new_type, "type")

    with transaction(db):
        group.changeGroupType(db_session=db, user_id=user_id, new_type=new_type)

    return MessageResponse(message="taskgroup_type_updated")


@app.post("/users/{user_id}/taskgroups/{group_id}/tasks", status_code=201, response_model=TaskResponse)
def create_task(
    user_id: UUID,
    group_id: UUID,
    payload: TaskCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    assert_self(user_id, current_user)
    group = _get_or_404(db, TaskGroup, id=group_id)
    task_type = _parse_task_type(payload.task_type)
    frequency = _parse_enum(TimeInterval, payload.frequency, "frequency") if payload.frequency else None

    with transaction(db):
        task = group.createTask(
            db_session=db,
            user_id=user_id,
            type=task_type,
            name=payload.name,
            description=payload.description,
            goal=payload.goal,
            unit=payload.unit,
            deadline=payload.deadline,
            frequency=frequency,
            photoRequired=payload.photo_required,
            color=payload.color,
            notifications=payload.notifications,
        )

    return TaskResponse(
        id=str(task.id),
        name=task.name,
        description=task.description,
        goal=task.goal,
        unit=task.unit,
        type=task.type.value if isinstance(task.type, TaskType) else task.type,
        group_id=str(task.groupID),
        owner_id=str(task.ownerID) if task.ownerID else None,
    )


@app.patch("/users/{user_id}/tasks/{task_id}", response_model=MessageResponse)
def edit_task(
    user_id: UUID,
    task_id: UUID,
    payload: TaskEditRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    assert_self(user_id, current_user)
    task = _get_or_404(db, Task, id=task_id)
    with transaction(db):
        task.edit(
            db_session=db,
            user_id=user_id,
            name=payload.name,
            description=payload.description,
            goal=payload.goal,
        )

    return MessageResponse(message="task_updated")


@app.delete("/users/{user_id}/tasks/{task_id}", response_model=MessageResponse)
def delete_task(
    user_id: UUID,
    task_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    assert_self(user_id, current_user)
    task = _get_or_404(db, Task, id=task_id)
    with transaction(db):
        task.delete(db_session=db, user_id=user_id)

    return MessageResponse(message="task_deleted")


@app.post("/users/{user_id}/tasks/{task_id}/type", response_model=MessageResponse)
def change_task_type(
    user_id: UUID,
    task_id: UUID,
    payload: TaskChangeTypeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    assert_self(user_id, current_user)
    task = _get_or_404(db, Task, id=task_id)
    new_type = _parse_task_type(payload.new_type)

    with transaction(db):
        task.changeTaskType(db_session=db, user_id=user_id, new_type=new_type)

    return MessageResponse(message="task_type_updated")


@app.post("/users/{user_id}/groupmembers/{member_id}/role", response_model=MessageResponse)
def change_groupmember_role(
    user_id: UUID,
    member_id: UUID,
    payload: GroupMemberChangeRoleRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    assert_self(user_id, current_user)
    member = _get_or_404(db, GroupMember, id=member_id)
    new_role = _parse_enum(GroupRole, payload.new_role, "role")

    with transaction(db):
        member.changePermissions(db_session=db, new_role=new_role, by_user_id=user_id)

    return MessageResponse(message="member_role_updated")


@app.post("/users/{user_id}/groupmembers/{member_id}/remove", response_model=MessageResponse)
def remove_groupmember(
    user_id: UUID,
    member_id: UUID,
    payload: GroupMemberRemoveRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    assert_self(user_id, current_user)
    member = _get_or_404(db, GroupMember, id=member_id)
    with transaction(db):
        member.removeMember(db_session=db, take_progress=payload.take_progress, punisher=user_id)

    return MessageResponse(message="member_removed")


@app.post("/users/{user_id}/task-progress/{progress_id}/update", response_model=MessageResponse)
def update_task_progress(
    user_id: UUID,
    progress_id: UUID,
    payload: TaskProgressUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    assert_self(user_id, current_user)
    progress = _get_or_404(db, TaskProgress, id=progress_id)

    with transaction(db):
        progress.updateProgress(
            db_session=db,
            delta_value=payload.delta_value,
            user_id=user_id,
            message=payload.message,
            photoUrl=payload.photo_url,
        )

    return MessageResponse(message="task_progress_updated")


@app.patch("/task-params/{task_id}", response_model=MessageResponse)
def edit_task_params(
    task_id: UUID,
    payload: TaskParamsEditRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    params = _get_or_404(db, TaskParams, taskID=task_id)
    with transaction(db):
        params.edit(
            db_session=db,
            user_id=current_user.id,
            photoRequired=payload.photo_required,
            color=payload.color,
            notifications=payload.notifications,
        )

    return MessageResponse(message="task_params_updated")


@app.get("/progress-entries/{entry_id}/validate", response_model=ProgressValidationResponse)
def validate_progress_entry(
    entry_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    entry = _get_or_404(db, ProgressEntry, id=entry_id)
    return ProgressValidationResponse(is_valid=entry.validate(db_session=db))


@app.delete("/users/{user_id}/progress-entries/{entry_id}", response_model=MessageResponse)
def delete_progress_entry(
    user_id: UUID,
    entry_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    assert_self(user_id, current_user)
    entry = _get_or_404(db, ProgressEntry, id=entry_id)
    with transaction(db):
        entry.delete(db_session=db, user_id=user_id)

    return MessageResponse(message="progress_entry_deleted")


@app.post("/users/{user_id}/progress-entries/{entry_id}/comments", response_model=MessageResponse)
def add_progress_comment(
    user_id: UUID,
    entry_id: UUID,
    payload: ProgressEntryCommentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    assert_self(user_id, current_user)
    entry = _get_or_404(db, ProgressEntry, id=entry_id)
    with transaction(db):
        entry.addComment(db_session=db, user_id=user_id, message=payload.message)

    return MessageResponse(message="comment_added")


@app.delete("/users/{user_id}/comments/{comment_id}", response_model=MessageResponse)
def delete_comment(
    user_id: UUID,
    comment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    assert_self(user_id, current_user)
    comment = _get_or_404(db, Comment, id=comment_id)
    with transaction(db):
        comment.deleteComment(db_session=db, user_id=user_id)

    return MessageResponse(message="comment_deleted")
