from datetime import datetime, timedelta
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from src.backend.auth import get_current_user
from src.backend.database import get_db, transaction
from src.backend.exceptions import ConflictError, NotFoundError, ValidationError
from src.backend.models import (
    ChallengeTask,
    Comment,
    Friendship,
    GroupMember,
    GroupRole,
    Invitation,
    Notification,
    OneTimeTask,
    ProgressEntry,
    RepeatableTaskProgress,
    EndlessTaskProgress,
    OneTimeTaskProgress,
    ChallengeTaskProgress,
    Task,
    TaskGroup,
    TaskProgress,
    TaskStatus,
    TaskType,
    TaskGroupType,
    TaskParams,
    PrivacyLevel,
    User,
)
from src.backend.response import (
    CommentListResponse,
    CommentSummaryResponse,
    FriendsListResponse,
    GroupMemberListResponse,
    GroupMemberSummaryResponse,
    InvitationListResponse,
    InvitationSummaryResponse,
    MessageResponse,
    NotificationListResponse,
    NotificationSummaryResponse,
    ProgressEntryListResponse,
    ProgressEntrySummaryResponse,
    TaskGroupListResponse,
    TaskGroupResponse,
    TaskListResponse,
    TaskDetailResponse,
    TaskParamsResponse,
    TaskProgressListResponse,
    TaskProgressSummaryResponse,
    TaskResponse,
    UserSummaryResponse,
    UserFeedResponse,
    FeedItemResponse,
    UserStatsResponse,
    RepeatableStreakResponse,
)

# Wszystkie odczyty wymagają zalogowania (ważny token Bearer).
router = APIRouter(prefix="", tags=["basics"], dependencies=[Depends(get_current_user)])


def _user_payload(user: User) -> UserSummaryResponse:
    return UserSummaryResponse(
        id=str(user.id),
        username=user.username,
        photo_url=user.photoUrl,
    )


def _task_payload(task: Task) -> TaskResponse:
    return TaskResponse(
        id=str(task.id),
        name=task.name,
        description=task.description,
        goal=task.goal,
        unit=task.unit,
        type=task.type.value if hasattr(task.type, "value") else task.type,
        group_id=str(task.groupID),
        owner_id=str(task.ownerID) if task.ownerID else None,
    )


def _task_params_payload(params: TaskParams) -> TaskParamsResponse:
    return TaskParamsResponse(
        photo_required=params.photoRequired,
        color=params.color,
        notifications=params.notifications,
    )


@router.get("/users/{user_id}/friends", response_model=FriendsListResponse)
def list_user_friends(user_id: UUID, db: Session = Depends(get_db)):
    user = db.query(User).filter_by(id=user_id).first()
    if user is None:
        raise NotFoundError("User not found")

    friendships = db.query(Friendship).filter(
        (Friendship.userOneID == user.id) | (Friendship.userTwoID == user.id)
    ).all()
    friend_ids = [
        f.userTwoID if f.userOneID == user.id else f.userOneID
        for f in friendships
    ]
    friends = []
    if friend_ids:
        friends = db.query(User).filter(User.id.in_(friend_ids)).all()

    return FriendsListResponse(
        count=len(friends),
        items=[_user_payload(friend) for friend in friends],
    )


@router.get("/users/{user_id}", response_model=UserSummaryResponse)
def get_user(user_id: UUID, db: Session = Depends(get_db)):
    user = db.query(User).filter_by(id=user_id).first()
    if user is None:
        raise NotFoundError("User not found")

    return _user_payload(user)


@router.get("/users/{user_id}/taskgroups", response_model=TaskGroupListResponse)
def list_user_taskgroups(user_id: UUID, db: Session = Depends(get_db)):
    user = db.query(User).filter_by(id=user_id).first()
    if user is None:
        raise NotFoundError("User not found")

    rows = (
        db.query(GroupMember, TaskGroup)
        .join(TaskGroup, GroupMember.groupID == TaskGroup.id)
        .filter(GroupMember.userID == user.id, GroupMember.active.is_(True))
        .all()
    )

    items: list[dict] = []
    for member, group in rows:
        items.append(
            {
                "group_id": str(group.id),
                "name": group.name,
                "privacy": group.privacy.value if group.privacy else None,
                "type": group.type.value if group.type else None,
                "role": member.role.value if member.role else None,
                "is_bingo": group.isBingo,
                "task_count": group.taskCount,
            }
        )

    return TaskGroupListResponse(
        count=len(items),
        items=items,
    )


@router.get("/taskgroups/{group_id}", response_model=TaskGroupResponse)
def get_taskgroup(group_id: UUID, db: Session = Depends(get_db)):
    group = db.query(TaskGroup).filter_by(id=group_id).first()
    if group is None:
        raise NotFoundError("TaskGroup not found")

    return TaskGroupResponse(
        id=str(group.id),
        name=group.name,
        privacy=group.privacy.value if group.privacy else None,
        type=group.type.value if group.type else None,
        is_bingo=group.isBingo,
        task_count=group.taskCount,
        invite_code=group.inviteCode,
    )


@router.get("/tasks/{task_id}", response_model=TaskDetailResponse)
def get_task(task_id: UUID, db: Session = Depends(get_db)):
    task = db.query(Task).filter_by(id=task_id).first()
    if task is None:
        raise NotFoundError("Task not found")

    params = task.params
    return TaskDetailResponse(
        task=_task_payload(task),
        params=_task_params_payload(params) if params else None,
    )


@router.get("/task-params/{task_id}", response_model=TaskParamsResponse)
def get_task_params(task_id: UUID, db: Session = Depends(get_db)):
    params = db.query(TaskParams).filter_by(taskID=task_id).first()
    if params is None:
        raise NotFoundError("TaskParams not found")

    return _task_params_payload(params)


@router.get("/users/search", response_model=FriendsListResponse)
def search_users(
    q: str = Query(min_length=1),
    exclude_user_id: UUID | None = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(User).filter(User.username.ilike(f"%{q}%"))
    if exclude_user_id is not None:
        query = query.filter(User.id != exclude_user_id)

    users = query.order_by(User.username.asc()).limit(limit).all()
    return FriendsListResponse(
        count=len(users),
        items=[_user_payload(user) for user in users],
    )


@router.get("/taskgroups/search", response_model=TaskGroupListResponse)
def search_taskgroups(
    q: str = Query(min_length=1),
    privacy: str | None = Query(default="public"),
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(TaskGroup).filter(TaskGroup.name.ilike(f"%{q}%"))

    if privacy is not None:
        try:
            privacy_value = PrivacyLevel(privacy)
        except ValueError as exc:
            raise ValidationError("Invalid privacy") from exc
        query = query.filter(TaskGroup.privacy == privacy_value)

    groups = query.order_by(TaskGroup.name.asc()).limit(limit).all()
    items = [
        {
            "group_id": str(group.id),
            "name": group.name,
            "privacy": group.privacy.value if group.privacy else None,
            "type": group.type.value if group.type else None,
            "role": None,
            "is_bingo": group.isBingo,
            "task_count": group.taskCount,
        }
        for group in groups
    ]

    return TaskGroupListResponse(count=len(items), items=items)


@router.post("/taskgroups/join/{invite_code}", response_model=MessageResponse)
def join_taskgroup(
    invite_code: str,
    user_id: UUID = Query(...),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter_by(id=user_id).first()
    if user is None:
        raise NotFoundError("User not found")

    group = db.query(TaskGroup).filter_by(inviteCode=invite_code).first()
    if group is None:
        raise NotFoundError("TaskGroup not found")

    member = db.query(GroupMember).filter_by(groupID=group.id, userID=user.id).first()
    if member is not None and member.active:
        raise ConflictError("User is already a member of this group")

    with transaction(db):
        if member is None:
            member = GroupMember()
            member.groupID = group.id
            member.userID = user.id
            member.role = GroupRole.MEMBER
            db.add(member)
            db.flush()
        else:
            member.active = True
            member.role = GroupRole.MEMBER

        group_type = group.type if isinstance(group.type, TaskGroupType) else TaskGroupType(group.type)
        if group_type == TaskGroupType.COMPETITIVE:
            tasks = db.query(Task).filter_by(groupID=group.id).all()
            for task in tasks:
                existing = db.query(TaskProgress).filter_by(
                    groupMemberID=member.id,
                    taskID=task.id,
                ).first()
                if existing is not None:
                    continue
                task_type = task.type if isinstance(task.type, TaskType) else TaskType(task.type)
                if task_type == TaskType.ENDLESS:
                    progress = EndlessTaskProgress()
                elif task_type == TaskType.ONE_TIME:
                    progress = OneTimeTaskProgress()
                elif task_type == TaskType.REPEATABLE:
                    progress = RepeatableTaskProgress()
                else:
                    progress = ChallengeTaskProgress()
                progress.groupMemberID = member.id
                progress.taskID = task.id
                progress.type = task_type.value
                db.add(progress)

    return MessageResponse(message="group_joined")


@router.get("/users/{user_id}/feed", response_model=UserFeedResponse)
def user_feed(
    user_id: UUID,
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter_by(id=user_id).first()
    if user is None:
        raise NotFoundError("User not found")

    friendships = db.query(Friendship).filter(
        (Friendship.userOneID == user.id) | (Friendship.userTwoID == user.id)
    ).all()
    friend_ids = [
        f.userTwoID if f.userOneID == user.id else f.userOneID
        for f in friendships
    ]
    if not friend_ids:
        return UserFeedResponse(count=0, items=[])

    group_ids = [
        gm.groupID
        for gm in db.query(GroupMember)
        .filter_by(userID=user.id, active=True)
        .all()
    ]
    if not group_ids:
        return UserFeedResponse(count=0, items=[])

    fetch_limit = limit * 2
    progress_rows = (
        db.query(ProgressEntry, Task, TaskGroup, User)
        .join(TaskProgress, ProgressEntry.TaskProgressID == TaskProgress.id)
        .join(Task, TaskProgress.taskID == Task.id)
        .join(TaskGroup, Task.groupID == TaskGroup.id)
        .join(GroupMember, ProgressEntry.memberID == GroupMember.id)
        .join(User, GroupMember.userID == User.id)
        .filter(GroupMember.userID.in_(friend_ids), Task.groupID.in_(group_ids))
        .order_by(ProgressEntry.createdAt.desc())
        .limit(fetch_limit)
        .all()
    )

    comment_rows = (
        db.query(Comment, Task, TaskGroup, User)
        .join(User, Comment.userID == User.id)
        .join(ProgressEntry, Comment.progressEntryID == ProgressEntry.id)
        .join(TaskProgress, ProgressEntry.TaskProgressID == TaskProgress.id)
        .join(Task, TaskProgress.taskID == Task.id)
        .join(TaskGroup, Task.groupID == TaskGroup.id)
        .filter(Comment.userID.in_(friend_ids), Task.groupID.in_(group_ids))
        .order_by(Comment.date.desc())
        .limit(fetch_limit)
        .all()
    )

    items: list[FeedItemResponse] = []
    for entry, task, group, author in progress_rows:
        items.append(
            FeedItemResponse(
                type="progress_entry",
                created_at=entry.createdAt,
                user_id=str(author.id),
                username=author.username,
                task_id=str(task.id),
                group_id=str(group.id),
                message=entry.message,
                value=entry.value,
                photo_url=entry.photoUrl,
            )
        )

    for comment, task, group, author in comment_rows:
        items.append(
            FeedItemResponse(
                type="comment",
                created_at=comment.date,
                user_id=str(author.id),
                username=author.username,
                task_id=str(task.id),
                group_id=str(group.id),
                message=comment.message,
            )
        )

    items.sort(key=lambda item: item.created_at, reverse=True)
    items = items[:limit]

    return UserFeedResponse(count=len(items), items=items)


@router.get("/users/{user_id}/stats", response_model=UserStatsResponse)
def user_stats(user_id: UUID, db: Session = Depends(get_db)):
    user = db.query(User).filter_by(id=user_id).first()
    if user is None:
        raise NotFoundError("User not found")

    friendships = db.query(Friendship).filter(
        (Friendship.userOneID == user.id) | (Friendship.userTwoID == user.id)
    ).all()
    friend_ids = [
        f.userTwoID if f.userOneID == user.id else f.userOneID
        for f in friendships
    ]

    progress_rows = (
        db.query(TaskProgress)
        .join(GroupMember, TaskProgress.groupMemberID == GroupMember.id)
        .filter(GroupMember.userID == user.id, GroupMember.active.is_(True))
        .all()
    )
    done_value = TaskStatus.DONE.value
    active_tasks = sum(
        1
        for progress in progress_rows
        if (progress.status.value if hasattr(progress.status, "value") else progress.status)
        != done_value
    )
    completed_tasks = sum(
        1
        for progress in progress_rows
        if (progress.status.value if hasattr(progress.status, "value") else progress.status)
        == done_value
    )

    streak_rows = (
        db.query(RepeatableTaskProgress)
        .join(GroupMember, RepeatableTaskProgress.groupMemberID == GroupMember.id)
        .filter(GroupMember.userID == user.id, GroupMember.active.is_(True))
        .all()
    )
    streaks = [
        RepeatableStreakResponse(
            progress_id=str(progress.id),
            task_id=str(progress.taskID),
            streak=progress.streak,
            counter=progress.counter,
        )
        for progress in streak_rows
        if progress.streak > 0
    ]

    return UserStatsResponse(
        active_tasks=active_tasks,
        completed_tasks=completed_tasks,
        friends_count=len(friend_ids),
        streaks=streaks,
    )


@router.get("/users/{user_id}/upcoming", response_model=TaskListResponse)
def user_upcoming(user_id: UUID, db: Session = Depends(get_db)):
    user = db.query(User).filter_by(id=user_id).first()
    if user is None:
        raise NotFoundError("User not found")

    group_ids = [
        gm.groupID
        for gm in db.query(GroupMember)
        .filter_by(userID=user.id, active=True)
        .all()
    ]
    if not group_ids:
        return TaskListResponse(count=0, items=[])

    now = datetime.utcnow()
    upcoming_limit = now + timedelta(days=7)

    one_time = (
        db.query(OneTimeTask)
        .filter(
            OneTimeTask.groupID.in_(group_ids),
            OneTimeTask.deadline.isnot(None),
            OneTimeTask.deadline >= now,
            OneTimeTask.deadline <= upcoming_limit,
        )
        .all()
    )
    challenge = (
        db.query(ChallengeTask)
        .filter(
            ChallengeTask.groupID.in_(group_ids),
            ChallengeTask.deadline.isnot(None),
            ChallengeTask.deadline >= now,
            ChallengeTask.deadline <= upcoming_limit,
        )
        .all()
    )

    tasks = one_time + challenge
    tasks.sort(key=lambda task: task.deadline or upcoming_limit)
    items = [_task_payload(task) for task in tasks]

    return TaskListResponse(count=len(items), items=items)


@router.get("/users/{user_id}/notifications", response_model=NotificationListResponse)
def list_user_notifications(user_id: UUID, db: Session = Depends(get_db)):
    user = db.query(User).filter_by(id=user_id).first()
    if user is None:
        raise NotFoundError("User not found")
    notifications = (
        db.query(Notification)
        .filter_by(userID=user.id)
        .order_by(Notification.date.desc())
        .all()
    )

    items = [
        NotificationSummaryResponse(
            id=str(notification.id),
            message=notification.message,
            active=notification.active,
            date=notification.date,
        )
        for notification in notifications
    ]

    return NotificationListResponse(count=len(items), items=items)


@router.get("/users/{user_id}/invitations/sent", response_model=InvitationListResponse)
def list_sent_invitations(user_id: UUID, db: Session = Depends(get_db)):
    user = db.query(User).filter_by(id=user_id).first()
    if user is None:
        raise NotFoundError("User not found")
    invitations = db.query(Invitation).filter_by(fromUserID=user.id).all()

    items = [
        InvitationSummaryResponse(
            from_user_id=str(invitation.fromUserID),
            to_user_id=str(invitation.toUserID),
            from_username=invitation.fromUser.username if invitation.fromUser else None,
            to_username=invitation.toUser.username if invitation.toUser else None,
            date=invitation.date,
        )
        for invitation in invitations
    ]

    return InvitationListResponse(count=len(items), items=items)


@router.get("/users/{user_id}/invitations/received", response_model=InvitationListResponse)
def list_received_invitations(user_id: UUID, db: Session = Depends(get_db)):
    user = db.query(User).filter_by(id=user_id).first()
    if user is None:
        raise NotFoundError("User not found")
    invitations = db.query(Invitation).filter_by(toUserID=user.id).all()

    items = [
        InvitationSummaryResponse(
            from_user_id=str(invitation.fromUserID),
            to_user_id=str(invitation.toUserID),
            from_username=invitation.fromUser.username if invitation.fromUser else None,
            to_username=invitation.toUser.username if invitation.toUser else None,
            date=invitation.date,
        )
        for invitation in invitations
    ]

    return InvitationListResponse(count=len(items), items=items)


@router.get("/taskgroups/{group_id}/members", response_model=GroupMemberListResponse)
def list_taskgroup_members(group_id: UUID, db: Session = Depends(get_db)):
    group = db.query(TaskGroup).filter_by(id=group_id).first()
    if group is None:
        raise NotFoundError("TaskGroup not found")
    rows = (
        db.query(GroupMember, User)
        .join(User, GroupMember.userID == User.id)
        .filter(GroupMember.groupID == group.id)
        .order_by(GroupMember.joinedAt.asc())
        .all()
    )

    items = [
        GroupMemberSummaryResponse(
            id=str(member.id),
            user_id=str(member.userID),
            username=user.username,
            role=member.role.value if member.role else None,
            active=member.active,
            joined_at=member.joinedAt,
        )
        for member, user in rows
    ]

    return GroupMemberListResponse(count=len(items), items=items)


@router.get("/taskgroups/{group_id}/tasks", response_model=TaskListResponse)
def list_taskgroup_tasks(group_id: UUID, db: Session = Depends(get_db)):
    group = db.query(TaskGroup).filter_by(id=group_id).first()
    if group is None:
        raise NotFoundError("TaskGroup not found")
    tasks = db.query(Task).filter_by(groupID=group.id).all()

    items = [
        TaskResponse(
            id=str(task.id),
            name=task.name,
            description=task.description,
            goal=task.goal,
            unit=task.unit,
            type=task.type.value if hasattr(task.type, "value") else task.type,
            group_id=str(task.groupID),
            owner_id=str(task.ownerID) if task.ownerID else None,
        )
        for task in tasks
    ]

    return TaskListResponse(count=len(items), items=items)


@router.get("/users/{user_id}/tasks", response_model=TaskListResponse)
def list_user_tasks(user_id: UUID, db: Session = Depends(get_db)):
    user = db.query(User).filter_by(id=user_id).first()
    if user is None:
        raise NotFoundError("User not found")
    tasks = db.query(Task).filter_by(ownerID=user.id).all()

    items = [
        TaskResponse(
            id=str(task.id),
            name=task.name,
            description=task.description,
            goal=task.goal,
            unit=task.unit,
            type=task.type.value if hasattr(task.type, "value") else task.type,
            group_id=str(task.groupID),
            owner_id=str(task.ownerID) if task.ownerID else None,
        )
        for task in tasks
    ]

    return TaskListResponse(count=len(items), items=items)


@router.get("/tasks/{task_id}/progress", response_model=TaskProgressListResponse)
def list_task_progress(task_id: UUID, db: Session = Depends(get_db)):
    task = db.query(Task).filter_by(id=task_id).first()
    if task is None:
        raise NotFoundError("Task not found")
    progresses = db.query(TaskProgress).filter_by(taskID=task.id).all()

    items = [
        TaskProgressSummaryResponse(
            id=str(progress.id),
            group_member_id=str(progress.groupMemberID) if progress.groupMemberID else None,
            user_id=str(progress.userID) if progress.userID else None,
            status=progress.status.value if progress.status else "",
            value=progress.value,
            type=progress.type,
        )
        for progress in progresses
    ]

    return TaskProgressListResponse(count=len(items), items=items)


@router.get("/tasks/{task_id}/progress-entries", response_model=ProgressEntryListResponse)
def list_task_progress_entries(task_id: UUID, db: Session = Depends(get_db)):
    task = db.query(Task).filter_by(id=task_id).first()
    if task is None:
        raise NotFoundError("Task not found")
    entries = (
        db.query(ProgressEntry)
        .join(TaskProgress, ProgressEntry.TaskProgressID == TaskProgress.id)
        .filter(TaskProgress.taskID == task.id)
        .order_by(ProgressEntry.createdAt.desc())
        .all()
    )

    items = [
        ProgressEntrySummaryResponse(
            id=str(entry.id),
            member_id=str(entry.memberID),
            value=entry.value,
            message=entry.message,
            photo_url=entry.photoUrl,
            created_at=entry.createdAt,
        )
        for entry in entries
    ]

    return ProgressEntryListResponse(count=len(items), items=items)


@router.get("/progress-entries/{entry_id}/comments", response_model=CommentListResponse)
def list_progress_entry_comments(entry_id: UUID, db: Session = Depends(get_db)):
    entry = db.query(ProgressEntry).filter_by(id=entry_id).first()
    if entry is None:
        raise NotFoundError("ProgressEntry not found")
    comments = (
        db.query(Comment)
        .filter_by(progressEntryID=entry.id)
        .order_by(Comment.date.desc())
        .all()
    )

    items = [
        CommentSummaryResponse(
            id=str(comment.id),
            user_id=str(comment.userID),
            message=comment.message,
            date=comment.date,
        )
        for comment in comments
    ]

    return CommentListResponse(count=len(items), items=items)
