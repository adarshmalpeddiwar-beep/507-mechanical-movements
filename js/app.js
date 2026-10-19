(()=>{
const TAU=Math.PI*2, W=800, H=520, BASE=0.3;
const mod=(a,n)=>((a%n)+n)%n;
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const MV=window.MOVEMENTS, CATS=window.CATS, SIMS=window.MB.SIMS, C=window.MB.C;
const CATNAME=Object.fromEntries(CATS.map(c=>[c.k,c.name]));
const app=$('#app');

function readColors(){const s=getComputedStyle(document.documentElement);['sheet','ink','muted','rule','grid','brass','brass-fill','steel','steel-fill','part','part2','hi'].forEach(k=>C[k]=s.getPropertyValue('--'+k).trim());}
readColors();
const recolor=()=>{readColors();thumbsDirty();};
try{matchMedia('(prefers-color-scheme: dark)').addEventListener('change',recolor);}catch(e){}
new MutationObserver(recolor).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme','class','style']});

function store(k,v){try{if(v===undefined)return JSON.parse(localStorage.getItem('b507-'+k));localStorage.setItem('b507-'+k,JSON.stringify(v));}catch(e){return null;}}
const nAnim=Object.keys(SIMS).length;

/* ---------- drawing a sim into a canvas ---------- */
function paintSheet(g,cw,grid=true){const s=cw/W;g.setTransform(s,0,0,s,0,0);g.fillStyle=C.sheet;g.fillRect(0,0,W,H);
  if(grid){g.lineWidth=.6;for(let x=0;x<=W;x+=20){g.strokeStyle=x%100?C.grid:C.rule;g.globalAlpha=x%100?1:.5;g.beginPath();g.moveTo(x,0);g.lineTo(x,H);g.stroke();}
  for(let y=0;y<=H;y+=20){g.strokeStyle=y%100?C.grid:C.rule;g.globalAlpha=y%100?1:.5;g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.stroke();}g.globalAlpha=1;}
  g.lineJoin='round';}
function drawSim(g,cw,sim){paintSheet(g,cw);window.MB.setCtx(g);try{sim.draw();}catch(e){console.error('draw',sim.num,e);}}
function prime(sim,phi){sim.reset&&sim.reset();const n=Math.max(1,Math.ceil(phi/0.03));for(let i=0;i<=n;i++)sim.update(phi*i/n);}

/* ---------- social links (top-right corner and footer) ---------- */
const SOCIAL=[
  ['X','https://x.com/underdogbuilder','<path fill="currentColor" d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.78L17.75 3Zm-1.08 16.18h1.7L7.4 4.73H5.58l11.09 14.45Z"/>'],
  ['LinkedIn','https://www.linkedin.com/in/adarshmalpeddiwar/','<path fill="currentColor" d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12Zm1.78 13.02H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z"/>'],
  ['YouTube','https://www.youtube.com/@underdogbuilder','<path fill="currentColor" d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81ZM9.55 15.57V8.43L15.82 12l-6.27 3.57Z"/>'],
  ['Instagram','https://www.instagram.com/underdogbuilder/','<rect x="2.6" y="2.6" width="18.8" height="18.8" rx="5.4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4.3" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.5" cy="6.5" r="1.25" fill="currentColor"/>']];
const SOCIAL_HTML=`<nav class="social" aria-label="@underdogbuilder on social media">${SOCIAL.map(([n,u,ic])=>`<a href="${u}" target="_blank" rel="noopener me" aria-label="@underdogbuilder on ${n}" title="${n}"><svg viewBox="0 0 24 24" aria-hidden="true">${ic}</svg></a>`).join('')}</nav>`;
{const t=document.getElementById('topsocial');if(t)t.outerHTML=SOCIAL_HTML;}

/* ---------- home ---------- */
let state={q:store('q')||'',cat:store('cat')||'all',anim:!!store('anim')};
let thumbObs=null;const thumbQueue=new Set();
function thumbsDirty(){document.querySelectorAll('canvas.thumb').forEach(c=>{c.dataset.done='';if(thumbObs){thumbObs.unobserve(c);thumbObs.observe(c);}});}
function renderThumb(cv){const n=+cv.dataset.n,sim=SIMS[n];if(!sim||cv.dataset.done)return;const dpr=Math.min(2,window.devicePixelRatio||1),w=cv.clientWidth||200;cv.width=Math.round(w*dpr);cv.height=Math.round(w*H/W*dpr);
  prime(sim,0.9);drawSim(cv.getContext('2d'),cv.width,sim);cv.dataset.done='1';}

function home(){stopBench();
  const counts={};MV.forEach(m=>counts[m.c]=(counts[m.c]||0)+1);
  app.innerHTML=`
  <header class="hero" id="hero">
    <canvas class="herobg" id="herobg" aria-hidden="true"></canvas>
    <div class="herofade" aria-hidden="true"></div>
    <div class="heroin">
      <div class="eyebrow">Henry T. Brown · 1868 · Interactive edition</div>
      <h1>507 Mechanical<br>Movements.</h1>
      <p class="lede">The classic catalogue of how machines move, rebuilt so every movement runs. Turn them by hand, change their proportions, and print them in 3D.</p>
      <div class="cta"><a class="btn primary" href="#" id="explore">Explore the movements</a><a class="btn" href="#" id="surprise">Surprise me</a></div>
      <div class="stats">
        <div class="stat"><b>507</b><span>movements</span></div>
        <div class="stat"><b>${nAnim}</b><span>interactive</span></div>
        <div class="stat"><b>${CATS.length}</b><span>families</span></div>
      </div>
    </div>
  </header>
  <div class="tools">
    <input class="search" id="q" type="search" placeholder="Search by number, name or use: gear, ratchet, 211, clock…" value="${esc(state.q)}" aria-label="Search movements">
    <label class="toggle"><input type="checkbox" id="anim" ${state.anim?'checked':''}> Interactive only</label>
  </div>
  <div class="chips" id="chips" role="group" aria-label="Families">
    <button class="chip" data-k="all" aria-pressed="${state.cat==='all'}">All<small>507</small></button>
    ${CATS.map(c=>`<button class="chip" data-k="${c.k}" aria-pressed="${state.cat===c.k}">${esc(c.name)}<small>${counts[c.k]||0}</small></button>`).join('')}
  </div>
  <div class="count" id="count"></div>
  <div class="grid" id="grid"></div>
  ${footer()}`;
  $('#q').addEventListener('input',e=>{state.q=e.target.value;store('q',state.q);list();});
  $('#anim').addEventListener('change',e=>{state.anim=e.target.checked;store('anim',state.anim);list();});
  $('#chips').addEventListener('click',e=>{const b=e.target.closest('.chip');if(!b)return;state.cat=b.dataset.k;store('cat',state.cat);document.querySelectorAll('#chips .chip').forEach(x=>x.setAttribute('aria-pressed',x===b));list();});
  $('#explore').addEventListener('click',e=>{e.preventDefault();$('#q').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});});
  $('#surprise').addEventListener('click',e=>{e.preventDefault();const ks=Object.keys(SIMS);location.hash='#m'+ks[Math.floor(Math.random()*ks.length)];});
  startHero();
  if(thumbObs)thumbObs.disconnect();
  thumbObs=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){renderThumb(en.target);thumbObs.unobserve(en.target);}}),{rootMargin:'200px'});
  list();
  const y=store('scroll');if(y&&location.hash==='')requestAnimationFrame(()=>window.scrollTo(0,y));
}
function matches(m){if(state.cat!=='all'&&m.c!==state.cat)return false;if(state.anim&&!SIMS[m.n])return false;const q=state.q.trim().toLowerCase();if(!q)return true;
  if(/^\d+$/.test(q))return String(m.n).startsWith(q);return (m.t+' '+m.s+' '+m.b+' '+m.u+' '+CATNAME[m.c]).toLowerCase().includes(q);}
function list(){const items=MV.filter(matches);$('#count').textContent=`${items.length} of 507 movements`;
  const grid=$('#grid');if(!items.length){grid.innerHTML=`<p class="empty">No movements match “${esc(state.q)}”. Try a simpler word such as gear, cam or pump.</p>`;return;}
  grid.innerHTML=items.map(m=>`<a class="card" href="#m${m.n}" aria-label="No. ${m.n}, ${esc(m.t)}">
    ${SIMS[m.n]?`<canvas class="thumb" data-n="${m.n}" aria-hidden="true"></canvas>`:`<div class="plateno" aria-hidden="true">${m.n}</div>`}
    <div class="cbody"><div class="cn"><b>No. ${m.n}</b><span>${hasCad(m.n)?'<span class="badge d3">3D print</span> ':''}${SIMS[m.n]?'<span class="badge">Interactive</span>':''}</span></div><div class="ct">${esc(m.t)}</div><div class="cc">${esc(CATNAME[m.c])}</div></div></a>`).join('');
  grid.querySelectorAll('canvas.thumb').forEach(c=>thumbObs.observe(c));}
function footer(){return `<footer><p>507 Mechanical Movements · Built by <a href="https://www.instagram.com/underdogbuilder/" target="_blank" rel="noopener">@underdogbuilder</a></p>${SOCIAL_HTML}</footer>`;}

/* ---------- hero: live mechanisms behind the title ---------- */
// Only movements whose drawing depends on the crank angle alone, so they can share the sim objects with the thumbnails.
const HERO=[24,211,505,344,33,426,497,39,502,421,212,36,145,364,27,31,504,92,347,430,429,148,423,437,55,57,214,412,108,1,119,123,161,185,34];
let hero=null;
function stopHero(){if(hero){hero.alive=false;if(hero.obs)hero.obs.disconnect();hero=null;}}
function startHero(){stopHero();const cv=$('#herobg');if(!cv)return;const g=cv.getContext('2d');g.fillText=g.strokeText=()=>{};
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,list=HERO.filter(n=>SIMS[n]);
  const H0={alive:true,vis:true,t:0,last:0,tiles:[],w:0,h:0,tw:0,th:0};hero=H0;
  function layout(){const r=cv.getBoundingClientRect(),dpr=Math.min(1.5,window.devicePixelRatio||1);H0.w=r.width;H0.h=r.height;cv.width=Math.round(r.width*dpr);cv.height=Math.round(r.height*dpr);H0.dpr=dpr;
    const tw=Math.max(170,Math.min(320,r.width/4.8)),th=tw*H/W,cols=Math.ceil(r.width/tw)+1,rows=Math.ceil(r.height/th)+2;H0.tw=tw;H0.th=th;H0.rows=rows;H0.tiles=[];
    let k=0;for(let c=0;c<cols;c++)for(let j=0;j<rows;j++){const n=list[(k*11)%list.length];k++;H0.tiles.push({n,c,j,ph:(k*1.7)%TAU,sp:0.35+((k*37)%11)/22});}}
  function frame(){const {w,h,tw,th,rows,dpr}=H0;g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,cv.width,cv.height);
    const ox=(w-Math.ceil(w/tw)*tw)/2-tw/2;
    for(const T of H0.tiles){const sim=SIMS[T.n];const dir=T.c%2?1:-1,span=rows*th,off=((H0.t*9*dir)%span+span)%span;
      let y=T.j*th+off+(T.c%2?th/2:0);y=((y%span)+span)%span-th;const x=ox+T.c*tw;if(y>h||y+th<0)continue;
      const s=tw/W*0.94;g.setTransform(s*dpr,0,0,s*dpr,(x+tw*0.03)*dpr,(y+th*0.03)*dpr);g.save();g.beginPath();g.rect(0,0,W,H);g.clip();g.lineJoin='round';
      window.MB.setCtx(g);try{sim.update(T.ph+H0.t*T.sp);sim.draw();}catch(e){}g.restore();}}
  layout();
  if(reduce){frame(0);H0.alive=false;return;}
  const ro=new ResizeObserver(()=>{if(H0.alive)layout();});ro.observe(cv);
  H0.obs={disconnect(){ro.disconnect();io.disconnect();}};
  const io=new IntersectionObserver(es=>{H0.vis=es[0].isIntersecting;});io.observe(cv);
  function loop(ts){if(!H0.alive||hero!==H0)return;
    if(H0.vis&&!document.hidden&&ts-(H0.drawn||0)>=31){const dt=H0.drawn?Math.min(0.1,(ts-H0.drawn)/1000):0;H0.t+=dt;H0.drawn=ts;frame();}
    requestAnimationFrame(loop);}
  requestAnimationFrame(loop);}

/* ---------- detail bench ---------- */
let bench=null,cadH=null,cadObs=null;
function stopBench(){stopHero();if(bench){bench.alive=false;bench=null;}if(cadObs){cadObs.disconnect();cadObs=null;}if(cadH){cadH.destroy();cadH=null;}}
const hasCad=n=>!!(window.CAD&&window.CAD.has(n));
function detail(n){stopBench();const m=MV[n-1];if(!m){location.hash='';return;}const sim=SIMS[n];
  const prev=n>1?n-1:null,next=n<507?n+1:null;
  app.innerHTML=`
  <div class="crumbs">
    <a class="btn" href="#" id="back">← All movements</a>
    <div class="nav"><a class="btn" ${prev?`href="#m${prev}"`:'aria-disabled="true"'} id="prev">← ${prev||''}</a><span class="pos">No. ${n} of 507</span><a class="btn" ${next?`href="#m${next}"`:'aria-disabled="true"'} id="next">${next||''} →</a></div>
  </div>
  <div class="bench" ${sim?'':'style="grid-template-columns:minmax(0,1fr)"'}>
    <section class="stage">
      ${sim?`<div class="sheet"><canvas id="cv" aria-label="Simulation of movement ${n}"></canvas><div class="plate">No. ${n}</div><div class="hint">drag to turn by hand</div></div>${sim.concept?`<p class="schem">Schematic view: shows how the movement works, not Brown's exact drawing.</p>`:''}`
           :`<div class="sheet pending"><b>${n}</b><span>Brown's description of this plate could not be recovered for this edition</span></div>`}
      <div class="text">
        <h2>${esc(m.t)}</h2>
        <p>${esc(m.s)}</p>
        <div class="note">
          ${m.b?`<div><b>Brown notes its use in</b>${esc(m.b)}</div>`:''}
          <div><b>Where you see it today</b>${esc(m.u)}</div>
          <div><button class="tag" id="cat">${esc(CATNAME[m.c])}</button></div>
        </div>
      </div>
    </section>
    ${sim?`<aside class="panel" aria-label="Controls">
      <div class="sec"><h3>Drive</h3>
        <div class="row"><button class="btn primary" id="play">Pause</button><button class="btn" id="stepb">Step</button><button class="btn" id="rev">Reverse</button><button class="btn" id="reset">Reset</button></div>
        <div class="ctl"><div class="lab"><label for="speed">Input speed</label><output id="speedo">1.0×</output></div><input type="range" id="speed" min="0.1" max="3" step="0.1" value="1"></div>
        <div class="key"><span><i style="background:var(--brass-fill)"></i>driver</span><span><i style="background:var(--steel-fill)"></i>driven</span><span><i style="background:var(--part)"></i>frame &amp; links</span></div>
      </div>
      <div class="sec" id="psec"><h3>Proportions</h3><div id="params" style="display:flex;flex-direction:column;gap:12px"></div></div>
      <div class="sec"><h3>Readings</h3><dl class="read" id="reads"></dl></div>
      <div class="sec"><h3 id="tracet">Trace</h3><canvas class="trace" id="tr"></canvas><div class="legend"><span>−8 s</span><span>now</span></div></div>
    </aside>`:''}
  </div>
  ${hasCad(n)?`<section class="cad" id="cad" aria-label="3D-printable model"></section>`:''}
  ${footer()}`;
  $('#back').addEventListener('click',e=>{e.preventDefault();location.hash='';});
  $('#cat').addEventListener('click',()=>{state.cat=m.c;store('cat',m.c);state.q='';store('q','');location.hash='';});
  window.scrollTo(0,0);
  if(sim)startBench(sim);
  const cs=$('#cad');if(cs){cadObs=new IntersectionObserver(es=>{if(es.some(e=>e.isIntersecting)&&!cadH){cadObs.disconnect();cadH={destroy(){}};const tok=cadH;window.CAD.load(n).then(()=>{if(cadH!==tok)return;cadH=window.CAD.mount(cs,n,m.t)||tok;}).catch(e=>{cs.innerHTML='<p class="schem">'+esc(e.message)+'</p>';});}},{rootMargin:'300px'});cadObs.observe(cs);}
}

function startBench(sim){
  const cv=$('#cv'),ctx=cv.getContext('2d'),tr=$('#tr'),tctx=tr.getContext('2d');
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const B=bench={alive:true,phi:0,playing:!reduce,speed:1,dir:1,simT:0,trace:[],lastOut:0,vel:0,drag:null,frame:0,readEls:[]};
  function reset(){B.phi=0;B.simT=0;B.trace=[];B.vel=0;sim.reset&&sim.reset();sim.update(0);B.lastOut=sim.output();}
  function advance(dphi,dt){const n=Math.max(1,Math.ceil(Math.abs(dphi)/0.02));for(let i=0;i<n;i++){B.phi+=dphi/n;sim.update(B.phi);}
    B.simT+=dt;const o=sim.output(),v=dt>0?(o-B.lastOut)/dt:0;B.vel=B.vel*0.6+v*0.4;B.lastOut=o;B.trace.push([B.simT,o]);while(B.trace.length&&B.trace[0][0]<B.simT-8)B.trace.shift();}
  function resize(){const dpr=Math.min(2,window.devicePixelRatio||1);cv.width=Math.round(cv.clientWidth*dpr);cv.height=Math.round(cv.clientHeight*dpr);tr.width=Math.round(tr.clientWidth*dpr);tr.height=Math.round(tr.clientHeight*dpr);}
  new ResizeObserver(resize).observe(cv);
  function drawTrace(){const w=tr.width,h=tr.height,dpr=Math.min(2,window.devicePixelRatio||1);tctx.setTransform(1,0,0,1,0,0);tctx.fillStyle=C.sheet;tctx.fillRect(0,0,w,h);if(!B.trace.length||!w)return;
    let lo=1e9,hi=-1e9;for(const [,v] of B.trace){lo=Math.min(lo,v);hi=Math.max(hi,v);}const span=Math.max(hi-lo,Math.abs(hi)>5?4:0.5),mid=(hi+lo)/2;lo=mid-span*.58;hi=mid+span*.58;
    const pad=6*dpr,X=t=>pad+(t-(B.simT-8))/8*(w-2*pad),Y=v=>h-pad-(v-lo)/(hi-lo)*(h-2*pad);
    tctx.strokeStyle=C.grid;tctx.lineWidth=1;for(let i=1;i<8;i++){const x=pad+i/8*(w-2*pad);tctx.beginPath();tctx.moveTo(x,0);tctx.lineTo(x,h);tctx.stroke();}
    tctx.beginPath();B.trace.forEach(([t,v],i)=>i?tctx.lineTo(X(t),Y(v)):tctx.moveTo(X(t),Y(v)));tctx.lineTo(X(B.simT),h);tctx.lineTo(X(B.trace[0][0]),h);tctx.closePath();tctx.fillStyle=C['steel-fill'];tctx.globalAlpha=.5;tctx.fill();tctx.globalAlpha=1;
    tctx.beginPath();B.trace.forEach(([t,v],i)=>i?tctx.lineTo(X(t),Y(v)):tctx.moveTo(X(t),Y(v)));tctx.strokeStyle=C.steel;tctx.lineWidth=1.6*dpr;tctx.stroke();
    const [lt,lv]=B.trace[B.trace.length-1];tctx.beginPath();tctx.arc(X(lt),Y(lv),3.2*dpr,0,TAU);tctx.fillStyle=C.brass;tctx.fill();
    tctx.font=`500 ${11*dpr}px -apple-system, BlinkMacSystemFont, "SF Pro Text", Inter, "Helvetica Neue", Arial, sans-serif`;tctx.fillStyle=C.muted;const f=v=>Math.abs(span)<5?v.toFixed(2):v.toFixed(0);tctx.textBaseline='top';tctx.fillText(f(hi),pad,pad*.5);tctx.textBaseline='bottom';tctx.fillText(f(lo),pad,h-pad*.5);}
  function renderReads(){let r;try{r=sim.reads(B.vel);}catch(e){r=[];}const dl=$('#reads');if(!dl)return;if(B.readEls.length!==r.length){dl.innerHTML='';B.readEls=r.map(([k])=>{const dt=document.createElement('dt');dt.textContent=k;const dd=document.createElement('dd');dl.append(dt,dd);return[dt,dd];});}
    r.forEach(([k,v],i)=>{if(B.readEls[i][0].textContent!==k)B.readEls[i][0].textContent=k;if(B.readEls[i][1].textContent!==v)B.readEls[i][1].textContent=v;});}
  function params(){const box=$('#params');box.innerHTML='';if(!sim.params.length){$('#psec').hidden=true;return;}
    sim.params.forEach(p=>{const id=`p${sim.num}-${p.id}`;
      if(p.type==='toggle'){const w=document.createElement('div');w.className='ctl';w.innerHTML=`<div class="lab"><span>${p.label}</span></div>`;const seg=document.createElement('div');seg.className='seg';
        p.options.forEach(([v,l])=>{const b=document.createElement('button');b.textContent=l;b.id=id+'-'+v;b.setAttribute('aria-pressed',sim.P[p.id]===v);b.onclick=()=>{sim.P[p.id]=v;seg.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',x===b));sim.onParam&&sim.onParam(p.id);sim.update(B.phi);B.trace=[];B.lastOut=sim.output();};seg.append(b);});w.append(seg);box.append(w);}
      else{const w=document.createElement('div');w.className='ctl';w.innerHTML=`<div class="lab"><label for="${id}">${p.label}</label><output>${p.fmt(sim.P[p.id])}</output></div><input type="range" id="${id}" min="${p.min}" max="${p.max}" step="${p.step}" value="${sim.P[p.id]}">`;
        const inp=w.querySelector('input'),out=w.querySelector('output');inp.oninput=()=>{sim.P[p.id]=+inp.value;out.textContent=p.fmt(+inp.value);sim.onParam&&sim.onParam(p.id);if(sim.trail)sim.trail=[];if(sim.ttrail)sim.ttrail=[];sim.update(B.phi);B.trace=[];B.lastOut=sim.output();};box.append(w);}});}
  const playB=$('#play');const setPlay=v=>{B.playing=v;playB.textContent=v?'Pause':'Run';};
  playB.onclick=()=>setPlay(!B.playing);
  $('#stepb').onclick=()=>{setPlay(false);advance(B.dir*TAU/36,1/36);};
  $('#rev').onclick=()=>{B.dir=-B.dir;window.MB.setDir(B.dir);};
  $('#reset').onclick=()=>reset();
  $('#speed').oninput=e=>{B.speed=+e.target.value;$('#speedo').textContent=B.speed.toFixed(1)+'×';};
  cv.addEventListener('pointerdown',e=>{B.drag={x:e.clientX,t:performance.now()};cv.classList.add('dragging');try{cv.setPointerCapture(e.pointerId);}catch(_){}});
  cv.addEventListener('pointermove',e=>{if(!B.drag)return;const now=performance.now(),dx=(e.clientX-B.drag.x)*W/cv.clientWidth,d=dx*0.012;if(d){window.MB.setDir(Math.sign(d));advance(d,Math.max(0.004,(now-B.drag.t)/1000));}B.drag.x=e.clientX;B.drag.t=now;});
  const end=()=>{B.drag=null;cv.classList.remove('dragging');window.MB.setDir(B.dir);};cv.addEventListener('pointerup',end);cv.addEventListener('pointercancel',end);
  window.MB.setDir(1);params();reset();setPlay(B.playing);$('#tracet').textContent='Trace · '+(sim.outLabel||'output');
  let last=performance.now();
  function loop(t){if(!B.alive)return;const dt=Math.min(0.05,(t-last)/1000);last=t;
    if(B.playing&&!B.drag)advance(B.dir*B.speed*BASE*TAU*dt,dt);else if(!B.drag)B.vel*=0.8;
    if(cv.width){drawSim(ctx,cv.width,sim);}drawTrace();if(B.frame++%4===0)renderReads();requestAnimationFrame(loop);}
  requestAnimationFrame(loop);
  B.key=e=>{if(!B.alive)return;if(e.target.closest&&e.target.closest('input,button,a'))return;if(e.code==='Space'){e.preventDefault();setPlay(!B.playing);}if(e.code==='ArrowRight'){advance(TAU/72,1/72);}if(e.code==='ArrowLeft'){advance(-TAU/72,1/72);}};
}
document.addEventListener('keydown',e=>{if(bench&&bench.key)bench.key(e);});

/* ---------- routing ---------- */
function route(){const m=(location.hash||'').match(/^#m(\d{1,3})$/);if(m){if(!bench&&location.hash!=='')store('scroll',window.scrollY);detail(+m[1]);}else home();}
window.addEventListener('hashchange',()=>{if(!(/^#m\d+$/.test(location.hash)))home();else route();});
window.addEventListener('scroll',()=>{if(!bench)store('scroll',window.scrollY);},{passive:true});
/* ---------- light / dark ---------- */
const tb=document.getElementById('themebtn'),ti=document.getElementById('themeico');
const SUN='<circle cx="12" cy="12" r="4.2"/><path d="M12 2.6v2.1M12 19.3v2.1M5.4 5.4l1.5 1.5M17.1 17.1l1.5 1.5M2.6 12h2.1M19.3 12h2.1M5.4 18.6l1.5-1.5M17.1 6.9l1.5-1.5"/>';
const MOON='<path d="M20.4 14.6A8.4 8.4 0 0 1 9.4 3.6a8.4 8.4 0 1 0 11 11z"/>';
function effDark(){const t=document.documentElement.dataset.theme;return t?t==='dark':matchMedia('(prefers-color-scheme: dark)').matches;}
function syncIcon(){if(!tb)return;const d=effDark();ti.innerHTML=d?SUN:MOON;tb.setAttribute('aria-label',d?'Switch to light mode':'Switch to dark mode');tb.title=d?'Light mode':'Dark mode';}
const savedTheme=store('theme');if(savedTheme==='light'||savedTheme==='dark')document.documentElement.dataset.theme=savedTheme;syncIcon();
if(tb)tb.addEventListener('click',()=>{const nt=effDark()?'light':'dark';document.documentElement.dataset.theme=nt;store('theme',nt);syncIcon();});
try{matchMedia('(prefers-color-scheme: dark)').addEventListener('change',syncIcon);}catch(e){}
route();
})();
