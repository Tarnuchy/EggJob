import pytest
from src.backend.models import Account

class MockDBSession:
    """ Tymczasowa atrapa sesji bazy danych dopóki nie zostanie zaimplementowane SQLAlchemy """
    def flush(self): pass
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

@pytest.fixture
def sample_account(db_session):
    account = Account()
    account.email = "fixture_user@example.com"
    account.passwordHash = "P@ssw0rd123!"
    account.register(db_session)
    db_session.flush()
    return account

@pytest.fixture
def sample_account_2(db_session):
    account = Account()
    account.email = "fixture_user_2@example.com"
    account.passwordHash = "P@ssw0rd321!"
    account.register(db_session)
    db_session.flush()
    return account
