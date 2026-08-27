import { describe, expect, test } from 'vitest'

import {
  buildAhrefsMetaRemediationPatches,
  AHREFS_META_DESCRIPTION_TARGETS,
} from './ahrefs-meta-remediation'

describe('buildAhrefsMetaRemediationPatches', () => {
  test('creates exactly the seven reviewed meta-description patches', () => {
    const documents = AHREFS_META_DESCRIPTION_TARGETS.map((target) => ({
      _id: target.documentId,
      _type: target.documentType,
      seo: { metaDescription: 'الوصف الحالي' },
    }))

    const patches = buildAhrefsMetaRemediationPatches(documents)

    expect(patches).toHaveLength(7)
    expect(patches).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          documentId: 'area-khobar',
          set: { 'seo.metaDescription': expect.stringContaining('الخبر') },
        }),
        expect.objectContaining({
          documentId: 'post-concrete-cutting-guide',
          set: { 'seo.metaDescription': expect.stringContaining('قص الخرسانة') },
        }),
      ]),
    )
  })

  test('refuses an incomplete or unexpected Sanity result set', () => {
    const incomplete = AHREFS_META_DESCRIPTION_TARGETS.slice(1).map((target) => ({
      _id: target.documentId,
      _type: target.documentType,
    }))

    expect(() => buildAhrefsMetaRemediationPatches(incomplete)).toThrow('Missing reviewed document')
    expect(() =>
      buildAhrefsMetaRemediationPatches([
        ...AHREFS_META_DESCRIPTION_TARGETS.map((target) => ({
          _id: target.documentId,
          _type: target.documentType,
        })),
        { _id: 'unexpected-document', _type: 'post' },
      ]),
    ).toThrow('unexpected documents')
  })
})
