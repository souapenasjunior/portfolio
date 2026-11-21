// ano
document.querySelectorAll('.ano').forEach(el => { el.textContent = new Date().getFullYear(); });

// relógio de Brasília
const relogio = document.getElementById('relogio');
const tick = () => {
  try {
    relogio.textContent = new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo'
    }).format(new Date());
  } catch (_) { relogio.textContent = ''; }
};
tick();
setInterval(tick, 15000);

// entrada suave
const items = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  items.forEach((el) => {
    const irmaos = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
    const i = irmaos.indexOf(el);
    if (el.parentElement.matches('.traits, .stack') && i > 0) el.style.transitionDelay = `${(i % 3) * 80}ms`;
    io.observe(el);
  });
} else {
  items.forEach(el => el.classList.add('is-in'));
}

// seção ativa no menu
const links = [...document.querySelectorAll('.bar__nav a')];
if ('IntersectionObserver' in window) {
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  links.forEach(a => { const s = document.querySelector(a.getAttribute('href')); if (s) spy.observe(s); });
}

const reduz = window.matchMedia('(prefers-reduced-motion: reduce)');

// inclinação 3D dos prints seguindo o mouse
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !reduz.matches) {
  document.querySelectorAll('[data-tilt]').forEach((st) => {
    st.addEventListener('pointermove', (e) => {
      const r = st.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      st.classList.add('is-tilting');
      st.style.setProperty('--ry', `${(x * 10).toFixed(2)}deg`);
      st.style.setProperty('--rx', `${(-y * 8).toFixed(2)}deg`);
    });
    st.addEventListener('pointerleave', () => {
      st.classList.remove('is-tilting');
      st.style.setProperty('--ry', '0deg');
      st.style.setProperty('--rx', '0deg');
    });
  });
}

// galeria de fotos dos projetos
const lb = document.getElementById('lb');
const lbImg = document.getElementById('lbImg');
let fotos = [], atual = 0, ultimoFoco = null, posRolagem = 0;
const mostra = (i) => {
  atual = (i + fotos.length) % fotos.length;
  lbImg.src = fotos[atual];
  document.getElementById('lbCount').textContent = `${atual + 1} / ${fotos.length}`;
};
const abre = (proj, i) => {
  fotos = proj.dataset.gallery.split(',');
  document.getElementById('lbTitle').textContent = proj.dataset.title;
  ultimoFoco = document.activeElement;
  lb.hidden = false;
  // trava a página de trás (o Safari do iPhone ignora overflow: hidden)
  posRolagem = window.scrollY;
  Object.assign(document.body.style, { position: 'fixed', top: `-${posRolagem}px`, left: '0', right: '0', overflow: 'hidden' });
  mostra(i);
  document.getElementById('lbClose').focus({ preventScroll: true });
};
const fecha = () => {
  lb.hidden = true;
  Object.assign(document.body.style, { position: '', top: '', left: '', right: '', overflow: '' });
  window.scrollTo(0, posRolagem);
  lbImg.removeAttribute('src');
  if (ultimoFoco) ultimoFoco.focus({ preventScroll: true });
};
document.addEventListener('click', (e) => {
  const alvo = e.target.closest('.shot, [data-open]');
  if (!alvo) return;
  const proj = alvo.closest('[data-gallery]');
  if (!proj) return;
  abre(proj, Number(alvo.dataset.i ?? alvo.dataset.open ?? 0));
});
document.addEventListener('keydown', (e) => {
  if (!lb.hidden) {
    if (e.key === 'Escape') fecha();
    if (e.key === 'ArrowRight') mostra(atual + 1);
    if (e.key === 'ArrowLeft') mostra(atual - 1);
    return;
  }
  const alvo = e.target.closest && e.target.closest('[data-open]');
  if (alvo && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); abre(alvo.closest('[data-gallery]'), 0); }
});
document.getElementById('lbClose').addEventListener('click', fecha);
document.getElementById('lbPrev').addEventListener('click', () => mostra(atual - 1));
document.getElementById('lbNext').addEventListener('click', () => mostra(atual + 1));
lb.addEventListener('click', (e) => { if (e.target === lb) fecha(); });
let toqueX = null;
lb.addEventListener('touchstart', (e) => { toqueX = e.touches[0].clientX; }, { passive: true });
lb.addEventListener('touchend', (e) => {
  if (toqueX === null) return;
  const dx = e.changedTouches[0].clientX - toqueX;
  if (Math.abs(dx) > 50) mostra(atual + (dx < 0 ? 1 : -1));
  toqueX = null;
});

// ---------- movimento ao rolar ----------
if (!reduz.matches) {
  const lim = (v, a, b) => Math.min(b, Math.max(a, v));

  // barra de leitura no topo
  const barra = document.createElement('div');
  barra.className = 'progresso';
  document.body.appendChild(barra);

  // abertura: título palavra por palavra
  const hero = document.querySelector('.hero');
  const lead = document.querySelector('.hero__lead');
  if (lead) {
    lead.classList.remove('rise');
    lead.innerHTML = lead.textContent.trim().split(/\s+/).map((p, i) => `<span class="w" style="--i:${i}">${p}</span>`).join(' ');
  }
  if (hero) hero.classList.add('hero--movel');

  // sobre: cada palavra vira um pedaço que acende com a rolagem
  const bio = document.querySelector('.bio');
  const palavras = [];
  if (bio) bio.querySelectorAll(':scope > p').forEach((p) => {
    p.innerHTML = p.textContent.trim().split(/\s+/).map(t => `<span class="pal">${t}</span>`).join(' ');
    palavras.push(...p.querySelectorAll('.pal'));
  });

  // faixa de linguagens guiada pela rolagem
  const faixa = document.querySelector('.marquee');
  const trilho = document.querySelector('.marquee__track');
  if (faixa) faixa.classList.add('marquee--scroll');
  let x = 0, vel = 0, dir = 1, yAnt = window.scrollY, ultimo = performance.now();

  const quadro = (agora) => {
    const dt = Math.min(64, agora - ultimo); ultimo = agora;
    const y = window.scrollY, vh = window.innerHeight;
    const dy = y - yAnt; yAnt = y;

    // barra de leitura
    const total = document.documentElement.scrollHeight - vh;
    barra.style.transform = `scaleX(${total > 0 ? lim(y / total, 0, 1) : 0})`;

    // abertura sobe mais devagar e some ao rolar
    if (hero && y < vh * 1.2) {
      hero.style.transform = `translate3d(0, ${y * 0.28}px, 0)`;
      hero.style.opacity = lim(1 - y / (vh * 0.75), 0, 1);
    }

    // palavras do "Sobre" acendem da primeira à última
    if (palavras.length) {
      const r = bio.getBoundingClientRect();
      const prog = lim((vh * 0.82 - r.top) / (r.height + vh * 0.25), 0, 1) * (palavras.length + 6);
      palavras.forEach((w, i) => w.style.setProperty('--a', (0.16 + 0.84 * lim(prog - i, 0, 1)).toFixed(3)));
    }

    // faixa: anda sozinha, acelera e inclina com a rolagem, segue a direção
    if (trilho) {
      if (dy) dir = dy > 0 ? 1 : -1;
      vel += (Math.abs(dy) - vel) * 0.12;
      x -= (0.045 + vel * 0.028) * dt * dir;
      const meio = trilho.scrollWidth / 2;
      if (meio) { if (x <= -meio) x += meio; if (x > 0) x -= meio; }
      trilho.style.transform = `translate3d(${x}px, 0, 0) skewX(${lim(-dir * vel * 0.35, -9, 9).toFixed(2)}deg)`;
    }
    requestAnimationFrame(quadro);
  };
  requestAnimationFrame(quadro);
}
