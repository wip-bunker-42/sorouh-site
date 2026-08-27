import { defineQuery } from 'groq'

const IMAGE_FIELDS = /* groq */ `
  _type,
  _key,
  alt,
  caption,
  crop,
  hotspot,
  asset->{
    _id,
    url,
    metadata{
      lqip,
      dimensions{width, height, aspectRatio}
    }
  }
`

const SEO_FIELDS = /* groq */ `
  metaTitle,
  metaDescription,
  noIndex,
  canonicalOverride,
  shareImage{${IMAGE_FIELDS}}
`

const PORTABLE_TEXT_FIELDS = /* groq */ `
  _key,
  _type,
  style,
  listItem,
  level,
  markDefs,
  children,
  _type == "contentImage" => {${IMAGE_FIELDS}},
  _type == "cta" => {headline, body, action, label},
  _type == "youtubeVideo" => {url, title, description, uploadDate, duration}
`

export const SITE_SNAPSHOT_QUERY = defineQuery(/* groq */ `{
  "siteSettings": *[_type == "siteSettings" && _id == "siteSettings"][0]{
    _id, _type, _updatedAt,
    companyName, shortName, tagline,
    logo{${IMAGE_FIELDS}},
    primaryPhone, backupPhone, availability, rssAuthorEmail,
    stats[]{_key, value, label},
    defaultShareImage{${IMAGE_FIELDS}},
    seo{${SEO_FIELDS}}
  },
  "homePage": *[_type == "homePage" && _id == "homePage"][0]{
    _id, _type, _updatedAt,
    heroEyebrow, heroTitle, heroSummary, heroImage{${IMAGE_FIELDS}},
    introduction[]{${PORTABLE_TEXT_FIELDS}},
    featuredServices[]->{_id, title, "slug": slug.current},
    featuredProjects[]->{_id, title, "slug": slug.current},
    closingCta{headline, body, action, label},
    seo{${SEO_FIELDS}}
  },
  "aboutPage": *[_type == "aboutPage" && _id == "aboutPage"][0]{
    _id, _type, _updatedAt,
    title, lead, body[]{${PORTABLE_TEXT_FIELDS}},
    values[]{_key, title, description}, image{${IMAGE_FIELDS}}, seo{${SEO_FIELDS}}
  },
  "contactPage": *[_type == "contactPage" && _id == "contactPage"][0]{
    _id, _type, _updatedAt,
    title, lead, contactPoints[]{_key, headline, body, action, label},
    serviceAreaIntro, faqs[]{_key, question, answer}, seo{${SEO_FIELDS}}
  },
  "services": *[_type == "service"] | order(title asc){
    _id, _type, _updatedAt, title, "slug": slug.current, summary,
    heroImage{${IMAGE_FIELDS}}, body[]{${PORTABLE_TEXT_FIELDS}},
    deliverables, process, faqs[]{_key, question, answer},
    seo{${SEO_FIELDS}}, redirectFrom
  },
  "areas": *[_type == "serviceArea"] | order(title asc){
    _id, _type, _updatedAt, title, "slug": slug.current, summary,
    intro[]{${PORTABLE_TEXT_FIELDS}},
    featuredServices[]->{_id, title, "slug": slug.current},
    image{${IMAGE_FIELDS}}, faqs[]{_key, question, answer},
    seo{${SEO_FIELDS}}, redirectFrom
  },
  "serviceAreaLandings": *[_type == "serviceAreaLanding"] | order(title asc){
    _id, _type, _updatedAt, title, summary,
    service->{_id, title, "slug": slug.current},
    serviceArea->{_id, title, "slug": slug.current},
    heroImage{${IMAGE_FIELDS}}, intro[]{${PORTABLE_TEXT_FIELDS}},
    deliverables, process, faqs[]{_key, question, answer},
    seo{${SEO_FIELDS}}, redirectFrom
  },
  "projects": *[_type == "project"] | order(featured desc, _updatedAt desc){
    _id, _type, _updatedAt, sourceKey, title, "slug": slug.current, summary,
    classification, workDescription[]{${PORTABLE_TEXT_FIELDS}}, scope, stages, result,
    services[]->{_id, title, "slug": slug.current},
    serviceArea->{_id, title, "slug": slug.current},
    gallery[]{${IMAGE_FIELDS}},
    videos[]{_key, _type, url, title, description, uploadDate, duration},
    featured,
    relatedProjects[]->{_id, title, "slug": slug.current},
    seo{${SEO_FIELDS}}, redirectFrom
  },
  "categories": *[_type == "category"] | order(title asc){
    _id, _type, _updatedAt, title, "slug": slug.current, description,
    seo{${SEO_FIELDS}}, redirectFrom
  },
  "posts": *[_type == "post"] | order(publishedAt desc, _id asc){
    _id, _type, _updatedAt, title, "slug": slug.current, excerpt,
    featuredImage{${IMAGE_FIELDS}}, body[]{${PORTABLE_TEXT_FIELDS}},
    category->{_id, title, "slug": slug.current},
    serviceArea->{_id, title, "slug": slug.current},
    relatedServices[]->{_id, title, "slug": slug.current},
    relatedPosts[]->{_id, title, "slug": slug.current},
    publishedAt, author, articleCta{headline, body, action, label},
    seo{${SEO_FIELDS}}, redirectFrom
  },
  "redirects": *[_type == "redirect"] | order(source asc){
    _id, _type, _updatedAt, source, destination, status, note
  }
}`)
