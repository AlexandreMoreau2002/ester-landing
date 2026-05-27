/* ── Mountains : viewBox responsive ─────────────────────── */
const svg = document.querySelector('.ester-mountains svg');
if (svg) {
  const VB = {
    mobile:  '480 0 620 396',
    tablet:  '0 0 1080 396',
    desktop: '0 0 1400 396',
  };

  function update() {
    const w = window.innerWidth;
    svg.setAttribute('viewBox',
      w <= 600  ? VB.mobile  :
      w <= 1024 ? VB.tablet  :
                  VB.desktop
    );
  }

  window.addEventListener('resize', update, { passive: true });
  update();
}
