const GOOGLE_API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY')

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