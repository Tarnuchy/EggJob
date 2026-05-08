"""task_progress_type_enum

Revision ID: b7c2d4e1a9f0
Revises: 9d2a1f4e7c11
Create Date: 2026-04-19 13:05:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "b7c2d4e1a9f0"
down_revision: Union[str, Sequence[str], None] = "9d2a1f4e7c11"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    bind = op.get_bind()

    task_type = sa.Enum(
        "endless",
        "one_time",
        "repeatable",
        "challenge",
        name="task_type",
    )
    task_type.create(bind, checkfirst=True)

    op.alter_column(
        "task_progresses",
        "type",
        existing_type=sa.String(length=32),
        type_=task_type,
        postgresql_using='type::task_type',
        existing_nullable=False,
    )


def downgrade() -> None:
    """Downgrade schema."""
    bind = op.get_bind()

    task_type = sa.Enum(
        "endless",
        "one_time",
        "repeatable",
        "challenge",
        name="task_type",
    )

    op.alter_column(
        "task_progresses",
        "type",
        existing_type=task_type,
        type_=sa.String(length=32),
        postgresql_using='type::text',
        existing_nullable=False,
    )

    task_type.drop(bind, checkfirst=True)
