import { useState, useMemo } from 'react'
import dayjs from 'dayjs'
import useStore from '../store/useStore'

const TYPE_LABEL = { income: '收入', expense: '支出' }

export default function History() {
  const { records, platforms, deleteRecord } = useStore()
  const [filter, setFilter] = useState('all')
  const [confirmId, setConfirmId] = useState(null)

  const sorted = useMemo(
    () => [...records].sort((a, b) => (a.date < b.date ? 1 : -1)),
    [records]
  )

  const filtered = useMemo(() => {
    if (filter === 'all') return sorted
    return sorted.filter((r) => r.type === filter)
  }, [sorted, filter])

  function getPlatformName(id) {
    return platforms.find((p) => p.id === id)?.name ?? id
  }

  function getPlatformColor(id) {
    return platforms.find((p) => p.id === id)?.color ?? '#6B7280'
  }

  return (
    <div className="min-h-full px-4 pt-4">
      <header className="mb-4">
        <h1 className="text-text-primary text-lg font-bold tracking-widest uppercase">記帳歷史</h1>
        <p className="text-text-muted text-xs mt-0.5">共 {records.length} 筆記錄</p>
      </header>

      {/* Filter tabs */}
      <div className="flex bg-surface-2 rounded-2xl p-1 mb-4">
        {[['all', '全部'], ['income', '收入'], ['expense', '支出']].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold tracking-wider transition-all duration-150 ${
              filter === key ? 'bg-accent-blue text-black' : 'text-text-muted'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Records list */}
      <div className="flex flex-col gap-2 pb-4">
        {filtered.length === 0 && (
          <div className="flex items-center justify-center h-40 text-text-muted text-sm">
            尚無記錄
          </div>
        )}
        {filtered.map((r) => (
          <div
            key={r.id}
            className="bg-surface border border-border-dim rounded-2xl px-4 py-3 flex items-center gap-3"
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
              style={{
                backgroundColor:
                  r.type === 'income'
                    ? 'rgba(57,255,20,0.12)'
                    : 'rgba(255,59,59,0.12)',
              }}
            >
              {r.type === 'income' ? '↑' : '↓'}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                {r.type === 'income' ? (
                  <span
                    className="text-xs px-1.5 py-0.5 rounded font-medium"
                    style={{
                      backgroundColor: getPlatformColor(r.platformId) + '22',
                      color: getPlatformColor(r.platformId),
                    }}
                  >
                    {getPlatformName(r.platformId)}
                  </span>
                ) : (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-accent-red/10 text-accent-red font-medium">
                    {r.category}
                  </span>
                )}
                {r.note && (
                  <span className="text-text-muted text-xs truncate">{r.note}</span>
                )}
              </div>
              <p className="text-text-muted text-[10px] mt-0.5">
                {dayjs(r.date).format('MM/DD')}
                {r.kwh ? ` · ${r.kwh} kWh` : ''}
                {r.odometer ? ` · ${r.odometer.toLocaleString()} km` : ''}
              </p>
            </div>

            <div className="text-right flex-shrink-0">
              <p
                className={`font-bold text-base ${
                  r.type === 'income' ? 'text-accent-green' : 'text-accent-red'
                }`}
              >
                {r.type === 'income' ? '+' : '-'}{r.amount.toLocaleString()}
              </p>
              {confirmId === r.id ? (
                <div className="flex gap-1 mt-1">
                  <button
                    onClick={() => { deleteRecord(r.id); setConfirmId(null) }}
                    className="text-[10px] text-accent-red border border-accent-red rounded px-1.5 py-0.5"
                  >
                    確認
                  </button>
                  <button
                    onClick={() => setConfirmId(null)}
                    className="text-[10px] text-text-muted border border-border-dim rounded px-1.5 py-0.5"
                  >
                    取消
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmId(r.id)}
                  className="text-[10px] text-text-dim mt-1 hover:text-accent-red transition-colors"
                >
                  刪除
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
