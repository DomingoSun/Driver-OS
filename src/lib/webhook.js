/**
 * Webhook / API interface — reserved for Google Sheets sync and future integrations.
 * Set WEBHOOK_URL in Settings to activate.
 */

export async function pushToWebhook(url, payload) {
  if (!url) return { ok: false, error: 'No webhook URL configured' }
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    return { ok: res.ok, status: res.status }
  } catch (err) {
    return { ok: false, error: err.message }
  }
}

export function buildRecordPayload(record, platform) {
  return {
    source: 'DriverOS',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    record,
    platform: platform ?? null,
  }
}
