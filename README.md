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

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required services:
- **Clerk**: Create app at [clerk.com](https://clerk.com)
- **OpenAI**: Get API key at [platform.openai.com](https://platform.openai.com)
- **Stripe**: Set up at [stripe.com](https://stripe.com) - create a subscription product/price
- **Supabase**: Create project at [supabase.com](https://supabase.com) - get the PostgreSQL connection string

### 3. Set up the database

```bash
npx prisma migrate dev --name init
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Set up webhooks

- **Stripe**: Point webhook to `https://yourdomain.com/api/webhooks/stripe`
  - Events: `checkout.session.completed`, `invoice.payment_succeeded`, `customer.subscription.deleted`, `customer.subscription.updated`
- **Clerk**: Point webhook to `https://yourdomain.com/api/webhooks/clerk`
  - Events: `user.created`, `user.updated`, `user.deleted`

## Deploy to Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add all environment variables
4. Add build command: `npx prisma generate && next build`
5. Deploy

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
