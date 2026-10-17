/* ================= audit pass 441–475 ================= */
/* 445, 446 · water lifted by a cone valve: water rushing down the drive pipe carries a cone up into its seat and stops dead; the shock
   opens the check valve and drives a little water up the rising main; then the cone drops by its weight and the flow starts again.
   446 shows the cone and its seat close up. */
function coneLift(num,o){return reg({num,outLabel:'Rising main, mm',concept:true,
  update(phi){const u=mod(phi*1.2,TAU)/TAU,st=u<0.6?'flow':u<0.72?'shut':'deliver',c=u<0.5?0:u<0.6?smooth((u-0.5)/0.1):u<0.9?1:1-smooth((u-0.9)/0.1);this.g={phi,u,st,c,lift:Math.floor(phi*1.2/TAU)%10*8+(st==='deliver'?8*(u-0.72)/0.28:0)};},
  output(){return this.g.lift;},
  draw(){const g=this.g;if(!o.close){water(20,120,150,120);ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=2;ctx.strokeRect(20,90,150,150);ctx.restore();
      ctx.beginPath();ctx.moveTo(150,240);ctx.lineTo(370,380);ctx.lineTo(370,400);ctx.lineTo(150,260);ctx.closePath();paint(C['steel-fill'],C.ink);if(g.st==='flow')dashFlow([[160,250],[360,390]],g.phi*3,3);
      const C0=[420,400];ctx.beginPath();ctx.rect(C0[0]-50,C0[1]-40,100,90);paint(C['steel-fill'],C.ink,.9);ctx.beginPath();ctx.rect(C0[0]-16,C0[1]+50,32,30);paint(C.part2,C.ink);
      const cy=C0[1]+64-28*g.c;poly([[C0[0]-14,cy+14],[C0[0]+14,cy+14],[C0[0],cy-16]]);ctx.closePath();paint(C.hi,C.ink);if(g.st==='flow')dashFlow([[C0[0],C0[1]+40],[C0[0],C0[1]+110]],g.phi*3,3);
      ctx.beginPath();ctx.rect(C0[0]+60,150,60,200);paint(C.part2,C.ink);ctx.save();ctx.fillStyle=C['steel-fill'];ctx.fillRect(C0[0]+64,230,52,120);ctx.restore();valveFlap(C0[0]+50,C0[1]-10,20,g.st==='deliver');
      ctx.beginPath();ctx.rect(C0[0]+120,160,220,14);paint(C['steel-fill'],C.ink);if(g.st==='deliver'||true)dashFlow([[C0[0]+130,167],[C0[0]+330,167]],g.phi*2,3);label('AIR VESSEL',C0[0]+90,140,'center');label('CONE VALVE',C0[0]-60,C0[1]+80,'right');label('DRIVE PIPE',260,290);label('RISING MAIN',C0[0]+230,150,'center');}
    else{const C0=[400,260];ctx.beginPath();ctx.rect(C0[0]-160,C0[1]-160,320,220);ctx.rect(C0[0]-140,C0[1]-140,280,200);paint(C.part2,C.ink);water(C0[0]-140,C0[1]-140,280,200);
      ctx.beginPath();ctx.moveTo(C0[0]-160,C0[1]+60);ctx.lineTo(C0[0]-50,C0[1]+60);ctx.lineTo(C0[0]-40,C0[1]+80);ctx.lineTo(C0[0]-160,C0[1]+80);ctx.closePath();ctx.moveTo(C0[0]+160,C0[1]+60);ctx.lineTo(C0[0]+50,C0[1]+60);ctx.lineTo(C0[0]+40,C0[1]+80);ctx.lineTo(C0[0]+160,C0[1]+80);ctx.closePath();paint(C.part,C.ink);label('SEAT',C0[0]+100,C0[1]+100,'center');
      const cy=C0[1]+150-90*g.c;poly([[C0[0]-46,cy],[C0[0]+46,cy],[C0[0],cy-90]]);ctx.closePath();paint(C.hi,C.ink);bar(C0[0],cy,C0[0],cy+60,8,C.part);label('CONE',C0[0]+60,cy-30);
      if(g.st==='flow'){dashFlow([[C0[0]-60,C0[1]-100],[C0[0]-60,C0[1]+200]],g.phi*3,3);dashFlow([[C0[0]+60,C0[1]-100],[C0[0]+60,C0[1]+200]],g.phi*3,3);}}
    label({flow:'WATER RUSHES DOWN AND OUT PAST THE CONE',shut:'THE FLOW LIFTS THE CONE INTO ITS SEAT · the water stops dead',deliver:'THE SHOCK DRIVES WATER UP THROUGH THE CHECK VALVE'}[g.st],400,40,'center');label(o.label,400,505,'center');},
  reads(){const g=this.g;return[['Phase',{flow:'flow',shut:'cone seats',deliver:'delivery'}[g.st]],['Cone',g.c>0.5?'seated':'open']];}});}
coneLift(445,{label:'A CONE VALVE INTERRUPTS THE FLOW AND THE SHOCK LIFTS WATER'});
coneLift(446,{close:true,label:'THE CONE AND ITS SEAT, CLOSE UP'});

/* 455, 456 · rotary pumps with sliding vanes */
for(const n of [455,456]){const m=SIMS_NEW[n];if(!m)continue;const o=n===455?{e:30,rr:110,N:4}:{e:0,rr:100,N:4,abut1:true};m.ro=o;m.concept=n===456;
  const vL=a=>{const O=[400,265],R=150,e=o.e,rr=o.rr,Rc=[O[0]+e,O[1]],ux=Math.cos(a),uy=Math.sin(a),dx=Rc[0]-O[0],dy=Rc[1]-O[1],b=dx*ux+dy*uy;let L=-b+Math.sqrt(b*b-(dx*dx+dy*dy-R*R));
    if(o.abut1){const d=Math.abs(Math.atan2(Math.sin(a+PI/2),Math.cos(a+PI/2)));if(d<0.7)L-=46*Math.cos(d/0.7*PI/2)**2;}return L;};m.vaneL=vL;
  m.draw=function(){const g=this.g,O=[400,265],R=150,e=o.e,rr=o.rr,Rc=[O[0]+e,O[1]],Lv=R+e-rr+25;circ(O[0],O[1],R+18);paint(C.part2,C.ink);circ(O[0],O[1],R);paint(C.sheet,C.ink);
    if(o.abut1){ctx.beginPath();ctx.moveTo(O[0]-40,O[1]-R);ctx.quadraticCurveTo(O[0],O[1]-R+90,O[0]+40,O[1]-R);ctx.closePath();paint(C.part2,C.ink);}
    ctx.save();ctx.fillStyle=C['steel-fill'];ctx.globalAlpha=.5;ctx.beginPath();for(let i=0;i<=40;i++){const t=0.2+i/40*2.4;ctx.lineTo(O[0]+R*Math.cos(t),O[1]+R*Math.sin(t));}for(let i=40;i>=0;i--){const t=0.2+i/40*2.4;ctx.lineTo(Rc[0]+rr*Math.cos(t),Rc[1]+rr*Math.sin(t));}ctx.closePath();ctx.fill();ctx.restore();
    circ(Rc[0],Rc[1],rr);paint(C['steel-fill'],C.ink);
    if(o.abut1){ctx.save();ctx.strokeStyle=C.ink;ctx.setLineDash([4,3]);ctx.beginPath();for(let i=0;i<=120;i++){const a=i/120*TAU,r=vL(a)-Lv;ctx.lineTo(Rc[0]+r*Math.cos(a),Rc[1]+r*Math.sin(a));}ctx.closePath();ctx.stroke();ctx.restore();label('FIXED HEART CAM',Rc[0]+10,Rc[1]+24);}
    for(let k=0;k<o.N;k++){const a=g.phi+k*TAU/o.N,L=vL(a);ctx.save();ctx.translate(Rc[0],Rc[1]);ctx.rotate(a);ctx.beginPath();ctx.rect(L-Lv,-7,Lv,14);paint(C['brass-fill'],C.ink);ctx.restore();}
    pivot(Rc[0],Rc[1],6);label('INLET',O[0]-R-30,O[1]+40,'right');label('OUTLET',O[0]+R+30,O[1]+40);label(n===455?'OLD ROTARY PUMP · sliding vanes in an off-centre drum':'SLIDING PISTONS FOLLOW A FIXED HEART CAM, DRAWN IN TO PASS THE ABUTMENT',400,490,'center');};}

/* 463 · self-acting weir: the leaf turns on an axle a third of the way up; while the water is low its pressure acts below the axle and
   holds the leaf shut, but when the water rises far enough the leaf swings over, the flood scours away the silt, and as the level falls
   the counterweight closes it again */
{const m=SIMS_NEW[463];m.update=function(phi){const u=mod(phi,TAU)/TAU;const lvl=u<0.7?u/0.7:1-(u-0.7)/0.3,open=u<0.7?0:u<0.75?smooth((u-0.7)/0.05):u<0.92?1:1-smooth((u-0.92)/0.08);this.g={phi,lvl,open,o:open>0.5};};
 m.draw=function(){const g=this.g,y0=420-g.lvl*200,P=[410,353];water(60,y0,340,420-y0);ctx.beginPath();ctx.rect(60,420,700,20);paint(C.part2,C.ink);ctx.beginPath();ctx.rect(396,190,10,230);paint(C.part2,C.ink);
  ctx.save();ctx.translate(P[0],P[1]);ctx.rotate(-1.2*g.open);ctx.beginPath();ctx.rect(4,-133,12,200);paint(C['steel-fill'],C.ink);bar(10,0,90,40,6,C.part);ctx.beginPath();ctx.rect(80,30,24,24);paint(C.part,C.ink);ctx.restore();pivot(P[0],P[1],6);
  water(420,400,380,20);if(g.o){dashFlow([[380,410],[640,410]],g.phi*3,6);dashFlow([[380,330],[640,380]],g.phi*3,6);}
  label(g.o?'LEAF SWUNG OVER · the flood scours away the silt':'WATER RISING BEHIND THE LEAF',560,140);label('AXLE A THIRD OF THE WAY UP',P[0]+20,P[1]-150);label('COUNTERWEIGHT',P[0]+100,P[1]+80);};
 m.reads=function(){return[['Level',`${(this.g.lvl*100).toFixed(0)} %`],['Leaf',this.g.o?'open':'shut']];};}

/* 467 · hydraulic jack: the hand lever works the small plunger through a short link; each down stroke forces liquid under the ram */
{const m=SIMS_NEW[467];m.draw=function(){const g=this.g,X=470,F=[240,240];ctx.beginPath();ctx.rect(X-80,200,160,260);ctx.rect(X-66,200,132,260);paint(C.part2,C.ink);ctx.save();ctx.fillStyle=C['steel-fill'];ctx.fillRect(X-66,320-this.h*0.6,132,140+this.h*0.6);ctx.restore();ctx.beginPath();ctx.rect(X-60,140-this.h*0.6,120,190);paint(C['brass-fill'],C.ink);weight(X,100-this.h*0.6,160,40,'LOAD');
  const th=-PI/2-0.6+g.a,E=[F[0]+180*Math.cos(th),F[1]+180*Math.sin(th)],Lp=[F[0]-45*Math.cos(th),F[1]-45*Math.sin(th)],Pt=[F[0]+35,Lp[1]+16];
  ctx.beginPath();ctx.rect(F[0]+20,300,30,160);paint(C.part2,C.ink);bar(Pt[0],Pt[1],Pt[0],Pt[1]+80,12,C.part);bar(Lp[0],Lp[1],Pt[0],Pt[1],6,C.part2);bar(Lp[0],Lp[1],E[0],E[1],12,C['steel-fill']);pivot(F[0],F[1],6);pivot(Lp[0],Lp[1],4);pivot(Pt[0],Pt[1],4);ctx.beginPath();ctx.rect(F[0]-6,F[1],12,60);paint(C.part2,C.ink);
  dashFlow([[F[0]+35,460],[X-66,460]],g.phi*(g.down?2:0),4);label('SMALL PLUNGER PUMPS OIL OR WATER UNDER THE BIG RAM',400,505,'center');label('HANDLE',E[0]-20,E[1]-10,'right');};}

/* 470 · steam hammer: piston, rod and hammer head are one piece, so they move together through the full stroke */
{const m=SIMS_NEW[470];m.draw=function(){const g=this.g,X=400,yh=340-g.h*120,yp=yh-180;ctx.beginPath();ctx.rect(X-190,30,40,450);ctx.rect(X+150,30,40,450);paint(C.part2,C.ink);
  ctx.beginPath();ctx.rect(X-62,24,124,196);ctx.rect(X-50,30,100,180);paint(C.part2,C.ink);steamBox(X-50,yp+20,100,210-yp-20,g.u<0.65);ctx.beginPath();ctx.rect(X-50,yp,100,20);paint(C['steel-fill'],C.ink);ctx.beginPath();ctx.rect(X-10,210,20,10);paint(C.part2,C.ink);
  bar(X,yp+10,X,yh,14,C.part);ctx.beginPath();ctx.rect(X-70,yh,140,70);paint(C['steel-fill'],C.ink);ctx.beginPath();ctx.rect(X-60,412,120,24);paint(C['brass-fill'],C.ink);ctx.beginPath();ctx.rect(X-90,436,180,50);paint(C.part2,C.ink);ground(X,486,300);
  label('CYLINDER',X+80,60);label('HAMMER HEAD',X+80,yh+36);label(g.u<0.65?'STEAM UNDER THE PISTON LIFTS THE HAMMER':g.u<0.73?'STEAM RELEASED · the hammer falls':'BLOW',400,500,'center');};}

/* 460 · the scoop is rocked through a crank and a rod of fixed length (crank and rocker) */
{const m=SIMS_NEW[460],F=[420,200],O=[650,90],A0=[F[0]+60*Math.cos(-0.6),F[1]+60*Math.sin(-0.6)],Lr=Math.hypot(O[0]-A0[0],O[1]-A0[1]);
 m.update=function(phi){const pin=[O[0]+40*Math.cos(phi),O[1]+40*Math.sin(phi)],A=cc(F,60,pin,Lr,-1),a=Math.atan2(A[1]-F[1],A[0]-F[0])+0.6;this.g={phi,a,lift:Math.cos(phi)<0,pin,A};};
 m.draw=function(){const g=this.g;water(0,380,330,140);water(520,250,280,270);ctx.beginPath();ctx.rect(330,260,190,260);paint(C.part2,C.ink);
  ctx.save();ctx.translate(F[0],F[1]);ctx.rotate(g.a);ctx.beginPath();ctx.moveTo(-220,170);ctx.lineTo(0,0);ctx.lineTo(30,-20);ctx.lineTo(10,20);ctx.lineTo(-200,200);ctx.closePath();paint(C['steel-fill'],C.ink);ctx.restore();pivot(F[0],F[1],7);
  flywheel(O[0],O[1],60,g.phi);bar(g.pin[0],g.pin[1],g.A[0],g.A[1],8,C.part);pivot(g.pin[0],g.pin[1],4);pivot(g.A[0],g.A[1],4);label('ENGINE-DRIVEN SCOOP LIFTS WATER OVER THE BANK',400,505,'center');};}
