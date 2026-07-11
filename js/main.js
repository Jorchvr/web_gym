/* ================================================
   TITAN FITNESS — Interactions & Effects
   ================================================ */

/* ---------- Loader ---------- */
(function loader() {
  const loader = document.getElementById('loader');
  const bar = document.querySelector('.loader__bar span');
  const percentEl = document.getElementById('loaderPercent');
  let p = 0;
  const tick = () => {
    p += Math.random() * 12 + 4;
    if (p > 100) p = 100;
    bar.style.width = p + '%';
    percentEl.textContent = Math.floor(p) + '%';
    if (p < 100) setTimeout(tick, 90);
    else setTimeout(() => {
      loader.classList.add('is-hidden');
      startPage();
    }, 350);
  };
  tick();
})();

/* ---------- Start (fires after loader) ---------- */
function startPage() {
  // reveal hero splits + reveals
  document.querySelectorAll('.hero [data-split]').forEach((el, i) => {
    setTimeout(() => el.style.transform = 'translateY(0)', 100 + i * 90);
  });
  document.querySelectorAll('.hero .reveal').forEach((el, i) => {
    setTimeout(() => el.classList.add('is-visible'), 400 + i * 100);
  });
  animateCounters();
}

/* ---------- Custom Cursor ---------- */
(function cursor() {
  const c = document.getElementById('cursor');
  const d = document.getElementById('cursorDot');
  if (!c || !d) return;
  let mx = 0, my = 0, cx = 0, cy = 0;
  window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; d.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`; });
  const loop = () => {
    cx += (mx - cx) * 0.18;
    cy += (my - cy) * 0.18;
    c.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
    requestAnimationFrame(loop);
  };
  loop();
  document.querySelectorAll('a, button, [data-magnetic], [data-tilt], .gallery__item, .coach').forEach(el => {
    el.addEventListener('mouseenter', () => c.classList.add('is-hover'));
    el.addEventListener('mouseleave', () => c.classList.remove('is-hover'));
  });
})();

/* ---------- Nav scroll state ---------- */
(function nav() {
  const nav = document.getElementById('nav');
  const progress = document.getElementById('scrollProgress');
  const update = () => {
    const y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 40);
    const h = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (y / h * 100) + '%';
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
})();

/* ---------- IntersectionObserver: reveals & splits ---------- */
(function reveal() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        // section-title splits
        if (e.target.classList.contains('section__title')) {
          e.target.querySelectorAll('[data-split]').forEach((sp, i) => {
            setTimeout(() => sp.style.transform = 'translateY(0)', i * 100);
          });
        }
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
  document.querySelectorAll('.reveal, .section__title').forEach(el => io.observe(el));
})();

/* ---------- Counters ---------- */
function animateCounters() {
  const nums = document.querySelectorAll('[data-count]');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const el = e.target;
        const target = +el.dataset.count;
        const dur = 1600;
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
  }, { threshold: 0.4 });
  nums.forEach(n => io.observe(n));
}

/* ---------- Magnetic buttons ---------- */
(function magnetic() {
  document.querySelectorAll('[data-magnetic]').forEach(el => {
    let raf;
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
      });
    });
    el.addEventListener('mouseleave', () => {
      el.style.transition = 'transform .6s cubic-bezier(.16,1,.3,1)';
      el.style.transform = '';
      setTimeout(() => el.style.transition = '', 600);
    });
  });
})();

/* ---------- Tilt / 3d hover ---------- */
(function tilt() {
  const items = document.querySelectorAll('[data-tilt]');
  items.forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      const rx = (py - 0.5) * -8;
      const ry = (px - 0.5) * 8;
      el.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
      el.style.setProperty('--mx', px * 100 + '%');
      el.style.setProperty('--my', py * 100 + '%');
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });
})();

/* ---------- Parallax ---------- */
(function parallax() {
  const items = document.querySelectorAll('[data-parallax]');
  const update = () => {
    const vh = window.innerHeight;
    items.forEach(el => {
      const r = el.getBoundingClientRect();
      const mid = r.top + r.height / 2;
      const dist = (mid - vh / 2) * -1 * parseFloat(el.dataset.parallax);
      el.style.transform = `translate3d(0, ${dist}px, 0)`;
    });
  };
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();

/* ---------- Smooth anchor scroll (extra offset for fixed nav) ---------- */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id.length < 2) return;
    const t = document.querySelector(id);
    if (!t) return;
    e.preventDefault();
    const y = t.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: y, behavior: 'smooth' });
  });
});

/* ---------- Burger (mobile) ---------- */
(function burger() {
  const b = document.getElementById('burger');
  const menu = document.querySelector('.nav__menu');
  if (!b) return;
  b.addEventListener('click', () => {
    const open = menu.style.display === 'flex';
    menu.style.display = open ? 'none' : 'flex';
    menu.style.position = 'fixed';
    menu.style.top = '70px';
    menu.style.left = '20px';
    menu.style.right = '20px';
    menu.style.flexDirection = 'column';
    menu.style.background = 'rgba(10,10,11,.95)';
    menu.style.backdropFilter = 'blur(20px)';
    menu.style.padding = '20px';
    menu.style.borderRadius = '20px';
    menu.style.border = '1px solid rgba(255,255,255,.1)';
    menu.style.gap = '4px';
  });
})();

/* ---------- Testimonials clone for infinite marquee ---------- */
(function testimonialsClone() {
  const track = document.getElementById('testimonialsTrack');
  if (!track) return;
  const clones = [...track.children].map(c => c.cloneNode(true));
  clones.forEach(c => track.appendChild(c));
})();

/* ---------- Video sound toggle ---------- */
(function videoToggle() {
  const vid = document.getElementById('tourVideo');
  const btn = document.getElementById('videoBtn');
  const hint = document.getElementById('videoHint');
  const iconWrap = document.getElementById('videoIcon');
  if (!vid || !btn) return;
  const iconMuted = '<path d="M4 9v6h4l5 5V4L8 9H4zm13.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4z"/>';
  const iconOn = '<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2a7 7 0 0 1 0 13.6v2A9 9 0 0 0 14 3.2z"/>';
  btn.addEventListener('click', () => {
    vid.muted = !vid.muted;
    if (!vid.muted) {
      vid.volume = 0.6;
      hint.textContent = 'SONIDO ACTIVO · CLIC PARA SILENCIAR';
      iconWrap.innerHTML = iconOn;
      btn.style.background = '#fff';
    } else {
      hint.textContent = 'CLIC PARA ACTIVAR SONIDO';
      iconWrap.innerHTML = iconMuted;
      btn.style.background = '';
    }
    vid.play().catch(() => {});
  });
})();
