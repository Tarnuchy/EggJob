from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.backend.database import get_db
from src.backend.exceptions import NotFoundError
from src.backend.models import Friendship, GroupMember, TaskGroup, User
from src.backend.response import FriendsListResponse, TaskGroupListResponse, UserSummaryResponse

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
