import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

# Initialize Gemini
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# List available models
try:
    models = client.models.list_models()
    print("Available models:")
    for model in models:
        print(f"- {model.name}")
except Exception as e:
    print(f"Error listing models: {e}")
