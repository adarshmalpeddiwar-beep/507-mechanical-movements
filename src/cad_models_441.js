/* ===== printable models 441–475 (water and air) ===== */
const U=PK.U,{Sh}=PK,L=PK.Lib;PK._S(0.3);const pxPoly=L.pxPoly;
const armPts=(A,B,r)=>K.hull([...K.circle(r,20,A[0],A[1]),...K.circle(r,20,B[0],B[1])]);
const rotP=(pts,a,c=[0,0])=>pts.map(([x,y])=>[c[0]+x*Math.cos(a)-y*Math.sin(a),c[1]+x*Math.sin(a)+y*Math.cos(a)]);
const R_=(x0,y0,x1,y1)=>({shape:{o:[[x0,y0],[x1,y0],[x1,y1],[x0,y1]],h:[]},l1:0});/* a fixed wall from canvas corners */
const rc=(x0,y0,x1,y1)=>[[x0,y0],[x1,y0],[x1,y1],[x0,y1]];
const flap=(w)=>({o:[[0,-3],[w,-3],[w,3],[0,3]],h:[]});/* a hinged valve flap, hinge at its local origin */

/* 441 · current wheel with scoops lifting water into its hollow axle */
{const O=[400,250],R=170;
 PK.def(441,{S:0.25,up:true,summary:'A current wheel that raises water into its own hollow shaft: scoops on the rim dip into the stream, and as the wheel turns each scoop’s water runs down a spoke tube into the hollow axle, which carries it away to the side.',
  parts:[{id:'w',name:'Wheel with scoops and hollow spokes',role:'driven',layer:0,mesh:K.merge(PK.ext({o:K.circle(R,120),h:[K.circle(R-16,120)]},0,PK.TH),PK.ext({o:K.circle(26,32),h:[Sh.hole(0,0)]},0,PK.TH),...Array.from({length:8},(_,k)=>{const a=k*PI/4,P=[R*Math.cos(a),R*Math.sin(a)];const sc=[];for(let i=0;i<=12;i++){const t=PI*0.5+PI*i/12;sc.push([P[0]+22*Math.cos(t+a),P[1]+22*Math.sin(t+a)]);}for(let i=12;i>=0;i--){const t=PI*0.5+PI*i/12;sc.push([P[0]+16*Math.cos(t+a),P[1]+16*Math.sin(t+a)]);}return K.merge(PK.ext({o:armPts([20*Math.cos(a),20*Math.sin(a)],[(R-12)*Math.cos(a),(R-12)*Math.sin(a)],6),h:[]},0,PK.TH),PK.ext({o:sc,h:[]},0,PK.TH));}))}],
  ground:[[O[0],O[1],0,0]],fixed:[R_(O[0]+30,O[1]-10,O[0]+330,O[1]+10)].map(f=>Object.assign(f,{l1:1})),plate:{x0:200,y0:50,x1:760,y1:460},
  pose(g){return{w:[O[0],O[1],-g.phi]};},drive:'Turn the wheel (or set it in a stream): the scoops pass round to the axle.'});}

/* 442 · noria: pots on the rim fill below and empty into the trough at the top */
{const O=[400,260],R=180;
 PK.def(442,{S:0.25,up:true,summary:'A noria: a current wheel with pots hung on its rim. The stream turns the wheel; each pot dips and fills at the bottom, and at the top it tips its water into a trough.',
  parts:[{id:'w',name:'Wheel with pots',role:'driven',layer:0,mesh:K.merge(PK.ext({o:K.circle(R,120),h:[K.circle(R-16,120)]},0,PK.TH),PK.ext({o:K.circle(26,32),h:[Sh.hole(0,0)]},0,PK.TH),...Array.from({length:8},(_,k)=>{const a=k*PI/4;return K.merge(PK.ext({o:armPts([20*Math.cos(a),20*Math.sin(a)],[(R-10)*Math.cos(a),(R-10)*Math.sin(a)],6),h:[]},0,PK.TH),PK.ext({o:rotP(rc(R-6,-14,R+22,14),a),h:[]},0,PK.TH));}))}],
  ground:[[O[0],O[1],0,0]],fixed:[Object.assign(R_(120,62,320,84),{l1:1})],plate:{x0:100,y0:40,x1:620,y1:480},
  pose(g){return{w:[O[0],O[1],g.a]};},drive:'Turn the wheel: the pots fill below and empty at the top.'});}

/* 443 · Archimedes' screw */
{const A=[150,440],B=[650,150],S=0.25,Lx=Math.hypot(B[0]-A[0],B[1]-A[1])*S,ang=Math.atan2(A[1]-B[1],B[0]-A[0]),r=46*S,zc=U.BT+16;
 PK.defS(443,{summary:'Archimedes’ screw: a helical blade wound round an inclined shaft inside a tube. As it turns, each pocket of water between the turns of the blade is carried up the slope, and pours out at the top.',cam:{yaw:-0.6,pitch:0.35},
  base:()=>[U.plate(-Lx*0.55,-25,Lx*0.55,25),K.box(10,10,U.BT,zc,-Lx/2*Math.cos(ang),0),K.box(10,10,U.BT,zc+Lx*Math.sin(ang),Lx/2*Math.cos(ang),0)],
  parts:[{id:'s',name:'Screw: helical blade on its shaft',role:'driver',mesh:K.merge(U.worm(r*0.45,r*1.6,Lx-10,{depth:r*0.55}),K.prism(U.octa(U.SH),[],-6,Lx-4))}],
  pose(phi){return{s:M4.mul(M4.T(-Lx/2*Math.cos(ang),0,zc),M4.mul(M4.Ry(PI/2-ang),M4.mul(M4.Rz(phi),M4.T(0,0,5))))};},read:(phi)=>`screw ${(phi/TAU).toFixed(2)} turns`,drive:'Turn the screw: water climbs pocket by pocket.'});}

/* 444–446 · rams: drive pipe, waste (or cone) valve, air vessel */
for(const n of [444,445,446]){const sim=window.MB.SIMS[n];if(!sim)continue;const cone=n!==444,close=n===446;
 const walls=close?[R_(240,100,560,120),R_(240,100,260,320),R_(540,100,560,320),R_(240,320,350,340),R_(450,320,560,340)]
  :[R_(20,90,30,240),R_(160,90,170,240),R_(20,240,170,250),{shape:{o:[[150,240],[370,380],[370,400],[150,260]],h:[]},l1:0},R_(cone?370:480,cone?360:400,cone?470:640,cone?370:410),R_(cone?370:480,cone?440:440,cone?470:640,cone?450:450),R_(cone?480:580,cone?150:220,cone?490:590,cone?400:400),R_(cone?530:640,cone?150:220,cone?540:650,cone?400:400),R_(cone?540:640,cone?160:230,cone?760:760,cone?174:244)];
 PK.def(n,{S:0.3,up:true,summary:cone?(close?'The cone valve of the water lifter close up: the rushing water lifts the cone into its seat and stops dead; the shock does the lifting, and the cone falls back by its own weight to start the next stroke.':'A water lifter worked by a cone valve: water running down the drive pipe lifts a cone into its seat, the flow stops dead, and the shock drives a little water through a check valve into the air vessel and up the rising main; then the cone falls and the flow starts again.'):'The hydraulic ram: water running down the drive pipe escapes through the waste valve until it is moving fast enough to slam the valve shut. The sudden stop drives part of the water through the check valve into the air vessel, whose cushion of air sends it steadily up the delivery pipe. Then the waste valve drops open and it all begins again.',
  parts:[{id:'v',name:cone?'Cone valve':'Waste valve',role:'driver',layer:0,shape:cone?(close?{o:[[-46,0],[46,0],[0,-90]],h:[]}:{o:[[-14,14],[14,14],[0,-16]],h:[]}):{o:rc(-15,-5,15,5),h:[]}},{id:'c',name:'Check valve flap',role:'link',layer:0,shape:flap(20)}],
  fixed:walls,plate:close?{x0:220,y0:80,x1:580,y1:440}:{x0:10,y0:80,x1:770,y1:470},
  pose(g){const st=g.st;if(close){const cy=260+150-90*(g.c||0);return{v:[400,cy,0],c:[500,140,0]};}if(cone){const cy=464-28*(g.c||0);return{v:[420,cy,0],c:[470,390,st==='deliver'?-0.6:0]};}return{v:[535,st==='flow'?375:395,0],c:[590,400,st==='deliver'?-0.6:0]};},
  drive:'A display section: rock the valve to see how the stroke works.'});}

/* 447 · flying ferry: the anchored boat swings across the current */
{const A=[400,40];
 PK.def(447,{S:0.3,summary:'A flying ferry: a boat tethered by a long cable to an anchor upstream. Set at an angle to the current, the stream pushes it sideways like a kite, and it swings across the river on the end of its cable; turn the rudder the other way and it swings back.',
  parts:[{id:'b',name:'Ferry boat',role:'driver',layer:0,shape:S=>({o:(()=>{const o=[];for(let i=0;i<24;i++){const t=i/24*TAU;o.push([22*Math.cos(t),48*Math.sin(t)]);}return o;})(),h:[]})}],
  ground:[[A[0],A[1],0,0]],fixed:[R_(0,80,800,120),R_(0,420,800,460)],plate:{x0:0,y0:20,x1:800,y1:470},
  pose(g){const L=300,P=[A[0]+L*Math.sin(g.a),A[1]+L*Math.cos(g.a)];return{b:[P[0],P[1],-g.a+0.4*Math.sign(Math.cos(g.phi*0.4))]};},
  ropes(g){const L=300,P=[A[0]+L*Math.sin(g.a),A[1]+L*Math.cos(g.a)],z=PK.zl(0)+2;return[{pts:[[A[0],A[1],z],[P[0],P[1],z]],r:0.5}];},drive:'Swing the boat across: the cable keeps it on an arc.'});}

/* 448, 449 · lift pump: bucket with a valve, foot valve, delivery spout */
for(const n of [448,449]){const X=380;
 PK.def(n,{S:0.3,up:true,summary:n===448?'The common lift (suction) pump: on the upstroke the bucket (piston) lifts the water above it out of the spout while the air pressure on the well pushes water up through the foot valve beneath it; on the downstroke the foot valve shuts and the bucket’s own valve opens to let it pass down through the water.':'A lift pump with a stuffing box round the pump rod, so the top of the barrel is closed and the water lifted by the bucket can be driven up a pipe to any height, not just spilled from a spout.',
  parts:[{id:'p',name:'Bucket (piston) with rod',role:'driver',layer:0,mesh:K.merge(PK.ext({o:rc(-46,0,46,20),h:[K.circle(12,20,0,10)]},0,PK.TH),PK.ext({o:rc(-5,-200,5,0),h:[]},0,PK.TH))},{id:'bv',name:'Bucket valve flap',role:'link',layer:1,shape:flap(30)},{id:'fv',name:'Foot valve flap',role:'link',layer:0,shape:flap(60)}],
  fixed:[R_(X-60,140,X-48,440),R_(X+48,140,X+60,440),R_(X-60,430,X-10,440),R_(X+10,430,X+60,440),R_(X+60,170,X+140,182)].concat(n===449?[R_(X-60,128,X-8,140),R_(X+8,128,X+60,140)]:[]),plate:{x0:300,y0:60,x1:540,y1:500},
  pose(g){return{p:[X,g.y,0],bv:[X,g.y,g.up?0:-0.7],fv:[X-30,430,g.up?-0.7:0]};},drive:'Raise and lower the rod: watch the two valves open and close in turn.'});}

/* 450, 451 · force pumps */
{const X=360;
 PK.def(450,{S:0.3,up:true,summary:'A force pump with a solid plunger: the upstroke draws water in through the foot valve; the downstroke shuts it and forces the water out through the side valve and up the delivery pipe, to whatever height the force on the plunger allows.',
  parts:[{id:'p',name:'Solid plunger with rod',role:'driver',layer:0,mesh:K.merge(PK.ext({o:rc(-46,0,46,20),h:[]},0,PK.TH),PK.ext({o:rc(-5,-210,5,0),h:[]},0,PK.TH))},{id:'ov',name:'Delivery valve flap',role:'link',layer:0,shape:flap(26)},{id:'fv',name:'Foot valve flap',role:'link',layer:0,shape:flap(60)}],
  fixed:[R_(X-60,150,X-48,450),R_(X+48,150,X+60,450),R_(X-60,440,X-10,450),R_(X+10,440,X+60,450),R_(X+60,380,X+220,384),R_(X+60,392,X+204,396),R_(X+204,140,X+208,396),R_(X+216,140,X+220,384)],plate:{x0:280,y0:60,x1:600,y1:500},
  pose(g){return{p:[X,g.y,0],ov:[X+60,388,g.up?0:-0.7],fv:[X-30,440,g.up?-0.7:0]};},drive:'Work the plunger: water is drawn in, then forced up the pipe.'});}
{const sim=window.MB.SIMS[451],X=300,top=170,bot=380;
 PK.def(451,{S:0.3,up:true,summary:'A force pump with an air chamber: each downstroke forces water into a closed vessel, compressing the air in its top; the air presses steadily on the water and keeps it flowing out of the delivery pipe in an even stream between strokes, as in a fire engine.',
  parts:[{id:'p',name:'Piston with rod',role:'driver',layer:0,mesh:K.merge(PK.ext({o:rc(-46,0,46,24),h:[]},0,PK.TH),PK.ext({o:rc(-5,-220,5,0),h:[]},0,PK.TH))},{id:'iv',name:'Inlet valve flap',role:'link',layer:0,shape:flap(28)},{id:'ov',name:'Outlet valve flap',role:'link',layer:0,shape:flap(16)}],
  fixed:[R_(X-60,top,X-48,bot),R_(X+48,top,X+60,bot),R_(X-60,bot,X-14,bot+8),R_(X+14,bot,X+60,bot+8),R_(X+60,bot-44,X+180,bot-40),R_(X+60,bot-20,X+180,bot-16),R_(480,140,490,380),R_(570,140,580,380),R_(480,380,580,390),R_(480,130,520,140),R_(536,130,580,140),R_(516,40,520,140),R_(536,40,540,140)],plate:{x0:220,y0:30,x1:600,y1:420},
  pose(g){const py=bot-40-g.y;return{p:[X,py,0],iv:[X-14,bot,g.up?-0.7:0],ov:[X+64,bot-30,g.up?0:-0.7]};},drive:'Work the piston: the air vessel keeps the outflow steady.'});}

/* 452 · double-acting pump */
{const y=270;
 PK.def(452,{S:0.3,summary:'A double-acting pump: valves at both ends of the barrel let water in behind the piston and out in front of it on each stroke, so it delivers on the forward and the return stroke alike.',
  parts:[{id:'p',name:'Piston with rod',role:'driver',layer:0,mesh:K.merge(PK.ext({o:rc(-12,-46,12,46),h:[]},0,PK.TH),PK.ext({o:rc(0,-5,360,5),h:[]},0,PK.TH))},...['il','ir','ol','or'].map(id=>({id,name:{il:'Left inlet flap',ir:'Right inlet flap',ol:'Left outlet flap',or:'Right outlet flap'}[id],role:'link',layer:0,shape:flap(24)}))],
  fixed:[R_(220,y-60,580,y-48),R_(220,y+48,580,y+60),R_(220,y-48,232,y+48),R_(568,y-48,580,y-5),R_(568,y+5,580,y+48),...[-1,1].flatMap(s=>{const x=400+s*150;return[R_(x-16,y+60,x-12,y+140),R_(x+12,y+60,x+16,y+140),R_(x-16,y-140,x-12,y-60),R_(x+12,y-140,x+16,y-60)];}),R_(238,y-164,562,y-160)],plate:{x0:200,y0:90,x1:780,y1:430},
  pose(g){const r=g.r;return{p:[400+g.x,y,0],il:[238,y+60,r?-0.6:0],ir:[538,y+60,r?0:-0.6],ol:[238,y-60,r?0:0.6],or:[538,y-60,r?0.6:0]};},drive:'Push the rod in and out: each stroke delivers water.'});}

/* 453 · double bellows pump */
{const F=[400,150];
 PK.def(453,{S:0.3,up:true,summary:'A double bellows pump: a rocking beam works two bellows in turn. As each top board rises the bellows fill through the valve beneath; as it is pressed down they empty up the delivery pipe, so one or the other is always delivering.',
  parts:[{id:'b',name:'Rocking beam',role:'driver',layer:1,shape:S=>({o:rc(-300,-10,300,10),h:[S.hole(0,0)]})},{id:'t',name:'Bellows top board',role:'link',qty:2,layer:0,shape:S=>S.rect(140,10,0,0)}],
  ground:[[F[0],F[1],0,1]],fixed:[R_(150,380,290,390),R_(510,380,650,390)],plate:{x0:80,y0:60,x1:720,y1:460},
  pose(g){return{b:[F[0],F[1],g.a],t:[-1,1].map(s=>[400+s*180,F[1]+s*180*Math.sin(g.a)+25,0])};},hardware:['Two pieces of cloth or a cut balloon for the bellows sides, glued between the top boards and the base strips.'],drive:'Rock the beam: the two bellows open and close in turn.'});}

/* 454 · diaphragm pump */
{const X=400,y=270;
 PK.def(454,{S:0.3,up:true,summary:'A diaphragm pump: instead of a sliding piston, a flexible diaphragm across the top of the chamber is pulled up and pushed down by the rod. It draws water in through one valve and drives it out through the other, with nothing to wear or leak.',
  parts:[{id:'d',name:'Diaphragm plate with rod (fit a rubber sheet under it)',role:'driver',layer:0,mesh:K.merge(PK.ext({o:rc(-120,-4,120,4),h:[]},0,PK.TH),PK.ext({o:rc(-5,-170,5,0),h:[]},0,PK.TH))},{id:'iv',name:'Inlet flap',role:'link',layer:0,shape:flap(20)},{id:'ov',name:'Outlet flap',role:'link',layer:0,shape:flap(20)}],
  fixed:[R_(X-180,y,X-168,y+110),R_(X+168,y,X+180,y+110),R_(X-180,y+98,X-130,y+110),R_(X-110,y+98,X+110,y+110),R_(X+130,y+98,X+180,y+110),R_(X-134,y+110,X-130,y+200),R_(X-110,y+110,X-106,y+200),R_(X+106,y+110,X+110,y+200),R_(X+130,y+110,X+134,y+200)],plate:{x0:200,y0:80,x1:600,y1:490},
  pose(g){return{d:[X,y-g.d,0],iv:[X-130,y+110,g.up?-0.7:0],ov:[X+110,y+110,g.up?0:0.7]};},hardware:['A sheet of rubber (a cut balloon or glove) clamped across the chamber under the plate.'],drive:'Raise and lower the rod: the two valves open in turn.'});}

/* 457 · well sweep */
{const P=[330,200],L1=320,L2=130;
 PK.def(457,{S:0.3,up:true,summary:'A well sweep: a long pole pivoted on a post, with the bucket hung from the long end and a counterweight on the short end. The weight, about half a full bucket, makes lowering the empty bucket and raising the full one equally light work.',
  parts:[{id:'p',name:'Sweep pole with counterweight',role:'driver',layer:0,mesh:K.merge(PK.ext({o:armPts([-L2,0],[L1,0],8),h:[Sh.hole(0,0)]},0,PK.TH),PK.ext({o:rc(-L2-30,4,-L2+30,54),h:[]},0,PK.TH))},{id:'b',name:'Bucket',role:'driven',layer:0,shape:S=>S.rect(40,40,0,20)}],
  ground:[[P[0],P[1],0,0]],fixed:[R_(P[0]-10,P[1]+20,P[0]+10,500),R_(560,380,575,520),R_(705,380,720,520)],plate:{x0:150,y0:60,x1:740,y1:520},
  pose(g){const E=[P[0]+L1*Math.cos(g.a),P[1]+L1*Math.sin(g.a)];return{p:[P[0],P[1],g.a],b:[E[0],E[1]+180,0]};},
  ropes(g){const E=[P[0]+L1*Math.cos(g.a),P[1]+L1*Math.sin(g.a)],z=PK.zl(0)+2;return[{pts:[[E[0],E[1],z],[E[0],E[1]+180,z]],r:0.6}];},drive:'Pull the bucket down into the well and let the counterweight help lift it.'});}

/* 458 · two-bucket well */
{const P=[400,90],r=50;
 PK.def(458,{S:0.3,up:true,summary:'A two-bucket well: the rope runs over a pulley with a bucket on each end, so lowering the empty bucket helps raise the full one; only the weight of the water has to be lifted.',
  parts:[{id:'w',name:'Pulley',role:'driver',layer:0,shape:S=>S.disk(r)},{id:'b',name:'Bucket',role:'driven',qty:2,layer:0,shape:S=>S.rect(44,40,0,20)}],
  ground:[[P[0],P[1],0,0]],fixed:[R_(270,300,285,520),R_(515,300,530,520)],plate:{x0:250,y0:30,x1:550,y1:520},
  pose(g){return{w:[P[0],P[1],g.s/r],b:[[P[0]-r,420-g.s,0],[P[0]+r,220+g.s,0]]};},
  ropes(g){const z=PK.zl(0)+PK.TH/2,pts=[[P[0]-r,420-g.s,z]];for(let i=0;i<=12;i++){const t=PI+i/12*PI;pts.push([P[0]+r*Math.cos(t),P[1]+r*Math.sin(t),z]);}pts.push([P[0]+r,220+g.s,z]);return[{pts,r:0.6}];},
  hardware:['A cord over the pulley with a bucket on each end.'],drive:'Turn the pulley: one bucket rises as the other sinks.'});}

/* 459 · wind-driven buckets */
{const D=[400,120];
 PK.def(459,{S:0.3,up:true,summary:'A wind-driven bucket hoist: the windmill shaft turns the drum, and gearing shifted between two worm wheels reverses it, so the two buckets on the drum’s rope are raised and lowered in turn.',
  parts:[{id:'d',name:'Drum',role:'driven',layer:0,shape:S=>S.disk(60)},{id:'s',name:'Windmill sails',role:'driver',layer:0,mesh:K.merge(PK.ext({o:K.circle(14,24),h:[Sh.hole(0,0)]},0,PK.TH),...[0,1,2,3].map(k=>PK.ext({o:rotP(rc(10,-6,70,6),k*PI/2),h:[]},0,PK.TH)))},{id:'b',name:'Bucket',role:'link',qty:2,layer:0,shape:S=>({o:[[-30,0],[30,0],[24,50],[-24,50]],h:[]})}],
  ground:[[D[0],D[1],0,0],[620,90,0,0]],plate:{x0:300,y0:40,x1:700,y1:500},
  pose(g){const yl=180+g.h*240,yr=420-g.h*240;return{d:[D[0],D[1],g.phi],s:[620,90,g.phi*2],b:[[D[0]-60,yl,0],[D[0]+60,yr,0]]};},
  ropes(g){const z=PK.zl(0)+PK.TH/2,yl=180+g.h*240,yr=420-g.h*240;return[{pts:[[D[0]-60,yl,z],[D[0]-60,D[1],z]],r:0.6},{pts:[[D[0]+60,yr,z],[D[0]+60,D[1],z]],r:0.6}];},drive:'Turn the drum one way and the other: the buckets rise in turn.'});}

/* 460 · Fairbairn's bailing scoop */
{const F=[420,200],O=[650,90];
 PK.def(460,{S:0.3,up:true,summary:'Fairbairn’s bailing scoop: a long scoop pivoted at the top of a bank, rocked by an engine through a crank and rod. Its mouth dips into the low water, and as it swings up the water runs back along it and over the bank into the higher channel.',
  parts:[{id:'s',name:'Scoop',role:'driven',layer:0,shape:S=>({o:[[-220,170],[0,0],[30,-20],[10,20],[-200,200]],h:[S.hole(0,0)]}),pins:[[60*Math.cos(-0.6),60*Math.sin(-0.6),1]]},{id:'w',name:'Engine flywheel with crank pin',role:'driver',layer:0,shape:S=>S.disk(60),pins:[[40,0,1]]},{id:'r',name:'Connecting rod',role:'link',layer:1,shape:S=>S.bar(Math.hypot(O[0]-F[0]-60*Math.cos(-0.6),O[1]-F[1]-60*Math.sin(-0.6)),10)}],
  ground:[[F[0],F[1],0,0],[O[0],O[1],0,0]],fixed:[R_(330,260,520,520)],plate:{x0:180,y0:40,x1:720,y1:520},
  pose(g){const pin=g.pin,A=g.A;return{s:[F[0],F[1],g.a],w:[O[0],O[1],g.phi],r:[pin[0],pin[1],Math.atan2(A[1]-pin[1],A[0]-pin[0])]};},
  drive:'Turn the flywheel: the scoop rocks and lifts water over the bank.'});}

/* 461 · swinging gutters */
PK.def(461,{S:0.3,up:true,summary:'Swinging gutters: a stack of troughs on pivots, linked so that they rock together, each tilted the opposite way to the one below. Water scooped up by the lowest runs along it into the next, and so is passed upward step by step.',
  parts:[{id:'g',name:'Gutter with scoop end',role:'driver',qty:3,layer:0,shape:S=>({o:[[-130,-40],[-110,-10],[110,-10],[110,10],[-110,10]],h:[S.hole(0,0)]})}],
  ground:[[220,380,0,0],[400,270,0,0],[580,160,0,0]],plate:{x0:60,y0:100,x1:740,y1:460},
  pose(g){return{g:[0,1,2].map(k=>[220+k*180,380-k*110,g.a*(k%2?-1:1)])};},drive:'Rock the gutters together.'});

/* 462 · chain pump */
{const T=[400,100],B=[400,450],r=36;
 PK.def(462,{S:0.3,up:true,summary:'A chain pump: an endless chain carrying disks runs over a wheel at the top and round a wheel at the bottom, rising through a close-fitting tube. Each disk carries a column of water up the tube and spills it out at the spout.',
  parts:[{id:'t',name:'Top wheel (driver)',role:'driver',layer:0,shape:S=>S.gear(r,8,{add:0.6})},{id:'b',name:'Bottom wheel',role:'driven',layer:0,shape:S=>S.disk(r)}],
  ground:[[T[0],T[1],0,0],[B[0],B[1],0,0]],fixed:[R_(T[0]-r-22,140,T[0]-r-18,440),R_(T[0]-r+2,140,T[0]-r+6,440),R_(T[0]-r-110,130,T[0]-r-20,144)],plate:{x0:240,y0:50,x1:560,y1:500},
  pose(g){return{t:[T[0],T[1],-g.phi*1.25],b:[B[0],B[1],-g.phi*1.25]};},
  ropes(){const z=PK.zl(0)+PK.TH/2,pts=[];for(let i=0;i<=12;i++){const t=PI+i/12*PI;pts.push([T[0]+r*Math.cos(t),T[1]+r*Math.sin(t),z]);}for(let i=0;i<=12;i++){const t=i/12*PI;pts.push([B[0]+r*Math.cos(t),B[1]+r*Math.sin(t),z]);}return[{pts,r:1.2,closed:true}];},
  hardware:['A bead chain (or cord with knots) as the chain of disks.'],drive:'Turn the top wheel: the disks rise up the tube.'});}

/* 463 · self-acting weir leaf */
{const P=[410,353];
 PK.def(463,{S:0.3,up:true,summary:'A self-acting weir: the leaf (shutter) turns on an axle a third of the way up. While the water is low, its pressure acts mainly below the axle and holds the leaf shut; when it rises far enough the leaf swings over, the rush of water scours away the silt, and as the level falls the counterweight closes it again.',
  parts:[{id:'l',name:'Weir leaf with counterweight arm',role:'driven',layer:0,mesh:K.merge(PK.ext({o:rc(4,-133,16,67),h:[]},0,PK.TH),PK.ext({o:armPts([10,0],[90,40],6),h:[Sh.hole(10,0)]},0,PK.TH),PK.ext({o:rc(80,30,104,54),h:[]},0,PK.TH))}],
  ground:[[P[0]+10,P[1],0,0]],fixed:[R_(60,420,760,440),R_(390,190,400,420)],plate:{x0:40,y0:150,x1:780,y1:460},
  pose(g){return{l:[P[0],P[1],-1.2*g.open]};},drive:'Tip the leaf over and let it swing back.'});}

/* 464 · Hero's fountain */
PK.def(464,{S:0.3,up:true,summary:'Hero’s fountain: water poured into the open top basin runs down a pipe into the lowest vessel and compresses the air there; the air passes up a second pipe into the middle vessel and presses on its water, which spouts up through a jet in the top basin, higher than the basin itself, until the middle vessel is empty.',
  parts:[{id:'j',name:'Jet nozzle (fits in the top basin)',role:'driver',layer:1,shape:S=>S.rect(14,40,0,0)}],
  fixed:[R_(300,100,500,108),R_(300,100,308,170),R_(492,100,500,170),R_(300,162,500,170),R_(160,260,340,268),R_(160,260,168,340),R_(332,260,340,340),R_(160,332,340,340),R_(460,260,640,268),R_(460,260,468,340),R_(632,260,640,340),R_(460,332,640,340),R_(316,170,324,262),R_(330,256,480,264)],plate:{x0:140,y0:40,x1:660,y1:360},
  pose(){return{j:[420,90,0]};},drive:'A display section of the three vessels and their pipes.'});

/* 465 · two pumps on one rocking beam */
{const F=[400,130];
 PK.def(465,{S:0.3,up:true,summary:'Two pumps worked by one rocking beam: the plungers hang from opposite ends, so one rises while the other falls and the beam is balanced, the work of lifting being shared between the two strokes.',
  parts:[{id:'b',name:'Rocking beam',role:'driver',layer:1,shape:S=>({o:rc(-280,-12,280,12),h:[S.hole(0,0),S.hole(-240,0),S.hole(240,0)]})},{id:'p',name:'Plunger with rod',role:'driven',qty:2,layer:0,mesh:K.merge(PK.ext({o:rc(-34,150,34,166),h:[]},0,PK.TH),PK.ext({o:armPts([0,0],[0,150],5),h:[]},0,PK.TH)),pins:[[0,0,1]]}],
  ground:[[F[0],F[1],0,1]],fixed:[R_(F[0]-12,F[1]+20,F[0]+12,460),...[-1,1].flatMap(s=>{const x=400+s*240;return[R_(x-40,260,x-34,460),R_(x+34,260,x+40,460)];})],plate:{x0:100,y0:60,x1:700,y1:480},
  pose(g){return{b:[F[0],F[1],g.a],p:[-1,1].map(s=>[400+s*240,F[1]+s*240*Math.sin(g.a),0])};},drive:'Rock the beam: the two plungers rise and fall in turn.'});}

/* 466 · hydraulic (Bramah) press */
{const X=520;
 PK.def(466,{S:0.3,up:true,summary:'Bramah’s hydraulic press: a small plunger, worked by a hand lever, forces water into the large cylinder under the ram. The pressure is the same everywhere, so the ram pushes with as many times the plunger’s force as its area is times the plunger’s: here about twenty-five times, multiplied again by the lever.',params:window.MB.SIMS[466].params,
  parts:[{id:'r',name:'Ram and platen',role:'driven',layer:0,mesh:K.merge(PK.ext({o:rc(-60,-60,60,60),h:[]},0,PK.TH),PK.ext({o:rc(-100,-80,100,-60),h:[]},0,PK.TH))},{id:'p',name:'Small plunger',role:'driver',layer:0,shape:S=>S.rect(16,90,0,45)}],
  fixed:[R_(X-80,200,X-70,460),R_(X+70,200,X+80,460),R_(X-110,60,X+110,80),R_(X-110,80,X-90,480),R_(X+90,80,X+110,480),R_(170,440,X-70,460),R_(214,300,222,440),R_(238,300,246,440)],plate:{x0:150,y0:40,x1:660,y1:500},
  pose(g){const top=330-(g.ram||0);return{r:[X,top,0],p:[230,250+g.y,0]};},drive:'Work the small plunger: the ram rises slowly with great force.'});}

/* 467 · hydraulic jack */
{const X=470,F=[240,240];
 PK.def(467,{S:0.3,up:true,summary:'A hydraulic jack: each stroke of the hand lever drives the small plunger down and forces liquid under the large ram, lifting the load a little; valves let more liquid in on the return stroke.',
  parts:[{id:'r',name:'Ram',role:'driven',layer:0,shape:S=>S.rect(120,190,0,95)},{id:'h',name:'Hand lever',role:'driver',layer:1,shape:S=>({o:armPts([-45,0],[180,0],12),h:[S.hole(0,0),S.hole(-45,0)]})},{id:'p',name:'Plunger',role:'link',layer:0,shape:S=>S.rect(12,80,0,40),pins:[[0,0,1]]}],
  ground:[[F[0],F[1],0,1]],fixed:[R_(X-80,200,X-66,460),R_(X+66,200,X+80,460),R_(F[0]+20,300,F[0]+28,460),R_(F[0]+42,300,F[0]+50,460),R_(F[0]-6,F[1]+16,F[0]+6,300)],plate:{x0:40,y0:40,x1:580,y1:480},
  pose(g){const th=-PI/2-0.6+g.a,Lp=[F[0]-45*Math.cos(th),F[1]-45*Math.sin(th)];return{r:[X,140-(window.MB.SIMS[467].h||0)*0.6,0],h:[F[0],F[1],th],p:[F[0]+35,Lp[1]+16,0]};},drive:'Pump the lever: the ram rises.'});}

/* 468 · flexible jointed water main */
PK.def(468,{S:0.25,summary:'A flexible water main for laying across a river: the pipe is made of short lengths joined by ball-and-socket joints, so as it is paid out from the bank it settles into the shape of the river bed without breaking.',
  parts:[{id:'s',name:'Pipe length with ball and socket',role:'driver',qty:12,layer:0,mesh:K.merge(PK.ext({o:rc(0,-7,50,7),h:[]},0,PK.TH),PK.ext({o:K.circle(9,24,0,0),h:[]},0,PK.TH))}],
  fixed:[{shape:S=>({o:(()=>{const o=[[0,520],[0,140],[80,140]];for(let i=1;i<=20;i++){const t=i/20;o.push([80+640*t,140+2*(1-t)*t*420]);}o.push([800,140],[800,520]);return o;})(),h:[]}),l1:0}],plate:{x0:0,y0:100,x1:800,y1:520},
  pose(g){const n=12,laid=Math.floor(g.u*n),o=[];let prev=[80,130];for(let k=0;k<n;k++){const t=(k+1)/n,bed=[80+640*t,140+2*(1-t)*t*420-10];const p=k<laid?bed:[prev[0]+50,prev[1]];o.push([prev[0],prev[1],Math.atan2(p[1]-prev[1],p[0]-prev[0])]);prev=p;}return{s:o};},drive:'Display: the joints let the pipe follow the river bed.'});

/* 469 · air engine (drawn as a plain cylinder, cross-head and crank) */
{const sim=window.MB.SIMS[469],O=sim.O,r=sim.r,Lc=sim.L,y=O[1],cx0=60,cw=260;
 PK.def(469,{S:0.3,summary:'A hot-and-cold air engine, drawn as a plain cylinder: air heated at one end and cooled at the other pushes the piston out and lets it back, and the piston works the crank through a cross-head and connecting rod.',
  parts:[{id:'fw',name:'Flywheel with crank pin',role:'driven',layer:0,shape:S=>({o:K.circle(130,96),h:[S.hole(0,0),...[0,1,2,3,4].map(k=>K.circle(32,32,84*Math.cos(k*TAU/5+0.6),84*Math.sin(k*TAU/5+0.6)))]}),pins:[[r,0,2]]},
   {id:'p',name:'Piston, rod and cross-head',role:'driver',layer:1,mesh:K.merge(PK.ext({o:rc(-220,-56,-190,56),h:[]},0,PK.TH),PK.ext({o:rc(-190,-5,0,5),h:[]},0,PK.TH),PK.ext({o:rc(-22,-22,22,22),h:[]},0,PK.TH)),pins:[[0,0,2]]},{id:'cr',name:'Connecting rod',role:'link',layer:2,shape:S=>S.bar(Lc,12)}],
  ground:[[O[0],O[1],0,0]],fixed:[R_(cx0,y-70,cx0+cw,y-58),R_(cx0,y+58,cx0+cw,y+70),R_(cx0,y-58,cx0+12,y+58),R_(cx0+cw-12,y-58,cx0+cw,y-7),R_(cx0+cw-12,y+7,cx0+cw,y+58),R_(cx0+cw+20,y-34,cx0+cw+220,y-26),R_(cx0+cw+20,y+26,cx0+cw+220,y+34)].map(f=>Object.assign(f,{l1:1})),
  pose(g){return{fw:[O[0],O[1],g.phi+PI],p:[g.x,y,0],cr:[g.x,y,Math.atan2(g.pin[1]-y,g.pin[0]-g.x)]};},drive:'Turn the flywheel: the piston slides in and out.'});}

/* 470 · steam hammer */
{const X=400;
 PK.def(470,{S:0.3,up:true,summary:'Nasmyth’s steam hammer: steam let in under the piston lifts the piston, rod and heavy hammer head together; when it is let out, the whole falls freely on the work on the anvil. The blow can be anything from a tap to a full crash, depending on how high it is lifted.',
  parts:[{id:'h',name:'Piston, rod and hammer head (one piece)',role:'driver',layer:0,mesh:K.merge(PK.ext({o:rc(-48,-180,48,-160),h:[]},0,PK.TH),PK.ext({o:rc(-7,-170,7,0),h:[]},0,PK.TH),PK.ext({o:rc(-70,0,70,70),h:[]},0,PK.TH))}],
  fixed:[R_(X-190,30,X-150,480),R_(X+150,30,X+190,480),R_(X-62,24,X-50,220),R_(X+50,24,X+62,220),R_(X-62,24,X+62,30),R_(X-62,210,X-10,220),R_(X+10,210,X+62,220),R_(X-60,412,X+60,436),R_(X-90,436,X+90,486)],plate:{x0:190,y0:10,x1:610,y1:500},
  pose(g){return{h:[X,340-g.h*120,0]};},drive:'Lift the hammer and let it fall onto the anvil.'});}

/* 471, 472 · air hammers */
for(const n of [471,472]){const X=420,pump=n===472;
 PK.def(n,{S:0.3,up:true,summary:pump?'An air hammer fed from a reservoir by a crank-driven pump: compressed air admitted under the piston lifts the hammer, and is let out to drop it.':'Hotchkiss’s atmospheric hammer: the space above the piston is exhausted, so the pressure of the atmosphere below lifts the piston and hammer; letting air in above lets it fall.',
  parts:[{id:'h',name:'Piston, rod and hammer head (one piece)',role:'driver',layer:0,mesh:K.merge(PK.ext({o:rc(-48,0,48,20),h:[]},0,PK.TH),PK.ext({o:rc(-8,20,8,80),h:[]},0,PK.TH),PK.ext({o:rc(-60,80,60,130),h:[]},0,PK.TH))},...(pump?[{id:'w',name:'Pump crank wheel',role:'link',layer:0,shape:S=>S.disk(70),pins:[[40,0,1]]},{id:'pr',name:'Pump rod',role:'link',layer:1,shape:S=>S.bar(140,10)},{id:'pp',name:'Pump piston',role:'link',layer:1,shape:S=>S.rect(46,14,0,0),pins:[[0,0,1]].slice(0,0)}]:[])],
  ground:pump?[[180,250,0,0]]:[],fixed:[R_(X-60,80,X-50,340),R_(X+50,80,X+60,340),R_(X-60,80,X+60,90),R_(X-60,330,X-12,340),R_(X+12,330,X+60,340),R_(X-90,460,X+90,490)].concat(pump?[R_(240,50,244,260),R_(286,50,290,260)]:[]),plate:{x0:pump?100:330,y0:40,x1:520,y1:500},
  pose(g){const o={h:[X,320-g.y,0]};if(pump){const pin=[180+40*Math.cos(g.phi),250+40*Math.sin(g.phi)],py=pin[1]-Math.sqrt(140*140-(265-pin[0])**2);o.w=[180,250,g.phi];o.pr=[pin[0],pin[1],Math.atan2(py-pin[1],265-pin[0])];o.pp=[265,py-3,0];}return o;},drive:'Lift and drop the hammer by hand to see its stroke.'});}

/* 473 · bell air pump */
{const X=400;
 PK.def(473,{S:0.3,up:true,summary:'A bell air pump: an inverted tub (the bell) dips in a tank of water. Lifted, it draws air in through a valve; pressed down, the water rising inside it drives the air out through the delivery pipe, a gentle, steady blower for furnaces or ventilation.',
  parts:[{id:'b',name:'Bell (inverted tub) with handle',role:'driver',layer:0,mesh:K.merge(PK.ext({o:[[-120,200],[-120,0],[120,0],[120,200],[112,200],[112,8],[-112,8],[-112,200]],h:[]},0,PK.TH),PK.ext({o:rc(-6,-120,6,0),h:[]},0,PK.TH))}],
  fixed:[R_(X-160,240,X-150,460),R_(X+150,240,X+160,460),R_(X-160,450,X+160,460)],plate:{x0:200,y0:20,x1:600,y1:480},
  pose(g){return{b:[X,200-g.y,0]};},drive:'Raise and lower the bell in the tank.'});}

/* 474 · Hero's aeolipile */
{const S=0.3,zc=U.BT+60,R=90*S;
 PK.defS(474,{summary:'Hero’s aeolipile: steam from a boiler rises through two hollow supports into a sphere pivoted between them; it escapes from two bent nozzles pointing opposite ways, and their reaction spins the sphere, the first steam turbine.',cam:{yaw:0.5,pitch:0.25},
  base:()=>[U.plate(-55,-30,55,30),K.box(96,40,U.BT,U.BT+30,0,0),...[-1,1].map(s=>K.box(4,4,U.BT+30,zc,s*39,0)),...[-1,1].map(s=>K.xf(K.cyl(1.6,0,12,14),M4.mul(M4.T(s*39,0,zc),M4.Ry(-s*PI/2))))],
  parts:[{id:'s',name:'Sphere with two bent jets',role:'driven',mesh:K.merge(K.lathe(Array.from({length:17},(_,i)=>{const t=-PI/2+PI*i/16;return[Math.max(0.01,R*Math.cos(t)),R*Math.sin(t)];}),40),K.cyl(2,R-2,R+8,12),K.cyl(2,-R-8,-R+2,12),K.xf(K.tubeSolid(3.2,1.8,R-2,39-2,16),M4.Ry(PI/2)),K.xf(K.tubeSolid(3.2,1.8,R-2,39-2,16),M4.Ry(-PI/2)),K.xf(K.cyl(1.6,0,8,12),M4.mul(M4.T(0,0,R+7),M4.Rx(PI/2))),K.xf(K.cyl(1.6,0,8,12),M4.mul(M4.T(0,0,-R-7),M4.Rx(-PI/2))))}],
  pose(phi,g){return{s:M4.mul(M4.T(0,0,zc),M4.Rx(g.phi))};},read:(phi,g)=>`sphere ${(g.phi/TAU).toFixed(2)} turns`,drive:'Spin the sphere on its pivots.'});}

/* 475 · steam jet pump (no moving parts: a section) */
{const y=250;
 PK.def(475,{S:0.3,summary:'A steam jet pump (ejector): steam blown at high speed from a nozzle into a narrow throat drags the surrounding water along with it, lowering the pressure round the jet so that water is drawn up the side pipe and carried on. There are no moving parts.',
  parts:[{id:'n',name:'Steam nozzle (fits the left end)',role:'driver',layer:0,shape:S=>({o:[[0,-16],[200,-6],[200,6],[0,16]],h:[]})}],
  fixed:[{shape:S=>({o:[[120,y-28],[340,y-28],[420,y-48],[700,y-48],[700,y-40],[420,y-40],[340,y-20],[120,y-20]],h:[]}),l1:0},{shape:S=>({o:[[120,y+20],[340,y+20],[370,y+26],[370,y+240],[362,y+240],[362,y+32],[340,y+28],[120,y+28]],h:[]}),l1:0},{shape:S=>({o:[[410,y+40],[700,y+40],[700,y+48],[418,y+48],[418,y+240],[410,y+240]],h:[]}),l1:0}],plate:{x0:100,y0:180,x1:720,y1:500},
  pose(){return{n:[130,y,0]};},drive:'A section: see how the jet draws water up the side pipe.'});}
