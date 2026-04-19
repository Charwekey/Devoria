from sqlalchemy import text
from utils.connections import engine

def migrate():
    try:
        with engine.connect() as connection:
            print('Migrating project_likes table...')
            
            # Add ip_address column
            try:
                connection.execute(text('ALTER TABLE project_likes ADD COLUMN ip_address VARCHAR(45) NULL'))
                print('Added ip_address column.')
            except Exception as e:
                if 'Duplicate column name' in str(e):
                    print('Column ip_address already exists.')
                else:
                    raise e
            
            # Make student_id nullable
            try:
                connection.execute(text('ALTER TABLE project_likes MODIFY COLUMN student_id VARCHAR(60) NULL'))
                print('Made student_id column nullable.')
            except Exception as e:
                print(f'Failed to modify student_id: {e}')
                
            connection.commit()
            print('Migration complete!')
    except Exception as e:
        print(f'General Migration failed: {e}')

if __name__ == '__main__':
    migrate()
