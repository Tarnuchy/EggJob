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

    # Pakujemy docelowe dane w słownik dla wygody (jak przy test_Task_edit)
    new_data = {
        "new_name": "super lista zakupow",
        "new_privacy": PrivacyLevel.PUBLIC
    }

    # 1. PRZYPADEK: GHOST próbuje coś zmienić bez uprawnień -> Oczekujemy PermissionError
    with pytest.raises(PermissionError):
        tg.edit(user_id=ghost.userID, db_session=db_session, **new_data)
        
    db_session.flush()
    # Sprawdzamy w bazie ATOMOWO że błąd odrzucił próbę i wartości pozostały domyślne
    saved_tg = db_session.query(TaskGroup).filter_by(id=tg.id).first()
    assert saved_tg is not None
    assert saved_tg.name == initial_name
    assert saved_tg.privacy == initial_privacy
        
    # 2. PRZYPADEK: MEMBER próbuje edytować dane -> Oczekujemy PermissionError
    with pytest.raises(PermissionError):
        tg.edit(user_id=member.userID, db_session=db_session, **new_data)
        
    db_session.flush()
    saved_tg = db_session.query(TaskGroup).filter_by(id=tg.id).first()
    assert saved_tg is not None
    assert saved_tg.name == initial_name 
    assert saved_tg.privacy == initial_privacy

    # 3. PRZYPADEK: OWNER zmienia wszystkie dane ujęte w słowniku od razu -> SUKCES
    tg.edit(user_id=owner.userID, db_session=db_session, **new_data)
    db_session.flush()
    
    saved_tg = db_session.query(TaskGroup).filter_by(id=tg.id).first()
    assert saved_tg is not None
    assert saved_tg.name == new_data["new_name"]
    assert saved_tg.privacy == new_data["new_privacy"]

    # 4. PRZYPADEK: OWNER podaje błędną nazwę w słowniku -> Oczekujemy ValueError
    new_data["new_name"] = ""
    with pytest.raises(ValueError):
        tg.edit(user_id=owner.userID, db_session=db_session, **new_data)

    db_session.flush()
    # Weryfikujemy w bazie, czy zachowała się poprzednia, działająca wartość, a pusta nazwa została zablokowana
    saved_tg = db_session.query(TaskGroup).filter_by(id=tg.id).first()
    assert saved_tg.name == new_data["new_name"]


    #TODO zmiana typu na bingo ???

def test_TaskGroup_delete(ecosystem):
    db_session = ecosystem["DB"]
    
    # Wyciągamy grupę i członków o różnych rolach
    tg = ecosystem["TG"]["shopping"]["TG"]
    tg_id = tg.id
    owner = ecosystem["TG"]["shopping"]["GM"]["owner"]
    member = ecosystem["TG"]["shopping"]["GM"]["member"]

    # Przed usunięciem pobieramy listę wszystkich powiązanych rekordów (podrzędnych)
    tasks_before = db_session.query(Task).filter_by(groupID=tg_id).all()
    task_ids = [t.id for t in tasks_before]
    
    # Skoro to SQLAlchemy-like, bezpiecznie jest pobrać listę przez all i odfiltrować za pomocą list comprehension
    progress_before = [p for p in db_session.query(TaskProgress).all() if p.taskID in task_ids]
    progress_ids = [p.id for p in progress_before]

    # Zbieramy Progress Entries przed usunięciem by mieć ich ID do sprawdzenia komentarzy
    entries_before = [e for e in db_session.query(ProgressEntry).all() if e.TaskProgressID in progress_ids]
    entry_ids = [e.id for e in entries_before]

    # 1. PRZYPADEK: MEMBER (nie owner) próbuje usunąć grupę -> Oczekujemy PermissionError
    with pytest.raises(PermissionError):
        tg.delete(user_id=member.userID, db_session=db_session)
        
    db_session.flush()
    # Sprawdzamy atomowo, że błąd odrzucił akcję i grupa nadal istnieje
    saved_tg = db_session.query(TaskGroup).filter_by(id=tg_id).first()
    assert saved_tg is not None

    # Upewniamy się, że obiekty podrzędne po rzuceniu błędu także nadal bez naruszenia istnieją
    members_check = db_session.query(GroupMember).filter_by(groupID=tg_id).all()
    assert len(members_check) > 0


    # 2. PRZYPADEK: OWNER usuwa grupę -> Sukces
    tg.delete(user_id=owner.userID, db_session=db_session)
    db_session.flush()
    
    # Sprawdzamy atomowo, że grupa faktycznie zniknęła z bazy (główny obiekt usunięto)
    deleted_tg = db_session.query(TaskGroup).filter_by(id=tg_id).first()
    assert deleted_tg is None

    # ====== SPRAWDZANIE USUWANA KASKADOWEGO (CASCADE DELETE) ======
    
    # 2.1 Członkowie grupy (GroupMember)
    deleted_members = db_session.query(GroupMember).filter_by(groupID=tg_id).all()
    assert len(deleted_members) == 0

    # 2.2 Same Zadania (Task)
    deleted_tasks = db_session.query(Task).filter_by(groupID=tg_id).all()
    assert len(deleted_tasks) == 0
    
    # 2.3 Postęp zadań i ich parametry (TaskProgress, TaskParams)
    all_progress_after = db_session.query(TaskProgress).all()
    assert not any(p.taskID in task_ids for p in all_progress_after)

    all_params_after = db_session.query(TaskParams).all()
    assert not any(p.taskID in task_ids for p in all_params_after)

    # 2.4 Zdarzenia postępów (ProgressEntry - najniższa warstwa hierarchii z diagramu)
    all_entries_after = db_session.query(ProgressEntry).all()
    assert not any(e.TaskProgressID in progress_ids for e in all_entries_after)

    # 2.5 Komentarze pod postępami (Comment - totalna ostateczna zależność)
    all_comments_after = db_session.query(Comment).all()
    assert not any(c.progressEntryID in entry_ids for c in all_comments_after)


def test_TaskGroup_addFriend(ecosystem):
    db_session = ecosystem["DB"]
    
    # Grupa Shopping (gdzie user_a to owner, user_b to członek)
    shopping_tg = ecosystem["TG"]["shopping"]["TG"]
    shopping_owner = ecosystem["TG"]["shopping"]["GM"]["owner"]  # user_a
    shopping_member = ecosystem["TG"]["shopping"]["GM"]["member"] # user_b
    shopping_ghost = ecosystem["TG"]["shopping"]["GM"]["ghost"]   # user_d
    
    # Grupa Egg Challenge (gdzie user_b to owner, a user_a go tam nie ma, choć i tak są znajomymi z friendship_ab)
    challenge_tg = ecosystem["TG"]["challenge"]["TG"]
    challenge_owner = ecosystem["TG"]["challenge"]["GM"]["owner"] # user_b

    user_a = ecosystem["users"]["a"]
    user_b = ecosystem["users"]["b"]
    user_c = ecosystem["users"]["c"]
    user_d = ecosystem["users"]["d"]

    # 1. PRZYPADEK: MEMBER próbuje dodać kogoś -> Błąd uprawnień (PermissionError)
    # B (member w shopping) próbuje dodać swojego znajomego C
    with pytest.raises(PermissionError):
        shopping_tg.addFriend(db_session=db_session, user_id=shopping_member.userID, friend_id=user_c.id)

    db_session.flush()

    # 2. PRZYPADEK: OWNER dodaje znajomego, który już jest w grupie -> Błąd (ValueError)
    # A dodaje B w shopping (są znajomymi, ale B już jest)
    with pytest.raises(ValueError):
        shopping_tg.addFriend(db_session=db_session, user_id=shopping_owner.userID, friend_id=user_b.id)

    db_session.flush()
    
    # 3. PRZYPADEK: OWNER dodaje użytkownika, który nie jest jego znajomym -> Błąd (PermissionError)
    # A próbuje dodać C w shopping (nie ma friendship_ac)
    with pytest.raises(PermissionError):
        shopping_tg.addFriend(db_session=db_session, user_id=shopping_owner.userID, friend_id=user_c.id)

    db_session.flush()
    
    # 4. PRZYPADEK: SUKCES - OWNER dodaje poprawnego znajomego (grupa egg challenge)
    # B (owner w challenge) dodaje A (B i A są znajomymi, a A jeszcze nie ma w challenge)
    previous_members_count = len(db_session.query(GroupMember).filter_by(groupID=challenge_tg.id).all())
    
    challenge_tg.addFriend(db_session=db_session, user_id=challenge_owner.userID, friend_id=user_a.id)
    db_session.flush()
    
    new_member_record = db_session.query(GroupMember).filter_by(
        groupID=challenge_tg.id,
        userID=user_a.id,
    ).first()
    
    assert new_member_record is not None
    assert new_member_record.active is True
    
    current_members_count = len(db_session.query(GroupMember).filter_by(groupID=challenge_tg.id).all())
    assert current_members_count == previous_members_count + 1

    # 5. PRZYPADEK: Dodanie znajomego, który uprzednio był członkiem i zostawił ducha
    # Skupiamy się na samym "wskrzeszaniu" ghosta z zachowaniem tego samego wiersza bazy
    shopping_tg.addFriend(db_session=db_session, user_id=shopping_owner.userID, friend_id=shopping_ghost.userID)
    db_session.flush()
    
    ghost_record = db_session.query(GroupMember).filter_by(
        groupID=shopping_tg.id,
        userID=shopping_ghost.userID,
    ).first()
    
    # Duch obudzony, ale id zostaje to samo (chroni historię jego postępów)
    assert ghost_record is not None
    assert ghost_record.active is True
    assert ghost_record.id == shopping_ghost.id


def test_TaskGroup_createTask(ecosystem):
    db_session = ecosystem["DB"]
    
    # Coop: Shopping Group
    coop_tg = ecosystem["TG"]["shopping"]["TG"]
    coop_owner = ecosystem["TG"]["shopping"]["GM"]["owner"]
    coop_member = ecosystem["TG"]["shopping"]["GM"]["member"]
    coop_ghost = ecosystem["TG"]["shopping"]["GM"]["ghost"]
    
    # Competitive: Egg Challenge
    comp_tg = ecosystem["TG"]["challenge"]["TG"]
    comp_owner = ecosystem["TG"]["challenge"]["GM"]["owner"]
    comp_admin = ecosystem["TG"]["challenge"]["GM"]["admin"]

    # -------------------------------------------------------------------
    # PRZYPADEK 1: GHOST PRÓBUJE DODAĆ TASKA ZARÓWNO W COOP JAK I COMP
    # -------------------------------------------------------------------
    coop_task_count_before = coop_tg.taskCount
    ghost_task_data = {
        "name": "Ghost_Task",
        "description": "I am ghost",
        "goal": 10.0,
        "task_type": "endless",
        "photoRequired": False,
        "color": "#fff",
        "notifications": True
    }
    
    with pytest.raises(PermissionError):
        coop_tg.createTask(user_id=coop_ghost.userID, db_session=db_session, **ghost_task_data)
        
    db_session.flush()
    # Weryfikacja ze obiekt nie trafil do bazy 
    assert coop_tg.taskCount == coop_task_count_before
    assert db_session.query(Task).filter_by(name="Ghost_Task").first() is None


    # -------------------------------------------------------------------
    # PRZYPADEK 2: MEMBER DODAJE TASKA ONETIME W COOP (SUKCES)
    # -------------------------------------------------------------------
    member_data = {
        "name": "Member_Task_OneTime",
        "description": "Jednorazowy od membera",
        "goal": 50.0, 
        "task_type": "onetime",
        "deadline": datetime(2026, 12, 12, 12, 0),
        "photoRequired": True,
        "color": "#ff0000",
        "notifications": False
    }
    
    coop_task_count_before = coop_tg.taskCount
    coop_tg.createTask(user_id=coop_member.userID, db_session=db_session, **member_data)
    db_session.flush()
    
    assert coop_tg.taskCount == coop_task_count_before + 1
    created_coop_task = db_session.query(Task).filter_by(name="Member_Task_OneTime").first()
    assert created_coop_task is not None
    assert isinstance(created_coop_task, OneTimeTask)
    assert created_coop_task.goal == 50.0
    
    # Parametry
    coop_params = db_session.query(TaskParams).filter_by(taskID=created_coop_task.id).first()
    assert coop_params is not None
    assert coop_params.photoRequired is True
    
    # TaskProgress dla COOP: powstaje tylko JEDEN (userID to None)
    coop_progresses = db_session.query(TaskProgress).filter_by(taskID=created_coop_task.id).all()
    assert len(coop_progresses) == 1
    assert coop_progresses[0].userID is None


    # -------------------------------------------------------------------
    # PRZYPADEK 3: ADMIN DODAJE TASKA REPEATABLE W COMPETITIVE (SUKCES)
    # -------------------------------------------------------------------
    admin_data = {
        "name": "Admin_Task_Repeatable",
        "description": "Powtarzalny od admina",
        "goal": -10.0, # Test przemyślanego ujemnego goala
        "task_type": "repeatable",
        "frequency": TimeInterval.DAILY,
        "photoRequired": False,
        "color": "#00ff00",
        "notifications": True
    }
    
    comp_task_count_before = comp_tg.taskCount
    
    # Pobieramy wszystkich AKTYWNYCH członków competitive do sprawdzenia ilości TaskProgress
    active_comp_members = db_session.query(GroupMember).filter_by(
        groupID=comp_tg.id,
        active=True,
    ).all()
    
    comp_tg.createTask(user_id=comp_admin.userID, db_session=db_session, **admin_data)
    db_session.flush()
    
    assert comp_tg.taskCount == comp_task_count_before + 1
    created_comp_task = db_session.query(Task).filter_by(name="Admin_Task_Repeatable").first()
    assert created_comp_task is not None
    assert isinstance(created_comp_task, RepeatableTask)
    assert created_comp_task.goal == -10.0
    
    # Parametry
    comp_params = db_session.query(TaskParams).filter_by(taskID=created_comp_task.id).first()
    assert comp_params is not None
    
    # TaskProgress dla COMP: tworzony dla każdego aktywnego użytkownika
    comp_progresses = db_session.query(TaskProgress).filter_by(taskID=created_comp_task.id).all()
    assert len(comp_progresses) == len(active_comp_members)
    
    users_with_progress = {p.userID for p in comp_progresses}
    expected_users = {m.userID for m in active_comp_members}
    assert users_with_progress == expected_users


    # -------------------------------------------------------------------
    # PRZYPADEK 4: OWNER DODAJE TASKA CHALLENGE W COMPETITIVE (SUKCES)
    # -------------------------------------------------------------------
    owner_data = {
        "name": "Owner_Challenge_Task",
        "description": "Zadanie wyzwanie",
        "goal": 100.0,
        "task_type": "challenge",
        "deadline": datetime(2026, 1, 1, 0, 0),
        "photoRequired": True,
        "color": "#0000ff",
        "notifications": True
    }
    comp_owner_tasks_count = comp_tg.taskCount
    comp_tg.createTask(user_id=comp_owner.userID, db_session=db_session, **owner_data)
    db_session.flush()
    
    assert comp_tg.taskCount == comp_owner_tasks_count + 1
    owner_created_task = db_session.query(Task).filter_by(name="Owner_Challenge_Task").first()
    assert isinstance(owner_created_task, ChallengeTask)


    # -------------------------------------------------------------------
    # PRZYPADEK 5: BŁĘDNE DANE - PUSTA NAZWA
    # -------------------------------------------------------------------
    invalid_name_data = admin_data.copy()
    invalid_name_data["name"] = "" 

    tasks_count_before_err = comp_tg.taskCount
    params_count_before_err = len(db_session.query(TaskParams).all())
    progress_count_before_err = len(db_session.query(TaskProgress).all())
    
    with pytest.raises(ValueError):
        comp_tg.createTask(user_id=comp_admin.userID, db_session=db_session, **invalid_name_data)
        
    db_session.flush()
    assert comp_tg.taskCount == tasks_count_before_err
    assert db_session.query(Task).filter_by(name="").first() is None
    assert len(db_session.query(TaskParams).all()) == params_count_before_err
    assert len(db_session.query(TaskProgress).all()) == progress_count_before_err


    # -------------------------------------------------------------------
    # PRZYPADEK 6: BŁĘDNE DANE - UŻYTKOWNIK SPOZA GRUPY (PERMISSION ERROR)
    # -------------------------------------------------------------------
    invalid_user_data = admin_data.copy()
    invalid_user_data["name"] = "NeverCreated"
    
    # Wyciągamy rzeczywistych użytkowników z ekosystemu, np. user_a, który nie należy do Egg Challenge (comp_tg)
    user_not_in_group = ecosystem["users"]["a"] 
    
    with pytest.raises(PermissionError):
        comp_tg.createTask(user_id=user_not_in_group.id, db_session=db_session, **invalid_user_data)
        
    db_session.flush()
    assert comp_tg.taskCount == tasks_count_before_err
    assert db_session.query(Task).filter_by(name="NeverCreated").first() is None
    assert len(db_session.query(TaskParams).all()) == params_count_before_err
    assert len(db_session.query(TaskProgress).all()) == progress_count_before_err

def test_TaskGroup_changeGroupType():
    pass
    #zmieniamy typ z competetive na cooperative, sprawdzamy czy działa
    #zmieniamy na odwrót, sprawdzamy czy działa
    #TODO: zdecydowac sie na wersje finalna jak to ma byc robione

# notatka do chata tylko ze se narazie nie radzil z tym jak cos xd
#     dobra teraz zrob changegrouptype.

# podobnie przetestuj duzo casow tak jak w poprzednim co nie no i tak:

# coop->comp tworzy taskProgress dla kazdego z userow. na podstawie progress entry przypisuje progress entrry do taskprogress usera ktory dodal progressEntry i akutalizuje progress tego usera, czyli jakby moze stworzyc nowy temp obiekt dla tg ownera i jakby do niego zbierze dane na podstawie PE dodanych przez ownera i potem zaktualizuje tamto PE ownera, czytli go nie usuwa i nie tworzy nowego,. wiesz o co chodzi?

# comp->coop wszystko przypisuje do taskProgress ownera, aktualizuje PE zeby sie odnosily do tego progressu ownera, pozostale progressy usuwa.  czyli tu analogicznie z tym temp progressem i potem przepisuje go do starego progressu ownera i potem usuwa progressy innych memberow


# i oczywiscie wszystko sprawdza czy sie usunelo czy sie dodalo i tak dalej. you know the drill.

