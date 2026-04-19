from sqlalchemy import text
from utils.connections import engine
from utils.auth import get_password_hash
from utils.uuid_generator import generative_uuid

def fix():
    with engine.connect() as c:
        print('Repairing Security Database...')
        
        # 1. Fix Whitelist Table
        try:
            c.execute(text('ALTER TABLE registration_whitelist ADD COLUMN is_used INT DEFAULT 0'))
            print('Added is_used column to whitelist.')
        except Exception as e:
            if 'Duplicate column' in str(e) or '1060' in str(e):
                print('is_used already exists.')
            else:
                print(f'Whitelist tweak error: {e}')
                
        # 2. Bootstrap Admin
        admin_email = 'admin@devoria.com'
        exists = c.execute(text('SELECT id FROM users WHERE email = :e'), {'e': admin_email}).first()
        if not exists:
            admin_id = generative_uuid()
            c.execute(text('''
                INSERT INTO users (id, first_name, last_name, email, password, role, track, is_verified, is_admin)
                VALUES (:id, 'Platform', 'Admin', :email, :pw, 'admin', 'fullstack', 1, 1)
            '''), {
                'id': admin_id,
                'email': admin_email,
                'pw': get_password_hash('DevoriaAdmin2026!'),
            })
            print(f'Admin bootstrapped: {admin_email}')
        else:
            c.execute(text('UPDATE users SET is_verified = 1, is_admin = 1 WHERE email = :e'), {'e': admin_email})
            print(f'Admin status updated: {admin_email}')

        # 3. Verify existing instructors
        c.execute(text('UPDATE users SET is_verified = 1 WHERE role = 
