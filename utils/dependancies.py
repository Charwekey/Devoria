from models.users_models import User

# TEMP FAKE USER (for testing)
def get_current_user():
    return Users(
        id="test-id",
        first_name="Test",
        last_name="User",
        email="test@gmail.com",
        role="instructor",  # change to "student" to test
        track="frontend"
    )