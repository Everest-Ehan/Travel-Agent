import os
import requests
import json
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables from a .env file for security
load_dotenv()

# --- Configuration & Secrets ---
# IMPORTANT: Create a file named `.env` in the `backend` directory.
# Add your secret tokens to the .env file like this:
# BEARER_TOKEN="your_bearer_token_here"
# SESSION_COOKIE="your_session_cookie_here"

BEARER_TOKEN = os.getenv("BEARER_TOKEN")
SESSION_COOKIE = os.getenv("SESSION_COOKIE")

# --- FastAPI App Initialization ---
app = FastAPI()

# Configure CORS (Cross-Origin Resource Sharing)
# This allows your Next.js frontend (running on localhost:3000)
# to make requests to this backend (running on localhost:8000).
origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- API Scraping Logic ---
def get_hotel_data(search_query: str):
    """
    Calls the real Fora Travel API to get hotel data based on a search query.
    """
    if not BEARER_TOKEN or not SESSION_COOKIE:
        raise HTTPException(status_code=500, detail="Server is missing authentication tokens. Check your .env file.")

    # Dynamically construct the API URL with the user's search query
    api_url = f"https://api.fora.travel/v1/supplier-database/suppliers/hotel/?search={search_query}&ordering=sequence&view_mode=list&limit=20"

    cookies = {
        '__Secure-next-auth.session-token': SESSION_COOKIE,
    }

    headers = {
        'Authorization': f'Bearer {BEARER_TOKEN}',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json',
        'Referer': 'https://advisor.fora.travel/partners/hotels'
    }

    try:
        response = requests.get(api_url, headers=headers, cookies=cookies, timeout=20)
        response.raise_for_status()  # Raise an exception for bad status codes (4xx or 5xx)
        return response.json()
    except requests.exceptions.HTTPError as e:
        if e.response.status_code in [401, 403]:
            raise HTTPException(status_code=401, detail="Authentication failed. The Bearer Token or session cookie may be expired.")
        else:
            raise HTTPException(status_code=e.response.status_code, detail=f"API request failed: {e.response.reason}")
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"A network error occurred: {e}")


# --- API Endpoint ---
@app.get("/api/search")
async def search_hotels(query: str = Query(..., min_length=2, description="The search term for hotels or destinations.")):
    """
    API endpoint to search for hotels. It takes a 'query' parameter.
    """
    print(f"Received search request for: '{query}'")
    try:
        data = get_hotel_data(query)
        return data
    except HTTPException as e:
        # Re-raise HTTPException to let FastAPI handle the response
        raise e
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        raise HTTPException(status_code=500, detail="An internal server error occurred.")

@app.get("/")
def read_root():
    return {"status": "FastAPI server is running."} 