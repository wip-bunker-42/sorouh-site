import { describe, expect, test } from 'vitest'

import { extractToc } from '../toc'

const heading = (style: 'h2' | 'h3', text: string) => ({
  _type: 'block',
  _key: `${style}-${text}`,
  style,
  children: [{ _type: 'span', _key: 'span', text }],
})

describe('extractToc', () => {
  test('extracts H2/H3 in order with stable Unicode IDs and duplicate suffixes', () => {
    expect(
      extractToc([
        heading('h2', 'خطوات اختيار المقاول'),
        heading('h3', 'فحص الأعمال السابقة'),
        heading('h2', 'خطوات اختيار المقاول'),
        { _type: 'block', style: 'normal', children: [{ _type: 'span', text: 'فقرة' }] },
      ]),
    ).toEqual([
      { level: 2, text: 'خطوات اختيار المقاول', id: 'خطوات-اختيار-المقاول' },
      { level: 3, text: 'فحص الأعمال السابقة', id: 'فحص-الأعمال-السابقة' },
      { level: 2, text: 'خطوات اختيار المقاول', id: 'خطوات-اختيار-المقاول-1' },
    ])
  })

  test('ignores empty and non-heading blocks', () => {
    expect(extractToc([heading('h2', '   '), { _type: 'contentImage' }])).toEqual([])
  })
})
