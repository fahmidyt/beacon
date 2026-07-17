import { chromium } from '@playwright/test'
import { mkdir } from 'node:fs/promises'

const base = 'http://127.0.0.1:5173'
const api = `${base}/api/sessions/sarah-j8xk2/events`
const out = 'artifacts/gif-frames'
await mkdir(out, { recursive: true })

const browser = await chromium.launch({ headless: true })
const walker = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 })
const receiver = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 })
await Promise.all([walker.goto(base), receiver.goto(`${base}/share/sarah-j8xk2`)])
await Promise.all([walker.waitForLoadState('networkidle'), receiver.waitForLoadState('networkidle')])

const post = async event => walker.request.post(api, { data: event })
const capture = async (index, phase, status) => {
  await post({ type: 'patch', patch: { phase, status } })
  await walker.waitForTimeout(450)
  await Promise.all([
    walker.screenshot({ path: `${out}/${index}-walker.png` }),
    receiver.screenshot({ path: `${out}/${index}-receiver.png` }),
  ])
}

await post({ type: 'reset' })
await capture('01', 'onboarding', 'idle')
await capture('02', 'setup', 'idle')
await capture('03', 'active', 'safe')
await post({ type: 'panic' })
await walker.waitForTimeout(250)
await Promise.all([
  walker.screenshot({ path: `${out}/04-walker.png` }),
  receiver.screenshot({ path: `${out}/04-receiver.png` }),
])
await post({ type: 'arrive' })
await walker.waitForTimeout(300)
await Promise.all([
  walker.screenshot({ path: `${out}/05-walker.png` }),
  receiver.screenshot({ path: `${out}/05-receiver.png` }),
])

await browser.close()
