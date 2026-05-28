const form       = document.getElementById('contact-form');
const submitBtn  = document.getElementById('form-submit');
const successMsg = document.getElementById('form-success');
const errorMsg   = document.getElementById('form-error');

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
    if (errorMsg) errorMsg.hidden = true;
    label.hidden   = true;
    loading.hidden = false;

    try {
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(form)).toString()
      });
      if (!res.ok) throw new Error(res.statusText);

      form.reset();
      form.classList.remove('was-validated');
      submitBtn.disabled = false;
      submitBtn.hidden   = true;
      successMsg.hidden  = false;
      successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch (err) {
      console.error('[contact]', err);
      submitBtn.disabled = false;
      label.hidden   = false;
      loading.hidden = true;
      if (successMsg) successMsg.hidden = true;
      if (errorMsg) {
        errorMsg.hidden = false;
        errorMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  });
}
