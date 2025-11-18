#!/usr/bin/env python3
import uvicorn
from database import create_tables

if __name__ == "__main__":
    # Create database tables
    create_tables()
    
    # Run the application
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )