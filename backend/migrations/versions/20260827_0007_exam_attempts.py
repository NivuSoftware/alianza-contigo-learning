"""final exam attempts and course completion

Revision ID: 20260827_0007
Revises: 20260827_0006
"""
from alembic import op
import sqlalchemy as sa

revision = "20260827_0007"
down_revision = "20260827_0006"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("enrollments", sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True))
    op.create_table(
        "exam_attempts",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("enrollment_id", sa.Uuid(), nullable=False),
        sa.Column("attempt_number", sa.Integer(), nullable=False),
        sa.Column("answers", sa.JSON(), nullable=False),
        sa.Column("questions_snapshot", sa.JSON(), nullable=False),
        sa.Column("score", sa.Numeric(5, 2), nullable=False),
        sa.Column("passed", sa.Boolean(), nullable=False),
        sa.Column("status", sa.String(30), nullable=False),
        sa.Column("feedback", sa.Text(), nullable=False, server_default=""),
        sa.Column("submitted_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("reviewed_by_id", sa.Uuid(), nullable=True),
        sa.ForeignKeyConstraint(["enrollment_id"], ["enrollments.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["reviewed_by_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("enrollment_id", "attempt_number", name="uq_exam_attempt_enrollment_number"),
    )
    op.create_index("ix_exam_attempts_enrollment_id", "exam_attempts", ["enrollment_id"])
    op.create_index("ix_exam_attempts_status", "exam_attempts", ["status"])


def downgrade():
    op.drop_table("exam_attempts")
    op.drop_column("enrollments", "completed_at")
