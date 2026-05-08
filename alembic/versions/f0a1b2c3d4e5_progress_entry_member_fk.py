"""progress_entry_member_fk

Revision ID: f0a1b2c3d4e5
Revises: e6c5b4a3d2f1
Create Date: 2026-05-02 12:30:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "f0a1b2c3d4e5"
down_revision: Union[str, Sequence[str], None] = "e6c5b4a3d2f1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    progress_columns = {c.get("name") for c in inspector.get_columns("progress_entries")}
    if "memberID" not in progress_columns:
        op.add_column("progress_entries", sa.Column("memberID", sa.Uuid(), nullable=True))

    bind.execute(
        sa.text(
            'UPDATE progress_entries pe '
            'SET "memberID" = gm.id '
            'FROM task_progresses tp, tasks t, group_members gm '
            'WHERE pe."TaskProgressID" = tp.id '
            '  AND tp."taskID" = t.id '
            '  AND gm."userID" = pe."userID" '
            '  AND gm."groupID" = t."groupID" '
            '  AND pe."memberID" IS NULL'
        )
    )

    inspector = sa.inspect(bind)
    progress_fk_names = {fk.get("name") for fk in inspector.get_foreign_keys("progress_entries")}
    if "progress_entries_userID_fkey" in progress_fk_names:
        op.drop_constraint("progress_entries_userID_fkey", "progress_entries", type_="foreignkey")

    progress_index_names = {i.get("name") for i in inspector.get_indexes("progress_entries")}
    if "ix_progress_entries_userID" in progress_index_names:
        op.drop_index("ix_progress_entries_userID", table_name="progress_entries")

    progress_columns = {c.get("name") for c in inspector.get_columns("progress_entries")}
    if "userID" in progress_columns:
        op.drop_column("progress_entries", "userID")

    op.alter_column(
        "progress_entries",
        "memberID",
        existing_type=sa.Uuid(),
        nullable=False,
    )

    inspector = sa.inspect(bind)
    progress_fk_names = {fk.get("name") for fk in inspector.get_foreign_keys("progress_entries")}
    if "progress_entries_memberID_fkey" not in progress_fk_names:
        op.create_foreign_key(
            "progress_entries_memberID_fkey",
            "progress_entries",
            "group_members",
            ["memberID"],
            ["id"],
            ondelete="CASCADE",
        )

    progress_index_names = {i.get("name") for i in inspector.get_indexes("progress_entries")}
    if "ix_progress_entries_memberID" not in progress_index_names:
        op.create_index("ix_progress_entries_memberID", "progress_entries", ["memberID"], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    progress_columns = {c.get("name") for c in inspector.get_columns("progress_entries")}
    if "userID" not in progress_columns:
        op.add_column("progress_entries", sa.Column("userID", sa.Uuid(), nullable=True))

    bind.execute(
        sa.text(
            'UPDATE progress_entries pe '
            'SET "userID" = gm."userID" '
            'FROM group_members gm '
            'WHERE gm.id = pe."memberID" '
            '  AND pe."userID" IS NULL'
        )
    )

    inspector = sa.inspect(bind)
    progress_fk_names = {fk.get("name") for fk in inspector.get_foreign_keys("progress_entries")}
    if "progress_entries_memberID_fkey" in progress_fk_names:
        op.drop_constraint("progress_entries_memberID_fkey", "progress_entries", type_="foreignkey")

    progress_index_names = {i.get("name") for i in inspector.get_indexes("progress_entries")}
    if "ix_progress_entries_memberID" in progress_index_names:
        op.drop_index("ix_progress_entries_memberID", table_name="progress_entries")

    progress_columns = {c.get("name") for c in inspector.get_columns("progress_entries")}
    if "memberID" in progress_columns:
        op.drop_column("progress_entries", "memberID")

    op.alter_column(
        "progress_entries",
        "userID",
        existing_type=sa.Uuid(),
        nullable=False,
    )

    inspector = sa.inspect(bind)
    progress_fk_names = {fk.get("name") for fk in inspector.get_foreign_keys("progress_entries")}
    if "progress_entries_userID_fkey" not in progress_fk_names:
        op.create_foreign_key(
            "progress_entries_userID_fkey",
            "progress_entries",
            "users",
            ["userID"],
            ["id"],
            ondelete="CASCADE",
        )

    progress_index_names = {i.get("name") for i in inspector.get_indexes("progress_entries")}
    if "ix_progress_entries_userID" not in progress_index_names:
        op.create_index("ix_progress_entries_userID", "progress_entries", ["userID"], unique=False)
