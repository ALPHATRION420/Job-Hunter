import os
import logging
from datetime import datetime
from typing import Dict, List, Optional, Any
from dotenv import load_dotenv
from pymongo import MongoClient, ASCENDING, DESCENDING
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

# Load environment variables from .env file
load_dotenv()
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

logger = logging.getLogger("mongo_db")

MONGODB_URI = os.getenv("MONGODB_URI") or os.getenv("MONGO_URI") or "mongodb://localhost:27017"
DB_NAME = os.getenv("MONGODB_DB_NAME", "jobhunter")

class MongoDBHandler:
    def __init__(self):
        self.client: Optional[MongoClient] = None
        self.db = None
        self._connected = False
        self.uri = MONGODB_URI
        self.connect()

    def connect(self, custom_uri: Optional[str] = None):
        target_uri = custom_uri or self.uri or os.getenv("MONGODB_URI") or os.getenv("MONGO_URI") or "mongodb://localhost:27017"
        self.uri = target_uri
        try:
            # Handle Atlas mongodb+srv URIs and standard mongodb URIs
            self.client = MongoClient(target_uri, serverSelectionTimeoutMS=5000)
            # Trigger server info or admin command to verify connection
            self.client.admin.command('ping')
            
            # Determine database name from URI if provided, or default to jobhunter
            db_name = DB_NAME
            if "mongodb.net/" in target_uri:
                parts = target_uri.split("mongodb.net/")[1].split("?")[0]
                if parts and len(parts) > 0:
                    db_name = parts

            self.db = self.client[db_name]
            self._connected = True
            is_atlas = "mongodb.net" in target_uri or "mongodb+srv" in target_uri
            mode_str = "MongoDB Atlas Cloud" if is_atlas else "Local MongoDB"
            logger.info(f"Successfully connected to {mode_str} database '{db_name}'")
        except (ConnectionFailure, ServerSelectionTimeoutError, Exception) as e:
            self._connected = False
            self.db = None
            logger.warning(f"MongoDB connection to {target_uri[:30]}... failed: {e}")

    def is_connected(self) -> bool:
        if not self._connected or self.client is None:
            # Try reconnecting
            try:
                self.client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=1000)
                self.client.server_info()
                self.db = self.client[DB_NAME]
                self._connected = True
            except Exception:
                self._connected = False
        return self._connected

    def _ensure_indexes(self):
        if not self.is_connected() or self.db is None:
            return
        try:
            self.db.users.create_index([("email", ASCENDING)], unique=True)
            self.db.user_profiles.create_index([("email", ASCENDING)])
            self.db.jobs.create_index([("id", ASCENDING)])
            self.db.applications.create_index([("id", ASCENDING)])
            self.db.applications.create_index([("user_email", ASCENDING)])
            self.db.system_logs.create_index([("timestamp", DESCENDING)])
        except Exception as e:
            logger.warning(f"Error creating MongoDB indexes: {e}")

    # ------------------ USER AUTH ------------------ #
    def find_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        if not self.is_connected():
            return None
        return self.db.users.find_one({"email": email.strip().lower()}, {"_id": 0})

    def create_user(self, name: str, email: str, hashed_password: str) -> Dict[str, Any]:
        email_clean = email.strip().lower()
        user_doc = {
            "id": int(datetime.utcnow().timestamp() * 1000),
            "name": name or email_clean.split("@")[0].title(),
            "email": email_clean,
            "hashed_password": hashed_password,
            "created_at": datetime.utcnow().isoformat()
        }
        if self.is_connected():
            self.db.users.update_one(
                {"email": email_clean},
                {"$set": user_doc},
                upsert=True
            )
        return user_doc

    def get_users_count(self) -> int:
        if not self.is_connected():
            return 0
        return self.db.users.count_documents({})

    # ------------------ USER PROFILES ------------------ #
    def get_profile_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        if not self.is_connected():
            return None
        return self.db.user_profiles.find_one({"email": email.strip().lower()}, {"_id": 0})

    def get_first_profile(self) -> Optional[Dict[str, Any]]:
        if not self.is_connected():
            return None
        return self.db.user_profiles.find_one({}, {"_id": 0})

    def save_profile(self, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        email = profile_data.get("email", "").strip().lower()
        if not email and "name" in profile_data:
            email = f"{profile_data['name'].lower().replace(' ', '')}@example.com"
            profile_data["email"] = email

        profile_data["updated_at"] = datetime.utcnow().isoformat()

        if self.is_connected() and email:
            self.db.user_profiles.update_one(
                {"email": email},
                {"$set": profile_data},
                upsert=True
            )
        return profile_data

    # ------------------ JOBS ------------------ #
    def get_all_jobs(self) -> List[Dict[str, Any]]:
        if not self.is_connected():
            return []
        cursor = self.db.jobs.find({}, {"_id": 0}).sort("match_score", DESCENDING)
        return list(cursor)

    def save_jobs_batch(self, jobs: List[Dict[str, Any]]):
        if not self.is_connected() or not jobs:
            return
        for j in jobs:
            query = {"title": j["title"], "company": j["company"]}
            self.db.jobs.update_one(query, {"$set": j}, upsert=True)

    def get_job_by_id(self, job_id: int) -> Optional[Dict[str, Any]]:
        if not self.is_connected():
            return None
        return self.db.jobs.find_one({"id": job_id}, {"_id": 0})

    def get_jobs_count(self) -> int:
        if not self.is_connected():
            return 0
        return self.db.jobs.count_documents({})

    # ------------------ APPLICATIONS ------------------ #
    def get_applications(self, user_email: Optional[str] = None) -> List[Dict[str, Any]]:
        if not self.is_connected():
            return []
        query = {}
        if user_email:
            query["user_email"] = user_email.strip().lower()
        cursor = self.db.applications.find(query, {"_id": 0}).sort("applied_at", DESCENDING)
        return list(cursor)

    def save_application(self, app_data: Dict[str, Any]) -> Dict[str, Any]:
        app_data["updated_at"] = datetime.utcnow().isoformat()
        if not app_data.get("applied_at"):
            app_data["applied_at"] = datetime.utcnow().isoformat()

        if self.is_connected():
            query = {"job_id": app_data["job_id"], "user_email": app_data.get("user_email", "")}
            self.db.applications.update_one(query, {"$set": app_data}, upsert=True)
        return app_data

    def update_application_status(self, app_id: int, status: str) -> bool:
        if not self.is_connected():
            return False
        res = self.db.applications.update_one(
            {"id": app_id},
            {"$set": {"status": status, "updated_at": datetime.utcnow().isoformat()}}
        )
        return res.modified_count > 0

    # ------------------ APP SETTINGS ------------------ #
    def get_settings(self) -> Optional[Dict[str, Any]]:
        if not self.is_connected():
            return None
        return self.db.app_settings.find_one({}, {"_id": 0})

    def save_settings(self, settings_data: Dict[str, Any]) -> Dict[str, Any]:
        if self.is_connected():
            self.db.app_settings.update_one({}, {"$set": settings_data}, upsert=True)
        return settings_data

    # ------------------ SYSTEM LOGS ------------------ #
    def add_log(self, log_type: str, title: str, message: str) -> Dict[str, Any]:
        log_doc = {
            "id": int(datetime.utcnow().timestamp() * 1000),
            "log_type": log_type,
            "title": title,
            "message": message,
            "timestamp": datetime.utcnow().isoformat()
        }
        if self.is_connected():
            self.db.system_logs.insert_one(log_doc)
        return log_doc

    def get_recent_logs(self, limit: int = 5) -> List[Dict[str, Any]]:
        if not self.is_connected():
            return []
        cursor = self.db.system_logs.find({}, {"_id": 0}).sort("timestamp", DESCENDING).limit(limit)
        return list(cursor)

mongo_handler = MongoDBHandler()
