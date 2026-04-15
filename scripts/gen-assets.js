// Generates minimal branded PNG assets (icon + splash) without external deps.
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const OUT = path.join(__dirname, '..', 'assets');
fs.mkdirSync(OUT, { recursive: true });

const BG = [0x0a, 0x0a, 0x0a];
const NEON = [0xc6, 0xff, 0x00];

function crc32(buf) {
  let c;
  const table = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

// Generates a size x size PNG. pixelFn(x,y) returns [r,g,b].
function makePng(size, pixelFn) {
  const raw = Buffer.alloc(size * (size * 3 + 1));
  let p = 0;
  for (let y = 0; y < size; y++) {
    raw[p++] = 0;
    for (let x = 0; x < size; x++) {
      const [r, g, b] = pixelFn(x, y);
      raw[p++] = r;
      raw[p++] = g;
      raw[p++] = b;
    }
  }
  const idat = zlib.deflateSync(raw);
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

// 1024x1024 icon: dark bg with a neon ring
function iconPixel(x, y, size) {
  const cx = size / 2;
  const cy = size / 2;
  const d = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
  const outerR = size * 0.42;
  const innerR = size * 0.32;
  if (d >= innerR && d <= outerR) return NEON;
  return BG;
}

const iconSize = 1024;
fs.writeFileSync(
  path.join(OUT, 'icon.png'),
  makePng(iconSize, (x, y) => iconPixel(x, y, iconSize)),
);

// Splash: same bg, a small neon bar (subtle)
const splashSize = 1284;
fs.writeFileSync(
  path.join(OUT, 'splash.png'),
  makePng(splashSize, (x, y) => {
    const cx = splashSize / 2;
    const cy = splashSize / 2;
    const barH = 6;
    const barW = 120;
    if (Math.abs(y - cy) <= barH / 2 && Math.abs(x - cx) <= barW / 2) return NEON;
    return BG;
  }),
);

console.log('Assets generated at', OUT);
