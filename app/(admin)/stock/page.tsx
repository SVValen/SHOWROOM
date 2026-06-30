'use client'

import { useEffect, useState } from 'react'
import type { Producto } from '@/lib/types'

export default function StockPage() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroEstado, setFiltroEstado] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [editando, setEditando] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Partial<Producto>>({})

  const cargar = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filtroEstado) params.set('estado', filtroEstado)
    if (busqueda) params.set('q', busqueda)
    const res = await fetch(`/api/productos?${params}`)
    setProductos(await res.json())
    setLoading(false)
  }

  useEffect(() => { cargar() }, [filtroEstado, busqueda])

  const marcarVendido = async (p: Producto) => {
    const precioStr = prompt(`Precio de venta para "${p.nombre}":\n(sugerido: $${p.precio_venta.toLocaleString('es-AR')})`, String(p.precio_venta))
    if (!precioStr) return
    const precio = parseFloat(precioStr)
    if (isNaN(precio)) return

    await fetch('/api/ventas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ producto_id: p.id, precio_vendido: precio }),
    })
    cargar()
  }

  const eliminar = async (id: string) => {
    if (!confirm('¿Eliminar este producto? Esta acción no se puede deshacer.')) return
    await fetch(`/api/productos/${id}`, { method: 'DELETE' })
    cargar()
  }

  const guardarEdicion = async (id: string) => {
    await fetch(`/api/productos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editValues),
    })
    setEditando(null)
    cargar()
  }

  const disponibles = productos.filter(p => p.estado === 'disponible').length
  const vendidos = productos.filter(p => p.estado === 'vendido').length

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Stock</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {disponibles} disponibles · {vendidos} vendidos · {productos.length} total
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar producto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent"
          />
        </div>
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent"
        >
          <option value="">Todos los estados</option>
          <option value="disponible">Disponible</option>
          <option value="vendido">Vendido</option>
          <option value="reservado">Reservado</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80">
                <th className="text-left py-3 px-4 font-medium text-gray-500 w-16">Foto</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Nombre</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 hidden sm:table-cell">Categoría</th>
                <th className="text-right py-3 px-4 font-medium text-gray-500">Costo</th>
                <th className="text-right py-3 px-4 font-medium text-gray-500">Venta</th>
                <th className="text-right py-3 px-4 font-medium text-gray-500 hidden sm:table-cell">Margen</th>
                <th className="text-center py-3 px-4 font-medium text-gray-500">Estado</th>
                <th className="text-right py-3 px-4 font-medium text-gray-500">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin" />
                      Cargando...
                    </div>
                  </td>
                </tr>
              )}
              {!loading && productos.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    <p className="text-lg mb-1">📦</p>
                    <p className="text-sm">Sin productos{busqueda ? ` con "${busqueda}"` : ''}</p>
                  </td>
                </tr>
              )}
              {productos.map((p) => {
                const margen = p.costo > 0 ? ((p.precio_venta - p.costo) / p.precio_venta * 100).toFixed(0) : '—'
                const isEdit = editando === p.id
                return (
                  <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                    {/* Foto */}
                    <td className="py-3 px-4">
                      {p.foto_url
                        ? <img src={p.foto_url} alt={p.nombre} className="w-11 h-11 object-cover rounded-lg shadow-sm" />
                        : <div className="w-11 h-11 bg-gray-100 rounded-lg flex items-center justify-center text-gray-300 text-lg">📷</div>
                      }
                    </td>

                    {/* Nombre */}
                    <td className="py-3 px-4 font-medium text-gray-900 max-w-[180px]">
                      {isEdit
                        ? <input
                            className="border border-gray-300 rounded-lg px-2 py-1 text-sm w-full focus:outline-none focus:ring-2 focus:ring-amber-300"
                            value={editValues.nombre ?? p.nombre}
                            onChange={(e) => setEditValues({ ...editValues, nombre: e.target.value })}
                          />
                        : <span className="line-clamp-2">{p.nombre}</span>
                      }
                    </td>

                    {/* Categoría */}
                    <td className="py-3 px-4 text-gray-500 hidden sm:table-cell">
                      {isEdit
                        ? <input
                            className="border border-gray-300 rounded-lg px-2 py-1 text-sm w-28 focus:outline-none focus:ring-2 focus:ring-amber-300"
                            value={editValues.categoria ?? p.categoria ?? ''}
                            placeholder="Sin categoría"
                            onChange={(e) => setEditValues({ ...editValues, categoria: e.target.value })}
                          />
                        : p.categoria
                          ? <span className="px-2 py-0.5 bg-gray-100 rounded-md text-xs">{p.categoria}</span>
                          : <span className="text-gray-300">—</span>
                      }
                    </td>

                    {/* Costo */}
                    <td className="py-3 px-4 text-right text-gray-600">
                      {isEdit
                        ? <input
                            type="number"
                            className="border border-gray-300 rounded-lg px-2 py-1 text-sm w-24 text-right focus:outline-none focus:ring-2 focus:ring-amber-300"
                            value={editValues.costo ?? p.costo}
                            onChange={(e) => setEditValues({ ...editValues, costo: parseFloat(e.target.value) })}
                          />
                        : `$${p.costo.toLocaleString('es-AR')}`
                      }
                    </td>

                    {/* Venta */}
                    <td className="py-3 px-4 text-right font-semibold text-gray-800">
                      {isEdit
                        ? <input
                            type="number"
                            className="border border-gray-300 rounded-lg px-2 py-1 text-sm w-24 text-right focus:outline-none focus:ring-2 focus:ring-amber-300"
                            value={editValues.precio_venta ?? p.precio_venta}
                            onChange={(e) => setEditValues({ ...editValues, precio_venta: parseFloat(e.target.value) })}
                          />
                        : `$${p.precio_venta.toLocaleString('es-AR')}`
                      }
                    </td>

                    {/* Margen */}
                    <td className="py-3 px-4 text-right hidden sm:table-cell">
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                        parseInt(String(margen)) >= 40 ? 'text-green-700 bg-green-50' :
                        parseInt(String(margen)) >= 20 ? 'text-amber-700 bg-amber-50' :
                        'text-gray-500 bg-gray-50'
                      }`}>
                        {margen !== '—' ? `${margen}%` : '—'}
                      </span>
                    </td>

                    {/* Estado */}
                    <td className="py-3 px-4 text-center">
                      <EstadoBadge estado={p.estado} />
                    </td>

                    {/* Acciones */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex gap-1.5 justify-end items-center">
                        {isEdit ? (
                          <>
                            <button
                              onClick={() => guardarEdicion(p.id)}
                              className="text-xs px-3 py-1.5 rounded-lg text-white font-medium transition-colors"
                              style={{ background: 'var(--accent)' }}
                            >
                              Guardar
                            </button>
                            <button
                              onClick={() => setEditando(null)}
                              className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => { setEditando(p.id); setEditValues({}) }}
                              className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                              Editar
                            </button>
                            {p.estado === 'disponible' && (
                              <button
                                onClick={() => marcarVendido(p)}
                                className="text-xs px-3 py-1.5 rounded-lg text-white font-medium bg-emerald-500 hover:bg-emerald-600 transition-colors"
                              >
                                Vendido
                              </button>
                            )}
                            <button
                              onClick={() => eliminar(p.id)}
                              className="text-xs px-2 py-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                              title="Eliminar"
                            >
                              ✕
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function EstadoBadge({ estado }: { estado: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    disponible: { label: 'Disponible', cls: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' },
    vendido:    { label: 'Vendido',    cls: 'bg-gray-100 text-gray-500' },
    reservado:  { label: 'Reservado',  cls: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' },
  }
  const { label, cls } = map[estado] ?? { label: estado, cls: 'bg-gray-100 text-gray-500' }
  return (
    <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full font-medium ${cls}`}>
      {label}
    </span>
  )
}
