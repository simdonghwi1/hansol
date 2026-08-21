
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
  const header = document.getElementById('siteHeader');
  if (header){
    addEventListener('scroll', () => {
      header.classList.toggle('stuck', scrollY > 12);
    }, { passive:true });
  }

  /* ---------- 등장 애니메이션 ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold:0.12, rootMargin:'0px 0px -40px 0px' });
  function watch(el){ io.observe(el); }
  document.querySelectorAll('.rise').forEach(watch);

  /* ---------- 사진 확대 보기 ---------- */
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lbImg');
  const lbCap = document.getElementById('lbCap');
  let lbList = [];
  let lbIdx = 0;

  function lbShow(i){
    if (lbList.length === 0) return;
    lbIdx = (i + lbList.length) % lbList.length;
    const item = lbList[lbIdx];
    lbImg.src = item.url;
    lbImg.alt = item.cap || '';
    lbCap.textContent = item.cap || '';
  }
  function lbOpen(list, i){
    if (!lb) return;
    lbList = list;
    lbShow(i);
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function lbClose(){
    if (!lb) return;
    lb.classList.remove('open');
    document.body.style.overflow = '';
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

  /* ---------- 갤러리 ---------- */
  const FOLDERS = ['일상', '활동', '현장체험학습'];

  function makeTile(item, list, idx, withCap){
    const div = document.createElement('div');
    div.className = 'gallery-item';
    div.setAttribute('role','button');
    div.setAttribute('tabindex','0');
    div.setAttribute('aria-label', (item.caption || '사진') + ' 크게 보기');
    div.innerHTML = '<img src="' + item.image_url + '" alt="' + (item.caption || '') + '" loading="lazy">' +
      (withCap && item.caption ? '<span class="gallery-cap">' + item.caption + '</span>' : '');
    div.addEventListener('click', () => lbOpen(list, idx));
    div.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); lbOpen(list, idx); }
    });
    return div;
  }

  async function renderGallery(){
    const scenery = document.getElementById('galleryGridScenery');
    const activityBox = document.getElementById('galleryGridActivity');
    const folderBox = document.getElementById('activityFolders');
    if (!scenery || !activityBox || !folderBox) return;

    const { data, error } = await sb.from('gallery').select('*').order('sort_order', { ascending:true });
    if (error || !data) return;

    /* 경관 — 이름표 그대로 */
    const sceneryItems = data.filter(i => (i.category || '경관') === '경관');
    if (sceneryItems.length === 0){
      scenery.innerHTML = '<p class="gallery-empty">아직 등록된 사진이 없어요.</p>';
    } else {
      scenery.innerHTML = '';
      const list = sceneryItems.map(i => ({ url:i.image_url, cap:i.caption || '' }));
      sceneryItems.forEach((item, idx) => scenery.appendChild(makeTile(item, list, idx, true)));
    }

    /* 활동 — 폴더로 */
    const actItems = data.filter(i => i.category === '활동');
    folderBox.innerHTML = '';
    activityBox.innerHTML = '';
    let openFolder = null;

    FOLDERS.forEach(name => {
      const items = actItems.filter(i => (i.folder || '일상') === name);
      const card = document.createElement('div');
      card.className = 'folder';
      card.setAttribute('role','button');
      card.setAttribute('tabindex','0');
      card.innerHTML =
        '<svg viewBox="0 0 80 64" aria-hidden="true">' +
          '<path d="M4 14a6 6 0 0 1 6-6h20l7 8h33a6 6 0 0 1 6 6v34a6 6 0 0 1-6 6H10a6 6 0 0 1-6-6Z" fill="#FFC53D" stroke="#3D3226" stroke-width="3" stroke-linejoin="round"/>' +
          '<path d="M4 26h72v26a6 6 0 0 1-6 6H10a6 6 0 0 1-6-6Z" fill="#FFE199" stroke="#3D3226" stroke-width="3" stroke-linejoin="round"/>' +
        '</svg>' +
        '<h3>' + name + ' 사진</h3>' +
        '<div class="count">' + items.length + '장</div>' +
        '<span class="hint">' + (items.length ? '눌러서 보기' : '준비 중') + '</span>';

      function toggle(){
        if (openFolder === name){
          openFolder = null;
          activityBox.innerHTML = '';
          folderBox.querySelectorAll('.folder').forEach(f => f.classList.remove('active'));
          card.querySelector('.hint').textContent = items.length ? '눌러서 보기' : '준비 중';
          return;
        }
        openFolder = name;
        folderBox.querySelectorAll('.folder').forEach(f => {
          f.classList.remove('active');
          const h = f.querySelector('.hint');
          if (h && h.textContent === '닫기') h.textContent = '눌러서 보기';
        });
        card.classList.add('active');
        activityBox.innerHTML = '';
        if (items.length === 0){
          activityBox.innerHTML = '<p class="gallery-empty">아직 등록된 사진이 없어요.</p>';
          return;
        }
        card.querySelector('.hint').textContent = '닫기';
        const list = items.map(i => ({ url:i.image_url, cap:name + ' 사진' }));
        items.forEach((item, idx) => activityBox.appendChild(makeTile(item, list, idx, false)));
      }

      card.addEventListener('click', toggle);
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); toggle(); }
      });
      folderBox.appendChild(card);
    });
  }

  /* ---------- 후기 ---------- */
  function hl(text){
    // **중요한 부분** → 형광펜
    const esc = String(text)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    return esc.replace(/\*\*(.+?)\*\*/g, '<mark>$1</mark>');
  }

  async function renderReviews(){
    const track = document.getElementById('reviewTrack');
    if (!track) return;
    const { data, error } = await sb.from('reviews').select('*').order('sort_order', { ascending:true });
    if (error || !data || data.length === 0) return;

    // 고정된 후기를 앞으로
    const list = data.slice().sort((a, b) => {
      const pa = a.pinned ? 1 : 0, pb = b.pinned ? 1 : 0;
      if (pa !== pb) return pb - pa;
      return (a.sort_order || 0) - (b.sort_order || 0);
    });

    list.forEach(r => {
      const div = document.createElement('div');
      div.className = 'review-card';
      div.innerHTML =
        '<div class="review-inner' + (r.pinned ? ' pinned' : '') + '">' +
          (r.pinned ? '<span class="pin-badge">📌 추천</span>' : '') +
          '<span class="stars" aria-label="5점 만점에 5점">★★★★★</span>' +
          '<p class="review-text">' + hl(r.text) + '</p>' +
          '<div class="review-meta"><span class="review-name">' + r.name + '</span><span>' + r.year + '</span></div>' +
        '</div>';
      track.appendChild(div);
    });
    setupSlider(track, list.length);
  }

  function setupSlider(track, count){
    if (count === 0) return;
    const prevBtn = document.getElementById('rvPrev');
    const nextBtn = document.getElementById('rvNext');
    const dotsBox = document.getElementById('rvDots');

    // 끊김 없이 도는 느낌을 위해 앞 3개 복제
    Array.from(track.children).slice(0, 3).forEach(c => track.appendChild(c.cloneNode(true)));

    let idx = 0;
    let timer = null;
    let animating = false;
    const visible = () => innerWidth >= 1020 ? 3 : innerWidth >= 720 ? 2 : 1;

    // 점 표시
    dotsBox.innerHTML = '';
    for (let i = 0; i < count; i++){
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'rv-dot' + (i === 0 ? ' on' : '');
      b.setAttribute('aria-label', (i + 1) + '번째 후기');
      b.addEventListener('click', () => { go(i, true); restart(); });
      dotsBox.appendChild(b);
    }
    const dots = Array.from(dotsBox.children);
    function marks(){
      const cur = ((idx % count) + count) % count;
      dots.forEach((d, i) => d.classList.toggle('on', i === cur));
    }

    function go(i, animate){
      idx = i;
      track.style.transition = animate ? 'transform .7s cubic-bezier(.4,.1,.2,1)' : 'none';
      track.style.transform = 'translateX(-' + (idx * (100 / visible())) + '%)';
      marks();
    }

    function step(dir){
      if (animating) return;
      animating = true;
      const next = idx + dir;
      if (next < 0){
        // 뒤로 갈 때: 끝으로 순간이동 후 되감기
        go(count, false);
        requestAnimationFrame(() => requestAnimationFrame(() => go(count - 1, true)));
      } else {
        go(next, true);
      }
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

    // 마우스를 올리면 잠시 멈춤
    const wrap = track.closest('.review-wrap');
    wrap.addEventListener('mouseenter', stop);
    wrap.addEventListener('mouseleave', start);

    // 손가락으로 넘기기
    let sx = 0, sy = 0, swiping = false;
    track.addEventListener('touchstart', e => {
      sx = e.touches[0].clientX; sy = e.touches[0].clientY; swiping = true; stop();
    }, { passive:true });
    track.addEventListener('touchend', e => {
      if (!swiping) return;
      swiping = false;
      const dx = e.changedTouches[0].clientX - sx;
      const dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) step(dx < 0 ? 1 : -1);
      restart();
    }, { passive:true });

    go(0, false);
    start();
    addEventListener('resize', () => go(idx, false));
  }

  /* ---------- 공지 달력 ---------- */
  async function renderCalendar(){
    const grid = document.getElementById('calGrid');
    if (!grid) return;
    const { data } = await sb.from('events').select('*');
    const events = data || [];
    const title = document.getElementById('calTitle');
    const list = document.getElementById('eventList');
    const today = new Date();
    let y = today.getFullYear(), m = today.getMonth();
    const pad = n => String(n).padStart(2, '0');
    const months = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];

    function draw(){
      title.textContent = y + '년 ' + (m + 1) + '월';
      grid.innerHTML = '';
      const first = new Date(y, m, 1).getDay();
      const days = new Date(y, m + 1, 0).getDate();
      for (let i = 0; i < first; i++){
        const e = document.createElement('div'); e.className = 'cal-day empty'; grid.appendChild(e);
      }
      for (let d = 1; d <= days; d++){
        const cell = document.createElement('div');
        cell.className = 'cal-day';
        if (y === today.getFullYear() && m === today.getMonth() && d === today.getDate()) cell.classList.add('today');
        const num = document.createElement('span'); num.textContent = d; cell.appendChild(num);
        const key = y + '-' + pad(m + 1) + '-' + pad(d);
        if (events.some(e => e.date === key)){
          const dot = document.createElement('span'); dot.className = 'dot'; cell.appendChild(dot);
        }
        grid.appendChild(cell);
      }
    }

    function drawList(){
      const t = today.getFullYear() + '-' + pad(today.getMonth() + 1) + '-' + pad(today.getDate());
      const upcoming = events.slice().sort((a,b) => a.date.localeCompare(b.date)).filter(e => e.date >= t);
      list.innerHTML = '';
      if (upcoming.length === 0){
        list.innerHTML = '<p class="event-empty">예정된 공지사항이 없습니다.</p>';
        return;
      }
      upcoming.forEach(e => {
        const [, mm, dd] = e.date.split('-').map(Number);
        const card = document.createElement('div');
        card.className = 'event';
        card.innerHTML =
          '<div class="event-date"><span class="d">' + dd + '</span><span class="m">' + months[mm - 1] + '</span></div>' +
          '<div><h4>' + e.title + '</h4><p>' + (e.description || '') + '</p></div>';
        list.appendChild(card);
      });
    }

    document.getElementById('calPrev').addEventListener('click', () => { m--; if (m < 0){ m = 11; y--; } draw(); });
    document.getElementById('calNext').addEventListener('click', () => { m++; if (m > 11){ m = 0; y++; } draw(); });
    draw(); drawList();
  }

  /* ---------- 육아 이야기 ---------- */
  async function renderPosts(){
    const listEl = document.getElementById('postList');
    const moreBtn = document.getElementById('postMoreBtn');
    if (!listEl) return;
    const t = new Date();
    const todayStr = t.getFullYear() + '-' + String(t.getMonth()+1).padStart(2,'0') + '-' + String(t.getDate()).padStart(2,'0');
    const { data, error } = await sb.from('posts').select('*')
      .lte('publish_date', todayStr).order('publish_date', { ascending:false });

    if (error || !data || data.length === 0){
      listEl.innerHTML = '<p class="post-empty">아직 등록된 글이 없어요.</p>';
      return;
    }

    const openId = new URLSearchParams(location.search).get('post');
    let shown = 5;
    if (openId){
      const i = data.findIndex(p => String(p.id) === openId);
      if (i >= shown) shown = i + 1;
    }

    function draw(){
      listEl.innerHTML = '';
      data.slice(0, shown).forEach(p => {
        const card = document.createElement('div');
        card.className = 'post';
        const excerpt = p.content.replace(/\s+/g,' ').slice(0, 95) + '…';
        const d = p.publish_date.split('-');
        card.innerHTML =
          '<div class="post-head">' +
            '<h3 class="post-title">' + p.title + '</h3>' +
            '<span class="post-date">' + d[0] + '.' + d[1] + '.' + d[2] + '</span>' +
          '</div>' +
          '<p class="post-excerpt">' + excerpt + '</p>' +
          '<div class="post-body">' + p.content +
            '<button type="button" class="post-share" data-id="' + p.id + '" data-title="' +
              String(p.title).replace(/"/g,'&quot;') + '">🔗 이 글 링크 복사</button>' +
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
          setTimeout(() => card.scrollIntoView({ behavior:'smooth', block:'center' }), 420);
        }
        listEl.appendChild(card);
      });
      moreBtn.style.display = shown < data.length ? 'inline-flex' : 'none';
    }
    moreBtn.addEventListener('click', () => { shown += 5; draw(); });
    draw();
  }

  renderGallery();
  renderReviews();
  renderCalendar();
  renderPosts();


  /* ============================================================
     메인 페이지 요약(티저)
     ============================================================ */
  async function renderTeasers(){
    /* 후기 3개 */
    const rt = document.getElementById('reviewTeaser');
    if (rt){
      const { data } = await sb.from('reviews').select('*').order('sort_order', { ascending:true });
      if (data && data.length){
        const list = data.slice().sort((a,b) => {
          const pa=a.pinned?1:0, pb=b.pinned?1:0;
          if (pa!==pb) return pb-pa;
          return (a.sort_order||0)-(b.sort_order||0);
        }).slice(0,3);
        rt.innerHTML = '';
        list.forEach(r => {
          const d = document.createElement('div');
          d.className = 'review-card';
          d.style.flex = '1';
          d.style.padding = '0';
          d.innerHTML =
            '<div class="review-inner' + (r.pinned ? ' pinned' : '') + '">' +
              (r.pinned ? '<span class="pin-badge">📌 추천</span>' : '') +
              '<span class="stars">★★★★★</span>' +
              '<p class="review-text">' + hl(r.text) + '</p>' +
              '<div class="review-meta"><span class="review-name">' + r.name + '</span><span>' + r.year + '</span></div>' +
            '</div>';
          rt.appendChild(d);
        });
      }
    }

    /* 사진 4장 */
    const gt = document.getElementById('galleryTeaser');
    if (gt){
      const { data } = await sb.from('gallery').select('*').order('sort_order', { ascending:true });
      if (data && data.length){
        const items = data.filter(i => (i.category || '경관') === '경관').slice(0,4);
        const list = items.map(i => ({ url:i.image_url, cap:i.caption || '' }));
        gt.innerHTML = '';
        items.forEach((item, idx) => gt.appendChild(makeTile(item, list, idx, true)));
      }
    }

    /* 최근 글 3편 */
    const pt = document.getElementById('postTeaser');
    if (pt){
      const t = new Date();
      const today = t.getFullYear()+'-'+String(t.getMonth()+1).padStart(2,'0')+'-'+String(t.getDate()).padStart(2,'0');
      const { data } = await sb.from('posts').select('*')
        .lte('publish_date', today).order('publish_date', { ascending:false }).limit(3);
      if (data && data.length){
        pt.innerHTML = '';
        data.forEach(p => {
          const a = document.createElement('a');
          a.className = 'teaser-post';
          a.href = 'stories.html?post=' + p.id;
          const d = p.publish_date.split('-');
          a.innerHTML =
            '<div class="post-head">' +
              '<h3 class="post-title">' + p.title + '</h3>' +
              '<span class="post-date">' + d[0] + '.' + d[1] + '.' + d[2] + '</span>' +
            '</div>' +
            '<p class="post-excerpt">' + p.content.replace(/\s+/g,' ').slice(0,90) + '…</p>' +
            '<div class="post-toggle">읽어보기 →</div>';
          pt.appendChild(a);
        });
      }
    }
  }

  renderTeasers();
