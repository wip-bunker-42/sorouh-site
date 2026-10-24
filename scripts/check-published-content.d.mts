export const PUBLISHED_CONTENT_QUERY: string
export function contentDigest(documents: unknown): string
export function fetchBuildContent(
  client: { fetch(query: string): Promise<unknown> },
  snapshotQuery: string,
): Promise<{ snapshot: unknown; digest: string }>
export function checkPublishedContent(options?: {
  previousDigest?: string
  fetcher?: typeof fetch
}): Promise<{ digest: string; changed: boolean }>
