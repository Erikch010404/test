Registration Form (Node + Express + SQLite)

Simple registration form with email/phone validation on client and server, persisting to SQLite.

Requirements
- Node.js 18+

Setup
1. Install dependencies:
```bash
npm install
```
2. Start the server:
```bash
npm start
```
3. Open the app:
- http://localhost:3000

Features
- Fields: first name, last name, email (required), phone (optional), description (optional)
- Client-side validation for email format and phone digits length
- Server-side validation mirrors client checks
- SQLite persistence with unique email constraint
- Recent registrations list

API
- POST `/api/register`
  - Body (JSON): `{ firstName, lastName, email, phone?, description? }`
  - Responses: `201 { id }`, `400 { error }`, `409 { error }` (duplicate email)
- GET `/api/registrations`
  - Returns array of recent registrations

Notes
- Database file: `data.db` in project root
- Adjust port via `PORT` env var if needed


