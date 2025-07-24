# Fora Travel Hotel Search Application

A full-stack hotel search application with a Next.js frontend and FastAPI backend that dynamically scrapes hotel data from the Fora Travel API.

## Project Structure

```
/fora-search-app
├── /backend/
│   ├── main.py
│   ├── requirements.txt
│   └── .env (create this file)
└── /frontend/
    ├── /app/
    │   ├── globals.css
    │   ├── layout.tsx
    │   └── page.tsx
    ├── next.config.js
    ├── package.json
    ├── postcss.config.js
    ├── tailwind.config.ts
    └── tsconfig.json
```

## Setup Instructions

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment (recommended):**
   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment:**
   - Windows:
     ```bash
     venv\Scripts\activate
     ```
   - macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Create a `.env` file in the backend directory:**
   ```bash
   # backend/.env
   BEARER_TOKEN="your_bearer_token_here"
   SESSION_COOKIE="your_session_cookie_here"
   ```

   **Important:** You need to obtain these tokens from the Fora Travel website:
   - Log into https://advisor.fora.travel/
   - Open browser developer tools (F12)
   - Go to Network tab
   - Make a search request
   - Find the request to the API and copy:
     - The `Authorization` header value (Bearer token)
     - The `__Secure-next-auth.session-token` cookie value

6. **Run the FastAPI server:**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

   The backend will be available at: http://localhost:8000

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

   The frontend will be available at: http://localhost:3000

## Features

### Frontend
- **Modern UI**: Clean, responsive design with Tailwind CSS
- **Search Interface**: Large search bar with real-time search
- **Rich Hotel Cards**: Display comprehensive hotel information including:
  - High-quality hotel images from Cloudinary
  - Hotel class ratings (1-5 stars)
  - Brand information and location
  - Average review ratings with star display
  - Awards and accolades (e.g., MICHELIN Keys)
  - Partnership programs and logos
  - Commission rates and payout information
  - Booking statistics
  - Direct links to Google Maps
  - Bookable status indicators
- **Error Handling**: User-friendly error messages
- **Loading States**: Visual feedback during API calls
- **Responsive Design**: Works on desktop and mobile devices
- **Hover Effects**: Smooth animations and transitions

### Backend
- **FastAPI Server**: High-performance Python web framework
- **CORS Support**: Allows frontend to communicate with backend
- **API Integration**: Connects to Fora Travel API
- **Error Handling**: Comprehensive error handling and logging
- **Environment Variables**: Secure token management

## API Endpoints

### GET /api/search
Search for hotels using the Fora Travel API.

**Parameters:**
- `query` (string, required): Search term for hotels or destinations

**Example:**
```
GET http://localhost:8000/api/search?query=paris
```

**Response:**
```json
{
  "results": [
    {
      "id": "hotel_id",
      "name": "Hotel Name",
      "location": "Paris, France",
      "rating": 4.5,
      "price": "$200/night",
      "image": "https://example.com/image.jpg",
      "description": "Hotel description..."
    }
  ]
}
```

## Usage

1. Start both the backend and frontend servers
2. Open http://localhost:3000 in your browser
3. Enter a search term (e.g., "Paris", "New York", "Tokyo")
4. Click "Search" or press Enter
5. View the hotel results

## Troubleshooting

### Common Issues

1. **"Server is missing authentication tokens"**
   - Make sure you've created the `.env` file in the backend directory
   - Verify your Bearer token and session cookie are correct
   - Tokens may expire - you may need to refresh them

2. **"Authentication failed"**
   - Your tokens may have expired
   - Re-login to Fora Travel and get fresh tokens

3. **Frontend can't connect to backend**
   - Ensure the backend is running on port 8000
   - Check that CORS is properly configured
   - Verify the frontend is making requests to `http://localhost:8000`

4. **No hotels found**
   - Try different search terms
   - Check the browser console for API errors
   - Verify the API response format

### Getting Fresh Tokens

If your tokens expire:

1. Go to https://advisor.fora.travel/
2. Log in to your account
3. Open browser developer tools (F12)
4. Go to the Network tab
5. Make a search on the website
6. Find the API request and copy the new tokens
7. Update your `.env` file

## Development

### Backend Development
- The main API logic is in `backend/main.py`
- Add new endpoints by creating new route functions
- Use `uvicorn main:app --reload` for development with auto-reload

### Frontend Development
- The main page is in `frontend/app/page.tsx`
- Styles are in `frontend/app/globals.css`
- Tailwind CSS is configured in `frontend/tailwind.config.ts`

## Security Notes

- Never commit your `.env` file to version control
- Keep your API tokens secure
- The application is for development/prototype use only
- Consider implementing rate limiting for production use

## License

This project is for educational and development purposes only. 