import { aboutPage } from './documents/aboutPage'
import { category } from './documents/category'
import { contactPage } from './documents/contactPage'
import { homePage } from './documents/homePage'
import { post } from './documents/post'
import { project } from './documents/project'
import { redirect } from './documents/redirect'
import { service } from './documents/service'
import { serviceArea } from './documents/serviceArea'
import { serviceAreaLanding } from './documents/serviceAreaLanding'
import { siteSettings } from './documents/siteSettings'
import { contentImage } from './objects/contentImage'
import { cta } from './objects/cta'
import { faqItem } from './objects/faqItem'
import { portableText } from './objects/portableText'
import { seo } from './objects/seo'
import { stat } from './objects/stat'
import { youtubeVideo } from './objects/youtubeVideo'

export const schemaTypes = [
  seo,
  contentImage,
  faqItem,
  cta,
  stat,
  youtubeVideo,
  portableText,
  siteSettings,
  homePage,
  aboutPage,
  contactPage,
  service,
  serviceArea,
  serviceAreaLanding,
  project,
  category,
  post,
  redirect,
]
