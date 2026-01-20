import os
from dotenv import load_dotenv
from qdrant_client import QdrantClient
from qdrant_client.models import PointStruct
from sentence_transformers import SentenceTransformer
import uuid

load_dotenv()

# 1. Connect
client = QdrantClient(
    url=os.getenv("QDRANT_URL"),
    api_key=os.getenv("QDRANT_API_KEY")
)
model = SentenceTransformer('all-MiniLM-L6-v2')
COLLECTION = "historical_patterns"

# 2. Define Fake History (The "Knowledge Base")
history_data = [
    {
        "text": "Factory fire with black smoke and chemical smell. Solvents present.",
        "payload": {
            "incident_name": "Metro Textile Fire",
            "year": "2022",
            "outcome": "Flashover occurred in 5 mins. Roof collapsed.",
            "action_taken": "Evacuated North Wing immediately. Used foam, not water."
        }
    },
    {
        "text": "Flood waters rising in urban area near river banks. People trapped on rooftops.",
        "payload": {
            "incident_name": "City River Flash Flood",
            "year": "2021",
            "outcome": "Roads blocked by debris. Power grid failed.",
            "action_taken": "Deployed boat teams to Sector 4. Cut power to grid."
        }
    },
    {
        "text": "Chemical leak in industrial zone. Yellow gas cloud visible.",
        "payload": {
            "incident_name": "ChemCorp Gas Leak",
            "year": "2023",
            "outcome": "Toxic cloud drifted South. Respiratory distress reported.",
            "action_taken": "Issued shelter-in-place order. Sealed storm drains."
        }
    }
]

# 3. Insert into Qdrant
print("🌱 Seeding History...")
points = []
for item in history_data:
    # Convert text description to vector
    vector = model.encode(item["text"]).tolist()
    
    # Create Point
    points.append(PointStruct(
        id=str(uuid.uuid4()),
        vector={"text_vec": vector, "image_vec": [0.0]*512}, # Image vec empty for text history
        payload=item["payload"]
    ))

client.upsert(collection_name=COLLECTION, points=points)
print(f"✅ Successfully added {len(points)} past incidents to memory.")