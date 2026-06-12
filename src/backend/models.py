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
from sqlalchemy.orm import Mapped, Session, mapped_column, relationship, synonym, validates

from src.backend.database import Base
from src.backend.exceptions import (
    AuthenticationError,
    ConflictError,
    NotFoundError,
    PermissionDeniedError,
    StateError,
    ValidationError,
)
from src.backend.security import hash_password, password_needs_rehash, verify_password


def utcnow() -> datetime:
    return datetime.utcnow()


_COLOR_HEX_RE = re.compile(r"^#[0-9a-fA-F]+$")


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

    def register(self, db_session: Session, email: str, username: str, password: str):
        if not self._is_valid_email(email):
            raise ValidationError("Invalid email format")
        if not self._is_strong_password(password):
            raise ValidationError("Weak password")

        if db_session.query(Account).filter_by(email=email).first() is not None:
            raise ConflictError("Email already in use")
        if db_session.query(User).filter_by(username=username).first() is not None:
            raise ConflictError("Username already in use")

        self.email = email
        self.passwordHash = hash_password(password)
        self.registrationDate = utcnow()
        db_session.add(self)
        #self.createUser(db_session, username) #TODO to tworzymy usera tu czy ręcznie ?????
        db_session.flush()

    def login(self, db_session: Session, email: str, password: str) -> bool:
        account = db_session.query(Account).filter_by(email=email).first()
        if account is None:
            raise NotFoundError("Account does not exist")

        if not verify_password(password, account.passwordHash):
            raise AuthenticationError("Invalid credentials")

        if password_needs_rehash(account.passwordHash):
            account.passwordHash = hash_password(password)
            db_session.flush()


        self.id = account.id
        self.email = account.email
        self.passwordHash = account.passwordHash
        self.registrationDate = account.registrationDate
        db_session.flush()

#TODO: powinno usuwac wszystko czego wlascicielem jest ten user, POZA TASKAMI, TASKPROGRESS, GROUPMEMBER oraz zamieniac GroupRole na ghost w kazdej TG, poza tymi, której jest ownerem, wtedy delete wszystko.
    def deleteAccount(self, password: str, db_session: Session) -> None:
        hash = self.passwordHash
        if not verify_password(password, hash):
            raise AuthenticationError("Invalid password")
        db_session.delete(self)
        db_session.flush()

    def createUser(self, db_session: Session, username: str, photoUrl: str | None = None) -> None:
        if self.user is not None:
            raise ConflictError("User already exists for this account")
        if db_session.query(User).filter_by(username=username).first() is not None:
            raise ConflictError("Username already in use")
        if photoUrl is not None and not User.is_valid_photo_url(photoUrl):
            raise ValidationError("Invalid photo URL")

        user = User()
        user.accountID = self.id
        user.username = username
        user.photoUrl = photoUrl
        self.user = user
        db_session.add(user)
        db_session.flush()
        
    def changePassword(self, db_session: Session, old_password: str, new_password: str) -> bool:
        hash = self.passwordHash
        if not verify_password(old_password, hash):
            raise AuthenticationError("Invalid current password")
        if not self._is_strong_password(new_password):
            raise ValidationError("Weak new password")
        
        self.passwordHash = hash_password(new_password)
        db_session.flush()


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
        secondary="group_members",
        primaryjoin="User.id == GroupMember.userID",
        secondaryjoin="GroupMember.id == TaskProgress.groupMemberID",
        viewonly=True,
    )
    progressEntries: Mapped[list[ProgressEntry]] = relationship(
        "ProgressEntry",
        secondary="group_members",
        primaryjoin="User.id == GroupMember.userID",
        secondaryjoin="GroupMember.id == ProgressEntry.memberID",
        viewonly=True,
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
                raise ConflictError("Invalid username")
            new_username = username
        if photoUrl is not None:
            if not self.is_valid_photo_url(photoUrl):
                raise ValidationError("Invalid photo URL")
            new_photoUrl = photoUrl
        
        self.username = new_username
        self.photoUrl = new_photoUrl
        db_session.flush()

    def inviteFriend(self, db_session: Session, friend_id: UUID) -> None:
        friend = db_session.query(User).filter_by(id=friend_id).first()
        if friend is None or db_session.query(Friendship).filter(
            ((Friendship.userOneID == self.id) & (Friendship.userTwoID == friend_id)) |
            ((Friendship.userOneID == friend_id) & (Friendship.userTwoID == self.id))
        ).first() is not None:
            raise ValidationError("Invalid friend ID") #TODO przejrzeć typy exception
        
        invitation = Invitation()
        invitation.fromUserID = self.id
        invitation.toUserID = friend_id
        db_session.add(invitation)
        friend.notify(db_session, f"You have a new friend invitation from {self.username}!")
        db_session.flush()

    def notify(self, db_session: Session, message: str) -> None:
        notification = Notification()
        notification.userID = self.id
        notification.message = message
        db_session.add(notification)
        db_session.flush()


    def createGroup(self, db_session: Session, name: str, privacy: PrivacyLevel = PrivacyLevel.PUBLIC, isBingo: bool = False, type: TaskGroupType = TaskGroupType.TASK_GROUP) -> None: #nowe, ważne, trzeba dodać testy!!!!!! TODO
        if name.strip() == "": #TODO mogą być dwie grupy o tej samej nazwie?
            raise ValidationError("Group name cannot be empty")
        group = CooperativeTaskGroup() if type == TaskGroupType.COOPERATIVE else CompetetiveTaskGroup()
        group.ownerID = self.id
        group.name = name
        group.privacy = privacy
        group.isBingo = isBingo
        group.type = type
        group.taskCount = 0
        group.inviteCode = str(uuid4()) #TODO przemyśleć ale ja bym zostawił dla ułatwienia
        db_session.add(group)
        
        member = GroupMember()
        member.group = group
        member.userID = self.id
        member.role = GroupRole.OWNER
        db_session.add(member)
        
        db_session.flush()
        

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
        db_session.flush()


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
        db_session.flush()

    def reject(self, db_session: Session) -> None:
        db_session.delete(self)
        db_session.flush()

    def cancel(self, db_session: Session) -> None: 
        db_session.delete(self)
        db_session.flush()

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
        db_session.flush()


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
        "polymorphic_identity": TaskGroupType.TASK_GROUP,
        "polymorphic_on": type,
        "with_polymorphic": "*",
    }
    
    def checkPerms(self, db_session: Session, user_id: UUID, required_role: GroupRole) -> bool:
        member = db_session.query(GroupMember).filter_by(groupID=self.id, userID=user_id, active=True).first()
        if member is None:
            return False
        if required_role == GroupRole.MEMBER:
            return True
        if required_role == GroupRole.ADMIN:
            return member.role in (GroupRole.ADMIN, GroupRole.OWNER)
        if required_role == GroupRole.OWNER:
            return member.role == GroupRole.OWNER
        return False

    def edit(self, db_session: Session, user_id: UUID, name: str | None = None, privacy: PrivacyLevel | None = None, isBingo: bool | None = None) -> None:
        if not self.checkPerms(db_session, user_id, GroupRole.ADMIN):
            raise PermissionDeniedError("User does not have permission to edit this group")
        new_name = self.name
        new_privacy = self.privacy

        if name is not None:
            if name.strip() == "":
                raise ValidationError("Group name cannot be empty")
            new_name = name
        if privacy is not None:
            new_privacy = privacy
        if isBingo is not None and isBingo != self.isBingo:
            if isBingo:
                if self.taskCount not in (9, 16, 25):
                    raise ValidationError("Bingo group must have exactly 9, 16 or 25 tasks")
            else:
                has_unnamed = (
                    db_session.query(Task)
                    .filter(Task.groupID == self.id, Task.name == "")
                    .first()
                    is not None
                )
                if has_unnamed:
                    raise ValidationError("Name all bingo cells before disabling bingo")
            self.isBingo = isBingo
        self.name = new_name
        self.privacy = new_privacy
        db_session.flush()

    def delete(self, db_session: Session, user_id: UUID) -> None:
        if not self.checkPerms(db_session, user_id, GroupRole.OWNER):
            raise PermissionDeniedError("User does not have permission to delete this group")
        db_session.delete(self)
        db_session.flush()

    def addFriend(self, db_session: Session, user_id: UUID, friend_id: UUID, role: GroupRole) -> None:
        pass #różne implementacje w zależności od typu grupy

    def createTask(self, db_session: Session, user_id: UUID, **task_data: Any) -> "Task | None":
        pass #też różne

    def changeGroupType(self, db_session: Session, user_id: UUID, new_type: TaskGroupType) -> None:
        pass #💀💀💀 TODO


class CompetetiveTaskGroup(TaskGroup):
    __tablename__ = "competitive_task_groups"

    id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("task_groups.id", ondelete="CASCADE"),
        primary_key=True,
    )

    __mapper_args__ = {
        "polymorphic_identity": TaskGroupType.COMPETITIVE,
    }
    
    def addFriend(self, db_session: Session, user_id: UUID, friend_id: UUID, role: GroupRole) -> None:
        if role == GroupRole.OWNER:
            raise PermissionDeniedError("Insufficient permissions")
        elif role == GroupRole.ADMIN and not self.checkPerms(db_session, user_id, GroupRole.OWNER):
            raise PermissionDeniedError("Insufficient permissions")
        elif role == GroupRole.MEMBER and not self.checkPerms(db_session, user_id, GroupRole.ADMIN):
            raise PermissionDeniedError("Insufficient permissions")
        member = db_session.query(GroupMember).filter_by(groupID=self.id, userID=friend_id).first()
        if member is not None:
            if member.active:
                raise ConflictError("User is already a member of this group")
            else:
                member.active = True
                member.role = role
                for task in self.tasks:
                    if not db_session.query(TaskProgress).filter_by(groupMemberID=member.id, taskID=task.id).first():
                        task_type = task.type if isinstance(task.type, TaskType) else TaskType(task.type)
                        progress = EndlessTaskProgress() if task_type == TaskType.ENDLESS else (OneTimeTaskProgress() if task_type == TaskType.ONE_TIME else (RepeatableTaskProgress() if task_type == TaskType.REPEATABLE else ChallengeTaskProgress())) #TODO za długie XD
                        progress.groupMemberID = member.id
                        progress.taskID = task.id
                        progress.type = task_type.value
                        db_session.add(progress)
        else:
            new_member = GroupMember()
            new_member.groupID = self.id
            new_member.userID = friend_id
            new_member.role = role
            db_session.add(new_member)
            db_session.flush()
            for task in self.tasks:
                task_type = task.type if isinstance(task.type, TaskType) else TaskType(task.type)
                progress = EndlessTaskProgress() if task_type == TaskType.ENDLESS else (OneTimeTaskProgress() if task_type == TaskType.ONE_TIME else (RepeatableTaskProgress() if task_type == TaskType.REPEATABLE else ChallengeTaskProgress())) #TODO za długie XD
                progress.groupMemberID = new_member.id
                progress.taskID = task.id
                progress.type = task_type.value
                db_session.add(progress)
        
        db_session.flush()
        
    def createTask(self, db_session: Session, user_id: UUID, type: TaskType, **taskparams) -> "Task":
        if not self.checkPerms(db_session, user_id, GroupRole.ADMIN):
            raise PermissionDeniedError("User does not have permission to create tasks in this group")
        new_task = None
        new_progress = None
        if type == TaskType.ENDLESS:
            new_task = EndlessTask()
            for member in self.members:
                progress = EndlessTaskProgress()
                progress.groupMemberID = member.id
                progress.taskID = new_task.id
                progress.type = type
                db_session.add(progress)
        elif type == TaskType.ONE_TIME:
            new_task = OneTimeTask()
            new_task.deadline = taskparams.get("deadline")
            for member in self.members:
                progress = OneTimeTaskProgress()
                progress.groupMemberID = member.id
                progress.taskID = new_task.id
                progress.type = type
                db_session.add(progress)
        elif type == TaskType.REPEATABLE:
            new_task = RepeatableTask()
            new_task.frequency = taskparams.get("frequency") 
            for member in self.members:
                progress = RepeatableTaskProgress()
                progress.groupMemberID = member.id
                progress.taskID = new_task.id
                progress.type = type
                db_session.add(progress)
        elif type == TaskType.CHALLENGE:
            new_task = ChallengeTask()
            new_task.deadline = taskparams.get("deadline")
            for member in self.members:
                progress = ChallengeTaskProgress()
                progress.groupMemberID = member.id
                progress.taskID = new_task.id
                progress.type = type
                db_session.add(progress)
        else:
            raise ValidationError("Invalid task type")

        new_task.name = (taskparams.get("name", "") or "").strip()
        if new_task.name == "" and not self.isBingo:
            raise ValidationError("Task name cannot be empty")
        new_task.description = taskparams.get("description") or ""
        new_task.goal = taskparams.get("goal")
        new_task.unit = taskparams.get("unit")
        new_task.groupID = self.id
        new_task.ownerID = user_id
        new_task.type = type.value
        db_session.add(new_task)

        new_params = TaskParams()
        new_params.taskID = new_task.id
        new_params.color = taskparams.get("color", None)
        new_params.photoRequired = taskparams.get("photoRequired", False)
        new_params.notifications = taskparams.get("notifications", False)
        db_session.add(new_params)

        db_session.flush()
        return new_task

    def changeGroupType(self, db_session: Session, user_id: UUID, new_type: TaskGroupType) -> None:
        if not self.checkPerms(db_session, user_id, GroupRole.OWNER):
            raise PermissionDeniedError("User does not have permission to change group type")
        if new_type == TaskGroupType.COMPETITIVE:
            return
        elif new_type == TaskGroupType.COOPERATIVE:
            owner_member = db_session.query(GroupMember).filter_by(groupID=self.id, userID=self.ownerID).first()
            if owner_member is None:
                raise StateError("Owner is not a member of this group")

            for task in self.tasks:
                owner_progress = db_session.query(TaskProgress).filter_by(groupMemberID=owner_member.id, taskID=task.id).first()
                for progress in db_session.query(TaskProgress).filter_by(taskID=task.id).all():
                    if progress.id != owner_progress.id:
                        owner_progress._silentUpdateProgress(db_session, progress.value)
                        for entry in db_session.query(ProgressEntry).filter_by(taskProgressID=progress.id).all():
                            entry.taskProgressID = owner_progress.id
                            owner_progress._silentUpdateProgress(db_session, entry.value)
                        db_session.delete(progress)

            self.type = TaskGroupType.COOPERATIVE
            db_session.execute(
                CompetetiveTaskGroup.__table__.delete().where(CompetetiveTaskGroup.__table__.c.id == self.id)
            )
            db_session.execute(
                CooperativeTaskGroup.__table__.insert().values(id=self.id)
            )
        
        db_session.flush()

class CooperativeTaskGroup(TaskGroup):
    __tablename__ = "cooperative_task_groups"

    id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("task_groups.id", ondelete="CASCADE"),
        primary_key=True,
    )

    __mapper_args__ = {
        "polymorphic_identity": TaskGroupType.COOPERATIVE,
    }
    
    def addFriend(self, db_session: Session, user_id: UUID, friend_id: UUID, role: GroupRole) -> None:
        if role == GroupRole.OWNER:
            raise PermissionDeniedError("Insufficient permissions")
        elif role == GroupRole.ADMIN and not self.checkPerms(db_session, user_id, GroupRole.OWNER):
            raise PermissionDeniedError("Insufficient permissions")
        elif role == GroupRole.MEMBER and not self.checkPerms(db_session, user_id, GroupRole.ADMIN):
            raise PermissionDeniedError("Insufficient permissions")
        member = db_session.query(GroupMember).filter_by(groupID=self.id, userID=friend_id).first()
        if member is not None:
            if member.active:
                raise ConflictError("User is already a member of this group")
            else:
                member.active = True
                member.role = role
        else:
            new_member = GroupMember()
            new_member.groupID = self.id
            new_member.userID = friend_id
            new_member.role = role
            db_session.add(new_member)
        
        db_session.flush()
    
    def changeGroupType(self, db_session: Session, user_id: UUID, new_type: TaskGroupType) -> None:
        if not self.checkPerms(db_session, user_id, GroupRole.OWNER):
            raise PermissionDeniedError("User does not have permission to change group type")
        if new_type == TaskGroupType.COOPERATIVE:
            return
        elif new_type == TaskGroupType.COMPETITIVE:
            owner_member = db_session.query(GroupMember).filter_by(groupID=self.id, userID=self.ownerID).first()
            if owner_member is None:
                raise StateError("Owner is not a member of this group")
            
            for task in self.tasks:
                for member in self.members:
                    if member.id == owner_member.id:
                        continue
                    progress = RepeatableTaskProgress() if task.type == TaskType.REPEATABLE.value else (OneTimeTaskProgress() if task.type == TaskType.ONE_TIME.value else (EndlessTaskProgress() if task.type == TaskType.ENDLESS.value else ChallengeTaskProgress())) #TODO za długie XD
                    progress.groupMemberID = member.id
                    progress.taskID = task.id
                    progress.type = TaskType(task.type) if isinstance(task.type, str) else task.type
                    db_session.add(progress)
                db_session.flush()

                owner_progress = db_session.query(TaskProgress).filter_by(groupMemberID=owner_member.id, taskID=task.id).first()
                for entry in owner_progress.entries:
                    if entry.memberID != owner_member.id:
                        real_progress = db_session.query(TaskProgress).filter_by(groupMemberID=entry.memberID, taskID=task.id).first()
                        entry.taskProgressID = real_progress.id
                        real_progress._silentUpdateProgress(db_session, entry.value)
                        owner_progress._silentUpdateProgress(db_session, -entry.value)
                        
            self.type = TaskGroupType.COMPETITIVE
            db_session.execute(
                CooperativeTaskGroup.__table__.delete().where(CooperativeTaskGroup.__table__.c.id == self.id)
            )
            db_session.execute(
                CompetetiveTaskGroup.__table__.insert().values(id=self.id)
            )
        
        db_session.flush()
        
    def createTask(self, db_session: Session, user_id: UUID, type: TaskType, **taskparams) -> "Task":
        if not self.checkPerms(db_session, user_id, GroupRole.ADMIN):
            raise PermissionDeniedError("User does not have permission to create tasks in this group")
        new_task = None
        new_progress = None
        if type == TaskType.ENDLESS:
            new_task = EndlessTask()
            new_progress = EndlessTaskProgress()
        elif type == TaskType.ONE_TIME:
            new_task = OneTimeTask()
            new_task.deadline = taskparams.get("deadline")
            new_progress = OneTimeTaskProgress()
        elif type == TaskType.REPEATABLE:
            new_task = RepeatableTask()
            new_task.frequency = taskparams.get("frequency") 
            new_progress = RepeatableTaskProgress()
            #new_progress.counter = 0
        elif type == TaskType.CHALLENGE:
            new_task = ChallengeTask()
            new_task.deadline = taskparams.get("deadline")
            new_progress = ChallengeTaskProgress()
        else:
            raise ValidationError("Invalid task type")

        new_task.name = (taskparams.get("name", "") or "").strip()
        if new_task.name == "" and not self.isBingo:
            raise ValidationError("Task name cannot be empty")
        new_task.description = taskparams.get("description") or ""
        new_task.goal = taskparams.get("goal")
        new_task.unit = taskparams.get("unit")
        new_task.groupID = self.id
        new_task.ownerID = user_id
        new_task.type = type.value
        db_session.add(new_task)

        new_params = TaskParams()
        new_params.taskID = new_task.id
        new_params.color = taskparams.get("color", None)
        new_params.photoRequired = taskparams.get("photoRequired", False)
        new_params.notifications = taskparams.get("notifications", False)
        db_session.add(new_params)

        new_progress.taskID = new_task.id
        owner_member = db_session.query(GroupMember).filter_by(groupID=self.id, userID=self.ownerID).first()
        if owner_member is None:
            raise StateError("Owner is not a member of this group")
        new_progress.groupMemberID = owner_member.id
        new_progress.type = type
        db_session.add(new_progress)

        db_session.flush()
        return new_task

class GroupMember(Base):
    __tablename__ = "group_members"
    __table_args__ = (
        UniqueConstraint("userID", "groupID", name="uq_group_member_user_group"),
        Index("ix_group_members_group_active", "groupID", "active"),
        Index("ix_group_members_user_active", "userID", "active"),
    )

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)

    userID: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    groupID: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("task_groups.id", ondelete="CASCADE"),
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
    taskProgresses: Mapped[list[TaskProgress]] = relationship(
        "TaskProgress",
        back_populates="groupMember",
    )
    progressEntries: Mapped[list[ProgressEntry]] = relationship(
        "ProgressEntry",
        back_populates="groupMember",
    )

    def changePermissions(self, db_session: Session, new_role: GroupRole, by_user_id: UUID) -> None:
        if self.role == GroupRole.OWNER:
            raise StateError("Can't change owner's permissions")
        if self.role == new_role:
            return #a może error?
        
        if new_role == GroupRole.OWNER:
            raise PermissionDeniedError("Insufficient permissions")
        elif new_role == GroupRole.ADMIN and not self.group.checkPerms(db_session, by_user_id, GroupRole.OWNER):
            raise PermissionDeniedError("Insufficient permissions")
        elif new_role == GroupRole.MEMBER and not self.group.checkPerms(db_session, by_user_id, GroupRole.ADMIN):
            raise PermissionDeniedError("Insufficient permissions")
        
        self.role=new_role
        db_session.flush()

    def removeMember(self, db_session: Session, take_progress: bool, punisher: UUID) -> None:
        if self.role == GroupRole.OWNER:
            raise StateError("Can't remove owner")
        if self.userID != punisher:
            if self.role == GroupRole.ADMIN and not self.group.checkPerms(db_session, punisher, GroupRole.OWNER):
                raise PermissionDeniedError("Insufficient permissions")
            elif self.role == GroupRole.MEMBER and not self.group.checkPerms(db_session, punisher, GroupRole.ADMIN):
                raise PermissionDeniedError("Insufficient permissions")
        
        if not take_progress:
            self.active = False
        else:
            for progress in self.taskProgresses:
                db_session.delete(progress)
            db_session.delete(self)
        
        db_session.flush()
            
        
            


class Task(Base):
    __tablename__ = "tasks"
    __table_args__ = (
        CheckConstraint("name <> ''", name="ck_tasks_name_not_empty"),
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
    unit: Mapped[str | None] = mapped_column(String(32), nullable=True)
    type: Mapped[TaskType] = mapped_column(
        SAEnum(
            TaskType,
            name="task_type",
            native_enum=True,
            values_callable=lambda enum_cls: [member.value for member in enum_cls],
        ),
        nullable=False,
    )

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
    #new_data: name, description, goal
    def edit(self, db_session: Session, user_id: UUID, **new_data: Any) -> None:
        if not self.group.checkPerms(db_session, user_id, GroupRole.ADMIN):
            raise PermissionDeniedError("User does not have permission to edit this task")
        new_name = self.name
        new_description = self.description
        new_goal = self.goal
        if "name" in new_data:
            if new_data["name"].strip() == "":
                raise ValidationError("Task name cannot be empty")
            new_name = new_data["name"]
        if "description" in new_data:
            new_description = new_data["description"]
        if "goal" in new_data:
            self.goal = new_data["goal"]
            for progress in self.progresses:
                progress._silentUpdateProgress(db_session, 0) #update statusu
        
        self.name = new_name
        self.description = new_description
        db_session.flush()
        

    def delete(self, db_session: Session, user_id: UUID) -> None:
        db_session.delete(self)
        db_session.flush()

    def changeTaskType(self, db_session: Session, user_id: UUID, new_type: TaskType) -> None:
        if not self.group.checkPerms(db_session, user_id, GroupRole.ADMIN):
            raise PermissionDeniedError("User does not have permission to change task type")
        current_type = TaskType(self.type) if isinstance(self.type, str) else self.type
        if new_type == current_type:
            return

        task_table_map = {
            TaskType.ENDLESS: EndlessTask.__table__,
            TaskType.ONE_TIME: OneTimeTask.__table__,
            TaskType.REPEATABLE: RepeatableTask.__table__,
            TaskType.CHALLENGE: ChallengeTask.__table__,
        }
        progress_table_map = {
            TaskType.ENDLESS: EndlessTaskProgress.__table__,
            TaskType.ONE_TIME: OneTimeTaskProgress.__table__,
            TaskType.REPEATABLE: RepeatableTaskProgress.__table__,
            TaskType.CHALLENGE: ChallengeTaskProgress.__table__,
        }

        self.type = new_type

        old_task_table = task_table_map[current_type]
        new_task_table = task_table_map[new_type]
        db_session.execute(old_task_table.delete().where(old_task_table.c.id == self.id))
        if new_type == TaskType.REPEATABLE:
            db_session.execute(new_task_table.insert().values(id=self.id, frequency=None))
        elif new_type in (TaskType.ONE_TIME, TaskType.CHALLENGE):
            db_session.execute(new_task_table.insert().values(id=self.id, deadline=None))
        else:
            db_session.execute(new_task_table.insert().values(id=self.id))

        progress_ids = [row[0] for row in db_session.query(TaskProgress.id).filter_by(taskID=self.id).all()]
        if progress_ids:
            old_progress_table = progress_table_map[current_type]
            new_progress_table = progress_table_map[new_type]
            db_session.execute(old_progress_table.delete().where(old_progress_table.c.id.in_(progress_ids)))
            db_session.query(TaskProgress).filter_by(taskID=self.id).update(
                {"type": new_type.value},
                synchronize_session=False,
            )
            if new_type == TaskType.REPEATABLE:
                db_session.execute(
                    new_progress_table.insert(),
                    [{"id": progress_id, "counter": 0, "streak": 0} for progress_id in progress_ids],
                )
            else:
                db_session.execute(
                    new_progress_table.insert(),
                    [{"id": progress_id} for progress_id in progress_ids],
                )
            for progress in list(self.progresses):
                if progress in db_session:
                    db_session.expunge(progress)
        
        db_session.flush()


class EndlessTask(Task):
    __tablename__ = "endless_tasks"

    id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("tasks.id", ondelete="CASCADE"),
        primary_key=True,
    )

    __mapper_args__ = {
        "polymorphic_identity": TaskType.ENDLESS,
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
        "polymorphic_identity": TaskType.ONE_TIME,
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
        "polymorphic_identity": TaskType.REPEATABLE,
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
        "polymorphic_identity": TaskType.CHALLENGE,
    }


class TaskProgress(Base):
    __tablename__ = "task_progresses"
    __table_args__ = (
        UniqueConstraint("groupMemberID", "taskID", name="uq_task_progress_group_member_task"),
        Index("ix_task_progresses_task_type", "taskID", "type"),
        Index("ix_task_progresses_group_member_task", "groupMemberID", "taskID"),
    )

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    groupMemberID: Mapped[UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("group_members.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    taskID: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("tasks.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    status: Mapped[TaskStatus] = mapped_column(
        SAEnum(TaskStatus, name="task_status", native_enum=True),
        nullable=False,
        default=TaskStatus.TODO,
    )
    value: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    type: Mapped[str] = mapped_column(String(32), nullable=False)

    groupMember: Mapped[GroupMember | None] = relationship("GroupMember", back_populates="taskProgresses")
    task: Mapped[Task] = relationship("Task", back_populates="progresses")
    entries: Mapped[list[ProgressEntry]] = relationship(
        "ProgressEntry",
        back_populates="taskProgress",
        cascade="all, delete-orphan",
    )

    @property
    def userID(self) -> UUID | None:
        return self.groupMember.userID if self.groupMember is not None else None

    @property
    def userId(self) -> UUID | None:
        return self.userID

    __mapper_args__ = {
        "polymorphic_on": type,
        "with_polymorphic": "*",
        "polymorphic_abstract": True,
    }

    def _validate_update(self, db_session: Session, delta_value: float, user_id: UUID, photoUrl: str | None) -> None:
        group = self.task.group
        if not group.checkPerms(db_session, user_id, GroupRole.MEMBER):
            raise PermissionDeniedError("User does not have permission to update progress for this task")
        if self.userID != user_id and group.type == TaskGroupType.COMPETITIVE:
            raise PermissionDeniedError("User does not have permission to update progress for this task")
        if self.task.params and self.task.params.photoRequired and not photoUrl:
            raise ValidationError("Photo is required to update progress for this task")
        if not isinstance(delta_value, (int, float)):
            raise ValidationError("Invalid progress value")

    def _snapshot_state(self) -> dict[str, Any]:
        return {
            "value": self.value,
            "status": self.status,
        }

    def _restore_state(self, snapshot: dict[str, Any]) -> None:
        self.value = snapshot["value"]
        self.status = snapshot["status"]

    def _create_progress_entry(self, db_session: Session, user_id: UUID, message: str, photoUrl: str | None) -> None:
        member = db_session.query(GroupMember).filter_by(groupID=self.task.groupID, userID=user_id, active=True).first()
        if member is None:
            raise PermissionDeniedError("User is not a member of this group")
        entry = ProgressEntry()
        entry.taskProgress = self
        entry.memberID = member.id
        entry.message = message
        entry.photoUrl = photoUrl
        db_session.add(entry)
        
    def _silentUpdateProgress(self,db_session: Session,delta_value: float,) -> None: #nowe, idk czy testy
        self.value += delta_value
        if self.task.goal is not None and self.value >= self.task.goal:
            self.status = TaskStatus.DONE
        elif self.value != 0:
            self.status = TaskStatus.IN_PROGRESS
        
        db_session.flush()


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

    def updateProgress(self, db_session: Session, delta_value: float, user_id: UUID, message: str, photoUrl: str | None = None) -> None:
        self._validate_update(db_session, delta_value, user_id, photoUrl)
        snapshot = self._snapshot_state()

        self.value = self.value + float(delta_value)
        self.status = TaskStatus.IN_PROGRESS if self.value != 0 else TaskStatus.TODO

        self._create_progress_entry(db_session, user_id, message, photoUrl)
        try:
            db_session.flush()
        except Exception:
            self._restore_state(snapshot)
            raise


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

    def updateProgress(self, db_session: Session, delta_value: float, user_id: UUID, message: str, photoUrl: str | None = None) -> None:
        self._validate_update(db_session, delta_value, user_id, photoUrl)
        snapshot = self._snapshot_state()

        self.value = self.value + float(delta_value)
        if self.task.goal is not None and self.value >= self.task.goal:
            self.status = TaskStatus.DONE
        else:
            self.status = TaskStatus.IN_PROGRESS

        self._create_progress_entry(db_session, user_id, message, photoUrl)
        try:
            db_session.flush()
        except Exception:
            self._restore_state(snapshot)
            raise


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

    def _snapshot_state(self) -> dict[str, Any]:
        snapshot = super()._snapshot_state()
        snapshot["counter"] = self.counter
        snapshot["streak"] = self.streak
        return snapshot

    def _restore_state(self, snapshot: dict[str, Any]) -> None:
        super()._restore_state(snapshot)
        self.counter = snapshot["counter"]
        self.streak = snapshot["streak"]

    def updateProgress(self, db_session: Session, delta_value: float, user_id: UUID, message: str, photoUrl: str | None = None) -> None:
        self._validate_update(db_session, delta_value, user_id, photoUrl)
        snapshot = self._snapshot_state()

        self.value = self.value + float(delta_value)
        if self.task.goal is not None and self.value >= self.task.goal and self.status != TaskStatus.DONE:
            self.status = TaskStatus.DONE
            self.counter+=1
            self.streak+=1
        else:
            self.status = TaskStatus.IN_PROGRESS

        self._create_progress_entry(db_session, user_id, message, photoUrl)
        try:
            db_session.flush()
        except Exception:
            self._restore_state(snapshot)
            raise
        
    def _silentUpdateProgress(self,db_session: Session,delta_value: float,) -> None: #nowe, idk czy testy
        self.value += delta_value
        if self.task.goal is not None and self.value >= self.task.goal and self.status != TaskStatus.DONE:
            self.status = TaskStatus.DONE
            self.counter+=1
            self.streak+=1
        elif self.value < self.task.goal and self.status == TaskStatus.DONE:
            self.status = TaskStatus.IN_PROGRESS
            self.streak-=1
        elif self.value != 0:
            self.status = TaskStatus.IN_PROGRESS
        
        db_session.flush()


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

    def updateProgress(self, db_session: Session, delta_value: float, user_id: UUID, message: str, photoUrl: str | None = None) -> None:
        self._validate_update(db_session, delta_value, user_id, photoUrl)
        snapshot = self._snapshot_state()

        self.value = self.value + float(delta_value)
        if self.task.goal is not None and self.value >= self.task.goal:
            self.status = TaskStatus.DONE
        else:
            self.status = TaskStatus.IN_PROGRESS

        self._create_progress_entry(db_session, user_id, message, photoUrl)
        try:
            db_session.flush()
        except Exception:
            self._restore_state(snapshot)
            raise


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

    @validates("color")
    def _validate_color(self, key: str, value: str | None) -> str | None:
        if value is None:
            return None
        if not isinstance(value, str):
            raise ValidationError("Invalid color")
        color = value.strip()
        if color == "":
            return ""
        if _COLOR_HEX_RE.match(color):
            return color
        raise ValidationError("Invalid color")

    def edit(self, db_session: Session, photoRequired: bool | None = None, color: str | None = None, notifications: bool | None = None) -> None:
        if not self.task.group.checkPerms(db_session, self.task.ownerID, GroupRole.ADMIN):
            raise PermissionDeniedError("User does not have permission to edit this task's parameters")
        new_PhotoRequired = self.photoRequired
        new_color = self.color
        new_notifications = self.notifications
        if photoRequired is not None:
            new_PhotoRequired = photoRequired
        if color is not None:
            new_color = color
        if notifications is not None:
            new_notifications = notifications
        self.photoRequired = new_PhotoRequired
        self.color = new_color
        self.notifications = new_notifications
        db_session.flush()

    


class ProgressEntry(Base):
    __tablename__ = "progress_entries"

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    memberID: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("group_members.id", ondelete="CASCADE"),
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

    groupMember: Mapped[GroupMember] = relationship("GroupMember", back_populates="progressEntries")
    taskProgress: Mapped[TaskProgress] = relationship("TaskProgress", back_populates="entries")
    comments: Mapped[list[Comment]] = relationship(
        "Comment",
        back_populates="progressEntry",
        cascade="all, delete-orphan",
    )

    def validate(self, db_session: Session) -> bool:
        params = db_session.query(TaskParams).filter(TaskParams.taskID == self.taskProgress.taskID).first()
        if not params:
            raise StateError("no to niemożliwe akurat")
        if params.photoRequired and not self.photoUrl:
            return False
        return True

    def delete(self, db_session: Session) -> None:
        self.taskProgress._silentUpdateProgress(db_session, -self.value)
        db_session.delete(self)
        db_session.flush()

    def addComment(self, db_session: Session, user_id: UUID, message: str) -> None:
        if message.strip() == "":
            raise ValidationError("Comment message cannot be empty")
        if self.taskProgress.task.group.privacy == PrivacyLevel.PRIVATE and not db_session.query(GroupMember).filter_by(groupID=self.taskProgress.task.groupID, userID=user_id, active=True).first():
            raise PermissionDeniedError("User is not a member of the task's group") #TODO za długie query, nieefektywne imo
        comment = Comment()
        comment.userID = user_id
        comment.progressEntryID = self.id
        comment.message = message
        db_session.add(comment)
        db_session.flush()


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
        db_session.flush()


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
