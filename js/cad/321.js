(function(){const K=window.CAD.K,PK=window.PK,M4=K.M4,PI=Math.PI,TAU=2*PI;const mod=(a,n)=>((a%n)+n)%n;const ropeThru=(...a)=>window.MB.ropeThru(...a);
/* ===== printable models 321–360 ===== */
const U=PK.U,{Sh}=PK,L=PK.Lib;PK._S(0.3);const pxPoly=L.pxPoly;
const rel=(pts,O)=>pts.map(([x,y])=>[x-O[0],y-O[1]]);
const armPts=(A,B,r)=>K.hull([...K.circle(r,20,A[0],A[1]),...K.circle(r,20,B[0],B[1])]);

/* ---------- linkages printed from the simulation ---------- */
{const txt={332:'A side-lever parallel motion: the radius bar and the parallel bar make the cross-head on the piston rod run very nearly straight while the side lever swings.',
  333:'A combined parallel motion: two of the simple guiding linkages joined, giving a straight path for the piston rod over a longer stroke.',
  336:'The parallel motion of a side-lever marine engine: radius bars and links keep the piston-rod cross-head on a straight line though everything else swings.',
  337:'A short radius rod and a swinging link guide the end of the piston rod along a nearly straight line.',
  338:'A parallel motion with the radius bar above the beam: the joint between beam and links moves on a nearly straight line.',
  339:'One end of the bar slides in a slot while a radius arm holds the middle; a point on the bar travels in a straight line.',
  340:'The beam rests on a rocking pillar instead of a fixed pivot, and a radius bar steadies it, so the beam end rises and falls in a straight line.',
  343:'Two radius rods guide the piston rod of an upright engine: their ends meet at a joint whose path is nearly straight.'};
 for(const n of [332,333,336,337,338,339,340,343])L.linkModel(n,txt[n]);}
for(const [n,s] of [[326,'A guide frame: the crosshead slides between two fixed bars, so the piston rod stays straight however the connecting rod pushes on it.'],[327,'Rollers on the crosshead run between the guide bars, keeping the piston rod straight with rolling rather than sliding friction.'],[330,'A forked connecting rod: the rod is split so the piston rod can run on between the two prongs into its guide.'],[331,'The crank pin slides in a slotted cross-head that runs between pillar guides: a Scotch yoke giving pure harmonic motion.']])L.crankSlideModel(n,s);
L.govModel(357,'A gyroscopic governor: a spinning wheel on the governor arm tilts more as the speed rises, and the tilt moves the sleeve that sets the steam valve.');


/* 354 · Scotch yoke with a groove shaped for a uniform speed */
{const sim=window.MB.SIMS[354],O=[260,270],r=80;const ctr=[];for(let i=0;i<240;i++){const t=i/240*TAU;ctr.push([r*Math.cos(t)-sim.u(t),r*Math.sin(t)]);}
 PK.def(354,{S:0.3,summary:'A Scotch yoke whose groove is shaped so that the yoke moves at the same speed all the way across and back, instead of slowing at the ends as a straight-slotted yoke does. The groove is the path of the crank pin seen from the moving yoke.',
  parts:[{id:'d',name:'Crank disk with pin',role:'driver',layer:0,shape:S=>S.disk(110),bosses:[[r,0,PK.TH+PK.GAP+PK.TH-1,2.4],[-80,0,8,3.5]]},{id:'y',name:'Yoke with shaped groove (groove down)',role:'driven',layer:1,mesh:K.xf(L.groovedPlate([[-70,120],[70,120],[70,14],[300,14],[300,-14],[70,-14],[70,-120],[-70,-120]],ctr.map(([x,y])=>[x,-y]),16,[]),K.M4.mul(K.M4.T(0,0,PK.TH),K.M4.Rx(PI)))}],
  ground:[[O[0],O[1],0,0]],fixed:[{shape:S=>S.rect(120,8,O[0]+440,O[1]-22),l1:1},{shape:S=>S.rect(120,8,O[0]+440,O[1]+22),l1:1}],
  pose(g){return{d:[O[0],O[1],g.phi],y:[O[0]+g.u,O[1],0]};},drive:'Turn the crank disk: the yoke moves at an even speed both ways.'});}

/* 321 · Harrison's maintaining power */
{const sim=window.MB.SIMS[321],RAT=sim.RAT,O=sim.O,{NG,rg0,RG,NB,rb0,RB,RW,ZW}=sim,d0=sim.d0,P=[O[0]+RW+28,O[1]],Dd=[172*Math.cos(-2.75),172*Math.sin(-2.75)],D=[O[0]+Dd[0],O[1]+Dd[1]],ck=[78*Math.cos(-0.9),78*Math.sin(-0.9)];
 const S0=0.35;PK._S(S0);const T=PK.TH;
 const going=()=>{const ring=PK.ext({o:RAT.pts(NG,rg0,RG,1),h:[K.circle(88,96)]},0,T),parts=[ring,PK.ext({o:K.circle(26,40),h:[Sh.hole(0,0)]},0,T)];
   for(let k=0;k<3;k++){const a=-0.9+k*TAU/3;parts.push(PK.ext({o:armPts([22*Math.cos(a),22*Math.sin(a)],[90*Math.cos(a),90*Math.sin(a)],7),h:[]},0,T));
     if(k){const pts=[];const a2=a+d0*0+0.8-0.1,w=2.2;for(let i=0;i<=20;i++){const t=a+(a2-a)*i/20;pts.push([(72+w)*Math.cos(t),(72+w)*Math.sin(t)]);}for(let i=20;i>=0;i--){const t=a+(a2-a)*i/20;pts.push([(72-w)*Math.cos(t),(72-w)*Math.sin(t)]);}
       parts.push(PK.ext({o:pts,h:[]},0,T),PK.ext({o:K.circle(6,20,72*Math.cos(a2),72*Math.sin(a2)),h:[]},0,T));}}
   return K.merge(...parts);};
 const click=()=>{const b=RAT.pawl(NB,rb0,RB,-1,0,ck,30,-PI-0.9,-PI+1.2),tip=[30*Math.cos(b),30*Math.sin(b)];return{o:K.hull([...K.circle(10,24),...K.circle(3.5,16,tip[0],tip[1])]),h:[Sh.hole(0,0)]};};
 const detent=()=>{const tip=[95*Math.cos(-0.15),95*Math.sin(-0.15)];return{o:K.hull([...K.circle(10,24),...K.circle(4,16,tip[0],tip[1])]),h:[Sh.hole(0,0)]};};
 PK.def(321,{S:S0,summary:'Harrison’s maintaining power keeps a weight-driven clock going while it is wound. The barrel drives the going ratchet through a click; the going ratchet drives the great wheel through two springs, so they are always a little bent. While you wind, the barrel turns backwards and the click slips, but the maintaining detent on the frame stops the going ratchet from turning back, and the bent springs keep pushing the great wheel forward.',
  parts:[{id:'gw',name:'Great wheel with two spring studs',role:'driven',layer:0,shape:S=>({o:Sh.gearOutline(RW,ZW),h:[S.hole(0,0)]}),bosses:[1,2].map(k=>{const a=d0-0.9+k*TAU/3+0.8;return[72*Math.cos(a),72*Math.sin(a),PK.TH+PK.GAP+PK.TH-1,2.4];})},
   {id:'tp',name:'Train pinion',role:'driven',layer:0,shape:S=>S.gear(28,12)},
   {id:'gr',name:'Going ratchet with leaf springs (printed in one piece)',role:'link',layer:1,mesh:going(),pins:[[ck[0],ck[1],2]]},
   {id:'ck',name:'Click',role:'small',layer:2,shape:click()},
   {id:'dt',name:'Maintaining detent',role:'link',layer:1,shape:detent()},
   {id:'br',name:'Barrel: ratchet and cord drum (turn it back to wind)',role:'driver',layer:2,t:2,mesh:K.merge(PK.ext({o:RAT.pts(NB,rb0,RB,-1),h:[Sh.hole(0,0)]},0,T),K.lathe([[PK.BORER,T],[40*S0+2,T],[40*S0+2,T+1],[40*S0,T+1.6],[40*S0,2*T+PK.GAP-1.6],[40*S0+2,2*T+PK.GAP-1],[40*S0+2,2*T+PK.GAP],[PK.BORER,2*T+PK.GAP]],48))}],
  ground:[[O[0],O[1],0,3],[P[0],P[1],0,0],[D[0],D[1],1,1]],
  pose(g){const ckb=RAT.pawl(NB,rb0,RB,-1,g.ba-g.ra,ck,30,-PI-0.9,-PI+1.2),b0=RAT.pawl(NB,rb0,RB,-1,0,ck,30,-PI-0.9,-PI+1.2),dtb=RAT.pawl(NG,rg0,RG,1,g.ra,Dd,95,-0.8,0.5);
    const c=Math.cos(g.ra),s=Math.sin(g.ra),cw=[O[0]+ck[0]*c-ck[1]*s,O[1]+ck[0]*s+ck[1]*c];
    return{gw:[O[0],O[1],g.gw],tp:[P[0],P[1],-g.gw*ZW/12+PI/12],gr:[O[0],O[1],g.ra],ck:[cw[0],cw[1],g.ra+ckb-b0],dt:[D[0],D[1],dtb+0.15],br:[O[0],O[1],g.ba]};},
  read:g=>g.wind?'winding: the springs drive the great wheel':'going',
  hardware:['About 60 cm of thin cord and a small weight (a few coins in a bag) wound on the barrel drum.'],
  drive:'Let the weight drive the great wheel. To wind, turn the barrel drum backwards: the great wheel keeps turning while you do.'});}

/* 322 · triangle parallel ruler: the lower triangle is printed on the base; slide the upper one along its long edge */
{const sim=window.MB.SIMS[322],{X0,X1,Y0,Y1}=sim;
 PK.def(322,{S:0.3,summary:'A parallel ruler made of two right-angled triangles laid long edge to long edge. Hold the lower one still and slide the upper one along it: its top edge moves to a new line but never turns, so you can rule a set of parallel lines.',
  parts:[{id:'u',name:'Upper triangle (the ruling edge is on top)',role:'driver',layer:0,shape:S=>({o:[[X0+2,Y0-6],[X0+2,Y1],[X1-6,Y1]],h:[]}),bosses:[[X0+60,Y1+50,6,4]]}],
  fixed:[{shape:S=>({o:[[X0+6,Y0],[X1,Y0],[X1,Y1+2]],h:[]}),l1:0}],plate:{x0:X0-20,y0:Y1-130,x1:X1+150,y1:Y0+20},
  pose(g){return{u:[g.d[0],g.d[1],0]};},drive:'Keep the upper triangle pressed against the long edge and slide it: its top edge stays parallel.'});}

/* 323 · rolling parallel ruler: one axle, two equal wheels */
{const S=0.3,rw=9,Lr=150,W=17,zA=U.BT+rw;
 const ear=(x)=>K.xf(U.wall(0,0,'x',[[0,6,U.SHB]],10,4,10),M4.T(x,0,-6));
 PK.defS(323,{summary:'A rolling parallel ruler: one axle runs the length of the rule and carries a wheel at each end. Because both wheels are fast on the same axle they roll exactly the same distance, so the rule moves square to its edge and every line drawn along it is parallel to the last.',cam:{yaw:0.6,pitch:0.45},
  base:()=>[U.plate(-85,-60,85,60)],
  parts:[{id:'r',name:'Rule with two axle ears',role:'driver',mesh:K.merge(K.box(Lr,W,4,9,0,0),ear(-45),ear(45))},{id:'ax',name:'Axle',role:'link',mesh:U.shaft(Lr-6)},{id:'w',name:'Wheel, rubber-band tyre (press on the axle)',role:'driven',qty:2,mesh:K.merge(K.prism(K.circle(rw,64),[U.octa(U.SH+0.12)],0,4),K.prism(K.circle(rw+0.8,64),[K.circle(rw-0.5,64)],0.8,3.2))}],
  pose(phi,g){const y=-g.y*S+20,a=g.th;const wheel=x=>M4.mul(M4.T(x,y,zA),M4.mul(M4.Ry(PI/2),M4.mul(M4.Rz(-a),M4.T(0,0,-2))));
    return{r:M4.T(0,y,zA),ax:M4.mul(M4.T(0,y,zA),M4.mul(M4.Rx(-a),M4.T(0,0,-U.SH*Math.cos(PI/8)))),w:[wheel(-Lr/2+4),wheel(Lr/2-8)]};},
  read:(phi,g)=>`moved ${(g.y*S).toFixed(0)} mm`,drive:'Roll the rule across the paper: it moves square to its edge.'});}

/* 324 · crossed-arm parallel ruler: pinned ends and pins in slots */
{const sim=window.MB.SIMS[324],{L,xa,y0}=sim,sa=xa+L*Math.cos(0.78)-2,sb=xa+L*Math.cos(0.28)+2,H=34;
 const rule=(slotY)=>S=>({o:[[150,-H/2],[670,-H/2],[670,H/2],[150,H/2]].map(([x,y])=>[x-xa,y]),h:[S.slotPts(sa-xa,0,sb-xa,0)]});
 PK.def(324,{S:0.3,summary:'Two rules joined by two equal arms crossed and pivoted at their middles. Each arm is pinned to one rule at one end and its other end slides in a slot in the other rule, so the upper rule rises straight up, square to the lower, as well as staying parallel.',
  parts:[{id:'lo',name:'Lower rule with slot',role:'frame',layer:0,shape:rule()},{id:'a1',name:'Arm pinned to the lower rule',role:'link',layer:1,shape:S=>S.bar(L,12,[0,L/2,L])},{id:'a2',name:'Arm pinned to the upper rule',role:'link',layer:2,shape:S=>S.bar(L,12,[0,L])},{id:'up',name:'Upper rule with slot (the ruling edge)',role:'driver',layer:3,shape:rule()}],
  ground:[[xa+L*Math.cos(0.5)/2,y0-L*Math.sin(0.5)/2,0,0]].slice(0,0),
  plate:{x0:130,y0:y0-L-40,x1:690,y1:y0+40},
  pose(g){const y1=y0-g.h,xs=xa+g.c;return{lo:[xa,y0,0],a1:[xa,y0,Math.atan2(y1-y0,xs-xa)],a2:[xa,y1,Math.atan2(y0-y1,xs-xa)],up:[xa,y1,0]};},
  hardware:['Five short pins: 2 mm × 16 mm (or lengths of 1.75 mm filament) for the two pinned ends, the two slot pins and the centre pivot.'],
  drive:'Hold the lower rule and lift the upper: it rises straight up.'});}

/* 325 · swing-arm parallel ruler (a parallelogram) */
{const sim=window.MB.SIMS[325],y0=380,La=120;
 PK.def(325,{S:0.3,summary:'The common parallel ruler: two rules joined by two equal swinging arms, making a parallelogram. However far it is opened, the upper rule stays parallel to the lower.',
  parts:[{id:'lo',name:'Lower rule',role:'frame',layer:0,shape:S=>S.rect(480,30,140,0,[[0,0],[280,0]])},{id:'ar',name:'Swinging arm',role:'link',qty:2,layer:1,shape:S=>S.bar(La,12)},{id:'up',name:'Upper rule',role:'driver',layer:2,shape:S=>S.rect(480,30,140,0,[[0,0],[280,0]])}],
  plate:{x0:130,y0:y0-La-50,x1:670,y1:y0+40},
  pose(g){const dx=La*Math.cos(g.a),dy=La*Math.sin(g.a),Y=y0+15;return{lo:[260,Y,0],ar:[[260,Y,-g.a],[540,Y,-g.a]],up:[260+dx,Y-dy,0]};},
  hardware:['Four short pins (2 mm × 14 mm, or filament) for the arm joints.'],drive:'Hold the lower rule and swing the upper one open.'});}

/* 349 · jointed parallel ruler: two parallelograms one above the other */
{const sim=window.MB.SIMS[349],l=sim.l,y0=430;
 PK.def(349,{S:0.3,summary:'A parallel ruler with jointed arms: each arm is two links with a joint in the middle, and a middle bar ties the two joints together. Each half is a parallelogram, so the rule opens twice as far as a plain one while every bar stays parallel.',
  parts:[{id:'lo',name:'Lower rule',role:'frame',layer:0,shape:S=>S.rect(500,30,140,0,[[0,0],[280,0]])},{id:'k1',name:'Lower link',role:'link',qty:2,layer:1,shape:S=>S.bar(l,11)},{id:'mb',name:'Middle bar',role:'link',layer:2,shape:S=>S.rect(360,12,140,0,[[0,0],[280,0]])},{id:'k2',name:'Upper link',role:'link',qty:2,layer:3,shape:S=>S.bar(l,11)},{id:'up',name:'Upper rule',role:'driver',layer:4,shape:S=>S.rect(500,30,140,0,[[0,0],[280,0]])}],
  plate:{x0:130,y0:y0-2*l-50,x1:690,y1:y0+40},
  pose(g){const d1=[l*Math.cos(g.a1),l*Math.sin(g.a1)],d2=[l*Math.cos(g.a2),l*Math.sin(g.a2)],M=[260+d1[0],y0+d1[1]],T=[M[0]+d2[0],M[1]+d2[1]];
    return{lo:[260,y0,0],k1:[[260,y0,g.a1],[540,y0,g.a1]],mb:[M[0],M[1],0],k2:[[M[0],M[1],g.a2],[M[0]+280,M[1],g.a2]],up:[T[0],T[1],0]};},
  hardware:['Eight short pins (2 mm × 14 mm, or filament) for the joints.'],drive:'Hold the lower rule and open the upper one: each half opens like a plain parallel ruler.'});}

/* 328 · Cartwright's parallel motion: two equal gears with equal cranks */
{const sim=window.MB.SIMS[328],A=[340,400],B=[460,400],r=sim.r,Lr=sim.L,w=sim.w;
 PK.def(328,{S:0.3,summary:'Cartwright’s parallel motion: two equal gears mesh and turn opposite ways, each with an equal crank. Two equal rods join the cranks to the ends of the cross-head, so the pulls are always mirror images and the cross-head (and piston rod) moves exactly straight.',
  parts:[{id:'ga',name:'Left gear with crank pin',role:'driver',layer:0,shape:S=>S.gear(60,24),pins:[[r,0,2]]},{id:'gb',name:'Right gear with crank pin',role:'driven',layer:0,shape:S=>S.gear(60,24),pins:[[r,0,2]]},
   {id:'rd',name:'Connecting rod',role:'link',qty:2,layer:2,shape:S=>S.bar(Lr,12)},
   {id:'x',name:'Cross-head and piston rod',role:'driven',layer:1,shape:S=>({o:[[-w-10,-10],[-12,-10],[-12,-150],[12,-150],[12,-10],[w+10,-10],[w+10,10],[-w-10,10]],h:[]}),pins:[[-w,0,2],[w,0,2]]}],
  ground:[[A[0],A[1],0,0],[B[0],B[1],0,0]],fixed:[{shape:S=>S.rect(8,90,400-18,85),l1:1},{shape:S=>S.rect(8,90,400+18,85),l1:1}],
  pose(g){const L=[400-w,g.yc],R=[400+w,g.yc];return{ga:[A[0],A[1],g.phi],gb:[B[0],B[1],PI-g.phi],rd:[[g.pa[0],g.pa[1],Math.atan2(L[1]-g.pa[1],L[0]-g.pa[0])],[g.pb[0],g.pb[1],Math.atan2(R[1]-g.pb[1],R[0]-g.pb[0])]],x:[400,g.yc,0]};},
  drive:'Turn either gear: the piston rod slides straight up and down between its guides without needing them.'});}

/* 329 · Tusi couple: a gear rolls inside a ring of twice its size */
{const sim=window.MB.SIMS[329],O=sim.O,mv=(sh)=>({o:sh.o.map(([x,y])=>[x+O[0],y+O[1]]),h:(sh.h||[]).map(h=>h.map(([x,y])=>[x+O[0],y+O[1]]))});
 PK.def(329,{S:0.25,summary:'A gear rolling inside a fixed internal gear of twice its pitch diameter (the Tusi couple, also used by James White). Every point on the small gear’s pitch circle moves in an exact straight line across a diameter of the ring, so a pin on it drives the slide back and forth with no guide links at all.',
  parts:[{id:'a',name:'Carrier arm (under the gear)',role:'link',layer:0,shape:S=>S.bar(75,14),bosses:[[75,0,PK.TH+PK.GAP+PK.TH-0.6,PK.PINR]]},
   {id:'p',name:'Rolling gear with tracing pin',role:'driver',layer:1,shape:S=>S.gear(75,30),bosses:[[75,0,PK.TH+PK.GAP+PK.TH-0.6,PK.PINR]]},
   {id:'s',name:'Slide with guide slot',role:'driven',layer:2,shape:S=>({o:K.hull([...K.circle(16,24),...K.circle(16,24,440,0)]),h:[S.hole(0,0),S.slotPts(40,0,410,0)]})}],
  ground:[[O[0],O[1],0,0,false],[O[0]+200,O[1],2,2],[O[0]+250,O[1],2,2]],
  fixed:[{shape:S=>mv(S.ring(150,60,175)),l1:1}],
  pose(g){return{a:[O[0],O[1],g.phi],p:[g.C[0],g.C[1],-g.phi],s:[g.P[0],g.P[1],0]};},
  drive:'Push the slide back and forth (or roll the gear round): the pin on the gear runs along a straight line through the centre.'});}

/* 334 · rack on the piston rod meshing with the toothed end of the beam */
{const F=[460,200],R=150,md=5,p=PI*md,x0=F[0]-R;
 const sector=()=>{const pts=Sh.gearOutline(R,60).filter(([x,y])=>Math.abs(Math.atan2(y,x))<0.5).map(([x,y])=>[-x,-y]).sort((u,v)=>Math.atan2(-u[1],-u[0])-Math.atan2(-v[1],-v[0]));
   return{o:[...pts,[0,-14],[270,-12],[270,12],[0,14]].reverse().reverse(),h:[Sh.hole(0,0)]};};
 const rack=()=>{const r=Sh.rack(-150,150,md,10,{c0:p/2});return K.merge(PK.ext({o:r.o.map(([x,y])=>[-y,x]),h:[]},0,PK.TH),PK.ext({o:[[-24,150],[-14,150],[-14,230],[-24,230]],h:[]},0,PK.TH),PK.ext({o:[[-60,230],[30,230],[30,262],[-60,262]],h:[]},0,PK.TH));};
 PK.def(334,{S:0.3,up:true,summary:'Instead of a parallel motion, the piston rod carries a rack that meshes with a toothed sector on the end of the beam. The rack and sector have the same module, so the rod moves exactly R·θ as the beam rocks and is kept straight by the teeth and a back guide.',
  parts:[{id:'b',name:'Beam with toothed sector',role:'driven',layer:0,shape:sector()},{id:'r',name:'Rack, piston rod and piston',role:'driver',layer:0,mesh:rack()}],
  ground:[[F[0],F[1],0,0]],fixed:[{shape:S=>S.rect(8,420,x0-1.25*md-14-10,F[1]),l1:0},{shape:S=>S.rect(8,120,x0-60-4-30,F[1]+300),l1:0},{shape:S=>S.rect(8,120,x0+30+4,F[1]+300),l1:0}],
  pose(g){return{b:[F[0],F[1],g.a],r:[x0,F[1]-R*g.a,0]};},drive:'Push the piston up and down: the beam rocks on its centre.'});}

/* 335 · Watt's linkage: two radius bars and a link; the middle of the link moves on a nearly straight line */
{const sim=window.MB.SIMS[335],A=sim.A,D=sim.D,l=sim.l,c=sim.c;
 PK.def(335,{S:0.3,summary:'Watt’s parallel motion in its simplest form: two equal radius bars swinging in opposite directions joined by a short link. As the bars swing, the middle point of the link travels on a long, very nearly straight line (a flattened figure of eight), which Watt used to guide the piston rod of his beam engines.',
  parts:[{id:'r1',name:'Radius bar',role:'driver',layer:0,shape:S=>S.bar(l,14),pins:[[l,0,1]]},{id:'r2',name:'Radius bar',role:'link',layer:0,shape:S=>S.bar(l,14),pins:[[l,0,1]]},{id:'k',name:'Link with tracing point',role:'driven',layer:1,shape:S=>({o:K.hull([...K.circle(14,24),...K.circle(14,24,c,0)]),h:[S.hole(0,0),S.hole(c,0),S.circle(4,16,c/2,0)]})}],
  ground:[[A[0],A[1],0,0],[D[0],D[1],0,0]],
  pose(g){return{r1:[A[0],A[1],Math.atan2(g.B[1]-A[1],g.B[0]-A[0])],r2:[D[0],D[1],Math.atan2(g.Cc[1]-D[1],g.Cc[0]-D[0])],k:[g.B[0],g.B[1],Math.atan2(g.Cc[1]-g.B[1],g.Cc[0]-g.B[0])]};},
  drive:'Swing one radius bar and push a pencil through the hole in the middle of the link: it draws a nearly straight line.'});}

/* 340 · beam on a rocking pillar with a radius bar */
{const sim=window.MB.SIMS[340],G=sim.G,a=sim.a,Rf=sim.Rf,q0=sim.geo(0),Lr=Math.hypot(q0.Cc[0]-Rf[0],q0.Cc[1]-Rf[1]);
 PK.def(340,{S:0.3,summary:'A beam carried on a rocking pillar. The pillar rocks on its foot and holds the middle of the beam; a radius bar holds one end of the beam nearly on the level of the foot, and so the other end, where the piston rod is jointed, moves almost straight up and down over the foot (Scott Russell’s straight-line motion, with a radius bar for the slide).',
  parts:[{id:'pl',name:'Rocking pillar',role:'link',layer:0,shape:S=>S.bar(a,16),pins:[[a,0,1]]},{id:'rb',name:'Radius bar',role:'link',layer:0,shape:S=>S.bar(Lr,12),pins:[[Lr,0,1]]},
   {id:'bm',name:'Beam',role:'link',layer:1,shape:S=>S.bar(2*a,16,[0,a,2*a]),pins:[[0,0,2]]},{id:'pr',name:'Piston rod',role:'driver',layer:2,shape:S=>({o:K.hull([...K.circle(12,24),...K.circle(7,24,0,-170)]),h:[S.hole(0,0)]})}],
  ground:[[G[0],G[1],0,0],[Rf[0],Rf[1],0,0]],fixed:[{shape:S=>S.rect(8,110,G[0]-14,95),l1:2},{shape:S=>S.rect(8,110,G[0]+14,95),l1:2}],plate:{x0:G[0]-120,y0:30,x1:Rf[0]+90,y1:G[1]+30},up:true,
  pose(g){return{pl:[G[0],G[1],Math.atan2(g.T[1]-G[1],g.T[0]-G[0])],rb:[Rf[0],Rf[1],Math.atan2(g.Cc[1]-Rf[1],g.Cc[0]-Rf[0])],bm:[g.Cc[0],g.Cc[1],Math.atan2(g.B[1]-g.Cc[1],g.B[0]-g.Cc[0])],pr:[g.B[0],g.B[1],0]};},
  drive:'Push the piston rod up and down between its guides: the pillar rocks and the radius bar swings.'});}

/* 341 · grasshopper beam engine */
{const sim=window.MB.SIMS[341],G=sim.G,O=sim.O,R0=PK.runner(341),g0=R0.at(0),hm=Math.hypot(g0.M[0]-g0.H[0],g0.M[1]-g0.H[1]),he=Math.hypot(g0.E[0]-g0.H[0],g0.E[1]-g0.H[1]);
 PK.def(341,{S:0.3,up:true,summary:'The grasshopper beam engine: instead of resting on a tall central pillar, the beam is pinned at one end to a short rocking link. The piston rod works the beam near that end, and the far end drives the crank through a connecting rod, so the whole engine is low and compact.',
  parts:[{id:'rl',name:'Rocking link',role:'link',layer:0,shape:S=>S.bar(120,14),pins:[[120,0,1]]},
   {id:'pr',name:'Cross-head and piston rod',role:'driver',layer:0,shape:S=>({o:[[-20,-16],[20,-16],[20,16],[8,16],[8,170],[-8,170],[-8,16],[-20,16]],h:[]}),pins:[[0,0,1]]},
   {id:'bm',name:'Grasshopper beam',role:'link',layer:1,shape:S=>S.bar(he,18,[0,hm,he]),pins:[[he,0,2]]},
   {id:'cr',name:'Connecting rod',role:'link',layer:2,shape:S=>S.bar(190,12)},
   {id:'fw',name:'Flywheel with crank pin',role:'driven',layer:0,shape:S=>({o:K.circle(120,96),h:[S.hole(0,0),...[0,1,2,3,4].map(k=>K.circle(28,32,78*Math.cos(k*TAU/5+0.6),78*Math.sin(k*TAU/5+0.6)))]}),pins:[[70,0,2]]}],
  ground:[[G[0],G[1],0,0],[O[0],O[1],0,0]],
  fixed:[{shape:S=>S.rect(8,190,330-14,385),l1:0},{shape:S=>S.rect(8,190,330+14,385),l1:0},{shape:S=>S.rect(36,8,330,484),l1:0}],
  pose(g){const ang=(A,B)=>Math.atan2(B[1]-A[1],B[0]-A[0]);return{rl:[G[0],G[1],ang(G,g.H)],pr:[g.M[0],g.M[1],0],bm:[g.H[0],g.H[1],ang(g.H,g.E)],cr:[g.E[0],g.E[1],ang(g.E,g.B)],fw:[O[0],O[1],ang(O,g.B)]};},
  drive:'Push the piston rod up and down: the beam rocks on its link and the flywheel turns.'});}

/* 342 · atmospheric engine: arch-headed beam with chains */
{const F=[400,140],R=170,xL=F[0]-R,xR=F[0]+R;
 const beam=()=>{const arc=(a0,a1)=>{const o=[];for(let i=0;i<=16;i++){const t=a0+(a1-a0)*i/16;o.push([R*Math.cos(t),R*Math.sin(t)]);}for(let i=16;i>=0;i--){const t=a0+(a1-a0)*i/16;o.push([(R-16)*Math.cos(t),(R-16)*Math.sin(t)]);}return o;};
   return K.merge(PK.ext({o:K.hull([...K.circle(16,24),...K.circle(12,24,-R+10,0),...K.circle(12,24,R-10,0)]),h:[Sh.hole(0,0)]},0,PK.TH),PK.ext({o:arc(PI-0.32,PI+0.36),h:[]},0,PK.TH),PK.ext({o:arc(-0.36,0.32),h:[]},0,PK.TH));};
 PK.def(342,{S:0.3,up:true,summary:'Newcomen’s atmospheric engine. Steam under the piston is condensed by a jet of water, leaving a vacuum, and the air pressure above drives the piston down. The beam’s arched ends keep both chains hanging straight: one to the piston, the other to the pump rod, whose weight lifts the piston again.',
  parts:[{id:'b',name:'Beam with arch heads',role:'link',layer:0,mesh:beam()},{id:'p',name:'Piston',role:'driver',layer:0,shape:S=>S.rect(96,20,0,10)},{id:'r',name:'Pump rod',role:'driven',layer:0,shape:S=>S.rect(14,150,0,75)}],
  ground:[[F[0],F[1],0,0]],
  fixed:[{shape:S=>S.rect(8,220,xL-52,370),l1:0},{shape:S=>S.rect(8,220,xL+52,370),l1:0},{shape:S=>S.rect(112,8,xL,484),l1:0},{shape:S=>S.rect(8,80,xR-13,460),l1:0},{shape:S=>S.rect(8,80,xR+13,460),l1:0},{shape:S=>S.rect(28,40,F[0],F[1]+60),l1:0}].slice(0,5),
  pose(g){const sa=Math.sin(g.a);return{b:[F[0],F[1],g.a],p:[xL,300-R*sa,0],r:[xR,330+R*sa,0]};},
  ropes(g){const z=PK.zl(0)+2,ch=(a0,a1,end)=>{const pts=[];for(let i=0;i<=12;i++){const t=a0+(a1-a0)*i/12;pts.push([F[0]+R*Math.cos(t),F[1]+R*Math.sin(t),z]);}pts.push([end[0],end[1],z]);return{pts,r:0.8};};
    const sa=Math.sin(g.a);return[ch(PI+0.36+g.a,PI,[xL,300-R*sa]),ch(-0.36+g.a,0,[xR,330+R*sa])];},
  hardware:['Two lengths of thin chain or cord, about 12 cm each, glued to the tops of the arch heads.'],
  drive:'Pull the piston down: the beam rocks and lifts the pump rod; let go and the pump rod’s weight draws the piston up.'});}

/* 344 (and 171) · oscillating engine: the cylinder rocks on trunnions */
for(const n of [344,171]){const sim=window.MB.SIMS[n];if(!sim||!sim.T)continue;const T=sim.T,O=sim.O,r=sim.r,TH=PK.TH,G=PK.GAP;
 const cyl=()=>K.merge(PK.ext({o:[[-90,-44],[160,-44],[160,44],[-90,44]],h:[Sh.hole(0,0)]},0,TH),PK.ext({o:[[-90,-44],[160,-44],[160,-34],[-90,-34]],h:[]},TH+G,2*TH+G),PK.ext({o:[[-90,34],[160,34],[160,44],[-90,44]],h:[]},TH+G,2*TH+G),PK.ext({o:[[-90,-34],[-80,-34],[-80,34],[-90,34]],h:[]},TH+G,2*TH+G),PK.ext({o:[[-90,-44],[160,-44],[160,44],[-90,44]],h:[Sh.hole(0,0)]},TH,TH+G));
 PK.def(n,{S:0.3,summary:'An oscillating engine: the cylinder is hung on trunnions at its middle and rocks as the piston rod, jointed straight to the crank, follows the crank pin round. No connecting rod or cross-head is needed, and the rocking itself can open and close the steam ports.',
  parts:[{id:'fw',name:'Flywheel with crank pin',role:'driven',layer:0,shape:S=>({o:K.circle(120,96),h:[S.hole(0,0),...[0,1,2,3,4].map(k=>K.circle(30,32,80*Math.cos(k*TAU/5+0.6),80*Math.sin(k*TAU/5+0.6)))]}),pins:[[r,0,2]]},
   {id:'c',name:'Cylinder (floor and walls in one piece, open at the crank end)',role:'link',layer:1,t:2,mesh:cyl()},
   {id:'p',name:'Piston and rod',role:'driver',layer:2,mesh:K.merge(PK.ext({o:[[-15,-31],[15,-31],[15,31],[-15,31]],h:[]},0,TH),PK.ext({o:K.hull([...K.circle(6,16,0,0),...K.circle(12,24,250,0)]),h:[Sh.hole(250,0)]},0,TH))}],
  ground:[[T[0],T[1],1,1,false],[O[0],O[1],0,0]],
  pose(g){const c=Math.cos(g.a),s=Math.sin(g.a),d=g.d-250;return{fw:[O[0],O[1],g.phi],c:[T[0],T[1],g.a],p:[T[0]+d*c,T[1]+d*s,g.a]};},
  drive:'Turn the flywheel: the cylinder rocks on its trunnion while the piston slides in and out.'});}

/* 345 · pendulum engine: the cylinder swings from trunnions at its top */
{const sim=window.MB.SIMS[345],T=sim.T,O=sim.O,r=sim.r,TH=PK.TH;
 const cyl=()=>K.merge(PK.ext({o:[[-44,-12],[44,-12],[44,10],[-44,10]],h:[Sh.hole(0,0)]},0,TH),PK.ext({o:[[-44,10],[-34,10],[-34,232],[-44,232]],h:[]},0,TH),PK.ext({o:[[34,10],[44,10],[44,232],[34,232]],h:[]},0,TH));
 PK.def(345,{S:0.3,up:true,summary:'The pendulum engine: the cylinder hangs from trunnions at its top and swings like a pendulum as its piston rod, jointed straight to the crank, follows the crank pin round.',
  parts:[{id:'fw',name:'Flywheel with crank pin',role:'driven',layer:0,shape:S=>({o:K.circle(110,96),h:[S.hole(0,0),...[0,1,2,3,4].map(k=>K.circle(26,32,72*Math.cos(k*TAU/5+0.6),72*Math.sin(k*TAU/5+0.6)))]}),pins:[[r,0,1]]},
   {id:'c',name:'Cylinder (open at the bottom)',role:'link',layer:1,mesh:cyl()},
   {id:'p',name:'Piston and rod',role:'driver',layer:1,mesh:K.merge(PK.ext({o:[[-31,0],[31,0],[31,24],[-31,24]],h:[]},0,TH),PK.ext({o:K.hull([...K.circle(6,16,0,12),...K.circle(12,24,0,160)]),h:[Sh.hole(0,160)]},0,TH))}],
  ground:[[T[0],T[1],1,1],[O[0],O[1],0,0]],
  pose(g){const a=-g.a,c=Math.cos(a),s=Math.sin(a),d=g.d-160;return{fw:[O[0],O[1],g.phi],c:[T[0],T[1],a],p:[T[0]-d*s,T[1]+d*c,a]};},
  drive:'Turn the flywheel: the cylinder swings to and fro on its top trunnion.'});}

/* 346 · fixed cylinder; a cross-head with two side rods drives two cranks */
{const y0=300,r=60,Lr=200;
 PK.def(346,{S:0.3,summary:'A fixed cylinder whose piston rod carries a long cross-head. A side rod from each end of the cross-head drives its own crank, so the push is shared between two cranks turning together, one on each side of the cylinder’s line.',
  parts:[{id:'ca',name:'Upper crank disk',role:'driven',layer:0,shape:S=>S.disk(72),pins:[[r,0,1]]},{id:'cb',name:'Lower crank disk',role:'driven',layer:0,shape:S=>S.disk(72),pins:[[r,0,1]]},
   {id:'sr',name:'Side rod',role:'link',qty:2,layer:1,shape:S=>S.bar(Lr,12)},
   {id:'x',name:'Cross-head and piston rod',role:'driver',layer:0,shape:S=>({o:[[-10,-110],[10,-110],[10,-6],[230,-6],[230,6],[10,6],[10,110],[-10,110]],h:[]}),pins:[[0,-100,1],[0,100,1]]}],
  ground:[[260,y0-100,0,0],[260,y0+100,0,0]],
  fixed:[{shape:S=>S.rect(180,8,650,y0-14),l1:0},{shape:S=>S.rect(180,8,650,y0+14),l1:0},{shape:S=>S.rect(8,36,744,y0),l1:0}],
  pose(g){const o={ca:[260,y0-100,g.phi],cb:[260,y0+100,g.phi],x:[g.x,y0,0],sr:[]};for(const s of [-1,1]){const pin=[260+r*Math.cos(g.phi),y0+s*100+r*Math.sin(g.phi)];o.sr.push([pin[0],pin[1],Math.atan2(y0+s*100-pin[1],g.x-pin[0])]);}return o;},
  drive:'Push the piston rod in and out: both cranks turn together.'});}

/* 347 · disk engine: the disk nods round in its spherical chamber and its spindle turns the crank */
{const sim=window.MB.SIMS[347],S=0.25,R=sim.R*S,t=sim.t,Ls=sim.Ls*S,zc=U.BT+R*Math.tan(t)+8,zk=zc+Ls*Math.cos(t),rk=Ls*Math.sin(t);
 PK.defS(347,{summary:'Bishop’s disk engine, with the top half of the chamber left off so you can see inside. The disk piston sits on a ball at the centre of a chamber whose floor and roof are shallow cones; a fixed partition passes through a slot in the disk, so it cannot spin. Steam admitted on one side of the partition makes the disk nod round, and its spindle, sweeping a cone, turns the crank on the upright shaft once per nod.',cam:{yaw:0.7,pitch:0.42},
  base:()=>[U.plate(-R-12,-R-12,R+12,R+12),K.lathe([[0.01,U.BT],[R+5,U.BT],[R+5,zc],[R+0.6,zc],[(R+0.6)*Math.cos(t),zc-(R+0.6)*Math.sin(t)],[9,zc-9*Math.tan(t)-0.6],[6.5,zc-7],[0.01,zc-7]],64),
    K.box(R-12,1.6,zc-R*Math.tan(t)*0.6,zc+0.5,(R+12)/2+3,0),K.box(6,6,U.BT,zk+12,-R-6,0),K.box(6,6,U.BT,zk+12,R+6,0),K.box(2*R+18,8,zk+12,zk+16,0,0)],
  parts:[{id:'d',name:'Disk piston with ball and spindle (slot over the partition)',role:'driver',mesh:K.merge(K.prism(K.circle(R-0.8,72),[K.slot(R*0.7,2.4,10,R*0.58,0,0)],-1.2,1.2),K.lathe([[0.01,-6.5],[4.5,-4.5],[6.5,0],[4.5,4.5],[0.01,6.5]],32),K.cyl(1.8,0,Ls+3,16))},
   {id:'k',name:'Crank with upright shaft and pulley',role:'driven',mesh:K.merge(K.cyl(2.2,0,zk+22-zk,20),K.prism(K.hull([...K.circle(4,20),...K.circle(3.6,20,rk,0)]),[K.circle(2.1,20,rk,0)],-1.5,1.5),K.xf(K.lathe([[2.2,0],[12,0],[12,1],[10.5,2],[12,3],[12,4],[2.2,4]],48),M4.T(0,0,18)))}],
  pose(phi){const n=[Math.sin(t)*Math.cos(phi),Math.sin(t)*Math.sin(phi),Math.cos(t)],d=[n[2],0,-n[0]],L=Math.hypot(d[0],d[2]);return{d:U.at([0,0,zc],n,0,[d[0]/L,0,d[2]/L]),k:M4.mul(M4.T(0,0,zk),M4.Rz(phi))};},
  read:(phi)=>`crank ${(phi/TAU).toFixed(2)} turns`,drive:'Turn the pulley: the disk nods round on its ball without spinning (or rock the disk and the crank turns).'});}

/* 348 · disk with a four-lobed groove (two crossed slots); printed groove-side down and carried on a ledge */
{const sim=window.MB.SIMS[348],O=sim.O,a=sim.a,w=9.5,TH=PK.TH,G=PK.GAP;
 const curve=[];for(let i=0;i<720;i++){const th=i/720*TAU,r=a*Math.cos(2*th);curve.push([r*Math.cos(th),r*Math.sin(th)]);}
 const dist=(x,y)=>{let m=1e9;for(const p of curve){const d=(p[0]-x)**2+(p[1]-y)**2;if(d<m)m=d;}return Math.sqrt(m);};
 const inRose=(x,y)=>{const r=Math.hypot(x,y),t=Math.atan2(y,x);return r<=a*Math.abs(Math.cos(2*t));};
 /* outer edge of the groove band (star-shaped about the centre) */
 const env=[];for(let i=0;i<240;i++){const t=i/240*TAU;let lo=0,hi=a+w+4;for(let k=0;k<30;k++){const m=(lo+hi)/2,x=m*Math.cos(t),y=m*Math.sin(t);if(inRose(x,y)||dist(x,y)<=w)lo=m;else hi=m;}env.push([lo*Math.cos(t),lo*Math.sin(t)]);}
 /* the four islands inside the lobes */
 const islands=[0,1,2,3].map(k=>{const c0=k*PI/2,c=[a*0.5*Math.cos(c0),a*0.5*Math.sin(c0)],o=[];for(let i=0;i<120;i++){const t=i/120*TAU;let lo=0,hi=a;for(let j=0;j<30;j++){const m=(lo+hi)/2,x=c[0]+m*Math.cos(t),y=c[1]+m*Math.sin(t);if(inRose(x,y)&&dist(x,y)>=w)lo=m;else hi=m;}o.push([c[0]+lo*Math.cos(t),c[1]+lo*Math.sin(t)]);}return o;});
 const disk=()=>K.merge(PK.ext({o:K.circle(130,120),h:[env]},0,TH-1.4),...islands.map(o=>PK.ext({o,h:[]},0,TH-1.4)),PK.ext({o:K.circle(130,120),h:[]},TH-1.4,TH),K.cyl(3.2,TH,TH+10,20,105*0.3,0));
 const mv=pts=>pts.map(([x,y])=>[x+O[0],y+O[1]]),arc=(r0,r1,a0,a1)=>{const o=[];for(let i=0;i<=40;i++){const t=a0+(a1-a0)*i/40;o.push([r1*Math.cos(t),r1*Math.sin(t)]);}for(let i=40;i>=0;i--){const t=a0+(a1-a0)*i/40;o.push([r0*Math.cos(t),r0*Math.sin(t)]);}return mv(o);};
 PK.def(348,{S:0.3,summary:'A disk with two crossed slots joined round the edge into a four-lobed groove, the curve r = a·cos 2θ. The slide’s pin runs in the groove; each lobe carries the pin out and back once, so the slide makes two complete strokes for every turn of the disk, passing straight through the crossing at the centre.',
  parts:[{id:'d',name:'Grooved disk (print groove side up, fit groove side down)',role:'driver',layer:1,mesh:disk()},{id:'s',name:'Slide with pin',role:'driven',layer:0,shape:S=>({o:K.hull([...K.circle(14,24),...K.circle(10,24,300,0)]),h:[]}),bosses:[[0,0,G+TH-1.8,2.3]]}],
  fixed:[{shape:S=>({o:arc(108,130,0.3,TAU-0.3),h:[]}),l1:0},{shape:S=>({o:arc(132,140,0.2,TAU-0.2),h:[]}),l1:1},{shape:S=>S.rect(160,8,O[0]+230,O[1]-16),l1:0},{shape:S=>S.rect(160,8,O[0]+230,O[1]+16),l1:0}],
  pose(g){return{d:[O[0],O[1],g.phi],s:[O[0]+g.x,O[1],0]};},
  drive:'Turn the disk by its knob: the slide makes two strokes per turn.'});}

/* 351 · rack stamp: a part-toothed pinion lifts the rack and lets it drop */
{const P=[300,230],R=40,Z=16,tau=TAU/Z,p=R*tau,md=2*R/Z,nT=10,X=P[0]+R;PK._S(0.35);
 const pin=()=>{const rr=R-1.25*md;const o=Sh.gearOutline(R,Z).map(([x,y])=>{const t=((Math.atan2(y,x)+tau/2)%TAU+TAU)%TAU;if(t<nT*tau)return[x,y];const r=Math.min(Math.hypot(x,y),rr),q=Math.atan2(y,x);return[r*Math.cos(q),r*Math.sin(q)];});return{o,h:[Sh.hole(0,0)]};};
 const rack=()=>{const r=Sh.rack(-12.5*p,1.5*p,md,18,{c0:p/2});return K.merge(PK.ext({o:r.o.map(([x,y])=>[y,x]).reverse(),h:[]},0,PK.TH),PK.ext({o:[[1.25*md,1.5*p],[1.25*md+18,1.5*p],[1.25*md+18,200],[1.25*md,200]],h:[]},0,PK.TH),PK.ext({o:[[-6,200],[94,200],[94,250],[-6,250]],h:[]},0,PK.TH));};
 PK.def(351,{S:0.35,up:true,summary:'A rack stamp: a pinion with teeth on only ten of its sixteen places lifts the toothed stamp rod one tooth at a time; when its blank part comes round, the rod drops and the stamp strikes. The first tooth then catches the bottom of the rack again.',
  parts:[{id:'p',name:'Part-toothed pinion with crank knob',role:'driver',layer:0,shape:pin(),bosses:[[-22,0,10,3.5]]},{id:'r',name:'Toothed stamp rod',role:'driven',layer:0,mesh:rack()}],
  ground:[[P[0],P[1],0,0]],fixed:[{shape:S=>S.rect(8,420,X+1.25*md+18+8,P[1]-20),l1:0},{shape:S=>S.rect(8,150,X-md-8,P[1]+130),l1:0},{shape:S=>S.rect(140,24,X+44,P[1]+262),l1:0}],
  pose(g){return{p:[P[0],P[1],g.al],r:[X,P[1]-g.y,0]};},drive:'Turn the pinion by its knob: the stamp is lifted, then drops.'});}

/* 353 · belly-helve hammer */
{const sim=window.MB.SIMS[353],F=sim.F,W=sim.W,Lh=sim.Lh,Lt=sim.Lt,rw=sim.rw;
 PK.def(353,{S:0.3,up:true,summary:'A tilt hammer whose helve is a lever of the first order: the wipers on the cam wheel press the tail down behind the pivot, raising the heavy head; when a wiper slips off the end of the tail, the head falls on the anvil. Three blows for each turn of the cam wheel.',
  parts:[{id:'h',name:'Helve with hammer head',role:'driven',layer:0,mesh:K.merge(PK.ext({o:[[-Lh,-10],[Lt,-10],[Lt,10],[-Lh,10]],h:[Sh.hole(0,0)]},0,PK.TH),PK.ext({o:[[-Lh-30,-24],[-Lh+26,-24],[-Lh+26,30],[-Lh-30,30]],h:[]},0,PK.TH))},
   {id:'w',name:'Cam wheel with three wipers',role:'driver',layer:0,mesh:K.merge(PK.ext({o:K.circle(30,40),h:[Sh.hole(0,0)]},0,PK.TH),...[0,1,2].map(k=>{const t=k*TAU/3;return PK.ext({o:armPts([20*Math.cos(t),20*Math.sin(t)],[rw*Math.cos(t),rw*Math.sin(t)],6),h:[]},0,PK.TH);}),PK.ext({o:K.circle(6,20,0,22),h:[]},PK.TH,PK.TH+8))}],
  ground:[[F[0],F[1],0,0],[W[0],W[1],0,0]],fixed:[{shape:S=>S.rect(90,40,F[0]-285,F[1]+60),l1:0}],
  pose(g){return{h:[F[0],F[1],g.a],w:[W[0],W[1],-g.phi*1.5]};},drive:'Turn the cam wheel: the hammer rises and falls three times a turn.'});}

/* 355 · gyroscope precessing on a post */
{const H=U.BT+60,La=38,rw=18;
 PK.defS(355,{summary:'A gyroscope precessing: the spinning wheel’s axle rests on top of the post at one end only. Instead of falling, the wheel swings slowly round the post, its axle staying level, because gravity’s twist turns the direction of its spin rather than tipping it over.',cam:{yaw:0.6,pitch:0.3},
  base:()=>[U.plate(-50,-50,50,50),K.cyl(4,U.BT,H-4,24),K.lathe([[0.01,H-4],[3,H-4],[0.01,H+0.5]],20)],
  parts:[{id:'ax',name:'Axle with pivot cup and wheel bearing',role:'link',mesh:K.merge(K.lathe([[0.01,-2.5],[4.5,-2.5],[4.5,3],[0.01,3]],24),K.xf(K.cyl(1.8,0,La+6,16),M4.Ry(PI/2)))},
   {id:'w',name:'Heavy wheel (spinning)',role:'driver',mesh:K.merge(K.prism(K.circle(rw,64),[K.circle(rw-4,64)],-4,4),K.prism(K.circle(5,24),[K.circle(2.1,20)],-4,4),...[0,1,2,3].map(k=>K.xf(K.box(rw-6,2.4,-1.5,1.5,(rw-2)/2+1,0),M4.Rz(k*PI/2))))}],
  pose(phi,g){const p=g.p,a=M4.mul(M4.T(0,0,H),M4.Rz(p));return{ax:a,w:M4.mul(a,M4.mul(M4.T(La,0,0),M4.mul(M4.Ry(PI/2),M4.Rz(g.spin))))};},
  read:(phi,g)=>`precession ${Math.round(((g.p*180/PI)%360+360)%360)}°`,drive:'Spin the wheel hard with a string, rest the cup on the post and let go: it swings round instead of falling.'});}

/* 356 · gimballed gyroscope: the rotor keeps its direction however the frame is turned */
{const z0=U.BT+52,Ro=42,Rm=35,Ri=28,rr=20;
 const ring=(R,w,plane)=>{const m=K.prism(K.circle(R,96),[K.circle(R-w,96)],-2,2);return plane==='xy'?m:plane==='yz'?K.xf(m,M4.Ry(PI/2)):K.xf(m,M4.Rx(PI/2));};
 PK.defS(356,{summary:'A gyroscope in gimbals: the rotor spins in an inner ring, which pivots in a middle ring, which pivots in the outer ring on its stand, the three pivot axes at right angles. However the stand is tilted or turned, the spinning rotor keeps its axle pointing the same way, which is the principle of the gyrocompass and the aircraft attitude indicator.',cam:{yaw:0.5,pitch:0.25},
  base:()=>[U.plate(-30,-30,30,30),K.cyl(3,U.BT,z0-Ro-2,20),K.lathe([[0.01,z0-Ro-6],[4.5,z0-Ro-6],[0.01,z0-Ro+1]],20)],
  parts:[{id:'o',name:'Outer ring on its stem',role:'driver',mesh:K.merge(ring(Ro,4,'yz'),K.cyl(2.5,-Ro-4,-Ro+1,16),K.xf(K.cyl(1.5,Rm-1,Ro-2,12),M4.Rx(-PI/2)),K.xf(K.cyl(1.5,Rm-1,Ro-2,12),M4.Rx(PI/2)))},
   {id:'m',name:'Middle ring',role:'link',mesh:K.merge(ring(Rm,4,'xy'),K.xf(K.cyl(1.5,Ri-1,Rm-2,12),M4.Ry(PI/2)),K.xf(K.cyl(1.5,Ri-1,Rm-2,12),M4.Ry(-PI/2)))},
   {id:'i',name:'Inner ring',role:'link',mesh:ring(Ri,4,'xz')},
   {id:'r',name:'Rotor with axle',role:'driven',mesh:K.merge(K.prism(K.circle(rr,64),[],-3,3),K.cyl(1.6,-Ri+1,Ri-1,16))}],
  pose(phi,g){const b=0.45*Math.sin(phi*0.3),c=0.55*Math.sin(phi*0.23+1),Tz=M4.T(0,0,z0),St=M4.mul(Tz,M4.mul(M4.Rx(b),M4.Ry(c)));
    return{o:St,m:M4.mul(St,M4.Ry(-c)),i:M4.mul(Tz,M4.id()),r:M4.mul(Tz,M4.Rz(g.spin))};},
  read:(phi)=>'the rotor axle stays upright',drive:'Spin the rotor, then tilt and turn the stand: the rotor’s axle keeps pointing the same way.'});}

/* 358 · fusee drawing a carriage along: the cord climbs from the small end to the large */
{const sim=window.MB.SIMS[358],S=0.3,{x0,x1,r0,r1}=sim,Th=sim.turns*TAU,hz=U.BT+18,X=x=>(x-400)*S,xs=th=>X(x0+(x1-x0)*th/Th),rs=th=>(r0+(r1-r0)*th/Th)*S;
 const fusee=()=>{const prof=[[U.SHB,0]];const n=Math.round(sim.turns*12);for(let i=0;i<=n;i++){const th=i/n*Th,z=xs(th)-xs(0),r=rs(th);prof.push([r+(i%2?0:0.9),z]);}prof.push([U.SHB,xs(Th)-xs(0)]);return K.merge(K.lathe(prof,48),K.lathe([[U.SHB,-2],[rs(0)+3,-2],[rs(0)+3,0],[U.SHB,0]],32),K.lathe([[U.SHB,xs(Th)-xs(0)],[rs(Th)+2,xs(Th)-xs(0)],[rs(Th)+2,xs(Th)-xs(0)+2],[U.SHB,xs(Th)-xs(0)+2]],48));};
 PK.defS(358,{summary:'A fusee draws a carriage along its rails by a cord. The fusee turns steadily, but the cord winds on from the small end towards the large, so each turn takes in more cord than the last and the carriage moves faster and faster; a spring returns it when the fusee is turned back. Change the fusee’s shape and you change how the traverse speeds up.',cam:{yaw:0.4,pitch:0.5},
  base:()=>[U.plate(X(x0)-26,-22,X(760)+8,22),U.wall(X(x0)-8,0,'x',[[0,hz-U.BT+0.0,U.SHB]].map(h=>[0,hz,U.SHB]),14,4),U.wall(X(x1)+8,0,'x',[[0,hz,U.SHB]],14,4),K.box(X(760)-X(300),3,U.BT,U.BT+3,(X(300)+X(760))/2,-8),K.box(X(760)-X(300),3,U.BT,U.BT+3,(X(300)+X(760))/2,8),K.box(4,18,U.BT,U.BT+22,X(760)+4,0)],
  parts:[{id:'f',name:'Fusee with crank (spiral cord groove)',role:'driver',mesh:K.merge(K.xf(fusee(),M4.mul(M4.Ry(PI/2),M4.T(0,0,0))),U.shaft(xs(Th)-xs(0)+30),K.xf(U.crank(10,3),M4.mul(M4.T(-14-0*0,0,0),M4.Ry(-PI/2))))},
   {id:'c',name:'Carriage',role:'driven',mesh:K.merge(K.box(24,13,U.BT+3.2,U.BT+16,0,0),K.cyl(1.2,U.BT+16,hz+r1*S*0.2+2,10,-12,0))}],
  pose(phi,g){return{f:M4.mul(M4.T(xs(0),0,hz),M4.Rx(-g.th)),c:M4.T(X(g.X)+12,0,0)};},
  belts(phi,g){const xg=xs(g.th),r=rs(g.th);return[{pts:[[xg,0,hz+r],[X(g.X),0,hz+r]],r:0.5,closed:false}];},
  read:(phi,g)=>`cord on radius ${(g.r*S).toFixed(1)} mm`,hardware:['About 30 cm of strong thread, tied to the small end of the fusee and to the carriage.','A rubber band from the carriage to the end post, to draw it back.'],
  drive:'Turn the crank steadily: the carriage starts slowly and speeds up.'});}

/* 359 · pump drill */
{const S=0.25,X=400,zp=U.BT,ztop=U.BT+(480-60)*S,zf=U.BT+(480-360)*S,zb=y=>U.BT+(480-y)*S;
 PK.defS(359,{summary:'The pump drill: cords from the ends of the cross bar are wound round the top of the spindle. Pressing the bar down unwinds them and spins the weighted spindle fast; its flywheel carries it on, winding the cords up the other way and lifting the bar, ready for the next push, so the drill turns back and forth.',cam:{yaw:0.5,pitch:0.2},
  base:()=>[U.plate(-40,-25,40,25),K.lathe([[0.01,U.BT],[12,U.BT],[12,U.BT+4],[3,U.BT+5],[0.01,U.BT+5]],32)],
  parts:[{id:'s',name:'Spindle with flywheel and point',role:'driver',mesh:K.merge(K.cyl(2.2,5,ztop-U.BT,16),K.lathe([[0.01,0.5],[2.2,5],[0.01,5]],16),K.xf(K.prism(K.circle(110*S,64),[K.circle(2.2,16)],-3,3),M4.T(0,0,zf-U.BT)))},
   {id:'b',name:'Cross bar (slides on the spindle)',role:'link',mesh:K.prism([[-40,-4],[40,-4],[40,4],[-40,4]],[K.circle(2.8,20)],-2,2)}],
  pose(phi,g){return{s:M4.mul(M4.T(0,0,U.BT+0.5),M4.Rz(g.spin*TAU)),b:M4.T(0,0,zb(g.y))};},
  belts(phi,g){const tw=Math.sin(g.spin*TAU)*3,zt=ztop-6;return[{pts:[[-38,0,zb(g.y)],[tw,2,zt]],r:0.4,closed:false},{pts:[[38,0,zb(g.y)],[-tw,-2,zt]],r:0.4,closed:false}];},
  hardware:['About 40 cm of strong cord, its middle tied through a hole at the top of the spindle and its ends through the ends of the cross bar.'],
  read:(phi,g)=>`spindle ${g.spin.toFixed(2)} turns`,drive:'Twist the spindle to wind the cords, then press the bar down and let it rise, again and again.'});}

/* 360 · rocking beam, drum, pawl and ratchet driving a flywheel shaft */
{const sim=window.MB.SIMS[360],RAT=window.MB.SIMS[321].RAT,F=sim.F,Lb=sim.Lb,S0=sim.S,rd=sim.rd,{N,r0,R}=sim,TH=PK.TH,G=PK.GAP;PK._S(0.3);
 const pawl=()=>{const b=RAT.pawl(N,r0,R,-1,0,[92,0],48,-3.1,-1.8),tip=[48*Math.cos(b),48*Math.sin(b)];return{o:K.hull([...K.circle(11,24),...K.circle(4,16,tip[0],tip[1])]),h:[Sh.hole(0,0)]};};
 PK.def(360,{S:0.3,up:true,summary:'A rocking beam turns a flywheel shaft one way. A cord from the beam is wound on a drum that turns loose on the shaft and carries a pawl; the pawl engages a ratchet fixed to the shaft. As the beam end rises it pulls the drum round and the pawl drives the shaft; on the return a weight turns the drum back while the pawl clicks over the teeth and the flywheel keeps the shaft going.',
  parts:[{id:'fw',name:'Flywheel with hub',role:'driven',layer:0,t:2,mesh:K.merge(PK.ext({o:K.circle(150,120),h:[Sh.hole(0,0),...[0,1,2,3,4,5].map(k=>K.circle(48,40,95*Math.cos(k*PI/3+PI/6),95*Math.sin(k*PI/3+PI/6)))]},0,TH),PK.ext({o:K.circle(15,32),h:[Sh.hole(0,0)]},TH,2*TH+G))},
   {id:'rt',name:'Ratchet (glue onto the flywheel hub)',role:'driven',layer:2,shape:{o:RAT.pts(N,r0,R,-1),h:[Sh.hole(0,0)]}},
   {id:'dr',name:'Drum with pawl arm (turns loose on the hub)',role:'link',layer:1,mesh:PK.ext({o:K.hull([...K.circle(rd,48),...K.circle(14,24,96,0)]),h:[K.circle(16.5,40)]},0,TH),pins:[[92,0,2]]},
   {id:'pw',name:'Pawl',role:'small',layer:2,shape:pawl()},
   {id:'bm',name:'Rocking beam with handle',role:'driver',layer:3,shape:S=>({o:K.hull([...K.circle(14,24),...K.circle(10,24,-Lb-20,0),...K.circle(10,24,Lb,0)]),h:[S.hole(0,0),S.hole(Lb-4,0,6)]})}],
  ground:[[S0[0],S0[1],0,2],[F[0],F[1],3,3]],
  pose(g){const b0=RAT.pawl(N,r0,R,-1,0,[92,0],48,-3.1,-1.8),b=RAT.pawl(N,r0,R,-1,g.w-g.d,[92,0],48,-3.1,-1.8),c=Math.cos(g.d),s=Math.sin(g.d);
    return{fw:[S0[0],S0[1],g.w],rt:[S0[0],S0[1],g.w],dr:[S0[0],S0[1],g.d],pw:[S0[0]+92*c,S0[1]+92*s,g.d+b-b0],bm:[F[0],F[1],g.a]};},
  ropes(g){const z=PK.zl(1)+TH/2,E=[F[0]+Lb*Math.cos(g.a),F[1]+Lb*Math.sin(g.a)];return[{pts:[[S0[0]+rd,S0[1],z],[E[0],E[1],PK.zl(3)+TH/2]],r:0.6},{pts:[[S0[0]+rd+1,S0[1],z],[S0[0]+rd+1,400+rd*g.d,z]],r:0.6}];},
  hardware:['Thin cord: one piece from the beam end to the drum, another from the drum to a small weight (a bag of coins), wound the opposite way.'],
  drive:'Rock the beam by its handle: the flywheel turns one way and keeps going between strokes.'});}

})();
