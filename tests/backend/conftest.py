from datetime import datetime
from uuid import uuid4

import pytest
from sqlalchemy.orm import sessionmaker

from src.backend.database import Base, build_engine, get_test_database_url
from src.backend.models import *
from src.backend.security import *

TEST_ENGINE = build_engine(get_test_database_url())
TestingSessionLocal = sessionmaker(bind=TEST_ENGINE, autoflush=False, autocommit=False)

@pytest.fixture
def db_session():
    """Real PostgreSQL-backed session for backend tests."""
    Base.metadata.drop_all(bind=TEST_ENGINE)
    Base.metadata.create_all(bind=TEST_ENGINE)

    session = TestingSessionLocal()
    try:
        yield session
    finally:
        try:
            session.close()
        finally:
            Base.metadata.drop_all(bind=TEST_ENGINE)


# =============================================
# =============== ACCOUNTS+USERS ==============

@pytest.fixture
def account_a(db_session):
    account = Account()

    account.id = uuid4()
    account.email = "user_A@example.com"
    account.passwordHash = hash_password("P@ssw0rd_A")
    account.registrationDate = datetime(2020, 4, 4, 12, 0, 0)

    db_session.add(account)
    db_session.commit()
    return account

@pytest.fixture
def user_a(db_session, account_a):
    user = User()
    user.id = uuid4()
    user.accountID = account_a.id
    user.username = "user_A"
    user.photoUrl = "https://example.com/user_A.jpg"

    db_session.add(user)
    db_session.commit()
    return user


@pytest.fixture
def account_b(db_session):
    account = Account()

    account.id = uuid4()
    account.email = "user_B@example.com"
    account.passwordHash = hash_password("P@ssw0rd_B")
    account.registrationDate = datetime(2020, 4, 4, 12, 5, 0)

    db_session.add(account)
    db_session.commit()
    return account

@pytest.fixture
def user_b(db_session, account_b):
    user = User()
    user.id = uuid4()
    user.accountID = account_b.id
    user.username = "user_B"
    user.photoUrl = "https://example.com/user_B.jpg"

    db_session.add(user)
    db_session.commit()
    return user


@pytest.fixture
def account_c(db_session):
    account = Account()

    account.id = uuid4()
    account.email = "user_C@example.com"
    account.passwordHash = hash_password("P@ssw0rd_C")
    account.registrationDate = datetime(2020, 4, 4, 12, 10, 0)

    db_session.add(account)
    db_session.commit()
    return account

@pytest.fixture
def user_c(db_session, account_c):
    user = User()
    user.id = uuid4()
    user.accountID = account_c.id
    user.username = "user_C"
    user.photoUrl = "https://example.com/user_C.jpg"
    
    db_session.add(user)
    db_session.commit()
    return user


@pytest.fixture
def account_d(db_session):
    account = Account()

    account.id = uuid4()
    account.email = "user_D@example.com"
    account.passwordHash = hash_password("P@ssw0rd_D")
    account.registrationDate = datetime(2020, 4, 4, 12, 15, 0)

    db_session.add(account)
    db_session.commit()
    return account

@pytest.fixture
def user_d(db_session, account_d):
    user = User()
    user.id = uuid4()
    user.accountID = account_d.id
    user.username = "user_D"
    user.photoUrl = "https://example.com/user_D.jpg"
   
    db_session.add(user)
    db_session.commit()
    return user

# =============== ACCOUNTS+USERS ==============
# =============================================



# =============================================
# ================ FRIENDSHIPS ================


# TODO? dodac symetrycznie zeby bylo AB BA itp
@pytest.fixture
def friendship_ab(db_session, user_a, user_b):
    friendship = Friendship()
    friendship.userOneID = user_a.id
    friendship.userTwoID = user_b.id
    friendship.acceptedAt = datetime(2021, 4, 4, 13, 0, 0)
    
    db_session.add(friendship)
    db_session.commit()
    return friendship

@pytest.fixture
def friendship_bc(db_session, user_b, user_c):
    friendship = Friendship()
    friendship.userOneID = user_b.id
    friendship.userTwoID = user_c.id
    friendship.acceptedAt = datetime(2021, 4, 4, 13, 0, 0)
    
    db_session.add(friendship)
    db_session.commit()
    return friendship

# ================ FRIENDSHIPS ================
# =============================================



# =============================================
# ======= INVITATIONS + NOTIFICATIONS =========

@pytest.fixture
def invitation_cd(db_session, user_c, user_d):
    invitation = Invitation()
    invitation.fromUserID = user_c.id
    invitation.toUserID = user_d.id
    invitation.date = datetime(2021, 4, 4, 12, 0, 0)
    
    db_session.add(invitation)
    db_session.commit()
    return invitation

@pytest.fixture
def notification_d(db_session, user_d, user_c):
    notification = Notification()
    notification.id = uuid4()
    notification.userID = user_d.id
    notification.message = f"User {user_c.username} sent you an invite"
    notification.date = datetime(2021, 4, 4, 12, 0, 0)
    notification.active = True
    
    db_session.add(notification)
    db_session.commit()
    return notification


# ======= INVITATIONS + NOTIFICATIONS =========
# =============================================



# =============================================
# ============== TASK  RELATED ================

@pytest.fixture
def TG_shoppingList(db_session, user_a):
    taskGroup = CooperativeTaskGroup()
    taskGroup.id = uuid4()
    taskGroup.ownerID = user_a.id
    taskGroup.name = "Shopping List"
    taskGroup.taskCount = 4
    taskGroup.isBingo = False
    taskGroup.privacy = PrivacyLevel.PRIVATE
    taskGroup.inviteCode = "TEST-CODE-1" # ??
    """
    from hashids import Hashids
    hashids = Hashids(salt="twoja_tajna_sol", min_length=6, alphabet="ABCDEFGHJKLMNPQRSTUVWXYZ23456789")
    code = hashids.encode(123) # Gdzie 123 to ID grupy z bazy
    # Wynik: "NVYAL6"
    """
    taskGroup.createdAt = datetime(2025, 4, 4, 13, 0, 0)

    db_session.add(taskGroup)
    db_session.commit()
    return taskGroup

@pytest.fixture
def GM_shoppingList_owner(db_session, TG_shoppingList, user_a):
    groupMember = GroupMember()
    groupMember.userID = user_a.id
    groupMember.groupID = TG_shoppingList.id
    groupMember.active = True
    groupMember.role = GroupRole.OWNER
    groupMember.joinedAt = TG_shoppingList.createdAt

    db_session.add(groupMember)
    db_session.commit()
    return groupMember

@pytest.fixture
def GM_shoppingList_member(db_session, TG_shoppingList, user_b):
    groupMember = GroupMember()
    groupMember.userID = user_b.id
    groupMember.groupID = TG_shoppingList.id
    groupMember.active = True
    groupMember.role = GroupRole.MEMBER
    groupMember.joinedAt = datetime(2025, 4, 4, 14, 0, 0)

    db_session.add(groupMember)
    db_session.commit()
    return groupMember

@pytest.fixture
def GM_shoppingList_ghost(db_session, TG_shoppingList, user_d):
    groupMember = GroupMember()
    groupMember.userID = user_d.id
    groupMember.groupID = TG_shoppingList.id
    groupMember.active = False
    groupMember.role = GroupRole.MEMBER
    groupMember.joinedAt = datetime(2025, 4, 4, 15, 0, 0)

    db_session.add(groupMember)
    db_session.commit()
    return groupMember


# ----------------------------------- eggs ---------------------------------------
@pytest.fixture
def task_shoppingList_eggs(db_session, TG_shoppingList, GM_shoppingList_owner):
    task = OneTimeTask()
    task.id = uuid4()
    task.ownerID = GM_shoppingList_owner.userID
    task.groupID = TG_shoppingList.id
    task.name = "eggs"
    task.description = ""
    task.goal = 20
    task.status = TaskStatus.IN_PROGRESS
    task.deadline = None

    db_session.add(task)
    db_session.commit()
    return task

@pytest.fixture
def TaskParams_shoppingList_eggs(db_session, task_shoppingList_eggs):
    taskParams = TaskParams()
    taskParams.taskID = task_shoppingList_eggs.id
    taskParams.photoRequired = False
    taskParams.color = None
    taskParams.notifications = False

    db_session.add(taskParams)
    db_session.commit()
    return taskParams

@pytest.fixture
def TaskProgress_shoppingList_eggs(db_session, task_shoppingList_eggs):
    taskProgress = OneTimeTaskProgress()
    taskProgress.id = uuid4()
    taskProgress.userID = task_shoppingList_eggs.ownerID
    taskProgress.taskID = task_shoppingList_eggs.id
    taskProgress.value = 10

    db_session.add(taskProgress)
    db_session.commit()
    return taskProgress

@pytest.fixture
def PE_shoppingList_eggs(db_session, TaskProgress_shoppingList_eggs, GM_shoppingList_ghost):
    progressEntry = ProgressEntry()
    progressEntry.id = uuid4()
    progressEntry.TaskProgressID = TaskProgress_shoppingList_eggs.id
    progressEntry.userID = GM_shoppingList_ghost.userID
    progressEntry.value = 10
    progressEntry.message = "bylo tylko 10 jaj"
    progressEntry.photoUrl = None
    progressEntry.createdAt = datetime(2025, 4, 4, 16, 0, 0)

    db_session.add(progressEntry)
    db_session.commit()
    return progressEntry

@pytest.fixture
def comment_shoppingList_eggs(db_session, PE_shoppingList_eggs, user_a):
    comment = Comment()
    comment.id = uuid4()
    comment.userID = user_a.id
    comment.progressEntryID = PE_shoppingList_eggs.id
    comment.message = "aha to wypierdalaj"
    comment.date = datetime(2025, 4, 4, 17, 0, 0)

    db_session.add(comment)
    db_session.commit()
    return comment

@pytest.fixture
def eggs_bundle(
task_shoppingList_eggs,
TaskParams_shoppingList_eggs,
TaskProgress_shoppingList_eggs,
PE_shoppingList_eggs,
comment_shoppingList_eggs,
):
    return {
    "task": task_shoppingList_eggs,
    "params": TaskParams_shoppingList_eggs,
    "progress": TaskProgress_shoppingList_eggs,
    "entries": [PE_shoppingList_eggs],
    "comments": [comment_shoppingList_eggs],
}

# ----------------------------------- milk ---------------------------------------
@pytest.fixture
def task_shoppingList_milk(db_session, TG_shoppingList, GM_shoppingList_owner):
    task = OneTimeTask()
    task.id = uuid4()
    task.ownerID = GM_shoppingList_owner.userID
    task.groupID = TG_shoppingList.id
    task.name = "milk"
    task.description = "mleko krowie 2%"
    task.goal = 2
    task.status = TaskStatus.TODO
    task.deadline = None

    db_session.add(task)
    db_session.commit()
    return task

@pytest.fixture
def TaskParams_shoppingList_milk(db_session, task_shoppingList_milk):
    taskParams = TaskParams()
    taskParams.taskID = task_shoppingList_milk.id
    taskParams.photoRequired = False
    taskParams.color = None
    taskParams.notifications = False

    db_session.add(taskParams)
    db_session.commit()
    return taskParams

@pytest.fixture
def TaskProgress_shoppingList_milk(db_session, task_shoppingList_milk):
    taskProgress = OneTimeTaskProgress()
    taskProgress.id = uuid4()
    taskProgress.userID = task_shoppingList_milk.ownerID
    taskProgress.taskID = task_shoppingList_milk.id
    taskProgress.value = 0

    db_session.add(taskProgress)
    db_session.commit()
    return taskProgress

@pytest.fixture
def milk_bundle(
task_shoppingList_milk,
TaskParams_shoppingList_milk,
TaskProgress_shoppingList_milk,
):
    return {
    "task": task_shoppingList_milk,
    "params": TaskParams_shoppingList_milk,
    "progress": TaskProgress_shoppingList_milk,
    "entries": [],
    "comments": [],
}

# ----------------------------------- bread ---------------------------------------
@pytest.fixture
def task_shoppingList_bread(db_session, TG_shoppingList, GM_shoppingList_member):
    task = OneTimeTask()
    task.id = uuid4()
    task.ownerID = GM_shoppingList_member.userID
    task.groupID = TG_shoppingList.id
    task.name = "bread"
    task.description = ""
    task.goal = 1
    task.status = TaskStatus.DONE
    task.deadline = None

    db_session.add(task)
    db_session.commit()
    return task

@pytest.fixture
def TaskParams_shoppingList_bread(db_session, task_shoppingList_bread):
    taskParams = TaskParams()
    taskParams.taskID = task_shoppingList_bread.id
    taskParams.photoRequired = False
    taskParams.color = None
    taskParams.notifications = False

    db_session.add(taskParams)
    db_session.commit()
    return taskParams

@pytest.fixture
def TaskProgress_shoppingList_bread(db_session, task_shoppingList_bread):
    taskProgress = OneTimeTaskProgress()
    taskProgress.id = uuid4()
    taskProgress.userID = task_shoppingList_bread.ownerID
    taskProgress.taskID = task_shoppingList_bread.id
    taskProgress.value = 1

    db_session.add(taskProgress)
    db_session.commit()
    return taskProgress

@pytest.fixture
def PE_shoppingList_bread(db_session, TaskProgress_shoppingList_bread, GM_shoppingList_member):
    progressEntry = ProgressEntry()
    progressEntry.id = uuid4()
    progressEntry.TaskProgressID = TaskProgress_shoppingList_bread.id
    progressEntry.userID = GM_shoppingList_member.userID
    progressEntry.value = 1
    progressEntry.message = ""
    progressEntry.photoUrl = None
    progressEntry.createdAt = datetime(2025, 4, 4, 16, 0, 0)

    db_session.add(progressEntry)
    db_session.commit()
    return progressEntry

@pytest.fixture
def comment_shoppingList_bread_1(db_session, PE_shoppingList_bread, user_a):
    comment = Comment()
    comment.id = uuid4()
    comment.userID = user_a.id
    comment.progressEntryID = PE_shoppingList_bread.id
    comment.message = "super dzieki za chlebek"
    comment.date = datetime(2025, 4, 4, 18, 0, 0)

    db_session.add(comment)
    db_session.commit()
    return comment

@pytest.fixture
def comment_shoppingList_bread_2(db_session, PE_shoppingList_bread, user_d):
    comment = Comment()
    comment.id = uuid4()
    comment.userID = user_d.id
    comment.progressEntryID = PE_shoppingList_bread.id
    comment.message = "czy to chleb bezglutenowy?"
    comment.date = datetime(2025, 4, 4, 18, 10, 0)

    db_session.add(comment)
    db_session.commit()
    return comment

@pytest.fixture
def bread_bundle(
task_shoppingList_bread,
TaskParams_shoppingList_bread,
TaskProgress_shoppingList_bread,
PE_shoppingList_bread,
comment_shoppingList_bread_1,
comment_shoppingList_bread_2,
):
    return {
    "task": task_shoppingList_bread,
    "params": TaskParams_shoppingList_bread,
    "progress": TaskProgress_shoppingList_bread,
    "entries": [PE_shoppingList_bread],
    "comments": [comment_shoppingList_bread_1, comment_shoppingList_bread_2],
}


# ----------------------------------- cheese ---------------------------------------
@pytest.fixture
def task_shoppingList_cheese(db_session, TG_shoppingList, GM_shoppingList_ghost):
    task = OneTimeTask()
    task.id = uuid4()
    task.ownerID = GM_shoppingList_ghost.userID
    task.groupID = TG_shoppingList.id
    task.name = "cheese"
    task.description = "jakies dwa rozne rodzaje najlepiej"
    task.goal = 3
    task.status = TaskStatus.DONE
    task.deadline = None

    db_session.add(task)
    db_session.commit()
    return task

@pytest.fixture
def TaskParams_shoppingList_cheese(db_session, task_shoppingList_cheese):
    taskParams = TaskParams()
    taskParams.taskID = task_shoppingList_cheese.id
    taskParams.photoRequired = False
    taskParams.color = None
    taskParams.notifications = False

    db_session.add(taskParams)
    db_session.commit()
    return taskParams

@pytest.fixture
def TaskProgress_shoppingList_cheese(db_session, task_shoppingList_cheese):
    taskProgress = OneTimeTaskProgress()
    taskProgress.id = uuid4()
    taskProgress.userID = task_shoppingList_cheese.ownerID
    taskProgress.taskID = task_shoppingList_cheese.id
    taskProgress.value = 4

    db_session.add(taskProgress)
    db_session.commit()
    return taskProgress

@pytest.fixture
def PE_shoppingList_cheese_1(db_session, TaskProgress_shoppingList_cheese, GM_shoppingList_owner):
    progressEntry = ProgressEntry()
    progressEntry.id = uuid4()
    progressEntry.TaskProgressID = TaskProgress_shoppingList_cheese.id
    progressEntry.userID = GM_shoppingList_owner.userID
    progressEntry.value = 2
    progressEntry.message = "ser gouda"
    progressEntry.photoUrl = None
    progressEntry.createdAt = datetime(2025, 4, 4, 16, 0, 0)

    db_session.add(progressEntry)
    db_session.commit()
    return progressEntry

@pytest.fixture
def PE_shoppingList_cheese_2(db_session, TaskProgress_shoppingList_cheese, GM_shoppingList_member):
    progressEntry = ProgressEntry()
    progressEntry.id = uuid4()
    progressEntry.TaskProgressID = TaskProgress_shoppingList_cheese.id
    progressEntry.userID = GM_shoppingList_member.userID
    progressEntry.value = 2
    progressEntry.message = "ser cheddar"
    progressEntry.photoUrl = None
    progressEntry.createdAt = datetime(2025, 4, 4, 16, 0, 0)

    db_session.add(progressEntry)
    db_session.commit()
    return progressEntry

@pytest.fixture
def comment_shoppingList_cheese_1(db_session, PE_shoppingList_cheese_1, user_d):
    comment = Comment()
    comment.id = uuid4()
    comment.userID = user_d.id
    comment.progressEntryID = PE_shoppingList_cheese_1.id
    comment.message = "nie lubie sera gouda"
    comment.date = datetime(2025, 4, 4, 18, 0, 0)

    db_session.add(comment)
    db_session.commit()
    return comment

@pytest.fixture
def comment_shoppingList_cheese_2(db_session, PE_shoppingList_cheese_1, user_b):
    comment = Comment()
    comment.id = uuid4()
    comment.userID = user_b.id
    comment.progressEntryID = PE_shoppingList_cheese_1.id
    comment.message = "dobra git jest co ty gadasz"
    comment.date = datetime(2025, 4, 4, 18, 10, 0)

    db_session.add(comment)
    db_session.commit()
    return comment

@pytest.fixture
def cheese_bundle(
task_shoppingList_cheese,
TaskParams_shoppingList_cheese,
TaskProgress_shoppingList_cheese,
PE_shoppingList_cheese_1,
PE_shoppingList_cheese_2,
comment_shoppingList_cheese_1,
comment_shoppingList_cheese_2,
):
    return {
    "task": task_shoppingList_cheese,
    "params": TaskParams_shoppingList_cheese,
    "progress": TaskProgress_shoppingList_cheese,
    "entries": [PE_shoppingList_cheese_1, PE_shoppingList_cheese_2],
    "comments": [comment_shoppingList_cheese_1, comment_shoppingList_cheese_2],
}

# ---------------------------- shopping list bundle --------------------------------
@pytest.fixture
def shoppingList_bundle(
    TG_shoppingList,
    GM_shoppingList_owner,
    GM_shoppingList_member,
    GM_shoppingList_ghost,
    eggs_bundle,
    milk_bundle,
    bread_bundle,
    cheese_bundle,
):
    return {
        "TG": TG_shoppingList,
        "GM": {
            "owner": GM_shoppingList_owner,
            "member": GM_shoppingList_member,
            "ghost": GM_shoppingList_ghost,
        },
        "tasks": {
            "eggs": eggs_bundle,
            "milk": milk_bundle,
            "bread": bread_bundle,
            "cheese": cheese_bundle,
        }
    }
"""
    przyklad uzycia:
    def test_Task_delete(db_session, shoppingList_bundle):
        # Dostęp do konkretnego taska
        task_to_delete = shoppingList_bundle["tasks"]["eggs"]["task"]
        task_to_delete.delete()
        # Dostęp do konkretnego usera (np. żeby sprawdzić czy owner może usunąć taska)
        owner = shoppingList_bundle["GM"]["owner"]

    xdd
    mam nadzieje ze to bedzie tak dzialac bo jak nie to kurwa nie weim
"""
# ---------------------------- shopping list bundle --------------------------------






# -------------------------------------- EATING EGGS -------------------------------------
@pytest.fixture
def TG_eggChallenge(db_session, user_b):
    taskGroup = CompetetiveTaskGroup()
    taskGroup.id = uuid4()
    taskGroup.ownerID = user_b.id
    taskGroup.name = "EGG EATING CHALLENGE"
    taskGroup.taskCount = 1
    taskGroup.isBingo = False
    taskGroup.privacy = PrivacyLevel.PUBLIC
    taskGroup.inviteCode = "TEST-CODE-2"
    taskGroup.createdAt = datetime(2025, 4, 4, 13, 0, 0)

    db_session.add(taskGroup)
    db_session.commit()
    return taskGroup

@pytest.fixture
def GM_eggChallenge_owner(db_session, TG_eggChallenge, user_b):
    groupMember = GroupMember()
    groupMember.userID = user_b.id
    groupMember.groupID = TG_eggChallenge.id
    groupMember.active = True
    groupMember.role = GroupRole.OWNER
    groupMember.joinedAt = TG_eggChallenge.createdAt

    db_session.add(groupMember)
    db_session.commit()
    return groupMember

@pytest.fixture
def GM_eggChallenge_admin(db_session, TG_eggChallenge, user_c):
    groupMember = GroupMember()
    groupMember.userID = user_c.id
    groupMember.groupID = TG_eggChallenge.id
    groupMember.active = True
    groupMember.role = GroupRole.ADMIN
    groupMember.joinedAt = TG_eggChallenge.createdAt

    db_session.add(groupMember)
    db_session.commit()
    return groupMember



# ----------------------------------- eating ---------------------------------------
@pytest.fixture
def task_eggChallenge_eating(db_session, TG_eggChallenge, GM_eggChallenge_owner):
    task = ChallengeTask()
    task.id = uuid4()
    task.ownerID = GM_eggChallenge_owner.userID
    task.groupID = TG_eggChallenge.id
    task.name = "eating eggs"
    task.description = "who eats most eggs wins"
    task.goal = None # ??
    task.status = TaskStatus.IN_PROGRESS # ????? co to znaczy? co jak jeden zaczal a drugi nie? moze jak ktokolwiek zaczal to jest IN PROGRESS?
    task.deadline = datetime(2026, 4, 4, 13, 0, 0)

    db_session.add(task)
    db_session.commit()
    return task

@pytest.fixture
def TaskParams_eggChallenge_eating(db_session, task_eggChallenge_eating):
    taskParams = TaskParams()
    taskParams.taskID = task_eggChallenge_eating.id
    taskParams.photoRequired = True
    taskParams.color = None
    taskParams.notifications = True

    db_session.add(taskParams)
    db_session.commit()
    return taskParams

@pytest.fixture
def TaskProgress_eggChallenge_eating_owner(db_session, GM_eggChallenge_owner, task_eggChallenge_eating):
    taskProgress = ChallengeTaskProgress()
    taskProgress.id = uuid4()
    taskProgress.userID = GM_eggChallenge_owner.userID
    taskProgress.taskID = task_eggChallenge_eating.id
    taskProgress.value = 67

    db_session.add(taskProgress)
    db_session.commit()
    return taskProgress

@pytest.fixture
def TaskProgress_eggChallenge_eating_admin(db_session, GM_eggChallenge_admin, task_eggChallenge_eating):
    taskProgress = ChallengeTaskProgress()
    taskProgress.id = uuid4()
    taskProgress.userID = GM_eggChallenge_admin.userID
    taskProgress.taskID = task_eggChallenge_eating.id
    taskProgress.value = 13

    db_session.add(taskProgress)
    db_session.commit()
    return taskProgress

@pytest.fixture
def PE_eggChallenge_eating_owner_1(db_session, TaskProgress_eggChallenge_eating_owner, GM_eggChallenge_owner):
    progressEntry = ProgressEntry()
    progressEntry.id = uuid4()
    progressEntry.TaskProgressID = TaskProgress_eggChallenge_eating_owner.id
    progressEntry.userID = GM_eggChallenge_owner.userID
    progressEntry.value = 12
    progressEntry.message = "jajecznica 12 jaj"
    progressEntry.photoUrl = "https://example.com/jajecznica-12-jaj.png"
    progressEntry.createdAt = datetime(2025, 4, 4, 16, 0, 0)

    db_session.add(progressEntry)
    db_session.commit()
    return progressEntry

@pytest.fixture
def PE_eggChallenge_eating_owner_2(db_session, TaskProgress_eggChallenge_eating_owner, GM_eggChallenge_owner):
    progressEntry = ProgressEntry()
    progressEntry.id = uuid4()
    progressEntry.TaskProgressID = TaskProgress_eggChallenge_eating_owner.id
    progressEntry.userID = GM_eggChallenge_owner.userID
    progressEntry.value = 55
    progressEntry.message = "jajecznica 55 jaj"
    progressEntry.photoUrl = "https://stockphotos.com/scrambled-eggs-huge-portion-free-stock-photo.png"
    progressEntry.createdAt = datetime(2025, 4, 4, 20, 0, 0)

    db_session.add(progressEntry)
    db_session.commit()
    return progressEntry

@pytest.fixture
def PE_eggChallenge_eating_admin_1(db_session, TaskProgress_eggChallenge_eating_admin, GM_eggChallenge_admin):
    progressEntry = ProgressEntry()
    progressEntry.id = uuid4()
    progressEntry.TaskProgressID = TaskProgress_eggChallenge_eating_admin.id
    progressEntry.userID = GM_eggChallenge_admin.userID
    progressEntry.value = 4
    progressEntry.message = "jajecznica 4 jaja"
    progressEntry.photoUrl = "https://example.com/jajecznica-4-jaja.png"
    progressEntry.createdAt = datetime(2025, 4, 4, 20, 0, 0)

    db_session.add(progressEntry)
    db_session.commit()
    return progressEntry

@pytest.fixture
def PE_eggChallenge_eating_admin_2(db_session, TaskProgress_eggChallenge_eating_admin, GM_eggChallenge_admin):
    progressEntry = ProgressEntry()
    progressEntry.id = uuid4()
    progressEntry.TaskProgressID = TaskProgress_eggChallenge_eating_admin.id
    progressEntry.userID = GM_eggChallenge_admin.userID
    progressEntry.value = 3
    progressEntry.message = "sadzone 3 jaja"
    progressEntry.photoUrl = "https://example.com/sadzone-3-jaja.png"
    progressEntry.createdAt = datetime(2025, 4, 4, 21, 0, 0)

    db_session.add(progressEntry)
    db_session.commit()
    return progressEntry

@pytest.fixture
def PE_eggChallenge_eating_admin_3(db_session, TaskProgress_eggChallenge_eating_admin, GM_eggChallenge_admin):
    progressEntry = ProgressEntry()
    progressEntry.id = uuid4()
    progressEntry.TaskProgressID = TaskProgress_eggChallenge_eating_admin.id
    progressEntry.userID = GM_eggChallenge_admin.userID
    progressEntry.value = 2
    progressEntry.message = "na twardo 2 jaja"
    progressEntry.photoUrl = "https://example.com/na-twardo-2-jaja.png"
    progressEntry.createdAt = datetime(2025, 4, 4, 21, 5, 0)

    db_session.add(progressEntry)
    db_session.commit()
    return progressEntry

@pytest.fixture
def PE_eggChallenge_eating_admin_4(db_session, TaskProgress_eggChallenge_eating_admin, GM_eggChallenge_admin):
    progressEntry = ProgressEntry()
    progressEntry.id = uuid4()
    progressEntry.TaskProgressID = TaskProgress_eggChallenge_eating_admin.id
    progressEntry.userID = GM_eggChallenge_admin.userID
    progressEntry.value = 4
    progressEntry.message = "jajecznica 4 jaja"
    progressEntry.photoUrl = "https://example.com/jajecznica-4-jaja.png"
    progressEntry.createdAt = datetime(2025, 4, 4, 22, 0, 0)

    db_session.add(progressEntry)
    db_session.commit()
    return progressEntry

@pytest.fixture
def comment_eggChallenge_eating_owner_1(db_session, PE_eggChallenge_eating_owner_1, user_a):
    comment = Comment()
    comment.id = uuid4()
    comment.userID = user_a.id
    comment.progressEntryID = PE_eggChallenge_eating_owner_1.id
    comment.message = "wow zjadles 12 jaj? to bardzo duzo dobra robota!"
    comment.date = datetime(2025, 4, 4, 17, 0, 0)

    db_session.add(comment)
    db_session.commit()
    return comment

@pytest.fixture
def comment_eggChallenge_eating_owner_2(db_session, PE_eggChallenge_eating_owner_2, user_c):
    comment = Comment()
    comment.id = uuid4()
    comment.userID = user_c.id
    comment.progressEntryID = PE_eggChallenge_eating_owner_2.id
    comment.message = "oj chyba cos oszukujesz chlopie"
    comment.date = datetime(2025, 4, 4, 20, 30, 0)

    db_session.add(comment)
    db_session.commit()
    return comment
    
@pytest.fixture
def comment_eggChallenge_eating_owner_3(db_session, PE_eggChallenge_eating_owner_2, user_b):
    comment = Comment()
    comment.id = uuid4()
    comment.userID = user_b.id
    comment.progressEntryID = PE_eggChallenge_eating_owner_2.id
    comment.message = "nieprawda po prostu mi zasdroscisz bo ty bys tyle nie zjadl"
    comment.date = datetime(2025, 4, 4, 20, 40, 0)

    db_session.add(comment)
    db_session.commit()
    return comment

@pytest.fixture
def eating_bundle(
task_eggChallenge_eating,
TaskParams_eggChallenge_eating,
TaskProgress_eggChallenge_eating_admin,
TaskProgress_eggChallenge_eating_owner,
PE_eggChallenge_eating_admin_1,
PE_eggChallenge_eating_admin_2,
PE_eggChallenge_eating_admin_3,
PE_eggChallenge_eating_admin_4,
PE_eggChallenge_eating_owner_1,
PE_eggChallenge_eating_owner_2,
comment_eggChallenge_eating_owner_1,
comment_eggChallenge_eating_owner_2,
comment_eggChallenge_eating_owner_3,
):
    return {
    "task": task_eggChallenge_eating,
    "params": TaskParams_eggChallenge_eating,
    "progress": {
        "owner": TaskProgress_eggChallenge_eating_owner,
        "admin": TaskProgress_eggChallenge_eating_admin,
    },
    "entries": {
        "owner": [PE_eggChallenge_eating_owner_1, PE_eggChallenge_eating_owner_2,],
        "admin": [PE_eggChallenge_eating_admin_1, PE_eggChallenge_eating_admin_2,
                    PE_eggChallenge_eating_admin_3, PE_eggChallenge_eating_admin_4,],
    },
    "comments": {
        "owner": [comment_eggChallenge_eating_owner_1, comment_eggChallenge_eating_owner_2,
                  comment_eggChallenge_eating_owner_3],
        "admin": [],
    },
}


# --------------------------- egg challenge bundle --------------------------------
@pytest.fixture
def eggChallenge_bundle(
    TG_eggChallenge,
    GM_eggChallenge_owner,
    GM_eggChallenge_admin
    ,
    eating_bundle,
):
    return {
        "TG": TG_eggChallenge,
        "GM": {
            "owner": GM_eggChallenge_owner,
            "admin": GM_eggChallenge_admin,
        },
        "tasks": {
            "eating": eating_bundle,
        }
    }
# ---------------------------- egg challenge bundle --------------------------------





# -------------------------------------- BINGO -------------------------------------

@pytest.fixture
def TG_bingo(db_session, user_b):
    taskGroup = CooperativeTaskGroup()
    taskGroup.id = uuid4()
    taskGroup.ownerID = user_b.id
    taskGroup.name = "BINGO 2026"
    taskGroup.taskCount = 4
    taskGroup.isBingo = True
    taskGroup.privacy = PrivacyLevel.PUBLIC
    taskGroup.inviteCode = "TEST-CODE-3"
    taskGroup.createdAt = datetime(2026, 4, 4, 13, 0, 0)

    db_session.add(taskGroup)
    db_session.commit()
    return taskGroup

@pytest.fixture
def GM_bingo_owner(db_session, TG_bingo, user_b):
    groupMember = GroupMember()
    groupMember.userID = user_b.id
    groupMember.groupID = TG_bingo.id
    groupMember.active = True
    groupMember.role = GroupRole.OWNER
    groupMember.joinedAt = TG_bingo.createdAt

    db_session.add(groupMember)
    db_session.commit()
    return groupMember



# ----------------------------------- money ---------------------------------------
@pytest.fixture
def task_bingo_money(db_session, TG_bingo, GM_bingo_owner):
    task = EndlessTask()
    task.id = uuid4()
    task.ownerID = GM_bingo_owner.userID
    task.groupID = TG_bingo.id
    task.name = "have over 1000 USD on my account"
    task.description = ""
    task.goal = 1000
    task.status = TaskStatus.IN_PROGRESS
    #task.deadline = datetime(2027, 4, 4, 13, 0, 0) #endless nie ma deadline

    db_session.add(task)
    db_session.commit()
    return task

@pytest.fixture
def TaskParams_bingo_money(db_session, task_bingo_money):
    taskParams = TaskParams()
    taskParams.taskID = task_bingo_money.id
    taskParams.photoRequired = False
    taskParams.color = "green"
    taskParams.notifications = False

    db_session.add(taskParams)
    db_session.commit()
    return taskParams

@pytest.fixture
def TaskProgress_bingo_money(db_session, task_bingo_money):
    taskProgress = EndlessTaskProgress()
    taskProgress.id = uuid4()
    taskProgress.userID = task_bingo_money.ownerID
    taskProgress.taskID = task_bingo_money.id
    taskProgress.value = 700

    db_session.add(taskProgress)
    db_session.commit()
    return taskProgress

@pytest.fixture
def PE_bingo_money_1(db_session, TaskProgress_bingo_money, GM_bingo_owner):
    progressEntry = ProgressEntry()
    progressEntry.id = uuid4()
    progressEntry.TaskProgressID = TaskProgress_bingo_money.id
    progressEntry.userID = GM_bingo_owner.userID
    progressEntry.value = 800
    progressEntry.message = "wyplata"
    progressEntry.photoUrl =  None
    progressEntry.createdAt = datetime(2026, 4, 4, 16, 0, 0)

    db_session.add(progressEntry)
    db_session.commit()
    return progressEntry

@pytest.fixture
def PE_bingo_money_2(db_session, TaskProgress_bingo_money, GM_bingo_owner):
    progressEntry = ProgressEntry()
    progressEntry.id = uuid4()
    progressEntry.TaskProgressID = TaskProgress_bingo_money.id
    progressEntry.userID = GM_bingo_owner.userID
    progressEntry.value = 400
    progressEntry.message = "kieszonkowe od babci"
    progressEntry.photoUrl =  None
    progressEntry.createdAt = datetime(2026, 4, 4, 16, 10, 0)

    db_session.add(progressEntry)
    db_session.commit()
    return progressEntry

@pytest.fixture
def PE_bingo_money_3(db_session, TaskProgress_bingo_money, GM_bingo_owner):
    progressEntry = ProgressEntry()
    progressEntry.id = uuid4()
    progressEntry.TaskProgressID = TaskProgress_bingo_money.id
    progressEntry.userID = GM_bingo_owner.userID
    progressEntry.value = -500
    progressEntry.message = "rick owens"
    progressEntry.photoUrl =  None
    progressEntry.createdAt = datetime(2026, 4, 4, 17, 0, 0)

    db_session.add(progressEntry)
    db_session.commit()
    return progressEntry

@pytest.fixture
def comment_bingo_money(db_session, PE_bingo_money_3, user_a):
    comment = Comment()
    comment.id = uuid4()
    comment.userID = user_a.id
    comment.progressEntryID = PE_bingo_money_3.id
    comment.message = "za te cene chyba fake rick"
    comment.date = datetime(2026, 4, 4, 17, 30, 0)

    db_session.add(comment)
    db_session.commit()
    return comment

@pytest.fixture
def money_bundle(
task_bingo_money,
TaskParams_bingo_money,
TaskProgress_bingo_money,
PE_bingo_money_1,
PE_bingo_money_2,
PE_bingo_money_3,
comment_bingo_money,
):
    return {
    "task": task_bingo_money,
    "params": TaskParams_bingo_money,
    "progress": TaskProgress_bingo_money,
    "entries": [PE_bingo_money_1, PE_bingo_money_2, PE_bingo_money_3],
    "comments": [comment_bingo_money],
}
# TODO idk mozna to jakby usystematyzowa w sensie czy te slowniki zawsze dawac czy jak



# ----------------------------------- running ---------------------------------------
@pytest.fixture
def task_bingo_running(db_session, TG_bingo, GM_bingo_owner):
    task = RepeatableTask()
    task.id = uuid4()
    task.ownerID = GM_bingo_owner.userID
    task.groupID = TG_bingo.id
    task.name = "biegac 3 razy w miesiacu"
    task.description = ""
    task.goal = 3
    task.status = TaskStatus.IN_PROGRESS
    task.frequency = TimeInterval.MONTHLY

    db_session.add(task)
    db_session.commit()
    return task

@pytest.fixture
def TaskParams_bingo_running(db_session, task_bingo_running):
    taskParams = TaskParams()
    taskParams.taskID = task_bingo_running.id
    taskParams.photoRequired = False
    taskParams.color = ""
    taskParams.notifications = True

    db_session.add(taskParams)
    db_session.commit()
    return taskParams

@pytest.fixture
def TaskProgress_bingo_running(db_session, task_bingo_running):
    taskProgress = RepeatableTaskProgress()
    taskProgress.id = uuid4()
    taskProgress.userID = task_bingo_running.ownerID
    taskProgress.taskID = task_bingo_running.id
    taskProgress.value = 0 # dzis nie biegalem
    taskProgress.counter = 3 # total completions
    taskProgress.streak = 2 # current streak

    db_session.add(taskProgress)
    db_session.commit()
    return taskProgress

@pytest.fixture
def PE_bingo_running_1(db_session, TaskProgress_bingo_running, GM_bingo_owner):
    progressEntry = ProgressEntry()
    progressEntry.id = uuid4()
    progressEntry.TaskProgressID = TaskProgress_bingo_running.id
    progressEntry.userID = GM_bingo_owner.userID
    progressEntry.value = 1
    progressEntry.message = "pierwszy bieg"
    progressEntry.photoUrl =  None
    progressEntry.createdAt = datetime(2026, 3, 4, 16, 0, 0)

    db_session.add(progressEntry)
    db_session.commit()
    return progressEntry

@pytest.fixture
def PE_bingo_running_2(db_session, TaskProgress_bingo_running, GM_bingo_owner):
    progressEntry = ProgressEntry()
    progressEntry.id = uuid4()
    progressEntry.TaskProgressID = TaskProgress_bingo_running.id
    progressEntry.userID = GM_bingo_owner.userID
    progressEntry.value = 1
    progressEntry.message = "drugi bieg"
    progressEntry.photoUrl =  None
    progressEntry.createdAt = datetime(2026, 4, 10, 16, 0, 0) # moze datetime now -2 dni, potem -1 itp, zeby streak dzialal

    db_session.add(progressEntry)
    db_session.commit()
    return progressEntry

@pytest.fixture
def PE_bingo_running_3(db_session, TaskProgress_bingo_running, GM_bingo_owner):
    progressEntry = ProgressEntry()
    progressEntry.id = uuid4()
    progressEntry.TaskProgressID = TaskProgress_bingo_running.id
    progressEntry.userID = GM_bingo_owner.userID
    progressEntry.value = 1
    progressEntry.message = "trzeci bieg"
    progressEntry.photoUrl =  None
    progressEntry.createdAt = datetime(2026, 4, 11, 16, 0, 0)

    db_session.add(progressEntry)
    db_session.commit()
    return progressEntry


@pytest.fixture
def comment_bingo_running(db_session, PE_bingo_running_3, user_c):
    comment = Comment()
    comment.id = uuid4()
    comment.userID = user_c.id
    comment.progressEntryID = PE_bingo_running_3.id
    comment.message = "performative"
    comment.date = datetime(2026, 4, 11, 17, 0, 0)

    db_session.add(comment)
    db_session.commit()
    return comment

@pytest.fixture
def running_bundle(
task_bingo_running,
TaskParams_bingo_running,
TaskProgress_bingo_running,
PE_bingo_running_1,
PE_bingo_running_2,
PE_bingo_running_3,
comment_bingo_running,
):
    return {
    "task": task_bingo_running,
    "params": TaskParams_bingo_running,
    "progress": TaskProgress_bingo_running,
    "entries": [PE_bingo_running_1, PE_bingo_running_2, PE_bingo_running_3],
    "comments": [comment_bingo_running],
}



# ----------------------------------- gym ---------------------------------------
@pytest.fixture
def task_bingo_gym(db_session, TG_bingo, GM_bingo_owner):
    task = OneTimeTask()
    task.id = uuid4()
    task.ownerID = GM_bingo_owner.userID
    task.groupID = TG_bingo.id
    task.name = "workout 3 times"
    task.description = "3 razy chce byc na silowni w tym roku"
    task.goal = 3
    task.status = TaskStatus.IN_PROGRESS
    task.deadline = datetime(2027, 4, 4, 17, 0, 0)

    db_session.add(task)
    db_session.commit()
    return task

@pytest.fixture
def TaskParams_bingo_gym(db_session, task_bingo_gym):
    taskParams = TaskParams()
    taskParams.taskID = task_bingo_gym.id
    taskParams.photoRequired = False
    taskParams.color = ""
    taskParams.notifications = True

    db_session.add(taskParams)
    db_session.commit()
    return taskParams

@pytest.fixture
def TaskProgress_bingo_gym(db_session, task_bingo_gym):
    taskProgress = OneTimeTaskProgress()
    taskProgress.id = uuid4()
    taskProgress.userID = task_bingo_gym.ownerID
    taskProgress.taskID = task_bingo_gym.id
    taskProgress.value = 2

    db_session.add(taskProgress)
    db_session.commit()
    return taskProgress

@pytest.fixture
def PE_bingo_gym_1(db_session, TaskProgress_bingo_gym, GM_bingo_owner):
    progressEntry = ProgressEntry()
    progressEntry.id = uuid4()
    progressEntry.TaskProgressID = TaskProgress_bingo_gym.id
    progressEntry.userID = GM_bingo_owner.userID
    progressEntry.value = 1
    progressEntry.message = "pierwszy trening"
    progressEntry.photoUrl =  None
    progressEntry.createdAt = datetime(2026, 4, 4, 16, 0, 0)

    db_session.add(progressEntry)
    db_session.commit()
    return progressEntry

@pytest.fixture
def PE_bingo_gym_2(db_session, TaskProgress_bingo_gym, GM_bingo_owner):
    progressEntry = ProgressEntry()
    progressEntry.id = uuid4()
    progressEntry.TaskProgressID = TaskProgress_bingo_gym.id
    progressEntry.userID = GM_bingo_owner.userID
    progressEntry.value = 1
    progressEntry.message = "drugi trening"
    progressEntry.photoUrl =  None
    progressEntry.createdAt = datetime(2026, 4, 6, 16, 0, 0)

    db_session.add(progressEntry)
    db_session.commit()
    return progressEntry


@pytest.fixture
def gym_bundle(
task_bingo_gym,
TaskParams_bingo_gym,
TaskProgress_bingo_gym,
PE_bingo_gym_1,
PE_bingo_gym_2,
):
    return {
    "task": task_bingo_gym,
    "params": TaskParams_bingo_gym,
    "progress": TaskProgress_bingo_gym,
    "entries": [PE_bingo_gym_1, PE_bingo_gym_2],
    "comments": [],
}


# ------------------------------- president -----------------------------------
@pytest.fixture
def task_bingo_president(db_session, TG_bingo, GM_bingo_owner):
    task = OneTimeTask()
    task.id = uuid4()
    task.ownerID = GM_bingo_owner.userID
    task.groupID = TG_bingo.id
    task.name = "become president"
    task.description = "of the world"
    task.goal = 1
    task.status = TaskStatus.IN_PROGRESS
    task.deadline = datetime(2027, 4, 4, 17, 0, 0)

    db_session.add(task)
    db_session.commit()
    return task

@pytest.fixture
def TaskParams_bingo_president(db_session, task_bingo_president):
    taskParams = TaskParams()
    taskParams.taskID = task_bingo_president.id
    taskParams.photoRequired = True
    taskParams.color = "gold"
    taskParams.notifications = True

    db_session.add(taskParams)
    db_session.commit()
    return taskParams

@pytest.fixture
def TaskProgress_bingo_president(db_session, task_bingo_president):
    taskProgress = OneTimeTaskProgress()
    taskProgress.id = uuid4()
    taskProgress.userID = task_bingo_president.ownerID
    taskProgress.taskID = task_bingo_president.id
    taskProgress.value = 0

    db_session.add(taskProgress)
    db_session.commit()
    return taskProgress

@pytest.fixture
def president_bundle(
task_bingo_president,
TaskParams_bingo_president,
TaskProgress_bingo_president,
):
    return {
    "task": task_bingo_president,
    "params": TaskParams_bingo_president,
    "progress": TaskProgress_bingo_president,
    "entries": [],
    "comments": [],
}


# --------------------------- bingo bundle --------------------------------
@pytest.fixture
def bingo_bundle(
    TG_bingo,
    GM_bingo_owner,
    money_bundle,
    running_bundle,
    gym_bundle,
    president_bundle,
):
    return {
        "TG": TG_bingo,
        "GM": {
            "owner": GM_bingo_owner,
        },
        "tasks": {
            "money": money_bundle,
            "running": running_bundle,
            "gym": gym_bundle,
            "president": president_bundle,
        }
    }
# ---------------------------- bingo bundle --------------------------------

# ============== TASK  RELATED ================
# =============================================

# =============================================
# ============= ECOSYSTEM BUNDLE ==============

@pytest.fixture
def ecosystem(
    db_session,
    user_a, user_b, user_c, user_d,
    account_a, account_b, account_c, account_d,
    friendship_ab, friendship_bc,
    invitation_cd,
    notification_d,
    shoppingList_bundle,
    eggChallenge_bundle,
    bingo_bundle,
):
    return {
        "DB": db_session,
        "users": {
            "a": user_a,
            "b": user_b,
            "c": user_c,
            "d": user_d,
        },
        "accounts": {
            "a": account_a,
            "b": account_b,
            "c": account_c,
            "d": account_d,
        },
        "friendships": {
            "ab": friendship_ab,
            "bc": friendship_bc,
        },
        "invitations": {
            "cd": invitation_cd,
        },
        "notifications": {
            "d": notification_d,
        },
        "TG": {
            "shopping": shoppingList_bundle,
            "challenge": eggChallenge_bundle,
            "bingo": bingo_bundle,
        }
    }
# PRZYKLAD UZYCIA

# def test_Comment_deleteComment(ecosystem):
#     # wyciagamy sobie to co trzeba type shit
#     db_session = ecosystem["DB"]
#     comment = ecosystem["TG"]["shopping"]["tasks"]["eggs"]["comments"][0]
#     comment_id = comment.id
    
#     saved = db_session.query(Comment).filter_by(id=comment_id).first()
#     assert saved is not None
    
#     comment.deleteComment(db_session)
#     db_session.commit()
    
#     deleted = db_session.query(Comment).filter_by(id=comment_id).first()
#     assert deleted is None

#xdddddd