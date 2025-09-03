import { useEffect, useMemo, useState } from 'react'
import Papa from 'papaparse'
import { norm, toNumber, cleanId, displayName } from '../utils/text'

export default function useLeadersFromCsv(url, topN = 10) {
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
    if (!rows.length) {
      return {
        topLabels: [],
        topInteracoes: [],
        points: [],
        hasLikesComments: false,
      }
    }

    const headers = Object.keys(rows[0] || {})
    // tenta várias possibilidades de nome de coluna
    const colName =
      headers.find((h) => {
        const n = norm(h)
        return (
          n.includes('usuario') ||
          n.includes('perfil') ||
          n.includes('autor') ||
          n.includes('conta') ||
          n.includes('nome')
        )
      }) || 'Nome'

    const colInter = headers.find((h) => norm(h).includes('intera')) || 'Total de Interações'
    const colLikes = headers.find((h) => norm(h).includes('curtid')) || null
    const colComments = headers.find((h) => norm(h).includes('coment')) || null
    const colViews = headers.find((h) => norm(h).includes('visualiz')) || null

    const byAccount = new Map() // id limpo -> métricas somadas
    const prettyName = new Map() // id limpo -> nome legível (1º visto)

    for (const r of rows) {
      const raw = r[colName]
      const id = cleanId(raw)
      if (!id) continue // ignora linhas sem identificador

      if (!prettyName.has(id)) prettyName.set(id, displayName(raw))

      const inter = toNumber(r[colInter])
      const like = colLikes ? toNumber(r[colLikes]) : 0
      const comm = colComments ? toNumber(r[colComments]) : 0
      const views = colViews ? toNumber(r[colViews]) : 0

      const prev = byAccount.get(id) || { inter: 0, likes: 0, comments: 0, views: 0 }
      byAccount.set(id, {
        inter: prev.inter + inter,
        likes: prev.likes + like,
        comments: prev.comments + comm,
        views: prev.views + views,
      })
    }

    // Top N por interações
    const sorted = Array.from(byAccount.entries())
      .sort((a, b) => b[1].inter - a[1].inter)
      .slice(0, topN)

    const topLabels = sorted.map(([id]) => prettyName.get(id))
    const topInteracoes = sorted.map(([, v]) => v.inter)

    // Pontos do scatter (curtidas x comentários OU visualizações x interações)
    const hasLC = Boolean(colLikes && colComments)
    const points = Array.from(byAccount.entries())
      .map(([id, v]) => ({
        name: prettyName.get(id),
        value: [hasLC ? v.likes : v.views, hasLC ? v.comments : v.inter],
      }))
      .filter((p) => p.value[0] > 0 || p.value[1] > 0) // remove zeros puros

    return {
      topLabels,
      topInteracoes,
      points,
      hasLikesComments: hasLC,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows])

  return { ...data, loading, error }
}
