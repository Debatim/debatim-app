// Compacta 1234 -> "1,2 mil", 1_200_000 -> "1,2 mi"
export const formatCompact = (n) =>
  new Intl.NumberFormat('pt-BR', {
    notation: 'compact',
    maximumFractionDigits: 1,
    compactDisplay: 'short',
  }).format(Number(n || 0))

// 2025-08-21T... -> "21/08/2025"
export const formatDateBR = (date) => {
  const d = date instanceof Date ? date : new Date(date)
  if (Number.isNaN(d.getTime())) return String(date ?? '')
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// número simples com separador (para tooltips quando não quiser compactar)
export const formatNumberBR = (n, fractionDigits = 0) =>
  new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: fractionDigits,
  }).format(Number(n || 0))
