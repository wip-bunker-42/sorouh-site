export type SchemaCrumb = { label: string; href?: string }

export type SchemaContext = {
  origin: string
  canonical: string
  title: string
  description: string
  companyName: string
  phones: string[]
  areas: string[]
  breadcrumbs: SchemaCrumb[]
}

const absolute = (origin: string, path: string) => new URL(path, origin).href

export function buildBaseSchema(context: SchemaContext): Record<string, unknown>[] {
  const pageId = `${context.canonical}#webpage`
  const graph: Record<string, unknown>[] = [
    {
      '@type': 'WebSite',
      '@id': `${context.origin}/#website`,
      url: `${context.origin}/`,
      name: context.companyName,
      inLanguage: 'ar-SA',
      publisher: { '@id': `${context.origin}/#organization` },
    },
    {
      '@type': 'GeneralContractor',
      '@id': `${context.origin}/#organization`,
      name: context.companyName,
      url: `${context.origin}/`,
      logo: { '@type': 'ImageObject', url: `${context.origin}/brand/logo.png` },
      telephone: context.phones,
      areaServed: context.areas.map((name) => ({ '@type': 'City', name })),
    },
    {
      '@type': 'WebPage',
      '@id': pageId,
      url: context.canonical,
      name: context.title,
      description: context.description,
      inLanguage: 'ar-SA',
      isPartOf: { '@id': `${context.origin}/#website` },
      about: { '@id': `${context.origin}/#organization` },
    },
  ]

  if (context.breadcrumbs.length > 0) {
    const items = [{ label: 'الرئيسية', href: '/' }, ...context.breadcrumbs]
    graph.push({
      '@type': 'BreadcrumbList',
      '@id': `${context.canonical}#breadcrumb`,
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.label,
        item: item.href ? absolute(context.origin, item.href) : context.canonical,
      })),
    })
  }

  return graph
}

export function buildServiceSchema(input: {
  origin: string
  path: string
  name: string
  description: string
  areas: string[]
}): Record<string, unknown> {
  const url = absolute(input.origin, input.path)
  return {
    '@type': 'Service',
    '@id': `${url}#service`,
    url,
    name: input.name,
    description: input.description,
    provider: { '@id': `${input.origin}/#organization` },
    areaServed: input.areas.map((name) => ({ '@type': 'City', name })),
  }
}
