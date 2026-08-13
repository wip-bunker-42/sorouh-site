import { BookIcon } from '@sanity/icons/Book'
import { CogIcon } from '@sanity/icons/Cog'
import { ControlsIcon } from '@sanity/icons/Controls'
import { DocumentTextIcon } from '@sanity/icons/DocumentText'
import { HomeIcon } from '@sanity/icons/Home'
import { InfoOutlineIcon } from '@sanity/icons/InfoOutline'
import { PinIcon } from '@sanity/icons/Pin'
import { ProjectsIcon } from '@sanity/icons/Projects'
import { TagIcon } from '@sanity/icons/Tag'
import { WrenchIcon } from '@sanity/icons/Wrench'
import type { ComponentType } from 'react'
import type { StructureResolver } from 'sanity/structure'

import { SINGLETON_IDS } from '../constants'

const singletonItem = (
  S: Parameters<StructureResolver>[0],
  type: keyof typeof SINGLETON_IDS,
  title: string,
  icon: ComponentType,
) =>
  S.listItem()
    .title(title)
    .icon(icon)
    .child(S.document().schemaType(type).documentId(SINGLETON_IDS[type]).title(title))

export const structure: StructureResolver = (S) =>
  S.list()
    .title('إدارة محتوى صروح الشرقية')
    .items([
      S.listItem()
        .title('الإعدادات والصفحات')
        .icon(CogIcon)
        .child(
          S.list()
            .title('الإعدادات والصفحات')
            .items([
              singletonItem(S, 'siteSettings', 'إعدادات الموقع', CogIcon),
              singletonItem(S, 'homePage', 'الصفحة الرئيسية', HomeIcon),
              singletonItem(S, 'aboutPage', 'من نحن', InfoOutlineIcon),
              singletonItem(S, 'contactPage', 'اتصل بنا', BookIcon),
            ]),
        ),
      S.divider(),
      S.documentTypeListItem('service').title('الخدمات').icon(ControlsIcon),
      S.documentTypeListItem('serviceArea').title('مناطق الخدمة').icon(PinIcon),
      S.documentTypeListItem('project').title('المشاريع').icon(ProjectsIcon),
      S.listItem()
        .title('المدونة')
        .icon(DocumentTextIcon)
        .child(
          S.list()
            .title('المدونة')
            .items([
              S.documentTypeListItem('post').title('المقالات').icon(DocumentTextIcon),
              S.documentTypeListItem('category').title('فئات المقالات').icon(TagIcon),
            ]),
        ),
      S.divider(),
      S.listItem()
        .title('أدوات المطور')
        .icon(WrenchIcon)
        .child(
          S.list()
            .title('أدوات المطور')
            .items([S.documentTypeListItem('redirect').title('تحويلات المسارات الداخلية')]),
        ),
    ])
