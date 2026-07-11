/* ================================================
   45 LIFE FITNESS — Lightweight interactions
   ================================================ */

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

/* ---------- Smooth anchor scroll with nav offset ---------- */
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
(function videoToggle() {
  const vid = document.getElementById('tourVideo');
  const btn = document.getElementById('videoBtn');
  const hint = document.getElementById('videoHint');
  const icon = document.getElementById('videoIcon');
  if (!vid || !btn) return;
  const iconMuted = '<path d="M4 9v6h4l5 5V4L8 9H4zm13.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4z"/>';
  const iconOn = '<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2a7 7 0 0 1 0 13.6v2A9 9 0 0 0 14 3.2z"/>';
  btn.addEventListener('click', () => {
    vid.muted = !vid.muted;
    if (!vid.muted) {
      vid.volume = 0.7;
      hint.textContent = 'Silenciar sonido';
      icon.innerHTML = iconOn;
    } else {
      hint.textContent = 'Activar sonido';
      icon.innerHTML = iconMuted;
    }
    vid.play().catch(() => {});
  });
})();
