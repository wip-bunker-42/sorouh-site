import {
  createImageUrlBuilder,
  type SanityImageSource as BuilderImageSource,
} from '@sanity/image-url'

export type SanityImageSource = Exclude<BuilderImageSource, string>

export type SanityImageOptions = {
  projectId: string
  dataset: string
  widths: number[]
  displayWidth: number
  aspectRatio?: number
  quality?: number
}

export type BuiltSanityImage = {
  src: string
  srcset: string
  width: number
  height: number
}

function hasAssetReference(source: SanityImageSource): boolean {
  if (!source || typeof source !== 'object') return false
  const image = source as { asset?: { _ref?: string; _id?: string; url?: string } }
  return Boolean(image.asset?._ref || image.asset?._id || image.asset?.url)
}

export function buildSanityImage(
  source: SanityImageSource,
  options: SanityImageOptions,
): BuiltSanityImage {
  if (!hasAssetReference(source)) throw new Error('Sanity image asset reference is required')
  if (!Number.isFinite(options.displayWidth) || options.displayWidth <= 0) {
    throw new Error('displayWidth must be a positive number')
  }
  if (options.aspectRatio !== undefined && options.aspectRatio <= 0) {
    throw new Error('aspectRatio must be positive')
  }
  if (!options.projectId || !options.dataset)
    throw new Error('Sanity project and dataset are required')

  const displayWidth = Math.round(options.displayWidth)
  const widths = [...new Set(options.widths.map(Math.round).filter((width) => width > 0))]
    .map((width) => Math.min(width, displayWidth))
    .concat(displayWidth)
    .filter((width, index, values) => values.indexOf(width) === index)
    .sort((a, b) => a - b)

  const aspectRatio = options.aspectRatio
  const height = aspectRatio ? Math.round(displayWidth / aspectRatio) : displayWidth
  const builder = createImageUrlBuilder({ projectId: options.projectId, dataset: options.dataset })
  const imageUrl = (width: number) => {
    let request = builder
      .image(source)
      .width(width)
      .auto('format')
      .quality(options.quality ?? 82)
    if (aspectRatio) request = request.height(Math.round(width / aspectRatio)).fit('crop')
    return request.url()
  }

  return {
    src: imageUrl(displayWidth),
    srcset: widths.map((width) => `${imageUrl(width)} ${width}w`).join(', '),
    width: displayWidth,
    height,
  }
}
