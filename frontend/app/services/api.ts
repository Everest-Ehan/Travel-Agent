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
    currency: string
    end_date: string
    expected_amount: number
    expected_currency: string
    number_of_adults: number
    rate_code: string
    rate_id: string
    start_date: string
    supplier_id: string
    supplier_program_id: string
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
} 