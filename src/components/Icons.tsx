// ─── Ícones SVG para navegação ────────────────────────────────────────────────

export function IconeGrade({ size, ativo }: { size: number; ativo: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="6" height="6" rx="1.5" fill={ativo ? '#14B8A6' : 'currentColor'} fillOpacity={ativo ? 1 : 0.6} />
      <rect x="9" y="1" width="6" height="6" rx="1.5" fill={ativo ? '#14B8A6' : 'currentColor'} fillOpacity={ativo ? 1 : 0.6} />
      <rect x="1" y="9" width="6" height="6" rx="1.5" fill={ativo ? '#14B8A6' : 'currentColor'} fillOpacity={ativo ? 1 : 0.6} />
      <rect x="9" y="9" width="6" height="6" rx="1.5" fill={ativo ? '#14B8A6' : 'currentColor'} fillOpacity={ativo ? 0.5 : 0.3} />
    </svg>
  )
}

export function IconeKanban({ size, ativo }: { size: number; ativo: boolean }) {
  const c = ativo ? '#14B8A6' : 'currentColor'
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="4" height="10" rx="1.5" fill={c} fillOpacity={ativo ? 1 : 0.6} />
      <rect x="6" y="1" width="4" height="7" rx="1.5" fill={c} fillOpacity={ativo ? 1 : 0.6} />
      <rect x="11" y="1" width="4" height="13" rx="1.5" fill={c} fillOpacity={ativo ? 0.5 : 0.3} />
    </svg>
  )
}

export function IconeArquivo({ size, ativo }: { size: number; ativo: boolean }) {
  const c = ativo ? '#14B8A6' : 'currentColor'
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M3 2C3 1.45 3.45 1 4 1h5.586L13 4.414V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2z" fill={c} fillOpacity={ativo ? 0.2 : 0.15} />
      <path d="M9 1v3.5A.5.5 0 0 0 9.5 5H13" stroke={c} strokeOpacity={ativo ? 1 : 0.6} strokeWidth="1.2" />
      <path d="M5 8h6M5 11h4" stroke={c} strokeOpacity={ativo ? 1 : 0.6} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}
export function IconeVoo({ size, ativo }: { size: number; ativo: boolean }) {
  const c = ativo ? '#14B8A6' : 'currentColor'
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 2L11 13" />
      <path d="M22 2L15 22L11 13L2 9L22 2Z" fill={c} fillOpacity={ativo ? 0.2 : 0.1} />
    </svg>
  )
}
export function IconeCarteira({ size, ativo }: { size: number; ativo: boolean }) {
  const c = ativo ? '#14B8A6' : 'currentColor'
  const op = ativo ? 1 : 0.6
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="1" y="4" width="14" height="10" rx="2" fill={c} fillOpacity={ativo ? 0.15 : 0.1} stroke={c} strokeOpacity={op} strokeWidth="1.2" />
      <path d="M1 7h14" stroke={c} strokeOpacity={op} strokeWidth="1.2" />
      <path d="M4 2.5A1.5 1.5 0 0 1 5.5 1h5A1.5 1.5 0 0 1 12 2.5V4H4V2.5z" fill={c} fillOpacity={op} />
      <circle cx="11.5" cy="11" r="1.5" fill={c} fillOpacity={op} />
    </svg>
  )
}

export function IconePassaporte({ size, ativo }: { size: number; ativo: boolean }) {
  const c = ativo ? '#14B8A6' : 'currentColor'
  const op = ativo ? 1 : 0.6
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="2" y="1" width="12" height="14" rx="2" fill={c} fillOpacity={ativo ? 0.15 : 0.1} stroke={c} strokeOpacity={op} strokeWidth="1.2" />
      <circle cx="8" cy="7" r="2.5" stroke={c} strokeOpacity={op} strokeWidth="1.2" />
      <path d="M5 12h6M5.5 10h5" stroke={c} strokeOpacity={ativo ? 0.6 : 0.3} strokeWidth="1" strokeLinecap="round" />
    </svg>
  )
}

export function IconeGraduacao({ size, ativo }: { size: number; ativo: boolean }) {
  const c = ativo ? '#14B8A6' : 'currentColor'
  const op = ativo ? 1 : 0.6
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M8 2L1 6l7 4 7-4-7-4z" fill={c} fillOpacity={ativo ? 0.3 : 0.15} stroke={c} strokeOpacity={op} strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M3.5 7.5v4L8 14l4.5-2.5v-4" stroke={c} strokeOpacity={op} strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M14 6v5" stroke={c} strokeOpacity={op} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

export function IconeLogistica({ size, ativo }: { size: number; ativo: boolean }) {
  const c = ativo ? '#14B8A6' : 'currentColor'
  const op = ativo ? 1 : 0.6
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="1" y="3" width="10" height="8" rx="1.5" fill={c} fillOpacity={ativo ? 0.15 : 0.1} stroke={c} strokeOpacity={op} strokeWidth="1.2" />
      <path d="M11 6h2.5L15 9v2h-4" stroke={c} strokeOpacity={op} strokeWidth="1.2" strokeLinejoin="round" />
      <circle cx="4.5" cy="12.5" r="1.5" fill={c} fillOpacity={op} />
      <circle cx="12" cy="12.5" r="1.5" fill={c} fillOpacity={op} />
    </svg>
  )
}

// ─── Ícones de status ─────────────────────────────────────────────────────────

export function IconeCheck() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M5 9l3 3 5-5" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconeGirar() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="6" stroke="#334155" strokeWidth="2" />
      <path d="M9 3a6 6 0 0 1 6 6" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function IconeCadeado() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="3" y="7" width="10" height="8" rx="2" fill="#EF4444" fillOpacity="0.3" stroke="#EF4444" strokeWidth="1.2" />
      <path d="M5 7V5a3 3 0 0 1 6 0v2" stroke="#EF4444" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="8" cy="11" r="1" fill="#EF4444" />
    </svg>
  )
}

export function IconeRelogio() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6" stroke="#64748B" strokeWidth="1.2" />
      <path d="M8 5v3.5l2 2" stroke="#64748B" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconeMais() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export function IconeLixeira() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M2 4h12M5.333 4V2.667a1.333 1.333 0 0 1 1.334-1.334h2.666a1.333 1.333 0 0 1 1.334 1.334V4M13.333 4v9.333a1.333 1.333 0 0 1-1.333 1.334H4a1.333 1.333 0 0 1-1.333-1.334V4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconeDemo({ size, ativo }: { size: number; ativo: boolean }) {
  const c = ativo ? '#14B8A6' : 'currentColor'
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  )
}

export function IconeTutorial({ size, ativo }: { size: number; ativo: boolean }) {
  const c = ativo ? '#14B8A6' : 'currentColor'
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  )
}

export function IconeNotas({ size, ativo }: { size: number; ativo: boolean }) {
  const c = ativo ? '#14B8A6' : 'currentColor'
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  )
}

export function IconeCalendario({ size, ativo }: { size: number; ativo: boolean }) {
  const c = ativo ? '#14B8A6' : 'currentColor'
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}
