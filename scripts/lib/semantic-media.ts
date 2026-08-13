export type MediaOrigin = 'source' | 'video-still' | 'generated'
export type MediaRole = 'page' | 'service' | 'area' | 'post' | 'project'

export type SemanticMediaAsset = {
  key: string
  origin: MediaOrigin
  path: string
  topics: string[]
}

export type SemanticMediaPlacement = {
  target: string
  role: MediaRole
  assetKey: string
  topic: string
  alt: string
  caption?: string
}

export type SemanticMediaPlan = {
  assets: SemanticMediaAsset[]
  placements: SemanticMediaPlacement[]
}

export function validateSemanticMediaPlan(plan: SemanticMediaPlan, expectedTargets: string[]) {
  const assets = new Map<string, SemanticMediaAsset>()
  for (const asset of plan.assets) {
    if (assets.has(asset.key)) throw new Error(`Duplicate media asset: ${asset.key}`)
    assets.set(asset.key, asset)
  }

  const expected = new Set(expectedTargets)
  const seen = new Set<string>()

  for (const placement of plan.placements) {
    if (!expected.has(placement.target)) {
      throw new Error(`Unknown media placement: ${placement.target}`)
    }
    if (seen.has(placement.target)) {
      throw new Error(`Duplicate media placement: ${placement.target}`)
    }
    seen.add(placement.target)

    const asset = assets.get(placement.assetKey)
    if (!asset) throw new Error(`Unknown media asset: ${placement.assetKey}`)
    if (!asset.topics.includes(placement.topic)) {
      throw new Error(`${asset.key} does not cover topic ${placement.topic}`)
    }
    if (!placement.alt.trim()) throw new Error(`Missing media alt: ${placement.target}`)
    if (placement.role === 'project' && asset.origin === 'generated') {
      throw new Error(`Generated media cannot be used as project evidence: ${placement.target}`)
    }
    if (asset.origin === 'generated' && !placement.caption?.includes('صورة توضيحية')) {
      throw new Error(`Generated placement must use an illustrative caption: ${placement.target}`)
    }
  }

  for (const target of expected) {
    if (!seen.has(target)) throw new Error(`Missing media placement: ${target}`)
  }

  return {
    assets: assets.size,
    placements: plan.placements.length,
    generated: plan.assets.filter((asset) => asset.origin === 'generated').length,
  }
}
