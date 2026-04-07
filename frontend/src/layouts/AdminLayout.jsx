import { Link, NavLink, Outlet } from 'react-router-dom'

export default function AdminLayout() {
  return (
    <div className="min-h-dvh bg-slate-950 text-slate-100">
      <div className="mx-auto flex w-full max-w-6xl gap-6 px-4 py-8">
        <aside className="w-64 shrink-0 hidden lg:block">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-card">
            <div className="mb-4 flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-600 text-white font-extrabold">
                AD
              </span>
              <div>
                <p className="text-sm font-extrabold">Admin</p>
                <p className="text-xs text-slate-400">SmartShop control panel</p>
              </div>
            </div>
            <nav className="grid gap-1">
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `rounded-xl px-3 py-2 text-sm font-semibold transition ${
                    isActive ? 'bg-white/10 text-slate-50' : 'text-slate-300 hover:bg-white/5'
                  }`
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/admin/products"
                className={({ isActive }) =>
                  `rounded-xl px-3 py-2 text-sm font-semibold transition ${
                    isActive ? 'bg-white/10 text-slate-50' : 'text-slate-300 hover:bg-white/5'
                  }`
                }
              >
                Products
              </NavLink>
              <NavLink
                to="/admin/orders"
                className={({ isActive }) =>
                  `rounded-xl px-3 py-2 text-sm font-semibold transition ${
                    isActive ? 'bg-white/10 text-slate-50' : 'text-slate-300 hover:bg-white/5'
                  }`
                }
              >
                Orders
              </NavLink>
            </nav>
          </div>
        </aside>

        <section className="flex-1">
          <div className="lg:hidden mb-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="flex items-center justify-between">
                <p className="font-extrabold">Admin</p>
                <Link to="/" className="text-xs text-slate-300 hover:text-slate-50">
                  Back to store
                </Link>
              </div>
            </div>
          </div>
          <Outlet />
        </section>
      </div>
    </div>
  )
}

