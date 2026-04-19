from sqlalchemy import text
from utils.connections import engine

def check_users():
    print('--- Checking Users in DB ---')
    with engine.connect() as conn:
        res = conn.execute(text('SELECT email, role, is_admin, is_verified FROM users')).fetchall()
        for row in res:
            print(f'Email: {row[0]}, Role: {row[1]}, Admin: {row[2]}, Verified: {row[3]}')

if __name__ == '__main__':
    check_users()
