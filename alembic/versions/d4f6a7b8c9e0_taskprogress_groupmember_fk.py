"""taskprogress_groupmember_fk

Revision ID: d4f6a7b8c9e0
Revises: a1f9d2c7b4e6
Create Date: 2026-04-24 12:10:00.000000

"""

from typing import Sequence, Union
from uuid import uuid4

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "d4f6a7b8c9e0"
down_revision: Union[str, Sequence[str], None] = "a1f9d2c7b4e6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    # group_members: switch PK from (userID, groupID) to id and keep user/group unique.
    group_member_columns = {c.get("name") for c in inspector.get_columns("group_members")}
    if "id" not in group_member_columns:
        op.add_column("group_members", sa.Column("id", sa.Uuid(), nullable=True))

        rows = bind.execute(sa.text('SELECT "userID", "groupID" FROM group_members')).fetchall()
        for user_id, group_id in rows:
            bind.execute(
                sa.text(
                    'UPDATE group_members '
                    'SET id = :id '
                    'WHERE "userID" = :user_id AND "groupID" = :group_id'
                ),
                {
                    "id": uuid4(),
                    "user_id": user_id,
                    "group_id": group_id,
                },
            )

        op.alter_column("group_members", "id", existing_type=sa.Uuid(), nullable=False)

    inspector = sa.inspect(bind)
    group_member_pk = inspector.get_pk_constraint("group_members")
    group_member_pk_name = group_member_pk.get("name")
    group_member_pk_cols = group_member_pk.get("constrained_columns") or []

    if group_member_pk_cols != ["id"]:
        if group_member_pk_name:
            op.drop_constraint(group_member_pk_name, "group_members", type_="primary")
        op.create_primary_key("group_members_pkey", "group_members", ["id"])

    group_member_unique_names = {u.get("name") for u in inspector.get_unique_constraints("group_members")}
    if "uq_group_member_user_group" not in group_member_unique_names:
        op.create_unique_constraint("uq_group_member_user_group", "group_members", ["userID", "groupID"])

    # task_progresses: replace userID FK with groupMemberID FK.
    inspector = sa.inspect(bind)
    task_progress_columns = {c.get("name") for c in inspector.get_columns("task_progresses")}
    if "groupMemberID" not in task_progress_columns:
        op.add_column("task_progresses", sa.Column("groupMemberID", sa.Uuid(), nullable=True))

    bind.execute(
        sa.text(
            'UPDATE task_progresses tp '
            'SET "groupMemberID" = gm.id '
            'FROM tasks t, group_members gm '
            'WHERE t.id = tp."taskID" '
            '  AND gm."userID" = tp."userID" '
            '  AND gm."groupID" = t."groupID" '
            '  AND tp."groupMemberID" IS NULL '
            '  AND tp."userID" IS NOT NULL'
        )
    )

    task_progress_fk_names = {fk.get("name") for fk in inspector.get_foreign_keys("task_progresses")}
    if "task_progresses_userID_fkey" in task_progress_fk_names:
        op.drop_constraint("task_progresses_userID_fkey", "task_progresses", type_="foreignkey")

    task_progress_unique_names = {u.get("name") for u in inspector.get_unique_constraints("task_progresses")}
    if "uq_task_progress_user_task" in task_progress_unique_names:
        op.drop_constraint("uq_task_progress_user_task", "task_progresses", type_="unique")

    task_progress_index_names = {i.get("name") for i in inspector.get_indexes("task_progresses")}
    if "ix_task_progresses_user_task" in task_progress_index_names:
        op.drop_index("ix_task_progresses_user_task", table_name="task_progresses")
    if "ix_task_progresses_userID" in task_progress_index_names:
        op.drop_index("ix_task_progresses_userID", table_name="task_progresses")

    task_progress_fk_names = {fk.get("name") for fk in inspector.get_foreign_keys("task_progresses")}
    if "task_progresses_groupMemberID_fkey" not in task_progress_fk_names:
        op.create_foreign_key(
            "task_progresses_groupMemberID_fkey",
            "task_progresses",
            "group_members",
            ["groupMemberID"],
            ["id"],
            ondelete="SET NULL",
        )

    task_progress_unique_names = {u.get("name") for u in inspector.get_unique_constraints("task_progresses")}
    if "uq_task_progress_group_member_task" not in task_progress_unique_names:
        op.create_unique_constraint(
            "uq_task_progress_group_member_task",
            "task_progresses",
            ["groupMemberID", "taskID"],
        )

    task_progress_index_names = {i.get("name") for i in inspector.get_indexes("task_progresses")}
    if "ix_task_progresses_groupMemberID" not in task_progress_index_names:
        op.create_index("ix_task_progresses_groupMemberID", "task_progresses", ["groupMemberID"], unique=False)
    if "ix_task_progresses_group_member_task" not in task_progress_index_names:
        op.create_index("ix_task_progresses_group_member_task", "task_progresses", ["groupMemberID", "taskID"], unique=False)

    inspector = sa.inspect(bind)
    task_progress_columns = {c.get("name") for c in inspector.get_columns("task_progresses")}
    if "userID" in task_progress_columns:
        op.drop_column("task_progresses", "userID")


def downgrade() -> None:
    """Downgrade schema."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    # task_progresses: restore userID and remove groupMemberID.
    task_progress_columns = {c.get("name") for c in inspector.get_columns("task_progresses")}
    if "userID" not in task_progress_columns:
        op.add_column("task_progresses", sa.Column("userID", sa.Uuid(), nullable=True))

    bind.execute(
        sa.text(
            'UPDATE task_progresses tp '
            'SET "userID" = gm."userID" '
            'FROM group_members gm '
            'WHERE gm.id = tp."groupMemberID" '
            '  AND tp."userID" IS NULL'
        )
    )

    task_progress_fk_names = {fk.get("name") for fk in inspector.get_foreign_keys("task_progresses")}
    if "task_progresses_groupMemberID_fkey" in task_progress_fk_names:
        op.drop_constraint("task_progresses_groupMemberID_fkey", "task_progresses", type_="foreignkey")

    task_progress_unique_names = {u.get("name") for u in inspector.get_unique_constraints("task_progresses")}
    if "uq_task_progress_group_member_task" in task_progress_unique_names:
        op.drop_constraint("uq_task_progress_group_member_task", "task_progresses", type_="unique")

    task_progress_index_names = {i.get("name") for i in inspector.get_indexes("task_progresses")}
    if "ix_task_progresses_group_member_task" in task_progress_index_names:
        op.drop_index("ix_task_progresses_group_member_task", table_name="task_progresses")
    if "ix_task_progresses_groupMemberID" in task_progress_index_names:
        op.drop_index("ix_task_progresses_groupMemberID", table_name="task_progresses")

    task_progress_fk_names = {fk.get("name") for fk in inspector.get_foreign_keys("task_progresses")}
    if "task_progresses_userID_fkey" not in task_progress_fk_names:
        op.create_foreign_key(
            "task_progresses_userID_fkey",
            "task_progresses",
            "users",
            ["userID"],
            ["id"],
            ondelete="SET NULL",
        )

    task_progress_unique_names = {u.get("name") for u in inspector.get_unique_constraints("task_progresses")}
    if "uq_task_progress_user_task" not in task_progress_unique_names:
        op.create_unique_constraint("uq_task_progress_user_task", "task_progresses", ["userID", "taskID"])

    task_progress_index_names = {i.get("name") for i in inspector.get_indexes("task_progresses")}
    if "ix_task_progresses_userID" not in task_progress_index_names:
        op.create_index("ix_task_progresses_userID", "task_progresses", ["userID"], unique=False)
    if "ix_task_progresses_user_task" not in task_progress_index_names:
        op.create_index("ix_task_progresses_user_task", "task_progresses", ["userID", "taskID"], unique=False)

    inspector = sa.inspect(bind)
    task_progress_columns = {c.get("name") for c in inspector.get_columns("task_progresses")}
    if "groupMemberID" in task_progress_columns:
        op.drop_column("task_progresses", "groupMemberID")

    # group_members: restore composite PK and drop id.
    inspector = sa.inspect(bind)
    group_member_pk = inspector.get_pk_constraint("group_members")
    group_member_pk_name = group_member_pk.get("name")
    group_member_pk_cols = group_member_pk.get("constrained_columns") or []

    if group_member_pk_cols == ["id"] and group_member_pk_name:
        op.drop_constraint(group_member_pk_name, "group_members", type_="primary")

    group_member_unique_names = {u.get("name") for u in inspector.get_unique_constraints("group_members")}
    if "uq_group_member_user_group" in group_member_unique_names:
        op.drop_constraint("uq_group_member_user_group", "group_members", type_="unique")

    op.create_primary_key("group_members_pkey", "group_members", ["userID", "groupID"])

    inspector = sa.inspect(bind)
    group_member_columns = {c.get("name") for c in inspector.get_columns("group_members")}
    if "id" in group_member_columns:
        op.drop_column("group_members", "id")
