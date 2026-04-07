export default function Spinner({ className = '', size = 'md' }) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  }

  return (
    <div
      className={`inline-block animate-spin rounded-full border-2 border-white/20 border-t-brand-400 ${sizes[size]} ${className}`}
      aria-label="Loading"
    />
  )
}

