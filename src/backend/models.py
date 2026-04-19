from __future__ import annotations

from datetime import datetime
from enum import Enum
import re
from typing import Any
from uuid import UUID, uuid4

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    Enum as SAEnum,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
    Uuid,
)
from sqlalchemy.orm import Mapped, Session, mapped_column, relationship, synonym

from src.backend.database import Base
from src.backend.security import hash_password, password_needs_rehash, verify_password


def utcnow() -> datetime:
    return datetime.utcnow()


class PrivacyLevel(Enum):
    PRIVATE = "private"
    PUBLIC = "public"


class GroupRole(Enum):
    MEMBER = "member"
    ADMIN = "admin"
    OWNER = "owner"


class TaskStatus(Enum):
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    DONE = "done"


class TimeInterval(Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"


class TaskType(Enum):
    ENDLESS = "endless"
    ONE_TIME = "one_time"
    REPEATABLE = "repeatable"
    CHALLENGE = "challenge"


class TaskGroupType(Enum):
    TASK_GROUP = "task_group" #co to wgl za typ XD
    COMPETITIVE = "competitive"
    COOPERATIVE = "cooperative"


class Account(Base):
    __tablename__ = "accounts"
    __table_args__ = (
        CheckConstraint("email LIKE '%_@_%._%'", name="ck_accounts_email_format"),
    )

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    email: Mapped[str] = mapped_column(String(320), unique=True, nullable=False, index=True)
    passwordHash: Mapped[str] = mapped_column(String(255), nullable=False)
    registrationDate: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=utcnow)

    user: Mapped[User | None] = relationship(
        "User",
        back_populates="account",
        uselist=False,
        cascade="all, delete-orphan",
    )

    @staticmethod
    def _is_valid_email(email: str) -> bool:
        return bool(re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", email))

    @staticmethod
    def _is_strong_password(password: str) -> bool:
        if len(password) < 8:
            return False
        has_letter = any(ch.isalpha() for ch in password)
        has_digit = any(ch.isdigit() for ch in password)
        return has_letter and has_digit

    def register(self, db_session: Session, email: str, username: str, password: str) -> bool:
        if not self._is_valid_email(email):
            raise ValueError("Invalid email format")
        if not self._is_strong_password(password):
            raise ValueError("Weak password")

        if db_session.query(Account).filter_by(email=email).first() is not None:
            raise ValueError("Email already in use")
        if db_session.query(User).filter_by(username=username).first() is not None:
            raise ValueError("Username already in use")

        self.email = email
        self.passwordHash = hash_password(password)
        self.registrationDate = utcnow()
        db_session.add(self)
        #self.createUser(db_session, username) #TODO to tworzymy usera tu czy ręcznie ?????
        try:
            db_session.flush()
        except Exception:
            db_session.rollback()
            raise
        return True

    def login(self, db_session: Session, email: str, password: str) -> bool:
        account = db_session.query(Account).filter_by(email=email).first()
        if account is None:
            raise ValueError("Account does not exist")

        if not verify_password(password, account.passwordHash):
            raise ValueError("Invalid credentials")

        if password_needs_rehash(account.passwordHash):
            account.passwordHash = hash_password(password)
            db_session.flush()


        self.id = account.id
        self.email = account.email
        self.passwordHash = account.passwordHash
        self.registrationDate = account.registrationDate
        return True

#TODO: powinno usuwac wszystko czego wlascicielem jest ten user, POZA TASKAMI, TASKPROGRESS, GROUPMEMBER oraz zamieniac GroupRole na ghost w kazdej TG, poza tymi, której jest ownerem, wtedy delete wszystko.
    def deleteAccount(self, password: str, db_session: Session) -> None:
        hash = self.passwordHash
        if not verify_password(password, hash):
            raise ValueError("Invalid password")
        db_session.delete(self)
        try:
            db_session.flush()
        except Exception:
            db_session.rollback()
            raise

    def createUser(self, db_session: Session, username: str, photoUrl: str | None = None) -> None:
        if self.user is not None:
            raise ValueError("User already exists for this account")
        if db_session.query(User).filter_by(username=username).first() is not None:
            raise ValueError("Username already in use")
        if photoUrl is not None and not User.is_valid_photo_url(photoUrl):
            raise ValueError("Invalid photo URL")

        user = User()
        user.accountID = self.id
        user.username = username
        user.photoUrl = photoUrl
        db_session.add(user)
        try:
            db_session.flush()
        except Exception:
            db_session.rollback()
            raise

    def changePassword(self, db_session: Session, old_password: str, new_password: str) -> bool:
        hash = self.passwordHash
        if not verify_password(old_password, hash):
            raise ValueError("Invalid current password")
        if not self._is_strong_password(new_password):
            raise ValueError("Weak new password")
        
        self.passwordHash = hash_password(new_password)
        try:
            db_session.flush()
        except Exception:
            db_session.rollback()
            raise


class User(Base):
    __tablename__ = "users"
    __table_args__ = (
        CheckConstraint("username <> ''", name="ck_users_username_not_empty"),
    )

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    accountID: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("accounts.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    username: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    photoUrl: Mapped[str | None] = mapped_column(String(1024), nullable=True)

    account: Mapped[Account] = relationship("Account", back_populates="user")

    friendshipsAsUserOne: Mapped[list[Friendship]] = relationship(
        "Friendship",
        foreign_keys="Friendship.userOneID",
        back_populates="userOne",
        cascade="all, delete-orphan",
    )
    friendshipsAsUserTwo: Mapped[list[Friendship]] = relationship(
        "Friendship",
        foreign_keys="Friendship.userTwoID",
        back_populates="userTwo",
        cascade="all, delete-orphan",
    )

    invitationsSent: Mapped[list[Invitation]] = relationship(
        "Invitation",
        foreign_keys="Invitation.fromUserID",
        back_populates="fromUser",
        cascade="all, delete-orphan",
    )
    invitationsReceived: Mapped[list[Invitation]] = relationship(
        "Invitation",
        foreign_keys="Invitation.toUserID",
        back_populates="toUser",
        cascade="all, delete-orphan",
    )

    notifications: Mapped[list[Notification]] = relationship(
        "Notification",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    groupMemberships: Mapped[list[GroupMember]] = relationship(
        "GroupMember",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    #TODO: problematic | co ty gadasz git jest
    ownedGroups: Mapped[list[TaskGroup]] = relationship(
        "TaskGroup",
        back_populates="owner",
        cascade="all, delete-orphan",
    )

    ownedTasks: Mapped[list[Task]] = relationship(
        "Task",
        back_populates="owner",
    )

    taskProgresses: Mapped[list[TaskProgress]] = relationship(
        "TaskProgress",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    progressEntries: Mapped[list[ProgressEntry]] = relationship(
        "ProgressEntry",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    comments: Mapped[list[Comment]] = relationship(
        "Comment",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    @staticmethod
    def is_valid_photo_url(url: str) -> bool: #TODO jak my wgl chcemy zdjecia obsługiwać?
        return bool(re.fullmatch(r"https?://\S+\.\S+", url))
    @staticmethod
    def is_unique_username(db_session: Session, username: str) -> bool:
        return (db_session.query(User).filter_by(username=username).first() is None and username != "")
    
    def editProfile(self, db_session: Session, username: str | None = None, photoUrl: str | None = None) -> None:
        new_username = self.username
        new_photoUrl = self.photoUrl
        if username is not None:
            username = username.strip()
            if not self.is_unique_username(db_session, username) and username != self.username:
                raise ValueError("Invalid username")
            new_username = username
        if photoUrl is not None:
            if not self.is_valid_photo_url(photoUrl):
                raise ValueError("Invalid photo URL")
            new_photoUrl = photoUrl
        
        self.username = new_username
        self.photoUrl = new_photoUrl
        try:
            db_session.flush()
        except Exception:
            db_session.rollback()
            raise

    def inviteFriend(self, db_session: Session, friend_id: UUID) -> None:
        friend = db_session.query(User).filter_by(id=friend_id).first()
        if friend is None or db_session.query(Friendship).filter(
            ((Friendship.userOneID == self.id) & (Friendship.userTwoID == friend_id)) |
            ((Friendship.userOneID == friend_id) & (Friendship.userTwoID == self.id))
        ).first() is not None:
            raise ValueError("Invalid friend ID") #TODO przejrzeć typy exception
        
        invitation = Invitation()
        invitation.fromUserID = self.id
        invitation.toUserID = friend_id
        db_session.add(invitation)
        friend.notify(db_session, f"You have a new friend invitation from {self.username}!")
        try:
            db_session.flush()
        except Exception:
            db_session.rollback()
            raise

    def notify(self, db_session: Session, message: str) -> None:
        notification = Notification()
        notification.userID = self.id
        notification.message = message
        db_session.add(notification)
        try:
            db_session.flush()
        except Exception:
            db_session.rollback()
            raise


    def createGroup(self, db_session: Session, name: str, privacy: PrivacyLevel = PrivacyLevel.PUBLIC, isBingo: bool = False, type: TaskGroupType = TaskGroupType.TASK_GROUP) -> None: #nowe, ważne, trzeba dodać testy!!!!!! TODO
        if name.strip() == "":
            raise ValueError("Group name cannot be empty")
        group = TaskGroup()
        group.ownerID = self.id
        group.name = name
        group.privacy = privacy
        group.isBingo = isBingo
        group.type = type
        group.taskCount = 0
        group.inviteCode = str(uuid4())[:8] #TODO 
        

class Friendship(Base):
    __tablename__ = "friendships"
    __table_args__ = (
        CheckConstraint('"userOneID" <> "userTwoID"', name="ck_friendships_distinct_users"),
        Index("ix_friendships_accepted_at", "acceptedAt"),
    )

    userOneID: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
        nullable=False,
    )
    userTwoID: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
        nullable=False,
    )
    acceptedAt: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=utcnow)

    userOne: Mapped[User] = relationship(
        "User",
        foreign_keys=[userOneID],
        back_populates="friendshipsAsUserOne",
    )
    userTwo: Mapped[User] = relationship(
        "User",
        foreign_keys=[userTwoID],
        back_populates="friendshipsAsUserTwo",
    )

    def deleteFriend(self, db_session: Session) -> None:
        db_session.delete(self)
        try:
            db_session.flush()
        except Exception:
            db_session.rollback()
            raise


class Invitation(Base):
    __tablename__ = "invitations"
    __table_args__ = (
        CheckConstraint('"fromUserID" <> "toUserID"', name="ck_invitations_distinct_users"),
    )

    fromUserID: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
        nullable=False,
    )
    toUserID: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
        nullable=False,
    )
    date: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=utcnow)
    createdAt = synonym("date")

    fromUser: Mapped[User] = relationship(
        "User",
        foreign_keys=[fromUserID],
        back_populates="invitationsSent",
    )
    toUser: Mapped[User] = relationship(
        "User",
        foreign_keys=[toUserID],
        back_populates="invitationsReceived",
    )

    def accept(self, db_session: Session) -> None:
        friendship = Friendship()
        friendship.userOneID = self.fromUserID
        friendship.userTwoID = self.toUserID
        db_session.add(friendship)
        db_session.delete(self)
        try:
            db_session.flush()
        except Exception:
            db_session.rollback()
            raise

    def reject(self, db_session: Session) -> None:
        db_session.delete(self)
        try:
            db_session.flush()
        except Exception:
            db_session.rollback()
            raise

    def cancel(self, db_session: Session) -> None: 
        db_session.delete(self)
        try:
            db_session.flush()
        except Exception:
            db_session.rollback()
            raise

    def notify(self, db_session: Session) -> None: #TODO do wywalenia XD
        self.toUser.notify(db_session, f"You have a new friend invitation from {self.fromUser.username}!")


class Notification(Base):
    __tablename__ = "notifications"
    __table_args__ = (
        Index("ix_notifications_user_date", "userID", "date"),
        Index("ix_notifications_user_active", "userID", "active"),
    )

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    userID: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    message: Mapped[str] = mapped_column(Text, nullable=False)
    date: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=utcnow)
    active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    createdAt = synonym("date")
    content = synonym("message")

    user: Mapped[User] = relationship("User", back_populates="notifications")

    def read(self, db_session: Session) -> None:
        self.active = False
        try:
            db_session.flush()
        except Exception:
            db_session.rollback()
            raise


class TaskGroup(Base):
    __tablename__ = "task_groups"
    __table_args__ = (
        CheckConstraint("name <> ''", name="ck_task_groups_name_not_empty"),
        CheckConstraint('"taskCount" >= 0', name="ck_task_groups_task_count_non_negative"),
        UniqueConstraint("inviteCode", name="uq_task_groups_invite_code"),
        Index("ix_task_groups_owner_created", "ownerID", "createdAt"),
    )

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    ownerID: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    taskCount: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    isBingo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    privacy: Mapped[PrivacyLevel] = mapped_column(
        SAEnum(PrivacyLevel, name="privacy_level", native_enum=True),
        nullable=False,
        default=PrivacyLevel.PRIVATE,
    )
    inviteCode: Mapped[str | None] = mapped_column(String(64), nullable=True)
    createdAt: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=utcnow)
    type: Mapped[TaskGroupType] = mapped_column(
        SAEnum(TaskGroupType, name="task_group_type", native_enum=True),
        nullable=False,
    )

    date = synonym("createdAt")

    owner: Mapped[User] = relationship("User", back_populates="ownedGroups")
    members: Mapped[list[GroupMember]] = relationship(
        "GroupMember",
        back_populates="group",
        cascade="all, delete-orphan",
    )
    tasks: Mapped[list[Task]] = relationship(
        "Task",
        back_populates="group",
        cascade="all, delete-orphan",
    )

    __mapper_args__ = {
        "polymorphic_identity": TaskGroupType.TASK_GROUP.value,
        "polymorphic_on": type,
        "with_polymorphic": "*",
    }

    def edit(
        self,
        db_session: Session,
        user_id: UUID,
        new_name: str | None = None,
        new_privacy: PrivacyLevel | None = None,
    ) -> None:
        pass

    def delete(self, db_session: Session, user_id: UUID) -> None:
        pass

    def addFriend(self, db_session: Session, user_id: UUID, friend_id: UUID) -> None:
        pass

    def createTask(self, db_session: Session, user_id: UUID, **task_data: Any) -> None:
        pass

    def changeGroupType(self, db_session: Session, user_id: UUID) -> None:
        pass


class CompetetiveTaskGroup(TaskGroup):
    __tablename__ = "competitive_task_groups"

    id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("task_groups.id", ondelete="CASCADE"),
        primary_key=True,
    )

    __mapper_args__ = {
        "polymorphic_identity": TaskGroupType.COMPETITIVE.value,
    }


class CooperativeTaskGroup(TaskGroup):
    __tablename__ = "cooperative_task_groups"

    id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("task_groups.id", ondelete="CASCADE"),
        primary_key=True,
    )

    __mapper_args__ = {
        "polymorphic_identity": TaskGroupType.COOPERATIVE.value,
    }


class GroupMember(Base):
    __tablename__ = "group_members"
    __table_args__ = (
        Index("ix_group_members_group_active", "groupID", "active"),
        Index("ix_group_members_user_active", "userID", "active"),
    )

    userID: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
        nullable=False,
        index=True,
    )
    groupID: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("task_groups.id", ondelete="CASCADE"),
        primary_key=True,
        nullable=False,
        index=True,
    )
    active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    role: Mapped[GroupRole] = mapped_column(
        SAEnum(GroupRole, name="group_role", native_enum=True),
        nullable=False,
        default=GroupRole.MEMBER,
    )
    joinedAt: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=utcnow)

    user: Mapped[User] = relationship("User", back_populates="groupMemberships")
    group: Mapped[TaskGroup] = relationship("TaskGroup", back_populates="members")

    def changePermissions(self, db_session: Session, new_role: GroupRole, by_user_id: UUID) -> None:
        pass

    def removeMember(self, session: Session, take_progress: bool, punisher: UUID) -> None:
        pass


class Task(Base):
    __tablename__ = "tasks"
    __table_args__ = (
        CheckConstraint("name <> ''", name="ck_tasks_name_not_empty"),
        Index("ix_tasks_group_status", "groupID", "status"),
        Index("ix_tasks_owner_group", "ownerID", "groupID"),
    )

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    ownerID: Mapped[UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    groupID: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("task_groups.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    goal: Mapped[float | None] = mapped_column(Float, nullable=True)
    status: Mapped[TaskStatus] = mapped_column(
        SAEnum(TaskStatus, name="task_status", native_enum=True),
        nullable=False,
        default=TaskStatus.TODO,
    )
    type: Mapped[str] = mapped_column(String(32), nullable=False)

    owner: Mapped[User | None] = relationship("User", back_populates="ownedTasks")
    group: Mapped[TaskGroup] = relationship("TaskGroup", back_populates="tasks")
    params: Mapped[TaskParams | None] = relationship(
        "TaskParams",
        back_populates="task",
        uselist=False,
        cascade="all, delete-orphan",
    )
    progresses: Mapped[list[TaskProgress]] = relationship(
        "TaskProgress",
        back_populates="task",
        cascade="all, delete-orphan",
    )

    __mapper_args__ = {
        "polymorphic_on": type,
        "with_polymorphic": "*",
        "polymorphic_abstract": True,
    }

    def edit(self, db_session: Session, user_id: UUID, **new_data: Any) -> None:
        pass

    def delete(self, db_session: Session, user_id: UUID) -> None:
        pass

    def changeTaskType(self, db_session: Session, user_id: UUID, new_type: TaskType) -> None:
        pass


class EndlessTask(Task):
    __tablename__ = "endless_tasks"

    id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("tasks.id", ondelete="CASCADE"),
        primary_key=True,
    )

    __mapper_args__ = {
        "polymorphic_identity": TaskType.ENDLESS.value,
    }


class OneTimeTask(Task):
    __tablename__ = "one_time_tasks"

    id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("tasks.id", ondelete="CASCADE"),
        primary_key=True,
    )
    deadline: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    __mapper_args__ = {
        "polymorphic_identity": TaskType.ONE_TIME.value,
    }


class RepeatableTask(Task):
    __tablename__ = "repeatable_tasks"

    id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("tasks.id", ondelete="CASCADE"),
        primary_key=True,
    )
    frequency: Mapped[TimeInterval | None] = mapped_column(
        SAEnum(TimeInterval, name="time_interval", native_enum=True),
        nullable=True,
    )

    __mapper_args__ = {
        "polymorphic_identity": TaskType.REPEATABLE.value,
    }


class ChallengeTask(Task):
    __tablename__ = "challenge_tasks"

    id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("tasks.id", ondelete="CASCADE"),
        primary_key=True,
    )
    deadline: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    __mapper_args__ = {
        "polymorphic_identity": TaskType.CHALLENGE.value,
    }


class TaskProgress(Base):
    __tablename__ = "task_progresses"
    __table_args__ = (
        UniqueConstraint("userID", "taskID", name="uq_task_progress_user_task"),
        Index("ix_task_progresses_task_type", "taskID", "type"),
        Index("ix_task_progresses_user_task", "userID", "taskID"),
    )

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    userID: Mapped[UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    taskID: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("tasks.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    value: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    type: Mapped[str] = mapped_column(String(32), nullable=False)

    userId = synonym("userID")

    user: Mapped[User | None] = relationship("User", back_populates="taskProgresses")
    task: Mapped[Task] = relationship("Task", back_populates="progresses")
    entries: Mapped[list[ProgressEntry]] = relationship(
        "ProgressEntry",
        back_populates="taskProgress",
        cascade="all, delete-orphan",
    )

    __mapper_args__ = {
        "polymorphic_on": type,
        "with_polymorphic": "*",
        "polymorphic_abstract": True,
    }

    def updateProgress(
        self,
        db_session: Session,
        delta_value: float,
        message: str,
        photoUrl: str | None = None,
    ) -> None:
        pass


class EndlessTaskProgress(TaskProgress):
    __tablename__ = "endless_task_progresses"

    id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("task_progresses.id", ondelete="CASCADE"),
        primary_key=True,
    )

    __mapper_args__ = {
        "polymorphic_identity": TaskType.ENDLESS.value,
    }


class OneTimeTaskProgress(TaskProgress):
    __tablename__ = "one_time_task_progresses"

    id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("task_progresses.id", ondelete="CASCADE"),
        primary_key=True,
    )

    __mapper_args__ = {
        "polymorphic_identity": TaskType.ONE_TIME.value,
    }


class RepeatableTaskProgress(TaskProgress):
    __tablename__ = "repeatable_task_progresses"

    id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("task_progresses.id", ondelete="CASCADE"),
        primary_key=True,
    )
    counter: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    streak: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    __mapper_args__ = {
        "polymorphic_identity": TaskType.REPEATABLE.value,
    }


class ChallengeTaskProgress(TaskProgress):
    __tablename__ = "challenge_task_progresses"

    id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("task_progresses.id", ondelete="CASCADE"),
        primary_key=True,
    )

    __mapper_args__ = {
        "polymorphic_identity": TaskType.CHALLENGE.value,
    }


class TaskParams(Base):
    __tablename__ = "task_params"

    taskID: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("tasks.id", ondelete="CASCADE"),
        primary_key=True,
        nullable=False,
    )
    photoRequired: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    color: Mapped[str | None] = mapped_column(String(32), nullable=True)
    notifications: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    id = synonym("taskID")

    task: Mapped[Task] = relationship("Task", back_populates="params")

    def edit(
        self,
        db_session: Session,
        photoRequired: bool | None = None,
        color: str | None = None,
        notifications: bool | None = None,
    ) -> None:
        pass


class ProgressEntry(Base):
    __tablename__ = "progress_entries"

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    userID: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    TaskProgressID: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("task_progresses.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    value: Mapped[float] = mapped_column(Float, nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False, default="")
    photoUrl: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    createdAt: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=utcnow)

    date = synonym("createdAt")

    user: Mapped[User] = relationship("User", back_populates="progressEntries")
    taskProgress: Mapped[TaskProgress] = relationship("TaskProgress", back_populates="entries")
    comments: Mapped[list[Comment]] = relationship(
        "Comment",
        back_populates="progressEntry",
        cascade="all, delete-orphan",
    )

    def validate(self) -> bool:
        return True

    def delete(self, db_session: Session | None = None) -> None:
        pass

    def addComment(self, db_session: Session, user_id: UUID, message: str) -> None:
        pass


class Comment(Base):
    __tablename__ = "comments"

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    userID: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    progressEntryID: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("progress_entries.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    message: Mapped[str] = mapped_column(Text, nullable=False)
    date: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=utcnow)

    createdAt = synonym("date")

    user: Mapped[User] = relationship("User", back_populates="comments")
    progressEntry: Mapped[ProgressEntry] = relationship("ProgressEntry", back_populates="comments")

    def deleteComment(self, db_session: Session) -> None:
        db_session.delete(self)
        try:
            db_session.flush()
        except Exception:
            db_session.rollback()
            raise


__all__ = [ #do importów
    "PrivacyLevel",
    "GroupRole",
    "TaskStatus",
    "TimeInterval",
    "TaskType",
    "TaskGroupType",
    "User",
    "Account",
    "Friendship",
    "Invitation",
    "Notification",
    "TaskGroup",
    "CompetetiveTaskGroup",
    "CooperativeTaskGroup",
    "GroupMember",
    "Task",
    "EndlessTask",
    "OneTimeTask",
    "RepeatableTask",
    "ChallengeTask",
    "TaskProgress",
    "EndlessTaskProgress",
    "OneTimeTaskProgress",
    "RepeatableTaskProgress",
    "ChallengeTaskProgress",
    "TaskParams",
    "ProgressEntry",
    "Comment",
]
