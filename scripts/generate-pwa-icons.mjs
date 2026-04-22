import fs from 'fs'
import zlib from 'zlib'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.join(__dirname, '..', 'public')

const BR = { r: 0, g: 112, b: 234 }
const BR2 = { r: 0, g: 89, b: 187 }

const crcTable = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1)
    t[n] = c >>> 0
  }
  return t
})()

function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const typeBuf = Buffer.from(type, 'ascii')
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0)
  return Buffer.concat([len, typeBuf, data, crc])
}

function lerp(a, b, t) {
  return Math.round(a + (b - a) * t)
}

function gradientAt(x, y, w, h) {
  const t = Math.min(1, Math.max(0, (x / w + y / h) * 0.55))
  return {
    r: lerp(BR.r, BR2.r, t),
    g: lerp(BR.g, BR2.g, t),
    b: lerp(BR.b, BR2.b, t)
  }
}

const DROP_POLY = [
  [0, -0.58],
  [0.22, -0.18],
  [0.38, 0.12],
  [0.24, 0.46],
  [0, 0.52],
  [-0.24, 0.46],
  [-0.38, 0.12],
  [-0.22, -0.18]
]

function pointInDrop(u, v) {
  let inside = false
  const n = DROP_POLY.length
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = DROP_POLY[i][0]
    const yi = DROP_POLY[i][1]
    const xj = DROP_POLY[j][0]
    const yj = DROP_POLY[j][1]
    const cross = (yi > v) !== (yj > v)
    if (cross && u < ((xj - xi) * (v - yi)) / (yj - yi + 1e-9) + xi) inside = !inside
  }
  return inside
}

function iconPng(width, height) {
  const raw = []
  const cx = width / 2
  const cy = height / 2
  const scale = Math.min(width, height) * 0.38

  for (let y = 0; y < height; y++) {
    raw.push(0)
    for (let x = 0; x < width; x++) {
      const u = (x - cx) / scale
      const v = (y - cy) / scale
      let r
      let g
      let b
      if (pointInDrop(u, v)) {
        r = 255
        g = 255
        b = 255
      } else {
        const bg = gradientAt(x, y, width - 1, height - 1)
        r = bg.r
        g = bg.g
        b = bg.b
      }
      raw.push(r, g, b)
    }
  }

  const rawBuf = Buffer.from(raw)
  const compressed = zlib.deflateSync(rawBuf, { level: 9 })

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8
  ihdr[9] = 2
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0))
  ])
}

for (const size of [192, 512]) {
  const buf = iconPng(size, size)
  const name = `pwa-${size}x${size}.png`
  fs.mkdirSync(publicDir, { recursive: true })
  fs.writeFileSync(path.join(publicDir, name), buf)
  console.log('wrote', name, buf.length, 'bytes')
}
