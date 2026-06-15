"""create device_tokens

Revision ID: a7b8c9d0e1f2
Revises: f0a1b2c3d4e5
Create Date: 2026-06-15 10:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "a7b8c9d0e1f2"
down_revision: Union[str, Sequence[str], None] = "f0a1b2c3d4e5"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if "device_tokens" not in inspector.get_table_names():
        op.create_table(
            "device_tokens",
            sa.Column("id", sa.Uuid(), nullable=False),
            sa.Column("userID", sa.Uuid(), nullable=False),
            sa.Column("token", sa.String(length=256), nullable=False),
            sa.Column("platform", sa.String(length=16), nullable=True),
            sa.Column("createdAt", sa.DateTime(), nullable=False),
            sa.ForeignKeyConstraint(["userID"], ["users.id"], ondelete="CASCADE"),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("token", name="uq_device_tokens_token"),
        )

    inspector = sa.inspect(bind)
    index_names = {i.get("name") for i in inspector.get_indexes("device_tokens")}
    if "ix_device_tokens_userID" not in index_names:
        op.create_index("ix_device_tokens_userID", "device_tokens", ["userID"], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if "device_tokens" in inspector.get_table_names():
        index_names = {i.get("name") for i in inspector.get_indexes("device_tokens")}
        if "ix_device_tokens_userID" in index_names:
            op.drop_index("ix_device_tokens_userID", table_name="device_tokens")
        op.drop_table("device_tokens")
