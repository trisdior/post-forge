# PostForge — Setup Checklist

Everything is built. You just need to sign up for these services and plug in the keys.

## 1. DigitalOcean / Railway (Video Processing Server) — $5/mo
**What:** Runs FFmpeg + Whisper for video clipping
**How:**
- Option A: DigitalOcean → Create Droplet → $6/mo (1GB RAM, 1 CPU)
- Option B: Railway.app → Deploy from GitHub → ~$5/mo

**Deploy the processing server:**
```bash
cd processing-server/
docker build -t postforge-processing .
docker run -p 4000:4000 -e PROCESSING_API_KEY=your-secret-key postforge-processing
```

**After deploy, add to Vercel env vars:**
- `PROCESSING_SERVER_URL` = `https://your-server-url.com`
- `PROCESSING_API_KEY` = whatever you set above

## 2. Stripe (Payments) — Free to create
**What:** Takes payments from users
**How:**
1. Go to stripe.com → Sign up
2. Dashboard → Developers → API keys
3. Copy the **Secret key** (starts with `sk_live_` or `sk_test_`)
4. Add to Vercel: Settings → Environment Variables → `STRIPE_SECRET_KEY`
5. Set up webhook: Developers → Webhooks → Add endpoint
   - URL: `https://postforge-nu.vercel.app/api/webhook/stripe`
   - Events: `checkout.session.completed`

## 3. Grok API (Optional — cheaper AI) — Free tier
**What:** Alternative to Claude for content generation
**How:**
1. Go to console.x.ai
2. Create API key
3. Add to Vercel: `GROK_API_KEY`
(I'll add Grok as a generation option once you have the key)

## 4. Domain — $10
**What:** postforge.com
**How:**
1. Go to porkbun.com
2. Search "postforge.com"
3. Buy it ($10)
4. In Vercel: Settings → Domains → Add "postforge.com"
5. In Porkbun: Add the DNS records Vercel gives you

## Vercel Environment Variables (Summary)
Go to vercel.com → PostForge project → Settings → Environment Variables

| Variable | Value | Required? |
|----------|-------|-----------|
| `ANTHROPIC_API_KEY` | Already set ✅ | Yes |
| `KV_REST_API_URL` | Already set ✅ | Yes |
| `KV_REST_API_TOKEN` | Already set ✅ | Yes |
| `STRIPE_SECRET_KEY` | From Stripe dashboard | For payments |
| `PROCESSING_SERVER_URL` | Your DigitalOcean/Railway URL | For video clips |
| `PROCESSING_API_KEY` | Any secret string you choose | For video clips |
| `GROK_API_KEY` | From console.x.ai | Optional |

## What's Already Working (No setup needed)
- ✅ Landing page (postforge-nu.vercel.app)
- ✅ Auth (signup/login)
- ✅ AI agent system (memory, learning, queue)
- ✅ Agent dashboard
- ✅ Content generation (Create page)
- ✅ Calendar with AI fill
- ✅ Analytics (real agent data)
- ✅ Auto-Pilot (generates week of content)
- ✅ Settings page
- ✅ Onboarding → Agent
- ✅ Admin dashboard
- ✅ Clip analysis (transcript → viral moments) — works NOW without processing server
- ✅ Usage limits enforced (Free: 10, Growth: 50, Pro: 150, Business: 500)

## What Needs Keys to Unlock
- 💳 Stripe → Payments go live
- 🎬 Processing server → Video upload + cut + caption
- 🤖 Grok → Cheaper AI generation
- 🌐 Domain → Professional URL

## Total Cost to Launch
- DigitalOcean: $6/mo
- Domain: $10 one-time
- Stripe: Free
- Grok: Free
- **Total: $16**
