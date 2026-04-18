from sqlalchemy import text
from utils.connections import engine

def migrate():
    try:
        with engine.connect() as connection:
            print("Adding 'status' column to 'class_student' table...")
            # Using text() for raw SQL
            # We use a try-except block in SQL if possible, or just catch the SQLAlchemy error
            connection.execute(text("ALTER TABLE class_student ADD COLUMN status VARCHAR(20) DEFAULT 'pending'"))
            connection.commit()
            print("Successfully added 'status' column.")
    except Exception as e:
        if "Duplicate column name" in str(e):
            print("Column 'status' already exists.")
        else:
            print(f"Migration failed: {e}")

if __name__ == "__main__":
    migrate()
