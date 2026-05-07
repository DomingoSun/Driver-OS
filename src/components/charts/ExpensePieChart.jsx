import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const COLORS = ['#00D1FF', '#39FF14', '#FF3B3B', '#FFD600', '#A855F7', '#F97316', '#EC4899']

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const { name, value } = payload[0].payload
  return (
    <div className="bg-surface-2 border border-border-dim rounded-lg px-3 py-2 text-xs">
      <p className="text-text-muted mb-0.5">{name}</p>
      <p className="font-bold" style={{ color: payload[0].payload.fill }}>
        NT$ {value.toLocaleString()}
      </p>
    </div>
  )
}

function CustomLegend({ payload }) {
  return (
    <ul className="flex flex-wrap gap-x-3 gap-y-1.5 justify-center mt-2">
      {payload.map((entry, i) => (
        <li key={i} className="flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-text-muted text-[10px]">{entry.value}</span>
        </li>
      ))}
    </ul>
  )
}

export default function ExpensePieChart({ data }) {
  if (!data?.length) {
    return (
      <div className="bg-surface border border-border-dim rounded-2xl p-4 flex items-center justify-center h-48">
        <p className="text-text-muted text-sm">本月尚無支出記錄</p>
      </div>
    )
  }

  const total = data.reduce((s, d) => s + d.value, 0)
  const colored = data.map((d, i) => ({ ...d, fill: COLORS[i % COLORS.length] }))

  return (
    <div className="bg-surface border border-border-dim rounded-2xl p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-text-muted text-xs font-medium tracking-widest uppercase">
          本月支出分布
        </h3>
        <span className="text-text-muted text-xs">
          總計 <span className="text-accent-red font-bold">NT$ {total.toLocaleString()}</span>
        </span>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={colored}
            cx="50%"
            cy="45%"
            innerRadius={52}
            outerRadius={78}
            paddingAngle={3}
            dataKey="value"
          >
            {colored.map((entry, i) => (
              <Cell key={i} fill={entry.fill} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
