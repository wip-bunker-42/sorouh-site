type NamedRoute = { slug?: string; title?: string }
type ContactSnapshot = {
  services: NamedRoute[]
  areas: NamedRoute[]
  serviceAreaLandings: Array<{
    [key: string]: unknown
    service?: NamedRoute
    serviceArea?: NamedRoute
  }>
}
export type ContactContext = { message: string; serviceSlug?: string; areaSlug?: string }

const genericMessage = 'السلام عليكم، أحتاج الاستفسار عن خدمات المقاولات. مدينة المشروع: '

export function contactContextForPath(pathname: string, data: ContactSnapshot): ContactContext {
  let path: string
  try {
    path = decodeURIComponent(pathname.split(/[?#]/, 1)[0] ?? '')
  } catch {
    return { message: genericMessage }
  }
  const parts = path.split('/').filter(Boolean)
  if (parts[0] === 'الخدمات' && parts.length === 3) {
    const landing = data.serviceAreaLandings.find(
      (item) => item.service?.slug === parts[1] && item.serviceArea?.slug === parts[2],
    )
    if (landing?.service?.title && landing.serviceArea?.title)
      return {
        message: `السلام عليكم، أحتاج الاستفسار عن ${landing.service.title} في ${landing.serviceArea.title}. نوع العمل والمساحة: `,
        serviceSlug: landing.service.slug,
        areaSlug: landing.serviceArea.slug,
      }
  }
  if (parts[0] === 'الخدمات' && parts.length === 2) {
    const service = data.services.find((item) => item.slug === parts[1])
    if (service?.title)
      return {
        message: `السلام عليكم، أحتاج الاستفسار عن ${service.title}. مدينة المشروع ونوع العمل: `,
        serviceSlug: service.slug,
      }
  }
  if (parts[0] === 'مناطق-الخدمة' && parts.length === 2) {
    const area = data.areas.find((item) => item.slug === parts[1])
    if (area?.title)
      return {
        message: `السلام عليكم، أحتاج الاستفسار عن أعمال المقاولات في ${area.title}. نوع العمل: `,
        areaSlug: area.slug,
      }
  }
  return { message: genericMessage }
}
