import os
import requests
import json
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Request
from dotenv import load_dotenv

# Load environment variables from a .env file for security
load_dotenv()

# Import auth service after loading environment variables
from auth_service import auth_service

# --- Configuration & Secrets ---
# IMPORTANT: Create a file named `.env` in the `backend` directory.
# Add your session cookie to the .env file like this:
# SESSION_COOKIE="your_session_cookie_here"
# The bearer token will be automatically fetched from the session API

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
    try:
        # Get authentication headers with automatic token refresh
        headers = auth_service.get_auth_headers()
        cookies = auth_service.get_session_cookies()
        
        # Dynamically construct the API URL with the user's search query
        api_url = f"https://api.fora.travel/v1/supplier-database/suppliers/hotel/?search={search_query}&ordering=sequence&view_mode=list&limit=20"

        print(f"Making hotel search request to: {api_url}")
        print(f"Using auth headers: {headers}")
        
        response = requests.get(api_url, headers=headers, cookies=cookies, timeout=20)
        response.raise_for_status()  # Raise an exception for bad status codes (4xx or 5xx)
        return response.json()
    except requests.exceptions.HTTPError as e:
        if e.response.status_code in [401, 403]:
            # Try to refresh token and retry once
            try:
                print("Authentication failed, attempting token refresh...")
                headers = auth_service.get_auth_headers(force_refresh=True)
                response = requests.get(api_url, headers=headers, cookies=cookies, timeout=20)
                response.raise_for_status()
                return response.json()
            except Exception as refresh_error:
                print(f"Token refresh failed: {refresh_error}")
                raise HTTPException(status_code=401, detail="Authentication failed. Please check your session cookie.")
        else:
            raise HTTPException(status_code=e.response.status_code, detail=f"API request failed: {e.response.reason}")
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"A network error occurred: {e}")
    except Exception as e:
        print(f"Unexpected error in get_hotel_data: {e}")
        raise HTTPException(status_code=500, detail="An internal server error occurred.")


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

def get_rate_summary(request_data: dict):
    """
    Calls the Fora Travel rate summary API to get hotel rates.
    """
    try:
        # Get authentication headers with automatic token refresh
        headers = auth_service.get_auth_headers()
        cookies = auth_service.get_session_cookies()
        
        # Use the correct API endpoint
        api_url = "https://api1.fora.travel/v2/supplier/rate_summary/"

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
            # Try to refresh token and retry once
            try:
                print("Authentication failed, attempting token refresh...")
                headers = auth_service.get_auth_headers(force_refresh=True)
                response = requests.post(api_url, headers=headers, cookies=cookies, json=request_data, timeout=20)
                response.raise_for_status()
                return response.json()
            except Exception as refresh_error:
                print(f"Token refresh failed: {refresh_error}")
                raise HTTPException(status_code=401, detail="Authentication failed. Please check your session cookie.")
        else:
            raise HTTPException(status_code=e.response.status_code, detail=f"Rate API request failed: {e.response.reason} - {e.response.text}")
    except requests.exceptions.RequestException as e:
        print(f"Request Exception: {e}")
        raise HTTPException(status_code=500, detail=f"A network error occurred: {e}")
    except Exception as e:
        print(f"Unexpected error in get_rate_summary: {e}")
        raise HTTPException(status_code=500, detail="An internal server error occurred.")

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
        return data
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        raise HTTPException(status_code=500, detail="An internal server error occurred.")

@app.get("/")
def read_root():
    return {"status": "FastAPI server is running."}

@app.get("/test-rates")
def test_rates():
    """
    Test endpoint to check if the rate API is working with a simple request
    """
    if not auth_service.is_authenticated():
        return {"error": "Not authenticated. Please check your session cookie."}
    
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

@app.get("/auth/status")
def auth_status():
    """
    Check authentication status and user info
    """
    try:
        if auth_service.is_authenticated():
            user_info = auth_service.get_user_info()
            return {
                "status": "authenticated",
                "user": user_info,
                "message": "Authentication successful"
            }
        else:
            return {
                "status": "not_authenticated",
                "message": "Please check your session cookie"
            }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        } 