import dayjs from 'dayjs'

export function getTodayNetProfit(records, platforms) {
  const today = dayjs().format('YYYY-MM-DD')

  const todayIncome = records.filter(
    (r) => r.type === 'income' && r.date === today
  )
  const todayElectric = records
    .filter((r) => r.type === 'expense' && r.category === '充電費' && r.date === today)
    .reduce((sum, r) => sum + r.amount, 0)

  const netIncome = todayIncome.reduce((sum, r) => {
    const platform = platforms.find((p) => p.id === r.platformId)
    const commission = platform ? platform.commission / 100 : 0
    return sum + r.amount * (1 - commission)
  }, 0)

  return Math.round(netIncome - todayElectric)
}

export function getMonthlyGrossRevenue(records) {
  const month = dayjs().format('YYYY-MM')
  return records
    .filter((r) => r.type === 'income' && r.date.startsWith(month))
    .reduce((sum, r) => sum + r.amount, 0)
}

export function getElectricCostRatio(records) {
  const month = dayjs().format('YYYY-MM')
  const monthRecords = records.filter((r) => r.date.startsWith(month))

  const gross = monthRecords
    .filter((r) => r.type === 'income')
    .reduce((sum, r) => sum + r.amount, 0)

  const electric = monthRecords
    .filter((r) => r.type === 'expense' && r.category === '充電費')
    .reduce((sum, r) => sum + r.amount, 0)

  if (gross === 0) return 0
  return Math.round((electric / gross) * 1000) / 10
}

export function getWeeklyRevenueData(records) {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const date = dayjs().subtract(i, 'day')
    const dateStr = date.format('YYYY-MM-DD')
    const revenue = records
      .filter((r) => r.type === 'income' && r.date === dateStr)
      .reduce((sum, r) => sum + r.amount, 0)
    days.push({ day: date.format('MM/DD'), revenue })
  }
  return days
}

export function getExpenseBreakdown(records) {
  const month = dayjs().format('YYYY-MM')
  const expenses = records.filter(
    (r) => r.type === 'expense' && r.date.startsWith(month)
  )
  const totals = {}
  for (const r of expenses) {
    totals[r.category] = (totals[r.category] ?? 0) + r.amount
  }
  return Object.entries(totals).map(([name, value]) => ({ name, value }))
}

export function getAvgCostPerKm(records) {
  const charges = records.filter(
    (r) => r.type === 'expense' && r.category === '充電費' && r.kwh && r.odometer
  )
  if (charges.length < 2) return null

  const sorted = [...charges].sort((a, b) => a.odometer - b.odometer)
  let totalKm = 0
  let totalCost = 0
  for (let i = 1; i < sorted.length; i++) {
    const km = sorted[i].odometer - sorted[i - 1].odometer
    if (km > 0) {
      totalKm += km
      totalCost += sorted[i].amount
    }
  }
  if (totalKm === 0) return null
  return Math.round((totalCost / totalKm) * 10) / 10
}
