import pytest

from src.backend.models import *

def test_GroupMember_removeMember_take_progress(
    db_session,
    GM_shoppingList_ghost,
    task_shoppingList_cheese,
    TaskProgress_shoppingList_cheese,
    TaskProgress_shoppingList_eggs,
    PE_shoppingList_eggs,
    eggChallenge_bundle
):
    #30 minut z codexem siedziałem, chyba git ten test # kuźwa jaki syf, ale nie mogę się już wycofać 💀
    #TODO fix, coś się wywala
    member_before = db_session.query(GroupMember).filter_by(
        userID=GM_shoppingList_ghost.userID,
        groupID=GM_shoppingList_ghost.groupID,
    ).first()
    task_cheese_before = db_session.query(OneTimeTask).filter_by(
        id=task_shoppingList_cheese.id
    ).first()
    cheese_progress_before = db_session.query(OneTimeTaskProgress).filter_by(
        id=TaskProgress_shoppingList_cheese.id
    ).first()
    owner_progress_before = db_session.query(OneTimeTaskProgress).filter_by(
        id=TaskProgress_shoppingList_eggs.id
    ).first()
    entry_before = db_session.query(ProgressEntry).filter_by(
        id=PE_shoppingList_eggs.id
    ).first()
    owner = db_session.query(User).filter_by(id=TaskProgress_shoppingList_eggs.userId).first()

    assert member_before is not None
    assert task_cheese_before is not None
    assert cheese_progress_before is not None
    assert owner_progress_before is not None
    assert entry_before is not None

    cheese_progress_before_value = cheese_progress_before.value
    owner_progress_before_value = owner_progress_before.value
    ghost_entry_value = PE_shoppingList_eggs.value

    GM_shoppingList_ghost.removeMember(db_session=db_session, take_progress=True, punisher=owner.id)
    db_session.flush()

    member_after = db_session.query(GroupMember).filter_by(
        userID=GM_shoppingList_ghost.userID,
        groupID=GM_shoppingList_ghost.groupID,
    ).first()
    task_cheese_after = db_session.query(OneTimeTask).filter_by(
        id=task_shoppingList_cheese.id
    ).first()
    cheese_progress_after = db_session.query(OneTimeTaskProgress).filter_by(
        id=TaskProgress_shoppingList_cheese.id
    ).first()
    owner_progress_after = db_session.query(OneTimeTaskProgress).filter_by(
        id=TaskProgress_shoppingList_eggs.id
    ).first()
    entry_after = db_session.query(ProgressEntry).filter_by(
        id=PE_shoppingList_eggs.id
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
    
    admin.removeMember(db_session=db_session, take_progress=True, punisher=admin.userID)
    db_session.flush()#???
    assert db_session.query(GroupMember).filter_by(userID=admin.userID, groupID=eggChallenge_bundle["TG"].id).first() is None
    assert db_session.query(OneTimeTaskProgress).join(GroupMember).filter(
        GroupMember.userID == admin.userID,
        OneTimeTaskProgress.taskID == admin_progress_before.taskID,
    ).first() is not None
    for entry in admin_entries_before:
        assert db_session.query(ProgressEntry).filter_by(id=entry.id).first() is None
    assert db_session.query(OneTimeTaskProgress).join(GroupMember).filter(
        GroupMember.userID == eggChallenge_bundle["GM"]["owner"].userID,
        OneTimeTaskProgress.taskID == admin_progress_before.taskID,
    ).first().value == owner_progress_before.value
    
    with pytest.raises(Exception):
        owner.removeMember(db_session=db_session, take_progress=True, punisher=owner.id)
    

def test_GroupMember_removeMember_keep_progress(
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
    progress_before = db_session.query(OneTimeTaskProgress).filter_by(
        id=TaskProgress_shoppingList_bread.id
    ).first()
    entry_before = db_session.query(ProgressEntry).filter_by(
        id=PE_shoppingList_bread.id
    ).first()

    assert member_before is not None
    assert member_before.active is True
    assert progress_before is not None
    assert entry_before is not None

    GM_shoppingList_member.removeMember(db_session=db_session, take_progress=False, punisher = GM_shoppingList_member.userID)
    db_session.flush()

    member_after = db_session.query(GroupMember).filter_by(
        userID=GM_shoppingList_member.userID,
        groupID=GM_shoppingList_member.groupID,
    ).first()
    progress_after = db_session.query(OneTimeTaskProgress).filter_by(
        id=TaskProgress_shoppingList_bread.id
    ).first()
    entry_after = db_session.query(ProgressEntry).filter_by(
        id=PE_shoppingList_bread.id
    ).first()

    assert member_after is not None
    assert member_after.active is False
    assert progress_after is not None
    assert entry_after is not None
    

def test_GroupMember_changePermissions(db_session, GM_shoppingList_member, GM_shoppingList_owner):
    # zmieniamy uprawnienia członka, sprawdzamy czy się zmieniły
    GM_shoppingList_member.changePermissions(db_session, GroupRole.ADMIN, GM_shoppingList_owner.userID)
    assert db_session.query(GroupMember).filter_by(userID=GM_shoppingList_member.userID, groupID=GM_shoppingList_member.groupID).first().role == GroupRole.ADMIN
    GM_shoppingList_member.changePermissions(db_session, GroupRole.MEMBER, GM_shoppingList_owner.userID)
    # próbujemy zmienić uprawnienia nie mając do tego praw, powinno wywalić błąd
    with pytest.raises(Exception):
        GM_shoppingList_member.changePermissions(db_session, GroupRole.ADMIN, GM_shoppingList_member.userID)
    
    with pytest.raises(Exception):
        GM_shoppingList_owner.changePermissions(db_session, GroupRole.ADMIN, GM_shoppingList_owner.userID)