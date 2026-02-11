import os
import json
import requests
from fastapi import FastAPI, HTTPException
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from firecrawl import FirecrawlApp
from pydantic import BaseModel, Field
from typing import List, Dict, Any
from datetime import datetime, timedelta

# Load environment variables
load_dotenv()

app = FastAPI(title="UniEvent Backend", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # Your React app's address
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Supabase
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")

if not supabase_url or not supabase_key:
    raise ValueError("Missing SUPABASE_URL or SUPABASE_KEY in environment")

# Initialize Firecrawl
firecrawl_api_key = os.getenv("FIRECRAWL_API_KEY")
if not firecrawl_api_key:
    raise ValueError("Missing FIRECRAWL_API_KEY in environment")

firecrawl_app = FirecrawlApp(api_key=firecrawl_api_key)

# Define Event Schema for structured extraction
class EventSchema(BaseModel):
    title: str = Field(description="The name of the fest or workshop")
    college_name: str = Field(description="The college hosting the event (e.g., CBIT, MGIT)")
    category: str = Field(description="The category of the event (e.g., technical, cultural, workshop)")
    date: str = Field(description="Event date in YYYY-MM-DD format")
    description: str = Field(description="A brief summary of the event")
    link: str = Field(description="The registration or info URL")

def run_firecrawl_scraper(target_url: str) -> Dict[str, Any]:
    """
    Scrape events from a college website using Firecrawl API.
    
    Args:
        target_url: The URL to scrape events from
        
    Returns:
        Dict containing scraped data or error information
    """
    try:
        print(f"🚀 Firecrawl is extracting events from {target_url}...")
        
        # Use the /extract endpoint to get structured JSON directly
        data = firecrawl_app.extract(
            urls=[target_url],
            prompt="Find all upcoming technical and cultural fests. Ignore older events.",
            schema=EventSchema.model_json_schema()
        )
        
        if data['success']:
            return {"success": True, "data": data['data']}
        else:
            return {"success": False, "error": data['error']}
            
    except Exception as e:
        return {"success": False, "error": str(e)}

def get_hyderabad_college_events():
    """Use Gemini API via direct REST requests to find college events in Hyderabad"""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("Missing GEMINI_API_KEY in environment")
    
    # Calculate date range for next week
    today = datetime.now()
    next_week = today + timedelta(days=7)
    date_range = f"{today.strftime('%B %d')} to {next_week.strftime('%B %d, %Y')}"
    
    # Gemini API endpoint with API key in URL
    gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}"
    
    headers = {
        "Content-Type": "application/json"
    }
    
    prompt = f"""
    You are a search assistant. Find all college events, fests, and workshops happening in Hyderabad from {date_range}.
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
    
    data = {
        "contents": [
            {
                "parts": [
                    {
                        "text": prompt
                    }
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 2048
        }
    }
    
    try:
        response = requests.post(gemini_url, headers=headers, json=data)
        response.raise_for_status()
        
        result = response.json()
        
        # Extract the text from the response
        if "candidates" in result and result["candidates"]:
            content = result["candidates"][0]["content"]["parts"][0]["text"]
            print(f"Searching for Hyderabad college events...")
            return content
        else:
            raise ValueError("No content in Gemini response")
            
    except requests.exceptions.RequestException as e:
        raise Exception(f"Gemini API request failed: {str(e)}")
    except json.JSONDecodeError as e:
        raise Exception(f"Failed to parse Gemini response: {str(e)}")

def insert_events_to_supabase(events_data):
    """Insert events into Supabase using direct REST requests"""
    try:
        # Parse JSON from response
        events = json.loads(events_data)
        inserted_count = 0
        
        for event in events:
            try:
                # Ensure the event has all required fields including category
                event_data = {
                    "title": event.get("title", "Untitled Event"),
                    "college_name": event.get("college_name", "Unknown College"),
                    "category": event.get("category", "general"),  # Prevent NULL errors
                    "date": event.get("date", None),  # Flexible date format
                    "description": event.get("description", ""),
                    "link": event.get("link", "")
                }
                
                # Direct POST request to Supabase REST API
                events_url = f"{supabase_url}/rest/v1/events"
                headers = {
                    "apikey": supabase_key,
                    "Authorization": f"Bearer {supabase_key}",
                    "Content-Type": "application/json",
                    "Prefer": "return=minimal"
                }
                
                response = requests.post(events_url, headers=headers, json=event_data)
                response.raise_for_status()
                
                inserted_count += 1
                print(f"Inserted event: {event_data['title']}")
                
            except Exception as insert_error:
                print(f"Failed to insert event: {str(insert_error)}")
                continue
        
        print(f"Successfully inserted {inserted_count} events into Supabase")
        return inserted_count
        
    except json.JSONDecodeError as e:
        print(f"Failed to parse events JSON: {str(e)}")
        return 0
    except Exception as e:
        print(f"Supabase insertion failed: {str(e)}")
        return 0

def weekly_update():
    """Main function to run the weekly event scraping"""
    print("Starting weekly event scraping...")
    
    try:
        # Get events from Gemini
        events_data = get_hyderabad_college_events()
        
        # Insert events into Supabase
        inserted_count = insert_events_to_supabase(events_data)
        
        if inserted_count > 0:
            print(f"Weekly update completed successfully! Inserted {inserted_count} events.")
        else:
            print("Weekly update completed but no events were inserted.")
            
    except Exception as e:
        print(f"Weekly update failed: {str(e)}")
        raise

@app.get("/events")
async def get_events():
    """
    Fetches all college events from the Supabase 'events' table.
    """
    try:
        events_url = f"{supabase_url}/rest/v1/events"
        headers = {
            "apikey": supabase_key,
            "Authorization": f"Bearer {supabase_key}",
            "Content-Type": "application/json"
        }
        
        response = requests.get(events_url, headers=headers)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/scrape-events")
async def get_specific_college_events(college: str):
    """
    Search for college events page using Firecrawl search and scrape events.
    
    Args:
        college: The college name to search for
        
    Returns:
        Success message with count of inserted events or error message
    """
    if not college or not college.strip():
        raise HTTPException(status_code=400, detail="College name cannot be empty")
    
    print(f"🚀 User requested data for: {college}")
    
    try:
        # Use Firecrawl search to find the most relevant events page
        search_query = f"{college} events page"
        print(f"🔍 Searching for: {search_query}")
        
        search_result = firecrawl_app.search(search_query, limit=3)
        
        if not search_result.success or not search_result.data:
            raise HTTPException(status_code=404, detail=f"No events page found for '{college}'")
        
        # Get the most relevant URL from search results
        target_url = search_result.data[0].get("url")
        if not target_url:
            raise HTTPException(status_code=404, detail=f"No valid URL found for '{college}' events page")
        
        print(f"🎯 Found events page: {target_url}")
        
        # Use Firecrawl's extract feature with the updated schema
        scrape_result = firecrawl_app.extract(
            urls=[target_url],
            prompt="Find all upcoming technical and cultural fests, workshops, and events. Extract title, category, date, description, and registration link.",
            schema=EventSchema.model_json_schema()
        )
        
        if not scrape_result.success:
            raise HTTPException(status_code=500, detail=f"Firecrawl extraction failed: {str(scrape_result.error)}")
        
        scraped_events = scrape_result.data
        
        if not scraped_events:
            return {"message": f"No events found on the discovered page for {college}", "count": 0}
        
        # Automatically insert scraped events into Supabase
        inserted_count = 0
        for event in scraped_events:
            try:
                # Ensure the event has all required fields
                event_data = {
                    "title": event.get("title", "Untitled Event"),
                    "college_name": event.get("college_name", college.title()),
                    "category": event.get("category", "general"),
                    "date": event.get("date", None),
                    "description": event.get("description", ""),
                    "link": event.get("link", "")
                }
                
                events_url = f"{supabase_url}/rest/v1/events"
                headers = {
                    "apikey": supabase_key,
                    "Authorization": f"Bearer {supabase_key}",
                    "Content-Type": "application/json",
                    "Prefer": "return=minimal"
                }
                
                response = requests.post(events_url, headers=headers, json=event_data)
                response.raise_for_status()
                
                inserted_count += 1
                print(f"✅ Inserted event: {event_data['title']}")
                
            except Exception as insert_error:
                print(f"❌ Failed to insert event: {str(insert_error)}")
                continue
        
        return {
            "message": f"Successfully scraped and inserted {inserted_count} events from {college.title()}",
            "count": inserted_count,
            "events": scraped_events,
            "discovered_url": target_url
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search and scraping failed: {str(e)}")

@app.post("/events")
async def create_event(event: Dict[str, Any]):
    """
    Create a new event in the Supabase database.
    """
    try:
        events_url = f"{supabase_url}/rest/v1/events"
        headers = {
            "apikey": supabase_key,
            "Authorization": f"Bearer {supabase_key}",
            "Content-Type": "application/json",
            "Prefer": "return=minimal"
        }
        
        response = requests.post(events_url, headers=headers, json=event)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/events/{event_id}")
async def delete_event(event_id: int):
    """
    Delete an event from the Supabase database.
    """
    try:
        events_url = f"{supabase_url}/rest/v1/events"
        headers = {
            "apikey": supabase_key,
            "Authorization": f"Bearer {supabase_key}",
            "Content-Type": "application/json"
        }
        
        response = requests.delete(f"{events_url}?id=eq.{event_id}", headers=headers)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/weekly-update")
async def run_weekly_update():
    """
    Run the weekly event scraping using Gemini API.
    """
    try:
        weekly_update()
        return {"message": "Weekly update completed successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    # Listening on 0.0.0.0 makes it accessible on your local network
    uvicorn.run(app, host="0.0.0.0", port=8000)
