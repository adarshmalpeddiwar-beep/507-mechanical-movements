/* ===== printable models 25–50 ===== */
const U=PK.U,{Sh}=PK;
const v2=(a)=>[Math.cos(a),Math.sin(a),0];
/* two bevel gears on level shafts meeting at angle SG in plan; driver along +x toward the apex */
function bevelPair(n,o){const ZA=o.ZA,ZB=o.ZB,m=o.m||2,SG=o.SG||PI/2,RA=m*ZA/2,RB=m*ZB/2,dA=Math.atan2(Math.sin(SG),ZB/ZA+Math.cos(SG)),dB=SG-dA,f=o.f||9;
  const Hc=Math.max(RA,RB)+m*1.25+10+U.BT,O=[0,0,Hc],eA=v2(PI),eB=v2(PI+SG),c=v2(PI+dA);
  const perp=(e)=>{const d=c[0]*e[0]+c[1]*e[1];const v=[c[0]-d*e[0],c[1]-d*e[1],0],l=Math.hypot(v[0],v[1]);return[v[0]/l,v[1]/l,0];};const uA=perp(eA),uB=perp(eB);
  const LA=RA/Math.tan(dA),LB=RB/Math.tan(dB),zA=f*Math.cos(dA),zB=f*Math.cos(dB);
  const P=(e,L)=>[O[0]+e[0]*L,O[1]+e[1]*L,Hc];const wallsA=[LA+4.5,LA+34],wallsB=[LB+4.5,LB+34];
  const base=()=>{const ms=[];const pts=[];for(const [e,ws,th] of [[eA,wallsA,PI],[eB,wallsB,PI+SG]])for(const w of ws){const q=P(e,w);ms.push(U.wall(q[0],q[1],th,[[0,Hc]],18));pts.push(q);}
    pts.push(P(eA,LA-RA),P(eB,LB-RB),[O[0]+RA,O[1],0],[O[0],O[1]+RB,0]);const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);ms.unshift(U.plate(Math.min(...xs)-14,Math.min(...ys)-14,Math.max(...xs)+14,Math.max(...ys)+14));return ms;};
  const sA=44+zA,sB=40+zB;
  PK.defS(n,{summary:o.summary,cam:{yaw:0.75,pitch:0.42},base,
    parts:[{id:'ga',name:`Driving bevel, ${ZA} teeth`,role:'driver',mesh:U.bevel(RA,ZA,dA,f)},{id:'gb',name:`Driven bevel, ${ZB} teeth`,role:'driven',mesh:U.bevel(RB,ZB,dB,f)},
      {id:'sa',name:'Driving shaft',role:'link',mesh:U.shaft(sA)},{id:'sb',name:'Driven shaft',role:'link',mesh:U.shaft(sB)},
      {id:'k',name:'Hand crank',role:'driver',mesh:U.crank()},{id:'col',name:'Collar',role:'small',qty:2,mesh:U.collar(),note:'push onto each shaft outside the far bearing'},
      {id:'ind',name:'Pointer disc',role:'driven',mesh:U.collar(9,3),note:'on the driven shaft so its turning is easy to see'}],
    pose(phi){const a=phi,b=-phi*ZA/ZB+PI/ZB;const nA=[-eA[0],-eA[1],0],nB=[-eB[0],-eB[1],0];
      const cA=P(eA,LA-zA+sA/2),cB=P(eB,LB-zB+sB/2);
      return{ga:U.at(P(eA,LA),nA,a,uA),gb:U.at(P(eB,LB),nB,b,uB),sa:U.shaftAt(cA,nA,a),sb:U.shaftAt(cB,nB,b),k:U.at(P(eA,LA+46),eA,-a,uA),
        col:[U.at(P(eA,LA+37),eA,-a),U.at(P(eB,LB+37),eB,-b)],ind:U.at(P(eB,LB+41),eB,-b,uB)};},
    read(phi){return`driver ${Math.round(phi*180/PI)%360}° · driven ${Math.round(phi*ZA/ZB*180/PI)%360}° (${ZA}:${ZB})`;},
    drive:'Turn the crank: the driven shaft turns at '+(ZA/ZB).toFixed(2)+' × the speed, at '+Math.round(SG*180/PI)+'° to it.'});}
bevelPair(25,{ZA:20,ZB:28,summary:'Two printed bevel gears on level shafts at right angles. Their pitch cones meet at one point, the apex, so the teeth roll on each other all the way along. Turn the crank and the second shaft turns at 20/28 of the speed.'});
bevelPair(42,{ZA:18,ZB:27,SG:PI/3,f:8,summary:'Bevel gears for shafts meeting at 60°. The cone angles are worked out so that both pitch cones still share one apex; the gears mesh exactly like the right-angle pair.'});
/* 26 crown wheel and pinion */
{const m=2,Zc=40,Rc=40,Zp=12,Rp=12,z0=U.BT+1.5,zP=z0+4+2.5+Rp;
 const crown=()=>{const ms=[K.prism(K.circle(Rc+6,96),[K.circle(U.SHB,32)],0,4)],hw0=PI*m/4+1.25*m*Math.tan(20*PI/180),hw1=PI*m/4-m*Math.tan(20*PI/180);
   for(let k=0;k<Zc;k++){const t=(k+0.5)*TAU/Zc,c=Math.cos(t),s=Math.sin(t);ms.push(K.xf(K.prism([[-hw0,-0.2],[hw0,-0.2],[hw1,2.25*m],[-hw1,2.25*m]],[],Rc-6,Rc+6),[-s,c,0,0, 0,0,1,0, c,s,0,0, 0,0,4,1]));}return K.merge(...ms);};
 PK.defS(26,{summary:'A crown wheel, its teeth standing up on the face, turns on a pin. A 12-tooth spur pinion on a level shaft meshes with them at the rim. Crown wheels suit light work because the teeth must be thin at the inner end.',cam:{yaw:0.6,pitch:0.5},
  base:()=>[U.plate(-Rc-14,-Rc-14,Rc+60,Rc+14),U.post(0,0,z0+4+0.5+3,z0-0.5),U.wall(Rc+14,0,'x',[[0,zP]]),U.wall(Rc+40,0,'x',[[0,zP]])],
  parts:[{id:'c',name:'Crown wheel, 40 teeth',role:'driven',mesh:crown()},{id:'p',name:'Spur pinion, 12 teeth',role:'driver',mesh:U.spur(Rp,Zp,8)},{id:'s',name:'Pinion shaft',mesh:U.shaft(56)},
    {id:'k',name:'Hand crank',role:'driver',mesh:U.crank()},{id:'col',name:'Collar',role:'small',mesh:U.collar()},{id:'cap',name:'Pin cap',role:'small',mesh:U.capMesh()}],
  pose(phi){const ac=phi*Zp/Zc;return{c:K.M4.mul(K.M4.T(0,0,z0),K.M4.Rz(ac)),p:U.at([Rc-4,0,zP],[1,0,0],phi,[0,0,-1]),s:U.shaftAt([Rc-4+28,0,zP],[1,0,0],phi),k:U.at([Rc+54,0,zP],[1,0,0],phi,[0,0,-1]),col:U.at([Rc+20,0,zP],[1,0,0],phi),cap:K.M4.T(0,0,z0+4+0.5)};},
  read:phi=>`pinion ${Math.round(phi*180/PI)%360}° · crown wheel ${(phi*Zp/Zc*180/PI%360).toFixed(0)}° (12:40)`,drive:'Turn the crank: the crown wheel turns 12/40 of a turn for each turn of the pinion.'});}
/* 28 friction disk: slide the wheel along its shaft to change the speed */
{const R=60,z0=U.BT+1.5,zt=z0+4,rw=12,zw=zt+rw+0.8;
 const wheel=K.lathe([[U.SH+0.15,0],[rw-0.4,0],[rw-0.4,1.6],[rw-1.4,2.4],[rw-1.4,3.6],[rw-0.4,4.4],[rw-0.4,6],[U.SH+0.15,6]],64);
 PK.defS(28,{summary:'A flat disk turns on a pin; a small rubber-tyred wheel rests on its face, on an octagonal shaft it can slide along. The farther out the wheel sits, the faster it turns: speed = distance from centre ÷ wheel radius.',cam:{yaw:0.5,pitch:0.55},
  params:[{id:'d',label:'Wheel distance from centre',min:30,max:190,step:5,value:120,fmt:v=>(v*0.3).toFixed(0)+' mm'}],
  base:()=>[U.plate(-R-12,-R-12,R+50,R+12),U.post(0,0,zt+3.5,z0-0.5),U.wall(R+12,0,'x',[[0,zw]]),U.wall(R+38,0,'x',[[0,zw]])],
  parts:[{id:'d',name:'Driving disk',role:'driver',mesh:K.merge(K.prism(K.circle(R,96),[K.circle(U.SHB,32)],0,4),K.cyl(3,4,14,20,R-8,0))},{id:'w',name:'Friction wheel (fit an O-ring in the groove)',role:'driven',mesh:wheel},
    {id:'s',name:'Wheel shaft',mesh:U.shaft(R+46)},{id:'col',name:'Collar',role:'small',mesh:U.collar()},{id:'ind',name:'Pointer disc',role:'driven',mesh:U.collar(9,3)},{id:'cap',name:'Pin cap',role:'small',mesh:U.capMesh()}],
  pose(phi,g,sim,P){const d=Math.min(R-rw/2,(P.d||120)*0.3),w=phi*(P.d||120)/40;return{d:K.M4.mul(K.M4.T(0,0,z0),K.M4.Rz(phi)),w:U.at([d-3,0,zw],[1,0,0],w,[0,0,-1]),s:U.shaftAt([(R+46)/2+2,0,zw],[1,0,0],w),col:U.at([R+18,0,zw],[1,0,0],w),ind:U.at([R+44,0,zw],[1,0,0],w,[0,0,-1]),cap:K.M4.T(0,0,zt+0.5)};},
  hardware:['A rubber O-ring about 22 mm across, 2 mm cord, for the wheel’s groove.'],read:(phi)=>`disk ${Math.round(phi*180/PI)%360}°`,drive:'Turn the disk by its knob; slide the wheel in or out along the shaft and feel the speed change.'});}
/* 29 spiral (scroll) on the disk face drives a spur wheel one tooth per turn */
{const m=2,p=PI*m,r0=10,turns=5,R=r0+turns*p+6,z0=U.BT+1.5,zt=z0+4,Zw=18,Rw=m*Zw/2,rc=r0+3.5*p,zw=zt+2.5+Rw;
 const rib=()=>{const w=p*0.42,N=turns*90,o=[],i=[];for(let k=0;k<=N;k++){const s=k/N*turns*TAU,r=r0+p*s/TAU;o.push([(r+w/2)*Math.cos(s),(r+w/2)*Math.sin(s)]);i.push([(r-w/2)*Math.cos(s),(r-w/2)*Math.sin(s)]);}return K.prism(o.concat(i.reverse()),[],3.8,4+2.25*m);};
 PK.defS(29,{summary:'A raised spiral (a scroll, like a lathe chuck’s) on the face of the disk meshes with a spur wheel on a level shaft. Each turn of the disk moves the spiral in by one pitch, so the wheel advances exactly one tooth per turn.',cam:{yaw:0.55,pitch:0.6},
  base:()=>[U.plate(-R-10,-R-10,R+10,R+38),U.post(0,0,zt+3.5,z0-0.5),U.wall(rc,R+4,'y',[[0,zw]]),U.wall(rc,R+28,'y',[[0,zw]])],
  parts:[{id:'d',name:'Spiral disk',role:'driver',mesh:K.merge(K.prism(K.circle(R,120),[K.circle(U.SHB,32)],0,4),rib(),K.cyl(3,4,16,20,R-3.5,0))},{id:'w',name:'Spur wheel, 18 teeth',role:'driven',mesh:U.spur(Rw,Zw,6)},
    {id:'s',name:'Wheel shaft',mesh:U.shaft(R+36)},{id:'col',name:'Collar',role:'small',mesh:U.collar()},{id:'ind',name:'Pointer disc',role:'driven',mesh:U.collar(9,3)},{id:'cap',name:'Pin cap',role:'small',mesh:U.capMesh()}],
  pose(phi){const w=phi/Zw;return{d:K.M4.mul(K.M4.T(0,0,z0),K.M4.Rz(phi)),w:U.at([rc,-3,zw],[0,1,0],w,[0,0,-1]),s:U.shaftAt([rc,(R+36)/2-3,zw],[0,1,0],w),col:U.at([rc,R+10,zw],[0,1,0],w),ind:U.at([rc,R+34,zw],[0,1,0],w,[0,0,-1]),cap:K.M4.T(0,0,zt+0.5)};},
  read:phi=>`disk ${(phi/TAU).toFixed(2)} turns · wheel ${(phi/TAU/Zw*Zw).toFixed(2)} teeth`,drive:'Turn the disk by its knob: the wheel moves on one tooth per turn.'});}
/* 31 worm and worm wheel */
{const m=2,p=PI*m,rp=6,Zw=30,Rw=m*Zw/2,Hw=U.BT+12,Hc=Hw+rp+Rw,lam=Math.atan(p/(TAU*rp)),hw=8;
 for(const n of [31,202])PK.defS(n,{summary:n===202?'Brown’s modified worm and wheel: a single-start worm on a level shaft turns a 30-tooth wheel whose teeth lie along the thread, one tooth per turn of the worm, a steady and powerful 30 : 1 drive that cannot run backwards.':'A single-start worm on a level shaft drives a 30-tooth wheel above it. The wheel’s teeth are set at the worm’s lead angle so they lie along the thread. One turn of the worm moves the wheel one tooth: a 30 : 1 reduction that the wheel cannot drive backwards.',cam:{yaw:0.7,pitch:0.35},
  base:()=>[U.plate(-38,-20,38,46),U.wall(-2*p-4,0,'x',[[0,Hw]],18,5,Hw+6),U.wall(2*p+4,0,'x',[[0,Hw]],18,5,Hw+6),U.wall(0,14,'y',[[0,Hc]],18),U.wall(0,38,'y',[[0,Hc]],18)],
  parts:[{id:'wm',name:'Worm (single start)',role:'driver',mesh:U.worm(rp,p,4*p)},{id:'wh',name:'Worm wheel, 30 teeth',role:'driven',mesh:U.helical(Rw,Zw,hw,-hw*Math.tan(lam)/Rw,{seg:3})},
    {id:'sw',name:'Worm shaft',mesh:U.shaft(4*p+30)},{id:'sh',name:'Wheel shaft',mesh:U.shaft(50)},{id:'k',name:'Hand crank',role:'driver',mesh:U.crank()},{id:'col',name:'Collar',role:'small',qty:2,mesh:U.collar()}],
  pose(phi){const w=phi/Zw;return{wm:U.at([-2*p,0,Hw],[1,0,0],phi,[0,0,1]),wh:U.at([0,-hw/2,Hc],[0,1,0],w,[0,0,-1]),sw:U.shaftAt([-5,0,Hw],[1,0,0],phi),sh:U.shaftAt([0,21,Hc],[0,1,0],w),
    k:U.at([-2*p-14,0,Hw],[-1,0,0],-phi,[0,0,1]),col:[U.at([2*p+8,0,Hw],[1,0,0],phi),U.at([0,42,Hc],[0,1,0],w)]};},
  read:phi=>`worm ${(phi/TAU).toFixed(2)} turns · wheel ${(phi/TAU/Zw*360).toFixed(1)}°`,drive:'Turn the crank: thirty turns of the worm turn the wheel once. Try turning the wheel instead: it locks.'});}
/* 43 skew gears: oblique (45°) teeth on both gears, shafts crossing at right angles without meeting */
{const mn=2,Z1=14,Z2=20,mt=mn/Math.cos(PI/4),R1=Z1*mt/2,R2=Z2*mt/2,w=12,zc=U.BT+R2+mt*1.3+6,yB=R1+R2;
 PK.defS(43,{summary:'Two gears with teeth cut at 45° on shafts that cross at right angles without meeting: one stands on a pin, the other turns on a level shaft beside it. Because the teeth slant, they mesh along the slant and the drive passes round the corner.',cam:{yaw:0.4,pitch:0.45},
  base:()=>[U.plate(-R1-12,-R1-12,w/2+30,yB+R2+10),U.post(0,0,zc+w/2+0.5+3,zc-w/2-0.5),U.wall(-w/2-5,yB,'x',[[0,zc]],18,5),U.wall(w/2+24,yB,'x',[[0,zc]],18,5)],
  parts:[{id:'a',name:'Skew gear, 14 teeth (on the pin)',role:'driver',mesh:K.merge(U.helical(R1,Z1,w,w/R1,{bore:'round',seg:6}),K.cyl(3,w,w+10,20,R1-7,0))},{id:'b',name:'Skew gear, 20 teeth',role:'driven',mesh:U.helical(R2,Z2,w,w/R2,{seg:6})},
    {id:'s',name:'Shaft',mesh:U.shaft(w+40)},{id:'col',name:'Collar',role:'small',mesh:U.collar()},{id:'ind',name:'Pointer disc',role:'driven',mesh:U.collar(9,3)},{id:'cap',name:'Pin cap',role:'small',mesh:U.capMesh()}],
  pose(phi){const b=phi*Z1/Z2;return{a:K.M4.mul(K.M4.T(0,0,zc-w/2),K.M4.Rz(phi)),b:U.at([-w/2,yB,zc],[1,0,0],b+PI/Z2,[0,-1,0]),s:U.shaftAt([w/2+10,yB,zc],[1,0,0],b),col:U.at([w/2+28,yB,zc],[1,0,0],b),ind:U.at([w/2+31,yB,zc],[1,0,0],b,[0,-1,0]),cap:K.M4.T(0,0,zc+w/2+0.5)};},
  read:phi=>`pin gear ${Math.round(phi*180/PI)%360}° · shaft gear ${Math.round(phi*Z1/Z2*180/PI)%360}°`,drive:'Turn the gear on the pin by its knob.'});}
/* ---------- planar models (canvas px, S mm/px) ---------- */
PK._S(0.3);
const pxPoly=(pts,holes=[[0,0]])=>({o:pts,h:holes.map(h=>Sh.hole(h[0],h[1],h[2]))});
/* 30, 38 non-circular gear pairs straight from the simulation's pitch curves */
for(const n of [30,38,209,429]){const sim=window.MB.SIMS[n];if(!sim)continue;sim.ensurePC();const d=sim.d,F1=[400-d/2,265],F2=[400+d/2,265];const tc=window.MB.toothedCurve;
  PK.def(n,{S:0.3,summary:n===429?'Holly’s rotary engine: two elliptical pistons geared together on their foci turn in a close-fitting case. Steam pressing on the long side of one ellipse turns both; the pair stay in contact all the way round, so the steam is carried round and out. (Printed here as the two geared ellipses.)':n===209?'Two lobed wheels whose pitch curves are exact rolling partners, with teeth cut along them so the motion carries on past the points where plain rolling contact would slip: the driven wheel speeds up and slows down twice a turn.':n===30?'Two rounded-square gears whose pitch curves are exact rolling partners, so the teeth stay in mesh all the way round. The driven gear speeds up and slows down four times a turn.':'A gear that is round for half a turn and bulged for the rest, with its exact rolling partner: the driven gear runs at a steady speed for half the turn and a changing speed for the rest.',
    parts:[{id:'a',name:'Driving gear',role:'driver',layer:0,shape:pxPoly(tc(sim.pcA,0)),bosses:[[sim.pcA.P[0][0]*0.5,0,14,3.5]]},{id:'b',name:'Driven gear',role:'driven',layer:0,shape:pxPoly(tc(sim.pcB,sim.phB))}],
    ground:[[F1[0],F1[1],0,0],[F2[0],F2[1],0,0]],pose:g=>({a:[F1[0],F1[1],g.phi],b:[F2[0],F2[1],PI+g.a2]}),drive:'Turn the knob on the orange gear and watch the blue one speed up and slow down.'});}
/* 33 elliptical gears on their foci */
{const sim=window.MB.SIMS[33],e=sim.P.e,a=sim.a,pc=window.MB.pitchCurve(s=>a*(1-e*e)/(1+e*Math.cos(s)),'e33_'+e,31),tc=window.MB.toothedCurve,F1=[310,262],F2=[310+2*a,262];
 PK.def(33,{S:0.3,summary:'Two equal elliptical gears, each turning on a pin through one focus. The pins are one major axis apart, so the two radii at the contact point always add up to the same length and the gears roll on each other. The driven gear runs fast, then slow, once per turn.',
  parts:[{id:'a',name:'Elliptical gear (driver)',role:'driver',layer:0,shape:pxPoly(tc(pc,0)),bosses:[[-40,0,14,3.5]]},{id:'b',name:'Elliptical gear (driven)',role:'driven',layer:0,shape:pxPoly(tc(pc,window.MB.ncPhase(pc,pc,0,PI)))}],
  ground:[[F1[0],F1[1],0,0],[F2[0],F2[1],0,0]],pose:g=>({a:[F1[0],F1[1],g.phi],b:[F2[0],F2[1],g.a2]}),drive:'Turn the knob: the blue gear hurries through half its turn and dawdles through the other half.'});}
/* 35 elliptical gear, pinion on a slide kept in mesh by a rubber band; 221/201/222 swing-arm versions */
for(const n of [35,221,201,222]){const sim=window.MB.SIMS[n];if(!sim)continue;const pc=sim.pc(),Rp=sim.Rp,F=sim.F,slot=n===35,tc=window.MB.toothedCurve;
  const R0=PK.runner(n);const g0=R0.at(0);const Q=sim.Q||[F[0]+200,F[1]-215];
  PK.def(n,{S:0.3,summary:slot?'An elliptical gear on a pin drives a 12-tooth pinion whose pin rides in a slide. A rubber band pulls the slide toward the gear, so the pinion follows the changing radius and stays in mesh; its speed rises and falls twice a turn.':'An irregular gear drives a pinion carried on a swinging arm. The arm lets the pinion follow the changing radius, and the pinion speeds up and slows down as it goes.',
    parts:[{id:'a',name:'Driving gear',role:'driver',layer:1,shape:pxPoly(tc(pc,0)),bosses:[[-30,0,14,3.5]]},{id:'p',name:'Pinion, 12 teeth',role:'driven',layer:1,shape:S=>S.gear(Rp,12)},
      slot?{id:'sl',name:'Slide',role:'link',layer:0,shape:S=>S.rect(44,34,0,0,[]),pins:[[-6,0,1]],bosses:[[14,0,10,2.2]]}:{id:'arm',name:'Swinging arm',role:'link',layer:0,shape:S=>S.bar(Math.hypot(g0.P[0]-Q[0],g0.P[1]-Q[1]),12),pins:[[Math.hypot(g0.P[0]-Q[0],g0.P[1]-Q[1]),0,1]]}],
    ground:slot?[[F[0],F[1],1,1],[F[0]+60,F[1]-46,1,1]]:[[F[0],F[1],1,1],[Q[0],Q[1],0,0]],
    fixed:slot?[{shape:S=>S.rect(330,10,F[0]+225,F[1]-22),l1:0},{shape:S=>S.rect(330,10,F[0]+225,F[1]+22),l1:0},{shape:S=>S.rect(14,54,F[0]+392,F[1]),l1:0}]:[],
    pose(g){const o={a:[F[0],F[1],g.phi],p:[g.P[0],g.P[1],g.pa]};if(slot)o.sl=[g.P[0]+6,g.P[1],0];else o.arm=[Q[0],Q[1],Math.atan2(g.P[1]-Q[1],g.P[0]-Q[0])];return o;},
    hardware:slot?['A small rubber band from the peg on the slide to the peg beside the gear, so it pulls the pinion into mesh.']:[],drive:'Turn the knob on the orange gear.'});}
/* 32 friction wheels: rubber O-rings on grooved rims */
{const rim=(R,h=9)=>K.lathe([[PK.BORER,0],[R-0.6,0],[R-0.6,2.2],[R-1.8,3.4],[R-1.8,h-3.4],[R-0.6,h-2.2],[R-0.6,h],[PK.BORER,h]],96);
 PK.def(32,{S:0.3,summary:'Two plain wheels with an O-ring stretched round each rim, pressed lightly together on printed pins. The rubber grips, so the larger wheel drives the smaller one at 90 : 60 without teeth.',
  parts:[{id:'a',name:'Large wheel (fit an O-ring)',role:'driver',layer:0,t:2,mesh:K.merge(rim(90*0.3),K.cyl(3,9,20,20,18,0))},{id:'b',name:'Small wheel (fit an O-ring)',role:'driven',layer:0,t:2,mesh:K.merge(rim(60*0.3),K.cyl(1.4,9,10,12,10,0))}],
  ground:[[310,260,0,1],[460,260,0,1]],pose:g=>({a:[310,260,g.phi],b:[460,260,g.a2]}),hardware:['Two O-rings, 2 mm cord: about 52 mm and 34 mm inside diameter.'],drive:'Turn the large wheel by its knob; the rubber rims grip and drive the small one.'});}
/* 34 internal gear and pinion: the ring is held by three rollers outside it */
{const O=[400,260],R=120,Z=48,m=5,ro=R+1.25*m+18;
 PK.def(34,{S:0.3,summary:'A 48-tooth ring gear with teeth on the inside, held in place by three rollers round its rim, meshes with a 16-tooth pinion on a pin. Both turn the same way, and more teeth share the load than with two outside gears.',
  parts:[{id:'r',name:'Ring gear, 48 internal teeth',role:'driven',layer:0,shape:S=>S.ring(R,Z,ro)},{id:'p',name:'Pinion, 16 teeth',role:'driver',layer:0,shape:S=>S.gear(40,16),bosses:[[24,0,14,3.5]]},
    {id:'i',name:'Guide roller',role:'link',layer:0,qty:3,shape:S=>S.disk(16)}],
  ground:[[O[0]+80,O[1],0,0],...[0,1,2].map(k=>{const a=-PI/2+k*TAU/3;return[O[0]+(ro+16)*Math.cos(a),O[1]+(ro+16)*Math.sin(a),0,0];})],
  pose(g){const rr=[0,1,2].map(k=>{const a=-PI/2+k*TAU/3;return[O[0]+(ro+16)*Math.cos(a),O[1]+(ro+16)*Math.sin(a),-g.ar*ro/16];});return{r:[O[0],O[1],g.ar+PI/Z],p:[O[0]+80,O[1],g.phi],i:rr};},drive:'Turn the pinion by its knob: the ring follows in the same direction at a third of the speed.'});}
/* 27 roller gearing (display model of the simulation's concept) */
{const O=[400,265],N=9;
 PK.def(27,{S:0.3,summary:'A display model of Brown’s roller gearing: a three-lobed driver turns inside a slotted wheel, and a roller in each radial slot rides on the lobes. Turn the driver and watch the rollers work in and out as the wheel creeps round.',
  parts:[{id:'w',name:'Slotted wheel',role:'driven',layer:0,shape:S=>({o:S.circle(180,120),h:[S.hole(0,0),...Array.from({length:N},(_,k)=>{const t=k*TAU/N;return S.slotPts(52*Math.cos(t),52*Math.sin(t),168*Math.cos(t),168*Math.sin(t),24);})]})},
    {id:'c',name:'Three-lobed driver',role:'driver',layer:1,shape:S=>S.polar(s=>70+25*Math.cos(3*s)),bosses:[[60,0,12,3.5]]},
    {id:'r',name:'Roller',role:'link',layer:0,t:2,qty:N,shape:S=>S.disk(10.5,[])}],
  ground:[[O[0],O[1],0,1]],
  pose(g){const rs=[];for(let k=0;k<N;k++){const t=g.w+k*TAU/N,r=70+25*Math.cos(3*(t-g.phi))+12;rs.push([O[0]+r*Math.cos(t),O[1]+r*Math.sin(t),0]);}return{w:[O[0],O[1],g.w],c:[O[0],O[1],g.phi],r:rs};},drive:'Turn the lobed driver by its knob.'});}
/* 36, 192–194 mangle wheels: pins on a closed track at the pinion's exact pitch; the pinion's axle runs down into a groove that
   follows the track (an outer guide ring and an island, both glued to the wheel), so it keeps in mesh as it passes outside and inside */
for(const n of [36,192,193,194,371]){const sim=window.MB.SIMS[n];if(!sim||!sim.geo)continue;const G=sim.geo,O=[400,300],S0=0.42;PK._S(S0);
 const pins=G.pins.map(p=>[p[0],p[1],PK.TH+PK.GAP-0.3,1.4]),Rw=G.Rw,gw=(PK.PINR*2+0.8)/S0,axR=PK.PINR,Hb=O[1]-G.Rm,win=G.q+(axR+0.6)/S0;
 const pin=K.merge(K.cyl(axR-0.05,0,PK.zl(4)-PK.zl(1)+3,24),K.cyl(5,PK.zl(4)-PK.zl(1)+3,PK.zl(4)-PK.zl(1)+10,32));
 PK.def(n,{S:S0,summary:({36:'A mangle wheel with a single row of pins. The pinion turns steadily one way; it drives the wheel round from outside the row, climbs round the end pin, and drives it back from inside. Its axle runs in a groove that follows the row, so it can never jump out of mesh.',
   192:'A mangle wheel whose outer and inner rows of pins are far apart, joined by round ends. Outside the outer row the wheel turns slowly; inside the inner row, faster: the speed changes through each swing. The pinion’s axle follows a groove beside the pins.',
   193:'A mangle wheel that swings nearly a whole turn each way: slowly while the pinion works outside the outer row of pins, faster while it works inside the inner row. The pinion’s axle follows a groove round the pin track.',
   194:'A mangle wheel with one row of pins, so the speed is the same both ways. The steadily turning pinion drives from outside the row one way and from inside it the other; its axle runs in a groove round the row.'})[n],
  parts:[{id:'w',name:'Mangle wheel',role:'driven',layer:0,shape:S=>S.disk(Rw,[[0,0]],120)},
   {id:'go',name:'Guide ring (glue to the wheel)',role:'driven',layer:1,shape:S=>({o:S.circle(Rw,120),h:[S.hole(0,0),G.loop(gw/2,40).slice().reverse()]})},
   {id:'gi',name:'Pin island (glue to the wheel)',role:'driven',layer:1,shape:S=>({o:G.loop(-gw/2,40),h:[]}),bosses:pins},
   {id:'p',name:`Pinion, ${G.Z} teeth`,role:'driver',layer:2,shape:S=>({o:S.gearOutline(G.rp,G.Z,{backlash:0.5}),h:[S.hole(0,0,(axR+0.05)/S0)]})},
   {id:'ax',name:'Pinion axle with knob (glue in the pinion)',role:'driver',layer:1,mesh:pin},
   {id:'br',name:'Bridge with window',role:'frame',layer:3,shape:S=>({o:[[O[0]-win-30,O[1]-Rw-34],[O[0]+win+30,O[1]-Rw-34],[O[0]+win+30,Hb+win+26],[O[0]-win-30,Hb+win+26]],h:[S.hole(O[0]-win-14,O[1]-Rw-18),S.hole(O[0]+win+14,O[1]-Rw-18),S.circle(win,64,O[0],Hb)]})}],
  ground:[[O[0],O[1],0,1],[O[0]-win-14,O[1]-Rw-18,3,3],[O[0]+win+14,O[1]-Rw-18,3,3]],
  pose(g){const P=[O[0]+g.pc[0],O[1]+g.pc[1]];return{w:[O[0],O[1],g.w],go:[O[0],O[1],g.w],gi:[O[0],O[1],g.w],p:[P[0],P[1],g.a],ax:[P[0],P[1],g.a],br:[0,0,0]};},
  drive:'Turn the pinion by the knob on its axle: the wheel swings one way, pauses while the pinion rounds the end of the track, then swings back.'});}
PK._S(0.3);
/* 37 spiral studs and a long-toothed pinion */
{const R=57,z0=U.BT+1.5,zt=z0+4,Zp=10,m=1.6,Rp=Zp*m/2,zp=zt+3+Rp,rr=m0=>(60+110*m0/TAU)*0.3;
 const disk=()=>{const ms=[K.prism(K.circle(R,120),[K.circle(U.SHB,32)],0,4)];let L=0,last=null;const studs=[];for(let i=0;i<=2000;i++){const t=i/2000*TAU,r=rr(t),p=[r*Math.cos(-t),r*Math.sin(-t)];if(last)L+=Math.hypot(p[0]-last[0],p[1]-last[1]);last=p;if(L>=PI*m||i===0){studs.push(p);L=0;}}
   for(const p of studs)ms.push(K.cyl(1.25,3.6,4+3.2,14,p[0],p[1]));ms.push(K.cyl(3,4,16,20,-R+5,0));return K.merge(...ms);};
 PK.defS(37,{summary:'Studs stand on the face of the wheel along a spiral. A pinion with teeth along its whole length lies over them on a level shaft and does not move: the studs meet it nearer the centre or farther out, so the wheel turns faster or slower through each turn.',cam:{yaw:0.5,pitch:0.6},
  base:()=>[U.plate(-R-10,-R-10,R+46,R+10),U.post(0,0,zt+3.5,z0-0.5),U.wall(R+8,0,'x',[[0,zp]]),U.wall(R+34,0,'x',[[0,zp]])],
  parts:[{id:'d',name:'Stud wheel',role:'driven',mesh:disk()},{id:'p',name:'Long-toothed pinion',role:'driver',mesh:U.spur(Rp,Zp,40)},{id:'s',name:'Pinion shaft',mesh:U.shaft(60)},
    {id:'k',name:'Hand crank',role:'driver',mesh:U.crank()},{id:'col',name:'Collar',role:'small',mesh:U.collar()},{id:'cap',name:'Pin cap',role:'small',mesh:U.capMesh()}],
  pose(phi,g,sim){const w=sim?sim.w:0;return{d:K.M4.mul(K.M4.T(0,0,z0),K.M4.Rz(-w)),p:U.at([16,0,zp],[1,0,0],-phi,[0,0,-1]),s:U.shaftAt([16+30,0,zp],[1,0,0],-phi),k:U.at([R+42,0,zp],[1,0,0],-phi),col:U.at([R+14,0,zp],[1,0,0],-phi),cap:K.M4.T(0,0,zt+0.5)};},
  read:(phi,g)=>`contact radius ${(g.r*0.3).toFixed(0)} mm`,drive:'Turn the crank steadily and watch the wheel speed change through each turn.'});}
/* 39 sun and planet */
{const sim=window.MB.SIMS[39],Sx=sim.S,Bp=sim.Bp,Lb=sim.Lb,Lr=sim.Lr,tau=TAU/20,S0=0.3;const r=PK.runner(39);r.at(0);const rho0=r.sim.rho0;const L=PK.TH+PK.GAP;
 const fly=K.merge(PK.ext(Sh.disk(170,[[0,0],...[0,1,2,3,4,5].map(k=>[105*Math.cos(k*PI/3+PI/6),105*Math.sin(k*PI/3+PI/6),40])]),0,PK.TH),PK.ext(Sh.gear(50,20),L,L+PK.TH));
 const planet=(()=>{const off=PI+tau/2-rho0,c=Math.cos(off),s=Math.sin(off),gsh=Sh.gear(50,20);return K.merge(PK.ext({o:gsh.o.map(([x,y])=>[x*c-y*s,x*s+y*c]),h:gsh.h},0,PK.TH),PK.ext(Sh.bar(Lr,14,[0,Lr]),L,L+PK.TH));})();
 PK.def(39,{S:S0,summary:'Watt’s sun-and-planet gear. The beam rocks; its connecting rod carries the planet gear, fixed to the rod so it cannot turn on its own. A link keeps the planet in mesh with the sun gear on the flywheel, and every trip of the planet round the sun turns the flywheel twice.',
  parts:[{id:'f',name:'Flywheel with sun gear',role:'driven',layer:0,t:2,mesh:fly},{id:'r',name:'Connecting rod with planet gear',role:'link',layer:1,t:2,mesh:planet,pins:[[0,0,3],[Lr,0,4]]},
    {id:'a',name:'Link (keeps the gears in mesh)',role:'link',layer:3,shape:S=>S.bar(100,14)},{id:'b',name:'Beam',role:'driver',layer:4,shape:S=>S.bar(Lb+60,16,[0,Lb]),bosses:[[Lb+50,0,10,3.5]]}],
  ground:[[Sx[0],Sx[1],0,3],[Bp[0],Bp[1],4,4]],
  pose(g){return{f:[Sx[0],Sx[1],g.sig+tau/2],r:[g.P[0],g.P[1],g.rho+PI],a:[Sx[0],Sx[1],Math.atan2(g.P[1]-Sx[1],g.P[0]-Sx[0])],b:[Bp[0],Bp[1],Math.atan2(g.E[1]-Bp[1],g.E[0]-Bp[0])]};},
  drive:'Rock the beam by its knob (or turn the flywheel): the flywheel makes two turns for each round trip of the planet.'});}
/* 40, 41 oblique and V-shaped teeth on parallel pins */
for(const [n,her] of [[40,false],[41,true]]){const R1=56*0.3,R2=84*0.3,w=13,b=0.45,A=[300,265],B=[440,265];
 PK.def(n,{S:0.3,summary:her?'Two gears with V-shaped (herringbone) teeth on printed pins. Like oblique teeth they come into mesh gradually, but the two halves push sideways in opposite directions, so the gears do not try to slide along their pins.':'Two gears with teeth set at a slant (helical) on printed pins. Each tooth comes into contact gradually across the face, so more than one tooth always shares the load and the drive runs smoothly.',
  parts:[{id:'a',name:`Driving gear, 16 ${her?'V-':'oblique '}teeth`,role:'driver',layer:0,t:3,mesh:K.merge(U.helical(R1,16,w,w*Math.tan(b)/R1*(her?1:1),{bore:'round',herring:her,seg:her?8:6}),K.cyl(3.5,w,w+12,20,9,0))},
    {id:'b',name:`Driven gear, 24 ${her?'V-':'oblique '}teeth`,role:'driven',layer:0,t:3,mesh:U.helical(R2,24,w,-w*Math.tan(b)/R2,{bore:'round',herring:her,seg:her?8:6})}],
  ground:[[A[0],A[1],0,2],[B[0],B[1],0,2]],pose:g=>({a:[A[0],A[1],g.phi],b:[B[0],B[1],-g.phi*16/24+PI+PI/24]}),drive:'Turn the knob on the orange gear.'});}
/* 44 stepped gears: three thin gears per wheel, each set on by a third of a tooth */
{const R1=56*0.3,R2=84*0.3,h=4,A=[300,265],B=[440,265];const st=(R,Z,sg)=>K.merge(...[0,1,2].map(k=>K.xf(U.spur(R,Z,h,{bore:'round'}),K.M4.mul(K.M4.T(0,0,k*h),K.M4.Rz(sg*k*TAU/Z/3)))));
 PK.def(44,{S:0.3,summary:'Stepped gears: each wheel is three thin gears stacked, each set on by a third of a tooth. Some step is always at its best point of contact, so the drive is as smooth and strong as a much finer-toothed gear.',
  parts:[{id:'a',name:'Stepped driving gear, 16 teeth',role:'driver',layer:0,t:3,mesh:K.merge(st(R1,16,1),K.cyl(3.5,12,24,20,9,0))},{id:'b',name:'Stepped driven gear, 24 teeth',role:'driven',layer:0,t:3,mesh:st(R2,24,-1)}],
  ground:[[A[0],A[1],0,2],[B[0],B[1],0,2]],pose:g=>({a:[A[0],A[1],g.phi],b:[B[0],B[1],-g.phi*16/24+PI+PI/24]}),drive:'Turn the knob on the orange gear.'});}
/* 45 grooved friction gearing */
{const r1=60*0.3,r2=90*0.3,A=[325,270],B=[475,270],H=9;const prof=(R,peak)=>{const p=[[PK.BORER,0]];for(let k=0;k<=6;k++){const z=k*H/6,up=(k%2===0)!==peak;p.push([R+(up?1.2:-1.2),z]);}p.push([PK.BORER,H]);return p;};
 PK.def(45,{S:0.3,summary:'Frictional grooved gearing: V-shaped ridges round one wheel wedge into matching grooves in the other. The wedging grips far better than plain rims, so the pair drives without teeth.',
  parts:[{id:'a',name:'Ridged wheel',role:'driver',layer:0,t:2,mesh:K.merge(K.lathe(prof(r1,true),96),K.cyl(3,H,H+12,20,10,0))},{id:'b',name:'Grooved wheel',role:'driven',layer:0,t:2,mesh:K.lathe(prof(r2,false),96)}],
  ground:[[A[0],A[1],0,1],[B[0],B[1],0,1]],pose:g=>({a:[A[0],A[1],g.phi],b:[B[0],B[1],g.a2]}),drive:'Turn the ridged wheel by its knob.'});}
/* 46 fusee and barrel on upright pins; the cord leaves the cone higher (smaller radius) while the spring is strong */
{const B=[230,300],F=[410,300],Rb=72*0.3,H=30,rt=22*0.3,rbm=70*0.3,z0=PK.zl(0);
 const drum=K.lathe([[PK.BORER,0],[Rb+3,0],[Rb+3,2],[Rb,2],[Rb,H-2],[Rb+3,H-2],[Rb+3,H],[PK.BORER,H]],80);
 const fus=(()=>{const p=[[PK.BORER,0],[rbm+2,0],[rbm+2,1.5]];const N=12;for(let k=0;k<=N;k++){const z=1.5+(H-3)*k/N,r=rbm+(rt-rbm)*k/N;p.push([r,z]);if(k<N){const z2=z+(H-3)/N/2,r2=r+(rt-rbm)/N/2;p.push([r2-1,z2]);}}p.push([rt+2,H-1.5],[rt+2,H],[PK.BORER,H]);return K.lathe(p,80);})();
 const zAt=p=>z0+1.5+(H-3)*(1-p),rAt=p=>rt+(rbm-rt)*p;
 PK.def(46,{S:0.3,summary:'A fusee and spring barrel on upright pins. The cord (a chain in a watch) runs from the barrel to the spiral groove of the cone. When the spring is wound tight the cord pulls on the small end; as it runs down the cord works onto the larger radii, so the turning force on the fusee stays even.',
  parts:[{id:'b',name:'Spring barrel',role:'driven',layer:0,t:7,mesh:drum},{id:'f',name:'Fusee (spiral-grooved cone)',role:'driver',layer:0,t:7,mesh:K.merge(fus,K.cyl(3,H,H+10,20,rt-1,0))}],
  ground:[[B[0],B[1],0,6],[F[0],F[1],0,6]],
  pose(g){const r=rAt(g.p);return{b:[B[0],B[1],-g.phi*r/Rb],f:[F[0],F[1],g.phi]};},
  ropes(g){const r=rAt(g.p),z=zAt(g.p),pts=[[B[0],B[1]-Rb/0.3,z],[F[0],F[1]-r/0.3,z]];const wr=[];const k0=g.p;for(let i=0;i<=80;i++){const u=k0+(1-k0)*i/80,ang=-PI/2-i*0.9;wr.push([F[0]+rAt(u)/0.3*Math.cos(ang),F[1]+rAt(u)/0.3*Math.sin(ang),zAt(u)]);}return[{pts,r:0.8},{pts:wr,r:0.8}];},
  read:g=>`cord on the cone at ${(rAt(g.p)).toFixed(1)} mm radius · spring at ${((1-0.5*g.p)*100).toFixed(0)} % pull`,hardware:['About 60 cm of thin strong cord (fishing braid); a rubber band can stand in for the mainspring.'],
  drive:'Wind the cord onto the fusee, then let the barrel pull it back while you hold the fusee knob: the pull is lightest where the cord sits on the large end.'});}
/* ---------- 47, 48 clutches: two shafts end to end; the driven half slides on the octagonal shaft (the key) and is thrown in and out by a forked lever ---------- */
const oct32=r=>{const o=U.octa(r),p=[];for(let i=0;i<8;i++){const a=o[i],b=o[(i+1)%8];for(let k=0;k<4;k++)p.push([a[0]+(b[0]-a[0])*k/4,a[1]+(b[1]-a[1])*k/4]);}return p;};
function revolve(sections){/* sections: [z, outerR, holeR|'oct'] -> loft with 32-point rings */return K.loftS(sections.map(([z,ro,rh])=>({o:K.circle(ro,32).map(p=>[p[0],p[1],z]),h:[(rh==='oct'?oct32(U.SH+0.12):K.circle(rh,32)).map(p=>[p[0],p[1],z])]})));}
function clutchModel(n,kind){const zc=U.BT+16,gr=8.5,x0=2;/* x0: face gap when engaged */
  const half=kind==='cone'?{a:revolve([[0,12,'oct'],[4,12,'oct'],[12,6.5,'oct']]),b:revolve([[0,12.5,10.4],[8,12.5,6.6],[8,12.5,'oct'],[10,12.5,'oct'],[10,gr,'oct'],[14,gr,'oct'],[14,12.5,'oct'],[17,12.5,'oct']])}
   :(()=>{const jaws=sg=>K.merge(...[0,1,2].map(k=>{const a0=k*TAU/3+sg*PI/3,pts=[];for(let i=0;i<=8;i++){const t=a0-0.45+0.9*i/8;pts.push([12*Math.cos(t),12*Math.sin(t)]);}for(let i=8;i>=0;i--){const t=a0-0.45+0.9*i/8;pts.push([5.5*Math.cos(t),5.5*Math.sin(t)]);}return K.prism(pts,[],5.8,10);}));
     return{a:K.merge(revolve([[0,12,'oct'],[6,12,'oct']]),jaws(0)),b:K.merge(revolve([[0,12.5,'oct'],[6,12.5,'oct'],[6,gr,'oct'],[10,gr,'oct'],[10,12.5,'oct'],[13,12.5,'oct']]),K.xf(jaws(1),K.M4.mul(K.M4.T(0,0,6),K.M4.mul(K.M4.Rx(PI),K.M4.T(0,0,-6)))))};})();
  const La=kind==='cone'?12:10,engX=x0+(kind==='cone'?-8:0);/* B face position when engaged */
  const gX=g=>engX+g*0.3,grooveAt=kind==='cone'?12:8,px=engX+grooveAt+4.5,py=-36,Lr=36-gr-1;
  const lever=K.merge(K.prism(K.hull([...K.circle(5,24),...K.circle(4,24,0,Lr),...K.circle(4,24,0,-22)]),[K.circle(U.SHB,24)],0,4),K.prism([[-1.6,Lr],[1.6,Lr],[1.6,Lr+6],[-1.6,Lr+6]],[],0,4),K.cyl(3,4,14,20,0,-22));
  PK.defS(n,{summary:kind==='cone'?'A friction (cone) clutch. The driving cone is fast on its shaft; the hollow cone slides along the octagonal driven shaft, which acts as its key. Swing the lever and the cones press together: the grip takes up the drive smoothly.':'A clutch box: jaws on the driving half and the sliding half lock together when the lever pushes them in, so the driven shaft starts at once; pull the lever and it is free.',cam:{yaw:0.9,pitch:0.5},
    base:()=>[U.plate(-72,py-30,72,24),U.wall(-56,0,'x',[[0,zc]]),U.wall(-26,0,'x',[[0,zc]]),U.wall(30,0,'x',[[0,zc]]),U.wall(60,0,'x',[[0,zc]]),U.post(px,py,zc+2+0.5+3,zc-2.5)],
    parts:[{id:'a',name:kind==='cone'?'Driving cone':'Driving jaw half',role:'driver',mesh:half.a},{id:'b',name:kind==='cone'?'Sliding hollow cone (grooved)':'Sliding jaw half (grooved)',role:'driven',mesh:half.b},
      {id:'sa',name:'Driving shaft',mesh:U.shaft(66)},{id:'sb',name:'Driven shaft',mesh:U.shaft(70)},{id:'lv',name:'Forked lever',role:'link',mesh:lever},{id:'k',name:'Hand crank',role:'driver',mesh:U.crank()},
      {id:'ind',name:'Pointer disc',role:'driven',mesh:U.collar(9,3)},{id:'col',name:'Collar',role:'small',qty:2,mesh:U.collar()},{id:'cap',name:'Pin cap',role:'small',mesh:U.capMesh()}],
    pose(phi,g,sim){const gap=g.gap||0,xb=gX(gap),ab=sim?sim.a:phi,th=Math.asin(Math.max(-1,Math.min(1,(xb+grooveAt+4.5-px)/Lr)));
      return{a:U.at([-La+x0-6+6,0,zc],[1,0,0],phi).map?U.at([x0-La,0,zc],[1,0,0],phi):0,b:U.at([xb+(kind==='cone'?0:0),0,zc],[1,0,0],ab),sa:U.shaftAt([x0-33,0,zc],[1,0,0],phi),sb:U.shaftAt([x0+2+35,0,zc],[1,0,0],ab),
        lv:K.M4.mul(K.M4.T(px,py,zc-2),K.M4.Rz(-th)),k:U.at([-66,0,zc],[-1,0,0],-phi),ind:U.at([66,0,zc],[1,0,0],ab),col:[U.at([-24,0,zc],[1,0,0],phi),U.at([62,0,zc],[1,0,0],ab)],cap:K.M4.T(px,py,zc+2.5)};},
    read:(phi,g)=>g.on?'engaged · the driven shaft turns':'thrown out · the driven shaft coasts to a stop',drive:'Turn the crank and swing the lever to throw the clutch in and out.'});}
clutchModel(47,'cone');clutchModel(48,'jaw');
/* 49 two loose bevels with opposed ratchets: rocking the level shaft turns the upright bevel one way */
{const Z=18,m=2,Rp=18,d=PI/4,f=7,Hc=U.BT+Rp+8,zt=f*Math.cos(d),Lp=Rp/Math.tan(d);
 const saw=sg=>{const pts=[];for(let k=0;k<12;k++){const a0=k*TAU/12,a1=(k+1)*TAU/12;pts.push([10.5*Math.cos(a0),10.5*Math.sin(a0)],[13.5*Math.cos(a1-0.03),13.5*Math.sin(a1-0.03)]);}const P=sg>0?pts:pts.map(p=>[p[0],-p[1]]).reverse();return K.prism(P,[U.octa(U.SH+0.12)],0,4);};
 const pawl=K.merge(K.prism(K.hull([...K.circle(2.6,16),...K.circle(1.6,16,-6,3.5)]),[],0,3),K.cyl(1.4,-5,0,12));
 PK.defS(49,{summary:'Rocking the level shaft to and fro turns the upright bevel continuously one way. The two side bevels run loose on the shaft; each carries a pawl on a ratchet that is fast to the shaft, the ratchets facing opposite ways. One stroke drives the left bevel, the return stroke drives the right one, and both turn the upright bevel the same way.',cam:{yaw:0.6,pitch:0.45},
  base:()=>[U.plate(-78,-22,78,22),U.wall(-40,0,'x',[[0,Hc]]),U.wall(-62,0,'x',[[0,Hc]]),U.wall(40,0,'x',[[0,Hc]]),U.wall(62,0,'x',[[0,Hc]]),U.post(0,0,Hc-Lp+zt+0.5+3,Hc-Lp-0.5)],
  parts:[{id:'bl',name:'Left bevel, loose (pawl hole)',role:'link',mesh:U.bevel(Rp,Z,d,f,{bore:'round',holes:[[0,8,1.5]]})},{id:'br',name:'Right bevel, loose (pawl hole)',role:'link',mesh:U.bevel(Rp,Z,d,f,{bore:'round',holes:[[0,8,1.5]]})},
    {id:'bv',name:'Upright bevel (output)',role:'driven',mesh:K.merge(U.bevel(Rp,Z,d,f,{bore:'round'}),K.cyl(2.5,0.01,0.02,8))},{id:'rl',name:'Ratchet, left hand',role:'driver',mesh:saw(1)},{id:'rr',name:'Ratchet, right hand',role:'driver',mesh:saw(-1)},
    {id:'pw',name:'Pawl with peg',role:'small',qty:2,mesh:pawl,note:'peg into the hole in the bevel; a tiny rubber band holds it on the ratchet'},{id:'s',name:'Level shaft',mesh:U.shaft(140)},{id:'h',name:'Rocking handle',role:'driver',mesh:U.crank(20)},
    {id:'col',name:'Collar',role:'small',qty:2,mesh:U.collar()},{id:'cap',name:'Pin cap',role:'small',mesh:U.capMesh()}],
  pose(phi,g){const a=g.a||0,w=g.w||0,O=[0,0,Hc];const bl=w,brr=w;
    return{bl:U.at([-Lp,0,Hc],[1,0,0],bl,[0,0,-1]),br:U.at([Lp,0,Hc],[-1,0,0],brr+PI/Z*0,[0,0,-1]),bv:U.at([0,0,Hc-Lp],[0,0,1],-w+PI/Z,[-1,0,0]),
      rl:U.at([-Lp-9,0,Hc],[1,0,0],a,[0,0,1]),rr:U.at([Lp+9,0,Hc],[-1,0,0],-a,[0,0,1]),
      pw:[K.M4.mul(U.at([-Lp,0,Hc],[-1,0,0],-bl,[0,0,1]),K.M4.T(0,8,0)),K.M4.mul(U.at([Lp,0,Hc],[1,0,0],-brr,[0,0,1]),K.M4.T(0,8,0))],
      s:U.shaftAt([0,0,Hc],[1,0,0],a),h:U.at([-70,0,Hc],[-1,0,0],-a,[0,0,1]),col:[U.at([-38,0,Hc],[1,0,0],a),U.at([42,0,Hc],[1,0,0],a)],cap:K.M4.T(0,0,Hc-Lp+zt+0.5)};},
  read:(phi,g)=>`handle ${((g.a||0)*180/PI).toFixed(0)}° · output ${((g.w||0)/TAU).toFixed(2)} turns`,drive:'Rock the handle back and forth: the upright bevel keeps turning the same way.'});}
/* 50 universal joint: two forks and a cross; the second shaft is set at the chosen angle */
{const Rk=12,zc=U.BT+20,S6=3.2;
 const fork=(()=>{/* assembly frame: axis +z toward the centre, arms along x, cross centre at z=0 */
   const stem=K.box(2*S6,2*S6,-Rk-58,-Rk-4),bridge=K.box(2*Rk+8,2*S6,-Rk-6,-Rk+0.5);
   const arm=sx=>K.xf(K.prism([[-S6,-Rk-6],[S6,-Rk-6],[S6,3],[0,6],[-S6,3]],[K.circle(U.SHB,24,0,0)],-3,3),[0,1,0,0, 0,0,1,0, 1,0,0,0, sx*Rk,0,0,1]);
   return U.printed(K.merge(stem,bridge,arm(1),arm(-1)),K.M4.Rx(PI/2));})();
 const crod=K.xf(U.shaft(2*Rk+8,1.95),K.M4.T(0,0,-1.95*Math.cos(PI/8)));const cross=K.merge(crod,K.xf(crod,K.M4.Rz(PI/2)),K.box(7,7,-3.5,3.5));
 const forkAt=(n,u,a)=>K.M4.mul(U.at([0,0,zc],n,a,u),fork.inv);
 PK.defS(50,{summary:'Hooke’s universal joint: a fork on each shaft and a cross joining them. The cross lets the second shaft run at an angle. Set the angle, turn the input steadily and watch the output run ahead and fall behind twice every turn.',
  params:[{id:'b',label:'Shaft angle',min:0,max:45,step:5,value:30,fmt:v=>v+'°'}],
  base:P=>{const b=(P.b??30)*PI/180,c=Math.cos(b),s=Math.sin(b),ms=[U.wall(-38,0,'x',[[0,zc,4.6]]),U.wall(-62,0,'x',[[0,zc,4.6]]),U.wall(38*c,38*s,b,[[0,zc,4.6]]),U.wall(62*c,62*s,b,[[0,zc,4.6]])];ms.unshift(U.plate(-74,-20+Math.min(0,62*s)-10,Math.max(74*c,20)+10,Math.max(20,62*s+20)));return ms;},
  parts:[{id:'f1',name:'Input fork with shaft',role:'driver',mesh:fork.mesh},{id:'f2',name:'Output fork with shaft',role:'driven',mesh:fork.mesh},{id:'x',name:'Cross',role:'link',mesh:cross,note:'its arms are the pins of the joint'},
    {id:'k',name:'Hand crank (push onto the square shaft end)',role:'driver',mesh:K.merge(K.prism(K.hull([...K.circle(6,24),...K.circle(4.5,24,16,0)]),[[[-S6-0.2,-S6-0.2],[S6+0.2,-S6-0.2],[S6+0.2,S6+0.2],[-S6-0.2,S6+0.2]]],0,5),K.cyl(2.6,5,17,20,16,0))}],
  pose(phi,g,sim,P){const b=(P.b??30)*PI/180,ax2=[Math.cos(b),Math.sin(b),0],a1=g.a1??phi,a2=g.a2??phi;const e1=[0,Math.cos(a1),Math.sin(a1)];
    const cr=[ax2[1]*e1[2]-ax2[2]*e1[1],ax2[2]*e1[0]-ax2[0]*e1[2],ax2[0]*e1[1]-ax2[1]*e1[0]],l=Math.hypot(...cr),e2=cr.map(v=>v/l),e3=[e1[1]*e2[2]-e1[2]*e2[1],e1[2]*e2[0]-e1[0]*e2[2],e1[0]*e2[1]-e1[1]*e2[0]];
    return{f1:forkAt([1,0,0],[0,1,0],a1),f2:forkAt([-ax2[0],-ax2[1],0],[0,0,1],-a2),x:[e1[0],e1[1],e1[2],0, e2[0],e2[1],e2[2],0, e3[0],e3[1],e3[2],0, 0,0,zc,1],k:U.at([-70-Rk,0,zc],[-1,0,0],-a1,[0,1,0])};},
  read:(phi,g)=>`output ${(((g.a2??0)-(g.a1??0))*180/PI).toFixed(1)}° ahead of the input`,drive:'Turn the crank steadily and watch the output fork run ahead and fall behind.',cam:{yaw:-0.4,pitch:0.75}});}
