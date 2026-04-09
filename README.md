# trackED

Full-stack student learning dashboard with separate admin and student experiences, AI-assisted assignment review, dynamic analytics, and course resource management.

## What It Does

- Role-based login for admins and students
- Student dashboard with course progress, average score, assignment review score, and submission coverage
- Admin dashboard with students, courses, analytics, and resource management
- AI instructor chat powered by Groq plus retrieved course material from MongoDB
- Assignment review upload inside chat with rubric-based evaluation and predictive grading
- Assignment review history stored in MongoDB
- Dynamic knowledge gap map built from persisted assignment review topic tags and review feedback
- Course resource uploads categorized as `Assignment` or `Study Material`
- Progress formula based on coursework, assignment review quality, and submission coverage

## Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB
- AI: Groq API
- Uploads: Multer

## Project Structure

```text
llm-project/
├── README.md
└── llm project/
    ├── backend/
    │   ├── .env
    │   ├── index.js
    │   ├── package.json
    │   ├── uploads/
    │   └── inspect_*.js
    └── frontend/
        ├── package.json
        ├── vite.config.js
        ├── index.html
        └── src/
            ├── App.jsx
            ├── components/
            └── pages/
```

## Setup

### 1. Install backend dependencies

```bash
cd "llm project/backend"
npm install
```

### 2. Install frontend dependencies

```bash
cd "../frontend"
npm install
```

### 3. Configure environment

Create or update:

`llm project/backend/.env`

```env
GROQ_API_KEY=your_groq_api_key_here
```

The backend reads the Groq key from this `.env` file.

## Running the App

### Terminal 1: backend

```bash
cd "llm project/backend"
npm run dev
```

Backend runs on `http://localhost:4000`

### Terminal 2: frontend

```bash
cd "llm project/frontend"
npm run dev
```

Frontend runs on the Vite dev server, typically `http://localhost:5173`

## Main Features

### Student side

- Login as student using a student identifier present in MongoDB
- View per-course progress
- See average coursework score
- See assignment review score and submission coverage
- Use AI instructor chat
- Upload assignments for AI review directly in chat
- Browse course resources

### Admin side

- Login as super admin or course-specific admin
- View student table with progress and performance breakdown
- View course list and course-level completion
- Use analytics dashboard with active students, average mastery, and dynamic knowledge gap map
- Upload and delete course resources
- Tag uploaded resources as `Assignment` or `Study Material`

## Progress Calculation

Student progress is calculated per course using:

- `30% coursework score`
- `40% assignment review score`
- `30% submission coverage`

Where:

- `coursework score` = average of student `score` values in `Student_details`
- `assignment review score` = average predictive grade from stored assignment reviews for that student and course
- `submission coverage` = reviewed assignments / expected assignments for that course

If a course has no assignment resources configured yet, submission coverage is treated as `100%`.

## Knowledge Gap Map

The analytics gap map is dynamic.

It is calculated by:

1. Reading stored assignment reviews from MongoDB
2. Using explicit `topicTags` returned during AI assignment grading
3. Falling back to review `gaps` and `improvements` text when needed
4. Weighting weak reviews more heavily using `100 - predictedPercentage`
5. Aggregating repeated weak topics across reviews
6. Returning the lowest-mastery recurring topics

If there is not enough review-topic data yet, the backend falls back to broader course-metric gaps.

## Resource Types

Admin uploads can now be marked as:

- `Study Material`
- `Assignment`

This classification is used by:

- the admin resource list
- the student resource list
- submission coverage in the progress formula

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/login` | Admin or student login |
| GET | `/api/resources` | List resources |
| POST | `/api/resources` | Upload resource |
| DELETE | `/api/resources/:id` | Delete resource |
| GET | `/api/courses` | List courses with stats |
| POST | `/api/courses` | Create course |
| GET | `/api/students` | List student summaries |
| GET | `/api/analytics` | Analytics dashboard data |
| POST | `/api/chat` | AI instructor chat |
| POST | `/api/chat/evaluate-assignment` | Upload assignment for AI review |
| GET | `/api/assignments/history` | Fetch stored assignment review history |

## Notes

- Assignment reviews are stored in MongoDB collection `Assignment_reviews`
- Resources are stored in MongoDB collection `Resources`
- Student performance data comes from MongoDB collection `Student_details`
- Course material used for retrieval comes from MongoDB collection `ML_DATA`
- Some course metadata is still held in memory inside the backend

## Current Limitations

- Assignment review upload currently supports text/code-style files, not full PDF parsing
- Course metadata is not fully persisted yet
- Admin-side "Chat AI" action in the students table is still disabled
- The MongoDB URI is still hardcoded in the backend and should ideally be moved to `.env` too
