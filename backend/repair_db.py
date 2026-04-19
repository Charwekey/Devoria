from sqlalchemy import text
from utils.connections import engine
from utils.auth import get_password_hash
from utils.uuid_generator import generative_uuid

def repair():
    print("--- Starting Security Database Repair ---")
    with engine.connect() as conn:
        # 1. Ensure registration_whitelist table has the correct structure
        print("Checking whitelist schema...")
        try:
            conn.execute(text("CREATE TABLE IF NOT EXISTS registration_whitelist (id INT AUTO_INCREMENT PRIMARY KEY, email VARCHAR(60) UNIQUE, role VARCHAR(20), track VARCHAR(60), invited_by VARCHAR(60), is_used INT DEFAULT 0)"))
            
            try:
                conn.execute(text("ALTER TABLE registration_whitelist ADD COLUMN is_used INT DEFAULT 0"))
            except Exception as e:
                pass
            print("Whitelist schema verified.")
        except Exception as e:
            print(f"Whitelist schema error: {e}")

        # 2. Bootstrap Admin Account
        admin_email = "admin@devoria.com"
        admin_pass = "DevoriaAdmin2026!"
        print(f"Resetting admin: {admin_email}...")
        
        user = conn.execute(text("SELECT id FROM users WHERE email = :e"), {"e": admin_email}).first()
        
        if not user:
            print("Creating new Admin account...")
            admin_id = generative_uuid()
            conn.execute(text("""
                INSERT INTO users (id, first_name, last_name, email, password, role, track, is_verified, is_admin)
                VALUES (:id, 'Platform', 'Admin', :email, :pw, 'admin', 'fullstack', 1, 1)
            """), {
                "id": admin_id,
                "email": admin_email,
                "pw": get_password_hash(admin_pass)
            })
            print("Admin account created successfully.")
        else:
            print("Admin account exists. Resetting password and flags...")
            conn.execute(text("UPDATE users SET password = :pw, is_verified = 1, is_admin = 1 WHERE email = :e"), {"pw": get_password_hash(admin_pass), "e": admin_email})
            print("Admin account updated and password reset.")

        conn.execute(text("UPDATE users SET is_verified = 1 WHERE role = 'instructor'"))
        
        conn.commit()
        print("--- Database Repair Complete ---")

if __name__ == "__main__":
    repair()
