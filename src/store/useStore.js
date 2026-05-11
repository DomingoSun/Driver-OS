import { create } from 'zustand'
import dayjs from 'dayjs'
import { loadState, saveState } from '../lib/storage'

const today = dayjs().format('YYYY-MM-DD')
const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD')
const twoDaysAgo = dayjs().subtract(2, 'day').format('YYYY-MM-DD')
const threeDaysAgo = dayjs().subtract(3, 'day').format('YYYY-MM-DD')
const fourDaysAgo = dayjs().subtract(4, 'day').format('YYYY-MM-DD')
const fiveDaysAgo = dayjs().subtract(5, 'day').format('YYYY-MM-DD')
const sixDaysAgo = dayjs().subtract(6, 'day').format('YYYY-MM-DD')
const monthStart = dayjs().startOf('month').format('YYYY-MM-DD')

const SEED_DATA = {
  records: [
    { id: '1', type: 'income', platformId: 'uber', amount: 1850, date: today, note: '早班' },
    { id: '2', type: 'income', platformId: 'uber', amount: 920, date: today, note: '午班' },
    { id: '3', type: 'expense', category: '充電費', amount: 280, date: today, note: 'Tesla SC 台北', kwh: 42, odometer: 38420 },
    { id: '4', type: 'income', platformId: 'linetaxi', amount: 1240, date: yesterday, note: '' },
    { id: '5', type: 'income', platformId: 'uber', amount: 2100, date: yesterday, note: '全天' },
    { id: '6', type: 'expense', category: '充電費', amount: 310, date: yesterday, note: 'Tesla SC 新竹', kwh: 48, odometer: 38220 },
    { id: '7', type: 'income', platformId: 'airport', amount: 1800, date: twoDaysAgo, note: '桃機接送' },
    { id: '8', type: 'income', platformId: 'uber', amount: 980, date: twoDaysAgo, note: '' },
    { id: '9', type: 'expense', category: '洗車', amount: 250, date: twoDaysAgo, note: '精洗' },
    { id: '10', type: 'income', platformId: 'uber', amount: 1650, date: threeDaysAgo, note: '' },
    { id: '11', type: 'income', platformId: 'linetaxi', amount: 890, date: threeDaysAgo, note: '' },
    { id: '12', type: 'expense', category: '充電費', amount: 295, date: threeDaysAgo, note: '', kwh: 44, odometer: 37980 },
    { id: '13', type: 'income', platformId: 'uber', amount: 2250, date: fourDaysAgo, note: '週末' },
    { id: '14', type: 'expense', category: '停車', amount: 120, date: fourDaysAgo, note: '' },
    { id: '15', type: 'income', platformId: 'airport', amount: 2400, date: fiveDaysAgo, note: '雙程' },
    { id: '16', type: 'income', platformId: 'uber', amount: 1100, date: fiveDaysAgo, note: '' },
    { id: '17', type: 'expense', category: '充電費', amount: 320, date: fiveDaysAgo, note: '', kwh: 50, odometer: 37680 },
    { id: '18', type: 'income', platformId: 'linetaxi', amount: 1560, date: sixDaysAgo, note: '' },
    { id: '19', type: 'income', platformId: 'uber', amount: 870, date: sixDaysAgo, note: '' },
    { id: '20', type: 'expense', category: '維修保養', amount: 3500, date: monthStart, note: '定期保養' },
    { id: '21', type: 'expense', category: '保險', amount: 2800, date: monthStart, note: '月繳' },
    { id: '22', type: 'expense', category: '規費', amount: 450, date: monthStart, note: '牌照稅' },
    { id: '23', type: 'income', platformId: 'uber', amount: 1920, date: monthStart, note: '' },
    { id: '24', type: 'income', platformId: 'uber', amount: 1430, date: dayjs().subtract(8, 'day').format('YYYY-MM-DD'), note: '' },
    { id: '25', type: 'expense', category: '充電費', amount: 265, date: dayjs().subtract(8, 'day').format('YYYY-MM-DD'), note: '', kwh: 40, odometer: 37200 },
  ],
  platforms: [
    { id: 'uber', name: 'Uber', commission: 25, color: '#00D1FF' },
    { id: 'linetaxi', name: 'LINE TAXI', commission: 15, color: '#39FF14' },
    { id: 'airport', name: '機場接送', commission: 20, color: '#FFD600' },
  ],
  settings: {
    currency: 'NT$',
    webhookUrl: '',
    vehicleName: 'Tesla Model 3',
  },
}

function mergeWithSeed(saved) {
  if (!saved) return SEED_DATA
  return {
    records: saved.records ?? SEED_DATA.records,
    platforms: saved.platforms ?? SEED_DATA.platforms,
    settings: { ...SEED_DATA.settings, ...(saved.settings ?? {}) },
  }
}

const initial = mergeWithSeed(loadState())

function genId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `id_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

const useStore = create((set, get) => ({
  ...initial,

  addRecord: (record) => {
    const newRecord = { ...record, id: genId() }
    const s = get()
    const records = [newRecord, ...s.records]
    saveState({ records, platforms: s.platforms, settings: s.settings })
    set({ records })
    return newRecord
  },

  deleteRecord: (id) => {
    const s = get()
    const records = s.records.filter((r) => r.id !== id)
    saveState({ records, platforms: s.platforms, settings: s.settings })
    set({ records })
  },

  upsertPlatform: (platform) => {
    const s = get()
    const exists = s.platforms.find((p) => p.id === platform.id)
    const platforms = exists
      ? s.platforms.map((p) => (p.id === platform.id ? { ...p, ...platform } : p))
      : [...s.platforms, { ...platform, id: platform.id ?? genId() }]
    saveState({ records: s.records, platforms, settings: s.settings })
    set({ platforms })
  },

  deletePlatform: (id) => {
    const s = get()
    const platforms = s.platforms.filter((p) => p.id !== id)
    saveState({ records: s.records, platforms, settings: s.settings })
    set({ platforms })
  },

  updateSettings: (patch) => {
    const s = get()
    const settings = { ...s.settings, ...patch }
    saveState({ records: s.records, platforms: s.platforms, settings })
    set({ settings })
  },

  resetAll: () => {
    saveState({
      records: SEED_DATA.records,
      platforms: SEED_DATA.platforms,
      settings: SEED_DATA.settings,
    })
    set({
      records: SEED_DATA.records,
      platforms: SEED_DATA.platforms,
      settings: SEED_DATA.settings,
    })
  },

  clearAll: () => {
    saveState({ records: [], platforms: SEED_DATA.platforms, settings: get().settings })
    set({ records: [] })
  },
}))

export default useStore
