import os
from fastapi import FastAPI, HTTPException
from supabase import create_client, Client
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from firecrawl import FirecrawlApp
from pydantic import BaseModel, Field
from typing import List, Dict, Any

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

# Initialize Supabase client
url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_KEY")

if not url or not key:
    raise ValueError("Missing SUPABASE_URL or SUPABASE_KEY in environment")

supabase: Client = create_client(url, key)

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

@app.get("/events")
async def get_events():
    """
    Fetches all college events from the Supabase 'events' table.
    """
    try:
        response = supabase.table("events").select("*").execute()
        return response.data
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
        
        search_result = firecrawl_app.search(search_query, params={"limit": 3})
        
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
                
                response = supabase.table("events").insert(event_data).execute()
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
        response = supabase.table("events").insert(event).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/events/{event_id}")
async def delete_event(event_id: int):
    """
    Delete an event from the Supabase database.
    """
    try:
        response = supabase.table("events").delete().eq("id", event_id).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    # Listening on 0.0.0.0 makes it accessible on your local network
    uvicorn.run(app, host="0.0.0.0", port=8000)
