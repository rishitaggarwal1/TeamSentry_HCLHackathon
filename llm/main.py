import joblib
import json
import random
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

app = FastAPI()

# 1. SETUP CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. LOAD THE MODEL (The Brain)
model_filename = "first_aid_model_fixed.pkl"
try:
    with open(model_filename, "rb") as f:
        model = joblib.load(f)
    print(f"✅ Brain loaded: {model_filename}")
except Exception as e:
    print(f"❌ Brain Error: {e}")
    model = None

# 3. LOAD THE ANSWERS (The Book)
# We will read 'intents.json' and convert it into a simple dictionary
answers_filename = "intents.json" 
medical_solutions = {}

try:
    with open(answers_filename, "r", encoding="utf-8") as f:
        data = json.load(f)
        
        # --- NEW LOGIC FOR YOUR SPECIFIC FILE FORMAT ---
        # Your file has a list called "intents". We need to loop through it.
        for intent in data["intents"]:
            tag = intent["tag"]  # e.g., "Cuts"
            
            # Your "responses" is a list. We will join them into one string 
            # or just take the first one.
            response_text = intent["responses"][0] 
            
            # Add to our simple dictionary
            medical_solutions[tag] = response_text
            
    print(f"✅ Book loaded: {answers_filename} ({len(medical_solutions)} topics found)")

except Exception as e:
    print(f"❌ Book Error: {e}")
    print("Hint: Make sure 'intents.json' is in the same folder.")

# 4. DEFINE INPUT
class UserMessage(BaseModel):
    message: str

# 5. THE CHAT ENDPOINT
@app.post("/chat")
def chat_with_bot(user_input: UserMessage):
    if model is None:
        return {"bot_response": "Error: AI Brain is not loaded."}
    
    try:
        # A. Ask the model to classify the topic
        # It returns a list like ['Cuts'], so we take the first item [0]
        prediction_label = model.predict([user_input.message])[0]
        
        # B. Look up the solution in our new dictionary
        advice = medical_solutions.get(prediction_label)
        
        # C. Handle unknown topics (Tags that might be missing from the JSON)
        if advice is None:
            advice = f"I detected the topic '{prediction_label}', but I don't have a prepared response for it yet."

        return {
            "predicted_topic": prediction_label,
            "bot_response": advice
        }

    except Exception as e:
        return {"bot_response": f"Something went wrong: {str(e)}"}
    

# 6. RUN THE SERVER
if __name__ == "__main__":
    
    # This specifically sets the IP to 127.0.0.1 and Port to 8000
    uvicorn.run(app, host="127.0.0.1", port=8000)    