/* ── Reveal au scroll (Intersection Observer) ───────────── */
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const delay = entry.target.dataset.delay ?? 0;
    setTimeout(() => entry.target.classList.add('is-visible'), Number(delay));
    revealObs.unobserve(entry.target);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

/* Décalage en cascade pour les grilles */
document.querySelectorAll(
  '.certifs-list, .services-grid, .realisations-grid, .avis-grid, .pourquoi-points'
).forEach(grid => {
  Array.from(grid.children).forEach((child, i) => { child.dataset.delay = i * 80; });
});
