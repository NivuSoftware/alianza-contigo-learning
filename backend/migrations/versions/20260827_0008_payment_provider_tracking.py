"""payment provider tracking and reconciliation fields

Revision ID: 20260827_0008
Revises: 20260827_0007
"""

from alembic import op
import sqlalchemy as sa


revision = "20260827_0008"
down_revision = "20260827_0007"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "payment_orders",
        sa.Column("provider", sa.String(length=30), nullable=False, server_default="MANUAL"),
    )
    op.add_column(
        "payment_orders", sa.Column("provider_transaction_id", sa.String(length=100), nullable=True)
    )
    op.add_column(
        "payment_orders",
        sa.Column("currency", sa.String(length=3), nullable=False, server_default="USD"),
    )
    op.add_column(
        "payment_orders", sa.Column("paid_at", sa.DateTime(timezone=True), nullable=True)
    )
    op.execute(
        "UPDATE payment_orders SET provider = CASE "
        "WHEN payment_method = 'TRANSFER' THEN 'BANK_TRANSFER' "
        "WHEN payment_method = 'CARD' THEN 'SIMULATED' ELSE 'MANUAL' END"
    )
    op.execute("UPDATE payment_orders SET paid_at = reviewed_at WHERE status = 'APPROVED'")
    op.create_unique_constraint(
        "uq_payment_provider_transaction",
        "payment_orders",
        ["provider", "provider_transaction_id"],
    )


def downgrade():
    op.drop_constraint("uq_payment_provider_transaction", "payment_orders", type_="unique")
    op.drop_column("payment_orders", "paid_at")
    op.drop_column("payment_orders", "currency")
    op.drop_column("payment_orders", "provider_transaction_id")
    op.drop_column("payment_orders", "provider")
