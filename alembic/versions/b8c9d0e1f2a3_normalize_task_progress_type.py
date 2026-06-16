"""normalize task_progresses.type to lowercase

Naprawia uszkodzone dane: wiersze z dyskryminatorem typu wielkimi literami
("ENDLESS", "ONE_TIME", ...) zapisane przez wcześniejszą wersję kodu. Identyfikatory
polimorficzne podklas TaskProgress to małe wartości (endless, one_time, ...),
więc wielkie litery powodują "No such polymorphic_identity" przy odczycie.

Revision ID: b8c9d0e1f2a3
Revises: a7b8c9d0e1f2
Create Date: 2026-06-16 12:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "b8c9d0e1f2a3"
down_revision: Union[str, Sequence[str], None] = "a7b8c9d0e1f2"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute(
        sa.text("UPDATE task_progresses SET type = lower(type) WHERE type <> lower(type)")
    )


def downgrade() -> None:
    """Downgrade schema."""
    # Normalizacja jest nieodwracalna (nie odtwarzamy wielkich liter).
    pass
