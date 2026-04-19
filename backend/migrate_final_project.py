import sys
import os

# Add backend to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import text
from utils.connections import engine

def migrate():
    print("--- Starting Final Project Schema Migration ---")
    with engine.connect() as conn:
        try:
            print("Adding is_final_project to assignments...")
            conn.execute(text("ALTER TABLE assignments ADD COLUMN is_final_project INT DEFAULT 0"))
            print("Success.")
        except Exception as e:
            print(f"Skipping is_final_project (may already exist): {e}")

        try:
            print("Adding project fields to submissions...")
            conn.execute(text("ALTER TABLE submissions ADD COLUMN project_title VARCHAR(100) NULL"))
            conn.execute(text("ALTER TABLE submissions ADD COLUMN project_description VARCHAR(1000) NULL"))
            conn.execute(text("ALTER TABLE submissions ADD COLUMN github_link VARCHAR(255) NULL"))
            conn.execute(text("ALTER TABLE submissions ADD COLUMN demo_link VARCHAR(255) NULL"))
            print("Success.")
        except Exception as e:
            print(f"Skipping project fields (may already exist): {e}")

        conn.commit()
    print("--- Migration Complete ---")

if __name__ == "__main__":
    migrate()
