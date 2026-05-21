import { useState, useMemo } from 'react'
import dayjs from 'dayjs'
import useStore from '../store/useStore'

const EXPENSE_CATEGORIES = ['充電費', '洗車', '維修保養', '規費', '保險', '停車', '其他']

function useRecordLookup() {
  return useStore((s) =>
    Object.fromEntries(s.platforms.map((p) => [p.id, { name: p.name, color: p.color }]))
  )
}

function EditRow({ record, platformMap, onSave, onCancel }) {
  const platforms = useStore((s) => s.platforms)
  const [amount, setAmount] = useState(String(record.amount))
  const [note, setNote] = useState(record.note ?? '')
  const [date, setDate] = useState(record.date)
  const [platformId, setPlatformId] = useState(record.platformId ?? '')
  const [category, setCategory] = useState(record.category ?? EXPENSE_CATEGORIES[0])
  const [kwh, setKwh] = useState(record.kwh ? String(record.kwh) : '')
  const [odometer, setOdometer] = useState(record.odometer ? String(record.odometer) : '')

  function handleSave() {
    const amountNum = Number(amount)
    if (!amountNum || amountNum <= 0) return

    const patch = {
      amount: amountNum,
      note,
      date,
      ...(record.type === 'income' ? { platformId } : {}),
      ...(record.type === 'expense'
        ? {
            category,
            ...(category === '充電費'
              ? { kwh: Number(kwh) || undefined, odometer: Number(odometer) || undefined }
              : { kwh: undefined, odometer: undefined }),
          }
        : {}),
    }
    onSave(patch)
  }

  return (
    <div className="bg-surface-2 border border-accent-blue/40 rounded-2xl p-4 flex flex-col gap-3">
      <p className="text-accent-blue text-xs font-bold tracking-widest uppercase">編輯記錄</p>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-text-muted text-[10px] tracking-widest uppercase">金額 (NT$)</label>
          <input
            type="number"
            inputMode="numeric"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-surface border border-border-dim rounded-xl px-3 py-2.5 text-text-primary text-lg font-bold outline-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-text-muted text-[10px] tracking-widest uppercase">日期</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-surface border border-border-dim rounded-xl px-3 py-2.5 text-text-primary text-sm outline-none"
          />
        </div>
      </div>

      {record.type === 'income' && (
        <div className="flex flex-col gap-1">
          <label className="text-text-muted text-[10px] tracking-widest uppercase">平台</label>
          <div className="flex gap-2 flex-wrap">
            {platforms.map((p) => (
              <button
                key={p.id}
                onClick={() => setPlatformId(p.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  platformId === p.id ? 'border-current' : 'border-border-dim text-text-muted'
                }`}
                style={platformId === p.id ? { color: p.color, borderColor: p.color } : {}}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {record.type === 'expense' && (
        <>
          <div className="flex flex-col gap-1">
            <label className="text-text-muted text-[10px] tracking-widest uppercase">類別</label>
            <div className="flex flex-wrap gap-2">
              {EXPENSE_CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                    category === c ? 'border-accent-red text-accent-red' : 'border-border-dim text-text-muted'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          {category === '充電費' && (
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'kWh', value: kwh, setter: setKwh, ph: '42' },
                { label: 'km', value: odometer, setter: setOdometer, ph: '38420' },
              ].map(({ label, value, setter, ph }) => (
                <div key={label} className="flex flex-col gap-1">
                  <label className="text-text-muted text-[10px] tracking-widest uppercase">{label}</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    placeholder={ph}
                    className="bg-surface border border-border-dim rounded-xl px-3 py-2 text-text-primary text-sm outline-none"
                  />
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <div className="flex flex-col gap-1">
        <label className="text-text-muted text-[10px] tracking-widest uppercase">備註</label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="備註…"
          className="bg-surface border border-border-dim rounded-xl px-3 py-2.5 text-text-primary text-sm outline-none placeholder:text-text-dim"
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleSave}
          className="flex-1 py-3 bg-accent-blue text-black rounded-xl text-sm font-bold"
        >
          儲存修改
        </button>
        <button
          onClick={onCancel}
          className="flex-1 py-3 border border-border-dim text-text-muted rounded-xl text-sm"
        >
          取消
        </button>
      </div>
    </div>
  )
}

export default function History() {
  const records = useStore((s) => s.records)
  const updateRecord = useStore((s) => s.updateRecord)
  const deleteRecord = useStore((s) => s.deleteRecord)
  const platformMap = useRecordLookup()

  const [filter, setFilter] = useState('all')
  const [editingId, setEditingId] = useState(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  const filtered = useMemo(() => {
    const sorted = [...records].sort((a, b) => (a.date < b.date ? 1 : -1))
    return filter === 'all' ? sorted : sorted.filter((r) => r.type === filter)
  }, [records, filter])

  function handleSaveEdit(id, patch) {
    updateRecord(id, patch)
    setEditingId(null)
  }

  function handleDelete(id) {
    deleteRecord(id)
    setConfirmDeleteId(null)
    if (editingId === id) setEditingId(null)
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

      <div className="flex flex-col gap-2 pb-4">
        {filtered.length === 0 && (
          <div className="flex items-center justify-center h-40 text-text-muted text-sm">
            尚無記錄
          </div>
        )}

        {filtered.map((r) => {
          const platform = r.type === 'income' ? platformMap[r.platformId] : null
          const isEditing = editingId === r.id
          const isConfirmingDelete = confirmDeleteId === r.id

          return (
            <div key={r.id} className="flex flex-col gap-2">
              {/* Record row */}
              <div
                className={`bg-surface border rounded-2xl px-4 py-3 flex items-center gap-3 transition-colors ${
                  isEditing ? 'border-accent-blue/40' : 'border-border-dim'
                }`}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                  style={{
                    backgroundColor:
                      r.type === 'income' ? 'rgba(57,255,20,0.12)' : 'rgba(255,59,59,0.12)',
                  }}
                >
                  {r.type === 'income' ? '↑' : '↓'}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {r.type === 'income' ? (
                      <span
                        className="text-xs px-1.5 py-0.5 rounded font-medium"
                        style={{
                          backgroundColor: (platform?.color ?? '#6B7280') + '22',
                          color: platform?.color ?? '#6B7280',
                        }}
                      >
                        {platform?.name ?? r.platformId}
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
                    {r.type === 'income' ? '+' : '-'}
                    {r.amount.toLocaleString()}
                  </p>

                  {isConfirmingDelete ? (
                    <div className="flex gap-1 mt-1">
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="text-[10px] text-accent-red border border-accent-red rounded px-1.5 py-0.5"
                      >
                        確認
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="text-[10px] text-text-muted border border-border-dim rounded px-1.5 py-0.5"
                      >
                        取消
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2 mt-1 justify-end">
                      <button
                        onClick={() => {
                          setEditingId(isEditing ? null : r.id)
                          setConfirmDeleteId(null)
                        }}
                        className={`text-[10px] transition-colors ${
                          isEditing ? 'text-accent-blue' : 'text-text-dim hover:text-accent-blue'
                        }`}
                      >
                        {isEditing ? '收起' : '編輯'}
                      </button>
                      <button
                        onClick={() => {
                          setConfirmDeleteId(r.id)
                          setEditingId(null)
                        }}
                        className="text-[10px] text-text-dim hover:text-accent-red transition-colors"
                      >
                        刪除
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Inline edit panel */}
              {isEditing && (
                <EditRow
                  record={r}
                  platformMap={platformMap}
                  onSave={(patch) => handleSaveEdit(r.id, patch)}
                  onCancel={() => setEditingId(null)}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
