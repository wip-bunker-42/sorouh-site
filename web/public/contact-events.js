document.addEventListener('click', function (event) {
  var target = event.target instanceof Element ? event.target.closest('[data-contact]') : null
  if (!target || !window.dataLayer) return
  window.dataLayer.push({
    event: 'contact_click',
    contact_type: target.dataset.contactType,
    contact_location: target.dataset.contactLocation,
    page_path: window.location.pathname,
  })
})
