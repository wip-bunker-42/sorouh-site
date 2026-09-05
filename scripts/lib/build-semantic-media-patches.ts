import type { SemanticMediaPlacement } from './semantic-media'

type ContentImage = {
  _type: 'contentImage'
  _key?: string
  asset: { _type: 'reference'; _ref: string }
  alt: string
  caption?: string
  crop: {
    _type: 'sanity.imageCrop'
    top: number
    right: number
    bottom: number
    left: number
  }
  hotspot: {
    _type: 'sanity.imageHotspot'
    x: number
    y: number
    width: number
    height: number
  }
}

export type SemanticMediaPatch = {
  documentId: string
  set: Record<string, ContentImage | ContentImage[]>
  managedGalleryImage?: ContentImage
}

export function assertManagedContentImage(
  actual: unknown,
  expected: ContentImage,
  location: string,
) {
  const actualImage = actual as ContentImage | undefined
  const fields = ['_type', 'alt', 'caption'] as const
  for (const field of fields) {
    if (actualImage?.[field] !== expected[field]) {
      throw new Error(`Media verification failed: ${location}.${field}`)
    }
  }
  if (actualImage?.asset?._ref !== expected.asset._ref) {
    throw new Error(`Media verification failed: ${location}.asset._ref`)
  }
  const cropFields = ['top', 'right', 'bottom', 'left'] as const
  if (
    actualImage?.crop?._type !== expected.crop._type ||
    cropFields.some((field) => actualImage.crop[field] !== expected.crop[field])
  ) {
    throw new Error(`Media verification failed: ${location}.crop`)
  }
  const hotspotFields = ['x', 'y', 'width', 'height'] as const
  if (
    actualImage?.hotspot?._type !== expected.hotspot._type ||
    hotspotFields.some((field) => actualImage.hotspot[field] !== expected.hotspot[field])
  ) {
    throw new Error(`Media verification failed: ${location}.hotspot`)
  }
}

export function buildManagedContentImage(
  placement: SemanticMediaPlacement,
  assetId: string,
): ContentImage {
  return {
    _type: 'contentImage',
    asset: { _type: 'reference', _ref: assetId },
    alt: placement.alt,
    ...(placement.caption ? { caption: placement.caption } : {}),
    crop: {
      _type: 'sanity.imageCrop',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
    hotspot: {
      _type: 'sanity.imageHotspot',
      x: 0.5,
      y: 0.5,
      width: 1,
      height: 1,
    },
  }
}

export function buildSemanticMediaPatch(
  placement: SemanticMediaPlacement,
  assetId: string,
): SemanticMediaPatch {
  const image = buildManagedContentImage(placement, assetId)

  if (placement.role === 'project') {
    return {
      documentId: placement.target,
      set: {
        'seo.shareImage': image,
      },
      managedGalleryImage: { ...image, _key: 'semantic-media-primary' },
    }
  }

  let visualField: string
  if (placement.role === 'page') {
    if (placement.target === 'homePage') visualField = 'heroImage'
    else if (placement.target === 'aboutPage') visualField = 'image'
    else throw new Error(`Unsupported page media target: ${placement.target}`)
  } else if (placement.role === 'service' || placement.role === 'service-area') {
    visualField = 'heroImage'
  } else if (placement.role === 'area') visualField = 'image'
  else visualField = 'featuredImage'

  return {
    documentId: placement.target,
    set: {
      [visualField]: image,
      'seo.shareImage': image,
    },
  }
}
