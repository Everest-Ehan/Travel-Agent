# Travel Agent API Documentation

## 🚀 Quick Start (For New Team Members)

### Get Running in 5 Minutes
```bash
# Backend
cd backend
python -m venv venv && venv\Scripts\activate  # Windows
pip install -r requirements.txt
# Add SESSION_COOKIE to .env file
uvicorn main:app --reload

# Frontend  
cd frontend
npm install && npm run dev
```

### Most Important Endpoints
```bash
GET /api/search?query=hotel_name     # Search hotels
GET /api/hotel-details/{id}          # Get hotel info  
POST /api/rates                      # Get pricing
POST /api/booking                    # Create booking
```

### Common Tasks
- **Search hotels**: Use `/api/search?query=New York`
- **Get hotel rates**: Use `/api/rates` with booking parameters
- **Create client**: Use `POST /api/clients` with client data
- **Check auth**: Use `GET /auth/status`

---

## 🔄 Overall Workflow

### 1. **Authentication Flow**
```
Session Cookie → Fora Travel API → Bearer Token → All API Requests
```
1. **Setup**: Add `SESSION_COOKIE` to `.env` file
2. **Token Fetch**: API calls `https://advisor.fora.travel/api/auth/session`
3. **Token Extraction**: Gets `accessToken` and `expires` from response
4. **Auto Refresh**: Automatically refreshes when token expires
5. **Usage**: Includes `Authorization: Bearer <token>` in all requests

### 2. **Hotel Booking Workflow**
```
Search Hotels → Get Details → Get Rates → Create Booking → Payment
```
1. **Search**: `GET /api/search?query=destination`
2. **Details**: `GET /api/hotel-details/{hotel_id}`
3. **Rates**: `POST /api/rates` with booking parameters
4. **Booking**: `POST /api/booking` with client and payment info

### 3. **Client Management Workflow**
```
Create Client → Add Payment Cards → Manage Trips → View Bookings
```
1. **Create**: `POST /api/clients` with contact information
2. **Cards**: `POST /api/clients/{id}/cards` (two-step process)
3. **Trips**: `GET /api/trips?client_id={id}`
4. **Bookings**: View through trip details

### 4. **Selenium Automation Workflow** ⚠️ **Important**
```
Checkout URL → Browser Automation → Card Creation → Fora Integration
```
**What Selenium Does:**
- Opens Chrome browser in headless mode
- Logs into Fora Travel using session cookies
- Navigates to checkout page
- Fills credit card form in TokenEx iframes
- Submits payment information
- Creates card in Fora Travel system

**Process:**
1. **Setup**: Chrome driver with authentication cookies
2. **Navigation**: Goes to provided checkout URL
3. **Client Selection**: Selects client from dropdown
4. **Form Filling**: Fills card details in secure iframes
5. **Submission**: Submits form and verifies success
6. **Integration**: Card appears in client's Fora Travel account

**Use Cases:**
- **Client Signup**: Automatically create payment method
- **Booking Payment**: Process payments during booking
- **Card Updates**: Update existing payment methods

---

## 📚 Full Documentation

### Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [API Base URL](#api-base-url)
4. [Endpoints](#endpoints)
   - [Hotel Search](#hotel-search)
   - [Hotel Details](#hotel-details)
   - [Hotel Rates](#hotel-rates)
   - [Filtered Hotels](#filtered-hotels)
   - [Rate Summary](#rate-summary)
   - [Client Management](#client-management)
   - [Card Management](#card-management)
   - [Trip Management](#trip-management)
   - [Booking Management](#booking-management)
   - [Selenium Automation](#selenium-automation)
   - [Debug Endpoints](#debug-endpoints)
   - [System Endpoints](#system-endpoints)
5. [Data Models](#data-models)
6. [Error Handling](#error-handling)
7. [Development Setup](#development-setup)
8. [Production Deployment](#production-deployment)

## Overview

The Travel Agent API is a FastAPI-based backend service that provides a comprehensive interface for managing travel bookings, hotel searches, client management, and payment processing through the Fora Travel platform. The API acts as a proxy between the frontend application and the Fora Travel API, handling authentication, data transformation, and error management.

### Key Features
- **Hotel Search & Booking**: Search hotels, get rates, and create bookings
- **Client Management**: Create and manage client profiles
- **Payment Processing**: Handle credit card operations with Selenium automation
- **Trip Management**: Manage client trips and itineraries
- **Authentication**: Secure session-based authentication with Fora Travel

## Authentication

The API uses session-based authentication with Fora Travel. Authentication is handled automatically by the `auth_service.py` module.

### Setup
1. Create a `.env` file in the `backend` directory
2. Add your Fora Travel session cookie:
   ```
   SESSION_COOKIE="your_session_cookie_here"
   ```

### Authentication Flow
1. The API reads the session cookie from environment variables
2. Makes a request to `https://advisor.fora.travel/api/auth/session`
3. Extracts the access token and user information
4. Automatically refreshes tokens when they expire
5. Includes authentication headers in all API requests

### Authentication Headers
All authenticated requests include:
```json
{
  "Authorization": "Bearer <access_token>",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "Accept": "application/json",
  "Content-Type": "application/json",
  "Referer": "https://advisor.fora.travel/partners/hotels",
  "Origin": "https://advisor.fora.travel",
  "X-Requested-With": "XMLHttpRequest"
}
```

## API Base URL

- **Development**: `http://localhost:8000`
- **Production**: Configure via environment variable `NEXT_PUBLIC_API_BASE_URL`

## Endpoints

### Hotel Search

#### GET `/api/search`
Search for hotels based on a query string.

**Parameters:**
- `query` (string, required): Search term for hotels or destinations (minimum 2 characters)

**Example Request:**
```bash
curl -X GET "http://localhost:8000/api/search?query=New%20York"
```

**Example Response:**
```json
{
  "results": [
    {
      "id": "hotel-uuid",
      "name": "The Plaza Hotel",
      "location": "New York, NY",
      "hotel_class": 5,
      "is_bookable": true,
      "labels": ["Luxury", "Historic"],
      "images": ["url1", "url2"],
      "programs": ["Virtuoso", "Signature"],
      "brand_name": "Fairmont",
      "brand_group": "Accor",
      "average_review_rating": 4.8,
      "total_review_count": 1250,
      "awards": ["Forbes 5-Star"],
      "commission_range": "10-15%",
      "payout_speed": "30 days",
      "last_year_booking_count": 45,
      "all_time_booking_count": 234,
      "gmaps_link": "https://maps.google.com/...",
      "coordinates": {"lat": 40.7645, "lng": -73.9740}
    }
  ]
}
```

### Hotel Details

#### GET `/api/hotel-details/{hotel_id}`
Get detailed information about a specific hotel.

**Parameters:**
- `hotel_id` (string, path): Unique identifier for the hotel

**Example Request:**
```bash
curl -X GET "http://localhost:8000/api/hotel-details/hotel-uuid"
```

**Example Response:**
```json
{
  "id": "hotel-uuid",
  "name": "The Plaza Hotel",
  "description": "Historic luxury hotel in Manhattan",
  "amenities": ["Spa", "Restaurant", "Concierge"],
  "room_types": ["Deluxe", "Suite", "Presidential"],
  "policies": {
    "check_in": "3:00 PM",
    "check_out": "12:00 PM",
    "cancellation": "24 hours notice required"
  }
}
```

### Hotel Rates

#### GET `/api/hotel-rates/{hotel_id}`
Get rates for a specific hotel with booking parameters.

**Parameters:**
- `hotel_id` (string, path): Unique identifier for the hotel
- `number_of_adults` (integer, query): Number of adult guests
- `rooms` (integer, query): Number of rooms needed
- `currency` (string, query): Currency code (e.g., "USD")
- `start_date` (string, query): Check-in date (YYYY-MM-DD)
- `end_date` (string, query): Check-out date (YYYY-MM-DD)

**Example Request:**
```bash
curl -X GET "http://localhost:8000/api/hotel-rates/hotel-uuid?number_of_adults=2&rooms=1&currency=USD&start_date=2025-08-14&end_date=2025-08-22"
```

**Example Response:**
```json
{
  "results": [
    {
      "rate_id": "rate-uuid",
      "room_type": "Deluxe King",
      "rate_code": "BAR",
      "price": 450.00,
      "currency": "USD",
      "cancellation_policy": "Free cancellation until 24 hours before arrival",
      "breakfast_included": true,
      "cart_id": "cart-uuid"
    }
  ]
}
```

### Filtered Hotels

#### GET `/api/filtered-hotels`
Get filtered hotels based on search criteria and booking parameters.

**Parameters:**
- `view_mode` (string, query): View mode for hotel display
- `adults` (integer, query): Number of adult guests
- `dates` (string, query): Date range for booking
- `rooms` (integer, query): Number of rooms needed
- `q` (string, query): Search query for hotels/destinations
- `currency` (string, query): Currency code (e.g., "USD")

**Example Request:**
```bash
curl -X GET "http://localhost:8000/api/filtered-hotels?view_mode=list&adults=2&dates=2025-08-14,2025-08-22&rooms=1&q=New%20York&currency=USD"
```

**Example Response:**
```json
{
  "results": [
    {
      "id": "hotel-uuid",
      "name": "The Plaza Hotel",
      "location": "New York, NY",
      "price": 450.00,
      "currency": "USD",
      "available_rooms": 5
    }
  ]
}
```

### Rate Summary

#### POST `/api/rates`
Get rate summaries for multiple hotels in a single request.

**Request Body:**
```json
{
  "currency": "USD",
  "number_of_adults": 2,
  "children_ages": [],
  "start_date": "2025-08-14",
  "end_date": "2025-08-22",
  "supplier_ids": ["hotel-uuid-1", "hotel-uuid-2"],
  "filters": {}
}
```

**Example Request:**
```bash
curl -X POST "http://localhost:8000/api/rates" \
  -H "Content-Type: application/json" \
  -d '{
    "currency": "USD",
    "number_of_adults": 2,
    "children_ages": [],
    "start_date": "2025-08-14",
    "end_date": "2025-08-22",
    "supplier_ids": ["hotel-uuid-1", "hotel-uuid-2"],
    "filters": {}
  }'
```

**Example Response:**
```json
{
  "results": [
    {
      "supplier_id": "hotel-uuid-1",
      "rates": [
        {
          "rate_id": "rate-uuid",
          "price": 450.00,
          "currency": "USD",
          "room_type": "Deluxe King"
        }
      ]
    }
  ]
}
```

### Client Management

#### GET `/api/clients`
Get a list of clients with optional search filtering.

**Parameters:**
- `search` (string, query, optional): Search query for clients
- `limit` (integer, query, optional): Number of clients to return (default: 1000)
- `booking_loyalty_programs` (boolean, query, optional): Include booking loyalty programs (default: true)

**Example Request:**
```bash
curl -X GET "http://localhost:8000/api/clients?search=John&limit=50"
```

**Example Response:**
```json
{
  "results": [
    {
      "id": "client-uuid",
      "first_name": "John",
      "last_name": "Doe",
      "emails": [{"email": "john@example.com", "email_type": "primary"}],
      "phone_numbers": [{"phone_number": "+1234567890", "number_type": "mobile"}],
      "addresses": [
        {
          "label": "Home",
          "country_id": "US",
          "country_name": "United States",
          "state": "CA",
          "city": "Los Angeles",
          "address": "123 Main St"
        }
      ]
    }
  ]
}
```

#### POST `/api/clients`
Create a new client.

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "emails": [{"email": "john@example.com", "email_type": "primary"}],
  "phone_numbers": [{"phone_number": "+1234567890", "number_type": "mobile"}],
  "addresses": [
    {
      "label": "Home",
      "country_id": "US",
      "country_name": "United States",
      "state": "CA",
      "city": "Los Angeles",
      "address": "123 Main St"
    }
  ]
}
```

**Example Request:**
```bash
curl -X POST "http://localhost:8000/api/clients" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "emails": [{"email": "john@example.com", "email_type": "primary"}],
    "phone_numbers": [{"phone_number": "+1234567890", "number_type": "mobile"}],
    "addresses": [
      {
        "label": "Home",
        "country_id": "US",
        "country_name": "United States",
        "state": "CA",
        "city": "Los Angeles",
        "address": "123 Main St"
      }
    ]
  }'
```

**Example Response:**
```json
{
  "id": "client-uuid",
  "first_name": "John",
  "last_name": "Doe",
  "emails": [{"email": "john@example.com", "email_type": "primary"}],
  "phone_numbers": [{"phone_number": "+1234567890", "number_type": "mobile"}],
  "addresses": [...],
  "created_at": "2025-01-15T10:30:00Z"
}
```

### Card Management

#### GET `/api/clients/{client_id}/cards`
Get all payment cards for a specific client.

**Parameters:**
- `client_id` (string, path): Unique identifier for the client

**Example Request:**
```bash
curl -X GET "http://localhost:8000/api/clients/client-uuid/cards"
```

**Example Response:**
```json
{
  "results": [
    {
      "id": "card-uuid",
      "card_type": "Visa",
      "last_four": "1234",
      "expiry_month": 12,
      "expiry_year": 2025,
      "cardholder_name": "John Doe",
      "is_default": true
    }
  ]
}
```

#### POST `/api/clients/{client_id}/cards`
Create a new payment card for a client (two-step process: POST then PUT).

**Parameters:**
- `client_id` (string, path): Unique identifier for the client

**Request Body:**
```json
{
  "card_type": "Visa",
  "cardholder_name": "John Doe",
  "expiry_month": 12,
  "expiry_year": 2025,
  "billing_address": {
    "address_1": "123 Main St",
    "address_2": "Apt 1",
    "city": "Los Angeles",
    "state": "CA",
    "postal_code": "90210",
    "country_id": 1
  }
}
```

#### PUT `/api/clients/{client_id}/cards/{card_id}`
Update an existing payment card.

**Parameters:**
- `client_id` (string, path): Unique identifier for the client
- `card_id` (string, path): Unique identifier for the card

#### DELETE `/api/clients/{client_id}/cards/{card_id}`
Delete a payment card.

**Parameters:**
- `client_id` (string, path): Unique identifier for the client
- `card_id` (string, path): Unique identifier for the card

#### GET `/api/clients/{client_id}/cards/{card_id}/reveal`
Reveal sensitive card information (card number, CVV).

**Parameters:**
- `client_id` (string, path): Unique identifier for the client
- `card_id` (string, path): Unique identifier for the card

**Example Response:**
```json
{
  "id": "card-uuid",
  "card_number": "4111111111111111",
  "cvv": "123",
  "card_type": "Visa",
  "last_four": "1111",
  "expiry_month": 12,
  "expiry_year": 2025,
  "cardholder_name": "John Doe"
}
```

### Trip Management

#### GET `/api/trips`
Get trips for a specific client.

**Parameters:**
- `client_id` (string, query): Client ID to search trips for

**Example Request:**
```bash
curl -X GET "http://localhost:8000/api/trips?client_id=client-uuid"
```

**Example Response:**
```json
{
  "results": [
    {
      "id": "trip-uuid",
      "name": "Hawaii Vacation",
      "start_date": "2025-08-14",
      "end_date": "2025-08-22",
      "status": "confirmed",
      "client_id": "client-uuid",
      "bookings": [...]
    }
  ]
}
```

#### GET `/api/trips/{trip_id}`
Get detailed information for a specific trip.

**Parameters:**
- `trip_id` (string, path): Unique identifier for the trip

**Example Request:**
```bash
curl -X GET "http://localhost:8000/api/trips/trip-uuid"
```

### Booking Management

#### POST `/api/booking`
Create a new booking.

**Request Body:**
```json
{
  "booking_code": "BK123456",
  "cart_id": "cart-uuid",
  "children_ages": [],
  "client_card_id": "card-uuid",
  "client_id": "client-uuid",
  "client_loyalty_program_id": null,
  "currency": "USD",
  "deposits": [],
  "end_date": "2025-08-22",
  "expected_amount": 450.00,
  "expected_currency": "USD",
  "number_of_adults": 2,
  "program_id": "program-uuid",
  "rate_code": "BAR",
  "rate_id": "rate-uuid",
  "room_description": "Deluxe King Room",
  "start_date": "2025-08-14",
  "supplier_id": "hotel-uuid",
  "supplier_program_id": "supplier-program-uuid",
  "trip_id": null,
  "trip_name": "Hawaii Vacation",
  "use_advisor_contact_info": false,
  "billing_address": {
    "address_1": "123 Main St",
    "address_2": "Apt 1",
    "postal_code": "90210",
    "city": "Los Angeles",
    "state": "CA",
    "country_id": 1
  }
}
```

**Example Request:**
```bash
curl -X POST "http://localhost:8000/api/booking" \
  -H "Content-Type: application/json" \
  -d '{
    "booking_code": "BK123456",
    "cart_id": "cart-uuid",
    "client_card_id": "card-uuid",
    "client_id": "client-uuid",
    "currency": "USD",
    "end_date": "2025-08-22",
    "expected_amount": 450.00,
    "number_of_adults": 2,
    "rate_id": "rate-uuid",
    "start_date": "2025-08-14",
    "supplier_id": "hotel-uuid",
    "trip_name": "Hawaii Vacation"
  }'
```

#### POST `/api/bookings/{unique_id}/cancel`
Cancel a specific booking.

**Parameters:**
- `unique_id` (string, path): Unique identifier for the booking

**Example Request:**
```bash
curl -X POST "http://localhost:8000/api/bookings/booking-uuid/cancel"
```

**Example Response:**
```json
{
  "success": true,
  "message": "Booking cancelled successfully"
}
```

### Selenium Automation

#### POST `/api/selenium/create-card`
Create a payment card using Selenium automation.

**What This Does:**
- Opens Chrome browser in headless mode
- Logs into Fora Travel using session cookies
- Navigates to checkout page
- Fills credit card form in TokenEx iframes
- Submits payment information
- Creates card in Fora Travel system

**Workflow:**
1. **Browser Setup**: Chrome driver with authentication
2. **Login**: Uses session cookies to authenticate
3. **Navigation**: Goes to provided checkout URL
4. **Client Selection**: Selects client from dropdown
5. **Form Filling**: Fills card details in secure iframes
6. **Submission**: Submits form and verifies success

**Request Body:**
```json
{
  "checkout_url": "https://advisor.fora.travel/checkout/...",
  "card_data": {
    "number": "4111111111111111",
    "cvv": "123",
    "expiry": "12/25",
    "name": "John Doe",
    "address": "123 Main St"
  },
  "client_name": "John Doe"
}
```

**Example Request:**
```bash
curl -X POST "http://localhost:8000/api/selenium/create-card" \
  -H "Content-Type: application/json" \
  -d '{
    "checkout_url": "https://advisor.fora.travel/checkout/...",
    "card_data": {
      "number": "4111111111111111",
      "cvv": "123",
      "expiry": "12/25",
      "name": "John Doe",
      "address": "123 Main St"
    },
    "client_name": "John Doe"
  }'
```

**Example Response:**
```json
{
  "success": true,
  "message": "Card created successfully via Selenium",
  "duration": "45.23 seconds",
  "progress_updates": [
    {
      "message": "Setting up Chrome driver...",
      "percentage": 5,
      "timestamp": 1642234567.123
    },
    {
      "message": "Logging into Fora Travel...",
      "percentage": 15,
      "timestamp": 1642234568.456
    },
    {
      "message": "Navigating to checkout...",
      "percentage": 30,
      "timestamp": 1642234569.789
    },
    {
      "message": "Filling card form...",
      "percentage": 70,
      "timestamp": 1642234570.123
    },
    {
      "message": "Submitting payment...",
      "percentage": 90,
      "timestamp": 1642234571.456
    },
    {
      "message": "Card created successfully!",
      "percentage": 100,
      "timestamp": 1642234572.789
    }
  ]
}
```

**Use Cases:**
- **Client Signup**: Automatically create payment method during registration
- **Booking Payment**: Process payments during hotel booking
- **Card Updates**: Update existing payment methods
- **Payment Processing**: Handle secure payment information entry

#### GET `/api/selenium/create-card/stream`
Create a payment card using Selenium automation with real-time streaming progress updates.

**What This Does:**
- Same functionality as `/api/selenium/create-card` but with streaming progress
- Provides real-time updates during the automation process
- Uses Server-Sent Events (SSE) for live progress tracking

**Request Body:**
```json
{
  "checkout_url": "https://advisor.fora.travel/checkout/...",
  "card_data": {
    "number": "4111111111111111",
    "cvv": "123",
    "expiry": "12/25",
    "name": "John Doe",
    "address": "123 Main St"
  },
  "client_name": "John Doe"
}
```

**Example Request:**
```bash
curl -X GET "http://localhost:8000/api/selenium/create-card/stream" \
  -H "Content-Type: application/json" \
  -d '{
    "checkout_url": "https://advisor.fora.travel/checkout/...",
    "card_data": {
      "number": "4111111111111111",
      "cvv": "123",
      "expiry": "12/25",
      "name": "John Doe",
      "address": "123 Main St"
    },
    "client_name": "John Doe"
  }'
```

**Streaming Response:**
```
data: {"message": "Setting up Chrome driver...", "percentage": 5, "timestamp": 1642234567.123}

data: {"message": "Logging into Fora Travel...", "percentage": 15, "timestamp": 1642234568.456}

data: {"message": "Navigating to checkout...", "percentage": 30, "timestamp": 1642234569.789}

data: {"message": "Filling card form...", "percentage": 70, "timestamp": 1642234570.123}

data: {"message": "Submitting payment...", "percentage": 90, "timestamp": 1642234571.456}

data: {"message": "Card created successfully!", "percentage": 100, "timestamp": 1642234572.789}

data: {"type": "result", "success": true, "message": "Card created successfully via Selenium", "duration": "45.23 seconds"}
```

**Use Cases:**
- **Real-time Progress**: Show live progress to users during card creation
- **Long Operations**: Handle time-consuming automation tasks
- **User Feedback**: Provide immediate feedback during payment processing

### Debug Endpoints

#### GET `/auth/status`
Check authentication status and user information.

**Example Request:**
```bash
curl -X GET "http://localhost:8000/auth/status"
```

**Example Response:**
```json
{
  "status": "authenticated",
  "user": {
    "email": "advisor@example.com",
    "name": "Travel Advisor"
  },
  "message": "Authentication successful"
}
```

#### GET `/debug/client-structure`
Debug endpoint to see the structure of existing clients.

**Example Request:**
```bash
curl -X GET "http://localhost:8000/debug/client-structure"
```

#### POST `/debug/test-client-creation`
Test different client creation formats.

**Request Body:**
```json
{
  "email": "test@example.com"
}
```

### System Endpoints

#### GET `/`
Check if the FastAPI server is running.

**Example Request:**
```bash
curl -X GET "http://localhost:8000/"
```

**Example Response:**
```json
{
  "status": "FastAPI server is running."
}
```

#### GET `/test-rates`
Test endpoint to check if the rate API is working with a simple request.

**Example Request:**
```bash
curl -X GET "http://localhost:8000/test-rates"
```

**Example Response:**
```json
{
  "status": "success",
  "data": {
    "results": [
      {
        "supplier_id": "hotel-uuid",
        "rates": [
          {
            "rate_id": "rate-uuid",
            "price": 450.00,
            "currency": "USD",
            "room_type": "Deluxe King"
          }
        ]
      }
    ]
  }
}
```

**Use Cases:**
- **Health Check**: Verify API connectivity and authentication
- **Testing**: Test rate API functionality with sample data
- **Debugging**: Troubleshoot authentication or API issues

## Data Models

### Hotel
```typescript
interface Hotel {
  id: string;
  name: string;
  location: string;
  hotel_class: number;
  is_bookable: boolean;
  labels: string[];
  images: string[];
  programs: string[];
  brand_name: string;
  brand_group: string;
  average_review_rating: number;
  total_review_count: number;
  awards: string[];
  commission_range: string;
  payout_speed: string;
  last_year_booking_count: number;
  all_time_booking_count: number;
  gmaps_link: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}
```

### Client
```typescript
interface Client {
  id: string;
  first_name: string;
  last_name: string;
  emails: Array<{
    email: string;
    email_type: string;
  }>;
  phone_numbers: Array<{
    phone_number: string;
    number_type: string;
  }>;
  addresses: Array<{
    label: string;
    country_id: string | null;
    country_name: string;
    state: string;
    city: string;
    address: string;
  }>;
}
```

### Card
```typescript
interface Card {
  id: string;
  card_type: string;
  last_four: string;
  expiry_month: number;
  expiry_year: number;
  cardholder_name: string;
  is_default: boolean;
}
```

### Booking
```typescript
interface Booking {
  booking_code: string;
  cart_id: string;
  client_card_id: string;
  client_id: string;
  currency: string;
  end_date: string;
  expected_amount: number;
  number_of_adults: number;
  rate_id: string;
  start_date: string;
  supplier_id: string;
  trip_name: string;
}
```

## Error Handling

The API uses standard HTTP status codes and returns error details in JSON format.

### Common Error Responses

**400 Bad Request:**
```json
{
  "detail": "Missing required fields: ['first_name', 'emails']"
}
```

**401 Unauthorized:**
```json
{
  "detail": "Authentication failed. Please check your session cookie."
}
```

**404 Not Found:**
```json
{
  "detail": "Hotel not found"
}
```

**500 Internal Server Error:**
```json
{
  "detail": "An internal server error occurred."
}
```

### Error Handling Best Practices

1. **Always check response status** before processing data
2. **Handle authentication errors** by refreshing session cookies
3. **Validate required fields** before making requests
4. **Implement retry logic** for transient failures
5. **Log error details** for debugging

## Development Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- Chrome browser (for Selenium automation)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create `.env` file:
   ```
   SESSION_COOKIE="your_fora_travel_session_cookie"
   ```

5. Start the server:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Testing the API
1. Check if the server is running:
   ```bash
   curl http://localhost:8000/
   ```

2. Test authentication:
   ```bash
   curl http://localhost:8000/auth/status
   ```

3. Test hotel search:
   ```bash
   curl "http://localhost:8000/api/search?query=New%20York"
   ```

## Production Deployment

### Environment Variables
```bash
# Required
SESSION_COOKIE="your_production_session_cookie"
NEXT_PUBLIC_API_BASE_URL="https://your-api-domain.com"

# Optional
LOG_LEVEL="INFO"
CORS_ORIGINS="https://your-frontend-domain.com"
```

### Security Considerations
1. **Use HTTPS** in production
2. **Implement proper CORS** configuration
3. **Add rate limiting** to prevent abuse
4. **Secure session cookies** with proper flags
5. **Implement logging** and monitoring
6. **Use environment variables** for sensitive data
7. **Regular security updates** for dependencies

### Deployment Options
1. **Docker**: Containerize the application
2. **Cloud Platforms**: Deploy to AWS, GCP, or Azure
3. **Serverless**: Use AWS Lambda or similar
4. **Traditional VPS**: Deploy to a virtual private server

### Monitoring and Logging
1. **Application logs**: Monitor API requests and errors
2. **Performance metrics**: Track response times and throughput
3. **Error tracking**: Implement error reporting (Sentry, etc.)
4. **Health checks**: Monitor service availability
5. **Authentication monitoring**: Track failed login attempts

---

## Support and Maintenance

For technical support or questions about the API:
1. Check the debug endpoints for troubleshooting
2. Review server logs for error details
3. Verify authentication status
4. Test with minimal request data
5. Contact the development team for assistance

---

