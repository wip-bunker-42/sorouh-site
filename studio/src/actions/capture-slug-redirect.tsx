import { useToast } from '@sanity/ui'
import type {
  DocumentActionComponent,
  DocumentActionProps,
  DocumentActionsContext,
  SanityDocument,
} from 'sanity'

import { SANITY_API_VERSION } from '../constants'

export const ROUTE_PREFIXES = {
  service: '/الخدمات',
  serviceArea: '/مناطق-الخدمة',
  project: '/مشاريعنا',
  post: '/المدونة',
  category: '/المدونة/الفئات',
} as const

export type RoutedDocumentType = keyof typeof ROUTE_PREFIXES

type RedirectInput = {
  type: RoutedDocumentType
  publishedSlug?: string
  draftSlug?: string
  redirectFrom?: string[]
}

type CaptureInput = RedirectInput & {
  id: string
  getDocument: (id: string) => Promise<SanityDocument | undefined>
  patchDraft: (redirectFrom: string[]) => Promise<unknown>
  publish: () => unknown
}

function decodeOnce(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    throw new Error(`Unsafe slug: ${value}`)
  }
}

function normalizeExistingPath(path: string): string {
  if (!path.startsWith('/') || path === '/' || /[?#]/.test(path) || path.startsWith('//')) {
    throw new Error(`Unsafe redirect path: ${path}`)
  }
  const normalized = path.endsWith('/') ? path : `${path}/`
  return decodeOnce(normalized)
}

export function routeForSlug(type: RoutedDocumentType, slug: string): string {
  const decoded = decodeOnce(slug.trim())
  if (!decoded || decoded === '/' || /[/?#]/.test(decoded) || /^https?:/i.test(decoded)) {
    throw new Error(`Unsafe slug: ${slug}`)
  }
  return `${ROUTE_PREFIXES[type]}/${decoded}/`
}

export function buildRedirectFrom({
  type,
  publishedSlug,
  draftSlug,
  redirectFrom = [],
}: RedirectInput): string[] {
  const unique = [...new Set(redirectFrom.map(normalizeExistingPath))]
  if (!publishedSlug || !draftSlug || decodeOnce(publishedSlug) === decodeOnce(draftSlug)) {
    return unique
  }

  const oldPath = routeForSlug(type, publishedSlug)
  return unique.includes(oldPath) ? unique : [...unique, oldPath]
}

export async function captureSlugAndPublish({
  id,
  type,
  draftSlug,
  redirectFrom,
  getDocument,
  patchDraft,
  publish,
}: CaptureInput): Promise<void> {
  const published = await getDocument(id)
  const publishedSlug = (published?.slug as { current?: string } | undefined)?.current
  const nextRedirectFrom = buildRedirectFrom({
    type,
    publishedSlug,
    draftSlug,
    redirectFrom,
  })

  if (JSON.stringify(nextRedirectFrom) !== JSON.stringify(redirectFrom ?? [])) {
    await patchDraft(nextRedirectFrom)
  }

  await Promise.resolve(publish())
}

export function isRoutedDocumentType(type: string): type is RoutedDocumentType {
  return type in ROUTE_PREFIXES
}

export function createSlugAwarePublishAction(
  originalAction: DocumentActionComponent,
  context: Pick<DocumentActionsContext, 'getClient'>,
): DocumentActionComponent {
  const SlugAwarePublishAction = (props: DocumentActionProps) => {
    const originalResult = originalAction(props)
    const toast = useToast()

    if (!originalResult || !isRoutedDocumentType(props.type)) return originalResult

    const routedType = props.type
    const draft = props.draft as
      (SanityDocument & { slug?: { current?: string }; redirectFrom?: string[] }) | null

    return {
      ...originalResult,
      onHandle: async () => {
        try {
          const client = context.getClient({ apiVersion: SANITY_API_VERSION })
          await captureSlugAndPublish({
            id: props.id,
            type: routedType,
            draftSlug: draft?.slug?.current,
            redirectFrom: draft?.redirectFrom,
            getDocument: (id) => client.getDocument(id),
            patchDraft: (redirectFrom) =>
              client.patch(`drafts.${props.id}`).set({ redirectFrom }).commit(),
            publish: () => originalResult.onHandle?.(),
          })
        } catch (error) {
          toast.push({
            status: 'error',
            title: 'تعذر حفظ الرابط السابق',
            description: error instanceof Error ? error.message : 'خطأ غير متوقع',
          })
        }
      },
    }
  }

  SlugAwarePublishAction.action = 'publish' as const
  return SlugAwarePublishAction
}
