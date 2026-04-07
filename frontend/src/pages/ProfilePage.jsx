import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import ProductCard from '../components/product/ProductCard'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import products from '../assets/data/products.json'
import { formatInr } from '../utils/currency'

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

  const wishlistProducts = useMemo(() => {
    const ids = new Set(wishlist)
    return products.filter((product) => ids.has(product.id)).slice(0, 8)
  }, [wishlist])

  const [tab, setTab] = useState(TABS[0])
  const [orders, setOrders] = useState([])

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    async function fetchOrders() {
      try {
        const token = JSON.parse(localStorage.getItem('smartshop_auth_v1'))?.token
        const res = await fetch('http://localhost:5000/api/orders/my', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await res.json()
        setOrders(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error(err)
      }
    }

    fetchOrders()
  }, [isAuthenticated, navigate])

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

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">My Account</h1>
          <p className="mt-2 text-sm text-slate-300">Manage your profile, orders, wishlist, and delivery addresses.</p>
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

          <div className="mt-4 hidden gap-2 sm:grid">
            {TABS.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => setTab(name)}
                className={`rounded-2xl border px-3 py-2 text-left text-sm font-extrabold transition ${
                  tab === name ? 'border-brand-400/70 bg-brand-600/20 text-white' : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
                }`}
              >
                {name}
              </button>
            ))}
          </div>

          <div className="mt-4 sm:hidden">
            <select
              value={tab}
              onChange={(e) => setTab(e.target.value)}
              className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-slate-100 outline-none transition focus:border-brand-400/70 focus:ring-2 focus:ring-brand-400/20"
            >
              {TABS.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </aside>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-card">
          {tab === 'Profile' ? (
            <div className="grid gap-4">
              <h2 className="text-lg font-extrabold text-white">Profile details</h2>
              <div className="rounded-2xl border border-white/10 bg-slate-950/20 p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="Phone" value={draft.phone} onChange={(e) => setDraft((prev) => ({ ...prev, phone: e.target.value }))} placeholder="Phone" />
                  <Input label="City" value={draft.city} onChange={(e) => setDraft((prev) => ({ ...prev, city: e.target.value }))} placeholder="City" />
                  <Input
                    label="Address"
                    value={draft.addressLine1}
                    onChange={(e) => setDraft((prev) => ({ ...prev, addressLine1: e.target.value }))}
                    placeholder="Street address"
                    className="sm:col-span-2"
                  />
                  <Input
                    label="Postal code"
                    value={draft.postalCode}
                    onChange={(e) => setDraft((prev) => ({ ...prev, postalCode: e.target.value }))}
                    placeholder="Postal code"
                  />
                </div>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-slate-400">Keep your contact and delivery details up to date.</p>
                  <Button size="lg" onClick={saveProfile}>
                    Save changes
                  </Button>
                </div>
              </div>
            </div>
          ) : null}

          {tab === 'Orders' ? (
            <div>
              <h2 className="text-lg font-extrabold text-white">Order history</h2>
              <div className="mt-4 grid gap-3">
                {orders.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-slate-950/20 p-4 text-sm text-slate-300">
                    You have not placed any orders yet.
                  </div>
                ) : (
                  orders.map((order) => (
                    <div key={order._id ?? order.id} className="rounded-2xl border border-white/10 bg-slate-950/20 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-extrabold text-white">{order._id ?? order.id}</p>
                          <p className="mt-1 text-xs text-slate-400">Placed: {formatDate(order.createdAt ?? order.placedAt)}</p>
                        </div>
                        <p className="text-sm font-extrabold text-white">{formatInr(order.totals?.total ?? 0)}</p>
                      </div>
                      <p className="mt-3 text-xs font-bold text-slate-300">
                        Status: <span className="text-brand-300">{order.status}</span>
                      </p>
                    </div>
                  ))
                )}
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
                  {wishlistProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={(selectedProduct, variant) => {
                        addToCart(selectedProduct, variant, 1)
                        pushToast({ title: 'Added to cart', message: selectedProduct.name, type: 'success' })
                      }}
                      onToggleWishlist={(productId) => toggleWishlist(productId)}
                      wishlisted={wishlist.includes(product.id)}
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
                  {draft.addressLine1 || '-'} <br />
                  {draft.city || '-'} <br />
                  {draft.postalCode || '-'}
                </p>
                <Button variant="secondary" size="md" className="mt-4" onClick={() => setTab('Profile')}>
                  Edit profile details
                </Button>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  )
}
