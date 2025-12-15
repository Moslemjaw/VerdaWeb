# Render Deployment Guide - Lumière

This guide explains how to deploy your Lumière backend on Render and keep it running 24/7.

---

## Keep-Alive Feature (Built-in)

Your server includes a built-in keep-alive mechanism to prevent Render's free tier from sleeping.

### How It Works

1. **Health Endpoint:** `/healthz` returns server status
2. **Self-Ping:** Server pings itself every 10 minutes in production
3. **Automatic:** No external services needed

### Setup on Render

When deploying to Render, set these environment variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `RENDER_EXTERNAL_URL` | `https://your-app.onrender.com` | Your Render app URL (auto-set by Render) |
| `APP_URL` | `https://your-app.onrender.com` | Fallback if RENDER_EXTERNAL_URL not set |
| `NODE_ENV` | `production` | Enables keep-alive pings |

> **Note:** Render automatically sets `RENDER_EXTERNAL_URL` for you.

---

## Deployment Steps

### 1. Create a Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub/GitLab

### 2. Connect Your Repository
1. Click "New" → "Web Service"
2. Connect your GitHub repository
3. Select the branch to deploy

### 3. Configure Build Settings

| Setting | Value |
|---------|-------|
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Node Version** | `20` |

### 4. Add Environment Variables

In Render dashboard, add these secrets:

| Variable | Value |
|----------|-------|
| `MONGODB_URI` | Your MongoDB connection string |
| `SESSION_SECRET` | A random secure string |
| `MYFATOORAH_API_KEY` | Your payment gateway API key |
| `MYFATOORAH_SECRET_KEY` | Your payment gateway secret |
| `NODE_ENV` | `production` |

### 5. Deploy

Click "Create Web Service" and wait for deployment.

---

## Alternative: External Keep-Alive (UptimeRobot)

For extra reliability, use a free external monitoring service:

### Setup UptimeRobot

1. Go to [uptimerobot.com](https://uptimerobot.com)
2. Create free account
3. Add new monitor:
   - **Monitor Type:** HTTP(s)
   - **URL:** `https://your-app.onrender.com/healthz`
   - **Interval:** 5 minutes

This provides:
- External pings every 5 minutes
- Uptime monitoring & alerts
- Email notifications if server goes down

---

## Health Check Endpoint

Test your health endpoint:

```bash
curl https://your-app.onrender.com/healthz
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-12-15T10:30:00.000Z"
}
```

---

## Troubleshooting

### Server Still Sleeping?

1. Verify `NODE_ENV=production` is set
2. Check logs for `[Keep-Alive]` messages
3. Ensure `RENDER_EXTERNAL_URL` or `APP_URL` is correct
4. Use UptimeRobot as backup

### Cold Start Delay

First request after sleep takes 30-60 seconds. With keep-alive enabled, this shouldn't happen.

### Free Tier Limits

- 750 hours/month (enough for 24/7)
- Keep-alive uses minimal resources
- Monitor usage in Render dashboard

---

*Last updated: December 2025*
