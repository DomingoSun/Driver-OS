import { useState } from 'react'
import useStore from '../store/useStore'

const PRESET_COLORS = ['#00D1FF', '#39FF14', '#FFD600', '#FF3B3B', '#A855F7', '#F97316', '#EC4899']

function Section({ title, children }) {
  return (
    <div className="mb-6">
      <h2 className="text-text-muted text-xs font-medium tracking-widest uppercase mb-3">{title}</h2>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  )
}

function PlatformRow({ platform, onEdit, onDelete }) {
  return (
    <div className="bg-surface border border-border-dim rounded-2xl px-4 py-3 flex items-center gap-3">
      <span
        className="w-3 h-3 rounded-full flex-shrink-0"
        style={{ backgroundColor: platform.color }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-text-primary text-sm font-medium">{platform.name}</p>
        <p className="text-text-muted text-xs">抽成 {platform.commission}%</p>
      </div>
      <button onClick={() => onEdit(platform)} className="text-text-muted text-xs hover:text-accent-blue transition-colors px-2">
        編輯
      </button>
      <button onClick={() => onDelete(platform.id)} className="text-text-muted text-xs hover:text-accent-red transition-colors px-2">
        刪除
      </button>
    </div>
  )
}

export default function Settings() {
  const { platforms, settings, upsertPlatform, deletePlatform, updateSettings } = useStore()
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', commission: '', color: PRESET_COLORS[0] })
  const [webhookUrl, setWebhookUrl] = useState(settings.webhookUrl ?? '')
  const [vehicleName, setVehicleName] = useState(settings.vehicleName ?? '')
  const [saved, setSaved] = useState(false)

  function openEdit(platform) {
    setEditing(platform.id)
    setForm({ name: platform.name, commission: String(platform.commission), color: platform.color })
  }

  function openNew() {
    setEditing('new')
    setForm({ name: '', commission: '', color: PRESET_COLORS[0] })
  }

  function handleSavePlatform() {
    if (!form.name || !form.commission) return
    upsertPlatform({
      id: editing === 'new' ? undefined : editing,
      name: form.name,
      commission: Number(form.commission),
      color: form.color,
    })
    setEditing(null)
  }

  function handleSaveSettings() {
    updateSettings({ webhookUrl, vehicleName })
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  return (
    <div className="min-h-full px-4 pt-4 pb-6">
      <header className="mb-6">
        <h1 className="text-text-primary text-lg font-bold tracking-widest uppercase">設定</h1>
      </header>

      {/* Vehicle */}
      <Section title="車輛資訊">
        <div className="bg-surface border border-border-dim rounded-2xl px-4 py-3">
          <label className="text-text-muted text-xs tracking-widest uppercase block mb-2">車輛名稱</label>
          <input
            type="text"
            value={vehicleName}
            onChange={(e) => setVehicleName(e.target.value)}
            placeholder="Tesla Model 3"
            className="w-full bg-transparent text-text-primary text-sm outline-none placeholder:text-text-dim"
          />
        </div>
      </Section>

      {/* Platforms */}
      <Section title="平台管理">
        {platforms.map((p) => (
          <PlatformRow
            key={p.id}
            platform={p}
            onEdit={openEdit}
            onDelete={deletePlatform}
          />
        ))}
        <button
          onClick={openNew}
          className="border border-dashed border-border-dim rounded-2xl px-4 py-3 text-text-muted text-sm text-center hover:border-accent-blue hover:text-accent-blue transition-colors"
        >
          + 新增平台
        </button>

        {/* Inline edit form */}
        {editing && (
          <div className="bg-surface-2 border border-accent-blue/30 rounded-2xl p-4 flex flex-col gap-3">
            <p className="text-accent-blue text-xs font-bold tracking-widest uppercase">
              {editing === 'new' ? '新增平台' : '編輯平台'}
            </p>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="平台名稱"
              className="bg-surface border border-border-dim rounded-xl px-4 py-2.5 text-text-primary text-sm outline-none placeholder:text-text-dim"
            />
            <div className="flex items-center gap-2">
              <input
                type="number"
                inputMode="numeric"
                value={form.commission}
                onChange={(e) => setForm({ ...form, commission: e.target.value })}
                placeholder="抽成比例"
                className="flex-1 bg-surface border border-border-dim rounded-xl px-4 py-2.5 text-text-primary text-sm outline-none placeholder:text-text-dim"
              />
              <span className="text-text-muted text-sm">%</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setForm({ ...form, color: c })}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${
                    form.color === c ? 'border-white scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSavePlatform}
                className="flex-1 py-2.5 bg-accent-blue text-black rounded-xl text-sm font-bold"
              >
                儲存
              </button>
              <button
                onClick={() => setEditing(null)}
                className="flex-1 py-2.5 border border-border-dim text-text-muted rounded-xl text-sm"
              >
                取消
              </button>
            </div>
          </div>
        )}
      </Section>

      {/* Webhook */}
      <Section title="Google Sheets 同步 (Webhook)">
        <div className="bg-surface border border-border-dim rounded-2xl px-4 py-3">
          <label className="text-text-muted text-xs tracking-widest uppercase block mb-2">Webhook URL</label>
          <input
            type="url"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://hooks.zapier.com/..."
            className="w-full bg-transparent text-text-primary text-xs outline-none placeholder:text-text-dim break-all"
          />
        </div>
        <p className="text-text-dim text-[10px] px-1">
          每次新增記帳後自動推送 JSON 至此 URL，可串接 Zapier / Make 寫入 Google Sheets。
        </p>
      </Section>

      <button
        onClick={handleSaveSettings}
        className={`w-full py-4 rounded-2xl text-base font-bold tracking-widest uppercase transition-all active:scale-95 ${
          saved ? 'bg-accent-green text-black glow-green' : 'bg-accent-blue text-black glow-blue'
        }`}
      >
        {saved ? '✓ 已儲存' : '儲存設定'}
      </button>

      <div className="mt-6 text-center">
        <p className="text-text-dim text-xs">DriverOS v1.0.0</p>
        <p className="text-text-dim text-[10px] mt-0.5">Professional Driver Accounting</p>
      </div>
    </div>
  )
}
