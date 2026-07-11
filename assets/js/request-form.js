// Progressive-enhancement handler for the contact + plugin request forms.
// Submits to the Web3Forms API (https://web3forms.com) via fetch and shows an
// inline status message, so no backend of our own is required. Any form with a
// `data-web3form` attribute is picked up. If JS is disabled the form still
// renders, and the mailto: fallback link beside it keeps working.
(function () {
  var forms = document.querySelectorAll('form[data-web3form]');
  if (!forms.length) return;

  Array.prototype.forEach.call(forms, function (form) {
    var status = form.querySelector('.form-status');
    var btn = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (form.getAttribute('data-busy')) return;
      form.setAttribute('data-busy', '1');

      var btnLabel = btn ? btn.textContent : '';
      var sending = form.getAttribute('data-sending');
      if (btn) {
        btn.disabled = true;
        if (sending) btn.textContent = sending;
      }
      if (status) {
        status.textContent = '';
        status.className = 'form-status';
      }

      // Collect fields. Checkbox groups (e.g. the interests list) collapse into
      // one comma-joined value; the botcheck honeypot is only sent when checked.
      var data = {};
      Array.prototype.forEach.call(form.elements, function (el) {
        if (!el.name || el.type === 'submit') return;
        if (el.type === 'checkbox') {
          if (el.name === 'botcheck') {
            if (el.checked) data.botcheck = true;
            return;
          }
          if (!el.checked) return;
          data[el.name] = data[el.name] ? data[el.name] + ', ' + el.value : el.value;
          return;
        }
        if (el.type === 'radio' && !el.checked) return;
        data[el.name] = el.value;
      });

      function done() {
        form.removeAttribute('data-busy');
        if (btn) {
          btn.disabled = false;
          btn.textContent = btnLabel;
        }
      }

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data)
      })
        .then(function (r) { return r.json(); })
        .then(function (json) {
          if (!json.success) throw new Error(json.message || 'Request failed');
          form.reset();
          if (status) {
            status.textContent = form.getAttribute('data-success') || 'Thanks — your message has been sent.';
            status.className = 'form-status form-status--ok';
          }
          done();
        })
        .catch(function () {
          if (status) {
            status.textContent = form.getAttribute('data-error') || 'Something went wrong. Please email us directly.';
            status.className = 'form-status form-status--err';
          }
          done();
        });
    });
  });
})();
