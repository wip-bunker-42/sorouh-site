import { describe, expect, test } from 'vitest'
import { contactContextForPath } from '../contact-context'
import { contactLinks } from '../phone'

const data = {
  services: [{ slug: 'دهانات-داخلية-وخارجية', title: 'دهانات داخلية وخارجية' }],
  areas: [{ slug: 'الدمام', title: 'الدمام' }],
  serviceAreaLandings: [
    {
      service: { slug: 'دهانات-داخلية-وخارجية', title: 'دهانات داخلية وخارجية' },
      serviceArea: { slug: 'الدمام', title: 'الدمام' },
      title: 'صباغ في الدمام',
    },
  ],
}

describe('contact context from published routes', () => {
  test('identifies the actual service and city on an encoded local route', () => {
    const context = contactContextForPath(encodeURI('/الخدمات/دهانات-داخلية-وخارجية/الدمام/'), data)
    expect(context.serviceSlug).toBe('دهانات-داخلية-وخارجية')
    expect(context.areaSlug).toBe('الدمام')
    const message = new URL(contactLinks('0546121683', context.message).whatsapp).searchParams.get(
      'text',
    )
    expect(message).toContain('دهانات داخلية وخارجية')
    expect(message).toContain('الدمام')
  })

  test('does not assign a city to a regional service page', () => {
    const context = contactContextForPath('/الخدمات/دهانات-داخلية-وخارجية/', data)
    expect(context.serviceSlug).toBe('دهانات-داخلية-وخارجية')
    expect(context.areaSlug).toBeUndefined()
    expect(context.message).not.toContain('الدمام')
  })

  test('does not claim an unrecognized city or forward URL queries into a message', () => {
    const context = contactContextForPath(
      '/الخدمات/دهانات-داخلية-وخارجية/غير-موجود/?phone=secret',
      data,
    )
    expect(context.serviceSlug).toBeUndefined()
    expect(context.areaSlug).toBeUndefined()
    expect(context.message).not.toMatch(/secret|غير-موجود|phone=/)
  })

  test('returns a usable generic contact message for malformed and non-service routes', () => {
    for (const path of ['/%E0%A4%A/', '/', '/المدونة/مقال/']) {
      const context = contactContextForPath(path, data)
      expect(context.message.length).toBeGreaterThan(0)
      expect(context.serviceSlug).toBeUndefined()
    }
  })
})
