import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import ProductCard from '../components/product/ProductCard'
import Button from '../components/ui/Button'
import RatingStars from '../components/product/RatingStars'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { listProducts, getAllCategories } from '../services/productService'
import { useDebouncedValue } from '../hooks/useDebouncedValue'

export default function ProductsPage() {
  const navigate = useNavigate()
  const { addToCart, toggleWishlist, wishlist } = useCart()
  const { pushToast } = useToast()

  const [searchParams] = useSearchParams()

 const [categories, setCategories] = useState([])

useEffect(() => {
  async function loadCategories() {
    const cats = await getAllCategories()
    setCategories(cats)
  }
  loadCategories()
}, [])

  const initialQuery = searchParams.get('query') ?? ''
  const initialCategory = searchParams.get('category') ?? 'All'

  const [query, setQuery] = useState(initialQuery)
  const debouncedQuery = useDebouncedValue(query, 300)

  const [category, setCategory] = useState(initialCategory)
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [minRating, setMinRating] = useState(0)

  const [page, setPage] = useState(1)
  const [pageSize] = useState(9)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [total, setTotal] = useState(0)

  const sentinelRef = useRef(null)

  async function fetchAndSet(nextPage, { append }) {
    setLoading(true)
    try {
      const res = await listProducts({
        query: debouncedQuery,
        category,
        minPrice: minPrice === '' ? null : Number(minPrice),
        maxPrice: maxPrice === '' ? null : Number(maxPrice),
        minRating: minRating === 0 ? null : Number(minRating),
        page: nextPage,
        pageSize,
      })

      setTotal(res.total)
      setHasMore(res.hasMore)
      setItems((prev) => (append ? [...prev, ...res.items] : res.items))
    } finally {
      setLoading(false)
    }
  }

  // Reset results on filter change.
  useEffect(() => {
    setPage(1)
  }, [debouncedQuery, category, minPrice, maxPrice, minRating])

  useEffect(() => {
    fetchAndSet(page, { append: page > 1 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    if (!hasMore) return
    if (loading) return

    const io = new IntersectionObserver(
      (entries) => {
        const first = entries[0]
        if (first.isIntersecting && hasMore && !loading) setPage((p) => p + 1)
      },
      { threshold: 0.1 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [hasMore, loading])

  function handleAdd(product, variant) {
    addToCart(product, variant, 1)
    pushToast({ title: 'Added to cart', message: product.name, type: 'success' })
  }

  function clearFilters() {
    setQuery('')
    setCategory('All')
    setMinPrice('')
    setMaxPrice('')
    setMinRating(0)
    pushToast({ title: 'Filters cleared', type: 'info', message: 'Showing all products.' })
    navigate('/products')
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Products</h1>
          <p className="mt-2 text-sm text-slate-300">
            {total ? (
              <>
                Showing page {page}. Total matches: <span className="font-bold text-slate-50">{total}</span>.
              </>
            ) : (
              'Browse and add items to your cart.'
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={clearFilters}>
            Reset
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const q = query.trim()
              navigate(`/products?query=${encodeURIComponent(q)}&category=${encodeURIComponent(category)}`)
            }}
          >
            Share filters
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-card">
          <div className="text-sm font-extrabold text-white">Filters</div>

          <div className="mt-4 grid gap-3">
            <label className="block">
              <div className="mb-1 text-xs font-semibold text-slate-300">Search</div>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name/category..."
                className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-brand-400/70 focus:ring-2 focus:ring-brand-400/20"
              />
            </label>

            <label className="block">
              <div className="mb-1 text-xs font-semibold text-slate-300">Category</div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-slate-100 outline-none transition focus:border-brand-400/70 focus:ring-2 focus:ring-brand-400/20"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <div className="mb-1 text-xs font-semibold text-slate-300">Min price</div>
                <input
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  inputMode="decimal"
                  placeholder="0"
                  className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-brand-400/70 focus:ring-2 focus:ring-brand-400/20"
                />
              </label>
              <label className="block">
                <div className="mb-1 text-xs font-semibold text-slate-300">Max price</div>
                <input
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  inputMode="decimal"
                  placeholder="200"
                  className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-brand-400/70 focus:ring-2 focus:ring-brand-400/20"
                />
              </label>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs font-semibold text-slate-300">Min rating</div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-50">{minRating === 0 ? 'Any' : `${minRating}+`}</span>
                  {minRating > 0 ? <RatingStars rating={minRating} /> : null}
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                step="0.1"
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="mt-3 w-full accent-brand-400"
              />
            </div>

            <div className="text-xs text-slate-400">
              Infinite scroll ready: we load the next page when you approach the bottom.
            </div>
          </div>
        </aside>

        <section>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {loading && items.length === 0
              ? Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-card">
                    <div className="aspect-square w-full animate-pulse rounded-xl bg-white/10" />
                    <div className="mt-3 h-5 w-4/5 animate-pulse rounded bg-white/10" />
                    <div className="mt-2 h-4 w-1/3 animate-pulse rounded bg-white/10" />
                  </div>
                ))
              : items.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onAddToCart={handleAdd}
                    onToggleWishlist={(productId) => toggleWishlist(productId)}
                    wishlisted={wishlist.includes(p.id)}
                  />
                ))}
          </div>

          <div ref={sentinelRef} className="h-10" />

          <div className="mt-6 flex items-center justify-center gap-3">
            {loading ? (
              <div className="inline-flex items-center gap-2 text-slate-300">
                <span className="h-2 w-2 animate-ping rounded-full bg-brand-400" />
                Loading…
              </div>
            ) : hasMore ? (
              <Button onClick={() => setPage((p) => p + 1)} disabled={loading} variant="secondary">
                Load more
              </Button>
            ) : (
              <p className="text-sm text-slate-400">You’ve reached the end.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

