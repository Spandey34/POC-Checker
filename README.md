# POC Checker — NIT Jamshedpur

A full-stack web portal for verifying company Points of Contact (POCs) across branches at NIT JSR.

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18, Vite, Tailwind CSS        |
| Backend    | Node.js, Express                    |
| Database   | MongoDB (Mongoose)                  |
| Auth       | Clerk (JWT-based)                   |
| Deployment | Any Node host + MongoDB Atlas       |

---

## Folder Structure

```
poc-checker/
├── backend/
│   ├── src/
│   │   ├── config/         # DB connection
│   │   ├── models/         # Mongoose schemas (User, POC)
│   │   ├── middleware/     # auth, isAdmin, isVerified
│   │   ├── controllers/    # Route handlers (thin layer)
│   │   ├── services/       # Business logic (fat layer)
│   │   ├── routes/         # Express routers
│   │   ├── app.js          # Express app setup
│   │   └── server.js       # Entry point
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── config/         # Constants, branch colors
    │   ├── services/       # Axios calls (api, userService, pocService)
    │   ├── context/        # UserContext (MongoDB user state)
    │   ├── hooks/          # Custom hooks
    │   ├── components/
    │   │   ├── layout/     # Navbar
    │   │   ├── common/     # Modal, Badge, Spinner, ConfirmDialog
    │   │   ├── admin/      # POCForm, POCTable, UserTable, AdminSearch
    │   │   └── user/       # UserSearch
    │   ├── pages/          # LoginPage, AdminDashboard, UserDashboard, Pending, 404
    │   └── routes/         # ProtectedRoute, AdminRoute
    ├── package.json
    └── .env.example
```

---

## Setup Guide

### 1. Clerk Setup

1. Create a project at [clerk.com](https://clerk.com)
2. In **Clerk Dashboard → Settings → Restrictions → Allowlist**, add `*@nitjsr.ac.in` to restrict sign-ups
3. In **Webhooks**, create a new endpoint pointing to:  
   `https://your-backend.com/api/webhooks/clerk`  
   Subscribe to events: `user.created`, `user.updated`
4. Copy your keys

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
# Fill in .env:
#   MONGODB_URI      → your MongoDB connection string
#   CLERK_SECRET_KEY → from Clerk dashboard
#   CLERK_WEBHOOK_SECRET → from Clerk webhook settings
#   ADMIN_EMAIL      → your NIT JSR admin email (e.g. tnp@nitjsr.ac.in)
#   CLIENT_URL       → frontend URL (http://localhost:5173 for dev)

npm install
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
cp .env.example .env
# Fill in .env:
#   VITE_CLERK_PUBLISHABLE_KEY → from Clerk dashboard
#   VITE_API_URL               → backend URL (http://localhost:5000/api for dev)

npm install
npm run dev
```

---

## How It Works

### Auth Flow
1. User signs up via Clerk with `@nitjsr.ac.in` email
2. Clerk webhook → backend creates MongoDB user (`isVerified: false`)
3. If email matches `ADMIN_EMAIL` → role set to `admin`, `isVerified: true`
4. Admin logs in → full admin dashboard
5. Regular user → sees "Pending" page until admin verifies them

### User Roles

| Role  | Access                                              |
|-------|-----------------------------------------------------|
| Admin | Full CRUD on POCs, user management, alias search    |
| User  | Exact-name POC search only (no shortcuts)           |

### POC Search Rules

| Role  | Search Type                                         |
|-------|-----------------------------------------------------|
| Admin | Partial match on name OR any alias (e.g. "mmt")    |
| User  | Exact company name only, case-insensitive            |

### Branches Supported
`CSE`, `ECE`, `MME`, `ECM`, `PIE`, `Mech`, `Civil`

---

## API Reference

### Public
| Method | Endpoint             | Description       |
|--------|----------------------|-------------------|
| GET    | /api/pocs/branches   | List all branches |

### Authenticated (any logged-in user)
| Method | Endpoint             | Description               |
|--------|----------------------|---------------------------|
| GET    | /api/users/me        | Get current user profile  |
| GET    | /api/pocs/search?q=  | Exact-name POC search     |

### Admin Only
| Method | Endpoint                      | Description              |
|--------|-------------------------------|--------------------------|
| GET    | /api/users                    | List all users           |
| PATCH  | /api/users/:id/toggle-verify  | Toggle verification      |
| GET    | /api/pocs                     | List all POCs            |
| GET    | /api/pocs/admin-search?q=     | Alias-aware search       |
| POST   | /api/pocs                     | Add new POC              |
| PUT    | /api/pocs/:id                 | Update POC               |
| DELETE | /api/pocs/:id                 | Remove POC               |

### Webhooks (Clerk → Backend)
| Method | Endpoint                | Description          |
|--------|-------------------------|----------------------|
| POST   | /api/webhooks/clerk     | Sync user from Clerk |

---

## SOLID Principles Applied

| Principle             | Where                                                                 |
|-----------------------|-----------------------------------------------------------------------|
| Single Responsibility | Controllers are thin; business logic lives in Services                |
| Open/Closed           | Middleware chain (auth → isAdmin → isVerified) is composable          |
| Liskov Substitution   | Services expose consistent interfaces; swappable with alternate DBs   |
| Interface Segregation | Routes expose only what each role needs (user vs admin endpoints)     |
| Dependency Inversion  | Controllers depend on service abstractions, not Mongoose models directly |

---

## Local Development Tips

- Use [ngrok](https://ngrok.com/) to expose your local backend for Clerk webhooks during development:
  ```bash
  ngrok http 5000
  # Copy the HTTPS URL → paste into Clerk webhook endpoint
  ```
- The first user whose email matches `ADMIN_EMAIL` is auto-promoted to admin on sign-up
- "Online" status = last visit within 5 minutes
