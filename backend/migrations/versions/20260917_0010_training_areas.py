"""training areas

Revision ID: 20260917_0010
Revises: 20260829_0009
"""
from alembic import op
import sqlalchemy as sa
import uuid

revision = "20260917_0010"
down_revision = "20260829_0009"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "training_areas",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )
    default_id = uuid.UUID("00000000-0000-0000-0000-000000000001")
    op.execute(sa.text("INSERT INTO training_areas (id, name, created_at) VALUES (:id, :name, CURRENT_TIMESTAMP)").bindparams(sa.bindparam("id", value=default_id, type_=sa.Uuid()), name="Formación general"))
    op.add_column("courses", sa.Column("training_area_id", sa.Uuid(), nullable=True))
    op.execute(sa.text("UPDATE courses SET training_area_id = :id WHERE training_area_id IS NULL").bindparams(sa.bindparam("id", value=default_id, type_=sa.Uuid())))
    op.alter_column("courses", "training_area_id", nullable=False)
    op.create_index(op.f("ix_courses_training_area_id"), "courses", ["training_area_id"], unique=False)
    op.create_foreign_key("fk_courses_training_area_id_training_areas", "courses", "training_areas", ["training_area_id"], ["id"], ondelete="RESTRICT")


def downgrade():
    op.drop_constraint("fk_courses_training_area_id_training_areas", "courses", type_="foreignkey")
    op.drop_index(op.f("ix_courses_training_area_id"), table_name="courses")
    op.drop_column("courses", "training_area_id")
    op.drop_table("training_areas")
