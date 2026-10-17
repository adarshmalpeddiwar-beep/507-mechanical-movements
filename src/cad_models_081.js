/* ===== printable models 81–115 ===== */
const U=PK.U,{Sh}=PK;PK._S(0.3);
const pxPoly=(pts,holes=[[0,0]])=>({o:pts,h:holes.map(h=>Sh.hole(h[0],h[1],h[2]))});
const rotPts=(pts,a,dx=0,dy=0)=>pts.map(([x,y])=>[x*Math.cos(a)-y*Math.sin(a)+dx,x*Math.sin(a)+y*Math.cos(a)+dy]);
/* offset a closed polyline (px) by d along its normals */
function offsetLoop(pts,d){const n=pts.length,o=[];let A=0;for(let i=0;i<n;i++){const a=pts[i],b=pts[(i+1)%n];A+=a[0]*b[1]-b[0]*a[1];}const s=A>0?1:-1;
  for(let i=0;i<n;i++){const p=pts[(i-1+n)%n],q=pts[(i+1)%n],t=[q[0]-p[0],q[1]-p[1]],l=Math.hypot(t[0],t[1])||1;o.push([pts[i][0]+s*t[1]/l*d,pts[i][1]-s*t[0]/l*d]);}return o;}
/* plate with a groove (not through): solid lower layer, upper layer with the groove cut (island kept) */
function pip(pt,poly){let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>pt[1])!==(b[1]>pt[1])&&pt[0]<(b[0]-a[0])*(pt[1]-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;}
function groovedPlate(outline,center,w,holes=[[0,0]]){const out=offsetLoop(center,w/2),inn=offsetLoop(center,-w/2);const O1=pip(holes[0]||[0,0],out)?out:inn;/* make sure 'out' is the larger loop */
  const area=q=>{let a=0;for(let i=0;i<q.length;i++){const u=q[i],v=q[(i+1)%q.length];a+=u[0]*v[1]-v[0]*u[1];}return Math.abs(a);};const big=area(out)>area(inn)?out:inn,small=big===out?inn:out;
  const hin=holes.filter(h=>pip(h,small)),hout=holes.filter(h=>!pip(h,big));const H=hs=>hs.map(h=>Sh.hole(h[0],h[1],h[2]));
  return K.merge(PK.ext({o:outline,h:H(holes)},0,2.2),PK.ext({o:outline,h:[...H(hout),big]},2.2,PK.TH),PK.ext({o:small,h:H(hin)},2.2,PK.TH));}
const peg=(r=2,h=PK.TH+PK.GAP+2)=>K.cyl(r,0,h,20);
/* ---------- generic cam with a flat-foot follower or a yoke (camFlat family) ---------- */
function camFlatModel(n,summary){const sim=window.MB.SIMS[n];if(!sim||!sim.shape)return;const o=sim.o||{};const sh=sim.shape(),O=(sim.O||[330,300]);const yoke=sim.outLabel&&/Yoke|Valve/.test(sim.outLabel);
  const parts=[{id:'c',name:'Cam',role:'driver',layer:0,shape:pxPoly(sh),bosses:[[sh[0][0]*0.4,sh[0][1]*0.4,12,3.5]]}];let fixed=[];
  if(yoke){let hx=-1e9,hxn=1e9,ext=0;for(let i=0;i<72;i++){const a=i/72*TAU;let mx=-1e9,mn=1e9;for(const [x,y] of sh){const X=x*Math.cos(a)-y*Math.sin(a);mx=Math.max(mx,X);mn=Math.min(mn,X);}ext=Math.max(ext,mx-mn);}
    const W=ext,Hh=Math.max(...sh.map(p=>Math.hypot(p[0],p[1])))+14;parts.push({id:'y',name:'Yoke with rods',role:'driven',layer:0,shape:S=>({o:[[-16,-Hh-16],[W+16,-Hh-16],[W+16,-16],[W+260,-16],[W+260,16],[W+16,16],[W+16,Hh+16],[-16,Hh+16],[-16,16],[-200,16],[-200,-16],[-16,-16]],h:[[[0,-Hh],[W,-Hh],[W,Hh],[0,Hh]]]})});
    fixed=[{shape:S=>S.rect(70,8,O[0]-200,O[1]-24),l1:0},{shape:S=>S.rect(70,8,O[0]-200,O[1]+24),l1:0},{shape:S=>S.rect(70,8,O[0]+W+200,O[1]-24),l1:0},{shape:S=>S.rect(70,8,O[0]+W+200,O[1]+24),l1:0}];
    PK.def(n,{S:0.3,summary,parts,ground:[[O[0],O[1],0,0]],fixed,pose(g){return{c:[O[0],O[1],g.a],y:[O[0]+g.hxn,O[1],0]};},drive:'Turn the cam by its knob.'});}
  else{parts.push({id:'f',name:'Flat-foot follower rod',role:'driven',layer:0,shape:S=>({o:[[-60,0],[60,0],[60,-16],[8,-16],[8,-190],[-8,-190],[-8,-16],[-60,-16]],h:[]})});
    fixed=[{shape:S=>S.rect(10,40,O[0]-25,150),l1:0},{shape:S=>S.rect(10,40,O[0]+25,150),l1:0}];
    PK.def(n,{S:0.3,summary,parts,ground:[[O[0],O[1],0,0]],fixed,pose(g){return{c:[O[0],O[1],g.a],f:[O[0],O[1]-g.hy,0]};},drive:'Turn the cam by its knob; the follower rises and falls back.'});}}
camFlatModel(86,'A display model: the cam on the shaft drags the catch round, raising the rope (here a follower), then lets it fall back with the pump bucket’s weight.');
camFlatModel(88,'A disk shaped so that it holds the follower still for half a turn and then moves it: intermittent motion from steady turning.');
camFlatModel(90,'An eccentric working inside a long yoke instead of a strap: the yoke and its rods slide straight in fixed guides without any swinging rod.');
camFlatModel(91,'A triangular (Reuleaux) eccentric in a square yoke: the yoke moves, rests, moves back and rests again each turn, as French engineers used for steam valves.');
/* ---------- 81 part gear and spring-return rack ---------- */
{const G=[330,200],r=60,m=6,x=G[0]+r,Z=20,tau=TAU/20;const part=()=>{const o=Sh.gearOutline(r,Z).map(p=>{const t=((Math.atan2(p[1],p[0]))%TAU+TAU)%TAU;if(t>TAU*2/3+0.0001&&t<TAU-0.0001||t<0.0001){}return p;});
    const rr=r-1.25*m;return o.map(p=>{let t=Math.atan2(p[1],p[0]);t=((t+TAU/3-tau/2)%TAU+TAU)%TAU;if(t<=TAU/3)return p;const R=Math.min(Math.hypot(p[0],p[1]),rr),q=Math.atan2(p[1],p[0]);return[R*Math.cos(q),R*Math.sin(q)];});};
 PK.def(81,{S:0.3,summary:'A gear with teeth on one third of its rim pushes a rack down; when its last tooth leaves the rack, a spring (a rubber band) pulls the rack back up for the next stroke.',
  parts:[{id:'g',name:'Part gear, teeth on a third',role:'driver',layer:0,shape:pxPoly(part()),bosses:[[-30,0,12,3.5]]},{id:'r',name:'Rack',role:'driven',layer:0,shape:S=>{const R=S.rack(-160,172,m,22,{c0:0});return{o:R.o.map(([a,b])=>[b,a]),h:[]};}}],
  ground:[[G[0],G[1],0,0],[x+30,470,0,0]],fixed:[{shape:S=>S.rect(10,320,x+1.25*m+30,200),l1:0}],
  pose(g){return{g:[G[0],G[1],g.phi-TAU/3+tau/2],r:[x,G[1]+g.y,0]};},hardware:['A rubber band from the bottom of the rack to the peg below it.'],drive:'Turn the part gear by its knob.'});}
/* ---------- 83 two ratchet arcs: lever-and-pawl model; 87 = 53 layout ---------- */
/* ---------- 85 stamp mill: cams on a level shaft lift three stamps in turn ---------- */
{const H=40,Rc=6,lift=t=>{t=((t%PI)+PI)%PI;return t<0.75*PI?18*t/(0.75*PI):18*Math.max(0,1-(t-0.75*PI)/(0.06*PI));},xs=[-30,0,30];
 const camM=K.merge(K.prism(K.circle(Rc,32),[U.octa(U.SH+0.12)],0,6),...[0,PI].map(a=>K.prism(K.hull([...K.circle(4,16,0,0),...K.circle(3,16,(Rc+14)*Math.cos(a),(Rc+14)*Math.sin(a))]),[U.octa(U.SH+0.12)],0,6)));
 const stamp=K.merge(K.box(6,6,0,70),K.box(14,14,0,10),K.box(14,4,40,44,0,5));/* rod, shoe, tappet on the side facing the cam */
 PK.defS(85,{summary:'A stamp mill: wipers on the level camshaft lift each stamp by a tappet on its stem and let it drop by its own weight. The three wiper pairs are set a third of a turn apart, so the stamps fall one after another.',cam:{yaw:0.4,pitch:0.25},
  base:()=>[U.plate(-58,-30,58,30),U.wall(-50,0,'x',[[0,H]],18,5,H+10),U.wall(50,0,'x',[[0,H]],18,5,H+10),...[-1,1].map(s=>K.xf(K.prism([[-48,-8],[48,-8],[48,8],[-48,8]],xs.map(x=>[[x-3.4,-12+5-3.4],[x+3.4,-12+5-3.4],[x+3.4,-12+5+3.4],[x-3.4,-12+5+3.4]]).map(q=>q.map(([a,b])=>[a,b+7])),0,4),K.M4.T(0,-15,s>0?96:62))),K.box(4,8,0,100,-50,-15),K.box(4,8,0,100,50,-15),K.box(100,40,0,6,0,-15)],
  parts:[{id:'s',name:'Camshaft',mesh:U.shaft(120)},{id:'c',name:'Wiper pair',role:'driver',qty:3,mesh:camM},{id:'st',name:'Stamp',role:'driven',qty:3,mesh:stamp},{id:'k',name:'Hand crank',role:'driver',mesh:U.crank()}],
  pose(phi){return{s:U.shaftAt([0,0,H],[1,0,0],phi),c:xs.map((x,k)=>U.at([x-3,0,H],[1,0,0],phi+k*TAU/3+PI/2)),st:xs.map((x,k)=>K.M4.T(x,-15,10+lift(phi+k*TAU/3))),k:U.at([-58,0,H],[-1,0,0],-phi)};},
  read:phi=>`stamps ${xs.map((_,k)=>lift(phi+k*TAU/3).toFixed(0)).join(' / ')} mm up`,drive:'Turn the crank: the stamps rise and drop in turn.'});}
/* ---------- 82 two treadles, one strap, one ratchet ---------- */
{const sim=window.MB.SIMS[82],O=[400,230],N=20,rr=78,rt=98,sawR=window.MB.sawR,A=[[-1,PI+0.5],[1,-0.5]];
 PK.def(82,{S:0.3,summary:'Two treadles tied by a strap over a pulley go up and down by turns. Each one rocks an arm on the ratchet’s centre through a link; each arm carries a pawl, and as each arm works on its own treadle’s stroke the ratchet wheel turns almost continuously.',
  parts:[{id:'w',name:'Ratchet wheel',role:'driven',layer:2,shape:S=>S.ratchet(rt,N,rt-rr,1)},{id:'a1',name:'Arm 1',role:'link',layer:0,shape:S=>S.bar(150,13),pins:[[rt+22,0,2],[150,0,1]]},{id:'a2',name:'Arm 2',role:'link',layer:1,shape:S=>S.bar(150,13),pins:[[rt+22,0,2],[150,0,2]]},
    {id:'p',name:'Pawl',role:'link',layer:2,qty:2,shape:S=>S.lever([[0,0,6],[40,0,4]],[[0,0]])}],
  ground:[[O[0],O[1],0,2]],
  pose(g,s){const o={w:[O[0],O[1],-s.w],p:[]};A.forEach(([sg,base],i)=>{const ang=base+sg*g.a;o['a'+(i+1)]=[O[0],O[1],ang];const H=[O[0]+(rt+22)*Math.cos(ang),O[1]+(rt+22)*Math.sin(ang)],ta=ang-sg*0.3,r=sawR(ta+s.w,N,rr,rt)+1,T=[O[0]+r*Math.cos(ta),O[1]+r*Math.sin(ta)];o.p.push([H[0],H[1],Math.atan2(T[1]-H[1],T[0]-H[0])]);});return o;},
  drive:'Rock the two arms alternately (or tie strings to them for treadles) and watch the wheel keep turning.'});}
leverPawlModel083();function leverPawlModel083(){}
/* ---------- 89 eccentric, strap and valve rod ---------- */
{const sim=window.MB.SIMS[89],O=sim.O,L=sim.L,e=sim.P.e;
 PK.def(89,{S:0.3,summary:'An eccentric: a disk fixed off-centre on the shaft turns inside a strap, and the strap’s rod pushes the valve slide back and forth by twice the offset. Change the throw on the simulation; the model is printed at the default.',
  parts:[{id:'e',name:'Eccentric disk (off-centre hole)',role:'driver',layer:0,shape:S=>S.disk(62,[[-e,0]]),bosses:[[30,0,12,3.5]]},{id:'s',name:'Strap with rod',role:'link',layer:1,shape:S=>({o:K.hull([...S.circle(80,48),...S.circle(10,16,L,0)]),h:[S.circle(64,64)]}),pins:[[L,0,1]]},
    {id:'v',name:'Valve slide',role:'driven',layer:0,shape:S=>S.rect(60,40,20,0,[]),dz:0}],
  ground:[[O[0],O[1],0,0]],fixed:[{shape:S=>S.rect(140,8,O[0]+L+20,O[1]-26),l1:0},{shape:S=>S.rect(140,8,O[0]+L+20,O[1]+26),l1:0}],
  pose(g){return{e:[O[0],O[1],g.phi],s:[g.c[0],g.c[1],Math.atan2(O[1]-g.c[1],g.x-g.c[0])],v:[g.x,O[1],0]};},drive:'Turn the eccentric by its knob.'});}
/* ---------- 92 crank, connecting rod and crosshead ---------- */
{const sim=window.MB.SIMS[92],O=sim.O,r=sim.P.r,L=sim.P.L;
 PK.def(92,{S:0.3,summary:'The plain crank: a flywheel with a crank pin, a connecting rod and a crosshead sliding between guides. Turning the flywheel drives the crosshead back and forth (or a pushed crosshead turns the wheel).',
  parts:[{id:'f',name:'Flywheel with crank pin',role:'driver',layer:0,shape:S=>({o:S.circle(120,96),h:[S.hole(0,0),...[0,1,2,3,4].map(k=>S.circle(28,24,70*Math.cos(k*TAU/5+0.6),70*Math.sin(k*TAU/5+0.6)))]}),pins:[[r,0,1]],bosses:[[-100,0,14,3.5]]},
    {id:'c',name:'Connecting rod',role:'link',layer:1,shape:S=>S.bar(L,14)},{id:'x',name:'Crosshead',role:'driven',layer:0,shape:S=>S.rect(50,36,0,0,[]),pins:[[0,0,1]]}],
  ground:[[O[0],O[1],0,0]],fixed:[{shape:S=>S.rect(200,8,O[0]+L+70,O[1]-24),l1:0},{shape:S=>S.rect(200,8,O[0]+L+70,O[1]+24),l1:0}],
  pose(g){return{f:[O[0],O[1],g.phi],c:[g.pin[0],g.pin[1],Math.atan2(O[1]-g.pin[1],g.x-g.pin[0])],x:[g.x,O[1],0]};},drive:'Turn the flywheel by its knob.'});}
/* ---------- 93 Scotch yoke ---------- */
{const sim=window.MB.SIMS[93],O=sim.O,r=sim.r;
 PK.def(93,{S:0.3,summary:'The Scotch yoke: the crank pin slides up and down in a slot across the yoke, so the yoke and its rods move straight back and forth with true harmonic motion and no swinging rod.',
  parts:[{id:'d',name:'Crank disk with pin',role:'driver',layer:0,shape:S=>S.disk(112),pins:[[r,0,1]],bosses:[[-80,0,14,3.5]]},
    {id:'y',name:'Slotted yoke with rods',role:'driven',layer:1,shape:S=>({o:[[-16,-140],[16,-140],[16,-8],[330,-8],[330,8],[16,8],[16,140],[-16,140],[-16,8],[-330,8],[-330,-8],[-16,-8]],h:[S.slotPts(0,-112,0,112)]})}],
  ground:[[O[0],O[1],0,0]],fixed:[{shape:S=>S.rect(40,8,O[0]-300,O[1]-16),l1:1},{shape:S=>S.rect(40,8,O[0]-300,O[1]+16),l1:1},{shape:S=>S.rect(40,8,O[0]+300,O[1]-16),l1:1},{shape:S=>S.rect(40,8,O[0]+300,O[1]+16),l1:1}],
  pose(g){return{d:[O[0],O[1],g.phi],y:[g.pin[0],O[1],0]};},drive:'Turn the crank disk by its knob.'});}
/* ---------- 94 spiral plate and slotted plate ---------- */
{const sim=window.MB.SIMS[94],O=[400,265],a=18/(PI/3);const spiral=[];for(let i=0;i<=300;i++){const th=i/300*TAU*2.25,r=40+a*th;if(r>172)break;spiral.push([r*Math.cos(th),r*Math.sin(th)]);}
 const band=w=>{const L=spiral.length,o=[],n=[];for(let i=0;i<L;i++){const p=spiral[Math.max(0,i-1)],q=spiral[Math.min(L-1,i+1)],t=[q[0]-p[0],q[1]-p[1]],l=Math.hypot(...t);o.push([spiral[i][0]-t[1]/l*w,spiral[i][1]+t[0]/l*w]);n.push([spiral[i][0]+t[1]/l*w,spiral[i][1]-t[0]/l*w]);}return o.concat(n.reverse());};
 PK.def(94,{S:0.28,summary:'Two plates on one centre: the lower one has a spiral slot, the upper one three straight radial slots. A bolt passes through both at each crossing. Turn the spiral plate and all three bolts move in or out together, as in a chuck or an adjustable crank.',
  parts:[{id:'s',name:'Spiral-slot plate',role:'driver',layer:0,shape:S=>({o:S.circle(185,120),h:[S.hole(0,0),band(7)]}),bosses:[[0,175,10,3.5]]},
    {id:'r',name:'Radial-slot plate',role:'link',layer:1,shape:S=>({o:S.circle(170,120),h:[S.hole(0,0),...[0,1,2].map(k=>{const t=-PI/2+k*TAU/3;return S.slotPts(55*Math.cos(t),55*Math.sin(t),160*Math.cos(t),160*Math.sin(t),14);})]})},
    {id:'b',name:'Bolt',role:'driven',qty:3,mesh:K.merge(K.cyl(1.8,-PK.TH-PK.GAP,PK.TH+1,16),K.cyl(3.5,PK.TH+1,PK.TH+3,24))}],
  ground:[[O[0],O[1],0,1]],
  pose(g){return{s:[O[0],O[1],g.t],r:[O[0],O[1],0],b:[0,1,2].map(k=>{const t=-PI/2+k*TAU/3;return[O[0]+g.r[k]*Math.cos(t),O[1]+g.r[k]*Math.sin(t),0];})};},drive:'Turn the lower plate back and forth by its knob; the three bolts close in and open out.'});}
/* ---------- 95 swash plate ---------- */
{const al=0.38,R=34,H0=U.BT+30;const disk=K.merge(K.prism(K.circle(R,64),[U.octa(U.SH+0.12)],-2,2));
 for(const n of [95,272])PK.defS(n,{summary:n===272?'A bevelled disk cam: the disk is set aslant on its shaft, so a rod resting on its face in guides is pushed up and let down once every turn.':'An oblique (swash) disk on an upright shaft: a rod resting on it, held in guides, rises and falls once per turn as the tilted face passes under it.',cam:{yaw:0.6,pitch:0.4},
  base:()=>{const x=R*0.75,tab=z=>K.prism([[x-8,-16],[x+8,-16],[x+8,8],[x-8,8]],[K.circle(2.9,20,x,0)],z,z+4);return[U.plate(-44,-30,44,30),U.post(0,0,H0-16,U.BT+2),K.box(16,5,0,108,x,-18),tab(76),tab(104)];},
  parts:[{id:'d',name:'Swash disk on its hub',role:'driver',mesh:K.merge(disk,K.prism(K.circle(5,24),[K.circle(U.SHB,24)],-14,0))},{id:'r',name:'Push rod with rounded foot',role:'driven',mesh:K.merge(K.cyl(2.4,0,70,20),K.lathe([[0.01,-3],[3,-2],[3.5,0],[0.01,0]],20))},{id:'k',name:'Knob',role:'driver',mesh:K.cyl(4,0,8,24)}],
  pose(phi){const n=[Math.sin(al)*Math.cos(phi),Math.sin(al)*Math.sin(phi),Math.cos(al)],x=R*0.75,h=H0-(x*n[0])/n[2];return{d:U.at([0,0,H0],n,phi,[Math.cos(phi),Math.sin(phi),0]),r:K.M4.T(x,0,h+2),k:K.M4.T(0,0,H0+4)};},
  read:phi=>'rod rises and falls once a turn',drive:'Turn the disk; the rod goes up and down.'});}
/* ---------- screws: threaded rod in end bearings, a nut that cannot turn rides along ---------- */
function screwModel(n,o){const p=o.p||4,rp=5,L=o.L||90,H=U.BT+12,nutL=12,thOf=o.th||((g)=>g.th??g.phi);
  const parts=[{id:'sc',name:o.screwName||'Lead screw',role:'driver',mesh:U.worm(rp,p,L,o.wopt||{})},{id:'n',name:'Nut (internal thread)',role:'driven',mesh:U.nut(rp,p,nutL,20,20,o.wopt||{})},{id:'s',name:'Shaft through the screw',mesh:U.shaft(L+40)},{id:'k',name:'Hand crank',role:'driver',mesh:U.crank()}];
  if(o.extra)parts.push(...o.extra.parts);
  PK.defS(n,{summary:o.summary,cam:{yaw:0.5,pitch:0.45},
    base:()=>[U.plate(-L/2-22,-24,L/2+22,24),U.wall(-L/2-6,0,'x',[[0,H]],18,5,H+8),U.wall(L/2+6,0,'x',[[0,H]],18,5,H+8),K.box(L,4,U.BT,U.BT+2,0,-12),K.box(L,4,U.BT,U.BT+2,0,12),...(o.extra&&o.extra.base?o.extra.base(H):[])],
    parts,
    pose(phi,g,sim){const th=thOf(g,sim),x=Math.max(-L/2+nutL,Math.min(L/2-nutL,p*th/TAU*(o.k||1)))-nutL/2;const out={sc:U.at([-L/2,0,H],[1,0,0],th,[0,0,1]),n:K.M4.mul(K.M4.T(x,0,H),K.M4.mul(K.M4.Ry(PI/2),K.M4.Rz(PI/2))),s:U.shaftAt([0,0,H],[1,0,0],th),k:U.at([-L/2-14,0,H],[-1,0,0],-th,[0,0,1])};
      if(o.extra&&o.extra.pose)Object.assign(out,o.extra.pose(th,x+nutL/2,H,g));return out;},
    read:(phi,g,)=>'',drive:'Turn the crank: the nut travels one thread pitch per turn.'});}
screwModel(102,{summary:'The plain screw and nut: the nut is kept from turning by the base rails, so each turn of the screw moves it along by one pitch of the thread.'});
screwModel(103,{summary:'Turning the lead screw moves the slide (its nut) straight along the bed: one pitch per turn.'});
screwModel(109,{summary:'A screw-cutting train in miniature: the lead screw carries the tool slide, and the change wheels at the end set how fast the screw turns compared with the work, so they set the pitch of the thread being cut.',
  extra:{parts:[{id:'g1',name:'Change wheel, 16 teeth',role:'link',mesh:U.spur(8,16,4)},{id:'g2',name:'Change wheel, 24 teeth',role:'link',mesh:U.spur(12,24,4,{bore:'round'})},{id:'t',name:'Tool point',role:'driven',mesh:K.prism([[-3,0],[3,0],[0,8]],[],0,4)}],
   base:H=>[U.post(-56,0,H-20+3+4.5,U.BT)],pose:(th,x,H)=>({g1:U.at([-60,0,H],[-1,0,0],-th,[0,0,1]),g2:U.at([-60,0,H-20],[-1,0,0],th*16/24+PI/24,[0,0,1]),t:K.M4.mul(K.M4.T(x,0,H+10),K.M4.Rx(PI/2))})}});
screwModel(110,{summary:'Traverse motion for winding thread onto spools: the guide nut runs one way along the screw and back the other, so the thread is laid evenly from end to end.',th:(g,sim)=>sim?sim.x/16*TAU:0});
screwModel(111,{summary:'The differential (micrometer) screw: one rod has two threads of different pitch. It screws through the fixed nut with one and carries the moving nut with the other, so each turn moves the carriage by only the difference of the pitches: very fine and very strong.',k:0.15});
screwModel(266,{summary:'Two screws of different pitch on one spindle: one works in the fixed frame, the other in the moving bearing, so each turn moves the bearing by only the difference of the pitches.',k:0.15});
screwModel(285,{summary:'A screw moving the lathe spindle along: each turn advances it by the pitch.'});
/* ---------- 104 screw and worm wheel ---------- */
{const m=2,p=PI*m,rp=6,Zw=30,Rw=m*Zw/2,Hw=U.BT+12,Hc=Hw+rp+Rw,lam=Math.atan(p/(TAU*rp)),hw=8;
 PK.defS(104,{summary:'An endless screw (worm) turns a toothed wheel; every turn of the screw moves the wheel on one tooth. Brown notes it also works the other way in some lathes, the wheel driving a slide through the screw.',cam:{yaw:-2.4,pitch:0.35},
  base:()=>[U.plate(-38,-20,38,46),U.wall(-2*p-4,0,'x',[[0,Hw]],18,5,Hw+6),U.wall(2*p+4,0,'x',[[0,Hw]],18,5,Hw+6),U.wall(0,14,'y',[[0,Hc]],18),U.wall(0,38,'y',[[0,Hc]],18)],
  parts:[{id:'wm',name:'Screw (worm)',role:'driver',mesh:U.worm(rp,p,4*p)},{id:'wh',name:'Wheel, 30 teeth',role:'driven',mesh:U.helical(Rw,Zw,hw,-hw*Math.tan(lam)/Rw,{seg:3})},{id:'sw',name:'Screw shaft',mesh:U.shaft(4*p+30)},{id:'sh',name:'Wheel shaft',mesh:U.shaft(50)},{id:'k',name:'Hand crank',role:'driver',mesh:U.crank()}],
  pose(phi){const w=phi/Zw;return{wm:U.at([-2*p,0,Hw],[1,0,0],phi,[0,0,1]),wh:U.at([0,-hw/2,Hc],[0,1,0],w,[0,0,-1]),sw:U.shaftAt([-5,0,Hw],[1,0,0],phi),sh:U.shaftAt([0,21,Hc],[0,1,0],w),k:U.at([-2*p-14,0,Hw],[-1,0,0],-phi,[0,0,1])};},drive:'Turn the crank: thirty turns of the screw turn the wheel once.'});}
/* ---------- 105 screw press ---------- */
{const p=6,rp=6,L=70,B=U.BT;
 PK.defS(105,{summary:'The screw press: the screw works through a nut in the crosshead; turning the bar drives the screw and its platen down with great force.',cam:{yaw:0.5,pitch:0.3},
  base:()=>[U.plate(-44,-22,44,22),K.box(10,20,B,90,-36,0),K.box(10,20,B,90,36,0),K.box(52,30,B,B+6,0,0)],
  parts:[{id:'sc',name:'Press screw',role:'driver',mesh:U.worm(rp,p,L)},{id:'n',name:'Crosshead with nut',role:'frame',mesh:K.merge(U.nut(rp,p,12,26,20),K.box(82,20,0,12,0,0))},{id:'pl',name:'Platen',role:'driven',mesh:K.merge(K.box(60,20,0,6,0,0),K.cyl(4,6,12,24))},{id:'bar',name:'Turning bar',role:'driver',mesh:K.merge(K.box(70,6,0,6,0,0),K.prism(U.octa(U.SH+0.12),[],0,0.01))},{id:'s',name:'Shaft through the screw',mesh:U.shaft(L+14)}],
  pose(phi,g){const th=g.th||0,d=-(g.d||0)*0.2;const z0=24-d;return{sc:K.M4.mul(K.M4.T(0,0,z0),K.M4.Rz(th)),n:K.M4.T(0,0,90),pl:K.M4.T(0,0,z0-12),bar:K.M4.mul(K.M4.T(0,0,z0+L),K.M4.Rz(th)),s:U.shaftAt([0,0,z0+L/2],[0,0,1],th)};},drive:'Turn the bar: the platen screws down.'});}
/* ---------- 108 barrel cam with crossing grooves ---------- */
{const R=14,L=60,A=22,w=3.2,dep=2.2,Hs=U.BT+R+6;const zc=t=>L/2+A*(1-4*Math.abs(((t/TAU)%1+1)%1-0.5));/* triangle wave over one turn */
 const drum=(()=>{const secs=[],n=120;for(let z=0;z<=L+1e-9;z+=0.6){const ring=[];for(let i=0;i<n;i++){const t=i/n*TAU;const d1=Math.abs(z-zc(t)),d2=Math.abs(z-zc(t+PI));const dd=Math.min(d1,d2);const r=dd<w/2?R-dep:dd<w/2+0.6?R-dep*(1-(dd-w/2)/0.6):R;ring.push([r*Math.cos(t),r*Math.sin(t),z]);}
   secs.push({o:ring,h:[(()=>{const o=U.octa(U.SH+0.12),q=[];for(let a=0;a<8;a++){const P=o[a],Q=o[(a+1)%8];for(let j=0;j<15;j++)q.push([P[0]+(Q[0]-P[0])*j/15,P[1]+(Q[1]-P[1])*j/15]);}return q;})().map(q=>[q[0],q[1],z])]});}return K.loftS(secs);})();
 PK.defS(108,{summary:'A cylinder with a right-hand and a left-hand groove that cross twice each turn. A pin follower in the groove runs from one end to the other and back again with uniform speed, without ever reversing the cylinder.',cam:{yaw:0.5,pitch:0.45},
  base:()=>[U.plate(-L/2-24,-24,L/2+24,24),U.wall(-L/2-6,0,'x',[[0,Hs]],18,5,Hs+8),U.wall(L/2+6,0,'x',[[0,Hs]],18,5,Hs+8),U.wall(-L/2-6,-16,'x',[[0,Hs+R+6]],10,5),U.wall(L/2+6,-16,'x',[[0,Hs+R+6]],10,5)],
  parts:[{id:'d',name:'Grooved barrel',role:'driver',mesh:drum},{id:'s',name:'Shaft',mesh:U.shaft(L+40)},{id:'f',name:'Follower with pin',role:'driven',mesh:K.merge(K.box(10,22,0,6,0,8),K.cyl(1.3,-3,0.01,12))},{id:'r',name:'Guide rod',mesh:U.shaft(L+30)},{id:'k',name:'Hand crank',role:'driver',mesh:U.crank()}],
  pose(phi){const x=-L/2+zc(-phi+PI/2)+0*phi;return{d:U.at([-L/2,0,Hs],[1,0,0],phi,[0,0,1]),s:U.shaftAt([0,0,Hs],[1,0,0],phi),f:K.M4.T(x,0,Hs+R-dep+1),r:U.shaftAt([0,-16,Hs+R+6],[1,0,0],0),k:U.at([-L/2-16,0,Hs],[-1,0,0],-phi,[0,0,1])};},drive:'Turn the crank one way and watch the follower travel back and forth.'});}
/* ---------- 112 Persian drill ---------- */
{const lead=26,rp=4,L=80;
 PK.defS(112,{summary:'The Persian drill: the stock has a very steep thread and turns freely in its head. Sliding the button up and down the stock spins it first one way and then the other.',cam:{yaw:0.5,pitch:0.25},
  base:()=>[U.plate(-24,-24,24,24),U.post(0,0,U.BT+8,U.BT+3)],
  parts:[{id:'st',name:'Drill stock (steep thread)',role:'driven',mesh:U.worm(rp,lead,L,{depth:1.6})},{id:'b',name:'Button (nut)',role:'driver',mesh:U.nut(rp,lead,8,16,16,{depth:1.6})},{id:'h',name:'Head (turns freely on top)',role:'frame',mesh:K.lathe([[2.4,0],[8,0],[8,6],[2.4,6]],40)}],
  pose(phi,g){const a=(g.a||0)*TAU,y=(g.y||0);return{st:K.M4.mul(K.M4.T(0,0,U.BT+3),K.M4.Rz(a)),b:K.M4.T(0,0,U.BT+18+y*44),h:K.M4.T(0,0,U.BT+3+L+0.5)};},drive:'Hold the head, slide the button up and down: the stock spins back and forth.'});}
/* ---------- 96 heart cam with a roller follower ---------- */
{const sim=window.MB.SIMS[96],O=sim.O;const heart=[];for(let i=0;i<240;i++){const s=i/240*TAU-PI;const r=sim.r(s);heart.push([r*Math.cos(s),r*Math.sin(s)]);}
 PK.def(96,{S:0.3,summary:'A heart-shaped cam whose outline is laid out so that the follower rises and falls at a perfectly even speed: equal turns of the cam give equal movement of the follower.',
  parts:[{id:'c',name:'Heart cam',role:'driver',layer:0,shape:pxPoly(heart),bosses:[[-30,0,12,3.5]]},{id:'f',name:'Follower rod',role:'driven',layer:1,shape:S=>({o:[[-8,0],[8,0],[8,-200],[-8,-200]],h:[S.hole(0,0)]}),pins:[[0,0,1]]},{id:'r',name:'Follower roller',role:'link',layer:0,shape:S=>S.disk(13)}],
  ground:[[O[0],O[1],0,0]],fixed:[{shape:S=>S.rect(10,30,O[0]-22,105),l1:1},{shape:S=>S.rect(10,30,O[0]+22,105),l1:1}],
  pose(g){const y=O[1]-g.h-14;return{c:[O[0],O[1],g.phi],f:[O[0],y,0],r:[O[0],y,0]};},drive:'Turn the cam by its knob: the follower moves up and down at an even pace.'});}
/* ---------- 97, 106, 107 grooved heart cam ---------- */
for(const n of [97,106,107]){const sim=window.MB.SIMS[n];if(!sim||!sim.r)continue;const O=sim.O;const ctr=[];for(let i=0;i<240;i++){const s=i/240*TAU-PI,r=sim.r(s);ctr.push([r*Math.cos(s),r*Math.sin(s)]);}
 PK.def(n,{S:0.3,summary:'The heart cam cut as a groove in a disk: the follower’s pin runs in the groove, so the cam drives it both up and down and no spring or weight is needed.',
  parts:[{id:'c',name:'Disk with heart-shaped groove',role:'driver',layer:0,mesh:groovedPlate(Sh.circle(170,120),ctr,20),bosses:[[150,0,8,3.5]]},{id:'f',name:'Follower rod',role:'driven',layer:1,shape:S=>({o:[[-9,8],[9,8],[9,-190],[-9,-190]],h:[S.hole(0,0)]})},{id:'pg',name:'Follower pin (glue into the rod)',role:'small',layer:0,mesh:K.cyl(2.6,1.4,PK.TH+PK.GAP+PK.TH,20)}],
  ground:[[O[0],O[1],0,0]],fixed:[{shape:S=>S.rect(10,40,O[0]-24,100),l1:1},{shape:S=>S.rect(10,40,O[0]+24,100),l1:1}],
  pose(g){const y=O[1]-g.h;return{c:[O[0],O[1],g.phi],f:[O[0],y,0],pg:[O[0],y,0]};},drive:'Turn the disk by its knob.'});}
/* ---------- 98 crank pin in an endless groove in the swinging arm ---------- */
{const sim=window.MB.SIMS[98],D=sim.D,Q=sim.Q,G=sim.groove();const hull=K.hull(G.flatMap(p=>[0,1,2,3,4,5,6,7].map(k=>[p[0]+22*Math.cos(k*PI/4),p[1]+22*Math.sin(k*PI/4)])).concat(Sh.circle(20,16)));
 PK.def(98,{S:0.3,summary:'The crank pin runs in an endless groove cut in the swinging arm. The groove is shaped (here from the swing we chose) so that the arm swings irregularly as the crank turns steadily.',
  parts:[{id:'d',name:'Crank disk with pin',role:'driver',layer:0,shape:S=>S.disk(sim.rp+30),bosses:[[sim.rp,0,PK.TH+PK.GAP+PK.TH-1,2.4],[-60,0,14,3.5]]},{id:'a',name:'Grooved arm (groove faces down)',role:'driven',layer:1,mesh:K.xf(groovedPlate(hull.map(([x,y])=>[x,-y]),G.map(([x,y])=>[x,-y]),18),K.M4.mul(K.M4.T(0,0,PK.TH),K.M4.Rx(PI)))}],
  ground:[[D[0],D[1],0,0],[Q[0],Q[1],1,1]],pose(g){return{d:[D[0],D[1],g.phi],a:[Q[0],Q[1],g.a]};},drive:'Turn the crank disk by its knob.'});}
/* ---------- 99 spiral groove and lever ---------- */
{const sim=window.MB.SIMS[99];if(sim&&sim.o&&sim.o.r){const F=sim.F,O=[300,290],ctr=[];for(let i=0;i<240;i++){const t=i/240*TAU,r=sim.o.r(t);ctr.push([r*Math.cos(t),r*Math.sin(t)]);}
 PK.def(99,{S:0.3,summary:'A groove on the face of the disk shaped as a spiral with a quick drop: the lever’s pin runs in it, giving a slow feed and a quick return, as on a drilling machine.',
  parts:[{id:'c',name:'Disk with spiral groove',role:'driver',layer:0,mesh:groovedPlate(Sh.circle(150,120),ctr,16),bosses:[[130,0,8,3.5]]},{id:'l',name:'Lever',role:'driven',layer:1,shape:S=>S.bar(sim.L+80,14,[0])},{id:'pg',name:'Lever pin (glue in)',role:'small',layer:0,mesh:K.cyl(2.3,1.4,PK.TH+PK.GAP+PK.TH,20)}],
  ground:[[O[0],O[1],0,0],[F[0],F[1],1,1]],pose(g){return{c:[O[0],O[1],g.phi],l:[F[0],F[1],g.ang],pg:[g.pin[0],g.pin[1],0]};},drive:'Turn the disk by its knob.'});}}
/* ---------- 100 quick return, 101 slotted swinging bar ---------- */
{const sim=window.MB.SIMS[100],O1=sim.O1,O2=sim.O2,yr=sim.yr,r=sim.P.r,Ll=O1[1]-yr+30;
 PK.def(100,{S:0.28,summary:'The quick-return motion of a shaping machine: the crank pin’s block slides in a slotted lever pivoted below. The ram is driven slowly on the cutting stroke, while the crank goes round the long way, and fast on the return.',
  parts:[{id:'w',name:'Crank wheel with pin',role:'driver',layer:0,shape:S=>S.disk(r+24),pins:[[r,0,1]],bosses:[[-r,0,14,3.5]]},{id:'b',name:'Sliding block',role:'link',layer:1,shape:S=>S.rect(30,18,0,0,[[0,0]])},
    {id:'l',name:'Slotted lever',role:'link',layer:1,t:1,shape:S=>({o:[[-14,14],[14,14],[14,-Ll],[-14,-Ll]],h:[S.hole(0,0),S.slotPts(0,-(O1[1]-O2[1]-r-15),0,-(O1[1]-O2[1]+r+15),20),S.slotPts(0,-Ll+44,0,-Ll+14,(PK.BORER*2+0.6)/0.28)]})},
    {id:'ram',name:'Ram with pin',role:'driven',layer:0,shape:S=>S.rect(440,28,-30,0,[]),pins:[[0,0,1]]}],
  ground:[[O2[0],O2[1],0,0],[O1[0],O1[1],1,1]],fixed:[{shape:S=>S.rect(60,8,120,yr-20),l1:0},{shape:S=>S.rect(60,8,120,yr+20),l1:0},{shape:S=>S.rect(60,8,680,yr-20),l1:0},{shape:S=>S.rect(60,8,680,yr+20),l1:0}],
  pose(g){return{w:[O2[0],O2[1],g.phi],b:[g.P[0],g.P[1],g.l-PI/2],l:[O1[0],O1[1],g.l],ram:[g.xr,yr,0]};},drive:'Turn the crank wheel by its knob: the ram creeps one way and rushes back.'});}
{const sim=window.MB.SIMS[101],P0=sim.P0,O=sim.O,r=sim.r,yb=sim.yb,Lb=yb-P0[1]+50;
 PK.def(101,{S:0.28,summary:'A slotted bar hangs from a pivot above. The crank pin slides in its slot, swinging it to and fro, and a pin on the horizontal bar in the lower slot is driven straight back and forth.',
  parts:[{id:'w',name:'Crank disk with pin',role:'driver',layer:0,shape:S=>S.disk(r+22),pins:[[r,0,1]],bosses:[[-r,0,14,3.5]]},{id:'b',name:'Sliding block',role:'link',layer:1,shape:S=>S.rect(28,18,0,0,[[0,0]])},
    {id:'l',name:'Slotted swinging bar',role:'link',layer:1,shape:S=>({o:[[-14,-14],[14,-14],[14,Lb],[-14,Lb]],h:[S.hole(0,0),S.slotPts(0,O[1]-P0[1]-r-15,0,O[1]-P0[1]+r+15,20),S.slotPts(0,Lb-70,0,Lb-14,(PK.BORER*2+0.6)/0.28)]})},
    {id:'bar',name:'Horizontal bar with pin',role:'driven',layer:0,shape:S=>S.rect(560,24,0,0,[]),pins:[[0,0,1]]}],
  ground:[[O[0],O[1],0,0],[P0[0],P0[1],1,1]],fixed:[{shape:S=>S.rect(48,8,80,yb-18),l1:0},{shape:S=>S.rect(48,8,80,yb+18),l1:0},{shape:S=>S.rect(48,8,720,yb-18),l1:0},{shape:S=>S.rect(48,8,720,yb+18),l1:0}],
  pose(g){return{w:[O[0],O[1],g.phi],b:[g.pin[0],g.pin[1],-g.a+PI/2],l:[P0[0],P0[1],-g.a],bar:[g.x,yb,0]};},drive:'Turn the crank disk by its knob.'});}
/* ---------- 113 rack and pinion, 114 part pinion in a double rack frame, 115 two wheels on a double rack, 84 cam-shifted frame ---------- */
{const P=[400,220],m=6,y=P[1]+60;PK.def(113,{S:0.3,summary:'Rack and pinion: turning the 20-tooth pinion moves the rack straight; pushing the rack turns the pinion.',
  parts:[{id:'p',name:'Pinion, 20 teeth',role:'driver',layer:0,shape:S=>S.gear(60,20),bosses:[[36,0,14,3.5]]},{id:'r',name:'Rack',role:'driven',layer:0,shape:S=>{const R=S.rack(-300,300,m,28,{c0:0});return{o:R.o,h:[]};}}],
  ground:[[P[0],P[1],0,0]],fixed:[{shape:S=>S.rect(620,8,400,y+1.25*m+28+6),l1:0}],
  pose(g){return{p:[P[0],P[1],g.th+PI/2+PI/20],r:[400+g.x,y,0]};},drive:'Turn the pinion by its knob, or slide the rack.'});}
{const P=[400,260],r=50,m=5;
 for(const n of [114,199])PK.def(n,{S:0.3,summary:'A pinion with teeth on half its rim works inside a frame with a rack along the top and another along the bottom. It drives the frame one way with the upper rack, then the other way with the lower: steady turning becomes straight back-and-forth motion.',
  parts:[{id:'p',name:'Half-toothed pinion',role:'driver',layer:0,shape:S=>{const o=S.gearOutline(r,20),rr=r-1.25*m;return{o:o.map(q=>{const t=Math.atan2(q[1],q[0]);if(Math.sin(t)<=0.02)return q;const R=Math.min(Math.hypot(q[0],q[1]),rr);return[R*Math.cos(t),R*Math.sin(t)];}),h:[S.hole(0,0)]};},bosses:[[0,-25,14,3.5]]},
    {id:'f',name:'Double rack frame',role:'driven',layer:0,shape:S=>{const xl=140,xr=660,c0=400,up=S.rack(-260,260,m,0,{c0:0,down:true}),lo=S.rack(-260,260,m,0,{c0:0});return{o:[[xl-16-400,-r-36],[xr+16-400,-r-36],[xr+16-400,r+36],[xl-16-400,r+36]],h:[[[-260,-r+1.25*m],[260,-r+1.25*m],[260,r-1.25*m],[-260,r-1.25*m]]]};}},
    {id:'tr',name:'Upper rack strip (glue in the frame)',role:'driven',layer:0,shape:S=>{const R=S.rack(-260,260,m,10,{c0:0,down:true});return{o:R.o,h:[]};}},{id:'br',name:'Lower rack strip (glue in the frame)',role:'driven',layer:0,shape:S=>{const R=S.rack(-260,260,m,10,{c0:0});return{o:R.o,h:[]};}}],
  ground:[[P[0],P[1],0,0]],fixed:[{shape:S=>S.rect(40,8,60,P[1]-r-46),l1:0},{shape:S=>S.rect(40,8,60,P[1]+r+46),l1:0}],
  pose(g){return{p:[P[0],P[1],g.phi],f:[P[0]+g.x,P[1],0],tr:[P[0]+g.x,P[1]-r,0],br:[P[0]+g.x,P[1]+r,0]};},drive:'Turn the pinion by its knob.'});}
{const R=60,Z=24,m=2*R/Z,y0=270;PK.def(115,{S:0.3,summary:'Two equal wheels, one above and one below, drive a rack toothed on both edges. Each side of the rack gets the same force and speed.',
  parts:[{id:'a',name:'Upper wheel',role:'driver',layer:0,shape:S=>S.gear(R,Z),bosses:[[36,0,14,3.5]]},{id:'b',name:'Lower wheel',role:'driver',layer:0,shape:S=>S.gear(R,Z)},
    {id:'r',name:'Double rack',role:'driven',layer:0,shape:S=>{const L=230,up=S.rack(-L,L,m,0,{c0:0}).o.filter((p,i,a)=>i<a.length-2),dn=S.rack(-L,L,m,0,{c0:0,down:true}).o;return{o:[...up.map(([x,yy])=>[x,yy-18]),...dn.filter((p,i,a)=>i<a.length-2).map(([x,yy])=>[x,yy+18]).reverse()],h:[]};}}],
  ground:[[400,y0-R-18,0,0],[400,y0+R+18,0,0]],fixed:[{shape:S=>S.rect(30,8,120,y0-24),l1:0},{shape:S=>S.rect(30,8,120,y0+24),l1:0},{shape:S=>S.rect(30,8,680,y0-24),l1:0},{shape:S=>S.rect(30,8,680,y0+24),l1:0}],
  pose(g){const a=g.x/R;return{a:[400,y0-R-18,a+PI/2],b:[400,y0+R+18,-a+PI/2+PI/Z],r:[400+g.x,y0,0]};},drive:'Turn one wheel by its knob; the rack slides and turns the other.'});}
for(const n of [84,139]){const sim=window.MB.SIMS[n];const P=[400,270],rp=50,m=5;
 PK.def(n,{S:0.3,summary:n===84?'A frame with a rack on the inside of its top and another on its bottom hangs from a rod. Raising or lowering the rod puts the turning pinion into one rack or the other (or neither), so the frame is driven left, right or not at all: Brown’s link from a governor to a throttle.':'A pinion works inside a frame with racks top and bottom; the frame rises and falls so the pinion engages each rack in turn and drives it back and forth.',
  parts:[{id:'p',name:'Pinion, 20 teeth',role:'driver',layer:0,shape:S=>S.gear(rp,20),bosses:[[30,0,14,3.5]]},{id:'f',name:'Rack frame',role:'driven',layer:0,shape:S=>({o:[[-260,-rp-50],[260,-rp-50],[260,rp+56],[-260,rp+56]],h:[[[-250,-rp-6.25],[250,-rp-6.25],[250,rp+12+6.25],[-250,rp+12+6.25]]]})},
    {id:'tr',name:'Upper rack (glue in)',role:'driven',layer:0,shape:S=>({o:S.rack(-250,250,m,4,{c0:0,down:true}).o,h:[]})},{id:'br',name:'Lower rack (glue in)',role:'driven',layer:0,shape:S=>({o:S.rack(-250,250,m,4,{c0:0}).o,h:[]})}],
  ground:[[P[0],P[1],0,0]],
  pose(g){const dy=g.top?0:-12,c=g.top?0:PI*m/2;return{p:[P[0],P[1],g.phi],f:[P[0]+g.x,P[1]+dy,0],tr:[P[0]+g.x+c,P[1]+dy-rp,0],br:[P[0]+g.x+c,P[1]+dy+rp+12,0]};},drive:'Turn the pinion; shift the frame up or down to change which rack it drives.'});}
