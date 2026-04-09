import pytest
from datetime import datetime
from uuid import uuid4

from src.backend.models import *

def test_User_editProfile():
    pass
    # zmieniamy haslo, jest silne, dziala
    # zmieniamy zdjecie, jest dobry format, dziala
    # zmieniamy username, jest wolny, dzial, sprawdazamy
    
    # zmieniamy haslo, jest za slabe, powinno wywalic blad
    # zmieniamy zdjecie, nieobslugiwany format (?), powinno wywalic
    # zmieniamy username, jest zajety, nie dzial

def test_User_inviteFriend():
    pass
    # tworzymy Invitation od uzytkownika A do B, obaj istnieja i nie sa znajomymi, sprawdzamy czy stworzylo, tworzymy Notification
    
    # uzytkownik B nie istnieje - wywala blad
    # A i B sa znajomymi - blad
    # A probuje zaprosic A - blad

def test_User_notify(db_session, user_a):
    pass
    # tworzymy powiadomienie dla uzytkownika A, sprawdzamy czy jest w bazie
    user_a.notify(db_session, "wstawaj samuraju")
    assert db_session.query(Notification).filter_by(userID=user_a.id, content="wstawaj samuraju").first() is not None
