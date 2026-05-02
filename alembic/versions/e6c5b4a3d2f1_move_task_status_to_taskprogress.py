"""move_task_status_to_taskprogress

Revision ID: e6c5b4a3d2f1
Revises: d4f6a7b8c9e0
Create Date: 2026-04-24 14:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "e6c5b4a3d2f1"
down_revision: Union[str, Sequence[str], None] = "d4f6a7b8c9e0"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


TASK_STATUS_ENUM = sa.Enum("TODO", "IN_PROGRESS", "DONE", name="task_status")


def upgrade() -> None:
    """Upgrade schema."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    TASK_STATUS_ENUM.create(bind, checkfirst=True)

    task_progress_columns = {c.get("name") for c in inspector.get_columns("task_progresses")}
    if "status" not in task_progress_columns:
        op.add_column(
            "task_progresses",
            sa.Column(
                "status",
                TASK_STATUS_ENUM,
                nullable=True,
            ),
        )

    inspector = sa.inspect(bind)
    task_columns = {c.get("name") for c in inspector.get_columns("tasks")}
    if "status" in task_columns:
        bind.execute(
            sa.text(
                'UPDATE task_progresses tp '
                'SET status = t.status '
                'FROM tasks t '
                'WHERE t.id = tp."taskID" '
                '  AND tp.status IS NULL'
            )
        )
    if "unit" not in task_columns:
        op.add_column("tasks", sa.Column("unit", sa.String(length=32), nullable=True))

    bind.execute(sa.text("UPDATE task_progresses SET status = 'TODO' WHERE status IS NULL"))

    op.alter_column(
        "task_progresses",
        "status",
        existing_type=TASK_STATUS_ENUM,
        nullable=False,
    )

    inspector = sa.inspect(bind)
    task_index_names = {i.get("name") for i in inspector.get_indexes("tasks")}
    if "ix_tasks_group_status" in task_index_names:
        op.drop_index("ix_tasks_group_status", table_name="tasks")

    task_columns = {c.get("name") for c in inspector.get_columns("tasks")}
    if "status" in task_columns:
        op.drop_column("tasks", "status")


def downgrade() -> None:
    """Downgrade schema."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    task_columns = {c.get("name") for c in inspector.get_columns("tasks")}
    if "status" not in task_columns:
        op.add_column(
            "tasks",
            sa.Column(
                "status",
                TASK_STATUS_ENUM,
                nullable=True,
            ),
        )
    if "unit" in task_columns:
        op.drop_column("tasks", "unit")

    bind.execute(
        sa.text(
            'UPDATE tasks t '
            'SET status = tp.status '
            'FROM task_progresses tp '
            'WHERE tp."taskID" = t.id '
            '  AND t.status IS NULL'
        )
    )

    bind.execute(sa.text("UPDATE tasks SET status = 'TODO' WHERE status IS NULL"))

    op.alter_column(
        "tasks",
        "status",
        existing_type=TASK_STATUS_ENUM,
        nullable=False,
    )

    inspector = sa.inspect(bind)
    task_index_names = {i.get("name") for i in inspector.get_indexes("tasks")}
    if "ix_tasks_group_status" not in task_index_names:
        op.create_index("ix_tasks_group_status", "tasks", ["groupID", "status"], unique=False)

    inspector = sa.inspect(bind)
    task_progress_columns = {c.get("name") for c in inspector.get_columns("task_progresses")}
    if "status" in task_progress_columns:
        op.drop_column("task_progresses", "status")
