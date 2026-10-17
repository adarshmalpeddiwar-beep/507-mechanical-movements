(function(){const K=window.CAD.K,PK=window.PK,M4=K.M4,PI=Math.PI,TAU=2*PI;const mod=(a,n)=>((a%n)+n)%n;const ropeThru=(...a)=>window.MB.ropeThru(...a);
/* ===== printable models 151–190 ===== */
const U=PK.U,{Sh}=PK,L=PK.Lib;PK._S(0.3);const pxPoly=L.pxPoly;
/* generic screw-and-nut stand (shared shape with the 102 family) */
function screwStand(n,o){const p=o.p||4,rp=5,Ls=o.L||90,H=U.BT+12,nutL=12;const nuts=o.nuts||[{id:'n',k:1,x0:0}];
  const parts=[{id:'sc',name:o.screwName||'Screw',role:'driver',mesh:o.screwMesh?o.screwMesh(rp,p,Ls):U.worm(rp,p,Ls)},{id:'s',name:'Shaft through the screw',mesh:U.shaft(Ls+40)},{id:'k',name:'Hand crank',role:'driver',mesh:U.crank()},...nuts.map(q=>({id:q.id,name:q.name||'Nut (internal thread)',role:'driven',mesh:U.nut(rp,p,nutL,20,20,q.wopt||{})}))];
  PK.defS(n,{summary:o.summary,cam:{yaw:0.5,pitch:0.45},base:()=>[U.plate(-Ls/2-22,-24,Ls/2+22,24),U.wall(-Ls/2-6,0,'x',[[0,H]],18,5,H+8),U.wall(Ls/2+6,0,'x',[[0,H]],18,5,H+8),K.box(Ls,4,U.BT,U.BT+2,0,-12),K.box(Ls,4,U.BT,U.BT+2,0,12)],parts,
    pose(phi,g,sim){const th=o.th?o.th(g,sim):(g.th??phi),out={sc:U.at([-Ls/2,0,H],[1,0,0],th,[0,0,1]),s:U.shaftAt([0,0,H],[1,0,0],th),k:U.at([-Ls/2-14,0,H],[-1,0,0],-th,[0,0,1])};
      for(const q of nuts){const x=Math.max(-Ls/2+nutL,Math.min(Ls/2-nutL,q.x0+q.k*p*th/TAU))-nutL/2;out[q.id]=K.M4.mul(K.M4.T(x,0,H),K.M4.mul(K.M4.Ry(PI/2),K.M4.Rz(PI/2)));}return out;},drive:'Turn the crank.'});}
/* 151 right- and left-hand screw: two nuts move together or apart */
screwStand(151,{summary:'One shaft cut with a right-hand thread on one half and a left-hand thread on the other: turning it draws the two nuts together or drives them apart. Brown drives the shaft slowly by a worm.',L:110,
  screwMesh:(rp,p,Ls)=>K.merge(U.worm(rp,p,Ls/2),K.xf(U.worm(rp,p,Ls/2),K.M4.mul(K.M4.T(0,0,Ls),K.M4.Rx(PI)))),nuts:[{id:'n1',name:'Right-hand nut',k:1,x0:-28},{id:'n2',name:'Left-hand nut',k:-1,x0:28}]});
screwStand(173,{summary:'A traverse screw: the nut runs the guide along and back; Brown shifts the nut on a tappet wheel each turn so the stroke changes.',th:(g,sim)=>sim?sim.x/16*TAU:0});
/* 152 ellipsograph: a bar with two studs sliding in crossed grooves; the pencil draws an ellipse */
{const sim=window.MB.SIMS[152],O=sim.O,p=sim.p,q=sim.q;
 PK.def(152,{S:0.3,summary:'The elliptic trammel: two studs on the bar slide in the crossed grooves of the cross-piece. Turn the bar and its end (the pencil point) traces an ellipse.',
  parts:[{id:'b',name:'Trammel bar with pencil hole',role:'driver',layer:1,shape:S=>({o:K.hull([...S.circle(10,16,0,0),...S.circle(10,16,p+q,0)]),h:[S.hole(0,0),S.hole(p,0),S.hole(p+q,0,4)]})},{id:'h',name:'Slider (horizontal)',role:'link',layer:0,shape:S=>S.rect(30,18,0,0,[]),pins:[[0,0,1]]},{id:'v',name:'Slider (vertical)',role:'link',layer:0,shape:S=>S.rect(18,30,0,0,[]),pins:[[0,0,1]]}],
  ground:[],fixed:[{shape:S=>S.rect(2*p+60,8,O[0],O[1]-14),l1:0},{shape:S=>S.rect(2*p+60,8,O[0],O[1]+14),l1:0},{shape:S=>S.rect(8,2*p+60,O[0]-14,O[1]),l1:0},{shape:S=>S.rect(8,2*p+60,O[0]+14,O[1]),l1:0}],
  pose(g){return{b:[g.V[0],g.V[1],Math.atan2(g.P[1]-g.V[1],g.P[0]-g.V[0])],h:[g.H[0],g.H[1],0],v:[g.V[0],g.V[1],0]};},plate:{x0:O[0]-p-q-20,y0:O[1]-p-q-20,x1:O[0]+p+q+20,y1:O[1]+p+q+20},drive:'Turn the bar; a pencil in the end hole draws the ellipse.'});}
/* 153 studs push a tabbed bar */
{const O=[300,280];PK.def(153,{S:0.3,summary:'Studs on the turning disk push the bar out by a tab beneath it; a bell crank (struck by the next stud) brings it back.',
  parts:[{id:'d',name:'Disk with four studs',role:'driver',layer:0,shape:S=>S.disk(110),bosses:[...[0,1,2,3].map(k=>[95*Math.cos(k*PI/2),95*Math.sin(k*PI/2),PK.TH+PK.GAP,3]),[-60,0,14,3.5]]},{id:'b',name:'Bar with tab',role:'driven',layer:1,shape:S=>({o:[[0,-50],[220,-50],[220,-26],[14,-26],[14,18],[0,18]],h:[]})}],
  ground:[[O[0],O[1],0,0]],fixed:[{shape:S=>S.rect(40,8,O[0]+260,O[1]-58),l1:1},{shape:S=>S.rect(40,8,O[0]+260,O[1]-18),l1:1}],
  pose(g){return{d:[O[0],O[1],g.phi],b:[O[0]+60+g.x,O[1],0]};},drive:'Turn the disk; push the bar back by hand (the bell crank in the simulation).'});}
/* 154 studs and bell crank with weighted cord */
{const O=[280,300],F=[440,180];PK.def(154,{S:0.3,summary:'Studs on the disk press one arm of a bell crank; a weighted cord over a pulley on the other arm pulls it back, giving a to-and-fro pull.',
  parts:[{id:'d',name:'Disk with three studs',role:'driver',layer:0,shape:S=>S.disk(100),bosses:[...[0,1,2].map(k=>[85*Math.cos(k*TAU/3),85*Math.sin(k*TAU/3),PK.TH+PK.GAP,3]),[-60,0,14,3.5]]},{id:'b',name:'Bell crank',role:'driven',layer:1,shape:S=>S.lever([[0,0,12],[128*Math.cos(PI*0.66),128*Math.sin(PI*0.66),8],[140*Math.cos(-0.1),140*Math.sin(-0.1),8]],[[0,0],[140*Math.cos(-0.1),140*Math.sin(-0.1)]])}],
  ground:[[O[0],O[1],0,0],[F[0],F[1],1,1]],pose(g){return{d:[O[0],O[1],g.phi],b:[F[0],F[1],g.a]};},hardware:['A cord and a small weight on the outer arm.'],drive:'Turn the disk.'});}
/* 158–160 treadle and crank */
for(const n of [158,159,160,416]){const sim=window.MB.SIMS[n];if(!sim||!sim.Pv)continue;const Pv=sim.Pv,O=sim.O,r=sim.r,Lt=sim.Lt,Lr=sim.Lr;
 PK.def(n,{S:0.3,summary:n===158?'A treadle swinging on its pivot turns the flywheel through a connecting rod and crank, as on a lathe or spinning wheel.':n===159?'The same treadle drive with a cord instead of the connecting rod (the rod stands in for it here).':'The treadle drive in which a spring lifts the treadle and a band turns the pulley (shown with a rod).',
  parts:[{id:'f',name:'Flywheel with crank pin',role:'driven',layer:0,shape:S=>({o:S.circle(130,96),h:[S.hole(0,0),...[0,1,2,3,4,5].map(k=>S.circle(32,24,80*Math.cos(k*PI/3+0.5),80*Math.sin(k*PI/3+0.5)))]}),pins:[[r,0,1]]},{id:'t',name:'Treadle',role:'driver',layer:0,shape:S=>S.bar(Lt+30,18,[0,Lt]),pins:[[Lt,0,1]]},{id:'c',name:'Connecting rod',role:'link',layer:1,shape:S=>S.bar(Lr,12)}],
  ground:[[O[0],O[1],0,0],[Pv[0],Pv[1],0,0]],pose(g){return{f:[O[0],O[1],g.phi],t:[Pv[0],Pv[1],g.a],c:[g.pin[0],g.pin[1],Math.atan2(g.Q[1]-g.pin[1],g.Q[0]-g.pin[0])]};},drive:'Rock the treadle (or turn the flywheel).'});}
/* governors 161, 162, 163, 170 (spatial outline) */
function govModel(n,summary){const sim=window.MB.SIMS[n];if(!sim)return;const Lg=(sim.L||120)*0.25,top=U.BT+70;
  PK.defS(n,{summary,cam:{yaw:0.5,pitch:0.25},params:sim.params,base:()=>[U.plate(-30,-30,30,30),U.post(0,0,U.BT+20,U.BT+5)],
    parts:[{id:'sp',name:'Spindle',role:'driver',mesh:K.merge(K.cyl(2.5,0,top-U.BT+8,20),K.box(16,6,top-U.BT-4,top-U.BT+2))},{id:'arm',name:'Ball arm',role:'link',qty:2,mesh:K.merge(K.box(4,4,0,Lg),K.lathe([[0.01,Lg-5],[6,Lg-3],[6,Lg+3],[0.01,Lg+5]],24))},{id:'sl',name:'Sliding sleeve',role:'driven',mesh:K.tubeSolid(6,2.8,0,8,32)}],
    pose(phi,g){const th=g.th||0.5,out={sp:K.M4.mul(K.M4.T(0,0,U.BT+5),K.M4.Rz(phi)),arm:[],sl:K.M4.mul(K.M4.T(0,0,top-Lg*Math.cos(th)-14),K.M4.Rz(phi))};for(const s of [0,PI]){const a=phi+s,d=[Math.sin(th)*Math.cos(a),Math.sin(th)*Math.sin(a),-Math.cos(th)];out.arm.push(U.at([6*Math.cos(a),6*Math.sin(a),top],d,0));}return out;},
    drive:'Spin the spindle (set the speed on the simulation): the balls fly out and lift the sleeve.'});}
govModel(161,'The flyball governor: the spindle, driven by bevel gears, carries two balls on arms. Faster running throws them out and lifts the sleeve, which closes the regulating valve; slower running drops it and opens the valve.');
govModel(162,'A water-wheel governor in outline: the rising sleeve puts a stud into one of two bevel gears, which turns the shaft that works the gate (here the governor head is modelled).');
govModel(163,'A water-wheel governor in outline: the sleeve shifts a belt among three pulleys to raise or lower the gate (here the governor head is modelled).');
govModel(170,'A governor whose arms cross and work the valve rod through two short links (here the governor head is modelled).');
/* 164 knee lever = toggle, 165 wave cam, 167 double spiral drum */
{const sim=window.MB.SIMS[164],T=sim.T,Lt=sim.L;PK.def(164,{S:0.3,summary:'The knee lever (toggle) as used in presses and stamps: drawing the knee straight gives an enormous force on the ram at the end of its travel.',
  parts:[{id:'a',name:'Upper link',role:'link',layer:0,shape:S=>S.bar(Lt,14),pins:[[Lt,0,1]]},{id:'b',name:'Lower link',role:'link',layer:1,shape:S=>S.bar(Lt,14)},{id:'h',name:'Ram',role:'driven',layer:0,shape:S=>S.rect(30,80,0,20,[[0,0]]),pins:[[0,0,1]]}],
  ground:[[T[0],T[1],0,0]],fixed:[{shape:S=>S.rect(10,200,T[0]-30,T[1]+250),l1:1},{shape:S=>S.rect(10,200,T[0]+30,T[1]+250),l1:1}],
  pose(g){const K2=[T[0]-g.k,T[1]+g.h];return{a:[T[0],T[1],Math.atan2(K2[1]-T[1],K2[0]-T[0])],b:[K2[0],K2[1],Math.atan2(g.Y-K2[1],T[0]-K2[0])],h:[T[0],g.Y,0]};},drive:'Pull the knee straight.'});}
{const R=40,H0=U.BT+24;
 const wheel=(()=>{const n=160,o=[],top=[];for(let i=0;i<n;i++){const t=i/n*TAU;o.push([R*Math.cos(t),R*Math.sin(t)]);}const m={t:[]};/* band whose top edge is waved: build as many thin prisms */const parts=[K.prism(K.circle(R,96),[K.circle(U.SHB,24)],0,4)];for(let i=0;i<n;i++){const t0=i/n*TAU,t1=(i+1)/n*TAU,h=10+6*Math.cos(4*(t0+t1)/2);parts.push(K.prism([[ (R-4)*Math.cos(t0),(R-4)*Math.sin(t0)],[R*Math.cos(t0),R*Math.sin(t0)],[R*Math.cos(t1),R*Math.sin(t1)],[(R-4)*Math.cos(t1),(R-4)*Math.sin(t1)]],[],4,4+h));}return K.merge(...parts);})();
 PK.defS(165,{summary:'A waved rim on a wheel turning on an upright shaft lifts and drops the follower rod four times a turn.',cam:{yaw:0.5,pitch:0.35},
  base:()=>[U.plate(-48,-48,48,48),U.post(0,0,U.BT+8,U.BT+2),K.box(10,6,0,70,R-2,-12),K.prism([[R-10,-15],[R+6,-15],[R+6,4],[R-10,4]],[K.circle(2.9,20,R-2,0)],56,60)],
  parts:[{id:'w',name:'Waved wheel',role:'driver',mesh:wheel},{id:'r',name:'Follower rod',role:'driven',mesh:K.merge(K.cyl(2.4,0,50,20),K.lathe([[0.01,-3],[3,-2],[3.5,0],[0.01,0]],20))}],
  pose(phi){const h=10+6*Math.cos(4*(0-phi));return{w:K.M4.mul(K.M4.T(0,0,U.BT+2),K.M4.Rz(phi)),r:K.M4.T(R-2,0,U.BT+2+4+h+0.5)};},drive:'Turn the wheel.'});}
{const R=14,Lc=60,A=24,w=3.2,dep=2.2,Hs=U.BT+R+6;const zc=t=>Lc/2+A*(1-4*Math.abs(((t/TAU)%1+1)%1-0.5));
 const drum=(()=>{const secs=[],n=120;for(let z=0;z<=Lc+1e-9;z+=0.6){const ring=[];for(let i=0;i<n;i++){const t=i/n*TAU,dd=Math.min(Math.abs(z-zc(t)),Math.abs(z-zc(t+PI))),r=dd<w/2?R-dep:dd<w/2+0.6?R-dep*(1-(dd-w/2)/0.6):R;ring.push([r*Math.cos(t),r*Math.sin(t),z]);}
   secs.push({o:ring,h:[(()=>{const o=U.octa(U.SH+0.12),q=[];for(let a=0;a<8;a++){const P=o[a],Q=o[(a+1)%8];for(let j=0;j<15;j++)q.push([P[0]+(Q[0]-P[0])*j/15,P[1]+(Q[1]-P[1])*j/15]);}return q;})().map(q=>[q[0],q[1],z])]});}return K.loftS(secs);})();
 PK.defS(167,{summary:'A drum with an endless double spiral groove: pushing the pin back and forth along the drum turns the drum continuously one way. Brown records it as a crank substitute for steam engines.',cam:{yaw:0.5,pitch:0.45},
  base:()=>[U.plate(-Lc/2-24,-24,Lc/2+24,24),U.wall(-Lc/2-6,0,'x',[[0,Hs]],18,5,Hs+8),U.wall(Lc/2+6,0,'x',[[0,Hs]],18,5,Hs+8),U.wall(-Lc/2-6,-16,'x',[[0,Hs+R+6]],10,5),U.wall(Lc/2+6,-16,'x',[[0,Hs+R+6]],10,5)],
  parts:[{id:'d',name:'Double-spiral drum',role:'driven',mesh:drum},{id:'s',name:'Shaft',mesh:U.shaft(Lc+40)},{id:'f',name:'Sliding pin block',role:'driver',mesh:K.merge(K.box(10,22,0,6,0,8),K.cyl(1.3,-3,0.01,12))},{id:'r',name:'Guide rod',mesh:U.shaft(Lc+30)}],
  pose(phi){const x=-Lc/2+zc(-phi+PI/2);return{d:U.at([-Lc/2,0,Hs],[1,0,0],phi,[0,0,1]),s:U.shaftAt([0,0,Hs],[1,0,0],phi),f:K.M4.T(x,0,Hs+R-dep+1),r:U.shaftAt([0,-16,Hs+R+6],[1,0,0],0)};},drive:'Slide the pin block back and forth: the drum turns one way.'});}
/* 166 slotted connecting rod (dwell) */
{const sim=window.MB.SIMS[166],O=sim.O,r=sim.r,L0=sim.L0,s=sim.s;PK.def(166,{S:0.3,summary:'A connecting rod with a slot at the crank end: the crank pin crosses the slot without moving the rod, so the brick mould rests at each end of its travel while it is filled or emptied.',
  parts:[{id:'c',name:'Crank disk with pin',role:'driver',layer:0,shape:S=>S.disk(r+24),pins:[[r,0,1]],bosses:[[-r,0,14,3.5]]},{id:'rod',name:'Slotted connecting rod',role:'link',layer:1,shape:S=>({o:[[-L0-s-14,-16],[16,-16],[16,16],[-L0-s-14,16]],h:[S.slotPts(-L0-s,0,-L0,0,(PK.BORER*2+0.6)/0.3),S.hole(0,0)]}),pins:[]},{id:'m',name:'Mould slide',role:'driven',layer:0,shape:S=>S.rect(120,80,60,0,[]),pins:[[0,0,1]]}],
  ground:[[O[0],O[1],0,0]],fixed:[{shape:S=>S.rect(320,8,600,O[1]-48),l1:0},{shape:S=>S.rect(320,8,600,O[1]+48),l1:0}],
  pose(g){return{c:[O[0],O[1],g.phi],rod:[g.x,O[1],0],m:[g.x,O[1],0]};},drive:'Turn the crank disk: the mould pauses at each end.'});}
/* 168, 169 two cranks and slotted yokes: the pin draws an ellipse */
for(const n of [168,169]){const sim=window.MB.SIMS[n];const o=n===168?{a:110,b:60}:{a:90,b:70},A=[150,270],B=[640,410];
 PK.def(n,{S:0.25,summary:'Two cranks turning together, one working a vertical slotted yoke and one a horizontal one: the pin at the crossing of the two yokes is carried round an ellipse, giving more leverage at the useful parts of the stroke.',
  parts:[{id:'a',name:'Crank disk A',role:'driver',layer:0,shape:S=>S.disk(o.a+18),pins:[[o.a,0,1]],bosses:[[-o.a+10,0,12,3.5]]},{id:'b',name:'Crank disk B',role:'link',layer:0,shape:S=>S.disk(o.b+16),pins:[[o.b,0,2]]},
    {id:'ya',name:'Vertical yoke',role:'link',layer:1,shape:S=>({o:[[-15,-o.a-20],[15,-o.a-20],[15,o.a+20],[-15,o.a+20]],h:[S.slotPts(0,-o.a,0,o.a,(PK.BORER*2+0.6)/0.25)]})},{id:'yb',name:'Horizontal yoke',role:'link',layer:2,shape:S=>({o:[[-o.b-20,-15],[o.b+20,-15],[o.b+20,15],[-o.b-20,15]],h:[S.slotPts(-o.b,0,o.b,0,(PK.BORER*2+0.6)/0.25)]})}],
  ground:[[A[0],A[1],0,0],[B[0],B[1],0,0]],fixed:[{shape:S=>S.rect(10,2*o.a+60,A[0]-30,A[1]),l1:1}],
  pose(g){const pa=[A[0]+o.a*Math.cos(g.phi),A[1]+o.a*Math.sin(g.phi)],pb=[B[0]+o.b*Math.cos(g.phi),B[1]+o.b*Math.sin(g.phi)];return{a:[A[0],A[1],g.phi],b:[B[0],B[1],g.phi],ya:[pa[0],A[1],0],yb:[B[0],pb[1],0]};},drive:'Turn crank A (link the two cranks with a belt to turn together).'});}
/* 174, 180, 190 clamps */
{PK.defS(174,{summary:'A bench clamp: turning the screw moves the jaw and grips the work against the fixed jaw.',cam:{yaw:0.5,pitch:0.4},base:()=>[U.plate(-60,-22,60,22),K.box(8,30,U.BT,U.BT+30,-30,0),U.wall(55,0,'x',[[0,U.BT+18]],22,6,U.BT+30)],
  parts:[{id:'j',name:'Moving jaw with nut',role:'driven',mesh:K.merge(U.nut(5,4,10,24,24),K.box(24,30,-12,12,0,0))},{id:'sc',name:'Clamp screw',role:'driver',mesh:U.worm(5,4,60)},{id:'w',name:'Work piece',role:'frame',mesh:K.box(20,20,0,16)}],
  pose(phi,g){const c=g.c||0,x=-6+24*(1-c);return{j:K.M4.mul(K.M4.T(x,0,U.BT+18),K.M4.mul(K.M4.Ry(PI/2),K.M4.Rz(PI/2))),sc:U.at([x,0,U.BT+18],[1,0,0],c*TAU*4,[0,0,1]),w:K.M4.T(-16,0,U.BT)};},drive:'Turn the screw.'});}
{PK.def(180,{S:0.3,summary:'A single pivoted clamp jaw that grips the work against a fixed side piece.',parts:[{id:'j',name:'Pivoted jaw',role:'driver',layer:0,shape:S=>({o:[[16,-16],[16,16],[-130,24],[-130,-24]],h:[S.hole(0,0)]})},{id:'w',name:'Work piece',role:'frame',layer:0,shape:S=>S.rect(140,50,0,0,[])}],
  ground:[[600,330,0,0]],fixed:[{shape:S=>S.rect(30,110,315,275),l1:0}],pose(g){return{j:[600,330,-0.5*(1-g.c)],w:[400,305,0]};},drive:'Swing the jaw onto the work.'});}
{PK.def(190,{S:0.3,summary:'A screw clamp: tightening the screw lifts one end of the holder, which presses the work down on the other side of its fulcrum.',parts:[{id:'h',name:'Holder (lever)',role:'driven',layer:0,shape:S=>S.rect(320,24,160,0,[[0,0]])},{id:'w',name:'Work piece',role:'frame',layer:0,shape:S=>S.rect(140,50,0,0,[])}],
  ground:[[200,200,0,0]],pose(g){return{h:[200,200,-0.4*(1-g.c)],w:[400,305,0]};},drive:'Turn the screw (shown in the simulation).'});}
/* 175 one turn per stroke, 176/177 uncoupling ring */
{PK.def(175,{S:0.3,summary:'A display model: the piston rod’s yoke carries racks that turn the pinion one whole turn for each stroke.',parts:[{id:'p',name:'Pinion',role:'driven',layer:0,shape:S=>S.gear(48,16)},{id:'y',name:'Rack yoke',role:'driver',layer:0,shape:S=>({o:[[-70,-30],[70,-30],[70,330],[-70,330]],h:[[[-56,-16],[56,-16],[56,316],[-56,316]]]})}],
  ground:[[400,320,0,0]],pose(g){return{p:[400,320,g.phi],y:[400,120+g.y+30,0]};},drive:'Move the yoke up and down.'});}
for(const n of [176,177]){const O=[400,270];PK.def(n,{S:0.3,summary:'A ring with a slot on one crank arm: set one way, the wrist on the other arm drives the crank; turned to the slot, the wrist passes through and the crank stays still.',
  parts:[{id:'r',name:'Slotted ring',role:'driven',layer:0,shape:S=>({o:S.circle(150,96),h:[S.circle(120,96)]})},{id:'w',name:'Arm with wrist',role:'driver',layer:1,shape:S=>S.lever([[0,0,14],[135,0,10]],[[0,0]]),bosses:[[135,0,-PK.TH-PK.GAP+0.01,0.01]]}],
  ground:[[O[0],O[1],1,1]],pose(g,s){return{r:[O[0],O[1],s.c],w:[O[0],O[1],g.phi]};},drive:'Turn the arm.'});}
/* 178 shaped yoke (slow bottom) */
{const sim=window.MB.SIMS[178],O=[260,270],r=80;const ctr=[];for(let i=0;i<200;i++){const t=i/200*TAU;ctr.push([r*Math.cos(t)-sim.u(t),r*Math.sin(t)]);}
 PK.def(178,{S:0.3,summary:'A slotted crank working a yoke whose groove is shaped to slow the slide near one end of its stroke, as needed for the cutting tool of a slotting machine.',
  parts:[{id:'d',name:'Crank disk with pin',role:'driver',layer:0,shape:S=>S.disk(110),bosses:[[r,0,PK.TH+PK.GAP+PK.TH-1,2.4],[-80,0,8,3.5]]},{id:'y',name:'Yoke with shaped groove',role:'driven',layer:1,mesh:K.xf(L.groovedPlate([[-60,120],[60,120],[60,14],[300,14],[300,-14],[60,-14],[60,-120],[-60,-120]],ctr.map(([x,y])=>[x,-y]),16,[]),K.M4.mul(K.M4.T(0,0,PK.TH),K.M4.Rx(PI)))}],
  ground:[[O[0],O[1],0,0]],fixed:[{shape:S=>S.rect(120,8,O[0]+440,O[1]-22),l1:1},{shape:S=>S.rect(120,8,O[0]+440,O[1]+22),l1:1}],pose(g){return{d:[O[0],O[1],g.phi],y:[O[0]+g.u,O[1],0]};},drive:'Turn the crank disk.'});}
/* 179, 186–189 eccentric rod with a gab that can be lifted off the valve pin */
for(const n of [179,186,187,188,189]){const O=[180,300];PK.def(n,{S:0.3,summary:'The eccentric rod ends in a gab (a hook) that drops over a pin on the valve spindle. Lift the rod and the gab comes off the pin: the valve can then be worked by hand, as when reversing a beam engine.',
  parts:[{id:'e',name:'Eccentric',role:'driver',layer:0,shape:S=>S.disk(60,[[-40,0]]),bosses:[[30,0,12,3.5]]},{id:'r',name:'Eccentric rod with gab',role:'link',layer:1,shape:S=>({o:[[0,-10],[240,-10],[240,-14],[270,-14],[270,14],[256,14],[256,0],[0,10]],h:[]})},{id:'v',name:'Valve spindle with pin',role:'driven',layer:0,shape:S=>S.rect(40,24,0,0,[]),bosses:[[0,0,PK.TH+PK.GAP,2.2]]}],
  ground:[[O[0],O[1],0,0]],fixed:[{shape:S=>S.rect(120,8,520,O[1]-20),l1:0},{shape:S=>S.rect(120,8,520,O[1]+20),l1:0}],
  pose(g,s){const E=[O[0]+40*Math.cos(g.phi)+60,O[1]],lift=s.P.e?0:40;return{e:[O[0],O[1],g.phi],r:[E[0],E[1],Math.atan2(-lift,480+g.x-E[0])],v:[480+(s.P.e?g.x:0)+10,O[1],0]};},drive:'Turn the eccentric; lift the rod to free the valve.'});}
/* 181–184 trip valve gear (display) */
for(const n of [181,182,183,184]){const y=330;PK.def(n,{S:0.3,summary:'A display of the trip valve gear of large blowing engines: a tappet on the piston rod strikes handles at each end of the stroke that throw the steam and exhaust valves over, so the piston reverses by itself.',
  parts:[{id:'c',name:'Cylinder (section)',role:'frame',layer:0,shape:S=>({o:[[160,y-60],[640,y-60],[640,y+60],[160,y+60]],h:[[[170,y-50],[630,y-50],[630,y+50],[170,y+50]]]})},{id:'p',name:'Piston with rod and tappet',role:'driver',layer:0,shape:S=>({o:[[-10,-50],[10,-50],[10,-4],[4,-4],[4,-180],[60,-180],[60,-170],[-60,-170],[-60,-180],[-4,-180],[-4,-4],[-10,-4]].map(([a,b])=>[a,b+50]),h:[]})}],
  ground:[],pose(g){return{c:[0,0,0],p:[400+g.x,y-50,0]};},plate:{x0:140,y0:100,x1:660,y1:410},drive:'Slide the piston: the tappet reaches the handles at each end.'});}
/* 185 Stephenson link motion (display) */
{const O=[170,280],e=40,Ll=300;PK.def(185,{S:0.3,summary:'Stephenson’s link motion: two eccentrics work the ends of a curved slotted link; raising or lowering the link under the valve-rod block gives forward, backward or mid gear, and anything between for expansive working.',
  parts:[{id:'e1',name:'Forward eccentric',role:'driver',layer:0,shape:S=>S.disk(52,[[-e*Math.cos(PI/2+0.45),-e*Math.sin(PI/2+0.45)]])},{id:'e2',name:'Backward eccentric',role:'driver',layer:1,shape:S=>S.disk(52,[[-e*Math.cos(-PI/2-0.45),-e*Math.sin(-PI/2-0.45)]])},
    {id:'r1',name:'Forward rod',role:'link',layer:2,shape:S=>S.bar(300,10)},{id:'r2',name:'Backward rod',role:'link',layer:3,shape:S=>S.bar(300,10)},{id:'v',name:'Valve rod block',role:'driven',layer:2,shape:S=>S.rect(28,20,0,0,[])}],
  ground:[[O[0],O[1],0,1]],
  pose(g){const E1=[O[0]+e*Math.cos(g.a1),O[1]+e*Math.sin(g.a1)],E2=[O[0]+e*Math.cos(g.a2),O[1]+e*Math.sin(g.a2)],lx=O[0]+Ll,T=[lx+g.x1,170],B=[lx+g.x2,390],t=(1-g.p)/2,D=[T[0]+(B[0]-T[0])*t,T[1]+(B[1]-T[1])*t];
    return{e1:[O[0],O[1],g.phi],e2:[O[0],O[1],g.phi],r1:[E1[0],E1[1],Math.atan2(T[1]-E1[1],T[0]-E1[0])],r2:[E2[0],E2[1],Math.atan2(B[1]-E2[1],B[0]-E2[0])],v:[D[0],D[1],0]};},drive:'Turn the shaft; set the reversing lever on the simulation.'});}

})();
