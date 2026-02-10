import os
import json
import requests
from supabase import create_client, Client
from dotenv import load_dotenv
from datetime import datetime, timedelta
from typing import Dict, Any

load_dotenv()

# Initialize Supabase
url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_KEY")

if not url or not key:
    raise ValueError("Missing SUPABASE_URL or SUPABASE_KEY in environment")

supabase: Client = create_client(url, key)

def get_hyderabad_college_events():
    """Use Gemini API via direct REST requests to find college events in Hyderabad"""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("Missing GEMINI_API_KEY in environment")
    
    # Calculate date range for next week
    today = datetime.now()
    next_week = today + timedelta(days=7)
    date_range = f"{today.strftime('%B %d')} to {next_week.strftime('%B %d, %Y')}"
    
    # Gemini API endpoint
    gemini_url = "https://generativelanguage.googleapis.com/v1/models/text-bison-001:generateContent"
    
    headers = {
        "Content-Type": "application/json",
        "x-goog-api-key": api_key
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
    """Insert events into Supabase with fallback category"""
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
                
                response = supabase.table("events").insert(event_data).execute()
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

def main():
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

if __name__ == "__main__":
    main()
