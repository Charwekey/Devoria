from sqlalchemy import text
from utils.connections import engine

def migrate():
    try:
        with engine.connect() as connection:
            print('Starting Security Migration...')
            
            # Add columns to users if missing
            try:
                connection.execute(text('ALTER TABLE users ADD COLUMN is_verified INT DEFAULT 0'))
                print('Added is_verified column to users.')
            except Exception as e:
                print(f'is_verified skip (likely exists): {e}')

            try:
                connection.execute(text('ALTER TABLE users ADD COLUMN is_admin INT DEFAULT 0'))
                print('Added is_admin column to users.')
            except Exception as e:
                print(f'is_admin skip (likely exists): {e}')

            # Create registration_whitelist table
            connection.execute(text('''
                CREATE TABLE IF NOT EXISTS registration_whitelist (
                    id VARCHAR(60) PRIMARY KEY,
                    email VARCHAR(60) UNIQUE NOT NULL,
                    role VARCHAR(60) NOT NULL,
                    track VARCHAR(60) NOT NULL,
                    invited_by VARCHAR(60) NULL,
                    is_used INT DEFAULT 0
                )
            '''))
            print('Verified registration_whitelist table.')

            # Create assistant_permissions table
            # user_id is FK to users.id
            connection.execute(text('''
                CREATE TABLE IF NOT EXISTS assistant_permissions (
                    id VARCHAR(60) PRIMARY KEY,
                    user_id VARCHAR(60) NOT NULL,
                    can_grade INT DEFAULT 0,
                    can_view_submissions INT DEFAULT 1,
                    can_post_assignments INT DEFAULT 0,
                    can_manage_attendance INT DEFAULT 0
                )
            '''))
            print('Verified assistant_permissions table.')

            connection.commit()
            print('Security Migration Complete!')
    except Exception as e:
        print(f'Migration failed: {e}')

if __name__ == '__main__':
    migrate()
