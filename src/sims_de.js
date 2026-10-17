/* ================= audit pass 401–440 ================= */
/* 402 · two balances geared together turn in opposite directions, so a jolt that would speed one slows the other and the pair is
   undisturbed; one of them carries the half-cylinder of a cylinder escapement, which the escape wheel works through. */
cylEsc(402,{E:[400,390],R:85,label:'TWIN BALANCES GEARED TOGETHER · a jolt cannot disturb both',concept:true,br:14});
{const m=SIMS_NEW[402],base=m.draw;m.draw=function(){base.call(this);const G=this.G,g=this.g,A=[G.Cc[0],G.Cc[1]-130],B=[A[0]+150,A[1]],rg=75;
  drawGear(A[0],A[1],rg,30,g.th,C.part,{bore:6});drawGear(B[0],B[1],rg,30,-g.th+PI/30,C.part,{bore:6});balanceW(A,62,g.th);balanceW(B,62,-g.th);pivot(A[0],A[1],5);pivot(B[0],B[1],5);
  label('BALANCE ON THE CYLINDER STAFF',A[0]-80,A[1]-90,'center');label('SECOND BALANCE',B[0]+40,B[1]-90,'center');};
 m.reads=function(){const g=this.g,G=this.G;return[['Left balance',`${(g.th*180/PI).toFixed(0)}°`],['Right balance',`${(-g.th*180/PI).toFixed(0)}°`],['Escape wheel',`${(g.W/G.p).toFixed(2)} teeth`]];};}

/* 403 · cyclograph: two straight arms joined at a fixed angle slide against two fixed pins; by the inscribed-angle property the joint
   (where the pencil is) moves on a circular arc through the pins, however large its radius */
reg({num:403,outLabel:'Pencil height, mm',concept:true,A:[230,400],B:[570,400],gam:PI-0.32,
  reset(){this.trail=[];},
  geo(phi){const A=this.A,B=this.B,h=(B[0]-A[0])/2,R=h/Math.sin(PI-this.gam),C0=[(A[0]+B[0])/2,A[1]+Math.sqrt(R*R-h*h)],am=Math.asin(h/R)*0.85,a=am*Math.sin(phi*0.5);return{R,C0,a,P:[C0[0]+R*Math.sin(a),C0[1]-R*Math.cos(a)]};},
  update(phi){const q=this.geo(phi);this.g={phi,...q};this.trail=this.trail||[];this.trail.push(q.P);if(this.trail.length>400)this.trail.shift();},output(){return 400-this.g.P[1];},
  draw(){const g=this.g,A=this.A,B=this.B,P=g.P;ctx.save();ctx.strokeStyle=C.rule;ctx.setLineDash([4,5]);ctx.beginPath();ctx.arc(g.C0[0],g.C0[1],g.R,-PI/2-0.32,-PI/2+0.32);ctx.stroke();ctx.restore();
    if(this.trail.length>1){ctx.save();ctx.strokeStyle=C.steel;ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(...this.trail[0]);for(const q of this.trail)ctx.lineTo(...q);ctx.stroke();ctx.restore();}
    for(const Q of [A,B]){const d=[Q[0]-P[0],Q[1]-P[1]],L=Math.hypot(...d),u=[d[0]/L,d[1]/L],E=[P[0]+u[0]*(L+70),P[1]+u[1]*(L+70)];ctx.save();ctx.translate(P[0],P[1]);ctx.rotate(Math.atan2(u[1],u[0]));ctx.beginPath();ctx.rect(0,0,L+70,14);paint(C['brass-fill'],C.ink);ctx.restore();}
    for(const Q of [A,B]){circ(Q[0],Q[1],6);paint(C.ink);}circ(P[0],P[1],6);paint(C.hi,C.ink);label('FIXED PINS',400,430,'center');label('PENCIL AT THE JOINT',P[0],P[1]-18,'center');
    label('ARMS AT A FIXED ANGLE SLIDING ON TWO PINS · the joint draws an arc of great radius',400,495,'center');},
  reads(){const g=this.g;return[['Arc radius',`${g.R.toFixed(0)} mm`],['Arm angle',`${(this.gam*180/PI).toFixed(0)}°`]];}});

/* 419 · a self-rocking cradle: a clockwork-driven wheel carries a crank pin, and a rod from it to an arm on the cradle rocks the cradle
   to and fro (a crank-and-rocker four-bar) */
reg({num:419,outLabel:'Cradle angle, degrees',concept:true,Pv:[400,120],O:[640,380],r:26,La:200,
  geo(phi){const O=this.O,Pv=this.Pv,pin=[O[0]+this.r*Math.cos(phi),O[1]+this.r*Math.sin(phi)],Qr=[Pv[0]+120,Pv[1]+this.La],Lr=Math.hypot(O[0]-Qr[0],O[1]-Qr[1]),R=Math.hypot(120,this.La),Qa=Math.atan2(this.La,120);
    const Q=cc(Pv,R,pin,Lr,1);return{pin,Q,a:Math.atan2(Q[1]-Pv[1],Q[0]-Pv[0])-Qa};},
  update(phi){this.g={phi,...this.geo(phi)};},output(){return this.g.a*180/PI;},
  draw(){const g=this.g,P=this.Pv,O=this.O;ctx.save();ctx.translate(P[0],P[1]);ctx.rotate(g.a);bar(0,0,0,150,8,C.part);ctx.beginPath();ctx.moveTo(-160,150);ctx.lineTo(160,150);ctx.quadraticCurveTo(140,260,0,270);ctx.quadraticCurveTo(-140,260,-160,150);paint(C['brass-fill'],C.ink);bar(0,150,120,this.La,10,C.part2);ctx.restore();pivot(P[0],P[1],6);ground(P[0],P[1]-10,40,true);
    ctx.beginPath();ctx.rect(O[0]-70,O[1]-70,140,150);paint(C.part2,C.ink,.8);label('CLOCKWORK',O[0],O[1]+95,'center');flywheel(O[0],O[1],50,g.phi);bar(O[0],O[1],g.pin[0],g.pin[1],10,C['brass-fill']);bar(g.pin[0],g.pin[1],g.Q[0],g.Q[1],8,C.part);pivot(g.pin[0],g.pin[1],4);pivot(g.Q[0],g.Q[1],4);
    label('A CRANK DRIVEN BY CLOCKWORK ROCKS THE CRADLE BY A ROD',400,490,'center');},
  reads(){return[['Rock',`${(this.g.a*180/PI).toFixed(1)}°`]];}});

/* 408 · centrolinead: a straight-edge with two arms set at fixed angles to it; the arms slide against two pins. The joint of the arms
   runs on the circle through the two pins and the vanishing point, and the edge always points at that point however far off it is. */
reg({num:408,outLabel:'Edge angle, degrees',concept:true,A:[230,170],B:[230,350],V:[1700,260],
  circle(){const [A,B,V]=[this.A,this.B,this.V],ax=A[0],ay=A[1],bx=B[0],by=B[1],cx=V[0],cy=V[1],d=2*(ax*(by-cy)+bx*(cy-ay)+cx*(ay-by)),ux=((ax*ax+ay*ay)*(by-cy)+(bx*bx+by*by)*(cy-ay)+(cx*cx+cy*cy)*(ay-by))/d,uy=((ax*ax+ay*ay)*(cx-bx)+(bx*bx+by*by)*(ax-cx)+(cx*cx+cy*cy)*(bx-ax))/d;return{C:[ux,uy],R:Math.hypot(ax-ux,ay-uy)};},
  update(phi){const q=this.circle(),a0=Math.atan2(260-q.C[1],150-q.C[0]),a=PI+0.07*Math.sin(phi*0.5),H=[q.C[0]+q.R*Math.cos(a),q.C[1]+q.R*Math.sin(a)];this.g={phi,H,ang:Math.atan2(this.V[1]-H[1],this.V[0]-H[0])};},
  output(){return this.g.ang*180/PI;},
  draw(){const g=this.g,H=g.H,V=this.V;for(let k=-4;k<=4;k++){ctx.save();ctx.strokeStyle=C.rule;ctx.beginPath();ctx.moveTo(100,260+k*60);ctx.lineTo(800,260+k*60*(V[0]-800)/(V[0]-100));ctx.stroke();ctx.restore();}
    ctx.save();ctx.translate(H[0],H[1]);ctx.rotate(g.ang);ctx.beginPath();ctx.rect(0,-8,600,16);paint(C['brass-fill'],C.ink);ctx.restore();
    for(const Q of [this.A,this.B]){const d=[Q[0]-H[0],Q[1]-H[1]],L=Math.hypot(...d);ctx.save();ctx.translate(H[0],H[1]);ctx.rotate(Math.atan2(d[1],d[0]));ctx.beginPath();ctx.rect(0,-7,L+50,14);paint(C['steel-fill'],C.ink);ctx.restore();circ(Q[0],Q[1],6);paint(C.ink);}
    pivot(H[0],H[1],5);label('PINS',this.A[0]+16,this.A[1]-10);label('EDGE POINTS TO A VANISHING POINT FAR OFF THE BOARD',500,60,'center');label('CENTROLINEAD · the arms slide on two pins; every line ruled runs to the same far point',400,495,'center');},
  reads(){return[['Edge',`${(this.g.ang*180/PI).toFixed(1)}°`],['Vanishing point','1.5 m off the board']];}});

/* 412 · the head and the drum: the bars turn the head; single purchase turns the drum with it, triple purchase drives it through a
   reverted pair of gear trains in the base (12→18 and 10→20) so it turns a third as fast with three times the pull */
{const m=SIMS_NEW[412];m.update=function(phi){const h=phi*0.3;this.g={phi,h,d:h/this.P.m};};
 m.draw=function(){const g=this.g,O=[400,250],tri=this.P.m===3;ctx.beginPath();ctx.rect(O[0]-120,O[1]+170,240,30);paint(C.part2,C.ink);
  circ(O[0],O[1],100);paint(C['brass-fill'],C.ink);ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=1;for(let k=0;k<10;k++){const a=g.d+k*PI/5;ctx.beginPath();ctx.moveTo(O[0]+60*Math.cos(a),O[1]+60*Math.sin(a));ctx.lineTo(O[0]+100*Math.cos(a),O[1]+100*Math.sin(a));ctx.stroke();}ctx.restore();label('DRUM',O[0]+70,O[1]+110);
  for(let k=0;k<6;k++){const a=g.h+k*PI/3;bar(O[0],O[1],O[0]+230*Math.cos(a),O[1]+230*Math.sin(a)*0.35,10,C.part2);}circ(O[0],O[1],46);paint(C['steel-fill'],C.ink);pivot(O[0],O[1],6);label('HEAD AND BARS',O[0]-160,O[1]-50,'center');
  const G=[O[0]+170,O[1]+120];if(tri){drawGear(O[0]+90,O[1]+120,27,12,g.h,C.part,{bore:4});drawGear(G[0],G[1],40.5,18,-g.h*12/18+PI/18,C['steel-fill'],{bore:4});label('12 → 18 and 10 → 20 · ratio 3',O[0]+150,O[1]+175,'center');}
  label(tri?'TRIPLE PURCHASE · the drum turns a third as fast, with three times the pull':'SINGLE PURCHASE · head and drum locked together',400,40,'center');};}

/* 422 · sector engine: the piston is a vane swinging in a sector-shaped cylinder; its shaft carries an arm (set at a fixed angle to the
   vane) which drives the crank by a connecting rod, so vane and arm turn together */
{const m=SIMS_NEW[422];m.dOff=function(){if(this._d===undefined){let lo=1e9,hi=-1e9;for(let i=0;i<72;i++){const p=i/72*TAU,O=[560,330],pin=[O[0]+60*Math.cos(p),O[1]+60*Math.sin(p)],T=cc([250,330],200,pin,240,-1),t=Math.atan2(T[1]-330,T[0]-250);lo=Math.min(lo,t);hi=Math.max(hi,t);}this._d=-PI/2-(lo+hi)/2;}return this._d;};
 m.draw=function(){const g=this.g,A=g.A,v=g.th+this.dOff();ctx.beginPath();ctx.moveTo(A[0],A[1]);ctx.arc(A[0],A[1],180,-PI/2-0.9,-PI/2+0.9);ctx.closePath();paint(C.part2,C.ink);ctx.beginPath();ctx.moveTo(A[0],A[1]);ctx.arc(A[0],A[1],166,-PI/2-0.85,-PI/2+0.85);ctx.closePath();paint(C.sheet,C.ink);
  ctx.save();ctx.beginPath();ctx.moveTo(A[0],A[1]);ctx.arc(A[0],A[1],166,-PI/2-0.85,v);ctx.closePath();ctx.fillStyle=STEAM();ctx.globalAlpha=.6;ctx.fill();ctx.restore();
  bar(A[0],A[1],A[0]+166*Math.cos(v),A[1]+166*Math.sin(v),12,C['steel-fill']);bar(A[0],A[1],g.T[0],g.T[1],12,C.part);flywheel(g.O[0],g.O[1],90,g.phi);bar(g.T[0],g.T[1],g.pin[0],g.pin[1],10,C.part);bar(g.O[0],g.O[1],g.pin[0],g.pin[1],14,C['brass-fill']);
  pivot(A[0],A[1],6);pivot(g.T[0],g.T[1],4);pivot(g.pin[0],g.pin[1],4);label('SECTOR CYLINDER · the vane and the arm are fast on one shaft',A[0]+40,A[1]+40,'center');};}

/* 423 · Root's double-quadrant engine: two vane pistons on one rocking shaft swing in two opposite quadrant cylinders; an arm on the
   shaft drives the crank through a rod of fixed length (crank and rocker) */
reg({num:423,outLabel:"Crank turns",concept:true,A:[300,280],O:[600,170],r:50,La:125,
  geo(phi){const A=this.A,O=this.O,pin=[O[0]+this.r*Math.cos(phi),O[1]+this.r*Math.sin(phi)],E0=[A[0],A[1]-this.La],Lr=Math.hypot(O[0]-E0[0],O[1]-E0[1]),E=cc(A,this.La,pin,Lr,-1);return{pin,E,th:Math.atan2(E[1]-A[1],E[0]-A[0])+PI/2};},
  update(phi){this.g={phi,...this.geo(phi)};},output(){return this.g.phi/TAU;},
  draw(){const g=this.g,A=this.A,O=this.O;for(const s of [-1,1]){ctx.beginPath();ctx.moveTo(A[0],A[1]);ctx.arc(A[0],A[1],170,s>0?-0.7:PI-0.7,s>0?0.7:PI+0.7);ctx.closePath();paint(C.part2,C.ink);ctx.beginPath();ctx.moveTo(A[0],A[1]);ctx.arc(A[0],A[1],158,s>0?-0.66:PI-0.66,s>0?0.66:PI+0.66);ctx.closePath();paint(C.sheet,C.ink);}
    for(const s of [0,PI]){const v=s+g.th;ctx.save();ctx.beginPath();ctx.moveTo(A[0],A[1]);ctx.arc(A[0],A[1],158,s-0.66,v);ctx.closePath();ctx.fillStyle=STEAM();ctx.globalAlpha=.5;ctx.fill();ctx.restore();bar(A[0],A[1],A[0]+158*Math.cos(v),A[1]+158*Math.sin(v),12,C['steel-fill']);}
    bar(A[0],A[1],g.E[0],g.E[1],12,C.part);flywheel(O[0],O[1],80,g.phi);bar(g.E[0],g.E[1],g.pin[0],g.pin[1],10,C.part);bar(O[0],O[1],g.pin[0],g.pin[1],12,C['brass-fill']);pivot(A[0],A[1],7);pivot(g.E[0],g.E[1],4);pivot(g.pin[0],g.pin[1],4);
    label("ROOT'S DOUBLE-QUADRANT ENGINE · two vanes on one rocking shaft",400,490,'center');},
  reads(){return[['Vanes',`${(this.g.th*180/PI).toFixed(0)}°`],['Pistons','two, on one rocking shaft']];}});

/* 421 · trunk engine: a tube (the trunk) fixed to the piston passes out through the cylinder cover, and the connecting rod is jointed to
   the piston deep inside it, so a long rod fits in a short engine */
{const m=SIMS_NEW[421];m.O=[620,270];m.L=300;m.Lt=180;
 m.draw=function(){const g=this.g,O=this.O,y=O[1],cx0=140,cw=300,x=g.x;flywheel(O[0],O[1],100,g.phi+PI);
  ctx.beginPath();ctx.rect(cx0,y-70,cw,140);ctx.rect(cx0+12,y-58,cw-24,116);paint(C.part2,C.ink);steamBox(cx0+12,y-58,x-15-cx0-12,116,g.out);steamBox(x+15,y-58,cx0+cw-12-x-15,116,!g.out);
  ctx.beginPath();ctx.rect(x-15,y-56,30,112);paint(C['steel-fill'],C.ink);ctx.beginPath();ctx.rect(x+15,y-22,this.Lt,44);paint(C.part,C.ink);ctx.beginPath();ctx.rect(x+15,y-14,this.Lt,28);paint(C.sheet,C.ink,.6);
  bar(x,y,g.pin[0],g.pin[1],12,C.part2);pivot(x,y,4);pivot(g.pin[0],g.pin[1],4);bar(O[0],O[1],g.pin[0],g.pin[1],14,C['brass-fill']);pivot(O[0],O[1],6);
  label('CYLINDER',cx0+60,y-84,'center');label('TRUNK (fast to the piston)',x+15+this.Lt/2,y+46,'center');label('TRUNK ENGINE · the rod is jointed to the piston inside the trunk',400,490,'center');};}

/* rotary engines 426–428 (and 455, 456 later): vanes slide in the rotor and bear on the case. Shared geometry used by the drawing and
   the printable model. With fixed abutments (426) the vanes are drawn in as they pass them. */
const ROT={vaneL(o,a){const O=[400,265],R=150,e=o.e??40,rr=o.rr||100,Rc=[O[0]+e,O[1]],ux=Math.cos(a),uy=Math.sin(a),dx=Rc[0]-O[0],dy=Rc[1]-O[1],b=dx*ux+dy*uy;let L=-b+Math.sqrt(b*b-(dx*dx+dy*dy-R*R));
  if(o.abut){for(const s of [-PI/2,PI/2]){const d=Math.abs(Math.atan2(Math.sin(a-s),Math.cos(a-s)));if(d<0.45)L-=32*Math.cos(d/0.45*PI/2)**2;}}return L;}};
for(const n of [426,427,428]){const m=SIMS_NEW[n];if(!m)continue;const o=n===426?{e:0,rr:90,N:2,abut:true}:n===427?{e:30,rr:110,N:2}:{e:30,rr:110,N:2,rollers:true};m.ro=o;
  m.vaneL=a=>ROT.vaneL(o,a);
  const lab=n===426?'TWO SLIDING PISTONS ARE DRAWN IN TO PASS THE FIXED ABUTMENTS':n===427?'OFFSET SHAFT · the pistons slide out and in as the rotor turns':'RUBBER LINING PRESSED ON BY ROLLERS';
  m.draw=function(){const g=this.g,O=[400,265],R=150,e=o.e,rr=o.rr,Rc=[O[0]+e,O[1]];circ(O[0],O[1],R+18);paint(C.part2,C.ink);circ(O[0],O[1],R);paint(C.sheet,C.ink);
    if(o.rollers){ctx.save();ctx.strokeStyle=C.muted;ctx.lineWidth=6;ctx.beginPath();ctx.arc(O[0],O[1],R-3,0,TAU);ctx.stroke();ctx.restore();for(let k=0;k<6;k++){const a=k*PI/3;circ(O[0]+(R+9)*Math.cos(a),O[1]+(R+9)*Math.sin(a),8);paint(C.hi,C.ink);}}
    if(o.abut){for(const s of [-1,1]){ctx.beginPath();ctx.rect(O[0]-12,O[1]+s*R-(s>0?32:0),24,32);paint(C.part2,C.ink);}}
    const a0=g.phi;ctx.save();ctx.fillStyle=STEAM();ctx.globalAlpha=.45;ctx.beginPath();ctx.moveTo(Rc[0]+rr*Math.cos(a0),Rc[1]+rr*Math.sin(a0));const Lp=ROT.vaneL(o,a0);ctx.lineTo(Rc[0]+Lp*Math.cos(a0),Rc[1]+Lp*Math.sin(a0));for(let i=1;i<=12;i++){const t=a0-0.9*i/12;ctx.lineTo(O[0]+R*Math.cos(t),O[1]+R*Math.sin(t));}ctx.lineTo(Rc[0]+rr*Math.cos(a0-0.9),Rc[1]+rr*Math.sin(a0-0.9));ctx.closePath();ctx.fill();ctx.restore();
    circ(Rc[0],Rc[1],rr);paint(C['steel-fill'],C.ink);
    for(let k=0;k<o.N;k++){const a=g.phi+k*TAU/o.N,L=ROT.vaneL(o,a),Lv=R+e-rr+25,u=[Math.cos(a),Math.sin(a)];ctx.save();ctx.translate(Rc[0],Rc[1]);ctx.rotate(a);ctx.beginPath();ctx.rect(L-Lv,-7,Lv,14);paint(C['brass-fill'],C.ink);ctx.restore();}
    pivot(Rc[0],Rc[1],6);label('STEAM IN',O[0]-R-40,O[1]-40,'right');label('EXHAUST',O[0]-R-40,O[1]+50,'right');label(lab,400,490,'center');};}
