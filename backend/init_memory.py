import os
from dotenv import load_dotenv
from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance

# 1. Load your cloud secrets
load_dotenv()

QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")

if not QDRANT_URL:
    print("❌ Error: .env file is missing or empty! Check Step 3.")
    exit()

print("🔌 Connecting to Qdrant Cloud...")
client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)

def setup_cloud_memory():
    # We define the 3 core memory banks
    collections = ["live_intel", "historical_patterns", "action_outcomes"]
    
    for name in collections:
        # Check if exists, if not create
        if not client.collection_exists(name):
            print(f"Creating memory bank: {name}...")
            client.create_collection(
                collection_name=name,
                vectors_config={
                    # We use "Named Vectors" to store BOTH Text and Image vectors in one point
                    "text_vec": VectorParams(size=384, distance=Distance.COSINE),  # For Reports/Audio Text
                    "image_vec": VectorParams(size=512, distance=Distance.COSINE)  # For Drone Images (CLIP)
                }
            )
            print(f"✅ {name} created successfully.")
        else:
            print(f"⚠️ {name} already exists. Skipping.")

if __name__ == "__main__":
    setup_cloud_memory()
    print("\n🎉 Aura Infrastructure Ready: All Agents have memory access.")