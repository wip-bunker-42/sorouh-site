import { describe, expect, test } from 'vitest'

import { contactLinks, formatSaudiMobile, normalizeSaudiMobile } from '../phone'

describe('Saudi contact links', () => {
  test.each([
    ['0546121683', '+966546121683'],
    ['+966546121683', '+966546121683'],
    ['00966546745928', '+966546745928'],
    ['054 674 5928', '+966546745928'],
  ])('normalizes %s', (input, expected) => {
    expect(normalizeSaudiMobile(input)).toBe(expected)
  })

  test.each(['', '0112345678', '05123', '+966123456789', '05461216830'])(
    'rejects invalid mobile %s',
    (phone) => expect(() => normalizeSaudiMobile(phone)).toThrow('Invalid Saudi mobile'),
  )

  test('builds E.164 call and digit-only WhatsApp links with an encoded Arabic message', () => {
    const links = contactLinks('0546121683', 'السلام عليكم، أحتاج عرض سعر للمشروع')
    expect(links.tel).toBe('tel:+966546121683')
    expect(links.whatsapp).toBe(
      `https://wa.me/966546121683?text=${encodeURIComponent('السلام عليكم، أحتاج عرض سعر للمشروع')}`,
    )
  })

  test('formats the same editable number for display', () => {
    expect(formatSaudiMobile('+966546121683')).toBe('054 612 1683')
  })
})
