from src.backend.models import *

def test_GroupMember_leaveGroup_take_progress(
    db_session,
    GM_shoppingList_ghost,
    task_shoppingList_cheese,
    TaskProgress_shoppingList_cheese,
    TaskProgress_shoppingList_eggs,
    PE_shoppingList_eggs,
    eggChallenge_bundle
):
    #30 minut z codexem siedziałem, chyba git ten test # kuźwa jaki syf, ale nie mogę się już wycofać 💀
    member_before = db_session.query(GroupMember).filter_by(
        userID=GM_shoppingList_ghost.userID,
        groupID=GM_shoppingList_ghost.groupID,
    ).first()
    task_cheese_before = db_session.query(OneTimeTask).filter(
        OneTimeTask.id == task_shoppingList_cheese.id
    ).first()
    cheese_progress_before = db_session.query(OneTimeTaskProgress).filter(
        OneTimeTaskProgress.id == TaskProgress_shoppingList_cheese.id
    ).first()
    owner_progress_before = db_session.query(OneTimeTaskProgress).filter(
        OneTimeTaskProgress.id == TaskProgress_shoppingList_eggs.id
    ).first()
    entry_before = db_session.query(ProgressEntry).filter(
        ProgressEntry.id == PE_shoppingList_eggs.id
    ).first()

    assert member_before is not None
    assert task_cheese_before is not None
    assert cheese_progress_before is not None
    assert owner_progress_before is not None
    assert entry_before is not None

    cheese_progress_before_value = cheese_progress_before.value
    owner_progress_before_value = owner_progress_before.value
    ghost_entry_value = PE_shoppingList_eggs.value

    GM_shoppingList_ghost.leaveGroup(session=db_session, take_progress=True)
    db_session.flush()

    member_after = db_session.query(GroupMember).filter_by(
        userID=GM_shoppingList_ghost.userID,
        groupID=GM_shoppingList_ghost.groupID,
    ).first()
    task_cheese_after = db_session.query(OneTimeTask).filter(
        OneTimeTask.id == task_shoppingList_cheese.id
    ).first()
    cheese_progress_after = db_session.query(OneTimeTaskProgress).filter(
        OneTimeTaskProgress.id == TaskProgress_shoppingList_cheese.id
    ).first()
    owner_progress_after = db_session.query(OneTimeTaskProgress).filter(
        OneTimeTaskProgress.id == TaskProgress_shoppingList_eggs.id
    ).first()
    entry_after = db_session.query(ProgressEntry).filter(
        ProgressEntry.id == PE_shoppingList_eggs.id
    ).first()

    assert member_after is None
    assert task_cheese_after is not None
    assert cheese_progress_after is not None
    assert cheese_progress_after.value == cheese_progress_before_value #po co to sprawdzać? nwm zostawie
    assert entry_after is None
    assert owner_progress_after is not None
    assert owner_progress_after.value == owner_progress_before_value - ghost_entry_value
    
    
    #rozjuszyłem się, sam już piszę
    admin = eggChallenge_bundle["GM"]["admin"]
    admin_progress_before = eggChallenge_bundle["tasks"]["eating"]["progress"]["admin"]
    admin_entries_before = eggChallenge_bundle["tasks"]["eating"]["entries"]["admin"]
    owner_progress_before = eggChallenge_bundle["tasks"]["eating"]["progress"]["owner"]
    
    admin.leaveGroup(session=db_session, take_progress=True)
    db_session.flush()#???
    assert db_session.query(GroupMember).filter_by(userID=admin.userID, groupID=eggChallenge_bundle["TG"].id).first() is None
    assert db_session.query(OneTimeTaskProgress).filter_by(userId=admin.userID, taskID=admin_progress_before.taskID).first() is not None
    for entry in admin_entries_before:
        assert db_session.query(ProgressEntry).filter_by(id=entry.id).first() is None
    assert db_session.query(OneTimeTaskProgress).filter_by(userId=eggChallenge_bundle["GM"]["owner"].userID, taskID=admin_progress_before.taskID).first().value == owner_progress_before.value
    


def test_GroupMember_leaveGroup_keep_progress(
    db_session,
    GM_shoppingList_member,
    TaskProgress_shoppingList_bread,
    PE_shoppingList_bread,
):
    #można dodać sprawdzanie czy wartości są git, ale to trzeba jełopem być żeby to źle zaimplementować
    member_before = db_session.query(GroupMember).filter_by(
        userID=GM_shoppingList_member.userID,
        groupID=GM_shoppingList_member.groupID,
    ).first()
    progress_before = db_session.query(OneTimeTaskProgress).filter(
        OneTimeTaskProgress.id == TaskProgress_shoppingList_bread.id
    ).first()
    entry_before = db_session.query(ProgressEntry).filter(
        ProgressEntry.id == PE_shoppingList_bread.id
    ).first()

    assert member_before is not None
    assert member_before.active is True
    assert progress_before is not None
    assert entry_before is not None

    GM_shoppingList_member.leaveGroup(session=db_session, take_progress=False)
    db_session.flush()

    member_after = db_session.query(GroupMember).filter_by(
        userID=GM_shoppingList_member.userID,
        groupID=GM_shoppingList_member.groupID,
    ).first()
    progress_after = db_session.query(OneTimeTaskProgress).filter(
        OneTimeTaskProgress.id == TaskProgress_shoppingList_bread.id
    ).first()
    entry_after = db_session.query(ProgressEntry).filter(
        ProgressEntry.id == PE_shoppingList_bread.id
    ).first()

    assert member_after is not None
    assert member_after.active is False
    assert progress_after is not None
    assert entry_after is not None

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