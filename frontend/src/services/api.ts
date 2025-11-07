const API_BASE = 'https://api.exchangerate-api.com/v4'

export async function fetchLatest(base: string, symbols: string[]) {
  const url = `${API_BASE}/latest/${base}`
  const resp = await fetch(url)
  if (!resp.ok) throw new Error('Failed to fetch exchange rates')
  const json = await resp.json()
  
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
  return {
    base,
    start_date: start,
    end_date: end,
    rates: {}
  }
}
