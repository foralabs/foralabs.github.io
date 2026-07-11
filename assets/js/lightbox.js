// Progressive-enhancement lightbox for the plugin screenshots. Any anchor with a
// `data-lightbox` attribute is captured; anchors sharing the same value form one
// gallery you can page through with the arrows or the keyboard. Without JS the
// anchors keep their href/target and simply open the full image in a new tab, so
// the feature degrades cleanly.
(function () {
  var overlay = document.getElementById('lightbox');
  if (!overlay) return;

  var links = Array.prototype.slice.call(document.querySelectorAll('a[data-lightbox]'));
  if (!links.length) return;

  var img = overlay.querySelector('.lightbox-img');
  var caption = overlay.querySelector('.lightbox-caption');
  var btnClose = overlay.querySelector('[data-lightbox-close]');
  var btnPrev = overlay.querySelector('[data-lightbox-prev]');
  var btnNext = overlay.querySelector('[data-lightbox-next]');

  // Gallery = the links sharing the currently-open link's data-lightbox group.
  var group = [];
  var index = 0;
  var lastFocus = null;

  function captionFor(link) {
    var inner = link.querySelector('img');
    return inner ? inner.getAttribute('alt') || '' : '';
  }

  function show(i) {
    if (i < 0) i = group.length - 1;
    if (i >= group.length) i = 0;
    index = i;
    var link = group[index];
    img.setAttribute('src', link.getAttribute('href'));
    var text = captionFor(link);
    img.setAttribute('alt', text);
    caption.textContent = text;
    var multiple = group.length > 1;
    btnPrev.hidden = !multiple;
    btnNext.hidden = !multiple;
  }

  function open(link) {
    var name = link.getAttribute('data-lightbox');
    group = links.filter(function (l) { return l.getAttribute('data-lightbox') === name; });
    lastFocus = document.activeElement;
    show(group.indexOf(link));
    overlay.hidden = false;
    overlay.setAttribute('aria-hidden', 'false');
    // Force reflow so the transition runs, then flag as open for CSS.
    overlay.offsetHeight;
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    btnClose.focus();
    document.addEventListener('keydown', onKey);
  }

  function close() {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    document.removeEventListener('keydown', onKey);
    // Clear the source after the fade so we don't flash the old image next time.
    window.setTimeout(function () {
      overlay.hidden = true;
      img.setAttribute('src', '');
    }, 200);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function onKey(e) {
    switch (e.key) {
      case 'Escape': close(); break;
      case 'ArrowLeft': if (group.length > 1) show(index - 1); break;
      case 'ArrowRight': if (group.length > 1) show(index + 1); break;
    }
  }

  links.forEach(function (link) {
    link.addEventListener('click', function (e) {
      // Let modified clicks (open-in-new-tab, etc.) behave normally.
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return;
      e.preventDefault();
      open(link);
    });
  });

  btnClose.addEventListener('click', close);
  btnPrev.addEventListener('click', function () { show(index - 1); });
  btnNext.addEventListener('click', function () { show(index + 1); });

  // Click on the backdrop (but not the image or controls) closes the lightbox.
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay || e.target.classList.contains('lightbox-figure')) close();
  });
})();
