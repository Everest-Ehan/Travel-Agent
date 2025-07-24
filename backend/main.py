import os
import requests
import json
from fastapi import FastAPI, HTTPException, Query, Path
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Request
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

# Allow all origins for development (do not use in production)
origins = ["*"]

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
        print(f"/api/search result: {json.dumps(data, indent=2)}")
        return data
    except HTTPException as e:
        # Re-raise HTTPException to let FastAPI handle the response
        raise e
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        raise HTTPException(status_code=500, detail="An internal server error occurred.")

def get_rate_summary(request_data: dict):
    """
    Calls the Fora Travel rate summary API to get hotel rates.
    """
    if not BEARER_TOKEN or not SESSION_COOKIE:
        raise HTTPException(status_code=500, detail="Server is missing authentication tokens. Check your .env file.")

    # Use the correct API endpoint
    api_url = "https://api1.fora.travel/v2/supplier/rate_summary/"

    cookies = {
        '__Secure-next-auth.session-token': SESSION_COOKIE,
    }

    headers = {
        'Authorization': f'Bearer {BEARER_TOKEN}',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Referer': 'https://advisor.fora.travel/partners/hotels',
        'Origin': 'https://advisor.fora.travel',
        'X-Requested-With': 'XMLHttpRequest'
    }

    try:
        print(f"Making request to: {api_url}")
        print(f"Headers: {headers}")
        print(f"Request payload: {json.dumps(request_data, indent=2)}")
        
        response = requests.post(api_url, headers=headers, cookies=cookies, json=request_data, timeout=20)
        
        print(f"Response status: {response.status_code}")
        print(f"Response headers: {dict(response.headers)}")
        print(f"Response content: {response.text}")
        if not response.ok:
            print(f"Response content: {response.text}")
            
        response.raise_for_status()
        return response.json()
    except requests.exceptions.HTTPError as e:
        print(f"HTTP Error: {e.response.status_code} - {e.response.text}")
        if e.response.status_code in [401, 403]:
            raise HTTPException(status_code=401, detail="Authentication failed. The Bearer Token or session cookie may be expired.")
        else:
            raise HTTPException(status_code=e.response.status_code, detail=f"Rate API request failed: {e.response.reason} - {e.response.text}")
    except requests.exceptions.RequestException as e:
        print(f"Request Exception: {e}")
        raise HTTPException(status_code=500, detail=f"A network error occurred: {e}")

@app.post("/api/rates")
async def get_rates(request: Request):
    """
    API endpoint to get hotel rates. It takes a JSON payload with all required fields.
    """
    try:
        request_data = await request.json()
        print(f"Received rate request for {len(request_data.get('supplier_ids', []))} hotels")
        print(f"Request data: {json.dumps(request_data, indent=2)}")
        
        # Validate required fields
        required_fields = ['currency', 'number_of_adults', 'children_ages', 'start_date', 'end_date', 'supplier_ids']
        missing_fields = [field for field in required_fields if field not in request_data]
        
        if missing_fields:
            raise HTTPException(status_code=400, detail=f"Missing required fields: {missing_fields}")
        
        if not request_data.get('supplier_ids'):
            raise HTTPException(status_code=400, detail="supplier_ids cannot be empty")
        
        if len(request_data.get('supplier_ids', [])) > 10:
            raise HTTPException(status_code=400, detail="supplier_ids cannot have more than 10 elements")
        
        data = get_rate_summary(request_data)
        print(f"/api/rates result: {json.dumps(data, indent=2)}")
        return data
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        raise HTTPException(status_code=500, detail="An internal server error occurred.")

@app.get('/api/hotel-details/{hotel_id}')
def get_hotel_details(hotel_id: str = Path(...)):
    if not BEARER_TOKEN or not SESSION_COOKIE:
        raise HTTPException(status_code=500, detail="Server is missing authentication tokens. Check your .env file.")
    url = f'https://api.fora.travel/v1/supplier-database/suppliers/{hotel_id}'
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
        response = requests.get(url, headers=headers, cookies=cookies, timeout=20)
        response.raise_for_status()
        print(f"/api/hotel-details/{hotel_id} result: {response.text}")
        return response.json()
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch hotel details: {e}")

@app.get('/api/filtered-hotels')
def get_filtered_hotels(view_mode: str, adults: int, dates: str, rooms: int, q: str, currency: str):
    if not BEARER_TOKEN or not SESSION_COOKIE:
        raise HTTPException(status_code=500, detail="Server is missing authentication tokens. Check your .env file.")
    url = f'https://advisor.fora.travel/partners/hotels?view_mode={view_mode}&adults={adults}&dates={dates}&rooms={rooms}&q={q}&currency={currency}'
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
        response = requests.get(url, headers=headers, cookies=cookies, timeout=20)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch filtered hotels: {e}")

@app.get("/")
def read_root():
    return {"status": "FastAPI server is running."}

@app.get("/test-rates")
def test_rates():
    """
    Test endpoint to check if the rate API is working with a simple request
    """
    if not BEARER_TOKEN or not SESSION_COOKIE:
        return {"error": "Missing authentication tokens"}
    
    test_request = {
        "currency": "USD",
        "number_of_adults": 2,
        "children_ages": [],
        "start_date": "2025-08-14",
        "end_date": "2025-08-22",
        "supplier_ids": ["da935cce-1f96-46b0-af8e-036cb0d535f7"],
        "filters": {}
    }
    
    try:
        result = get_rate_summary(test_request)
        return {"status": "success", "data": result}
    except Exception as e:
        return {"status": "error", "message": str(e)} 