'use client'

import { useEffect, useState } from 'react'
import type { Retiro } from '@/lib/types'

export default function RetirosPage() {
  const [retiros, setRetiros] = useState<Retiro[]>([])
  const [loading, setLoading] = useState(true)
  const [monto, setMonto] = useState('')
  const [motivo, setMotivo] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [gananciaTotal, setGananciaTotal] = useState(0)

  const cargar = async () => {
    setLoading(true)
    const [retirosRes, metricasRes] = await Promise.all([
      fetch('/api/retiros').then((r) => r.json()),
      fetch('/api/metricas').then((r) => r.json()),
    ])
    setRetiros(retirosRes)
    setGananciaTotal(metricasRes.ganancia_total ?? 0)
    setLoading(false)
  }

  useEffect(() => { cargar() }, [])

  const totalRetiros = retiros.reduce((acc, r) => acc + r.monto, 0)
  const saldoDisponible = gananciaTotal - totalRetiros

  const registrar = async (e: React.FormEvent) => {
    e.preventDefault()
    const montoNum = parseFloat(monto)
    if (!montoNum || montoNum <= 0) return

    setEnviando(true)
    await fetch('/api/retiros', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ monto: montoNum, motivo: motivo || undefined }),
    })
    setMonto('')
    setMotivo('')
    setEnviando(false)
    cargar()
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Retiros</h1>

      {/* Saldo */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs text-gray-400 mb-1">Ganancia total</p>
          <p className="text-xl font-semibold text-gray-900">${gananciaTotal.toLocaleString('es-AR')}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs text-gray-400 mb-1">Total retirado</p>
          <p className="text-xl font-semibold text-gray-900">${totalRetiros.toLocaleString('es-AR')}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs text-gray-400 mb-1">Saldo disponible</p>
          <p className={`text-xl font-semibold ${saldoDisponible >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${saldoDisponible.toLocaleString('es-AR')}
          </p>
        </div>
      </div>

      {/* Formulario */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 mb-8 max-w-sm">
        <h2 className="text-sm font-medium text-gray-700 mb-4">Nuevo retiro</h2>
        <form onSubmit={registrar} className="flex flex-col gap-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Monto *</label>
            <input
              type="number"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              placeholder="0"
              required
              min="1"
              className="border border-gray-300 rounded px-3 py-1.5 text-sm w-full focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Motivo (opcional)</label>
            <input
              type="text"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ej: gastos del local"
              className="border border-gray-300 rounded px-3 py-1.5 text-sm w-full focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
          </div>
          <button
            type="submit"
            disabled={enviando}
            className="bg-gray-900 text-white text-sm py-2 rounded hover:bg-gray-700 disabled:opacity-50"
          >
            {enviando ? 'Registrando...' : 'Registrar retiro'}
          </button>
        </form>
      </div>

      {/* Historial */}
      <h2 className="text-sm font-medium text-gray-700 mb-3">Historial</h2>
      {loading && <p className="text-gray-400 text-sm">Cargando...</p>}
      {!loading && retiros.length === 0 && <p className="text-gray-400 text-sm">Sin retiros registrados.</p>}
      {retiros.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden max-w-2xl">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-2 px-4 font-medium text-gray-500">Fecha</th>
                <th className="text-left py-2 px-4 font-medium text-gray-500">Motivo</th>
                <th className="text-right py-2 px-4 font-medium text-gray-500">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {retiros.map((r) => (
                <tr key={r.id}>
                  <td className="py-2 px-4 text-gray-500">
                    {new Date(r.fecha).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="py-2 px-4 text-gray-700">{r.motivo ?? '—'}</td>
                  <td className="py-2 px-4 text-right font-medium text-gray-900">${r.monto.toLocaleString('es-AR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
