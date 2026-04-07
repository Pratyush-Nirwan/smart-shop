import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import Button from '../components/ui/Button'
import { IconHeart } from '../components/common/Icons'
import RatingStars from '../components/product/RatingStars'
import { Skeleton } from '../components/ui/Skeleton'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { getProductById } from '../services/productService'

function formatVariantLabel({ color, size }) {
  const parts = []
  if (color) parts.push(color)
  if (size) parts.push(size)
  return parts.join(' · ') || 'Default'
}

export default function ProductDetailsPage() {
  const { id } = useParams()
  const { addToCart, toggleWishlist, wishlist } = useCart()
  const { pushToast } = useToast()

  const [loading, setLoading] = useState(true)
  const [product, setProduct] = useState(null)

  const [activeImage, setActiveImage] = useState('')
  const [selectedColor, setSelectedColor] = useState(null)
  const [selectedSize, setSelectedSize] = useState(null)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    let active = true
    getProductById(id)
      .then((p) => {
        if (!active) return
        setProduct(p)
        setActiveImage(p.images?.[0] ?? '')
        setSelectedColor(p.variants?.colors?.[0] ?? null)
        setSelectedSize(p.variants?.sizes?.[0] ?? null)
      })
      .finally(() => {
        if (!active) return
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [id])

  const wishlisted = useMemo(() => {
    if (!product) return false
    return wishlist.includes(product.id)
  }, [product, wishlist])

  function canAdd() {
    if (!product) return false
    const hasColor = product.variants?.colors?.length > 0
    const hasSize = product.variants?.sizes?.length > 0
    const okColor = hasColor ? Boolean(selectedColor) : true
    const okSize = hasSize ? Boolean(selectedSize) : true
    return okColor && okSize && quantity >= 1
  }

  function handleAddToCart() {
    if (!product) return
    if (!canAdd()) {
      pushToast({ title: 'Select a variant', message: 'Choose color/size first.', type: 'error' })
      return
    }

    addToCart(product, { color: selectedColor, size: selectedSize }, quantity)
    pushToast({
      title: 'Added to cart',
      message: `${product.name} (${formatVariantLabel({ color: selectedColor, size: selectedSize })})`,
      type: 'success',
    })
  }

  function inc() {
    if (!product) return
    const maxQty = typeof product.inventory === 'number' ? product.inventory : 99
    setQuantity((q) => Math.min(maxQty, q + 1))
  }
  function dec() {
    setQuantity((q) => Math.max(1, q - 1))
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-card">
            <div className="aspect-square w-full animate-pulse rounded-2xl bg-white/10" />
            <div className="mt-4 grid grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-xl bg-white/10" />
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-card">
            <Skeleton className="h-8 w-2/3" />
            <div className="mt-3 flex items-center gap-3">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="mt-5 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-2/3" />
            <div className="mt-5 grid gap-3">
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-14 text-center">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-10 shadow-card">
          <p className="text-lg font-extrabold text-white">Product not found.</p>
        </div>
      </div>
    )
  }

  const hasColors = (product.variants?.colors ?? []).length > 0
  const hasSizes = (product.variants?.sizes ?? []).length > 0

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-card">
          <div className="aspect-square overflow-hidden rounded-2xl bg-white/10">
            <img
              src={activeImage}
              alt={product.name}
              className="h-full w-full object-cover transition duration-300 hover:scale-[1.02]"
            />
          </div>
          <div className="mt-4 grid grid-cols-4 gap-3">
            {product.images?.slice(0, 4).map((img) => (
              <button
                key={img}
                type="button"
                onClick={() => setActiveImage(img)}
                className={`h-16 overflow-hidden rounded-xl border transition ${
                  activeImage === img ? 'border-brand-400/70' : 'border-white/10'
                } bg-white/5`}
              >
                <img src={img} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-card">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-white">{product.name}</h1>
              <div className="mt-3 flex items-center gap-3">
                <div className="text-2xl font-extrabold text-white">${product.price.toFixed(2)}</div>
                <RatingStars rating={product.rating} size="lg" />
                <span className="text-sm font-bold text-slate-400">{product.rating.toFixed(1)}</span>
              </div>
            </div>

            <Button
              variant={wishlisted ? 'danger' : 'secondary'}
              size="md"
              onClick={() => toggleWishlist(product.id)}
              leftIcon={<IconHeart className="h-5 w-5" />}
            >
              {wishlisted ? 'Wishlisted' : 'Wishlist'}
            </Button>
          </div>

          <p className="mt-5 text-sm leading-relaxed text-slate-300">{product.description}</p>

          <div className="mt-6 grid gap-6">
            {hasColors ? (
              <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-extrabold text-white">Color</p>
                  <p className="text-xs text-slate-400">Selected: {selectedColor}</p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.variants.colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setSelectedColor(c)}
                      className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                        selectedColor === c
                          ? 'border-brand-400/70 bg-brand-600/20 text-slate-50'
                          : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {hasSizes ? (
              <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-extrabold text-white">Size</p>
                  <p className="text-xs text-slate-400">Selected: {selectedSize}</p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.variants.sizes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelectedSize(s)}
                      className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                        selectedSize === s
                          ? 'border-brand-400/70 bg-brand-600/20 text-slate-50'
                          : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-extrabold text-white">Quantity</p>
                <p className="text-xs text-slate-400">In stock: {product.inventory}</p>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={dec}
                  className="h-11 w-12 rounded-xl border border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
                >
                  -
                </button>
                <div className="flex-1">
                  <input
                    type="number"
                    min="1"
                    max={product.inventory}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(product.inventory, Number(e.target.value) || 1)))}
                    className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-center text-slate-100 outline-none transition focus:border-brand-400/70 focus:ring-2 focus:ring-brand-400/20"
                  />
                </div>
                <button
                  type="button"
                  onClick={inc}
                  className="h-11 w-12 rounded-xl border border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
                >
                  +
                </button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Button size="lg" disabled={!canAdd()} onClick={handleAddToCart}>
                Add to Cart
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => {
                  toggleWishlist(product.id)
                  pushToast({
                    title: wishlisted ? 'Removed from wishlist' : 'Saved to wishlist',
                    message: product.name,
                    type: 'success',
                  })
                }}
              >
                {wishlisted ? 'Remove' : 'Save'} Wishlist
              </Button>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-semibold text-slate-400">Variant</p>
              <p className="mt-1 text-sm font-bold text-slate-100">{formatVariantLabel({ color: selectedColor, size: selectedSize })}</p>
            </div>
          </div>
        </div>
      </div>

      <section className="mt-8">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-card">
          <h2 className="text-xl font-extrabold text-white">Reviews</h2>
          <p className="mt-2 text-sm text-slate-300">
            See what customers say about <span className="font-bold text-slate-50">{product.name}</span>.
          </p>

          <div className="mt-5 grid gap-4">
            {product.reviews?.length ? (
              product.reviews.map((r) => (
                <div key={r.id} className="rounded-2xl border border-white/10 bg-slate-950/20 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-extrabold text-white">{r.user}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <RatingStars rating={r.rating} />
                        <span className="text-xs font-bold text-slate-400">{r.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400">{r.date}</p>
                  </div>
                  <p className="mt-3 text-sm text-slate-300">{r.text}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">No reviews yet.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

