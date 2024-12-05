const GOOGLE_API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY')

export async function searchNearbyRestaurants(lat: string, lng: string): Promise<any> {
  console.log('Searching for restaurants near:', lat, lng)
  
  const nearbyUrl = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json')
  nearbyUrl.searchParams.set('location', `${lat},${lng}`)
  nearbyUrl.searchParams.set('radius', '500') // Increased radius for better results
  nearbyUrl.searchParams.set('type', 'restaurant')
  nearbyUrl.searchParams.set('key', GOOGLE_API_KEY!)

  console.log('Making Nearby Search request')
  const response = await fetch(nearbyUrl.toString())
  
  if (!response.ok) {
    console.error('Nearby Search API error:', await response.text())
    throw new Error('Failed to fetch nearby places')
  }

  const data = await response.json()
  console.log('Found nearby places:', data.results?.length || 0)
  
  if (data.status !== 'OK' || !data.results?.length) {
    throw new Error('No restaurants found at this location')
  }

  return data.results[0]
}

export async function getPlaceDetails(placeId: string): Promise<any> {
  console.log('Fetching details for place:', placeId)
  
  const detailsUrl = new URL('https://maps.googleapis.com/maps/api/place/details/json')
  detailsUrl.searchParams.set('place_id', placeId)
  detailsUrl.searchParams.set('key', GOOGLE_API_KEY!)
  detailsUrl.searchParams.set('fields', [
    'place_id',
    'name',
    'rating',
    'user_ratings_total',
    'formatted_address',
    'formatted_phone_number',
    'opening_hours',
    'website',
    'price_level',
    'photos',
    'reviews',
    'types',
    'vicinity',
    'utc_offset'
  ].join(','))

  const response = await fetch(detailsUrl.toString())
  
  if (!response.ok) {
    console.error('Place Details API error:', await response.text())
    throw new Error('Failed to fetch place details')
  }

  const data = await response.json()
  
  if (data.status !== 'OK') {
    throw new Error(`Places API error: ${data.status}`)
  }

  return data
}