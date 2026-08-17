import logging
from mongo_db import mongo_handler

logger = logging.getLogger("database")

def run_migrations():
    """
    No-op stub. SQLite database has been completely removed in favor of MongoDB Atlas.
    MongoDB Atlas collections are schema-less and automatically managed by mongo_handler.
    """
    logger.info("Database Architecture: 100% MongoDB Atlas Cloud. SQLite disabled.")

def get_db():
    """
    Pass-through dependency stub for FastAPI routes using MongoDB Atlas.
    """
    yield None
