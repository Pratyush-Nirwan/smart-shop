import { useMemo, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { IconCart, IconSearch, IconUser } from '../common/Icons'
import Button from '../ui/Button'

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `rounded-xl px-3 py-2 text-sm font-semibold transition ${
          isActive ? 'bg-white/10 text-slate-50' : 'text-slate-300 hover:bg-white/5'
        }`
      }
    >
      {children}
    </NavLink>
  )
}

export default function Navbar() {
  const navigate = useNavigate()
  const { isAuthenticated, user, logout, isAdmin } = useAuth()
  const { cartCount } = useCart()

  const [search, setSearch] = useState('')
  const [openProfile, setOpenProfile] = useState(false)

  const greeting = useMemo(() => {
    const name = user?.name ?? 'there'
    return `Hi, ${name}`
  }, [user?.name])

  function submitSearch(e) {
    e.preventDefault()
    const q = search.trim()
    navigate(`/products?query=${encodeURIComponent(q)}`)
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-card">
              S
            </span>
            <div className="leading-tight">
              <p className="text-sm font-extrabold tracking-tight text-slate-50">SmartShop</p>
              <p className="text-xs text-slate-400">Full-Stack E-Commerce</p>
            </div>
          </Link>
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          <NavItem to="/products">Shop</NavItem>
          <NavItem to="/profile">Dashboard</NavItem>
          {isAdmin ? <NavItem to="/admin">Admin</NavItem> : null}
        </nav>

        <form onSubmit={submitSearch} className="hidden flex-1 md:flex">
          <div className="mx-4 flex w-full items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
            <IconSearch className="h-4 w-4 text-slate-300" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 outline-none"
            />
            {search.trim() ? (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="rounded-lg px-2 py-1 text-xs text-slate-300 hover:bg-white/10"
              >
                Clear
              </button>
            ) : null}
          </div>
        </form>

        <div className="flex items-center gap-2">
          <Link
            to="/cart"
            className="relative rounded-2xl border border-white/10 bg-white/5 p-2 text-slate-100 hover:bg-white/10"
            aria-label="Cart"
          >
            <IconCart className="h-5 w-5" />
            {cartCount > 0 ? (
              <span className="absolute -right-1 -top-2 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-brand-600 px-1 text-xs font-bold text-white">
                {cartCount}
              </span>
            ) : null}
          </Link>

          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenProfile((v) => !v)}
              className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-slate-100 hover:bg-white/10"
            >
              <IconUser className="h-5 w-5" />
              <span className="hidden text-sm font-semibold md:inline">{isAuthenticated ? 'Account' : 'Sign in'}</span>
            </button>

            {openProfile ? (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-white/10 bg-slate-900/90 p-3 shadow-soft">
                {isAuthenticated ? (
                  <>
                    <p className="text-sm font-bold text-slate-50">{greeting}</p>
                    <p className="mt-1 text-xs text-slate-400">{user?.email}</p>
                    <div className="mt-3 grid gap-2">
                      <Link
                        to="/profile"
                        onClick={() => setOpenProfile(false)}
                        className="rounded-xl bg-white/5 px-3 py-2 text-sm font-semibold text-slate-100 hover:bg-white/10"
                      >
                        Profile
                      </Link>
                      {isAdmin ? (
                        <Link
                          to="/admin"
                          onClick={() => setOpenProfile(false)}
                          className="rounded-xl bg-white/5 px-3 py-2 text-sm font-semibold text-slate-100 hover:bg-white/10"
                        >
                          Admin Dashboard
                        </Link>
                      ) : null}
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setOpenProfile(false)
                          logout()
                          navigate('/')
                        }}
                      >
                        Logout
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="grid gap-2">
                    <Link
                      to="/login"
                      onClick={() => setOpenProfile(false)}
                      className="rounded-xl bg-white/5 px-3 py-2 text-sm font-semibold text-slate-100 hover:bg-white/10"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setOpenProfile(false)}
                      className="rounded-xl bg-white/5 px-3 py-2 text-sm font-semibold text-slate-100 hover:bg-white/10"
                    >
                      Create account
                    </Link>
                    <p className="mt-2 text-xs text-slate-400">
                      Tip: use email containing <span className="font-bold">admin</span> to enter the Admin dashboard.
                    </p>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  )
}

