import { describe, expect, test } from 'vitest'

import {
  buildAhrefsMetaRemediationPatches,
  AHREFS_META_DESCRIPTION_TARGETS,
} from './ahrefs-meta-remediation'

describe('buildAhrefsMetaRemediationPatches', () => {
  test('creates every reviewed metadata patch without exceeding Ahrefs length thresholds', () => {
    const documents = AHREFS_META_DESCRIPTION_TARGETS.map((target) => ({
      _id: target.documentId,
      _type: target.documentType,
      seo: { metaDescription: 'الوصف الحالي' },
    }))

    const patches = buildAhrefsMetaRemediationPatches(documents)

    expect(patches).toHaveLength(18)
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
        expect.objectContaining({
          documentId: 'service-area-electrical-dammam',
          set: { 'seo.metaDescription': expect.stringContaining('كهربائي في الدمام') },
        }),
        expect.objectContaining({
          documentId: 'post-water-leak-before-renovation',
          set: { 'seo.metaTitle': expect.stringContaining('إصلاح السباكة') },
        }),
      ]),
    )

    for (const target of AHREFS_META_DESCRIPTION_TARGETS) {
      if (target.metaDescription) expect(target.metaDescription.length).toBeLessThanOrEqual(155)
      if (target.metaTitle) expect(target.metaTitle.length).toBeLessThanOrEqual(60)
    }
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
