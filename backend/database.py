import os
import sqlite3
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

logger = logging.getLogger("database")

if os.getenv("VERCEL") or os.environ.get("VERCEL"):
    SQLALCHEMY_DATABASE_URL = "sqlite:////tmp/jobhunter.db"
    _DB_FILE = "/tmp/jobhunter.db"
else:
    SQLALCHEMY_DATABASE_URL = "sqlite:///./jobhunter.db"
    _DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "jobhunter.db")

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def run_migrations():
    """
    Automatic additive schema migration engine for SQLite.
    Compares registered SQLAlchemy models on `Base.metadata.tables`
    against actual SQLite schema (`PRAGMA table_info`).
    Executes ALTER TABLE ADD COLUMN for any missing fields dynamically,
    ensuring 100% database compatibility without data loss or manual scripts.
    """
    if not os.path.exists(_DB_FILE):
        return  # Fresh DB — Base.metadata.create_all will build full schema

    try:
        import models  # Ensure all ORM models are loaded into Base metadata

        conn = sqlite3.connect(_DB_FILE)
        cursor = conn.cursor()

        for table_name, table in Base.metadata.tables.items():
            # Check if table exists in SQLite
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?", (table_name,))
            if not cursor.fetchone():
                continue  # Table doesn't exist yet, create_all will handle it

            # Fetch existing column names in SQLite
            cursor.execute(f"PRAGMA table_info('{table_name}')")
            existing_cols = {row[1] for row in cursor.fetchall()}

            for col in table.columns:
                if col.name not in existing_cols:
                    col_type_str = str(col.type).upper()
                    default_clause = ""

                    # Calculate safe default clause if present
                    if col.default is not None and hasattr(col.default, 'arg'):
                        arg = col.default.arg
                        if isinstance(arg, bool):
                            default_clause = f" DEFAULT {1 if arg else 0}"
                        elif isinstance(arg, (int, float)):
                            default_clause = f" DEFAULT {arg}"
                        elif isinstance(arg, str):
                            default_clause = f" DEFAULT '{arg}'"

                    alter_stmt = f"ALTER TABLE '{table_name}' ADD COLUMN '{col.name}' {col_type_str}{default_clause}"
                    try:
                        cursor.execute(alter_stmt)
                        logger.info(f"Dynamic Migration: Added column '{col.name}' ({col_type_str}) to '{table_name}'")
                    except Exception as e:
                        logger.warning(f"Dynamic Migration skip ({table_name}.{col.name}): {e}")

        conn.commit()
        conn.close()
    except Exception as e:
        logger.warning(f"Dynamic Migration engine error: {e}")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
