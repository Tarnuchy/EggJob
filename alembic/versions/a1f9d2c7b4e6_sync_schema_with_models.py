"""sync_schema_with_models

Revision ID: a1f9d2c7b4e6
Revises: e3a4b5c6d7e8
Create Date: 2026-04-19 14:45:00.000000

"""

from typing import Sequence, Union
from uuid import uuid4

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "a1f9d2c7b4e6"
down_revision: Union[str, Sequence[str], None] = "e3a4b5c6d7e8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _get_udt_name(bind: sa.Connection, table: str, column: str) -> str | None:
    return bind.execute(
        sa.text(
            """
            SELECT udt_name
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = :table_name
              AND column_name = :column_name
            """
        ),
        {
            "table_name": table,
            "column_name": column,
        },
    ).scalar_one_or_none()


def upgrade() -> None:
    """Upgrade schema."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    # Match model: TaskProgress.type is String(32), not enum.
    task_progress_type_udt = _get_udt_name(bind, "task_progresses", "type")
    if task_progress_type_udt == "task_type":
        op.alter_column(
            "task_progresses",
            "type",
            existing_type=sa.Enum(
                "endless",
                "one_time",
                "repeatable",
                "challenge",
                name="task_type",
            ),
            type_=sa.String(length=32),
            postgresql_using='type::text',
            existing_nullable=False,
        )

    # Match model: Invitation uses composite PK (fromUserID, toUserID) and no id column.
    invitation_index_names = {i.get("name") for i in inspector.get_indexes("invitations")}
    if "ix_invitations_from_date" in invitation_index_names:
        op.drop_index("ix_invitations_from_date", table_name="invitations")
    if "ix_invitations_to_date" in invitation_index_names:
        op.drop_index("ix_invitations_to_date", table_name="invitations")

    invitation_unique_names = {u.get("name") for u in inspector.get_unique_constraints("invitations")}
    if "uq_invitation_pair" in invitation_unique_names:
        op.drop_constraint("uq_invitation_pair", "invitations", type_="unique")

    inspector = sa.inspect(bind)
    invitation_pk = inspector.get_pk_constraint("invitations")
    invitation_pk_name = invitation_pk.get("name")
    invitation_pk_cols = invitation_pk.get("constrained_columns") or []

    if invitation_pk_cols != ["fromUserID", "toUserID"]:
        if invitation_pk_name:
            op.drop_constraint(invitation_pk_name, "invitations", type_="primary")
        op.create_primary_key("invitations_pkey", "invitations", ["fromUserID", "toUserID"])

    invitation_columns = {c.get("name") for c in inspector.get_columns("invitations")}
    if "id" in invitation_columns:
        op.drop_column("invitations", "id")


def downgrade() -> None:
    """Downgrade schema."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    # Restore previous DB shape: Invitation.id PK + pair unique + pair/date indexes.
    invitation_pk = inspector.get_pk_constraint("invitations")
    invitation_pk_name = invitation_pk.get("name")
    invitation_pk_cols = invitation_pk.get("constrained_columns") or []

    if invitation_pk_cols == ["fromUserID", "toUserID"] and invitation_pk_name:
        op.drop_constraint(invitation_pk_name, "invitations", type_="primary")

    invitation_columns = {c.get("name") for c in inspector.get_columns("invitations")}
    if "id" not in invitation_columns:
        op.add_column("invitations", sa.Column("id", sa.Uuid(), nullable=True))

        invitation_rows = bind.execute(
            sa.text('SELECT "fromUserID", "toUserID" FROM invitations')
        ).fetchall()
        for from_user_id, to_user_id in invitation_rows:
            bind.execute(
                sa.text(
                    'UPDATE invitations '
                    'SET id = :id '
                    'WHERE "fromUserID" = :from_user_id AND "toUserID" = :to_user_id'
                ),
                {
                    "id": uuid4(),
                    "from_user_id": from_user_id,
                    "to_user_id": to_user_id,
                },
            )

    op.alter_column("invitations", "id", existing_type=sa.Uuid(), nullable=False)

    inspector = sa.inspect(bind)
    invitation_pk = inspector.get_pk_constraint("invitations")
    invitation_pk_cols = invitation_pk.get("constrained_columns") or []
    if invitation_pk_cols != ["id"]:
        op.create_primary_key("invitations_pkey", "invitations", ["id"])

    invitation_unique_names = {u.get("name") for u in inspector.get_unique_constraints("invitations")}
    if "uq_invitation_pair" not in invitation_unique_names:
        op.create_unique_constraint("uq_invitation_pair", "invitations", ["fromUserID", "toUserID"])

    invitation_index_names = {i.get("name") for i in inspector.get_indexes("invitations")}
    if "ix_invitations_from_date" not in invitation_index_names:
        op.create_index("ix_invitations_from_date", "invitations", ["fromUserID", "date"], unique=False)
    if "ix_invitations_to_date" not in invitation_index_names:
        op.create_index("ix_invitations_to_date", "invitations", ["toUserID", "date"], unique=False)

    # Restore previous DB shape: TaskProgress.type enum task_type.
    task_progress_type_udt = _get_udt_name(bind, "task_progresses", "type")
    if task_progress_type_udt in {"varchar", "text", "bpchar"}:
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
