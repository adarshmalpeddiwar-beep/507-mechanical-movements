/* ================= audit pass 361–400 ================= */
/* 361 · pin clutch: the belt pulley runs loose on the shaft and carries a pin on its face; a collar fixed on the shaft carries another.
   The forked lever slides the pulley along until its pin reaches into the path of the collar's pin: as soon as the pulley pin comes
   round to it, the shaft is picked up and turns with the pulley. Slide it back and the shaft stops. */
reg({num:361,outLabel:'Shaft turns',d:0.35,
  reset(){this.st=null;},
  onAt(phi){return mod(phi,TAU*3)/(TAU*3)<0.55;},
  update(phi){if(!this.st||phi<this.st.phi-1e-9)this.st={phi:0,a:-1.6,eng:false};const st=this.st,h=0.02;
    while(st.phi<phi-1e-9){const s=Math.min(h,phi-st.phi);st.phi+=s;const on=this.onAt(st.phi);
      if(on){if(st.eng)st.a=st.phi-this.d;else{const gap=mod(st.phi-this.d-st.a,TAU);if(gap<0.06){st.eng=true;st.a=st.phi-this.d;}}}else st.eng=false;}
    const on=this.onAt(phi),sl=on?1:0;this.g={phi,a:st.a,on,eng:st.eng,sl};},
  output(){return (this.g.a+1.6)/TAU;},
  draw(){const g=this.g,y=280,X0=150,X1=700,xs=400+30*g.sl,xc=500,rp=44;
    stripeShaft(X0,X1,y,10,g.a,C.part2);for(const x of [180,660]){ctx.beginPath();ctx.rect(x-12,y-14,24,190);paint(C.part2,C.ink);}
    /* loose pulley with its hub groove and face pin */
    drumH(xs-60,y,100,80,g.phi,C['brass-fill']);ctx.beginPath();ctx.rect(xs-150,y-26,40,52);paint(C['brass-fill'],C.ink);ctx.beginPath();ctx.rect(xs-138,y-26,14,52);paint(C.part,C.ink);
    const pinP=(ang,x0,dir,len)=>{const yy=y-rp*Math.cos(ang),front=Math.sin(ang)>-0.2;ctx.save();ctx.globalAlpha=front?1:0.35;ctx.beginPath();ctx.rect(dir>0?x0:x0-len,yy-6,len,12);paint(C.hi,C.ink);ctx.restore();};
    pinP(g.phi,xs-10,1,30);
    /* collar fixed on the shaft, pin toward the pulley */
    drumH(xc+20,y,40,56,g.a,C['steel-fill']);pinP(g.a,xc,-1,30);
    /* belt */
    ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(xs-100,y-80);ctx.lineTo(xs-100,40);ctx.moveTo(xs-20,y-80);ctx.lineTo(xs-20,40);ctx.stroke();ctx.restore();label('BELT',xs-60,34,'center');
    /* forked lever */
    const L=[xs-131,y-26],Pv=[300,120];bar(Pv[0],Pv[1],L[0],L[1]-30,10,C.part);bar(L[0],L[1]-30,L[0],L[1]+6,8,C.part);bar(Pv[0],Pv[1],Pv[0]-90,Pv[1]-70,10,C.part);pivot(Pv[0],Pv[1],5);ground(Pv[0],Pv[1]-10,30,true);label('LEVER',Pv[0]-100,Pv[1]-80,'center');
    /* end view of the two pins */
    const E=[650,110];circ(E[0],E[1],56);paint(C.sheet,C.ink,.8);for(const [ang,f] of [[g.phi,C.hi],[g.a,C['steel-fill']]]){circ(E[0]+rp*Math.sin(ang),E[1]-rp*Math.cos(ang),8);paint(f,C.ink);}pivot(E[0],E[1],4);label('END VIEW OF THE PINS',E[0],E[1]+74,'center');
    label(g.on?(g.eng?'ENGAGED · pulley pin drives the collar pin':'SLID IN · waiting for the pins to meet'):'SLID OUT · pins clear, shaft stands',400,470,'center');label('PULLEY (loose)',xs-60,y+104,'center');label('COLLAR (fast)',xc+20,y+80,'center');},
  reads(){const g=this.g;return[['Pulley',g.on?'slid in':'slid out'],['Shaft',g.eng?'driven':'standing'],['Shaft turns',`${((g.a+1.6)/TAU).toFixed(2)}`]];}});

/* 362 · a drum on a sliding shaft has an endless groove cut slantwise round it; a fixed pin stands in the groove. As the shaft turns
   (driven through a long pulley on a feather key) the slanted groove screws the drum and shaft one way for half a turn and back the
   other way for the next half. */
reg({num:362,outLabel:'Shaft position, mm',A:60,Rd:70,Xp:440,
  update(phi){this.g={phi,x:-this.A*Math.cos(phi)};},output(){return this.g.x;},
  draw(){const g=this.g,y=290,Rd=this.Rd,A=this.A,X=this.Xp+g.x,w=110;
    stripeShaft(60+g.x,740+g.x,y,10,g.phi,C.part2);
    drumH(150,y,90,50,g.phi,C['brass-fill']);label('LONG PULLEY (on a feather key)',150,y+80,'center');for(const x of [90,210,620,740]){ctx.beginPath();ctx.rect(x-8,y-14,16,170);paint(C.part2,C.ink);}
    drumH(X,y,2*A+w,Rd,g.phi,C['steel-fill']);
    /* the slanted groove: axial position A·cos(θ) at drum angle θ; front half drawn solid */
    for(const s of [-1,1]){ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=1.4;ctx.beginPath();let pen=false;for(let i=0;i<=120;i++){const tw=i/120*PI,th=tw-g.phi,xx=X+A*Math.cos(th)+s*9,yy=y-Rd*Math.cos(tw);pen?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy);pen=true;}ctx.stroke();ctx.restore();}
    ctx.beginPath();ctx.rect(this.Xp-14,y-Rd-70,28,60);paint(C.part2,C.ink);ctx.beginPath();ctx.rect(this.Xp-7,y-Rd-14,14,20);paint(C.hi,C.ink);ground(this.Xp,y-Rd-70,60,true);label('FIXED PIN IN THE GROOVE',this.Xp+24,y-Rd-46);
    label('THE SLANTED GROOVE MOVES THE DRUM AND SHAFT BACK AND FORTH ONCE A TURN',400,490,'center');},
  reads(){return[['Shaft',`${this.g.x.toFixed(0)} mm`],['Stroke',`${2*this.A} mm per turn`]];}});

/* 364 and 398 · exact one-pin drives with locking rims (Geneva type) */
lockTooth(364,{N:12});SIMS_NEW[364].concept=true;
lockTooth(398,{N:4});SIMS_NEW[398].concept=true;

/* 372 · White's dynamometer: the driving shaft's bevel wheel and the driven shaft's bevel wheel face each other; bevel pinions between
   them run on arms of a ring (the carrier). The pinions pass the drive across and the two shafts turn opposite ways; the carrier is
   pressed round with twice the torque, and the weight hung on its arm to hold it level measures the power. */
reg({num:372,outLabel:'Balance load, kg',O:[400,250],params:[{id:'p',label:'Power transmitted',min:0,max:100,step:1,value:50,fmt:v=>v+' %'}],
  update(phi){this.g={phi,t:this.P.p/100,tilt:0.015*Math.sin(phi*3)};},output(){return this.g.t*20;},
  draw(){const g=this.g,O=this.O,Rb=70,Rp=40;
    const cone=(x0,dir,R,ang,fill)=>{/* bevel wheel seen from the side, axis horizontal, apex toward the centre */const x1=x0+dir*36;poly([[x0,O[1]-R],[x1,O[1]-R+36],[x1,O[1]+R-36],[x0,O[1]+R]]);ctx.closePath();paint(fill,C.ink);
      ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=1;for(let k=0;k<16;k++){const a=ang+k*PI/8;if(Math.cos(a)<0.1)continue;const s=Math.sin(a);ctx.globalAlpha=.3+.6*Math.cos(a);ctx.beginPath();ctx.moveTo(x0,O[1]+R*s);ctx.lineTo(x1,O[1]+(R-36)*s);ctx.stroke();}ctx.restore();};
    const pin=(dir,ang)=>{/* pinion axis vertical */const y0=O[1]+dir*(Rb+4),y1=O[1]+dir*(Rb-32);poly([[O[0]-Rp,y0],[O[0]+Rp,y0],[O[0]+Rp-30,y1],[O[0]-Rp+30,y1]]);ctx.closePath();paint(C.part,C.ink);
      ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=1;for(let k=0;k<12;k++){const a=ang+k*PI/6;if(Math.cos(a)<0.1)continue;const s=Math.sin(a);ctx.globalAlpha=.3+.6*Math.cos(a);ctx.beginPath();ctx.moveTo(O[0]+Rp*s,y0);ctx.lineTo(O[0]+(Rp-30)*s,y1);ctx.stroke();}ctx.restore();};
    stripeShaft(70,O[0]-70,O[1],12,g.phi,C.part2);stripeShaft(O[0]+70,730,O[1],12,-g.phi,C.part2);
    cone(O[0]-74,1,Rb,g.phi,C['brass-fill']);cone(O[0]+74,-1,Rb,-g.phi,C['steel-fill']);
    /* carrier ring with its arm */
    ctx.save();ctx.translate(O[0],O[1]);ctx.rotate(g.tilt);ctx.beginPath();ctx.rect(-12,-Rb-40,24,2*Rb+80);paint(C.part2,C.ink);ctx.beginPath();ctx.rect(0,-8,250,16);paint(C.part2,C.ink);ctx.restore();
    pin(-1,g.phi*Rb/Rp);pin(1,-g.phi*Rb/Rp);
    const W=[O[0]+240,O[1]+250*Math.sin(g.tilt)];rope([[W[0],W[1]],[W[0],W[1]+60]]);weight(W[0],W[1]+60,26+g.t*40,26+g.t*40,'');
    label('DRIVING SHAFT',120,O[1]-30);label('DRIVEN SHAFT',640,O[1]-30);label('CARRIER',O[0],O[1]-Rb-52,'center');
    label('THE WEIGHT THAT HOLDS THE CARRIER LEVEL MEASURES THE TURNING FORCE',400,480,'center');},
  reads(){return[['Weight needed',`${(this.g.t*20).toFixed(1)} kg`],['Shafts','turn opposite ways, same speed']];}});

/* 384 · volute drawer: a small wheel runs as a nut on a threaded arm pivoted at the centre. Swing the arm and the wheel rolls on the
   paper; each turn of the wheel screws it one thread further out, and it turns faster the further out it is, so the pencil beside it
   draws a widening (logarithmic) volute. */
reg({num:384,outLabel:'Radius, mm',O:[400,265],r0:30,k:0.085,
  reset(){this.trail=[];},
  geo(phi){const t=mod(phi,6*PI);return{t,r:this.r0*Math.exp(this.k*t)};},
  update(phi){const q=this.geo(phi);if(!this.trail||q.t<(this.g?this.g.t:0))this.trail=[];this.g={phi,...q};this.trail.push([this.O[0]+q.r*Math.cos(q.t),this.O[1]+q.r*Math.sin(q.t)]);},
  output(){return this.g.r;},
  draw(){const g=this.g,O=this.O,c=Math.cos(g.t),s=Math.sin(g.t);
    if(this.trail.length>1){ctx.save();ctx.strokeStyle=C.steel;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(...this.trail[0]);for(const p of this.trail)ctx.lineTo(...p);ctx.stroke();ctx.restore();}
    const E=[O[0]+235*c,O[1]+235*s];ctx.save();ctx.translate(O[0],O[1]);ctx.rotate(g.t);ctx.beginPath();ctx.rect(0,-6,235,12);paint(C['steel-fill'],C.ink);ctx.strokeStyle=C.ink;ctx.lineWidth=0.8;for(let x=8;x<230;x+=6){ctx.beginPath();ctx.moveTo(x,-6);ctx.lineTo(x+3,6);ctx.stroke();}
    const wr=g.r;ctx.beginPath();ctx.rect(wr-8,-26,16,52);paint(C['brass-fill'],C.ink);const sp=g.t*g.r/24;for(let k=0;k<6;k++){const a=sp+k*PI/3;if(Math.cos(a)<0)continue;ctx.beginPath();ctx.moveTo(wr-8,26*Math.sin(a));ctx.lineTo(wr+8,26*Math.sin(a));ctx.stroke();}ctx.restore();
    pivot(O[0],O[1],6);circ(O[0]+g.r*c,O[1]+g.r*s,4);paint(C.ink);label('THREADED ARM',E[0],E[1]-14,'center');
    label('THE WHEEL ROLLS ON THE PAPER AND SCREWS ITSELF OUTWARD · a widening volute',400,505,'center');},
  reads(){const g=this.g;return[['Radius',`${g.r.toFixed(0)} mm`],['Arm turns',`${(g.t/TAU).toFixed(2)}`]];}});

/* 390 · a rocking lever turns a flywheel one way through two bands, two drums and two ratchets. Each drum runs loose on the shaft and
   carries a pawl into its own ratchet, which is fast on the shaft. The bands are wound opposite ways, so one drum drives on the down
   stroke and the other on the up stroke; small weights turn each drum back while its pawl slips. Side view, with end views below. */
reg({num:390,outLabel:'Shaft, turns',F:[380,110],La:80,rd:40,N:20,r0:55,R:70,mu:0.12,
  reset(){this.st=null;},
  dA(phi){return this.La*Math.sin(0.35*Math.sin(phi))/this.rd;},
  update(phi){const p=TAU/this.N;if(!this.st||phi<this.st.phi-1e-9)this.st={phi:0,wf:0,v:0,off:[0,0]};const st=this.st,dt=0.02;
    while(st.phi<phi-1e-9){const h=Math.min(dt,phi-st.phi);st.phi+=h;st.v=Math.max(0,st.v-this.mu*h);st.wf+=st.v*h;const ds=[this.dA(st.phi),-this.dA(st.phi)];
      for(let i=0;i<2;i++){if(ds[i]-st.wf>st.off[i]){const nw=ds[i]-st.off[i];st.v=Math.max(st.v,(nw-st.wf)/h*0.999);st.wf=nw;}}
      for(let i=0;i<2;i++)while(ds[i]-st.wf<st.off[i]-p)st.off[i]-=p;}
    const a=0.35*Math.sin(phi),ds=[this.dA(phi),-this.dA(phi)],dr=Math.cos(phi)>0?0:1;this.g={phi,a,w:st.wf,ds,act:dr};},
  output(){return this.g.w/TAU;},
  draw(){const g=this.g,F=this.F,La=this.La,y=280,xs=[300,460],{N,r0,R,rd}=this,RAT=SIMS_NEW[321].RAT;
    stripeShaft(120,720,y,8,g.w,C.part2);for(const x of [140,560,700]){ctx.beginPath();ctx.rect(x-8,y-12,16,150);paint(C.part2,C.ink);}
    drumH(640,y,26,130,g.w,C['steel-fill']);label('FLYWHEEL',640,y+150,'center');
    for(let i=0;i<2;i++){const x=xs[i];drumH(x,y,40,rd,g.ds[i],C['brass-fill']);drumH(x+38,y,18,R,g.w,C['steel-fill']);}
    ctx.save();ctx.translate(F[0],F[1]);ctx.rotate(g.a);ctx.beginPath();ctx.rect(-La-16,-9,2*La+32,18);paint(C['brass-fill'],C.ink);ctx.beginPath();ctx.rect(-6,-9,12,-70);paint(C.part,C.ink);ctx.restore();pivot(F[0],F[1],6);
    for(let i=0;i<2;i++){const s=i?1:-1,E=[F[0]+s*La*Math.cos(g.a),F[1]+s*La*Math.sin(g.a)];rope([E,[xs[i]+(i?-1:1)*0,y-rd]]);
      rope([[xs[i]+12,y+rd],[xs[i]+12,y+rd+40+rd*g.ds[i]*0.5]]);weight(xs[i]+12,y+rd+40+rd*g.ds[i]*0.5,22,22,'');}
    /* end views */
    for(let i=0;i<2;i++){const C0=[i?560:200,450],k=0.5,d=g.ds[i],w=g.w,at=(a,r)=>[C0[0]+k*r*Math.cos(a),C0[1]+k*r*Math.sin(a)];
      poly(RAT.pts(N,r0,R,-1).map(([x,y])=>{const c=Math.cos(w),s=Math.sin(w);return[C0[0]+k*(x*c-y*s),C0[1]+k*(x*s+y*c)];}));ctx.closePath();paint(C['steel-fill'],C.ink);
      bar(C0[0],C0[1],...at(d,96),9,C['brass-fill']);circ(C0[0],C0[1],k*rd);paint(C['brass-fill'],C.ink);
      const b=RAT.pawl(N,r0,R,-1,w-d,[92,0],48,-3.1,-1.8),Pv=at(d,92),T=[Pv[0]+k*48*Math.cos(b+d),Pv[1]+k*48*Math.sin(b+d)];bar(...Pv,...T,5,i===g.act?C.hi:C.part);pivot(...Pv,2.5);
      label(i?'RIGHT DRUM':'LEFT DRUM',C0[0]+60,C0[1]-20);}
    label('BANDS WOUND OPPOSITE WAYS · one drum drives each stroke',400,30,'center');},
  reads(){const g=this.g;return[['Shaft turns',`${(g.w/TAU).toFixed(2)}`],['Driving',g.act?'right drum':'left drum']];}});

/* 391 · two weighted racks take turns: the rack that is falling is swung into mesh and drives the gear by its weight, while the other is
   swung clear and drawn up. Both mesh on the same side, so both drive the gear the same way and it turns continuously. */
reg({num:391,outLabel:'Gear turns',concept:true,Pg:[440,270],Rg:50,S:8*PI*100/18,
  update(phi){const u=mod(phi,TAU)/TAU,cyc=Math.floor(phi/TAU),S=this.S;const fA=u<0.5?u/0.5:1-(u-0.5)/0.5,fB=1-fA;/* fall fractions */
    const sw=x=>smooth(Math.min(1,Math.max(0,x)));const inA=u<0.5?1-sw((u-0.46)/0.04)*0:0,inB=u<0.5?0:1;
    const fall=(cyc*2+(u<0.5?u/0.5:1+(u-0.5)/0.5))*S;this.g={phi,yA:fA*S,yB:fB*S,inA:u<0.5?1:0,w:-fall/this.Rg,u};},
  output(){return -this.g.w/TAU;},
  draw(){const g=this.g,P=this.Pg,Rg=this.Rg,m=2*Rg/18,xm=P[0]-Rg;drawGear(P[0],P[1],Rg,18,g.w,C['brass-fill'],{bore:6});pivot(P[0],P[1],5);
    const rack=(y0,inMesh,front,label_)=>{const x=inMesh?xm:xm-36,top=P[1]-170+y0,pts=[[x-1.25*m-16,top]];const p=PI*m,c0=mod(170-p/2,p)+p;for(let k=0;k<12;k++){const yc=top+c0+k*p,a=p/4,t=Math.tan(20*PI/180);pts.push([x-1.25*m,yc-a-1.25*m*t],[x+m,yc-a+m*t],[x+m,yc+a-m*t],[x-1.25*m,yc+a+1.25*m*t]);}const bot=top+c0+12*p;pts.push([x-1.25*m,bot],[x-1.25*m-16,bot]);
      ctx.save();ctx.globalAlpha=front?1:0.55;poly(pts);ctx.closePath();paint(inMesh?C['steel-fill']:C.part,C.ink);weight(x-1.25*m-8,bot,40,40,'');rope([[x-1.25*m-8,top],[x-1.25*m-8,60]]);ctx.restore();label(label_,x-60,top+20,'right');return bot;};
    rack(g.yA,g.inA===1,true,'FRONT RACK');rack(g.yB,g.inA===0,false,'REAR RACK');
    label(g.inA?'FRONT RACK FALLING IN MESH · rear rack swung clear and drawn up':'REAR RACK FALLING IN MESH · front rack swung clear and drawn up',400,40,'center');label('both racks mesh on the same side, so the gear always turns the same way',400,500,'center');},
  reads(){const g=this.g;return[['Driving',g.inA?'front rack':'rear rack'],['Gear','turns one way']];}});

/* 397 · the crank pin works in a slot that is straight above and below and opens into two arcs, each struck from the crank centre with
   the yoke at one end of its stroke. While the pin runs on an arc the yoke stands still, so the shuttle pauses at each end. */
reg({num:397,outLabel:'Shuttle position, mm',concept:true,O:[200,300],r:90,al:0.6,
  xe(){return this.r*Math.cos(this.al);},
  update(phi){const x=Math.max(-this.xe(),Math.min(this.xe(),this.r*Math.cos(phi)));this.g={phi,x,dwell:Math.abs(this.r*Math.cos(phi))>this.xe()};},output(){return this.g.x;},
  slot(){const r=this.r,al=this.al,xe=this.xe(),o=[];const top=r+24,ya=r*Math.sin(al);/* centre line of the slot, yoke-local */
    o.push([0,-top],[0,-ya]);for(let i=1;i<=20;i++){const t=-al+2*al*i/20;o.push([-xe+r*Math.cos(t),r*Math.sin(t)*-1*-1]);}o.push([0,top]);return o;},
  draw(){const g=this.g,O=this.O,r=this.r,al=this.al,xe=this.xe(),X=O[0]+g.x,pin=[O[0]+r*Math.cos(g.phi),O[1]+r*Math.sin(g.phi)];
    circ(O[0],O[1],r+24);paint(C['brass-fill'],C.ink);bar(O[0],O[1],pin[0],pin[1],14,C.part2);pivot(O[0],O[1],6);
    ctx.beginPath();ctx.rect(X-r-14,O[1]-r-40,2*r+28,2*r+80);paint(C['steel-fill'],C.ink,.9);
    /* slot: straight tails and the two arcs */
    const ya=r*Math.sin(al);ctx.save();ctx.translate(X,O[1]);ctx.lineCap='round';ctx.lineWidth=20;ctx.strokeStyle=C.ink;
    const path=()=>{ctx.beginPath();ctx.moveTo(0,-r-24);ctx.lineTo(0,-ya);ctx.arc(-xe,0,r,-al,al);ctx.lineTo(0,r+24);ctx.moveTo(0,-ya);ctx.arc(xe,0,r,PI+al,PI-al,true);};
    path();ctx.stroke();ctx.lineWidth=17;ctx.strokeStyle=C.sheet;path();ctx.stroke();ctx.restore();
    circ(pin[0],pin[1],8);paint(C.hi,C.ink);
    bar(X+r+14,O[1],X+r+150,O[1],10,C.part);ctx.beginPath();ctx.rect(O[0]+r+60,O[1]-28,330,8);ctx.rect(O[0]+r+60,O[1]+20,330,8);paint(C.part2,C.ink);
    const S=X+r+150;ctx.beginPath();ctx.moveTo(S,O[1]);ctx.quadraticCurveTo(S+40,O[1]-24,S+90,O[1]);ctx.quadraticCurveTo(S+40,O[1]+24,S,O[1]);paint(C['brass-fill'],C.ink);label('SHUTTLE',S+45,O[1]-36,'center');
    label(g.dwell?'PIN ON AN ARC · the shuttle pauses':'PIN IN THE STRAIGHT SLOT · the shuttle moves',400,470,'center');label('arcs are struck from the crank centre',400,492,'center');},
  reads(){const g=this.g;return[['Shuttle',`${g.x.toFixed(0)} mm`],['Phase',g.dwell?'pause':'moving'],['Pause',`${(2*this.al*180/PI).toFixed(0)}° of each turn at each end`]];}});

/* 366 · drill press: the driving shaft's bevel pinion turns a bevel wheel whose bore has a feather; the drill spindle slides through
   it while it turns. A lever pivoted on the frame forks a collar on the spindle; a rod from the treadle pulls its other end, so treading
   lowers the drill into the work and a spring lifts it again. */
reg({num:366,outLabel:'Drill depth, mm',X:360,F:[640,200],
  update(phi){const d=60*(1-Math.cos(phi*0.3))/2;this.g={phi,d,b:Math.atan2(d,this.F[0]-this.X)};},output(){return this.g.d;},
  draw(){const g=this.g,X=this.X,F=this.F,yb=120,Lr=F[0]-X;
    ctx.beginPath();ctx.rect(X-130,60,30,420);ctx.rect(X-130,60,260,18);paint(C.part2,C.ink);ctx.beginPath();ctx.rect(X-100,420,260,24);paint(C.part2,C.ink);label('TABLE',X+150,412);
    /* bevel wheel, axis vertical, and the pinion on the driving shaft */
    poly([[X-70,yb],[X+70,yb],[X+40,yb+30],[X-40,yb+30]]);ctx.closePath();paint(C['brass-fill'],C.ink);ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=1;for(let k=0;k<12;k++){const a=g.phi+k*PI/6;if(Math.cos(a)<0.1)continue;ctx.globalAlpha=.3+.6*Math.cos(a);ctx.beginPath();ctx.moveTo(X+70*Math.sin(a),yb);ctx.lineTo(X+40*Math.sin(a),yb+30);ctx.stroke();}ctx.restore();
    poly([[X+100,yb-34],[X+100,yb+40],[X+72,yb+26],[X+72,yb-20]]);ctx.closePath();paint(C.part,C.ink);stripeShaft(X+100,X+300,yb+3,9,-g.phi*70/37,C.part2);drumH(X+300,yb+3,30,40,-g.phi*70/37,C['steel-fill']);label('DRIVING SHAFT',X+230,yb-40,'center');
    /* spindle sliding through the wheel, collar and drill */
    const ys=yb-40+g.d;ctx.beginPath();ctx.rect(X-8,ys,16,260);paint(C['steel-fill'],C.ink);ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=1;for(let k=0;k<6;k++){const a=g.phi+k*PI/3;if(Math.cos(a)<0)continue;const xx=X+8*Math.sin(a);ctx.beginPath();ctx.moveTo(xx,ys);ctx.lineTo(xx,ys+250);ctx.stroke();}ctx.restore();
    const yc=200+g.d;ctx.beginPath();ctx.rect(X-20,yc-12,40,24);paint(C.part,C.ink);poly([[X-6,ys+260],[X+6,ys+260],[X,ys+290]]);ctx.closePath();paint(C.ink);
    ctx.beginPath();ctx.rect(X-60,404,120,16);paint(C['brass-fill'],C.ink);label('WORK',X,415,'center');
    /* lever, rod and treadle */
    const L=Math.hypot(X-F[0],yc-F[1]),u=[(X-F[0])/L,(yc-F[1])/L],Rm=[F[0]+90*u[0],F[1]+90*u[1]];bar(F[0],F[1],X,yc,12,C.part2);pivot(F[0],F[1],6);ground(F[0],F[1]-12,30,true);pivot(Rm[0],Rm[1],4);
    const T0=[760,470],Tp=[Rm[0],Rm[1]+230];bar(T0[0],T0[1],Tp[0]-30,Tp[1],14,C['brass-fill']);pivot(T0[0],T0[1],6);bar(Rm[0],Rm[1],Tp[0],Tp[1],6,C.part);label('TREADLE',T0[0]-60,T0[1]+26,'center');label('LEVER',F[0]-60,F[1]-16,'center');
    springZ(X+14,yb+40,X+14,yc-12,8,6);
    label('THE SPINDLE SLIDES THROUGH THE TURNING BEVEL WHEEL · treading feeds the drill down',400,505,'center');},
  reads(){return[['Depth',`${this.g.d.toFixed(0)} mm`],['Spindle','turns and slides at once']];}});

/* 379, 380 · cramp drills. The cramp's lower jaw holds the work; the drill spindle runs in the upper arm and is turned by a crank.
   379: the feed screw stands above the spindle, end to end with it, and is screwed down from a nut in the frame to push the drill on.
   380: the feed screw is hollow and threaded in the upper arm; the spindle runs through it and is pushed down by a collar. */
function crampDrill(num,o){return reg({num,outLabel:'Drill feed, mm',X:330,
  update(phi){const d=40*mod(phi,TAU*6)/(TAU*6);this.g={phi,d,s:d/6*TAU};},output(){return this.g.d;},
  draw(){const g=this.g,X=this.X,yA=200,d=g.d;
    ctx.beginPath();ctx.moveTo(180,110);ctx.lineTo(640,110);ctx.lineTo(640,470);ctx.lineTo(180,470);ctx.lineTo(180,420);ctx.lineTo(580,420);ctx.lineTo(580,yA+20);ctx.lineTo(180,yA+20);ctx.closePath();paint(C.part2,C.ink);
    ctx.beginPath();ctx.rect(200,360,300,60);paint(C['brass-fill'],C.ink);label('WORK',350,395,'center');
    const yS=yA-30+d;/* top of the spindle */
    ctx.beginPath();ctx.rect(X-10,yS,20,120);paint(C['steel-fill'],C.ink);ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=1;for(let k=0;k<6;k++){const a=g.phi+k*PI/3;if(Math.cos(a)<0)continue;const xx=X+10*Math.sin(a);ctx.beginPath();ctx.moveTo(xx,yS);ctx.lineTo(xx,yS+115);ctx.stroke();}ctx.restore();
    poly([[X-7,yS+120],[X+7,yS+120],[X,yS+155]]);ctx.closePath();paint(C.ink);
    const crankAt=(y)=>{const c=Math.cos(g.phi);bar(X,y,X+70*c,y,10,C['brass-fill']);bar(X+70*c,y,X+70*c,y-40,10,C['brass-fill']);circ(X,y,9);paint(C.part,C.ink);};
    if(o.through){/* hollow feed screw threaded in the arm, spindle through it; collar under the screw */
      const yF=yA-60+d;screwShaftV(X,yF,yF+80,22,g.s);drumH(X,yF-6,70,10,g.s,C.part);label('HOLLOW FEED SCREW',X+50,yF+20);ctx.beginPath();ctx.rect(X-24,yF+80,48,10);paint(C.hi,C.ink);crankAt(yF-40);
      ctx.beginPath();ctx.rect(X-10,yF-40,20,yS-yF+40);paint(C['steel-fill'],C.ink);}
    else{/* feed screw end to end above the spindle, in a nut on a bracket */
      ctx.beginPath();ctx.rect(X-60,90,120,20);paint(C.part2,C.ink);const yF=yA-110+d;screwShaftV(X,yF-60,yF+50,20,g.s);drumH(X,yF-66,80,10,g.s,C.part);label('FEED SCREW',X+60,yF-60);crankAt(yS+30);}
    label(o.label,400,500,'center');},
  reads(){return[['Feed',`${this.g.d.toFixed(1)} mm`]];}});}
function screwShaftV(x,y0,y1,w,ang){ctx.beginPath();ctx.rect(x-w/2,y0,w,y1-y0);paint(C['steel-fill'],C.ink);ctx.save();ctx.beginPath();ctx.rect(x-w/2,y0,w,y1-y0);ctx.clip();ctx.strokeStyle=C.ink;ctx.lineWidth=1;const p=8;for(let y=y0-p+mod(-ang/TAU*p,p);y<y1+p;y+=p){ctx.beginPath();ctx.moveTo(x-w/2,y);ctx.lineTo(x+w/2,y+3);ctx.stroke();}ctx.restore();}
crampDrill(379,{label:'CRAMP DRILL · the feed screw stands opposite the drill, end to end with the spindle'});
crampDrill(380,{through:true,label:'CRAMP DRILL · the spindle runs through the hollow feed screw'});

/* 381 · joiner's clamp with a wedge: the work lies between a fixed stop and a sliding jaw; driving the wedge down between the jaw and
   the fixed post pushes the jaw against the work (half the wedge's travel, for a 1-in-2 taper). */
reg({num:381,outLabel:'Jaw closure, %',
  update(phi){const c=openClose(phi),d=60*(1-c);this.g={phi,c,d,yT:215+2*d};},output(){return this.g.c*100;},
  draw(){const g=this.g,d=g.d,yT=g.yT;ctx.beginPath();ctx.rect(80,330,460,40);ctx.rect(590,330,130,40);paint(C.part2,C.ink);
    ctx.beginPath();ctx.rect(300,220,30,110);paint(C.part,C.ink);ctx.beginPath();ctx.rect(330,280,140,50);paint(C['brass-fill'],C.ink);label('WORK',400,305,'center');
    ctx.beginPath();ctx.rect(470+d,240,30,90);paint(C['steel-fill'],C.ink);ctx.beginPath();ctx.rect(560,180,30,190);paint(C.part2,C.ink);
    poly([[530,yT],[560,yT],[560,yT+140],[530-70,yT+140]]);ctx.closePath();paint(C['brass-fill'],C.ink);
    label('FIXED STOP',315,205,'center');label('SLIDING JAW',485+d,230,'center');label('WEDGE',545,yT-10,'center');label('POST',575,170,'center');
    label(g.c>0.98?'CLAMPED':g.c<0.02?'OPEN':'DRIVING THE WEDGE / KNOCKING IT BACK',400,420,'center');label("JOINER'S CLAMP · a 1-in-2 wedge drives the jaw half as far as the wedge goes",400,480,'center');},
  reads(){const g=this.g;return[['Jaw gap',`${g.d.toFixed(0)} mm`],['Wedge travel',`${(2*g.d).toFixed(0)} mm`]];}});

/* 385 · door closer, seen from above: a link of fixed length joins the door to a slide; opening the door draws the slide away from the
   pulley, lifting the weight that hangs from the cord; let go and the weight pulls the slide back and the door shut. */
reg({num:385,outLabel:'Door angle, degrees',H:[200,300],Lk:130,T0:290,
  geo(a){const H=this.H,K=[H[0]+80*Math.cos(-a),H[1]+80*Math.sin(-a)],Ty=K[1]+Math.sqrt(this.Lk**2-(this.T0-K[0])**2);return{K,T:[this.T0,Ty]};},
  update(phi){const u=mod(phi*0.5,TAU)/TAU;const f=u<0.3?smooth(u/0.3):u<0.45?1:1-smooth((u-0.45)/0.45);const a=f*1.3;this.g={phi,a,...this.geo(a)};},output(){return this.g.a*180/PI;},
  draw(){const g=this.g,H=this.H,T=g.T,Pu=[this.T0,490],T0=this.geo(0).T;
    ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=12;ctx.beginPath();ctx.moveTo(60,300);ctx.lineTo(H[0]-10,300);ctx.moveTo(H[0]+310,300);ctx.lineTo(760,300);ctx.stroke();ctx.restore();
    ctx.beginPath();ctx.rect(T[0]-30,320,8,150);ctx.rect(T[0]+22,320,8,150);paint(C.part2,C.ink);
    const D=[H[0]+300*Math.cos(-g.a),H[1]+300*Math.sin(-g.a)];bar(H[0],H[1],D[0],D[1],14,C['brass-fill']);pivot(H[0],H[1],6);
    rope([[T[0],T[1]+20],Pu]);circ(Pu[0],Pu[1],10);paint(C.part,C.ink);ctx.beginPath();ctx.rect(Pu[0]+14,Pu[1]-14,28,28);paint(C['steel-fill'],C.ink);label('WEIGHT HANGS HERE',Pu[0]+50,Pu[1]+4);
    ctx.beginPath();ctx.rect(T[0]-20,T[1]-20,40,40);paint(C['steel-fill'],C.ink);bar(g.K[0],g.K[1],T[0],T[1],8,C.part);pivot(g.K[0],g.K[1],4);pivot(T[0],T[1],4);
    label('SLIDE',T[0]-40,T[1],'right');label(`weight raised ${(T0[1]-T[1]).toFixed(0)} mm`,560,420);
    label('SEEN FROM ABOVE · opening the door draws the slide away and lifts the weight, which then pulls the door shut',400,40,'center');},
  reads(){const g=this.g;return[['Door',`${(g.a*180/PI).toFixed(0)}°`],['Weight raised',`${(this.geo(0).T[1]-g.T[1]).toFixed(0)} mm`]];}});
