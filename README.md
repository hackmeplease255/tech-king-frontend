# Tech King — Frontend (Vercel)

Next.js + TypeScript + Tailwind dashboard. Deploys to **Vercel**. Contains **no**
WhatsApp logic — it talks to the VPS backend over HTTPS + WebSocket.

## Pages

`/login` `/register` — authentication
`/dashboard` — live stats (real API data)
`/sessions` `/sessions/[id]` — manage WhatsApp sessions
`/pair` — pairing-code flow
`/plugins` — enable/configure plugins
`/customers` `/customers/[id]` — customer records
`/broadcasts` — send + live progress
`/automations` — interval/keyword automation
`/ai` — AI chat (backend gateway)
`/api` — API keys
`/logs` — backend logs (ADMIN)
`/health` — system health
`/settings` — profile & password

## Environment

```env
NEXT_PUBLIC_API_URL=https://api-automation.shimbawifi.xyz/api/v1
NEXT_PUBLIC_WS_URL=https://api-automation.shimbawifi.xyz
```

Everything prefixed `NEXT_PUBLIC_` is visible in the browser — **no secrets here**.

## Local development

```bash
npm install
cp .env.example .env.local   # point at a local or remote backend
npm run dev                  # http://localhost:3000
```

## Deploy to Vercel

1. Import this folder into Vercel.
2. Add `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_WS_URL` in Project → Settings → Environment Variables.
3. Deploy. Optionally attach a custom domain (e.g. `automation.shimbawifi.xyz`) in the Vercel dashboard.
