import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = createServiceClient()
  const { searchParams } = new URL(request.url)

  let query = supabase
    .from('ventas')
    .select('*, productos(nombre, foto_url)')
    .order('fecha', { ascending: false })

  const desde = searchParams.get('desde')
  if (desde) query = query.gte('fecha', desde)

  const hasta = searchParams.get('hasta')
  if (hasta) query = query.lte('fecha', hasta)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = createServiceClient()
  const { producto_id, precio_vendido } = await request.json()

  // Obtener costo actual del producto
  const { data: producto, error: errorProducto } = await supabase
    .from('productos')
    .select('costo')
    .eq('id', producto_id)
    .single()

  if (errorProducto) return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })

  // Registrar venta y marcar producto como vendido en una transacción lógica
  const { data: venta, error: errorVenta } = await supabase
    .from('ventas')
    .insert({ producto_id, precio_vendido, costo_al_momento: producto.costo })
    .select()
    .single()

  if (errorVenta) return NextResponse.json({ error: errorVenta.message }, { status: 500 })

  await supabase
    .from('productos')
    .update({ estado: 'vendido', actualizado_en: new Date().toISOString() })
    .eq('id', producto_id)

  return NextResponse.json(venta, { status: 201 })
}
