'use client'

import { useEffect, useState } from 'react'
import type { Producto } from '@/lib/types'

export default function StockPage() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [editando, setEditando] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Partial<Producto>>({})

  const cargar = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filtroEstado) params.set('estado', filtroEstado)
    if (filtroCategoria) params.set('categoria', filtroCategoria)
    if (busqueda) params.set('q', busqueda)
    const res = await fetch(`/api/productos?${params}`)
    setProductos(await res.json())
    setLoading(false)
  }

  useEffect(() => { cargar() }, [filtroEstado, filtroCategoria, busqueda])

  const marcarVendido = async (p: Producto) => {
    const precioStr = prompt(`Precio de venta para "${p.nombre}" (sugerido: $${p.precio_venta}):`, String(p.precio_venta))
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
    if (!confirm('¿Eliminar este producto?')) return
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

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Stock</h1>
      </div>

      {/* Filtros */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <input
          type="text"
          placeholder="Buscar producto..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1.5 text-sm w-52 focus:outline-none focus:ring-1 focus:ring-gray-400"
        />
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
        >
          <option value="">Todos los estados</option>
          <option value="disponible">Disponible</option>
          <option value="vendido">Vendido</option>
          <option value="reservado">Reservado</option>
        </select>
        <input
          type="text"
          placeholder="Categoría..."
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1.5 text-sm w-36 focus:outline-none focus:ring-1 focus:ring-gray-400"
        />
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Foto</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Nombre</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Categoría</th>
              <th className="text-right py-3 px-4 font-medium text-gray-500">Costo</th>
              <th className="text-right py-3 px-4 font-medium text-gray-500">Venta</th>
              <th className="text-center py-3 px-4 font-medium text-gray-500">Stock</th>
              <th className="text-center py-3 px-4 font-medium text-gray-500">Estado</th>
              <th className="text-right py-3 px-4 font-medium text-gray-500">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && (
              <tr><td colSpan={8} className="py-8 text-center text-gray-400">Cargando...</td></tr>
            )}
            {!loading && productos.length === 0 && (
              <tr><td colSpan={8} className="py-8 text-center text-gray-400">Sin productos</td></tr>
            )}
            {productos.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="py-2 px-4">
                  {p.foto_url
                    ? <img src={p.foto_url} alt={p.nombre} className="w-10 h-10 object-cover rounded" />
                    : <div className="w-10 h-10 bg-gray-100 rounded" />
                  }
                </td>
                <td className="py-2 px-4 font-medium text-gray-900">
                  {editando === p.id
                    ? <input
                        className="border border-gray-300 rounded px-2 py-0.5 text-sm w-full"
                        value={editValues.nombre ?? p.nombre}
                        onChange={(e) => setEditValues({ ...editValues, nombre: e.target.value })}
                      />
                    : p.nombre}
                </td>
                <td className="py-2 px-4 text-gray-500">
                  {editando === p.id
                    ? <input
                        className="border border-gray-300 rounded px-2 py-0.5 text-sm w-28"
                        value={editValues.categoria ?? p.categoria ?? ''}
                        onChange={(e) => setEditValues({ ...editValues, categoria: e.target.value })}
                      />
                    : p.categoria ?? '—'}
                </td>
                <td className="py-2 px-4 text-right text-gray-600">
                  {editando === p.id
                    ? <input
                        type="number"
                        className="border border-gray-300 rounded px-2 py-0.5 text-sm w-24 text-right"
                        value={editValues.costo ?? p.costo}
                        onChange={(e) => setEditValues({ ...editValues, costo: parseFloat(e.target.value) })}
                      />
                    : `$${p.costo.toLocaleString('es-AR')}`}
                </td>
                <td className="py-2 px-4 text-right text-gray-600">
                  {editando === p.id
                    ? <input
                        type="number"
                        className="border border-gray-300 rounded px-2 py-0.5 text-sm w-24 text-right"
                        value={editValues.precio_venta ?? p.precio_venta}
                        onChange={(e) => setEditValues({ ...editValues, precio_venta: parseFloat(e.target.value) })}
                      />
                    : `$${p.precio_venta.toLocaleString('es-AR')}`}
                </td>
                <td className="py-2 px-4 text-center">{p.stock}</td>
                <td className="py-2 px-4 text-center">
                  <EstadoBadge estado={p.estado} />
                </td>
                <td className="py-2 px-4 text-right">
                  <div className="flex gap-1.5 justify-end">
                    {editando === p.id ? (
                      <>
                        <button onClick={() => guardarEdicion(p.id)} className="text-xs px-2 py-1 bg-gray-900 text-white rounded hover:bg-gray-700">Guardar</button>
                        <button onClick={() => setEditando(null)} className="text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-50">Cancelar</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => { setEditando(p.id); setEditValues({}) }} className="text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-50">Editar</button>
                        {p.estado === 'disponible' && (
                          <button onClick={() => marcarVendido(p)} className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700">Vendido</button>
                        )}
                        <button onClick={() => eliminar(p.id)} className="text-xs px-2 py-1 text-red-600 border border-red-200 rounded hover:bg-red-50">Eliminar</button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function EstadoBadge({ estado }: { estado: string }) {
  const styles: Record<string, string> = {
    disponible: 'bg-green-50 text-green-700',
    vendido: 'bg-gray-100 text-gray-500',
    reservado: 'bg-yellow-50 text-yellow-700',
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${styles[estado] ?? 'bg-gray-100 text-gray-500'}`}>
      {estado}
    </span>
  )
}
