export default function Input({
  label,
  hint,
  error,
  className,
  labelClassName,
  ...props
}) {
  return (
    <label className={`block ${className ?? ''}`}>
      {label ? (
        <span className={`mb-1 block text-sm font-semibold ${labelClassName ?? ''}`}>
          {label}
        </span>
      ) : null}
      <input
        className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-slate-100 placeholder:text-slate-400 outline-none transition focus:border-brand-400/70 focus:ring-2 focus:ring-brand-400/20"
        {...props}
      />
      {hint ? <span className="mt-1 block text-xs text-slate-400">{hint}</span> : null}
      {error ? <span className="mt-1 block text-xs text-red-300">{error}</span> : null}
    </label>
  )
}

