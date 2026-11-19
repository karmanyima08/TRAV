"""
Main FastAPI Application Entrypoint for TRAVORA — Intelligent Travel Planning.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.database.connection import connect_db, close_db
from app.database.seeder import seed_database
from app.api import auth, destinations, trips, ai_engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Attempt DB connection & seed gracefully
    try:
        await connect_db()
        await seed_database()
    except Exception as e:
        print(f"[Startup Notice] Running with in-memory resilient fallback store: {e}")
    yield
    try:
        await close_db()
    except Exception:
        pass


app = FastAPI(
    title="TRAVORA API — Intelligent Travel Planning",
    description="Constraint-Based and Adaptive Travel Planning System with State Space Search, CSP Solver, and Multi-Agent Architecture",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(destinations.router, prefix="/api/destinations", tags=["Destinations"])
app.include_router(trips.router, prefix="/api/trips", tags=["Trips"])
app.include_router(ai_engine.router, prefix="/api/ai", tags=["AI Engine"])


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "TRAVORA AI Engine",
        "version": "1.0.0",
        "academic_project": "TRAVEL TRIP PLANNER (CSE3705)",
        "ai_topics_active": [
            "Topic 2: State Space Search (BFS, DFS, UCS, Greedy, A*)",
            "Topic 3: Constraint Satisfaction Problems (Backtracking, MRV, Degree, LCV, Forward Checking)",
            "Topic 4: Knowledge Representation and Reasoning (Forward Chaining)",
            "Topic 5: Intelligent Agents and Expert Systems (PEAS Multi-Agent Architecture)"
        ]
    }

