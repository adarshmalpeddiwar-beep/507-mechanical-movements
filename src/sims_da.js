/* ================= audit pass 271–320 (non-escapement) ================= */
/* 271 · rocking lever with two pawls hinged on its cross-arm; both pawls lean the same way, so the one whose hinge is going down
   pushes the bar on while the other slides back over the teeth: the bar moves on both strokes */
reg({num:271,outLabel:'Bar travel, mm',Pv:[400,150],arm:70,Lp:200,yt:312,p:24,
  reset(){this.X=0;this.last=null;},
  tips(a){return[-1,1].map(s=>{const pv=[this.Pv[0]+s*this.arm*Math.cos(a),this.Pv[1]-s*this.arm*Math.sin(a)],dy=this.yt-pv[1];return{s,pv,tip:[pv[0]+Math.sqrt(this.Lp*this.Lp-dy*dy),this.yt]};});},
  update(phi){const a=0.32*Math.sin(phi),T=this.tips(a);if(this.last){let d=0,eng=0;for(let i=0;i<2;i++){const dd=T[i].tip[0]-this.last[i].tip[0];if(dd>d){d=dd;eng=T[i].s;}}this.X+=d;this.eng=eng||this.eng;}this.last=T;this.g={phi,a,T};},
  output(){return this.X;},
  draw(){const g=this.g,P=this.Pv,p=this.p,y=this.yt+9,sh=mod(this.X,p);const pts=[];for(let x=-p;x<=800+p;x+=p){const xx=x+sh;pts.push([xx,y],[xx,y-18],[xx+p-2,y-1]);}poly([[0,y+30],...pts.filter(q=>q[0]>=-30&&q[0]<=830),[800,y+30]]);ctx.closePath();paint(C['steel-fill'],C.ink);
    bar(P[0],P[1],P[0]-150*Math.sin(g.a),P[1]-150*Math.cos(g.a),16,C['brass-fill']);const A=[P[0]+this.arm*Math.cos(g.a),P[1]-this.arm*Math.sin(g.a)],B=[P[0]-this.arm*Math.cos(g.a),P[1]+this.arm*Math.sin(g.a)];bar(A[0],A[1],B[0],B[1],12,C['brass-fill']);
    for(const t of g.T){const eng=t.s===this.eng;bar(t.pv[0],t.pv[1],t.tip[0],t.tip[1],8,eng?C.part2:C.part);pivot(t.pv[0],t.pv[1],4);}
    pivot(P[0],P[1],6);ground(P[0],P[1]-12,40,true);label('RATCHET BAR',60,y+50);label('ROCKING LEVER WITH TWO PAWLS · the pawl going down pushes',P[0]+90,P[1]-30);},
  reads(){return[['Bar moved',`${this.X.toFixed(0)} mm`],['Pushing pawl',this.eng>0?'right':'left'],['Strokes used','both']];}});

/* 275 · worm drives the rack: rack teeth sit in the worm's thread; the worm turns back and forth so the rack runs to and fro */
{const m=SIMS_NEW[275];m.update=function(phi){const x=110*Math.sin(phi/10);this.g={phi,x,wa:x/20*TAU,w:0};};m.output=function(){return this.g.x;};
 m.draw=function(){const g=this.g,y=330,x=400+g.x;ctx.beginPath();ctx.rect(x-200,y-58,400,26);paint(C['steel-fill'],C.ink);for(let i=0;i<20;i++){ctx.beginPath();ctx.moveTo(x-196+i*20,y-32);ctx.lineTo(x-188+i*20,y-32);ctx.lineTo(x-191+i*20,y-14);ctx.lineTo(x-193+i*20,y-14);ctx.closePath();paint(C['steel-fill'],C.ink,.8);}
   screwShaft(250,550,y,22,g.wa,20);ctx.beginPath();ctx.rect(236,y-26,14,52);ctx.rect(550,y-26,14,52);paint(C.part2,C.ink);label('WORM DRIVES THE RACK · one tooth per turn',400,490,'center');};}

/* 286 · Brown: a curved toe on a rocking shaft lifts the valve rod. The shaft rocks; the toe's curved back rolls under the rod's foot. */
camFlat(286,{r:t=>{const u=mod(t+PI/2-0.25+PI,TAU)-PI;return Math.abs(u)<1.1?36+64*Math.cos(u/1.1*PI/2)**1.5:36;},label:'CURVED TOE ON A ROCKING SHAFT LIFTS THE VALVE ROD'});
{const m=SIMS_NEW[286],up=m.update;m.update=function(phi){up.call(this,0.55*Math.sin(phi)-0.15);this.g.phi=phi;};}

/* 320 · Huygens' endless chain: one loop over the going pulley A (on the clock) and the winding pulley B (with a click). The loop
   carries the driving weight's pulley in one bight and a small counterweight in the other. Pulling down the free side over B raises
   the weight, yet A is still pulled round all the while, so the clock keeps going while it is wound. */
{const m=SIMS_NEW[320];
 m.update=function(phi){const T=TAU*2,u=mod(phi,T)/T,wind=u<0.25;const k=Math.floor(phi/T);const drop=wind?(1-u/0.25):(u-0.25)/0.75;/* 0..1 of the weight's travel */
   this.g={phi,wind,go:phi*0.3,yW:300+90*drop,b:(k+(wind?u/0.25:1))*TAU*0.9};};
 m.draw=function(){const g=this.g,A=[300,140],B=[500,140],r=50,yW=g.yW,yC=yW-70+140;/* counterweight moves opposite */
   pulley(A[0],A[1],r,g.go,C['steel-fill']);pulley(B[0],B[1],r,g.b,C['brass-fill']);
   const Wp=[A[0]+r,yW],Cp=[B[0]+r-24,780-yW];pulley(Wp[0],Wp[1],26,-g.go,C.part);pulley(Cp[0],Cp[1],22,g.b,C.part);
   rope([[A[0]-r,A[1]],[A[0]-r,Cp[1]-60]]);rope([[A[0]-r,Cp[1]-60],[Cp[0]-22,Cp[1]]]);/* left strand to counterweight bight */
   rope([[A[0]+r-26,A[1]+20],[Wp[0]-26,Wp[1]]]);rope([[B[0]-r,B[1]],[Wp[0]+26,Wp[1]]]);rope([[B[0]+r,B[1]],[Cp[0]+22,Cp[1]]]);
   weight(Wp[0],Wp[1]+26,60,70,'WEIGHT');weight(Cp[0],Cp[1]+22,36,36,'');
   label(g.wind?'WINDING · pull the cord over B: the weight rises, yet A is still driven':'GOING · the weight descends and drives A',400,500,'center');label('A · going pulley (clock)',A[0]-40,A[1]-64,'center');label('B · winding pulley with click',B[0]+40,B[1]-64,'center');};}

/* 334 · the rack on the piston rod meshes with the toothed end of the beam: same module (5), rack moves R·θ */
{const m=SIMS_NEW[334];m.draw=function(){const g=this.g,F=[460,200],R=150,md=5,p=PI*md,t=Math.tan(20*PI/180),x0=F[0]-R;ctx.save();ctx.translate(F[0],F[1]);ctx.rotate(g.a);ctx.beginPath();ctx.rect(-10,-12,280,24);paint(C['brass-fill'],C.ink);ctx.restore();
  poly(gearPts(F[0],F[1],R,60,g.a+PI,false,PI-0.5+g.a,PI+0.5+g.a));ctx.lineTo(F[0],F[1]);ctx.closePath();paint(C['brass-fill'],C.ink);pivot(F[0],F[1],7);
  const yc=F[1]-R*g.a,pts=[[x0-1.25*md-14,yc-150]];for(let k=-9;k<=9;k++){const y=yc+p/2+k*p;if(Math.abs(y-yc)>145)continue;const a=p/4-0.5,b=a+1.25*md*t,c=a-md*t;pts.push([x0-1.25*md,y-b],[x0+md,y-c],[x0+md,y+c],[x0-1.25*md,y+b]);}pts.push([x0-1.25*md,yc+150],[x0-1.25*md-14,yc+150]);
  poly(pts);ctx.closePath();paint(C['steel-fill'],C.ink);bar(x0-14,yc+150,x0-14,yc+230,10,C.part);ctx.beginPath();ctx.rect(x0-60,yc+230,90,60);paint(C.part2,C.ink);label('RACK ON THE PISTON ROD WORKS THE BEAM SECTOR',400,40,'center');};}

/* 351 · rack stamp: a 16-tooth pinion with teeth on only ten of its places lifts the toothed stamp rod one tooth per tooth, then
   its blank part comes round, the rod drops, and the first tooth catches the bottom of the rack again */
{const m=SIMS_NEW[351],P=[300,230],R=40,Z=16,tau=TAU/Z,p=R*tau,md=2*R/Z,nT=10;
 m.update=function(phi){const u=mod(phi,TAU),lim=(nT-0.5)*tau;let y,drop=false;if(u<=lim)y=R*Math.min(u,(nT-1)*tau);else{const f=Math.min(1,(u-lim)/0.12);y=R*(nT-1)*tau*(1-f*f);drop=true;}this.g={phi,y,drop,al:-phi};};
 m.output=function(){return this.g.y;};
 m.draw=function(){const g=this.g,X=P[0]+R,yb=P[1]+200-g.y;
   const pts=[[X+1.25*md+18,P[1]-p*12-g.y],[X+1.25*md,P[1]-p*12-g.y]];for(let j=-12;j<=1;j++){const yc=P[1]+(j+0.5)*p-g.y,a=p/4-0.4,t=Math.tan(20*PI/180);pts.push([X+1.25*md,yc-a-1.25*md*t],[X-md,yc-a+md*t],[X-md,yc+a-md*t],[X+1.25*md,yc+a+1.25*md*t]);}
   pts.push([X+1.25*md,yb],[X+1.25*md+18,yb]);poly(pts);ctx.closePath();paint(C['steel-fill'],C.ink);ctx.beginPath();ctx.rect(X-6,yb,100,50);paint(C['steel-fill'],C.ink);ctx.beginPath();ctx.rect(X-20,P[1]+250,140,24);paint(C.part2,C.ink);
   polyAt(sectorExt(R,Z,-0.01,(nT-1)*tau+0.01),P[0],P[1],g.al);circ(P[0],P[1],6,false);paint(C['brass-fill'],C.ink);pivot(P[0],P[1],5);
   label(g.drop?'DROP · the blank part of the pinion lets the stamp fall':'LIFTING · one tooth at a time',X+120,P[1]);label('PART-TOOTHED PINION LIFTS THE RACK, THEN LETS IT FALL',400,505,'center');};}
