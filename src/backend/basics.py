from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.backend.database import get_db
from src.backend.exceptions import NotFoundError
from src.backend.models import (
    Comment,
    Friendship,
    GroupMember,
    Invitation,
    Notification,
    ProgressEntry,
    Task,
    TaskGroup,
    TaskProgress,
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
    NotificationListResponse,
    NotificationSummaryResponse,
    ProgressEntryListResponse,
    ProgressEntrySummaryResponse,
    TaskGroupListResponse,
    TaskListResponse,
    TaskProgressListResponse,
    TaskProgressSummaryResponse,
    TaskResponse,
    UserSummaryResponse,
)

router = APIRouter(prefix="", tags=["basics"])


def _user_payload(user: User) -> UserSummaryResponse:
    return UserSummaryResponse(
        id=str(user.id),
        username=user.username,
        photo_url=user.photoUrl,
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
