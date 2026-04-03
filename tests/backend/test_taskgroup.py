import pytest
from datetime import datetime
from uuid import uuid4

from src.backend.models import *

def test_TaskGroup_edit():
    pass
    #zmieniamy privacy level, sprawdzamy czy sie zmienił
    #zmieniamy nazwe na poprawną, sprawdzamy
    #zmieniamy nazwę na błędną, powinno wywalić błąd
    #próbujemy coś zmienić bez uprawnień, błąd

def test_TaskGroup_delete():
    pass
    # usuwamy grupę, sprawdzamy czy została usunięta
    #próbujemy usunąć grupę jako nie owner, powinno wywalić błąd

def test_TaskGroup_addFriend():
    pass
    # dodajemy znajomego do grupy, sprawdzamy czy jest GroupMember
    # próbujemy dodać znajomego, który już jest w grupie, powinno wywalić błąd
    # próbujemy dodać użytkownika, który nie jest naszym znajomym, powinno wywalić błąd
    
    #dodajemy znajomego który zostawił ducha, powinno zmienić na aktywnego i nic nie tworzyć

def test_TaskGroup_changePermissions():
    pass
    # zmieniamy uprawnienia członka, sprawdzamy czy się zmieniły
    # próbujemy zmienić uprawnienia nie mając do tego praw, powinno wywalić błąd

def test_TaskGroup_removeMember():
    pass
    # usuwamy członka z grupy razem z progressem, sprawdzamy czy się wszystko usunęło
    # usuwamy członka z grupy bez progresu, sprawdzamy czy GroupMember.active jest false
    # próbujemy usunąć kogoś, kogo nie ma w grupie, powinno wywalić błąd
    # próbujemy wyrzucić kogoś z wyższymi/równymi uprawnieniami, powinno wywalić błąd

def test_TaskGroup_createTask():
    pass
    #tworzymy taska, sprawdzamy czy jest w bazie i czy wszystko zaktualizowane (taskcount)
    #próbujemy tworzyć taska ze złymi danymi, powinno wywalić błąd

def test_TaskGroup_changeGroupType():
    pass
    #zmieniamy typ z competetive na cooperative, sprawdzamy czy działa
    #zmieniamy na odwrót, sprawdzamy czy działa
