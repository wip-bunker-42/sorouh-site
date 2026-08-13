import { getCliClient } from 'sanity/cli'

import { parseYouTubeUrl } from '../web/src/lib/youtube'

const PROJECT_ID = 'ki7bs4vk'
const VERIFIED_UPLOAD_DATES: Record<string, string> = {
  IK7jw0fu3zE: '2026-08-12',
  esZBNafjbQw: '2026-08-12',
  H8w3JVB4P48: '2026-08-12',
  _8Y1ACr_tus: '2026-08-12',
}
const dryRun = process.env.SOROUH_VIDEO_MIGRATION_DRY_RUN === '1'
const client = getCliClient({ apiVersion: '2026-08-13' })
if (client.config().projectId !== PROJECT_ID) {
  throw new Error(`Refusing video migration outside Sanity project ${PROJECT_ID}`)
}

const projects = await client.fetch<
  Array<{ _id: string; _rev: string; videos?: Array<Record<string, any>> }>
>(`*[_type == "project" && count(videos) > 0]{_id, _rev, videos}`)
let changed = 0

for (const project of projects) {
  let documentChanged = false
  const videos = (project.videos ?? []).map((video) => {
    const parsed = typeof video.url === 'string' ? parseYouTubeUrl(video.url) : null
    const verifiedDate = parsed ? VERIFIED_UPLOAD_DATES[parsed.id] : undefined
    if (!verifiedDate || ![undefined, '2026-08-01'].includes(video.uploadDate)) return video
    documentChanged = true
    return { ...video, uploadDate: verifiedDate }
  })
  if (!documentChanged) continue
  changed += 1
  if (!dryRun) {
    await client.patch(project._id).ifRevisionId(project._rev).set({ videos }).commit()
  }
}

console.log(
  JSON.stringify({ projectId: PROJECT_ID, mode: dryRun ? 'dry-run' : 'apply', changed }, null, 2),
)
