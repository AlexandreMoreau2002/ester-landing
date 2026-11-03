const MAP_SRC = 'https://www.google.com/maps?q=3+B+Avenue+Mar%C3%A9chal+Foch%2C+05000+Gap%2C+France&output=embed'

/* Carte Google Maps chargée uniquement après un clic explicite (consentement RGPD) */
export function initMapConsent() {
  const box = document.getElementById('map-consent')
  const btn = document.getElementById('map-consent-btn')
  if (!box || !btn) return

  btn.addEventListener('click', () => {
    const frame = document.createElement('iframe')
    frame.className = 'contact-map-frame'
    frame.src = MAP_SRC
    frame.loading = 'lazy'
    frame.referrerPolicy = 'no-referrer-when-downgrade'
    frame.allowFullscreen = true
    const t = window.getEsterTranslation ? window.getEsterTranslation('contact.map.title') : 'Google Maps'
    frame.title = t
    frame.setAttribute('data-i18n-title', 'contact.map.title')
    box.replaceWith(frame)
  })
}
