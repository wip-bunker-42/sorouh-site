import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
const paths = [
  '/',
  '/الخدمات/مقاولات-عامة/',
  '/مناطق-الخدمة/الدمام/',
  '/مشاريعنا/تأسيس-كهرباء-وسباكة-فيلا-الدمام/',
  '/المدونة/كيف-تختار-مقاول-في-الدمام/',
  '/اتصل-بنا/',
]
for (const path of paths)
  test(`semantic and accessible ${path}`, async ({ page }) => {
    await page.goto(path)
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar-SA')
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
    await expect(page.locator('.top a')).toHaveAttribute('dir', 'ltr')
    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.locator('main')).toHaveCount(1)
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    // The YouTube player is third-party markup; the iframe contract is tested separately below.
    const results = await new AxeBuilder({ page }).exclude('iframe').analyze()
    expect(
      results.violations.filter((v) => ['serious', 'critical'].includes(v.impact ?? '')),
    ).toEqual([])
  })
test('mobile menu and contact actions work', async ({ page, isMobile }) => {
  await page.goto('/')
  if (isMobile) {
    const button = page.getByRole('button', { name: 'فتح القائمة' })
    await button.click()
    await expect(button).toHaveAttribute('aria-expanded', 'true')
    await expect(page.locator('#main-nav')).toBeVisible()
  }
  await expect(page.locator('a[href^="tel:+966546121683"]')).not.toHaveCount(0)
  await expect(page.locator('a[href^="https://wa.me/966546121683"]')).not.toHaveCount(0)
})
test('contact events attribute the action to its landing page', async ({ page }) => {
  await page.addInitScript(() => {
    ;(window as any).dataLayer = []
    document.addEventListener(
      'click',
      (event) => {
        if ((event.target as Element | null)?.closest('[data-contact]')) event.preventDefault()
      },
      true,
    )
  })
  await page.goto('/الخدمات/مقاولات-عامة/')
  await page.locator('[data-contact-type="whatsapp"]:visible').first().click()
  const event = await page.evaluate(() =>
    (window as any).dataLayer?.find((item: any) => item.event === 'contact_click'),
  )
  expect(event).toMatchObject({
    event: 'contact_click',
    contact_type: 'whatsapp',
    page_path: '/الخدمات/مقاولات-عامة/',
    service_slug: 'مقاولات-عامة',
    area_slug: 'regional',
  })
})
test('article has toc shares CTAs and copy action', async ({ page }) => {
  await page.goto('/المدونة/كيف-تختار-مقاول-في-الدمام/')
  await expect(page.locator('.toc a')).toHaveCount(6)
  await expect(page.locator('.article-cta')).toHaveCount(2)
  await expect(page.getByRole('link', { name: 'واتساب', exact: true })).not.toHaveCount(0)
  await page.getByRole('button', { name: 'نسخ الرابط' }).click()
  await expect(page.locator('.share [aria-live="polite"]')).toContainText(/تم نسخ|تعذر النسخ/)
})
test('video is a real lazy iframe in HTML', async ({ page }) => {
  await page.goto('/مشاريعنا/بناء-ولياسة-مبنى-سكني-الشرقية/')
  const iframe = page.locator('iframe[src*="youtube-nocookie.com/embed/IK7jw0fu3zE"]')
  await expect(iframe).toHaveCount(1)
  await expect(iframe).toHaveAttribute('loading', 'lazy')
  await expect(iframe).toHaveAttribute('title', /فيديو/)
})
