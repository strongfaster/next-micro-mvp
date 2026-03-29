# VoiceScribe - Voice to Text AI MVP

A micro MVP for voice-to-text transcription with AI-powered insights. Built with Next.js, OpenAI Whisper, Clerk Auth, Stripe subscriptions, Supabase (Prisma ORM), and shadcn/ui.

## User Flow

1. **Landing Page** - Anonymous user can make 1 free voice recording (transcribed via OpenAI Whisper)
2. **2nd Record Attempt** - User is redirected to sign up (Clerk Auth)
3. **After Sign Up** - User is redirected to subscription page (Stripe)
4. **After Payment** - Full platform access with ChatGPT-like view
5. **Dashboard** - Record voice, view transcriptions with AI insights, all saved to DB

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Auth**: Clerk
- **AI**: OpenAI (Whisper for transcription, GPT-4o-mini for chat)
- **Database**: Supabase PostgreSQL via Prisma ORM
- **Payments**: Stripe Subscriptions
- **UI**: shadcn/ui + Tailwind CSS
- **Deployment**: Vercel

## How to Run / Як запустити

### 1. Clone and install / Клонувати та встановити залежності

```bash
git clone https://github.com/strongfaster/next-micro-mvp.git
cd next-micro-mvp
npm install
```

### 2. Create external services / Створити зовнішні сервіси

You need 4 services. Create accounts and get API keys:

| Service | URL | What to get |
|---------|-----|-------------|
| **Clerk** | https://clerk.com | Publishable Key + Secret Key |
| **OpenAI** | https://platform.openai.com | API Key |
| **Supabase** | https://supabase.com | PostgreSQL connection string (Settings > Database > Connection string > URI) |
| **Stripe** | https://stripe.com | Secret Key + Publishable Key + create a Product with recurring Price ($9/mo) and copy the Price ID (`price_xxx`) |

### 3. Set up environment variables / Налаштувати змінні оточення

```bash
cp .env.example .env
```

Then open `.env` and fill in all values:

```env
# Clerk (https://dashboard.clerk.com -> API Keys)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/subscribe
CLERK_WEBHOOK_SECRET=whsec_...

# Supabase (Settings -> Database -> Connection string -> URI)
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres

# OpenAI (https://platform.openai.com/api-keys)
OPENAI_API_KEY=sk-...

# Stripe (https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Set up the database / Створити таблиці в базі

```bash
npx prisma migrate dev --name init
```

This creates 3 tables in your Supabase PostgreSQL: `User`, `Subscription`, `Record`.

### 5. Run the development server / Запустити локально

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

### 6. Set up webhooks (for production) / Налаштувати вебхуки

For local development, use [Stripe CLI](https://stripe.com/docs/stripe-cli) to forward webhooks:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

For production:
- **Stripe**: Dashboard > Developers > Webhooks > Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
  - Events: `checkout.session.completed`, `invoice.payment_succeeded`, `customer.subscription.deleted`, `customer.subscription.updated`
- **Clerk**: Dashboard > Webhooks > Add endpoint: `https://yourdomain.com/api/webhooks/clerk`
  - Events: `user.created`, `user.updated`, `user.deleted`

## Deploy to Vercel / Деплой на Vercel

1. Push the repo to GitHub
2. Go to [vercel.com](https://vercel.com) > Import project
3. Add **all** environment variables from `.env` (change `NEXT_PUBLIC_APP_URL` to your Vercel domain)
4. Deploy (Vercel auto-detects Next.js, `postinstall` script runs `prisma generate`)
5. Update Stripe & Clerk webhook URLs to your production domain

## Project Structure

```
src/
  app/
    page.tsx              # Landing page with free voice recorder
    layout.tsx            # Root layout with Clerk provider
    sign-in/              # Clerk sign-in page
    sign-up/              # Clerk sign-up page
    subscribe/            # Stripe subscription page
    dashboard/            # Main platform (ChatGPT-like view)
    api/
      transcribe/         # OpenAI Whisper transcription
      records/            # CRUD for transcription records
      stripe/checkout/    # Stripe checkout session creation
      user/subscription/  # Subscription status check
      webhooks/
        stripe/           # Stripe webhook handler
        clerk/            # Clerk webhook handler
  components/
    voice-recorder.tsx    # Voice recording component (MediaRecorder API)
    chat-view.tsx         # ChatGPT-like message view
    ui/                   # shadcn/ui components
  lib/
    prisma.ts             # Prisma client singleton
    openai.ts             # OpenAI client
    stripe.ts             # Stripe client
    utils.ts              # Utility functions
  middleware.ts           # Clerk auth middleware
prisma/
  schema.prisma           # Database schema
```
