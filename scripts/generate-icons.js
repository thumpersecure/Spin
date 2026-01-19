#!/usr/bin/env node
/**
 * Generate placeholder icons for CONSTANTINE Browser build
 * Creates PNG, ICO, and ICNS placeholder files
 */

const fs = require('fs');
const path = require('path');

// Simple 256x256 PNG with CONSTANTINE "C" branding (dark purple/noir theme)
// This is a minimal valid PNG that will work for builds
function createPNG(size) {
    // PNG header
    const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

    // IHDR chunk
    const width = size;
    const height = size;
    const bitDepth = 8;
    const colorType = 2; // RGB
    const compression = 0;
    const filter = 0;
    const interlace = 0;

    const ihdrData = Buffer.alloc(13);
    ihdrData.writeUInt32BE(width, 0);
    ihdrData.writeUInt32BE(height, 4);
    ihdrData.writeUInt8(bitDepth, 8);
    ihdrData.writeUInt8(colorType, 9);
    ihdrData.writeUInt8(compression, 10);
    ihdrData.writeUInt8(filter, 11);
    ihdrData.writeUInt8(interlace, 12);

    // Create raw image data (dark purple background with lighter C)
    const rawData = [];
    const bgR = 30, bgG = 20, bgB = 50;  // Dark purple noir
    const fgR = 180, fgG = 140, fgB = 200;  // Light purple

    for (let y = 0; y < height; y++) {
        rawData.push(0); // Filter byte for each row
        for (let x = 0; x < width; x++) {
            // Create a "C" shape
            const cx = width / 2;
            const cy = height / 2;
            const dx = x - cx;
            const dy = y - cy;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const maxR = width * 0.4;
            const minR = width * 0.25;

            // Inside the ring and not in the gap (right side opening for "C")
            const inRing = dist >= minR && dist <= maxR;
            const inGap = dx > 0 && Math.abs(dy) < height * 0.2;
            const isC = inRing && !inGap;

            if (isC) {
                rawData.push(fgR, fgG, fgB);
            } else {
                rawData.push(bgR, bgG, bgB);
            }
        }
    }

    // Compress using zlib
    const zlib = require('zlib');
    const compressedData = zlib.deflateSync(Buffer.from(rawData));

    // Create chunks
    function createChunk(type, data) {
        const typeBuffer = Buffer.from(type);
        const length = Buffer.alloc(4);
        length.writeUInt32BE(data.length, 0);

        const crcData = Buffer.concat([typeBuffer, data]);
        const crc = Buffer.alloc(4);
        crc.writeUInt32BE(crc32(crcData), 0);

        return Buffer.concat([length, typeBuffer, data, crc]);
    }

    // CRC32 implementation
    function crc32(data) {
        let crc = 0xFFFFFFFF;
        const table = [];

        for (let i = 0; i < 256; i++) {
            let c = i;
            for (let j = 0; j < 8; j++) {
                c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
            }
            table[i] = c >>> 0;
        }

        for (let i = 0; i < data.length; i++) {
            crc = table[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8);
        }

        return (crc ^ 0xFFFFFFFF) >>> 0;
    }

    const ihdrChunk = createChunk('IHDR', ihdrData);
    const idatChunk = createChunk('IDAT', compressedData);
    const iendChunk = createChunk('IEND', Buffer.alloc(0));

    return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Create ICO file (Windows icon format)
function createICO(pngBuffer) {
    // ICO header
    const header = Buffer.alloc(6);
    header.writeUInt16LE(0, 0);      // Reserved
    header.writeUInt16LE(1, 2);      // Image type: 1 = ICO
    header.writeUInt16LE(1, 4);      // Number of images

    // ICO directory entry
    const entry = Buffer.alloc(16);
    entry.writeUInt8(0, 0);          // Width (0 = 256)
    entry.writeUInt8(0, 1);          // Height (0 = 256)
    entry.writeUInt8(0, 2);          // Color palette
    entry.writeUInt8(0, 3);          // Reserved
    entry.writeUInt16LE(1, 4);       // Color planes
    entry.writeUInt16LE(32, 6);      // Bits per pixel
    entry.writeUInt32LE(pngBuffer.length, 8);  // Image size
    entry.writeUInt32LE(22, 12);     // Image offset (6 + 16 = 22)

    return Buffer.concat([header, entry, pngBuffer]);
}

// Create ICNS file (macOS icon format)
function createICNS(pngBuffer) {
    // ICNS header
    const magic = Buffer.from('icns');
    const fileSize = Buffer.alloc(4);

    // ic10 is 1024x1024 PNG, but we'll use ic08 (256x256 PNG)
    const iconType = Buffer.from('ic08');
    const iconSize = Buffer.alloc(4);
    iconSize.writeUInt32BE(pngBuffer.length + 8, 0);

    const totalSize = 8 + 8 + pngBuffer.length;
    fileSize.writeUInt32BE(totalSize, 0);

    return Buffer.concat([magic, fileSize, iconType, iconSize, pngBuffer]);
}

// Main
const assetsDir = path.join(__dirname, '..', 'assets');

console.log('Generating CONSTANTINE Browser icons...');

// Generate 256x256 PNG
const png256 = createPNG(256);
fs.writeFileSync(path.join(assetsDir, 'icon.png'), png256);
console.log('  Created icon.png (256x256)');

// Generate ICO
const ico = createICO(png256);
fs.writeFileSync(path.join(assetsDir, 'icon.ico'), ico);
console.log('  Created icon.ico');

// Generate ICNS
const icns = createICNS(png256);
fs.writeFileSync(path.join(assetsDir, 'icon.icns'), icns);
console.log('  Created icon.icns');

console.log('Done! Icons created in assets/');
