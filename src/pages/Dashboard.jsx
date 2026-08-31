import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import useStore from '../store/useStore'
import MetricCard from '../components/MetricCard'
import WeeklyRevenueChart from '../components/charts/WeeklyRevenueChart'
import ExpensePieChart from '../components/charts/ExpensePieChart'
import {
  getTodayNetProfit,
  getMonthlyGrossRevenue,
  getElectricCostRatio,
  getWeeklyRevenueData,
  getExpenseBreakdown,
} from '../lib/calculations'

function PlatformBadge({ platform, records }) {
  const todayStr = dayjs().format('YYYY-MM-DD')
  const todayRev = records
    .filter((r) => r.type === 'income' && r.platformId === platform.id && r.date === todayStr)
    .reduce((s, r) => s + r.amount, 0)

  if (todayRev === 0) return null

  return (
    <div className="flex items-center justify-between bg-surface-2 rounded-xl px-3 py-2.5 border border-border-dim">
      <div className="flex items-center gap-2">
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: platform.color }}
        />
        <span className="text-text-primary text-sm font-medium">{platform.name}</span>
      </div>
      <div className="flex items-center gap-2 text-xs text-text-muted">
        <span>流水 NT$ {todayRev.toLocaleString()}</span>
        <span
          className="px-1.5 py-0.5 rounded text-[10px] font-bold"
          style={{ backgroundColor: platform.color + '22', color: platform.color }}
        >
          -{platform.commission}%
        </span>
        <span className="text-text-primary font-medium">
          實領 NT$ {Math.round(todayRev * (1 - platform.commission / 100)).toLocaleString()}
        </span>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { records, platforms } = useStore()
  const navigate = useNavigate()

  const todayNetProfit = useMemo(() => getTodayNetProfit(records, platforms), [records, platforms])
  const monthlyGross = useMemo(() => getMonthlyGrossRevenue(records), [records])
  const electricRatio = useMemo(() => getElectricCostRatio(records), [records])
  const weeklyData = useMemo(() => getWeeklyRevenueData(records), [records])
  const expenseBreakdown = useMemo(() => getExpenseBreakdown(records), [records])

  const today = dayjs().format('YYYY年MM月DD日')
  const weekday = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'][dayjs().day()]

  return (
    <div className="min-h-full px-4 pt-safe">
      {/* Header */}
      <header className="flex items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <span className="text-accent-blue text-lg font-bold tracking-widest uppercase text-glow-blue">
            Driver
          </span>
          <span className="text-text-primary text-lg font-bold tracking-widest uppercase">
            OS
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse flex-shrink-0" />
        </div>
        <div className="text-right">
          <p className="text-text-muted text-xs">{today} · {weekday}</p>
          <p className="text-accent-blue text-[10px] tabular-nums">
            共 <span className="font-bold">{records.length}</span> 筆記錄
          </p>
        </div>
      </header>

      {/* KPI Cards */}
      <section className="grid grid-cols-1 gap-3 mb-4">
        <MetricCard
          label="今日淨利 (扣除抽成＋電耗)"
          value={`NT$ ${todayNetProfit.toLocaleString()}`}
          variant="green"
          sub={todayNetProfit >= 0 ? '▲ 今日目標進度中' : '▼ 尚未達標'}
        />
        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            label="本月累計營收"
            value={`$${Math.round(monthlyGross / 1000)}k`}
            unit={`/ ${monthlyGross.toLocaleString()}`}
            variant="blue"
            sub={`${dayjs().format('MM')}月`}
          />
          <MetricCard
            label="電耗成本比"
            value={`${electricRatio}%`}
            variant="red"
            sub="充電 / 營收"
          />
        </div>
      </section>

      {/* Today's platform breakdown */}
      <section className="mb-4">
        <h3 className="text-text-muted text-xs font-medium tracking-widest uppercase mb-2">
          今日各平台明細
        </h3>
        <div className="flex flex-col gap-2">
          {platforms.map((p) => (
            <PlatformBadge key={p.id} platform={p} records={records} />
          ))}
        </div>
      </section>

      {/* Weekly Revenue Chart */}
      <section className="mb-4">
        <WeeklyRevenueChart data={weeklyData} />
      </section>

      {/* Expense Pie Chart */}
      <section className="mb-6">
        <ExpensePieChart data={expenseBreakdown} />
      </section>

      {/* FAB — Record */}
      <button
        onClick={() => navigate('/record')}
        className="fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-accent-blue glow-blue flex items-center justify-center shadow-lg active:scale-95 transition-transform"
        aria-label="新增記帳"
      >
        <svg viewBox="0 0 24 24" className="w-7 h-7 text-black" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <path d="M12 5v14M5 12h14" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}
