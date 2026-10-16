/* ===== 507 Movements · printable models 1–10 ===== */
(()=>{
const {M4,circle,rrect,prism,lathe,cyl,tubeSolid,box,merge,lobes,hull,ring}=K,PI=Math.PI,TAU=2*PI,MODELS=window.CAD.MODELS;
const mod=(a,n)=>((a%n)+n)%n;
/* ---------- standard hardware dimensions (mm) ---------- */
const BASE=5,PIN=3,BORE=3.3,CAPR=6,CAPH=4,CAPB=2.95,GAP=0.3,PH=12,CORD=1.5;
/* a grooved pulley; Rp = radius at the cord centre */
function pulley(Rp,o={}){const H=o.h||PH,rb=BORE,Ro=Rp+2,g=Rp-1.5;let prof;
  if(o.flat)prof=[[rb,0],[Ro,0],[Ro+0.8,H/2],[Ro,H],[rb+3.2,H],[rb+3.2,H+2],[rb,H+2]];
  else prof=[[rb,0],[Ro,0],[Ro,H/2-3],[g,H/2-0.9],[g,H/2+0.9],[Ro,H/2+3],[Ro,H],[rb+3.2,H],[rb+3.2,H+2],[rb,H+2]];
  const parts=[lathe(prof,96)];if(o.dbore){/* D-bore marker: a key on the inside is not printable without CSG, so the key is a flat tab glued in */}
  parts.push(box(Ro-8,3,H,H+1.2,(Ro+8)/2,0));if(o.knob)parts.push(cyl(3.5,H,H+14,32,Ro*0.62,0));return merge(...parts);}
/* stepped pulley: steps bottom-to-top [{Rp,h}] */
function stepped(steps){const rb=BORE;const prof=[[rb,0]];let z=0;for(const s of steps){const Ro=s.Rp+2,g=s.Rp-1.5;prof.push([Ro,z],[Ro,z+s.h/2-2.6],[g,z+s.h/2-0.9],[g,z+s.h/2+0.9],[Ro,z+s.h/2+2.6],[Ro,z+s.h]);z+=s.h;}
  prof.push([rb+3.2,z],[rb+3.2,z+2],[rb,z+2]);const top=steps[steps.length-1];return merge(lathe(prof,96),box(top.Rp-6,3,z,z+1.2,(top.Rp+2+8)/2,0));}
/* cone / shaped cone, radius r(f) for f in 0..1 over height h, with lips */
function cone(rf,h,o={}){const rb=BORE,n=24,prof=[[rb,0],[rf(0)+3,0],[rf(0)+3,2]];for(let i=0;i<=n;i++){const f=i/n;prof.push([rf(f),2+f*(h-4)]);}prof.push([rf(1)+3,h-2],[rf(1)+3,h],[rb+3.2,h],[rb+3.2,h+2],[rb,h+2]);
  const r1=rf(1);const m=[lathe(prof,96),box(r1-6,3,h+0,h+1.2,(r1+8)/2,0)];if(o.knob)m.push(cyl(3.5,h,h+14,32,(r1+3)*0.62,0));return merge(...m);}
const cap=()=>tubeSolid(CAPR,CAPB,0,CAPH,40);
/* z-levels of a pulley sitting on a boss whose top is at zb */
const lv=(zb,h=PH)=>({z0:zb+GAP,belt:zb+GAP+h/2,capZ:zb+GAP+h+2+GAP,pinTop:zb+GAP+h+2+GAP+CAPH});
/* base plate: outline, extra holes, and pins [{x,y,zb,top}] */
function basePlate(outline,holes,pins){const m=[prism(outline,holes||[],0,BASE)];for(const p of pins){if(p.zb>BASE+0.01)m.push(p.tube?tubeSolid(6,BORE,BASE,p.zb,40,p.x,p.y):cyl(6,BASE,p.zb,40,p.x,p.y));if(p.top)m.push(cyl(PIN,p.zb,p.top,32,p.x,p.y));}return merge(...m);}
/* ---------- 2D belt loops: circles [{c:[x,y],r,s}] travelled in order; s=+1 anticlockwise ---------- */
function tangent(A,B){const dx=B.c[0]-A.c[0],dy=B.c[1]-A.c[1],D=Math.hypot(dx,dy),th=Math.atan2(dy,dx),k=(A.r-A.s*B.s*B.r)/D;if(Math.abs(k)>1)return null;
  for(const sg of [1,-1]){const a=th+sg*Math.acos(k);const p1=[A.c[0]+A.r*Math.cos(a),A.c[1]+A.r*Math.sin(a)],dir=[A.s*-Math.sin(a),A.s*Math.cos(a)];const t=(B.c[0]-p1[0])*dir[0]+(B.c[1]-p1[1])*dir[1];if(t>0)return{a1:a,p1,p2:[p1[0]+t*dir[0],p1[1]+t*dir[1]]};}return null;}
function loop2D(cs,step=2.5){const segs=[];for(let i=0;i<cs.length;i++){segs.push(tangent(cs[i],cs[(i+1)%cs.length]));}const pts=[];
  for(let i=0;i<cs.length;i++){const C=cs[i],inn=segs[(i-1+cs.length)%cs.length],out=segs[i];const ain=Math.atan2(inn.p2[1]-C.c[1],inn.p2[0]-C.c[0]),aout=out.a1;let d=C.s>0?mod(aout-ain,TAU):-mod(ain-aout,TAU);const n=Math.max(2,Math.ceil(Math.abs(d)*C.r/step));
    for(let k=0;k<n;k++){const a=ain+d*k/n;pts.push([C.c[0]+C.r*Math.cos(a),C.c[1]+C.r*Math.sin(a),i,'arc']);}
    const L=Math.hypot(out.p2[0]-out.p1[0],out.p2[1]-out.p1[1]),m=Math.max(1,Math.ceil(L/step));for(let k=0;k<m;k++)pts.push([out.p1[0]+(out.p2[0]-out.p1[0])*k/m,out.p1[1]+(out.p2[1]-out.p1[1])*k/m,i,'line']);}
  return pts;}
const lenOf=pts=>{let s=0;for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];s+=Math.hypot(b[0]-a[0],b[1]-a[1],(b[2]||0)-(a[2]||0));}return s;};
const to3=(pts,z)=>pts.map(p=>[p[0],p[1],typeof z==='function'?z(p):z]);
const PZ=(x,y,zb,a)=>M4.mul(M4.T(x,y,lv(zb).z0),M4.Rz(a));
const CAPM=(x,y,zb)=>M4.T(x,y,lv(zb).capZ);
const cordNote=L=>`A 3 mm rubber O-ring cord about ${Math.round(L)} mm long, glued into a loop (or a rubber band of that size). Or print the TPU belt included in the zip.`;
const beltPart=(L,id='belt')=>({id,name:'Belt (optional, TPU)',mat:'TPU',role:'belt',mesh:ring(L*0.96/TAU,CORD,128,12),note:'print in flexible TPU, or use an O-ring cord instead',hidden:true});
const COMMON=['Push each pulley onto its pin, with the ribbed face up.','Press a cap onto each pin top so the pulley turns freely without lifting off.'];

/* ===== 1 · 2 open and crossed belts ===== */
function beltPair(n,crossed){const A=[-45,0],B=[50,0],RA=30,zb=BASE+1;MODELS[n]={
  summary:crossed?'Two grooved pulleys on a base, joined by a band crossed into a figure of eight. Turn the brass pulley by its knob: the blue one turns the opposite way.':'Two grooved pulleys on a base, joined by a band. Turn the brass pulley by its knob: the blue one follows in the same direction, faster because it is smaller.',
  params:[{id:'rb',label:'Driven pulley size',min:16,max:28,step:2,value:crossed?24:18,fmt:v=>`${v*2} mm across the groove`,rebuild:true}],
  loopOf(P){return loop2D(crossed?[{c:A,r:RA,s:1},{c:B,r:P.rb,s:-1}]:[{c:A,r:RA,s:1},{c:B,r:P.rb,s:1}]);},
  parts(P){const L=lenOf(this.loopOf(P));this.L=L;const l=lv(zb);return[
    {id:'base',name:'Base plate',role:'frame',mesh:basePlate(rrect(180,80,8),[],[{x:A[0],y:A[1],zb,top:l.pinTop},{x:B[0],y:B[1],zb,top:l.pinTop}]),note:'pins are printed in place'},
    {id:'pa',name:'Driving pulley',role:'driver',mesh:pulley(RA,{knob:true}),note:'knob up'},
    {id:'pb',name:'Driven pulley',role:'driven',mesh:pulley(P.rb)},
    {id:'cap',name:'Pin cap',qty:2,role:'small',mesh:cap()},beltPart(L)];},
  pose(phi,P){const l=lv(zb),pts=this.loopOf(P);const z=crossed?(p=>l.belt+(p[3]==='line'?(p[2]===0?1.6:-1.6)*Math.sin(PI*Math.min(1,Math.max(0,(p[0]-A[0])/(B[0]-A[0])))):0)):l.belt;
    const b=(crossed?-1:1)*phi*RA/P.rb;return{inst:[['base',M4.id()],['pa',PZ(A[0],A[1],zb,phi)],['pb',PZ(B[0],B[1],zb,b)],['cap',CAPM(A[0],A[1],zb)],['cap',CAPM(B[0],B[1],zb)]],
      belts:[{pts:to3(pts,z),r:CORD,travel:phi*RA}],read:`driver ${Math.round(phi*180/PI)%360}° · driven ${(crossed?'reverse ':'')}${(RA/P.rb).toFixed(2)}× speed`};},
  get hardware(){return[cordNote(this.L||350)];},
  steps:[...COMMON,crossed?'Twist the band once into a figure of eight and stretch it over both grooves.':'Stretch the band over both grooves.','Turn the knob: the band should drive without slipping. If it slips, use a slightly shorter band.']};}
beltPair(1,false);beltPair(2,true);

/* ---------- brackets for pulleys on tilted or horizontal axles ---------- */
/* plate (printed flat, pin up) glued to a wedge (printed on its side) that drops into a slot in the base */
const PLW=36,PLT=4;
function bracket(Gc,n,yw){/* Gc = groove centre, n = axle unit vector (in XZ plane), yw = y of the bracket */
  const l=Math.hypot(...n);n=n.map(v=>v/l);const off=PLT+1+GAP+PH/2;/* plate bottom to groove */const O=[Gc[0]-n[0]*off,Gc[1]-n[1]*off,Gc[2]-n[2]*off];/* plate origin (bottom face centre) */
  const F=M4.frame(O,n,[0,1,0]);const t=[n[2],0,-n[0]];
  const half=PLW/2,b1=[O[0]+t[0]*half,O[2]+t[2]*half],b2=[O[0]-t[0]*half,O[2]-t[2]*half];
  const away=n[0]>=0?-1:1;const xs=[b1[0],b2[0]];const foot=[(away<0?Math.min(...xs):Math.max(...xs))+away*14,0];
  const prof=hull([b1,b2,[b1[0],0],[b2[0],0],foot]);
  const minx=Math.min(...prof.map(p=>p[0])),maxx=Math.max(...prof.map(p=>p[0]));
  return{F,O,n,prof,slot:[[minx-0.3,Gc[1]-half-0.3],[maxx+0.3,Gc[1]-half-0.3],[maxx+0.3,Gc[1]+half+0.3],[minx-0.3,Gc[1]+half+0.3]],
    wedgeMesh:prism(prof,[],0,PLW),wedgeM:[1,0,0,0, 0,0,1,0, 0,1,0,0, 0,Gc[1]-half,0,1],
    pulleyM:a=>M4.chain(F,M4.T(0,0,PLT+1+GAP),M4.Rz(a)),capM:M4.chain(F,M4.T(0,0,PLT+1+GAP+PH+2+GAP))};}
const plateMesh=()=>merge(box(PLW,PLW,0,PLT),cyl(6,PLT,PLT+1,40),cyl(PIN,PLT,PLT+1+GAP+PH+2+GAP+CAPH,32));
const arc3=(c,e1,e2,r,a0,a1,step=2.5)=>{const n=Math.max(2,Math.ceil(Math.abs(a1-a0)*r/step)),o=[];for(let k=0;k<n;k++){const a=a0+(a1-a0)*k/n;o.push([c[0]+r*(Math.cos(a)*e1[0]+Math.sin(a)*e2[0]),c[1]+r*(Math.cos(a)*e1[1]+Math.sin(a)*e2[1]),c[2]+r*(Math.cos(a)*e1[2]+Math.sin(a)*e2[2])]);}return o;};
const line3=(a,b,step=3)=>{const n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2])/step)),o=[];for(let k=0;k<n;k++)o.push([a[0]+(b[0]-a[0])*k/n,a[1]+(b[1]-a[1])*k/n,a[2]+(b[2]-a[2])*k/n]);return o;};

/* ===== 5 · belt tightener clutch ===== */
(()=>{const A=[-55,0],B=[55,0],R=24.5,RT=10.5,zbAB=BASE+7,Pv=[-26,-58],armT=[26,35],zbL=BASE+0.3,LT=5;
  const Tpos=e=>{const a=e?0:-0.55,c=Math.cos(a),s=Math.sin(a);return[Pv[0]+armT[0]*c-armT[1]*s,Pv[1]+armT[0]*s+armT[1]*c];};
  const H=[Pv[0]-34,Pv[1]-28];
  const LZ=zbL+GAP;const leverMesh=()=>{const T=[armT[0],armT[1]],Hh=[H[0]-Pv[0],H[1]-Pv[1]];const out=lobes([[0,0,9],[T[0],T[1],8],[Hh[0],Hh[1],7]]);
    return merge(prism(out,[circle(BORE,32,0,0)],0,LT),cyl(6,LT,zbAB-LZ,40,T[0],T[1]),cyl(PIN,LT,lv(zbAB).pinTop-LZ,32,T[0],T[1]),cyl(4,LT,LT+16,32,Hh[0],Hh[1]));};
  const engagedLoop=()=>loop2D([{c:A,r:R,s:-1},{c:B,r:R,s:-1},{c:Tpos(true),r:RT,s:1}]);
  const L=lenOf(engagedLoop());
  MODELS[5]={summary:'Two pulleys joined by a slightly long band. Swing the lever and its small pulley presses the band tight, so the drive takes up; swing it back and the band goes slack and the driven pulley stops.',
    params:[{id:'e',type:'toggle',label:'Tightener',options:[[1,'Engaged'],[0,'Released']],value:1}],
    parts(){const l=lv(zbAB);return[
      {id:'base',name:'Base plate',role:'frame',mesh:basePlate(rrect(190,130,8,8,0,-20),[],[{x:A[0],y:A[1],zb:zbAB,top:l.pinTop},{x:B[0],y:B[1],zb:zbAB,top:l.pinTop},{x:Pv[0],y:Pv[1],zb:zbL,top:zbL+GAP+LT+GAP+CAPH+1}]),note:'tall bosses lift the pulleys above the lever'},
      {id:'pa',name:'Driving pulley',role:'driver',mesh:pulley(R,{knob:true})},{id:'pb',name:'Driven pulley',role:'driven',mesh:pulley(R)},{id:'pt',name:'Tightener pulley',role:'link',mesh:pulley(RT)},
      {id:'lev',name:'Tightener lever',role:'link',mesh:leverMesh(),note:'pin and handle up'},{id:'cap',name:'Pin cap',qty:4,role:'small',mesh:cap()},beltPart(L)];},
    pose(phi,P,S){if(S.last===undefined){S.last=phi;S.b=0;S.sp=1;}const d=phi-S.last;S.last=phi;S.sp+=((P.e?1:0)-S.sp)*Math.min(1,Math.abs(d)*1.2);S.b+=d*S.sp;
      const ang=P.e?0:-0.55,T=Tpos(P.e),l=lv(zbAB);let pts;
      if(P.e)pts=to3(engagedLoop(),l.belt);else{const base=loop2D([{c:A,r:R,s:-1},{c:B,r:R,s:-1}]);pts=to3(base,l.belt).map((p,i)=>{if(base[i][3]==='line'&&base[i][2]===1){const f=(p[0]-B[0])/(A[0]-B[0]);return[p[0],p[1]-14*Math.sin(PI*Math.max(0,Math.min(1,f))),p[2]];}return p;});}
      return{inst:[['base',M4.id()],['pa',PZ(A[0],A[1],zbAB,-phi)],['pb',PZ(B[0],B[1],zbAB,-S.b)],['cap',CAPM(A[0],A[1],zbAB)],['cap',CAPM(B[0],B[1],zbAB)],
        ['lev',M4.mul(M4.T(Pv[0],Pv[1],zbL+GAP),M4.Rz(ang))],['pt',PZ(T[0],T[1],zbAB,phi*R/RT)],['cap',CAPM(T[0],T[1],zbAB)],['cap',M4.T(Pv[0],Pv[1],zbL+GAP+LT+GAP)]],
        belts:[{pts,r:CORD,travel:P.e?phi*R:phi*R*0.15}],read:P.e?`engaged · driven pulley at ${Math.round(S.sp*100)} % speed`:`released · band slack, driven pulley ${S.sp>0.05?'slowing':'stopped'}`};},
    hardware:[cordNote(L)],
    steps:['Drop the lever over the short pin near the front edge and cap it.',...COMMON,'Fit the band round the two big pulleys, then swing the lever so the small pulley presses up into the lower strand.','Turn the knob, then swing the lever back: the drive stops.']};
})();

/* ===== 6 · lever and segment driving two pulleys ===== */
(()=>{const O=[0,28],RS=50,RP=15,D=75,P1=[O[0]+D*Math.cos(-125*PI/180),O[1]+D*Math.sin(-125*PI/180)],P2=[O[0]+D*Math.cos(-55*PI/180),O[1]+D*Math.sin(-55*PI/180)],zbS=BASE+4,SH=14,AMP=0.25;
  const segMesh=()=>{const rb=BORE,Ro=RS+2,g=RS-1.5;const prof=[[rb,0],[Ro,0],[Ro,1],[g,3],[g,4.6],[Ro,6.6],[Ro,7.4],[g,9.4],[g,11],[Ro,13],[Ro,SH],[rb,SH]];
    const a0=-PI-0.08,a1=0.08,n=60,m=K.mesh();const P3=(p,a)=>[p[0]*Math.cos(a),p[0]*Math.sin(a),p[1]];
    for(let i=0;i<n;i++){const t0=a0+(a1-a0)*i/n,t1=a0+(a1-a0)*(i+1)/n;for(let j=0;j<prof.length;j++){const p=prof[j],q=prof[(j+1)%prof.length];K.tri(m,P3(p,t0),P3(q,t0),P3(q,t1));K.tri(m,P3(p,t0),P3(q,t1),P3(p,t1));}}
    const T=K.triangulate(prof);for(const [a,b,c] of T.tris){K.tri(m,P3(T.pts[a],a0),P3(T.pts[c],a0),P3(T.pts[b],a0));K.tri(m,P3(T.pts[a],a1),P3(T.pts[b],a1),P3(T.pts[c],a1));}
    K.orient(m);const arm=prism(lobes([[0,0,9],[0,78,8]]),[circle(BORE,32,0,0)],0,SH);return merge(m,arm,cyl(4,SH,SH+16,32,0,78));};
  const best=P=>{const x=loop2D([{c:O,r:RS,s:1},{c:P,r:RP,s:-1}]);const rest=x.filter(p=>!(p[2]===0&&p[3]==='arc'));return{rest,aA:Math.atan2(x[0][1]-O[1],x[0][0]-O[0]),aD:Math.atan2(rest[0][1]-O[1],rest[0][0]-O[0]),s:1};};
  const cordPath=(C,a,z)=>{const ends=[a-0.04,a-PI+0.04];const arc=(from,to,s)=>{const d=s>0?mod(to-from,TAU):-mod(from-to,TAU);const n=Math.max(2,Math.ceil(Math.abs(d)*RS/2.5)),o=[];for(let k=0;k<=n;k++){const t=from+d*k/n;o.push([O[0]+RS*Math.cos(t),O[1]+RS*Math.sin(t),z]);}return{o,d};};
    const dep=ends.map(e=>arc(e,C.aD,C.s)).sort((p,q)=>Math.abs(p.d)-Math.abs(q.d))[0].o,arr=ends.map(e=>arc(C.aA,e,C.s)).sort((p,q)=>Math.abs(p.d)-Math.abs(q.d))[0].o;
    return dep.concat(to3(C.rest,z),arr);};
  const loops=()=>[best(P1),best(P2)];
  const [la,lb]=loops(),L1=lenOf(cordPath(la,0,0)),L2=lenOf(cordPath(lb,0,0));const zU=lv(zbS).z0+10.2,zL=lv(zbS).z0+3.8;const zb1=zU-GAP-PH/2,zb2=zL-GAP-PH/2;
  MODELS[6]={summary:'Rock the lever and its grooved segment winds two crossed cords, turning both pulleys back and forth. Each cord is tied to the ends of the segment and wrapped once round its pulley.',
    parts(){const t=Math.max(lv(zbS,SH).pinTop,lv(zb1).pinTop);return[
      {id:'base',name:'Base plate',role:'frame',mesh:basePlate(rrect(170,150,8,8,0,-5),[],[{x:O[0],y:O[1],zb:zbS,top:lv(zbS,SH).pinTop},{x:P1[0],y:P1[1],zb:zb1,top:lv(zb1).pinTop},{x:P2[0],y:P2[1],zb:zb2,top:lv(zb2).pinTop}]),note:'bosses set the two cord levels'},
      {id:'seg',name:'Lever and segment',role:'driver',mesh:segMesh(),note:'two cord grooves; flat side down'},
      {id:'p1',name:'Left pulley',role:'driven',mesh:pulley(RP)},{id:'p2',name:'Right pulley',role:'driven',mesh:pulley(RP)},{id:'cap',name:'Pin cap',qty:3,role:'small',mesh:cap()}];},
    pose(phi){const a=AMP*Math.sin(phi);const pr=-a*RS/RP;const R2=(p,a)=>{const c=Math.cos(a),s=Math.sin(a);return[O[0]+(p[0]-O[0])*c-(p[1]-O[1])*s,O[1]+(p[0]-O[0])*s+(p[1]-O[1])*c];};
      return{inst:[['base',M4.id()],['seg',M4.mul(M4.T(O[0],O[1],lv(zbS).z0),M4.Rz(a))],['p1',PZ(P1[0],P1[1],zb1,pr)],['p2',PZ(P2[0],P2[1],zb2,pr)],['cap',M4.T(O[0],O[1],lv(zbS,SH).capZ)],['cap',CAPM(P1[0],P1[1],zb1)],['cap',CAPM(P2[0],P2[1],zb2)]],
        belts:[{pts:cordPath(la,a,zU),r:1,closed:false},{pts:cordPath(lb,a,zL),r:1,closed:false}],read:`lever ${(a*180/PI).toFixed(0)}° · each pulley ${(-a*RS/RP*180/PI).toFixed(0)}°`};},
    hardware:[`Two lengths of thin cord or fishing line, about ${Math.round(L1+40)} and ${Math.round(L2+40)} mm, including spare for the knots.`],
    steps:['Put the segment on the middle pin, then the two pulleys on theirs, and cap all three.','Tie a cord to one end of the upper groove, run it down and round the left pulley once, cross it over and tie it to the other end of the groove.','Do the same for the right pulley in the lower groove.','Rock the lever by its handle: both pulleys turn back and forth together.']};
})();

/* ===== 7 · fast and loose pulleys ===== */
(()=>{const D=[-55,0],S=[40,0],RD=24,RF=20,HD=26;const zb=BASE+1,l=lv(zb);const zLoose=l.z0,zFast=zLoose+PH+GAP,zTop=zFast+PH+2+GAP;
  const shaft=()=>{const sh=K.circle(PIN-0.15,40);const dsh=sh.map(p=>[Math.min(p[0],PIN-0.15-0.6),p[1]]);return merge(cyl(14,0,3,48),prism(dsh,[],3,3+(zTop-0)+0.0),box(10,2.5,3,4.2,8,0));};
  const FP=[22,-50],EY=28;
  const fork=()=>{const eye=K.xf(prism(rrect(14,16,3,4,EY,8),[circle(3.4,32,EY,9)],-5,5),[0,1,0,0, 0,0,1,0, 1,0,0,0, 0,0,0,1]);return merge(prism(lobes([[0,0,7],[0,EY,6]]),[circle(BORE,32,0,0)],0,4),eye);};
  MODELS[7]={summary:'A wide driving drum and, on the output shaft, a loose pulley under a fast one. Slide the belt fork up and the band moves onto the fast pulley, which is keyed to the shaft; slide it down and the band idles on the loose pulley.',
    params:[{id:'f',type:'toggle',label:'Band on',options:[[1,'Fast pulley'],[0,'Loose pulley']],value:1}],
    parts(){const top=lv(zb,HD).pinTop;return[
      {id:'base',name:'Base plate',role:'frame',mesh:basePlate(rrect(170,90,8,8,-5,-6),[circle(BORE,32,S[0],S[1])],[{x:D[0],y:D[1],zb,top},{x:S[0],y:S[1],zb,top:0,tube:true},{x:FP[0],y:FP[1],zb:BASE,top:BASE+50}]),note:'hole for the output shaft; tall post for the fork'},
      {id:'drum',name:'Driving drum',role:'driver',mesh:pulley(RD,{flat:true,h:HD}),note:'crowned face keeps the band on'},
      {id:'loose',name:'Loose pulley',role:'link',mesh:pulley(RF,{flat:true}),note:'round bore, turns freely'},
      {id:'fast',name:'Fast pulley',role:'driven',mesh:pulley(RF,{flat:true}),note:'glue it to the shaft (or file a flat in the bore)'},
      {id:'shaft',name:'Output shaft with top disk',role:'driven',mesh:shaft(),note:'print disk down; flat side keys the fast pulley'},
      {id:'fork',name:'Belt fork',role:'link',mesh:fork(),note:'slides on the post'},{id:'cap',name:'Pin cap',qty:1,role:'small',mesh:cap()},beltPart(2*95+PI*(RD+RF))];},
    pose(phi,P,St){if(St.last===undefined){St.last=phi;St.o=0;St.sp=1;St.lz=0;}const d=phi-St.last;St.last=phi;St.sp+=((P.f?1:0)-St.sp)*Math.min(1,Math.abs(d)*2);St.o+=d*St.sp*RD/RF;St.lz+=(((P.f?1:0))-St.lz)*0.12;
      const bz=zLoose+PH/2+St.lz*(PH+GAP);const pts=to3(loop2D([{c:D,r:RD,s:1},{c:S,r:RF,s:1}]),bz);
      return{inst:[['base',M4.id()],['drum',PZ(D[0],D[1],zb,phi)],['cap',M4.T(D[0],D[1],lv(zb,HD).capZ)],['loose',M4.mul(M4.T(S[0],S[1],zLoose),M4.Rz(P.f?St.o*0.3:phi*RD/RF))],['fast',M4.mul(M4.T(S[0],S[1],zFast),M4.Rz(St.o))],
        ['shaft',M4.mul(M4.mul(M4.T(S[0],S[1],zTop+3),M4.Rx(PI)),M4.Rz(-St.o))],['fork',M4.T(FP[0],FP[1],bz-9)]],
        belts:[{pts,r:CORD,travel:phi*RD}],read:P.f?`band on the fast pulley · shaft ${Math.round(St.sp*100)} % speed`:`band on the loose pulley · shaft ${St.sp>0.05?'coasting':'stopped'}`};},
    hardware:[cordNote(2*95+PI*(RD+RF)),'A drop of glue to fix the fast pulley to the shaft.'],
    steps:['Slide the loose pulley, then the fast pulley, onto the shaft from below the top disk; glue only the fast pulley.','Drop the shaft into the hole in the base.','Fit the drum on its pin and cap it; slide the fork onto the tall post.','Thread the band through the eye of the fork before joining it, then run it round the drum and the pulleys. Slide the fork up or down the post to shift the band.']};
})();

/* ===== 8 · stepped speed pulleys ===== */
(()=>{const A=[-48,0],B=[48,0],R=[14,20,26],h=9,H=27,zbA=BASE+1,zbB=BASE+3,z0A=zbA+GAP,z0B=zbB+GAP,KT=4;
  const topA=z0A+H+2+1.2+GAP+KT+GAP+CAPH,topB=z0B+H+2+GAP+CAPH;
  const knob=()=>merge(prism(lobes([[0,0,9],[18,0,6]]),[circle(BORE,32,0,0)],0,KT),cyl(3.5,KT,KT+14,32,18,0));
  MODELS[8]={summary:'Two identical stepped pulleys, one turned upside down. Moving the band from step to step gives three speeds; because each pair of radii adds up to the same total, one band fits every step.',
    params:[{id:'s',type:'toggle',label:'Band on step',options:[[0,'Slow'],[1,'Equal'],[2,'Fast']],value:1}],
    parts(){return[
      {id:'base',name:'Base plate',role:'frame',mesh:basePlate(rrect(170,80,8),[],[{x:A[0],y:A[1],zb:zbA,top:topA},{x:B[0],y:B[1],zb:zbB,top:topB}])},
      {id:'sp',name:'Stepped pulley',qty:2,role:'driver',mesh:stepped([26,20,14].map(r=>({Rp:r,h}))),note:'largest step down; the left one is fitted upside down'},
      {id:'knob',name:'Crank arm',role:'small',mesh:knob(),note:'glue onto the left pulley'},{id:'cap',name:'Pin cap',qty:2,role:'small',mesh:cap()},beltPart(2*96+PI*40)];},
    pose(phi,P){const i=P.s,ra=R[i],rb=R[2-i];const bz=z0B+h*i+h/2;const pts=to3(loop2D([{c:A,r:ra,s:1},{c:B,r:rb,s:1}]),bz);const b=phi*ra/rb;const tA=z0A+H+2+1.2;
      return{inst:[['base',M4.id()],['sp',M4.chain(M4.T(A[0],A[1],tA),M4.Rx(PI),M4.Rz(-phi))],['sp',M4.mul(M4.T(B[0],B[1],z0B),M4.Rz(b))],['knob',M4.mul(M4.T(A[0],A[1],tA+GAP*0),M4.Rz(phi))],['cap',M4.T(A[0],A[1],tA+KT+GAP)],['cap',M4.T(B[0],B[1],z0B+H+2+GAP)]],
        belts:[{pts,r:CORD,travel:phi*ra}],read:`step ${i+1} · driven ${(ra/rb).toFixed(2)}× driver speed`};},
    hardware:[cordNote(2*96+PI*40),'A drop of glue to fix the crank arm to the left pulley.'],
    steps:['Fit one stepped pulley largest step down on the right pin.','Fit the other upside down (smallest step down) on the left pin, glue the crank arm onto it, and cap both pins.','Stretch the band round any matching pair of steps and turn the crank. Move the band to change speed.']};
})();

/* ===== 9 · 10 cone pulleys ===== */
function cones(n,shaped){const A=[-50,0],B=[50,0],H=42,C=100,zb=BASE+1,z0=zb+GAP;
  const rA=shaped?(f=>12+20*(1-Math.cos(f*PI/2))):(f=>12+18*f);
  const Lopen=(a,b)=>{const g=Math.asin((a-b)/C);return 2*Math.sqrt(C*C-(a-b)**2)+(PI+2*g)*a+(PI-2*g)*b;};
  const L0=shaped?Lopen(rA(0),rA(1)):null;
  const rB=shaped?(f=>{const a=rA(f);let lo=4,hi=60;for(let k=0;k<60;k++){const m=(lo+hi)/2;if(Lopen(a,m)>L0)hi=m;else lo=m;}return(lo+hi)/2;}):(f=>30-18*f);
  MODELS[n]={summary:shaped?'Two cones with curved sides, shaped so that one band stays equally tight wherever it sits. Slide the band along to change the speed smoothly.':'Two straight cones, one turned the other way. Slide the band along them and the speed changes smoothly. With straight cones the band is a little slacker in the middle.',
    params:[{id:'f',label:'Band position',min:0,max:1,step:0.02,value:0.3,fmt:v=>`${Math.round(v*100)} % up`}],
    parts(){const top=z0+H+2+GAP+CAPH;const ca=cone(rA,H,{knob:true}),cb=cone(rB,H);return[
      {id:'base',name:'Base plate',role:'frame',mesh:basePlate(rrect(180,90,8),[],[{x:A[0],y:A[1],zb,top},{x:B[0],y:B[1],zb,top}])},
      {id:'ca',name:'Driving cone',role:'driver',mesh:ca,note:'narrow end down, knob up'},{id:'cb',name:'Driven cone',role:'driven',mesh:cb,note:shaped?'wide end down; its curve differs from the driving cone':'wide end down'},
      {id:'cap',name:'Pin cap',qty:2,role:'small',mesh:cap()},beltPart(Lopen(rA(0.5),rB(0.5)))];},
    pose(phi,P){const f=P.f,ra=rA(f),rb=rB(f),bz=z0+2+f*(H-4);const pts=to3(loop2D([{c:A,r:ra+CORD,s:1},{c:B,r:rb+CORD,s:1}]),bz);
      return{inst:[['base',M4.id()],['ca',M4.mul(M4.T(A[0],A[1],z0),M4.Rz(phi))],['cb',M4.mul(M4.T(B[0],B[1],z0),M4.Rz(phi*ra/rb))],['cap',M4.T(A[0],A[1],z0+H+2+GAP)],['cap',M4.T(B[0],B[1],z0+H+2+GAP)]],
        belts:[{pts,r:CORD,travel:phi*ra}],read:`band ${Math.round(f*100)} % up · driven ${(ra/rb).toFixed(2)}× driver speed`+(shaped?'':` · band length change ${(Lopen(ra,rb)-Lopen(rA(0),rB(0))).toFixed(1)} mm`)};},
    get hardware(){return[cordNote(Lopen(rA(0.5),rB(0.5)))];},
    steps:['Fit the driving cone narrow end down on the left pin, the driven cone wide end down on the right pin, and cap both.','Stretch the band round both cones and turn the knob; push the band up or down with a fingertip to change speed.']};}
cones(9,false);cones(10,true);
})();
