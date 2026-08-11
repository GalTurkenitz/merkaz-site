/* ============================================================
   המרכז לייפוי כוח מתמשך וצוואות — main.js
   nav toggle · faq accordion · contact→WhatsApp · footer year
   ============================================================ */
(function () {
  'use strict';

  /* ---------- mobile navigation ---------- */
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.nav__toggle');
  if (header && toggle) {
    toggle.addEventListener('click', function () {
      const open = header.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    header.querySelectorAll('.nav__links a').forEach(function (a) {
      a.addEventListener('click', function () { header.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); });
    });
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.faq__q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const panel = btn.nextElementSibling;
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      // close others
      document.querySelectorAll('.faq__q[aria-expanded="true"]').forEach(function (other) {
        if (other !== btn) {
          other.setAttribute('aria-expanded', 'false');
          other.nextElementSibling.style.maxHeight = null;
        }
      });
      btn.setAttribute('aria-expanded', String(!isOpen));
      panel.style.maxHeight = isOpen ? null : panel.scrollHeight + 'px';
    });
  });

  /* ---------- contact form → WhatsApp ---------- */
  const form = document.querySelector('[data-wa-form]');
  if (form) {
    const WA_NUMBER = '972557700223';
    const status = form.querySelector('.form-status');

    const showInvalid = function (field, bad) { field.classList.toggle('invalid', bad); };

    form.querySelectorAll('[data-required]').forEach(function (field) {
      const input = field.querySelector('input, select, textarea');
      input.addEventListener('input', function () { if (input.value.trim()) showInvalid(field, false); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      let ok = true;
      form.querySelectorAll('[data-required]').forEach(function (field) {
        const input = field.querySelector('input, select, textarea');
        const bad = !input.value.trim();
        showInvalid(field, bad);
        if (bad) ok = false;
      });
      if (!ok) {
        if (status) status.textContent = 'נא למלא את שדות החובה המסומנים.';
        form.querySelector('.invalid input, .invalid select')?.focus();
        return;
      }

      const val = function (name) {
        const el = form.querySelector('[name="' + name + '"]');
        return el ? el.value.trim() : '';
      };
      const lines = [
        'פנייה חדשה מהאתר',
        'שם: ' + val('name'),
        'טלפון: ' + val('phone'),
        'עיר מגורים: ' + val('city'),
        'נושא הפנייה: ' + val('subject'),
      ];
      const note = val('note');
      if (note) lines.push('הערה: ' + note);

      const text = encodeURIComponent(lines.join('\n'));
      window.open('https://wa.me/' + WA_NUMBER + '?text=' + text, '_blank', 'noopener');
      if (status) status.textContent = 'נפתח וואטסאפ עם ההודעה — יש לאשר וללחוץ שליחה.';
    });
  }

  /* ---------- stat counters ----------
     The numbers roll up once, the first time the block scrolls into view.
     The printed text is parsed rather than duplicated in JS, so the markup
     stays the single source of truth (and is what a crawler or a visitor
     without JS still sees). */
  const statNums = document.querySelectorAll('.stat__num');
  const prefersReduced = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;
  if (statNums.length && !prefersReduced) {
    const parse = (txt) => {
      const digits = txt.replace(/[^0-9]/g, '');
      if (!digits) return null;
      return {
        target: Number(digits),
        prefix: txt.slice(0, txt.indexOf(digits[0])),
        suffix: txt.slice(txt.lastIndexOf(digits[digits.length - 1]) + 1),
        grouped: txt.includes(','),
      };
    };

    const run = (el) => {
      const info = parse(el.textContent.trim());
      if (!info) return;
      const DURATION = 1400;
      const start = performance.now();
      const fmt = (n) => info.prefix + (info.grouped ? n.toLocaleString('en-US') : String(n)) + info.suffix;
      el.textContent = fmt(0);
      const tick = (now) => {
        const t = Math.min((now - start) / DURATION, 1);
        const eased = 1 - Math.pow(1 - t, 3);   // ease-out, lands softly
        el.textContent = fmt(Math.round(info.target * eased));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          io.unobserve(e.target);
          run(e.target);
        });
      }, { threshold: 0.5 });
      statNums.forEach((el) => io.observe(el));
    }
  }

  /* ---------- footer year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
