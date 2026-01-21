import os
import shutil
import uuid
import time
from typing import List, Any
from dotenv import load_dotenv

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from qdrant_client import QdrantClient
from qdrant_client.models import PointStruct

# --- AGENT IMPORTS ---
from agents.perception import perception_agent  # Agent 1
from agents.memory import memory_agent          # Agent 2
from agents.risk import risk_agent              # Agent 3
from agents.decision import decision_agent
from agents.explain import explain_agent

# Load Secrets
load_dotenv()

app = FastAPI(title="Aura-MAS Command Center")

# Connect to Qdrant Cloud (Global Connection)
client = QdrantClient(
    url=os.getenv("QDRANT_URL"),
    api_key=os.getenv("QDRANT_API_KEY")
)

# Constants
COLLECTION_NAME = "live_intel"

# --- DATA MODELS ---
class RiskInput(BaseModel):
    similar_incidents: List[Any]  # Expects the list returned by Agent 2

class DecisionInput(BaseModel):
    current_description: str
    risk_data: dict
    past_incidents: List[Any]

class ExplainInput(BaseModel):
    plan: dict
    risk_data: dict
    past_incidents: List[Any]

# --- SYSTEM HEALTH CHECK ---
@app.get("/")
def health_check():
    return {"status": "Aura System Online", "agents_active": 3}

# --- ENDPOINT 1: INGEST INTEL (Uses Perception Agent) ---
@app.post("/ingest")
async def ingest_intel(
    file: UploadFile = File(...), 
    type: str = Form(...), # "audio" or "image"
    location: str = Form(...) 
):
    """
    Receives raw files, processes them via Perception Agent, 
    and saves them to Qdrant Memory.
    """
    
    # 1. Save file temporarily (Perception needs a file path)
    temp_filename = f"temp_{file.filename}"
    with open(temp_filename, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        # 2. Pass to Perception Agent
        processed_data = None
        
        if type == "image":
            # For images, we can pass the file path directly to Pillow inside the agent
            processed_data = perception_agent.process_image(temp_filename)
            
            # Prepare Vector Structure (Named Vectors)
            # Image goes to 'image_vec', Text is dummy (zeros)
            vector_struct = {
                "image_vec": processed_data["vector"],
                "text_vec": [0.0] * 384 # Empty text vector
            }
            
        elif type == "audio":
            processed_data = perception_agent.process_audio(temp_filename)
            
            # Prepare Vector Structure
            # Text goes to 'text_vec', Image is dummy
            vector_struct = {
                "image_vec": [0.0] * 512, # Empty image vector
                "text_vec": processed_data["vector"]
            }

        if not processed_data:
            raise HTTPException(status_code=500, detail="Agent failed to process file")

        # 3. Store in Qdrant (The Memory Step)
        point_id = str(uuid.uuid4())
        
        client.upsert(
            collection_name=COLLECTION_NAME,
            points=[
                PointStruct(
                    id=point_id,
                    vector=vector_struct,
                    payload={
                        "type": type,
                        "description": processed_data["description"],
                        "location": location,
                        "timestamp": time.time(),
                        "processed_by": "PerceptionAgent_v1"
                    }
                )
            ]
        )
        
        return {
            "status": "success", 
            "id": point_id, 
            "intel": processed_data["description"]
        }

    except Exception as e:
        return {"status": "error", "message": str(e)}
        
    finally:
        # Cleanup temp file
        if os.path.exists(temp_filename):
            os.remove(temp_filename)

# --- ENDPOINT 2: RECALL PATTERNS (Uses Memory Agent) ---
@app.get("/agent/memory")
def search_memory(query: str):
    """
    Search for similar past incidents based on a text query.
    Example Query: "Fire with chemical smell"
    """
    results = memory_agent.recall_patterns(query)
    
    if not results:
        return {"status": "no_matches", "data": []}
    
    return {"status": "success", "data": results}

# --- ENDPOINT 3: RISK ASSESSMENT (Uses Risk Agent) ---
@app.post("/agent/risk")
def assess_risk(data: RiskInput):
    """
    Takes the output of Agent 2 (Past Incidents) and calculates Risk Level.
    """
    assessment = risk_agent.assess_risk(data.similar_incidents)
    return {"status": "success", "data": assessment}

# --- ENDPOINT 4: DECISION SUPPORT (Uses Groq) ---
@app.post("/agent/decision")
def make_decision(data: DecisionInput):
    """
    Synthesizes Intel + Risk + Memory to generate an Action Plan.
    """
    plan = decision_agent.generate_plan(
        data.current_description,
        data.risk_data,
        data.past_incidents
    )
    return {"status": "success", "data": plan}

# --- ENDPOINT 5: EXPLAINABILITY (Uses Groq) ---
@app.post("/agent/explain")
def explain_logic(data: ExplainInput):
    """
    Returns the 'Why' behind the decision.
    """
    explanation = explain_agent.explain_decision(
        data.plan,
        data.risk_data,
        data.past_incidents
    )
    return {"status": "success", "data": explanation}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)