# Google OAuth PWA Fix Guide

## Issue: Google Sign-in Not Working in PWA Mode

When your app is installed as a PWA on mobile, Google OAuth may fail due to popup blocking or redirect URI mismatches.

## Solutions Implemented

### 1. ✅ Better Error Handling
- Detects popup blocking errors
- Provides clear error messages
- Suggests workarounds for PWA mode

### 2. ✅ PWA Detection
- Automatically detects if running in PWA standalone mode
- Provides PWA-specific error messages and tips

### 3. ✅ Improved User Feedback
- Toast notifications guide users
- Clear instructions when sign-in fails

## Additional Steps Required

### ⚠️ IMPORTANT: Update Google Cloud Console

You need to add your PWA URLs to Google Cloud Console:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **APIs & Services** → **Credentials**
4. Click on your OAuth 2.0 Client ID
5. Under **Authorized JavaScript origins**, add:
   - `http://localhost:5173` (dev)
   - `http://localhost:4173` (preview)
   - `https://yourdomain.com` (production)
   - Your PWA URL (if different)

6. Under **Authorized redirect URIs**, add:
   - `http://localhost:5173` (dev)
   - `http://localhost:4173` (preview)
   - `https://yourdomain.com` (production)
   - Your PWA start URL

### Mobile-Specific Fixes

#### For Android Chrome PWA:
1. Open Chrome Settings
2. Go to **Site Settings** → **Pop-ups and redirects**
3. Allow popups for your domain

#### For iOS Safari PWA:
- iOS PWAs have limited OAuth support
- Users may need to open in Safari browser for sign-in
- Consider adding a "Sign in with Google" button that opens in browser

## Testing

1. **Test in Browser First:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` and test Google sign-in

2. **Test in Production Build:**
   ```bash
   npm run build
   npm run preview
   ```
   Open `http://localhost:4173` and test

3. **Test on Mobile:**
   - Install the PWA on your phone
   - Try signing in
   - Check browser console for errors

## Common Issues & Fixes

### Issue: "Popup blocked"
**Fix:** Allow popups in browser settings for your domain

### Issue: "Redirect URI mismatch"
**Fix:** Add your PWA URL to Google Cloud Console authorized redirect URIs

### Issue: "Script failed to load"
**Fix:** Check internet connection and ensure Google OAuth script can load

### Issue: Works in browser but not in PWA
**Fix:** 
- Ensure PWA URL is added to Google Cloud Console
- Check if popups are blocked in PWA mode
- Consider using redirect flow instead of popup

## Alternative Solution (If Popups Don't Work)

If popups continue to fail in PWA mode, you can implement a redirect-based flow:

1. Use `useGoogleLogin` hook with `ux_mode: 'redirect'`
2. Handle the redirect callback
3. Extract the token from URL parameters

This requires more code changes but works better in PWA standalone mode.

## Current Status

✅ Error handling improved
✅ PWA detection added
✅ User-friendly error messages
⚠️ Google Cloud Console configuration needed
⚠️ Browser popup settings may need adjustment

