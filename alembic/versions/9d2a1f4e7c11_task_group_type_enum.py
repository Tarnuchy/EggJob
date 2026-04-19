"""task_group_type_enum

Revision ID: 9d2a1f4e7c11
Revises: f1a3c0d9b2e4
Create Date: 2026-04-19 12:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "9d2a1f4e7c11"
down_revision: Union[str, Sequence[str], None] = "f1a3c0d9b2e4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    bind = op.get_bind()

    task_group_type = sa.Enum(
        "task_group",
        "competitive",
        "cooperative",
        name="task_group_type",
    )
    task_group_type.create(bind, checkfirst=True)

    op.alter_column(
        "task_groups",
        "type",
        existing_type=sa.String(length=32),
        type_=task_group_type,
        postgresql_using='type::task_group_type',
        existing_nullable=False,
    )

    op.create_unique_constraint(
        "uq_task_groups_invite_code",
        "task_groups",
        ["inviteCode"],
    )


def downgrade() -> None:
    """Downgrade schema."""
    bind = op.get_bind()

    task_group_type = sa.Enum(
        "task_group",
        "competitive",
        "cooperative",
        name="task_group_type",
    )

    op.drop_constraint(
        "uq_task_groups_invite_code",
        "task_groups",
        type_="unique",
    )

    op.alter_column(
        "task_groups",
        "type",
        existing_type=task_group_type,
        type_=sa.String(length=32),
        postgresql_using='type::text',
        existing_nullable=False,
    )

    task_group_type.drop(bind, checkfirst=True)
