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
} 