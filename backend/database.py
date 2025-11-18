from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database connection URL - support multiple databases
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./database/healthcare_db.db")


# Check if we're using SQLite
is_sqlite = DATABASE_URL.startswith("sqlite")

# Create engine with appropriate parameters
if is_sqlite:
    # SQLite doesn't support connection pooling
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
else:
    # For other databases (PostgreSQL, MySQL), use connection pooling
    engine = create_engine(
        DATABASE_URL,
        pool_size=10,
        max_overflow=20,
        pool_timeout=30,
        pool_recycle=1800,
    )

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Function to create database tables
def create_tables():
    import models
    models.Base.metadata.create_all(bind=engine)

# Function to drop all tables (for testing)
def drop_tables():
    import models
    models.Base.metadata.drop_all(bind=engine)
