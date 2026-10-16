/* ================= audit pass · non-circular toothed gears (30, 33, 35, 38, 209) and fixes 25–50 ================= */
/* closed pitch curve from a local polar radius rf(s); arc-length table so teeth are spaced evenly along the curve */
const _ptc={};
function pitchCurve(rf,key,Z){if(key&&_ptc[key])return _ptc[key];const M=2400,P=[],A=[0];for(let i=0;i<M;i++){const s=i/M*TAU,r=rf(s);P.push([r*Math.cos(s),r*Math.sin(s)]);}
  for(let i=1;i<=M;i++){const a=P[i-1],b=P[i%M];A.push(A[i-1]+Math.hypot(b[0]-a[0],b[1]-a[1]));}
  const L=A[M],res={P,A,L,M,Z,p:L/Z,
    arcAt(s){const x=mod(s,TAU)/TAU*M,i=Math.floor(x);return A[i]+(A[i+1]-A[i])*(x-i);},
    at(a){a=mod(a,L);let lo=0,hi=M;while(hi-lo>1){const m=(lo+hi)>>1;if(A[m]<=a)lo=m;else hi=m;}const f=(a-A[lo])/((A[lo+1]-A[lo])||1),p0=P[lo],p1=P[(lo+1)%M];return[p0[0]+(p1[0]-p0[0])*f,p0[1]+(p1[1]-p0[1])*f,p1[0]-p0[0],p1[1]-p0[1]];}};
  if(key)_ptc[key]=res;return res;}
/* toothed outline (local): tooth centres at arc = phase + k·p */
function toothedCurve(pc,phase,o={}){const n=o.per||20,N=pc.Z*n,m=pc.p/PI,ad=m*(o.add??1),de=-m*(o.ded??1.2),out=[];
  for(let i=0;i<N;i++){const q=pc.at(phase+i/N*pc.L),tl=Math.hypot(q[2],q[3])||1,u=Math.abs(mod(i/n+0.5,1)-0.5);
    const h=u<0.15?ad:u>0.35?de:ad+(de-ad)*(u-0.15)/0.2;out.push([q[0]+q[3]/tl*h,q[1]-q[2]/tl*h]);}return out;}
/* draw a toothed non-circular gear turned by th (world = local + th) */
function ncGear(cx,cy,pc,phase,th,fill,o={}){const c=Math.cos(th),s=Math.sin(th),tr=([x,y])=>[cx+x*c-y*s,cy+x*s+y*c];
  poly(toothedCurve(pc,phase,o).map(tr));ctx.closePath();circ(cx,cy,o.bore||7,false);paint(fill,C.ink,1.1);
  ctx.save();ctx.setLineDash([3,4]);ctx.strokeStyle=C.muted;ctx.lineWidth=0.8;poly(pc.P.filter((_,i)=>i%8===0).map(tr));ctx.closePath();ctx.stroke();ctx.restore();
  if(o.mark!==false){const q=tr([pc.P[0][0]*0.55,pc.P[0][1]*0.55]);bar(cx,cy,q[0],q[1],5,C.part2);}pivot(cx,cy,5);}
/* gear pair helper: phases so a tooth of A meets a space of B at the contact point.
   sA, sB = local angles of the contact point on A and B at the reference pose */
function ncPhase(pcA,pcB,sA,sB){return pcA.arcAt(sA)+pcB.arcAt(sB)-pcB.p/2;}

/* 33 · two equal elliptical gears turning about their foci; foci 2a apart, so r1 + r2 = 2a at the contact point */
Object.assign(SIMS_NEW[33],{draw(){const g=this.g,e=this.P.e,a=this.a,rf=s=>a*(1-e*e)/(1+e*Math.cos(s));const pc=pitchCurve(rf,'e33_'+e,31);
  const F1=[310,262],F2=[310+2*a,262];ncGear(F1[0],F1[1],pc,0,g.phi,C['brass-fill']);ncGear(F2[0],F2[1],pc,ncPhase(pc,pc,0,PI),g.a2,C['steel-fill']);
  label('ELLIPTICAL GEARS · each turns about a focus; the foci are one major axis apart',400,470,'center');}});
/* 36 · Brown: a single row of teeth; the pinion works outside the row one way and inside it the other way, its shaft rising and falling in a slot */
{const m=SIMS_NEW[36];}
/* 45 · grooved friction gearing: add the enlarged cross-section Brown shows */
{const m=SIMS_NEW[45],d0=m.draw;m.draw=function(){d0.call(this);const x0=575,y0=330,w=170,n=5,pw=w/n,ym=y0+55,h=14;ctx.save();ctx.fillStyle=C.sheet;ctx.strokeStyle=C.muted;ctx.lineWidth=1;ctx.beginPath();ctx.rect(x0-10,y0,w+20,112);ctx.fill();ctx.stroke();ctx.restore();
  const zig=(sgn)=>{const pts=[];for(let k=0;k<=n;k++){const xa=x0+k*pw;pts.push([xa,ym+sgn*h/2]);if(k<n)pts.push([xa+pw/2,ym-sgn*h/2]);}return pts;};
  const lo=zig(1),up=zig(1).map(p=>[p[0],p[1]-2]);poly([...lo,[x0+w,y0+92],[x0,y0+92]]);ctx.closePath();paint(C['brass-fill'],C.ink,1);poly([...up,[x0+w,y0+14],[x0,y0+14]]);ctx.closePath();paint(C['steel-fill'],C.ink,1);
  label('SECTION · V ridges wedge into V grooves',x0+w/2,y0+106,'center');};}
/* 49 · Brown: a horizontal shaft rocked to and fro carries two loose bevel wheels, each with a pawl on an opposed ratchet fast on the shaft; both mesh one bevel on the vertical shaft, which turns continuously */
reg({num:49,outLabel:'Vertical shaft, turns',
  reset(){this.w=0;this.last=null;},
  update(phi){const a=0.55*Math.sin(phi);if(this.last===null)this.last=a;const d=a-this.last;this.last=a;this.w+=Math.abs(d);this.g={phi,a,d,w:this.w};},
  output(){return this.w/TAU;},
  draw(){const g=this.g,R=R3({yaw:-0.42,pitch:0.42,sc:1.05,cx:400,cy:255}),Z=20,Rp=60,dd=PI/4,bL=g.w,bR=-g.w;
    rod3(R,[-260,0,0],[260,0,0],8,C.part);
    bevel3(R,[0,0,0],[-1,0,0],[0,0,1],Rp,Z,dd,30,bL,C['steel-fill'],{boss:12});bevel3(R,[0,0,0],[1,0,0],[0,0,1],Rp,Z,dd,30,bR+PI/Z,C['steel-fill'],{boss:12});
    bevel3(R,[0,0,0],[0,0,1],[1,0,0],Rp,Z,dd,30,-g.w+PI/Z,C['brass-fill'],{boss:10});rod3(R,[0,0,72],[0,0,210],8,C.part);
    const saw=(sgn)=>{const pts=[];const n=14;for(let k=0;k<n;k++){const t0=k*TAU/n,t1=(k+1)*TAU/n;pts.push([46*Math.cos(t0),46*Math.sin(t0)],[56*Math.cos(t1-0.02),56*Math.sin(t1-0.02)]);}return sgn>0?pts:pts.map(p=>[p[0],-p[1]]).reverse();};
    for(const s of [-1,1]){const x=s*90;const F=fr3([x,0,0],[0,Math.cos(g.a),Math.sin(g.a)],[0,-Math.sin(g.a),Math.cos(g.a)]);prism3(R,F,saw(s),-6,6,C['brass-fill'],{edge:true});
      const b=s<0?bL:bR+PI/Z,pd=[0,Math.cos(b+0.6),Math.sin(b+0.6)];block3(R,v3.add([s*76,0,0],v3.mul(pd,52)),[0,-pd[2],pd[1]],[1,0,0],22,8,8,C.part2);}
    const hand=[-250,0,0],ha=g.a;block3(R,v3.add(hand,[0,-Math.sin(ha)*50,Math.cos(ha)*50]),[0,-Math.sin(ha),Math.cos(ha)],[1,0,0],100,14,10,C['brass-fill']);
    R.draw();label('ROCKED TO AND FRO',95,135);label('VERTICAL SHAFT · turns one way, both strokes',470,60);label('TWO LOOSE BEVELS, OPPOSED RATCHETS',400,480,'center');},
  reads(){const g=this.g;return[['Input','rocks to and fro'],['Driving now',g.d>0?'left bevel (its pawl grips)':g.d<0?'right bevel (its pawl grips)':'—'],['Vertical shaft',`${(this.w/TAU).toFixed(2)} turns, one way`]];}});
/* 37 · Brown: a bevel pinion whose teeth run the whole width of its face drives studs set spirally on the wheel; the pinion stays put, the studs meet it at a changing radius */
Object.assign(SIMS_NEW[37],{draw(){const g=this.g,O=[330,265];circ(O[0],O[1],185);paint(C['brass-fill'],C.ink);
  for(let i=0;i<=60;i++){const m=i/60*TAU,r=this.r(m),t=m+this.w;circ(O[0]+r*Math.cos(t),O[1]+r*Math.sin(t),5);paint(C.part,C.ink,1);}pivot(O[0],O[1],6);
  const x0=O[0]+50,x1=O[0]+180;ctx.beginPath();ctx.rect(x0,O[1]-16,x1-x0,32);paint(C['steel-fill'],C.ink);ctx.save();ctx.beginPath();ctx.rect(x0,O[1]-16,x1-x0,32);ctx.clip();ctx.strokeStyle=C.ink;ctx.lineWidth=1;
  for(let k=0;k<10;k++){const a=-g.phi+k*TAU/10,s=Math.sin(a);if(Math.cos(a)<0)continue;ctx.beginPath();ctx.moveTo(x0,O[1]+16*s);ctx.lineTo(x1,O[1]+16*s);ctx.stroke();}ctx.restore();
  bar(x1,O[1],760,O[1],10,C.part);circ(O[0]+g.r,O[1],8);paint(null,C.hi,2.2);label('LONG-TOOTHED PINION · stays put; the studs meet it nearer or farther out',400,480,'center');}});
/* 46 · elevation with both axes upright: the chain leaves the fusee at a small radius while the spring is strong and at a large radius as it weakens */
Object.assign(SIMS_NEW[46],{draw(){const g=this.g,B=[230,265],Rb=72,F=[560,265],y0=150,y1=380,rt=22,rb=70,yc=y0+(y1-y0)*g.p,rc=rt+(rb-rt)*g.p;
  ctx.beginPath();ctx.rect(B[0]-Rb,B[1]-60,2*Rb,120);paint(C['brass-fill'],C.ink);ctx.beginPath();ctx.rect(B[0]-Rb-6,B[1]-66,2*Rb+12,8);ctx.rect(B[0]-Rb-6,B[1]+58,2*Rb+12,8);paint(C.part,C.ink);
  const nb=Math.round(g.p*10);ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=2;for(let k=0;k<nb;k++){const y=B[1]-52+k*10.5;ctx.beginPath();ctx.moveTo(B[0]-Rb,y);ctx.lineTo(B[0]+Rb,y+3);ctx.stroke();}ctx.restore();
  bar(B[0],B[1]-110,B[0],B[1]+110,10,C.part);
  poly([[F[0]-rt,y0],[F[0]+rt,y0],[F[0]+rb,y1],[F[0]-rb,y1]]);ctx.closePath();paint(C['steel-fill'],C.ink);
  ctx.save();ctx.strokeStyle=C.ink;for(let y=y0+6;y<y1;y+=9){const r=rt+(rb-rt)*(y-y0)/(y1-y0);ctx.lineWidth=y>yc?2.2:0.6;ctx.globalAlpha=y>yc?1:0.5;ctx.beginPath();ctx.moveTo(F[0]-r,y);ctx.lineTo(F[0]+r,y+3);ctx.stroke();}ctx.restore();
  bar(F[0],y0-50,F[0],y1+40,10,C.part);rope([[B[0]+Rb,yc],[F[0]-rc,yc]]);circ(F[0]-rc,yc,4);paint(C.hi,C.ink);
  label('BARREL · mainspring inside',B[0],B[1]+150,'center');label('FUSEE',F[0],y1+70,'center');label('CHAIN',(B[0]+Rb+F[0]-rc)/2,yc-12,'center');}});
