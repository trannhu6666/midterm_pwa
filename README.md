# PWA Task Tracker - Midterm Project

Midterm project for the Web Programming course: A Task Tracker application built using Progressive Web App (PWA) technology with a PHP MVC Backend architecture.

## Team Members

- **Trần Thị Ngọc Như** (Student ID: 524H0021) - (UI/UX Design, PWA Logic).
- **Nguyễn Thành An** (Student ID: 519H0133) - (PHP Backend, RESTful API, Database & Sync) and Frontend Completion.

## Key Features

- **Offline-first:** Users can add tasks even without an internet connection (using IndexedDB).
- **Auto-Sync:** Automatically synchronizes local data with the MySQL server once the network connection is restored.
- **RESTful API:** Backend system built with pure PHP following the MVC architecture, communicating via JSON.
- **Push Notifications:** Supports device token registration and notifications (simulated device token implementation).
- **Installable App:** Includes `manifest.json` and `sw.js`, allowing users to install the application on desktop or mobile devices.

## Installation & Setup (For Instructors)

1. Clone or copy the `midterm_pwa` folder into `C:\xampp\htdocs\`.
2. Open phpMyAdmin and create a database named `pwa_task_tracker`.
3. Import the SQL script (attached in the report) or manually run the SQL commands to create the `tasks` and `devices` tables.
4. Open `config/Database.php` and ensure the database credentials match your XAMPP configuration (default: `root` / empty password).
5. Access the application at: `http://localhost/midterm_pwa/index.html`

## API Endpoints

- `GET /api/tasks.php` : Retrieve all tasks.
- `POST /api/tasks.php` : Create a new task.
- `PUT /api/tasks.php?id={id}` : Update task completion status.
- `DELETE /api/tasks.php?id={id}` : Delete a task.
- `POST /api/sync.php` : Synchronize offline IndexedDB tasks with the server.
- `POST /api/subscribe.php` : Register a device token for push notifications.