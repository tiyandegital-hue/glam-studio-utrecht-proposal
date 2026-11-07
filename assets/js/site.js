/* The Glam Studio Utrecht — site behaviour.
   ONE swappable business-name constant: change STUDIO_NAME here and in the
   <title>/headings (HTML text) to rebrand the whole site. */
const STUDIO_NAME = "The Glam Studio Utrecht";
const SALONIZED_URL = "https://the-glam-studio-utrecht.salonized.com/";

(function () {
  "use strict";

  /* Footer year — always the current year, never a hardcoded one. */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* Mobile nav toggle */
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.textContent = open ? "SLUIT ×" : "MENU ☰";
    });
    links.addEventListener("click", function (e) {
      if (e.target.closest("a")) links.classList.remove("open");
    });
  }

  /* Runtime "vandaag" marker — computed from the visitor's real date in
     Europe/Amsterdam. Never a hardcoded weekday. */
  function todayKey() {
    try {
      var day = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/Amsterdam",
        weekday: "short",
      }).format(new Date());
      return { Mon: "ma", Tue: "di", Wed: "wo", Thu: "do", Fri: "vr", Sat: "za", Sun: "zo" }[day] || null;
    } catch (e) {
      return ["zo", "ma", "di", "wo", "do", "vr", "za"][new Date().getDay()];
    }
  }
  var today = todayKey();
  if (today) {
    document.querySelectorAll('[data-day="' + today + '"]').forEach(function (el) {
      el.classList.add("is-today");
      var tag = el.querySelector(".today-tag");
      if (tag) tag.textContent = "· VANDAAG";
    });
  }

  /* Calendar filters */
  var filterBtns = document.querySelectorAll(".filter-btn");
  var dayCards = document.querySelectorAll(".day-card");
  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      filterBtns.forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
      btn.setAttribute("aria-pressed", "true");
      var f = btn.getAttribute("data-filter");
      dayCards.forEach(function (card) {
        var show =
          f === "all" ||
          (f === "open" && card.dataset.open === "true") ||
          (f === "closed" && card.dataset.open === "false") ||
          (f === "reel" && card.dataset.format === "reel");
        card.style.display = show ? "" : "none";
      });
    });
  });

  /* Toast */
  var toast = document.querySelector(".toast");
  var toastTimer = null;
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("show"); }, 2600);
  }

  function copyText(text, btn) {
    function done() {
      btn.classList.add("copied");
      var label = btn.querySelector(".copy-label") || btn;
      label.textContent = "GEKOPIEERD ✓";
      showToast("Caption gekopieerd naar klembord");
      setTimeout(function () {
        btn.classList.remove("copied");
        label.textContent = btn.getAttribute("data-label") || "Kopieer caption";
      }, 2600);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text); done(); });
    } else {
      fallbackCopy(text);
      done();
    }
  }
  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (e) {}
    document.body.removeChild(ta);
  }

  /* Copy-caption buttons */
  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      copyText(btn.getAttribute("data-copy"), btn);
    });
  });

  /* Contact form — front-end only, with working confirmation state. */
  var form = document.querySelector("[data-contact-form]");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      form.querySelectorAll("[required]").forEach(function (field) {
        var wrap = field.closest(".field");
        var valid = field.type === "checkbox" ? field.checked : field.value.trim().length > 0;
        if (field.type === "email" && field.value.trim()) {
          valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim());
        }
        if (wrap) wrap.classList.toggle("invalid", !valid);
        if (!valid) ok = false;
      });
      if (!ok) {
        var firstBad = form.querySelector(".field.invalid input, .field.invalid select, .field.invalid textarea");
        if (firstBad) firstBad.focus();
        return;
      }
      var success = document.querySelector(".form-success");
      if (success) {
        var name = (form.querySelector("#f-naam") || {}).value || "";
        var first = name.trim().split(/\s+/)[0];
        var msg = success.querySelector("[data-success-name]");
        if (msg && first) msg.textContent = "Bedankt, " + first + ". ";
        form.style.display = "none";
        success.style.display = "block";
        success.setAttribute("tabindex", "-1");
        success.focus();
      }
    });
  }
})();
