from fastapi import FastAPI

# import all routes
from routes import (
    user_routes,
    classes_routes,
    assignments_routes,
    submissions_routes,
    projects_routes,
    attendance_routes,
    class_students_routes
)

app = FastAPI()


# include routers
app.include_router(user_routes.router)
app.include_router(classes_routes.router)
app.include_router(assignments_routes.router)
app.include_router(submissions_routes.router)
app.include_router(projects_routes.router)
app.include_router(attendance_routes.router)
app.include_router(class_students_routes.router)