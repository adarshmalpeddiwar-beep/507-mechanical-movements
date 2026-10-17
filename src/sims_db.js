/* ================= escapements: a contact solver =================
   The escape wheel is always urged forward by the train. Each frame the oscillator (pendulum, balance or lever) is set from the
   drive angle, and the wheel is moved forward until one of its contact shapes meets a blocker (pallet, detent, cylinder…). If a
   blocker has moved into a tooth, the wheel is pushed back (recoil). So locking, impulse, drop and recoil all come out of the
   shapes themselves, and the same shapes are printed in the 3D models. */
const ESC={
  pip(x,y,P){let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if(((a[1]>y)!==(b[1]>y))&&(x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0]))c=!c;}return c;},
  dens(P,step=3){const o=[];for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/step));for(let k=0;k<n;k++)o.push([a[0]+(b[0]-a[0])*k/n,a[1]+(b[1]-a[1])*k/n]);}return o;},
  bbox(P){let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const [x,y] of P){if(x<x0)x0=x;if(y<y0)y0=y;if(x>x1)x1=x;if(y>y1)y1=y;}return[x0,y0,x1,y1];},
  /* wheel: {polys:[[pts local, plane]], C:[x,y]} ; blockers: [[pts world, plane]] ; W wheel angle (canvas, +=clockwise) */
  hit(wheel,W,blk){const c=Math.cos(W),s=Math.sin(W),C=wheel.C;
    for(const [B,pl] of blk){const bb=ESC.bbox(B);const loc=B.map(([x,y])=>{const dx=x-C[0],dy=y-C[1];return[dx*c+dy*s,-dx*s+dy*c];});
      for(const w of wheel.polys){if((w.pl||0)!==(pl||0))continue;
        for(const q of loc)if(ESC.pip(q[0],q[1],w.pts))return true;
        for(const p of w.dense){const X=C[0]+p[0]*c-p[1]*s,Y=C[1]+p[0]*s+p[1]*c;if(X<bb[0]||X>bb[2]||Y<bb[1]||Y>bb[3])continue;if(ESC.pip(X,Y,B))return true;}}}
    return false;},
  /* advance W from its last value given new blockers */
  solve(wheel,W,blk,maxStep,dir=1){const d=dir;
    if(ESC.hit(wheel,W,blk)){for(let k=1;k<=150;k++){const e=k*0.0015;if(!ESC.hit(wheel,W-d*e,blk))return W-d*e;if(!ESC.hit(wheel,W+d*e,blk))return W+d*e;}return W;}
    let lo=W,step=0.006,hi=null;for(let t=step;t<=maxStep+1e-9;t+=step){if(ESC.hit(wheel,W+d*t,blk)){hi=W+d*t;break;}lo=W+d*t;}
    if(hi===null)return lo;for(let i=0;i<12;i++){const m=(lo+hi)/2;if(ESC.hit(wheel,m,blk))hi=m;else lo=m;}return lo;},
  solveF(h,W,maxStep){if(h(W)){for(let k=1;k<=150;k++){const e=k*0.0015;if(!h(W-e))return W-e;if(!h(W+e))return W+e;}return W;}
    let lo=W,step=0.004,hi=null;for(let t=step;t<=maxStep+1e-9;t+=step){if(h(W+t)){hi=W+t;break;}lo=W+t;}if(hi===null)return lo;for(let i=0;i<12;i++){const m=(lo+hi)/2;if(h(m))hi=m;else lo=m;}return lo;},
  polyHit(A,B){for(const q of A)if(ESC.pip(q[0],q[1],B))return true;for(const q of B)if(ESC.pip(q[0],q[1],A))return true;return false;},
  prep(polys){return polys.map(p=>({pts:p.pts,pl:p.pl||0,dense:ESC.dens(p.pts,2.5)}));},
  rot(P,O,a){const c=Math.cos(a),s=Math.sin(a);return P.map(([x,y])=>[O[0]+(x-O[0])*c-(y-O[1])*s,O[1]+(x-O[0])*s+(y-O[1])*c]);},
  /* wheel shapes (local, about 0,0; teeth lead in +angle) */
  saw(N,R,o={}){const p=TAU/N,ri=o.root??R*0.82,pts=[];for(let k=0;k<N;k++){const a=k*p;const bk=o.back??0.55;pts.push([ri*Math.cos(a-bk*p),ri*Math.sin(a-bk*p)]);
      if(o.club){const t2=a-0.16*p;pts.push([R*Math.cos(a-0.24*p),R*Math.sin(a-0.24*p)],[R*Math.cos(a),R*Math.sin(a)],[(R-4)*Math.cos(a-0.02*p),(R-4)*Math.sin(a-0.02*p)]);}
      else pts.push([R*Math.cos(a),R*Math.sin(a)]);pts.push([ri*Math.cos(a-(o.under??0.14)*p),ri*Math.sin(a-(o.under??0.14)*p)]);}return pts;},
  pinPoly(x,y,r,n=10){const o=[];for(let i=0;i<n;i++){const t=i/n*TAU;o.push([x+r*Math.cos(t),y+r*Math.sin(t)]);}return o;},
  /* an anchor pallet nib in the frame of its pallet point Q: x along u (pivot→Q), y along the inward normal; from +x: teeth arrive from the far side */
  nib(Q,u,n,shape){return shape.map(([x,y])=>[Q[0]+u[0]*x+n[0]*y,Q[1]+u[1]*x+n[1]*y]);}
};

/* ---------- pallet ("nib") escapements ----------
   A nib is a pallet tip in the frame of its pallet point Q: x = against the teeth's motion (teeth arrive from +x), y = toward the
   wheel centre. Its locking face is the +x side; the slanted inner end is the impulse face. Layouts:
   anchor  – one anchor whose pivot lies on the tangents from two pallet points (k+½ pitches apart), so the pallets move radially;
   side    – pallets at the top and bottom of the wheel, pivot to one side (three-legged wheels);
   gravity – each pallet on its own arm, pushed out by the pendulum in turn and falling back by its weight. */
function nibGeo(o){const N=o.N,R=o.R,E=o.E,p=TAU/N,dir=o.dir||1;let sides,P;
  if(o.layout==='side'||o.layout==='gravSide'){const D=o.D??R*2.4;P=[E[0]-D,E[1]];const off=o.off??0;sides=[[E[0],E[1]-R],[E[0]+R*Math.cos(PI/2+off),E[1]+R*Math.sin(PI/2+off)]].map((Q,i)=>({Q,P:o.layout==='gravSide'?[E[0]-D,E[1]+(i?1:-1)*R*1.05]:P,i,s:i?1:-1}));}
  else{const k=o.span??Math.round((2*(o.beta??0.785))/p-0.5),beta=(k+0.5)*p/2,D=R/Math.cos(beta);P=[E[0],E[1]-D];
    sides=[-1,1].map((s,i)=>({Q:[E[0]+s*R*Math.sin(beta),E[1]-R*Math.cos(beta)],P:o.layout==='gravity'?[E[0]+s*(o.gx??R*0.25),E[1]-D-30]:P,i,s}));}
  const pitchLen=p*R,b=o.nibW??(o.wheel==='pins'||o.wheel==='lantern'?0.3*pitchLen:0.25*pitchLen),i=o.lift??Math.max(4,0.32*pitchLen),rec=o.kind==='recoil'?Math.min(3,0.15*pitchLen):0;
  const grav=o.layout==='gravity'||o.layout==='gravSide',pinIn=o.pinIn??0,yoff=(grav?3:-(i/2-(o.lockIn??0.8)))+pinIn;
  for(const sd of sides){const Q=sd.Q,t=Math.atan2(Q[1]-E[1],Q[0]-E[0]),v=[-Math.sin(t)*dir,Math.cos(t)*dir],x=[-v[0],-v[1]],n=[(E[0]-Q[0])/R,(E[1]-Q[1])/R];
    let loc;if(o.pinPallet){const pr=o.pinPallet;loc=ESC.pinPoly(0,pr+yoff-1,pr,12);}else loc=[[-b/2,-14],[b/2-rec,-14],[b/2+rec,0],[-b/2,grav?2:i]].map(([X,Y])=>[X,Y+yoff]);
    sd.nib=ESC.nib(Q,x,n,loc);sd.top=ESC.nib(Q,x,n,[[0,-14+yoff]])[0];const r90=[-(Q[1]-sd.P[1]),Q[0]-sd.P[0]];sd.L=Math.abs(r90[0]*n[0]+r90[1]*n[1]);sd.outSign=(r90[0]*n[0]+r90[1]*n[1])>0?-1:1;}
  let raw;const W=o.wheel||'saw';
  if(W==='pins'||W==='lantern'){const rp=o.pinR??(W==='lantern'?6:Math.min(5,0.22*pitchLen));raw=Array.from({length:N},(_,j)=>{const a=j*p,c=Math.cos(a),sn=Math.sin(a),cx=(R-rp)*c,cy=(R-rp)*sn;
    if(W==='lantern')return{pts:ESC.pinPoly(cx,cy,rp)};/* half-round pin: flat face leading (radial), round back */const pts=[];for(let k=0;k<=12;k++){const t=a-k/12*PI;pts.push([cx+rp*Math.cos(t),cy+rp*Math.sin(t)]);}return{pts};});}
  else if(W==='three'){raw=Array.from({length:N},(_,j)=>{const a=j*p,w=o.legW??10,c=Math.cos(a),sn=Math.sin(a),pts=[[16,-w/2],[R-w*0.6,-w/2],[R,w*0.1],[R-2,w/2],[16,w/2]];return{pts:pts.map(([X,Y])=>[X*c-Y*sn*dir,X*sn+Y*c*dir])};});}
  else raw=[{pts:ESC.saw(N,R,{club:W==='club',under:W==='club'?0.05:0.14,back:o.back})}];
  if(dir<0)raw=raw.map(r=>({pts:r.pts.map(([X,Y])=>[X,-Y])}));
  const Lm=Math.min(...sides.map(sd=>sd.L)),ampA=Math.max(0.07,(i/2+4)/Lm);return{N,R,E,P,p,b,i,sides,dir,ampA,wheel:{C:E,polys:ESC.prep(raw)},raw,o};}
/* angle of each pallet's carrier for oscillator angle a */
function nibAngles(G,a){const o=G.o;if(o.layout==='gravity'||o.layout==='gravSide'){const c=o.gc??1.4;return G.sides.map(sd=>sd.outSign*(sd.s<0?Math.max(0,-a):Math.max(0,a))*c);}return G.sides.map(()=>a);}
function nibBlk(G,a){const an=nibAngles(G,a);return G.sides.map((sd,j)=>[ESC.rot(sd.nib,sd.P,an[j]),0]);}
function drawWheel(G,W){const E=G.E,o=G.o,c=Math.cos(W),s=Math.sin(W),T=([x,y])=>[E[0]+x*c-y*s,E[1]+x*s+y*c],w=o.wheel||'saw';
  if(w==='pins'){circ(E[0],E[1],G.R+6);paint(C['steel-fill'],C.ink);for(const r of G.raw){poly(r.pts.map(T));ctx.closePath();paint(C.hi,C.ink,1);}}
  else if(w==='lantern'){circ(E[0],E[1],G.R+8);circ(E[0],E[1],G.R-16,false);paint(C.part,C.ink);for(const r of G.raw){poly(r.pts.map(T));ctx.closePath();paint(C['steel-fill'],C.ink,1);}}
  else if(w==='three'){for(const r of G.raw){poly(r.pts.map(T));ctx.closePath();paint(C['steel-fill'],C.ink);}circ(E[0],E[1],20);paint(C['steel-fill'],C.ink);}
  else{poly(G.raw[0].pts.map(T));ctx.closePath();circ(E[0],E[1],7,false);for(let k=0;k<4;k++){const t=W+k*PI/2;circ(E[0]+G.R*0.45*Math.cos(t),E[1]+G.R*0.45*Math.sin(t),G.R*0.16,false);}paint(C['steel-fill'],C.ink);}
  pivot(E[0],E[1],5);}
function nibEsc(num,o){const G=nibGeo(o),osc=o.osc||'pend';
  const lam=th=>osc==='lever'?(o.lb??G.ampA*1.1)*Math.tanh(th/(o.te??0.35)):th;
  return reg({ESC,num,outLabel:osc==='lever'?'Balance angle, degrees':'Pendulum angle, degrees',concept:!!o.concept,G,
    reset(){this.W=0;this.lastPhi=null;},
    th(phi){return(o.amp??(osc==='lever'?2.2:(o.layout==='gravity'||o.layout==='gravSide'?0.1:G.ampA)))*Math.sin(phi);},
    update(phi){const step=a=>{this.W=ESC.solve(G.wheel,this.W,nibBlk(G,a),G.p,G.dir);};
      if(this.lastPhi===null){this.W=0;step(lam(this.th(phi)));}else{const n=Math.max(1,Math.ceil(Math.abs(phi-this.lastPhi)/0.012));for(let k=1;k<=n;k++)step(lam(this.th(this.lastPhi+(phi-this.lastPhi)*k/n)));}
      this.lastPhi=phi;const th=this.th(phi);this.g={phi,th,a:lam(th),W:this.W,an:nibAngles(G,lam(th))};},
    output(){return this.g.th*180/PI;},
    draw(){const g=this.g,E=G.E,P=G.P,grav=o.layout==='gravity'||o.layout==='gravSide';
      if(osc==='pend'){const Ps=grav?[E[0],G.sides[0].P[1]-30]:P;ctx.save();ctx.translate(Ps[0],Ps[1]);ctx.rotate(g.th);bar(0,0,0,480-Ps[1],6,C.part);circ(0,480-Ps[1],22);paint(C['brass-fill'],C.ink);ctx.restore();ground(Ps[0],Ps[1]-12,60,true);}
      drawWheel(G,g.W);
      G.sides.forEach((sd,j)=>{const an=g.an[j],A=ESC.rot([sd.P,sd.top],sd.P,an);bar(A[0][0],A[0][1],A[1][0],A[1][1],grav?7:11,C['brass-fill']);poly(ESC.rot(sd.nib,sd.P,an));ctx.closePath();paint(o.kind==='deadbeat'?C.hi:C['brass-fill'],C.ink,1.2);pivot(sd.P[0],sd.P[1],grav?4:6);});
      if(grav)for(const sd of G.sides)label('',0,0);
      if(osc==='lever'){const Pf=ESC.rot([[P[0],P[1]-70]],P,g.a)[0];bar(P[0],P[1],Pf[0],Pf[1],8,C['brass-fill']);for(const s of [-1,1]){const f=ESC.rot([[P[0]+s*9,P[1]-82]],P,g.a)[0];bar(Pf[0],Pf[1],f[0],f[1],5,C['brass-fill']);}
        const B=[P[0],P[1]-70-12-22-6];balanceW(B,o.br||60,g.th);const rp=[B[0]-22*Math.sin(g.th),B[1]+22*Math.cos(g.th)];circ(B[0],B[1],26);paint(C.part,C.ink);circ(rp[0],rp[1],4);paint(C.steel,C.ink);label('BALANCE',B[0]+80,B[1]);label('LEVER',P[0]+30,P[1]-50);}
      label('ESCAPE WHEEL',E[0]+G.R+20,E[1]+G.R*0.6);label(o.label,400,505,'center');},
    reads(){const g=this.g;return[[osc==='lever'?'Balance':'Pendulum',`${(g.th*180/PI).toFixed(osc==='lever'?0:1)}°`],['Escape wheel',`${(Math.abs(g.W)/TAU*G.N).toFixed(1)} teeth`],['Per swing','half a tooth']];}});}
nibEsc(288,{N:30,R:95,E:[400,300],kind:'recoil',label:'ANCHOR (RECOIL) · the wheel is pushed back a little after each drop'});
nibEsc(238,{N:20,R:95,E:[400,300],kind:'recoil',beta:0.6,label:'PALLETS RELEASE ONE TOOTH AT A TIME'});
nibEsc(289,{N:30,R:95,E:[400,300],kind:'deadbeat',wheel:'saw',label:'DEAD-BEAT · the locking faces are arcs about the pivot, so the wheel never recoils'});
nibEsc(290,{N:30,R:95,E:[400,300],kind:'recoil',beta:0.5,label:'PENDULUM ESCAPEMENT'});
nibEsc(292,{N:30,R:95,E:[400,300],kind:'deadbeat',wheel:'pins',label:'PIN DEAD-BEAT · pins on the wheel face'});
nibEsc(297,{N:10,R:95,E:[400,300],kind:'recoil',wheel:'lantern',nibW:12,lift:9,label:'LANTERN WHEEL ESCAPEMENT'});
nibEsc(303,{N:30,R:95,E:[400,300],kind:'deadbeat',wheel:'saw',beta:0.45,label:'PALLET FACES CENTRED ON THE PIVOT'});
nibEsc(304,{N:30,R:95,E:[400,300],kind:'deadbeat',wheel:'pins',beta:0.5,label:'PIN-WHEEL ESCAPEMENT'});
nibEsc(305,{N:12,R:95,E:[400,300],kind:'recoil',pinPallet:5,label:'PIN PALLETS ON THE PENDULUM CRUTCH'});
nibEsc(306,{N:3,R:90,E:[420,280],layout:'side',kind:'recoil',wheel:'three',nibW:12,lift:10,label:'THREE TEETH, UPPER AND LOWER PALLETS'});
nibEsc(307,{N:3,R:110,E:[420,270],layout:'side',kind:'deadbeat',wheel:'three',nibW:12,lift:10,label:'LONG STOPPING TEETH'});
nibEsc(309,{N:15,R:90,E:[400,320],layout:'gravity',wheel:'saw',label:'GRAVITY · each arm is lifted off by the pendulum and falls back by its weight'});
nibEsc(310,{N:3,R:90,E:[440,290],layout:'gravSide',wheel:'three',nibW:12,label:'THREE-LEGGED GRAVITY ESCAPEMENT'});
nibEsc(311,{N:6,R:90,E:[440,290],layout:'gravSide',wheel:'three',nibW:10,off:-PI/6,label:'DOUBLE THREE-LEGGED GRAVITY'});
nibEsc(312,{N:10,R:60,E:[400,340],layout:'gravity',wheel:'saw',label:'SMALL LIFTING WHEEL'});
nibEsc(296,{N:15,R:85,E:[400,380],osc:'lever',kind:'deadbeat',wheel:'saw',label:'LEVER ESCAPEMENT · fork and roller pin'});
nibEsc(302,{N:15,R:85,E:[400,380],osc:'lever',kind:'recoil',wheel:'saw',label:'BALANCE AND PALLETS'});
nibEsc(314,{N:15,R:85,E:[400,380],osc:'lever',kind:'deadbeat',wheel:'saw',label:'LEVER CHRONOMETER'});

/* ---------- detent (chronometer) escapements ----------
   The wheel is held by a stone on the detent. Once per double swing, as the balance turns one way, its discharging pallet lifts
   the detent for a moment; the wheel turns, a tooth catches up with the impulse pallet on the balance's roller and drives it
   (the impulse), then the next tooth falls on the stone again. On the return swing the detent is left alone. */
function detentGeo(o){const N=o.N||12,R=o.R||85,E=o.E||[400,370],p=TAU/N,dir=-1,rr=o.rr||30,ov=o.ov||6.5,d=R+rr-ov,B=[E[0],E[1]-d];
  const g=o.gam??1.5*p,t=-PI/2+g,Ql=[E[0]+R*Math.cos(t),E[1]+R*Math.sin(t)],v=[Math.sin(t),-Math.cos(t)],x=[-v[0],-v[1]],n=[(E[0]-Ql[0])/R,(E[1]-Ql[1])/R];
  const Dp=[Ql[0]+x[0]*90,Ql[1]+x[1]*90],stone=ESC.nib(Ql,x,n,[[-3,-12],[3,-12],[3,5],[-3,5]]),r90=[-(Ql[1]-Dp[1]),Ql[0]-Dp[0]],outSign=(r90[0]*n[0]+r90[1]*n[1])>0?-1:1;
  const raw=[{pts:ESC.saw(N,R,{back:0.5}).map(([X,Y])=>[X,-Y])}];
  const pal=[[rr-12,-3],[rr,-1.5],[rr,4],[rr-12,4]];/* in roller frame: x radial; the +y side is the face the tooth pushes */
  const ga=-PI/2+0.2*p,gp=[E[0]+R*Math.cos(ga)-B[0],E[1]+R*Math.sin(ga)-B[1]],c0=o.c0??Math.atan2(gp[1],gp[0])+(o.dc||0),k=30/rr;
  return{N,R,E,p,dir,B,rr,Ql,Dp,stone,outSign,c0,k,wheel:{C:E,polys:ESC.prep(raw)},raw,pal,o};}
function detentState(G,phi){const o=G.o,A=o.amp??2.3*G.k,th=A*Math.sin(phi),up=Math.cos(phi)>0,w0=(o.w0??-0.32)*G.k,w1=(o.w1??-0.05)*G.k;
  const lift=up&&th>w0&&th<w1?Math.sin(PI*(th-w0)/(w1-w0)):0;return{th,del:G.outSign*0.13*lift,lift};}
function detentBlk(G,st){const rot=st.th+G.c0,c=Math.cos(rot),s=Math.sin(rot),B=G.B;
  const pal=G.pal.map(([X,Y])=>[B[0]+X*c-Y*s,B[1]+X*s+Y*c]);return[[ESC.rot(G.stone,G.Dp,st.del),0],[pal,0]];}
function detentEsc(num,o){const G0=detentGeo(o),pend=o.osc==='pend';
  return reg({ESC,ESCgeo:q=>detentGeo(Object.assign({},o,q)),G:G0,num,outLabel:pend?'Pendulum angle, degrees':'Balance angle, degrees',concept:!!o.concept,
    reset(){this.W=0;this.lastPhi=null;},
    update(phi){const G=this.G,step=ph=>{this.W=ESC.solve(G.wheel,this.W,detentBlk(G,detentState(G,ph)),G.p,G.dir);};
      if(this.lastPhi===null){this.W=0;step(phi);}else{const n=Math.max(1,Math.ceil(Math.abs(phi-this.lastPhi)/0.012));for(let k=1;k<=n;k++)step(this.lastPhi+(phi-this.lastPhi)*k/n);}
      this.lastPhi=phi;const st=detentState(G,phi);this.g={phi,...st,W:this.W};},
    output(){return this.g.th*180/PI;},
    draw(){const G=this.G,g=this.g,E=G.E,B=G.B,blk=detentBlk(G,g);drawWheel({E,R:G.R,raw:G.raw,o:{wheel:'saw'}},g.W);
      const D=ESC.rot([G.Dp,G.Ql],G.Dp,g.del);bar(D[0][0],D[0][1],D[1][0],D[1][1],7,C.part);poly(blk[0][0]);ctx.closePath();paint(C.hi,C.ink,1);pivot(G.Dp[0],G.Dp[1],4);springZ(G.Dp[0]+6,G.Dp[1]-8,G.Dp[0]+50,G.Dp[1]-40,6,4);
      if(pend){const tip=[B[0]+(G.rr-12)*Math.cos(g.th+G.c0),B[1]+(G.rr-12)*Math.sin(g.th+G.c0)];bar(B[0],B[1],tip[0],tip[1],7,C.part);const bob=[B[0]+(G.rr+200)*Math.cos(g.th+G.c0),B[1]+(G.rr+200)*Math.sin(g.th+G.c0)];bar(tip[0],tip[1],bob[0],bob[1],5,C.part);circ(bob[0],bob[1],22);paint(C['brass-fill'],C.ink);ground(B[0],B[1]-12,50,true);}
      else{ctx.save();ctx.globalAlpha=0.35;balanceW([B[0],B[1]],o.br||70,g.th);ctx.restore();circ(B[0],B[1],G.rr-12);paint(C.part,C.ink);}poly(blk[1][0]);ctx.closePath();paint(C['brass-fill'],C.ink,1);
      if(!pend){const dc=g.th+G.c0+PI*0.55;circ(B[0]+(G.rr-14)*Math.cos(dc),B[1]+(G.rr-14)*Math.sin(dc),3);paint(C.steel,C.ink);}pivot(B[0],B[1],4);
      label('DETENT',G.Dp[0]+10,G.Dp[1]+20);label(g.lift>0?'DETENT LIFTED · wheel gives impulse':'WHEEL LOCKED ON THE DETENT STONE',400,480,'center');label(o.label,400,505,'center');},
    reads(){const G=this.G,g=this.g;return[[pend?'Pendulum':'Balance',`${(g.th*180/PI).toFixed(0)}°`],['Escape wheel',`${(Math.abs(g.W)/G.p).toFixed(1)} teeth`],['Impulse','once per double swing']];}});}
detentEsc(291,{label:'DETENT WATCH ESCAPEMENT · spring detent'});
detentEsc(313,{label:'CHRONOMETER (DETENT) ESCAPEMENT · pivoted detent'});
detentEsc(308,{osc:'pend',rr:60,ov:4,dc:0.03,E:[400,330],R:85,label:'DETACHED · the pendulum is free except at the moment of impulse'});
detentEsc(396,{label:"REED'S ESCAPEMENT · a detent locks, the balance takes impulse once a swing"});

/* ---------- duplex escapement ----------
   Long teeth rest on a small roller on the balance staff; each time a notch in the roller comes round (one way of the swing)
   a tooth slips through it, and an impulse pin standing on the wheel's face then drives the balance's pallet arm. */
function duplexGeo(o){const N=o.N||15,R=o.R||85,E=o.E||[400,360],p=TAU/N,rl=o.rl||7,d=R+rl-(o.ov||3),B=[E[0],E[1]-d],Rp=o.Rp||0.55*R,rpin=o.rpin||3,Lp=d-Rp+(o.pov||5);
  const teeth={pts:ESC.saw(N,R,{back:0.32,root:R*0.72}),pl:0},pins=Array.from({length:N},(_,j)=>{const a=j*p+(o.pinPh??0)*p;return{pts:ESC.pinPoly(Rp*Math.cos(a),Rp*Math.sin(a),rpin),pl:o.pinContact?1:2};});
  const nw=o.nw||0.75,roller=[];for(let i=0;i<48;i++){const t=i/48*TAU;const dt=Math.abs(((t+PI)%TAU+TAU)%TAU-PI);const r=dt<nw/2?rl-2.6*(1-dt/(nw/2)):rl;roller.push([r*Math.cos(t),r*Math.sin(t)]);}/* notch centred on local angle 0 */
  const pal=[[Lp-12,-1.5],[Lp,-1.5],[Lp,1.5],[Lp-12,1.5]];
  return{N,R,E,p,dir:1,B,rl,Rp,Lp,roller,pal,wheel:{C:E,polys:ESC.prep([teeth,...pins])},teeth,pins,o};}
function duplexBlk(G,th){const o=G.o,B=G.B,tr=(P,a)=>{const c=Math.cos(a),s=Math.sin(a);return P.map(([x,y])=>[B[0]+x*c-y*s,B[1]+x*s+y*c]);};
  return[[tr(G.roller,PI/2+th-(o.tn??0.1)),0],[tr(G.pal,PI/2+th-(o.tp??-0.4)),1]];}
function duplexEsc(num,o){const G0=duplexGeo(o);
  return reg({ESC,blk:duplexBlk,ESCgeo:q=>duplexGeo(Object.assign({},o,q)),G:G0,num,outLabel:'Balance angle, degrees',concept:!!o.concept,
    reset(){this.W=0;this.lastPhi=null;},th(phi){return(this.G.o.amp??2.4)*Math.sin(phi);},
    update(phi){const G=this.G,step=ph=>{this.W=ESC.solve(G.wheel,this.W,duplexBlk(G,this.th(ph)),G.p,1);};
      if(this.lastPhi===null){this.W=0;step(phi);}else{const n=Math.max(1,Math.ceil(Math.abs(phi-this.lastPhi)/0.012));for(let k=1;k<=n;k++)step(this.lastPhi+(phi-this.lastPhi)*k/n);}
      this.lastPhi=phi;this.g={phi,th:this.th(phi),W:this.W};},
    output(){return this.g.th*180/PI;},
    draw(){const G=this.G,g=this.g,E=G.E,B=G.B,c=Math.cos(g.W),s=Math.sin(g.W),T=([x,y])=>[E[0]+x*c-y*s,E[1]+x*s+y*c],blk=duplexBlk(G,g.th);
      poly(G.teeth.pts.map(T));ctx.closePath();circ(E[0],E[1],7,false);paint(C['steel-fill'],C.ink);for(const q of G.pins){poly(q.pts.map(T));ctx.closePath();paint(C.hi,C.ink,1);}pivot(E[0],E[1],5);
      ctx.save();ctx.globalAlpha=0.35;balanceW(B,o.br||70,g.th);ctx.restore();poly(blk[1][0]);ctx.closePath();const pb=blk[1][0];bar(B[0],B[1],(pb[0][0]+pb[3][0])/2,(pb[0][1]+pb[3][1])/2,4,C['brass-fill']);paint(C['brass-fill'],C.ink);
      poly(blk[0][0]);ctx.closePath();paint(C.hi,C.ink,1);pivot(B[0],B[1],3);
      label('LOCKING ROLLER with notch',B[0]+20,B[1]-14);label('IMPULSE PINS',E[0]+G.Rp+10,E[1]+10);label(o.label,400,505,'center');},
    reads(){const G=this.G,g=this.g;return[['Balance',`${(g.th*180/PI).toFixed(0)}°`],['Escape wheel',`${(g.W/G.p).toFixed(1)} teeth`],['Impulse','once per double swing']];}});}
duplexEsc(300,{label:'DUPLEX · long teeth lock on the roller, short pins give impulse'});
duplexEsc(301,{label:'DUPLEX, SIDE VIEW'});

/* ---------- cylinder escapement ----------
   The balance staff is a hollow half-cylinder at the wheel's rim. Each tooth is a wedge raised on a stalk: it rests on the outside
   of the cylinder, slips in through the opening (its slope pushing the lip: impulse), rests on the inside wall, and leaves through
   the opening on the return swing, giving a second impulse. The stalks pass under the cut-away part of the cylinder. */
function cylGeo(o){const N=o.N||12,R=o.R||85,E=o.E||[400,340],p=TAU/N,ri=o.ri||8.5,ro=o.ro||11,hh=6,hl=o.hl||2*ri-3,Cc=[E[0],E[1]-(R-hh/2)];
  const heads=Array.from({length:N},(_,j)=>{const a=j*p,c=Math.cos(a),s=Math.sin(a),dA=hl/(R-hh/2);const P=(ang,r)=>[r*Math.cos(ang),r*Math.sin(ang)];return{pts:[P(a,R-hh),P(a,R),P(a+dA*0.35,R-0.6),P(a+dA,R-hh+0.6)],pl:1};});
  const stalks=Array.from({length:N},(_,j)=>{const a=j*p,c=Math.cos(a),s=Math.sin(a),w=3;return{pts:[[ (R-30)*c+w*s,(R-30)*s-w*c],[(R-hh)*c+w*s,(R-hh)*s-w*c],[(R-hh)*c-w*s,(R-hh)*s+w*c],[(R-30)*c-w*s,(R-30)*s+w*c]],pl:0};});
  const span=o.span??PI+0.25,band=[];const n=40;for(let i=0;i<=n;i++){const t=-span/2+span*i/n;band.push([ro*Math.cos(t),ro*Math.sin(t)]);}for(let i=n;i>=0;i--){const t=-span/2+span*i/n;band.push([ri*Math.cos(t),ri*Math.sin(t)]);}
  return{N,R,E,p,dir:1,Cc,ri,ro,band,heads,stalks,wheel:{C:E,polys:ESC.prep(heads)},o};}
function cylBlk(G,th){const o=G.o,a=th+(o.c0??PI/2),c=Math.cos(a),s=Math.sin(a),C=G.Cc;return[[G.band.map(([x,y])=>[C[0]+x*c-y*s,C[1]+x*s+y*c]),1]];}
function cylEsc(num,o){const G0=cylGeo(o);
  return reg({ESC,blk:cylBlk,ESCgeo:q=>cylGeo(Object.assign({},o,q)),G:G0,num,outLabel:'Balance angle, degrees',concept:!!o.concept,
    reset(){this.W=0;this.lastPhi=null;},th(phi){return(this.G.o.amp??2.2)*Math.sin(phi);},
    update(phi){const G=this.G,step=ph=>{this.W=ESC.solve(G.wheel,this.W,cylBlk(G,this.th(ph)),G.p,1);};
      if(this.lastPhi===null){this.W=0;step(phi);}else{const n=Math.max(1,Math.ceil(Math.abs(phi-this.lastPhi)/0.012));for(let k=1;k<=n;k++)step(this.lastPhi+(phi-this.lastPhi)*k/n);}
      this.lastPhi=phi;this.g={phi,th:this.th(phi),W:this.W};},
    output(){return this.g.th*180/PI;},
    draw(){const G=this.G,g=this.g,E=G.E,c=Math.cos(g.W),s=Math.sin(g.W),T=([x,y])=>[E[0]+x*c-y*s,E[1]+x*s+y*c];
      circ(E[0],E[1],G.R-28);circ(E[0],E[1],7,false);paint(C['steel-fill'],C.ink);for(const q of G.stalks){poly(q.pts.map(T));ctx.closePath();paint(C['steel-fill'],C.ink,1);}for(const q of G.heads){poly(q.pts.map(T));ctx.closePath();paint(C['steel-fill'],C.ink,1);}pivot(E[0],E[1],5);
      ctx.save();ctx.globalAlpha=0.35;balanceW([G.Cc[0],G.Cc[1]-130],o.br||70,g.th);ctx.restore();bar(G.Cc[0],G.Cc[1],G.Cc[0],G.Cc[1]-130,4,C.part);
      poly(cylBlk(G,g.th)[0][0]);ctx.closePath();paint(C['brass-fill'],C.ink,1.2);
      label('HALF-CYLINDER on the balance staff',G.Cc[0]+30,G.Cc[1]-20);label(o.label,400,505,'center');},
    reads(){const G=this.G,g=this.g;return[['Balance',`${(g.th*180/PI).toFixed(0)}°`],['Escape wheel',`${(g.W/G.p).toFixed(2)} teeth`],['Impulse','every swing, on the cylinder lips']];}});}
cylEsc(294,{label:'CYLINDER ESCAPEMENT · teeth pass through the half-cylinder'});
cylEsc(295,{label:'CYLINDER ESCAPEMENT, SECOND VIEW'});

/* ---------- verge (crown wheel) escapements, drawn in 3D ----------
   The crown wheel's teeth stand on its face. The verge staff lies across the face; its two flag pallets, set about 100° apart,
   meet teeth at the top and at the bottom of the wheel, which move opposite ways. As the verge swings, one flag lets a tooth past
   while the other comes in front of a tooth on the far side and is pushed back: the wheel recoils at every beat. The contact is
   solved in the plane of each flag (teeth moving in a straight line past the staff). */
function vergeGeo(o){const N=o.N||15,Rc=o.Rc||100,h=o.h||18,P=TAU*Rc/N,xs=o.xs??h+12,al=o.al??0.9,Lf=o.Lf??34,wf=3;
  const prof=[[-0.62*P,0],[-0.62*P,-4],[0.05*P,-4],[0.05*P,0],[0,h],[-0.1*P,1]].slice(0);/* tooth (s along motion, x up from the face); base strip keeps it closed */
  const tooth=ESC.dens([[-0.62*P,0],[0,h],[-0.12*P,0]],1.5);
  return{N,Rc,h,P,xs,al,Lf,wf,tooth,o};}
function vergeShapes(G,W,th){const out={top:[],bot:[]},N=G.N,P=G.P,Rc=G.Rc;
  for(let k=0;k<N;k++){const t=W+k*TAU/N,st=Rc*(mod(t-PI/2+PI,TAU)-PI),sb=Rc*(mod(t+PI/2+PI,TAU)-PI);
    if(Math.abs(st)<70)out.top.push(G.tooth.map(([sg,x])=>[x,-(st+sg)]));if(Math.abs(sb)<70)out.bot.push(G.tooth.map(([sg,x])=>[x,(sb+sg)]));}
  const flag=psi=>{const c=Math.cos(psi),s=Math.sin(psi),n=[-s,c];return[[G.xs+n[0]*G.wf/2,n[1]*G.wf/2],[G.xs+c*G.Lf+n[0]*G.wf/2,s*G.Lf+n[1]*G.wf/2],[G.xs+c*G.Lf-n[0]*G.wf/2,s*G.Lf-n[1]*G.wf/2],[G.xs-n[0]*G.wf/2,-n[1]*G.wf/2]];};
  out.ft=flag(PI-G.al+th);out.fb=flag(PI+G.al+th);return out;}
function vergeHit(G,W,th){const S=vergeShapes(G,W,th),ft=ESC.dens(S.ft,1.5),fb=ESC.dens(S.fb,1.5);for(const q of S.top)if(ESC.polyHit(q,ft))return true;for(const q of S.bot)if(ESC.polyHit(q,fb))return true;return false;}
function vergeEsc(num,o){const G0=vergeGeo(o);
  return reg({ESC,ESCgeo:q=>vergeGeo(Object.assign({},o,q)),G:G0,num,outLabel:o.osc==='pend'?'Pendulum angle, degrees':o.osc==='bal'?'Balance angle, degrees':'Foliot angle, degrees',concept:!!o.concept,
    reset(){this.W=0;this.lastPhi=null;},th(phi){return(this.G.o.amp??0.62)*Math.sin(phi);},
    update(phi){const G=this.G,step=ph=>{const th=this.th(ph);this.W=ESC.solveF(W=>vergeHit(G,W,th),this.W,TAU/G.N);};
      if(this.lastPhi===null){this.W=0;step(phi);}else{const n=Math.max(1,Math.ceil(Math.abs(phi-this.lastPhi)/0.012));for(let k=1;k<=n;k++)step(this.lastPhi+(phi-this.lastPhi)*k/n);}
      this.lastPhi=phi;this.g={phi,th:this.th(phi),W:this.W};},
    output(){return this.g.th*180/PI;},
    draw(){const G=this.G,g=this.g,R=R3(Object.assign({},CAMG,{cx:400,cy:265,yaw:0.7,pitch:0.22,sc:1.1},o.cam||{})),Rc=G.Rc,N=G.N;
      const F=fr3([0,0,0],[0,1,0],[0,0,1]);prism3(R,F,ringPts(Rc+2,72),-10,0,C['steel-fill']);
      for(let k=0;k<N;k++){const t=g.W+k*TAU/N,T=[0,-Math.sin(t),Math.cos(t)],Rr=[0,Math.cos(t),Math.sin(t)],Ft=fr3(v3.mul(Rr,Rc-5),T,[1,0,0]);prism3(R,Ft,[[-0.62*G.P,0],[0,G.h],[-0.12*G.P,0]],0,5,C['steel-fill']);}
      rod3(R,[-10,0,0],[-150,0,0],5,C.part);
      const zt=Rc+2,zb=-Rc-2;rod3(R,[G.xs,0,zb-30],[G.xs,0,zt+70],3,C.part);
      for(const [z,psi] of [[zt,PI-G.al+g.th],[zb,PI+G.al+g.th]]){const c=Math.cos(psi),s=Math.sin(psi);block3(R,[G.xs+c*G.Lf/2,s*G.Lf/2,z],[c,s,0],[0,0,1],G.Lf,G.wf,10,C['brass-fill']);}
      const top=[G.xs,0,zt+70];
      if(o.osc==='bal'){const Fb=fr3(top,[Math.cos(g.th),Math.sin(g.th),0],[-Math.sin(g.th),Math.cos(g.th),0]);prism3(R,Fb,ringPts(70,48),0,4,C['brass-fill']);prism3(R,Fb,[[-66,-3],[66,-3],[66,3],[-66,3]],0,4,C['brass-fill']);}
      else if(o.osc==='pend'){const d=[Math.cos(g.th+PI/2),Math.sin(g.th+PI/2),0];rod3(R,top,v3.add(top,v3.mul(d,40)),3,C.part);rod3(R,v3.add(top,v3.mul(d,40)),v3.add(v3.add(top,v3.mul(d,40)),[0,0,-260]),2,C.part);}
      else{const c=Math.cos(g.th),s=Math.sin(g.th);block3(R,top,[c,s,0],[0,0,1],300,8,8,C['brass-fill']);for(const k of [-1,1])block3(R,v3.add(top,[k*130*c,k*130*s,0]),[c,s,0],[0,0,1],18,18,22,C['brass-fill']);}
      R.draw();label(o.label,400,505,'center');},
    reads(){const G=this.G,g=this.g;return[[o.osc==='bal'?'Balance':o.osc==='pend'?'Pendulum':'Foliot',`${(g.th*180/PI).toFixed(0)}°`],['Crown wheel',`${(g.W/TAU*G.N).toFixed(1)} teeth`],['Recoil','at every beat']];}});}
vergeEsc(234,{label:'VERGE AND FOLIOT · flags at the top and bottom of the crown wheel catch teeth in turn'});
vergeEsc(298,{osc:'bal',label:'OLD WATCH (VERGE) ESCAPEMENT · balance on the verge staff'});
vergeEsc(299,{osc:'pend',label:'OLD CLOCK ESCAPEMENT · verge worked by a short pendulum'});
vergeEsc(293,{osc:'bal',label:'CROWN-SPUR WATCH ESCAPEMENT'});
