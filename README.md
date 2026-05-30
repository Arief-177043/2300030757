# AffordMed Notification Management System

A comprehensive notification management application featuring server-side API with Node.js and Express, database persistence through PostgreSQL with Prisma ORM, and a modern React frontend powered by Vite and Material-UI components.

## Screenshots

### Login Page

<img width="1918" height="982" alt="Login Page" src="https://github.com/user-attachments/assets/fe893e05-8810-48b1-ae58-49f21de7d4e9" />

### Dashboard

<img width="1742" height="903" alt="Dashboard" src="https://github.com/user-attachments/assets/60872c9b-a284-40f7-adda-1fdd00542880" />

### Notifications

<img width="1611" height="976" alt="Notifications" src="https://github.com/user-attachments/assets/1c257790-14fa-4c50-887c-4ee8b4fc144f" />

### Priority Inbox
<img width="1668" height="943" alt="image" src="https://github.com/user-attachments/assets/f4b8efc6-88d3-4c80-b9a4-634fd34e90fb" />


## Project Structure

```text
2300030757/
├── .gitignore
├── README.md
├── notification_system_design.md
├── notification_app_be/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   ├── prisma/
│   ├── package.json
│   └── .env.example
├── notification_app_fe/
│   ├── src/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── components/
│   │   └── services/
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
└── prisma/
```

## Prerequisites

* Node.js version 18 or later
* PostgreSQL database server (version 14+) installed and running locally
* npm package manager

## Installation & Configuration

### 1. Database Setup

Open your PostgreSQL client and create a new database:

```sql
CREATE DATABASE affordmed;
```

### 2. Backend Installation

Navigate to the backend directory and install dependencies:

```bash
cd notification_app_be
npm install
```

Create the environment file:

```bash
cp .env.example .env
```

Update `.env` with your database credentials and JWT configuration:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/affordmed?schema=public"
JWT_SECRET="your_jwt_secret_here"
PORT=5000
```

Run database migrations and start the server:

```bash
npx prisma migrate dev --name init --schema=prisma/schema.prisma
npm run dev
```

The backend service will launch at:

```text
http://localhost:5000
```

### 3. Frontend Installation

In a separate terminal:

```bash
cd notification_app_fe
npm install
npm run dev
```

The frontend application will be available at:

```text
http://localhost:3000
```

## Configuration Parameters (notification_app_be/.env)

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/affordmed?schema=public"
JWT_SECRET="your_jwt_secret_here"
PORT=5000
```

## API Endpoints

| Method | Path                        | Auth | Description                      |
| ------ | --------------------------- | ---- | -------------------------------- |
| POST   | /api/auth/register          | No   | Register new student             |
| POST   | /api/auth/login             | No   | Login                            |
| GET    | /api/notifications          | Yes  | List with filters and pagination |
| GET    | /api/notifications/unread   | Yes  | Get unread notifications         |
| GET    | /api/notifications/priority | Yes  | Get priority inbox               |
| POST   | /api/notifications          | Yes  | Create notification              |
| PATCH  | /api/notifications/:id/read | Yes  | Mark notification as read        |

## Features

* JWT Authentication
* PostgreSQL Database Integration
* Prisma ORM
* Notification CRUD Operations
* Pagination and Filtering
* Search Functionality
* Priority Inbox with Weighted Scoring Algorithm
* External Evaluation Service Integration
* Responsive Material UI Dashboard
* Mobile-Friendly Sidebar Navigation
* Protected Routes and Authorization

## Tech Stack

### Frontend

* React.js
* Vite
* Material UI
* React Router
* Axios

### Backend

* Node.js
* Express.js
* PostgreSQL
* Prisma ORM
* JWT Authentication
* bcryptjs

```
```
