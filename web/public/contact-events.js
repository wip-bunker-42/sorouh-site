;(function () {
  if (window.__sorouhContactTracking) return
  window.__sorouhContactTracking = true
  window.dataLayer = window.dataLayer || []
  document.addEventListener('click', function (event) {
    var target = event.target instanceof Element ? event.target.closest('[data-contact]') : null
    if (!target || !/^(call|whatsapp)$/.test(target.dataset.contactType || '')) return
    var path = window.location.pathname
    try {
      path = decodeURIComponent(path)
    } catch (_) {}
    window.dataLayer.push({
      event: 'contact_click',
      contact_type: target.dataset.contactType,
      contact_location: target.dataset.contactLocation || 'unknown',
      page_path: path,
      service_slug: document.body.dataset.contactService || 'general',
      area_slug: document.body.dataset.contactArea || 'regional',
    })
  })
})()
