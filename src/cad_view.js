/* ===== 507 Movements · 3D viewer, hand operation, print layout and STL zip export ===== */
window.CAD=(()=>{
const {M4}=K,PI=Math.PI,TAU=2*PI;
const MODELS={};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const slug=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
let dlP=null;const downloads=()=>dlP||(dlP=(window.claude&&window.claude.use)?window.claude.use('downloads'):Promise.resolve(null));

/* shared shading */
const VS=`attribute vec3 p;attribute vec3 n;uniform mat4 M,VP;varying vec3 vn;varying vec3 vw;
void main(){vec4 w=M*vec4(p,1.);vw=w.xyz;vn=mat3(M)*n;gl_Position=VP*w;}`;
const FS=`precision mediump float;varying vec3 vn;varying vec3 vw;uniform vec3 col;uniform vec3 eye;uniform float alpha;
void main(){vec3 N=normalize(vn);vec3 V=normalize(eye-vw);if(dot(N,V)<0.)N=-N;
vec3 L1=normalize(vec3(.4,-.5,.8));vec3 L2=normalize(vec3(-.6,.4,.35));
vec3 L3=normalize(vec3(.1,-1.,.25));float d=max(dot(N,L1),0.)*.55+max(dot(N,L2),0.)*.2+max(dot(N,L3),0.)*.22;float hemi=.5+.5*N.z;
vec3 H=normalize(L1+V);float sp=pow(max(dot(N,H),0.),40.)*.22;
vec3 c=col*(.32+.16*hemi+d)+sp;float rim=pow(1.-max(dot(N,V),0.),3.);gl_FragColor=vec4(c+rim*.05,alpha);}`;
function hex(c){c=c.trim();if(c.startsWith('#')){if(c.length===4)c='#'+c[1]+c[1]+c[2]+c[2]+c[3]+c[3];return[1,3,5].map(i=>parseInt(c.slice(i,i+2),16)/255);}const m=c.match(/[\d.]+/g)||[200,200,200];return m.slice(0,3).map(v=>v/255);}
function palette(){const s=getComputedStyle(document.documentElement),g=k=>hex(s.getPropertyValue('--'+k)||'#ccc');const dark=g('sheet')[0]<0.4;
  return dark?{frame:[.40,.40,.42],driver:[1.0,.60,.16],driven:[.20,.55,.95],link:[.55,.55,.58],small:[.78,.78,.80],belt:[.10,.10,.11],bed:[.20,.20,.22],tpu:[.22,.22,.24]}
             :{frame:[.86,.86,.88],driver:[1.0,.62,.20],driven:[.18,.52,.92],link:[.70,.70,.73],small:[.96,.96,.97],belt:[.16,.16,.17],bed:[.90,.90,.92],tpu:[.25,.25,.27]};}

/* belt tube (display only) */
function tubeTris(pts,r,sides=8,closed=true){const out=[],n=pts.length;if(n<2)return out;const T=[],F=[];
  for(let i=0;i<n;i++){const a=pts[(i-1+n)%n],b=pts[(i+1)%n];let t=closed||(i>0&&i<n-1)?[b[0]-a[0],b[1]-a[1],b[2]-a[2]]:(i===0?[pts[1][0]-pts[0][0],pts[1][1]-pts[0][1],pts[1][2]-pts[0][2]]:[pts[n-1][0]-pts[n-2][0],pts[n-1][1]-pts[n-2][1],pts[n-1][2]-pts[n-2][2]]);const l=Math.hypot(...t)||1;T.push(t.map(v=>v/l));}
  let u=[0,0,1];if(Math.abs(T[0][2])>0.9)u=[1,0,0];
  for(let i=0;i<n;i++){const t=T[i];let d=u[0]*t[0]+u[1]*t[1]+u[2]*t[2];let x=[u[0]-d*t[0],u[1]-d*t[1],u[2]-d*t[2]];let l=Math.hypot(...x);if(l<1e-6){x=Math.abs(t[2])<0.9?[0,0,1]:[1,0,0];d=x[0]*t[0]+x[1]*t[1]+x[2]*t[2];x=[x[0]-d*t[0],x[1]-d*t[1],x[2]-d*t[2]];l=Math.hypot(...x);}x=x.map(v=>v/l);u=x;const y=[t[1]*x[2]-t[2]*x[1],t[2]*x[0]-t[0]*x[2],t[0]*x[1]-t[1]*x[0]];
    const ring=[];for(let k=0;k<sides;k++){const a=k/sides*TAU,c=Math.cos(a)*r,s=Math.sin(a)*r;ring.push([pts[i][0]+x[0]*c+y[0]*s,pts[i][1]+x[1]*c+y[1]*s,pts[i][2]+x[2]*c+y[2]*s]);}F.push(ring);}
  const m=closed?n:n-1;for(let i=0;i<m;i++){const A=F[i],B=F[(i+1)%n];for(let k=0;k<sides;k++){const k2=(k+1)%sides;out.push(...A[k],...B[k],...B[k2],...A[k],...B[k2],...A[k2]);}}return out;}
function along(pts){const L=[0];for(let i=1;i<=pts.length;i++){const a=pts[i-1],b=pts[i%pts.length];L.push(L[i-1]+Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2]));}
  return{len:L[L.length-1],at(s){s=((s%L[L.length-1])+L[L.length-1])%L[L.length-1];let lo=0,hi=L.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(L[m]<=s)lo=m;else hi=m;}const a=pts[lo],b=pts[(lo+1)%pts.length],t=(s-L[lo])/((L[lo+1]-L[lo])||1);return[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];}};}

function readme(n,title,model,parts){const L=[];L.push(`507 MECHANICAL MOVEMENTS · No. ${n} · ${title}`,'3D-printable working model','='.repeat(60),'',model.summary||'','',
  'PRINTED PARTS (each STL is already oriented for printing, flat side down)');
  for(const p of parts)L.push(`  ${p.file}  ×${p.qty}  ${p.mat||'PLA'}  ${p.dims}${p.note?'  · '+p.note:''}`);
  L.push('','SUGGESTED SETTINGS','  0.2 mm layers · 3 walls · 20–30 % infill · no supports needed','  Holes are drawn 0.3–0.6 mm oversize for running clearance; pins and caps are a snug push fit.','  If a cap is loose, add a drop of glue; if a pulley binds, run a 6.5 mm drill through the bore.','');
  if(model.hardware&&model.hardware.length){L.push('YOU WILL ALSO NEED');for(const h of model.hardware)L.push('  • '+h);L.push('');}
  if(model.steps&&model.steps.length){L.push('ASSEMBLY');model.steps.forEach((s,i)=>L.push(`  ${i+1}. ${s}`));L.push('');}
  L.push('Drawings by Henry T. Brown (1868) are public domain; this model is a new design for the interactive edition.');return L.join('\r\n');}

function mount(host,n,title){const model=MODELS[n];if(!model)return null;
  const P={};(model.params||[]).forEach(p=>P[p.id]=p.value);
  host.innerHTML=`<div class="cadhead"><div><div class="eyebrow">3D-printable model</div><h3>Print it, build it, turn it</h3></div><p>${esc(model.summary||'')}</p></div>
  <div class="cadgrid"><div class="cadstage"><canvas class="cadcv" aria-label="3D model of movement ${n}"></canvas><div class="cadread"></div><div class="cadhint">drag to orbit · scroll or pinch to zoom</div></div>
  <aside class="panel">
   <div class="sec"><h3>Operate</h3><div class="row"><button class="btn primary c-play">Pause</button><button class="btn c-hand" aria-pressed="false">Turn by hand</button></div>
     <div class="ctl"><div class="lab"><label>Input angle</label><output class="c-ango">0°</output></div><input type="range" class="c-ang" min="0" max="720" step="1" value="0"></div><div class="c-params" style="display:flex;flex-direction:column;gap:12px"></div></div>
   <div class="sec"><h3>View</h3><div class="seg c-view"><button aria-pressed="true" data-v="asm">Assembled</button><button aria-pressed="false" data-v="bed">Print layout</button></div><button class="btn c-reset" style="align-self:flex-start">Reset camera</button></div>
   <div class="sec"><h3>Download</h3><button class="btn primary c-dl">Download STL files (.zip)</button><div class="c-st" role="status" style="font-size:12.5px;color:var(--muted)"></div></div>
  </aside></div>
  <div class="cadinfo"><div><h4>Printed parts</h4><table class="ptab"><thead><tr><th>Part</th><th>Qty</th><th>Size (mm)</th><th>Notes</th></tr></thead><tbody class="c-parts"></tbody></table></div>
   <div><h4>You will also need</h4><ul class="c-hw"></ul><h4>Assembly</h4><ol class="c-steps"></ol></div></div>`;
  const $=s=>host.querySelector(s),cv=$('.cadcv');
  const gl=cv.getContext('webgl',{antialias:true});
  let parts=[],bufs={},pal=palette(),alive=true;
  function buildParts(){parts=model.parts(P).map(p=>{const bb=K.bbox(p.mesh);const d=[0,1,2].map(k=>bb.hi[k]-bb.lo[k]);return Object.assign({qty:1,mat:'PLA',role:'frame'},p,{bb,dims:d.map(v=>v.toFixed(0)).join(' × '),file:`${String(n).padStart(3,'0')}-${slug(p.name)}.stl`});});
    if(gl){for(const k in bufs){gl.deleteBuffer(bufs[k].pb);gl.deleteBuffer(bufs[k].nb);}bufs={};for(const p of parts)bufs[p.id]=upload(p.mesh.t);}
    $('.c-parts').innerHTML=parts.map(p=>`<tr><td>${esc(p.name)}</td><td>${p.qty}</td><td>${p.dims}</td><td>${esc((p.mat!=='PLA'?p.mat+' · ':'')+(p.note||''))}</td></tr>`).join('');}
  let prog,U={},ap,an;
  function upload(t){const P=new Float32Array(t),N=new Float32Array(t.length);for(let o=0;o<t.length;o+=9){const ax=P[o+3]-P[o],ay=P[o+4]-P[o+1],az=P[o+5]-P[o+2],bx=P[o+6]-P[o],by=P[o+7]-P[o+1],bz=P[o+8]-P[o+2];let nx=ay*bz-az*by,ny=az*bx-ax*bz,nz=ax*by-ay*bx;const l=Math.hypot(nx,ny,nz)||1;for(let v=0;v<3;v++){N[o+v*3]=nx/l;N[o+v*3+1]=ny/l;N[o+v*3+2]=nz/l;}}
    const pb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,pb);gl.bufferData(gl.ARRAY_BUFFER,P,gl.STATIC_DRAW);const nb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,nb);gl.bufferData(gl.ARRAY_BUFFER,N,gl.STATIC_DRAW);return{pb,nb,n:t.length/3};}
  if(gl){const sh=(t,s)=>{const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);return o;};prog=gl.createProgram();gl.attachShader(prog,sh(gl.VERTEX_SHADER,VS));gl.attachShader(prog,sh(gl.FRAGMENT_SHADER,FS));gl.linkProgram(prog);gl.useProgram(prog);
    ['M','VP','col','eye','alpha'].forEach(k=>U[k]=gl.getUniformLocation(prog,k));ap=gl.getAttribLocation(prog,'p');an=gl.getAttribLocation(prog,'n');gl.enable(gl.DEPTH_TEST);}
  else $('.cadhint').textContent='The 3D view needs WebGL, which is turned off in this browser. The STL download still works.';
  const dyn=gl?{pb:gl.createBuffer(),nb:gl.createBuffer(),n:0}:null;
  function draw(b,M,col,alpha=1){gl.uniformMatrix4fv(U.M,false,M);gl.uniform3fv(U.col,col);gl.uniform1f(U.alpha,alpha);gl.bindBuffer(gl.ARRAY_BUFFER,b.pb);gl.enableVertexAttribArray(ap);gl.vertexAttribPointer(ap,3,gl.FLOAT,false,0,0);gl.bindBuffer(gl.ARRAY_BUFFER,b.nb);gl.enableVertexAttribArray(an);gl.vertexAttribPointer(an,3,gl.FLOAT,false,0,0);gl.drawArrays(gl.TRIANGLES,0,b.n);}
  function drawDyn(t,col){if(!t.length)return;const b=upload(t);draw(b,M4.id(),col);gl.deleteBuffer(b.pb);gl.deleteBuffer(b.nb);}
  /* params */
  const pbox=$('.c-params');(model.params||[]).forEach(p=>{const w=document.createElement('div');w.className='ctl';
    if(p.type==='toggle'){w.innerHTML=`<div class="lab"><span>${esc(p.label)}</span></div>`;const seg=document.createElement('div');seg.className='seg';p.options.forEach(([v,l])=>{const b=document.createElement('button');b.textContent=l;b.setAttribute('aria-pressed',P[p.id]===v);b.onclick=()=>{P[p.id]=v;seg.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',x===b));if(p.rebuild)buildParts();};seg.append(b);});w.append(seg);}
    else{w.innerHTML=`<div class="lab"><label>${esc(p.label)}</label><output>${p.fmt(P[p.id])}</output></div><input type="range" min="${p.min}" max="${p.max}" step="${p.step}" value="${P[p.id]}">`;const i=w.querySelector('input'),o=w.querySelector('output');i.oninput=()=>{P[p.id]=+i.value;o.textContent=p.fmt(+i.value);if(p.rebuild)buildParts();};}
    pbox.append(w);});
  buildParts();
  (model.hardware||[]).forEach(h=>{const li=document.createElement('li');li.textContent=h;$('.c-hw').append(li);});if(!(model.hardware||[]).length)$('.c-hw').innerHTML='<li>Nothing else: every part is printed.</li>';
  (model.steps||[]).forEach(h=>{const li=document.createElement('li');li.textContent=h;$('.c-steps').append(li);});
  /* camera */
  const S={};let phi=0,playing=!matchMedia('(prefers-reduced-motion: reduce)').matches,hand=false,view='asm';
  const asm0=model.pose(0,P,S);let lo=[1e9,1e9,1e9],hi=[-1e9,-1e9,-1e9];for(const [id,M] of asm0.inst){const p=parts.find(q=>q.id===id);if(!p)continue;for(const x of [p.bb.lo[0],p.bb.hi[0]])for(const y of [p.bb.lo[1],p.bb.hi[1]])for(const z of [p.bb.lo[2],p.bb.hi[2]]){const q=M4.apply(M,[x,y,z]);for(let k=0;k<3;k++){lo[k]=Math.min(lo[k],q[k]);hi[k]=Math.max(hi[k],q[k]);}}}
  const C0=[(lo[0]+hi[0])/2,(lo[1]+hi[1])/2,(lo[2]+hi[2])/2],R0=Math.max(40,Math.hypot(hi[0]-lo[0],hi[1]-lo[1],hi[2]-lo[2])/2);
  const cam0=Object.assign({yaw:-1.15,pitch:0.62},model.cam||{});let cam={yaw:cam0.yaw,pitch:cam0.pitch,dist:R0*2.7,target:C0.slice()};
  function layout(){const items=[];for(const p of parts)for(let q=0;q<p.qty;q++)items.push(p);items.sort((a,b)=>(b.bb.hi[1]-b.bb.lo[1])-(a.bb.hi[1]-a.bb.lo[1]));const gap=8,maxW=Math.max(230,...items.map(p=>p.bb.hi[0]-p.bb.lo[0]+gap));let x=0,y=0,rowH=0;const out=[];
    for(const p of items){const w=p.bb.hi[0]-p.bb.lo[0],h=p.bb.hi[1]-p.bb.lo[1];if(x+w>maxW&&x>0){x=0;y+=rowH+gap;rowH=0;}out.push([p.id,M4.T(x-p.bb.lo[0],-y-h-p.bb.lo[1],-p.bb.lo[2])]);x+=w+gap;rowH=Math.max(rowH,h);}
    const W=maxW,Hh=y+rowH;return{out:out.map(([id,M])=>[id,M4.mul(M4.T(-W/2,Hh/2,0),M)]),W,H:Hh};}
  let bed=null;const bedBuf=()=>{if(bed)return bed;const L=layout();const m=K.box(L.W+24,L.H+24,-2,0);bed={L,b:upload(m.t)};return bed;};
  /* input */
  const pts=new Map();let grab=null;
  cv.addEventListener('pointerdown',e=>{pts.set(e.pointerId,[e.clientX,e.clientY]);try{cv.setPointerCapture(e.pointerId);}catch(_){}if(hand&&pts.size===1){setPlay(false);grab={x:e.clientX,p0:phi};}});
  cv.addEventListener('pointermove',e=>{if(!pts.has(e.pointerId))return;const [px,py]=pts.get(e.pointerId);
    if(hand&&grab&&pts.size===1){phi=Math.max(0,grab.p0+(e.clientX-grab.x)*0.02);syncAng();}
    else if(pts.size===1){cam.yaw-=(e.clientX-px)*0.008;cam.pitch=Math.max(-0.2,Math.min(1.5,cam.pitch+(e.clientY-py)*0.006));}
    else if(pts.size===2){const o=[...pts.entries()].find(([id])=>id!==e.pointerId)[1];const d0=Math.hypot(px-o[0],py-o[1]),d1=Math.hypot(e.clientX-o[0],e.clientY-o[1]);if(d1>0)cam.dist=Math.max(R0*0.8,Math.min(R0*8,cam.dist*d0/d1));}
    pts.set(e.pointerId,[e.clientX,e.clientY]);});
  const up=e=>{pts.delete(e.pointerId);grab=null;};cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
  cv.addEventListener('wheel',e=>{e.preventDefault();cam.dist=Math.max(R0*0.8,Math.min(R0*8,cam.dist*Math.exp(e.deltaY*0.001)));},{passive:false});
  const playB=$('.c-play'),handB=$('.c-hand'),ang=$('.c-ang');
  function setPlay(v){playing=v;playB.textContent=v?'Pause':'Run';}
  function syncAng(){const d=phi*180/PI;ang.value=String(Math.round(d%720));$('.c-ango').textContent=Math.round(d)+'°';}
  setPlay(playing);playB.onclick=()=>setPlay(!playing);
  handB.onclick=()=>{hand=!hand;handB.setAttribute('aria-pressed',hand);if(hand)setPlay(false);$('.cadhint').textContent=hand?'drag left or right to turn the input':'drag to orbit · scroll or pinch to zoom';cv.style.cursor=hand?'ew-resize':'';};
  ang.oninput=()=>{setPlay(false);phi=ang.value*PI/180;$('.c-ango').textContent=ang.value+'°';};
  $('.c-view').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;view=b.dataset.v;$('.c-view').querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',x===b));bed=null;
    if(view==='bed'){const L=bedBuf().L;cam={yaw:-PI/2,pitch:1.25,dist:Math.max(L.W,L.H)*2.1,target:[0,0,0]};}else cam={yaw:cam0.yaw,pitch:cam0.pitch,dist:R0*2.7,target:C0.slice()};});
  $('.c-reset').onclick=()=>{if(view==='bed'){const L=bedBuf().L;cam={yaw:-PI/2,pitch:1.25,dist:Math.max(L.W,L.H)*2.1,target:[0,0,0]};}else cam={yaw:cam0.yaw,pitch:cam0.pitch,dist:R0*2.7,target:C0.slice()};};
  /* download */
  const st=$('.c-st'),dlB=$('.c-dl');
  dlB.onclick=async()=>{dlB.disabled=true;try{const files=parts.map(p=>{const bb=p.bb,m=K.xf(p.mesh,M4.T(-(bb.lo[0]+bb.hi[0])/2,-(bb.lo[1]+bb.hi[1])/2,-bb.lo[2]));return{name:p.file,data:K.stl(m,p.name)};});
      files.push({name:'README.txt',data:readme(n,title,model,parts)});const z=K.zip(files),fname=`movement-${String(n).padStart(3,'0')}-${slug(title)}-stl.zip`,blob=new Blob([z],{type:'application/zip'});
      const dl=await downloads();
      if(dl){st.textContent='Confirm the download…';await dl.save({filename:fname,data:blob});st.textContent='Saved '+fname;}
      else{const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=fname;document.body.append(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},2000);st.textContent=`${fname} · ${(z.length/1024).toFixed(0)} KB`;}
    }catch(e){const c=e&&e.code;st.textContent=c==='declined'?'Download cancelled.':c==='rate_limited'?'Another download is still open. Finish it, then try again.':(e&&e.message)||'Download failed.';}finally{dlB.disabled=false;}};
  /* loop */
  const ro=$('.cadread');let last=performance.now(),fr=0;
  const mo=new MutationObserver(()=>{pal=palette();});mo.observe(document.documentElement,{attributes:true});
  function resize(){const dpr=Math.min(2,window.devicePixelRatio||1);const w=Math.round(cv.clientWidth*dpr),h=Math.round(cv.clientHeight*dpr);if(w&&(cv.width!==w||cv.height!==h)){cv.width=w;cv.height=h;}}
  function frame(now){if(!alive)return;const dt=Math.min(0.05,(now-last)/1000);last=now;if(playing){phi+=dt*TAU*0.25;if(fr%6===0)syncAng();}fr++;
    const pose=model.pose(phi,P,S);if(fr%4===0)ro.textContent=view==='bed'?`${parts.reduce((s,p)=>s+p.qty,0)} printed pieces · laid out flat, as they print`:(pose.read||'');
    if(gl){resize();gl.viewport(0,0,cv.width,cv.height);const bg=hex(getComputedStyle(cv.parentElement).backgroundColor);gl.clearColor(bg[0],bg[1],bg[2],1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
      const cp=Math.cos(cam.pitch),e=[cam.target[0]+cam.dist*cp*Math.cos(cam.yaw),cam.target[1]+cam.dist*cp*Math.sin(cam.yaw),cam.target[2]+cam.dist*Math.sin(cam.pitch)];
      const VP=M4.mul(persp(0.6,cv.width/Math.max(1,cv.height),cam.dist*0.05,cam.dist*6),look(e,cam.target,[0,0,1]));gl.uniformMatrix4fv(U.VP,false,VP);gl.uniform3fv(U.eye,e);
      if(view==='bed'){const B=bedBuf();draw(B.b,M4.id(),pal.bed);for(const [id,M] of B.L.out){const p=parts.find(q=>q.id===id);draw(bufs[id],M,pal[p.mat==='TPU'?'tpu':p.role]||pal.frame);}}
      else{for(const [id,M] of pose.inst){const p=parts.find(q=>q.id===id);if(!p||p.hidden)continue;draw(bufs[id],M,pal[p.mat==='TPU'?'tpu':p.role]||pal.frame);}
        const bt=[],mk=[];for(const b of (pose.belts||[])){bt.push(...tubeTris(b.pts,b.r||1.6,8,b.closed!==false));if(b.travel!==undefined){const A=along(b.pts);const k=Math.max(4,Math.round(A.len/45));for(let i=0;i<k;i++){const q=A.at(b.travel+i*A.len/k);mk.push(...cube(q,(b.r||1.6)*1.5));}}}
        drawDyn(bt,pal.belt);drawDyn(mk,pal.driver);}}
    requestAnimationFrame(frame);}
  function cube(c,s){const m=K.box(2*s,2*s,c[2]-s,c[2]+s,c[0],c[1]);return m.t;}
  requestAnimationFrame(frame);
  return{destroy(){alive=false;mo.disconnect();try{gl&&gl.getExtension('WEBGL_lose_context')&&gl.getExtension('WEBGL_lose_context').loseContext();}catch(_){}}};}
function persp(f,a,n,fa){const t=1/Math.tan(f/2);return[t/a,0,0,0,0,t,0,0,0,0,(fa+n)/(n-fa),-1,0,0,2*fa*n/(n-fa),0];}
function look(e,c,u){let z=[e[0]-c[0],e[1]-c[1],e[2]-c[2]];let l=Math.hypot(...z);z=z.map(v=>v/l);let x=[u[1]*z[2]-u[2]*z[1],u[2]*z[0]-u[0]*z[2],u[0]*z[1]-u[1]*z[0]];l=Math.hypot(...x);x=x.map(v=>v/l);const y=[z[1]*x[2]-z[2]*x[1],z[2]*x[0]-z[0]*x[2],z[0]*x[1]-z[1]*x[0]];
  return[x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-(x[0]*e[0]+x[1]*e[1]+x[2]*e[2]),-(y[0]*e[0]+y[1]*e[1]+y[2]*e[2]),-(z[0]*e[0]+z[1]*e[1]+z[2]*e[2]),1];}
const loading={};
function chunkOf(n){const I=window.CAD.INDEX||{};for(const k in I)if(I[k].indexOf(n)>=0)return k;return null;}
function has(n){return !!MODELS[n]||!!chunkOf(n);}
function load(n){if(MODELS[n])return Promise.resolve(true);const c=chunkOf(n);if(!c)return Promise.resolve(false);
  return loading[c]||(loading[c]=new Promise((res,rej)=>{const s=document.createElement('script');s.src='js/cad/'+c+'.js';s.onload=()=>res(true);s.onerror=()=>{delete loading[c];rej(new Error('Could not load the 3D model'));};document.head.append(s);}));}
return{MODELS,mount,K,along,has,load};
})();
