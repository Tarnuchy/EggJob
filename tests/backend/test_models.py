import pytest
from datetime import datetime
from uuid import uuid4

from src.backend.models import Account, User

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

