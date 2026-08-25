"""create courses table

Revision ID: 20260825_0001
Revises:
"""
from alembic import op
import sqlalchemy as sa

revision = "20260825_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "courses",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("slug", sa.String(length=160), nullable=False),
        sa.Column("name", sa.String(length=180), nullable=False),
        sa.Column("short_description", sa.Text(), nullable=False),
        sa.Column("modality", sa.String(length=120), nullable=False),
        sa.Column("duration", sa.String(length=80), nullable=False),
        sa.Column("certification", sa.String(length=180), nullable=False),
        sa.Column("status", sa.String(length=30), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug"),
    )
    op.create_index(op.f("ix_courses_slug"), "courses", ["slug"], unique=True)


def downgrade():
    op.drop_index(op.f("ix_courses_slug"), table_name="courses")
    op.drop_table("courses")
