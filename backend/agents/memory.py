import os
from dotenv import load_dotenv
from qdrant_client import QdrantClient
from sentence_transformers import SentenceTransformer

load_dotenv()

class MemoryAgent:
    def __init__(self):
        print("🧠 Memory Agent: Connecting to Knowledge Base...")
        
        # 1. Connect to Qdrant Cloud
        self.client = QdrantClient(
            url=os.getenv("QDRANT_URL"),
            api_key=os.getenv("QDRANT_API_KEY")
        )
        
        # 2. Load Text Model
        self.text_model = SentenceTransformer('all-MiniLM-L6-v2')
        print("✅ Memory Agent: Ready to recall.")

    def recall_patterns(self, query_text, limit=3):
        """
        Input: Description of current event
        Output: Top 3 similar past events from Qdrant
        """
        try:
            print(f"🧠 Thinking: Searching for '{query_text}'...")
            
            # 1. Turn query text into a vector
            query_vector = self.text_model.encode(query_text).tolist()
            
            # 2. Search Qdrant using the Modern API (v1.10+)
            # Note: We use 'query' instead of 'query_vector'
            # We use 'using' to specify the named vector 'text_vec'
            search_result = self.client.query_points(
                collection_name="historical_patterns",
                query=query_vector,      # <--- CORRECT ARGUMENT FOR v1.16
                using="text_vec",        # <--- TARGETS THE TEXT VECTOR
                limit=limit,
                with_payload=True
            )
            
            # 3. Format the results
            # The new API returns an object with a .points attribute
            results = []
            for hit in search_result.points:
                results.append({
                    "score": round(hit.score, 2),
                    "incident": hit.payload.get("incident_name", "Unknown"),
                    "year": hit.payload.get("year", "N/A"),
                    "outcome": hit.payload.get("outcome", "No data"),
                    "action_taken": hit.payload.get("action_taken", "N/A")
                })
            
            print(f"✅ Found {len(results)} matches.")
            return results

        except Exception as e:
            print(f"❌ Memory Error: {e}")
            return []

# Singleton
memory_agent = MemoryAgent()