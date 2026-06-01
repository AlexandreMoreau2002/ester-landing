import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

let importId = 0;
const importFresh = moduleName => import(/* @vite-ignore */ `../../js/${moduleName}.js?test=${importId += 1}`);
const importRootFresh = modulePath => import(/* @vite-ignore */ `../../${modulePath}?test=${importId += 1}`);

function setBody(html) {
  document.body.innerHTML = html;
}

function setWindowNumber(name, value) {
  Object.defineProperty(window, name, {
    configurable: true,
    value,
    writable: true,
  });
}

class MockIntersectionObserver {
  static instances = [];

  constructor(callback, options) {
    this.callback = callback;
    this.options = options;
    this.observed = [];
    this.unobserve = vi.fn(target => {
      this.observed = this.observed.filter(el => el !== target);
    });
    MockIntersectionObserver.instances.push(this);
  }

  observe(target) {
    this.observed.push(target);
  }
}

describe('DOM behavior modules', () => {
  beforeEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    document.body.className = '';
    document.body.innerHTML = '';
    delete window.getEsterTranslation;
    MockIntersectionObserver.instances = [];
    window.IntersectionObserver = MockIntersectionObserver;
    globalThis.IntersectionObserver = MockIntersectionObserver;
    window.scrollTo = vi.fn();
    Element.prototype.scrollIntoView = vi.fn();
    setWindowNumber('scrollY', 0);
    setWindowNumber('innerWidth', 1200);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    document.body.className = '';
    document.body.innerHTML = '';
    delete window.getEsterTranslation;
    MockIntersectionObserver.instances = [];
  });

  describe('contact.js', () => {
    it('focuses the first invalid field without submitting', async () => {
      setBody(`
        <form id="contact-form">
          <input id="email" required>
          <button id="form-submit" type="submit">
            <span class="form-submit-label">Envoyer</span>
            <span class="form-submit-loading" hidden>Chargement</span>
          </button>
          <p id="form-success" hidden>Merci</p>
        </form>
      `);

      const form = document.getElementById('contact-form');
      const input = document.getElementById('email');
      const submitBtn = document.getElementById('form-submit');
      input.focus = vi.fn();
      form.checkValidity = vi.fn(() => false);
      form.querySelector = vi.fn(selector => (selector === ':invalid' ? input : null));

      await importFresh('contact');
      const event = new Event('submit', { bubbles: true, cancelable: true });
      form.dispatchEvent(event);

      expect(event.defaultPrevented).toBe(true);
      expect(form.classList.contains('was-validated')).toBe(true);
      expect(input.focus).toHaveBeenCalledOnce();
      expect(submitBtn.disabled).toBe(false);
    });

    it('returns quietly when an invalid form has no focusable invalid field', async () => {
      setBody(`
        <form id="contact-form">
          <button id="form-submit" type="submit">
            <span class="form-submit-label">Envoyer</span>
            <span class="form-submit-loading" hidden>Chargement</span>
          </button>
          <p id="form-success" hidden>Merci</p>
        </form>
      `);

      const form = document.getElementById('contact-form');
      const submitBtn = document.getElementById('form-submit');
      form.checkValidity = vi.fn(() => false);
      form.querySelector = vi.fn(() => null);

      await importFresh('contact');
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

      expect(form.classList.contains('was-validated')).toBe(true);
      expect(submitBtn.disabled).toBe(false);
    });

    it('shows loading state, resets the form, and reveals success after a valid submit', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
      setBody(`
        <form id="contact-form">
          <input name="name" value="Alex">
          <button id="form-submit" type="submit">
            <span class="form-submit-label">Envoyer</span>
            <span class="form-submit-loading" hidden>Chargement</span>
          </button>
          <p id="form-success" hidden>Merci</p>
          <p id="form-error" hidden>Erreur</p>
        </form>
      `);

      const form = document.getElementById('contact-form');
      const submitBtn = document.getElementById('form-submit');
      const label = submitBtn.querySelector('.form-submit-label');
      const loading = submitBtn.querySelector('.form-submit-loading');
      const successMsg = document.getElementById('form-success');
      form.checkValidity = vi.fn(() => true);
      const reset = vi.spyOn(form, 'reset');

      await importFresh('contact');
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

      expect(submitBtn.disabled).toBe(true);
      expect(label.hidden).toBe(true);
      expect(loading.hidden).toBe(false);

      await Promise.resolve();
      await Promise.resolve();

      expect(reset).toHaveBeenCalledOnce();
      expect(form.classList.contains('was-validated')).toBe(false);
      expect(submitBtn.hidden).toBe(true);
      expect(successMsg.hidden).toBe(false);
      expect(successMsg.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'nearest' });
    });

    it('re-enables the button and shows error message when fetch fails', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, statusText: 'Internal Server Error' }));
      setBody(`
        <form id="contact-form">
          <input name="name" value="Alex">
          <button id="form-submit" type="submit">
            <span class="form-submit-label">Envoyer</span>
            <span class="form-submit-loading" hidden>Chargement</span>
          </button>
          <p id="form-success" hidden>Merci</p>
          <p id="form-error" hidden>Erreur</p>
        </form>
      `);

      const form = document.getElementById('contact-form');
      const submitBtn = document.getElementById('form-submit');
      const label = submitBtn.querySelector('.form-submit-label');
      const loading = submitBtn.querySelector('.form-submit-loading');
      const errorMsg = document.getElementById('form-error');
      form.checkValidity = vi.fn(() => true);

      await importFresh('contact');
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

      await Promise.resolve();
      await Promise.resolve();

      expect(submitBtn.disabled).toBe(false);
      expect(label.hidden).toBe(false);
      expect(loading.hidden).toBe(true);
      expect(errorMsg.hidden).toBe(false);
    });

    it('re-enables the button when fetch throws a network error', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
      setBody(`
        <form id="contact-form">
          <input name="name" value="Alex">
          <button id="form-submit" type="submit">
            <span class="form-submit-label">Envoyer</span>
            <span class="form-submit-loading" hidden>Chargement</span>
          </button>
          <p id="form-success" hidden>Merci</p>
          <p id="form-error" hidden>Erreur</p>
        </form>
      `);

      const form = document.getElementById('contact-form');
      const submitBtn = document.getElementById('form-submit');
      const label = submitBtn.querySelector('.form-submit-label');
      const loading = submitBtn.querySelector('.form-submit-loading');
      const errorMsg = document.getElementById('form-error');
      form.checkValidity = vi.fn(() => true);

      await importFresh('contact');
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

      await Promise.resolve();
      await Promise.resolve();

      expect(submitBtn.disabled).toBe(false);
      expect(label.hidden).toBe(false);
      expect(loading.hidden).toBe(true);
      expect(errorMsg.hidden).toBe(false);
    });

    it('handles error gracefully when form-success element is absent', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, statusText: 'Bad Gateway' }));
      setBody(`
        <form id="contact-form">
          <input name="name" value="Alex">
          <button id="form-submit" type="submit">
            <span class="form-submit-label">Envoyer</span>
            <span class="form-submit-loading" hidden>Chargement</span>
          </button>
          <p id="form-error" hidden>Erreur</p>
        </form>
      `);

      const form = document.getElementById('contact-form');
      const submitBtn = document.getElementById('form-submit');
      const label = submitBtn.querySelector('.form-submit-label');
      const loading = submitBtn.querySelector('.form-submit-loading');
      const errorMsg = document.getElementById('form-error');
      form.checkValidity = vi.fn(() => true);

      await importFresh('contact');
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

      await Promise.resolve();
      await Promise.resolve();

      expect(submitBtn.disabled).toBe(false);
      expect(label.hidden).toBe(false);
      expect(loading.hidden).toBe(true);
      expect(errorMsg.hidden).toBe(false);
    });

    it('handles error gracefully when form-error element is absent', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, statusText: 'Bad Gateway' }));
      setBody(`
        <form id="contact-form">
          <input name="name" value="Alex">
          <button id="form-submit" type="submit">
            <span class="form-submit-label">Envoyer</span>
            <span class="form-submit-loading" hidden>Chargement</span>
          </button>
          <p id="form-success" hidden>Merci</p>
        </form>
      `);

      const form = document.getElementById('contact-form');
      const submitBtn = document.getElementById('form-submit');
      const label = submitBtn.querySelector('.form-submit-label');
      const loading = submitBtn.querySelector('.form-submit-loading');
      form.checkValidity = vi.fn(() => true);

      await importFresh('contact');
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

      await Promise.resolve();
      await Promise.resolve();

      expect(submitBtn.disabled).toBe(false);
      expect(label.hidden).toBe(false);
      expect(loading.hidden).toBe(true);
    });

    it('syncs the human-readable label to the hidden sujet_label field on select change', async () => {
      setBody(`
        <form id="contact-form">
          <select id="contact-sujet" name="sujet">
            <option value="" disabled selected>Sélectionnez</option>
            <option value="faisabilite">Étude de faisabilité</option>
          </select>
          <input type="hidden" id="sujet-label" name="sujet_label">
          <button id="form-submit" type="submit">
            <span class="form-submit-label">Envoyer</span>
            <span class="form-submit-loading" hidden>Chargement</span>
          </button>
        </form>
      `);

      await importFresh('contact');

      const select = document.getElementById('contact-sujet');
      const hiddenInput = document.getElementById('sujet-label');

      select.selectedIndex = 1;
      select.dispatchEvent(new Event('change'));
      expect(hiddenInput.value).toBe('Étude de faisabilité');

      select.selectedIndex = -1;
      select.dispatchEvent(new Event('change'));
      expect(hiddenInput.value).toBe('');
    });

    it('does not crash when the select or sujet-label input is absent', async () => {
      setBody(`
        <form id="contact-form">
          <select id="contact-sujet" name="sujet">
            <option value="autre">Autre</option>
          </select>
          <button id="form-submit" type="submit">
            <span class="form-submit-label">Envoyer</span>
            <span class="form-submit-loading" hidden>Chargement</span>
          </button>
        </form>
      `);

      await expect(importFresh('contact')).resolves.toBeDefined();
    });

    it('does nothing when the contact form is absent', async () => {
      setBody('<main></main>');

      await expect(importFresh('contact')).resolves.toBeDefined();
    });
  });

  describe('mountains.js', () => {
    it('sets and updates the mountain SVG viewBox across breakpoints', async () => {
      setBody('<div class="ester-mountains"><svg></svg></div>');
      const svg = document.querySelector('svg');

      setWindowNumber('innerWidth', 480);
      await importFresh('mountains');
      expect(svg.getAttribute('viewBox')).toBe('480 0 620 396');

      window.innerWidth = 900;
      window.dispatchEvent(new Event('resize'));
      expect(svg.getAttribute('viewBox')).toBe('0 0 1080 396');

      window.innerWidth = 1200;
      window.dispatchEvent(new Event('resize'));
      expect(svg.getAttribute('viewBox')).toBe('0 0 1400 396');
    });

    it('does nothing when the mountain SVG is absent', async () => {
      setBody('<main></main>');

      await expect(importFresh('mountains')).resolves.toBeDefined();
    });
  });

  describe('nav.js', () => {
    function renderNav() {
      setBody(`
        <header id="site-header"></header>
        <img class="ester-nav-logo-img" alt="Ester">
        <span class="ester-nav-logo-text" style="display: none">Ester</span>
        <button id="nav-burger" aria-expanded="false"></button>
        <nav id="ester-nav-overlay">
          <a class="nav-link" href="#home">Accueil</a>
          <a class="nav-link" href="#services">Services</a>
        </nav>
        <main>
          <section id="home"></section>
          <section id="services"></section>
        </main>
      `);
    }

    it('handles logo fallback, header/menu state, Escape close, and active links', async () => {
      renderNav();
      window.getEsterTranslation = vi.fn(key => ({
        'nav.burger.close': 'Close',
        'nav.burger.open': 'Open',
      })[key] ?? key);
      const logoImg = document.querySelector('.ester-nav-logo-img');
      const logoText = document.querySelector('.ester-nav-logo-text');
      const header = document.getElementById('site-header');
      const burger = document.getElementById('nav-burger');

      await importFresh('nav');

      logoImg.dispatchEvent(new Event('error'));
      expect(logoImg.style.display).toBe('none');
      expect(logoText.style.display).toBe('block');

      expect(header.classList.contains('is-scrolled')).toBe(false);
      window.scrollY = 41;
      window.dispatchEvent(new Event('scroll'));
      expect(header.classList.contains('is-scrolled')).toBe(true);

      burger.click();
      expect(document.body.classList.contains('ester-nav-open')).toBe(true);
      expect(burger.getAttribute('aria-expanded')).toBe('true');
      expect(burger.getAttribute('aria-label')).toBe('Close');

      document.querySelector('#ester-nav-overlay a').click();
      expect(document.body.classList.contains('ester-nav-open')).toBe(false);
      expect(burger.getAttribute('aria-expanded')).toBe('false');
      expect(burger.getAttribute('aria-label')).toBe('Open');

      window.getEsterTranslation = vi.fn(key => key);
      burger.focus = vi.fn();

      burger.click();
      expect(burger.getAttribute('aria-label')).toBe('Fermer le menu');

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      expect(document.body.classList.contains('ester-nav-open')).toBe(false);
      expect(burger.getAttribute('aria-label')).toBe('Ouvrir le menu');
      expect(burger.focus).toHaveBeenCalledOnce();

      delete window.getEsterTranslation;
      burger.click();
      expect(document.body.classList.contains('ester-nav-open')).toBe(true);
      expect(burger.getAttribute('aria-label')).toBe('Fermer le menu');

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      expect(document.body.classList.contains('ester-nav-open')).toBe(true);
      burger.click();

      expect(MockIntersectionObserver.instances).toHaveLength(1);
      const observer = MockIntersectionObserver.instances[0];
      expect(observer.options).toEqual({ threshold: 0.4 });
      expect(observer.observed.map(el => el.id)).toEqual(['home', 'services']);

      observer.callback([
        { isIntersecting: false, target: document.getElementById('home') },
        { isIntersecting: true, target: document.getElementById('services') },
      ]);

      expect(document.querySelector('a[href="#home"]').classList.contains('nav-link--active')).toBe(false);
      expect(document.querySelector('a[href="#services"]').classList.contains('nav-link--active')).toBe(true);
    });

    it('supports missing optional logo elements', async () => {
      setBody(`
        <header id="site-header"></header>
        <button id="nav-burger" aria-expanded="false"></button>
        <nav id="ester-nav-overlay"></nav>
        <main></main>
      `);

      await expect(importFresh('nav')).resolves.toBeDefined();

      setBody(`
        <header id="site-header"></header>
        <img class="ester-nav-logo-img" alt="Ester">
        <button id="nav-burger" aria-expanded="false"></button>
        <nav id="ester-nav-overlay"></nav>
        <main></main>
      `);

      await importFresh('nav');
      const logoImg = document.querySelector('.ester-nav-logo-img');
      logoImg.dispatchEvent(new Event('error'));

      expect(logoImg.style.display).toBe('none');
    });
  });

  describe('reveal.js', () => {
    it('observes reveal elements, applies cascade delays, and reveals intersecting elements once', async () => {
      vi.useFakeTimers();
      setBody(`
        <div class="reveal" id="hero"></div>
        <div class="services-grid">
          <article id="service-a"></article>
          <article id="service-b"></article>
        </div>
      `);

      await importFresh('reveal');

      expect(MockIntersectionObserver.instances).toHaveLength(1);
      const observer = MockIntersectionObserver.instances[0];
      const hero = document.getElementById('hero');
      const serviceA = document.getElementById('service-a');
      const serviceB = document.getElementById('service-b');

      expect(observer.options).toEqual({ threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
      expect(observer.observed).toEqual([hero]);
      expect(serviceA.dataset.delay).toBe('0');
      expect(serviceB.dataset.delay).toBe('80');

      observer.callback([
        { isIntersecting: false, target: hero },
        { isIntersecting: true, target: hero },
      ]);
      expect(observer.unobserve).toHaveBeenCalledWith(hero);

      await vi.advanceTimersByTimeAsync(0);
      expect(hero.classList.contains('is-visible')).toBe(true);
    });

    it('uses an element delay before revealing', async () => {
      vi.useFakeTimers();
      setBody('<div class="reveal" id="delayed" data-delay="160"></div>');

      await importFresh('reveal');
      const observer = MockIntersectionObserver.instances[0];
      const delayed = document.getElementById('delayed');

      observer.callback([{ isIntersecting: true, target: delayed }]);
      await vi.advanceTimersByTimeAsync(159);
      expect(delayed.classList.contains('is-visible')).toBe(false);

      await vi.advanceTimersByTimeAsync(1);
      expect(delayed.classList.contains('is-visible')).toBe(true);
    });
  });

  describe('smooth-scroll.js', () => {
    it('smoothly scrolls to matching hash targets with header offset', async () => {
      setBody(`
        <a id="anchor" href="#target">Go</a>
        <section id="target"></section>
      `);
      const target = document.getElementById('target');
      target.getBoundingClientRect = vi.fn(() => ({ top: 250 }));
      window.scrollY = 30;

      await importFresh('smooth-scroll');
      const event = new MouseEvent('click', { bubbles: true, cancelable: true });
      document.getElementById('anchor').dispatchEvent(event);

      expect(event.defaultPrevented).toBe(true);
      expect(window.scrollTo).toHaveBeenCalledWith({ top: 200, behavior: 'smooth' });
    });

    it('leaves clicks alone when the hash target is missing', async () => {
      setBody('<a id="anchor" href="#missing">Go</a>');

      await importFresh('smooth-scroll');
      const event = new MouseEvent('click', { bubbles: true, cancelable: true });
      document.getElementById('anchor').dispatchEvent(event);

      expect(event.defaultPrevented).toBe(false);
      expect(window.scrollTo).not.toHaveBeenCalled();
    });
  });

  describe('main.js', () => {
    it('updates dynamic footer values and runs startup modules without required content', async () => {
      setBody(`
        <header id="site-header"></header>
        <button id="nav-burger" aria-expanded="false"></button>
        <nav id="ester-nav-overlay"></nav>
        <main></main>
        <span id="footer-year"></span>
        <span class="ester-age-dynamic"></span>
        <span class="ester-age-dynamic"></span>
      `);

      await importRootFresh('main.js');

      const year = String(new Date().getFullYear());
      const age = String(new Date().getFullYear() - 1977);
      expect(document.getElementById('footer-year').textContent).toBe(year);
      expect([...document.querySelectorAll('.ester-age-dynamic')].map(el => el.textContent)).toEqual([age, age]);
    });

    it('starts without a dynamic footer year element', async () => {
      setBody(`
        <header id="site-header"></header>
        <button id="nav-burger" aria-expanded="false"></button>
        <nav id="ester-nav-overlay"></nav>
        <main></main>
      `);

      await expect(importRootFresh('main.js')).resolves.toBeDefined();
    });
  });

  describe('generate-data.mjs line coverage', () => {
    it('treats unknown publication property types as published', async () => {
      const { propPublished } = await importRootFresh('scripts/generate-data.mjs');

      expect(propPublished({ Published: { type: 'rich_text', rich_text: [] } })).toBe(true);
    });
  });
});
