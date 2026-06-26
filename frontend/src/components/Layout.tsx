import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, FileText, Users2, ShieldCheck, LogOut, Car } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { initials } from '@/lib/format'

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/reports', label: 'Crash Reports', icon: FileText },
  { to: '/victims', label: 'Victims / Leads', icon: Users2 },
]

export default function Layout() {
  const { user, logout, hasRole } = useAuth()
  const navigate = useNavigate()

  const items = [...nav]
  if (hasRole('Admin')) items.push({ to: '/users', label: 'Users & Roles', icon: ShieldCheck })

  return (
    <div className="flex h-full">
      <aside className="flex w-64 flex-shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="flex items-center gap-2 px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
            <Car size={20} />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight text-slate-800">Crash Intelligence</p>
            <p className="text-xs text-slate-400">Lead Platform</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-2">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-100 p-3">
          <div className="flex items-center gap-3 rounded-lg px-2 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
              {initials(user?.name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-700">{user?.name}</p>
              <p className="truncate text-xs text-slate-400">{user?.roles.join(', ')}</p>
            </div>
            <button
              onClick={async () => {
                await logout()
                navigate('/login')
              }}
              className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              title="Log out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
