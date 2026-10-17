(function(){const K=window.CAD.K,PK=window.PK,M4=K.M4,PI=Math.PI,TAU=2*PI;const mod=(a,n)=>((a%n)+n)%n;const ropeThru=(...a)=>window.MB.ropeThru(...a);
/* ===== printable models 271–320 (escapements first) ===== */
const U=PK.U,{Sh}=PK,L=PK.Lib;PK._S(0.3);const pxPoly=L.pxPoly;
const rel=(pts,O)=>pts.map(([x,y])=>[x-O[0],y-O[1]]);
const exm=(pts,z0,z1,holes=[])=>PK.ext({o:pts,h:holes},z0,z1);/* px polygon → mm prism (current scale) */
const armPts=(A,B,r)=>K.hull([...K.circle(r,20,A[0],A[1]),...K.circle(r,20,B[0],B[1])]);
const LAY=l=>PK.zl(l)-PK.zl(0);
const escText={238:'A recoil escapement with pallets spanning three and a half teeth of a twenty-tooth wheel: each swing of the pendulum lets one tooth past one pallet, and the wheel drops onto the other.',
 288:'The anchor (recoil) escapement. The pallets on the anchor span seven and a half teeth; as the pendulum swings, one pallet lifts clear and a tooth slides across its slope, pushing the pendulum on, then the wheel drops onto the other pallet, whose sloping face drives the wheel back a little (the recoil).',
 289:'Graham’s dead-beat escapement: the locking faces of the pallets are arcs about the anchor’s pivot, so while a tooth rests on one the wheel stands dead still; the impulse comes only on the slanting ends.',
 290:'A pendulum escapement with the pallets spanning fewer teeth; the anchor works the same way, lifting each pallet in turn.',
 292:'A pin dead-beat: the wheel carries half-round pins on its face and the pallets catch them on their flat sides, with dead (arc) locking faces.',
 297:'A lantern wheel serves as the escape wheel: its round staves are caught and released by the two pallets in turn.',
 303:'A dead-beat whose pallet faces are centred on the pivot, the pallets spanning only four and a half teeth.',
 304:'The pin-wheel escapement: half-round pins on the wheel face are locked on the pallets’ arc faces and give impulse on their slopes.',
 305:'Pin pallets: the crutch carries two round pins instead of shaped pallets, which catch the teeth in turn.',
 306:'A three-toothed escape wheel with pallets above and below it on a frame pivoted to one side, so that one tooth is caught at the top and the next at the bottom; the wheel moves on a sixth of a turn per swing.',
 307:'The three-tooth escapement with long stopping teeth and dead locking faces.',
 309:'A gravity escapement: each pallet is on its own arm. The pendulum lifts one arm clear of the wheel; the wheel turns half a tooth onto the other arm; the lifted arm then falls with the pendulum, so the push on the pendulum is always the arm’s own weight, whatever the clock’s driving force.',
 310:'A three-legged gravity escapement: the arms carrying the pallets are pushed off the wheel’s legs by the pendulum in turn and fall back by their weight.',
 311:'A double three-legged gravity escapement: six legs, the lower pallet set half a step behind the upper.',
 312:'A gravity escapement with a small lifting wheel of ten teeth.',
 296:'The lever escapement: a roller pin on the balance swings the fork of the lever, whose pallets release the escape wheel a tooth at a time; between impulses the lever rests and the balance swings free.',
 302:'Balance and pallets: the balance works the pallets through a fork and roller pin; the wheel’s teeth are caught and released in turn.',
 314:'A lever chronometer: lever, fork and roller pin, with dead locking faces on the pallets.'};

/* pallet (nib) escapements: wheel, anchor or gravity arms, pendulum or balance — all from the simulation's own shapes */
for(const n of [238,288,289,290,292,297,303,304,305,306,307,309,310,311,312,296,302,314]){const sim=window.MB.SIMS[n];if(!sim||!sim.G||!sim.G.sides)continue;
 const G=sim.G,o=G.o,E=G.E,P=G.P,S0=G.N>=24?0.5:0.4,w=o.wheel||'saw',grav=o.layout==='gravity'||o.layout==='gravSide',lever=o.osc==='lever',pinW=w==='pins'||w==='lantern',Lw=pinW?1:0;PK._S(S0);
 const parts=[],T=PK.TH,Gp=PK.GAP;
 if(w==='saw')parts.push({id:'w',name:`Escape wheel, ${G.N} teeth`,role:'driven',layer:0,shape:S=>({o:G.raw[0].pts,h:[S.hole(0,0),...[0,1,2,3].map(k=>S.circle(G.R*0.16,32,G.R*0.45*Math.cos(k*PI/2+PI/4),G.R*0.45*Math.sin(k*PI/2+PI/4)))]})});
 else if(w==='three')parts.push({id:'w',name:`Escape wheel, ${G.N} legs`,role:'driven',layer:0,mesh:K.merge(exm(K.circle(22,40),0,T,[K.circle(PK.BORER/S0,24)]),...G.raw.map(r=>exm(r.pts,0,T)))});
 else if(w==='pins')parts.push({id:'w',name:`Pin wheel, ${G.N} half-round pins`,role:'driven',layer:0,mesh:K.merge(exm(K.circle(G.R+6,96),0,T,[K.circle(PK.BORER/S0,24)]),...G.raw.map(r=>exm(r.pts,T-0.2,LAY(1)+T)))});
 else parts.push({id:'w',name:`Lantern wheel, ${G.N} staves`,role:'driven',layer:0,mesh:K.merge(exm(K.circle(G.R+8,96),0,T,[K.circle(PK.BORER/S0,24)]),...G.raw.map(r=>exm(r.pts,T-0.2,LAY(2)+0.2)),exm(K.circle(G.R+8,96),LAY(2),LAY(2)+T,[K.circle(G.R-16,96)]))});
 const off=(A,r=9)=>{const l=Math.hypot(A[0],A[1])||1;return[A[0]*r/l,A[1]*r/l];},hub=r=>exm(K.circle(r,28),0,T,[K.circle(PK.BORER/S0,24)]);
 if(!grav){let am=K.merge(hub(10),...G.sides.map(sd=>{const t=rel([sd.top],P)[0];return K.merge(exm(armPts(off(t),t,5.5/S0),0,T),exm(rel(sd.nib,P),0,T));}));
   if(lever)am=K.merge(am,exm(armPts([0,-9],[0,-72],5),0,T),exm([[-12,-70],[12,-70],[12,-90],[5,-90],[5,-78],[-5,-78],[-5,-90],[-12,-90]],0,T));
   parts.push({id:'a',name:lever?'Lever with pallets and fork':'Anchor with pallets',role:'link',layer:Lw,mesh:am});}
 else G.sides.forEach((sd,j)=>{const t=rel([sd.top],sd.P)[0];parts.push({id:'g'+j,name:`Gravity arm ${j+1} with pallet`,role:'link',layer:Lw,mesh:K.merge(hub(9),exm(armPts(off(t),t,5/S0),0,T),exm(rel(sd.nib,sd.P),0,T))});});
 const pend=!lever,Ps=grav?[E[0],G.sides[0].P[1]-30]:P,Lp=480-Ps[1];
 if(pend)parts.push({id:'pd',name:'Pendulum (rod and bob)',role:'driver',layer:Lw+1,mesh:K.merge(hub(12),exm(armPts([0,12],[0,Lp-20],7),0,T),exm(K.circle(28,40,0,Lp),0,T))});
 const B=lever?[P[0],P[1]-110]:null,br=o.br||60;
 if(lever){parts.push({id:'bl',name:'Balance',role:'driver',layer:Lw+1,mesh:K.merge(hub(12),exm(K.circle(br,96),0,T,[K.circle(br-9,96)]),...[0,1,2].map(k=>{const a=k*TAU/3+PI/6;return exm(armPts([11*Math.cos(a),11*Math.sin(a)],[(br-6)*Math.cos(a),(br-6)*Math.sin(a)],4),0,T);}))});
   parts.push({id:'rp',name:'Roller with impulse pin (glue under the balance)',role:'driver',layer:Lw,mesh:exm(K.hull([...K.circle(16,32),...K.circle(4,16,0,22)]),0,T,[K.circle(PK.BORER/S0,24)])});}
 const ground=[[E[0],E[1],0,pinW?0:0,false]];
 if(!grav)ground.push([P[0],P[1],Lw,Lw+(pend?1:0)]);else{G.sides.forEach(sd=>ground.push([sd.P[0],sd.P[1],Lw,Lw]));ground.push([Ps[0],Ps[1],Lw+1,Lw+1]);}
 if(lever)ground.push([B[0],B[1],Lw,Lw+1]);
 PK.def(n,{S:S0,up:pend,summary:escText[n],parts,ground,
  pose(g){const out={w:[E[0],E[1],g.W]};if(!grav)out.a=[P[0],P[1],g.a];else G.sides.forEach((sd,j)=>out['g'+j]=[sd.P[0],sd.P[1],g.an[j]]);
   if(pend)out.pd=[Ps[0],Ps[1],g.th];if(lever){out.bl=[B[0],B[1],g.th];out.rp=[B[0],B[1],g.th];}return out;},
  hardware:pend?['A weight on the escape wheel’s arbor (a cord wound on a small drum) to drive it, or turn it gently by hand while swinging the pendulum.']:['A light cord and weight, or a finger, to urge the escape wheel round while the balance is swung.'],
  drive:pend?'Swing the pendulum while urging the wheel round: it steps on a tooth at a time.':'Swing the balance while urging the wheel round.'});}
PK._S(0.3);

/* detent (chronometer) escapements 291, 313, 396 and the detached pendulum 308 */
for(const n of [291,313,396,308]){const sim=window.MB.SIMS[n];if(!sim||!sim.G||!sim.G.Dp)continue;const G=sim.G,o=G.o,E=G.E,B=G.B,Dp=G.Dp,pend=o.osc==='pend',S0=0.5,T=PK.TH;PK._S(S0);
 const hub=r=>exm(K.circle(r,28),0,T,[K.circle(PK.BORER/S0,24)]);
 const det=K.merge(hub(9),exm(armPts([0,0].map((v,i)=>v),rel([G.Ql],Dp)[0],4),0,T),exm(rel(G.stone,Dp),0,T));
 const pal=G.pal;/* roller frame: x radial */const roller=K.merge(hub(G.rr-12),exm(pal,0,T));
 const parts=[{id:'w',name:`Escape wheel, ${G.N} teeth`,role:'driven',layer:0,shape:S=>({o:G.raw[0].pts,h:[S.hole(0,0)]})},
  {id:'d',name:'Detent with locking stone',role:'link',layer:0,mesh:det,note:'its spring: a rubber band from the peg to the frame'},
  {id:'r',name:'Impulse roller with pallet',role:'driver',layer:0,mesh:roller}];
 if(pend)parts.push({id:'pd',name:'Pendulum (glue to the roller)',role:'driver',layer:1,mesh:K.merge(hub(12),exm(armPts([12,0],[G.rr+180,0],7),0,T),exm(K.circle(26,40,G.rr+200,0),0,T))});
 else parts.push({id:'bl',name:'Balance (glue on the roller)',role:'driver',layer:1,mesh:K.merge(hub(12),exm(K.circle(70,96),0,T,[K.circle(61,96)]),...[0,1,2].map(k=>{const a=k*TAU/3;return exm(armPts([11*Math.cos(a),11*Math.sin(a)],[64*Math.cos(a),64*Math.sin(a)],4),0,T);}))});
 PK.def(n,{S:S0,up:pend,summary:({291:'A detent watch escapement: the wheel is held by a stone on a spring detent. Once in each double swing the balance’s discharging pallet flicks the detent aside; the wheel turns, one tooth drives the impulse pallet on the balance roller, and the next tooth falls on the stone. On the return swing the balance passes without touching anything.',
   313:'The chronometer (detent) escapement: the escape wheel locks on the detent stone and gives the balance one clean impulse in every double swing; the rest of the time the balance swings free.',
   396:'Reed’s escapement, worked like a detent: the wheel is locked between impulses and the balance receives one impulse in each double swing.',
   308:'A detached pendulum escapement: the wheel is held by a detent and gives the pendulum a push only once in each double swing, so the pendulum swings free for nearly all the time.'})[n],
  parts,ground:[[E[0],E[1],0,0,false],[Dp[0],Dp[1],0,0],[B[0],B[1],0,1]],
  pose(g){const o2={w:[E[0],E[1],g.W],d:[Dp[0],Dp[1],g.del],r:[B[0],B[1],g.th+G.c0]};if(pend)o2.pd=[B[0],B[1],g.th+G.c0];else o2.bl=[B[0],B[1],g.th];return o2;},
  hardware:['A rubber band as the detent spring.','A weight on a cord round the wheel’s arbor, or a finger, to urge the wheel round.'],drive:pend?'Swing the pendulum while urging the wheel.':'Swing the balance while urging the wheel round.'});}
PK._S(0.3);

/* duplex 300, 301 */
for(const n of [300,301]){const sim=window.MB.SIMS[n];if(!sim||!sim.G||!sim.G.roller)continue;const G=sim.G,o=G.o,E=G.E,B=G.B,S0=0.7,T=PK.TH;PK._S(S0);
 const hub=r=>exm(K.circle(r,28),0,T,[K.circle(PK.BORER/S0,24)]);
 PK.def(n,{S:S0,summary:'The duplex escapement: long teeth rest on a small roller on the balance staff. Once in each double swing a notch in the roller lets one tooth through, and an impulse pin standing on the wheel’s face then drives the pallet arm on the balance. (Drawn '+(n===300?'from the front.':'again from the side in Brown; same parts.')+')',
  parts:[{id:'w',name:`Escape wheel, ${G.N} long teeth`,role:'driven',layer:0,shape:S=>({o:G.teeth.pts,h:[S.hole(0,0)]}),bosses:G.pins.map(q=>{const c=q.pts.reduce((a,p)=>[a[0]+p[0]/q.pts.length,a[1]+p[1]/q.pts.length],[0,0]);return[c[0],c[1],PK.TH+PK.GAP,G.o.rpin?G.o.rpin*S0:3*S0*0.9];})},
   {id:'r',name:'Locking roller with notch',role:'driver',layer:0,mesh:exm(G.roller,0,T,[K.circle(PK.BORER/S0,20)])},
   {id:'p',name:'Impulse pallet arm',role:'driver',layer:1,mesh:K.merge(hub(8),exm(armPts([8,0],[G.Lp-6,0],3),0,T),exm(G.pal,0,T))},
   {id:'bl',name:'Balance',role:'driver',layer:2,mesh:K.merge(hub(10),exm(K.circle(60,96),0,T,[K.circle(52,96)]),...[0,1,2].map(k=>{const a=k*TAU/3;return exm(armPts([9*Math.cos(a),9*Math.sin(a)],[55*Math.cos(a),55*Math.sin(a)],3),0,T);}))}],
  ground:[[E[0],E[1],0,0,false],[B[0],B[1],0,2]],
  pose(g){const th=g.th;return{w:[E[0],E[1],g.W],r:[B[0],B[1],PI/2+th-(o.tn??0.1)],p:[B[0],B[1],PI/2+th-(o.tp??-0.4)],bl:[B[0],B[1],th]};},drive:'Swing the balance while urging the wheel round.'});}
PK._S(0.3);

/* cylinder 294, 295 */
for(const n of [294,295,402]){const sim=window.MB.SIMS[n];if(!sim||!sim.G||!sim.G.band)continue;const twin=n===402,rg=40,B2=[0,0];const G=sim.G,o=G.o,E=G.E,Cc=G.Cc,S0=0.6,T=PK.TH;PK._S(S0);
 const hub=r=>exm(K.circle(r,28),0,T,[K.circle(PK.BORER/S0,24)]);
 const wheel=K.merge(exm(K.circle(G.R-28,64),0,T,[K.circle(PK.BORER/S0,24)]),...G.stalks.map(q=>exm(q.pts,0,T)),...G.heads.map(q=>exm(q.pts,T-0.2,PK.zl(1)-PK.zl(0)+T)));
 const Hb=PK.zl(3)-PK.zl(1)+T+3;
 PK.def(n,{S:S0,summary:twin?'A cylinder escapement with twin balances: the balance on the cylinder staff is geared to a second, equal balance, so the two always turn in opposite directions. A jolt that would hurry one would hold back the other, so the pair keep time undisturbed; the escape wheel works through the half-cylinder exactly as in the ordinary cylinder escapement.':'The cylinder escapement: the balance staff is a half-cylinder standing at the rim of the escape wheel. Each tooth is a wedge raised on a stalk; it rests on the outside of the cylinder, slips in through the opening (its slope pushing the lip), rests on the inside, and leaves on the return swing, pushing the other lip: an impulse on every swing.',
  parts:[{id:'w',name:`Escape wheel, ${G.N} raised wedge teeth`,role:'driven',layer:0,mesh:wheel,note:'print upright as one piece; the wedges stand on the ends of the stalks'},
   {id:'c',name:'Half-cylinder',role:'driver',layer:1,mesh:exm(G.band,0,T)},{id:'cc',name:twin?'Cylinder cap with staff, gear and balance (glue on the cylinder)':'Cylinder cap with staff (glue on the cylinder)',role:'driver',layer:2,mesh:twin?K.merge(exm(K.circle(G.ro,40),0,T),K.cyl(PK.PINR-0.05,T,Hb,20),exm(Sh.gearOutline(rg,20),Hb-1,Hb-1+T),exm(K.circle(36,48),Hb-1+T+0.5,Hb+2*T,[K.circle(30,48)]),...[0,1,2].map(k=>exm(armPts([0,0],[33*Math.cos(k*TAU/3),33*Math.sin(k*TAU/3)],2.5),Hb-1+T+0.5,Hb+2*T))):K.merge(exm(K.circle(G.ro,40),0,T),K.cyl(PK.PINR-0.05,T,Hb,20),K.cyl(5,Hb,Hb+3,24))},
   ...(twin?[{id:'b2',name:'Second balance with its gear',role:'driven',layer:5,dz:1.5,mesh:K.merge(exm(Sh.gearOutline(rg,20),0,T,[K.circle(PK.BORER/S0,24)]),exm(K.circle(36,48),T+0.5,2*T+1,[K.circle(30,48)]),...[0,1,2].map(k=>exm(armPts([0,0],[33*Math.cos(k*TAU/3),33*Math.sin(k*TAU/3)],2.5),T+0.5,2*T+1)),exm(K.circle(6,24),T+0.5,2*T+1,[K.circle(PK.BORER/S0,24)]))}]:[]),
   {id:'br',name:'Bridge',role:'frame',layer:3,shape:S=>({o:[[Cc[0]-18,Cc[1]-14],[Cc[0]-18,Cc[1]+14],[Cc[0]+G.R+40,Cc[1]+30],[Cc[0]+G.R+40,Cc[1]-30]],h:[S.hole(Cc[0],Cc[1]),S.hole(Cc[0]+G.R+24,Cc[1]-14),S.hole(Cc[0]+G.R+24,Cc[1]+14)]})}],
  ground:[[E[0],E[1],0,0,false],[Cc[0]+G.R+24,Cc[1]-14,3,3],[Cc[0]+G.R+24,Cc[1]+14,3,3],...(twin?[[Cc[0],Cc[1]-2*rg,5,7]]:[])],
  pose(g){const a=g.th+(o.c0??PI/2),q={w:[E[0],E[1],g.W],c:[Cc[0],Cc[1],a],cc:[Cc[0],Cc[1],a],br:[0,0,0]};if(twin)q.b2=[Cc[0],Cc[1]-2*rg,-a+PI/20];return q;},drive:'Turn the staff knob to and fro while urging the wheel round: a wedge passes through the cylinder at each swing.'});}
PK._S(0.3);

/* verge escapements 234, 293, 298, 299 (spatial) */
for(const n of [234,293,298,299]){const sim=window.MB.SIMS[n];if(!sim||!sim.G||!sim.G.tooth)continue;const G=sim.G,o=G.o,s=0.35,Rc=G.Rc*s,h=G.h*s,Pp=G.P*s,xs=G.xs*s,Lf=G.Lf*s,Hc=U.BT+Rc+14,zt=Hc+Rc+2*s,zb=Hc-Rc-2*s;
 const teeth=[];for(let k=0;k<G.N;k++){const t=k*TAU/G.N,c=Math.cos(t),sn=Math.sin(t);const pr=[[-0.62*Pp,0],[0,h],[-0.12*Pp,0]];
   /* extrude the profile radially: build as a prism in the tooth's own frame then place */const m=K.prism(pr.map(([sg,x])=>[sg,x]),[],0,2);teeth.push(K.xf(m,[ -sn,c,0,0, 0,0,1,0, c,sn,0,0, c*(Rc-2),sn*(Rc-2),3,1]));}
 const crown=K.merge(K.prism(K.circle(Rc+1,96),[U.octa(U.SH+0.12)],0,3),...teeth);
 const flag=K.box(Lf,1.2*1+0.6,0,4,Lf/2,0);/* along +x from the staff axis */
 const staffL=zt-zb+40,staff=K.merge(K.cyl(1.6,0,staffL,16));
 const osc=o.osc==='bal'?K.merge(K.prism(K.circle(24,64),[K.circle(21,64)],0,3),K.box(46,3,0,3,0,0),K.cyl(3,0,3,16)):o.osc==='pend'?K.merge(K.box(3,14,0,3,0,7),K.box(3,3,0,3,0,14)):K.merge(K.box(100,3,0,3,0,0),K.box(8,8,0,8,45,0),K.box(8,8,0,8,-45,0));
 PK.defS(n,{summary:({234:'The verge and foliot, the oldest mechanical clock escapement. The crown wheel’s teeth stand on its face; the verge staff lies across them with two flag pallets about a hundred degrees apart, one meeting the teeth at the top of the wheel and one at the bottom, where they move opposite ways. Each swing of the weighted foliot lets one flag go and brings the other in front of a tooth, which pushes it back: the foliot is driven to and fro and the wheel recoils at every beat.',
   298:'The old watch (verge) escapement: the same crown wheel and verge, with a balance wheel on the verge staff in place of the foliot.',
   299:'The old clock escapement: the verge worked by a short pendulum hung from the staff.',
   293:'A crown-wheel watch escapement: crown teeth on the wheel face, the verge with its two pallets, and a balance on the staff.'})[n],cam:{yaw:0.7,pitch:0.25},
  base:()=>[U.plate(-20,-34,xs+22,34),U.wall(-12,0,'x',[[0,Hc]],22,5,Hc+8),K.box(14,5,U.BT,zt+30,xs,-26),K.box(8,26,zb-8,zb-5,xs,-13),K.box(8,26,zt+20,zt+23,xs,-13)],
  parts:[{id:'cw',name:`Crown wheel, ${G.N} teeth`,role:'driven',mesh:crown},{id:'ar',name:'Crown wheel arbor',mesh:U.shaft(30)},{id:'st',name:'Verge staff',role:'driver',mesh:staff},{id:'f',name:'Flag pallet (glue on the staff)',role:'driver',qty:2,mesh:flag},{id:'os',name:o.osc==='bal'?'Balance':o.osc==='pend'?'Pendulum crutch':'Foliot with weights',role:'driver',mesh:osc}],
  pose(phi,g){const W=g.W||0,th=g.th||0;const Rot=M4.mul(M4.T(0,0,Hc),M4.mul(M4.Ry(PI/2),M4.Rz(W)));
   return{cw:Rot,ar:U.shaftAt([-12,0,Hc],[1,0,0],W),st:M4.T(xs,0,zb-20),f:[M4.mul(M4.T(xs,0,zt-2),M4.Rz(PI-G.al+th)),M4.mul(M4.T(xs,0,zb-2),M4.Rz(PI+G.al+th))],os:M4.mul(M4.T(xs,0,zt+26),M4.Rz(th))};},
  read:(phi,g)=>`crown wheel ${((g.W||0)/TAU*G.N).toFixed(1)} teeth`,hardware:['A small weight on a cord round the crown wheel arbor to drive it.'],drive:'Swing the foliot (or balance) to and fro while the weight urges the crown wheel round.'});}

/* ---------------- 271–287, 315–320 ---------------- */
PK.Lib.grooveLeverModel(281,'A disk with a closed groove cut in its face, not quite concentric. A peg on the lever runs in the groove, so as the disk turns the lever swings to and fro, positively both ways.');
PK.Lib.camFlatModel(286,'A curved toe on a rocking shaft lifts a valve rod: as the shaft rocks, the toe’s curved back rolls under the rod’s foot and raises it, and lets it down again.');
PK.Lib.crankSlideModel(279,'A crank works a slotted cross-head; the crank pin carries a sliding box in the slot. Brown’s pin can be set nearer or farther from the centre to change the stroke.');
PK.Lib.govModel(274,'A flyball governor whose balls are guided: as the spindle speeds up the balls fly out and lift the sleeve on the spindle.');
PK.Lib.govModel(287,'A spring governor: springs, not the balls’ weight, resist their flying out, so it works in any position.');

/* 271 rocking lever with two pawls drives a ratchet bar on both strokes */
{const sim=window.MB.SIMS[271],Pv=sim.Pv,arm=sim.arm,p=sim.p,y=sim.yt+9,Lp=sim.Lp,S0=0.25;PK._S(S0);
 const teeth=[];for(let x=-200;x<=760;x+=p)teeth.push([x,y],[x,y-18],[x+p-2,y-1]);
 PK.def(271,{S:S0,summary:'A rocking lever with two pawls hinged on its cross-arm, both leaning the same way. Whichever hinge is going down pushes its pawl and the bar along; the other pawl slides back over the teeth. So the bar moves on almost continuously, on both strokes of the lever.',
  parts:[{id:'b',name:'Ratchet bar',role:'driven',layer:0,t:2,shape:{o:[[-200,y+30],...teeth,[760,y+30]],h:[]}},{id:'lv',name:'Rocking lever with cross-arm',role:'driver',layer:0,shape:S=>S.lever([[0,0,16],[-arm,0,8],[arm,0,8],[0,-150,9]],[[0,0]]),pins:[[-arm,0,1],[arm,0,1]],bosses:[[0,-140,14,3.5]]},
   {id:'pw',name:'Pawl',role:'link',qty:2,layer:1,shape:S=>S.lever([[0,0,7],[Lp,0,5]],[[0,0]])}],
  ground:[[Pv[0],Pv[1],0,0]],fixed:[{shape:S=>S.rect(900,8,280,y+40),l1:1}],
  pose(g,s){const X=((s.X%(10*p))+10*p)%(10*p),o={b:[X-120,0,0],lv:[Pv[0],Pv[1],-g.a],pw:[]};for(const t of g.T)o.pw.push([t.pv[0],t.pv[1],Math.atan2(t.tip[1]-t.pv[1],t.tip[0]-t.pv[0])]);return o;},drive:'Rock the lever by its knob.'});
 PK._S(0.3);}

/* 275 worm and rack */
{const m=1.6,p=PI*m,rp=6,Hw=U.BT+12,L=8*p;
 PK.defS(275,{summary:'A worm drives a rack lying along it: each turn of the worm moves the rack on by one tooth. Brown’s rack slides in a guide above the worm.',cam:{yaw:0.6,pitch:0.4},
  base:()=>[U.plate(-56,-16,56,16),U.wall(-L/2-8,0,'x',[[0,Hw]],16,5,Hw+6),U.wall(L/2+8,0,'x',[[0,Hw]],16,5,Hw+6),K.box(110,3,Hw+rp+m*2.4,Hw+rp+m*2.4+2,0,-7),K.box(110,3,Hw+rp+m*2.4,Hw+rp+m*2.4+2,0,7)],
  parts:[{id:'w',name:'Worm',role:'driver',mesh:U.worm(rp,p,L)},{id:'r',name:'Rack',role:'driven',mesh:K.xf(U.rack(100,m,4,10),M4.mul(M4.T(0,5,0),M4.Rx(PI/2)))},{id:'s',name:'Worm shaft',mesh:U.shaft(L+30)},{id:'k',name:'Hand crank',role:'driver',mesh:U.crank()}],
  pose(phi,g){const x=(g.x||0)*0.3*p/ (20*0.3) ,wa=g.wa||0;return{w:U.at([-L/2,0,Hw],[1,0,0],wa,[0,0,1]),r:M4.mul(M4.T(x,0,Hw+rp-m),M4.Rx(PI)),s:U.shaftAt([0,0,Hw],[1,0,0],wa),k:U.at([-L/2-14,0,Hw],[-1,0,0],-wa,[0,0,1])};},
  read:(phi,g)=>`rack ${((g.x||0)/20).toFixed(2)} teeth`,drive:'Turn the crank one way and the other: the rack runs back and forth.'});}

/* 276 constant-width (Reuleaux) cam in a square yoke */
{const sim=window.MB.SIMS[276],O=sim.O,D=sim.D,cam=sim.pts(0).map(([x,y])=>[x-O[0],y-O[1]]);
 PK.def(276,{S:0.3,summary:'A cam of constant width (a curved triangle) turning inside a square yoke. It touches both sides at once all the way round, so the yoke is pushed to and fro and held positively both ways, with a rest at each end.',
  parts:[{id:'c',name:'Constant-width cam',role:'driver',layer:0,shape:pxPoly(cam),bosses:[[0,-30,14,3.5]]},{id:'y',name:'Square yoke with rods',role:'driven',layer:0,shape:S=>({o:[[-20,-120],[D+20,-120],[D+20,-10],[D+300,-10],[D+300,10],[D+20,10],[D+20,120],[-20,120],[-20,10],[-300,10],[-300,-10],[-20,-10]],h:[[[0,-100],[D,-100],[D,100],[0,100]]]})}],
  ground:[[O[0],O[1],0,0]],fixed:[[-260,-18],[-260,18],[D+260,-18],[D+260,18]].map(([dx,dy])=>({shape:S=>S.rect(60,8,O[0]+dx-D/2,O[1]+dy),l1:0})),
  pose(g){return{c:[O[0],O[1],g.phi],y:[g.mn,O[1],0]};},drive:'Turn the cam by its knob: the yoke moves, rests, and moves back.'});}

/* 277 revolver: cocking the hammer turns the cylinder through a ratchet */
{const sim=window.MB.SIMS[277],O=[330,280],H=[560,320];
 PK.def(277,{S:0.3,summary:'A revolver lock: as the hammer is drawn back, the hand (a pawl hinged on the hammer) pushes a six-toothed ratchet on the back of the cylinder round one chamber, bringing the next chamber in line.',
  parts:[{id:'cy',name:'Cylinder with six chambers',role:'driven',layer:0,shape:S=>({o:S.circle(110,96),h:[S.hole(0,0),...[0,1,2,3,4,5].map(i=>S.circle(20,32,70*Math.cos(i*PI/3),70*Math.sin(i*PI/3)))]})},{id:'rt',name:'Ratchet (glue on the cylinder)',role:'driven',layer:1,shape:S=>S.ratchet(36,6,14,1)},
   {id:'hm',name:'Hammer',role:'driver',layer:1,shape:S=>({o:[[0,8],[-30,-110],[-10,-122],[22,-10],[20,14]],h:[S.hole(0,0)]}),pins:[[0,0,1]].slice(0,0)},{id:'hd',name:'Hand (pawl)',role:'link',layer:2,shape:S=>S.lever([[0,0,7],[Math.hypot(O[0]+30-H[0],O[1]+40-H[1]),0,5]],[[0,0]])}],
  ground:[[O[0],O[1],0,1],[H[0],H[1],1,2]],
  pose(g){const ha=-0.9*g.cock,tip=[O[0]+30,O[1]+40-20*g.cock];return{cy:[O[0],O[1],g.s*TAU/6],rt:[O[0],O[1],g.s*TAU/6],hm:[H[0],H[1],ha],hd:[H[0],H[1],Math.atan2(tip[1]-H[1],tip[0]-H[0])]};},drive:'Draw the hammer back: the cylinder turns one chamber.'});}

/* 278 hoist safety catch */
{const sim=window.MB.SIMS[278],X=400;
 const rackPts=s=>{const o=[[X+s*160,40],[X+s*160,480]];for(let y=470;y>=50;y-=18)o.push([X+s*140,y+18],[X+s*140,y],[X+s*130,y+18]);return o;};
 PK.def(278,{S:0.25,up:true,summary:'A safety catch for a hoist cage: two pawls pivoted on the cage are held in by the pull of the rope through a spring link. If the rope breaks, the spring throws the pawls out into the ratchet teeth on the guides and the cage is caught.',
  parts:[{id:'c',name:'Cage',role:'driven',layer:0,shape:S=>({o:[[X-110,0],[X+110,0],[X+110,140],[X-110,140]].map(([x,y])=>[x-X,y]),h:[]}),pins:[[-60,10,1],[60,10,1]]},{id:'p',name:'Safety pawl',role:'link',qty:2,layer:1,shape:S=>S.lever([[0,0,8],[70,0,6]],[[0,0]])}],
  fixed:[{shape:S=>({o:rackPts(1).map(([x,y])=>[x,y]),h:[]}),l1:1},{shape:S=>({o:rackPts(-1).reverse(),h:[]}),l1:1}].slice(0,0).concat([{shape:S=>S.rect(20,440,X-150,260),l1:1},{shape:S=>S.rect(20,440,X+150,260),l1:1}]),
  ground:[],plate:{x0:X-190,y0:20,x1:X+190,y1:500},
  pose(g){const Y=220+g.y,out=g.broke?1:0,o={c:[X,Y,0],p:[]};for(const s of [-1,1])o.p.push([X+s*60,Y+10,s<0?PI-(0.5*out-0)*1:0.5*out*-1]);return o;},drive:'Display model: the pawls swing out when the rope breaks.'});}

/* 280 friction lever windlass (display) */
{const sim=window.MB.SIMS[280],O=[360,280];
 PK.def(280,{S:0.25,summary:'A windlass driven by a lever that grips the drum’s rim by friction: on the forward stroke the shoe on the lever jams against the rim and turns the drum; on the back stroke it slips. A pawl (not shown) keeps the drum from running back.',
  parts:[{id:'d',name:'Drum with rim',role:'driven',layer:0,shape:S=>S.disk(130,[[0,0]],96)},{id:'lv',name:'Lever with gripping shoe',role:'driver',layer:1,shape:S=>({o:K.hull([...K.circle(16,24),...K.circle(12,24,0,-330)]),h:[S.hole(0,0)]}),bosses:[[0,-320,14,3.5]]},{id:'sh',name:'Shoe',role:'link',layer:0,shape:S=>S.disk(12,[[0,0]],24)}],
  ground:[[O[0],O[1],0,1]],
  pose(g,s){const la=-PI/2+g.a,G=[O[0]+138*Math.cos(la+0.15),O[1]+138*Math.sin(la+0.15)];return{d:[O[0],O[1],s.w],lv:[O[0],O[1],g.a],sh:[G[0],G[1],0]};},drive:'Rock the lever: the drum turns one way only.'});}

/* 283 handle and pinion work two pump racks */
{const sim=window.MB.SIMS[283],P=[400,240],m=6;
 PK.def(283,{S:0.3,summary:'A swinging handle turns a pinion between two racks, one on each side: as one rack goes up the other comes down, working two pump plungers alternately.',
  parts:[{id:'p',name:'Pinion with handle',role:'driver',layer:0,mesh:K.merge(PK.ext(Sh.gear(60,20),0,PK.TH),PK.ext({o:K.hull([...K.circle(14,24,0,0),...K.circle(10,24,260*Math.cos(-PI/2+0.9),260*Math.sin(-PI/2+0.9))]),h:[]},PK.TH+PK.GAP,PK.TH*2+PK.GAP))},
   {id:'rl',name:'Left rack and plunger',role:'driven',layer:0,shape:S=>{const R=S.rack(-80,180,m,14,{c0:0});return{o:R.o.map(([x,y])=>[y,x]),h:[]};}},{id:'rr',name:'Right rack and plunger',role:'driven',layer:0,shape:S=>{const R=S.rack(-80,180,m,14,{c0:0});return{o:R.o.map(([x,y])=>[-y,x]),h:[]};}}],
  ground:[[P[0],P[1],0,1]],fixed:[{shape:S=>S.rect(8,200,P[0]-60-30,P[1]+60),l1:0},{shape:S=>S.rect(8,200,P[0]+60+30,P[1]+60),l1:0}],
  pose(g){return{p:[P[0],P[1],g.a],rl:[P[0]-60,P[1]+g.y,0],rr:[P[0]+60,P[1]-g.y,0]};},drive:'Swing the handle: one rack rises while the other falls.'});}

/* 315 conical pendulum */
{const L=95,al=0.42,H=U.BT+L+20;
 PK.defS(315,{summary:'A conical pendulum: instead of swinging to and fro, the bob is carried round in a circle by an arm on a turning spindle, sweeping out a cone. Its motion is steady, without ticks, which suits driving telescopes and governing.',cam:{yaw:0.5,pitch:0.35},
  base:()=>[U.plate(-45,-45,45,45),K.box(6,6,U.BT,H+8,-38,0),K.box(44,6,H+4,H+8,-18,0),U.post(0,0,U.BT+12,U.BT+3)],
  parts:[{id:'sp',name:'Driving spindle with arm',role:'driver',mesh:K.merge(K.cyl(2.2,0,40,16),K.box(22,4,34,38,11,0))},{id:'r',name:'Pendulum rod with bob',role:'driven',mesh:K.merge(K.cyl(1,0,L,12),K.xf(K.lathe([[0.01,-9],[8,-6],[9,0],[8,6],[0.01,9]],32),M4.T(0,0,L)))}],
  pose(phi){const d=[Math.sin(al)*Math.cos(phi),Math.sin(al)*Math.sin(phi),-Math.cos(al)];return{sp:M4.mul(M4.T(0,0,U.BT+3),M4.Rz(phi)),r:M4.mul(U.at([0,0,H],d,0,[0,0,1]),M4.T(0,0,0))};},
  read:()=>'the bob runs round a circle',drive:'Turn the spindle steadily: the bob sweeps a cone.'});}

/* 316, 317 temperature-compensated pendulums (display) */
for(const n of [316,317]){const sim=window.MB.SIMS[n];if(!sim)continue;const A=[400,60];
 PK.def(n,{S:0.25,up:true,summary:n===316?'A mercury pendulum: the bob is a jar of mercury. When heat lengthens the rod and lowers the bob, the mercury expands upward in the jar, raising its centre of weight by the same amount, so the effective length stays the same.':'A compensation pendulum: brass rods, which expand more than iron, are set to lift the bob as the iron rod stretches, keeping the pendulum’s length constant.',
  parts:[{id:'p',name:n===316?'Pendulum rod with mercury jar':'Pendulum with brass and iron rods',role:'driver',layer:0,mesh:K.merge(PK.ext({o:K.hull([...K.circle(8,20),...K.circle(5,16,0,330)]),h:[Sh.hole(0,0)]},0,PK.TH),n===316?PK.ext(Sh.rect(60,110,0,345),0,PK.TH*2):K.merge(PK.ext(Sh.rect(10,160,-20,250),0,PK.TH),PK.ext(Sh.rect(10,160,20,250),0,PK.TH),PK.ext({o:K.circle(26,40,0,330),h:[]},0,PK.TH*1.5)))}],
  ground:[[A[0],A[1],0,0]],plate:{x0:300,y0:20,x1:500,y1:460},
  pose(g){return{p:[A[0],A[1],g.th]};},drive:'Swing the pendulum.'});}

/* 318 watch regulator: curb pins on a lever over the balance spring */
{const sim=window.MB.SIMS[318],B=[360,270];
 PK.def(318,{S:0.25,summary:'A watch regulator: two curb pins on the regulator lever embrace the outer coil of the balance spring. Moving the lever toward F shortens the working length of the spring and the balance swings faster; toward S, slower.',params:sim.params,
  parts:[{id:'b',name:'Balance',role:'driver',layer:0,mesh:K.merge(PK.ext({o:K.circle(110,96),h:[K.circle(100,96)]},0,PK.TH),...[0,1,2].map(k=>{const a=k*TAU/3;return PK.ext({o:K.hull([...K.circle(5,16,10*Math.cos(a),10*Math.sin(a)),...K.circle(5,16,104*Math.cos(a),104*Math.sin(a))]),h:[]},0,PK.TH);}),PK.ext({o:K.circle(14,24),h:[Sh.hole(0,0)]},0,PK.TH))},
   {id:'l',name:'Regulator lever with curb pins',role:'link',layer:1,shape:S=>S.lever([[0,0,14],[200,0,8]],[[0,0]]),bosses:[[88,-5,6,1],[88,5,6,1]]}],
  ground:[[B[0],B[1],0,1]],
  pose(g,s,phi){const p=(s.P&&s.P.p)||0.3;return{b:[B[0],B[1],g.th],l:[B[0],B[1],-PI/2+p*0.6]};},hardware:['A balance spring: a flat spiral of thin wire (or printed 0.4 mm strip) between the staff and the stud.'],drive:'Set the lever; swing the balance.'});}

/* 319 compensation balance (display) */
{const sim=window.MB.SIMS[319],B=[400,270],r=130;
 PK.def(319,{S:0.25,summary:'A compensation balance: the rim is cut in two, each half of brass outside and steel inside. Heat weakens the balance spring, but it also curls the rim halves inward (brass expands more), carrying their weights nearer the centre so the balance keeps time.',params:sim.params,
  parts:[{id:'b',name:'Balance arm',role:'driver',layer:0,shape:S=>S.lever([[-r,0,8],[0,0,14],[r,0,8]],[[0,0]])},{id:'h',name:'Bimetal rim half with weight',role:'driver',qty:2,layer:1,shape:S=>({o:[...Array.from({length:30},(_,i)=>{const t=0.05+i/29*(PI-0.3);return[r*Math.cos(t),r*Math.sin(t)];}),...Array.from({length:30},(_,i)=>{const t=PI-0.25-i/29*(PI-0.3);return[(r-12)*Math.cos(t),(r-12)*Math.sin(t)];})],h:[]}),bosses:[[ (r-6)*Math.cos(PI-0.6),(r-6)*Math.sin(PI-0.6),5,2.5]]}],
  ground:[[B[0],B[1],0,1]],
  pose(g){return{b:[B[0],B[1],g.th],h:[[B[0],B[1],g.th],[B[0],B[1],g.th+PI]]};},drive:'Swing the balance.'});}
PK._S(0.3);
/* 320 Huygens' endless chain (display) */
{const sim=window.MB.SIMS[320],A=[300,140],B=[500,140],r=50;
 PK.def(320,{S:0.3,up:true,summary:'Huygens’ endless chain: one loop of cord runs over the going pulley on the clock and a winding pulley with a click, with the driving weight hanging in one bight and a small counterweight in the other. Pulling the free side raises the weight, while the going pulley is pulled round all the time: the clock never stops while it is wound.',
  parts:[{id:'a',name:'Going pulley (on the clock)',role:'driven',layer:0,shape:S=>S.disk(r,[[0,0]],64)},{id:'b',name:'Winding pulley with click wheel',role:'driver',layer:0,shape:S=>S.ratchet(r,24,6,1)},{id:'wp',name:'Weight pulley and weight',role:'link',layer:0,mesh:K.merge(PK.ext(Sh.disk(26,[[0,0]],40),0,PK.TH),PK.ext(Sh.rect(60,70,0,61,[]),0,PK.TH))},{id:'cp',name:'Counterweight pulley',role:'link',layer:0,shape:S=>S.disk(22,[[0,0]],40)}],
  ground:[[A[0],A[1],0,0],[B[0],B[1],0,0]],plate:{x0:200,y0:60,x1:600,y1:520},
  pose(g){return{a:[A[0],A[1],g.go],b:[B[0],B[1],g.b],wp:[A[0]+r,g.yW,-g.go],cp:[B[0]+r-24,780-g.yW,g.b]};},hardware:['An endless loop of cord (or bead chain) and two small weights.'],drive:'Display model: thread the loop as drawn and pull the free side.'});}

})();
