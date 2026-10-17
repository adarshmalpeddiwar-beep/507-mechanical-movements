(function(){const K=window.CAD.K,PK=window.PK,M4=K.M4,PI=Math.PI,TAU=2*PI;const mod=(a,n)=>((a%n)+n)%n;const ropeThru=(...a)=>window.MB.ropeThru(...a);
/* ===== printable models 401–440 ===== */
const U=PK.U,{Sh}=PK,L=PK.Lib;PK._S(0.3);const pxPoly=L.pxPoly;
const armPts=(A,B,r)=>K.hull([...K.circle(r,20,A[0],A[1]),...K.circle(r,20,B[0],B[1])]);
const rotP=(pts,a,c=[0,0])=>pts.map(([x,y])=>[c[0]+x*Math.cos(a)-y*Math.sin(a),c[1]+x*Math.sin(a)+y*Math.cos(a)]);
const slotArm=(ang,L,s0,s1,w=12)=>({o:rotP(armPts([0,0],[L,0],w),ang),h:[rotP(Sh.slotPts(s0,0,s1,0),ang)]});

/* 403 · cyclograph: two arms at a fixed angle slide on two pins; the joint draws a big arc */
{const sim=window.MB.SIMS[403],A=sim.A,B=sim.B,g0=sim.geo(0),P0=g0.P,a1=Math.atan2(A[1]-P0[1],A[0]-P0[0]),a2=Math.atan2(B[1]-P0[1],B[0]-P0[0]),La=Math.hypot(A[0]-P0[0],A[1]-P0[1]);
 PK.def(403,{S:0.3,summary:'A cyclograph, for drawing an arc too large for compasses: two straight arms joined at a fixed angle are slid against two pins. Because the angle the pins subtend at the joint never changes, the joint, where the pencil is, runs on a circular arc through the pins.',
  parts:[{id:'v',name:'Arms joined at a fixed angle, with pencil hole',role:'driver',layer:0,mesh:K.merge(PK.ext(slotArm(0,(B[0]-A[0])+30,30,(B[0]-A[0])+15),0,PK.TH),PK.ext(slotArm(a2-a1,(B[0]-A[0])+30,30,(B[0]-A[0])+15),0,PK.TH),PK.ext({o:K.circle(14,24),h:[K.circle(5,16)]},0,PK.TH))}],
  ground:[[A[0],A[1],0,0],[B[0],B[1],0,0]],
  pose(g){return{v:[g.P[0],g.P[1],Math.atan2(A[1]-g.P[1],A[0]-g.P[0])]};},drive:'Slide the arms against both pins with a pencil in the joint: it draws a large arc.'});}

/* 404 · arc bow: a tapered strip bent by its cord into a true arc through three points */
{const sim=window.MB.SIMS[404],s=50,R=(220*220+s*s)/(2*s),Cy=320-s+R,half=Math.asin(240/R);
 const bow=()=>{const o=[];for(let i=0;i<=40;i++){const t=-PI/2-half+2*half*i/40,w=4+3*Math.cos((i/40-0.5)*PI);o.push([400+(R+w/2)*Math.cos(t),Cy+(R+w/2)*Math.sin(t)]);}for(let i=40;i>=0;i--){const t=-PI/2-half+2*half*i/40,w=4+3*Math.cos((i/40-0.5)*PI);o.push([400+(R-w/2)*Math.cos(t),Cy+(R-w/2)*Math.sin(t)]);}return{o,h:[]};};
 PK.def(404,{S:0.3,summary:'An arc bow for drawing a flat arc through three points: a strip tapered from the middle to the ends is bent by a cord (or screw) until it passes through the three marks. A strip tapered this way bends into a true circular arc, which a pencil can follow.',params:sim.params,
  parts:[{id:'b',name:'Tapered bow strip (print flat and thin; it bends)',role:'driver',layer:0,shape:bow()}],
  ground:[[180,320,0,0,false],[400,320-s,0,0,false],[620,320,0,0,false]],plate:{x0:140,y0:240,x1:660,y1:360},
  pose(){return{b:[0,0,0]};},ropes(){const z=PK.zl(0)+2,e=[400+R*Math.cos(-PI/2-half),Cy+R*Math.sin(-PI/2-half)];return[{pts:[[e[0],e[1],z],[800-e[0],e[1],z]],r:0.6}];},
  hardware:['A strong thread tied to both ends of the bow to hold the bend.'],drive:'Set the three pins at the marks and bend the bow to touch all three, then run a pencil along it.'});}

/* 405 · hyperbola by thread and rule */
{const sim=window.MB.SIMS[405],R0=PK.runner(405),g0=R0.at(0);
 PK.def(405,{S:0.3,summary:'Drawing a hyperbola: a rule turns about one focus; a thread, shorter than the rule, runs from its far end to the other focus. Keeping the thread taut against the rule with the pencil, the difference of the pencil’s distances from the two foci stays constant, which is the property of the hyperbola.',
  parts:[{id:'r',name:'Rule',role:'driver',layer:0,shape:S=>({o:armPts([0,0],[420,0],10),h:[S.hole(0,0),S.hole(420,0,4)]})},{id:'p',name:'Pencil block',role:'link',layer:1,shape:S=>S.rect(24,24,0,0,[[0,0,5]])}],
  ground:[[g0.F1[0],g0.F1[1],0,0],[g0.F2[0],g0.F2[1],1,1,false]],
  pose(g){return{r:[g.F1[0],g.F1[1],Math.atan2(g.E[1]-g.F1[1],g.E[0]-g.F1[0])],p:[g.P[0],g.P[1],Math.atan2(g.E[1]-g.F1[1],g.E[0]-g.F1[0])]};},
  ropes(g){const z=PK.zl(1)+2;return[{pts:[[g.E[0],g.E[1],z],[g.P[0],g.P[1],z],[g.F2[0],g.F2[1],z]],r:0.5}];},
  hardware:['A thread from the end of the rule to the second focus pin.'],drive:'Swing the rule, keeping the thread taut against it with the pencil.'});}

/* 406 · parabola by thread and square */
{const sim=window.MB.SIMS[406],R0=PK.runner(406),g0=R0.at(0),F=g0.F,dy=g0.dy;
 PK.def(406,{S:0.3,summary:'Drawing a parabola: a square slides along a straight edge (the directrix); a thread as long as the square’s upright runs from its top to the focus. Held taut against the upright by the pencil, the thread keeps the pencil as far from the focus as from the edge, which traces a parabola.',
  parts:[{id:'q',name:'Square (foot and upright)',role:'driver',layer:0,shape:S=>({o:[[-40,0],[40,0],[40,-20],[14,-20],[14,-(dy-g0.top+40)],[0,-(dy-g0.top+40)],[0,-20],[-40,-20]],h:[]})},{id:'p',name:'Pencil block',role:'link',layer:1,shape:S=>S.rect(22,22,0,0,[[0,0,5]])}],
  ground:[[F[0],F[1],1,1,false]],fixed:[{shape:S=>S.rect(640,14,400,dy+7),l1:0}],
  pose(g){return{q:[g.s,dy,0],p:[g.P[0]+7,g.P[1],0]};},
  ropes(g){const z=PK.zl(1)+2;return[{pts:[[g.s+7,g.top-40,z],[g.P[0],g.P[1],z],[F[0],F[1],z]],r:0.5}];},
  hardware:['A thread from the top of the upright to the focus pin.'],drive:'Slide the square along the edge, holding the thread taut against the upright with the pencil.'});}

/* 407 · pointed arch: two arcs, each struck from the opposite springing point */
{const A=[260,380],B=[540,380],R=280;
 PK.def(407,{S:0.3,summary:'An instrument for drawing pointed (Gothic) arches: a radius bar the width of the arch is pinned first at one springing point to strike one side of the arch, then at the other to strike the other side; the two arcs meet at the point.',
  parts:[{id:'ra',name:'Radius bar on the right springing point',role:'driver',layer:0,shape:S=>({o:armPts([0,0],[R,0],9),h:[S.hole(0,0),S.hole(R,0,5)]})},{id:'rb',name:'Radius bar on the left springing point',role:'driver',layer:1,shape:S=>({o:armPts([0,0],[R,0],9),h:[S.hole(0,0),S.hole(R,0,5)]})}],
  ground:[[A[0],A[1],0,1],[B[0],B[1],0,0]],fixed:[{shape:S=>S.rect(400,10,400,392),l1:0}],
  pose(g){const u=g.u;return{ra:[B[0],B[1],u<0.5?-(PI-u*2*PI/3):-2*PI/3],rb:[A[0],A[1],u<0.5?-PI/3:-(PI/3-(u-0.5)*2*PI/3)]};},
  drive:'Swing each radius bar in turn: the two arcs meet in the point of the arch.'});}

/* 408 · centrolinead */
{const sim=window.MB.SIMS[408],A=sim.A,B=sim.B,V=sim.V,R0=PK.runner(408),g0=R0.at(0),H0=g0.H,aV=g0.ang,aA=Math.atan2(A[1]-H0[1],A[0]-H0[0])-aV,aB=Math.atan2(B[1]-H0[1],B[0]-H0[0])-aV,LA=Math.hypot(A[0]-H0[0],A[1]-H0[1]),LB=Math.hypot(B[0]-H0[0],B[1]-H0[1]);
 PK.def(408,{S:0.3,summary:'A centrolinead, for ruling lines towards a vanishing point far off the drawing: a straight-edge carries two arms set at fixed angles, and the arms are slid against two pins. The joint runs on the circle through the pins and the far point, so the edge always points at that point.',
  parts:[{id:'c',name:'Straight-edge with two arms',role:'driver',layer:0,mesh:K.merge(PK.ext({o:[[0,-8],[560,-8],[560,8],[0,8]],h:[]},0,PK.TH),PK.ext(slotArm(aA,LA+50,LA-30,LA+40),0,PK.TH),PK.ext(slotArm(aB,LB+50,LB-30,LB+40),0,PK.TH),PK.ext({o:K.circle(12,24),h:[]},0,PK.TH))}],
  ground:[[A[0],A[1],0,0],[B[0],B[1],0,0]],plate:{x0:140,y0:100,x1:780,y1:420},
  pose(g){return{c:[g.H[0],g.H[1],g.ang]};},drive:'Slide the arms along the two pins and rule along the edge: every line runs to the same far point.'});}

/* 409 · proportional compasses */
{const sim=window.MB.SIMS[409],Lc=sim.L,f=0.35,P=[400,70+f*Lc];
 const leg=()=>({o:[[-f*Lc,0],[-f*Lc+30,-14],[(1-f)*Lc-30,-14],[(1-f)*Lc,0],[(1-f)*Lc-30,14],[-f*Lc+30,14]],h:[Sh.slotPts((0.25-f)*Lc,0,(0.5-f)*Lc,0)]});
 PK.def(409,{S:0.3,summary:'Proportional compasses: two legs pointed at both ends, joined by a pivot that can be slid along slots in the legs. The openings at the two ends are in the ratio of the leg lengths on either side of the pivot, so a distance taken with one end is copied enlarged or reduced at the other.',params:sim.params,
  parts:[{id:'l1',name:'Leg with slot',role:'driver',layer:0,shape:leg()},{id:'l2',name:'Leg with slot',role:'link',layer:1,shape:leg()}],
  ground:[[P[0],P[1],0,1]],plate:{x0:300,y0:40,x1:500,y1:460},
  pose(g){return{l1:[P[0],P[1],PI/2-g.al/2],l2:[P[0],P[1],PI/2+g.al/2]};},hardware:['A small bolt and wing nut for the sliding pivot, if you want to move it.'],drive:'Open the compasses: the long ends open wider in proportion.'});}

/* 410 · centring tool */
PK.def(410,{S:0.3,summary:'A centring tool: two pins equally spaced either side of a scriber on a cross-bar. Laid across a bar with the pins against its two edges, the scriber marks the exact middle, whatever the width (within the pins’ reach).',params:window.MB.SIMS[410].params,
  parts:[{id:'t',name:'Centring tool (pins and scriber hole)',role:'driver',layer:1,mesh:K.merge(PK.ext({o:[[-90,-20],[90,-20],[90,0],[-90,0]],h:[Sh.hole(0,-6,4)]},0,PK.TH),K.cyl(1.8,-6,0,14,-60*0.3,-0*0.3+6*0.3),K.cyl(1.8,-6,0,14,60*0.3,6*0.3))}],
  fixed:[{shape:S=>S.rect(120,240,400,320),l1:0}],plate:{x0:280,y0:180,x1:520,y1:460},
  pose(){return{t:[400,240,0]};},drive:'Lay the tool across the bar with both pins against its edges and mark through the middle hole.'});

/* 411 · self-recording level */
{const sim=window.MB.SIMS[411],gnd=x=>380-40*Math.sin(x/90)-20*Math.sin(x/37);
 const prof=()=>{const o=[[60,500]];for(let x=60;x<=760;x+=10)o.push([x,gnd(x)]);o.push([760,500]);return{o,h:[]};};
 PK.def(411,{S:0.25,up:true,summary:'A self-recording level: a carriage rolls over the ground, and a pendulum hung in it always hangs straight down while the carriage tilts on the slopes; the pendulum’s pen, working against a moving paper, records the rise and fall of the ground as a profile.',
  parts:[{id:'c',name:'Carriage on two wheels',role:'driver',layer:0,mesh:K.merge(PK.ext({o:[[-50,-50],[50,-50],[50,-20],[-50,-20]],h:[]},0,PK.TH),PK.ext({o:K.circle(12,24,-36,-12),h:[]},0,PK.TH),PK.ext({o:K.circle(12,24,36,-12),h:[]},0,PK.TH))},{id:'pd',name:'Pendulum with pen',role:'link',layer:1,shape:S=>({o:armPts([0,0],[0,-120],9),h:[]})}],
  fixed:[{shape:S=>prof(),l1:0},{shape:S=>S.rect(680,8,400,116),l1:0}],plate:{x0:50,y0:100,x1:770,y1:510},
  pose(g){return{c:[g.x,g.gy-0,g.slope],pd:[g.x,g.gy-50,0]};},drive:'Roll the carriage along the profile: the pendulum stays upright as the carriage tilts.'});}

/* 412 · capstan with gears in its base for single or triple purchase */
{const z1=U.BT+2,z2=z1+5,zd=z2+5,Rd=25,Hd=30,C=22.5;
 PK.defS(412,{summary:'A capstan with gearing in its base. For a light pull the head is locked to the drum and they turn together (single purchase); for a heavy one the head drives the drum through a reverted train of gears in the base, 12 to 18 and 10 to 20, so the drum turns a third as fast with three times the pull (triple purchase).',cam:{yaw:0.5,pitch:0.35},params:window.MB.SIMS[412].params,
  base:()=>[U.plate(-45,-45,60,45),K.cyl(2.2,U.BT,zd-1,16,C,0),K.cyl(5,U.BT,z1-0.4,24,C,0),K.cyl(5,U.BT,z1-0.4,24,0,0)],
  parts:[{id:'h',name:'Head with bars, spindle and 12-tooth pinion',role:'driver',mesh:K.merge(K.prism(U.octa(U.SH),[],0,zd+Hd+14-z1),U.spur(9,12,4),K.xf(K.prism(K.circle(14,40),[U.octa(U.SH+0.12)],0,7),M4.T(0,0,zd+Hd+2-z1)),...[0,1,2,3,4,5].map(k=>K.xf(K.box(56,4,zd+Hd+3-z1,zd+Hd+7-z1,40,0),M4.Rz(k*PI/3))))},
   {id:'d',name:'Drum with 20-tooth gear (turns loose on the spindle)',role:'driven',mesh:K.merge(U.spur(15,20,4,{bore:'round'}),K.lathe([[U.SHB,5],[Rd+3,5],[Rd+3,7],[Rd,8],[Rd,5+Hd-3],[Rd+3,5+Hd-2],[Rd+3,5+Hd],[U.SHB,5+Hd]],64))},
   {id:'l',name:'Layshaft gears, 18 and 10 teeth (one piece)',role:'link',mesh:K.merge(U.spur(13.5,18,4,{bore:'round'}),K.xf(U.spur(7.5,10,4,{bore:'round'}),M4.T(0,0,5)))}],
  pose(phi,g){return{h:M4.mul(M4.T(0,0,z1),M4.Rz(g.h)),d:M4.mul(M4.T(0,0,z2),M4.Rz(g.d+PI/20)),l:M4.mul(M4.T(C,0,z1),M4.Rz(-g.h*12/18+PI/18))};},
  read:(phi,g)=>`drum ${(g.d/TAU).toFixed(2)} turns`,drive:'Push the bars round: the drum turns a third as fast.'});}

/* 413 · friction wheels with expanding rubber rims */
{const r=70,A=[400-r,270],B=[400+r,270];
 const wheel=()=>({o:K.circle(r-3,96),h:[Sh.hole(0,0),...[0,1,2,3].map(k=>K.circle(10,24,(r-28)*Math.cos(k*PI/2+PI/4),(r-28)*Math.sin(k*PI/4*2+PI/4)))]});
 PK.def(413,{S:0.3,summary:'A pair of friction wheels with rubber rims. Each rim is a rubber ring that a nut on the hub can spread outward, so the grip between the wheels can be set; the driven wheel turns the other way at the same speed, with no teeth to wear or rattle.',
  parts:[{id:'a',name:'Driving wheel (fit a rubber band round the rim)',role:'driver',layer:0,shape:wheel(),bosses:[[40,0,10,3.5]]},{id:'b',name:'Driven wheel (fit a rubber band round the rim)',role:'driven',layer:0,shape:wheel()}],
  ground:[[A[0],A[1],0,0],[B[0],B[1],0,0]],
  pose(g){return{a:[A[0],A[1],g.phi],b:[B[0],B[1],g.a2]};},hardware:['Two wide rubber bands as the rubber rims.'],drive:'Turn the driving wheel: the other turns by friction.'});}

L.crankSlideModel(417,'A bent (cranked) shaft works a block sliding in a slotted cross-head, so the cross-head moves straight back and forth: a Scotch yoke in which the crank pin is the bent part of the shaft.');
L.crankSlideModel(418,'A slide valve moved by a crank, its rod running on rollers between guide bars so that the friction of the valve gear is small.');

/* 419 · self-rocking cradle: crank and rod rock the cradle */
{const sim=window.MB.SIMS[419],Pv=sim.Pv,O=sim.O,r=sim.r,La=sim.La,Qr=[Pv[0]+120,Pv[1]+La],Lr=Math.hypot(O[0]-Qr[0],O[1]-Qr[1]);
 const cradle=()=>{const o=[[-160,150],[160,150]];for(let i=1;i<=20;i++){const t=i/20;o.push([160*(1-t)*(1-t)+2*(1-t)*t*140+0,150*(1-t)*(1-t)+2*(1-t)*t*260+270*t*t]);}for(let i=19;i>=1;i--){const t=i/20;o.push([-(160*(1-t)*(1-t)+2*(1-t)*t*140),150*(1-t)*(1-t)+2*(1-t)*t*260+270*t*t]);}return o;};
 PK.def(419,{S:0.3,up:true,summary:'A self-rocking cradle: a clockwork-driven wheel carries a crank pin, and a rod from the pin to an arm on the cradle rocks it gently to and fro, a crank-and-rocker linkage.',
  parts:[{id:'c',name:'Cradle with hanger and arm',role:'driven',layer:0,mesh:K.merge(PK.ext({o:armPts([0,0],[0,150],8),h:[Sh.hole(0,0)]},0,PK.TH),PK.ext({o:cradle(),h:[]},0,PK.TH),PK.ext({o:armPts([0,150],[120,La],8),h:[]},0,PK.TH)),pins:[[120,La,1]]},
   {id:'w',name:'Clockwork wheel with crank pin',role:'driver',layer:0,shape:S=>S.disk(50),pins:[[r,0,1]]},{id:'rd',name:'Rod',role:'link',layer:1,shape:S=>S.bar(Lr,10)}],
  ground:[[Pv[0],Pv[1],0,0],[O[0],O[1],0,0]],
  pose(g){return{c:[Pv[0],Pv[1],g.a],w:[O[0],O[1],g.phi],rd:[g.pin[0],g.pin[1],Math.atan2(g.Q[1]-g.pin[1],g.Q[0]-g.pin[0])]};},drive:'Turn the wheel: the cradle rocks.'});}

/* 420 · bell hammer lifted clear by a spring after striking */
{const F=[560,200];
 PK.def(420,{S:0.3,up:true,summary:'A bell hammer that does not damp the bell: when the hammer is let fall it strikes the bell and a spring at once lifts it just clear, so the bell rings on freely.',
  parts:[{id:'h',name:'Hammer',role:'driver',layer:0,mesh:K.merge(PK.ext({o:armPts([0,0],[160,0],7),h:[Sh.hole(0,0)]},0,PK.TH),PK.ext({o:K.circle(20,32,170,0),h:[]},0,PK.TH))}],
  ground:[[F[0],F[1],0,0]],fixed:[{shape:S=>({o:[[210,380],[240,170],[270,135],[300,128],[330,135],[360,170],[390,380]],h:[]}),l1:0}],
  pose(g){return{h:[F[0],F[1],PI-g.a]};},hardware:['A small spring or rubber band from the hammer to a peg, to lift it clear of the bell.'],drive:'Lift the hammer and let it fall: it strikes and springs back clear.'});}

/* 421 · trunk engine */
{const sim=window.MB.SIMS[421],O=sim.O,r=sim.r,Lc=sim.L,Lt=sim.Lt,y=O[1],cx0=140,cw=300;
 PK.def(421,{S:0.3,summary:'A trunk engine: a tube (the trunk) is fixed to the piston and passes out through the cylinder cover. The connecting rod is jointed to the piston deep inside the trunk, so a long rod fits into a short engine, as in many marine engines.',
  parts:[{id:'fw',name:'Flywheel with crank pin',role:'driven',layer:0,shape:S=>({o:K.circle(100,96),h:[S.hole(0,0),...[0,1,2,3,4].map(k=>K.circle(24,32,64*Math.cos(k*TAU/5+0.6),64*Math.sin(k*TAU/5+0.6)))]}),pins:[[r,0,2]]},
   {id:'p',name:'Piston and trunk',role:'driver',layer:1,mesh:K.merge(PK.ext({o:[[-15,-56],[15,-56],[15,56],[-15,56]],h:[]},0,PK.TH),PK.ext({o:[[15,-22],[15+Lt,-22],[15+Lt,22],[15,22]],h:[]},0,PK.TH)),pins:[[0,0,2]]},
   {id:'cr',name:'Connecting rod',role:'link',layer:2,shape:S=>S.bar(Lc,12)}],
  ground:[[O[0],O[1],0,0]],
  fixed:[{shape:S=>S.rect(cw,12,cx0+cw/2,y-64),l1:1},{shape:S=>S.rect(cw,12,cx0+cw/2,y+64),l1:1},{shape:S=>S.rect(12,140,cx0+6,y),l1:1},{shape:S=>S.rect(12,34,cx0+cw-6,y-41),l1:1},{shape:S=>S.rect(12,34,cx0+cw-6,y+41),l1:1}],
  pose(g){return{fw:[O[0],O[1],g.phi+PI],p:[g.x,y,0],cr:[g.x,y,Math.atan2(g.pin[1]-y,g.pin[0]-g.x)]};},drive:'Turn the flywheel: the piston and trunk slide in and out.'});}

/* 422 · sector engine */
{const sim=window.MB.SIMS[422],A=[250,330],O=[560,330],d=sim.dOff(),g0=PK.runner(422).at(0);
 const vaneArm=()=>K.merge(PK.ext({o:armPts([0,0],[163*Math.cos(d),163*Math.sin(d)],6),h:[Sh.hole(0,0)]},0,PK.TH),PK.ext({o:armPts([0,0],[200,0],8),h:[Sh.hole(0,0)]},0,PK.TH),PK.ext({o:K.circle(16,24),h:[Sh.hole(0,0)]},0,PK.TH));
 const sect=()=>{const o=[];const a0=-PI/2-0.9,a1=-PI/2+0.9;for(let i=0;i<=40;i++){const t=a0+(a1-a0)*i/40;o.push([A[0]+180*Math.cos(t),A[1]+180*Math.sin(t)]);}for(let i=40;i>=0;i--){const t=a0+(a1-a0)*i/40;o.push([A[0]+167*Math.cos(t),A[1]+167*Math.sin(t)]);}return o;};
 PK.def(422,{S:0.3,summary:'An engine with a sector-shaped cylinder: the piston is a vane that swings about the centre of the sector, steam pushing on one face of it. The vane’s shaft carries an arm which works the crank through a connecting rod.',
  parts:[{id:'v',name:'Vane piston with its arm (one piece)',role:'driver',layer:0,mesh:vaneArm(),pins:[[200,0,1]]},{id:'cr',name:'Connecting rod',role:'link',layer:1,shape:S=>S.bar(240,10)},{id:'fw',name:'Flywheel with crank pin',role:'driven',layer:0,shape:S=>({o:K.circle(90,96),h:[S.hole(0,0)]}),pins:[[60,0,1]]}],
  ground:[[A[0],A[1],0,0],[O[0],O[1],0,0]],
  fixed:[{shape:S=>({o:sect(),h:[]}),l1:0},...[-1,1].map(s=>({shape:S=>({o:rotP([[24,-6],[180,-6],[180,6],[24,6]],-PI/2+s*0.9,A),h:[]}),l1:0}))],
  pose(g){return{v:[A[0],A[1],g.th],cr:[g.T[0],g.T[1],Math.atan2(g.pin[1]-g.T[1],g.pin[0]-g.T[0])],fw:[O[0],O[1],g.phi]};},drive:'Turn the flywheel: the vane swings to and fro in its sector.'});}

/* 423 · Root's double-quadrant engine */
{const sim=window.MB.SIMS[423],A=sim.A,O=sim.O,r=sim.r,La=sim.La,E0=[A[0],A[1]-La],Lr=Math.hypot(O[0]-E0[0],O[1]-E0[1]);
 const quad=s=>{const o=[],a0=s-0.7,a1=s+0.7;for(let i=0;i<=30;i++){const t=a0+(a1-a0)*i/30;o.push([A[0]+170*Math.cos(t),A[1]+170*Math.sin(t)]);}for(let i=30;i>=0;i--){const t=a0+(a1-a0)*i/30;o.push([A[0]+159*Math.cos(t),A[1]+159*Math.sin(t)]);}return o;};
 PK.def(423,{S:0.3,summary:'Root’s double-quadrant engine: two vane pistons on one rocking shaft swing in two quadrant-shaped cylinders on opposite sides of the shaft. An arm on the shaft drives the crank through a connecting rod.',
  parts:[{id:'v',name:'Rocking shaft with two vanes and arm',role:'driver',layer:0,mesh:K.merge(PK.ext({o:armPts([-156,0],[156,0],6),h:[Sh.hole(0,0)]},0,PK.TH),PK.ext({o:armPts([0,0],[0,-La],8),h:[]},0,PK.TH)),pins:[[0,-La,1]]},{id:'cr',name:'Connecting rod',role:'link',layer:1,shape:S=>S.bar(Lr,10)},{id:'fw',name:'Flywheel with crank pin',role:'driven',layer:0,shape:S=>S.disk(80),pins:[[r,0,1]]}],
  ground:[[A[0],A[1],0,0],[O[0],O[1],0,0]],
  fixed:[0,PI].flatMap(s=>[{shape:S=>({o:quad(s),h:[]}),l1:0},...[-1,1].map(q=>({shape:S=>({o:rotP([[24,-5],[170,-5],[170,5],[24,5]],s+q*0.7,A),h:[]}),l1:0}))]),
  pose(g){return{v:[A[0],A[1],g.th],cr:[g.E[0],g.E[1],Math.atan2(g.pin[1]-g.E[1],g.pin[0]-g.E[0])],fw:[O[0],O[1],g.phi]};},drive:'Turn the flywheel: the two vanes rock in their quadrants.'});}

/* 424 · Root's double-reciprocating engine: two pistons at right angles in a square cylinder, both slotted for one crank pin */
{const O=[400,270];
 PK.def(424,{S:0.3,summary:'Root’s double-reciprocating engine: two pistons work at right angles in one square cylinder, one inside the other. Each is slotted across for the single crank pin, so together they act as two Scotch yokes at right angles and turn the crank smoothly with no dead centre.',
  parts:[{id:'c',name:'Crank disk with pin',role:'driven',layer:0,shape:S=>S.disk(100),pins:[[70,0,2]]},{id:'h',name:'Piston moving up and down (slot across)',role:'driver',layer:1,shape:S=>({o:[[-160,-16],[160,-16],[160,16],[-160,16]],h:[S.slotPts(-82,0,82,0)]})},{id:'v',name:'Piston moving side to side (slot up and down)',role:'driver',layer:2,shape:S=>({o:[[-16,-160],[16,-160],[16,160],[-16,160]],h:[S.slotPts(0,-82,0,82)]})}],
  ground:[[O[0],O[1],0,0]],fixed:[{shape:S=>({o:[[O[0]-180,O[1]-180],[O[0]+180,O[1]-180],[O[0]+180,O[1]+180],[O[0]-180,O[1]+180]],h:[[[O[0]-166,O[1]-166],[O[0]+166,O[1]-166],[O[0]+166,O[1]+166],[O[0]-166,O[1]+166]]]}),l1:2}],
  pose(g){return{c:[O[0],O[1],g.phi],h:[O[0],O[1]+g.y,0],v:[O[0]+g.x,O[1],0]};},drive:'Turn the crank: the two pistons slide at right angles.'});}

/* 425 · rotary engine: eccentric piston and sliding abutment */
{const O=[400,265],R=150,e=40,r=R-e;
 PK.def(425,{S:0.3,summary:'A rotary engine with an eccentric piston: a round piston fixed off-centre on the shaft rolls round inside the cylinder, touching its wall at one line, while an abutment sliding in the top of the cylinder rests on it and divides steam from exhaust. Steam pressing between the abutment and the contact line drives the piston round.',
  parts:[{id:'p',name:'Eccentric piston on the shaft',role:'driver',layer:0,shape:S=>({o:K.circle(r-1,96,e,0),h:[S.hole(0,0)]})},{id:'a',name:'Sliding abutment',role:'link',layer:0,shape:S=>S.rect(20,80,0,-40)}],
  ground:[[O[0],O[1],0,0]],fixed:[{shape:S=>({o:(()=>{const o=[],wo=Math.asin(11/(R+18)),wi=Math.asin(11/R);for(let i=0;i<=90;i++){const t=-PI/2+wo+(TAU-2*wo)*i/90;o.push([O[0]+(R+18)*Math.cos(t),O[1]+(R+18)*Math.sin(t)]);}for(let i=90;i>=0;i--){const t=-PI/2+wi+(TAU-2*wi)*i/90;o.push([O[0]+(R+0.6)*Math.cos(t),O[1]+(R+0.6)*Math.sin(t)]);}return o;})(),h:[]}),l1:0},{shape:S=>S.rect(8,70,O[0]-15,O[1]-R-50),l1:0},{shape:S=>S.rect(8,70,O[0]+15,O[1]-R-50),l1:0}],
  pose(g){const Pc=[O[0]+e*Math.cos(g.phi),O[1]+e*Math.sin(g.phi)],top=Pc[1]-Math.sqrt(r*r-(O[0]-Pc[0])**2);return{p:[O[0],O[1],g.phi],a:[O[0],top,0]};},drive:'Turn the shaft: the piston rolls round and the abutment rides up and down on it.'});}

/* 426–428 · rotary engines with sliding pistons (vanes) */
for(const n of [426,427,428,455,456]){const sim=window.MB.SIMS[n];if(!sim||!sim.ro)continue;const o=sim.ro,O=[400,265],R=150,e=o.e,rr=o.rr,Rc=[O[0]+e,O[1]],Lv=R+e-rr+25,vw=14;
 const rotor=()=>{const pts=[],M=240;for(let i=0;i<M;i++){const t=i/M*TAU;let r_=rr;for(let k=0;k<o.N;k++){const d=Math.atan2(Math.sin(t-k*TAU/o.N),Math.cos(t-k*TAU/o.N));if(Math.abs(d*rr)<vw/2+1.2)r_=Math.max(14,R-e-(o.abut?32:o.abut1?46:0)-Lv-4);}pts.push([r_*Math.cos(t),r_*Math.sin(t)]);}return{o:pts,h:[Sh.hole(0,0)]};};
 PK.def(n,{S:0.3,summary:n===455?'An old rotary pump: four vanes slide in slots of a drum set off-centre in the round case. Each vane is pushed out against the case; the spaces between them grow on the inlet side, drawing water in, and shrink on the outlet side, driving it out.':n===456?'A rotary pump whose sliding pistons are guided by a fixed heart-shaped cam inside the drum, so they are drawn in just as they pass the abutment and pushed out against the case again beyond it.':n===426?'A rotary engine with two sliding pistons passing fixed abutments: the pistons slide in slots of a central drum, pushed out against the case by springs (or a cam) and drawn in as they pass the abutments that divide steam from exhaust.':n===427?'A rotary engine whose drum is set off-centre in the case: two pistons sliding in slots in the drum are pushed out against the case, sliding out and in as the drum turns, and steam pressing on the exposed piston drives it round.':'A rotary engine with a flexible lining: the case is lined with rubber pressed inward by rollers, so the sliding pistons are always sealed against it as they slide out and in round the off-centre drum.',
  parts:[{id:'d',name:'Drum with piston slots',role:'driver',layer:0,shape:rotor()},{id:'v',name:'Sliding piston (vane)',role:'link',qty:o.N,layer:0,shape:S=>S.rect(Lv,vw-0.8,-Lv/2,0)}],
  ground:[[Rc[0],Rc[1],0,0]],
  fixed:[{shape:S=>({o:K.circle(R+18,120,O[0],O[1]),h:[K.circle(R+0.6,120,O[0],O[1])]}),l1:0},...(o.abut?[-1,1].map(s=>({shape:S=>({o:[[O[0]-12,O[1]+s*(R+1)],[O[0]+12,O[1]+s*(R+1)],[O[0]+12,O[1]+s*(R-31)],[O[0]-12,O[1]+s*(R-31)]],h:[]}),l1:0})):[]),...(o.abut1?[{shape:S=>({o:(()=>{const q=[[O[0]-40,O[1]-R-1],[O[0]+40,O[1]-R-1]];for(let i=1;i<20;i++){const t=i/20;q.push([O[0]+40-80*t,O[1]-R+2*(1-t)*t*90*0.97+1]);}return q;})(),h:[]}),l1:0}]:[])],
  pose(g){const v=[];for(let k=0;k<o.N;k++){const a=g.phi+k*TAU/o.N,L=sim.vaneL(a);v.push([Rc[0]+L*Math.cos(a),Rc[1]+L*Math.sin(a),a]);}return{d:[Rc[0],Rc[1],g.phi],v};},
  hardware:o.rollers?['A wide rubber band inside the case as the lining.']:[],drive:'Turn the drum: the pistons slide out and in, following the case.'});}

/* 430–432 · vertical water wheels */
{const wheel=(R,n,kind)=>{const T=PK.TH,m=[PK.ext({o:K.circle(R,120),h:[K.circle(R-28,120)]},0,T),PK.ext({o:K.circle(26,32),h:[Sh.hole(0,0)]},0,T)];
   for(let k=0;k<8;k++){const a=k*PI/4;m.push(PK.ext({o:armPts([20*Math.cos(a),20*Math.sin(a)],[(R-20)*Math.cos(a),(R-20)*Math.sin(a)],6),h:[]},0,T));}
   for(let k=0;k<n;k++){const a=k*TAU/n,q=pts=>rotP(pts,a);
     if(kind==='paddle')m.push(PK.ext({o:q([[R-10,-5],[R+40,-5],[R+40,5],[R-10,5]]),h:[]},0,T));
     else m.push(PK.ext({o:q([[R-4,-4],[R+22,-4],[R+22,-4-22*Math.sign(kind==='rev'?-1:1)],[R+16,-4-22*Math.sign(kind==='rev'?-1:1)],[R+16,4],[R-4,4]].map(([x,y])=>[x,kind==='rev'?-y:y])),h:[]},0,T));}
   return K.merge(...m);};
 PK.def(430,{S:0.25,up:true,summary:'An overshot water wheel: water led along a trough above the wheel falls into the buckets on one side, and their weight turns the wheel. It uses the full fall of the water and is the most efficient of the old wheels.',
  parts:[{id:'w',name:'Wheel with 16 buckets',role:'driven',layer:0,mesh:wheel(170,16,'bucket')}],ground:[[430,300,0,0]],fixed:[{shape:S=>S.rect(330,18,225,104),l1:0}],plate:{x0:40,y0:70,x1:640,y1:500},
  pose(g){return{w:[430,300,g.phi]};},drive:'Pour water (or drop beads) into the buckets at the top: the wheel turns.'});
 PK.def(431,{S:0.25,up:true,summary:'An undershot water wheel: the stream runs under the wheel and pushes on the flat floats (paddles) at the bottom. It needs little fall but uses only the speed of the water, so it is the least efficient of the wheels.',
  parts:[{id:'w',name:'Wheel with 16 floats',role:'driven',layer:0,mesh:wheel(150,16,'paddle')}],ground:[[400,240,0,0]],fixed:[{shape:S=>S.rect(700,14,400,430),l1:0}],plate:{x0:40,y0:30,x1:760,y1:450},
  pose(g){return{w:[400,240,g.a]};},drive:'Blow or pour water along the bottom: the floats push the wheel round.'});
 PK.def(432,{S:0.25,up:true,summary:'A breast wheel: the water enters at about the height of the axle and is held in the buckets by a close-fitting curved breast wall, so it acts by both weight and impulse; between the overshot and the undershot wheel in efficiency.',
  parts:[{id:'w',name:'Wheel with 20 buckets',role:'driven',layer:0,mesh:wheel(170,20,'rev')}],ground:[[440,250,0,0]],
  fixed:[{shape:S=>({o:(()=>{const o=[];for(let i=0;i<=30;i++){const t=PI*0.55+PI*0.43*i/30;o.push([440+(170+26)*Math.cos(t),250+(170+26)*Math.sin(t)]);}for(let i=30;i>=0;i--){const t=PI*0.55+PI*0.43*i/30;o.push([440+(170+40)*Math.cos(t),250+(170+40)*Math.sin(t)]);}return o;})(),h:[]}),l1:0},{shape:S=>S.rect(200,12,150,272),l1:0}],plate:{x0:30,y0:40,x1:660,y1:470},
  pose(g){return{w:[440,250,-g.phi]};},drive:'Pour water in at the level of the axle: the buckets carry it down against the breast.'});}

/* 433 · horizontal overshot wheel (seen from above) */
{const O=[400,280],R=170,n=18;
 PK.def(433,{S:0.25,summary:'A horizontal overshot wheel, seen from above: the wheel turns on an upright shaft, and water falling from a chute fills the inclined buckets on one side, its weight driving them round and down.',
  parts:[{id:'w',name:'Wheel with 18 inclined buckets',role:'driven',layer:0,mesh:K.merge(PK.ext({o:K.circle(R+14,120),h:[K.circle(R-34,120)]},0,PK.TH),PK.ext({o:K.circle(R-34,96),h:[Sh.hole(0,0)]},0,PK.TH),...Array.from({length:n},(_,k)=>PK.ext({o:rotP([[R-34,-3],[R+14,-17],[R+14,-11],[R-34,3]],k*TAU/n),h:[]},PK.TH,2*PK.TH)))}],
  ground:[[O[0],O[1],0,0]],fixed:[{shape:S=>S.rect(60,80,O[0],80),l1:1}],
  pose(g){return{w:[O[0],O[1],g.phi]};},drive:'Turn the wheel: the buckets pass under the chute one after another.'});}

/* 434, 435, 437 · reaction turbines (plan view): fixed guides and a runner with curved blades */
for(const n of [434,435,437]){const out=n===434,vol=n===437,O=[400,265],Rin=out?70:vol?50:130,Rout=out?130:vol?140:200,Gin=out?20:200,Gout=out?70:250,s=out?1:-1;
 const blade=(r0,r1,bend,w)=>{const c=[];for(let i=0;i<=8;i++){const t=i/8,r=r0+(r1-r0)*t,a=s*bend*t*t/r1;c.push([r*Math.cos(a),r*Math.sin(a)]);}const o=c.map(([x,y],i)=>{const j=Math.min(i+1,8),k=Math.max(i-1,0),dx=c[j][0]-c[k][0],dy=c[j][1]-c[k][1],L=Math.hypot(dx,dy);return[x-dy/L*w,y+dx/L*w];});const p=c.map(([x,y],i)=>{const j=Math.min(i+1,8),k=Math.max(i-1,0),dx=c[j][0]-c[k][0],dy=c[j][1]-c[k][1],L=Math.hypot(dx,dy);return[x+dy/L*w,y-dx/L*w];});return[...o,...p.reverse()];};
 const runner=()=>K.merge(PK.ext({o:K.circle(Rin+2,72),h:[Sh.hole(0,0)]},0,PK.TH),PK.ext({o:K.circle(Rout,96),h:[K.circle(Rout-6,96)]},0,PK.TH),...Array.from({length:20},(_,k)=>PK.ext({o:rotP(blade(Rin,Rout-3,44,2.2),k*TAU/20),h:[]},0,PK.TH)));
 const fx=vol?[{shape:S=>({o:(()=>{const o=[];for(let i=0;i<=80;i++){const t=i/80*TAU*0.95,r=165+70*t/TAU;o.push([O[0]+r*Math.cos(t-PI/2),O[1]+r*Math.sin(t-PI/2)]);}for(let i=80;i>=0;i--){const t=i/80*TAU*0.95,r=150+60*t/TAU;o.push([O[0]+r*Math.cos(t-PI/2),O[1]+r*Math.sin(t-PI/2)]);}return o;})(),h:[]}),l1:0}]
  :Array.from({length:16},(_,k)=>({shape:S=>({o:rotP(blade(Gin+2,Gout-2,-30,2),k*TAU/16,O),h:[]}),l1:0})).concat([{shape:S=>({o:K.circle(Gout+6,96,O[0],O[1]),h:[K.circle(Gout,96,O[0],O[1])]}),l1:0}]);
 PK.def(n,{S:out?0.4:0.3,summary:out?'Fourneyron’s outward-flow turbine, seen from above: water enters at the middle, is turned by the fixed curved guides, and flows outward through the curved blades of the runner ring around them, driving it round by its reaction.':vol?'A volute (scroll-case) wheel: the spiral case narrows as it goes round, so water enters the runner evenly all the way round its rim and drives the curved blades.':'An inward-flow turbine, seen from above: the fixed guides are outside, the runner inside; water flows inward through the runner blades and leaves at the centre.',
  parts:[{id:'r',name:'Runner with curved blades',role:'driven',layer:0,mesh:runner()}],ground:[[O[0],O[1],0,0]],fixed:fx,
  pose(g){return{r:[O[0],O[1],g.phi]};},drive:'Blow through the guides (or turn the runner): the curved blades are pushed round.'});}

/* 436 · Jonval turbine: guide blades above, runner blades below, water flowing downward */
{const zr=U.BT+12,R=30,ri=12;
 const blades=(n,tilt,z0)=>Array.from({length:n},(_,k)=>K.xf(K.box(R-ri,1.6,-5,5,0,0),M4.mul(M4.Rz(k*TAU/n),M4.mul(M4.T((R+ri)/2,0,z0),M4.Rx(tilt)))));
 PK.defS(436,{summary:'The Jonval turbine: water flows down through a ring of fixed guide blades which turn it sideways, then through the runner’s blades, curved the other way, which it drives round as it passes; the runner turns on an upright shaft.',cam:{yaw:0.5,pitch:0.45},
  base:()=>[U.plate(-40,-40,40,40),K.tubeSolid(R+4,R+1,U.BT,zr-6,64),K.tubeSolid(R+4,R+1,zr+9,zr+19,64),...[0,1,2].map(k=>K.box(4,4,U.BT,zr+19,(R+3)*Math.cos(k*TAU/3+0.3),(R+3)*Math.sin(k*TAU/3+0.3))),K.merge(...blades(14,-0.6,zr+14)),K.prism(K.circle(ri,32),[K.circle(U.SHB,16)],zr+9,zr+19)],
  parts:[{id:'r',name:'Runner with inclined blades on its shaft',role:'driven',mesh:K.merge(K.prism(K.circle(ri,32),[],-5,5),...blades(16,0.6,0),K.prism(K.circle(R,64),[K.circle(R-2,64)],-5,5),K.cyl(2.1,-zr+U.BT+1,30,16))}],
  pose(phi){return{r:M4.mul(M4.T(0,0,zr),M4.Rz(phi))};},read:(phi)=>`runner ${(phi/TAU).toFixed(2)} turns`,drive:'Pour water (or blow) down through the guides: the runner turns.'});}

/* 438 · Barker's mill */
{const H=U.BT+60,La=40;
 PK.defS(438,{summary:'Barker’s mill: water poured into the top of an upright tube runs out through two horizontal arms whose ends are open at the side, in opposite directions. The jets push back on the arms, as in a lawn sprinkler, and the whole tube spins the opposite way.',cam:{yaw:0.6,pitch:0.3},
  base:()=>[U.plate(-50,-30,50,30),K.cyl(2.2,U.BT,U.BT+12,16),K.box(6,6,U.BT,H+12,-22,0),K.box(30,6,H+8,H+12,-10,0)],
  parts:[{id:'r',name:'Upright tube with jet arms',role:'driver',mesh:K.merge(K.tubeSolid(5,2.6,6,H+6,32),K.xf(K.tubeSolid(3,1.6,-La,La,24),M4.mul(M4.T(0,0,10),M4.Ry(PI/2))),K.xf(K.cyl(2.2,0,6,16),M4.mul(M4.T(La-3,0,10),M4.Rx(-PI/2))),K.xf(K.cyl(2.2,0,6,16),M4.mul(M4.T(-La+3,0,10),M4.Rx(PI/2))),K.lathe([[2.6,H+6],[12,H+12],[12,H+14],[2.6,H+8]],32))}],
  pose(phi,g){return{r:M4.mul(M4.T(0,0,U.BT+1),M4.Rz(-g.phi))};},read:(phi,g)=>`arm ${(g.phi/TAU).toFixed(2)} turns`,drive:'Pour water into the funnel: the jets spin the arms.'});}

/* 439 · tipping bucket */
{const P=[400,240];
 PK.def(439,{S:0.3,up:true,summary:'A tipping bucket: a bucket hung on a pivot just below its middle with a weight beneath. Empty, the weight keeps it upright; as it fills its centre of weight rises above the pivot until it tips and empties, and the weight swings it back. A steady trickle so gives a to-and-fro motion.',
  parts:[{id:'b',name:'Bucket with counterweight',role:'driven',layer:0,mesh:K.merge(PK.ext({o:[[-90,-80],[-80,-80],[-62,50],[62,50],[80,-80],[90,-80],[70,60],[-70,60]],h:[]},0,PK.TH),PK.ext({o:armPts([0,0],[0,140],14),h:[Sh.hole(0,0)]},0,PK.TH),PK.ext({o:[[-25,140],[25,140],[25,180],[-25,180]],h:[]},0,PK.TH))}],
  ground:[[P[0],P[1],0,0]],pose(g){return{b:[P[0],P[1],g.a]};},drive:'Pour water in slowly: the bucket fills, tips, empties and rights itself.'});}

/* 440 · tipping trough meter */
{const P=[400,330];
 PK.def(440,{S:0.3,up:true,summary:'A tipping trough, as in a water meter or rain gauge: a trough with two compartments rocks on a pivot under the falling stream. When the upper compartment is full it tips down and empties, bringing the other under the stream; each tip is counted.',
  parts:[{id:'t',name:'Two-compartment trough',role:'driven',layer:0,mesh:K.merge(PK.ext({o:[[-205,-70],[-195,-70],[-195,-5],[195,-5],[195,-70],[205,-70],[205,5],[-205,5]],h:[Sh.hole(0,0)]},0,PK.TH),PK.ext({o:[[-5,-80],[5,-80],[5,0],[-5,0]],h:[]},0,PK.TH))}],
  ground:[[P[0],P[1],0,0]],fixed:[{shape:S=>({o:[[P[0]-30,P[1]+50],[P[0]+30,P[1]+50],[P[0],P[1]+14]],h:[]}),l1:0}],
  pose(g){return{t:[P[0],P[1],g.th]};},drive:'Pour water onto the middle: the trough fills one side, tips, then the other.'});}

})();
