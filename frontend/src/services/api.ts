import axios from 'axios'

const BASE = import.meta.env.VITE_EXCHANGE_API || 'https://api.exchangerate.host'

export async function fetchLatest(base = 'EUR', symbols: string[] = []) {
  const sy = symbols.length ? `&symbols=${symbols.join(',')}` : ''
  const res = await axios.get(`${BASE}/latest?base=${base}${sy}`)
  return res.data
}

export async function fetchHistorical(dateISO: string, base = 'EUR', symbols: string[] = []) {
  const sy = symbols.length ? `&symbols=${symbols.join(',')}` : ''
  const res = await axios.get(`${BASE}/${dateISO}?base=${base}${sy}`)
  return res.data
}
