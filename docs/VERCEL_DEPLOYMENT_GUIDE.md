# Vercel Deployment Troubleshooting Guide

## Why It Works Locally But Not on Vercel

### Common Causes:

1. **Missing Environment Variables**
   - Vercel doesn't have access to your local `.env.local` file
   - Environment variables must be set in Vercel Dashboard

2. **MongoDB Connection Issues**
   - Serverless functions have different connection behavior
   - Cold starts can cause connection timeouts
   - Network restrictions in Vercel

3. **Build vs Runtime Differences**
   - Local: Full Node.js environment
   - Vercel: Serverless functions with time limits

4. **Dynamic Routes Not Generating**
   - Pages marked as `force-dynamic` must render on first request
   - If they fail, they return 404

---

## Required Environment Variables in Vercel

Go to **Vercel Dashboard → Your Project → Settings → Environment Variables** and add:

### Required Variables:

```bash
MONGODB_URI=mongodb+srv://triposia:40JeMwmuN75ZxRCL@flights.urpjin.mongodb.net/flights?retryWrites=true&w=majority
NEXT_PUBLIC_SITE_URL=https://triposia.com
JWT_SECRET=your-secret-jwt-key-here
ADMIN_EMAIL=admin@triposia.com
ADMIN_PASSWORD=your-secure-password
```

### Important Notes:

1. **MONGODB_URI**: Must be set or pages will fail to connect to database
2. **NEXT_PUBLIC_SITE_URL**: Must be `https://triposia.com` (not `http://localhost:3000`)
3. **JWT_SECRET**: Required for admin authentication
4. Set these for **Production**, **Preview**, and **Development** environments

---

## Step-by-Step Fix:

### 1. Check Vercel Deployment Logs

1. Go to Vercel Dashboard
2. Click on your project
3. Go to **Deployments** tab
4. Click on the latest deployment
5. Check **Build Logs** and **Function Logs**

Look for errors like:
- `MongoServerError`
- `MongoNetworkError`
- `Environment variable not found`
- `Connection timeout`

### 2. Verify Environment Variables

1. Go to **Settings → Environment Variables**
2. Verify all variables are set
3. Make sure they're enabled for **Production** environment
4. **Redeploy** after adding variables

### 3. Check MongoDB Atlas Network Access

1. Go to MongoDB Atlas Dashboard
2. **Network Access** → **IP Access List**
3. Add `0.0.0.0/0` to allow all IPs (or Vercel's IP ranges)
4. Wait 1-2 minutes for changes to propagate

### 4. Test Database Connection

The app has a hardcoded fallback MongoDB URI, but it's better to use environment variables.

---

## Common Error Patterns:

### Error: `404: NOT_FOUND`
**Cause**: Page failed to render at runtime
**Fix**: 
- Check function logs in Vercel
- Verify MongoDB connection
- Ensure environment variables are set

### Error: `MongoServerError: connection timeout`
**Cause**: MongoDB connection taking too long
**Fix**:
- Check MongoDB Atlas network access
- Verify MONGODB_URI is correct
- Check MongoDB Atlas cluster status

### Error: `Environment variable not found`
**Cause**: Variable not set in Vercel
**Fix**: Add variable in Vercel Dashboard and redeploy

---

## Quick Fix Checklist:

- [ ] All environment variables set in Vercel Dashboard
- [ ] MongoDB Atlas allows connections from `0.0.0.0/0`
- [ ] Latest code pushed to GitHub
- [ ] Vercel deployment completed successfully
- [ ] Checked function logs for runtime errors
- [ ] Verified `NEXT_PUBLIC_SITE_URL` is `https://triposia.com`

---

## Testing After Fix:

1. Visit `https://triposia.vercel.app/` (should work)
2. Visit `https://triposia.com/` (if domain is configured)
3. Check `https://triposia.vercel.app/robots.txt` (should return 200)
4. Check `https://triposia.vercel.app/sitemap.xml` (should return 200)

---

## If Still Not Working:

1. **Check Vercel Function Logs**:
   - Go to deployment → Functions tab
   - Look for runtime errors

2. **Test MongoDB Connection**:
   - The app has error handling, but check if queries are timing out

3. **Verify Build Output**:
   - Check if build completed successfully
   - Look for warnings about missing environment variables

4. **Check Domain Configuration**:
   - Verify domain is properly configured in Vercel
   - Check DNS settings

---

## Debugging Commands (Local):

Test if environment variables work:
```bash
# Test MongoDB connection
node -e "require('mongodb').MongoClient.connect(process.env.MONGODB_URI || 'mongodb+srv://triposia:40JeMwmuN75ZxRCL@flights.urpjin.mongodb.net/flights').then(() => console.log('Connected')).catch(e => console.error('Error:', e))"
```

Test build locally:
```bash
npm run build
npm start
# Then visit http://localhost:3000
```

