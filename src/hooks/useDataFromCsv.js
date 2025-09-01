import { useEffect, useMemo, useState } from 'react'
import Papa from 'papaparse'

const norm = (s) =>
  (s ?? '')
    .toString()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

export default function useDataFromCSV(url) {
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
    if (!rows.length) return { dates: [], posts: [], interacoes: [], visualizacoes: null }

    const headers = Object.keys(rows[0] || {})
    const colDate = headers.find((h) => norm(h).includes('data')) || 'Data de Criação do Post'
    const colInter = headers.find((h) => norm(h).includes('interacao')) || 'Total de Interações'
    const colViews = headers.find((h) => norm(h).includes('visualiz')) || null

    const byPosts = new Map()
    const byInter = new Map()
    const byViews = colViews ? new Map() : null

    for (const r of rows) {
      const d = new Date(r[colDate])
      if (isNaN(d)) continue
      const key = d.toISOString().slice(0, 10)

      byPosts.set(key, (byPosts.get(key) || 0) + 1)

      const inter = Number(
        String(r[colInter] ?? '')
          .replace(/\./g, '')
          .replace(',', '.')
      )
      byInter.set(key, (byInter.get(key) || 0) + (isFinite(inter) ? inter : 0))

      if (byViews) {
        const v = Number(
          String(r[colViews] ?? '')
            .replace(/\./g, '')
            .replace(',', '.')
        )
        byViews.set(key, (byViews.get(key) || 0) + (isFinite(v) ? v : 0))
      }
    }

    const dates = Array.from(new Set([...byPosts.keys(), ...byInter.keys()])).sort()
    return {
      dates,
      posts: dates.map((d) => byPosts.get(d) || 0),
      interacoes: dates.map((d) => byInter.get(d) || 0),
      visualizacoes: byViews ? dates.map((d) => byViews.get(d) || 0) : null,
    }
  }, [rows])

  return { ...data, loading, error }
}
