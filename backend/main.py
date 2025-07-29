import os
import requests
import json
from fastapi import FastAPI, HTTPException, Query, Path
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Request
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
import asyncio
import json
import time

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
    print("=" * 80)
    print("🚀 CLIENT CREATION REQUEST STARTED")
    print("=" * 80)
    
    try:
        # Step 1: Get authentication headers
        print("📝 Step 1: Getting authentication headers...")
        headers = auth_service.get_auth_headers()
        cookies = auth_service.get_session_cookies()
        print(f"✅ Auth headers obtained: {bool(headers)}")
        print(f"✅ Cookies obtained: {bool(cookies)}")
        print(f"🔑 Headers: {json.dumps(headers, indent=2)}")
        print(f"🍪 Cookies: {json.dumps(cookies, indent=2)}")
        
        # Step 2: Parse request data
        print("\n📝 Step 2: Parsing request data...")
        client_data = await request.json()
        print(f"✅ Request data parsed successfully")
        print(f"📄 Original client data from frontend:")
        print(json.dumps(client_data, indent=2))
        
        # Step 3: Validate required fields
        print("\n📝 Step 3: Validating client data...")
        required_fields = ['first_name', 'emails']
        missing_fields = [field for field in required_fields if field not in client_data or not client_data[field]]
        
        if missing_fields:
            print(f"❌ Missing required fields: {missing_fields}")
            raise HTTPException(status_code=400, detail=f"Missing required fields: {missing_fields}")
        
        print(f"✅ Required fields validation passed")
        
        # Step 4: Transform data to match Fora API expectations
        print("\n📝 Step 4: Transforming data for Fora API...")
        
        # Transform data to match Fora API expectations
        # Fix: last_name cannot be empty string, use None instead
        last_name = client_data.get("last_name", "")
        if last_name == "":
            last_name = "-"
            
        transformed_data = {
            "first_name": client_data.get("first_name", ""),
            "last_name": last_name,
            "emails": client_data.get("emails", []),
            "phone_numbers": client_data.get("phone_numbers", []),
            "addresses": client_data.get("addresses", [])
        }
        
        print(f"🔄 Transformed data:")
        print(json.dumps(transformed_data, indent=2))
        
        # Step 5: Construct API URL
        print("\n📝 Step 5: Making API request...")
        url = 'https://api.fora.travel/v2/clients/'
        print(f"🌐 API URL: {url}")
        print(f"📤 Request method: POST")
        print(f"📦 Payload size: {len(json.dumps(transformed_data))} bytes")
        
        # Step 6: Make the request
        print("\n📝 Step 6: Sending request to Fora API...")
        response = requests.post(url, headers=headers, cookies=cookies, json=transformed_data, timeout=20)
        
        # Step 7: Analyze response
        print("\n📝 Step 7: Analyzing response...")
        print(f"📊 Response status: {response.status_code}")
        print(f"📊 Response reason: {response.reason}")
        print(f"📊 Response headers: {dict(response.headers)}")
        print(f"📊 Response content-type: {response.headers.get('content-type', 'unknown')}")
        print(f"📊 Response content length: {len(response.text)} bytes")
        print(f"📄 Raw response content:")
        print("-" * 40)
        print(response.text)
        print("-" * 40)
        
        if not response.ok:
            print(f"❌ Error response from Fora API:")
            print(f"Status: {response.status_code}")
            print(f"Reason: {response.reason}")
            print(f"Content: {response.text}")
            
            # Try to parse error details
            try:
                error_json = response.json()
                print(f"🔍 Parsed error JSON: {json.dumps(error_json, indent=2)}")
            except:
                print("🔍 Could not parse error response as JSON")
        
        response.raise_for_status()
        
        # Step 8: Parse successful response
        print("\n📝 Step 8: Parsing successful response...")
        data = response.json()
        print(f"✅ Client creation successful!")
        print(f"🎉 Created client data:")
        print(json.dumps(data, indent=2))
        
        print("=" * 80)
        print("✅ CLIENT CREATION REQUEST COMPLETED SUCCESSFULLY")
        print("=" * 80)
        
        return data
    except requests.exceptions.HTTPError as e:
        print("\n" + "=" * 80)
        print("❌ HTTP ERROR OCCURRED")
        print("=" * 80)
        
        error_detail = f"API request failed: {e.response.status_code} - {e.response.reason}"
        if hasattr(e.response, 'text'):
            error_detail += f" - {e.response.text}"
        
        print(f"🔍 HTTP Error Analysis:")
        print(f"   Status Code: {e.response.status_code}")
        print(f"   Reason: {e.response.reason}")
        print(f"   URL: {e.response.url}")
        print(f"   Headers: {dict(e.response.headers)}")
        print(f"   Content: {e.response.text}")
        
        # Try to parse the error response
        try:
            error_json = e.response.json()
            print(f"🔍 Parsed Error JSON:")
            print(json.dumps(error_json, indent=2))
            
            # Look for specific error fields
            if 'errors' in error_json:
                print(f"🔍 Specific errors found:")
                for field, errors in error_json['errors'].items():
                    print(f"   {field}: {errors}")
                    
        except Exception as parse_error:
            print(f"🔍 Could not parse error response as JSON: {parse_error}")
        
        if e.response.status_code in [401, 403]:
            print("\n🔄 Attempting token refresh...")
            try:
                headers = auth_service.get_auth_headers(force_refresh=True)
                print(f"🔑 New headers after refresh: {json.dumps(headers, indent=2)}")
                
                response = requests.post(url, headers=headers, cookies=cookies, json=transformed_data, timeout=20)
                
                print(f"🔄 Retry response status: {response.status_code}")
                print(f"🔄 Retry response content: {response.text}")
                
                if response.ok:
                    print("✅ Retry successful!")
                    return response.json()
                else:
                    print("❌ Retry also failed")
                    response.raise_for_status()
                    
            except Exception as refresh_error:
                print(f"❌ Token refresh failed: {refresh_error}")
                print(f"❌ Refresh error type: {type(refresh_error)}")
                raise HTTPException(status_code=401, detail="Authentication failed. Please check your session cookie.")
        else:
            print(f"❌ Non-auth HTTP Error: {error_detail}")
            
            # Provide more specific error messages based on status code
            if e.response.status_code == 400:
                try:
                    error_json = e.response.json()
                    specific_errors = []
                    if 'errors' in error_json:
                        for field, field_errors in error_json['errors'].items():
                            specific_errors.append(f"{field}: {', '.join(field_errors) if isinstance(field_errors, list) else field_errors}")
                    
                    if specific_errors:
                        detail = f"Validation errors: {'; '.join(specific_errors)}"
                    else:
                        detail = f"Bad request: {error_json.get('message', error_json.get('detail', 'Unknown validation error'))}"
                        
                    raise HTTPException(status_code=400, detail=detail)
                except:
                    pass
            
            raise HTTPException(status_code=e.response.status_code, detail=error_detail)
            
    except requests.exceptions.RequestException as e:
        print("\n" + "=" * 80)
        print("❌ REQUEST EXCEPTION OCCURRED")
        print("=" * 80)
        print(f"🔍 Request Exception: {type(e).__name__}")
        print(f"🔍 Exception details: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Network error: {e}")
        
    except HTTPException as e:
        print(f"\n❌ HTTP Exception being re-raised: {e.detail}")
        raise e
        
    except Exception as e:
        print("\n" + "=" * 80)
        print("❌ UNEXPECTED ERROR OCCURRED")
        print("=" * 80)
        print(f"🔍 Exception type: {type(e).__name__}")
        print(f"🔍 Exception details: {str(e)}")
        print(f"🔍 Exception args: {e.args}")
        
        import traceback
        print(f"🔍 Full traceback:")
        traceback.print_exc()
        
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

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

@app.get('/api/clients/{client_id}/cards')
def get_client_cards(client_id: str = Path(...)):
    """
    API endpoint to get cards for a specific client.
    """
    try:
        headers = auth_service.get_auth_headers()
        cookies = auth_service.get_session_cookies()
        url = f'https://api.fora.travel/v1/clients/{client_id}/'
        print(f"Making get client (for cards) request to: {url}")
        response = requests.get(url, headers=headers, cookies=cookies, timeout=20)
        response.raise_for_status()
        data = response.json()
        print(f"/api/clients/{client_id} result: {json.dumps(data, indent=2)}")
        # Return only the cards array
        return {"results": data.get("cards", [])}
    except Exception as e:
        print(f"Unexpected error in get_client_cards: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch client cards.")

@app.post('/api/clients/{client_id}/cards')
async def create_client_card(client_id: str = Path(...), request: Request = None):
    """
    API endpoint to create a new card for a client (Fora two-step: POST then PUT).
    """
    try:
        headers = auth_service.get_auth_headers()
        cookies = auth_service.get_session_cookies()
        
        # Step 1: POST to get new card ID
        post_url = f'https://api.fora.travel/v1/clients/{client_id}/cards/'
        print(f"Step 1: POST to {post_url} with empty payload")
        post_resp = requests.post(post_url, headers=headers, cookies=cookies, json={}, timeout=20)
        post_resp.raise_for_status()
        card_info = post_resp.json()
        card_id = card_info['id']
        print(f"Step 1: Got card ID {card_id}")
        
        # Step 2: PUT card data
        card_data = await request.json()
        print(f"Step 2: PUT card data: {json.dumps(card_data, indent=2)}")
        
        put_url = f'https://api.fora.travel/v1/clients/{client_id}/cards/{card_id}/'
        print(f"Step 2: PUT to {put_url}")
        put_resp = requests.put(put_url, headers=headers, cookies=cookies, json=card_data, timeout=20)
        
        if not put_resp.ok:
            print(f"PUT request failed with status {put_resp.status_code}")
            print(f"PUT response: {put_resp.text}")
            put_resp.raise_for_status()
            
        result = put_resp.json()
        print(f"Step 2: PUT successful, result: {json.dumps(result, indent=2)}")
        return result
    except Exception as e:
        print(f"Unexpected error in create_client_card: {e}")
        raise HTTPException(status_code=500, detail="Failed to create client card.")

@app.put('/api/clients/{client_id}/cards/{card_id}')
async def update_client_card(client_id: str = Path(...), card_id: str = Path(...), request: Request = None):
    """
    API endpoint to update a client's card.
    """
    try:
        # Get authentication headers with automatic token refresh
        headers = auth_service.get_auth_headers()
        cookies = auth_service.get_session_cookies()
        
        # Get request data
        card_data = await request.json()
        
        # Construct the API URL
        url = f'https://api.fora.travel/v1/clients/{client_id}/cards/{card_id}/'
        
        print(f"Making update client card request to: {url}")
        print(f"Card data: {json.dumps(card_data, indent=2)}")
        print(f"Using auth headers: {headers}")
        
        response = requests.put(url, headers=headers, cookies=cookies, json=card_data, timeout=20)
        response.raise_for_status()
        
        data = response.json()
        print(f"/api/clients/{client_id}/cards/{card_id} PUT result: {json.dumps(data, indent=2)}")
        return data
    except requests.exceptions.HTTPError as e:
        if e.response.status_code in [401, 403]:
            # Try to refresh token and retry once
            try:
                print("Authentication failed, attempting token refresh...")
                headers = auth_service.get_auth_headers(force_refresh=True)
                response = requests.put(url, headers=headers, cookies=cookies, json=card_data, timeout=20)
                response.raise_for_status()
                return response.json()
            except Exception as refresh_error:
                print(f"Token refresh failed: {refresh_error}")
                raise HTTPException(status_code=401, detail="Authentication failed. Please check your session cookie.")
        else:
            raise HTTPException(status_code=e.response.status_code, detail=f"API request failed: {e.response.reason}")
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Failed to update client card: {e}")
    except Exception as e:
        print(f"Unexpected error in update_client_card: {e}")
        raise HTTPException(status_code=500, detail="An internal server error occurred.")

@app.delete('/api/clients/{client_id}/cards/{card_id}')
def delete_client_card(client_id: str = Path(...), card_id: str = Path(...)):
    """
    API endpoint to delete a client's card.
    """
    try:
        # Get authentication headers with automatic token refresh
        headers = auth_service.get_auth_headers()
        cookies = auth_service.get_session_cookies()
        
        # Construct the API URL
        url = f'https://api.fora.travel/v1/clients/{client_id}/cards/{card_id}/'
        
        print(f"Making delete client card request to: {url}")
        print(f"Using auth headers: {headers}")
        
        response = requests.delete(url, headers=headers, cookies=cookies, timeout=20)
        response.raise_for_status()
        
        print(f"/api/clients/{client_id}/cards/{card_id} DELETE successful")
        return {"message": "Card deleted successfully"}
    except requests.exceptions.HTTPError as e:
        if e.response.status_code in [401, 403]:
            # Try to refresh token and retry once
            try:
                print("Authentication failed, attempting token refresh...")
                headers = auth_service.get_auth_headers(force_refresh=True)
                response = requests.delete(url, headers=headers, cookies=cookies, timeout=20)
                response.raise_for_status()
                return {"message": "Card deleted successfully"}
            except Exception as refresh_error:
                print(f"Token refresh failed: {refresh_error}")
                raise HTTPException(status_code=401, detail="Authentication failed. Please check your session cookie.")
        else:
            raise HTTPException(status_code=e.response.status_code, detail=f"API request failed: {e.response.reason}")
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete client card: {e}")
    except Exception as e:
        print(f"Unexpected error in delete_client_card: {e}")
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

@app.get("/debug/client-structure")
def debug_client_structure():
    """
    Debug endpoint to see the structure of existing clients
    """
    print("=" * 80)
    print("🔍 DEBUGGING CLIENT STRUCTURE")
    print("=" * 80)
    
    try:
        headers = auth_service.get_auth_headers()
        cookies = auth_service.get_session_cookies()
        
        print(f"🔑 Using headers: {json.dumps(headers, indent=2)}")
        print(f"🍪 Using cookies: {json.dumps(cookies, indent=2)}")
        
        # Get a few existing clients to see their structure
        url = 'https://api.fora.travel/v1/clients/?limit=3'
        print(f"🌐 Fetching from: {url}")
        
        response = requests.get(url, headers=headers, cookies=cookies, timeout=20)
        print(f"📊 Response status: {response.status_code}")
        print(f"📊 Response headers: {dict(response.headers)}")
        
        response.raise_for_status()
        
        data = response.json()
        print(f"✅ Successfully fetched {len(data.get('results', []))} clients")
        print(f"📄 Full response structure:")
        print(json.dumps(data, indent=2))
        
        # Analyze the structure of the first client
        if data.get('results') and len(data['results']) > 0:
            first_client = data['results'][0]
            print(f"\n🔍 ANALYZING FIRST CLIENT STRUCTURE:")
            print(f"📋 Client fields: {list(first_client.keys())}")
            
            for field, value in first_client.items():
                print(f"   {field}: {type(value).__name__} = {value}")
        
        return {
            "status": "success",
            "message": "Check console for detailed client structure analysis",
            "total_clients": len(data.get('results', [])),
            "sample_client": data.get('results', [{}])[0] if data.get('results') else {},
            "client_fields": list(data.get('results', [{}])[0].keys()) if data.get('results') else []
        }
    except Exception as e:
        print(f"❌ Error in debug_client_structure: {e}")
        import traceback
        traceback.print_exc()
        return {
            "status": "error",
            "message": str(e),
            "error_type": type(e).__name__
        }

@app.post("/debug/test-client-creation")
async def test_client_creation(request: Request):
    """
    Test endpoint to try different client creation formats
    """
    print("=" * 80)
    print("🧪 TESTING CLIENT CREATION FORMATS")
    print("=" * 80)
    
    try:
        headers = auth_service.get_auth_headers()
        cookies = auth_service.get_session_cookies()
        
        # Get test data from request
        test_data = await request.json()
        test_email = test_data.get('email', 'test@example.com')
        
        print(f"🧪 Testing with email: {test_email}")
        
        # Try different data formats
        formats_to_try = [
            {
                "name": "Format 1: Basic fields",
                "data": {
                    "first_name": test_email,
                    "last_name": "",
                    "emails": [{"email": test_email, "email_type": "primary"}],
                    "phone_numbers": [],
                    "addresses": []
                }
            },
            {
                "name": "Format 2: Minimal required",
                "data": {
                    "first_name": test_email,
                    "emails": [{"email": test_email, "email_type": "primary"}]
                }
            },
            {
                "name": "Format 3: With null last_name",
                "data": {
                    "first_name": test_email,
                    "last_name": None,
                    "emails": [{"email": test_email, "email_type": "primary"}]
                }
            }
        ]
        
        results = []
        
        for format_test in formats_to_try:
            print(f"\n🧪 Testing {format_test['name']}:")
            print(f"📄 Data: {json.dumps(format_test['data'], indent=2)}")
            
            try:
                url = 'https://api.fora.travel/v2/clients/'
                response = requests.post(url, headers=headers, cookies=cookies, json=format_test['data'], timeout=10)
                
                print(f"📊 Status: {response.status_code}")
                print(f"📄 Response: {response.text}")
                
                result = {
                    "format": format_test['name'],
                    "status_code": response.status_code,
                    "success": response.ok,
                    "response": response.text
                }
                
                if response.ok:
                    print(f"✅ {format_test['name']} - SUCCESS!")
                    result["data"] = response.json()
                else:
                    print(f"❌ {format_test['name']} - FAILED")
                    
                results.append(result)
                
            except Exception as e:
                print(f"❌ Exception in {format_test['name']}: {e}")
                results.append({
                    "format": format_test['name'],
                    "success": False,
                    "error": str(e)
                })
        
        return {
            "status": "completed",
            "results": results,
            "successful_formats": [r for r in results if r.get('success')]
        }
        
    except Exception as e:
        print(f"❌ Error in test_client_creation: {e}")
        import traceback
        traceback.print_exc()
        return {
            "status": "error",
            "message": str(e)
        }

@app.post('/api/selenium/create-card')
async def create_card_with_selenium(request: Request):
    """
    Create a card using Selenium automation with real-time progress updates.
    """
    try:
        # Parse request data
        data = await request.json()
        checkout_url = data.get('checkout_url')
        card_data = data.get('card_data', {})
        client_name = data.get('client_name', 'Testing 1')
        
        if not checkout_url:
            raise HTTPException(status_code=400, detail="checkout_url is required")
            
        # Import selenium service
        from selenium_service import selenium_service
        
        # Create progress tracking function
        progress_updates = []
        
        def progress_callback(message: str, percentage: int):
            progress_updates.append({
                "message": message,
                "percentage": percentage,
                "timestamp": time.time()
            })
        
        # Set progress callback
        selenium_service.set_progress_callback(progress_callback)
        
        # Run Selenium automation
        result = await selenium_service.create_card_with_selenium(
            checkout_url=checkout_url,
            card_data=card_data,
            client_name=client_name
        )
        
        return {
            "success": result["success"],
            "message": result["message"],
            "duration": result["duration"],
            "progress_updates": progress_updates
        }
        
    except Exception as e:
        print(f"Error in Selenium card creation: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create card with Selenium: {str(e)}")

@app.get('/api/selenium/create-card/stream')
async def create_card_with_selenium_stream(request: Request):
    """
    Create a card using Selenium automation with streaming progress updates.
    """
    try:
        # Parse request data
        data = await request.json()
        checkout_url = data.get('checkout_url')
        card_data = data.get('card_data', {})
        client_name = data.get('client_name', 'Testing 1')
        
        if not checkout_url:
            raise HTTPException(status_code=400, detail="checkout_url is required")
            
        # Import selenium service
        from selenium_service import selenium_service
        
        async def generate_progress():
            progress_updates = []
            
            def progress_callback(message: str, percentage: int):
                progress_data = {
                    "message": message,
                    "percentage": percentage,
                    "timestamp": time.time()
                }
                progress_updates.append(progress_data)
                yield f"data: {json.dumps(progress_data)}\n\n"
            
            # Set progress callback
            selenium_service.set_progress_callback(progress_callback)
            
            # Run Selenium automation
            result = await selenium_service.create_card_with_selenium(
                checkout_url=checkout_url,
                card_data=card_data,
                client_name=client_name
            )
            
            # Send final result
            final_data = {
                "type": "result",
                "success": result["success"],
                "message": result["message"],
                "duration": result["duration"]
            }
            yield f"data: {json.dumps(final_data)}\n\n"
        
        return StreamingResponse(
            generate_progress(),
            media_type="text/plain",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Content-Type": "text/event-stream"
            }
        )
        
    except Exception as e:
        print(f"Error in Selenium card creation: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create card with Selenium: {str(e)}") 