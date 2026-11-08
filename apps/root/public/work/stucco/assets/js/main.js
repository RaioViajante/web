/* Stucco. — concept site interactions (no dependencies) */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- menu ---------- */
  const setMenu = (open) => {
    root.classList.toggle('menu-open', open);
    $$('.burger').forEach((b) => {
      b.setAttribute('aria-expanded', open);
      b.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    const panel = $('.mpanel');
    if (panel) panel.setAttribute('aria-hidden', !open);
    $$('.mpanel nav a').forEach((a, i) => {
      a.style.transitionDelay = open ? (0.22 + i * 0.05).toFixed(2) + 's' : '0s';
      a.tabIndex = open ? 0 : -1;
    });
  };
  $$('.burger').forEach((b) => b.addEventListener('click', () => setMenu(!root.classList.contains('menu-open'))));
  $('.scrim')?.addEventListener('click', () => setMenu(false));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
  setMenu(false);

  /* ---------- compact bar ---------- */
  const onScroll = () => root.classList.toggle('scrolled', window.scrollY > 200);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- hero slideshow ---------- */
  const hero = $('.hero');
  if (hero) {
    const slides = $$('.slide', hero);
    const dots = $$('.dots button', hero);
    const cap = $('[data-caption]', hero);
    let i = 0, timer;
    const show = (n) => {
      i = (n + slides.length) % slides.length;
      slides.forEach((s, k) => s.classList.toggle('on', k === i));
      dots.forEach((d, k) => d.setAttribute('aria-pressed', k === i));
      if (cap) cap.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(slides.length).padStart(2, '0') + ' · ' + slides[i].dataset.cap;
    };
    const start = () => { clearInterval(timer); if (!reduce) timer = setInterval(() => show(i + 1), 5500); };
    dots.forEach((d, k) => d.addEventListener('click', () => { show(k); start(); }));
    let x0 = null, y0 = null;
    hero.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
    hero.addEventListener('touchend', (e) => {
      if (x0 == null) return;
      const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
      x0 = null;
      if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
      show(i + (dx < 0 ? 1 : -1)); start();
    });
    show(0); start();
  }

  /* ---------- featured carousel ---------- */
  $$('[data-carousel]').forEach((c) => {
    const track = $('.fc-track', c);
    const items = $$('.ph', track);
    const bars = $$('.bars button', c);
    const name = $('[data-name]', c), tag = $('[data-tag]', c), count = $('[data-count]', c);
    let i = 0;
    const go = (n) => {
      i = (n + items.length) % items.length;
      track.style.transform = 'translateX(-' + i * 100 + '%)';
      items.forEach((it, k) => it.setAttribute('aria-hidden', k !== i));
      bars.forEach((b, k) => b.setAttribute('aria-pressed', k === i));
      name.textContent = items[i].dataset.title;
      tag.textContent = items[i].dataset.label;
      count.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(items.length).padStart(2, '0');
    };
    bars.forEach((b, k) => b.addEventListener('click', () => go(k)));
    $('[data-prev]', c).addEventListener('click', () => go(i - 1));
    $('[data-next]', c).addEventListener('click', () => go(i + 1));
    go(0);
  });

  /* ---------- animated logo: the dot that drops ---------- */
  $$('.alogo').forEach((el) => {
    const blocks = $$('.lb', el);
    const dot = $('.ld', el);
    const dr = 0.34;
    const rest = [[0, 1.5], [1, 1.5], [2, 1.5], [3, 1.5], [4, 1.5], [5, 1.5]];
    const slot = [6.1, 2.5 - dr];
    const L = {
      0: { pos: rest, fill: '......', dot: slot, op: 1, fall: true },
      1: { pos: rest.map(([x, y]) => [x + 0.22, y]), fill: '......', dot: [6.1, -0.6], op: 0 },
      2: { pos: rest, fill: '......', dot: [6.1, 0.15], op: 1 },
      3: { pos: [[1, 0.5], [2, 0.5], [2, 1.5], [3, 1.5], [3, 2.5], [4, 2.5]], fill: '..c...', dot: [5.1, 3.5 - dr], op: 1, fall: true },
      4: { pos: [[1, 0.5], [2, 0.5], [3, 0.5], [4, 0.5], [1, 1.5], [1, 2.5]], fill: '....e.', dot: [2.1, 3.5 - dr], op: 1, fall: true }
    };
    const apply = (step) => {
      const t = blocks[0].offsetWidth;
      const l = L[step];
      blocks.forEach((b, k) => {
        b.style.transform = 'translate(' + l.pos[k][0] * t + 'px,' + l.pos[k][1] * t + 'px)';
        b.classList.toggle('c', l.fill[k] === 'c');
        b.classList.toggle('e', l.fill[k] === 'e');
      });
      dot.classList.toggle('fall', !!l.fall);
      dot.style.opacity = l.op;
      dot.style.transform = 'translate(' + l.dot[0] * t + 'px,' + l.dot[1] * t + 'px)';
    };
    apply(0);
    window.addEventListener('resize', () => apply(0));
    if (reduce) return;
    const order = [0, 1, 2, 0, 3, 0, 4];
    const wait = { 0: 2600, 1: 900, 2: 650, 3: 1700, 4: 1700 };
    let k = 0;
    const tick = () => { k = (k + 1) % order.length; apply(order[k]); setTimeout(tick, wait[order[k]]); };
    setTimeout(tick, 2200);
  });

  /* ---------- projects: filters + balanced masonry ---------- */
  const grid = $('.mgrid');
  if (grid) {
    const tiles = $$('.tile', grid);
    const chips = $$('.filters button');
    let filter = new URLSearchParams(location.search).get('f') || 'all';
    let lastCols = 0;
    const colsFor = () => (window.innerWidth >= 1100 ? 3 : window.innerWidth >= 640 ? 2 : 1);
    const layout = (force) => {
      const n = colsFor();
      if (!force && n === lastCols) return;
      lastCols = n;
      grid.innerHTML = '';
      const cols = Array.from({ length: n }, () => { const c = document.createElement('div'); c.className = 'mcol'; grid.appendChild(c); return c; });
      const h = new Array(n).fill(0);
      tiles.filter((t) => filter === 'all' || t.dataset.cat === filter).forEach((t) => {
        const k = h.indexOf(Math.min(...h));
        cols[k].appendChild(t);
        h[k] += 1 / parseFloat(t.dataset.ar);
        t.style.animation = 'none'; void t.offsetWidth; t.style.animation = '';
      });
    };
    chips.forEach((c) => {
      c.setAttribute('aria-pressed', c.dataset.f === filter);
      c.addEventListener('click', () => {
        filter = c.dataset.f;
        chips.forEach((x) => x.setAttribute('aria-pressed', x === c));
        layout(true);
      });
    });
    tiles.forEach((t) => {
      const toggle = () => {
        const open = !t.classList.contains('open');
        tiles.forEach((x) => { x.classList.remove('open'); x.setAttribute('aria-expanded', 'false'); });
        t.classList.toggle('open', open);
        t.setAttribute('aria-expanded', open);
      };
      t.addEventListener('click', toggle);
      t.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
    });
    layout(true);
    window.addEventListener('resize', () => layout(false));
  }

  /* ---------- contact form (demo: nothing is sent) ---------- */
  const form = $('#quote');
  if (form) {
    $$('.chips', form).forEach((group) => {
      const multi = group.dataset.multi === 'true';
      $$('.chip', group).forEach((chip) => chip.addEventListener('click', () => {
        const on = chip.getAttribute('aria-pressed') !== 'true';
        if (!multi) $$('.chip', group).forEach((c) => c.setAttribute('aria-pressed', 'false'));
        chip.setAttribute('aria-pressed', on);
      }));
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const first = (form.elements.name.value || '').trim().split(' ')[0];
      $('[data-first]', form).textContent = first ? ', ' + first : '';
      form.classList.add('sent');
      form.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    });
    $('[data-reset]', form)?.addEventListener('click', () => {
      form.reset();
      $$('.chip', form).forEach((c) => c.setAttribute('aria-pressed', 'false'));
      form.classList.remove('sent');
    });
  }

  /* ---------- placeholder links (concept site) ---------- */
  const toast = $('.toast');
  let toastTimer;
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href="#"]');
    if (!a) return;
    e.preventDefault();
    if (!toast) return;
    toast.textContent = (a.getAttribute('aria-label') || a.textContent.trim()) + ' · not part of this demo';
    toast.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('on'), 2400);
  });

  /* ---------- footer year ---------- */
  $$('[data-year]').forEach((y) => { y.textContent = new Date().getFullYear(); });
})();
