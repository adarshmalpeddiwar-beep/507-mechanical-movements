/* ================= audit pass · pseudo-3D drawing kit and belts between shafts at right angles (3, 4, 11, 243) ================= */
/* orthographic camera: world z up. yaw turns about z, pitch tilts toward the viewer. P(p) -> [sx, sy, depth] (bigger depth = farther) */
function cam3(yaw,pitch,sc,cx,cy){const cy_=Math.cos(yaw),sy_=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);
  return p=>{const x=p[0]*cy_-p[1]*sy_,y=p[0]*sy_+p[1]*cy_,z=p[2];/* view: x right, y into screen, z up */return[cx+sc*x,cy-sc*(z*cp-y*sp),y*cp+z*sp];};}
const v3={add:(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]],sub:(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],mul:(a,k)=>[a[0]*k,a[1]*k,a[2]*k],
  dot:(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],cross:(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],
  norm:a=>{const l=Math.hypot(a[0],a[1],a[2])||1;return[a[0]/l,a[1]/l,a[2]/l];},len:a=>Math.hypot(a[0],a[1],a[2])};
/* a circle in 3D: centre c, in-plane unit axes u,v (normal = u×v) */
function circ3(c,u,v,r){return{c,u,v,r,n:v3.cross(u,v),at(t,rr){rr=rr??r;return v3.add(c,v3.add(v3.mul(u,rr*Math.cos(t)),v3.mul(v,rr*Math.sin(t))));},
  loc(p){const d=v3.sub(p,c);return[v3.dot(d,u),v3.dot(d,v)];}};}
/* tangent from point P (lying in the circle's plane) to circle K, the belt then running round K with sense s (+1 = increasing angle) */
function tanFromPoint(P,K,s){const [x,y]=K.loc(P),d=Math.hypot(x,y),th=Math.atan2(y,x),al=Math.acos(Math.min(1,K.r/d));
  for(const t of [th+al,th-al]){const T=[K.r*Math.cos(t),K.r*Math.sin(t)],dir=[T[0]-x,T[1]-y],tg=[-s*Math.sin(t),s*Math.cos(t)];if(dir[0]*tg[0]+dir[1]*tg[1]>0)return t;}return th;}
/* tangent from circle K (leaving with sense s) to point P in its plane */
function tanToPoint(K,P,s){const [x,y]=K.loc(P),d=Math.hypot(x,y),th=Math.atan2(y,x),al=Math.acos(Math.min(1,K.r/d));
  for(const t of [th+al,th-al]){const T=[K.r*Math.cos(t),K.r*Math.sin(t)],dir=[x-T[0],y-T[1]],tg=[-s*Math.sin(t),s*Math.cos(t)];if(dir[0]*tg[0]+dir[1]*tg[1]>0)return t;}return th;}
function arc3(K,t0,t1,s,step=0.12){let d=s>0?mod(t1-t0,TAU):-mod(t0-t1,TAU);const n=Math.max(2,Math.ceil(Math.abs(d)/step)),o=[];for(let k=0;k<=n;k++)o.push(K.at(t0+d*k/n));return o;}
/* painter's list */
function scene(){const items=[];return{add(depth,fn){items.push([depth,fn]);},draw(){items.sort((a,b)=>b[0]-a[0]);for(const [,f] of items)f();}};}
/* draw a pulley disk of width w along its normal, with spokes turning by angle a, face fill f */
function disk3(Sc,P,K,w,a,f,o={}){const n=K.n,F=v3.add(K.c,v3.mul(n,w/2)),B=v3.sub(K.c,v3.mul(n,w/2));const N=48;
  const rim=(c)=>{const o=[];for(let i=0;i<N;i++){const t=i/N*TAU;o.push(P(v3.add(c,v3.add(v3.mul(K.u,K.r*Math.cos(t)),v3.mul(K.v,K.r*Math.sin(t))))));}return o;};
  const fr=rim(F),br=rim(B);const front=P(F)[2]<P(B)[2]?F:B,fp=front===F?fr:br;const dc=P(K.c)[2];
  Sc.add(dc+0.01,()=>{const all=fr.concat(br).map(p=>[p[0],p[1]]);const h=hullPts(all);poly(h);ctx.closePath();paint(f,C.ink,1.1);
    poly(fp);ctx.closePath();paint(f,C.ink,1.1);ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=1;const ns=o.spokes??4;
    for(let i=0;i<ns;i++){const t=a+i*TAU/ns;const p0=P(v3.add(front,v3.add(v3.mul(K.u,K.r*0.18*Math.cos(t)),v3.mul(K.v,K.r*0.18*Math.sin(t))))),p1=P(v3.add(front,v3.add(v3.mul(K.u,K.r*0.82*Math.cos(t)),v3.mul(K.v,K.r*0.82*Math.sin(t)))));ctx.beginPath();ctx.moveTo(p0[0],p0[1]);ctx.lineTo(p1[0],p1[1]);ctx.stroke();}
    const ring=[];for(let i=0;i<N;i++){const t=i/N*TAU;ring.push(P(v3.add(front,v3.add(v3.mul(K.u,K.r*0.82*Math.cos(t)),v3.mul(K.v,K.r*0.82*Math.sin(t))))));}poly(ring);ctx.closePath();ctx.lineWidth=0.7;ctx.stroke();ctx.restore();
    const hc=P(front);circ(hc[0],hc[1],3.5);paint(C.hi,C.ink,1);});}
function hullPts(pts){pts=pts.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]);const cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);const lo=[],up=[];
  for(const p of pts){while(lo.length>1&&cr(lo[lo.length-2],lo[lo.length-1],p)<=0)lo.pop();lo.push(p);}for(let i=pts.length-1;i>=0;i--){const p=pts[i];while(up.length>1&&cr(up[up.length-2],up[up.length-1],p)<=0)up.pop();up.push(p);}up.pop();lo.pop();return lo.concat(up);}
/* shaft from a to b (world), radius r */
function shaft3(Sc,P,a,b,r,f){const A=P(a),B=P(b);Sc.add((A[2]+B[2])/2+0.02,()=>{bar(A[0],A[1],B[0],B[1],2*r,f||C.part);});}
/* belt: 3D polyline drawn in short depth-sorted pieces, with marks fixed to the belt material */
function belt3(Sc,P,pts,travel,w=6){const n=pts.length;let s=0;const L=[0];for(let i=1;i<n;i++){s+=v3.len(v3.sub(pts[i],pts[i-1]));L.push(s);}
  for(let i=0;i<n-1;i++){const a=P(pts[i]),b=P(pts[i+1]);const l0=L[i];Sc.add((a[2]+b[2])/2,()=>{ctx.save();ctx.lineCap='round';ctx.strokeStyle=C.ink;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();
    ctx.strokeStyle=C.part2;ctx.lineWidth=w-2.4;ctx.stroke();ctx.setLineDash([4,14]);ctx.lineDashOffset=-(l0-travel);ctx.strokeStyle=C.ink;ctx.lineWidth=w-2.4;ctx.lineCap='butt';ctx.stroke();ctx.restore();});}}

/* ---- right-angle belts. A: driving pulley on a horizontal shaft (plane y=0). Belt geometry obeys the rule that each strand must arrive in the plane of the pulley it runs onto. ---- */
function rightAngleBelt(num,o){return reg({num,outLabel:'Driven pulley, turns',
  update(phi){this.g={phi};this.geo=this.geo||o.geo();},output(){return -this.g.phi*this.geo.ratio/TAU;},
  draw(){const g=this.g,G=this.geo,P=cam3(o.yaw??-0.55,o.pitch??0.42,1,o.cx??400,o.cy??300),Sc=scene();
    const travel=g.phi*G.A.r;for(const b of G.pulleys)disk3(Sc,P,b.K,b.w||16,b.ang(g.phi),b.f||C['steel-fill']);
    for(const s of G.shafts)shaft3(Sc,P,s[0],s[1],s[2]||5,s[3]);belt3(Sc,P,G.belt,travel,6);Sc.draw();
    if(o.labels)o.labels(P,G);label(o.note,400,500,'center');},
  reads(v){return[['Shafts','at right angles'],['Speed ratio',`${this.geo.ratio.toFixed(2)} × driver`],['Driven',rpmOf(Math.abs(v))]];}});}
/* belt length helpers */
function pathPts(...segs){const o=[];for(const s of segs)for(const p of s){if(o.length&&v3.len(v3.sub(o[o.length-1],p))<1e-6)continue;o.push(p);}return o;}
function lenTo(pts,K){/* rope length from start to the point of pts nearest the middle of K's wrap is not needed: pulleys turn at belt speed / r */return 0;}

/* 4 · quarter-twist belt: B horizontal, level with the top of A, and tangent to A's plane; A's top lies in B's plane */
const QT=(R,rB,xB,side)=>()=>{const A=circ3([0,0,0],[1,0,0],[0,0,1],R);/* A in xz plane, angle measured from +x toward +z */
  const zB=R,B=circ3([xB,side*rB,zB],[1,0,0],[0,1,0],rB);/* horizontal */
  const sA=-1;/* A turns so its top moves toward +x */const top=A.at(PI/2);
  const sB=-side;/* wrap sense on B so the strand from A's top arrives tangentially */
  const t1=tanFromPoint(top,B,sB);const dep=Math.atan2(-side*rB,0)/* point of B lying in y=0 */,tdep=side>0?-PI/2:PI/2;
  const Pdep=B.at(tdep);const ta=tanFromPoint(Pdep,A,sA);
  const belt=pathPts([top],arc3(B,t1,tdep,sB),arc3(A,ta,PI/2,sA)).concat([top]);
  return{A,ratio:R/rB,belt,pulleys:[{K:A,w:18,ang:p=>-p,f:C['brass-fill']},{K:B,w:18,ang:p=>sB*p*R/rB,f:C['steel-fill']}],
    shafts:[[[0,-90,0],[0,60,0],6,C.part],[[xB,side*rB,zB-130],[xB,side*rB,zB+120],6,C.part]]};};
rightAngleBelt(4,{geo:QT(90,70,190,1),note:'QUARTER-TWIST BELT · each strand runs onto its pulley in that pulley’s own plane',yaw:-0.62,pitch:0.38,cx:330,cy:300});
rightAngleBelt(11,{geo:QT(70,95,170,-1),note:'ANOTHER QUARTER-TWIST LAYOUT · driven pulley larger and on the far side',yaw:-0.5,pitch:0.42,cx:330,cy:300});
/* 3 · with guide pulleys: A above, B horizontal below and set back; two guides turn the strands from vertical to horizontal */
rightAngleBelt(3,{note:'GUIDE PULLEYS TURN EACH STRAND INTO THE PLANE OF THE NEXT PULLEY',yaw:-0.75,pitch:0.36,cx:390,cy:200,geo:()=>{const R=80,rg=34,zg=-150,yB=170;
  const A=circ3([0,0,0],[1,0,0],[0,0,1],R);const G1=circ3([R,rg,zg],[0,0,1],[0,1,0],rg),G2=circ3([-R,rg,zg],[0,0,1],[0,1,0],rg);
  const zB=zg-rg,B=circ3([0,yB,zB],[1,0,0],[0,1,0],R);
  /* right strand goes down from A's right side, round G1 (angle 0 = up, PI/2 = +y), out along +y to B's right side, round B, back along -y to G2, up to A's left */
  const belt=pathPts([A.at(0)],arc3(G1,-PI/2,-PI,-1),arc3(B,0,PI,1),arc3(G2,PI,1.5*PI,1),arc3(A,PI,0,-1));
  return{A,ratio:1,belt,pulleys:[{K:A,w:18,ang:p=>-p,f:C['brass-fill']},{K:G1,w:12,ang:p=>-p*R/rg,f:C.part},{K:G2,w:12,ang:p=>p*R/rg,f:C.part},{K:B,w:18,ang:p=>p,f:C['steel-fill']}],
    shafts:[[[0,-80,0],[0,60,0],6,C.part],[[0,yB,zB-60],[0,yB,zB+90],6,C.part],[[R-30,rg,zg],[R+30,rg,zg],4,C.part2],[[-R-30,rg,zg],[-R+30,rg,zg],4,C.part2]]};}});
/* 243 · one horizontal shaft driving two upright shafts: both driven pulleys level with A's top; the second touches A's plane where the belt leaves for A */
rightAngleBelt(243,{note:'ONE HORIZONTAL SHAFT DRIVES TWO UPRIGHT SHAFTS WITH ONE BELT',yaw:-0.45,pitch:0.5,cx:250,cy:300,geo:()=>{const R=70,r=55;
  const A=circ3([0,0,0],[1,0,0],[0,0,1],R),B1=circ3([130,190,R],[1,0,0],[0,1,0],r),B2=circ3([300,r,R],[1,0,0],[0,1,0],r);
  const top=A.at(PI/2);const t1=tanFromPoint(top,B1,-1);
  const tl=tanLine({c:[B1.c[0],B1.c[1]],r,s:-1},{c:[B2.c[0],B2.c[1]],r,s:-1});
  const a1=Math.atan2(tl.p1[1]-B1.c[1],tl.p1[0]-B1.c[0]),a2=Math.atan2(tl.p2[1]-B2.c[1],tl.p2[0]-B2.c[0]);
  const tdep=-PI/2,Pd=B2.at(tdep),ta=tanFromPoint(Pd,A,-1);
  const belt=pathPts([top],arc3(B1,t1,a1,-1),arc3(B2,a2,tdep,-1),arc3(A,ta,PI/2,-1)).concat([top]);
  return{A,ratio:R/r,belt,pulleys:[{K:A,w:18,ang:p=>-p,f:C['brass-fill']},{K:B1,w:16,ang:p=>-p*R/r,f:C['steel-fill']},{K:B2,w:16,ang:p=>-p*R/r,f:C['steel-fill']}],
    shafts:[[[0,-90,0],[0,60,0],6,C.part],[[130,190,R-120],[130,190,R+110],6,C.part],[[300,r,R-120],[300,r,R+110],6,C.part]]};}});
