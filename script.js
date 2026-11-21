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


// =========================================================
// EFEITOS · pegada de terminal
// "reduzir movimento" ligado: ficam os efeitos de luz e texto; o que desliza pela tela não roda
// =========================================================
const mov = !reduz.matches;
const lim = (v, a, b) => Math.min(b, Math.max(a, v));
const SIMB = '!<>-_\\/[]{}=+*^?#01;:$%&';
const escapa = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// ---------- título decodificando: símbolos aleatórios viram o texto ----------
const lead = document.querySelector('.hero__lead');
const textoLead = lead ? lead.textContent.trim() : '';
const decodifica = () => {
  if (!lead) return;
  lead.classList.remove('rise'); lead.style.opacity = '1';
  const alvo = textoLead, dur = 1100, t0 = performance.now();
  const passo = (t) => {
    const k = lim((t - t0) / dur, 0, 1), fixos = Math.floor(alvo.length * k);
    let html = escapa(alvo.slice(0, fixos));
    for (let i = fixos; i < alvo.length; i++) html += alvo[i] === ' ' ? ' ' : `<span class="dec">${escapa(SIMB[(Math.random() * SIMB.length) | 0])}</span>`;
    lead.innerHTML = html + '<span class="hero__cursor" aria-hidden="true"></span>';
    if (k < 1) requestAnimationFrame(passo);
  };
  requestAnimationFrame(passo);
};
if (lead) { lead.setAttribute('aria-label', textoLead); lead.style.opacity = '0'; }

// ---------- abertura em terminal (1ª visita da sessão; toque ou tecla pula) ----------
let jaViu = false; try { jaViu = sessionStorage.getItem('intro-junior') === '1'; } catch (_) {}
if (jaViu) decodifica();
else {
  try { sessionStorage.setItem('intro-junior', '1'); } catch (_) {}
  const intro = document.createElement('div');
  intro.className = 'intro'; intro.setAttribute('aria-hidden', 'true');
  intro.innerHTML = '<div class="intro__box"><div class="intro__linhas"></div><div class="intro__marca">SJ<i></i></div><div class="intro__barra"><span></span></div><p class="intro__dica">toque para pular</p></div>';
  document.body.appendChild(intro);
  document.documentElement.style.overflow = 'hidden';
  const caixa = intro.querySelector('.intro__linhas'), marca = intro.querySelector('.intro__marca'), barraI = intro.querySelector('.intro__barra span');
  const linhas = [
    ['> ', 'iniciando ', '<b>junior.dev</b>'],
    ['> ', 'carregando: C# · Kotlin · TypeScript · Python ', '<i>✓</i>'],
    ['> ', 'conectando: Windows · Android · Web ', '<i>✓</i>'],
    ['> ', 'compilando portfólio… ', '<b>100%</b>'],
  ];
  let fim = false, li = 0, ci = 0, feito = '';
  const termina = () => {
    if (fim) return; fim = true;
    caixa.innerHTML = feito + linhas.slice(li).map(l => l.join('')).join('\n');
    barraI.style.transition = 'transform .3s ease'; barraI.style.transform = 'scaleX(1)';
    marca.classList.add('on');
    setTimeout(() => { intro.classList.add('sai'); document.documentElement.style.overflow = ''; decodifica(); }, 650);
    setTimeout(() => intro.remove(), 1700);
  };
  const total = linhas.reduce((n, l) => n + l[1].length, 0); let digitados = 0;
  const digita = () => {
    if (fim) return;
    if (li >= linhas.length) return termina();
    const [pre, txt, ok] = linhas[li];
    ci += 2; digitados += 2;
    barraI.style.transform = `scaleX(${lim(digitados / total, 0, 1) * 0.92})`;
    if (ci >= txt.length) { feito += pre + txt + ok + '\n'; li++; ci = 0; caixa.innerHTML = feito + '<span class="intro__cursor"></span>'; setTimeout(digita, 140); return; }
    caixa.innerHTML = feito + pre + txt.slice(0, ci) + '<span class="intro__cursor"></span>';
    setTimeout(digita, 16);
  };
  setTimeout(digita, 250);
  intro.addEventListener('pointerdown', termina);
  addEventListener('keydown', termina, { once: true });
  setTimeout(termina, 4000); /* garantia: nunca prende a pessoa na abertura */
}

// ---------- código caindo atrás do título ----------
const tela = document.querySelector('.hero__code');
const hero = document.querySelector('.hero');
let desenhaCodigo = null;
if (tela && hero) {
  const ctx = tela.getContext('2d'), CH = '01{}<>/;=()[]$#*+';
  let cols = [], larg = 0, alt = 0;
  const ajusta = () => {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const r = tela.getBoundingClientRect(); larg = r.width; alt = r.height;
    tela.width = larg * dpr; tela.height = alt * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cols = Array.from({ length: Math.ceil(larg / 22) }, () => ({ y: Math.random() * alt, v: 0.25 + Math.random() * 0.7, a: 0.1 + Math.random() * 0.25 }));
    if (!mov && desenhaCodigo) desenhaCodigo(false);
  };
  desenhaCodigo = (rastro) => {
    ctx.fillStyle = rastro ? 'rgba(15,15,13,.16)' : 'rgba(15,15,13,1)';
    ctx.fillRect(0, 0, larg, alt);
    ctx.font = '13px "JetBrains Mono", monospace';
    cols.forEach((c, i) => {
      if (!rastro) {
        for (let y = 20; y < alt; y += 22) { ctx.fillStyle = `rgba(255,91,35,${(c.a * (0.35 + Math.random() * 0.65)).toFixed(3)})`; ctx.fillText(CH[(Math.random() * CH.length) | 0], i * 22, y); }
        return;
      }
      ctx.fillStyle = `rgba(255,91,35,${c.a})`;
      ctx.fillText(CH[(Math.random() * CH.length) | 0], i * 22, c.y);
      c.y += c.v * 6; if (c.y > alt + 20) { c.y = -10; c.v = 0.25 + Math.random() * 0.7; }
    });
  };
  ajusta(); addEventListener('resize', ajusta);
  if (!mov) desenhaCodigo(false); /* parado: só um "retrato" do código */
}

// ---------- brilho que segue o mouse (computador) ----------
const brilho = document.querySelector('.hero__glow');
let gx = 0.65, gy = 0.35, alvoX = 0.65, alvoY = 0.35;
if (brilho && hero && mov && matchMedia('(hover: hover) and (pointer: fine)').matches) {
  hero.addEventListener('pointermove', (e) => { const r = hero.getBoundingClientRect(); alvoX = (e.clientX - r.left) / r.width; alvoY = (e.clientY - r.top) / r.height; });
}

// ---------- barra de leitura, palavras do Sobre, faixa ----------
const barra = document.createElement('div'); barra.className = 'progresso'; document.body.appendChild(barra);
const bio = document.querySelector('.bio'); const palavras = [];
if (bio) bio.querySelectorAll(':scope > p').forEach((p) => {
  p.innerHTML = p.textContent.trim().split(/\s+/).map(t => `<span class="pal">${escapa(t)}</span>`).join(' ');
  palavras.push(...p.querySelectorAll('.pal'));
});
const faixa = document.querySelector('.marquee'), trilho = document.querySelector('.marquee__track');
if (faixa && mov) faixa.classList.add('marquee--scroll');
let x = 0, vel = 0, dir = 1, yAnt = window.scrollY, ultimo = performance.now(), qCodigo = 0;

const quadro = (agora) => {
  const dt = Math.min(64, agora - ultimo); ultimo = agora;
  const y = window.scrollY, vh = window.innerHeight, dy = y - yAnt; yAnt = y;
  const total = document.documentElement.scrollHeight - vh;
  barra.style.transform = `scaleX(${total > 0 ? lim(y / total, 0, 1) : 0})`;
  if (palavras.length) {
    const r = bio.getBoundingClientRect();
    const prog = lim((vh * 0.82 - r.top) / (r.height + vh * 0.25), 0, 1) * (palavras.length + 6);
    palavras.forEach((w, i) => w.style.setProperty('--a', (0.16 + 0.84 * lim(prog - i, 0, 1)).toFixed(3)));
  }
  if (mov) {
    if (hero && y < vh * 1.2) { hero.style.transform = `translate3d(0, ${y * 0.28}px, 0)`; hero.style.opacity = lim(1 - y / (vh * 0.75), 0, 1); }
    if (desenhaCodigo && y < vh && (qCodigo = (qCodigo + 1) % 2) === 0) desenhaCodigo(true); /* ~30 quadros/s e só com a abertura à vista */
    if (brilho && hero) {
      gx += (alvoX - gx) * 0.06; gy += (alvoY - gy) * 0.06;
      const t = agora / 1000;
      brilho.style.transform = `translate(${gx * hero.offsetWidth - 260 + Math.sin(t * 0.6) * 30}px, ${gy * hero.offsetHeight - 260 + Math.cos(t * 0.5) * 24}px)`;
    }
    if (trilho) {
      if (dy) dir = dy > 0 ? 1 : -1;
      vel += (Math.abs(dy) - vel) * 0.12;
      x -= (0.045 + vel * 0.028) * dt * dir;
      const meio = trilho.scrollWidth / 2;
      if (meio) { if (x <= -meio) x += meio; if (x > 0) x -= meio; }
      trilho.style.transform = `translate3d(${x}px, 0, 0) skewX(${lim(-dir * vel * 0.35, -9, 9).toFixed(2)}deg)`;
    }
  } else if (brilho && hero) brilho.style.transform = `translate(${0.62 * hero.offsetWidth - 260}px, ${0.3 * hero.offsetHeight - 260}px)`;
  requestAnimationFrame(quadro);
};
requestAnimationFrame(quadro);
