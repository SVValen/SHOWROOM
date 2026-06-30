// Detecta si el mensaje es una consulta de stock o un comando de carga
export function detectIntent(text: string): 'consulta' | 'comando' | 'desconocido' {
  const lower = text.toLowerCase().trim()

  if (lower.startsWith('/')) return 'comando'

  const palabrasConsulta = ['stock', 'precio', 'estado', 'cuánto', 'cuanto', 'hay', 'tenés', 'tenes']
  if (palabrasConsulta.some((p) => lower.includes(p))) return 'consulta'

  return 'desconocido'
}

export function extraerTerminoBusqueda(text: string): string {
  const lower = text.toLowerCase().trim()
  const palabras = ['stock', 'precio', 'estado', 'cuánto', 'cuanto', 'hay', 'tenés', 'tenes', 'de', 'del', 'la', 'el']
  let resultado = lower
  for (const p of palabras) {
    resultado = resultado.replace(new RegExp(`\\b${p}\\b`, 'g'), '').trim()
  }
  return resultado.trim()
}

export function parseNumero(text: string): number | null {
  // Acepta "8000", "8.000", "8,000", "$8000", "8000.50"
  const limpio = text.replace(/[$\s.]/g, '').replace(',', '.')
  const n = parseFloat(limpio)
  return isNaN(n) ? null : n
}
