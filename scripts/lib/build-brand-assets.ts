import { copyFile, mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import sharp from 'sharp'

const source = resolve('work/source-media/sorouh/اصول/اللوجو.png')
const destination = resolve('web/public/brand')

await mkdir(destination, { recursive: true })
await copyFile(source, resolve(destination, 'logo.png'))

const mark = await sharp(source)
  .resize(420, 420, { fit: 'contain', background: '#ffffff' })
  .png({ compressionLevel: 9 })
  .toBuffer()

await sharp(mark).webp({ quality: 90, effort: 5 }).toFile(resolve(destination, 'logo.webp'))
await sharp(mark)
  .resize(320, 320)
  .png({ compressionLevel: 9 })
  .toFile(resolve(destination, 'logo-mark.png'))

const background = Buffer.from(`
  <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="navy" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#071629"/>
        <stop offset="1" stop-color="#102b49"/>
      </linearGradient>
      <pattern id="grid" width="44" height="44" patternUnits="userSpaceOnUse">
        <path d="M44 0H0V44" fill="none" stroke="#ffffff" stroke-opacity=".055"/>
      </pattern>
    </defs>
    <rect width="1200" height="630" fill="url(#navy)"/>
    <rect width="1200" height="630" fill="url(#grid)"/>
    <path d="M0 520L1200 300V630H0Z" fill="#d9782d" opacity=".94"/>
    <path d="M0 575L1200 355V405L0 625Z" fill="#f3ae62" opacity=".4"/>
    <rect x="54" y="52" width="330" height="330" rx="34" fill="#fff"/>
    <text x="1110" y="180" fill="#f4a255" font-family="Segoe UI, Arial" font-size="28" font-weight="700" text-anchor="start" direction="rtl">مقاولات • ترميم • تشطيب</text>
    <text x="1110" y="260" fill="#ffffff" font-family="Segoe UI, Arial" font-size="52" font-weight="800" text-anchor="start" direction="rtl">شركة صروح الشرقية</text>
    <text x="1110" y="326" fill="#ffffff" font-family="Segoe UI, Arial" font-size="52" font-weight="800" text-anchor="start" direction="rtl">للمقاولات</text>
    <rect x="530" y="352" width="595" height="62" rx="18" fill="#071629" opacity=".78"/>
    <text x="1110" y="398" fill="#d8e1ec" font-family="Segoe UI, Arial" font-size="25" text-anchor="start" direction="rtl">تنفيذ احترافي في الدمام والخبر والمنطقة الشرقية</text>
  </svg>
`)

const logoForSocial = await sharp(source)
  .resize(270, 270, { fit: 'contain', background: '#ffffff' })
  .png()
  .toBuffer()

await sharp(background)
  .composite([{ input: logoForSocial, left: 84, top: 82 }])
  .jpeg({ quality: 91, chromaSubsampling: '4:4:4' })
  .toFile(resolve(destination, 'og-default.jpg'))

console.log('Generated brand assets: logo.png, logo.webp, logo-mark.png, og-default.jpg')
