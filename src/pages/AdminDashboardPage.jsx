import { useMemo, useState } from 'react'
import { useToast } from '../context/ToastContext'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import RatingStars from '../components/product/RatingStars'
import axios from 'axios'
import { useEffect } from 'react'

const CATEGORY_OPTIONS = ['All', ...Array.from(new Set(productsSeed.map((p) => p.category)))].filter(
  (c) => c !== 'All'
)

function money(n) {
  return `$${Number(n ?? 0).toFixed(2)}`
}

function clamp(n, min, max) {
  const v = Number(n)
  if (Number.isNaN(v)) return min
  return Math.max(min, Math.min(max, v))
}

export default function AdminDashboardPage({ section = 'all' }) {
  const { pushToast } = useToast()

  const [adminProducts, setAdminProducts] = useState([])

  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const [draft, setDraft] = useState({
    name: '',
    category: CATEGORY_OPTIONS[0] ?? 'Electronics',
    price: '',
    rating: '4.5',
    inventory: '',
    imageUrl: '',
  })

  useEffect(() => {
  async function fetchProducts() {
    try {
      const res = await axios.get('http://localhost:5000/api/products')
      setAdminProducts(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  fetchProducts()
}, [])

  const productsCount = adminProducts.length

  const stats = useMemo(() => {
    // Dummy SaaS-style KPIs.
    const totalSales = adminProducts.reduce((sum, p) => sum + p.price * (p.inventory / 10), 0)
    const orders = Math.max(128, Math.floor(totalSales / 15))
    const users = 6400
    const revenue = totalSales * 3.2
    return { totalSales, orders, users, revenue }
  }, [adminProducts])

  const revenuePoints = useMemo(() => {
    const base = stats.revenue / 12
    return Array.from({ length: 12 }).map((_, i) => {
      const wiggle = 0.65 + ((i % 5) * 0.1)
      return base * wiggle
    })
  }, [stats.revenue])

  const filteredProducts = useMemo(() => {
    return adminProducts
  }, [adminProducts])

  function openAdd() {
    setEditingId(null)
    setDraft({
      name: '',
      category: CATEGORY_OPTIONS[0] ?? 'Electronics',
      price: '',
      rating: '4.5',
      inventory: '',
      imageUrl: 'https://placehold.co/1200x1200/png?text=New+Product',
    })
    setModalOpen(true)
  }

  function openEdit(product) {
    setEditingId(product._id)
    setDraft({
      name: product.name ?? '',
      category: product.category ?? CATEGORY_OPTIONS[0] ?? 'Electronics',
      price: String(product.price ?? ''),
      rating: String(product.rating ?? '4.5'),
      inventory: String(product.inventory ?? ''),
      imageUrl: product.images?.[0] ?? '',
    })
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingId(null)
  }

  async function onSave() {
  const price = Number(draft.price)
  const rating = clamp(Number(draft.rating), 0, 5)
  const inventory = Math.max(0, Math.floor(Number(draft.inventory)))

  if (!draft.name.trim()) {
    pushToast({ title: 'Missing name', type: 'error' })
    return
  }

  try {
    // 🟡 CASE 1: UPDATE PRODUCT
    if (editingId) {
      await axios.put(`http://localhost:5000/api/products/${editingId}`, {
        name: draft.name,
        category: draft.category,
        price,
        rating,
        inventory,
        images: [draft.imageUrl],
      })
    }

    // 🟢 CASE 2: ADD NEW PRODUCT
    else {
      await axios.post(`http://localhost:5000/api/products`, {
        name: draft.name,
        category: draft.category,
        price,
        rating,
        inventory,
        images: [draft.imageUrl],
      })
    }

    // 🔄 REFRESH DATA FROM BACKEND
    const res = await axios.get('http://localhost:5000/api/products')
    setAdminProducts(res.data)

    pushToast({ title: 'Success', type: 'success' })
    closeModal()
  } catch (err) {
    console.error(err)
    pushToast({ title: 'Error', message: 'Operation failed', type: 'error' })
  }
}

  async function onDelete(productId) {
  try {
    await axios.delete(`http://localhost:5000/api/products/${productId}`)
    setAdminProducts((prev) => prev.filter((p) => p._id !== productId))
  } catch (err) {
    console.error(err)
  }
}

  const orders = useMemo([])

  return (
    <div className="p-2">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Admin Dashboard</h1>
          <p className="mt-2 text-sm text-slate-300">Stats, product management, orders, and modals.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={openAdd}>
            Add product
          </Button>
        </div>
      </div>

      <div className={`mt-6 grid gap-4 ${section === 'products' ? 'md:grid-cols-[1fr]' : 'md:grid-cols-4'}`}>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-card">
          <p className="text-xs font-semibold text-slate-400">Total Sales</p>
          <p className="mt-2 text-2xl font-extrabold text-white">{money(stats.totalSales)}</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-card">
          <p className="text-xs font-semibold text-slate-400">Orders</p>
          <p className="mt-2 text-2xl font-extrabold text-white">{stats.orders}</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-card">
          <p className="text-xs font-semibold text-slate-400">Users</p>
          <p className="mt-2 text-2xl font-extrabold text-white">{stats.users.toLocaleString()}</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-card">
          <p className="text-xs font-semibold text-slate-400">Revenue</p>
          <p className="mt-2 text-2xl font-extrabold text-white">{money(stats.revenue)}</p>
        </div>
      </div>

      {section !== 'orders' && section !== 'products' ? (
        <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-card">
          <div className="flex items-center justify-between">
            <p className="text-sm font-extrabold text-white">Revenue graph</p>
            <p className="text-xs text-slate-400">Placeholder chart UI</p>
          </div>
          <div className="mt-4 grid grid-cols-12 gap-2 items-end">
            {revenuePoints.map((v, i) => (
              <div key={i} className="rounded-xl bg-brand-600/20 border border-white/10 overflow-hidden">
                <div style={{ height: `${clamp((v / Math.max(...revenuePoints)) * 100, 12, 100)}%` }} className="bg-brand-600/60" />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {(section === 'all' || section === 'products') && (
        <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-4 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-extrabold text-white">Products management</h2>
            <p className="text-xs text-slate-400">{productsCount} products in UI</p>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[680px] text-left">
              <thead>
                <tr className="text-xs font-extrabold text-slate-300">
                  <th className="py-3 px-3">Name</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Price</th>
                  <th className="py-3 px-3">Rating</th>
                  <th className="py-3 px-3">Inventory</th>
                  <th className="py-3 px-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => (
                  <tr key={p._id} className="border-t border-white/10">
                    <td className="py-3 px-3">
                      <div className="font-extrabold text-white">{p.name}</div>
                      <div className="text-xs text-slate-400">{p.id}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-200">{p.category}</td>
                    <td className="py-3 px-3 text-slate-200">{money(p.price)}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <RatingStars rating={p.rating} />
                        <span className="text-xs font-bold text-slate-400">{Number(p.rating).toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-200">{p.inventory}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <Button variant="secondary" size="sm" onClick={() => openEdit(p)}>
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => onDelete(p._id)}>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(section === 'all' || section === 'orders') && (
        <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-4 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-extrabold text-white">Orders</h2>
            <p className="text-xs text-slate-400">{orders.length} orders (demo)</p>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="text-xs font-extrabold text-slate-300">
                  <th className="py-3 px-3">Order ID</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Total</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Placed At</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-t border-white/10">
                    <td className="py-3 px-3 font-extrabold text-white">{o.id}</td>
                    <td className="py-3 px-3 text-slate-200">{o.customer}</td>
                    <td className="py-3 px-3 text-slate-200">{money(o.total)}</td>
                    <td className="py-3 px-3">
                      <span className={o.status === 'Delivered' ? 'text-brand-300' : 'text-slate-200'}>
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400">{o.placedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        open={modalOpen}
        title={editingId ? 'Edit product' : 'Add product'}
        onClose={closeModal}
        footer={
          <div className="flex items-center justify-between gap-3">
            <Button variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button size="lg" onClick={onSave}>
              {editingId ? 'Save changes' : 'Add product'}
            </Button>
          </div>
        }
      >
        <div className="grid gap-4">
          <Input label="Name" value={draft.name} onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))} placeholder="Product name" />
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-slate-300">Category</span>
              <select
                value={draft.category}
                onChange={(e) => setDraft((p) => ({ ...p, category: e.target.value }))}
                className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-slate-100 outline-none transition focus:border-brand-400/70 focus:ring-2 focus:ring-brand-400/20"
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <Input label="Image URL" value={draft.imageUrl} onChange={(e) => setDraft((p) => ({ ...p, imageUrl: e.target.value }))} placeholder="https://..." />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Input label="Price" value={draft.price} onChange={(e) => setDraft((p) => ({ ...p, price: e.target.value }))} placeholder="79.99" />
            <Input label="Rating" value={draft.rating} onChange={(e) => setDraft((p) => ({ ...p, rating: e.target.value }))} placeholder="4.6" />
            <Input label="Inventory" value={draft.inventory} onChange={(e) => setDraft((p) => ({ ...p, inventory: e.target.value }))} placeholder="42" />
          </div>
          <p className="text-xs text-slate-400">
            This is UI-only admin management. Changes apply in-memory for the current session.
          </p>
        </div>
      </Modal>
    </div>
  )
}

