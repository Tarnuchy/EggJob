"""empty message

Revision ID: ab1c241a5e5b
Revises: 585e793a6d66
Create Date: 2026-04-11 16:42:05.902005

"""
#to wgl python jest?XD
#co tu sie dzieje i kim jest mako
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from uuid import uuid4

# revision identifiers, used by Alembic.
revision: str = 'ab1c241a5e5b'
down_revision: Union[str, Sequence[str], None] = '585e793a6d66'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    # Friendships: id -> (userOneID, userTwoID)
    friendship_pk = inspector.get_pk_constraint("friendships")
    friendship_pk_name = friendship_pk.get("name")
    friendship_pk_cols = friendship_pk.get("constrained_columns") or []
    if friendship_pk_cols != ["userOneID", "userTwoID"]:
        if friendship_pk_name:
            op.drop_constraint(friendship_pk_name, "friendships", type_="primary")

        friendship_unique_names = {u.get("name") for u in inspector.get_unique_constraints("friendships")}
        if "uq_friendship_pair" in friendship_unique_names:
            op.drop_constraint("uq_friendship_pair", "friendships", type_="unique")

        friendship_index_names = {i.get("name") for i in inspector.get_indexes("friendships")}
        if "ix_friendships_user_pair" in friendship_index_names:
            op.drop_index("ix_friendships_user_pair", table_name="friendships")

        friendship_column_names = {c.get("name") for c in inspector.get_columns("friendships")}
        if "id" in friendship_column_names:
            op.drop_column("friendships", "id")

        op.create_primary_key("friendships_pkey", "friendships", ["userOneID", "userTwoID"])

    # Invitations: id -> (fromUserID, toUserID) + remove date indexes
    inspector = sa.inspect(bind)
    invitation_pk = inspector.get_pk_constraint("invitations")
    invitation_pk_name = invitation_pk.get("name")
    invitation_pk_cols = invitation_pk.get("constrained_columns") or []

    invitation_index_names = {i.get("name") for i in inspector.get_indexes("invitations")}
    if "ix_invitations_from_date" in invitation_index_names:
        op.drop_index("ix_invitations_from_date", table_name="invitations")
    if "ix_invitations_to_date" in invitation_index_names:
        op.drop_index("ix_invitations_to_date", table_name="invitations")

    if invitation_pk_cols != ["fromUserID", "toUserID"]:
        if invitation_pk_name:
            op.drop_constraint(invitation_pk_name, "invitations", type_="primary")

        invitation_unique_names = {u.get("name") for u in inspector.get_unique_constraints("invitations")}
        if "uq_invitation_pair" in invitation_unique_names:
            op.drop_constraint("uq_invitation_pair", "invitations", type_="unique")

        invitation_column_names = {c.get("name") for c in inspector.get_columns("invitations")}
        if "id" in invitation_column_names:
            op.drop_column("invitations", "id")

        op.create_primary_key("invitations_pkey", "invitations", ["fromUserID", "toUserID"])


def downgrade() -> None:
    """Downgrade schema."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    # Invitations: (fromUserID, toUserID) -> id + restore pair unique and two date indexes
    invitation_pk = inspector.get_pk_constraint("invitations")
    invitation_pk_name = invitation_pk.get("name")
    invitation_pk_cols = invitation_pk.get("constrained_columns") or []
    invitation_columns = {c.get("name") for c in inspector.get_columns("invitations")}

    if invitation_pk_cols == ["fromUserID", "toUserID"]:
        if invitation_pk_name:
            op.drop_constraint(invitation_pk_name, "invitations", type_="primary")

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

    op.create_primary_key("invitations_pkey", "invitations", ["id"])

    inspector = sa.inspect(bind)
    invitation_unique_names = {u.get("name") for u in inspector.get_unique_constraints("invitations")}
    if "uq_invitation_pair" not in invitation_unique_names:
        op.create_unique_constraint("uq_invitation_pair", "invitations", ["fromUserID", "toUserID"])

    invitation_index_names = {i.get("name") for i in inspector.get_indexes("invitations")}
    if "ix_invitations_from_date" not in invitation_index_names:
        op.create_index("ix_invitations_from_date", "invitations", ["fromUserID", "date"], unique=False)
    if "ix_invitations_to_date" not in invitation_index_names:
        op.create_index("ix_invitations_to_date", "invitations", ["toUserID", "date"], unique=False)

    # Friendships: (userOneID, userTwoID) -> id + restore pair unique/index
    inspector = sa.inspect(bind)
    friendship_pk = inspector.get_pk_constraint("friendships")
    friendship_pk_name = friendship_pk.get("name")
    friendship_pk_cols = friendship_pk.get("constrained_columns") or []
    friendship_columns = {c.get("name") for c in inspector.get_columns("friendships")}

    if friendship_pk_cols == ["userOneID", "userTwoID"]:
        if friendship_pk_name:
            op.drop_constraint(friendship_pk_name, "friendships", type_="primary")

    if "id" not in friendship_columns:
        op.add_column("friendships", sa.Column("id", sa.Uuid(), nullable=True))

        friendship_rows = bind.execute(
            sa.text('SELECT "userOneID", "userTwoID" FROM friendships')
        ).fetchall()
        for user_one_id, user_two_id in friendship_rows:
            bind.execute(
                sa.text(
                    'UPDATE friendships '
                    'SET id = :id '
                    'WHERE "userOneID" = :user_one_id AND "userTwoID" = :user_two_id'
                ),
                {
                    "id": uuid4(),
                    "user_one_id": user_one_id,
                    "user_two_id": user_two_id,
                },
            )

        op.alter_column("friendships", "id", existing_type=sa.Uuid(), nullable=False)

    op.create_primary_key("friendships_pkey", "friendships", ["id"])

    inspector = sa.inspect(bind)
    friendship_unique_names = {u.get("name") for u in inspector.get_unique_constraints("friendships")}
    if "uq_friendship_pair" not in friendship_unique_names:
        op.create_unique_constraint("uq_friendship_pair", "friendships", ["userOneID", "userTwoID"])

    friendship_index_names = {i.get("name") for i in inspector.get_indexes("friendships")}
    if "ix_friendships_user_pair" not in friendship_index_names:
        op.create_index("ix_friendships_user_pair", "friendships", ["userOneID", "userTwoID"], unique=False)