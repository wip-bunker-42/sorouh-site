import { load } from 'cheerio'

export type HtmlDocument = { name: string; source: string }
export type DistAuditResult = { indexablePages: number; orphanPages: number }

const routePath = (url: URL): string => {
  const decoded = decodeURI(url.pathname)
  if (decoded === '/') return '/'
  return decoded.endsWith('/') ? decoded : `${decoded}/`
}

export function auditHtmlDocuments(
  documents: readonly HtmlDocument[],
  siteOrigin: string,
): DistAuditResult {
  const origin = new URL(siteOrigin).origin
  const titles = new Map<string, string>()
  const descriptions = new Map<string, string>()
  const canonicals = new Map<string, string>()
  const routes = new Map<string, { name: string; links: Set<string> }>()

  for (const document of documents) {
    if (document.name === '404.html') continue
    const $ = load(document.source)
    const robots = $('meta[name="robots"]').attr('content')?.toLowerCase() ?? ''
    if (robots.includes('noindex')) continue

    if ($('html').attr('lang') !== 'ar-SA' || $('html').attr('dir') !== 'rtl') {
      throw new Error(`${document.name}: invalid lang/dir`)
    }
    if ($('main').length !== 1) throw new Error(`${document.name}: expected one main`)
    if ($('h1').length !== 1) throw new Error(`${document.name}: expected one h1`)

    const title = $('title').text().trim()
    const description = $('meta[name="description"]').attr('content')?.trim() ?? ''
    const canonicalValue = $('link[rel="canonical"]').attr('href')?.trim()
    if (!title) throw new Error(`${document.name}: missing title`)
    if (!description) throw new Error(`${document.name}: missing meta description`)
    if (!canonicalValue) throw new Error(`${document.name}: missing canonical`)

    const canonical = new URL(canonicalValue)
    if (canonical.origin !== origin) {
      throw new Error(`${document.name}: canonical outside site origin: ${canonicalValue}`)
    }

    const duplicateTitle = titles.get(title)
    if (duplicateTitle) {
      throw new Error(`${document.name}: duplicate title with ${duplicateTitle}: ${title}`)
    }
    const duplicateDescription = descriptions.get(description)
    if (duplicateDescription) {
      throw new Error(
        `${document.name}: duplicate meta description with ${duplicateDescription}: ${description}`,
      )
    }
    const duplicateCanonical = canonicals.get(canonical.href)
    if (duplicateCanonical) {
      throw new Error(
        `${document.name}: duplicate canonical with ${duplicateCanonical}: ${canonical.href}`,
      )
    }

    titles.set(title, document.name)
    descriptions.set(description, document.name)
    canonicals.set(canonical.href, document.name)

    const links = new Set<string>()
    $('a[href]').each((_, element) => {
      const href = $(element).attr('href')?.trim()
      if (!href || /^(?:mailto:|tel:|javascript:)/i.test(href)) return
      const target = new URL(href, canonical)
      if (!['http:', 'https:'].includes(target.protocol) || target.origin !== origin) return
      links.add(routePath(target))
    })
    routes.set(routePath(canonical), { name: document.name, links })
  }

  const incoming = new Map([...routes.keys()].map((route) => [route, 0]))
  for (const [source, document] of routes) {
    for (const target of document.links) {
      if (target === source || !incoming.has(target)) continue
      incoming.set(target, incoming.get(target)! + 1)
    }
  }

  const orphans = [...incoming.entries()].filter(([route, count]) => route !== '/' && count === 0)
  if (orphans.length > 0) {
    const [route] = orphans[0]!
    throw new Error(`${routes.get(route)!.name}: orphan route: ${route}`)
  }

  return { indexablePages: routes.size, orphanPages: 0 }
}
