import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { menuUrl } = await req.json()
    console.log('🔍 Attempting to scrape menu from:', menuUrl)

    if (!menuUrl) {
      throw new Error('Menu URL is required')
    }

    // Fetch the menu page
    const response = await fetch(menuUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch menu: ${response.status}`)
    }

    const html = await response.text()
    console.log('📄 Retrieved HTML content length:', html.length)

    // Basic menu item extraction - this is a simple example
    // You may need to adjust based on the actual structure of the menu pages
    const menuItems = extractMenuItems(html)
    console.log('🍽️ Extracted menu items:', menuItems)

    return new Response(
      JSON.stringify({
        menuSections: [{
          name: 'Menu',
          items: menuItems
        }]
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )

  } catch (error) {
    console.error('❌ Error processing menu:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})

function extractMenuItems(html: string) {
  const items = []
  const menuRegex = /<div[^>]*class="[^"]*menu-item[^"]*"[^>]*>(.*?)<\/div>/gi
  const nameRegex = /<h3[^>]*>(.*?)<\/h3>/i
  const priceRegex = /\$(\d+(\.\d{2})?)/
  const descRegex = /<p[^>]*>(.*?)<\/p>/i

  let match
  while ((match = menuRegex.exec(html)) !== null) {
    const itemHtml = match[1]
    const name = (itemHtml.match(nameRegex)?.[1] || '').trim()
    const price = parseFloat((itemHtml.match(priceRegex)?.[1] || '0'))
    const description = (itemHtml.match(descRegex)?.[1] || '').trim()

    if (name) {
      items.push({
        id: crypto.randomUUID(),
        name,
        price,
        description,
        category: 'Menu'
      })
    }
  }

  return items
}