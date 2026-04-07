import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import heroImg from '../assets/hero.png'
import ProductCard from '../components/product/ProductCard'
import Button from '../components/ui/Button'
import RatingStars from '../components/product/RatingStars'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { getAllCategories, getFeaturedProducts } from '../services/productService'

export default function HomePage() {
  const navigate = useNavigate()
  const { addToCart, toggleWishlist, wishlist } = useCart()
  const { pushToast } = useToast()

  const categories = useMemo(() => {
    return getAllCategories().filter((category) => category !== 'All').slice(0, 8)
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
      <section className="overflow-hidden rounded-3xl border border-white/10 bg-hero-gradient p-6 shadow-soft md:p-10">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200">
              <span className="h-2 w-2 rounded-full bg-brand-400" />
              New arrivals every week
            </div>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white md:text-5xl">
              SmartShop for everyday essentials, gifts, and upgrades
            </h1>
            <p className="mt-4 text-base text-slate-300 md:text-lg">
              Discover reliable picks across tech, home, beauty, and lifestyle with fast checkout and
              easy order management.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                size="lg"
                onClick={() => navigate('/products')}
                leftIcon={<span className="inline-flex h-2 w-2 rounded-full bg-white" />}
              >
                Shop now
              </Button>
              <Button variant="secondary" size="lg" onClick={() => navigate('/profile')}>
                My account
              </Button>
              <Link
                to="/products"
                className="mt-2 text-center text-sm font-semibold text-brand-300 hover:text-brand-200 sm:mt-0 sm:text-left"
              >
                Browse featured deals
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-bold text-white">Free shipping</p>
                <p className="mt-1 text-xs text-slate-300">On eligible orders</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-bold text-white">7-day returns</p>
                <p className="mt-1 text-xs text-slate-300">Easy exchanges</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-bold text-white">Secure checkout</p>
                <p className="mt-1 text-xs text-slate-300">Protected payments</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-12 bg-brand-600/20 blur-3xl" />
            <div className="relative rounded-3xl border border-white/10 bg-white/5 p-4 shadow-card">
              <img
                src={heroImg}
                alt="Featured SmartShop products"
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
                <p className="text-xs font-semibold text-slate-300">Delivery</p>
                <p className="mt-2 text-sm font-extrabold text-white">Fast dispatch</p>
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
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => navigate(`/products?category=${encodeURIComponent(category)}`)}
              className="group rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:-translate-y-0.5 hover:bg-white/10"
            >
              <p className="text-sm font-extrabold text-white">{category}</p>
              <p className="mt-1 text-xs text-slate-300 transition group-hover:text-slate-200">Shop now</p>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-white">Featured Products</h2>
            <p className="mt-2 text-sm text-slate-300">Hand-picked favorites from our latest collections.</p>
          </div>
          <Button variant="secondary" onClick={() => navigate('/products')}>
            View all
          </Button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 8 }).map((_, index) => <ProductCard key={index} product={null} loading />)
            : featured.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAdd}
                  onToggleWishlist={(productId) => toggleWishlist(productId)}
                  wishlisted={wishlist.includes(product.id)}
                />
              ))}
        </div>
      </section>

      <section className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6 md:p-10">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <h2 className="text-2xl font-extrabold text-white">Loved by shoppers</h2>
            <p className="mt-3 text-sm text-slate-300">
              From daily essentials to gift-worthy finds, SmartShop keeps shopping simple with trusted
              products, clear pricing, and dependable delivery.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                { label: 'Top-rated picks', value: '4.8/5' },
                { label: 'Easy returns', value: '7 days' },
                { label: 'Customer support', value: '24/7' },
                { label: 'Fresh arrivals', value: 'Weekly' },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
                  <p className="text-xs font-semibold text-slate-300">{stat.label}</p>
                  <p className="mt-2 text-lg font-extrabold text-white">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-6">
            <p className="text-xs font-semibold text-slate-300">Testimonial</p>
            <p className="mt-3 text-base font-bold text-slate-50">
              "The selection is great, delivery is quick, and checkout is easy every time."
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-brand-600/30" />
              <div>
                <p className="text-sm font-bold text-white">Priya Sharma</p>
                <p className="text-xs text-slate-400">Verified buyer</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
