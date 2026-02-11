import os
import json
import requests
from firecrawl import FirecrawlApp
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from typing import Dict, Any

load_dotenv()

# Initialize Firecrawl
firecrawl_app = FirecrawlApp(api_key=os.getenv("FIRECRAWL_API_KEY"))

# Initialize Supabase
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")

if not supabase_url or not supabase_key:
    raise ValueError("Missing SUPABASE_URL or SUPABASE_KEY in environment")

# Define Event Schema matching main.py with flexible date handling
class EventSchema(BaseModel):
    title: str = Field(description="The name of the fest or workshop")
    college_name: str = Field(description="The college hosting the event (e.g., CBIT, MGIT)")
    category: str = Field(description="The category of the event (e.g., technical, cultural, workshop)")
    date: str = Field(description="Event date in any format (e.g., 'Feb 17', '2024-02-17', '17th February')")
    description: str = Field(description="A brief summary of the event")
    link: str = Field(description="The registration or info URL")

def scrape_and_insert_events(college: str, target_url: str = None):
    """
    Search for college events page using Firecrawl search and scrape events.
    
    Args:
        college: College name for search and default values
        target_url: Optional direct URL to scrape (if provided, skips search)
        
    Returns:
        Dict with success status and insertion count
    """
    try:
        # If no target_url provided, search for the most content-rich events page
        if not target_url:
            search_query = f"{college} events page"
            print(f"Searching for: {search_query}")
            
            search_result = firecrawl_app.search(search_query, limit=3)
            
            if not search_result.success or not search_result.data:
                return {"success": False, "error": f"No events page found for '{college}'"}
            
            # Get the most relevant URL from search results
            target_url = search_result.data[0].get("url")
            if not target_url:
                return {"success": False, "error": f"No valid URL found for '{college}' events page"}
            
            print(f"Found events page: {target_url}")
        
        print(f"Firecrawl is extracting events from {target_url}...")
        
        # Use the /extract endpoint with wait_for parameter and updated schema
        scrape_result = firecrawl_app.extract(
            urls=[target_url],
            prompt="Find all upcoming technical and cultural fests, workshops, and events. Extract title, category, date (in any format), description, and registration link. Look for dynamic content that may load with JavaScript.",
            schema=EventSchema.model_json_schema(),
            options={"waitFor": 2000}  # Wait 2 seconds for JavaScript to load
        )
        
        if not scrape_result.success:
            return {"success": False, "error": str(scrape_result.error)}
        
        scraped_events = scrape_result.data
        
        if not scraped_events:
            return {"success": True, "count": 0, "message": "No events found"}
        
        # Automatically insert scraped events into Supabase using direct REST
        inserted_count = 0
        for event in scraped_events:
            try:
                # Ensure the event has all required fields including category
                event_data = {
                    "title": event.get("title", "Untitled Event"),
                    "college_name": event.get("college_name", college.title()),
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
        
        return {
            "success": True,
            "count": inserted_count,
            "message": f"Successfully scraped and inserted {inserted_count} events from {college.title()}",
            "events": scraped_events
        }
        
    except Exception as e:
        return {"success": False, "error": str(e)}

# Example usage - search and scrape events for any college
if __name__ == "__main__":
    college = "CBIT Hyderabad"
    
    result = scrape_and_insert_events(college)
    
    if result["success"]:
        print(f" {result['message']}")
        print(f" Total events inserted: {result['count']}")
    else:
        print(f" Scraping failed: {result['error']}")