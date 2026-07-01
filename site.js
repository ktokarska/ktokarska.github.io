/* v3 shared behaviour: mobile nav + count-up stats. Vanilla JS, no libraries. */
(function () {
  "use strict";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Expandable project cards on work.html: the "More details" button
     toggles its card and flips its own label. The housing card uses a
     plain <a> with no aria-controls, so it is skipped here and navigates. */
  var cardExpanders = document.querySelectorAll('.btn-card[aria-controls]');
  cardExpanders.forEach(function(btn){
    btn.addEventListener('click', function(){
      var card = btn.closest('.pcard');
      var expanded = card.getAttribute('aria-expanded') === 'true';
      card.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      btn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      var lbl = btn.querySelector('.lbl');
      if (lbl) { lbl.textContent = expanded ? 'More details' : 'Less details'; }
    });
  });

  /* Mobile hamburger: toggles a full-width panel, closes on link click */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = document.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        document.body.classList.remove("nav-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* Anti-scrape email: the address is stored split across data-user/data-domain
     and only assembled into a real mailto: link when a browser runs this.
     Bulk harvesters that parse raw HTML see only the "(at)" fallback text. */
  var emailEl = document.querySelector("[data-email]");
  if (emailEl) {
    var user = emailEl.getAttribute("data-user");
    var domain = emailEl.getAttribute("data-domain");
    if (user && domain) {
      var addr = user + "@" + domain;
      var link = document.createElement("a");
      link.href = "mailto:" + addr;
      link.textContent = addr;
      emailEl.textContent = "";
      emailEl.appendChild(link);
    }
  }

  /* Count-up stats: animate 0 -> target on first viewport entry.
     Elements opt in with data-count="97" data-prefix="~" data-suffix="%".
     The element's original text is restored as the exact final value. */
  var counters = document.querySelectorAll("[data-count]");
  function runCounter(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    var finalText = el.textContent;
    if (reduced || isNaN(target)) { el.textContent = finalText; return; }
    var duration = 1300;
    var start = null;
    function frame(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3); /* ease-out cubic */
      el.textContent = prefix + Math.round(target * eased) + suffix;
      if (p < 1) {
        window.requestAnimationFrame(frame);
      } else {
        el.textContent = finalText; /* snap to the exact original string */
      }
    }
    window.requestAnimationFrame(frame);
  }
  if (counters.length && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          runCounter(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { io.observe(el); });
  }
})();
