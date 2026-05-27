/* ── Formulaire de contact ──────────────────────────────── */
const form       = document.getElementById('contact-form');
const submitBtn  = document.getElementById('form-submit');
const successMsg = document.getElementById('form-success');

if (form) {
  form.addEventListener('submit', async e => {
    e.preventDefault();
    form.classList.add('was-validated');

    if (!form.checkValidity()) {
      const firstInvalid = form.querySelector(':invalid');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    const label   = submitBtn.querySelector('.form-submit-label');
    const loading = submitBtn.querySelector('.form-submit-loading');

    submitBtn.disabled = true;
    label.hidden   = true;
    loading.hidden = false;

    /* Simulation — remplacer par Formspree une fois l'endpoint configuré */
    await new Promise(r => setTimeout(r, 1000));

    form.reset();
    form.classList.remove('was-validated');
    submitBtn.hidden  = true;
    successMsg.hidden = false;
    successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
}
