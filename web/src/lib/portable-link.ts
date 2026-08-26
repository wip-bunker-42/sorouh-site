export type PortableLinkNode = {
  markDef?: {
    href?: string
    openInNewTab?: boolean
  }
}

export function getPortableLinkAttributes(node?: PortableLinkNode) {
  return {
    href: node?.markDef?.href ?? '#',
    external: node?.markDef?.openInNewTab === true,
  }
}
