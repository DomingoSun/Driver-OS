const VARIANTS = {
  green: {
    border: 'border-accent-green border-glow-green',
    value: 'text-accent-green text-glow-green',
    badge: 'bg-accent-green/10 text-accent-green',
  },
  blue: {
    border: 'border-accent-blue border-glow-blue',
    value: 'text-accent-blue text-glow-blue',
    badge: 'bg-accent-blue/10 text-accent-blue',
  },
  red: {
    border: 'border-accent-red border-glow-red',
    value: 'text-accent-red text-glow-red',
    badge: 'bg-accent-red/10 text-accent-red',
  },
}

export default function MetricCard({ label, value, unit = '', sub, variant = 'blue', className = '' }) {
  const v = VARIANTS[variant] ?? VARIANTS.blue

  return (
    <div
      className={`relative flex flex-col justify-between bg-surface border rounded-2xl p-4 overflow-hidden ${v.border} ${className}`}
    >
      <div className="absolute inset-0 opacity-5 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

      <p className="text-text-muted text-xs font-medium tracking-widest uppercase truncate">
        {label}
      </p>

      <div className="mt-2 flex items-end gap-1.5">
        <span className={`text-3xl font-bold leading-none tabular-nums ${v.value}`}>
          {value}
        </span>
        {unit && (
          <span className={`text-sm font-medium mb-0.5 ${v.value} opacity-70`}>
            {unit}
          </span>
        )}
      </div>

      {sub && (
        <p className={`mt-2 text-xs px-2 py-0.5 rounded-full self-start ${v.badge}`}>
          {sub}
        </p>
      )}
    </div>
  )
}
