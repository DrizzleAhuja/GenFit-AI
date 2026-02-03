// Node.js script to generate PWA icons
// Run with: node generate-icons.js

const fs = require('fs');
const path = require('path');

// Simple PNG generator using base64 encoded minimal PNG files
// These are valid PNG files with the GenFit AI branding

function createPNGBase64(size, isMaskable = false) {
  // This is a minimal valid PNG (1x1 transparent pixel) that we'll use as a template
  // For a real implementation, you'd use a library like 'sharp' or 'canvas'
  // But for now, we'll create a simple colored square PNG
  
  // Base64 encoded PNG data for a colored square
  // This creates a simple dark blue-gray square with "GF" text
  // Note: This is a simplified version. For production, use a proper image library.
  
  // We'll use a data URL approach, but since we need actual files,
  // let's create a script that uses canvas if available, or provides instructions
  
  return null; // Will be handled by the actual implementation below
}

// Check if canvas is available, if not, provide instructions
let canvas;
try {
  canvas = require('canvas');
} catch (e) {
  console.log('Canvas package not found. Installing...');
  console.log('Please run: npm install canvas --save-dev');
  console.log('Or use the generate-icons.html file in your browser instead.');
  process.exit(1);
}

const { createCanvas } = canvas;

function generateIcon(size, isMaskable = false) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#0f172a');
  gradient.addColorStop(1, '#1e293b');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  
  // Safe zone for maskable icons (80% of size)
  const safeZone = isMaskable ? size * 0.1 : 0;
  const iconSize = size - (safeZone * 2);
  const centerX = size / 2;
  const centerY = size / 2;
  
  // Draw "GF" text
  ctx.fillStyle = '#10b981'; // Green
  ctx.font = `bold ${Math.floor(iconSize * 0.4)}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('GF', centerX, centerY - iconSize * 0.1);
  
  // Add sparkle effects
  ctx.fillStyle = '#3b82f6'; // Blue
  const sparkleSize = iconSize * 0.15;
  const sparkles = [
    { x: centerX - iconSize * 0.3, y: centerY - iconSize * 0.3 },
    { x: centerX + iconSize * 0.3, y: centerY - iconSize * 0.2 },
    { x: centerX - iconSize * 0.25, y: centerY + iconSize * 0.25 },
    { x: centerX + iconSize * 0.25, y: centerY + iconSize * 0.3 }
  ];
  
  sparkles.forEach(sparkle => {
    ctx.beginPath();
    ctx.arc(sparkle.x, sparkle.y, sparkleSize * 0.3, 0, Math.PI * 2);
    ctx.fill();
  });
  
  return canvas;
}

function saveIcon(canvas, filename) {
  const buffer = canvas.toBuffer('image/png');
  const filepath = path.join(__dirname, filename);
  fs.writeFileSync(filepath, buffer);
  console.log(`✅ Generated: ${filename}`);
}

// Generate all icons
console.log('🎨 Generating PWA icons...\n');

try {
  const icon192 = generateIcon(192, false);
  saveIcon(icon192, 'pwa-192x192.png');
  
  const icon512 = generateIcon(512, false);
  saveIcon(icon512, 'pwa-512x512.png');
  
  const icon512Maskable = generateIcon(512, true);
  saveIcon(icon512Maskable, 'pwa-512x512-maskable.png');
  
  console.log('\n✅ All icons generated successfully!');
  console.log('📍 Location: frontend/public/icons/');
  console.log('\nNow restart your dev server and check the PWA install prompt!');
} catch (error) {
  console.error('❌ Error generating icons:', error.message);
  console.log('\n💡 Alternative: Open generate-icons.html in your browser instead.');
}

