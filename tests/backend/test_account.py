import pytest
from datetime import datetime
from uuid import uuid4

from src.backend.models import *
from src.backend.security import *

def test_Account_register(ecosystem):
    db_session = ecosystem["DB"]
    
    accounts_before = len(db_session.query(Account).all())

    # -------------------------------------------------------------------
    # PRZYPADEK 1: SUKCES - poprawne dane z formularza rejestracyjnego
    # -------------------------------------------------------------------
    valid_form = {
        "email": "nowy_super_user@eggjob.com",
        "username": "SuperUser_123",
        "password": "StrongPassword123!"
    }

    new_account = Account()
    result = new_account.register(db_session=db_session, **valid_form)
    db_session.flush()

    assert result is True 
    assert len(db_session.query(Account).all()) == accounts_before + 1
    
    saved_account = db_session.query(Account).filter_by(email=valid_form["email"]).first()
    assert saved_account is not None


    # -------------------------------------------------------------------
    # PRZYPADEK 2: BŁĄD (ValueError) - E-mail jest już zajęty
    # -------------------------------------------------------------------
    existing_acc_a = ecosystem["accounts"]["a"]
    
    duplicate_email_form = valid_form.copy()
    duplicate_email_form["email"] = existing_acc_a.email

    accounts_before_err = len(db_session.query(Account).all())
    with pytest.raises(ValueError):
        Account().register(db_session=db_session, **duplicate_email_form)
        
    db_session.flush()
    assert len(db_session.query(Account).all()) == accounts_before_err


    # -------------------------------------------------------------------
    # PRZYPADEK 3: BŁĄD (ValueError) - Username jest już zajęty
    # -------------------------------------------------------------------
    # Sprawdzamy czy rejestracja sprawdza duplikaty username'a z bazy Userów,
    # mimo że powiązane konto "User" nie jest w trakcie tej metody jeszcze ostatecznie skonstruowane
    existing_user_a = ecosystem["users"]["a"]
    
    duplicate_username_form = valid_form.copy()
    duplicate_username_form["email"] = "calkiem_inny_mail@eggjob.com" # upewniamy sie ze to username spowoduje blad
    duplicate_username_form["username"] = existing_user_a.username

    accounts_before_err = len(db_session.query(Account).all())
    with pytest.raises(ValueError):
        Account().register(db_session=db_session, **duplicate_username_form)
        
    db_session.flush()
    assert len(db_session.query(Account).all()) == accounts_before_err


    # -------------------------------------------------------------------
    # PRZYPADEK 4: BŁĄD (ValueError) - Niewłaściwy format e-maila
    # -------------------------------------------------------------------
    invalid_email_form = valid_form.copy()
    invalid_email_form["email"] = "nie_mail_tylko_string"

    accounts_before_err = len(db_session.query(Account).all())
    with pytest.raises(ValueError):
        Account().register(db_session=db_session, **invalid_email_form)
        
    db_session.flush()
    assert len(db_session.query(Account).all()) == accounts_before_err
    assert db_session.query(Account).filter_by(email="nie_mail_tylko_string").first() is None


    # -------------------------------------------------------------------
    # PRZYPADEK 5: BŁĄD (ValueError) - Za słabe hasło
    # -------------------------------------------------------------------
    weak_password_form = valid_form.copy()
    weak_password_form["password"] = "123"

    accounts_before_err = len(db_session.query(Account).all())
    with pytest.raises(ValueError):
        Account().register(db_session=db_session, **weak_password_form)
        
    db_session.flush()
    assert len(db_session.query(Account).all()) == accounts_before_err

def test_Account_login(ecosystem):
    db_session = ecosystem["DB"]
    
    existing_acc_a = ecosystem["accounts"]["a"]

    # -------------------------------------------------------------------
    # PRZYPADEK 1: SUKCES - poprawne logowanie na istniejącym koncie
    # -------------------------------------------------------------------
    valid_login_form = {
        "email": existing_acc_a.email,
        "password": "P@ssw0rd_A" # Zgodne z conftest.py
    }

    result = existing_acc_a.login(db_session=db_session, **valid_login_form)
    
    assert result is True 

    # -------------------------------------------------------------------
    # PRZYPADEK 2: BŁĄD (ValueError) - błędne hasło dla istniejącego konta
    # -------------------------------------------------------------------
    invalid_password_form = valid_login_form.copy()
    invalid_password_form["password"] = "ZleHaslo123!"

    with pytest.raises(ValueError):
        existing_acc_a.login(db_session=db_session, **invalid_password_form)

    # -------------------------------------------------------------------
    # PRZYPADEK 3: BŁĄD (ValueError) - email nie istnieje (brak konta)
    # -------------------------------------------------------------------
    non_existent_email_form = {
        "email": "nieistniejacy_mail@eggjob.com",
        "password": "AnyPassword123!"
    }

    # Wywołujemy na "nieistniejącym", pustym koncie (odpowiednik braku konta w bazie)
    non_existent_acc = Account()
    non_existent_acc.email = "nieistniejacy_mail@eggjob.com"

    with pytest.raises(ValueError):
        non_existent_acc.login(db_session=db_session, **non_existent_email_form)

#TODO: cale do remontu generalnego
def test_Account_deleteAccount(ecosystem):
    db_session = ecosystem["DB"]
    account_a = ecosystem["accounts"]["a"]
    user_a = ecosystem["users"]["a"]

    acc_id = account_a.id
    user_id = user_a.id
    
    # -------------------------------------------------------------------
    # EKSTRAKCJA WSZYSTKICH IDENTYFIKATORÓW DOTYCZĄCYCH USERA A
    # -------------------------------------------------------------------
    
    # 1. Relacje i powiadomienia (tylko friendship, w conftest nie ma inv/notif dla User A, ale na wypadek sprawdzimy uniwersalnie)
    friendship_ab = ecosystem["friendships"]["ab"]
    
    # 2. Obiekty z Grupy "Shopping List", której CAŁYM właścicielem jest A (usunięcie grupy niszczy wszystko wewnątrz)
    shopping_tg = ecosystem["TG"]["shopping"]
    tg_shopping_id = shopping_tg["TG"].id
    
    task_eggs_id = shopping_tg["tasks"]["eggs"]["task"].id
    tp_eggs_id = shopping_tg["tasks"]["eggs"]["params"].taskID # klucz to taskID
    prog_eggs_id = shopping_tg["tasks"]["eggs"]["progress"].id
    pe_eggs_id = shopping_tg["tasks"]["eggs"]["entries"][0].id
    comment_eggs_a_id = shopping_tg["tasks"]["eggs"]["comments"][0].id # autor: user a
    
    task_milk_id = shopping_tg["tasks"]["milk"]["task"].id
    
    task_bread_id = shopping_tg["tasks"]["bread"]["task"].id
    prog_bread_b_id = shopping_tg["tasks"]["bread"]["progress"].id
    pe_bread_b_id = shopping_tg["tasks"]["bread"]["entries"][0].id
    comment_bread_a_id = shopping_tg["tasks"]["bread"]["comments"][0].id # autor: user a
    comment_bread_d_id = shopping_tg["tasks"]["bread"]["comments"][1].id # autor: user d (poleci bo Task poleci)

    task_cheese_id = shopping_tg["tasks"]["cheese"]["task"].id
    pe_cheese_a_id = shopping_tg["tasks"]["cheese"]["entries"][0].id # autor: user a
    pe_cheese_b_id = shopping_tg["tasks"]["cheese"]["entries"][1].id # autor: user b (poleci bo Task poleci)
    comment_cheese_d_id = shopping_tg["tasks"]["cheese"]["comments"][0].id
    comment_cheese_b_id = shopping_tg["tasks"]["cheese"]["comments"][1].id

    # 3. Aktywności Usera A rozsiane po INNYCH grupach
    # Komentarz A pod cudzym zadaniem w grupie Egg Challenge
    comment_egg_a_id = ecosystem["TG"]["challenge"]["tasks"]["eating"]["comments"]["owner"][0].id
    # Komentarz A pod cudzym zadaniem w grupie Bingo
    comment_bingo_a_id = ecosystem["TG"]["bingo"]["tasks"]["money"]["comments"][0].id

    # -------------------------------------------------------------------
    # Wywołanie funkcji: usunięcie konta i wszystkich encji z nim związanych
    # -------------------------------------------------------------------
    account_a.deleteAccount(db_session=db_session, password="P@ssw0rd_A") # Hasło z conftest.py
    db_session.flush()

    # -------------------------------------------------------------------
    # ASERCJE: Sprawdzamy kaskadowe usuwanie
    # -------------------------------------------------------------------
    
    # 1. Samo konto i bezpośredni User usunięte
    assert db_session.query(Account).filter_by(id=acc_id).first() is None
    assert db_session.query(User).filter_by(id=user_id).first() is None

    # 2. Bezpośrednie socjalne relacje 
    assert db_session.query(Friendship).filter_by(
        userOneID=friendship_ab.userOneID,
        userTwoID=friendship_ab.userTwoID,
    ).first() is None
    assert db_session.query(Invitation).filter((Invitation.fromUserID == user_id) | (Invitation.toUserID == user_id)).first() is None
    assert db_session.query(Notification).filter_by(userID=user_id).first() is None

#TODO: problematic ...
    # # 3. Grupy założone przez A i GroupMemberi
    # assert db_session.query(TaskGroup).filter_by(id=tg_shopping_id).first() is None
    # assert db_session.query(GroupMember).filter_by(groupID=tg_shopping_id).first() is None # Wszyscy członkowie wyrzuceni
    # A dodatkowo User A wylatuje ze wszystkich INNYCH grup, w których był
    assert db_session.query(GroupMember).filter_by(userID=user_id).first() is None

#TODO: powinno groupmemberow ustawic na  ghost, chyba ze jest ownerem to usuwa GM+TG xdxdxd
    # # 4. Wszystkie Taski i ich paramsy z grup należących do A - lecą
    # assert db_session.query(Task).filter_by(id=task_eggs_id).first() is None
    # assert db_session.query(Task).filter_by(id=task_milk_id).first() is None
    # assert db_session.query(Task).filter_by(id=task_bread_id).first() is None
    # assert db_session.query(Task).filter_by(id=task_cheese_id).first() is None

    # assert db_session.query(TaskParams).filter_by(taskID=task_eggs_id).first() is None
    # assert db_session.query(TaskParams).filter_by(taskID=task_milk_id).first() is None
    # assert db_session.query(TaskParams).filter_by(taskID=task_bread_id).first() is None
    # assert db_session.query(TaskParams).filter_by(taskID=task_cheese_id).first() is None

    # 5. Progresy z grup Shopping usunięte (w tym te nienależące bezpośrednio do Usera A)
    assert db_session.query(TaskProgress).filter_by(id=prog_eggs_id).first() is None
    assert db_session.query(TaskProgress).filter_by(id=prog_bread_b_id).first() is None

    # 6. Wpisy (ProgressEntry) w grupie Shopping usunięte (również te cudze!)
    assert db_session.query(ProgressEntry).filter_by(id=pe_eggs_id).first() is None
    assert db_session.query(ProgressEntry).filter_by(id=pe_bread_b_id).first() is None
    assert db_session.query(ProgressEntry).filter_by(id=pe_cheese_a_id).first() is None
    assert db_session.query(ProgressEntry).filter_by(id=pe_cheese_b_id).first() is None

    # 7. Komentarze z grupy Shopping List poleciały rykoszetem (cudze też!)
    assert db_session.query(Comment).filter_by(id=comment_eggs_a_id).first() is None
    assert db_session.query(Comment).filter_by(id=comment_bread_a_id).first() is None
    assert db_session.query(Comment).filter_by(id=comment_bread_d_id).first() is None
    assert db_session.query(Comment).filter_by(id=comment_cheese_d_id).first() is None
    assert db_session.query(Comment).filter_by(id=comment_cheese_b_id).first() is None

    # 8. Komentarze autorstwa A (bycie na terenie cudzych grup) również TRWALE znikają
    assert db_session.query(Comment).filter_by(id=comment_egg_a_id).first() is None
    assert db_session.query(Comment).filter_by(id=comment_bingo_a_id).first() is None

    # -------------------------------------------------------------------
    # SANITY CHECK: Upewnienie się, że rzeczy innego użytkownika przetrwały
    # -------------------------------------------------------------------
    tg_bingo_id = ecosystem["TG"]["bingo"]["TG"].id
    pe_bingo_money_2_id = ecosystem["TG"]["bingo"]["tasks"]["money"]["entries"][1].id
    
    assert db_session.query(TaskGroup).filter_by(id=tg_bingo_id).first() is not None
    assert db_session.query(ProgressEntry).filter_by(id=pe_bingo_money_2_id).first() is not None

def test_Account_createUser(ecosystem):
    db_session = ecosystem["DB"]
    
    users_before = len(db_session.query(User).all())

    # Create an account without an assigned user representing a newly registered account
    new_account = Account()
    new_account.id = uuid4()
    new_account.email = "no_user_yet@eggjob.com"
    new_account.passwordHash = hash_password("Haslo123!")
    db_session.add(new_account)
    db_session.flush()

    # -------------------------------------------------------------------
    # PRZYPADEK 1: SUKCES - poprawne dane profilu użytkownika
    # -------------------------------------------------------------------
    valid_form = {
        "username": "NowyOdkrywca",
        "photoUrl": "https://example.com/avatar.jpg"
    }

    result = new_account.createUser(db_session=db_session, **valid_form)
    db_session.flush()

    assert result is True
    assert len(db_session.query(User).all()) == users_before + 1
    
    saved_user = db_session.query(User).filter_by(username=valid_form["username"]).first()
    assert saved_user is not None
    if saved_user:
        assert saved_user.accountID == new_account.id

    # -------------------------------------------------------------------
    # PRZYPADEK 2: BŁĄD (ValueError) - Username jest już zajęty
    # -------------------------------------------------------------------
    existing_user_a = ecosystem["users"]["a"]
    
    another_account = Account()
    another_account.id = uuid4()
    another_account.email = "another_no_user@eggjob.com"
    another_account.passwordHash = hash_password("Gig@M0cne_haslo7")
    db_session.add(another_account)
    db_session.flush()

    duplicate_username_form = valid_form.copy()
    duplicate_username_form["username"] = existing_user_a.username

    users_before_err = len(db_session.query(User).all())
    with pytest.raises(ValueError):
        another_account.createUser(db_session=db_session, **duplicate_username_form)
        
    db_session.flush()
    assert len(db_session.query(User).all()) == users_before_err


"""
    # -------------------------------------------------------------------
    # PRZYPADEK 3: BŁĄD (ValueError) - Konto już posiada przypisanego Usera (User i Account to 1 do 1)
    # -------------------------------------------------------------------
    existing_acc_a = ecosystem["accounts"]["a"] 
    
    valid_form_2 = {
        "username": "ZupelnieNowy123",
        "photoUrl": "https://example.com/avatar2.jpg"
    }

    users_before_err = len(db_session.query(User).all())
    with pytest.raises(ValueError):
        existing_acc_a.createUser(db_session=db_session, **valid_form_2)
        
    db_session.flush()
    assert len(db_session.query(User).all()) == users_before_err
"""
    
def test_Account_changePassword(ecosystem):
    db_session = ecosystem["DB"]
    
    account_a = ecosystem["accounts"]["a"]
    original_password_hash = account_a.passwordHash

    # -------------------------------------------------------------------
    # PRZYPADEK 1: SUKCES - poprawne stare hasło i silne nowe hasło
    # -------------------------------------------------------------------
    valid_form = {
        "old_password": "P@ssw0rd_A", # Hasło z conftest.py
        "new_password": "NewStrongPassword123!"
    }

    account_a.changePassword(db_session=db_session, **valid_form)
    db_session.flush()

    
    # Sprawdzenie w bazie danych, czy hasło faktycznie sie zmieniło
    # saved_account = db_session.query(Account).filter_by(id=account_a.id).first()
    # assert saved_account is not None
    # assert saved_account.passwordHash != original_password_hash ??
    assert verify_password("NewStrongPassword123!", account_a.passwordHash) == True
    
    changed_password_hash = account_a.passwordHash

    # -------------------------------------------------------------------
    # PRZYPADEK 2: BŁĄD (ValueError) - błędne stare hasło
    # -------------------------------------------------------------------
    invalid_old_password_form = {
        "old_password": "ZleStareHaslo123!",
        "new_password": "AnotherStrongPassword123!"
    }

    with pytest.raises(ValueError):
        account_a.changePassword(db_session=db_session, **invalid_old_password_form)
        
    db_session.flush()
    
    # Upewnienie się, że w bazie danych hasło NIE uległo zmianie
    saved_account_case2 = db_session.query(Account).filter_by(id=account_a.id).first()
    assert saved_account_case2.passwordHash == changed_password_hash

    # -------------------------------------------------------------------
    # PRZYPADEK 3: BŁĄD (ValueError) - za słabe nowe hasło
    # -------------------------------------------------------------------
    weak_new_password_form = {
        "old_password": valid_form["new_password"], # Używamy zmienionego hasła z Przypadku 1
        "new_password": "123"
    }

    with pytest.raises(ValueError):
        account_a.changePassword(db_session=db_session, **weak_new_password_form)
        
    db_session.flush()
    
    # Hasło w bazie po błędzie znów powinno pozostać niezmienione
    saved_account_case3 = db_session.query(Account).filter_by(id=account_a.id).first()
    assert saved_account_case3.passwordHash == changed_password_hash