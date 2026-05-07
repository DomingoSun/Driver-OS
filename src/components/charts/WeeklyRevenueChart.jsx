import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface-2 border border-accent-blue/30 rounded-lg px-3 py-2 text-xs">
      <p className="text-text-muted mb-1">{label}</p>
      <p className="text-accent-blue font-bold text-sm">
        NT$ {payload[0].value.toLocaleString()}
      </p>
    </div>
  )
}

export default function WeeklyRevenueChart({ data }) {
  if (!data?.length) return null

  const avg = Math.round(data.reduce((s, d) => s + d.revenue, 0) / data.length)

  return (
    <div className="bg-surface border border-border-dim rounded-2xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-text-muted text-xs font-medium tracking-widest uppercase">
          本週營收趨勢
        </h3>
        <span className="text-text-muted text-xs">
          均 <span className="text-accent-blue font-bold">NT$ {avg.toLocaleString()}</span>
        </span>
      </div>

      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#00D1FF" stopOpacity={0.6} />
              <stop offset="100%" stopColor="#00D1FF" stopOpacity={1} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.04)"
            vertical={false}
          />
          <XAxis
            dataKey="day"
            tick={{ fill: '#6B7280', fontSize: 10, fontFamily: 'JetBrains Mono' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#6B7280', fontSize: 10, fontFamily: 'JetBrains Mono' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
          />
          <ReferenceLine
            y={avg}
            stroke="rgba(0,209,255,0.2)"
            strokeDasharray="4 4"
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(0,209,255,0.2)', strokeWidth: 1 }} />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="url(#lineGrad)"
            strokeWidth={2.5}
            dot={{ fill: '#00D1FF', r: 3, strokeWidth: 0 }}
            activeDot={{ fill: '#00D1FF', r: 5, stroke: 'rgba(0,209,255,0.4)', strokeWidth: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
