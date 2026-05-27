import { beforeEach, describe, expect, it } from 'vitest';

let importCount = 0;
const i18nImports = [
  () => import('../../js/i18n.js?test=0'),
  () => import('../../js/i18n.js?test=1'),
  () => import('../../js/i18n.js?test=2'),
  () => import('../../js/i18n.js?test=3'),
  () => import('../../js/i18n.js?test=4'),
  () => import('../../js/i18n.js?test=5'),
  () => import('../../js/i18n.js?test=6'),
  () => import('../../js/i18n.js?test=7'),
  () => import('../../js/i18n.js?test=8'),
];

function setNavigatorLanguage(language, userLanguage = undefined) {
  Object.defineProperty(window.navigator, 'language', {
    value: language,
    configurable: true,
  });
  Object.defineProperty(window.navigator, 'userLanguage', {
    value: userLanguage,
    configurable: true,
  });
}

async function loadI18n() {
  await i18nImports[importCount++]();
}

function startI18n() {
  document.dispatchEvent(new Event('DOMContentLoaded'));
}

describe('i18n', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.lang = '';
    document.head.innerHTML = '';
    document.body.innerHTML = '';
    delete window.applyEsterTranslations;
    delete window.getEsterTranslation;
    setNavigatorLanguage('fr-FR');
  });

  it('applies text, html, placeholder, aria, title, and meta translations', async () => {
    localStorage.setItem('ester-lang', 'en');
    document.head.innerHTML = `
      <meta name="description" data-i18n-content="meta.home.description" content="old description">
    `;
    document.body.innerHTML = `
      <p data-i18n="nav.realisations">Ancien texte</p>
      <h1 data-i18n-html="hero.heading">Ancien titre</h1>
      <input data-i18n-placeholder="contact.email.placeholder" placeholder="ancien@email.fr">
      <button data-i18n-aria="nav.burger.open" aria-label="ancien label"></button>
      <iframe data-i18n-title="contact.map.title" title="ancienne carte"></iframe>
    `;

    await loadI18n();
    startI18n();

    expect(document.documentElement.lang).toBe('en');
    expect(document.querySelector('[data-i18n]').textContent).toBe('Projects');
    expect(document.querySelector('[data-i18n-html]').innerHTML).toBe(
      'Structural engineering<br>in Gap, <em>since 1977.</em>',
    );
    expect(document.querySelector('[data-i18n-placeholder]').placeholder).toBe('your@email.com');
    expect(document.querySelector('[data-i18n-aria]').getAttribute('aria-label')).toBe('Open menu');
    expect(document.querySelector('[data-i18n-title]').getAttribute('title')).toBe(
      'Google Maps — ESTER SAS, 3 bis avenue Maréchal Foch, 05000 Gap',
    );
    expect(document.querySelector('[data-i18n-content]').getAttribute('content')).toBe(
      'Structural engineering firm in Gap, Hautes-Alpes, since 1977. Concrete structural calculation, building diagnosis, site supervision. OPQIBI 1202.',
    );
    expect(localStorage.getItem('ester-lang')).toBe('en');
  });

  it('updates language buttons, localStorage, and translated DOM when a button is clicked', async () => {
    document.body.innerHTML = `
      <button class="nav-lang-btn is-active" data-lang="fr" aria-pressed="true">FR</button>
      <button class="nav-lang-btn" data-lang="en" aria-pressed="false">EN</button>
      <span data-i18n="contact.submit">Envoyer</span>
    `;

    await loadI18n();
    startI18n();
    document.querySelector('[data-lang="en"]').click();

    expect(document.documentElement.lang).toBe('en');
    expect(localStorage.getItem('ester-lang')).toBe('en');
    expect(document.querySelector('[data-i18n]').textContent).toBe('Send message');
    expect(document.querySelector('[data-lang="fr"]').classList.contains('is-active')).toBe(false);
    expect(document.querySelector('[data-lang="fr"]').getAttribute('aria-pressed')).toBe('false');
    expect(document.querySelector('[data-lang="en"]').classList.contains('is-active')).toBe(true);
    expect(document.querySelector('[data-lang="en"]').getAttribute('aria-pressed')).toBe('true');
  });

  it('uses a valid saved language before browser language', async () => {
    localStorage.setItem('ester-lang', 'en');
    setNavigatorLanguage('fr-FR');
    document.body.innerHTML = '<span data-i18n="footer.copy">old</span>';

    await loadI18n();
    startI18n();

    expect(document.documentElement.lang).toBe('en');
    expect(document.querySelector('[data-i18n]').textContent).toBe('ESTER SAS. All rights reserved.');
  });

  it('falls back to browser language when saved language is unknown', async () => {
    localStorage.setItem('ester-lang', 'de');
    setNavigatorLanguage('en-US');
    document.body.innerHTML = '<span data-i18n="contact.nom.label">old</span>';

    await loadI18n();
    startI18n();

    expect(document.documentElement.lang).toBe('en');
    expect(document.querySelector('[data-i18n]').textContent).toBe('Name');
    expect(localStorage.getItem('ester-lang')).toBe('en');
  });

  it('falls back to userLanguage when navigator.language is empty', async () => {
    setNavigatorLanguage('', 'en-GB');
    document.body.innerHTML = '<span data-i18n="contact.tel.label">old</span>';

    await loadI18n();
    startI18n();

    expect(document.documentElement.lang).toBe('en');
    expect(document.querySelector('[data-i18n]').textContent).toBe('Phone');
  });

  it('defaults to French when no saved or browser language is supported', async () => {
    setNavigatorLanguage('de-DE');
    document.body.innerHTML = '<span data-i18n="contact.email.label">old</span>';

    await loadI18n();
    startI18n();

    expect(document.documentElement.lang).toBe('fr');
    expect(document.querySelector('[data-i18n]').textContent).toBe('Email');
    expect(localStorage.getItem('ester-lang')).toBe('fr');
  });

  it('defaults to French when browser language values are empty', async () => {
    setNavigatorLanguage('', undefined);
    document.body.innerHTML = '<span data-i18n="contact.sujet.default">old</span>';

    await loadI18n();
    startI18n();

    expect(document.documentElement.lang).toBe('fr');
    expect(document.querySelector('[data-i18n]').textContent).toBe('Sélectionnez');
  });

  it('leaves unknown translation keys and unsupported language applications unchanged', async () => {
    document.body.innerHTML = `
      <p data-i18n="unknown.text">keep text</p>
      <div data-i18n-html="unknown.html"><strong>keep html</strong></div>
      <input data-i18n-placeholder="unknown.placeholder" placeholder="keep placeholder">
      <button data-i18n-aria="unknown.aria" aria-label="keep aria"></button>
      <iframe data-i18n-title="unknown.title" title="keep title"></iframe>
      <meta data-i18n-content="unknown.content" content="keep content">
    `;

    await loadI18n();
    startI18n();
    window.applyEsterTranslations('de');

    expect(document.documentElement.lang).toBe('fr');
    expect(document.querySelector('[data-i18n]').textContent).toBe('keep text');
    expect(document.querySelector('[data-i18n-html]').innerHTML).toBe('<strong>keep html</strong>');
    expect(document.querySelector('[data-i18n-placeholder]').placeholder).toBe('keep placeholder');
    expect(document.querySelector('[data-i18n-aria]').getAttribute('aria-label')).toBe('keep aria');
    expect(document.querySelector('[data-i18n-title]').getAttribute('title')).toBe('keep title');
    expect(document.querySelector('[data-i18n-content]').getAttribute('content')).toBe('keep content');
    expect(localStorage.getItem('ester-lang')).toBe('fr');
  });

  it('exposes lookup helpers with current language, explicit language, and key fallback', async () => {
    localStorage.setItem('ester-lang', 'en');
    document.body.innerHTML = '';

    await loadI18n();
    startI18n();

    expect(window.getEsterTranslation('nav.contact')).toBe('Contact us');
    expect(window.getEsterTranslation('nav.contact', 'fr')).toBe('Nous contacter');
    expect(window.getEsterTranslation('missing.key', 'fr')).toBe('missing.key');
    expect(window.getEsterTranslation('nav.contact', 'de')).toBe('nav.contact');
  });
});
