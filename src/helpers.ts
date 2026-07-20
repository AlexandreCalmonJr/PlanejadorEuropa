// ─── Constantes ───────────────────────────────────────────────────────────────
export const COTACAO_EURO = 6.15

// ─── Formatação de moeda ──────────────────────────────────────────────────────
export const fmt = (n: number, moeda: 'BRL' | 'EUR') =>
  moeda === 'BRL'
    ? `R$${n.toLocaleString('pt-BR')}`
    : `€${n.toLocaleString('de-DE')}`

export const fmtK = (n: number) => `€${Math.round(n / 1000)}k`

// ─── Gerador de ID ────────────────────────────────────────────────────────────
export const gerarId = () => Math.random().toString(36).substring(2, 9)
