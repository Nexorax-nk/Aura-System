import os
import json
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

class ExplainabilityAgent:
    def __init__(self):
        print("🔍 Explainability Agent: Loaded transparency protocols.")
        
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            print("❌ EXPLAIN ERROR: GROQ_API_KEY is missing.")
            self.client = None
        else:
            self.client = Groq(api_key=api_key)

    def explain_decision(self, plan, risk_data, past_incidents):
        """
        Generates a natural language explanation for the strategic plan.
        """
        # Fallback if Groq is down
        if not self.client:
            return {
                "summary": "AI rationale unavailable (API Key missing).",
                "citations": ["Reference to historical data unavailable."]
            }

        # 1. Summarize History for the prompt
        evidence_summary = ""
        for inc in past_incidents:
            evidence_summary += f"- {inc.get('incident')} (Outcome: {inc.get('outcome')})\n"

        prompt = f"""
        You are the Transparency Officer for an AI Crisis System.
        
        THE DECISION PLAN: {json.dumps(plan)}
        THE RISK ASSESSMENT: Level {risk_data.get('level')} (Score {risk_data.get('score')})
        THE EVIDENCE (Past Events):
        {evidence_summary}
        
        TASK:
        Write a concise, 2-sentence explanation of WHY this plan was recommended. 
        Explicitly cite the past events as the reason.
        
        OUTPUT FORMAT (JSON):
        {{
            "narrative": "Recommended X because in the [Year] [Event Name], Y happened...",
            "confidence_reasoning": "High confidence due to 90% match with past data."
        }}
        """

        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": "You provide clear, evidence-based reasoning. Output JSON only."},
                    {"role": "user", "content": prompt}
                ],
                model="llama-3.3-70b-versatile", # Using the working model
                temperature=0.3,
                response_format={"type": "json_object"}
            )

            return json.loads(chat_completion.choices[0].message.content)

        except Exception as e:
            print(f"❌ Explanation Error: {e}")
            # Robust Fallback - If AI fails, return a template
            return {
                "narrative": f"Plan generated based on {risk_data.get('level')} risk factors and {len(past_incidents)} similar historical records.",
                "confidence_reasoning": "Fallback explanation due to API error."
            }

explain_agent = ExplainabilityAgent()