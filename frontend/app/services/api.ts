import { Hotel, RateSummaryRequest, RateSummaryResponse, HotelRatesResponse } from '../types/hotel'


const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
console.log('API_BASE_URL', API_BASE_URL)

export class ApiService {
  static async searchHotels(query: string): Promise<Hotel[]> {
    try {
      const url = `${API_BASE_URL}/api/search?query=${encodeURIComponent(query)}`
      console.log('🔍 Making request to:', url)
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
      })
      
      console.log('📡 Response status:', response.status)
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()))
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ API Error:', errorData)
        throw new Error(errorData.detail || 'Failed to search hotels')
      }

      const data = await response.json()
      console.log('✅ API /api/search response:', data)
      
      // Transform the API response to match our Hotel interface
      const transformedHotels = data.results?.map((hotel: any) => ({
        id: hotel.id,
        name: hotel.name,
        location: hotel.location,
        hotel_class: hotel.hotel_class,
        is_bookable: hotel.is_bookable,
        labels: hotel.labels,
        images: hotel.images,
        programs: hotel.programs,
        brand_name: hotel.brand_name,
        brand_group: hotel.brand_group,
        average_review_rating: hotel.average_review_rating,
        total_review_count: hotel.total_review_count,
        awards: hotel.awards,
        commission_range: hotel.commission_range,
        payout_speed: hotel.payout_speed,
        last_year_booking_count: hotel.last_year_booking_count,
        all_time_booking_count: hotel.all_time_booking_count,
        gmaps_link: hotel.gmaps_link,
        coordinates: hotel.coordinates
      })) || []

      return transformedHotels
    } catch (error) {
      console.error('💥 Error searching hotels:', error)
      console.error('💥 Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : 'Unknown'
      })
      throw error
    }
  }

  static async getRateSummary(request: RateSummaryRequest): Promise<RateSummaryResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/rates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.log('API /api/rates error response:', errorData)
        throw new Error(errorData.detail || 'Failed to fetch rates')
      }

      const rateData = await response.json()
      console.log('API /api/rates response:', rateData)
      return rateData
    } catch (error) {
      console.error('Error fetching rates:', error)
      throw error
    }
  }

  // Fetch hotel details by ID (for card click)
  static async fetchHotelDetails(hotelId: string, params?: Record<string, any>) {
    let url = `${API_BASE_URL}/api/hotel-details/${hotelId}`;
    if (params) {
      const query = new URLSearchParams(params as any).toString();
      url += `?${query}`;
    }
    try {
      const response = await fetch(url, {
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error fetching hotel details:', errorData);
        throw new Error(errorData.detail || 'Failed to fetch hotel details');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching hotel details:', error);
      throw error;
    }
  }



  // Card management functions
  static async getClientCards(clientId: string) {
    try {
      const url = `${API_BASE_URL}/api/clients/${clientId}/cards`;
      console.log('🔍 Making request to:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ API Error:', errorData);
        throw new Error(errorData.detail || 'Failed to fetch client cards');
      }

      // Expect {results: Card[]}
      const data = await response.json();
      console.log('✅ API /api/clients/{clientId}/cards response:', data);
      return data;
    } catch (error) {
      console.error('Error fetching client cards:', error);
      throw error;
    }
  }

  static async createClientCard(clientId: string, cardData: any) {
    // Backend now handles two-step POST-then-PUT
    try {
      const url = `${API_BASE_URL}/api/clients/${clientId}/cards`;
      console.log('🔍 Making request to:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(cardData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ API Error:', errorData);
        throw new Error(errorData.detail || 'Failed to create client card');
      }

      const data = await response.json();
      console.log('✅ API /api/clients/{clientId}/cards POST response:', data);
      return data;
    } catch (error) {
      console.error('Error creating client card:', error);
      throw error;
    }
  }

  static async updateClientCard(clientId: string, cardId: string, cardData: any) {
    try {
      const url = `${API_BASE_URL}/api/clients/${clientId}/cards/${cardId}`;
      console.log('🔍 Making request to:', url);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(cardData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ API Error:', errorData);
        throw new Error(errorData.detail || 'Failed to update client card');
      }

      const data = await response.json();
      console.log('✅ API /api/clients/{clientId}/cards/{cardId} PUT response:', data);
      return data;
    } catch (error) {
      console.error('Error updating client card:', error);
      throw error;
    }
  }

  static async deleteClientCard(clientId: string, cardId: string) {
    try {
      const url = `${API_BASE_URL}/api/clients/${clientId}/cards/${cardId}`;
      console.log('🔍 Making request to:', url);
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ API Error:', errorData);
        throw new Error(errorData.detail || 'Failed to delete client card');
      }

      const data = await response.json();
      console.log('✅ API /api/clients/{clientId}/cards/{cardId} DELETE response:', data);
      return data;
    } catch (error) {
      console.error('Error deleting client card:', error);
      throw error;
    }
  }

  // Reveal card information
  static async revealClientCard(clientId: string, cardId: string): Promise<any> {
    try {
      const url = `${API_BASE_URL}/api/clients/${clientId}/cards/${cardId}/reveal`;
      console.log('🔍 Making card reveal request to:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ API Error:', errorData);
        throw new Error(errorData.detail || 'Failed to reveal card information');
      }

      const data = await response.json();
      console.log('✅ API /api/clients/{clientId}/cards/{cardId}/reveal response:', data);
      return data;
    } catch (error) {
      console.error('Error revealing card information:', error);
      throw error;
    }
  }

  // Fetch filtered hotel list (with user filters)
  static async fetchFilteredHotels(params: {view_mode: string, adults: number, dates: string, rooms: number, q: string, currency: string}) {
    // Call backend proxy endpoint
    const query = new URLSearchParams(params as any).toString();
    const url = `${API_BASE_URL}/api/filtered-hotels?${query}`;
    try {
      const response = await fetch(url, {
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error fetching filtered hotels:', errorData);
        throw new Error(errorData.detail || 'Failed to fetch filtered hotels');
      }
      const data = await response.json();
      console.log('Filtered hotels response:', data);
      return data;
    } catch (error) {
      console.error('Error fetching filtered hotels:', error);
      throw error;
    }
  }

  // Fetch hotel rates for a specific hotel
  static async fetchHotelRates(
    hotelId: string, 
    params: {
      number_of_adults: number
      rooms: number
      currency: string
      start_date: string
      end_date: string
    }
  ): Promise<HotelRatesResponse> {
    const query = new URLSearchParams(params as any).toString();
    const url = `${API_BASE_URL}/api/hotel-rates/${hotelId}?${query}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error fetching hotel rates:', errorData);
        throw new Error(errorData.detail || 'Failed to fetch hotel rates');
      }
      
      const data = await response.json();
      console.log('Hotel rates response:', data);
      return data;
    } catch (error) {
      console.error('Error fetching hotel rates:', error);
      throw error;
    }
  }

  // Fetch clients
  static async fetchClients(search: string = ''): Promise<any> {
    const query = new URLSearchParams({
      search: search,
      limit: '1000',
      booking_loyalty_programs: 'true'
    }).toString();
    const url = `${API_BASE_URL}/api/clients?${query}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error fetching clients:', errorData);
        throw new Error(errorData.detail || 'Failed to fetch clients');
      }
      
      const data = await response.json();
      console.log('Clients response:', data);
      return data;
    } catch (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }
  }

  // Create a new client
  static async createClient(clientData: {
    first_name: string
    last_name: string
    addresses: Array<{
      label: string
      country_id: string | null
      country_name: string
      state: string
      city: string
      address: string
    }>
    emails: Array<{ email: string; email_type: string }>
    phone_numbers: Array<{ phone_number: string; number_type: string }>
  }): Promise<any> {
    const url = `${API_BASE_URL}/api/clients`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(clientData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error creating client:', errorData);
        throw new Error(errorData.detail || 'Failed to create client');
      }
      
      const data = await response.json();
      console.log('Client created:', data);
      return data;
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  }

  // Create a booking
  static async createBooking(bookingData: {
    booking_code: string
    cart_id: string
    children_ages: number[]
    client_card_id: string
    client_id: string
    client_loyalty_program_id: string | null
    currency: string
    deposits: any[]
    end_date: string
    expected_amount: number
    expected_currency: string
    number_of_adults: number
    program_id: string
    rate_code: string
    rate_id: string
    room_description: string
    start_date: string
    supplier_id: string
    supplier_program_id: string
    trip_id: string | null
    trip_name: string
    use_advisor_contact_info: boolean
    billing_address?: {
      address_1: string
      address_2?: string
      postal_code: string
      city: string
      state: string
      country_id: number
    }
  }): Promise<any> {
    const url = `${API_BASE_URL}/api/booking`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(bookingData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error creating booking:', errorData);
        throw new Error(errorData.detail || 'Failed to create booking');
      }
      
      const data = await response.json();
      console.log('Booking created:', data);
      return data;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  }

  // Create a card using Selenium automation
  static async createCardWithSelenium(checkoutUrl: string, cardData: any, clientName: string = 'Testing 1'): Promise<any> {
    const url = `${API_BASE_URL}/api/selenium/create-card`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({
          checkout_url: checkoutUrl,
          card_data: cardData,
          client_name: clientName
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error creating card with Selenium:', errorData);
        throw new Error(errorData.detail || 'Failed to create card with Selenium');
      }
      
      const data = await response.json();
      console.log('Card created with Selenium:', data);
      return data;
    } catch (error) {
      console.error('Error creating card with Selenium:', error);
      throw error;
    }
  }

  // Fetch trips for a specific client
  static async fetchTrips(clientId: string): Promise<any> {
    const url = `${API_BASE_URL}/api/trips?client_id=${encodeURIComponent(clientId)}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error fetching trips:', errorData);
        throw new Error(errorData.detail || 'Failed to fetch trips');
      }
      
      const data = await response.json();
      console.log('Trips response:', data);
      return data;
    } catch (error) {
      console.error('Error fetching trips:', error);
      throw error;
    }
  }

    // Fetch detailed trip information
  static async fetchTripDetails(tripId: string): Promise<any> {
    const url = `${API_BASE_URL}/api/trips/${encodeURIComponent(tripId)}`;

    try {
      const response = await fetch(url, {
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error fetching trip details:', errorData);
        throw new Error(errorData.detail || 'Failed to fetch trip details');
      }

      const data = await response.json();
      console.log('Trip details response:', data);
      return data;
    } catch (error) {
      console.error('Error fetching trip details:', error);
      throw error;
    }
  }

  // Cancel a booking
  static async cancelBooking(uniqueId: string): Promise<any> {
    const url = `${API_BASE_URL}/api/bookings/${encodeURIComponent(uniqueId)}/cancel`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error cancelling booking:', errorData);
        throw new Error(errorData.detail || 'Failed to cancel booking');
      }

      const data = await response.json();
      console.log('Cancel booking response:', data);
      return data;
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw error;
    }
  }

  // Fetch featured hotels from Fora API
  static async fetchFeaturedHotels(): Promise<any[]> {
    const url = 'https://api.fora.travel/v2/user-supplier-list/bdd9fe6d-4482-4996-9508-536f89c2008d/suppliers/';
    
    console.log('🔍 Fetching featured hotels from:', url);
    console.log('🔍 Starting API call...');
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      
      console.log('📡 Featured hotels response status:', response.status);
      console.log('📡 Featured hotels response ok:', response.ok);
      console.log('📡 Featured hotels response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        console.error('❌ Response not ok:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('❌ Error response body:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      // First get the raw text response
      console.log('🔍 Getting raw response text...');
      const responseText = await response.text();
      console.log('📝 RAW RESPONSE TEXT:', responseText);
      
      // Then parse it as JSON
      console.log('🔍 About to parse JSON response...');
      console.log('🔍 Response text length:', responseText.length);
      console.log('🔍 Response text starts with:', responseText.substring(0, 100));
      
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('✅ JSON parsing successful!');
      } catch (parseError) {
        console.error('💥 JSON parsing failed:', parseError);
        console.error('💥 Raw text that failed to parse:', responseText);
        throw new Error(`Failed to parse JSON response: ${parseError}`);
      }
      console.log('✅ Featured hotels API SUCCESS!');
      console.log('✅ RAW API RESPONSE (FULL):', data);
      console.log('✅ RAW API RESPONSE (STRINGIFIED):', JSON.stringify(data, null, 2));
      console.log('✅ Response type:', typeof data);
      console.log('✅ Response is array:', Array.isArray(data));
      console.log('✅ Featured hotels count:', data ? data.length : 'data is null/undefined');
      console.log('✅ Featured hotels data structure:', data && data[0] ? Object.keys(data[0]) : 'No first item or data is empty');
      
      // Log each hotel's ID to verify
      if (data && data.length > 0) {
        console.log('✅ Hotel IDs from API:');
        data.slice(0, 5).forEach((hotel: any, index: number) => {
          console.log(`   ${index + 1}. ID: ${hotel.id} | Name: ${hotel.name}`);
        });
      }
      
      console.log('✅ Returning real API data:', data.length, 'hotels');
      return data;
      
    } catch (error) {
      console.error('💥 FAILED to fetch featured hotels:', error);
      console.error('💥 Error type:', error && typeof error === 'object' && 'constructor' in error ? (error as any).constructor.name : typeof error);
      console.error('💥 Error message:', error instanceof Error ? error.message : String(error));
      console.error('💥 Error stack:', error instanceof Error ? error.stack : undefined);
      
      // Check if it's a CORS error
      if (error instanceof TypeError && error.message && error.message.includes('fetch')) {
        console.error('🚨 This appears to be a CORS or network error');
        console.error('🚨 The browser may be blocking the external API call');
      }
      
      // No mock data - return empty array or throw error
      console.log('🔄 API failed, returning empty array - no mock data');
      return [];
    }
  }
} 