const DEFAULT_MESSAGE = 'السلام عليكم، أحتاج الاستفسار عن خدمات المقاولات.'

export function normalizeSaudiMobile(input: string): string {
  const compact = input.replace(/[\s()-]/g, '')
  let digits = compact

  if (digits.startsWith('+')) digits = digits.slice(1)
  if (digits.startsWith('00')) digits = digits.slice(2)
  if (digits.startsWith('0')) digits = `966${digits.slice(1)}`

  if (!/^9665\d{8}$/.test(digits)) {
    throw new Error(`Invalid Saudi mobile: ${input}`)
  }
  return `+${digits}`
}

export function contactLinks(phone: string, message = DEFAULT_MESSAGE) {
  const normalized = normalizeSaudiMobile(phone)
  const digits = normalized.slice(1)
  return {
    tel: `tel:${normalized}`,
    whatsapp: `https://wa.me/${digits}?text=${encodeURIComponent(message)}`,
  }
}
