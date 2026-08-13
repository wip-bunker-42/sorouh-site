export type RedirectRecord = {
  source: string
  destination: string
  status?: 301 | 302
}

function normalizeInternalPath(value: string, allowRoot = false): string {
  if (/[?#]/.test(value)) {
    throw new Error(`Redirect path cannot contain a query or fragment: ${value}`)
  }
  if (!value.startsWith('/') || value.startsWith('//') || /:\/\//.test(value)) {
    throw new Error(`Redirect must use an internal path: ${value}`)
  }
  const normalized = value.replace(/\/{2,}/g, '/')
  if (normalized === '/' && !allowRoot)
    throw new Error('Redirect cannot target the site root as a source')
  return normalized.endsWith('/') ? normalized : `${normalized}/`
}

function assertNoCycles(destinationBySource: Map<string, string>) {
  for (const start of destinationBySource.keys()) {
    const visited = new Set<string>()
    let current: string | undefined = start
    while (current && destinationBySource.has(current)) {
      if (visited.has(current)) throw new Error(`redirect cycle detected at ${current}`)
      visited.add(current)
      current = destinationBySource.get(current)
    }
  }
}

export function generateRedirects(records: RedirectRecord[], liveRoutes: Set<string>): string {
  const normalizedLiveRoutes = new Set(
    [...liveRoutes].map((route) => normalizeInternalPath(route, true)),
  )
  const normalized = records.map((record) => ({
    source: normalizeInternalPath(record.source),
    destination: normalizeInternalPath(record.destination, true),
    status: record.status ?? 301,
  }))
  const destinationBySource = new Map<string, string>()

  for (const record of normalized) {
    if (record.source === record.destination) throw new Error(`self redirect: ${record.source}`)
    if (destinationBySource.has(record.source)) {
      throw new Error(`duplicate redirect source: ${record.source}`)
    }
    if (normalizedLiveRoutes.has(record.source)) {
      throw new Error(`redirect source collides with live route: ${record.source}`)
    }
    destinationBySource.set(record.source, record.destination)
  }

  assertNoCycles(destinationBySource)

  for (const record of normalized) {
    if (
      !normalizedLiveRoutes.has(record.destination) &&
      !destinationBySource.has(record.destination)
    ) {
      throw new Error(`missing live destination: ${record.destination}`)
    }
  }

  return normalized
    .sort((left, right) => left.source.localeCompare(right.source, 'ar'))
    .map((record) => `${record.source} ${record.destination} ${record.status}`)
    .join('\n')
    .concat(normalized.length > 0 ? '\n' : '')
}
