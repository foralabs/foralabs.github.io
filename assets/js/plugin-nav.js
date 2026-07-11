/*
  Floating section navigation for plugin detail pages. Fully data-driven: it
  scans the rendered `.plugin-section` blocks, reads each one's `.section-label`
  as the title, and builds a table-of-contents. Because it reads whatever
  sections actually rendered, it stays in sync with the layout's optional
  sections — no section, no nav entry. Adds smooth-scroll and scroll-spy
  highlighting via IntersectionObserver.
*/
(function () {
  "use strict";

  var article = document.querySelector(".plugin");
  if (!article) return;

  var sections = Array.prototype.slice.call(
    article.querySelectorAll(".plugin-section")
  );
  if (sections.length < 2) return;

  function slugify(text) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  var entries = [];
  sections.forEach(function (section, i) {
    var label = section.querySelector(".section-label");
    var title = label ? label.textContent.trim() : "";
    if (!title) return;

    if (!section.id) {
      section.id = "sec-" + (slugify(title) || i);
    }
    entries.push({ id: section.id, title: title, el: section });
  });
  if (entries.length < 2) return;

  var nav = document.createElement("nav");
  nav.className = "plugin-toc";
  nav.setAttribute("aria-label", "Sections");

  var list = document.createElement("ul");
  var linksById = {};

  // Scroll-to-top entry, always first.
  var TOP_ID = "__top__";
  var topLi = document.createElement("li");
  var topA = document.createElement("a");
  topA.href = "#top";
  topA.textContent = "Top";
  topA.className = "plugin-toc-top";
  topA.addEventListener("click", function (e) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
    history.replaceState(null, "", location.pathname + location.search);
  });
  topLi.appendChild(topA);
  list.appendChild(topLi);
  linksById[TOP_ID] = topA;

  entries.forEach(function (entry) {
    var li = document.createElement("li");
    var a = document.createElement("a");
    a.href = "#" + entry.id;
    a.textContent = entry.title;
    a.addEventListener("click", function (e) {
      e.preventDefault();
      entry.el.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", "#" + entry.id);
    });
    li.appendChild(a);
    list.appendChild(li);
    linksById[entry.id] = a;
  });

  nav.appendChild(list);
  document.body.appendChild(nav);

  function setActive(id) {
    Object.keys(linksById).forEach(function (key) {
      if (key === id) {
        linksById[key].setAttribute("aria-current", "true");
      } else {
        linksById[key].removeAttribute("aria-current");
      }
    });
  }

  var visible = {};
  var observer = new IntersectionObserver(
    function (records) {
      records.forEach(function (record) {
        visible[record.target.id] = record.isIntersecting;
      });
      // Highlight the first section (in document order) currently on screen.
      for (var i = 0; i < entries.length; i++) {
        if (visible[entries[i].id]) {
          setActive(entries[i].id);
          return;
        }
      }
      // Above the first section — highlight "Top".
      setActive(TOP_ID);
    },
    { rootMargin: "-25% 0px -60% 0px", threshold: 0 }
  );

  entries.forEach(function (entry) {
    observer.observe(entry.el);
  });

  setActive(TOP_ID);
})();
