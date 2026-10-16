/* ================= batch 3 · part 6: tools, instruments, clamps, odds and ends ================= */
aliasObj(51,SIMS_NEW[50],{concept:true});alias(87,53,{concept:true});alias(159,158,{concept:true});alias(160,158,{concept:true});alias(416,158,{concept:true});
alias(164,140,{concept:true});alias(352,129,{concept:true});diffScrew(260);SIMS_NEW[260].concept=true;
const openClose=(phi)=>{const u=mod(phi*0.5,TAU)/TAU;return u<0.35?smooth(u/0.35):u<0.6?1:u<0.95?1-smooth((u-0.6)/0.35):0;};

/* ---- clamps ---- */
function clampSim(num,o){return reg({num,outLabel:'Jaw closure, %',concept:!!o.concept,
  update(phi){this.g={phi,c:openClose(phi)};},output(){return this.g.c*100;},
  draw(){const g=this.g,c=g.c;ctx.beginPath();ctx.rect(80,330,640,40);paint(C.part2,C.ink);ctx.beginPath();ctx.rect(330,280,140,50);paint(C['brass-fill'],C.ink);label('WORK',400,305,'center');
    if(o.kind==='screw'){const x=470+80*(1-c);ctx.beginPath();ctx.rect(x,220,30,110);paint(C['steel-fill'],C.ink);screwShaft(x+30,720,260,12,c*20,14);ctx.beginPath();ctx.rect(300,220,30,110);paint(C.part,C.ink);bar(720,230,720,290,8,C.part);}
    else if(o.kind==='pivot'){const a=-0.5*(1-c);ctx.save();ctx.translate(600,330);ctx.rotate(a);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(-130,-20);ctx.lineTo(-130,-50);ctx.lineTo(0,-40);ctx.closePath();paint(C['steel-fill'],C.ink);ctx.restore();pivot(600,330,6);ctx.beginPath();ctx.rect(300,220,30,110);paint(C.part,C.ink);}
    else if(o.kind==='lever'){const a=-0.4*(1-c);ctx.save();ctx.translate(200,200);ctx.rotate(a);ctx.beginPath();ctx.rect(0,-12,320,24);paint(C['steel-fill'],C.ink);ctx.restore();pivot(200,200,6);bar(200,200,200,330,12,C.part);screwShaft(540,560,180,14,c*20,10);bar(550,120,550,180+60*c*0,10,C.part);}
    else{const d=60*(1-c);ctx.beginPath();ctx.rect(300,220,30,110);ctx.rect(470+d,220,30,110);paint(C.part,C.ink);poly([[500+d,220],[560+d*0.2,220],[530+d*0.2,330],[500+d,330]]);ctx.closePath();paint(C['steel-fill'],C.ink);ctx.beginPath();ctx.rect(560,200,30,130);paint(C.part2,C.ink);}
    label(c>0.98?'CLAMPED':c<0.02?'OPEN':'CLOSING / OPENING',400,420,'center');label(o.label,400,480,'center');},
  reads(){return[['Grip',`${(this.g.c*100).toFixed(0)} %`]];}});}
clampSim(174,{kind:'screw',label:'BENCH CLAMP · the screw closes the jaw'});clampSim(180,{kind:'pivot',label:'PIVOTED CLAMP AGAINST A FIXED SIDE PIECE'});clampSim(190,{kind:'lever',label:'SCREW PRESSES THE HOLDER DOWN ON THE WORK',concept:true});clampSim(381,{kind:'wedge',label:"JOINER'S CLAMP WITH WEDGES"});

/* ---- parallel rulers ---- */
function ruler(num,o){return reg({num,outLabel:'Ruler spacing, mm',concept:!!o.concept,
  update(phi){const a=-PI/2+0.9*Math.sin(phi*0.5);this.g={phi,a};},output(){return -Math.sin(this.g.a)*140;},
  draw(){const g=this.g,y0=380,L=140,P1=[260,y0],P2=[540,y0],d=[L*Math.cos(g.a),L*Math.sin(g.a)];const Q1=[P1[0]+d[0],P1[1]+d[1]],Q2=[P2[0]+d[0],P2[1]+d[1]];
    ctx.beginPath();ctx.rect(150,y0-14,500,28);paint(C['brass-fill'],C.ink);ctx.beginPath();ctx.rect(Q1[0]-110,Q1[1]-14,500,28);paint(C['steel-fill'],C.ink);
    if(o.kind==='roll'){for(const x of [260,540]){circ(x+d[0],y0+0,26);paint(C.part,C.ink);}}
    else if(o.kind==='cross'){bar(P1[0],P1[1],Q2[0],Q2[1],8,C.part2);bar(P2[0],P2[1],Q1[0],Q1[1],8,C.part2);}
    else if(o.kind==='tri'){poly([[Q1[0]-110,Q1[1]-14],[Q1[0]+390,Q1[1]-14],[Q1[0]+390,Q1[1]-80]]);ctx.closePath();paint(C.part,C.ink);}
    else{bar(P1[0],P1[1],Q1[0],Q1[1],10,C.part);bar(P2[0],P2[1],Q2[0],Q2[1],10,C.part);if(o.kind==='joint'){const M1=[(P1[0]+Q1[0])/2+16,(P1[1]+Q1[1])/2],M2=[(P2[0]+Q2[0])/2+16,(P2[1]+Q2[1])/2];pivot(M1[0],M1[1],3);pivot(M2[0],M2[1],3);}pivot(P1[0],P1[1],5);pivot(P2[0],P2[1],5);pivot(Q1[0],Q1[1],5);pivot(Q2[0],Q2[1],5);}
    if(o.scale){for(let k=0;k<20;k++){const x=160+k*24;ctx.beginPath();ctx.moveTo(x,y0-14);ctx.lineTo(x,y0-(k%5?6:0));paint(null,C.ink,1);}}
    ctx.save();ctx.strokeStyle=C.steel;ctx.setLineDash([6,6]);ctx.beginPath();ctx.moveTo(60,Q1[1]-14);ctx.lineTo(740,Q1[1]-14);ctx.stroke();ctx.restore();label(o.label,400,470,'center');label('the upper edge stays parallel to the lower one',400,490,'center');},
  reads(){return[['Spacing',`${(-Math.sin(this.g.a)*140).toFixed(0)} mm`],['Edges','always parallel']];}});}
ruler(322,{kind:'tri',label:'TWO TRIANGLES SLIDING ON THEIR LONG EDGE',concept:true});ruler(323,{kind:'roll',label:'ROLLING RULER ON TWO EQUAL WHEELS',concept:true});ruler(324,{kind:'cross',label:'CROSSED ARMS WITH A SLIDING PIN',concept:true});ruler(349,{kind:'joint',label:'JOINTED ARMS'});ruler(367,{scale:true,label:'SCALE FOR SPACING LINES EVENLY'});

/* ---- drawing instruments ---- */
function tracer(num,o){return reg({num,outLabel:o.outLabel||'Pen height, mm',concept:!!o.concept,
  reset(){this.trail=[];},
  update(phi){const r=o.pos(phi);this.g=Object.assign({phi},r);this.trail=this.trail||[];this.trail.push(r.P);if(this.trail.length>(o.tlen||500))this.trail.shift();},
  output(){return 400-this.g.P[1];},
  draw(){const g=this.g;if(o.bg)o.bg.call(this,g);if(this.trail.length>1){ctx.save();ctx.strokeStyle=C.steel;ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(...this.trail[0]);for(const p of this.trail)ctx.lineTo(...p);ctx.stroke();ctx.restore();}o.fg.call(this,g);circ(g.P[0],g.P[1],5);paint(C.steel,C.ink);label(o.label,400,505,'center');},
  reads(){return o.reads?o.reads.call(this):[['Pen',`${this.g.P[0].toFixed(0)}, ${this.g.P[1].toFixed(0)}`]];}});}
tracer(405,{label:'THREAD AND RULE · the pen keeps a constant difference of distances',outLabel:'Pen height, mm',
  pos(phi){const F1=[250,300],F2=[550,300],L=420,l=320,th=-0.6*Math.sin(phi*0.4)-PI*0+0;const a=-0.0+th;const u=[Math.cos(a+0.0),Math.sin(a)];const E=[F1[0]+L*u[0],F1[1]+L*u[1]];
    let lo=0,hi=L;for(let i=0;i<50;i++){const t=(lo+hi)/2,P=[F1[0]+t*u[0],F1[1]+t*u[1]];const f=(L-t)+Math.hypot(P[0]-F2[0],P[1]-F2[1])-l;if(f>0)lo=t;else hi=t;}const t=(lo+hi)/2;return{F1,F2,E,P:[F1[0]+t*u[0],F1[1]+t*u[1]]};},
  fg(g){bar(g.F1[0],g.F1[1],g.E[0],g.E[1],10,C['brass-fill']);rope([g.E,g.P,g.F2]);pivot(g.F1[0],g.F1[1],5);pivot(g.F2[0],g.F2[1],5);label('F1',g.F1[0]-24,g.F1[1]);label('F2',g.F2[0]+10,g.F2[1]+16);}});
tracer(406,{label:'THREAD AND SQUARE · the pen stays as far from the focus as from the edge',
  pos(phi){const F=[400,230],dy=420,s=400+230*Math.sin(phi*0.4);const y=(dy*dy-(s-F[0])**2-F[1]**2)/(2*(dy-F[1]));return{F,s,dy,P:[s,y],top:y-60};},
  bg(g){ctx.beginPath();ctx.rect(80,g.dy,640,14);paint(C.part2,C.ink);},
  fg(g){ctx.beginPath();ctx.rect(g.s,g.top-40,14,g.dy-g.top+40);paint(C['brass-fill'],C.ink);ctx.beginPath();ctx.rect(g.s-40,g.dy-20,80,20);paint(C['brass-fill'],C.ink);rope([[g.s,g.top-40],g.P,g.F]);pivot(g.F[0],g.F[1],5);label('FOCUS',g.F[0]+10,g.F[1]-12);}});
tracer(403,{label:'CYCLOGRAPH · draws a big arc without reaching its centre',concept:true,
  pos(phi){const R=900,C0=[400,300+R],a=0.38*Math.sin(phi*0.4);return{a,P:[C0[0]+R*Math.sin(a),C0[1]-R*Math.cos(a)],C0};},
  fg(g){const P=g.P;for(const s of [-1,1]){bar(P[0],P[1],P[0]+s*160,P[1]+60,8,C['brass-fill']);circ(P[0]+s*160,P[1]+60,8);paint(C.hi,C.ink);}circ(260,380,6);paint(C.ink);circ(540,380,6);paint(C.ink);label('PINS',260,400,'center');}});
tracer(384,{label:'WHEEL ON A THREADED AXLE · draws a spiral',
  pos(phi){const t=mod(phi*0.6,TAU*4),r=20+t*7;return{t,P:[400+r*Math.cos(t),270+r*Math.sin(t)]};},
  fg(g){bar(400,270,g.P[0],g.P[1],8,C.part);circ(g.P[0],g.P[1],14);paint(C['brass-fill'],C.ink);pivot(400,270,6);}});
tracer(368,{label:'CYLINDER TURNS WHILE THE RACK MOVES THE POINT · a spiral line',
  pos(phi){const t=mod(phi,TAU*3);const x=200+t/(TAU*3)*400,y=270-80*Math.cos(t);return{t,P:[x,y],front:Math.sin(t)>0};},
  bg(g){ctx.beginPath();ctx.rect(200,190,400,160);paint(C['brass-fill'],C.ink);},
  fg(g){ctx.beginPath();ctx.rect(g.P[0]-6,100,12,g.P[1]-100);paint(C.part,C.ink);ctx.beginPath();ctx.rect(150,90,500,14);paint(C['steel-fill'],C.ink);drawGear(130,270,36,12,g.t,C.part,{bore:4});},tlen:600});
tracer(407,{label:'POINTED ARCH · two arcs struck from the springing points',
  pos(phi){const u=mod(phi*0.3,1),A=[260,380],B=[540,380],R=280;let P;if(u<0.5){const a=PI-u*2*PI/3;P=[B[0]+R*Math.cos(a),B[1]-R*Math.sin(a)];}else{const a=PI/3*(2-u*2)+0;P=[A[0]+R*Math.cos(PI/3-(u-0.5)*2*PI/3),A[1]-R*Math.sin(PI/3-(u-0.5)*2*PI/3)];}return{P,A,B,u};},
  fg(g){const c=g.u<0.5?g.B:g.A;bar(c[0],c[1],g.P[0],g.P[1],6,C['brass-fill']);pivot(g.A[0],g.A[1],5);pivot(g.B[0],g.B[1],5);ctx.beginPath();ctx.rect(200,380,400,10);paint(C.part2,C.ink);}});
tracer(370,{label:'CRANK AND RATCHET GIVE A VARIED RUBBING PATH',concept:true,
  pos(phi){const t=phi*0.8;return{t,P:[400+120*Math.cos(t)+40*Math.cos(t*7.3),260+120*Math.sin(t)+40*Math.sin(t*7.3)]};},
  bg(){circ(400,260,190);paint(C.part,C.ink);},fg(g){circ(g.P[0],g.P[1],34);paint(C['brass-fill'],C.ink);},tlen:900});
tracer(393,{label:'CUP ORBITS AND SPINS · it wears the lens evenly',concept:true,
  pos(phi){const t=phi*0.8;return{t,P:[400+90*Math.cos(t)+50*Math.cos(t*3.7),260+90*Math.sin(t)+50*Math.sin(t*3.7)]};},
  bg(){circ(400,260,170);paint(C['steel-fill'],C.ink);},fg(g){circ(g.P[0],g.P[1],40);paint(C['brass-fill'],C.ink);bar(g.P[0],g.P[1],g.P[0]+30*Math.cos(g.t*6),g.P[1]+30*Math.sin(g.t*6),4,C.part2);},tlen:900});
tracer(411,{label:'CARRIAGE ROLLS OVER THE GROUND · the pendulum pen draws its profile',concept:true,
  pos(phi){const x=mod(phi*30,600)+100,gnd=x=>380-40*Math.sin(x/90)-20*Math.sin(x/37);const slope=Math.atan2(gnd(x+20)-gnd(x-20),40);return{x,gy:gnd(x),slope,P:[x,180+(gnd(x)-380)*0.6]};},
  bg(g){ctx.beginPath();ctx.moveTo(60,520);for(let x=60;x<=760;x+=10)ctx.lineTo(x,380-40*Math.sin(x/90)-20*Math.sin(x/37));ctx.lineTo(760,520);ctx.closePath();paint(C.part2,C.ink);ctx.beginPath();ctx.rect(60,120,680,120);paint(C.hi,C.ink);},
  fg(g){ctx.save();ctx.translate(g.x,g.gy-30);ctx.rotate(g.slope);ctx.beginPath();ctx.rect(-50,-20,100,30);paint(C['steel-fill'],C.ink);circ(-36,18,12);paint(C.part,C.ink);circ(36,18,12);paint(C.part,C.ink);ctx.restore();bar(g.x,g.gy-50,g.P[0],g.P[1],4,C.part);},tlen:900});
tracer(408,{label:'CENTROLINEAD · every line runs to a far vanishing point',concept:true,
  pos(phi){const a=0.25*Math.sin(phi*0.5),V=[1600,260];return{a,V,P:[150,260+170*Math.sin(phi*0.5)]};},
  bg(g){for(let k=-4;k<=4;k++){ctx.save();ctx.strokeStyle=C.rule;ctx.beginPath();ctx.moveTo(100,260+k*55);ctx.lineTo(800,260+k*55*(800-1600)/(100-1600));ctx.stroke();ctx.restore();}},
  fg(g){const y=g.P[1];ctx.save();ctx.translate(150,y);ctx.rotate(-g.a*0+Math.atan2(260-y,1450));ctx.beginPath();ctx.rect(0,-8,560,16);paint(C['brass-fill'],C.ink);ctx.restore();circ(220,180,6);paint(C.ink);circ(220,340,6);paint(C.ink);}});

reg({num:404,outLabel:'Bow sag, mm',params:[{id:'b',label:'Bend',min:10,max:100,step:2,value:50,fmt:v=>v+' mm'}],
  update(phi){this.g={phi,s:this.P.b};},output(){return this.g.s;},
  draw(){const g=this.g,A=[180,320],B=[620,320],s=g.s,M=[400,320-s];const R=((220*220)+s*s)/(2*s),Cy=M[1]+R;ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=10;ctx.beginPath();ctx.arc(400,Cy,R,-PI/2-Math.asin(240/R),-PI/2+Math.asin(240/R));ctx.stroke();ctx.strokeStyle=C['brass-fill'];ctx.lineWidth=7;ctx.stroke();ctx.restore();
    rope([[160,320+s*0.1],[640,320+s*0.1]]);for(const p of [A,M,B]){circ(p[0],p[1],5);paint(C.steel,C.ink);}label('THE TAPERED BAR BENDS INTO A TRUE ARC THROUGH THREE POINTS',400,470,'center');},
  reads(){const s=this.g.s;return[['Sag',`${s} mm`],['Arc radius',`${(((220*220)+s*s)/(2*s)).toFixed(0)} mm`]];}});

reg({num:410,outLabel:'Mark offset, mm',params:[{id:'w',label:'Bar width',min:40,max:200,step:5,value:120,fmt:v=>v+' mm'}],
  update(phi){this.g={phi};},output(){return 0;},
  draw(){const w=this.P.w,X=400;ctx.beginPath();ctx.rect(X-w/2,200,w,240);paint(C.part2,C.ink);ctx.save();ctx.translate(X,240);ctx.beginPath();ctx.moveTo(-w/2-30,0);ctx.lineTo(w/2+30,0);ctx.lineTo(w/2+30,-20);ctx.lineTo(-w/2-30,-20);ctx.closePath();paint(C['brass-fill'],C.ink);for(const s of [-1,1]){circ(s*w/2,-4,6);paint(C.ink);}ctx.restore();
    ctx.save();ctx.strokeStyle=C.steel;ctx.lineWidth=2;ctx.setLineDash([6,4]);ctx.beginPath();ctx.moveTo(X,200);ctx.lineTo(X,440);ctx.stroke();ctx.restore();bar(X,220,X,260,4,C.ink);label('PINS EQUALLY SPACED FROM THE SCRIBER FIND THE CENTRE OF ANY WIDTH',400,480,'center');},
  reads(){return[['Bar width',`${this.P.w} mm`],['Mark',`${this.P.w/2} mm from each edge`]];}});

/* ---- odds and ends with simple cycles ---- */
reg({num:244,outLabel:'Brake power, units',params:[{id:'m',label:'Weight on the arm',min:1,max:20,step:1,value:8,fmt:v=>v+' kg'}],
  update(phi){this.g={phi,tilt:0.04*Math.sin(phi*3)};},output(){return this.P.m*0.5*TAU;},
  draw(){const g=this.g,O=[260,270];flywheel(O[0],O[1],110,g.phi);ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=12;ctx.beginPath();ctx.arc(O[0],O[1],118,0,TAU);ctx.stroke();ctx.strokeStyle=C['brass-fill'];ctx.lineWidth=8;ctx.stroke();ctx.restore();
    ctx.save();ctx.translate(O[0],O[1]);ctx.rotate(g.tilt);ctx.beginPath();ctx.rect(110,-12,360,24);paint(C['steel-fill'],C.ink);bar(450,12,450,80,4,C.part);weight(450,80,40+this.P.m*2,40,'');ctx.restore();ctx.beginPath();ctx.rect(560,160,20,90);paint(C.part2,C.ink);label('STOPS',590,170);label('POWER = WEIGHT × ARM × SPEED',400,480,'center');},
  reads(){return[['Load',`${this.P.m} kg at 0.5 m`],['Torque',`${(this.P.m*9.81*0.5).toFixed(1)} N·m`],['At 60 rpm',`${(this.P.m*9.81*0.5*TAU).toFixed(0)} W`]];}});

reg({num:247,outLabel:'Depth, m',
  update(phi){const u=mod(phi*0.4,TAU)/TAU;this.g={phi,u,y:u<0.5?100+u*2*300:400-(u-0.5)*2*300,rel:u>=0.5};},output(){return this.g.y;},
  draw(){const g=this.g;water(0,80,800,340);ctx.save();ctx.fillStyle=C.part2;ctx.fillRect(0,420,800,100);ctx.restore();const X=400,y=g.y;ctx.beginPath();ctx.rect(X-8,y-80,16,100);paint(C['steel-fill'],C.ink);
    if(!g.rel){ctx.beginPath();ctx.rect(X-30,y+20,60,40);paint(C.part,C.ink);label('WEIGHT',X+40,y+40);}else{ctx.beginPath();ctx.rect(X-30,420-20,60,40);paint(C.part,C.ink);label('WEIGHT LEFT ON THE BOTTOM',X+40,410);}
    rope([[X,0],[X,y-80]]);label(g.rel?'STRUCK BOTTOM · weight released, tube comes back up with a sample':'SINKING',400,40,'center');},
  reads(){return[['Phase',this.g.rel?'returning':'sinking']];}});

reg({num:248,outLabel:'Gap, mm',
  update(phi){const c=openClose(phi);this.g={phi,c,gap:30*(1-c)};},output(){return this.g.gap;},
  draw(){const g=this.g,y=260;bar(80,y,380-g.gap,y,40,C['steel-fill']);bar(420,y,720,y,40,C['steel-fill']);ctx.beginPath();ctx.rect(370-g.gap,y-34,30,68);paint(C.part,C.ink);ctx.beginPath();ctx.rect(400,y-34,30,68);paint(C.part,C.ink);
    const nx=370-g.gap*0.5;ctx.beginPath();ctx.rect(nx-10,y-50,90,100);paint(C['brass-fill'],C.ink);ctx.save();ctx.strokeStyle=C.ink;for(let k=0;k<6;k++){const x=nx-6+mod(k*15+g.c*60,90);ctx.beginPath();ctx.moveTo(x,y-50);ctx.lineTo(x,y+50);ctx.stroke();}ctx.restore();label(g.c>0.98?'NUT TIGHT · pipes joined':'TURNING THE NUT DRAWS THE ENDS TOGETHER',400,400,'center');},
  reads(){return[['Joint',this.g.c>0.98?'made':'open']];}});

reg({num:249,outLabel:'Tube angle, degrees',
  update(phi){this.g={phi,a:0.5*Math.sin(phi*0.6),b:0.3*Math.cos(phi*0.6)};},output(){return this.g.a*180/PI;},
  draw(){const g=this.g,B=[360,270];bar(80,270,B[0]-40,270,40,C['steel-fill']);ctx.beginPath();ctx.arc(B[0],B[1],56,-PI/2-0.9,PI/2+0.9,true);paint(null,C.ink,10);circ(B[0],B[1],46);paint(C['brass-fill'],C.ink);
    const E=[B[0]+330*Math.cos(g.a),B[1]+330*Math.sin(g.a)];bar(B[0],B[1],E[0],E[1],36*(0.85+0.15*Math.cos(g.b)),C['steel-fill']);circ(B[0],B[1],46);paint(C['brass-fill'],C.ink);label('BALL TURNS IN THE SOCKET · the tube can point any way',400,480,'center');},
  reads(){return[['Swing',`${(this.g.a*180/PI).toFixed(0)}°`]];}});

reg({num:253,outLabel:'Drum speed, %',
  update(phi){const u=mod(phi*0.4,TAU)/TAU;const sp=u<0.6?0.4+u:u<0.62?1:0;this.g={phi,sp,caught:u>=0.6};},output(){return this.g.sp*100;},
  draw(){const g=this.g,O=[400,250],R=130;circ(O[0],O[1],R+30);paint(C.part2,C.ink);for(let k=0;k<16;k++){const a=k*TAU/16;poly([[O[0]+(R+30)*Math.cos(a),O[1]+(R+30)*Math.sin(a)],[O[0]+(R+30)*Math.cos(a+0.15),O[1]+(R+30)*Math.sin(a+0.15)],[O[0]+(R+14)*Math.cos(a+0.15),O[1]+(R+14)*Math.sin(a+0.15)]]);ctx.closePath();paint(C.part,C.ink,1);}
    circ(O[0],O[1],R);paint(C['brass-fill'],C.ink);const rot=g.phi*(g.caught?0:1)*1.5;for(const s of [0,PI]){const a=rot+s,out=g.sp>0.9?1:0;const P=[O[0]+90*Math.cos(a),O[1]+90*Math.sin(a)];ctx.save();ctx.translate(P[0],P[1]);ctx.rotate(a+PI/2-0.6*out);ctx.beginPath();ctx.rect(-8,-10,60,20);paint(C['steel-fill'],C.ink);ctx.restore();pivot(P[0],P[1],4);}
    pivot(O[0],O[1],6);rope([[O[0]+R,O[1]],[O[0]+R,500]]);label(g.caught?'RUNAWAY · hooks fly out and catch':'NORMAL SPEED · springs hold the hooks in',400,40,'center');},
  reads(){return[['Drum',this.g.caught?'stopped':`${(this.g.sp*100).toFixed(0)} %`]];}});

reg({num:261,outLabel:'Weight height, mm',concept:true,
  update(phi){const u=mod(phi,TAU)/TAU;const h=u<0.65?u/0.65:1-(u-0.65)/0.35;this.g={phi,h};},output(){return this.g.h*150;},
  draw(){const g=this.g,O=[300,180];circ(O[0],O[1],90);paint(C['brass-fill'],C.ink);bar(O[0],O[1],O[0]+70*Math.cos(g.phi),O[1]+70*Math.sin(g.phi),8,C.part2);pivot(O[0],O[1],6);pulley(520,120,40,-g.h*4,C.part);rope([[O[0]+70*Math.cos(g.phi),O[1]+70*Math.sin(g.phi)],[520,80],[560,120],[560,420-g.h*150]]);weight(560,420-g.h*150,60,50,'');label('SLOW LIFT, QUICKER RETURN',400,480,'center');},
  reads(){return[['Weight',`${(this.g.h*150).toFixed(0)} mm`]];}});

reg({num:265,outLabel:'Roller speed, ×',params:[{id:'x',label:'Roller position',min:0,max:1,step:0.02,value:0.5,fmt:v=>`${Math.round(v*100)} %`}],
  update(phi){const r=40+100*this.P.x;this.g={phi,r};},output(){return this.g.r/30;},
  draw(){const g=this.g,y=300;poly([[150,y-40],[650,y-140],[650,y],[150,y]]);ctx.closePath();paint(C['brass-fill'],C.ink);const x=150+500*this.P.x;circ(x,y-g.r-34+30,30);paint(C['steel-fill'],C.ink);bar(x,y-g.r-4,x,60,8,C.part);bar(80,y-20,150,y-20,10,C.part);label('SLIDE THE ROLLER ALONG THE CONE TO CHANGE SPEED',400,470,'center');},
  reads(){return[['Cone radius here',`${this.g.r.toFixed(0)} mm`],['Roller speed',`${(this.g.r/30).toFixed(2)} × cone`]];}});

reg({num:267,outLabel:'Pulley turns',
  reset(){this.w=0;this.last=null;},
  update(phi){const a=0.6*Math.sin(phi);if(this.last===null)this.last=a;const d=a-this.last;this.last=a;if(d>0)this.w+=d;this.g={phi,a,grip:d>0};},output(){return this.w/TAU;},
  draw(){const g=this.g,O=[400,270];circ(O[0],O[1],160);circ(O[0],O[1],130,false);paint(C['steel-fill'],C.ink);bar(O[0],O[1],O[0]+150*Math.cos(this.w),O[1]+150*Math.sin(this.w),6,C.part2);
    for(let k=0;k<3;k++){const a=g.a+k*TAU/3;const P=[O[0]+80*Math.cos(a),O[1]+80*Math.sin(a)];bar(O[0],O[1],P[0],P[1],12,C['brass-fill']);ctx.save();ctx.translate(P[0],P[1]);ctx.rotate(a+(g.grip?0.15:0.4));ctx.beginPath();ctx.ellipse(28,0,30,14,0,0,TAU);paint(C.part,C.ink);ctx.restore();pivot(P[0],P[1],4);}
    pivot(O[0],O[1],6);label(g.grip?'ARMS JAM AGAINST THE RIM · pulley driven':'ARMS SLIP BACK FREELY',400,470,'center');},
  reads(){return[['Arms',this.g.grip?'gripping':'slipping'],['Pulley',`${(this.w/TAU).toFixed(2)} turns`]];}});

reg({num:334,outLabel:'Piston height, mm',
  update(phi){const a=0.3*Math.sin(phi);this.g={phi,a,y:a*150};},output(){return this.g.y;},
  draw(){const g=this.g,F=[460,200],R=150;ctx.save();ctx.translate(F[0],F[1]);ctx.rotate(g.a);ctx.beginPath();ctx.rect(-10,-12,280,24);paint(C['brass-fill'],C.ink);ctx.restore();poly(gearPts(F[0],F[1],R,60,g.a+PI,false,PI-0.5,PI+0.5));ctx.lineTo(F[0],F[1]);ctx.closePath();paint(C['brass-fill'],C.ink);pivot(F[0],F[1],7);
    const X=F[0]-R-12,y=F[1]-g.y;ctx.beginPath();ctx.rect(X-16,y-140,24,300);paint(C['steel-fill'],C.ink);for(let k=0;k<15;k++){ctx.beginPath();ctx.rect(X+8,y-136+k*20,8,10);paint(C['steel-fill'],C.ink,.8);}ctx.beginPath();ctx.rect(X-60,360,90,140);paint(C.part2,C.ink);label('RACK ON THE PISTON ROD WORKS THE BEAM SECTOR',400,40,'center');},
  reads(){return[['Rod',`${this.g.y.toFixed(0)} mm`],['Beam',`${(this.g.a*180/PI).toFixed(0)}°`]];}});

reg({num:366,outLabel:'Drill depth, mm',
  update(phi){const d=40*(1-Math.cos(phi*0.3))/2;this.g={phi,d};},output(){return this.g.d;},
  draw(){const g=this.g,X=400;drawGear(X,120,60,24,g.phi,C['brass-fill'],{bore:8});drawGear(X+100,160,40,16,-g.phi*1.5,C.part,{bore:5});ctx.beginPath();ctx.rect(X-8,80,16,220+g.d);paint(C['steel-fill'],C.ink);poly([[X-8,300+g.d],[X+8,300+g.d],[X,330+g.d]]);ctx.closePath();paint(C.ink);
    ctx.beginPath();ctx.rect(250,360,300,40);paint(C.part2,C.ink);bar(X+12,200,620,300+g.d*2,10,C.part);pivot(620,300+g.d*2,5);label('PEDAL',640,330);label('SHAFT SLIDES THROUGH THE TURNING BEVEL GEAR',400,480,'center');},
  reads(){return[['Depth',`${this.g.d.toFixed(0)} mm`]];}});

reg({num:372,outLabel:'Balance load, kg',params:[{id:'p',label:'Power transmitted',min:0,max:100,step:1,value:50,fmt:v=>v+' %'}],
  update(phi){this.g={phi,t:this.P.p/100};},output(){return this.g.t*20;},
  draw(){const g=this.g,O=[400,260];bar(80,O[1],O[0]-60,O[1],16,C.part2);bar(O[0]+60,O[1],720,O[1],16,C.part2);for(const s of [-1,1]){poly([[O[0]+s*50,O[1]-70],[O[0]+s*80,O[1]-40],[O[0]+s*80,O[1]+40],[O[0]+s*50,O[1]+70]]);ctx.closePath();paint(s<0?C['brass-fill']:C['steel-fill'],C.ink);}
    ctx.beginPath();ctx.rect(O[0]-30,O[1]-100,60,200);paint(C.part,C.ink);ctx.save();ctx.translate(O[0],O[1]);ctx.rotate(0.02*Math.sin(g.phi*4));ctx.beginPath();ctx.rect(30,-10,200,20);paint(C.part2,C.ink);ctx.restore();weight(O[0]+220,O[1]+20,30+g.t*40,30+g.t*40,'');label('WEIGHT HOLDS THE RING OF BEVELS STILL · its size measures the power',400,480,'center');},
  reads(){return[['Weight needed',`${(this.g.t*20).toFixed(1)} kg`]];}});

reg({num:373,outLabel:'Spring reading, N',params:[{id:'m',label:'Load on the wagon',min:1,max:10,step:1,value:4,fmt:v=>v+' kg'}],
  update(phi){this.g={phi,f:0.3*this.P.m*9.81};},output(){return this.g.f;},
  draw(){const g=this.g,O=[400,360];flywheel(O[0],O[1],150,g.phi);ctx.beginPath();ctx.rect(O[0]-60,O[1]-200,120,40);paint(C['brass-fill'],C.ink);for(const s of [-1,1]){circ(O[0]+s*40,O[1]-152,12);paint(C.part,C.ink);}for(let k=0;k<this.P.m;k++){ctx.beginPath();ctx.rect(O[0]-50+(k%5)*20,O[1]-220-Math.floor(k/5)*20,18,18);paint(C['steel-fill'],C.ink,1);}
    const ext=g.f*3;springZ(O[0]+60,O[1]-180,O[0]+120+ext,O[1]-180,10,6);bar(O[0]+120+ext,O[1]-180,700,O[1]-180,6,C.part);ground(700,O[1]-190,30);label(`SPRING READS ${g.f.toFixed(1)} N`,O[0]+140,O[1]-210);label('MORE LOAD, MORE FRICTION PULL',400,40,'center');},
  reads(){return[['Load',`${this.P.m} kg`],['Friction pull',`${this.g.f.toFixed(1)} N`],['Ratio','constant (μ ≈ 0.3)']];}});

function treadW(num,o){return reg({num,outLabel:'Wheel turns',concept:!!o.concept,
  update(phi){this.g={phi:phi*0.4};},output(){return this.g.phi/TAU;},
  draw(){const g=this.g,O=[400,260],R=190;
    if(o.kind==='incline'){ctx.save();ctx.translate(O[0],O[1]+60);ctx.rotate(-0.25);ctx.beginPath();ctx.ellipse(0,0,R,60,0,0,TAU);paint(C.part,C.ink);for(let k=0;k<16;k++){const a=g.phi+k*TAU/16;if(Math.sin(a)>0){ctx.beginPath();ctx.moveTo(R*0.3*Math.cos(a),60*0.3*Math.sin(a));ctx.lineTo(R*Math.cos(a),60*Math.sin(a));paint(null,C.ink,1);}}ctx.restore();
      const P=[O[0]+40,O[1]-10];ctx.beginPath();ctx.ellipse(P[0],P[1],60,26,-0.25,0,TAU);paint(C['brass-fill'],C.ink);for(let k=0;k<4;k++){const l=12*Math.sin(g.phi*8+k*PI/2);bar(P[0]-40+k*24,P[1]+10,P[0]-40+k*24+l,P[1]+50,6,C['brass-fill']);}bar(O[0],O[1]+60,O[0],480,10,C.part2);label('THE ANIMAL WALKS UPHILL ON A TILTED WHEEL',400,40,'center');}
    else{circ(O[0],O[1],R);circ(O[0],O[1],R-30,false);paint(C.part,C.ink);for(let k=0;k<24;k++){const a=g.phi+k*TAU/24;ctx.save();ctx.translate(O[0]+R*Math.cos(a),O[1]+R*Math.sin(a));ctx.rotate(a);ctx.beginPath();ctx.rect(-4,-10,24,20);paint(C.part2,C.ink,1);ctx.restore();}
      const F=[O[0]+R*Math.cos(-0.5)+10,O[1]+R*Math.sin(-0.5)-60];const st=Math.sin(g.phi*10)*10;bar(F[0],F[1],F[0]-10+st,F[1]+60,8,C['brass-fill']);bar(F[0],F[1],F[0]+10-st,F[1]+56,8,C['brass-fill']);bar(F[0],F[1],F[0],F[1]-50,10,C['brass-fill']);circ(F[0],F[1]-62,12);paint(C['brass-fill'],C.ink);ctx.beginPath();ctx.rect(F[0]-60,F[1]-70,10,90);paint(C.part2,C.ink);pivot(O[0],O[1],8);label('STEPPING ON THE TREADS TURNS THE WHEEL',400,500,'center');}},
  reads(){return[['Power','body weight on the steps']];}});}
treadW(376,{kind:'incline'});treadW(377,{});

reg({num:378,outLabel:'Saw position, mm',
  update(phi){this.g={phi,a:0.35*Math.sin(phi)};},output(){return this.g.a*300;},
  draw(){const g=this.g,F=[400,40];ctx.beginPath();ctx.rect(100,30,600,14);paint(C.part2,C.ink);ctx.save();ctx.translate(F[0],F[1]);ctx.rotate(-g.a);bar(0,0,0,330,10,C.part);ctx.beginPath();ctx.rect(-160,330,320,26);paint(C['steel-fill'],C.ink);for(let k=0;k<16;k++){poly([[-160+k*20,356],[-150+k*20,368],[-140+k*20,356]]);ctx.closePath();paint(C['steel-fill'],C.ink,.8);}ctx.restore();pivot(F[0],F[1],6);
    circ(400,470,80);paint(C['brass-fill'],C.ink);for(let k=1;k<4;k++){circ(400,470,k*20);paint(null,C.ink,.6);}label('THE SWINGING SAW CUTS ACROSS THE LOG',600,200);},
  reads(){return[['Swing',`${(this.g.a*180/PI).toFixed(0)}°`]];}});

function cramp(num,o){return reg({num,outLabel:'Drill feed, mm',
  update(phi){const d=mod(phi*3,90);this.g={phi,d};},output(){return this.g.d;},
  draw(){const g=this.g;ctx.beginPath();ctx.moveTo(180,80);ctx.lineTo(620,80);ctx.lineTo(620,460);ctx.lineTo(560,460);ctx.lineTo(560,130);ctx.lineTo(180,130);ctx.closePath();paint(C.part2,C.ink);ctx.beginPath();ctx.rect(180,380,400,80);paint(C.part,C.ink);label('WORK',380,420,'center');
    const X=300;ctx.beginPath();ctx.rect(X-14,130,28,120+g.d);paint(C['steel-fill'],C.ink);ctx.save();ctx.beginPath();ctx.rect(X-14,130,28,120+g.d);ctx.clip();ctx.strokeStyle=C.ink;for(let y=130+mod(g.phi*20,16);y<260+g.d;y+=16){ctx.beginPath();ctx.moveTo(X-14,y);ctx.lineTo(X+14,y+6);ctx.stroke();}ctx.restore();
    poly([[X-10,250+g.d],[X+10,250+g.d],[X,290+g.d]]);ctx.closePath();paint(C.ink);bar(X-60,110,X+60,110,8,C['brass-fill']);bar(X+60,110,X+60,70,8,C['brass-fill']);label(o.label,400,500,'center');},
  reads(){return[['Feed',`${this.g.d.toFixed(0)} mm`]];}});}
cramp(379,{label:'CRAMP DRILL · feed screw opposite the drill'});cramp(380,{label:'CRAMP DRILL · spindle through the feed screw'});

reg({num:382,outLabel:'Height, mm',concept:true,
  update(phi){this.g={phi,h:60*(1+Math.sin(phi*0.4))/2,sw:0.5*Math.sin(phi*0.3),t:0.3*Math.sin(phi*0.5)};},output(){return this.g.h;},
  draw(){const g=this.g,X=400;ctx.beginPath();ctx.rect(X-100,440,200,30);paint(C.part2,C.ink);ctx.beginPath();ctx.rect(X-14,260,28,180);paint(C.part,C.ink);ctx.beginPath();ctx.rect(X-10,200-g.h,20,240);paint(C['steel-fill'],C.ink);const T=[X,200-g.h];
    ctx.save();ctx.translate(T[0],T[1]);ctx.rotate(g.t);ctx.beginPath();ctx.ellipse(0,0,150*Math.abs(Math.cos(g.sw))+30,16,0,0,TAU);paint(C['brass-fill'],C.ink);ctx.restore();pivot(T[0],T[1],6);label('RAISES · SWIVELS · TILTS',400,40,'center');},
  reads(){return[['Height',`${this.g.h.toFixed(0)} mm`],['Tilt',`${(this.g.t*180/PI).toFixed(0)}°`]];}});

reg({num:383,outLabel:'Cloth travel, mm',
  update(phi){this.g={phi};},output(){return this.g.phi*20;},
  draw(){const g=this.g,B=[400,210];circ(B[0],B[1],90);paint(C['brass-fill'],C.ink);for(let k=0;k<36;k++){const a=-g.phi*4+k*TAU/36;bar(B[0]+90*Math.cos(a),B[1]+90*Math.sin(a),B[0]+104*Math.cos(a),B[1]+104*Math.sin(a),2,C.ink);}pivot(B[0],B[1],6);
    for(const x of [200,600]){pulley(x,340,40,g.phi,C.part);}ctx.save();ctx.strokeStyle=C.steel;ctx.lineWidth=5;ctx.setLineDash([16,6]);ctx.lineDashOffset=-g.phi*40;ctx.beginPath();ctx.moveTo(60,300);ctx.lineTo(200,300);ctx.lineTo(B[0],B[1]+110);ctx.lineTo(600,300);ctx.lineTo(740,300);ctx.stroke();ctx.restore();label('CLOTH CARRIED PAST THE BRUSH CYLINDER',400,470,'center');},
  reads(){return[['Brush','turns against the cloth']];}});

reg({num:385,outLabel:'Door angle, degrees',
  update(phi){const u=mod(phi*0.5,TAU)/TAU;const a=u<0.3?smooth(u/0.3):u<0.45?1:1-smooth((u-0.45)/0.45);this.g={phi,a:a*1.3};},output(){return this.g.a*180/PI;},
  draw(){const g=this.g,H=[200,300];ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=12;ctx.beginPath();ctx.moveTo(60,300);ctx.lineTo(H[0],H[1]);ctx.moveTo(H[0]+300,300);ctx.lineTo(760,300);ctx.stroke();ctx.restore();const D=[H[0]+300*Math.cos(-g.a),H[1]+300*Math.sin(-g.a)];bar(H[0],H[1],D[0],D[1],14,C['brass-fill']);pivot(H[0],H[1],6);
    const K=[H[0]+80*Math.cos(-g.a),H[1]+80*Math.sin(-g.a)],T=[H[0]+90,H[1]-120];bar(K[0],K[1],T[0],T[1]+40*g.a,6,C.part);rope([[T[0],T[1]+40*g.a],[T[0],60],[T[0]+120,60],[T[0]+120,200-g.a*60]]);weight(T[0]+120,200-g.a*60,40,40,'');label('SEEN FROM ABOVE · opening lifts the weight, which pulls the door shut',400,480,'center');},
  reads(){return[['Door',`${(this.g.a*180/PI).toFixed(0)}° open`]];}});

reg({num:386,outLabel:'Unfold, %',
  update(phi){this.g={phi,f:openClose(phi)};},output(){return this.g.f*100;},
  draw(){const g=this.g,B=[300,460],a=-PI/2+0.25,L=290;const s1=[B[0],B[1]],t1=[B[0]+L*Math.cos(a),B[1]+L*Math.sin(a)];const b=a+PI*(1-g.f)*0.95+0.5*g.f;const t2=[t1[0]+L*0.9*Math.cos(b+PI),t1[1]+L*0.9*Math.sin(b+PI)];
    bar(s1[0],s1[1],t1[0],t1[1],12,C['brass-fill']);bar(t1[0],t1[1],t2[0],t2[1],12,C['steel-fill']);pivot(t1[0],t1[1],6);for(let k=1;k<6;k++){const p=[s1[0]+(t1[0]-s1[0])*k/6,s1[1]+(t1[1]-s1[1])*k/6],q=[t1[0]+(t2[0]-t1[0])*(1-k/6),t1[1]+(t2[1]-t1[1])*(1-k/6)];if(g.f>0.5)bar(p[0],p[1],q[0],q[1],4,C.part);}
    ctx.beginPath();ctx.rect(60,460,680,10);paint(C.part2,C.ink);label(g.f>0.95?'OPEN AS STEPS':g.f<0.05?'FOLDED AS A POLE':'FOLDING',560,200);},
  reads(){return[['State',this.g.f>0.95?'steps':this.g.f<0.05?'folded':'moving']];}});

reg({num:387,outLabel:'Ladder tilt, degrees',
  update(phi){this.g={phi,a:-PI/2+0.5*Math.sin(phi*0.5)};},output(){return (this.g.a+PI/2)*180/PI;},
  draw(){const g=this.g,A=[320,460],B=[460,460],L=380,d=[L*Math.cos(g.a),L*Math.sin(g.a)];bar(A[0],A[1],A[0]+d[0],A[1]+d[1],12,C['brass-fill']);bar(B[0],B[1],B[0]+d[0],B[1]+d[1],12,C['brass-fill']);
    for(let k=1;k<6;k++){const p=[A[0]+d[0]*k/6,A[1]+d[1]*k/6];bar(p[0],p[1],p[0]+140,p[1],8,C['steel-fill']);pivot(p[0],p[1],3);pivot(p[0]+140,p[1],3);}pivot(A[0],A[1],6);pivot(B[0],B[1],6);ctx.beginPath();ctx.rect(60,466,680,10);paint(C.part2,C.ink);label('STEPS STAY LEVEL WHATEVER THE TILT',400,40,'center');},
  reads(){return[['Tilt',`${((this.g.a+PI/2)*180/PI).toFixed(0)}°`],['Steps','level']];}});

reg({num:388,outLabel:'Board travel, mm',
  update(phi){this.g={phi,x:mod(phi*40,600)};},output(){return this.g.x;},
  draw(){const g=this.g;ctx.beginPath();ctx.rect(g.x-300,250,400,30);paint(C['brass-fill'],C.ink);for(const x of [300,500]){drawGear(x,214,30,14,-g.phi*1.3,C['steel-fill'],{bore:4});circ(x,316,34);paint(C.part,C.ink);bar(x,316,x+26*Math.cos(g.phi*1.2),316+26*Math.sin(g.phi*1.2),4,C.part2);pivot(x,214,4);pivot(x,316,4);}
    label('TOOTHED ROLLERS ABOVE, SMOOTH BELOW',400,420,'center');},
  reads(){return[['Feed','steady, without slipping']];}});

reg({num:391,outLabel:'Gear turns',concept:true,
  reset(){this.w=0;this.last=null;},
  update(phi){const y=70*Math.sin(phi);if(this.last===null)this.last=y;const d=y-this.last;this.last=y;this.w+=Math.abs(d)/50;this.g={phi,y,d};},output(){return this.w/TAU;},
  draw(){const g=this.g,P=[400,270];drawGear(P[0],P[1],50,18,this.w,C['brass-fill'],{bore:6});pivot(P[0],P[1],5);for(const s of [-1,1]){const y=P[1]+s*g.y;const act=s*g.d<0;ctx.beginPath();ctx.rect(P[0]+s*62-10,y-110,20,220);paint(act?C['steel-fill']:C.part,C.ink);weight(P[0]+s*62,y+110,50,40,'');}
    label('EACH WEIGHTED RACK DRIVES THE GEAR AS IT FALLS',400,40,'center');},
  reads(){return[['Gear','turns one way']];}});

reg({num:395,outLabel:'Plug angle, degrees',
  update(phi){const k=Math.floor(phi/PI),u=mod(phi,PI)/PI;const a=(k+smooth((u-0.4)/0.2))*PI/2;this.g={phi,a,st:mod(Math.round(a/(PI/2)),2)};},output(){return this.g.a*180/PI;},
  draw(){const g=this.g,O=[400,260];circ(O[0],O[1],110);paint(C.part2,C.ink);for(const a of [0,PI/2,PI,PI*1.5]){bar(O[0]+110*Math.cos(a),O[1]+110*Math.sin(a),O[0]+200*Math.cos(a),O[1]+200*Math.sin(a),40,C.part);}
    circ(O[0],O[1],90);paint(C['brass-fill'],C.ink);for(const s of [0,PI]){ctx.save();ctx.translate(O[0],O[1]);ctx.rotate(g.a+s);ctx.beginPath();ctx.arc(0,0,60,-PI/4,PI/4);ctx.arc(0,0,20,PI/4,-PI/4,true);ctx.closePath();ctx.fillStyle=C.sheet;ctx.fill();ctx.strokeStyle=C.ink;ctx.stroke();ctx.restore();}
    label('STEAM',O[0],O[1]-215,'center');label('EXHAUST',O[0],O[1]+225,'center');label('CYL. END A',O[0]-280,O[1]);label('CYL. END B',O[0]+215,O[1]);label(g.st?'STEAM → B · A → EXHAUST':'STEAM → A · B → EXHAUST',400,40,'center');},
  reads(){return[['Steam to',this.g.st?'end B':'end A']];}});

reg({num:399,outLabel:'Link length, mm',
  update(phi){const c=openClose(phi);this.g={phi,c,L:200-60*c};},output(){return this.g.L;},
  draw(){const g=this.g,y=260,A=400-g.L/2,B=400+g.L/2;ctx.save();ctx.lineWidth=14;ctx.strokeStyle=C.ink;for(const x of [A-80,B+80]){ctx.beginPath();ctx.ellipse(x,y,50,26,0,0,TAU);ctx.stroke();}ctx.restore();
    bar(A-30,y,400-20,y,16,C['steel-fill']);bar(400+20,y,B+30,y,16,C['steel-fill']);ctx.beginPath();ctx.rect(360,y-26,80,52);paint(C['brass-fill'],C.ink);ctx.save();ctx.strokeStyle=C.ink;for(let k=0;k<5;k++){const x=362+mod(k*16+g.c*50,76);ctx.beginPath();ctx.moveTo(x,y-26);ctx.lineTo(x,y+26);ctx.stroke();}ctx.restore();label('TURNING THE SLEEVE SHORTENS THE LINK',400,400,'center');},
  reads(){return[['Link',`${this.g.L.toFixed(0)} mm`]];}});

reg({num:412,outLabel:'Drum turns',params:[{id:'m',type:'toggle',label:'Purchase',options:[[1,'Single'],[3,'Triple']],value:3}],
  update(phi){this.g={phi,d:phi/this.P.m};},output(){return this.g.d/TAU;},
  draw(){const g=this.g,O=[400,280];circ(O[0],O[1],100);paint(C['brass-fill'],C.ink);for(let k=0;k<6;k++){const a=g.phi*0.3+k*PI/3;bar(O[0],O[1],O[0]+230*Math.cos(a),O[1]+230*Math.sin(a)*0.35,10,C.part2);}
    if(this.P.m===3){drawGear(O[0],O[1]+150,30,12,g.phi,C.part,{bore:4});drawGear(O[0]+60,O[1]+150,30,12,-g.phi,C.part,{bore:4});}circ(O[0],O[1],60);paint(C['steel-fill'],C.ink);bar(O[0],O[1],O[0]+50*Math.cos(g.d),O[1]+50*Math.sin(g.d),6,C.part);pivot(O[0],O[1],6);
    label(this.P.m===3?'GEARS ENGAGED · three times the pull, a third the speed':'DIRECT · capstan and drum turn together',400,480,'center');},
  reads(){return[['Purchase',this.P.m===3?'triple':'single'],['Drum',`${(this.g.d/TAU).toFixed(2)} turns`]];}});

reg({num:419,outLabel:'Cradle angle, degrees',concept:true,
  update(phi){this.g={phi,a:0.2*Math.sin(phi)};},output(){return this.g.a*180/PI;},
  draw(){const g=this.g,P=[400,140];ctx.save();ctx.translate(P[0],P[1]);ctx.rotate(g.a);bar(0,0,0,150,8,C.part);ctx.beginPath();ctx.moveTo(-160,150);ctx.lineTo(160,150);ctx.quadraticCurveTo(140,260,0,270);ctx.quadraticCurveTo(-140,260,-160,150);paint(C['brass-fill'],C.ink);ctx.restore();pivot(P[0],P[1],6);
    flywheel(640,380,60,g.phi);rope([[640,320],[P[0]+150*Math.sin(-g.a)+100,P[1]+150]]);label('WHEELS AND BANDS ROCK THE CRADLE',400,480,'center');},
  reads(){return[['Rock',`${(this.g.a*180/PI).toFixed(0)}°`]];}});

reg({num:420,outLabel:'Hammer angle, degrees',
  update(phi){const u=mod(phi,TAU)/TAU;const a=u<0.5?-0.8*smooth(u/0.5):u<0.55?-0.8+0.85*smooth((u-0.5)/0.05):0.05*(1-smooth((u-0.55)/0.1))-0.12*smooth((u-0.55)/0.1);this.g={phi,a,hit:u>0.54&&u<0.6};},output(){return this.g.a*180/PI;},
  draw(){const g=this.g,B=[300,260];ctx.beginPath();ctx.moveTo(B[0]-90,B[1]+120);ctx.quadraticCurveTo(B[0]-60,B[1]-120,B[0],B[1]-130);ctx.quadraticCurveTo(B[0]+60,B[1]-120,B[0]+90,B[1]+120);ctx.closePath();paint(C['brass-fill'],C.ink);
    const F=[560,200];ctx.save();ctx.translate(F[0],F[1]);ctx.rotate(PI-g.a);ctx.beginPath();ctx.rect(0,-6,160,12);paint(C.part,C.ink);circ(170,0,20);paint(C['steel-fill'],C.ink);ctx.restore();pivot(F[0],F[1],6);springZ(F[0],F[1]+20,F[0]+40,F[1]+100,6,5);if(g.hit)label('DING',B[0]+110,B[1]-30);label('SPRING LIFTS THE HAMMER CLEAR SO THE BELL RINGS ON',400,480,'center');},
  reads(){return[['Hammer',this.g.hit?'striking':'clear of the bell']];}});

reg({num:492,outLabel:'Hook angle, degrees',
  update(phi){const u=mod(phi*0.5,TAU)/TAU;const rel=u>0.5;this.g={phi,rel,a:rel?0.9*smooth((u-0.5)/0.1):0,y:rel?Math.min(200,(u-0.5)*800):0};},output(){return this.g.a*180/PI;},
  draw(){const g=this.g,H=[400,180];rope([[H[0],0],[H[0],H[1]]]);ctx.save();ctx.translate(H[0],H[1]);ctx.rotate(g.a);ctx.beginPath();ctx.moveTo(-6,0);ctx.lineTo(6,0);ctx.lineTo(6,60);ctx.quadraticCurveTo(6,90,-26,84);ctx.lineTo(-26,72);ctx.quadraticCurveTo(-6,76,-6,60);ctx.closePath();paint(C['steel-fill'],C.ink);ctx.restore();pivot(H[0],H[1],5);
    const ry=H[1]+80+g.y;ctx.save();ctx.lineWidth=8;ctx.strokeStyle=C.ink;ctx.beginPath();ctx.arc(H[0]-14,ry,14,0,TAU);ctx.stroke();ctx.restore();ctx.beginPath();ctx.ellipse(H[0]-14,ry+120,160,40,0,0,PI);paint(C['brass-fill'],C.ink);rope([[H[0]-14,ry+14],[H[0]-14,ry+100]]);rope([[H[0]+20,H[1]+20],[600,H[1]+20]]);label(g.rel?'LINE PULLED · hook tips, boat drops free':'BOAT HANGING',400,40,'center');},
  reads(){return[['Boat',this.g.rel?'released':'held']];}});

reg({num:493,outLabel:'Stone lift, mm',
  update(phi){const u=mod(phi*0.5,TAU)/TAU;const ins=smooth(u/0.3),lift=u<0.35?0:u<0.8?smooth((u-0.35)/0.3)*120:120*(1-smooth((u-0.8)/0.2));this.g={phi,ins,lift};},output(){return this.g.lift;},
  draw(){const g=this.g,X=400,y=300-g.lift;ctx.beginPath();ctx.rect(X-160,y,320,180);paint(C.part2,C.ink);ctx.beginPath();ctx.moveTo(X-20,y);ctx.lineTo(X-36,y+90);ctx.lineTo(X+36,y+90);ctx.lineTo(X+20,y);ctx.closePath();ctx.fillStyle=C.sheet;ctx.fill();ctx.strokeStyle=C.ink;ctx.stroke();
    const d=90*g.ins;for(const s of [-1,1]){poly([[X+s*20,y-60+d*0],[X+s*8,y-60],[X+s*(8+16*g.ins),y-60+d],[X+s*(20+16*g.ins),y-60+d]]);ctx.closePath();paint(C['steel-fill'],C.ink);}ctx.beginPath();ctx.rect(X-8,y-60,16,90*g.ins+60);paint(C['brass-fill'],C.ink);bar(X-30,y-70,X+30,y-70,10,C.part);rope([[X,0],[X,y-70]]);label('WEDGES SPREAD IN THE DOVETAIL HOLE AND GRIP THE STONE',400,500,'center');},
  reads(){return[['Lift',`${this.g.lift.toFixed(0)} mm`]];}});

reg({num:494,outLabel:'Grip force, relative',
  update(phi){const u=mod(phi*0.5,TAU)/TAU;const lift=u<0.2?0:u<0.7?smooth((u-0.2)/0.3)*120:120*(1-smooth((u-0.7)/0.3));this.g={phi,lift,sq:Math.min(1,lift/30)};},output(){return this.g.sq*10;},
  draw(){const g=this.g,X=400,y=320-g.lift,P=[X,y-120];const open=1-g.sq;ctx.beginPath();ctx.rect(X-110,y,220,150);paint(C.part2,C.ink);for(const s of [-1,1]){const E=[X-s*(110+10*open),y+60],T=[X+s*90,y-200];bar(P[0],P[1],E[0],E[1],12,C['steel-fill']);bar(P[0],P[1],T[0],T[1],12,C['steel-fill']);}rope([[X-90,y-200],[X,y-260],[X+90,y-200]]);rope([[X,0],[X,y-260]]);pivot(P[0],P[1],6);
    label('THE PULL ON THE CHAIN SQUEEZES THE JAWS · heavier stone, firmer grip',400,500,'center');},
  reads(){return[['Lifted',`${this.g.lift.toFixed(0)} mm`]];}});

reg({num:496,outLabel:'Spindle turns',
  update(phi){this.g={phi};},output(){return this.g.phi*3/TAU;},
  draw(){const g=this.g,y=200;const sp=[1,1.6,3];for(let k=0;k<3;k++){const x=180+k*130;circ(x,y-26,22);paint(C.part,C.ink);circ(x,y+26,22);paint(C['brass-fill'],C.ink);bar(x,y-26,x+18*Math.cos(g.phi*sp[k]),y-26+18*Math.sin(g.phi*sp[k]),4,C.part2);}
    ctx.save();ctx.strokeStyle=C.steel;ctx.lineWidth=10;ctx.beginPath();ctx.moveTo(60,y);ctx.lineTo(180,y);ctx.stroke();ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(180,y);ctx.lineTo(310,y);ctx.stroke();ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(310,y);ctx.lineTo(440,y);ctx.lineTo(600,280);ctx.stroke();ctx.restore();
    const S=[600,360];ctx.beginPath();ctx.rect(S[0]-8,S[1]-90,16,200);paint(C['steel-fill'],C.ink);ctx.save();ctx.translate(S[0],S[1]-60);ctx.rotate(g.phi*3);bar(0,0,40,0,4,C.part);ctx.restore();ctx.beginPath();ctx.ellipse(S[0],S[1]+40,30,50,0,0,TAU);paint(C['brass-fill'],C.ink);
    label('EACH PAIR OF ROLLERS RUNS FASTER · the fibre is drawn out thin',300,120,'center');label('THROSTLE SPINDLE TWISTS AND WINDS IT',600,480,'center');},
  reads(){return[['Draft','3 ×'],['Roller speeds','1 : 1.6 : 3']];}});
