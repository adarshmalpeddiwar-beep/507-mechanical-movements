/* ================= audit pass 476–507 ================= */
/* 507 · slow motion by an epicyclic train: a fixed wheel of 41 teeth and an output wheel of 40 on the same axis; the arm carries a
   compound planet of 39 and 40 teeth meshing them. Each turn of the arm moves the output by 1 − (41×40)/(39×40) = −2/39 of a turn.
   (Same module throughout, so 41+39 = 40+40 and both pairs share one centre distance.) */
const EPI={mesh(th,a1,Z1,Z2){return th+PI+(Z1/Z2)*(th-a1)-PI/Z2;}};
reg({num:507,outLabel:'Output wheel, turns',ZF:41,Za:39,Zb:40,ZW:40,d:150,EPI,
  update(phi){const arm=phi,ZF=this.ZF,Za=this.Za,Zb=this.Zb,ZW=this.ZW,w=arm*(1-ZF*Zb/(Za*ZW));this.g={phi,arm,slow:w,pa:EPI.mesh(arm,0,ZF,Za),pb:EPI.mesh(arm,w,ZW,Zb)};},output(){return this.g.slow/TAU;},
  draw(){const g=this.g,O=[400,265],d=this.d,m=2*d/(this.ZF+this.Za),P=[O[0]+d*Math.cos(g.arm),O[1]+d*Math.sin(g.arm)];
    ctx.save();ctx.globalAlpha=0.55;drawGear(O[0],O[1],m*this.ZF/2,this.ZF,0,C.part2,{bore:8});drawGear(P[0],P[1],m*this.Za/2,this.Za,g.pa,C.hi,{bore:5});ctx.restore();
    drawGear(O[0],O[1],m*this.ZW/2,this.ZW,g.slow,C['steel-fill'],{bore:8});drawGear(P[0],P[1],m*this.Zb/2,this.Zb,g.pb,C.part,{bore:5});
    bar(O[0],O[1],P[0],P[1],14,C['brass-fill']);pivot(P[0],P[1],4);pivot(O[0],O[1],6);const t=g.slow-PI/2;bar(O[0],O[1],O[0]+60*Math.cos(t),O[1]+60*Math.sin(t),5,C.steel);
    label('FIXED WHEEL 41 (behind) · OUTPUT WHEEL 40 (front) · planet 39 + 40 on the arm',400,470,'center');label('one turn of the arm moves the output back by 2/39 of a turn',400,490,'center');},
  reads(){const g=this.g;return[['Arm turns',`${(g.arm/TAU).toFixed(2)}`],['Output turns',`${(g.slow/TAU).toFixed(3)}`],['Ratio','−2/39 per arm turn']];}});

/* 493 · lewis: two tapered side pieces and a straight middle piece lock in a dovetail hole; drawn rigid, lowered into the hole in turn */
{const m=SIMS_NEW[493];m.draw=function(){const g=this.g,X=400,y=300-g.lift,up=(1-g.ins)*100;poly([[X-160,y],[X-20,y],[X-36,y+90],[X+36,y+90],[X+20,y],[X+160,y],[X+160,y+180],[X-160,y+180]]);ctx.closePath();paint(C.part2,C.ink);
  for(const s of [-1,1]){poly([[X+s*8,y-up],[X+s*20,y-up],[X+s*36,y+90-up],[X+s*8,y+90-up]]);ctx.closePath();paint(C['steel-fill'],C.ink);}
  const um=(1-smooth(Math.max(0,(g.ins-0.5)*2)))*130;ctx.beginPath();ctx.rect(X-8,y-60-um,16,150);paint(C['brass-fill'],C.ink);bar(X-30,y-70-um*0,X+30,y-70,10,C.part);rope([[X,0],[X,y-70]]);
  label('SIDE PIECES GO IN FIRST, THEN THE MIDDLE PIECE LOCKS THEM AGAINST THE DOVETAIL',400,500,'center');};}
