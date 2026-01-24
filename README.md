# AURA: AI-Powered Urban Risk Analysis

**"Turning Dead Data into Live Intelligence."** AURA is a Multi-Agent Crisis Command OS that transforms sensor data (Audio/Visual) into actionable strategic plans using Vector Memory and Large Language Models.

---

## 🚨 The Problem

In the critical moments of a crisis (structural failure, fire, security breach), **Institutional Memory Loss kills**. Organizations have vast archives of safety protocols and past incident reports, but this data is fragmented and unsearchable in real-time. Human operators waste valuable seconds manually retrieving context while the disaster unfolds.

---

## ⚡ The Solution

**AURA (AI-Powered Urban Risk Analysis)** is a "Glass-Box" decision support system that:

- **Perceives**: Ingests raw audio/visual streams from the field.
- **Remembers**: Uses Qdrant vector search to instantly retrieve historically similar incidents.
- **Reasons**: Uses LLM Agents to synthesize current threats with historical data.
- **Visualizes**: Renders the threat on a 3D Cinematic Digital Twin of the city.

---

## 🛠️ Technology Stack

### Frontend (The Interface)
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS v4 (Glassmorphism & Neon UI)
- **Maps**: MapLibre GL + MapTiler (3D Building Extrusions)
- **Motion**: Framer Motion (Animations)

### Backend (The Brain)
- **API**: Python FastAPI
- **Vector Database**: Qdrant (The core of Institutional Memory)
- **LLM Inference**: Groq API (Llama-3 70B Versatile)
- **Orchestration**: LangChain / Custom Agent Swarm

---

## 🧠 System Architecture

AURA operates as a **Multi-Agent System (MAS)**:

### Perception Agent:
- **Role**: Transcribes audio (Whisper) and describes images (Vision Transformer).
- **Output**: Semantically rich text descriptions.

### Memory Agent (Qdrant):
- **Role**: Performs Semantic Search (RAG) to find past incidents that "sound" or "look" like the current threat.
- **Tech**: Cosine Similarity Search.

### Risk Agent:
- **Role**: Calculates a dynamic Risk Score (0-100%) based on the fusion of live data + historical precedent.

### Decision Agent:
- **Role**: Acts as the "Crisis Commander." Generates a step-by-step immediate action plan (e.g., "Evacuate Sector 4").

### Explainability Agent:
- **Role**: The "Trust Layer." Generates a natural language explanation of why the plan was chosen.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- Qdrant Instance (Docker or Cloud)
- MapTiler API Key

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/aura-crisis-os.git
cd aura-crisis-os
```

### 2. Setup Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create a .env file
echo "GROQ_API_KEY=your_key_here" > .env
echo "QDRANT_URL=your_url_here" >> .env
echo "QDRANT_API_KEY=your_key_here" >> .env

# Run the API
python main.py
```

### 3. Setup Frontend
```bash
cd frontend
npm install

# Add your MapTiler Key in components/MapView.tsx
# const API_KEY = 'YOUR_KEY_HERE';

# Run the Dashboard
npm run dev
```

### 4. Access the OS
Open `http://localhost:3000` in your browser.

---

## 🎮 Demo Mode (Hackathon Simulation)

For demonstration purposes, the frontend includes a **Robust Simulation Mode** that functions without a live backend connection.

- Click **Upload Audio** to simulate a "Structural Failure" scenario (Critical Alert).
- Click **Upload Visual** to simulate a "Thermal Fracture" scenario (High Alert).
- Experience the **Cinematic Camera Swoop** and **Voice Alerts**.

---

## 🏆 Why Qdrant? (The Critical Piece)

AURA relies on Qdrant because traditional SQL databases cannot understand "context."

- **Semantic Search**: If a sensor hears a "rumble," Qdrant finds reports of "concrete groaning" because it understands the *meaning*, not just keywords.
- **Multimodal Fusion**: We map Audio, Visual, and Text data into the same vector space, allowing for true cross-modal reasoning.
- **Speed**: Qdrant's HNSW index allows us to query millions of historical records in milliseconds, enabling real-time decision support.

---

## 🗺️ Roadmap

- [ ] **IoT Integration**: Live WebSocket connection to structural sensors.
- [ ] **Drone Autonomy**: Auto-dispatch drones to the coordinates identified by the Risk Agent.
- [ ] **Crowd Simulation**: Predict evacuation bottlenecks using real-time foot traffic data.

---

*AURA - Turning Dead Data into Live Intelligence*
