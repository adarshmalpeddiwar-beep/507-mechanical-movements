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
