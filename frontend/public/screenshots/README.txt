PWA Screenshots Required
========================

To remove the "Richer PWA Install UI" warnings, add these screenshots:

1. desktop-wide.png (1280x720 pixels)
   - Screenshot of your app in desktop/wide view
   - Shows the main homepage or dashboard
   - Used for desktop install prompts

2. mobile-narrow.png (750x1334 pixels)
   - Screenshot of your app in mobile/narrow view
   - Shows the mobile-optimized interface
   - Used for mobile install prompts

HOW TO CREATE SCREENSHOTS:
==========================

Option 1: Manual Screenshots
-----------------------------
1. Open your app in the browser
2. For desktop: Resize browser to 1280x720, take screenshot
3. For mobile: Use Chrome DevTools device emulator (F12 -> Toggle device toolbar)
   - Set to iPhone/Android size (375x667 or similar)
   - Take screenshot
4. Save as desktop-wide.png and mobile-narrow.png
5. Place them in: frontend/public/screenshots/

Option 2: Automated (Coming Soon)
----------------------------------
You can use browser automation tools or screenshot services.

NOTE: These screenshots are OPTIONAL but improve the install experience.
Your PWA will work without them, but the install UI will be simpler.

