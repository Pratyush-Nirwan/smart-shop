import { Link } from 'react-router-dom'
import Button from '../ui/Button'
import RatingStars from './RatingStars'
import { IconHeart } from '../common/Icons'
import { formatInr } from '../../utils/currency'

export default function ProductCard({ product, onAddToCart, onToggleWishlist, wishlisted, loading = false }) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-card">
        <div className="aspect-square w-full animate-pulse rounded-xl bg-white/10" />
        <div className="mt-3 h-5 w-4/5 animate-pulse rounded bg-white/10" />
        <div className="mt-2 h-4 w-1/3 animate-pulse rounded bg-white/10" />
        <div className="mt-3 h-4 w-2/3 animate-pulse rounded bg-white/10" />
        <div className="mt-4 h-11 w-full animate-pulse rounded-xl bg-brand-600/20" />
      </div>
    )
  }

  const defaultVariant = {
    color: product.variants?.colors?.[0] ?? null,
    size: product.variants?.sizes?.[0] ?? null,
  }

  return (
    <div className="group relative rounded-2xl border border-white/10 bg-white/5 p-4 shadow-card transition hover:-translate-y-0.5 hover:bg-white/7">
      <div className="flex items-start justify-between gap-3">
        <Link to={`/products/${product.id}`} className="min-w-0">
          <div className="aspect-square overflow-hidden rounded-xl bg-white/10">
            <img
              src={product.images?.[0]}
              alt={product.name}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              loading="lazy"
            />
          </div>
        </Link>
        <button
          type="button"
          onClick={() => onToggleWishlist?.(product.id)}
          className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-200 hover:bg-white/10"
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <IconHeart className={`h-5 w-5 ${wishlisted ? 'text-red-400' : 'text-slate-300'}`} />
        </button>
      </div>

      <div className="mt-4">
        <Link
          to={`/products/${product.id}`}
          className="truncate text-sm font-bold text-slate-50 hover:text-white"
          title={product.name}
        >
          {product.name}
        </Link>

        <div className="mt-2 flex items-center justify-between">
          <div className="text-lg font-extrabold text-white">{formatInr(product.price)}</div>
          <RatingStars rating={product.rating} />
        </div>

        <div className="mt-4">
          <Button
            className="w-full"
            size="md"
            variant="primary"
            onClick={() => onAddToCart?.(product, defaultVariant)}
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  )
}

