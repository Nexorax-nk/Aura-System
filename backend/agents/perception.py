import os
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
from PIL import Image
import openai

# Load environment variables
load_dotenv()

# Check for OpenAI Key (Needed for Audio Transcription)
openai.api_key = os.getenv("OPENAI_API_KEY")

class PerceptionAgent:
    def __init__(self):
        print("👀 Perception Agent: Loading AI Models... (This might take a moment)")
        
        # 1. Load Image Model (CLIP) - Converts Images to Vectors (Size 512)
        # We use a smaller, faster version of CLIP for hackathons
        self.image_model = SentenceTransformer('clip-ViT-B-32')
        
        # 2. Load Text Model - Converts Text to Vectors (Size 384)
        # This handles the text from audio transcripts or written reports
        self.text_model = SentenceTransformer('all-MiniLM-L6-v2')
        
        print("✅ Perception Agent: Models Loaded & Ready.")

    def process_image(self, image_file):
        """
        Input: Raw Image File
        Output: Vector (512 floats) + Description
        """
        try:
            # Open image using Pillow
            img = Image.open(image_file)
            
            # Generate Embedding (Vector)
            # This turns the visual content into numbers
            vector = self.image_model.encode(img).tolist()
            
            return {
                "vector": vector,
                "description": "Drone surveillance feed (Visual Data)",
                "modality": "image"
            }
        except Exception as e:
            print(f"❌ Image Processing Error: {e}")
            return None

    def process_audio(self, audio_file_path):
        """
        Input: Path to Audio File
        Output: Vector (384 floats) + Transcript text
        """
        try:
            # 1. Transcribe Audio (Voice -> Text) using OpenAI Whisper
            # Note: For hackathon speed, we use OpenAI API. 
            # If no key, we return a mock string for testing.
            
            if not openai.api_key:
                print("⚠️ No OpenAI Key found. Using Mock Transcription.")
                transcript = "Emergency reported. Heavy smoke detected in Sector 4. Chemical smell present."
            else:
                with open(audio_file_path, "rb") as audio:
                    response = openai.Audio.transcribe("whisper-1", audio)
                    transcript = response["text"]
            
            # 2. Convert Transcript -> Vector
            vector = self.text_model.encode(transcript).tolist()
            
            return {
                "vector": vector,
                "description": transcript,  # The actual text content
                "modality": "audio"
            }
            
        except Exception as e:
            print(f"❌ Audio Processing Error: {e}")
            return None

# Singleton Instance (so we don't reload models every request)
perception_agent = PerceptionAgent()