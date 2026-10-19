# PayAgent OS - Zero-Cost & Free-Tier Deployment Guide 🌐

This document outlines the exact, verified deployment recipes to run **PayAgent OS (NexusPay AI)** on 100% free-tier cloud platforms or container runtimes for hackathon judging and live demonstrations.

---

## ⚡ Option 1: Vercel Hobby Free Tier (Recommended - 2 Minutes)

Vercel is the native platform for Next.js 14 and requires zero server configuration.

### Steps:
1. **Push Repository**: Fork or push this repository to your GitHub account.
2. **Import to Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new).
   - Select your `paypal` / `payagent-os` repository.
   - Framework Preset: **Next.js** (auto-detected).
   - Root Directory: `./`
3. **Configure Environment Variables**:
   ```env
   NODE_ENV=production
   PAYPAL_MODE=mock
   PAYPAL_MOCK_DELAY_MS=300
   PORT=3000
   ```
   *(Optional for live PayPal Sandbox testing: set `PAYPAL_MODE=sandbox`, `PAYPAL_CLIENT_ID=...`, `PAYPAL_CLIENT_SECRET=...`)*
4. **Deploy**:
   - Click **Deploy**. Vercel will build all static and dynamic API routes automatically.
   - Production URL generated: `https://payagent-os.vercel.app` (or custom subdomain).

---

## ☁️ Option 2: Render Free Web Service

Render provides free container and Node.js web services with automated SSL.

### Steps:
1. Sign up or log in at [dashboard.render.com](https://dashboard.render.com).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository.
4. Fill in the build settings:
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free` ($0/mo, 512 MB RAM, 0.1 CPU)
5. Add Environment Variables:
   - `PAYPAL_MODE=mock`
   - `NODE_ENV=production`
6. Click **Create Web Service**.

---

## 🐳 Option 3: Docker & Docker Compose (Self-Hosted / Oracle Always Free)

Deploy as an isolated container on any VPS (such as Oracle Cloud Always Free A1.Flex / E2.1.Micro).

### Quickstart:
```bash
# Build the Docker image
docker build -t payagent-os:latest .

# Run container on port 3000
docker run -d \
  --name payagent-os \
  -p 3000:3000 \
  -e PAYPAL_MODE=mock \
  -e NODE_ENV=production \
  --restart unless-stopped \
  payagent-os:latest
```

### Docker Compose:
```bash
docker compose up -d
```
Access the application at `http://localhost:3000`.

---

## 🚀 Option 4: Fly.io Free Allowance (Launch in 60s)

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Launch app using included fly.toml / Dockerfile
fly launch --name payagent-os --region sin --no-deploy
fly deploy
```

---

## 🧪 Option 5: Local Judge Evaluation (Zero Dependencies)

PayAgent OS is hermetically packaged with zero mandatory external API keys required to test the entire agentic loop:

```bash
# 1. Clone repository
git clone <repo-url> payagent-os
cd payagent-os

# 2. Install dependencies
npm install

# 3. Run full automated test suite (94 assertions across 5 suites)
npm test

# 4. Build production bundle
npm run build

# 5. Start server
npm start
```

Visit `http://localhost:3000` to interact with the **AG Grid Fleet Operations Center** and **Judge Simulation Arena**.
