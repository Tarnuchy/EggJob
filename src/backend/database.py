import os
from collections.abc import Generator, Iterator
from contextlib import contextmanager
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, declarative_base, sessionmaker

# Prefer local .env if present; fall back to process environment variables.
ENV_PATH = Path(__file__).resolve().parents[2] / ".env"
if ENV_PATH.exists():
    load_dotenv(dotenv_path=ENV_PATH)
else:
    load_dotenv()

DEFAULT_DATABASE_URL = "postgresql+psycopg://postgres:postgres@localhost:5432/todo"
DEFAULT_TEST_DATABASE_URL = "postgresql+psycopg://postgres:postgres@localhost:5432/todo_test"


def _normalize_database_url(url: str) -> str:
    """Provider-y (Railway/Render/Heroku) podają DATABASE_URL jako
    postgres:// albo postgresql://, co SQLAlchemy mapuje na psycopg2
    (niezainstalowany). Wymuszamy sterownik psycopg (v3)."""
    if url.startswith("postgres://"):
        url = "postgresql://" + url[len("postgres://"):]
    if url.startswith("postgresql://"):
        url = "postgresql+psycopg://" + url[len("postgresql://"):]
    return url


def get_database_url() -> str:
    return _normalize_database_url(os.getenv("DATABASE_URL", DEFAULT_DATABASE_URL))


def get_test_database_url() -> str:
    return _normalize_database_url(os.getenv("TEST_DATABASE_URL", DEFAULT_TEST_DATABASE_URL))


def build_engine(database_url: str | None = None) -> Engine:
    url = _normalize_database_url(database_url) if database_url else get_database_url()
    return create_engine(url, pool_pre_ping=True)


engine = build_engine()
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@contextmanager
def transaction(db: Session) -> Iterator[None]:
    """Commit on success, rollback on any error. Re-raises so handlers map it."""
    try:
        yield
        db.commit()
    except Exception:
        db.rollback()
        raise
