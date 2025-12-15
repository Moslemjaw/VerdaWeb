# Lumière Deployment Guide

## Quick Setup: Frontend (Vercel) + Backend (Render)

---

## Step 1: Deploy Backend to Render

### 1.1 Create a Render Account
Go to [render.com](https://render.com) and sign up.

### 1.2 Create a New Web Service
1. Click **New +** → **Web Service**
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: `lumiere-backend` (or your choice)
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: Leave empty
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node dist/index.cjs`

### 1.3 Add Environment Variables
In Render dashboard, go to **Environment** tab and add:

| Key | Value |
|-----|-------|
| `MONGODB_URI` | Your MongoDB connection string |
| `SESSION_SECRET` | A random 32+ character string |
| `FRONTEND_URL` | `https://your-app.vercel.app` (add after Vercel deploy) |
| `NODE_ENV` | `production` |

### 1.4 Deploy
Click **Create Web Service**. Note your backend URL (e.g., `https://lumiere-backend.onrender.com`).

---

## Step 2: Deploy Frontend to Vercel

### 2.1 Create a Vercel Account
Go to [vercel.com](https://vercel.com) and sign up.

### 2.2 Import Project
1. Click **Add New** → **Project**
2. Import your GitHub repository

### 2.3 Configure Build Settings
- **Framework Preset**: Vite
- **Root Directory**: `client`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### 2.4 Add Environment Variables
In Vercel dashboard, go to **Settings** → **Environment Variables**:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://your-backend.onrender.com` (your Render URL) |

### 2.5 Deploy
Click **Deploy**. Note your frontend URL.

---

## Step 3: Update Backend with Frontend URL

Go back to Render and update the `FRONTEND_URL` environment variable with your Vercel URL.

---

## Environment Variables Summary

### Backend (Render)
```
MONGODB_URI=mongodb+srv://...
SESSION_SECRET=your-secret-key-here
FRONTEND_URL=https://your-app.vercel.app
NODE_ENV=production
```

### Frontend (Vercel)
```
VITE_API_URL=https://your-backend.onrender.com
```

---

## Troubleshooting

### CORS Errors
- Make sure `FRONTEND_URL` in Render matches your Vercel URL exactly
- Include `https://` but no trailing slash

### Login Not Working
- Session cookies require both frontend and backend to use HTTPS
- Check that `SESSION_SECRET` is set in Render

### API Requests Failing
- Verify `VITE_API_URL` in Vercel is set correctly
- Make sure there's no trailing slash in the URL

### Render Service Sleeping
Free tier Render services sleep after 15 minutes of inactivity. First request may take 30-60 seconds.

---

## MongoDB Setup

If you don't have MongoDB yet:
1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist all IPs (`0.0.0.0/0`) for Render access
5. Get connection string and add to Render environment
