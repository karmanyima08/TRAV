from motor.motor_asyncio import AsyncIOMotorClient
from app.config import get_settings
import asyncio

settings = get_settings()


class Database:
    client: AsyncIOMotorClient = None
    db = None
    is_connected: bool = False


db_instance = Database()


async def connect_db():
    try:
        # Fast 500ms server selection timeout so offline/local environments don't hang for 30s
        client = AsyncIOMotorClient(
            settings.mongodb_url,
            serverSelectionTimeoutMS=500,
            connectTimeoutMS=500
        )
        # Verify connection eagerly with a quick ping
        await client.admin.command('ping')
        db_instance.client = client
        db_instance.db = client[settings.database_name]
        db_instance.is_connected = True
        print(f"[MongoDB] Successfully connected to database: {settings.database_name}")
    except Exception as e:
        db_instance.client = None
        db_instance.db = None
        db_instance.is_connected = False
        print(f"[MongoDB Notice] Offline / Standalone mode active (In-memory storage enabled): {e}")


async def close_db():
    if db_instance.client:
        db_instance.client.close()
        db_instance.is_connected = False
        print("[MongoDB] Connection closed")


def get_database():
    if db_instance.is_connected:
        return db_instance.db
    return None
