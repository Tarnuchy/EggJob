import pytest
from datetime import datetime
from uuid import uuid4

from src.backend.models import Account, User, Invitation, Friendship, Notification, Comment


# ============= ACCOUNT TESTS =============

def test_Account_register():
    pass
    #tworzymy konto metodą register (poprawne dane), sprawdzamy czy się stworzył,
    #próbujemy założyć konto ten sam mail, powinno wywalić błąd
    #próbujemy założyć konto na zbyt słabe hasło, powinno wywalić błąd

def test_Account_login():
    pass
    #próbujemy zalogować się z poprawnymi danymi
    #próbujemy zalogować się z niepoprawnym loginem, powinno wywalić błąd
    #próbujemy zalogować się z niepoprawnym hasłem, powinno wywalić błąd

def test_Account_deleteAccount():
    pass
    # tworzymy konto, zapisujemy w bazie, wywołujemy deleteAccount, sprawdzamy baze

def test_Account_createUser():
    pass
    #wywołujemy createUser() dla danych z konta i wolnej nazwy, działa
    #wywołujemy dla zajętej nazwy, nie działa
    

# ============= USER TESTS =============

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


# ============= INVITATION TESTS =============

def test_Invitation_accept():
    pass
    # wysylamy valid zaproszenie od A do B, B akceptuje zaproszenie, sprawdzamy czy zapro zniknelo i czy dodalo sie Frendship


def test_Invitation_reject():
    pass
    # wysylamy valid zaproszenie od A do B, B odrzuca zaproszenie, sprawdzamy czy zapro zniknelo i czy nie dodalo sie Frendship


def test_Invitation_cancel():
    pass
    # wysylamy valid zaproszenie od A do B, A wycofuje zaproszenie, sprawdzamy czy zapro zniknelo i czy nie dodalo sie Frendship


def test_Invitation_notify():
    pass
    # wysylamy valid zaproszenie od A do B, sprawdzamy, czy B dostal powiadomienie?? (a co jak B przyjmie, czy A tez dostaje notification?)


# ============= FRIENDSHIP TESTS =============

def test_Friendship_deleteFriend():
    pass
    # A i B sa znajomymi, B usuwa A, sprawdzamy czy friendship zniknelo


# ============= NOTIFICATION TESTS =============

def test_Notification_read():
    pass
    # odczytujemy powiadomienie, sprawdzamy czy status zmienil sie na odczytane.


# ============= COMMENT TESTS =============

def test_Comment_addComment():
    pass
    # dodajemy niepusty comment, sprawdzamy czy sie dodal xd
    # dodajemu ousty comment, wywala blad


def test_Comment_deleteComment():
    pass
    # usuwamy istniejacy comment, sprawdzamy czy sie usunal idk