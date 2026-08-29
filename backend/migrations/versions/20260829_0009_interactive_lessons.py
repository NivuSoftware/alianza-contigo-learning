"""interactive lessons

Revision ID: 20260829_0009
Revises: 20260827_0008
"""
from alembic import op
import sqlalchemy as sa

revision = "20260829_0009"
down_revision = "20260827_0008"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("lessons", sa.Column("interaction_data", sa.JSON(), nullable=True))


def downgrade():
    op.drop_column("lessons", "interaction_data")
