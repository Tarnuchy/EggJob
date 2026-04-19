"""task_type_enum

Revision ID: e3a4b5c6d7e8
Revises: b7c2d4e1a9f0
Create Date: 2026-04-19 14:10:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "e3a4b5c6d7e8"
down_revision: Union[str, Sequence[str], None] = "b7c2d4e1a9f0"
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
        "tasks",
        "type",
        existing_type=sa.String(length=32),
        type_=task_type,
        postgresql_using='type::task_type',
        existing_nullable=False,
    )


def downgrade() -> None:
    """Downgrade schema."""
    task_type = sa.Enum(
        "endless",
        "one_time",
        "repeatable",
        "challenge",
        name="task_type",
    )

    op.alter_column(
        "tasks",
        "type",
        existing_type=task_type,
        type_=sa.String(length=32),
        postgresql_using='type::text',
        existing_nullable=False,
    )
