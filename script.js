const app=document.getElementById('app'),q=document.getElementById('q'),lb=document.getElementById('lb');
const cache={};let cats=[],run=0;

const esc=s=>String(s).replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';');
const msg=t=>{app.innerHTML='<p class="msg">'+t+'</p>'};

// -------------------------
// Media URL helpers
// -------------------------
const imageExt=/\.(jpe?g|png|gif|webp|avif|svg|bmp)(?:$|[?#])/i;
const videoExt=/\.(mp4|webm|ogg|mov|m4v)(?:$|[?#])/i;

function cleanUrl(raw){
  let u=raw.trim();
  // GitHub "blob" links are not direct media files. Convert them to raw files.
  const m=u.match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/(.+)$/i);
  if(m) return `https://raw.githubusercontent.com/${m[1]}/${m[2]}/${m[3]}`;
  return u;
}

function youtubeId(raw){
  try{
    const u=new URL(raw);
    if(!/(^|\.)youtube\.com$|(^|\.)youtu\.be$/i.test(u.hostname)) return '';
    if(u.hostname.includes('youtu.be')) return u.pathname.split('/').filter(Boolean)[0]||'';
    if(u.pathname.startsWith('/shorts/')) return u.pathname.split('/')[2]||'';
    if(u.pathname.startsWith('/embed/')) return u.pathname.split('/')[2]||'';
    return u.searchParams.get('v')||'';
  }catch{return ''}
}

function facebookUrl(raw){
  try{
    const u=new URL(raw);
    return /(^|\.)facebook\.com$|(^|\.)fb\.watch$/i.test(u.hostname) ? u.href : '';
  }catch{return ''}
}

function isImage(raw){return imageExt.test(raw)}
function isVideo(raw){return videoExt.test(raw)}

function mediaFromUrl(raw){
  const url=cleanUrl(raw);
  const y=youtubeId(url);
  if(y) return {type:'youtube',url,id:y,thumb:`https://i.ytimg.com/vi/${encodeURIComponent(y)}/hqdefault.jpg`};
  const fb=facebookUrl(url);
  if(fb && (/\/videos?\//i.test(url)||/\/watch/i.test(url)||/reel/i.test(url)||/fb\.watch/i.test(url)))
    return {type:'facebook',url:fb};
  if(isImage(url)) return {type:'image',url};
  if(isVideo(url)) return {type:'video',url};
  return null;
}

// A line made only of dashes separates posts.
const blocks=t=>t.replace(/^\uFEFF/,'').replace(/\r/g,'').split(/^[ \t]*-+[ \t]*$/m)
  .map(b=>b.split('\n').map(l=>l.trim()).filter(Boolean)).filter(b=>b.length);

async function loadCat(c){
  if(cache[c.file])return cache[c.file];
  const r=await fetch(c.file);if(!r.ok)throw 0;
  return cache[c.file]=blocks(await r.text()).map(lines=>({lines,cat:c.id}));
}

function mediaHTML(raw){
  const m=mediaFromUrl(raw);
  if(!m) return '';

  if(m.type==='image'){
    return `<figure class="media media-image" data-i="${esc(m.url)}">
      <img loading="lazy" decoding="async" src="${esc(m.url)}" alt="" onerror="mediaError(this)">
    </figure>`;
  }

  if(m.type==='video'){
    // The video is visible immediately, but never autoplayed. Metadata is loaded
    // so the browser can show the native video surface without wasting bandwidth.
    return `<figure class="media media-video" data-v="${esc(m.url)}" tabindex="0" role="button" aria-label="Open video">
      <video muted playsinline preload="metadata" src="${esc(m.url)}" onerror="mediaError(this)"></video>
      <span class="media-hint">Tap to watch</span>
    </figure>`;
  }

  if(m.type==='youtube'){
    return `<figure class="media media-youtube" data-y="${esc(m.id)}" tabindex="0" role="button" aria-label="Open YouTube video">
      <img loading="lazy" decoding="async" src="${esc(m.thumb)}" alt="YouTube video preview" onerror="this.src='https://i.ytimg.com/vi/${esc(m.id)}/mqdefault.jpg'">
      <span class="yt-mark">▶</span>
      <span class="media-hint">Tap to watch</span>
    </figure>`;
  }

  if(m.type==='facebook'){
    return `<figure class="media media-facebook" data-fb="${esc(m.url)}" tabindex="0" role="button" aria-label="Open Facebook video">
      <div class="fb-preview"><span class="fb-icon">f</span><span>Facebook video</span></div>
      <span class="media-hint">Tap to watch</span>
    </figure>`;
  }
  return '';
}

function post(p){
  let h='',m='';
  const flush=()=>{if(m)h+='<div class="pm">'+m+'</div>';m=''};

  p.lines.forEach((l,n)=>{
    const u=esc(l), media=mediaFromUrl(l);
    if(media) m+=mediaHTML(l);
    else{
      flush();
      const t=u.replace(/(https?:\/\/[^\s<]+)/g,'<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
      h+=n===0&&!/^https?:\/\//.test(l)?'<h3>'+t+'</h3>':'<p>'+t+'</p>';
    }
  });
  flush();return h;
}

const card=(p,tag)=>{
  const c=tag&&cats.find(c=>c.id===p.cat);
  return '<article class="card">'+post(p)+(c?'<a class="tag" href="#/'+esc(c.id)+'">'+esc(c.name||c.id)+'</a>':'')+'</article>';
};

function home(){
  app.innerHTML='<h1>Workout TV</h1><p class="msg">Choose a topic. Photos and videos appear directly in the post — no Play buttons required.</p><div class="grid">'
    +cats.map(c=>'<a class="card" href="#/'+esc(c.id)+'"><h3>'+esc(c.name||c.id)+'</h3>'+(c.description?'<p class="msg">'+esc(c.description)+'</p>':'')+'</a>').join('')+'</div>';
}

async function route(){
  const my=++run;q.value='';scrollTo(0,0);
  const a=location.hash.replace(/^#\/?/,'').split('/')[0];

  if(!cats.length){
    try{
      const r=await fetch('categories.txt');if(!r.ok)throw 0;
      cats=blocks(await r.text()).map(b=>{
        const o={};
        b.forEach(l=>{const i=l.indexOf(':');if(i>0)o[l.slice(0,i).trim().toLowerCase()]=l.slice(i+1).trim()});
        return o;
      }).filter(c=>c.id&&c.file);
    }catch(x){return msg('Unable to load categories.')}
    if(my!==run)return;
  }

  const c=cats.find(c=>c.id===a);
  if(!c)return home();

  let l;
  try{l=await loadCat(c)}catch(x){return my===run&&msg('Unable to load this category.')}
  if(my!==run)return;

  app.innerHTML='<a class="back" href="#/home">Home</a><h1>'+esc(c.name||c.id)+'</h1>'
    +(c.description?'<p class="msg">'+esc(c.description)+'</p>':'')
    +(l.length?'<div class="grid">'+l.map(p=>card(p)).join('')+'</div>':'<p class="msg">No posts yet.</p>');
}

q.oninput=()=>{
  const s=q.value.trim().toLowerCase();
  if(!s)return route();
  run++;
  const r=Object.values(cache).flat().filter(p=>p.lines.join(' ').toLowerCase().includes(s));
  app.innerHTML='<h1>Search</h1><p class="msg">Searching only the categories you have opened.</p>'
    +(r.length?'<div class="grid">'+r.map(p=>card(p,1)).join('')+'</div>':'<p class="msg">No matches.</p>');
};

// -------------------------
// Media viewer
// -------------------------
function showMedia(type,value){
  let body='';
  if(type==='image'){
    body=`<img class="viewer-image" src="${esc(value)}" alt="" onerror="mediaError(this)">`;
  }else if(type==='video'){
    body=`<video class="viewer-video" controls autoplay playsinline preload="auto" src="${esc(value)}" onerror="mediaError(this)"></video>`;
  }else if(type==='youtube'){
    body=`<iframe class="viewer-frame" src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(value)}?autoplay=1&rel=0" title="YouTube video" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
  }else if(type==='facebook'){
    const href=encodeURIComponent(value);
    body=`<iframe class="viewer-frame" src="https://www.facebook.com/plugins/video.php?href=${href}&show_text=false&width=960" title="Facebook video" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" allowfullscreen></iframe>`;
  }
  lb.innerHTML='<button class="x" aria-label="Close">&times;</button>'+body;
  lb.hidden=false;
}

function mediaError(el){
  if(el && el.parentElement) el.parentElement.classList.add('media-error');
}

const hide=()=>{lb.hidden=true;lb.innerHTML='';};

function openTarget(t){
  const d=t.dataset;
  if(d.i)showMedia('image',d.i);
  else if(d.v)showMedia('video',d.v);
  else if(d.y)showMedia('youtube',d.y);
  else if(d.fb)showMedia('facebook',d.fb);
}

document.onclick=e=>{
  const t=e.target.closest&&e.target.closest('[data-i],[data-v],[data-y],[data-fb]');
  if(t){openTarget(t);return;}
  if(e.target===lb||e.target.classList.contains('x'))hide();
};

document.onkeydown=e=>{
  if(e.key==='Escape')hide();
  if((e.key==='Enter'||e.key===' ') && document.activeElement?.matches('[data-i],[data-v],[data-y],[data-fb]')){
    e.preventDefault();openTarget(document.activeElement);
  }
};

window.onhashchange=()=>{hide();route()};
route();
