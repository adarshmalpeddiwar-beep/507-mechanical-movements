(function(){const K=window.CAD.K,PK=window.PK,M4=K.M4,PI=Math.PI,TAU=2*PI;const mod=(a,n)=>((a%n)+n)%n;const ropeThru=(...a)=>window.MB.ropeThru(...a);
/* ===== printable models 361–400 ===== */
const U=PK.U,{Sh}=PK,L=PK.Lib;PK._S(0.3);const pxPoly=L.pxPoly;
const armPts=(A,B,r)=>K.hull([...K.circle(r,20,A[0],A[1]),...K.circle(r,20,B[0],B[1])]);
const ring=(ro,ri,z0,z1,n=64)=>K.prism(K.circle(ro,n),[K.circle(ri,n)],z0,z1);
const alongX=m=>K.xf(m,M4.Ry(PI/2));/* a part modelled along z, turned to lie along +x */

/* 361 · pin clutch */
{const S=0.3,zh=U.BT+30,X=x=>(x-400)*S,rp=44*S;
 PK.defS(361,{summary:'A pin clutch. The belt pulley runs loose on the shaft and carries a pin on its face; a collar fixed to the shaft carries another pin. The forked lever slides the pulley along the shaft until its pin reaches into the path of the collar’s pin; as soon as the pulley pin comes round to it, the shaft is picked up. Slide the pulley back and the shaft stops.',cam:{yaw:0.55,pitch:0.35},
  base:()=>[U.plate(X(150),-30,X(700),30),U.wall(X(180),0,'x',[[0,zh,U.SHB]],16,5),U.wall(X(660),0,'x',[[0,zh,U.SHB]],16,5),K.box(8,6,U.BT,zh+54,X(300),-20),K.box(8,8,zh+48,zh+54,X(300),-15)],
  parts:[{id:'sh',name:'Shaft',role:'driven',mesh:U.shaft(X(700)-X(150))},
   {id:'p',name:'Loose belt pulley with face pin and hub groove',role:'driver',mesh:K.merge(alongX(ring(24,U.SHB,0,30)),alongX(ring(8,U.SHB,-14,-10)),alongX(ring(5.5,U.SHB,-10,-5)),alongX(ring(8,U.SHB,-5,0)),alongX(K.cyl(2,30,39,16,0,rp)))},
   {id:'c',name:'Collar with pin (fixed to the shaft)',role:'driven',mesh:K.merge(alongX(K.prism(K.circle(17,48),[U.octa(U.SH+0.12)],0,12)),alongX(K.cyl(2,-9,0,16,0,rp)))},
   {id:'lv',name:'Lever with a tooth in the hub groove',role:'link',mesh:K.merge(K.box(6,4,-52,0,0,0),K.box(4,9,-52,-46,0,5))}],
  pose(phi,g){const o=X(290+30*g.sl);return{sh:M4.mul(M4.T((X(700)+X(150))/2,0,zh),M4.mul(M4.Rx(g.a),M4.T(0,0,-U.SH*Math.cos(PI/8)))),p:M4.mul(M4.T(o,0,zh),M4.Rx(g.phi)),c:M4.mul(M4.T(X(500),0,zh),M4.Rx(g.a)),lv:M4.mul(M4.T(X(300),-12,zh+50),M4.Ry(-Math.asin(Math.max(-1,Math.min(1,(o-7.5-X(300))/49)))))};},
  read:(phi,g)=>g.on?(g.eng?'engaged':'slid in, waiting'):'slid out',hardware:['A rubber band as the belt, if you want to drive the pulley.'],drive:'Turn the pulley and slide it along with the lever: the shaft is picked up when the pins meet.'});}

/* 362 · slanted-groove traverse */
{const sim=window.MB.SIMS[362],S=0.3,A=sim.A*S,R=sim.Rd*S,Xp=(sim.Xp-400)*S,zh=U.BT+R+8,tau=Math.atan2(A,R),Ld=(2*sim.A+110)*S;
 const ridge=dx=>K.xf(K.prism(K.circle(R+3.5,72),[K.circle(R-1,72)],-1,1),M4.mul(M4.T(dx,0,0),M4.Ry(PI/2+tau)));
 PK.defS(362,{summary:'A drum on a shaft that is free to slide has an endless groove cut slantwise round it, and a fixed pin stands in the groove. As the shaft turns, driven through a long pulley on a feather key, the slanted groove screws the drum one way for half a turn and back for the other half, giving the shaft a to-and-fro traverse once per turn.',cam:{yaw:0.5,pitch:0.35},
  base:()=>[U.plate(-125,-34,115,34),U.wall(-110,0,'x',[[0,zh,U.SHB+0.3]],14,5),U.wall(-55,0,'x',[[0,zh,U.SHB+0.3]],14,5),U.wall(100,0,'x',[[0,zh,U.SHB+0.3]],14,5),K.box(8,8,U.BT,zh+R+14,Xp,-R-10),K.box(8,R+12,zh+R+10,zh+R+16,Xp,-(R+10)/2),K.cyl(1.6,zh+R-4,zh+R+11,16,Xp,0)],
  parts:[{id:'s',name:'Sliding shaft with grooved drum (two slanted ridges form the groove)',role:'driven',mesh:K.merge(U.shaft(200),alongX(K.prism(K.circle(R,72),[U.octa(U.SH+0.12)],-Ld/2,Ld/2)),ridge(-3.8/Math.cos(tau)),ridge(3.8/Math.cos(tau)))},
   {id:'p',name:'Long driving pulley (keyed, the shaft slides through it)',role:'driver',mesh:alongX(K.prism(K.circle(15,48),[U.octa(U.SH+0.15)],-13,13))}],
  pose(phi,g){const x=g.x*S;return{s:M4.mul(M4.T(Xp+x,0,zh),M4.Rx(phi)),p:M4.mul(M4.T(-80,0,zh),M4.Rx(phi))};},
  read:(phi,g)=>`shaft ${(g.x*S).toFixed(1)} mm`,drive:'Turn the long pulley: the drum and shaft slide back and forth once per turn.'});}

/* 365 · skew rollers drive a rod along while turning it */
{const S=0.3,zr=U.BT+16,rr=8,sk=0.4;
 const roller=()=>K.merge(K.prism(K.circle(rr,40),[K.circle(1.8,16)],-7,7));
 PK.defS(365,{summary:'Two rollers stand either side of a rod with their axles skewed to it, one leaning each way. As they turn, the rim of each roller pushes the rod partly along and partly round, so the rod is fed forward and turned at the same time, as in a bar-straightening or wire-feeding machine.',cam:{yaw:0.6,pitch:0.5},
  base:()=>[U.plate(-60,-30,60,30),...[-1,1].map(s=>K.xf(K.cyl(1.7,-14,14,16),M4.mul(M4.T(0,s*(rr+3.2),zr),M4.Rx(s*sk)))),...[-1,1].map(s=>K.box(10,6,U.BT,zr-9,0,s*(rr+3.2))),K.box(8,6,U.BT,zr-3,-50,0),K.box(8,6,U.BT,zr-3,50,0)],
  parts:[{id:'r',name:'Rod',role:'driven',mesh:alongX(K.cyl(3,-45,45,24))},{id:'w',name:'Skewed roller',role:'driver',qty:2,mesh:roller()}],
  pose(phi,g){const x=((g.x%300)-150)*S*0.25;return{r:M4.mul(M4.T(x,0,zr),M4.Rx(g.rot)),w:[-1,1].map(s=>M4.mul(M4.T(0,s*(rr+3.2),zr),M4.mul(M4.Rx(s*sk),M4.Rz(s*phi*2))))};},
  read:()=>'the rod advances and turns',drive:'Turn the rollers: the rod creeps along and spins.'});}

/* 366 · drill press: bevel gearing, sliding spindle, lever feed */
{const sim=window.MB.SIMS[366],S=0.3,Z=y=>U.BT+(480-y)*S,zw=Z(150),d1=Math.atan(2),d2=PI/2-d1,R1=21,R2=10.5,apz=zw+R1/Math.tan(d1),F0=(sim.F[0]-sim.X)*S,F1=Z(sim.F[1]);
 PK.defS(366,{summary:'A drill press. A bevel pinion on the driving shaft turns a bevel wheel whose bore is keyed to the drill spindle; the spindle slides up and down through the wheel while it turns. A lever pivoted on the frame bears on a collar on the spindle, and drawing it down (by the treadle) feeds the drill into the work.',cam:{yaw:0.6,pitch:0.25},
  base:()=>[U.plate(-48,-30,110,30),K.box(10,16,U.BT,zw-0.5,-42,0),K.box(42,12,zw-6,zw-0.5,-21,0),K.prism(K.circle(10,32),[K.circle(U.SH+0.8,24)],zw-6,zw-0.5),U.wall(45,0,'x',[[0,apz,U.SHB]],14,5),K.box(70,40,U.BT,12,0,0),K.box(30,24,12,20,0,0),K.box(6,6,U.BT,F1+4,F0,-8),K.xf(K.cyl(1.6,-6,4,16),M4.mul(M4.T(F0,0,F1),M4.Rx(PI/2)))],
  parts:[{id:'w',name:'Bevel wheel, 28 teeth (keyed bore)',role:'driven',mesh:U.bevel(R1,28,d1,6)},
   {id:'pn',name:'Bevel pinion on the driving shaft, with pulley',role:'driver',mesh:K.merge(U.bevel(R2,14,d2,6),K.prism(U.octa(U.SH),[],-40,0),K.xf(K.lathe([[U.SH,0],[12,0],[12,1],[10,2],[12,3],[12,4],[U.SH,4]],40),M4.T(0,0,-44)))},
   {id:'sp',name:'Drill spindle with collar and point',role:'driven',mesh:K.merge(K.prism(U.octa(U.SH),[],0,95),K.lathe([[0.01,-9],[U.SH,0],[0.01,0]],12),K.prism(K.circle(5,24),[],14,18))},
   {id:'lv',name:'Feed lever',role:'link',mesh:K.xf(K.prism(armPts([0,0],[-F0,0],4.5),[K.circle(1.8,16),K.circle(5.6,20,-F0,0)],-2,2),M4.Rx(PI/2))}],
  pose(phi,g){const dz=g.d*S,zc=zw-70-dz+20,th=Math.asin((zc-F1)/F0);return{w:M4.mul(M4.T(0,0,zw),M4.Rz(phi)),pn:U.at([R2/Math.tan(d2),0,apz],[-1,0,0],-phi*2),sp:M4.mul(M4.T(0,0,zw-70-dz),M4.Rz(phi)),lv:M4.mul(M4.T(F0,0,F1),M4.Ry(th))};},
  read:(phi,g)=>`drill fed ${(g.d*S).toFixed(1)} mm`,drive:'Turn the pulley to drive the drill; press the lever down to feed it.'});}

/* 367 · parallel ruler with a scale for spacing lines */
{const y0=380,La=140;
 const rule=(scale)=>S=>({o:[[-110,-14],[390,-14],[390,14],[-110,14]],h:[S.hole(0,0),S.hole(280,0)]});
 const scaleMesh=()=>K.merge(PK.ext(rule()(Sh),0,PK.TH),...Array.from({length:20},(_,k)=>PK.ext({o:[[-100+k*24-1.5,-14],[-100+k*24+1.5,-14],[-100+k*24+1.5,-14+(k%5?6:11)],[-100+k*24-1.5,-14+(k%5?6:11)]],h:[]},PK.TH,PK.TH+0.6)));
 PK.def(367,{S:0.3,summary:'A parallel ruler with a scale along its lower rule. Two equal swinging arms make a parallelogram, so the upper rule stays parallel; the arm’s end against the scale shows how far the rule has been opened, so a set of lines can be ruled at equal spacings.',
  parts:[{id:'lo',name:'Lower rule with scale',role:'frame',layer:0,mesh:scaleMesh()},{id:'ar',name:'Swinging arm',role:'link',qty:2,layer:1,shape:S=>S.bar(La,12)},{id:'up',name:'Upper rule',role:'driver',layer:2,shape:rule()}],
  plate:{x0:130,y0:y0-La-50,x1:690,y1:y0+40},
  pose(g){const d=[La*Math.cos(g.a),La*Math.sin(g.a)];return{lo:[260,y0,0],ar:[[260,y0,g.a],[540,y0,g.a]],up:[260+d[0],y0+d[1],0]};},
  hardware:['Four short pins (2 mm × 14 mm, or filament) for the arm joints.'],drive:'Hold the lower rule and swing the upper one open, reading the spacing on the scale.'});}

/* 368 · spiral marker: gears turn the cylinder while the carriage's point travels along it */
{const S=0.25,X=x=>(x-400)*S,R=80*S,zc=U.BT+R+10,Lc=400*S;
 PK.defS(368,{summary:'Marking a spiral (helix) on a cylinder: a train of gears turns the cylinder while a rack, geared to the same train, carries the marking point steadily along it. One turn of the cylinder moves the point a fixed distance, so the line it draws is an even screw thread.',cam:{yaw:0.5,pitch:0.4},
  base:()=>[U.plate(X(100),-30,X(700),36),U.wall(X(180),0,'x',[[0,zc,U.SHB]],14,5),U.wall(X(620),0,'x',[[0,zc,U.SHB]],14,5),K.box(6,6,U.BT,zc+R+18,X(150),30),K.box(6,6,U.BT,zc+R+18,X(650),30),K.box(X(650)-X(150)+6,8,zc+R+14,zc+R+18,(X(150)+X(650))/2,28)],
  parts:[{id:'c',name:'Cylinder on its arbor, with gear',role:'driven',mesh:K.merge(alongX(K.prism(K.circle(R,72),[U.octa(U.SH+0.12)],X(200),X(600))),K.xf(U.shaft(X(660)-X(140)),M4.T(0,0,-U.SH*Math.cos(PI/8))),K.xf(alongX(U.spur(9,12,4)),M4.T(X(150),0,0)),K.xf(U.crank(10,3),M4.mul(M4.T(X(140)-1,0,0),M4.Ry(-PI/2))))},
   {id:'k',name:'Carriage with marking point',role:'driver',mesh:K.merge(K.box(10,14,zc+R+18,zc+R+24,0,25),K.box(4,4,zc+R+1,zc+R+20,0,18),K.box(4,20,zc+R+16,zc+R+20,0,26))}],
  pose(phi,g){return{c:M4.mul(M4.T(0,0,zc),M4.Rx(g.t)),k:M4.T(X(g.P[0]),-18,0)};},
  read:(phi,g)=>`cylinder ${(g.t/TAU).toFixed(2)} turns`,drive:'Turn the cylinder: the point moves along it, marking a screw line.'});}

/* 369 · cycloidal pendulum: the cord wraps on cycloidal cheeks */
{const sim=window.MB.SIMS[369],Sp=sim.S,a=sim.a,z=PK.zl(0)+2;
 const cheek=s=>{const o=[];for(let i=0;i<=40;i++){const u=i/40*PI;o.push([Sp[0]+s*a*(u-Math.sin(u)),Sp[1]+a*(1-Math.cos(u))]);}o.push([Sp[0]+s*(a*PI+10),Sp[1]+2*a],[Sp[0]+s*(a*PI+10),Sp[1]-14],[Sp[0],Sp[1]-14]);return s>0?o.reverse():o;};
 const bob=t=>[Sp[0]+a*(t+Math.sin(t)),Sp[1]+4*a-a*(1-Math.cos(t))];
 PK.def(369,{S:0.35,up:true,summary:'Huygens’s cycloidal pendulum. The cord hangs between two cheeks curved as cycloids; as the bob swings, the cord wraps on one cheek and shortens, and the bob is made to move on a cycloid itself. On that curve every swing, large or small, takes exactly the same time.',
  parts:[{id:'b',name:'Bob',role:'driver',layer:0,shape:S=>S.disk(16,[])}],
  fixed:[{shape:S=>({o:cheek(1),h:[]}),l1:0},{shape:S=>({o:cheek(-1),h:[]}),l1:0}],plate:{x0:Sp[0]-a*(PI+2)-20,y0:Sp[1]-40,x1:Sp[0]+a*(PI+2)+20,y1:Sp[1]+4*a+60},
  pose(g){const B=bob(g.t);return{b:[B[0],B[1],0]};},
  ropes(g){const t=g.t,s=Math.sign(t)||1,pts=[[Sp[0],Sp[1],z]];const ut=Math.abs(t);for(let i=1;i<=16;i++){const u=ut*i/16;pts.push([Sp[0]+s*a*(u-Math.sin(u)),Sp[1]+a*(1-Math.cos(u)),z]);}const B=bob(t);pts.push([B[0],B[1],z]);return[{pts,r:0.6}];},
  hardware:['A length of thread, tied at the top between the cheeks and to the bob.'],drive:'Swing the bob: the thread wraps on the cheeks and the bob runs on a cycloid.'});}

/* 370, 393 · polishing motions: crank arm with a geared second arm carrying the polisher */
for(const [n,r1,r2,k,txt] of [[370,120,40,7.3,'A machine for polishing mirrors: the polisher is carried round the mirror by a crank, and turned by a ratchet each round so that it never repeats the same path; the strokes cover the whole face evenly.'],[393,90,50,3.7,'A lens polisher: the polishing cup is carried round by one arm while a second arm, geared to it, swings it in smaller circles, and the cup turns freely on its ball joint, so its strokes never repeat and it wears the lens evenly.']]){const sim=window.MB.SIMS[n];if(!sim)continue;const O=[400,260];
 PK.def(n,{S:0.3,summary:txt,
  parts:[{id:'m',name:n===370?'Mirror on its turntable':'Lens',role:'frame',layer:0,shape:S=>S.disk(n===370?190:150,[[0,0]],120)},{id:'a1',name:'Crank arm',role:'driver',layer:1,shape:S=>S.bar(r1,14),pins:[[r1,0,2]]},{id:'a2',name:'Second arm with polisher',role:'link',layer:2,mesh:K.merge(PK.ext(Sh.bar(r2,12,[0]),0,PK.TH),K.cyl(34*0.3,PK.TH,PK.TH+6,40,r2*0.3,0))}],
  ground:[[O[0],O[1],0,1]],
  pose(g){const t=g.t,c=[O[0]+r1*Math.cos(t),O[1]+r1*Math.sin(t)];return{m:[O[0],O[1],0],a1:[O[0],O[1],t],a2:[c[0],c[1],t*k]};},
  drive:'Turn the crank arm and swing the polisher round: its path covers the whole face.'});}

/* 372 · White's dynamometer: two bevel wheels and the carrier's pinions */
{const zc=U.BT+34,d1=Math.atan(1.75),d2=PI/2-d1,R1=21,R2=12,b1=R1/Math.tan(d1),b2=R2/Math.tan(d2);
 PK.defS(372,{summary:'White’s dynamometer. The driving shaft’s bevel wheel and the driven shaft’s bevel wheel face each other, and two bevel pinions between them run on the arms of a carrier. The two shafts turn opposite ways; the carrier is pushed round with twice the torque being passed through, and the weight that must hang on its arm to hold it level measures the power.',cam:{yaw:0.55,pitch:0.3},params:window.MB.SIMS[372].params,
  base:()=>[U.plate(-85,-34,95,34),U.wall(-70,0,'x',[[0,zc,U.SHB]],14,5),U.wall(70,0,'x',[[0,zc,U.SHB]],14,5),K.box(10,10,U.BT,zc-10,80,0)],
  parts:[{id:'a',name:'Driving bevel wheel on its shaft (the shaft runs on into the carrier hub)',role:'driver',mesh:K.merge(U.bevel(R1,28,d1,6),K.prism(U.octa(U.SH),[],-75+b1,b1+2))},
   {id:'b',name:'Driven bevel wheel on its shaft',role:'driven',mesh:K.merge(U.bevel(R1,28,d1,6),K.prism(U.octa(U.SH),[],-75+b1,0))},
   {id:'c',name:'Carrier with pinion arbors and weight arm',role:'link',mesh:K.merge(K.xf(K.prism(K.circle(5,24),[K.circle(U.SHB,20)],-3,3),M4.Ry(PI/2)),K.box(6,6,-b2+8,b2-8,0,0),K.cyl(1.8,b2-8,b2+3,14),K.cyl(1.8,-b2-3,-b2+8,14),K.box(6,70,-2,2,0,38))},
   {id:'p',name:'Bevel pinion, 16 teeth',role:'link',qty:2,mesh:U.bevel(R2,16,d2,6,{bore:'round'})}],
  pose(phi,g){const tl=g.tilt,C=M4.mul(M4.T(0,0,zc),M4.Rx(tl));return{a:U.at([-b1,0,zc],[1,0,0],phi),b:U.at([b1,0,zc],[-1,0,0],-phi),c:C,
    p:[M4.mul(C,U.at([0,0,b2],[0,0,-1],phi*R1/R2)),M4.mul(C,U.at([0,0,-b2],[0,0,1],phi*R1/R2))]};},
  read:(phi,g)=>`balance load ${(g.t*20).toFixed(1)} kg`,hardware:['A small weight (coins in a bag) hung from the end of the carrier arm.'],drive:'Turn the driving shaft while holding the driven one back: the carrier tries to swing, and the weight holds it level.'});}

/* 373 · friction tester: the loaded wagon rests on the turning wheel and is held by a spring balance */
{const O=[400,360];
 PK.def(373,{S:0.3,up:true,summary:'A friction tester: a little wagon rests on the rim of a turning wheel and is held back by a spring balance. The pull on the spring is the friction; load the wagon more and the pull rises in the same proportion, showing that friction is proportional to the load pressing the surfaces together.',params:window.MB.SIMS[373].params,
  parts:[{id:'w',name:'Wheel with crank knob',role:'driver',layer:0,shape:S=>({o:K.circle(150,120),h:[S.hole(0,0),...[0,1,2,3,4,5].map(k=>K.circle(44,40,92*Math.cos(k*PI/3),92*Math.sin(k*PI/3)))]}),bosses:[[120,0,10,3.5]]},
   {id:'c',name:'Wagon body (load it with nuts or coins)',role:'driven',layer:0,shape:S=>({o:[[-60,-20],[60,-20],[60,20],[-60,20]],h:[S.hole(-40,8),S.hole(40,8)]})}],
  ground:[[O[0],O[1],0,0]],fixed:[{shape:S=>S.rect(8,60,700,O[1]-180),l1:0},{shape:S=>S.rect(70,8,O[0],O[1]-224),l1:0}],
  pose(g){return{w:[O[0],O[1],g.phi],c:[O[0],O[1]-176,0]};},
  ropes(g){const z=PK.zl(0)+2;return[{pts:[[O[0]+60,O[1]-180,z],[700,O[1]-180,z]],r:0.8}];},
  hardware:['A rubber band or a small spring balance from the wagon to the post.','Nuts or coins as the load.'],drive:'Turn the wheel steadily and load the wagon: the band stretches more as the load grows.'});}

/* 374 · treadle working an eccentric through an endless band */
{const sim=window.MB.SIMS[374],Pv=sim.Pv,O=sim.O,r=sim.r;
 PK.def(374,{S:0.3,up:true,summary:'A treadle drives a shaft through an endless band passed round an eccentric on the shaft. Treading pulls the band and the eccentric round; the flywheel carries the shaft on through the return, so the motion is a steady rotation.',
  parts:[{id:'t',name:'Treadle',role:'driver',layer:0,shape:S=>S.lever([[0,0,18],[300,0,12]],[[0,0]]),bosses:[[250,0,PK.TH+PK.GAP+PK.TH-1,3]]},
   {id:'f',name:'Flywheel with eccentric (one piece)',role:'driven',layer:0,t:2,mesh:K.merge(PK.ext({o:K.circle(120,96),h:[Sh.hole(0,0),...[0,1,2,3,4].map(k=>K.circle(30,32,78*Math.cos(k*TAU/5+0.6),78*Math.sin(k*TAU/5+0.6)))]},0,PK.TH),PK.ext({o:K.circle(34,48,r,0),h:[Sh.hole(0,0)]},PK.TH,2*PK.TH+PK.GAP))}],
  ground:[[Pv[0],Pv[1],0,0],[O[0],O[1],0,1]],
  pose(g){return{t:[Pv[0],Pv[1],g.a],f:[O[0],O[1],g.phi]};},
  ropes(g){const z=PK.zl(1)+PK.TH/2,R=[Pv[0]+250*Math.cos(g.a),Pv[1]+250*Math.sin(g.a)],E=[O[0]+r*Math.cos(g.phi),O[1]+r*Math.sin(g.phi)],pts=[];for(let i=0;i<=24;i++){const t=PI+i/24*PI;pts.push([E[0]+34*Math.cos(t),E[1]+34*Math.sin(t),z]);}
    return[{pts:[[R[0]-6,R[1],z],...pts,[R[0]+6,R[1],z]],r:0.8}];},
  hardware:['A rubber band or loop of cord from the treadle peg round the eccentric.'],drive:'Rock the treadle: the band pulls the eccentric round and the flywheel turns.'});}

/* 375 · edge runner mill */
{const S=0.25,R=130*S,rw=80*S,zp=U.BT+6;
 PK.defS(375,{summary:'An edge-runner mill: two heavy stone wheels on a horizontal axle are dragged round a pan by an upright shaft. Each runner rolls on the pan floor and, because its inner and outer edges travel different distances, it also grinds by sliding, crushing whatever is spread on the pan.',cam:{yaw:0.6,pitch:0.4},
  base:()=>[U.plate(-60,-60,60,60),K.lathe([[0.01,U.BT],[56,U.BT],[56,zp+10],[52,zp+10],[52,zp],[0.01,zp]],80),K.cyl(2.4,zp,zp+2*rw+30,20)],
  parts:[{id:'s',name:'Upright shaft sleeve with axle',role:'driver',mesh:K.merge(K.tubeSolid(5,2.6,0,2*rw+24,32),K.xf(K.cyl(2,-R-6,R+6,16),M4.mul(M4.T(0,0,rw),M4.Ry(PI/2))),K.box(8,8,2*rw+18,2*rw+24,0,0))},
   {id:'w',name:'Runner (stone wheel)',role:'driven',qty:2,mesh:K.xf(K.prism(K.circle(rw,64),[K.circle(2.3,20)],-5,5),M4.Ry(PI/2))}],
  pose(phi,g){const a=g.phi,sp=M4.mul(M4.T(0,0,zp),M4.Rz(a)),roll=-a*R/rw;return{s:sp,w:[1,-1].map(s=>M4.mul(sp,M4.mul(M4.T(s*R,0,rw),M4.Rx(s*roll))))};},
  read:(phi,g)=>`runners ${(g.phi/TAU).toFixed(2)} times round`,drive:'Turn the upright shaft: the runners roll round the pan.'});}

/* 376 · inclined treadwheel */
{const R=48,tl=0.38,zc=U.BT+34;
 const cleats=()=>K.merge(K.prism(K.circle(R,96),[K.circle(3,20)],-2,2),...Array.from({length:16},(_,k)=>{const a=k*TAU/16;return K.xf(K.box(R*0.6,2.2,2,4,R*0.62,0),M4.Rz(a));}),K.cyl(3,-26,2,16));
 PK.defS(376,{summary:'An inclined treadwheel: a broad wheel set at a slant, with cleats on its face. An animal standing on the lower side keeps walking uphill against the slope, and its weight turns the wheel and the upright shaft beneath it.',cam:{yaw:0.5,pitch:0.45},
  base:()=>[U.plate(-60,-55,60,55),K.xf(K.tubeSolid(6,3.3,-30,-4,32),M4.mul(M4.T(0,0,zc),M4.Rx(tl))),K.box(10,10,U.BT,zc-24,0,-8)],
  parts:[{id:'w',name:'Inclined wheel with cleats',role:'driven',mesh:cleats()},{id:'a',name:'Animal (a block standing on the wheel)',role:'driver',mesh:K.merge(K.box(26,10,0,12,0,0),K.box(4,4,-8,0,-9,3),K.box(4,4,-8,0,9,3),K.box(4,4,-8,0,-9,-3),K.box(4,4,-8,0,9,-3))}],
  pose(phi,g){const W=M4.mul(M4.T(0,0,zc),M4.Rx(tl));return{w:M4.mul(W,M4.Rz(g.phi)),a:M4.mul(W,M4.T(0,-R*0.5,12))};},
  read:(phi,g)=>`wheel ${(g.phi/TAU).toFixed(2)} turns`,drive:'Turn the wheel: the cleats pass under the animal as it walks uphill.'});}

/* 377 · treadmill wheel with steps round its rim */
{const O=[400,260],R=190;
 PK.def(377,{S:0.3,up:true,summary:'A treadmill (stepping wheel): people climbing the steps on the outside of a large wheel keep stepping onto the next tread as it comes round, and their weight turns the wheel and its shaft, as in a prison mill or a crane.',
  parts:[{id:'w',name:'Treadwheel with 24 steps',role:'driven',layer:0,mesh:K.merge(PK.ext({o:K.circle(R,120),h:[Sh.hole(0,0),K.circle(R-30,120)]},0,PK.TH),PK.ext({o:K.circle(30,40),h:[Sh.hole(0,0)]},0,PK.TH),...[0,1,2,3,4,5].map(k=>{const a=k*PI/3;return PK.ext({o:armPts([20*Math.cos(a),20*Math.sin(a)],[(R-20)*Math.cos(a),(R-20)*Math.sin(a)],7),h:[]},0,PK.TH);}),...Array.from({length:24},(_,k)=>{const a=k*TAU/24,c=Math.cos(a),s=Math.sin(a),q=([x,y])=>[R*c+x*c-y*s,R*s+x*s+y*c];return PK.ext({o:[[-4,-10],[20,-10],[20,10],[-4,10]].map(q),h:[]},0,PK.TH);}))}],
  ground:[[O[0],O[1],0,0]],pose(g){return{w:[O[0],O[1],g.phi]};},drive:'Turn the wheel by its steps.'});}

/* 378 · pendulum saw for felling trees */
{const F=[400,40];
 PK.def(378,{S:0.3,up:true,summary:'A pendulum saw: the blade hangs on a long swinging frame, so the sawyers need only push it to and fro; its weight keeps it pressed into the cut as it swings across the trunk.',
  parts:[{id:'s',name:'Pendulum frame with saw blade',role:'driver',layer:0,mesh:K.merge(PK.ext({o:armPts([0,0],[0,330],8),h:[Sh.hole(0,0)]},0,PK.TH),PK.ext({o:[[-160,330],[160,330],[160,356],...Array.from({length:16},(_,k)=>[[150-k*20,368],[140-k*20,356]]).flat(),[-160,356]],h:[]},0,PK.TH))}],
  ground:[[F[0],F[1],0,0]],fixed:[{shape:S=>({o:K.circle(80,64,400,470),h:[]}),l1:0}],plate:{x0:200,y0:10,x1:600,y1:500},
  pose(g){return{s:[F[0],F[1],-g.a]};},drive:'Swing the saw across the log.'});}

/* 379, 380 · cramp drills */
for(const n of [379,380]){const sim=window.MB.SIMS[n];if(!sim)continue;const S=0.25,through=n===380,X=(sim.X-400)*S,Z=y=>U.BT+(480-y)*S,P=x=>(x-400)*S,yA=200;
 const frame=()=>[K.prism([[P(180),-7],[P(640),-7],[P(640),7],[P(180),7]],[K.circle(through?6.0:U.SH+0.5,28,X,0)],Z(yA+20),Z(110)),K.box(P(640)-P(580),14,U.BT,Z(110),(P(580)+P(640))/2,0),K.box(P(640)-P(180),14,U.BT,Z(420),(P(180)+P(640))/2,0)];
 const spindle=()=>{const L=through?150*S:120*S,m=[K.prism(U.octa(U.SH),[],0,L),K.lathe([[0.01,-9],[U.SH,0],[0.01,0]],12),K.xf(U.crank(14,3),M4.T(0,0,6))];if(through)m.push(K.prism(K.circle(5.5,24),[],70*S-2.5,70*S));return K.merge(...m);};
 const screw=()=>through?K.merge(K.prism(K.circle(5.6,40),[K.circle(U.SH+0.6,20)],0,80*S),K.prism(K.circle(11,32),[K.circle(U.SH+0.6,16)],80*S,80*S+2.5)):K.merge(K.cyl(4,0,110*S,24),K.prism(K.circle(11,32),[],110*S,110*S+2.5));
 PK.defS(n,{summary:through?'A portable cramp drill in which the drill spindle passes through a hollow feed screw. The cramp grips the work; turning the crank drives the drill, and screwing the hollow screw down through the frame presses a collar on the spindle and feeds the drill into the work.':'A portable cramp drill: the cramp grips the work between its jaws, the crank turns the drill spindle in the upper arm, and a feed screw standing opposite the drill, end to end with the spindle, is screwed down from a nut on the frame to press the drill into the work.',cam:{yaw:0.4,pitch:0.2},
  base:()=>{const b=[U.plate(P(150),-22,P(670),22),...frame(),K.box(P(500)-P(200),24,Z(420),Z(360),(P(200)+P(500))/2,0)];if(!through)b.push(K.prism([[X-15,-7],[X+15,-7],[X+15,7],[X-15,7]],[K.circle(4.4,24,X,0)],Z(110)+8,Z(110)+12),K.box(6,14,Z(110),Z(110)+12,X+12,0));return b;},
  parts:[{id:'sp',name:'Drill spindle with crank',role:'driver',mesh:spindle()},{id:'fs',name:through?'Hollow feed screw with handwheel':'Feed screw with handwheel',role:'link',mesh:screw()}],
  pose(phi,g){const yS=yA-30+g.d;return{sp:M4.mul(M4.T(X,0,Z(yS+120)),M4.Rz(phi)),fs:through?M4.mul(M4.T(X,0,Z(yA-60+g.d+80)),M4.Rz(g.s)):M4.mul(M4.T(X,0,Z(yS)),M4.Rz(g.s))};},
  read:(phi,g)=>`fed ${(g.d*S).toFixed(1)} mm`,drive:'Turn the crank to drill; turn the handwheel to feed.'});}

/* 381 · joiner's clamp with a wedge */
PK.def(381,{S:0.3,summary:'A joiner’s clamp tightened by a wedge: the work lies between a fixed stop and a sliding jaw, and driving the tapered wedge down between the jaw and a fixed post pushes the jaw hard against the work. With a taper of one in two the jaw moves half as far as the wedge, with twice the force.',
  parts:[{id:'j',name:'Sliding jaw',role:'driven',layer:0,shape:S=>S.rect(30,90,0,0)},{id:'w',name:'Wedge (1 in 2)',role:'driver',layer:0,shape:S=>({o:[[530-545,0],[560-545,0],[560-545,140],[460-545,140]],h:[]})},{id:'k',name:'Work piece',role:'frame',layer:0,shape:S=>S.rect(140,50,0,0)}],
  fixed:[{shape:S=>S.rect(460,20,310,340),l1:0},{shape:S=>S.rect(130,20,655,340),l1:0},{shape:S=>S.rect(30,110,315,275),l1:0},{shape:S=>S.rect(30,190,575,275),l1:0}],
  pose(g){return{j:[485+g.d+0.5,285,0],w:[545,g.yT,0],k:[400,305,0]};},drive:'Push the wedge down: the jaw closes on the work.'});

/* 382 · stand that rises, swivels and tilts */
{const S=0.3;
 PK.defS(382,{summary:'An adjustable stand: the post slides up and down in the column and is clamped at any height, the head swivels round on the post, and the table tilts on a hinge across the head, so the work can be set at any height, direction and slope.',cam:{yaw:0.5,pitch:0.25},
  base:()=>[U.plate(-32,-32,32,32),K.tubeSolid(6,3.6,U.BT,U.BT+52,40)],
  parts:[{id:'p',name:'Sliding post with fork head',role:'link',mesh:K.merge(K.cyl(3.3,-40,20,24),K.box(14,4,20,30,0,-5),K.box(14,4,20,30,0,5))},{id:'t',name:'Table (tilts on the fork)',role:'driver',mesh:K.merge(K.box(90,30,2,5,0,0),K.xf(K.cyl(2,-6,6,16),M4.Rx(PI/2)),K.box(8,6,0,3,0,0))}],
  pose(phi,g){const P=M4.mul(M4.T(0,0,U.BT+52+g.h*S),M4.Rz(g.sw));return{p:P,t:M4.mul(P,M4.mul(M4.T(0,0,28),M4.Ry(g.t)))};},
  read:(phi,g)=>`height ${(g.h*S).toFixed(0)} mm`,drive:'Raise, swivel and tilt the table.'});}

/* 383 · cloth carried past a brush (or teasel) cylinder */
{const B=[400,210];
 PK.def(383,{S:0.3,up:true,summary:'A cloth-dressing machine: guide rollers carry the cloth so that it bends round under a rapidly turning brush (or teasel) cylinder, which raises or cleans the nap as the cloth passes.',
  parts:[{id:'b',name:'Brush cylinder with bristles',role:'driver',layer:0,mesh:K.merge(PK.ext({o:K.circle(90,72),h:[Sh.hole(0,0)]},0,PK.TH),...Array.from({length:36},(_,k)=>{const a=k*TAU/36;return PK.ext({o:armPts([88*Math.cos(a),88*Math.sin(a)],[104*Math.cos(a),104*Math.sin(a)],4),h:[]},0,PK.TH);}))},
   {id:'r',name:'Guide roller',role:'driven',qty:2,layer:0,shape:S=>S.disk(40)}],
  ground:[[B[0],B[1],0,0],[200,340,0,0],[600,340,0,0]],
  pose(g){return{b:[B[0],B[1],-g.phi*4],r:[[200,340,g.phi],[600,340,g.phi]]};},
  ropes(g){const z=PK.zl(0)+PK.TH/2;return[{pts:[[60,300,z],[200,300,z],[400,B[1]+106,z],[600,300,z],[740,300,z]],r:0.7}];},
  hardware:['A strip of cloth or ribbon threaded over the rollers and under the brush.'],drive:'Turn the brush and draw the cloth through.'});}

/* 384 · volute drawer: a wheel screwing itself along a threaded arm */
{const sim=window.MB.SIMS[384],S=0.3,rw=24*S,zr=U.BT+rw,La=235*S;
 PK.defS(384,{summary:'An instrument for drawing volutes. A small wheel runs as a nut on a threaded arm pivoted at the centre, and rests on the paper. Swinging the arm round rolls the wheel, and every turn of the wheel screws it one thread further out; since it turns faster the further out it is, the pencil beside it draws a widening (logarithmic) spiral.',cam:{yaw:0.5,pitch:0.6},
  base:()=>[U.plate(-75,-75,75,75),K.cyl(2.2,U.BT,zr+8,20),K.cyl(5,U.BT,zr-4,24)],
  parts:[{id:'a',name:'Threaded arm with centre hub',role:'driver',mesh:K.merge(K.prism(K.circle(5,24),[K.circle(2.5,20)],-3,3),K.xf(U.worm(2.4,1.6,La-6),M4.mul(M4.T(5,0,0),M4.Ry(PI/2))))},
   {id:'w',name:'Wheel (nut) with pencil holder',role:'driven',mesh:K.merge(K.xf(K.prism(K.circle(rw,40),[K.circle(3.2,24)],-2,2),M4.Ry(PI/2)),K.xf(K.tubeSolid(2.2,1.2,-rw,4,16),M4.T(0,6,0)))}],
  pose(phi,g){const A=M4.mul(M4.T(0,0,zr),M4.Rz(g.t));return{a:A,w:M4.mul(A,M4.mul(M4.T(g.r*S,0,0),M4.Rx(g.t*g.r/24)))};},
  read:(phi,g)=>`radius ${(g.r*S).toFixed(1)} mm`,drive:'Swing the arm round: the wheel screws itself outward and the pencil draws a volute.'});}

/* 385 · weighted door closer (seen from above) */
{const sim=window.MB.SIMS[385],H=sim.H,T0=sim.T0,Lk=sim.Lk;
 PK.def(385,{S:0.3,summary:'A door closer seen from above: a link of fixed length joins the door to a slide, and a cord runs from the slide over a pulley to a hanging weight. Opening the door draws the slide away from the pulley and lifts the weight; let go, and the weight pulls the slide back and swings the door shut.',
  parts:[{id:'d',name:'Door',role:'driver',layer:0,shape:S=>({o:[[-10,-10],[300,-10],[300,10],[-10,10]],h:[S.hole(0,0)]}),pins:[[80,0,1]]},{id:'k',name:'Link',role:'link',layer:1,shape:S=>S.bar(Lk,10)},{id:'s',name:'Slide',role:'driven',layer:0,shape:S=>S.rect(40,40,0,0),pins:[[0,0,1]]}],
  ground:[[H[0],H[1],0,0]],fixed:[{shape:S=>S.rect(8,150,T0-26,395),l1:0},{shape:S=>S.rect(8,150,T0+26,395),l1:0},{shape:S=>S.rect(130,14,125,H[1]+10),l1:0},{shape:S=>S.rect(150,14,H[0]+300+85,H[1]+10),l1:0},{shape:S=>({o:K.circle(10,24,T0,490),h:[]}),l1:0}],
  pose(g){return{d:[H[0],H[1],-g.a],k:[g.K[0],g.K[1],Math.atan2(g.T[1]-g.K[1],g.T[0]-g.K[0])],s:[g.T[0],g.T[1],0]};},
  ropes(g){const z=PK.zl(0)+2;return[{pts:[[g.T[0],g.T[1]+20,z],[T0,480,z]],r:0.7}];},
  hardware:['A cord from the slide round the post to a small weight hanging over the edge of the base.'],drive:'Open the door: the slide is drawn back; let go and the weight closes it.'});}

/* 386 · folding library ladder: two stiles hinged at the top */
{const B=[300,460],a=-PI/2+0.25,Ls=290,T1=[B[0]+Ls*Math.cos(a),B[1]+Ls*Math.sin(a)];
 PK.def(386,{S:0.3,up:true,summary:'A folding library ladder: two stiles hinged together at the top. Folded, they close up into a single pole; opened, the second stile swings out to make a pair of steps that stand by themselves.',
  parts:[{id:'s1',name:'Stile with steps',role:'frame',layer:0,shape:S=>({o:armPts([0,0],[Ls,0],12),h:[S.hole(Ls,0)]}),pins:[[Ls,0,1]]},{id:'s2',name:'Second stile',role:'driver',layer:1,shape:S=>({o:armPts([0,0],[Ls*0.9,0],12),h:[S.hole(0,0)]})}],
  plate:{x0:120,y0:120,x1:560,y1:480},
  pose(g){const b=a+PI*(1-g.f)*0.95+0.5*g.f;return{s1:[B[0],B[1],a],s2:[T1[0],T1[1],b+PI]};},
  drive:'Swing the second stile out to open the steps, back to fold them.'});}

/* 387 · ladder whose steps stay level as it tilts (a stack of parallelograms) */
{const A=[320,460],Bp=[460,460],Lr=380;
 PK.def(387,{S:0.3,up:true,summary:'A ladder whose steps stay level as it leans: the two side rails are pivoted at their feet and every step is pivoted to both rails, so the ladder is a stack of parallelograms and each step stays parallel to the floor whatever the slope.',
  parts:[{id:'r',name:'Side rail',role:'driver',qty:2,layer:0,shape:S=>S.bar(Lr,12,[0]),pins:[1,2,3,4,5].map(k=>[Lr*k/6,0,1])},{id:'st',name:'Step',role:'link',qty:5,layer:1,shape:S=>S.bar(140,10)}],
  ground:[[A[0],A[1],0,0],[Bp[0],Bp[1],0,0]],
  pose(g){const d=[Lr*Math.cos(g.a),Lr*Math.sin(g.a)];return{r:[[A[0],A[1],g.a],[Bp[0],Bp[1],g.a]],st:[1,2,3,4,5].map(k=>[A[0]+d[0]*k/6,A[1]+d[1]*k/6,0])};},
  drive:'Lean the ladder over: every step stays level.'});}

/* 388 · board fed by toothed rollers above and smooth rollers below */
{const sim=window.MB.SIMS[388];
 PK.def(388,{S:0.3,up:true,summary:'Feed rollers for boards: toothed rollers above bite into the board and smooth rollers below support it, all turning together, so the board is carried steadily forward without slipping.',
  parts:[{id:'t',name:'Toothed roller',role:'driver',qty:2,layer:0,shape:S=>S.gear(30,14)},{id:'s',name:'Smooth roller',role:'driven',qty:2,layer:0,shape:S=>S.disk(34)},{id:'b',name:'Board',role:'driven',layer:0,shape:S=>S.rect(400,30,0,0)}],
  ground:[[300,214,0,0],[500,214,0,0],[300,316,0,0],[500,316,0,0]],plate:{x0:60,y0:170,x1:740,y1:370},
  pose(g){return{t:[[300,214,-g.phi*1.3],[500,214,-g.phi*1.3]],s:[[300,316,g.phi*1.2],[500,316,g.phi*1.2]],b:[g.x-100,265,0]};},
  drive:'Turn the rollers: the board is fed through.'});}

/* 390 · lever, two bands, two drums, two ratchets and a flywheel */
{const sim=window.MB.SIMS[390],S=0.3,X=x=>(x-380)*S,rd=sim.rd*S,R=sim.R*S,r0=sim.r0*S,N=sim.N,zs=U.BT+46,RAT=window.MB.SIMS[321].RAT,La=sim.La*S,zF=zs+(280-110)*S;
 const ratchet=()=>K.xf(K.prism(RAT.pts(N,r0,R,-1),[U.octa(U.SH+0.12)],-3,3),M4.Ry(PI/2));
 const drum=()=>K.merge(K.xf(K.prism(K.circle(rd,48),[K.circle(U.SHB,24)],-6,6),M4.Ry(PI/2)),K.xf(K.prism(armPts([0,0],[96*S,0],4),[K.circle(U.SHB,24)],6,9),M4.Ry(PI/2)),K.xf(K.cyl(1.4,9,15,12,96*S,0),M4.Ry(PI/2)));
 const pawl=()=>{const b=RAT.pawl(N,sim.r0,sim.R,-1,0,[92,0],48,-3.1,-1.8),tip=[48*S*Math.cos(b),48*S*Math.sin(b)];return K.xf(K.prism(K.hull([...K.circle(3.5,20),...K.circle(1.5,12,tip[0],tip[1])]),[K.circle(1.6,14)],-1.5,1.5),M4.Ry(PI/2));};
 PK.defS(390,{summary:'A rocking lever turns a flywheel one way by two bands, two drums and two ratchets. Each drum runs loose on the shaft and carries a pawl into its own ratchet, which is fast on the shaft. The bands are wound opposite ways, so one drum drives on the down stroke and the other on the up stroke, while small weights turn each idle drum back; the flywheel smooths the motion.',cam:{yaw:0.35,pitch:0.3},
  base:()=>[U.plate(X(110),-34,X(740),34),...[140,560,700].map(x=>U.wall(X(x),0,'x',[[0,zs,U.SHB]],14,5)),K.box(8,8,U.BT,zF+6,X(380),-14),K.xf(K.cyl(1.8,-14,4,16),M4.mul(M4.T(X(380),0,zF),M4.Rx(-PI/2)))],
  parts:[{id:'sh',name:'Shaft with flywheel and two ratchets',role:'driven',mesh:K.merge(K.xf(U.shaft(X(720)-X(120)),M4.T((X(720)+X(120))/2,0,-U.SH*Math.cos(PI/8))),K.xf(K.prism(K.circle(130*S,80),[U.octa(U.SH+0.12),...[0,1,2,3,4,5].map(k=>K.circle(9,24,24*Math.cos(k*PI/3),24*Math.sin(k*PI/3)))],-4,4),M4.mul(M4.T(X(640),0,0),M4.Ry(PI/2))),K.xf(ratchet(),M4.T(X(338),0,0)),K.xf(ratchet(),M4.T(X(498),0,0)))},
   {id:'d',name:'Drum with pawl arm (loose on the shaft)',role:'link',qty:2,mesh:drum()},{id:'p',name:'Pawl',role:'small',qty:2,mesh:pawl()},
   {id:'lv',name:'Rocking lever with handle',role:'driver',mesh:K.merge(K.xf(K.prism(K.hull([...K.circle(5,20),...K.circle(3,16,-La-5,0),...K.circle(3,16,La+5,0)]),[K.circle(2.2,16)],-2,2),M4.Rx(PI/2)),K.box(4,4,0,22,0,0))}],
  pose(phi,g){const at=(x,a)=>M4.mul(M4.T(X(x),0,zs),M4.Rx(a));const pw=[0,1].map(i=>{const d=g.ds[i],b0=RAT.pawl(N,sim.r0,sim.R,-1,0,[92,0],48,-3.1,-1.8),b=RAT.pawl(N,sim.r0,sim.R,-1,g.w-d,[92,0],48,-3.1,-1.8);return M4.mul(at([300,460][i],d),M4.mul(M4.T(12,0,-96*S),M4.Rx(b-b0)));});
    return{sh:at(380,g.w),d:[at(300,g.ds[0]),at(460,g.ds[1])],p:pw,lv:M4.mul(M4.T(X(380),0,zF),M4.Ry(g.a))};},
  belts(phi,g){return[0,1].map(i=>{const s=i?1:-1,E=[X(380)+s*La*Math.cos(g.a),zF-s*La*Math.sin(g.a)];return{pts:[[E[0],0,E[1]],[X([300,460][i]),i?-rd:rd,zs]],r:0.5,closed:false};});},
  read:(phi,g)=>`shaft ${(g.w/TAU).toFixed(2)} turns`,hardware:['Two cords from the lever ends to the drums, wound opposite ways, and two small weights on cords wound the other way to turn the drums back.'],drive:'Rock the lever: the flywheel turns one way only.'});}

/* 391 · two weighted racks take turns driving the gear */
{const sim=window.MB.SIMS[391],P=sim.Pg,Rg=sim.Rg,m=2*Rg/18,p=PI*m,c0=((170-p/2)%p+p)%p+p,xm=P[0]-Rg,Lr=c0+12*p;
 const rack=()=>{const r=Sh.rack(0,Lr,m,16,{c0});return K.merge(PK.ext({o:r.o.map(([x,y])=>[-y,x]).reverse(),h:[]},0,PK.TH),PK.ext({o:[[-1.25*m-36,Lr],[-1.25*m+4,Lr],[-1.25*m+4,Lr+40],[-1.25*m-36,Lr+40]],h:[]},0,PK.TH));};
 PK.def(391,{S:0.3,up:true,summary:'Two weighted racks take turns to drive a gear. The rack that is falling is swung into mesh and its weight drives the gear; meanwhile the other is swung clear and drawn up. Both mesh on the same side of the gear, one in front of the other, so each drives it the same way and the gear turns continuously.',
  parts:[{id:'g',name:'Gear, two layers wide',role:'driven',layer:0,t:2,mesh:PK.ext(Sh.gear(Rg,18),0,2*PK.TH+PK.GAP)},{id:'fr',name:'Front rack with weight',role:'driver',layer:1,mesh:rack()},{id:'rr',name:'Rear rack with weight',role:'driver',layer:0,mesh:rack()}],
  ground:[[P[0],P[1],0,1]],plate:{x0:P[0]-200,y0:P[1]-200,x1:P[0]+80,y1:P[1]+240},
  pose(g){const top=y=>P[1]-170+y;return{g:[P[0],P[1],g.w],fr:[g.inA?xm:xm-36,top(g.yA),0],rr:[g.inA?xm-36:xm,top(g.yB),0]};},
  ropes(g){const top=y=>P[1]-170+y,z0=PK.zl(1)+2,z1=PK.zl(0)+2,xa=g.inA?xm:xm-36,xb=g.inA?xm-36:xm;return[{pts:[[xa-1.25*m-8,top(g.yA),z0],[xa-1.25*m-8,P[1]-200,z0]],r:0.6},{pts:[[xb-1.25*m-8,top(g.yB),z1],[xb-1.25*m-8,P[1]-200,z1]],r:0.6}];},
  hardware:['Two cords to hang and draw up the racks.'],drive:'Let each rack fall in mesh in turn, swinging the other clear: the gear keeps turning one way.'});}

/* 392 · jig saw: crank, connecting rod and blade kept taut by a spring */
{const sim=window.MB.SIMS[392],O=sim.O,r=sim.r,Lc=sim.L,X=O[0];
 PK.def(392,{S:0.3,up:true,summary:'A jig saw: a crank below the table draws the blade down through a connecting rod, and a spring above pulls it up again, so the blade is always in tension and saws on the down stroke.',
  parts:[{id:'w',name:'Crank wheel',role:'driver',layer:0,shape:S=>S.disk(60),pins:[[r,0,1]],bosses:[[-40,0,10,3.5]]},{id:'cr',name:'Connecting rod',role:'link',layer:1,shape:S=>S.bar(Lc,10)},{id:'b',name:'Saw frame and blade',role:'driven',layer:0,shape:S=>({o:[[-6,0],[6,0],[6,-230],[-6,-230]],h:[]}),pins:[[0,0,1]]}],
  ground:[[O[0],O[1],0,0]],fixed:[{shape:S=>S.rect(200,16,X-120,308),l1:0},{shape:S=>S.rect(200,16,X+120,308),l1:0},{shape:S=>S.rect(8,90,X-14,140),l1:0},{shape:S=>S.rect(8,90,X+14,140),l1:0},{shape:S=>S.rect(60,10,X,25),l1:0}],
  pose(g){return{w:[O[0],O[1],g.phi],cr:[g.pin[0],g.pin[1],Math.atan2(g.yb-g.pin[1],X-g.pin[0])],b:[X,g.yb,0]};},
  ropes(g){const z=PK.zl(0)+2;return[{pts:[[X,g.yb-230,z],[X,30,z]],r:0.8}];},
  hardware:['A rubber band from the top of the blade frame to the top bar, standing in for the spring.'],drive:'Turn the crank wheel: the blade saws up and down.'});}

/* 395 · four-way cock */
{const O=[400,260];
 const plug=()=>{const pass=s=>{const o=[];for(let i=0;i<=16;i++){const t=s-PI/4+i/16*PI/2;o.push([60*Math.cos(t),60*Math.sin(t)]);}for(let i=16;i>=0;i--){const t=s-PI/4+i/16*PI/2;o.push([22*Math.cos(t),22*Math.sin(t)]);}return o;};return{o:K.circle(90,96),h:[Sh.hole(0,0),pass(0),pass(PI)]};};
 PK.def(395,{S:0.3,summary:'A four-way cock for a steam engine: the plug has two curved passages. In one position they join the boiler to one end of the cylinder and the other end to the exhaust; a quarter turn of the plug reverses both connections, so the engine runs the other way (or the stroke is reversed).',
  parts:[{id:'p',name:'Plug with two passages and handle',role:'driver',layer:0,shape:plug(),bosses:[[75,0,10,3.5]]}],
  ground:[[O[0],O[1],0,0]],
  fixed:(()=>{const f=[],d=0.16,rot=(pts,a)=>pts.map(([x,y])=>[O[0]+x*Math.cos(a)-y*Math.sin(a),O[1]+x*Math.sin(a)+y*Math.cos(a)]);
    for(let k=0;k<4;k++){const a0=k*PI/2+d,a1=(k+1)*PI/2-d,o=[];for(let i=0;i<=20;i++){const t=a0+(a1-a0)*i/20;o.push([O[0]+110*Math.cos(t),O[1]+110*Math.sin(t)]);}for(let i=20;i>=0;i--){const t=a0+(a1-a0)*i/20;o.push([O[0]+91*Math.cos(t),O[1]+91*Math.sin(t)]);}f.push({shape:{o,h:[]},l1:0});
      for(const sd of [-1,1])f.push({shape:{o:rot([[100,sd*15],[200,sd*15],[200,sd*25],[100,sd*25]],k*PI/2),h:[]},l1:0});}return f;})(),
  pose(g){return{p:[O[0],O[1],g.a]};},drive:'Turn the plug a quarter turn: the two passages swap the connections.'});}

/* 397 · crank pin in a slot with arcs at each end: the shuttle pauses at each end of its stroke */
{const sim=window.MB.SIMS[397],O=sim.O,r=sim.r,al=sim.al,xe=r*Math.cos(al),S0=0.3,hw=(PK.PINR+0.35)/S0,top=r+24;
 const slotHole=()=>{const y1=Math.sqrt((r+hw)**2-(xe+hw)**2),a1=Math.atan2(y1,hw+xe),o=[[-hw,-top],[hw,-top],[hw,-y1]];
   for(let i=1;i<20;i++){const t=-a1+2*a1*i/20;o.push([-xe+(r+hw)*Math.cos(t),(r+hw)*Math.sin(t)]);}o.push([hw,y1],[hw,top],[-hw,top],[-hw,y1]);
   for(let i=1;i<20;i++){const t=PI-a1+2*a1*i/20;o.push([xe+(r+hw)*Math.cos(t),(r+hw)*Math.sin(t)]);}o.push([-hw,-y1]);return o;};
 PK.def(397,{S:S0,summary:'A crank drives a shuttle with a pause at each end of its stroke. The crank pin works in a slot in the yoke that is straight above and below and opens into two arcs, each struck from the crank centre with the yoke at one end of its travel. While the pin runs round an arc the yoke stands still; in the straight parts it is driven across.',
  parts:[{id:'c',name:'Crank disk with pin',role:'driver',layer:0,shape:S=>S.disk(r+24),pins:[[r,0,1]],bosses:[[-r*0.6,0,10,3.5]]},
   {id:'y',name:'Yoke with dwell slot, rod and shuttle',role:'driven',layer:1,mesh:K.merge(PK.ext({o:[[-r-14,-r-40],[r+14,-r-40],[r+14,r+40],[-r-14,r+40]],h:[slotHole()]},0,PK.TH),PK.ext({o:[[r+14,-6],[r+150,-6],[r+150,6],[r+14,6]],h:[]},0,PK.TH),PK.ext({o:[[r+150,0],[r+175,-16],[r+215,-10],[r+240,0],[r+215,10],[r+175,16]],h:[]},0,PK.TH))}],
  ground:[[O[0],O[1],0,0]],fixed:[{shape:S=>S.rect(330,8,O[0]+r+225,O[1]-24),l1:1},{shape:S=>S.rect(330,8,O[0]+r+225,O[1]+24),l1:1}],
  pose(g){return{c:[O[0],O[1],g.phi],y:[O[0]+g.x,O[1],0]};},drive:'Turn the crank: the shuttle moves, pauses, returns and pauses.'});}

/* 399 · screw link (turnbuckle) for joining or shortening a chain */
{const S=0.3,zc=U.BT+14;
 const eyeRod=s=>K.merge(K.xf(U.worm(3,1.5,18),M4.Ry(-s*PI/2)),K.xf(K.prism(K.circle(9,40),[K.circle(5.5,40)],-2,2),M4.mul(M4.T(s*30,0,0),M4.Rx(PI/2))));
 PK.defS(399,{summary:'A screw link for joining or shortening a chain: the two end pieces carry screws of opposite hand which enter the two ends of a sleeve. Turning the sleeve draws both screws in together (or lets them out), so the chain is shortened or lengthened without twisting it.',cam:{yaw:0.5,pitch:0.4},
  base:()=>[U.plate(-70,-20,70,20),K.box(6,10,U.BT,zc-9,-55,0),K.box(6,10,U.BT,zc-9,55,0)],
  parts:[{id:'sl',name:'Sleeve (right- and left-hand threads)',role:'driver',mesh:K.xf(K.prism(K.circle(6,6),[K.circle(3.4,24)],-12,12),M4.Ry(PI/2))},{id:'e1',name:'End piece with right-hand screw',role:'driven',mesh:eyeRod(-1)},{id:'e2',name:'End piece with left-hand screw',role:'driven',mesh:eyeRod(1)}],
  pose(phi,g){const h=g.L*S/2;return{sl:M4.mul(M4.T(0,0,zc),M4.Rx(g.c*TAU*3)),e1:M4.T(-h+30*0+0,0,zc),e2:M4.T(h,0,zc)};},
  read:(phi,g)=>`link ${(g.L*S).toFixed(0)} mm`,drive:'Turn the sleeve: both screws draw in together.'});}

L.camFlatModel(400,'A four-motion feed: a cam lifts the feed bar, which a spring then returns, so the bar rises, moves, falls and returns in a cycle that pushes the work forward step by step.');

})();
