/* ===== printable models 191–230 ===== */
const U=PK.U,{Sh}=PK,L=PK.Lib;PK._S(0.3);const pxPoly=L.pxPoly;
const hubArc=(pts,r=18)=>{/* pie sector (last point at the centre) → sector with a round hub */const q=pts.slice(0,-1),a1=Math.atan2(q[q.length-1][1],q[q.length-1][0]);let a0=Math.atan2(q[0][1],q[0][0]);while(a0<=a1)a0+=TAU;for(let i=1;i<40;i++){const t=a1+(a0-a1)*i/40;q.push([r*Math.cos(t),r*Math.sin(t)]);}return q;};
const axle=(top,knob=true)=>{/* glued-in pinion axle (mm, from z=0 up to `top`), optional knob */const m=[K.cyl(PK.PINR-0.05,0,top,24)];if(knob)m.push(K.cyl(5,top,top+7,32));return K.merge(...m);};

/* 191 scroll gear and sliding pinion */
for(const n of [191,414]){const sim=window.MB.SIMS[n];if(!sim||!sim.O)continue;const O=sim.O,rp=sim.rp;
 PK.def(n,{S:0.3,summary:'A scroll gear: its teeth run along a spiral, so the driving radius grows steadily through the turn. The pinion rides on a carriage that slides along a guide, held against the scroll by a rubber band, and turns faster and faster as the radius grows.',
  parts:[{id:'sc',name:'Scroll gear',role:'driver',layer:1,shape:pxPoly(sim.outline),bosses:[[-30,18,14,3.5]]},{id:'p',name:'Pinion, 10 teeth',role:'driven',layer:1,shape:S=>S.gear(rp,10)},
   {id:'cg',name:'Carriage',role:'link',layer:0,shape:S=>S.rect(60,40,0,0,[]),pins:[[0,0,1]]}],
  ground:[[O[0],O[1],1,1],[O[0]+384,O[1],0,1]],fixed:[{shape:S=>S.rect(330,8,O[0]+205,O[1]-26),l1:0},{shape:S=>S.rect(330,8,O[0]+205,O[1]+26),l1:0}],
  pose(g){return{sc:[O[0],O[1],g.th],p:[g.P[0],g.P[1],g.pa],cg:[g.P[0],O[1],0]};},
  hardware:['A small rubber band from the cap on the pinion pin to the post at the end of the guide.'],drive:'Turn the scroll by its knob, first one way then back: the pinion speeds up as the radius grows.'});}

/* 195 worm between two worm wheels, feed rolls on the wheel shafts */
{const m=1.5,p=PI*m,rp=5,Zw=24,Rw=m*Zw/2,hw=7,lam=Math.atan(p/(TAU*rp)),Hl=U.BT+Rw+6,Hw=Hl+Rw+rp,Hu=Hw+Rw+rp,Rr=Rw+rp-0.4,yr=13,LW=4*p;
 const roll=K.prism(K.circle(Rr,96),[U.octa(U.SH+0.12)],0,10),wheel=U.helical(Rw,Zw,hw,-hw*Math.tan(lam)/Rw,{seg:3});
 PK.defS(195,{summary:'A worm between two worm wheels, one above it and one below, so the two wheels turn the opposite ways at the same slow speed. Each wheel’s shaft carries a feed roll as large as the spacing allows; the rolls meet and draw the stock through between them.',cam:{yaw:-2.5,pitch:0.3},
  base:()=>[U.plate(-40,-20,40,34),U.wall(-34,0,'x',[[0,Hw]],16,5,Hw+8),U.wall(34,0,'x',[[0,Hw]],16,5,Hw+8),U.wall(0,-10,'y',[[0,Hl],[0,Hu]],22,5,Hu+8),U.wall(0,28,'y',[[0,Hl],[0,Hu]],22,5,Hu+8)],
  parts:[{id:'wm',name:'Worm',role:'driver',mesh:U.worm(rp,p,LW)},{id:'wl',name:`Lower worm wheel, ${Zw} teeth`,role:'driven',mesh:wheel},{id:'wu',name:`Upper worm wheel, ${Zw} teeth`,role:'driven',mesh:wheel},
   {id:'rl',name:'Feed roll (wrap with a rubber band)',role:'driven',qty:2,mesh:roll},{id:'sw',name:'Worm shaft',mesh:U.shaft(84)},{id:'sh',name:'Wheel shaft',qty:2,mesh:U.shaft(46)},{id:'k',name:'Hand crank',role:'driver',mesh:U.crank()},
   {id:'st',name:'Stock (a strip of card)',role:'small',mesh:K.box(70,8,0,0.6,0,0),noPrint:true}],
  pose(phi){const w=phi/Zw,tr=((w*Rr)%40+40)%40-20;return{wm:U.at([-LW/2,0,Hw],[1,0,0],phi,[0,0,1]),wu:U.at([0,-hw/2,Hu],[0,1,0],w,[0,0,-1]),wl:U.at([0,-hw/2,Hl],[0,1,0],-w+PI/Zw,[0,0,-1]),
    rl:[U.at([0,yr-5,Hu],[0,1,0],w,[0,0,-1]),U.at([0,yr-5,Hl],[0,1,0],-w,[0,0,-1])],sw:U.shaftAt([0,0,Hw],[1,0,0],phi),sh:[U.shaftAt([0,9,Hu],[0,1,0],w),U.shaftAt([0,9,Hl],[0,1,0],-w)],k:U.at([-42,0,Hw],[-1,0,0],-phi,[0,0,1]),
    st:M4.T(tr,yr,Hw-0.3)};},
  read:(phi)=>`rolls ${(phi/24/TAU).toFixed(2)} turns`,drive:'Turn the crank: the two rolls turn opposite ways and feed the strip.'});}

/* 207 twin worms (right- and left-hand) on one shaft drive two wheels side by side; their rolls meet between them */
{const m=1.5,p=PI*m,rp=5,Zw=24,Rw=m*Zw/2,hw=7,lam=Math.atan(p/(TAU*rp)),Hw=U.BT+16,Hc=Hw+Rw+rp,D=Rw+3,Rr=D-0.4,yr=13,LW=3*p;
 const wR=U.worm(rp,p,LW),wL=K.xf(U.worm(rp,p,LW),[1,0,0,0, 0,-1,0,0, 0,0,1,0, 0,0,0,1]),hR=U.helical(Rw,Zw,hw,-hw*Math.tan(lam)/Rw,{seg:3}),hL=U.helical(Rw,Zw,hw,hw*Math.tan(lam)/Rw,{seg:3}),roll=K.prism(K.circle(Rr,96),[U.octa(U.SH+0.12)],0,10);
 PK.defS(207,{summary:'Two worms on one shaft, one right-hand and one left-hand, each under its own worm wheel. The wheels turn the opposite ways, so the feed rolls on their shafts, which meet between the wheels, draw the stock up between them.',cam:{yaw:-2.6,pitch:0.3},
  base:()=>[U.plate(-2*D-14,-20,2*D+14,34),U.wall(-2*D-6,0,'x',[[0,Hw]],16,5,Hw+8),U.wall(2*D+6,0,'x',[[0,Hw]],16,5,Hw+8),U.wall(0,-10,'y',[[-D,Hc],[D,Hc]],2*D+22,5,Hc+8),U.wall(0,28,'y',[[-D,Hc],[D,Hc]],2*D+22,5,Hc+8)],
  parts:[{id:'w1',name:'Right-hand worm',role:'driver',mesh:wR},{id:'w2',name:'Left-hand worm',role:'driver',mesh:wL},{id:'h1',name:'Worm wheel (right-hand)',role:'driven',mesh:hR},{id:'h2',name:'Worm wheel (left-hand)',role:'driven',mesh:hL},
   {id:'rl',name:'Feed roll (wrap with a rubber band)',role:'driven',qty:2,mesh:roll},{id:'sw',name:'Worm shaft',mesh:U.shaft(4*D+30)},{id:'sh',name:'Wheel shaft',qty:2,mesh:U.shaft(46)},{id:'k',name:'Hand crank',role:'driver',mesh:U.crank()}],
  pose(phi){const w=phi/Zw;return{w1:U.at([-D-LW/2,0,Hw],[1,0,0],phi,[0,0,1]),w2:U.at([D-LW/2,0,Hw],[1,0,0],phi,[0,0,1]),h1:U.at([-D,-hw/2,Hc],[0,1,0],w,[0,0,-1]),h2:U.at([D,-hw/2,Hc],[0,1,0],-w,[0,0,-1]),
    rl:[U.at([-D,yr-5,Hc],[0,1,0],w,[0,0,-1]),U.at([D,yr-5,Hc],[0,1,0],-w,[0,0,-1])],sw:U.shaftAt([0,0,Hw],[1,0,0],phi),sh:[U.shaftAt([-D,9,Hc],[0,1,0],w),U.shaftAt([D,9,Hc],[0,1,0],-w)],k:U.at([-2*D-14,0,Hw],[-1,0,0],-phi,[0,0,1])};},
  read:(phi)=>`rolls ${(phi/24/TAU).toFixed(2)} turns, opposite ways`,drive:'Turn the crank: the wheels and their rolls turn opposite ways.'});}

/* 196 pinion B fixed; the arm on B's axis carries wheel A; a rod from A's crank pin to a fixed point swings the arm */
{const sim=window.MB.SIMS[196],G=sim.G,F=sim.F,d=sim.rB+sim.rA;
 PK.def(196,{S:0.3,summary:'Pinion B turns on a fixed axis. An arm pivoted on the same axis carries wheel A in mesh with it, and a rod ties a crank pin on A to a fixed point. As B turns, A rolls round it as far as the rod allows, so the arm is pushed to and fro with an irregular swing.',
  parts:[{id:'arm',name:'Arm',role:'driven',layer:0,shape:S=>S.bar(d,22,[0]),pins:[[d,0,1]]},{id:'b',name:`Pinion B, ${sim.ZB} teeth`,role:'driver',layer:1,shape:S=>S.gear(sim.rB,sim.ZB),bosses:[[0,-22,14,3.5]]},
   {id:'a',name:`Wheel A, ${sim.ZA} teeth`,role:'driven',layer:1,shape:S=>S.gear(sim.rA,sim.ZA),pins:[[sim.e,0,3]]},{id:'rod',name:'Rod',role:'link',layer:3,shape:S=>S.bar(sim.Lr,10)}],
  ground:[[G[0],G[1],0,1],[F[0],F[1],3,3]],
  pose(g){return{arm:[G[0],G[1],g.al],b:[G[0],G[1],g.phi],a:[g.C[0],g.C[1],g.tA],rod:[g.pin[0],g.pin[1],Math.atan2(F[1]-g.pin[1],F[0]-g.pin[0])]};},drive:'Turn pinion B by its knob and watch the arm swing.'});}

/* 198 lifting mangle rack */
{const sim=window.MB.SIMS[198],P=sim.Pc,S0=0.42,rp=sim.rp,Z=sim.Z,n=sim.n,p=TAU*rp/Z,Ls=(n-1)*p,yh=sim.yh,Lr=sim.Lr;PK._S(S0);
 const bar=[[-24,-14],[Ls+24,-14],[Ls+24,14],[Ls-28,14],[Ls-28,yh+12],[Ls-52,yh+12],[Ls-52,14],[52,14],[52,yh+12],[28,yh+12],[28,14],[-24,14]];
 PK.def(198,{S:S0,summary:'Brown’s modification of the mangle rack: the pinion turns on a fixed axis and never rises or falls. Instead the row of pins is hung from the sliding frame by two parallel rods. At each end the pinion climbs round the end pin, lifting (or lowering) the rack by its own motion, and carries on along the other side, so the frame runs back and forth.',
  parts:[{id:'f',name:'Sliding frame',role:'driven',layer:0,shape:S=>S.rect(Ls+120,34,Ls/2,yh+5,[]),pins:[[40,yh,2],[Ls-40,yh,2]]},
   {id:'r',name:'Rack bar with pin row',role:'driven',layer:1,shape:{o:bar,h:[]},bosses:Array.from({length:n},(_,k)=>[k*p,0,PK.TH+PK.GAP-0.3,1.4]),pins:[[40,yh,2],[Ls-40,yh,2]]},
   {id:'rd',name:'Parallel rod',role:'link',qty:2,layer:2,shape:S=>S.bar(Lr,10)},{id:'p',name:`Pinion, ${Z} teeth`,role:'driver',layer:2,shape:S=>({o:S.gearOutline(rp,Z,{backlash:0.5}),h:[S.hole(0,0,(PK.PINR+0.05)/S0)]})},
   {id:'ax',name:'Pinion axle with knob (glue in the pinion)',role:'driver',layer:2,mesh:axle(PK.zl(4)-PK.zl(2)+2)},
   {id:'br',name:'Bridge',role:'frame',layer:3,shape:S=>({o:[[P[0]-56,P[1]-104],[P[0]+56,P[1]-104],[P[0]+22,P[1]+16],[P[0]-22,P[1]+16]],h:[S.hole(P[0]-40,P[1]-90),S.hole(P[0]+40,P[1]-90),S.hole(P[0],P[1])]})}],
  ground:[[P[0]-40,P[1]-90,3,3],[P[0]+40,P[1]-90,3,3]],fixed:[{shape:S=>S.rect(360,8,P[0]-120,P[1]+yh-16),l1:0},{shape:S=>S.rect(360,8,P[0]-120,P[1]+yh+26),l1:0}],
  pose(g){const B=g.B,o={f:[g.fx,P[1],0],r:[B[0],B[1],0],p:[P[0],P[1],g.a],ax:[P[0],P[1],g.a],br:[0,0,0],rd:[]};for(const x0 of [40,Ls-40]){const Bp=[B[0]+x0,B[1]+yh],Fp=[g.fx+x0,P[1]+yh];o.rd.push([Fp[0],Fp[1],Math.atan2(Bp[1]-Fp[1],Bp[0]-Fp[0])]);}return o;},
  drive:'Turn the pinion by its knob: the frame runs along, the rack swings over at the end, and the frame comes back.'});
 PK._S(0.3);}

/* 205 two-cam pinion and a wheel with pins on both faces */
{const sim=window.MB.SIMS[205],P=[280,265],W=[480,265],th=PK.TH,gp=PK.GAP;
 const pu=K.cyl(1.4,0,2*th+gp,20),pd=K.cyl(1.4,-(th+gp),th,20);
 PK.def(205,{S:0.3,summary:'A pinion made of two cams set half a turn apart on different levels, and a wheel with eight pins standing up from its top face and eight hanging from its underside, in between. The lower cam pushes a lower pin on one step and the upper cam an upper pin on the next, so the wheel moves on two steps for each turn of the pinion.',
  parts:[{id:'w',name:'Wheel with 16 pin holes',role:'driven',layer:1,shape:S=>({o:S.circle(140,120),h:[S.hole(0,0),...Array.from({length:16},(_,i)=>S.hole(120*Math.cos(i*TAU/16),120*Math.sin(i*TAU/16),1.45/0.3))]})},
   {id:'pu',name:'Upper pin (glue in)',role:'small',qty:8,layer:1,mesh:pu},{id:'pd',name:'Lower pin (glue in)',role:'small',qty:8,layer:1,mesh:pd},
   {id:'ca',name:'Lower cam',role:'driver',layer:0,shape:S=>S.lever([[0,0,16],[88,0,9]],[[0,0]])},{id:'sp',name:'Spacer (glue between the cams)',role:'driver',layer:1,shape:S=>S.disk(18)},
   {id:'cb',name:'Upper cam',role:'driver',layer:2,shape:S=>S.lever([[0,0,16],[88,0,9]],[[0,0]]),bosses:[[45,0,12,2.6]]}],
  ground:[[P[0],P[1],0,2],[W[0],W[1],1,1]],
  pose(g){const pins=k=>Array.from({length:8},(_,i)=>{const t=g.w+(2*i+k)*TAU/16;return[W[0]+120*Math.cos(t),W[1]+120*Math.sin(t),0];});return{w:[W[0],W[1],g.w],pu:pins(1),pd:pins(0),ca:[P[0],P[1],g.phi],sp:[P[0],P[1],g.phi],cb:[P[0],P[1],g.phi+PI]};},
  drive:'Turn the cams by the knob: the wheel steps on twice per turn.'});}

/* 208 pin wheel with three rings of pins and a slotted pinion sliding on a square shaft */
{const sim=window.MB.SIMS[208],s=0.3,Rk=sim.Rk.map(r=>r*s),rp=sim.rp*s,Zp=sim.Zp,Rw=170*s,z0=U.BT+3,zt=z0+4,hp=7,zc=zt+rp+1.2;
 const wheel=K.merge(K.prism(K.circle(Rw,120),[K.circle(U.SHB,32)],0,4),...sim.Rk.flatMap((R,j)=>{const n=Math.round(R/4);return Array.from({length:n},(_,i)=>K.cyl(1.5,3.9,4+hp,16,Rk[j]*Math.cos(i*TAU/n),Rk[j]*Math.sin(i*TAU/n)));}),K.cyl(3,4,12,20,-30,0));
 PK.defS(208,{summary:'A pin wheel with three rings of pins, all at the same pitch, and a slotted pinion that slides along a square shaft lying across the wheel. Slide the pinion over the inner, middle or outer ring and the same wheel turns it at three different speeds.',cam:{yaw:0.5,pitch:0.5},
  params:sim.params,base:()=>[U.plate(-Rw-6,-Rw-6,Rw+40,Rw+6),K.cyl(4.6,U.BT,z0-0.2,28,0,0),K.cyl(U.SH*0.95,U.BT,zt+3,8,0,0),U.wall(Rw+10,0,'x',[[0,zc]],16,5,zc+8),U.wall(Rw+30,0,'x',[[0,zc]],16,5,zc+8)],
  parts:[{id:'w',name:'Pin wheel (three rings of pins)',role:'driver',mesh:K.xf(wheel,M4.T(0,0,0))},{id:'p',name:`Slotted pinion, ${Zp} teeth`,role:'driven',mesh:U.spur(rp,Zp,8)},{id:'sh',name:'Square shaft',mesh:U.shaft(Rw+40-14)},{id:'k',name:'Hand crank',role:'driven',mesh:U.crank()}],
  pose(phi,g,sm,P){const k=(P&&P.k)||2,R=Rk[k-1],pa=-phi*sim.Rk[k-1]/sim.rp+PI/Zp;return{w:M4.mul(M4.T(0,0,z0),M4.Rz(-phi)),p:U.at([R-4,0,zc],[1,0,0],pa,[0,0,-1]),sh:U.shaftAt([(Rw+40+14)/2,0,zc],[1,0,0],pa),k:U.at([Rw+40,0,zc],[1,0,0],pa,[0,0,-1])};},
  read:(phi,g,sm,P)=>{const k=(P&&P.k)||2;return`ring ${['inner','middle','outer'][k-1]} · pinion ${(sim.Rk[k-1]/sim.rp).toFixed(2)} × wheel`;},drive:'Turn the wheel by its knob; slide the pinion to another ring to change speed.'});}

/* 216 slow forward, quick return */
{const sim=window.MB.SIMS[216],O=sim.O,G=sim.geo(),P=[O[0]+sim.R1+sim.rp,O[1]],Rd=sim.R2+22;
 PK.def(216,{S:0.3,summary:'The driving wheel carries an outside part-gear over 216° and a ring of inside teeth over the remaining 144°. The pinion between them is driven backward slowly by the outside teeth, then forward quickly by the inside teeth: slow forward, quick return, 2.4 pinion turns each way.',
  parts:[{id:'d',name:'Driving disk',role:'driver',layer:0,shape:S=>S.disk(Rd,[[0,0]],120)},{id:'e',name:'Outside part-gear (glue to the disk)',role:'driver',layer:1,shape:pxPoly(G.ext),bosses:[[-50,0,14,3.5]]},
   {id:'i',name:'Inside part-ring (glue to the disk)',role:'driver',layer:1,shape:{o:G.int,h:[]}},{id:'p',name:`Pinion, ${sim.Zp} teeth`,role:'driven',layer:1,shape:S=>({o:S.gearOutline(sim.rp,sim.Zp),h:[S.hole(0,0,(PK.PINR+0.05)/0.3)]})},
   {id:'ax',name:'Pinion axle with pointer knob (glue in the pinion)',role:'driven',layer:1,mesh:K.merge(axle(PK.zl(3)-PK.zl(1)+2),K.box(14,3,PK.zl(3)-PK.zl(1)+2,PK.zl(3)-PK.zl(1)+5,7,0))},
   {id:'br',name:'Bridge',role:'frame',layer:2,shape:S=>({o:[[P[0]-20,P[1]-18],[O[0]+Rd+40,P[1]-30],[O[0]+Rd+40,P[1]+30],[P[0]-20,P[1]+18]],h:[S.hole(P[0],P[1]),S.hole(O[0]+Rd+24,P[1]-14),S.hole(O[0]+Rd+24,P[1]+14)]})}],
  ground:[[O[0],O[1],0,1],[O[0]+Rd+24,P[1]-14,2,2],[O[0]+Rd+24,P[1]+14,2,2]],
  pose(g){return{d:[O[0],O[1],g.phi],e:[O[0],O[1],g.phi],i:[O[0],O[1],g.phi],p:[P[0],P[1],g.a],ax:[P[0],P[1],g.a],br:[0,0,0]};},drive:'Turn the disk by its knob and watch the pointer: slow one way, quick back.'});}

/* 217, 218 wool-comb roller motion (display) */
for(const n of [217,218]){const sim=window.MB.SIMS[n],H=[280,280],R=[540,280],Q=[410,180];
 PK.def(n,{S:0.3,summary:'Wool-combing roller motion (Brown 217–218): a heart cam drives a catch lever, and the catch works in the notches of the wheel F on the roller, turning it a third back, two thirds forward, then leaving it at rest while the next length of fibre is combed. A display model of the parts; Brown’s catch-lifting projection is not modelled.',
  parts:[{id:'c',name:'Heart cam',role:'driver',layer:0,shape:S=>S.polar(t=>60+50*Math.abs(Math.sin(t/2)),120),bosses:[[-30,0,14,3.5]]},
   {id:'l',name:'Catch lever with roller stud',role:'link',layer:1,shape:S=>S.lever([[0,0,14],[-63,48,9],[67,51,9]],[[0,0]])},
   {id:'w',name:'Notched wheel F (on the roller)',role:'driven',layer:0,shape:S=>({o:Array.from({length:180},(_,i)=>{const t=i/180*TAU,k=Math.round(t/(TAU/3)),dt=Math.abs(t-k*TAU/3);const r=dt<0.12?72:90;return[r*Math.cos(t),r*Math.sin(t)];}),h:[S.hole(0,0)]})}],
  ground:[[H[0],H[1],0,0],[R[0],R[1],0,0],[Q[0],Q[1],1,1]],
  pose(g){const rr=60+50*Math.abs(Math.sin((-0.656-g.phi)/2));return{c:[H[0],H[1],g.phi],l:[Q[0],Q[1],-(rr-85)/80],w:[R[0],R[1],g.r]};},drive:'Turn the heart cam by its knob.'});}

/* 219 off-centre crown wheel and a long pinion */
{const sim=window.MB.SIMS[219],s=0.35,e=40*s,Rp=130*s,Rw=160*s,Zp=10,pitch=TAU*Rp/48,rp=Zp*pitch/TAU,z0=U.BT+3,zt=z0+4,hp=6,zc=zt+rp+1,x0=(90-10)*s,x1=(170+12)*s,Xw=e+Rw+8;
 const wheel=K.merge(K.prism(K.circle(Rw,120,e,0),[K.circle(U.SHB,32)],0,4),...Array.from({length:48},(_,i)=>K.cyl(1.4,3.9,4+hp,16,e+Rp*Math.cos(i*TAU/48),Rp*Math.sin(i*TAU/48))),K.cyl(3,4,12,20,e-30,0));
 PK.defS(219,{summary:'A crown wheel (a ring of pins on its face) turning on an axis well off its centre, driving a long pinion that lies across it. The pins meet the pinion at a radius that swings in and out through each turn, so the pinion speeds up and slows down.',cam:{yaw:0.5,pitch:0.5},
  base:()=>[U.plate(-Rw+e-6,-Rw-6,Xw+30,Rw+6),K.cyl(4.6,U.BT,z0-0.2,28,0,0),K.cyl(U.SH*0.95,U.BT,zt+3,8,0,0),U.wall(Xw,0,'x',[[0,zc]],16,5,zc+8),U.wall(Xw+18,0,'x',[[0,zc]],16,5,zc+8)],
  parts:[{id:'w',name:'Crown wheel, 48 pins',role:'driver',mesh:wheel},{id:'p',name:`Long pinion, ${Zp} teeth`,role:'driven',mesh:U.spur(rp,Zp,x1-x0)},{id:'sh',name:'Pinion shaft',mesh:U.shaft(Xw+30-x0)},{id:'k',name:'Hand crank',role:'driven',mesh:U.crank()}],
  pose(phi,g,sm){const pa=(sm&&sm.pa)||0;return{w:M4.mul(M4.T(0,0,z0),M4.Rz(-phi)),p:U.at([x0,0,zc],[1,0,0],pa,[0,0,-1]),sh:U.shaftAt([(x0+Xw+30)/2,0,zc],[1,0,0],pa),k:U.at([Xw+30,0,zc],[1,0,0],pa,[0,0,-1])};},
  read:(phi,g)=>`contact radius ${g.r.toFixed(0)} · pinion ${(g.r/26).toFixed(2)} × wheel`,drive:'Turn the crown wheel by its knob.'});}

/* 223 sectors on three planes */
{const sim=window.MB.SIMS[223],A=sim.A,B=sim.B,G=sim.geo();
 PK.def(223,{S:0.3,summary:'Three toothed sectors, each a third of a circle, are stacked on the driving shaft at radii 50, 70 and 90; on the driven shaft three whole gears of 110, 90 and 70 lie in the same three planes. Each sector meshes for a third of a turn, so the driven speed steps through 0.45, 0.78 and 1.29 times the driver’s.',
  parts:[0,1,2].flatMap(k=>[{id:'s'+k,name:`Sector, radius ${sim.R1[k]} (glue the three together)`,role:'driver',layer:k,shape:pxPoly(hubArc(G.sec[k])),bosses:k===2?[[25,43,12,3]]:[]},{id:'g'+k,name:`Gear, ${G.Z2[k]} teeth (glue the three together)`,role:'driven',layer:k,shape:S=>S.gear(sim.R2[k],G.Z2[k])}]),
  ground:[[A[0],A[1],0,2],[B[0],B[1],0,2]],
  pose(g){const o={};for(let k=0;k<3;k++){o['s'+k]=[A[0],A[1],g.phi];o['g'+k]=[B[0],B[1],g.a2+G.ph[k]];}return o;},drive:'Turn the sectors by the knob: the driven gears change speed every third of a turn.'});}

/* 224 expanding pulley */
{const sim=window.MB.SIMS[224],A=[300,260],U0=0.8,Rb=100,cw=6.7;
 const wedge=(()=>{const a0=0,a1=PI/3,pts=[],off=(a,r,s)=>{const d=[Math.cos(a),Math.sin(a)],nn=[-d[1]*s,d[0]*s];const t=Math.sqrt(Math.max(0,r*r-cw*cw));return[d[0]*t+nn[0]*cw,d[1]*t+nn[1]*cw];};
   pts.push(off(a0,26,1),off(a0,Rb-2,1));const b0=Math.atan2(pts[1][1],pts[1][0]),e1=off(a1,Rb-2,-1),b1=Math.atan2(e1[1],e1[0]);for(let i=1;i<12;i++){const t=b0+(b1-b0)*i/12;pts.push([(Rb-2)*Math.cos(t),(Rb-2)*Math.sin(t)]);}pts.push(e1,off(a1,26,-1));return pts;})();
 const slot=k=>{const c=[],w=(PK.PINR+0.35)/0.3;const fwd=[],bak=[];for(let i=0;i<=24;i++){const u=i/24*U0,r=25+45*u/U0,t=k*PI/3+u,d=[Math.cos(t),Math.sin(t)],dr=[45/U0*d[0]-r*d[1],45/U0*d[1]+r*d[0]],l=Math.hypot(...dr),nn=[-dr[1]/l,dr[0]/l];fwd.push([r*d[0]+nn[0]*w,r*d[1]+nn[1]*w]);bak.push([r*d[0]-nn[0]*w,r*d[1]-nn[1]*w]);}return[...fwd,...bak.reverse()];};
 PK.def(224,{S:0.3,summary:'An expanding pulley. Six arms with curved shoes slide in radial channels on the hub; a plate above them has six curved slots, and a stud on each arm runs in one. Turn the plate on the hub and all six arms slide out (or in) together, changing the pulley’s size; clamp it and drive the belt.',
  parts:[{id:'h',name:'Hub disk',role:'driver',layer:0,shape:S=>S.disk(Rb,[[0,0]],96)},{id:'wg',name:'Channel wedge (glue to the hub)',role:'driver',qty:6,layer:1,shape:{o:wedge,h:[]}},
   {id:'a',name:'Sliding arm with shoe',role:'link',qty:6,layer:1,shape:S=>({o:[[-12,-5],[31,-5],[31,-20],[41,-20],[41,20],[31,20],[31,5],[-12,5]],h:[]}),pins:[[0,0,2]]},
   {id:'pl',name:'Slotted plate',role:'link',layer:2,shape:S=>({o:S.circle(80,96),h:[S.hole(0,0),...[0,1,2,3,4,5].map(slot)]}),bosses:[[0,-40,10,3]]}],
  ground:[[A[0],A[1],0,2]],
  pose(g){const psi=-U0*(g.r-60)/45,rs=g.r-35,o={h:[A[0],A[1],g.phi],pl:[A[0],A[1],g.phi+psi],wg:[],a:[]};for(let k=0;k<6;k++){const a=g.phi+k*PI/3;o.wg.push([A[0],A[1],a]);o.a.push([A[0]+rs*Math.cos(a),A[1]+rs*Math.sin(a),a]);}return o;},
  drive:'Turn the slotted plate against the hub: the six shoes move out or in together.'});}

/* 227–229 chain and pocketed pulleys */
for(const [n,style] of [[227,'alt'],[228,'alt'],[229,'flat']]){const sim=window.MB.SIMS[n];if(!sim)continue;const p=22,Np=8,R=p*Np/PI,D=14*p,A=[400-D/2,260],B=[400+D/2,260],Ltot=2*D+TAU*R,N=Math.round(Ltot/p),s=0.3;
 const at=sv=>{sv=((sv%Ltot)+Ltot)%Ltot;if(sv<D)return[A[0]+sv,A[1]-R];if(sv<D+PI*R){const t=-PI/2+(sv-D)/R;return[B[0]+R*Math.cos(t),B[1]+R*Math.sin(t)];}if(sv<2*D+PI*R)return[B[0]-(sv-D-PI*R),B[1]+R];const t=PI/2+(sv-2*D-PI*R)/R;return[A[0]+R*Math.cos(t),A[1]+R*Math.sin(t)];};
 const step=style==='alt'?2:1,pk=step*p/R,cB=-PI/2+(p/2-D)/R,cA=PI/2+(p/2-2*D-PI*R)/R;
 const link=K.prism(K.rrect(1.4*p*s,4.6,2.3,10,0,0),[K.rrect(1.4*p*s-3.2,1.4,0.7,8,0,0)],-0.8,0.8),zc=PK.TH/2;
 const wheel=c0=>({o:Array.from({length:Np*step*24},(_,i)=>{const t=i/(Np*step*24)*TAU,k=Math.round((t-c0)/pk),dt=Math.abs(t-c0-k*pk)*R;return[(dt<0.75*p?R-9:R-6)*Math.cos(t),(dt<0.75*p?R-9:R-6)*Math.sin(t)];}),h:[Sh.hole(0,0)]});
 PK.def(n,{S:s,summary:style==='alt'?'An oval-link chain, every other link standing on edge, running on two pocketed pulleys: the flat links lie in the pockets and are driven by them, the upright links ride clear over the rim between.':'A flat-link chain on two pocketed pulleys: every link lies in a pocket and the pockets drive the chain without slipping.',
  parts:[{id:'pa',name:'Driving pocket wheel',role:'driver',layer:1,shape:wheel(cA),bosses:[[0,-26,12,3]]},{id:'pb',name:'Driven pocket wheel',role:'driven',layer:1,shape:wheel(cB)},
   {id:'lf',name:'Flat link',role:'link',qty:style==='alt'?N/2:N,layer:1,mesh:K.xf(link,M4.T(0,0,zc))},...(style==='alt'?[{id:'lv',name:'Upright link',role:'link',qty:N/2,layer:1,mesh:link}]:[])],
  ground:[[A[0],A[1],1,1],[B[0],B[1],1,1]],
  pose(g){const tr=g.s,o={pa:[A[0],A[1],tr/R],pb:[B[0],B[1],tr/R],lf:[],lv:[]};for(let i=0;i<N;i++){const s0=i*p+tr,q0=at(s0),q1=at(s0+p),c=[(q0[0]+q1[0])/2,(q0[1]+q1[1])/2],a=Math.atan2(q1[1]-q0[1],q1[0]-q0[0]);
     if(style==='alt'&&i%2)o.lv.push(M4.mul(PK.place(c[0],c[1],a,PK.zl(1)+zc),M4.Rx(PI/2)));else o.lf.push([c[0],c[1],a]);}if(style!=='alt')delete o.lv;return o;},
  hardware:['Or use a short length of small chain of the same pitch.'],drive:'Turn the driving wheel by its knob.'});}

/* 230 two connecting rods at right angles on one crank pin */
{const sim=window.MB.SIMS[230],O=sim.O,r=sim.r;
 PK.def(230,{S:0.3,summary:'Two cylinders at right angles, one horizontal and one vertical, work one crank pin through two connecting rods. When one rod is on a dead centre the other is at its best leverage, so the crank never sticks and needs no flywheel.',
  parts:[{id:'c',name:'Crank disk',role:'driver',layer:0,shape:S=>S.disk(80),pins:[[r,0,2]]},{id:'rh',name:'Rod to the horizontal slide',role:'link',layer:1,shape:S=>S.bar(200,12)},{id:'rv',name:'Rod to the vertical slide',role:'link',layer:2,shape:S=>S.bar(200,12)},
   {id:'bh',name:'Horizontal crosshead',role:'driven',layer:0,shape:S=>S.rect(36,56,-12,0,[]),pins:[[0,0,1]]},{id:'bv',name:'Vertical crosshead',role:'driven',layer:0,shape:S=>S.rect(56,36,0,-12,[]),pins:[[0,0,2]]}],
  ground:[[O[0],O[1],0,0]],fixed:[{shape:S=>S.rect(180,8,O[0]-215,O[1]-33),l1:0},{shape:S=>S.rect(180,8,O[0]-215,O[1]+33),l1:0},{shape:S=>S.rect(8,170,O[0]-33,105),l1:0},{shape:S=>S.rect(8,170,O[0]+33,105),l1:0}],
  pose(g){return{c:[O[0],O[1],g.phi],rh:[g.xh,O[1],Math.atan2(g.pin[1]-O[1],g.pin[0]-g.xh)],rv:[O[0],g.yv,Math.atan2(g.pin[1]-g.yv,g.pin[0]-O[0])],bh:[g.xh,O[1],0],bv:[O[0],g.yv,0]};},drive:'Turn the crank disk by its rim; one slide is always past its dead point.'});}

/* 204 rolling contact between shafts at an angle: two friction cones on a common apex */
{const d1=12,d2=30,Hc=U.BT+d2+8,cone=(()=>{const secs=[];for(let k=0;k<=6;k++){const z=(d2-d1)*k/6,r=d1+z;secs.push({o:K.circle(r,96).map(p=>[p[0],p[1],z]),h:[U.octa(U.SH+0.12).map(p=>[p[0],p[1],z])]});}return K.loftS(secs);})();
 const A=[0,0,Hc],eA=[-1,0,0],eB=[0,-1,0],w=(e,t)=>[A[0]+e[0]*t,A[1]+e[1]*t,Hc];
 PK.defS(204,{summary:'Rolling contact between two shafts at right angles: two equal cones whose tips meet at the point where the shaft lines cross. Every point of the line where they touch moves at the same speed on both cones, so they roll without slipping and turn at the same speed. Wrap the cones with a rubber band for grip.',cam:{yaw:0.8,pitch:0.4},
  base:()=>[U.plate(-d2-46,-d2-46,d2*0.4+12,d2*0.4+12),U.wall(-(d2+6),0,'x',[[0,Hc]],18,5,Hc+6),U.wall(-(d2+32),0,'x',[[0,Hc]],18,5,Hc+6),U.wall(0,-(d2+6),'y',[[0,Hc]],18,5,Hc+6),U.wall(0,-(d2+32),'y',[[0,Hc]],18,5,Hc+6)],
  parts:[{id:'a',name:'Driving cone',role:'driver',mesh:cone},{id:'b',name:'Driven cone',role:'driven',mesh:cone},{id:'sa',name:'Shaft',qty:2,mesh:U.shaft(44)},{id:'k',name:'Hand crank',role:'driver',mesh:U.crank()}],
  pose(phi){return{a:U.at(w(eA,d1),eA,phi,[0,0,1]),b:U.at(w(eB,d1),eB,-phi,[0,0,1]),sa:[U.shaftAt(w(eA,d2+19),eA,phi),U.shaftAt(w(eB,d2+19),eB,-phi)],k:U.at(w(eA,d2+41),eA,phi,[0,0,1])};},
  read:phi=>`both cones ${(phi/TAU).toFixed(2)} turns`,drive:'Turn the crank: the second cone turns at the same speed about the other shaft.'});}
