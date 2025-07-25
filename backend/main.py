import os
import requests
import json
from fastapi import FastAPI, HTTPException, Query, Path
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

# Allow all origins for development (do not use in production)
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://localhost:3000",
    "https://127.0.0.1:3000",
    "*"  # Allow all origins for development
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
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
        print(f"/api/rates result: {json.dumps(data, indent=2)}")
        return data
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        raise HTTPException(status_code=500, detail="An internal server error occurred.")

@app.get('/api/hotel-details/{hotel_id}')
def get_hotel_details(hotel_id: str = Path(...)):
    try:
        # Get authentication headers with automatic token refresh
        headers = auth_service.get_auth_headers()
        cookies = auth_service.get_session_cookies()
        
        url = f'https://api.fora.travel/v1/supplier-database/suppliers/{hotel_id}'
        
        print(f"Making hotel details request to: {url}")
        print(f"Using auth headers: {headers}")
        
        response = requests.get(url, headers=headers, cookies=cookies, timeout=20)
        response.raise_for_status()
        print(f"/api/hotel-details/{hotel_id} result: {response.text}")
        return response.json()
    except requests.exceptions.HTTPError as e:
        if e.response.status_code in [401, 403]:
            # Try to refresh token and retry once
            try:
                print("Authentication failed, attempting token refresh...")
                headers = auth_service.get_auth_headers(force_refresh=True)
                response = requests.get(url, headers=headers, cookies=cookies, timeout=20)
                response.raise_for_status()
                return response.json()
            except Exception as refresh_error:
                print(f"Token refresh failed: {refresh_error}")
                raise HTTPException(status_code=401, detail="Authentication failed. Please check your session cookie.")
        else:
            raise HTTPException(status_code=e.response.status_code, detail=f"API request failed: {e.response.reason}")
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch hotel details: {e}")
    except Exception as e:
        print(f"Unexpected error in get_hotel_details: {e}")
        raise HTTPException(status_code=500, detail="An internal server error occurred.")

@app.get('/api/filtered-hotels')
def get_filtered_hotels(view_mode: str, adults: int, dates: str, rooms: int, q: str, currency: str):
    try:
        # Get authentication headers with automatic token refresh
        headers = auth_service.get_auth_headers()
        cookies = auth_service.get_session_cookies()
        
        url = f'https://advisor.fora.travel/partners/hotels?view_mode={view_mode}&adults={adults}&dates={dates}&rooms={rooms}&q={q}&currency={currency}'
        
        print(f"Making filtered hotels request to: {url}")
        print(f"Using auth headers: {headers}")
        
        response = requests.get(url, headers=headers, cookies=cookies, timeout=20)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.HTTPError as e:
        if e.response.status_code in [401, 403]:
            # Try to refresh token and retry once
            try:
                print("Authentication failed, attempting token refresh...")
                headers = auth_service.get_auth_headers(force_refresh=True)
                response = requests.get(url, headers=headers, cookies=cookies, timeout=20)
                response.raise_for_status()
                return response.json()
            except Exception as refresh_error:
                print(f"Token refresh failed: {refresh_error}")
                raise HTTPException(status_code=401, detail="Authentication failed. Please check your session cookie.")
        else:
            raise HTTPException(status_code=e.response.status_code, detail=f"API request failed: {e.response.reason}")
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch filtered hotels: {e}")
    except Exception as e:
        print(f"Unexpected error in get_filtered_hotels: {e}")
        raise HTTPException(status_code=500, detail="An internal server error occurred.")

@app.get('/api/hotel-rates/{hotel_id}')
def get_hotel_rates(
    hotel_id: str = Path(...),
    number_of_adults: int = Query(..., description="Number of adults"),
    rooms: int = Query(..., description="Number of rooms"),
    currency: str = Query(..., description="Currency code"),
    start_date: str = Query(..., description="Start date (YYYY-MM-DD)"),
    end_date: str = Query(..., description="End date (YYYY-MM-DD)")
):
    """
    API endpoint to get hotel rates for a specific hotel.
    """
    try:
        # Get authentication headers with automatic token refresh
        headers = auth_service.get_auth_headers()
        cookies = auth_service.get_session_cookies()
        
        # Construct the API URL with query parameters
        url = f'https://api.fora.travel/v1/supplier-database/suppliers/{hotel_id}/rates/'
        params = {
            'number_of_adults': number_of_adults,
            'rooms': rooms,
            'currency': currency,
            'start_date': start_date,
            'end_date': end_date
        }
        
        print(f"Making hotel rates request to: {url}")
        print(f"Query parameters: {params}")
        print(f"Using auth headers: {headers}")
        
        response = requests.get(url, headers=headers, cookies=cookies, params=params, timeout=20)
        response.raise_for_status()
        
        data = response.json()
        print(f"/api/hotel-rates/{hotel_id} result: {json.dumps(data, indent=2)}")
        return data
    except requests.exceptions.HTTPError as e:
        if e.response.status_code in [401, 403]:
            # Try to refresh token and retry once
            try:
                print("Authentication failed, attempting token refresh...")
                headers = auth_service.get_auth_headers(force_refresh=True)
                response = requests.get(url, headers=headers, cookies=cookies, params=params, timeout=20)
                response.raise_for_status()
                return response.json()
            except Exception as refresh_error:
                print(f"Token refresh failed: {refresh_error}")
                raise HTTPException(status_code=401, detail="Authentication failed. Please check your session cookie.")
        else:
            raise HTTPException(status_code=e.response.status_code, detail=f"API request failed: {e.response.reason}")
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch hotel rates: {e}")
    except Exception as e:
        print(f"Unexpected error in get_hotel_rates: {e}")
        raise HTTPException(status_code=500, detail="An internal server error occurred.")

@app.get('/api/clients')
def get_clients(
    search: str = Query('', description="Search query for clients"),
    limit: int = Query(1000, description="Number of clients to return"),
    booking_loyalty_programs: bool = Query(True, description="Include booking loyalty programs")
):
    """
    API endpoint to get clients.
    """
    try:
        # Get authentication headers with automatic token refresh
        headers = auth_service.get_auth_headers()
        cookies = auth_service.get_session_cookies()
        
        # Construct the API URL with query parameters
        url = 'https://api.fora.travel/v1/clients/'
        params = {
            'search': search,
            'limit': limit,
            'booking_loyalty_programs': booking_loyalty_programs
        }
        
        print(f"Making clients request to: {url}")
        print(f"Query parameters: {params}")
        print(f"Using auth headers: {headers}")
        
        response = requests.get(url, headers=headers, cookies=cookies, params=params, timeout=20)
        response.raise_for_status()
        
        data = response.json()
        print(f"/api/clients result: {json.dumps(data, indent=2)}")
        return data
    except requests.exceptions.HTTPError as e:
        if e.response.status_code in [401, 403]:
            # Try to refresh token and retry once
            try:
                print("Authentication failed, attempting token refresh...")
                headers = auth_service.get_auth_headers(force_refresh=True)
                response = requests.get(url, headers=headers, cookies=cookies, params=params, timeout=20)
                response.raise_for_status()
                return response.json()
            except Exception as refresh_error:
                print(f"Token refresh failed: {refresh_error}")
                raise HTTPException(status_code=401, detail="Authentication failed. Please check your session cookie.")
        else:
            raise HTTPException(status_code=e.response.status_code, detail=f"API request failed: {e.response.reason}")
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch clients: {e}")
    except Exception as e:
        print(f"Unexpected error in get_clients: {e}")
        raise HTTPException(status_code=500, detail="An internal server error occurred.")

@app.post('/api/clients')
async def create_client(request: Request):
    """
    API endpoint to create a new client.
    """
    try:
        # Get authentication headers with automatic token refresh
        headers = auth_service.get_auth_headers()
        cookies = auth_service.get_session_cookies()
        
        # Get request data
        client_data = await request.json()
        
        # Construct the API URL
        url = 'https://api.fora.travel/v2/clients/'
        
        print(f"Making create client request to: {url}")
        print(f"Client data: {json.dumps(client_data, indent=2)}")
        print(f"Using auth headers: {headers}")
        
        response = requests.post(url, headers=headers, cookies=cookies, json=client_data, timeout=20)
        response.raise_for_status()
        
        data = response.json()
        print(f"/api/clients POST result: {json.dumps(data, indent=2)}")
        return data
    except requests.exceptions.HTTPError as e:
        if e.response.status_code in [401, 403]:
            # Try to refresh token and retry once
            try:
                print("Authentication failed, attempting token refresh...")
                headers = auth_service.get_auth_headers(force_refresh=True)
                response = requests.post(url, headers=headers, cookies=cookies, json=client_data, timeout=20)
                response.raise_for_status()
                return response.json()
            except Exception as refresh_error:
                print(f"Token refresh failed: {refresh_error}")
                raise HTTPException(status_code=401, detail="Authentication failed. Please check your session cookie.")
        else:
            raise HTTPException(status_code=e.response.status_code, detail=f"API request failed: {e.response.reason}")
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Failed to create client: {e}")
    except Exception as e:
        print(f"Unexpected error in create_client: {e}")
        raise HTTPException(status_code=500, detail="An internal server error occurred.")

@app.post('/api/booking')
async def create_booking(request: Request):
    """
    API endpoint to create a booking.
    """
    try:
        # Get authentication headers with automatic token refresh
        headers = auth_service.get_auth_headers()
        cookies = auth_service.get_session_cookies()
        
        # Get request data
        booking_data = await request.json()
        
        # Construct the API URL
        url = 'https://api.fora.travel/v1/supplier/rate/'
        
        print(f"Making create booking request to: {url}")
        print(f"Booking data: {json.dumps(booking_data, indent=2)}")
        print(f"Using auth headers: {headers}")
        
        response = requests.post(url, headers=headers, cookies=cookies, json=booking_data, timeout=20)
        response.raise_for_status()
        
        data = response.json()
        print(f"/api/booking POST result: {json.dumps(data, indent=2)}")
        return data
    except requests.exceptions.HTTPError as e:
        if e.response.status_code in [401, 403]:
            # Try to refresh token and retry once
            try:
                print("Authentication failed, attempting token refresh...")
                headers = auth_service.get_auth_headers(force_refresh=True)
                response = requests.post(url, headers=headers, cookies=cookies, json=booking_data, timeout=20)
                response.raise_for_status()
                return response.json()
            except Exception as refresh_error:
                print(f"Token refresh failed: {refresh_error}")
                raise HTTPException(status_code=401, detail="Authentication failed. Please check your session cookie.")
        else:
            raise HTTPException(status_code=e.response.status_code, detail=f"API request failed: {e.response.reason}")
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Failed to create booking: {e}")
    except Exception as e:
        print(f"Unexpected error in create_booking: {e}")
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