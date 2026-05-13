# Prepzo - AI Career Platform (2211981122, 2211981123, 2211981126, 2211981151) 🚀

## 📄 Project Details
**Project Title:** Prepzo - AI Career Platform
**Type:** [Research / Copyright / Patent]
**Roll Numbers & Names:** 
- 2211981122: Ayush Soni
- 2211981123: Barsan Bera
- 2211981126: Bhaskar
- 2211981151: Dushant
**Current Status:** Completed

---



Prepzo is a next-generation, AI-powered career platform designed exclusively for students. It simulates real-world placement environments through deep technical diagnostics, comprehensive adaptive assessments, AI-driven behavioral mentoring, and real-time proctoring. Prepzo bridges the gap between academic learning and industry expectations.

## 🌟 Key Features

### 1. Autonomous AI Assessment Engine
*   **Adaptive Testing**: Generates completely unique tests using the Groq AI API (llama-3.1), adapting difficulty dynamically based on the student's ongoing performance.
*   **Two-Stage Pipeline**: 
    *   **Stage 1 - Field Core**: 60 localized questions assessing broad theoretical and practical knowledge in the student's field of study.
    *   **Stage 2 - Skill Depth**: Targeted deep-dive questions based on the student's specific known technologies and skills.
*   **Intelligent Autonomous Seeding**: Features a background continuous-seeding engine that populates MongoDB with millions of unique questions, ensuring zero repetition while handling API rate-limit bottlenecks.

### 2. Proctored Testing Environment
*   **Real-time Sensor Integrity**: Strict, automated proctoring capturing video, audio, and screen-sharing context.
*   **Violation Tracking**: Capable of detecting and registering critical integrity failures such as tab-switching, keyboard shortcuts (copy/paste), screen-sharing disconnects, and background noise.

### 3. AI Behavioral Mentor & Coach
*   *An intelligent chatbot and mentor available directly on the dashboard.*
*   Helps students refine their career goals, unpack technical concepts using varied difficulty paradigms, and perform mock "stress" interviews for specific companies.

### 4. Smart Career Dashboard
*   **Diagnostics & Matrix Signals**: Unpacks precise telemetry of where a student has skill gaps.
*   **Cooldown System**: Enforces a timed 3-day cooldown parameter between core assessment attempts to accurately gauge real skill progression over time.

---

## 📸 Screenshots

*(Replace the placeholder links below with your actual image paths once uploaded to GitHub or your host)*

### Student Command Center (Dashboard)
![Dashboard Demo](docs/screenshots/dashboard.png)

### Real-Time Live Assessment 
![Assessment Mode](docs/screenshots/assessment.png)

### AI Mentor Interaction
![AI Mentor](docs/screenshots/mentor.png)

---

## 🛠️ Technology Stack

**Frontend Ecosystem:**
*   React.js 18 (Vite)
*   TypeScript
*   Tailwind CSS (with Glassmorphism & Framer Motion for deep animations)
*   Zustand (State Management)

**Backend Microservices:**
*   **Core API**: Node.js & Express.js
*   **AI Service**: Python & FastAPI (LangGraph orchestration)
*   **Database**: MongoDB (Mongoose)

**AI Integrations:**
*   **Groq API**: High-speed LLM inference layer (llama-3.1-70b-versatile, gemma2-9b-it).

---

## ⚙️ Getting Started

### Prerequisites
*   Node.js (v18+)
*   Python (3.10+)
*   MongoDB (v6+)

### 1. Clone the Repository
```bash
git clone https://github.com/ayushsoni05/Prepzo-Ai-Carrer-Platform.git
cd Prepzo-Ai-Carrer-Platform
```

### 2. Set Up the Node.js Backend
```bash
cd backend
npm install
# Add .env variables (MONGO_URI, JWT_SECRET)
npm run dev
```

### 3. Set Up the Python AI Service
```bash
cd ai-service
pip install -r requirements.txt
# Add .env variables (GROQ_API_KEY)
uvicorn app.main:app --reload
```

### 4. Run the React Frontend
```bash
cd frontend
npm install
npm run dev
```
Navigate to `http://localhost:5173` to access the application.

## 🛡️ Security Protocol
*   Strict JWT HTTP-only cookies to enforce secure session management.
*   CORS policies whitelist domains exclusively to the frontend host.
*   Automated Pydantic schema validation inside the AI interface ensures malicious payloads cannot execute logic errors on inference endpoints.

## 📄 License
This project is proprietary and confidential.
