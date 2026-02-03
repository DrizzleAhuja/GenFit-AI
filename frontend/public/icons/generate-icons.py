#!/usr/bin/env python3
"""
Generate PWA icons for GenFit AI
Run with: python generate-icons.py
"""

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("[ERROR] PIL/Pillow not found.")
    print("Please run: pip install Pillow")
    exit(1)

import os

def create_icon(size, is_maskable=False):
    """Create a PWA icon with GenFit AI branding"""
    # Create image with dark blue-gray gradient background
    img = Image.new('RGB', (size, size), color='#0f172a')
    draw = ImageDraw.Draw(img)
    
    # Draw gradient background (simplified - solid color for now)
    # For a real gradient, you'd need to draw multiple rectangles
    draw.rectangle([(0, 0), (size, size)], fill='#0f172a')
    
    # Safe zone for maskable icons (80% of size)
    safe_zone = int(size * 0.1) if is_maskable else 0
    icon_size = size - (safe_zone * 2)
    center_x = size // 2
    center_y = size // 2
    
    # Draw "GF" text
    try:
        # Try to use a nice font, fallback to default
        font_size = int(icon_size * 0.4)
        try:
            font = ImageFont.truetype("arial.ttf", font_size)
        except:
            try:
                font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", font_size)
            except:
                font = ImageFont.load_default()
    except:
        font = ImageFont.load_default()
    
    # Draw GF text in green
    text = "GF"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    text_x = center_x - text_width // 2
    text_y = center_y - text_height // 2 - int(icon_size * 0.1)
    
    draw.text((text_x, text_y), text, fill='#10b981', font=font)
    
    # Draw sparkle effects (blue circles)
    sparkle_size = int(icon_size * 0.15)
    sparkles = [
        (center_x - int(icon_size * 0.3), center_y - int(icon_size * 0.3)),
        (center_x + int(icon_size * 0.3), center_y - int(icon_size * 0.2)),
        (center_x - int(icon_size * 0.25), center_y + int(icon_size * 0.25)),
        (center_x + int(icon_size * 0.25), center_y + int(icon_size * 0.3))
    ]
    
    for sparkle_x, sparkle_y in sparkles:
        radius = int(sparkle_size * 0.3)
        draw.ellipse(
            [sparkle_x - radius, sparkle_y - radius, 
             sparkle_x + radius, sparkle_y + radius],
            fill='#3b82f6'
        )
    
    return img

def main():
    """Generate all required PWA icons"""
    import sys
    import io
    # Fix encoding for Windows console
    if sys.platform == 'win32':
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    print("Generating PWA icons for GenFit AI...\n")
    
    # Get the directory where this script is located
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    icons = [
        (192, False, 'pwa-192x192.png'),
        (512, False, 'pwa-512x512.png'),
        (512, True, 'pwa-512x512-maskable.png')
    ]
    
    for size, is_maskable, filename in icons:
        try:
            icon = create_icon(size, is_maskable)
            filepath = os.path.join(script_dir, filename)
            icon.save(filepath, 'PNG')
            print(f"[OK] Generated: {filename} ({size}x{size})")
        except Exception as e:
            print(f"[ERROR] Error generating {filename}: {e}")
    
    print("\n[SUCCESS] All icons generated successfully!")
    print(f"Location: {script_dir}")
    print("\nNow restart your dev server and check the PWA install prompt!")

if __name__ == '__main__':
    main()

