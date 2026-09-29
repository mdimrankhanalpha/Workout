const app=document.getElementById('app'),q=document.getElementById('q'),lb=document.getElementById('lb');
const cache={};let cats=[],run=0;
const esc=s=>String(s).replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';');
const slug=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const fb=(el,t)=>{el.outerHTML='<span class="fb">'+t+'</span>'};
const msg=t=>{app.innerHTML='<p class="msg">'+t+'</p>'};

function parse(t){
  return t.replace(/\r/g,'').split(/^---\s*$/m).map(b=>{
    const o={};
    b.split('\n').forEach(l=>{
      const i=l.indexOf(':');if(i<1)return;
      const k=l.slice(0,i).trim().toLowerCase(),v=l.slice(i+1).trim();
      if(!v)return;
      if(k==='image'||k==='video')(o[k+'s']=o[k+'s']||[]).push(v);else o[k]=v;
    });
    return o;
  }).filter(o=>Object.keys(o).length);
}

async function loadCat(c){
  if(cache[c.file])return cache[c.file];
  const r=await fetch(c.file);if(!r.ok)throw 0;
  const l=parse(await r.text()).filter(e=>e.name);
  l.forEach(e=>{e.slug=slug(e.name);e.cat=c.id});
  return cache[c.file]=l;
}

async function findEx(s){
  const look=()=>Object.values(cache).flat().find(e=>e.slug===s);
  let e=look();if(e)return e;
  for(const c of cats){if(cache[c.file])continue;try{await loadCat(c)}catch(x){}e=look();if(e)return e}
}

const card=e=>'<a class="card" href="#/exercise/'+e.slug+'">'+(e.images?'<img loading="lazy" src="'+esc(e.images[0])+'" alt="" onerror="fb(this,\'Image unavailable\')">':'')
  +'<div class="cb"><h3>'+esc(e.name)+'</h3><p>'+['target','difficulty','type'].filter(k=>e[k]).map(k=>esc(e[k])).join(' · ')+'</p></div></a>';

function home(){
  app.innerHTML='<h1>Workout TV</h1><p class="msg">Pick a body part to browse exercises with instructions, photos and videos.</p><div class="grid">'
    +cats.map(c=>'<a class="card" href="#/'+esc(c.id)+'"><div class="cb"><h3>'+esc(c.name||c.id)+'</h3>'+(c.description?'<p>'+esc(c.description)+'</p>':'')+'</div></a>').join('')+'</div>';
}

function exercise(e){
  const c=cats.find(c=>c.id===e.cat);
  let h='<a class="back" href="#/'+esc(e.cat)+'">Back to '+esc(c?c.name:'list')+'</a><h1>'+esc(e.name)+'</h1>';
  const meta=['type','target','difficulty','equipment','sets','reps','duration','rest'].filter(k=>e[k]);
  if(meta.length)h+='<ul class="meta">'+meta.map(k=>'<li><b>'+k+'</b>'+esc(e[k])+'</li>').join('')+'</ul>';
  ['description','instructions','tips','mistakes','benefits'].forEach(k=>{if(e[k])h+='<h2>'+k+'</h2><p>'+esc(e[k])+'</p>'});
  if(e.images)h+='<h2>Images</h2><div class="grid media">'+e.images.map(u=>'<img class="zoom" loading="lazy" src="'+esc(u)+'" alt="'+esc(e.name)+'" onerror="fb(this,\'Image unavailable\')">').join('')+'</div>';
  if(e.videos)h+='<h2>Videos</h2><div class="grid v media">'+e.videos.map(u=>'<video controls preload="none" src="'+esc(u)+'" onerror="fb(this,\'Video unavailable\')"></video>').join('')+'</div>';
  if(e.source)h+='<h2>Source</h2><p>'+(/^https?:\/\//.test(e.source)?'<a href="'+esc(e.source)+'" target="_blank" rel="noopener">'+esc(e.source)+'</a>':esc(e.source))+'</p>';
  app.innerHTML=h;
}

async function route(){
  const my=++run;q.value='';scrollTo(0,0);
  const [a,b]=location.hash.replace(/^#\/?/,'').split('/');
  if(!cats.length){
    try{const r=await fetch('categories.txt');if(!r.ok)throw 0;cats=parse(await r.text()).filter(c=>c.id&&c.file)}
    catch(x){return msg('Unable to load categories.')}
    if(my!==run)return;
  }
  if(a==='exercise'){
    const e=await findEx(b);if(my!==run)return;
    return e?exercise(e):msg('Exercise not found.');
  }
  const c=cats.find(c=>c.id===a);
  if(!c)return home();
  let l;
  try{l=await loadCat(c)}catch(x){return my===run&&msg('Unable to load this category.')}
  if(my!==run)return;
  app.innerHTML='<a class="back" href="#/home">Home</a><h1>'+esc(c.name||c.id)+'</h1>'+(c.description?'<p class="msg">'+esc(c.description)+'</p>':'')
    +(l.length?'<div class="grid">'+l.map(card).join('')+'</div>':'<p class="msg">No exercises yet.</p>');
}

q.oninput=()=>{
  const s=q.value.trim().toLowerCase();
  if(!s)return route();
  run++;
  const r=Object.values(cache).flat().filter(e=>['name','target','type','difficulty','equipment'].some(k=>e[k]&&e[k].toLowerCase().includes(s)));
  app.innerHTML='<h1>Search</h1><p class="msg">Searching only the categories you have opened.</p>'+(r.length?'<div class="grid">'+r.map(card).join('')+'</div>':'<p class="msg">No matches.</p>');
};

document.onclick=e=>{
  const t=e.target;
  if(t.classList&&t.classList.contains('zoom')){lb.innerHTML='<img src="'+esc(t.src)+'" alt="">';lb.hidden=false}
  else if(lb.contains(t))lb.hidden=true;
};

window.onhashchange=route;
route();
