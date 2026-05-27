/* ── Logo : fallback texte si image absente ─────────────── */
const logoImg  = document.querySelector('.ester-nav-logo-img');
const logoText = document.querySelector('.ester-nav-logo-text');
if (logoImg) {
  logoImg.addEventListener('error', () => {
    logoImg.style.display = 'none';
    if (logoText) logoText.style.display = 'block';
  });
}

/* ── Scroll behavior ────────────────────────────────────── */
const header   = document.getElementById('site-header');
const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 40);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ── Overlay mobile ─────────────────────────────────────── */
const burger  = document.getElementById('nav-burger');
const overlay = document.getElementById('ester-nav-overlay');

function navSetOpen(open) {
  document.body.classList.toggle('ester-nav-open', open);
  burger.setAttribute('aria-expanded', String(open));
  const key = open ? 'nav.burger.close' : 'nav.burger.open';
  const fallback = open ? 'Fermer le menu' : 'Ouvrir le menu';
  const translated = window.getEsterTranslation ? window.getEsterTranslation(key) : fallback;
  const label = translated === key ? fallback : translated;
  burger.setAttribute('aria-label', label);
}

burger.addEventListener('click', () => navSetOpen(!document.body.classList.contains('ester-nav-open')));
overlay.querySelectorAll('a').forEach(link => link.addEventListener('click', () => navSetOpen(false)));
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && document.body.classList.contains('ester-nav-open')) {
    navSetOpen(false);
    burger.focus();
  }
});

/* ── Active link au scroll ──────────────────────────────── */
const sections   = document.querySelectorAll('main section[id]');
const navLinkEls = document.querySelectorAll('.nav-link');

const sectionObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navLinkEls.forEach(link =>
      link.classList.toggle('nav-link--active', link.getAttribute('href') === `#${entry.target.id}`)
    );
  });
}, { threshold: 0.4 });

sections.forEach(s => sectionObs.observe(s));
