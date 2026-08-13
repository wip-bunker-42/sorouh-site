export function normalizeSiteOrigin(value: string): string {
  let url: URL
  try {
    url = new URL(value.trim())
  } catch {
    throw new Error('PUBLIC_SITE_ORIGIN must be a valid HTTPS origin')
  }
  if (url.protocol !== 'https:' || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('PUBLIC_SITE_ORIGIN must contain one HTTPS origin without a path')
  }
  return url.origin
}

const configuredOrigin = process.env.PUBLIC_SITE_ORIGIN?.trim() || 'https://sorouh.site'

export const SITE_ORIGIN = normalizeSiteOrigin(configuredOrigin)
export const SITE_LOCALE = 'ar-SA'
export const SITE_DIRECTION = 'rtl'
