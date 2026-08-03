# Admin Panel — Express Backend

## Setup

```bash
cd backend
npm install
```

## Environment Variables

Create a `.env` file (already included):
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/admin-panel
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

## Run

```bash
# Development
npm run dev

# Production
npm start
```

## Migrate JSON data to MongoDB (ONE TIME ONLY)

```bash
npm run migrate
```

## API Endpoints

| Method | Endpoint | Auth |
|--------|----------|------|
| POST | /api/auth/login | No |
| GET | /api/auth/me | Yes |
| GET | /api/products | No |
| POST | /api/products | Yes |
| PUT | /api/products/:id | Yes |
| DELETE | /api/products/:id | Yes |
| GET | /api/categories | No |
| POST | /api/categories | Yes |
| PUT | /api/categories/:id | Yes |
| DELETE | /api/categories/:id | Yes |
| GET | /api/cms | No |
| POST | /api/cms | Yes |
| GET | /api/roles | Yes |
| POST | /api/roles | Admin only |
| GET | /api/admins | Admin only |
| POST | /api/admins | Admin only |
| GET | /api/settings | No |
| POST | /api/settings | Admin only |
| GET | /api/inquiries | Yes |
| POST | /api/inquiries | No |
| POST | /api/upload | Yes |
