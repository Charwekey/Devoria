from sqlalchemy import create_engine, text

# Hardcoded from .env to be sure
DATABASE_URL = "mysql+pymysql://rabi_odd:rabi1234@localhost:3306/devoria"
engine = create_engine(DATABASE_URL)

def check_data():
    try:
        with engine.connect() as conn:
            print("--- USERS ---")
            users = conn.execute(text("SELECT id, email, role, track FROM users")).fetchall()
            for u in users:
                print(f"ID: {u.id}, Email: {u.email}, Role: {u.role}, Track: {u.track}")
            
            print("\n--- CLASSES ---")
            classes = conn.execute(text("SELECT id, class_name, class_code, instructor_id FROM classes")).fetchall()
            for c in classes:
                print(f"ID: {c.id}, Name: {c.class_name}, Code: {c.class_code}, InstID: {c.instructor_id}")
            
            print("\n--- ENROLLMENTS ---")
            enrollments = conn.execute(text("SELECT class_id, student_id, status FROM class_students")).fetchall()
            for e in enrollments:
                print(f"ClassID: {e.class_id}, StudentID: {e.student_id}, Status: {e.status}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_data()
