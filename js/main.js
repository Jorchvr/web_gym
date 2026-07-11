/* ================================================
   45 LIFE FITNESS — Interactions
   ================================================ */

const USD_RATE = 17; // 17 MXN = 1 USD (fixed)
const DICT = {
  es: { activate: 'Activar sonido', mute: 'Silenciar sonido', langLabel: 'EN' },
  en: { activate: 'Enable sound', mute: 'Mute sound', langLabel: 'ES' }
};
let currentLang = localStorage.getItem('lang') || 'es';

/* ---------- Nav scroll state + scroll progress ---------- */
(function nav() {
  const nav = document.getElementById('nav');
  const progress = document.getElementById('scrollProgress');
  const update = () => {
    const y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 20);
    const h = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (y / h * 100) + '%';
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
})();

/* ---------- Reveal on scroll ---------- */
(function reveal() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
})();

/* ---------- Counters ---------- */
(function counters() {
  const nums = document.querySelectorAll('[data-count]');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const el = e.target;
        const target = +el.dataset.count;
        const dur = 1200;
        const start = performance.now();
        const format = n => target >= 1000 ? Math.floor(n).toLocaleString('es-MX') : Math.floor(n);
        const step = t => {
          const p = Math.min((t - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = format(target * eased);
          if (p < 1) requestAnimationFrame(step);
          else el.textContent = format(target);
        };
        requestAnimationFrame(step);
        io.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  nums.forEach(n => io.observe(n));
})();

/* ---------- Smooth anchor scroll ---------- */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id.length < 2) return;
    const t = document.querySelector(id);
    if (!t) return;
    e.preventDefault();
    const y = t.getBoundingClientRect().top + window.scrollY - 72;
    window.scrollTo({ top: y, behavior: 'smooth' });
    document.getElementById('navMenu')?.classList.remove('is-open');
  });
});

/* ---------- Mobile burger ---------- */
(function burger() {
  const b = document.getElementById('burger');
  const menu = document.getElementById('navMenu');
  if (!b || !menu) return;
  b.addEventListener('click', () => menu.classList.toggle('is-open'));
})();

/* ---------- Video sound toggle ---------- */
const videoState = { on: false };
(function videoToggle() {
  const vid = document.getElementById('tourVideo');
  const btn = document.getElementById('videoBtn');
  const icon = document.getElementById('videoIcon');
  if (!vid || !btn) return;
  const iconMuted = '<path d="M4 9v6h4l5 5V4L8 9H4zm13.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4z"/>';
  const iconOn = '<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2a7 7 0 0 1 0 13.6v2A9 9 0 0 0 14 3.2z"/>';
  btn.addEventListener('click', () => {
    vid.muted = !vid.muted;
    videoState.on = !vid.muted;
    if (videoState.on) vid.volume = 0.7;
    icon.innerHTML = videoState.on ? iconOn : iconMuted;
    updateVideoHint();
    vid.play().catch(() => {});
  });
})();

function updateVideoHint() {
  const hint = document.getElementById('videoHint');
  if (!hint) return;
  hint.textContent = videoState.on ? DICT[currentLang].mute : DICT[currentLang].activate;
}

/* ---------- Language toggle ---------- */
(function langToggle() {
  const btn = document.getElementById('langBtn');
  if (!btn) return;
  // Cache original ES content on load
  document.querySelectorAll('[data-en]').forEach(el => {
    el.dataset.es = el.innerHTML;
  });
  document.querySelectorAll('[data-en-placeholder]').forEach(el => {
    el.dataset.esPlaceholder = el.placeholder;
  });
  applyLang(currentLang);
  btn.addEventListener('click', () => {
    applyLang(currentLang === 'es' ? 'en' : 'es');
  });
})();

function applyLang(lang) {
  currentLang = lang;
  document.documentElement.lang = lang;
  localStorage.setItem('lang', lang);

  // Text content (innerHTML preserves inner tags)
  document.querySelectorAll('[data-en]').forEach(el => {
    el.innerHTML = lang === 'en' ? el.dataset.en : el.dataset.es;
  });
  // Placeholders
  document.querySelectorAll('[data-en-placeholder]').forEach(el => {
    el.placeholder = lang === 'en' ? el.dataset.enPlaceholder : el.dataset.esPlaceholder;
  });
  // Prices
  document.querySelectorAll('[data-price]').forEach(el => {
    const mxn = +el.dataset.price;
    if (lang === 'en') {
      const usd = Math.round(mxn / USD_RATE);
      el.textContent = '$' + usd.toLocaleString('en-US') + ' USD';
    } else {
      el.textContent = '$' + mxn.toLocaleString('es-MX');
    }
  });
  // Lang toggle button label
  const btn = document.getElementById('langBtn');
  if (btn) btn.textContent = DICT[lang].langLabel;
  // Video hint (if user already interacted)
  updateVideoHint();
}
