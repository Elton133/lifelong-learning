# PWA Icons

## Generating Icons

To generate the required PNG icons from the SVG source, you can use one of these methods:

### Method 1: Using ImageMagick (Recommended)
```bash
# Install ImageMagick
sudo apt-get install imagemagick

# Generate all required icon sizes
convert icon.svg -resize 72x72 icon-72x72.png
convert icon.svg -resize 96x96 icon-96x96.png
convert icon.svg -resize 128x128 icon-128x128.png
convert icon.svg -resize 144x144 icon-144x144.png
convert icon.svg -resize 152x152 icon-152x152.png
convert icon.svg -resize 192x192 icon-192x192.png
convert icon.svg -resize 384x384 icon-384x384.png
convert icon.svg -resize 512x512 icon-512x512.png
```

### Method 2: Using Online Tools
1. Upload `icon.svg` to https://realfavicongenerator.net/
2. Download the generated package
3. Extract the PNG files to this directory

### Method 3: Using Node.js (sharp)
```bash
npm install sharp
node generate-icons.js
```

## Required Sizes
- 72x72 (iOS)
- 96x96 (Android, shortcuts)
- 128x128 (Chrome Web Store)
- 144x144 (Windows)
- 152x152 (iOS)
- 192x192 (Android)
- 384x384 (Android)
- 512x512 (Android, splash screen)

## Placeholder Icons
For development, simple colored rectangles are used as placeholders. Replace these with properly designed icons for production.
