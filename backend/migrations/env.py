from alembic import context
from flask import current_app

config = context.config

target_db = current_app.extensions["migrate"].db
target_metadata = target_db.metadata


def run_migrations_offline():
    context.configure(url=str(target_db.engine.url), target_metadata=target_metadata, literal_binds=True)
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    with target_db.engine.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


run_migrations_offline() if context.is_offline_mode() else run_migrations_online()
