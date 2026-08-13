import { SITE_ORIGIN } from '../config/site'

function isFilePath(path: string): boolean {
  const finalSegment = path.split('/').filter(Boolean).at(-1) ?? ''
  return /\.[a-z0-9]{2,8}$/i.test(finalSegment)
}

function normalizeCanonicalPath(path: string): string {
  if (
    !path.startsWith('/') ||
    path.startsWith('//') ||
    /[?#]/.test(path) ||
    /^https?:/i.test(path)
  ) {
    throw new Error(`Unsafe canonical path: ${path}`)
  }
  const collapsed = path.replace(/\/{2,}/g, '/')
  if (collapsed === '/') return collapsed
  if (isFilePath(collapsed)) return collapsed
  return collapsed.endsWith('/') ? collapsed : `${collapsed}/`
}

function normalizeCanonicalUrl(url: URL): URL {
  if (url.protocol !== 'https:' || url.search || url.hash) {
    throw new Error(`Unsafe canonical path: ${url.href}`)
  }
  url.pathname = normalizeCanonicalPath(url.pathname)
  return url
}

export function canonicalUrl(path: string, override?: string): URL {
  const origin = new URL(SITE_ORIGIN)
  if (!override) return normalizeCanonicalUrl(new URL(normalizeCanonicalPath(path), origin))

  let candidate: URL
  try {
    candidate = new URL(override)
  } catch {
    throw new Error(`Unsafe canonical override: ${override}`)
  }

  return normalizeCanonicalUrl(candidate)
}
