import { useMemo, useState, useEffect } from 'react'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import ProductCard from '../components/product/ProductCard'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import products from '../assets/data/products.json'
import { useNavigate } from 'react-router-dom'

const TABS = ['Profile', 'Orders', 'Wishlist', 'Addresses']

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString()
  } catch {
    return iso
  }
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, updateProfile, logout, isAuthenticated } = useAuth()
  const { addToCart, toggleWishlist, wishlist } = useCart()
  const { pushToast } = useToast()

 if (!isAuthenticated) {
  navigate('/login')
  return null
}

  const wishlistProducts = useMemo(() => {
    const ids = new Set(wishlist)
    return products.filter((p) => ids.has(p.id)).slice(0, 8)
  }, [wishlist])

  const [orders, setOrders] = useState([])

  useEffect(() => {
  async function fetchOrders() {
    try {
      const token = JSON.parse(localStorage.getItem('smartshop_auth_v1'))?.token

      const res = await fetch('http://localhost:5000/api/orders/my', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await res.json()
      setOrders(data)
    } catch (err) {
      console.error(err)
    }
  }

  fetchOrders()
}, [])
    
  const profile = user?.profile ?? {}

  const [draft, setDraft] = useState({
    phone: profile.phone ?? '',
    addressLine1: profile.addressLine1 ?? '',
    city: profile.city ?? '',
    postalCode: profile.postalCode ?? '',
  })

  function saveProfile() {
    updateProfile(draft)
    pushToast({ title: 'Profile updated', message: 'Changes saved.', type: 'success' })
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Dashboard</h1>
         <p className="text-xs text-green-400">
  Logged in with JWT
</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              logout()
              navigate('/login')
            }}
          >
            Sign out
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-brand-600/30" />
            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold text-white">{user?.name}</p>
              <p className="truncate text-xs text-slate-400">{user?.email}</p>
            </div>
          </div>

          <div className="mt-4 hidden sm:grid gap-2">
            {TABS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`rounded-2xl border px-3 py-2 text-left text-sm font-extrabold transition ${
                  tab === t ? 'border-brand-400/70 bg-brand-600/20 text-white' : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="mt-4 sm:hidden">
            <select
              value={tab}
              onChange={(e) => setTab(e.target.value)}
              className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-slate-100 outline-none transition focus:border-brand-400/70 focus:ring-2 focus:ring-brand-400/20"
            >
              {TABS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </aside>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-card">
          {tab === 'Profile' ? (
            <div className="grid gap-4">
              <h2 className="text-lg font-extrabold text-white">Editable Profile</h2>
              <div className="rounded-2xl border border-white/10 bg-slate-950/20 p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="Phone" value={draft.phone} onChange={(e) => setDraft((p) => ({ ...p, phone: e.target.value }))} placeholder="Phone" />
                  <Input label="City" value={draft.city} onChange={(e) => setDraft((p) => ({ ...p, city: e.target.value }))} placeholder="City" />
                  <Input
                    label="Address"
                    value={draft.addressLine1}
                    onChange={(e) => setDraft((p) => ({ ...p, addressLine1: e.target.value }))}
                    placeholder="Street address"
                    className="sm:col-span-2"
                  />
                  <Input
                    label="Postal code"
                    value={draft.postalCode}
                    onChange={(e) => setDraft((p) => ({ ...p, postalCode: e.target.value }))}
                    placeholder="Postal code"
                  />
                </div>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-slate-400">
                    Profile updates are stored locally in this demo.
                  </p>
                  <Button size="lg" onClick={saveProfile}>
                    Save changes
                  </Button>
                </div>
              </div>
            </div>
          ) : null}

          {tab === 'Orders' ? (
            <div>
              <h2 className="text-lg font-extrabold text-white">Orders History</h2>
              <div className="mt-4 grid gap-3">
                {orders.map((o) => (
                  <div key={o.id} className="rounded-2xl border border-white/10 bg-slate-950/20 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                       <p className="text-sm font-extrabold text-white">{o._id}</p>
<p className="mt-1 text-xs text-slate-400">
  Placed: {formatDate(o.createdAt)}
</p>
                      </div>
                     <p className="text-sm font-extrabold text-white">
  ${o.totals?.total?.toFixed(2)}
</p>
                    </div>
                    <p className="mt-3 text-xs font-bold text-slate-300">
  Status:{' '}
  <span className="text-brand-300">
    {o.status}
  </span>
</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {tab === 'Wishlist' ? (
            <div>
              <h2 className="text-lg font-extrabold text-white">Wishlist</h2>
              {wishlistProducts.length === 0 ? (
                <p className="mt-4 text-sm text-slate-400">No saved items yet.</p>
              ) : (
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {wishlistProducts.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      onAddToCart={(product, variant) => {
                        addToCart(product, variant, 1)
                        pushToast({ title: 'Added to cart', message: product.name, type: 'success' })
                      }}
                      onToggleWishlist={(productId) => toggleWishlist(productId)}
                      wishlisted={wishlist.includes(p.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : null}

          {tab === 'Addresses' ? (
            <div>
              <h2 className="text-lg font-extrabold text-white">Addresses</h2>
              <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/20 p-4">
                <p className="text-sm font-extrabold text-white">Default</p>
                <p className="mt-2 text-sm text-slate-300">
                  {draft.addressLine1 || '—'} <br />
                  {draft.city || '—'} <br />
                  {draft.postalCode || '—'}
                </p>
                <Button
                  variant="secondary"
                  size="md"
                  className="mt-4"
                  onClick={() => setTab('Profile')}
                >
                  Edit in Profile
                </Button>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  )
}
// replace dummy orders with api
