const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Create an SVG for the icon
const svg = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#007AFF"/>
    <text 
        x="512" 
        y="512" 
        font-family="Arial, sans-serif" 
        font-size="200" 
        font-weight="bold" 
        fill="#ffffff" 
        text-anchor="middle"
        dominant-baseline="middle">
        S
    </text>
</svg>`;

// Ensure the assets/images directory exists
const dir = path.join(__dirname, '..', 'assets', 'images');
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

// Write the SVG file
const svgPath = path.join(dir, 'icon.svg');
const pngPath = path.join(dir, 'icon.png');
const adaptiveIconPath = path.join(dir, 'adaptive-icon.png');
fs.writeFileSync(svgPath, svg);

// Convert SVG to PNG for iOS icon
sharp(Buffer.from(svg))
    .resize(1024, 1024)
    .png()
    .toFile(pngPath)
    .then(() => {
        console.log('App icon generated successfully!');
        // Generate adaptive icon for Android (slightly larger)
        return sharp(Buffer.from(svg))
            .resize(1080, 1080)
            .png()
            .toFile(adaptiveIconPath);
    })
    .then(() => {
        console.log('Adaptive icon generated successfully!');
        // Clean up SVG file
        fs.unlinkSync(svgPath);
    })
    .catch(err => {
        console.error('Error generating icons:', err);
    }); 