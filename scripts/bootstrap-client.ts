import { getCliClient } from 'sanity/cli'

const client = getCliClient({ apiVersion: '2026-08-13' })
const skeletons = [
  { _id: 'siteSettings', _type: 'siteSettings' },
  { _id: 'homePage', _type: 'homePage' },
  { _id: 'aboutPage', _type: 'aboutPage' },
  { _id: 'contactPage', _type: 'contactPage' },
]
const existing = new Set(
  await client.fetch<string[]>(`*[_id in $ids]._id`, { ids: skeletons.map((item) => item._id) }),
)
const transaction = client.transaction()
for (const document of skeletons) if (!existing.has(document._id)) transaction.create(document)
if (skeletons.some((document) => !existing.has(document._id))) await transaction.commit()
console.log(
  `Neutral client bootstrap complete; preserved ${existing.size}, created ${skeletons.length - existing.size}.`,
)
