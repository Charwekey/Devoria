
# 🚀 Devoria — A Transparent Virtual Learning Environment

Devoria is a backend-powered Learning Management System that helps instructors manage classes efficiently while giving students real-time visibility into their attendance, assignments, and performance.

---

## 🧩 The Problem

In many learning environments, including programs like Tech for Girls, attendance and grades are often managed manually using spreadsheets or informal systems. This can lead to errors, lack of transparency, and poor communication between instructors and students.

Students may be marked absent when they were present, or complete assignments without ever knowing their grades. There is also no centralized place to showcase student projects.

---

## ✅ What Devoria Does

*  Allows instructors to create and manage classes
*  Enables students to join classes
*  Tracks attendance (present/absent) with visibility for students
*  Handles assignment creation, submission, and grading
*  Shows students their performance over time
*  Includes a project showcase for students to display their work
*  Organizes projects by cohort for easy discovery

---

##  Demo

*Add your video link here (Loom or YouTube)*
Example:
`https://youtube.com/your-demo-link`

 *Add a screenshot of your `/docs` page here*

---

## Tech Stack

* **Python** — Core programming language
* **FastAPI** — Framework for building the API
* **SQLAlchemy** — ORM for database management
* **SQLite** — Lightweight database
* **Uvicorn** — ASGI server for running the app

---

## How to Run It Locally

1. **Clone the repository**

```bash
git clone https://github.com/your-username/devoria.git
cd devoria
```

2. **Navigate to the backend folder**

```bash
cd backend
```

3. **Create a virtual environment (optional but recommended)**

```bash
python -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate
```

4. **Install dependencies**

```bash
pip install -r requirements.txt
```

5. **Run the server**

```bash
uvicorn utils.main:app --reload
```

6. **Open in browser**

```
http://127.0.0.1:8000/docs
```

---

## 🔌 API Endpoints

| Method | Endpoint     | Description                            |
| ------ | ------------ | -------------------------------------- |
| POST   | /users       | Create a new user (student/instructor) |
| GET    | /users       | Get all users                          |
| POST   | /classes     | Create a class                         |
| GET    | /classes     | Get all classes                        |
| POST   | /attendance  | Mark student attendance                |
| GET    | /attendance  | View attendance records                |
| POST   | /assignments | Create an assignment                   |
| GET    | /assignments | Get all assignments                    |
| POST   | /submissions | Submit an assignment                   |
| GET    | /submissions | View submissions                       |
| POST   | /projects    | Upload a student project               |
| GET    | /projects    | View all projects                      |
| POST   | /enrollments | Enroll student in class                |

👉 *(Adjust names if your actual routes differ — this is a clean standard structure)*

---

## 🧪 How to Test the API

### Option 1: Using the Browser (Recommended)

1. Start the server
2. Open:

```
http://127.0.0.1:8000/docs
```

3. Select any endpoint
4. Click **“Try it out”**
5. Fill in the data
6. Click **Execute**

You’ll see the response instantly.

---

### Option 2: Using cURL (Example)

```bash
curl -X POST "http://127.0.0.1:8000/users" \
-H "Content-Type: application/json" \
-d '{"name": "Shally", "email": "shally@gmail.com"}'
```

---

## 🌟 Why This Project Matters

Devoria is more than just a backend system — it solves real problems students face in learning environments by improving transparency, accountability, and access to information.

It ensures students always know:

* ✔️ Their attendance status
* ✔️ Their grades
* ✔️ Their progress

And it gives them a platform to showcase their work.

---

## 🔮 Future Improvements

* 💬 Real-time chat between students and instructors
* 🔔 Notifications (email + in-app)
* 📢 Announcements system
