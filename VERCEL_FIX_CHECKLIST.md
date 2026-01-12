# Vercel 404 Fix Checklist

## Immediate Actions Required:

### 1. Set Environment Variables in Vercel ⚠️ CRITICAL

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add these variables (for **Production**, **Preview**, and **Development**):

```
MONGODB_URI=mongodb+srv://triposia:40JeMwmuN75ZxRCL@flights.urpjin.mongodb.net/flights?retryWrites=true&w=majority
NEXT_PUBLIC_SITE_URL=https://triposia.com
JWT_SECRET=your-secret-jwt-key-change-this
ADMIN_EMAIL=admin@triposia.com
ADMIN_PASSWORD=your-secure-password
```

**After adding variables, you MUST redeploy!**

### 2. Check MongoDB Atlas Network Access

1. Go to MongoDB Atlas Dashboard
2. Click **Network Access** in left sidebar
3. Click **Add IP Address**
4. Add `0.0.0.0/0` (allow all IPs) OR add Vercel's IP ranges
5. Wait 1-2 minutes for changes to propagate

### 3. Verify Latest Code is Deployed

```bash
# Check if latest commit is on GitHub
git log --oneline -5

# Check Vercel deployment matches
# Go to Vercel Dashboard → Deployments → Check commit hash
```

### 4. Check Vercel Deployment Logs

1. Go to Vercel Dashboard
2. Click on your project
3. Go to **Deployments** tab
4. Click on latest deployment
5. Check **Build Logs** for errors
6. Check **Function Logs** for runtime errors

Look for:
- ❌ `MongoServerError`
- ❌ `MongoNetworkError` 
- ❌ `Environment variable not found`
- ❌ `Connection timeout`
- ❌ `404: NOT_FOUND`

### 5. Test After Fixes

After setting environment variables and redeploying:

1. Visit: `https://triposia.vercel.app/`
   - Should return 200 (not 404)
   
2. Visit: `https://triposia.vercel.app/robots.txt`
   - Should return 200 with robots.txt content
   
3. Visit: `https://triposia.vercel.app/sitemap.xml`
   - Should return 200 with sitemap XML

---

## Why It Works Locally But Not on Vercel:

### Local Environment:
- ✅ Has `.env.local` with all variables
- ✅ Full Node.js runtime (no time limits)
- ✅ Persistent MongoDB connections
- ✅ No cold starts

### Vercel Environment:
- ❌ No `.env.local` file (must set in dashboard)
- ❌ Serverless functions (10s timeout for Hobby plan)
- ❌ Cold starts (new connection each time)
- ❌ Different network environment

---

## Most Likely Cause:

**Missing `MONGODB_URI` environment variable in Vercel**

Even though the code has a fallback MongoDB URI, if the environment variable isn't set:
1. Vercel might be using a different code path
2. The connection might be failing due to network restrictions
3. Pages might be crashing during database queries

---

## Quick Test:

After setting environment variables, check Vercel Function Logs:

1. Go to deployment → **Functions** tab
2. Click on a function (e.g., `/[route]`)
3. Check **Logs** tab
4. Look for MongoDB connection errors

If you see connection errors, the issue is:
- MongoDB Atlas network access not configured
- Wrong MongoDB URI
- MongoDB cluster is down

---

## Still Not Working?

1. **Check Vercel Build Logs** - Look for build-time errors
2. **Check Function Runtime Logs** - Look for runtime errors
3. **Verify Domain Configuration** - Make sure domain is properly set up
4. **Test with curl**:
   ```bash
   curl -I https://triposia.vercel.app/
   curl -I https://triposia.vercel.app/robots.txt
   ```

---

## Expected Behavior After Fix:

✅ Home page loads (may show 0s if DB connection fails, but page loads)
✅ Robots.txt returns 200
✅ Sitemap.xml returns 200
✅ No 404 errors

---

## Summary:

**The #1 issue is almost certainly missing environment variables in Vercel.**

Set them in the dashboard, redeploy, and it should work!

