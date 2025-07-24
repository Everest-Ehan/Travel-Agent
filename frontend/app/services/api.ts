import { Hotel, RateSummaryRequest, RateSummaryResponse } from '../types/hotel'

const API_BASE_URL = 'http://localhost:8000'

export class ApiService {
  static async searchHotels(query: string): Promise<Hotel[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/search?query=${encodeURIComponent(query)}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to search hotels')
      }

      const data = await response.json()
      
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
      console.error('Error searching hotels:', error)
      throw error
    }
  }

  static async getRateSummary(request: RateSummaryRequest): Promise<RateSummaryResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/rates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to fetch rates')
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching rates:', error)
      throw error
    }
  }
} 