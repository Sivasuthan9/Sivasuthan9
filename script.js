/* ============================================================
   Maheevan & Brannavi — Wedding Invitation
   Interactive animations & behavior
   ============================================================ */

(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============================================
     LOADER + HERO REVEAL
     ============================================ */
  window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    setTimeout(() => loader && loader.classList.add('is-hidden'), 1500);
    setTimeout(() => {
      document.querySelectorAll('.hero .reveal').forEach((el) => {
        const delay = parseInt(el.dataset.delay || '0', 10);
        setTimeout(() => el.classList.add('is-visible'), delay);
      });
    }, 1800);
  });

  /* ============================================
     SCROLL REVEAL — IntersectionObserver
     ============================================ */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
  );

  document.querySelectorAll('.section .reveal, .timeline__item.reveal').forEach((el) => {
    revealObserver.observe(el);
  });

  /* ============================================
     "Open Invitation" — smooth scroll to next section
     ============================================ */
  document.getElementById('btnOpen')?.addEventListener('click', () => {
    document.getElementById('couple').scrollIntoView({ behavior: 'smooth', block: 'start' });
    playBellOnce();
  });

  /* ============================================
     COUNTDOWN — to 18 Jun 2026, 07:23 local time
     ============================================ */
  const target = new Date(2026, 5, 18, 7, 23, 0).getTime(); // Month is 0-indexed
  const $days = document.querySelector('[data-unit="days"]');
  const $hrs  = document.querySelector('[data-unit="hours"]');
  const $min  = document.querySelector('[data-unit="minutes"]');
  const $sec  = document.querySelector('[data-unit="seconds"]');

  const pad = (n) => String(n).padStart(2, '0');

  function tick() {
    const now = Date.now();
    let diff = Math.max(0, target - now);
    const d = Math.floor(diff / 86400000); diff -= d * 86400000;
    const h = Math.floor(diff / 3600000);  diff -= h * 3600000;
    const m = Math.floor(diff / 60000);    diff -= m * 60000;
    const s = Math.floor(diff / 1000);
    if ($days) $days.textContent = pad(d);
    if ($hrs)  $hrs.textContent  = pad(h);
    if ($min)  $min.textContent  = pad(m);
    if ($sec)  $sec.textContent  = pad(s);
  }
  tick();
  setInterval(tick, 1000);

  /* ============================================
     FLOATING PETALS — canvas
     ============================================ */
  const canvas = document.getElementById('petals');
  const ctx = canvas.getContext('2d');
  let petals = [];
  let cssW = 0, cssH = 0;

  function sizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cssW = window.innerWidth;
    cssH = window.innerHeight;
    canvas.width = cssW * dpr;
    canvas.height = cssH * dpr;
    canvas.style.width = cssW + 'px';
    canvas.style.height = cssH + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  sizeCanvas();
  window.addEventListener('resize', () => {
    sizeCanvas();
    seedPetals();
  });

  const petalColors = [
    'rgba(255, 141, 176, 0.85)',  // pink
    'rgba(255, 122, 89, 0.85)',   // orange
    'rgba(245, 210, 122, 0.85)',  // gold
    'rgba(251, 214, 223, 0.9)',   // soft pink
    'rgba(255, 244, 199, 0.9)'    // pale gold
  ];

  function rand(a, b) { return a + Math.random() * (b - a); }

  function makePetal() {
    return {
      x: rand(0, cssW),
      y: rand(-cssH, 0),
      size: rand(6, 14),
      speedY: rand(0.4, 1.4),
      drift: rand(-0.6, 0.6),
      sway: rand(0.5, 1.8),
      swaySpeed: rand(0.005, 0.02),
      angle: rand(0, Math.PI * 2),
      spin: rand(-0.02, 0.02),
      color: petalColors[Math.floor(Math.random() * petalColors.length)],
      phase: rand(0, Math.PI * 2)
    };
  }

  function seedPetals() {
    const count = Math.min(38, Math.floor(cssW / 36));
    petals = Array.from({ length: count }, () => {
      const p = makePetal();
      p.y = rand(0, cssH);
      return p;
    });
  }
  seedPetals();

  function drawPetal(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    // teardrop / petal shape
    ctx.moveTo(0, -p.size);
    ctx.bezierCurveTo(p.size * 0.7, -p.size * 0.6, p.size * 0.5, p.size * 0.4, 0, p.size);
    ctx.bezierCurveTo(-p.size * 0.5, p.size * 0.4, -p.size * 0.7, -p.size * 0.6, 0, -p.size);
    ctx.fill();
    ctx.restore();
  }

  let petalRaf;
  function animatePetals() {
    ctx.clearRect(0, 0, cssW, cssH);
    petals.forEach((p) => {
      p.phase += p.swaySpeed;
      p.x += Math.sin(p.phase) * p.sway * 0.3 + p.drift * 0.2;
      p.y += p.speedY;
      p.angle += p.spin;
      if (p.y > cssH + 20) {
        p.y = -20;
        p.x = rand(0, cssW);
      }
      if (p.x < -30) p.x = cssW + 20;
      if (p.x > cssW + 30) p.x = -20;
      drawPetal(p);
    });
    petalRaf = requestAnimationFrame(animatePetals);
  }
  if (!prefersReducedMotion) animatePetals();

  // Pause when off-screen
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(petalRaf);
    } else if (!prefersReducedMotion) {
      animatePetals();
    }
  });

  /* ============================================
     BELL SFX
     ============================================ */
  const bellSfx = document.getElementById('bellSfx');
  if (bellSfx) bellSfx.volume = 0.55;

  function playBellOnce() {
    if (!bellSfx) return;
    try {
      bellSfx.currentTime = 0;
      bellSfx.play().catch(() => {});
    } catch (_) {}
  }

  /* ============================================
     PARALLAX — mandalas, temple silhouette
     ============================================ */
  if (!prefersReducedMotion) {
    const mL = document.querySelector('.hero__mandala--left');
    const mR = document.querySelector('.hero__mandala--right');
    const temple = document.querySelector('.hero__temple');

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y < window.innerHeight * 1.2) {
          if (mL)     mL.style.transform     = `translate(${-y * 0.05}px, ${-y * 0.1}px) rotate(${y * 0.02}deg)`;
          if (mR)     mR.style.transform     = `translate(${y * 0.05}px, ${y * 0.1}px) rotate(${-y * 0.02}deg)`;
          if (temple) temple.style.transform = `translateY(${y * 0.18}px)`;
        }
        ticking = false;
      });
    }, { passive: true });
  }

  /* ============================================
     RSVP FORM
     ============================================ */
  const form = document.getElementById('rsvpForm');
  const thanks = document.getElementById('thanks');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      name:    form.elements['name'].value.trim(),
      attend:  form.elements['attend'].value,
      guests:  parseInt(form.elements['guests'].value || '0', 10),
      message: form.elements['message'].value.trim(),
      ts:      new Date().toISOString()
    };

    if (!data.name) {
      form.elements['name'].focus();
      return;
    }

    // 1) localStorage fallback (always)
    try {
      const existing = JSON.parse(localStorage.getItem('rsvps') || '[]');
      existing.push(data);
      localStorage.setItem('rsvps', JSON.stringify(existing));
    } catch (_) {}

    // 2) Backend hook — uncomment & configure for Supabase / Firebase / fetch
    /*
    await fetch('/api/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    */

    showThanks();
    form.reset();
  });

  function showThanks() {
    if (!thanks) return;
    thanks.classList.add('is-active');
    burstPetals(thanks.querySelector('.thanks__petals'));
    playBellOnce();

    setTimeout(() => {
      thanks.classList.remove('is-active');
    }, 5200);
  }

  function burstPetals(container) {
    if (!container) return;
    container.innerHTML = '';
    const count = 28;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('span');
      const size = rand(8, 18);
      const color = petalColors[Math.floor(Math.random() * petalColors.length)];
      const angle = (i / count) * Math.PI * 2 + rand(-0.2, 0.2);
      const dist = rand(140, 320);
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist;
      p.style.cssText = `
        position: absolute;
        top: 50%; left: 50%;
        width: ${size}px; height: ${size * 1.4}px;
        background: ${color};
        border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
        transform: translate(-50%, -50%);
        opacity: 1;
        pointer-events: none;
        will-change: transform, opacity;
      `;
      container.appendChild(p);

      // animate
      requestAnimationFrame(() => {
        p.animate(
          [
            { transform: `translate(-50%, -50%) scale(0.4) rotate(0deg)`, opacity: 0 },
            { transform: `translate(calc(-50% + ${dx * 0.5}px), calc(-50% + ${dy * 0.5}px)) scale(1.1) rotate(${rand(-180,180)}deg)`, opacity: 1, offset: 0.4 },
            { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy + 220}px)) scale(0.8) rotate(${rand(-360,360)}deg)`, opacity: 0 }
          ],
          { duration: rand(2400, 3600), easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'forwards' }
        );
      });
    }
  }

  /* ============================================
     GSAP cinematic transitions (timeline)
     ============================================ */
  if (window.gsap && window.ScrollTrigger && !prefersReducedMotion) {
    gsap.registerPlugin(ScrollTrigger);

    // gentle parallax depth for timeline cards
    document.querySelectorAll('.timeline__card').forEach((card) => {
      gsap.fromTo(card,
        { x: -30, opacity: 0 },
        {
          x: 0, opacity: 1, duration: 1.2, ease: 'power2.out',
          scrollTrigger: { trigger: card, start: 'top 85%' }
        }
      );
    });

    // floating diyas drift
    gsap.to('.floating-diya--1', { y: -20, duration: 4, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    gsap.to('.floating-diya--2', { y: -25, duration: 5, repeat: -1, yoyo: true, ease: 'sine.inOut' });

    // shimmer on countdown numbers on first scroll-in
    gsap.utils.toArray('.cd-num').forEach((el) => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 90%',
        onEnter: () => gsap.fromTo(el, { scale: 1.18, color: '#c79029' }, { scale: 1, color: '#5b0606', duration: 0.6, ease: 'power2.out' })
      });
    });
  }

})();
