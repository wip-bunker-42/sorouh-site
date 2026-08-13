import { describe, expect, test } from 'vitest'

import { preparePortableText } from '../portable-text'

describe('Portable Text preparation', () => {
  test('keeps custom blocks and assigns stable unique heading ids for the TOC', () => {
    const value = [
      {
        _key: 'a',
        _type: 'block',
        style: 'h2',
        children: [{ _type: 'span', text: 'مرحلة العمل' }],
      },
      { _key: 'b', _type: 'contentImage', alt: 'صورة التنفيذ' },
      {
        _key: 'c',
        _type: 'block',
        style: 'h2',
        children: [{ _type: 'span', text: 'مرحلة العمل' }],
      },
      { _key: 'd', _type: 'cta', headline: 'تواصل معنا' },
    ]
    const prepared = preparePortableText(value)
    expect(prepared.map((block) => block._type)).toEqual(['block', 'contentImage', 'block', 'cta'])
    expect(prepared[0]?.portableId).toBe('مرحلة-العمل')
    expect(prepared[2]?.portableId).toBe('مرحلة-العمل-1')
    expect(preparePortableText(prepared.slice(2))[0]?.portableId).toBe('مرحلة-العمل-1')
  })
})
