from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv
import os
from models.base import Base

load_dotenv()
#connection string is private
#dotenv purpose is to store database credentials
#inside.env, stuff are stored in key value pairs.
connection_str = os.environ.get("DATABASE_URL")
engine = create_engine(connection_str, pool_pre_ping=True)


try:
    with engine.connect() as connection:
        print("Successfully connected to the database")
        connection.close()
except Exception as e:
    print(f"Failed to connect to database {e}")
    

Base.metadata.create_all(engine)

session = sessionmaker(bind=engine)
db_session = session()