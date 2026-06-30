import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('retiros')
    .select('*')
    .order('fecha', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = createServiceClient()
  const { monto, motivo } = await request.json()

  if (!monto || monto <= 0) {
    return NextResponse.json({ error: 'Monto inválido' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('retiros')
    .insert({ monto, motivo: motivo || null })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
