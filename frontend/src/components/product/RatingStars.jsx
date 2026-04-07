export default function RatingStars({ rating, size = 'sm' }) {
  const v = Number(rating) || 0
  const stars = 5
  const full = Math.floor(v)
  const partial = v - full

  const dot = partial > 0 ? 1 : 0

  const sizeClass = size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: stars }).map((_, i) => {
        const isFull = i < full
        const isHalf = !isFull && i === full && dot === 1
        return (
          <span key={i} className={sizeClass + ' inline-flex'}>
            <svg viewBox="0 0 24 24" className="h-full w-full" fill="none">
              <defs>
                <linearGradient id={`g_${size}_${i}`} x1="0" y1="0" x2="1" y2="0">
                  <stop offset={isHalf ? '50%' : '100%'} stopColor={isFull ? '#fbbf24' : '#334155'} />
                  <stop
                    offset={isHalf ? '50%' : '100%'}
                    stopColor={isHalf ? '#fbbf24' : '#334155'}
                  />
                </linearGradient>
              </defs>
              <path
                d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                fill={
                  isFull ? '#fbbf24' : isHalf ? `url(#g_${size}_${i})` : '#334155'
                }
              />
            </svg>
          </span>
        )
      })}
    </div>
  )
}

