from sqlalchemy import text
from utils.connections import engine
from utils.auth import verify_password, get_password_hash

def check():
    email = 'admin@devoria.com'
    password = 'DevoriaAdmin2026!'
    
    with engine.connect() as conn:
        user = conn.execute(text('SELECT password FROM users WHERE email=:e'), {'e': email}).first()
        if not user:
            print('Admin user not found')
            return
            
        db_password = user[0]
        match = verify_password(password, db_password)
        print(f'Password match: {match}')
        
        # Test hashing again to see if it produces a valid match
        new_hash = get_password_hash(password)
        match_new = verify_password(password, new_hash)
        print(f'New hash match: {match_new}')

if __name__ == '__main__':
    check()
