import GithubSlugger from 'github-slugger'

export type TocItem = {
  level: 2 | 3
  text: string
  id: string
}

type PortableBlock = {
  _type?: string
  style?: string
  children?: Array<{ _type?: string; _key?: string; text?: string }>
}

export function blockText(block: PortableBlock): string {
  return (block.children ?? [])
    .map((child) => child.text ?? '')
    .join('')
    .trim()
}

export function extractToc(blocks: PortableBlock[]): TocItem[] {
  const slugger = new GithubSlugger()
  const items: TocItem[] = []

  for (const block of blocks) {
    if (block._type !== 'block' || (block.style !== 'h2' && block.style !== 'h3')) continue
    const text = blockText(block)
    if (!text) continue
    items.push({
      level: block.style === 'h2' ? 2 : 3,
      text,
      id: slugger.slug(text),
    })
  }

  return items
}
