'use client'

import { useEffect, useState } from 'react'

interface Venta {
  id: string
  precio_vendido: number
  ganancia: number
  fecha: string
  productos: { nombre: string; foto_url: string | null } | null
}

export default function CajaPage() {
  const [ventas, setVentas] = useState<Venta[]>([])
  const [loading, setLoading] = useState(true)
  const [desde, setDesde] = useState(() => {
    const d = new Date()
    d.setDate(1)
    return d.toISOString().split('T')[0]
  })
  const [hasta, setHasta] = useState(() => new Date().toISOString().split('T')[0])

  useEffect(() => {
    const cargar = async () => {
      setLoading(true)
      const params = new URLSearchParams({ desde, hasta: `${hasta}T23:59:59` })
      const res = await fetch(`/api/ventas?${params}`)
      setVentas(await res.json())
      setLoading(false)
    }
    cargar()
  }, [desde, hasta])

  const totalVendido = ventas.reduce((acc, v) => acc + v.precio_vendido, 0)
  const totalGanancia = ventas.reduce((acc, v) => acc + (v.ganancia ?? 0), 0)

  // Agrupar por día
  const porDia = ventas.reduce<Record<string, Venta[]>>((acc, v) => {
    const dia = v.fecha.split('T')[0]
    if (!acc[dia]) acc[dia] = []
    acc[dia].push(v)
    return acc
  }, {})

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Caja</h1>

      {/* Filtros de rango */}
      <div className="flex gap-3 items-center mb-6">
        <label className="text-sm text-gray-500">Desde</label>
        <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400" />
        <label className="text-sm text-gray-500">Hasta</label>
        <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400" />
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Stat label="Ventas" value={ventas.length.toString()} />
        <Stat label="Total vendido" value={`$${totalVendido.toLocaleString('es-AR')}`} />
        <Stat label="Ganancia" value={`$${totalGanancia.toLocaleString('es-AR')}`} highlight />
      </div>

      {/* Ventas por día */}
      {loading && <p className="text-gray-400 text-sm">Cargando...</p>}
      {!loading && Object.keys(porDia).length === 0 && (
        <p className="text-gray-400 text-sm">Sin ventas en este período.</p>
      )}
      {Object.entries(porDia).map(([dia, ventasDia]) => (
        <div key={dia} className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-medium text-gray-500">{formatearFecha(dia)}</h2>
            <span className="text-sm text-gray-400">
              {ventasDia.length} venta(s) — $
              {ventasDia.reduce((a, v) => a + v.precio_vendido, 0).toLocaleString('es-AR')}
            </span>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-2 px-4 font-medium text-gray-500">Producto</th>
                  <th className="text-right py-2 px-4 font-medium text-gray-500">Precio</th>
                  <th className="text-right py-2 px-4 font-medium text-gray-500">Ganancia</th>
                  <th className="text-right py-2 px-4 font-medium text-gray-500">Hora</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ventasDia.map((v) => (
                  <tr key={v.id}>
                    <td className="py-2 px-4 text-gray-900">{v.productos?.nombre ?? '—'}</td>
                    <td className="py-2 px-4 text-right text-gray-600">${v.precio_vendido.toLocaleString('es-AR')}</td>
                    <td className="py-2 px-4 text-right text-green-600">${(v.ganancia ?? 0).toLocaleString('es-AR')}</td>
                    <td className="py-2 px-4 text-right text-gray-400">{new Date(v.fecha).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  )
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className={`text-xl font-semibold ${highlight ? 'text-green-600' : 'text-gray-900'}`}>{value}</p>
    </div>
  )
}

function formatearFecha(iso: string) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
}
