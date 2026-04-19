import mysql.connector

try:
    conn = mysql.connector.connect(
        host="localhost",
        user="rabi",
        password="Devoria_123",
        database="devoria_db"
    )
    cursor = conn.cursor()
    
    # Rename the column
    print("Renaming students_id to student_id in projects table...")
    cursor.execute("ALTER TABLE projects CHANGE students_id student_id VARCHAR(60);")
    
    conn.commit()
    print("Column renamed successfully.")
    
    cursor.close()
    conn.close()
except Exception as e:
    print(f"Error: {e}")
