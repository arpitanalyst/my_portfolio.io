(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Mobile menu
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.nav-toggle');
  const setMenu = open => {
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open);
    toggle.firstElementChild.className = open ? 'bi bi-x-lg' : 'bi bi-list';
  };
  toggle.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  document.querySelectorAll('.nav-links a').forEach(a => a.addEventListener('click', () => setMenu(false)));

  // Active link on scroll
  const links = [...document.querySelectorAll('.nav-links a')];
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  links.forEach(a => { const s = document.querySelector(a.getAttribute('href')); if (s) io.observe(s); });

  // 3D tilt on cards (mouse only)
  if (!reduce && matchMedia('(hover:hover)').matches) {
    document.querySelectorAll('.tilt').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        card.style.transform = `perspective(800px) rotateX(${-y * 8}deg) rotateY(${x * 8}deg) translateY(-6px)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }


  // Apply configurable links (see js/config.js)
  const cfg = window.SITE_CONFIG || { social: {}, projects: {} };
  document.querySelectorAll('[data-social]').forEach(a => { const u = cfg.social[a.dataset.social]; if (u) a.href = u; });
  document.querySelectorAll('[data-project]').forEach(a => { const u = cfg.projects[a.dataset.project]; if (u) a.href = u; });

  // Animated counters
  const counters = document.querySelectorAll('.count');
  const run = el => {
    const to = +el.dataset.to;
    if (reduce) { el.textContent = to; return; }
    const t0 = performance.now(), dur = 1400;
    const step = t => { const k = Math.min((t - t0) / dur, 1); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  };
  const cio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { run(e.target); cio.unobserve(e.target); } }), { threshold: .6 });
  counters.forEach(c => cio.observe(c));

  // Background particles
  const cv = document.getElementById('particles');
  const ctx = cv.getContext('2d');
  const colors = ['61,123,255', '162,77,255', '34,228,255'];
  let w, h, dots = [];
  function resize() {
    w = cv.width = innerWidth; h = cv.height = innerHeight;
    dots = Array.from({ length: Math.min(70, Math.floor(w * h / 22000)) }, () => ({
      x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.8 + .4,
      vx: (Math.random() - .5) * .25, vy: (Math.random() - .5) * .25,
      c: colors[Math.floor(Math.random() * 3)]
    }));
    if (reduce) draw();
  }
  function draw() {
    ctx.clearRect(0, 0, w, h);
    dots.forEach(d => {
      d.x = (d.x + d.vx + w) % w; d.y = (d.y + d.vy + h) % h;
      ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, 6.283);
      ctx.fillStyle = `rgba(${d.c},.75)`; ctx.shadowBlur = 10; ctx.shadowColor = `rgb(${d.c})`; ctx.fill();
    });
    if (!reduce) requestAnimationFrame(draw);
  }
  addEventListener('resize', resize);
  resize();
  if (!reduce) draw();
})();
