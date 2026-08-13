import { mkdir } from 'node:fs/promises'

import { test } from '@playwright/test'

const pages = {
  home: '/',
  services: '/الخدمات/',
  plastering: '/الخدمات/اعمال-اللياسة/',
  screed: '/الخدمات/صبة-مروحة-وصبة-ميول/',
  electrical: '/الخدمات/اعمال-الكهرباء/',
  painting: '/الخدمات/دهانات-داخلية-وخارجية/',
  dammam: '/مناطق-الخدمة/الدمام/',
  concreteArticle: '/المدونة/الفرق-بين-قص-الخرسانة-والكور/',
  buildingProject: '/مشاريعنا/بناء-ولياسة-مبنى-سكني-الشرقية/',
  about: '/من-نحن/',
}

const generatedPlacements = [
  ['/', 'موقع إنشاء فيلا حديثة تنفذ فيه أعمال المقاولات العامة في المنطقة الشرقية'],
  ['/من-نحن/', 'فريق إشراف مقاولات يراجع مخططات التنفيذ داخل موقع سكني'],
  ['/الخدمات/مقاولات-عامة/', 'تنفيذ متكامل لأعمال مقاولات في مشروع فيلا سكنية بالشرقية'],
  ['/الخدمات/تشطيب-منازل-وفلل/', 'تشطيبات داخلية متكاملة لفيلا حديثة بخامات متناسقة'],
  ['/الخدمات/مقاول-بناء/', 'مقاول بناء يشرف على تنفيذ الهيكل الإنشائي لفيلا سكنية'],
  ['/الخدمات/اعمال-اللياسة/', 'تنفيذ اللياسة وضبط استقامة جدار خارجي في مبنى سكني'],
  ['/الخدمات/صبة-مروحة-وصبة-ميول/', 'تنعيم صبة خرسانية بالمروحية داخل ساحة مشروع واسعة'],
  ['/الخدمات/دهانات-داخلية-وخارجية/', 'تنفيذ دهانات داخلية دقيقة في فيلا حديثة بالمنطقة الشرقية'],
  ['/مناطق-الخدمة/الدمام/', 'خدمات المقاولات للمنازل والفلل في الدمام'],
  ['/مناطق-الخدمة/الجبيل/', 'خدمات المقاولات للمنازل والفلل في الجبيل'],
  ['/مناطق-الخدمة/الاحساء/', 'خدمات المقاولات للمنازل والفلل في الأحساء'],
  [
    '/المدونة/الفرق-بين-قص-الخرسانة-والكور/',
    'مقارنة بصرية بين قص الخرسانة بالمنشار وتنفيذ فتحة كور',
  ],
] as const

test('discloses every generated editorial image in visible HTML', async ({ page }) => {
  for (const [path, alt] of generatedPlacements) {
    await page.goto(path)
    const figure = page.locator('figure', { has: page.locator(`img[alt="${alt}"]`) })
    await test.expect(figure).toHaveCount(1)
    await test.expect(figure.locator('figcaption')).toContainText('صورة توضيحية')
  }
})

test('capture semantic media audit', async ({ page }, testInfo) => {
  test.setTimeout(120_000)
  const output = testInfo.outputPath('visual-audit')
  await mkdir(output, { recursive: true })

  for (const [name, path] of Object.entries(pages)) {
    await page.goto(path)
    const images = page.locator('img')
    for (let index = 0; index < (await images.count()); index += 1) {
      const image = images.nth(index)
      await image.scrollIntoViewIfNeeded()
      await image.evaluate((element) => {
        const imageElement = element as HTMLImageElement
        return imageElement.complete && imageElement.naturalWidth > 0
          ? undefined
          : new Promise<void>((resolve, reject) => {
              imageElement.addEventListener('load', () => resolve(), { once: true })
              imageElement.addEventListener(
                'error',
                () => reject(new Error(imageElement.currentSrc)),
                { once: true },
              )
            })
      })
    }
    await page.evaluate(() => scrollTo(0, 0))
    const brokenImages = await page
      .locator('img')
      .evaluateAll((images) =>
        (images as HTMLImageElement[])
          .filter((image) => !image.complete || image.naturalWidth === 0)
          .map((image) => ({ src: image.currentSrc || image.src, alt: image.alt })),
      )
    if (brokenImages.length > 0) {
      throw new Error(`${path}: ${JSON.stringify(brokenImages)}`)
    }
    await page.screenshot({
      path: `${output}/${name}-${testInfo.project.name}.png`,
      fullPage: true,
    })
  }
})
