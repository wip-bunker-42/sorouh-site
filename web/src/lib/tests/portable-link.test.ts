import { describe, expect, test } from 'vitest'

import { getPortableLinkAttributes } from '../portable-link'

describe('Portable Text links', () => {
  test('reads the href from the library mark definition', () => {
    expect(
      getPortableLinkAttributes({
        markDef: {
          href: 'https://sorouh.site/الخدمات/عزل-الاسطح/',
          openInNewTab: false,
        },
      }),
    ).toEqual({ href: 'https://sorouh.site/الخدمات/عزل-الاسطح/', external: false })
  })
})
