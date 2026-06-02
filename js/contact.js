const form       = document.getElementById('contact-form');
const submitBtn  = document.getElementById('form-submit');
const successMsg = document.getElementById('form-success');
const errorMsg   = document.getElementById('form-error');

const fileToBase64 = (file) => new Promise((resolve) => {
  const reader = new FileReader();
  reader.onload  = () => resolve(reader.result.split(',')[1] ?? null);
  reader.onerror = () => resolve(null);
  reader.readAsDataURL(file);
});

// CTA "Candidature spontanée" → scroll vers le formulaire + pré-sélection
document.querySelectorAll('[data-preselect-sujet]').forEach(link => {
  link.addEventListener('click', e => {
    const sujetVal = link.dataset.preselectSujet;
    const href     = link.getAttribute('href');
    const target   = href ? document.querySelector(href) : null;
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
    const select = document.getElementById('contact-sujet');
    if (select) {
      select.value = sujetVal;
      select.dispatchEvent(new Event('change'));
    }
  });
});

if (form) {
  const sujetSelect = form.querySelector('#contact-sujet');
  const sujetLabel  = form.querySelector('#sujet-label');
  if (sujetSelect && sujetLabel) {
    sujetSelect.addEventListener('change', () => {
      const opt = sujetSelect.options[sujetSelect.selectedIndex];
      sujetLabel.value = opt ? opt.textContent.trim() : '';

      const cvGroup = document.getElementById('form-group-cv');
      if (cvGroup) {
        const isCandidature = sujetSelect.value === 'candidature';
        const cvLabelEl = cvGroup.querySelector('[data-i18n]');
        if (cvLabelEl) {
          const key = isCandidature ? 'contact.cv.label.candidature' : 'contact.cv.label';
          cvLabelEl.dataset.i18n = key;
          if (window.getEsterTranslation) cvLabelEl.textContent = window.getEsterTranslation(key);
        }
      }
    });
  }

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
      const formData = new FormData(form);
      const res = await fetch('/', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error(res.statusText);

      // Notifier immédiatement sans attendre le webhook Netlify
      const notifyData = {};
      let cvFileForNotify = null;
      formData.forEach((v, k) => {
        if (v instanceof File) {
          notifyData[k] = v.name || '';
          if (k === 'cv' && v.size > 0) cvFileForNotify = v;
        } else {
          notifyData[k] = String(v);
        }
      });

      // Joindre le fichier en base64 si présent (size 0 = aucun fichier sélectionné)
      if (cvFileForNotify) {
        const b64 = await fileToBase64(cvFileForNotify);
        if (b64) {
          notifyData.cv_base64 = b64;
          notifyData.cv_type   = cvFileForNotify.type || 'application/octet-stream';
        }
      }

      fetch('/.netlify/functions/form-notify', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ data: notifyData }),
      }).catch(err => console.error('[contact] notify:', err));

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
