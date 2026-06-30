'use client'

import { useEffect, useState } from 'react'

interface Metricas {
  valor_stock_costo: number
  valor_stock_venta: number
  ganancia_total: number
  total_retiros: number
  saldo_disponible: number
  margen_promedio: number
  total_ventas: number
  total_productos: number
  productos_disponibles: number
}

export default function MetricasPage() {
  const [metricas, setMetricas] = useState<Metricas | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/metricas')
      .then((r) => r.json())
      .then((d) => { setMetricas(d); setLoading(false) })
  }, [])

  if (loading) return <div className="p-6 text-gray-400 text-sm">Cargando...</div>
  if (!metricas) return <div className="p-6 text-red-500 text-sm">Error al cargar métricas.</div>

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Métricas</h1>

      <div className="grid grid-cols-2 gap-4 mb-8 max-w-2xl">
        <Card label="Productos en stock" value={metricas.productos_disponibles.toString()} sub={`de ${metricas.total_productos} totales`} />
        <Card label="Ventas realizadas" value={metricas.total_ventas.toString()} />
        <Card label="Valor stock (a costo)" value={`$${metricas.valor_stock_costo.toLocaleString('es-AR')}`} />
        <Card label="Valor stock (a venta)" value={`$${metricas.valor_stock_venta.toLocaleString('es-AR')}`} />
        <Card label="Ganancia total" value={`$${metricas.ganancia_total.toLocaleString('es-AR')}`} highlight />
        <Card label="Saldo disponible" value={`$${metricas.saldo_disponible.toLocaleString('es-AR')}`} highlight={metricas.saldo_disponible >= 0} />
        <Card
          label="Margen promedio"
          value={`${(metricas.margen_promedio * 100).toFixed(1)}%`}
          sub="sobre precio de venta"
        />
      </div>
    </div>
  )
}

function Card({ label, value, sub, highlight }: { label: string; value: string; sub?: string; highlight?: boolean }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className={`text-2xl font-semibold ${highlight ? 'text-green-600' : 'text-gray-900'}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}
