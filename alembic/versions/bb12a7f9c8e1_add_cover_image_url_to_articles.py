"""add cover image url to articles

Revision ID: bb12a7f9c8e1
Revises: ee99c4bb56f8
Create Date: 2026-06-12
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "bb12a7f9c8e1"
down_revision: Union[str, Sequence[str], None] = "ee99c4bb56f8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "articles",
        sa.Column(
            "cover_image_url",
            sa.String(length=500),
            nullable=True,
        ),
    )


def downgrade() -> None:
    op.drop_column(
        "articles",
        "cover_image_url",
    )