# PWA Install Guide - Troubleshooting

## Why Can't I See the Install Button?

The install button appears when ALL these conditions are met:

### ✅ Required Conditions:

1. **HTTPS or localhost** ✅ (You're using localhost)
2. **Valid manifest** ✅ (Your manifest is valid)
3. **Icons present** ✅ (All icons are loading)
4. **Service Worker registered** ⚠️ (Check this!)
5. **At least one icon ≥144px with purpose="any"** ✅ (You have 192px and 512px)

## Step-by-Step Troubleshooting:

### Step 1: Check Service Worker Registration

1. Open DevTools (F12)
2. Go to **Application** tab → **Service Workers**
3. You should see a service worker registered for `http://localhost:5173`
4. Status should be "activated and running"

**If NO service worker:**
- Service workers work best in **production builds**
- Run: `npm run build` then `npm run preview`
- Or check if vite-plugin-pwa is properly installed

### Step 2: Check Installability Criteria

1. DevTools → **Application** → **Manifest**
2. Scroll down to **"Installability"** section
3. Look for any errors or warnings
4. Should say: **"Installable: Yes"** ✅

### Step 3: Where to Find Install Button

**Desktop Chrome/Edge:**
- Look for **install icon** (puzzle piece) in the address bar
- Or: Menu (⋮) → **"Install GenFit AI"**
- Or: Settings → Apps → **"Install app"**

**If still not visible:**
- Try **production build**: `npm run build && npm run preview`
- Clear browser cache: DevTools → Application → Storage → "Clear site data"
- Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

### Step 4: Test in Production Mode

Service workers are more reliable in production:

```bash
cd frontend
npm run build
npm run preview
```

Then open the preview URL (usually `http://localhost:4173`)

### Step 5: Manual Install Trigger (For Testing)

You can programmatically trigger the install prompt. Add this to your React app:

```javascript
// Check if install is available
if ('serviceWorker' in navigator && window.matchMedia('(display-mode: standalone)').matches === false) {
  // PWA can be installed
  console.log('PWA is installable!');
}

// Listen for beforeinstallprompt event
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  // Show your custom install button
  console.log('Install prompt available!');
});
```

## Common Issues:

### Issue: "Service worker not registered"
**Solution:** Build for production or enable dev mode in vite.config.js (already done)

### Issue: "Manifest not found"
**Solution:** Make sure `/manifest.webmanifest` is accessible at root

### Issue: "Icons failed to load"
**Solution:** ✅ Already fixed - icons are loading correctly

### Issue: "Not served over HTTPS"
**Solution:** ✅ localhost works for development

## Quick Test:

1. **Build for production:**
   ```bash
   cd frontend
   npm run build
   npm run preview
   ```

2. **Open preview URL** (usually `http://localhost:4173`)

3. **Check DevTools → Application → Service Workers**
   - Should see service worker registered

4. **Look for install button** in address bar or menu

If it still doesn't work, check the **"Installability"** section in DevTools → Application → Manifest and share what errors you see!

