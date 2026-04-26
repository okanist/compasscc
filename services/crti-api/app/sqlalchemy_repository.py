import os
from collections.abc import Iterator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from .domain.models import Base


DEFAULT_DATABASE_URL = "sqlite:///./compass_dev.db"


def get_database_url() -> str:
    return os.getenv("DATABASE_URL", DEFAULT_DATABASE_URL)


engine = create_engine(get_database_url(), future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)


def create_schema() -> None:
    Base.metadata.create_all(bind=engine)


def session_scope() -> Iterator[Session]:
    session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


class SQLAlchemyCompassRepository:
    """PostgreSQL-ready repository scaffold.

    The seed-backed CompassRepository remains the default demo repository. This
    class is the persistence boundary for a future DATABASE_URL-backed runtime.

    TODO: implement DTO mapping and upserts for:
    institutions, campaigns, contribution_submissions, processing_runs,
    benchmark_snapshots, institution_outputs, attestation_references, audit_records.
    TODO: add transaction-level idempotency keys for command handlers.
    TODO: synchronize rows from Canton ledger events with checkpoint tracking.
    """

    def __init__(self, session: Session) -> None:
        self.session = session
