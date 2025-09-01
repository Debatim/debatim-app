import { useEffect, useMemo, useState } from 'react'
import Papa from 'papaparse'

const norm = (s) =>
  (s ?? '')
    .toString()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

export default function useInteractionsByDayFromCsv(url) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    Papa.parse(url, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        setRows(res.data || [])
        setLoading(false)
      },
      error: (err) => {
        setError(err)
        setLoading(false)
      },
    })
  }, [url])

  const data = useMemo(() => {
    if (!rows.length) return { dates: [], values: [] }

    const headers = Object.keys(rows[0] || {})
    const colDate = headers.find((h) => norm(h).includes('data')) || 'Data de Criação do Post'
    const colInter = headers.find((h) => norm(h).includes('interacao')) || 'Total de Interações'

    // agrega por AAAA-MM-DD
    const byDay = new Map()
    for (const r of rows) {
      const d = new Date(r[colDate])
      if (isNaN(d)) continue
      const key = d.toISOString().slice(0, 10) // YYYY-MM-DD
      const v = Number(
        String(r[colInter] ?? '')
          .replace(/\./g, '')
          .replace(',', '.')
      )
      const curr = byDay.get(key) || 0
      byDay.set(key, curr + (isFinite(v) ? v : 0))
    }

    const dates = Array.from(byDay.keys()).sort()
    const values = dates.map((k) => byDay.get(k))
    return { dates, values }
  }, [rows])

  return { data, loading, error }
}
