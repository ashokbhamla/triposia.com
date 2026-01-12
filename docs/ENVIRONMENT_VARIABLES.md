# Environment Variables Setup Guide

## Required Environment Variables

The following environment variables are required for the application to run:

### 1. MONGODB_URI
**Required:** Yes  
**Description:** MongoDB Atlas connection string  
**Example:**
```
MONGODB_URI=mongodb+srv://triposia:40JeMwmuN75ZxRCL@flights.urpjin.mongodb.net/flights?retryWrites=true&w=majority
```

### 2. NEXT_PUBLIC_SITE_URL
**Required:** Yes  
**Description:** The public URL of your site (used for canonical URLs, sitemaps, metadata)  
**Production:**
```
NEXT_PUBLIC_SITE_URL=https://triposia.com
```
**Local Development:**
```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. JWT_SECRET
**Required:** Yes (for admin features)  
**Description:** Secret key for JWT token generation  
**Generate a secure secret:**
```bash
openssl rand -base64 32
```
**Example:**
```
JWT_SECRET=your-generated-secret-key-here
```

### 4. ADMIN_EMAIL
**Required:** Yes (for admin features)  
**Description:** Admin user email address  
**Example:**
```
ADMIN_EMAIL=admin@triposia.com
```

### 5. ADMIN_PASSWORD
**Required:** Yes (for admin features)  
**Description:** Admin user password  
**Example:**
```
ADMIN_PASSWORD=your-secure-password
```

---

## Local Development Setup

1. Copy the example file:
```bash
cp .env.example .env.local
```

2. Edit `.env.local` with your actual values:
```bash
# Use your MongoDB connection string
MONGODB_URI=mongodb+srv://...

# Use localhost for development
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Set your JWT secret and admin credentials
JWT_SECRET=your-secret-key
ADMIN_EMAIL=admin@triposia.com
ADMIN_PASSWORD=your-password
```

3. Start the development server:
```bash
npm run dev
```

---

## Vercel Deployment Setup

### Step 1: Go to Vercel Dashboard

1. Navigate to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: **triposia**
3. Go to **Settings** → **Environment Variables**

### Step 2: Add Environment Variables

Add each variable for **Production**, **Preview**, and **Development** environments:

#### Production Environment Variables:

```
MONGODB_URI=mongodb+srv://triposia:40JeMwmuN75ZxRCL@flights.urpjin.mongodb.net/flights?retryWrites=true&w=majority
NEXT_PUBLIC_SITE_URL=https://triposia.com
JWT_SECRET=your-secret-jwt-key-change-this
ADMIN_EMAIL=admin@triposia.com
ADMIN_PASSWORD=your-secure-password
```

#### Important Notes:

- **MONGODB_URI**: Must be set or pages will fail to connect to database
- **NEXT_PUBLIC_SITE_URL**: Must be `https://triposia.com` (not `http://localhost:3000`)
- **JWT_SECRET**: Generate a strong random string (use `openssl rand -base64 32`)
- Set these for **ALL environments** (Production, Preview, Development)

### Step 3: Redeploy

**CRITICAL:** After adding environment variables, you MUST redeploy:

1. Go to **Deployments** tab
2. Click **⋯** (three dots) on the latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger a new deployment

---

## Verifying Environment Variables

### Check if variables are set in Vercel:

1. Go to **Settings** → **Environment Variables**
2. Verify all 5 variables are listed
3. Check that they're enabled for **Production** environment

### Test after deployment:

1. Visit: `https://triposia.vercel.app/`
   - Should return 200 (not 404)
   
2. Visit: `https://triposia.vercel.app/robots.txt`
   - Should return 200 with robots.txt content
   
3. Visit: `https://triposia.vercel.app/sitemap.xml`
   - Should return 200 with sitemap XML

---

## Troubleshooting

### Issue: 404 errors on Vercel

**Cause:** Missing `MONGODB_URI` environment variable

**Solution:**
1. Add `MONGODB_URI` in Vercel Dashboard
2. Redeploy the application
3. Wait 1-2 minutes for deployment to complete

### Issue: MongoDB connection errors

**Cause:** MongoDB Atlas network access not configured

**Solution:**
1. Go to MongoDB Atlas Dashboard
2. Click **Network Access** in left sidebar
3. Click **Add IP Address**
4. Add `0.0.0.0/0` (allow all IPs) OR add Vercel's IP ranges
5. Wait 1-2 minutes for changes to propagate

### Issue: Environment variables not updating

**Cause:** Variables were added but deployment wasn't triggered

**Solution:**
1. Manually redeploy from Vercel Dashboard
2. Or push a new commit to trigger deployment

---

## Security Best Practices

1. **Never commit `.env.local` to git** (it's already in `.gitignore`)
2. **Use strong JWT_SECRET** in production (generate with `openssl rand -base64 32`)
3. **Use strong ADMIN_PASSWORD** in production
4. **Rotate secrets regularly** in production
5. **Don't share environment variables** publicly

---

## Quick Reference

### Copy-paste for Vercel (Production):

```
MONGODB_URI=mongodb+srv://triposia:40JeMwmuN75ZxRCL@flights.urpjin.mongodb.net/flights?retryWrites=true&w=majority
NEXT_PUBLIC_SITE_URL=https://triposia.com
JWT_SECRET=CHANGE-THIS-TO-A-SECURE-RANDOM-STRING
ADMIN_EMAIL=admin@triposia.com
ADMIN_PASSWORD=CHANGE-THIS-TO-A-SECURE-PASSWORD
```

**Remember:** Replace `JWT_SECRET` and `ADMIN_PASSWORD` with secure values!

