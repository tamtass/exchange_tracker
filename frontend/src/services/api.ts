// Use exchangerate-api.com which is free and doesn't require key for basic usage
const API_BASE = 'https://api.exchangerate-api.com/v4'

export async function fetchLatest(base: string, symbols: string[]) {
  const url = `${API_BASE}/latest/${base}`
  console.log('Fetching from URL:', url)
  const resp = await fetch(url)
  if (!resp.ok) throw new Error('Failed to fetch exchange rates')
  const json = await resp.json()
  console.log('Raw API JSON response:', json)
  
  // Filter to only requested symbols if provided
  if (symbols && symbols.length > 0 && json.rates) {
    const filteredRates: Record<string, number> = {}
    symbols.forEach(symbol => {
      if (json.rates[symbol]) {
        filteredRates[symbol] = json.rates[symbol]
      }
    })
    return {
      base: json.base,
      date: json.date,
      rates: filteredRates
    }
  }
  
  return json
}

export async function fetchHistorical(base: string, symbols: string[], start: string, end: string) {
  // This free API doesn't support historical data, you'd need a paid service for that
  // For now, return mock data or use a different service
  console.warn('Historical data not available with free API')
  return {
    base,
    start_date: start,
    end_date: end,
    rates: {}
  }
}
