// Normaliza texto para comparação/chaves
export const norm = (s) =>
  (s ?? '')
    .toString()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

// Converte "1.234.567,89" -> 1234567.89 (ou 0 se der NaN)
export const toNumber = (v) =>
  Number(
    String(v ?? '')
      .replace(/\./g, '')
      .replace(',', '.')
  ) || 0

// ID limpo para usar como chave (evita duplicações por variações)
export const cleanId = (s) => {
  const t = (s ?? '')
    .toString()
    .replace(/https?:\/\/\S+/g, '') // remove URLs
    .replace(/@[^\s]+/g, (m) => m.slice(1)) // remove @ do handle
    .replace(/\s+/g, ' ')
    .trim()
  const noEmoji = t.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '')
  const base = noEmoji.normalize('NFD').replace(/\p{Diacritic}/gu, '')
  return base.toLowerCase()
}

// Nome “bonito” para exibição (fallback quando vier vazio)
export const displayName = (s) => (s ?? '').toString().trim() || '—'
