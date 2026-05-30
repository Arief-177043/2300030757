
A comprehensive notification management application featuring server-side API with Node.js and Express, database persistence through PostgreSQL with Prisma ORM, and a modern React frontend powered by Vite and Material-UI components.

## Screenshots

### Login Page
<img width="1918" height="982" alt="image" src="https://github.com/user-attachments/assets/fe893e05-8810-48b1-ae58-49f21de7d4e9" />


### Dashboard
<img width="1742" height="903" alt="image" src="https://github.com/user-attachments/assets/60872c9b-a284-40f7-adda-1fdd00542880" />


### Notifications
<img width="1611" height="976" alt="image" src="https://github.com/user-attachments/assets/1c257790-14fa-4c50-887c-4ee8b4fc144f" />




```
## Project Structure
affordmed/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   ├── .env
│   └── package.json
├── prisma/
│   └── schema.prisma
├── frontend/
│   ├── src/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── components/
│   │   └── services/
│   └── package.json
└── docs/
    └── notification_system_design.md
```


- Node.js version 18 or later
- PostgreSQL database server (version 14+) installed and running locally
- npm package manager

## Installation & Configuration

### 1. Database Setup

Open your PostgreSQL client and create a new database:
```sql
CREATE DATABASE affordmed;
```

### 2. Backend Installation

Navigate to the backend directory and install dependencies:
```bash
cd backend
cp .env.example .env
```

Update the configuration file (.env) with your database credentials and JWT configuration:
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/affordmed?schema=public"
JWT_SECRET="your_jwt_secret_here"
PORT=5000
```

Continue with installation:
```bash
npm install
cp ../prisma/schema.prisma ../prisma/schema.prisma
npx prisma migrate dev --name init --schema=../prisma/schema.prisma
npm run dev
```

The backend service will launch at http://localhost:5000

### 3. Frontend Installation

In a separate terminal, navigate to the frontend directory:
```bash
cd notification_app_fe
npm install
npm run dev
```

The frontend application will be available at http://localhost:3000

## Configuration Parameters (backend/.env)

```
DATABASE_URL="postgresql://postgres:password@localhost:5432/affordmed?schema=public"
JWT_SECRET="your_jwt_secret_here"
PORT=5000
```

## API Endpoints

| Method | Path                              | Auth | Description             |
|--------|-----------------------------------|------|-------------------------|
| POST   | /api/auth/register                | No   | Register new student    |
| POST   | /api/auth/login                   | No   | Login                   |
| GET    | /api/notifications                | Yes  | List with filters/pages |
| GET    | /api/notifications/unread         | Yes  | Unread only             |
| GET    | /api/notifications/priority       | Yes  | Priority top 10         |
| POST   | /api/notifications                | Yes  | Create notification     |
| PATCH  | /api/notifications/:id/read       | Yes  | Mark as read            |

## Features

- JWT authentication
- Pagination, filtering by type and read status, search
- Priority inbox with weighted scoring algorithm
- External evaluation service integration
- Responsive Material UI dashboard
- Mobile-friendly sidebar navigation
