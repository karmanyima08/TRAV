"""
Database Seeder: Seeds MongoDB with destination and attraction facts
if collections are empty, ensuring seamless initialization.
"""

from app.database.connection import get_database
from app.ai_engine.knowledge_base.facts import DESTINATIONS, ATTRACTIONS, RESTAURANTS


async def seed_database():
    """Seed MongoDB collections with initial Knowledge Base data."""
    try:
        db = get_database()
        if db is None:
            return

        # Seed Destinations
        dest_coll = db["destinations"]
        if await dest_coll.count_documents({}) == 0:
            dest_docs = list(DESTINATIONS.values())
            if dest_docs:
                await dest_coll.insert_many(dest_docs)
                print(f"[Seeder] Inserted {len(dest_docs)} destinations.")

        # Seed Attractions
        attr_coll = db["attractions"]
        if await attr_coll.count_documents({}) == 0:
            if ATTRACTIONS:
                await attr_coll.insert_many(list(ATTRACTIONS))
                print(f"[Seeder] Inserted {len(ATTRACTIONS)} attractions.")

        # Seed Restaurants
        rest_coll = db["restaurants"]
        if await rest_coll.count_documents({}) == 0:
            if RESTAURANTS:
                await rest_coll.insert_many(list(RESTAURANTS))
                print(f"[Seeder] Inserted {len(RESTAURANTS)} restaurants.")

    except Exception as e:
        print(f"[Seeder Warning] Database seeding skipped or running in offline mode: {e}")

