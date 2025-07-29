# Travel Agent Application

A comprehensive travel booking application built with Next.js frontend and FastAPI backend, integrating with the Fora Travel API.

## Features

### Hotel Search and Booking
- Search for hotels by destination
- View hotel details, rates, and availability
- Book hotels with client information
- Real-time rate fetching and comparison

### Client Management
- Create and manage client profiles
- Store client contact information and addresses
- Manage client payment cards securely

### Card Management
- Add payment cards for clients using Selenium automation
- **NEW: Card Reveal Functionality** - Reveal card information (card number, CVV, billing address) when needed
- Delete cards when no longer needed
- Secure card storage and retrieval

### Authentication
- User authentication with Supabase
- Email verification
- Password reset functionality
- Guest access for hotel browsing

## Card Reveal Feature

The application now includes a card reveal functionality that allows users to reveal sensitive card information when needed for booking purposes.

### How it Works

1. **Backend API Endpoint**: `/api/clients/{client_id}/cards/{card_id}/reveal`
   - Makes a secure request to the Fora Travel API
   - Returns revealed card information including card number, CVV, and billing address

2. **Frontend Integration**:
   - Available in both the booking page and client management components
   - Click the "Reveal" button next to any card to reveal its information
   - Revealed information is displayed in a secure, highlighted section
   - Once revealed, the button shows "✓ Revealed" and cannot be clicked again

3. **Security Features**:
   - Card information is only revealed when explicitly requested
   - Revealed data is stored temporarily in the frontend state
   - No sensitive data is logged or stored permanently
   - Uses proper authentication headers for API requests

### Usage

1. Navigate to the booking page or client management
2. Select a client to view their cards
3. Click the "Reveal" button next to any card
4. The card information will be displayed in a blue highlighted section
5. Use this information for booking purposes

### API Endpoint Details

```http
GET /api/clients/{client_id}/cards/{card_id}/reveal
```

**Response**: Returns the revealed card information including:
- `card_number`: The full card number
- `cvv`: The card's CVV code
- `billing_address`: The billing address associated with the card

## Setup and Installation

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+ and pip
- Chrome browser (for Selenium automation)

### Backend Setup
1. Navigate to the `backend` directory
2. Create a virtual environment: `python -m venv venv`
3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`
4. Install dependencies: `pip install -r requirements.txt`
5. Create a `.env` file with your session cookie:
   ```
   SESSION_COOKIE="your_session_cookie_here"
   ```
6. Run the backend: `python main.py`

### Frontend Setup
1. Navigate to the `frontend` directory
2. Install dependencies: `npm install`
3. Create a `.env.local` file with your Supabase configuration:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
   ```
4. Run the frontend: `npm run dev`

### Quick Start
Use the provided scripts:
- Windows: `start.bat`
- PowerShell: `start.ps1`

## API Integration

The application integrates with the Fora Travel API for:
- Hotel search and details
- Rate fetching and comparison
- Client and card management
- Booking creation
- Card reveal functionality

## Security Considerations

- Session cookies are required for API access
- Card information is only revealed when explicitly requested
- No sensitive data is stored permanently in the frontend
- All API requests use proper authentication headers
- Error handling prevents exposure of sensitive information

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License. 