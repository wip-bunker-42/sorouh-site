import { describe, expect, test } from 'vitest'

import { auditHtmlDocuments } from '../seo/dist-audit'

const page = (name: string, canonical: string, title: string, links: string[] = []) => ({
  name,
  source: `<!doctype html><html lang="ar-SA" dir="rtl"><head><title>${title}</title><meta name="description" content="وصف ${title} واضح ومختلف لهذه الصفحة"><link rel="canonical" href="${canonical}"><meta name="robots" content="index, follow"></head><body><main><h1>${title}</h1>${links.map((href) => `<a href="${href}">رابط</a>`).join('')}</main></body></html>`,
})

describe('dist SEO audit', () => {
  test('rejects duplicate titles on indexable pages', () => {
    expect(() =>
      auditHtmlDocuments(
        [
          page('index.html', 'https://sorouh.site/', 'عنوان واحد'),
          page('x/index.html', 'https://sorouh.site/x/', 'عنوان واحد'),
        ],
        'https://sorouh.site',
      ),
    ).toThrow('duplicate title')
  })

  test('reports an indexable route with no incoming internal link', () => {
    expect(() =>
      auditHtmlDocuments(
        [
          page('index.html', 'https://sorouh.site/', 'الرئيسية'),
          page('x/index.html', 'https://sorouh.site/x/', 'صفحة يتيمة'),
        ],
        'https://sorouh.site',
      ),
    ).toThrow('orphan route: /x/')
  })

  test('accepts a unique page linked from the home page', () => {
    expect(
      auditHtmlDocuments(
        [
          page('index.html', 'https://sorouh.site/', 'الرئيسية', ['/x/']),
          page('x/index.html', 'https://sorouh.site/x/', 'صفحة خدمة'),
        ],
        'https://sorouh.site',
      ),
    ).toMatchObject({ indexablePages: 2, orphanPages: 0 })
  })
})
