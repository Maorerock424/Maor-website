document.getElementById('year').textContent = new Date().getFullYear();

/* ---------- Particle 3D-ish background ---------- */
(function particles(){
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let w, h, particlesArr;

  function resize(){
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight * (document.body.scrollHeight / window.innerHeight > 3 ? 1 : document.body.scrollHeight / window.innerHeight);
    h = canvas.height = document.body.scrollHeight;
  }

  function makeParticles(){
    const count = Math.min(90, Math.floor((window.innerWidth * window.innerHeight) / 18000));
    particlesArr = Array.from({length: count}, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      z: Math.random(), // depth 0..1 -> affects size/speed/opacity
      vy: 0.05 + Math.random() * 0.15,
      r: 0.6 + Math.random() * 1.8
    }));
  }

  function tick(){
    ctx.clearRect(0, 0, w, h);
    const scrollY = window.scrollY;
    for(const p of particlesArr){
      const depth = 0.4 + p.z * 1.2;
      const px = p.x;
      const py = (p.y - scrollY * 0.15 * depth) % h;
      const yy = py < 0 ? py + h : py;
      const alpha = 0.15 + p.z * 0.35;
      ctx.beginPath();
      ctx.arc(px, yy, p.r * depth, 0, Math.PI * 2);
      const isGold = p.z > 0.6;
      ctx.fillStyle = isGold ? `rgba(212,175,55,${alpha})` : `rgba(124,92,255,${alpha})`;
      ctx.fill();
      p.y += p.vy;
      if(p.y > h) p.y = 0;
    }
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', () => { resize(); makeParticles(); });
  resize();
  makeParticles();
  tick();
})();

/* ---------- Nav ---------- */
const nav = document.getElementById('site-nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
});
const navToggle = document.getElementById('navToggle');
const navDrawer = document.getElementById('navDrawer');
const navOverlay = document.getElementById('navOverlay');
const navClose = document.getElementById('navClose');
const navLinks = document.getElementById('navLinks');
function openDrawer(){
  navDrawer.classList.add('open'); navOverlay.classList.add('open'); navToggle.classList.add('open');
  navToggle.setAttribute('aria-expanded','true');
}
function closeDrawer(){
  navDrawer.classList.remove('open'); navOverlay.classList.remove('open'); navToggle.classList.remove('open');
  navToggle.setAttribute('aria-expanded','false');
}
navToggle.addEventListener('click', () => navDrawer.classList.contains('open') ? closeDrawer() : openDrawer());
navClose.addEventListener('click', closeDrawer);
navOverlay.addEventListener('click', closeDrawer);
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', closeDrawer));
document.addEventListener('keydown', e => { if(e.key === 'Escape') closeDrawer(); });

/* ---------- Hero 3D tilt ---------- */
const heroVisual = document.getElementById('heroVisual');
const heroTilt = document.getElementById('heroTilt');
if(heroVisual && window.matchMedia('(pointer:fine)').matches){
  heroVisual.addEventListener('mousemove', (e) => {
    const rect = heroVisual.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    heroTilt.style.transform = `rotateY(${x * 14}deg) rotateX(${-y * 14}deg)`;
  });
  heroVisual.addEventListener('mouseleave', () => {
    heroTilt.style.transform = 'rotateY(0deg) rotateX(0deg)';
  });
}

/* ---------- Reveal on scroll ---------- */
const revealEls = document.querySelectorAll('.reveal');

// Safety net: never let content stay invisible if IntersectionObserver
// fails to fire (some browsers delay/throttle it on background or slow tabs).
revealEls.forEach(el => {
  const rect = el.getBoundingClientRect();
  if(rect.top < window.innerHeight && rect.bottom > 0){
    el.classList.add('in-view');
  }
});
setTimeout(() => {
  revealEls.forEach(el => el.classList.add('in-view'));
}, 1200);

if('IntersectionObserver' in window){
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, {threshold: 0.15});
  revealEls.forEach(el => io.observe(el));
}

/* ---------- Services tabs ---------- */
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.services-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.querySelector(`.services-panel[data-panel="${btn.dataset.tab}"]`).classList.add('active');
  });
});

/* ---------- Vimeo helpers ---------- */
function vimeoEmbedUrl(url){
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)(?:\/([a-zA-Z0-9]+))?/);
  if(!match) return null;
  const id = match[1];
  const hash = match[2] ? `?h=${match[2]}` : '';
  return `https://player.vimeo.com/video/${id}${hash}`;
}

const lightbox = document.getElementById('lightbox');
const lightboxContent = document.getElementById('lightboxContent');
document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => { if(e.target === lightbox) closeLightbox(); });
function openLightbox(vimeoUrl){
  const embed = vimeoEmbedUrl(vimeoUrl);
  if(!embed) return;
  lightboxContent.innerHTML = `<iframe src="${embed}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
  lightbox.classList.add('open');
}
function closeLightbox(){
  lightbox.classList.remove('open');
  lightboxContent.innerHTML = '';
}

/* ---------- Dynamic content loaders ---------- */
// Parses lines like: "id: Title - description | https://vimeo.com/..."
function parseManifest(text){
  return text.split('\n').map(l => l.trim()).filter(Boolean).filter(l => !l.startsWith('#')).map(line => {
    const [idPart, rest] = line.split(':');
    if(!rest) return null;
    const [titlePart, linkPart] = rest.split('|');
    return {
      id: idPart.trim(),
      title: (titlePart || '').trim(),
      link: (linkPart || '').trim()
    };
  }).filter(Boolean);
}

// Portfolio
fetch('assets/portfolio/items.txt').then(r => r.ok ? r.text() : Promise.reject()).then(text => {
  const items = parseManifest(text);
  if(!items.length) return;
  const grid = document.getElementById('portfolioGrid');
  grid.innerHTML = '';
  items.forEach(item => {
    const el = document.createElement('div');
    el.className = 'portfolio-item';
    const hasVideo = item.link && item.link.includes('vimeo.com');
    el.innerHTML = `
      <img src="assets/portfolio/${item.id}.jpg" alt="${item.title}" onerror="this.style.display='none'">
      ${hasVideo ? '<div class="play-badge">▶</div>' : ''}
      <div class="pf-caption"><h4>${item.title}</h4></div>
    `;
    if(hasVideo) el.addEventListener('click', () => openLightbox(item.link));
    grid.appendChild(el);
  });
}).catch(() => {});

// Press
fetch('assets/press/links.txt').then(r => r.ok ? r.text() : Promise.reject()).then(text => {
  const items = text.split('\n').map(l => l.trim()).filter(Boolean).filter(l => !l.startsWith('#')).map(line => {
    const [idPart, rest] = line.split(':');
    if(!rest) return null;
    const parts = rest.split('|').map(s => s.trim());
    return {id: idPart.trim(), title: parts[0] || '', link: parts[1] || '#', quote: parts[2] || ''};
  }).filter(Boolean);
  if(!items.length) return;

  const grid = document.getElementById('pressGrid');
  grid.innerHTML = '';
  const logoStrip = document.getElementById('pressLogoStrip');
  logoStrip.innerHTML = '';

  items.forEach(item => {
    const isVimeo = item.link.includes('vimeo.com');
    const card = document.createElement(isVimeo ? 'div' : 'a');
    card.className = 'press-card';
    if(!isVimeo){ card.href = item.link; card.target = '_blank'; card.rel = 'noopener'; }
    else card.style.cursor = 'pointer';
    card.innerHTML = `
      <span class="press-chip"><img src="assets/press/${item.id}.png" alt="${item.title}" onerror="this.parentElement.style.display='none'"></span>
      <h4>${item.title}</h4>
      ${item.quote ? `<p>"${item.quote}"</p>` : ''}
    `;
    if(isVimeo) card.addEventListener('click', () => openLightbox(item.link));
    grid.appendChild(card);

    const chip = document.createElement('span');
    chip.className = 'logo-tile logo-tile--sm';
    const logo = document.createElement('img');
    logo.src = `assets/press/${item.id}.png`;
    logo.alt = item.title;
    logo.onerror = () => chip.remove();
    chip.appendChild(logo);
    logoStrip.appendChild(chip);
  });
}).catch(() => {});

// Clients — build all tiles directly (robust, no probe timing), seamless marquee.
// A tile whose image 404s hides itself; whatever exists always shows.
(function loadClients(){
  const track = document.getElementById('clientsTrack');
  if(!track) return;
  const V = '3'; // cache-busting version — forces fresh logo fetches
  const ids = [];
  for(let i = 1; i <= 15; i++) ids.push('client-' + String(i).padStart(2, '0'));

  function buildSet(){
    ids.forEach(id => {
      const tile = document.createElement('div');
      tile.className = 'logo-tile';
      const img = document.createElement('img');
      img.src = `assets/clients/${id}.png?v=${V}`;
      img.alt = 'לקוח';
      img.onerror = () => tile.remove();
      tile.appendChild(img);
      track.appendChild(tile);
    });
  }
  // three copies so the loop always overflows the viewport and never shows a gap
  buildSet(); buildSet(); buildSet();
})();
