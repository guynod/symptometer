const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Create an SVG with a white background and blue text
const svg = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg width="1242" height="2436" viewBox="0 0 1242 2436" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#ffffff"/>
    <text 
        x="621" 
        y="1218" 
        font-family="Arial, sans-serif" 
        font-size="72" 
        font-weight="bold" 
        fill="#007AFF" 
        text-anchor="middle"
        dominant-baseline="middle">
        Symptometer
    </text>
</svg>`;

// Ensure the assets/images directory exists
const dir = path.join(__dirname, '..', 'assets', 'images');
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

// Write the SVG file
const svgPath = path.join(dir, 'splash.svg');
const pngPath = path.join(dir, 'splash.png');
fs.writeFileSync(svgPath, svg);

// Convert SVG to PNG
sharp(Buffer.from(svg))
    .resize(1242, 2436)
    .png()
    .toFile(pngPath)
    .then(() => {
        console.log('Splash screen generated successfully!');
        // Clean up SVG file
        fs.unlinkSync(svgPath);
    })
    .catch(err => {
        console.error('Error generating splash screen:', err);
    }); 