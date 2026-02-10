import os
import json
from google import generativeai as genai
from supabase import create_client, Client
from dotenv import load_dotenv
from datetime import datetime, timedelta
from typing import Dict, Any

load_dotenv()

# Initialize Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Initialize Supabase
url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_KEY")

if not url or not key:
    raise ValueError("Missing SUPABASE_URL or SUPABASE_KEY in environment")

supabase: Client = create_client(url, key)

def get_hyderabad_college_events():
    """Use Google Search Grounding to find college events in Hyderabad"""
    model = genai.GenerativeModel(
        model_name="models/gemini-1.5-flash",
        tools=[genai.tools.Tool(
            function_declarations=[
                genai.types.FunctionDeclaration(
                    name="search_college_events",
                    description="Search for college events in Hyderabad for next week",
                    parameters={
                        "type": "object",
                        "properties": {
                            "query": {"type": "string", "description": "Search query for college events"}
                        }
                    }
                )
            ]
        )]
    )
    
    # Calculate date range for next week
    today = datetime.now()
    next_week = today + timedelta(days=7)
    date_range = f"{today.strftime('%B %d')} to {next_week.strftime('%B %d, %Y')}"
    
    prompt = f"""
    Find all college events, fests, and workshops happening in Hyderabad from {date_range}.
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
    
    response = model.generate_content(prompt)
    
    # Debug: Print search queries performed by model
    if hasattr(response, 'candidates') and response.candidates:
        for candidate in response.candidates:
            if hasattr(candidate, 'grounding_metadata') and candidate.grounding_metadata:
                web_search_queries = candidate.grounding_metadata.get('web_search_queries', [])
                print(f"🔍 Search Queries: {web_search_queries}")
    
    return response.text

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
