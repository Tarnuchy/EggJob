from uuid import UUID
from datetime import datetime
from abc import ABC
from enum import Enum
from typing import Any

# Pomocnicze typy wyliczeniowe dla pól z diagramu
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


class User:
    id: UUID
    accountID: UUID
    username: str
    photoUrl: str

    def editProfile(self) -> None:
        pass

    def inviteFriend(self) -> None:
        pass

class Account:
    id: UUID
    email: str
    passwordHash: str
    registrationDate: datetime

    def register(self, db_session) -> bool:
        pass

    def login(self) -> bool:
        pass

    def deleteAccount(self) -> None:
        pass

    def createUser(self) -> None:
        pass

class Friendship:
    id: UUID
    userOneID: UUID
    userTwoID: UUID
    acceptedAt: datetime

    def deleteFriend(self) -> None:
        pass

class Invitation:
    id: UUID
    fromUserID: UUID
    toUserID: UUID
    date: datetime

    def accept(self) -> None:
        pass

    def reject(self) -> None:
        pass

    def cancel(self) -> None:
        pass

    def notify(self) -> None:
        pass

class Notification:
    id: UUID
    userID: UUID
    message: str
    date: datetime
    active: bool

    def read(self) -> None:
        pass

class TaskGroup(ABC):
    id: UUID
    ownerID: UUID
    name: str
    taskCount: int
    privacy: PrivacyLevel
    inviteCode: str
    createdAt: datetime

    def edit(self) -> None:
        pass

    def delete(self) -> None:
        pass

    def addFriend(self) -> None:
        pass

    def changePermissions(self) -> None:
        pass

    def removeMember(self) -> None:
        pass
    
    def createTask(self) -> None: #nowe
        pass
    
    def changeGroupType(self) -> None: #nowe
        pass

class CompetetiveTaskGroup(TaskGroup):
    pass

class CooperativeTaskGroup(TaskGroup):
    pass

class GroupMember:
    userID: UUID
    groupID: UUID
    active: bool
    role: GroupRole
    joinedAt: datetime

    #jak ktoś wychodzi/zostaje usunięty można zostawiać jego ducha który ma progress tasków
    def leaveGroup(self) -> None:
        pass

class Task(ABC):
    id: UUID
    ownerID: UUID
    groupID: UUID
    name: str
    description: str
    goal: float #raczej zawsze dodatnie
    status: TaskStatus

    def edit(self) -> None:
        pass

    def delete(self) -> None:
        pass
    
    def changeTaskType(self) -> None:
        pass

class EndlessTask(Task):
    pass

class OneTimeTask(Task):
    deadline: datetime

class RepeatableTask(Task): # moze jakies end date czy cos?
    frequency: TimeInterval 
    streakGoal: int #nowe

class ChallengeTask(Task): #czy mozna go dodac do coop tg? chyba nie ??
    deadline: datetime


class TaskProgress(ABC):
    id: UUID #wyjebac   # a jednak nie?? bo moze byc kilka progressow przeciez!!!dla challenge taska
    userID: UUID # nowe, None dla coop, wazne dla competetive
    taskID: UUID
    value: float

    def updateProgress(self) -> None:
        pass

class EndlessTaskProgress(TaskProgress):
    pass

class OneTimeTaskProgress(TaskProgress):
    pass

class RepeatableTaskProgress(TaskProgress):
    counter: int
    streak: int

class ChallengeTaskProgress(TaskProgress):
    pass

class TaskParams:
    taskID: UUID
    photoRequired: bool
    color: str
    notifications: bool

    def edit(self) -> None:
        pass


class ProgressEntry:
    id: UUID
    userID: UUID
    TaskProgressID: UUID # = taskID  #cap level 1000000000
    value: float
    message: str
    photoUrl: str
    createdAt: datetime

    def validate(self) -> bool:
        pass
    
    def delete(self) -> None: #nowe
        pass

class Comment:
    id: UUID
    userID: UUID
    progressEntryID: UUID
    message: str
    date: datetime

    def addComment(self) -> None:
        pass

    def deleteComment(self) -> None:
        pass
