"""taskparams_taskid_primary_key

Revision ID: f1a3c0d9b2e4
Revises: c4e9e2b77a11
Create Date: 2026-04-11 21:40:00.000000

"""
from typing import Sequence, Union
from uuid import uuid4

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "f1a3c0d9b2e4"
down_revision: Union[str, Sequence[str], None] = "c4e9e2b77a11"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    comments_index_names = {i.get("name") for i in inspector.get_indexes("comments")}
    if "ix_comments_progress_date" in comments_index_names:
        op.drop_index("ix_comments_progress_date", table_name="comments")
    if "ix_comments_user_date" in comments_index_names:
        op.drop_index("ix_comments_user_date", table_name="comments")

    progress_entries_index_names = {i.get("name") for i in inspector.get_indexes("progress_entries")}
    if "ix_progress_entries_progress_created" in progress_entries_index_names:
        op.drop_index("ix_progress_entries_progress_created", table_name="progress_entries")
    if "ix_progress_entries_user_created" in progress_entries_index_names:
        op.drop_index("ix_progress_entries_user_created", table_name="progress_entries")

    task_params_index_names = {i.get("name") for i in inspector.get_indexes("task_params")}
    if "ix_task_params_taskID" in task_params_index_names:
        op.drop_index("ix_task_params_taskID", table_name="task_params")

    inspector = sa.inspect(bind)
    task_params_pk = inspector.get_pk_constraint("task_params")
    task_params_pk_name = task_params_pk.get("name")
    task_params_pk_cols = task_params_pk.get("constrained_columns") or []

    if task_params_pk_cols != ["taskID"]:
        if task_params_pk_name:
            op.drop_constraint(task_params_pk_name, "task_params", type_="primary")

        task_params_columns = {c.get("name") for c in inspector.get_columns("task_params")}
        if "id" in task_params_columns:
            op.drop_column("task_params", "id")

        op.create_primary_key("task_params_pkey", "task_params", ["taskID"])


def downgrade() -> None:
    """Downgrade schema."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    comments_index_names = {i.get("name") for i in inspector.get_indexes("comments")}
    if "ix_comments_progress_date" not in comments_index_names:
        op.create_index(
            "ix_comments_progress_date",
            "comments",
            ["progressEntryID", "date"],
            unique=False,
        )
    if "ix_comments_user_date" not in comments_index_names:
        op.create_index(
            "ix_comments_user_date",
            "comments",
            ["userID", "date"],
            unique=False,
        )

    progress_entries_index_names = {i.get("name") for i in inspector.get_indexes("progress_entries")}
    if "ix_progress_entries_progress_created" not in progress_entries_index_names:
        op.create_index(
            "ix_progress_entries_progress_created",
            "progress_entries",
            ["TaskProgressID", "createdAt"],
            unique=False,
        )
    if "ix_progress_entries_user_created" not in progress_entries_index_names:
        op.create_index(
            "ix_progress_entries_user_created",
            "progress_entries",
            ["userID", "createdAt"],
            unique=False,
        )

    task_params_pk = inspector.get_pk_constraint("task_params")
    task_params_pk_name = task_params_pk.get("name")
    task_params_pk_cols = task_params_pk.get("constrained_columns") or []
    task_params_columns = {c.get("name") for c in inspector.get_columns("task_params")}

    if task_params_pk_cols == ["taskID"] and task_params_pk_name:
        op.drop_constraint(task_params_pk_name, "task_params", type_="primary")

    if "id" not in task_params_columns:
        op.add_column("task_params", sa.Column("id", sa.Uuid(), nullable=True))

        task_params_rows = bind.execute(sa.text('SELECT "taskID" FROM task_params')).fetchall()
        for task_id, in task_params_rows:
            bind.execute(
                sa.text('UPDATE task_params SET id = :id WHERE "taskID" = :task_id'),
                {
                    "id": uuid4(),
                    "task_id": task_id,
                },
            )

        op.alter_column("task_params", "id", existing_type=sa.Uuid(), nullable=False)

    inspector = sa.inspect(bind)
    task_params_pk = inspector.get_pk_constraint("task_params")
    task_params_pk_name = task_params_pk.get("name")
    task_params_pk_cols = task_params_pk.get("constrained_columns") or []

    if task_params_pk_cols != ["id"]:
        if task_params_pk_name:
            op.drop_constraint(task_params_pk_name, "task_params", type_="primary")
        op.create_primary_key("task_params_pkey", "task_params", ["id"])

    task_params_index_names = {i.get("name") for i in inspector.get_indexes("task_params")}
    if "ix_task_params_taskID" not in task_params_index_names:
        op.create_index("ix_task_params_taskID", "task_params", ["taskID"], unique=True)
