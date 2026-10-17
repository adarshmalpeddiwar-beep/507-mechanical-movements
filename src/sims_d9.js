/* ================= audit pass 231–270 ================= */
/* 233 · two stops for a lantern wheel (20 staves). (a) a 12-tooth pinion meshing with the staves has one tooth space filled:
   after eleven staves the filled space meets a stave and the wheel stops. (b) a stud on the wheel strikes a fixed finger. */
reg({num:233,outLabel:'Lantern wheel, turns',O:[330,265],R:100,Ns:20,Zp:12,params:[{id:'m',type:'toggle',label:'Stop',options:[[0,'Filled tooth space'],[1,'Stud and finger']],value:0}],
  lim(){const p=TAU/this.Ns;return this.P.m===0?[-0.42*p,10.42*p]:[-PI+0.32,PI-0.32];},
  update(phi){const [a0,a1]=this.lim(),a=a0+(a1-a0)*(1-Math.cos(phi*0.4))/2;this.g={phi,a,a0,a1};},output(){return this.g.a/TAU;},
  draw(){const g=this.g,O=this.O,R=this.R,Ns=this.Ns,Zp=this.Zp,rp=Zp*R/Ns,P=[O[0]+R+rp,O[1]];
    circ(O[0],O[1],R+18);circ(O[0],O[1],R-18,false);paint(C.part,C.ink);for(let i=0;i<Ns;i++){const t=g.a+i*TAU/Ns;circ(O[0]+R*Math.cos(t),O[1]+R*Math.sin(t),5.5);paint(C.part2,C.ink);}
    circ(O[0],O[1],R-18);paint(C['steel-fill'],C.ink);pivot(O[0],O[1],6);
    if(this.P.m===0){const b=PI-PI/Zp-g.a*Ns/Zp;drawGear(P[0],P[1],rp,Zp,b,C['brass-fill'],{bore:5});const tb=b+PI/Zp+TAU/Zp*11;/* the filled space */
      const m=2*rp/Zp;ctx.beginPath();ctx.arc(P[0],P[1],rp+m*0.9,tb-PI/Zp*0.9,tb+PI/Zp*0.9);ctx.arc(P[0],P[1],rp-1.25*m,tb+PI/Zp*0.9,tb-PI/Zp*0.9,true);ctx.closePath();paint(C.brass,C.ink);pivot(P[0],P[1],5);
      label('PINION WITH ONE SPACE FILLED',P[0],P[1]+rp+40,'center');}
    else{const s=[O[0]+(R-40)*Math.cos(g.a),O[1]+(R-40)*Math.sin(g.a)];circ(s[0],s[1],9);paint(C.brass,C.ink);const F=[O[0]-R+10,O[1]];ctx.beginPath();ctx.rect(F[0]-80,F[1]-7,96,14);paint(C['brass-fill'],C.ink);pivot(F[0]-70,F[1],5);ground(F[0]-70,F[1]+10,30);label('FIXED FINGER',F[0]-60,F[1]-20,'center');label('STUD',s[0]+12,s[1]-10);}
    const stop=g.a<g.a0+0.02||g.a>g.a1-0.02;label(stop?'STOPPED':'TURNING',O[0],O[1]+R+50,'center');},
  reads(){const g=this.g;return[['Turns made',`${((g.a-g.a0)/TAU).toFixed(2)}`],['Free travel',`${((g.a1-g.a0)/TAU).toFixed(2)} turn`]];}});

/* 252 · two slanted slots in the slide, kept inside the plate; each roller's rod is guided straight, so both move in or out equally */
{const m=SIMS_NEW[252];m.draw=function(){const g=this.g,X=400+g.x,y=270,k=0.5;ctx.beginPath();ctx.rect(X-160,y-130,320,260);paint(C['steel-fill'],C.ink);
  for(const s of [-1,1]){const p0=[X-130,y+s*(60-k*130*0)],a=s*Math.atan(k);ctx.save();ctx.translate(X,y+s*60);ctx.rotate(-s*Math.atan(k));ctx.beginPath();ctx.rect(-140,-10,280,20);ctx.restore();ctx.fillStyle=C.sheet;ctx.fill();ctx.strokeStyle=C.ink;ctx.lineWidth=1;ctx.stroke();}
  for(const s of [-1,1]){const yy=y+s*(60+(-g.x)*k);circ(400,yy,10);paint(C.hi,C.ink);bar(400,yy,400,y+s*230,10,C.part);ctx.beginPath();ctx.rect(386,y+s*200-10,28,20);paint(C.part2,C.ink);}
  bar(X+160,y,760,y,10,C.part);label('SLANTED SLOTS MOVE BOTH ROLLERS EQUALLY',600,60,'center');};
 m.update=function(phi){const x=80*Math.sin(phi);this.g={phi,x,s:60-x*0.5};};}


/* 260 · Brown: a differential screw worked by two wheels running at slightly different speeds. A countershaft carries two equal
   pinions; one drives a 20-tooth wheel fixed on the screw, the other a 21-tooth wheel on the nut. Screw and nut turn nearly together,
   so the nut creeps along the screw by only 1/21 of a pitch for each turn of the screw. */
reg({num:260,outLabel:'Nut travel, mm',concept:true,p:16,
  update(phi){const ts=phi,tn=phi*20/21,x=this.p*(ts-tn)/TAU;this.g={phi,ts,tn,x};},output(){return this.g.x;},
  draw(){const g=this.g,y=330,x0=140,x1=660,X=380+g.x*6;screwShaft(x0,x1,y,18,g.ts,this.p);ctx.beginPath();ctx.rect(x0-30,y-30,22,60);ctx.rect(x1+8,y-30,22,60);paint(C.part2,C.ink);
    drawGear(x0+40,y,60,20,g.ts,C['brass-fill'],{bore:6});ctx.beginPath();ctx.rect(X-40,y-26,80,52);paint(C['steel-fill'],C.ink);drawGear(X+60,y,60,21,g.tn,C['steel-fill'],{bore:6});
    const yc=y-84;bar(x0,yc,x1,yc,8,C.part);drawGear(x0+40,yc,24,8,-g.ts*20/8+PI/8,C.part,{bore:4});ctx.beginPath();ctx.rect(X-10,yc-24,140,48);paint(C.part,C.ink);drawGear(X+60,yc,24,8,-g.tn*21/8+PI/8,C.part,{bore:4});
    label('TWO EQUAL PINIONS ON THE COUNTERSHAFT',400,60,'center');label('20 teeth on the screw · 21 on the nut',400,80,'center');label('NUT creeps 1/21 pitch per turn',X,y+60,'center');},
  reads(){const g=this.g;return[['Screw turns',`${(g.ts/TAU).toFixed(2)}`],['Nut turns',`${(g.tn/TAU).toFixed(2)}`],['Nut travel',`${g.x.toFixed(2)} mm`]];}});

/* 239 · stops for a spur gear: (a) a stud on the wheel strikes a fixed stop; (b) the pinion has one tooth space filled, so the
   wheel can turn only as far as the pinion's other spaces allow */
reg({num:239,outLabel:'Wheel angle, degrees',A:[300,265],RA:100,ZA:40,rB:40,ZB:16,params:[{id:'m',type:'toggle',label:'Stop',options:[[0,'Stud and fixed stop'],[1,'Filled space in the pinion']],value:0}],
  lim(){const p=TAU/this.ZA;return this.P.m===0?[-PI+0.26,PI-0.26]:[-0.42*p,14.42*p];},
  update(phi){const [a0,a1]=this.lim(),a=a0+(a1-a0)*(1-Math.cos(phi*0.4))/2;this.g={phi,a,a0,a1};},output(){return this.g.a*180/PI;},
  draw(){const g=this.g,A=this.A,RA=this.RA,ZA=this.ZA,rB=this.rB,ZB=this.ZB,B=[A[0]+RA+rB,A[1]],b=PI-PI/ZB-g.a*ZA/ZB;
    drawGear(A[0],A[1],RA,ZA,g.a,C['brass-fill'],{bore:6});drawGear(B[0],B[1],rB,ZB,b,C['steel-fill'],{bore:5});pivot(A[0],A[1],6);pivot(B[0],B[1],5);
    if(this.P.m===0){const s=[A[0]+66*Math.cos(g.a+PI),A[1]+66*Math.sin(g.a+PI)];circ(s[0],s[1],9);paint(C.part2,C.ink);const F=[A[0]+66,A[1]];ctx.beginPath();ctx.rect(F[0]-8,F[1]-8,16,16);paint(C.part,C.ink);label('FIXED STOP',F[0],F[1]-16,'center');}
    else{const tb=b+PI/ZB+TAU/ZB*15,m=2*rB/ZB;ctx.beginPath();ctx.arc(B[0],B[1],rB+m*0.9,tb-PI/ZB*0.9,tb+PI/ZB*0.9);ctx.arc(B[0],B[1],rB-1.25*m,tb+PI/ZB*0.9,tb-PI/ZB*0.9,true);ctx.closePath();paint(C.steel,C.ink);}
    const stop=g.a<g.a0+0.02||g.a>g.a1-0.02;label(stop?'STOPPED':(this.P.m===0?'STUD ON THE WHEEL · fixed stop on the frame':'PINION WITH ONE SPACE FILLED'),400,470,'center');},
  reads(){const g=this.g;return[['Wheel',`${(g.a*180/PI).toFixed(0)}°`],['Free travel',`${((g.a1-g.a0)*180/PI).toFixed(0)}°`]];}});

/* 269 · Brown: continued rectilinear movement of the frame with mutilated racks gives an alternate rotary motion to the spur-gear.
   The frame's racks are cut in short lengths, upper and lower in turn; the frame moves steadily one way and the gear turns back and forth. */
reg({num:269,outLabel:'Gear angle, degrees',concept:true,P0:[400,270],rp:50,m:5,seg:8,nseg:4,
  geo(){const p=PI*this.m,L=this.seg*p;return{p,L,T:this.nseg*L};},
  update(phi){const G=this.geo(),s=G.T*(1-Math.cos(phi*0.25))/2,k=Math.floor(s/G.L),u=s-k*G.L,a=(k%2===0?-u:-(G.L-u))/this.rp;this.g={phi,s,a,top:k%2===0};},
  output(){return this.g.a*180/PI;},
  draw(){const g=this.g,G=this.geo(),P=this.P0,rp=this.rp,m=this.m,H=rp+1.25*m,X0=P[0]-g.s;/* frame-local x=0 at X0 */
    ctx.beginPath();ctx.rect(X0-rp-40,P[1]-H-30,G.T+2*rp+80,2*H+60);ctx.rect(X0-rp-30,P[1]-H,G.T+2*rp+60,2*H);paint(C['steel-fill'],C.ink);
    for(let k=0;k<G.T/G.L;k++){const top=k%2===0,x0=X0+k*G.L-G.L/2+(top?G.L/2:G.L/2),xa=X0+k*G.L,xb=xa+G.L;const y=top?P[1]-H:P[1]+H,dir=top?1:-1,pts=rackTeeth(xa,xb,X0+G.p/2,G.p,y+dir*1.25*m,m,top);poly([[xa,y],...pts,[xb,y]]);ctx.closePath();paint(C['steel-fill'],C.ink,.9);}
    drawGear(P[0],P[1],rp,20,g.a,C['brass-fill'],{bore:6});pivot(P[0],P[1],5);
    label('FRAME MOVES STEADILY ONE WAY · upper and lower part-racks turn the gear back and forth',400,490,'center');label(g.top?'UPPER RACK IN MESH':'LOWER RACK IN MESH',400,40,'center');},
  reads(){return[['In mesh',this.g.top?'upper rack':'lower rack'],['Frame travel',`${this.g.s.toFixed(0)} mm`]];}});
