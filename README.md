IRIS is a web-based mission control platform for designing, simulating, and analyzing nanosatellite swarm missions. It combines Three.js + Cesium visualization, real-time solar system statistics, and AI-powered insights (Google Gemini) to help researchers, students, and engineers plan efficient space missions.

✨ Features

🌍 Solar System View

Interactive 3D solar system with planets, orbits, and nanosat swarms.

Ability to center camera and explore interstellar objects.

📊 Mission Metrics & AI Insights

Real-time metrics: delta-V usage, swarm size, mission duration.

AI-powered analysis via Google Gemini for risks, efficiency, and optimization.

🛰️ Trajectory Simulation

Simulate nanosatellite swarm trajectories.

Multiple missions supported side-by-side for comparison.

📡 Ground Station Dashboard

Earth globe with ground stations.

Statistics & charts showing received nanosat data.

🔎 Past Missions Archive

Mission cards with outcomes, stats, and charts.

Visual success/failure indicators (✅ / ❌).

🛠 Mission Planning Control

Create new trajectories with customizable parameters (target, duration, swarm size, delta-V).

AI feasibility check before mission launch.

Tech Stack

Frontend: Next.js (React 18, TypeScript), Three.js, Cesium, Recharts, Lucide Icons

Backend: FastAPI (Python), Google Gemini API (AI insights), NASA / Solar System APIs for live data

Visualization: Three.js for planetary system, Cesium for globe & ground stations

AI Engine: Google Gemini (text analysis + mission insights)

1. Clone the repository
git clone https://github.com/your-username/iris.git
cd iris

2. Backend Setup (FastAPI)

Create a virtual environment:

python -m venv .venv
source .venv/bin/activate   # (Linux/macOS)
.venv\Scripts\activate      # (Windows)


Install dependencies:

pip install -r requirements.txt


Run backend:

uvicorn app.backend.main:app --reload

3. Frontend Setup (Next.js)
cd iris-frontend
npm install
npm run dev


Open the app at http://localhost:3000
 🎉

🔑 Environment Variables

Create a .env file in the backend root with:

GEMINI_API_KEY=your_google_gemini_api_key

And in the frontend root:

NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
