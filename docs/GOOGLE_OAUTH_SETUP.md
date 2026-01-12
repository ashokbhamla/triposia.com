# Google OAuth Setup Guide

## Environment Variables

Add the following to your `.env.local` file:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# NextAuth Configuration
NEXTAUTH_SECRET=your-nextauth-secret-change-this-in-production
NEXTAUTH_URL=http://localhost:3000
```

**Note:** For production, change `NEXTAUTH_URL` to your production domain (e.g., `https://triposia.com`).

## Google Cloud Console Configuration

### Authorized JavaScript Origins

⚠️ **IMPORTANT:** These must be domain URLs only (no paths, no trailing slashes).

Add these URLs to **Authorized JavaScript origins**:

**Development:**
```
http://localhost:3000
```

**Production:**
```
https://triposia.com
https://www.triposia.com
```

**DO NOT include paths like `/api/auth/callback/google` in this section!**

### Authorized Redirect URIs

⚠️ **IMPORTANT:** These must be the full callback URLs with paths.

Add these URLs to **Authorized redirect URIs**:

**Development:**
```
http://localhost:3000/api/auth/callback/google
```

**Production:**
```
https://triposia.com/api/auth/callback/google
https://www.triposia.com/api/auth/callback/google
```

**These are the full callback URLs with the `/api/auth/callback/google` path.**

## Steps to Configure:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** > **Credentials**
4. Click on your OAuth 2.0 Client ID
5. Under **Authorized JavaScript origins**, click **+ ADD URI** and add:
   - `http://localhost:3000` (for development)
   - `https://triposia.com` (for production)
   - `https://www.triposia.com` (for production, if you use www)

6. Under **Authorized redirect URIs**, click **+ ADD URI** and add:
   - `http://localhost:3000/api/auth/callback/google` (for development)
   - `https://triposia.com/api/auth/callback/google` (for production)
   - `https://www.triposia.com/api/auth/callback/google` (for production, if you use www)

7. Click **SAVE**

**Important Notes:**
- It may take 5 minutes to a few hours for settings to take effect
- Make sure your OAuth consent screen is configured (can be in testing mode for development)
- For production, you'll need to publish your OAuth consent screen or add test users

## Testing OAuth Consent Screen

If your app is in testing mode, you need to add test users:

1. Go to **OAuth consent screen** in Google Cloud Console
2. Scroll down to **Test users**
3. Click **+ ADD USERS**
4. Add the email addresses of users who should be able to sign in during testing

## Verification

After configuring, test the authentication:

1. Start your development server: `npm run dev`
2. Visit: `http://localhost:3000/login`
3. Click "Continue with Google"
4. You should be redirected to Google's sign-in page
5. After signing in, you should be redirected back to your app

## Troubleshooting

- **"redirect_uri_mismatch" error**: Make sure the redirect URI in Google Console exactly matches `http://localhost:3000/api/auth/callback/google`
- **"access_denied" error**: Make sure test users are added if app is in testing mode
- **Settings not taking effect**: Wait 5-60 minutes for Google's changes to propagate

