from sqlalchemy import text, inspect
from utils.connections import engine

def check_state():
    try:
        inspector = inspect(engine)
        columns = [c['name'] for c in inspector.get_columns('class_student')]
        print(f"Columns in class_student: {columns}")
        
        with engine.connect() as connection:
            res = connection.execute(text("SELECT id, class_name, class_code FROM classes"))
            rows = res.fetchall()
            print(f"Existing Classes: {rows}")
            
    except Exception as e:
        print(f"Check failed: {e}")

if __name__ == "__main__":
    check_state()
