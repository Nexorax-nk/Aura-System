class RiskAgent:
    def __init__(self):
        print("🛡️ Risk Agent: Safety Protocols Loaded.")
        
        # Keywords that indicate danger in past records
        self.danger_signals = [
            "collapse", "casualty", "casualties", "toxic", "explosion", 
            "flashover", "fatality", "critical", "failure"
        ]

    def assess_risk(self, similar_incidents):
        """
        Input: List of similar past incidents (from Memory Agent)
        Output: Risk Level (LOW/MEDIUM/HIGH) + Confidence
        """
        if not similar_incidents:
            return {"level": "UNKNOWN", "score": 0.0, "reason": "No historical data found"}

        risk_score = 0
        total_incidents = len(similar_incidents)
        reasons = []

        # Analyze each past incident
        for incident in similar_incidents:
            outcome = incident.get("outcome", "").lower()
            match_score = incident.get("score", 0) # How similar was it? (e.g. 0.89)

            # Check for danger keywords in the outcome
            found_danger = False
            for word in self.danger_signals:
                if word in outcome:
                    found_danger = True
                    # If a very similar past event was dangerous, Risk goes UP
                    risk_score += (10 * match_score) 
                    reasons.append(f"Past event '{incident['incident']}' had outcome: {word}")
                    break
            
            if not found_danger:
                risk_score += (2 * match_score) # Minor risk increase for any incident

        # Normalize Score (0 to 10 scale approx)
        final_score = min(risk_score, 10) / 10.0  # Cap at 1.0 (100%)
        
        # Determine Level
        if final_score > 0.7:
            level = "CRITICAL"
        elif final_score > 0.4:
            level = "HIGH"
        elif final_score > 0.2:
            level = "MEDIUM"
        else:
            level = "LOW"

        return {
            "level": level,
            "score": round(final_score, 2),
            "flagged_factors": reasons[:2] # Show top 2 reasons
        }

# Singleton
risk_agent = RiskAgent()