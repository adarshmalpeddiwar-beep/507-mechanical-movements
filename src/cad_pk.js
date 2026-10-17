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
    if(!mesh)mesh=ext(typeof p.shape==='function'?p.shape(Sh):p.shape,0,th);
    {for(const q of p.pins||[]){const top=zl(q[2])-zl(p.layer||0)+TH+GAP+CAPH;const [x,y]=mm(q);mesh=merge(mesh,cyl(PINR,th,top,28,x,y));caps.push({part:p.id,local:q,z:zl(q[2])+TH+GAP});}
      for(const b of p.bosses||[]){const [x,y]=mm(b);mesh=merge(mesh,cyl(b[3]||BOSSR,th,th+b[2],28,x,y));}}
    const q=Object.assign({},p,{mesh,role:p.role||'link'});delete q.shape;parts.push(q);spec._parts[p.id]=p;}
  /* base plate: from swept extents of every part */
  const lo=[1e9,1e9],hi=[-1e9,-1e9];
  for(let i=0;i<24&&R;i++){const g=R.at(i/24*TAU*(spec.cycle||1));const ps=spec.pose(g,R.sim,i/24*TAU);for(const p of spec.parts){if(p.noPlate)continue;const v=ps[p.id];if(!v)continue;const list=(Array.isArray(v[0])?v:[v]);
      for(const pv of list){if(pv.length===16)continue;let sh=p._bbShape||(p._bbShape=(p.shape?(typeof p.shape==='function'?p.shape(Sh):p.shape):(p.mesh?(()=>{const b=K.bbox(p.mesh);return{o:[[b.lo[0]/S,-b.lo[1]/S],[b.hi[0]/S,-b.lo[1]/S],[b.hi[0]/S,-b.hi[1]/S],[b.lo[0]/S,-b.hi[1]/S]]};})():null)));if(!sh)continue;const c=Math.cos(pv[2]||0),s=Math.sin(pv[2]||0);
        bboxPts(sh.o.filter((_,k)=>sh.o.length<12||k%3===0).map(([x,y])=>[pv[0]+x*c-y*s,pv[1]+x*s+y*c]),lo,hi);}}}
  if(R)R.at(0);
  for(const gp of spec.ground||[])bboxPts([[gp[0]-12,gp[1]-12],[gp[0]+12,gp[1]+12]],lo,hi);
  for(const f of spec.fixed||[])bboxPts((typeof f.shape==='function'?f.shape(Sh):f.shape).o,lo,hi);
  const M=(spec.margin??10)/S;let pl=spec.plate||{x0:lo[0]-M,y0:lo[1]-M,x1:hi[0]+M,y1:hi[1]+M};spec._plate=pl;
  const pw=(pl.x1-pl.x0)*S,ph=(pl.y1-pl.y0)*S;
  const base=[prism(K.rrect(pw,ph,6,6,(pl.x0+pl.x1)/2*S,-(pl.y0+pl.y1)/2*S),[],0,BT)];
  for(const gp of spec.ground||[]){const [x,y]=mm(gp);const zb=zl(gp[2])-GAP;if(zb>BT+0.01)base.push(cyl(BOSSR,BT,zb,28,x,y));if(gp[4]===false){base.push(cyl(PINR,zb,zl(gp[3])+TH,28,x,y));}else{base.push(cyl(PINR,zb,zl(gp[3])+TH+GAP+CAPH,28,x,y));caps.push({ground:true,x:gp[0],y:gp[1],z:zl(gp[3])+TH+GAP});}}
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
/* ready-made meshes (mm, own frame, z up from 0) */
const Mesh={
  /* grooved pulley for cord: radius at the cord centre R (mm), height H */
  pulley(R,H=7,o={}){const rb=o.bore??BORER,Ro=R+1.6,g=R-1.2,h=H;const prof=[[rb,0],[Ro,0],[Ro,h/2-2.2],[g,h/2-0.7],[g,h/2+0.7],[Ro,h/2+2.2],[Ro,h],[rb,h]];const m=[lathe(prof,72)];
    if(o.spokes!==false&&R>9){/* raised spoke ribs on top for a visible turning cue */for(let i=0;i<3;i++){const a=i*TAU/3;m.push(xfz(box(Math.max(2,g-rb-3),1.6,h,h+1),(g+rb)/2,0,a));}}return merge(...m);},
  /* stepped (multi-groove) pulley: radii bottom→top */
  stepped(Rs,H=6){const rb=BORER,prof=[[rb,0]];let z=0;for(const R of Rs){const Ro=R+1.6,g=R-1.2;prof.push([Ro,z],[Ro,z+H/2-2],[g,z+H/2-0.6],[g,z+H/2+0.6],[Ro,z+H/2+2],[Ro,z+H]);z+=H;}prof.push([rb,z]);return lathe(prof,72);},
  box(w,d,h,cx=0,cy=0){return box(w,d,0,h,cx,cy);},
  cylZ(r,h,n=40){return cyl(r,0,h,n);}
};
function xfz(m,x,y,a){return K.xf(m,M4.mul(M4.Rz(a),M4.T(x,y,0)));}
return{def,Sh,Mesh,zl,place,mm,get S(){return S;},_S(v){if(v!==undefined)S=v;return S;},TH,GAP,BT,PINR,BORER,CAPR,ext,runner,gearOutline};
})();
window.PK=PK;
/* ===== 3D layouts: models whose simulation already works in 3D world coordinates (px, z up), e.g. belts between shafts at right angles.
   items: pulleys [{K (circ3), w, ang(phi), role}], belt points. Supports are generated: posts for upright axles, standing brackets for level ones. */
PK.def3=function(n,spec){const MODELS=window.CAD.MODELS;const PI=Math.PI;const {M4,merge,cyl,box,tubeSolid,prism}=K;
  const S=spec.S||0.3,PH=7,G=0.5,PINR=2,CAPR=4.2,CAPH=3;
  MODELS[n]={summary:spec.summary,cam:spec.cam,hardware:spec.hardware||[],steps:spec.steps,
    parts(){const R=PK.runner(n);this._R=R;R.at(0);const sim=R.sim,geo=spec.geo(sim);this._geo=geo;
      let zmin=1e9;for(const b of geo.pulleys){zmin=Math.min(zmin,b.K.c[2]-b.K.r*Math.hypot(b.K.n[0],b.K.n[1]));}
      const zoff=-zmin*S+(spec.lift??12);this._z=zoff;const W=p=>[p[0]*S,p[1]*S,p[2]*S+zoff];
      const out=[],base=[];let lo=[1e9,1e9],hi=[-1e9,-1e9];const ext=(x,y,r)=>{lo=[Math.min(lo[0],x-r),Math.min(lo[1],y-r)];hi=[Math.max(hi[0],x+r),Math.max(hi[1],y+r)];};
      this._sup=[];
      geo.pulleys.forEach((b,i)=>{const c=W(b.K.c),r=b.K.r*S,nz=Math.abs(b.K.n[2]);ext(c[0],c[1],r+6);
        out.push({id:'p'+i,name:b.name||(i===0?'Driving pulley':'Driven pulley'),role:b.role||(i===0?'driver':(b.guide?'link':'driven')),mesh:PK.Mesh.pulley(r,PH)});
        if(nz>0.9){/* upright axle: boss + pin from the base */const zb=c[2]-PH/2-G;base.push(cyl(5,4,zb,32,c[0],c[1]),cyl(PINR,zb,c[2]+PH/2+G+CAPH,24,c[0],c[1]));this._sup.push({cap:[c[0],c[1],c[2]+PH/2+G]});}
        else{/* level axle: a bracket plate behind the pulley, printed flat, glued upright onto the base */const nn=b.K.n;const cz=c[2]-4;
          const h=cz+12,w=Math.max(24,2*r*0.6);const plate=merge(box(w,h,0,3,0,h/2),cyl(5,3,3+G,24,0,cz),cyl(PINR,3,3+G+PH+G+CAPH,24,0,cz));
          out.push({id:'br'+i,name:'Bracket',role:'frame',mesh:plate,note:'glue upright on the base, pin toward the pulley'});
          const back=[c[0]-nn[0]*(PH/2+3+G),c[1]-nn[1]*(PH/2+3+G)];this._sup.push({br:'br'+i,c,n:nn});
          ext(back[0],back[1],w/2+4);}});
      const m=8;const pw=hi[0]-lo[0]+2*m,ph=hi[1]-lo[1]+2*m;base.unshift(prism(K.rrect(pw,ph,6,6,(lo[0]+hi[0])/2,(lo[1]+hi[1])/2),[],0,4));
      out.unshift({id:'base',name:'Base plate',role:'frame',mesh:merge(...base)});
      out.push({id:'cap',name:'Pin cap',role:'small',qty:geo.pulleys.length,mesh:tubeSolid(CAPR,1.95,0,CAPH,32)});
      if(spec.belt!==false){let L=0;const bp=geo.belt;for(let i=1;i<bp.length;i++)L+=Math.hypot(bp[i][0]-bp[i-1][0],bp[i][1]-bp[i-1][1],bp[i][2]-bp[i-1][2]);this._L=L*S;}
      return out;},
    pose(phi){const R=this._R,geo=this._geo;R.at(phi);const W=p=>[p[0]*S,p[1]*S,p[2]*S+this._z];const inst=[['base',M4.id()]];
      geo.pulleys.forEach((b,i)=>{const c=W(b.K.c);const o=[c[0]-b.K.n[0]*PH/2,c[1]-b.K.n[1]*PH/2,c[2]-b.K.n[2]*PH/2];inst.push(['p'+i,M4.mul(M4.frame(o,b.K.n,b.K.u),M4.Rz(b.ang(phi)))]);});
      for(const s of this._sup){if(s.br){const nn=[s.n[0],s.n[1],0],up=[0,0,1],xx=[up[1]*nn[2]-up[2]*nn[1],up[2]*nn[0]-up[0]*nn[2],up[0]*nn[1]-up[1]*nn[0]];
          const bk=[s.c[0]-nn[0]*(PH/2+3+G),s.c[1]-nn[1]*(PH/2+3+G),4];
          inst.push([s.br,[xx[0],xx[1],xx[2],0, up[0],up[1],up[2],0, nn[0],nn[1],nn[2],0, bk[0],bk[1],bk[2],1]]);
          inst.push(['cap',M4.frame([s.c[0]+nn[0]*(PH/2+G),s.c[1]+nn[1]*(PH/2+G),s.c[2]],nn)]);}
        else inst.push(['cap',M4.T(s.cap[0],s.cap[1],s.cap[2])]);}
      return{inst,belts:[{pts:geo.belt.map(W),r:1.6,closed:true,travel:phi*(geo.A?geo.A.r*S:0)}],read:spec.read?spec.read(phi):`driver ${Math.round(phi*180/PI)%360}°`};},
    get _belt(){return this._L;}};};
/* ===== spatial kit: models whose parts move in 3D (bevels, worms, shafts in bearings). Everything in mm, z up, base top at z=BT.
   Part meshes are modelled in print orientation (flat face down from z=0); pose() returns a 16-number matrix per part. ===== */
K.loftS=function(secs){const m={t:[]},tri=(a,b,c)=>m.t.push(a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2]);const ar=p=>{let s=0;for(let i=0,n=p.length;i<n;i++){const a=p[i],b=p[(i+1)%n];s+=a[0]*b[1]-b[0]*a[1];}return s/2;};
  const rev=ar(secs[0].o)<0,O=secs.map(s=>rev?s.o.slice().reverse():s.o);
  const H=(secs[0].h||[]).map((h0,j)=>{const r=ar(h0)>0;return secs.map(s=>r?s.h[j].slice().reverse():s.h[j]);});
  const key=p=>p[0].toFixed(5)+','+p[1].toFixed(5);
  const cap=(oo,hh,top)=>{const map=new Map();for(const p of oo)map.set(key(p),p);for(const h of hh)for(const p of h)map.set(key(p),p);const T=K.triangulate(oo.map(p=>[p[0],p[1]]),hh.map(h=>h.map(p=>[p[0],p[1]])));
    for(const [a,b,c] of T.tris){const P=[T.pts[a],T.pts[b],T.pts[c]].map(q=>map.get(key(q)));if(P.some(x=>!x))continue;if(top)tri(P[0],P[1],P[2]);else tri(P[0],P[2],P[1]);}};
  const N=secs.length;cap(O[0],H.map(h=>h[0]),false);cap(O[N-1],H.map(h=>h[N-1]),true);
  for(const L of [O,...H])for(let k=0;k<N-1;k++){const A=L[k],B=L[k+1],n=A.length;for(let i=0;i<n;i++){const j=(i+1)%n;tri(A[i],A[j],B[j]);tri(A[i],B[j],B[i]);}}
  if(K.volume(m)<0)K.flip(m);return m;};
PK.U=(()=>{const {M4,prism,cyl,merge,circle,box}=K,PI=Math.PI,TAU=2*PI,BT=PK.BT;
  const SH=2.1,SHB=2.35;/* octagonal shaft (circumradius) and round bearing hole */
  const octa=(r,a0=PI/8)=>circle(r,8,0,0,a0);
  const gearO=(R,Z,o={})=>{const s0=PK._S();PK._S(1);const p=PK.gearOutline(R,Z,o);PK._S(s0);return p;};
  const U={SH,SHB,BT,octa,
    /* spur gear, octagonal bore so it keys onto a shaft (bore:'round' to turn freely) */
    spur(R,Z,h,o={}){const hs=[o.bore==='round'?circle(SHB,32):octa(o.bore||SH+0.12)];if(o.holes)for(const q of o.holes)hs.push(circle(q[2],24,q[0],q[1]));return prism(gearO(R,Z,o),hs,0,h);},
    helical(R,Z,h,twist,o={}){const base=gearO(R,Z,o),n=o.seg||8,secs=[];for(let k=0;k<=n;k++){const t=k/n,a=o.herring?(t<0.5?t:1-t)*twist:t*twist,c=Math.cos(a),s=Math.sin(a);secs.push({o:base.map(p=>[p[0]*c-p[1]*s,p[0]*s+p[1]*c,t*h]),h:[(o.bore==='round'?circle(SHB,32):octa(SH+0.12)).map(p=>[p[0],p[1],t*h])]});}return K.loftS(secs);},
    /* bevel gear printed back face down: outer pitch radius Rp, pitch-cone half angle d, face width f; teeth shrink toward the apex above */
    bevel(Rp,Z,d,f,o={}){let base=gearO(Rp,Z,o);if(o.seg){const m=2*Rp/Z,rr=Rp-1.25*m;base=base.map(p=>{const t=((Math.atan2(p[1],p[0])-o.seg[0])%TAU+TAU)%TAU;if(t<o.seg[1])return p;const r=Math.min(Math.hypot(p[0],p[1]),rr),q=Math.atan2(p[1],p[0]);return[r*Math.cos(q),r*Math.sin(q)];});}const Hx=Rp/Math.tan(d),zt=f*Math.cos(d),n=4,secs=[];const hole=o.bore==='round'?circle(SHB,32):octa(SH+0.12),xh=(o.holes||[]).map(q=>circle(q[2],20,q[0],q[1]));
      for(let k=0;k<=n;k++){const z=zt*k/n,s=(Hx-z)/Hx;secs.push({o:base.map(p=>[p[0]*s,p[1]*s,z]),h:[hole,...xh].map(h=>h.map(p=>[p[0],p[1],z]))});}
      let m=K.loftS(secs);const hub=o.hub??0;if(hub>0)m=merge(m,prism(circle(hub,40),[hole],zt,zt+(o.hubH??4)));return m;},
    /* worm: pitch radius rp, axial pitch p (single start), length L, printed standing */
    worm(rp,p,L,o={}){const m=o.depth?o.depth:p/PI,ad=m,de=1.2*m,n=64,secs=[],dz=p/16;const prof=u=>{u=((u%p)+p)%p/p;const x=Math.abs(u-0.5);return x<0.15?-de:x>0.35?ad:-de+(ad+de)*(x-0.15)/0.2;};
      for(let z=0;z<=L+1e-9;z+=dz){const ring=[];for(let i=0;i<n;i++){const t=i/n*TAU,r=rp+prof(z-p*t/TAU);ring.push([r*Math.cos(t),r*Math.sin(t),z]);}secs.push({o:ring,h:[octa(SH+0.12).map(q=>[q[0],q[1],z])]});}return K.loftS(secs);},
    /* straight rack along x, pitch line at y=0, teeth up (+y), printed flat */
    /* nut block w×h (×L long, along z) with an internal thread matching worm(rp,p) */
    nut(rp,p,L,w,h,o={}){const m=o.depth?o.depth:p/PI,ad=m,de=1.2*m,n=64,secs=[],dz=p/16;const prof=u=>{u=((u%p)+p)%p/p;const x=Math.abs(u-0.5);return x<0.15?-de:x>0.35?ad:-de+(ad+de)*(x-0.15)/0.2;};const box=[[-w/2,-h/2],[w/2,-h/2],[w/2,h/2],[-w/2,h/2]];
      for(let z=0;z<=L+1e-9;z+=dz){const ring=[];for(let i=0;i<n;i++){const t=i/n*TAU,r=rp+prof(z-p*t/TAU)+0.35+0.0*i;ring.push([r*Math.cos(t),r*Math.sin(t),z]);}secs.push({o:box.map(q=>[q[0],q[1],z]),h:[ring]});}return K.loftS(secs);},
    rack(L,m,depth,h,c0=0){const s=PK._S();PK._S(1);const sh=PK.Sh.rack(-L/2,L/2,m,depth,{c0});PK._S(s);return prism(sh.o.map(p=>[p[0],-p[1]]),[],0,h);},
    shaft(L,r=SH){/* lying along x, centred, printed flat on a facet */return K.xf(prism(octa(r),[],-L/2,L/2),M4.mul(M4.T(0,0,r*Math.cos(PI/8)),M4.Ry(PI/2)));},
    /* pose helpers: a part modelled around the z axis, placed with its z axis along n at o, turned by a */
    at(o,n,a=0,u){return M4.mul(M4.frame(o,n,u),M4.Rz(a));},
    shaftAt(c,dir,a=0){/* shaft mesh (along x, centre at z=r) placed at centre c along dir, turned by a */const r=SH*Math.cos(PI/8);return M4.mul(M4.frame(c,dir,undefined),M4.mul(M4.Rz(a),M4.mul(M4.Ry(-PI/2),M4.T(0,0,-r))));},
    plate(x0,y0,x1,y1){return prism(K.rrect(x1-x0,y1-y0,6,6,(x0+x1)/2,(y0+y1)/2),[],0,BT);},
    /* upright bearing wall: centre (cx,cy) on the base, the shaft runs along 'x' or 'y'; holes [[offset across, height z, r]] */
    wall(cx,cy,ax,holes,w=18,t=5,top){const zt=top??Math.max(...holes.map(h=>h[1]))+8;const o=[[-w/2,0],[w/2,0],[w/2,zt],[-w/2,zt]];const hs=holes.map(h=>circle(h[2]||SHB,32,h[0],h[1]));
      const m=prism(o,hs,-t/2,t/2);/* local x across, y up, z along the shaft */const th=ax==='x'?0:ax==='y'?PI/2:ax,c=Math.cos(th),s=Math.sin(th);return K.xf(m,[-s,c,0,0, 0,0,1,0, c,s,0,0, cx,cy,0,1]);},
    /* hand crank printed flat: octagonal hole at the hub, knob at radius r */
    crank(r=14,h=4){const arm=prism(K.hull([...circle(5,24),...circle(4.5,24,r,0)]),[octa(SH+0.12)],0,h);return merge(arm,cyl(2.6,h,h+12,20,r,0));},
    post(x,y,zTop,zBoss){const m=[cyl(PK.PINR,BT,zTop,28,x,y)];if(zBoss>BT)m.push(cyl(4.6,BT,zBoss,28,x,y));return merge(...m);},
    capMesh(){return K.tubeSolid(4.2,1.95,0,3,32);},
    /* a part modelled in assembly coordinates, laid down for printing by matrix Rp (rotation); returns {mesh, inv} so pose = W·inv */
    printed(m,Rp){let q=K.xf(m,Rp);const b=K.bbox(q);const T=M4.T(-(b.lo[0]+b.hi[0])/2,-(b.lo[1]+b.hi[1])/2,-b.lo[2]);q=K.xf(q,T);
      const RT=[Rp[0],Rp[4],Rp[8],0, Rp[1],Rp[5],Rp[9],0, Rp[2],Rp[6],Rp[10],0, 0,0,0,1];return{mesh:q,inv:M4.mul(RT,M4.T(-T[12],-T[13],-T[14]))};},
    knob(r=4,h=10){return cyl(r,0,h,24);},
    collar(r=6,h=4){return prism(circle(r,32),[octa(SH+0.12)],0,h);}};
  return U;})();
/* defS: spatial model. spec: {summary, parts:[{id,name,role,mesh,qty,note}], base:()=>[meshes], pose(phi,R)->{id:M|[M..]}, read(phi,R), steps, hardware, cam} */
PK.defS=function(n,spec){const MODELS=window.CAD.MODELS;MODELS[n]={summary:spec.summary,cam:spec.cam,get hardware(){return spec.hardware||[];},get steps(){return spec.steps||['Print every part as shown in Print layout; none needs supports.','Push the shafts through the bearing holes and slide the gears onto them in the order shown.',spec.drive||'Turn the orange part by hand.'];},params:spec.params,
  parts(P){this._P=Object.assign({},spec.P||{},P||{});this._R=spec.sim===false?null:PK.runner(spec.sim||n,this._P);const out=[{id:'base',name:spec.baseName||'Base with bearings',role:'frame',mesh:K.merge(...spec.base(this._P)),note:spec.baseNote||'bearing walls print standing; no supports needed'}];
    for(const p of spec.parts)out.push(Object.assign({role:'link'},p));return out;},
  pose(phi){const g=this._R?this._R.at(phi):{phi};const ps=spec.pose(phi,g,this._R&&this._R.sim,this._P||{});const inst=[['base',K.M4.id()]];for(const id in ps){const v=ps[id];if(!v)continue;if(v.length===16&&typeof v[0]==='number')inst.push([id,v]);else for(const M of v)inst.push([id,M]);}
    let read='';try{read=spec.read?spec.read(phi,g):'';}catch(e){}return{inst,belts:spec.belts?spec.belts(phi,g):[],read};}};};
/* ===== shared model builders used by several chunks ===== */
PK.Lib=(()=>{const Sh=PK.Sh,PI=Math.PI,TAU=2*PI;
  const pxPoly=(pts,holes=[[0,0]])=>({o:pts,h:holes.map(h=>Sh.hole(h[0],h[1],h[2]))});
  function offsetLoop(pts,d){const n=pts.length,o=[];let A=0;for(let i=0;i<n;i++){const a=pts[i],b=pts[(i+1)%n];A+=a[0]*b[1]-b[0]*a[1];}const s=A>0?1:-1;for(let i=0;i<n;i++){const p=pts[(i-1+n)%n],q=pts[(i+1)%n],t=[q[0]-p[0],q[1]-p[1]],l=Math.hypot(t[0],t[1])||1;o.push([pts[i][0]+s*t[1]/l*d,pts[i][1]-s*t[0]/l*d]);}return o;}
  function pip(pt,poly){let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>pt[1])!==(b[1]>pt[1])&&pt[0]<(b[0]-a[0])*(pt[1]-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;}
  function groovedPlate(outline,center,w,holes=[[0,0]]){const out=offsetLoop(center,w/2),inn=offsetLoop(center,-w/2),area=q=>{let a=0;for(let i=0;i<q.length;i++){const u=q[i],v=q[(i+1)%q.length];a+=u[0]*v[1]-v[0]*u[1];}return Math.abs(a);};const big=area(out)>area(inn)?out:inn,small=big===out?inn:out;
    const hin=holes.filter(h=>pip(h,small)),hout=holes.filter(h=>!pip(h,big)),H=hs=>hs.map(h=>Sh.hole(h[0],h[1],h[2]));return K.merge(PK.ext({o:outline,h:H(holes)},0,2.2),PK.ext({o:outline,h:[...H(hout),big]},2.2,PK.TH),PK.ext({o:small,h:H(hin)},2.2,PK.TH));}
  /* camFlat simulations: cam + flat-foot follower or yoke */
  function camFlatModel(n,summary){const sim=window.MB.SIMS[n];if(!sim||!sim.shape)return;const sh=sim.shape(),O=[330,300];const yoke=/Yoke|Valve/.test(sim.outLabel||'');
    const parts=[{id:'c',name:'Cam',role:'driver',layer:0,shape:pxPoly(sh),bosses:[[sh[0][0]*0.4,sh[0][1]*0.4,12,3.5]]}];
    if(yoke){let ext=0;for(let i=0;i<72;i++){const a=i/72*TAU;let mx=-1e9,mn=1e9;for(const [x,y] of sh){const X=x*Math.cos(a)-y*Math.sin(a);mx=Math.max(mx,X);mn=Math.min(mn,X);}ext=Math.max(ext,mx-mn);}
      const W=ext,Hh=Math.max(...sh.map(p=>Math.hypot(p[0],p[1])))+14;parts.push({id:'y',name:'Yoke with rods',role:'driven',layer:0,shape:S=>({o:[[-16,-Hh-16],[W+16,-Hh-16],[W+16,-16],[W+260,-16],[W+260,16],[W+16,16],[W+16,Hh+16],[-16,Hh+16],[-16,16],[-200,16],[-200,-16],[-16,-16]],h:[[[0,-Hh],[W,-Hh],[W,Hh],[0,Hh]]]})});
      PK.def(n,{S:0.3,summary,parts,ground:[[O[0],O[1],0,0]],fixed:[[-200,-24],[-200,24],[W+200,-24],[W+200,24]].map(([dx,dy])=>({shape:S=>S.rect(70,8,O[0]+dx,O[1]+dy),l1:0})),pose(g){return{c:[O[0],O[1],g.a],y:[O[0]+g.hxn,O[1],0]};},drive:'Turn the cam by its knob.'});}
    else{parts.push({id:'f',name:'Flat-foot follower rod',role:'driven',layer:0,shape:S=>({o:[[-60,0],[60,0],[60,-16],[8,-16],[8,-190],[-8,-190],[-8,-16],[-60,-16]],h:[]})});
      PK.def(n,{S:0.3,summary,parts,ground:[[O[0],O[1],0,0]],fixed:[{shape:S=>S.rect(10,40,O[0]-25,150),l1:0},{shape:S=>S.rect(10,40,O[0]+25,150),l1:0}],pose(g){return{c:[O[0],O[1],g.a],f:[O[0],O[1]-g.hy,0]};},drive:'Turn the cam by its knob; the follower rises and falls back.'});}}
  /* link() simulations: every bar, slotted bar, block and wheel becomes a printed part; joints get printed pins on the lowest part */
  function linkModel(n,summary,opt={}){const sim=window.MB.SIMS[n];if(!sim||!sim.lo)return;const o=sim.lo,R=PK.runner(n);const P0=R.at(0.3).P;R.at(0);
    const items=[];let L=0;const touch={};const add=(pt,layer,id,isRun)=>{(touch[pt]=touch[pt]||[]).push({layer,id,isRun});};
    if(o.wheel){const [c,r]=o.wheel;items.push({kind:'wheel',id:'w',c,r,layer:L});add(c,L,'w');L++;}
    for(const [i,b] of (o.bars||[]).entries()){const len=Math.hypot(P0[b[1]][0]-P0[b[0]][0],P0[b[1]][1]-P0[b[0]][1]);if(len<4)continue;items.push({kind:'bar',id:'b'+i,a:b[0],b:b[1],w:b[2]||10,len,layer:L});add(b[0],L,'b'+i);add(b[1],L,'b'+i);L++;}
    for(const [i,s] of (o.slots||[]).entries()){items.push({kind:'slot',id:'s'+i,a:s[0],b:s[1],len:s[2],st:s[3]||30,layer:L});add(s[0],L,'s'+i);add(s[1],L,'s'+i,true);L++;}
    for(const [i,bl] of (o.blocks||[]).entries()){items.push({kind:'block',id:'k'+i,p:bl[0],w:bl[1],h:bl[2],layer:L});add(bl[0],L,'k'+i);L++;}
    const fixedIds=Object.keys(o.fix||{}),pins={},ground=[];
    for(const pt in touch){const T=touch[pt].sort((a,b)=>a.layer-b.layer),top=T[T.length-1].layer;if(fixedIds.includes(pt)){const lo=T[0].layer;ground.push([o.fix[pt][0],o.fix[pt][1],lo,top]);continue;}
      if(T.length<2)continue;const owner=T.find(t=>!t.isRun)||T[0];if(owner.layer===top&&T.length>1){/* owner must be below: use the lowest */}const own=T[0].isRun?T.find(t=>!t.isRun):T[0];if(!own)continue;(pins[own.id]=pins[own.id]||[]).push({pt,top});}
    const parts=[];for(const it of items){let shape,role='link',pinsL=[];
      if(it.kind==='wheel'){shape=S=>({o:S.circle(it.r,96),h:[S.hole(0,0),...[0,1,2,3,4].map(k=>S.circle(it.r*0.24,24,it.r*0.58*Math.cos(k*TAU/5+0.6),it.r*0.58*Math.sin(k*TAU/5+0.6)))]});role='driver';}
      else if(it.kind==='bar')shape=S=>S.bar(it.len,Math.max(it.w,12));
      else if(it.kind==='slot')shape=S=>({o:K.hull([...S.circle(13,24,0,0),...S.circle(13,24,it.len,0)]),h:[S.hole(0,0),S.slotPts(it.st,0,it.len-14,0,(PK.BORER*2+0.6)/PK.S)]});
      else shape=S=>S.rect(it.w,it.h,0,0,[[0,0]]);
      for(const pn of pins[it.id]||[]){let lx=0,ly=0;if(it.kind==='bar'||it.kind==='slot'){if(pn.pt===it.b){lx=it.len;}}else if(it.kind==='wheel'){const c=P0[it.c],q=P0[pn.pt];lx=Math.hypot(q[0]-c[0],q[1]-c[1]);}pinsL.push([lx,ly,pn.top]);}
      if(it.kind==='wheel'){/* pins on the wheel: placed at their angle at phi=0.3 */const c=P0[it.c];pinsL=(pins[it.id]||[]).map(pn=>{const q=P0[pn.pt],a=Math.atan2(q[1]-c[1],q[0]-c[0])-0.3*(o.speed||1);const r=Math.hypot(q[0]-c[0],q[1]-c[1]);return[r*Math.cos(a),r*Math.sin(a),pn.top];});}
      parts.push({id:it.id,name:it.kind==='wheel'?'Flywheel / crank disk':it.kind==='bar'?`Link ${it.a}–${it.b}`:it.kind==='slot'?`Slotted lever ${it.a}`:`Slide block ${it.p}`,role,layer:it.layer,shape,pins:pinsL,bosses:it.kind==='wheel'?[[-it.r*0.8,0,14,3.5]]:undefined});}
    if(!o.wheel&&parts.length){parts[0].role='driver';}
    const fixed=(o.guides||[]).map(gd=>({shape:S=>S.rect(gd[2],gd[3],gd[0]+gd[2]/2,gd[1]+gd[3]/2),l1:Math.max(0,L-1)}));
    PK.def(n,{S:opt.S||0.3,summary,parts,ground,fixed,cycle:opt.cycle,
      pose(g){const P=g.P,out={};for(const it of items){if(it.kind==='wheel')out[it.id]=[P[it.c][0],P[it.c][1],g.phi*(o.speed||1)];else if(it.kind==='block')out[it.id]=[P[it.p][0],P[it.p][1],0];else out[it.id]=[P[it.a][0],P[it.a][1],Math.atan2(P[it.b][1]-P[it.a][1],P[it.b][0]-P[it.a][0])];}return out;},
      drive:opt.drive||'Turn the driving crank by its knob and follow the links.'});}
  /* groove-cam with swinging lever (grooveLever sims): disk with a blind groove, lever above with a peg down into it */
  function grooveLeverModel(n,summary){const sim=window.MB.SIMS[n];if(!sim||!sim.o||!sim.o.r)return;const o=sim.o,O=[300,290],F=sim.F,Lv=sim.L,S0=0.3;PK._S(S0);
    const cen=[];for(let i=0;i<240;i++){const t=i/240*TAU,r=o.r(t);cen.push([r*Math.cos(t),r*Math.sin(t)]);}const Rmax=Math.max(...cen.map(p=>Math.hypot(p[0],p[1])))+22;
    const disk=groovedPlate(K.circle(Rmax,120),cen,(PK.PINR*2+0.8)/S0);const T=PK.TH,G=PK.GAP;
    const lever=K.merge(PK.ext({o:K.hull([...K.circle(14,24),...K.circle(10,24,Lv,0)]),h:[Sh.hole(0,0)]},0,T),K.cyl(PK.PINR-0.15,-(T+G)+2.5,0,20,Lv*S0,0));
    PK.def(n,{S:S0,summary,parts:[{id:'d',name:'Grooved disk',role:'driver',layer:0,mesh:disk,bosses:[]},{id:'l',name:'Lever with peg',role:'driven',layer:1,mesh:lever}],
      ground:[[O[0],O[1],0,0],[F[0],F[1],1,1]],pose(g){return{d:[O[0],O[1],g.phi],l:[F[0],F[1],g.ang]};},drive:'Turn the disk: the peg follows the groove and swings the lever.'});}
  /* crank and slide (crankSlide sims): crank disk, connecting rod or slotted yoke, guided slide */
  function crankSlideModel(n,summary){const sim=window.MB.SIMS[n];if(!sim)return;const R=PK.runner(n);if(!R)return;const g0=R.at(0),O=sim.O,r=g0.r,Lr=g0.L,y=O[1],yoke=/yoke|slotx/.test(sim._kind||'')||Math.abs((R.at(1).x-R.at(1).pin[0])-Lr*0.5)<1;R.at(0);
    const parts=[{id:'c',name:'Crank disk',role:'driver',layer:0,shape:Sh.disk(r+30,[[0,0]],72),pins:[[r,0,1]]}],fixed=[];
    if(yoke){parts.push({id:'y',name:'Slotted yoke with rod',role:'driven',layer:1,shape:{o:[[-16,-r-30],[16,-r-30],[16,-12],[330,-12],[330,12],[16,12],[16,r+30],[-16,r+30]],h:[Sh.slotPts(0,-r-8,0,r+8,(PK.PINR*2+0.6)/PK.S)]}});
      fixed.push({shape:S=>S.rect(240,8,O[0]+Lr*0.5+200,y-22),l1:1},{shape:S=>S.rect(240,8,O[0]+Lr*0.5+200,y+22),l1:1});}
    else if(sim._kind==='roller'){const rr=10;parts[0].pins=[[r,0,1]];parts.push({id:'rod',name:'Connecting rod',role:'link',layer:1,shape:Sh.bar(Lr,14)},{id:'s',name:'Crosshead with roller pins',role:'driven',layer:1,shape:{o:[[-30,-26],[30,-26],[30,-10],[300,-10],[300,10],[30,10],[30,26],[-30,26]],h:[Sh.hole(0,0)]},pins:[[-16,-18,2],[16,-18,2],[-16,18,2],[16,18,2]]},
        {id:'ro',name:'Guide roller',role:'small',qty:4,layer:2,shape:S=>S.disk(rr,[[0,0]],32)});
      fixed.push({shape:S=>S.rect(300,8,O[0]+Lr+150,y-18-rr-4),l1:2},{shape:S=>S.rect(300,8,O[0]+Lr+150,y+18+rr+4),l1:2});}
    else{const fork=sim._kind==='fork';if(fork)parts[0].pins=[[r,0,3]];
      parts.push(fork?{id:'rod',name:'Forked connecting rod (prongs either side of the crosshead)',role:'link',layer:1,t:3,mesh:K.merge(PK.ext(Sh.bar(Lr,14),0,PK.TH),PK.ext(Sh.bar(Lr,14),2*(PK.TH+PK.GAP),3*PK.TH+2*PK.GAP),PK.ext({o:K.circle(7.5/PK.S*0+26,28,0,0).map(([x,y])=>[x,y]),h:[Sh.hole(0,0)]},0,3*PK.TH+2*PK.GAP))}:{id:'rod',name:'Connecting rod',role:'link',layer:1,shape:Sh.bar(Lr,14)},
        {id:'s',name:fork?'Crosshead and piston rod (runs between the prongs)':'Slide (crosshead)',role:'driven',layer:fork?2:1,shape:{o:[[-30,-28],[30,-28],[30,-10],[300,-10],[300,10],[30,10],[30,28],[-30,28]],h:fork?[]:[Sh.hole(0,0)]},pins:fork?[[0,0,3]]:undefined});
      fixed.push({shape:S=>S.rect(300,8,O[0]+Lr+150,y-36),l1:fork?2:1},{shape:S=>S.rect(300,8,O[0]+Lr+150,y+36),l1:fork?2:1});}
    PK.def(n,{S:0.3,summary,parts,fixed,ground:[[O[0],O[1],0,0]],pose(g){const o={c:[O[0],O[1],g.phi]};if(yoke)o.y=[g.x-g.L*0.5,y,0];else{o.rod=[g.pin[0],g.pin[1],Math.atan2(y-g.pin[1],g.x-g.pin[0])];o.s=[g.x,y,0];
        if(sim._kind==='roller'){const a=-(g.x-O[0])/10;o.ro=[[g.x-16,y-18,a],[g.x+16,y-18,a],[g.x-16,y+18,-a],[g.x+16,y+18,-a]];}}return o;},
      drive:'Turn the crank disk by its pin.'});}
  /* flyball governor (gov sims) */
  function govModel(n,summary){const sim=window.MB.SIMS[n];if(!sim)return;const U=PK.U,Lg=(sim.L||120)*0.25,top=U.BT+70;
    PK.defS(n,{summary,cam:{yaw:0.5,pitch:0.25},params:sim.params,base:()=>[U.plate(-30,-30,30,30),U.post(0,0,U.BT+20,U.BT+5)],
      parts:[{id:'sp',name:'Spindle',role:'driver',mesh:K.merge(K.cyl(2.5,0,top-U.BT+8,20),K.box(16,6,top-U.BT-4,top-U.BT+2))},{id:'arm',name:'Ball arm',role:'link',qty:2,mesh:K.merge(K.box(4,4,0,Lg),K.lathe([[0.01,Lg-5],[6,Lg-3],[6,Lg+3],[0.01,Lg+5]],24))},{id:'sl',name:'Sliding sleeve',role:'driven',mesh:K.tubeSolid(6,2.8,0,8,32)}],
      pose(phi,g){const th=g.th||0.5,out={sp:K.M4.mul(K.M4.T(0,0,U.BT+5),K.M4.Rz(phi)),arm:[],sl:K.M4.mul(K.M4.T(0,0,top-Lg*Math.cos(th)-14),K.M4.Rz(phi))};for(const s of [0,PI]){const a=phi+s,d=[Math.sin(th)*Math.cos(a),Math.sin(th)*Math.sin(a),-Math.cos(th)];out.arm.push(U.at([6*Math.cos(a),6*Math.sin(a),top],d,0));}return out;},
      drive:'Spin the spindle (set the speed on the simulation): the balls fly out and lift the sleeve.'});}
  return{pxPoly,offsetLoop,pip,groovedPlate,camFlatModel,linkModel,grooveLeverModel,crankSlideModel,govModel};})();
