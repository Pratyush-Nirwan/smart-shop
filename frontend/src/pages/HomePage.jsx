import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import heroImg from '../assets/hero.png'
import ProductCard from '../components/product/ProductCard'
import Button from '../components/ui/Button'
import RatingStars from '../components/product/RatingStars'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { getAllCategories } from '../services/productService'
import { getFeaturedProducts } from '../services/productService'

export default function HomePage() {
  const navigate = useNavigate()
  const { addToCart, toggleWishlist, wishlist } = useCart()
  const { pushToast } = useToast()

  const categories = useMemo(() => {
    return getAllCategories().filter((c) => c !== 'All').slice(0, 8)
  }, [])

  const [featured, setFeatured] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    getFeaturedProducts(8)
      .then((items) => {
        if (!active) return
        setFeatured(items)
      })
      .finally(() => {
        if (!active) return
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  function handleAdd(product, variant) {
    addToCart(product, variant, 1)
    pushToast({ title: 'Added to cart', message: product.name, type: 'success' })
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <section className="overflow-hidden rounded-3xl border border-white/10 bg-hero-gradient p-6 md:p-10 shadow-soft">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200">
              <span className="h-2 w-2 rounded-full bg-brand-400" />
              Real-time inventory + payments-ready UI
            </div>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white md:text-5xl">
              SmartShop — Full-Stack E-Commerce Platform
            </h1>
            <p className="mt-4 text-base text-slate-300 md:text-lg">
              Build faster with a modern, responsive storefront: JWT auth forms, cart state, checkout
              steps, and admin dashboard UI.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                size="lg"
                onClick={() => navigate('/products')}
                leftIcon={<span className="inline-flex h-2 w-2 rounded-full bg-white" />}
              >
                Shop Now
              </Button>
              <Button variant="secondary" size="lg" onClick={() => navigate('/profile')}>
                View Dashboard
              </Button>
              <Link
                to="/products"
                className="mt-2 text-center text-sm font-semibold text-brand-300 hover:text-brand-200 sm:mt-0 sm:text-left"
              >
                Browse featured deals →
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-bold text-white">99.9%</p>
                <p className="mt-1 text-xs text-slate-300">Up-time ready</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-bold text-white">1.2s</p>
                <p className="mt-1 text-xs text-slate-300">Fast UI flows</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-bold text-white">Secure</p>
                <p className="mt-1 text-xs text-slate-300">JWT-style auth</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-12 bg-brand-600/20 blur-3xl" />
            <div className="relative rounded-3xl border border-white/10 bg-white/5 p-4 shadow-card">
              <img
                src={heroImg}
                alt="SmartShop preview"
                className="mx-auto h-auto max-h-[380px] w-full rounded-2xl object-contain"
              />
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-semibold text-slate-300">Avg rating</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm font-extrabold text-white">4.7</span>
                  <RatingStars rating={4.7} />
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-semibold text-slate-300">Checkout</p>
                <p className="mt-2 text-sm font-extrabold text-white">Multi-step UI</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-white">Featured Categories</h2>
            <p className="mt-2 text-sm text-slate-300">Discover essentials across every department.</p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => navigate(`/products?category=${encodeURIComponent(cat)}`)}
              className="group rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:-translate-y-0.5 hover:bg-white/10"
            >
              <p className="text-sm font-extrabold text-white">{cat}</p>
              <p className="mt-1 text-xs text-slate-300 transition group-hover:text-slate-200">Shop now</p>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-white">Featured Products</h2>
            <p className="mt-2 text-sm text-slate-300">Hand-picked favorites with fast add-to-cart.</p>
          </div>
          <Button variant="secondary" onClick={() => navigate('/products')}>
            View all
          </Button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <ProductCard key={i} product={null} loading />)
            : featured.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onAddToCart={handleAdd}
                  onToggleWishlist={(productId) => toggleWishlist(productId)}
                  wishlisted={wishlist.includes(p.id)}
                />
              ))}
        </div>
      </section>

      <section className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6 md:p-10">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <h2 className="text-2xl font-extrabold text-white">Loved by shoppers</h2>
            <p className="mt-3 text-sm text-slate-300">
              SmartShop is designed for clean flows: authentication UI, cart state, multi-step checkout, and
              admin management screens.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                { label: 'Conversion-ready UX', value: '12.4%' },
                { label: 'Faster browsing', value: '2.1x' },
                { label: 'Support quality', value: '24/7' },
                { label: 'Inventory confidence', value: 'Live' },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
                  <p className="text-xs font-semibold text-slate-300">{s.label}</p>
                  <p className="mt-2 text-lg font-extrabold text-white">{s.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-6">
            <p className="text-xs font-semibold text-slate-300">Testimonial</p>
            <p className="mt-3 text-base font-bold text-slate-50">
              “Everything feels production-ready. The checkout and admin UI are exactly what we needed.”
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-brand-600/30" />
              <div>
                <p className="text-sm font-bold text-white">Customer Success Team</p>
                <p className="text-xs text-slate-400">SmartShop Pilot</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

