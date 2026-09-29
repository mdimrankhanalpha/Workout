const app=document.getElementById('app'),q=document.getElementById('q'),lb=document.getElementById('lb');
const cache={};let cats=[],run=0;
const esc=s=>String(s).replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';');
const fb=(el,t)=>{el.outerHTML='<span class="fb">'+t+'</span>'};
const msg=t=>{app.innerHTML='<p class="msg">'+t+'</p>'};
const IMG=/^\S+\.(jpe?g|png|gif|webp|avif|svg|bmp)(\?\S*)?$/i,VID=/^\S+\.(mp4|webm|ogg|mov|m4v)(\?\S*)?$/i;
const yt=l=>/^https?:\/\/\S+$/.test(l)?(l.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:\S*&)?v=|shorts\/|embed\/))([\w-]{11})/)||[])[1]:0;

// a line made only of dashes separates posts
const blocks=t=>t.replace(/^\uFEFF/,'').replace(/\r/g,'').split(/^[ \t]*-+[ \t]*$/m)
  .map(b=>b.split('\n').map(l=>l.trim()).filter(Boolean)).filter(b=>b.length);

async function loadCat(c){
  if(cache[c.file])return cache[c.file];
  const r=await fetch(c.file);if(!r.ok)throw 0;
  return cache[c.file]=blocks(await r.text()).map(lines=>({lines,cat:c.id}));
}

function post(p){
  let h='',m='';
  const flush=()=>{if(m)h+='<div class="pm">'+m+'</div>';m=''};
  p.lines.forEach((l,n)=>{
    const u=esc(l),y=yt(l);
    if(IMG.test(l))m+='<img loading="lazy" src="'+u+'" alt="" data-i="'+u+'" onerror="fb(this,\'Image unavailable\')">';
    else if(VID.test(l))m+='<button class="play" data-v="'+u+'">Play video</button>';
    else if(y)m+='<button class="play" data-y="'+y+'">Play video</button>';
    else{
      flush();
      const t=u.replace(/(https?:\/\/[^\s<]+)/g,'<a href="$1" target="_blank" rel="noopener">$1</a>');
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
  app.innerHTML='<h1>Workout TV</h1><p class="msg">Pick a topic to browse posts with text, photos and videos.</p><div class="grid">'
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
  app.innerHTML='<a class="back" href="#/home">Home</a><h1>'+esc(c.name||c.id)+'</h1>'+(c.description?'<p class="msg">'+esc(c.description)+'</p>':'')
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

const hide=()=>{lb.hidden=true;lb.innerHTML=''};
document.onclick=e=>{
  const t=e.target,a=t.closest&&t.closest('[data-i],[data-v],[data-y]');
  if(a){
    const d=a.dataset;
    lb.innerHTML='<button class="x" aria-label="Close">&times;</button>'+(d.i
      ?'<img src="'+esc(d.i)+'" alt="" onerror="fb(this,\'Image unavailable\')">'
      :d.v?'<video controls autoplay playsinline src="'+esc(d.v)+'" onerror="fb(this,\'Video unavailable\')"></video>'
      :'<iframe src="https://www.youtube.com/embed/'+d.y+'?autoplay=1" allow="autoplay; fullscreen" allowfullscreen></iframe>');
    lb.hidden=false;
  }else if(t===lb||t.classList.contains('x'))hide();
};
document.onkeydown=e=>{if(e.key==='Escape')hide()};
window.onhashchange=()=>{hide();route()};
route();
