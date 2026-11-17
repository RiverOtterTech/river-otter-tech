  // Nav
  const nav = document.getElementById('nav');
  addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 30));
  const menu = document.getElementById('mobile-menu');
  const mb=document.getElementById('menu-btn'); if(mb) mb.onclick = () => menu.classList.toggle('open');
  if(menu) menu.querySelectorAll('a').forEach(a => a.onclick = () => menu.classList.remove('open'));

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Live network topology background
  (function () {
    const cv = document.getElementById('topo'), ctx = cv.getContext('2d');
    let W, H, nodes = [], links = [], packets = [];
    const dpr = Math.min(devicePixelRatio || 1, 2);
    function build() {
      W = innerWidth; H = innerHeight;
      cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      nodes = []; links = []; packets = [];
      const step = W < 720 ? 150 : 170;
      for (let y = step / 2; y < H + step / 2; y += step) {
        for (let x = step / 2; x < W + step / 2; x += step) {
          if (Math.random() < 0.28) continue;
          nodes.push({ x: x + (Math.random() - .5) * step * .7, y: y + (Math.random() - .5) * step * .7,
            core: Math.random() < 0.12, ph: Math.random() * 6.28 });
        }
      }
      nodes.forEach((a, i) => {
        const near = nodes.map((b, j) => ({ j, d: Math.hypot(a.x - b.x, a.y - b.y) }))
          .filter(o => o.j !== i).sort((p, q) => p.d - q.d).slice(0, a.core ? 4 : 2);
        near.forEach(o => {
          if (o.d < step * 1.9 && !links.some(l => (l.a === o.j && l.b === i) || (l.a === i && l.b === o.j)))
            links.push({ a: i, b: o.j });
        });
      });
    }
    function spawn() {
      if (!links.length) return;
      const l = links[(Math.random() * links.length) | 0];
      const fwd = Math.random() < .5;
      packets.push({ l, t: 0, fwd, v: 0.004 + Math.random() * 0.006, g: Math.random() < 0.2 });
    }
    let t = 0;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.lineWidth = 1;
      links.forEach(l => {
        const a = nodes[l.a], b = nodes[l.b];
        ctx.strokeStyle = 'rgba(56,189,248,0.10)';
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      });
      nodes.forEach(n => {
        const pulse = (Math.sin(t * 0.02 + n.ph) + 1) / 2;
        if (n.core) {
          ctx.fillStyle = 'rgba(3,12,21,1)';
          ctx.strokeStyle = `rgba(56,189,248,${0.35 + pulse * 0.35})`;
          ctx.beginPath(); ctx.rect(n.x - 5, n.y - 5, 10, 10); ctx.fill(); ctx.stroke();
        } else {
          ctx.fillStyle = `rgba(56,189,248,${0.25 + pulse * 0.3})`;
          ctx.beginPath(); ctx.arc(n.x, n.y, 2, 0, 6.28); ctx.fill();
        }
      });
      if (!reduce && Math.random() < 0.18 && packets.length < 40) spawn();
      packets = packets.filter(p => p.t <= 1);
      packets.forEach(p => {
        p.t += p.v;
        const a = nodes[p.fwd ? p.l.a : p.l.b], b = nodes[p.fwd ? p.l.b : p.l.a];
        const x = a.x + (b.x - a.x) * p.t, y = a.y + (b.y - a.y) * p.t;
        const col = p.g ? '74,222,128' : '56,189,248';
        const tx = a.x + (b.x - a.x) * Math.max(0, p.t - 0.12), ty = a.y + (b.y - a.y) * Math.max(0, p.t - 0.12);
        const grad = ctx.createLinearGradient(tx, ty, x, y);
        grad.addColorStop(0, `rgba(${col},0)`); grad.addColorStop(1, `rgba(${col},0.8)`);
        ctx.strokeStyle = grad; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(x, y); ctx.stroke();
        ctx.fillStyle = `rgba(${col},1)`;
        ctx.beginPath(); ctx.arc(x, y, 1.8, 0, 6.28); ctx.fill();
      });
      t++;
      if (!reduce) requestAnimationFrame(draw);
    }
    let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { build(); if (reduce) draw(); }, 200); });
    build(); draw();
  })();

  // Terminal playback
  (function () {
    const lines = document.querySelectorAll('#term .ln');
    if (!lines.length) return;
    if (reduce) { lines.forEach(l => l.classList.add('on')); return; }
    function play() {
      lines.forEach(l => l.classList.remove('on'));
      lines.forEach((l, i) => setTimeout(() => l.classList.add('on'), 500 + i * 520));
      setTimeout(play, 500 + lines.length * 520 + 5000);
    }
    play();
  })();

  // Scroll reveal
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
  }), { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // Pre-select inquiry type from CTAs


  // Contact form (Formspree)
  const form = document.getElementById('contact-form');
  if (form) form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('button[type=submit]');
    btn.textContent = 'Sending...'; btn.disabled = true;
    try {
      const r = await fetch('https://formspree.io/f/mzdwkzkg', { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      if (r.ok) { location.href = '/thank-you/'; return; }
      throw 0;
    } catch {
      alert('Something went wrong. Please try again or email hello@riverottertech.com.');
      btn.textContent = 'Send it over'; btn.disabled = false;
    }
  });
