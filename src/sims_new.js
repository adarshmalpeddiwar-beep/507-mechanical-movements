/* ================= batch 1: new simulations ================= */
const SIMS_NEW={};
function reg(o){o.params=o.params||[];o.reset=o.reset||function(){};SIMS_NEW[o.num]=o;return o;}
const lerp=(a,b,t)=>a+(b-a)*t, clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function cc(p0,r0,p1,r1,s){const dx=p1[0]-p0[0],dy=p1[1]-p0[1],d=Math.hypot(dx,dy)||1e-9;const a=(r0*r0-r1*r1+d*d)/(2*d),h=Math.sqrt(Math.max(0,r0*r0-a*a));const bx=p0[0]+a*dx/d,by=p0[1]+a*dy/d;return[bx-s*h*dy/d,by+s*h*dx/d];}
function pulley(x,y,r,a,fill){circ(x,y,r);circ(x,y,Math.max(4,r*0.16),false);paint(fill,C.ink);
  ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=1.1;for(let i=0;i<4;i++){const t=a+i*PI/2;ctx.beginPath();ctx.moveTo(x+r*0.16*Math.cos(t),y+r*0.16*Math.sin(t));ctx.lineTo(x+r*0.8*Math.cos(t),y+r*0.8*Math.sin(t));ctx.stroke();}
  ctx.beginPath();ctx.arc(x,y,r*0.8,0,TAU);ctx.lineWidth=0.8;ctx.stroke();ctx.restore();pivot(x,y,4);}
function arcThru(p,cx,cy,r,a0,a1,am){const d=mod(a1-a0,TAU),m=mod(am-a0,TAU);p.arc(cx,cy,r,a0,a1,!(m<d));}
function beltSegs(x1,y1,r1,x2,y2,r2,crossed){const th=Math.atan2(y2-y1,x2-x1),d=Math.hypot(x2-x1,y2-y1);
  if(!crossed){const g=Math.acos((r1-r2)/d),a=th+g,b=th-g;return{th,a,b,P:[[x1+r1*Math.cos(a),y1+r1*Math.sin(a)],[x2+r2*Math.cos(a),y2+r2*Math.sin(a)],[x2+r2*Math.cos(b),y2+r2*Math.sin(b)],[x1+r1*Math.cos(b),y1+r1*Math.sin(b)]],arcs:[[x2,y2,r2,a,b,th],[x1,y1,r1,b,a,th+PI]]};}
  const g=Math.acos((r1+r2)/d),a=th+g,b=th-g;return{th,a,b,P:[[x1+r1*Math.cos(a),y1+r1*Math.sin(a)],[x2-r2*Math.cos(a),y2-r2*Math.sin(a)],[x2-r2*Math.cos(b),y2-r2*Math.sin(b)],[x1+r1*Math.cos(b),y1+r1*Math.sin(b)]],arcs:[[x2,y2,r2,a+PI,b+PI,th],[x1,y1,r1,b,a,th+PI]]};}
function beltPath(x1,y1,r1,x2,y2,r2,crossed){const s=beltSegs(x1,y1,r1,x2,y2,r2,crossed),p=new Path2D();p.moveTo(...s.P[0]);p.lineTo(...s.P[1]);arcThru(p,...s.arcs[0]);p.lineTo(...s.P[3]);arcThru(p,...s.arcs[1]);p.closePath();return p;}
function beltPoly(x1,y1,r1,x2,y2,r2,crossed,step=4){const s=beltSegs(x1,y1,r1,x2,y2,r2,crossed),pts=[];
  const line=(A,B)=>{const n=Math.max(1,Math.ceil(Math.hypot(B[0]-A[0],B[1]-A[1])/step));for(let i=0;i<n;i++)pts.push([lerp(A[0],B[0],i/n),lerp(A[1],B[1],i/n)]);};
  const arc=(cx,cy,r,a0,a1,am)=>{let d=mod(a1-a0,TAU);const m=mod(am-a0,TAU);if(!(m<d))d=d-TAU;const n=Math.max(2,Math.ceil(Math.abs(d)*r/step));for(let i=0;i<n;i++){const t=a0+d*i/n;pts.push([cx+r*Math.cos(t),cy+r*Math.sin(t)]);}};
  line(s.P[0],s.P[1]);arc(...s.arcs[0]);line(s.P[2],s.P[3]);arc(...s.arcs[1]);return pts;}
function alongPoly(pts){const L=[0];for(let i=1;i<=pts.length;i++){const a=pts[i-1],b=pts[i%pts.length];L.push(L[i-1]+Math.hypot(b[0]-a[0],b[1]-a[1]));}
  return{total:L[L.length-1],at(s){s=mod(s,L[L.length-1]);let lo=0,hi=L.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(L[m]<=s)lo=m;else hi=m;}const a=pts[lo],b=pts[(lo+1)%pts.length],t=(s-L[lo])/((L[lo+1]-L[lo])||1);return[lerp(a[0],b[0],t),lerp(a[1],b[1],t),Math.atan2(b[1]-a[1],b[0]-a[0])];}};}
function drawBelt(path,travel,w=7){ctx.save();ctx.lineJoin='round';ctx.strokeStyle=C.ink;ctx.lineWidth=w+2;ctx.stroke(path);ctx.strokeStyle=C.part2;ctx.lineWidth=w;ctx.stroke(path);
  ctx.setLineDash([3,13]);ctx.lineDashOffset=-travel;ctx.strokeStyle=C.ink;ctx.lineWidth=w-1;ctx.globalAlpha=.55;ctx.stroke(path);ctx.restore();}
function weight(x,y,w,h,t){ctx.beginPath();ctx.rect(x-w/2,y,w,h);paint(C['steel-fill'],C.ink);if(t)label(t,x,y+h/2,'center');}
function rope(pts){ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(...pts[0]);for(const p of pts.slice(1))ctx.lineTo(...p);ctx.stroke();ctx.restore();}
function hatchRect(x,y,w,h,fill){ctx.beginPath();ctx.rect(x,y,w,h);paint(fill||C.part2,C.ink);ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();ctx.strokeStyle=C.muted;ctx.lineWidth=.6;for(let i=-h;i<w;i+=10){ctx.beginPath();ctx.moveTo(x+i,y+h);ctx.lineTo(x+i+h,y);ctx.stroke();}ctx.restore();}
function springZ(x1,y1,x2,y2,n=10,amp=6){const dx=x2-x1,dy=y2-y1,L=Math.hypot(dx,dy),ux=dx/L,uy=dy/L;ctx.save();ctx.strokeStyle=C.muted;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x1,y1);for(let i=1;i<n;i++){const t=i/n,s=(i%2?1:-1)*amp;ctx.lineTo(x1+dx*t-uy*s,y1+dy*t+ux*s);}ctx.lineTo(x2,y2);ctx.stroke();ctx.restore();}
function rpmOf(v){return (v*60).toFixed(1)+' rpm';}
function stripeShaft(x0,x1,y,r,ang,fill){ctx.beginPath();ctx.rect(x0,y-r,x1-x0,2*r);paint(fill||C.part,C.ink);ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=1;for(let k=0;k<6;k++){const a=ang+k*PI/3;if(Math.cos(a)>0){const yy=y+r*Math.sin(a);ctx.globalAlpha=.25+.6*Math.cos(a);ctx.beginPath();ctx.moveTo(x0,yy);ctx.lineTo(x1,yy);ctx.stroke();}}ctx.restore();}

/* 1, 2 open and crossed belts */
function beltSim(num,crossed){return reg({num,outLabel:'Driven pulley, turns',
  params:[{id:'d',label:'Driven pulley diameter',min:60,max:180,step:10,value:crossed?140:100,fmt:v=>v+' mm'}],
  A:[230,260],B:[570,260],r1:70,
  update(phi){const r2=this.P.d/2;this.g={phi,r2,a2:(crossed?-1:1)*phi*this.r1/r2};},
  output(){return this.g.a2/TAU;},
  draw(){const g=this.g,A=this.A,B=this.B;drawBelt(beltPath(A[0],A[1],this.r1,B[0],B[1],g.r2,crossed),this.r1*g.phi);
    pulley(A[0],A[1],this.r1,g.phi,C['brass-fill']);pulley(B[0],B[1],g.r2,g.a2,C['steel-fill']);
    arcArrow(A[0],A[1],this.r1+18,-2.2,-1.2,C.brass);arcArrow(B[0],B[1],g.r2+18,crossed?-1.2:-2.2,crossed?-2.2:-1.2,C.steel);
    ground(A[0],A[1]+this.r1+40,50);ground(B[0],B[1]+g.r2+40,50);
    label('DRIVER',A[0],A[1]+this.r1+62,'center');label('DRIVEN',B[0],B[1]+g.r2+62,'center');},
  reads(v){const g=this.g;return[['Speed ratio',`1 : ${(this.r1/g.r2).toFixed(2)}`],['Driven turns',crossed?'opposite way':'same way'],['Driven angle',`${mod(g.a2*180/PI,360).toFixed(0)}°`],['Driven speed',rpmOf(v)]];}});}
beltSim(1,false);beltSim(2,true);

/* 8 stepped speed pulleys */
reg({num:8,outLabel:'Driven shaft, turns',params:[{id:'s',label:'Belt on step',min:1,max:3,step:1,value:2,fmt:v=>['small driver','middle','large driver'][v-1]}],
  A:[240,260],B:[560,260],R1:[40,62,84],R2:[84,62,40],
  update(phi){const i=this.P.s-1,r1=this.R1[i],r2=this.R2[i];this.g={phi,i,r1,r2,a2:phi*r1/r2};},
  output(){return this.g.a2/TAU;},
  draw(){const g=this.g,A=this.A,B=this.B;
    for(let k=2;k>=0;k--){circ(A[0],A[1],this.R1[k]);paint(k===g.i?C['brass-fill']:C.part,C.ink);circ(B[0],B[1],this.R2[k]);paint(k===g.i?C['steel-fill']:C.part,C.ink);}
    drawBelt(beltPath(A[0],A[1],g.r1,B[0],B[1],g.r2,false),g.r1*g.phi,6);
    for(const [P,a] of [[A,g.phi],[B,g.a2]]){ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=1.2;for(let k=0;k<3;k++){const t=a+k*TAU/3;ctx.beginPath();ctx.moveTo(P[0]+8*Math.cos(t),P[1]+8*Math.sin(t));ctx.lineTo(P[0]+34*Math.cos(t),P[1]+34*Math.sin(t));ctx.stroke();}ctx.restore();pivot(P[0],P[1],5);}
    label('DRIVER',A[0],A[1]+120,'center');label('DRIVEN',B[0],B[1]+120,'center');},
  reads(v){const g=this.g;return[['Belt step',['small driver','middle','large driver'][g.i]],['Speed ratio',`1 : ${(g.r1/g.r2).toFixed(2)}`],['Driven speed',rpmOf(v)]];}});

/* 13 movable pulley */
reg({num:13,outLabel:'Load height, mm',
  update(phi){const s=110*(1-Math.cos(phi))/2;this.g={phi,s,lift:s/2};},
  output(){return this.g.lift;},
  draw(){const g=this.g,F=[430,100],r=30,yL=330-g.lift,M=[370,yL];
    ctx.beginPath();ctx.rect(240,40,320,14);paint(C.part2,C.ink);
    rope([[340,54],[340,yL]]);rope([[400,yL],[400,F[1]]]);rope([[460,F[1]],[460,300+g.s]]);
    ctx.beginPath();ctx.arc(M[0],M[1],r,0,PI);ctx.strokeStyle=C.ink;ctx.lineWidth=2;ctx.stroke();ctx.beginPath();ctx.arc(F[0],F[1],r,PI,TAU);ctx.stroke();
    bar(F[0],54,F[0],F[1],6,C.part);pulley(F[0],F[1],r,g.s/r,C.part);pulley(M[0],M[1],r,-g.lift/r,C['steel-fill']);
    bar(M[0],M[1],M[0],M[1]+44,6,C.part);weight(M[0],M[1]+44,70,56,'LOAD');
    ctx.beginPath();ctx.rect(450,300+g.s,20,30);paint(C['brass-fill'],C.ink);label('PULL',492,315+g.s);
    linArrow(495,260+g.s,0,C.brass);},
  reads(){const g=this.g;return[['Rope pulled',`${g.s.toFixed(0)} mm`],['Load raised',`${g.lift.toFixed(0)} mm`],['Force needed','½ of the load'],['Trade-off','pull twice as far']];}});

/* 14 block and tackle */
reg({num:14,outLabel:'Load height, mm',params:[{id:'n',label:'Sheaves in each block',min:1,max:3,step:1,value:2,fmt:v=>v}],
  update(phi){const n=this.P.n,s=150*(1-Math.cos(phi))/2;this.g={phi,n,s,lift:s/(2*n)};},
  output(){return this.g.lift;},
  draw(){const g=this.g,n=g.n,r=16,x0=400-(n-1)*22,yU=100,yL=360-g.lift;
    ctx.beginPath();ctx.rect(260,40,280,14);paint(C.part2,C.ink);bar(400,54,400,yU,6,C.part);
    const xs=[];for(let i=0;i<n;i++)xs.push(x0+i*44);
    for(const x of xs){rope([[x-r,yU],[x-r,yL]]);rope([[x+r,yU],[x+r,yL]]);}
    const hx=xs[n-1]+r+28;rope([[xs[n-1]+r,yU-r],[hx,yU-r],[hx,300+g.s]]);
    ctx.beginPath();ctx.rect(x0-r-8,yU-r-8,(n-1)*44+2*r+16,2*r+16);paint(C.part,C.ink);
    ctx.beginPath();ctx.rect(x0-r-8,yL-r-8,(n-1)*44+2*r+16,2*r+16);paint(C.part,C.ink);
    xs.forEach((x,i)=>{pulley(x,yU,r,g.s/r*(1+i*0.3),C.part2);pulley(x,yL,r,-g.s/r*(1+i*0.3),C['steel-fill']);});
    bar(400,yL+r+8,400,yL+50,6,C.part);weight(400,yL+50,90,60,'LOAD');
    ctx.beginPath();ctx.rect(hx-10,300+g.s,20,30);paint(C['brass-fill'],C.ink);label('PULL',hx+16,315+g.s);},
  reads(){const g=this.g;return[['Supporting ropes',`${2*g.n}`],['Force needed',`1/${2*g.n} of the load`],['Rope pulled',`${g.s.toFixed(0)} mm`],['Load raised',`${g.lift.toFixed(1)} mm`]];}});

/* 24 spur gears */
reg({num:24,outLabel:'Driven gear, turns',params:[{id:'z',label:'Driven gear teeth',min:12,max:48,step:6,value:36,fmt:v=>v+' teeth (driver 24)'}],
  update(phi){const z=this.P.z;this.g={phi,z,r2:2.5*z,a2:-phi*24/z};},
  output(){return this.g.a2/TAU;},
  draw(){const g=this.g,A=[250,270],B=[250+60+g.r2,270];
    drawGear(A[0],A[1],60,24,g.phi,C['brass-fill'],{bore:8});drawGear(B[0],B[1],g.r2,g.z,g.a2+PI+PI/g.z,C['steel-fill'],{bore:8});
    pivot(A[0],A[1],6);pivot(B[0],B[1],6);arcArrow(A[0],A[1],84,-2.4,-1.4,C.brass);arcArrow(B[0],B[1],g.r2+22,-1.4,-2.4,C.steel);},
  reads(v){const g=this.g;return[['Gear ratio',`24 : ${g.z}`],['Driven speed',`${(24/g.z).toFixed(2)} × driver`],['Torque',`${(g.z/24).toFixed(2)} × driver`],['Driven',rpmOf(Math.abs(v))]];}});

/* 25 bevel gears (side elevation) */
reg({num:25,outLabel:'Driven gear, turns',
  update(phi){this.g={phi,a2:-phi};},output(){return this.g.a2/TAU;},
  draw(){const g=this.g,O=[400,170],s2=Math.SQRT1_2,N=24,d1=90,d2=170;
    // vertical-axis gear below apex
    const r1=d1*s2,r2=d2*s2,y1=O[1]+d1*s2,y2=O[1]+d2*s2;
    poly([[O[0]-r1,y1],[O[0]+r1,y1],[O[0]+r2,y2],[O[0]-r2,y2]]);ctx.closePath();paint(C['brass-fill'],C.ink);
    ctx.save();ctx.strokeStyle=C.ink;for(let k=0;k<N;k++){const t=g.phi+k*TAU/N;if(Math.sin(t)>0){ctx.globalAlpha=.3+.7*Math.sin(t);ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(O[0]+r1*Math.cos(t),y1);ctx.lineTo(O[0]+r2*Math.cos(t),y2);ctx.stroke();}}ctx.restore();
    ctx.beginPath();ctx.rect(O[0]-10,y2,20,150);paint(C.part,C.ink);
    // horizontal-axis gear to the right of apex
    const x1=O[0]+d1*s2,x2=O[0]+d2*s2;
    poly([[x1,O[1]-r1],[x1,O[1]+r1],[x2,O[1]+r2],[x2,O[1]-r2]]);ctx.closePath();paint(C['steel-fill'],C.ink);
    ctx.save();ctx.strokeStyle=C.ink;for(let k=0;k<N;k++){const t=g.a2+k*TAU/N+PI/N;if(Math.sin(t)>0){ctx.globalAlpha=.3+.7*Math.sin(t);ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x1,O[1]+r1*Math.cos(t));ctx.lineTo(x2,O[1]+r2*Math.cos(t));ctx.stroke();}}ctx.restore();
    ctx.beginPath();ctx.rect(x2,O[1]-10,170,20);paint(C.part,C.ink);
    ctx.save();ctx.setLineDash([6,4]);ctx.strokeStyle=C.muted;ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(O[0],O[1]-40);ctx.lineTo(O[0],500);ctx.moveTo(O[0]-40,O[1]);ctx.lineTo(780,O[1]);ctx.stroke();ctx.restore();
    label('SHAFTS MEET AT 90°',O[0]-14,O[1]-30,'right');label('DRIVER',O[0]-r2-10,y2+40,'right');label('DRIVEN',x2+90,O[1]+34,'center');},
  reads(v){return[['Shaft angle','90° (mitre gears)'],['Ratio','1 : 1'],['Driven speed',rpmOf(Math.abs(v))]];}});

/* 31 worm and wheel */
reg({num:31,outLabel:'Wheel, turns',Z:40,
  update(phi){this.g={phi,w:-phi/this.Z};},output(){return -this.g.w/TAU;},
  draw(){const g=this.g,W=[400,215],R=130,m=2*R/this.Z,p=PI*m,yw=W[1]+R+22,rw=24;
    drawGear(W[0],W[1],R,this.Z,g.w,C['steel-fill'],{bore:10});pivot(W[0],W[1],6);
    ctx.beginPath();ctx.rect(170,yw-rw,460,2*rw);paint(C['brass-fill'],C.ink);
    ctx.save();ctx.beginPath();ctx.rect(170,yw-rw,460,2*rw);ctx.clip();ctx.strokeStyle=C.ink;ctx.lineWidth=2.2;
    const sh=mod(g.phi/TAU*p,p);for(let x=170-p+sh;x<640;x+=p){ctx.beginPath();ctx.moveTo(x,yw-rw);ctx.lineTo(x+p*0.55,yw+rw);ctx.stroke();}ctx.restore();
    bar(120,yw,170,yw,12,C.part);bar(630,yw,690,yw,12,C.part);
    circ(110,yw,26);paint(C['brass-fill'],C.ink);const ca=g.phi;bar(110,yw,110+22*Math.cos(ca),yw+22*Math.sin(ca),7,C.part2);pivot(110,yw,4);
    arcArrow(W[0],W[1],R+24,-1.2,-1.9,C.steel);label('WORM · driver',400,yw+44,'center');label('WORM WHEEL',W[0]+R+20,W[1]-R+10);},
  reads(v){const g=this.g;return[['Reduction',`${this.Z} : 1`],['Worm turns',`${(g.phi/TAU).toFixed(1)}`],['Wheel angle',`${mod(-g.w*180/PI,360).toFixed(1)}°`],['Back-driving','resisted (self-locking)']];}});

/* 33 elliptical gears */
reg({num:33,outLabel:'Driven gear, turns',params:[{id:'e',label:'Eccentricity',min:0.2,max:0.75,step:0.05,value:0.6,fmt:v=>v.toFixed(2)}],
  a:90,
  table(){const e=this.P.e;if(this._e===e)return;this._e=e;const a=this.a,n=720,T=new Float64Array(n+1);let th=0;T[0]=0;
    const r=psi=>a*(1-e*e)/(1+e*Math.cos(psi));
    for(let i=1;i<=n;i++){const t0=(i-1)/n*TAU,t1=i/n*TAU;const f=t=>{const r1=r(-t);return -r1/(2*a-r1);};th+=(f(t0)+f(t1))/2*(TAU/n);T[i]=th;}
    const k=-TAU/T[n];for(let i=0;i<=n;i++)T[i]*=k;this.T=T;},
  update(phi){this.table();const n=720,c=Math.floor(phi/TAU),f=phi/TAU-c,x=f*n,i=Math.floor(x);const t=this.T[i]+(this.T[Math.min(n,i+1)]-this.T[i])*(x-i);
    const e=this.P.e,a=this.a,r1=a*(1-e*e)/(1+e*Math.cos(-phi));this.g={phi,a2:t-c*TAU,ratio:r1/(2*a-r1)};},
  output(){return -this.g.a2/TAU;},
  ell(F,th,fill){const e=this.P.e,a=this.a,pts=[];for(let i=0;i<180;i++){const s=i/180*TAU,r=a*(1-e*e)/(1+e*Math.cos(s));pts.push([F[0]+r*Math.cos(s+th),F[1]+r*Math.sin(s+th)]);}
    poly(pts);ctx.closePath();paint(fill,C.ink);ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=1;for(let i=0;i<36;i++){const s=i/36*TAU,r=a*(1-e*e)/(1+e*Math.cos(s));const x=F[0]+r*Math.cos(s+th),y=F[1]+r*Math.sin(s+th);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(F[0]+(r-9)*Math.cos(s+th),F[1]+(r-9)*Math.sin(s+th));ctx.stroke();}ctx.restore();},
  draw(){const g=this.g,F1=[310,260],F2=[310+2*this.a,260];this.ell(F1,g.phi,C['brass-fill']);this.ell(F2,PI+g.a2,C['steel-fill']);pivot(F1[0],F1[1],6);pivot(F2[0],F2[1],6);
    label('PIVOTS AT THE FOCI',400,440,'center');},
  reads(v){const g=this.g;return[['Speed ratio now',`${g.ratio.toFixed(2)} × driver`],['Driven speed',rpmOf(Math.abs(v))],['Over one turn','fast, then slow']];}});

/* 34 internal gear and pinion */
reg({num:34,outLabel:'Ring gear, turns',
  update(phi){this.g={phi,ar:phi*16/48};},output(){return this.g.ar/TAU;},
  draw(){const g=this.g,O=[400,260],R=120,Z=48,m=5;
    poly(gearPts(O[0],O[1],R,Z,g.ar+PI/Z,true));ctx.closePath();circ(O[0],O[1],R+1.25*m+18,false);paint(C['steel-fill'],C.ink);pitchArc(O[0],O[1],R);
    drawGear(O[0]+80,O[1],40,16,g.phi,C['brass-fill'],{bore:7});pivot(O[0]+80,O[1],5);pivot(O[0],O[1],5);
    arcArrow(O[0]+80,O[1],58,-2.4,-1.4,C.brass);arcArrow(O[0],O[1],R+40,-2.0,-1.4,C.steel);label('BOTH TURN THE SAME WAY',400,490,'center');},
  reads(v){return[['Ratio','16 : 48'],['Direction','same as pinion'],['Teeth in contact','more than external gears'],['Ring speed',rpmOf(v)]];}});

/* 39 sun and planet */
reg({num:39,outLabel:'Flywheel shaft, turns',S:[470,320],Bp:[230,110],Lb:160,Lr:300,
  geo(psi){const P=[this.S[0]+100*Math.cos(psi),this.S[1]+100*Math.sin(psi)];const E=cc(this.Bp,this.Lb,P,this.Lr,-1);const rho=Math.atan2(P[1]-E[1],P[0]-E[0]);return{P,E,rho};},
  reset(){const g0=this.geo(0);this.rho0=g0.rho;},
  update(phi){if(this.rho0===undefined)this.reset();const g=this.geo(phi);g.sig=2*phi-g.rho+(this.rho0-0);g.phi=phi;this.g=g;},
  output(){return this.g.sig/TAU;},
  draw(){const g=this.g,S=this.S,tau=TAU/20;
    circ(S[0],S[1],170);paint(C.part,C.ink);for(let k=0;k<6;k++){const a=g.sig+k*PI/3;bar(S[0]+40*Math.cos(a),S[1]+40*Math.sin(a),S[0]+158*Math.cos(a),S[1]+158*Math.sin(a),10,C.part2);}
    circ(S[0],S[1],150);paint(null,C.ink,1);
    drawGear(S[0],S[1],50,20,g.sig+tau/2,C['steel-fill'],{bore:8});
    drawGear(g.P[0],g.P[1],50,20,g.rho+PI+tau/2+(0-this.rho0)+PI,C['brass-fill'],{bore:8});
    bar(S[0],S[1],g.P[0],g.P[1],10,C.part2);
    bar(2*this.Bp[0]-g.E[0],2*this.Bp[1]-g.E[1],g.E[0],g.E[1],16,C.part);
    bar(g.E[0],g.E[1],g.P[0],g.P[1],12,C.part2);pivot(g.E[0],g.E[1],5);pivot(g.P[0],g.P[1],6);pivot(S[0],S[1],6);
    ctx.beginPath();ctx.rect(this.Bp[0]-12,this.Bp[1],24,140);paint(C.part2,C.ink);ground(this.Bp[0],this.Bp[1]+140,60);pivot(this.Bp[0],this.Bp[1],7);
    label('BEAM',this.Bp[0]-90,this.Bp[1]-24);label('PLANET · fixed to rod',g.P[0]-70,g.P[1]+70,'right');label('SUN on flywheel shaft',S[0]-60,S[1]+190);},
  reads(v){const g=this.g;return[['Beam strokes',`${(g.phi/TAU).toFixed(2)}`],['Flywheel turns',`${(g.sig/TAU).toFixed(2)}`],['Ratio','2 turns per stroke']];}});

/* 50 universal joint */
reg({num:50,outLabel:'Output lead / lag, degrees',params:[{id:'b',label:'Shaft angle',min:5,max:45,step:1,value:30,fmt:v=>v+'°'}],
  update(phi){const b=this.P.b*PI/180;let t=Math.atan2(Math.sin(phi),Math.cos(phi)*Math.cos(b));t+=TAU*Math.round((phi-t)/TAU);this.g={phi,b,t2:t};},
  output(){return (this.g.t2-this.g.phi)*180/PI;},
  draw(){const g=this.g,J=[400,240];
    stripeShaft(90,J[0]-60,J[1],16,g.phi,C['brass-fill']);
    ctx.save();ctx.translate(J[0],J[1]);ctx.rotate(g.b);stripeShaft(60,330,0,16,g.t2,C['steel-fill']);ctx.restore();
    const yoke=(ang,rot,fill,dir)=>{ctx.save();ctx.translate(J[0],J[1]);ctx.rotate(rot);const s=Math.cos(ang),w=46*s;
      ctx.beginPath();ctx.moveTo(-60*dir,-16);ctx.lineTo(-30*dir,-Math.abs(w)-6);ctx.lineTo(8*dir,-Math.abs(w)-6);ctx.lineTo(8*dir,-Math.abs(w)+6);ctx.lineTo(-20*dir,-Math.abs(w)+6);ctx.lineTo(-48*dir,-6);ctx.lineTo(-48*dir,6);ctx.lineTo(-20*dir,Math.abs(w)-6);ctx.lineTo(8*dir,Math.abs(w)-6);ctx.lineTo(8*dir,Math.abs(w)+6);ctx.lineTo(-30*dir,Math.abs(w)+6);ctx.lineTo(-60*dir,16);ctx.closePath();paint(fill,C.ink);ctx.restore();};
    yoke(g.phi,0,C['brass-fill'],1);yoke(g.t2+PI/2,g.b,C['steel-fill'],-1);
    ctx.beginPath();ctx.rect(J[0]-9,J[1]-9,18,18);paint(C.part2,C.ink);pivot(J[0],J[1],4);
    label('INPUT · steady',150,J[1]+50,'center');label('OUTPUT · speeds up and slows down',560,J[1]+170,'center');},
  reads(){const g=this.g;const cb=Math.cos(g.b),sp=Math.sin(g.phi),cp=Math.cos(g.phi);const r=cb/(1-Math.pow(Math.sin(g.b)*sp,2));
    return[['Shaft angle',`${this.P.b}°`],['Output speed now',`${r.toFixed(3)} × input`],['Range per turn',`${cb.toFixed(2)} – ${(1/cb).toFixed(2)} ×`],['Lead / lag',`${((g.t2-g.phi)*180/PI).toFixed(1)}°`]];}});

/* 72 tilt hammer */
reg({num:72,outLabel:'Hammer head lift, mm',W:[600,370],H:[400,250],
  update(phi){const W=this.W,Rw=95;let best=null;for(let k=0;k<4;k++){const a=mod(phi+k*PI/2+PI,TAU)-PI;if(a>-PI/2&&a<-0.35){const tip=[W[0]+Rw*Math.cos(a),W[1]+Rw*Math.sin(a)];if(!best||tip[1]>best[1])best=tip;best=best||tip;}}
    const rest=Math.atan2(272-this.H[1],640-this.H[0]);let h=rest;if(best){const ah=Math.atan2(best[1]-this.H[1],best[0]-this.H[0]);h=Math.max(rest,ah);}
    this.g={phi,h,rest,lift:(h-rest)*260};},
  output(){return this.g.lift;},
  draw(){const g=this.g,W=this.W,H=this.H;
    circ(W[0],W[1],70);paint(C['brass-fill'],C.ink);for(let k=0;k<4;k++){const a=g.phi+k*PI/2;ctx.beginPath();ctx.moveTo(W[0]+30*Math.cos(a-0.25),W[1]+30*Math.sin(a-0.25));ctx.quadraticCurveTo(W[0]+100*Math.cos(a-0.05),W[1]+100*Math.sin(a-0.05),W[0]+95*Math.cos(a),W[1]+95*Math.sin(a));ctx.lineTo(W[0]+60*Math.cos(a+0.25),W[1]+60*Math.sin(a+0.25));ctx.closePath();paint(C['brass-fill'],C.ink);}
    pivot(W[0],W[1],7);
    const tail=[H[0]+250*Math.cos(g.h),H[1]+250*Math.sin(g.h)],head=[H[0]-260*Math.cos(g.h),H[1]-260*Math.sin(g.h)];
    bar(head[0],head[1],tail[0],tail[1],14,C.part);
    ctx.save();ctx.translate(head[0],head[1]);ctx.rotate(g.h);ctx.beginPath();ctx.rect(-26,-10,52,70);paint(C['steel-fill'],C.ink);ctx.restore();
    ctx.beginPath();ctx.rect(H[0]-14,H[1],28,170);paint(C.part2,C.ink);ground(H[0],H[1]+170,60);pivot(H[0],H[1],6);
    hatchRect(80,330,120,30,C.part2);ctx.beginPath();ctx.rect(110,360,60,110);paint(C.part2,C.ink);ground(140,470,100);
    label('HELVE',H[0]-120,H[1]-40);label('CAM WHEEL · 4 lifts per turn',W[0],W[1]+120,'center');label('ANVIL',140,490,'center');},
  reads(){const g=this.g;return[['Blows per turn','4'],['Head lift',`${g.lift.toFixed(0)} mm`],['Wheel angle',`${mod(g.phi*180/PI,360).toFixed(0)}°`]];}});

/* 85 stamp mill */
reg({num:85,outLabel:'Stamp 1 height, mm',
  lift(t){t=mod(t,PI);return t<0.75*PI?60*t/(0.75*PI):60*Math.max(0,1-(t-0.75*PI)/(0.06*PI));},
  update(phi){this.g={phi,l:[0,1,2].map(k=>this.lift(phi+k*TAU/3))};},output(){return this.g.l[0];},
  draw(){const g=this.g,ys=300;ctx.beginPath();ctx.rect(120,ys-10,560,20);paint(C.part,C.ink);
    [260,400,540].forEach((x,k)=>{const L=g.l[k];
      for(let j=0;j<2;j++){const a=g.phi+k*TAU/3+j*PI;const c=Math.cos(a),s=Math.sin(a);if(c>-0.1){ctx.save();ctx.globalAlpha=.4+.6*Math.max(0,c);bar(x+22,ys,x+22,ys-55*s,14,C['brass-fill']);ctx.restore();}}
      const top=110-L;ctx.beginPath();ctx.rect(x-8,top,16,330);paint(C.part,C.ink);ctx.beginPath();ctx.rect(x-12,ys-62-L,40,12);paint(C['steel-fill'],C.ink);
      ctx.beginPath();ctx.rect(x-22,top+300,44,40);paint(C['steel-fill'],C.ink);});
    hatchRect(200,450,400,50,C.part2);for(const x of [180,620]){ctx.beginPath();ctx.rect(x-10,60,20,440);paint(C.part2,C.ink);}
    ctx.beginPath();ctx.rect(170,90,460,14);paint(C.part2,C.ink);label('CAMSHAFT',120,ys-26);label('ORE',400,488,'center');},
  reads(){const g=this.g;return[['Stamps','3, lifted in turn'],['Drops per turn','2 each'],['Stamp heights',g.l.map(v=>v.toFixed(0)).join(' / ')+' mm']];}});

/* 89 eccentric */
reg({num:89,outLabel:'Valve position, mm',params:[{id:'e',label:'Eccentric throw',min:10,max:40,step:1,value:26,fmt:v=>v+' mm'}],O:[220,280],L:250,
  update(phi){const e=this.P.e,c=[this.O[0]+e*Math.cos(phi),this.O[1]+e*Math.sin(phi)];const x=c[0]+Math.sqrt(this.L**2-(c[1]-this.O[1])**2);this.g={phi,e,c,x};},
  output(){return this.g.x-(this.O[0]+this.L);},
  draw(){const g=this.g,O=this.O,y=O[1];
    circ(g.c[0],g.c[1],78);paint(C.part2,C.ink);circ(g.c[0],g.c[1],64);circ(O[0],O[1],10,false);paint(C['brass-fill'],C.ink);pivot(O[0],O[1],6);
    bar(g.c[0]+70,g.c[1],g.x,y,14,C.part);
    ctx.beginPath();ctx.rect(560,y-40,180,80);paint(C.part,C.ink);
    [600,700].forEach(px=>{ctx.beginPath();ctx.rect(px-8,y+40,16,40);paint(C.hi,C.ink);});ctx.beginPath();ctx.rect(642,y+40,16,40);paint(C.hi,C.ink);
    const vx=g.x+150;bar(g.x,y,vx,y,8,C.part2);ctx.beginPath();ctx.rect(vx-50,y+8,100,32);paint(C['steel-fill'],C.ink);
    label('ECCENTRIC',O[0],O[1]+120,'center');label('SLIDE VALVE',650,y-56,'center');label('STEAM PORTS',650,y+96,'center');},
  reads(){const g=this.g;return[['Valve travel',`${2*g.e} mm`],['Valve position',`${(g.x-(this.O[0]+this.L)).toFixed(1)} mm`]];}});

/* 92 crank and connecting rod */
reg({num:92,outLabel:'Piston position, mm',params:[{id:'r',label:'Crank radius',min:40,max:90,step:5,value:70,fmt:v=>v+' mm'},{id:'L',label:'Connecting rod',min:160,max:300,step:10,value:220,fmt:v=>v+' mm'}],O:[200,270],
  update(phi){const r=this.P.r,L=this.P.L,pin=[this.O[0]+r*Math.cos(phi),this.O[1]+r*Math.sin(phi)];const x=pin[0]+Math.sqrt(L*L-(pin[1]-this.O[1])**2);this.g={phi,pin,x,r,L};},
  output(){return this.g.x-this.O[0];},
  draw(){const g=this.g,O=this.O,y=O[1];
    circ(O[0],O[1],120);paint(C.part,C.ink);for(let k=0;k<5;k++){const a=g.phi+k*TAU/5;bar(O[0]+18*Math.cos(a),O[1]+18*Math.sin(a),O[0]+110*Math.cos(a),O[1]+110*Math.sin(a),9,C.part2);}
    bar(O[0],O[1],g.pin[0],g.pin[1],22,C['brass-fill']);
    const cx0=O[0]+g.L-g.r-30;ctx.beginPath();ctx.rect(cx0,y-46,330,10);ctx.rect(cx0,y+36,330,10);ctx.rect(cx0+320,y-46,10,92);paint(C.part2,C.ink);
    ctx.beginPath();ctx.rect(g.x,y-36,70,72);paint(C['steel-fill'],C.ink);
    bar(g.pin[0],g.pin[1],g.x+20,y,14,C.part);pivot(g.pin[0],g.pin[1],5);pivot(g.x+20,y,5);pivot(O[0],O[1],6);
    label('FLYWHEEL',O[0],O[1]+140,'center');label('PISTON',g.x+35,y+66,'center');},
  reads(v){const g=this.g;return[['Stroke',`${2*g.r} mm`],['Crank angle',`${mod(g.phi*180/PI,360).toFixed(0)}°`],['Piston speed',`${v.toFixed(0)} mm/s`]];}});

/* 93 scotch yoke */
reg({num:93,outLabel:'Slide position, mm',O:[400,260],r:90,
  update(phi){this.g={phi,pin:[this.O[0]+this.r*Math.cos(phi),this.O[1]+this.r*Math.sin(phi)]};},output(){return this.g.pin[0]-this.O[0];},
  draw(){const g=this.g,O=this.O,x=g.pin[0];
    circ(O[0],O[1],112);paint(C['brass-fill'],C.ink);bar(O[0],O[1],g.pin[0],g.pin[1],18,C.part2);
    ctx.beginPath();ctx.rect(x-16,O[1]-140,32,280);ctx.rect(x-7,O[1]-120,14,240);paint(C['steel-fill'],C.ink);
    bar(40+x-O[0],O[1],x-16,O[1],16,C['steel-fill']);bar(x+16,O[1],760+x-O[0],O[1],16,C['steel-fill']);
    for(const gx of [60,740]){ctx.beginPath();ctx.rect(gx-24,O[1]-24,48,12);ctx.rect(gx-24,O[1]+12,48,12);paint(C.part,C.ink);}
    ctx.beginPath();ctx.rect(g.pin[0]-9,g.pin[1]-9,18,18);paint(C.part,C.ink);pivot(g.pin[0],g.pin[1],4);pivot(O[0],O[1],6);label('SLOTTED YOKE',x+24,O[1]-150);},
  reads(v){const g=this.g;return[['Stroke',`${2*this.r} mm`],['Motion','pure sine wave'],['Slide speed',`${v.toFixed(0)} mm/s`]];}});

/* 96 heart cam */
reg({num:96,outLabel:'Follower height, mm',O:[400,330],
  r(t){t=mod(t+PI,TAU)-PI;return 60+70*Math.abs(t)/PI;},
  update(phi){const t=-PI/2-phi;const r=this.r(t);this.g={phi,h:r};},output(){return this.g.h-60;},
  draw(){const g=this.g,O=this.O,pts=[];for(let i=0;i<240;i++){const s=i/240*TAU-PI;const r=this.r(s);pts.push([O[0]+r*Math.cos(s+g.phi),O[1]+r*Math.sin(s+g.phi)]);}
    poly(pts);ctx.closePath();circ(O[0],O[1],8,false);paint(C['brass-fill'],C.ink);pivot(O[0],O[1],6);
    const y=O[1]-g.h-14;ctx.beginPath();ctx.rect(O[0]-8,y-200,16,200);paint(C['steel-fill'],C.ink);circ(O[0],y,14);paint(C['steel-fill'],C.ink);pivot(O[0],y,4);
    for(const gy of [90,150]){ctx.beginPath();ctx.rect(O[0]-28,gy,12,26);ctx.rect(O[0]+16,gy,12,26);paint(C.part,C.ink);}
    label('HEART CAM',O[0]+150,O[1]+60);label('FOLLOWER',O[0]+40,y-60);},
  reads(v){const g=this.g;return[['Stroke','140 mm'],['Follower speed',`${Math.abs(v).toFixed(0)} mm/s`],['Motion','steady up, steady down']];}});

/* 100 quick return */
reg({num:100,outLabel:'Ram position, mm',params:[{id:'r',label:'Crank radius',min:50,max:110,step:5,value:85,fmt:v=>v+' mm'}],O2:[400,320],O1:[400,490],yr:110,
  update(phi){const r=this.P.r,P=[this.O2[0]+r*Math.cos(phi),this.O2[1]+r*Math.sin(phi)];const l=Math.atan2(P[0]-this.O1[0],this.O1[1]-P[1]);const xr=this.O1[0]+(this.O1[1]-this.yr)*Math.tan(l);this.g={phi,P,l,xr,r};},
  output(){return this.g.xr-this.O1[0];},
  draw(){const g=this.g,O1=this.O1,O2=this.O2,top=[O1[0]+400*Math.sin(g.l),O1[1]-400*Math.cos(g.l)];
    ctx.beginPath();ctx.rect(g.xr-250,this.yr-14,440,28);paint(C['steel-fill'],C.ink);ctx.beginPath();ctx.moveTo(g.xr+190,this.yr+14);ctx.lineTo(g.xr+210,this.yr+44);ctx.lineTo(g.xr+176,this.yr+14);ctx.closePath();paint(C['steel-fill'],C.ink);
    for(const gx of [120,680]){ctx.beginPath();ctx.rect(gx-30,this.yr-26,60,10);ctx.rect(gx-30,this.yr+16,60,10);paint(C.part,C.ink);}
    circ(O2[0],O2[1],g.r+24);paint(C['brass-fill'],C.ink);
    ctx.save();ctx.translate(O1[0],O1[1]);ctx.rotate(g.l);ctx.beginPath();capsule(0,0,0,-(O1[1]-this.yr)/Math.cos(g.l)-10,14);capsule(0,-30,0,-300,6);paint(C.part2,C.ink);ctx.restore();
    ctx.save();ctx.translate(g.P[0],g.P[1]);ctx.rotate(g.l);ctx.beginPath();ctx.rect(-9,-16,18,32);paint(C.part,C.ink);ctx.restore();
    ctx.beginPath();ctx.rect(g.xr-9,this.yr-9,18,18);paint(C.part,C.ink);
    pivot(g.P[0],g.P[1],4);pivot(O2[0],O2[1],6);pivot(O1[0],O1[1],6);ground(O1[0],O1[1]+12,60);label('RAM WITH TOOL',g.xr+30,this.yr-30);label('SLOTTED LEVER',O1[0]+70,O1[1]-40);},
  reads(v){const r=this.P.r,d=this.O1[1]-this.O2[1],b=Math.asin(Math.min(0.999,r/d));const cut=PI+2*b,ret=PI-2*b;
    return[['Cutting : return time',`${(cut/ret).toFixed(2)} : 1`],['Ram speed',`${v.toFixed(0)} mm/s`],['Ram stroke',`${(2*(this.O1[1]-this.yr)*Math.tan(b)).toFixed(0)} mm`]];}});

/* 102 screw and nut */
reg({num:102,outLabel:'Nut position, mm',p:24,
  update(phi){const th=6*PI*Math.sin(phi);this.g={phi,th,x:th/TAU*this.p};},output(){return this.g.x;},
  draw(){const g=this.g,y=260,r=22,p=this.p;
    ctx.beginPath();ctx.rect(140,y-r,520,2*r);paint(C['brass-fill'],C.ink);ctx.save();ctx.beginPath();ctx.rect(140,y-r,520,2*r);ctx.clip();ctx.strokeStyle=C.ink;ctx.lineWidth=2;
    const sh=mod(g.th/TAU*p,p);for(let x=140-p+sh;x<680;x+=p){ctx.beginPath();ctx.moveTo(x,y-r);ctx.lineTo(x+p/2,y+r);ctx.stroke();}ctx.restore();
    circ(110,y,46);paint(C['brass-fill'],C.ink);for(let k=0;k<3;k++){const a=g.th+k*TAU/3;bar(110,y,110+40*Math.cos(a),y+40*Math.sin(a),6,C.part2);}pivot(110,y,6);
    const nx=400+g.x;ctx.beginPath();ctx.rect(nx-36,y-46,72,92);paint(C['steel-fill'],C.ink);ctx.beginPath();ctx.rect(nx-36,y+46,72,30);paint(C['steel-fill'],C.ink);
    ctx.beginPath();ctx.rect(150,y+76,500,10);paint(C.part2,C.ink);ctx.beginPath();ctx.rect(660,y-30,16,60);paint(C.part2,C.ink);
    label('NUT · slides, cannot turn',nx,y-64,'center');label('HANDWHEEL',110,y+70,'center');},
  reads(){const g=this.g;return[['Pitch',`${this.p} mm per turn`],['Screw turns',`${(g.th/TAU).toFixed(2)}`],['Nut travel',`${g.x.toFixed(1)} mm`]];}});

/* 113 rack and pinion */
reg({num:113,outLabel:'Rack position, mm',
  update(phi){const th=1.5*Math.sin(phi);this.g={phi,th,x:-60*th};},output(){return this.g.x;},
  draw(){const g=this.g,P=[400,220],m=6,p=PI*m,y=P[1]+60;
    const pts=rackTeeth(40,760,400+g.x,p,y,m,false);poly([[40,y+40],[40,y+1.25*m],...pts,[760,y+1.25*m],[760,y+40]]);ctx.closePath();paint(C['steel-fill'],C.ink);
    drawGear(P[0],P[1],60,20,g.th+PI/2+PI/20,C['brass-fill'],{bore:8});pivot(P[0],P[1],6);
    linArrow(400,y+66,g.x>0?40:-40,C.steel);label('PINION',P[0]+80,P[1]-60);label('RACK',90,y+60);},
  reads(v){const g=this.g;return[['Pinion angle',`${(g.th*180/PI).toFixed(0)}°`],['Rack travel',`${g.x.toFixed(1)} mm`],['Per pinion turn',`${(TAU*60).toFixed(0)} mm`]];}});

/* 118 stroke doubler */
reg({num:118,outLabel:'Top rack position, mm',O:[150,250],r:65,L:210,
  update(phi){const pin=[this.O[0]+this.r*Math.cos(phi),this.O[1]+this.r*Math.sin(phi)];const cx=pin[0]+Math.sqrt(this.L**2-(pin[1]-this.O[1])**2);const c0=this.O[0]+this.L;this.g={phi,pin,cx,d:cx-c0};},
  output(){return 2*this.g.d;},
  draw(){const g=this.g,O=this.O,y=O[1],m=5,p=PI*m,r=40,c0=O[0]+this.L;
    const lo=rackTeeth(260,760,c0,p,y+r,m,false);poly([[260,y+r+30],[260,y+r+1.25*m],...lo,[760,y+r+1.25*m],[760,y+r+30]]);ctx.closePath();paint(C.part2,C.ink);ground(510,y+r+30,500);
    const ux=2*g.d,up=rackTeeth(250+ux,760+ux,c0+ux,p,y-r,m,true);poly([[250+ux,y-r-30],[250+ux,y-r-1.25*m],...up,[760+ux,y-r-1.25*m],[760+ux,y-r-30]]);ctx.closePath();paint(C['steel-fill'],C.ink);
    drawGear(g.cx,y,r,16,g.d/r+PI/2+PI/16,C['brass-fill'],{bore:6});
    circ(O[0],O[1],this.r+20);paint(C.part,C.ink);bar(O[0],O[1],g.pin[0],g.pin[1],16,C.part2);bar(g.pin[0],g.pin[1],g.cx,y,12,C.part);pivot(g.pin[0],g.pin[1],4);pivot(g.cx,y,5);pivot(O[0],O[1],6);
    label('MOVING RACK · double stroke',520,y-r-50,'center');label('FIXED RACK',520,y+r+50,'center');},
  reads(){const g=this.g;return[['Crank stroke',`${2*this.r} mm`],['Rack stroke',`${4*this.r} mm`],['Top rack',`${(2*g.d).toFixed(0)} mm`]];}});

/* 126 bell crank */
reg({num:126,outLabel:'Output rod position, mm',params:[{id:'b',label:'Output arm length',min:70,max:180,step:10,value:130,fmt:v=>v+' mm (input arm 130)'}],P0:[400,300],
  update(phi){const t=0.38*Math.sin(phi);this.g={phi,t};},output(){return -this.P.b*Math.sin(this.g.t);},
  draw(){const g=this.g,P=this.P0,b=this.P.b,A=[P[0]-130*Math.cos(g.t),P[1]-130*Math.sin(g.t)],B=[P[0]+b*Math.sin(g.t),P[1]-b*Math.cos(g.t)];
    ctx.beginPath();capsule(A[0],A[1],P[0],P[1],12);capsule(P[0],P[1],B[0],B[1],12);paint(C['brass-fill'],C.ink);
    bar(A[0],A[1],A[0],480,8,C.part);ctx.beginPath();ctx.rect(A[0]-14,470,28,24);paint(C['brass-fill'],C.ink);
    bar(B[0],B[1],760,B[1],8,C['steel-fill']);for(const gx of [700]){ctx.beginPath();ctx.rect(gx-20,B[1]-18,40,8);ctx.rect(gx-20,B[1]+10,40,8);paint(C.part,C.ink);}
    pivot(A[0],A[1],5);pivot(B[0],B[1],5);pivot(P[0],P[1],7);ground(P[0],P[1]+40,60);ctx.beginPath();ctx.rect(P[0]-8,P[1],16,40);paint(C.part2,C.ink);pivot(P[0],P[1],7);
    label('PULL DOWN',A[0]-24,488,'right');label('MOVES SIDEWAYS',620,B[1]-30);},
  reads(){const g=this.g,b=this.P.b;return[['Input travel',`${(-130*Math.sin(g.t)).toFixed(0)} mm`],['Output travel',`${(-b*Math.sin(g.t)).toFixed(0)} mm`],['Force ratio',`${(130/b).toFixed(2)} : 1`],['Direction turned','90°']];}});

/* 140 toggle joint */
reg({num:140,outLabel:'Press head position, mm',L:150,T:[400,70],
  update(phi){const k=6+110*(1+Math.cos(phi))/2,h=Math.sqrt(this.L**2-k*k);this.g={phi,k,h,Y:this.T[1]+2*h};},output(){return this.g.Y-this.T[1];},
  draw(){const g=this.g,T=this.T,K=[T[0]-g.k,T[1]+g.h],Y=g.Y;
    ctx.beginPath();ctx.rect(T[0]-80,T[1]-30,160,30);paint(C.part2,C.ink);
    for(const gx of [T[0]-70,T[0]+70]){ctx.beginPath();ctx.rect(gx-8,T[1],16,440);paint(C.part,C.ink);}
    bar(T[0],T[1],K[0],K[1],18,C['brass-fill']);bar(K[0],K[1],T[0],Y,18,C['brass-fill']);
    ctx.beginPath();ctx.rect(T[0]-60,Y,120,30);paint(C['steel-fill'],C.ink);ctx.beginPath();ctx.rect(T[0]-6,Y+30,12,24);paint(C['steel-fill'],C.ink);
    hatchRect(T[0]-90,410,180,16,C.part);ctx.beginPath();ctx.rect(T[0]-100,426,200,60);paint(C.part2,C.ink);
    bar(80,K[1],K[0],K[1],8,C.part);linArrow(120,K[1]-24,40,C.brass);
    pivot(T[0],T[1],6);pivot(K[0],K[1],6);pivot(T[0],Y,5);label('PUSH HERE',90,K[1]-40);label('STRAIGHTENING LINKS',T[0]+90,T[1]+g.h);},
  reads(){const g=this.g;return[['Knee offset',`${g.k.toFixed(0)} mm`],['Force multiplier',`× ${(g.h/(2*g.k)).toFixed(1)}`],['Note','grows huge as the links straighten']];}});

/* 141 band saw */
reg({num:141,outLabel:'Blade travel, m',
  update(phi){this.g={phi,s:90*phi};},output(){return this.g.s/1000;},
  draw(){const g=this.g,A=[400,110],B=[400,420],r=90;const pts=beltPoly(A[0],A[1],r,B[0],B[1],r,false,3);
    circ(A[0],A[1],r+6);paint(C.part,C.ink);circ(B[0],B[1],r+6);paint(C['brass-fill'],C.ink);
    ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(...pts[0]);for(const p of pts)ctx.lineTo(...p);ctx.closePath();ctx.stroke();ctx.restore();
    const ap=alongPoly(pts);ctx.save();ctx.fillStyle=C.ink;for(let s=0;s<ap.total;s+=14){const q=ap.at(s-g.s);ctx.save();ctx.translate(q[0],q[1]);ctx.rotate(q[2]);ctx.beginPath();ctx.moveTo(-4,0);ctx.lineTo(0,-5);ctx.lineTo(3,0);ctx.closePath();ctx.fill();ctx.restore();}ctx.restore();
    pulley(A[0],A[1],r-8,-g.phi,C.part);pulley(B[0],B[1],r-8,-g.phi,C['brass-fill']);
    ctx.beginPath();ctx.rect(200,262,400,14);paint(C.part2,C.ink);hatchRect(220,222,90,40,C['steel-fill']);label('TABLE',610,290);label('BLADE · endless band',530,110);},
  reads(v){return[['Blade speed',`${(v*1000).toFixed(0)} mm/s`],['Cutting run','straight, always downward']];}});

/* 144 lazy tongs */
reg({num:144,outLabel:'Reach, mm',L:120,n:4,
  update(phi){const th=0.35+0.85*(1+Math.cos(phi))/2;this.g={phi,th};},output(){return this.n*this.L*Math.cos(this.g.th);},
  draw(){const g=this.g,L=this.L,dx=L*Math.cos(g.th),dy=L/2*Math.sin(g.th),x0=150,y0=260;
    for(let i=0;i<this.n;i++){const xa=x0+i*dx,xb=xa+dx;bar(xa,y0-dy,xb,y0+dy,9,C['brass-fill']);bar(xa,y0+dy,xb,y0-dy,9,C.part);pivot((xa+xb)/2,y0,3.5);pivot(xa,y0-dy,3.5);pivot(xa,y0+dy,3.5);}
    const xe=x0+this.n*dx;pivot(xe,y0-dy,3.5);pivot(xe,y0+dy,3.5);ctx.beginPath();ctx.moveTo(xe,y0-dy);ctx.lineTo(xe+30,y0-6);ctx.lineTo(xe+30,y0+6);ctx.lineTo(xe,y0+dy);paint(null,C.ink,3);
    bar(x0,y0-dy,x0-70,y0-dy-30,10,C.part2);bar(x0,y0+dy,x0-70,y0+dy+30,10,C.part2);label('HANDLES',x0-70,y0,'center');label('GRIPPER',xe+40,y0);},
  reads(){const g=this.g;return[['Reach',`${(this.n*this.L*Math.cos(g.th)).toFixed(0)} mm`],['Cells','4'],['Handle motion amplified','about × 4']];}});

/* 145 beam engine */
reg({num:145,outLabel:'Piston height, mm',Bp:[400,140],Lb:170,O:[570,390],r:70,Lr:250,
  update(phi){const pin=[this.O[0]+this.r*Math.cos(phi),this.O[1]+this.r*Math.sin(phi)];const E=cc(this.Bp,this.Lb,pin,this.Lr,-1);const F=[2*this.Bp[0]-E[0],2*this.Bp[1]-E[1]];this.g={phi,pin,E,F};},
  output(){return 140-this.g.F[1];},
  draw(){const g=this.g,O=this.O,Bp=this.Bp;
    circ(O[0],O[1],125);paint(C.part,C.ink);for(let k=0;k<6;k++){const a=g.phi+k*PI/3;bar(O[0],O[1],O[0]+115*Math.cos(a),O[1]+115*Math.sin(a),8,C.part2);}
    bar(O[0],O[1],g.pin[0],g.pin[1],16,C['brass-fill']);
    ctx.beginPath();ctx.rect(g.F[0]-50,300,100,170);paint(C.part2,C.ink);ctx.beginPath();ctx.rect(g.F[0]-38,g.F[1]+150,76,30);paint(C['steel-fill'],C.ink);
    bar(g.F[0],g.F[1],g.F[0],g.F[1]+150,10,C.part);
    ctx.beginPath();capsule(g.F[0],g.F[1],g.E[0],g.E[1],14);paint(C['steel-fill'],C.ink);
    bar(g.E[0],g.E[1],g.pin[0],g.pin[1],12,C.part);ctx.beginPath();ctx.rect(Bp[0]-14,Bp[1],28,330);paint(C.part2,C.ink);ground(Bp[0],Bp[1]+330,70);
    for(const p of [g.E,g.F,g.pin])pivot(p[0],p[1],4.5);pivot(Bp[0],Bp[1],7);pivot(O[0],O[1],6);
    label('CYLINDER',g.F[0],490,'center');label('BEAM',Bp[0]-30,Bp[1]-30);label('FLYWHEEL',O[0],O[1]+140,'center');},
  reads(){const g=this.g;return[['Crank angle',`${mod(g.phi*180/PI,360).toFixed(0)}°`],['Piston stroke','≈ 140 mm'],['Beam angle',`${(Math.atan2(g.E[1]-this.Bp[1],g.E[0]-this.Bp[0])*180/PI).toFixed(1)}°`]];}});

/* 152 ellipsograph */
reg({num:152,outLabel:'Pencil height, mm',O:[400,270],p:110,q:90,
  reset(){this.trail=[];},
  update(phi){const O=this.O,H=[O[0]+this.p*Math.cos(phi),O[1]],V=[O[0],O[1]-this.p*Math.sin(phi)],k=1+this.q/this.p,P=[H[0]+(V[0]-H[0])*k,H[1]+(V[1]-H[1])*k];this.g={phi,H,V,P};this.trail=this.trail||[];this.trail.push(P);if(this.trail.length>400)this.trail.shift();},
  output(){return this.O[1]-this.g.P[1];},
  draw(){const g=this.g,O=this.O;
    ctx.save();ctx.strokeStyle=C.rule;ctx.setLineDash([4,4]);ctx.beginPath();ctx.ellipse(O[0],O[1],this.q,this.p+this.q,0,0,TAU);ctx.stroke();ctx.restore();
    ctx.beginPath();ctx.rect(O[0]-170,O[1]-16,340,32);ctx.rect(O[0]-16,O[1]-230,32,460);paint(C.part,C.ink);
    ctx.beginPath();ctx.rect(O[0]-160,O[1]-6,320,12);ctx.rect(O[0]-6,O[1]-220,12,440);paint(C.hi,C.ink);
    if(this.trail.length>1){ctx.save();ctx.strokeStyle=C.steel;ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(...this.trail[0]);for(const p of this.trail)ctx.lineTo(...p);ctx.stroke();ctx.restore();}
    bar(g.H[0],g.H[1],g.P[0],g.P[1],10,C['brass-fill']);for(const s of [g.H,g.V]){ctx.beginPath();ctx.rect(s[0]-10,s[1]-10,20,20);paint(C.part2,C.ink);}
    circ(g.P[0],g.P[1],6);paint(C.steel,C.ink);label('PENCIL',g.P[0]+12,g.P[1]-10);},
  reads(){return[['Semi-axes',`${this.q} and ${this.p+this.q} mm`],['Sliders','one in each groove']];}});

/* 158 treadle and crank */
reg({num:158,outLabel:'Treadle angle, degrees',Pv:[150,440],O:[420,220],r:60,Lt:220,Lr:215,
  update(phi){const pin=[this.O[0]+this.r*Math.cos(phi),this.O[1]+this.r*Math.sin(phi)];const Q=cc(this.Pv,this.Lt,pin,this.Lr,1);this.g={phi,pin,Q,a:Math.atan2(Q[1]-this.Pv[1],Q[0]-this.Pv[0])};},
  output(){return -this.g.a*180/PI;},
  draw(){const g=this.g,O=this.O,Pv=this.Pv;
    circ(O[0],O[1],130);paint(C.part,C.ink);for(let k=0;k<6;k++){const a=g.phi+k*PI/3;bar(O[0],O[1],O[0]+120*Math.cos(a),O[1]+120*Math.sin(a),8,C.part2);}
    bar(O[0],O[1],g.pin[0],g.pin[1],14,C['steel-fill']);
    const T=[Pv[0]+300*Math.cos(g.a),Pv[1]+300*Math.sin(g.a)];bar(Pv[0],Pv[1],T[0],T[1],20,C['brass-fill']);
    bar(g.Q[0],g.Q[1],g.pin[0],g.pin[1],8,C.part);pivot(g.Q[0],g.Q[1],4);pivot(g.pin[0],g.pin[1],4);pivot(O[0],O[1],6);pivot(Pv[0],Pv[1],6);ground(Pv[0],Pv[1]+12,50);
    label('TREADLE · foot',Pv[0]+150,Pv[1]+50);label('FLYWHEEL',O[0],O[1]-150,'center');},
  reads(){const g=this.g;return[['Treadle angle',`${(-g.a*180/PI).toFixed(1)}°`],['Flywheel turns',`${(g.phi/TAU).toFixed(2)}`]];}});

/* 161 flyball governor */
reg({num:161,outLabel:'Sleeve height, mm',params:[{id:'s',label:'Engine speed',min:0,max:100,step:1,value:60,fmt:v=>v+' %'}],X:400,top:90,L:130,
  update(phi){const th=(18+44*this.P.s/100)*PI/180;const rm=this.L/2*Math.sin(th),ym=this.top+this.L/2*Math.cos(th);const sy=ym+Math.sqrt(70*70-rm*rm);this.g={phi,th,sy};},
  output(){return 300-this.g.sy;},
  draw(){const g=this.g,X=this.X,T=this.top,L=this.L;
    ctx.beginPath();ctx.rect(X-6,T-30,12,420);paint(C.part,C.ink);
    const balls=[0,1].map(k=>{const a=g.phi+k*PI,R=L*Math.sin(g.th);return{x:X+R*Math.cos(a),z:Math.sin(a),y:T+L*Math.cos(g.th),mx:X+R/2*Math.cos(a)};}).sort((a,b)=>a.z-b.z);
    for(const b of balls){ctx.save();ctx.globalAlpha=b.z<0?.55:1;bar(X,T,b.x,b.y,6,C.part2);bar(b.mx,(T+b.y)/2,X,g.sy,5,C.part);circ(b.x,b.y,22+4*b.z);paint(C['brass-fill'],C.ink);ctx.restore();}
    ctx.beginPath();ctx.rect(X-16,g.sy-8,32,24);paint(C['steel-fill'],C.ink);
    const lv=[X+40,g.sy+4];bar(X+12,g.sy+4,560,300+(g.sy-300)*0.6,6,C['steel-fill']);pivot(470,300+(g.sy-300)*0.3,4);
    const open=clamp((g.sy-230)/80,0,1);ctx.beginPath();ctx.rect(560,360,180,50);ctx.rect(560,368,180,34);paint(C.part2,C.ink);ctx.save();ctx.translate(650,385);ctx.rotate(-PI/2+open*PI/2);ctx.beginPath();ctx.rect(-3,-17,6,34);paint(C.steel,C.ink);ctx.restore();
    bar(560,300+(g.sy-300)*0.6,650,385,4,C.part);
    ctx.beginPath();ctx.moveTo(X-40,480);ctx.lineTo(X+40,480);ctx.lineTo(X+20,440);ctx.lineTo(X-20,440);ctx.closePath();paint(C.part2,C.ink);
    label('THROTTLE VALVE',650,430,'center');label('SLEEVE',X-30,g.sy+4,'right');},
  reads(){const g=this.g,open=clamp((g.sy-230)/80,0,1);return[['Ball angle',`${(g.th*180/PI).toFixed(0)}°`],['Throttle',`${(open*100).toFixed(0)} % open`],['Rule','faster spin closes the valve']];}});

/* 211 Geneva drive */
reg({num:211,outLabel:'Geneva wheel, turns',D:[290,260],R:100,
  update(phi){const a=mod(phi+PI,TAU)-PI,n=Math.round((phi-a)/TAU),d=this.R*Math.SQRT2,W=[this.D[0]+d,this.D[1]];const pin=[this.D[0]+this.R*Math.cos(phi),this.D[1]+this.R*Math.sin(phi)];let w;
    if(Math.abs(a)<PI/4){let b=Math.atan2(pin[1]-W[1],pin[0]-W[0]);b=mod(b,TAU);w=-n*PI/2+(b-PI);}else if(a>=PI/4)w=-n*PI/2-PI/4;else w=-n*PI/2+PI/4;
    this.g={phi,W,pin,w,eng:Math.abs(a)<PI/4};},
  output(){return -this.g.w/TAU;},
  draw(){const g=this.g,D=this.D,W=g.W,R=this.R,d=R*Math.SQRT2,rl=72;
    const pts=[];for(let i=0;i<360;i++){const t=i/360*TAU;let r=R+2;for(let k=0;k<4;k++){const ca=g.w+PI/4+k*PI/2,cx=W[0]+d*Math.cos(ca),cy=W[1]+d*Math.sin(ca);
        const ux=Math.cos(t),uy=Math.sin(t),ox=W[0]-cx,oy=W[1]-cy,bq=ox*ux+oy*uy,cq=ox*ox+oy*oy-(rl+3)**2,disc=bq*bq-cq;if(disc>0){const t1=-bq-Math.sqrt(disc);if(t1>0&&t1<r)r=t1;}}
      pts.push([W[0]+r*Math.cos(t),W[1]+r*Math.sin(t)]);}
    poly(pts);ctx.closePath();paint(C['steel-fill'],C.ink);
    for(let k=0;k<4;k++){const a=g.w+PI+k*PI/2;ctx.save();ctx.translate(W[0],W[1]);ctx.rotate(a);ctx.beginPath();ctx.rect(d-R-12,-9,R+30,18);ctx.fillStyle=C.sheet;ctx.fill();ctx.strokeStyle=C.ink;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(R+20,-9);ctx.lineTo(d-R-3,-9);ctx.arc(d-R-3,0,9,-PI/2,PI/2,true);ctx.lineTo(R+20,9);ctx.stroke();ctx.restore();}
    pivot(W[0],W[1],6);
    const cut=g.phi;ctx.beginPath();ctx.arc(D[0],D[1],rl,cut+0.9,cut-0.9+TAU);ctx.arc(D[0]+R*Math.cos(cut)*0.75,D[1]+R*Math.sin(cut)*0.75,42,cut+PI-0.75,cut+PI+0.75,true);ctx.closePath();paint(C['brass-fill'],C.ink);
    bar(D[0],D[1],g.pin[0],g.pin[1],18,C['brass-fill']);circ(g.pin[0],g.pin[1],8);paint(C.part2,C.ink);pivot(D[0],D[1],6);
    label(g.eng?'PIN DRIVING':'WHEEL LOCKED',W[0],W[1]+140,'center');label('DRIVER',D[0],D[1]+140,'center');},
  reads(){const g=this.g;return[['Slots','4'],['Per driver turn','¼ turn'],['Phase',g.eng?'moving':'locked'],['Wheel angle',`${mod(-g.w*180/PI,360).toFixed(0)}°`]];}});

/* 231 drag link */
reg({num:231,outLabel:'Output lead / lag, degrees',A:[340,270],D:[390,270],a:120,b:130,c:120,
  update(phi){const B=[this.A[0]+this.a*Math.cos(phi),this.A[1]+this.a*Math.sin(phi)];const c1=cc(B,this.b,this.D,this.c,1),c2=cc(B,this.b,this.D,this.c,-1);const prev=this.g&&this.g.C;let C2=c1;
    if(prev){if(Math.hypot(c2[0]-prev[0],c2[1]-prev[1])<Math.hypot(c1[0]-prev[0],c1[1]-prev[1]))C2=c2;}else{const t1=Math.atan2(c1[1]-this.D[1],c1[0]-this.D[0]);C2=Math.cos(t1-phi)>0?c1:c2;}
    let t=Math.atan2(C2[1]-this.D[1],C2[0]-this.D[0]);t+=TAU*Math.round((phi-t)/TAU);this.g={phi,B,C:C2,t};},
  output(){return (this.g.t-this.g.phi)*180/PI;},
  draw(){const g=this.g,A=this.A,D=this.D;
    circ(A[0],A[1],this.a+10);paint(null,C.rule,1);circ(D[0],D[1],this.c+10);paint(null,C.rule,1);
    bar(A[0],A[1],g.B[0],g.B[1],16,C['brass-fill']);bar(D[0],D[1],g.C[0],g.C[1],16,C['steel-fill']);bar(g.B[0],g.B[1],g.C[0],g.C[1],10,C.part);
    for(const p of [g.B,g.C])pivot(p[0],p[1],5);pivot(A[0],A[1],6);pivot(D[0],D[1],6);ground(365,300,90);label('INPUT · steady',A[0]-150,A[1]-150);label('OUTPUT · uneven',D[0]+100,D[1]+150);},
  reads(){const g=this.g;return[['Lead / lag',`${((g.t-g.phi)*180/PI).toFixed(1)}°`],['Both cranks','turn all the way round']];}});

/* 232 ratchet and pawl */
reg({num:232,outLabel:'Wheel angle, degrees',N:20,
  reset(){this.W=0;this.lim=null;this.lastq=null;},
  update(phi){const p=TAU/this.N,a=0.42*Math.sin(phi);const q=a-this.W;if(this.lastq===null){this.lim=Math.ceil(q/p)*p;}
    if(this.lastq!==null&&q>this.lastq){if(q>this.lim){this.W+=q-this.lim;}}else{this.lim=Math.ceil((q-1e-6)/p)*p;}this.lastq=a-this.W;this.g={phi,a};},
  output(){return this.W*180/PI;},
  prof(rel){const p=TAU/this.N;return 92+20*(mod(-rel,p)/p);},
  draw(){const g=this.g,Cc=[400,300],p=TAU/this.N;const pts=[];for(let i=0;i<this.N;i++){const f=this.W+i*p-PI/2;pts.push([Cc[0]+92*Math.cos(f),Cc[1]+92*Math.sin(f)]);pts.push([Cc[0]+112*Math.cos(f-p+0.01),Cc[1]+112*Math.sin(f-p+0.01)]);}
    const ring=[];for(let i=0;i<this.N;i++){const f=this.W+i*p-PI/2;ring.push([Cc[0]+112*Math.cos(f-0.005),Cc[1]+112*Math.sin(f-0.005)]);ring.push([Cc[0]+92*Math.cos(f),Cc[1]+92*Math.sin(f)]);}
    ring.reverse();poly(ring);ctx.closePath();circ(Cc[0],Cc[1],12,false);paint(C['steel-fill'],C.ink);
    for(let k=0;k<4;k++){const a=this.W+k*PI/2;circ(Cc[0]+52*Math.cos(a),Cc[1]+52*Math.sin(a),12);paint(C.sheet,C.ink);}
    const arm=g.a-PI/2;bar(Cc[0],Cc[1],Cc[0]+220*Math.cos(arm),Cc[1]+220*Math.sin(arm),18,C['brass-fill']);
    const pv=[Cc[0]+150*Math.cos(arm-0.32),Cc[1]+150*Math.sin(arm-0.32)],rel=arm-(this.W-PI/2),rt=this.prof(rel)+2,tip=[Cc[0]+rt*Math.cos(arm),Cc[1]+rt*Math.sin(arm)];
    bar(pv[0],pv[1],tip[0],tip[1],10,C.part2);springZ(pv[0],pv[1],Cc[0]+200*Math.cos(arm-0.1),Cc[1]+200*Math.sin(arm-0.1),8,4);pivot(pv[0],pv[1],4);
    const cp=[Cc[0]+150,Cc[1]-40],ca=Math.atan2(cp[1]-Cc[1],cp[0]-Cc[0])-0.35,crel=ca-(this.W-PI/2),cr=this.prof(crel)+2;bar(cp[0],cp[1],Cc[0]+cr*Math.cos(ca),Cc[1]+cr*Math.sin(ca),10,C.part);pivot(cp[0],cp[1],5);ground(cp[0],cp[1]+14,30);
    pivot(Cc[0],Cc[1],6);label('PAWL',pv[0]-30,pv[1]-14,'right');label('HOLDING CLICK',cp[0]+20,cp[1]-20);label('LEVER',Cc[0]+220*Math.cos(arm)+10,Cc[1]+220*Math.sin(arm));},
  reads(){return[['Wheel turned',`${(this.W*180/PI).toFixed(0)}°`],['Teeth',`${this.N}`],['Rule','turns one way only']];}});

/* 246 pantograph */
reg({num:246,outLabel:'Pencil x, mm',O:[130,440],k:2.4,L:290,
  reset(){this.trail=[];this.ttrail=[];},
  fig(t){const c=[500,230],r=95+28*Math.cos(5*t);return[c[0]+r*Math.cos(t),c[1]+r*Math.sin(t)];},
  update(phi){const O=this.O,P=this.fig(phi),T=[O[0]+(P[0]-O[0])/this.k,O[1]+(P[1]-O[1])/this.k],A=cc(O,this.L,P,this.L,-1);this.g={phi,P,T,A};
    this.trail=this.trail||[];this.ttrail=this.ttrail||[];this.trail.push(P);this.ttrail.push(T);if(this.trail.length>500){this.trail.shift();this.ttrail.shift();}},
  output(){return this.g.P[0];},
  draw(){const g=this.g,O=this.O,k=this.k,B=[O[0]+(g.A[0]-O[0])/k,O[1]+(g.A[1]-O[1])/k],Cc=[g.A[0]+(g.P[0]-g.A[0])/k,g.A[1]+(g.P[1]-g.A[1])/k];
    ctx.save();ctx.strokeStyle=C.rule;ctx.lineWidth=1;ctx.setLineDash([4,4]);for(const sc of [1,1/k]){ctx.beginPath();for(let i=0;i<=200;i++){const p=this.fig(i/200*TAU),q=[O[0]+(p[0]-O[0])*sc,O[1]+(p[1]-O[1])*sc];i?ctx.lineTo(...q):ctx.moveTo(...q);}ctx.stroke();}ctx.restore();
    for(const [tr,col] of [[this.trail,C.steel],[this.ttrail,C.brass]]){if(tr.length>1){ctx.save();ctx.strokeStyle=col;ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(...tr[0]);for(const p of tr)ctx.lineTo(...p);ctx.stroke();ctx.restore();}}
    bar(O[0],O[1],g.A[0],g.A[1],9,C.part);bar(g.A[0],g.A[1],g.P[0],g.P[1],9,C.part);bar(B[0],B[1],g.T[0],g.T[1],7,C.part2);bar(g.T[0],g.T[1],Cc[0],Cc[1],7,C.part2);
    for(const p of [g.A,B,Cc])pivot(p[0],p[1],4);pivot(O[0],O[1],6);ground(O[0],O[1]+12,40);
    circ(g.T[0],g.T[1],7);paint(C.brass,C.ink);circ(g.P[0],g.P[1],7);paint(C.steel,C.ink);label('TRACER',g.T[0]+12,g.T[1]+16);label('PENCIL',g.P[0]+12,g.P[1]-14);},
  reads(){return[['Scale',`× ${this.k}`],['Rule','pivot, tracer and pencil stay in line']];}});

/* 254 sprocket and chain */
reg({num:254,outLabel:'Chain travel, mm',
  update(phi){this.g={phi,s:70*phi};},output(){return this.g.s;},
  draw(){const g=this.g,A=[240,260],B=[570,260],r1=70,r2=46;const pts=beltPoly(A[0],A[1],r1+4,B[0],B[1],r2+4,false,3),ap=alongPoly(pts);
    drawGear(A[0],A[1],r1,22,g.phi,C['brass-fill'],{bore:8});drawGear(B[0],B[1],r2,14,g.phi*r1/r2,C['steel-fill'],{bore:7});
    const pitch=ap.total/Math.round(ap.total/20);for(let s=0;s<ap.total;s+=pitch){const q=ap.at(s+g.s),q2=ap.at(s+g.s+pitch);ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=7;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(q[0],q[1]);ctx.lineTo(q2[0],q2[1]);ctx.stroke();ctx.strokeStyle=C.part2;ctx.lineWidth=4;ctx.stroke();ctx.restore();circ(q[0],q[1],3);paint(C.hi,C.ink,1);}
    pivot(A[0],A[1],6);pivot(B[0],B[1],6);label('22 TEETH',A[0],A[1]+110,'center');label('14 TEETH',B[0],B[1]+110,'center');},
  reads(v){return[['Ratio','22 : 14'],['Chain speed',`${v.toFixed(0)} mm/s`],['Slip','none: teeth engage the links']];}});

/* 288 anchor escapement */
reg({num:288,outLabel:'Pendulum angle, degrees',N:30,
  update(phi){const th=0.13*Math.sin(phi);const u=phi/PI+0.5,k=Math.floor(u),f=u-k,s=clamp((f-0.42)/0.14,0,1);const st=s*s*(3-2*s);this.g={phi,th,W:-(k+st)*(TAU/this.N)/2};},
  output(){return this.g.th*180/PI;},
  draw(){const g=this.g,E=[400,330],A=[400,170],R=105,N=this.N;
    ctx.save();ctx.translate(A[0],A[1]);ctx.rotate(g.th);bar(0,0,0,330,6,C.part);circ(0,330,26);paint(C['brass-fill'],C.ink);ctx.restore();
    const pts=[];for(let i=0;i<N;i++){const a=g.W+i*TAU/N;pts.push([E[0]+82*Math.cos(a),E[1]+82*Math.sin(a)]);pts.push([E[0]+R*Math.cos(a+0.12),E[1]+R*Math.sin(a+0.12)]);pts.push([E[0]+80*Math.cos(a+TAU/N*0.8),E[1]+80*Math.sin(a+TAU/N*0.8)]);}
    poly(pts);ctx.closePath();circ(E[0],E[1],10,false);for(let k=0;k<5;k++){const a=g.W+k*TAU/5;circ(E[0]+46*Math.cos(a),E[1]+46*Math.sin(a),13,false);}paint(C['steel-fill'],C.ink);pivot(E[0],E[1],6);
    ctx.save();ctx.translate(A[0],A[1]);ctx.rotate(g.th);const L=[-92,150],Rr=[92,150];
    ctx.beginPath();ctx.moveTo(0,-14);ctx.quadraticCurveTo(-60,10,L[0],L[1]-30);ctx.lineTo(L[0]+6,L[1]+4);ctx.lineTo(L[0]+18,L[1]-6);ctx.quadraticCurveTo(-40,30,0,14);ctx.quadraticCurveTo(40,30,Rr[0]-18,Rr[1]-6);ctx.lineTo(Rr[0]-6,Rr[1]+4);ctx.lineTo(Rr[0],Rr[1]-30);ctx.quadraticCurveTo(60,10,0,-14);ctx.closePath();paint(C['brass-fill'],C.ink);ctx.restore();
    pivot(A[0],A[1],6);ground(A[0],A[1]-10,60,true);label('ANCHOR',A[0]+110,A[1]+40);label('ESCAPE WHEEL',E[0]+120,E[1]+60);label('PENDULUM',A[0]+30,A[1]+300);},
  reads(){const g=this.g;return[['Pendulum',`${(g.th*180/PI).toFixed(1)}°`],['Per swing','wheel releases half a tooth'],['Escape wheel',`${mod(-g.W*180/PI,360).toFixed(0)}°`]];}});

/* 315 conical pendulum */
reg({num:315,outLabel:'Bob x position, mm',
  update(phi){this.g={phi};},output(){return 300*Math.sin(0.42)*Math.cos(this.g.phi);},
  draw(){const g=this.g,P=[400,70],L=320,al=0.42,R=L*Math.sin(al),Y=P[1]+L*Math.cos(al),tilt=0.32;
    ctx.save();ctx.strokeStyle=C.rule;ctx.setLineDash([4,4]);ctx.beginPath();ctx.ellipse(P[0],Y,R,R*tilt,0,0,TAU);ctx.stroke();ctx.restore();
    const x=P[0]+R*Math.cos(g.phi),z=Math.sin(g.phi),y=Y+R*tilt*z;
    ctx.beginPath();ctx.rect(P[0]-6,20,12,150);paint(C.part,C.ink);const arm=[P[0]+60*Math.cos(g.phi),140+60*tilt*z];bar(P[0],140,arm[0],arm[1],7,C['brass-fill']);
    ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(P[0],P[1]);ctx.lineTo(x,y);ctx.stroke();ctx.restore();
    circ(x,y,20+4*z);paint(C['steel-fill'],C.ink);pivot(P[0],P[1],5);ground(P[0],20,60,true);label('BOB SWEEPS A CONE',P[0]+R+20,Y);label('DRIVING ARM',arm[0]+16,arm[1]);},
  reads(v){return[['Motion','steady circle, no ticking'],['Bob speed',`${Math.abs(v).toFixed(0)} mm/s (x)`]];}});

/* 329 Tusi couple */
reg({num:329,outLabel:'Slide position, mm',O:[400,270],
  update(phi){this.g={phi,C:[this.O[0]+75*Math.cos(phi),this.O[1]+75*Math.sin(phi)],P:[this.O[0]+150*Math.cos(phi),this.O[1]]};},output(){return this.g.P[0]-this.O[0];},
  draw(){const g=this.g,O=this.O;poly(gearPts(O[0],O[1],150,60,PI/60,true));ctx.closePath();circ(O[0],O[1],150+6.25+16,false);paint(C.part2,C.ink);
    ctx.save();ctx.strokeStyle=C.steel;ctx.setLineDash([6,4]);ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(O[0]-150,O[1]);ctx.lineTo(O[0]+150,O[1]);ctx.stroke();ctx.restore();
    drawGear(g.C[0],g.C[1],75,30,-g.phi,C['brass-fill'],{bore:8});bar(O[0],O[1],g.C[0],g.C[1],12,C.part);
    bar(g.P[0],g.P[1],g.P[0]+230,g.P[1],8,C['steel-fill']);ctx.beginPath();ctx.rect(g.P[0]+230-20,O[1]-16,40,32);paint(C['steel-fill'],C.ink);
    circ(g.P[0],g.P[1],7);paint(C.steel,C.ink);pivot(g.C[0],g.C[1],5);pivot(O[0],O[1],6);label('POINT MOVES IN A STRAIGHT LINE',O[0],O[1]+200,'center');},
  reads(){const g=this.g;return[['Inner gear','half the ring size'],['Slide',`${(g.P[0]-this.O[0]).toFixed(0)} mm`],['Stroke','= ring diameter']];}});

/* 335 Watt's linkage */
reg({num:335,outLabel:'Midpoint sideways error, mm',A:[170,190],D:[630,350],l:200,c:150,
  reset(){this.trail=[];},
  update(phi){const a=0.32*Math.sin(phi),B=[this.A[0]+this.l*Math.cos(a),this.A[1]+this.l*Math.sin(a)];const Cc=cc(this.D,this.l,B,this.c,1);const M=[(B[0]+Cc[0])/2,(B[1]+Cc[1])/2];this.g={phi,B,Cc,M};this.trail=this.trail||[];this.trail.push(M);if(this.trail.length>300)this.trail.shift();},
  output(){return this.g.M[0]-400;},
  draw(){const g=this.g;ctx.save();ctx.strokeStyle=C.rule;ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(400,60);ctx.lineTo(400,480);ctx.stroke();ctx.restore();
    if(this.trail.length>1){ctx.save();ctx.strokeStyle=C.steel;ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(...this.trail[0]);for(const p of this.trail)ctx.lineTo(...p);ctx.stroke();ctx.restore();}
    bar(this.A[0],this.A[1],g.B[0],g.B[1],14,C['brass-fill']);bar(this.D[0],this.D[1],g.Cc[0],g.Cc[1],14,C.part);bar(g.B[0],g.B[1],g.Cc[0],g.Cc[1],12,C.part2);
    circ(g.M[0],g.M[1],7);paint(C.steel,C.ink);for(const p of [g.B,g.Cc])pivot(p[0],p[1],5);for(const p of [this.A,this.D]){pivot(p[0],p[1],7);ground(p[0],p[1]+12,40);}
    label('MIDPOINT · near-straight line',g.M[0]+16,g.M[1]-10);},
  reads(){const g=this.g;return[['Sideways error',`${(g.M[0]-400).toFixed(2)} mm`],['Travel',`${(g.M[1]-270).toFixed(0)} mm`]];}});

/* 344 oscillating engine */
reg({num:344,outLabel:'Cylinder angle, degrees',O:[560,260],T:[250,260],r:65,
  update(phi){const pin=[this.O[0]+this.r*Math.cos(phi),this.O[1]+this.r*Math.sin(phi)];const a=Math.atan2(pin[1]-this.T[1],pin[0]-this.T[0]);this.g={phi,pin,a,d:Math.hypot(pin[0]-this.T[0],pin[1]-this.T[1])};},
  output(){return this.g.a*180/PI;},
  draw(){const g=this.g,O=this.O,T=this.T;circ(O[0],O[1],120);paint(C.part,C.ink);for(let k=0;k<5;k++){const a=g.phi+k*TAU/5;bar(O[0],O[1],O[0]+110*Math.cos(a),O[1]+110*Math.sin(a),8,C.part2);}
    bar(O[0],O[1],g.pin[0],g.pin[1],16,C['brass-fill']);
    ctx.save();ctx.translate(T[0],T[1]);ctx.rotate(g.a);ctx.beginPath();ctx.rect(-90,-44,250,88);ctx.rect(-80,-34,230,68);paint(C.part2,C.ink);ctx.beginPath();ctx.rect(g.d-250-15,-34,30,68);paint(C['steel-fill'],C.ink);bar(g.d-235,0,g.d,0,10,C.part);ctx.restore();
    pivot(g.pin[0],g.pin[1],5);pivot(O[0],O[1],6);circ(T[0],T[1],14);paint(C.hi,C.ink);pivot(T[0],T[1],5);ground(T[0],T[1]+60,60);ctx.beginPath();ctx.rect(T[0]-8,T[1]+14,16,46);paint(C.part2,C.ink);
    label('CYLINDER ROCKS ON TRUNNIONS',T[0],T[1]-90,'center');},
  reads(){const g=this.g;return[['Cylinder angle',`${(g.a*180/PI).toFixed(1)}°`],['Piston stroke',`${2*this.r} mm`],['Valve','set by the rocking itself']];}});

/* 359 pump drill */
reg({num:359,outLabel:'Spindle angle, turns',
  update(phi){const c=Math.floor(phi/TAU),f=phi/TAU-c;const s=(c%2?-1:1)*2*(1-Math.cos(f*PI))+(c%2?2:0)*0;const base=0;this.g={phi,y:180+120*(1-Math.cos(phi))/2,spin:(c%2?-1:1)*1.6*(1-Math.cos(f*PI))};},
  output(){return this.g.spin;},
  draw(){const g=this.g,X=400,a=g.spin*TAU;
    ctx.beginPath();ctx.rect(X-6,60,12,390);paint(C.part,C.ink);ctx.beginPath();ctx.moveTo(X-6,450);ctx.lineTo(X,480);ctx.lineTo(X+6,450);paint(C['steel-fill'],C.ink);
    ctx.beginPath();ctx.ellipse(X,360,110,22,0,0,TAU);paint(C['steel-fill'],C.ink);ctx.save();ctx.strokeStyle=C.ink;for(let k=0;k<8;k++){const t=a+k*PI/4;if(Math.sin(t)>0){ctx.globalAlpha=Math.sin(t);ctx.beginPath();ctx.moveTo(X+110*Math.cos(t),360+22*Math.sin(t)-4);ctx.lineTo(X+110*Math.cos(t),360+22*Math.sin(t)+4);ctx.stroke();}}ctx.restore();
    const tw=Math.sin(a)*14;ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(X-150,g.y);ctx.quadraticCurveTo(X-40,110,X+tw,66);ctx.moveTo(X+150,g.y);ctx.quadraticCurveTo(X+40,110,X-tw,66);ctx.stroke();ctx.restore();
    ctx.beginPath();ctx.rect(X-160,g.y-8,320,16);paint(C['brass-fill'],C.ink);hatchRect(X-120,480,240,30,C.part2);
    label('CROSS BAR · push down, let rise',X+170,g.y);label('FLYWHEEL',X+120,360);},
  reads(){const g=this.g;return[['Spindle',`${g.spin.toFixed(2)} turns`],['Direction','reverses every stroke']];}});

/* 430 overshot water wheel */
reg({num:430,outLabel:'Wheel turns',
  update(phi){this.g={phi:phi*0.5};},output(){return this.g.phi/TAU;},
  draw(){const g=this.g,Cc=[430,300],R=170,n=16;
    ctx.beginPath();ctx.rect(60,95,330,18);paint(C.part2,C.ink);ctx.beginPath();ctx.rect(60,82,330,13);paint(C['steel-fill'],null);
    circ(Cc[0],Cc[1],R);circ(Cc[0],Cc[1],R-28,false);paint(C.part,C.ink);for(let k=0;k<8;k++){const a=g.phi+k*PI/4;bar(Cc[0],Cc[1],Cc[0]+(R-28)*Math.cos(a),Cc[1]+(R-28)*Math.sin(a),8,C.part2);}
    for(let k=0;k<n;k++){const a=g.phi+k*TAU/n,x=Cc[0]+R*Math.cos(a),y=Cc[1]+R*Math.sin(a);ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.beginPath();ctx.moveTo(-28,-10);ctx.lineTo(0,-14);ctx.lineTo(0,14);paint(null,C.ink,2);
      const am=mod(a+PI,TAU)-PI;const fill=am>-1.4&&am<1.2?clamp((am+1.4)/0.6,0,1)*clamp((1.2-am)/0.5,0,1):0;if(fill>0){ctx.beginPath();ctx.rect(-26,-10,24,20*fill);ctx.fillStyle=C['steel-fill'];ctx.fill();}ctx.restore();}
    ctx.save();ctx.fillStyle=C['steel-fill'];ctx.beginPath();ctx.moveTo(390,90);ctx.quadraticCurveTo(440,96,450,140);ctx.lineTo(436,140);ctx.quadraticCurveTo(428,104,390,104);ctx.fill();ctx.restore();
    pivot(Cc[0],Cc[1],8);ctx.beginPath();ctx.rect(40,470,720,40);ctx.fillStyle=C['steel-fill'];ctx.fill();label('FLUME',120,70);label('WATER FILLS THE DESCENDING BUCKETS',600,140);},
  reads(v){return[['Wheel speed',rpmOf(v)],['Power from','the weight of the water']];}});

/* 443 Archimedes' screw */
reg({num:443,outLabel:'Water lifted, turns',
  update(phi){this.g={phi};},output(){return this.g.phi/TAU;},
  draw(){const g=this.g,A=[150,440],B=[650,150],ang=Math.atan2(B[1]-A[1],B[0]-A[0]),Lx=Math.hypot(B[0]-A[0],B[1]-A[1]),r=46,P=80,sh=mod(g.phi/TAU*P,P);
    ctx.beginPath();ctx.rect(40,450,240,60);ctx.fillStyle=C['steel-fill'];ctx.fill();
    ctx.save();ctx.translate(A[0],A[1]);ctx.rotate(ang);
    ctx.beginPath();ctx.rect(0,-r,Lx,2*r);paint(C.part,C.ink);
    for(let x=-P+sh;x<Lx;x+=P){ctx.save();ctx.beginPath();ctx.rect(0,-r,Lx,2*r);ctx.clip();ctx.beginPath();ctx.ellipse(x+P*0.32,r*0.55,P*0.22,r*0.35,0,0,TAU);ctx.fillStyle=C['steel-fill'];ctx.fill();ctx.restore();}
    ctx.save();ctx.beginPath();ctx.rect(0,-r,Lx,2*r);ctx.clip();ctx.strokeStyle=C.ink;ctx.lineWidth=2;for(let x=-P+sh;x<Lx+P;x+=P){ctx.beginPath();ctx.moveTo(x,-r);ctx.bezierCurveTo(x+P*0.2,-r*0.3,x+P*0.3,r*0.3,x+P*0.5,r);ctx.stroke();}ctx.restore();
    ctx.beginPath();ctx.rect(0,-r,Lx,2*r);paint(null,C.ink,1.6);bar(-30,0,0,0,10,C.part2);bar(Lx,0,Lx+40,0,10,C.part2);ctx.restore();
    circ(B[0]+30,B[1]-20,30);paint(C['brass-fill'],C.ink);bar(B[0]+30,B[1]-20,B[0]+30+26*Math.cos(g.phi),B[1]-20+26*Math.sin(g.phi),6,C.part2);
    ctx.beginPath();ctx.rect(640,170,140,24);paint(C.part2,C.ink);ctx.save();ctx.fillStyle=C['steel-fill'];ctx.fillRect(650,160,120,10);ctx.restore();
    label('LOW WATER',150,500,'center');label('OUTLET',710,215,'center');label('POCKETS OF WATER CLIMB AS IT TURNS',260,180);},
  reads(v){return[['Screw speed',rpmOf(v)],['Per turn','one pocket delivered']];}});

/* 448 lift pump */
reg({num:448,outLabel:'Piston height, mm',
  update(phi){this.g={phi,y:300-110*(1-Math.cos(phi))/2,up:Math.sin(phi)>0};},output(){return 300-this.g.y;},
  draw(){const g=this.g,X=380;
    ctx.beginPath();ctx.rect(X-60,140,12,300);ctx.rect(X+48,140,12,300);paint(C.part2,C.ink);ctx.beginPath();ctx.rect(X-10,440,20,60);paint(C.part2,C.ink);
    ctx.save();ctx.fillStyle=C['steel-fill'];ctx.fillRect(X-48,170,96,g.y-170);ctx.fillRect(X-48,g.y+20,96,420-g.y);ctx.fillRect(X-10,440,20,60);ctx.fillRect(200,490,400,30);ctx.restore();
    ctx.beginPath();ctx.rect(X-48,g.y,96,20);paint(C['brass-fill'],C.ink);
    ctx.save();ctx.translate(X,g.y);ctx.rotate(g.up?0:-0.7);ctx.beginPath();ctx.rect(0,-2,30,4);paint(C.steel,C.ink);ctx.restore();
    ctx.save();ctx.translate(X-30,430);ctx.rotate(g.up?-0.7:0);ctx.beginPath();ctx.rect(0,-2,60,4);paint(C.steel,C.ink);ctx.restore();
    bar(X,g.y,X,90,8,C.part);const hp=[X+90,110];const ha=Math.atan2(90-hp[1],X-hp[0]);bar(X-6,90,560,90+(90-g.y+190)*0.15,10,C['brass-fill']);
    ctx.beginPath();ctx.rect(X-110,170,62,14);paint(C.part2,C.ink);if(g.up){ctx.save();ctx.fillStyle=C['steel-fill'];ctx.beginPath();ctx.moveTo(X-110,176);ctx.quadraticCurveTo(X-140,200,X-136,300);ctx.lineTo(X-126,300);ctx.quadraticCurveTo(X-128,210,X-104,184);ctx.fill();ctx.restore();}
    label(g.up?'UPSTROKE · water lifted out':'DOWNSTROKE · piston valve opens',X+90,g.y);label('FOOT VALVE',X+70,430);label('WELL',400,512,'center');},
  reads(){const g=this.g;return[['Stroke',g.up?'up':'down'],['Piston valve',g.up?'closed':'open'],['Foot valve',g.up?'open':'closed']];}});

/* 466 hydraulic press */
reg({num:466,outLabel:'Ram height, mm',params:[{id:'R',label:'Ram diameter',min:60,max:160,step:10,value:120,fmt:v=>v+' mm (plunger 24)'}],
  reset(){this.ram=0;this.lastY=null;},
  update(phi){const y=60*(1-Math.cos(phi))/2;if(this.lastY!==null&&y>this.lastY){this.ram+=(y-this.lastY)*(24/this.P.R)**2*6;}if(this.ram>120)this.ram=0;this.lastY=y;this.g={phi,y};},
  output(){return this.ram;},
  draw(){const g=this.g,R=this.P.R,X=520,top=330-this.ram;
    ctx.save();ctx.fillStyle=C['steel-fill'];ctx.fillRect(170,440,X-170,20);ctx.restore();ctx.beginPath();ctx.rect(170,440,X-170,20);paint(null,C.ink);
    ctx.beginPath();ctx.rect(X-R/2-10,200,R+20,260);paint(C.part2,C.ink);ctx.save();ctx.fillStyle=C['steel-fill'];ctx.fillRect(X-R/2,top+60,R,400-top-60+40);ctx.restore();
    ctx.beginPath();ctx.rect(X-R/2,top-60,R,120);paint(C['brass-fill'],C.ink);ctx.beginPath();ctx.rect(X-100,top-80,200,20);paint(C['steel-fill'],C.ink);
    ctx.beginPath();ctx.rect(X-110,60,220,20);paint(C.part2,C.ink);for(const gx of [X-110,X+90]){ctx.beginPath();ctx.rect(gx,80,20,400);paint(C.part,C.ink);}
    const px=200,py=300+g.y;ctx.beginPath();ctx.rect(px-22,280,44,180);paint(C.part2,C.ink);ctx.save();ctx.fillStyle=C['steel-fill'];ctx.fillRect(px-12,py+40,24,440-py-40);ctx.restore();
    ctx.beginPath();ctx.rect(px-12,py-40,24,80);paint(C['brass-fill'],C.ink);bar(px,py-40,px+0,230,8,C.part);bar(110,250,px+120,230-(g.y-30)*1.4,10,C['brass-fill']);pivot(110,250,6);
    label('PLUNGER',px-30,260,'right');label('RAM',X+R/2+16,top);label(`FORCE × ${((R/24)**2).toFixed(0)}`,X,40,'center');},
  reads(){return[['Force multiplier',`× ${((this.P.R/24)**2).toFixed(0)}`],['Ram rise per stroke',`${(60*(24/this.P.R)**2*6).toFixed(1)} mm`],['Ram height',`${this.ram.toFixed(0)} mm`]];}});

/* 485 windmill */
reg({num:485,outLabel:'Sail turns',
  update(phi){this.g={phi};},output(){return this.g.phi/TAU;},
  draw(){const g=this.g,H=[400,170];ctx.beginPath();ctx.moveTo(340,500);ctx.lineTo(370,200);ctx.lineTo(430,200);ctx.lineTo(460,500);ctx.closePath();paint(C.part,C.ink);ctx.beginPath();ctx.moveTo(360,200);ctx.quadraticCurveTo(400,140,440,200);ctx.closePath();paint(C.part2,C.ink);
    for(let k=0;k<4;k++){const a=g.phi+k*PI/2;ctx.save();ctx.translate(H[0],H[1]);ctx.rotate(a);bar(0,0,200,0,8,C.part2);ctx.beginPath();ctx.rect(40,4,160,40);paint(C['brass-fill'],C.ink);ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=.8;for(let x=60;x<200;x+=20){ctx.beginPath();ctx.moveTo(x,4);ctx.lineTo(x,44);ctx.stroke();}ctx.restore();ctx.restore();}
    pivot(H[0],H[1],9);ground(400,500,300);},
  reads(v){return[['Sail speed',rpmOf(v)],['Driven by','wind on angled sails']];}});

/* 488 screw propeller */
reg({num:488,outLabel:'Propeller turns',
  update(phi){this.g={phi};},output(){return this.g.phi/TAU;},
  draw(){const g=this.g,Hc=[470,260],R=120;
    ctx.save();ctx.strokeStyle=C['steel-fill'];ctx.lineWidth=2;for(let i=0;i<7;i++){const y=150+i*36;const off=mod(g.phi*40,60);ctx.setLineDash([30,30]);ctx.lineDashOffset=-off;ctx.beginPath();ctx.moveTo(500,y);ctx.lineTo(780,y);ctx.stroke();}ctx.restore();
    ctx.beginPath();ctx.moveTo(20,120);ctx.lineTo(260,120);ctx.quadraticCurveTo(360,140,380,230);ctx.lineTo(380,290);ctx.quadraticCurveTo(360,380,260,400);ctx.lineTo(20,400);ctx.closePath();paint(C.part,C.ink);
    ctx.beginPath();ctx.rect(380,252,80,16);paint(C.part2,C.ink);
    const bl=[0,1,2].map(k=>{const a=g.phi+k*TAU/3;return{a,z:Math.sin(a)};}).sort((p,q)=>p.z-q.z);
    for(const b of bl){const tipY=Hc[1]-R*Math.cos(b.a),w=10+30*Math.abs(Math.sin(b.a));ctx.save();ctx.globalAlpha=b.z<0?.6:1;ctx.beginPath();ctx.moveTo(Hc[0]-8,Hc[1]);ctx.quadraticCurveTo(Hc[0]-w,(Hc[1]+tipY)/2,Hc[0]-4,tipY);ctx.quadraticCurveTo(Hc[0]+w,(Hc[1]+tipY)/2,Hc[0]+8,Hc[1]);ctx.closePath();paint(C['brass-fill'],C.ink);ctx.restore();}
    circ(Hc[0],Hc[1],20);paint(C['brass-fill'],C.ink);label('HULL',120,260,'center');label('WATER PUSHED AFT',640,120,'center');},
  reads(v){return[['Propeller speed',rpmOf(v)],['Blades','3, set at a pitch like a screw']];}});

/* 499 Bourdon gauge */
reg({num:499,outLabel:'Pressure, bar',params:[{id:'m',label:'Peak pressure',min:2,max:10,step:0.5,value:8,fmt:v=>v+' bar'}],
  update(phi){const p=this.P.m*(1-Math.cos(phi))/2;this.g={phi,p};},output(){return this.g.p;},
  draw(){const g=this.g,D=[400,250],f=g.p/10;
    circ(D[0],D[1],210);paint(C.hi,C.ink,2);for(let i=0;i<=50;i++){const a=PI*0.75+i/50*PI*1.5,r1=i%5?192:180;ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=i%5?1:2;ctx.beginPath();ctx.moveTo(D[0]+r1*Math.cos(a),D[1]+r1*Math.sin(a));ctx.lineTo(D[0]+202*Math.cos(a),D[1]+202*Math.sin(a));ctx.stroke();ctx.restore();if(i%5===0)label(String(i/5),D[0]+164*Math.cos(a),D[1]+164*Math.sin(a),'center');}
    const kap=1/120*(1-0.22*f),S=1.35*PI*120;const pts=[];let h=PI,x=D[0]+20,y=D[1]+150;pts.push([x,y]);for(let i=0;i<80;i++){const ds=S/80;h+=kap*ds;x+=Math.cos(h)*ds;y+=Math.sin(h)*ds;pts.push([x,y]);}
    ctx.save();ctx.lineCap='round';ctx.strokeStyle=C.ink;ctx.lineWidth=16;ctx.beginPath();ctx.moveTo(...pts[0]);for(const p of pts)ctx.lineTo(...p);ctx.stroke();ctx.strokeStyle=C['brass-fill'];ctx.lineWidth=12;ctx.stroke();ctx.restore();
    const T=pts[pts.length-1],Sp=[D[0]+40,D[1]+40],sa=-1.9-0.5*f,Se=[Sp[0]+60*Math.cos(sa),Sp[1]+60*Math.sin(sa)];
    bar(T[0],T[1],Se[0],Se[1],5,C.part);ctx.beginPath();ctx.moveTo(Sp[0],Sp[1]);ctx.arc(Sp[0],Sp[1],52,sa+PI-0.3,sa+PI+0.3);ctx.closePath();paint(C['steel-fill'],C.ink);bar(Sp[0],Sp[1],Se[0],Se[1],8,C['steel-fill']);pivot(Sp[0],Sp[1],4);
    ctx.beginPath();ctx.rect(D[0]+8,D[1]+150,26,70);paint(C.part2,C.ink);
    const pa=PI*0.75+f*PI*1.5;bar(D[0]-30*Math.cos(pa),D[1]-30*Math.sin(pa),D[0]+170*Math.cos(pa),D[1]+170*Math.sin(pa),5,C.steel);circ(D[0],D[1],10);paint(C.steel,C.ink);
    label('BOURDON TUBE',D[0]-150,D[1]+30);label('bar',D[0],D[1]+90,'center');},
  reads(){const g=this.g;return[['Pressure',`${g.p.toFixed(2)} bar`],['Tube','straightens as pressure rises'],['Pointer',`${(g.p/10*270).toFixed(0)}° of 270°`]];}});

/* 505 planetary gear */
reg({num:505,outLabel:'Output member, turns',params:[{id:'m',type:'toggle',label:'Hold still',options:[[0,'Ring'],[1,'Sun'],[2,'Carrier']],value:0}],Zs:24,Zp:12,Zr:48,
  update(phi){const m=this.P.m;let s,r,c;if(m===0){s=phi;r=0;c=phi*this.Zs/(this.Zs+this.Zr);}else if(m===1){r=phi;s=0;c=phi*this.Zr/(this.Zs+this.Zr);}else{c=0;s=phi;r=-phi*this.Zs/this.Zr;}
    const p=c-(s-c)*this.Zs/this.Zp;this.g={phi,s,r,c,p,m};},
  output(){const g=this.g;return(g.m===2?g.r:g.c)/TAU;},
  draw(){const g=this.g,O=[400,265],ts=TAU/24,tp=TAU/12,tr=TAU/48;
    poly(gearPts(O[0],O[1],120,48,g.r+tr/2,true));ctx.closePath();circ(O[0],O[1],120+6.25+20,false);paint(g.m===1?C['steel-fill']:(g.m===0?C.part2:C['steel-fill']),C.ink);
    const pc=[0,1,2].map(k=>{const b=g.c+k*TAU/3;return[O[0]+90*Math.cos(b),O[1]+90*Math.sin(b),b];});
    ctx.beginPath();ctx.moveTo(pc[0][0],pc[0][1]);for(const q of pc)ctx.lineTo(q[0],q[1]);ctx.closePath();ctx.lineJoin='round';ctx.save();ctx.lineWidth=26;ctx.strokeStyle=C.ink;ctx.stroke();ctx.lineWidth=22;ctx.strokeStyle=g.m===2?C.part2:C.part;ctx.stroke();ctx.restore();
    drawGear(O[0],O[1],60,24,g.s+ts/2,g.m===1?C.part2:C['brass-fill'],{bore:8});
    pc.forEach((q,k)=>drawGear(q[0],q[1],30,12,g.p+(k*TAU/3),C.hi,{bore:5}));for(const q of pc)pivot(q[0],q[1],4);pivot(O[0],O[1],6);
    const held=['RING HELD','SUN HELD','CARRIER HELD'][g.m],io=[['sun in','carrier out · 3 : 1'],['ring in','carrier out · 1.5 : 1'],['sun in','ring out · reversed 2 : 1']][g.m];
    label(held,O[0],O[1]+170,'center');label(io.join(' → '),O[0],O[1]+190,'center');},
  reads(){const g=this.g;const io=[['Sun','Carrier','3 : 1 slower'],['Ring','Carrier','1.5 : 1 slower'],['Sun','Ring','2 : 1, reversed']][g.m];return[['Input',io[0]],['Output',io[1]],['Ratio',io[2]]];}});
