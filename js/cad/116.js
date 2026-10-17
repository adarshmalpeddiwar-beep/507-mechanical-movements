(function(){const K=window.CAD.K,PK=window.PK,M4=K.M4,PI=Math.PI,TAU=2*PI;const mod=(a,n)=>((a%n)+n)%n;const ropeThru=(...a)=>window.MB.ropeThru(...a);
/* ===== printable models 116–150 ===== */
const U=PK.U,{Sh}=PK,L=PK.Lib;PK._S(0.3);
const pxPoly=L.pxPoly;
for(const [n,s] of [[117,'A cam turning between two friction rollers in a yoke works a steam-engine valve: the yoke slides straight, guided at both ends.'],[128,'Three wipers on the turning shaft push a rectangular frame first one way and then the other.'],[130,'A display of the cam that closes iron-plate shears: the cam lifts the long arm of the upper blade; its weight opens them again.'],
  [135,'The Paris Mint tappet eccentric: a triangular tappet on a disk moves the valve yoke across quickly and holds it still at each end of the stroke.'],[136,'A cam wheel with a shaped rim moves the rod resting on it; change the rim and you change the motion.'],[149,'A cam working a rod through its follower: uniform turning becomes an up-and-down stroke with a pause.'],[150,'Interchangeable valve cams: the throw of the cam under the follower sets the travel of the valve rod. Print the three cams and swap them.']])L.camFlatModel(n,s);
L.linkModel(148,'A crank-and-rocker: the steadily turning gear carries a crank pin, and the link makes the crank on the larger gear swing to and fro.');
for(const n of [156,157,268,203,210,220,172,350,363,273,282,401])L.linkModel(n,'A linkage printed straight from the simulation: every bar, slotted lever and block is a part, with printed pins at the joints. Turn the driving crank to see the motion.');
/* ---------- 116 two racks in different planes, two loose pinions with opposed ratchets ---------- */
{const sim=window.MB.SIMS[116],O=[400,260],r=40;
 PK.def(116,{S:0.3,summary:'A pinion-and-rack substitute for a crank: the frame’s upper rack (front plane) turns one loose pinion, its lower rack (back plane) the other. Each pinion drives the shaft through a pawl and ratchet set opposite ways, so the shaft turns the same way on both strokes.',
  parts:[{id:'f',name:'Rack frame (two racks, two planes)',role:'driver',layer:0,t:2,shape:S=>({o:[[-200,-110],[200,-110],[200,110],[-200,110]],h:[[[-190,-r-6.25+0],[190,-r-6.25],[190,r+6.25],[-190,r+6.25]]]}),bosses:[[-190,0,10,3.5]]},
    {id:'tr',name:'Upper rack strip (front)',role:'driver',layer:1,shape:S=>({o:S.rack(-190,190,5,6,{c0:0,down:true}).o,h:[]})},{id:'br',name:'Lower rack strip (back)',role:'driver',layer:0,shape:S=>({o:S.rack(-190,190,5,6,{c0:0}).o,h:[]})},
    {id:'pa',name:'Front pinion with pawl',role:'link',layer:1,shape:S=>S.gear(r,16)},{id:'pb',name:'Back pinion with pawl',role:'link',layer:0,shape:S=>S.gear(r,16)},{id:'w',name:'Ratchet / output disk',role:'driven',layer:2,shape:S=>S.ratchet(34,12,6,1),bosses:[[20,0,8,2.5]]}],
  ground:[[O[0],O[1],0,2]],fixed:[{shape:S=>S.rect(60,8,O[0]-260,O[1]-118),l1:1},{shape:S=>S.rect(60,8,O[0]-260,O[1]+118),l1:1},{shape:S=>S.rect(60,8,O[0]+260,O[1]-118),l1:1},{shape:S=>S.rect(60,8,O[0]+260,O[1]+118),l1:1}],
  pose(g,s){const a=g.x/r;return{f:[O[0]+g.x,O[1],0],tr:[O[0]+g.x,O[1]-r,0],br:[O[0]+g.x,O[1]+r,0],pa:[O[0],O[1],a],pb:[O[0],O[1],-a],w:[O[0],O[1],s.w]};},drive:'Push the frame back and forth by its knob.'});}
/* ---------- 118 stroke doubler ---------- */
{const sim=window.MB.SIMS[118],O=sim.O,r=sim.r,Lr=sim.L,y=O[1],m=5,rp=40,c0=O[0]+Lr;
 PK.def(118,{S:0.3,summary:'Doubling the stroke: a pinion on the end of the connecting rod rolls along a fixed rack below and drives a sliding rack above, which therefore travels twice as far as the rod end.',
  parts:[{id:'w',name:'Crank disk',role:'driver',layer:0,shape:S=>S.disk(r+20),pins:[[r,0,1]],bosses:[[-r,0,14,3.5]]},{id:'c',name:'Connecting rod',role:'link',layer:1,shape:S=>S.bar(Lr,12),pins:[[Lr,0,2]]},{id:'p',name:'Pinion',role:'link',layer:2,shape:S=>S.gear(rp,16)},
    {id:'lo',name:'Fixed lower rack',role:'frame',layer:2,shape:S=>({o:S.rack(260-c0,760-c0,m,14,{c0:0}).o,h:[]})},{id:'up',name:'Sliding upper rack',role:'driven',layer:2,shape:S=>({o:S.rack(-200,280,m,14,{c0:0,down:true}).o,h:[]})}],
  ground:[[O[0],O[1],0,0]],fixed:[{shape:S=>S.rect(500,8,510,y-rp-1.25*m-22),l1:2}],
  pose(g){const a=Math.atan2(y-g.pin[1],g.cx-g.pin[0]);return{w:[O[0],O[1],g.phi],c:[g.pin[0],g.pin[1],a],p:[g.cx,y,-(g.cx-c0)/rp],lo:[c0,y+rp,0],up:[c0+2*(g.cx-c0),y-rp,0]};},drive:'Turn the crank disk.'});}
/* ---------- 119 endless rack ---------- */
{const sim=window.MB.SIMS[119],st=window.MB.stad,r=sim.r,Rr=sim.R,N=sim.N,X0=sim.X0,Y0=sim.Y0,m=2*r/N,p=TAU*r/N;
 const frame=()=>{const Lh=sim.P.run*p/4,Pp=4*Lh+TAU*Rr,outR=1.25*m+18,o=[],h=[];for(let i=0;i<220;i++){const q=st(Pp*i/220,Lh,Rr);o.push([q.x+q.nx*outR,q.y+q.ny*outR]);}const n=Math.round(Pp/p),pr=[[-0.5,1.25],[-0.27,1.25],[-0.12,-1],[0.12,-1],[0.27,1.25]];
   for(let k=0;k<n;k++)for(const [f,d] of pr){const q=st(k*p+f*p,Lh,Rr);h.push([q.x+q.nx*d*m,q.y+q.ny*d*m]);}const half=Lh+Rr+outR;return{o:o,h:[h]};};
 for(const n of [119,197,394])PK.def(n,{S:0.3,summary:'The endless rack: an oblong frame with teeth all round its inside. The pinion turns steadily; its axle slides up and down in a fixed slot, so it runs along the top, round the end, and back along the bottom, driving the frame back and forth.',
  parts:[{id:'f',name:'Endless rack frame',role:'driven',layer:0,shape:frame},{id:'p',name:'Pinion, 12 teeth, with axle',role:'driver',layer:0,shape:S=>S.gear(r,N),bosses:[[0,0,2*(PK.TH+PK.GAP)+10,PK.PINR]]},
    {id:'g',name:'Slotted guide (bridge)',role:'frame',layer:1,shape:S=>({o:[[-26,-Rr-70],[26,-Rr-70],[26,Rr+70],[-26,Rr+70]],h:[S.slotPts(0,-(Rr-r),0,Rr-r),S.hole(0,-Rr-56),S.hole(0,Rr+56)]})}],
  ground:[[X0,Y0-Rr-56,1,1],[X0,Y0+Rr+56,1,1]],
  pose(g){return{f:[X0-g.cx,Y0,0],p:[X0,Y0+g.cy,g.ang-PI/2+PI/N],g:[X0,Y0,0]};},drive:'Turn the pinion by its axle.'});}
/* ---------- 120 segment-gear jaws ---------- */
{const sim=window.MB.SIMS[120],O=[sim.O.x,sim.O.y],d=sim.R1+sim.r1,S0=[O[0],O[1]-d];
 const seg=(R,Nf,inner,sp)=>{if(inner){const ring=Sh.ring(R,Nf,R+1.25*sim.m+16);return ring;}return Sh.gear(R,Nf,{lighten:false});};
 PK.def(120,{S:0.25,summary:'Powerful jaws: each jaw is fixed to a toothed segment on the same pivot, one with teeth outside, one with teeth inside. One shaft carries a pinion for each, so turning the shaft swings the segments opposite ways and closes the jaws with great force.',
  parts:[{id:'s1',name:'Outside-toothed segment with jaw',role:'driven',layer:1,shape:S=>({o:K.hull([...S.circle(26,24),...S.circle(14,16,0,220)]),h:[S.hole(0,0)]})},{id:'g1',name:'Segment teeth (outside), glue on',role:'driven',layer:2,shape:S=>S.gear(sim.R1,sim.Nf1,{lighten:false})},
    {id:'s2',name:'Inside-toothed segment with jaw',role:'driven',layer:0,shape:S=>({o:K.hull([...S.circle(26,24),...S.circle(14,16,0,220)]),h:[S.hole(0,0)]})},
    {id:'p1',name:'Front pinion',role:'driver',layer:2,shape:S=>S.gear(sim.r1,sim.N1),bosses:[[0,-20,10,3]]},{id:'p2',name:'Back pinion',role:'driver',layer:1,shape:S=>S.gear(sim.r2,sim.N2)}],
  ground:[[O[0],O[1],0,2],[S0[0],S0[1],1,2]],
  pose(g){return{s1:[O[0],O[1],g.aL-PI/2],g1:[O[0],O[1],-PI/2+TAU/sim.Nf1/2+g.p1],s2:[O[0],O[1],g.aR-PI/2],p1:[S0[0],S0[1],-PI/2+g.th],p2:[S0[0],S0[1],-PI/2+g.th]};},drive:'Turn the pinion shaft by its knob: the jaws close.'});}
/* ---------- 121 reversible pawl feed ---------- */
{const sim=window.MB.SIMS[121],Cc=[sim.C.x,sim.C.y],Kc=[sim.K.x,sim.K.y];
 PK.def(121,{S:0.25,summary:'A crank and rod rock a disk on the same centre as the feed wheel; a pawl on the disk pushes the wheel round a tooth or so at a time and slides back on the return. Turn the pawl over and the feed runs the other way, as on a planing machine.',
  parts:[{id:'k',name:'Crank',role:'driver',layer:0,shape:S=>S.lever([[0,0,52],[42,0,8]],[[0,0]]),pins:[[sim.P.feed,0,1]],bosses:[[-30,0,14,3.5]]},{id:'r',name:'Rod',role:'link',layer:1,shape:S=>S.bar(sim.l,12)},
    {id:'d',name:'Rocking disk',role:'link',layer:0,shape:S=>({o:S.circle(170,96),h:[S.hole(0,0)]}),pins:[[-sim.rd,0,1]]},{id:'w',name:'Feed wheel, 24 teeth',role:'driven',layer:1,shape:S=>S.ratchet(sim.rt,sim.N,sim.rt-sim.rr,1)},{id:'pw',name:'Pawl',role:'link',layer:1,shape:S=>S.lever([[0,0,8],[40,0,5]],[[0,0]])}],
  ground:[[Cc[0],Cc[1],0,1],[Kc[0],Kc[1],0,0]],
  pose(g,s){const sv=s.solve(g.phi||0);return{k:[Kc[0],Kc[1],g.phi||0],r:[sv.P[0],sv.P[1],Math.atan2(sv.Q[1]-sv.P[1],sv.Q[0]-sv.P[0])],d:[Cc[0],Cc[1],sv.psi],w:[Cc[0],Cc[1],s.thr],pw:[Cc[0]+140*Math.cos(sv.psi-PI/2),Cc[1]+140*Math.sin(sv.psi-PI/2),sv.psi]};},drive:'Turn the crank by its knob.'});}
/* ---------- 122 and 125 twin crank-wrist traverse ---------- */
for(const n of [122,125]){const sim=window.MB.SIMS[n];const A=[sim.A.x,sim.A.y];
 PK.def(n,{S:0.3,summary:'Two meshing gears each carry a crank wrist; the slotted lever between the wrists drives the bar. With different tooth counts the wrists drift in and out of step, so the stroke of the bar keeps changing.',
  parts:[{id:'a',name:'Gear A, 24 teeth',role:'driver',layer:0,shape:S=>S.gear(sim.rA,sim.NA),pins:[[sim.pa,0,1]],bosses:[[-sim.pa,0,14,3.5]]},{id:'b',name:'Gear B',role:'driven',layer:0,shape:S=>S.gear(3*24,24),pins:[[0,0.6*3*24,1]]},{id:'l',name:'Slotted lever',role:'link',layer:1,shape:S=>({o:K.hull([...S.circle(12,16),...S.circle(12,16,260,0)]),h:[S.hole(0,0),S.slotPts(30,0,250,0)]}),pins:[[sim.P.s,0,2]]},{id:'bar',name:'Traverse bar',role:'driven',layer:2,shape:S=>S.rect(520,16,0,0,[[0,0]])}],
  ground:[[A[0],A[1],0,0],[A[0]+sim.rA+72,A[1],0,0]],fixed:[{shape:S=>S.rect(40,8,120,A[1]-260),l1:2},{shape:S=>S.rect(40,8,680,A[1]-260),l1:2}],
  pose(g){return{a:[A[0],A[1],g.phi],b:[g.B.x,g.B.y,g.fB],l:[g.pA[0],g.pA[1],g.be],bar:[g.Lp[0],g.Lp[1],0]};},drive:'Turn gear A by its knob.'});}
/* ---------- 123 double rack to rotation ---------- */
{const sim=window.MB.SIMS[123],S1=[sim.S1.x,sim.S1.y],S2=[sim.S2.x,sim.S2.y],G=[sim.G.x,sim.G.y],m=6;const half=(N,r)=>{const o=Sh.gearOutline(r,N),rr=r-1.25*m;return{o:o.map(q=>{const t=Math.atan2(q[1],q[0]);if(Math.sin(t)<=0.01)return q;const R=Math.min(Math.hypot(q[0],q[1]),rr);return[R*Math.cos(t),R*Math.sin(t)];}),h:[Sh.hole(0,0)]};};
 PK.def(123,{S:0.3,summary:'A sliding frame with racks on its upper and lower bars works two half-toothed sectors; each sector’s shaft carries a small gear meshing with a centre gear. Stroke one way, one sector drives; stroke back, the other; the centre gear turns steadily one way.',
  parts:[{id:'f',name:'Rack frame',role:'driver',layer:0,shape:S=>({o:[[S1[0]-141,S1[1]-sim.r-28],[S2[0]+141,S1[1]-sim.r-28],[S2[0]+141,S1[1]+sim.r+28],[S1[0]-141,S1[1]+sim.r+28]].map(([x,y])=>[x-400,y-S1[1]]),h:[[[S1[0]-125-400,-sim.r-1.25*m],[S2[0]+125-400,-sim.r-1.25*m],[S2[0]+125-400,sim.r+1.25*m],[S1[0]-125-400,sim.r+1.25*m]]]}),bosses:[[S1[0]-134-400,0,10,3.5]]},
    {id:'s1',name:'Half sector (left)',role:'link',layer:0,shape:half(sim.N,sim.r)},{id:'s2',name:'Half sector (right)',role:'link',layer:0,shape:half(sim.N,sim.r)},
    {id:'q1',name:'Sector gear (left)',role:'link',layer:1,shape:S=>S.gear(sim.rs,sim.Ns)},{id:'q2',name:'Sector gear (right)',role:'link',layer:1,shape:S=>S.gear(sim.rs,sim.Ns)},{id:'c',name:'Centre gear',role:'driven',layer:1,shape:S=>S.gear(sim.rg,sim.Ng)}],
  ground:[[S1[0],S1[1],0,1],[S2[0],S2[1],0,1],[G[0],G[1],1,1]],
  pose(g){const th1=Math.atan2(G[1]-S1[1],G[0]-S1[0]),th2=Math.atan2(G[1]-S2[1],G[0]-S2[0]);return{f:[400+g.x,S1[1],0],s1:[S1[0],S1[1],g.al-PI/2],s2:[S2[0],S2[1],g.al+PI/2],q1:[S1[0],S1[1],g.al+th1],q2:[S2[0],S2[1],g.al+th2],c:[G[0],G[1],g.beta+th1+PI+TAU/sim.Ng/2]};},drive:'Slide the frame back and forth by its knob.'});}
/* ---------- 124 fiddle drill ---------- */
{const sim=window.MB.SIMS[124];
 PK.defS(124,{summary:'The fiddle drill: the bow string takes a turn round the pulley on the spindle; pushing the bow back and forth spins the drill one way and then the other.',cam:{yaw:0.5,pitch:0.3},
  base:()=>[U.plate(-30,-30,30,30),U.post(0,0,U.BT+12,U.BT+4)],
  parts:[{id:'sp',name:'Spindle with pulley',role:'driven',mesh:K.merge(K.cyl(2.5,0,60,20),K.lathe([[2.5,20],[6,20],[6,21],[4.6,23],[4.6,27],[6,29],[6,30],[2.5,30]],40))},{id:'hd',name:'Breast plate',role:'frame',mesh:K.lathe([[2.8,0],[12,0],[12,4],[2.8,4]],40)},{id:'bow',name:'Bow',role:'driver',mesh:K.merge(K.box(110,6,0,6),K.box(6,14,0,6,-55,7),K.box(6,14,0,6,55,7))}],
  pose(phi,g){const a=g.al||0,bx=(g.bx||0)*0.3;return{sp:K.M4.mul(K.M4.T(0,0,U.BT+6),K.M4.Rz(a)),hd:K.M4.T(0,0,U.BT+6+61),bow:K.M4.T(bx,-14,U.BT+6+22)};},
  hardware:['A length of strong cord for the bow string: take one turn round the pulley.'],drive:'Saw the bow back and forth.'});}
/* ---------- 126 bell crank ---------- */
{const sim=window.MB.SIMS[126],P=sim.P0;PK.def(126,{S:0.3,summary:'A bell crank: two arms at right angles on one pivot turn a push or pull through a right angle; the ratio of the arm lengths sets the force and travel.',
  parts:[{id:'b',name:'Bell crank',role:'driver',layer:0,shape:S=>S.lever([[-130,0,10],[0,0,16],[0,-130,10]],[[0,0],[-130,0],[0,-130]]),bosses:[[-120,0,12,3.5]]}],ground:[[P[0],P[1],0,0]],
  pose(g){return{b:[P[0],P[1],g.t]};},drive:'Rock the crank by its knob.'});}
/* ---------- 127 twin-rack air pump ---------- */
{const sim=window.MB.SIMS[127],G=[sim.Gc.x,sim.Gc.y],r=sim.r,N=sim.N,m=6;
 PK.def(127,{S:0.3,up:true,summary:'Brown’s twin air pump: a hand lever on the gear’s shaft rocks the gear; racks on opposite sides of it carry the two pistons, so one rises while the other falls and the pumps work in turn.',
  parts:[{id:'g',name:'Gear with lever',role:'driver',layer:0,shape:S=>({o:K.hull([...S.circle(r+8,48),...S.circle(10,16,260,0)]),h:[S.hole(0,0)]})},{id:'gt',name:'Gear teeth (glue on)',role:'driver',layer:1,shape:S=>S.gear(r,N,{lighten:false})},
    {id:'ra',name:'Rack and piston A',role:'driven',layer:1,shape:S=>{const R=S.rack(-150,150,m,14,{c0:0});return{o:R.o.map(([x,y])=>[y,x]),h:[]};}},{id:'rb',name:'Rack and piston B',role:'driven',layer:1,shape:S=>{const R=S.rack(-150,150,m,14,{c0:0});return{o:R.o.map(([x,y])=>[-y,x]),h:[]};}}],
  ground:[[G[0],G[1],0,1]],fixed:[{shape:S=>S.rect(10,300,G[0]-r-1.25*m-24,G[1]-60),l1:1},{shape:S=>S.rect(10,300,G[0]+r+1.25*m+24,G[1]-60),l1:1}],
  pose(g){return{g:[G[0],G[1],g.lam+PI/5],gt:[G[0],G[1],g.lam],ra:[G[0]-r,G[1]+g.yl,0],rb:[G[0]+r,G[1]+g.yr,0]};},drive:'Rock the lever: the racks go up and down by turns.'});}
/* ---------- 129 Chinese windlass ---------- */
for(const n of [129,352]){const sim=window.MB.SIMS[n];if(!sim)continue;const B=[400,110],r1=sim.r1,r2=sim.r2,rp=(r1+r2)/2;
 PK.def(n,{S:0.4,up:true,summary:'The Chinese windlass: the barrel has two diameters; the rope winds onto the large one while it unwinds from the small one, and the pulley hanging in the loop rises by half the difference of the two circumferences per turn: a huge mechanical advantage from a simple drum.',
  parts:[{id:'b',name:'Two-diameter barrel with crank',role:'driver',layer:1,mesh:K.merge(K.lathe([[PK.BORER,0],[r1*0.4+1.5,0],[r1*0.4+1.5,1.2],[r1*0.4,2],[r1*0.4,5],[r2*0.4+1.5,5.2],[r2*0.4,6],[r2*0.4,9],[r2*0.4+1.5,9.8],[r2*0.4+1.5,11],[PK.BORER,11]],64),K.cyl(2.5,11,22,16,r2*0.4-3,0))},
    {id:'p',name:'Running pulley with hook',role:'driven',layer:1,mesh:K.merge(PK.Mesh.pulley(rp*0.4,8),K.box(4,4,0,8,0,-rp*0.4-6))}],
  ground:[[B[0],B[1],1,3]],
  pose(g){const y=360-g.lift,cx=B[0]-(r1-r2)/2;return{b:[B[0],B[1],g.th],p:[cx,y,0]};},
  ropes(g){const y=360-g.lift,cx=B[0]-(r1-r2)/2,z1=PK.zl(1)+3.5,z2=PK.zl(1)+7.5,pts=[[B[0]-r1,B[1],z1],[cx-rp,y,z1]];for(let i=0;i<=12;i++){const a=PI-i/12*PI;pts.push([cx+rp*Math.cos(a),y+rp*Math.sin(a),z1+(z2-z1)*i/12]);}pts.push([B[0]+r2,B[1],z2]);return[{pts,r:0.9}];},
  hardware:['About 50 cm of thin cord; tie one end on each part of the barrel.'],drive:'Turn the crank: the pulley creeps up.'});}
/* ---------- 131 slotted sector driving a rack ---------- */
{const sim=window.MB.SIMS[131],P0=sim.P0,O=sim.O,r=sim.r,R=sim.R,m=6,Z=Math.round(2*R/m);
 PK.def(131,{S:0.25,summary:'A crank pin works in the slot of a toothed sector hung from a pivot above; the sector swings and its teeth drive the rack below straight back and forth.',
  parts:[{id:'w',name:'Crank disk with pin',role:'driver',layer:0,shape:S=>S.disk(r+20),pins:[[r,0,1]],bosses:[[-r,0,14,3.5]]},
    {id:'s',name:'Slotted toothed sector',role:'link',layer:1,shape:S=>{const t=S.gearOutline(R,Z).filter(p=>Math.abs(Math.atan2(p[1],p[0])-PI/2)<0.32).sort((p,q)=>Math.atan2(p[1],p[0])-Math.atan2(q[1],q[0]));return{o:[[14,-14],...t,[-14,-14]],h:[S.hole(0,0),S.slotPts(0,O[1]-P0[1]-r-14,0,O[1]-P0[1]+r+14,20)]};}},
    {id:'k',name:'Sliding block',role:'link',layer:1,shape:S=>S.rect(19.5,30,0,0,[[0,0]])},{id:'rk',name:'Rack',role:'driven',layer:1,shape:S=>({o:S.rack(-280,280,m,18,{c0:0}).o,h:[]})}],
  ground:[[O[0],O[1],0,0],[P0[0],P0[1],1,1]],fixed:[{shape:S=>S.rect(600,8,400,P0[1]+R+1.25*m+26),l1:1}],
  pose(g){return{w:[O[0],O[1],g.phi],s:[P0[0],P0[1],-g.a],k:[g.pin[0],g.pin[1],-g.a],rk:[400+g.x,P0[1]+R,0]};},drive:'Turn the crank disk.'});}
/* ---------- 132 slanted-bar press ---------- */
{PK.defS(132,{summary:'A display model of the slanted-bar press: turning the upper disk swings the bars toward upright, which forces the lower disk down.',cam:{yaw:0.5,pitch:0.3},
  base:()=>[U.plate(-40,-40,40,40),U.post(0,0,U.BT+70,U.BT+60),K.box(4,4,0,40,32,0),K.box(4,4,0,40,-32,0)],
  parts:[{id:'t',name:'Upper disk',role:'driver',mesh:K.merge(K.prism(K.circle(30,64),[K.circle(U.SHB,24)],0,4),K.box(40,4,0,4,30,0))},{id:'b',name:'Lower disk (slides on the post)',role:'driven',mesh:K.prism(K.circle(38,64),[K.circle(U.SHB,24),K.circle(2.6,16,32,0),K.circle(2.6,16,-32,0)],0,4)},{id:'r',name:'Bar',role:'link',qty:6,mesh:K.cyl(1.6,0,24,12)}],
  pose(phi,g){const d=(g.d||0)*0.3,a=0.5*Math.sin(phi)*0.6,zt=U.BT+60,zb=zt-24+d-4;const bars=[];for(let k=0;k<6;k++){const t=k*PI/3,p1=[22*Math.cos(t+a),22*Math.sin(t+a),zt],p2=[22*Math.cos(t+0.5),22*Math.sin(t+0.5),zb+4];const n=[p1[0]-p2[0],p1[1]-p2[1],p1[2]-p2[2]],l=Math.hypot(...n);bars.push(K.M4.mul(U.at(p2,n.map(v=>v/l),0),K.M4.S(1,1,l/24)));}
    return{t:K.M4.mul(K.M4.T(0,0,zt),K.M4.Rz(a)),b:K.M4.T(0,0,zb),r:bars};},drive:'Turn the upper disk by its arm.'});}
/* ---------- 133 sector press ---------- */
{const S=[300,180];PK.def(133,{S:0.3,summary:'A small hand press: the crank turns a pinion that drives a toothed sector; the sector’s arm pushes the platen down through a short rod.',
  parts:[{id:'p',name:'Pinion with handle',role:'driver',layer:0,shape:S=>S.gear(40,14),bosses:[[20,0,14,3.5]]},{id:'s',name:'Toothed sector with arm',role:'link',layer:0,shape:SS=>{const g=SS.gearOutline(90,32).filter(p=>Math.abs(Math.atan2(p[1],-p[0]))<0.5);return{o:K.hull([...g,...SS.circle(14,16),...SS.circle(10,16,150,0)]),h:[SS.hole(0,0),SS.hole(150,0)]};}},
    {id:'r',name:'Rod',role:'link',layer:1,shape:SS=>SS.bar(120,12)},{id:'pl',name:'Platen',role:'driven',layer:0,shape:SS=>SS.rect(90,20,0,0,[[0,0]]),pins:[[0,0,1]]}],
  ground:[[S[0]-130,S[1],0,0],[S[0],S[1],0,0]],fixed:[{shape:SS=>SS.rect(10,100,S[0]+150-60,S[1]+170),l1:0},{shape:SS=>SS.rect(10,100,S[0]+150+60,S[1]+170),l1:0}],
  pose(g){const E=[S[0]+150*Math.cos(g.a),S[1]+150*Math.sin(g.a)],Y=E[1]+Math.sqrt(Math.max(0,120*120-(S[0]+150-E[0])**2));return{p:[S[0]-130,S[1],-g.a*90/40*3],s:[S[0],S[1],g.a],r:[E[0],E[1],Math.atan2(Y-E[1],S[0]+150-E[0])],pl:[S[0]+150,Y,0]};},drive:'Turn the pinion.'});}
/* ---------- 134 rope drum ---------- */
{const D=[400,120],r=50;PK.def(134,{S:0.3,up:true,summary:'A rope wound on a drum: uniform turning of the drum gives the load a uniform straight lift.',
  parts:[{id:'d',name:'Drum with crank',role:'driver',layer:1,mesh:K.merge(K.lathe([[PK.BORER,0],[r*0.3+2,0],[r*0.3+2,1.5],[r*0.3,2.5],[r*0.3,8.5],[r*0.3+2,9.5],[r*0.3+2,11],[PK.BORER,11]],48),K.cyl(2.5,11,22,16,r*0.3-3,0))},{id:'l',name:'Load box',role:'driven',layer:1,mesh:PK.Mesh.box(14,12,12)}],
  ground:[[D[0],D[1],1,3]],pose(g){const y=420-g.lift/10;return{d:[D[0],D[1],g.th],l:[D[0]+r,y+20,0]};},ropes(g){const y=420-g.lift/10;return[{pts:[[D[0]+r,D[1],PK.zl(1)+5.5],[D[0]+r,y,PK.zl(1)+5.5]],r:0.9}];},drive:'Turn the crank: the load rises steadily.'});}
/* ---------- 137 expansion eccentric (display) ---------- */
{PK.def(137,{S:0.3,summary:'A display of the French expansion eccentric: the eccentric on the crank shaft swings a forked arm, and the valve rod hung from the arm works the slide valve; the throw sets the cut-off.',
  parts:[{id:'e',name:'Eccentric',role:'driver',layer:0,shape:S=>S.disk(80,[[-28,0]]),bosses:[[30,0,12,3.5]]},{id:'s',name:'Strap and rod',role:'link',layer:1,shape:S=>({o:K.hull([...S.circle(96,48),...S.circle(10,16,250,0)]),h:[S.circle(82,64)]}),pins:[[250,0,1]]},{id:'v',name:'Valve slide',role:'driven',layer:0,shape:S=>S.rect(70,40,0,0,[])}],
  ground:[[260,280,0,0]],fixed:[{shape:S=>S.rect(140,8,540,254),l1:0},{shape:S=>S.rect(140,8,540,306),l1:0}],
  pose(g){const c=[260+28*Math.cos(g.phi),280+28*Math.sin(g.phi)],x=c[0]+Math.sqrt(250*250-(c[1]-280)**2);return{e:[260,280,g.phi],s:[c[0],c[1],Math.atan2(280-c[1],x-c[0])],v:[x,280,0]};},drive:'Turn the eccentric.'});}
/* ---------- 138 cam and rod ---------- */
{const sim=window.MB.SIMS[138],O=sim.O,pts=[];for(let i=0;i<200;i++){const s=i/200*TAU,r=sim.r(s);pts.push([r*Math.cos(s),r*Math.sin(s)]);}
 PK.def(138,{S:0.3,summary:'A cam turning below a rod that rests on it gives the rod a varied up-and-down motion; the shape of the cam is the shape of the motion.',
  parts:[{id:'c',name:'Cam',role:'driver',layer:0,shape:pxPoly(pts),bosses:[[-40,0,12,3.5]]},{id:'r',name:'Rod with roller',role:'driven',layer:0,shape:S=>({o:[[-8,0],[8,0],[8,-180],[-8,-180]],h:[]})}],
  ground:[[O[0],O[1],0,0]],fixed:[{shape:S=>S.rect(10,30,O[0]-20,110),l1:0},{shape:S=>S.rect(10,30,O[0]+20,110),l1:0}],pose(g){return{c:[O[0],O[1],g.phi],r:[O[0],O[1]-g.h,0]};},drive:'Turn the cam.'});}
/* ---------- 140 toggle joint ---------- */
{const sim=window.MB.SIMS[140],T=sim.T,Lt=sim.L;PK.def(140,{S:0.3,summary:'A toggle joint for a punching machine: pulling the knee straight drives the ram down with enormous force at the end of the stroke.',
  parts:[{id:'a',name:'Upper toggle link',role:'link',layer:0,shape:S=>S.bar(Lt,14),pins:[[Lt,0,1]]},{id:'b',name:'Lower toggle link',role:'link',layer:1,shape:S=>S.bar(Lt,14)},{id:'h',name:'Ram',role:'driven',layer:0,shape:S=>S.rect(30,80,0,20,[[0,0]]),pins:[[0,0,1]]},{id:'p',name:'Pull link',role:'driver',layer:2,shape:S=>S.bar(260,10),bosses:[[-10,0,0.01,0.01]]}],
  ground:[[T[0],T[1],0,0]],fixed:[{shape:S=>S.rect(10,200,T[0]-30,T[1]+250),l1:1},{shape:S=>S.rect(10,200,T[0]+30,T[1]+250),l1:1}],
  pose(g){const K=[T[0]-g.k,T[1]+g.h];return{a:[T[0],T[1],Math.atan2(K[1]-T[1],K[0]-T[0])],b:[K[0],K[1],Math.atan2(g.Y-K[1],T[0]-K[0])],h:[T[0],g.Y,0],p:[K[0]-260,K[1],0]};},drive:'Pull the link to straighten the toggle.'});}
/* ---------- 141 band saw ---------- */
{PK.def(141,{S:0.3,up:true,summary:'An endless band saw: the blade runs round two pulleys, so the straight run through the table moves continuously in one direction.',
  parts:[{id:'a',name:'Upper pulley',role:'link',layer:1,mesh:PK.Mesh.pulley(27,8)},{id:'b',name:'Lower pulley with crank',role:'driver',layer:1,mesh:K.merge(PK.Mesh.pulley(27,8),K.cyl(2.5,8,18,16,20,0))}],
  ground:[[400,110,1,2],[400,420,1,2]],fixed:[{shape:S=>S.rect(240,14,400,265),l1:1}],
  pose(g){return{a:[400,110,g.phi],b:[400,420,g.phi]};},ropes(g){const pts=[];for(let i=0;i<=24;i++){const a=PI+i/24*PI;pts.push([400+90*Math.cos(a),110+90*Math.sin(a)]);}for(let i=0;i<=24;i++){const a=i/24*PI;pts.push([400+90*Math.cos(a),420+90*Math.sin(a)]);}return[{pts,z:PK.zl(1)+4,r:1.2,closed:true}];},
  hardware:['A thin rubber band or O-ring as the band.'],drive:'Turn the lower pulley.'});}
/* ---------- 143 worm traverse ---------- */
{const sim=window.MB.SIMS[143];PK.def(143,{S:0.3,summary:'The worm and its wheel ride on a sliding frame; a rod from a pin on the wheel to a fixed post makes the frame traverse back and forth as the worm turns the wheel.',
  parts:[{id:'f',name:'Sliding frame',role:'link',layer:0,shape:S=>({o:[[-150,-120],[150,-120],[150,180],[-150,180]],h:[[[-138,-108],[138,-108],[138,168],[-138,168]]]})},{id:'w',name:'Worm wheel',role:'driven',layer:1,shape:S=>S.gear(96,32),pins:[[sim.r,0,2]]},{id:'r',name:'Rod',role:'link',layer:2,shape:S=>S.bar(sim.L,12)}],
  ground:[[sim.F[0],sim.F[1],2,2]],
  pose(g){const C0=[g.cx0+g.x,g.y0],P=[C0[0]+sim.r*Math.cos(g.w),C0[1]+sim.r*Math.sin(g.w)];return{f:[C0[0],C0[1],0],w:[C0[0],C0[1],g.w],r:[P[0],P[1],Math.atan2(sim.F[1]-P[1],sim.F[0]-P[0])]};},drive:'Turn the wheel (the worm is shown in the simulation).'});}
/* ---------- 144 lazy tongs ---------- */
{const sim=window.MB.SIMS[144],Lt=sim.L,n=sim.n,x0=150,y0=260;PK.def(144,{S:0.3,summary:'Lazy tongs: crossed levers pinned at their middles and ends. A short movement of the first pair stretches the whole chain a long way.',
  parts:[{id:'a',name:'Lever (front)',role:'driver',layer:0,qty:n,shape:S=>S.bar(Lt,10,[0,Lt/2,Lt]),pins:[[0,0,1],[Lt/2,0,1],[Lt,0,1]]},{id:'b',name:'Lever (back)',role:'link',layer:1,qty:n,shape:S=>S.bar(Lt,10,[0,Lt/2,Lt])}],ground:[],
  pose(g){const dx=Lt*Math.cos(g.th),dy=Lt/2*Math.sin(g.th),A=[],B=[];for(let i=0;i<n;i++){const xa=x0+i*dx;A.push([xa,y0-dy,Math.atan2(2*dy,dx)]);B.push([xa,y0+dy,Math.atan2(-2*dy,dx)]);}return{a:A,b:B};},plate:{x0:100,y0:150,x1:720,y1:370},drive:'Squeeze the two free ends at the left together and apart.'});}
/* ---------- 145 beam, crank and flywheel ---------- */
{const sim=window.MB.SIMS[145],Bp=sim.Bp,Lb=sim.Lb,O=sim.O,r=sim.r,Lr=sim.Lr;PK.def(145,{S:0.25,up:true,summary:'A beam engine in outline: the rocking beam drives the crank and flywheel through the connecting rod, while its other end works the piston rod in a straight line.',
  parts:[{id:'f',name:'Flywheel with crank pin',role:'driver',layer:0,shape:S=>({o:S.circle(125,96),h:[S.hole(0,0),...[0,1,2,3,4,5].map(k=>S.circle(30,24,75*Math.cos(k*PI/3+0.5),75*Math.sin(k*PI/3+0.5)))]}),pins:[[r,0,1]]},
    {id:'b',name:'Beam',role:'link',layer:2,shape:S=>S.bar(2*Lb,16,[0,Lb,2*Lb])},{id:'c',name:'Connecting rod',role:'link',layer:1,shape:S=>S.bar(Lr,12),pins:[[Lr,0,2]]},{id:'p',name:'Piston rod',role:'driven',layer:1,shape:S=>S.rect(24,160,0,70,[[0,0]]),pins:[[0,0,2]]}],
  ground:[[Bp[0],Bp[1],2,2],[O[0],O[1],0,0]],fixed:[{shape:S=>S.rect(10,120,2*Bp[0]-O[0]-20,330),l1:1},{shape:S=>S.rect(10,120,2*Bp[0]-O[0]+20,330),l1:1}],
  pose(g){return{f:[O[0],O[1],g.phi],b:[g.F[0],g.F[1],Math.atan2(g.E[1]-g.F[1],g.E[0]-g.F[0])],c:[g.pin[0],g.pin[1],Math.atan2(g.E[1]-g.pin[1],g.E[0]-g.pin[0])],p:[g.F[0],g.F[1],0]};},drive:'Turn the flywheel.'});}
/* ---------- 146 shaped Scotch yoke ---------- */
{const sim=window.MB.SIMS[146],O=[260,270],r=80;const ctr=[];for(let i=0;i<200;i++){const t=i/200*TAU;ctr.push([r*Math.cos(t)-sim.u(t),r*Math.sin(t)]);}
 PK.def(146,{S:0.3,summary:'A Scotch yoke whose groove is shaped instead of straight: the crank pin follows the groove, and the shape is chosen so the yoke moves quickly in mid-stroke and slowly at the ends (or any law you like).',
  parts:[{id:'d',name:'Crank disk with pin',role:'driver',layer:0,shape:S=>S.disk(110),bosses:[[r,0,PK.TH+PK.GAP+PK.TH-1,2.4],[-80,0,8,3.5]]},{id:'y',name:'Yoke with shaped groove (groove down)',role:'driven',layer:1,mesh:K.xf(L.groovedPlate([[-60,120],[60,120],[60,14],[300,14],[300,-14],[60,-14],[60,-120],[-60,-120]],ctr.map(([x,y])=>[x,-y]),16,[]),K.M4.mul(K.M4.T(0,0,PK.TH),K.M4.Rx(PI)))}],
  ground:[[O[0],O[1],0,0]],fixed:[{shape:S=>S.rect(120,8,O[0]+440,O[1]-22),l1:1},{shape:S=>S.rect(120,8,O[0]+440,O[1]+22),l1:1}],
  pose(g){return{d:[O[0],O[1],g.phi],y:[O[0]+g.u,O[1],0]};},drive:'Turn the crank disk.'});}
/* ---------- governors (147 and the other gov() simulations) ---------- */
function govModel(n,summary){const sim=window.MB.SIMS[n];if(!sim)return;const Lg=sim.L*0.25,top=U.BT+70;
  PK.defS(n,{summary,cam:{yaw:0.5,pitch:0.25},params:sim.params,
    base:()=>[U.plate(-30,-30,30,30),U.post(0,0,U.BT+20,U.BT+5)],
    parts:[{id:'sp',name:'Spindle',role:'driver',mesh:K.merge(K.cyl(2.5,0,top-U.BT+8,20),K.box(16,6,top-U.BT-4,top-U.BT+2))},{id:'arm',name:'Ball arm',role:'link',qty:2,mesh:K.merge(K.box(4,4,0,Lg),K.lathe([[0.01,Lg-4],[5,Lg],[0.01,Lg+5]].length?[[0.01,Lg-5],[6,Lg-3],[6,Lg+3],[0.01,Lg+5]]:[],24))},{id:'sl',name:'Sliding sleeve',role:'driven',mesh:K.tubeSolid(6,2.8,0,8,32)}],
    pose(phi,g){const th=g.th||0.5,out={sp:K.M4.mul(K.M4.T(0,0,U.BT+5),K.M4.Rz(phi)),arm:[],sl:K.M4.mul(K.M4.T(0,0,top-Lg*Math.cos(th)-14),K.M4.Rz(phi))};
      for(const s of [0,PI]){const a=phi+s,d=[Math.sin(th)*Math.cos(a),Math.sin(th)*Math.sin(a),-Math.cos(th)];out.arm.push(U.at([6*Math.cos(a),6*Math.sin(a),top],d,0));}return out;},
    drive:'Spin the spindle (set the speed on the simulation): the balls fly out and lift the sleeve.'});}
govModel(147,'A centrifugal governor in outline (Brown’s version has fans and rollers on inclined planes): as the spindle speeds up the arms fly out and the sleeve rises to close the valve.');
{const sim=window.MB.SIMS[142],O=[300,280];PK.def(142,{S:0.3,summary:'A display of Brown’s variable traverse for silk machinery: a spur gear carried round on a disk is turned on its own axis by a fixed pinion, and the crank on it lengthens and shortens the guide’s stroke from turn to turn.',
  parts:[{id:'g',name:'Large gear with crank slot',role:'driver',layer:0,shape:S=>({o:S.gearOutline(100,40),h:[S.hole(0,0),S.slotPts(36,0,74,0,16)]}),bosses:[[-70,0,12,3.5]]},{id:'s',name:'Small gear',role:'link',layer:0,shape:S=>S.gear(50,20)},{id:'p',name:'Crank pin block',role:'link',layer:1,shape:S=>S.rect(18,18,0,0,[[0,0]])},{id:'b',name:'Guide bar with slot',role:'driven',layer:2,shape:S=>({o:[[-12,-140],[12,-140],[12,140],[-12,140]],h:[S.slotPts(0,-120,0,120,16)]})}],
  ground:[[O[0],O[1],0,1],[O[0]+150,O[1]+90,0,0]],fixed:[{shape:S=>S.rect(10,60,O[0]-80,O[1]-170),l1:2},{shape:S=>S.rect(10,60,O[0]+80,O[1]-170),l1:2}],
  pose(g){return{g:[O[0],O[1],g.phi],s:[O[0]+150,O[1]+90,-g.phi*2],p:[O[0]+g.r*Math.cos(g.phi),O[1]+g.r*Math.sin(g.phi),g.phi],b:[O[0]+g.x,O[1],0]};},drive:'Turn the large gear.'});}

})();
