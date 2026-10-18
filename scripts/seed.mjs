const base = process.env.SITE_URL || 'http://127.0.0.1:3000'
const secret = process.env.SEED_SECRET

if (!secret) {
  console.error('缺少 SEED_SECRET，请检查 .env')
  process.exit(1)
}

const response = await fetch(`${base}/api/seed`, {
  method: 'POST',
  headers: { 'x-seed-secret': secret },
})

const text = await response.text()
console.log(`[seed] HTTP ${response.status}`)
console.log(text)
process.exit(response.ok ? 0 : 1)
