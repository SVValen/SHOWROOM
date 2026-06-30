import type { ReactNode } from 'react'
import Link from 'next/link'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-52 bg-white border-r border-gray-200 flex flex-col py-6 px-4 gap-1 shrink-0">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">
          Showroom
        </div>
        <NavLink href="/stock">📦 Stock</NavLink>
        <NavLink href="/caja">💰 Caja</NavLink>
        <NavLink href="/retiros">💸 Retiros</NavLink>
        <NavLink href="/metricas">📊 Métricas</NavLink>
      </aside>

      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}

function NavLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
    >
      {children}
    </Link>
  )
}
