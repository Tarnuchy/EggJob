import pytest
from datetime import datetime
from uuid import uuid4

from src.backend.models import *

def test_TaskGroup_edit(ecosystem):
    db_session = ecosystem["DB"]
    
    # Wyciągamy grupę kooperacyjną i jej członków o różnych rolach
    tg = ecosystem["TG"]["shopping"]["TG"]
    owner = ecosystem["TG"]["shopping"]["GM"]["owner"]
    member = ecosystem["TG"]["shopping"]["GM"]["member"]
    ghost = ecosystem["TG"]["shopping"]["GM"]["ghost"]

    # Pobranie początkowych wartości z obiektu po to, by nie wpinać hardkodowanych stringów
    initial_name = tg.name
    initial_privacy = tg.privacy

    # 1. PRZYPADEK: GHOST (były członek) próbuje coś zmienić bez uprawnień -> Oczekujemy PermissionError
    with pytest.raises(PermissionError):
        tg.edit(user_id=ghost.userID, new_name="Hacked by Ghost", db_session=db_session)
        
    db_session.flush()
    # Sprawdzamy w bazie ATOMOWO że błąd odrzucił tę próbę i nazwa jest oryginalna
    saved_tg = db_session.query(TaskGroup).filter(TaskGroup.id == tg.id).first()
    assert saved_tg.name == initial_name
        
    # 2. PRZYPADEK: MEMBER (zwykły członek) próbuje edytować pole zastrzeżone -> Oczekujemy PermissionError
    with pytest.raises(PermissionError):
        tg.edit(user_id=member.userID, new_name="Zmieniam nazwe nielegalnie", db_session=db_session)
        
    db_session.flush()
    # Sprawdzamy w bazie ATOMOWO że tu również żadna zmiana nie przeszła 
    saved_tg = db_session.query(TaskGroup).filter(TaskGroup.id == tg.id).first()
    assert saved_tg.name == initial_name 

    # 3. PRZYPADEK: OWNER zmienia privacy level, sprawdzamy czy sie zmienił
    new_privacy = PrivacyLevel.PUBLIC if initial_privacy == PrivacyLevel.PRIVATE else PrivacyLevel.PRIVATE
    tg.edit(user_id=owner.userID, new_privacy=new_privacy, db_session=db_session)
    db_session.flush()
    # Sprawdzamy w bazie, że legalna zmiana faktycznie wpłynęła na bazę
    saved_tg = db_session.query(TaskGroup).filter(TaskGroup.id == tg.id).first()
    assert saved_tg.privacy == new_privacy

    # 4. PRZYPADEK: OWNER zmienia nazwe na poprawną, sprawdzamy
    new_valid_name = "Super " + initial_name
    tg.edit(user_id=owner.userID, new_name=new_valid_name, db_session=db_session)
    db_session.flush()
    # Po raz kolejny walidujemy że ta konkretna operacja się powiodła
    saved_tg = db_session.query(TaskGroup).filter(TaskGroup.id == tg.id).first()
    assert saved_tg.name == new_valid_name

    # 5. PRZYPADEK: OWNER zmienia nazwę na błędną (np. za krótką/pustą string), powinno wywalić błąd (np. ValueError)
    with pytest.raises(ValueError):
        tg.edit(user_id=owner.userID, new_name="", db_session=db_session)

    db_session.flush()
    # Weryfikujemy w bazie, czy błąd powstrzymał aplikację przed zapisaniem pustej nazwy i zachowała się poprzednia - prawidłowa nazwa
    saved_tg = db_session.query(TaskGroup).filter(TaskGroup.id == tg.id).first()
    assert saved_tg.name == new_valid_name


    #TODO zmiana typu na bingo ???

def test_TaskGroup_delete(ecosystem):
    db_session = ecosystem["DB"]
    
    # Wyciągamy grupę i członków o różnych rolach
    tg = ecosystem["TG"]["shopping"]["TG"]
    tg_id = tg.id
    owner = ecosystem["TG"]["shopping"]["GM"]["owner"]
    member = ecosystem["TG"]["shopping"]["GM"]["member"]

    # Przed usunięciem pobieramy listę wszystkich powiązanych rekordów (podrzędnych)
    tasks_before = db_session.query(Task).filter(Task.groupID == tg_id).all()
    task_ids = [t.id for t in tasks_before]
    
    # Skoro to SQLAlchemy-like, bezpiecznie jest pobrać listę przez all i odfiltrować za pomocą list comprehension
    progress_before = [p for p in db_session.query(TaskProgress).all() if p.taskID in task_ids]
    progress_ids = [p.id for p in progress_before]

    # 1. PRZYPADEK: MEMBER (nie owner) próbuje usunąć grupę -> Oczekujemy PermissionError
    with pytest.raises(PermissionError):
        tg.delete(user_id=member.userID, db_session=db_session)
        
    db_session.flush()
    # Sprawdzamy atomowo, że błąd odrzucił akcję i grupa nadal istnieje
    saved_tg = db_session.query(TaskGroup).filter(TaskGroup.id == tg_id).first()
    assert saved_tg is not None

    # Upewniamy się, że obiekty podrzędne po rzuceniu błędu także nadal bez naruszenia istnieją
    members_check = db_session.query(GroupMember).filter(GroupMember.groupID == tg_id).all()
    assert len(members_check) > 0


    # 2. PRZYPADEK: OWNER usuwa grupę -> Sukces
    tg.delete(user_id=owner.userID, db_session=db_session)
    db_session.flush()
    
    # Sprawdzamy atomowo, że grupa faktycznie zniknęła z bazy (główny obiekt usunięto)
    deleted_tg = db_session.query(TaskGroup).filter(TaskGroup.id == tg_id).first()
    assert deleted_tg is None

    # ====== SPRAWDZANIE USUWANA KASKADOWEGO (CASCADE DELETE) ======
    
    # 2.1 Członkowie grupy (GroupMember)
    deleted_members = db_session.query(GroupMember).filter(GroupMember.groupID == tg_id).all()
    assert len(deleted_members) == 0

    # 2.2 Same Zadania (Task)
    deleted_tasks = db_session.query(Task).filter(Task.groupID == tg_id).all()
    assert len(deleted_tasks) == 0
    
    # 2.3 Postęp zadań i ich parametry (TaskProgress, TaskParams)
    all_progress_after = db_session.query(TaskProgress).all()
    assert not any(p.taskID in task_ids for p in all_progress_after)

    all_params_after = db_session.query(TaskParams).all()
    assert not any(p.taskID in task_ids for p in all_params_after)

    # 2.4 Zdarzenia postępów (ProgressEntry - najniższa warstwa hierarchii z diagramu)
    all_entries_after = db_session.query(ProgressEntry).all()
    assert not any(e.TaskProgressID in progress_ids for e in all_entries_after)


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
