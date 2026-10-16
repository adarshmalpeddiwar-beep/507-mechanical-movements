(function(){const K=window.CAD.K,PK=window.PK,M4=K.M4,PI=Math.PI,TAU=2*PI;const mod=(a,n)=>((a%n)+n)%n;const ropeThru=(...a)=>window.MB.ropeThru(...a);
/* ===== printable models 231–270 ===== */
const U=PK.U,{Sh}=PK,L=PK.Lib;PK._S(0.3);const pxPoly=L.pxPoly;
const axle=(top,knob=true)=>{const m=[K.cyl(PK.PINR-0.05,0,top,24)];if(knob)m.push(K.cyl(5,top,top+7,32));return K.merge(...m);};
const filledGear=(R,Z,j)=>S=>{/* gear outline with tooth space j (centred at angle π/Z + j·2π/Z) filled to the tip circle */const m=2*R/Z,ra=R+m,c=PI/Z+j*TAU/Z;
  return{o:S.gearOutline(R,Z).map(p=>{const t=Math.atan2(p[1],p[0]),dt=Math.abs(((t-c)%TAU+TAU+PI)%TAU-PI);if(dt<PI/Z*0.98){return[ra*Math.cos(t),ra*Math.sin(t)];}return p;}),h:[S.hole(0,0)]};};

/* 231 drag link: two cranks on separate shafts joined by a link */
{const sim=window.MB.SIMS[231],A=sim.A,D=sim.D,a=sim.a,b=sim.b,c=sim.c;
 PK.def(231,{S:0.3,summary:'The drag link: two cranks on separate shafts a little apart, joined by a link. The driving crank turns steadily; the driven crank goes round too, but runs ahead for half the turn and drops behind for the other half.',
  parts:[{id:'cc',name:'Driven crank',role:'driven',layer:0,shape:S=>S.bar(c,16),pins:[[c,0,1]]},{id:'lk',name:'Link',role:'link',layer:1,shape:S=>S.bar(b,12),pins:[[b,0,3]]},
   {id:'ca',name:'Driving crank',role:'driver',layer:3,shape:S=>({o:S.bar(a,16).o,h:[S.hole(0,0,(PK.PINR+0.05)/0.3),S.hole(a,0)]})},{id:'ax',name:'Driving axle with knob (glue in the crank)',role:'driver',layer:3,mesh:axle(PK.zl(6)-PK.zl(3)+2)},
   {id:'br',name:'Bridge',role:'frame',layer:5,shape:S=>({o:[[A[0]+20,A[1]-20],[A[0]-210,A[1]-40],[A[0]-210,A[1]+40],[A[0]+20,A[1]+20]],h:[S.hole(A[0],A[1]),S.hole(A[0]-190,A[1]-22),S.hole(A[0]-190,A[1]+22)]})}],
  ground:[[D[0],D[1],0,0,false],[A[0]-190,A[1]-22,5,5],[A[0]-190,A[1]+22,5,5]],
  pose(g){return{cc:[D[0],D[1],Math.atan2(g.C[1]-D[1],g.C[0]-D[0])],lk:[g.C[0],g.C[1],Math.atan2(g.B[1]-g.C[1],g.B[0]-g.C[0])],ca:[A[0],A[1],g.phi],ax:[A[0],A[1],g.phi],br:[0,0,0]};},
  drive:'Turn the knob above the bridge: the lower crank runs ahead, then lags.'});}

/* 232, 237, 225 ratchet wheel, lever with pawl, holding click */
for(const n of [232,237,225]){const sim=window.MB.SIMS[n];if(!sim||!sim.prof)continue;const Cc=[400,300],N=sim.N,p=TAU/N;
 const R0=PK.runner(n);R0.at(0);const geo=(W,a)=>{const arm=a-PI/2,pv=[Cc[0]+150*Math.cos(arm-0.32),Cc[1]+150*Math.sin(arm-0.32)],rel=arm-(W-PI/2),rt=sim.prof.call(sim,rel)+2,tip=[Cc[0]+rt*Math.cos(arm),Cc[1]+rt*Math.sin(arm)];
   const cp=[Cc[0]+150,Cc[1]-40],ca=Math.atan2(cp[1]-Cc[1],cp[0]-Cc[0])-0.35,cr=sim.prof.call(sim,ca-(W-PI/2))+2,ct=[Cc[0]+cr*Math.cos(ca),Cc[1]+cr*Math.sin(ca)];return{arm,pv,tip,cp,ct};};
 const g0=geo(0,0),Lp=Math.hypot(g0.tip[0]-g0.pv[0],g0.tip[1]-g0.pv[1]),Lc=Math.hypot(g0.ct[0]-g0.cp[0],g0.ct[1]-g0.cp[1]);
 PK.def(n,{S:0.3,summary:'A ratchet wheel with a lever swinging on its axle. The pawl hinged on the lever pushes the wheel round a tooth or two on the forward stroke and slides back over the teeth on the return, while the holding click on the frame stops the wheel running back.',
  parts:[{id:'w',name:`Ratchet wheel, ${N} teeth`,role:'driven',layer:1,shape:S=>S.ratchet(112,N,20,-1)},{id:'lv',name:'Lever',role:'driver',layer:0,shape:S=>S.lever([[0,0,18],[220,0,10]],[[0,0]]),pins:[[150*Math.cos(-0.32),150*Math.sin(-0.32),1]],bosses:[[214,0,16,3.5]]},
   {id:'pw',name:'Pawl',role:'link',layer:1,shape:S=>S.lever([[0,0,7],[Lp,0,5]],[[0,0]])},{id:'ck',name:'Holding click',role:'link',layer:1,shape:S=>S.lever([[0,0,7],[Lc,0,5]],[[0,0]])}],
  ground:[[Cc[0],Cc[1],0,1],[g0.cp[0],g0.cp[1],1,1]],
  pose(g,s){const z=geo(s.W,g.a);return{w:[Cc[0],Cc[1],s.W-PI/2],lv:[Cc[0],Cc[1],z.arm],pw:[z.pv[0],z.pv[1],Math.atan2(z.tip[1]-z.pv[1],z.tip[0]-z.pv[0])],ck:[z.cp[0],z.cp[1],Math.atan2(z.ct[1]-z.cp[1],z.ct[0]-z.cp[0])]};},
  hardware:['Two small rubber bands keep the pawl and the click against the teeth.'],drive:'Rock the lever by its knob: the wheel steps round one way only.'});}

/* 233 lantern wheel stopped by a pinion with one tooth space filled */
{const sim=window.MB.SIMS[233],O=sim.O,R=sim.R,Ns=sim.Ns,Zp=sim.Zp,rp=Zp*R/Ns,P=[O[0]+R+rp,O[1]];
 PK.def(233,{S:0.3,summary:'A lantern wheel of twenty staves meshing with a twelve-tooth pinion that has one tooth space filled in. The wheel can turn only until a stave meets the filled space, a little over half a turn either way. (Brown’s second stop, a stud on the wheel striking a fixed finger, is shown in the drawing.)',
  parts:[{id:'w',name:'Lantern wheel (staves printed on the disk)',role:'driver',layer:0,shape:S=>S.disk(R+18,[[0,0]],96),bosses:[...Array.from({length:Ns},(_,i)=>[R*Math.cos(i*TAU/Ns),R*Math.sin(i*TAU/Ns),PK.TH+PK.GAP-0.3,1.6]),[0,-45,14,3.5]]},
   {id:'p',name:'Pinion, 12 teeth, one space filled',role:'driven',layer:1,shape:filledGear(rp,Zp,11)}],
  ground:[[O[0],O[1],0,0],[P[0],P[1],1,1]],
  pose(g){return{w:[O[0],O[1],g.a],p:[P[0],P[1],PI-PI/Zp-g.a*Ns/Zp]};},drive:'Turn the lantern wheel by its knob until it stops, then back the other way.'});}

/* 239 spur gear limited by a stud and a fixed stop (model of the first option) */
{const sim=window.MB.SIMS[239],A=sim.A,RA=sim.RA,ZA=sim.ZA,rB=sim.rB,ZB=sim.ZB,B=[A[0]+RA+rB,A[1]];
 PK.def(239,{S:0.3,summary:'A stud on the face of the wheel strikes a stop fixed to the frame, so the wheel and its pinion can turn only a little less than a full turn each way. (The drawing also shows Brown’s other stop, a pinion with one space filled.)',
  parts:[{id:'a',name:`Wheel, ${ZA} teeth, with stud`,role:'driver',layer:0,shape:S=>S.gear(RA,ZA),bosses:[[-66,0,PK.TH+PK.GAP+1,2.6],[0,40,16,3.5]]},{id:'b',name:`Pinion, ${ZB} teeth`,role:'driven',layer:0,shape:S=>S.gear(rB,ZB)},
   {id:'st',name:'Stop arm (fixed)',role:'frame',layer:1,shape:S=>({o:[[A[0]+56,A[1]-8],[A[0]+RA+10,A[1]-14],[A[0]+RA+10,A[1]-60],[A[0]+RA+40,A[1]-60],[A[0]+RA+40,A[1]+8-0],[A[0]+56,A[1]+8]],h:[S.hole(A[0]+RA+25,A[1]-44)]})}],
  ground:[[A[0],A[1],0,0],[B[0],B[1],0,0],[A[0]+RA+25,A[1]-44,1,1]],
  pose(g){return{a:[A[0],A[1],g.a],b:[B[0],B[1],PI-PI/ZB-g.a*ZA/ZB],st:[0,0,0]};},drive:'Turn the wheel by its knob until the stud meets the stop.'});}

/* 240 ratchet wheel held by a pawl */
{const sim=window.MB.SIMS[240],O=[380,280],N=sim.N||18,sawR=window.MB.sawR,Q=[O[0]+150,O[1]-110];const tipAt=w=>{const rr=sawR(-0.55-w,N,92,118);return[O[0]+rr*Math.cos(-0.55),O[1]+rr*Math.sin(-0.55)];},t0=tipAt(0),Lp=Math.hypot(t0[0]-Q[0],t0[1]-Q[1]);
 PK.def(240,{S:0.3,summary:'A ratchet wheel that may turn one way only: a pawl hinged on the frame drops into each tooth as it passes and catches the load if it tries to run back. (The drawing shows Brown’s other stops, a sprung wedge and a roller in a taper.)',
  parts:[{id:'w',name:`Ratchet wheel, ${N} teeth`,role:'driver',layer:0,shape:S=>S.ratchet(118,N,26,-1),bosses:[[-50,0,14,3.5]]},{id:'pw',name:'Pawl',role:'link',layer:0,shape:S=>S.lever([[0,0,8],[Lp,0,5]],[[0,0]])}],
  ground:[[O[0],O[1],0,0],[Q[0],Q[1],0,0]],
  pose(g,s){const T=tipAt(s.w);return{w:[O[0],O[1],s.w],pw:[Q[0],Q[1],Math.atan2(T[1]-Q[1],T[0]-Q[0])]};},hardware:['A rubber band keeps the pawl down on the teeth.'],drive:'Turn the wheel forward by its knob; try to turn it back.'});}

/* 242 band brake */
{const sim=window.MB.SIMS[242],D=[380,280],r=110,P=[560,420];
 PK.def(242,{S:0.3,summary:'A band brake: a strap passes nearly all round the drum, one end fixed close to the lever’s pivot and the other on the lever further out. Pull the lever down and the strap tightens on the drum and slows it.',
  parts:[{id:'d',name:'Brake drum (grooved rim)',role:'driven',layer:0,t:2,shape:S=>S.disk(r,[[0,0]],96),bosses:[[-60,0,14,3.5]]},{id:'lv',name:'Brake lever',role:'driver',layer:2,shape:S=>S.lever([[-60,-12,8],[0,0,14],[150,0,9]],[[0,0],[-60,-12],[-30,-4]])}],
  ground:[[D[0],D[1],0,1],[P[0],P[1],2,2]],
  pose(g,s){return{d:[D[0],D[1],s.a],lv:[P[0],P[1],g.b?0.18:-0.08]};},hardware:['A strip of cloth tape or a rubber band round the drum, its ends tied to the two holes in the lever.'],drive:'Spin the drum, then press the lever.'});}

/* 244 Prony brake */
{const sim=window.MB.SIMS[244],O=[260,270];
 PK.def(244,{S:0.3,summary:'Prony’s brake for measuring an engine’s power: two wooden blocks clamped round the engine’s pulley, with a long arm carrying a weight. The friction tries to carry the arm round; the weight that just holds it level, times the arm’s length and the speed, gives the power.',
  parts:[{id:'d',name:'Engine pulley',role:'driver',layer:0,shape:S=>S.disk(110,[[0,0]],96),bosses:[[-60,0,22,3.5]]},
   {id:'u',name:'Brake block and arm',role:'link',layer:1,shape:S=>({o:[...Array.from({length:37},(_,i)=>{const t=PI+i/36*(PI-0.1);return[126*Math.cos(t),126*Math.sin(t)];}),[470,-12],[470,12],...Array.from({length:37},(_,i)=>{const t=0.1+i/36*(PI-0.1);return[126*Math.cos(t),126*Math.sin(t)];})],h:[S.circle(112,96),S.hole(450,0)]})},
   {id:'wt',name:'Weight hanger',role:'small',layer:2,shape:S=>S.lever([[0,0,7],[0,60,14]],[[0,0]])}],
  ground:[[O[0],O[1],0,0],[O[0]+300,O[1]-70,1,1]],
  pose(g){const t=g.tilt;return{d:[O[0],O[1],g.phi],u:[O[0],O[1],t],wt:[O[0]+450*Math.cos(t),O[1]+450*Math.sin(t),0]};},drive:'Turn the pulley by its knob; the arm lifts against the stop and the weight.'});}

/* 245 bayonet joint: plug with a stud, socket with an L-shaped slot */
{const sim=window.MB.SIMS[245],Ri=10,Ro=13,H=40,zs=22,w=4.4,dt=(w/2+0.3)/Ro;
 const ringSeg=(r0,r1,a0,a1,z0,z1)=>{const n=Math.max(8,Math.ceil((a1-a0)/0.05)),o=[];for(let i=0;i<=n;i++){const t=a0+(a1-a0)*i/n;o.push([r1*Math.cos(t),r1*Math.sin(t)]);}for(let i=n;i>=0;i--){const t=a0+(a1-a0)*i/n;o.push([r0*Math.cos(t),r0*Math.sin(t)]);}return K.prism(o,[],z0,z1);};
 const lock=0.9,socket=K.merge(K.prism(K.circle(Ro+6,64),[],0,4),ringSeg(Ri,Ro,0,TAU,4,zs-w/2),ringSeg(Ri,Ro,lock+dt,TAU-dt,zs-w/2,zs+w/2),ringSeg(Ri,Ro,dt,TAU-dt,zs+w/2,H));
 const plug=K.merge(K.prism(K.circle(Ri-0.4,64),[],0,30),K.prism(K.circle(Ri+4,64),[],30,36),K.xf(K.cyl(2,0,Ro+0.6,20),K.M4.mul(K.M4.T(0,0,4),K.M4.Ry(PI/2))));
 PK.defS(245,{summary:'A bayonet joint: the plug carries a stud, the socket an L-shaped slot. Push the plug in with the stud running down the long arm of the L, then twist it along the short arm, and it cannot be pulled out until it is twisted back.',sim:245,cam:{yaw:0.6,pitch:0.4},
  base:()=>[U.plate(-24,-24,24,24)],parts:[{id:'s',name:'Socket with L-shaped slot',role:'frame',mesh:K.xf(socket,K.M4.T(0,0,U.BT))},{id:'p',name:'Plug with stud',role:'driver',mesh:plug}],
  pose(phi,g){const z=U.BT+H-g.y*(H-zs+4),a=g.x*lock;return{s:K.M4.id(),p:K.M4.mul(K.M4.T(0,0,z),K.M4.Rz(a))};},read:(phi,g)=>g.st,drive:'Push the plug in, twist, and it locks.'});}

/* 246 pantograph */
{const sim=window.MB.SIMS[246],O=sim.O,k=sim.k,Lb=sim.L;
 PK.def(246,{S:0.25,summary:'A pantograph: four bars hinged as a parallelogram, one corner on a fixed pivot. The tracer and the pencil lie on one straight line through the pivot, so the pencil copies whatever the tracer follows at the larger scale (here 2.4 times).',
  parts:[{id:'oa',name:'Long bar (pivot to elbow)',role:'link',layer:0,shape:S=>S.bar(Lb,10,[0,Lb/k,Lb]),pins:[[Lb/k,0,1]]},{id:'ap',name:'Long bar (elbow to pencil)',role:'driven',layer:1,shape:S=>S.bar(Lb,10,[0,Lb/k,Lb]),pins:[[Lb/k,0,2]],bosses:[[Lb,0,10,2]]},
   {id:'bt',name:'Short bar to the tracer',role:'link',layer:1,shape:S=>S.bar(Lb/k,9,[0,Lb/k])},{id:'tc',name:'Short bar with tracer point',role:'driver',layer:2,shape:S=>S.bar(Lb/k,9,[0,Lb/k]),bosses:[[0,0,10,2]]}],
  ground:[[O[0],O[1],0,0]],
  pose(g){const A=g.A,B=[O[0]+(A[0]-O[0])/k,O[1]+(A[1]-O[1])/k],Cc=[A[0]+(g.P[0]-A[0])/k,A[1]+(g.P[1]-A[1])/k],an=(p,q)=>Math.atan2(q[1]-p[1],q[0]-p[0]);
   return{oa:[O[0],O[1],an(O,A)],ap:[A[0],A[1],an(A,g.P)],bt:[B[0],B[1],an(B,g.T)],tc:[g.T[0],g.T[1],an(g.T,Cc)]};},
  hardware:['A pencil stub (or a 4 mm drinking straw with a pen refill) on the pencil peg.'],drive:'Guide the tracer peg round a figure; the pencil peg draws it 2.4 times larger.'});}

/* 248 union coupling: two pipe ends drawn together by a nut */
{const sim=window.MB.SIMS[248],r=7,ri=4.5,H=U.BT+16,s=0.3;
 const pipeA=K.lathe([[ri,0],[r,0],[r,30],[r+3,30],[r+3,36],[ri,36]],48),pipeB=K.lathe([[ri,0],[r+3.5,0],[r+3.5,4],[r,4],[r,34],[ri,34]],48),nut=K.prism(K.circle(14,6,0,0,PI/6),[K.circle(r+3.8,48)],0,12);
 PK.defS(248,{summary:'A union joint for pipes: one pipe end has a collar, the other a threaded shoulder; the nut runs over the collar and screws onto the shoulder, drawing the faces together without turning either pipe.',sim:248,cam:{yaw:0.5,pitch:0.35},
  base:()=>[U.plate(-46,-14,46,14),U.wall(-34,0,'x',[[0,H,r+0.3]],22,5,H+10),U.wall(34,0,'x',[[0,H,r+0.3]],22,5,H+10)],
  parts:[{id:'a',name:'Pipe end with collar',role:'frame',mesh:pipeA},{id:'b',name:'Pipe end with shoulder',role:'driven',mesh:pipeB},{id:'n',name:'Union nut (hexagon)',role:'driver',mesh:nut}],
  pose(phi,g){const gap=g.gap*s;return{a:U.at([-36-gap,0,H],[1,0,0],0,[0,0,1]),b:U.at([0,0,H],[1,0,0],0,[0,0,1]),n:U.at([-gap-2,0,H],[1,0,0],g.c*TAU*2,[0,0,1])};},
  read:(phi,g)=>g.c>0.98?'joint made':'drawing together',drive:'Screw the nut on: it pulls the two pipe faces together.'});}

/* 249 ball-and-socket joint */
{const sim=window.MB.SIMS[249],H=U.BT+24,R=9;
 const ball=K.merge(K.lathe(Array.from({length:17},(_,i)=>{const t=-PI/2+i*PI/16;return[Math.max(0.01,R*Math.cos(t)),R*Math.sin(t)+R];}),48),K.lathe([[0.01,R*2-1],[4.5,R*2-1],[4.5,R*2+50],[0.01,R*2+50]],32));
 const cup=K.merge(K.lathe([[R+0.4,0],[R+3,0],[R+3,R+3],[R*0.75,R*1.55],[R*0.75,R*1.45],[R+0.4,R+0.5]],48),K.lathe([[4.5,-30],[7,-30],[7,0],[4.5,0]],32));
 PK.defS(249,{summary:'A ball-and-socket joint for tubing: a ball on the end of one tube sits in a cup on the other, the lip closing over the ball’s middle, so the tube can swing and point in any direction while the joint stays tight.',sim:249,cam:{yaw:0.6,pitch:0.35},
  base:()=>[U.plate(-44,-14,10,14),U.wall(-R-24,0,'x',[[0,H,7.3]],22,5,H+10)],
  parts:[{id:'c',name:'Socket cup on the fixed tube (print in two halves)',role:'frame',mesh:cup},{id:'b',name:'Tube with ball',role:'driver',mesh:ball}],
  pose(phi,g){const d=[Math.cos(g.a)*Math.cos(g.b),-Math.sin(g.a),Math.cos(g.a)*Math.sin(g.b)];return{c:U.at([-R,0,H],[1,0,0],0,[0,0,1]),b:U.at([-R*d[0],-R*d[1],H-R*d[2]],d,0,[0,0,1])};},
  read:(phi,g)=>`tube ${(g.a*180/PI).toFixed(0)}°`,drive:'Swing the tube: it turns freely in the cup.'});}

/* 250 shaft carried on the rims of two friction wheels */
{const sim=window.MB.SIMS[250],S0=[400,200],rs=40,R=110,d=rs+R,ang=0.75,A=[S0[0]-d*Math.sin(ang),S0[1]+d*Math.cos(ang)],B=[S0[0]+d*Math.sin(ang),S0[1]+d*Math.cos(ang)];
 PK.def(250,{S:0.3,summary:'Friction wheels: instead of turning in a plain bearing, the shaft rests in the angle between the rims of two large wheels. As the shaft turns, the wheels roll with it, so sliding friction becomes rolling friction.',
  parts:[{id:'wa',name:'Friction wheel',role:'driven',layer:0,qty:2,shape:S=>S.disk(R,[[0,0]],96)},{id:'s',name:'Shaft collar (on the shaft)',role:'driver',layer:0,shape:S=>S.disk(rs,[[0,0]],64),bosses:[[20,0,12,3]]}],
  ground:[[A[0],A[1],0,0],[B[0],B[1],0,0],[S0[0],S0[1],0,0]],
  pose(g){const w=-g.phi*rs/R;return{wa:[[A[0],A[1],w],[B[0],B[1],w]],s:[S0[0],S0[1],g.phi]};},drive:'Turn the shaft disk by its knob; both wheels roll the other way.'});}

/* 251 pile driver (display) */
{const sim=window.MB.SIMS[251],X=400,top=60;
 PK.def(251,{S:0.25,up:true,summary:'A pile driver: the weight is drawn up between the guides by a pair of tongs on the rope. At the top the tongs’ upper arms run between two wedges, which squeeze them and open the jaws, so the weight drops onto the pile.',
  parts:[{id:'w',name:'Weight (ram)',role:'driven',layer:1,shape:S=>S.rect(100,70,0,35,[])},{id:'t',name:'Tongs (pair)',role:'link',layer:2,qty:2,shape:S=>S.lever([[0,0,6],[0,40,6]],[[0,0]])},{id:'pl',name:'Pile',role:'driven',layer:1,shape:S=>S.rect(40,90,0,45,[])}],
  fixed:[{shape:S=>S.rect(20,440,X-100,top+220),l1:2},{shape:S=>S.rect(20,440,X+100,top+220),l1:2},{shape:S=>S.poly([[X-60,top+120],[X-24,top+120],[X-60,top+160]]),l1:2},{shape:S=>S.poly([[X+60,top+120],[X+24,top+120],[X+60,top+160]]),l1:2}],
  ground:[],plate:{x0:X-150,y0:top-30,x1:X+150,y1:560},
  pose(g){const yW=380-g.h*250-((g.depth%40)+40)%40,hy=g.released?top+150:yW-30,o=g.released?0.5:0;return{w:[X,yW,0],t:[[X-6,hy-10,-o],[X+6,hy-10,o]],pl:[X,452+((g.depth%40)+40)%40,0]};},drive:'Display model: lift the weight; at the top the wedges open the tongs.'});}

/* 252 slide with slanted slots moves two rollers in and out equally */
{const sim=window.MB.SIMS[252],y=270,k=0.5;
 const slot=s=>{const a=-s*Math.atan(k),c=Math.cos(a),sn=Math.sin(a);return[[-140,-10],[140,-10],[140,10],[-140,10]].map(([x,yy])=>[x*c-yy*sn,s*60+x*sn+yy*c]);};
 PK.def(252,{S:0.3,summary:'A slide with two slots slanting toward each other. Each roller is carried on a rod that can only move up and down in a guide; push the slide one way and the slanted slots draw both rollers together, pull it back and they spread apart, always by equal amounts.',
  parts:[{id:'sl',name:'Slide with two slanted slots',role:'driver',layer:1,shape:S=>({o:[[-160,-130],[160,-130],[160,-10],[330,-10],[330,10],[160,10],[160,130],[-160,130]],h:[slot(-1),slot(1)]}),bosses:[[320,0,12,3]]},
   {id:'ru',name:'Upper roller rod',role:'driven',layer:0,shape:S=>S.rect(14,160,0,0,[]),pins:[[0,74,1]]},{id:'rl',name:'Lower roller rod',role:'driven',layer:0,shape:S=>S.rect(14,160,0,0,[]),pins:[[0,-74,1]]}],
  fixed:[{shape:S=>S.rect(8,90,383,y-230),l1:0},{shape:S=>S.rect(8,90,417,y-230),l1:0},{shape:S=>S.rect(8,90,383,y+230),l1:0},{shape:S=>S.rect(8,90,417,y+230),l1:0}],
  ground:[],
  pose(g){const yy=s=>y+s*(60-g.x*k);return{sl:[400+g.x,y,0],ru:[400,yy(-1)-74,0],rl:[400,yy(1)+74,0]};},drive:'Push the slide along by its knob: both rods move in or out together.'});}

/* 253 mine-drum safety catch */
{const sim=window.MB.SIMS[253],O=[400,250],R=130;
 PK.def(253,{S:0.3,summary:'A safety catch for a mine winding drum. Two hooks pivoted on the drum are held in by springs while it turns at its proper speed. If the rope breaks and the drum runs away, centrifugal force throws the hooks out against the springs and they catch in the ratchet teeth of the fixed ring, stopping the drum.',
  parts:[{id:'d',name:'Winding drum',role:'driven',layer:0,shape:S=>S.disk(R,[[0,0]],96),pins:[[90,0,1],[-90,0,1]],bosses:[[0,-50,14,3.5]]},{id:'h',name:'Catch hook',role:'link',qty:2,layer:1,shape:S=>S.lever([[0,0,8],[56,0,8]],[[0,0]])}],
  fixed:[{shape:S=>({o:S.circle(R+40,96,O[0],O[1]),h:[Array.from({length:16*6},(_,i)=>{const a=i/(16*6)*TAU,u=(i%6)/6;const r=R+14+16*u;return[O[0]+r*Math.cos(a),O[1]+r*Math.sin(a)];}).reverse()]}),l1:1}],
  ground:[[O[0],O[1],0,0],[O[0]+90,O[1],1,1],[O[0]-90,O[1],1,1]].slice(0,1),
  pose(g){const rot=g.phi*(g.caught?0:1)*1.5,out=g.sp>0.9?1:0,o={d:[O[0],O[1],rot],h:[]};for(const s of [0,PI]){const a=rot+s;o.h.push([O[0]+90*Math.cos(a),O[1]+90*Math.sin(a),a+PI/2-0.6*out]);}return o;},
  hardware:['Two small rubber bands as the springs that hold the hooks in.'],drive:'Spin the drum fast and the hooks fly out and catch.'});}

/* 255–259 pulley rims: driving pulley with the given rim section, driven pulley and band */
for(const [n,type] of [[255,'flange'],[256,'flat'],[257,'round'],[258,'v'],[259,'notch']]){if(!window.MB.SIMS[n])continue;const Ra=24,Rb=15,h=10,H=U.BT+4,D=60;
 const prof=(R)=>{const b=PK.BORER;if(type==='flange')return[[b,0],[R+3,0],[R+3,1.5],[R,2],[R,h-2],[R+3,h-1.5],[R+3,h],[b,h]];if(type==='flat')return[[b,0],[R-1,0],[R,h/2],[R-1,h],[b,h]];
   const g=type==='round'?Array.from({length:11},(_,i)=>{const t=i/10*PI;return[R-2.6*Math.sin(t),h/2-2.6*Math.cos(t)];}):type==='v'?[[R-3,h/2]]:[[R-2.4,h/2-0.7],[R-3.4,h/2-0.7],[R-3.4,h/2+0.7],[R-2.4,h/2+0.7]];
   return[[b,0],[R,0],...(type==='round'?g:[[R,h/2-3],...g,[R,h/2+3]]),[R,h],[b,h]];};
 const beltPts=(c1,r1,c2,r2,z)=>{const dx=c2[0]-c1[0],dy=c2[1]-c1[1],d=Math.hypot(dx,dy),al=Math.acos((r1-r2)/d),th=Math.atan2(dy,dx),pts=[];
   for(let i=0;i<=24;i++){const t=th+al+(TAU-2*al)*i/24;pts.push([c1[0]+r1*Math.cos(t),c1[1]+r1*Math.sin(t),z]);}for(let i=0;i<=16;i++){const t=th-al+2*al*i/16;pts.push([c2[0]+r2*Math.cos(t),c2[1]+r2*Math.sin(t),z]);}return pts;};
 const pul=R=>K.lathe(prof(R),64),band=type==='flat'||type==='flange'?{w:6,t:1}:{w:2.4,t:2.4};
 PK.defS(n,{summary:({flange:'A flanged pulley: flanges at both edges keep a flat belt from running off.',flat:'A plain flat pulley, its face slightly crowned (higher in the middle) so the flat belt keeps to the centre by itself.',round:'A pulley with a round groove for a round band or cord.',v:'A V-groove pulley: the round band wedges into the V and grips harder the more it is pulled.',notch:'A V pulley whose groove is notched at the bottom, so the band bears on the sides and grips even better.'})[type],cam:{yaw:0.5,pitch:0.6},
  base:()=>[U.plate(-Ra-10,-Ra-10,D+Rb+10,Ra+10),K.cyl(PK.PINR,U.BT,H+h+2,24,0,0),K.cyl(PK.PINR,U.BT,H+h+2,24,D,0),K.cyl(4.6,U.BT,H,24,0,0),K.cyl(4.6,U.BT,H,24,D,0)],
  parts:[{id:'a',name:'Driving pulley (this rim section)',role:'driver',mesh:K.merge(pul(Ra),K.cyl(2.6,h,h+12,20,Ra-8,0))},{id:'b',name:'Driven pulley',role:'driven',mesh:pul(Rb)},{id:'cap',name:'Pin cap',role:'small',qty:2,mesh:U.capMesh()}],
  belts:(phi)=>{const fl=type==='flat'||type==='flange',ra=Ra-(fl?-0.6:1.6),rb=Rb-(fl?-0.6:1.6);return[{pts:beltPts([0,0],ra,[D,0],rb,H+h/2),r:fl?0.9:1.3,closed:true,travel:phi*ra}];},
  pose(phi){return{a:K.M4.mul(K.M4.T(0,0,H),K.M4.Rz(-phi)),b:K.M4.mul(K.M4.T(D,0,H),K.M4.Rz(-phi*Ra/Rb)),cap:[K.M4.T(0,0,H+h+0.5),K.M4.T(D,0,H+h+0.5)]};},
  hardware:[type==='flat'||type==='flange'?'A flat band (a strip of rubber cut from an old inner tube) round both pulleys.':'A round rubber band or a loop of cord round both pulleys.'],drive:'Turn the driving pulley by its knob.'});}

/* 254 chain and sprockets (22 and 14 teeth) */
{const sim=window.MB.SIMS[254],A=[240,260],B=[570,260];
 PK.def(254,{S:0.3,summary:'A chain and two sprocket wheels of 22 and 14 teeth. The teeth enter the links one by one, so the drive cannot slip, and the small sprocket turns 22/14 times as fast as the large one.',
  parts:[{id:'a',name:'Sprocket, 22 teeth',role:'driver',layer:0,shape:S=>S.gear(70,22),bosses:[[0,-40,14,3.5]]},{id:'b',name:'Sprocket, 14 teeth',role:'driven',layer:0,shape:S=>S.gear(46,14)}],
  ground:[[A[0],A[1],0,0],[B[0],B[1],0,0]],
  pose(g){return{a:[A[0],A[1],g.phi],b:[B[0],B[1],g.phi*70/46]};},hardware:['A loop of small roller chain (or beaded cord) round both sprockets.'],drive:'Turn the large sprocket by its knob.'});}

/* 260 differential screw worked through two wheels of 20 and 21 teeth */
{const sim=window.MB.SIMS[260],m=1.25,Za=20,Zb=21,Zp=8,pitch=4,rs=4,Ls=80,Hs=U.BT+18,Ra=m*Za/2,Rb=m*Zb/2,rp=m*Zp/2,Hc=Hs+Ra+rp,xa=-Ls/2+6,xn0=4;
 const screw=U.worm(rs,pitch,Ls,{depth:1}),nut=K.merge(U.nut(rs,pitch,14,16,16,{depth:1}));
 PK.defS(260,{summary:'A differential screw worked by gearing: a countershaft carries two equal 8-tooth pinions. One drives a 20-tooth wheel fixed on the screw, the other a 21-tooth wheel on the nut. Screw and nut both turn, the nut a little slower, so it creeps along the screw by only one twenty-first of the pitch per turn.',cam:{yaw:0.5,pitch:0.4},
  base:()=>[U.plate(-Ls/2-12,-14,Ls/2+12,14),U.wall(-Ls/2-4,0,'x',[[0,Hs],[0,Hc]],18,5,Hc+8),U.wall(Ls/2+4,0,'x',[[0,Hs],[0,Hc]],18,5,Hc+8)],
  parts:[{id:'s',name:'Screw',role:'driver',mesh:screw},{id:'ga',name:'Wheel, 20 teeth (on the screw)',role:'driver',mesh:U.spur(Ra,Za,5)},{id:'n',name:'Nut',role:'driven',mesh:nut},{id:'gb',name:'Wheel, 21 teeth (on the nut, glue)',role:'driven',mesh:U.spur(Rb,Zb,5,{bore:'round',holes:[]})},
   {id:'pa',name:'Pinion, 8 teeth',role:'link',mesh:U.spur(rp,Zp,5)},{id:'pb',name:'Long pinion, 8 teeth',role:'link',mesh:U.spur(rp,Zp,26)},{id:'cs',name:'Countershaft',mesh:U.shaft(Ls+20)},{id:'k',name:'Hand crank',role:'driver',mesh:U.crank()}],
  pose(phi,g){const xn=xn0+g.x*0.3,cs=-g.ts*Za/Zp;return{s:U.at([-Ls/2,0,Hs],[1,0,0],g.ts,[0,0,1]),ga:U.at([xa,0,Hs],[1,0,0],g.ts,[0,0,1]),n:K.M4.mul(K.M4.T(xn,0,Hs),K.M4.mul(K.M4.Ry(PI/2),K.M4.Rz(g.tn))),gb:U.at([xn+7,0,Hs],[1,0,0],g.tn,[0,0,1]),
   pa:U.at([xa,0,Hc],[1,0,0],cs+PI/Zp,[0,0,1]),pb:U.at([xn0-6,0,Hc],[1,0,0],cs,[0,0,1]),cs:U.shaftAt([0,0,Hc],[1,0,0],cs),k:U.at([-Ls/2-12,0,Hc],[-1,0,0],-cs,[0,0,1])};},
  read:(phi,g)=>`nut travel ${(g.x*0.3).toFixed(2)} mm`,drive:'Turn the crank: screw and nut both turn and the nut creeps along.'});}

/* 261 disk and cord lift (display) */
{const sim=window.MB.SIMS[261],O=[300,180],Pl=[520,120];
 PK.def(261,{S:0.3,up:true,summary:'A cord from a pin on the turning disk runs over a pulley to a weight. As the pin goes round, the weight is drawn up and let down again, the up stroke taking longer than the down stroke because of where the pulley stands.',
  parts:[{id:'d',name:'Disk with cord pin',role:'driver',layer:0,shape:S=>S.disk(90,[[0,0]],72),bosses:[[70,0,12,2.6],[-40,30,14,3.5]]},{id:'p',name:'Pulley',role:'link',layer:0,shape:S=>S.disk(40,[[0,0]],48)},{id:'w',name:'Weight',role:'driven',layer:0,shape:S=>S.rect(60,50,0,25,[])}],
  ground:[[O[0],O[1],0,0],[Pl[0],Pl[1],0,0]],
  pose(g){return{d:[O[0],O[1],g.phi],p:[Pl[0],Pl[1],-g.h*4],w:[560,420-g.h*150-25,0]};},hardware:['A length of thread from the disk pin over the pulley to the weight.'],drive:'Turn the disk by its knob.'});}

/* 264 hundred-and-one counter: one worm, wheels of 100 and 101 teeth side by side */
{const m=0.8,p=PI*m,rp=4,Za=100,Zb=101,Ra=m*Za/2,Rb=m*Zb/2,hw=4,Hw=U.BT+10,Hc=Hw+rp+Ra,lam=Math.atan(p/(TAU*rp));
 PK.defS(264,{summary:'One worm drives two wheels side by side, one of 100 teeth and one of 101. Each turn of the worm moves each wheel one tooth, so the 100-wheel gains on the 101-wheel by one tooth in every hundred turns of the worm, and a full turn every 10,100 turns: a long-range counter.',cam:{yaw:0.9,pitch:0.3},
  base:()=>[U.plate(-30,-16,30,26),U.wall(-18,0,'x',[[0,Hw]],16,5,Hw+6),U.wall(18,0,'x',[[0,Hw]],16,5,Hw+6),U.wall(0,-10,'y',[[0,Hc]],18,5,Hc+8),U.wall(0,16,'y',[[0,Hc]],18,5,Hc+8)],
  parts:[{id:'wm',name:'Worm',role:'driver',mesh:U.worm(rp,p,4*p,{depth:0.8})},{id:'a',name:'Wheel, 100 teeth (with pointer)',role:'driven',mesh:K.merge(U.helical(Ra,Za,hw,-hw*Math.tan(lam)/Ra,{seg:2}),K.box(4,Ra*0.8,hw,hw+1.5,0,Ra*0.4))},{id:'b',name:'Wheel, 101 teeth (loose on the shaft)',role:'driven',mesh:U.helical(Rb,Zb,hw,-hw*Math.tan(lam)/Rb,{seg:2,bore:'round'})},
   {id:'sw',name:'Worm shaft',mesh:U.shaft(50)},{id:'sh',name:'Wheel shaft',mesh:U.shaft(32)},{id:'k',name:'Hand crank',role:'driver',mesh:U.crank()}],
  pose(phi){return{wm:U.at([-2*p,0,Hw],[1,0,0],phi,[0,0,1]),a:U.at([0,-hw-0.3,Hc],[0,1,0],phi/Za,[0,0,-1]),b:U.at([0,0.3,Hc],[0,1,0],phi/Zb,[0,0,-1]),sw:U.shaftAt([-4,0,Hw],[1,0,0],phi),sh:U.shaftAt([0,3,Hc],[0,1,0],phi/Za),k:U.at([-26,0,Hw],[-1,0,0],-phi,[0,0,1])};},
  read:phi=>`worm ${(phi/TAU).toFixed(0)} turns · gain ${(phi/TAU*(1/100-1/101)).toFixed(4)} turn`,drive:'Turn the crank and watch the pointer creep against the second wheel.'});}

/* 265 cone and sliding friction roller */
{const sim=window.MB.SIMS[265],s=0.3,L=500*s,r0=40*s,r1=140*s,Rr=30*s,Hc=U.BT+r1+4;
 const cone=K.loftS(Array.from({length:7},(_,k)=>{const z=L*k/6,r=r0+(r1-r0)*k/6;return{o:K.circle(r,96).map(q=>[q[0],q[1],z]),h:[U.octa(U.SH+0.12).map(q=>[q[0],q[1],z])]};}));
 PK.defS(265,{summary:'A cone drum and a friction roller that slides along its own shaft parallel to the cone’s surface. Near the small end the roller turns slowly, near the large end fast: slide it to set any speed in between.',params:sim.params,cam:{yaw:0.4,pitch:0.4},
  base:()=>[U.plate(-12,-Hc+U.BT-6,L+12,Rr+30),U.wall(-6,0,'x',[[0,Hc]],18,5,Hc+6),U.wall(L+6,0,'x',[[0,Hc]],18,5,Hc+6)],
  parts:[{id:'c',name:'Cone drum',role:'driver',mesh:cone},{id:'r',name:'Friction roller (rubber band tyre)',role:'driven',mesh:K.prism(K.circle(Rr,48),[U.octa(U.SH+0.12)],0,6)},{id:'sc',name:'Cone shaft',mesh:U.shaft(L+30)},{id:'k',name:'Hand crank',role:'driver',mesh:U.crank()}],
  pose(phi,g,sm,P){const x=(P&&P.x!==undefined?P.x:0.5),z=L*x,rc=r0+(r1-r0)*x,sl=Math.atan2(r1-r0,L),ctr=[z-Rr*Math.sin(sl),0,Hc+(rc+Rr)*Math.cos(sl)*0+rc+Rr];
   return{c:U.at([0,0,Hc],[1,0,0],phi,[0,0,1]),r:K.M4.mul(K.M4.T(z-3,0,Hc+rc+Rr),K.M4.mul(K.M4.Ry(PI/2),K.M4.Rz(-phi*rc/Rr))),sc:U.shaftAt([L/2,0,Hc],[1,0,0],phi),k:U.at([-14,0,Hc],[-1,0,0],-phi,[0,0,1])};},
  read:(phi,g,sm,P)=>{const x=(P&&P.x!==undefined?P.x:0.5);return`roller ${((40+100*x)/30).toFixed(2)} × cone`;},hardware:['The roller’s own shaft and sliding bearing are left to the builder; hold it on the cone by hand to try the speeds.'],drive:'Turn the crank and press the roller on the cone at different places.'});}

/* 267 one-way friction pulley: eccentric arms grip the rim one way */
{const sim=window.MB.SIMS[267],O=[400,270];
 PK.def(267,{S:0.3,summary:'A one-way friction pulley: three arms on the driving hub carry eccentric shoes that just touch the inside of the rim. Turned one way, the shoes wedge against the rim and carry the pulley with them; turned back, they swing clear and slip, so the pulley is driven one way only.',
  parts:[{id:'rim',name:'Pulley rim',role:'driven',layer:0,shape:S=>({o:S.circle(160,120),h:[S.circle(130,120)]}),bosses:[[145,0,8,2.5]]},{id:'hub',name:'Hub with three arms',role:'driver',layer:1,shape:S=>S.lever([[0,0,22],[80,0,10],[80*Math.cos(TAU/3),80*Math.sin(TAU/3),10],[80*Math.cos(2*TAU/3),80*Math.sin(2*TAU/3),10]],[[0,0]]),pins:[0,1,2].map(k=>[80*Math.cos(k*TAU/3),80*Math.sin(k*TAU/3),1]),bosses:[[45,0,14,3]]},
   {id:'sh',name:'Eccentric shoe',role:'link',qty:3,layer:0,shape:S=>({o:Array.from({length:40},(_,i)=>{const t=i/40*TAU;return[28+30*Math.cos(t),14*Math.sin(t)];}),h:[S.hole(0,0)]})}],
  fixed:[],ground:[[O[0],O[1],0,1]],
  pose(g,s){const o={rim:[O[0],O[1],s.w],hub:[O[0],O[1],g.a],sh:[]};for(let k=0;k<3;k++){const a=g.a+k*TAU/3;o.sh.push([O[0]+80*Math.cos(a),O[1]+80*Math.sin(a),a+(g.grip?0.15:0.4)]);}return o;},
  hardware:['Small rubber bands to pull the shoes outward against the rim.'],drive:'Rock the hub back and forth: the rim goes round one way only.'});}

/* 269 frame with part-toothed racks, upper and lower in turn */
{const sim=window.MB.SIMS[269],G=sim.geo(),P=sim.P0,rp=sim.rp,m=sim.m,H=rp+1.25*m;
 const segs=[];for(let k=0;k<sim.nseg;k++){const top=k%2===0,xa=k*G.L,xb=xa+G.L;segs.push({top,sh:S=>{const R=S.rack(xa,xb,m,8,{c0:G.p/2,down:top});return{o:R.o.map(([x,y])=>[x,top?y-rp:y+rp]),h:[]};}});}
 PK.def(269,{S:0.3,summary:'The frame moves steadily one way. Its racks are cut in short lengths, upper and lower in turn, so the spur gear between them is turned one way by an upper length and back again by the next lower one: steady straight motion gives the gear an alternating rotation.',
  parts:[{id:'f',name:'Frame',role:'driver',layer:0,shape:S=>({o:[[-rp-40,-H-30],[G.T+rp+40,-H-30],[G.T+rp+40,H+30],[-rp-40,H+30]],h:[[[-rp-30,-H],[G.T+rp+30,-H],[G.T+rp+30,H],[-rp-30,H]]]})},
   ...segs.map((q,k)=>({id:'r'+k,name:`${q.top?'Upper':'Lower'} part-rack ${Math.floor(k/2)+1} (glue in the frame)`,role:'driver',layer:0,shape:q.sh})),{id:'g',name:'Spur gear, 20 teeth',role:'driven',layer:0,shape:S=>S.gear(rp,20),bosses:[[0,25,14,3]]}],
  ground:[[P[0],P[1],0,0]],fixed:[{shape:S=>S.rect(200,8,P[0],P[1]-H-38),l1:0},{shape:S=>S.rect(200,8,P[0],P[1]+H+38),l1:0}],
  pose(g){const X0=P[0]-g.s,o={f:[X0,P[1],0],g:[P[0],P[1],g.a]};for(let k=0;k<sim.nseg;k++)o['r'+k]=[X0,P[1],0];return o;},drive:'Push the frame steadily along: the gear turns one way, then the other.'});}

/* 270 roller bearing with a cage */
{const sim=window.MB.SIMS[270],O=[400,260];
 PK.def(270,{S:0.3,summary:'A roller bearing: eight rollers run between the shaft collar and the fixed outer ring, kept apart by a cage. When the shaft turns the rollers roll instead of sliding, and the cage carries them round at about a third of the shaft’s speed.',
  parts:[{id:'s',name:'Shaft collar',role:'driver',layer:1,shape:S=>S.disk(60,[[0,0]],72),bosses:[[30,0,14,3.5]]},{id:'r',name:'Roller',role:'link',qty:8,layer:1,shape:S=>S.disk(28,[[0,0]],48)},
   {id:'c',name:'Cage ring with roller pins',role:'link',layer:0,shape:S=>({o:S.circle(110,96),h:[S.circle(72,96)]}),pins:Array.from({length:8},(_,k)=>[91*Math.cos(k*TAU/8),91*Math.sin(k*TAU/8),1])}],
  fixed:[{shape:S=>({o:S.circle(170,120,O[0],O[1]),h:[S.circle(120,120,O[0],O[1])]}),l1:1}],ground:[[O[0],O[1],1,1]],
  pose(g){const o={s:[O[0],O[1],g.phi],c:[O[0],O[1],g.c],r:[]};for(let k=0;k<8;k++){const a=g.c+k*TAU/8;o.r.push([O[0]+91*Math.cos(a),O[1]+91*Math.sin(a),g.rs+a]);}return o;},drive:'Turn the shaft collar by its knob and watch the rollers and cage.'});}

/* 247 sounding weight released on striking the bottom (display) */
{const sim=window.MB.SIMS[247],X=400;
 PK.def(247,{S:0.3,up:true,summary:'A deep-sea sounding rod: a heavy weight hangs from the rod by a catch while the line runs out. When the rod strikes the sea bed the catch trips, the weight is left on the bottom, and the light rod (with a sample of the bottom in its tube) is hauled back up.',
  parts:[{id:'r',name:'Sounding rod',role:'driven',layer:0,shape:S=>S.rect(16,100,0,-30,[])},{id:'w',name:'Weight (slides off the rod)',role:'driven',layer:1,shape:S=>({o:[[-30,0],[30,0],[30,40],[-30,40]],h:[[[-9,6],[9,6],[9,34],[-9,34]]]})}],
  fixed:[{shape:S=>S.rect(700,30,400,435),l1:1}],ground:[],plate:{x0:40,y0:20,x1:760,y1:470},
  pose(g){return{r:[X,g.y,0],w:g.rel?[X,400,0]:[X,g.y+20,0]};},drive:'Display model: the weight goes down on the rod and stays on the bottom.'});}

})();
