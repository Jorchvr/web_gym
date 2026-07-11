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

/* ---------- Chatbot ---------- */
(function chatbot() {
  const fab = document.getElementById('chatbotFab');
  const panel = document.getElementById('chatbot');
  const body = document.getElementById('chatbotBody');
  const quick = document.getElementById('chatbotQuick');
  const form = document.getElementById('chatbotForm');
  const input = document.getElementById('chatbotInput');
  if (!fab || !panel) return;

  const WA = 'https://wa.me/526241581056';
  const fmt = mxn => currentLang === 'en'
    ? '$' + Math.round(mxn / USD_RATE).toLocaleString('en-US') + ' USD'
    : '$' + mxn.toLocaleString('es-MX');

  const T = {
    es: {
      welcome: '¡Hola! 👋 Soy el asistente de <strong>45 Life Fitness</strong>. ¿En qué te ayudo?',
      chips: [
        ['precios', 'Precios'],
        ['horario', 'Horarios'],
        ['servicios', 'Servicios'],
        ['pilates', 'Pilates'],
        ['ubicacion', 'Ubicación'],
        ['prueba', 'Clase de prueba'],
        ['humano', 'Hablar con humano']
      ],
      unknown: 'No estoy seguro de entender esa pregunta 🤔. Prueba uno de los botones o escribe algo como <em>precios</em>, <em>horario</em>, <em>pilates</em>. También puedes <a href="' + WA + '?text=Hola,%20me%20interesa%20información%20sobre%2045%20Life%20Fitness" target="_blank">escribirnos por WhatsApp</a>.',
      answers: {
        greeting: '¡Hola! 👋 ¿Sobre qué te gustaría saber? Precios, horarios, clases…',
        precios: () => 'Estos son nuestros precios <strong>2026</strong>:<ul>' +
          '<li><span>Inscripción única</span><span>' + fmt(600) + '</span></li>' +
          '<li><span>GYM mensual</span><span>' + fmt(1400) + '</span></li>' +
          '<li><span>Spinning mensual</span><span>' + fmt(1600) + '</span></li>' +
          '<li><span>GYM + Spinning</span><span>' + fmt(1800) + '</span></li>' +
          '<li><span>6 meses GYM (ahorra 24%)</span><span>' + fmt(6400) + '</span></li>' +
          '<li><span>12 meses GYM (ahorra 17%)</span><span>' + fmt(14000) + '</span></li>' +
          '<li><span>🔥 GYM + Spinning + 8 Pilates</span><span>' + fmt(3500) + '</span></li>' +
          '</ul>Sin permanencia. ¿Quieres info de Pilates o reservar?',
        pilates: () => 'Nuestro <strong>Studio Pilates Reformer</strong> tiene clases grupales y privadas.<ul>' +
          '<li><span>1 clase</span><span>' + fmt(300) + '</span></li>' +
          '<li><span>4 clases</span><span>' + fmt(1100) + '</span></li>' +
          '<li><span>8 clases</span><span>' + fmt(2100) + '</span></li>' +
          '<li><span>12 clases</span><span>' + fmt(2800) + '</span></li>' +
          '<li><span>16 clases</span><span>' + fmt(3300) + '</span></li>' +
          '<li><span>⭐ 25 clases (45 días)</span><span>' + fmt(4500) + '</span></li>' +
          '</ul>Combo <strong>GYM + 8 Pilates</strong>: ' + fmt(2800) + '. Vigencia 1 mes. <a href="' + WA + '?text=Hola,%20quiero%20información%20sobre%20las%20clases%20de%20Pilates" target="_blank">Reservar por WhatsApp →</a>',
        horario: 'Nuestro horario:<br><strong>Lun — Vie:</strong> 5:00 — 22:00 (17 h continuas)<br><strong>Sábado:</strong> 7:00 — 15:00 (clases especiales AM)<br><strong>Domingo:</strong> cerrado 🌙',
        servicios: 'En 45 Life Fitness tenemos:<br>💪 <strong>GYM</strong> · equipo Life Fitness y Matrix<br>🚴 <strong>Spinning</strong> · estudio dedicado con bicis pro<br>🧘 <strong>Pilates Reformer</strong> · grupal y privado<br>⚡ <strong>Área funcional</strong> · turf, kettlebells, TRX, battle ropes<br>🎯 <strong>Entrenamiento personal</strong> · con coaches certificados<br><br>Formato: <strong>45 minutos</strong> de alta intensidad.',
        gym: () => 'Nuestra área de GYM tiene equipo <strong>Life Fitness y Matrix</strong> de última generación: cardio con vista, zona de pesas, área funcional con turf premium. Mensualidad: ' + fmt(1400) + '.',
        spinning: () => 'Estudio de <strong>Spinning</strong> con bicicletas profesionales, sonido inmersivo y coaches certificados. Mensualidad: ' + fmt(1600) + '. Combo GYM + Spinning: ' + fmt(1800) + '.',
        funcional: 'Área <strong>funcional</strong> con turf premium, kettlebells, TRX y battle ropes. Ideal para HIIT y WODs de 45 minutos.',
        personal: '<strong>Entrenamiento personal</strong> con coaches certificados que diseñan un plan 100% personalizado según tu objetivo y nivel. Pregunta por precios: <a href="' + WA + '?text=Hola,%20quiero%20información%20de%20entrenamiento%20personal" target="_blank">WhatsApp →</a>',
        ubicacion: 'Estamos en <strong>Plaza Novva, Tezal</strong> · Los Cabos, BCS 📍<br><a href="https://www.google.com/maps/search/?api=1&query=Plaza+Novva+Tezal+Los+Cabos" target="_blank">Ver en Google Maps →</a>',
        contacto: '📞 <strong>+52 624 158 10 56</strong><br>📸 Instagram <strong>@45lifefitness</strong><br><a href="' + WA + '?text=Hola,%20me%20interesa%20información%20sobre%2045%20Life%20Fitness" target="_blank">Escribir por WhatsApp →</a>',
        prueba: '¡Te invitamos a probar! 🎁 Agenda un tour, conoce las instalaciones y prueba tu primera clase. <a href="' + WA + '?text=Hola,%20quiero%20agendar%20mi%20clase%20de%20prueba%20gratis" target="_blank">Reservar mi clase de prueba por WhatsApp →</a>',
        inscripcion: () => 'La <strong>inscripción es única</strong> y cuesta ' + fmt(600) + '. Después solo pagas tu mensualidad, sin permanencia.',
        humano: 'Claro, te conecto con el equipo. <a href="' + WA + '?text=Hola,%20me%20gustaría%20hablar%20con%20alguien%20sobre%2045%20Life%20Fitness" target="_blank">Abrir WhatsApp →</a>',
        gracias: '¡Gracias a ti! 🙌 ¿Algo más en lo que te pueda ayudar?',
        duracion: 'Las clases son de <strong>45 minutos</strong> de alta intensidad. Máximo resultado en mínimo tiempo.'
      }
    },
    en: {
      welcome: 'Hi! 👋 I am the <strong>45 Life Fitness</strong> assistant. How can I help?',
      chips: [
        ['precios', 'Prices'],
        ['horario', 'Hours'],
        ['servicios', 'Services'],
        ['pilates', 'Pilates'],
        ['ubicacion', 'Location'],
        ['prueba', 'Trial class'],
        ['humano', 'Talk to human']
      ],
      unknown: 'I am not sure I got that 🤔. Try one of the buttons or type something like <em>prices</em>, <em>hours</em>, <em>pilates</em>. You can also <a href="' + WA + '?text=Hi,%20I%20am%20interested%20in%2045%20Life%20Fitness" target="_blank">reach us on WhatsApp</a>.',
      answers: {
        greeting: 'Hi! 👋 What would you like to know? Prices, hours, classes…',
        precios: () => 'Our <strong>2026</strong> prices:<ul>' +
          '<li><span>One-time joining fee</span><span>' + fmt(600) + '</span></li>' +
          '<li><span>GYM monthly</span><span>' + fmt(1400) + '</span></li>' +
          '<li><span>Spinning monthly</span><span>' + fmt(1600) + '</span></li>' +
          '<li><span>GYM + Spinning</span><span>' + fmt(1800) + '</span></li>' +
          '<li><span>6 months GYM (save 24%)</span><span>' + fmt(6400) + '</span></li>' +
          '<li><span>12 months GYM (save 17%)</span><span>' + fmt(14000) + '</span></li>' +
          '<li><span>🔥 GYM + Spinning + 8 Pilates</span><span>' + fmt(3500) + '</span></li>' +
          '</ul>No lock-in. Want Pilates info or to book?',
        pilates: () => 'Our <strong>Pilates Reformer Studio</strong> offers group and private classes.<ul>' +
          '<li><span>1 class</span><span>' + fmt(300) + '</span></li>' +
          '<li><span>4 classes</span><span>' + fmt(1100) + '</span></li>' +
          '<li><span>8 classes</span><span>' + fmt(2100) + '</span></li>' +
          '<li><span>12 classes</span><span>' + fmt(2800) + '</span></li>' +
          '<li><span>16 classes</span><span>' + fmt(3300) + '</span></li>' +
          '<li><span>⭐ 25 classes (45 days)</span><span>' + fmt(4500) + '</span></li>' +
          '</ul><strong>GYM + 8 Pilates</strong> combo: ' + fmt(2800) + '. Valid 1 month. <a href="' + WA + '?text=Hi,%20I%20want%20info%20on%20Pilates%20classes" target="_blank">Book on WhatsApp →</a>',
        horario: 'Our hours:<br><strong>Mon — Fri:</strong> 5:00 — 22:00 (17h nonstop)<br><strong>Saturday:</strong> 7:00 — 15:00 (special AM classes)<br><strong>Sunday:</strong> closed 🌙',
        servicios: 'At 45 Life Fitness we offer:<br>💪 <strong>GYM</strong> · Life Fitness &amp; Matrix equipment<br>🚴 <strong>Spinning</strong> · dedicated studio, pro bikes<br>🧘 <strong>Pilates Reformer</strong> · group &amp; private<br>⚡ <strong>Functional area</strong> · turf, kettlebells, TRX, battle ropes<br>🎯 <strong>Personal training</strong> · certified coaches<br><br>Format: <strong>45 minutes</strong> of high intensity.',
        gym: () => 'Our GYM area has state-of-the-art <strong>Life Fitness &amp; Matrix</strong> equipment: cardio with a view, weights zone, functional area with premium turf. Monthly: ' + fmt(1400) + '.',
        spinning: () => '<strong>Spinning</strong> studio with pro bikes, immersive sound and certified coaches. Monthly: ' + fmt(1600) + '. GYM + Spinning combo: ' + fmt(1800) + '.',
        funcional: '<strong>Functional</strong> area with premium turf, kettlebells, TRX and battle ropes. Perfect for HIIT and 45-min WODs.',
        personal: '<strong>Personal training</strong> with certified coaches who build a 100% custom plan for your goal and level. Ask for pricing: <a href="' + WA + '?text=Hi,%20I%20want%20info%20on%20personal%20training" target="_blank">WhatsApp →</a>',
        ubicacion: 'We are at <strong>Plaza Novva, Tezal</strong> · Los Cabos, BCS 📍<br><a href="https://www.google.com/maps/search/?api=1&query=Plaza+Novva+Tezal+Los+Cabos" target="_blank">Open in Google Maps →</a>',
        contacto: '📞 <strong>+52 624 158 10 56</strong><br>📸 Instagram <strong>@45lifefitness</strong><br><a href="' + WA + '?text=Hi,%20I%20am%20interested%20in%2045%20Life%20Fitness" target="_blank">Message on WhatsApp →</a>',
        prueba: 'We would love to have you try! 🎁 Book a tour, see the facilities and try your first class. <a href="' + WA + '?text=Hi,%20I%20would%20like%20to%20book%20my%20free%20trial%20class" target="_blank">Book my trial class on WhatsApp →</a>',
        inscripcion: () => 'The <strong>joining fee</strong> is a one-time ' + fmt(600) + '. After that, only your monthly fee — no lock-in.',
        humano: 'Sure, connecting you with the team. <a href="' + WA + '?text=Hi,%20I%20would%20like%20to%20talk%20to%20someone%20about%2045%20Life%20Fitness" target="_blank">Open WhatsApp →</a>',
        gracias: 'Thank you! 🙌 Anything else I can help with?',
        duracion: 'Classes are <strong>45 minutes</strong> of high intensity. Max results in minimum time.'
      }
    }
  };

  const INTENTS = [
    { key: 'greeting',    re: /\b(hola|hi|hello|hey|buenas|buenos dias|good (morning|afternoon|evening))\b/i },
    { key: 'gracias',     re: /\b(gracias|thanks|thank you)\b/i },
    { key: 'precios',     re: /\b(precio|precios|costo|cuesta|cuanto|cu[aá]nto|price|prices|cost|how much|tarifa|mensualidad|membres[ií]a|membership)\b/i },
    { key: 'pilates',     re: /\b(pilates|reformer)\b/i },
    { key: 'spinning',    re: /\b(spinning|bici|bicicleta|bike|cycling)\b/i },
    { key: 'gym',         re: /\b(gym|gimnasio|pesas|weights|maquinas|m[aá]quinas)\b/i },
    { key: 'funcional',   re: /\b(funcional|functional|hiit|wod|crossfit|turf|kettlebell|trx|battle)\b/i },
    { key: 'personal',    re: /\b(entrenador|personal|coach|trainer|entrenamiento personal)\b/i },
    { key: 'horario',     re: /\b(horario|hora|hours|schedule|abren|cierran|abierto|open|close|domingo|sunday|s[aá]bado|saturday)\b/i },
    { key: 'ubicacion',   re: /\b(ubicaci[oó]n|direcci[oó]n|donde|d[oó]nde|where|location|address|maps|c[oó]mo llegar|plaza novva|tezal|cabos)\b/i },
    { key: 'contacto',    re: /\b(contacto|contact|tel[eé]fono|phone|whatsapp|numero|n[uú]mero|instagram|redes|social)\b/i },
    { key: 'prueba',      re: /\b(prueba|trial|gratis|free|promoci[oó]n|promo|primera clase|first class|tour|visita|conocer)\b/i },
    { key: 'inscripcion', re: /\b(inscripci[oó]n|inscripcion|joining|sign up|registro|register|enroll)\b/i },
    { key: 'servicios',   re: /\b(servicio|servicios|service|services|clases|classes|que ofrecen|qu[eé] ofrecen|what do you offer)\b/i },
    { key: 'humano',      re: /\b(humano|human|persona|agent|asesor|advisor|hablar con|talk to|contactar|reach)\b/i },
    { key: 'duracion',    re: /\b(duraci[oó]n|cuanto dura|cu[aá]nto dura|how long|duration|45 minutos|45 minutes)\b/i }
  ];

  const detect = (text) => {
    for (const intent of INTENTS) if (intent.re.test(text)) return intent.key;
    return null;
  };

  const scrollBottom = () => { body.scrollTop = body.scrollHeight; };

  const push = (html, who) => {
    const div = document.createElement('div');
    div.className = 'chat-msg chat-msg--' + (who || 'bot');
    div.innerHTML = html;
    body.appendChild(div);
    scrollBottom();
  };

  const typing = () => {
    const div = document.createElement('div');
    div.className = 'chat-msg chat-msg--bot';
    div.innerHTML = '<div class="chat-typing"><span></span><span></span><span></span></div>';
    body.appendChild(div);
    scrollBottom();
    return div;
  };

  const answer = (key) => {
    const t = T[currentLang] || T.es;
    const a = t.answers[key];
    return typeof a === 'function' ? a() : a;
  };

  const respondTo = (text) => {
    const dot = typing();
    setTimeout(() => {
      dot.remove();
      const key = detect(text);
      push(key ? answer(key) : (T[currentLang] || T.es).unknown, 'bot');
    }, 500 + Math.random() * 350);
  };

  const renderChips = () => {
    const t = T[currentLang] || T.es;
    quick.innerHTML = '';
    t.chips.forEach(([key, label]) => {
      const b = document.createElement('button');
      b.className = 'chat-chip';
      b.type = 'button';
      b.textContent = label;
      b.addEventListener('click', () => {
        push(label, 'user');
        respondTo(key);
      });
      quick.appendChild(b);
    });
  };

  const boot = () => {
    body.innerHTML = '';
    push((T[currentLang] || T.es).welcome, 'bot');
    renderChips();
    input.placeholder = currentLang === 'en' ? 'Type your question…' : 'Escribe tu pregunta…';
  };

  const toggle = (force) => {
    const isOpen = typeof force === 'boolean' ? force : !panel.classList.contains('is-open');
    panel.classList.toggle('is-open', isOpen);
    fab.classList.toggle('is-open', isOpen);
    panel.setAttribute('aria-hidden', String(!isOpen));
    if (isOpen && body.children.length === 0) boot();
    if (isOpen) setTimeout(() => input.focus(), 300);
  };

  fab.addEventListener('click', () => toggle());
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    push(text, 'user');
    input.value = '';
    respondTo(text);
  });

  const langBtn = document.getElementById('langBtn');
  if (langBtn) langBtn.addEventListener('click', () => {
    setTimeout(() => { if (body.children.length > 0) boot(); }, 50);
  });
})();
