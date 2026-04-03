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
    

def test_GroupMember_leaveGroup():
    pass
    #wychodzimy z grupy zabierając progress, sprawdzamy czy wszystko usunięte i zaktualizowane
    #wychodzimy z grupy zostawiając progress, sprawdzamy czy dobrze usunięte


def test_Task_edit():
    pass
    # zmieniamy nazwę, opis, cel zadania na poprawne dane, sprawdzamy czy się zmieniły
    # próbujemy zmienić nazwę na błędną, powinno rzucić błąd
    # próbujemy edytować zadanie bez uprawnień, powinno rzucić błąd

def test_Task_delete():
    pass
    # usuwamy zadanie, sprawdzamy czy zostało usunięte z bazy i czy usunięto postępy
    # sprawdzamy czy taskCount w grupie się zaktualizował
    # próbujemy usunąć zadanie bez uprawnień, powinno rzucić błąd

def test_Task_changeTaskType():
    pass
    # zmieniamy typ zadania (wszystkie możliwości), sprawdzamy czy się zmienił
    # próbujemy zmienić typ zadania bez uprawnień, powinno rzucić błąd

def test_TaskProgress_updateProgress():
    pass
    # robimy poprawny update, sprawdzamy czy się poprawnie zaktualizowało i czy stworzył się progress entry
    # robimy niepoprawny update, błąd
    # sprawdzamy czy po osiągnięciu celu zadanie poprawnie zmienia status na DONE (dla OneTimeTask)


def test_TaskParams_edit():
    pass
    # zmieniamy ustawienia na nowe poprawne wartości, sprawdzamy czy nastąpiła zmiana
    # próbujemy zmienić na niepoprawne wartości, powinno wywalić błąd


def test_ProgressEntry_validate():
    pass
    # weryfikujemy prawidłowy wpis (np. jest photoUrl w sytuacji, gdy photoRequired jest True w TaskParams), oczekujemy True
    # weryfikujemy wpis bez zdjęcia dla zadania z photoRequired=True, oczekujemy False