export function parseGtmId(value: string | undefined): string | null {
  if (value === undefined || value === '') return null
  if (!/^GTM-[A-Z0-9]+$/.test(value)) {
    throw new Error('PUBLIC_GTM_ID must match GTM-[A-Z0-9]+')
  }
  return value
}
