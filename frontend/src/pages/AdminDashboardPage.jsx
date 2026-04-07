import { useEffect, useMemo, useState } from 'react'
import { useToast } from '../context/ToastContext'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import RatingStars from '../components/product/RatingStars'
import axios from 'axios'
import { formatInr } from '../utils/currency'

const DEFAULT_CATEGORY = 'Electronics'
const EMPTY_ORDERS = []

function money(n) {
  return formatInr(n)
}

function clamp(n, min, max) {
  const value = Number(n)
  if (Number.isNaN(value)) return min
  return Math.max(min, Math.min(max, value))
}

export default function AdminDashboardPage({ section = 'all' }) {
  const { pushToast } = useToast()

  const [adminProducts, setAdminProducts] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const categoryOptions = useMemo(() => {
    const categories = Array.from(new Set(adminProducts.map((product) => product.category).filter(Boolean)))
    const availableCategories = categories.filter((category) => category !== 'All')
    return availableCategories.length > 0 ? availableCategories : [DEFAULT_CATEGORY]
  }, [adminProducts])

  const [draft, setDraft] = useState({
    name: '',
    category: DEFAULT_CATEGORY,
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
    const totalSales = adminProducts.reduce((sum, product) => sum + product.price * (product.inventory / 10), 0)
    const orders = Math.max(128, Math.floor(totalSales / 15))
    const users = 6400
    const revenue = totalSales * 3.2
    return { totalSales, orders, users, revenue }
  }, [adminProducts])

  const revenuePoints = useMemo(() => {
    const base = stats.revenue / 12
    return Array.from({ length: 12 }).map((_, index) => {
      const wiggle = 0.65 + ((index % 5) * 0.1)
      return base * wiggle
    })
  }, [stats.revenue])

  const filteredProducts = useMemo(() => adminProducts, [adminProducts])

  function openAdd() {
    setEditingId(null)
    setDraft({
      name: '',
      category: categoryOptions[0] ?? DEFAULT_CATEGORY,
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
      category: product.category ?? categoryOptions[0] ?? DEFAULT_CATEGORY,
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

  async function refreshProducts() {
    const res = await axios.get('http://localhost:5000/api/products')
    setAdminProducts(res.data)
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
      if (editingId) {
        await axios.put(`http://localhost:5000/api/products/${editingId}`, {
          name: draft.name,
          category: draft.category,
          price,
          rating,
          inventory,
          images: [draft.imageUrl],
        })
      } else {
        await axios.post('http://localhost:5000/api/products', {
          name: draft.name,
          category: draft.category,
          price,
          rating,
          inventory,
          images: [draft.imageUrl],
        })
      }

      await refreshProducts()
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
      setAdminProducts((prev) => prev.filter((product) => product._id !== productId))
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="p-2">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Admin Dashboard</h1>
          <p className="mt-2 text-sm text-slate-300">Manage products, inventory, pricing, and recent order activity.</p>
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
            <p className="text-sm font-extrabold text-white">Revenue trend</p>
            <p className="text-xs text-slate-400">Last 12 months</p>
          </div>
          <div className="mt-4 grid grid-cols-12 items-end gap-2">
            {revenuePoints.map((value, index) => (
              <div key={index} className="overflow-hidden rounded-xl border border-white/10 bg-brand-600/20">
                <div style={{ height: `${clamp((value / Math.max(...revenuePoints)) * 100, 12, 100)}%` }} className="bg-brand-600/60" />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {(section === 'all' || section === 'products') && (
        <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-4 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-extrabold text-white">Product catalog</h2>
            <p className="text-xs text-slate-400">{productsCount} products in catalog</p>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[680px] text-left">
              <thead>
                <tr className="text-xs font-extrabold text-slate-300">
                  <th className="px-3 py-3">Name</th>
                  <th className="px-3 py-3">Category</th>
                  <th className="px-3 py-3">Price</th>
                  <th className="px-3 py-3">Rating</th>
                  <th className="px-3 py-3">Inventory</th>
                  <th className="px-3 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product._id} className="border-t border-white/10">
                    <td className="px-3 py-3">
                      <div className="font-extrabold text-white">{product.name}</div>
                      <div className="text-xs text-slate-400">{product.id}</div>
                    </td>
                    <td className="px-3 py-3 text-slate-200">{product.category}</td>
                    <td className="px-3 py-3 text-slate-200">{money(product.price)}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <RatingStars rating={product.rating} />
                        <span className="text-xs font-bold text-slate-400">{Number(product.rating).toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-slate-200">{product.inventory}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <Button variant="secondary" size="sm" onClick={() => openEdit(product)}>
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => onDelete(product._id)}>
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
            <p className="text-xs text-slate-400">
              {EMPTY_ORDERS.length > 0 ? `${EMPTY_ORDERS.length} recent orders` : 'No recent orders yet'}
            </p>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="text-xs font-extrabold text-slate-300">
                  <th className="px-3 py-3">Order ID</th>
                  <th className="px-3 py-3">Customer</th>
                  <th className="px-3 py-3">Total</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Placed At</th>
                </tr>
              </thead>
              <tbody>
                {EMPTY_ORDERS.length > 0 ? (
                  EMPTY_ORDERS.map((order) => (
                    <tr key={order.id} className="border-t border-white/10">
                      <td className="px-3 py-3 font-extrabold text-white">{order.id}</td>
                      <td className="px-3 py-3 text-slate-200">{order.customer}</td>
                      <td className="px-3 py-3 text-slate-200">{money(order.total)}</td>
                      <td className="px-3 py-3">
                        <span className={order.status === 'Delivered' ? 'text-brand-300' : 'text-slate-200'}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-slate-400">{order.placedAt}</td>
                    </tr>
                  ))
                ) : (
                  <tr className="border-t border-white/10">
                    <td colSpan="5" className="px-3 py-6 text-sm text-slate-400">
                      Orders will appear here as customers complete checkout.
                    </td>
                  </tr>
                )}
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
          <Input label="Name" value={draft.name} onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))} placeholder="Product name" />
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-slate-300">Category</span>
              <select
                value={draft.category}
                onChange={(e) => setDraft((prev) => ({ ...prev, category: e.target.value }))}
                className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-slate-100 outline-none transition focus:border-brand-400/70 focus:ring-2 focus:ring-brand-400/20"
              >
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
            <Input label="Image URL" value={draft.imageUrl} onChange={(e) => setDraft((prev) => ({ ...prev, imageUrl: e.target.value }))} placeholder="https://..." />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Input label="Price" value={draft.price} onChange={(e) => setDraft((prev) => ({ ...prev, price: e.target.value }))} placeholder="79.99" />
            <Input label="Rating" value={draft.rating} onChange={(e) => setDraft((prev) => ({ ...prev, rating: e.target.value }))} placeholder="4.6" />
            <Input label="Inventory" value={draft.inventory} onChange={(e) => setDraft((prev) => ({ ...prev, inventory: e.target.value }))} placeholder="42" />
          </div>
          <p className="text-xs text-slate-400">Update pricing, stock, and product details from one place.</p>
        </div>
      </Modal>
    </div>
  )
}
