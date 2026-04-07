export default function Button({
  variant = 'primary',
  size = 'md',
  className,
  leftIcon,
  rightIcon,
  disabled,
  type = 'button',
  ...props
}) {
  const cn = (...parts) => parts.filter(Boolean).join(' ')
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 disabled:cursor-not-allowed disabled:opacity-60'

  const variants = {
    primary:
      'bg-brand-600 text-white shadow-card hover:bg-brand-500 hover:shadow-soft',
    secondary:
      'bg-white/5 text-slate-100 border border-white/10 hover:bg-white/10',
    ghost: 'bg-transparent text-slate-100 hover:bg-white/10',
    danger: 'bg-red-600/90 text-white hover:bg-red-600',
  }

  const sizes = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-11 px-4 text-sm',
    lg: 'h-12 px-5 text-base',
  }

  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {leftIcon ? <span className="inline-flex">{leftIcon}</span> : null}
      {props.children}
      {rightIcon ? <span className="inline-flex">{rightIcon}</span> : null}
    </button>
  )
}

