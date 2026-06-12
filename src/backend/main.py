from uuid import UUID

from fastapi import Depends, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from src.backend.basics import router as basics_router
from src.backend.database import get_db
from src.backend.exceptions import *
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


@app.exception_handler(ValidationError)
def handle_validation_error(_: Request, exc: ValidationError) -> JSONResponse:
    return JSONResponse(status_code=400, content={"detail": str(exc)})


@app.exception_handler(ConflictError)
def handle_conflict_error(_: Request, exc: ConflictError) -> JSONResponse:
    return JSONResponse(status_code=409, content={"detail": str(exc)})


@app.exception_handler(AuthenticationError)
def handle_authentication_error(_: Request, exc: AuthenticationError) -> JSONResponse:
    return JSONResponse(status_code=401, content={"detail": str(exc)})


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
    )


@app.post("/auth/register", status_code=201, response_model=AuthResponse)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    account = Account()
    try:
        account.register(
            db_session=db,
            email=payload.email,
            username=payload.username,
            password=payload.password,
        )
        account.createUser(db_session=db, username=payload.username, photoUrl=payload.photo_url)
        db.commit()
        user = db.query(User).filter_by(accountID=account.id).first()
        if user is None:
            raise StateError("User profile was not created")
    except AppError:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise

    return _auth_payload(account=account, user=user)


@app.post("/auth/login", response_model=AuthResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    account = Account()
    try:
        account.login(db_session=db, email=payload.email, password=payload.password)
        db.commit()
        user = db.query(User).filter_by(accountID=account.id).first()
        if user is None:
            raise NotFoundError("User profile not found")
    except AppError:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise

    return _auth_payload(account=account, user=user)


@app.post("/auth/password", response_model=MessageResponse)
def change_password(payload: ChangePasswordRequest, db: Session = Depends(get_db)):
    account = db.query(Account).filter_by(email=payload.email).first()
    if account is None:
        raise NotFoundError("Account does not exist")

    try:
        account.changePassword(
            db_session=db,
            old_password=payload.old_password,
            new_password=payload.new_password,
        )
        db.commit()
    except AppError:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise

    return MessageResponse(message="password updated")


@app.post("/accounts/{account_id}/delete", response_model=MessageResponse)
def delete_account(account_id: UUID, payload: DeleteAccountRequest, db: Session = Depends(get_db)):
    account = _get_or_404(db, Account, id=account_id)
    try:
        account.deleteAccount(password=payload.password, db_session=db)
        db.commit()
    except AppError:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise

    return MessageResponse(message="account_deleted")


@app.patch("/users/{user_id}/profile", response_model=MessageResponse)
def update_profile(user_id: UUID, payload: UserProfileUpdateRequest, db: Session = Depends(get_db)):
    user = _get_or_404(db, User, id=user_id)
    try:
        user.editProfile(db_session=db, username=payload.username, photoUrl=payload.photo_url)
        db.commit()
    except AppError:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise

    return MessageResponse(message="profile_updated")


@app.post("/users/{user_id}/friends/invitations", response_model=MessageResponse)
def invite_friend(user_id: UUID, payload: InviteFriendRequest, db: Session = Depends(get_db)):
    user = _get_or_404(db, User, id=user_id)
    try:
        user.inviteFriend(db_session=db, friend_id=payload.friend_id)
        db.commit()
    except AppError:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise

    return MessageResponse(message="invitation_sent")


@app.post("/users/{user_id}/notifications", response_model=MessageResponse)
def create_notification(user_id: UUID, payload: NotifyRequest, db: Session = Depends(get_db)):
    user = _get_or_404(db, User, id=user_id)
    try:
        user.notify(db_session=db, message=payload.message)
        db.commit()
    except AppError:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise

    return MessageResponse(message="notification_created")


@app.post("/users/{user_id}/taskgroups", status_code=201, response_model=TaskGroupResponse)
def create_taskgroup(user_id: UUID, payload: CreateGroupRequest, db: Session = Depends(get_db)):
    user = _get_or_404(db, User, id=user_id)
    privacy = _parse_enum(PrivacyLevel, payload.privacy, "privacy") or PrivacyLevel.PUBLIC
    group_type = _parse_enum(TaskGroupType, payload.type, "type") or TaskGroupType.TASK_GROUP

    try:
        user.createGroup(
            db_session=db,
            name=payload.name,
            privacy=privacy,
            isBingo=payload.is_bingo,
            type=group_type,
        )
        db.commit()
    except AppError:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise

    group = (
        db.query(TaskGroup)
        .filter_by(ownerID=user.id)
        .order_by(TaskGroup.createdAt.desc())
        .first()
    )
    if group is None:
        raise StateError("Task group was not created")

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
def delete_friendship(user_one_id: UUID, user_two_id: UUID, db: Session = Depends(get_db)):
    friendship = db.query(Friendship).filter(
        ((Friendship.userOneID == user_one_id) & (Friendship.userTwoID == user_two_id))
        | ((Friendship.userOneID == user_two_id) & (Friendship.userTwoID == user_one_id))
    ).first()
    if friendship is None:
        raise NotFoundError("Friendship not found")

    try:
        friendship.deleteFriend(db_session=db)
        db.commit()
    except AppError:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise

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
def accept_invitation(from_user_id: UUID, to_user_id: UUID, db: Session = Depends(get_db)):
    invitation = _get_invitation(db, from_user_id, to_user_id)
    try:
        invitation.accept(db_session=db)
        db.commit()
    except AppError:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise

    return MessageResponse(message="invitation_accepted")


@app.post("/invitations/{from_user_id}/{to_user_id}/reject", response_model=MessageResponse)
def reject_invitation(from_user_id: UUID, to_user_id: UUID, db: Session = Depends(get_db)):
    invitation = _get_invitation(db, from_user_id, to_user_id)
    try:
        invitation.reject(db_session=db)
        db.commit()
    except AppError:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise

    return MessageResponse(message="invitation_rejected")


@app.post("/invitations/{from_user_id}/{to_user_id}/cancel", response_model=MessageResponse)
def cancel_invitation(from_user_id: UUID, to_user_id: UUID, db: Session = Depends(get_db)):
    invitation = _get_invitation(db, from_user_id, to_user_id)
    try:
        invitation.cancel(db_session=db)
        db.commit()
    except AppError:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise

    return MessageResponse(message="invitation_canceled")


@app.post("/notifications/{notification_id}/read", response_model=MessageResponse)
def read_notification(notification_id: UUID, db: Session = Depends(get_db)):
    notification = _get_or_404(db, Notification, id=notification_id)
    try:
        notification.read(db_session=db)
        db.commit()
    except AppError:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise

    return MessageResponse(message="notification_read")


@app.patch("/users/{user_id}/taskgroups/{group_id}", response_model=MessageResponse)
def edit_taskgroup(user_id: UUID, group_id: UUID, payload: TaskGroupEditRequest, db: Session = Depends(get_db)):
    group = _get_or_404(db, TaskGroup, id=group_id)
    privacy = _parse_enum(PrivacyLevel, payload.privacy, "privacy") if payload.privacy else None

    try:
        group.edit(db_session=db, user_id=user_id, name=payload.name, privacy=privacy, isBingo=payload.is_bingo)
        db.commit()
    except AppError:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise

    return MessageResponse(message="taskgroup_updated")


@app.delete("/users/{user_id}/taskgroups/{group_id}", response_model=MessageResponse)
def delete_taskgroup(user_id: UUID, group_id: UUID, db: Session = Depends(get_db)):
    group = _get_or_404(db, TaskGroup, id=group_id)
    try:
        group.delete(db_session=db, user_id=user_id)
        db.commit()
    except AppError:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise

    return MessageResponse(message="taskgroup_deleted")


@app.post("/users/{user_id}/taskgroups/{group_id}/members", response_model=MessageResponse)
def add_taskgroup_member(
    user_id: UUID,
    group_id: UUID,
    payload: TaskGroupAddFriendRequest,
    db: Session = Depends(get_db),
):
    group = _get_or_404(db, TaskGroup, id=group_id)
    role = _parse_enum(GroupRole, payload.role, "role")

    try:
        group.addFriend(db_session=db, user_id=user_id, friend_id=payload.friend_id, role=role)
        db.commit()
    except AppError:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise

    return MessageResponse(message="member_added")


@app.post("/users/{user_id}/taskgroups/{group_id}/type", response_model=MessageResponse)
def change_taskgroup_type(
    user_id: UUID,
    group_id: UUID,
    payload: TaskGroupChangeTypeRequest,
    db: Session = Depends(get_db),
):
    group = _get_or_404(db, TaskGroup, id=group_id)
    new_type = _parse_enum(TaskGroupType, payload.new_type, "type")

    try:
        group.changeGroupType(db_session=db, user_id=user_id, new_type=new_type)
        db.commit()
    except AppError:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise

    return MessageResponse(message="taskgroup_type_updated")


@app.post("/users/{user_id}/taskgroups/{group_id}/tasks", status_code=201, response_model=TaskResponse)
def create_task(
    user_id: UUID,
    group_id: UUID,
    payload: TaskCreateRequest,
    db: Session = Depends(get_db),
):
    group = _get_or_404(db, TaskGroup, id=group_id)
    task_type = _parse_task_type(payload.task_type)
    frequency = _parse_enum(TimeInterval, payload.frequency, "frequency") if payload.frequency else None

    try:
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
        db.commit()
    except AppError:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise

    if task is None:
        raise StateError("Task was not created")

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
def edit_task(user_id: UUID, task_id: UUID, payload: TaskEditRequest, db: Session = Depends(get_db)):
    task = _get_or_404(db, Task, id=task_id)
    try:
        task.edit(
            db_session=db,
            user_id=user_id,
            name=payload.name,
            description=payload.description,
            goal=payload.goal,
        )
        db.commit()
    except AppError:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise

    return MessageResponse(message="task_updated")


@app.delete("/users/{user_id}/tasks/{task_id}", response_model=MessageResponse)
def delete_task(user_id: UUID, task_id: UUID, db: Session = Depends(get_db)):
    task = _get_or_404(db, Task, id=task_id)
    try:
        task.delete(db_session=db, user_id=user_id)
        db.commit()
    except AppError:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise

    return MessageResponse(message="task_deleted")


@app.post("/users/{user_id}/tasks/{task_id}/type", response_model=MessageResponse)
def change_task_type(user_id: UUID, task_id: UUID, payload: TaskChangeTypeRequest, db: Session = Depends(get_db)):
    task = _get_or_404(db, Task, id=task_id)
    new_type = _parse_task_type(payload.new_type)

    try:
        task.changeTaskType(db_session=db, user_id=user_id, new_type=new_type)
        db.commit()
    except AppError:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise

    return MessageResponse(message="task_type_updated")


@app.post("/users/{user_id}/groupmembers/{member_id}/role", response_model=MessageResponse)
def change_groupmember_role(
    user_id: UUID,
    member_id: UUID,
    payload: GroupMemberChangeRoleRequest,
    db: Session = Depends(get_db),
):
    member = _get_or_404(db, GroupMember, id=member_id)
    new_role = _parse_enum(GroupRole, payload.new_role, "role")

    try:
        member.changePermissions(db_session=db, new_role=new_role, by_user_id=user_id)
        db.commit()
    except AppError:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise

    return MessageResponse(message="member_role_updated")


@app.post("/users/{user_id}/groupmembers/{member_id}/remove", response_model=MessageResponse)
def remove_groupmember(
    user_id: UUID,
    member_id: UUID,
    payload: GroupMemberRemoveRequest,
    db: Session = Depends(get_db),
):
    member = _get_or_404(db, GroupMember, id=member_id)
    try:
        member.removeMember(db_session=db, take_progress=payload.take_progress, punisher=user_id)
        db.commit()
    except AppError:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise

    return MessageResponse(message="member_removed")


@app.post("/users/{user_id}/task-progress/{progress_id}/update", response_model=MessageResponse)
def update_task_progress(
    user_id: UUID,
    progress_id: UUID,
    payload: TaskProgressUpdateRequest,
    db: Session = Depends(get_db),
):
    progress = _get_or_404(db, TaskProgress, id=progress_id)

    try:
        progress.updateProgress(
            db_session=db,
            delta_value=payload.delta_value,
            user_id=user_id,
            message=payload.message,
            photoUrl=payload.photo_url,
        )
        db.commit()
    except AppError:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise

    return MessageResponse(message="task_progress_updated")


@app.patch("/task-params/{task_id}", response_model=MessageResponse)
def edit_task_params(task_id: UUID, payload: TaskParamsEditRequest, db: Session = Depends(get_db)):
    params = _get_or_404(db, TaskParams, taskID=task_id)
    try:
        params.edit(
            db_session=db,
            photoRequired=payload.photo_required,
            color=payload.color,
            notifications=payload.notifications,
        )
        db.commit()
    except AppError:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise

    return MessageResponse(message="task_params_updated")


@app.get("/progress-entries/{entry_id}/validate", response_model=ProgressValidationResponse)
def validate_progress_entry(entry_id: UUID, db: Session = Depends(get_db)):
    entry = _get_or_404(db, ProgressEntry, id=entry_id)
    return ProgressValidationResponse(is_valid=entry.validate(db_session=db))


@app.delete("/progress-entries/{entry_id}", response_model=MessageResponse)
def delete_progress_entry(entry_id: UUID, db: Session = Depends(get_db)):
    entry = _get_or_404(db, ProgressEntry, id=entry_id)
    try:
        entry.delete(db_session=db)
        db.commit()
    except AppError:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise

    return MessageResponse(message="progress_entry_deleted")


@app.post("/users/{user_id}/progress-entries/{entry_id}/comments", response_model=MessageResponse)
def add_progress_comment(
    user_id: UUID,
    entry_id: UUID,
    payload: ProgressEntryCommentRequest,
    db: Session = Depends(get_db),
):
    entry = _get_or_404(db, ProgressEntry, id=entry_id)
    try:
        entry.addComment(db_session=db, user_id=user_id, message=payload.message)
        db.commit()
    except AppError:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise

    return MessageResponse(message="comment_added")


@app.delete("/comments/{comment_id}", response_model=MessageResponse)
def delete_comment(comment_id: UUID, db: Session = Depends(get_db)):
    comment = _get_or_404(db, Comment, id=comment_id)
    try:
        comment.deleteComment(db_session=db)
        db.commit()
    except AppError:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise

    return MessageResponse(message="comment_deleted")
