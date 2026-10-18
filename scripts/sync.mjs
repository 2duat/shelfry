const base = process.env.SITE_URL || 'http://127.0.0.1:3000'
const task = process.argv[2] || 'refresh'
const secret = process.env.CRON_SECRET

if (!secret) {
  console.error('缺少 CRON_SECRET，请检查 .env')
  process.exit(1)
}

const response = await fetch(`${base}/api/cron/sync?task=${encodeURIComponent(task)}`, {
  headers: { 'x-cron-secret': secret },
})

const text = await response.text()
console.log(`[sync:${task}] HTTP ${response.status}`)
console.log(text)
process.exit(response.ok ? 0 : 1)
