import { readFile, readdir, stat } from 'node:fs/promises'
import { resolve, relative } from 'node:path'
import * as cheerio from 'cheerio'
const root = resolve('dist')
const required = [
  'index.html',
  '404.html',
  'sitemap.xml',
  'sitemap-pages.xml',
  'sitemap-videos.xml',
  'rss.xml',
  'robots.txt',
  'llms.txt',
  '_headers',
]
for (const file of required)
  await stat(resolve(root, file)).catch(() => {
    throw new Error(`Missing dist file: ${file}`)
  })
async function walk(dir: string): Promise<string[]> {
  const result: string[] = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = resolve(dir, entry.name)
    if (entry.isDirectory()) result.push(...(await walk(path)))
    else result.push(path)
  }
  return result
}
const files = await walk(root)
const html = files.filter((f) => f.endsWith('.html'))
const canonicals = new Set<string>()
for (const file of html) {
  const source = await readFile(file, 'utf8')
  const $ = cheerio.load(source)
  const name = relative(root, file)
  if ($('html').attr('lang') !== 'ar-SA' || $('html').attr('dir') !== 'rtl')
    throw new Error(`${name}: invalid lang/dir`)
  if ($('main').length !== 1) throw new Error(`${name}: expected one main`)
  if ($('h1').length !== 1) throw new Error(`${name}: expected one h1`)
  if (!$('title').text().trim() || !$('meta[name="description"]').attr('content'))
    throw new Error(`${name}: missing metadata`)
  const canonical = $('link[rel="canonical"]').attr('href')
  if (!canonical) throw new Error(`${name}: missing canonical`)
  if (canonicals.has(canonical) && name !== '404.html')
    throw new Error(`${name}: duplicate canonical`)
  canonicals.add(canonical)
  $('img').each((_, el) => {
    if (!$(el).attr('alt') || !$(el).attr('width') || !$(el).attr('height'))
      throw new Error(`${name}: incomplete image`)
  })
  if (/TODO|TBD|FIXME|example\.com|lorem|CHANGE_ME|سيتم الإضافة|href="#"/i.test(source))
    throw new Error(`${name}: placeholder content`)
}
if (files.some((file) => /\.mp4$/i.test(file))) throw new Error('MP4 leaked into dist')
console.log(
  `Validated dist: ${html.length} HTML pages, unique metadata/canonicals, complete images, no placeholders or MP4.`,
)
