import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createServiceClient()

  const [productosResult, ventasResult, retirosResult] = await Promise.all([
    supabase.from('productos').select('costo, precio_venta, estado'),
    supabase.from('ventas').select('ganancia, precio_vendido, fecha'),
    supabase.from('retiros').select('monto'),
  ])

  if (productosResult.error || ventasResult.error || retirosResult.error) {
    return NextResponse.json({ error: 'Error al obtener métricas' }, { status: 500 })
  }

  const productos = productosResult.data
  const ventas = ventasResult.data
  const retiros = retirosResult.data

  const disponibles = productos.filter((p) => p.estado === 'disponible')
  const valorStockCosto = disponibles.reduce((acc, p) => acc + p.costo, 0)
  const valorStockVenta = disponibles.reduce((acc, p) => acc + p.precio_venta, 0)

  const gananciaTotal = ventas.reduce((acc, v) => acc + (v.ganancia ?? 0), 0)
  const totalRetiros = retiros.reduce((acc, r) => acc + r.monto, 0)
  const saldoDisponible = gananciaTotal - totalRetiros

  const margenPromedio =
    ventas.length > 0
      ? ventas.reduce((acc, v) => acc + (v.ganancia ?? 0) / v.precio_vendido, 0) / ventas.length
      : 0

  return NextResponse.json({
    valor_stock_costo: valorStockCosto,
    valor_stock_venta: valorStockVenta,
    ganancia_total: gananciaTotal,
    total_retiros: totalRetiros,
    saldo_disponible: saldoDisponible,
    margen_promedio: margenPromedio,
    total_ventas: ventas.length,
    total_productos: productos.length,
    productos_disponibles: disponibles.length,
  })
}
