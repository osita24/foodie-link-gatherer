export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

export async function expandShortenedUrl(url: string): Promise<string> {
  console.log('Expanding URL:', url)
  try {
    const response = await fetch(url, { 
      method: 'GET',
      redirect: 'follow'
    })
    console.log('Expanded URL:', response.url)
    return response.url
  } catch (error) {
    console.error('Error expanding URL:', error)
    throw new Error('Failed to expand shortened URL')
  }
}

export function extractCoordinates(url: string): { lat: string, lng: string } | null {
  console.log('Attempting to extract coordinates from:', url)
  
  // Handle various URL formats
  const patterns = [
    /@(-?\d+\.\d+),(-?\d+\.\d+)/, // Standard format
    /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/, // Alternate format
    /ll=(-?\d+\.\d+),(-?\d+\.\d+)/ // Another common format
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) {
      console.log('Found coordinates:', match[1], match[2])
      return { lat: match[1], lng: match[2] }
    }
  }

  console.log('No coordinates found in URL')
  return null
}