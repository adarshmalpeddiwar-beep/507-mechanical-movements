/* ================= batch 3 · part 2: intermittent motion, ratchets, stops, escapements ================= */
const stepOf=(phi,u0,u1)=>{const k=Math.floor(phi/TAU),u=mod(phi,TAU)/TAU;return k+smooth((u-u0)/(u1-u0));};
function starWheel(x,y,r,N,a,fill,style){if(style==='studs'){circ(x,y,r-14);paint(fill,C.ink);for(let i=0;i<N;i++){const t=a+i*TAU/N;circ(x+r*Math.cos(t),y+r*Math.sin(t),7);paint(C.part2,C.ink);bar(x+(r-14)*Math.cos(t),y+(r-14)*Math.sin(t),x+r*Math.cos(t),y+r*Math.sin(t),5,C.part2);}}
  else if(style==='slots'){circ(x,y,r);for(let i=0;i<N;i++){const t=a+i*TAU/N;ctx.moveTo(x+(r-30)*Math.cos(t)+6*Math.sin(t),y+(r-30)*Math.sin(t)-6*Math.cos(t));ctx.arc(x+(r-30)*Math.cos(t),y+(r-30)*Math.sin(t),6,t-PI/2,t+PI/2,true);ctx.lineTo(x+(r+2)*Math.cos(t)-6*Math.sin(t),y+(r+2)*Math.sin(t)+6*Math.cos(t));ctx.lineTo(x+(r+2)*Math.cos(t)+6*Math.sin(t),y+(r+2)*Math.sin(t)-6*Math.cos(t));ctx.closePath();}paint(fill,C.ink);}
  else{const pts=[];for(let i=0;i<N;i++){const t=a+i*TAU/N;pts.push([x+r*Math.cos(t),y+r*Math.sin(t)]);pts.push([x+r*0.55*Math.cos(t+PI/N),y+r*0.55*Math.sin(t+PI/N)]);}poly(pts);ctx.closePath();paint(fill,C.ink);}
  pivot(x,y,5);}

/* ---- stepped intermittent drives ---- */
function stepper(num,o){return reg({num,outLabel:'Driven wheel, turns',concept:!!o.concept,
  update(phi){const s=stepOf(phi,o.u0??0.38,o.u1??0.62);this.g={phi,s,w:(o.dir||1)*s*TAU/o.N};},output(){return this.g.s/o.N;},
  draw(){const g=this.g,D=o.D||[290,280],Wc=o.Wc||[500,280],dirA=Math.atan2(Wc[1]-D[1],Wc[0]-D[0]),pa=g.phi-TAU*((o.u0??0.38)+(o.u1??0.62))/2+dirA,rd=o.rd||95;
    circ(D[0],D[1],rd);paint(C['brass-fill'],C.ink);
    if(o.rim){ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=10;ctx.beginPath();ctx.arc(D[0],D[1],rd-8,pa+0.6,pa+TAU-0.6);ctx.stroke();ctx.strokeStyle=C.part2;ctx.lineWidth=7;ctx.stroke();ctx.restore();}
    const P=[D[0]+(rd+8)*Math.cos(pa),D[1]+(rd+8)*Math.sin(pa)];bar(D[0]+(rd-12)*Math.cos(pa),D[1]+(rd-12)*Math.sin(pa),P[0],P[1],o.tooth?18:10,C['brass-fill']);if(!o.tooth){circ(P[0],P[1],8);paint(C.part2,C.ink);}pivot(D[0],D[1],6);
    starWheel(Wc[0],Wc[1],o.rw||110,o.N,g.w+(o.w0||PI),C['steel-fill'],o.style);
    if(o.pawl){const Q=[Wc[0]+30,Wc[1]-(o.rw||110)-60],off=mod(g.s,1),lift=off>0&&off<1?Math.sin(off*PI)*14:0;bar(Q[0],Q[1],Wc[0]+12,Wc[1]-(o.rw||110)*0.7-lift,8,C.part);pivot(Q[0],Q[1],5);springZ(Q[0]+60,Q[1]-20,Q[0]+30,Q[1]+18,8,5);}
    label(o.label,400,480,'center');if(o.l2)label(o.l2,400,500,'center');},
  reads(){const g=this.g;return[['Steps taken',`${Math.floor(g.s+1e-6)}`],['Each step',`1/${o.N} turn`],['Driver turns per step','1'],['Between steps',o.rim?'locked by the rim':'held at rest']];}});}
stepper(364,{N:12,style:'slots',rd:60,D:[330,260],Wc:[500,260],rw:120,label:'ROLLERS ON THE SMALL WHEEL STEP THE LARGE ONE',concept:true});
stepper(398,{N:4,style:'slots',u0:0.2,u1:0.8,label:'CAM STARTS AND STOPS THE DRIVEN WHEEL',concept:true});
oneTooth(69,true);SIMS_NEW[69].concept=true;
alias(213,212,{concept:true});alias(214,212,{concept:true});alias(215,212,{concept:true});

reg({num:233,outLabel:'Lantern wheel, turns',params:[{id:'m',type:'toggle',label:'Stop',options:[[0,'Pin stop'],[1,'Notched rim']],value:0}],
  update(phi){const lim=1.5*TAU;const a=lim*(1-Math.cos(phi*0.4))/2;this.g={phi,a,lim};},output(){return this.g.a/TAU;},
  draw(){const g=this.g,O=[360,270],R=100;circ(O[0],O[1],R+16);paint(C.part,C.ink);for(let i=0;i<10;i++){const t=g.a+i*TAU/10;circ(O[0]+R*Math.cos(t),O[1]+R*Math.sin(t),7);paint(C.part2,C.ink);}circ(O[0],O[1],R-20);paint(C['steel-fill'],C.ink);pivot(O[0],O[1],6);
    if(this.P.m===0){const t=g.a*0.333+PI;const S=[O[0]+150*Math.cos(t/1),O[1]+150*Math.sin(t)];drawGear(560,270,60,30,-g.a*R/60,C['brass-fill'],{bore:5});ctx.beginPath();ctx.rect(530,180,60,10);paint(C.part2,C.ink);label('STOP FINGER',600,170);}
    else{const t=-g.a/3;circ(600,270,70);paint(C['brass-fill'],C.ink);ctx.save();ctx.strokeStyle=C.sheet;ctx.lineWidth=12;ctx.beginPath();ctx.arc(600,270,64,t-0.3,t+0.3);ctx.stroke();ctx.restore();pivot(600,270,5);label('NOTCHED STOP WHEEL',600,370,'center');}
    label(g.a>g.lim-0.05?'STOPPED':'TURNING',O[0],O[1]+150,'center');},
  reads(){const g=this.g;return[['Turns made',`${(g.a/TAU).toFixed(2)}`],['Limit',`${(g.lim/TAU).toFixed(1)} turns`]];}});

reg({num:239,outLabel:'Gear angle, degrees',concept:true,
  update(phi){const lim=PI*1.6;this.g={phi,a:lim*Math.sin(phi*0.5)/1};},output(){return this.g.a*180/PI;},
  draw(){const g=this.g,A=[300,270],B=[480,270];drawGear(A[0],A[1],100,40,g.a,C['brass-fill'],{bore:6});drawGear(B[0],B[1],80,32,-g.a*100/80+PI/32,C['steel-fill'],{bore:6});
    const s=[A[0]+60*Math.cos(g.a+PI/2),A[1]+60*Math.sin(g.a+PI/2)];circ(s[0],s[1],9);paint(C.part2,C.ink);const t=-g.a*100/80;bar(B[0],B[1],B[0]+55*Math.cos(t-PI/2),B[1]+55*Math.sin(t-PI/2),10,C.part);
    pivot(A[0],A[1],6);pivot(B[0],B[1],6);label('STUD AND BLANK SPACE LIMIT THE TURN',400,470,'center');},
  reads(){return[['Gear',`${(this.g.a*180/PI).toFixed(0)}°`],['Range','about ± 290°']];}});

reg({num:240,outLabel:'Wheel angle, degrees',params:[{id:'m',type:'toggle',label:'Stop',options:[[0,'Pawl'],[1,'Wedge'],[2,'Roller']],value:0}],
  reset(){this.w=0;this.last=null;},
  update(phi){if(this.last===null)this.last=phi;const d=phi-this.last;this.last=phi;const drive=Math.cos(phi*0.7);this.w=Math.max(this.w-0.002,this.w+d*Math.max(0,drive)*0.6-d*0.25);this.g={phi,drive};},output(){return this.w*180/PI;},
  draw(){const g=this.g,O=[380,280],N=18;sawWheel(O[0],O[1],this.w,N,92,118,C['steel-fill']);paint(C['steel-fill'],C.ink);pivot(O[0],O[1],6);const m=this.P.m;
    if(m===0){const Q=[O[0]+150,O[1]-110];const rr=sawR(-0.55-this.w,N,92,118);const T=[O[0]+rr*Math.cos(-0.55),O[1]+rr*Math.sin(-0.55)];bar(Q[0],Q[1],T[0],T[1],10,C['brass-fill']);pivot(Q[0],Q[1],5);}
    else if(m===1){poly([[O[0]+122,O[1]-40],[O[0]+180,O[1]-80],[O[0]+180,O[1]+20]]);ctx.closePath();paint(C['brass-fill'],C.ink);springZ(O[0]+230,O[1]-30,O[0]+180,O[1]-30);}
    else{circ(O[0]+132,O[1]-30,14);paint(C['brass-fill'],C.ink);poly([[O[0]+150,O[1]-80],[O[0]+170,O[1]+40],[O[0]+200,O[1]+40],[O[0]+200,O[1]-80]]);ctx.closePath();paint(C.part2,C.ink);}
    label('LOAD TRIES TO TURN IT BACK',O[0],O[1]+160,'center');},
  reads(){return[['Stop',['pawl in the teeth','wedge pressed by a spring','roller jams in a taper'][this.P.m]],['Back-running','prevented']];}});

/* ---- worm-released intermittent ---- */
function wormRelease(num,o){return reg({num,outLabel:'Main wheel, turns',concept:true,
  update(phi){const slow=phi/6,u=mod(slow,TAU)/TAU,k=Math.floor(slow/TAU),rel=u>0.9;const s=k+smooth((u-0.9)/0.1);this.g={phi,slow,s,rel};},output(){return this.g.s;},
  draw(){const g=this.g,Wc=[300,280],R=110;circ(Wc[0],Wc[1],R);paint(C['steel-fill'],C.ink);bar(Wc[0],Wc[1],Wc[0]+R*0.8*Math.cos(g.s*TAU),Wc[1]+R*0.8*Math.sin(g.s*TAU),10,C.part);circ(Wc[0]+R*0.8*Math.cos(g.s*TAU),Wc[1]+R*0.8*Math.sin(g.s*TAU),10);paint(C.part2,C.ink);pivot(Wc[0],Wc[1],6);
    const S=[560,180];drawGear(S[0],S[1],60,30,g.slow,C['brass-fill'],{bore:5});stripeShaft(S[0]-90,S[0]+90,S[1]+76,14,g.phi,C.part);
    const cr=[S[0],S[1]];ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=2;ctx.beginPath();ctx.arc(cr[0],cr[1],40,g.slow+0.15,g.slow+TAU-0.45);ctx.stroke();ctx.restore();
    const lift=g.rel?18:0;bar(S[0]-40,S[1]+30,Wc[0]+R*0.8,Wc[1]-R*0.8+lift*0.2-10,8,C.part2);pivot(S[0]-40,S[1]+30,4);
    if(o.kind==='weight'){bar(S[0]+80,S[1]+140,S[0]+80,S[1]+200,4,C.part);weight(S[0]+80,S[1]+200,50,40,'');}else if(o.kind==='tumbler'){circ(S[0]+40,S[1]+190,20);paint(C['brass-fill'],C.ink);}else springZ(S[0]-40,S[1]+30,S[0]-40,S[1]+120);
    label('WORM SLOWLY TURNS THE CAM',S[0],S[1]-80,'center');label(g.rel?'RELEASED · main wheel makes one turn':'LOCKED',Wc[0],Wc[1]+150,'center');},
  reads(){return[['State',this.g.rel?'released':'locked'],['Return by',o.kind||'spring']];}});}


/* ---- lever and pawl drives ---- */
function leverPawl(num,o){return reg({num,outLabel:'Ratchet wheel, turns',concept:!!o.concept,params:o.params||[],o,
  reset(){this.w=0;this.last=null;},
  lever(phi){if(!o.crank)return(o.amp||0.35)*Math.sin(phi);const O=o.O||[380,300],L=112+90,Cc=[O[0]+260,O[1]-60],pin=[Cc[0]+40*Math.cos(phi),Cc[1]+40*Math.sin(phi)];if(this.Lr===undefined){const E0=[O[0],O[1]-L];this.Lr=Math.hypot(Cc[0]-E0[0],Cc[1]-E0[1]);}
    const E=cc(O,L,pin,this.Lr,-1);return Math.atan2(E[1]-O[1],E[0]-O[0])+PI/2;},
  update(phi){const a=this.lever(phi);if(this.last===null)this.last=a;const d=a-this.last;this.last=a;const dir=this.P.dir===undefined?1:this.P.dir;
    this.w+=o.double?Math.abs(d)*dir:Math.max(0,d*dir)*dir;this.g={phi,a,d};},output(){return this.w/TAU;},
  draw(){const g=this.g,O=o.O||[380,300],N=o.N||20,rr=90,rt=112,dir=this.P.dir===undefined?1:this.P.dir;
    if(o.rack){/* slotted rack variant */const y=300,x0=150+this.w*rr;ctx.beginPath();ctx.rect(x0-120,y,520,30);paint(C['steel-fill'],C.ink);for(let i=0;i<24;i++){ctx.beginPath();ctx.rect(x0-110+i*22,y+8,10,14);ctx.fillStyle=C.sheet;ctx.fill();}
      const F=[400,140];for(const s of [-1,1]){const t=PI/2+g.a+s*0.25;const T=[F[0]+170*Math.cos(t),F[1]+170*Math.sin(t)];bar(F[0],F[1],T[0],T[1],10,s>0?C['brass-fill']:C.part);ctx.beginPath();ctx.moveTo(T[0],T[1]);ctx.lineTo(T[0]+s*8,T[1]+14);paint(null,C.ink,4);}
      pivot(F[0],F[1],7);bar(F[0],F[1],F[0]+140*Math.cos(-PI/2+g.a),F[1]+140*Math.sin(-PI/2+g.a),12,C['brass-fill']);label('HOOKED PAWLS PULL THE RACK ALONG',400,480,'center');return;}
    sawWheel(O[0],O[1],dir*this.w*-1*-1,N,rr,rt,C['steel-fill']);paint(C['steel-fill'],C.ink);pivot(O[0],O[1],7);
    const arms=o.double?[0,PI]:[0];for(const off of arms){const la=-PI/2+g.a+off;const H=[O[0]+(rt+40)*Math.cos(la),O[1]+(rt+40)*Math.sin(la)];
      if(off===0){bar(O[0],O[1],O[0]+(rt+90)*Math.cos(la),O[1]+(rt+90)*Math.sin(la),14,C['brass-fill']);}else bar(O[0],O[1],H[0],H[1],12,C['brass-fill']);
      const ta=la+0.32*dir,r=sawR(ta-dir*this.w,N,rr,rt);bar(H[0],H[1],O[0]+r*Math.cos(ta),O[1]+r*Math.sin(ta),7,C.part);pivot(H[0],H[1],4);}
    const ha=PI*0.9,hr=sawR(ha-this.w,N,rr,rt);const HQ=[O[0]+(rt+50)*Math.cos(ha-0.4),O[1]+(rt+50)*Math.sin(ha-0.4)];bar(HQ[0],HQ[1],O[0]+hr*Math.cos(ha),O[1]+hr*Math.sin(ha),7,C.part2);pivot(HQ[0],HQ[1],4);
    if(o.crank){const Cc=[O[0]+260,O[1]-60],pin=[Cc[0]+40*Math.cos(g.phi),Cc[1]+40*Math.sin(g.phi)];circ(Cc[0],Cc[1],50);paint(C.part,C.ink);const la=-PI/2+g.a,E=[O[0]+(rt+90)*Math.cos(la),O[1]+(rt+90)*Math.sin(la)];bar(pin[0],pin[1],E[0],E[1],8,C.part2);pivot(pin[0],pin[1],4);pivot(Cc[0],Cc[1],5);}
    label(o.label,400,490,'center');},
  reads(){const g=this.g;return[['Lever',`${(g.a*180/PI).toFixed(0)}°`],['Drives on',o.double?'both strokes':'one stroke'],['Wheel',`${(this.w/TAU).toFixed(2)} turns`]];}});}
leverPawl(73,{label:'SPRING-DRIVEN PAWL ADVANCES THE WHEEL EACH TURN',crank:true,concept:true});
leverPawl(75,{label:'ROD SWINGS THE BAR, PAWL TURNS THE WHEEL',crank:true});

leverPawl(79,{double:true,label:'PAWLS ON TWO ARMS · WHEEL MOVES ON BOTH STROKES',crank:true});
leverPawl(80,{rack:true,double:true});
leverPawl(83,{double:true,label:'TWO RATCHET ARCS WITH OPPOSITE TEETH',concept:true});
leverPawl(155,{label:'FLIP THE PAWL TO DRIVE EITHER WAY',crank:true,params:[{id:'dir',type:'toggle',label:'Pawl set for',options:[[1,'Forward'],[-1,'Reverse']],value:1}]});
leverPawl(235,{label:'TAPPET ARM STEPS THE RATCHET, SKIPS ON RETURN',concept:true});
leverPawl(284,{label:'CRANK, LEVER AND PAWL FEED THE SAW CARRIAGE',crank:true,concept:true});
leverPawl(415,{label:'CORD SELECTS WHICH PAWL DRIVES',params:[{id:'dir',type:'toggle',label:'Pawl in use',options:[[1,'Left pawl'],[-1,'Right pawl']],value:1}]});
leverPawl(389,{label:'ECCENTRIC ROCKS THE LEVER · PAWL CLIMBS THE JACK',crank:true,concept:true});

function twinRatchet(num,o){return reg({num,outLabel:'Output shaft, turns',concept:!!o.concept,
  reset(){this.w=0;this.last=null;},
  update(phi){const a=0.5*Math.sin(phi);if(this.last===null)this.last=a;const d=a-this.last;this.last=a;this.w+=Math.abs(d);this.g={phi,a,d};},output(){return this.w/TAU;},
  draw(){const g=this.g,A=[270,260],B=[530,260];for(const [P,sgn] of [[A,1],[B,-1]]){sawWheel(P[0],P[1],this.w,16,70,88,sgn>0?C['steel-fill']:C.part);paint(sgn>0?C['steel-fill']:C.part,C.ink);pivot(P[0],P[1],5);const act=sgn*g.d>0;label(act?'DRIVING':'SLIPPING',P[0],P[1]+120,'center');}
    if(o.kind==='treadle'){for(const [P,s] of [[A,1],[B,-1]]){const y=430+s*g.a*60;bar(P[0]-120,430,P[0]+80,y,12,C['brass-fill']);pivot(P[0]-120,430,5);rope([[P[0]+70,y],[P[0]+70,P[1]-88],[P[0],P[1]-88]]);}rope([[A[0]-40,P0y(A)],[B[0]+40,P0y(B)]]);}
    else{const F=[400,120];bar(F[0],F[1],F[0]+160*Math.cos(PI/2+g.a),F[1]+160*Math.sin(PI/2+g.a),14,C['brass-fill']);pivot(F[0],F[1],7);const L=[F[0]+120*Math.cos(PI/2+g.a),F[1]+120*Math.sin(PI/2+g.a)];rope([[L[0],L[1]],[A[0],A[1]-88]]);rope([[L[0],L[1]],[B[0],B[1]-88]]);}
    stripeShaft(A[0],B[0],260,8,this.w,C.part2);label(o.label,400,30,'center');
    function P0y(P){return P[1]+88;}},
  reads(){return[['Input','swings both ways'],['Output','turns one way, both strokes'],['Turns',`${(this.w/TAU).toFixed(2)}`]];}});}
twinRatchet(82,{kind:'treadle',label:'TWO TREADLES, ONE CHAIN, TWO RATCHETS',concept:true});twinRatchet(390,{label:'LEVER AND BANDS TURN THE FLYWHEEL ONE WAY'});
twinRatchet(360,{label:'ROCKING BEAM, DRUMS AND RATCHETS TURN THE SHAFT',concept:true});

reg({num:116,outLabel:'Shaft turns',concept:true,
  reset(){this.w=0;this.last=null;},
  update(phi){const x=100*Math.sin(phi);if(this.last===null)this.last=x;const d=x-this.last;this.last=x;this.w+=Math.abs(d)/40;this.g={phi,x,d};},output(){return this.w/TAU;},
  draw(){const g=this.g,X=400+g.x;ctx.beginPath();ctx.rect(X-200,150,400,26);ctx.rect(X-200,344,400,26);paint(C['brass-fill'],C.ink);rackTeeth&&0;
    for(let i=0;i<20;i++){ctx.beginPath();ctx.rect(X-196+i*20,176,10,10);ctx.rect(X-196+i*20,334,10,10);paint(C['brass-fill'],C.ink,.8);}
    bar(X-200,163,X-200,357,12,C.part);bar(X-200,260,X-320,260,10,C.part);
    drawGear(400,226,40,12,this.w+g.phi*0,g.d>0?C['steel-fill']:C.part,{bore:5});drawGear(400,294,40,12,-this.w,g.d<0?C['steel-fill']:C.part,{bore:5});pivot(400,226,4);pivot(400,294,4);
    label(g.d>0?'UPPER PINION DRIVING':'LOWER PINION DRIVING',400,420,'center');label('ratchets inside the pinions let the idle one slip',400,440,'center');},
  reads(){return[['Racks','move back and forth'],['Shaft','turns one way only']];}});

reg({num:277,outLabel:'Cylinder, turns',
  update(phi){const u=cyc(phi),k=Math.floor(phi/TAU);const cock=u<0.6?smooth(u/0.6):(u<0.65?1:0);const s=k+smooth(Math.min(1,u/0.6));this.g={phi,cock,s,fire:u>=0.6&&u<0.66};},output(){return this.g.s/6;},
  draw(){const g=this.g,O=[330,280];circ(O[0],O[1],110);paint(C['steel-fill'],C.ink);for(let i=0;i<6;i++){const t=g.s*TAU/6+i*TAU/6;circ(O[0]+70*Math.cos(t),O[1]+70*Math.sin(t),20);paint(C.sheet,C.ink);}
    sawWheel(O[0],O[1],g.s*TAU/6,6,22,36,C.part);paint(C.part,C.ink);pivot(O[0],O[1],5);
    const H=[560,320],ha=-0.9*g.cock;ctx.save();ctx.translate(H[0],H[1]);ctx.rotate(ha);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(-30,-110);ctx.lineTo(-10,-120);ctx.lineTo(20,-10);ctx.closePath();paint(C['brass-fill'],C.ink);ctx.restore();pivot(H[0],H[1],6);
    bar(H[0],H[1],O[0]+30,O[1]+40-20*g.cock,6,C.part2);label(g.fire?'FIRED':g.cock>0.98?'COCKED':'COCKING · the hand turns the cylinder',400,470,'center');},
  reads(){return[['Hammer',`${(this.g.cock*100).toFixed(0)} % back`],['Each cock','one chamber (1/6 turn)']];}});

reg({num:278,outLabel:'Cage drop, mm',
  update(phi){const u=cyc(phi,TAU*2);const broke=u>0.5;const y=broke?Math.min(40,(u-0.5)*400):60*Math.sin(u*TAU*2);this.g={phi,broke,y};},output(){return this.g.y;},
  draw(){const g=this.g,X=400,Y=220+g.y;for(const s of [-1,1]){ctx.beginPath();ctx.rect(X+s*150-10,40,20,440);paint(C.part2,C.ink);for(let y=50;y<470;y+=18){poly([[X+s*140,y],[X+s*140,y+18],[X+s*130,y+18]]);ctx.closePath();paint(C.part2,C.ink,.8);}}
    ctx.beginPath();ctx.rect(X-110,Y,220,140);paint(C['steel-fill'],C.ink);if(!g.broke)rope([[X,40],[X,Y]]);else{rope([[X,40],[X,90]]);rope([[X,Y-50],[X,Y]]);}
    for(const s of [-1,1]){const out=g.broke?1:0;const a=s*(PI/2-0.5*out);bar(X+s*60,Y+10,X+s*(60+70*Math.cos(0.5*(1-out))),Y+10-30*out,8,C['brass-fill']);pivot(X+s*60,Y+10,4);}
    springZ(X-60,Y+10,X+60,Y+10,12,5);label(g.broke?'ROPE BROKEN · pawls fly out and catch':'ROPE TIGHT · pawls held in',400,500,'center');},
  reads(){return[['Rope',this.g.broke?'broken':'whole'],['Pawls',this.g.broke?'locked in the ratchet':'clear']];}});

reg({num:280,outLabel:'Drum turns',concept:true,
  reset(){this.w=0;this.last=null;},
  update(phi){const a=0.4*Math.sin(phi);if(this.last===null)this.last=a;const d=a-this.last;this.last=a;this.w+=Math.max(0,d);this.g={phi,a,grip:d>0};},output(){return this.w/TAU;},
  draw(){const g=this.g,O=[360,280];circ(O[0],O[1],130);paint(C['steel-fill'],C.ink);circ(O[0],O[1],60);paint(C.part,C.ink);bar(O[0],O[1],O[0]+120*Math.cos(this.w),O[1]+120*Math.sin(this.w),8,C.part2);pivot(O[0],O[1],6);
    const la=-PI/2+g.a,E=[O[0]+330*Math.cos(la),O[1]+330*Math.sin(la)];bar(O[0],O[1],E[0],E[1],14,C['brass-fill']);const G=[O[0]+138*Math.cos(la+0.15),O[1]+138*Math.sin(la+0.15)];circ(G[0],G[1],12);paint(g.grip?C.hi:C.part,C.ink);
    rope([[O[0]-60,O[1]],[O[0]-60,500]]);label(g.grip?'GRIPPING · drum turns':'SLIPPING BACK',O[0]+160,O[1]+150);},
  reads(){return[['Lever',this.g.grip?'gripping':'returning'],['Drum',`${(this.w/TAU).toFixed(2)} turns`]];}});

/* ---- heart-cam roller motion (wool comb) ---- */
function woolComb(num){return reg({num,outLabel:'Roller angle, degrees',concept:true,
  f(u){if(u<0.25)return -smooth(u/0.25)/3;if(u<0.75)return -1/3+smooth((u-0.25)/0.5);return 2/3;},
  update(phi){const k=Math.floor(phi/TAU),u=mod(phi,TAU)/TAU;this.g={phi,r:(k/3+this.f(u)/1)*TAU/3};},output(){return this.g.r*180/PI;},
  draw(){const g=this.g,H=[280,280];const pts=[];for(let i=0;i<120;i++){const t=i/120*TAU,r=60+50*Math.abs(Math.sin(t/2));pts.push([H[0]+r*Math.cos(t+g.phi),H[1]+r*Math.sin(t+g.phi)]);}poly(pts);ctx.closePath();paint(C['brass-fill'],C.ink);pivot(H[0],H[1],6);
    const R=[540,280];circ(R[0],R[1],90);paint(C['steel-fill'],C.ink);for(let i=0;i<3;i++){const t=g.r+i*TAU/3;ctx.save();ctx.translate(R[0],R[1]);ctx.rotate(t);ctx.beginPath();ctx.rect(70,-8,22,16);ctx.fillStyle=C.sheet;ctx.fill();ctx.restore();}pivot(R[0],R[1],6);
    label('HEART CAM',H[0],H[1]+140,'center');label('NOTCHED ROLLER',R[0],R[1]+130,'center');label('back ⅓ · forward ⅔ · pause',400,480,'center');},
  reads(){return[['Cycle','back, forward, pause'],['Roller',`${(this.g.r*180/PI).toFixed(0)}°`]];}});}
woolComb(217);woolComb(218);

reg({num:74,outLabel:'Output shaft, turns',concept:true,
  update(phi){const u=mod(phi,TAU)/TAU,k=Math.floor(phi/TAU);const f=u<0.5?u*2:2-u*2;this.g={phi,o:(f)*TAU*0.5,fwd:u<0.5};},output(){return this.g.o/TAU;},
  draw(){const g=this.g,O=[400,200];ctx.beginPath();ctx.ellipse(O[0],O[1],150,40,0,0,TAU);paint(C['brass-fill'],C.ink);ctx.save();ctx.strokeStyle=C.ink;for(let k=0;k<20;k++){const t=g.phi+k*TAU/40;if(Math.sin(t)>0){ctx.beginPath();ctx.moveTo(O[0]+150*Math.cos(t),O[1]+40*Math.sin(t));ctx.lineTo(O[0]+130*Math.cos(t),O[1]+34*Math.sin(t)+6);ctx.stroke();}}ctx.restore();
    bar(O[0],O[1]-140,O[0],O[1],12,C.part);for(const s of [-1,1]){const x=O[0]+s*150,act=(s>0)===g.fwd;poly([[x-30,O[1]+40],[x+30,O[1]+40],[x+20,O[1]+90],[x-20,O[1]+90]]);ctx.closePath();paint(act?C['steel-fill']:C.part,C.ink);}
    stripeShaft(O[0]-260,O[0]+260,O[1]+110,10,g.o,C.part2);label(g.fwd?'TEETH ON RIGHT GEAR · forward':'TEETH ON LEFT GEAR · back',400,420,'center');},
  reads(){return[['Output',this.g.fwd?'forward':'reverse']];}});

reg({num:397,outLabel:'Shuttle position, mm',concept:true,
  update(phi){const u=mod(phi,TAU)/TAU;let x;if(u<0.3)x=smooth(u/0.3);else if(u<0.5)x=1;else if(u<0.8)x=1-smooth((u-0.5)/0.3);else x=0;this.g={phi,x:x*300};},output(){return this.g.x;},
  draw(){const g=this.g,O=[200,330];circ(O[0],O[1],90);paint(C['brass-fill'],C.ink);bar(O[0],O[1],O[0]+70*Math.cos(g.phi),O[1]+70*Math.sin(g.phi),10,C.part2);pivot(O[0],O[1],6);
    ctx.beginPath();ctx.rect(300,170,440,12);ctx.rect(300,230,440,12);paint(C.part2,C.ink);ctx.beginPath();ctx.moveTo(330+g.x,206);ctx.quadraticCurveTo(360+g.x,186,400+g.x,206);ctx.quadraticCurveTo(360+g.x,226,330+g.x,206);paint(C['steel-fill'],C.ink);
    bar(O[0]+70*Math.cos(g.phi),O[1]+70*Math.sin(g.phi),365+g.x,226,6,C.part);label('PAUSE AT EACH END',520,280,'center');},
  reads(){return[['Shuttle',`${this.g.x.toFixed(0)} mm`]];}});

/* ---- escapements ---- */
function escWheel(E,R,N,W,style){if(style==='pins'){circ(E[0],E[1],R);paint(C['steel-fill'],C.ink);for(let i=0;i<N;i++){const a=W+i*TAU/N;circ(E[0]+(R-10)*Math.cos(a),E[1]+(R-10)*Math.sin(a),4);paint(C.hi,C.ink,1);}}
  else if(style==='three'){circ(E[0],E[1],R*0.35);paint(C['steel-fill'],C.ink);for(let i=0;i<3;i++){const a=W+i*TAU/3;bar(E[0],E[1],E[0]+R*Math.cos(a),E[1]+R*Math.sin(a),12,C['steel-fill']);}}
  else if(style==='lantern'){circ(E[0],E[1],R+8);paint(C.part,C.ink);for(let i=0;i<N;i++){const a=W+i*TAU/N;circ(E[0]+R*Math.cos(a),E[1]+R*Math.sin(a),5);paint(C['steel-fill'],C.ink);}}
  else if(style==='cyl'){const pts=[];circ(E[0],E[1],R*0.6);paint(C['steel-fill'],C.ink);for(let i=0;i<N;i++){const a=W+i*TAU/N;bar(E[0]+R*0.6*Math.cos(a),E[1]+R*0.6*Math.sin(a),E[0]+R*0.85*Math.cos(a),E[1]+R*0.85*Math.sin(a),4,C['steel-fill']);poly([[E[0]+R*0.85*Math.cos(a),E[1]+R*0.85*Math.sin(a)],[E[0]+R*Math.cos(a+0.12),E[1]+R*Math.sin(a+0.12)],[E[0]+R*0.85*Math.cos(a+0.2),E[1]+R*0.85*Math.sin(a+0.2)]]);ctx.closePath();paint(C['steel-fill'],C.ink);}}
  else{const pts=[];const ri=R*0.8;for(let i=0;i<N;i++){const a=W+i*TAU/N;pts.push([E[0]+ri*Math.cos(a),E[1]+ri*Math.sin(a)]);pts.push([E[0]+R*Math.cos(a+(style==='club'?0.05:0.12)),E[1]+R*Math.sin(a+(style==='club'?0.05:0.12))]);if(style==='club')pts.push([E[0]+R*Math.cos(a+0.14),E[1]+R*Math.sin(a+0.14)]);pts.push([E[0]+ri*0.98*Math.cos(a+TAU/N*0.8),E[1]+ri*0.98*Math.sin(a+TAU/N*0.8)]);}poly(pts);ctx.closePath();circ(E[0],E[1],8,false);for(let k=0;k<4;k++){const a=W+k*PI/2;circ(E[0]+R*0.42*Math.cos(a),E[1]+R*0.42*Math.sin(a),R*0.16,false);}paint(C['steel-fill'],C.ink);}
  pivot(E[0],E[1],5);}
function balanceW(B,r,th){circ(B[0],B[1],r);circ(B[0],B[1],r-8,false);paint(C['brass-fill'],C.ink);for(let k=0;k<3;k++){const a=th+k*TAU/3;bar(B[0],B[1],B[0]+(r-6)*Math.cos(a),B[1]+(r-6)*Math.sin(a),5,C['brass-fill']);}
  ctx.save();ctx.strokeStyle=C.muted;ctx.lineWidth=1;ctx.beginPath();for(let i=0;i<=200;i++){const t=i/200*TAU*4,rr=6+i/200*(r-20);const x=B[0]+rr*Math.cos(t+th*(1-i/200)),y=B[1]+rr*Math.sin(t+th*(1-i/200));i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();ctx.restore();pivot(B[0],B[1],4);}
function esc(num,o){return reg({num,outLabel:o.osc==='bal'?'Balance angle, degrees':'Pendulum angle, degrees',concept:o.concept!==false,
  update(phi){const amp=o.amp||(o.osc==='bal'?2.2:0.12);const th=amp*Math.sin(phi);let W;
    if(o.once){const u=phi/TAU+0.75,k=Math.floor(u),f=u-k,s=smooth((f-0.45)/0.12);W=-(k+s)*TAU/o.N;}
    else{const u=phi/PI+0.5,k=Math.floor(u),f=u-k,s=smooth((f-0.42)/0.14);W=-(k+s)*(TAU/o.N)/2;}
    this.g={phi,th,W};},
  output(){return this.g.th*180/PI;},
  draw(){const g=this.g,bal=o.osc==='bal',E=o.E||(bal?[400,370]:[400,300]),R=o.R||(bal?85:95),N=o.N,P=o.P||[E[0],E[1]-R-70],beta=bal?clamp(g.th*0.1,-0.14,0.14):g.th;
    if(!bal){ctx.save();ctx.translate(P[0],P[1]);ctx.rotate(g.th);bar(0,0,0,440-P[1],6,C.part);circ(0,440-P[1],22);paint(C['brass-fill'],C.ink);ctx.restore();ground(P[0],P[1]-12,60,true);}
    if(o.wheel==='duplex'){escWheel(E,R,N,g.W,'saw');escWheel(E,R*0.55,N,g.W+0.1,'pins');}
    else if(o.wheel==='crown'){ctx.beginPath();ctx.rect(E[0]-R,E[1]-14,2*R,28);paint(C['steel-fill'],C.ink);for(let i=0;i<N;i++){const a=g.W*2+i*TAU/N;if(Math.sin(a)>-0.2){const x=E[0]+R*Math.cos(a);poly([[x-6,E[1]-14],[x+6,E[1]-14],[x,E[1]-30]]);ctx.closePath();paint(C['steel-fill'],C.ink);}}}
    else escWheel(E,R,N,g.W,o.wheel||'saw');
    const sp=o.spread||0.78,rot=(p,a)=>[P[0]+(p[0]-P[0])*Math.cos(a)-(p[1]-P[1])*Math.sin(a),P[1]+(p[0]-P[0])*Math.sin(a)+(p[1]-P[1])*Math.cos(a)];
    const tip=s=>{const a=-PI/2+s*sp,rr=o.wheel==='crown'?R*0.7:R+3;return o.wheel==='crown'?[E[0]+s*30,E[1]-34]:[E[0]+rr*Math.cos(a),E[1]+rr*Math.sin(a)];};
    if(o.pallet==='gravity'){for(const s of [-1,1]){const lift=Math.max(0,s*g.th)*1.5,H=[P[0]+s*10,P[1]],T=tip(s),T2=rot(T,s*lift*0.6);bar(H[0],H[1],T2[0],T2[1],7,C.part2);ctx.beginPath();ctx.rect(T2[0]-s*2-6,T2[1]-6,12,12);paint(C['brass-fill'],C.ink);pivot(H[0],H[1],4);}label('GRAVITY ARMS',P[0]+70,P[1]+30);}
    else if(o.pallet==='pin'){const T=rot([E[0],E[1]-R+6],beta);bar(P[0],P[1],T[0],T[1],5,C['brass-fill']);circ(T[0],T[1],6);paint(C.hi,C.ink);}
    else if(o.pallet==='cyl'){const B=[E[0],E[1]-R-6];ctx.save();ctx.translate(B[0],B[1]);ctx.rotate(g.th);ctx.lineWidth=6;ctx.strokeStyle=C.ink;ctx.beginPath();ctx.arc(0,0,14,0,PI);ctx.stroke();ctx.restore();bar(B[0],B[1],B[0],(o.B||[0,120])[1],4,C.part);}
    else{for(const s of [-1,1]){const T=rot(tip(s),beta),Ti=rot([tip(s)[0]+(E[0]-tip(s)[0])*0.12,tip(s)[1]+(E[1]-tip(s)[1])*0.12],beta);bar(P[0],P[1],T[0],T[1],12,C['brass-fill']);bar(T[0],T[1],Ti[0],Ti[1],8,o.pallet==='deadbeat'?C.hi:C['brass-fill']);}
      if(bal){const F=rot([P[0],P[1]-70],beta);bar(P[0],P[1],F[0],F[1],8,C['brass-fill']);for(const s of [-1,1]){const f=rot([P[0]+s*9,P[1]-80],beta);bar(F[0],F[1],f[0],f[1],5,C['brass-fill']);}}}
    pivot(P[0],P[1],6);
    if(bal){const B=o.B||[P[0],P[1]-150];balanceW(B,o.br||62,g.th);const rp=[B[0]+18*Math.sin(-g.th),B[1]+18*Math.cos(g.th)];circ(rp[0],rp[1],4);paint(C.steel,C.ink);label('BALANCE',B[0]+80,B[1]);}
    if(o.detent){const Dp=[E[0]+R+70,E[1]-R+10];const lift=Math.abs(Math.cos(g.phi))<0.12?10:0;bar(Dp[0],Dp[1],E[0]+R*0.62,E[1]-R*0.78-lift,6,C.part);pivot(Dp[0],Dp[1],4);springZ(Dp[0],Dp[1]+10,Dp[0]+40,Dp[1]+60,6,4);label('DETENT',Dp[0]+12,Dp[1]-14);}
    label('ESCAPE WHEEL',E[0]+R+20,E[1]+R*0.6);label(o.label,400,505,'center');},
  reads(){const g=this.g;return[[o.osc==='bal'?'Balance':'Pendulum',`${(g.th*180/PI).toFixed(o.osc==='bal'?0:1)}°`],['Per beat',o.once?'one tooth every full swing':'half a tooth each swing'],['Escape wheel',`${mod(-g.W*180/PI,360).toFixed(0)}°`]];}});}
esc(289,{N:30,pallet:'deadbeat',label:'DEAD-BEAT · the wheel never recoils'});
esc(290,{N:30,label:'PENDULUM ESCAPEMENT'});
esc(291,{N:15,osc:'bal',once:true,detent:true,R:90,E:[400,370],B:[400,130],label:'DETENT ESCAPEMENT · one impulse every swing'});
esc(292,{N:30,wheel:'pins',pallet:'deadbeat',label:'PIN DEAD-BEAT'});
esc(293,{N:15,wheel:'crown',osc:'bal',E:[400,380],P:[400,300],B:[400,150],label:'CROWN-SPUR WATCH ESCAPEMENT'});
esc(294,{N:15,wheel:'cyl',osc:'bal',pallet:'cyl',E:[400,340],B:[400,120],label:'CYLINDER ESCAPEMENT · teeth pass through the half-cylinder'});
esc(295,{N:15,wheel:'cyl',osc:'bal',pallet:'cyl',E:[400,340],B:[400,120],label:'CYLINDER ESCAPEMENT, SECOND VIEW'});
esc(296,{N:15,wheel:'club',osc:'bal',E:[400,380],B:[400,120],R:90,label:'LEVER ESCAPEMENT · fork and roller pin'});
esc(297,{N:10,wheel:'lantern',label:'LANTERN WHEEL ESCAPEMENT'});
alias(298,234,{concept:true});alias(299,234,{concept:true});
esc(300,{N:15,wheel:'duplex',osc:'bal',E:[400,360],B:[400,130],label:'DUPLEX · long teeth lock, short pins give impulse'});
esc(301,{N:15,wheel:'duplex',osc:'bal',E:[400,360],B:[400,130],label:'DUPLEX, SIDE VIEW'});
esc(302,{N:15,osc:'bal',E:[400,370],B:[400,130],label:'BALANCE AND PALLETS'});
esc(303,{N:30,pallet:'deadbeat',spread:0.45,label:'PALLET FACES CENTRED ON THE PIVOT'});
esc(304,{N:30,wheel:'pins',label:'PIN-WHEEL ESCAPEMENT'});
esc(305,{N:12,wheel:'pins',pallet:'pin',label:'SINGLE PIN ON THE PENDULUM'});
esc(306,{N:3,wheel:'three',R:90,label:'THREE TEETH, UPPER AND LOWER PALLETS'});
esc(307,{N:3,wheel:'three',R:110,label:'LONG STOPPING TEETH'});
esc(308,{N:15,once:true,detent:true,label:'DETACHED · pendulum free for most of its swing'});
esc(309,{N:15,pallet:'gravity',label:'GRAVITY · weighted arms give the impulse'});
esc(310,{N:3,wheel:'three',pallet:'gravity',R:90,label:'THREE-LEGGED GRAVITY ESCAPEMENT'});
esc(311,{N:6,wheel:'three',pallet:'gravity',R:90,label:'DOUBLE THREE-LEGGED GRAVITY'});
esc(312,{N:10,R:60,E:[400,340],pallet:'gravity',label:'SMALL LIFTING WHEEL'});
esc(313,{N:15,osc:'bal',once:true,detent:true,R:90,E:[400,370],B:[400,130],label:'CHRONOMETER (DETENT) ESCAPEMENT'});
esc(314,{N:15,wheel:'club',osc:'bal',once:true,E:[400,380],B:[400,120],R:90,label:'LEVER CHRONOMETER'});
esc(396,{N:15,wheel:'club',osc:'bal',once:true,detent:true,E:[400,380],B:[400,120],R:90,label:"REED'S ESCAPEMENT · lever and detent combined"});
esc(238,{N:20,label:'PALLETS RELEASE ONE TOOTH AT A TIME',concept:false});
reg({num:402,outLabel:'Balance angle, degrees',concept:true,
  update(phi){const th=2*Math.sin(phi);const u=phi/PI+0.5,k=Math.floor(u),s=smooth((u-k-0.42)/0.14);this.g={phi,th,W:-(k+s)*(TAU/15)/2};},output(){return this.g.th*180/PI;},
  draw(){const g=this.g;escWheel([400,370],80,15,g.W,'club');balanceW([250,170],70,g.th);balanceW([550,170],70,-g.th);drawGear(325,170,8,8,0,C.part);ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(320,170);ctx.lineTo(480,170);ctx.stroke();ctx.restore();
    label('TWO BALANCES TURN OPPOSITE WAYS · a jolt cannot disturb both',400,500,'center');},
  reads(){return[['Left balance',`${(this.g.th*180/PI).toFixed(0)}°`],['Right balance',`${(-this.g.th*180/PI).toFixed(0)}°`]];}});

/* ---- pendulum compensation & regulation ---- */
function compPend(num,o){return reg({num,outLabel:'Rate error, s/day',params:[{id:'t',label:'Temperature',min:-10,max:40,step:1,value:30,fmt:v=>v+' °C'},{id:'c',type:'toggle',label:'Compensation',options:[[1,'On'],[0,'Off']],value:1}],
  update(phi){const dT=this.P.t-15;const grow=dT*0.9,comp=this.P.c?grow:0;const Leff=1+(grow-comp)*1e-5;this.g={phi,th:0.15*Math.sin(phi),grow,comp,err:-43200*(Leff-1)};},output(){return this.g.err;},
  draw(){const g=this.g,A=[400,60],L=330+g.grow;ctx.save();ctx.translate(A[0],A[1]);ctx.rotate(g.th);bar(0,0,0,L,6,C.part);
    if(o.kind==='mercury'){ctx.beginPath();ctx.rect(-30,L-40,60,110);paint(C.part2,C.ink);ctx.fillStyle=C['steel-fill'];const h=70+(this.P.c?g.grow*1.0:0);ctx.fillRect(-26,L+66-h,52,h);label('MERCURY',40,L+20);}
    else if(o.kind==='bars'){for(const s of [-1,1]){bar(s*20,L-160,s*20,L-g.comp,6,s>0?C['brass-fill']:C.part);}bar(-30,L-g.comp,30,L-g.comp,8,C.part2);circ(0,L,26);paint(C['brass-fill'],C.ink);}
    ctx.restore();pivot(A[0],A[1],6);ground(A[0],A[1]-10,60,true);if(o.kind==='bars')label('BRASS RODS LIFT THE BOB AS THE IRON STRETCHES',460,300);label('Rod growth is exaggerated for clarity',400,505,'center');},
  reads(){const g=this.g;return[['Rod growth',`${(g.grow*0.02).toFixed(2)} mm`],['Compensation',this.P.c?'cancels it':'off'],['Clock error',`${g.err.toFixed(1)} s/day`]];}});}
compPend(316,{kind:'mercury'});compPend(317,{kind:'bars'});

reg({num:318,outLabel:'Rate change, s/day',params:[{id:'p',label:'Regulator lever',min:-1,max:1,step:0.05,value:0.3,fmt:v=>v>0?`fast ${v}`:v<0?`slow ${-v}`:'centre'}],
  update(phi){this.g={phi,th:2*Math.sin(phi*(1+this.P.p*0.08))};},output(){return this.P.p*120;},
  draw(){const g=this.g,B=[360,270];balanceW(B,110,g.th);const t=-PI/2+this.P.p*0.6;const Rr=[B[0]+90*Math.cos(t),B[1]+90*Math.sin(t)];bar(B[0],B[1],B[0]+200*Math.cos(t),B[1]+200*Math.sin(t),8,C['steel-fill']);circ(Rr[0],Rr[1],6);paint(C.part2,C.ink);
    ctx.save();ctx.strokeStyle=C.rule;ctx.beginPath();ctx.arc(B[0],B[1],200,-PI/2-0.7,-PI/2+0.7);ctx.stroke();ctx.restore();label('S',B[0]+200*Math.cos(-PI/2-0.65)-14,B[1]+200*Math.sin(-PI/2-0.65));label('F',B[0]+200*Math.cos(-PI/2+0.65)+6,B[1]+200*Math.sin(-PI/2+0.65));
    label('CURB PINS SHORTEN OR LENGTHEN THE ACTIVE SPRING',400,490,'center');},
  reads(){return[['Lever',this.P.p.toFixed(2)],['Rate change',`${(this.P.p*120).toFixed(0)} s/day`]];}});

reg({num:319,outLabel:'Rim weight shift, mm',params:[{id:'t',label:'Temperature',min:-10,max:40,step:1,value:30,fmt:v=>v+' °C'}],
  update(phi){const k=(this.P.t-15)*0.8;this.g={phi,th:2*Math.sin(phi),k};},output(){return -this.g.k*0.05;},
  draw(){const g=this.g,B=[400,270],r=130;bar(B[0]+r*Math.cos(g.th),B[1]+r*Math.sin(g.th),B[0]-r*Math.cos(g.th),B[1]-r*Math.sin(g.th),10,C.part);
    for(const s of [0,PI]){const a0=g.th+s;ctx.save();ctx.lineWidth=10;ctx.strokeStyle=C['brass-fill'];ctx.beginPath();const curl=g.k*0.004;ctx.arc(B[0],B[1],r-curl*200,a0+0.05,a0+PI-0.25);ctx.stroke();ctx.lineWidth=4;ctx.strokeStyle=C.steel;ctx.beginPath();ctx.arc(B[0],B[1],r-6-curl*200,a0+0.05,a0+PI-0.25);ctx.stroke();ctx.restore();
      const wa=a0+PI-0.6;circ(B[0]+(r-g.k*0.6)*Math.cos(wa),B[1]+(r-g.k*0.6)*Math.sin(wa),9);paint(C.part2,C.ink);}
    pivot(B[0],B[1],6);label('HEAT CURLS THE BRASS-STEEL RIM INWARD, CARRYING WEIGHTS IN',400,480,'center');label('(movement exaggerated)',400,500,'center');},
  reads(){return[['Temperature',`${this.P.t} °C`],['Weights move',`${(this.g.k*0.05).toFixed(2)} mm ${this.g.k>0?'in':'out'}`],['Effect','offsets the weaker spring']];}});

function maintain(num,o){return reg({num,outLabel:'Going wheel, turns',concept:true,
  update(phi){const wind=mod(phi,TAU*2)<TAU*0.6;this.g={phi,wind,go:phi*0.3};},output(){return this.g.go/TAU;},
  draw(){const g=this.g;if(o.kind==='chain'){const A=[300,140],B=[500,140];pulley(A[0],A[1],50,g.go,C['steel-fill']);pulley(B[0],B[1],50,g.wind?g.phi:0,C['brass-fill']);const yW=320-((g.phi*20)%120)*0,yL=360;
      rope([[A[0]-50,A[1]],[A[0]-50,330]]);pulley(A[0]+50-0,330,26,-g.go,C.part);rope([[A[0]+50,A[1]],[A[0]+50+0,304]]);rope([[B[0]-50,B[1]],[A[0]+76,330]]);rope([[B[0]+50,B[1]],[B[0]+50,380]]);pulley(B[0]+24,400,26,g.go,C.part);rope([[B[0]-2,400],[A[0]-50,330]]);
      weight(A[0]+50,356,60,70,'WEIGHT');weight(B[0]+24,426,40,40,'');label('ENDLESS CHAIN: pull the right side to wind, the clock keeps going',400,500,'center');}
    else{const O=[400,270];drawGear(O[0],O[1],110,44,g.go,C['steel-fill'],{bore:6});sawWheel(O[0],O[1],g.wind?g.go-0.3:g.go,24,60,74,C['brass-fill']);paint(C['brass-fill'],C.ink);springZ(O[0]-40,O[1],O[0]+40,O[1]+30,8,5);pivot(O[0],O[1],6);label(g.wind?'WINDING · the spring keeps driving the train':'GOING · main weight drives',400,480,'center');}},
  reads(){return[['State',this.g.wind?'being wound':'going'],['Clock','never stops']];}});}
maintain(320,{kind:'chain'});maintain(321,{kind:'harrison'});
