export type KeywordIntent = 'transactional' | 'commercial' | 'informational'
export type KeywordTargetStatus = 'active' | 'candidate' | 'monitor' | 'merged'

export type KeywordTarget = {
  id: string
  primaryKeyword: string
  variants: string[]
  intent: KeywordIntent
  geography: string
  status: KeywordTargetStatus
  ownerPath?: string
  source: 'google-ads-api-v25' | 'search-console' | 'bing' | 'ahrefs' | 'serp-review'
  researchedAt: string
  avgMonthlySearches?: number
}

export function normalizeKeyword(value: string): string {
  return value.trim().replace(/\s+/g, ' ').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').toLowerCase()
}

export function validateKeywordTargets(
  targets: readonly KeywordTarget[],
  livePaths: ReadonlySet<string>,
): { active: number; candidates: number } {
  const activeKeywords = new Map<string, string>()
  let active = 0
  let candidates = 0

  for (const target of targets) {
    if (
      !target.id ||
      !target.primaryKeyword.trim() ||
      !/^\d{4}-\d{2}-\d{2}$/.test(target.researchedAt)
    ) {
      throw new Error(`Invalid keyword target: ${target.id || '(missing id)'}`)
    }
    if (target.status === 'candidate') candidates += 1
    if (target.status !== 'active') continue
    active += 1
    if (!target.ownerPath || !livePaths.has(target.ownerPath)) {
      throw new Error(
        `Active target ${target.id} owns missing route: ${target.ownerPath ?? '(none)'}`,
      )
    }
    for (const keyword of [target.primaryKeyword, ...target.variants]) {
      const normalized = normalizeKeyword(keyword)
      const existing = activeKeywords.get(normalized)
      if (existing && existing !== target.id) {
        throw new Error(`Keyword collision: ${normalized}`)
      }
      activeKeywords.set(normalized, target.id)
    }
  }

  return { active, candidates }
}
