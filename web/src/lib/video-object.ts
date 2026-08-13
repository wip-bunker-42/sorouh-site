import { parseYouTubeUrl } from './youtube'

type YouTubeMetadata = {
  url?: string
  title?: string
  description?: string
  uploadDate?: string
  duration?: string
}

export function videoObjectFromYouTube(video: YouTubeMetadata): Record<string, unknown> | null {
  if (!video.url || !video.title || !video.description || !video.uploadDate) return null
  const parsed = parseYouTubeUrl(video.url)
  if (!parsed) return null
  return {
    '@type': 'VideoObject',
    name: video.title,
    description: video.description,
    thumbnailUrl: parsed.thumbnailUrl,
    uploadDate: video.uploadDate,
    embedUrl: `https://www.youtube.com/embed/${parsed.id}`,
    ...(video.duration ? { duration: video.duration } : {}),
  }
}
