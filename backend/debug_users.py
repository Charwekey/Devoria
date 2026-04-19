from utils.connections import engine
from sqlalchemy import text
with engine.connect() as c:
    print('--- List of Users ---')
    users = c.execute(text('SELECT email, role, is_verified FROM users')).fetchall()
    for u in users:
        print(u)
    print('\n--- Whitelist ---')
    whitelist = c.execute(text('SELECT email, role, is_used FROM registration_whitelist')).fetchall()
    for w in whitelist:
        print(w)
