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

/* anchor-type escapements: pallets on an anchor whose pivot lies on the tangents from the pallet points (so the pallets move
   radially as the anchor rocks). kind: 'recoil' (locking faces lean so the wheel is driven back), 'deadbeat' (locking faces on
   arcs about the pivot: no recoil). wheel: 'saw' | 'club' | 'pins'. */
function anchorGeo(o){const N=o.N,R=o.R,E=o.E,p=TAU/N,k=o.span??Math.round((2*(o.beta??0.785))/p-0.5),beta=(k+0.5)*p/2,D=R/Math.cos(beta),P=[E[0],E[1]-D],L=R*Math.tan(beta);
  const b=o.nibW??(o.wheel==='pins'?0.3*p*R:0.25*p*R),i=o.lift??Math.max(4,0.32*p*R),rec=o.kind==='recoil'?3:0,dl=i/2-0.8;
  const sides=[-1,1].map(s=>{const Q=[E[0]+s*R*Math.sin(beta),E[1]-R*Math.cos(beta)],u=[(Q[0]-P[0])/L,(Q[1]-P[1])/L],n=[(E[0]-Q[0])/R,(E[1]-Q[1])/R],m=s<0?1:-1;/* m=+1: teeth arrive from +x */
    const loc=[[-m*b/2,-14],[m*(b/2-rec),-14],[m*(b/2+rec),0],[-m*b/2,i]].map(([x,y])=>[x,y-dl]);/* lock corner at radius R when the anchor is central */
    return{s,Q,u,n,nib:ESC.nib(Q,u,n,loc),arm:[P,ESC.nib(Q,u,n,[[0,-14]])[0]]};});
  let wheel;if(o.wheel==='pins'){const rp=o.pinR??Math.min(4,0.18*p*R);wheel=Array.from({length:N},(_,j)=>({pts:ESC.pinPoly((R-rp)*Math.cos(j*p),(R-rp)*Math.sin(j*p),rp)}));}
  else wheel=[{pts:ESC.saw(N,R,{club:o.wheel==='club',under:o.wheel==='club'?0.05:0.14})}];
  return{N,R,E,P,beta,L,b,i,sides,wheel:{C:E,polys:ESC.prep(wheel)},raw:wheel,p};}
function anchorBlk(G,a){return G.sides.map(sd=>[ESC.rot(sd.nib,G.P,a),0]);}
function anchorEsc(num,o){const G=anchorGeo(o),bal=o.osc==='bal';
  return reg({ESC,num,outLabel:bal?'Balance angle, degrees':'Pendulum angle, degrees',concept:!!o.concept,G,
    reset(){this.W=0;this.lastPhi=null;},
    osc(phi){return(o.amp??0.09)*Math.sin(phi);},
    update(phi){const a=this.osc(phi);if(this.lastPhi===null){this.W=ESC.solve(G.wheel,0,anchorBlk(G,a),G.p);}
      else{const n=Math.max(1,Math.ceil(Math.abs(phi-this.lastPhi)/0.05));for(let k=1;k<=n;k++){const aa=this.osc(this.lastPhi+(phi-this.lastPhi)*k/n);this.W=ESC.solve(G.wheel,this.W,anchorBlk(G,aa),G.p);}}
      this.lastPhi=phi;this.g={phi,a,W:this.W};},
    output(){return this.g.a*180/PI;},
    draw(){const g=this.g,E=G.E,P=G.P,c=Math.cos(g.W),s=Math.sin(g.W),T=([x,y])=>[E[0]+x*c-y*s,E[1]+x*s+y*c];
      if(!bal){ctx.save();ctx.translate(P[0],P[1]);ctx.rotate(-g.a*0+g.a);bar(0,0,0,470-P[1],6,C.part);circ(0,470-P[1],24);paint(C['brass-fill'],C.ink);ctx.restore();ground(P[0],P[1]-12,60,true);}
      if(o.wheel==='pins'){circ(E[0],E[1],G.R+6);paint(C['steel-fill'],C.ink);for(const w of G.raw){poly(w.pts.map(T));ctx.closePath();paint(C.hi,C.ink,1);}}
      else{poly(G.raw[0].pts.map(T));ctx.closePath();circ(E[0],E[1],7,false);for(let k=0;k<4;k++){const t=g.W+k*PI/2;circ(E[0]+G.R*0.45*Math.cos(t),E[1]+G.R*0.45*Math.sin(t),G.R*0.16,false);}paint(C['steel-fill'],C.ink);}
      pivot(E[0],E[1],5);
      for(const sd of G.sides){const A=ESC.rot([sd.arm[0],sd.arm[1]],P,g.a);bar(A[0][0],A[0][1],A[1][0],A[1][1],11,C['brass-fill']);poly(ESC.rot(sd.nib,P,g.a));ctx.closePath();paint(o.kind==='deadbeat'?C.hi:C['brass-fill'],C.ink,1.2);}
      pivot(P[0],P[1],6);label('ESCAPE WHEEL',E[0]+G.R+20,E[1]+G.R*0.6);label(o.label,400,505,'center');},
    reads(){const g=this.g;return[['Pendulum',`${(g.a*180/PI).toFixed(1)}°`],['Escape wheel',`${(g.W/TAU*G.N).toFixed(1)} teeth`],['Per swing','half a tooth']];}});}
anchorEsc(288,{N:30,R:95,E:[400,300],kind:'recoil',label:'ANCHOR (RECOIL) · the wheel is pushed back a little after each drop'});
