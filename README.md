**env content**:
PORT=5000
MONGODB_URI=mongodb+srv://fathimakh2006_db_user:8VB6l4xER8OqXsqL@cluster0.jcwdejc.mongodb.net/feedbackflow?retryWrites=true&w=majority

# FeedbackFlow — Course Feedback Admin

A custom-built MERN application for reviewing and managing course feedback. The interface and code structure are written for this project; customize the colors, copy, and sample data to make it your own.

## Requirements
- Node.js 18+
- MongoDB Atlas account and a database connection string

## Project structure
- `frontend/` — React + Vite client

- `backend/` — Express API + Mongoose model

## 1. Configure MongoDB Atlas
1. Create a cluster in MongoDB Atlas.
2. Create a database user and allow your development IP in **Network Access**.
3. Copy the Node.js connection string.
4. Open `backend/.env` and replace the placeholder `MONGODB_URI` value with your connection string. Do not commit real credentials to a public repository.

## 2. Start the backend
```bash
cd backend
npm install
npm run dev
```
The API runs at `http://localhost:5000`. Health check: `http://localhost:5000/api/health`.

## 3. Start the frontend
Open another terminal:
```bash
cd frontend
npm install
npm run dev
```
Open the local URL printed by Vite (usually `http://localhost:5173`).

## Features
- Dashboard with course ID, course name, duration, and average feedback rating
- Add feedback with course name, comments, rating, and duration
- Edit an existing feedback entry
- Delete an entry after confirmation
- Responsive desktop/mobile layout
- Express REST API with MongoDB persistence
- Friendly loading, empty, and error states

## Notes
- The dashboard's displayed rating is calculated from the feedback entries for each course.
- A course duration field is included in the form because it is displayed on the dashboard.
- The `.env` file contains a placeholder only. A real Atlas URI is required for database access.
