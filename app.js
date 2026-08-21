/* ============================================================
   한솔어린이집 — 공용 스크립트
   ============================================================ */
const SUPABASE_URL = 'https://bxfobslxjrkuturlihbt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4Zm9ic2x4anJrdXR1cmxpaGJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwMDM3NDgsImV4cCI6MjEwMjU3OTc0OH0.xb6Ar-ugBzbz0-v9LbCumjPZWqgRqk3feRomp0yVfFI';
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ---------- 메뉴 ---------- */
const menuBtn = document.getElementById('menuBtn');
const nav = document.getElementById('nav');
if (menuBtn && nav){
  menuBtn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuBtn.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', open);
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open');
    menuBtn.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
  }));
}

/* ---------- 헤더 그림자 ---------- */
const siteHeader = document.getElementById('siteHeader');
if (siteHeader){
  addEventListener('scroll', () => {
    siteHeader.classList.toggle('stuck', scrollY > 12);
  }, { passive:true });
}

/* ---------- 등장 애니메이션 ---------- */
const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold:0.12, rootMargin:'0px 0px -40px 0px' });
function watchAll(){ document.querySelectorAll('.rise:not(.in)').forEach(el => io.observe(el)); }
watchAll();

/* ---------- 글자 처리 ---------- */
function esc(t){
  return String(t == null ? '' : t)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function hl(text){
  return esc(text).replace(/\*\*(.+?)\*\*/g, '<mark>$1</mark>');
}

/* ============================================================
   사진 확대 보기
   ============================================================ */
const lb = document.getElementById('lightbox');
const lbImg = document.getElementById('lbImg');
const lbCap = document.getElementById('lbCap');
let lbList = [], lbIdx = 0;

let lbToken = 0;
function lbShow(i){
  if (!lb || lbList.length === 0) return;
  lbIdx = (i + lbList.length) % lbList.length;
  const item = lbList[lbIdx];
  lbCap.textContent = item.cap || '';
  lbImg.alt = item.cap || '';
  lbImg.classList.remove('ready');
  const loading = document.getElementById('lbLoading');
  if (loading) loading.classList.add('on');

  const token = ++lbToken;
  const pre = new Image();
  pre.decoding = 'async';
  pre.onload = () => {
    if (token !== lbToken) return;
    lbImg.src = item.url;
    lbImg.classList.add('ready');
    if (loading) loading.classList.remove('on');
    /* 다음 사진 미리 받아두기 */
    if (lbList.length > 1){
      const nx = new Image();
      nx.src = lbList[(lbIdx + 1) % lbList.length].url;
    }
  };
  pre.onerror = () => {
    if (token !== lbToken) return;
    lbImg.src = item.url;
    lbImg.classList.add('ready');
    if (loading) loading.classList.remove('on');
  };
  pre.src = item.url;
}
function lbOpen(list, i){
  if (!lb) return;
  lbList = list; lbShow(i);
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
  document.body.classList.add('locked');
}
function lbClose(){
  if (!lb) return;
  lb.classList.remove('open');
  const dm = document.getElementById('dayModal');
  if (!dm || !dm.classList.contains('open')){
    document.body.style.overflow = '';
    document.body.classList.remove('locked');
  }
}
if (lb){
  document.getElementById('lbClose').addEventListener('click', lbClose);
  document.getElementById('lbPrev').addEventListener('click', e => { e.stopPropagation(); lbShow(lbIdx - 1); });
  document.getElementById('lbNext').addEventListener('click', e => { e.stopPropagation(); lbShow(lbIdx + 1); });
  lb.addEventListener('click', e => { if (e.target === lb || e.target.tagName === 'FIGURE') lbClose(); });
}
addEventListener('keydown', e => {
  if (!lb || !lb.classList.contains('open')) return;
  if (e.key === 'Escape') lbClose();
  if (e.key === 'ArrowLeft') lbShow(lbIdx - 1);
  if (e.key === 'ArrowRight') lbShow(lbIdx + 1);
});

function photoTile(item, list, idx, withCap){
  const div = document.createElement('div');
  div.className = 'gallery-item';
  div.setAttribute('role','button');
  div.setAttribute('tabindex','0');
  div.innerHTML = '<img src="' + item.image_url + '" alt="' + esc(item.caption) +
    '" loading="lazy" decoding="async" width="600" height="450">' +
    (withCap && item.caption ? '<span class="gallery-cap">' + esc(item.caption) + '</span>' : '');
  div.addEventListener('click', () => lbOpen(list, idx));
  div.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); lbOpen(list, idx); }
  });
  return div;
}

/* ============================================================
   후기
   ============================================================ */
function sortReviews(data){
  return data.slice().sort((a,b) => {
    const pa = a.pinned ? 1 : 0, pb = b.pinned ? 1 : 0;
    if (pa !== pb) return pb - pa;
    return (a.sort_order || 0) - (b.sort_order || 0);
  });
}
function reviewInner(r){
  return '<div class="review-inner' + (r.pinned ? ' pinned' : '') + '">' +
    (r.pinned ? '<span class="pin-badge">📌 추천</span>' : '') +
    '<span class="stars">★★★★★</span>' +
    '<p class="review-text">' + hl(r.text) + '</p>' +
    '<div class="review-meta"><span class="review-name">' + esc(r.name) + '</span><span>' + esc(r.year) + '</span></div>' +
    '</div>';
}

async function renderReviewTeaser(){
  const box = document.getElementById('reviewTeaser');
  if (!box) return;
  const { data } = await sb.from('reviews').select('*');
  if (!data || !data.length) return;
  box.innerHTML = '';
  sortReviews(data).slice(0,3).forEach(r => {
    const holder = document.createElement('div');
    holder.innerHTML = reviewInner(r);
    box.appendChild(holder.firstChild);
  });
}

async function renderReviewsFull(){
  const track = document.getElementById('reviewTrack');
  if (!track) return;
  const { data } = await sb.from('reviews').select('*');
  if (!data || !data.length) return;
  const list = sortReviews(data);
  list.forEach(r => {
    const div = document.createElement('div');
    div.className = 'review-card';
    div.innerHTML = reviewInner(r);
    track.appendChild(div);
  });
  setupReviewSlider(track, list.length);
}

function setupReviewSlider(track, count){
  const prevBtn = document.getElementById('rvPrev');
  const nextBtn = document.getElementById('rvNext');
  const dotsBox = document.getElementById('rvDots');
  Array.from(track.children).slice(0,3).forEach(c => track.appendChild(c.cloneNode(true)));

  let idx = 0, timer = null, animating = false;
  const visible = () => innerWidth >= 1020 ? 3 : innerWidth >= 720 ? 2 : 1;

  dotsBox.innerHTML = '';
  for (let i = 0; i < count; i++){
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'rv-dot' + (i === 0 ? ' on' : '');
    b.setAttribute('aria-label', (i+1) + '번째 후기');
    b.addEventListener('click', () => { go(i, true); restart(); });
    dotsBox.appendChild(b);
  }
  const dots = Array.from(dotsBox.children);

  function go(i, animate){
    idx = i;
    track.style.transition = animate ? 'transform .7s cubic-bezier(.4,.1,.2,1)' : 'none';
    track.style.transform = 'translateX(-' + (idx * (100 / visible())) + '%)';
    const cur = ((idx % count) + count) % count;
    dots.forEach((d, j) => d.classList.toggle('on', j === cur));
  }
  function step(dir){
    if (animating) return;
    animating = true;
    const next = idx + dir;
    if (next < 0){
      go(count, false);
      requestAnimationFrame(() => requestAnimationFrame(() => go(count - 1, true)));
    } else go(next, true);
    const done = () => {
      track.removeEventListener('transitionend', done);
      if (idx >= count) go(idx - count, false);
      animating = false;
    };
    track.addEventListener('transitionend', done);
    setTimeout(() => { animating = false; }, 900);
  }
  function start(){ timer = setInterval(() => step(1), 4600); }
  function stop(){ if (timer){ clearInterval(timer); timer = null; } }
  function restart(){ stop(); start(); }

  prevBtn.addEventListener('click', () => { step(-1); restart(); });
  nextBtn.addEventListener('click', () => { step(1); restart(); });
  const wrap = track.closest('.review-wrap');
  wrap.addEventListener('mouseenter', stop);
  wrap.addEventListener('mouseleave', start);

  let sx = 0, sy = 0, sw = false;
  track.addEventListener('touchstart', e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; sw = true; stop(); }, { passive:true });
  track.addEventListener('touchend', e => {
    if (!sw) return; sw = false;
    const dx = e.changedTouches[0].clientX - sx;
    const dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) step(dx < 0 ? 1 : -1);
    restart();
  }, { passive:true });

  go(0, false); start();
  addEventListener('resize', () => go(idx, false));
}

/* ============================================================
   어린이집 경관 — 8장
   ============================================================ */
async function renderScenery(){
  const box = document.getElementById('sceneryGrid');
  if (!box) return;
  const { data } = await sb.from('gallery').select('*')
    .eq('category', '경관').order('created_at', { ascending:false });
  if (!data || !data.length){
    box.innerHTML = '<p class="gallery-empty">아직 등록된 사진이 없어요.</p>';
    return;
  }
  const items = data.slice(0, 8);
  const list = items.map(i => ({ url:i.image_url, cap:i.caption || '' }));
  box.innerHTML = '';
  items.forEach((it, i) => box.appendChild(photoTile(it, list, i, true)));
}

/* ============================================================
   아이들의 하루 — 폴더 3개
   ============================================================ */
const DAY_FOLDERS = [
  { key:'일상',        label:'일상 사진',      cls:'f-red' },
  { key:'활동',        label:'활동 사진',      cls:'f-sky' },
  { key:'현장체험학습', label:'현장체험학습',   cls:'f-sun' }
];
const PER_PAGE = 4;

async function renderDayFolders(){
  const folderBox = document.getElementById('dayFolders');
  if (!folderBox) return;

  const { data } = await sb.from('gallery').select('*')
    .eq('category', '활동').order('created_at', { ascending:false });
  const all = data || [];

  folderBox.innerHTML = '';
  DAY_FOLDERS.forEach(f => {
    const items = all.filter(i => (i.folder || '일상') === f.key);
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'day-folder ' + f.cls;
    card.innerHTML =
      '<svg viewBox="0 0 96 76" aria-hidden="true">' +
        '<path d="M5 16a8 8 0 0 1 8-8h23l9 10h38a8 8 0 0 1 8 8v37a8 8 0 0 1-8 8H13a8 8 0 0 1-8-8Z" class="f-back" stroke="#3D3226" stroke-width="3.4" stroke-linejoin="round"/>' +
        '<path d="M5 30h86v33a8 8 0 0 1-8 8H13a8 8 0 0 1-8-8Z" class="f-front" stroke="#3D3226" stroke-width="3.4" stroke-linejoin="round"/>' +
        '<path d="M48 62c-8-6-14-10-14-16a7 7 0 0 1 14-3 7 7 0 0 1 14 3c0 6-6 10-14 16Z" fill="#fff" stroke="#3D3226" stroke-width="2.8" stroke-linejoin="round"/>' +
      '</svg>' +
      '<span class="day-name">' + f.label + '</span>';

    card.addEventListener('click', () => {
      folderBox.querySelectorAll('.day-folder').forEach(x => x.classList.remove('active'));
      card.classList.add('active');
      showFolder(f, items);
    });
    folderBox.appendChild(card);
  });
}

function showFolder(folder, items){
  const modal = document.getElementById('dayModal');
  if (!modal) return;
  const panel = modal.querySelector('.day-panel');
  const titleEl = modal.querySelector('.day-title');
  const tagEl = modal.querySelector('.day-tag');
  const grid = modal.querySelector('.day-photos');
  const foot = modal.querySelector('.day-foot');

  panel.className = 'day-panel ' + folder.cls;
  titleEl.textContent = folder.label;

  if (items.length === 0){
    tagEl.textContent = '';
    grid.innerHTML = '<p class="gallery-empty" style="grid-column:1/-1;">아직 등록된 사진이 없어요.</p>';
    foot.innerHTML = '';
    openDayModal();
    return;
  }

  const list = items.map(i => ({ url:i.image_url, cap:folder.label }));
  const pages = Math.ceil(items.length / PER_PAGE);
  let page = 0;

  tagEl.textContent = items.length + '장';
  foot.innerHTML = pages > 1 ?
    '<div class="pager">' +
      '<button type="button" class="pg-btn" data-go="-1" aria-label="이전 사진">‹</button>' +
      '<span class="pg-now"></span>' +
      '<button type="button" class="pg-btn" data-go="1" aria-label="다음 사진">›</button>' +
    '</div>' : '';

  const now = foot.querySelector('.pg-now');

  function draw(){
    grid.innerHTML = '';
    items.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE)
         .forEach((it, i) => grid.appendChild(photoTile(it, list, page * PER_PAGE + i, false)));
    if (now) now.textContent = (page + 1) + ' / ' + pages;
  }
  foot.querySelectorAll('.pg-btn').forEach(b => {
    b.addEventListener('click', () => {
      page = (page + Number(b.dataset.go) + pages) % pages;
      draw();
      panel.scrollTop = 0;
    });
  });
  draw();
  openDayModal();
}

function openDayModal(){
  const modal = document.getElementById('dayModal');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  document.body.classList.add('locked');
}
function closeDayModal(){
  const modal = document.getElementById('dayModal');
  if (!modal) return;
  modal.classList.remove('open');
  if (!lb || !lb.classList.contains('open')){
    document.body.style.overflow = '';
    document.body.classList.remove('locked');
  }
  document.querySelectorAll('.day-folder').forEach(x => x.classList.remove('active'));
}

(function initDayModal(){
  const modal = document.getElementById('dayModal');
  if (!modal) return;
  modal.querySelector('.close').addEventListener('click', closeDayModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeDayModal(); });
  addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('open') && (!lb || !lb.classList.contains('open'))) closeDayModal();
  });
})();

/* ============================================================
   육아 이야기
   ============================================================ */
function todayStr(){
  const t = new Date();
  return t.getFullYear() + '-' + String(t.getMonth()+1).padStart(2,'0') + '-' + String(t.getDate()).padStart(2,'0');
}

async function renderPostTeaser(){
  const box = document.getElementById('postTeaser');
  if (!box) return;
  const { data } = await sb.from('posts').select('*')
    .lte('publish_date', todayStr()).order('publish_date', { ascending:false }).limit(2);
  if (!data || !data.length) return;
  box.innerHTML = '';
  data.forEach(p => {
    const a = document.createElement('a');
    a.className = 'teaser-post';
    a.href = 'stories.html?post=' + p.id;
    const d = p.publish_date.split('-');
    a.innerHTML =
      '<div class="post-head"><h3 class="post-title">' + esc(p.title) + '</h3>' +
      '<span class="post-date">' + d[0] + '.' + d[1] + '.' + d[2] + '</span></div>' +
      '<p class="post-excerpt">' + esc(p.content.replace(/\s+/g,' ').slice(0,90)) + '…</p>' +
      '<div class="post-toggle">읽어보기 →</div>';
    box.appendChild(a);
  });
}

async function renderPostsPaged(){
  const listEl = document.getElementById('postList');
  if (!listEl) return;
  const { data } = await sb.from('posts').select('*')
    .lte('publish_date', todayStr()).order('publish_date', { ascending:false });
  if (!data || !data.length){
    listEl.innerHTML = '<p class="post-empty">아직 등록된 글이 없어요.</p>';
    return;
  }

  const PER = 3;
  const pages = Math.ceil(data.length / PER);
  const openId = new URLSearchParams(location.search).get('post');
  let page = 0;
  if (openId){
    const i = data.findIndex(p => String(p.id) === openId);
    if (i >= 0) page = Math.floor(i / PER);
  }

  const pager = document.getElementById('postPager');
  const now = document.getElementById('postPageNow');

  function draw(scroll){
    listEl.innerHTML = '';
    data.slice(page * PER, page * PER + PER).forEach(p => {
      const card = document.createElement('div');
      card.className = 'post';
      const d = p.publish_date.split('-');
      card.innerHTML =
        '<div class="post-head"><h3 class="post-title">' + esc(p.title) + '</h3>' +
        '<span class="post-date">' + d[0] + '.' + d[1] + '.' + d[2] + '</span></div>' +
        '<p class="post-excerpt">' + esc(p.content.replace(/\s+/g,' ').slice(0,95)) + '…</p>' +
        '<div class="post-body">' + esc(p.content) +
          '<button type="button" class="post-share" data-id="' + p.id + '" data-title="' + esc(p.title) + '">🔗 이 글 링크 복사</button>' +
        '</div>' +
        '<div class="post-toggle">자세히 보기 →</div>';

      card.addEventListener('click', ev => {
        if (ev.target.closest('.post-share')) return;
        const open = card.classList.toggle('open');
        card.querySelector('.post-toggle').textContent = open ? '접기 ↑' : '자세히 보기 →';
      });
      card.querySelector('.post-share').addEventListener('click', async ev => {
        ev.stopPropagation();
        const btn = ev.currentTarget;
        const url = location.origin + location.pathname + '?post=' + btn.dataset.id;
        try {
          if (navigator.share){ await navigator.share({ title: btn.dataset.title, url }); return; }
          await navigator.clipboard.writeText(url);
        } catch(e){
          const ta = document.createElement('textarea');
          ta.value = url; document.body.appendChild(ta); ta.select();
          try { document.execCommand('copy'); } catch(e2){}
          document.body.removeChild(ta);
        }
        btn.textContent = '✅ 링크가 복사됐어요';
        setTimeout(() => { btn.textContent = '🔗 이 글 링크 복사'; }, 2000);
      });

      if (openId && String(p.id) === openId){
        card.classList.add('open');
        card.querySelector('.post-toggle').textContent = '접기 ↑';
        setTimeout(() => card.scrollIntoView({ behavior:'smooth', block:'center' }), 400);
      }
      listEl.appendChild(card);
    });
    if (now) now.textContent = (page + 1) + ' / ' + pages;
    if (pager) pager.style.display = pages > 1 ? '' : 'none';
    if (scroll) listEl.scrollIntoView({ behavior:'smooth', block:'start' });
  }

  if (pager){
    pager.querySelectorAll('.pg-btn').forEach(b => {
      b.addEventListener('click', () => {
        page = (page + Number(b.dataset.go) + pages) % pages;
        draw(true);
      });
    });
  }
  draw(false);
}

/* ============================================================
   공지 달력
   ============================================================ */
async function renderCalendar(){
  const grid = document.getElementById('calGrid');
  if (!grid) return;
  const { data } = await sb.from('events').select('*');
  const events = data || [];
  const title = document.getElementById('calTitle');
  const listEl = document.getElementById('eventList');
  const today = new Date();
  let y = today.getFullYear(), m = today.getMonth();
  const pad = n => String(n).padStart(2,'0');
  const MONTHS = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];

  function draw(){
    title.textContent = y + '년 ' + (m + 1) + '월';
    grid.innerHTML = '';
    const first = new Date(y, m, 1).getDay();
    const days = new Date(y, m + 1, 0).getDate();
    for (let i = 0; i < first; i++){
      const e = document.createElement('div');
      e.className = 'cal-day empty';
      grid.appendChild(e);
    }
    for (let d = 1; d <= days; d++){
      const cell = document.createElement('div');
      cell.className = 'cal-day';
      const key = y + '-' + pad(m + 1) + '-' + pad(d);
      const has = events.some(e => e.date === key);
      if (has) cell.classList.add('has-event');
      if (y === today.getFullYear() && m === today.getMonth() && d === today.getDate()) cell.classList.add('today');
      cell.innerHTML = '<span class="cal-num">' + d + '</span>';
      grid.appendChild(cell);
    }

    const prefix = y + '-' + pad(m + 1);
    const mine = events.filter(e => String(e.date).slice(0,7) === prefix)
                       .sort((a,b) => a.date.localeCompare(b.date));
    listEl.innerHTML = '';
    const head = document.createElement('h3');
    head.className = 'event-month';
    head.textContent = (m + 1) + '월 행사';
    listEl.appendChild(head);

    if (mine.length === 0){
      const p = document.createElement('p');
      p.className = 'event-empty';
      p.textContent = (m + 1) + '월에는 등록된 행사가 없습니다.';
      listEl.appendChild(p);
      return;
    }
    mine.forEach(e => {
      const [, mm, dd] = e.date.split('-').map(Number);
      const card = document.createElement('div');
      card.className = 'event';
      card.innerHTML =
        '<div class="event-date"><span class="d">' + dd + '</span><span class="m">' + MONTHS[mm-1] + '</span></div>' +
        '<div><h4>' + esc(e.title) + '</h4><p>' + esc(e.description || '') + '</p></div>';
      listEl.appendChild(card);
    });
  }

  document.getElementById('calPrev').addEventListener('click', () => { m--; if (m < 0){ m = 11; y--; } draw(); });
  document.getElementById('calNext').addEventListener('click', () => { m++; if (m > 11){ m = 0; y++; } draw(); });
  draw();
}

/* ============================================================
   실행
   ============================================================ */
renderReviewTeaser();
renderReviewsFull();
renderScenery();
renderDayFolders();
renderPostTeaser();
renderPostsPaged();
renderCalendar();
