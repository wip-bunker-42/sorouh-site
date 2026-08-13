;(function (w, d, s, l) {
  var current = d.currentScript
  var id = current && current.dataset.gtmId
  if (!id) return
  w[l] = w[l] || []
  w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' })
  var first = d.getElementsByTagName(s)[0]
  var tag = d.createElement(s)
  tag.async = true
  tag.src = 'https://www.googletagmanager.com/gtm.js?id=' + id
  first.parentNode.insertBefore(tag, first)
})(window, document, 'script', 'dataLayer')
