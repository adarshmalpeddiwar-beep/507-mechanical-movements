/* ===== 507 Movements · planar kit: printable models driven by the 2D simulation's own kinematics =====
   A model is described in the simulation's canvas coordinates (px, y down). The kit converts to mm
   (x·S, −y·S), stacks parts in layers above a base plate, adds printed pins, caps and bosses,
   and poses every part from the simulation state, so the 3D model and the 2D drawing always agree. */
const PK=(()=>{
const {M4,circle,prism,cyl,tubeSolid,box,merge,lathe,hull,ccw}=K,PI=Math.PI,TAU=2*PI;
const MODELS=window.CAD.MODELS;
/* print constants (mm) */
const BT=4,TH=4,GAP=0.5,PINR=2,BORER=2.3,CAPR=4.2,CAPH=3,CAPB=1.95,BOSSR=4.6;
let S=0.3;                                  /* mm per px while a model is being built */
const zl=l=>BT+GAP+l*(TH+GAP);               /* bottom of layer l */
const mm=p=>[p[0]*S,-p[1]*S];
/* ---------- 2D shapes in px (canvas-local) ---------- */
const deg=PI/180;
function arcPts(cx,cy,r,a0,a1,n){const o=[];for(let i=0;i<=n;i++){const a=a0+(a1-a0)*i/n;o.push([cx+r*Math.cos(a),cy+r*Math.sin(a)]);}return o;}
/* involute gear outline: pitch radius R (px), Z teeth, tooth centred on angle 0 (matches gearPts phase) */
function gearOutline(R,Z,o={}){const m=2*R/Z,pa=20*deg,rb=R*Math.cos(pa),bl=(o.backlash??0.12)/S;/* px */
  const ra=R+(o.add??1)*m,rr=Math.max(R-1.25*m,1),half=PI/(2*Z)-bl/(2*R),inv=a=>Math.tan(a)-a,ip=inv(pa);
  const fl=[];const r0=Math.max(rb,rr),N=6;for(let i=0;i<=N;i++){const r=r0+(ra-r0)*i/N;const a=Math.acos(Math.min(1,rb/r));fl.push([r,half+ip-inv(a)]);}
  const pts=[];for(let k=0;k<Z;k++){const c=k*TAU/Z;
    const thR=fl[0][1];if(rr<r0-1e-6)pts.push([rr*Math.cos(c-thR-0.0001),rr*Math.sin(c-thR-0.0001)]);
    for(const [r,t] of fl)pts.push([r*Math.cos(c-t),r*Math.sin(c-t)]);
    const tt=fl[N][1];if(tt>0.002)for(const p of arcPts(0,0,ra,c-tt,c+tt,2).slice(1,-1))pts.push(p);
    for(let i=N;i>=0;i--){const [r,t]=fl[i];pts.push([r*Math.cos(c+t),r*Math.sin(c+t)]);}
    if(rr<r0-1e-6)pts.push([rr*Math.cos(c+thR+0.0001),rr*Math.sin(c+thR+0.0001)]);
    const c2=c+TAU/Z,g0=c+thR+0.0002,g1=c2-thR-0.0002;if(g1>g0)for(const p of arcPts(0,0,rr,g0,g1,3).slice(1,-1))pts.push(p);}
  return pts;}
/* internal gear hole: inner tooth tips at R-m, spaces shaped like external teeth reaching out to R+1.25m */
function ringHole(R,Z){const m=2*R/Z,pa=20*deg,rb=R*Math.cos(pa),bl=0.12/S,inv=a=>Math.tan(a)-a,ip=inv(pa),ra=R+1.25*m,rr=R-m,half=PI/(2*Z)+bl/(2*R);
  const r0=Math.max(rb,rr),fl=[];for(let i=0;i<=6;i++){const r=r0+(ra-r0)*i/6;fl.push([r,half+ip-inv(Math.acos(Math.min(1,rb/r)))]);}if(rr<r0-1e-6)fl.unshift([rr,fl[0][1]]);
  const pts=[],tau=TAU/Z;for(let k=0;k<Z;k++){const c=k*tau,sc=c+tau/2;pts.push([rr*Math.cos(c),rr*Math.sin(c)]);
    for(const [r,t] of fl)pts.push([r*Math.cos(sc-t),r*Math.sin(sc-t)]);for(let i=fl.length-1;i>=0;i--){const [r,t]=fl[i];pts.push([r*Math.cos(sc+t),r*Math.sin(sc+t)]);}}
  return pts;}
const hole=(x,y,r)=>circle(r??BORER/S,28,x,y);
const Sh={
  gear(R,Z,o={}){const m=2*R/Z,root=R-1.25*m;const hs=[hole(0,0,o.bore)];if(o.hub===false){}const sp=o.lighten??(root*S>22);
    if(sp){const hub=(o.bore??BORER/S)+6/S,rr=(root+hub)/2,hr=(root-hub)*0.32,n=root*S>40?6:4;for(let i=0;i<n;i++){const a=(i+.5)*TAU/n;hs.push(circle(hr,24,rr*Math.cos(a),rr*Math.sin(a)));}}
    for(const h of o.holes||[])hs.push(hole(h[0],h[1],h[2]));return{o:gearOutline(R,Z,o),h:hs};},
  ring(R,Z,ro,o={}){return{o:circle(ro,96),h:[ringHole(R,Z)]};},
  disk(r,holes=[[0,0]],n=72){return{o:circle(r,n),h:holes.map(h=>hole(h[0],h[1],h[2]))};},
  annulus(ro,ri,n=72){return{o:circle(ro,n),h:[circle(ri,n)]};},
  /* bar from (0,0) to (L,0), width w (px, at least 11 mm), holes at listed x positions */
  bar(L,w,holes=[0,L]){const W=Math.max(w,11/S)/2;const o=hull([...circle(W,24,0,0),...circle(W,24,L,0)]);return{o,h:holes.map(x=>Array.isArray(x)?hole(x[0],x[1],x[2]):hole(x,0))};},
  /* lever: hull of circles [x,y,r] (px), holes [x,y,(r)] */
  lever(cs,holes){const o=hull(cs.flatMap(([x,y,r])=>circle(Math.max(r,5.5/S),24,x,y)));return{o,h:(holes||cs.map(c=>[c[0],c[1]])).map(h=>hole(h[0],h[1],h[2]))};},
  rect(w,h,cx=0,cy=0,holes=[]){return{o:[[cx-w/2,cy-h/2],[cx+w/2,cy-h/2],[cx+w/2,cy+h/2],[cx-w/2,cy+h/2]],h:holes.map(q=>q.length===4?Sh.slotPts(...q):hole(q[0],q[1],q[2]))};},
  poly(pts,holes=[]){return{o:pts,h:holes.map(q=>Array.isArray(q[0])?q:hole(q[0],q[1],q[2]))};},
  /* slot from (x1,y1) to (x2,y2), width w */
  slotPts(x1,y1,x2,y2,w){w=w??(BORER*2+0.4)/S;const a=Math.atan2(y2-y1,x2-x1);return K.slot(Math.hypot(x2-x1,y2-y1),w,14,(x1+x2)/2,(y1+y2)/2,a);},
  /* straight rack: teeth along +x from x0 to x1, pitch line at y=0, teeth point to -y (up in canvas) unless down; m module (px); phase c0 = x of a tooth centre */
  rack(x0,x1,m,depth,o={}){const p=PI*m,down=!!o.down,s=down?1:-1,bl=(o.backlash??0.12)/S,tn=Math.tan(20*deg),a=m,d=1.25*m;const pts=[];const c0=o.c0??0;
    let k=Math.ceil((x0-c0)/p-0.5);const top=[];for(;c0+k*p<=x1;k++){const c=c0+k*p,hw=p/4-bl/2;const tip=hw-a*tn,root=hw+d*tn;
      const q=[[c-root,s*-d],[c-tip,s*a],[c+tip,s*a],[c+root,s*-d]];for(const v of q)if(v[0]>=x0&&v[0]<=x1)top.push(v);}
    pts.push([x0,-s*d]);for(const v of top)pts.push(v);pts.push([x1,-s*d],[x1,-s*(d+depth)],[x0,-s*(d+depth)]);
    if(down)pts.reverse();return{o:pts,h:(o.holes||[]).map(q=>q.length===4?Sh.slotPts(...q):hole(q[0],q[1],q[2]))};},
  /* ratchet / saw wheel: Z teeth, tip radius R, depth d; dir +1 = teeth face anticlockwise in canvas */
  ratchet(R,Z,d,dir=1,o={}){const pts=[];for(let k=0;k<Z;k++){const a0=k*TAU/Z,a1=(k+1)*TAU/Z;const n=5;for(let i=0;i<n;i++){const a=a0+(a1-a0)*i/n,r=R-d+d*i/n;pts.push([r*Math.cos(dir*a),r*Math.sin(dir*a)]);}pts.push([R*Math.cos(dir*a1),R*Math.sin(dir*a1)]);}
    return{o:dir>0?pts:pts.reverse(),h:[hole(0,0,o.bore),...(o.holes||[]).map(h=>hole(h[0],h[1],h[2]))]};},
  /* closed curve from a polar function r(θ) */
  polar(fr,n=180,holes=[[0,0]]){const o=[];for(let i=0;i<n;i++){const t=i/n*TAU;const r=fr(t);o.push([r*Math.cos(t),r*Math.sin(t)]);}return{o,h:holes.map(h=>hole(h[0],h[1],h[2]))};},
  hole,circle,arcPts,gearOutline
};
/* ---------- meshes ---------- */
function ext(sh,z0,z1){const o=sh.o.map(mm),hs=(sh.h||[]).map(h=>h.map(mm));return prism(o,hs,z0,z1);}
const capMesh=()=>tubeSolid(CAPR,CAPB,0,CAPH,32);
/* place a planar part: canvas pose [x,y,a] (px, rad) at height z (mm) */
const place=(x,y,a,z)=>M4.mul(M4.T(x*S,-y*S,z),M4.Rz(-(a||0)));
/* ---------- simulation runner (own copy of the sim state) ---------- */
function runner(n,P){const base=window.MB&&window.MB.SIMS[n];if(!base)return null;const s=Object.create(base);s.P={};(base.params||[]).forEach(p=>s.P[p.id]=p.value);Object.assign(s.P,P||{});
  for(const k of Object.keys(base))if(Array.isArray(base[k])&&k!=='params')s[k]=base[k].slice();
  try{s.reset&&s.reset();}catch(e){}s.update(0);let last=0;
  return{sim:s,at(phi){const d=phi-last;if(Math.abs(d)>40){s.reset&&s.reset();last=0;return this.at(phi);}const k=Math.max(1,Math.ceil(Math.abs(d)/0.02));for(let i=1;i<=k;i++)s.update(last+d*i/k);last=phi;return s.g||s;}};}
/* ---------- define a model ----------
 spec: {S, sim (num), summary, steps, hardware, cam, up (stand the board upright),
   parts:[{id,name,role,layer,t (layers thick),shape | mesh (mm, already placed in own frame), qty, note, pins:[[lx,ly,topLayer]] (printed pins on this part, local px)}],
   ground:[[x,y,l0,l1]]  pins printed on the base: boss up to layer l0, pin through layer l1, capped,
   fixed:[{shape (px, absolute), l0, l1}] walls / guides printed on the base from the plate up through layer l1,
   pose(g,sim,phi) -> {id:[x,y,a] | M4 matrix | [[x,y,a],...] for qty>1},
   ropes(g) -> [{pts:[[x,y],...], layer, closed}], read(g,sim) -> string, plate:{w,h,cx,cy} optional }
*/
function def(n,spec){MODELS[n]={_pk:spec,summary:spec.summary,cam:spec.cam||(spec.up?{yaw:-PI/2+0.35,pitch:0.32}:undefined),
  get hardware(){return spec.hardware||[];},get steps(){return spec.steps||autoSteps(spec);},params:spec.params,
  parts(P){return build(n,spec,P);},pose(phi,P,St){return poseOf(n,spec,phi,P,St);}};}
function autoSteps(spec){const st=['Print every part flat side down, as shown in Print layout. No supports are needed.'];
  st.push('Fit the parts onto the pins in order, starting with the lowest layer, so each one sits on the boss or part below it.');
  if(spec._caps)st.push('Press a cap onto every pin so the parts turn freely without lifting off.');
  st.push(spec.drive||'Turn the orange driving part by hand and watch the motion pass through the model.');return st;}
function bboxPts(pts,lo,hi){for(const p of pts){lo[0]=Math.min(lo[0],p[0]);lo[1]=Math.min(lo[1],p[1]);hi[0]=Math.max(hi[0],p[0]);hi[1]=Math.max(hi[1],p[1]);}}
function build(n,spec,P){S=spec.S||0.3;const R=runner(spec.sim||n,spec.P);spec._R=R;
  const parts=[],caps=[];spec._parts={};
  for(const p of spec.parts){const t=(p.t||1)*(TH+GAP)-GAP,th=p.th||t;let mesh=p.mesh;
    if(!mesh){mesh=ext(typeof p.shape==='function'?p.shape(Sh):p.shape,0,th);
      for(const q of p.pins||[]){const top=zl(q[2])-zl(p.layer||0)+TH+GAP+CAPH;const [x,y]=mm(q);mesh=merge(mesh,cyl(PINR,th,top,28,x,y));caps.push({part:p.id,local:q,z:zl(q[2])+TH+GAP});}
      for(const b of p.bosses||[]){const [x,y]=mm(b);mesh=merge(mesh,cyl(b[3]||BOSSR,th,th+b[2],28,x,y));}}
    const q=Object.assign({},p,{mesh,role:p.role||'link'});delete q.shape;parts.push(q);spec._parts[p.id]=p;}
  /* base plate: from swept extents of every part */
  const lo=[1e9,1e9],hi=[-1e9,-1e9];
  for(let i=0;i<24&&R;i++){const g=R.at(i/24*TAU*(spec.cycle||1));const ps=spec.pose(g,R.sim,i/24*TAU);for(const p of spec.parts){if(p.noPlate)continue;const v=ps[p.id];if(!v)continue;const list=(Array.isArray(v[0])?v:[v]);
      for(const pv of list){if(pv.length===16)continue;const sh=p._bbShape||(p._bbShape=(typeof p.shape==='function'?p.shape(Sh):p.shape));if(!sh)continue;const c=Math.cos(pv[2]||0),s=Math.sin(pv[2]||0);
        bboxPts(sh.o.filter((_,k)=>k%3===0).map(([x,y])=>[pv[0]+x*c-y*s,pv[1]+x*s+y*c]),lo,hi);}}}
  if(R)R.at(0);
  for(const gp of spec.ground||[])bboxPts([[gp[0]-12,gp[1]-12],[gp[0]+12,gp[1]+12]],lo,hi);
  for(const f of spec.fixed||[])bboxPts((typeof f.shape==='function'?f.shape(Sh):f.shape).o,lo,hi);
  const M=(spec.margin??10)/S;let pl=spec.plate||{x0:lo[0]-M,y0:lo[1]-M,x1:hi[0]+M,y1:hi[1]+M};spec._plate=pl;
  const pw=(pl.x1-pl.x0)*S,ph=(pl.y1-pl.y0)*S;
  const base=[prism(K.rrect(pw,ph,6,6,(pl.x0+pl.x1)/2*S,-(pl.y0+pl.y1)/2*S),[],0,BT)];
  for(const gp of spec.ground||[]){const [x,y]=mm(gp);const zb=zl(gp[2])-GAP;if(zb>BT+0.01)base.push(cyl(BOSSR,BT,zb,28,x,y));base.push(cyl(PINR,zb,zl(gp[3])+TH+GAP+CAPH,28,x,y));caps.push({ground:true,x:gp[0],y:gp[1],z:zl(gp[3])+TH+GAP});}
  for(const f of spec.fixed||[]){const sh=typeof f.shape==='function'?f.shape(Sh):f.shape;base.push(ext(sh,f.z0??BT,zl(f.l1??0)+(f.t??TH)));}
  parts.unshift({id:'base',name:spec.baseName||'Base plate',role:'frame',mesh:merge(...base),note:spec.baseNote||'pins and guides are printed in place'});
  if(spec.up)parts.push({id:'stand',name:'Stand',role:'frame',qty:2,mesh:prism([[0,0],[40,0],[0,40]],[],0,6),note:'glue to the back of the base so it stands upright'});
  if(caps.length)parts.push({id:'cap',name:'Pin cap',role:'small',qty:caps.length,mesh:capMesh(),note:'push-fit; a drop of glue if loose'});
  spec._caps=caps;
  for(const p of parts)if(p.qty===undefined){const v=spec._parts[p.id];if(v&&v.qty)p.qty=v.qty;}
  return parts;}
function poseOf(n,spec,phi,P,St){S=spec.S||0.3;const R=spec._R;const g=R?R.at(phi):{};const ps=spec.pose(g,R&&R.sim,phi);const inst=[];
  const pl=spec._plate,UP=spec.up?M4.mul(M4.Rx(PI/2),M4.T(0,pl.y1*S,0)):null;/* hinge about the plate's bottom edge: board stands in the XZ plane, parts face -y */
  const put=(id,M)=>inst.push([id,UP?M4.mul(UP,M):M]);
  put('base',M4.id());const poseM={};
  for(const p of spec.parts){const v=ps[p.id];if(!v)continue;const list=Array.isArray(v[0])?v:[v];const z=zl(p.layer||0)+(p.dz||0);
    poseM[p.id]=[];for(const pv of list){const Mx=pv.length===16?pv:place(pv[0],pv[1],pv[2],z+(pv[3]||0));poseM[p.id].push(Mx);put(p.id,Mx);}}
  for(const c of spec._caps){if(c.ground){put('cap',place(c.x,c.y,0,c.z));continue;}const Ms=poseM[c.part];if(!Ms)continue;for(const Mp of Ms){const pt=M4.apply(Mp,[c.local[0]*S,-c.local[1]*S,0]);put('cap',M4.T(pt[0],pt[1],c.z));}}
  if(spec.up)for(const x of [pl.x0*S+14,pl.x1*S-20])inst.push(['stand',[0,1,0,0, 0,0,1,0, 1,0,0,0, x,0,0,1]]);
  const belts=[];for(const r of (spec.ropes?spec.ropes(g,R&&R.sim):[])){const z=r.z??(zl(r.layer||0)+TH/2);belts.push({pts:r.pts.map(p=>{const q=[p[0]*S,-p[1]*S,(p[2]!==undefined?p[2]:z)];return UP?M4.apply(UP,q):q;}),r:r.r||1.2,closed:!!r.closed,travel:r.travel});}
  let read='';try{read=spec.read?spec.read(g,R.sim):(R?`${R.sim.outLabel||'output'}: ${(+R.sim.output()).toFixed(2)}`:'');}catch(e){}
  return{inst,belts,read};}
return{def,Sh,zl,place,mm,get S(){return S;},TH,GAP,BT,PINR,BORER,CAPR,ext,runner,gearOutline};
})();
window.PK=PK;
