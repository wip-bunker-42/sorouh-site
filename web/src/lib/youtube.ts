export type YouTubeVideo = {
  id: string
  embedUrl: string
  thumbnailUrl: string
}

const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/

export function parseYouTubeUrl(value: string): YouTubeVideo | null {
  let url: URL
  try {
    url = new URL(value)
  } catch {
    return null
  }

  if (url.protocol !== 'https:' || url.searchParams.has('list')) return null
  const host = url.hostname.toLowerCase().replace(/^www\./, '')
  let id: string | undefined

  if (host === 'youtu.be') {
    id = url.pathname.split('/').filter(Boolean)[0]
  } else if (host === 'youtube.com' || host === 'm.youtube.com') {
    const segments = url.pathname.split('/').filter(Boolean)
    if (segments[0] === 'watch') id = url.searchParams.get('v') ?? undefined
    if (segments[0] === 'shorts' || segments[0] === 'embed') id = segments[1]
  }

  if (!id || !VIDEO_ID.test(id)) return null
  return {
    id,
    embedUrl: `https://www.youtube-nocookie.com/embed/${id}`,
    thumbnailUrl: `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
  }
}
