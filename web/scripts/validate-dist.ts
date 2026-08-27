import { readFile, readdir, stat } from 'node:fs/promises'
import { resolve, relative } from 'node:path'
import * as cheerio from 'cheerio'
import { auditHtmlDocuments } from '../src/lib/seo/dist-audit'
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
const documents = await Promise.all(
  html.map(async (file) => ({ name: relative(root, file), source: await readFile(file, 'utf8') })),
)
const audit = auditHtmlDocuments(documents, 'https://sorouh.site')
for (const { name, source } of documents) {
  const $ = cheerio.load(source)
  $('img').each((_, el) => {
    if (!$(el).attr('alt') || !$(el).attr('width') || !$(el).attr('height'))
      throw new Error(`${name}: incomplete image`)
  })
  if (/TODO|TBD|FIXME|example\.com|lorem|CHANGE_ME|سيتم الإضافة|href="#"/i.test(source))
    throw new Error(`${name}: placeholder content`)
}
if (files.some((file) => /\.mp4$/i.test(file))) throw new Error('MP4 leaked into dist')
console.log(
  `SEO audit: ${audit.indexablePages} indexable pages, ${audit.orphanPages} orphan pages.`,
)
console.log(
  `Validated dist: ${html.length} HTML pages, unique metadata/canonicals, complete images, no placeholders or MP4.`,
)
