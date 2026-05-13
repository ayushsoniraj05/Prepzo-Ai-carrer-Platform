# AI Career Platform - Backend

Node.js/Express backend with MongoDB for the AI Career Platform.

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
   - Copy `.env` and update the values:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secure random string for JWT signing

3. Start the server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server runs on `http://localhost:5000` by default.

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/me` | Get current user | Yes |
| POST | `/api/auth/logout` | Logout user | Yes |

### Users

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users/profile` | Get user profile | Yes |
| PUT | `/api/users/profile` | Update user profile | Yes |
| PUT | `/api/users/onboarding` | Complete onboarding | Yes |
| PUT | `/api/users/assessment` | Complete assessment | Yes |
| GET | `/api/users` | Get all users | Admin |
| GET | `/api/users/:id` | Get user by ID | Admin |
| DELETE | `/api/users/:id` | Delete user | Admin |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health status |

## Request/Response Examples

### Register
```json
POST /api/auth/register
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "dateOfBirth": "2000-01-15",
  "gender": "Male",
  "collegeName": "MIT",
  "degree": "B.Tech",
  "fieldOfStudy": "Computer Science",
  "yearOfStudy": "3rd Year",
  "targetRole": "Software Engineer",
  "knownTechnologies": ["JavaScript", "React", "Node.js"],
  "linkedin": "https://linkedin.com/in/johndoe",
  "github": "https://github.com/johndoe",
  "password": "SecurePass@123"
}
```

### Login
```json
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "SecurePass@123"
}
```

### Complete Onboarding
```json
PUT /api/users/onboarding
{
  "cgpa": "8.5",
  "targetRole": "Full Stack Developer",
  "skillRatings": {
    "JavaScript": 8,
    "React": 7,
    "Node.js": 6
  },
  "placementTimeline": "3-6 months",
  "expectedCtc": "10-15 LPA",
  "preferredCompanies": ["Google", "Microsoft", "Amazon"]
}
```

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── db.js          # MongoDB connection
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   └── user.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   └── error.middleware.js
│   ├── models/
│   │   └── User.model.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   └── user.routes.js
│   └── server.js          # Entry point
├── .env                   # Environment variables
├── .gitignore
├── package.json
└── README.md
```
