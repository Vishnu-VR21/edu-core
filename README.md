# edu-core
Edu-Core is a full-stack institution management system designed to manage coaching centers, students, staff, exams, attendance, payments, and academic resources with role-based access control (RBAC).

Tech Stack:
Frontend: React (Vite) + Tailwind CSS
Backend: Django + Django REST Framework (DRF)
Database: MySQL
Authentication: DRF Token Authentication (RBAC-based)

System Setup
1. Install Node.js & npm

Download and install Node.js from: https://nodejs.org

Verify installation:
node -v
npm -v

If these fail, your setup is broken — fix this before moving on.

Frontend Setup (React + Vite + Tailwind)

Step 1: Create React App using Vite
npm create vite@latest frontend
cd frontend
npm install

Step 2: Install Tailwind CSS
npm install tailwindcss @tailwindcss/vite

Step 3: Configure Tailwind
Update vite.config.js:

import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
})

Update index.css or app.css 
@import "tailwindcss";

Step 4: Run Frontend
npm run dev

Backend Setup (Django + DRF)
Step 1: Create Virtual Environment
python -m venv venv

Activate:

Windows:
venv\Scripts\activate
Linux/Mac:
source venv/bin/activate

If you skip virtual environments, expect dependency conflicts later.

Step 2: Install Dependencies
pip install django djangorestframework mysqlclient
Step 3: Create Django Project
django-admin startproject backend
cd backend
Step 4: Create Django Apps (to add views, urls, serializer ..etc )

Step 5: Configure Database (MySQL)

In settings.py:

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'edu_core',
        'USER': 'root',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '3306',
    }
}
Step 6: Run Migrations
python manage.py makemigrations
python manage.py migrate
Step 7: Create Superuser (Admin)
python manage.py createsuperuser

This is mandatory — system won’t function without admin creating branches.

Step 8: Run Backend Server
python manage.py runserver
Authentication & Access Control
Uses DRF Token Authentication
Implements Role-Based Access Control (RBAC)
Roles in System:
Admin
Branch Staff
Student
Teacher
Principal
Parent

Each role has separate login and dashboard with restricted permissions.

Core Modules & Features

Admin Module:
Branch management (create, update, delete, block)
Staff management (Teacher / Principal via form & Excel bulk upload)
Student approval system
Full student lifecycle management
Payment monitoring & fee adjustments
Attendance monitoring
Dashboard with:
Notifications (student approvals)
Ongoing/upcoming meetings

Branch Module :
Student management (form + Excel bulk upload)
Fee collection tracking (manual entry)
Exam scheduling (Excel-based MCQ upload)
Staff visibility within branch
Attendance monitoring
Meeting participation via dashboard

Principal Module:
Timetable management (create, update, delete)
Handle teacher timetable change requests
Upload learning materials (notes, syllabus, recordings)
Attendance marking
Dashboard with schedules and academic overview

Teacher Module:
Schedule meetings (Google Meet integration via link)
Upload learning materials
View timetable & request changes
Attendance marking (immutable once submitted)

Student Module:
Registration (requires admin approval)
Access to:
Attendance
Payments
Learning materials
Meetings
Online exam system:
Timer-based (server-controlled)
Auto-submit on timeout
Instant results

Parent Module:
View child’s:
Attendance
Payments
Academic performance

System Workflow
1. Initial Setup (Admin Driven)
Admin creates branches
Admin adds staff (Teachers / Principals)
Credentials are auto-generated and sent via email
→ No approval required for staff

3. Student Onboarding
Students register through system
Status: Pending approval
Admin:
Approves → credentials sent via email
Rejects → access denied
Branch can also add students directly (form / Excel)

4. Branch Operations
Manage students (CRUD + block access)
Record fee payments (manual entry)
Schedule exams:
Upload MCQ questions via Excel template
View attendance and meetings

5. Academic Management
Principal
Creates and manages timetables
Handles teacher change requests
Uploads learning materials
Marks attendance
Teacher
Adds meeting schedules (Google Meet links)
Uploads learning materials
Marks attendance
Once marked → cannot be changed by anyone

6. Exam Workflow
Branch schedules exam with time constraints
Students:
Can only access exam within valid time window
Attempt exam in dedicated interface
System behavior:
Timer controlled from backend
Auto-submit when time expires
Immediate result generation

7. Monitoring & Reporting
Admin
Tracks:
Student performance
Attendance
Fee payments
Can adjust fees (e.g., remove monthly dues)
Parent
Monitors child’s:
Attendance
Payments
Results

9. Account Control Rules
Admin:
Cannot change password (system-restricted)
All Other Roles:
Can change password anytime
Admin can:
Block/unblock access for any user

Non-Negotiable System Constraints
Admin is the root authority — system depends on it
Student access requires explicit approval
Attendance is write-once (immutable)
Exams are server-timed → prevents manipulation
Payments are branch-controlled, not automated
Email notifications are core to system flow
