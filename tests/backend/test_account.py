import pytest
from datetime import datetime
from uuid import uuid4

from src.backend.models import *

def test_Account_register(db_session):
    from sqlalchemy.exc import IntegrityError

    # tworzymy konto metodą register (poprawne dane), sprawdzamy czy się stworzył,
    account_valid = Account()
    account_valid.email = "test@example.com"
    account_valid.passwordHash = "dobreHaslo123!"
    
    # Symulujemy poprawne utworzenie konta (docelowo metoda będzie przyjmować sesję bazy)
    account_valid.register(db_session)
    
    # sprawdzamy w bazie czy konto się zapisało (SQLAlchemy)
    saved_account = db_session.query(Account).filter(Account.email == "test@example.com").first()
    assert saved_account is not None
    assert saved_account.email == "test@example.com"
    
    # próbujemy założyć konto ten sam mail, powinno wywalić błąd
    account_duplicate = Account()
    account_duplicate.email = "test@example.com"
    account_duplicate.passwordHash = "inneHaslo123!"
    
    # Kiedy połączysz z bazą, Postgres rzuci błąd unikalności (IntegrityError)
    with pytest.raises(IntegrityError):
        account_duplicate.register(db_session)
        db_session.flush() # Wymuszenie zapytania do bazy, by wyłapać błąd

    # Wycofujemy transakcję po wyrzuceniu błędu, by móc kontynuować operację na tej samej sesji
    db_session.rollback()

    # próbujemy założyć konto na zbyt słabe hasło, powinno wywalić błąd
    account_weak = Account()
    account_weak.email = "new_user@example.com"
    account_weak.passwordHash = "123"
    
    # Hasło często sprawdzamy w walidatorze modelu (Pydantic / ORM) rzucającym ValueError
    with pytest.raises(ValueError, match="Password too weak"):
        account_weak.register(db_session)

def test_Account_login(db_session, account_a):
    # próbujemy zalogować się z poprawnymi danymi
    # Zakładamy, że metoda login w przyszłości przyjmie email i hasło oraz zwróci np. True lub Token JWT
    login_success = account_a.login(email=account_a.email, password="P@ssw0rd_A", session=db_session)
    assert login_success is not False

    # próbujemy zalogować się z niepoprawnym loginem, powinno wywalić błąd
    with pytest.raises(ValueError, match="Invalid credentials"):
        account_a.login(email="BLEDNY_EMAIL@example.com", password="P@ssw0rd_A", session=db_session)

    # próbujemy zalogować się z niepoprawnym hasłem, powinno wywalić błąd
    with pytest.raises(ValueError, match="Invalid credentials"):
        account_a.login(email=account_a.email, password="ZLE_HASLO123!", session=db_session)

def test_Account_deleteAccount(db_session, account_a):
    # sprawdzamy czy istnieje
    saved = db_session.query(Account).filter(Account.email == account_a.email).first()
    assert saved is not None

    # usuwamy konto
    account_a.deleteAccount(db_session)
    db_session.flush() # Wymuszenie fizycznego usunięcia z bazy przed kolejnym zapytaniem
    
    # sprawdzamy bazę, rekordu nie powinno już być
    deleted = db_session.query(Account).filter(Account.email == account_a.email).first()
    assert deleted is None

def test_Account_createUser(db_session, account_a, account_b):
    from sqlalchemy.exc import IntegrityError
    
    # wywołujemy createUser() dla danych z konta i wolnej nazwy, działa
    # Zakładamy, że createUser docelowo będzie powiązywać model Account z modelem User
    account_a.createUser("wolny_nick", db_session)
    db_session.flush()
    
    # Sprawdzamy czy profil w ogóle powstał w tabeli User z dobrą nazwą
    new_user = db_session.query(User).filter(User.username == "wolny_nick").first()
    assert new_user is not None
    assert new_user.username == "wolny_nick" #TODO zmienić z wolny_nick na account==account1
    
    # wywołujemy dla zajętej nazwy (używając drugiego konta z fixture), nie działa
    # Uderzy to w bazę i spowoduje zablokowanie na poziomie unikalności nazwy użytkownika
    with pytest.raises(IntegrityError):
        account_b.createUser("wolny_nick", db_session)
        db_session.flush()
        
    db_session.rollback()
    
    
def test_Account_changePassword(db_session, account_a):
    # zmieniamy hasło na nowe i silne, sprawdzamy czy się zmieniło
    new_password = "noweSilneHaslo_6969" #powinien byc hash xd
    account_a.changePassword(db_session, new_password)
    assert db_session.query(Account).filter(Account.id == account_a.id, Account.passwordHash == new_password).first() is not None
    
    # słabe hasło
    new_password = "slabe"
    with pytest.raises(ValueError):
        account_a.changePassword(db_session, new_password)