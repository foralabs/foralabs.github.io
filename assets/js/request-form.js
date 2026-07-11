// Progressive-enhancement handler for a plugin demo/licence request form.
// Serializes the form into a mailto: body so it works without a backend.
// Shared by every plugin detail page (_layouts/plugin.html).
(function () {
  var form = document.getElementById('plugin-request-form');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var lines = [];
    var interests = [];
    var interestLabel = '';
    Array.prototype.forEach.call(form.elements, function (el) {
      if (!el.name || el.type === 'hidden' || el.type === 'submit') return;
      if (el.type === 'checkbox') {
        interestLabel = el.name;
        if (el.checked) interests.push(el.value);
        return;
      }
      var val = (el.value || '').trim();
      if (val) lines.push(el.name + ': ' + val);
    });
    if (interests.length) lines.push(interestLabel + ': ' + interests.join(', '));
    var url = 'mailto:' + form.getAttribute('data-to') +
      '?subject=' + encodeURIComponent(form.getAttribute('data-subject')) +
      '&body=' + encodeURIComponent(lines.join('\n'));
    window.location.href = url;
  });
})();
