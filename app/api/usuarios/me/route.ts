import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getSession, hashPassword, verifyPassword, createSession } from '@/lib/auth'

export async function PATCH(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const body = await request.json()
  const supabase = createServiceClient()

  const { data: usuario } = await supabase
    .from('usuarios')
    .select('id, telegram_id, nombre, password_hash')
    .eq('id', session.userId)
    .single()

  if (!usuario) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })

  const updates: Record<string, string> = {}

  // Cambio de nombre/telegram_id
  if (body.nombre && body.nombre !== usuario.nombre) {
    updates.nombre = body.nombre.trim()
  }
  if (body.telegram_id && body.telegram_id !== usuario.telegram_id) {
    updates.telegram_id = String(body.telegram_id).trim()
  }

  // Cambio de contraseña
  if (body.password_actual && body.password_nueva) {
    const ok = await verifyPassword(body.password_actual, usuario.password_hash)
    if (!ok) return NextResponse.json({ error: 'La contraseña actual es incorrecta' }, { status: 400 })
    updates.password_hash = await hashPassword(body.password_nueva)
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Nada para actualizar' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('usuarios')
    .update(updates)
    .eq('id', session.userId)
    .select('id, telegram_id, nombre')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Renovar la sesión con los datos nuevos
  await createSession({ userId: data.id, telegramId: data.telegram_id, nombre: data.nombre })
  return NextResponse.json(data)
}
