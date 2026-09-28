import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import { describe, expect, test } from 'vitest'

const script = readFileSync(new URL('../../../public/contact-events.js', import.meta.url), 'utf8')

function browserBoundary() {
  const listeners: Array<(event: { target: unknown }) => void> = []
  class Element {
    constructor(
      public dataset: Record<string, string>,
      public contact = true,
    ) {}
    closest(selector: string) {
      return selector === '[data-contact]' && this.contact ? this : null
    }
  }
  const window: Record<string, any> = {
    location: { pathname: '/الخدمات/جبس-بورد/الدمام/', search: '?phone=private' },
  }
  const document = {
    body: { dataset: { contactService: 'جبس-بورد', contactArea: 'الدمام' } },
    addEventListener(type: string, listener: (event: { target: unknown }) => void) {
      if (type === 'click') listeners.push(listener)
    },
  }
  return {
    window,
    document,
    Element,
    load() {
      runInNewContext(script, { window, document, Element })
    },
    click(type = 'whatsapp', contact = true) {
      const target = new Element(
        {
          contactType: type,
          contactLocation: 'local_service_hero',
          href: 'private-phone-and-message',
        },
        contact,
      )
      for (const listener of listeners) listener({ target })
    },
  }
}

describe('contact event browser boundary', () => {
  test('queues one click before asynchronous GTM initializes and includes service/city only', () => {
    const browser = browserBoundary()
    browser.load()
    browser.click()
    expect(browser.window.dataLayer).toEqual([
      {
        event: 'contact_click',
        contact_type: 'whatsapp',
        contact_location: 'local_service_hero',
        page_path: '/الخدمات/جبس-بورد/الدمام/',
        service_slug: 'جبس-بورد',
        area_slug: 'الدمام',
      },
    ])
    expect(JSON.stringify(browser.window.dataLayer)).not.toMatch(/private|phone=|href/)
  })

  test('does not register duplicate tracking when the script is loaded twice', () => {
    const browser = browserBoundary()
    browser.window.dataLayer = []
    browser.load()
    browser.load()
    browser.click('call')
    expect(browser.window.dataLayer).toHaveLength(1)
    expect(browser.window.dataLayer[0].contact_type).toBe('call')
  })

  test('ignores ordinary links and unrecognized contact types', () => {
    const browser = browserBoundary()
    browser.window.dataLayer = []
    browser.load()
    browser.click('whatsapp', false)
    browser.click('unknown')
    expect(browser.window.dataLayer).toHaveLength(0)
  })
})
