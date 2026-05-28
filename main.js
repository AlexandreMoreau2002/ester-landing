/* eslint-disable no-undef */
console.log(`[ester] build ${__GIT_HASH__}`);

import './js/i18n.js';
import './js/nav.js';
import './js/reveal.js';
import './js/contact.js';
import './js/mountains.js';
import './js/smooth-scroll.js';
import { loadGoogleAvis } from './js/avis.js';
import { initPagination } from './js/pagination.js';
import { loadNotionRealisations } from './js/notion.js';

/* Année dynamique dans le footer */
const yearEl = document.getElementById('footer-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* Ancienneté dynamique — calcul depuis 1977 */
const FOUNDING_YEAR = 1977;
const esterAge = new Date().getFullYear() - FOUNDING_YEAR;
document.querySelectorAll('.ester-age-dynamic').forEach(el => {
  el.textContent = esterAge;
});

/* Pagination d'abord, puis injection Notion (qui la reconstruit après fetch) */
initPagination();
loadNotionRealisations();
loadGoogleAvis();
