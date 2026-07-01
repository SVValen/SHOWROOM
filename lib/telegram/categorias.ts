export const CATEGORIAS: Record<string, string[]> = {
  'Ropa':       ['Tops', 'Pantalones', 'Vestidos', 'Faldas', 'Camperas', 'Sweaters', 'Deportivo', 'Otro'],
  'Calzado':    ['Zapatillas', 'Sandalias', 'Botas', 'Zapatos', 'Otro'],
  'Accesorios': ['Bolsos', 'Bijouterie', 'Cinturones', 'Gorros', 'Otro'],
  'Otros':      ['General'],
}

export function keyboardCategorias() {
  const cats = Object.keys(CATEGORIAS)
  const rows: Array<Array<{ text: string; callback_data: string }>> = []
  for (let i = 0; i < cats.length; i += 2) {
    rows.push(cats.slice(i, i + 2).map((c) => ({ text: c, callback_data: `cat:${c}` })))
  }
  return { inline_keyboard: rows }
}

export function keyboardSubcategorias(categoria: string) {
  const subs = CATEGORIAS[categoria] ?? ['Otro']
  const rows: Array<Array<{ text: string; callback_data: string }>> = []
  for (let i = 0; i < subs.length; i += 3) {
    rows.push(subs.slice(i, i + 3).map((s) => ({ text: s, callback_data: `subcat:${s}` })))
  }
  rows.push([{ text: 'Omitir subcategoría', callback_data: 'subcat:skip' }])
  return { inline_keyboard: rows }
}

export const KB_LISTO_FOTOS = {
  inline_keyboard: [[{ text: '✅ Listo, no hay más fotos', callback_data: 'fotos:listo' }]],
}

export const KB_CONFIRMAR = {
  inline_keyboard: [[
    { text: '✅ Confirmar', callback_data: 'action:confirmar' },
    { text: '❌ Cancelar',  callback_data: 'action:cancelar'  },
  ]],
}
