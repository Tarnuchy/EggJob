from datetime import datetime
from uuid import uuid4

import pytest
from src.backend.models import *

class MockDBSession:
    """ Tymczasowa atrapa sesji bazy danych dopóki nie zostanie zaimplementowane SQLAlchemy """ # a nie postgres w sensie?
    def add(self, object): pass
    def flush(self): pass
    def clear(self): pass
    def rollback(self): pass
    def query(self, model):
        class MockQuery:
            def filter(self, *args, **kwargs):
                return self
            def first(self):
                # Na potrzeby testów zwraca atrapę logiki True/False lub instancję, 
                # będzie to zmienione po dodaniu SQLAlchemy
                return None
        return MockQuery()

@pytest.fixture
def db_session():
    """ 
    Fixture dla sesji bazy danych. Docelowo tutaj będzie:
    session = TestingSessionLocal()
    yield session
    session.close() 
    """
    session = MockDBSession()
    yield session
    session.clear()


# =============================================
# =============== ACCOUNTS+USERS ==============

@pytest.fixture
def account_a(db_session):
    account = Account()

    account.id = uuid4()
    account.email = "user_A@example.com"
    account.passwordHash = "P@ssw0rd_A"
    account.registrationDate = datetime(2026, 4, 4, 12, 0, 0)

    db_session.add(account)
    db_session.flush()
    return account

@pytest.fixture
def user_a(db_session, account_a):
    user = User()
    user.id = uuid4()
    user.accountID = account_a.id
    user.username = "user_A"
    user.photoUrl = "https://example.com/user_A.jpg"

    db_session.add(user)
    db_session.flush()
    return user


@pytest.fixture
def account_b(db_session):
    account = Account()

    account.id = uuid4()
    account.email = "user_B@example.com"
    account.passwordHash = "P@ssw0rd_B"
    account.registrationDate = datetime(2026, 4, 4, 12, 5, 0)

    db_session.add(account)
    db_session.flush()
    return account

@pytest.fixture
def user_b(db_session, account_b):
    user = User()
    user.id = uuid4()
    user.accountID = account_b.id
    user.username = "user_B"
    user.photoUrl = "https://example.com/user_B.jpg"

    db_session.add(user)
    db_session.flush()
    return user


@pytest.fixture
def account_c(db_session):
    account = Account()

    account.id = uuid4()
    account.email = "user_C@example.com"
    account.passwordHash = "P@ssw0rd_C"
    account.registrationDate = datetime(2026, 4, 4, 12, 10, 0)

    db_session.add(account)
    db_session.flush()
    return account

@pytest.fixture
def user_c(db_session, account_c):
    user = User()
    user.id = uuid4()
    user.accountID = account_c.id
    user.username = "user_C"
    user.photoUrl = "https://example.com/user_C.jpg"
    
    db_session.add(user)
    db_session.flush()
    return user


@pytest.fixture
def account_d(db_session):
    account = Account()

    account.id = uuid4()
    account.email = "user_D@example.com"
    account.passwordHash = "P@ssw0rd_D"
    account.registrationDate = datetime(2026, 4, 4, 12, 15, 0)

    db_session.add(account)
    db_session.flush()
    return account

@pytest.fixture
def user_d(db_session, account_d):
    user = User()
    user.id = uuid4()
    user.accountID = account_d.id
    user.username = "user_D"
    user.photoUrl = "https://example.com/user_D.jpg"
   
    db_session.add(user)
    db_session.flush()
    return user

# =============== ACCOUNTS+USERS ==============
# =============================================



# =============================================
# ================ FRIENDSHIPS ================

@pytest.fixture
def friendship_ab(db_session, user_a, user_b):
    friendship = Friendship()
    friendship.id = uuid4()
    friendship.userOneID = user_a.id
    friendship.userTwoID = user_b.id
    friendship.acceptedAt = datetime(2026, 4, 4, 13, 0, 0)
    
    db_session.add(friendship)
    db_session.flush()
    return friendship

@pytest.fixture
def friendship_bc(db_session, user_b, user_c):
    friendship = Friendship()
    friendship.id = uuid4()
    friendship.userOneID = user_b.id
    friendship.userTwoID = user_c.id
    friendship.acceptedAt = datetime(2026, 4, 4, 13, 0, 0)
    
    db_session.add(friendship)
    db_session.flush()
    return friendship

# ================ FRIENDSHIPS ================
# =============================================



# =============================================
# ======= INVITATIONS + NOTIFICATIONS =========

@pytest.fixture
def invitation_bc(db_session, user_b, user_c):
    invitation = Friendship()
    invitation.id = uuid4()
    invitation.fromUserID = uuid4()
    invitation.toUserID = uuid4()
    invitation.date = datetime(2026, 4, 4, 13, 0, 0)
    
    db_session.add(invitation)
    db_session.flush()
    return invitation

@pytest.fixture
def nortification_c(db_session, user_c, user_b):
    notification = Notification()
    notification.id = uuid4()
    notification.UserID = user_c.id
    notification.message = f"User {user_b.username} sent you an invite"
    notification.date = datetime(2026, 4, 4, 13, 0, 0)
    notification.date = True
    
    db_session.add(notification)
    db_session.flush()
    return notification


# ======= INVITATIONS + NOTIFICATIONS =========
# =============================================