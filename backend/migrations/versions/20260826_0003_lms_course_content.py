"""add lms course content

Revision ID: 20260826_0003
Revises: 20260826_0002
"""
from alembic import op
import sqlalchemy as sa

revision = "20260826_0003"
down_revision = "20260826_0002"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("courses", sa.Column("full_description", sa.Text(), nullable=False, server_default=""))
    op.add_column("courses", sa.Column("cover_url", sa.String(500), nullable=True))
    op.add_column("courses", sa.Column("endorsement", sa.String(180), nullable=False, server_default=""))
    op.add_column("courses", sa.Column("price", sa.Numeric(10, 2), nullable=False, server_default="0"))
    op.add_column("courses", sa.Column("discount_percent", sa.Integer(), nullable=False, server_default="0"))
    op.create_table("course_modules", sa.Column("id", sa.Uuid(), nullable=False), sa.Column("course_id", sa.Uuid(), nullable=False), sa.Column("title", sa.String(200), nullable=False), sa.Column("description", sa.Text(), nullable=False, server_default=""), sa.Column("position", sa.Integer(), nullable=False), sa.ForeignKeyConstraint(["course_id"], ["courses.id"], ondelete="CASCADE"), sa.PrimaryKeyConstraint("id"))
    op.create_index("ix_course_modules_course_id", "course_modules", ["course_id"])
    op.create_table("lessons", sa.Column("id", sa.Uuid(), nullable=False), sa.Column("module_id", sa.Uuid(), nullable=False), sa.Column("title", sa.String(200), nullable=False), sa.Column("lesson_type", sa.String(30), nullable=False), sa.Column("content", sa.Text(), nullable=False, server_default=""), sa.Column("media_url", sa.String(500), nullable=True), sa.Column("duration_minutes", sa.Integer(), nullable=False), sa.Column("is_preview", sa.Boolean(), nullable=False, server_default=sa.false()), sa.Column("position", sa.Integer(), nullable=False), sa.ForeignKeyConstraint(["module_id"], ["course_modules.id"], ondelete="CASCADE"), sa.PrimaryKeyConstraint("id"))
    op.create_index("ix_lessons_module_id", "lessons", ["module_id"])
    op.create_table("final_exams", sa.Column("id", sa.Uuid(), nullable=False), sa.Column("course_id", sa.Uuid(), nullable=False), sa.Column("title", sa.String(200), nullable=False), sa.Column("instructions", sa.Text(), nullable=False, server_default=""), sa.Column("time_limit_minutes", sa.Integer(), nullable=False), sa.Column("attempts_allowed", sa.Integer(), nullable=False), sa.Column("passing_score", sa.Integer(), nullable=False), sa.ForeignKeyConstraint(["course_id"], ["courses.id"], ondelete="CASCADE"), sa.PrimaryKeyConstraint("id"), sa.UniqueConstraint("course_id"))
    op.create_table("exam_questions", sa.Column("id", sa.Uuid(), nullable=False), sa.Column("exam_id", sa.Uuid(), nullable=False), sa.Column("prompt", sa.Text(), nullable=False), sa.Column("question_type", sa.String(30), nullable=False), sa.Column("options", sa.JSON(), nullable=False), sa.Column("correct_answers", sa.JSON(), nullable=False), sa.Column("points", sa.Integer(), nullable=False), sa.Column("position", sa.Integer(), nullable=False), sa.ForeignKeyConstraint(["exam_id"], ["final_exams.id"], ondelete="CASCADE"), sa.PrimaryKeyConstraint("id"))
    op.create_index("ix_exam_questions_exam_id", "exam_questions", ["exam_id"])


def downgrade():
    op.drop_table("exam_questions")
    op.drop_table("final_exams")
    op.drop_table("lessons")
    op.drop_table("course_modules")
    for column in ["discount_percent", "price", "endorsement", "cover_url", "full_description"]:
        op.drop_column("courses", column)
