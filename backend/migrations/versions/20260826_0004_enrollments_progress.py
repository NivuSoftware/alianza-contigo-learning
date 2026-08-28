"""enrollments and progress

Revision ID: 20260826_0004
Revises: 20260826_0003
"""
from alembic import op
import sqlalchemy as sa

revision = "20260826_0004"
down_revision = "20260826_0003"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table("enrollments", sa.Column("id", sa.Uuid(), nullable=False), sa.Column("course_id", sa.Uuid(), nullable=False), sa.Column("student_id", sa.Uuid(), nullable=False), sa.Column("progress_percent", sa.Integer(), nullable=False, server_default="0"), sa.Column("exam_submitted_at", sa.DateTime(timezone=True), nullable=True), sa.Column("exam_score", sa.Numeric(5, 2), nullable=True), sa.Column("teacher_feedback", sa.Text(), nullable=False, server_default=""), sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True), sa.Column("enrolled_at", sa.DateTime(timezone=True), nullable=False), sa.ForeignKeyConstraint(["course_id"], ["courses.id"], ondelete="CASCADE"), sa.ForeignKeyConstraint(["student_id"], ["users.id"], ondelete="CASCADE"), sa.PrimaryKeyConstraint("id"), sa.UniqueConstraint("course_id", "student_id", name="uq_enrollment_course_student"))
    op.create_index("ix_enrollments_course_id", "enrollments", ["course_id"])
    op.create_index("ix_enrollments_student_id", "enrollments", ["student_id"])


def downgrade():
    op.drop_table("enrollments")
