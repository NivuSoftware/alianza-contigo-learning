"""payment orders and student avatar

Revision ID: 20260826_0005
Revises: 20260826_0004
"""
from alembic import op
import sqlalchemy as sa

revision = "20260826_0005"
down_revision = "20260826_0004"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("users", sa.Column("avatar_key", sa.String(30), nullable=False, server_default="navy"))
    op.create_table("payment_orders", sa.Column("id", sa.Uuid(), nullable=False), sa.Column("reference", sa.String(40), nullable=False), sa.Column("course_id", sa.Uuid(), nullable=False), sa.Column("student_id", sa.Uuid(), nullable=False), sa.Column("payment_method", sa.String(20), nullable=False), sa.Column("amount", sa.Numeric(10, 2), nullable=False), sa.Column("status", sa.String(20), nullable=False), sa.Column("proof_url", sa.String(500), nullable=True), sa.Column("rejection_comment", sa.Text(), nullable=False, server_default=""), sa.Column("created_at", sa.DateTime(timezone=True), nullable=False), sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True), sa.ForeignKeyConstraint(["course_id"], ["courses.id"], ondelete="CASCADE"), sa.ForeignKeyConstraint(["student_id"], ["users.id"], ondelete="CASCADE"), sa.PrimaryKeyConstraint("id"), sa.UniqueConstraint("reference"))
    op.create_index("ix_payment_orders_reference", "payment_orders", ["reference"], unique=True)
    op.create_index("ix_payment_orders_course_id", "payment_orders", ["course_id"])
    op.create_index("ix_payment_orders_student_id", "payment_orders", ["student_id"])
    op.create_index("ix_payment_orders_status", "payment_orders", ["status"])


def downgrade():
    op.drop_table("payment_orders")
    op.drop_column("users", "avatar_key")
