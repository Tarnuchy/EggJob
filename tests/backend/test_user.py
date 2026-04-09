import pytest
from datetime import datetime
from uuid import uuid4

from src.backend.models import *

def test_User_editProfile(db_session, user_a, user_b):
    newData = {
        "username": None,
        "photoUrl": None
    }
    # zmieniamy zdjecie, jest dobry format, dziala
    newData["photoUrl"] = "http://example.com/new_photo.jpg"
    user_a.editProfile(db_session, **newData)
    assert db_session.query(User).filter_by(id=user_a.id, photoUrl="http://example.com/new_photo.jpg").first() is not None
    
    # zmieniamy username, jest wolny, dzial, sprawdazamy
    newData["photoUrl"] = None
    newData["username"] = "new"
    user_a.editProfile(db_session,**newData)
    assert db_session.query(User).filter_by(id=user_a.id, username="new").first() is not None
    
    # zmieniamy zdjecie, nieobslugiwany format (?), powinno wywalic
    newData["photoUrl"] = "idk.exe"
    with pytest.raises(ValueError):
        user_a.editProfile(db_session, **newData)
        
    # zmieniamy username, jest zajety, nie dzial
    newData["photoUrl"] = None
    newData["username"] = user_b.username
    with pytest.raises(ValueError):
        user_a.editProfile(db_session, **newData)

def test_User_inviteFriend(ecosystem):
    db_session = ecosystem["DB"]
    # tworzymy Invitation od uzytkownika A do D, obaj istnieja i nie sa znajomymi, sprawdzamy czy stworzylo
    user_a = ecosystem["users"]["a"]
    user_d = ecosystem["users"]["d"]
    
    user_a.inviteFriend(db_session, user_d.id)
    invitation = db_session.query(Invitation).filter_by(fromUserID=user_a.id, toUserID=user_d.id).first()
    assert invitation is not None
    
    #zaproszenie juz istnieje - blad
    with pytest.raises(Exception):
        user_a.inviteFriend(db_session, user_d.id)
    
    # uzytkownik nie istnieje - wywala blad
    with pytest.raises(Exception):
        user_a.inviteFriend(db_session, uuid4()) #szansa że wylosuje istniejace id ale szanujmy sie
    
    # A i B sa znajomymi - blad
    user_b = ecosystem["users"]["b"]
    with pytest.raises(Exception):
        user_a.inviteFriend(db_session,user_b.id)
    
    # A probuje zaprosic A - blad
    with pytest.raises(Exception):
        user_a.inviteFriend(db_session,user_a.id)

def test_User_notify(db_session, user_a):
    pass
    # tworzymy powiadomienie dla uzytkownika A, sprawdzamy czy jest w bazie
    user_a.notify(db_session, "wstawaj samuraju")
    assert db_session.query(Notification).filter_by(userID=user_a.id, content="wstawaj samuraju").first() is not None
