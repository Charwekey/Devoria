from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import NullPool
from dotenv import load_dotenv
import os
from models.base import Base
import shutil
from pathlib import Path

load_dotenv()
#connection string is private
#dotenv purpose is to store database credentials
#inside.env, stuff are stored in key value pairs.
#Expected format: postgresql://username:password@localhost:5432/database_name
connection_str = os.environ.get("DATABASE_URL")

if not connection_str:
    raise ValueError("DATABASE_URL environment variable is not set")

# PostgreSQL connection with connection pooling optimizations
engine = create_engine(
    connection_str,
    pool_pre_ping=True,
    echo=False,  # Set to True for SQL debugging
    poolclass=NullPool if "fly.io" in connection_str else None  # Use NullPool for serverless environments
)


try:
    with engine.connect() as connection:
        print("Successfully connected to the database")
        connection.close()
except Exception as e:
    print(f"Failed to connect to database {e}")
    

session = sessionmaker(autocommit=False, autoflush=False, bind=engine)
SessionLocal = session

def upload_file(file, folder_name):
    """Upload a file to the static directory and return the URL path"""
    try:
        # Create the upload directory if it doesn't exist
        upload_dir = Path(__file__).parent.parent / "static" / folder_name
        upload_dir.mkdir(parents=True, exist_ok=True)
        
        # Generate a unique filename
        import uuid
        file_extension = Path(file.filename).suffix
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        
        # Save the file
        file_path = upload_dir / unique_filename
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Return the URL path
        return f"/static/{folder_name}/{unique_filename}"
    except Exception as e:
        print(f"File upload error: {e}")
        raise e

# We no longer use a global db_session to ensure per-request isolation.