/* ================= audit pass 81–115 ================= */
/* 82 · two treadles tied by a strap over a pulley rock two arms on the ratchet's centre; each arm's pawl drives on its own stroke, so the one wheel turns almost continuously */
reg({num:82,outLabel:'Ratchet wheel, turns',N:20,
  reset(){this.w=0;this.la=null;},
  update(phi){const a=0.32*Math.sin(phi);if(this.la!==null){const d=a-this.la;this.w+=Math.max(0,d)+Math.max(0,-d);this.dir=Math.sign(d)||this.dir||1;}this.la=a;this.g={phi,a};},
  output(){return this.w/TAU;},
  draw(){const g=this.g,O=[400,230],N=this.N,rr=78,rt=98,A=[[-1,PI+0.5],[1,-0.5]];sawWheel(O[0],O[1],-this.w,N,rr,rt,C['steel-fill']);pivot(O[0],O[1],6);
    const P=[400,60];pulley(P[0],P[1],26,g.a*4,C.part);
    for(const [s,base] of A){const ang=base+s*g.a,E=[O[0]+150*Math.cos(ang),O[1]+150*Math.sin(ang)];bar(O[0],O[1],E[0],E[1],13,C['brass-fill']);
      const H=[O[0]+(rt+22)*Math.cos(ang),O[1]+(rt+22)*Math.sin(ang)],ta=ang-s*0.3,r=sawR(ta+this.w,N,rr,rt)+1,T=[O[0]+r*Math.cos(ta),O[1]+r*Math.sin(ta)];const work=(s<0)===(this.dir>0);bar(H[0],H[1],T[0],T[1],7,work?C.part2:C.part);pivot(H[0],H[1],3.5);
      const Tp=[400+s*250,470],tl=230,tang=-s*(0.12+0.5*(E[1]-O[1])/600),Tt=[Tp[0]-s*tl*Math.cos(tang),Tp[1]+tl*Math.sin(tang)*s*-1];const tip=[Tp[0]-s*tl,Tp[1]-(Tp[1]-E[1]-140)*0.25];
      bar(Tp[0],Tp[1],tip[0],tip[1],12,C.part);pivot(Tp[0],Tp[1],5);bar(E[0],E[1],tip[0],tip[1],5,C.part2);rope([[tip[0],tip[1]],[P[0]+s*26,P[1]]]);}
    label('TWO TREADLES ON ONE STRAP · each arm’s pawl drives on its own stroke',400,505,'center');},
  reads(){return[['Wheel',`${(this.w/TAU).toFixed(2)} turns`],['Drives on','both treadles']];}});
/* 94 · a plate with a spiral groove turns against a plate with radial slots: the bolts at the crossings move in or out together */
reg({num:94,outLabel:'Bolt radius, mm',
  update(phi){const t=1.3*Math.sin(phi*0.6);this.g={phi,t,r:[0,1,2].map(k=>this.rad(k,t))};},
  rad(k,t){const s0=-PI/2+k*TAU/3;/* spiral r = 40 + 18·θ/τ·... find the crossing between 60 and 150 */const a=18/(PI/3);let best=null;for(let n=-3;n<6;n++){const th=s0-t+n*TAU,r=40+a*th;if(r>55&&r<160&&(!best||Math.abs(r-105)<Math.abs(best-105)))best=r;}return best||100;},
  output(){return this.g.r[0];},
  draw(){const g=this.g,O=[400,265];circ(O[0],O[1],185);paint(C['brass-fill'],C.ink);const a=18/(PI/3);ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=16;ctx.lineCap='round';ctx.beginPath();for(let i=0;i<=700;i++){const th=i/700*TAU*2.4,r=40+a*th*1;if(r>175)break;const x=O[0]+r*Math.cos(th+g.t),y=O[1]+r*Math.sin(th+g.t);i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();ctx.strokeStyle=C.sheet;ctx.lineWidth=12;ctx.stroke();ctx.restore();
    ctx.save();ctx.globalAlpha=0.55;circ(O[0],O[1],170);for(let k=0;k<3;k++){const s=-PI/2+k*TAU/3;const c=Math.cos(s),sn=Math.sin(s);ctx.moveTo(O[0]+50*c-9*sn,O[1]+50*sn+9*c);ctx.lineTo(O[0]+165*c-9*sn,O[1]+165*sn+9*c);ctx.lineTo(O[0]+165*c+9*sn,O[1]+165*sn-9*c);ctx.lineTo(O[0]+50*c+9*sn,O[1]+50*sn-9*c);ctx.closePath();}paint(C['steel-fill'],C.ink);ctx.restore();
    for(let k=0;k<3;k++){const s=-PI/2+k*TAU/3,r=g.r[k];circ(O[0]+r*Math.cos(s),O[1]+r*Math.sin(s),8);paint(C.part2,C.ink);}pivot(O[0],O[1],6);
    label('TURN THE SPIRAL PLATE · the bolts in the radial slots move in or out together',400,480,'center');},
  reads(){return[['Bolt radius',`${this.g.r[0].toFixed(0)} mm`],['Use','chucks, adjustable cranks']];}});
/* 98 · the crank pin runs in an endless groove cut in a swinging arm; the groove's shape sets an irregular swing */
reg({num:98,outLabel:'Arm angle, degrees',D:[300,290],rp:72,Q:[640,90],
  th(phi){return 0.62+0.16*Math.sin(phi)+0.07*Math.sin(2*phi+0.6);},
  groove(){if(this._g)return this._g;const pts=[];for(let i=0;i<240;i++){const p=i/240*TAU,P=[this.D[0]+this.rp*Math.cos(p),this.D[1]+this.rp*Math.sin(p)],t=PI-this.th(p)*-1,dx=P[0]-this.Q[0],dy=P[1]-this.Q[1],a=-this.ang(p);pts.push([dx*Math.cos(a)-dy*Math.sin(a),dx*Math.sin(a)+dy*Math.cos(a)]);}return this._g=pts;},
  ang(p){return PI-this.th(p)*-1+0;},
  update(phi){this.g={phi,a:this.ang(phi)};},output(){return this.g.a*180/PI;},
  draw(){const g=this.g,D=this.D,Q=this.Q,G=this.groove(),c=Math.cos(g.a),s=Math.sin(g.a),T=([x,y])=>[Q[0]+x*c-y*s,Q[1]+x*s+y*c];circ(D[0],D[1],this.rp+30);paint(C['brass-fill'],C.ink);pivot(D[0],D[1],6);
    const hullPts=[];for(const p of G)for(let k=0;k<8;k++){hullPts.push([p[0]+20*Math.cos(k*PI/4),p[1]+20*Math.sin(k*PI/4)]);}for(let k=0;k<16;k++)hullPts.push([20*Math.cos(k*PI/8),20*Math.sin(k*PI/8)]);
    const hp=hullPts.sort((a,b)=>a[0]-b[0]||a[1]-b[1]),cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]),lo=[],up=[];for(const p of hp){while(lo.length>1&&cr(lo[lo.length-2],lo[lo.length-1],p)<=0)lo.pop();lo.push(p);}for(let i=hp.length-1;i>=0;i--){const p=hp[i];while(up.length>1&&cr(up[up.length-2],up[up.length-1],p)<=0)up.pop();up.push(p);}
    poly(lo.slice(0,-1).concat(up.slice(0,-1)).map(T));ctx.closePath();ctx.save();ctx.globalAlpha=0.9;paint(C['steel-fill'],C.ink);ctx.restore();
    ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=18;ctx.lineJoin='round';poly(G.map(T));ctx.closePath();ctx.stroke();ctx.strokeStyle=C.sheet;ctx.lineWidth=15;ctx.stroke();ctx.restore();
    const P=[D[0]+this.rp*Math.cos(g.phi),D[1]+this.rp*Math.sin(g.phi)];bar(D[0],D[1],P[0],P[1],10,C['brass-fill']);circ(P[0],P[1],7);paint(C.part2,C.ink);pivot(Q[0],Q[1],7);ground(Q[0],Q[1]-12,40,true);
    label('CRANK PIN IN AN ENDLESS GROOVE CUT IN THE ARM · the groove’s shape gives an irregular swing',400,490,'center');},
  reads(){return[['Arm',`${(this.g.a*180/PI).toFixed(1)}°`]];}});
/* 115 · two equal wheels, one above and one below, drive a rack toothed on both sides; the rack pitch now matches the wheels */
reg({num:115,outLabel:'Rack position, mm',
  update(phi){this.g={phi,x:110*Math.sin(phi*0.5)};},output(){return this.g.x;},
  draw(){const g=this.g,R=60,Z=24,m=2*R/Z,p=PI*m,y0=270,a=g.x/R;for(const s of [-1,1]){const cy=y0+s*(R+18);drawGear(400,cy,R,Z,(s<0?a:-a)+PI/2+(s<0?0:PI/Z),C['brass-fill'],{bore:6});pivot(400,cy,5);}
    const x0=400+g.x-230,x1=400+g.x+230,yt=y0-18,yb=y0+18;const up=rackTeeth(x0,x1,400+g.x,p,yt,m,true),dn=rackTeeth(x0,x1,400+g.x,p,yb,m,false);
    poly([[x0,yt+1.25*m],...up,[x1,yt+1.25*m],[x1,yb-1.25*m],...dn.slice().reverse(),[x0,yb-1.25*m]]);ctx.closePath();paint(C['steel-fill'],C.ink);
    label('TWO EQUAL WHEELS ON A DOUBLE RACK · equal force on each side',400,480,'center');},
  reads(){return[['Rack',`${this.g.x.toFixed(0)} mm`],['Wheels','turn opposite ways, same speed']];}});
/* 143 · the worm and its wheel ride on a sliding frame; a rod from a pin on the wheel to a fixed point makes the frame traverse back and forth as the wheel turns */
reg({num:143,outLabel:'Frame position, mm',Zw:16,F:[700,300],L:250,r:70,
  update(phi){const w=phi/this.Zw,F=this.F,y0=230;const cx0=330;/* frame carries wheel centre at (cx0+x, y0) */const px=Math.cos(w)*this.r,py=Math.sin(w)*this.r,dy=F[1]-(y0+py);const x=F[0]-Math.sqrt(Math.max(0,this.L*this.L-dy*dy))-(cx0+px);this.g={phi,w,x,y0,cx0};},
  output(){return this.g.x;},
  draw(){const g=this.g,C0=[g.cx0+g.x,g.y0],R=96,yw=C0[1]+R+24;ctx.beginPath();ctx.rect(C0[0]-150,C0[1]-120,300,yw+40-(C0[1]-120));ctx.rect(C0[0]-138,C0[1]-108,276,yw+28-(C0[1]-108));paint(C.part2,C.ink);
    drawGear(C0[0],C0[1],R,this.Zw*2,g.w,C['steel-fill'],{bore:8});pivot(C0[0],C0[1],6);
    ctx.beginPath();ctx.rect(C0[0]-110,yw-18,220,36);paint(C['brass-fill'],C.ink);ctx.save();ctx.beginPath();ctx.rect(C0[0]-110,yw-18,220,36);ctx.clip();ctx.strokeStyle=C.ink;ctx.lineWidth=2;const p=PI*2*R/(this.Zw*2),sh=mod(g.phi/TAU*p,p);for(let x=C0[0]-110-p+sh;x<C0[0]+120;x+=p){ctx.beginPath();ctx.moveTo(x,yw-18);ctx.lineTo(x+p*0.5,yw+18);ctx.stroke();}ctx.restore();
    stripeShaft(40,760,yw,7,g.phi,C.part);const P=[C0[0]+this.r*Math.cos(g.w),C0[1]+this.r*Math.sin(g.w)];bar(P[0],P[1],this.F[0],this.F[1],10,C['brass-fill']);circ(P[0],P[1],7);paint(C.part,C.ink);pivot(this.F[0],this.F[1],6);ground(this.F[0],this.F[1]+12,40);
    for(const x of [120,560]){ctx.beginPath();ctx.rect(x,yw+52,80,10);paint(C.part2,C.ink);}label('WORM AND WHEEL RIDE ON THE SLIDING FRAME · the rod to a fixed pin makes it traverse',400,500,'center');},
  reads(){return[['Frame',`${this.g.x.toFixed(0)} mm`],['Traverse','back and forth once per wheel turn']];}});
/* stud pushing an arm: returns the extra angle (from rest) the arm must turn so the stud just touches it */
function studPush(F,base,La,P,gap,sg){const dx=P[0]-F[0],dy=P[1]-F[1],d=Math.hypot(dx,dy);if(d>La||d<gap)return 0;const psi=Math.atan2(dy,dx);let a=mod(psi-sg*Math.asin(gap/d)-base+PI,TAU)-PI;return sg>0?Math.max(0,a):Math.min(0,a);}
/* 154 · studs on the disk press one arm of a bell crank; a weighted cord on the other arm pulls it back */
reg({num:154,outLabel:'Cord pull, mm',O:[280,300],F:[440,180],
  update(phi){const O=this.O,F=this.F,base=PI*0.66;let a=0;for(let k=0;k<3;k++){const t=phi+k*TAU/3,P=[O[0]+85*Math.cos(t),O[1]+85*Math.sin(t)];const v=studPush(F,base,128,P,16,-1);if(v<a)a=v;}this.g={phi,a:-a};},
  output(){return this.g.a*140;},
  draw(){const g=this.g,O=this.O,F=this.F;circ(O[0],O[1],100);paint(C['brass-fill'],C.ink);for(let k=0;k<3;k++){const t=g.phi+k*TAU/3;circ(O[0]+85*Math.cos(t),O[1]+85*Math.sin(t),10);paint(C.part2,C.ink);}pivot(O[0],O[1],6);
    const a=-g.a,A1=[F[0]+128*Math.cos(PI*0.66+a),F[1]+128*Math.sin(PI*0.66+a)],A2=[F[0]+140*Math.cos(-0.1+a),F[1]+140*Math.sin(-0.1+a)];bar(F[0],F[1],A1[0],A1[1],12,C['steel-fill']);bar(F[0],F[1],A2[0],A2[1],12,C['steel-fill']);pivot(F[0],F[1],6);
    const Pp=[A2[0]+40,90];pulley(Pp[0]+10,Pp[1],18,0,C.part);rope([[A2[0],A2[1]],[Pp[0]-8,Pp[1]],[Pp[0]+28,Pp[1]],[Pp[0]+28,300+g.a*140]]);weight(Pp[0]+28,300+g.a*140,44,36,'');
    label('A STUD PRESSES THE ARM · the weighted cord pulls it back',400,480,'center');},
  reads(){return[['Cord pull',`${(this.g.a*140).toFixed(0)} mm`],['Strokes per turn','3']];}});
/* 153 · studs push the bar out by a tab beneath it; a bell crank brings it back */
reg({num:153,outLabel:'Bar position, mm',O:[300,280],
  update(phi){const O=this.O;let x=0;for(let k=0;k<4;k++){const t=phi+k*PI/2,c=Math.cos(t),s=Math.sin(t);if(c>0&&Math.abs(95*s)<22)x=Math.max(x,95*c+10-60);}this.g={phi,x:Math.max(0,x)};},
  output(){return this.g.x;},
  draw(){const g=this.g,O=this.O;circ(O[0],O[1],110);paint(C['brass-fill'],C.ink);for(let k=0;k<4;k++){const t=g.phi+k*PI/2;circ(O[0]+95*Math.cos(t),O[1]+95*Math.sin(t),10);paint(C.part2,C.ink);}pivot(O[0],O[1],6);
    const X=O[0]+60+g.x;ctx.beginPath();ctx.rect(X,O[1]-50,220,24);paint(C['steel-fill'],C.ink);ctx.beginPath();ctx.rect(X,O[1]-26,14,44);paint(C['steel-fill'],C.ink);
    const F=[O[0]+340,O[1]-110],a=g.x/120;bar(F[0],F[1],F[0]-60*Math.cos(a)+0,F[1]+60,8,C.part);bar(F[0],F[1],F[0]+70,F[1]-20,8,C.part);pivot(F[0],F[1],5);
    for(const gx of [520,640]){ctx.beginPath();ctx.rect(gx,O[1]-62,40,8);ctx.rect(gx,O[1]-22,40,8);paint(C.part2,C.ink);}
    label('STUDS PUSH THE TAB · THE BELL CRANK RETURNS THE BAR',400,480,'center');},
  reads(){return[['Bar',`${this.g.x.toFixed(0)} mm`],['Pushes per turn','4']];}});
/* 166 · a slot in the connecting rod lets it rest at each end of the stroke while the crank keeps turning (brick-press mould) */
reg({num:166,outLabel:'Mould position, mm',O:[220,280],r:80,L0:260,s:70,
  reset(){this.x=null;},
  update(phi){const p=this.O[0]+this.r*Math.cos(phi);if(this.x===null)this.x=p+this.L0+this.s/2;this.x=Math.min(Math.max(this.x,p+this.L0),p+this.L0+this.s);this.g={phi,x:this.x,p,py:this.O[1]+this.r*Math.sin(phi)};},
  output(){return this.g.x-(this.O[0]+this.L0+this.s/2);},
  draw(){const g=this.g,O=this.O,y=O[1];circ(O[0],O[1],this.r+24);paint(C['brass-fill'],C.ink);bar(O[0],O[1],O[0]+this.r*Math.cos(g.phi),g.py,10,C.part2);pivot(O[0],O[1],6);
    const x0=g.x-this.L0-this.s-14;ctx.beginPath();ctx.rect(x0,y-16,this.L0+this.s+14,32);ctx.rect(x0+8,y-7,this.s+12,14);paint(C['steel-fill'],C.ink);circ(g.p,y,7);paint(C.part,C.ink);
    ctx.beginPath();ctx.rect(g.x,y-40,120,80);paint(C.part2,C.ink);for(const gx of [g.x+20,g.x+60]){ctx.beginPath();ctx.rect(gx,y-28,30,56);paint(C.sheet,C.ink);}
    for(const gy of [y-52,y+44]){ctx.beginPath();ctx.rect(440,gy,320,8);paint(C.part,C.ink);}
    const resting=Math.abs(g.x-(g.p+this.L0))>0.5&&Math.abs(g.x-(g.p+this.L0+this.s))>0.5;label(resting?'PIN TRAVELS IN THE SLOT · the mould rests':'PIN AT THE END OF THE SLOT · the mould moves',400,470,'center');},
  reads(){return[['Mould',`${this.output().toFixed(0)} mm`],['Rest at each end','while the pin crosses the slot']];}});
