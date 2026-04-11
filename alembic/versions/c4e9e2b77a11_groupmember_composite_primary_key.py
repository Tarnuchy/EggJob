"""groupmember_composite_primary_key

Revision ID: c4e9e2b77a11
Revises: ab1c241a5e5b
Create Date: 2026-04-11 21:10:00.000000

"""
from typing import Sequence, Union
from uuid import uuid4

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "c4e9e2b77a11"
down_revision: Union[str, Sequence[str], None] = "ab1c241a5e5b"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    group_member_pk = inspector.get_pk_constraint("group_members")
    group_member_pk_name = group_member_pk.get("name")
    group_member_pk_cols = group_member_pk.get("constrained_columns") or []

    if group_member_pk_cols != ["userID", "groupID"]:
        if group_member_pk_name:
            op.drop_constraint(group_member_pk_name, "group_members", type_="primary")

        group_member_unique_names = {u.get("name") for u in inspector.get_unique_constraints("group_members")}
        if "uq_group_member_user_group" in group_member_unique_names:
            op.drop_constraint("uq_group_member_user_group", "group_members", type_="unique")

        group_member_column_names = {c.get("name") for c in inspector.get_columns("group_members")}
        if "id" in group_member_column_names:
            op.drop_column("group_members", "id")

        op.create_primary_key("group_members_pkey", "group_members", ["userID", "groupID"])


def downgrade() -> None:
    """Downgrade schema."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    group_member_pk = inspector.get_pk_constraint("group_members")
    group_member_pk_name = group_member_pk.get("name")
    group_member_pk_cols = group_member_pk.get("constrained_columns") or []
    group_member_columns = {c.get("name") for c in inspector.get_columns("group_members")}

    if group_member_pk_cols == ["userID", "groupID"] and group_member_pk_name:
        op.drop_constraint(group_member_pk_name, "group_members", type_="primary")

    if "id" not in group_member_columns:
        op.add_column("group_members", sa.Column("id", sa.Uuid(), nullable=True))

        group_member_rows = bind.execute(
            sa.text('SELECT "userID", "groupID" FROM group_members')
        ).fetchall()

        for user_id, group_id in group_member_rows:
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
