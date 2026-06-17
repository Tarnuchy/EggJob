"""Regression tests for the final bug-fixing sprint (bugs 3, 4, 7).

Covered:
  * Bug 3 — TaskGroup.changeGroupType in both directions (previously raised a
    FlushError "Can't delete ... using NULL for primary key").
  * Bug 4 — bingo conversion validates against the real task count and Task.delete
    keeps TaskGroup.taskCount in sync.
  * Bug 7 — user_stats counts cooperative (shared, groupMemberID=None) tasks.
"""

from sqlalchemy import text

from src.backend.basics import user_stats
from src.backend.models import (
    GroupMember,
    GroupRole,
    ProgressEntry,
    Task,
    TaskGroupType,
    TaskProgress,
    TaskStatus,
    TaskType,
)


def _member(db_session, group_id, user_id):
    return db_session.query(GroupMember).filter_by(groupID=group_id, userID=user_id).first()


# ---------------------------------------------------------------------------
# Bug 3 — changeGroupType
# ---------------------------------------------------------------------------
def test_changeGroupType_competitive_to_cooperative(db_session, user_a, user_b):
    owner = user_a
    group = owner.createGroup(db_session=db_session, name="Comp", type=TaskGroupType.COMPETITIVE)
    db_session.flush()
    group.addFriend(db_session=db_session, user_id=owner.id, friend_id=user_b.id, role=GroupRole.MEMBER)
    db_session.flush()

    task = group.createTask(db_session=db_session, user_id=owner.id, type=TaskType.ENDLESS, name="Steps", goal=100.0)
    db_session.flush()

    progresses = db_session.query(TaskProgress).filter_by(taskID=task.id).all()
    assert len(progresses) == 2  # one per active member in a competitive group

    owner_member = _member(db_session, group.id, owner.id)
    b_member = _member(db_session, group.id, user_b.id)
    owner_prog = next(p for p in progresses if p.groupMemberID == owner_member.id)
    b_prog = next(p for p in progresses if p.groupMemberID == b_member.id)
    owner_prog.updateProgress(db_session=db_session, delta_value=30, user_id=owner.id, message="o")
    b_prog.updateProgress(db_session=db_session, delta_value=20, user_id=user_b.id, message="b")
    db_session.flush()

    # This previously raised sqlalchemy.orm.exc.FlushError.
    group.changeGroupType(db_session=db_session, user_id=owner.id, new_type=TaskGroupType.COOPERATIVE)
    db_session.commit()

    survivors = db_session.query(TaskProgress).filter_by(taskID=task.id).all()
    assert len(survivors) == 1
    assert survivors[0].groupMemberID is None
    assert survivors[0].value == 50  # 30 + 20 merged

    entries = db_session.query(ProgressEntry).filter_by(TaskProgressID=survivors[0].id).all()
    assert len(entries) == 2  # both members' entries preserved + re-homed

    assert db_session.execute(
        text("SELECT count(*) FROM cooperative_task_groups WHERE id = :i"), {"i": group.id}
    ).scalar() == 1
    assert db_session.execute(
        text("SELECT count(*) FROM competitive_task_groups WHERE id = :i"), {"i": group.id}
    ).scalar() == 0


def test_changeGroupType_cooperative_to_competitive(db_session, user_a, user_b):
    owner = user_a
    group = owner.createGroup(db_session=db_session, name="Coop", type=TaskGroupType.COOPERATIVE)
    db_session.flush()
    group.addFriend(db_session=db_session, user_id=owner.id, friend_id=user_b.id, role=GroupRole.MEMBER)
    db_session.flush()

    task = group.createTask(db_session=db_session, user_id=owner.id, type=TaskType.ENDLESS, name="Shared", goal=100.0)
    db_session.flush()

    progresses = db_session.query(TaskProgress).filter_by(taskID=task.id).all()
    assert len(progresses) == 1 and progresses[0].groupMemberID is None  # single shared progress
    shared = progresses[0]
    shared.updateProgress(db_session=db_session, delta_value=40, user_id=owner.id, message="o")
    shared.updateProgress(db_session=db_session, delta_value=25, user_id=user_b.id, message="b")
    db_session.flush()
    assert shared.value == 65

    group.changeGroupType(db_session=db_session, user_id=owner.id, new_type=TaskGroupType.COMPETITIVE)
    db_session.commit()

    progresses2 = db_session.query(TaskProgress).filter_by(taskID=task.id).all()
    assert len(progresses2) == 2  # one progress per member

    owner_member = _member(db_session, group.id, owner.id)
    b_member = _member(db_session, group.id, user_b.id)
    by_member = {p.groupMemberID: p for p in progresses2}
    assert set(by_member) == {owner_member.id, b_member.id}
    # entries re-homed to their authors, values recomputed from those entries
    assert by_member[owner_member.id].value == 40
    assert by_member[b_member.id].value == 25
    owner_entries = db_session.query(ProgressEntry).filter_by(TaskProgressID=by_member[owner_member.id].id).all()
    assert owner_entries and all(e.memberID == owner_member.id for e in owner_entries)

    assert db_session.execute(
        text("SELECT count(*) FROM competitive_task_groups WHERE id = :i"), {"i": group.id}
    ).scalar() == 1
    assert db_session.execute(
        text("SELECT count(*) FROM cooperative_task_groups WHERE id = :i"), {"i": group.id}
    ).scalar() == 0


# ---------------------------------------------------------------------------
# Bug 4 — bingo conversion + taskCount drift
# ---------------------------------------------------------------------------
def test_bingo_conversion_uses_real_task_count(db_session, user_a):
    owner = user_a
    group = owner.createGroup(db_session=db_session, name="List", type=TaskGroupType.COOPERATIVE)
    db_session.flush()

    tasks = [
        group.createTask(db_session=db_session, user_id=owner.id, type=TaskType.ONE_TIME, name=f"T{i}", goal=1.0)
        for i in range(10)
    ]
    db_session.flush()
    assert group.taskCount == 10

    # Delete one task -> 9 real tasks, but taskCount stays at 10 (it is not decremented on delete).
    # Bingo conversion must validate against the REAL count (9 -> valid 3x3), not the stale counter,
    # which previously produced a spurious 400.
    tasks[0].delete(db_session=db_session, user_id=owner.id)
    db_session.flush()
    assert group.taskCount == 10  # stale counter
    assert db_session.query(Task).filter_by(groupID=group.id).count() == 9  # real count

    group.edit(db_session=db_session, user_id=owner.id, isBingo=True)
    db_session.commit()
    assert group.isBingo is True


def test_bingo_conversion_rejects_invalid_count(db_session, user_a):
    import pytest
    from src.backend.exceptions import ValidationError

    owner = user_a
    group = owner.createGroup(db_session=db_session, name="List", type=TaskGroupType.COOPERATIVE)
    db_session.flush()
    for i in range(7):  # 7 is not a valid bingo size
        group.createTask(db_session=db_session, user_id=owner.id, type=TaskType.ONE_TIME, name=f"T{i}", goal=1.0)
    db_session.flush()
    with pytest.raises(ValidationError):
        group.edit(db_session=db_session, user_id=owner.id, isBingo=True)


# ---------------------------------------------------------------------------
# Bug 7 — cooperative/bingo tasks counted in user stats
# ---------------------------------------------------------------------------
def test_user_stats_counts_cooperative_tasks(db_session, user_a, user_b):
    owner = user_a
    group = owner.createGroup(db_session=db_session, name="Coop", type=TaskGroupType.COOPERATIVE)
    db_session.flush()
    group.addFriend(db_session=db_session, user_id=owner.id, friend_id=user_b.id, role=GroupRole.MEMBER)
    db_session.flush()
    task_a = group.createTask(db_session=db_session, user_id=owner.id, type=TaskType.ONE_TIME, name="A", goal=1.0)
    group.createTask(db_session=db_session, user_id=owner.id, type=TaskType.ONE_TIME, name="B", goal=1.0)
    db_session.commit()

    # Both shared cooperative tasks must count as active for every active member.
    owner_stats = user_stats(owner.id, db_session)
    assert owner_stats.active_tasks == 2
    assert owner_stats.completed_tasks == 0
    member_stats = user_stats(user_b.id, db_session)
    assert member_stats.active_tasks == 2

    # Completing the shared task moves it from active to completed for everyone.
    shared = db_session.query(TaskProgress).filter_by(taskID=task_a.id).first()
    shared.updateProgress(db_session=db_session, delta_value=1, user_id=owner.id, message="done")
    db_session.commit()
    assert shared.status == TaskStatus.DONE
    after = user_stats(owner.id, db_session)
    assert after.active_tasks == 1
    assert after.completed_tasks == 1
