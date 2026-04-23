import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.join(__dirname, '..', 'public')
const master = path.join(publicDir, 'app-icon.png')

if (!fs.existsSync(master)) {
  console.error('Missing public/app-icon.png — add the 1024×1024 master artwork, then run npm run icons')
  process.exit(1)
}

if (process.platform !== 'darwin') {
  console.error('This script uses macOS `sips` to resize. On other OS, resize app-icon.png to:')
  console.error('  public/favicon.png 32×32, public/pwa-192x192.png 192×192, public/pwa-512x512.png 512×512')
  process.exit(1)
}

function resize(w, h, outName) {
  const out = path.join(publicDir, outName)
  execSync(`sips -z ${h} ${w} ${JSON.stringify(master)} --out ${JSON.stringify(out)}`, { stdio: 'inherit' })
  console.log('wrote', outName)
}

resize(192, 192, 'pwa-192x192.png')
resize(512, 512, 'pwa-512x512.png')
resize(32, 32, 'favicon.png')
