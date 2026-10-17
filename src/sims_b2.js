/* ================= batch 2 ================= */
const smooth=s=>{s=clamp(s,0,1);return s*s*(3-2*s);};
function alias(num,src,extra){const o=Object.assign({},SIMS_NEW[src],{num},extra||{});o.params=(SIMS_NEW[src].params||[]).map(p=>Object.assign({},p));return reg(o);}
const WATER=()=>C['steel-fill'];
function water(x,y,w,h){ctx.save();ctx.fillStyle=WATER();ctx.fillRect(x,y,w,h);ctx.restore();}
function sawWheel(cx,cy,W,N,rr,rt,fill){const p=TAU/N,pts=[];for(let i=0;i<N;i++){const f=W+i*p;pts.push([cx+rt*Math.cos(f-0.004),cy+rt*Math.sin(f-0.004)]);pts.push([cx+rr*Math.cos(f),cy+rr*Math.sin(f)]);}
  pts.reverse();poly(pts);ctx.closePath();circ(cx,cy,10,false);paint(fill,C.ink);}
function sawR(rel,N,rr,rt){const p=TAU/N;return rr+(rt-rr)*(mod(-rel,p)/p);}
function flywheel(x,y,r,a,fill){circ(x,y,r);paint(fill||C.part,C.ink);const n=6;for(let k=0;k<n;k++){const t=a+k*TAU/n;bar(x+12*Math.cos(t),y+12*Math.sin(t),x+(r-10)*Math.cos(t),y+(r-10)*Math.sin(t),8,C.part2);}circ(x,y,r-10);paint(null,C.ink,1);}

/* 12 single fixed pulley */
reg({num:12,outLabel:'Load height, mm',
  update(phi){this.g={phi,s:110*(1-Math.cos(phi))/2};},output(){return this.g.s;},
  draw(){const g=this.g,P=[400,110],r=40;ctx.beginPath();ctx.rect(300,40,200,14);paint(C.part2,C.ink);bar(P[0],54,P[0],P[1],7,C.part);
    rope([[P[0]-r,P[1]],[P[0]-r,360-g.s]]);rope([[P[0]+r,P[1]],[P[0]+r,300+g.s]]);ctx.beginPath();ctx.arc(P[0],P[1],r,PI,TAU);ctx.strokeStyle=C.ink;ctx.lineWidth=2;ctx.stroke();
    pulley(P[0],P[1],r,g.s/r,C.part);weight(P[0]-r,360-g.s,80,60,'LOAD');ctx.beginPath();ctx.rect(P[0]+r-10,300+g.s,20,30);paint(C['brass-fill'],C.ink);label('PULL',P[0]+r+18,315+g.s);},
  reads(){const g=this.g;return[['Force needed','equal to the load'],['Benefit','pull down to lift up'],['Load raised',`${g.s.toFixed(0)} mm`]];}});

/* 9 cone pulleys */
reg({num:9,outLabel:'Speed ratio',
  reset(){this.a2=0;this.last=0;},
  rad(x){const f=clamp((x-230)/340,0,1);return[30+60*f,90-60*f];},
  update(phi){const xb=400+160*Math.sin(phi/6);const [r1,r2]=this.rad(xb);if(this.last===undefined){this.a2=0;this.last=phi;}this.a2+=(phi-this.last)*r1/r2;this.last=phi;this.g={phi,xb,r1,r2};},
  output(){return this.g.r1/this.g.r2;},
  cone(y,big,a,fill){const x0=230,x1=570,rA=big?30:90,rB=big?90:30;poly([[x0,y-rA],[x1,y-rB],[x1,y+rB],[x0,y+rA]]);ctx.closePath();paint(fill,C.ink);
    ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=1;for(let k=0;k<8;k++){const t=a+k*PI/4;if(Math.cos(t)>0){ctx.globalAlpha=.2+.6*Math.cos(t);ctx.beginPath();ctx.moveTo(x0,y+rA*Math.sin(t));ctx.lineTo(x1,y+rB*Math.sin(t));ctx.stroke();}}ctx.restore();
    bar(170,y,x0,y,12,C.part);bar(x1,y,630,y,12,C.part);},
  draw(){const g=this.g,y1=150,y2=390;this.cone(y1,true,g.phi,C['brass-fill']);this.cone(y2,false,this.a2,C['steel-fill']);
    ctx.beginPath();ctx.rect(g.xb-12,y1+g.r1,24,y2-g.r2-(y1+g.r1));paint(C.part2,C.ink);
    ctx.save();ctx.setLineDash([4,10]);ctx.lineDashOffset=g.phi*g.r1;ctx.strokeStyle=C.ink;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(g.xb,y1+g.r1);ctx.lineTo(g.xb,y2-g.r2);ctx.stroke();ctx.restore();
    label('DRIVER CONE',140,y1-40);label('DRIVEN CONE',140,y2+70);linArrow(g.xb-30,270,Math.cos(g.phi/6)>0?-24:24,C.brass);label('BELT SHIFTS',g.xb+20,270);},
  reads(){const g=this.g;return[['Belt at',`${(g.xb-230).toFixed(0)} mm along`],['Speed ratio',`${(g.r1/g.r2).toFixed(2)} × driver`],['Change','smooth, no steps']];}});

/* 26 crown wheel and pinion */
reg({num:26,outLabel:'Crown wheel, turns',
  update(phi){this.g={phi,c:-phi*12/60};},output(){return -this.g.c/TAU;},
  draw(){const g=this.g,O=[400,300],rx=200,ry=60,N=60;
    bar(O[0],O[1],O[0],500,16,C.part);
    const teeth=k=>{const t=g.c+k*TAU/N;return{x:O[0]+rx*Math.cos(t),y:O[1]+ry*Math.sin(t),z:Math.sin(t)};};
    for(let k=0;k<N;k++){const q=teeth(k);if(q.z<0){ctx.beginPath();ctx.rect(q.x-3,q.y-14,6,14);paint(C['steel-fill'],C.ink,.8);}}
    ctx.beginPath();ctx.ellipse(O[0],O[1],rx,ry,0,0,TAU);ctx.ellipse(O[0],O[1]+16,rx,ry,0,0,PI);paint(C['steel-fill'],C.ink);ctx.beginPath();ctx.ellipse(O[0],O[1],rx,ry,0,0,TAU);paint(C['steel-fill'],C.ink);
    for(let k=0;k<N;k++){const q=teeth(k);if(q.z>=0){ctx.beginPath();ctx.rect(q.x-3,q.y-14,6,14);paint(C['steel-fill'],C.ink,.8);}}
    const P=[O[0],O[1]+ry-14-34];drawGear(P[0],P[1],30,9,-g.phi*1.333,C['brass-fill'],{bore:5});pivot(P[0],P[1],4);
    label('PINION (axle toward you)',P[0]+50,P[1]-20);label('CROWN WHEEL · teeth on its face',O[0]+rx-20,O[1]+90);},
  reads(v){return[['Shafts','at right angles'],['Ratio','12 : 60'],['Crown speed',rpmOf(Math.abs(v))]];}});

/* 28 friction disk drive */
reg({num:28,outLabel:'Wheel speed ratio',params:[{id:'d',label:'Wheel distance from centre',min:30,max:190,step:5,value:120,fmt:v=>v+' mm'}],
  update(phi){this.g={phi,w:phi*this.P.d/40};},output(){return this.P.d/40;},
  draw(){const g=this.g,O=[400,330],rx=220,ry=55,d=this.P.d,rw=40;
    bar(O[0],O[1],O[0],500,14,C.part);ctx.beginPath();ctx.ellipse(O[0],O[1]+14,rx,ry,0,0,PI);ctx.lineTo(O[0]-rx,O[1]);paint(C['brass-fill'],C.ink);ctx.beginPath();ctx.ellipse(O[0],O[1],rx,ry,0,0,TAU);paint(C['brass-fill'],C.ink);
    ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=.8;for(let k=0;k<12;k++){const t=g.phi+k*PI/6;ctx.beginPath();ctx.moveTo(O[0]+30*Math.cos(t),O[1]+30*ry/rx*Math.sin(t));ctx.lineTo(O[0]+rx*Math.cos(t),O[1]+ry*Math.sin(t));ctx.stroke();}ctx.restore();
    const x=O[0]+d;ctx.beginPath();ctx.rect(x-12,O[1]-2*rw,24,2*rw);paint(C['steel-fill'],C.ink);
    ctx.save();ctx.strokeStyle=C.ink;for(let k=0;k<6;k++){const a=g.w+k*PI/3;if(Math.cos(a)>0){ctx.globalAlpha=.3+.7*Math.cos(a);ctx.beginPath();ctx.moveTo(x-12,O[1]-rw+rw*Math.sin(a));ctx.lineTo(x+12,O[1]-rw+rw*Math.sin(a));ctx.stroke();}}ctx.restore();
    bar(x+12,O[1]-rw,760,O[1]-rw,10,C.part);ctx.beginPath();ctx.rect(700,O[1]-rw-18,30,36);paint(C.part2,C.ink);label('SLIDE THE WHEEL TO CHANGE SPEED',x,O[1]-2*rw-20,'center');},
  reads(){return[['Wheel position',`${this.P.d} mm out`],['Wheel speed',`${(this.P.d/40).toFixed(2)} × disk`],['Grip','friction only']];}});

/* 32 friction wheels */
reg({num:32,outLabel:'Driven wheel, turns',
  update(phi){this.g={phi,a2:-phi*90/60};},output(){return -this.g.a2/TAU;},
  draw(){const g=this.g,A=[310,260],B=[310+150,260];
    for(const [P,r,a,f] of [[A,90,g.phi,C['brass-fill']],[B,60,g.a2,C['steel-fill']]]){circ(P[0],P[1],r);paint(f,C.ink);circ(P[0],P[1],r-8);paint(null,C.ink,.8);
      ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=.8;for(let k=0;k<Math.round(r/3);k++){const t=a+k*TAU/Math.round(r/3);ctx.beginPath();ctx.moveTo(P[0]+(r-8)*Math.cos(t),P[1]+(r-8)*Math.sin(t));ctx.lineTo(P[0]+r*Math.cos(t),P[1]+r*Math.sin(t));ctx.stroke();}ctx.restore();
      bar(P[0],P[1],P[0]+(r-20)*Math.cos(a),P[1]+(r-20)*Math.sin(a),6,C.part2);pivot(P[0],P[1],5);}
    label('RUBBER-FACED RIMS',385,400,'center');},
  reads(v){return[['Ratio','90 : 60'],['Teeth','none, grip by friction'],['Driven',rpmOf(Math.abs(v))]];}});

/* 202 worm and wheel (variant) */
alias(202,31,{Z:30});

/* 264 hundred-and-one counter */
reg({num:264,outLabel:'Gain of wheel B, turns',
  update(phi){const w=phi*40;this.g={phi,w,a:w/100,b:w/101};},output(){return (this.g.a-this.g.b)/TAU;},
  draw(){const g=this.g,O=[400,230],R=160;
    circ(O[0],O[1],R+12);paint(C['steel-fill'],C.ink);circ(O[0],O[1],R-30);paint(C.part,C.ink);
    ctx.save();ctx.strokeStyle=C.ink;for(let i=0;i<100;i++){const t=-g.a+i*TAU/100;ctx.lineWidth=i%10?0.8:2;ctx.beginPath();ctx.moveTo(O[0]+(R+12)*Math.cos(t),O[1]+(R+12)*Math.sin(t));ctx.lineTo(O[0]+(R-(i%10?2:10))*Math.cos(t),O[1]+(R-(i%10?2:10))*Math.sin(t));ctx.stroke();}ctx.restore();
    const pa=-g.a-PI/2,pb=-g.b-PI/2;bar(O[0],O[1],O[0]+(R-40)*Math.cos(pa),O[1]+(R-40)*Math.sin(pa),6,C.steel);bar(O[0],O[1],O[0]+(R-60)*Math.cos(pb),O[1]+(R-60)*Math.sin(pb),8,C.brass);pivot(O[0],O[1],6);
    const yw=O[1]+R+40;ctx.beginPath();ctx.rect(260,yw-16,280,32);paint(C['brass-fill'],C.ink);ctx.save();ctx.beginPath();ctx.rect(260,yw-16,280,32);ctx.clip();ctx.strokeStyle=C.ink;ctx.lineWidth=2;const p=16,sh=mod(g.w/TAU*p,p);for(let x=260-p+sh;x<560;x+=p){ctx.beginPath();ctx.moveTo(x,yw-16);ctx.lineTo(x+8,yw+16);ctx.stroke();}ctx.restore();
    label('WHEEL A · 100 TEETH',O[0]+R+20,O[1]-60);label('WHEEL B · 101 TEETH (brass hand)',O[0]+R+20,O[1]-40);label('ONE WORM DRIVES BOTH',400,yw+30,'center');},
  reads(){const g=this.g;return[['Worm turns',`${(g.w/TAU).toFixed(0)}`],['Wheel A turns',`${(g.a/TAU).toFixed(3)}`],['A gains on B',`${((g.a-g.b)/TAU).toFixed(4)} turn`],['Full lap of gain','every 10,100 worm turns']];}});

/* 502 epicyclic train, fixed central wheel */
reg({num:502,outLabel:'Planet wheel, turns',
  update(phi){this.g={phi,arm:phi*0.5,pl:phi*0.5*3};},output(){return this.g.pl/TAU;},
  draw(){const g=this.g,O=[400,260],Rs=80,rp=40,d=120,P=[O[0]+d*Math.cos(g.arm),O[1]+d*Math.sin(g.arm)];
    drawGear(O[0],O[1],Rs,32,PI/32,C.part2,{bore:8});bar(O[0],O[1],P[0],P[1],16,C['brass-fill']);
    drawGear(P[0],P[1],rp,16,g.pl+PI+(0),C['steel-fill'],{bore:6});const m=[P[0]+30*Math.cos(g.pl),P[1]+30*Math.sin(g.pl)];bar(P[0],P[1],m[0],m[1],4,C.steel);pivot(P[0],P[1],5);pivot(O[0],O[1],6);
    label('FIXED CENTRAL WHEEL',O[0],O[1]+170,'center');label('ARM · driver',P[0]+50,P[1]-50);},
  reads(){const g=this.g;return[['Arm turns',`${(g.arm/TAU).toFixed(2)}`],['Planet turns',`${(g.pl/TAU).toFixed(2)}`],['Rule','planet spins 3× per arm turn']];}});

/* 504 Ferguson's paradox */
reg({num:504,outLabel:'Wheel 21 turns',
  update(phi){const a=phi*0.6;this.g={phi,a,w19:a*(1-20/19),w20:0,w21:a*(1-20/21)};},output(){return this.g.w21/TAU;},
  draw(){const g=this.g,O=[400,260],rs=60,ri=30,ro=60,I=[O[0]+90*Math.cos(g.a),O[1]+90*Math.sin(g.a)],Q=[O[0]+180*Math.cos(g.a),O[1]+180*Math.sin(g.a)];
    drawGear(O[0],O[1],rs,20,PI/20,C.part2,{bore:8});bar(O[0],O[1],Q[0],Q[1],18,C['brass-fill']);drawGear(I[0],I[1],ri,10,-g.a*3,C.part,{bore:5});
    drawGear(Q[0],Q[1],ro,20,g.w20,C['steel-fill'],{bore:6});
    const arrows=[[g.w19,52,C.brass,'19'],[g.w20,38,C.ink,'20'],[g.w21,24,C.steel,'21']];
    for(const [w,r,col] of arrows){ctx.save();ctx.strokeStyle=col;ctx.fillStyle=col;ctx.lineWidth=3;const t=w-PI/2;ctx.beginPath();ctx.moveTo(Q[0],Q[1]);ctx.lineTo(Q[0]+r*Math.cos(t),Q[1]+r*Math.sin(t));ctx.stroke();circ(Q[0]+r*Math.cos(t),Q[1]+r*Math.sin(t),4);ctx.fill();ctx.restore();}
    pivot(I[0],I[1],4);pivot(Q[0],Q[1],5);pivot(O[0],O[1],6);
    label('FIXED 20-TOOTH WHEEL (grey)',40,470);label('ON THE ARM: 19, 20 AND 21-TOOTH WHEELS STACKED',40,490);},
  reads(){return[['20-tooth wheel','never turns (points up)'],['21-tooth wheel','turns with the arm, slowly'],['19-tooth wheel','turns against the arm']];}});

/* 68 / 241 single-tooth intermittent drive */
function oneTooth(num,lock){return reg({num,outLabel:'Driven wheel, turns',N:8,
  update(phi){const k=Math.floor((phi+PI)/TAU),a=mod(phi+PI,TAU)-PI,s=smooth((a+0.45)/0.9);this.g={phi,w:-(k+s)*TAU/this.N,eng:Math.abs(a)<0.45};},
  output(){return -this.g.w/TAU;},
  draw(){const g=this.g,D=[300,260],Wc=[300+190,260],N=this.N,Rw=110;
    const pts=[];for(let i=0;i<N*24;i++){const t=i/(N*24)*TAU,rel=mod(t-g.w-PI,TAU/N)-TAU/N/2,notch=Math.abs(rel)<0.13;let r=notch?Rw-34:Rw;if(lock&&!notch){const dd=Math.abs(Math.abs(rel)-TAU/N/2);if(dd<0.18)r=Rw-14*Math.cos(dd/0.18*PI/2);}pts.push([Wc[0]+r*Math.cos(t),Wc[1]+r*Math.sin(t)]);}
    poly(pts);ctx.closePath();circ(Wc[0],Wc[1],10,false);paint(C['steel-fill'],C.ink);pivot(Wc[0],Wc[1],6);
    if(lock){circ(D[0],D[1],72);paint(C['brass-fill'],C.ink);}else{circ(D[0],D[1],60);paint(C['brass-fill'],C.ink);}
    const t=g.phi;bar(D[0],D[1],D[0]+100*Math.cos(t),D[1]+100*Math.sin(t),20,C['brass-fill']);circ(D[0]+96*Math.cos(t),D[1]+96*Math.sin(t),9);paint(C.part2,C.ink);pivot(D[0],D[1],6);
    label(g.eng?'TOOTH ENGAGED':'WHEEL AT REST',Wc[0],Wc[1]+150,'center');label('ONE-TOOTH DRIVER',D[0],D[1]+150,'center');},
  reads(){const g=this.g;return[['Per driver turn',`1/${this.N} turn`],['Phase',g.eng?'moving':'resting'],['Locking',lock?'rim holds the wheel':'none']];}});}
oneTooth(68,true);oneTooth(241,false);

/* 76 revolution counter */
reg({num:76,outLabel:'Count',N:10,
  update(phi){const k=Math.floor((phi+PI*0.8)/TAU),a=mod(phi+PI*0.8,TAU),s=smooth((a-PI*0.55)/(PI*0.5));this.g={phi,k,s,w:-(k+s)*TAU/this.N};},
  output(){return this.g.k+this.g.s;},
  draw(){const g=this.g,S=[260,260],Wc=[470,260],N=this.N;
    circ(S[0],S[1],50);paint(C['brass-fill'],C.ink);const t=g.phi;bar(S[0],S[1],S[0]+105*Math.cos(t),S[1]+105*Math.sin(t),12,C['brass-fill']);pivot(S[0],S[1],6);
    sawWheel(Wc[0],Wc[1],g.w,N,72,100,C['steel-fill']);circ(Wc[0],Wc[1],55);paint(C.hi,C.ink);
    ctx.save();ctx.font='600 34px -apple-system, BlinkMacSystemFont, "SF Pro Display", Inter, "Helvetica Neue", Arial, sans-serif';ctx.fillStyle=C.ink;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(String(mod(Math.round(g.k+g.s),100)).padStart(2,'0'),Wc[0],Wc[1]);ctx.restore();
    const dp=[Wc[0]+30,Wc[1]-150];springZ(dp[0],dp[1],Wc[0]+12,Wc[1]-96,8,5);label('DETENT SPRING',dp[0]+10,dp[1]-10);
    label('TAPPET ON SHAFT',S[0],S[1]+150,'center');label('COUNT WHEEL',Wc[0],Wc[1]+150,'center');},
  reads(){const g=this.g;return[['Shaft turns',`${(g.phi/TAU).toFixed(1)}`],['Counted',`${g.k}`],['Rule','one tooth per turn']];}});

/* 77 / 206 / 236 double pawl lever */
function doublePawl(num){return reg({num,outLabel:'Wheel angle, degrees',N:24,
  reset(){this.W=0;this.lastA=null;},
  update(phi){const a=0.3*Math.sin(phi);if(this.lastA!==null)this.W+=Math.abs(a-this.lastA)*0.9;this.dir=this.lastA===null?1:Math.sign(a-this.lastA)||this.dir||1;this.lastA=a;this.g={phi,a};},
  output(){return this.W*180/PI;},
  draw(){const g=this.g,Cc=[400,320],N=this.N;sawWheel(Cc[0],Cc[1],this.W,N,100,122,C['steel-fill']);for(let k=0;k<4;k++){const t=this.W+k*PI/2;circ(Cc[0]+55*Math.cos(t),Cc[1]+55*Math.sin(t),13);paint(C.sheet,C.ink);}
    const arm=g.a-PI/2,L=[Cc[0]+190*Math.cos(arm),Cc[1]+190*Math.sin(arm)];bar(Cc[0],Cc[1],L[0],L[1],18,C['brass-fill']);
    for(const s of [-1,1]){const pv=[Cc[0]+160*Math.cos(arm+s*0.38),Cc[1]+160*Math.sin(arm+s*0.38)];const ta=arm+s*0.12,eng=(s>0)===(this.dir>0);const rr=eng?sawR(ta-this.W,N,100,122)+2:128;
      bar(Cc[0]+150*Math.cos(arm),Cc[1]+150*Math.sin(arm),pv[0],pv[1],8,C['brass-fill']);bar(pv[0],pv[1],Cc[0]+rr*Math.cos(ta),Cc[1]+rr*Math.sin(ta),8,eng?C.part2:C.part);pivot(pv[0],pv[1],4);}
    pivot(Cc[0],Cc[1],6);label('TWO PAWLS · one works on each stroke',Cc[0],Cc[1]+160,'center');},
  reads(){return[['Wheel turned',`${(this.W*180/PI).toFixed(0)}°`],['Strokes used','both'],['Motion','nearly continuous']];}});}


/* 81 part gear with spring-return rack */
reg({num:81,outLabel:'Rack position, mm',
  update(phi){const u=mod(phi,TAU),A=TAU/3,r=60;let y;if(u<A)y=r*u;else if(u<A+0.5)y=r*A*(1-smooth((u-A)/0.5));else y=0;this.g={phi,u,y};},
  output(){return this.g.y;},
  draw(){const g=this.g,G=[330,200],r=60,m=6,p=PI*m,x=G[0]+r;
    const tau=TAU/20,pts=gearPts(G[0],G[1],r,20,g.phi-TAU/3+tau/2,false,g.phi-TAU/3+0.01,g.phi-0.01);poly(pts);ctx.arc(G[0],G[1],r-1.25*m-1,g.phi,g.phi-TAU/3+TAU);ctx.closePath();circ(G[0],G[1],8,false);paint(C['brass-fill'],C.ink);pivot(G[0],G[1],6);
    const ty=y=>y;const pts2=[];const kmin=Math.ceil((44-G[1])/p),kmax=Math.floor((372-G[1])/p);for(let k=kmin;k<=kmax;k++){const c=G[1]+g.y+k*p;for(const [f,t] of PROF)pts2.push([t?x-m:x+1.25*m,c+f*p]);}
    poly([[x+1.25*m+22,40+g.y],[x+1.25*m,40+g.y],...pts2,[x+1.25*m,380+g.y],[x+1.25*m+22,380+g.y]]);ctx.closePath();paint(C['steel-fill'],C.ink);
    springZ(x+20,380+g.y,x+20,480,10,8);ground(x+20,480,40);
    label('TEETH ON A THIRD OF THE GEAR',G[0],G[1]+110,'center');label('SPRING PULLS THE RACK BACK',x+60,440);},
  reads(){const g=this.g;return[['Phase',g.u<TAU/3?'gear driving':(g.u<TAU/3+0.5?'spring return':'waiting')],['Rack',`${g.y.toFixed(0)} mm`]];}});

/* 114 mutilated pinion and double rack */
reg({num:114,outLabel:'Frame position, mm',
  update(phi){const u=mod(phi+PI/2,TAU)-PI/2,r=50;const x=u<PI/2?r*u:r*(PI-u);this.g={phi,x,top:u<PI/2};},
  output(){return this.g.x;},
  draw(){const g=this.g,P=[400,260],r=50,m=5,p=PI*m,X=g.x,yt=P[1]-r,yb=P[1]+r,xl=X+140,xr=X+660;
    ctx.beginPath();ctx.rect(xl-16,yt-36,16,yb-yt+72);ctx.rect(xr,yt-36,16,yb-yt+72);paint(C['steel-fill'],C.ink);
    const up=rackTeeth(xl,xr,P[0]+X,p,yt,m,true);poly([[xl,yt-36],[xl,yt-1.25*m],...up,[xr,yt-1.25*m],[xr,yt-36]]);ctx.closePath();paint(C['steel-fill'],C.ink);
    const lo=rackTeeth(xl,xr,P[0]+X,p,yb,m,false);poly([[xl,yb+36],[xl,yb+1.25*m],...lo,[xr,yb+1.25*m],[xr,yb+36]]);ctx.closePath();paint(C['steel-fill'],C.ink);
    const tau=TAU/20;const a0=g.phi-PI,pts=gearPts(P[0],P[1],r,20,a0+tau/2,false,a0+0.01,g.phi-0.01);poly(pts);ctx.arc(P[0],P[1],r-1.25*m-1,g.phi,a0+TAU);ctx.closePath();circ(P[0],P[1],7,false);paint(C['brass-fill'],C.ink);pivot(P[0],P[1],6);
    bar(40+X,P[1],xl-16,P[1],12,C['steel-fill']);label(g.top?'DRIVING THE TOP RACK':'DRIVING THE BOTTOM RACK',P[0],yb+80,'center');label('HALF-TOOTHED PINION',P[0]-60,yt-60,'center');},
  reads(){const g=this.g;return[['Frame',`${g.x.toFixed(0)} mm`],['Rack in mesh',g.top?'top':'bottom'],['Stroke',`${(PI*50).toFixed(0)} mm`]];}});

/* 212 Geneva stop */
reg({num:212,outLabel:'Winding turns',N:5,R:60,
  update(phi){const turns=4*(1-Math.cos(phi*0.25))/2;const a=turns*TAU-PI;const N=this.N,half=PI/2-PI/N;const ac=mod(a+PI,TAU)-PI,n=Math.round((a-ac)/TAU);const d=this.R/Math.sin(PI/N);const D=[310,260],Wc=[D[0]+d,D[1]];
    const pin=[D[0]+this.R*Math.cos(a),D[1]+this.R*Math.sin(a)];let w;const step=TAU/N;
    if(Math.abs(ac)<half){let b=Math.atan2(pin[1]-Wc[1],pin[0]-Wc[0]);b=mod(b,TAU);w=-n*step+(b-PI)-0;}else if(ac>=half)w=-n*step-PI/N*1-(half-half);else w=-n*step+PI/N;
    if(Math.abs(ac)<half)w=-n*step+(mod(Math.atan2(pin[1]-Wc[1],pin[0]-Wc[0]),TAU)-PI);else w=ac>=half?-n*step-(PI/2-half):-n*step+(PI/2-half);
    this.g={phi,turns,a,D,Wc,pin,w,d};},
  output(){return this.g.turns;},
  draw(){const g=this.g,N=this.N,R=this.R,Rg=R/Math.tan(PI/N),rl=R*0.62;
    const pts=[];for(let i=0;i<300;i++){const t=i/300*TAU;let r=Rg+2;for(let k=0;k<N;k++){const ca=g.w+PI+PI/N+k*TAU/N,cx=g.Wc[0]+g.d*Math.cos(ca),cy=g.Wc[1]+g.d*Math.sin(ca);const ux=Math.cos(t),uy=Math.sin(t),ox=g.Wc[0]-cx,oy=g.Wc[1]-cy,bq=ox*ux+oy*uy,cq=ox*ox+oy*oy-(rl+3)**2,disc=bq*bq-cq;if(disc>0&&k!==N-1){const t1=-bq-Math.sqrt(disc);if(t1>0&&t1<r)r=t1;}}pts.push([g.Wc[0]+r*Math.cos(t),g.Wc[1]+r*Math.sin(t)]);}
    poly(pts);ctx.closePath();paint(C['steel-fill'],C.ink);
    for(let k=0;k<N-1;k++){const a=g.w+PI+k*TAU/N;ctx.save();ctx.translate(g.Wc[0],g.Wc[1]);ctx.rotate(a);ctx.beginPath();ctx.rect(g.d-R-6,-6,Rg-g.d+R+8,12);ctx.fillStyle=C.sheet;ctx.fill();ctx.restore();}
    pivot(g.Wc[0],g.Wc[1],5);circ(g.D[0],g.D[1],rl);paint(C['brass-fill'],C.ink);bar(g.D[0],g.D[1],g.pin[0],g.pin[1],12,C['brass-fill']);circ(g.pin[0],g.pin[1],6);paint(C.part2,C.ink);pivot(g.D[0],g.D[1],5);
    label('STAR WHEEL · one slot is blank, so it stops',g.Wc[0]+100,g.Wc[1]+130);label('PIN ON THE WINDING ARBOR',g.D[0]-30,g.D[1]+130,'right');},
  reads(){const g=this.g;return[['Winding turns',`${g.turns.toFixed(2)} of 4`],['Purpose','stops over-winding']];}});

/* 225 / 237 swinging pawl arm (same action as 232) */
alias(225,232);alias(237,232);

/* 234 verge escapement */
reg({num:234,outLabel:'Foliot angle, degrees',N:15,
  update(phi){const v=0.55*Math.sin(phi);const u=phi/PI+0.5,k=Math.floor(u),s=smooth((u-k-0.4)/0.2);this.g={phi,v,W:-(k+s)*(TAU/this.N)/2};},
  output(){return this.g.v*180/PI;},
  draw(){const g=this.g,O=[400,310],R=110,N=this.N;
    const pts=[];for(let i=0;i<N;i++){const a=g.W+i*TAU/N;pts.push([O[0]+88*Math.cos(a),O[1]+88*Math.sin(a)]);pts.push([O[0]+R*Math.cos(a+TAU/N*0.15),O[1]+R*Math.sin(a+TAU/N*0.15)]);pts.push([O[0]+86*Math.cos(a+TAU/N*0.7),O[1]+86*Math.sin(a+TAU/N*0.7)]);}
    poly(pts);ctx.closePath();circ(O[0],O[1],8,false);paint(C['steel-fill'],C.ink);pivot(O[0],O[1],5);
    ctx.beginPath();ctx.rect(O[0]-5,90,10,R*2+150);paint(C.part,C.ink);
    for(const [y,s] of [[O[1]-R,1],[O[1]+R,-1]]){const w=34*Math.cos(g.v+s*0.9);ctx.beginPath();ctx.rect(O[0],y-8,w,16);paint(C['brass-fill'],C.ink);}
    const fl=200*Math.cos(g.v);bar(O[0]-fl,90,O[0]+fl,90,10,C['brass-fill']);for(const s of [-1,1]){circ(O[0]+s*fl*0.85,90,14);paint(C['brass-fill'],C.ink);}
    ground(O[0],50,40,true);bar(O[0],50,O[0],90,4,C.part);label('FOLIOT · swings to and fro',O[0]+210,70);label('CROWN WHEEL',O[0]+R+20,O[1]+60);label('VERGE WITH TWO PALLETS',O[0]+30,O[1]-R-20);},
  reads(){const g=this.g;return[['Foliot',`${(g.v*180/PI).toFixed(0)}°`],['Per swing','wheel escapes half a tooth'],['Era','early tower clocks']];}});

/* 271 ratchet bar */
reg({num:271,outLabel:'Bar travel, mm',
  reset(){this.X=0;this.lastA=null;this.dir=1;},
  update(phi){const a=0.32*Math.sin(phi);if(this.lastA!==null){this.X+=Math.abs(a-this.lastA)*90;this.dir=Math.sign(a-this.lastA)||this.dir;}this.lastA=a;this.g={phi,a};if(this.X>300)this.X-=300;},
  output(){return this.X;},
  draw(){const g=this.g,y=330,P=[400,150],p=24;
    const pts=[];for(let x=0;x<=760;x+=p){const xx=x+mod(this.X,p)-p;pts.push([xx,y]);pts.push([xx+p-2,y-18]);}poly([[0,y+30],...pts,[760,y+30]]);ctx.closePath();paint(C['steel-fill'],C.ink);
    const L=[P[0]+150*Math.sin(g.a),P[1]+150*Math.cos(g.a)];bar(P[0],P[1],P[0]-150*Math.sin(g.a),P[1]-150*Math.cos(g.a),16,C['brass-fill']);bar(P[0],P[1],L[0],L[1],10,C['brass-fill']);
    for(const s of [-1,1]){const pv=[P[0]+s*70*Math.cos(g.a),P[1]-s*70*Math.sin(g.a)];const eng=(s>0)===(this.dir>0);bar(pv[0],pv[1],pv[0]+s*10,eng?y-12:y-30,8,eng?C.part2:C.part);pivot(pv[0],pv[1],4);bar(P[0],P[1],pv[0],pv[1],8,C['brass-fill']);}
    pivot(P[0],P[1],6);ground(P[0],P[1]-12,40,true);label('RATCHET BAR',60,y+50);label('ROCKING LEVER WITH TWO PAWLS',P[0]+90,P[1]-30);},
  reads(){return[['Bar moved',`${this.X.toFixed(0)} mm`],['Strokes used','both']];}});

/* 95 / 272 swash plate */
function swash(num){return reg({num,outLabel:'Rod height, mm',
  update(phi){const al=0.38,h=110*Math.tan(al)*Math.cos(phi);this.g={phi,al,h,b:Math.atan(Math.tan(al)*Math.cos(phi))};},output(){return this.g.h;},
  draw(){const g=this.g,X=300,Y=290;ctx.beginPath();ctx.rect(X-10,Y-20,20,240);paint(C.part,C.ink);
    ctx.save();ctx.translate(X,Y);ctx.rotate(-g.b);ctx.beginPath();ctx.ellipse(0,0,170,16+14*Math.abs(Math.sin(g.phi)),0,0,TAU);paint(C['brass-fill'],C.ink);ctx.restore();
    const ry=Y-g.h-8;ctx.beginPath();ctx.rect(X+110-8,ry-220,16,220);paint(C['steel-fill'],C.ink);circ(X+110,ry,10);paint(C['steel-fill'],C.ink);
    for(const gy of [80,150]){ctx.beginPath();ctx.rect(X+110-28,gy,12,26);ctx.rect(X+110+16,gy,12,26);paint(C.part,C.ink);}
    bar(X,Y+220,X+240,Y+220,10,C.part);label('TILTED DISK',X-170,Y+60);label('ROD RIDES ON THE DISK',X+140,ry-120);},
  reads(){const g=this.g;return[['Tilt','22°'],['Rod height',`${g.h.toFixed(0)} mm`],['Strokes per turn','1']];}});}
swash(95);swash(272);

/* 97 / 106 grooved heart cam */
function grooveCam(num){return reg({num,outLabel:'Slide position, mm',O:[400,300],
  r(t){t=mod(t+PI,TAU)-PI;return 50+80*Math.abs(t)/PI;},
  update(phi){const t=-PI/2-phi;this.g={phi,h:this.r(t)};},output(){return this.g.h-50;},
  draw(){const g=this.g,O=this.O;circ(O[0],O[1],170);paint(C['brass-fill'],C.ink);
    const pts=[];for(let i=0;i<240;i++){const s=i/240*TAU-PI,r=this.r(s);pts.push([O[0]+r*Math.cos(s+g.phi),O[1]+r*Math.sin(s+g.phi)]);}
    ctx.save();ctx.lineJoin='round';poly(pts);ctx.closePath();ctx.strokeStyle=C.ink;ctx.lineWidth=20;ctx.stroke();ctx.strokeStyle=C.sheet;ctx.lineWidth=17;ctx.stroke();ctx.restore();pivot(O[0],O[1],6);
    const y=O[1]-g.h;ctx.beginPath();ctx.rect(O[0]-9,y-190,18,190);paint(C['steel-fill'],C.ink);circ(O[0],y,7);paint(C['steel-fill'],C.ink);
    for(const gy of [40,90]){ctx.beginPath();ctx.rect(O[0]-30,gy,12,26);ctx.rect(O[0]+18,gy,12,26);paint(C.part,C.ink);}
    label('PIN RUNS IN THE GROOVE',O[0]+30,y-40);label('HEART-SHAPED GROOVE',O[0]+180,O[1]+120);},
  reads(v){return[['Stroke','160 mm'],['Speed',`${Math.abs(v).toFixed(0)} mm/s, steady`],['Return','positive, no spring needed']];}});}
grooveCam(97);grooveCam(106);

/* 108 barrel cam */
reg({num:108,outLabel:'Follower position, mm',
  X(s){const f=mod(s/TAU,1);return 150*(1-4*Math.abs(f-0.5));},
  update(phi){this.g={phi,x:this.X(-phi)};},output(){return this.g.x;},
  draw(){const g=this.g,y=300,r=60;ctx.beginPath();ctx.rect(200,y-r,400,2*r);paint(C['brass-fill'],C.ink);
    ctx.save();ctx.beginPath();ctx.rect(200,y-r,400,2*r);ctx.clip();ctx.strokeStyle=C.ink;ctx.lineWidth=14;ctx.lineCap='round';
    for(const sgn of [1,-1]){ctx.beginPath();let on=false;for(let i=0;i<=200;i++){const s=i/200*TAU;const ang=s+g.phi;if(Math.cos(ang)>0){const xx=400+sgn*this.X(s)*0.98,yy=y+r*Math.sin(ang);on?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy);on=true;}else on=false;}ctx.stroke();}
    ctx.strokeStyle=C.sheet;ctx.lineWidth=10;for(const sgn of [1,-1]){ctx.beginPath();let on=false;for(let i=0;i<=200;i++){const s=i/200*TAU;const ang=s+g.phi;if(Math.cos(ang)>0){const xx=400+sgn*this.X(s)*0.98,yy=y+r*Math.sin(ang);on?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy);on=true;}else on=false;}ctx.stroke();}ctx.restore();
    bar(140,y,200,y,14,C.part);bar(600,y,660,y,14,C.part);
    const fx=400+g.x;bar(fx,y,fx,130,10,C['steel-fill']);circ(fx,y,6);paint(C.steel,C.ink);ctx.beginPath();ctx.rect(fx-60,110,120,20);paint(C['steel-fill'],C.ink);ctx.beginPath();ctx.rect(150,96,500,10);paint(C.part2,C.ink);
    label('CROSSING GROOVES',200,y+r+30);label('FOLLOWER',fx+16,150);},
  reads(){const g=this.g;return[['Follower',`${g.x.toFixed(0)} mm`],['Per turn','one full back-and-forth'],['Speed','uniform']];}});

/* 138 plate cam */
reg({num:138,outLabel:'Rod height, mm',O:[400,330],
  r(t){return 85+35*Math.cos(t)+14*Math.cos(2*t);},
  update(phi){this.g={phi,h:this.r(-PI/2-phi)};},output(){return this.g.h;},
  draw(){const g=this.g,O=this.O,pts=[];for(let i=0;i<200;i++){const s=i/200*TAU,r=this.r(s);pts.push([O[0]+r*Math.cos(s+g.phi),O[1]+r*Math.sin(s+g.phi)]);}
    poly(pts);ctx.closePath();circ(O[0],O[1],9,false);paint(C['brass-fill'],C.ink);pivot(O[0],O[1],6);
    const y=O[1]-g.h-12;ctx.beginPath();ctx.rect(O[0]-8,y-200,16,200);paint(C['steel-fill'],C.ink);circ(O[0],y,12);paint(C['steel-fill'],C.ink);pivot(O[0],y,3);
    for(const gy of [60,120]){ctx.beginPath();ctx.rect(O[0]-28,gy,12,26);ctx.rect(O[0]+16,gy,12,26);paint(C.part,C.ink);}
    label('CAM',O[0]+130,O[1]+80);label('ROD FALLS BY ITS OWN WEIGHT',O[0]+30,y-80);},
  reads(){const g=this.g;return[['Rod height',`${g.h.toFixed(0)} mm`],['Motion','shaped by the cam outline']];}});

/* 165 wave cam */
reg({num:165,outLabel:'Bar height, mm',
  update(phi){this.g={phi,h:25*Math.cos(4*phi)};},output(){return this.g.h;},
  draw(){const g=this.g,cx=400,top=260,R=170;const edge=[];for(let i=0;i<=80;i++){const s=-PI/2+i/80*PI;edge.push([cx+R*Math.sin(s),top-25*Math.cos(4*(s-g.phi))]);}
    poly([[cx-R,420],...edge,[cx+R,420]]);ctx.closePath();paint(C['brass-fill'],C.ink);bar(cx,420,cx,480,16,C.part);
    const fy=top-25*Math.cos(4*(-g.phi))-10;ctx.beginPath();ctx.rect(cx-8,fy-180,16,180);paint(C['steel-fill'],C.ink);circ(cx,fy,10);paint(C['steel-fill'],C.ink);
    for(const gy of [70,130]){ctx.beginPath();ctx.rect(cx-28,gy,12,26);ctx.rect(cx+16,gy,12,26);paint(C.part,C.ink);}
    label('WAVY RIM · 4 waves',cx+R+10,top+30);label('BAR RISES 4 TIMES A TURN',cx+30,fy-60);},
  reads(){const g=this.g;return[['Rises per turn','4'],['Bar height',`${g.h.toFixed(0)} mm`]];}});

/* 276 constant-diameter cam */
reg({num:276,outLabel:'Yoke position, mm',O:[400,270],D:150,
  pts(rot){const D=this.D,V=[0,1,2].map(k=>{const a=-PI/2+k*TAU/3;return[D/Math.sqrt(3)*Math.cos(a),D/Math.sqrt(3)*Math.sin(a)];});const out=[];
    for(let k=0;k<3;k++){const c=V[k],a=V[(k+1)%3],b=V[(k+2)%3];const a0=Math.atan2(a[1]-c[1],a[0]-c[0]),a1=Math.atan2(b[1]-c[1],b[0]-c[0]);let d=a1-a0;d=mod(d+PI,TAU)-PI;for(let i=0;i<=20;i++){const t=a0+d*i/20;out.push([c[0]+D*Math.cos(t),c[1]+D*Math.sin(t)]);}}
    return out.map(([x,y])=>[this.O[0]+x*Math.cos(rot)-y*Math.sin(rot),this.O[1]+x*Math.sin(rot)+y*Math.cos(rot)]);},
  update(phi){const P=this.pts(phi);let mn=1e9;for(const p of P)mn=Math.min(mn,p[0]);this.g={phi,P,mn};},output(){return this.g.mn-this.O[0];},
  draw(){const g=this.g,O=this.O,x0=g.mn,x1=g.mn+this.D;ctx.beginPath();ctx.rect(x0-20,O[1]-120,x1-x0+40,240);ctx.rect(x0,O[1]-100,x1-x0,200);paint(C['steel-fill'],C.ink);
    bar(40,O[1],x0-20,O[1],16,C['steel-fill']);bar(x1+20,O[1],760,O[1],16,C['steel-fill']);
    poly(g.P);ctx.closePath();circ(O[0],O[1],7,false);paint(C['brass-fill'],C.ink);pivot(O[0],O[1],6);label('SAME WIDTH IN EVERY DIRECTION',O[0],O[1]+150,'center');},
  reads(){const g=this.g;return[['Cam width','always 150 mm'],['Yoke',`${(g.mn-this.O[0]).toFixed(0)} mm`],['Contact','both faces, always']];}});

/* 101 slotted swinging bar */
reg({num:101,outLabel:'Bar position, mm',P0:[400,60],O:[400,300],r:70,yb:470,
  update(phi){const pin=[this.O[0]+this.r*Math.cos(phi),this.O[1]+this.r*Math.sin(phi)];const a=Math.atan2(pin[0]-this.P0[0],pin[1]-this.P0[1]);this.g={phi,pin,a,x:this.P0[0]+(this.yb-this.P0[1])*Math.tan(a)};},
  output(){return this.g.x-this.P0[0];},
  draw(){const g=this.g,P=this.P0;ctx.beginPath();ctx.rect(g.x-280,this.yb-12,560,24);paint(C['steel-fill'],C.ink);for(const gx of [80,720]){ctx.beginPath();ctx.rect(gx-24,this.yb-24,48,10);ctx.rect(gx-24,this.yb+14,48,10);paint(C.part,C.ink);}
    circ(this.O[0],this.O[1],this.r+22);paint(C['brass-fill'],C.ink);
    ctx.save();ctx.translate(P[0],P[1]);ctx.rotate(-g.a);ctx.beginPath();capsule(0,0,0,(this.yb-P[1])/Math.cos(g.a)+14,14);capsule(0,140,0,330,6);paint(C.part2,C.ink);ctx.restore();
    ctx.beginPath();ctx.rect(g.pin[0]-8,g.pin[1]-8,16,16);paint(C.part,C.ink);pivot(g.pin[0],g.pin[1],4);pivot(this.O[0],this.O[1],6);pivot(P[0],P[1],6);ground(P[0],P[1]-12,40,true);pivot(g.x,this.yb,5);
    label('SWINGING SLOTTED BAR',P[0]+30,P[1]+40);},
  reads(v){return[['Bar speed',`${v.toFixed(0)} mm/s`],['Stroke',`${(2*(this.yb-this.P0[1])*Math.tan(Math.asin(this.r/(this.O[1]-this.P0[1])))).toFixed(0)} mm`]];}});

/* 129 Chinese windlass */
reg({num:129,outLabel:'Load height, mm',r1:44,r2:30,
  update(phi){const th=6*PI*Math.sin(phi);this.g={phi,th,lift:(this.r1-this.r2)/2*th};},output(){return this.g.lift;},
  draw(){const g=this.g,B=[400,110],y=360-g.lift,cx=B[0]-(this.r1-this.r2)/2,rp=(this.r1+this.r2)/2;
    rope([[B[0]-this.r1,B[1]],[cx-rp,y]]);rope([[B[0]+this.r2,B[1]],[cx+rp,y]]);ctx.beginPath();ctx.arc(cx,y,rp,0,PI);ctx.strokeStyle=C.ink;ctx.lineWidth=2;ctx.stroke();
    circ(B[0],B[1],this.r1);paint(C['brass-fill'],C.ink);circ(B[0],B[1],this.r2);paint(C.part2,C.ink);bar(B[0],B[1],B[0]+38*Math.cos(g.th),B[1]+38*Math.sin(g.th),6,C.part);pivot(B[0],B[1],5);
    pulley(cx,y,rp-4,-g.th*0.2,C['steel-fill']);bar(cx,y,cx,y+40,6,C.part);weight(cx,y+40,90,60,'LOAD');
    bar(B[0]-140,B[1],B[0]-60,B[1],10,C.part);label('BIG AND SMALL BARREL ON ONE AXLE',B[0]+60,B[1]-30);},
  reads(){const g=this.g;return[['Crank turns',`${(g.th/TAU).toFixed(2)}`],['Load moves',`${g.lift.toFixed(1)} mm`],['Per turn',`${((this.r1-this.r2)*PI).toFixed(0)} mm, very slow and strong`]];}});

/* 131 sector and rack */
reg({num:131,outLabel:'Rack position, mm',P0:[400,120],O:[400,280],r:55,R:300,
  update(phi){const pin=[this.O[0]+this.r*Math.cos(phi),this.O[1]+this.r*Math.sin(phi)];const a=Math.atan2(pin[0]-this.P0[0],pin[1]-this.P0[1]);this.g={phi,pin,a,x:-this.R*a};},
  output(){return this.g.x;},
  draw(){const g=this.g,P=this.P0,R=this.R,m=6,Z=Math.round(2*R/m),yr=P[1]+R;
    const ang=PI/2-g.a,pts=gearPts(P[0],P[1],R,Z,ang+PI/Z,false,ang-0.32,ang+0.32);ctx.beginPath();ctx.moveTo(P[0],P[1]);poly(pts,false);ctx.lineTo(P[0],P[1]);paint(C['steel-fill'],C.ink);
    ctx.save();ctx.beginPath();ctx.moveTo(P[0],P[1]);for(const p of pts)ctx.lineTo(...p);ctx.closePath();paint(C['steel-fill'],C.ink);ctx.restore();
    const p=PI*m,rt=rackTeeth(60,740,P[0]+g.x,p,yr,m,false);poly([[60,yr+36],[60,yr+1.25*m],...rt,[740,yr+1.25*m],[740,yr+36]]);ctx.closePath();paint(C['steel-fill'],C.ink);
    circ(this.O[0],this.O[1],this.r+20);paint(C['brass-fill'],C.ink);ctx.beginPath();ctx.rect(g.pin[0]-8,g.pin[1]-8,16,16);paint(C.part,C.ink);pivot(g.pin[0],g.pin[1],4);pivot(this.O[0],this.O[1],6);pivot(P[0],P[1],7);ground(P[0],P[1]-12,40,true);
    label('CRANK',this.O[0]+90,this.O[1]);label('TOOTHED SECTOR',P[0]+170,yr-60);label('RACK',80,yr+56);},
  reads(){const g=this.g;return[['Sector swing',`${(g.a*180/PI).toFixed(1)}°`],['Rack',`${g.x.toFixed(0)} mm`]];}});

/* 134 rope drum */
reg({num:134,outLabel:'Load height, mm',
  update(phi){const th=3*PI*(1-Math.cos(phi));this.g={phi,th,lift:50*th};},output(){return this.g.lift/10;},
  draw(){const g=this.g,D=[400,120],r=50,y=420-g.lift/10;rope([[D[0]+r,D[1]],[D[0]+r,y]]);circ(D[0],D[1],r);paint(C['brass-fill'],C.ink);
    ctx.save();ctx.strokeStyle=C.ink;for(let k=0;k<10;k++){const t=g.th+k*TAU/10;ctx.beginPath();ctx.moveTo(D[0]+r*0.3*Math.cos(t),D[1]+r*0.3*Math.sin(t));ctx.lineTo(D[0]+r*Math.cos(t),D[1]+r*Math.sin(t));ctx.stroke();}ctx.restore();
    bar(D[0],D[1],D[0]+80*Math.cos(g.th*0.5),D[1]+80*Math.sin(g.th*0.5),8,C.part);pivot(D[0],D[1],6);weight(D[0]+r,y,80,60,'LOAD');label('ROPE WINDS ON THE DRUM',D[0]-60,D[1]-70);},
  reads(){const g=this.g;return[['Drum turns',`${(g.th/TAU).toFixed(2)}`],['Per turn',`${(TAU*5).toFixed(0)} mm of rope (scaled)`]];}});

/* 151 right- and left-hand screws */
reg({num:151,outLabel:'Gap between nuts, mm',p:20,
  update(phi){const th=5*PI*Math.sin(phi);this.g={phi,th,t:th/TAU*this.p};},output(){return 300-2*this.g.t;},
  draw(){const g=this.g,y=260,r=20,p=this.p,sh=mod(g.th/TAU*p,p);ctx.beginPath();ctx.rect(120,y-r,560,2*r);paint(C['brass-fill'],C.ink);
    ctx.save();ctx.beginPath();ctx.rect(120,y-r,280,2*r);ctx.clip();ctx.strokeStyle=C.ink;ctx.lineWidth=2;for(let x=120-p+sh;x<420;x+=p){ctx.beginPath();ctx.moveTo(x,y-r);ctx.lineTo(x+p/2,y+r);ctx.stroke();}ctx.restore();
    ctx.save();ctx.beginPath();ctx.rect(400,y-r,280,2*r);ctx.clip();ctx.strokeStyle=C.ink;ctx.lineWidth=2;for(let x=400-p-sh+p;x<700;x+=p){ctx.beginPath();ctx.moveTo(x+p/2,y-r);ctx.lineTo(x,y+r);ctx.stroke();}ctx.restore();
    circ(90,y,40);paint(C['brass-fill'],C.ink);for(let k=0;k<3;k++){const a=g.th+k*TAU/3;bar(90,y,90+34*Math.cos(a),y+34*Math.sin(a),6,C.part2);}pivot(90,y,5);
    for(const [x0,s] of [[250,1],[550,-1]]){const x=x0+s*g.t;ctx.beginPath();ctx.rect(x-30,y-40,60,80);paint(C['steel-fill'],C.ink);ctx.beginPath();ctx.rect(x-30,y+40,60,26);paint(C['steel-fill'],C.ink);}
    ctx.beginPath();ctx.rect(130,y+66,540,10);paint(C.part2,C.ink);label('RIGHT-HAND THREAD',260,y-60,'center');label('LEFT-HAND THREAD',540,y-60,'center');},
  reads(){const g=this.g;return[['Gap',`${(300-2*g.t).toFixed(0)} mm`],['Nuts','move together or apart']];}});

/* 105 screw press */
reg({num:105,outLabel:'Platen height, mm',p:30,
  update(phi){const th=3*PI*(1-Math.cos(phi));this.g={phi,th,d:th/TAU*this.p};},output(){return -this.g.d;},
  draw(){const g=this.g,X=400,yP=230+g.d;ctx.beginPath();ctx.rect(X-200,60,400,30);ctx.rect(X-200,90,30,400);ctx.rect(X+170,90,30,400);ctx.rect(X-200,460,400,30);paint(C.part2,C.ink);
    ctx.beginPath();ctx.rect(X-16,40,32,yP-40);paint(C['brass-fill'],C.ink);ctx.save();ctx.beginPath();ctx.rect(X-16,40,32,yP-40);ctx.clip();ctx.strokeStyle=C.ink;ctx.lineWidth=2;const sh=mod(g.th/TAU*this.p,this.p);for(let y=40-this.p+sh;y<yP;y+=this.p){ctx.beginPath();ctx.moveTo(X-16,y);ctx.lineTo(X+16,y+this.p/2);ctx.stroke();}ctx.restore();
    const L=170*Math.cos(g.th);bar(X-L,40,X+L,40,10,C['brass-fill']);for(const s of [-1,1]){circ(X+s*L,40,16+6*s*Math.sin(g.th)*0);paint(C['brass-fill'],C.ink);}
    ctx.beginPath();ctx.rect(X-130,yP,260,30);paint(C['steel-fill'],C.ink);hatchRect(X-100,430,200,30,C.part);
    label('BALLED LEVER',X+180,30);label('PLATEN',X+140,yP+16);},
  reads(){const g=this.g;return[['Screw turns',`${(g.th/TAU).toFixed(2)}`],['Platen down',`${g.d.toFixed(0)} mm`],['Pitch',`${this.p} mm`]];}});

/* 111 / 266 differential screw */
function diffScrew(num){return reg({num,outLabel:'Carriage position, mm',p1:14,p2:12,
  update(phi){const th=5*PI*Math.sin(phi);this.g={phi,th,s:th/TAU*this.p1,c:th/TAU*(this.p1-this.p2)};},output(){return this.g.c;},
  draw(){const g=this.g,y=260,r=18;const sx=g.s;ctx.beginPath();ctx.rect(150+sx,y-r,460,2*r);paint(C['brass-fill'],C.ink);
    const thr=(x0,x1,p)=>{ctx.save();ctx.beginPath();ctx.rect(x0,y-r,x1-x0,2*r);ctx.clip();ctx.strokeStyle=C.ink;ctx.lineWidth=2;const sh=mod(g.th/TAU*p+sx,p);for(let x=x0-p+sh;x<x1+p;x+=p){ctx.beginPath();ctx.moveTo(x,y-r);ctx.lineTo(x+p/2,y+r);ctx.stroke();}ctx.restore();};
    thr(150+sx,380+sx,this.p1);thr(380+sx,610+sx,this.p2);
    circ(120+sx,y,36);paint(C['brass-fill'],C.ink);for(let k=0;k<3;k++){const a=g.th+k*TAU/3;bar(120+sx,y,120+sx+30*Math.cos(a),y+30*Math.sin(a),6,C.part2);}pivot(120+sx,y,5);
    ctx.beginPath();ctx.rect(240,y-46,60,92);paint(C.part2,C.ink);ground(270,y+60,80);ctx.beginPath();ctx.rect(258,y+46,24,14);paint(C.part2,C.ink);
    const cx=500+g.c;ctx.beginPath();ctx.rect(cx-34,y-50,68,100);paint(C['steel-fill'],C.ink);ctx.beginPath();ctx.rect(cx-34,y+50,68,24);paint(C['steel-fill'],C.ink);ctx.beginPath();ctx.rect(160,y+74,560,8);paint(C.part2,C.ink);
    label(`FIXED NUT · ${this.p1} mm pitch`,270,y-66,'center');label(`CARRIAGE · ${this.p2} mm pitch`,cx,y-66,'center');},
  reads(){const g=this.g;return[['Screw turns',`${(g.th/TAU).toFixed(2)}`],['Screw moves',`${g.s.toFixed(1)} mm`],['Carriage moves',`${g.c.toFixed(2)} mm`],['Per turn',`${this.p1-this.p2} mm`]];}});}
diffScrew(111);diffScrew(266);

/* 112 Persian drill */
reg({num:112,outLabel:'Spindle angle, turns',
  update(phi){const y=(1-Math.cos(phi))/2;this.g={phi,y,a:y*2.5};},output(){return this.g.a;},
  draw(){const g=this.g,X=400,top=70,bot=420,lead=60,by=150+g.y*200;
    ctx.beginPath();ctx.rect(X-12,top,24,bot-top);paint(C['steel-fill'],C.ink);ctx.save();ctx.beginPath();ctx.rect(X-12,top,24,bot-top);ctx.clip();ctx.strokeStyle=C.ink;ctx.lineWidth=2;const sh=mod(g.a*lead,lead);for(let y=top-lead+sh;y<bot+lead;y+=lead/2){ctx.beginPath();ctx.moveTo(X-12,y);ctx.lineTo(X+12,y+lead/2);ctx.stroke();}ctx.restore();
    ctx.beginPath();ctx.ellipse(X,top-6,40,12,0,0,TAU);paint(C.part2,C.ink);
    ctx.beginPath();ctx.rect(X-32,by-14,64,28);paint(C['brass-fill'],C.ink);
    ctx.beginPath();ctx.moveTo(X-5,bot);ctx.lineTo(X,bot+40);ctx.lineTo(X+5,bot);paint(C.part,C.ink);hatchRect(X-120,bot+40,240,40,C.part2);
    label('BUTTON · slide up and down',X+40,by);label('QUICK SPIRAL',X+30,top+40);},
  reads(){const g=this.g;return[['Spindle',`${g.a.toFixed(2)} turns`],['Direction','reverses each stroke']];}});

/* 242 band brake */
reg({num:242,outLabel:'Drum speed, %',
  reset(){this.w=1;this.a=0;this.last=null;},
  update(phi){const b=Math.sin(phi*0.5)>0.2?1:0;if(this.last===null)this.last=phi;const d=Math.abs(phi-this.last);this.last=phi;this.w+=b?-0.9*d:0.5*d;this.w=clamp(this.w,0,1);this.a+=this.w*d*3;this.g={phi,b};},
  output(){return this.w*100;},
  draw(){const g=this.g,D=[380,280],r=110;flywheel(D[0],D[1],r,this.a,C['steel-fill']);
    const lv=g.b?0.18:-0.08;const P=[560,420],E=[P[0]-170*Math.cos(lv),P[1]-170*Math.sin(lv)];
    ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=g.b?7:5;ctx.beginPath();ctx.arc(D[0],D[1],r+(g.b?4:12),0.3,PI*1.9,false);ctx.stroke();ctx.strokeStyle=C['brass-fill'];ctx.lineWidth=g.b?4:2;ctx.stroke();ctx.restore();
    bar(D[0]+(r+8)*Math.cos(0.3),D[1]+(r+8)*Math.sin(0.3),P[0]-30,P[1]-4,6,C.part);bar(D[0]+(r+8)*Math.cos(PI*1.9),D[1]+(r+8)*Math.sin(PI*1.9),P[0]-60,P[1]-12,6,C.part);
    bar(P[0],P[1],P[0]+150,P[1]+150*Math.tan(lv)*1.5,14,C['brass-fill']);pivot(P[0],P[1],6);ground(P[0],P[1]+14,40);
    label(g.b?'BRAKE ON · band tight':'BRAKE OFF',D[0],D[1]+170,'center');},
  reads(){const g=this.g;return[['Brake',g.b?'applied':'released'],['Drum speed',`${(this.w*100).toFixed(0)} %`]];}});

/* 245 bayonet joint */
reg({num:245,outLabel:'Plug depth, mm',
  update(phi){const u=mod(phi/TAU,1);let y,x,st;if(u<0.25){y=smooth(u/0.25);x=0;st='push in';}else if(u<0.4){y=1;x=smooth((u-0.25)/0.15);st='twist to lock';}else if(u<0.6){y=1;x=1;st='locked';}else if(u<0.75){y=1;x=1-smooth((u-0.6)/0.15);st='twist back';}else{y=1-smooth((u-0.75)/0.25);x=0;st='pull out';}this.g={phi,x,y,st};},
  output(){return this.g.y*120;},
  draw(){const g=this.g,X=400,top=200;ctx.beginPath();ctx.rect(X-90,top,180,280);paint(C.part,C.ink);
    ctx.beginPath();ctx.moveTo(X-12,top);ctx.lineTo(X-12,top+130);ctx.lineTo(X+70,top+130);ctx.lineTo(X+70,top+106);ctx.lineTo(X+12,top+106);ctx.lineTo(X+12,top);ctx.closePath();ctx.fillStyle=C.sheet;ctx.fill();ctx.strokeStyle=C.ink;ctx.lineWidth=1.2;ctx.stroke();
    const py=top-120+g.y*238;ctx.save();ctx.globalAlpha=.85;ctx.beginPath();ctx.rect(X-70,py-200,140,200);paint(C['steel-fill'],C.ink);ctx.restore();
    const pinx=X+g.x*58,piny=py-12;circ(pinx,piny,10);paint(C['brass-fill'],C.ink);
    label('L-SHAPED SLOT',X+110,top+120);label(g.st.toUpperCase(),X,500,'center');},
  reads(){const g=this.g;return[['Step',g.st],['Holds by','a pin in an L-shaped slot']];}});

/* 251 pile driver */
reg({num:251,outLabel:'Weight height, mm',
  update(phi){const k=Math.floor(phi/TAU),u=mod(phi/TAU,1);let h;if(u<0.7)h=u/0.7;else if(u<0.78){const t=(u-0.7)/0.08;h=1-t*t;}else h=0;this.g={phi,h,released:u>=0.7,depth:clamp(k,0,40)*2+(u>=0.78?2:0)};},
  output(){return this.g.h*250;},
  draw(){const g=this.g,X=400,top=60,yW=380-g.h*250-mod(g.depth,40);ctx.beginPath();ctx.rect(X-110,top,20,440);ctx.rect(X+90,top,20,440);ctx.rect(X-110,top-14,220,16);paint(C.part2,C.ink);
    pulley(X,top+10,18,g.h*20,C.part);ctx.beginPath();ctx.moveTo(X-60,top+120);ctx.lineTo(X-24,top+120);ctx.lineTo(X-60,top+160);ctx.closePath();paint(C.part,C.ink);ctx.beginPath();ctx.moveTo(X+60,top+120);ctx.lineTo(X+24,top+120);ctx.lineTo(X+60,top+160);ctx.closePath();paint(C.part,C.ink);
    const hy=g.released?top+150:yW-30;rope([[X,top+28],[X,hy-10]]);
    ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=4;const o=g.released?14:0;ctx.beginPath();ctx.moveTo(X-6,hy-10);ctx.lineTo(X-6-o,hy+16);ctx.moveTo(X+6,hy-10);ctx.lineTo(X+6+o,hy+16);ctx.stroke();ctx.restore();
    ctx.beginPath();ctx.rect(X-50,yW,100,70);paint(C['brass-fill'],C.ink);const pileTop=452+mod(g.depth,40);ctx.beginPath();ctx.rect(X-20,pileTop,40,90);paint(C['steel-fill'],C.ink);
    ctx.save();ctx.fillStyle=C.part2;ctx.fillRect(40,470,720,50);ctx.restore();label(g.released?'HOOKS OPEN · weight falls':'HOOKS CARRY THE WEIGHT UP',X+130,yW+30);label('WEDGES',X-70,top+110,'right');},
  reads(){const g=this.g;return[['Phase',g.released?'falling':'lifting'],['Blows',`${Math.floor(g.phi/TAU)}`]];}});

/* 270 roller bearing */
reg({num:270,outLabel:'Cage turns',
  update(phi){this.g={phi,c:phi/3,rs:-phi};},output(){return this.g.c/TAU;},
  draw(){const g=this.g,O=[400,260];circ(O[0],O[1],170);circ(O[0],O[1],122,false);paint(C.part2,C.ink);ground(O[0],O[1]+170,120);
    for(let k=0;k<8;k++){const a=g.c+k*TAU/8,P=[O[0]+91*Math.cos(a),O[1]+91*Math.sin(a)];circ(P[0],P[1],29);paint(C['steel-fill'],C.ink);bar(P[0],P[1],P[0]+20*Math.cos(g.rs+a),P[1]+20*Math.sin(g.rs+a),4,C.steel);}
    circ(O[0],O[1],60);circ(O[0],O[1],18,false);paint(C['brass-fill'],C.ink);bar(O[0],O[1],O[0]+50*Math.cos(g.phi),O[1]+50*Math.sin(g.phi),6,C.part);pivot(O[0],O[1],5);
    label('SHAFT',O[0]-40,O[1]-80,'right');label('ROLLERS · travel at ⅓ shaft speed',O[0]+180,O[1]-140);},
  reads(){const g=this.g;return[['Shaft turns',`${(g.phi/TAU).toFixed(2)}`],['Rollers orbit',`${(g.c/TAU).toFixed(2)}`],['Friction','rolling, not sliding']];}});

/* 325 swing-arm parallel ruler */
reg({num:325,outLabel:'Ruler gap, mm',
  update(phi){const a=0.25+0.9*(1+Math.sin(phi))/2;this.g={phi,a};},output(){return 120*Math.sin(this.g.a);},
  draw(){const g=this.g,y0=380,L=120,dx=L*Math.cos(g.a),dy=L*Math.sin(g.a);ctx.beginPath();ctx.rect(160,y0,480,30);paint(C.part2,C.ink);ctx.beginPath();ctx.rect(160+dx,y0-dy-30,480,30);paint(C['brass-fill'],C.ink);
    for(const x of [260,540]){bar(x,y0+15,x+dx,y0-dy-15,10,C.part);pivot(x,y0+15,4);pivot(x+dx,y0-dy-15,4);}
    ctx.save();ctx.setLineDash([4,4]);ctx.strokeStyle=C.steel;ctx.beginPath();ctx.moveTo(100,y0-dy-30);ctx.lineTo(720,y0-dy-30);ctx.stroke();ctx.restore();label('EDGES STAY PARALLEL',400,y0-dy-60,'center');},
  reads(){const g=this.g;return[['Gap',`${(120*Math.sin(g.a)).toFixed(0)} mm`],['Linkage','parallelogram']];}});

/* 328 Cartwright's parallel motion */
reg({num:328,outLabel:'Crosshead height, mm',r:45,L:200,w:70,
  reset(){this.trail=[];},
  update(phi){const A=[340,400],B=[460,400],r=this.r;const pa=[A[0]+r*Math.cos(phi),A[1]+r*Math.sin(phi)],pb=[B[0]-r*Math.cos(phi),B[1]+r*Math.sin(phi)];const xl=400-this.w,yc=pa[1]-Math.sqrt(this.L**2-(xl-pa[0])**2);this.g={phi,A,B,pa,pb,yc};this.trail=this.trail||[];this.trail.push([400,yc-120]);if(this.trail.length>200)this.trail.shift();},
  output(){return 400-this.g.yc;},
  draw(){const g=this.g,w=this.w;drawGear(g.A[0],g.A[1],60,24,g.phi,C['brass-fill'],{bore:6});drawGear(g.B[0],g.B[1],60,24,-g.phi+PI+PI/24,C['brass-fill'],{bore:6});
    bar(g.A[0],g.A[1],g.pa[0],g.pa[1],12,C.part2);bar(g.B[0],g.B[1],g.pb[0],g.pb[1],12,C.part2);
    bar(g.pa[0],g.pa[1],400-w,g.yc,9,C.part);bar(g.pb[0],g.pb[1],400+w,g.yc,9,C.part);ctx.beginPath();ctx.rect(400-w-10,g.yc-10,2*w+20,20);paint(C['steel-fill'],C.ink);
    bar(400,g.yc,400,g.yc-150,10,C['steel-fill']);ctx.beginPath();ctx.rect(340,40,120,90);paint(C.part2,C.ink);
    for(const p of [g.pa,g.pb,[400-w,g.yc],[400+w,g.yc]])pivot(p[0],p[1],4);pivot(g.A[0],g.A[1],5);pivot(g.B[0],g.B[1],5);
    label('PISTON ROD MOVES IN A TRUE STRAIGHT LINE',470,g.yc-100);label('TWO EQUAL GEARS TURN OPPOSITE WAYS',400,500,'center');},
  reads(){const g=this.g;return[['Crosshead',`${(400-g.yc).toFixed(0)} mm`],['Sideways error','zero (symmetric)']];}});

/* 345 pendulum engine */
reg({num:345,outLabel:'Cylinder angle, degrees',T:[400,90],O:[400,390],r:60,
  update(phi){const pin=[this.O[0]+this.r*Math.cos(phi),this.O[1]+this.r*Math.sin(phi)];const a=Math.atan2(pin[0]-this.T[0],pin[1]-this.T[1]);this.g={phi,pin,a,d:Math.hypot(pin[0]-this.T[0],pin[1]-this.T[1])};},
  output(){return this.g.a*180/PI;},
  draw(){const g=this.g,T=this.T,O=this.O;flywheel(O[0],O[1],110,g.phi);bar(O[0],O[1],g.pin[0],g.pin[1],14,C['brass-fill']);
    ctx.save();ctx.translate(T[0],T[1]);ctx.rotate(-g.a);ctx.beginPath();ctx.rect(-44,-12,88,244);ctx.rect(-34,10,68,222);paint(C.part2,C.ink);ctx.beginPath();ctx.rect(-32,g.d-160,64,24);paint(C['steel-fill'],C.ink);bar(0,g.d-148,0,g.d,10,C.part);ctx.restore();
    pivot(g.pin[0],g.pin[1],5);pivot(O[0],O[1],6);circ(T[0],T[1],12);paint(C.hi,C.ink);pivot(T[0],T[1],4);ground(T[0],T[1]-14,60,true);label('CYLINDER SWINGS FROM THE TOP',T[0]+60,T[1]+20);},
  reads(){const g=this.g;return[['Cylinder swing',`${(g.a*180/PI).toFixed(1)}°`],['Stroke',`${2*this.r} mm`]];}});

/* 369 cycloidal pendulum */
reg({num:369,outLabel:'Bob x, mm',S:[400,80],a:60,
  update(phi){const t=1.9*Math.sin(phi);this.g={phi,t};},output(){const a=this.a,t=this.g.t;return a*(t+Math.sin(t));},
  draw(){const g=this.g,S=this.S,a=this.a,t=g.t;
    for(const s of [-1,1]){const pts=[S];for(let i=0;i<=40;i++){const u=i/40*PI;pts.push([S[0]+s*a*(u-Math.sin(u)),S[1]+a*(1-Math.cos(u))]);}ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(...pts[0]);for(const p of pts)ctx.lineTo(...p);ctx.stroke();ctx.restore();}
    ctx.save();ctx.strokeStyle=C.rule;ctx.setLineDash([4,4]);ctx.beginPath();for(let i=0;i<=80;i++){const u=-PI+i/80*TAU;const x=S[0]+a*(u+Math.sin(u)),y=S[1]+4*a-a*(1-Math.cos(u));i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();ctx.restore();
    const s=Math.sign(t)||1,u=Math.abs(t),bob=[S[0]+a*(t+Math.sin(t)),S[1]+4*a-a*(1-Math.cos(t))];const pts=[S];for(let i=0;i<=20;i++){const v=i/20*u;pts.push([S[0]+s*a*(v-Math.sin(v)),S[1]+a*(1-Math.cos(v))]);}pts.push(bob);
    ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(...pts[0]);for(const p of pts)ctx.lineTo(...p);ctx.stroke();ctx.restore();
    circ(bob[0],bob[1],18);paint(C['brass-fill'],C.ink);ground(S[0],S[1],80,true);label('CYCLOIDAL CHEEKS',S[0]+a*PI+10,S[1]+2*a);label('BOB FOLLOWS A CYCLOID',S[0]+120,S[1]+4*a+30);},
  reads(){return[['Swing time','the same for big and small swings'],['Inventor','Christiaan Huygens, 1673']];}});

/* 375 edge runner mill */
reg({num:375,outLabel:'Runner position',
  update(phi){this.g={phi:phi*0.5};},output(){return Math.cos(this.g.phi);},
  draw(){const g=this.g,X=400,yp=420,R=130,rw=80;ctx.beginPath();ctx.ellipse(X,yp,250,60,0,0,TAU);paint(C.part2,C.ink);ctx.beginPath();ctx.ellipse(X,yp,215,48,0,0,TAU);paint(C['brass-fill'],C.ink);
    ctx.beginPath();ctx.rect(X-10,60,20,yp-60);paint(C.part,C.ink);
    const wheels=[0,1].map(k=>{const az=g.phi+k*PI;return{az,x:X+R*Math.cos(az),z:Math.sin(az)};}).sort((a,b)=>a.z-b.z);
    for(const w of wheels){const yc=yp-rw+w.z*30;bar(X,yp-rw,w.x,yc,10,C.part2);const face=Math.abs(Math.sin(w.az));ctx.beginPath();ctx.ellipse(w.x,yc,rw*face+24*Math.abs(Math.cos(w.az)),rw,0,0,TAU);paint(C['steel-fill'],C.ink);if(face>0.3){ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=1;const sp=-g.phi*R/rw;for(let k=0;k<4;k++){const t=sp+k*PI/4;ctx.beginPath();ctx.moveTo(w.x-rw*face*Math.cos(t),yc-rw*Math.sin(t));ctx.lineTo(w.x+rw*face*Math.cos(t),yc+rw*Math.sin(t));ctx.stroke();}ctx.restore();}}
    label('TWO ROLLING STONES',X+260,yp-120);label('PAN',X+260,yp+20);},
  reads(){return[['Action','crushing and rubbing'],['Uses','oilseed, clay, spices, ore']];}});

/* 392 jig saw */
reg({num:392,outLabel:'Blade position, mm',O:[400,440],r:40,L:120,
  update(phi){const pin=[this.O[0]+this.r*Math.cos(phi),this.O[1]+this.r*Math.sin(phi)];const yb=pin[1]-Math.sqrt(this.L**2-(pin[0]-this.O[0])**2);this.g={phi,pin,yb};},
  output(){return this.O[1]-this.g.yb;},
  draw(){const g=this.g,X=this.O[0];ctx.beginPath();ctx.rect(150,300,500,16);paint(C.part2,C.ink);hatchRect(330,270,120,30,C['brass-fill']);
    ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(X,g.yb);ctx.lineTo(X,g.yb-230);ctx.stroke();ctx.restore();
    springZ(X,g.yb-230,X,60,10,8);ground(X,60,60,true);flywheel(X,this.O[1],60,g.phi,C['brass-fill']);bar(X,this.O[1],g.pin[0],g.pin[1],10,C.part2);bar(g.pin[0],g.pin[1],X,g.yb,8,C.part);pivot(g.pin[0],g.pin[1],4);pivot(X,g.yb,4);
    label('SPRING KEEPS THE BLADE TAUT',X+30,110);label('CRANK PULLS IT DOWN',X+80,this.O[1]);},
  reads(){return[['Stroke',`${2*this.r} mm`],['Guide','not needed, the spring holds it']];}});

/* 409 proportional compasses */
reg({num:409,outLabel:'Large opening, mm',params:[{id:'f',label:'Pivot position',min:0.25,max:0.5,step:0.01,value:0.35,fmt:v=>`ratio ${(v/(1-v)).toFixed(2)} : 1`}],L:360,
  update(phi){const al=0.15+0.25*(1+Math.sin(phi))/2;this.g={phi,al};},output(){const f=this.P.f;return 2*(1-f)*this.L*Math.sin(this.g.al/2);},
  draw(){const g=this.g,f=this.P.f,L=this.L,P=[400,70+f*L];for(const s of [-1,1]){const a=PI/2+s*g.al/2;const top=[P[0]-f*L*Math.cos(a),P[1]-f*L*Math.sin(a)],bot=[P[0]+(1-f)*L*Math.cos(a),P[1]+(1-f)*L*Math.sin(a)];bar(top[0],top[1],bot[0],bot[1],12,s<0?C['brass-fill']:C.part);}
    ctx.beginPath();ctx.rect(P[0]-16,P[1]-12,32,24);paint(C['steel-fill'],C.ink);pivot(P[0],P[1],5);label('SLIDE THE PIVOT TO SET THE RATIO',P[0]+30,P[1]);},
  reads(){const g=this.g,f=this.P.f,L=this.L;const s=2*f*L*Math.sin(g.al/2),b=2*(1-f)*L*Math.sin(g.al/2);return[['Small points',`${s.toFixed(0)} mm`],['Large points',`${b.toFixed(0)} mm`],['Ratio',`${(b/s).toFixed(2)} : 1`]];}});

/* water wheels: 431 undershot, 442 noria, 487 paddle wheel, 489 feathering paddles */
function flowLines(y0,y1,phi,dir){ctx.save();ctx.strokeStyle=C.ink;ctx.globalAlpha=.35;ctx.lineWidth=1.2;ctx.setLineDash([24,30]);ctx.lineDashOffset=-dir*phi*40;for(let y=y0+10;y<y1;y+=16){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(800,y);ctx.stroke();}ctx.restore();}
reg({num:431,outLabel:'Wheel turns',
  update(phi){this.g={phi,a:-phi*0.5};},output(){return -this.g.a/TAU;},
  draw(){const g=this.g,Cc=[400,240],R=170;water(0,380,800,140);flowLines(380,520,g.phi,1);
    circ(Cc[0],Cc[1],R-20);circ(Cc[0],Cc[1],R-40,false);paint(C.part,C.ink);for(let k=0;k<8;k++){const a=g.a+k*PI/4;bar(Cc[0],Cc[1],Cc[0]+(R-30)*Math.cos(a),Cc[1]+(R-30)*Math.sin(a),8,C.part2);}
    for(let k=0;k<16;k++){const a=g.a+k*TAU/16;bar(Cc[0]+(R-30)*Math.cos(a),Cc[1]+(R-30)*Math.sin(a),Cc[0]+(R+30)*Math.cos(a),Cc[1]+(R+30)*Math.sin(a),12,C['brass-fill']);}
    pivot(Cc[0],Cc[1],8);label('CURRENT PUSHES THE LOWER PADDLES',400,505,'center');},
  reads(v){return[['Wheel speed',rpmOf(Math.abs(v))],['Driven by','flowing water, not its weight']];}});
reg({num:442,outLabel:'Wheel turns',
  update(phi){this.g={phi,a:-phi*0.4};},output(){return -this.g.a/TAU;},
  draw(){const g=this.g,Cc=[400,260],R=180;water(0,400,800,120);flowLines(400,520,g.phi,1);
    ctx.beginPath();ctx.rect(120,62,200,22);paint(C.part2,C.ink);water(124,66,192,10);
    circ(Cc[0],Cc[1],R);circ(Cc[0],Cc[1],R-18,false);paint(C.part,C.ink);for(let k=0;k<8;k++){const a=g.a+k*PI/4;bar(Cc[0],Cc[1],Cc[0]+(R-10)*Math.cos(a),Cc[1]+(R-10)*Math.sin(a),8,C.part2);}
    for(let k=0;k<12;k++){const a=g.a+k*TAU/12,x=Cc[0]+R*Math.cos(a),y=Cc[1]+R*Math.sin(a);const am=mod(a+PI,TAU)-PI;const full=am>-PI/2&&am<PI/2+0.3;ctx.beginPath();ctx.rect(x-14,y-6,28,26);paint(C['brass-fill'],C.ink);if(full){water(x-12,y+2,24,16);}
      const pr=[x+R*0.12*Math.cos(a),y];bar(x,y,x+20*Math.cos(a),y+20*Math.sin(a),5,C['brass-fill']);}
    pivot(Cc[0],Cc[1],8);label('POTS FILL BELOW, EMPTY INTO THE TROUGH',420,40,'center');},
  reads(v){return[['Wheel speed',rpmOf(Math.abs(v))],['Lift','almost the full wheel height']];}});
function paddle(num,feather){return reg({num,outLabel:'Wheel turns',
  update(phi){this.g={phi,a:phi*0.5};},output(){return this.g.a/TAU;},
  draw(){const g=this.g,Cc=[450,250],R=150;ctx.beginPath();ctx.moveTo(0,190);ctx.lineTo(340,190);ctx.quadraticCurveTo(300,340,200,360);ctx.lineTo(0,360);ctx.closePath();paint(C.part,C.ink);
    circ(Cc[0],Cc[1],R-30);paint(null,C.ink,1.2);for(let k=0;k<8;k++){const a=g.a+k*PI/4;const t=[Cc[0]+R*Math.cos(a),Cc[1]+R*Math.sin(a)];bar(Cc[0],Cc[1],t[0],t[1],7,C.part2);
      ctx.save();ctx.translate(t[0],t[1]);ctx.rotate(feather?0:a);ctx.beginPath();ctx.rect(feather?-6:-30,feather?-30:-6,feather?12:60,feather?60:12);paint(C['brass-fill'],C.ink);ctx.restore();}
    if(feather){const E=[Cc[0]+40,Cc[1]];circ(E[0],E[1],12);paint(C['steel-fill'],C.ink);for(let k=0;k<8;k++){const a=g.a+k*PI/4,t=[Cc[0]+R*Math.cos(a),Cc[1]+R*Math.sin(a)];bar(t[0],t[1],t[0]+40,t[1],5,C.part);bar(E[0],E[1],t[0]+40,t[1],3,C['steel-fill']);}}
    pivot(Cc[0],Cc[1],7);ctx.save();ctx.globalAlpha=.85;water(0,330,800,190);ctx.restore();flowLines(330,520,g.phi,1);
    label(feather?'PADDLES KEPT UPRIGHT BY AN ECCENTRIC':'PADDLES PUSH WATER AFT',Cc[0],60,'center');},
  reads(v){return[['Wheel speed',rpmOf(Math.abs(v))],['Paddles',feather?'enter and leave edge-on':'fixed to the arms']];}});}
paddle(487,false);paddle(489,true);

/* 438 Barker's mill */
reg({num:438,outLabel:'Arm turns',
  update(phi){this.g={phi:phi*0.7};},output(){return this.g.phi/TAU;},
  draw(){const g=this.g,X=400,y=400,L=170;ctx.beginPath();ctx.rect(X-60,60,120,70);paint(C.part2,C.ink);water(X-56,70,112,56);ctx.beginPath();ctx.rect(X-12,130,24,y-130);paint(C.part2,C.ink);water(X-8,130,16,y-130);
    const ends=[0,1].map(k=>{const a=g.phi+k*PI;return{a,x:X+L*Math.cos(a),y:y+30*Math.sin(a),z:Math.sin(a)};}).sort((a,b)=>a.z-b.z);
    for(const e of ends){ctx.save();ctx.globalAlpha=e.z<0?.6:1;bar(X,y,e.x,e.y,14,C['steel-fill']);for(let i=1;i<7;i++){const t=e.a+PI/2-i*0.09;const px=X+(L+i*14)*Math.cos(e.a)+i*12*Math.cos(e.a-PI/2),py=y+30*Math.sin(e.a)+i*4;circ(px,py,4-i*0.4);ctx.fillStyle=C.steel;ctx.globalAlpha=(e.z<0?.4:.8)*(1-i/7);ctx.fill();}ctx.restore();}
    pivot(X,y,6);ground(X,480,60);label('WATER JETS FROM THE ARM TIPS',X+190,y-60);},
  reads(v){return[['Arm speed',rpmOf(Math.abs(v))],['Push','reaction of the jets']];}});

/* 440 tipping trough */
reg({num:440,outLabel:'Tips',
  update(phi){const c=phi/PI,k=Math.floor(c),u=c-k,side=k%2?-1:1;const th0=0.32;let th,fill;if(u<0.8){th=side*th0;fill=u/0.8;}else{const s=smooth((u-0.8)/0.2);th=side*th0*(1-2*s);fill=1-s;}this.g={phi,th,fill,side,k};},
  output(){return this.g.k;},
  draw(){const g=this.g,P=[400,330];water(390,60,20,P[1]-60-60);
    ctx.save();ctx.translate(P[0],P[1]);ctx.rotate(g.th);ctx.beginPath();ctx.moveTo(-200,-70);ctx.lineTo(-200,0);ctx.lineTo(200,0);ctx.lineTo(200,-70);ctx.moveTo(0,0);ctx.lineTo(0,-80);ctx.strokeStyle=C.ink;ctx.lineWidth=5;ctx.stroke();
    const sx=g.side>0?-1:1;ctx.fillStyle=WATER();ctx.fillRect(sx>0?3:-197,-g.fill*60,194,g.fill*60);ctx.restore();
    ctx.beginPath();ctx.moveTo(P[0],P[1]);ctx.lineTo(P[0]-20,P[1]+60);ctx.lineTo(P[0]+20,P[1]+60);ctx.closePath();paint(C.part2,C.ink);pivot(P[0],P[1],6);ground(P[0],P[1]+60,80);
    label('EACH TIP MEASURES A FIXED VOLUME',P[0],480,'center');},
  reads(){const g=this.g;return[['Tips counted',`${g.k}`],['Filling side',g.side>0?'left':'right']];}});

/* 450 force pump */
reg({num:450,outLabel:'Plunger height, mm',
  update(phi){this.g={phi,y:300-110*(1-Math.cos(phi))/2,up:Math.sin(phi)>0};},output(){return 300-this.g.y;},
  draw(){const g=this.g,X=360;ctx.beginPath();ctx.rect(X-60,150,12,300);ctx.rect(X+48,150,12,300);paint(C.part2,C.ink);water(X-48,g.y+20,96,430-g.y);water(X-10,440,20,60);water(200,490,400,30);
    ctx.beginPath();ctx.rect(X-48,g.y,96,20);paint(C['brass-fill'],C.ink);bar(X,g.y,X,90,10,C.part);
    ctx.beginPath();ctx.rect(X+60,380,160,16);paint(C.part2,C.ink);water(X+62,382,156,12);ctx.beginPath();ctx.rect(X+204,140,16,256);paint(C.part2,C.ink);if(!g.up){water(X+206,140,12,240);ctx.save();ctx.fillStyle=WATER();ctx.beginPath();ctx.moveTo(X+212,140);ctx.quadraticCurveTo(X+240,90,X+280,160);ctx.lineTo(X+270,160);ctx.quadraticCurveTo(X+236,104,X+216,140);ctx.fill();ctx.restore();}
    ctx.save();ctx.translate(X+60,388);ctx.rotate(g.up?0:-0.7);ctx.beginPath();ctx.rect(0,-2,26,4);paint(C.steel,C.ink);ctx.restore();ctx.save();ctx.translate(X-30,440);ctx.rotate(g.up?-0.7:0);ctx.beginPath();ctx.rect(0,-2,60,4);paint(C.steel,C.ink);ctx.restore();
    label(g.up?'UPSTROKE · water drawn in':'DOWNSTROKE · water forced out',X-60,120);label('OUTLET',X+240,180);},
  reads(){const g=this.g;return[['Stroke',g.up?'up':'down'],['Plunger','solid, no valve'],['Lift','set by the pump force, not air pressure']];}});

/* 457 well sweep */
reg({num:457,outLabel:'Bucket depth, mm',
  update(phi){this.g={phi,a:-0.35+0.55*(1-Math.cos(phi))/2};},output(){return this.g.a;},
  draw(){const g=this.g,P=[330,200],L1=320,L2=130,E=[P[0]+L1*Math.cos(g.a),P[1]+L1*Math.sin(g.a)],W=[P[0]-L2*Math.cos(g.a),P[1]-L2*Math.sin(g.a)];
    ctx.beginPath();ctx.rect(P[0]-10,P[1],20,300);paint(C.part2,C.ink);bar(W[0],W[1],E[0],E[1],12,C['brass-fill']);weight(W[0],W[1]+4,60,50,'');rope([[E[0],E[1]],[E[0],E[1]+180]]);
    ctx.beginPath();ctx.rect(E[0]-20,E[1]+180,40,40);paint(C['steel-fill'],C.ink);ctx.beginPath();ctx.rect(560,380,160,140);paint(C.part2,C.ink);water(575,430,130,90);ctx.save();ctx.fillStyle=C.sheet;ctx.fillRect(575,380,130,50);ctx.restore();
    pivot(P[0],P[1],6);label('COUNTERWEIGHT',W[0]-40,W[1]-30);label('WELL',640,370,'center');},
  reads(){return[['Counterweight','about half the full bucket'],['Effort','light both ways']];}});

/* 458 two-bucket well */
reg({num:458,outLabel:'Left bucket height, mm',
  update(phi){this.g={phi,s:200*(1-Math.cos(phi))/2};},output(){return this.g.s;},
  draw(){const g=this.g,P=[400,90],r=50;ctx.beginPath();ctx.rect(300,30,200,14);paint(C.part2,C.ink);bar(P[0],44,P[0],P[1],6,C.part);
    const yl=420-g.s,yr=220+g.s;rope([[P[0]-r,P[1]],[P[0]-r,yl]]);rope([[P[0]+r,P[1]],[P[0]+r,yr]]);pulley(P[0],P[1],r,g.s/r,C['brass-fill']);
    ctx.beginPath();ctx.rect(270,300,260,220);paint(C.part2,C.ink);ctx.save();ctx.fillStyle=C.sheet;ctx.fillRect(285,300,230,220);ctx.restore();water(285,420,230,100);
    for(const [x,y] of [[P[0]-r,yl],[P[0]+r,yr]]){ctx.beginPath();ctx.rect(x-22,y,44,40);paint(C['steel-fill'],C.ink);if(y>300)water(x-20,y+8,40,30);}
    label('ONE BUCKET RISES AS THE OTHER SINKS',400,280,'center');},
  reads(){return[['Effort','only the water is lifted, buckets balance']];}});

/* 462 chain pump */
reg({num:462,outLabel:'Chain travel, mm',
  update(phi){this.g={phi,s:45*phi};},output(){return this.g.s;},
  draw(){const g=this.g,T=[400,100],B=[400,450],r=36;const pts=beltPoly(T[0],T[1],r,B[0],B[1],r,false,3),ap=alongPoly(pts);
    ctx.beginPath();ctx.rect(T[0]-r-22,140,24,300);paint(C.part2,C.ink);water(T[0]-r-18,150,16,290);water(260,440,280,80);
    ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(...pts[0]);for(const p of pts)ctx.lineTo(...p);ctx.closePath();ctx.stroke();ctx.restore();
    for(let s=0;s<ap.total;s+=40){const q=ap.at(s-g.s);ctx.save();ctx.translate(q[0],q[1]);ctx.rotate(q[2]);ctx.beginPath();ctx.rect(-3,-12,6,24);paint(C['brass-fill'],C.ink);ctx.restore();}
    pulley(T[0],T[1],r,-g.phi*1.25,C['brass-fill']);pulley(B[0],B[1],r,-g.phi*1.25,C.part);ctx.beginPath();ctx.rect(T[0]-r-110,130,90,14);paint(C.part2,C.ink);water(T[0]-r-108,124,86,8);
    label('DISKS CARRY WATER UP THE TUBE',T[0]+60,260);label('SPOUT',T[0]-r-110,160);},
  reads(v){return[['Chain speed',`${Math.abs(v).toFixed(0)} mm/s`],['Lift','continuous flow']];}});

/* 470 steam hammer */
reg({num:470,outLabel:'Hammer height, mm',
  update(phi){const u=mod(phi/TAU,1);let h;if(u<0.65)h=smooth(u/0.65);else if(u<0.73){const t=(u-0.65)/0.08;h=1-t*t;}else h=0;this.g={phi,h,u};},output(){return this.g.h*160;},
  draw(){const g=this.g,X=400,y=330-g.h*160;ctx.beginPath();ctx.rect(X-190,40,40,440);ctx.rect(X+150,40,40,440);paint(C.part2,C.ink);ctx.beginPath();ctx.rect(X-60,40,120,120);paint(C.part2,C.ink);
    ctx.beginPath();ctx.rect(X-50,50+(1-g.h)*60,100,20);paint(C['steel-fill'],C.ink);bar(X,60+(1-g.h)*60,X,y,14,C.part);ctx.beginPath();ctx.rect(X-70,y,140,70);paint(C['steel-fill'],C.ink);
    ctx.beginPath();ctx.rect(X-60,412,120,24);paint(C['brass-fill'],C.ink);ctx.beginPath();ctx.rect(X-90,436,180,50);paint(C.part2,C.ink);ground(X,486,300);
    label(g.u<0.65?'STEAM LIFTS THE HAMMER':g.u<0.73?'STEAM RELEASED · it falls':'BLOW',X+200,200);},
  reads(){const g=this.g;return[['Phase',g.u<0.65?'lifting':g.u<0.73?'falling':'struck'],['Hammer',`${(g.h*160).toFixed(0)} mm up`]];}});

/* 474 aeolipile */
reg({num:474,outLabel:'Sphere turns',
  update(phi){this.g={phi};},output(){return this.g.phi/TAU;},
  draw(){const g=this.g,O=[400,230],R=90;ctx.beginPath();ctx.rect(240,380,320,110);paint(C.part2,C.ink);water(256,400,288,60);
    for(const s of [-1,1]){bar(O[0]+s*130,390,O[0]+s*130,O[1],12,C.part);bar(O[0]+s*130,O[1],O[0]+s*R,O[1],10,C.part);}
    circ(O[0],O[1],R);paint(C['brass-fill'],C.ink);ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=1;for(let k=0;k<6;k++){const t=g.phi+k*PI/6;if(Math.sin(t)>0){ctx.beginPath();ctx.ellipse(O[0],O[1]-R*Math.cos(t)*0,R*0.08+0,R,0,0,TAU);}}
    for(let k=0;k<6;k++){const t=g.phi+k*PI/6;const y=O[1]+R*Math.cos(t);if(Math.sin(t)>0){ctx.globalAlpha=Math.sin(t);ctx.beginPath();ctx.moveTo(O[0]-R*Math.sin(Math.acos(clamp(Math.cos(t),-1,1))),y);ctx.lineTo(O[0]+R*Math.sin(Math.acos(clamp(Math.cos(t),-1,1))),y);ctx.stroke();}}ctx.restore();
    for(const k of [0,1]){const t=g.phi+k*PI,y=O[1]-R*Math.cos(t),z=Math.sin(t);if(z>-0.2){const tip=[O[0]+10,y-14*Math.sin(t)];bar(O[0],y,O[0],y,10,C['brass-fill']);ctx.save();ctx.globalAlpha=.25+.6*Math.max(0,z);for(let i=1;i<6;i++){circ(O[0]+i*16*(k?-1:1)*0.0+i*14*(Math.sin(t)>0?1:-1)*0.6,y+i*10*Math.sin(t)*(k?1:-1),3+i*1.5);ctx.fillStyle=C.muted;ctx.fill();}ctx.restore();}}
    label('STEAM JETS SPIN THE SPHERE',O[0]+120,O[1]-110);label('BOILER',O[0],505,'center');},
  reads(v){return[['Spin',rpmOf(Math.abs(v))],['Inventor','Hero of Alexandria, 1st century']];}});

/* 486 feathering windmill (top view) */
reg({num:486,outLabel:'Rotor turns',
  update(phi){this.g={phi:phi*0.5};},output(){return this.g.phi/TAU;},
  draw(){const g=this.g,O=[420,260],L=170;ctx.save();ctx.strokeStyle=C.muted;ctx.lineWidth=1.4;for(let i=0;i<6;i++){const y=90+i*36,x=60+mod(g.phi*60+i*20,80);linArrow(x,y,40,C.muted);}ctx.restore();
    for(let k=0;k<4;k++){const a=-g.phi+k*PI/2,E=[O[0]+L*Math.cos(a),O[1]+L*Math.sin(a)];bar(O[0],O[1],E[0],E[1],8,C.part2);const vx=Math.sin(a);const catching=vx>0;const sa=catching?0:PI/2;
      ctx.save();ctx.translate(E[0],E[1]);ctx.rotate(sa);ctx.beginPath();ctx.rect(-6,-40,12,80);paint(catching?C['brass-fill']:C.part,C.ink);ctx.restore();pivot(E[0],E[1],4);}
    pivot(O[0],O[1],8);label('WIND',60,60);label('SAILS FACE THE WIND ONE WAY, TURN EDGE-ON COMING BACK',400,500,'center');},
  reads(v){return[['Rotor',rpmOf(Math.abs(v))],['Axis','vertical'],['View','from above']];}});

/* 490 ship's wheel and tiller ropes */
reg({num:490,outLabel:'Tiller angle, degrees',
  update(phi){const w=1.4*PI*Math.sin(phi);this.g={phi,w,t:0.42*Math.sin(phi)};},output(){return this.g.t*180/PI;},
  draw(){const g=this.g,P=[400,110],T=[P[0]+200*Math.sin(g.t),P[1]+200*Math.cos(g.t)];ctx.beginPath();ctx.moveTo(P[0],P[1]);ctx.lineTo(P[0]-90*Math.sin(g.t)-14,P[1]-90*Math.cos(g.t));ctx.lineTo(P[0]-90*Math.sin(g.t)+14,P[1]-90*Math.cos(g.t));ctx.closePath();paint(C['steel-fill'],C.ink);
    bar(P[0],P[1],T[0],T[1],12,C['steel-fill']);const GL=[[150,150],[150,430]],GR=[[650,150],[650,430]],D=[400,430];
    rope([T,GL[0],GL[1],[D[0]-30,D[1]]]);rope([T,GR[0],GR[1],[D[0]+30,D[1]]]);for(const q of [...GL,...GR])pulley(q[0],q[1],14,g.w,C.part);
    ctx.beginPath();ctx.rect(D[0]-30,D[1]-20,60,40);paint(C['brass-fill'],C.ink);const Wc=[400,430];circ(Wc[0],Wc[1]+0,0);
    ctx.save();ctx.translate(400,490);for(let k=0;k<8;k++){const a=g.w+k*PI/4;bar(0,0,40*Math.cos(a),40*Math.sin(a)*0.25,4,C['brass-fill']);}ctx.restore();
    pivot(P[0],P[1],6);label('RUDDER',P[0]+30,P[1]-70);label('TILLER',T[0]+16,T[1]);label('WHEEL BARREL',D[0]+50,D[1]);},
  reads(){const g=this.g;return[['Wheel',`${(g.w/TAU).toFixed(2)} turns`],['Tiller',`${(g.t*180/PI).toFixed(0)}°`]];}});

/* 491 capstan */
reg({num:491,outLabel:'Capstan turns',N:16,
  update(phi){this.g={phi,a:phi*0.3};},output(){return this.g.a/TAU;},
  draw(){const g=this.g,O=[400,270];sawWheel(O[0],O[1],g.a,this.N,150,168,C.part2);circ(O[0],O[1],70);paint(C['brass-fill'],C.ink);
    rope([[O[0],O[1]-70],[780,O[1]-70]]);for(let k=0;k<6;k++){const a=g.a+k*PI/3;bar(O[0]+60*Math.cos(a),O[1]+60*Math.sin(a),O[0]+230*Math.cos(a),O[1]+230*Math.sin(a),12,C['brass-fill']);}
    for(const pa of [PI*0.75,PI*0.25]){const pv=[O[0]+190*Math.cos(pa),O[1]+190*Math.sin(pa)],rel=pa-0.12-g.a,rr=sawR(rel,this.N,150,168)+2;bar(pv[0],pv[1],O[0]+rr*Math.cos(pa-0.12),O[1]+rr*Math.sin(pa-0.12),8,C.part);pivot(pv[0],pv[1],4);}
    pivot(O[0],O[1],7);label('PAWLS STOP IT RUNNING BACK',O[0]+140,O[1]+200);label('ROPE',740,O[1]-90);},
  reads(){const g=this.g;return[['Turns',`${(g.a/TAU).toFixed(2)}`],['View','from above'],['Bars','6, pushed by the crew']];}});

/* 497 centrifugal fan */
reg({num:497,outLabel:'Rotor turns',
  update(phi){this.g={phi:phi*1.2};},output(){return this.g.phi/TAU;},
  draw(){const g=this.g,O=[380,280];const pts=[];for(let i=0;i<=200;i++){const t=-PI/2+i/200*TAU;const r=130+50*i/200;pts.push([O[0]+r*Math.cos(t),O[1]+r*Math.sin(t)]);}
    const e=pts[pts.length-1];poly([...pts,[e[0]+220,e[1]],[e[0]+220,O[1]-130],[O[0],O[1]-130]]);ctx.closePath();paint(C.part,C.ink);
    for(let k=0;k<8;k++){const a=g.phi+k*PI/4;ctx.beginPath();ctx.moveTo(O[0]+40*Math.cos(a),O[1]+40*Math.sin(a));ctx.quadraticCurveTo(O[0]+90*Math.cos(a+0.15),O[1]+90*Math.sin(a+0.15),O[0]+115*Math.cos(a+0.45),O[1]+115*Math.sin(a+0.45));ctx.strokeStyle=C.ink;ctx.lineWidth=7;ctx.stroke();ctx.strokeStyle=C['brass-fill'];ctx.lineWidth=4;ctx.stroke();}
    circ(O[0],O[1],40);paint(C.hi,C.ink);pivot(O[0],O[1],6);
    ctx.save();ctx.fillStyle=C.steel;for(let i=0;i<40;i++){const f=mod(g.phi*0.25+i/40,1);let x,y;if(f<0.7){const t=-PI/2+(i*0.61)+f*TAU*1.1,r=40+f/0.7*130;x=O[0]+r*Math.cos(t);y=O[1]+r*Math.sin(t);}else{x=e[0]+(f-0.7)/0.3*220;y=O[1]-150+((i*37)%110);}circ(x,y,2.5);ctx.globalAlpha=.7;ctx.fill();}ctx.restore();
    label('AIR IN AT THE CENTRE',O[0]-60,O[1]+200);label('OUT UNDER PRESSURE',e[0]+120,O[1]-150,'center');},
  reads(v){return[['Rotor',rpmOf(Math.abs(v))],['Air path','in at the eye, flung outward']];}});

/* 498 U-tube manometer */
reg({num:498,outLabel:'Level difference, mm',
  update(phi){const p=(1-Math.cos(phi))/2;this.g={phi,p,h:p*200};},output(){return this.g.h;},
  draw(){const g=this.g,yb=420,xl=300,xr=480,base=300;const yl=base+g.h/2,yr=base-g.h/2;
    ctx.save();ctx.lineWidth=26;ctx.strokeStyle=C.ink;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(xl,120);ctx.lineTo(xl,yb);ctx.arc((xl+xr)/2,yb,(xr-xl)/2,PI,0,true);ctx.lineTo(xr,90);ctx.stroke();ctx.strokeStyle=C.sheet;ctx.lineWidth=20;ctx.stroke();
    ctx.strokeStyle=C.steel;ctx.lineWidth=20;ctx.lineCap='butt';ctx.beginPath();ctx.moveTo(xl,yl);ctx.lineTo(xl,yb);ctx.arc((xl+xr)/2,yb,(xr-xl)/2,PI,0,true);ctx.lineTo(xr,yr);ctx.stroke();ctx.restore();
    ctx.beginPath();ctx.rect(120,60,200,70);paint(C['brass-fill'],C.ink);label('VESSEL',220,95,'center');
    for(let i=0;i<=10;i++){const y=base-100+i*20;ctx.beginPath();ctx.moveTo(xr+20,y);ctx.lineTo(xr+(i%5?30:40),y);ctx.strokeStyle=C.ink;ctx.lineWidth=1;ctx.stroke();}
    ctx.save();ctx.setLineDash([4,4]);ctx.strokeStyle=C.muted;ctx.beginPath();ctx.moveTo(xl-30,yl);ctx.lineTo(xr+60,yl);ctx.moveTo(xr-30,yr);ctx.lineTo(xr+60,yr);ctx.stroke();ctx.restore();label(`h = ${g.h.toFixed(0)} mm`,xr+70,(yl+yr)/2);},
  reads(){const g=this.g;return[['Level difference',`${g.h.toFixed(0)} mm`],['Pressure','proportional to the difference']];}});

/* 501 barometer */
reg({num:501,outLabel:'Mercury column, mm',
  update(phi){this.g={phi,h:760+18*Math.sin(phi*0.4)};},output(){return this.g.h;},
  draw(){const g=this.g,X=400,yb=440,hy=mm=>yb-(100+(mm-700)*3),top=hy(g.h);ctx.beginPath();ctx.rect(X-16,40,32,yb-40);paint(C.sheet,C.ink,1.6);ctx.save();ctx.fillStyle=C.steel;ctx.fillRect(X-12,top,24,yb-top);ctx.restore();
    ctx.beginPath();ctx.rect(X-90,yb-10,180,60);paint(C.part2,C.ink);ctx.save();ctx.fillStyle=C.steel;ctx.fillRect(X-84,yb+2,168,42);ctx.restore();
    for(let mm=720;mm<=800;mm+=10){const y=hy(mm);ctx.beginPath();ctx.moveTo(X+20,y);ctx.lineTo(X+(mm%50?32:44),y);ctx.strokeStyle=C.ink;ctx.lineWidth=1;ctx.stroke();if(mm%20===0)label(String(mm),X+50,y);}
    label('VACUUM',X-30,60,'right');label('scale shows the top of the column',X+60,yb-60);label(g.h>770?'FAIR':g.h<750?'RAIN':'CHANGE',X-30,top,'right');},
  reads(){const g=this.g;return[['Column',`${g.h.toFixed(0)} mm of mercury`],['Higher means','fair weather']];}});
