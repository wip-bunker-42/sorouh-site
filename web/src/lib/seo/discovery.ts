import { parseYouTubeUrl } from '../youtube'
import type { NormalizedSnapshot } from '../content/normalize'
import { generateRedirects } from '../redirects'
import { SITE_ORIGIN } from '../../config/site'

const origin = SITE_ORIGIN
const xml = (value: unknown) =>
  String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
const absolute = (path: string) => `${origin}${path}`
type Entry = { path: string; lastmod?: string; image?: string }

export function pageEntries(data: NormalizedSnapshot): Entry[] {
  const fixed: Array<Entry & { noIndex?: boolean }> = [
    { path: '/', lastmod: data.homePage._updatedAt, noIndex: data.homePage.seo.noIndex },
    { path: '/من-نحن/', lastmod: data.aboutPage._updatedAt, noIndex: data.aboutPage.seo.noIndex },
    {
      path: '/اتصل-بنا/',
      lastmod: data.contactPage._updatedAt,
      noIndex: data.contactPage.seo.noIndex,
    },
    { path: '/الخدمات/' },
    { path: '/مناطق-الخدمة/' },
    { path: '/مشاريعنا/' },
    { path: '/المدونة/' },
  ]
  const docs: any[] = [
    ...data.services.map((d) => ({ ...d, path: `/الخدمات/${d.slug}/` })),
    ...data.areas.map((d) => ({ ...d, path: `/مناطق-الخدمة/${d.slug}/` })),
    ...data.projects.map((d) => ({ ...d, path: `/مشاريعنا/${d.slug}/` })),
    ...data.posts.map((d) => ({ ...d, path: `/المدونة/${d.slug}/` })),
  ]
  return [
    ...fixed.filter((entry) => !entry.noIndex),
    ...docs
      .filter((d) => !d.seo.noIndex)
      .map((d) => ({
        path: d.path,
        lastmod: d._updatedAt,
        image:
          d.heroImage?.asset?.url ??
          d.image?.asset?.url ??
          d.gallery?.[0]?.asset?.url ??
          d.featuredImage?.asset?.url,
      })),
  ]
}

export function sitemapPages(data: NormalizedSnapshot) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${pageEntries(
    data,
  )
    .map(
      (e) =>
        `  <url><loc>${xml(absolute(e.path))}</loc>${e.lastmod ? `<lastmod>${xml(e.lastmod)}</lastmod>` : ''}${e.image ? `<image:image><image:loc>${xml(e.image)}</image:loc></image:image>` : ''}</url>`,
    )
    .join('\n')}\n</urlset>\n`
}

export function sitemapVideos(data: NormalizedSnapshot) {
  const entries = data.projects
    .filter((project) => !project.seo.noIndex)
    .flatMap((project) =>
      (project.videos ?? []).map((video: any) => ({
        project,
        video,
        parsed: parseYouTubeUrl(video.url),
      })),
    )
    .filter((x) => x.parsed && x.video.title && x.video.description && x.video.uploadDate)
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n${entries.map(({ project, video, parsed }) => `  <url><loc>${xml(absolute(`/مشاريعنا/${project.slug}/`))}</loc><video:video><video:thumbnail_loc>${xml(parsed!.thumbnailUrl)}</video:thumbnail_loc><video:title>${xml(video.title)}</video:title><video:description>${xml(video.description)}</video:description><video:player_loc>${xml(`https://www.youtube.com/embed/${parsed!.id}`)}</video:player_loc><video:publication_date>${xml(video.uploadDate)}</video:publication_date></video:video></url>`).join('\n')}\n</urlset>\n`
}

export const sitemapIndex = () =>
  `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>${origin}/sitemap-pages.xml</loc></sitemap><sitemap><loc>${origin}/sitemap-videos.xml</loc></sitemap></sitemapindex>\n`

export function rss(data: NormalizedSnapshot) {
  const posts = data.posts
    .filter((p) => !p.seo.noIndex && new Date(p.publishedAt) <= new Date())
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
  return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>مدونة ${xml(data.siteSettings.companyName)}</title><link>${origin}/المدونة/</link><description>${xml(data.siteSettings.tagline)}</description><language>ar-SA</language>${posts.map((p) => `<item><title>${xml(p.title)}</title><link>${xml(absolute(`/المدونة/${p.slug}/`))}</link><guid isPermaLink="true">${xml(absolute(`/المدونة/${p.slug}/`))}</guid><pubDate>${new Date(p.publishedAt).toUTCString()}</pubDate><author>${xml(`${data.siteSettings.rssAuthorEmail} (${data.siteSettings.companyName})`)}</author><description>${xml(p.excerpt)}</description></item>`).join('')}</channel></rss>\n`
}

export function redirects(data: NormalizedSnapshot) {
  const records: Array<{ source: string; destination: string; status?: 301 | 302 }> = []
  for (const [base, docs] of [
    ['الخدمات', data.services],
    ['مناطق-الخدمة', data.areas],
    ['مشاريعنا', data.projects],
    ['المدونة', data.posts],
  ] as const) {
    for (const doc of docs) {
      for (const old of doc.redirectFrom ?? []) {
        records.push({
          source: old.startsWith('/') ? old : `/${base}/${old}/`,
          destination: `/${base}/${doc.slug}/`,
          status: 301,
        })
      }
    }
  }
  records.push(
    ...data.redirects.map((item) => ({
      source: String(item.source),
      destination: String(item.destination),
      status: item.status === 302 ? (302 as const) : (301 as const),
    })),
  )
  const liveRoutes = new Set([
    '/',
    '/من-نحن/',
    '/اتصل-بنا/',
    '/الخدمات/',
    '/مناطق-الخدمة/',
    '/مشاريعنا/',
    '/المدونة/',
    ...data.services.map((doc) => `/الخدمات/${doc.slug}/`),
    ...data.areas.map((doc) => `/مناطق-الخدمة/${doc.slug}/`),
    ...data.projects.map((doc) => `/مشاريعنا/${doc.slug}/`),
    ...data.posts.map((doc) => `/المدونة/${doc.slug}/`),
  ])
  return generateRedirects(records, liveRoutes)
}
