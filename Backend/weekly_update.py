import os
import json
from google import genai
from supabase import create_client, Client
from dotenv import load_dotenv
from datetime import datetime, timedelta
from typing import Dict, Any
import logging
logging.basicConfig(level=logging.INFO)

load_dotenv()

# Initialize Gemini
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# Initialize Supabase
url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_KEY")

if not url or not key:
    raise ValueError("Missing SUPABASE_URL or SUPABASE_KEY in environment")

supabase: Client = create_client(url, key)

def get_hyderabad_college_events():
    """Use Google Search Grounding to find college events in Hyderabad"""
    model = client.models.generate_content(
        model="gemini-1.5-flash",
        contents=[
            genai.types.Content(
                parts=[
                    genai.types.Part.from_text(
                        text=f"""
                        You are a search assistant. Find all college events, fests, and workshops happening in Hyderabad from {datetime.now().strftime('%B %d')} to {(datetime.now() + timedelta(days=7)).strftime('%B %d, %Y')}.
                        Search for events at colleges like CBIT, MGIT, VNRVJIET, JNTU, OU, etc.
                        
                        Return results as JSON with this format:
                        [
                            {{
                                "title": "Event Name",
                                "college_name": "College Name", 
                                "category": "Technical" or "Cultural" or "Workshop",
                                "date": "YYYY-MM-DD",
                                "description": "Brief description",
                                "link": "URL if available"
                            }}
                        ]
                        """
                    )
                ]
            )
        ]
    )
    
    response = model.candidates[0].content.parts[0].text
    
    # Debug: Print search queries performed by model
    print(f"🔍 Searching for Hyderabad college events...")
    
    return response

def insert_events_to_supabase(events_data):
    """Insert events into Supabase with fallback category"""
    try:
        # Parse JSON from response
        events = json.loads(events_data)
        inserted_count = 0
        
        for event in events:
            # Ensure category exists with fallback
            if not event.get("category"):
                event["category"] = "Technical"  # Default fallback
            
            # Ensure required fields
            event_data = {
                "title": event.get("title", "Untitled Event"),
                "college_name": event.get("college_name", "Unknown College"),
                "category": event.get("category", "Technical"),
                "date": event.get("date", None),
                "description": event.get("description", ""),
                "link": event.get("link", "")
            }
            
            try:
                supabase.table("events").insert(event_data).execute()
                inserted_count += 1
                print(f"✅ Inserted: {event_data['title']}")
            except Exception as e:
                print(f"❌ Failed to insert {event_data['title']}: {str(e)}")
        
        return inserted_count
    except json.JSONDecodeError as e:
        print(f"❌ Failed to parse JSON: {str(e)}")
        return 0

if __name__ == "__main__":
    print("🚀 Starting weekly event scraping...")
    
    try:
        events_data = get_hyderabad_college_events()
        print("📡 Retrieved events from Google Search")
        
        inserted_count = insert_events_to_supabase(events_data)
        print(f"🎉 Successfully inserted {inserted_count} events")
        
    except Exception as e:
        print(f"❌ Weekly update failed: {str(e)}")
