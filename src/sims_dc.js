/* ================= audit pass 321–360 ================= */
/* parallel rulers: every one keeps its working edge parallel; each is drawn with the parts that really do the guiding */
const RUL={
  dash(y,x0,x1,c){ctx.save();ctx.strokeStyle=c||C.steel;ctx.setLineDash([6,6]);ctx.beginPath();ctx.moveTo(x0,y);ctx.lineTo(x1,y);ctx.stroke();ctx.restore();},
  rule(x,y,w,h,fill,slot){ctx.beginPath();ctx.rect(x,y,w,h);if(slot){const [a,b,yc]=slot,r=6;ctx.moveTo(b,yc-r);ctx.arc(b,yc,r,-PI/2,PI/2);ctx.lineTo(a,yc+r);ctx.arc(a,yc,r,PI/2,3*PI/2);ctx.closePath();}ctx.fillStyle=fill;ctx.fill('evenodd');ctx.strokeStyle=C.ink;ctx.lineWidth=1.2;ctx.stroke();}
};
/* 322 · two right triangles laid hypotenuse to hypotenuse; the lower one is held and the upper slides along the long edge,
   so its top edge moves to a new line but never turns */
reg({num:322,outLabel:"Ruler spacing, mm",X0:110,X1:510,Y0:440,Y1:270,
  update(phi){const s=125*(1-Math.cos(phi*0.5));const L=Math.hypot(this.X1-this.X0,this.Y0-this.Y1),u=[(this.X1-this.X0)/L,(this.Y1-this.Y0)/L];this.g={phi,s,d:[s*u[0],s*u[1]]};},
  output(){return -(this.g.d[1])+0;},
  draw(){const g=this.g,{X0,X1,Y0,Y1}=this,[dx,dy]=g.d;
    poly([[X0,Y0],[X1,Y0],[X1,Y1]]);ctx.closePath();paint(C.part2,C.ink);label('HELD',X1-60,Y0-16,'center');
    poly([[X0+dx,Y0+dy],[X0+dx,Y1+dy],[X1+dx,Y1+dy]]);ctx.closePath();paint(C['brass-fill'],C.ink);
    circ(X0+dx+60,Y1+dy+50,10);paint(C.part,C.ink);/* finger knob */
    RUL.dash(Y1,60,740,C.part);RUL.dash(Y1+dy,60,740);
    ctx.save();ctx.strokeStyle=C.hi;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(X0+dx,Y1+dy);ctx.lineTo(X1+dx,Y1+dy);ctx.stroke();ctx.restore();
    label('UPPER TRIANGLE SLIDES ALONG THE LONG EDGE',400,60,'center');label('its top edge (the ruling edge) stays parallel',400,82,'center');},
  reads(){const g=this.g;return[['Moved up',`${(-g.d[1]).toFixed(0)} mm`],['Moved along',`${g.d[0].toFixed(0)} mm`],['Edge','parallel']];}});

/* 323 · rolling ruler, seen from above: one axle under the rule carries two equal wheels, so both ends roll the same distance
   and the rule moves square to its edge. A side view of one wheel is inset. */
reg({num:323,outLabel:'Ruler travel, mm',r:28,
  update(phi){const y=150*(1-Math.cos(phi*0.5))/2;this.g={phi,y,th:y/this.r};},output(){return this.g.y;},
  draw(){const g=this.g,r=this.r,Y=380-g.y,x0=150,x1=650,W=56;
    RUL.dash(380-W/2,60,740,C.part);
    RUL.rule(x0,Y-W/2,x1-x0,W,C['brass-fill']);
    for(const x of [x0+40,x1-40]){ctx.beginPath();ctx.rect(x-9,Y-r,18,2*r);paint(C['steel-fill'],C.ink);
      for(let k=0;k<12;k++){const t=-g.th+k*PI/6,c=Math.cos(t);if(c<0.05)continue;const yy=Y+r*Math.sin(t);ctx.save();ctx.globalAlpha=0.3+0.7*c;ctx.beginPath();ctx.moveTo(x-9,yy);ctx.lineTo(x+9,yy);paint(null,C.ink,1);ctx.restore();}}
    ctx.save();ctx.setLineDash([3,4]);bar(x0+40,Y,x1-40,Y,6,C.part);ctx.restore();label('AXLE (under the rule)',400,Y+4,'center');
    ctx.save();ctx.strokeStyle=C.hi;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x0,Y-W/2);ctx.lineTo(x1,Y-W/2);ctx.stroke();ctx.restore();
    /* side view inset */
    const I=[690,110];ctx.beginPath();ctx.rect(I[0]-70,I[1]-60,140,120);paint(C.sheet,C.ink,.6);ctx.beginPath();ctx.moveTo(I[0]-65,I[1]+r);ctx.lineTo(I[0]+65,I[1]+r);paint(null,C.ink,1.4);
    const cx=I[0];for(let k=-3;k<=4;k++){const x=I[0]+mod(k*24+g.y,192)-96;if(x<I[0]-64||x>I[0]+64)continue;ctx.beginPath();ctx.moveTo(x,I[1]+r);ctx.lineTo(x-8,I[1]+r+10);paint(null,C.ink,1);}circ(cx,I[1],r);paint(C['steel-fill'],C.ink);for(let k=0;k<4;k++){const t=-g.th+k*PI/2;bar(cx,I[1],cx+(r-4)*Math.cos(t),I[1]+(r-4)*Math.sin(t),3,C.part);}pivot(cx,I[1],3);label('SIDE VIEW',I[0],I[1]-46,'center');
    label('BOTH WHEELS ARE FAST ON ONE AXLE · the rule rolls square to its edge',400,490,'center');},
  reads(){const g=this.g;return[['Travel',`${g.y.toFixed(0)} mm`],['Wheel turns',`${(g.th/TAU).toFixed(2)}`]];}});

/* 324 · two rules joined by two equal arms crossed and pivoted at their middles. Each arm is pinned to one rule at one end and
   slides in a slot of the other rule at the other end, so the upper rule rises straight up, square to the lower one. */
reg({num:324,outLabel:'Ruler spacing, mm',L:250,xa:280,y0:420,
  update(phi){const t=0.28+0.5*(1-Math.cos(phi*0.5))/2;this.g={phi,t,h:this.L*Math.sin(t),c:this.L*Math.cos(t)};},output(){return this.g.h;},
  draw(){const g=this.g,{L,xa,y0}=this,y1=y0-g.h,xs=xa+g.c,H=34,sa=xa+L*Math.cos(0.78)-2,sb=xa+L*Math.cos(0.28)+2;
    RUL.rule(150,y0-H/2,520,H,C.part2,[sa,sb,y0]);RUL.rule(150,y1-H/2,520,H,C['brass-fill'],[sa,sb,y1]);label('HELD',620,y0+4,'center');
    bar(xa,y0,xs,y1,12,C['steel-fill']);bar(xa,y1,xs,y0,12,C['steel-fill']);
    pivot(xa,y0,5);pivot(xa,y1,5);circ(xs,y1,6);paint(C.hi,C.ink);circ(xs,y0,6);paint(C.hi,C.ink);pivot(xa+g.c/2,(y0+y1)/2,5);
    RUL.dash(y0-L*Math.sin(0.28),60,740,C.part);
    ctx.save();ctx.strokeStyle=C.part;ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(xa,y0+40);ctx.lineTo(xa,y0-L-20);ctx.stroke();ctx.restore();
    label('PINNED END',xa-12,y1-26,'right');label('PIN IN SLOT',xs+14,y1-26);
    label('ARMS CROSSED AND PIVOTED AT THE MIDDLE · the upper rule rises straight up',400,490,'center');},
  reads(){const g=this.g;return[['Spacing',`${g.h.toFixed(0)} mm`],['Pin in slot at',`${g.c.toFixed(0)} mm`],['Side shift','none']];}});

/* 349 · jointed arms: each arm is two links with a joint at the middle; the two joints are tied by a middle bar, so each half is
   a parallelogram and the rule can be opened twice as wide while staying parallel */
reg({num:349,outLabel:'Ruler spacing, mm',l:110,
  update(phi){const a1=-PI/2+0.75*Math.sin(phi*0.5),a2=-PI/2+0.75*Math.sin(phi*0.5-0.9);this.g={phi,a1,a2,h:-this.l*(Math.sin(a1)+Math.sin(a2))};},output(){return this.g.h;},
  draw(){const g=this.g,l=this.l,y0=430,P=[260,540],d1=[l*Math.cos(g.a1),l*Math.sin(g.a1)],d2=[l*Math.cos(g.a2),l*Math.sin(g.a2)],H=30;
    RUL.rule(150,y0-H/2,500,H,C.part2);label('HELD',600,y0+4,'center');
    const M=P.map(x=>[x+d1[0],y0+d1[1]]),T=M.map(m=>[m[0]+d2[0],m[1]+d2[1]]);
    RUL.rule(T[0][0]-110,T[0][1]-H/2,500,H,C['brass-fill']);
    bar(M[0][0]-40,M[0][1],M[1][0]+40,M[1][1],10,C.part);
    for(let i=0;i<2;i++){bar(P[i],y0,M[i][0],M[i][1],10,C['steel-fill']);bar(M[i][0],M[i][1],T[i][0],T[i][1],10,C['steel-fill']);pivot(P[i],y0,4);pivot(M[i][0],M[i][1],4);pivot(T[i][0],T[i][1],4);}
    RUL.dash(T[0][1]-H/2,60,740);label('MIDDLE BAR',M[1][0]+50,M[1][1]-12);
    label('JOINTED ARMS · two parallelograms, one above the other',400,490,'center');},
  reads(){const g=this.g;return[['Spacing',`${g.h.toFixed(0)} mm`],['Edges','parallel']];}});

/* 321 · Harrison's maintaining power. The barrel's ratchet drives the going ratchet through a click; the going ratchet drives the
   great wheel through two springs, which are therefore always a little compressed. To wind, the barrel is turned backwards: the click
   slips over the barrel ratchet, the maintaining detent on the frame stops the going ratchet from turning back, and the compressed
   springs keep pushing the great wheel forward until winding is done. */
const RAT={/* ratchet outline, local; dir +1: free to turn + (clockwise) under a fixed pawl, blocked − ; dir −1 the reverse */
  pts(N,r0,R,dir,ph=0){const p=TAU/N,o=[];for(let i=0;i<N;i++){const a=ph+i*p;if(dir>0){o.push([R*Math.cos(a),R*Math.sin(a)]);for(let k=1;k<=4;k++){const t=a+p*k/4*0.97,r=R-(R-r0)*k/4;o.push([r*Math.cos(t),r*Math.sin(t)]);}}
    else{o.push([r0*Math.cos(a),r0*Math.sin(a)]);for(let k=1;k<=4;k++){const t=a+p*0.03+p*0.97*k/4,r=r0+(R-r0)*k/4;o.push([r*Math.cos(t),r*Math.sin(t)]);}}}return o;},
  rho(N,r0,R,dir,ph,t){const p=TAU/N,f=mod(t-ph,p)/p;return dir>0?R-(R-r0)*Math.min(1,f/0.97):(f<0.03?r0:r0+(R-r0)*(f-0.03)/0.97);},
  /* pawl pivoted at D (relative to wheel centre, wheel-frame angles), length l: find the tip angle b in [b0,b1] that rests on the teeth */
  pawl(N,r0,R,dir,ph,D,l,b0,b1){let lo=b0,hi=b1;const f=b=>{const T=[D[0]+l*Math.cos(b),D[1]+l*Math.sin(b)];return Math.hypot(T[0],T[1])-RAT.rho(N,r0,R,dir,ph,Math.atan2(T[1],T[0]));};
    const fl=f(lo);if(fl*f(hi)>0){return Math.abs(fl)<Math.abs(f(hi))?lo:hi;}for(let i=0;i<40;i++){const m=(lo+hi)/2;if(f(m)*fl>0)lo=m;else hi=m;}return(lo+hi)/2;}
};
reg({num:321,RAT,outLabel:'Great wheel, turns',O:[330,262],T:4*PI,k:3*TAU/16/(4*PI),d0:0.5,wa:0.5*PI,wd:3.0,
  NG:40,rg0:96,RG:110,NB:16,rb0:46,RB:58,RW:150,ZW:60,
  update(phi){const T=this.T,k=this.k,c=Math.floor(phi/T),u=phi-c*T,gw=k*phi,pg=TAU/this.NG,wb=3*TAU/16,ws=c*T+this.wa,we=ws+this.wd;
    let ra,ba,wind=false;const raS=k*ws+this.d0,hold=pg*Math.floor(raS/pg+1e-9)+0.004;
    if(phi<ws){ra=gw+this.d0;ba=ra-c*wb;}
    else if(phi<we){wind=true;const s=(phi-ws)/this.wd;ra=raS+(hold-raS)*smooth(Math.min(1,s*8));ba=raS-c*wb-wb*smooth(s);ra=Math.min(ra,raS);}
    else{const r=smooth(Math.min(1,(phi-we)/0.5));ra=hold+(gw+this.d0-hold)*r;ba=ra-(c+1)*wb;}
    this.g={phi,gw,ra,ba,wind,sp:ra-gw};},
  output(){return this.g.gw/TAU;},
  draw(){const g=this.g,O=this.O,{NG,rg0,RG,NB,rb0,RB,RW,ZW}=this;
    /* weight on the barrel cord (the barrel is behind the wheels) */
    const yW=300+40*g.ba;rope([[O[0]-36,O[1]],[O[0]-36,yW]]);weight(O[0]-36,yW,44,54,'');
    drawGear(O[0],O[1],RW,ZW,g.gw,C['steel-fill'],{bore:8,spokes:4});
    const P=[O[0]+RW+28,O[1]];drawGear(P[0],P[1],28,12,-g.gw*ZW/12+PI/12,C.part,{bore:4});pivot(P[0],P[1],4);label('TRAIN',P[0]+40,P[1]-30);
    /* going ratchet: a toothed ring on three spokes; two spokes carry springs that push studs on the great wheel */
    const at=(a,r)=>[O[0]+r*Math.cos(a),O[1]+r*Math.sin(a)];
    polyAt(RAT.pts(NG,rg0,RG,1),O[0],O[1],g.ra);circ(O[0],O[1],88,false);ctx.fillStyle=C['brass-fill'];ctx.fill('evenodd');ctx.strokeStyle=C.ink;ctx.lineWidth=1.2;ctx.stroke();
    for(let k=0;k<3;k++){const a=g.ra-0.9+k*TAU/3;bar(...at(a,20),...at(a,90),12,C['brass-fill']);}circ(O[0],O[1],24);paint(C['brass-fill'],C.ink);
    for(const k of [1,2]){const a1=g.ra-0.9+k*TAU/3,a2=g.gw+this.d0-0.9+k*TAU/3+0.8;/* spring from the spoke to the great-wheel stud */
      ctx.save();ctx.strokeStyle=C.muted;ctx.lineWidth=1.4;ctx.beginPath();const n=2*Math.max(3,Math.round((a2-a1)*72/6));for(let i=0;i<=n;i++){const t=a1+0.08+(a2-a1-0.16)*i/n,r=72+(i%2?5:-5)*(i>0&&i<n?1:0),p=at(t,r);i?ctx.lineTo(...p):ctx.moveTo(...p);}ctx.stroke();ctx.restore();
      circ(...at(a2,72),5);paint(C.part,C.ink);}
    /* barrel ratchet and the click riding on the going ratchet */
    polyAt(RAT.pts(NB,rb0,RB,-1),O[0],O[1],g.ba);paint(C.part2,C.ink);circ(O[0],O[1],14);paint(C['steel-fill'],C.ink);ctx.beginPath();ctx.rect(O[0]-6,O[1]-6,12,12);paint(C.part,C.ink);
    {const Dl=[78*Math.cos(-0.9),78*Math.sin(-0.9)],rel=g.ba-g.ra,b=RAT.pawl(NB,rb0,RB,-1,rel,Dl,30,-PI-0.9,-PI+1.2);
     const D=at(g.ra-0.9,78),bw=b+g.ra,Tp=[D[0]+30*Math.cos(bw),D[1]+30*Math.sin(bw)];bar(...D,...Tp,7,C.part);pivot(...D,3.5);springZ(D[0]+8*Math.cos(g.ra-0.2),D[1]+8*Math.sin(g.ra-0.2),...at(g.ra-0.55,82),4,3);}
    /* maintaining detent on the frame */
    {const Dd=[172*Math.cos(-2.75),172*Math.sin(-2.75)],b=RAT.pawl(NG,rg0,RG,1,g.ra,Dd,95,-0.8,0.5),D=[O[0]+Dd[0],O[1]+Dd[1]],Tp=[D[0]+95*Math.cos(b),D[1]+95*Math.sin(b)];
     bar(...D,...Tp,8,g.wind?C.hi:C.part);pivot(...D,4.5);ground(D[0],D[1]-8,30,true);label('MAINTAINING DETENT',D[0]-10,D[1]-22,'right');}
    pivot(O[0],O[1],5);
    label('GOING RATCHET',O[0]+60,O[1]+RW+26);label('BARREL RATCHET',O[0]-120,O[1]+RW+26,'center');
    label(g.wind?'WINDING · barrel turned back, detent holds the going ratchet, springs drive the great wheel':'GOING · barrel → click → going ratchet → springs → great wheel',400,505,'center');},
  reads(){const g=this.g;return[['State',g.wind?'being wound':'going'],['Spring set',`${((g.sp)*180/PI).toFixed(0)}°`],['Great wheel','never stops']];}});

/* 347 · Bishop's disk engine, seen in section with the crank in plan. The disk piston is fixed on a ball at the centre of a spherical
   chamber whose faces are two shallow cones. A radial partition passes through a slot in the disk, so the disk cannot spin; steam on one
   side and exhaust on the other make it nod round, so its spindle sweeps a cone and turns the crank on the vertical shaft once per nod. */
reg({num:347,outLabel:'Crank turns',concept:true,O:[300,320],R:140,t:0.38,Ls:170,
  geo(phi){const t=this.t,n=[Math.sin(t)*Math.cos(phi),Math.sin(t)*Math.sin(phi),Math.cos(t)],u=[Math.cos(t)*Math.cos(phi),Math.cos(t)*Math.sin(phi),-Math.sin(t)],v=[-Math.sin(phi),Math.cos(phi),0];return{n,u,v};},
  update(phi){this.g={phi,...this.geo(phi)};},output(){return this.g.phi/TAU;},
  draw(){const g=this.g,O=this.O,R=this.R,t=this.t,P=(p)=>[O[0]+p[0],O[1]-p[2]];
    /* casing in section: two cones and the spherical wall */
    ctx.beginPath();ctx.moveTo(O[0]-R-24,O[1]-R*Math.sin(t)-34);ctx.lineTo(O[0]-R*Math.cos(t),O[1]-R*Math.sin(t));ctx.lineTo(O[0],O[1]);ctx.lineTo(O[0]+R*Math.cos(t),O[1]-R*Math.sin(t));ctx.lineTo(O[0]+R+24,O[1]-R*Math.sin(t)-34);ctx.lineTo(O[0]+R+24,O[1]-R*Math.sin(t)-60);ctx.lineTo(O[0]-R-24,O[1]-R*Math.sin(t)-60);ctx.closePath();paint(C.part2,C.ink);
    ctx.beginPath();ctx.moveTo(O[0]-R-24,O[1]+R*Math.sin(t)+34);ctx.lineTo(O[0]-R*Math.cos(t),O[1]+R*Math.sin(t));ctx.lineTo(O[0],O[1]);ctx.lineTo(O[0]+R*Math.cos(t),O[1]+R*Math.sin(t));ctx.lineTo(O[0]+R+24,O[1]+R*Math.sin(t)+34);ctx.lineTo(O[0]+R+24,O[1]+R*Math.sin(t)+60);ctx.lineTo(O[0]-R-24,O[1]+R*Math.sin(t)+60);ctx.closePath();paint(C.part2,C.ink);
    for(const s of [-1,1]){ctx.beginPath();ctx.arc(O[0],O[1],R,s>0?-t-0.02:PI-t-0.02,s>0?t+0.02:PI+t+0.02);ctx.lineTo(O[0]+s*(R+24),O[1]+R*Math.sin(t)+34);ctx.lineTo(O[0]+s*(R+24),O[1]-R*Math.sin(t)-34);ctx.closePath();paint(C.part2,C.ink);}
    ctx.beginPath();ctx.arc(O[0],O[1],R,-t,t);ctx.arc(O[0],O[1],R,PI-t,PI+t);paint(null,C.ink,1.4);
    /* disk piston (projected) */
    const pts=[];for(let i=0;i<64;i++){const s=i/64*TAU,p=[0,1,2].map(k=>R*0.985*(g.u[k]*Math.cos(s)+g.v[k]*Math.sin(s)));pts.push(P(p));}poly(pts);ctx.closePath();paint(C['steel-fill'],C.ink);
    circ(O[0],O[1],26);paint(C['brass-fill'],C.ink);
    /* spindle, crank and vertical shaft */
    const E=P(g.n.map(x=>x*this.Ls)),zE=O[1]-this.Ls*Math.cos(t);bar(O[0],O[1],E[0],E[1],12,C['brass-fill']);
    ctx.beginPath();ctx.rect(O[0]-7,zE-150,14,150+8);paint(C.part,C.ink);bar(O[0],zE,E[0],zE,12,C.part2);circ(E[0],zE,8);paint(C.hi,C.ink);
    ctx.beginPath();ctx.ellipse(O[0],zE-120,70,14,0,0,TAU);paint(C['steel-fill'],C.ink);label('TO THE MACHINE',O[0]+80,zE-120);
    pivot(O[0],O[1],5);label('STEAM',O[0]-R-30,O[1]+4,'right');label('EXHAUST',O[0]+R+30,O[1]+4);
    /* plan of the crank and partition */
    const Q=[640,300],rq=70;circ(Q[0],Q[1],rq+14);paint(C.part2,C.ink);circ(Q[0],Q[1],rq);paint(C.sheet,C.ink);bar(Q[0],Q[1]+12,Q[0],Q[1]+rq+14,8,C.part);
    const cp=[Q[0]+rq*Math.sin(t)/Math.sin(t)*0.75*Math.cos(g.phi),Q[1]+rq*0.75*Math.sin(g.phi)];bar(Q[0],Q[1],cp[0],cp[1],12,C.part2);circ(cp[0],cp[1],7);paint(C.hi,C.ink);pivot(Q[0],Q[1],5);
    label('PLAN',Q[0],Q[1]-rq-26,'center');label('fixed partition',Q[0]+12,Q[1]+rq+30);
    label('THE DISK NODS ROUND WITHOUT SPINNING · its spindle turns the crank once per nod',400,500,'center');},
  reads(){return[['Disk','nods, does not spin'],['Crank turns',`${(this.g.phi/TAU).toFixed(2)}`]];}});

/* 348 · the slide's pin runs in a four-lobed groove (two crossed slots joined round the edge) cut in the turning disk. The groove is the
   curve r = a·cos 2θ, so the pin makes two complete strokes for each turn of the disk. */
reg({num:348,outLabel:'Slide position, mm',concept:true,O:[300,280],a:80,
  groove(){const o=[];for(let i=0;i<=360;i++){const th=i/360*TAU,r=this.a*Math.cos(2*th);o.push([r*Math.cos(th),r*Math.sin(th)]);}return o;},
  update(phi){this.g={phi,x:this.a*Math.cos(2*phi)};},output(){return this.g.x;},
  draw(){const g=this.g,O=this.O,c=Math.cos(g.phi),s=Math.sin(g.phi);circ(O[0],O[1],130);paint(C['brass-fill'],C.ink);
    const W=this.groove().map(([x,y])=>[O[0]+x*c-y*s,O[1]+x*s+y*c]);ctx.save();ctx.lineJoin='round';ctx.lineCap='round';ctx.beginPath();poly(W,false);ctx.strokeStyle=C.ink;ctx.lineWidth=21;ctx.stroke();ctx.strokeStyle=C.sheet;ctx.lineWidth=18;ctx.stroke();ctx.restore();
    pivot(O[0],O[1],6);const px=O[0]+g.x;ctx.beginPath();ctx.rect(470,O[1]-26,290,10);ctx.rect(470,O[1]+16,290,10);paint(C.part2,C.ink);
    bar(px,O[1],760,O[1],14,C['steel-fill']);ctx.beginPath();ctx.rect(px+170,O[1]-16,60,32);paint(C['steel-fill'],C.ink);circ(px,O[1],8);paint(C.hi,C.ink);
    label('GROOVE r = a·cos 2θ: two crossed slots joined at the rim',400,470,'center');label('TWO STROKES EACH TURN',400,492,'center');},
  reads(){return[['Strokes per turn','2'],['Slide',`${this.g.x.toFixed(0)} mm`]];}});

/* 353 · belly-helve (tilt) hammer as a lever of the first order: the wipers on the cam wheel press the tail down behind the pivot,
   raising the head; when a wiper slips off the end of the tail, the head falls on the work. */
reg({num:353,outLabel:'Hammer lift, mm',F:[440,250],Lh:270,Lt:150,W:[555,198],rw:58,
  tipA(phi){const F=this.F,W=this.W;let a=0;for(let k=0;k<3;k++){const t=-phi*1.5+k*TAU/3,T=[W[0]+this.rw*Math.cos(t)-F[0],W[1]+this.rw*Math.sin(t)-F[1]];if(T[0]<20||T[0]>this.Lt)continue;
      /* angle at which the helve's top face (10 above the centre line) passes through the tip */
      const r=Math.hypot(T[0],T[1]),b=Math.atan2(T[1],T[0]),need=b+Math.asin(10/r);if(need>a)a=need;}return Math.min(a,0.3);},
  update(phi){const a=this.tipA(phi);this.g={phi,a,lift:this.Lh*Math.sin(a)};},output(){return this.g.lift;},
  draw(){const g=this.g,F=this.F,W=this.W;ctx.beginPath();ctx.rect(F[0]-330,F[1]+40,90,40);paint(C.part2,C.ink);ctx.beginPath();ctx.rect(F[0]-320,F[1]+30,70,10);paint(C['steel-fill'],C.ink);label('ANVIL',F[0]-285,F[1]+100,'center');
    ctx.save();ctx.translate(F[0],F[1]);ctx.rotate(g.a);ctx.beginPath();ctx.rect(-this.Lh,-10,this.Lh+this.Lt,20);paint(C['brass-fill'],C.ink);ctx.beginPath();ctx.rect(-this.Lh-30,-24,56,54);paint(C['steel-fill'],C.ink);ctx.restore();
    ctx.beginPath();ctx.moveTo(F[0]-16,F[1]+70);ctx.lineTo(F[0],F[1]);ctx.lineTo(F[0]+16,F[1]+70);ctx.closePath();paint(C.part2,C.ink);pivot(F[0],F[1],6);
    circ(W[0],W[1],30);paint(C.part,C.ink);for(let k=0;k<3;k++){const t=-g.phi*1.5+k*TAU/3;bar(W[0],W[1],W[0]+this.rw*Math.cos(t),W[1]+this.rw*Math.sin(t),12,C.part2);}pivot(W[0],W[1],5);
    label('CAM WHEEL',W[0]+40,W[1]-50);label('WIPERS PRESS THE TAIL DOWN BEHIND THE PIVOT · the head rises, then falls',400,490,'center');},
  reads(){return[['Head lift',`${this.g.lift.toFixed(0)} mm`],['Blows per turn','3']];}});

/* 358 · a fusee varies a carriage's traverse: the carriage is drawn along by a cord winding onto a turning fusee. The cord climbs the
   spiral groove from the small end to the large, so although the fusee turns steadily the carriage moves faster and faster. */
reg({num:358,outLabel:'Carriage speed, mm/turn',concept:true,x0:110,x1:270,y:200,r0:12,r1:38,turns:2.5,X0:700,
  sOf(th){const Th=this.turns*TAU;return this.r0*th+(this.r1-this.r0)*th*th/(2*Th);},
  update(phi){const Th=this.turns*TAU,u=mod(phi,2*Th),th=u<Th?u:2*Th-u;const r=this.r0+(this.r1-this.r0)*th/Th;this.g={phi,th,r,X:this.X0-this.sOf(th),v:r*TAU};},output(){return this.g.v;},
  draw(){const g=this.g,{x0,x1,y,r0,r1}=this,Th=this.turns*TAU,xs=th=>x0+(x1-x0)*th/Th,rs=th=>r0+(r1-r0)*th/Th;
    ctx.beginPath();ctx.rect(x0-34,y-60,12,150);ctx.rect(x1+18,y-60,12,150);paint(C.part2,C.ink);bar(x0-50,y,x1+30,y,8,C.part);
    poly([[x0,y-r0],[x1,y-r1],[x1,y+r1],[x0,y+r0]]);ctx.closePath();paint(C['brass-fill'],C.ink);
    ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=0.8;for(let i=0;i<=400;i++){}ctx.beginPath();let pen=false;for(let i=0;i<=600;i++){const th=i/600*Th,a=th-g.th,vis=Math.sin(a)>0;const p=[xs(th),y-rs(th)*Math.cos(a)];if(vis){pen?ctx.lineTo(...p):ctx.moveTo(...p);pen=true;}else pen=false;}ctx.stroke();
    ctx.strokeStyle=C.steel;ctx.lineWidth=2.4;ctx.beginPath();pen=false;for(let i=0;i<=600;i++){const th=i/600*Th;if(th>g.th)break;const a=th-g.th,vis=Math.sin(a)>0;const p=[xs(th),y-rs(th)*Math.cos(a)];if(vis){pen?ctx.lineTo(...p):ctx.moveTo(...p);pen=true;}else pen=false;}ctx.stroke();ctx.restore();
    const C0=[xs(g.th),y-rs(g.th)];rope([C0,[g.X-30,y-rs(g.th)*0+(-30)]]);
    ctx.beginPath();ctx.rect(300,y+44,460,8);paint(C.part2,C.ink);ctx.beginPath();ctx.rect(g.X-30,y-44,80,88);paint(C['steel-fill'],C.ink);circ(g.X-12,y+48,7);circ(g.X+32,y+48,7);paint(C.part,C.ink);
    springZ(g.X+50,y,760,y,14,7);ctx.beginPath();ctx.rect(760,y-40,12,80);paint(C.part2,C.ink);
    ctx.beginPath();ctx.moveTo(x0-50,y);ctx.lineTo(x0-50,y+40);paint(null,C.ink,4);circ(x0-50,y+40,6);paint(C.part,C.ink);label('FUSEE TURNS STEADILY',x1-60,y-70,'center');label('CARRIAGE',g.X+10,y-56,'center');
    label('THE CORD CLIMBS FROM THE SMALL END TO THE LARGE · the carriage speeds up',400,470,'center');label(`cord on radius ${g.r.toFixed(0)} mm`,400,492,'center');},
  reads(){const g=this.g;return[['Cord radius',`${g.r.toFixed(0)} mm`],['Carriage speed',`${g.v.toFixed(0)} mm/turn`],['Carriage',`${(this.X0-g.X).toFixed(0)} mm`]];}});

/* 360 · a rocking beam turns a flywheel shaft. A cord from the beam is wound on a drum loose on the shaft; the drum carries a pawl
   that engages a ratchet fast on the shaft. As the beam end rises it pulls the drum round and the pawl drives the shaft; a weight on
   a second cord turns the drum back on the return, the pawl clicking over the teeth while the flywheel keeps the shaft going. */
reg({num:360,outLabel:'Shaft, turns',concept:true,F:[400,90],Lb:200,S:[560,290],rd:40,N:20,r0:55,R:70,mu:0.16,
  reset(){this.st=null;},
  dOf(phi){return this.Lb*Math.sin(0.35*Math.sin(phi))/this.rd;},
  update(phi){const p=TAU/this.N;if(!this.st||phi<this.st.phi-1e-9)this.st={phi:0,wf:0,v:0,off:0};const st=this.st;const dt=0.02;
    while(st.phi<phi-1e-9){const h=Math.min(dt,phi-st.phi),d0=-this.dOf(st.phi),d1=-this.dOf(st.phi+h);st.phi+=h;st.v=Math.max(0,st.v-this.mu*h);st.wf+=st.v*h;
      if(d1-st.wf>st.off){const nw=d1-st.off;st.v=Math.max(st.v,(nw-st.wf)/h*0.999);st.wf=nw;}while(d1-st.wf<st.off-p)st.off-=p;}
    const d=this.dOf(phi);this.g={phi,a:0.35*Math.sin(phi),d,w:-st.wf,drive:-this.dOf(phi+0.02)+this.dOf(phi)>0&&Math.abs((-d-st.wf)-st.off)<1e-3};},
  output(){return -this.g.w/TAU;},
  draw(){const g=this.g,F=this.F,S=this.S,rd=this.rd,{N,r0,R}=this;
    /* flywheel behind */
    circ(S[0],S[1],150);circ(S[0],S[1],132,false);paint(C.part2,C.ink);for(let k=0;k<6;k++){const t=g.w+k*PI/3;bar(S[0],S[1],S[0]+132*Math.cos(t),S[1]+132*Math.sin(t),10,C.part2);}
    polyAt(RAT.pts(N,r0,R,-1),S[0],S[1],g.w);paint(C['steel-fill'],C.ink);
    /* drum with its pawl arm */
    const at=(a,r)=>[S[0]+r*Math.cos(a),S[1]+r*Math.sin(a)];bar(S[0],S[1],...at(g.d,96),18,C['brass-fill']);circ(S[0],S[1],rd);paint(C['brass-fill'],C.ink);
    {const D=[92,0],b=RAT.pawl(N,r0,R,-1,g.w-g.d,D,48,-3.1,-1.8),Pv=at(g.d,92),bw=b+g.d,T=[Pv[0]+48*Math.cos(bw),Pv[1]+48*Math.sin(bw)];bar(...Pv,...T,8,g.drive?C.hi:C.part);pivot(...Pv,3.5);}
    pivot(S[0],S[1],6);
    /* beam, cords and weight */
    const E=[F[0]+this.Lb*Math.cos(g.a),F[1]+this.Lb*Math.sin(g.a)],H=[F[0]-this.Lb*Math.cos(g.a),F[1]-this.Lb*Math.sin(g.a)];
    rope([[S[0]+rd,S[1]],[S[0]+rd,E[1]]]);const yW=400+rd*g.d;rope([[S[0]+rd+1,S[1]],[S[0]+rd+1,yW]]);weight(S[0]+rd+1,yW,40,46,'');
    ctx.beginPath();ctx.rect(F[0]-14,F[1],28,380);paint(C.part2,C.ink);ctx.save();ctx.translate(F[0],F[1]);ctx.rotate(g.a);ctx.beginPath();ctx.rect(-this.Lb-20,-10,2*this.Lb+20+4,20);paint(C['brass-fill'],C.ink);ctx.restore();pivot(F[0],F[1],6);
    bar(H[0],H[1],H[0],H[1]+60,10,C.part);label('BEAM',F[0]-120,F[1]-24,'center');label('RETURN WEIGHT',S[0]+rd+30,yW+30);label('RATCHET ON THE SHAFT',S[0]-150,S[1]+170);label('DRUM AND PAWL (loose)',S[0]+60,S[1]+170);
    label(g.drive?'BEAM END RISING · pawl drives the shaft':'RETURN · pawl clicks over the teeth, the flywheel carries on',400,30,'center');},
  reads(){const g=this.g;return[['Shaft turns',`${(-g.w/TAU).toFixed(2)}`],['Pawl',g.drive?'driving':'slipping']];}});

/* 340 · beam on a rocking pillar: the pillar rocks on its foot G and carries the middle of the beam; one end of the beam is held by a
   radius bar so that it moves nearly along the level line through G, and then the other end (the piston rod) moves almost straight up
   and down over G (Scott Russell's arrangement, with the radius bar standing in for a slide). */
reg({num:340,outLabel:"Piston-rod sideways error, mm",G:[440,470],a:140,Rf:[570,120],
  reset(){this.trail=[];},
  geo(phi){const G=this.G,a=this.a,th=(60+12*Math.sin(phi))*PI/180,T=[G[0]+a*Math.cos(th),G[1]-a*Math.sin(th)],Lr=Math.hypot(G[0]+2*a*Math.cos(PI/3)-this.Rf[0],G[1]-this.Rf[1]);
    const Cc=cc(T,a,this.Rf,Lr,1),B=[2*T[0]-Cc[0],2*T[1]-Cc[1]];return{th,T,Cc,B};},
  update(phi){const q=this.geo(phi);this.g={phi,...q};this.trail=this.trail||[];this.trail.push(q.B);if(this.trail.length>300)this.trail.shift();},output(){return this.g.B[0]-this.G[0];},
  draw(){const g=this.g,G=this.G,Rf=this.Rf;ctx.beginPath();ctx.rect(G[0]-70,40,140,110);ctx.rect(G[0]-58,50,116,90);paint(C.part2,C.ink);ctx.beginPath();ctx.rect(G[0]-56,g.B[1]-150-28,112,22);paint(C['steel-fill'],C.ink);
    bar(G[0],g.B[1]-160,g.B[0],g.B[1],10,C['steel-fill']);label('CYLINDER',G[0],30,'center');
    ctx.save();ctx.strokeStyle=C.steel;ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(G[0],160);ctx.lineTo(G[0],G[1]);ctx.stroke();ctx.restore();
    if(this.trail.length>1){ctx.save();ctx.strokeStyle=C.hi;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(...this.trail[0]);for(const p of this.trail)ctx.lineTo(...p);ctx.stroke();ctx.restore();}
    bar(G[0],G[1],g.T[0],g.T[1],18,C.part2);bar(Rf[0],Rf[1],g.Cc[0],g.Cc[1],10,C.part);bar(g.B[0],g.B[1],g.Cc[0],g.Cc[1],16,C['brass-fill']);
    for(const p of [g.B,g.T,g.Cc])pivot(p[0],p[1],4.5);pivot(G[0],G[1],6);ground(G[0],G[1]+10,40);pivot(Rf[0],Rf[1],5);ground(Rf[0],Rf[1]-10,30,true);
    label('ROCKING PILLAR',G[0]-20,G[1]-40,'right');label('RADIUS BAR',Rf[0]+14,Rf[1]+60);label('BEAM',(g.B[0]+g.Cc[0])/2+20,(g.B[1]+g.Cc[1])/2-14);
    label('THE PISTON END OF THE BEAM MOVES ALMOST STRAIGHT UP AND DOWN',400,505,'center');},
  reads(){const g=this.g;return[['Sideways error',`${(g.B[0]-this.G[0]).toFixed(1)} mm`],['Pillar',`${(g.th*180/PI).toFixed(0)}°`]];}});

/* 342 · the chains hang from arch heads centred on the beam pivot, so each chain always leaves its arch at the same point and pulls
   straight up and down */
{const m=SIMS_NEW[342];m.draw=function(){const g=this.g,F=[400,140],R=170,xL=F[0]-R,xR=F[0]+R,sa=Math.sin(g.a);
  ctx.beginPath();ctx.rect(F[0]-14,F[1],28,340);paint(C.part2,C.ink);
  ctx.save();ctx.translate(F[0],F[1]);ctx.rotate(g.a);ctx.beginPath();ctx.rect(-R+6,-12,2*R-12,24);paint(C['brass-fill'],C.ink);
  for(const [a0,a1] of [[PI-0.32,PI+0.36],[-0.36,0.32]]){ctx.beginPath();ctx.arc(0,0,R,a0,a1);ctx.arc(0,0,R-16,a1,a0,true);ctx.closePath();paint(C['brass-fill'],C.ink);}ctx.restore();pivot(F[0],F[1],7);
  /* chains: from the top of each arch, round it to the level of the pivot, then straight down */
  const chain=(a0,a1,end)=>{const pts=[];for(let i=0;i<=12;i++){const t=a0+(a1-a0)*i/12;pts.push([F[0]+R*Math.cos(t),F[1]+R*Math.sin(t)]);}pts.push(end);ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=3;ctx.setLineDash([5,3]);ctx.beginPath();ctx.moveTo(...pts[0]);for(const p of pts)ctx.lineTo(...p);ctx.stroke();ctx.restore();};
  const py=300-R*sa,pr=330+R*sa;chain(PI+0.36+g.a,PI,[xL,py]);chain(-0.36+g.a,0,[xR,pr]);
  ctx.beginPath();ctx.rect(xL-60,260,120,220);ctx.rect(xL-50,268,100,204);paint(C.part2,C.ink);steamBox(xL-50,py+20,100,472-py-20,!g.down);ctx.beginPath();ctx.rect(xL-50,py,100,20);paint(C['steel-fill'],C.ink);
  bar(xR,pr,xR,480,8,C.part);label('CYLINDER',xL,500,'center');label('PUMP ROD',xR+14,470);label(g.down?'VACUUM BELOW · air pushes the piston down':'PUMP ROD WEIGHT LIFTS THE PISTON',400,40,'center');};}
