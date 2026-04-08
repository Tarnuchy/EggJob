from src.backend.models import *

def test_GroupMember_leaveGroup_take_progress(
    db_session,
    GM_shoppingList_ghost,
    task_shoppingList_cheese,
    TaskProgress_shoppingList_cheese,
    TaskProgress_shoppingList_eggs,
    PE_shoppingList_eggs,
):
    #30 minut z codexem siedziałem, chyba git ten test
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
    assert cheese_progress_after.value == cheese_progress_before_value
    assert entry_after is None
    assert owner_progress_after is not None
    assert owner_progress_after.value == owner_progress_before_value - ghost_entry_value


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
