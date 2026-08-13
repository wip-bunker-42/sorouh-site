import GithubSlugger from 'github-slugger'

import { blockText } from './toc'

export type PortableNode = Record<string, any> & { _type: string; portableId?: string }

export function preparePortableText(value: PortableNode[] = []): PortableNode[] {
  const slugger = new GithubSlugger()
  return value.map((node) => {
    if (node._type !== 'block' || !['h2', 'h3'].includes(node.style)) return node
    if (node.portableId) return node
    return { ...node, portableId: slugger.slug(blockText(node)) }
  })
}
