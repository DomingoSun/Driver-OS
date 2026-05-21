import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import useStore from '../store/useStore'

const INCOME = 'income'
const EXPENSE = 'expense'
const EXPENSE_CATEGORIES = ['充電費', '洗車', '維修保養', '規費', '保險', '停車', '其他']

function NumInput({ label, value, onChange, placeholder = '0', unit = '' }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-text-muted text-xs tracking-widest uppercase">{label}</label>
      <div className="flex items-center bg-surface-2 border border-border-dim rounded-xl overflow-hidden">
        <input
          type="number"
          inputMode="numeric"
          pattern="[0-9]*"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-text-primary text-xl font-bold px-4 py-3 outline-none placeholder:text-text-dim"
        />
        {unit && <span className="text-text-muted text-sm pr-4">{unit}</span>}
      </div>
    </div>
  )
}

export default function Record() {
  const platforms = useStore((s) => s.platforms)
  const addRecord = useStore((s) => s.addRecord)
  const navigate = useNavigate()
  const timerRef = useRef(null)

  const [tab, setTab] = useState(INCOME)
  const [platformId, setPlatformId] = useState(platforms[0]?.id ?? '')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0])
  const [customCategory, setCustomCategory] = useState('')
  const [note, setNote] = useState('')
  const [kwh, setKwh] = useState('')
  const [odometer, setOdometer] = useState('')
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'))
  const [saved, setSaved] = useState(false)

  useEffect(() => () => clearTimeout(timerRef.current), [])

  const selectedPlatform = platforms.find((p) => p.id === platformId)
  const commission = selectedPlatform ? selectedPlatform.commission : 0
  const netAmount = amount ? Math.round(Number(amount) * (1 - commission / 100)) : 0
  const amountNum = Number(amount)
  const canSave = amount !== '' && amountNum > 0

  function resetForm() {
    setAmount('')
    setNote('')
    setKwh('')
    setOdometer('')
  }

  function handleSave() {
    if (!canSave) return

    const record = {
      type: tab,
      date,
      amount: amountNum,
      note,
      ...(tab === INCOME ? { platformId } : {}),
      ...(tab === EXPENSE
        ? {
            category: category === '其他' ? customCategory || '其他' : category,
            ...(category === '充電費'
              ? { kwh: Number(kwh) || undefined, odometer: Number(odometer) || undefined }
              : {}),
          }
        : {}),
    }

    addRecord(record)
    resetForm()
    setSaved(true)
    timerRef.current = setTimeout(() => {
      navigate('/history', { replace: false })
    }, 600)
  }

  const saveClass = tab === INCOME
    ? 'bg-accent-green text-black glow-green'
    : 'bg-accent-red text-white glow-red'

  return (
    <div className="min-h-full px-4 pt-4 pb-6">
      <header className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-text-muted hover:text-text-primary transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="text-text-primary text-lg font-bold tracking-widest uppercase">快速記帳</h1>
      </header>

      {/* Success overlay */}
      {saved && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 pointer-events-none">
          <div className="flex flex-col items-center gap-3 bg-surface border border-accent-green rounded-3xl px-10 py-8 glow-green">
            <span className="text-5xl text-accent-green">✓</span>
            <span className="text-accent-green font-bold tracking-widest uppercase text-lg">已儲存</span>
            <span className="text-text-muted text-xs">正在跳轉至記帳歷史…</span>
          </div>
        </div>
      )}

      {/* Type toggle */}
      <div className="flex bg-surface-2 rounded-2xl p-1 mb-6">
        {[[INCOME, '收入'], [EXPENSE, '支出']].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 py-3 rounded-xl text-sm font-bold tracking-wider transition-all duration-150 ${
              tab === key
                ? key === INCOME
                  ? 'bg-accent-green text-black glow-green'
                  : 'bg-accent-red text-white glow-red'
                : 'text-text-muted'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {/* Date */}
        <div className="flex flex-col gap-1">
          <label className="text-text-muted text-xs tracking-widest uppercase">日期</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-surface-2 border border-border-dim rounded-xl px-4 py-3 text-text-primary outline-none text-sm"
          />
        </div>

        {tab === INCOME ? (
          <>
            <div className="flex flex-col gap-1">
              <label className="text-text-muted text-xs tracking-widest uppercase">平台</label>
              <div className="flex gap-2 flex-wrap">
                {platforms.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPlatformId(p.id)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all duration-150 ${
                      platformId === p.id ? 'border-current' : 'border-border-dim text-text-muted'
                    }`}
                    style={platformId === p.id ? { color: p.color, borderColor: p.color } : {}}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            <NumInput label="流水金額 (NT$)" value={amount} onChange={setAmount} placeholder="1500" />

            {amount && (
              <div className="bg-surface-2 border border-accent-green/30 rounded-xl px-4 py-3 flex items-center justify-between">
                <span className="text-text-muted text-sm">實領金額 (扣 {commission}%)</span>
                <span className="text-accent-green font-bold text-xl">
                  NT$ {netAmount.toLocaleString()}
                </span>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex flex-col gap-1">
              <label className="text-text-muted text-xs tracking-widest uppercase">類別</label>
              <div className="flex flex-wrap gap-2">
                {EXPENSE_CATEGORIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-all duration-150 ${
                      category === c
                        ? 'border-accent-red text-accent-red'
                        : 'border-border-dim text-text-muted'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              {category === '其他' && (
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="自訂類別名稱"
                  className="mt-2 bg-surface-2 border border-border-dim rounded-xl px-4 py-2.5 text-text-primary text-sm outline-none placeholder:text-text-dim"
                />
              )}
            </div>

            <NumInput label="金額 (NT$)" value={amount} onChange={setAmount} placeholder="300" />

            {category === '充電費' && (
              <div className="grid grid-cols-2 gap-3">
                <NumInput label="充電度數 (kWh)" value={kwh} onChange={setKwh} placeholder="42" unit="kWh" />
                <NumInput label="當前里程 (km)" value={odometer} onChange={setOdometer} placeholder="38420" unit="km" />
              </div>
            )}
          </>
        )}

        {/* Note */}
        <div className="flex flex-col gap-1">
          <label className="text-text-muted text-xs tracking-widest uppercase">備註 (選填)</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="如: 早班、桃機接送..."
            className="bg-surface-2 border border-border-dim rounded-xl px-4 py-3 text-text-primary text-sm outline-none placeholder:text-text-dim"
          />
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={!canSave}
          className={`mt-2 w-full py-4 rounded-2xl text-base font-bold tracking-widest uppercase transition-all duration-150 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed ${saveClass}`}
        >
          儲存
        </button>
      </div>
    </div>
  )
}
