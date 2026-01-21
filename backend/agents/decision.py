import os
import json
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

class DecisionAgent:
    def __init__(self):
        print("♟️ Strategist: Initializing Decision Engine...")
        
        # DEBUG: Print if key exists (DO NOT print the actual key)
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            print("❌ DECISION ERROR: GROQ_API_KEY is missing in .env!")
            self.client = None
        else:
            print(f"✅ Decision Agent: API Key found (Starts with {api_key[:4]}...)")
            self.client = Groq(api_key=api_key)

    def generate_plan(self, current_desc, risk_data, past_incidents):
        if not self.client:
            return {"error": "Groq Client not initialized. Check GROQ_API_KEY."}

        # 1. Context Construction
        past_context = ""
        for i, inc in enumerate(past_incidents):
            # Safe access to dictionary keys with defaults
            inc_name = inc.get('incident', 'Unknown Event')
            inc_outcome = inc.get('outcome', 'Unknown Outcome')
            inc_action = inc.get('action_taken', 'No action recorded')
            past_context += f"- Event {i+1}: {inc_name} | Outcome: {inc_outcome} | Action: {inc_action}\n"

        prompt = f"""
        You are AURA, an AI Crisis Commander.
        
        CURRENT SITUATION: "{current_desc}"
        RISK LEVEL: {risk_data.get('level', 'UNKNOWN')}
        
        HISTORY:
        {past_context}
        
        TASK: Generate a JSON response plan.
        """

        try:
            # 2. Call Groq
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system", 
                        "content": "You are a crisis AI. You MUST output valid JSON only. No markdown, no conversational text."
                    },
                    {
                        "role": "user", 
                        "content": prompt
                    }
                ],
                # Use the most stable model for Groq
                model="llama-3.3-70b-versatile",
                temperature=0.1,
                response_format={"type": "json_object"}
            )

            # 3. Parse Response
            response_text = chat_completion.choices[0].message.content
            plan = json.loads(response_text)
            return plan

        except Exception as e:
            # CRITICAL: Return the actual error message to the user
            print(f"❌ Groq API Error: {str(e)}")
            return {
                "error": "Groq API Failed", 
                "details": str(e) # This will show us exactly what's wrong
            }

decision_agent = DecisionAgent()