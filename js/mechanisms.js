(function(){
const TAU=Math.PI*2,PI=Math.PI,W=800,H=520;const mod=(a,n)=>((a%n)+n)%n;
const C={};let ctx=null;let DIR=1;function speedSign(){return DIR;}
/* ---------- drawing helpers ---------- */
function poly(pts,begin=true){if(begin)ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i][0],pts[i][1]);}
function paint(fill,stroke,lw=1.3){if(fill){ctx.fillStyle=fill;ctx.fill('evenodd');}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke();}}
function circ(x,y,r,begin=true){if(begin)ctx.beginPath();ctx.moveTo(x+r,y);ctx.arc(x,y,r,0,TAU);}
function pivot(x,y,r=5.5){circ(x,y,r);paint(C.hi,C.ink,1.3);circ(x,y,1.7);paint(C.ink);}
function capsule(x1,y1,x2,y2,r){const a=Math.atan2(y2-y1,x2-x1);ctx.moveTo(x1+r*Math.cos(a+PI/2),y1+r*Math.sin(a+PI/2));ctx.arc(x1,y1,r,a+PI/2,a+3*PI/2);ctx.arc(x2,y2,r,a-PI/2,a+PI/2);ctx.closePath();}
function bar(x1,y1,x2,y2,w,fill){ctx.beginPath();capsule(x1,y1,x2,y2,w/2);paint(fill,C.ink);}
function ground(x,y,w=36,up=false){ctx.save();ctx.strokeStyle=C.muted;ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(x-w/2,y);ctx.lineTo(x+w/2,y);ctx.stroke();const s=up?-1:1;for(let i=0;i<6;i++){const xx=x-w/2+i*w/5+3;ctx.beginPath();ctx.moveTo(xx,y);ctx.lineTo(xx-6,y+7*s);ctx.stroke();}ctx.restore();}
function label(t,x,y,align='left'){ctx.save();ctx.font='500 11px -apple-system, BlinkMacSystemFont, "SF Pro Text", Inter, "Helvetica Neue", Arial, sans-serif';ctx.fillStyle=C.muted;ctx.textAlign=align;ctx.textBaseline='middle';ctx.fillText(t,x,y);ctx.restore();}
function leader(x1,y1,x2,y2){ctx.save();ctx.strokeStyle=C.muted;ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();circ(x2,y2,1.8);ctx.fillStyle=C.muted;ctx.fill();ctx.restore();}
function callout(t,tx,ty,px,py,align='left'){leader(tx+(align==='left'?-4:4),ty,px,py);label(t,tx,ty,align);}
function pitchArc(cx,cy,r,a0=0,a1=TAU){ctx.save();ctx.setLineDash([10,3,2,3]);ctx.strokeStyle=C.muted;ctx.globalAlpha=.6;ctx.lineWidth=.7;ctx.beginPath();ctx.arc(cx,cy,r,a0,a1);ctx.stroke();ctx.restore();}
function arcArrow(cx,cy,r,a0,a1,col){ctx.save();ctx.strokeStyle=col;ctx.fillStyle=col;ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(cx,cy,r,a0,a1,a1<a0);ctx.stroke();const s=Math.sign(a1-a0),x=cx+r*Math.cos(a1),y=cy+r*Math.sin(a1),tx=-Math.sin(a1)*s,ty=Math.cos(a1)*s;ctx.beginPath();ctx.moveTo(x+tx*8,y+ty*8);ctx.lineTo(x+Math.cos(a1)*4,y+Math.sin(a1)*4);ctx.lineTo(x-Math.cos(a1)*4,y-Math.sin(a1)*4);ctx.closePath();ctx.fill();ctx.restore();}
function linArrow(x,y,len,col){if(Math.abs(len)<3)return;ctx.save();ctx.strokeStyle=col;ctx.fillStyle=col;ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+len,y);ctx.stroke();const s=Math.sign(len);ctx.beginPath();ctx.moveTo(x+len+8*s,y);ctx.lineTo(x+len,y-4);ctx.lineTo(x+len,y+4);ctx.closePath();ctx.fill();ctx.restore();}

const PROF=[[-0.5,0],[-0.27,0],[-0.12,1],[0.12,1],[0.27,0]];
/* involute tooth flank table, cached per tooth count: [[r/R, half-angle·N/τ]...] tip to root */
const _flank={};
function flankOf(N,internal){const k=N+(internal?'i':'');if(_flank[k])return _flank[k];const R=1,m=2/N,pa=20*PI/180,rb=Math.cos(pa),inv=a=>Math.tan(a)-a,ip=inv(pa);
  const ra=internal?R+1.25*m:R+m,rr=internal?R-m:R-1.25*m,half=PI/(2*N)*(internal?1.04:0.96);const r0=Math.max(rb,rr),o=[];
  for(let i=0;i<=5;i++){const r=r0+(ra-r0)*i/5;o.push([r,half+ip-inv(Math.acos(Math.min(1,rb/r)))]);}
  if(rr<r0-1e-6)o.unshift([rr,o[0][1]]);return _flank[k]={o,rr,ra};}
function gearPts(cx,cy,r,N,ang,internal,a0,a1){
  const tau=TAU/N,F=flankOf(N,internal),pts=[];
  let i0=0,i1=N-1;
  if(a0!=null){i0=Math.ceil((a0-ang)/tau);i1=Math.floor((a1-ang)/tau);}
  const P=(rad,a)=>pts.push([cx+rad*r*Math.cos(a),cy+rad*r*Math.sin(a)]);
  if(!internal){for(let i=i0;i<=i1;i++){const c=ang+i*tau;for(let j=0;j<F.o.length;j++)P(F.o[j][0],c-F.o[j][1]);for(let j=F.o.length-1;j>=0;j--)P(F.o[j][0],c+F.o[j][1]);}}
  else{/* internal: material tooth points inward; the space between teeth is an involute "tooth" outward */
    for(let i=i0;i<=i1;i++){const c=ang+i*tau,s=c+tau/2;/* tooth centre c (inner tip at r-m) */
      P(F.rr,c);/* inner tip centre */
      for(let j=0;j<F.o.length;j++)P(F.o[j][0],s-F.o[j][1]);for(let j=F.o.length-1;j>=0;j--)P(F.o[j][0],s+F.o[j][1]);}}
  if(a0!=null){const a=ang+(i1+0.5)*tau;pts.push([cx+F.rr*r*Math.cos(a),cy+F.rr*r*Math.sin(a)]);}
  return pts;
}
function drawGear(cx,cy,r,N,ang,fill,o={}){
  const m=2*r/N,root=r-1.25*m,bore=o.bore??Math.max(5,r*.12);
  poly(gearPts(cx,cy,r,N,ang,false));ctx.closePath();
  circ(cx,cy,bore,false);
  if(root>46){const hub=bore+10,rr=(root+hub)/2,hr=(root-hub)*.3,n=root>90?6:4;
    for(let i=0;i<n;i++){const a=ang+(i+.5)*TAU/n;circ(cx+rr*Math.cos(a),cy+rr*Math.sin(a),hr,false);}}
  paint(fill,C.ink);
  pitchArc(cx,cy,r);
}

/* ---------- 119 Endless rack ---------- */
function stad(s,L,R){const P=4*L+TAU*R;s=mod(s,P);
  if(s<2*L)return{x:-L+s,y:-R,nx:0,ny:-1};
  s-=2*L;if(s<PI*R){const a=-PI/2+s/R;return{x:L+R*Math.cos(a),y:R*Math.sin(a),nx:Math.cos(a),ny:Math.sin(a)};}
  s-=PI*R;if(s<2*L)return{x:L-s,y:R,nx:0,ny:1};
  s-=2*L;const a=PI/2+s/R;return{x:-L+R*Math.cos(a),y:R*Math.sin(a),nx:Math.cos(a),ny:Math.sin(a)};}

const M119={num:119,name:'Endless rack',sub:'Pinion and oblong rack',
  desc:'A pinion turning at a steady rate drives an oblong rack frame back and forth. The rack’s teeth run all the way round the inside of the frame. The pinion meshes with the upper run, rolls round the curved end, then meshes with the lower run, which sends the rack the other way. Its shaft rises and falls in a fixed slotted guide while this happens.',
  watch:'The rack moves at constant speed along the straight runs and eases through each reversal as the pinion rounds an end. A longer run lengthens the stroke without changing the speed.',
  outLabel:'Rack position, mm',
  params:[{id:'run',label:'Straight run',min:8,max:28,step:4,value:20,fmt:v=>`${v/2} teeth`}],
  r:30,N:12,R:80,X0:400,Y0:262,
  reset(){},
  update(phi){const r=this.r,R=this.R,h=R-r,p=TAU*r/this.N,L=this.P.run*p/4,Pc=4*L+TAU*h,u=mod(r*phi,Pc);let s,seg;
    if(u<2*L){s=u;seg='upper run';}
    else if(u<2*L+PI*h){s=2*L+(u-2*L)*R/h;seg='rounding right end';}
    else if(u<4*L+PI*h){s=2*L+PI*R+(u-2*L-PI*h);seg='lower run';}
    else{s=4*L+PI*R+(u-4*L-PI*h)*R/h;seg='rounding left end';}
    const q=stad(s,L,R);this.g={L,h,p,cx:q.x-r*q.nx,cy:q.y-r*q.ny,seg,ang:-phi,phi};},
  output(){return -this.g.cx;},
  draw(){const g=this.g,{L,p,h}=g,R=this.R,m=2*this.r/this.N,X=this.X0-g.cx,Y=this.Y0,X0=this.X0;
    const outR=1.25*m+18,half=L+R+outR;
    // slotted guide (fixed, behind)
    ctx.beginPath();ctx.rect(X0-18,Y-h-58,36,2*h+116);capsule(X0,Y-h,X0,Y+h,8.5);paint(C.part,C.ink);
    ground(X0,Y+h+58,48);
    // carrier bar
    bar(X-half-330,Y,X-half+6,Y,16,C['steel-fill']);bar(X+half-6,Y,X+half+330,Y,16,C['steel-fill']);
    // rack frame
    ctx.save();ctx.translate(X,Y);ctx.beginPath();
    const P=4*L+TAU*R;let first=true;
    for(let i=0;i<=220;i++){const q=stad(P*i/220,L,R);const x=q.x+q.nx*outR,y=q.y+q.ny*outR;first?ctx.moveTo(x,y):ctx.lineTo(x,y);first=false;}
    ctx.closePath();
    const n=Math.round(P/p),pr=[[-0.5,1.25],[-0.27,1.25],[-0.12,-1],[0.12,-1],[0.27,1.25]];first=true;
    for(let k=0;k<n;k++){for(const [f,d] of pr){const q=stad(k*p+f*p,L,R);const x=q.x+q.nx*d*m,y=q.y+q.ny*d*m;first?ctx.moveTo(x,y):ctx.lineTo(x,y);first=false;}}
    ctx.closePath();paint(C['steel-fill'],C.ink);
    ctx.save();ctx.setLineDash([10,3,2,3]);ctx.strokeStyle=C.muted;ctx.globalAlpha=.6;ctx.lineWidth=.7;ctx.beginPath();
    for(let i=0;i<=200;i++){const q=stad(P*i/200,L,R);i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y);}ctx.stroke();ctx.restore();
    ctx.restore();
    // fixed guides for bar
    for(const gx of [44,756]){ctx.beginPath();ctx.rect(gx-22,Y-22,44,12);ctx.rect(gx-22,Y+10,44,12);paint(C.part,C.ink);ground(gx,Y+22,44);}
    // pinion
    const py=Y+g.cy;drawGear(X0,py,this.r,this.N,g.ang-PI/2+PI/this.N,C['brass-fill'],{bore:6});pivot(X0,py,5);
    callout('PINION · steady drive',560,Y-150,X0+18,py-20);
    callout('SLOTTED GUIDE (fixed)',560,Y+150,X0+16,Y+h+40);
    callout('ENDLESS RACK',200,Y-150,X-L*0.4,Y-R-outR+4,'right');
    linArrow(X,Y+R+outR+26,0,C.steel);
  },
  reads(v){const g=this.g;return[['Pinion angle',`${mod(g.phi*180/PI,360).toFixed(0)}°`],['Pinion meshing',g.seg],['Rack position',`${(-g.cx).toFixed(1)} mm`],['Rack speed',`${v.toFixed(0)} mm/s`],['Full stroke',`${(2*(g.L+g.h)).toFixed(0)} mm`]];}
};

/* ---------- 120 Segment jaws ---------- */
const M120={num:120,name:'Segment-gear jaws',sub:'Two pinions, one shaft',
  desc:'Each jaw is fixed to a toothed segment. One segment has teeth on its outside edge, the other on its inside edge, and both swing about the same pivot. One shaft carries two pinions, one meshing with each segment. Because one mesh is external and the other internal, turning the shaft swings the segments in opposite directions and the jaws close with a large reduction.',
  watch:'Both pinions turn the same way, yet the segments turn opposite ways. The small, fast shaft swing becomes a slow, strong closing of the jaws.',
  outLabel:'Jaw opening, degrees',
  params:[{id:'swing',label:'Shaft swing',min:20,max:52,step:1,value:48,fmt:v=>`${v}°`}],
  O:{x:400,y:338},m:7.5,r1:37.5,N1:10,R1:75,Nf1:20,r2:45,N2:12,R2:157.5,Nf2:42,a0:22*PI/180,
  reset(){},
  update(phi){const th=this.P.swing*PI/180*(1-Math.cos(phi))/2;const p1=-th*this.r1/this.R1,p2=th*this.r2/this.R2;
    this.g={th,p1,p2,aL:PI/2+this.a0+p1,aR:PI/2-this.a0+p2,closing:Math.sin(phi)>0};},
  output(){return (this.g.aL-this.g.aR)*180/PI;},
  jaw(a,s,fill){const O=this.O;ctx.save();ctx.translate(O.x,O.y);ctx.rotate(a);ctx.scale(0.76,1);
    const w=x=>15-9*Math.max(0,x)/210;const pts=[];
    for(let x=-26;x<=210;x+=8)pts.push([x,-s*w(x)]);pts.push([222,0]);
    for(let x=210;x>=-26;x-=4){const z=x>118&&x<206&&(Math.round(x/4)%2)?3.2:0;pts.push([x,s*(w(x)+z)]);}
    poly(pts);ctx.closePath();paint(fill,C.ink);circ(0,0,22);paint(fill,C.ink);ctx.restore();},
  draw(){const g=this.g,O=this.O,d=this.R1+this.r1,S={x:O.x,y:O.y-d},m=this.m;
    // back plane: inside-toothed segment + pinion 2 + right jaw
    const t2=TAU/this.Nf2,ang2=-PI/2+t2/2+g.p2,sp=0.5;
    const ip=gearPts(O.x,O.y,this.R2,this.Nf2,ang2,true,-PI/2-sp+g.p2,-PI/2+sp+g.p2);
    const aS=Math.atan2(ip[0][1]-O.y,ip[0][0]-O.x),aE=Math.atan2(ip[ip.length-1][1]-O.y,ip[ip.length-1][0]-O.x),Ro=this.R2+1.25*m+16;
    for(const a of [aS,aE])bar(O.x,O.y,O.x+(this.R2+6)*Math.cos(a),O.y+(this.R2+6)*Math.sin(a),16,C.part2);
    this.jaw(g.aR,1,C.part2);
    poly(ip);ctx.arc(O.x,O.y,Ro,aE,aS,true);ctx.closePath();paint(C.part2,C.ink);
    pitchArc(O.x,O.y,this.R2,aS,aE);
    drawGear(S.x,S.y,this.r2,this.N2,-PI/2+g.th,C['brass-fill'],{bore:7});
    // front plane
    const t1=TAU/this.Nf1,ang1=-PI/2+t1/2+g.p1;
    const op=gearPts(O.x,O.y,this.R1,this.Nf1,ang1,false,-PI/2-0.78+g.p1,-PI/2+0.78+g.p1);
    this.jaw(g.aL,-1,C.part);
    ctx.beginPath();ctx.moveTo(O.x,O.y);poly(op,false);ctx.lineTo(op[0][0],op[0][1]);ctx.closePath();
    ctx.moveTo(O.x,O.y);ctx.closePath();
    ctx.beginPath();ctx.moveTo(O.x,O.y);for(const pt of op)ctx.lineTo(pt[0],pt[1]);ctx.closePath();paint(C.part,C.ink);
    circ(O.x,O.y,24);paint(C.part,C.ink);
    drawGear(S.x,S.y,this.r1,this.N1,PI/2+g.th,C['brass-fill'],{bore:7});
    pivot(S.x,S.y,6);pivot(O.x,O.y,7);
    arcArrow(S.x,S.y,this.r1+18,PI*1.15,PI*1.6,C.brass);
    // jaw tips gap marker
    callout('SHAFT · two pinions',600,150,S.x+30,S.y-30);
    callout('SEGMENT, inside teeth',600,108,O.x+(Ro-6)*Math.cos(aE-0.05),O.y+(Ro-6)*Math.sin(aE-0.05));
    callout('SEGMENT, outside teeth',200,212,O.x-50,O.y-62,'right');
    callout('JAWS',200,452,O.x-50,O.y+125,'right');
  },
  reads(v){const g=this.g,ratio=1/(this.r1/this.R1+this.r2/this.R2);return[['Shaft angle',`${(g.th*180/PI).toFixed(1)}°`],['Jaw opening',`${this.output().toFixed(1)}°`],['Segment turns',`−${(g.th*this.r1/this.R1*180/PI).toFixed(1)}° / +${(g.th*this.r2/this.R2*180/PI).toFixed(1)}°`],['Shaft : closing',`${ratio.toFixed(2)} : 1`],['Jaws are',Math.abs(v)<0.05?'holding':v<0?'closing':'opening']];}
};

/* ---------- 121 Pawl feed ---------- */
const DEG=PI/180;
const M121={num:121,name:'Reversible pawl feed',sub:'Rocking disk and feed wheel',
  desc:'A crank and rod rock a disk back and forth on the same axis as a toothed feed wheel. A pawl pivoted on the disk pushes the wheel round on one stroke and slides back over the teeth on the return, so the wheel advances in steps. Flipping the pawl reverses the feed. Brown gives this as the feed of planing machines and similar tools.',
  watch:'The crank throw sets how many teeth pass per stroke. Below about 13 mm the pawl never clears a tooth and the feed stops. Turn the crank backwards and the wheel still feeds the same way.',
  outLabel:'Feed wheel angle, degrees',
  params:[{id:'feed',label:'Crank throw',min:10,max:46,step:1,value:32,fmt:v=>`${v} mm`},
          {id:'pawl',type:'toggle',label:'Pawl set to feed',options:[[1,'Clockwise'],[-1,'Anticlockwise']],value:1}],
  C:{x:540,y:268},K:{x:380,y:448},l:180,rd:150,N:24,rt:120,rr:100,
  get p(){return TAU/this.N},TH:2*DEG,FL:4*DEG,
  get E(){return this.TH+this.FL-0.4*DEG},
  solve(phi){const K=this.K,rc=this.P.feed,Px=K.x+rc*Math.cos(phi),Py=K.y+rc*Math.sin(phi),c=this.C,r0=this.rd,r1=this.l;
    const dx=Px-c.x,dy=Py-c.y,dd=Math.hypot(dx,dy),a=(r0*r0-r1*r1+dd*dd)/(2*dd),hh=Math.sqrt(Math.max(0,r0*r0-a*a));
    const bx=c.x+a*dx/dd,by=c.y+a*dy/dd,ox=-dy/dd*hh,oy=dx/dd*hh;const q1=[bx+ox,by+oy],q2=[bx-ox,by-oy],Q=q1[0]<q2[0]?q1:q2;
    const psi=mod(Math.atan2(Q[1]-c.y,Q[0]-c.x)-PI+PI,TAU)-PI;return{psi,P:[Px,Py],Q};},
  reset(){const s=this.solve(0),tip=s.psi-PI/2;this.d=this.P.pawl;this.thr=tip-this.d*this.p/2;this.thr0=this.thr;
    this.lastQ=this.d*(tip-this.thr);this.limit=Math.ceil((this.lastQ+this.E)/this.p)*this.p-this.E;
    this.turn=0;this.mark=this.thr;this.perStroke=null;this.update(0);},
  onParam(id){if(id==='pawl'){this.d=this.P.pawl;const tip=this.g.psi-PI/2;this.lastQ=this.d*(tip-this.thr);this.limit=Math.ceil((this.lastQ+this.E)/this.p)*this.p-this.E;this.mark=this.thr;this.perStroke=null;}
    if(id==='feed'){this.perStroke=null;this.mark=this.thr;}},
  update(phi){const s=this.solve(phi),tip=s.psi-PI/2;let q=this.d*(tip-this.thr);
    if(q>this.lastQ){if(q>this.limit){this.thr+=this.d*(q-this.limit);q=this.limit;}}
    else{this.limit=Math.ceil((q+this.E)/this.p)*this.p-this.E;}
    this.lastQ=q;
    const turn=Math.floor(phi/TAU);if(this.turn!==undefined&&turn!==this.turn){this.perStroke=Math.round(Math.abs(this.thr-this.mark)/this.p);this.mark=this.thr;}this.turn=turn;
    this.g={...s,phi,tip};
    if(this.swingFor!==this.P.feed){let lo=1e9,hi=-1e9;for(let i=0;i<64;i++){const v=this.solve(i/64*TAU).psi;lo=Math.min(lo,v);hi=Math.max(hi,v);}this.swing=hi-lo;this.swingFor=this.P.feed;}},
  output(){return (this.thr-this.thr0)*180/PI;},
  profR(rel){const p=this.p,x=mod(rel,p),dd=Math.min(x,p-x);if(dd<this.TH)return this.rt;if(dd<this.TH+this.FL)return this.rt-(this.rt-this.rr)*(dd-this.TH)/this.FL;return this.rr;},
  draw(){const g=this.g,c=this.C,K=this.K,psi=g.psi;
    // crank (driver)
    ground(K.x,K.y+58,60);ctx.beginPath();ctx.rect(K.x-8,K.y+10,16,48);paint(C.part,C.ink);
    circ(K.x,K.y,52);ctx.save();ctx.translate(K.x,K.y);ctx.rotate(g.phi);capsule(-42,0,42,0,6);ctx.restore();paint(C['brass-fill'],C.ink);
    // rocking disk
    circ(c.x,c.y,170);circ(c.x+this.rd*Math.cos(psi+PI),c.y+this.rd*Math.sin(psi+PI),0.01,false);paint(C.part,C.ink);
    for(let i=0;i<3;i++){const a=psi+PI/2+i*TAU/3;circ(c.x+140*Math.cos(a),c.y+140*Math.sin(a),5);paint(C.part2,C.ink,1);}
    // feed wheel
    ctx.beginPath();const n=this.N,pts=[];
    for(let i=0;i<=n*24;i++){const rel=i/(n*24)*TAU;const R=this.profR(rel);const a=this.thr+rel;pts.push([c.x+R*Math.cos(a),c.y+R*Math.sin(a)]);}
    poly(pts);ctx.closePath();circ(c.x,c.y,14,false);
    for(let i=0;i<5;i++){const a=this.thr+i*TAU/5;circ(c.x+60*Math.cos(a),c.y+60*Math.sin(a),17,false);}
    paint(C['steel-fill'],C.ink);
    // pawl
    const d=this.d,base=psi-PI/2,rel=g.tip-this.thr,rtip=this.profR(rel)+3;
    const Pv=[c.x+150*Math.cos(base-d*0.30),c.y+150*Math.sin(base-d*0.30)];
    const T=[c.x+rtip*Math.cos(base),c.y+rtip*Math.sin(base)];
    const E=[c.x+136*Math.cos(base-d*0.62),c.y+136*Math.sin(base-d*0.62)];
    ctx.beginPath();capsule(T[0],T[1],Pv[0],Pv[1],7);capsule(Pv[0],Pv[1],E[0],E[1],7);paint(C.part2,C.ink);
    ctx.beginPath();ctx.moveTo(Pv[0],Pv[1]);const sp=[c.x+184*Math.cos(base-d*0.12),c.y+184*Math.sin(base-d*0.12)];
    ctx.save();ctx.strokeStyle=C.muted;ctx.lineWidth=1;ctx.beginPath();for(let i=0;i<=10;i++){const t=i/10,x=Pv[0]+(sp[0]-Pv[0])*t,y=Pv[1]+(sp[1]-Pv[1])*t,o=(i%2?4:-4)*(i&&i<10);i?ctx.lineTo(x+o,y-o):ctx.moveTo(x,y);}ctx.stroke();ctx.restore();
    pivot(Pv[0],Pv[1],5);
    // rod
    bar(g.P[0],g.P[1],g.Q[0],g.Q[1],12,C.part2);pivot(g.P[0],g.P[1],5);pivot(g.Q[0],g.Q[1],5);pivot(K.x,K.y,6);pivot(c.x,c.y,7);
    arcArrow(c.x,c.y,192,-PI/2-0.25*d,-PI/2+0.25*d,C.steel);
    callout('CRANK · adjustable throw',220,478,K.x-40,K.y+20,'right');
    callout('ROD',220,350,(g.P[0]+g.Q[0])/2-4,(g.P[1]+g.Q[1])/2,'right');
    callout('REVERSIBLE PAWL',300,66,Pv[0]-6,Pv[1]-8,'right');
    callout('FEED WHEEL',760,470,c.x+70,c.y+70,'right');
    callout('ROCKING DISK',760,60,c.x+110,c.y-126,'right');
  },
  reads(){const dir=this.d>0?'clockwise':'anticlockwise';return[['Crank angle',`${mod(this.g.phi*180/PI,360).toFixed(0)}°`],['Disk swing',`${(this.swing*180/PI).toFixed(1)}°`],['Tooth pitch','15.0°'],['Teeth per stroke',this.perStroke==null?'measuring…':`${this.perStroke} (${dir})`],['Wheel total',`${this.output().toFixed(0)}°`]];}
};

/* ---------- 122 Twin crank-wrist traverse ---------- */
const NBS=[30,36,40,48];
const gcd=(a,b)=>b?gcd(b,a%b):a;
const M122={num:122,name:'Twin crank-wrist traverse',sub:'Two gears, one bar',
  desc:'Two meshing spur gears each carry a crank wrist. With different tooth counts, the wrists drift in and out of step, so the horizontal bar they drive travels back and forth with a stroke that keeps changing. Brown states only the principle; here the wrists are joined by a slotted lever that drives the bar, which is one way to build it.',
  watch:'Watch the trace: long and short strokes alternate in a pattern that repeats only when both gears come back to the same relative position.',
  outLabel:'Bar position, mm',
  params:[{id:'nb',label:'Right gear teeth (left has 24)',min:0,max:3,step:1,value:1,fmt:v=>`${NBS[v]} teeth`},
          {id:'s',label:'Bar link point on lever',min:70,max:150,step:5,value:110,fmt:v=>`${v} mm`}],
  A:{x:210,y:332},rA:72,NA:24,pa:50,
  reset(){this.lastX=null;this.lastV=0;this.ext=null;this.stroke=null;},
  onParam(){this.reset();},
  update(phi){const NB=NBS[this.P.nb],rB=3*NB,A=this.A,B={x:A.x+this.rA+rB,y:A.y},pb=0.6*rB,fB=-phi*this.NA/NB;
    const pA=[A.x+this.pa*Math.cos(phi),A.y+this.pa*Math.sin(phi)],pB=[B.x+pb*Math.cos(fB+PI/2),B.y+pb*Math.sin(fB+PI/2)];
    const be=Math.atan2(pB[1]-pA[1],pB[0]-pA[0]),s=this.P.s,Lp=[pA[0]+s*Math.cos(be),pA[1]+s*Math.sin(be)];
    this.g={NB,rB,B,pb,fB,pA,pB,be,Lp,phi,x:Lp[0]-(A.x+s)};
    const x=this.g.x;if(this.lastX!=null){const v=x-this.lastX;if(Math.abs(v)>1e-4){const sg=Math.sign(v);if(this.lastV&&sg!==this.lastV){if(this.ext!=null)this.stroke=Math.abs(this.lastX-this.ext);this.ext=this.lastX;}this.lastV=sg;}}this.lastX=x;},
  output(){return this.g.x;},
  draw(){const g=this.g,A=this.A,B=g.B,m=6,by=82;
    drawGear(B.x,B.y,g.rB,g.NB,g.fB+PI+PI/g.NB,C.part,{bore:8});
    drawGear(A.x,A.y,this.rA,this.NA,g.phi,C['brass-fill'],{bore:8});
    pivot(A.x,A.y,6);pivot(B.x,B.y,6);
    // drop arm with vertical slot (output)
    const xb=g.Lp[0];ctx.save();ctx.globalAlpha=.92;ctx.beginPath();capsule(xb,by,xb,452,13);capsule(xb,150,xb,440,6);paint(C['steel-fill'],C.ink);ctx.restore();
    // lever with slot
    const cd=this.rA+g.rB,lo=Math.max(26,cd-this.pa-g.pb-12),hi=cd+this.pa+g.pb+12,c=Math.cos(g.be),s=Math.sin(g.be);
    const dAB=Math.hypot(g.pB[0]-g.pA[0],g.pB[1]-g.pA[1]);const end=Math.max(dAB+28,this.P.s+20);
    ctx.beginPath();capsule(g.pA[0]-c*14,g.pA[1]-s*14,g.pA[0]+c*end,g.pA[1]+s*end,11);
    capsule(g.pA[0]+c*Math.max(lo,this.P.s+16),g.pA[1]+s*Math.max(lo,this.P.s+16),g.pA[0]+c*Math.min(hi,end-6),g.pA[1]+s*Math.min(hi,end-6),5);
    paint(C.part2,C.ink);
    // slide block on wrist B
    ctx.save();ctx.translate(g.pB[0],g.pB[1]);ctx.rotate(g.be);ctx.beginPath();ctx.rect(-15,-7,30,14);paint(C.part,C.ink);ctx.restore();
    // block in arm slot
    ctx.beginPath();ctx.rect(xb-7,g.Lp[1]-13,14,26);paint(C['steel-fill'],C.ink);
    pivot(g.pA[0],g.pA[1],5);pivot(g.pB[0],g.pB[1],5);pivot(g.Lp[0],g.Lp[1],4.5);
    // bar
    ctx.beginPath();ctx.rect(xb-330,by-10,660,20);paint(C['steel-fill'],C.ink);
    for(const gx of [40,760]){ctx.beginPath();ctx.rect(gx-24,by-22,48,10);ctx.rect(gx-24,by+12,48,10);paint(C.part,C.ink);}
    ground(40,by+22,48);ground(760,by+22,48);
    ctx.save();ctx.strokeStyle=C.muted;ctx.lineWidth=.8;ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(A.x+this.P.s,by-28);ctx.lineTo(A.x+this.P.s,by+28);ctx.stroke();ctx.restore();
    label('0',A.x+this.P.s,by-36,'center');
    arcArrow(A.x,A.y,this.rA+20,PI*0.62,PI*0.92,C.brass);
    callout('CRANK WRISTS',640,470,g.pB[0]+8,g.pB[1]+8,'right');
    callout('SLOTTED LEVER',640,180,g.pA[0]+c*(end-30),g.pA[1]+s*(end-30)-8,'right');
    callout('TRAVERSE BAR',560,40,xb+120,by-10);
  },
  reads(){const g=this.g,rep=g.NB/gcd(this.NA,g.NB);return[['Bar position',`${g.x.toFixed(1)} mm`],['Last stroke',this.stroke==null?'measuring…':`${this.stroke.toFixed(1)} mm`],['Gear ratio',`24 : ${g.NB}`],['Repeats every',`${rep} turns`]];}
};

/* ---------- 123 Double rack to continuous rotation ---------- */
function rackTeeth(x0,x1,c0,p,yPitch,m,down){const pts=[],rt=yPitch+(down?m:-m),rr=yPitch+(down?-1.25*m:1.25*m);
  const kmin=Math.ceil((x0+p/2-c0)/p),kmax=Math.floor((x1-p/2-c0)/p);
  for(let k=kmin;k<=kmax;k++){const c=c0+k*p;for(const [f,t] of PROF)pts.push([c+f*p,t?rt:rr]);}
  const last=c0+kmax*p+p/2;pts.push([last,rr]);return pts;}
const M123={num:123,name:'Double rack to rotation',sub:'Two half-sectors, centre gear',
  desc:'A sliding frame with racks on its upper and lower bars moves back and forth. Inside it sit two semicircular toothed sectors, each on a shaft that also carries a spur gear, and both spur gears mesh with a centre gear. On the stroke to the right the left sector engages the upper rack; on the return the right sector engages the lower rack. Both sectors keep turning the same way, so the centre gear turns continuously. Brown offers it in place of a crank. His stops and curved guide piece, which time the hand-over between sectors, are left out of this drawing.',
  watch:'Driven by a crank, the centre gear slows to a stop at each end of the stroke and then carries on the same way. Switch the rack to steady speed and the centre gear turns evenly.',
  outLabel:'Centre gear, turns',
  params:[{id:'mode',type:'toggle',label:'Rack driven by',options:[[0,'Crank'],[1,'Steady speed']],value:0}],
  r:60,N:20,S1:{x:290,y:240},S2:{x:510,y:240},rs:40,Ns:16,rg:80,Ng:32,
  get G(){return{x:400,y:240+Math.sqrt(120*120-110*110)};},
  reset(){},
  update(phi){const A=PI*this.r/2;let s,x;
    if(this.P.mode===0){const k=Math.floor(phi/PI),f=phi-k*PI;s=2*A*k+A*(1-Math.cos(f));x=-A*Math.cos(phi);}
    else{s=2*A*phi/PI;const k=Math.floor(s/(2*A)),u=s-k*2*A;x=mod(k,2)===0?-A+u:A-u;}
    const al=s/this.r;this.g={phi,x,al,A,beta:-al*this.rs/this.rg,upper:mod(al,TAU)<PI};},
  output(){return -this.g.beta/TAU;},
  sector(S){const g=this.g,tau=TAU/this.N,m=2*this.r/this.N,root=this.r-1.25*m-1;
    const pts=gearPts(S.x,S.y,this.r,this.N,g.al-PI/2+tau/2,false,g.al-3*PI/2+0.01,g.al-PI/2-0.01);
    poly(pts);ctx.arc(S.x,S.y,root,g.al-PI/2,g.al+PI/2);ctx.closePath();circ(S.x,S.y,9,false);
    circ(S.x+30*Math.cos(g.al+PI/2),S.y+30*Math.sin(g.al+PI/2),9,false);paint(C.part,C.ink);pitchArc(S.x,S.y,this.r,g.al-3*PI/2,g.al-PI/2);},
  draw(){const g=this.g,S1=this.S1,S2=this.S2,G=this.G,m=6,p=PI*m,X=g.x,Yu=S1.y-this.r,Yl=S1.y+this.r;
    const th1=Math.atan2(G.y-S1.y,G.x-S1.x),th2=Math.atan2(G.y-S2.y,G.x-S2.x),tG=TAU/this.Ng,tS=TAU/this.Ns;
    const cG0=th1+PI+tG/2,e0=mod(th2+PI-cG0,tG);
    drawGear(G.x,G.y,this.rg,this.Ng,g.beta+cG0,C['steel-fill'],{bore:8});
    drawGear(S1.x,S1.y,this.rs,this.Ns,g.al+th1,C.part2,{bore:8});
    drawGear(S2.x,S2.y,this.rs,this.Ns,g.al+th2+e0*this.rg/this.rs+tS/2,C.part2,{bore:8});
    // frame (driver)
    const xl=X+S1.x-125,xr=X+S2.x+125,ub=Yu-1.25*m,lb=Yl+1.25*m;
    bar(-20,S1.y,xl,S1.y,14,C['brass-fill']);
    ctx.beginPath();ctx.rect(42,S1.y-20,40,10);ctx.rect(42,S1.y+10,40,10);paint(C.part,C.ink);ground(62,S1.y+20,40);
    ctx.beginPath();ctx.rect(xl-16,ub-20,16,lb-ub+40);ctx.rect(xr,ub-20,16,lb-ub+40);paint(C['brass-fill'],C.ink);
    let up=rackTeeth(xl,xr,X+S1.x+g.A,p,Yu,m,true);poly([[xl,ub-20],[xl,ub],...up,[xr,ub],[xr,ub-20]]);ctx.closePath();paint(C['brass-fill'],C.ink);
    let lo=rackTeeth(xl,xr,X+S2.x-g.A,p,Yl,m,false);poly([[xl,lb+20],[xl,lb],...lo,[xr,lb],[xr,lb+20]]);ctx.closePath();paint(C['brass-fill'],C.ink);
    this.sector(S1);this.sector(S2);
    pivot(S1.x,S1.y,5);pivot(S2.x,S2.y,5);pivot(G.x,G.y,6);
    arcArrow(G.x,G.y,this.rg+18,PI*0.35,PI*0.1,C.steel);
    const eng=g.upper?S1:S2;circ(eng.x,eng.y+(g.upper?-this.r:this.r),9);paint(null,C.brass,2);
    callout('DOUBLE RACK · driver',140,110,xl+40,ub-12,'right');
    callout('HALF SECTORS',660,110,S2.x+30,S2.y-40);
    callout('CENTRE GEAR',660,470,G.x+50,G.y+60);
  },
  reads(v){const g=this.g;return[['Rack position',`${g.x.toFixed(1)} mm`],['Engaged',g.upper?'left · upper rack':'right · lower rack'],['Centre gear',`${mod(-g.beta*180/PI,360).toFixed(0)}°`],['Centre speed',`${(v*60).toFixed(1)} rpm`],['Rack stroke',`${(2*g.A).toFixed(0)} mm`]];}
};

/* ---------- 127 Twin-rack air pump ---------- */
const M127={num:127,name:'Twin-rack air pump',sub:'Lever, gear, two pistons',
  desc:'A hand lever is fixed to a shaft that also carries a spur gear. Racks on opposite sides of the gear mesh with it, and each rack carries the piston of a pump. Rocking the lever turns the gear a little each way, so one rack rises while the other falls and the two pumps work alternately. Brown gives it as the motion used in air pumps.',
  watch:'One pump draws air in while the other pushes it out, so the delivery only pauses at the ends of the lever swing. A bigger swing lengthens both piston strokes equally.',
  outLabel:'Pistons A (blue) and B (amber), mm',
  params:[{id:'sw',label:'Lever swing (each way)',min:8,max:34,step:1,value:26,fmt:v=>`${v}°`},
          {id:'bore',label:'Cylinder bore',min:30,max:66,step:2,value:56,fmt:v=>`${v} mm`}],
  Gc:{x:400,y:318},r:60,N:20,
  reset(){},
  update(phi){const lam=this.P.sw*DEG*Math.sin(phi);this.g={phi,lam,yl:-this.r*lam,yr:this.r*lam,v:Math.cos(phi)};},
  output(){return -this.g.yl;},
  output2(){return -this.g.yr;},
  pump(cx,dy,vel,name){const top=76,bot=236,hw=34,py=190+dy;
    // rack
    const side=cx<this.Gc.x?1:-1,px=this.Gc.x-side*this.r,m=6,p=PI*m,body=px-side*1.25*m;
    const ys=py+18,ye=py+280;const pts=[];
    const kmin=Math.ceil((ys+p/2-(this.Gc.y+dy))/p),kmax=Math.floor((ye-p/2-(this.Gc.y+dy))/p);
    for(let k=kmin;k<=kmax;k++){const c=this.Gc.y+dy+k*p;for(const [f,t] of PROF)pts.push([t?px+side*m:body,c+f*p]);}
    pts.push([body,this.Gc.y+dy+kmax*p+p/2]);
    poly([[body-side*22,ys],[body,ys],...pts,[body,ye],[body-side*22,ye]]);ctx.closePath();paint(C['steel-fill'],C.ink);
    // cylinder
    ctx.beginPath();ctx.rect(cx-hw-8,top,8,bot-top);ctx.rect(cx+hw,top,8,bot-top);ctx.rect(cx-hw-8,top-10,2*hw+16,10);paint(C.part,C.ink);
    ctx.beginPath();ctx.rect(cx-hw-14,bot,2*hw+28,8);paint(C.part2,C.ink);
    ctx.save();ctx.globalAlpha=.25;ctx.fillStyle=C.steel;ctx.fillRect(cx-hw,top,2*hw,py-top);ctx.restore();
    ctx.beginPath();ctx.rect(cx-hw+1,py,2*hw-2,18);paint(C['steel-fill'],C.ink);
    ctx.beginPath();ctx.moveTo(cx-hw+1,py+6);ctx.lineTo(cx+hw-1,py+6);ctx.moveTo(cx-hw+1,py+12);ctx.lineTo(cx+hw-1,py+12);ctx.strokeStyle=C.ink;ctx.lineWidth=.8;ctx.stroke();
    // valves: suction when piston moves down (vel>0)
    const k=Math.min(1,Math.abs(vel)*1.4);
    if(k>0.08){ctx.save();ctx.globalAlpha=0.25+0.75*k;
      if(vel>0){ctx.beginPath();ctx.moveTo(cx-hw+10,top-34);ctx.lineTo(cx-hw+10,top-12);ctx.strokeStyle=C.steel;ctx.lineWidth=2;ctx.stroke();ctx.beginPath();ctx.moveTo(cx-hw+10,top-4);ctx.lineTo(cx-hw+5,top-13);ctx.lineTo(cx-hw+15,top-13);ctx.closePath();ctx.fillStyle=C.steel;ctx.fill();}
      else{ctx.beginPath();ctx.moveTo(cx+hw-10,top-12);ctx.lineTo(cx+hw-10,top-30);ctx.strokeStyle=C.brass;ctx.lineWidth=2;ctx.stroke();ctx.beginPath();ctx.moveTo(cx+hw-10,top-40);ctx.lineTo(cx+hw-15,top-30);ctx.lineTo(cx+hw-5,top-30);ctx.closePath();ctx.fillStyle=C.brass;ctx.fill();}
      ctx.restore();}
    label('in',cx-hw+10,top-46,'center');label('out',cx+hw-10,top-46,'center');
    label(name,cx<this.Gc.x?cx-hw-16:cx+hw+16,(top+bot)/2,cx<this.Gc.x?'right':'left');
    return vel>0?'drawing in':vel<0?'pushing out':'at rest';},
  draw(){const g=this.g,Gc=this.Gc,r=this.r;
    const ra=g.yl,rb=g.yr,vA=g.v*Math.sign(speedSign())*-1,vB=-vA;
    const lx=Gc.x-r-7.5-11,rx=Gc.x+r+7.5+11;
    this.sa=this.pump(lx,ra,vA*(this.P.sw/26),'PUMP A');this.sb=this.pump(rx,rb,vB*(this.P.sw/26),'PUMP B');
    drawGear(Gc.x,Gc.y,r,this.N,g.lam+PI+PI/this.N,C['brass-fill'],{bore:8});
    const a=22*DEG+g.lam,L=290,ex=Gc.x+L*Math.cos(a),ey=Gc.y+L*Math.sin(a);
    ctx.beginPath();capsule(Gc.x,Gc.y,ex,ey,11);paint(C['brass-fill'],C.ink);
    circ(ex,ey,16);paint(C['brass-fill'],C.ink);
    pivot(Gc.x,Gc.y,6);ground(Gc.x,Gc.y+90,50);ctx.beginPath();ctx.rect(Gc.x-7,Gc.y+10,14,80);paint(C.part,C.ink);
    pivot(Gc.x,Gc.y,6);
    callout('LEVER · driver',760,330,ex-20,ey-14,'right');
    callout('RACKS',140,470,lx-20,Gc.y+90+ra,'right');
  },
  reads(){const g=this.g,st=2*this.r*this.P.sw*DEG,vol=PI*(this.P.bore/2)**2*st/1000;
    return[['Lever angle',`${(g.lam/DEG).toFixed(1)}°`],['Piston A',`${(-g.yl).toFixed(1)} mm · ${this.sa||''}`],['Piston B',`${(-g.yr).toFixed(1)} mm · ${this.sb||''}`],['Stroke each',`${st.toFixed(0)} mm`],['Air per full swing',`${(2*vol).toFixed(0)} cc`]];}
};

/* ---------- 124 Fiddle drill ---------- */
const M124={num:124,name:'Fiddle drill',sub:'Bow, string and spindle',
  desc:'The bow string takes a turn round a pulley on the drill spindle. Pushing the bow back and forth winds the string off one way and then the other, so the spindle spins first in one direction and then the other. The breast plate on top lets the worker lean on the drill to press it into the work.',
  watch:'A smaller pulley or a longer bow stroke gives more turns per stroke and a faster spindle. The top view shows the reversal at each end of the stroke.',
  outLabel:'Spindle angle, turns',
  params:[{id:'A',label:'Bow stroke (each way)',min:50,max:160,step:5,value:130,fmt:v=>`${v} mm`},
          {id:'dp',label:'Pulley diameter',min:24,max:64,step:2,value:40,fmt:v=>`${v} mm`}],
  X:420,
  reset(){},
  update(phi){const A=this.P.A,rp=this.P.dp/2,bx=A*Math.sin(phi);this.g={bx,al:bx/rp,rp,phi};},
  output(){return this.g.al/TAU;},
  draw(){const g=this.g,X=this.X,rp=g.rp,al=g.al,bx=g.bx;
    // work
    ctx.beginPath();ctx.rect(X-130,446,260,60);paint(C.part2,C.ink);
    ctx.save();ctx.beginPath();ctx.rect(X-130,446,260,60);ctx.clip();ctx.strokeStyle=C.muted;ctx.lineWidth=.7;for(let i=-60;i<300;i+=12){ctx.beginPath();ctx.moveTo(X-130+i,506);ctx.lineTo(X-130+i+60,446);ctx.stroke();}ctx.restore();
    ground(X,506,300);
    // bow (behind spindle)
    const hl=165,T1=[X+bx-hl,228],T2=[X+bx+hl,228];
    ctx.save();ctx.lineCap='round';ctx.strokeStyle=C.ink;ctx.lineWidth=10;ctx.beginPath();ctx.moveTo(T1[0],T1[1]);ctx.quadraticCurveTo(X+bx,128,T2[0],T2[1]);ctx.stroke();
    ctx.strokeStyle=C['brass-fill'];ctx.lineWidth=7;ctx.stroke();ctx.restore();
    ctx.beginPath();ctx.rect(T2[0]-4,218,72,22);paint(C['brass-fill'],C.ink);
    // spindle, breast plate
    ctx.beginPath();ctx.ellipse(X,62,72,14,0,0,TAU);paint(C.part2,C.ink);
    ctx.beginPath();ctx.rect(X-12,62,24,16);paint(C.part,C.ink);
    ctx.beginPath();ctx.rect(X-8,78,16,232);paint(C.part,C.ink);
    // pulley drum (output)
    ctx.beginPath();ctx.rect(X-rp-6,206,2*rp+12,6);ctx.rect(X-rp-6,250,2*rp+12,6);paint(C['steel-fill'],C.ink);
    ctx.beginPath();ctx.rect(X-rp,212,2*rp,38);paint(C['steel-fill'],C.ink);
    ctx.save();ctx.strokeStyle=C.steel;ctx.lineWidth=1.2;for(let k=0;k<8;k++){const a=al+k*TAU/8;if(Math.cos(a)>0){const x=X+rp*Math.sin(a);ctx.globalAlpha=0.35+0.65*Math.cos(a);ctx.beginPath();ctx.moveTo(x,213);ctx.lineTo(x,249);ctx.stroke();}}ctx.restore();
    // string
    ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(T1[0],T1[1]);ctx.lineTo(X-rp,240);ctx.lineTo(X+rp,224);ctx.lineTo(T2[0],T2[1]);ctx.stroke();ctx.restore();
    // chuck and bit
    ctx.beginPath();ctx.rect(X-15,306,30,30);paint(C.part,C.ink);
    ctx.beginPath();ctx.moveTo(X-7,336);ctx.lineTo(X-7,440);ctx.lineTo(X,456);ctx.lineTo(X+7,440);ctx.lineTo(X+7,336);ctx.closePath();paint(C['steel-fill'],C.ink);
    ctx.save();ctx.strokeStyle=C.steel;ctx.lineWidth=1.4;for(let k=0;k<2;k++){let on=false;ctx.beginPath();for(let y=338;y<=438;y+=2){const ph=al+k*PI+(y-338)*0.12;const vis=Math.cos(ph)>0;const x=X+6.5*Math.sin(ph);if(vis){on?ctx.lineTo(x,y):ctx.moveTo(x,y);on=true;}else on=false;}ctx.stroke();}ctx.restore();
    // top view inset
    const ix=110,iy=112,ir=38;circ(ix,iy,ir+18);ctx.save();ctx.setLineDash([3,3]);paint(null,C.rule,1);ctx.restore();
    circ(ix,iy,ir);paint(C['steel-fill'],C.ink);circ(ix,iy,7);paint(C.part,C.ink);
    ctx.save();ctx.strokeStyle=C.steel;ctx.lineWidth=3;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(ix,iy);ctx.lineTo(ix+ir*0.85*Math.cos(al-PI/2),iy+ir*0.85*Math.sin(al-PI/2));ctx.stroke();ctx.restore();
    const sv=Math.cos(g.phi)*(this.P.A/rp)*Math.sign(speedSign());
    if(Math.abs(sv)>0.3)arcArrow(ix,iy,ir+10,sv>0?-2.2:-0.9,sv>0?-0.9:-2.2,C.steel);
    label('TOP VIEW',ix,iy+ir+30,'center');
    callout('BREAST PLATE',300,40,X-50,58,'right');
    callout('PULLEY',580,300,X+rp+4,240);
    callout('BOW · driver',600,120,X+bx+60,183);
    callout('DRILL',300,400,X-8,400,'right');
    linArrow(X+bx-30,272,Math.cos(g.phi)*44*Math.sign(speedSign()),C.brass);
  },
  reads(v){const g=this.g;return[['Bow position',`${g.bx.toFixed(0)} mm`],['Spindle angle',`${mod(g.al*180/PI,360).toFixed(0)}°`],['Spindle speed',`${(v*60).toFixed(0)} rpm`],['Turns per stroke',`${(2*this.P.A/(PI*this.P.dp)).toFixed(2)}`]];}
};


/* ================= batch 1: new simulations ================= */
const SIMS_NEW={};
function reg(o){o.params=o.params||[];o.reset=o.reset||function(){};SIMS_NEW[o.num]=o;return o;}
const lerp=(a,b,t)=>a+(b-a)*t, clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function cc(p0,r0,p1,r1,s){const dx=p1[0]-p0[0],dy=p1[1]-p0[1],d=Math.hypot(dx,dy)||1e-9;const a=(r0*r0-r1*r1+d*d)/(2*d),h=Math.sqrt(Math.max(0,r0*r0-a*a));const bx=p0[0]+a*dx/d,by=p0[1]+a*dy/d;return[bx-s*h*dy/d,by+s*h*dx/d];}
function pulley(x,y,r,a,fill){circ(x,y,r);circ(x,y,Math.max(4,r*0.16),false);paint(fill,C.ink);
  ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=1.1;for(let i=0;i<4;i++){const t=a+i*PI/2;ctx.beginPath();ctx.moveTo(x+r*0.16*Math.cos(t),y+r*0.16*Math.sin(t));ctx.lineTo(x+r*0.8*Math.cos(t),y+r*0.8*Math.sin(t));ctx.stroke();}
  ctx.beginPath();ctx.arc(x,y,r*0.8,0,TAU);ctx.lineWidth=0.8;ctx.stroke();ctx.restore();pivot(x,y,4);}
function arcThru(p,cx,cy,r,a0,a1,am){const d=mod(a1-a0,TAU),m=mod(am-a0,TAU);p.arc(cx,cy,r,a0,a1,!(m<d));}
function beltSegs(x1,y1,r1,x2,y2,r2,crossed){const th=Math.atan2(y2-y1,x2-x1),d=Math.hypot(x2-x1,y2-y1);
  if(!crossed){const g=Math.acos((r1-r2)/d),a=th+g,b=th-g;return{th,a,b,P:[[x1+r1*Math.cos(a),y1+r1*Math.sin(a)],[x2+r2*Math.cos(a),y2+r2*Math.sin(a)],[x2+r2*Math.cos(b),y2+r2*Math.sin(b)],[x1+r1*Math.cos(b),y1+r1*Math.sin(b)]],arcs:[[x2,y2,r2,a,b,th],[x1,y1,r1,b,a,th+PI]]};}
  const g=Math.acos((r1+r2)/d),a=th+g,b=th-g;return{th,a,b,P:[[x1+r1*Math.cos(a),y1+r1*Math.sin(a)],[x2-r2*Math.cos(a),y2-r2*Math.sin(a)],[x2-r2*Math.cos(b),y2-r2*Math.sin(b)],[x1+r1*Math.cos(b),y1+r1*Math.sin(b)]],arcs:[[x2,y2,r2,a+PI,b+PI,th],[x1,y1,r1,b,a,th+PI]]};}
function beltPath(x1,y1,r1,x2,y2,r2,crossed){const s=beltSegs(x1,y1,r1,x2,y2,r2,crossed),p=new Path2D();p.moveTo(...s.P[0]);p.lineTo(...s.P[1]);arcThru(p,...s.arcs[0]);p.lineTo(...s.P[3]);arcThru(p,...s.arcs[1]);p.closePath();return p;}
function beltPoly(x1,y1,r1,x2,y2,r2,crossed,step=4){const s=beltSegs(x1,y1,r1,x2,y2,r2,crossed),pts=[];
  const line=(A,B)=>{const n=Math.max(1,Math.ceil(Math.hypot(B[0]-A[0],B[1]-A[1])/step));for(let i=0;i<n;i++)pts.push([lerp(A[0],B[0],i/n),lerp(A[1],B[1],i/n)]);};
  const arc=(cx,cy,r,a0,a1,am)=>{let d=mod(a1-a0,TAU);const m=mod(am-a0,TAU);if(!(m<d))d=d-TAU;const n=Math.max(2,Math.ceil(Math.abs(d)*r/step));for(let i=0;i<n;i++){const t=a0+d*i/n;pts.push([cx+r*Math.cos(t),cy+r*Math.sin(t)]);}};
  line(s.P[0],s.P[1]);arc(...s.arcs[0]);line(s.P[2],s.P[3]);arc(...s.arcs[1]);return pts;}
function alongPoly(pts){const L=[0];for(let i=1;i<=pts.length;i++){const a=pts[i-1],b=pts[i%pts.length];L.push(L[i-1]+Math.hypot(b[0]-a[0],b[1]-a[1]));}
  return{total:L[L.length-1],at(s){s=mod(s,L[L.length-1]);let lo=0,hi=L.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(L[m]<=s)lo=m;else hi=m;}const a=pts[lo],b=pts[(lo+1)%pts.length],t=(s-L[lo])/((L[lo+1]-L[lo])||1);return[lerp(a[0],b[0],t),lerp(a[1],b[1],t),Math.atan2(b[1]-a[1],b[0]-a[0])];}};}
function drawBelt(path,travel,w=7){ctx.save();ctx.lineJoin='round';ctx.strokeStyle=C.ink;ctx.lineWidth=w+2;ctx.stroke(path);ctx.strokeStyle=C.part2;ctx.lineWidth=w;ctx.stroke(path);
  ctx.setLineDash([3,13]);ctx.lineDashOffset=-travel;ctx.strokeStyle=C.ink;ctx.lineWidth=w-1;ctx.globalAlpha=.55;ctx.stroke(path);ctx.restore();}
function weight(x,y,w,h,t){ctx.beginPath();ctx.rect(x-w/2,y,w,h);paint(C['steel-fill'],C.ink);if(t)label(t,x,y+h/2,'center');}
function rope(pts){ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(...pts[0]);for(const p of pts.slice(1))ctx.lineTo(...p);ctx.stroke();ctx.restore();}
function hatchRect(x,y,w,h,fill){ctx.beginPath();ctx.rect(x,y,w,h);paint(fill||C.part2,C.ink);ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();ctx.strokeStyle=C.muted;ctx.lineWidth=.6;for(let i=-h;i<w;i+=10){ctx.beginPath();ctx.moveTo(x+i,y+h);ctx.lineTo(x+i+h,y);ctx.stroke();}ctx.restore();}
function springZ(x1,y1,x2,y2,n=10,amp=6){const dx=x2-x1,dy=y2-y1,L=Math.hypot(dx,dy),ux=dx/L,uy=dy/L;ctx.save();ctx.strokeStyle=C.muted;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x1,y1);for(let i=1;i<n;i++){const t=i/n,s=(i%2?1:-1)*amp;ctx.lineTo(x1+dx*t-uy*s,y1+dy*t+ux*s);}ctx.lineTo(x2,y2);ctx.stroke();ctx.restore();}
function rpmOf(v){return (v*60).toFixed(1)+' rpm';}
function stripeShaft(x0,x1,y,r,ang,fill){ctx.beginPath();ctx.rect(x0,y-r,x1-x0,2*r);paint(fill||C.part,C.ink);ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=1;for(let k=0;k<6;k++){const a=ang+k*PI/3;if(Math.cos(a)>0){const yy=y+r*Math.sin(a);ctx.globalAlpha=.25+.6*Math.cos(a);ctx.beginPath();ctx.moveTo(x0,yy);ctx.lineTo(x1,yy);ctx.stroke();}}ctx.restore();}

/* 1, 2 open and crossed belts */
function beltSim(num,crossed){return reg({num,outLabel:'Driven pulley, turns',
  params:[{id:'d',label:'Driven pulley diameter',min:60,max:180,step:10,value:crossed?140:100,fmt:v=>v+' mm'}],
  A:[230,260],B:[570,260],r1:70,
  update(phi){const r2=this.P.d/2;this.g={phi,r2,a2:(crossed?-1:1)*phi*this.r1/r2};},
  output(){return this.g.a2/TAU;},
  draw(){const g=this.g,A=this.A,B=this.B;drawBelt(beltPath(A[0],A[1],this.r1,B[0],B[1],g.r2,crossed),this.r1*g.phi);
    pulley(A[0],A[1],this.r1,g.phi,C['brass-fill']);pulley(B[0],B[1],g.r2,g.a2,C['steel-fill']);
    arcArrow(A[0],A[1],this.r1+18,-2.2,-1.2,C.brass);arcArrow(B[0],B[1],g.r2+18,crossed?-1.2:-2.2,crossed?-2.2:-1.2,C.steel);
    ground(A[0],A[1]+this.r1+40,50);ground(B[0],B[1]+g.r2+40,50);
    label('DRIVER',A[0],A[1]+this.r1+62,'center');label('DRIVEN',B[0],B[1]+g.r2+62,'center');},
  reads(v){const g=this.g;return[['Speed ratio',`1 : ${(this.r1/g.r2).toFixed(2)}`],['Driven turns',crossed?'opposite way':'same way'],['Driven angle',`${mod(g.a2*180/PI,360).toFixed(0)}°`],['Driven speed',rpmOf(v)]];}});}
beltSim(1,false);beltSim(2,true);

/* 8 stepped speed pulleys */
reg({num:8,outLabel:'Driven shaft, turns',params:[{id:'s',label:'Belt on step',min:1,max:3,step:1,value:2,fmt:v=>['small driver','middle','large driver'][v-1]}],
  A:[240,260],B:[560,260],R1:[40,62,84],R2:[84,62,40],
  update(phi){const i=this.P.s-1,r1=this.R1[i],r2=this.R2[i];this.g={phi,i,r1,r2,a2:phi*r1/r2};},
  output(){return this.g.a2/TAU;},
  draw(){const g=this.g,A=this.A,B=this.B;
    for(let k=2;k>=0;k--){circ(A[0],A[1],this.R1[k]);paint(k===g.i?C['brass-fill']:C.part,C.ink);circ(B[0],B[1],this.R2[k]);paint(k===g.i?C['steel-fill']:C.part,C.ink);}
    drawBelt(beltPath(A[0],A[1],g.r1,B[0],B[1],g.r2,false),g.r1*g.phi,6);
    for(const [P,a] of [[A,g.phi],[B,g.a2]]){ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=1.2;for(let k=0;k<3;k++){const t=a+k*TAU/3;ctx.beginPath();ctx.moveTo(P[0]+8*Math.cos(t),P[1]+8*Math.sin(t));ctx.lineTo(P[0]+34*Math.cos(t),P[1]+34*Math.sin(t));ctx.stroke();}ctx.restore();pivot(P[0],P[1],5);}
    label('DRIVER',A[0],A[1]+120,'center');label('DRIVEN',B[0],B[1]+120,'center');},
  reads(v){const g=this.g;return[['Belt step',['small driver','middle','large driver'][g.i]],['Speed ratio',`1 : ${(g.r1/g.r2).toFixed(2)}`],['Driven speed',rpmOf(v)]];}});

/* 13 movable pulley */
reg({num:13,outLabel:'Load height, mm',
  update(phi){const s=110*(1-Math.cos(phi))/2;this.g={phi,s,lift:s/2};},
  output(){return this.g.lift;},
  draw(){const g=this.g,F=[430,100],r=30,yL=330-g.lift,M=[370,yL];
    ctx.beginPath();ctx.rect(240,40,320,14);paint(C.part2,C.ink);
    rope([[340,54],[340,yL]]);rope([[400,yL],[400,F[1]]]);rope([[460,F[1]],[460,300+g.s]]);
    ctx.beginPath();ctx.arc(M[0],M[1],r,0,PI);ctx.strokeStyle=C.ink;ctx.lineWidth=2;ctx.stroke();ctx.beginPath();ctx.arc(F[0],F[1],r,PI,TAU);ctx.stroke();
    bar(F[0],54,F[0],F[1],6,C.part);pulley(F[0],F[1],r,g.s/r,C.part);pulley(M[0],M[1],r,-g.lift/r,C['steel-fill']);
    bar(M[0],M[1],M[0],M[1]+44,6,C.part);weight(M[0],M[1]+44,70,56,'LOAD');
    ctx.beginPath();ctx.rect(450,300+g.s,20,30);paint(C['brass-fill'],C.ink);label('PULL',492,315+g.s);
    linArrow(495,260+g.s,0,C.brass);},
  reads(){const g=this.g;return[['Rope pulled',`${g.s.toFixed(0)} mm`],['Load raised',`${g.lift.toFixed(0)} mm`],['Force needed','½ of the load'],['Trade-off','pull twice as far']];}});

/* 14 block and tackle */
reg({num:14,outLabel:'Load height, mm',params:[{id:'n',label:'Sheaves in each block',min:1,max:3,step:1,value:2,fmt:v=>v}],
  update(phi){const n=this.P.n,s=150*(1-Math.cos(phi))/2;this.g={phi,n,s,lift:s/(2*n)};},
  output(){return this.g.lift;},
  draw(){const g=this.g,n=g.n,r=16,x0=400-(n-1)*22,yU=100,yL=360-g.lift;
    ctx.beginPath();ctx.rect(260,40,280,14);paint(C.part2,C.ink);bar(400,54,400,yU,6,C.part);
    const xs=[];for(let i=0;i<n;i++)xs.push(x0+i*44);
    for(const x of xs){rope([[x-r,yU],[x-r,yL]]);rope([[x+r,yU],[x+r,yL]]);}
    const hx=xs[n-1]+r+28;rope([[xs[n-1]+r,yU-r],[hx,yU-r],[hx,300+g.s]]);
    ctx.beginPath();ctx.rect(x0-r-8,yU-r-8,(n-1)*44+2*r+16,2*r+16);paint(C.part,C.ink);
    ctx.beginPath();ctx.rect(x0-r-8,yL-r-8,(n-1)*44+2*r+16,2*r+16);paint(C.part,C.ink);
    xs.forEach((x,i)=>{pulley(x,yU,r,g.s/r*(1+i*0.3),C.part2);pulley(x,yL,r,-g.s/r*(1+i*0.3),C['steel-fill']);});
    bar(400,yL+r+8,400,yL+50,6,C.part);weight(400,yL+50,90,60,'LOAD');
    ctx.beginPath();ctx.rect(hx-10,300+g.s,20,30);paint(C['brass-fill'],C.ink);label('PULL',hx+16,315+g.s);},
  reads(){const g=this.g;return[['Supporting ropes',`${2*g.n}`],['Force needed',`1/${2*g.n} of the load`],['Rope pulled',`${g.s.toFixed(0)} mm`],['Load raised',`${g.lift.toFixed(1)} mm`]];}});

/* 24 spur gears */
reg({num:24,outLabel:'Driven gear, turns',params:[{id:'z',label:'Driven gear teeth',min:12,max:48,step:6,value:36,fmt:v=>v+' teeth (driver 24)'}],
  update(phi){const z=this.P.z;this.g={phi,z,r2:2.5*z,a2:-phi*24/z};},
  output(){return this.g.a2/TAU;},
  draw(){const g=this.g,A=[250,270],B=[250+60+g.r2,270];
    drawGear(A[0],A[1],60,24,g.phi,C['brass-fill'],{bore:8});drawGear(B[0],B[1],g.r2,g.z,g.a2+PI+PI/g.z,C['steel-fill'],{bore:8});
    pivot(A[0],A[1],6);pivot(B[0],B[1],6);arcArrow(A[0],A[1],84,-2.4,-1.4,C.brass);arcArrow(B[0],B[1],g.r2+22,-1.4,-2.4,C.steel);},
  reads(v){const g=this.g;return[['Gear ratio',`24 : ${g.z}`],['Driven speed',`${(24/g.z).toFixed(2)} × driver`],['Torque',`${(g.z/24).toFixed(2)} × driver`],['Driven',rpmOf(Math.abs(v))]];}});

/* 25 bevel gears (side elevation) */
reg({num:25,outLabel:'Driven gear, turns',
  update(phi){this.g={phi,a2:-phi};},output(){return this.g.a2/TAU;},
  draw(){const g=this.g,O=[400,170],s2=Math.SQRT1_2,N=24,d1=90,d2=170;
    // vertical-axis gear below apex
    const r1=d1*s2,r2=d2*s2,y1=O[1]+d1*s2,y2=O[1]+d2*s2;
    poly([[O[0]-r1,y1],[O[0]+r1,y1],[O[0]+r2,y2],[O[0]-r2,y2]]);ctx.closePath();paint(C['brass-fill'],C.ink);
    ctx.save();ctx.strokeStyle=C.ink;for(let k=0;k<N;k++){const t=g.phi+k*TAU/N;if(Math.sin(t)>0){ctx.globalAlpha=.3+.7*Math.sin(t);ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(O[0]+r1*Math.cos(t),y1);ctx.lineTo(O[0]+r2*Math.cos(t),y2);ctx.stroke();}}ctx.restore();
    ctx.beginPath();ctx.rect(O[0]-10,y2,20,150);paint(C.part,C.ink);
    // horizontal-axis gear to the right of apex
    const x1=O[0]+d1*s2,x2=O[0]+d2*s2;
    poly([[x1,O[1]-r1],[x1,O[1]+r1],[x2,O[1]+r2],[x2,O[1]-r2]]);ctx.closePath();paint(C['steel-fill'],C.ink);
    ctx.save();ctx.strokeStyle=C.ink;for(let k=0;k<N;k++){const t=g.a2+k*TAU/N+PI/N;if(Math.sin(t)>0){ctx.globalAlpha=.3+.7*Math.sin(t);ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x1,O[1]+r1*Math.cos(t));ctx.lineTo(x2,O[1]+r2*Math.cos(t));ctx.stroke();}}ctx.restore();
    ctx.beginPath();ctx.rect(x2,O[1]-10,170,20);paint(C.part,C.ink);
    ctx.save();ctx.setLineDash([6,4]);ctx.strokeStyle=C.muted;ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(O[0],O[1]-40);ctx.lineTo(O[0],500);ctx.moveTo(O[0]-40,O[1]);ctx.lineTo(780,O[1]);ctx.stroke();ctx.restore();
    label('SHAFTS MEET AT 90°',O[0]-14,O[1]-30,'right');label('DRIVER',O[0]-r2-10,y2+40,'right');label('DRIVEN',x2+90,O[1]+34,'center');},
  reads(v){return[['Shaft angle','90° (mitre gears)'],['Ratio','1 : 1'],['Driven speed',rpmOf(Math.abs(v))]];}});

/* 31 worm and wheel */
reg({num:31,outLabel:'Wheel, turns',Z:40,
  update(phi){this.g={phi,w:-phi/this.Z};},output(){return -this.g.w/TAU;},
  draw(){const g=this.g,W=[400,215],R=130,m=2*R/this.Z,p=PI*m,yw=W[1]+R+22,rw=24;
    drawGear(W[0],W[1],R,this.Z,g.w,C['steel-fill'],{bore:10});pivot(W[0],W[1],6);
    ctx.beginPath();ctx.rect(170,yw-rw,460,2*rw);paint(C['brass-fill'],C.ink);
    ctx.save();ctx.beginPath();ctx.rect(170,yw-rw,460,2*rw);ctx.clip();ctx.strokeStyle=C.ink;ctx.lineWidth=2.2;
    const sh=mod(g.phi/TAU*p,p);for(let x=170-p+sh;x<640;x+=p){ctx.beginPath();ctx.moveTo(x,yw-rw);ctx.lineTo(x+p*0.55,yw+rw);ctx.stroke();}ctx.restore();
    bar(120,yw,170,yw,12,C.part);bar(630,yw,690,yw,12,C.part);
    circ(110,yw,26);paint(C['brass-fill'],C.ink);const ca=g.phi;bar(110,yw,110+22*Math.cos(ca),yw+22*Math.sin(ca),7,C.part2);pivot(110,yw,4);
    arcArrow(W[0],W[1],R+24,-1.2,-1.9,C.steel);label('WORM · driver',400,yw+44,'center');label('WORM WHEEL',W[0]+R+20,W[1]-R+10);},
  reads(v){const g=this.g;return[['Reduction',`${this.Z} : 1`],['Worm turns',`${(g.phi/TAU).toFixed(1)}`],['Wheel angle',`${mod(-g.w*180/PI,360).toFixed(1)}°`],['Back-driving','resisted (self-locking)']];}});

/* 33 elliptical gears */
reg({num:33,outLabel:'Driven gear, turns',params:[{id:'e',label:'Eccentricity',min:0.2,max:0.75,step:0.05,value:0.6,fmt:v=>v.toFixed(2)}],
  a:90,
  table(){const e=this.P.e;if(this._e===e)return;this._e=e;const a=this.a,n=720,T=new Float64Array(n+1);let th=0;T[0]=0;
    const r=psi=>a*(1-e*e)/(1+e*Math.cos(psi));
    for(let i=1;i<=n;i++){const t0=(i-1)/n*TAU,t1=i/n*TAU;const f=t=>{const r1=r(-t);return -r1/(2*a-r1);};th+=(f(t0)+f(t1))/2*(TAU/n);T[i]=th;}
    const k=-TAU/T[n];for(let i=0;i<=n;i++)T[i]*=k;this.T=T;},
  update(phi){this.table();const n=720,c=Math.floor(phi/TAU),f=phi/TAU-c,x=f*n,i=Math.floor(x);const t=this.T[i]+(this.T[Math.min(n,i+1)]-this.T[i])*(x-i);
    const e=this.P.e,a=this.a,r1=a*(1-e*e)/(1+e*Math.cos(-phi));this.g={phi,a2:t-c*TAU,ratio:r1/(2*a-r1)};},
  output(){return -this.g.a2/TAU;},
  ell(F,th,fill){const e=this.P.e,a=this.a,pts=[];for(let i=0;i<180;i++){const s=i/180*TAU,r=a*(1-e*e)/(1+e*Math.cos(s));pts.push([F[0]+r*Math.cos(s+th),F[1]+r*Math.sin(s+th)]);}
    poly(pts);ctx.closePath();paint(fill,C.ink);ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=1;for(let i=0;i<36;i++){const s=i/36*TAU,r=a*(1-e*e)/(1+e*Math.cos(s));const x=F[0]+r*Math.cos(s+th),y=F[1]+r*Math.sin(s+th);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(F[0]+(r-9)*Math.cos(s+th),F[1]+(r-9)*Math.sin(s+th));ctx.stroke();}ctx.restore();},
  draw(){const g=this.g,F1=[310,260],F2=[310+2*this.a,260];this.ell(F1,g.phi,C['brass-fill']);this.ell(F2,PI+g.a2,C['steel-fill']);pivot(F1[0],F1[1],6);pivot(F2[0],F2[1],6);
    label('PIVOTS AT THE FOCI',400,440,'center');},
  reads(v){const g=this.g;return[['Speed ratio now',`${g.ratio.toFixed(2)} × driver`],['Driven speed',rpmOf(Math.abs(v))],['Over one turn','fast, then slow']];}});

/* 34 internal gear and pinion */
reg({num:34,outLabel:'Ring gear, turns',
  update(phi){this.g={phi,ar:phi*16/48};},output(){return this.g.ar/TAU;},
  draw(){const g=this.g,O=[400,260],R=120,Z=48,m=5;
    poly(gearPts(O[0],O[1],R,Z,g.ar+PI/Z,true));ctx.closePath();circ(O[0],O[1],R+1.25*m+18,false);paint(C['steel-fill'],C.ink);pitchArc(O[0],O[1],R);
    drawGear(O[0]+80,O[1],40,16,g.phi,C['brass-fill'],{bore:7});pivot(O[0]+80,O[1],5);pivot(O[0],O[1],5);
    arcArrow(O[0]+80,O[1],58,-2.4,-1.4,C.brass);arcArrow(O[0],O[1],R+40,-2.0,-1.4,C.steel);label('BOTH TURN THE SAME WAY',400,490,'center');},
  reads(v){return[['Ratio','16 : 48'],['Direction','same as pinion'],['Teeth in contact','more than external gears'],['Ring speed',rpmOf(v)]];}});

/* 39 sun and planet */
reg({num:39,outLabel:'Flywheel shaft, turns',S:[470,320],Bp:[230,110],Lb:160,Lr:300,
  geo(psi){const P=[this.S[0]+100*Math.cos(psi),this.S[1]+100*Math.sin(psi)];const E=cc(this.Bp,this.Lb,P,this.Lr,-1);const rho=Math.atan2(P[1]-E[1],P[0]-E[0]);return{P,E,rho};},
  reset(){const g0=this.geo(0);this.rho0=g0.rho;},
  update(phi){if(this.rho0===undefined)this.reset();const g=this.geo(phi);g.sig=2*phi-g.rho+(this.rho0-0);g.phi=phi;this.g=g;},
  output(){return this.g.sig/TAU;},
  draw(){const g=this.g,S=this.S,tau=TAU/20;
    circ(S[0],S[1],170);paint(C.part,C.ink);for(let k=0;k<6;k++){const a=g.sig+k*PI/3;bar(S[0]+40*Math.cos(a),S[1]+40*Math.sin(a),S[0]+158*Math.cos(a),S[1]+158*Math.sin(a),10,C.part2);}
    circ(S[0],S[1],150);paint(null,C.ink,1);
    drawGear(S[0],S[1],50,20,g.sig+tau/2,C['steel-fill'],{bore:8});
    drawGear(g.P[0],g.P[1],50,20,g.rho+PI+tau/2+(0-this.rho0)+PI,C['brass-fill'],{bore:8});
    bar(S[0],S[1],g.P[0],g.P[1],10,C.part2);
    bar(2*this.Bp[0]-g.E[0],2*this.Bp[1]-g.E[1],g.E[0],g.E[1],16,C.part);
    bar(g.E[0],g.E[1],g.P[0],g.P[1],12,C.part2);pivot(g.E[0],g.E[1],5);pivot(g.P[0],g.P[1],6);pivot(S[0],S[1],6);
    ctx.beginPath();ctx.rect(this.Bp[0]-12,this.Bp[1],24,140);paint(C.part2,C.ink);ground(this.Bp[0],this.Bp[1]+140,60);pivot(this.Bp[0],this.Bp[1],7);
    label('BEAM',this.Bp[0]-90,this.Bp[1]-24);label('PLANET · fixed to rod',g.P[0]-70,g.P[1]+70,'right');label('SUN on flywheel shaft',S[0]-60,S[1]+190);},
  reads(v){const g=this.g;return[['Beam strokes',`${(g.phi/TAU).toFixed(2)}`],['Flywheel turns',`${(g.sig/TAU).toFixed(2)}`],['Ratio','2 turns per stroke']];}});

/* 50 universal joint */
reg({num:50,outLabel:'Output lead / lag, degrees',params:[{id:'b',label:'Shaft angle',min:5,max:45,step:1,value:30,fmt:v=>v+'°'}],
  update(phi){const b=this.P.b*PI/180;let t=Math.atan2(Math.sin(phi),Math.cos(phi)*Math.cos(b));t+=TAU*Math.round((phi-t)/TAU);this.g={phi,b,t2:t};},
  output(){return (this.g.t2-this.g.phi)*180/PI;},
  draw(){const g=this.g,J=[400,240];
    stripeShaft(90,J[0]-60,J[1],16,g.phi,C['brass-fill']);
    ctx.save();ctx.translate(J[0],J[1]);ctx.rotate(g.b);stripeShaft(60,330,0,16,g.t2,C['steel-fill']);ctx.restore();
    const yoke=(ang,rot,fill,dir)=>{ctx.save();ctx.translate(J[0],J[1]);ctx.rotate(rot);const s=Math.cos(ang),w=46*s;
      ctx.beginPath();ctx.moveTo(-60*dir,-16);ctx.lineTo(-30*dir,-Math.abs(w)-6);ctx.lineTo(8*dir,-Math.abs(w)-6);ctx.lineTo(8*dir,-Math.abs(w)+6);ctx.lineTo(-20*dir,-Math.abs(w)+6);ctx.lineTo(-48*dir,-6);ctx.lineTo(-48*dir,6);ctx.lineTo(-20*dir,Math.abs(w)-6);ctx.lineTo(8*dir,Math.abs(w)-6);ctx.lineTo(8*dir,Math.abs(w)+6);ctx.lineTo(-30*dir,Math.abs(w)+6);ctx.lineTo(-60*dir,16);ctx.closePath();paint(fill,C.ink);ctx.restore();};
    yoke(g.phi,0,C['brass-fill'],1);yoke(g.t2+PI/2,g.b,C['steel-fill'],-1);
    ctx.beginPath();ctx.rect(J[0]-9,J[1]-9,18,18);paint(C.part2,C.ink);pivot(J[0],J[1],4);
    label('INPUT · steady',150,J[1]+50,'center');label('OUTPUT · speeds up and slows down',560,J[1]+170,'center');},
  reads(){const g=this.g;const cb=Math.cos(g.b),sp=Math.sin(g.phi),cp=Math.cos(g.phi);const r=cb/(1-Math.pow(Math.sin(g.b)*sp,2));
    return[['Shaft angle',`${this.P.b}°`],['Output speed now',`${r.toFixed(3)} × input`],['Range per turn',`${cb.toFixed(2)} – ${(1/cb).toFixed(2)} ×`],['Lead / lag',`${((g.t2-g.phi)*180/PI).toFixed(1)}°`]];}});

/* 72 tilt hammer */
reg({num:72,outLabel:'Hammer head lift, mm',W:[600,370],H:[400,250],
  update(phi){const W=this.W,Rw=95;let best=null;for(let k=0;k<4;k++){const a=mod(phi+k*PI/2+PI,TAU)-PI;if(a>-PI/2&&a<-0.35){const tip=[W[0]+Rw*Math.cos(a),W[1]+Rw*Math.sin(a)];if(!best||tip[1]>best[1])best=tip;best=best||tip;}}
    const rest=Math.atan2(272-this.H[1],640-this.H[0]);let h=rest;if(best){const ah=Math.atan2(best[1]-this.H[1],best[0]-this.H[0]);h=Math.max(rest,ah);}
    this.g={phi,h,rest,lift:(h-rest)*260};},
  output(){return this.g.lift;},
  draw(){const g=this.g,W=this.W,H=this.H;
    circ(W[0],W[1],70);paint(C['brass-fill'],C.ink);for(let k=0;k<4;k++){const a=g.phi+k*PI/2;ctx.beginPath();ctx.moveTo(W[0]+30*Math.cos(a-0.25),W[1]+30*Math.sin(a-0.25));ctx.quadraticCurveTo(W[0]+100*Math.cos(a-0.05),W[1]+100*Math.sin(a-0.05),W[0]+95*Math.cos(a),W[1]+95*Math.sin(a));ctx.lineTo(W[0]+60*Math.cos(a+0.25),W[1]+60*Math.sin(a+0.25));ctx.closePath();paint(C['brass-fill'],C.ink);}
    pivot(W[0],W[1],7);
    const tail=[H[0]+250*Math.cos(g.h),H[1]+250*Math.sin(g.h)],head=[H[0]-260*Math.cos(g.h),H[1]-260*Math.sin(g.h)];
    bar(head[0],head[1],tail[0],tail[1],14,C.part);
    ctx.save();ctx.translate(head[0],head[1]);ctx.rotate(g.h);ctx.beginPath();ctx.rect(-26,-10,52,70);paint(C['steel-fill'],C.ink);ctx.restore();
    ctx.beginPath();ctx.rect(H[0]-14,H[1],28,170);paint(C.part2,C.ink);ground(H[0],H[1]+170,60);pivot(H[0],H[1],6);
    hatchRect(80,330,120,30,C.part2);ctx.beginPath();ctx.rect(110,360,60,110);paint(C.part2,C.ink);ground(140,470,100);
    label('HELVE',H[0]-120,H[1]-40);label('CAM WHEEL · 4 lifts per turn',W[0],W[1]+120,'center');label('ANVIL',140,490,'center');},
  reads(){const g=this.g;return[['Blows per turn','4'],['Head lift',`${g.lift.toFixed(0)} mm`],['Wheel angle',`${mod(g.phi*180/PI,360).toFixed(0)}°`]];}});

/* 85 stamp mill */
reg({num:85,outLabel:'Stamp 1 height, mm',
  lift(t){t=mod(t,PI);return t<0.75*PI?60*t/(0.75*PI):60*Math.max(0,1-(t-0.75*PI)/(0.06*PI));},
  update(phi){this.g={phi,l:[0,1,2].map(k=>this.lift(phi+k*TAU/3))};},output(){return this.g.l[0];},
  draw(){const g=this.g,ys=300;ctx.beginPath();ctx.rect(120,ys-10,560,20);paint(C.part,C.ink);
    [260,400,540].forEach((x,k)=>{const L=g.l[k];
      for(let j=0;j<2;j++){const a=g.phi+k*TAU/3+j*PI;const c=Math.cos(a),s=Math.sin(a);if(c>-0.1){ctx.save();ctx.globalAlpha=.4+.6*Math.max(0,c);bar(x+22,ys,x+22,ys-55*s,14,C['brass-fill']);ctx.restore();}}
      const top=110-L;ctx.beginPath();ctx.rect(x-8,top,16,330);paint(C.part,C.ink);ctx.beginPath();ctx.rect(x-12,ys-62-L,40,12);paint(C['steel-fill'],C.ink);
      ctx.beginPath();ctx.rect(x-22,top+300,44,40);paint(C['steel-fill'],C.ink);});
    hatchRect(200,450,400,50,C.part2);for(const x of [180,620]){ctx.beginPath();ctx.rect(x-10,60,20,440);paint(C.part2,C.ink);}
    ctx.beginPath();ctx.rect(170,90,460,14);paint(C.part2,C.ink);label('CAMSHAFT',120,ys-26);label('ORE',400,488,'center');},
  reads(){const g=this.g;return[['Stamps','3, lifted in turn'],['Drops per turn','2 each'],['Stamp heights',g.l.map(v=>v.toFixed(0)).join(' / ')+' mm']];}});

/* 89 eccentric */
reg({num:89,outLabel:'Valve position, mm',params:[{id:'e',label:'Eccentric throw',min:10,max:40,step:1,value:26,fmt:v=>v+' mm'}],O:[220,280],L:250,
  update(phi){const e=this.P.e,c=[this.O[0]+e*Math.cos(phi),this.O[1]+e*Math.sin(phi)];const x=c[0]+Math.sqrt(this.L**2-(c[1]-this.O[1])**2);this.g={phi,e,c,x};},
  output(){return this.g.x-(this.O[0]+this.L);},
  draw(){const g=this.g,O=this.O,y=O[1];
    circ(g.c[0],g.c[1],78);paint(C.part2,C.ink);circ(g.c[0],g.c[1],64);circ(O[0],O[1],10,false);paint(C['brass-fill'],C.ink);pivot(O[0],O[1],6);
    bar(g.c[0]+70,g.c[1],g.x,y,14,C.part);
    ctx.beginPath();ctx.rect(560,y-40,180,80);paint(C.part,C.ink);
    [600,700].forEach(px=>{ctx.beginPath();ctx.rect(px-8,y+40,16,40);paint(C.hi,C.ink);});ctx.beginPath();ctx.rect(642,y+40,16,40);paint(C.hi,C.ink);
    const vx=g.x+150;bar(g.x,y,vx,y,8,C.part2);ctx.beginPath();ctx.rect(vx-50,y+8,100,32);paint(C['steel-fill'],C.ink);
    label('ECCENTRIC',O[0],O[1]+120,'center');label('SLIDE VALVE',650,y-56,'center');label('STEAM PORTS',650,y+96,'center');},
  reads(){const g=this.g;return[['Valve travel',`${2*g.e} mm`],['Valve position',`${(g.x-(this.O[0]+this.L)).toFixed(1)} mm`]];}});

/* 92 crank and connecting rod */
reg({num:92,outLabel:'Piston position, mm',params:[{id:'r',label:'Crank radius',min:40,max:90,step:5,value:70,fmt:v=>v+' mm'},{id:'L',label:'Connecting rod',min:160,max:300,step:10,value:220,fmt:v=>v+' mm'}],O:[200,270],
  update(phi){const r=this.P.r,L=this.P.L,pin=[this.O[0]+r*Math.cos(phi),this.O[1]+r*Math.sin(phi)];const x=pin[0]+Math.sqrt(L*L-(pin[1]-this.O[1])**2);this.g={phi,pin,x,r,L};},
  output(){return this.g.x-this.O[0];},
  draw(){const g=this.g,O=this.O,y=O[1];
    circ(O[0],O[1],120);paint(C.part,C.ink);for(let k=0;k<5;k++){const a=g.phi+k*TAU/5;bar(O[0]+18*Math.cos(a),O[1]+18*Math.sin(a),O[0]+110*Math.cos(a),O[1]+110*Math.sin(a),9,C.part2);}
    bar(O[0],O[1],g.pin[0],g.pin[1],22,C['brass-fill']);
    const cx0=O[0]+g.L-g.r-30;ctx.beginPath();ctx.rect(cx0,y-46,330,10);ctx.rect(cx0,y+36,330,10);ctx.rect(cx0+320,y-46,10,92);paint(C.part2,C.ink);
    ctx.beginPath();ctx.rect(g.x,y-36,70,72);paint(C['steel-fill'],C.ink);
    bar(g.pin[0],g.pin[1],g.x+20,y,14,C.part);pivot(g.pin[0],g.pin[1],5);pivot(g.x+20,y,5);pivot(O[0],O[1],6);
    label('FLYWHEEL',O[0],O[1]+140,'center');label('PISTON',g.x+35,y+66,'center');},
  reads(v){const g=this.g;return[['Stroke',`${2*g.r} mm`],['Crank angle',`${mod(g.phi*180/PI,360).toFixed(0)}°`],['Piston speed',`${v.toFixed(0)} mm/s`]];}});

/* 93 scotch yoke */
reg({num:93,outLabel:'Slide position, mm',O:[400,260],r:90,
  update(phi){this.g={phi,pin:[this.O[0]+this.r*Math.cos(phi),this.O[1]+this.r*Math.sin(phi)]};},output(){return this.g.pin[0]-this.O[0];},
  draw(){const g=this.g,O=this.O,x=g.pin[0];
    circ(O[0],O[1],112);paint(C['brass-fill'],C.ink);bar(O[0],O[1],g.pin[0],g.pin[1],18,C.part2);
    ctx.beginPath();ctx.rect(x-16,O[1]-140,32,280);ctx.rect(x-7,O[1]-120,14,240);paint(C['steel-fill'],C.ink);
    bar(40+x-O[0],O[1],x-16,O[1],16,C['steel-fill']);bar(x+16,O[1],760+x-O[0],O[1],16,C['steel-fill']);
    for(const gx of [60,740]){ctx.beginPath();ctx.rect(gx-24,O[1]-24,48,12);ctx.rect(gx-24,O[1]+12,48,12);paint(C.part,C.ink);}
    ctx.beginPath();ctx.rect(g.pin[0]-9,g.pin[1]-9,18,18);paint(C.part,C.ink);pivot(g.pin[0],g.pin[1],4);pivot(O[0],O[1],6);label('SLOTTED YOKE',x+24,O[1]-150);},
  reads(v){const g=this.g;return[['Stroke',`${2*this.r} mm`],['Motion','pure sine wave'],['Slide speed',`${v.toFixed(0)} mm/s`]];}});

/* 96 heart cam */
reg({num:96,outLabel:'Follower height, mm',O:[400,330],
  r(t){t=mod(t+PI,TAU)-PI;return 60+70*Math.abs(t)/PI;},
  update(phi){const t=-PI/2-phi;const r=this.r(t);this.g={phi,h:r};},output(){return this.g.h-60;},
  draw(){const g=this.g,O=this.O,pts=[];for(let i=0;i<240;i++){const s=i/240*TAU-PI;const r=this.r(s);pts.push([O[0]+r*Math.cos(s+g.phi),O[1]+r*Math.sin(s+g.phi)]);}
    poly(pts);ctx.closePath();circ(O[0],O[1],8,false);paint(C['brass-fill'],C.ink);pivot(O[0],O[1],6);
    const y=O[1]-g.h-14;ctx.beginPath();ctx.rect(O[0]-8,y-200,16,200);paint(C['steel-fill'],C.ink);circ(O[0],y,14);paint(C['steel-fill'],C.ink);pivot(O[0],y,4);
    for(const gy of [90,150]){ctx.beginPath();ctx.rect(O[0]-28,gy,12,26);ctx.rect(O[0]+16,gy,12,26);paint(C.part,C.ink);}
    label('HEART CAM',O[0]+150,O[1]+60);label('FOLLOWER',O[0]+40,y-60);},
  reads(v){const g=this.g;return[['Stroke','140 mm'],['Follower speed',`${Math.abs(v).toFixed(0)} mm/s`],['Motion','steady up, steady down']];}});

/* 100 quick return */
reg({num:100,outLabel:'Ram position, mm',params:[{id:'r',label:'Crank radius',min:50,max:110,step:5,value:85,fmt:v=>v+' mm'}],O2:[400,320],O1:[400,490],yr:110,
  update(phi){const r=this.P.r,P=[this.O2[0]+r*Math.cos(phi),this.O2[1]+r*Math.sin(phi)];const l=Math.atan2(P[0]-this.O1[0],this.O1[1]-P[1]);const xr=this.O1[0]+(this.O1[1]-this.yr)*Math.tan(l);this.g={phi,P,l,xr,r};},
  output(){return this.g.xr-this.O1[0];},
  draw(){const g=this.g,O1=this.O1,O2=this.O2,top=[O1[0]+400*Math.sin(g.l),O1[1]-400*Math.cos(g.l)];
    ctx.beginPath();ctx.rect(g.xr-250,this.yr-14,440,28);paint(C['steel-fill'],C.ink);ctx.beginPath();ctx.moveTo(g.xr+190,this.yr+14);ctx.lineTo(g.xr+210,this.yr+44);ctx.lineTo(g.xr+176,this.yr+14);ctx.closePath();paint(C['steel-fill'],C.ink);
    for(const gx of [120,680]){ctx.beginPath();ctx.rect(gx-30,this.yr-26,60,10);ctx.rect(gx-30,this.yr+16,60,10);paint(C.part,C.ink);}
    circ(O2[0],O2[1],g.r+24);paint(C['brass-fill'],C.ink);
    ctx.save();ctx.translate(O1[0],O1[1]);ctx.rotate(g.l);ctx.beginPath();capsule(0,0,0,-(O1[1]-this.yr)/Math.cos(g.l)-10,14);capsule(0,-30,0,-300,6);paint(C.part2,C.ink);ctx.restore();
    ctx.save();ctx.translate(g.P[0],g.P[1]);ctx.rotate(g.l);ctx.beginPath();ctx.rect(-9,-16,18,32);paint(C.part,C.ink);ctx.restore();
    ctx.beginPath();ctx.rect(g.xr-9,this.yr-9,18,18);paint(C.part,C.ink);
    pivot(g.P[0],g.P[1],4);pivot(O2[0],O2[1],6);pivot(O1[0],O1[1],6);ground(O1[0],O1[1]+12,60);label('RAM WITH TOOL',g.xr+30,this.yr-30);label('SLOTTED LEVER',O1[0]+70,O1[1]-40);},
  reads(v){const r=this.P.r,d=this.O1[1]-this.O2[1],b=Math.asin(Math.min(0.999,r/d));const cut=PI+2*b,ret=PI-2*b;
    return[['Cutting : return time',`${(cut/ret).toFixed(2)} : 1`],['Ram speed',`${v.toFixed(0)} mm/s`],['Ram stroke',`${(2*(this.O1[1]-this.yr)*Math.tan(b)).toFixed(0)} mm`]];}});

/* 102 screw and nut */
reg({num:102,outLabel:'Nut position, mm',p:24,
  update(phi){const th=6*PI*Math.sin(phi);this.g={phi,th,x:th/TAU*this.p};},output(){return this.g.x;},
  draw(){const g=this.g,y=260,r=22,p=this.p;
    ctx.beginPath();ctx.rect(140,y-r,520,2*r);paint(C['brass-fill'],C.ink);ctx.save();ctx.beginPath();ctx.rect(140,y-r,520,2*r);ctx.clip();ctx.strokeStyle=C.ink;ctx.lineWidth=2;
    const sh=mod(g.th/TAU*p,p);for(let x=140-p+sh;x<680;x+=p){ctx.beginPath();ctx.moveTo(x,y-r);ctx.lineTo(x+p/2,y+r);ctx.stroke();}ctx.restore();
    circ(110,y,46);paint(C['brass-fill'],C.ink);for(let k=0;k<3;k++){const a=g.th+k*TAU/3;bar(110,y,110+40*Math.cos(a),y+40*Math.sin(a),6,C.part2);}pivot(110,y,6);
    const nx=400+g.x;ctx.beginPath();ctx.rect(nx-36,y-46,72,92);paint(C['steel-fill'],C.ink);ctx.beginPath();ctx.rect(nx-36,y+46,72,30);paint(C['steel-fill'],C.ink);
    ctx.beginPath();ctx.rect(150,y+76,500,10);paint(C.part2,C.ink);ctx.beginPath();ctx.rect(660,y-30,16,60);paint(C.part2,C.ink);
    label('NUT · slides, cannot turn',nx,y-64,'center');label('HANDWHEEL',110,y+70,'center');},
  reads(){const g=this.g;return[['Pitch',`${this.p} mm per turn`],['Screw turns',`${(g.th/TAU).toFixed(2)}`],['Nut travel',`${g.x.toFixed(1)} mm`]];}});

/* 113 rack and pinion */
reg({num:113,outLabel:'Rack position, mm',
  update(phi){const th=1.5*Math.sin(phi);this.g={phi,th,x:-60*th};},output(){return this.g.x;},
  draw(){const g=this.g,P=[400,220],m=6,p=PI*m,y=P[1]+60;
    const pts=rackTeeth(40,760,400+g.x,p,y,m,false);poly([[40,y+40],[40,y+1.25*m],...pts,[760,y+1.25*m],[760,y+40]]);ctx.closePath();paint(C['steel-fill'],C.ink);
    drawGear(P[0],P[1],60,20,g.th+PI/2+PI/20,C['brass-fill'],{bore:8});pivot(P[0],P[1],6);
    linArrow(400,y+66,g.x>0?40:-40,C.steel);label('PINION',P[0]+80,P[1]-60);label('RACK',90,y+60);},
  reads(v){const g=this.g;return[['Pinion angle',`${(g.th*180/PI).toFixed(0)}°`],['Rack travel',`${g.x.toFixed(1)} mm`],['Per pinion turn',`${(TAU*60).toFixed(0)} mm`]];}});

/* 118 stroke doubler */
reg({num:118,outLabel:'Top rack position, mm',O:[150,250],r:65,L:210,
  update(phi){const pin=[this.O[0]+this.r*Math.cos(phi),this.O[1]+this.r*Math.sin(phi)];const cx=pin[0]+Math.sqrt(this.L**2-(pin[1]-this.O[1])**2);const c0=this.O[0]+this.L;this.g={phi,pin,cx,d:cx-c0};},
  output(){return 2*this.g.d;},
  draw(){const g=this.g,O=this.O,y=O[1],m=5,p=PI*m,r=40,c0=O[0]+this.L;
    const lo=rackTeeth(260,760,c0,p,y+r,m,false);poly([[260,y+r+30],[260,y+r+1.25*m],...lo,[760,y+r+1.25*m],[760,y+r+30]]);ctx.closePath();paint(C.part2,C.ink);ground(510,y+r+30,500);
    const ux=2*g.d,up=rackTeeth(250+ux,760+ux,c0+ux,p,y-r,m,true);poly([[250+ux,y-r-30],[250+ux,y-r-1.25*m],...up,[760+ux,y-r-1.25*m],[760+ux,y-r-30]]);ctx.closePath();paint(C['steel-fill'],C.ink);
    drawGear(g.cx,y,r,16,g.d/r+PI/2+PI/16,C['brass-fill'],{bore:6});
    circ(O[0],O[1],this.r+20);paint(C.part,C.ink);bar(O[0],O[1],g.pin[0],g.pin[1],16,C.part2);bar(g.pin[0],g.pin[1],g.cx,y,12,C.part);pivot(g.pin[0],g.pin[1],4);pivot(g.cx,y,5);pivot(O[0],O[1],6);
    label('MOVING RACK · double stroke',520,y-r-50,'center');label('FIXED RACK',520,y+r+50,'center');},
  reads(){const g=this.g;return[['Crank stroke',`${2*this.r} mm`],['Rack stroke',`${4*this.r} mm`],['Top rack',`${(2*g.d).toFixed(0)} mm`]];}});

/* 126 bell crank */
reg({num:126,outLabel:'Output rod position, mm',params:[{id:'b',label:'Output arm length',min:70,max:180,step:10,value:130,fmt:v=>v+' mm (input arm 130)'}],P0:[400,300],
  update(phi){const t=0.38*Math.sin(phi);this.g={phi,t};},output(){return -this.P.b*Math.sin(this.g.t);},
  draw(){const g=this.g,P=this.P0,b=this.P.b,A=[P[0]-130*Math.cos(g.t),P[1]-130*Math.sin(g.t)],B=[P[0]+b*Math.sin(g.t),P[1]-b*Math.cos(g.t)];
    ctx.beginPath();capsule(A[0],A[1],P[0],P[1],12);capsule(P[0],P[1],B[0],B[1],12);paint(C['brass-fill'],C.ink);
    bar(A[0],A[1],A[0],480,8,C.part);ctx.beginPath();ctx.rect(A[0]-14,470,28,24);paint(C['brass-fill'],C.ink);
    bar(B[0],B[1],760,B[1],8,C['steel-fill']);for(const gx of [700]){ctx.beginPath();ctx.rect(gx-20,B[1]-18,40,8);ctx.rect(gx-20,B[1]+10,40,8);paint(C.part,C.ink);}
    pivot(A[0],A[1],5);pivot(B[0],B[1],5);pivot(P[0],P[1],7);ground(P[0],P[1]+40,60);ctx.beginPath();ctx.rect(P[0]-8,P[1],16,40);paint(C.part2,C.ink);pivot(P[0],P[1],7);
    label('PULL DOWN',A[0]-24,488,'right');label('MOVES SIDEWAYS',620,B[1]-30);},
  reads(){const g=this.g,b=this.P.b;return[['Input travel',`${(-130*Math.sin(g.t)).toFixed(0)} mm`],['Output travel',`${(-b*Math.sin(g.t)).toFixed(0)} mm`],['Force ratio',`${(130/b).toFixed(2)} : 1`],['Direction turned','90°']];}});

/* 140 toggle joint */
reg({num:140,outLabel:'Press head position, mm',L:150,T:[400,70],
  update(phi){const k=6+110*(1+Math.cos(phi))/2,h=Math.sqrt(this.L**2-k*k);this.g={phi,k,h,Y:this.T[1]+2*h};},output(){return this.g.Y-this.T[1];},
  draw(){const g=this.g,T=this.T,K=[T[0]-g.k,T[1]+g.h],Y=g.Y;
    ctx.beginPath();ctx.rect(T[0]-80,T[1]-30,160,30);paint(C.part2,C.ink);
    for(const gx of [T[0]-70,T[0]+70]){ctx.beginPath();ctx.rect(gx-8,T[1],16,440);paint(C.part,C.ink);}
    bar(T[0],T[1],K[0],K[1],18,C['brass-fill']);bar(K[0],K[1],T[0],Y,18,C['brass-fill']);
    ctx.beginPath();ctx.rect(T[0]-60,Y,120,30);paint(C['steel-fill'],C.ink);ctx.beginPath();ctx.rect(T[0]-6,Y+30,12,24);paint(C['steel-fill'],C.ink);
    hatchRect(T[0]-90,410,180,16,C.part);ctx.beginPath();ctx.rect(T[0]-100,426,200,60);paint(C.part2,C.ink);
    bar(80,K[1],K[0],K[1],8,C.part);linArrow(120,K[1]-24,40,C.brass);
    pivot(T[0],T[1],6);pivot(K[0],K[1],6);pivot(T[0],Y,5);label('PUSH HERE',90,K[1]-40);label('STRAIGHTENING LINKS',T[0]+90,T[1]+g.h);},
  reads(){const g=this.g;return[['Knee offset',`${g.k.toFixed(0)} mm`],['Force multiplier',`× ${(g.h/(2*g.k)).toFixed(1)}`],['Note','grows huge as the links straighten']];}});

/* 141 band saw */
reg({num:141,outLabel:'Blade travel, m',
  update(phi){this.g={phi,s:90*phi};},output(){return this.g.s/1000;},
  draw(){const g=this.g,A=[400,110],B=[400,420],r=90;const pts=beltPoly(A[0],A[1],r,B[0],B[1],r,false,3);
    circ(A[0],A[1],r+6);paint(C.part,C.ink);circ(B[0],B[1],r+6);paint(C['brass-fill'],C.ink);
    ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(...pts[0]);for(const p of pts)ctx.lineTo(...p);ctx.closePath();ctx.stroke();ctx.restore();
    const ap=alongPoly(pts);ctx.save();ctx.fillStyle=C.ink;for(let s=0;s<ap.total;s+=14){const q=ap.at(s-g.s);ctx.save();ctx.translate(q[0],q[1]);ctx.rotate(q[2]);ctx.beginPath();ctx.moveTo(-4,0);ctx.lineTo(0,-5);ctx.lineTo(3,0);ctx.closePath();ctx.fill();ctx.restore();}ctx.restore();
    pulley(A[0],A[1],r-8,-g.phi,C.part);pulley(B[0],B[1],r-8,-g.phi,C['brass-fill']);
    ctx.beginPath();ctx.rect(200,262,400,14);paint(C.part2,C.ink);hatchRect(220,222,90,40,C['steel-fill']);label('TABLE',610,290);label('BLADE · endless band',530,110);},
  reads(v){return[['Blade speed',`${(v*1000).toFixed(0)} mm/s`],['Cutting run','straight, always downward']];}});

/* 144 lazy tongs */
reg({num:144,outLabel:'Reach, mm',L:120,n:4,
  update(phi){const th=0.35+0.85*(1+Math.cos(phi))/2;this.g={phi,th};},output(){return this.n*this.L*Math.cos(this.g.th);},
  draw(){const g=this.g,L=this.L,dx=L*Math.cos(g.th),dy=L/2*Math.sin(g.th),x0=150,y0=260;
    for(let i=0;i<this.n;i++){const xa=x0+i*dx,xb=xa+dx;bar(xa,y0-dy,xb,y0+dy,9,C['brass-fill']);bar(xa,y0+dy,xb,y0-dy,9,C.part);pivot((xa+xb)/2,y0,3.5);pivot(xa,y0-dy,3.5);pivot(xa,y0+dy,3.5);}
    const xe=x0+this.n*dx;pivot(xe,y0-dy,3.5);pivot(xe,y0+dy,3.5);ctx.beginPath();ctx.moveTo(xe,y0-dy);ctx.lineTo(xe+30,y0-6);ctx.lineTo(xe+30,y0+6);ctx.lineTo(xe,y0+dy);paint(null,C.ink,3);
    bar(x0,y0-dy,x0-70,y0-dy-30,10,C.part2);bar(x0,y0+dy,x0-70,y0+dy+30,10,C.part2);label('HANDLES',x0-70,y0,'center');label('GRIPPER',xe+40,y0);},
  reads(){const g=this.g;return[['Reach',`${(this.n*this.L*Math.cos(g.th)).toFixed(0)} mm`],['Cells','4'],['Handle motion amplified','about × 4']];}});

/* 145 beam engine */
reg({num:145,outLabel:'Piston height, mm',Bp:[400,140],Lb:170,O:[570,390],r:70,Lr:250,
  update(phi){const pin=[this.O[0]+this.r*Math.cos(phi),this.O[1]+this.r*Math.sin(phi)];const E=cc(this.Bp,this.Lb,pin,this.Lr,-1);const F=[2*this.Bp[0]-E[0],2*this.Bp[1]-E[1]];this.g={phi,pin,E,F};},
  output(){return 140-this.g.F[1];},
  draw(){const g=this.g,O=this.O,Bp=this.Bp;
    circ(O[0],O[1],125);paint(C.part,C.ink);for(let k=0;k<6;k++){const a=g.phi+k*PI/3;bar(O[0],O[1],O[0]+115*Math.cos(a),O[1]+115*Math.sin(a),8,C.part2);}
    bar(O[0],O[1],g.pin[0],g.pin[1],16,C['brass-fill']);
    ctx.beginPath();ctx.rect(g.F[0]-50,300,100,170);paint(C.part2,C.ink);ctx.beginPath();ctx.rect(g.F[0]-38,g.F[1]+150,76,30);paint(C['steel-fill'],C.ink);
    bar(g.F[0],g.F[1],g.F[0],g.F[1]+150,10,C.part);
    ctx.beginPath();capsule(g.F[0],g.F[1],g.E[0],g.E[1],14);paint(C['steel-fill'],C.ink);
    bar(g.E[0],g.E[1],g.pin[0],g.pin[1],12,C.part);ctx.beginPath();ctx.rect(Bp[0]-14,Bp[1],28,330);paint(C.part2,C.ink);ground(Bp[0],Bp[1]+330,70);
    for(const p of [g.E,g.F,g.pin])pivot(p[0],p[1],4.5);pivot(Bp[0],Bp[1],7);pivot(O[0],O[1],6);
    label('CYLINDER',g.F[0],490,'center');label('BEAM',Bp[0]-30,Bp[1]-30);label('FLYWHEEL',O[0],O[1]+140,'center');},
  reads(){const g=this.g;return[['Crank angle',`${mod(g.phi*180/PI,360).toFixed(0)}°`],['Piston stroke','≈ 140 mm'],['Beam angle',`${(Math.atan2(g.E[1]-this.Bp[1],g.E[0]-this.Bp[0])*180/PI).toFixed(1)}°`]];}});

/* 152 ellipsograph */
reg({num:152,outLabel:'Pencil height, mm',O:[400,270],p:110,q:90,
  reset(){this.trail=[];},
  update(phi){const O=this.O,H=[O[0]+this.p*Math.cos(phi),O[1]],V=[O[0],O[1]-this.p*Math.sin(phi)],k=1+this.q/this.p,P=[H[0]+(V[0]-H[0])*k,H[1]+(V[1]-H[1])*k];this.g={phi,H,V,P};this.trail=this.trail||[];this.trail.push(P);if(this.trail.length>400)this.trail.shift();},
  output(){return this.O[1]-this.g.P[1];},
  draw(){const g=this.g,O=this.O;
    ctx.save();ctx.strokeStyle=C.rule;ctx.setLineDash([4,4]);ctx.beginPath();ctx.ellipse(O[0],O[1],this.q,this.p+this.q,0,0,TAU);ctx.stroke();ctx.restore();
    ctx.beginPath();ctx.rect(O[0]-170,O[1]-16,340,32);ctx.rect(O[0]-16,O[1]-230,32,460);paint(C.part,C.ink);
    ctx.beginPath();ctx.rect(O[0]-160,O[1]-6,320,12);ctx.rect(O[0]-6,O[1]-220,12,440);paint(C.hi,C.ink);
    if(this.trail.length>1){ctx.save();ctx.strokeStyle=C.steel;ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(...this.trail[0]);for(const p of this.trail)ctx.lineTo(...p);ctx.stroke();ctx.restore();}
    bar(g.H[0],g.H[1],g.P[0],g.P[1],10,C['brass-fill']);for(const s of [g.H,g.V]){ctx.beginPath();ctx.rect(s[0]-10,s[1]-10,20,20);paint(C.part2,C.ink);}
    circ(g.P[0],g.P[1],6);paint(C.steel,C.ink);label('PENCIL',g.P[0]+12,g.P[1]-10);},
  reads(){return[['Semi-axes',`${this.q} and ${this.p+this.q} mm`],['Sliders','one in each groove']];}});

/* 158 treadle and crank */
reg({num:158,outLabel:'Treadle angle, degrees',Pv:[150,440],O:[420,220],r:60,Lt:220,Lr:215,
  update(phi){const pin=[this.O[0]+this.r*Math.cos(phi),this.O[1]+this.r*Math.sin(phi)];const Q=cc(this.Pv,this.Lt,pin,this.Lr,1);this.g={phi,pin,Q,a:Math.atan2(Q[1]-this.Pv[1],Q[0]-this.Pv[0])};},
  output(){return -this.g.a*180/PI;},
  draw(){const g=this.g,O=this.O,Pv=this.Pv;
    circ(O[0],O[1],130);paint(C.part,C.ink);for(let k=0;k<6;k++){const a=g.phi+k*PI/3;bar(O[0],O[1],O[0]+120*Math.cos(a),O[1]+120*Math.sin(a),8,C.part2);}
    bar(O[0],O[1],g.pin[0],g.pin[1],14,C['steel-fill']);
    const T=[Pv[0]+300*Math.cos(g.a),Pv[1]+300*Math.sin(g.a)];bar(Pv[0],Pv[1],T[0],T[1],20,C['brass-fill']);
    bar(g.Q[0],g.Q[1],g.pin[0],g.pin[1],8,C.part);pivot(g.Q[0],g.Q[1],4);pivot(g.pin[0],g.pin[1],4);pivot(O[0],O[1],6);pivot(Pv[0],Pv[1],6);ground(Pv[0],Pv[1]+12,50);
    label('TREADLE · foot',Pv[0]+150,Pv[1]+50);label('FLYWHEEL',O[0],O[1]-150,'center');},
  reads(){const g=this.g;return[['Treadle angle',`${(-g.a*180/PI).toFixed(1)}°`],['Flywheel turns',`${(g.phi/TAU).toFixed(2)}`]];}});

/* 161 flyball governor */
reg({num:161,outLabel:'Sleeve height, mm',params:[{id:'s',label:'Engine speed',min:0,max:100,step:1,value:60,fmt:v=>v+' %'}],X:400,top:90,L:130,
  update(phi){const th=(18+44*this.P.s/100)*PI/180;const rm=this.L/2*Math.sin(th),ym=this.top+this.L/2*Math.cos(th);const sy=ym+Math.sqrt(70*70-rm*rm);this.g={phi,th,sy};},
  output(){return 300-this.g.sy;},
  draw(){const g=this.g,X=this.X,T=this.top,L=this.L;
    ctx.beginPath();ctx.rect(X-6,T-30,12,420);paint(C.part,C.ink);
    const balls=[0,1].map(k=>{const a=g.phi+k*PI,R=L*Math.sin(g.th);return{x:X+R*Math.cos(a),z:Math.sin(a),y:T+L*Math.cos(g.th),mx:X+R/2*Math.cos(a)};}).sort((a,b)=>a.z-b.z);
    for(const b of balls){ctx.save();ctx.globalAlpha=b.z<0?.55:1;bar(X,T,b.x,b.y,6,C.part2);bar(b.mx,(T+b.y)/2,X,g.sy,5,C.part);circ(b.x,b.y,22+4*b.z);paint(C['brass-fill'],C.ink);ctx.restore();}
    ctx.beginPath();ctx.rect(X-16,g.sy-8,32,24);paint(C['steel-fill'],C.ink);
    const lv=[X+40,g.sy+4];bar(X+12,g.sy+4,560,300+(g.sy-300)*0.6,6,C['steel-fill']);pivot(470,300+(g.sy-300)*0.3,4);
    const open=clamp((g.sy-230)/80,0,1);ctx.beginPath();ctx.rect(560,360,180,50);ctx.rect(560,368,180,34);paint(C.part2,C.ink);ctx.save();ctx.translate(650,385);ctx.rotate(-PI/2+open*PI/2);ctx.beginPath();ctx.rect(-3,-17,6,34);paint(C.steel,C.ink);ctx.restore();
    bar(560,300+(g.sy-300)*0.6,650,385,4,C.part);
    ctx.beginPath();ctx.moveTo(X-40,480);ctx.lineTo(X+40,480);ctx.lineTo(X+20,440);ctx.lineTo(X-20,440);ctx.closePath();paint(C.part2,C.ink);
    label('THROTTLE VALVE',650,430,'center');label('SLEEVE',X-30,g.sy+4,'right');},
  reads(){const g=this.g,open=clamp((g.sy-230)/80,0,1);return[['Ball angle',`${(g.th*180/PI).toFixed(0)}°`],['Throttle',`${(open*100).toFixed(0)} % open`],['Rule','faster spin closes the valve']];}});

/* 211 Geneva drive */
reg({num:211,outLabel:'Geneva wheel, turns',D:[290,260],R:100,
  update(phi){const a=mod(phi+PI,TAU)-PI,n=Math.round((phi-a)/TAU),d=this.R*Math.SQRT2,W=[this.D[0]+d,this.D[1]];const pin=[this.D[0]+this.R*Math.cos(phi),this.D[1]+this.R*Math.sin(phi)];let w;
    if(Math.abs(a)<PI/4){let b=Math.atan2(pin[1]-W[1],pin[0]-W[0]);b=mod(b,TAU);w=-n*PI/2+(b-PI);}else if(a>=PI/4)w=-n*PI/2-PI/4;else w=-n*PI/2+PI/4;
    this.g={phi,W,pin,w,eng:Math.abs(a)<PI/4};},
  output(){return -this.g.w/TAU;},
  draw(){const g=this.g,D=this.D,W=g.W,R=this.R,d=R*Math.SQRT2,rl=72;
    const pts=[];for(let i=0;i<360;i++){const t=i/360*TAU;let r=R+2;for(let k=0;k<4;k++){const ca=g.w+PI/4+k*PI/2,cx=W[0]+d*Math.cos(ca),cy=W[1]+d*Math.sin(ca);
        const ux=Math.cos(t),uy=Math.sin(t),ox=W[0]-cx,oy=W[1]-cy,bq=ox*ux+oy*uy,cq=ox*ox+oy*oy-(rl+3)**2,disc=bq*bq-cq;if(disc>0){const t1=-bq-Math.sqrt(disc);if(t1>0&&t1<r)r=t1;}}
      pts.push([W[0]+r*Math.cos(t),W[1]+r*Math.sin(t)]);}
    poly(pts);ctx.closePath();paint(C['steel-fill'],C.ink);
    for(let k=0;k<4;k++){const a=g.w+PI+k*PI/2;ctx.save();ctx.translate(W[0],W[1]);ctx.rotate(a);ctx.beginPath();ctx.rect(d-R-12,-9,R+30,18);ctx.fillStyle=C.sheet;ctx.fill();ctx.strokeStyle=C.ink;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(R+20,-9);ctx.lineTo(d-R-3,-9);ctx.arc(d-R-3,0,9,-PI/2,PI/2,true);ctx.lineTo(R+20,9);ctx.stroke();ctx.restore();}
    pivot(W[0],W[1],6);
    const cut=g.phi;ctx.beginPath();ctx.arc(D[0],D[1],rl,cut+0.9,cut-0.9+TAU);ctx.arc(D[0]+R*Math.cos(cut)*0.75,D[1]+R*Math.sin(cut)*0.75,42,cut+PI-0.75,cut+PI+0.75,true);ctx.closePath();paint(C['brass-fill'],C.ink);
    bar(D[0],D[1],g.pin[0],g.pin[1],18,C['brass-fill']);circ(g.pin[0],g.pin[1],8);paint(C.part2,C.ink);pivot(D[0],D[1],6);
    label(g.eng?'PIN DRIVING':'WHEEL LOCKED',W[0],W[1]+140,'center');label('DRIVER',D[0],D[1]+140,'center');},
  reads(){const g=this.g;return[['Slots','4'],['Per driver turn','¼ turn'],['Phase',g.eng?'moving':'locked'],['Wheel angle',`${mod(-g.w*180/PI,360).toFixed(0)}°`]];}});

/* 231 drag link */
reg({num:231,outLabel:'Output lead / lag, degrees',A:[340,270],D:[390,270],a:120,b:130,c:120,
  update(phi){const B=[this.A[0]+this.a*Math.cos(phi),this.A[1]+this.a*Math.sin(phi)];const c1=cc(B,this.b,this.D,this.c,1),c2=cc(B,this.b,this.D,this.c,-1);const prev=this.g&&this.g.C;let C2=c1;
    if(prev){if(Math.hypot(c2[0]-prev[0],c2[1]-prev[1])<Math.hypot(c1[0]-prev[0],c1[1]-prev[1]))C2=c2;}else{const t1=Math.atan2(c1[1]-this.D[1],c1[0]-this.D[0]);C2=Math.cos(t1-phi)>0?c1:c2;}
    let t=Math.atan2(C2[1]-this.D[1],C2[0]-this.D[0]);t+=TAU*Math.round((phi-t)/TAU);this.g={phi,B,C:C2,t};},
  output(){return (this.g.t-this.g.phi)*180/PI;},
  draw(){const g=this.g,A=this.A,D=this.D;
    circ(A[0],A[1],this.a+10);paint(null,C.rule,1);circ(D[0],D[1],this.c+10);paint(null,C.rule,1);
    bar(A[0],A[1],g.B[0],g.B[1],16,C['brass-fill']);bar(D[0],D[1],g.C[0],g.C[1],16,C['steel-fill']);bar(g.B[0],g.B[1],g.C[0],g.C[1],10,C.part);
    for(const p of [g.B,g.C])pivot(p[0],p[1],5);pivot(A[0],A[1],6);pivot(D[0],D[1],6);ground(365,300,90);label('INPUT · steady',A[0]-150,A[1]-150);label('OUTPUT · uneven',D[0]+100,D[1]+150);},
  reads(){const g=this.g;return[['Lead / lag',`${((g.t-g.phi)*180/PI).toFixed(1)}°`],['Both cranks','turn all the way round']];}});

/* 232 ratchet and pawl */
reg({num:232,outLabel:'Wheel angle, degrees',N:20,
  reset(){this.W=0;this.lim=null;this.lastq=null;},
  update(phi){const p=TAU/this.N,a=0.42*Math.sin(phi);const q=a-this.W;if(this.lastq===null){this.lim=Math.ceil(q/p)*p;}
    if(this.lastq!==null&&q>this.lastq){if(q>this.lim){this.W+=q-this.lim;}}else{this.lim=Math.ceil((q-1e-6)/p)*p;}this.lastq=a-this.W;this.g={phi,a};},
  output(){return this.W*180/PI;},
  prof(rel){const p=TAU/this.N;return 92+20*(mod(-rel,p)/p);},
  draw(){const g=this.g,Cc=[400,300],p=TAU/this.N;const pts=[];for(let i=0;i<this.N;i++){const f=this.W+i*p-PI/2;pts.push([Cc[0]+92*Math.cos(f),Cc[1]+92*Math.sin(f)]);pts.push([Cc[0]+112*Math.cos(f-p+0.01),Cc[1]+112*Math.sin(f-p+0.01)]);}
    const ring=[];for(let i=0;i<this.N;i++){const f=this.W+i*p-PI/2;ring.push([Cc[0]+112*Math.cos(f-0.005),Cc[1]+112*Math.sin(f-0.005)]);ring.push([Cc[0]+92*Math.cos(f),Cc[1]+92*Math.sin(f)]);}
    ring.reverse();poly(ring);ctx.closePath();circ(Cc[0],Cc[1],12,false);paint(C['steel-fill'],C.ink);
    for(let k=0;k<4;k++){const a=this.W+k*PI/2;circ(Cc[0]+52*Math.cos(a),Cc[1]+52*Math.sin(a),12);paint(C.sheet,C.ink);}
    const arm=g.a-PI/2;bar(Cc[0],Cc[1],Cc[0]+220*Math.cos(arm),Cc[1]+220*Math.sin(arm),18,C['brass-fill']);
    const pv=[Cc[0]+150*Math.cos(arm-0.32),Cc[1]+150*Math.sin(arm-0.32)],rel=arm-(this.W-PI/2),rt=this.prof(rel)+2,tip=[Cc[0]+rt*Math.cos(arm),Cc[1]+rt*Math.sin(arm)];
    bar(pv[0],pv[1],tip[0],tip[1],10,C.part2);springZ(pv[0],pv[1],Cc[0]+200*Math.cos(arm-0.1),Cc[1]+200*Math.sin(arm-0.1),8,4);pivot(pv[0],pv[1],4);
    const cp=[Cc[0]+150,Cc[1]-40],ca=Math.atan2(cp[1]-Cc[1],cp[0]-Cc[0])-0.35,crel=ca-(this.W-PI/2),cr=this.prof(crel)+2;bar(cp[0],cp[1],Cc[0]+cr*Math.cos(ca),Cc[1]+cr*Math.sin(ca),10,C.part);pivot(cp[0],cp[1],5);ground(cp[0],cp[1]+14,30);
    pivot(Cc[0],Cc[1],6);label('PAWL',pv[0]-30,pv[1]-14,'right');label('HOLDING CLICK',cp[0]+20,cp[1]-20);label('LEVER',Cc[0]+220*Math.cos(arm)+10,Cc[1]+220*Math.sin(arm));},
  reads(){return[['Wheel turned',`${(this.W*180/PI).toFixed(0)}°`],['Teeth',`${this.N}`],['Rule','turns one way only']];}});

/* 246 pantograph */
reg({num:246,outLabel:'Pencil x, mm',O:[130,440],k:2.4,L:290,
  reset(){this.trail=[];this.ttrail=[];},
  fig(t){const c=[500,230],r=95+28*Math.cos(5*t);return[c[0]+r*Math.cos(t),c[1]+r*Math.sin(t)];},
  update(phi){const O=this.O,P=this.fig(phi),T=[O[0]+(P[0]-O[0])/this.k,O[1]+(P[1]-O[1])/this.k],A=cc(O,this.L,P,this.L,-1);this.g={phi,P,T,A};
    this.trail=this.trail||[];this.ttrail=this.ttrail||[];this.trail.push(P);this.ttrail.push(T);if(this.trail.length>500){this.trail.shift();this.ttrail.shift();}},
  output(){return this.g.P[0];},
  draw(){const g=this.g,O=this.O,k=this.k,B=[O[0]+(g.A[0]-O[0])/k,O[1]+(g.A[1]-O[1])/k],Cc=[g.A[0]+(g.P[0]-g.A[0])/k,g.A[1]+(g.P[1]-g.A[1])/k];
    ctx.save();ctx.strokeStyle=C.rule;ctx.lineWidth=1;ctx.setLineDash([4,4]);for(const sc of [1,1/k]){ctx.beginPath();for(let i=0;i<=200;i++){const p=this.fig(i/200*TAU),q=[O[0]+(p[0]-O[0])*sc,O[1]+(p[1]-O[1])*sc];i?ctx.lineTo(...q):ctx.moveTo(...q);}ctx.stroke();}ctx.restore();
    for(const [tr,col] of [[this.trail,C.steel],[this.ttrail,C.brass]]){if(tr.length>1){ctx.save();ctx.strokeStyle=col;ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(...tr[0]);for(const p of tr)ctx.lineTo(...p);ctx.stroke();ctx.restore();}}
    bar(O[0],O[1],g.A[0],g.A[1],9,C.part);bar(g.A[0],g.A[1],g.P[0],g.P[1],9,C.part);bar(B[0],B[1],g.T[0],g.T[1],7,C.part2);bar(g.T[0],g.T[1],Cc[0],Cc[1],7,C.part2);
    for(const p of [g.A,B,Cc])pivot(p[0],p[1],4);pivot(O[0],O[1],6);ground(O[0],O[1]+12,40);
    circ(g.T[0],g.T[1],7);paint(C.brass,C.ink);circ(g.P[0],g.P[1],7);paint(C.steel,C.ink);label('TRACER',g.T[0]+12,g.T[1]+16);label('PENCIL',g.P[0]+12,g.P[1]-14);},
  reads(){return[['Scale',`× ${this.k}`],['Rule','pivot, tracer and pencil stay in line']];}});

/* 254 sprocket and chain */
reg({num:254,outLabel:'Chain travel, mm',
  update(phi){this.g={phi,s:70*phi};},output(){return this.g.s;},
  draw(){const g=this.g,A=[240,260],B=[570,260],r1=70,r2=46;const pts=beltPoly(A[0],A[1],r1+4,B[0],B[1],r2+4,false,3),ap=alongPoly(pts);
    drawGear(A[0],A[1],r1,22,g.phi,C['brass-fill'],{bore:8});drawGear(B[0],B[1],r2,14,g.phi*r1/r2,C['steel-fill'],{bore:7});
    const pitch=ap.total/Math.round(ap.total/20);for(let s=0;s<ap.total;s+=pitch){const q=ap.at(s+g.s),q2=ap.at(s+g.s+pitch);ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=7;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(q[0],q[1]);ctx.lineTo(q2[0],q2[1]);ctx.stroke();ctx.strokeStyle=C.part2;ctx.lineWidth=4;ctx.stroke();ctx.restore();circ(q[0],q[1],3);paint(C.hi,C.ink,1);}
    pivot(A[0],A[1],6);pivot(B[0],B[1],6);label('22 TEETH',A[0],A[1]+110,'center');label('14 TEETH',B[0],B[1]+110,'center');},
  reads(v){return[['Ratio','22 : 14'],['Chain speed',`${v.toFixed(0)} mm/s`],['Slip','none: teeth engage the links']];}});

/* 288 anchor escapement */
reg({num:288,outLabel:'Pendulum angle, degrees',N:30,
  update(phi){const th=0.13*Math.sin(phi);const u=phi/PI+0.5,k=Math.floor(u),f=u-k,s=clamp((f-0.42)/0.14,0,1);const st=s*s*(3-2*s);this.g={phi,th,W:-(k+st)*(TAU/this.N)/2};},
  output(){return this.g.th*180/PI;},
  draw(){const g=this.g,E=[400,330],A=[400,170],R=105,N=this.N;
    ctx.save();ctx.translate(A[0],A[1]);ctx.rotate(g.th);bar(0,0,0,330,6,C.part);circ(0,330,26);paint(C['brass-fill'],C.ink);ctx.restore();
    const pts=[];for(let i=0;i<N;i++){const a=g.W+i*TAU/N;pts.push([E[0]+82*Math.cos(a),E[1]+82*Math.sin(a)]);pts.push([E[0]+R*Math.cos(a+0.12),E[1]+R*Math.sin(a+0.12)]);pts.push([E[0]+80*Math.cos(a+TAU/N*0.8),E[1]+80*Math.sin(a+TAU/N*0.8)]);}
    poly(pts);ctx.closePath();circ(E[0],E[1],10,false);for(let k=0;k<5;k++){const a=g.W+k*TAU/5;circ(E[0]+46*Math.cos(a),E[1]+46*Math.sin(a),13,false);}paint(C['steel-fill'],C.ink);pivot(E[0],E[1],6);
    ctx.save();ctx.translate(A[0],A[1]);ctx.rotate(g.th);const L=[-92,150],Rr=[92,150];
    ctx.beginPath();ctx.moveTo(0,-14);ctx.quadraticCurveTo(-60,10,L[0],L[1]-30);ctx.lineTo(L[0]+6,L[1]+4);ctx.lineTo(L[0]+18,L[1]-6);ctx.quadraticCurveTo(-40,30,0,14);ctx.quadraticCurveTo(40,30,Rr[0]-18,Rr[1]-6);ctx.lineTo(Rr[0]-6,Rr[1]+4);ctx.lineTo(Rr[0],Rr[1]-30);ctx.quadraticCurveTo(60,10,0,-14);ctx.closePath();paint(C['brass-fill'],C.ink);ctx.restore();
    pivot(A[0],A[1],6);ground(A[0],A[1]-10,60,true);label('ANCHOR',A[0]+110,A[1]+40);label('ESCAPE WHEEL',E[0]+120,E[1]+60);label('PENDULUM',A[0]+30,A[1]+300);},
  reads(){const g=this.g;return[['Pendulum',`${(g.th*180/PI).toFixed(1)}°`],['Per swing','wheel releases half a tooth'],['Escape wheel',`${mod(-g.W*180/PI,360).toFixed(0)}°`]];}});

/* 315 conical pendulum */
reg({num:315,outLabel:'Bob x position, mm',
  update(phi){this.g={phi};},output(){return 300*Math.sin(0.42)*Math.cos(this.g.phi);},
  draw(){const g=this.g,P=[400,70],L=320,al=0.42,R=L*Math.sin(al),Y=P[1]+L*Math.cos(al),tilt=0.32;
    ctx.save();ctx.strokeStyle=C.rule;ctx.setLineDash([4,4]);ctx.beginPath();ctx.ellipse(P[0],Y,R,R*tilt,0,0,TAU);ctx.stroke();ctx.restore();
    const x=P[0]+R*Math.cos(g.phi),z=Math.sin(g.phi),y=Y+R*tilt*z;
    ctx.beginPath();ctx.rect(P[0]-6,20,12,150);paint(C.part,C.ink);const arm=[P[0]+60*Math.cos(g.phi),140+60*tilt*z];bar(P[0],140,arm[0],arm[1],7,C['brass-fill']);
    ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(P[0],P[1]);ctx.lineTo(x,y);ctx.stroke();ctx.restore();
    circ(x,y,20+4*z);paint(C['steel-fill'],C.ink);pivot(P[0],P[1],5);ground(P[0],20,60,true);label('BOB SWEEPS A CONE',P[0]+R+20,Y);label('DRIVING ARM',arm[0]+16,arm[1]);},
  reads(v){return[['Motion','steady circle, no ticking'],['Bob speed',`${Math.abs(v).toFixed(0)} mm/s (x)`]];}});

/* 329 Tusi couple */
reg({num:329,outLabel:'Slide position, mm',O:[400,270],
  update(phi){this.g={phi,C:[this.O[0]+75*Math.cos(phi),this.O[1]+75*Math.sin(phi)],P:[this.O[0]+150*Math.cos(phi),this.O[1]]};},output(){return this.g.P[0]-this.O[0];},
  draw(){const g=this.g,O=this.O;poly(gearPts(O[0],O[1],150,60,PI/60,true));ctx.closePath();circ(O[0],O[1],150+6.25+16,false);paint(C.part2,C.ink);
    ctx.save();ctx.strokeStyle=C.steel;ctx.setLineDash([6,4]);ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(O[0]-150,O[1]);ctx.lineTo(O[0]+150,O[1]);ctx.stroke();ctx.restore();
    drawGear(g.C[0],g.C[1],75,30,-g.phi,C['brass-fill'],{bore:8});bar(O[0],O[1],g.C[0],g.C[1],12,C.part);
    bar(g.P[0],g.P[1],g.P[0]+230,g.P[1],8,C['steel-fill']);ctx.beginPath();ctx.rect(g.P[0]+230-20,O[1]-16,40,32);paint(C['steel-fill'],C.ink);
    circ(g.P[0],g.P[1],7);paint(C.steel,C.ink);pivot(g.C[0],g.C[1],5);pivot(O[0],O[1],6);label('POINT MOVES IN A STRAIGHT LINE',O[0],O[1]+200,'center');},
  reads(){const g=this.g;return[['Inner gear','half the ring size'],['Slide',`${(g.P[0]-this.O[0]).toFixed(0)} mm`],['Stroke','= ring diameter']];}});

/* 335 Watt's linkage */
reg({num:335,outLabel:'Midpoint sideways error, mm',A:[170,190],D:[630,350],l:200,c:150,
  reset(){this.trail=[];},
  update(phi){const a=0.32*Math.sin(phi),B=[this.A[0]+this.l*Math.cos(a),this.A[1]+this.l*Math.sin(a)];const Cc=cc(this.D,this.l,B,this.c,1);const M=[(B[0]+Cc[0])/2,(B[1]+Cc[1])/2];this.g={phi,B,Cc,M};this.trail=this.trail||[];this.trail.push(M);if(this.trail.length>300)this.trail.shift();},
  output(){return this.g.M[0]-400;},
  draw(){const g=this.g;ctx.save();ctx.strokeStyle=C.rule;ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(400,60);ctx.lineTo(400,480);ctx.stroke();ctx.restore();
    if(this.trail.length>1){ctx.save();ctx.strokeStyle=C.steel;ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(...this.trail[0]);for(const p of this.trail)ctx.lineTo(...p);ctx.stroke();ctx.restore();}
    bar(this.A[0],this.A[1],g.B[0],g.B[1],14,C['brass-fill']);bar(this.D[0],this.D[1],g.Cc[0],g.Cc[1],14,C.part);bar(g.B[0],g.B[1],g.Cc[0],g.Cc[1],12,C.part2);
    circ(g.M[0],g.M[1],7);paint(C.steel,C.ink);for(const p of [g.B,g.Cc])pivot(p[0],p[1],5);for(const p of [this.A,this.D]){pivot(p[0],p[1],7);ground(p[0],p[1]+12,40);}
    label('MIDPOINT · near-straight line',g.M[0]+16,g.M[1]-10);},
  reads(){const g=this.g;return[['Sideways error',`${(g.M[0]-400).toFixed(2)} mm`],['Travel',`${(g.M[1]-270).toFixed(0)} mm`]];}});

/* 344 oscillating engine */
reg({num:344,outLabel:'Cylinder angle, degrees',O:[560,260],T:[250,260],r:65,
  update(phi){const pin=[this.O[0]+this.r*Math.cos(phi),this.O[1]+this.r*Math.sin(phi)];const a=Math.atan2(pin[1]-this.T[1],pin[0]-this.T[0]);this.g={phi,pin,a,d:Math.hypot(pin[0]-this.T[0],pin[1]-this.T[1])};},
  output(){return this.g.a*180/PI;},
  draw(){const g=this.g,O=this.O,T=this.T;circ(O[0],O[1],120);paint(C.part,C.ink);for(let k=0;k<5;k++){const a=g.phi+k*TAU/5;bar(O[0],O[1],O[0]+110*Math.cos(a),O[1]+110*Math.sin(a),8,C.part2);}
    bar(O[0],O[1],g.pin[0],g.pin[1],16,C['brass-fill']);
    ctx.save();ctx.translate(T[0],T[1]);ctx.rotate(g.a);ctx.beginPath();ctx.rect(-90,-44,250,88);ctx.rect(-80,-34,230,68);paint(C.part2,C.ink);ctx.beginPath();ctx.rect(g.d-250-15,-34,30,68);paint(C['steel-fill'],C.ink);bar(g.d-235,0,g.d,0,10,C.part);ctx.restore();
    pivot(g.pin[0],g.pin[1],5);pivot(O[0],O[1],6);circ(T[0],T[1],14);paint(C.hi,C.ink);pivot(T[0],T[1],5);ground(T[0],T[1]+60,60);ctx.beginPath();ctx.rect(T[0]-8,T[1]+14,16,46);paint(C.part2,C.ink);
    label('CYLINDER ROCKS ON TRUNNIONS',T[0],T[1]-90,'center');},
  reads(){const g=this.g;return[['Cylinder angle',`${(g.a*180/PI).toFixed(1)}°`],['Piston stroke',`${2*this.r} mm`],['Valve','set by the rocking itself']];}});

/* 359 pump drill */
reg({num:359,outLabel:'Spindle angle, turns',
  update(phi){const c=Math.floor(phi/TAU),f=phi/TAU-c;const s=(c%2?-1:1)*2*(1-Math.cos(f*PI))+(c%2?2:0)*0;const base=0;this.g={phi,y:180+120*(1-Math.cos(phi))/2,spin:(c%2?-1:1)*1.6*(1-Math.cos(f*PI))};},
  output(){return this.g.spin;},
  draw(){const g=this.g,X=400,a=g.spin*TAU;
    ctx.beginPath();ctx.rect(X-6,60,12,390);paint(C.part,C.ink);ctx.beginPath();ctx.moveTo(X-6,450);ctx.lineTo(X,480);ctx.lineTo(X+6,450);paint(C['steel-fill'],C.ink);
    ctx.beginPath();ctx.ellipse(X,360,110,22,0,0,TAU);paint(C['steel-fill'],C.ink);ctx.save();ctx.strokeStyle=C.ink;for(let k=0;k<8;k++){const t=a+k*PI/4;if(Math.sin(t)>0){ctx.globalAlpha=Math.sin(t);ctx.beginPath();ctx.moveTo(X+110*Math.cos(t),360+22*Math.sin(t)-4);ctx.lineTo(X+110*Math.cos(t),360+22*Math.sin(t)+4);ctx.stroke();}}ctx.restore();
    const tw=Math.sin(a)*14;ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(X-150,g.y);ctx.quadraticCurveTo(X-40,110,X+tw,66);ctx.moveTo(X+150,g.y);ctx.quadraticCurveTo(X+40,110,X-tw,66);ctx.stroke();ctx.restore();
    ctx.beginPath();ctx.rect(X-160,g.y-8,320,16);paint(C['brass-fill'],C.ink);hatchRect(X-120,480,240,30,C.part2);
    label('CROSS BAR · push down, let rise',X+170,g.y);label('FLYWHEEL',X+120,360);},
  reads(){const g=this.g;return[['Spindle',`${g.spin.toFixed(2)} turns`],['Direction','reverses every stroke']];}});

/* 430 overshot water wheel */
reg({num:430,outLabel:'Wheel turns',
  update(phi){this.g={phi:phi*0.5};},output(){return this.g.phi/TAU;},
  draw(){const g=this.g,Cc=[430,300],R=170,n=16;
    ctx.beginPath();ctx.rect(60,95,330,18);paint(C.part2,C.ink);ctx.beginPath();ctx.rect(60,82,330,13);paint(C['steel-fill'],null);
    circ(Cc[0],Cc[1],R);circ(Cc[0],Cc[1],R-28,false);paint(C.part,C.ink);for(let k=0;k<8;k++){const a=g.phi+k*PI/4;bar(Cc[0],Cc[1],Cc[0]+(R-28)*Math.cos(a),Cc[1]+(R-28)*Math.sin(a),8,C.part2);}
    for(let k=0;k<n;k++){const a=g.phi+k*TAU/n,x=Cc[0]+R*Math.cos(a),y=Cc[1]+R*Math.sin(a);ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.beginPath();ctx.moveTo(-28,-10);ctx.lineTo(0,-14);ctx.lineTo(0,14);paint(null,C.ink,2);
      const am=mod(a+PI,TAU)-PI;const fill=am>-1.4&&am<1.2?clamp((am+1.4)/0.6,0,1)*clamp((1.2-am)/0.5,0,1):0;if(fill>0){ctx.beginPath();ctx.rect(-26,-10,24,20*fill);ctx.fillStyle=C['steel-fill'];ctx.fill();}ctx.restore();}
    ctx.save();ctx.fillStyle=C['steel-fill'];ctx.beginPath();ctx.moveTo(390,90);ctx.quadraticCurveTo(440,96,450,140);ctx.lineTo(436,140);ctx.quadraticCurveTo(428,104,390,104);ctx.fill();ctx.restore();
    pivot(Cc[0],Cc[1],8);ctx.beginPath();ctx.rect(40,470,720,40);ctx.fillStyle=C['steel-fill'];ctx.fill();label('FLUME',120,70);label('WATER FILLS THE DESCENDING BUCKETS',600,140);},
  reads(v){return[['Wheel speed',rpmOf(v)],['Power from','the weight of the water']];}});

/* 443 Archimedes' screw */
reg({num:443,outLabel:'Water lifted, turns',
  update(phi){this.g={phi};},output(){return this.g.phi/TAU;},
  draw(){const g=this.g,A=[150,440],B=[650,150],ang=Math.atan2(B[1]-A[1],B[0]-A[0]),Lx=Math.hypot(B[0]-A[0],B[1]-A[1]),r=46,P=80,sh=mod(g.phi/TAU*P,P);
    ctx.beginPath();ctx.rect(40,450,240,60);ctx.fillStyle=C['steel-fill'];ctx.fill();
    ctx.save();ctx.translate(A[0],A[1]);ctx.rotate(ang);
    ctx.beginPath();ctx.rect(0,-r,Lx,2*r);paint(C.part,C.ink);
    for(let x=-P+sh;x<Lx;x+=P){ctx.save();ctx.beginPath();ctx.rect(0,-r,Lx,2*r);ctx.clip();ctx.beginPath();ctx.ellipse(x+P*0.32,r*0.55,P*0.22,r*0.35,0,0,TAU);ctx.fillStyle=C['steel-fill'];ctx.fill();ctx.restore();}
    ctx.save();ctx.beginPath();ctx.rect(0,-r,Lx,2*r);ctx.clip();ctx.strokeStyle=C.ink;ctx.lineWidth=2;for(let x=-P+sh;x<Lx+P;x+=P){ctx.beginPath();ctx.moveTo(x,-r);ctx.bezierCurveTo(x+P*0.2,-r*0.3,x+P*0.3,r*0.3,x+P*0.5,r);ctx.stroke();}ctx.restore();
    ctx.beginPath();ctx.rect(0,-r,Lx,2*r);paint(null,C.ink,1.6);bar(-30,0,0,0,10,C.part2);bar(Lx,0,Lx+40,0,10,C.part2);ctx.restore();
    circ(B[0]+30,B[1]-20,30);paint(C['brass-fill'],C.ink);bar(B[0]+30,B[1]-20,B[0]+30+26*Math.cos(g.phi),B[1]-20+26*Math.sin(g.phi),6,C.part2);
    ctx.beginPath();ctx.rect(640,170,140,24);paint(C.part2,C.ink);ctx.save();ctx.fillStyle=C['steel-fill'];ctx.fillRect(650,160,120,10);ctx.restore();
    label('LOW WATER',150,500,'center');label('OUTLET',710,215,'center');label('POCKETS OF WATER CLIMB AS IT TURNS',260,180);},
  reads(v){return[['Screw speed',rpmOf(v)],['Per turn','one pocket delivered']];}});

/* 448 lift pump */
reg({num:448,outLabel:'Piston height, mm',
  update(phi){this.g={phi,y:300-110*(1-Math.cos(phi))/2,up:Math.sin(phi)>0};},output(){return 300-this.g.y;},
  draw(){const g=this.g,X=380;
    ctx.beginPath();ctx.rect(X-60,140,12,300);ctx.rect(X+48,140,12,300);paint(C.part2,C.ink);ctx.beginPath();ctx.rect(X-10,440,20,60);paint(C.part2,C.ink);
    ctx.save();ctx.fillStyle=C['steel-fill'];ctx.fillRect(X-48,170,96,g.y-170);ctx.fillRect(X-48,g.y+20,96,420-g.y);ctx.fillRect(X-10,440,20,60);ctx.fillRect(200,490,400,30);ctx.restore();
    ctx.beginPath();ctx.rect(X-48,g.y,96,20);paint(C['brass-fill'],C.ink);
    ctx.save();ctx.translate(X,g.y);ctx.rotate(g.up?0:-0.7);ctx.beginPath();ctx.rect(0,-2,30,4);paint(C.steel,C.ink);ctx.restore();
    ctx.save();ctx.translate(X-30,430);ctx.rotate(g.up?-0.7:0);ctx.beginPath();ctx.rect(0,-2,60,4);paint(C.steel,C.ink);ctx.restore();
    bar(X,g.y,X,90,8,C.part);const hp=[X+90,110];const ha=Math.atan2(90-hp[1],X-hp[0]);bar(X-6,90,560,90+(90-g.y+190)*0.15,10,C['brass-fill']);
    ctx.beginPath();ctx.rect(X-110,170,62,14);paint(C.part2,C.ink);if(g.up){ctx.save();ctx.fillStyle=C['steel-fill'];ctx.beginPath();ctx.moveTo(X-110,176);ctx.quadraticCurveTo(X-140,200,X-136,300);ctx.lineTo(X-126,300);ctx.quadraticCurveTo(X-128,210,X-104,184);ctx.fill();ctx.restore();}
    label(g.up?'UPSTROKE · water lifted out':'DOWNSTROKE · piston valve opens',X+90,g.y);label('FOOT VALVE',X+70,430);label('WELL',400,512,'center');},
  reads(){const g=this.g;return[['Stroke',g.up?'up':'down'],['Piston valve',g.up?'closed':'open'],['Foot valve',g.up?'open':'closed']];}});

/* 466 hydraulic press */
reg({num:466,outLabel:'Ram height, mm',params:[{id:'R',label:'Ram diameter',min:60,max:160,step:10,value:120,fmt:v=>v+' mm (plunger 24)'}],
  reset(){this.ram=0;this.lastY=null;},
  update(phi){const y=60*(1-Math.cos(phi))/2;if(this.lastY!==null&&y>this.lastY){this.ram+=(y-this.lastY)*(24/this.P.R)**2*6;}if(this.ram>120)this.ram=0;this.lastY=y;this.g={phi,y};},
  output(){return this.ram;},
  draw(){const g=this.g,R=this.P.R,X=520,top=330-this.ram;
    ctx.save();ctx.fillStyle=C['steel-fill'];ctx.fillRect(170,440,X-170,20);ctx.restore();ctx.beginPath();ctx.rect(170,440,X-170,20);paint(null,C.ink);
    ctx.beginPath();ctx.rect(X-R/2-10,200,R+20,260);paint(C.part2,C.ink);ctx.save();ctx.fillStyle=C['steel-fill'];ctx.fillRect(X-R/2,top+60,R,400-top-60+40);ctx.restore();
    ctx.beginPath();ctx.rect(X-R/2,top-60,R,120);paint(C['brass-fill'],C.ink);ctx.beginPath();ctx.rect(X-100,top-80,200,20);paint(C['steel-fill'],C.ink);
    ctx.beginPath();ctx.rect(X-110,60,220,20);paint(C.part2,C.ink);for(const gx of [X-110,X+90]){ctx.beginPath();ctx.rect(gx,80,20,400);paint(C.part,C.ink);}
    const px=200,py=300+g.y;ctx.beginPath();ctx.rect(px-22,280,44,180);paint(C.part2,C.ink);ctx.save();ctx.fillStyle=C['steel-fill'];ctx.fillRect(px-12,py+40,24,440-py-40);ctx.restore();
    ctx.beginPath();ctx.rect(px-12,py-40,24,80);paint(C['brass-fill'],C.ink);bar(px,py-40,px+0,230,8,C.part);bar(110,250,px+120,230-(g.y-30)*1.4,10,C['brass-fill']);pivot(110,250,6);
    label('PLUNGER',px-30,260,'right');label('RAM',X+R/2+16,top);label(`FORCE × ${((R/24)**2).toFixed(0)}`,X,40,'center');},
  reads(){return[['Force multiplier',`× ${((this.P.R/24)**2).toFixed(0)}`],['Ram rise per stroke',`${(60*(24/this.P.R)**2*6).toFixed(1)} mm`],['Ram height',`${this.ram.toFixed(0)} mm`]];}});

/* 485 windmill */
reg({num:485,outLabel:'Sail turns',
  update(phi){this.g={phi};},output(){return this.g.phi/TAU;},
  draw(){const g=this.g,H=[400,170];ctx.beginPath();ctx.moveTo(340,500);ctx.lineTo(370,200);ctx.lineTo(430,200);ctx.lineTo(460,500);ctx.closePath();paint(C.part,C.ink);ctx.beginPath();ctx.moveTo(360,200);ctx.quadraticCurveTo(400,140,440,200);ctx.closePath();paint(C.part2,C.ink);
    for(let k=0;k<4;k++){const a=g.phi+k*PI/2;ctx.save();ctx.translate(H[0],H[1]);ctx.rotate(a);bar(0,0,200,0,8,C.part2);ctx.beginPath();ctx.rect(40,4,160,40);paint(C['brass-fill'],C.ink);ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=.8;for(let x=60;x<200;x+=20){ctx.beginPath();ctx.moveTo(x,4);ctx.lineTo(x,44);ctx.stroke();}ctx.restore();ctx.restore();}
    pivot(H[0],H[1],9);ground(400,500,300);},
  reads(v){return[['Sail speed',rpmOf(v)],['Driven by','wind on angled sails']];}});

/* 488 screw propeller */
reg({num:488,outLabel:'Propeller turns',
  update(phi){this.g={phi};},output(){return this.g.phi/TAU;},
  draw(){const g=this.g,Hc=[470,260],R=120;
    ctx.save();ctx.strokeStyle=C['steel-fill'];ctx.lineWidth=2;for(let i=0;i<7;i++){const y=150+i*36;const off=mod(g.phi*40,60);ctx.setLineDash([30,30]);ctx.lineDashOffset=-off;ctx.beginPath();ctx.moveTo(500,y);ctx.lineTo(780,y);ctx.stroke();}ctx.restore();
    ctx.beginPath();ctx.moveTo(20,120);ctx.lineTo(260,120);ctx.quadraticCurveTo(360,140,380,230);ctx.lineTo(380,290);ctx.quadraticCurveTo(360,380,260,400);ctx.lineTo(20,400);ctx.closePath();paint(C.part,C.ink);
    ctx.beginPath();ctx.rect(380,252,80,16);paint(C.part2,C.ink);
    const bl=[0,1,2].map(k=>{const a=g.phi+k*TAU/3;return{a,z:Math.sin(a)};}).sort((p,q)=>p.z-q.z);
    for(const b of bl){const tipY=Hc[1]-R*Math.cos(b.a),w=10+30*Math.abs(Math.sin(b.a));ctx.save();ctx.globalAlpha=b.z<0?.6:1;ctx.beginPath();ctx.moveTo(Hc[0]-8,Hc[1]);ctx.quadraticCurveTo(Hc[0]-w,(Hc[1]+tipY)/2,Hc[0]-4,tipY);ctx.quadraticCurveTo(Hc[0]+w,(Hc[1]+tipY)/2,Hc[0]+8,Hc[1]);ctx.closePath();paint(C['brass-fill'],C.ink);ctx.restore();}
    circ(Hc[0],Hc[1],20);paint(C['brass-fill'],C.ink);label('HULL',120,260,'center');label('WATER PUSHED AFT',640,120,'center');},
  reads(v){return[['Propeller speed',rpmOf(v)],['Blades','3, set at a pitch like a screw']];}});

/* 499 Bourdon gauge */
reg({num:499,outLabel:'Pressure, bar',params:[{id:'m',label:'Peak pressure',min:2,max:10,step:0.5,value:8,fmt:v=>v+' bar'}],
  update(phi){const p=this.P.m*(1-Math.cos(phi))/2;this.g={phi,p};},output(){return this.g.p;},
  draw(){const g=this.g,D=[400,250],f=g.p/10;
    circ(D[0],D[1],210);paint(C.hi,C.ink,2);for(let i=0;i<=50;i++){const a=PI*0.75+i/50*PI*1.5,r1=i%5?192:180;ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=i%5?1:2;ctx.beginPath();ctx.moveTo(D[0]+r1*Math.cos(a),D[1]+r1*Math.sin(a));ctx.lineTo(D[0]+202*Math.cos(a),D[1]+202*Math.sin(a));ctx.stroke();ctx.restore();if(i%5===0)label(String(i/5),D[0]+164*Math.cos(a),D[1]+164*Math.sin(a),'center');}
    const kap=1/120*(1-0.22*f),S=1.35*PI*120;const pts=[];let h=PI,x=D[0]+20,y=D[1]+150;pts.push([x,y]);for(let i=0;i<80;i++){const ds=S/80;h+=kap*ds;x+=Math.cos(h)*ds;y+=Math.sin(h)*ds;pts.push([x,y]);}
    ctx.save();ctx.lineCap='round';ctx.strokeStyle=C.ink;ctx.lineWidth=16;ctx.beginPath();ctx.moveTo(...pts[0]);for(const p of pts)ctx.lineTo(...p);ctx.stroke();ctx.strokeStyle=C['brass-fill'];ctx.lineWidth=12;ctx.stroke();ctx.restore();
    const T=pts[pts.length-1],Sp=[D[0]+40,D[1]+40],sa=-1.9-0.5*f,Se=[Sp[0]+60*Math.cos(sa),Sp[1]+60*Math.sin(sa)];
    bar(T[0],T[1],Se[0],Se[1],5,C.part);ctx.beginPath();ctx.moveTo(Sp[0],Sp[1]);ctx.arc(Sp[0],Sp[1],52,sa+PI-0.3,sa+PI+0.3);ctx.closePath();paint(C['steel-fill'],C.ink);bar(Sp[0],Sp[1],Se[0],Se[1],8,C['steel-fill']);pivot(Sp[0],Sp[1],4);
    ctx.beginPath();ctx.rect(D[0]+8,D[1]+150,26,70);paint(C.part2,C.ink);
    const pa=PI*0.75+f*PI*1.5;bar(D[0]-30*Math.cos(pa),D[1]-30*Math.sin(pa),D[0]+170*Math.cos(pa),D[1]+170*Math.sin(pa),5,C.steel);circ(D[0],D[1],10);paint(C.steel,C.ink);
    label('BOURDON TUBE',D[0]-150,D[1]+30);label('bar',D[0],D[1]+90,'center');},
  reads(){const g=this.g;return[['Pressure',`${g.p.toFixed(2)} bar`],['Tube','straightens as pressure rises'],['Pointer',`${(g.p/10*270).toFixed(0)}° of 270°`]];}});

/* 505 planetary gear */
reg({num:505,outLabel:'Output member, turns',params:[{id:'m',type:'toggle',label:'Hold still',options:[[0,'Ring'],[1,'Sun'],[2,'Carrier']],value:0}],Zs:24,Zp:12,Zr:48,
  update(phi){const m=this.P.m;let s,r,c;if(m===0){s=phi;r=0;c=phi*this.Zs/(this.Zs+this.Zr);}else if(m===1){r=phi;s=0;c=phi*this.Zr/(this.Zs+this.Zr);}else{c=0;s=phi;r=-phi*this.Zs/this.Zr;}
    const p=c-(s-c)*this.Zs/this.Zp;this.g={phi,s,r,c,p,m};},
  output(){const g=this.g;return(g.m===2?g.r:g.c)/TAU;},
  draw(){const g=this.g,O=[400,265],ts=TAU/24,tp=TAU/12,tr=TAU/48;
    poly(gearPts(O[0],O[1],120,48,g.r+tr/2,true));ctx.closePath();circ(O[0],O[1],120+6.25+20,false);paint(g.m===1?C['steel-fill']:(g.m===0?C.part2:C['steel-fill']),C.ink);
    const pc=[0,1,2].map(k=>{const b=g.c+k*TAU/3;return[O[0]+90*Math.cos(b),O[1]+90*Math.sin(b),b];});
    ctx.beginPath();ctx.moveTo(pc[0][0],pc[0][1]);for(const q of pc)ctx.lineTo(q[0],q[1]);ctx.closePath();ctx.lineJoin='round';ctx.save();ctx.lineWidth=26;ctx.strokeStyle=C.ink;ctx.stroke();ctx.lineWidth=22;ctx.strokeStyle=g.m===2?C.part2:C.part;ctx.stroke();ctx.restore();
    drawGear(O[0],O[1],60,24,g.s+ts/2,g.m===1?C.part2:C['brass-fill'],{bore:8});
    pc.forEach((q,k)=>drawGear(q[0],q[1],30,12,g.p+(k*TAU/3),C.hi,{bore:5}));for(const q of pc)pivot(q[0],q[1],4);pivot(O[0],O[1],6);
    const held=['RING HELD','SUN HELD','CARRIER HELD'][g.m],io=[['sun in','carrier out · 3 : 1'],['ring in','carrier out · 1.5 : 1'],['sun in','ring out · reversed 2 : 1']][g.m];
    label(held,O[0],O[1]+170,'center');label(io.join(' → '),O[0],O[1]+190,'center');},
  reads(){const g=this.g;const io=[['Sun','Carrier','3 : 1 slower'],['Ring','Carrier','1.5 : 1 slower'],['Sun','Ring','2 : 1, reversed']][g.m];return[['Input',io[0]],['Output',io[1]],['Ratio',io[2]]];}});

/* ================= batch 2 ================= */
const smooth=s=>{s=clamp(s,0,1);return s*s*(3-2*s);};
function alias(num,src,extra){const o=Object.assign({},SIMS_NEW[src],{num},extra||{});o.params=(SIMS_NEW[src].params||[]).map(p=>Object.assign({},p));return reg(o);}
const WATER=()=>C['steel-fill'];
function water(x,y,w,h){ctx.save();ctx.fillStyle=WATER();ctx.fillRect(x,y,w,h);ctx.restore();}
function sawWheel(cx,cy,W,N,rr,rt,fill){const p=TAU/N,pts=[];for(let i=0;i<N;i++){const f=W+i*p;pts.push([cx+rt*Math.cos(f-0.004),cy+rt*Math.sin(f-0.004)]);pts.push([cx+rr*Math.cos(f),cy+rr*Math.sin(f)]);}
  pts.reverse();poly(pts);ctx.closePath();circ(cx,cy,10,false);paint(fill,C.ink);}
function sawR(rel,N,rr,rt){const p=TAU/N;return rr+(rt-rr)*(mod(-rel,p)/p);}
function flywheel(x,y,r,a,fill){circ(x,y,r);paint(fill||C.part,C.ink);const n=6;for(let k=0;k<n;k++){const t=a+k*TAU/n;bar(x+12*Math.cos(t),y+12*Math.sin(t),x+(r-10)*Math.cos(t),y+(r-10)*Math.sin(t),8,C.part2);}circ(x,y,r-10);paint(null,C.ink,1);}

/* 12 single fixed pulley */
reg({num:12,outLabel:'Load height, mm',
  update(phi){this.g={phi,s:110*(1-Math.cos(phi))/2};},output(){return this.g.s;},
  draw(){const g=this.g,P=[400,110],r=40;ctx.beginPath();ctx.rect(300,40,200,14);paint(C.part2,C.ink);bar(P[0],54,P[0],P[1],7,C.part);
    rope([[P[0]-r,P[1]],[P[0]-r,360-g.s]]);rope([[P[0]+r,P[1]],[P[0]+r,300+g.s]]);ctx.beginPath();ctx.arc(P[0],P[1],r,PI,TAU);ctx.strokeStyle=C.ink;ctx.lineWidth=2;ctx.stroke();
    pulley(P[0],P[1],r,g.s/r,C.part);weight(P[0]-r,360-g.s,80,60,'LOAD');ctx.beginPath();ctx.rect(P[0]+r-10,300+g.s,20,30);paint(C['brass-fill'],C.ink);label('PULL',P[0]+r+18,315+g.s);},
  reads(){const g=this.g;return[['Force needed','equal to the load'],['Benefit','pull down to lift up'],['Load raised',`${g.s.toFixed(0)} mm`]];}});

/* 9 cone pulleys */
reg({num:9,outLabel:'Speed ratio',
  reset(){this.a2=0;this.last=0;},
  rad(x){const f=clamp((x-230)/340,0,1);return[30+60*f,90-60*f];},
  update(phi){const xb=400+160*Math.sin(phi/6);const [r1,r2]=this.rad(xb);if(this.last===undefined){this.a2=0;this.last=phi;}this.a2+=(phi-this.last)*r1/r2;this.last=phi;this.g={phi,xb,r1,r2};},
  output(){return this.g.r1/this.g.r2;},
  cone(y,big,a,fill){const x0=230,x1=570,rA=big?30:90,rB=big?90:30;poly([[x0,y-rA],[x1,y-rB],[x1,y+rB],[x0,y+rA]]);ctx.closePath();paint(fill,C.ink);
    ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=1;for(let k=0;k<8;k++){const t=a+k*PI/4;if(Math.cos(t)>0){ctx.globalAlpha=.2+.6*Math.cos(t);ctx.beginPath();ctx.moveTo(x0,y+rA*Math.sin(t));ctx.lineTo(x1,y+rB*Math.sin(t));ctx.stroke();}}ctx.restore();
    bar(170,y,x0,y,12,C.part);bar(x1,y,630,y,12,C.part);},
  draw(){const g=this.g,y1=150,y2=390;this.cone(y1,true,g.phi,C['brass-fill']);this.cone(y2,false,this.a2,C['steel-fill']);
    ctx.beginPath();ctx.rect(g.xb-12,y1+g.r1,24,y2-g.r2-(y1+g.r1));paint(C.part2,C.ink);
    ctx.save();ctx.setLineDash([4,10]);ctx.lineDashOffset=g.phi*g.r1;ctx.strokeStyle=C.ink;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(g.xb,y1+g.r1);ctx.lineTo(g.xb,y2-g.r2);ctx.stroke();ctx.restore();
    label('DRIVER CONE',140,y1-40);label('DRIVEN CONE',140,y2+70);linArrow(g.xb-30,270,Math.cos(g.phi/6)>0?-24:24,C.brass);label('BELT SHIFTS',g.xb+20,270);},
  reads(){const g=this.g;return[['Belt at',`${(g.xb-230).toFixed(0)} mm along`],['Speed ratio',`${(g.r1/g.r2).toFixed(2)} × driver`],['Change','smooth, no steps']];}});

/* 26 crown wheel and pinion */
reg({num:26,outLabel:'Crown wheel, turns',
  update(phi){this.g={phi,c:-phi*12/60};},output(){return -this.g.c/TAU;},
  draw(){const g=this.g,O=[400,300],rx=200,ry=60,N=60;
    bar(O[0],O[1],O[0],500,16,C.part);
    const teeth=k=>{const t=g.c+k*TAU/N;return{x:O[0]+rx*Math.cos(t),y:O[1]+ry*Math.sin(t),z:Math.sin(t)};};
    for(let k=0;k<N;k++){const q=teeth(k);if(q.z<0){ctx.beginPath();ctx.rect(q.x-3,q.y-14,6,14);paint(C['steel-fill'],C.ink,.8);}}
    ctx.beginPath();ctx.ellipse(O[0],O[1],rx,ry,0,0,TAU);ctx.ellipse(O[0],O[1]+16,rx,ry,0,0,PI);paint(C['steel-fill'],C.ink);ctx.beginPath();ctx.ellipse(O[0],O[1],rx,ry,0,0,TAU);paint(C['steel-fill'],C.ink);
    for(let k=0;k<N;k++){const q=teeth(k);if(q.z>=0){ctx.beginPath();ctx.rect(q.x-3,q.y-14,6,14);paint(C['steel-fill'],C.ink,.8);}}
    const P=[O[0],O[1]+ry-14-34];drawGear(P[0],P[1],30,9,-g.phi*1.333,C['brass-fill'],{bore:5});pivot(P[0],P[1],4);
    label('PINION (axle toward you)',P[0]+50,P[1]-20);label('CROWN WHEEL · teeth on its face',O[0]+rx-20,O[1]+90);},
  reads(v){return[['Shafts','at right angles'],['Ratio','12 : 60'],['Crown speed',rpmOf(Math.abs(v))]];}});

/* 28 friction disk drive */
reg({num:28,outLabel:'Wheel speed ratio',params:[{id:'d',label:'Wheel distance from centre',min:30,max:190,step:5,value:120,fmt:v=>v+' mm'}],
  update(phi){this.g={phi,w:phi*this.P.d/40};},output(){return this.P.d/40;},
  draw(){const g=this.g,O=[400,330],rx=220,ry=55,d=this.P.d,rw=40;
    bar(O[0],O[1],O[0],500,14,C.part);ctx.beginPath();ctx.ellipse(O[0],O[1]+14,rx,ry,0,0,PI);ctx.lineTo(O[0]-rx,O[1]);paint(C['brass-fill'],C.ink);ctx.beginPath();ctx.ellipse(O[0],O[1],rx,ry,0,0,TAU);paint(C['brass-fill'],C.ink);
    ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=.8;for(let k=0;k<12;k++){const t=g.phi+k*PI/6;ctx.beginPath();ctx.moveTo(O[0]+30*Math.cos(t),O[1]+30*ry/rx*Math.sin(t));ctx.lineTo(O[0]+rx*Math.cos(t),O[1]+ry*Math.sin(t));ctx.stroke();}ctx.restore();
    const x=O[0]+d;ctx.beginPath();ctx.rect(x-12,O[1]-2*rw,24,2*rw);paint(C['steel-fill'],C.ink);
    ctx.save();ctx.strokeStyle=C.ink;for(let k=0;k<6;k++){const a=g.w+k*PI/3;if(Math.cos(a)>0){ctx.globalAlpha=.3+.7*Math.cos(a);ctx.beginPath();ctx.moveTo(x-12,O[1]-rw+rw*Math.sin(a));ctx.lineTo(x+12,O[1]-rw+rw*Math.sin(a));ctx.stroke();}}ctx.restore();
    bar(x+12,O[1]-rw,760,O[1]-rw,10,C.part);ctx.beginPath();ctx.rect(700,O[1]-rw-18,30,36);paint(C.part2,C.ink);label('SLIDE THE WHEEL TO CHANGE SPEED',x,O[1]-2*rw-20,'center');},
  reads(){return[['Wheel position',`${this.P.d} mm out`],['Wheel speed',`${(this.P.d/40).toFixed(2)} × disk`],['Grip','friction only']];}});

/* 32 friction wheels */
reg({num:32,outLabel:'Driven wheel, turns',
  update(phi){this.g={phi,a2:-phi*90/60};},output(){return -this.g.a2/TAU;},
  draw(){const g=this.g,A=[310,260],B=[310+150,260];
    for(const [P,r,a,f] of [[A,90,g.phi,C['brass-fill']],[B,60,g.a2,C['steel-fill']]]){circ(P[0],P[1],r);paint(f,C.ink);circ(P[0],P[1],r-8);paint(null,C.ink,.8);
      ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=.8;for(let k=0;k<Math.round(r/3);k++){const t=a+k*TAU/Math.round(r/3);ctx.beginPath();ctx.moveTo(P[0]+(r-8)*Math.cos(t),P[1]+(r-8)*Math.sin(t));ctx.lineTo(P[0]+r*Math.cos(t),P[1]+r*Math.sin(t));ctx.stroke();}ctx.restore();
      bar(P[0],P[1],P[0]+(r-20)*Math.cos(a),P[1]+(r-20)*Math.sin(a),6,C.part2);pivot(P[0],P[1],5);}
    label('RUBBER-FACED RIMS',385,400,'center');},
  reads(v){return[['Ratio','90 : 60'],['Teeth','none, grip by friction'],['Driven',rpmOf(Math.abs(v))]];}});

/* 202 worm and wheel (variant) */
alias(202,31,{Z:30});

/* 264 hundred-and-one counter */
reg({num:264,outLabel:'Gain of wheel B, turns',
  update(phi){const w=phi*40;this.g={phi,w,a:w/100,b:w/101};},output(){return (this.g.a-this.g.b)/TAU;},
  draw(){const g=this.g,O=[400,230],R=160;
    circ(O[0],O[1],R+12);paint(C['steel-fill'],C.ink);circ(O[0],O[1],R-30);paint(C.part,C.ink);
    ctx.save();ctx.strokeStyle=C.ink;for(let i=0;i<100;i++){const t=-g.a+i*TAU/100;ctx.lineWidth=i%10?0.8:2;ctx.beginPath();ctx.moveTo(O[0]+(R+12)*Math.cos(t),O[1]+(R+12)*Math.sin(t));ctx.lineTo(O[0]+(R-(i%10?2:10))*Math.cos(t),O[1]+(R-(i%10?2:10))*Math.sin(t));ctx.stroke();}ctx.restore();
    const pa=-g.a-PI/2,pb=-g.b-PI/2;bar(O[0],O[1],O[0]+(R-40)*Math.cos(pa),O[1]+(R-40)*Math.sin(pa),6,C.steel);bar(O[0],O[1],O[0]+(R-60)*Math.cos(pb),O[1]+(R-60)*Math.sin(pb),8,C.brass);pivot(O[0],O[1],6);
    const yw=O[1]+R+40;ctx.beginPath();ctx.rect(260,yw-16,280,32);paint(C['brass-fill'],C.ink);ctx.save();ctx.beginPath();ctx.rect(260,yw-16,280,32);ctx.clip();ctx.strokeStyle=C.ink;ctx.lineWidth=2;const p=16,sh=mod(g.w/TAU*p,p);for(let x=260-p+sh;x<560;x+=p){ctx.beginPath();ctx.moveTo(x,yw-16);ctx.lineTo(x+8,yw+16);ctx.stroke();}ctx.restore();
    label('WHEEL A · 100 TEETH',O[0]+R+20,O[1]-60);label('WHEEL B · 101 TEETH (brass hand)',O[0]+R+20,O[1]-40);label('ONE WORM DRIVES BOTH',400,yw+30,'center');},
  reads(){const g=this.g;return[['Worm turns',`${(g.w/TAU).toFixed(0)}`],['Wheel A turns',`${(g.a/TAU).toFixed(3)}`],['A gains on B',`${((g.a-g.b)/TAU).toFixed(4)} turn`],['Full lap of gain','every 10,100 worm turns']];}});

/* 502 epicyclic train, fixed central wheel */
reg({num:502,outLabel:'Planet wheel, turns',
  update(phi){this.g={phi,arm:phi*0.5,pl:phi*0.5*3};},output(){return this.g.pl/TAU;},
  draw(){const g=this.g,O=[400,260],Rs=80,rp=40,d=120,P=[O[0]+d*Math.cos(g.arm),O[1]+d*Math.sin(g.arm)];
    drawGear(O[0],O[1],Rs,32,PI/32,C.part2,{bore:8});bar(O[0],O[1],P[0],P[1],16,C['brass-fill']);
    drawGear(P[0],P[1],rp,16,g.pl+PI+(0),C['steel-fill'],{bore:6});const m=[P[0]+30*Math.cos(g.pl),P[1]+30*Math.sin(g.pl)];bar(P[0],P[1],m[0],m[1],4,C.steel);pivot(P[0],P[1],5);pivot(O[0],O[1],6);
    label('FIXED CENTRAL WHEEL',O[0],O[1]+170,'center');label('ARM · driver',P[0]+50,P[1]-50);},
  reads(){const g=this.g;return[['Arm turns',`${(g.arm/TAU).toFixed(2)}`],['Planet turns',`${(g.pl/TAU).toFixed(2)}`],['Rule','planet spins 3× per arm turn']];}});

/* 504 Ferguson's paradox */
reg({num:504,outLabel:'Wheel 21 turns',
  update(phi){const a=phi*0.6;this.g={phi,a,w19:a*(1-20/19),w20:0,w21:a*(1-20/21)};},output(){return this.g.w21/TAU;},
  draw(){const g=this.g,O=[400,260],rs=60,ri=30,ro=60,I=[O[0]+90*Math.cos(g.a),O[1]+90*Math.sin(g.a)],Q=[O[0]+180*Math.cos(g.a),O[1]+180*Math.sin(g.a)];
    drawGear(O[0],O[1],rs,20,PI/20,C.part2,{bore:8});bar(O[0],O[1],Q[0],Q[1],18,C['brass-fill']);drawGear(I[0],I[1],ri,10,-g.a*3,C.part,{bore:5});
    drawGear(Q[0],Q[1],ro,20,g.w20,C['steel-fill'],{bore:6});
    const arrows=[[g.w19,52,C.brass,'19'],[g.w20,38,C.ink,'20'],[g.w21,24,C.steel,'21']];
    for(const [w,r,col] of arrows){ctx.save();ctx.strokeStyle=col;ctx.fillStyle=col;ctx.lineWidth=3;const t=w-PI/2;ctx.beginPath();ctx.moveTo(Q[0],Q[1]);ctx.lineTo(Q[0]+r*Math.cos(t),Q[1]+r*Math.sin(t));ctx.stroke();circ(Q[0]+r*Math.cos(t),Q[1]+r*Math.sin(t),4);ctx.fill();ctx.restore();}
    pivot(I[0],I[1],4);pivot(Q[0],Q[1],5);pivot(O[0],O[1],6);
    label('FIXED 20-TOOTH WHEEL (grey)',40,470);label('ON THE ARM: 19, 20 AND 21-TOOTH WHEELS STACKED',40,490);},
  reads(){return[['20-tooth wheel','never turns (points up)'],['21-tooth wheel','turns with the arm, slowly'],['19-tooth wheel','turns against the arm']];}});

/* 68 / 241 single-tooth intermittent drive */
function oneTooth(num,lock){return reg({num,outLabel:'Driven wheel, turns',N:8,
  update(phi){const k=Math.floor((phi+PI)/TAU),a=mod(phi+PI,TAU)-PI,s=smooth((a+0.45)/0.9);this.g={phi,w:-(k+s)*TAU/this.N,eng:Math.abs(a)<0.45};},
  output(){return -this.g.w/TAU;},
  draw(){const g=this.g,D=[300,260],Wc=[300+190,260],N=this.N,Rw=110;
    const pts=[];for(let i=0;i<N*24;i++){const t=i/(N*24)*TAU,rel=mod(t-g.w-PI,TAU/N)-TAU/N/2,notch=Math.abs(rel)<0.13;let r=notch?Rw-34:Rw;if(lock&&!notch){const dd=Math.abs(Math.abs(rel)-TAU/N/2);if(dd<0.18)r=Rw-14*Math.cos(dd/0.18*PI/2);}pts.push([Wc[0]+r*Math.cos(t),Wc[1]+r*Math.sin(t)]);}
    poly(pts);ctx.closePath();circ(Wc[0],Wc[1],10,false);paint(C['steel-fill'],C.ink);pivot(Wc[0],Wc[1],6);
    if(lock){circ(D[0],D[1],72);paint(C['brass-fill'],C.ink);}else{circ(D[0],D[1],60);paint(C['brass-fill'],C.ink);}
    const t=g.phi;bar(D[0],D[1],D[0]+100*Math.cos(t),D[1]+100*Math.sin(t),20,C['brass-fill']);circ(D[0]+96*Math.cos(t),D[1]+96*Math.sin(t),9);paint(C.part2,C.ink);pivot(D[0],D[1],6);
    label(g.eng?'TOOTH ENGAGED':'WHEEL AT REST',Wc[0],Wc[1]+150,'center');label('ONE-TOOTH DRIVER',D[0],D[1]+150,'center');},
  reads(){const g=this.g;return[['Per driver turn',`1/${this.N} turn`],['Phase',g.eng?'moving':'resting'],['Locking',lock?'rim holds the wheel':'none']];}});}
oneTooth(68,true);oneTooth(241,false);

/* 76 revolution counter */
reg({num:76,outLabel:'Count',N:10,
  update(phi){const k=Math.floor((phi+PI*0.8)/TAU),a=mod(phi+PI*0.8,TAU),s=smooth((a-PI*0.55)/(PI*0.5));this.g={phi,k,s,w:-(k+s)*TAU/this.N};},
  output(){return this.g.k+this.g.s;},
  draw(){const g=this.g,S=[260,260],Wc=[470,260],N=this.N;
    circ(S[0],S[1],50);paint(C['brass-fill'],C.ink);const t=g.phi;bar(S[0],S[1],S[0]+105*Math.cos(t),S[1]+105*Math.sin(t),12,C['brass-fill']);pivot(S[0],S[1],6);
    sawWheel(Wc[0],Wc[1],g.w,N,72,100,C['steel-fill']);circ(Wc[0],Wc[1],55);paint(C.hi,C.ink);
    ctx.save();ctx.font='600 34px -apple-system, BlinkMacSystemFont, "SF Pro Display", Inter, "Helvetica Neue", Arial, sans-serif';ctx.fillStyle=C.ink;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(String(mod(Math.round(g.k+g.s),100)).padStart(2,'0'),Wc[0],Wc[1]);ctx.restore();
    const dp=[Wc[0]+30,Wc[1]-150];springZ(dp[0],dp[1],Wc[0]+12,Wc[1]-96,8,5);label('DETENT SPRING',dp[0]+10,dp[1]-10);
    label('TAPPET ON SHAFT',S[0],S[1]+150,'center');label('COUNT WHEEL',Wc[0],Wc[1]+150,'center');},
  reads(){const g=this.g;return[['Shaft turns',`${(g.phi/TAU).toFixed(1)}`],['Counted',`${g.k}`],['Rule','one tooth per turn']];}});

/* 77 / 206 / 236 double pawl lever */
function doublePawl(num){return reg({num,outLabel:'Wheel angle, degrees',N:24,
  reset(){this.W=0;this.lastA=null;},
  update(phi){const a=0.3*Math.sin(phi);if(this.lastA!==null)this.W+=Math.abs(a-this.lastA)*0.9;this.dir=this.lastA===null?1:Math.sign(a-this.lastA)||this.dir||1;this.lastA=a;this.g={phi,a};},
  output(){return this.W*180/PI;},
  draw(){const g=this.g,Cc=[400,320],N=this.N;sawWheel(Cc[0],Cc[1],this.W,N,100,122,C['steel-fill']);for(let k=0;k<4;k++){const t=this.W+k*PI/2;circ(Cc[0]+55*Math.cos(t),Cc[1]+55*Math.sin(t),13);paint(C.sheet,C.ink);}
    const arm=g.a-PI/2,L=[Cc[0]+190*Math.cos(arm),Cc[1]+190*Math.sin(arm)];bar(Cc[0],Cc[1],L[0],L[1],18,C['brass-fill']);
    for(const s of [-1,1]){const pv=[Cc[0]+160*Math.cos(arm+s*0.38),Cc[1]+160*Math.sin(arm+s*0.38)];const ta=arm+s*0.12,eng=(s>0)===(this.dir>0);const rr=eng?sawR(ta-this.W,N,100,122)+2:128;
      bar(Cc[0]+150*Math.cos(arm),Cc[1]+150*Math.sin(arm),pv[0],pv[1],8,C['brass-fill']);bar(pv[0],pv[1],Cc[0]+rr*Math.cos(ta),Cc[1]+rr*Math.sin(ta),8,eng?C.part2:C.part);pivot(pv[0],pv[1],4);}
    pivot(Cc[0],Cc[1],6);label('TWO PAWLS · one works on each stroke',Cc[0],Cc[1]+160,'center');},
  reads(){return[['Wheel turned',`${(this.W*180/PI).toFixed(0)}°`],['Strokes used','both'],['Motion','nearly continuous']];}});}


/* 81 part gear with spring-return rack */
reg({num:81,outLabel:'Rack position, mm',
  update(phi){const u=mod(phi,TAU),A=TAU/3,r=60;let y;if(u<A)y=r*u;else if(u<A+0.5)y=r*A*(1-smooth((u-A)/0.5));else y=0;this.g={phi,u,y};},
  output(){return this.g.y;},
  draw(){const g=this.g,G=[330,200],r=60,m=6,p=PI*m,x=G[0]+r;
    const tau=TAU/20,pts=gearPts(G[0],G[1],r,20,g.phi-TAU/3+tau/2,false,g.phi-TAU/3+0.01,g.phi-0.01);poly(pts);ctx.arc(G[0],G[1],r-1.25*m-1,g.phi,g.phi-TAU/3+TAU);ctx.closePath();circ(G[0],G[1],8,false);paint(C['brass-fill'],C.ink);pivot(G[0],G[1],6);
    const ty=y=>y;const pts2=[];const kmin=Math.ceil((44-G[1])/p),kmax=Math.floor((372-G[1])/p);for(let k=kmin;k<=kmax;k++){const c=G[1]+g.y+k*p;for(const [f,t] of PROF)pts2.push([t?x-m:x+1.25*m,c+f*p]);}
    poly([[x+1.25*m+22,40+g.y],[x+1.25*m,40+g.y],...pts2,[x+1.25*m,380+g.y],[x+1.25*m+22,380+g.y]]);ctx.closePath();paint(C['steel-fill'],C.ink);
    springZ(x+20,380+g.y,x+20,480,10,8);ground(x+20,480,40);
    label('TEETH ON A THIRD OF THE GEAR',G[0],G[1]+110,'center');label('SPRING PULLS THE RACK BACK',x+60,440);},
  reads(){const g=this.g;return[['Phase',g.u<TAU/3?'gear driving':(g.u<TAU/3+0.5?'spring return':'waiting')],['Rack',`${g.y.toFixed(0)} mm`]];}});

/* 114 mutilated pinion and double rack */
reg({num:114,outLabel:'Frame position, mm',
  update(phi){const u=mod(phi+PI/2,TAU)-PI/2,r=50;const x=u<PI/2?r*u:r*(PI-u);this.g={phi,x,top:u<PI/2};},
  output(){return this.g.x;},
  draw(){const g=this.g,P=[400,260],r=50,m=5,p=PI*m,X=g.x,yt=P[1]-r,yb=P[1]+r,xl=X+140,xr=X+660;
    ctx.beginPath();ctx.rect(xl-16,yt-36,16,yb-yt+72);ctx.rect(xr,yt-36,16,yb-yt+72);paint(C['steel-fill'],C.ink);
    const up=rackTeeth(xl,xr,P[0]+X,p,yt,m,true);poly([[xl,yt-36],[xl,yt-1.25*m],...up,[xr,yt-1.25*m],[xr,yt-36]]);ctx.closePath();paint(C['steel-fill'],C.ink);
    const lo=rackTeeth(xl,xr,P[0]+X,p,yb,m,false);poly([[xl,yb+36],[xl,yb+1.25*m],...lo,[xr,yb+1.25*m],[xr,yb+36]]);ctx.closePath();paint(C['steel-fill'],C.ink);
    const tau=TAU/20;const a0=g.phi-PI,pts=gearPts(P[0],P[1],r,20,a0+tau/2,false,a0+0.01,g.phi-0.01);poly(pts);ctx.arc(P[0],P[1],r-1.25*m-1,g.phi,a0+TAU);ctx.closePath();circ(P[0],P[1],7,false);paint(C['brass-fill'],C.ink);pivot(P[0],P[1],6);
    bar(40+X,P[1],xl-16,P[1],12,C['steel-fill']);label(g.top?'DRIVING THE TOP RACK':'DRIVING THE BOTTOM RACK',P[0],yb+80,'center');label('HALF-TOOTHED PINION',P[0]-60,yt-60,'center');},
  reads(){const g=this.g;return[['Frame',`${g.x.toFixed(0)} mm`],['Rack in mesh',g.top?'top':'bottom'],['Stroke',`${(PI*50).toFixed(0)} mm`]];}});

/* 212 Geneva stop */
reg({num:212,outLabel:'Winding turns',N:5,R:60,
  update(phi){const turns=4*(1-Math.cos(phi*0.25))/2;const a=turns*TAU-PI;const N=this.N,half=PI/2-PI/N;const ac=mod(a+PI,TAU)-PI,n=Math.round((a-ac)/TAU);const d=this.R/Math.sin(PI/N);const D=[310,260],Wc=[D[0]+d,D[1]];
    const pin=[D[0]+this.R*Math.cos(a),D[1]+this.R*Math.sin(a)];let w;const step=TAU/N;
    if(Math.abs(ac)<half){let b=Math.atan2(pin[1]-Wc[1],pin[0]-Wc[0]);b=mod(b,TAU);w=-n*step+(b-PI)-0;}else if(ac>=half)w=-n*step-PI/N*1-(half-half);else w=-n*step+PI/N;
    if(Math.abs(ac)<half)w=-n*step+(mod(Math.atan2(pin[1]-Wc[1],pin[0]-Wc[0]),TAU)-PI);else w=ac>=half?-n*step-(PI/2-half):-n*step+(PI/2-half);
    this.g={phi,turns,a,D,Wc,pin,w,d};},
  output(){return this.g.turns;},
  draw(){const g=this.g,N=this.N,R=this.R,Rg=R/Math.tan(PI/N),rl=R*0.62;
    const pts=[];for(let i=0;i<300;i++){const t=i/300*TAU;let r=Rg+2;for(let k=0;k<N;k++){const ca=g.w+PI+PI/N+k*TAU/N,cx=g.Wc[0]+g.d*Math.cos(ca),cy=g.Wc[1]+g.d*Math.sin(ca);const ux=Math.cos(t),uy=Math.sin(t),ox=g.Wc[0]-cx,oy=g.Wc[1]-cy,bq=ox*ux+oy*uy,cq=ox*ox+oy*oy-(rl+3)**2,disc=bq*bq-cq;if(disc>0&&k!==N-1){const t1=-bq-Math.sqrt(disc);if(t1>0&&t1<r)r=t1;}}pts.push([g.Wc[0]+r*Math.cos(t),g.Wc[1]+r*Math.sin(t)]);}
    poly(pts);ctx.closePath();paint(C['steel-fill'],C.ink);
    for(let k=0;k<N-1;k++){const a=g.w+PI+k*TAU/N;ctx.save();ctx.translate(g.Wc[0],g.Wc[1]);ctx.rotate(a);ctx.beginPath();ctx.rect(g.d-R-6,-6,Rg-g.d+R+8,12);ctx.fillStyle=C.sheet;ctx.fill();ctx.restore();}
    pivot(g.Wc[0],g.Wc[1],5);circ(g.D[0],g.D[1],rl);paint(C['brass-fill'],C.ink);bar(g.D[0],g.D[1],g.pin[0],g.pin[1],12,C['brass-fill']);circ(g.pin[0],g.pin[1],6);paint(C.part2,C.ink);pivot(g.D[0],g.D[1],5);
    label('STAR WHEEL · one slot is blank, so it stops',g.Wc[0]+100,g.Wc[1]+130);label('PIN ON THE WINDING ARBOR',g.D[0]-30,g.D[1]+130,'right');},
  reads(){const g=this.g;return[['Winding turns',`${g.turns.toFixed(2)} of 4`],['Purpose','stops over-winding']];}});

/* 225 / 237 swinging pawl arm (same action as 232) */
alias(225,232);alias(237,232);

/* 234 verge escapement */
reg({num:234,outLabel:'Foliot angle, degrees',N:15,
  update(phi){const v=0.55*Math.sin(phi);const u=phi/PI+0.5,k=Math.floor(u),s=smooth((u-k-0.4)/0.2);this.g={phi,v,W:-(k+s)*(TAU/this.N)/2};},
  output(){return this.g.v*180/PI;},
  draw(){const g=this.g,O=[400,310],R=110,N=this.N;
    const pts=[];for(let i=0;i<N;i++){const a=g.W+i*TAU/N;pts.push([O[0]+88*Math.cos(a),O[1]+88*Math.sin(a)]);pts.push([O[0]+R*Math.cos(a+TAU/N*0.15),O[1]+R*Math.sin(a+TAU/N*0.15)]);pts.push([O[0]+86*Math.cos(a+TAU/N*0.7),O[1]+86*Math.sin(a+TAU/N*0.7)]);}
    poly(pts);ctx.closePath();circ(O[0],O[1],8,false);paint(C['steel-fill'],C.ink);pivot(O[0],O[1],5);
    ctx.beginPath();ctx.rect(O[0]-5,90,10,R*2+150);paint(C.part,C.ink);
    for(const [y,s] of [[O[1]-R,1],[O[1]+R,-1]]){const w=34*Math.cos(g.v+s*0.9);ctx.beginPath();ctx.rect(O[0],y-8,w,16);paint(C['brass-fill'],C.ink);}
    const fl=200*Math.cos(g.v);bar(O[0]-fl,90,O[0]+fl,90,10,C['brass-fill']);for(const s of [-1,1]){circ(O[0]+s*fl*0.85,90,14);paint(C['brass-fill'],C.ink);}
    ground(O[0],50,40,true);bar(O[0],50,O[0],90,4,C.part);label('FOLIOT · swings to and fro',O[0]+210,70);label('CROWN WHEEL',O[0]+R+20,O[1]+60);label('VERGE WITH TWO PALLETS',O[0]+30,O[1]-R-20);},
  reads(){const g=this.g;return[['Foliot',`${(g.v*180/PI).toFixed(0)}°`],['Per swing','wheel escapes half a tooth'],['Era','early tower clocks']];}});

/* 271 ratchet bar */
reg({num:271,outLabel:'Bar travel, mm',
  reset(){this.X=0;this.lastA=null;this.dir=1;},
  update(phi){const a=0.32*Math.sin(phi);if(this.lastA!==null){this.X+=Math.abs(a-this.lastA)*90;this.dir=Math.sign(a-this.lastA)||this.dir;}this.lastA=a;this.g={phi,a};if(this.X>300)this.X-=300;},
  output(){return this.X;},
  draw(){const g=this.g,y=330,P=[400,150],p=24;
    const pts=[];for(let x=0;x<=760;x+=p){const xx=x+mod(this.X,p)-p;pts.push([xx,y]);pts.push([xx+p-2,y-18]);}poly([[0,y+30],...pts,[760,y+30]]);ctx.closePath();paint(C['steel-fill'],C.ink);
    const L=[P[0]+150*Math.sin(g.a),P[1]+150*Math.cos(g.a)];bar(P[0],P[1],P[0]-150*Math.sin(g.a),P[1]-150*Math.cos(g.a),16,C['brass-fill']);bar(P[0],P[1],L[0],L[1],10,C['brass-fill']);
    for(const s of [-1,1]){const pv=[P[0]+s*70*Math.cos(g.a),P[1]-s*70*Math.sin(g.a)];const eng=(s>0)===(this.dir>0);bar(pv[0],pv[1],pv[0]+s*10,eng?y-12:y-30,8,eng?C.part2:C.part);pivot(pv[0],pv[1],4);bar(P[0],P[1],pv[0],pv[1],8,C['brass-fill']);}
    pivot(P[0],P[1],6);ground(P[0],P[1]-12,40,true);label('RATCHET BAR',60,y+50);label('ROCKING LEVER WITH TWO PAWLS',P[0]+90,P[1]-30);},
  reads(){return[['Bar moved',`${this.X.toFixed(0)} mm`],['Strokes used','both']];}});

/* 95 / 272 swash plate */
function swash(num){return reg({num,outLabel:'Rod height, mm',
  update(phi){const al=0.38,h=110*Math.tan(al)*Math.cos(phi);this.g={phi,al,h,b:Math.atan(Math.tan(al)*Math.cos(phi))};},output(){return this.g.h;},
  draw(){const g=this.g,X=300,Y=290;ctx.beginPath();ctx.rect(X-10,Y-20,20,240);paint(C.part,C.ink);
    ctx.save();ctx.translate(X,Y);ctx.rotate(-g.b);ctx.beginPath();ctx.ellipse(0,0,170,16+14*Math.abs(Math.sin(g.phi)),0,0,TAU);paint(C['brass-fill'],C.ink);ctx.restore();
    const ry=Y-g.h-8;ctx.beginPath();ctx.rect(X+110-8,ry-220,16,220);paint(C['steel-fill'],C.ink);circ(X+110,ry,10);paint(C['steel-fill'],C.ink);
    for(const gy of [80,150]){ctx.beginPath();ctx.rect(X+110-28,gy,12,26);ctx.rect(X+110+16,gy,12,26);paint(C.part,C.ink);}
    bar(X,Y+220,X+240,Y+220,10,C.part);label('TILTED DISK',X-170,Y+60);label('ROD RIDES ON THE DISK',X+140,ry-120);},
  reads(){const g=this.g;return[['Tilt','22°'],['Rod height',`${g.h.toFixed(0)} mm`],['Strokes per turn','1']];}});}
swash(95);swash(272);

/* 97 / 106 grooved heart cam */
function grooveCam(num){return reg({num,outLabel:'Slide position, mm',O:[400,300],
  r(t){t=mod(t+PI,TAU)-PI;return 50+80*Math.abs(t)/PI;},
  update(phi){const t=-PI/2-phi;this.g={phi,h:this.r(t)};},output(){return this.g.h-50;},
  draw(){const g=this.g,O=this.O;circ(O[0],O[1],170);paint(C['brass-fill'],C.ink);
    const pts=[];for(let i=0;i<240;i++){const s=i/240*TAU-PI,r=this.r(s);pts.push([O[0]+r*Math.cos(s+g.phi),O[1]+r*Math.sin(s+g.phi)]);}
    ctx.save();ctx.lineJoin='round';poly(pts);ctx.closePath();ctx.strokeStyle=C.ink;ctx.lineWidth=20;ctx.stroke();ctx.strokeStyle=C.sheet;ctx.lineWidth=17;ctx.stroke();ctx.restore();pivot(O[0],O[1],6);
    const y=O[1]-g.h;ctx.beginPath();ctx.rect(O[0]-9,y-190,18,190);paint(C['steel-fill'],C.ink);circ(O[0],y,7);paint(C['steel-fill'],C.ink);
    for(const gy of [40,90]){ctx.beginPath();ctx.rect(O[0]-30,gy,12,26);ctx.rect(O[0]+18,gy,12,26);paint(C.part,C.ink);}
    label('PIN RUNS IN THE GROOVE',O[0]+30,y-40);label('HEART-SHAPED GROOVE',O[0]+180,O[1]+120);},
  reads(v){return[['Stroke','160 mm'],['Speed',`${Math.abs(v).toFixed(0)} mm/s, steady`],['Return','positive, no spring needed']];}});}
grooveCam(97);grooveCam(106);

/* 108 barrel cam */
reg({num:108,outLabel:'Follower position, mm',
  X(s){const f=mod(s/TAU,1);return 150*(1-4*Math.abs(f-0.5));},
  update(phi){this.g={phi,x:this.X(-phi)};},output(){return this.g.x;},
  draw(){const g=this.g,y=300,r=60;ctx.beginPath();ctx.rect(200,y-r,400,2*r);paint(C['brass-fill'],C.ink);
    ctx.save();ctx.beginPath();ctx.rect(200,y-r,400,2*r);ctx.clip();ctx.strokeStyle=C.ink;ctx.lineWidth=14;ctx.lineCap='round';
    for(const sgn of [1,-1]){ctx.beginPath();let on=false;for(let i=0;i<=200;i++){const s=i/200*TAU;const ang=s+g.phi;if(Math.cos(ang)>0){const xx=400+sgn*this.X(s)*0.98,yy=y+r*Math.sin(ang);on?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy);on=true;}else on=false;}ctx.stroke();}
    ctx.strokeStyle=C.sheet;ctx.lineWidth=10;for(const sgn of [1,-1]){ctx.beginPath();let on=false;for(let i=0;i<=200;i++){const s=i/200*TAU;const ang=s+g.phi;if(Math.cos(ang)>0){const xx=400+sgn*this.X(s)*0.98,yy=y+r*Math.sin(ang);on?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy);on=true;}else on=false;}ctx.stroke();}ctx.restore();
    bar(140,y,200,y,14,C.part);bar(600,y,660,y,14,C.part);
    const fx=400+g.x;bar(fx,y,fx,130,10,C['steel-fill']);circ(fx,y,6);paint(C.steel,C.ink);ctx.beginPath();ctx.rect(fx-60,110,120,20);paint(C['steel-fill'],C.ink);ctx.beginPath();ctx.rect(150,96,500,10);paint(C.part2,C.ink);
    label('CROSSING GROOVES',200,y+r+30);label('FOLLOWER',fx+16,150);},
  reads(){const g=this.g;return[['Follower',`${g.x.toFixed(0)} mm`],['Per turn','one full back-and-forth'],['Speed','uniform']];}});

/* 138 plate cam */
reg({num:138,outLabel:'Rod height, mm',O:[400,330],
  r(t){return 85+35*Math.cos(t)+14*Math.cos(2*t);},
  update(phi){this.g={phi,h:this.r(-PI/2-phi)};},output(){return this.g.h;},
  draw(){const g=this.g,O=this.O,pts=[];for(let i=0;i<200;i++){const s=i/200*TAU,r=this.r(s);pts.push([O[0]+r*Math.cos(s+g.phi),O[1]+r*Math.sin(s+g.phi)]);}
    poly(pts);ctx.closePath();circ(O[0],O[1],9,false);paint(C['brass-fill'],C.ink);pivot(O[0],O[1],6);
    const y=O[1]-g.h-12;ctx.beginPath();ctx.rect(O[0]-8,y-200,16,200);paint(C['steel-fill'],C.ink);circ(O[0],y,12);paint(C['steel-fill'],C.ink);pivot(O[0],y,3);
    for(const gy of [60,120]){ctx.beginPath();ctx.rect(O[0]-28,gy,12,26);ctx.rect(O[0]+16,gy,12,26);paint(C.part,C.ink);}
    label('CAM',O[0]+130,O[1]+80);label('ROD FALLS BY ITS OWN WEIGHT',O[0]+30,y-80);},
  reads(){const g=this.g;return[['Rod height',`${g.h.toFixed(0)} mm`],['Motion','shaped by the cam outline']];}});

/* 165 wave cam */
reg({num:165,outLabel:'Bar height, mm',
  update(phi){this.g={phi,h:25*Math.cos(4*phi)};},output(){return this.g.h;},
  draw(){const g=this.g,cx=400,top=260,R=170;const edge=[];for(let i=0;i<=80;i++){const s=-PI/2+i/80*PI;edge.push([cx+R*Math.sin(s),top-25*Math.cos(4*(s-g.phi))]);}
    poly([[cx-R,420],...edge,[cx+R,420]]);ctx.closePath();paint(C['brass-fill'],C.ink);bar(cx,420,cx,480,16,C.part);
    const fy=top-25*Math.cos(4*(-g.phi))-10;ctx.beginPath();ctx.rect(cx-8,fy-180,16,180);paint(C['steel-fill'],C.ink);circ(cx,fy,10);paint(C['steel-fill'],C.ink);
    for(const gy of [70,130]){ctx.beginPath();ctx.rect(cx-28,gy,12,26);ctx.rect(cx+16,gy,12,26);paint(C.part,C.ink);}
    label('WAVY RIM · 4 waves',cx+R+10,top+30);label('BAR RISES 4 TIMES A TURN',cx+30,fy-60);},
  reads(){const g=this.g;return[['Rises per turn','4'],['Bar height',`${g.h.toFixed(0)} mm`]];}});

/* 276 constant-diameter cam */
reg({num:276,outLabel:'Yoke position, mm',O:[400,270],D:150,
  pts(rot){const D=this.D,V=[0,1,2].map(k=>{const a=-PI/2+k*TAU/3;return[D/Math.sqrt(3)*Math.cos(a),D/Math.sqrt(3)*Math.sin(a)];});const out=[];
    for(let k=0;k<3;k++){const c=V[k],a=V[(k+1)%3],b=V[(k+2)%3];const a0=Math.atan2(a[1]-c[1],a[0]-c[0]),a1=Math.atan2(b[1]-c[1],b[0]-c[0]);let d=a1-a0;d=mod(d+PI,TAU)-PI;for(let i=0;i<=20;i++){const t=a0+d*i/20;out.push([c[0]+D*Math.cos(t),c[1]+D*Math.sin(t)]);}}
    return out.map(([x,y])=>[this.O[0]+x*Math.cos(rot)-y*Math.sin(rot),this.O[1]+x*Math.sin(rot)+y*Math.cos(rot)]);},
  update(phi){const P=this.pts(phi);let mn=1e9;for(const p of P)mn=Math.min(mn,p[0]);this.g={phi,P,mn};},output(){return this.g.mn-this.O[0];},
  draw(){const g=this.g,O=this.O,x0=g.mn,x1=g.mn+this.D;ctx.beginPath();ctx.rect(x0-20,O[1]-120,x1-x0+40,240);ctx.rect(x0,O[1]-100,x1-x0,200);paint(C['steel-fill'],C.ink);
    bar(40,O[1],x0-20,O[1],16,C['steel-fill']);bar(x1+20,O[1],760,O[1],16,C['steel-fill']);
    poly(g.P);ctx.closePath();circ(O[0],O[1],7,false);paint(C['brass-fill'],C.ink);pivot(O[0],O[1],6);label('SAME WIDTH IN EVERY DIRECTION',O[0],O[1]+150,'center');},
  reads(){const g=this.g;return[['Cam width','always 150 mm'],['Yoke',`${(g.mn-this.O[0]).toFixed(0)} mm`],['Contact','both faces, always']];}});

/* 101 slotted swinging bar */
reg({num:101,outLabel:'Bar position, mm',P0:[400,60],O:[400,300],r:70,yb:470,
  update(phi){const pin=[this.O[0]+this.r*Math.cos(phi),this.O[1]+this.r*Math.sin(phi)];const a=Math.atan2(pin[0]-this.P0[0],pin[1]-this.P0[1]);this.g={phi,pin,a,x:this.P0[0]+(this.yb-this.P0[1])*Math.tan(a)};},
  output(){return this.g.x-this.P0[0];},
  draw(){const g=this.g,P=this.P0;ctx.beginPath();ctx.rect(g.x-280,this.yb-12,560,24);paint(C['steel-fill'],C.ink);for(const gx of [80,720]){ctx.beginPath();ctx.rect(gx-24,this.yb-24,48,10);ctx.rect(gx-24,this.yb+14,48,10);paint(C.part,C.ink);}
    circ(this.O[0],this.O[1],this.r+22);paint(C['brass-fill'],C.ink);
    ctx.save();ctx.translate(P[0],P[1]);ctx.rotate(-g.a);ctx.beginPath();capsule(0,0,0,(this.yb-P[1])/Math.cos(g.a)+14,14);capsule(0,140,0,330,6);paint(C.part2,C.ink);ctx.restore();
    ctx.beginPath();ctx.rect(g.pin[0]-8,g.pin[1]-8,16,16);paint(C.part,C.ink);pivot(g.pin[0],g.pin[1],4);pivot(this.O[0],this.O[1],6);pivot(P[0],P[1],6);ground(P[0],P[1]-12,40,true);pivot(g.x,this.yb,5);
    label('SWINGING SLOTTED BAR',P[0]+30,P[1]+40);},
  reads(v){return[['Bar speed',`${v.toFixed(0)} mm/s`],['Stroke',`${(2*(this.yb-this.P0[1])*Math.tan(Math.asin(this.r/(this.O[1]-this.P0[1])))).toFixed(0)} mm`]];}});

/* 129 Chinese windlass */
reg({num:129,outLabel:'Load height, mm',r1:44,r2:30,
  update(phi){const th=6*PI*Math.sin(phi);this.g={phi,th,lift:(this.r1-this.r2)/2*th};},output(){return this.g.lift;},
  draw(){const g=this.g,B=[400,110],y=360-g.lift,cx=B[0]-(this.r1-this.r2)/2,rp=(this.r1+this.r2)/2;
    rope([[B[0]-this.r1,B[1]],[cx-rp,y]]);rope([[B[0]+this.r2,B[1]],[cx+rp,y]]);ctx.beginPath();ctx.arc(cx,y,rp,0,PI);ctx.strokeStyle=C.ink;ctx.lineWidth=2;ctx.stroke();
    circ(B[0],B[1],this.r1);paint(C['brass-fill'],C.ink);circ(B[0],B[1],this.r2);paint(C.part2,C.ink);bar(B[0],B[1],B[0]+38*Math.cos(g.th),B[1]+38*Math.sin(g.th),6,C.part);pivot(B[0],B[1],5);
    pulley(cx,y,rp-4,-g.th*0.2,C['steel-fill']);bar(cx,y,cx,y+40,6,C.part);weight(cx,y+40,90,60,'LOAD');
    bar(B[0]-140,B[1],B[0]-60,B[1],10,C.part);label('BIG AND SMALL BARREL ON ONE AXLE',B[0]+60,B[1]-30);},
  reads(){const g=this.g;return[['Crank turns',`${(g.th/TAU).toFixed(2)}`],['Load moves',`${g.lift.toFixed(1)} mm`],['Per turn',`${((this.r1-this.r2)*PI).toFixed(0)} mm, very slow and strong`]];}});

/* 131 sector and rack */
reg({num:131,outLabel:'Rack position, mm',P0:[400,120],O:[400,280],r:55,R:300,
  update(phi){const pin=[this.O[0]+this.r*Math.cos(phi),this.O[1]+this.r*Math.sin(phi)];const a=Math.atan2(pin[0]-this.P0[0],pin[1]-this.P0[1]);this.g={phi,pin,a,x:-this.R*a};},
  output(){return this.g.x;},
  draw(){const g=this.g,P=this.P0,R=this.R,m=6,Z=Math.round(2*R/m),yr=P[1]+R;
    const ang=PI/2-g.a,pts=gearPts(P[0],P[1],R,Z,ang+PI/Z,false,ang-0.32,ang+0.32);ctx.beginPath();ctx.moveTo(P[0],P[1]);poly(pts,false);ctx.lineTo(P[0],P[1]);paint(C['steel-fill'],C.ink);
    ctx.save();ctx.beginPath();ctx.moveTo(P[0],P[1]);for(const p of pts)ctx.lineTo(...p);ctx.closePath();paint(C['steel-fill'],C.ink);ctx.restore();
    const p=PI*m,rt=rackTeeth(60,740,P[0]+g.x,p,yr,m,false);poly([[60,yr+36],[60,yr+1.25*m],...rt,[740,yr+1.25*m],[740,yr+36]]);ctx.closePath();paint(C['steel-fill'],C.ink);
    circ(this.O[0],this.O[1],this.r+20);paint(C['brass-fill'],C.ink);ctx.beginPath();ctx.rect(g.pin[0]-8,g.pin[1]-8,16,16);paint(C.part,C.ink);pivot(g.pin[0],g.pin[1],4);pivot(this.O[0],this.O[1],6);pivot(P[0],P[1],7);ground(P[0],P[1]-12,40,true);
    label('CRANK',this.O[0]+90,this.O[1]);label('TOOTHED SECTOR',P[0]+170,yr-60);label('RACK',80,yr+56);},
  reads(){const g=this.g;return[['Sector swing',`${(g.a*180/PI).toFixed(1)}°`],['Rack',`${g.x.toFixed(0)} mm`]];}});

/* 134 rope drum */
reg({num:134,outLabel:'Load height, mm',
  update(phi){const th=3*PI*(1-Math.cos(phi));this.g={phi,th,lift:50*th};},output(){return this.g.lift/10;},
  draw(){const g=this.g,D=[400,120],r=50,y=420-g.lift/10;rope([[D[0]+r,D[1]],[D[0]+r,y]]);circ(D[0],D[1],r);paint(C['brass-fill'],C.ink);
    ctx.save();ctx.strokeStyle=C.ink;for(let k=0;k<10;k++){const t=g.th+k*TAU/10;ctx.beginPath();ctx.moveTo(D[0]+r*0.3*Math.cos(t),D[1]+r*0.3*Math.sin(t));ctx.lineTo(D[0]+r*Math.cos(t),D[1]+r*Math.sin(t));ctx.stroke();}ctx.restore();
    bar(D[0],D[1],D[0]+80*Math.cos(g.th*0.5),D[1]+80*Math.sin(g.th*0.5),8,C.part);pivot(D[0],D[1],6);weight(D[0]+r,y,80,60,'LOAD');label('ROPE WINDS ON THE DRUM',D[0]-60,D[1]-70);},
  reads(){const g=this.g;return[['Drum turns',`${(g.th/TAU).toFixed(2)}`],['Per turn',`${(TAU*5).toFixed(0)} mm of rope (scaled)`]];}});

/* 151 right- and left-hand screws */
reg({num:151,outLabel:'Gap between nuts, mm',p:20,
  update(phi){const th=5*PI*Math.sin(phi);this.g={phi,th,t:th/TAU*this.p};},output(){return 300-2*this.g.t;},
  draw(){const g=this.g,y=260,r=20,p=this.p,sh=mod(g.th/TAU*p,p);ctx.beginPath();ctx.rect(120,y-r,560,2*r);paint(C['brass-fill'],C.ink);
    ctx.save();ctx.beginPath();ctx.rect(120,y-r,280,2*r);ctx.clip();ctx.strokeStyle=C.ink;ctx.lineWidth=2;for(let x=120-p+sh;x<420;x+=p){ctx.beginPath();ctx.moveTo(x,y-r);ctx.lineTo(x+p/2,y+r);ctx.stroke();}ctx.restore();
    ctx.save();ctx.beginPath();ctx.rect(400,y-r,280,2*r);ctx.clip();ctx.strokeStyle=C.ink;ctx.lineWidth=2;for(let x=400-p-sh+p;x<700;x+=p){ctx.beginPath();ctx.moveTo(x+p/2,y-r);ctx.lineTo(x,y+r);ctx.stroke();}ctx.restore();
    circ(90,y,40);paint(C['brass-fill'],C.ink);for(let k=0;k<3;k++){const a=g.th+k*TAU/3;bar(90,y,90+34*Math.cos(a),y+34*Math.sin(a),6,C.part2);}pivot(90,y,5);
    for(const [x0,s] of [[250,1],[550,-1]]){const x=x0+s*g.t;ctx.beginPath();ctx.rect(x-30,y-40,60,80);paint(C['steel-fill'],C.ink);ctx.beginPath();ctx.rect(x-30,y+40,60,26);paint(C['steel-fill'],C.ink);}
    ctx.beginPath();ctx.rect(130,y+66,540,10);paint(C.part2,C.ink);label('RIGHT-HAND THREAD',260,y-60,'center');label('LEFT-HAND THREAD',540,y-60,'center');},
  reads(){const g=this.g;return[['Gap',`${(300-2*g.t).toFixed(0)} mm`],['Nuts','move together or apart']];}});

/* 105 screw press */
reg({num:105,outLabel:'Platen height, mm',p:30,
  update(phi){const th=3*PI*(1-Math.cos(phi));this.g={phi,th,d:th/TAU*this.p};},output(){return -this.g.d;},
  draw(){const g=this.g,X=400,yP=230+g.d;ctx.beginPath();ctx.rect(X-200,60,400,30);ctx.rect(X-200,90,30,400);ctx.rect(X+170,90,30,400);ctx.rect(X-200,460,400,30);paint(C.part2,C.ink);
    ctx.beginPath();ctx.rect(X-16,40,32,yP-40);paint(C['brass-fill'],C.ink);ctx.save();ctx.beginPath();ctx.rect(X-16,40,32,yP-40);ctx.clip();ctx.strokeStyle=C.ink;ctx.lineWidth=2;const sh=mod(g.th/TAU*this.p,this.p);for(let y=40-this.p+sh;y<yP;y+=this.p){ctx.beginPath();ctx.moveTo(X-16,y);ctx.lineTo(X+16,y+this.p/2);ctx.stroke();}ctx.restore();
    const L=170*Math.cos(g.th);bar(X-L,40,X+L,40,10,C['brass-fill']);for(const s of [-1,1]){circ(X+s*L,40,16+6*s*Math.sin(g.th)*0);paint(C['brass-fill'],C.ink);}
    ctx.beginPath();ctx.rect(X-130,yP,260,30);paint(C['steel-fill'],C.ink);hatchRect(X-100,430,200,30,C.part);
    label('BALLED LEVER',X+180,30);label('PLATEN',X+140,yP+16);},
  reads(){const g=this.g;return[['Screw turns',`${(g.th/TAU).toFixed(2)}`],['Platen down',`${g.d.toFixed(0)} mm`],['Pitch',`${this.p} mm`]];}});

/* 111 / 266 differential screw */
function diffScrew(num){return reg({num,outLabel:'Carriage position, mm',p1:14,p2:12,
  update(phi){const th=5*PI*Math.sin(phi);this.g={phi,th,s:th/TAU*this.p1,c:th/TAU*(this.p1-this.p2)};},output(){return this.g.c;},
  draw(){const g=this.g,y=260,r=18;const sx=g.s;ctx.beginPath();ctx.rect(150+sx,y-r,460,2*r);paint(C['brass-fill'],C.ink);
    const thr=(x0,x1,p)=>{ctx.save();ctx.beginPath();ctx.rect(x0,y-r,x1-x0,2*r);ctx.clip();ctx.strokeStyle=C.ink;ctx.lineWidth=2;const sh=mod(g.th/TAU*p+sx,p);for(let x=x0-p+sh;x<x1+p;x+=p){ctx.beginPath();ctx.moveTo(x,y-r);ctx.lineTo(x+p/2,y+r);ctx.stroke();}ctx.restore();};
    thr(150+sx,380+sx,this.p1);thr(380+sx,610+sx,this.p2);
    circ(120+sx,y,36);paint(C['brass-fill'],C.ink);for(let k=0;k<3;k++){const a=g.th+k*TAU/3;bar(120+sx,y,120+sx+30*Math.cos(a),y+30*Math.sin(a),6,C.part2);}pivot(120+sx,y,5);
    ctx.beginPath();ctx.rect(240,y-46,60,92);paint(C.part2,C.ink);ground(270,y+60,80);ctx.beginPath();ctx.rect(258,y+46,24,14);paint(C.part2,C.ink);
    const cx=500+g.c;ctx.beginPath();ctx.rect(cx-34,y-50,68,100);paint(C['steel-fill'],C.ink);ctx.beginPath();ctx.rect(cx-34,y+50,68,24);paint(C['steel-fill'],C.ink);ctx.beginPath();ctx.rect(160,y+74,560,8);paint(C.part2,C.ink);
    label(`FIXED NUT · ${this.p1} mm pitch`,270,y-66,'center');label(`CARRIAGE · ${this.p2} mm pitch`,cx,y-66,'center');},
  reads(){const g=this.g;return[['Screw turns',`${(g.th/TAU).toFixed(2)}`],['Screw moves',`${g.s.toFixed(1)} mm`],['Carriage moves',`${g.c.toFixed(2)} mm`],['Per turn',`${this.p1-this.p2} mm`]];}});}
diffScrew(111);diffScrew(266);

/* 112 Persian drill */
reg({num:112,outLabel:'Spindle angle, turns',
  update(phi){const y=(1-Math.cos(phi))/2;this.g={phi,y,a:y*2.5};},output(){return this.g.a;},
  draw(){const g=this.g,X=400,top=70,bot=420,lead=60,by=150+g.y*200;
    ctx.beginPath();ctx.rect(X-12,top,24,bot-top);paint(C['steel-fill'],C.ink);ctx.save();ctx.beginPath();ctx.rect(X-12,top,24,bot-top);ctx.clip();ctx.strokeStyle=C.ink;ctx.lineWidth=2;const sh=mod(g.a*lead,lead);for(let y=top-lead+sh;y<bot+lead;y+=lead/2){ctx.beginPath();ctx.moveTo(X-12,y);ctx.lineTo(X+12,y+lead/2);ctx.stroke();}ctx.restore();
    ctx.beginPath();ctx.ellipse(X,top-6,40,12,0,0,TAU);paint(C.part2,C.ink);
    ctx.beginPath();ctx.rect(X-32,by-14,64,28);paint(C['brass-fill'],C.ink);
    ctx.beginPath();ctx.moveTo(X-5,bot);ctx.lineTo(X,bot+40);ctx.lineTo(X+5,bot);paint(C.part,C.ink);hatchRect(X-120,bot+40,240,40,C.part2);
    label('BUTTON · slide up and down',X+40,by);label('QUICK SPIRAL',X+30,top+40);},
  reads(){const g=this.g;return[['Spindle',`${g.a.toFixed(2)} turns`],['Direction','reverses each stroke']];}});

/* 242 band brake */
reg({num:242,outLabel:'Drum speed, %',
  reset(){this.w=1;this.a=0;this.last=null;},
  update(phi){const b=Math.sin(phi*0.5)>0.2?1:0;if(this.last===null)this.last=phi;const d=Math.abs(phi-this.last);this.last=phi;this.w+=b?-0.9*d:0.5*d;this.w=clamp(this.w,0,1);this.a+=this.w*d*3;this.g={phi,b};},
  output(){return this.w*100;},
  draw(){const g=this.g,D=[380,280],r=110;flywheel(D[0],D[1],r,this.a,C['steel-fill']);
    const lv=g.b?0.18:-0.08;const P=[560,420],E=[P[0]-170*Math.cos(lv),P[1]-170*Math.sin(lv)];
    ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=g.b?7:5;ctx.beginPath();ctx.arc(D[0],D[1],r+(g.b?4:12),0.3,PI*1.9,false);ctx.stroke();ctx.strokeStyle=C['brass-fill'];ctx.lineWidth=g.b?4:2;ctx.stroke();ctx.restore();
    bar(D[0]+(r+8)*Math.cos(0.3),D[1]+(r+8)*Math.sin(0.3),P[0]-30,P[1]-4,6,C.part);bar(D[0]+(r+8)*Math.cos(PI*1.9),D[1]+(r+8)*Math.sin(PI*1.9),P[0]-60,P[1]-12,6,C.part);
    bar(P[0],P[1],P[0]+150,P[1]+150*Math.tan(lv)*1.5,14,C['brass-fill']);pivot(P[0],P[1],6);ground(P[0],P[1]+14,40);
    label(g.b?'BRAKE ON · band tight':'BRAKE OFF',D[0],D[1]+170,'center');},
  reads(){const g=this.g;return[['Brake',g.b?'applied':'released'],['Drum speed',`${(this.w*100).toFixed(0)} %`]];}});

/* 245 bayonet joint */
reg({num:245,outLabel:'Plug depth, mm',
  update(phi){const u=mod(phi/TAU,1);let y,x,st;if(u<0.25){y=smooth(u/0.25);x=0;st='push in';}else if(u<0.4){y=1;x=smooth((u-0.25)/0.15);st='twist to lock';}else if(u<0.6){y=1;x=1;st='locked';}else if(u<0.75){y=1;x=1-smooth((u-0.6)/0.15);st='twist back';}else{y=1-smooth((u-0.75)/0.25);x=0;st='pull out';}this.g={phi,x,y,st};},
  output(){return this.g.y*120;},
  draw(){const g=this.g,X=400,top=200;ctx.beginPath();ctx.rect(X-90,top,180,280);paint(C.part,C.ink);
    ctx.beginPath();ctx.moveTo(X-12,top);ctx.lineTo(X-12,top+130);ctx.lineTo(X+70,top+130);ctx.lineTo(X+70,top+106);ctx.lineTo(X+12,top+106);ctx.lineTo(X+12,top);ctx.closePath();ctx.fillStyle=C.sheet;ctx.fill();ctx.strokeStyle=C.ink;ctx.lineWidth=1.2;ctx.stroke();
    const py=top-120+g.y*238;ctx.save();ctx.globalAlpha=.85;ctx.beginPath();ctx.rect(X-70,py-200,140,200);paint(C['steel-fill'],C.ink);ctx.restore();
    const pinx=X+g.x*58,piny=py-12;circ(pinx,piny,10);paint(C['brass-fill'],C.ink);
    label('L-SHAPED SLOT',X+110,top+120);label(g.st.toUpperCase(),X,500,'center');},
  reads(){const g=this.g;return[['Step',g.st],['Holds by','a pin in an L-shaped slot']];}});

/* 251 pile driver */
reg({num:251,outLabel:'Weight height, mm',
  update(phi){const k=Math.floor(phi/TAU),u=mod(phi/TAU,1);let h;if(u<0.7)h=u/0.7;else if(u<0.78){const t=(u-0.7)/0.08;h=1-t*t;}else h=0;this.g={phi,h,released:u>=0.7,depth:clamp(k,0,40)*2+(u>=0.78?2:0)};},
  output(){return this.g.h*250;},
  draw(){const g=this.g,X=400,top=60,yW=380-g.h*250-mod(g.depth,40);ctx.beginPath();ctx.rect(X-110,top,20,440);ctx.rect(X+90,top,20,440);ctx.rect(X-110,top-14,220,16);paint(C.part2,C.ink);
    pulley(X,top+10,18,g.h*20,C.part);ctx.beginPath();ctx.moveTo(X-60,top+120);ctx.lineTo(X-24,top+120);ctx.lineTo(X-60,top+160);ctx.closePath();paint(C.part,C.ink);ctx.beginPath();ctx.moveTo(X+60,top+120);ctx.lineTo(X+24,top+120);ctx.lineTo(X+60,top+160);ctx.closePath();paint(C.part,C.ink);
    const hy=g.released?top+150:yW-30;rope([[X,top+28],[X,hy-10]]);
    ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=4;const o=g.released?14:0;ctx.beginPath();ctx.moveTo(X-6,hy-10);ctx.lineTo(X-6-o,hy+16);ctx.moveTo(X+6,hy-10);ctx.lineTo(X+6+o,hy+16);ctx.stroke();ctx.restore();
    ctx.beginPath();ctx.rect(X-50,yW,100,70);paint(C['brass-fill'],C.ink);const pileTop=452+mod(g.depth,40);ctx.beginPath();ctx.rect(X-20,pileTop,40,90);paint(C['steel-fill'],C.ink);
    ctx.save();ctx.fillStyle=C.part2;ctx.fillRect(40,470,720,50);ctx.restore();label(g.released?'HOOKS OPEN · weight falls':'HOOKS CARRY THE WEIGHT UP',X+130,yW+30);label('WEDGES',X-70,top+110,'right');},
  reads(){const g=this.g;return[['Phase',g.released?'falling':'lifting'],['Blows',`${Math.floor(g.phi/TAU)}`]];}});

/* 270 roller bearing */
reg({num:270,outLabel:'Cage turns',
  update(phi){this.g={phi,c:phi/3,rs:-phi};},output(){return this.g.c/TAU;},
  draw(){const g=this.g,O=[400,260];circ(O[0],O[1],170);circ(O[0],O[1],122,false);paint(C.part2,C.ink);ground(O[0],O[1]+170,120);
    for(let k=0;k<8;k++){const a=g.c+k*TAU/8,P=[O[0]+91*Math.cos(a),O[1]+91*Math.sin(a)];circ(P[0],P[1],29);paint(C['steel-fill'],C.ink);bar(P[0],P[1],P[0]+20*Math.cos(g.rs+a),P[1]+20*Math.sin(g.rs+a),4,C.steel);}
    circ(O[0],O[1],60);circ(O[0],O[1],18,false);paint(C['brass-fill'],C.ink);bar(O[0],O[1],O[0]+50*Math.cos(g.phi),O[1]+50*Math.sin(g.phi),6,C.part);pivot(O[0],O[1],5);
    label('SHAFT',O[0]-40,O[1]-80,'right');label('ROLLERS · travel at ⅓ shaft speed',O[0]+180,O[1]-140);},
  reads(){const g=this.g;return[['Shaft turns',`${(g.phi/TAU).toFixed(2)}`],['Rollers orbit',`${(g.c/TAU).toFixed(2)}`],['Friction','rolling, not sliding']];}});

/* 325 swing-arm parallel ruler */
reg({num:325,outLabel:'Ruler gap, mm',
  update(phi){const a=0.25+0.9*(1+Math.sin(phi))/2;this.g={phi,a};},output(){return 120*Math.sin(this.g.a);},
  draw(){const g=this.g,y0=380,L=120,dx=L*Math.cos(g.a),dy=L*Math.sin(g.a);ctx.beginPath();ctx.rect(160,y0,480,30);paint(C.part2,C.ink);ctx.beginPath();ctx.rect(160+dx,y0-dy-30,480,30);paint(C['brass-fill'],C.ink);
    for(const x of [260,540]){bar(x,y0+15,x+dx,y0-dy-15,10,C.part);pivot(x,y0+15,4);pivot(x+dx,y0-dy-15,4);}
    ctx.save();ctx.setLineDash([4,4]);ctx.strokeStyle=C.steel;ctx.beginPath();ctx.moveTo(100,y0-dy-30);ctx.lineTo(720,y0-dy-30);ctx.stroke();ctx.restore();label('EDGES STAY PARALLEL',400,y0-dy-60,'center');},
  reads(){const g=this.g;return[['Gap',`${(120*Math.sin(g.a)).toFixed(0)} mm`],['Linkage','parallelogram']];}});

/* 328 Cartwright's parallel motion */
reg({num:328,outLabel:'Crosshead height, mm',r:45,L:200,w:70,
  reset(){this.trail=[];},
  update(phi){const A=[340,400],B=[460,400],r=this.r;const pa=[A[0]+r*Math.cos(phi),A[1]+r*Math.sin(phi)],pb=[B[0]-r*Math.cos(phi),B[1]+r*Math.sin(phi)];const xl=400-this.w,yc=pa[1]-Math.sqrt(this.L**2-(xl-pa[0])**2);this.g={phi,A,B,pa,pb,yc};this.trail=this.trail||[];this.trail.push([400,yc-120]);if(this.trail.length>200)this.trail.shift();},
  output(){return 400-this.g.yc;},
  draw(){const g=this.g,w=this.w;drawGear(g.A[0],g.A[1],60,24,g.phi,C['brass-fill'],{bore:6});drawGear(g.B[0],g.B[1],60,24,-g.phi+PI+PI/24,C['brass-fill'],{bore:6});
    bar(g.A[0],g.A[1],g.pa[0],g.pa[1],12,C.part2);bar(g.B[0],g.B[1],g.pb[0],g.pb[1],12,C.part2);
    bar(g.pa[0],g.pa[1],400-w,g.yc,9,C.part);bar(g.pb[0],g.pb[1],400+w,g.yc,9,C.part);ctx.beginPath();ctx.rect(400-w-10,g.yc-10,2*w+20,20);paint(C['steel-fill'],C.ink);
    bar(400,g.yc,400,g.yc-150,10,C['steel-fill']);ctx.beginPath();ctx.rect(340,40,120,90);paint(C.part2,C.ink);
    for(const p of [g.pa,g.pb,[400-w,g.yc],[400+w,g.yc]])pivot(p[0],p[1],4);pivot(g.A[0],g.A[1],5);pivot(g.B[0],g.B[1],5);
    label('PISTON ROD MOVES IN A TRUE STRAIGHT LINE',470,g.yc-100);label('TWO EQUAL GEARS TURN OPPOSITE WAYS',400,500,'center');},
  reads(){const g=this.g;return[['Crosshead',`${(400-g.yc).toFixed(0)} mm`],['Sideways error','zero (symmetric)']];}});

/* 345 pendulum engine */
reg({num:345,outLabel:'Cylinder angle, degrees',T:[400,90],O:[400,390],r:60,
  update(phi){const pin=[this.O[0]+this.r*Math.cos(phi),this.O[1]+this.r*Math.sin(phi)];const a=Math.atan2(pin[0]-this.T[0],pin[1]-this.T[1]);this.g={phi,pin,a,d:Math.hypot(pin[0]-this.T[0],pin[1]-this.T[1])};},
  output(){return this.g.a*180/PI;},
  draw(){const g=this.g,T=this.T,O=this.O;flywheel(O[0],O[1],110,g.phi);bar(O[0],O[1],g.pin[0],g.pin[1],14,C['brass-fill']);
    ctx.save();ctx.translate(T[0],T[1]);ctx.rotate(-g.a);ctx.beginPath();ctx.rect(-44,-12,88,244);ctx.rect(-34,10,68,222);paint(C.part2,C.ink);ctx.beginPath();ctx.rect(-32,g.d-160,64,24);paint(C['steel-fill'],C.ink);bar(0,g.d-148,0,g.d,10,C.part);ctx.restore();
    pivot(g.pin[0],g.pin[1],5);pivot(O[0],O[1],6);circ(T[0],T[1],12);paint(C.hi,C.ink);pivot(T[0],T[1],4);ground(T[0],T[1]-14,60,true);label('CYLINDER SWINGS FROM THE TOP',T[0]+60,T[1]+20);},
  reads(){const g=this.g;return[['Cylinder swing',`${(g.a*180/PI).toFixed(1)}°`],['Stroke',`${2*this.r} mm`]];}});

/* 369 cycloidal pendulum */
reg({num:369,outLabel:'Bob x, mm',S:[400,80],a:60,
  update(phi){const t=1.9*Math.sin(phi);this.g={phi,t};},output(){const a=this.a,t=this.g.t;return a*(t+Math.sin(t));},
  draw(){const g=this.g,S=this.S,a=this.a,t=g.t;
    for(const s of [-1,1]){const pts=[S];for(let i=0;i<=40;i++){const u=i/40*PI;pts.push([S[0]+s*a*(u-Math.sin(u)),S[1]+a*(1-Math.cos(u))]);}ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(...pts[0]);for(const p of pts)ctx.lineTo(...p);ctx.stroke();ctx.restore();}
    ctx.save();ctx.strokeStyle=C.rule;ctx.setLineDash([4,4]);ctx.beginPath();for(let i=0;i<=80;i++){const u=-PI+i/80*TAU;const x=S[0]+a*(u+Math.sin(u)),y=S[1]+4*a-a*(1-Math.cos(u));i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();ctx.restore();
    const s=Math.sign(t)||1,u=Math.abs(t),bob=[S[0]+a*(t+Math.sin(t)),S[1]+4*a-a*(1-Math.cos(t))];const pts=[S];for(let i=0;i<=20;i++){const v=i/20*u;pts.push([S[0]+s*a*(v-Math.sin(v)),S[1]+a*(1-Math.cos(v))]);}pts.push(bob);
    ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(...pts[0]);for(const p of pts)ctx.lineTo(...p);ctx.stroke();ctx.restore();
    circ(bob[0],bob[1],18);paint(C['brass-fill'],C.ink);ground(S[0],S[1],80,true);label('CYCLOIDAL CHEEKS',S[0]+a*PI+10,S[1]+2*a);label('BOB FOLLOWS A CYCLOID',S[0]+120,S[1]+4*a+30);},
  reads(){return[['Swing time','the same for big and small swings'],['Inventor','Christiaan Huygens, 1673']];}});

/* 375 edge runner mill */
reg({num:375,outLabel:'Runner position',
  update(phi){this.g={phi:phi*0.5};},output(){return Math.cos(this.g.phi);},
  draw(){const g=this.g,X=400,yp=420,R=130,rw=80;ctx.beginPath();ctx.ellipse(X,yp,250,60,0,0,TAU);paint(C.part2,C.ink);ctx.beginPath();ctx.ellipse(X,yp,215,48,0,0,TAU);paint(C['brass-fill'],C.ink);
    ctx.beginPath();ctx.rect(X-10,60,20,yp-60);paint(C.part,C.ink);
    const wheels=[0,1].map(k=>{const az=g.phi+k*PI;return{az,x:X+R*Math.cos(az),z:Math.sin(az)};}).sort((a,b)=>a.z-b.z);
    for(const w of wheels){const yc=yp-rw+w.z*30;bar(X,yp-rw,w.x,yc,10,C.part2);const face=Math.abs(Math.sin(w.az));ctx.beginPath();ctx.ellipse(w.x,yc,rw*face+24*Math.abs(Math.cos(w.az)),rw,0,0,TAU);paint(C['steel-fill'],C.ink);if(face>0.3){ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=1;const sp=-g.phi*R/rw;for(let k=0;k<4;k++){const t=sp+k*PI/4;ctx.beginPath();ctx.moveTo(w.x-rw*face*Math.cos(t),yc-rw*Math.sin(t));ctx.lineTo(w.x+rw*face*Math.cos(t),yc+rw*Math.sin(t));ctx.stroke();}ctx.restore();}}
    label('TWO ROLLING STONES',X+260,yp-120);label('PAN',X+260,yp+20);},
  reads(){return[['Action','crushing and rubbing'],['Uses','oilseed, clay, spices, ore']];}});

/* 392 jig saw */
reg({num:392,outLabel:'Blade position, mm',O:[400,440],r:40,L:120,
  update(phi){const pin=[this.O[0]+this.r*Math.cos(phi),this.O[1]+this.r*Math.sin(phi)];const yb=pin[1]-Math.sqrt(this.L**2-(pin[0]-this.O[0])**2);this.g={phi,pin,yb};},
  output(){return this.O[1]-this.g.yb;},
  draw(){const g=this.g,X=this.O[0];ctx.beginPath();ctx.rect(150,300,500,16);paint(C.part2,C.ink);hatchRect(330,270,120,30,C['brass-fill']);
    ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(X,g.yb);ctx.lineTo(X,g.yb-230);ctx.stroke();ctx.restore();
    springZ(X,g.yb-230,X,60,10,8);ground(X,60,60,true);flywheel(X,this.O[1],60,g.phi,C['brass-fill']);bar(X,this.O[1],g.pin[0],g.pin[1],10,C.part2);bar(g.pin[0],g.pin[1],X,g.yb,8,C.part);pivot(g.pin[0],g.pin[1],4);pivot(X,g.yb,4);
    label('SPRING KEEPS THE BLADE TAUT',X+30,110);label('CRANK PULLS IT DOWN',X+80,this.O[1]);},
  reads(){return[['Stroke',`${2*this.r} mm`],['Guide','not needed, the spring holds it']];}});

/* 409 proportional compasses */
reg({num:409,outLabel:'Large opening, mm',params:[{id:'f',label:'Pivot position',min:0.25,max:0.5,step:0.01,value:0.35,fmt:v=>`ratio ${(v/(1-v)).toFixed(2)} : 1`}],L:360,
  update(phi){const al=0.15+0.25*(1+Math.sin(phi))/2;this.g={phi,al};},output(){const f=this.P.f;return 2*(1-f)*this.L*Math.sin(this.g.al/2);},
  draw(){const g=this.g,f=this.P.f,L=this.L,P=[400,70+f*L];for(const s of [-1,1]){const a=PI/2+s*g.al/2;const top=[P[0]-f*L*Math.cos(a),P[1]-f*L*Math.sin(a)],bot=[P[0]+(1-f)*L*Math.cos(a),P[1]+(1-f)*L*Math.sin(a)];bar(top[0],top[1],bot[0],bot[1],12,s<0?C['brass-fill']:C.part);}
    ctx.beginPath();ctx.rect(P[0]-16,P[1]-12,32,24);paint(C['steel-fill'],C.ink);pivot(P[0],P[1],5);label('SLIDE THE PIVOT TO SET THE RATIO',P[0]+30,P[1]);},
  reads(){const g=this.g,f=this.P.f,L=this.L;const s=2*f*L*Math.sin(g.al/2),b=2*(1-f)*L*Math.sin(g.al/2);return[['Small points',`${s.toFixed(0)} mm`],['Large points',`${b.toFixed(0)} mm`],['Ratio',`${(b/s).toFixed(2)} : 1`]];}});

/* water wheels: 431 undershot, 442 noria, 487 paddle wheel, 489 feathering paddles */
function flowLines(y0,y1,phi,dir){ctx.save();ctx.strokeStyle=C.ink;ctx.globalAlpha=.35;ctx.lineWidth=1.2;ctx.setLineDash([24,30]);ctx.lineDashOffset=-dir*phi*40;for(let y=y0+10;y<y1;y+=16){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(800,y);ctx.stroke();}ctx.restore();}
reg({num:431,outLabel:'Wheel turns',
  update(phi){this.g={phi,a:-phi*0.5};},output(){return -this.g.a/TAU;},
  draw(){const g=this.g,Cc=[400,240],R=170;water(0,380,800,140);flowLines(380,520,g.phi,1);
    circ(Cc[0],Cc[1],R-20);circ(Cc[0],Cc[1],R-40,false);paint(C.part,C.ink);for(let k=0;k<8;k++){const a=g.a+k*PI/4;bar(Cc[0],Cc[1],Cc[0]+(R-30)*Math.cos(a),Cc[1]+(R-30)*Math.sin(a),8,C.part2);}
    for(let k=0;k<16;k++){const a=g.a+k*TAU/16;bar(Cc[0]+(R-30)*Math.cos(a),Cc[1]+(R-30)*Math.sin(a),Cc[0]+(R+30)*Math.cos(a),Cc[1]+(R+30)*Math.sin(a),12,C['brass-fill']);}
    pivot(Cc[0],Cc[1],8);label('CURRENT PUSHES THE LOWER PADDLES',400,505,'center');},
  reads(v){return[['Wheel speed',rpmOf(Math.abs(v))],['Driven by','flowing water, not its weight']];}});
reg({num:442,outLabel:'Wheel turns',
  update(phi){this.g={phi,a:-phi*0.4};},output(){return -this.g.a/TAU;},
  draw(){const g=this.g,Cc=[400,260],R=180;water(0,400,800,120);flowLines(400,520,g.phi,1);
    ctx.beginPath();ctx.rect(120,62,200,22);paint(C.part2,C.ink);water(124,66,192,10);
    circ(Cc[0],Cc[1],R);circ(Cc[0],Cc[1],R-18,false);paint(C.part,C.ink);for(let k=0;k<8;k++){const a=g.a+k*PI/4;bar(Cc[0],Cc[1],Cc[0]+(R-10)*Math.cos(a),Cc[1]+(R-10)*Math.sin(a),8,C.part2);}
    for(let k=0;k<12;k++){const a=g.a+k*TAU/12,x=Cc[0]+R*Math.cos(a),y=Cc[1]+R*Math.sin(a);const am=mod(a+PI,TAU)-PI;const full=am>-PI/2&&am<PI/2+0.3;ctx.beginPath();ctx.rect(x-14,y-6,28,26);paint(C['brass-fill'],C.ink);if(full){water(x-12,y+2,24,16);}
      const pr=[x+R*0.12*Math.cos(a),y];bar(x,y,x+20*Math.cos(a),y+20*Math.sin(a),5,C['brass-fill']);}
    pivot(Cc[0],Cc[1],8);label('POTS FILL BELOW, EMPTY INTO THE TROUGH',420,40,'center');},
  reads(v){return[['Wheel speed',rpmOf(Math.abs(v))],['Lift','almost the full wheel height']];}});
function paddle(num,feather){return reg({num,outLabel:'Wheel turns',
  update(phi){this.g={phi,a:phi*0.5};},output(){return this.g.a/TAU;},
  draw(){const g=this.g,Cc=[450,250],R=150;ctx.beginPath();ctx.moveTo(0,190);ctx.lineTo(340,190);ctx.quadraticCurveTo(300,340,200,360);ctx.lineTo(0,360);ctx.closePath();paint(C.part,C.ink);
    circ(Cc[0],Cc[1],R-30);paint(null,C.ink,1.2);for(let k=0;k<8;k++){const a=g.a+k*PI/4;const t=[Cc[0]+R*Math.cos(a),Cc[1]+R*Math.sin(a)];bar(Cc[0],Cc[1],t[0],t[1],7,C.part2);
      ctx.save();ctx.translate(t[0],t[1]);ctx.rotate(feather?0:a);ctx.beginPath();ctx.rect(feather?-6:-30,feather?-30:-6,feather?12:60,feather?60:12);paint(C['brass-fill'],C.ink);ctx.restore();}
    if(feather){const E=[Cc[0]+40,Cc[1]];circ(E[0],E[1],12);paint(C['steel-fill'],C.ink);for(let k=0;k<8;k++){const a=g.a+k*PI/4,t=[Cc[0]+R*Math.cos(a),Cc[1]+R*Math.sin(a)];bar(t[0],t[1],t[0]+40,t[1],5,C.part);bar(E[0],E[1],t[0]+40,t[1],3,C['steel-fill']);}}
    pivot(Cc[0],Cc[1],7);ctx.save();ctx.globalAlpha=.85;water(0,330,800,190);ctx.restore();flowLines(330,520,g.phi,1);
    label(feather?'PADDLES KEPT UPRIGHT BY AN ECCENTRIC':'PADDLES PUSH WATER AFT',Cc[0],60,'center');},
  reads(v){return[['Wheel speed',rpmOf(Math.abs(v))],['Paddles',feather?'enter and leave edge-on':'fixed to the arms']];}});}
paddle(487,false);paddle(489,true);

/* 438 Barker's mill */
reg({num:438,outLabel:'Arm turns',
  update(phi){this.g={phi:phi*0.7};},output(){return this.g.phi/TAU;},
  draw(){const g=this.g,X=400,y=400,L=170;ctx.beginPath();ctx.rect(X-60,60,120,70);paint(C.part2,C.ink);water(X-56,70,112,56);ctx.beginPath();ctx.rect(X-12,130,24,y-130);paint(C.part2,C.ink);water(X-8,130,16,y-130);
    const ends=[0,1].map(k=>{const a=g.phi+k*PI;return{a,x:X+L*Math.cos(a),y:y+30*Math.sin(a),z:Math.sin(a)};}).sort((a,b)=>a.z-b.z);
    for(const e of ends){ctx.save();ctx.globalAlpha=e.z<0?.6:1;bar(X,y,e.x,e.y,14,C['steel-fill']);for(let i=1;i<7;i++){const t=e.a+PI/2-i*0.09;const px=X+(L+i*14)*Math.cos(e.a)+i*12*Math.cos(e.a-PI/2),py=y+30*Math.sin(e.a)+i*4;circ(px,py,4-i*0.4);ctx.fillStyle=C.steel;ctx.globalAlpha=(e.z<0?.4:.8)*(1-i/7);ctx.fill();}ctx.restore();}
    pivot(X,y,6);ground(X,480,60);label('WATER JETS FROM THE ARM TIPS',X+190,y-60);},
  reads(v){return[['Arm speed',rpmOf(Math.abs(v))],['Push','reaction of the jets']];}});

/* 440 tipping trough */
reg({num:440,outLabel:'Tips',
  update(phi){const c=phi/PI,k=Math.floor(c),u=c-k,side=k%2?-1:1;const th0=0.32;let th,fill;if(u<0.8){th=side*th0;fill=u/0.8;}else{const s=smooth((u-0.8)/0.2);th=side*th0*(1-2*s);fill=1-s;}this.g={phi,th,fill,side,k};},
  output(){return this.g.k;},
  draw(){const g=this.g,P=[400,330];water(390,60,20,P[1]-60-60);
    ctx.save();ctx.translate(P[0],P[1]);ctx.rotate(g.th);ctx.beginPath();ctx.moveTo(-200,-70);ctx.lineTo(-200,0);ctx.lineTo(200,0);ctx.lineTo(200,-70);ctx.moveTo(0,0);ctx.lineTo(0,-80);ctx.strokeStyle=C.ink;ctx.lineWidth=5;ctx.stroke();
    const sx=g.side>0?-1:1;ctx.fillStyle=WATER();ctx.fillRect(sx>0?3:-197,-g.fill*60,194,g.fill*60);ctx.restore();
    ctx.beginPath();ctx.moveTo(P[0],P[1]);ctx.lineTo(P[0]-20,P[1]+60);ctx.lineTo(P[0]+20,P[1]+60);ctx.closePath();paint(C.part2,C.ink);pivot(P[0],P[1],6);ground(P[0],P[1]+60,80);
    label('EACH TIP MEASURES A FIXED VOLUME',P[0],480,'center');},
  reads(){const g=this.g;return[['Tips counted',`${g.k}`],['Filling side',g.side>0?'left':'right']];}});

/* 450 force pump */
reg({num:450,outLabel:'Plunger height, mm',
  update(phi){this.g={phi,y:300-110*(1-Math.cos(phi))/2,up:Math.sin(phi)>0};},output(){return 300-this.g.y;},
  draw(){const g=this.g,X=360;ctx.beginPath();ctx.rect(X-60,150,12,300);ctx.rect(X+48,150,12,300);paint(C.part2,C.ink);water(X-48,g.y+20,96,430-g.y);water(X-10,440,20,60);water(200,490,400,30);
    ctx.beginPath();ctx.rect(X-48,g.y,96,20);paint(C['brass-fill'],C.ink);bar(X,g.y,X,90,10,C.part);
    ctx.beginPath();ctx.rect(X+60,380,160,16);paint(C.part2,C.ink);water(X+62,382,156,12);ctx.beginPath();ctx.rect(X+204,140,16,256);paint(C.part2,C.ink);if(!g.up){water(X+206,140,12,240);ctx.save();ctx.fillStyle=WATER();ctx.beginPath();ctx.moveTo(X+212,140);ctx.quadraticCurveTo(X+240,90,X+280,160);ctx.lineTo(X+270,160);ctx.quadraticCurveTo(X+236,104,X+216,140);ctx.fill();ctx.restore();}
    ctx.save();ctx.translate(X+60,388);ctx.rotate(g.up?0:-0.7);ctx.beginPath();ctx.rect(0,-2,26,4);paint(C.steel,C.ink);ctx.restore();ctx.save();ctx.translate(X-30,440);ctx.rotate(g.up?-0.7:0);ctx.beginPath();ctx.rect(0,-2,60,4);paint(C.steel,C.ink);ctx.restore();
    label(g.up?'UPSTROKE · water drawn in':'DOWNSTROKE · water forced out',X-60,120);label('OUTLET',X+240,180);},
  reads(){const g=this.g;return[['Stroke',g.up?'up':'down'],['Plunger','solid, no valve'],['Lift','set by the pump force, not air pressure']];}});

/* 457 well sweep */
reg({num:457,outLabel:'Bucket depth, mm',
  update(phi){this.g={phi,a:-0.35+0.55*(1-Math.cos(phi))/2};},output(){return this.g.a;},
  draw(){const g=this.g,P=[330,200],L1=320,L2=130,E=[P[0]+L1*Math.cos(g.a),P[1]+L1*Math.sin(g.a)],W=[P[0]-L2*Math.cos(g.a),P[1]-L2*Math.sin(g.a)];
    ctx.beginPath();ctx.rect(P[0]-10,P[1],20,300);paint(C.part2,C.ink);bar(W[0],W[1],E[0],E[1],12,C['brass-fill']);weight(W[0],W[1]+4,60,50,'');rope([[E[0],E[1]],[E[0],E[1]+180]]);
    ctx.beginPath();ctx.rect(E[0]-20,E[1]+180,40,40);paint(C['steel-fill'],C.ink);ctx.beginPath();ctx.rect(560,380,160,140);paint(C.part2,C.ink);water(575,430,130,90);ctx.save();ctx.fillStyle=C.sheet;ctx.fillRect(575,380,130,50);ctx.restore();
    pivot(P[0],P[1],6);label('COUNTERWEIGHT',W[0]-40,W[1]-30);label('WELL',640,370,'center');},
  reads(){return[['Counterweight','about half the full bucket'],['Effort','light both ways']];}});

/* 458 two-bucket well */
reg({num:458,outLabel:'Left bucket height, mm',
  update(phi){this.g={phi,s:200*(1-Math.cos(phi))/2};},output(){return this.g.s;},
  draw(){const g=this.g,P=[400,90],r=50;ctx.beginPath();ctx.rect(300,30,200,14);paint(C.part2,C.ink);bar(P[0],44,P[0],P[1],6,C.part);
    const yl=420-g.s,yr=220+g.s;rope([[P[0]-r,P[1]],[P[0]-r,yl]]);rope([[P[0]+r,P[1]],[P[0]+r,yr]]);pulley(P[0],P[1],r,g.s/r,C['brass-fill']);
    ctx.beginPath();ctx.rect(270,300,260,220);paint(C.part2,C.ink);ctx.save();ctx.fillStyle=C.sheet;ctx.fillRect(285,300,230,220);ctx.restore();water(285,420,230,100);
    for(const [x,y] of [[P[0]-r,yl],[P[0]+r,yr]]){ctx.beginPath();ctx.rect(x-22,y,44,40);paint(C['steel-fill'],C.ink);if(y>300)water(x-20,y+8,40,30);}
    label('ONE BUCKET RISES AS THE OTHER SINKS',400,280,'center');},
  reads(){return[['Effort','only the water is lifted, buckets balance']];}});

/* 462 chain pump */
reg({num:462,outLabel:'Chain travel, mm',
  update(phi){this.g={phi,s:45*phi};},output(){return this.g.s;},
  draw(){const g=this.g,T=[400,100],B=[400,450],r=36;const pts=beltPoly(T[0],T[1],r,B[0],B[1],r,false,3),ap=alongPoly(pts);
    ctx.beginPath();ctx.rect(T[0]-r-22,140,24,300);paint(C.part2,C.ink);water(T[0]-r-18,150,16,290);water(260,440,280,80);
    ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(...pts[0]);for(const p of pts)ctx.lineTo(...p);ctx.closePath();ctx.stroke();ctx.restore();
    for(let s=0;s<ap.total;s+=40){const q=ap.at(s-g.s);ctx.save();ctx.translate(q[0],q[1]);ctx.rotate(q[2]);ctx.beginPath();ctx.rect(-3,-12,6,24);paint(C['brass-fill'],C.ink);ctx.restore();}
    pulley(T[0],T[1],r,-g.phi*1.25,C['brass-fill']);pulley(B[0],B[1],r,-g.phi*1.25,C.part);ctx.beginPath();ctx.rect(T[0]-r-110,130,90,14);paint(C.part2,C.ink);water(T[0]-r-108,124,86,8);
    label('DISKS CARRY WATER UP THE TUBE',T[0]+60,260);label('SPOUT',T[0]-r-110,160);},
  reads(v){return[['Chain speed',`${Math.abs(v).toFixed(0)} mm/s`],['Lift','continuous flow']];}});

/* 470 steam hammer */
reg({num:470,outLabel:'Hammer height, mm',
  update(phi){const u=mod(phi/TAU,1);let h;if(u<0.65)h=smooth(u/0.65);else if(u<0.73){const t=(u-0.65)/0.08;h=1-t*t;}else h=0;this.g={phi,h,u};},output(){return this.g.h*160;},
  draw(){const g=this.g,X=400,y=330-g.h*160;ctx.beginPath();ctx.rect(X-190,40,40,440);ctx.rect(X+150,40,40,440);paint(C.part2,C.ink);ctx.beginPath();ctx.rect(X-60,40,120,120);paint(C.part2,C.ink);
    ctx.beginPath();ctx.rect(X-50,50+(1-g.h)*60,100,20);paint(C['steel-fill'],C.ink);bar(X,60+(1-g.h)*60,X,y,14,C.part);ctx.beginPath();ctx.rect(X-70,y,140,70);paint(C['steel-fill'],C.ink);
    ctx.beginPath();ctx.rect(X-60,412,120,24);paint(C['brass-fill'],C.ink);ctx.beginPath();ctx.rect(X-90,436,180,50);paint(C.part2,C.ink);ground(X,486,300);
    label(g.u<0.65?'STEAM LIFTS THE HAMMER':g.u<0.73?'STEAM RELEASED · it falls':'BLOW',X+200,200);},
  reads(){const g=this.g;return[['Phase',g.u<0.65?'lifting':g.u<0.73?'falling':'struck'],['Hammer',`${(g.h*160).toFixed(0)} mm up`]];}});

/* 474 aeolipile */
reg({num:474,outLabel:'Sphere turns',
  update(phi){this.g={phi};},output(){return this.g.phi/TAU;},
  draw(){const g=this.g,O=[400,230],R=90;ctx.beginPath();ctx.rect(240,380,320,110);paint(C.part2,C.ink);water(256,400,288,60);
    for(const s of [-1,1]){bar(O[0]+s*130,390,O[0]+s*130,O[1],12,C.part);bar(O[0]+s*130,O[1],O[0]+s*R,O[1],10,C.part);}
    circ(O[0],O[1],R);paint(C['brass-fill'],C.ink);ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=1;for(let k=0;k<6;k++){const t=g.phi+k*PI/6;if(Math.sin(t)>0){ctx.beginPath();ctx.ellipse(O[0],O[1]-R*Math.cos(t)*0,R*0.08+0,R,0,0,TAU);}}
    for(let k=0;k<6;k++){const t=g.phi+k*PI/6;const y=O[1]+R*Math.cos(t);if(Math.sin(t)>0){ctx.globalAlpha=Math.sin(t);ctx.beginPath();ctx.moveTo(O[0]-R*Math.sin(Math.acos(clamp(Math.cos(t),-1,1))),y);ctx.lineTo(O[0]+R*Math.sin(Math.acos(clamp(Math.cos(t),-1,1))),y);ctx.stroke();}}ctx.restore();
    for(const k of [0,1]){const t=g.phi+k*PI,y=O[1]-R*Math.cos(t),z=Math.sin(t);if(z>-0.2){const tip=[O[0]+10,y-14*Math.sin(t)];bar(O[0],y,O[0],y,10,C['brass-fill']);ctx.save();ctx.globalAlpha=.25+.6*Math.max(0,z);for(let i=1;i<6;i++){circ(O[0]+i*16*(k?-1:1)*0.0+i*14*(Math.sin(t)>0?1:-1)*0.6,y+i*10*Math.sin(t)*(k?1:-1),3+i*1.5);ctx.fillStyle=C.muted;ctx.fill();}ctx.restore();}}
    label('STEAM JETS SPIN THE SPHERE',O[0]+120,O[1]-110);label('BOILER',O[0],505,'center');},
  reads(v){return[['Spin',rpmOf(Math.abs(v))],['Inventor','Hero of Alexandria, 1st century']];}});

/* 486 feathering windmill (top view) */
reg({num:486,outLabel:'Rotor turns',
  update(phi){this.g={phi:phi*0.5};},output(){return this.g.phi/TAU;},
  draw(){const g=this.g,O=[420,260],L=170;ctx.save();ctx.strokeStyle=C.muted;ctx.lineWidth=1.4;for(let i=0;i<6;i++){const y=90+i*36,x=60+mod(g.phi*60+i*20,80);linArrow(x,y,40,C.muted);}ctx.restore();
    for(let k=0;k<4;k++){const a=-g.phi+k*PI/2,E=[O[0]+L*Math.cos(a),O[1]+L*Math.sin(a)];bar(O[0],O[1],E[0],E[1],8,C.part2);const vx=Math.sin(a);const catching=vx>0;const sa=catching?0:PI/2;
      ctx.save();ctx.translate(E[0],E[1]);ctx.rotate(sa);ctx.beginPath();ctx.rect(-6,-40,12,80);paint(catching?C['brass-fill']:C.part,C.ink);ctx.restore();pivot(E[0],E[1],4);}
    pivot(O[0],O[1],8);label('WIND',60,60);label('SAILS FACE THE WIND ONE WAY, TURN EDGE-ON COMING BACK',400,500,'center');},
  reads(v){return[['Rotor',rpmOf(Math.abs(v))],['Axis','vertical'],['View','from above']];}});

/* 490 ship's wheel and tiller ropes */
reg({num:490,outLabel:'Tiller angle, degrees',
  update(phi){const w=1.4*PI*Math.sin(phi);this.g={phi,w,t:0.42*Math.sin(phi)};},output(){return this.g.t*180/PI;},
  draw(){const g=this.g,P=[400,110],T=[P[0]+200*Math.sin(g.t),P[1]+200*Math.cos(g.t)];ctx.beginPath();ctx.moveTo(P[0],P[1]);ctx.lineTo(P[0]-90*Math.sin(g.t)-14,P[1]-90*Math.cos(g.t));ctx.lineTo(P[0]-90*Math.sin(g.t)+14,P[1]-90*Math.cos(g.t));ctx.closePath();paint(C['steel-fill'],C.ink);
    bar(P[0],P[1],T[0],T[1],12,C['steel-fill']);const GL=[[150,150],[150,430]],GR=[[650,150],[650,430]],D=[400,430];
    rope([T,GL[0],GL[1],[D[0]-30,D[1]]]);rope([T,GR[0],GR[1],[D[0]+30,D[1]]]);for(const q of [...GL,...GR])pulley(q[0],q[1],14,g.w,C.part);
    ctx.beginPath();ctx.rect(D[0]-30,D[1]-20,60,40);paint(C['brass-fill'],C.ink);const Wc=[400,430];circ(Wc[0],Wc[1]+0,0);
    ctx.save();ctx.translate(400,490);for(let k=0;k<8;k++){const a=g.w+k*PI/4;bar(0,0,40*Math.cos(a),40*Math.sin(a)*0.25,4,C['brass-fill']);}ctx.restore();
    pivot(P[0],P[1],6);label('RUDDER',P[0]+30,P[1]-70);label('TILLER',T[0]+16,T[1]);label('WHEEL BARREL',D[0]+50,D[1]);},
  reads(){const g=this.g;return[['Wheel',`${(g.w/TAU).toFixed(2)} turns`],['Tiller',`${(g.t*180/PI).toFixed(0)}°`]];}});

/* 491 capstan */
reg({num:491,outLabel:'Capstan turns',N:16,
  update(phi){this.g={phi,a:phi*0.3};},output(){return this.g.a/TAU;},
  draw(){const g=this.g,O=[400,270];sawWheel(O[0],O[1],g.a,this.N,150,168,C.part2);circ(O[0],O[1],70);paint(C['brass-fill'],C.ink);
    rope([[O[0],O[1]-70],[780,O[1]-70]]);for(let k=0;k<6;k++){const a=g.a+k*PI/3;bar(O[0]+60*Math.cos(a),O[1]+60*Math.sin(a),O[0]+230*Math.cos(a),O[1]+230*Math.sin(a),12,C['brass-fill']);}
    for(const pa of [PI*0.75,PI*0.25]){const pv=[O[0]+190*Math.cos(pa),O[1]+190*Math.sin(pa)],rel=pa-0.12-g.a,rr=sawR(rel,this.N,150,168)+2;bar(pv[0],pv[1],O[0]+rr*Math.cos(pa-0.12),O[1]+rr*Math.sin(pa-0.12),8,C.part);pivot(pv[0],pv[1],4);}
    pivot(O[0],O[1],7);label('PAWLS STOP IT RUNNING BACK',O[0]+140,O[1]+200);label('ROPE',740,O[1]-90);},
  reads(){const g=this.g;return[['Turns',`${(g.a/TAU).toFixed(2)}`],['View','from above'],['Bars','6, pushed by the crew']];}});

/* 497 centrifugal fan */
reg({num:497,outLabel:'Rotor turns',
  update(phi){this.g={phi:phi*1.2};},output(){return this.g.phi/TAU;},
  draw(){const g=this.g,O=[380,280];const pts=[];for(let i=0;i<=200;i++){const t=-PI/2+i/200*TAU;const r=130+50*i/200;pts.push([O[0]+r*Math.cos(t),O[1]+r*Math.sin(t)]);}
    const e=pts[pts.length-1];poly([...pts,[e[0]+220,e[1]],[e[0]+220,O[1]-130],[O[0],O[1]-130]]);ctx.closePath();paint(C.part,C.ink);
    for(let k=0;k<8;k++){const a=g.phi+k*PI/4;ctx.beginPath();ctx.moveTo(O[0]+40*Math.cos(a),O[1]+40*Math.sin(a));ctx.quadraticCurveTo(O[0]+90*Math.cos(a+0.15),O[1]+90*Math.sin(a+0.15),O[0]+115*Math.cos(a+0.45),O[1]+115*Math.sin(a+0.45));ctx.strokeStyle=C.ink;ctx.lineWidth=7;ctx.stroke();ctx.strokeStyle=C['brass-fill'];ctx.lineWidth=4;ctx.stroke();}
    circ(O[0],O[1],40);paint(C.hi,C.ink);pivot(O[0],O[1],6);
    ctx.save();ctx.fillStyle=C.steel;for(let i=0;i<40;i++){const f=mod(g.phi*0.25+i/40,1);let x,y;if(f<0.7){const t=-PI/2+(i*0.61)+f*TAU*1.1,r=40+f/0.7*130;x=O[0]+r*Math.cos(t);y=O[1]+r*Math.sin(t);}else{x=e[0]+(f-0.7)/0.3*220;y=O[1]-150+((i*37)%110);}circ(x,y,2.5);ctx.globalAlpha=.7;ctx.fill();}ctx.restore();
    label('AIR IN AT THE CENTRE',O[0]-60,O[1]+200);label('OUT UNDER PRESSURE',e[0]+120,O[1]-150,'center');},
  reads(v){return[['Rotor',rpmOf(Math.abs(v))],['Air path','in at the eye, flung outward']];}});

/* 498 U-tube manometer */
reg({num:498,outLabel:'Level difference, mm',
  update(phi){const p=(1-Math.cos(phi))/2;this.g={phi,p,h:p*200};},output(){return this.g.h;},
  draw(){const g=this.g,yb=420,xl=300,xr=480,base=300;const yl=base+g.h/2,yr=base-g.h/2;
    ctx.save();ctx.lineWidth=26;ctx.strokeStyle=C.ink;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(xl,120);ctx.lineTo(xl,yb);ctx.arc((xl+xr)/2,yb,(xr-xl)/2,PI,0,true);ctx.lineTo(xr,90);ctx.stroke();ctx.strokeStyle=C.sheet;ctx.lineWidth=20;ctx.stroke();
    ctx.strokeStyle=C.steel;ctx.lineWidth=20;ctx.lineCap='butt';ctx.beginPath();ctx.moveTo(xl,yl);ctx.lineTo(xl,yb);ctx.arc((xl+xr)/2,yb,(xr-xl)/2,PI,0,true);ctx.lineTo(xr,yr);ctx.stroke();ctx.restore();
    ctx.beginPath();ctx.rect(120,60,200,70);paint(C['brass-fill'],C.ink);label('VESSEL',220,95,'center');
    for(let i=0;i<=10;i++){const y=base-100+i*20;ctx.beginPath();ctx.moveTo(xr+20,y);ctx.lineTo(xr+(i%5?30:40),y);ctx.strokeStyle=C.ink;ctx.lineWidth=1;ctx.stroke();}
    ctx.save();ctx.setLineDash([4,4]);ctx.strokeStyle=C.muted;ctx.beginPath();ctx.moveTo(xl-30,yl);ctx.lineTo(xr+60,yl);ctx.moveTo(xr-30,yr);ctx.lineTo(xr+60,yr);ctx.stroke();ctx.restore();label(`h = ${g.h.toFixed(0)} mm`,xr+70,(yl+yr)/2);},
  reads(){const g=this.g;return[['Level difference',`${g.h.toFixed(0)} mm`],['Pressure','proportional to the difference']];}});

/* 501 barometer */
reg({num:501,outLabel:'Mercury column, mm',
  update(phi){this.g={phi,h:760+18*Math.sin(phi*0.4)};},output(){return this.g.h;},
  draw(){const g=this.g,X=400,yb=440,hy=mm=>yb-(100+(mm-700)*3),top=hy(g.h);ctx.beginPath();ctx.rect(X-16,40,32,yb-40);paint(C.sheet,C.ink,1.6);ctx.save();ctx.fillStyle=C.steel;ctx.fillRect(X-12,top,24,yb-top);ctx.restore();
    ctx.beginPath();ctx.rect(X-90,yb-10,180,60);paint(C.part2,C.ink);ctx.save();ctx.fillStyle=C.steel;ctx.fillRect(X-84,yb+2,168,42);ctx.restore();
    for(let mm=720;mm<=800;mm+=10){const y=hy(mm);ctx.beginPath();ctx.moveTo(X+20,y);ctx.lineTo(X+(mm%50?32:44),y);ctx.strokeStyle=C.ink;ctx.lineWidth=1;ctx.stroke();if(mm%20===0)label(String(mm),X+50,y);}
    label('VACUUM',X-30,60,'right');label('scale shows the top of the column',X+60,yb-60);label(g.h>770?'FAIR':g.h<750?'RAIN':'CHANGE',X-30,top,'right');},
  reads(){const g=this.g;return[['Column',`${g.h.toFixed(0)} mm of mercury`],['Higher means','fair weather']];}});

/* ================= batch 3 · part 1: belts, pulleys, gears, clutches ================= */
const cyc=(phi,T=TAU)=>mod(phi/T,1);
function aliasObj(num,obj,extra){const o=Object.assign({},obj,{num},extra||{});o.params=(obj.params||[]).map(p=>Object.assign({},p));return reg(o);}
function stripesV(x,y0,y1,r,ang){ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=1;for(let k=0;k<6;k++){const a=ang+k*PI/3;if(Math.cos(a)>0){ctx.globalAlpha=.25+.6*Math.cos(a);const xx=x+r*Math.sin(a);ctx.beginPath();ctx.moveTo(xx,y0);ctx.lineTo(xx,y1);ctx.stroke();}}ctx.restore();}
function drumH(x,y,w,r,ang,fill){ctx.beginPath();ctx.rect(x-w/2,y-r,w,2*r);paint(fill,C.ink);ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=1;for(let k=0;k<8;k++){const a=ang+k*PI/4;if(Math.cos(a)>0){ctx.globalAlpha=.2+.6*Math.cos(a);const yy=y+r*Math.sin(a);ctx.beginPath();ctx.moveTo(x-w/2,yy);ctx.lineTo(x+w/2,yy);ctx.stroke();}}ctx.restore();}
function ellPulley(x,y,rx,ry,a,fill){ctx.beginPath();ctx.ellipse(x,y+8,rx,ry,0,0,PI);ctx.lineTo(x-rx,y);paint(fill,C.ink);ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,TAU);paint(fill,C.ink);ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=1;for(let k=0;k<4;k++){const t=a+k*PI/2;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+rx*0.8*Math.cos(t),y+ry*0.8*Math.sin(t));ctx.stroke();}ctx.restore();pivot(x,y,3);}

/* ---- pulley systems ---- */
function tackle(num,ma,o={}){return reg({num,outLabel:'Load height, mm',concept:!!o.concept,
  update(phi){const s=150*(1-Math.cos(phi))/2;this.g={phi,s,lift:s/ma};},output(){return this.g.lift;},
  draw(){const g=this.g,yU=100,yL=360-g.lift*1.5,nU=Math.ceil(ma/2),nL=Math.floor(ma/2)||1,sp=40,w=Math.max(nU,nL)*sp;
    ctx.beginPath();ctx.rect(260,40,280,14);paint(C.part2,C.ink);bar(400,54,400,yU-24,6,C.part);
    const xs=[];for(let i=0;i<ma;i++)xs.push(400-(ma-1)*13+i*26);for(const x of xs)rope([[x,yU],[x,yL]]);
    const hx=xs[ma-1]+40;rope([[xs[ma-1],yU-18],[hx,yU-18],[hx,300+g.s]]);
    ctx.beginPath();ctx.rect(400-w/2-14,yU-24,w+28,44);paint(C.part,C.ink);ctx.beginPath();ctx.rect(400-w/2-14,yL-20,w+28,40);paint(C.part,C.ink);
    for(let i=0;i<nU;i++){const x=400-(nU-1)*sp/2+i*sp;pulley(x,yU,16,g.s/16*(1+i*.3),C.part2);if(o.stepped){circ(x,yU,10);paint(null,C.ink,1);}}
    for(let i=0;i<nL;i++){const x=400-(nL-1)*sp/2+i*sp;pulley(x,yL,16,-g.s/16*(1+i*.3),C['steel-fill']);if(o.stepped){circ(x,yL,10);paint(null,C.ink,1);}}
    bar(400,yL+20,400,yL+50,6,C.part);weight(400,yL+50,90,56,'LOAD');ctx.beginPath();ctx.rect(hx-10,300+g.s,20,30);paint(C['brass-fill'],C.ink);label('PULL',hx+16,315+g.s);
    if(o.note)label(o.note,400,500,'center');},
  reads(){const g=this.g;return[['Ropes holding the load',`${ma}`],['Force needed',`about 1/${ma} of the load`],['Rope pulled',`${g.s.toFixed(0)} mm`],['Load raised',`${g.lift.toFixed(1)} mm`]];}});}
tackle(15,6,{stepped:true,note:'STEPPED SHEAVES · each rope runs at its own speed'});tackle(16,3,{concept:true,note:'SPANISH BARTON'});tackle(17,4,{concept:true,note:'SPANISH BARTON, SECOND FORM'});tackle(18,2,{note:'TWO FIXED, ONE MOVABLE PULLEY'});
function cascade(num,n){return reg({num,outLabel:'Load height, mm',
  update(phi){const s=160*(1-Math.cos(phi))/2;this.g={phi,s};},output(){return this.g.s/2**n;},
  draw(){const g=this.g,x0=200,dx=120,base=380;ctx.beginPath();ctx.rect(120,40,600,14);paint(C.part2,C.ink);
    const ys=[];for(let i=0;i<n;i++)ys.push(base-g.s/2**(n-i)-i*30);
    const fx=x0+n*dx;pulley(fx,90,22,g.s/22,C.part);bar(fx,54,fx,90,6,C.part);rope([[fx+22,90],[fx+22,300+g.s]]);ctx.beginPath();ctx.rect(fx+12,300+g.s,20,30);paint(C['brass-fill'],C.ink);
    for(let i=0;i<n;i++){const x=x0+i*dx,y=ys[i];rope([[x-22,54],[x-22,y]]);const nx=i<n-1?x0+(i+1)*dx:fx;const ny=i<n-1?ys[i+1]+40:90;rope([[x+22,y],[x+22,i<n-1?ny:90]]);if(i<n-1)rope([[x+22,ny],[nx,ny]]);
      pulley(x,y,22,-g.s/2**(n-i)/22,C['steel-fill']);bar(x,y+22,x,y+40,4,C.part);}
    weight(x0,ys[0]+40,80,50,'LOAD');label(`${n} MOVABLE PULLEYS · force ÷ ${2**n}`,120,500);},
  reads(){const g=this.g;return[['Movable pulleys',`${n}`],['Force needed',`1/${2**n} of the load`],['Load raised',`${(g.s/2**n).toFixed(1)} mm`]];}});}
cascade(19,3);cascade(20,2);cascade(21,3);cascade(22,4);
SIMS_NEW[20].concept=true;SIMS_NEW[21].concept=true;SIMS_NEW[22].concept=true;

/* ---- belt layouts ---- */
function idlerBelt(num,mode){return reg({num,outLabel:'Driven pulley, turns',
  reset(){this.a2=0;this.last=null;},
  update(phi){const u=cyc(phi,TAU*3);let on=1,iy=0;if(mode==='tightener'){on=u<0.5?1:0;iy=on?0:-40;}else{iy=8*Math.sin(phi*2);}
    if(this.last===null)this.last=phi;const d=phi-this.last;this.last=phi;this.sp=this.sp===undefined?1:this.sp+(on-this.sp)*Math.min(1,Math.abs(d)*0.8);this.a2+=d*this.sp*1.2;this.g={phi,on,iy};},
  output(){return this.a2/TAU;},
  draw(){const g=this.g,A=[230,200],B=[570,200],r=70,I=[400,330+g.iy];
    const p=new Path2D();p.moveTo(A[0],A[1]-r);p.lineTo(B[0],B[1]-r);p.arc(B[0],B[1],r,-PI/2,PI/2);p.lineTo(I[0]+24,I[1]+(g.on||mode!=='tightener'?24:0));
    if(g.on||mode!=='tightener'){p.arc(I[0],I[1],24,0,PI);}else{p.quadraticCurveTo(I[0],I[1]+30,I[0]-24,I[1]);}
    p.lineTo(A[0],A[1]+r);p.arc(A[0],A[1],r,PI/2,PI*1.5);drawBelt(p,r*g.phi,7);
    pulley(A[0],A[1],r,g.phi,C['brass-fill']);pulley(B[0],B[1],r,this.a2,C['steel-fill']);pulley(I[0],I[1],24,-g.phi*3,C.part);
    if(mode==='tightener'){bar(I[0],I[1],I[0]-160,I[1]+60,8,C.part2);pivot(I[0]-160,I[1]+60,5);label(g.on?'TIGHTENER PRESSED · drive on':'TIGHTENER LIFTED · belt slack',400,480,'center');}
    else{bar(I[0],I[1],I[0],I[1]+60,5,C.part);weight(I[0],I[1]+60,60,40,'');label('HANGING WEIGHT KEEPS THE BELT TIGHT',400,490,'center');}},
  reads(){const g=this.g;return mode==='tightener'?[['Drive',g.on?'engaged':'released'],['Driven speed',`${(this.sp*100).toFixed(0)} %`]]:[['Tension','set by the weight, not by stretch']];}});}
idlerBelt(5,'tightener');idlerBelt(23,'weight');

function shifter(num,stops,o={}){return reg({num,outLabel:'Driven shaft speed, %',concept:!!o.concept,
  reset(){this.a=0;this.sp=0;this.last=null;},
  update(phi){const n=stops.length,u=cyc(phi,TAU*4),i=Math.min(n-1,Math.floor(u*n)),tgt=stops[i];if(this.last===null)this.last=phi;const d=Math.abs(phi-this.last);this.last=phi;this.sp+=(tgt-this.sp)*Math.min(1,d*1.5);this.a+=d*this.sp;this.g={phi,i};},
  output(){return this.sp*100;},
  draw(){const g=this.g,n=stops.length,w=70,x0=400-n*w/2;drumH(400,100,n*w+40,40,g.phi,C['brass-fill']);
    for(let k=0;k<n;k++){const x=x0+k*w+w/2;drumH(x,380,w-8,40-(o.sizes?o.sizes[k]:0),stops[k]===0?g.phi*0.6:this.a,stops[k]===0?C.part:C['steel-fill']);label(o.names?o.names[k]:(stops[k]===0?'LOOSE':'FAST'),x,440,'center');}
    const bx=x0+g.i*w+w/2;ctx.beginPath();ctx.rect(bx-22,140,44,200);paint(C.part2,C.ink);ctx.save();ctx.setLineDash([4,10]);ctx.lineDashOffset=g.phi*40;ctx.strokeStyle=C.ink;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(bx,140);ctx.lineTo(bx,340);ctx.stroke();ctx.restore();
    bar(bx,250,bx+260,250,6,C.part);ctx.beginPath();ctx.rect(bx-30,240,8,20);ctx.rect(bx+22,240,8,20);paint(C.part,C.ink);bar(x0-80,380,x0+n*w+80,380,10,C.part);label('BELT SHIFTER',bx+120,236);},
  reads(){return[['Belt on',(o.names||stops.map(s=>s?'fast':'loose'))[this.g.i]],['Shaft speed',`${(this.sp*100).toFixed(0)} %`]];}});}
shifter(7,[0,1],{});shifter(60,[0,1,0,0.5],{names:['LOOSE','FAST','LOOSE','FAST 2'],concept:true,sizes:[0,0,0,12]});shifter(59,[0,1,0.4],{names:['LOOSE','QUICK','SLOW'],concept:true});shifter(58,[0,1,0.55,0.25],{names:['LOOSE','1st','2nd','3rd'],concept:true});

reg({num:6,outLabel:'Pulley angle, degrees',
  update(phi){this.g={phi,a:0.6*Math.sin(phi)};},output(){return this.g.a*130/50*180/PI;},
  draw(){const g=this.g,P=[400,110],R=130,L=[260,360],Rr=[540,360],r=50;
    ctx.beginPath();ctx.moveTo(P[0],P[1]);ctx.arc(P[0],P[1],R,PI/2+g.a-0.6,PI/2+g.a+0.6);ctx.closePath();paint(C['brass-fill'],C.ink);bar(P[0],P[1],P[0]-150*Math.sin(g.a),P[1]-60,10,C['brass-fill']);
    const t1=PI/2+g.a-0.6,t2=PI/2+g.a+0.6;rope([[P[0]+R*Math.cos(t1),P[1]+R*Math.sin(t1)],[Rr[0]-r,Rr[1]]]);rope([[P[0]+R*Math.cos(t2),P[1]+R*Math.sin(t2)],[L[0]+r,L[1]]]);
    pulley(L[0],L[1],r,-g.a*R/r,C['steel-fill']);pulley(Rr[0],Rr[1],r,g.a*R/r,C['steel-fill']);pivot(P[0],P[1],6);label('ROCKING SEGMENT',P[0]+140,P[1]);label('PULLEYS SWING BACK AND FORTH',400,460,'center');},
  reads(){const g=this.g;return[['Lever',`${(g.a*180/PI).toFixed(0)}°`],['Pulleys',`± ${(0.6*130/50*180/PI).toFixed(0)}°`]];}});

function quarterTurn(num,o={}){return reg({num,outLabel:'Driven pulley, turns',concept:true,
  update(phi){this.g={phi};},output(){return this.g.phi/TAU;},
  draw(){const g=this.g,A=[220,340],r=80,B=o.two?[[520,130],[660,250]]:[[560,140]];
    for(const q of B){const pts=[[A[0],A[1]-r],[q[0]-90,q[1]],[A[0],A[1]+r],[q[0]+90,q[1]]];
      if(o.guides){const G=[q[0]-40,A[1]-20];pulley(G[0],G[1],20,g.phi*3,C.part);ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=4;ctx.setLineDash([8,8]);ctx.lineDashOffset=-g.phi*30;ctx.beginPath();ctx.moveTo(A[0],A[1]-r);ctx.lineTo(q[0]-90,q[1]);ctx.moveTo(A[0],A[1]+r);ctx.lineTo(G[0],G[1]+20);ctx.lineTo(q[0]+90,q[1]);ctx.stroke();ctx.restore();}
      else{ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=4;ctx.setLineDash([8,8]);ctx.lineDashOffset=-g.phi*30;ctx.beginPath();ctx.moveTo(A[0],A[1]-r);ctx.lineTo(q[0]-90,q[1]);ctx.moveTo(A[0],A[1]+r);ctx.lineTo(q[0]+90,q[1]);ctx.stroke();ctx.restore();}
      ellPulley(q[0],q[1],90,26,g.phi*80/90,C['steel-fill']);bar(q[0],q[1]-140,q[0],q[1],8,C.part);}
    pulley(A[0],A[1],r,g.phi,C['brass-fill']);bar(A[0]-140,A[1],A[0],A[1],10,C.part);
    label(o.two?'ONE SHAFT DRIVES TWO UPRIGHT SHAFTS':o.guides?'GUIDE PULLEY LEADS THE BELT ROUND':'BELT TWISTS A QUARTER TURN',400,500,'center');},
  reads(v){return[['Shafts','at right angles'],['Driven',rpmOf(Math.abs(v))]];}});}
quarterTurn(3,{guides:true});quarterTurn(4,{});quarterTurn(11,{});quarterTurn(243,{two:true});
aliasObj(10,SIMS_NEW[9],{concept:true,rad(x){const f=clamp((x-230)/340,0,1);const r1=30+60*(1-Math.cos(f*PI/2));return[r1,120-r1];}});

function pulleyType(num,type){return reg({num,outLabel:'Pulley turns',
  update(phi){this.g={phi};},output(){return this.g.phi/TAU;},
  draw(){const g=this.g,A=[230,250],B=[430,250],r=80;const round=type==='round'||type==='v'||type==='notch';
    if(round){ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=5;ctx.setLineDash([10,6]);ctx.lineDashOffset=-r*g.phi;ctx.stroke(beltPath(A[0],A[1],r,B[0],B[1],50,false));ctx.restore();}else drawBelt(beltPath(A[0],A[1],r,B[0],B[1],50,false),r*g.phi,8);
    pulley(A[0],A[1],r,g.phi,C['brass-fill']);pulley(B[0],B[1],50,g.phi*r/50,C.part);
    const X=640,Y=250;ctx.save();ctx.translate(X,Y);ctx.beginPath();
    if(type==='flange'){ctx.rect(-50,-10,100,30);ctx.rect(-60,-30,12,50);ctx.rect(48,-30,12,50);}else if(type==='flat'){ctx.moveTo(-50,0);ctx.quadraticCurveTo(0,-8,50,0);ctx.lineTo(50,30);ctx.lineTo(-50,30);ctx.closePath();}
    else{ctx.moveTo(-50,-20);ctx.lineTo(-18,-20);if(type==='round'){ctx.arc(0,-20,18,PI,0,true);}else{ctx.lineTo(0,type==='notch'?12:6);if(type==='notch'){ctx.lineTo(-4,6);ctx.lineTo(4,6);ctx.lineTo(0,12);}}ctx.lineTo(18,-20);ctx.lineTo(50,-20);ctx.lineTo(50,30);ctx.lineTo(-50,30);ctx.closePath();}
    paint(C['brass-fill'],C.ink);ctx.beginPath();if(type==='flange'||type==='flat'){ctx.rect(-40,type==='flat'?-16:-22,80,10);}else{circ(0,type==='round'?-20:-12,13,false);}paint(C.part2,C.ink);ctx.restore();
    label('RIM SECTION',X,Y+70,'center');},
  reads(){return[['Rim',{flange:'flanged, keeps a flat belt on',flat:'crowned, belt self-centres',round:'round groove for a cord',v:'V groove wedges the band',notch:'notched V for extra grip'}[type]]];}});}
pulleyType(255,'flange');pulleyType(256,'flat');pulleyType(257,'round');pulleyType(258,'v');pulleyType(259,'notch');

function chainVar(num,style){return reg({num,outLabel:'Chain travel, mm',concept:style!=='alt',
  update(phi){this.g={phi,s:60*phi};},output(){return this.g.s;},
  draw(){const g=this.g,A=[250,260],B=[560,260],r=70;const pts=beltPoly(A[0],A[1],r+4,B[0],B[1],r+4,false,3),ap=alongPoly(pts);
    circ(A[0],A[1],r);paint(C['brass-fill'],C.ink);circ(B[0],B[1],r);paint(C.part,C.ink);for(const [P,a] of [[A,g.phi],[B,g.phi]])for(let k=0;k<8;k++){const t=a+k*PI/4;ctx.beginPath();ctx.rect(P[0]+(r-10)*Math.cos(t)-5,P[1]+(r-10)*Math.sin(t)-5,10,10);paint(C.part2,C.ink,.8);}
    const pitch=ap.total/Math.round(ap.total/22);let i=0;for(let s=0;s<ap.total-1;s+=pitch,i++){const q=ap.at(s+g.s),q2=ap.at(s+g.s+pitch);ctx.save();ctx.lineCap='round';ctx.strokeStyle=C.ink;
      if(style==='alt'&&i%2){ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(q[0],q[1]);ctx.lineTo(q2[0],q2[1]);ctx.stroke();}else{ctx.lineWidth=style==='round'?6:10;ctx.beginPath();ctx.moveTo(q[0],q[1]);ctx.lineTo(q2[0],q2[1]);ctx.stroke();ctx.strokeStyle=C.sheet;ctx.lineWidth=style==='round'?2:5;ctx.stroke();}ctx.restore();}
    pivot(A[0],A[1],6);pivot(B[0],B[1],6);label(style==='alt'?'LINKS IN ALTERNATE PLANES':'CHAIN AND POCKETED PULLEY',400,400,'center');},
  reads(v){return[['Chain speed',`${Math.abs(v).toFixed(0)} mm/s`]];}});}
chainVar(227,'alt');chainVar(228,'round');chainVar(229,'flat');

reg({num:224,outLabel:'Pulley radius, mm',
  update(phi){const r=60+45*(1+Math.sin(phi/5))/2;this.g={phi,r};},output(){return this.g.r;},
  draw(){const g=this.g,A=[300,260],B=[620,260];drawBelt(beltPath(A[0],A[1],g.r,B[0],B[1],60,false),g.r*g.phi,6);
    circ(A[0],A[1],40);paint(C.part,C.ink);for(let k=0;k<6;k++){const a=g.phi+k*PI/3;bar(A[0],A[1],A[0]+(g.r-8)*Math.cos(a),A[1]+(g.r-8)*Math.sin(a),8,C.part2);ctx.save();ctx.translate(A[0]+g.r*Math.cos(a),A[1]+g.r*Math.sin(a));ctx.rotate(a);ctx.beginPath();ctx.rect(-5,-18,10,36);paint(C['brass-fill'],C.ink);ctx.restore();}
    pivot(A[0],A[1],6);pulley(B[0],B[1],60,g.phi*g.r/60,C['steel-fill']);label('ARMS SLIDE OUT TO ENLARGE THE PULLEY',300,450,'center');},
  reads(){const g=this.g;return[['Pulley radius',`${g.r.toFixed(0)} mm`],['Driven speed',`${(g.r/60).toFixed(2)} × driver`]];}});

reg({num:374,outLabel:'Shaft turns',Pv:[150,440],O:[430,230],r:30,
  update(phi){this.g={phi,a:-0.18+0.16*Math.sin(phi)};},output(){return this.g.phi/TAU;},
  draw(){const g=this.g,O=this.O,Pv=this.Pv,T=[Pv[0]+300*Math.cos(g.a),Pv[1]+300*Math.sin(g.a)];flywheel(O[0],O[1],120,g.phi);
    const E=[O[0]+this.r*Math.cos(g.phi),O[1]+this.r*Math.sin(g.phi)];circ(E[0],E[1],34);paint(C['brass-fill'],C.ink);const R=[Pv[0]+250*Math.cos(g.a),Pv[1]+250*Math.sin(g.a)];
    rope([[R[0]-10,R[1]],[E[0]-34,E[1]]]);rope([[R[0]+10,R[1]],[E[0]+34,E[1]]]);bar(Pv[0],Pv[1],T[0],T[1],18,C['brass-fill']);circ(R[0],R[1],10);paint(C.part,C.ink);pivot(Pv[0],Pv[1],6);ground(Pv[0],Pv[1]+12,40);
    label('ENDLESS BAND AROUND THE ECCENTRIC',O[0]+60,O[1]-150);label('TREADLE',Pv[0]+120,Pv[1]+40);},
  reads(){return[['Drive','band instead of a rod']];}});

/* ---- gear pairs with styles ---- */
function gearStyle(num,o){return reg({num,outLabel:'Driven gear, turns',concept:!!o.concept,
  update(phi){this.g={phi,a2:-phi*o.z1/o.z2};},output(){return -this.g.a2/TAU;},
  draw(){const g=this.g,m=5,r1=o.z1*m/2,r2=o.z2*m/2,A=[400-(r1+r2)/2,270],B=[A[0]+r1+r2,270];
    if(o.style==='friction'){for(const [P,r,a,f] of [[A,r1,g.phi,C['brass-fill']],[B,r2,g.a2,C['steel-fill']]]){circ(P[0],P[1],r);paint(f,C.ink);for(let k=1;k<4;k++){circ(P[0],P[1],r-k*5);paint(null,C.ink,.8);}bar(P[0],P[1],P[0]+(r-24)*Math.cos(a),P[1]+(r-24)*Math.sin(a),6,C.part2);pivot(P[0],P[1],5);}}
    else{if(o.style==='stepped'){drawGear(A[0]+6,A[1]-6,r1,o.z1,g.phi+PI/o.z1,C.part,{bore:6});drawGear(B[0]+6,B[1]-6,r2,o.z2,g.a2+PI/o.z2*2,C.part2,{bore:6});}
      drawGear(A[0],A[1],r1,o.z1,g.phi,C['brass-fill'],{bore:6});
      if(o.style==='skew'){ctx.save();ctx.translate(B[0],B[1]);ctx.scale(0.55,1);ctx.translate(-B[0],-B[1]);drawGear(B[0],B[1],r2,o.z2,g.a2+PI+PI/o.z2,C['steel-fill'],{bore:6});ctx.restore();}
      else drawGear(B[0],B[1],r2,o.z2,g.a2+PI+PI/o.z2,C['steel-fill'],{bore:6});
      if(o.style==='helical'||o.style==='herring'){for(const [P,r,z,a] of [[A,r1,o.z1,g.phi],[B,r2,o.z2,g.a2+PI+PI/o.z2]]){ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=1;for(let k=0;k<z;k++){const t=a+k*TAU/z;const x=P[0]+(r-2)*Math.cos(t),y=P[1]+(r-2)*Math.sin(t);ctx.beginPath();ctx.moveTo(x-4*Math.sin(t),y+4*Math.cos(t));ctx.lineTo(x+(o.style==='herring'?0:4)*Math.sin(t)+3*Math.cos(t),y-(o.style==='herring'?0:4)*Math.cos(t)+3*Math.sin(t));ctx.stroke();}ctx.restore();}}
      pivot(A[0],A[1],5);pivot(B[0],B[1],5);}
    label(o.label,400,470,'center');},
  reads(v){return[['Ratio',`${o.z1} : ${o.z2}`],['Driven',rpmOf(Math.abs(v))],['Feature',o.feature]];}});}
gearStyle(40,{z1:20,z2:30,style:'helical',label:'TEETH SET AT A SLANT',feature:'several teeth share the load'});
gearStyle(41,{z1:24,z2:24,style:'herring',label:'V-SHAPED TEETH',feature:'no end thrust on the shafts'});
gearStyle(42,{z1:20,z2:28,style:'skew',label:'SHAFTS AT AN ANGLE (driven gear seen tilted)',feature:'drives between skewed shafts',concept:true});
gearStyle(43,{z1:16,z2:32,style:'skew',label:'ANOTHER FORM FOR SKEWED SHAFTS',feature:'drives between skewed shafts',concept:true});
gearStyle(44,{z1:20,z2:30,style:'stepped',label:'TWO STAGGERED LAYERS OF TEETH',feature:'always a tooth in full contact'});
gearStyle(45,{z1:24,z2:36,style:'friction',label:'GROOVED FRICTION WHEELS',feature:'wedged grooves grip without teeth'});
gearStyle(413,{z1:28,z2:28,style:'friction',label:'RUBBER RIM SPREAD BY A NUT FOR MORE GRIP',feature:'adjustable grip'});
reg({num:250,outLabel:'Shaft turns',
  update(phi){this.g={phi};},output(){return this.g.phi/TAU;},
  draw(){const g=this.g,S=[400,200],rs=40,R=110,d=rs+R,ang=0.75,A=[S[0]-d*Math.sin(ang),S[1]+d*Math.cos(ang)],B=[S[0]+d*Math.sin(ang),S[1]+d*Math.cos(ang)];
    for(const P of [A,B]){circ(P[0],P[1],R);paint(C.part,C.ink);bar(P[0],P[1],P[0]+(R-20)*Math.cos(-g.phi*rs/R),P[1]+(R-20)*Math.sin(-g.phi*rs/R),8,C.part2);pivot(P[0],P[1],6);}
    circ(S[0],S[1],rs);paint(C['brass-fill'],C.ink);bar(S[0],S[1],S[0]+30*Math.cos(g.phi),S[1]+30*Math.sin(g.phi),6,C.part2);pivot(S[0],S[1],5);label('SHAFT RESTS ON TWO WHEEL RIMS',400,40,'center');},
  reads(){return[['Friction','rolling instead of sliding'],['Wheels turn',`${(40/110).toFixed(2)} × shaft`]];}});

/* ---- non-circular gears with exact conjugate pitch curves ---- */
function noncirc(num,r1fn,o={}){return reg({num,outLabel:'Driven gear, turns',concept:!!o.concept,
  build(){if(this.T)return;const n=720;let lo=0,hi=600;const r1s=[];for(let i=0;i<=n;i++)r1s.push(r1fn(i/n*TAU));const mx=Math.max(...r1s);lo=mx+1;hi=mx*6;
    const tot=d=>{let s=0;for(let i=0;i<n;i++){const a=r1s[i],b=r1s[i+1];s+=(a/(d-a)+b/(d-b))/2*(TAU/n);}return s;};for(let k=0;k<60;k++){const m=(lo+hi)/2;if(tot(m)>TAU)lo=m;else hi=m;}const d=(lo+hi)/2;
    const T=[0];for(let i=0;i<n;i++){const a=r1s[i],b=r1s[i+1];T.push(T[i]+(a/(d-a)+b/(d-b))/2*(TAU/n));}this.T=T;this.d=d;this.r1s=r1s;
    this.shape2=[];for(let i=0;i<=n;i++)this.shape2.push([T[i],d-r1s[i]]);},
  update(phi){this.build();const n=720,c=Math.floor(phi/TAU),f=phi/TAU-c,x=f*n,i=Math.floor(x);const t=this.T[i]+(this.T[Math.min(n,i+1)]-this.T[i])*(x-i);const r1=r1fn(mod(phi,TAU));this.g={phi,a2:-(t+c*TAU),ratio:r1/(this.d-r1)};},
  output(){return -this.g.a2/TAU;},
  draw(){const g=this.g,F1=[400-this.d/2,265],F2=[400+this.d/2,265];
    this.ensurePC();
    ncGear(F1[0],F1[1],this.pcA,0,g.phi,C['brass-fill']);ncGear(F2[0],F2[1],this.pcB,this.phB,PI+g.a2,C['steel-fill']);
    label(o.label||'NON-CIRCULAR GEARS',400,470,'center');},
  ensurePC(){this.build();
    if(!this.pcA){const rA=s=>r1fn(mod(-s,TAU)),T=this.T,S2=this.shape2,n=T.length-1,rB=s=>{s=mod(s,TAU);let lo=0,hi=n;while(hi-lo>1){const m=(lo+hi)>>1;if(T[m]<=s)lo=m;else hi=m;}const f=(s-T[lo])/((T[lo+1]-T[lo])||1);return S2[lo][1]+(S2[lo+1][1]-S2[lo][1])*f;};
      const pa=pitchCurve(rA,null,1),Z=o.Z||Math.max(12,Math.round(pa.L/16));this.pcA=pitchCurve(rA,null,Z);this.pcB=pitchCurve(rB,null,Z);this.phB=ncPhase(this.pcA,this.pcB,0,0);}},
  reads(v){return[['Speed ratio now',`${this.g.ratio.toFixed(2)} × driver`],['Driven',rpmOf(Math.abs(v))]];}});}
noncirc(30,s=>{const c=Math.abs(Math.cos(s)),q=Math.abs(Math.sin(s));return 70/Math.pow(Math.pow(c,4)+Math.pow(q,4),0.25);},{label:'ROUNDED-SQUARE GEARS · speed varies 4 times a turn'});
noncirc(38,s=>{const a=mod(s,TAU);return a<PI?70:70+28*Math.sin(a-PI);},{label:'ROUND FOR HALF A TURN, BULGED FOR THE REST',concept:true});
noncirc(209,s=>75+18*Math.cos(2*s),{label:'LOBED ROLLING WHEELS',concept:true});

function pinionFollower(num,r1fn,o={}){return reg({num,outLabel:'Pinion turns',concept:!!o.concept,F:[320,265],Q:[720,120],
  pc(){if(!this._pc){const p0=pitchCurve(r1fn,null,1),Zg=Math.round(p0.L/(TAU*30/12));this._pc=pitchCurve(r1fn,null,Zg);this.Rp=12*this._pc.p/TAU;}return this._pc;},
  reset(){this.aU=null;this.prevP=null;},
  /* pinion centre = pitch point + Rp along the curve normal; slot: centre stays on the slot line; arm: centre stays at the arm length from its pivot */
  update(phi){const pc=this.pc(),Rp=this.Rp,F=this.F,cs=Math.cos(phi),sn=Math.sin(phi);
    const at=a=>{const q=pc.at(a),tl=Math.hypot(q[2],q[3])||1,nx=q[3]/tl,ny=-q[2]/tl,lx=q[0]+Rp*nx,ly=q[1]+Rp*ny;return{w:[F[0]+lx*cs-ly*sn,F[1]+lx*sn+ly*cs],n:[nx*cs-ny*sn,nx*sn+ny*cs],r:Math.hypot(q[0],q[1])};};
    if(this.Larm===undefined){const z=at(pc.arcAt(0));this.Q=[z.w[0]+30,F[1]-215];this.Larm=Math.hypot(z.w[0]-this.Q[0],z.w[1]-this.Q[1]);}
    const Q=this.Q,f=a=>{const z=at(a);return o.slot?z.w[1]-F[1]:Math.hypot(z.w[0]-Q[0],z.w[1]-Q[1])-this.Larm;};
    const guess=this.aU===null?pc.arcAt(-phi):mod(this.aU,pc.L),N=480,L=pc.L;let best=null,bd=1e9;
    for(let i=0;i<N;i++){const a0=i/N*L,a1=(i+1)/N*L,f0=f(a0),f1=f(a1);if(f0*f1>0)continue;let lo=a0,hi=a1,flo=f0;for(let k=0;k<28;k++){const m=(lo+hi)/2,fm=f(m);if(fm*flo>0){lo=m;flo=fm;}else hi=m;}const r=(lo+hi)/2;
      const zw=at(r).w;if(zw[0]<F[0])continue;const pp=this.prevP||[F[0]+200,F[1]];const d=Math.hypot(zw[0]-pp[0],zw[1]-pp[1]);if(d<bd){bd=d;best=r;}}
    if(best===null)best=guess;if(this.aU===null)this.aU=best;else this.aU+=mod(best-mod(this.aU,L)+L/2,L)-L/2;
    const z=at(best);this.prevP=z.w;this.g={phi,r:z.r,P:z.w,pa:Math.atan2(-z.n[1],-z.n[0])-(PI/12-this.aU/Rp)};},
  output(){return this.g.pa/TAU;},
  draw(){const g=this.g,pc=this.pc(),F=this.F,Rp=this.Rp,P=g.P;
    if(o.slot){ctx.beginPath();ctx.rect(F[0]+60,F[1]-14,330,28);ctx.rect(F[0]+70,F[1]-6,310,12);paint(C.part2,C.ink);}
    ncGear(F[0],F[1],pc,0,g.phi,C['brass-fill']);
    if(o.slot){springZ(P[0]+12,P[1],F[0]+380,P[1],9,7);ctx.beginPath();ctx.rect(P[0]-9,P[1]-6,18,12);paint(C.part,C.ink);}
    else{const Q=this.Q;bar(Q[0],Q[1],P[0],P[1],12,C.part2);pivot(Q[0],Q[1],6);ground(Q[0],Q[1]-12,40,true);}
    drawGear(P[0],P[1],Rp,12,g.pa,C['steel-fill'],{bore:5});pivot(P[0],P[1],4);label(o.label,400,470,'center');},
  reads(){return[['Driving radius now',`${this.g.r.toFixed(0)} mm`],['Pinion speed',`${(this.g.r/this.Rp).toFixed(2)} × gear`]];}});}
pinionFollower(35,s=>{const e=0.4,a=95;return a*(1-e*e)/(1+e*Math.cos(s));},{slot:true,label:'PINION SHAFT SLIDES IN A SLOTTED BAR · A SPRING KEEPS IT IN MESH'});
pinionFollower(221,s=>{const e=0.4,a=95;return a*(1-e*e)/(1+e*Math.cos(s));},{label:'PINION ON A SWINGING ARM FOLLOWS THE ELLIPSE'});
pinionFollower(201,s=>90+22*Math.cos(s)+12*Math.cos(3*s),{label:'IRREGULAR GEAR · arm swings unevenly'});
pinionFollower(222,s=>{const R=90,e=28;return Math.sqrt(R*R-e*e*Math.sin(s)**2)+e*Math.cos(s);},{label:'ROUND GEAR ON AN OFF-CENTRE AXIS',concept:false});

function bevelDiff(num,o){return reg({num,outLabel:o.out||'Output, turns',concept:true,params:o.params||[],
  update(phi){const k=o.kin.call(this,phi);this.g=Object.assign({phi},k);},output(){return this.g[o.outKey||'b']/TAU;},
  draw(){const g=this.g,O=[400,260];
    const stripes=(pts,a,n,horiz)=>{ctx.save();poly(pts);ctx.closePath();ctx.clip();ctx.strokeStyle=C.ink;ctx.lineWidth=1;for(let k=0;k<n;k++){const t=a+k*TAU/n;if(Math.cos(t)<=0)continue;ctx.globalAlpha=.25+.6*Math.cos(t);const u=Math.sin(t);ctx.beginPath();if(horiz){ctx.moveTo(0,O[1]+u*95);ctx.lineTo(W,O[1]+u*95);}else{ctx.moveTo(O[0]+u*60,0);ctx.lineTo(O[0]+u*60,H);}ctx.stroke();}ctx.restore();};
    ctx.beginPath();ctx.rect(O[0]-150,O[1]-150,300,300);ctx.rect(O[0]-130,O[1]-130,260,260);paint(C.part,C.ink);
    ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=1;for(let k=0;k<16;k++){const t=g.c+k*TAU/16;if(Math.cos(t)<=0)continue;ctx.globalAlpha=.3+.6*Math.cos(t);const y=O[1]+140*Math.sin(t);ctx.beginPath();ctx.moveTo(O[0]-150,y);ctx.lineTo(O[0]-130,y);ctx.moveTo(O[0]+130,y);ctx.lineTo(O[0]+150,y);ctx.stroke();}ctx.restore();
    bar(60,O[1],O[0]-40,O[1],16,C.part2);bar(O[0]+40,O[1],740,O[1],16,C.part2);
    const L=[[O[0]-110,O[1]-30],[O[0]-60,O[1]-95],[O[0]-60,O[1]+95],[O[0]-110,O[1]+30]],R=L.map(([x,y])=>[2*O[0]-x,y]);
    poly(L);ctx.closePath();paint(C['brass-fill'],C.ink);stripes(L,g.a,12,true);poly(R);ctx.closePath();paint(C['steel-fill'],C.ink);stripes(R,-g.b,12,true);
    const ps=(g.a-g.b)/2-g.c*0;for(const s of [-1,1]){const T=[[O[0]-28,O[1]+s*125],[O[0]+28,O[1]+s*125],[O[0]+50,O[1]+s*60],[O[0]-50,O[1]+s*60]];poly(T);ctx.closePath();paint(C.hi,C.ink);stripes(T,s*ps*1.6,8,false);bar(O[0],O[1]+s*130,O[0],O[1]+s*150,10,C.part2);}
    label(o.la||'LEFT WHEEL',O[0]-180,O[1]+180,'center');label(o.lb||'RIGHT WHEEL',O[0]+180,O[1]+180,'center');label('PINIONS RIDE ROUND IN THE FRAME',O[0]+160,O[1]-170);
    label(o.label,400,30,'center');label('section through the gear box',400,500,'center');},
  reads(v){return o.reads.call(this);}});}
bevelDiff(61,{label:'DIFFERENTIAL GEAR · single or double speed',params:[{id:'m',type:'toggle',label:'Right wheel',options:[[0,'Held'],[1,'Driven too']],value:0}],
  kin(phi){const a=phi,b=this.P.m?phi:0;return{a,b:0,c:(a+b)/2,bb:b};},outKey:'c',out:'Frame, turns',reads(){return[['Frame speed',this.P.m?'= input (double)':'½ input (single)']];}});
bevelDiff(62,{label:'DIFFERENTIAL, THIRD WHEEL BELT-DRIVEN',params:[{id:'s',label:'Belt-driven wheel speed',min:-1,max:1,step:0.1,value:0.5,fmt:v=>`${v} × input`}],
  kin(phi){const a=phi,b=phi*this.P.s;return{a,b,c:(a+b)/2};},outKey:'c',out:'Frame, turns',reads(){return[['Frame speed',`${((1+this.P.s)/2).toFixed(2)} × input`]];}});
bevelDiff(495,{label:'BEVEL EPICYCLIC · one wheel fixed, output twice as fast',kin(phi){const c=phi*0.5;return{a:0,b:2*c,c};},out:'Output wheel, turns',reads(){return[['Fixed wheel','left'],['Output','2 × frame speed']];},la:'FIXED',lb:'OUTPUT'});
bevelDiff(226,{label:'SIX BEVEL GEARS · speed doubled',kin(phi){const c=phi*0.5;return{a:0,b:2*c,c};},out:'Output, turns',reads(){return[['Output','2 × frame speed']];},la:'FIXED',lb:'OUTPUT'});
bevelDiff(503,{label:'DIFFERENTIAL · lets two wheels turn at different speeds',params:[{id:'k',label:'Turn the corner',min:-0.5,max:0.5,step:0.05,value:0.2,fmt:v=>v==0?'straight':(v>0?'right':'left')}],
  kin(phi){const c=phi*0.5;return{a:c*(1+this.P.k),b:c*(1-this.P.k),c};},outKey:'a',out:'Left wheel, turns',reads(){return[['Left wheel',`${(1+this.P.k).toFixed(2)} × frame`],['Right wheel',`${(1-this.P.k).toFixed(2)} × frame`]];},la:'LEFT AXLE',lb:'RIGHT AXLE'});
bevelDiff(506,{label:'EPICYCLIC DRIVEN FROM BOTH ENDS',params:[{id:'s',label:'Second input speed',min:-1,max:1,step:0.1,value:-0.4,fmt:v=>`${v} × first`}],
  kin(phi){const a=phi,b=phi*this.P.s;return{a,b,c:(a+b)/2};},outKey:'c',out:'Arm, turns',reads(){return[['Arm speed',`${((1+this.P.s)/2).toFixed(2)} × first input`]];}});

reg({num:57,outLabel:'Carrier, turns',concept:true,
  update(phi){const s=phi,r=-phi*0.25,c=(24*s+48*r)/72,p=c-(s-c)*2;this.g={phi,s,r,c,p};},output(){return this.g.c/TAU;},
  draw(){const O=[400,265],g=this.g,ts=TAU/24,tr=TAU/48;
    poly(gearPts(O[0],O[1],120,48,g.r+tr/2,true));ctx.closePath();circ(O[0],O[1],146,false);paint(C['steel-fill'],C.ink);
    const pc=[0,1,2].map(k=>{const b=g.c+k*TAU/3;return[O[0]+90*Math.cos(b),O[1]+90*Math.sin(b)];});drawGear(O[0],O[1],60,24,g.s+ts/2,C['brass-fill'],{bore:8});pc.forEach((q,k)=>drawGear(q[0],q[1],30,12,g.p+k*TAU/3,C.hi,{bore:5}));
    ctx.beginPath();ctx.moveTo(...pc[0]);for(const q of pc)ctx.lineTo(...q);ctx.closePath();paint(null,C.part2,6);for(const q of pc)pivot(q[0],q[1],4);pivot(O[0],O[1],6);
    label('INNER AND OUTER WHEELS TURN OPPOSITE WAYS',400,470,'center');label('PINIONS BETWEEN THEM CARRY THE ARM ROUND',400,490,'center');},
  reads(){return[['Inner wheel','1 turn'],['Outer wheel','¼ turn back'],['Arm',`${(this.g.c/this.g.phi||0).toFixed(3)} × inner`]];}});

reg({num:507,outLabel:'Output wheel, turns',
  update(phi){const arm=phi*2;this.g={phi,arm,slow:arm*(1-(44*50)/(40*55)),pl:-arm*(110/40)};},output(){return this.g.slow/TAU;},
  draw(){const g=this.g,O=[400,265],P=[O[0]+150*Math.cos(g.arm),O[1]+150*Math.sin(g.arm)];
    drawGear(O[0],O[1],110,44,0,C.part2,{bore:8});drawGear(O[0],O[1],100,40,g.slow*40,C['steel-fill'],{bore:8});
    drawGear(P[0],P[1],50,20,g.pl,C.hi,{bore:5});drawGear(P[0],P[1],40,16,g.pl+0.1,C.part,{bore:5});bar(O[0],O[1],P[0],P[1],14,C['brass-fill']);pivot(P[0],P[1],4);pivot(O[0],O[1],6);
    const t=g.slow*40-PI/2;bar(O[0],O[1],O[0]+70*Math.cos(t),O[1]+70*Math.sin(t),5,C.steel);
    label('FIXED WHEEL (back) and OUTPUT WHEEL (front) differ by a tooth or so',400,470,'center');label('the output only creeps round',400,490,'center');},
  reads(){const g=this.g;return[['Arm turns',`${(g.arm/TAU).toFixed(1)}`],['Output turns',`${(g.slow/TAU).toFixed(3)}`],['Brown\'s train','about 25,000 arm turns per output turn']];}});

/* ---- mangle wheels ---- */
/* mangle wheel: pins on a closed track (outer row Ro, inner row Ri, round ends of radius e) at exactly the pinion's pitch;
   the pinion's axle runs in a groove that follows the track, so it passes outside the outer row one way and inside the inner row the other */
function mangleGeo(o){let Ro=o.Ro,Ri=o.Ri;const rp=22,Z=9,p=TAU*rp/Z;let e=(Ro-Ri)/2;if(e<6){Ro=Ri=(Ro+Ri)/2;e=0;}const Rm=(Ro+Ri)/2,q=e+rp,gw=12;
  let span=Math.min(o.span,TAU-2*(q+gw)/Rm-0.25);const Nt=Math.round(((Ro+Ri)*span+TAU*e)/p);span=(Nt*p-TAU*e)/(Ro+Ri);
  const t0=-PI/2-span/2,t1=-PI/2+span/2,u0=[Math.cos(t0),Math.sin(t0)],u1=[Math.cos(t1),Math.sin(t1)],v0=[-u0[1],u0[0]],v1=[-u1[1],u1[0]],C0=[Rm*u0[0],Rm*u0[1]],C1=[Rm*u1[0],Rm*u1[1]];
  const La=Ro*span,Lc=Ri*span,Le=PI*e;
  const pinAt=sg=>{if(sg<La){const t=t0+sg/Ro;return[Ro*Math.cos(t),Ro*Math.sin(t)];}if(sg<La+Le){const u=(sg-La)/e;return[C1[0]+e*(u1[0]*Math.cos(u)+v1[0]*Math.sin(u)),C1[1]+e*(u1[1]*Math.cos(u)+v1[1]*Math.sin(u))];}
    if(sg<La+Le+Lc){const t=t1-(sg-La-Le)/Ri;return[Ri*Math.cos(t),Ri*Math.sin(t)];}const u=(sg-La-Le-Lc)/e;return[C0[0]-e*(u0[0]*Math.cos(u)+v0[0]*Math.sin(u)),C0[1]-e*(u0[1]*Math.cos(u)+v0[1]*Math.sin(u))];};
  const pins=[];for(let k=0;k<Nt;k++){const P=pinAt(k*p);if(!pins.some(Q=>Math.hypot(Q[0]-P[0],Q[1]-P[1])<2))pins.push(P);}
  /* closed loop of the pinion centre, offset outward by dr */
  const loop=(dr,n=48)=>{const pts=[],ro=Ro+rp+dr,ri=Ri-rp-dr,rq=q+dr;
    for(let i=0;i<=n*2;i++){const t=t0+(t1-t0)*i/(n*2);pts.push([ro*Math.cos(t),ro*Math.sin(t)]);}
    for(let i=1;i<n;i++){const u=PI*i/n;pts.push([C1[0]+rq*(u1[0]*Math.cos(u)+v1[0]*Math.sin(u)),C1[1]+rq*(u1[1]*Math.cos(u)+v1[1]*Math.sin(u))]);}
    for(let i=0;i<=n*2;i++){const t=t1+(t0-t1)*i/(n*2);pts.push([ri*Math.cos(t),ri*Math.sin(t)]);}
    for(let i=1;i<n;i++){const u=PI*i/n;pts.push([C0[0]-rq*(u0[0]*Math.cos(u)+v0[0]*Math.sin(u)),C0[1]-rq*(u0[1]*Math.cos(u)+v0[1]*Math.sin(u))]);}
    return pts;};
  return{Ro,Ri,e,Rm,q,rp,Z,p,span,Nt,pins,loop,gw,Rw:Ro+rp+gw+12,La,Lc,Lt:PI*q,P:La+Lc+TAU*q};}
function mangle(num,o){const G=mangleGeo(o);return reg({num,outLabel:'Wheel angle, degrees',concept:!!o.concept,geo:G,
  update(phi){const {Ro,Ri,rp,span,q,La,Lt,Lc,P,Rm}=G,s=mod(rp*phi,P);let w,pc;
    if(s<La){w=span/2-s/Ro;pc=[0,-(Ro+rp)];}else if(s<La+Lt){w=-span/2;const t=-PI/2+(s-La)/q;pc=[q*Math.cos(t),-Rm+q*Math.sin(t)];}
    else if(s<La+Lt+Lc){w=-span/2+(s-La-Lt)/Ri;pc=[0,-(Ri-rp)];}else{w=span/2;const t=PI/2+(s-La-Lt-Lc)/q;pc=[q*Math.cos(t),-Rm+q*Math.sin(t)];}
    this.g={phi,w,pc,rp,a:phi+PI/2-PI/G.Z};},
  output(){return this.g.w*180/PI;},
  draw(){const g=this.g,O=[400,300],c=Math.cos(g.w),s=Math.sin(g.w),T=([x,y])=>[O[0]+x*c-y*s,O[1]+x*s+y*c];
    circ(O[0],O[1],G.Rw);paint(C['steel-fill'],C.ink);
    ctx.beginPath();const lo=G.loop(G.gw/2).map(T),li=G.loop(-G.gw/2).map(T);lo.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();li.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();paint(C.sheet,C.ink,0.8);
    for(const p of G.pins){const q=T(p);circ(q[0],q[1],3.6);paint(C.part,C.ink,1);}
    pivot(O[0],O[1],6);const P=[O[0]+g.pc[0],O[1]+g.pc[1]];
    ctx.save();ctx.setLineDash([5,4]);ctx.strokeStyle=C.muted;ctx.lineWidth=1;circ(O[0],O[1]-G.Rm,G.q+6,false);ctx.stroke();ctx.restore();
    drawGear(P[0],P[1],g.rp,G.Z,g.a,C['brass-fill'],{bore:4});pivot(P[0],P[1],3);
    label(o.label,400,505,'center');label('pinion axle runs in the groove · dashed: window in the bridge',400,30,'center');},
  reads(){return[['Wheel',`${(this.g.w*180/PI).toFixed(0)}°`],['Pinion','turns one way only'],['Speeds',Math.abs(o.Ro-o.Ri)<6?'equal both ways':'slower one way']];}});}
mangle(36,{Ro:130,Ri:130,span:PI*1.7,label:'ONE ROW OF TEETH · the pinion works outside it one way and inside it the other'});
mangle(192,{Ro:160,Ri:100,span:PI*1.5,label:'SPEED CHANGES THROUGH EACH SWING',concept:true});
mangle(193,{Ro:165,Ri:105,span:PI*1.8,label:'NEARLY A FULL TURN EACH WAY, SLOWER ONE WAY'});
mangle(194,{Ro:132,Ri:128,span:PI*1.6,label:'EQUAL SPEED BOTH WAYS'});
mangle(371,{Ro:134,Ri:126,span:PI*1.7,label:'TEETH ON BOTH FACES, PINION PASSES BETWEEN',concept:true});
aliasObj(197,M119,{concept:true});aliasObj(198,SIMS_NEW[114],{concept:true});aliasObj(199,SIMS_NEW[114],{concept:true});

/* ---- other gearing ---- */
reg({num:191,outLabel:'Pinion turns',
  update(phi){const th=PI+PI*Math.sin(phi*0.5);const r=50+70*th/TAU;this.g={phi,th,r,pa:-(50*th+35*th*th/TAU)/25};},output(){return this.g.pa/TAU;},
  draw(){const g=this.g,O=[330,265];const pts=[];for(let i=0;i<=200;i++){const s=i/200*TAU;const r=50+70*s/TAU;pts.push([O[0]+r*Math.cos(-s+g.th),O[1]+r*Math.sin(-s+g.th)]);}pts.push([O[0]+50*Math.cos(g.th),O[1]+50*Math.sin(g.th)]);poly(pts);ctx.closePath();paint(C['brass-fill'],C.ink);pivot(O[0],O[1],6);
    const P=[O[0]+g.r+25,O[1]];ctx.beginPath();ctx.rect(O[0]+60,O[1]-12,260,24);ctx.rect(O[0]+70,O[1]-5,240,10);paint(C.part2,C.ink);drawGear(P[0],P[1],25,10,g.pa,C['steel-fill'],{bore:4});pivot(P[0],P[1],3);
    label('SCROLL GEAR · driving radius grows through the turn',400,470,'center');},
  reads(){return[['Driving radius',`${this.g.r.toFixed(0)} mm`],['Pinion speed',`${(this.g.r/25).toFixed(2)} × scroll`]];}});
aliasObj(414,SIMS_NEW[191],{concept:true});

reg({num:200,outLabel:'Pinion B turns',
  update(phi){this.g={phi,a:-phi*5,b:phi*3};},output(){return this.g.b/TAU;},
  draw(){const g=this.g,O=[400,260];drawGear(O[0],O[1],150,60,g.phi,C['brass-fill'],{bore:10});poly(gearPts(O[0],O[1],90,36,g.phi+PI/36,true));ctx.closePath();circ(O[0],O[1],60,false);paint(C.sheet,C.ink);circ(O[0],O[1],60);paint(C.part,C.ink);pivot(O[0],O[1],6);
    drawGear(O[0]+180,O[1],30,12,g.a+PI/12,C['steel-fill'],{bore:4});drawGear(O[0]-60,O[1],30,12,g.b,C['steel-fill'],{bore:4});pivot(O[0]+180,O[1],4);pivot(O[0]-60,O[1],4);
    label('OUTER TEETH: pinion A',O[0]+215,O[1]-50);label('INNER TEETH: pinion B',O[0]-200,O[1]-120);},
  reads(){return[['Pinion A','5 × wheel, reversed'],['Pinion B','3 × wheel, same way']];}});
aliasObj(55,SIMS_NEW[200],{concept:true});

reg({num:208,outLabel:'Pinion turns',params:[{id:'k',label:'Pin circle',min:1,max:3,step:1,value:2,fmt:v=>['inner','middle','outer'][v-1]}],
  update(phi){const R=[70,110,150][this.P.k-1];this.g={phi,R,pa:-phi*R/24};},output(){return this.g.pa/TAU;},
  draw(){const g=this.g,O=[360,265];circ(O[0],O[1],170);paint(C['brass-fill'],C.ink);for(const R of [70,110,150]){const n=Math.round(R/9);for(let i=0;i<n;i++){const t=g.phi+i*TAU/n;circ(O[0]+R*Math.cos(t),O[1]+R*Math.sin(t),4);paint(R===g.R?C.part2:C.part,C.ink,.8);}}pivot(O[0],O[1],6);
    const x=O[0]+g.R;ctx.beginPath();ctx.rect(x-12,O[1]-50,24,40);paint(C['steel-fill'],C.ink);stripesV(x,O[1]-50,O[1]-10,10,g.pa);bar(x,O[1]-30,760,O[1]-30,8,C.part);label('SLIDE THE PINION TO CHANGE SPEED',560,O[1]-60);},
  reads(){return[['Pin circle',`${this.g.R} mm`],['Pinion speed',`${(this.g.R/24).toFixed(2)} × wheel`]];}});

reg({num:219,outLabel:'Pinion turns',concept:true,
  reset(){this.pa=0;this.last=null;},
  update(phi){const e=40,r=Math.hypot(130+e*Math.cos(phi),e*Math.sin(phi));if(this.last===null)this.last=phi;this.pa-=(phi-this.last)*r/26;this.last=phi;this.g={phi,r,e};},output(){return this.pa/TAU;},
  draw(){const g=this.g,O=[360,265],C0=[O[0]+g.e*Math.cos(g.phi),O[1]+g.e*Math.sin(g.phi)];circ(C0[0],C0[1],160);paint(C['brass-fill'],C.ink);for(let i=0;i<48;i++){const t=g.phi+i*TAU/48;circ(C0[0]+130*Math.cos(t),C0[1]+130*Math.sin(t),4);paint(C.part2,C.ink,.8);}
    pivot(O[0],O[1],6);const x=O[0]+g.r;ctx.beginPath();ctx.rect(x-12,O[1]-50,24,44);paint(C['steel-fill'],C.ink);stripesV(x,O[1]-50,O[1]-6,10,this.pa);label('CROWN WHEEL TURNS ON AN OFF-CENTRE AXIS',400,470,'center');},
  reads(){return[['Contact radius',`${this.g.r.toFixed(0)} mm`],['Pinion speed',`${(this.g.r/26).toFixed(2)} × wheel`]];}});

reg({num:223,outLabel:'Driven, turns',concept:true,
  seg(t){const u=mod(t,TAU),k=Math.floor(u/(TAU/3));return k;},
  update(phi){const R1=[50,70,90],R2=[110,90,70];let a=0;const n=Math.floor(phi/TAU);const rem=phi-n*TAU;let per=0;for(let k=0;k<3;k++)per+=TAU/3*R1[k]/R2[k];a=n*per;let left=rem;for(let k=0;k<3&&left>0;k++){const d=Math.min(left,TAU/3);a+=d*R1[k]/R2[k];left-=d;}this.g={phi,a2:-a,k:this.seg(phi)};},
  output(){return -this.g.a2/TAU;},
  draw(){const g=this.g,A=[290,265],B=[450,265],R1=[50,70,90],R2=[110,90,70];for(let k=2;k>=0;k--){ctx.beginPath();ctx.moveTo(A[0],A[1]);ctx.arc(A[0],A[1],R1[k],g.phi+k*TAU/3-TAU/3,g.phi+k*TAU/3);ctx.closePath();paint(k===g.k?C['brass-fill']:C.part,C.ink);}
    for(let k=2;k>=0;k--){circ(B[0],B[1],R2[k]);paint(k===g.k?C['steel-fill']:C.part2,C.ink,.8);}bar(B[0],B[1],B[0]+60*Math.cos(g.a2),B[1]+60*Math.sin(g.a2),6,C.part);pivot(A[0],A[1],6);pivot(B[0],B[1],6);label('SECTORS ON THREE PLANES · speed changes in steps',400,470,'center');},
  reads(){const k=this.g.k;return[['Active pair',`${k+1} of 3`],['Ratio now',`${([50,70,90][k]/[110,90,70][k]).toFixed(2)}`]];}});

reg({num:216,outLabel:'Pinion angle, degrees',concept:true,
  update(phi){const u=cyc(phi);let a;if(u<0.7)a=-(u/0.7)*2.4;else a=-2.4+((u-0.7)/0.3)*2.4;this.g={phi,a,fwd:u<0.7};},output(){return this.g.a*180/PI;},
  draw(){const g=this.g,O=[360,270],P=[O[0]+150,O[1]];circ(O[0],O[1],170);paint(C.part,C.ink);ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=8;ctx.beginPath();ctx.arc(O[0],O[1],125,g.phi,g.phi+0.7*TAU);ctx.stroke();ctx.strokeStyle=C['brass-fill'];ctx.lineWidth=5;ctx.stroke();ctx.restore();
    pivot(O[0],O[1],6);drawGear(P[0],P[1],24,10,g.a,C['steel-fill'],{bore:4});pivot(P[0],P[1],3);label(g.fwd?'SLOW FORWARD (outer teeth)':'QUICK RETURN (inner teeth)',400,480,'center');},
  reads(){return[['Phase',this.g.fwd?'slow forward':'quick return']];}});

reg({num:37,outLabel:'Wheel turns',concept:true,
  reset(){this.w=0;this.last=null;},
  r(m){return 60+110*mod(m,TAU)/TAU;},
  update(phi){if(this.last===null)this.last=phi;const d=phi-this.last;this.last=phi;const r=this.r(-this.w);this.w+=d*26/r;this.g={phi,r};},output(){return this.w/TAU;},
  draw(){const g=this.g,O=[330,265];circ(O[0],O[1],180);paint(C['brass-fill'],C.ink);for(let i=0;i<70;i++){const m=i/70*TAU;const r=this.r(m);circ(O[0]+r*Math.cos(m+this.w),O[1]+r*Math.sin(m+this.w),4);paint(C.part2,C.ink,.8);}pivot(O[0],O[1],6);
    const x=O[0]+g.r;ctx.beginPath();ctx.rect(x-12,O[1]-50,24,44);paint(C['steel-fill'],C.ink);stripesV(x,O[1]-50,O[1]-6,10,g.phi);bar(x,O[1]-28,760,O[1]-28,8,C.part);label('PINION SLIDES OUT ALONG THE SPIRAL OF STUDS',400,475,'center');},
  reads(){return[['Stud radius',`${this.g.r.toFixed(0)} mm`],['Wheel speed',`${(26/this.g.r).toFixed(2)} × pinion`]];}});

reg({num:29,outLabel:'Wheel turns',
  update(phi){this.g={phi,w:-phi/24};},output(){return -this.g.w/TAU;},
  draw(){const g=this.g,D=[270,265],W=[270+150+60,265];circ(D[0],D[1],150);paint(C['brass-fill'],C.ink);ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=5;ctx.beginPath();for(let i=0;i<=300;i++){const s=i/300*TAU;const r=40+100*s/TAU;const x=D[0]+r*Math.cos(s+g.phi),y=D[1]+r*Math.sin(s+g.phi);i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();ctx.restore();pivot(D[0],D[1],6);
    drawGear(W[0],W[1],60,24,g.w,C['steel-fill'],{bore:6});pivot(W[0],W[1],5);label('SPIRAL ON THE DISK FACE · one tooth per turn',400,470,'center');},
  reads(){return[['Ratio','24 : 1']];}});

reg({num:27,outLabel:'Wheel turns',concept:true,
  update(phi){this.g={phi,w:phi/8};},output(){return this.g.w/TAU;},
  draw(){const g=this.g,O=[400,265],N=9;circ(O[0],O[1],180);paint(C['steel-fill'],C.ink);for(let k=0;k<N;k++){const t=g.w+k*TAU/N;ctx.save();ctx.translate(O[0],O[1]);ctx.rotate(t);ctx.beginPath();ctx.rect(40,-12,130,24);ctx.fillStyle=C.sheet;ctx.fill();ctx.restore();
      const cam=r=>70+25*Math.cos(3*(t-g.phi));circ(O[0]+(cam()+12)*Math.cos(t),O[1]+(cam()+12)*Math.sin(t),11);paint(C['brass-fill'],C.ink);}
    const pts=[];for(let i=0;i<180;i++){const s=i/180*TAU;const r=70+25*Math.cos(3*(s-g.phi));pts.push([O[0]+r*Math.cos(s),O[1]+r*Math.sin(s)]);}poly(pts);ctx.closePath();paint(C.part,C.ink);pivot(O[0],O[1],6);label('TRIANGULAR DRIVER PUSHES ROLLERS IN RADIAL SLOTS',400,480,'center');},
  reads(){return[['Wheel speed','slow, many rollers share the load']];}});

reg({num:196,outLabel:'Arm angle, degrees',concept:true,F:[600,120],
  update(phi){const G=[340,280],wa=-phi*0.5,pin=[G[0]+70*Math.cos(wa),G[1]+70*Math.sin(wa)];const A=cc(this.F,220,pin,200,1);this.g={phi,G,wa,pin,A,ang:Math.atan2(A[1]-this.F[1],A[0]-this.F[0])};},
  output(){return this.g.ang*180/PI;},
  draw(){const g=this.g;drawGear(g.G[0]-150,g.G[1],50,20,g.phi,C['brass-fill'],{bore:5});drawGear(g.G[0],g.G[1],100,40,g.wa+PI/40,C['steel-fill'],{bore:7});bar(g.pin[0],g.pin[1],g.A[0],g.A[1],8,C.part);bar(this.F[0],this.F[1],g.A[0],g.A[1],14,C.part2);
    pivot(g.pin[0],g.pin[1],4);pivot(g.A[0],g.A[1],4);pivot(this.F[0],this.F[1],6);pivot(g.G[0],g.G[1],5);pivot(g.G[0]-150,g.G[1],5);ground(this.F[0],this.F[1]-12,40,true);label('ARM SWINGS UNEVENLY',this.F[0]-40,this.F[1]+40,'right');},
  reads(){return[['Arm',`${(this.g.ang*180/PI).toFixed(0)}°`]];}});

reg({num:205,outLabel:'Wheel turns',concept:true,
  update(phi){const k=Math.floor(phi/PI),u=mod(phi,PI)/PI,s=smooth((u-0.3)/0.4);this.g={phi,w:-(k+s)*TAU/16};},output(){return -this.g.w/TAU;},
  draw(){const g=this.g,P=[280,265],W=[480,265];circ(W[0],W[1],140);paint(C['steel-fill'],C.ink);for(let i=0;i<16;i++){const t=g.w+i*TAU/16;circ(W[0]+120*Math.cos(t),W[1]+120*Math.sin(t),7);paint(i%2?C.part:C.part2,C.ink);}pivot(W[0],W[1],6);
    for(const s of [0,PI]){const a=g.phi+s;ctx.beginPath();ctx.ellipse(P[0]+30*Math.cos(a),P[1]+30*Math.sin(a),48,18,a,0,TAU);paint(C['brass-fill'],C.ink);}pivot(P[0],P[1],6);label('TWO-CAM PINION · two steps per turn',400,470,'center');},
  reads(){return[['Steps per pinion turn','2']];}});

reg({num:204,outLabel:'Driven cone, turns',
  update(phi){this.g={phi,a2:-phi};},output(){return -this.g.a2/TAU;},
  draw(){const g=this.g,O=[400,170],s2=Math.SQRT1_2,d1=70,d2=200;const r1=d1*s2,r2=d2*s2,y1=O[1]+d1*s2,y2=O[1]+d2*s2,x1=O[0]+d1*s2,x2=O[0]+d2*s2;
    poly([[O[0]-r1,y1],[O[0]+r1,y1],[O[0]+r2,y2],[O[0]-r2,y2]]);ctx.closePath();paint(C['brass-fill'],C.ink);ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=1;for(let k=0;k<8;k++){const t=g.phi+k*PI/4;if(Math.sin(t)>0){ctx.beginPath();ctx.moveTo(O[0]+r1*Math.cos(t),y1);ctx.lineTo(O[0]+r2*Math.cos(t),y2);ctx.stroke();}}ctx.restore();
    poly([[x1,O[1]-r1],[x1,O[1]+r1],[x2,O[1]+r2],[x2,O[1]-r2]]);ctx.closePath();paint(C['steel-fill'],C.ink);ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=1;for(let k=0;k<8;k++){const t=g.a2+k*PI/4;if(Math.sin(t)>0){ctx.beginPath();ctx.moveTo(x1,O[1]+r1*Math.cos(t));ctx.lineTo(x2,O[1]+r2*Math.cos(t));ctx.stroke();}}ctx.restore();
    ctx.beginPath();ctx.rect(O[0]-8,y2,16,120);paint(C.part,C.ink);ctx.beginPath();ctx.rect(x2,O[1]-8,140,16);paint(C.part,C.ink);label('SMOOTH CONES ROLL ON EACH OTHER',400,480,'center');},
  reads(){return[['Teeth','none, rolling friction'],['Shafts','at an angle']];}});

reg({num:46,outLabel:'Spring pull × radius',
  update(phi){const p=(1-Math.cos(phi/4))/2;this.g={phi,p,r:22+48*p};},output(){return (1-0.5*this.g.p)*this.g.r/22;},
  draw(){const g=this.g,B=[230,260],F0=380,F1=640;ctx.beginPath();ctx.rect(B[0]-60,B[1]-60,120,120);paint(C['brass-fill'],C.ink);stripesV(B[0],B[1]-60,B[1]+60,60,g.phi*2);
    poly([[F0,B[1]-22],[F1,B[1]-70],[F1,B[1]+70],[F0,B[1]+22]]);ctx.closePath();paint(C['steel-fill'],C.ink);ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=1;for(let x=F0;x<F1;x+=14){const r=22+48*(x-F0)/(F1-F0);ctx.beginPath();ctx.moveTo(x,B[1]-r);ctx.lineTo(x+7,B[1]+r);ctx.stroke();}ctx.restore();
    const cx=F0+(F1-F0)*g.p;rope([[B[0],B[1]-60],[cx,B[1]-g.r]]);bar(F1,B[1],720,B[1],10,C.part);
    label('BARREL WITH MAINSPRING',B[0],B[1]+90,'center');label('FUSEE',(F0+F1)/2,B[1]+100,'center');label('CHAIN',(B[0]+cx)/2,B[1]-g.r-30,'center');},
  reads(){const g=this.g;return[['Spring pull',`${((1-0.5*g.p)*100).toFixed(0)} %`],['Fusee radius',`${g.r.toFixed(0)} mm`],['Turning force','stays even']];}});

function clutch(num,type){return reg({num,outLabel:'Driven speed, %',
  reset(){this.sp=0;this.a=0;this.last=null;},
  update(phi){const u=cyc(phi,TAU*3),on=u<0.55;if(this.last===null)this.last=phi;const d=Math.abs(phi-this.last);this.last=phi;const rate=type==='friction'?0.6:3;this.sp+=((on?1:0)-this.sp)*Math.min(1,d*rate);this.a+=d*this.sp;this.g={phi,on,gap:on?0:30};},
  output(){return this.sp*100;},
  draw(){const g=this.g,y=260,x0=400;drumH(220,y,280,14,g.phi,C['brass-fill']);drumH(600,y,240,14,this.a,C['steel-fill']);
    const L=x0-10,R=x0+10+g.gap;if(type==='friction'){poly([[L-40,y-50],[L,y-30],[L,y+30],[L-40,y+50]]);ctx.closePath();paint(C['brass-fill'],C.ink);poly([[R,y-30],[R+40,y-50],[R+40,y+50],[R,y+30]]);ctx.closePath();paint(C['steel-fill'],C.ink);}
    else{ctx.beginPath();ctx.rect(L-40,y-50,40,100);paint(C['brass-fill'],C.ink);ctx.beginPath();ctx.rect(R,y-50,40,100);paint(C['steel-fill'],C.ink);
      for(let k=-1;k<=1;k++){const yy=y+k*30+12*Math.sin(g.phi);if(type==='jaw'){ctx.beginPath();ctx.rect(L,yy-8,14,16);paint(C['brass-fill'],C.ink);}else{circ(L+8,yy,6);paint(C['brass-fill'],C.ink);}}}
    bar(R+20,y-60,R+20,y-130,8,C.part);bar(R+20,y-130,R+180,y-130,8,C.part);pivot(R+180,y-130,5);label(g.on?'ENGAGED':'THROWN OUT',x0,y+100,'center');label({friction:'CONE FRICTION CLUTCH',jaw:'JAW CLUTCH',stud:'STUDS ENTER HOLES',pin:'PIN CLUTCH'}[type],x0,y+130,'center');},
  reads(){return[['Clutch',this.g.on?'engaged':'free'],['Driven speed',`${(this.sp*100).toFixed(0)} %`],['Take-up',type==='friction'?'smooth':'sudden']];}});}
clutch(47,'friction');clutch(48,'jaw');clutch(52,'stud');clutch(361,'pin');

reg({num:53,outLabel:'Output speed',
  reset(){this.a=0;this.last=null;},
  update(phi){const u=cyc(phi,TAU*4);const sel=u<0.4?1:u<0.5?0:u<0.9?-1:0;if(this.last===null)this.last=phi;const d=phi-this.last;this.last=phi;this.a+=d*sel;this.g={phi,sel};},output(){return this.g.sel;},
  draw(){const g=this.g,y=300;drumH(400,y,480,12,this.a,C['steel-fill']);const P=[400,y-110];bar(P[0],60,P[0],P[1],12,C.part);
    for(const s of [-1,1]){const x=400+s*90;poly([[x-s*0,y-70],[x+s*40,y-40],[x+s*40,y+40],[x,y+70]]);ctx.closePath();paint(C['brass-fill'],C.ink);}
    drumH(400,P[1],70,40,g.phi,C['brass-fill']);const cx=400+g.sel*30;ctx.beginPath();ctx.rect(cx-18,y-40,36,80);paint(C.part2,C.ink);label(g.sel>0?'CLUTCH LEFT · forward':g.sel<0?'CLUTCH RIGHT · reverse':'NEUTRAL',400,460,'center');label('TWO LOOSE BEVEL GEARS, ONE DRIVING PINION',400,40,'center');},
  reads(){return[['Output',this.g.sel>0?'forward':this.g.sel<0?'reverse':'stopped']];}});

reg({num:56,outLabel:'Spindle speed, %',concept:true,
  reset(){this.sp=1;this.last=null;},
  update(phi){const on=cyc(phi,TAU*3)<0.5;if(this.last===null)this.last=phi;const d=Math.abs(phi-this.last);this.last=phi;this.sp+=((on?0.25:1)-this.sp)*Math.min(1,d*2);this.g={phi,on,dy:on?0:40};},output(){return this.sp*100;},
  draw(){const g=this.g;drawGear(330,300,80,32,g.phi*this.sp,C['steel-fill'],{bore:8});drawGear(330,300-80-30-g.dy,30,12,g.phi,C['brass-fill'],{bore:5});
    ctx.beginPath();ctx.rect(250,140-g.dy-60,300,20);paint(C.part2,C.ink);circ(560,150,40);paint(C.part,C.ink);ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=10;ctx.beginPath();ctx.arc(560,150,28,PI*0.2,PI*1.2);ctx.stroke();ctx.restore();
    bar(560,150,560+90*Math.cos(g.on?0.4:-0.6),150+90*Math.sin(g.on?0.4:-0.6),10,C['brass-fill']);pivot(560,150,5);label(g.on?'BACK GEAR IN · slow, strong':'BACK GEAR OUT · direct drive',400,470,'center');},
  reads(){return[['Back gear',this.g.on?'in':'out'],['Spindle',`${(this.sp*100).toFixed(0)} %`]];}});

/* ================= batch 3 · part 2: intermittent motion, ratchets, stops, escapements ================= */
const stepOf=(phi,u0,u1)=>{const k=Math.floor(phi/TAU),u=mod(phi,TAU)/TAU;return k+smooth((u-u0)/(u1-u0));};
function starWheel(x,y,r,N,a,fill,style){if(style==='studs'){circ(x,y,r-14);paint(fill,C.ink);for(let i=0;i<N;i++){const t=a+i*TAU/N;circ(x+r*Math.cos(t),y+r*Math.sin(t),7);paint(C.part2,C.ink);bar(x+(r-14)*Math.cos(t),y+(r-14)*Math.sin(t),x+r*Math.cos(t),y+r*Math.sin(t),5,C.part2);}}
  else if(style==='slots'){circ(x,y,r);for(let i=0;i<N;i++){const t=a+i*TAU/N;ctx.moveTo(x+(r-30)*Math.cos(t)+6*Math.sin(t),y+(r-30)*Math.sin(t)-6*Math.cos(t));ctx.arc(x+(r-30)*Math.cos(t),y+(r-30)*Math.sin(t),6,t-PI/2,t+PI/2,true);ctx.lineTo(x+(r+2)*Math.cos(t)-6*Math.sin(t),y+(r+2)*Math.sin(t)+6*Math.cos(t));ctx.lineTo(x+(r+2)*Math.cos(t)+6*Math.sin(t),y+(r+2)*Math.sin(t)-6*Math.cos(t));ctx.closePath();}paint(fill,C.ink);}
  else{const pts=[];for(let i=0;i<N;i++){const t=a+i*TAU/N;pts.push([x+r*Math.cos(t),y+r*Math.sin(t)]);pts.push([x+r*0.55*Math.cos(t+PI/N),y+r*0.55*Math.sin(t+PI/N)]);}poly(pts);ctx.closePath();paint(fill,C.ink);}
  pivot(x,y,5);}

/* ---- stepped intermittent drives ---- */
function stepper(num,o){return reg({num,outLabel:'Driven wheel, turns',concept:!!o.concept,
  update(phi){const s=stepOf(phi,o.u0??0.38,o.u1??0.62);this.g={phi,s,w:(o.dir||1)*s*TAU/o.N};},output(){return this.g.s/o.N;},
  draw(){const g=this.g,D=o.D||[290,280],Wc=o.Wc||[500,280],dirA=Math.atan2(Wc[1]-D[1],Wc[0]-D[0]),pa=g.phi-TAU*((o.u0??0.38)+(o.u1??0.62))/2+dirA,rd=o.rd||95;
    circ(D[0],D[1],rd);paint(C['brass-fill'],C.ink);
    if(o.rim){ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=10;ctx.beginPath();ctx.arc(D[0],D[1],rd-8,pa+0.6,pa+TAU-0.6);ctx.stroke();ctx.strokeStyle=C.part2;ctx.lineWidth=7;ctx.stroke();ctx.restore();}
    const P=[D[0]+(rd+8)*Math.cos(pa),D[1]+(rd+8)*Math.sin(pa)];bar(D[0]+(rd-12)*Math.cos(pa),D[1]+(rd-12)*Math.sin(pa),P[0],P[1],o.tooth?18:10,C['brass-fill']);if(!o.tooth){circ(P[0],P[1],8);paint(C.part2,C.ink);}pivot(D[0],D[1],6);
    starWheel(Wc[0],Wc[1],o.rw||110,o.N,g.w+(o.w0||PI),C['steel-fill'],o.style);
    if(o.pawl){const Q=[Wc[0]+30,Wc[1]-(o.rw||110)-60],off=mod(g.s,1),lift=off>0&&off<1?Math.sin(off*PI)*14:0;bar(Q[0],Q[1],Wc[0]+12,Wc[1]-(o.rw||110)*0.7-lift,8,C.part);pivot(Q[0],Q[1],5);springZ(Q[0]+60,Q[1]-20,Q[0]+30,Q[1]+18,8,5);}
    label(o.label,400,480,'center');if(o.l2)label(o.l2,400,500,'center');},
  reads(){const g=this.g;return[['Steps taken',`${Math.floor(g.s+1e-6)}`],['Each step',`1/${o.N} turn`],['Driver turns per step','1'],['Between steps',o.rim?'locked by the rim':'held at rest']];}});}
stepper(364,{N:12,style:'slots',rd:60,D:[330,260],Wc:[500,260],rw:120,label:'ROLLERS ON THE SMALL WHEEL STEP THE LARGE ONE',concept:true});
stepper(398,{N:4,style:'slots',u0:0.2,u1:0.8,label:'CAM STARTS AND STOPS THE DRIVEN WHEEL',concept:true});
oneTooth(69,true);SIMS_NEW[69].concept=true;
alias(213,212,{concept:true});alias(214,212,{concept:true});alias(215,212,{concept:true});

reg({num:233,outLabel:'Lantern wheel, turns',params:[{id:'m',type:'toggle',label:'Stop',options:[[0,'Pin stop'],[1,'Notched rim']],value:0}],
  update(phi){const lim=1.5*TAU;const a=lim*(1-Math.cos(phi*0.4))/2;this.g={phi,a,lim};},output(){return this.g.a/TAU;},
  draw(){const g=this.g,O=[360,270],R=100;circ(O[0],O[1],R+16);paint(C.part,C.ink);for(let i=0;i<10;i++){const t=g.a+i*TAU/10;circ(O[0]+R*Math.cos(t),O[1]+R*Math.sin(t),7);paint(C.part2,C.ink);}circ(O[0],O[1],R-20);paint(C['steel-fill'],C.ink);pivot(O[0],O[1],6);
    if(this.P.m===0){const t=g.a*0.333+PI;const S=[O[0]+150*Math.cos(t/1),O[1]+150*Math.sin(t)];drawGear(560,270,60,30,-g.a*R/60,C['brass-fill'],{bore:5});ctx.beginPath();ctx.rect(530,180,60,10);paint(C.part2,C.ink);label('STOP FINGER',600,170);}
    else{const t=-g.a/3;circ(600,270,70);paint(C['brass-fill'],C.ink);ctx.save();ctx.strokeStyle=C.sheet;ctx.lineWidth=12;ctx.beginPath();ctx.arc(600,270,64,t-0.3,t+0.3);ctx.stroke();ctx.restore();pivot(600,270,5);label('NOTCHED STOP WHEEL',600,370,'center');}
    label(g.a>g.lim-0.05?'STOPPED':'TURNING',O[0],O[1]+150,'center');},
  reads(){const g=this.g;return[['Turns made',`${(g.a/TAU).toFixed(2)}`],['Limit',`${(g.lim/TAU).toFixed(1)} turns`]];}});

reg({num:239,outLabel:'Gear angle, degrees',concept:true,
  update(phi){const lim=PI*1.6;this.g={phi,a:lim*Math.sin(phi*0.5)/1};},output(){return this.g.a*180/PI;},
  draw(){const g=this.g,A=[300,270],B=[480,270];drawGear(A[0],A[1],100,40,g.a,C['brass-fill'],{bore:6});drawGear(B[0],B[1],80,32,-g.a*100/80+PI/32,C['steel-fill'],{bore:6});
    const s=[A[0]+60*Math.cos(g.a+PI/2),A[1]+60*Math.sin(g.a+PI/2)];circ(s[0],s[1],9);paint(C.part2,C.ink);const t=-g.a*100/80;bar(B[0],B[1],B[0]+55*Math.cos(t-PI/2),B[1]+55*Math.sin(t-PI/2),10,C.part);
    pivot(A[0],A[1],6);pivot(B[0],B[1],6);label('STUD AND BLANK SPACE LIMIT THE TURN',400,470,'center');},
  reads(){return[['Gear',`${(this.g.a*180/PI).toFixed(0)}°`],['Range','about ± 290°']];}});

reg({num:240,outLabel:'Wheel angle, degrees',params:[{id:'m',type:'toggle',label:'Stop',options:[[0,'Pawl'],[1,'Wedge'],[2,'Roller']],value:0}],
  reset(){this.w=0;this.last=null;},
  update(phi){if(this.last===null)this.last=phi;const d=phi-this.last;this.last=phi;const drive=Math.cos(phi*0.7);this.w=Math.max(this.w-0.002,this.w+d*Math.max(0,drive)*0.6-d*0.25);this.g={phi,drive};},output(){return this.w*180/PI;},
  draw(){const g=this.g,O=[380,280],N=18;sawWheel(O[0],O[1],this.w,N,92,118,C['steel-fill']);paint(C['steel-fill'],C.ink);pivot(O[0],O[1],6);const m=this.P.m;
    if(m===0){const Q=[O[0]+150,O[1]-110];const rr=sawR(-0.55-this.w,N,92,118);const T=[O[0]+rr*Math.cos(-0.55),O[1]+rr*Math.sin(-0.55)];bar(Q[0],Q[1],T[0],T[1],10,C['brass-fill']);pivot(Q[0],Q[1],5);}
    else if(m===1){poly([[O[0]+122,O[1]-40],[O[0]+180,O[1]-80],[O[0]+180,O[1]+20]]);ctx.closePath();paint(C['brass-fill'],C.ink);springZ(O[0]+230,O[1]-30,O[0]+180,O[1]-30);}
    else{circ(O[0]+132,O[1]-30,14);paint(C['brass-fill'],C.ink);poly([[O[0]+150,O[1]-80],[O[0]+170,O[1]+40],[O[0]+200,O[1]+40],[O[0]+200,O[1]-80]]);ctx.closePath();paint(C.part2,C.ink);}
    label('LOAD TRIES TO TURN IT BACK',O[0],O[1]+160,'center');},
  reads(){return[['Stop',['pawl in the teeth','wedge pressed by a spring','roller jams in a taper'][this.P.m]],['Back-running','prevented']];}});

/* ---- worm-released intermittent ---- */
function wormRelease(num,o){return reg({num,outLabel:'Main wheel, turns',concept:true,
  update(phi){const slow=phi/6,u=mod(slow,TAU)/TAU,k=Math.floor(slow/TAU),rel=u>0.9;const s=k+smooth((u-0.9)/0.1);this.g={phi,slow,s,rel};},output(){return this.g.s;},
  draw(){const g=this.g,Wc=[300,280],R=110;circ(Wc[0],Wc[1],R);paint(C['steel-fill'],C.ink);bar(Wc[0],Wc[1],Wc[0]+R*0.8*Math.cos(g.s*TAU),Wc[1]+R*0.8*Math.sin(g.s*TAU),10,C.part);circ(Wc[0]+R*0.8*Math.cos(g.s*TAU),Wc[1]+R*0.8*Math.sin(g.s*TAU),10);paint(C.part2,C.ink);pivot(Wc[0],Wc[1],6);
    const S=[560,180];drawGear(S[0],S[1],60,30,g.slow,C['brass-fill'],{bore:5});stripeShaft(S[0]-90,S[0]+90,S[1]+76,14,g.phi,C.part);
    const cr=[S[0],S[1]];ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=2;ctx.beginPath();ctx.arc(cr[0],cr[1],40,g.slow+0.15,g.slow+TAU-0.45);ctx.stroke();ctx.restore();
    const lift=g.rel?18:0;bar(S[0]-40,S[1]+30,Wc[0]+R*0.8,Wc[1]-R*0.8+lift*0.2-10,8,C.part2);pivot(S[0]-40,S[1]+30,4);
    if(o.kind==='weight'){bar(S[0]+80,S[1]+140,S[0]+80,S[1]+200,4,C.part);weight(S[0]+80,S[1]+200,50,40,'');}else if(o.kind==='tumbler'){circ(S[0]+40,S[1]+190,20);paint(C['brass-fill'],C.ink);}else springZ(S[0]-40,S[1]+30,S[0]-40,S[1]+120);
    label('WORM SLOWLY TURNS THE CAM',S[0],S[1]-80,'center');label(g.rel?'RELEASED · main wheel makes one turn':'LOCKED',Wc[0],Wc[1]+150,'center');},
  reads(){return[['State',this.g.rel?'released':'locked'],['Return by',o.kind||'spring']];}});}


/* ---- lever and pawl drives ---- */
function leverPawl(num,o){return reg({num,outLabel:'Ratchet wheel, turns',concept:!!o.concept,params:o.params||[],o,
  reset(){this.w=0;this.last=null;},
  lever(phi){if(!o.crank)return(o.amp||0.35)*Math.sin(phi);const O=o.O||[380,300],L=112+90,Cc=[O[0]+260,O[1]-60],pin=[Cc[0]+40*Math.cos(phi),Cc[1]+40*Math.sin(phi)];if(this.Lr===undefined){const E0=[O[0],O[1]-L];this.Lr=Math.hypot(Cc[0]-E0[0],Cc[1]-E0[1]);}
    const E=cc(O,L,pin,this.Lr,-1);return Math.atan2(E[1]-O[1],E[0]-O[0])+PI/2;},
  update(phi){const a=this.lever(phi);if(this.last===null)this.last=a;const d=a-this.last;this.last=a;const dir=this.P.dir===undefined?1:this.P.dir;
    this.w+=o.double?Math.abs(d)*dir:Math.max(0,d*dir)*dir;this.g={phi,a,d};},output(){return this.w/TAU;},
  draw(){const g=this.g,O=o.O||[380,300],N=o.N||20,rr=90,rt=112,dir=this.P.dir===undefined?1:this.P.dir;
    if(o.rack){/* slotted rack variant */const y=300,x0=150+this.w*rr;ctx.beginPath();ctx.rect(x0-120,y,520,30);paint(C['steel-fill'],C.ink);for(let i=0;i<24;i++){ctx.beginPath();ctx.rect(x0-110+i*22,y+8,10,14);ctx.fillStyle=C.sheet;ctx.fill();}
      const F=[400,140];for(const s of [-1,1]){const t=PI/2+g.a+s*0.25;const T=[F[0]+170*Math.cos(t),F[1]+170*Math.sin(t)];bar(F[0],F[1],T[0],T[1],10,s>0?C['brass-fill']:C.part);ctx.beginPath();ctx.moveTo(T[0],T[1]);ctx.lineTo(T[0]+s*8,T[1]+14);paint(null,C.ink,4);}
      pivot(F[0],F[1],7);bar(F[0],F[1],F[0]+140*Math.cos(-PI/2+g.a),F[1]+140*Math.sin(-PI/2+g.a),12,C['brass-fill']);label('HOOKED PAWLS PULL THE RACK ALONG',400,480,'center');return;}
    sawWheel(O[0],O[1],dir*this.w*-1*-1,N,rr,rt,C['steel-fill']);paint(C['steel-fill'],C.ink);pivot(O[0],O[1],7);
    const arms=o.double?[0,PI]:[0];for(const off of arms){const la=-PI/2+g.a+off;const H=[O[0]+(rt+40)*Math.cos(la),O[1]+(rt+40)*Math.sin(la)];
      if(off===0){bar(O[0],O[1],O[0]+(rt+90)*Math.cos(la),O[1]+(rt+90)*Math.sin(la),14,C['brass-fill']);}else bar(O[0],O[1],H[0],H[1],12,C['brass-fill']);
      const ta=la+0.32*dir,r=sawR(ta-dir*this.w,N,rr,rt);bar(H[0],H[1],O[0]+r*Math.cos(ta),O[1]+r*Math.sin(ta),7,C.part);pivot(H[0],H[1],4);}
    const ha=PI*0.9,hr=sawR(ha-this.w,N,rr,rt);const HQ=[O[0]+(rt+50)*Math.cos(ha-0.4),O[1]+(rt+50)*Math.sin(ha-0.4)];bar(HQ[0],HQ[1],O[0]+hr*Math.cos(ha),O[1]+hr*Math.sin(ha),7,C.part2);pivot(HQ[0],HQ[1],4);
    if(o.crank){const Cc=[O[0]+260,O[1]-60],pin=[Cc[0]+40*Math.cos(g.phi),Cc[1]+40*Math.sin(g.phi)];circ(Cc[0],Cc[1],50);paint(C.part,C.ink);const la=-PI/2+g.a,E=[O[0]+(rt+90)*Math.cos(la),O[1]+(rt+90)*Math.sin(la)];bar(pin[0],pin[1],E[0],E[1],8,C.part2);pivot(pin[0],pin[1],4);pivot(Cc[0],Cc[1],5);}
    label(o.label,400,490,'center');},
  reads(){const g=this.g;return[['Lever',`${(g.a*180/PI).toFixed(0)}°`],['Drives on',o.double?'both strokes':'one stroke'],['Wheel',`${(this.w/TAU).toFixed(2)} turns`]];}});}
leverPawl(73,{label:'SPRING-DRIVEN PAWL ADVANCES THE WHEEL EACH TURN',crank:true,concept:true});
leverPawl(75,{label:'ROD SWINGS THE BAR, PAWL TURNS THE WHEEL',crank:true});

leverPawl(79,{double:true,label:'PAWLS ON TWO ARMS · WHEEL MOVES ON BOTH STROKES',crank:true});
leverPawl(80,{rack:true,double:true});
leverPawl(83,{double:true,label:'TWO RATCHET ARCS WITH OPPOSITE TEETH',concept:true});
leverPawl(155,{label:'FLIP THE PAWL TO DRIVE EITHER WAY',crank:true,params:[{id:'dir',type:'toggle',label:'Pawl set for',options:[[1,'Forward'],[-1,'Reverse']],value:1}]});
leverPawl(235,{label:'TAPPET ARM STEPS THE RATCHET, SKIPS ON RETURN',concept:true});
leverPawl(284,{label:'CRANK, LEVER AND PAWL FEED THE SAW CARRIAGE',crank:true,concept:true});
leverPawl(415,{label:'CORD SELECTS WHICH PAWL DRIVES',params:[{id:'dir',type:'toggle',label:'Pawl in use',options:[[1,'Left pawl'],[-1,'Right pawl']],value:1}]});
leverPawl(389,{label:'ECCENTRIC ROCKS THE LEVER · PAWL CLIMBS THE JACK',crank:true,concept:true});

function twinRatchet(num,o){return reg({num,outLabel:'Output shaft, turns',concept:!!o.concept,
  reset(){this.w=0;this.last=null;},
  update(phi){const a=0.5*Math.sin(phi);if(this.last===null)this.last=a;const d=a-this.last;this.last=a;this.w+=Math.abs(d);this.g={phi,a,d};},output(){return this.w/TAU;},
  draw(){const g=this.g,A=[270,260],B=[530,260];for(const [P,sgn] of [[A,1],[B,-1]]){sawWheel(P[0],P[1],this.w,16,70,88,sgn>0?C['steel-fill']:C.part);paint(sgn>0?C['steel-fill']:C.part,C.ink);pivot(P[0],P[1],5);const act=sgn*g.d>0;label(act?'DRIVING':'SLIPPING',P[0],P[1]+120,'center');}
    if(o.kind==='treadle'){for(const [P,s] of [[A,1],[B,-1]]){const y=430+s*g.a*60;bar(P[0]-120,430,P[0]+80,y,12,C['brass-fill']);pivot(P[0]-120,430,5);rope([[P[0]+70,y],[P[0]+70,P[1]-88],[P[0],P[1]-88]]);}rope([[A[0]-40,P0y(A)],[B[0]+40,P0y(B)]]);}
    else{const F=[400,120];bar(F[0],F[1],F[0]+160*Math.cos(PI/2+g.a),F[1]+160*Math.sin(PI/2+g.a),14,C['brass-fill']);pivot(F[0],F[1],7);const L=[F[0]+120*Math.cos(PI/2+g.a),F[1]+120*Math.sin(PI/2+g.a)];rope([[L[0],L[1]],[A[0],A[1]-88]]);rope([[L[0],L[1]],[B[0],B[1]-88]]);}
    stripeShaft(A[0],B[0],260,8,this.w,C.part2);label(o.label,400,30,'center');
    function P0y(P){return P[1]+88;}},
  reads(){return[['Input','swings both ways'],['Output','turns one way, both strokes'],['Turns',`${(this.w/TAU).toFixed(2)}`]];}});}
twinRatchet(82,{kind:'treadle',label:'TWO TREADLES, ONE CHAIN, TWO RATCHETS',concept:true});twinRatchet(390,{label:'LEVER AND BANDS TURN THE FLYWHEEL ONE WAY'});
twinRatchet(360,{label:'ROCKING BEAM, DRUMS AND RATCHETS TURN THE SHAFT',concept:true});

reg({num:116,outLabel:'Shaft turns',concept:true,
  reset(){this.w=0;this.last=null;},
  update(phi){const x=100*Math.sin(phi);if(this.last===null)this.last=x;const d=x-this.last;this.last=x;this.w+=Math.abs(d)/40;this.g={phi,x,d};},output(){return this.w/TAU;},
  draw(){const g=this.g,X=400+g.x;ctx.beginPath();ctx.rect(X-200,150,400,26);ctx.rect(X-200,344,400,26);paint(C['brass-fill'],C.ink);rackTeeth&&0;
    for(let i=0;i<20;i++){ctx.beginPath();ctx.rect(X-196+i*20,176,10,10);ctx.rect(X-196+i*20,334,10,10);paint(C['brass-fill'],C.ink,.8);}
    bar(X-200,163,X-200,357,12,C.part);bar(X-200,260,X-320,260,10,C.part);
    drawGear(400,226,40,12,this.w+g.phi*0,g.d>0?C['steel-fill']:C.part,{bore:5});drawGear(400,294,40,12,-this.w,g.d<0?C['steel-fill']:C.part,{bore:5});pivot(400,226,4);pivot(400,294,4);
    label(g.d>0?'UPPER PINION DRIVING':'LOWER PINION DRIVING',400,420,'center');label('ratchets inside the pinions let the idle one slip',400,440,'center');},
  reads(){return[['Racks','move back and forth'],['Shaft','turns one way only']];}});

reg({num:277,outLabel:'Cylinder, turns',
  update(phi){const u=cyc(phi),k=Math.floor(phi/TAU);const cock=u<0.6?smooth(u/0.6):(u<0.65?1:0);const s=k+smooth(Math.min(1,u/0.6));this.g={phi,cock,s,fire:u>=0.6&&u<0.66};},output(){return this.g.s/6;},
  draw(){const g=this.g,O=[330,280];circ(O[0],O[1],110);paint(C['steel-fill'],C.ink);for(let i=0;i<6;i++){const t=g.s*TAU/6+i*TAU/6;circ(O[0]+70*Math.cos(t),O[1]+70*Math.sin(t),20);paint(C.sheet,C.ink);}
    sawWheel(O[0],O[1],g.s*TAU/6,6,22,36,C.part);paint(C.part,C.ink);pivot(O[0],O[1],5);
    const H=[560,320],ha=-0.9*g.cock;ctx.save();ctx.translate(H[0],H[1]);ctx.rotate(ha);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(-30,-110);ctx.lineTo(-10,-120);ctx.lineTo(20,-10);ctx.closePath();paint(C['brass-fill'],C.ink);ctx.restore();pivot(H[0],H[1],6);
    bar(H[0],H[1],O[0]+30,O[1]+40-20*g.cock,6,C.part2);label(g.fire?'FIRED':g.cock>0.98?'COCKED':'COCKING · the hand turns the cylinder',400,470,'center');},
  reads(){return[['Hammer',`${(this.g.cock*100).toFixed(0)} % back`],['Each cock','one chamber (1/6 turn)']];}});

reg({num:278,outLabel:'Cage drop, mm',
  update(phi){const u=cyc(phi,TAU*2);const broke=u>0.5;const y=broke?Math.min(40,(u-0.5)*400):60*Math.sin(u*TAU*2);this.g={phi,broke,y};},output(){return this.g.y;},
  draw(){const g=this.g,X=400,Y=220+g.y;for(const s of [-1,1]){ctx.beginPath();ctx.rect(X+s*150-10,40,20,440);paint(C.part2,C.ink);for(let y=50;y<470;y+=18){poly([[X+s*140,y],[X+s*140,y+18],[X+s*130,y+18]]);ctx.closePath();paint(C.part2,C.ink,.8);}}
    ctx.beginPath();ctx.rect(X-110,Y,220,140);paint(C['steel-fill'],C.ink);if(!g.broke)rope([[X,40],[X,Y]]);else{rope([[X,40],[X,90]]);rope([[X,Y-50],[X,Y]]);}
    for(const s of [-1,1]){const out=g.broke?1:0;const a=s*(PI/2-0.5*out);bar(X+s*60,Y+10,X+s*(60+70*Math.cos(0.5*(1-out))),Y+10-30*out,8,C['brass-fill']);pivot(X+s*60,Y+10,4);}
    springZ(X-60,Y+10,X+60,Y+10,12,5);label(g.broke?'ROPE BROKEN · pawls fly out and catch':'ROPE TIGHT · pawls held in',400,500,'center');},
  reads(){return[['Rope',this.g.broke?'broken':'whole'],['Pawls',this.g.broke?'locked in the ratchet':'clear']];}});

reg({num:280,outLabel:'Drum turns',concept:true,
  reset(){this.w=0;this.last=null;},
  update(phi){const a=0.4*Math.sin(phi);if(this.last===null)this.last=a;const d=a-this.last;this.last=a;this.w+=Math.max(0,d);this.g={phi,a,grip:d>0};},output(){return this.w/TAU;},
  draw(){const g=this.g,O=[360,280];circ(O[0],O[1],130);paint(C['steel-fill'],C.ink);circ(O[0],O[1],60);paint(C.part,C.ink);bar(O[0],O[1],O[0]+120*Math.cos(this.w),O[1]+120*Math.sin(this.w),8,C.part2);pivot(O[0],O[1],6);
    const la=-PI/2+g.a,E=[O[0]+330*Math.cos(la),O[1]+330*Math.sin(la)];bar(O[0],O[1],E[0],E[1],14,C['brass-fill']);const G=[O[0]+138*Math.cos(la+0.15),O[1]+138*Math.sin(la+0.15)];circ(G[0],G[1],12);paint(g.grip?C.hi:C.part,C.ink);
    rope([[O[0]-60,O[1]],[O[0]-60,500]]);label(g.grip?'GRIPPING · drum turns':'SLIPPING BACK',O[0]+160,O[1]+150);},
  reads(){return[['Lever',this.g.grip?'gripping':'returning'],['Drum',`${(this.w/TAU).toFixed(2)} turns`]];}});

/* ---- heart-cam roller motion (wool comb) ---- */
function woolComb(num){return reg({num,outLabel:'Roller angle, degrees',concept:true,
  f(u){if(u<0.25)return -smooth(u/0.25)/3;if(u<0.75)return -1/3+smooth((u-0.25)/0.5);return 2/3;},
  update(phi){const k=Math.floor(phi/TAU),u=mod(phi,TAU)/TAU;this.g={phi,r:(k/3+this.f(u)/1)*TAU/3};},output(){return this.g.r*180/PI;},
  draw(){const g=this.g,H=[280,280];const pts=[];for(let i=0;i<120;i++){const t=i/120*TAU,r=60+50*Math.abs(Math.sin(t/2));pts.push([H[0]+r*Math.cos(t+g.phi),H[1]+r*Math.sin(t+g.phi)]);}poly(pts);ctx.closePath();paint(C['brass-fill'],C.ink);pivot(H[0],H[1],6);
    const R=[540,280];circ(R[0],R[1],90);paint(C['steel-fill'],C.ink);for(let i=0;i<3;i++){const t=g.r+i*TAU/3;ctx.save();ctx.translate(R[0],R[1]);ctx.rotate(t);ctx.beginPath();ctx.rect(70,-8,22,16);ctx.fillStyle=C.sheet;ctx.fill();ctx.restore();}pivot(R[0],R[1],6);
    label('HEART CAM',H[0],H[1]+140,'center');label('NOTCHED ROLLER',R[0],R[1]+130,'center');label('back ⅓ · forward ⅔ · pause',400,480,'center');},
  reads(){return[['Cycle','back, forward, pause'],['Roller',`${(this.g.r*180/PI).toFixed(0)}°`]];}});}
woolComb(217);woolComb(218);

reg({num:74,outLabel:'Output shaft, turns',concept:true,
  update(phi){const u=mod(phi,TAU)/TAU,k=Math.floor(phi/TAU);const f=u<0.5?u*2:2-u*2;this.g={phi,o:(f)*TAU*0.5,fwd:u<0.5};},output(){return this.g.o/TAU;},
  draw(){const g=this.g,O=[400,200];ctx.beginPath();ctx.ellipse(O[0],O[1],150,40,0,0,TAU);paint(C['brass-fill'],C.ink);ctx.save();ctx.strokeStyle=C.ink;for(let k=0;k<20;k++){const t=g.phi+k*TAU/40;if(Math.sin(t)>0){ctx.beginPath();ctx.moveTo(O[0]+150*Math.cos(t),O[1]+40*Math.sin(t));ctx.lineTo(O[0]+130*Math.cos(t),O[1]+34*Math.sin(t)+6);ctx.stroke();}}ctx.restore();
    bar(O[0],O[1]-140,O[0],O[1],12,C.part);for(const s of [-1,1]){const x=O[0]+s*150,act=(s>0)===g.fwd;poly([[x-30,O[1]+40],[x+30,O[1]+40],[x+20,O[1]+90],[x-20,O[1]+90]]);ctx.closePath();paint(act?C['steel-fill']:C.part,C.ink);}
    stripeShaft(O[0]-260,O[0]+260,O[1]+110,10,g.o,C.part2);label(g.fwd?'TEETH ON RIGHT GEAR · forward':'TEETH ON LEFT GEAR · back',400,420,'center');},
  reads(){return[['Output',this.g.fwd?'forward':'reverse']];}});

reg({num:397,outLabel:'Shuttle position, mm',concept:true,
  update(phi){const u=mod(phi,TAU)/TAU;let x;if(u<0.3)x=smooth(u/0.3);else if(u<0.5)x=1;else if(u<0.8)x=1-smooth((u-0.5)/0.3);else x=0;this.g={phi,x:x*300};},output(){return this.g.x;},
  draw(){const g=this.g,O=[200,330];circ(O[0],O[1],90);paint(C['brass-fill'],C.ink);bar(O[0],O[1],O[0]+70*Math.cos(g.phi),O[1]+70*Math.sin(g.phi),10,C.part2);pivot(O[0],O[1],6);
    ctx.beginPath();ctx.rect(300,170,440,12);ctx.rect(300,230,440,12);paint(C.part2,C.ink);ctx.beginPath();ctx.moveTo(330+g.x,206);ctx.quadraticCurveTo(360+g.x,186,400+g.x,206);ctx.quadraticCurveTo(360+g.x,226,330+g.x,206);paint(C['steel-fill'],C.ink);
    bar(O[0]+70*Math.cos(g.phi),O[1]+70*Math.sin(g.phi),365+g.x,226,6,C.part);label('PAUSE AT EACH END',520,280,'center');},
  reads(){return[['Shuttle',`${this.g.x.toFixed(0)} mm`]];}});

/* ---- escapements ---- */
function escWheel(E,R,N,W,style){if(style==='pins'){circ(E[0],E[1],R);paint(C['steel-fill'],C.ink);for(let i=0;i<N;i++){const a=W+i*TAU/N;circ(E[0]+(R-10)*Math.cos(a),E[1]+(R-10)*Math.sin(a),4);paint(C.hi,C.ink,1);}}
  else if(style==='three'){circ(E[0],E[1],R*0.35);paint(C['steel-fill'],C.ink);for(let i=0;i<3;i++){const a=W+i*TAU/3;bar(E[0],E[1],E[0]+R*Math.cos(a),E[1]+R*Math.sin(a),12,C['steel-fill']);}}
  else if(style==='lantern'){circ(E[0],E[1],R+8);paint(C.part,C.ink);for(let i=0;i<N;i++){const a=W+i*TAU/N;circ(E[0]+R*Math.cos(a),E[1]+R*Math.sin(a),5);paint(C['steel-fill'],C.ink);}}
  else if(style==='cyl'){const pts=[];circ(E[0],E[1],R*0.6);paint(C['steel-fill'],C.ink);for(let i=0;i<N;i++){const a=W+i*TAU/N;bar(E[0]+R*0.6*Math.cos(a),E[1]+R*0.6*Math.sin(a),E[0]+R*0.85*Math.cos(a),E[1]+R*0.85*Math.sin(a),4,C['steel-fill']);poly([[E[0]+R*0.85*Math.cos(a),E[1]+R*0.85*Math.sin(a)],[E[0]+R*Math.cos(a+0.12),E[1]+R*Math.sin(a+0.12)],[E[0]+R*0.85*Math.cos(a+0.2),E[1]+R*0.85*Math.sin(a+0.2)]]);ctx.closePath();paint(C['steel-fill'],C.ink);}}
  else{const pts=[];const ri=R*0.8;for(let i=0;i<N;i++){const a=W+i*TAU/N;pts.push([E[0]+ri*Math.cos(a),E[1]+ri*Math.sin(a)]);pts.push([E[0]+R*Math.cos(a+(style==='club'?0.05:0.12)),E[1]+R*Math.sin(a+(style==='club'?0.05:0.12))]);if(style==='club')pts.push([E[0]+R*Math.cos(a+0.14),E[1]+R*Math.sin(a+0.14)]);pts.push([E[0]+ri*0.98*Math.cos(a+TAU/N*0.8),E[1]+ri*0.98*Math.sin(a+TAU/N*0.8)]);}poly(pts);ctx.closePath();circ(E[0],E[1],8,false);for(let k=0;k<4;k++){const a=W+k*PI/2;circ(E[0]+R*0.42*Math.cos(a),E[1]+R*0.42*Math.sin(a),R*0.16,false);}paint(C['steel-fill'],C.ink);}
  pivot(E[0],E[1],5);}
function balanceW(B,r,th){circ(B[0],B[1],r);circ(B[0],B[1],r-8,false);paint(C['brass-fill'],C.ink);for(let k=0;k<3;k++){const a=th+k*TAU/3;bar(B[0],B[1],B[0]+(r-6)*Math.cos(a),B[1]+(r-6)*Math.sin(a),5,C['brass-fill']);}
  ctx.save();ctx.strokeStyle=C.muted;ctx.lineWidth=1;ctx.beginPath();for(let i=0;i<=200;i++){const t=i/200*TAU*4,rr=6+i/200*(r-20);const x=B[0]+rr*Math.cos(t+th*(1-i/200)),y=B[1]+rr*Math.sin(t+th*(1-i/200));i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();ctx.restore();pivot(B[0],B[1],4);}
function esc(num,o){return reg({num,outLabel:o.osc==='bal'?'Balance angle, degrees':'Pendulum angle, degrees',concept:o.concept!==false,
  update(phi){const amp=o.amp||(o.osc==='bal'?2.2:0.12);const th=amp*Math.sin(phi);let W;
    if(o.once){const u=phi/TAU+0.75,k=Math.floor(u),f=u-k,s=smooth((f-0.45)/0.12);W=-(k+s)*TAU/o.N;}
    else{const u=phi/PI+0.5,k=Math.floor(u),f=u-k,s=smooth((f-0.42)/0.14);W=-(k+s)*(TAU/o.N)/2;}
    this.g={phi,th,W};},
  output(){return this.g.th*180/PI;},
  draw(){const g=this.g,bal=o.osc==='bal',E=o.E||(bal?[400,370]:[400,300]),R=o.R||(bal?85:95),N=o.N,P=o.P||[E[0],E[1]-R-70],beta=bal?clamp(g.th*0.1,-0.14,0.14):g.th;
    if(!bal){ctx.save();ctx.translate(P[0],P[1]);ctx.rotate(g.th);bar(0,0,0,440-P[1],6,C.part);circ(0,440-P[1],22);paint(C['brass-fill'],C.ink);ctx.restore();ground(P[0],P[1]-12,60,true);}
    if(o.wheel==='duplex'){escWheel(E,R,N,g.W,'saw');escWheel(E,R*0.55,N,g.W+0.1,'pins');}
    else if(o.wheel==='crown'){ctx.beginPath();ctx.rect(E[0]-R,E[1]-14,2*R,28);paint(C['steel-fill'],C.ink);for(let i=0;i<N;i++){const a=g.W*2+i*TAU/N;if(Math.sin(a)>-0.2){const x=E[0]+R*Math.cos(a);poly([[x-6,E[1]-14],[x+6,E[1]-14],[x,E[1]-30]]);ctx.closePath();paint(C['steel-fill'],C.ink);}}}
    else escWheel(E,R,N,g.W,o.wheel||'saw');
    const sp=o.spread||0.78,rot=(p,a)=>[P[0]+(p[0]-P[0])*Math.cos(a)-(p[1]-P[1])*Math.sin(a),P[1]+(p[0]-P[0])*Math.sin(a)+(p[1]-P[1])*Math.cos(a)];
    const tip=s=>{const a=-PI/2+s*sp,rr=o.wheel==='crown'?R*0.7:R+3;return o.wheel==='crown'?[E[0]+s*30,E[1]-34]:[E[0]+rr*Math.cos(a),E[1]+rr*Math.sin(a)];};
    if(o.pallet==='gravity'){for(const s of [-1,1]){const lift=Math.max(0,s*g.th)*1.5,H=[P[0]+s*10,P[1]],T=tip(s),T2=rot(T,s*lift*0.6);bar(H[0],H[1],T2[0],T2[1],7,C.part2);ctx.beginPath();ctx.rect(T2[0]-s*2-6,T2[1]-6,12,12);paint(C['brass-fill'],C.ink);pivot(H[0],H[1],4);}label('GRAVITY ARMS',P[0]+70,P[1]+30);}
    else if(o.pallet==='pin'){const T=rot([E[0],E[1]-R+6],beta);bar(P[0],P[1],T[0],T[1],5,C['brass-fill']);circ(T[0],T[1],6);paint(C.hi,C.ink);}
    else if(o.pallet==='cyl'){const B=[E[0],E[1]-R-6];ctx.save();ctx.translate(B[0],B[1]);ctx.rotate(g.th);ctx.lineWidth=6;ctx.strokeStyle=C.ink;ctx.beginPath();ctx.arc(0,0,14,0,PI);ctx.stroke();ctx.restore();bar(B[0],B[1],B[0],(o.B||[0,120])[1],4,C.part);}
    else{for(const s of [-1,1]){const T=rot(tip(s),beta),Ti=rot([tip(s)[0]+(E[0]-tip(s)[0])*0.12,tip(s)[1]+(E[1]-tip(s)[1])*0.12],beta);bar(P[0],P[1],T[0],T[1],12,C['brass-fill']);bar(T[0],T[1],Ti[0],Ti[1],8,o.pallet==='deadbeat'?C.hi:C['brass-fill']);}
      if(bal){const F=rot([P[0],P[1]-70],beta);bar(P[0],P[1],F[0],F[1],8,C['brass-fill']);for(const s of [-1,1]){const f=rot([P[0]+s*9,P[1]-80],beta);bar(F[0],F[1],f[0],f[1],5,C['brass-fill']);}}}
    pivot(P[0],P[1],6);
    if(bal){const B=o.B||[P[0],P[1]-150];balanceW(B,o.br||62,g.th);const rp=[B[0]+18*Math.sin(-g.th),B[1]+18*Math.cos(g.th)];circ(rp[0],rp[1],4);paint(C.steel,C.ink);label('BALANCE',B[0]+80,B[1]);}
    if(o.detent){const Dp=[E[0]+R+70,E[1]-R+10];const lift=Math.abs(Math.cos(g.phi))<0.12?10:0;bar(Dp[0],Dp[1],E[0]+R*0.62,E[1]-R*0.78-lift,6,C.part);pivot(Dp[0],Dp[1],4);springZ(Dp[0],Dp[1]+10,Dp[0]+40,Dp[1]+60,6,4);label('DETENT',Dp[0]+12,Dp[1]-14);}
    label('ESCAPE WHEEL',E[0]+R+20,E[1]+R*0.6);label(o.label,400,505,'center');},
  reads(){const g=this.g;return[[o.osc==='bal'?'Balance':'Pendulum',`${(g.th*180/PI).toFixed(o.osc==='bal'?0:1)}°`],['Per beat',o.once?'one tooth every full swing':'half a tooth each swing'],['Escape wheel',`${mod(-g.W*180/PI,360).toFixed(0)}°`]];}});}
esc(289,{N:30,pallet:'deadbeat',label:'DEAD-BEAT · the wheel never recoils'});
esc(290,{N:30,label:'PENDULUM ESCAPEMENT'});
esc(291,{N:15,osc:'bal',once:true,detent:true,R:90,E:[400,370],B:[400,130],label:'DETENT ESCAPEMENT · one impulse every swing'});
esc(292,{N:30,wheel:'pins',pallet:'deadbeat',label:'PIN DEAD-BEAT'});
esc(293,{N:15,wheel:'crown',osc:'bal',E:[400,380],P:[400,300],B:[400,150],label:'CROWN-SPUR WATCH ESCAPEMENT'});
esc(294,{N:15,wheel:'cyl',osc:'bal',pallet:'cyl',E:[400,340],B:[400,120],label:'CYLINDER ESCAPEMENT · teeth pass through the half-cylinder'});
esc(295,{N:15,wheel:'cyl',osc:'bal',pallet:'cyl',E:[400,340],B:[400,120],label:'CYLINDER ESCAPEMENT, SECOND VIEW'});
esc(296,{N:15,wheel:'club',osc:'bal',E:[400,380],B:[400,120],R:90,label:'LEVER ESCAPEMENT · fork and roller pin'});
esc(297,{N:10,wheel:'lantern',label:'LANTERN WHEEL ESCAPEMENT'});
alias(298,234,{concept:true});alias(299,234,{concept:true});
esc(300,{N:15,wheel:'duplex',osc:'bal',E:[400,360],B:[400,130],label:'DUPLEX · long teeth lock, short pins give impulse'});
esc(301,{N:15,wheel:'duplex',osc:'bal',E:[400,360],B:[400,130],label:'DUPLEX, SIDE VIEW'});
esc(302,{N:15,osc:'bal',E:[400,370],B:[400,130],label:'BALANCE AND PALLETS'});
esc(303,{N:30,pallet:'deadbeat',spread:0.45,label:'PALLET FACES CENTRED ON THE PIVOT'});
esc(304,{N:30,wheel:'pins',label:'PIN-WHEEL ESCAPEMENT'});
esc(305,{N:12,wheel:'pins',pallet:'pin',label:'SINGLE PIN ON THE PENDULUM'});
esc(306,{N:3,wheel:'three',R:90,label:'THREE TEETH, UPPER AND LOWER PALLETS'});
esc(307,{N:3,wheel:'three',R:110,label:'LONG STOPPING TEETH'});
esc(308,{N:15,once:true,detent:true,label:'DETACHED · pendulum free for most of its swing'});
esc(309,{N:15,pallet:'gravity',label:'GRAVITY · weighted arms give the impulse'});
esc(310,{N:3,wheel:'three',pallet:'gravity',R:90,label:'THREE-LEGGED GRAVITY ESCAPEMENT'});
esc(311,{N:6,wheel:'three',pallet:'gravity',R:90,label:'DOUBLE THREE-LEGGED GRAVITY'});
esc(312,{N:10,R:60,E:[400,340],pallet:'gravity',label:'SMALL LIFTING WHEEL'});
esc(313,{N:15,osc:'bal',once:true,detent:true,R:90,E:[400,370],B:[400,130],label:'CHRONOMETER (DETENT) ESCAPEMENT'});
esc(314,{N:15,wheel:'club',osc:'bal',once:true,E:[400,380],B:[400,120],R:90,label:'LEVER CHRONOMETER'});
esc(396,{N:15,wheel:'club',osc:'bal',once:true,detent:true,E:[400,380],B:[400,120],R:90,label:"REED'S ESCAPEMENT · lever and detent combined"});
esc(238,{N:20,label:'PALLETS RELEASE ONE TOOTH AT A TIME',concept:false});
reg({num:402,outLabel:'Balance angle, degrees',concept:true,
  update(phi){const th=2*Math.sin(phi);const u=phi/PI+0.5,k=Math.floor(u),s=smooth((u-k-0.42)/0.14);this.g={phi,th,W:-(k+s)*(TAU/15)/2};},output(){return this.g.th*180/PI;},
  draw(){const g=this.g;escWheel([400,370],80,15,g.W,'club');balanceW([250,170],70,g.th);balanceW([550,170],70,-g.th);drawGear(325,170,8,8,0,C.part);ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(320,170);ctx.lineTo(480,170);ctx.stroke();ctx.restore();
    label('TWO BALANCES TURN OPPOSITE WAYS · a jolt cannot disturb both',400,500,'center');},
  reads(){return[['Left balance',`${(this.g.th*180/PI).toFixed(0)}°`],['Right balance',`${(-this.g.th*180/PI).toFixed(0)}°`]];}});

/* ---- pendulum compensation & regulation ---- */
function compPend(num,o){return reg({num,outLabel:'Rate error, s/day',params:[{id:'t',label:'Temperature',min:-10,max:40,step:1,value:30,fmt:v=>v+' °C'},{id:'c',type:'toggle',label:'Compensation',options:[[1,'On'],[0,'Off']],value:1}],
  update(phi){const dT=this.P.t-15;const grow=dT*0.9,comp=this.P.c?grow:0;const Leff=1+(grow-comp)*1e-5;this.g={phi,th:0.15*Math.sin(phi),grow,comp,err:-43200*(Leff-1)};},output(){return this.g.err;},
  draw(){const g=this.g,A=[400,60],L=330+g.grow;ctx.save();ctx.translate(A[0],A[1]);ctx.rotate(g.th);bar(0,0,0,L,6,C.part);
    if(o.kind==='mercury'){ctx.beginPath();ctx.rect(-30,L-40,60,110);paint(C.part2,C.ink);ctx.fillStyle=C['steel-fill'];const h=70+(this.P.c?g.grow*1.0:0);ctx.fillRect(-26,L+66-h,52,h);label('MERCURY',40,L+20);}
    else if(o.kind==='bars'){for(const s of [-1,1]){bar(s*20,L-160,s*20,L-g.comp,6,s>0?C['brass-fill']:C.part);}bar(-30,L-g.comp,30,L-g.comp,8,C.part2);circ(0,L,26);paint(C['brass-fill'],C.ink);}
    ctx.restore();pivot(A[0],A[1],6);ground(A[0],A[1]-10,60,true);if(o.kind==='bars')label('BRASS RODS LIFT THE BOB AS THE IRON STRETCHES',460,300);label('Rod growth is exaggerated for clarity',400,505,'center');},
  reads(){const g=this.g;return[['Rod growth',`${(g.grow*0.02).toFixed(2)} mm`],['Compensation',this.P.c?'cancels it':'off'],['Clock error',`${g.err.toFixed(1)} s/day`]];}});}
compPend(316,{kind:'mercury'});compPend(317,{kind:'bars'});

reg({num:318,outLabel:'Rate change, s/day',params:[{id:'p',label:'Regulator lever',min:-1,max:1,step:0.05,value:0.3,fmt:v=>v>0?`fast ${v}`:v<0?`slow ${-v}`:'centre'}],
  update(phi){this.g={phi,th:2*Math.sin(phi*(1+this.P.p*0.08))};},output(){return this.P.p*120;},
  draw(){const g=this.g,B=[360,270];balanceW(B,110,g.th);const t=-PI/2+this.P.p*0.6;const Rr=[B[0]+90*Math.cos(t),B[1]+90*Math.sin(t)];bar(B[0],B[1],B[0]+200*Math.cos(t),B[1]+200*Math.sin(t),8,C['steel-fill']);circ(Rr[0],Rr[1],6);paint(C.part2,C.ink);
    ctx.save();ctx.strokeStyle=C.rule;ctx.beginPath();ctx.arc(B[0],B[1],200,-PI/2-0.7,-PI/2+0.7);ctx.stroke();ctx.restore();label('S',B[0]+200*Math.cos(-PI/2-0.65)-14,B[1]+200*Math.sin(-PI/2-0.65));label('F',B[0]+200*Math.cos(-PI/2+0.65)+6,B[1]+200*Math.sin(-PI/2+0.65));
    label('CURB PINS SHORTEN OR LENGTHEN THE ACTIVE SPRING',400,490,'center');},
  reads(){return[['Lever',this.P.p.toFixed(2)],['Rate change',`${(this.P.p*120).toFixed(0)} s/day`]];}});

reg({num:319,outLabel:'Rim weight shift, mm',params:[{id:'t',label:'Temperature',min:-10,max:40,step:1,value:30,fmt:v=>v+' °C'}],
  update(phi){const k=(this.P.t-15)*0.8;this.g={phi,th:2*Math.sin(phi),k};},output(){return -this.g.k*0.05;},
  draw(){const g=this.g,B=[400,270],r=130;bar(B[0]+r*Math.cos(g.th),B[1]+r*Math.sin(g.th),B[0]-r*Math.cos(g.th),B[1]-r*Math.sin(g.th),10,C.part);
    for(const s of [0,PI]){const a0=g.th+s;ctx.save();ctx.lineWidth=10;ctx.strokeStyle=C['brass-fill'];ctx.beginPath();const curl=g.k*0.004;ctx.arc(B[0],B[1],r-curl*200,a0+0.05,a0+PI-0.25);ctx.stroke();ctx.lineWidth=4;ctx.strokeStyle=C.steel;ctx.beginPath();ctx.arc(B[0],B[1],r-6-curl*200,a0+0.05,a0+PI-0.25);ctx.stroke();ctx.restore();
      const wa=a0+PI-0.6;circ(B[0]+(r-g.k*0.6)*Math.cos(wa),B[1]+(r-g.k*0.6)*Math.sin(wa),9);paint(C.part2,C.ink);}
    pivot(B[0],B[1],6);label('HEAT CURLS THE BRASS-STEEL RIM INWARD, CARRYING WEIGHTS IN',400,480,'center');label('(movement exaggerated)',400,500,'center');},
  reads(){return[['Temperature',`${this.P.t} °C`],['Weights move',`${(this.g.k*0.05).toFixed(2)} mm ${this.g.k>0?'in':'out'}`],['Effect','offsets the weaker spring']];}});

function maintain(num,o){return reg({num,outLabel:'Going wheel, turns',concept:true,
  update(phi){const wind=mod(phi,TAU*2)<TAU*0.6;this.g={phi,wind,go:phi*0.3};},output(){return this.g.go/TAU;},
  draw(){const g=this.g;if(o.kind==='chain'){const A=[300,140],B=[500,140];pulley(A[0],A[1],50,g.go,C['steel-fill']);pulley(B[0],B[1],50,g.wind?g.phi:0,C['brass-fill']);const yW=320-((g.phi*20)%120)*0,yL=360;
      rope([[A[0]-50,A[1]],[A[0]-50,330]]);pulley(A[0]+50-0,330,26,-g.go,C.part);rope([[A[0]+50,A[1]],[A[0]+50+0,304]]);rope([[B[0]-50,B[1]],[A[0]+76,330]]);rope([[B[0]+50,B[1]],[B[0]+50,380]]);pulley(B[0]+24,400,26,g.go,C.part);rope([[B[0]-2,400],[A[0]-50,330]]);
      weight(A[0]+50,356,60,70,'WEIGHT');weight(B[0]+24,426,40,40,'');label('ENDLESS CHAIN: pull the right side to wind, the clock keeps going',400,500,'center');}
    else{const O=[400,270];drawGear(O[0],O[1],110,44,g.go,C['steel-fill'],{bore:6});sawWheel(O[0],O[1],g.wind?g.go-0.3:g.go,24,60,74,C['brass-fill']);paint(C['brass-fill'],C.ink);springZ(O[0]-40,O[1],O[0]+40,O[1]+30,8,5);pivot(O[0],O[1],6);label(g.wind?'WINDING · the spring keeps driving the train':'GOING · main weight drives',400,480,'center');}},
  reads(){return[['State',this.g.wind?'being wound':'going'],['Clock','never stops']];}});}
maintain(320,{kind:'chain'});maintain(321,{kind:'harrison'});

/* ================= batch 3 · part 3: linkages, cranks, cams, screws ================= */
const FILL=k=>({b:C['brass-fill'],s:C['steel-fill'],p:C.part,q:C.part2,h:C.hi}[k]||k);
function solveLink(o,phi){const P=Object.assign({},o.fix);const k=o.speed||1;
  for(const st of o.steps){const [id,t]=st;let v;
    if(t==='crank'){const c=P[st[2]];v=[c[0]+st[3]*Math.cos(phi*k+(st[4]||0)),c[1]+st[3]*Math.sin(phi*k+(st[4]||0))];}
    else if(t==='rock'){const c=P[st[2]],a=st[4]+st[5]*Math.sin(phi*k+(st[6]||0));v=[c[0]+st[3]*Math.cos(a),c[1]+st[3]*Math.sin(a)];}
    else if(t==='cc'){v=cc(P[st[2]],st[3],P[st[4]],st[5],st[6]);}
    else if(t==='on'){const a=P[st[2]],b=P[st[3]],dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy)||1;v=[a[0]+dx*st[4]-dy/L*(st[5]||0),a[1]+dy*st[4]+dx/L*(st[5]||0)];}
    else if(t==='dir'){const a=P[st[2]],b=P[st[3]],L=Math.hypot(b[0]-a[0],b[1]-a[1])||1;v=[a[0]+(b[0]-a[0])/L*st[4],a[1]+(b[1]-a[1])/L*st[4]];}
    else if(t==='sx'){const b=P[st[2]],dy=st[4]-b[1];v=[b[0]+(st[5]||1)*Math.sqrt(Math.max(0,st[3]*st[3]-dy*dy)),st[4]];}
    else if(t==='sy'){const b=P[st[2]],dx=st[4]-b[0];v=[st[4],b[1]+(st[5]||1)*Math.sqrt(Math.max(0,st[3]*st[3]-dx*dx))];}
    else if(t==='add'){const a=P[st[2]],b=P[st[3]],c=P[st[4]];v=[a[0]+b[0]-c[0],a[1]+b[1]-c[1]];}
    else if(t==='fn'){v=st[2](P,phi);}
    P[id]=v;}
  return P;}
function link(num,o){return reg({num,lo:o,outLabel:o.outLabel||'Output',concept:!!o.concept,params:o.params||[],
  reset(){this.trail=[];},
  update(phi){const oo=o.dyn?o.dyn.call(this,o):o;const P=solveLink(oo,phi);this.g={phi,P};if(o.trace){this.trail=this.trail||[];this.trail.push(P[o.trace]);if(this.trail.length>(o.tlen||320))this.trail.shift();}},
  output(){return o.out(this.g.P,this.g.phi);},
  draw(){const g=this.g,P=g.P;if(o.pre)o.pre.call(this,P,g.phi);
    if(o.wheel){const [c,r]=o.wheel;flywheel(P[c][0],P[c][1],r,g.phi*(o.speed||1));}
    for(const gd of (o.guides||[])){ctx.beginPath();ctx.rect(gd[0],gd[1],gd[2],gd[3]);paint(C.part2,C.ink);}
    if(o.trace&&this.trail.length>1){ctx.save();ctx.strokeStyle=C.steel;ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(...this.trail[0]);for(const p of this.trail)ctx.lineTo(...p);ctx.stroke();ctx.restore();}
    for(const s of (o.slots||[])){const a=P[s[0]],b=P[s[1]],L=s[2],dx=b[0]-a[0],dy=b[1]-a[1],d=Math.hypot(dx,dy)||1,e=[a[0]+dx/d*L,a[1]+dy/d*L];ctx.beginPath();capsule(a[0],a[1],e[0],e[1],13);capsule(a[0]+dx/d*(s[3]||30),a[1]+dy/d*(s[3]||30),e[0]-dx/d*10,e[1]-dy/d*10,6);paint(FILL(s[4]||'b'),C.ink);}
    for(const b of (o.bars||[])){const p=P[b[0]],q=P[b[1]];bar(p[0],p[1],q[0],q[1],b[2]||10,FILL(b[3]||'p'));}
    for(const bl of (o.blocks||[])){const p=P[bl[0]];ctx.beginPath();ctx.rect(p[0]-bl[1]/2,p[1]-bl[2]/2,bl[1],bl[2]);paint(FILL(bl[3]||'s'),C.ink);}
    if(o.post)o.post.call(this,P,g.phi);
    for(const id in o.fix){if((o.nopiv||[]).includes(id))continue;const p=P[id];pivot(p[0],p[1],6);if(!(o.noground||[]).includes(id))ground(p[0],p[1]+12,36);}
    for(const id of (o.joints||[])){const p=P[id];pivot(p[0],p[1],4.5);}
    if(o.trace){const p=P[o.trace];circ(p[0],p[1],6);paint(C.steel,C.ink);}
    for(const l of (o.labels||[]))label(l[0],l[1],l[2],l[3]||'left');},
  reads(v){return o.reads?o.reads(this.g.P,this.g.phi,v):[['Output',o.out(this.g.P,this.g.phi).toFixed(1)]];}});}

/* ---- parallel motions ---- */
function wattFull(num,o){const F=o.F||[560,170],Lb=o.Lb||300,R=o.R||[260,300],up=o.up||1;
  return link(num,{concept:!!o.concept,outLabel:'Piston-rod sideways error, mm',fix:{F,R},trace:'P',
    steps:[['E','rock','F',Lb,PI,0.26],['B','dir','F','E',Lb/2],['D','fn',(P)=>{const B=P.B;return cc(P.R,o.Lr||150,B,o.Ll||110,o.s||-1);}],['P','add','E','D','B']],
    bars:[['F','E',18,'b'],['R','D',10,'q'],['B','D',8,'p'],['E','P',8,'p'],['D','P',10,'q']],joints:['B','D','E','P'],
    pre(P){if(o.cyl){ctx.beginPath();ctx.rect(P.P[0]-60,o.cyl,120,200);paint(C.part2,C.ink);bar(P.P[0],P.P[1],P.P[0],o.cyl+40,8,C.part);}if(o.pump){bar(2*P.F[0]-P.E[0],2*P.F[1]-P.E[1],2*P.F[0]-P.E[0],480,8,C.part);}},
    post(P){if(o.pump)pivot(2*P.F[0]-P.E[0],2*P.F[1]-P.E[1],4);},
    out:(P)=>P.P[0]-(F[0]-Lb),labels:[[o.label,400,500,'center'],['BEAM',F[0]+20,F[1]-30],['RADIUS BAR',R[0]-20,R[1]+40,'right']],
    reads:(P)=>[['Rod point drift',`${(P.P[0]-(F[0]-Lb)).toFixed(2)} mm`],['Beam',`${(Math.atan2(P.E[1]-F[1],P.E[0]-F[0])*180/PI-180).toFixed(1)}°`]]});}
wattFull(332,{label:'RADIUS BAR, CROSS-HEAD AND PARALLEL BAR',cyl:330});
wattFull(333,{label:'COMBINED PARALLEL MOTION',cyl:330,concept:true,R:[250,240],Lr:130});
wattFull(336,{label:'PARALLEL MOTION FOR SIDE-LEVER MARINE ENGINES',cyl:330,concept:true,F:[540,200],R:[250,320]});
wattFull(338,{label:'RADIUS BAR ABOVE THE BEAM',cyl:330,concept:true,R:[250,120],s:1});
wattFull(340,{label:'BEAM ON A ROCKING PILLAR',cyl:330,concept:true,F:[560,190]});
wattFull(343,{label:'TWO RADIUS RODS · UPRIGHT ENGINE',cyl:330,concept:true,F:[580,170],R:[240,250]});

function scottRussell(num,o){const A=o.A||[400,300],r=o.r||110;
  return link(num,{concept:!!o.concept,outLabel:'Rod end sideways error, mm',fix:{A},trace:'T',
    steps:[['M','rock','A',r,-PI/2+0.0,o.amp||0.75],['S','fn',(P)=>o.radius?cc(o.radius,o.rl,P.M,r,1):[2*P.M[0]-A[0]+0*0,A[1]].map((v,i)=>i?A[1]:A[0]+2*(P.M[0]-A[0]))],['T','add','M','M','S']],
    bars:[['A','M',12,'b'],['S','T',12,'p']],blocks:o.radius?[]:[['S',44,24,'s']],guides:o.radius?[]:[[120,A[1]+12,560,8]],joints:['M','S'],
    pre(P){if(o.radius){const R=o.radius;bar(R[0],R[1],P.S[0],P.S[1],10,C.part2);pivot(R[0],R[1],6);ground(R[0],R[1]+12,36);}ctx.save();ctx.strokeStyle=C.rule;ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(A[0],40);ctx.lineTo(A[0],A[1]);ctx.stroke();ctx.restore();},
    out:(P)=>P.T[0]-A[0],labels:[[o.label,400,500,'center']],
    reads:(P)=>[['Sideways error',`${(P.T[0]-A[0]).toFixed(2)} mm`],['Height',`${(A[1]-P.T[1]).toFixed(0)} mm`]]});}
scottRussell(339,{label:'ONE END SLIDES IN A GUIDE · THE OTHER END RUNS STRAIGHT'});
scottRussell(337,{label:'SHORT SWINGING ROD REPLACES THE SLIDE',radius:[400,500],rl:190,amp:0.45,concept:true,A:[400,310]});

/* ---- generic crank, slider and yoke drives ---- */
function crankSlide(num,o){return reg({num,_kind:o.kind||'',outLabel:'Slide position, mm',concept:!!o.concept,params:o.params||[],O:[200,280],
  update(phi){const r=this.P.r||o.r||70,L=o.L||220,O=this.O,pin=[O[0]+r*Math.cos(phi),O[1]+r*Math.sin(phi)];let x;
    if(o.kind==='yoke'||o.kind==='slotx')x=pin[0]+L*0.5;else x=pin[0]+Math.sqrt(L*L-(pin[1]-O[1])**2);this.g={phi,pin,x,r,L};},
  output(){return this.g.x-this.O[0];},
  draw(){const g=this.g,O=this.O,y=O[1];flywheel(O[0],O[1],110,g.phi);bar(O[0],O[1],g.pin[0],g.pin[1],20,C['brass-fill']);
    if(o.kind==='yoke'||o.kind==='slotx'){const X=g.x-g.L*0.5;ctx.beginPath();ctx.rect(X-16,y-g.r-30,32,2*g.r+60);ctx.rect(X-7,y-g.r-12,14,2*g.r+24);paint(C['steel-fill'],C.ink);bar(X+16,y,X+330,y,14,C.part);if(o.kind==='slotx'){for(const s of [-1,1]){ctx.beginPath();ctx.rect(X+100,y+s*30-6,240,12);paint(C.part2,C.ink);}}circ(g.pin[0],g.pin[1],8);paint(C.part2,C.ink);
      if(o.adj){ctx.beginPath();ctx.rect(g.pin[0]-12,g.pin[1]-10,24,20);paint(C.hi,C.ink);}}
    else{const xh=g.x;if(o.kind==='roller'){for(const s of [-1,1]){ctx.beginPath();ctx.rect(330,y+s*44-5,380,10);paint(C.part2,C.ink);circ(xh-14,y+s*32,10);paint(C.hi,C.ink);circ(xh+14,y+s*32,10);paint(C.hi,C.ink);}}
      else{ctx.beginPath();ctx.rect(330,y-46,380,12);ctx.rect(330,y+34,380,12);paint(C.part2,C.ink);}
      if(o.kind==='fork'){bar(g.pin[0],g.pin[1]-10,xh,y-22,8,C.part);bar(g.pin[0],g.pin[1]+10,xh,y+22,8,C.part);}
      ctx.beginPath();ctx.rect(xh-30,y-30,60,60);paint(C['steel-fill'],C.ink);if(o.kind!=='fork')bar(g.pin[0],g.pin[1],xh,y,14,C.part);bar(xh+30,y,760,y,10,C.part);pivot(xh,y,5);pivot(g.pin[0],g.pin[1],5);}
    pivot(O[0],O[1],6);label(o.label,400,490,'center');},
  reads(v){const g=this.g;return[['Stroke',`${2*g.r} mm`],['Crank',`${mod(g.phi*180/PI,360).toFixed(0)}°`],['Slide speed',`${v.toFixed(0)} mm/s`]];}});}
crankSlide(326,{label:'SLIDE IN A GUIDE FRAME KEEPS THE ROD STRAIGHT'});
crankSlide(327,{kind:'roller',label:'ROLLERS RUN ON THE GUIDE BARS'});
crankSlide(330,{kind:'fork',label:'FORKED CONNECTING ROD · piston rod runs on between the prongs',concept:true});
crankSlide(331,{kind:'slotx',label:'PIN SLIDES IN A SLOTTED CROSS-HEAD BETWEEN PILLARS'});
crankSlide(279,{kind:'yoke',adj:true,label:'SLIDING BOX ON THE PIN · set the throw',params:[{id:'r',label:'Crank throw',min:30,max:90,step:5,value:70,fmt:v=>v+' mm'}]});
crankSlide(94,{label:'SPIRAL AND SLOT SET THE THROW',params:[{id:'r',label:'Throw',min:20,max:90,step:5,value:60,fmt:v=>v+' mm'}]});
crankSlide(417,{kind:'yoke',label:'BENT SHAFT AND SLIDING BLOCK',concept:true});
crankSlide(418,{kind:'roller',label:'VALVE SLIDES ON ROLLERS TO CUT FRICTION',concept:true,r:40});

function shapedYoke(num,o){return reg({num,outLabel:'Yoke position, mm',concept:!!o.concept,
  u(phi){return o.u(mod(phi,TAU))*80;},
  update(phi){this.g={phi,u:this.u(phi)};},output(){return this.g.u;},
  draw(){const g=this.g,O=[260,270],r=80,X=O[0]+g.u;circ(O[0],O[1],110);paint(C['brass-fill'],C.ink);const pin=[O[0]+r*Math.cos(g.phi),O[1]+r*Math.sin(g.phi)];
    ctx.save();ctx.translate(g.u,0);const pts=[];for(let i=0;i<=200;i++){const t=i/200*TAU;pts.push([O[0]+r*Math.cos(t)-this.u(t),O[1]+r*Math.sin(t)]);}const xs=pts.map(p=>p[0]),x0=Math.min(...xs)-22,x1=Math.max(...xs)+22;ctx.beginPath();ctx.rect(x0,O[1]-r-24,x1-x0,2*r+48);paint(C['steel-fill'],C.ink);ctx.lineWidth=16;ctx.strokeStyle=C.ink;ctx.beginPath();poly(pts.map(p=>[p[0]-O[0]+O[0]-0,p[1]]),false);ctx.stroke();ctx.lineWidth=13;ctx.strokeStyle=C.sheet;ctx.stroke();ctx.restore();
    {const xs2=[];for(let i=0;i<=200;i++){const t=i/200*TAU;xs2.push(O[0]+r*Math.cos(t)-this.u(t));}bar(Math.max(...xs2)+22+g.u,O[1],760,O[1],14,C.part);}ctx.beginPath();ctx.rect(560,O[1]-24,180,8);ctx.rect(560,O[1]+16,180,8);paint(C.part2,C.ink);bar(O[0],O[1],pin[0],pin[1],10,C.part2);circ(pin[0],pin[1],7);paint(C.hi,C.ink);pivot(O[0],O[1],5);label(o.label,400,490,'center');},
  reads(v){return[['Yoke',`${this.g.u.toFixed(0)} mm`],['Speed',`${v.toFixed(0)} mm/s`],['Profile',o.what]];}});}
shapedYoke(354,{u:t=>{const f=t/TAU;return f<0.5?1-4*f:-3+4*f;},label:'SHAPED GROOVE GIVES A UNIFORM SPEED',what:'constant speed each way'});
shapedYoke(146,{u:t=>{const c=Math.cos(t);return Math.sign(c)*Math.pow(Math.abs(c),0.5);},label:'SHAPED YOKE GROOVE',what:'quick middle, slow ends',concept:true});
shapedYoke(178,{u:t=>{const c=Math.cos(t);return c>0?c:c*Math.abs(c)*0.6+c*0.4;},label:'SLIDE SLOWS NEAR ONE END OF ITS STROKE',what:'slow near one end',concept:true});

/* ---- cam with flat follower (support function, exact for convex shapes) ---- */
function shapePts(fn,n=240){const pts=[];for(let i=0;i<n;i++){const t=i/n*TAU;const r=fn(t);pts.push([r*Math.cos(t),r*Math.sin(t)]);}return pts;}
function camFlat(num,o){const base=o.pts||(o.r?shapePts(o.r):null);return reg({num,outLabel:o.outLabel||'Follower position, mm',concept:!!o.concept,params:o.params||[],
  shape(){return this.P.k!==undefined&&o.set?o.set[this.P.k]:base;},
  update(phi){const sh=this.shape(),a=phi*(o.dir||1);let hx=-1e9,hy=-1e9,hxn=1e9;for(const [x,y] of sh){const X=x*Math.cos(a)-y*Math.sin(a),Y=x*Math.sin(a)+y*Math.cos(a);if(X>hx)hx=X;if(-Y>hy)hy=-Y;if(X<hxn)hxn=X;}this.g={phi,a,hx,hy,hxn};},
  output(){return o.yoke?this.g.hx:this.g.hy;},
  draw(){const g=this.g,O=o.O||[330,300],sh=this.shape();const pts=sh.map(([x,y])=>[O[0]+x*Math.cos(g.a)-y*Math.sin(g.a),O[1]+x*Math.sin(g.a)+y*Math.cos(g.a)]);
    if(o.yoke){const xR=O[0]+g.hx,xL=O[0]+g.hxn,w=xR-xL;ctx.beginPath();ctx.rect(xL-16,O[1]-130,w+32,260);ctx.rect(xL,O[1]-114,w,228);paint(C['steel-fill'],C.ink);bar(xR+16,O[1],770,O[1],14,C.part);bar(xL-16,O[1],60,O[1],14,C.part);for(const x of [110,640]){ctx.beginPath();ctx.rect(x,O[1]-24,70,8);ctx.rect(x,O[1]+16,70,8);paint(C.part2,C.ink);}
      if(o.valve){ctx.beginPath();ctx.rect(680,O[1]-60,90,30);paint(C.part2,C.ink);}}
    else{const y=O[1]-g.hy;ctx.beginPath();ctx.rect(O[0]-60,y-16,120,16);paint(C['steel-fill'],C.ink);bar(O[0],y-16,O[0],60,16,C.part);ctx.beginPath();ctx.rect(O[0]-30,130,10,40);ctx.rect(O[0]+20,130,10,40);paint(C.part2,C.ink);}
    poly(pts);ctx.closePath();paint(C['brass-fill'],C.ink);pivot(O[0],O[1],6);if(o.post)o.post.call(this,O,g);label(o.label,400,500,'center');},
  reads(v){return o.reads?o.reads.call(this,v):[['Follower',`${(o.yoke?this.g.hx:this.g.hy).toFixed(0)} mm`],['Speed',`${v.toFixed(0)} mm/s`]];}});}
const reuleaux=(R)=>{const pts=[],V=[0,1,2].map(k=>[R/Math.sqrt(3)*Math.cos(-PI/2+k*TAU/3),R/Math.sqrt(3)*Math.sin(-PI/2+k*TAU/3)]);for(let k=0;k<3;k++){const c=V[k],a0=Math.atan2(V[(k+1)%3][1]-c[1],V[(k+1)%3][0]-c[0]);for(let i=0;i<40;i++){const a=a0+i/40*PI/3;pts.push([c[0]+R*Math.cos(a),c[1]+R*Math.sin(a)]);}}return pts;};
camFlat(90,{yoke:true,r:t=>{const e=40,R=80;return Math.sqrt(R*R-(e*Math.sin(t))**2)+e*Math.cos(t);},label:'ECCENTRIC WORKING IN A LONG YOKE',outLabel:'Yoke position, mm'});
camFlat(91,{yoke:true,pts:reuleaux(150).map(([x,y])=>[x+40,y]),label:'TRIANGULAR ECCENTRIC · moves, pauses, moves back',outLabel:'Yoke position, mm'});
camFlat(135,{yoke:true,valve:true,pts:reuleaux(140).map(([x,y])=>[x+36,y]),label:'TAPPET ECCENTRIC · quick valve strokes with pauses',outLabel:'Valve position, mm',concept:true});
camFlat(117,{yoke:true,valve:true,r:t=>80+28*Math.cos(2*t)*0+20*Math.max(0,Math.cos(t)),label:'CAM BETWEEN ROLLERS IN A YOKE WORKS THE VALVE',outLabel:'Valve position, mm',concept:true});
camFlat(128,{yoke:true,pts:shapePts(t=>60+50*Math.pow(Math.max(0,Math.cos(1.5*(t))),3)),label:'THREE WIPERS ON THE SHAFT SHIFT THE FRAME',outLabel:'Frame position, mm',concept:true});
camFlat(136,{r:t=>90+30*Math.sin(t)+12*Math.sin(3*t),label:'SHAPED RIM GIVES THE ROD ITS MOTION'});
camFlat(149,{r:t=>85+35*Math.max(0,Math.sin(t))**2,label:'CAM WORKS THE ROD THROUGH LEVERS',concept:true});
camFlat(150,{params:[{id:'k',type:'toggle',label:'Cam fitted',options:[[0,'Short'],[1,'Medium'],[2,'Long']],value:1}],set:[0,1,2].map(k=>shapePts(t=>80+(15+15*k)*Math.max(0,Math.cos(t)))),label:'CHANGE THE CAM TO CHANGE THE VALVE TRAVEL',reads(){return[['Cam',['short','medium','long'][this.P.k]],['Travel',`${15+15*this.P.k} mm`]];}});
camFlat(88,{r:t=>{const u=mod(t,TAU);return u<PI?110:110-60*Math.sin(u-PI);},label:'STOPS ON THE ECCENTRIC DISK · intermittent motion',concept:true});
camFlat(286,{r:t=>{const u=mod(t,TAU);return u<1.2?60+60*Math.sin(u/1.2*PI):60;},label:'CURVED TOE LIFTS THE VALVE ROD',concept:true});
camFlat(130,{r:t=>80+40*smooth((Math.cos(t)+1)/2),label:'CAM CLOSES THE SHEARS, WEIGHT OPENS THEM',concept:true,
  post(O,g){const a=-0.6+g.hy/200;bar(O[0]-160,O[1]-200,O[0]+180,O[1]-200+340*Math.sin(a)*0.3,10,C['steel-fill']);pivot(O[0]-160,O[1]-200,5);}});
camFlat(86,{r:t=>70+55*mod(t,TAU)/TAU,label:'CAM DRAGS THE CATCH TO RAISE THE ROPE',concept:true});
camFlat(400,{r:t=>80+30*smooth((Math.cos(t)+1)/2),label:'CAM LIFTS THE FEED BAR · spring returns it',concept:true});

/* ---- groove cam with a swinging lever (exact intersection) ---- */
function grooveLever(num,o){return reg({num,o,outLabel:'Lever angle, degrees',concept:!!o.concept,F:o.F||[620,150],L:o.L||300,
  reset(){this.prev=null;},
  update(phi){const O=[300,290],a=phi;let best=null,bd=1e9;const n=360;let last=null;
    for(let i=0;i<=n;i++){const t=i/n*TAU,r=o.r(t),p=[O[0]+r*Math.cos(t+a),O[1]+r*Math.sin(t+a)];const f=Math.hypot(p[0]-this.F[0],p[1]-this.F[1])-this.L;if(last&&Math.sign(f)!==Math.sign(last.f)){const k=last.f/(last.f-f),q=[last.p[0]+(p[0]-last.p[0])*k,last.p[1]+(p[1]-last.p[1])*k];const d=this.prev?Math.hypot(q[0]-this.prev[0],q[1]-this.prev[1]):q[0];if(d<bd){bd=d;best=q;}}last={p,f};}
    if(!best)best=this.prev||[O[0],O[1]];this.prev=best;this.g={phi,O,pin:best,ang:Math.atan2(best[1]-this.F[1],best[0]-this.F[0])};},
  output(){return this.g.ang*180/PI;},
  draw(){const g=this.g,O=g.O;circ(O[0],O[1],o.disk||150);paint(C['brass-fill'],C.ink);const pts=[];for(let i=0;i<=240;i++){const t=i/240*TAU,r=o.r(t);pts.push([O[0]+r*Math.cos(t+g.phi),O[1]+r*Math.sin(t+g.phi)]);}
    ctx.save();ctx.lineWidth=16;ctx.strokeStyle=C.ink;poly(pts);ctx.stroke();ctx.lineWidth=13;ctx.strokeStyle=C.sheet;ctx.stroke();ctx.restore();pivot(O[0],O[1],6);
    const E=[this.F[0]+(this.L+80)*Math.cos(g.ang),this.F[1]+(this.L+80)*Math.sin(g.ang)];bar(this.F[0],this.F[1],g.pin[0],g.pin[1],14,C['steel-fill']);circ(g.pin[0],g.pin[1],7);paint(C.hi,C.ink);pivot(this.F[0],this.F[1],7);ground(this.F[0],this.F[1]-12,40,true);
    label(o.label,400,500,'center');},
  reads(){return[['Lever',`${(this.g.ang*180/PI).toFixed(1)}°`]];}});}
grooveLever(98,{r:t=>95+30*Math.sin(t)+15*Math.cos(2*t),label:'PIN IN AN ENDLESS GROOVE · irregular swing'});
grooveLever(281,{r:t=>100+35*Math.cos(t),label:'PIN IN A GROOVE ON THE DISK SWINGS THE LEVER'});
grooveLever(99,{r:t=>{const u=mod(t,TAU)/TAU;return u<0.85?50+80*u/0.85:130-80*(u-0.85)/0.15;},label:'SPIRAL GUIDE GIVES A SLOW FEED AND QUICK RETURN',concept:true});
alias(107,106,{concept:true});

/* ---- slotted levers and curved arms ---- */
link(156,{outLabel:'Bell crank angle, degrees',fix:{O:[260,300],F:[470,300]},steps:[['B','crank','O',80],['E','dir','F','B',170],['T','fn',P=>{const a=Math.atan2(P.B[1]-P.F[1],P.B[0]-P.F[0])+PI/2;return[P.F[0]+150*Math.cos(a),P.F[1]+150*Math.sin(a)];}]],
  pre(P,phi){circ(P.O[0],P.O[1],100);paint(C['brass-fill'],C.ink);},slots:[['F','B',200,30,'s']],bars:[['O','B',10,'q'],['F','T',14,'s']],joints:['B','T'],nopiv:[],
  out:P=>Math.atan2(P.B[1]-P.F[1],P.B[0]-P.F[0])*180/PI,labels:[['CRANK PIN SLIDES IN THE BELL-CRANK SLOT',400,490,'center']],reads:(P,phi,v)=>[['Bell crank',`${(Math.atan2(P.B[1]-P.F[1],P.B[0]-P.F[0])*180/PI).toFixed(0)}°`],['Swing speed',`${v.toFixed(0)} °/s`]]});
link(157,{outLabel:'Bell crank angle, degrees',concept:true,fix:{O:[220,300],F:[520,300]},steps:[['B','crank','O',80],['C','cc','F',110,'B',220,-1],['T','fn',P=>{const a=Math.atan2(P.C[1]-P.F[1],P.C[0]-P.F[0])+PI/2;return[P.F[0]+150*Math.cos(a),P.F[1]+150*Math.sin(a)];}]],
  pre(P){circ(P.O[0],P.O[1],100);paint(C['brass-fill'],C.ink);},bars:[['O','B',10,'q'],['B','C',10,'p'],['F','C',14,'s'],['F','T',14,'s']],joints:['B','C','T'],
  out:P=>Math.atan2(P.C[1]-P.F[1],P.C[0]-P.F[0])*180/PI,labels:[['CONNECTING ROD IN PLACE OF THE SLOT',400,490,'center']]});
link(268,{outLabel:'Rod angle, degrees',fix:{O:[300,330],F:[300,120]},steps:[['B','crank','O',80],['E','dir','F','B',330]],slots:[['F','B',330,60,'s']],bars:[['O','B',12,'b']],joints:['B'],
  pre(P){circ(P.O[0],P.O[1],100);paint(C.part,C.ink);},out:P=>Math.atan2(P.B[0]-P.F[0],P.B[1]-P.F[1])*180/PI,labels:[['CRANK PIN SLIDES IN THE SWINGING ROD',400,495,'center']]});
link(203,{outLabel:'Straight arm angle, degrees',concept:true,fix:{O:[260,280],F:[520,280]},steps:[['B','rock','O',140,0,0.7],['C','fn',P=>{const a=Math.atan2(P.B[1]-P.O[1],P.B[0]-P.O[0]);return[P.O[0]+110*Math.cos(a)+40*Math.sin(a)*Math.sin(a*2),P.O[1]+110*Math.sin(a)];}],['E','dir','F','C',240]],
  slots:[['O','B',150,30,'b']],bars:[['F','E',12,'s']],joints:['C'],out:P=>Math.atan2(P.C[1]-P.F[1],P.C[0]-P.F[0])*180/PI,labels:[['STEADY SWING OF THE CURVED SLOTTED ARM',400,480,'center'],['GIVES A VARYING SWING TO THE STRAIGHT ARM',400,498,'center']]});
link(210,{outLabel:'Bar height, mm',concept:true,fix:{O:[300,300]},steps:[['B','crank','O',140],['S','fn',P=>{const a=Math.atan2(P.B[1]-P.O[1],P.B[0]-P.O[0]);const r=60+50*(1+Math.sin(a))/2;return[480,P.O[1]+r*Math.sin(a)*1.2];}]],
  pre(P){ctx.beginPath();ctx.rect(470,60,20,420);paint(C.part2,C.ink);},slots:[['O','B',160,40,'b']],blocks:[['S',60,26,'s']],joints:[],out:P=>300-P.S[1],labels:[['CURVED SLOTTED ARM DRIVES THE UPRIGHT BAR',400,495,'center']]});
link(220,{outLabel:'Driven crank angle, degrees',fix:{O1:[330,280],O2:[380,280]},steps:[['B','crank','O1',120],['E','dir','O2','B',170]],slots:[['O2','B',170,20,'s']],bars:[['O1','B',14,'b']],joints:['B'],
  pre(P){circ(P.O1[0],P.O1[1],140);paint(C.part,C.ink);},out:P=>mod(Math.atan2(P.B[1]-P.O2[1],P.B[0]-P.O2[0]),TAU)*180/PI,labels:[['OFFSET CRANKS · driven crank speeds up and slows down',400,490,'center']],
  reads:(P,phi,v)=>[['Driver',`${mod(phi*180/PI,360).toFixed(0)}°`],['Driven',`${(mod(Math.atan2(P.B[1]-P.O2[1],P.B[0]-P.O2[0]),TAU)*180/PI).toFixed(0)}°`],['Driven speed',`${(v/57.3).toFixed(2)} × driver`]]});
function ellYokes(num,o){return reg({num,outLabel:'Pin height, mm',concept:!!o.concept,
  reset(){this.trail=[];},
  update(phi){const Q=[420+o.a*Math.cos(phi),250+o.b*Math.sin(phi)];this.g={phi,Q};this.trail=this.trail||[];this.trail.push(Q);if(this.trail.length>330)this.trail.shift();},output(){return 270-this.g.Q[1];},
  draw(){const g=this.g,Q=g.Q,A=[150,270],B=[640,410],pa=[A[0]+o.a*Math.cos(g.phi),A[1]+o.a*Math.sin(g.phi)],pb=[B[0]+o.b*Math.cos(g.phi),B[1]+o.b*Math.sin(g.phi)];
    circ(A[0],A[1],o.a+18);paint(C['brass-fill'],C.ink);circ(B[0],B[1],o.b+16);paint(C.part,C.ink);
    if(this.trail.length>1){ctx.save();ctx.strokeStyle=C.steel;ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(...this.trail[0]);for(const p of this.trail)ctx.lineTo(...p);ctx.stroke();ctx.restore();}
    ctx.beginPath();ctx.rect(pa[0]-9,A[1]-o.a-20,18,2*o.a+40);ctx.rect(Q[0]-9,90,18,360);paint(C['steel-fill'],C.ink);bar(pa[0],A[1]-o.a-20,Q[0],A[1]-o.a-20,10,C['steel-fill']);
    ctx.beginPath();ctx.rect(B[0]-o.b-20,pb[1]-9,2*o.b+40,18);ctx.rect(250,Q[1]-9,420,18);paint(C['brass-fill'],C.ink);bar(B[0]+o.b+20,pb[1],B[0]+o.b+20,Q[1],10,C['brass-fill']);
    bar(A[0],A[1],pa[0],pa[1],12,C.part2);circ(pa[0],pa[1],6);paint(C.hi,C.ink);pivot(A[0],A[1],6);bar(B[0],B[1],pb[0],pb[1],10,C.part2);circ(pb[0],pb[1],6);paint(C.hi,C.ink);pivot(B[0],B[1],6);
    circ(Q[0],Q[1],8);paint(C.steel,C.ink);label(o.label,400,500,'center');label('two cranks at the same speed · one sets x, the other y',400,60,'center');},
  reads(){return[['Path','ellipse'],['Axes',`${2*o.a} × ${2*o.b} mm`]];}});}
ellYokes(168,{a:110,b:60,label:'PIN FOLLOWS AN ELLIPSE',concept:true});ellYokes(169,{a:90,b:70,label:'LINK VERSION OF 168',concept:true});
link(172,{outLabel:'Point height, mm',trace:'T',fix:{A:[260,360],D:[480,360]},steps:[['B','crank','A',60],['C','cc','D',170,'B',200,1],['T','on','B','C',0.5,-90]],
  bars:[['A','B',12,'b'],['D','C',12,'p'],['B','C',10,'s'],['B','T',8,'s'],['C','T',8,'s']],joints:['B','C'],out:P=>360-P.T[1],labels:[['THE TRACING POINT DRAWS AN EGG-SHAPED PATH',400,495,'center']]});
link(148,{outLabel:'Crank angle, degrees',fix:{A:[260,300],D:[520,300]},steps:[['B','crank','A',60],['C','cc','D',120,'B',260,-1]],bars:[['A','B',14,'b'],['B','C',10,'p'],['D','C',16,'s']],joints:['B','C'],
  pre(P,phi){drawGear(P.A[0]-140,P.A[1],50,20,-phi*1.6,C.part,{bore:5});drawGear(P.A[0],P.A[1],80,32,phi,C['brass-fill'],{bore:6});},out:P=>Math.atan2(P.C[1]-P.D[1],P.C[0]-P.D[0])*180/PI,labels:[['CONTINUOUS GEARING · SWINGING CRANK',400,490,'center']]});
link(350,{outLabel:'Bar position, mm',concept:true,fix:{F:[400,140]},steps:[['B','rock','F',220,PI/2,0.35],['S','fn',P=>[P.B[0],420]]],bars:[['F','B',14,'b']],blocks:[['S',120,24,'s']],guides:[[180,440,440,10]],joints:['B'],
  pre(P){ctx.beginPath();ctx.rect(P.B[0]-8,P.B[1],16,P.S[1]-P.B[1]);paint(C.part,C.ink);},out:P=>P.S[0]-400,labels:[['SLIDING PIN CONNECTS THE LEVER TO THE BAR',400,495,'center']]});
link(363,{outLabel:'Board angle, degrees',fix:{F:[400,330]},steps:[['L','rock','F',240,PI,0.3],['R','add','F','F','L']],bars:[['L','R',16,'b']],joints:[],out:P=>Math.atan2(P.R[1]-P.F[1],P.R[0]-P.F[0])*180/PI,
  post(P){weight(P.L[0],P.L[1]-50,40,50,'');weight(P.R[0],P.R[1]-50,40,50,'');poly([[370,370],[430,370],[400,330]]);ctx.closePath();paint(C.part2,C.ink);},labels:[['SEE-SAW',400,480,'center']],noground:['F']});
link(273,{outLabel:'Spread, mm',fix:{},steps:[['L','fn',(P,phi)=>[400-60-50*Math.sin(phi),270]],['R','fn',(P,phi)=>[400+60+50*Math.sin(phi),270]],['T','fn',P=>[400,270-Math.sqrt(Math.max(0,170*170-(P.R[0]-400)**2))]],['Bm','fn',P=>[400,270+Math.sqrt(Math.max(0,170*170-(P.R[0]-400)**2))]]],
  bars:[['L','T',10,'b'],['T','R',10,'b'],['R','Bm',10,'s'],['Bm','L',10,'s']],blocks:[['L',30,30,'p'],['R',30,30,'p']],joints:['T','Bm'],
  pre(P){bar(80,270,P.L[0],270,10,C.part);bar(P.R[0],270,720,270,10,C.part);},post(P){bar(P.T[0],P.T[1],400,40,8,C.part2);bar(P.Bm[0],P.Bm[1],400,490,8,C.part2);},out:P=>P.Bm[1]-P.T[1],labels:[['PUSH THE SIDES IN, THE ENDS SPREAD',560,90]]});
link(282,{outLabel:'Weight height, mm',concept:true,fix:{O:[260,330],F:[460,150]},steps:[['B','crank','O',70],['E','dir','F','B',230]],slots:[['F','B',230,40,'b']],joints:['B'],
  pre(P){circ(P.O[0],P.O[1],90);paint(C.part,C.ink);},post(P){const a=Math.atan2(P.B[1]-P.F[1],P.B[0]-P.F[0]);ctx.beginPath();ctx.moveTo(P.F[0],P.F[1]);ctx.arc(P.F[0],P.F[1],110,a+PI-0.5,a+PI+0.5);ctx.closePath();paint(C['steel-fill'],C.ink);const y=150+110*(a-1.2)*1.2;ctx.beginPath();ctx.rect(330,y,16,120);paint(C.part2,C.ink);weight(338,y+120,60,40,'');},
  out:P=>Math.atan2(P.B[1]-P.F[1],P.B[0]-P.F[0])*100,labels:[['DISK PIN SWINGS THE BAR · SECTOR MOVES THE WEIGHT',400,500,'center']]});
link(401,{outLabel:'Crank angle, degrees',concept:true,fix:{O:[480,240],F:[160,420]},steps:[['B','crank','O',60],['T','cc','F',260,'B',190,1]],bars:[['F','T',16,'b'],['T','B',8,'p'],['O','B',12,'q']],joints:['B','T'],
  pre(P){flywheel(P.O[0],P.O[1],110,0);},post(P){springZ(P.T[0],P.T[1],P.T[0],P.T[1]+70,8,5);},out:(P,phi)=>mod(phi*180/PI,360),labels:[['SPRUNG SLIDE CARRIES THE TREADLE PAST DEAD CENTRE',400,495,'center']]});

/* ---- double crank and twin rods ---- */
reg({num:230,outLabel:'Crank angle, degrees',O:[460,320],r:60,
  update(phi){const O=this.O,pin=[O[0]+this.r*Math.cos(phi),O[1]+this.r*Math.sin(phi)];const xh=pin[0]-Math.sqrt(200*200-(pin[1]-O[1])**2),yv=pin[1]-Math.sqrt(200*200-(pin[0]-O[0])**2);this.g={phi,pin,xh,yv};},output(){return mod(this.g.phi*180/PI,360);},
  draw(){const g=this.g,O=this.O;circ(O[0],O[1],80);paint(C.part,C.ink);ctx.beginPath();ctx.rect(90,O[1]-36,180,72);paint(C.part2,C.ink);ctx.beginPath();ctx.rect(O[0]-36,40,72,140);paint(C.part2,C.ink);
    ctx.beginPath();ctx.rect(g.xh-30,O[1]-30,30,60);paint(C['steel-fill'],C.ink);ctx.beginPath();ctx.rect(O[0]-30,g.yv-30,60,30);paint(C['steel-fill'],C.ink);bar(g.xh,O[1],g.pin[0],g.pin[1],10,C.part);bar(O[0],g.yv,g.pin[0],g.pin[1],10,C.part);bar(O[0],O[1],g.pin[0],g.pin[1],18,C['brass-fill']);pivot(g.pin[0],g.pin[1],5);pivot(O[0],O[1],6);
    label('ONE CYLINDER IS ALWAYS PAST DEAD CENTRE',400,490,'center');},
  reads(){const t=mod(this.g.phi*180/PI,360);return[['Crank',`${t.toFixed(0)}°`],['Dead centres','never both at once']];}});

reg({num:346,outLabel:'Crosshead position, mm',
  update(phi){const r=60,L=200,y0=300,pin1=[260+r*Math.cos(phi),y0+r*Math.sin(phi)],x=pin1[0]+Math.sqrt(L*L-(pin1[1]-y0)**2);this.g={phi,r,x,pin1,pin2:[540-r*Math.cos(phi)*-1,y0+r*Math.sin(phi)]};},output(){return this.g.x;},
  draw(){const g=this.g;ctx.beginPath();ctx.rect(560,230,180,140);paint(C.part2,C.ink);bar(g.x,300,600,300,10,C.part);ctx.beginPath();ctx.rect(g.x-10,200,20,200);paint(C['steel-fill'],C.ink);
    for(const s of [-1,1]){const y=300+s*100;const pin=[260+60*Math.cos(g.phi),y+60*Math.sin(g.phi)];circ(260,y,72);paint(C.part,C.ink);bar(260,y,pin[0],pin[1],14,C['brass-fill']);bar(pin[0],pin[1],g.x,y,10,C.part);pivot(pin[0],pin[1],4);pivot(260,y,5);pivot(g.x,y,4);}
    label('CROSS-HEAD AND SIDE RODS DRIVE TWO CRANKS',400,490,'center');label('CYLINDER',650,390,'center');},
  reads(){return[['Cranks','turn together'],['Crosshead',`${this.g.x.toFixed(0)}`]];}});

reg({num:348,outLabel:'Slide position, mm',concept:true,
  update(phi){this.g={phi,x:80*Math.cos(2*phi)};},output(){return this.g.x;},
  draw(){const g=this.g,O=[300,280];circ(O[0],O[1],130);paint(C['brass-fill'],C.ink);for(const k of [0,1]){const a=g.phi+k*PI/2;ctx.save();ctx.translate(O[0],O[1]);ctx.rotate(a);ctx.beginPath();ctx.rect(-110,-9,220,18);ctx.fillStyle=C.sheet;ctx.fill();ctx.strokeStyle=C.ink;ctx.stroke();ctx.restore();}pivot(O[0],O[1],6);
    const px=O[0]+g.x;circ(px,O[1]-0,9);paint(C.hi,C.ink);bar(px,O[1],760,O[1],10,C.part);label('TWO STROKES EACH TURN',560,O[1]+40);},
  reads(){return[['Strokes per turn','2']];}});

/* ---- racks, frames, double racks ---- */
function rackFrame(num,o){return reg({num,outLabel:o.outLabel||'Frame position, mm',concept:!!o.concept,
  update(phi){const u=mod(phi,TAU)/TAU;const tri=u<0.5?-1+4*u:3-4*u;const x=o.altGear?0:tri*50*PI/2;const top=u<0.5;this.g={phi,x,top,tri};},output(){return o.altGear?this.g.tri*120/50*180/PI:this.g.x;},
  draw(){const g=this.g,P=[400,270],rp=50,X=400+g.x;const H=(rp+6.25),gap=g.top?0:1;const yT=P[1]-H-(g.top?0:12),yB=P[1]+H+(g.top?12:0);
    ctx.beginPath();ctx.rect(X-260,yT-30,520,yB-yT+60);ctx.rect(X-250,yT,500,yB-yT);paint(C['steel-fill'],C.ink);
    const len=o.part?260:500;const mm=5,pp=PI*mm,c0=X+(g.top?0:pp/2);for(const [y,dir] of [[yT,1],[yB,-1]]){const yp=y+dir*1.25*mm,pts=rackTeeth(X-len/2,X+len/2,c0,pp,yp,mm,dir>0);poly([[X-len/2,y],...pts,[X+len/2,y]]);ctx.closePath();paint(C['steel-fill'],C.ink,.9);}
    const ga=o.altGear?g.tri*2.4:g.phi;drawGear(P[0],P[1],rp,20,ga,C['brass-fill'],{bore:6});pivot(P[0],P[1],5);
    if(o.cam){const c=[P[0],P[1]+170];ctx.beginPath();ctx.ellipse(c[0],c[1],40,26,g.phi,0,TAU);paint(C.part,C.ink);}
    label(o.label,400,490,'center');label(g.top?'UPPER RACK IN MESH':'LOWER RACK IN MESH',400,40,'center');},
  reads(){return[['In mesh',this.g.top?'upper rack':'lower rack'],[o.altGear?'Gear':'Frame',o.altGear?'turns back and forth':`${this.g.x.toFixed(0)} mm`]];}});}
rackFrame(84,{cam:true,label:'CAM SHIFTS THE DOUBLE RACK TO SELECT A SIDE',concept:true});
rackFrame(139,{label:'PINION ENGAGES EACH SIDE OF THE INTERNAL RACK IN TURN'});
rackFrame(269,{part:true,altGear:true,label:'PART-TOOTHED RACKS TURN THE GEAR EACH WAY',outLabel:'Gear angle, degrees',concept:true});
aliasObj(394,M119,{concept:true});aliasObj(125,M122,{concept:true});

reg({num:115,outLabel:'Rack position, mm',
  update(phi){this.g={phi,x:110*Math.sin(phi*0.5)};},output(){return this.g.x;},
  draw(){const g=this.g,X=400+g.x,a=g.x/60;for(const s of [-1,1]){drawGear(400,270+s*100,60,24,s*a,C['brass-fill'],{bore:6});pivot(400,270+s*100,5);}
    ctx.beginPath();ctx.rect(X-220,250,440,40);paint(C['steel-fill'],C.ink);for(let i=0;i<22;i++){const x=X-215+i*20;poly([[x,250],[x+6,238],[x+14,238],[x+20,250]]);ctx.closePath();poly([[x,290],[x+6,302],[x+14,302],[x+20,290]],true);ctx.closePath();paint(C['steel-fill'],C.ink,.8);}
    label('TWO EQUAL WHEELS SHARE THE LOAD ON A DOUBLE RACK',400,480,'center');},
  reads(){return[['Rack',`${this.g.x.toFixed(0)} mm`],['Wheels','turn opposite ways']];}});

reg({num:283,outLabel:'Left rack height, mm',
  update(phi){const a=0.5*Math.sin(phi);this.g={phi,a,y:a*60};},output(){return -this.g.y;},
  draw(){const g=this.g,P=[400,240];drawGear(P[0],P[1],60,20,g.a,C['brass-fill'],{bore:6});bar(P[0],P[1],P[0]+260*Math.cos(-PI/2+g.a+0.9),P[1]+260*Math.sin(-PI/2+g.a+0.9),14,C['brass-fill']);pivot(P[0],P[1],6);
    for(const s of [-1,1]){const x=P[0]+s*74,y=P[1]+s*g.y*-1*-1*s;const yy=P[1]-80+(s>0?-g.y:g.y)*1;ctx.beginPath();ctx.rect(x-14,yy,28,260);paint(C['steel-fill'],C.ink);ctx.beginPath();ctx.rect(x-40,yy+260,80,30);paint(C.part2,C.ink);ctx.beginPath();ctx.rect(x-46,P[1]+130,92,170);paint(null,C.ink);}
    label('HANDLE TURNS THE PINION · TWO PUMP RACKS WORK OPPOSITE',400,30,'center');},
  reads(){return[['Handle',`${(this.g.a*180/PI).toFixed(0)}°`],['Racks','one up, one down']];}});

/* ---- screws, worms, traverses ---- */
function screwShaft(x0,x1,y,r,ang,lead){ctx.beginPath();ctx.rect(x0,y-r,x1-x0,2*r);paint(C.part,C.ink);ctx.save();ctx.beginPath();ctx.rect(x0,y-r,x1-x0,2*r);ctx.clip();ctx.strokeStyle=C.ink;ctx.lineWidth=1.4;const p=lead||16,off=mod(ang/TAU*p,p);for(let x=x0-2*r+off;x<x1+2*r;x+=p){ctx.beginPath();ctx.moveTo(x,y-r);ctx.lineTo(x+r*0.6,y+r);ctx.stroke();}ctx.restore();}
function screwSlide(num,o){return reg({num,outLabel:'Slide position, mm',concept:!!o.concept,params:o.params||[],
  reset(){this.x=0;this.last=null;this.dir=1;},
  update(phi){if(this.last===null)this.last=phi;const d=phi-this.last;this.last=phi;const lead=(this.P.lead||o.lead||16);
    let th=phi;if(o.kind==='traverse'){this.x+=this.dir*d/TAU*lead*2;if(this.x>200){this.x=200;this.dir=-1;}if(this.x<-200){this.x=-200;this.dir=1;}}else{const A=180/lead*TAU;th=A*Math.sin(phi/A);this.x=lead*th/TAU;}
    this.g={phi,lead,th};},output(){return this.x;},
  draw(){const g=this.g,y=280,X=400+this.x;if(o.kind==='traverse'){screwShaft(150,650,y-30,14,g.phi,24);screwShaft(150,650,y+30,14,-g.phi,24);ctx.save();ctx.strokeStyle=C.ink;ctx.restore();}else screwShaft(150,650,y,18,g.th,g.lead);
    ctx.beginPath();ctx.rect(110,y-60,30,120);ctx.rect(660,y-60,30,120);paint(C.part2,C.ink);ctx.beginPath();ctx.rect(X-40,y-50,80,100);paint(C['steel-fill'],C.ink);
    if(o.kind==='traverse'){label(this.dir>0?'NUT ON THE RIGHT-HAND SCREW':'NUT ON THE LEFT-HAND SCREW',400,140,'center');}
    if(o.gears){drawGear(90,y+120,40,16,g.phi*2,C.part,{bore:4});drawGear(90,y+40,40,16,-g.phi*2,C['brass-fill'],{bore:4});}
    if(o.tool){poly([[X,y+50],[X-10,y+90],[X+10,y+90]]);ctx.closePath();paint(C.ink);ctx.beginPath();ctx.rect(150,y+92,500,40);paint(C.part,C.ink);ctx.save();ctx.strokeStyle=C.ink;for(let x=150;x<X;x+=g.lead/2){ctx.beginPath();ctx.moveTo(x,y+92);ctx.lineTo(x+6,y+100);ctx.stroke();}ctx.restore();}
    if(o.spindle){ctx.beginPath();ctx.rect(X+40,y-12,200,24);paint(C.part,C.ink);}
    stripeShaft(40,150,y,8,g.phi,C.part);label(o.label,400,490,'center');},
  reads(v){return[['Lead',`${this.g.lead} mm per turn`],['Slide',`${this.x.toFixed(0)} mm`],['Speed',`${v.toFixed(1)} mm/s`]];}});}
screwSlide(103,{wrap:true,label:'TURNING THE SCREW MOVES THE SLIDE',params:[{id:'lead',label:'Thread lead',min:6,max:30,step:2,value:16,fmt:v=>v+' mm'}]});
screwSlide(110,{kind:'traverse',label:'RIGHT- AND LEFT-HAND SCREWS SEND THE GUIDE BACK AND FORTH'});
screwSlide(109,{wrap:true,gears:true,tool:true,label:'CHANGE WHEELS SET THE PITCH OF THE CUT THREAD',params:[{id:'lead',label:'Pitch',min:4,max:24,step:2,value:12,fmt:v=>v+' mm'}]});
screwSlide(285,{wrap:true,spindle:true,label:'SCREW MOVES THE LATHE SPINDLE ALONG',concept:true,lead:10});
screwSlide(173,{kind:'traverse',label:'TAPPET WHEEL SHIFTS THE NUT TO VARY THE STROKE',concept:true});
screwSlide(358,{kind:'traverse',label:'FUSEE VARIES THE CARRIAGE TRAVERSE',concept:true});
screwSlide(362,{kind:'traverse',label:'PIN IN A SLANTED GROOVE MOVES THE DRUM BACK AND FORTH',concept:true});

function wormWheel(num,o){return reg({num,outLabel:'Wheel turns',concept:!!o.concept,
  update(phi){this.g={phi,w:-phi/(o.z||30)};},output(){return -this.g.w/TAU;},
  draw(){const g=this.g,y=330;if(o.rack){const x=400+mod(g.phi/TAU*20,240)-120;ctx.beginPath();ctx.rect(x-200,y-70,400,24);paint(C['steel-fill'],C.ink);for(let i=0;i<20;i++){ctx.beginPath();ctx.rect(x-196+i*20,y-46,8,10);paint(C['steel-fill'],C.ink,.8);}screwShaft(250,550,y,22,g.phi,20);label(o.label,400,490,'center');return;}
    const n=o.two?2:1;for(let k=0;k<n;k++){const X=o.two?(k?560:240):400;drawGear(X,y-150,110,o.z||30,g.w*(k?-1:1),C['steel-fill'],{bore:8});pivot(X,y-150,6);screwShaft(X-120,X+120,y-12,26,g.phi*(k?-1:1),20);}
    if(o.rolls){for(const s of [-1,1]){circ(400+s*80,y+110,50);paint(C['brass-fill'],C.ink);bar(400+s*80,y+110,400+s*80+40*Math.cos(s*g.w*3),y+110+40*Math.sin(s*g.w*3),6,C.part2);pivot(400+s*80,y+110,5);}ctx.beginPath();ctx.rect(250,y+104,300,12);paint(C.hi,C.ink);label('FEED ROLLS',400,y+175,'center');}
    label(o.label,400,30,'center');},
  reads(){return[['Ratio',`${o.z||30} : 1`],['Reversible','no · the wheel cannot drive the worm']];}});}
wormWheel(104,{label:'SCREW AND WHEEL'});wormWheel(195,{rolls:true,label:'WORM BETWEEN TWO WHEELS DRIVES THE FEED ROLLS',concept:true});wormWheel(207,{two:true,rolls:true,label:'TWIN WORMS AND WORM WHEELS',concept:true});
wormWheel(275,{rack:true,label:'WORM DRIVES THE RACK'});

reg({num:167,outLabel:'Drum turns',
  update(phi){const u=mod(phi,TAU)/TAU;const x=u<0.5?-1+4*u:3-4*u;this.g={phi,x:x*140};},output(){return this.g.phi/TAU;},
  draw(){const g=this.g,y=260,x0=230,x1=570;ctx.beginPath();ctx.rect(x0,y-70,x1-x0,140);paint(C['brass-fill'],C.ink);ctx.save();ctx.beginPath();ctx.rect(x0,y-70,x1-x0,140);ctx.clip();ctx.strokeStyle=C.ink;ctx.lineWidth=1.5;
    for(const s of [-1,1])for(let k=-4;k<6;k++){ctx.beginPath();for(let i=0;i<=40;i++){const t=i/40*PI;const x=x0+((k*0.5+t/TAU+s*g.phi/TAU*0)*2*(x1-x0)/2)+0;const xx=x0+mod((t/PI*(x1-x0)/2)*s+k*(x1-x0)/2+g.phi/TAU*(x1-x0)*s*0.5,x1-x0+200)-100;const yy=y+70*Math.cos(t);i?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy);}ctx.stroke();}ctx.restore();
    bar(140,y,x0,y,10,C.part);bar(x1,y,660,y,10,C.part);const X=400+g.x;ctx.beginPath();ctx.rect(X-30,y-130,60,40);paint(C['steel-fill'],C.ink);bar(X,y-90,X,y-60,8,C.part);ctx.beginPath();ctx.rect(150,y-150,500,10);paint(C.part2,C.ink);
    label('PIN ON THE SLIDE RUNS IN A DOUBLE SPIRAL GROOVE',400,420,'center');label('back-and-forth slide · drum turns one way',400,440,'center');},
  reads(){return[['Slide',`${this.g.x.toFixed(0)} mm`],['Drum','turns continuously']];}});

reg({num:252,outLabel:'Roller spread, mm',
  update(phi){const x=80*Math.sin(phi);this.g={phi,x,s:60+x*0.5};},output(){return 2*this.g.s;},
  draw(){const g=this.g,X=400+g.x,y=270;ctx.beginPath();ctx.rect(X-160,y-130,320,260);paint(C['steel-fill'],C.ink);for(const s of [-1,1]){ctx.save();ctx.translate(X,y+s*0);ctx.beginPath();const ang=s*0.46;ctx.save();ctx.rotate(ang);ctx.rect(-150,-9+s*60,300,18);ctx.restore();ctx.fillStyle=C.sheet;ctx.fill();ctx.restore();}
    for(const s of [-1,1]){const yy=y+s*g.s;circ(400,yy,10);paint(C.hi,C.ink);bar(400,yy,400,y+s*230,10,C.part);ctx.beginPath();ctx.rect(386,y+s*200-10,28,20);paint(C.part2,C.ink);}
    bar(X+160,y,760,y,10,C.part);label('SLANTED SLOTS MOVE BOTH ROLLERS EQUALLY',600,60,'center');},
  reads(){return[['Rollers',`${(2*this.g.s).toFixed(0)} mm apart`]];}});

reg({num:365,outLabel:'Rod travel, mm',concept:true,
  update(phi){this.g={phi,x:mod(phi*30,300),rot:phi*1.4};},output(){return this.g.x;},
  draw(){const g=this.g,y=270;const cx=250+mod(g.phi*30,300);stripeShaft(cx-200,cx+200,y,16,g.rot,C['steel-fill']);for(const s of [-1,1]){ctx.save();ctx.translate(400,y+s*50);ctx.rotate(s*0.4);ctx.beginPath();ctx.rect(-60,-26,120,52);paint(C['brass-fill'],C.ink);ctx.save();ctx.beginPath();ctx.rect(-60,-26,120,52);ctx.clip();ctx.strokeStyle=C.ink;for(let x=-80+mod(g.phi*20,16);x<80;x+=16){ctx.beginPath();ctx.moveTo(x,-26);ctx.lineTo(x,26);ctx.stroke();}ctx.restore();ctx.restore();}
    label('SKEWED ROLLERS PUSH THE ROD ALONG AND TURN IT',400,470,'center');},
  reads(){return[['Rod','advances and spins at once']];}});

/* ---- miscellaneous crank devices ---- */
reg({num:142,outLabel:'Guide position, mm',concept:true,
  update(phi){const r=40+30*Math.sin(phi/6);const x=r*Math.cos(phi);this.g={phi,r,x};},output(){return this.g.x;},
  draw(){const g=this.g,O=[300,280];drawGear(O[0],O[1],100,40,g.phi,C['brass-fill'],{bore:6});drawGear(O[0]+150,O[1]+90,50,20,-g.phi*2,C.part,{bore:5});const pin=[O[0]+g.r*Math.cos(g.phi),O[1]+g.r*Math.sin(g.phi)];
    ctx.beginPath();ctx.rect(O[0]+g.x-10,O[1]-140,20,280);paint(C['steel-fill'],C.ink);bar(O[0]+g.x,O[1]-120,760,O[1]-120,10,C.part);circ(pin[0],pin[1],8);paint(C.hi,C.ink);pivot(O[0],O[1],6);label('CRANK THROW CHANGES AS IT TURNS · traverse varies',400,490,'center');},
  reads(){return[['Present throw',`${this.g.r.toFixed(0)} mm`]];}});

function unCouple(num,pass){return reg({num,outLabel:'Crank turns',params:[{id:'e',type:'toggle',label:'Ring',options:[[1,'Engaged'],[0,'Passing']],value:pass?0:1}],
  reset(){this.c=0;this.last=null;},
  update(phi){if(this.last===null)this.last=phi;const d=phi-this.last;this.last=phi;if(this.P.e)this.c+=d;this.g={phi};},output(){return this.c/TAU;},
  draw(){const g=this.g,O=[400,270];circ(O[0],O[1],150);circ(O[0],O[1],120,false);paint(C['steel-fill'],C.ink);ctx.save();ctx.strokeStyle=C.sheet;ctx.lineWidth=26;ctx.beginPath();ctx.arc(O[0],O[1],135,g.phi-0.15,g.phi+0.15);ctx.stroke();ctx.restore();
    if(this.P.e){ctx.save();ctx.translate(O[0],O[1]);ctx.rotate(g.phi);ctx.beginPath();ctx.rect(122,-12,26,24);paint(C['steel-fill'],C.ink);ctx.restore();}
    const P=[O[0]+135*Math.cos(this.c),O[1]+135*Math.sin(this.c)];bar(O[0],O[1],P[0],P[1],18,C['brass-fill']);circ(P[0],P[1],10);paint(C.hi,C.ink);pivot(O[0],O[1],6);
    label(this.P.e?'PIN LOCKED IN THE SLOT · engines coupled':'SLOT TURNED · the pin passes, engines uncoupled',400,470,'center');},
  reads(){return[['Coupling',this.P.e?'engaged':'free']];}});}
unCouple(176,false);unCouple(177,true);

reg({num:175,outLabel:'Crank turns',concept:true,
  update(phi){const u=mod(phi,TAU)/TAU;const y=u<0.5?u*2:2-2*u;this.g={phi,y:y*150};},output(){return this.g.phi/TAU;},
  draw(){const g=this.g,O=[400,320],Pr=[400,120+g.y];ctx.beginPath();ctx.rect(340,40,120,90);paint(C.part2,C.ink);bar(400,Pr[1]-60,400,Pr[1]+40,12,C.part);
    const rp=48;drawGear(O[0],O[1],rp,16,g.phi,C['brass-fill'],{bore:5});for(const s of [-1,1]){ctx.beginPath();ctx.rect(O[0]+s*(rp+10)-6,Pr[1]+40,12,300);paint(C['steel-fill'],C.ink);}ctx.beginPath();ctx.rect(O[0]-rp-16,Pr[1]+30,2*rp+32,14);paint(C['steel-fill'],C.ink);pivot(O[0],O[1],5);
    label('A RACK ON EACH SIDE · the pinion turns once per stroke',400,500,'center');},
  reads(){return[['Per single stroke','one full turn']];}});

reg({num:351,outLabel:'Stamp height, mm',
  update(phi){const u=mod(phi,TAU)/TAU;const y=u<0.7?u/0.7*120:120*(1-smooth((u-0.7)/0.06));this.g={phi,y:Math.max(0,y)};},output(){return this.g.y;},
  draw(){const g=this.g,P=[320,220],X=430;drawGear(P[0],P[1],70,24,g.phi,C['brass-fill'],{bore:6});ctx.save();ctx.strokeStyle=C.sheet;ctx.lineWidth=22;ctx.beginPath();ctx.arc(P[0],P[1],70,g.phi+0.7*TAU,g.phi+TAU);ctx.stroke();ctx.restore();pivot(P[0],P[1],6);
    const yb=400-g.y;ctx.beginPath();ctx.rect(X-14,yb-330,28,330);paint(C['steel-fill'],C.ink);ctx.beginPath();ctx.rect(X-50,yb,100,50);paint(C['steel-fill'],C.ink);ctx.beginPath();ctx.rect(X-80,450,160,30);paint(C.part2,C.ink);label(g.y<5?'DROP':'LIFTING',X+90,yb+20);label('PART-TOOTHED PINION LIFTS THE RACK, THEN LETS IT FALL',400,505,'center');},
  reads(){return[['Stamp',`${this.g.y.toFixed(0)} mm`]];}});

reg({num:353,outLabel:'Hammer height, mm',
  update(phi){const u=mod(phi*3,TAU)/TAU;const lift=u<0.6?u/0.6:1-smooth((u-0.6)/0.08);this.g={phi,lift:Math.max(0,lift)};},output(){return this.g.lift*60;},
  draw(){const g=this.g,F=[400,260],a=-0.18*g.lift;const H=[F[0]-260*Math.cos(a),F[1]-260*Math.sin(a)*-1],T=[F[0]+150*Math.cos(a),F[1]+150*Math.sin(a)];
    ctx.save();ctx.translate(F[0],F[1]);ctx.rotate(a);ctx.beginPath();ctx.rect(-270,-10,420,20);paint(C['brass-fill'],C.ink);ctx.beginPath();ctx.rect(-300,-20,60,60);paint(C['steel-fill'],C.ink);ctx.restore();pivot(F[0],F[1],6);
    const W=[F[0]+60,F[1]+70];circ(W[0],W[1],40);paint(C.part,C.ink);for(let k=0;k<3;k++){const t=g.phi*3+k*TAU/3;bar(W[0],W[1],W[0]+58*Math.cos(t),W[1]+58*Math.sin(t),12,C.part2);}pivot(W[0],W[1],5);
    ctx.beginPath();ctx.rect(70,340,120,60);paint(C.part2,C.ink);label('WIPERS PRESS THE HELVE DOWN BEHIND THE PIVOT, THE HEAD RISES',400,480,'center');},
  reads(){return[['Head',`${(this.g.lift*60).toFixed(0)} mm up`],['Blows per wiper turn','3']];}});

reg({num:132,outLabel:'Lower disk drop, mm',concept:true,
  update(phi){const d=20*(1+Math.sin(phi))/2;this.g={phi,d};},output(){return this.g.d;},
  draw(){const g=this.g;ctx.beginPath();ctx.ellipse(400,180,170,40,0,0,TAU);paint(C['brass-fill'],C.ink);for(let k=0;k<6;k++){const t=g.phi+k*PI/3;if(Math.sin(t)>-0.3){const x=400+150*Math.cos(t);bar(x,180+30*Math.sin(t),x+20,260+g.d,8,C.part);}}
    ctx.beginPath();ctx.ellipse(400,270+g.d,170,40,0,0,TAU);paint(C['steel-fill'],C.ink);bar(400,40,400,180,14,C.part);label('TURNING THE UPPER DISK TILTS THE BARS UPRIGHT AND PRESSES DOWN',400,470,'center');},
  reads(){return[['Press stroke',`${this.g.d.toFixed(1)} mm`]];}});

reg({num:133,outLabel:'Platen drop, mm',
  update(phi){const a=0.6*(1-Math.cos(phi*0.5))/2;this.g={phi,a,d:a*90};},output(){return this.g.d;},
  draw(){const g=this.g,S=[300,180];drawGear(S[0]-130,S[1],40,14,-g.a*90/40*3,C['brass-fill'],{bore:5});ctx.beginPath();ctx.moveTo(S[0],S[1]);ctx.arc(S[0],S[1],90,PI-0.5+g.a,PI+0.5+g.a);ctx.closePath();paint(C['steel-fill'],C.ink);bar(S[0],S[1],S[0]+150*Math.cos(g.a),S[1]+150*Math.sin(g.a),14,C['steel-fill']);pivot(S[0],S[1],6);
    const E=[S[0]+150*Math.cos(g.a),S[1]+150*Math.sin(g.a)];bar(E[0],E[1],E[0],300+g.d,10,C.part);ctx.beginPath();ctx.rect(E[0]-80,300+g.d,160,30);paint(C['brass-fill'],C.ink);ctx.beginPath();ctx.rect(E[0]-100,420,200,30);paint(C.part2,C.ink);label('HAND CRANK, PINION AND SECTOR WORK THE PLATEN',400,495,'center');},
  reads(){return[['Platen',`${this.g.d.toFixed(0)} mm down`]];}});

reg({num:153,outLabel:'Bar position, mm',
  update(phi){const N=4,u=mod(phi*N,TAU)/TAU;const x=u<0.5?u*2:1-smooth((u-0.5)/0.2);this.g={phi,x:Math.max(0,x)*50};},output(){return this.g.x;},
  draw(){const g=this.g,O=[300,280];circ(O[0],O[1],110);paint(C['brass-fill'],C.ink);for(let k=0;k<4;k++){const t=g.phi+k*PI/2;circ(O[0]+95*Math.cos(t),O[1]+95*Math.sin(t),10);paint(C.part2,C.ink);}pivot(O[0],O[1],6);
    const X=O[0]+110+g.x;ctx.beginPath();ctx.rect(X,O[1]-14,180,28);paint(C['steel-fill'],C.ink);const B=[X+220,O[1]-60];bar(X+180,O[1],B[0],B[1]+60,8,C.part);bar(B[0],B[1]+60,B[0]+60,B[1],8,C.part);pivot(B[0],B[1]+60,5);springZ(B[0]+60,B[1],B[0]+60,B[1]-60);label('STUDS PUSH THE BAR · BELL CRANK RETURNS IT',400,480,'center');},
  reads(){return[['Strokes per turn','4']];}});
reg({num:154,outLabel:'Cord pull, mm',
  update(phi){const u=mod(phi*3,TAU)/TAU;const a=u<0.4?u/0.4:1-smooth((u-0.4)/0.25);this.g={phi,a:Math.max(0,a)*0.5};},output(){return this.g.a*200;},
  draw(){const g=this.g,O=[280,300],F=[440,180];circ(O[0],O[1],100);paint(C['brass-fill'],C.ink);for(let k=0;k<3;k++){const t=g.phi+k*TAU/3;circ(O[0]+85*Math.cos(t),O[1]+85*Math.sin(t),10);paint(C.part2,C.ink);}pivot(O[0],O[1],6);
    const a=g.a;const A1=[F[0]+120*Math.cos(PI*0.6+a),F[1]+120*Math.sin(PI*0.6+a)],A2=[F[0]+140*Math.cos(-0.1+a),F[1]+140*Math.sin(-0.1+a)];bar(F[0],F[1],A1[0],A1[1],12,C['steel-fill']);bar(F[0],F[1],A2[0],A2[1],12,C['steel-fill']);pivot(F[0],F[1],6);
    rope([[A2[0],A2[1]],[640,A2[1]],[640,330]]);pulley(640,A2[1]-10,0.1,0,C.part);weight(640,330,60,60,'');label('STUDS SWING THE BELL CRANK · the cord lifts the weight',400,490,'center');},
  reads(){return[['Bell crank',`${(this.g.a*180/PI).toFixed(0)}°`]];}});

reg({num:137,outLabel:'Valve position, mm',concept:true,params:[{id:'x',label:'Expansion setting',min:0.3,max:1,step:0.05,value:0.7,fmt:v=>`${Math.round(v*100)} %`}],
  update(phi){const e=40*this.P.x;this.g={phi,e,x:e*Math.cos(phi)};},output(){return this.g.x;},
  draw(){const g=this.g,O=[260,280];circ(O[0]+g.e*Math.cos(g.phi),O[1]+g.e*Math.sin(g.phi),80);paint(C['brass-fill'],C.ink);ctx.beginPath();ctx.rect(O[0]-g.e-10,O[1]-10,2*g.e+20,20);paint(C.part2,C.ink);pivot(O[0],O[1],6);
    const X=O[0]+g.e*Math.cos(g.phi)+80;bar(X,O[1]-30,560+g.x,O[1]-30,10,C.part);bar(X,O[1]+30,560+g.x,O[1]+30,10,C.part);ctx.beginPath();ctx.rect(560+g.x,O[1]-40,90,80);paint(C['steel-fill'],C.ink);ctx.beginPath();ctx.rect(540,O[1]+40,200,16);paint(C.part2,C.ink);
    label('SLIDE THE ECCENTRIC ACROSS THE SHAFT TO CHANGE ITS THROW',400,480,'center');},
  reads(){return[['Throw',`${this.g.e.toFixed(0)} mm`],['Cut-off','earlier with a shorter throw']];}});

/* ================= batch 3 · part 4: engines, valve gear, governors, rotary engines ================= */
const STEAM=()=>C['brass-fill'];
function steamBox(x,y,w,h,full){ctx.save();ctx.fillStyle=STEAM();ctx.globalAlpha=full?0.85:0.25;ctx.fillRect(x,y,w,h);ctx.restore();}

/* ---- piston engines ---- */
function pistonEngine(num,o){return reg({num,outLabel:'Crank turns',concept:!!o.concept,O:[560,270],r:65,L:210,
  update(phi){const O=this.O,pin=[O[0]+this.r*Math.cos(phi+PI),O[1]+this.r*Math.sin(phi+PI)];const x=pin[0]-Math.sqrt(this.L**2-(pin[1]-O[1])**2);this.g={phi,pin,x,out:Math.sin(phi+PI)<0};},output(){return this.g.phi/TAU;},
  draw(){const g=this.g,O=this.O,y=O[1],cx0=o.trunk?140:60,cw=o.trunk?300:260,px=o.trunk?g.x-15:g.x-220;flywheel(O[0],O[1],o.trunk?100:130,g.phi+PI);
    ctx.beginPath();ctx.rect(cx0,y-70,cw,140);ctx.rect(cx0+12,y-58,cw-24,116);paint(C.part2,C.ink);const pp=clamp(px,cx0+20,cx0+cw-50);steamBox(cx0+12,y-58,pp-cx0-12,116,g.out);steamBox(pp+30,y-58,cx0+cw-12-pp-30,116,!g.out);
    ctx.beginPath();ctx.rect(pp,y-56,30,112);paint(C['steel-fill'],C.ink);
    if(o.trunk){ctx.beginPath();ctx.rect(pp+30,y-22,cx0+cw-pp+20,44);paint(C.part,C.ink);bar(g.x,y,g.pin[0],g.pin[1],12,C.part);pivot(g.x,y,4);}
    else{bar(pp+30,y,g.x,y,10,C.part);ctx.beginPath();ctx.rect(g.x-22,y-22,44,44);paint(C['steel-fill'],C.ink);ctx.beginPath();ctx.rect(cx0+cw+20,y-34,200,8);ctx.rect(cx0+cw+20,y+26,200,8);paint(C.part2,C.ink);bar(g.x,y,g.pin[0],g.pin[1],12,C.part);}
    bar(O[0],O[1],g.pin[0],g.pin[1],18,C['brass-fill']);pivot(g.pin[0],g.pin[1],5);pivot(O[0],O[1],6);if(!o.trunk)pivot(g.x,y,4);
    label(g.out?'STEAM BEHIND THE PISTON':'STEAM IN FRONT OF THE PISTON',cx0+cw/2,y+96,'center');label(o.label,400,500,'center');},
  reads(){return[['Stroke',`${2*this.r} mm`],['Steam',this.g.out?'head end':'crank end'],['Crank',`${mod(this.g.phi*180/PI,360).toFixed(0)}°`]];}});}
pistonEngine(421,{trunk:true,label:'TRUNK ENGINE · the rod works inside a tube fixed to the piston'});
pistonEngine(469,{label:'HOT-AND-COLD AIR ENGINE IDEA (drawn as a simple cylinder and crank)',concept:true});

reg({num:341,outLabel:'Crank turns',concept:true,G:[150,180],O:[620,330],
  update(phi){const M=[330,200+60*Math.sin(phi)];const H=cc(this.G,120,M,140,-1);const E=[M[0]+(M[0]-H[0])*1.4,M[1]+(M[1]-H[1])*1.4];const B=cc(this.O,70,E,190,1);this.g={phi,M,H,E,B};},output(){return Math.atan2(this.g.B[1]-this.O[1],this.g.B[0]-this.O[0])/TAU;},
  draw(){const g=this.g;flywheel(this.O[0],this.O[1],120,Math.atan2(g.B[1]-this.O[1],g.B[0]-this.O[0]));ctx.beginPath();ctx.rect(270,300,120,170);paint(C.part2,C.ink);bar(g.M[0],g.M[1],g.M[0],340,10,C.part);
    bar(g.H[0],g.H[1],g.E[0],g.E[1],18,C['brass-fill']);bar(this.G[0],this.G[1],g.H[0],g.H[1],12,C.part2);bar(g.E[0],g.E[1],g.B[0],g.B[1],10,C.part);bar(this.O[0],this.O[1],g.B[0],g.B[1],16,C['brass-fill']);
    for(const p of [g.M,g.H,g.E,g.B])pivot(p[0],p[1],4.5);pivot(this.G[0],this.G[1],6);ground(this.G[0],this.G[1]+12,36);pivot(this.O[0],this.O[1],6);
    label('BEAM HUNG ON A ROCKING LINK',this.G[0]-10,this.G[1]-40);label('CYLINDER',330,490,'center');label('GRASSHOPPER BEAM ENGINE',560,40,'center');},
  reads(){return[['Beam end',`${(this.g.E[1]).toFixed(0)}`],['Layout','compact: no tall beam pillar']];}});

reg({num:342,outLabel:'Piston height, mm',
  update(phi){const a=0.28*Math.sin(phi);this.g={phi,a,down:Math.cos(phi)>0};},output(){return this.g.a*170;},
  draw(){const g=this.g,F=[400,140],R=170;ctx.beginPath();ctx.rect(F[0]-14,F[1],28,340);paint(C.part2,C.ink);ctx.save();ctx.translate(F[0],F[1]);ctx.rotate(g.a);ctx.beginPath();ctx.rect(-R,-12,2*R,24);paint(C['brass-fill'],C.ink);
    for(const s of [-1,1]){ctx.beginPath();ctx.arc(0,0,R,s>0?-0.18:PI-0.0,s>0?0.0:PI+0.18);ctx.lineWidth=10;ctx.strokeStyle=C.ink;ctx.stroke();}ctx.restore();pivot(F[0],F[1],7);
    const yL=F[1]+R*Math.sin(-g.a)*-1,yR=F[1]+R*Math.sin(g.a);const xL=F[0]-R,xR=F[0]+R;rope([[xL,F[1]-R*Math.sin(g.a)],[xL,300-R*Math.sin(g.a)*1]]);rope([[xR,F[1]+R*Math.sin(g.a)],[xR,330+R*Math.sin(g.a)]]);
    const py=300-R*Math.sin(g.a);ctx.beginPath();ctx.rect(xL-60,260,120,220);ctx.rect(xL-50,268,100,204);paint(C.part2,C.ink);steamBox(xL-50,py+20,100,472-py-20,!g.down);ctx.beginPath();ctx.rect(xL-50,py,100,20);paint(C['steel-fill'],C.ink);
    bar(xR,330+R*Math.sin(g.a),xR,480,8,C.part);label('CYLINDER',xL,500,'center');label('PUMP ROD',xR+14,470);label(g.down?'VACUUM BELOW · air pushes the piston down':'PUMP ROD WEIGHT LIFTS THE PISTON',400,40,'center');},
  reads(){return[['Stroke',this.g.down?'power (down)':'return (up)'],['Chains','hang from arch heads, so the rods pull straight']];}});

reg({num:347,outLabel:'Crank turns',concept:true,
  update(phi){this.g={phi};},output(){return this.g.phi/TAU;},
  draw(){const g=this.g,O=[400,270];circ(O[0],O[1],170);paint(C.part2,C.ink);circ(O[0],O[1],150);paint(C.sheet,C.ink);const t=0.45;ctx.save();ctx.translate(O[0],O[1]);ctx.beginPath();ctx.ellipse(0,0,150,150*Math.cos(t),g.phi,0,TAU);paint(C['steel-fill'],C.ink);ctx.restore();
    for(let k=0;k<4;k++){const a=g.phi+k*PI/2;const hi=Math.cos(a-g.phi)>0;}
    const P=[O[0]+90*Math.cos(g.phi+PI/2),O[1]+90*Math.sin(g.phi+PI/2)];bar(O[0],O[1],P[0],P[1],14,C['brass-fill']);pivot(P[0],P[1],5);pivot(O[0],O[1],10);
    label('WOBBLING DISK PISTON NODS ROUND · its spindle drives the crank',400,480,'center');},
  reads(){return[['Motion','disk nods, does not spin']];}});

reg({num:422,outLabel:'Crank turns',concept:true,
  update(phi){const O=[560,330],pin=[O[0]+60*Math.cos(phi),O[1]+60*Math.sin(phi)];const A=[250,330];const T=cc(A,200,pin,240,-1);this.g={phi,O,pin,A,T,th:Math.atan2(T[1]-A[1],T[0]-A[0])};},output(){return this.g.phi/TAU;},
  draw(){const g=this.g,A=g.A;ctx.beginPath();ctx.moveTo(A[0],A[1]);ctx.arc(A[0],A[1],180,-PI/2-0.9,-PI/2+0.9);ctx.closePath();paint(C.part2,C.ink);ctx.beginPath();ctx.moveTo(A[0],A[1]);ctx.arc(A[0],A[1],166,-PI/2-0.85,-PI/2+0.85);ctx.closePath();paint(C.sheet,C.ink);
    const v=-PI/2+(g.th+PI/2)*0.6;ctx.save();ctx.beginPath();ctx.moveTo(A[0],A[1]);ctx.arc(A[0],A[1],166,-PI/2-0.85,v);ctx.closePath();ctx.fillStyle=STEAM();ctx.globalAlpha=.6;ctx.fill();ctx.restore();
    bar(A[0],A[1],A[0]+166*Math.cos(v),A[1]+166*Math.sin(v),10,C['steel-fill']);bar(A[0],A[1],g.T[0],g.T[1],12,C.part);flywheel(g.O[0],g.O[1],90,g.phi);bar(g.T[0],g.T[1],g.pin[0],g.pin[1],10,C.part);bar(g.O[0],g.O[1],g.pin[0],g.pin[1],14,C['brass-fill']);
    pivot(A[0],A[1],6);pivot(g.T[0],g.T[1],4);pivot(g.pin[0],g.pin[1],4);label('SECTOR CYLINDER · the piston swings',A[0],A[1]+40,'center');},
  reads(){return[['Piston','swings about the sector centre']];}});

reg({num:423,outLabel:'Crank turns',concept:true,
  update(phi){const th=0.6*Math.sin(phi);this.g={phi,th};},output(){return this.g.phi/TAU;},
  draw(){const g=this.g,A=[300,280];for(const s of [-1,1]){ctx.beginPath();ctx.moveTo(A[0],A[1]);ctx.arc(A[0],A[1],170,s>0?-0.7:PI-0.7,s>0?0.7:PI+0.7);ctx.closePath();paint(C.part2,C.ink);ctx.beginPath();ctx.moveTo(A[0],A[1]);ctx.arc(A[0],A[1],158,s>0?-0.66:PI-0.66,s>0?0.66:PI+0.66);ctx.closePath();paint(C.sheet,C.ink);}
    for(const s of [0,PI]){const v=s+g.th;bar(A[0],A[1],A[0]+158*Math.cos(v),A[1]+158*Math.sin(v),12,C['steel-fill']);}
    const E=[A[0]+60*Math.cos(g.th-PI/2),A[1]+60*Math.sin(g.th-PI/2)],O=[600,170],pin=[O[0]+50*Math.cos(g.phi),O[1]+50*Math.sin(g.phi)];flywheel(O[0],O[1],80,g.phi);bar(E[0],E[1],pin[0],pin[1],10,C.part);bar(O[0],O[1],pin[0],pin[1],12,C['brass-fill']);pivot(A[0],A[1],7);pivot(E[0],E[1],4);
    label("ROOT'S DOUBLE-QUADRANT ENGINE",400,490,'center');},
  reads(){return[['Pistons','two, on one rocking shaft']];}});

reg({num:424,outLabel:'Crank turns',
  update(phi){this.g={phi,x:70*Math.cos(phi),y:70*Math.sin(phi)};},output(){return this.g.phi/TAU;},
  draw(){const g=this.g,O=[400,270];ctx.beginPath();ctx.rect(O[0]-180,O[1]-180,360,360);ctx.rect(O[0]-166,O[1]-166,332,332);paint(C.part2,C.ink);
    ctx.beginPath();ctx.rect(O[0]+g.x-16,O[1]-160,32,320);paint(C['steel-fill'],C.ink);ctx.beginPath();ctx.rect(O[0]-160,O[1]+g.y-16,320,32);paint(C['brass-fill'],C.ink,1);ctx.beginPath();ctx.rect(O[0]+g.x-16,O[1]-160,32,320);paint(null,C.ink);
    const pin=[O[0]+g.x,O[1]+g.y];bar(O[0],O[1],pin[0],pin[1],14,C.part);circ(pin[0],pin[1],10);paint(C.hi,C.ink);pivot(O[0],O[1],6);label("ROOT'S ENGINE · two pistons at right angles in one square cylinder",400,500,'center');},
  reads(){return[['Piston 1',`${this.g.x.toFixed(0)} mm`],['Piston 2',`${this.g.y.toFixed(0)} mm`]];}});

/* ---- rotary engines and pumps ---- */
function rotary(num,o){return reg({num,outLabel:'Rotor turns',concept:!!o.concept,
  update(phi){this.g={phi};},output(){return this.g.phi/TAU;},
  draw(){const g=this.g,O=[400,265],R=150;circ(O[0],O[1],R+18);paint(C.part2,C.ink);circ(O[0],O[1],R);paint(C.sheet,C.ink);
    if(o.kind==='eccentric'){const e=40,r=R-e,Pc=[O[0]+e*Math.cos(g.phi),O[1]+e*Math.sin(g.phi)];ctx.save();ctx.beginPath();circ(O[0],O[1],R,false);ctx.clip();ctx.fillStyle=STEAM();ctx.globalAlpha=.5;ctx.beginPath();ctx.moveTo(O[0],O[1]);ctx.arc(O[0],O[1],R,-PI/2,g.phi);ctx.closePath();ctx.fill();ctx.restore();
      circ(Pc[0],Pc[1],r);paint(C['steel-fill'],C.ink);const top=Pc[1]-Math.sqrt(r*r-(O[0]-Pc[0])**2);ctx.beginPath();ctx.rect(O[0]-10,top-80,20,80);paint(C['brass-fill'],C.ink);ctx.beginPath();ctx.rect(O[0]-18,O[1]-R-60,36,50);paint(C.part2,C.ink);bar(O[0],O[1],Pc[0],Pc[1],10,C.part);pivot(O[0],O[1],6);label('SLIDING ABUTMENT',O[0]+30,O[1]-R-30);}
    else if(o.kind==='lobes'){return;}
    else{const e=o.e??40,rr=o.rr||100,Rc=[O[0]+e,O[1]],N=o.N||2;circ(Rc[0],Rc[1],rr);paint(C['steel-fill'],C.ink);
      for(let k=0;k<N;k++){const a=g.phi+k*TAU/N,ux=Math.cos(a),uy=Math.sin(a),dx=Rc[0]-O[0],dy=Rc[1]-O[1],b=dx*ux+dy*uy,L=-b+Math.sqrt(b*b-(dx*dx+dy*dy-R*R));const p0=[Rc[0]+(rr-50)*ux,Rc[1]+(rr-50)*uy],p1=[Rc[0]+L*ux,Rc[1]+L*uy];
        ctx.save();ctx.fillStyle=STEAM();ctx.globalAlpha=.45;ctx.beginPath();ctx.moveTo(Rc[0]+rr*ux,Rc[1]+rr*uy);ctx.lineTo(p1[0],p1[1]);const a2=a-0.9;ctx.lineTo(O[0]+R*Math.cos(a2),O[1]+R*Math.sin(a2));ctx.lineTo(Rc[0]+rr*Math.cos(a2),Rc[1]+rr*Math.sin(a2));ctx.closePath();if(k===0)ctx.fill();ctx.restore();
        bar(p0[0],p0[1],p1[0],p1[1],12,C['brass-fill']);}
      if(o.abut){for(const s of [-1,1]){ctx.beginPath();ctx.rect(O[0]-12,O[1]+s*R-(s>0?30:0),24,30);paint(C.part2,C.ink);}}
      if(o.rollers){for(let k=0;k<6;k++){const a=k*PI/3;circ(O[0]+(R+8)*Math.cos(a),O[1]+(R+8)*Math.sin(a),8);paint(C.hi,C.ink);}ctx.save();ctx.strokeStyle=C.muted;ctx.lineWidth=5;ctx.beginPath();ctx.arc(O[0],O[1],R-3,0,TAU);ctx.stroke();ctx.restore();}
      pivot(Rc[0],Rc[1],6);}
    ctx.beginPath();ctx.rect(O[0]-R-60,O[1]-90,60,22);paint(C.part2,C.ink);label('STEAM IN',O[0]-R-60,O[1]-104);ctx.beginPath();ctx.rect(O[0]-R-60,O[1]+70,60,22);paint(C.part2,C.ink);label('EXHAUST',O[0]-R-60,O[1]+108);label(o.label,400,505,'center');},
  reads(){return[['Rotor',`${mod(this.g.phi*180/PI,360).toFixed(0)}°`],['Type',o.what]];}});}
rotary(425,{kind:'eccentric',label:'ECCENTRIC PISTON ROLLS ROUND PAST A SLIDING ABUTMENT',what:'eccentric piston'});
rotary(426,{e:0,rr:90,N:2,abut:true,label:'TWO SLIDING PISTONS PASS FIXED ABUTMENTS',what:'sliding pistons',concept:true});
rotary(427,{e:45,rr:100,N:2,label:'OFFSET SHAFT · pistons slide in and out',what:'offset rotor'});
rotary(428,{e:40,rr:100,N:2,rollers:true,label:'RUBBER LINING PRESSED ON BY ROLLERS',what:'flexible lining',concept:true});
rotary(455,{e:40,rr:100,N:4,label:'OLD ROTARY PUMP · sliding vanes',what:'vane pump'});
rotary(456,{e:30,rr:110,N:4,label:'SLIDING PISTONS FOLLOW A FIXED HEART CAM',what:'cam-guided vanes',concept:true});
noncirc(429,s=>{const a=95,b=55;return a*b/Math.sqrt((b*Math.cos(s))**2+(a*Math.sin(s))**2);},{label:"HOLLY'S ROTARY ENGINE · two geared elliptical pistons",concept:true});

/* ---- valve gear ---- */
reg({num:185,outLabel:'Valve position, mm',params:[{id:'p',label:'Reversing lever',min:-1,max:1,step:0.05,value:1,fmt:v=>v>0.9?'full forward':v<-0.9?'full back':Math.abs(v)<0.05?'mid gear':(v>0?'forward ':'back ')+Math.round(Math.abs(v)*100)+' %'}],
  update(phi){const e=40,lead=0.45,a1=phi+PI/2+lead,a2=phi-PI/2-lead;const x1=e*Math.cos(a1),x2=e*Math.cos(a2),p=this.P.p,v=((1+p)/2)*x1+((1-p)/2)*x2;this.g={phi,a1,a2,x1,x2,v,p};},output(){return this.g.v;},
  draw(){const g=this.g,O=[170,280],e=40,L=300;circ(O[0],O[1],60);paint(C.part,C.ink);
    const E1=[O[0]+e*Math.cos(g.a1),O[1]+e*Math.sin(g.a1)],E2=[O[0]+e*Math.cos(g.a2),O[1]+e*Math.sin(g.a2)];circ(E1[0],E1[1],52);paint(C['brass-fill'],C.ink,1);circ(E2[0],E2[1],52);paint(C['steel-fill'],C.ink,1);pivot(O[0],O[1],6);
    const lx=O[0]+L,T=[lx+g.x1,170],B=[lx+g.x2,390];bar(E1[0],E1[1],T[0],T[1],8,C['brass-fill']);bar(E2[0],E2[1],B[0],B[1],8,C['steel-fill']);
    ctx.beginPath();ctx.moveTo(T[0]-10,T[1]);ctx.quadraticCurveTo((T[0]+B[0])/2-30,280,B[0]-10,B[1]);ctx.lineTo(B[0]+10,B[1]);ctx.quadraticCurveTo((T[0]+B[0])/2-10,280,T[0]+10,T[1]);ctx.closePath();paint(C.part2,C.ink);
    const t=(1-g.p)/2,D=[T[0]+(B[0]-T[0])*t,T[1]+(B[1]-T[1])*t];ctx.beginPath();ctx.rect(D[0]-14,D[1]-10,28,20);paint(C.hi,C.ink);const V=[620+g.v,280];bar(D[0],D[1],V[0]-50,V[1],8,C.part);
    ctx.beginPath();ctx.rect(560,300,180,60);paint(C.part2,C.ink);ctx.beginPath();ctx.rect(V[0]-50,V[1]-20,100,40);paint(C['steel-fill'],C.ink);pivot(T[0],T[1],4);pivot(B[0],B[1],4);
    label('FORWARD ECCENTRIC',O[0]-60,O[1]-90);label('BACKWARD ECCENTRIC',O[0]-60,O[1]+100);label('SLOTTED LINK',lx+40,160);label('SLIDE VALVE',650,380,'center');label('Move the lever: forward, mid gear (little travel) or back',400,500,'center');},
  reads(){const g=this.g;return[['Lever',g.p>0.05?'forward':g.p<-0.05?'backward':'mid gear'],['Valve travel',`± ${Math.sqrt((((1+g.p)/2)*40)**2+(((1-g.p)/2)*40)**2+2*((1+g.p)/2)*((1-g.p)/2)*1600*Math.cos(PI+0.9)).toFixed(0)} mm`],['Valve now',`${g.v.toFixed(0)} mm`]];}});

function gab(num,o){return reg({num,outLabel:'Valve position, mm',concept:true,params:[{id:'e',type:'toggle',label:'Eccentric rod',options:[[1,'Engaged'],[0,'Lifted']],value:1}],
  update(phi){const x=40*Math.cos(phi);this.g={phi,x,v:this.P.e?x:0};},output(){return this.g.v;},
  draw(){const g=this.g,O=[180,300];circ(O[0]+40*Math.cos(g.phi),O[1]+40*Math.sin(g.phi),60);paint(C['brass-fill'],C.ink);pivot(O[0],O[1],6);const E=[O[0]+40*Math.cos(g.phi)+60,O[1]];const lift=this.P.e?0:40;
    const H=[480+g.x,O[1]-lift];bar(E[0],E[1],H[0],H[1],10,C.part);ctx.beginPath();ctx.moveTo(H[0]-10,H[1]-14);ctx.lineTo(H[0]+20,H[1]-14);ctx.lineTo(H[0]+20,H[1]+14);ctx.lineTo(H[0]+6,H[1]+14);ctx.lineTo(H[0]+6,H[1]-2);ctx.lineTo(H[0]-10,H[1]-2);ctx.closePath();paint(C.part,C.ink);
    const Pp=[480+g.v+14,O[1]];circ(Pp[0],Pp[1],6);paint(C.hi,C.ink);bar(Pp[0],Pp[1],Pp[0],O[1]+100,8,C['steel-fill']);ctx.beginPath();ctx.rect(Pp[0]-40,O[1]+100,80,30);paint(C['steel-fill'],C.ink);
    if(o.handle){bar(H[0]-80,H[1]-60,H[0]-40,H[1]-14,6,C.part2);springZ(H[0]-80,H[1]-60,H[0]-80,H[1]-120,6,5);}
    label(this.P.e?'HOOK ON THE PIN · eccentric drives the valve':'ROD LIFTED · valve free to be worked by hand',400,470,'center');label(o.label,400,495,'center');},
  reads(){return[['Rod',this.P.e?'engaged':'lifted'],['Valve',`${this.g.v.toFixed(0)} mm`]];}});}
gab(179,{label:'LIFTING THE ECCENTRIC ROD FREES THE VALVE FOR REVERSING'});gab(186,{handle:true,label:'SPRING HANDLE DISENGAGES THE ROD'});gab(187,{handle:true,label:'VARIANT OF 186'});gab(188,{handle:true,label:'VARIANT OF 186'});gab(189,{handle:true,label:'VARIANT OF 186'});

function tripGear(num,o){return reg({num,outLabel:'Piston position, mm',concept:true,
  reset(){this.v=1;},
  update(phi){const x=150*Math.sin(phi);const u=mod(phi,TAU)/TAU;this.v=(u>0.25&&u<0.75)?-1:1;this.g={phi,x};},output(){return this.g.x;},
  draw(){const g=this.g,y=330,X=400+g.x;ctx.beginPath();ctx.rect(160,y-60,480,120);ctx.rect(170,y-50,460,100);paint(C.part2,C.ink);steamBox(170,y-50,X-180,100,this.v<0);steamBox(X+10,y-50,630-X-10,100,this.v>0);
    ctx.beginPath();ctx.rect(X-10,y-50,20,100);paint(C['steel-fill'],C.ink);bar(X,y,X+0,y-180,8,C.part);bar(X-60,y-180,X+60,y-180,10,C['brass-fill']);
    for(const s of [-1,1]){const x=400+s*170;ctx.beginPath();if(o.quad){ctx.moveTo(x,140);ctx.arc(x,140,40,s>0?PI*0.5:PI*0.5,s>0?PI*0.5+0.6*s*this.v:PI*0.5-0.6*this.v,s<0);ctx.closePath();}else{ctx.save();ctx.translate(x,130);ctx.rotate(this.v*0.4*s);ctx.rect(-6,-10,12,50);ctx.restore();}paint(C.part,C.ink);pivot(x,130,4);}
    for(const s of [-1,1]){const open=(s>0)===(this.v>0);ctx.beginPath();ctx.rect(400+s*230-20,y-90,40,30);paint(open?STEAM():C.part,C.ink);}
    label(o.label,400,40,'center');label('the tappet on the piston rod trips the valves at each end',400,480,'center');},
  reads(){return[['Steam to',this.v>0?'left side':'right side']];}});}
tripGear(181,{label:'DIAGONAL CATCH VALVE GEAR'});tripGear(182,{label:'DIAGONAL CATCH (HAND GEAR)'});tripGear(183,{quad:true,label:'QUADRANT VALVE GEAR'});tripGear(184,{quad:true,label:'QUADRANT VALVE GEAR, VARIANT'});
aliasObj(171,SIMS_NEW[344],{concept:true});

/* ---- governors ---- */
function gov(num,o){return reg({num,outLabel:'Sleeve height, mm',concept:!!o.concept,params:[{id:'s',label:'Engine speed',min:0,max:100,step:1,value:60,fmt:v=>v+' %'}],X:o.X||360,top:110,L:120,
  update(phi){const th=(15+45*this.P.s/100)*PI/180;const L=this.L,T=this.top;let sy;if(o.kind==='crossed')sy=T+L*Math.cos(th)+90-Math.sqrt(Math.max(0,60*60-(L/2*Math.sin(th))**2))*0;else sy=T+L/2*Math.cos(th)+Math.sqrt(Math.max(0,70*70-(L/2*Math.sin(th))**2));this.g={phi,th,sy:o.kind==='crossed'?T+40+L*(1-Math.cos(th))*1.6:sy};},
  output(){return 320-this.g.sy;},
  draw(){const g=this.g,X=this.X,T=this.top,L=this.L;ctx.beginPath();ctx.rect(X-6,T-30,12,360);paint(C.part,C.ink);
    const balls=[0,1].map(k=>{const a=g.phi+k*PI,R=L*Math.sin(g.th);return{a,x:X+R*Math.cos(a),z:Math.sin(a),y:T+L*Math.cos(g.th)};}).sort((a,b)=>a.z-b.z);
    for(const b of balls){ctx.save();ctx.globalAlpha=b.z<0?.55:1;const px=o.kind==='crossed'?X-(b.x-X)*0.15:X;bar(px,T,b.x,b.y,6,C.part2);bar((X+b.x)/2,(T+b.y)/2,X,g.sy,5,C.part);
      if(o.kind==='spring')springZ(b.x,b.y,X,g.sy+10,8,4);if(o.kind==='incline'){ctx.beginPath();ctx.moveTo(X,g.sy+40);ctx.lineTo(b.x+(b.x>X?30:-30),b.y-20);paint(null,C.ink,3);}
      if(o.kind==='gyro'){ctx.beginPath();ctx.ellipse(b.x,b.y,8,24,0,0,TAU);paint(C['brass-fill'],C.ink);}else{circ(b.x,b.y,20+4*b.z);paint(C['brass-fill'],C.ink);}ctx.restore();}
    ctx.beginPath();ctx.rect(X-16,g.sy-8,32,24);paint(C['steel-fill'],C.ink);const open=clamp((g.sy-210)/90,0,1);
    if(o.out==='belt'){const p=Math.round((1-open)*2);for(let k=0;k<3;k++){drumH(560+k*70,400,56,30,g.phi*(0.6+0.3*k),k===p?C['steel-fill']:C.part);}bar(X+16,g.sy+4,560+p*70,g.sy+4,6,C.part);ctx.beginPath();ctx.rect(560+p*70-26,300,52,60);paint(null,C.ink,2);label('BELT SHIFTED TO SET THE GATE',630,460,'center');}
    else if(o.out==='gate'){bar(X+16,g.sy+4,560,g.sy+4,6,C.part);drawGear(600,g.sy+4,30,12,g.phi*(open-0.5)*2,C['brass-fill'],{bore:4});water(640,380,140,100);ctx.beginPath();ctx.rect(640,300+open*60,30,120);paint(C['steel-fill'],C.ink);label('WATER GATE',705,290,'center');}
    else{bar(X+12,g.sy+4,560,300+(g.sy-300)*0.6,6,C['steel-fill']);pivot(470,300+(g.sy-300)*0.3,4);ctx.beginPath();ctx.rect(560,360,180,50);ctx.rect(560,368,180,34);paint(C.part2,C.ink);ctx.save();ctx.translate(650,385);ctx.rotate(-PI/2+open*PI/2);ctx.beginPath();ctx.rect(-3,-17,6,34);paint(C.steel,C.ink);ctx.restore();bar(560,300+(g.sy-300)*0.6,650,385,4,C.part);label('THROTTLE',650,430,'center');}
    label(o.label,400,500,'center');},
  reads(){const g=this.g;return[['Ball angle',`${(g.th*180/PI).toFixed(0)}°`],['Sleeve',`${(320-g.sy).toFixed(0)} mm`],['Rule','faster spin, less steam or water']];}});}
gov(147,{kind:'incline',label:'ROLLERS RUN UP INCLINED PLANES AS SPEED RISES',concept:true});
gov(162,{out:'gate',label:'GOVERNOR SETS THE WATER GATE THROUGH BEVEL GEARS',concept:true});
gov(163,{out:'belt',label:'GOVERNOR SHIFTS A BELT AMONG THREE PULLEYS',concept:true});
gov(170,{kind:'crossed',label:'CROSSED ARMS LINKED TO THE VALVE ROD',concept:true});
gov(274,{label:'BALLS GUIDED · SLEEVE SLIDES ON THE SPINDLE'});
gov(287,{kind:'spring',label:'SPRINGS INSTEAD OF WEIGHT RESIST THE BALLS'});
gov(357,{kind:'gyro',label:'SPINNING WHEELS TILT AS THE SPEED RISES',concept:true});

function gyro(num,o){return reg({num,outLabel:'Precession angle, degrees',concept:true,
  update(phi){this.g={phi,p:phi*0.25,spin:phi*6};},output(){return mod(this.g.p*180/PI,360);},
  draw(){const g=this.g,P=[400,o.gimbal?270:200];const ax=[Math.cos(g.p),Math.sin(g.p)*0.35];
    if(o.gimbal){ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=8;ctx.beginPath();ctx.ellipse(P[0],P[1],170,170,0,0,TAU);ctx.stroke();ctx.strokeStyle=C.part2;ctx.lineWidth=5;ctx.stroke();ctx.strokeStyle=C.ink;ctx.lineWidth=8;ctx.beginPath();ctx.ellipse(P[0],P[1],140*Math.abs(Math.cos(g.phi*0.3))+8,140,0,0,TAU);ctx.stroke();ctx.strokeStyle=C['brass-fill'];ctx.lineWidth=5;ctx.stroke();ctx.restore();
      ctx.beginPath();ctx.ellipse(P[0],P[1],90,24,0,0,TAU);paint(C['steel-fill'],C.ink);bar(P[0],P[1]-130,P[0],P[1]+130,6,C.part);label('AXLE KEEPS ITS DIRECTION WHILE THE FRAME TURNS',400,480,'center');}
    else{bar(P[0],P[1],P[0],460,10,C.part);ctx.beginPath();ctx.rect(P[0]-50,460,100,20);paint(C.part2,C.ink);const W=[P[0]+150*ax[0],P[1]+150*ax[1]];bar(P[0],P[1],W[0],W[1],6,C.part);
      ctx.save();ctx.translate(W[0],W[1]);ctx.beginPath();ctx.ellipse(0,0,Math.max(10,70*Math.abs(Math.sin(g.p))),70,0,0,TAU);paint(C['steel-fill'],C.ink);ctx.restore();pivot(P[0],P[1],6);label('THE SPINNING WHEEL SWINGS ROUND INSTEAD OF FALLING',400,500,'center');}},
  reads(){return[['Spin','fast'],['Precession',`${mod(this.g.p*180/PI,360).toFixed(0)}°`]];}});}
gyro(355,{});gyro(356,{gimbal:true});

/* ---- hammers ---- */
function airHammer(num,o){return reg({num,outLabel:'Hammer height, mm',concept:true,
  update(phi){const y=60*(1+Math.sin(phi))/2+10;this.g={phi,y,up:Math.cos(phi)>0};},output(){return this.g.y;},
  draw(){const g=this.g,X=420;ctx.beginPath();ctx.rect(X-60,80,120,260);ctx.rect(X-50,90,100,240);paint(C.part2,C.ink);const hy=320-g.y;steamBox(X-50,90,100,hy-90,!g.up);ctx.beginPath();ctx.rect(X-50,hy,100,20);paint(C['steel-fill'],C.ink);bar(X,hy+20,X,400-g.y,16,C.part);ctx.beginPath();ctx.rect(X-60,400-g.y,120,50);paint(C['steel-fill'],C.ink);ctx.beginPath();ctx.rect(X-90,460,180,30);paint(C.part2,C.ink);
    if(o.pump){const O=[180,250],pin=[O[0]+40*Math.cos(g.phi),O[1]+40*Math.sin(g.phi)];flywheel(O[0],O[1],70,g.phi);const py=pin[1]-Math.sqrt(140*140-(265-pin[0])**2);ctx.beginPath();ctx.rect(240,50,50,210);paint(C.part2,C.ink);ctx.beginPath();ctx.rect(242,py-10,46,14);paint(C['steel-fill'],C.ink);bar(pin[0],pin[1],265,py,8,C.part);pivot(pin[0],pin[1],4);rope([[290,70],[X-60,100]]);label('PUMP AND RESERVOIR',220,340,'center');}
    label(o.label,400,30,'center');},
  reads(){return[['Stroke',this.g.up?'lifting':'falling']];}});}
airHammer(471,{label:'ATMOSPHERIC HAMMER'});airHammer(472,{pump:true,label:'AIR HAMMER FED BY A CRANK-DRIVEN PUMP'});

/* ================= batch 3 · part 5: water, pumps, steam, gas ================= */
function dashFlow(pts,phi,w=4){ctx.save();ctx.strokeStyle=C.steel;ctx.lineWidth=w;ctx.setLineDash([10,12]);ctx.lineDashOffset=-phi*30;ctx.beginPath();ctx.moveTo(...pts[0]);for(const p of pts.slice(1))ctx.lineTo(...p);ctx.stroke();ctx.restore();}
function steamFlow(pts,phi){ctx.save();ctx.strokeStyle=C.brass;ctx.lineWidth=3;ctx.setLineDash([6,10]);ctx.lineDashOffset=-phi*40;ctx.beginPath();ctx.moveTo(...pts[0]);for(const p of pts.slice(1))ctx.lineTo(...p);ctx.stroke();ctx.restore();}
function valveFlap(x,y,w,open,dir=1){ctx.save();ctx.translate(x,y);ctx.rotate(open?-0.8*dir:0);ctx.beginPath();ctx.rect(0,-3,w,6);paint(C.steel,C.ink);ctx.restore();}

/* ---- water wheels and turbines ---- */
reg({num:432,outLabel:'Wheel turns',
  update(phi){this.g={phi:phi*0.5};},output(){return this.g.phi/TAU;},
  draw(){const g=this.g,Cc=[440,250],R=170,n=20;water(40,236,250,30);ctx.save();ctx.fillStyle=C['steel-fill'];ctx.beginPath();ctx.moveTo(40,470);ctx.lineTo(40,266);ctx.lineTo(270,266);ctx.quadraticCurveTo(270,420,440,425);ctx.lineTo(760,425);ctx.lineTo(760,470);ctx.closePath();ctx.globalAlpha=.4;ctx.fill();ctx.restore();
    ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=3;ctx.beginPath();ctx.arc(Cc[0],Cc[1],R+6,PI*0.55,PI*0.98);ctx.stroke();ctx.restore();
    circ(Cc[0],Cc[1],R);circ(Cc[0],Cc[1],R-30,false);paint(C.part,C.ink);for(let k=0;k<8;k++){const a=g.phi*-1+k*PI/4;bar(Cc[0],Cc[1],Cc[0]+(R-30)*Math.cos(a),Cc[1]+(R-30)*Math.sin(a),8,C.part2);}
    for(let k=0;k<n;k++){const a=-g.phi+k*TAU/n,x=Cc[0]+R*Math.cos(a),y=Cc[1]+R*Math.sin(a);ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.beginPath();ctx.moveTo(-30,0);ctx.lineTo(0,10);paint(null,C.ink,2.5);const am=mod(a,TAU);if(am>PI*0.55&&am<PI*1.0){ctx.beginPath();ctx.rect(-28,-6,26,14);ctx.fillStyle=C['steel-fill'];ctx.fill();}ctx.restore();}
    pivot(Cc[0],Cc[1],8);dashFlow([[60,250],[262,250]],g.phi*2);label('WATER ENTERS AT AXLE HEIGHT',150,220,'center');label('BREAST WALL',230,400);},
  reads(){return[['Water enters','at mid-height'],['Efficiency','between overshot and undershot']];}});

reg({num:433,outLabel:'Wheel turns',concept:true,
  update(phi){this.g={phi:phi*0.4};},output(){return this.g.phi/TAU;},
  draw(){const g=this.g,O=[400,280],R=170,n=18;circ(O[0],O[1],R+14);circ(O[0],O[1],R-34,false);paint(C.part,C.ink);
    for(let k=0;k<n;k++){const a=g.phi+k*TAU/n;ctx.save();ctx.translate(O[0],O[1]);ctx.rotate(a);ctx.beginPath();ctx.moveTo(R-34,0);ctx.lineTo(R+14,-14);paint(null,C.ink,2.5);ctx.restore();const am=mod(a,TAU);if(am>PI*1.3&&am<PI*1.95){ctx.save();ctx.translate(O[0],O[1]);ctx.rotate(a);ctx.beginPath();ctx.moveTo(R-30,-2);ctx.lineTo(R+10,-14);ctx.lineTo(R+10,-2);ctx.closePath();ctx.fillStyle=C['steel-fill'];ctx.fill();ctx.restore();}}
    circ(O[0],O[1],R-34);paint(C.part2,C.ink);pivot(O[0],O[1],8);ctx.beginPath();ctx.rect(O[0]-30,40,60,80);paint(C['steel-fill'],C.ink);dashFlow([[O[0],60],[O[0],O[1]-R+10]],g.phi*3);label('SEEN FROM ABOVE · water falls into the buckets on one side',400,500,'center');},
  reads(){return[['Axis','vertical'],['Drive','weight of water in the buckets']];}});

function turbine(num,o){return reg({num,outLabel:'Runner turns',concept:o.concept!==false,
  update(phi){this.g={phi};},output(){return this.g.phi/TAU;},
  draw(){const g=this.g,O=[400,265];
    if(o.kind==='axial'){const y0=180,y1=330;ctx.beginPath();ctx.rect(120,y0-20,560,20);ctx.rect(120,y1,560,20);paint(C.part2,C.ink);for(let i=0;i<14;i++){const x=130+i*40;ctx.save();ctx.translate(x,y0+30);ctx.rotate(-0.6);ctx.beginPath();ctx.rect(-4,-22,8,44);paint(C.part,C.ink);ctx.restore();}
      for(let i=0;i<14;i++){const x=120+mod(i*40+g.phi*40,560);ctx.save();ctx.translate(x,y0+100);ctx.rotate(0.6);ctx.beginPath();ctx.rect(-4,-26,8,52);paint(C['steel-fill'],C.ink);ctx.restore();}
      ctx.beginPath();ctx.rect(120,y0+66,560,4);paint(C.part2,C.ink);for(let k=0;k<5;k++)dashFlow([[160+k*110,60],[160+k*110,480]],g.phi*2,3);label('FIXED GUIDES',700,y0+30);label('RUNNER',700,y0+100);label('JONVAL TURBINE · water flows down through the blades (unrolled view)',400,505,'center');return;}
    const Rin=o.kind==='out'?70:130,Rout=o.kind==='out'?130:200,Gin=o.kind==='out'?20:200,Gout=o.kind==='out'?70:250;
    if(o.kind==='volute'){ctx.beginPath();for(let i=0;i<=200;i++){const t=i/200*TAU*0.95,r=150+70*t/TAU;const x=O[0]+r*Math.cos(t-PI/2),y=O[1]+r*Math.sin(t-PI/2);i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.lineTo(O[0]+220*Math.cos(-PI/2)+80,O[1]-220);ctx.lineTo(O[0]-0,O[1]-150);ctx.closePath();paint(C['steel-fill'],C.ink);circ(O[0],O[1],150);paint(C.sheet,C.ink);}
    else{circ(O[0],O[1],Gout);circ(O[0],O[1],Gin,false);paint(C.part2,C.ink);for(let k=0;k<16;k++){const a=k*TAU/16;ctx.save();ctx.translate(O[0],O[1]);ctx.rotate(a);ctx.beginPath();ctx.moveTo(Gin,0);ctx.quadraticCurveTo((Gin+Gout)/2,(o.kind==='out'?-1:1)*12,Gout,(o.kind==='out'?-1:1)*30);paint(null,C.ink,2);ctx.restore();}}
    const ri=o.kind==='volute'?50:Rin,ro=o.kind==='volute'?140:Rout;circ(O[0],O[1],ro);circ(O[0],O[1],ri,false);paint(C['brass-fill'],C.ink);
    for(let k=0;k<20;k++){const a=g.phi*(o.kind==='out'?1:1)+k*TAU/20;ctx.save();ctx.translate(O[0],O[1]);ctx.rotate(a);ctx.beginPath();ctx.moveTo(ri,0);ctx.quadraticCurveTo((ri+ro)/2,(o.kind==='out'?1:-1)*16,ro,(o.kind==='out'?1:-1)*44);paint(null,C.ink,2.5);ctx.restore();}
    circ(O[0],O[1],ri-10);paint(C.part,C.ink);pivot(O[0],O[1],7);
    for(let k=0;k<6;k++){const a=k*TAU/6+g.phi*0.0;const r0=o.kind==='out'?30:250,r1=o.kind==='out'?240:60;dashFlow([[O[0]+r0*Math.cos(a),O[1]+r0*Math.sin(a)],[O[0]+r1*Math.cos(a+0.5),O[1]+r1*Math.sin(a+0.5)]],g.phi*2,2);}
    label(o.label,400,505,'center');},
  reads(){return[['Flow',{out:'outward from the centre',in:'inward from the rim',volute:'round a scroll case, then inward',axial:'straight down through the blades'}[o.kind]],['Runner',`${mod(this.g.phi*180/PI,360).toFixed(0)}°`]];}});}
turbine(434,{kind:'out',label:'FOURNEYRON · fixed guides inside, runner outside, water flows outward'});
turbine(435,{kind:'in',label:'INWARD-FLOW TURBINE · guides outside, runner inside'});
turbine(436,{kind:'axial'});
turbine(437,{kind:'volute',label:'VOLUTE CASE FEEDS THE WHEEL ALL ROUND'});

reg({num:441,outLabel:'Wheel turns',concept:true,
  update(phi){this.g={phi:phi*0.4};},output(){return this.g.phi/TAU;},
  draw(){const g=this.g,O=[400,250],R=170;water(0,330,800,190);flowLines(340,510,g.phi,1);circ(O[0],O[1],R);circ(O[0],O[1],R-16,false);paint(C.part,C.ink);
    for(let k=0;k<8;k++){const a=-g.phi+k*PI/4;const P=[O[0]+R*Math.cos(a),O[1]+R*Math.sin(a)];bar(O[0],O[1],P[0],P[1],8,C.part2);ctx.save();ctx.translate(P[0],P[1]);ctx.rotate(a);ctx.beginPath();ctx.arc(0,0,22,PI*0.5,PI*1.5);paint(C['steel-fill'],C.ink);ctx.restore();}
    circ(O[0],O[1],24);paint(C['steel-fill'],C.ink);ctx.beginPath();ctx.rect(O[0],O[1]-10,320,20);paint(C['steel-fill'],C.ink);dashFlow([[O[0],O[1]],[720,O[1]],[720,O[1]+50]],g.phi*2,4);label('CURRENT TURNS THE WHEEL · scoops lift water into the hollow axle',400,40,'center');},
  reads(){return[['Driven by','the stream itself']];}});

reg({num:484,outLabel:'Cylinder turns',concept:true,
  update(phi){this.g={phi};},output(){return this.g.phi/TAU;},
  draw(){const g=this.g,y=260;flowLines(170,350,g.phi,1);ctx.beginPath();ctx.rect(160,y-60,480,120);paint(C.part,C.ink);ctx.save();ctx.beginPath();ctx.rect(160,y-80,480,160);ctx.clip();ctx.strokeStyle=C.ink;ctx.fillStyle=C['brass-fill'];for(let k=-6;k<16;k++){const x0=160+k*60+mod(g.phi*60/TAU*2,60);ctx.beginPath();ctx.moveTo(x0,y-80);ctx.lineTo(x0+40,y+80);ctx.lineTo(x0+52,y+80);ctx.lineTo(x0+12,y-80);ctx.closePath();ctx.fill();ctx.stroke();}ctx.restore();
    bar(80,y,160,y,12,C.part2);bar(640,y,720,y,12,C.part2);label('SPIRAL BLADE ROUND A CYLINDER · turned by wind or water',400,470,'center');},
  reads(){return[['Axis','along the flow']];}});

reg({num:439,outLabel:'Bucket angle, degrees',
  update(phi){const u=mod(phi,TAU)/TAU;let a,f;if(u<0.7){f=u/0.7;a=0;}else if(u<0.8){f=1-(u-0.7)/0.1;a=-1.6*smooth((u-0.7)/0.06);}else{f=0;a=-1.6*(1-smooth((u-0.8)/0.2));}this.g={phi,a,f};},output(){return this.g.a*180/PI;},
  draw(){const g=this.g,P=[400,240];ctx.save();ctx.translate(P[0],P[1]);ctx.rotate(g.a);ctx.beginPath();ctx.moveTo(-90,-80);ctx.lineTo(90,-80);ctx.lineTo(70,60);ctx.lineTo(-70,60);ctx.closePath();paint(C.part,C.ink);ctx.save();ctx.beginPath();ctx.moveTo(-90,-80);ctx.lineTo(90,-80);ctx.lineTo(70,60);ctx.lineTo(-70,60);ctx.closePath();ctx.clip();ctx.fillStyle=C['steel-fill'];ctx.fillRect(-90,60-140*g.f,180,140*g.f);ctx.restore();
    bar(0,60,0,140,8,C.part2);weight(0,140,50,40,'');ctx.restore();pivot(P[0],P[1],7);ground(P[0],P[1]+12,40);dashFlow([[400,40],[400,150]],g.phi*3,4);label(g.f>0.95?'FULL · tips over':'FILLING',560,200);},
  reads(){return[['Fill',`${(this.g.f*100).toFixed(0)} %`],['Motion','to and fro, once per filling']];}});

reg({num:463,outLabel:'Water level, mm',
  update(phi){const u=mod(phi,TAU)/TAU;const lvl=u<0.75?u/0.75:1-(u-0.75)/0.25;this.g={phi,lvl,open:u>=0.75};},output(){return this.g.lvl*100;},
  draw(){const g=this.g,y0=420-g.lvl*200;water(60,y0,340,420-y0);ctx.beginPath();ctx.rect(400,180,20,240);paint(C.part2,C.ink);ctx.save();ctx.translate(410,420);ctx.rotate(g.open?-1.1:0);ctx.beginPath();ctx.rect(-6,-200,12,200);paint(C['steel-fill'],C.ink);ctx.restore();water(420,400,380,20);if(g.open)dashFlow([[380,410],[600,410]],g.phi*3,6);
    pivot(410,420,6);label(g.open?'LEAF TIPS · flood scours the sediment':'WATER RISING BEHIND THE LEAF',560,140);},
  reads(){return[['Level',`${(this.g.lvl*100).toFixed(0)} %`],['Leaf',this.g.open?'tipped':'upright']];}});

reg({num:447,outLabel:'Boat position, degrees',
  update(phi){const a=0.7*Math.sin(phi*0.4);this.g={phi,a};},output(){return this.g.a*180/PI;},
  draw(){const g=this.g,A=[400,40];water(0,120,800,300);flowLines(130,410,g.phi,1);ctx.save();ctx.fillStyle=C.part2;ctx.fillRect(0,80,800,40);ctx.fillRect(0,420,800,40);ctx.restore();
    const B=[A[0]+300*Math.sin(g.a),A[1]+300*Math.cos(g.a)];for(let k=1;k<4;k++){const t=k/4;circ(A[0]+300*Math.sin(g.a)*t,A[1]+300*Math.cos(g.a)*t,6);paint(C.part,C.ink);}rope([A,B]);
    ctx.save();ctx.translate(B[0],B[1]);ctx.rotate(-g.a+0.4*Math.sign(Math.cos(g.phi*0.4)));ctx.beginPath();ctx.ellipse(0,0,24,60,0,0,TAU);paint(C['brass-fill'],C.ink);ctx.restore();pivot(A[0],A[1],6);label('ANCHOR UPSTREAM',A[0]+14,A[1]+10);label('RIVER FLOWS DOWN THE PAGE · the slanted hull is pushed across',400,500,'center');},
  reads(){return[['Boat',`${(this.g.a*180/PI).toFixed(0)}° from midstream`],['Power','the current alone']];}});

reg({num:468,outLabel:'Pipe laid, %',concept:true,
  update(phi){const u=mod(phi*0.3,TAU)/TAU;this.g={phi,u};},output(){return this.g.u*100;},
  draw(){const g=this.g;water(0,140,800,200);ctx.save();ctx.fillStyle=C.part2;ctx.beginPath();ctx.moveTo(0,140);ctx.lineTo(80,140);ctx.quadraticCurveTo(400,560,720,140);ctx.lineTo(800,140);ctx.lineTo(800,520);ctx.lineTo(0,520);ctx.closePath();ctx.fill();ctx.restore();
    const n=12,laid=Math.floor(g.u*n);let prev=[80,130];for(let k=0;k<n;k++){const t=(k+1)/n,bed=[80+640*t,140+2*(1-t)*t*420-10];const p=k<laid?bed:[prev[0]+50,prev[1]];bar(prev[0],prev[1],p[0],p[1],14,C['steel-fill']);circ(p[0],p[1],9);paint(C.part,C.ink);prev=p;if(k>=laid)break;}
    label('BALL-JOINTED PIPE SETTLES TO THE RIVER BED AS IT IS PAID OUT',400,40,'center');},
  reads(){return[['Joints','ball and socket'],['Laid',`${(this.g.u*100).toFixed(0)} %`]];}});

reg({num:460,outLabel:'Scoop angle, degrees',
  update(phi){const a=0.6*Math.sin(phi);this.g={phi,a,lift:Math.cos(phi)<0};},output(){return this.g.a*180/PI;},
  draw(){const g=this.g,F=[420,200];water(0,380,330,140);water(520,250,280,270);ctx.beginPath();ctx.rect(330,260,190,260);paint(C.part2,C.ink);
    ctx.save();ctx.translate(F[0],F[1]);ctx.rotate(g.a);ctx.beginPath();ctx.moveTo(-220,170);ctx.lineTo(0,0);ctx.lineTo(30,-20);ctx.lineTo(10,20);ctx.lineTo(-200,200);ctx.closePath();paint(C['steel-fill'],C.ink);ctx.restore();pivot(F[0],F[1],7);
    const O=[650,90],pin=[O[0]+40*Math.cos(g.phi),O[1]+40*Math.sin(g.phi)];flywheel(O[0],O[1],60,g.phi);bar(pin[0],pin[1],F[0]+60*Math.cos(g.a-0.6),F[1]+60*Math.sin(g.a-0.6),8,C.part);label('ENGINE-DRIVEN SCOOP LIFTS WATER OVER THE BANK',400,505,'center');},
  reads(){return[['Scoop',`${(this.g.a*180/PI).toFixed(0)}°`]];}});

reg({num:461,outLabel:'Gutter angle, degrees',concept:true,
  update(phi){this.g={phi,a:0.35*Math.sin(phi)};},output(){return this.g.a*180/PI;},
  draw(){const g=this.g;water(0,440,800,80);for(let k=0;k<3;k++){const P=[220+k*180,380-k*110],s=k%2?-1:1;ctx.save();ctx.translate(P[0],P[1]);ctx.rotate(g.a*s);ctx.beginPath();ctx.rect(-110,-10,220,20);paint(C['steel-fill'],C.ink);ctx.beginPath();ctx.moveTo(-110,-10);ctx.lineTo(-130,-40);ctx.lineTo(-110,10);paint(C['steel-fill'],C.ink);ctx.restore();pivot(P[0],P[1],5);}
    label('SWINGING GUTTERS PASS WATER UP STEP BY STEP',400,40,'center');},
  reads(){return[['Gutters','rock together, alternate tilt']];}});

reg({num:459,outLabel:'Bucket height, mm',concept:true,
  update(phi){const u=mod(phi*0.4,TAU)/TAU;const h=u<0.5?u*2:2-2*u;this.g={phi,h};},output(){return this.g.h*200;},
  draw(){const g=this.g,D=[400,120];pulley(D[0],D[1],60,g.phi,C['brass-fill']);const yl=180+g.h*240,yr=420-g.h*240;rope([[D[0]-60,D[1]],[D[0]-60,yl]]);rope([[D[0]+60,D[1]],[D[0]+60,yr]]);for(const [x,y] of [[D[0]-60,yl],[D[0]+60,yr]]){ctx.beginPath();ctx.moveTo(x-30,y);ctx.lineTo(x+30,y);ctx.lineTo(x+24,y+50);ctx.lineTo(x-24,y+50);ctx.closePath();paint(C['steel-fill'],C.ink);}
    water(200,450,400,70);for(let k=0;k<4;k++){const a=g.phi*2+k*PI/2;bar(620,90,620+70*Math.cos(a),90+70*Math.sin(a),10,C.part);}pivot(620,90,5);label('WIND SHAFT SHIFTS BETWEEN TWO WORM WHEELS · buckets rise in turn',400,40,'center');},
  reads(){return[['Rising bucket',this.g.h<0.5?'right':'left']];}});

/* ---- pumps ---- */
function forcePump(num,o){return reg({num,outLabel:'Piston height, mm',concept:!!o.concept,
  update(phi){this.g={phi,y:110*(1-Math.cos(phi))/2,up:Math.sin(phi)>0};},output(){return this.g.y;},
  draw(){const g=this.g,X=300,top=170,bot=380,py=bot-40-g.y;ctx.beginPath();ctx.rect(X-60,top,120,bot-top);ctx.rect(X-48,top,96,bot-top);paint(C.part2,C.ink);ctx.save();ctx.fillStyle=C['steel-fill'];ctx.fillRect(X-48,py+24,96,bot-py-24);ctx.restore();ctx.beginPath();ctx.rect(X-48,py,96,24);paint(C['brass-fill'],C.ink);bar(X,py,X,80,10,C.part);
    ctx.beginPath();ctx.rect(X-10,bot,20,120);paint(C['steel-fill'],C.ink);valveFlap(X-14,bot,28,g.up);ctx.beginPath();ctx.rect(X+60,bot-40,140,20);paint(C['steel-fill'],C.ink);valveFlap(X+64,bot-30,16,!g.up,-1);
    if(o.air){const lv=0.55+0.05*Math.sin(g.phi);ctx.beginPath();ctx.rect(480,140,100,240);paint(C.part2,C.ink);ctx.save();ctx.fillStyle=C['steel-fill'];ctx.fillRect(486,140+240*(1-lv),88,240*lv-4);ctx.restore();label('AIR',530,180,'center');ctx.beginPath();ctx.rect(520,40,16,140);paint(C['steel-fill'],C.ink);dashFlow([[528,170],[528,40]],g.phi*2,4);label('STEADY STREAM',545,50);}
    else{ctx.beginPath();ctx.rect(X+200,100,16,280);paint(C['steel-fill'],C.ink);if(!g.up)dashFlow([[X+208,370],[X+208,100]],g.phi*2,4);}
    water(200,480,200,40);label(g.up?'UPSTROKE · water drawn in':'DOWNSTROKE · water forced out',X,40,'center');label(o.label,400,505,'center');},
  reads(){return[['Stroke',this.g.up?'suction':'delivery'],['Inlet valve',this.g.up?'open':'closed'],['Outlet valve',this.g.up?'closed':'open']];}});}
forcePump(451,{air:true,label:'AIR CHAMBER EVENS OUT THE FLOW'});
aliasObj(449,SIMS_NEW[448],{concept:true});

reg({num:452,outLabel:'Piston position, mm',
  update(phi){this.g={phi,x:110*Math.sin(phi),r:Math.cos(phi)>0};},output(){return this.g.x;},
  draw(){const g=this.g,y=270,X=400+g.x;ctx.beginPath();ctx.rect(220,y-60,360,120);ctx.rect(232,y-48,336,96);paint(C.part2,C.ink);ctx.save();ctx.fillStyle=C['steel-fill'];ctx.fillRect(232,y-48,336,96);ctx.restore();ctx.beginPath();ctx.rect(X-12,y-48,24,96);paint(C['brass-fill'],C.ink);bar(X,y,760,y,10,C.part);
    for(const s of [-1,1]){const x=400+s*150,inlet=(s>0)===g.r?false:true;ctx.beginPath();ctx.rect(x-12,y+60,24,80);paint(C['steel-fill'],C.ink);valveFlap(x-12,y+60,24,(s>0)!==g.r);ctx.beginPath();ctx.rect(x-12,y-140,24,80);paint(C['steel-fill'],C.ink);valveFlap(x-12,y-60,24,(s>0)===g.r);}
    ctx.beginPath();ctx.rect(238,y-160,324,20);paint(C['steel-fill'],C.ink);dashFlow([[400,y-150],[400,60]],g.phi*2,4);water(160,450,480,70);label('WATER DELIVERED ON BOTH STROKES',400,40,'center');},
  reads(){return[['Stroke',this.g.r?'right':'left'],['Delivery','every stroke']];}});

reg({num:453,outLabel:'Lever angle, degrees',
  update(phi){this.g={phi,a:0.25*Math.sin(phi)};},output(){return this.g.a*180/PI;},
  draw(){const g=this.g,F=[400,150];ctx.save();ctx.translate(F[0],F[1]);ctx.rotate(g.a);ctx.beginPath();ctx.rect(-300,-10,600,20);paint(C['brass-fill'],C.ink);ctx.restore();pivot(F[0],F[1],7);
    for(const s of [-1,1]){const x=400+s*180,top=F[1]+s*180*Math.sin(g.a)+20;bar(x,top-10,x,top+10,8,C.part);ctx.beginPath();ctx.moveTo(x-70,top+10);ctx.lineTo(x+70,top+10);for(let k=0;k<4;k++){const y=top+10+(380-top-10)*(k+0.5)/4;ctx.lineTo(x+(k%2?70:60),y);}ctx.lineTo(x+70,380);ctx.lineTo(x-70,380);for(let k=3;k>=0;k--){const y=top+10+(380-top-10)*(k+0.5)/4;ctx.lineTo(x-(k%2?70:60),y);}ctx.closePath();paint(C.part,C.ink);
      const comp=Math.sin(g.a)*s<0;valveFlap(x-12,380,24,!comp);ctx.beginPath();ctx.rect(x-10,380,20,60);paint(C['steel-fill'],C.ink);}
    water(120,440,560,80);label('TWO BELLOWS WORK ALTERNATELY',400,40,'center');},
  reads(){return[['Left bellows',Math.sin(this.g.a)>0?'filling':'emptying'],['Right bellows',Math.sin(this.g.a)>0?'emptying':'filling']];}});

reg({num:454,outLabel:'Diaphragm lift, mm',
  update(phi){this.g={phi,d:30*Math.sin(phi),up:Math.cos(phi)>0};},output(){return this.g.d;},
  draw(){const g=this.g,X=400,y=270;ctx.beginPath();ctx.rect(X-180,y,360,110);ctx.rect(X-168,y,336,98);paint(C.part2,C.ink);ctx.save();ctx.fillStyle=C['steel-fill'];ctx.fillRect(X-168,y,336,98);ctx.restore();
    ctx.beginPath();ctx.moveTo(X-170,y);ctx.quadraticCurveTo(X,y-g.d*2,X+170,y);paint(null,C.ink,5);bar(X,y-g.d,X,100,10,C.part);const O=[X+250,140],pin=[O[0]+40*Math.cos(g.phi),O[1]+40*Math.sin(g.phi)];
    ctx.beginPath();ctx.rect(X-130,y+110,20,90);ctx.rect(X+110,y+110,20,90);paint(C['steel-fill'],C.ink);valveFlap(X-130,y+110,20,g.up);valveFlap(X+110,y+110,20,!g.up);label(g.up?'DIAPHRAGM RISING · suction':'DIAPHRAGM FALLING · delivery',400,40,'center');label('NO SLIDING PISTON TO WEAR OR LEAK',400,500,'center');},
  reads(){return[['Diaphragm',`${this.g.d.toFixed(0)} mm`]];}});

reg({num:465,outLabel:'Beam angle, degrees',
  update(phi){this.g={phi,a:0.2*Math.sin(phi)};},output(){return this.g.a*180/PI;},
  draw(){const g=this.g,F=[400,130];ctx.save();ctx.translate(F[0],F[1]);ctx.rotate(g.a);ctx.beginPath();ctx.rect(-280,-12,560,24);paint(C['brass-fill'],C.ink);ctx.restore();pivot(F[0],F[1],7);ctx.beginPath();ctx.rect(F[0]-12,F[1],24,330);paint(C.part2,C.ink);
    for(const s of [-1,1]){const x=400+s*240,yb=F[1]+s*240*Math.sin(g.a);bar(x,yb,x,yb+150,8,C.part);ctx.beginPath();ctx.rect(x-40,260,80,200);paint(C.part2,C.ink);ctx.save();ctx.fillStyle=C['steel-fill'];ctx.fillRect(x-34,yb+150,68,460-yb-150);ctx.restore();ctx.beginPath();ctx.rect(x-34,yb+150,68,16);paint(C['steel-fill'],C.ink);}
    label('ONE BEAM WORKS TWO PUMPS · one lifts while the other falls',400,500,'center');},
  reads(){return[['Left pump',Math.sin(this.g.a)<0?'lifting':'returning'],['Right pump',Math.sin(this.g.a)>0?'lifting':'returning']];}});

reg({num:467,outLabel:'Ram lift, mm',
  reset(){this.h=0;this.last=null;},
  update(phi){if(this.last===null)this.last=phi;const d=phi-this.last;this.last=phi;const down=Math.sin(phi)<0;if(down)this.h=Math.min(160,this.h+Math.abs(d)*4);this.g={phi,a:0.35*Math.cos(phi),down};},output(){return this.h;},
  draw(){const g=this.g,X=470;ctx.beginPath();ctx.rect(X-80,200,160,260);ctx.rect(X-66,200,132,260);paint(C.part2,C.ink);ctx.save();ctx.fillStyle=C['steel-fill'];ctx.fillRect(X-66,320-this.h*0.6,132,140+this.h*0.6);ctx.restore();ctx.beginPath();ctx.rect(X-60,140-this.h*0.6,120,190);paint(C['brass-fill'],C.ink);weight(X,100-this.h*0.6,160,40,'LOAD');
    const F=[240,240];ctx.beginPath();ctx.rect(F[0]+20,280,30,180);paint(C.part2,C.ink);const E=[F[0]+180*Math.cos(-PI/2-0.6+g.a),F[1]+180*Math.sin(-PI/2-0.6+g.a)];bar(F[0],F[1],E[0],E[1],12,C['steel-fill']);bar(F[0]+35,F[1]+30-g.a*40,F[0]+35,F[1]+100-g.a*40,10,C.part);pivot(F[0],F[1],6);
    dashFlow([[F[0]+35,460],[X-66,460]],g.phi*(g.down?2:0),4);label('SMALL PLUNGER PUMPS OIL OR WATER UNDER THE BIG RAM',400,505,'center');},
  reads(){return[['Ram raised',`${this.h.toFixed(0)} mm`],['Handle',this.g.down?'pumping':'returning']];}});

reg({num:444,outLabel:'Air-chamber pressure',
  update(phi){const u=mod(phi*1.2,TAU)/TAU;const st=u<0.6?'flow':u<0.75?'shut':'deliver';this.g={phi,u,st};},output(){return 1+0.3*Math.sin(this.g.phi*1.2);},
  draw(){const g=this.g;water(20,140,140,120);ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=2;ctx.strokeRect(20,100,140,160);ctx.restore();ctx.beginPath();ctx.moveTo(160,240);ctx.lineTo(480,420);ctx.lineTo(480,440);ctx.lineTo(160,260);ctx.closePath();paint(C['steel-fill'],C.ink);
    ctx.beginPath();ctx.rect(480,400,160,50);paint(C['steel-fill'],C.ink);const wv=g.st==='flow';ctx.beginPath();ctx.rect(520,wv?370:390,30,10);paint(C.steel,C.ink);if(wv)dashFlow([[535,400],[535,360]],g.phi*3,3);
    ctx.beginPath();ctx.rect(580,220,70,180);paint(C.part2,C.ink);const lv=0.5+0.1*Math.sin(g.phi*1.2);ctx.save();ctx.fillStyle=C['steel-fill'];ctx.fillRect(584,220+180*(1-lv),62,180*lv);ctx.restore();valveFlap(590,400,20,g.st==='deliver');ctx.beginPath();ctx.rect(640,230,120,14);paint(C['steel-fill'],C.ink);dashFlow([[650,237],[760,237]],g.phi*2,3);
    if(g.st!=='shut')dashFlow([[170,250],[470,420]],g.phi*(wv?3:1),3);label({flow:'WATER RUNS OUT OF THE WASTE VALVE, GATHERING SPEED',shut:'WASTE VALVE SLAMS SHUT',deliver:'THE SURGE FORCES WATER INTO THE AIR CHAMBER'}[g.st],400,40,'center');label('AIR CHAMBER',615,205,'center');label('DRIVE PIPE',300,300);},
  reads(){return[['Phase',{flow:'flow',shut:'hammer',deliver:'delivery'}[this.g.st]],['Power','the falling water itself']];}});
aliasObj(445,SIMS_NEW[444],{concept:true});aliasObj(446,SIMS_NEW[444],{concept:true});

reg({num:464,outLabel:'Jet height, mm',
  update(phi){const t=mod(phi*0.2,1);this.g={phi,t,jet:90*(1-t*0.6)};},output(){return this.g.jet;},
  draw(){const g=this.g;const box=(x,y,w,h,lv)=>{ctx.beginPath();ctx.rect(x,y,w,h);paint(C.part,C.ink);ctx.save();ctx.fillStyle=C['steel-fill'];ctx.fillRect(x+3,y+h-h*lv,w-6,h*lv-3);ctx.restore();};
    box(300,100,200,70,0.8-0.5*g.t);box(160,260,180,80,0.2+0.6*g.t);box(460,260,180,80,0.85-0.6*g.t);ctx.beginPath();ctx.moveTo(320,170);ctx.lineTo(320,260);paint(null,C.ink,4);ctx.beginPath();ctx.moveTo(330,260);ctx.lineTo(480,260);paint(null,C.ink,4);ctx.beginPath();ctx.moveTo(500,260);ctx.lineTo(420,110);paint(null,C.ink,4);
    ctx.beginPath();ctx.moveTo(400,110);ctx.lineTo(400,100-g.jet);paint(null,C.steel,4);label('WATER FALLING TO THE LOWER BOX PUSHES AIR, WHICH PUSHES THE JET',400,500,'center');},
  reads(){return[['Jet',`${this.g.jet.toFixed(0)} mm`],['Runs until','the lower box fills']];}});

reg({num:473,outLabel:'Bell height, mm',
  update(phi){this.g={phi,y:60*Math.sin(phi),down:Math.cos(phi)<0};},output(){return this.g.y;},
  draw(){const g=this.g,X=400;ctx.beginPath();ctx.rect(X-160,240,320,220);paint(C.part2,C.ink);water(X-154,280,308,174);const yb=200-g.y;ctx.beginPath();ctx.moveTo(X-120,yb+200);ctx.lineTo(X-120,yb);ctx.lineTo(X+120,yb);ctx.lineTo(X+120,yb+200);paint(C['steel-fill'],C.ink);ctx.save();ctx.fillStyle=C.sheet;ctx.fillRect(X-116,yb+4,232,Math.max(0,280-yb-4));ctx.restore();
    ctx.beginPath();ctx.rect(X-6,yb-120,12,120);paint(C.part,C.ink);ctx.beginPath();ctx.rect(X+20,yb-60,12,60);paint(C['steel-fill'],C.ink);if(g.down)dashFlow([[X+26,yb],[X+26,yb-60]],g.phi*3,3);label(g.down?'BELL SINKS · air driven out':'BELL RISES · air drawn in',400,40,'center');},
  reads(){return[['Bell',this.g.down?'sinking':'rising']];}});

function jetPump(num,o){return reg({num,outLabel:'Flow',concept:true,
  update(phi){this.g={phi};},output(){return 1;},
  draw(){const g=this.g,y=250;ctx.beginPath();ctx.moveTo(120,y-20);ctx.lineTo(340,y-20);ctx.lineTo(420,y-40);ctx.lineTo(700,y-40);ctx.lineTo(700,y+40);ctx.lineTo(420,y+40);ctx.lineTo(340,y+20);ctx.lineTo(120,y+20);ctx.closePath();paint(C.part,C.ink);ctx.beginPath();ctx.rect(370,y+40,40,200);paint(C.part,C.ink);
    steamFlow([[120,y],[700,y]],g.phi);dashFlow([[390,y+230],[390,y+40],[420,y+10],[700,y+10]],g.phi*1.5,4);water(300,y+200,180,70);label('STEAM',150,y-40);label('WATER DRAWN UP',420,y+180);label(o.label,400,40,'center');label(o.l2,400,500,'center');},
  reads(){return[['Moving parts','none'],['Principle','fast steam drags the water along']];}});}
jetPump(475,{label:'STEAM JET PUMP',l2:'the jet lowers the pressure round it and entrains the water'});jetPump(476,{label:'STEAM SIPHON',l2:'steam blown through the throat lifts water from below'});

function steamTrap(num,o){return reg({num,outLabel:'Valve opening, %',
  update(phi){const u=mod(phi*0.5,TAU)/TAU;const hot=u<0.55;this.g={phi,hot,open:hot?0:1};},output(){return this.g.open*100;},
  draw(){const g=this.g;ctx.beginPath();ctx.rect(200,160,400,200);ctx.rect(212,172,376,176);paint(C.part2,C.ink);ctx.save();ctx.fillStyle=g.hot?STEAM():C['steel-fill'];ctx.globalAlpha=.5;ctx.fillRect(212,172,376,176);ctx.restore();
    const L=o.kind==='bar'?(g.hot?300:280):0;if(o.kind==='bar'){bar(230,260,230+L,260,14,C['brass-fill']);ctx.beginPath();ctx.rect(230+L,248,20,24);paint(C.part,C.ink);}else{const bx=400,bulge=g.hot?40:10;ctx.beginPath();ctx.ellipse(bx,260,60,bulge,0,0,TAU);paint(C['brass-fill'],C.ink);ctx.beginPath();ctx.rect(bx-8,260+bulge,16,60-bulge);paint(C.part,C.ink);}
    ctx.beginPath();ctx.rect(o.kind==='bar'?530:390,o.kind==='bar'?250:330,o.kind==='bar'?40:20,o.kind==='bar'?20:40);paint(C.part2,C.ink);bar(100,200,200,200,14,C['steel-fill']);bar(600,320,720,320,14,C['steel-fill']);if(g.open)dashFlow([[580,320],[720,320]],g.phi*2,4);
    label(g.hot?'STEAM HOT · element expands, valve shut':'WATER COOLER · element shrinks, valve opens',400,120,'center');label(o.label,400,480,'center');},
  reads(){return[['Inside',this.g.hot?'steam':'condensed water'],['Valve',this.g.open?'open':'shut']];}});}
steamTrap(477,{kind:'capsule',label:'THERMOSTATIC STEAM TRAP'});steamTrap(478,{kind:'bar',label:'EXPANSION STEAM TRAP · a rod that grows with heat'});

/* ---- gas ---- */
function gasometer(num,o){return reg({num,outLabel:'Bell height, mm',
  update(phi){const h=(1-Math.cos(phi*0.4))/2;this.g={phi,h,fill:Math.sin(phi*0.4)>0};},output(){return this.g.h*200;},
  draw(){const g=this.g,X=400;ctx.beginPath();ctx.rect(X-190,260,380,200);paint(C.part2,C.ink);water(X-184,280,368,174);
    if(o.tele){const h1=Math.min(1,g.h*2),h2=Math.max(0,g.h*2-1);const y2=270-h2*130,y1=270-h1*130;ctx.beginPath();ctx.rect(X-170,y1,340,200);paint(C.part,C.ink);ctx.beginPath();ctx.rect(X-140,y2-130*h2*0,280,y1-y2+200*0+130);paint(C['steel-fill'],C.ink);}
    else{const yb=270-g.h*170;ctx.beginPath();ctx.rect(X-160,yb,320,190);paint(C['steel-fill'],C.ink);bar(X,yb,X,60,4,C.part);rope([[X,yb],[X,70],[620,70],[620,340-g.h*-170*0]]);pulley(X,70,0.1,0,C.part);weight(620,180+g.h*170,60,60,'');}
    bar(100,440,X-60,440,12,C.part);if(g.fill)dashFlow([[100,440],[X-60,440]],g.phi*2,3);else dashFlow([[X+60,440],[700,440]],g.phi*2,3);bar(X+60,440,700,440,12,C.part);
    label(g.fill?'GAS IN · bell rises':'GAS OUT · bell sinks',400,40,'center');label(o.label,400,500,'center');},
  reads(){return[['Stored',`${(this.g.h*100).toFixed(0)} %`],['Seal','water in the tank']];}});}
gasometer(479,{label:'BELL FLOATS IN A WATER TANK'});gasometer(480,{tele:true,label:'TELESCOPING SECTIONS RISE ONE AFTER ANOTHER'});

reg({num:481,outLabel:'Drum turns',
  update(phi){this.g={phi:phi*0.4};},output(){return this.g.phi/TAU;},
  draw(){const g=this.g,O=[400,260],R=150;circ(O[0],O[1],R+30);paint(C.part2,C.ink);ctx.save();ctx.beginPath();ctx.rect(0,O[1]+10,800,300);ctx.clip();water(O[0]-R-26,O[1],2*R+52,R+30);ctx.restore();
    for(let k=0;k<4;k++){const a=g.phi+k*PI/2;ctx.save();ctx.translate(O[0],O[1]);ctx.rotate(a);ctx.beginPath();ctx.moveTo(20,0);ctx.quadraticCurveTo(R*0.6,-30,R,-10);paint(null,C.ink,3);ctx.restore();}circ(O[0],O[1],R);paint(null,C.ink,2);pivot(O[0],O[1],6);
    dashFlow([[60,O[1]],[O[0]-10,O[1]]],g.phi*3,3);label('GAS FILLS EACH CHAMBER IN TURN, FLOATING THE DRUM ROUND',400,40,'center');label(`turns counted: ${(g.phi/TAU).toFixed(2)}`,400,480,'center');},
  reads(){return[['Measures','gas volume by drum turns'],['Turns',`${(this.g.phi/TAU).toFixed(2)}`]];}});

reg({num:482,outLabel:'Valve opening, %',params:[{id:'p',label:'Supply pressure',min:0,max:100,step:1,value:60,fmt:v=>v+' %'}],
  update(phi){const lift=clamp(this.P.p/100,0,1);this.g={phi,lift,open:1-lift};},output(){return this.g.open*100;},
  draw(){const g=this.g,X=400;ctx.beginPath();ctx.rect(X-160,240,320,200);paint(C.part2,C.ink);water(X-154,300,308,134);const yb=200-g.lift*60;ctx.beginPath();ctx.rect(X-120,yb,240,160);paint(C['steel-fill'],C.ink);bar(X,yb+160,X,380,6,C.part);
    poly([[X-30,380-g.lift*60*0],[X+30,380],[X,420-g.lift*30]]);ctx.closePath();paint(C['brass-fill'],C.ink);ctx.beginPath();ctx.rect(X-40,420,80,8);paint(C.part2,C.ink);bar(100,470,X-40,470,14,C.part);bar(X+40,470,700,470,14,C.part);dashFlow([[100,470],[700,470]],g.phi*2*g.open+0.01,3);
    label('HIGHER PRESSURE LIFTS THE BELL AND CLOSES THE CONE VALVE',400,40,'center');},
  reads(){return[['Supply',`${this.P.p} %`],['Valve',`${(this.g.open*100).toFixed(0)} % open`],['Outlet pressure','held nearly constant']];}});

reg({num:483,outLabel:'Counter',
  update(phi){this.g={phi,a:Math.sin(phi),b:Math.cos(phi)};},output(){return this.g.phi/TAU;},
  draw(){const g=this.g;for(const [x,v] of [[260,g.a],[540,g.b]]){const w=70+50*v;ctx.beginPath();ctx.rect(x-140,160,280,200);paint(C.part2,C.ink);ctx.beginPath();ctx.rect(x-6,170,12,180);paint(C.part,C.ink);ctx.beginPath();ctx.moveTo(x,180);ctx.lineTo(x+w,200);ctx.lineTo(x+w,320);ctx.lineTo(x,340);ctx.closePath();paint(C['brass-fill'],C.ink);ctx.beginPath();ctx.rect(x+w-4,190,8,140);paint(C['steel-fill'],C.ink);}
    const O=[400,90],pin=[O[0]+30*Math.cos(g.phi),O[1]+30*Math.sin(g.phi)];circ(O[0],O[1],40);paint(C.part,C.ink);bar(O[0],O[1],pin[0],pin[1],8,C.part2);pivot(O[0],O[1],5);label('TWO LEATHER BELLOWS FILL AND EMPTY IN TURN · the crank drives the dial',400,500,'center');},
  reads(){return[['Dial turns',`${(this.g.phi/TAU).toFixed(2)}`]];}});

reg({num:500,outLabel:'Needle angle, degrees',params:[{id:'p',label:'Pressure',min:0,max:100,step:1,value:55,fmt:v=>v+' psi'}],
  update(phi){const p=this.P.p*(1+0.03*Math.sin(phi*2));this.g={phi,p};},output(){return this.g.p*2.4;},
  draw(){const g=this.g,O=[400,230],d=g.p/100*30;circ(O[0],O[1],150);paint(C.hi,C.ink);for(let k=0;k<=10;k++){const a=PI*0.75+k*PI*1.5/10;ctx.beginPath();ctx.moveTo(O[0]+130*Math.cos(a),O[1]+130*Math.sin(a));ctx.lineTo(O[0]+145*Math.cos(a),O[1]+145*Math.sin(a));paint(null,C.ink,1.5);if(k%2===0)label(String(k*10),O[0]+112*Math.cos(a),O[1]+112*Math.sin(a),'center');}
    const a=PI*0.75+g.p/100*PI*1.5;bar(O[0],O[1],O[0]+120*Math.cos(a),O[1]+120*Math.sin(a),4,C.steel);pivot(O[0],O[1],5);
    ctx.beginPath();ctx.rect(O[0]-80,O[1]+170,160,30);paint(C.part2,C.ink);ctx.beginPath();ctx.moveTo(O[0]-70,O[1]+170);ctx.quadraticCurveTo(O[0],O[1]+170-d*2,O[0]+70,O[1]+170);paint(null,C.ink,4);bar(O[0],O[1]+170-d,O[0],O[1]+150,4,C.part);bar(O[0],O[1]+200,O[0],O[1]+260,14,C['steel-fill']);label('DIAPHRAGM',O[0]+90,O[1]+180);},
  reads(){return[['Pressure',`${this.g.p.toFixed(0)} psi`],['Diaphragm lift',`${(this.g.p/100*3).toFixed(1)} mm`]];}});

/* ================= batch 3 · part 6: tools, instruments, clamps, odds and ends ================= */
aliasObj(51,SIMS_NEW[50],{concept:true});alias(87,53,{concept:true});alias(159,158,{concept:true});alias(160,158,{concept:true});alias(416,158,{concept:true});
alias(164,140,{concept:true});alias(352,129,{concept:true});diffScrew(260);SIMS_NEW[260].concept=true;
const openClose=(phi)=>{const u=mod(phi*0.5,TAU)/TAU;return u<0.35?smooth(u/0.35):u<0.6?1:u<0.95?1-smooth((u-0.6)/0.35):0;};

/* ---- clamps ---- */
function clampSim(num,o){return reg({num,outLabel:'Jaw closure, %',concept:!!o.concept,
  update(phi){this.g={phi,c:openClose(phi)};},output(){return this.g.c*100;},
  draw(){const g=this.g,c=g.c;ctx.beginPath();ctx.rect(80,330,640,40);paint(C.part2,C.ink);ctx.beginPath();ctx.rect(330,280,140,50);paint(C['brass-fill'],C.ink);label('WORK',400,305,'center');
    if(o.kind==='screw'){const x=470+80*(1-c);ctx.beginPath();ctx.rect(x,220,30,110);paint(C['steel-fill'],C.ink);screwShaft(x+30,720,260,12,c*20,14);ctx.beginPath();ctx.rect(300,220,30,110);paint(C.part,C.ink);bar(720,230,720,290,8,C.part);}
    else if(o.kind==='pivot'){const a=-0.5*(1-c);ctx.save();ctx.translate(600,330);ctx.rotate(a);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(-130,-20);ctx.lineTo(-130,-50);ctx.lineTo(0,-40);ctx.closePath();paint(C['steel-fill'],C.ink);ctx.restore();pivot(600,330,6);ctx.beginPath();ctx.rect(300,220,30,110);paint(C.part,C.ink);}
    else if(o.kind==='lever'){const a=-0.4*(1-c);ctx.save();ctx.translate(200,200);ctx.rotate(a);ctx.beginPath();ctx.rect(0,-12,320,24);paint(C['steel-fill'],C.ink);ctx.restore();pivot(200,200,6);bar(200,200,200,330,12,C.part);screwShaft(540,560,180,14,c*20,10);bar(550,120,550,180+60*c*0,10,C.part);}
    else{const d=60*(1-c);ctx.beginPath();ctx.rect(300,220,30,110);ctx.rect(470+d,220,30,110);paint(C.part,C.ink);poly([[500+d,220],[560+d*0.2,220],[530+d*0.2,330],[500+d,330]]);ctx.closePath();paint(C['steel-fill'],C.ink);ctx.beginPath();ctx.rect(560,200,30,130);paint(C.part2,C.ink);}
    label(c>0.98?'CLAMPED':c<0.02?'OPEN':'CLOSING / OPENING',400,420,'center');label(o.label,400,480,'center');},
  reads(){return[['Grip',`${(this.g.c*100).toFixed(0)} %`]];}});}
clampSim(174,{kind:'screw',label:'BENCH CLAMP · the screw closes the jaw'});clampSim(180,{kind:'pivot',label:'PIVOTED CLAMP AGAINST A FIXED SIDE PIECE'});clampSim(190,{kind:'lever',label:'SCREW PRESSES THE HOLDER DOWN ON THE WORK',concept:true});clampSim(381,{kind:'wedge',label:"JOINER'S CLAMP WITH WEDGES"});

/* ---- parallel rulers ---- */
function ruler(num,o){return reg({num,outLabel:'Ruler spacing, mm',concept:!!o.concept,
  update(phi){const a=-PI/2+0.9*Math.sin(phi*0.5);this.g={phi,a};},output(){return -Math.sin(this.g.a)*140;},
  draw(){const g=this.g,y0=380,L=140,P1=[260,y0],P2=[540,y0],d=[L*Math.cos(g.a),L*Math.sin(g.a)];const Q1=[P1[0]+d[0],P1[1]+d[1]],Q2=[P2[0]+d[0],P2[1]+d[1]];
    ctx.beginPath();ctx.rect(150,y0-14,500,28);paint(C['brass-fill'],C.ink);ctx.beginPath();ctx.rect(Q1[0]-110,Q1[1]-14,500,28);paint(C['steel-fill'],C.ink);
    if(o.kind==='roll'){for(const x of [260,540]){circ(x+d[0],y0+0,26);paint(C.part,C.ink);}}
    else if(o.kind==='cross'){bar(P1[0],P1[1],Q2[0],Q2[1],8,C.part2);bar(P2[0],P2[1],Q1[0],Q1[1],8,C.part2);}
    else if(o.kind==='tri'){poly([[Q1[0]-110,Q1[1]-14],[Q1[0]+390,Q1[1]-14],[Q1[0]+390,Q1[1]-80]]);ctx.closePath();paint(C.part,C.ink);}
    else{bar(P1[0],P1[1],Q1[0],Q1[1],10,C.part);bar(P2[0],P2[1],Q2[0],Q2[1],10,C.part);if(o.kind==='joint'){const M1=[(P1[0]+Q1[0])/2+16,(P1[1]+Q1[1])/2],M2=[(P2[0]+Q2[0])/2+16,(P2[1]+Q2[1])/2];pivot(M1[0],M1[1],3);pivot(M2[0],M2[1],3);}pivot(P1[0],P1[1],5);pivot(P2[0],P2[1],5);pivot(Q1[0],Q1[1],5);pivot(Q2[0],Q2[1],5);}
    if(o.scale){for(let k=0;k<20;k++){const x=160+k*24;ctx.beginPath();ctx.moveTo(x,y0-14);ctx.lineTo(x,y0-(k%5?6:0));paint(null,C.ink,1);}}
    ctx.save();ctx.strokeStyle=C.steel;ctx.setLineDash([6,6]);ctx.beginPath();ctx.moveTo(60,Q1[1]-14);ctx.lineTo(740,Q1[1]-14);ctx.stroke();ctx.restore();label(o.label,400,470,'center');label('the upper edge stays parallel to the lower one',400,490,'center');},
  reads(){return[['Spacing',`${(-Math.sin(this.g.a)*140).toFixed(0)} mm`],['Edges','always parallel']];}});}
ruler(322,{kind:'tri',label:'TWO TRIANGLES SLIDING ON THEIR LONG EDGE',concept:true});ruler(323,{kind:'roll',label:'ROLLING RULER ON TWO EQUAL WHEELS',concept:true});ruler(324,{kind:'cross',label:'CROSSED ARMS WITH A SLIDING PIN',concept:true});ruler(349,{kind:'joint',label:'JOINTED ARMS'});ruler(367,{scale:true,label:'SCALE FOR SPACING LINES EVENLY'});

/* ---- drawing instruments ---- */
function tracer(num,o){return reg({num,outLabel:o.outLabel||'Pen height, mm',concept:!!o.concept,
  reset(){this.trail=[];},
  update(phi){const r=o.pos(phi);this.g=Object.assign({phi},r);this.trail=this.trail||[];this.trail.push(r.P);if(this.trail.length>(o.tlen||500))this.trail.shift();},
  output(){return 400-this.g.P[1];},
  draw(){const g=this.g;if(o.bg)o.bg.call(this,g);if(this.trail.length>1){ctx.save();ctx.strokeStyle=C.steel;ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(...this.trail[0]);for(const p of this.trail)ctx.lineTo(...p);ctx.stroke();ctx.restore();}o.fg.call(this,g);circ(g.P[0],g.P[1],5);paint(C.steel,C.ink);label(o.label,400,505,'center');},
  reads(){return o.reads?o.reads.call(this):[['Pen',`${this.g.P[0].toFixed(0)}, ${this.g.P[1].toFixed(0)}`]];}});}
tracer(405,{label:'THREAD AND RULE · the pen keeps a constant difference of distances',outLabel:'Pen height, mm',
  pos(phi){const F1=[250,300],F2=[550,300],L=420,l=320,th=-0.6*Math.sin(phi*0.4)-PI*0+0;const a=-0.0+th;const u=[Math.cos(a+0.0),Math.sin(a)];const E=[F1[0]+L*u[0],F1[1]+L*u[1]];
    let lo=0,hi=L;for(let i=0;i<50;i++){const t=(lo+hi)/2,P=[F1[0]+t*u[0],F1[1]+t*u[1]];const f=(L-t)+Math.hypot(P[0]-F2[0],P[1]-F2[1])-l;if(f>0)lo=t;else hi=t;}const t=(lo+hi)/2;return{F1,F2,E,P:[F1[0]+t*u[0],F1[1]+t*u[1]]};},
  fg(g){bar(g.F1[0],g.F1[1],g.E[0],g.E[1],10,C['brass-fill']);rope([g.E,g.P,g.F2]);pivot(g.F1[0],g.F1[1],5);pivot(g.F2[0],g.F2[1],5);label('F1',g.F1[0]-24,g.F1[1]);label('F2',g.F2[0]+10,g.F2[1]+16);}});
tracer(406,{label:'THREAD AND SQUARE · the pen stays as far from the focus as from the edge',
  pos(phi){const F=[400,230],dy=420,s=400+230*Math.sin(phi*0.4);const y=(dy*dy-(s-F[0])**2-F[1]**2)/(2*(dy-F[1]));return{F,s,dy,P:[s,y],top:y-60};},
  bg(g){ctx.beginPath();ctx.rect(80,g.dy,640,14);paint(C.part2,C.ink);},
  fg(g){ctx.beginPath();ctx.rect(g.s,g.top-40,14,g.dy-g.top+40);paint(C['brass-fill'],C.ink);ctx.beginPath();ctx.rect(g.s-40,g.dy-20,80,20);paint(C['brass-fill'],C.ink);rope([[g.s,g.top-40],g.P,g.F]);pivot(g.F[0],g.F[1],5);label('FOCUS',g.F[0]+10,g.F[1]-12);}});
tracer(403,{label:'CYCLOGRAPH · draws a big arc without reaching its centre',concept:true,
  pos(phi){const R=900,C0=[400,300+R],a=0.38*Math.sin(phi*0.4);return{a,P:[C0[0]+R*Math.sin(a),C0[1]-R*Math.cos(a)],C0};},
  fg(g){const P=g.P;for(const s of [-1,1]){bar(P[0],P[1],P[0]+s*160,P[1]+60,8,C['brass-fill']);circ(P[0]+s*160,P[1]+60,8);paint(C.hi,C.ink);}circ(260,380,6);paint(C.ink);circ(540,380,6);paint(C.ink);label('PINS',260,400,'center');}});
tracer(384,{label:'WHEEL ON A THREADED AXLE · draws a spiral',
  pos(phi){const t=mod(phi*0.6,TAU*4),r=20+t*7;return{t,P:[400+r*Math.cos(t),270+r*Math.sin(t)]};},
  fg(g){bar(400,270,g.P[0],g.P[1],8,C.part);circ(g.P[0],g.P[1],14);paint(C['brass-fill'],C.ink);pivot(400,270,6);}});
tracer(368,{label:'CYLINDER TURNS WHILE THE RACK MOVES THE POINT · a spiral line',
  pos(phi){const t=mod(phi,TAU*3);const x=200+t/(TAU*3)*400,y=270-80*Math.cos(t);return{t,P:[x,y],front:Math.sin(t)>0};},
  bg(g){ctx.beginPath();ctx.rect(200,190,400,160);paint(C['brass-fill'],C.ink);},
  fg(g){ctx.beginPath();ctx.rect(g.P[0]-6,100,12,g.P[1]-100);paint(C.part,C.ink);ctx.beginPath();ctx.rect(150,90,500,14);paint(C['steel-fill'],C.ink);drawGear(130,270,36,12,g.t,C.part,{bore:4});},tlen:600});
tracer(407,{label:'POINTED ARCH · two arcs struck from the springing points',
  pos(phi){const u=mod(phi*0.3,1),A=[260,380],B=[540,380],R=280;let P;if(u<0.5){const a=PI-u*2*PI/3;P=[B[0]+R*Math.cos(a),B[1]-R*Math.sin(a)];}else{const a=PI/3*(2-u*2)+0;P=[A[0]+R*Math.cos(PI/3-(u-0.5)*2*PI/3),A[1]-R*Math.sin(PI/3-(u-0.5)*2*PI/3)];}return{P,A,B,u};},
  fg(g){const c=g.u<0.5?g.B:g.A;bar(c[0],c[1],g.P[0],g.P[1],6,C['brass-fill']);pivot(g.A[0],g.A[1],5);pivot(g.B[0],g.B[1],5);ctx.beginPath();ctx.rect(200,380,400,10);paint(C.part2,C.ink);}});
tracer(370,{label:'CRANK AND RATCHET GIVE A VARIED RUBBING PATH',concept:true,
  pos(phi){const t=phi*0.8;return{t,P:[400+120*Math.cos(t)+40*Math.cos(t*7.3),260+120*Math.sin(t)+40*Math.sin(t*7.3)]};},
  bg(){circ(400,260,190);paint(C.part,C.ink);},fg(g){circ(g.P[0],g.P[1],34);paint(C['brass-fill'],C.ink);},tlen:900});
tracer(393,{label:'CUP ORBITS AND SPINS · it wears the lens evenly',concept:true,
  pos(phi){const t=phi*0.8;return{t,P:[400+90*Math.cos(t)+50*Math.cos(t*3.7),260+90*Math.sin(t)+50*Math.sin(t*3.7)]};},
  bg(){circ(400,260,170);paint(C['steel-fill'],C.ink);},fg(g){circ(g.P[0],g.P[1],40);paint(C['brass-fill'],C.ink);bar(g.P[0],g.P[1],g.P[0]+30*Math.cos(g.t*6),g.P[1]+30*Math.sin(g.t*6),4,C.part2);},tlen:900});
tracer(411,{label:'CARRIAGE ROLLS OVER THE GROUND · the pendulum pen draws its profile',concept:true,
  pos(phi){const x=mod(phi*30,600)+100,gnd=x=>380-40*Math.sin(x/90)-20*Math.sin(x/37);const slope=Math.atan2(gnd(x+20)-gnd(x-20),40);return{x,gy:gnd(x),slope,P:[x,180+(gnd(x)-380)*0.6]};},
  bg(g){ctx.beginPath();ctx.moveTo(60,520);for(let x=60;x<=760;x+=10)ctx.lineTo(x,380-40*Math.sin(x/90)-20*Math.sin(x/37));ctx.lineTo(760,520);ctx.closePath();paint(C.part2,C.ink);ctx.beginPath();ctx.rect(60,120,680,120);paint(C.hi,C.ink);},
  fg(g){ctx.save();ctx.translate(g.x,g.gy-30);ctx.rotate(g.slope);ctx.beginPath();ctx.rect(-50,-20,100,30);paint(C['steel-fill'],C.ink);circ(-36,18,12);paint(C.part,C.ink);circ(36,18,12);paint(C.part,C.ink);ctx.restore();bar(g.x,g.gy-50,g.P[0],g.P[1],4,C.part);},tlen:900});
tracer(408,{label:'CENTROLINEAD · every line runs to a far vanishing point',concept:true,
  pos(phi){const a=0.25*Math.sin(phi*0.5),V=[1600,260];return{a,V,P:[150,260+170*Math.sin(phi*0.5)]};},
  bg(g){for(let k=-4;k<=4;k++){ctx.save();ctx.strokeStyle=C.rule;ctx.beginPath();ctx.moveTo(100,260+k*55);ctx.lineTo(800,260+k*55*(800-1600)/(100-1600));ctx.stroke();ctx.restore();}},
  fg(g){const y=g.P[1];ctx.save();ctx.translate(150,y);ctx.rotate(-g.a*0+Math.atan2(260-y,1450));ctx.beginPath();ctx.rect(0,-8,560,16);paint(C['brass-fill'],C.ink);ctx.restore();circ(220,180,6);paint(C.ink);circ(220,340,6);paint(C.ink);}});

reg({num:404,outLabel:'Bow sag, mm',params:[{id:'b',label:'Bend',min:10,max:100,step:2,value:50,fmt:v=>v+' mm'}],
  update(phi){this.g={phi,s:this.P.b};},output(){return this.g.s;},
  draw(){const g=this.g,A=[180,320],B=[620,320],s=g.s,M=[400,320-s];const R=((220*220)+s*s)/(2*s),Cy=M[1]+R;ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=10;ctx.beginPath();ctx.arc(400,Cy,R,-PI/2-Math.asin(240/R),-PI/2+Math.asin(240/R));ctx.stroke();ctx.strokeStyle=C['brass-fill'];ctx.lineWidth=7;ctx.stroke();ctx.restore();
    rope([[160,320+s*0.1],[640,320+s*0.1]]);for(const p of [A,M,B]){circ(p[0],p[1],5);paint(C.steel,C.ink);}label('THE TAPERED BAR BENDS INTO A TRUE ARC THROUGH THREE POINTS',400,470,'center');},
  reads(){const s=this.g.s;return[['Sag',`${s} mm`],['Arc radius',`${(((220*220)+s*s)/(2*s)).toFixed(0)} mm`]];}});

reg({num:410,outLabel:'Mark offset, mm',params:[{id:'w',label:'Bar width',min:40,max:200,step:5,value:120,fmt:v=>v+' mm'}],
  update(phi){this.g={phi};},output(){return 0;},
  draw(){const w=this.P.w,X=400;ctx.beginPath();ctx.rect(X-w/2,200,w,240);paint(C.part2,C.ink);ctx.save();ctx.translate(X,240);ctx.beginPath();ctx.moveTo(-w/2-30,0);ctx.lineTo(w/2+30,0);ctx.lineTo(w/2+30,-20);ctx.lineTo(-w/2-30,-20);ctx.closePath();paint(C['brass-fill'],C.ink);for(const s of [-1,1]){circ(s*w/2,-4,6);paint(C.ink);}ctx.restore();
    ctx.save();ctx.strokeStyle=C.steel;ctx.lineWidth=2;ctx.setLineDash([6,4]);ctx.beginPath();ctx.moveTo(X,200);ctx.lineTo(X,440);ctx.stroke();ctx.restore();bar(X,220,X,260,4,C.ink);label('PINS EQUALLY SPACED FROM THE SCRIBER FIND THE CENTRE OF ANY WIDTH',400,480,'center');},
  reads(){return[['Bar width',`${this.P.w} mm`],['Mark',`${this.P.w/2} mm from each edge`]];}});

/* ---- odds and ends with simple cycles ---- */
reg({num:244,outLabel:'Brake power, units',params:[{id:'m',label:'Weight on the arm',min:1,max:20,step:1,value:8,fmt:v=>v+' kg'}],
  update(phi){this.g={phi,tilt:0.04*Math.sin(phi*3)};},output(){return this.P.m*0.5*TAU;},
  draw(){const g=this.g,O=[260,270];flywheel(O[0],O[1],110,g.phi);ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=12;ctx.beginPath();ctx.arc(O[0],O[1],118,0,TAU);ctx.stroke();ctx.strokeStyle=C['brass-fill'];ctx.lineWidth=8;ctx.stroke();ctx.restore();
    ctx.save();ctx.translate(O[0],O[1]);ctx.rotate(g.tilt);ctx.beginPath();ctx.rect(110,-12,360,24);paint(C['steel-fill'],C.ink);bar(450,12,450,80,4,C.part);weight(450,80,40+this.P.m*2,40,'');ctx.restore();ctx.beginPath();ctx.rect(560,160,20,90);paint(C.part2,C.ink);label('STOPS',590,170);label('POWER = WEIGHT × ARM × SPEED',400,480,'center');},
  reads(){return[['Load',`${this.P.m} kg at 0.5 m`],['Torque',`${(this.P.m*9.81*0.5).toFixed(1)} N·m`],['At 60 rpm',`${(this.P.m*9.81*0.5*TAU).toFixed(0)} W`]];}});

reg({num:247,outLabel:'Depth, m',
  update(phi){const u=mod(phi*0.4,TAU)/TAU;this.g={phi,u,y:u<0.5?100+u*2*300:400-(u-0.5)*2*300,rel:u>=0.5};},output(){return this.g.y;},
  draw(){const g=this.g;water(0,80,800,340);ctx.save();ctx.fillStyle=C.part2;ctx.fillRect(0,420,800,100);ctx.restore();const X=400,y=g.y;ctx.beginPath();ctx.rect(X-8,y-80,16,100);paint(C['steel-fill'],C.ink);
    if(!g.rel){ctx.beginPath();ctx.rect(X-30,y+20,60,40);paint(C.part,C.ink);label('WEIGHT',X+40,y+40);}else{ctx.beginPath();ctx.rect(X-30,420-20,60,40);paint(C.part,C.ink);label('WEIGHT LEFT ON THE BOTTOM',X+40,410);}
    rope([[X,0],[X,y-80]]);label(g.rel?'STRUCK BOTTOM · weight released, tube comes back up with a sample':'SINKING',400,40,'center');},
  reads(){return[['Phase',this.g.rel?'returning':'sinking']];}});

reg({num:248,outLabel:'Gap, mm',
  update(phi){const c=openClose(phi);this.g={phi,c,gap:30*(1-c)};},output(){return this.g.gap;},
  draw(){const g=this.g,y=260;bar(80,y,380-g.gap,y,40,C['steel-fill']);bar(420,y,720,y,40,C['steel-fill']);ctx.beginPath();ctx.rect(370-g.gap,y-34,30,68);paint(C.part,C.ink);ctx.beginPath();ctx.rect(400,y-34,30,68);paint(C.part,C.ink);
    const nx=370-g.gap*0.5;ctx.beginPath();ctx.rect(nx-10,y-50,90,100);paint(C['brass-fill'],C.ink);ctx.save();ctx.strokeStyle=C.ink;for(let k=0;k<6;k++){const x=nx-6+mod(k*15+g.c*60,90);ctx.beginPath();ctx.moveTo(x,y-50);ctx.lineTo(x,y+50);ctx.stroke();}ctx.restore();label(g.c>0.98?'NUT TIGHT · pipes joined':'TURNING THE NUT DRAWS THE ENDS TOGETHER',400,400,'center');},
  reads(){return[['Joint',this.g.c>0.98?'made':'open']];}});

reg({num:249,outLabel:'Tube angle, degrees',
  update(phi){this.g={phi,a:0.5*Math.sin(phi*0.6),b:0.3*Math.cos(phi*0.6)};},output(){return this.g.a*180/PI;},
  draw(){const g=this.g,B=[360,270];bar(80,270,B[0]-40,270,40,C['steel-fill']);ctx.beginPath();ctx.arc(B[0],B[1],56,-PI/2-0.9,PI/2+0.9,true);paint(null,C.ink,10);circ(B[0],B[1],46);paint(C['brass-fill'],C.ink);
    const E=[B[0]+330*Math.cos(g.a),B[1]+330*Math.sin(g.a)];bar(B[0],B[1],E[0],E[1],36*(0.85+0.15*Math.cos(g.b)),C['steel-fill']);circ(B[0],B[1],46);paint(C['brass-fill'],C.ink);label('BALL TURNS IN THE SOCKET · the tube can point any way',400,480,'center');},
  reads(){return[['Swing',`${(this.g.a*180/PI).toFixed(0)}°`]];}});

reg({num:253,outLabel:'Drum speed, %',
  update(phi){const u=mod(phi*0.4,TAU)/TAU;const sp=u<0.6?0.4+u:u<0.62?1:0;this.g={phi,sp,caught:u>=0.6};},output(){return this.g.sp*100;},
  draw(){const g=this.g,O=[400,250],R=130;circ(O[0],O[1],R+30);paint(C.part2,C.ink);for(let k=0;k<16;k++){const a=k*TAU/16;poly([[O[0]+(R+30)*Math.cos(a),O[1]+(R+30)*Math.sin(a)],[O[0]+(R+30)*Math.cos(a+0.15),O[1]+(R+30)*Math.sin(a+0.15)],[O[0]+(R+14)*Math.cos(a+0.15),O[1]+(R+14)*Math.sin(a+0.15)]]);ctx.closePath();paint(C.part,C.ink,1);}
    circ(O[0],O[1],R);paint(C['brass-fill'],C.ink);const rot=g.phi*(g.caught?0:1)*1.5;for(const s of [0,PI]){const a=rot+s,out=g.sp>0.9?1:0;const P=[O[0]+90*Math.cos(a),O[1]+90*Math.sin(a)];ctx.save();ctx.translate(P[0],P[1]);ctx.rotate(a+PI/2-0.6*out);ctx.beginPath();ctx.rect(-8,-10,60,20);paint(C['steel-fill'],C.ink);ctx.restore();pivot(P[0],P[1],4);}
    pivot(O[0],O[1],6);rope([[O[0]+R,O[1]],[O[0]+R,500]]);label(g.caught?'RUNAWAY · hooks fly out and catch':'NORMAL SPEED · springs hold the hooks in',400,40,'center');},
  reads(){return[['Drum',this.g.caught?'stopped':`${(this.g.sp*100).toFixed(0)} %`]];}});

reg({num:261,outLabel:'Weight height, mm',concept:true,
  update(phi){const u=mod(phi,TAU)/TAU;const h=u<0.65?u/0.65:1-(u-0.65)/0.35;this.g={phi,h};},output(){return this.g.h*150;},
  draw(){const g=this.g,O=[300,180];circ(O[0],O[1],90);paint(C['brass-fill'],C.ink);bar(O[0],O[1],O[0]+70*Math.cos(g.phi),O[1]+70*Math.sin(g.phi),8,C.part2);pivot(O[0],O[1],6);pulley(520,120,40,-g.h*4,C.part);rope([[O[0]+70*Math.cos(g.phi),O[1]+70*Math.sin(g.phi)],[520,80],[560,120],[560,420-g.h*150]]);weight(560,420-g.h*150,60,50,'');label('SLOW LIFT, QUICKER RETURN',400,480,'center');},
  reads(){return[['Weight',`${(this.g.h*150).toFixed(0)} mm`]];}});

reg({num:265,outLabel:'Roller speed, ×',params:[{id:'x',label:'Roller position',min:0,max:1,step:0.02,value:0.5,fmt:v=>`${Math.round(v*100)} %`}],
  update(phi){const r=40+100*this.P.x;this.g={phi,r};},output(){return this.g.r/30;},
  draw(){const g=this.g,y=300;poly([[150,y-40],[650,y-140],[650,y],[150,y]]);ctx.closePath();paint(C['brass-fill'],C.ink);const x=150+500*this.P.x;circ(x,y-g.r-34+30,30);paint(C['steel-fill'],C.ink);bar(x,y-g.r-4,x,60,8,C.part);bar(80,y-20,150,y-20,10,C.part);label('SLIDE THE ROLLER ALONG THE CONE TO CHANGE SPEED',400,470,'center');},
  reads(){return[['Cone radius here',`${this.g.r.toFixed(0)} mm`],['Roller speed',`${(this.g.r/30).toFixed(2)} × cone`]];}});

reg({num:267,outLabel:'Pulley turns',
  reset(){this.w=0;this.last=null;},
  update(phi){const a=0.6*Math.sin(phi);if(this.last===null)this.last=a;const d=a-this.last;this.last=a;if(d>0)this.w+=d;this.g={phi,a,grip:d>0};},output(){return this.w/TAU;},
  draw(){const g=this.g,O=[400,270];circ(O[0],O[1],160);circ(O[0],O[1],130,false);paint(C['steel-fill'],C.ink);bar(O[0],O[1],O[0]+150*Math.cos(this.w),O[1]+150*Math.sin(this.w),6,C.part2);
    for(let k=0;k<3;k++){const a=g.a+k*TAU/3;const P=[O[0]+80*Math.cos(a),O[1]+80*Math.sin(a)];bar(O[0],O[1],P[0],P[1],12,C['brass-fill']);ctx.save();ctx.translate(P[0],P[1]);ctx.rotate(a+(g.grip?0.15:0.4));ctx.beginPath();ctx.ellipse(28,0,30,14,0,0,TAU);paint(C.part,C.ink);ctx.restore();pivot(P[0],P[1],4);}
    pivot(O[0],O[1],6);label(g.grip?'ARMS JAM AGAINST THE RIM · pulley driven':'ARMS SLIP BACK FREELY',400,470,'center');},
  reads(){return[['Arms',this.g.grip?'gripping':'slipping'],['Pulley',`${(this.w/TAU).toFixed(2)} turns`]];}});

reg({num:334,outLabel:'Piston height, mm',
  update(phi){const a=0.3*Math.sin(phi);this.g={phi,a,y:a*150};},output(){return this.g.y;},
  draw(){const g=this.g,F=[460,200],R=150;ctx.save();ctx.translate(F[0],F[1]);ctx.rotate(g.a);ctx.beginPath();ctx.rect(-10,-12,280,24);paint(C['brass-fill'],C.ink);ctx.restore();poly(gearPts(F[0],F[1],R,60,g.a+PI,false,PI-0.5,PI+0.5));ctx.lineTo(F[0],F[1]);ctx.closePath();paint(C['brass-fill'],C.ink);pivot(F[0],F[1],7);
    const X=F[0]-R-12,y=F[1]-g.y;ctx.beginPath();ctx.rect(X-16,y-140,24,300);paint(C['steel-fill'],C.ink);for(let k=0;k<15;k++){ctx.beginPath();ctx.rect(X+8,y-136+k*20,8,10);paint(C['steel-fill'],C.ink,.8);}ctx.beginPath();ctx.rect(X-60,360,90,140);paint(C.part2,C.ink);label('RACK ON THE PISTON ROD WORKS THE BEAM SECTOR',400,40,'center');},
  reads(){return[['Rod',`${this.g.y.toFixed(0)} mm`],['Beam',`${(this.g.a*180/PI).toFixed(0)}°`]];}});

reg({num:366,outLabel:'Drill depth, mm',
  update(phi){const d=40*(1-Math.cos(phi*0.3))/2;this.g={phi,d};},output(){return this.g.d;},
  draw(){const g=this.g,X=400;drawGear(X,120,60,24,g.phi,C['brass-fill'],{bore:8});drawGear(X+100,160,40,16,-g.phi*1.5,C.part,{bore:5});ctx.beginPath();ctx.rect(X-8,80,16,220+g.d);paint(C['steel-fill'],C.ink);poly([[X-8,300+g.d],[X+8,300+g.d],[X,330+g.d]]);ctx.closePath();paint(C.ink);
    ctx.beginPath();ctx.rect(250,360,300,40);paint(C.part2,C.ink);bar(X+12,200,620,300+g.d*2,10,C.part);pivot(620,300+g.d*2,5);label('PEDAL',640,330);label('SHAFT SLIDES THROUGH THE TURNING BEVEL GEAR',400,480,'center');},
  reads(){return[['Depth',`${this.g.d.toFixed(0)} mm`]];}});

reg({num:372,outLabel:'Balance load, kg',params:[{id:'p',label:'Power transmitted',min:0,max:100,step:1,value:50,fmt:v=>v+' %'}],
  update(phi){this.g={phi,t:this.P.p/100};},output(){return this.g.t*20;},
  draw(){const g=this.g,O=[400,260];bar(80,O[1],O[0]-60,O[1],16,C.part2);bar(O[0]+60,O[1],720,O[1],16,C.part2);for(const s of [-1,1]){poly([[O[0]+s*50,O[1]-70],[O[0]+s*80,O[1]-40],[O[0]+s*80,O[1]+40],[O[0]+s*50,O[1]+70]]);ctx.closePath();paint(s<0?C['brass-fill']:C['steel-fill'],C.ink);}
    ctx.beginPath();ctx.rect(O[0]-30,O[1]-100,60,200);paint(C.part,C.ink);ctx.save();ctx.translate(O[0],O[1]);ctx.rotate(0.02*Math.sin(g.phi*4));ctx.beginPath();ctx.rect(30,-10,200,20);paint(C.part2,C.ink);ctx.restore();weight(O[0]+220,O[1]+20,30+g.t*40,30+g.t*40,'');label('WEIGHT HOLDS THE RING OF BEVELS STILL · its size measures the power',400,480,'center');},
  reads(){return[['Weight needed',`${(this.g.t*20).toFixed(1)} kg`]];}});

reg({num:373,outLabel:'Spring reading, N',params:[{id:'m',label:'Load on the wagon',min:1,max:10,step:1,value:4,fmt:v=>v+' kg'}],
  update(phi){this.g={phi,f:0.3*this.P.m*9.81};},output(){return this.g.f;},
  draw(){const g=this.g,O=[400,360];flywheel(O[0],O[1],150,g.phi);ctx.beginPath();ctx.rect(O[0]-60,O[1]-200,120,40);paint(C['brass-fill'],C.ink);for(const s of [-1,1]){circ(O[0]+s*40,O[1]-152,12);paint(C.part,C.ink);}for(let k=0;k<this.P.m;k++){ctx.beginPath();ctx.rect(O[0]-50+(k%5)*20,O[1]-220-Math.floor(k/5)*20,18,18);paint(C['steel-fill'],C.ink,1);}
    const ext=g.f*3;springZ(O[0]+60,O[1]-180,O[0]+120+ext,O[1]-180,10,6);bar(O[0]+120+ext,O[1]-180,700,O[1]-180,6,C.part);ground(700,O[1]-190,30);label(`SPRING READS ${g.f.toFixed(1)} N`,O[0]+140,O[1]-210);label('MORE LOAD, MORE FRICTION PULL',400,40,'center');},
  reads(){return[['Load',`${this.P.m} kg`],['Friction pull',`${this.g.f.toFixed(1)} N`],['Ratio','constant (μ ≈ 0.3)']];}});

function treadW(num,o){return reg({num,outLabel:'Wheel turns',concept:!!o.concept,
  update(phi){this.g={phi:phi*0.4};},output(){return this.g.phi/TAU;},
  draw(){const g=this.g,O=[400,260],R=190;
    if(o.kind==='incline'){ctx.save();ctx.translate(O[0],O[1]+60);ctx.rotate(-0.25);ctx.beginPath();ctx.ellipse(0,0,R,60,0,0,TAU);paint(C.part,C.ink);for(let k=0;k<16;k++){const a=g.phi+k*TAU/16;if(Math.sin(a)>0){ctx.beginPath();ctx.moveTo(R*0.3*Math.cos(a),60*0.3*Math.sin(a));ctx.lineTo(R*Math.cos(a),60*Math.sin(a));paint(null,C.ink,1);}}ctx.restore();
      const P=[O[0]+40,O[1]-10];ctx.beginPath();ctx.ellipse(P[0],P[1],60,26,-0.25,0,TAU);paint(C['brass-fill'],C.ink);for(let k=0;k<4;k++){const l=12*Math.sin(g.phi*8+k*PI/2);bar(P[0]-40+k*24,P[1]+10,P[0]-40+k*24+l,P[1]+50,6,C['brass-fill']);}bar(O[0],O[1]+60,O[0],480,10,C.part2);label('THE ANIMAL WALKS UPHILL ON A TILTED WHEEL',400,40,'center');}
    else{circ(O[0],O[1],R);circ(O[0],O[1],R-30,false);paint(C.part,C.ink);for(let k=0;k<24;k++){const a=g.phi+k*TAU/24;ctx.save();ctx.translate(O[0]+R*Math.cos(a),O[1]+R*Math.sin(a));ctx.rotate(a);ctx.beginPath();ctx.rect(-4,-10,24,20);paint(C.part2,C.ink,1);ctx.restore();}
      const F=[O[0]+R*Math.cos(-0.5)+10,O[1]+R*Math.sin(-0.5)-60];const st=Math.sin(g.phi*10)*10;bar(F[0],F[1],F[0]-10+st,F[1]+60,8,C['brass-fill']);bar(F[0],F[1],F[0]+10-st,F[1]+56,8,C['brass-fill']);bar(F[0],F[1],F[0],F[1]-50,10,C['brass-fill']);circ(F[0],F[1]-62,12);paint(C['brass-fill'],C.ink);ctx.beginPath();ctx.rect(F[0]-60,F[1]-70,10,90);paint(C.part2,C.ink);pivot(O[0],O[1],8);label('STEPPING ON THE TREADS TURNS THE WHEEL',400,500,'center');}},
  reads(){return[['Power','body weight on the steps']];}});}
treadW(376,{kind:'incline'});treadW(377,{});

reg({num:378,outLabel:'Saw position, mm',
  update(phi){this.g={phi,a:0.35*Math.sin(phi)};},output(){return this.g.a*300;},
  draw(){const g=this.g,F=[400,40];ctx.beginPath();ctx.rect(100,30,600,14);paint(C.part2,C.ink);ctx.save();ctx.translate(F[0],F[1]);ctx.rotate(-g.a);bar(0,0,0,330,10,C.part);ctx.beginPath();ctx.rect(-160,330,320,26);paint(C['steel-fill'],C.ink);for(let k=0;k<16;k++){poly([[-160+k*20,356],[-150+k*20,368],[-140+k*20,356]]);ctx.closePath();paint(C['steel-fill'],C.ink,.8);}ctx.restore();pivot(F[0],F[1],6);
    circ(400,470,80);paint(C['brass-fill'],C.ink);for(let k=1;k<4;k++){circ(400,470,k*20);paint(null,C.ink,.6);}label('THE SWINGING SAW CUTS ACROSS THE LOG',600,200);},
  reads(){return[['Swing',`${(this.g.a*180/PI).toFixed(0)}°`]];}});

function cramp(num,o){return reg({num,outLabel:'Drill feed, mm',
  update(phi){const d=mod(phi*3,90);this.g={phi,d};},output(){return this.g.d;},
  draw(){const g=this.g;ctx.beginPath();ctx.moveTo(180,80);ctx.lineTo(620,80);ctx.lineTo(620,460);ctx.lineTo(560,460);ctx.lineTo(560,130);ctx.lineTo(180,130);ctx.closePath();paint(C.part2,C.ink);ctx.beginPath();ctx.rect(180,380,400,80);paint(C.part,C.ink);label('WORK',380,420,'center');
    const X=300;ctx.beginPath();ctx.rect(X-14,130,28,120+g.d);paint(C['steel-fill'],C.ink);ctx.save();ctx.beginPath();ctx.rect(X-14,130,28,120+g.d);ctx.clip();ctx.strokeStyle=C.ink;for(let y=130+mod(g.phi*20,16);y<260+g.d;y+=16){ctx.beginPath();ctx.moveTo(X-14,y);ctx.lineTo(X+14,y+6);ctx.stroke();}ctx.restore();
    poly([[X-10,250+g.d],[X+10,250+g.d],[X,290+g.d]]);ctx.closePath();paint(C.ink);bar(X-60,110,X+60,110,8,C['brass-fill']);bar(X+60,110,X+60,70,8,C['brass-fill']);label(o.label,400,500,'center');},
  reads(){return[['Feed',`${this.g.d.toFixed(0)} mm`]];}});}
cramp(379,{label:'CRAMP DRILL · feed screw opposite the drill'});cramp(380,{label:'CRAMP DRILL · spindle through the feed screw'});

reg({num:382,outLabel:'Height, mm',concept:true,
  update(phi){this.g={phi,h:60*(1+Math.sin(phi*0.4))/2,sw:0.5*Math.sin(phi*0.3),t:0.3*Math.sin(phi*0.5)};},output(){return this.g.h;},
  draw(){const g=this.g,X=400;ctx.beginPath();ctx.rect(X-100,440,200,30);paint(C.part2,C.ink);ctx.beginPath();ctx.rect(X-14,260,28,180);paint(C.part,C.ink);ctx.beginPath();ctx.rect(X-10,200-g.h,20,240);paint(C['steel-fill'],C.ink);const T=[X,200-g.h];
    ctx.save();ctx.translate(T[0],T[1]);ctx.rotate(g.t);ctx.beginPath();ctx.ellipse(0,0,150*Math.abs(Math.cos(g.sw))+30,16,0,0,TAU);paint(C['brass-fill'],C.ink);ctx.restore();pivot(T[0],T[1],6);label('RAISES · SWIVELS · TILTS',400,40,'center');},
  reads(){return[['Height',`${this.g.h.toFixed(0)} mm`],['Tilt',`${(this.g.t*180/PI).toFixed(0)}°`]];}});

reg({num:383,outLabel:'Cloth travel, mm',
  update(phi){this.g={phi};},output(){return this.g.phi*20;},
  draw(){const g=this.g,B=[400,210];circ(B[0],B[1],90);paint(C['brass-fill'],C.ink);for(let k=0;k<36;k++){const a=-g.phi*4+k*TAU/36;bar(B[0]+90*Math.cos(a),B[1]+90*Math.sin(a),B[0]+104*Math.cos(a),B[1]+104*Math.sin(a),2,C.ink);}pivot(B[0],B[1],6);
    for(const x of [200,600]){pulley(x,340,40,g.phi,C.part);}ctx.save();ctx.strokeStyle=C.steel;ctx.lineWidth=5;ctx.setLineDash([16,6]);ctx.lineDashOffset=-g.phi*40;ctx.beginPath();ctx.moveTo(60,300);ctx.lineTo(200,300);ctx.lineTo(B[0],B[1]+110);ctx.lineTo(600,300);ctx.lineTo(740,300);ctx.stroke();ctx.restore();label('CLOTH CARRIED PAST THE BRUSH CYLINDER',400,470,'center');},
  reads(){return[['Brush','turns against the cloth']];}});

reg({num:385,outLabel:'Door angle, degrees',
  update(phi){const u=mod(phi*0.5,TAU)/TAU;const a=u<0.3?smooth(u/0.3):u<0.45?1:1-smooth((u-0.45)/0.45);this.g={phi,a:a*1.3};},output(){return this.g.a*180/PI;},
  draw(){const g=this.g,H=[200,300];ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=12;ctx.beginPath();ctx.moveTo(60,300);ctx.lineTo(H[0],H[1]);ctx.moveTo(H[0]+300,300);ctx.lineTo(760,300);ctx.stroke();ctx.restore();const D=[H[0]+300*Math.cos(-g.a),H[1]+300*Math.sin(-g.a)];bar(H[0],H[1],D[0],D[1],14,C['brass-fill']);pivot(H[0],H[1],6);
    const K=[H[0]+80*Math.cos(-g.a),H[1]+80*Math.sin(-g.a)],T=[H[0]+90,H[1]-120];bar(K[0],K[1],T[0],T[1]+40*g.a,6,C.part);rope([[T[0],T[1]+40*g.a],[T[0],60],[T[0]+120,60],[T[0]+120,200-g.a*60]]);weight(T[0]+120,200-g.a*60,40,40,'');label('SEEN FROM ABOVE · opening lifts the weight, which pulls the door shut',400,480,'center');},
  reads(){return[['Door',`${(this.g.a*180/PI).toFixed(0)}° open`]];}});

reg({num:386,outLabel:'Unfold, %',
  update(phi){this.g={phi,f:openClose(phi)};},output(){return this.g.f*100;},
  draw(){const g=this.g,B=[300,460],a=-PI/2+0.25,L=290;const s1=[B[0],B[1]],t1=[B[0]+L*Math.cos(a),B[1]+L*Math.sin(a)];const b=a+PI*(1-g.f)*0.95+0.5*g.f;const t2=[t1[0]+L*0.9*Math.cos(b+PI),t1[1]+L*0.9*Math.sin(b+PI)];
    bar(s1[0],s1[1],t1[0],t1[1],12,C['brass-fill']);bar(t1[0],t1[1],t2[0],t2[1],12,C['steel-fill']);pivot(t1[0],t1[1],6);for(let k=1;k<6;k++){const p=[s1[0]+(t1[0]-s1[0])*k/6,s1[1]+(t1[1]-s1[1])*k/6],q=[t1[0]+(t2[0]-t1[0])*(1-k/6),t1[1]+(t2[1]-t1[1])*(1-k/6)];if(g.f>0.5)bar(p[0],p[1],q[0],q[1],4,C.part);}
    ctx.beginPath();ctx.rect(60,460,680,10);paint(C.part2,C.ink);label(g.f>0.95?'OPEN AS STEPS':g.f<0.05?'FOLDED AS A POLE':'FOLDING',560,200);},
  reads(){return[['State',this.g.f>0.95?'steps':this.g.f<0.05?'folded':'moving']];}});

reg({num:387,outLabel:'Ladder tilt, degrees',
  update(phi){this.g={phi,a:-PI/2+0.5*Math.sin(phi*0.5)};},output(){return (this.g.a+PI/2)*180/PI;},
  draw(){const g=this.g,A=[320,460],B=[460,460],L=380,d=[L*Math.cos(g.a),L*Math.sin(g.a)];bar(A[0],A[1],A[0]+d[0],A[1]+d[1],12,C['brass-fill']);bar(B[0],B[1],B[0]+d[0],B[1]+d[1],12,C['brass-fill']);
    for(let k=1;k<6;k++){const p=[A[0]+d[0]*k/6,A[1]+d[1]*k/6];bar(p[0],p[1],p[0]+140,p[1],8,C['steel-fill']);pivot(p[0],p[1],3);pivot(p[0]+140,p[1],3);}pivot(A[0],A[1],6);pivot(B[0],B[1],6);ctx.beginPath();ctx.rect(60,466,680,10);paint(C.part2,C.ink);label('STEPS STAY LEVEL WHATEVER THE TILT',400,40,'center');},
  reads(){return[['Tilt',`${((this.g.a+PI/2)*180/PI).toFixed(0)}°`],['Steps','level']];}});

reg({num:388,outLabel:'Board travel, mm',
  update(phi){this.g={phi,x:mod(phi*40,600)};},output(){return this.g.x;},
  draw(){const g=this.g;ctx.beginPath();ctx.rect(g.x-300,250,400,30);paint(C['brass-fill'],C.ink);for(const x of [300,500]){drawGear(x,214,30,14,-g.phi*1.3,C['steel-fill'],{bore:4});circ(x,316,34);paint(C.part,C.ink);bar(x,316,x+26*Math.cos(g.phi*1.2),316+26*Math.sin(g.phi*1.2),4,C.part2);pivot(x,214,4);pivot(x,316,4);}
    label('TOOTHED ROLLERS ABOVE, SMOOTH BELOW',400,420,'center');},
  reads(){return[['Feed','steady, without slipping']];}});

reg({num:391,outLabel:'Gear turns',concept:true,
  reset(){this.w=0;this.last=null;},
  update(phi){const y=70*Math.sin(phi);if(this.last===null)this.last=y;const d=y-this.last;this.last=y;this.w+=Math.abs(d)/50;this.g={phi,y,d};},output(){return this.w/TAU;},
  draw(){const g=this.g,P=[400,270];drawGear(P[0],P[1],50,18,this.w,C['brass-fill'],{bore:6});pivot(P[0],P[1],5);for(const s of [-1,1]){const y=P[1]+s*g.y;const act=s*g.d<0;ctx.beginPath();ctx.rect(P[0]+s*62-10,y-110,20,220);paint(act?C['steel-fill']:C.part,C.ink);weight(P[0]+s*62,y+110,50,40,'');}
    label('EACH WEIGHTED RACK DRIVES THE GEAR AS IT FALLS',400,40,'center');},
  reads(){return[['Gear','turns one way']];}});

reg({num:395,outLabel:'Plug angle, degrees',
  update(phi){const k=Math.floor(phi/PI),u=mod(phi,PI)/PI;const a=(k+smooth((u-0.4)/0.2))*PI/2;this.g={phi,a,st:mod(Math.round(a/(PI/2)),2)};},output(){return this.g.a*180/PI;},
  draw(){const g=this.g,O=[400,260];circ(O[0],O[1],110);paint(C.part2,C.ink);for(const a of [0,PI/2,PI,PI*1.5]){bar(O[0]+110*Math.cos(a),O[1]+110*Math.sin(a),O[0]+200*Math.cos(a),O[1]+200*Math.sin(a),40,C.part);}
    circ(O[0],O[1],90);paint(C['brass-fill'],C.ink);for(const s of [0,PI]){ctx.save();ctx.translate(O[0],O[1]);ctx.rotate(g.a+s);ctx.beginPath();ctx.arc(0,0,60,-PI/4,PI/4);ctx.arc(0,0,20,PI/4,-PI/4,true);ctx.closePath();ctx.fillStyle=C.sheet;ctx.fill();ctx.strokeStyle=C.ink;ctx.stroke();ctx.restore();}
    label('STEAM',O[0],O[1]-215,'center');label('EXHAUST',O[0],O[1]+225,'center');label('CYL. END A',O[0]-280,O[1]);label('CYL. END B',O[0]+215,O[1]);label(g.st?'STEAM → B · A → EXHAUST':'STEAM → A · B → EXHAUST',400,40,'center');},
  reads(){return[['Steam to',this.g.st?'end B':'end A']];}});

reg({num:399,outLabel:'Link length, mm',
  update(phi){const c=openClose(phi);this.g={phi,c,L:200-60*c};},output(){return this.g.L;},
  draw(){const g=this.g,y=260,A=400-g.L/2,B=400+g.L/2;ctx.save();ctx.lineWidth=14;ctx.strokeStyle=C.ink;for(const x of [A-80,B+80]){ctx.beginPath();ctx.ellipse(x,y,50,26,0,0,TAU);ctx.stroke();}ctx.restore();
    bar(A-30,y,400-20,y,16,C['steel-fill']);bar(400+20,y,B+30,y,16,C['steel-fill']);ctx.beginPath();ctx.rect(360,y-26,80,52);paint(C['brass-fill'],C.ink);ctx.save();ctx.strokeStyle=C.ink;for(let k=0;k<5;k++){const x=362+mod(k*16+g.c*50,76);ctx.beginPath();ctx.moveTo(x,y-26);ctx.lineTo(x,y+26);ctx.stroke();}ctx.restore();label('TURNING THE SLEEVE SHORTENS THE LINK',400,400,'center');},
  reads(){return[['Link',`${this.g.L.toFixed(0)} mm`]];}});

reg({num:412,outLabel:'Drum turns',params:[{id:'m',type:'toggle',label:'Purchase',options:[[1,'Single'],[3,'Triple']],value:3}],
  update(phi){this.g={phi,d:phi/this.P.m};},output(){return this.g.d/TAU;},
  draw(){const g=this.g,O=[400,280];circ(O[0],O[1],100);paint(C['brass-fill'],C.ink);for(let k=0;k<6;k++){const a=g.phi*0.3+k*PI/3;bar(O[0],O[1],O[0]+230*Math.cos(a),O[1]+230*Math.sin(a)*0.35,10,C.part2);}
    if(this.P.m===3){drawGear(O[0],O[1]+150,30,12,g.phi,C.part,{bore:4});drawGear(O[0]+60,O[1]+150,30,12,-g.phi,C.part,{bore:4});}circ(O[0],O[1],60);paint(C['steel-fill'],C.ink);bar(O[0],O[1],O[0]+50*Math.cos(g.d),O[1]+50*Math.sin(g.d),6,C.part);pivot(O[0],O[1],6);
    label(this.P.m===3?'GEARS ENGAGED · three times the pull, a third the speed':'DIRECT · capstan and drum turn together',400,480,'center');},
  reads(){return[['Purchase',this.P.m===3?'triple':'single'],['Drum',`${(this.g.d/TAU).toFixed(2)} turns`]];}});

reg({num:419,outLabel:'Cradle angle, degrees',concept:true,
  update(phi){this.g={phi,a:0.2*Math.sin(phi)};},output(){return this.g.a*180/PI;},
  draw(){const g=this.g,P=[400,140];ctx.save();ctx.translate(P[0],P[1]);ctx.rotate(g.a);bar(0,0,0,150,8,C.part);ctx.beginPath();ctx.moveTo(-160,150);ctx.lineTo(160,150);ctx.quadraticCurveTo(140,260,0,270);ctx.quadraticCurveTo(-140,260,-160,150);paint(C['brass-fill'],C.ink);ctx.restore();pivot(P[0],P[1],6);
    flywheel(640,380,60,g.phi);rope([[640,320],[P[0]+150*Math.sin(-g.a)+100,P[1]+150]]);label('WHEELS AND BANDS ROCK THE CRADLE',400,480,'center');},
  reads(){return[['Rock',`${(this.g.a*180/PI).toFixed(0)}°`]];}});

reg({num:420,outLabel:'Hammer angle, degrees',
  update(phi){const u=mod(phi,TAU)/TAU;const a=u<0.5?-0.8*smooth(u/0.5):u<0.55?-0.8+0.85*smooth((u-0.5)/0.05):0.05*(1-smooth((u-0.55)/0.1))-0.12*smooth((u-0.55)/0.1);this.g={phi,a,hit:u>0.54&&u<0.6};},output(){return this.g.a*180/PI;},
  draw(){const g=this.g,B=[300,260];ctx.beginPath();ctx.moveTo(B[0]-90,B[1]+120);ctx.quadraticCurveTo(B[0]-60,B[1]-120,B[0],B[1]-130);ctx.quadraticCurveTo(B[0]+60,B[1]-120,B[0]+90,B[1]+120);ctx.closePath();paint(C['brass-fill'],C.ink);
    const F=[560,200];ctx.save();ctx.translate(F[0],F[1]);ctx.rotate(PI-g.a);ctx.beginPath();ctx.rect(0,-6,160,12);paint(C.part,C.ink);circ(170,0,20);paint(C['steel-fill'],C.ink);ctx.restore();pivot(F[0],F[1],6);springZ(F[0],F[1]+20,F[0]+40,F[1]+100,6,5);if(g.hit)label('DING',B[0]+110,B[1]-30);label('SPRING LIFTS THE HAMMER CLEAR SO THE BELL RINGS ON',400,480,'center');},
  reads(){return[['Hammer',this.g.hit?'striking':'clear of the bell']];}});

reg({num:492,outLabel:'Hook angle, degrees',
  update(phi){const u=mod(phi*0.5,TAU)/TAU;const rel=u>0.5;this.g={phi,rel,a:rel?0.9*smooth((u-0.5)/0.1):0,y:rel?Math.min(200,(u-0.5)*800):0};},output(){return this.g.a*180/PI;},
  draw(){const g=this.g,H=[400,180];rope([[H[0],0],[H[0],H[1]]]);ctx.save();ctx.translate(H[0],H[1]);ctx.rotate(g.a);ctx.beginPath();ctx.moveTo(-6,0);ctx.lineTo(6,0);ctx.lineTo(6,60);ctx.quadraticCurveTo(6,90,-26,84);ctx.lineTo(-26,72);ctx.quadraticCurveTo(-6,76,-6,60);ctx.closePath();paint(C['steel-fill'],C.ink);ctx.restore();pivot(H[0],H[1],5);
    const ry=H[1]+80+g.y;ctx.save();ctx.lineWidth=8;ctx.strokeStyle=C.ink;ctx.beginPath();ctx.arc(H[0]-14,ry,14,0,TAU);ctx.stroke();ctx.restore();ctx.beginPath();ctx.ellipse(H[0]-14,ry+120,160,40,0,0,PI);paint(C['brass-fill'],C.ink);rope([[H[0]-14,ry+14],[H[0]-14,ry+100]]);rope([[H[0]+20,H[1]+20],[600,H[1]+20]]);label(g.rel?'LINE PULLED · hook tips, boat drops free':'BOAT HANGING',400,40,'center');},
  reads(){return[['Boat',this.g.rel?'released':'held']];}});

reg({num:493,outLabel:'Stone lift, mm',
  update(phi){const u=mod(phi*0.5,TAU)/TAU;const ins=smooth(u/0.3),lift=u<0.35?0:u<0.8?smooth((u-0.35)/0.3)*120:120*(1-smooth((u-0.8)/0.2));this.g={phi,ins,lift};},output(){return this.g.lift;},
  draw(){const g=this.g,X=400,y=300-g.lift;ctx.beginPath();ctx.rect(X-160,y,320,180);paint(C.part2,C.ink);ctx.beginPath();ctx.moveTo(X-20,y);ctx.lineTo(X-36,y+90);ctx.lineTo(X+36,y+90);ctx.lineTo(X+20,y);ctx.closePath();ctx.fillStyle=C.sheet;ctx.fill();ctx.strokeStyle=C.ink;ctx.stroke();
    const d=90*g.ins;for(const s of [-1,1]){poly([[X+s*20,y-60+d*0],[X+s*8,y-60],[X+s*(8+16*g.ins),y-60+d],[X+s*(20+16*g.ins),y-60+d]]);ctx.closePath();paint(C['steel-fill'],C.ink);}ctx.beginPath();ctx.rect(X-8,y-60,16,90*g.ins+60);paint(C['brass-fill'],C.ink);bar(X-30,y-70,X+30,y-70,10,C.part);rope([[X,0],[X,y-70]]);label('WEDGES SPREAD IN THE DOVETAIL HOLE AND GRIP THE STONE',400,500,'center');},
  reads(){return[['Lift',`${this.g.lift.toFixed(0)} mm`]];}});

reg({num:494,outLabel:'Grip force, relative',
  update(phi){const u=mod(phi*0.5,TAU)/TAU;const lift=u<0.2?0:u<0.7?smooth((u-0.2)/0.3)*120:120*(1-smooth((u-0.7)/0.3));this.g={phi,lift,sq:Math.min(1,lift/30)};},output(){return this.g.sq*10;},
  draw(){const g=this.g,X=400,y=320-g.lift,P=[X,y-120];const open=1-g.sq;ctx.beginPath();ctx.rect(X-110,y,220,150);paint(C.part2,C.ink);for(const s of [-1,1]){const E=[X-s*(110+10*open),y+60],T=[X+s*90,y-200];bar(P[0],P[1],E[0],E[1],12,C['steel-fill']);bar(P[0],P[1],T[0],T[1],12,C['steel-fill']);}rope([[X-90,y-200],[X,y-260],[X+90,y-200]]);rope([[X,0],[X,y-260]]);pivot(P[0],P[1],6);
    label('THE PULL ON THE CHAIN SQUEEZES THE JAWS · heavier stone, firmer grip',400,500,'center');},
  reads(){return[['Lifted',`${this.g.lift.toFixed(0)} mm`]];}});

reg({num:496,outLabel:'Spindle turns',
  update(phi){this.g={phi};},output(){return this.g.phi*3/TAU;},
  draw(){const g=this.g,y=200;const sp=[1,1.6,3];for(let k=0;k<3;k++){const x=180+k*130;circ(x,y-26,22);paint(C.part,C.ink);circ(x,y+26,22);paint(C['brass-fill'],C.ink);bar(x,y-26,x+18*Math.cos(g.phi*sp[k]),y-26+18*Math.sin(g.phi*sp[k]),4,C.part2);}
    ctx.save();ctx.strokeStyle=C.steel;ctx.lineWidth=10;ctx.beginPath();ctx.moveTo(60,y);ctx.lineTo(180,y);ctx.stroke();ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(180,y);ctx.lineTo(310,y);ctx.stroke();ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(310,y);ctx.lineTo(440,y);ctx.lineTo(600,280);ctx.stroke();ctx.restore();
    const S=[600,360];ctx.beginPath();ctx.rect(S[0]-8,S[1]-90,16,200);paint(C['steel-fill'],C.ink);ctx.save();ctx.translate(S[0],S[1]-60);ctx.rotate(g.phi*3);bar(0,0,40,0,4,C.part);ctx.restore();ctx.beginPath();ctx.ellipse(S[0],S[1]+40,30,50,0,0,TAU);paint(C['brass-fill'],C.ink);
    label('EACH PAIR OF ROLLERS RUNS FASTER · the fibre is drawn out thin',300,120,'center');label('THROSTLE SPINDLE TWISTS AND WINDS IT',600,480,'center');},
  reads(){return[['Draft','3 ×'],['Roller speeds','1 : 1.6 : 3']];}});

/* ================= audit pass · ropes and pulley systems (12–22) ================= */
/* ---- rope engine: a rope runs from a point, round circles (sheaves) and ends at a point.
   node = {c:[x,y], r, s}: s=+1 the rope travels clockwise on screen round it (over the top left→right), s=-1 anticlockwise (under, left→right).
   Returns the polyline and the rope length up to the middle of each sheave's wrap (for sheave rotation). */
function tanLine(A,B){const ra=A.r||0,rb=B.r||0,sa=A.s||1,sb=B.s||1,dx=B.c[0]-A.c[0],dy=B.c[1]-A.c[1],D=Math.hypot(dx,dy)||1e-9,th=Math.atan2(dy,dx);
  const k=(ra-sa*sb*rb)/D;if(Math.abs(k)>1)return null;let best=null;
  for(const sg of [1,-1]){const a=th+sg*Math.acos(k);const p1=[A.c[0]+ra*Math.cos(a),A.c[1]+ra*Math.sin(a)];const dir=ra>0?[-sa*Math.sin(a),sa*Math.cos(a)]:null;
    /* tangent point on B */let p2;if(rb>0){const b=a+(sa*sb>0?0:PI);p2=[B.c[0]+rb*Math.cos(b),B.c[1]+rb*Math.sin(b)];}else p2=B.c.slice();
    const v=[p2[0]-p1[0],p2[1]-p1[1]];if(dir&&v[0]*dir[0]+v[1]*dir[1]<=1e-9)continue;
    if(rb>0){const b=Math.atan2(p2[1]-B.c[1],p2[0]-B.c[0]);const tb=[-sb*Math.sin(b),sb*Math.cos(b)];if(v[0]*tb[0]+v[1]*tb[1]<=1e-9)continue;}
    best={p1,p2};break;}
  return best;}
function ropeThru(nodes,step=4){const segs=[];for(let i=0;i<nodes.length-1;i++)segs.push(tanLine(nodes[i],nodes[i+1]));
  const pts=[],mids=[];let L=0;const push=p=>{if(pts.length){const q=pts[pts.length-1];L+=Math.hypot(p[0]-q[0],p[1]-q[1]);}pts.push(p);};
  for(let i=0;i<nodes.length;i++){const N=nodes[i];
    if(N.r>0&&i>0&&i<nodes.length-1&&segs[i-1]&&segs[i]){const a0=Math.atan2(segs[i-1].p2[1]-N.c[1],segs[i-1].p2[0]-N.c[0]),a1=Math.atan2(segs[i].p1[1]-N.c[1],segs[i].p1[0]-N.c[0]);
      let d=N.s>0?mod(a1-a0,TAU):-mod(a0-a1,TAU);const n=Math.max(2,Math.ceil(Math.abs(d)*N.r/step));let Lm=0;
      for(let k=0;k<=n;k++){const a=a0+d*k/n;push([N.c[0]+N.r*Math.cos(a),N.c[1]+N.r*Math.sin(a)]);if(k===Math.floor(n/2))Lm=L;}mids[i]=Lm;}
    else{if(i===0)push(N.c.slice());else if(segs[i-1])push(segs[i-1].p2);}}
  return{pts,len:L,mids};}
/* draw a rope: dark core with light marks fixed to the rope material (they move with it) */
function drawRope(pts,off=0,w=2.6){if(pts.length<2)return;ctx.save();ctx.lineJoin='round';ctx.lineCap='round';ctx.beginPath();poly(pts);ctx.strokeStyle=C.ink;ctx.lineWidth=w;ctx.stroke();
  ctx.setLineDash([3,9]);ctx.lineDashOffset=off;ctx.strokeStyle=C.sheet;ctx.lineWidth=w*0.45;ctx.stroke();ctx.restore();}
/* a sheave in a block: grooved wheel with spokes, turning by angle a */
function sheave(x,y,r,a,fill){circ(x,y,r+3);paint(C.part,C.ink,1.1);pulley(x,y,r,a,fill);}
function blockStrap(x0,y0,x1,y1,r){ctx.save();ctx.beginPath();ctx.roundRect(x0-r-7,y0-r-7,x1-x0+2*r+14,y1-y0+2*r+14,r*0.6+6);ctx.strokeStyle=C.ink;ctx.lineWidth=1.3;ctx.fillStyle=C.part2;ctx.globalAlpha=0.35;ctx.fill();ctx.globalAlpha=1;ctx.stroke();ctx.restore();}
function hookAt(x,y,len=18){ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=2.4;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y+len);ctx.arc(x+6,y+len,6,PI,PI*0.1,true);ctx.stroke();ctx.restore();}
function beam(x0,x1,y){ctx.beginPath();ctx.rect(x0,y-14,x1-x0,14);paint(C.part2,C.ink);ctx.save();ctx.beginPath();ctx.rect(x0,y-14,x1-x0,14);ctx.clip();ctx.strokeStyle=C.muted;ctx.lineWidth=1;for(let x=x0-20;x<x1;x+=12){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+14,y-14);ctx.stroke();}ctx.restore();}
function anchor(x,y){ctx.beginPath();ctx.rect(x-6,y-2,12,7);paint(C.part,C.ink);}
function loadBox(x,y,w,h,t='LOAD'){ctx.beginPath();ctx.roundRect(x-w/2,y,w,h,4);paint(C['steel-fill'],C.ink);label(t,x,y+h/2+4,'center');}
function grip(x,y){ctx.beginPath();ctx.roundRect(x-9,y,18,30,5);paint(C['brass-fill'],C.ink);label('PULL',x+14,y+19);}
function gripH(x,y){ctx.beginPath();ctx.roundRect(x,y-9,30,18,5);paint(C['brass-fill'],C.ink);label('PULL',x+6,y-14);}

/* generic pulley system: cfg(d) -> {sheaves:{id:{c,r,fill,block}}, ropes:[{nodes:[...ids or points], start}], draw extras}; MA = mechanical advantage */
function pulleySys(num,o){return reg({num,outLabel:'Load raised, mm',
  reset(){this.rot={};this.prevMid=null;},
  update(phi){const e=o.stroke*(1-Math.cos(phi))/2,d=e/o.MA;const L=o.layout(d,e);
    /* sheave rotation from rope passing over it: change in rope length up to the sheave's wrap midpoint */
    const mids={};L.ropes.forEach((rp,ri)=>{const nodes=rp.map(n=>typeof n==='string'?Object.assign({id:n},L.sh[n]):{c:n,r:0});const R=ropeThru(nodes);rp._R=R;
      nodes.forEach((n,i)=>{if(n.id&&R.mids[i]!==undefined&&mids[n.id]===undefined)mids[n.id]=R.mids[i]*(-n.s)/n.r;});});
    if(!this.rot)this.rot={};if(this.prevMid)for(const k in mids)this.rot[k]=(this.rot[k]||0)+(mids[k]-(this.prevMid[k]??mids[k]));
    this.prevMid=mids;this.g={phi,e,d,L};},
  output(){return this.g.d;},
  draw(){const g=this.g,L=g.L;beam(o.beam[0],o.beam[1],o.beamY||46);if(L.under)L.under();
    for(const k in L.sh){const s=L.sh[k];if(s.block)blockStrap(...s.block);}
    for(const rp of L.ropes)drawRope(rp._R.pts,0);
    for(const k in L.sh){const s=L.sh[k];if(s.hidden)continue;sheave(s.c[0],s.c[1],s.r,(this.rot[k]||0)+(s.a0||0),s.fill||(s.fixed?C.part2:C['steel-fill']));}
    if(L.over)L.over();if(o.note)label(o.note,400,505,'center');},
  reads(){const g=this.g;return[['Mechanical advantage',`${o.MA} : 1`],['Rope pulled',`${g.e.toFixed(0)} mm`],['Load raised',`${g.d.toFixed(1)} mm`],['Force needed',`1/${o.MA} of the load (ignoring friction)`]];}});}

/* 12 single fixed pulley: changes direction only */
pulleySys(12,{MA:1,stroke:120,beam:[300,500],note:'A FIXED PULLEY ONLY CHANGES THE DIRECTION OF THE PULL',layout(d,e){
  return{sh:{F:{c:[400,110],r:40,s:1,fixed:1}},ropes:[[[360,330-d],'F',[440,330+e]]],
    load:[360,330-d,80,60],grip:[440,330+e],under(){bar(400,46,400,110,8,C.part);},over(){loadBox(360,330-d,80,60);anchor(360,330-d);grip(440,330+e);}};}});
/* 13 one movable pulley */
pulleySys(13,{MA:2,stroke:160,beam:[260,540],note:'ONE MOVABLE PULLEY · two ropes share the load',layout(d,e){const y=300-d;
  return{sh:{M:{c:[360,y],r:40,s:-1},F:{c:[440,110],r:40,s:1,fixed:1}},ropes:[[[320,46],'M','F',[480,380+e]]],
    load:[360,y+58,90,56],grip:[480,380+e],under(){bar(440,46,440,110,8,C.part);anchor(320,46);},over(){bar(360,y,360,y+58,6,C.part);loadBox(360,y+58,90,56);grip(480,380+e);}};}});
/* 14 blocks and tackle, two double blocks: four ropes */
pulleySys(14,{MA:4,stroke:160,beam:[260,560],note:'TWO DOUBLE BLOCKS · four ropes hold the lower block',layout(d,e){const r=24,a=300,yU=112,yL=320-d;
  const sh={L1:{c:[a+r,yL],r,s:-1},U1:{c:[a+3*r,yU],r,s:1,fixed:1},L2:{c:[a+5*r,yL],r,s:-1},U2:{c:[a+7*r,yU],r,s:1,fixed:1}};
  sh.U1.block=[a+3*r,yU,a+7*r,yU,r];sh.L1.block=[a+r,yL,a+5*r,yL,r];
  return{sh,ropes:[[[a,yU+r+7],'L1','U1','L2','U2',[a+8*r,380+e]]],
    load:[a+3*r,yL+60,110,56],grip:[a+8*r,380+e],under(){bar(a+5*r,46,a+5*r,yU-r-7,8,C.part);},over(){anchor(a,yU+r+7);bar(a+3*r,yL+r+7,a+3*r,yL+60,6,C.part);loadBox(a+3*r,yL+60,110,56);grip(a+8*r,380+e);}};}});
/* 15 White's pulleys: grooves of graded sizes on one axle per block, so every groove turns as one */
pulleySys(15,{MA:6,stroke:120,beam:[260,560],note:'WHITE’S TACKLE · stepped grooves on one axle per block',layout(d,e){const X=400,yU=118,yL=350-d,lo=[14,38,62],up=[26,50,74];
  const sh={};lo.forEach((r,i)=>sh['L'+i]={c:[X,yL],r,s:-1,hidden:1});up.forEach((r,i)=>sh['U'+i]={c:[X,yU],r,s:-1,fixed:1,hidden:1});
  return{sh,ropes:[[[X-14,yU+84],'L0','U0','L1','U1','L2','U2',[X-74,330+e]]],
    load:[X,yL+92,110,50],grip:[X-74,330+e],under(){bar(X,46,X,yU-80,8,C.part);},
    over:()=>{const S=SIMS_NEW[15];const draw=(x,y,rs,a,f)=>{for(let i=rs.length-1;i>=0;i--){circ(x,y,rs[i]+(i===rs.length-1?4:0));paint(i===rs.length-1?C.part:f,C.ink,1);}circ(x,y,rs[0]-4);paint(f,C.ink,1);
        ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=1;for(let k=0;k<6;k++){const t=a+k*PI/3;ctx.beginPath();ctx.moveTo(x+6*Math.cos(t),y+6*Math.sin(t));ctx.lineTo(x+(rs[rs.length-1]-3)*Math.cos(t),y+(rs[rs.length-1]-3)*Math.sin(t));ctx.stroke();}ctx.restore();pivot(x,y,5);};
      draw(X,yL,lo,(S.rot&&S.rot.L0)||0,C['steel-fill']);draw(X,yU,up,(S.rot&&S.rot.U0)||0,C.part2);
      for(const rp of S.g.L.ropes)drawRope(rp._R.pts,0,2.2);anchor(X-14,yU+84);bar(X,yL+66,X,yL+92,6,C.part);loadBox(X,yL+92,110,50);grip(X-74,330+e);}};}});
/* 16 Spanish barton, single: two ropes, power 3 */
pulleySys(16,{MA:3,stroke:150,beam:[260,560],note:'SPANISH BARTON · the second pulley hangs from the first rope · power 3',layout(d,e){const F={c:[400,110],r:32,s:1,fixed:1};const yL=380-d,yM=200+d;/* M falls as the load rises */
  const M={c:[432,yM],r:28,s:1};return{sh:{F,M},ropes:[[[368,yL],'F',[432,yM-28-9]],[[404,yL],'M',[460,330+e]]],
    load:[386,yL,100,56],grip:[460,330+e],under(){bar(400,46,400,110-32,8,C.part);},over(){bar(432,yM-28-9,432,yM,5,C.part);loadBox(386,yL,100,56);anchor(368,yL);anchor(404,yL);grip(460,330+e);}};}});
/* 17 Spanish barton, double: power 5 */
pulleySys(17,{MA:5,stroke:170,beam:[230,600],note:'DOUBLE SPANISH BARTON · power 5',layout(d,e){const yL=400-d,r=26;const P={c:[340,yL-26],r,s:-1},F={c:[392,110],r,s:1,fixed:1},yM=250+2*d,M={c:[418,yM],r:24,s:1};
  return{sh:{P,F,M},ropes:[[[314,46],'P','F',[418,yM-24-9]],[[394,yL],'M',[442,360+e]]],
    load:[380,yL,150,52],grip:[442,360+e],under(){bar(392,46,392,110-r,8,C.part);anchor(314,46);},over(){bar(418,yM-24-9,418,yM,5,C.part);loadBox(380,yL,150,52);bar(340,yL-26,340,yL,5,C.part);anchor(394,yL);grip(442,360+e);}};}});
/* 18 two fixed pulleys and one movable */
pulleySys(18,{MA:2,stroke:150,beam:[260,520],note:'TWO FIXED PULLEYS, ONE MOVABLE · the lower fixed pulley turns the pull sideways',layout(d,e){const yM=300-d;
  return{sh:{M:{c:[340,yM],r:40,s:-1},F1:{c:[420,110],r:40,s:1,fixed:1},F2:{c:[490,440],r:30,s:-1,fixed:1}},ropes:[[[300,46],'M','F1','F2',[560+e,470]]],
    load:[340,yM+56,90,50],grip:[560+e,470,1],under(){bar(420,46,420,110,8,C.part);anchor(300,46);ctx.beginPath();ctx.rect(440,470,120,12);paint(C.part2,C.ink);bar(490,440,490,470,8,C.part);},
    over(){bar(340,yM,340,yM+56,6,C.part);loadBox(340,yM+56,90,50);gripH(560+e,470);}};}});
/* 19–22 systems where each movable pulley hangs in its own cord: effect = 2 to the power of the number of movable pulleys */
function cascadeSys(num,n,o={}){const MA=2**n,r=o.r||30,mir=o.mirror?-1:1;
  return pulleySys(num,{MA,stroke:o.stroke||160,beam:o.beam||[150,650],note:`${n} MOVABLE PULLEYS, EACH IN ITS OWN CORD · effect 2${'⁰¹²³⁴⁵'[n]} = ${MA}`,layout(d,e){
    const sh={},ropes=[],X0=o.x0||300,Y0=o.y0||430,dy=o.dy||84;let x=X0;
    for(let i=0;i<n;i++){const y=Y0-i*dy-(2**i)*d;sh['M'+i]={c:[x,y],r,s:-mir};x+=mir*r;}
    for(let i=0;i<n;i++){const c=sh['M'+i].c;const end=i<n-1?[sh['M'+(i+1)].c[0],sh['M'+(i+1)].c[1]+r+16]:null;
      if(end)ropes.push([[c[0]-mir*r,46],'M'+i,end]);}
    const top=sh['M'+(n-1)].c;let tail;
    if(o.direct){tail=[[top[0]-mir*r,46],'M'+(n-1),[top[0]+mir*r,220-e]];ropes.push(tail);}
    else{sh.F={c:[top[0]+mir*2*r,92],r,s:mir,fixed:1};ropes.push([[top[0]-mir*r,46],'M'+(n-1),'F',[top[0]+mir*3*r,300+e]]);}
    return{sh,ropes,load:[sh.M0.c[0],sh.M0.c[1]+r+22,90,48],grip:o.direct?[top[0]+mir*r,190-e]:[top[0]+mir*3*r,300+e],under(){if(sh.F)bar(sh.F.c[0],46,sh.F.c[0],92,7,C.part);for(let i=0;i<n;i++)anchor(sh['M'+i].c[0]-mir*r,46);},
      over(){for(let i=1;i<n;i++){const c=sh['M'+i].c;hookAt(c[0],c[1],r+10);}const c0=sh.M0.c;bar(c0[0],c0[1],c0[0],c0[1]+r+22,6,C.part);loadBox(c0[0],c0[1]+r+22,90,48);
        if(o.direct)grip(top[0]+mir*r,190-e);else grip(top[0]+mir*3*r,300+e);}};}});}
cascadeSys(19,3,{y0:390});cascadeSys(20,2,{direct:true,x0:340,y0:420,dy:110,r:36,stroke:120});cascadeSys(21,3,{mirror:true,x0:500,y0:390,beam:[150,650]});cascadeSys(22,4,{r:24,y0:388,dy:64,x0:280,stroke:160});

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

/* ================= audit pass · shaded 3D canvas renderer (R3) and solid gears ================= */
/* colour helpers */
function rgbOf(c){c=(c||'#999').trim();if(c[0]==='#'){if(c.length===4)c='#'+c[1]+c[1]+c[2]+c[2]+c[3]+c[3];return[1,3,5].map(i=>parseInt(c.slice(i,i+2),16));}const m=c.match(/[\d.]+/g)||[150,150,150];return m.slice(0,3).map(Number);}
function shade(c,k){const [r,g,b]=rgbOf(c);const f=v=>Math.max(0,Math.min(255,Math.round(v*k)));return`rgb(${f(r)},${f(g)},${f(b)})`;}
/* R3: collects polygons in world space, culls back faces, sorts by depth and paints with simple lighting.
   cam = {yaw,pitch,sc,cx,cy} (same convention as cam3). */
function R3(cam){const P0=cam3(cam.yaw,cam.pitch,cam.sc||1,cam.cx,cam.cy),P=p=>{const q=P0(p);return[q[0],q[1],-q[2]];};/* cam3's third value grows toward the viewer; R3 wants depth */const cy_=Math.cos(cam.yaw),sy_=Math.sin(cam.yaw),cp=Math.cos(cam.pitch),sp=Math.sin(cam.pitch);
  const view=[-sy_*cp,-cy_*cp,-sp];/* direction of increasing depth (away from viewer) */
  const Lw=v3.norm([-0.35-0.6*cy_,0.6*sy_-0.5,0.9]);const faces=[],lines=[];
  const R={P,view,
    /* face: pts (3D), fill, opts {out: point the outward normal faces away from, edge: stroke, both: draw even if back-facing} */
    face(pts,fill,o={}){if(pts.length<3)return;let n=[0,0,0];for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];n[0]+=(a[1]-b[1])*(a[2]+b[2]);n[1]+=(a[2]-b[2])*(a[0]+b[0]);n[2]+=(a[0]-b[0])*(a[1]+b[1]);}
      const l=Math.hypot(...n);if(l<1e-9)return;n=n.map(v=>v/l);
      if(v3.dot(n,view)>0)n=n.map(v=>-v);/* two-sided: light the side facing the viewer */
      const sc=pts.map(P);let dep=0;for(const s of sc)dep+=s[2];dep/=sc.length;if(o.bias)dep+=o.bias;
      const lam=Math.max(0,v3.dot(n,Lw));faces.push({sc,dep,fill,k:0.62+0.5*lam,edge:o.edge,lw:o.lw});},
    line(a,b,col,w=1.2,bias=0){const A=P(a),B=P(b);lines.push({A,B,col,w,dep:(A[2]+B[2])/2+bias});},
    /* loft between two loops with equal point counts (a = front, b = back); caps optional */
    loft(a,b,fill,o={}){const n=a.length,ctr=a.concat(b).reduce((s,p)=>[s[0]+p[0],s[1]+p[1],s[2]+p[2]],[0,0,0]).map(v=>v/(2*n));const out=o.center||ctr;
      for(let i=0;i<n;i++){const j=(i+1)%n;if(o.open&&j===0)break;R.face([a[i],a[j],b[j],b[i]],fill,{out:o.sideOut?o.sideOut(i):out});}
      if(o.caps!==false){R.face(a,o.capFill||fill,{out:o.capOutA||out,edge:o.edge??true,bias:o.capBias||0});R.face(b.slice().reverse(),o.capFill||fill,{out:o.capOutB||out,edge:o.edge??true,bias:o.capBias||0});}},
    draw(){if(GL3.ok()&&GL3.draw(faces,lines))return;faces.sort((p,q)=>q.dep-p.dep);const items=faces.concat(lines.map(l=>Object.assign(l,{isLine:1}))).sort((p,q)=>q.dep-p.dep);
      for(const f of items){if(f.isLine){ctx.save();ctx.strokeStyle=f.col||C.ink;ctx.lineWidth=f.w;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(f.A[0],f.A[1]);ctx.lineTo(f.B[0],f.B[1]);ctx.stroke();ctx.restore();continue;}
        ctx.beginPath();ctx.moveTo(f.sc[0][0],f.sc[0][1]);for(let i=1;i<f.sc.length;i++)ctx.lineTo(f.sc[i][0],f.sc[i][1]);ctx.closePath();const col=shade(f.fill,f.k);ctx.fillStyle=col;ctx.fill();
        ctx.strokeStyle=f.edge?C.ink:col;ctx.lineWidth=f.edge?(f.lw||1):0.6;ctx.stroke();}}};
  return R;}
/* GL3: z-buffered WebGL back end for R3 (exact hidden surfaces, antialiased); falls back to the painter if WebGL is missing */
const GL3=(()=>{let cv=null,gl=null,pr=null,bf=null,okv=null;
  function init(){okv=false;try{cv=document.createElement('canvas');gl=cv.getContext('webgl',{antialias:true,alpha:true,premultipliedAlpha:false,preserveDrawingBuffer:true});if(!gl)return;
    const sh=(t,src)=>{const o=gl.createShader(t);gl.shaderSource(o,src);gl.compileShader(o);return o;};pr=gl.createProgram();
    gl.attachShader(pr,sh(gl.VERTEX_SHADER,'attribute vec3 p;attribute vec4 c;varying vec4 v;void main(){gl_Position=vec4(p,1.0);v=c;}'));
    gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,'precision mediump float;varying vec4 v;void main(){gl_FragColor=v;}'));gl.linkProgram(pr);if(!gl.getProgramParameter(pr,gl.LINK_STATUS))return;bf=gl.createBuffer();okv=true;}catch(e){okv=false;}}
  return{ok(){if(okv===null)init();return okv&&ctx&&ctx.canvas&&ctx.getTransform;},
    draw(faces,lines){const T=ctx.getTransform(),Wd=ctx.canvas.width,Hd=ctx.canvas.height;if(!Wd||!Hd)return false;if(cv.width!==Wd)cv.width=Wd;if(cv.height!==Hd)cv.height=Hd;
      let dmin=1e9,dmax=-1e9;for(const f of faces)for(const p of f.sc){if(p[2]<dmin)dmin=p[2];if(p[2]>dmax)dmax=p[2];}for(const l of lines){dmin=Math.min(dmin,l.A[2],l.B[2]);dmax=Math.max(dmax,l.A[2],l.B[2]);}
      if(!(dmax>dmin)){dmax=dmin+1;}const pad=(dmax-dmin)*0.05+1;dmin-=pad;dmax+=pad;const sc=Math.hypot(T.a,T.b);
      const X=p=>(T.a*p[0]+T.c*p[1]+T.e)/Wd*2-1,Y=p=>1-(T.b*p[0]+T.d*p[1]+T.f)/Hd*2,Z=(d,b)=>((d-dmin)/(dmax-dmin))*2-1-(b||0);
      const out=[];const push=(x,y,z,c)=>{out.push(x,y,z,c[0],c[1],c[2],c[3]);};const ink=rgbOf(C.ink).map(v=>v/255).concat([1]);
      for(const f of faces){const [r,g,b]=rgbOf(f.fill),k=f.k;const c=[Math.min(1,r*k/255),Math.min(1,g*k/255),Math.min(1,b*k/255),1];const n=f.sc.length;let cx=0,cy=0,cz=0;for(const p of f.sc){cx+=p[0];cy+=p[1];cz+=p[2];}const ctr=[cx/n,cy/n,cz/n];
        for(let i=0;i<n;i++){const a=f.sc[i],q=f.sc[(i+1)%n];push(X(ctr),Y(ctr),Z(ctr[2]),c);push(X(a),Y(a),Z(a[2]),c);push(X(q),Y(q),Z(q[2]),c);}}
      const seg=(A,B,w,col,bias)=>{const ax=T.a*A[0]+T.c*A[1]+T.e,ay=T.b*A[0]+T.d*A[1]+T.f,bx=T.a*B[0]+T.c*B[1]+T.e,by=T.b*B[0]+T.d*B[1]+T.f;const L=Math.hypot(bx-ax,by-ay)||1e-6,hw=Math.max(0.5,w*sc/2);const nx=-(by-ay)/L*hw,ny=(bx-ax)/L*hw;
        const P=(x,y,d)=>[x/Wd*2-1,1-y/Hd*2,Z(d,bias)];const v=[P(ax+nx,ay+ny,A[2]),P(ax-nx,ay-ny,A[2]),P(bx-nx,by-ny,B[2]),P(bx+nx,by+ny,B[2])];
        for(const i of [0,1,2,0,2,3])push(v[i][0],v[i][1],v[i][2],col);};
      for(const f of faces)if(f.edge){const n=f.sc.length;for(let i=0;i<n;i++)seg(f.sc[i],f.sc[(i+1)%n],(f.lw||1)*0.8,ink,0.004);}
      for(const l of lines){const c=rgbOf(l.col||C.ink).map(v=>v/255).concat([1]);seg(l.A,l.B,l.w,c,0.006);}
      const data=new Float32Array(out);gl.viewport(0,0,Wd,Hd);gl.clearColor(0,0,0,0);gl.clearDepth(1);gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
      gl.useProgram(pr);gl.bindBuffer(gl.ARRAY_BUFFER,bf);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STREAM_DRAW);const ap=gl.getAttribLocation(pr,'p'),ac=gl.getAttribLocation(pr,'c');
      gl.enableVertexAttribArray(ap);gl.vertexAttribPointer(ap,3,gl.FLOAT,false,28,0);gl.enableVertexAttribArray(ac);gl.vertexAttribPointer(ac,4,gl.FLOAT,false,28,12);gl.drawArrays(gl.TRIANGLES,0,data.length/7);
      ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(cv,0,0);ctx.restore();return true;}};})();
/* frame helpers: map local (x,y,z) with axes u,v,n at origin c */
function fr3(c,u,v){const n=v3.cross(u,v);return{c,u,v,n,at(x,y,z=0){return[c[0]+u[0]*x+v[0]*y+n[0]*z,c[1]+u[1]*x+v[1]*y+n[1]*z,c[2]+u[2]*x+v[2]*y+n[2]*z];}};}
function rot2(p,a){const c=Math.cos(a),s=Math.sin(a);return[p[0]*c-p[1]*s,p[0]*s+p[1]*c];}
/* involute outline at origin, angle a (uses the kit's gearPts) */
const gearOutline2=(R,Z,a)=>gearPts(0,0,R,Z,a,false);
/* solid spur / helical gear: F frame (gear plane u,v; axis n), width w, twist = helix twist across the face (rad) */
function gear3(R,F,Rp,Z,w,a,fill,o={}){const tw=o.twist||0,seg=o.seg||(tw?4:1),bore=o.bore??Math.max(4,Rp*0.14);
  const loops=[];for(let k=0;k<=seg;k++){const t=k/seg,z=-w/2+w*t;const ang=a+(o.herring?(t<0.5?t:1-t)*2*tw/2:(t-0.5)*tw);loops.push(gearOutline2(Rp,Z,ang).map(p=>F.at(p[0],p[1],z)));}
  for(let k=0;k<seg;k++)R.loft(loops[k],loops[k+1],fill,{caps:false,center:F.c,sideOut:i=>F.c});
  /* caps with hub and bore */const cap=(z,fl)=>{const pts=loops[z<0?0:seg];R.face(z<0?pts.slice().reverse():pts,fill,{out:F.at(0,0,-z*5),edge:true});
    const hub=[],hb=[];for(let i=0;i<24;i++){const t=i/24*TAU;hub.push(F.at(bore*Math.cos(t),bore*Math.sin(t),z*1.001));}R.face(hub,C.part,{out:F.at(0,0,-z*5),edge:true,bias:-0.5});
    if(o.mark!==false){const m1=F.at((bore+3)*Math.cos(a+(z>0?tw/2:-tw/2)),(bore+3)*Math.sin(a+(z>0?tw/2:-tw/2)),z*1.002),m2=F.at((Rp-2.2*Rp/Z*1.6)*Math.cos(a+(z>0?tw/2:-tw/2)),(Rp-2.2*Rp/Z*1.6)*Math.sin(a+(z>0?tw/2:-tw/2)),z*1.002);R.line(m1,m2,C.ink,1.2,-0.6);}};
  cap(-w/2);cap(w/2);}
/* bevel gear: apex A, axis n (pointing from apex to the gear), u in the gear plane; outer pitch radius Rp, cone half-angle d, face width f (along the cone) */
function bevel3(R,A,n,u,Rp,Z,d,f,a,fill,o={}){n=v3.norm(n);u=v3.norm(v3.sub(u,v3.mul(n,v3.dot(u,n))));const v=v3.cross(n,u);
  const L=Rp/Math.sin(d),k=(L-f)/L;let outer=gearOutline2(Rp,Z,a);if(o.seg){const rr=Rp-1.25*2*Rp/Z;outer=outer.map(p=>{const t=mod(Math.atan2(p[1],p[0])-a-o.seg[0],TAU);if(t<o.seg[1])return p;const r=Math.min(Math.hypot(p[0],p[1]),rr);const q=Math.atan2(p[1],p[0]);return[r*Math.cos(q),r*Math.sin(q)];});}const zO=L*Math.cos(d),zI=(L-f)*Math.cos(d);
  /* teeth stand on the pitch cone: scale radially about the cone, and tilt the tooth height along the back cone */
  const lay=(p,s,z)=>{const r=Math.hypot(p[0],p[1]),dr=(r-Rp)*s,rr=Rp*s+dr*Math.cos(d),zz=z-dr*Math.sin(d);const t=Math.atan2(p[1],p[0]);return v3.add(A,v3.add(v3.mul(n,zz),v3.add(v3.mul(u,rr*Math.cos(t)),v3.mul(v,rr*Math.sin(t)))));};
  const lo=outer.map(p=>lay(p,1,zO)),li=outer.map(p=>lay(p,k,zI));const ctr=v3.add(A,v3.mul(n,(zO+zI)/2));
  R.loft(lo,li,fill,{caps:false,center:ctr,sideOut:()=>v3.add(A,v3.mul(n,zO*0.5))});
  R.face(lo,fill,{out:A,edge:true});R.face(li.slice().reverse(),fill,{out:v3.add(A,v3.mul(n,zO*3)),edge:true});
  /* back boss */const hub=[],hub2=[],rb=Rp*0.42;for(let i=0;i<24;i++){const t=i/24*TAU;hub.push(v3.add(A,v3.add(v3.mul(n,zO+0.5),v3.add(v3.mul(u,rb*Math.cos(t)),v3.mul(v,rb*Math.sin(t))))));hub2.push(v3.add(A,v3.add(v3.mul(n,zO+(o.boss??14)),v3.add(v3.mul(u,rb*0.8*Math.cos(t)),v3.mul(v,rb*0.8*Math.sin(t))))));}
  R.loft(hub,hub2,fill,{center:v3.add(A,v3.mul(n,zO+7))});
  const m1=lay([Rp*0.55*Math.cos(a),Rp*0.55*Math.sin(a)],1,zO-0.1),m2=lay([(Rp-2*Rp/Z*1.4)*Math.cos(a),(Rp-2*Rp/Z*1.4)*Math.sin(a)],1,zO-0.1);R.line(m1,m2,C.ink,1.2,-0.4);}
/* round bar (shaft) from a to b */
function rod3(R,a,b,r,fill,o={}){const ax=v3.norm(v3.sub(b,a));let u=Math.abs(ax[2])<0.9?v3.norm(v3.cross(ax,[0,0,1])):[1,0,0];const v=v3.cross(ax,u);const N=o.n||16;
  const ring=c=>{const o2=[];for(let i=0;i<N;i++){const t=i/N*TAU;o2.push(v3.add(c,v3.add(v3.mul(u,r*Math.cos(t)),v3.mul(v,r*Math.sin(t)))));}return o2;};R.loft(ring(a),ring(b),fill||C.part,{center:v3.mul(v3.add(a,b),0.5),edge:false});}
/* box between two points along an axis, cross-section w x h oriented by up vector */
function block3(R,c,ax,up,L,w,h,fill){ax=v3.norm(ax);up=v3.norm(v3.sub(up,v3.mul(ax,v3.dot(up,ax))));const sd=v3.cross(ax,up);const q=(x,y,z)=>v3.add(c,v3.add(v3.mul(ax,x),v3.add(v3.mul(sd,y),v3.mul(up,z))));
  const a=[q(-L/2,-w/2,-h/2),q(-L/2,w/2,-h/2),q(-L/2,w/2,h/2),q(-L/2,-w/2,h/2)],b=[q(L/2,-w/2,-h/2),q(L/2,w/2,-h/2),q(L/2,w/2,h/2),q(L/2,-w/2,h/2)];R.loft(a,b,fill,{center:c,edge:true});}
/* extruded 2D shape in frame F from z0 to z1 */
function prism3(R,F,pts2,z0,z1,fill,o={}){R.loft(pts2.map(p=>F.at(p[0],p[1],z1)),pts2.map(p=>F.at(p[0],p[1],z0)),fill,Object.assign({center:F.at(0,0,(z0+z1)/2)},o));}
function ringPts(r,n=40,a0=0){const o=[];for(let i=0;i<n;i++){const t=a0+i/n*TAU;o.push([r*Math.cos(t),r*Math.sin(t)]);}return o;}

/* ================= audit pass · gears drawn as shaded solids (25, 26, 29, 40–44, 50) ================= */
const CAMG={yaw:-0.62,pitch:0.42,sc:1,cx:400,cy:270};
function solidSim(num,o){return reg(Object.assign({num,params:o.params||[],outLabel:o.outLabel||'Driven gear, turns',
  update(phi){this.g={phi};},output(){return o.out(this.g.phi,this.P);},
  draw(){const R=R3(Object.assign({},CAMG,o.cam||{}));o.scene(R,this.g.phi,this.P,this);R.draw();if(o.note)label(o.note,400,505,'center');if(o.labels)o.labels(R.P,this.g.phi,this.P);}},o.extra||{}));}
/* 25 bevel gears for shafts at right angles */
solidSim(25,{note:'BEVEL GEARS · the pitch cones share one apex where the shafts meet',params:[{id:'z',label:'Driven teeth',min:16,max:40,step:4,value:28,fmt:v=>`${v} (driver 20)`}],
  out:(phi,P)=>-phi*20/P.z/TAU,cam:{cx:380,cy:250,yaw:-0.7,pitch:0.45},
  scene(R,phi,P){const Z1=20,Z2=P.z,m=6,R1=m*Z1/2,R2=m*Z2/2,d1=Math.atan2(Z1,Z2),d2=PI/2-d1,O=[0,0,0];
    bevel3(R,O,[0,0,-1],[1,0,0],R1,Z1,d1,26,phi,C['brass-fill']);bevel3(R,O,[1,0,0],[0,0,-1],R2,Z2,d2,26,-phi*Z1/Z2+PI/Z2,C['steel-fill']);
    const L1=R1/Math.tan(d1),L2=R2/Math.tan(d2);rod3(R,[0,0,-L1-10],[0,0,-L1-170],7,C.part);rod3(R,[L2+10,0,0],[L2+190,0,0],7,C.part);},
  labels(P){const a=P([0,0,-200]),b=P([300,0,0]);label('DRIVER',a[0]+14,a[1]);label('DRIVEN',b[0]-30,b[1]+22);},
  extra:{reads(v){return[['Ratio',`20 : ${this.P.z}`],['Shaft angle','90°'],['Driven',rpmOf(Math.abs(v))]];}}});
/* 26 crown wheel and pinion */
solidSim(26,{note:'CROWN WHEEL · teeth stand on the face of the wheel; the spur pinion meshes with them at the rim',outLabel:'Crown wheel, turns',
  out:phi=>phi*12/48/TAU,cam:{cx:400,cy:300,yaw:-0.5,pitch:0.55},
  scene(R,phi){const Zc=48,Zp=12,Rc=150,m=2*PI*Rc/Zc/PI,Rp=m*Zp/2,ac=phi*Zp/Zc,H=18,th=14;
    const F=fr3([0,0,0],[1,0,0],[0,1,0]);prism3(R,F,ringPts(Rc+22,64),-10,0,C['steel-fill'],{edge:false});prism3(R,F,ringPts(Rc-26,48),-10,0.5,C['steel-fill'],{caps:true});
    for(let k=0;k<Zc;k++){const t=ac+k*TAU/Zc,hw=PI*m/4;/* trapezoid tooth, radial prism */const c=Math.cos(t),s=Math.sin(t),tx=[-s,c,0],rad=[c,s,0];
      const q=(r,x,z)=>[rad[0]*r+tx[0]*x,rad[1]*r+tx[1]*x,z];const prof=[[-hw-0.364*H*0.5,0],[hw+0.364*H*0.5,0],[hw-0.364*H*0.5,H],[-hw+0.364*H*0.5,H]];
      R.loft(prof.map(p=>q(Rc-22,p[0],p[1])),prof.map(p=>q(Rc+20,p[0],p[1])),C['steel-fill'],{edge:false});}
    const Fp=fr3([Rc,0,H/2+Rp],[0,0,-1],[0,1,0]);gear3(R,Fp,Rp,Zp,th*2,phi+PI/Zp,C['brass-fill']);rod3(R,[Rc-th-6,0,H/2+Rp],[Rc-th-200,0,H/2+Rp],6,C.part);rod3(R,[0,0,-12],[0,0,-140],8,C.part);},
  extra:{reads(v){return[['Ratio','12 : 48'],['Shafts','at right angles'],['Crown wheel',rpmOf(Math.abs(v))]];}}});
/* 29 spiral (scroll) on a disk face driving a spur wheel one tooth per turn */
solidSim(29,{note:'SPIRAL ON THE DISK FACE · each turn of the disk pushes the wheel on by one tooth',outLabel:'Wheel, turns',
  out:phi=>phi/18/TAU,cam:{cx:380,cy:300,yaw:-0.45,pitch:0.62},
  scene(R,phi){const Zw=18,p=26,Rw=p*Zw/(2*PI),r0=40,turns=5,Rd=r0+p*turns+14,rc=r0+p*3.5;
    const F=fr3([0,0,0],[1,0,0],[0,1,0]);prism3(R,F,ringPts(Rd,72),-16,0,C['brass-fill']);
    /* raised spiral thread, drawn as short ribbon faces */const N=turns*70,hw=p*0.24,h=9;
    for(let i=0;i<N;i++){const s0=i/N*turns*TAU,s1=(i+1)/N*turns*TAU,P0=s=>{const r=r0+p*s/TAU,t=s+phi;return[r,t];};
      const [ra,ta]=P0(s0),[rb,tb]=P0(s1);const pt=(r,t,z)=>[r*Math.cos(t),r*Math.sin(t),z];
      R.face([pt(ra-hw,ta,h),pt(ra+hw,ta,h),pt(rb+hw,tb,h),pt(rb-hw,tb,h)],C['brass-fill'],{edge:false});R.face([pt(ra+hw,ta,0),pt(rb+hw,tb,0),pt(rb+hw,tb,h),pt(ra+hw,ta,h)],shade(C['brass-fill'],0.85),{});R.face([pt(ra-hw,ta,0),pt(rb-hw,tb,0),pt(rb-hw,tb,h),pt(ra-hw,ta,h)],shade(C['brass-fill'],0.85),{});}
    const Fw=fr3([rc,0,h*0.5+Rw],[0,0,-1],[-1,0,0]);gear3(R,Fw,Rw,Zw,16,phi/Zw,C['steel-fill']);rod3(R,[rc,9,h*0.5+Rw],[rc,170,h*0.5+Rw],6,C.part);rod3(R,[0,0,-16],[0,0,-150],8,C.part);},
  extra:{reads(v){return[['Ratio','18 : 1 (one tooth per turn)'],['Shafts','at right angles'],['Wheel',rpmOf(Math.abs(v))]];}}});
/* 40 oblique (helical) teeth, 41 V-shaped (herringbone) teeth */
function helicalPair(num,herring,note){solidSim(num,{note,cam:{cx:400,cy:260,yaw:-0.35,pitch:0.62},out:phi=>-phi*16/24/TAU,
  scene(R,phi){const m=7,Z1=16,Z2=24,R1=m*Z1/2,R2=m*Z2/2,w=46,beta=0.45,t1=w*Math.tan(beta)/R1,t2=w*Math.tan(beta)/R2;
    const F1=fr3([-R2*0.6,0,0],[1,0,0],[0,1,0]),F2=fr3([-R2*0.6+R1+R2,0,0],[1,0,0],[0,1,0]);
    gear3(R,F1,R1,Z1,w,phi,C['brass-fill'],{twist:herring?t1:t1,herring,seg:herring?6:5});gear3(R,F2,R2,Z2,w,-phi*Z1/Z2+PI+PI/Z2,C['steel-fill'],{twist:herring?-t2:-t2,herring,seg:herring?6:5});
    rod3(R,F1.at(0,0,w/2),F1.at(0,0,w/2+70),6,C.part);rod3(R,F2.at(0,0,w/2),F2.at(0,0,w/2+70),7,C.part);},
  extra:{reads(v){return[['Ratio','16 : 24'],['Teeth',herring?'V-shaped (herringbone): the side thrusts cancel':'oblique (helical): several teeth always in contact'],['Driven',rpmOf(Math.abs(v))]];}}});}
helicalPair(40,false,'OBLIQUE TEETH · each tooth comes into contact gradually, so the drive runs smoothly');
helicalPair(41,true,'V-SHAPED TEETH · smooth like oblique teeth, with no end thrust on the shafts');
/* 42 bevel gears for shafts at an oblique angle */
solidSim(42,{note:'ANGLE BEVELS · shafts meet at 60°; the pitch cones still share one apex',cam:{cx:360,cy:230,yaw:-0.75,pitch:0.4},out:phi=>-phi*18/27/TAU,
  scene(R,phi){const Z1=18,Z2=27,m=6,R1=m*Z1/2,R2=m*Z2/2,S=PI/3,d1=Math.atan2(Math.sin(S),Z2/Z1+Math.cos(S)),d2=S-d1;
    const n1=[0,0,-1],n2=[Math.sin(S),0,-Math.cos(S)];const c1=v3.norm(v3.add(n1,n2));
    bevel3(R,[0,0,0],n1,[1,0,0],R1,Z1,d1,24,phi,C['brass-fill']);bevel3(R,[0,0,0],n2,[-Math.cos(S),0,-Math.sin(S)].map(v=>-v),R2,Z2,d2,24,-phi*Z1/Z2+PI/Z2,C['steel-fill']);
    const L1=R1/Math.tan(d1),L2=R2/Math.tan(d2);rod3(R,v3.mul(n1,L1+12),v3.mul(n1,L1+160),7,C.part);rod3(R,v3.mul(n2,L2+12),v3.mul(n2,L2+170),7,C.part);},
  extra:{reads(v){return[['Shaft angle','60°'],['Ratio','18 : 27'],['Driven',rpmOf(Math.abs(v))]];}}});
/* 43 skew (crossed oblique-toothed) gears for shafts that do not meet */
solidSim(43,{note:'SKEW GEARS · oblique teeth let gears drive between shafts that cross without meeting',cam:{cx:400,cy:270,yaw:-0.55,pitch:0.5},out:phi=>-phi*14/20/TAU,
  scene(R,phi){const m=7,Z1=14,Z2=20,R1=m*Z1/2/Math.cos(PI/4),R2=m*Z2/2/Math.cos(PI/4),w=34;
    const F1=fr3([0,0,0],[1,0,0],[0,1,0]),F2=fr3([0,R1+R2,0],[0,0,1],[0,1,0]);/* second axis along x */
    gear3(R,F1,R1,Z1,w,phi,C['brass-fill'],{twist:w/R1,seg:5});gear3(R,F2,R2,Z2,w,-phi*Z1/Z2+PI/Z2,C['steel-fill'],{twist:w/R2,seg:5});
    rod3(R,F1.at(0,0,w/2),F1.at(0,0,w/2+80),6,C.part);rod3(R,F1.at(0,0,-w/2),F1.at(0,0,-w/2-60),6,C.part);rod3(R,F2.at(0,0,w/2),F2.at(0,0,w/2+90),7,C.part);rod3(R,F2.at(0,0,-w/2),F2.at(0,0,-w/2-90),7,C.part);},
  extra:{reads(v){return[['Shafts','at right angles, not meeting'],['Teeth','set at 45° on both gears'],['Driven',rpmOf(Math.abs(v))]];}}});
/* 44 stepped gears: several thin gears side by side, each set on by part of a tooth */
solidSim(44,{note:'STEPPED GEARS · three layers each set on by a third of a tooth: always one tooth at its best contact',cam:{cx:400,cy:260,yaw:-0.3,pitch:0.6},out:phi=>-phi*16/24/TAU,
  scene(R,phi){const m=7,Z1=16,Z2=24,R1=m*Z1/2,R2=m*Z2/2,w=14,n=3;for(let k=0;k<n;k++){const z=(k-(n-1)/2)*w;
      gear3(R,fr3([-R2*0.6,0,z],[1,0,0],[0,1,0]),R1,Z1,w,phi+k*TAU/Z1/n,C['brass-fill'],{mark:k===n-1});gear3(R,fr3([-R2*0.6+R1+R2,0,z],[1,0,0],[0,1,0]),R2,Z2,w,-(phi+k*TAU/Z1/n)*Z1/Z2+PI+PI/Z2,C['steel-fill'],{mark:k===n-1});}
    rod3(R,[-R2*0.6,0,n*w/2],[-R2*0.6,0,n*w/2+60],6,C.part);rod3(R,[-R2*0.6+R1+R2,0,n*w/2],[-R2*0.6+R1+R2,0,n*w/2+60],7,C.part);},
  extra:{reads(v){return[['Layers','3, each set on by ⅓ tooth'],['Ratio','16 : 24'],['Driven',rpmOf(Math.abs(v))]];}}});
/* 50 universal (Hooke's) joint */
reg({num:50,outLabel:'Output angle − input angle, °',params:[{id:'b',label:'Shaft angle',min:0,max:45,step:5,value:30,fmt:v=>v+'°'}],
  update(phi){const b=this.P.b*PI/180;const a1=phi;/* output angle from the cross geometry */const a2=Math.atan2(Math.sin(a1),Math.cos(a1)*Math.cos(b));const k=Math.round((a1-a2)/TAU);this.g={phi,b,a1,a2:a2+k*TAU};},
  output(){return(this.g.a2-this.g.a1)*180/PI;},
  draw(){const g=this.g,R=R3({yaw:-0.5,pitch:0.32,sc:1,cx:400,cy:270});const ax1=[1,0,0],ax2=[Math.cos(g.b),Math.sin(g.b),0];
    /* input yoke pin axis e1 ⟂ x, turning with a1; cross arm e2 ⟂ e1 and ⟂ output axis */
    const e1=[0,Math.cos(g.a1),Math.sin(g.a1)],e2=v3.norm(v3.cross(ax2,e1));const Rk=46,arm=40;
    rod3(R,[-300,0,0],[-70,0,0],11,C['brass-fill']);rod3(R,v3.mul(ax2,70),v3.mul(ax2,300),11,C['steel-fill']);
    const yoke=(ax,e,fill,sgn)=>{block3(R,v3.mul(ax,sgn*62),e,ax,Rk*2+22,24,16,fill);
      for(const s of [1,-1]){const c=v3.add(v3.mul(e,s*Rk),v3.mul(ax,sgn*30));block3(R,c,ax,e,64,22,12,fill);}};
    yoke(ax1,e1,C['brass-fill'],-1);yoke(ax2,e2,C['steel-fill'],1);
    rod3(R,v3.mul(e1,-arm-6),v3.mul(e1,arm+6),7,C.part2);rod3(R,v3.mul(e2,-arm-6),v3.mul(e2,arm+6),7,C.part2);block3(R,[0,0,0],e1,e2,20,20,20,C.part2);
    /* marks on the shafts so the uneven speed shows */R.line(v3.add([-200,0,0],v3.mul(e1,11)),v3.add([-120,0,0],v3.mul(e1,11)),C.ink,2.2,-20);R.line(v3.add(v3.mul(ax2,140),v3.mul(e2,11)),v3.add(v3.mul(ax2,220),v3.mul(e2,11)),C.ink,2.2,-20);
    R.draw();label('INPUT · steady',150,430);label('OUTPUT · speeds up and slows down twice a turn',470,470);},
  reads(v){const g=this.g,c=Math.cos(g.b),s=Math.sin(g.a1);const k=c/(1-s*s*(1-c*c));return[['Shaft angle',`${this.P.b}°`],['Output speed now',`${k.toFixed(3)} × input`],['Range',`${c.toFixed(3)} – ${(1/c).toFixed(3)} × input`],['Lead / lag',`${((g.a2-g.a1)*180/PI).toFixed(1)}°`]];}});

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

/* ================= audit pass 51–80 ================= */
/* exact Geneva-type kinematics: driver pin/tooth at radius r, N slots, centre distance d = r / sin(π/N); driven rests between steps */
function genevaKin(theta,N){const be=PI/2-PI/N,k=Math.floor((theta+PI)/TAU),tm=mod(theta+PI,TAU)-PI,d=1,r=Math.sin(PI/N);let psi;
  if(Math.abs(tm)<be)psi=Math.atan2(r*Math.sin(tm),d-r*Math.cos(tm));else psi=tm>0?PI/N:-PI/N;return{gam:-(k*TAU/N+psi),eng:Math.abs(tm)<be,tm};}
/* driven-wheel outline: slots toward local angle π (+j·2π/N); locking hollows between them (radius RL about the driver centre when at rest) */
function genevaWheel(N,d,pr,RL,o={}){const r=d*Math.sin(PI/N),Ro=Math.sqrt(d*d-r*r)+(o.extra??2),pts=[],M=N*48,sl=pr+1.5,lock=RL>0;
  for(let i=0;i<M;i++){const t=i/M*TAU;let R=Ro;const j=Math.round((t-PI)/(TAU/N)),rel=t-PI-j*TAU/N;/* slot */
    const half=Math.asin(Math.min(1,sl/Ro));if(Math.abs(rel)<half){/* inside slot mouth: go down the slot */}
    if(lock){const jh=Math.round((t-PI-PI/N)/(TAU/N)),ch=PI+PI/N+jh*TAU/N,cx=d*Math.cos(ch),cy=d*Math.sin(ch),dx=R*Math.cos(t)-cx,dy=R*Math.sin(t)-cy;
      if(Math.hypot(dx,dy)<RL+1){/* pull back onto the hollow arc */const ux=Math.cos(t),uy=Math.sin(t);const b=ux*cx+uy*cy,c=cx*cx+cy*cy-(RL+1)**2,disc=b*b-c;if(disc>0)R=Math.min(R,b-Math.sqrt(disc));}}
    pts.push([R*Math.cos(t),R*Math.sin(t)]);}
  /* cut the slots: rebuild as polygon with slot notches */
  const out=[],rin=d-r-pr-3;for(let j=0;j<N;j++){const c=PI+j*TAU/N,next=c+TAU/N;const a0=c+Math.asin(sl/Ro),a1=next-Math.asin(sl/Ro);
    const rot=(x,y,a)=>[x*Math.cos(a)-y*Math.sin(a),x*Math.sin(a)+y*Math.cos(a)];
    /* slot j: from mouth (Ro) down to rin and back, on the far side */out.push(rot(Ro,-sl,c),rot(rin,-sl,c));for(let k=1;k<8;k++){const q=-PI/2+k*PI/8;out.push(rot(rin-sl*Math.cos(q)*0+(-sl)*Math.cos(q+PI/2)*0-sl*Math.sin(-q)*0+0,0,c));}
    out.length-=7;for(let k=0;k<=8;k++){const q=PI/2+k*PI/8;out.push(rot(rin+sl*Math.cos(q),sl*Math.sin(q)*-1,c));}out.push(rot(Ro,sl,c));
    for(const p of pts){const t=mod(Math.atan2(p[1],p[0])-a0,TAU);if(t>0&&t<a1-a0)out.push(p);}}
  return{pts:out,Ro,r,rin};}
/* driver: locking disk with a crescent cut-out on the pin side */
function lockDiskPts(RL,d,Rc){const o=[],n=160;for(let i=0;i<n;i++){const t=i/n*TAU;let R=RL;const x=R*Math.cos(t),y=R*Math.sin(t);if(Math.hypot(x-d,y)<Rc){/* on the cut circle */const b=d*Math.cos(t),c=d*d-Rc*Rc,disc=b*b-c;if(disc>0)R=Math.max(0.3*RL,b-Math.sqrt(disc));}o.push([R*Math.cos(t),R*Math.sin(t)]);}return o;}
function lockTooth(num,o){const N=o.N,d=190,r=d*Math.sin(PI/N),pr=9,lock=o.lock!==false,Ro=Math.sqrt(d*d-r*r)+2,RL=r-pr-6;
  return reg({num,outLabel:'Driven wheel, turns',concept:false,N,d,r,pr,RL,lock,Ro,tooth:!!o.tooth,D:[400-d/2-10,262],Wc:[400+d/2-10,262],
    wheel(){if(!this._w)this._w=genevaWheel(N,d,pr,RL);return this._w;},
    update(phi){const k=genevaKin(phi,N);this.g={phi,w:k.gam,eng:k.eng};},output(){return -this.g.w/TAU;},
    draw(){const g=this.g,D=[400-d/2-10,262],Wc=[D[0]+d,262],w=this.wheel(),c=Math.cos(g.w),s=Math.sin(g.w);
      poly(w.pts.map(([x,y])=>[Wc[0]+x*c-y*s,Wc[1]+x*s+y*c]));ctx.closePath();circ(Wc[0],Wc[1],9,false);paint(C['steel-fill'],C.ink);pivot(Wc[0],Wc[1],6);
      const t=g.phi,ct=Math.cos(t),st=Math.sin(t),T=([x,y])=>[D[0]+x*ct-y*st,D[1]+x*st+y*ct];
      if(lock){poly(lockDiskPts(RL,d,Ro+4).map(T));ctx.closePath();paint(C['brass-fill'],C.ink);}
      poly([[-14,-16],[r-6,-12],[r-6,12],[-14,16]].map(T));ctx.closePath();paint(C['brass-fill'],C.ink);
      const P=T([r,0]);if(o.tooth){poly([[r-12,-pr],[r+6,-pr+2],[r+pr,0],[r+6,pr-2],[r-12,pr]].map(T));ctx.closePath();paint(C.part2,C.ink);}else{circ(P[0],P[1],pr);paint(C.part2,C.ink);}pivot(D[0],D[1],6);
      label(g.eng?'TOOTH ENGAGED · wheel moves one space':(lock?'LOCKED · the driver’s rim sits in a hollow':'WHEEL AT REST'),400,480,'center');},
    reads(){const g=this.g;return[['Per driver turn',`1/${N} turn`],['Phase',g.eng?'moving':'resting'],['Locking',lock?'driver rim in a hollow':'none']];}});}
lockTooth(68,{N:6,tooth:true});lockTooth(69,{N:8,tooth:true});lockTooth(241,{N:6,lock:false});
/* annulus (washer) in frame F */
function annulus3(R,F,ro,ri,z0,z1,fill,n=48){for(let i=0;i<n;i++){const a=i/n*TAU,b=(i+1)/n*TAU,P=(r,t,z)=>F.at(r*Math.cos(t),r*Math.sin(t),z);
  R.face([P(ro,a,z0),P(ro,b,z0),P(ro,b,z1),P(ro,a,z1)],fill);R.face([P(ri,a,z0),P(ri,b,z0),P(ri,b,z1),P(ri,a,z1)],fill);R.face([P(ro,a,z1),P(ro,b,z1),P(ri,b,z1),P(ri,a,z1)],fill);R.face([P(ro,a,z0),P(ro,b,z0),P(ri,b,z0),P(ri,a,z0)],fill);}}
/* 51 · universal joint, second form: the two forks are pinned to a ring instead of a cross */
reg({num:51,outLabel:'Output angle − input angle, °',params:[{id:'b',label:'Shaft angle',min:0,max:45,step:5,value:30,fmt:v=>v+'°'}],
  update(phi){const b=this.P.b*PI/180,a1=phi,a2=Math.atan2(Math.sin(a1),Math.cos(a1)*Math.cos(b)),k=Math.round((a1-a2)/TAU);this.g={phi,b,a1,a2:a2+k*TAU};},output(){return(this.g.a2-this.g.a1)*180/PI;},
  draw(){const g=this.g,R=R3({yaw:-0.5,pitch:0.32,sc:1,cx:400,cy:270}),ax1=[1,0,0],ax2=[Math.cos(g.b),Math.sin(g.b),0],e1=[0,Math.cos(g.a1),Math.sin(g.a1)],e2=v3.norm(v3.cross(ax2,e1)),Rk=58;
    rod3(R,[-300,0,0],[-80,0,0],11,C['brass-fill']);rod3(R,v3.mul(ax2,80),v3.mul(ax2,300),11,C['steel-fill']);
    const fork=(ax,e,fill,sg)=>{block3(R,v3.mul(ax,sg*74),e,ax,Rk*2+26,22,14,fill);for(const s of [1,-1])block3(R,v3.add(v3.mul(e,s*(Rk+9)),v3.mul(ax,sg*38)),ax,e,72,20,10,fill);};
    fork(ax1,e1,C['brass-fill'],-1);fork(ax2,e2,C['steel-fill'],1);
    const F=fr3([0,0,0],e1,e2);annulus3(R,F,Rk+7,Rk-7,-8,8,C.part2);
    for(const e of [e1,e2])for(const s of [1,-1])rod3(R,v3.mul(e,s*(Rk-8)),v3.mul(e,s*(Rk+20)),5,C.part);
    R.draw();label('INPUT · steady',150,430);label('RING JOINT · each fork is pinned to the ring at opposite points',400,480,'center');},
  reads(v){const g=this.g,c=Math.cos(g.b),s=Math.sin(g.a1);return[['Shaft angle',`${this.P.b}°`],['Output speed now',`${(c/(1-s*s*(1-c*c))).toFixed(3)} × input`],['Lead / lag',`${((g.a2-g.a1)*180/PI).toFixed(1)}°`]];}});
/* 74 · a mutilated bevel wheel (teeth on a third of its rim) turns the two bevels facing each other on one axis by turns, in opposite directions, with rests between */
reg({num:74,outLabel:'Left bevel, turns',
  pass(phi,pos){const W=TAU/3,s0=0,F=x=>Math.floor(x/TAU)*W+Math.min(mod(x,TAU),W);return F(pos-s0)-F(pos-s0-phi);},
  update(phi){const ra=36/18;this.g={phi,aL:this.pass(phi,PI)*ra,aR:this.pass(phi,0)*ra};},output(){return this.g.aL/TAU;},
  draw(){const g=this.g,R=R3({yaw:-0.35,pitch:0.5,sc:1.05,cx:400,cy:250}),m=6,Zc=36,Za=18,Rc=m*Zc/2,Ra=m*Za/2,dC=Math.atan2(Zc,Za),dA=PI/2-dC;
    bevel3(R,[0,0,0],[0,0,-1],[1,0,0],Rc,Zc,dC,26,g.phi,C['brass-fill'],{seg:[0,TAU/3]});
    bevel3(R,[0,0,0],[-1,0,0],[0,0,-1],Ra,Za,dA,26,g.aL,C['steel-fill']);bevel3(R,[0,0,0],[1,0,0],[0,0,-1],Ra,Za,dA,26,-g.aR,C['steel-fill']);
    const Lc=Rc/Math.tan(dC),La=Ra/Math.tan(dA);rod3(R,[0,0,-Lc-14],[0,0,-Lc-150],8,C.part);rod3(R,[-La-14,0,0],[-La-170,0,0],7,C.part);rod3(R,[La+14,0,0],[La+170,0,0],7,C.part);
    R.draw();const eL=Math.abs(mod(PI-g.phi,TAU))<TAU/3,eR=mod(-g.phi,TAU)<TAU/3;label(eL?'LEFT BEVEL DRIVEN':eR?'RIGHT BEVEL DRIVEN':'BOTH AT REST',400,470,'center');label('TEETH ON ONE THIRD OF THE RIM',400,40,'center');},
  reads(){const g=this.g;return[['Left bevel',`${(g.aL/TAU).toFixed(2)} turns`],['Right bevel',`${(g.aR/TAU).toFixed(2)} turns, the other way`]];}});
/* ---------- tappet and studs: the driver's tappet pin really pushes a stud; the wheel moves only while they touch ----------
   The centre distance is found once so that one turn of the driver advances the wheel exactly one stud. */
function tappetGeo(o){const N=o.N,rs=o.rs,ps=o.ps,rt=o.rt,pt=o.pt,R=pt+ps;
  const run=(d,turns,g0)=>{let g=g0;const T=th=>[rt*Math.cos(th),rt*Math.sin(th)];const step=(th)=>{const t=T(th);for(let j=0;j<N;j++){const a=g+j*TAU/N,s=[d+rs*Math.cos(a),rs*Math.sin(a)];if(Math.hypot(t[0]-s[0],t[1]-s[1])<R){
        const dist=dd=>{const b=g+j*TAU/N+dd;return Math.hypot(t[0]-d-rs*Math.cos(b),t[1]-rs*Math.sin(b));};const sg=dist(1e-4)>dist(-1e-4)?1:-1;let lo=0,hi=sg*0.9;for(let k=0;k<40;k++){const m=(lo+hi)/2;if(dist(m)<R)lo=m;else hi=m;}g+=hi;}}};
    const n=Math.ceil(turns*TAU/0.01);for(let i=0;i<=n;i++)step(i/n*turns*TAU);return g;};
  /* bisect the centre distance for one stud per turn */let lo=rs+rt-R*0.98,hi=rs+rt+R*0.6,best=null;for(let k=0;k<26;k++){const d=(lo+hi)/2,g1=run(d,2,PI+PI/N),g2=run(d,3,PI+PI/N),adv=Math.abs(g2-g1);if(adv>TAU/N)lo=d;else hi=d;best={d,g0:mod(g2,TAU)};}
  return Object.assign({},o,{d:best.d,g0:best.g0,R});}
function tappetSim(num,o){const G=tappetGeo(Object.assign({N:8,rs:110,ps:9,rt:92,pt:9},o));const D=o.D||[400-G.d/2-20,270],Wc=[D[0]+G.d,D[1]];
  return reg({num,outLabel:'Driven wheel, turns',concept:!!o.concept,G,D,Wc,o,
    reset(){this.gam=G.g0;this.last=null;},
    update(phi){if(this.last===null){this.last=0;this.gam=G.g0;}const n=Math.max(1,Math.ceil(Math.abs(phi-this.last)/0.01));for(let i=1;i<=n;i++)this.push(this.last+(phi-this.last)*i/n);this.last=phi;this.g={phi,gam:this.gam,adv:(this.gam-G.g0)/(TAU/G.N)};},
    push(th){const t=[G.rt*Math.cos(th),G.rt*Math.sin(th)],d=G.d;this.hit=false;for(let j=0;j<G.N;j++){const a=this.gam+j*TAU/G.N,s=[d+G.rs*Math.cos(a),G.rs*Math.sin(a)];if(Math.hypot(t[0]-s[0],t[1]-s[1])<G.R){this.hit=true;
        const dist=dd=>{const b=this.gam+j*TAU/G.N+dd;return Math.hypot(t[0]-d-G.rs*Math.cos(b),t[1]-G.rs*Math.sin(b));};const sg=dist(1e-4)>dist(-1e-4)?1:-1;let lo=0,hi=sg*0.9;for(let k=0;k<40;k++){const m=(lo+hi)/2;if(dist(m)<G.R)lo=m;else hi=m;}this.gam+=hi;}}},
    output(){return this.g.adv/G.N;},
    draw(){const g=this.g,th=g.phi,rd=o.rd||G.rt-30;
      /* wheel */if(o.style==='star'){const pts=[];for(let i=0;i<G.N;i++){const t=g.gam+i*TAU/G.N;pts.push([Wc[0]+(G.rs+4)*Math.cos(t),Wc[1]+(G.rs+4)*Math.sin(t)],[Wc[0]+G.rs*0.5*Math.cos(t+PI/G.N),Wc[1]+G.rs*0.5*Math.sin(t+PI/G.N)]);}poly(pts);ctx.closePath();paint(C['steel-fill'],C.ink);}
      else{circ(Wc[0],Wc[1],G.rs-G.ps-10);paint(C['steel-fill'],C.ink);}
      for(let i=0;i<G.N;i++){const t=g.gam+i*TAU/G.N,S=[Wc[0]+G.rs*Math.cos(t),Wc[1]+G.rs*Math.sin(t)];if(o.style!=='star')bar(Wc[0]+(G.rs-G.ps-12)*Math.cos(t),Wc[1]+(G.rs-G.ps-12)*Math.sin(t),S[0],S[1],6,C.part2);circ(S[0],S[1],G.ps);paint(C.part2,C.ink);}pivot(Wc[0],Wc[1],6);
      /* driver */circ(D[0],D[1],rd);paint(C['brass-fill'],C.ink);
      if(o.rim){const restR=Math.hypot(Wc[0]+G.rs*Math.cos(PI+PI/G.N)-D[0],Wc[1]+G.rs*Math.sin(PI+PI/G.N)-D[1])-G.ps-1;ctx.save();ctx.lineCap='butt';ctx.strokeStyle=C.ink;ctx.lineWidth=12;ctx.beginPath();ctx.arc(D[0],D[1],restR-6,th+0.55,th+TAU-0.55);ctx.stroke();ctx.strokeStyle=C['brass-fill'];ctx.lineWidth=9.6;ctx.stroke();ctx.restore();
        bar(D[0],D[1],D[0]+(restR-6)*Math.cos(th+PI),D[1]+(restR-6)*Math.sin(th+PI),10,C['brass-fill']);}
      const P=[D[0]+G.rt*Math.cos(th),D[1]+G.rt*Math.sin(th)];bar(D[0],D[1],P[0],P[1],o.tooth?20:12,C['brass-fill']);circ(P[0],P[1],G.pt);paint(C.part,C.ink);pivot(D[0],D[1],6);
      if(o.detent){/* spring detent lever resting between studs */const Q=[Wc[0]+60,Wc[1]-G.rs-70],La=Math.hypot(Wc[0]-Q[0],Wc[1]-G.rs+4-Q[1]);let bt=Math.atan2(Wc[1]-Q[1],Wc[0]-Q[0])+0.15;
        for(let k=0;k<80;k++){const T=[Q[0]+La*Math.cos(bt),Q[1]+La*Math.sin(bt)];let pen=Math.hypot(T[0]-Wc[0],T[1]-Wc[1])<G.rs-G.ps-6;for(let i=0;i<G.N&&!pen;i++){const t=g.gam+i*TAU/G.N;if(Math.hypot(T[0]-Wc[0]-G.rs*Math.cos(t),T[1]-Wc[1]-G.rs*Math.sin(t))<G.ps+6)pen=true;}if(!pen)break;bt-=0.01;}
        const T=[Q[0]+La*Math.cos(bt),Q[1]+La*Math.sin(bt)];bar(Q[0],Q[1],T[0],T[1],9,C.part);circ(T[0],T[1],6);paint(C.part2,C.ink);pivot(Q[0],Q[1],5);springZ(Q[0]-40,Q[1]-30,(Q[0]+T[0])/2,(Q[1]+T[1])/2,8,5);}
      label(o.label,400,485,'center');label(this.hit?'TAPPET PUSHING A STUD':'WHEEL AT REST',Wc[0],Wc[1]+G.rs+38,'center');},
    reads(){const g=this.g;return[['Steps taken',`${Math.round(g.adv*100)/100}`],['Each step',`1/${G.N} turn`],['Driver turns per step','1']];}});}
tappetSim(54,{N:6,style:'star',rs:100,label:'A PIN ON THE DISK KICKS THE STAR ROUND ONE POINT PER TURN',concept:true});
tappetSim(65,{N:8,detent:true,label:'ONE TAPPET, ONE STUD PER TURN · A SPRING DETENT HOLDS THE WHEEL'});
tappetSim(70,{N:8,rim:true,label:'THE RIM HOLDS THE STUDS · ITS OPENING LETS ONE STUD THROUGH PER TURN'});
tappetSim(71,{N:8,rim:true,tooth:true,label:'TAPPET STRIKES A STUD WHILE THE RIM LOCKS THE OTHERS'});
/* 63 · pins on the disk lift the tail of a spring drop; when a pin slips off the end of the tail the spring snaps the drop back and the pawl on its other end pulls the star on one tooth */
reg({num:63,outLabel:'Star wheel, turns',N:10,Q:[330,190],La:190,Lh:120,D:[470,330],rp:80,np:4,rest:0.32,
  reset(){this.k=0;this.prev=null;},
  beta(phi){let b=this.rest,touch=false;for(let i=0;i<this.np;i++){const t=phi+i*TAU/this.np,P=[this.D[0]+this.rp*Math.cos(t),this.D[1]+this.rp*Math.sin(t)],dx=P[0]-this.Q[0],dy=P[1]-this.Q[1],d=Math.hypot(dx,dy);
      if(d>this.La||dx<0)continue;const c=Math.atan2(dy,dx)-Math.asin(Math.min(1,15/d));if(c<b){b=c;touch=true;}}return{b,touch};},
  update(phi){const B=this.beta(phi);if(this.prev!==null&&this.prev<this.rest-0.03&&B.b>=this.rest-1e-9)this.k++;this.prev=B.b;this.g={phi,b:B.b,touch:B.touch,k:this.k};},
  output(){return this.g.k/this.N;},
  draw(){const g=this.g,Q=this.Q,D=this.D,N=this.N,Wc=[175,330],Rw=72;circ(D[0],D[1],this.rp+20);paint(C['brass-fill'],C.ink);for(let i=0;i<this.np;i++){const t=g.phi+i*TAU/this.np;circ(D[0]+this.rp*Math.cos(t),D[1]+this.rp*Math.sin(t),9);paint(C.part2,C.ink);}pivot(D[0],D[1],6);
    const sw=g.k*TAU/N;const pts=[];for(let i=0;i<N;i++){const t=sw+i*TAU/N-PI/2;pts.push([Wc[0]+Rw*Math.cos(t),Wc[1]+Rw*Math.sin(t)],[Wc[0]+Rw*0.62*Math.cos(t+PI/N),Wc[1]+Rw*0.62*Math.sin(t+PI/N)]);}poly(pts);ctx.closePath();paint(C['steel-fill'],C.ink);pivot(Wc[0],Wc[1],6);
    const tail=[Q[0]+this.La*Math.cos(g.b),Q[1]+this.La*Math.sin(g.b)],head=[Q[0]-this.Lh*Math.cos(g.b),Q[1]-this.Lh*Math.sin(g.b)];bar(head[0],head[1],tail[0],tail[1],12,C.part);
    const tip=[Wc[0]+Rw*Math.cos(sw-PI/2+TAU/N)+4,Wc[1]+Rw*Math.sin(sw-PI/2+TAU/N)];const pw=[tip[0],Math.max(tip[1],head[1]+40)];bar(head[0],head[1],pw[0],pw[1],7,C['brass-fill']);pivot(head[0],head[1],3);pivot(Q[0],Q[1],6);
    const mid=[Q[0]-0.55*this.Lh*Math.cos(g.b),Q[1]-0.55*this.Lh*Math.sin(g.b)];springZ(mid[0],mid[1],mid[0],60,10,7);ctx.beginPath();ctx.rect(mid[0]-20,52,40,8);paint(C.part2,C.ink);
    label(g.touch?'A PIN LIFTS THE TAIL OF THE DROP':'SNAPPED BACK · the pawl pulled the star on one tooth',400,500,'center');},
  reads(){return[['Star steps',`${this.g.k}`],['Each step',`1/${this.N} turn`],['Steps per disk turn',`${this.np}`]];}});
/* 64, 66, 67 · a worm turns the worm wheel slowly; a pin on it pushes an arm on a hollow shaft until the cam (64), weight (66) or tumbler (67) goes over and the hollow shaft runs ahead suddenly; it then rests until the pin catches up */
function wormDrop(num,kind){const Zw=20,al=kind==='spring'?PI*5/3:PI;return reg({num,outLabel:'Hollow shaft, turns',
  update(phi){const tg=phi/Zw,k=Math.floor(tg/TAU),u=tg-k*TAU;let th;if(u<al)th=k*TAU+u;else{const f=Math.min(1,(u-al)/0.06);th=k*TAU+al+(TAU-al)*f*f;}this.g={phi,tg,th,falling:u>=al&&u<al+0.06,rest:u>=al+0.06};},
  output(){return this.g.th/TAU;},
  draw(){const g=this.g,Wc=[330,250],Rg=110,yw=Wc[1]+Rg+26;drawGear(Wc[0],Wc[1],Rg,Zw,g.tg,C['steel-fill'],{bore:10});
    ctx.beginPath();ctx.rect(150,yw-20,360,40);paint(C['brass-fill'],C.ink);ctx.save();ctx.beginPath();ctx.rect(150,yw-20,360,40);ctx.clip();ctx.strokeStyle=C.ink;ctx.lineWidth=2;const p=PI*2*Rg/Zw,sh=mod(g.phi/TAU*p,p);for(let x=150-p+sh;x<520;x+=p){ctx.beginPath();ctx.moveTo(x,yw-20);ctx.lineTo(x+p*0.5,yw+20);ctx.stroke();}ctx.restore();
    const pin=[Wc[0]+85*Math.cos(g.tg-PI/2),Wc[1]+85*Math.sin(g.tg-PI/2)];
    if(kind==='spring'){const r=t=>{t=mod(t,TAU);return t<al?40+40*t/al:80-40*(t-al)/(TAU-al);};const pts=[];for(let i=0;i<120;i++){const t=i/120*TAU;pts.push([Wc[0]+r(t)*Math.cos(t+g.th-PI/2),Wc[1]+r(t)*Math.sin(t+g.th-PI/2)]);}poly(pts);ctx.closePath();paint(C['brass-fill'],C.ink);
      const fr=r(-g.th+PI/2+PI)/*follower at the left*/,F=[Wc[0]-fr-8,Wc[1]];const Qp=[Wc[0]-60,Wc[1]-150];bar(Qp[0],Qp[1],F[0],F[1],9,C.part);circ(F[0],F[1],8);paint(C.part2,C.ink);pivot(Qp[0],Qp[1],5);springZ(Qp[0]-100,F[1]-60,(Qp[0]+F[0])/2,(Qp[1]+F[1])/2,9,7);}
    const arm=[Wc[0]+100*Math.cos(g.th-PI/2+0.12),Wc[1]+100*Math.sin(g.th-PI/2+0.12)];bar(Wc[0],Wc[1],arm[0],arm[1],10,C['brass-fill']);
    if(kind!=='spring'){const wa=g.th+PI/2,Wt=[Wc[0]+150*Math.cos(wa),Wc[1]+150*Math.sin(wa)];bar(Wc[0],Wc[1],Wt[0],Wt[1],10,C['brass-fill']);if(kind==='weight'){ctx.save();ctx.translate(Wt[0],Wt[1]);ctx.rotate(wa);ctx.beginPath();ctx.rect(-18,-22,36,44);paint(C.part2,C.ink);ctx.restore();}else{circ(Wt[0],Wt[1],26);paint(C.part2,C.ink);}}
    circ(pin[0],pin[1],8);paint(C.part,C.ink);pivot(Wc[0],Wc[1],7);
    label(g.falling?'GONE OVER · the hollow shaft runs ahead':g.rest?'RESTING · waiting for the pin to catch up':'THE PIN PUSHES THE ARM ROUND',600,120,'center');label('WORM',330,yw+40,'center');label(kind==='spring'?'CAM PRESSED BY A SPRING':kind==='weight'?'WEIGHT ON AN ARM':'TUMBLER',600,140,'center');},
  reads(){const g=this.g;return[['Worm wheel',`${(g.tg/TAU).toFixed(2)} turns`],['Hollow shaft',`${(g.th/TAU).toFixed(2)} turns`],['State',g.falling?'running ahead':g.rest?'resting':'being pushed']];}});}
wormDrop(64,'spring');wormDrop(66,'weight');wormDrop(67,'tumbler');
/* bevel differential drawn as solids: two side bevels on one axis, two pinions on radial axles in a carrier ring that turns about the same axis.
   Carrier = mean of the two side wheels; the pinions spin by the difference. */
function diffScene(R,g,o={}){const Z=18,Rp=54,d=PI/4,f=24,c=g.c||0,a=g.a||0,b=g.b||0,ps=(a-c);
  bevel3(R,[0,0,0],[-1,0,0],[0,0,1],Rp,Z,d,f,a,C['brass-fill']);bevel3(R,[0,0,0],[1,0,0],[0,0,1],Rp,Z,d,f,-b+PI/Z,C['steel-fill']);
  const rd=[0,Math.cos(c),Math.sin(c)];for(const s of [1,-1]){const n=v3.mul(rd,s);bevel3(R,[0,0,0],n,[1,0,0],Rp,Z,d,f,s*ps+PI/Z*0.5,C.hi,{boss:6});rod3(R,v3.mul(n,Rp+8),v3.mul(n,Rp+44),5,C.part);}
  const F=fr3([0,0,0],[0,Math.cos(c),Math.sin(c)],[0,-Math.sin(c),Math.cos(c)]);/* ring plane ⟂ x: frame u,v in y-z */const Fr={at:(x,y,z)=>[z,F.u[1]*x+F.v[1]*y,F.u[2]*x+F.v[2]*y],c:[0,0,0]};
  annulus3(R,{at:(x,y,z)=>Fr.at(x,y,z)},Rp+56,Rp+40,-10,10,C.part2,56);
  rod3(R,[-Rp-14,0,0],[-300,0,0],9,C['brass-fill']);rod3(R,[Rp+14,0,0],[300,0,0],9,C['steel-fill']);}
for(const n of [61,62,495,226,503,506]){const m=SIMS_NEW[n];if(!m)continue;const lab=m.draw.toString().match(/label\(o\.label/)?null:null;
  m.concept=false;const old=m.draw;m.draw=function(){const R=R3({yaw:-0.18,pitch:0.42,sc:1.1,cx:400,cy:250});diffScene(R,this.g);R.draw();
    label(n===495||n===226?'LEFT WHEEL FIXED':'LEFT WHEEL',150,420,'center');label(n===495||n===226?'OUTPUT':'RIGHT WHEEL',650,420,'center');label('CARRIER RING WITH TWO PINIONS · it turns at the mean of the two wheels',400,480,'center');};}
/* 77 (78, 206, 236) · lever pivoted beside the wheel, two pawls hinged at one point on it: the upper one pushes on one stroke, the lower (hooked) one pulls on the other, so the wheel turns on both strokes */
function dblPawl(num,o={}){return reg({num,outLabel:'Wheel angle, degrees',N:24,concept:!!o.concept,Cc:[360,280],A:[640,40],La:250,rr:100,rt:122,
  reset(){this.W=0;this.lx=null;},
  H(phi){const a=0.16*Math.sin(phi),b=PI/2+0.08+a;return[this.A[0]+this.La*Math.cos(b),this.A[1]+this.La*Math.sin(b)];},
  update(phi){const H=this.H(phi);if(this.lx!==null)this.W+=Math.abs(H[0]-this.lx)/this.rt;this.dir=this.lx===null?1:Math.sign(H[0]-this.lx)||this.dir||1;this.lx=H[0];this.g={phi,H};},
  output(){return this.W*180/PI;},
  draw(){const g=this.g,C0=this.Cc,N=this.N,H=g.H,A=this.A;sawWheel(C0[0],C0[1],-this.W,N,this.rr,this.rt,C['steel-fill']);pivot(C0[0],C0[1],6);
    bar(A[0],A[1],H[0]+(H[0]-A[0])*0.25,H[1]+(H[1]-A[1])*0.25,16,C['brass-fill']);pivot(A[0],A[1],7);ground(A[0],A[1]-12,40,true);
    for(const s of [-1,1]){const ta=s*0.72,r=sawR(ta+this.W,N,this.rr,this.rt)+1,T=[C0[0]+r*Math.cos(ta),C0[1]+r*Math.sin(ta)],work=(s<0)===(this.dir<0);bar(H[0],H[1],T[0],T[1],8,work?C.part2:C.part);if(s>0){ctx.beginPath();ctx.moveTo(T[0],T[1]);ctx.lineTo(T[0]-8,T[1]-8);paint(null,C.ink,3);}}
    pivot(H[0],H[1],5);label('UPPER PAWL PUSHES ONE WAY, LOWER HOOKED PAWL PULLS THE OTHER',400,480,'center');label(this.dir<0?'UPPER PAWL WORKING':'LOWER PAWL WORKING',C0[0],C0[1]+160,'center');},
  reads(){return[['Wheel turned',`${(this.W*180/PI).toFixed(0)}°`],['Strokes used','both'],['Motion','nearly continuous']];}});}
dblPawl(77);dblPawl(78,{concept:true});dblPawl(206);dblPawl(236);
/* 76 · a stud on the large wheel lifts a pivoted tappet once a turn; the tappet's hinged end pushes the ratchet on one tooth, then falls back by its weight */
reg({num:76,outLabel:'Count',N:10,D:[230,300],rd:110,F:[400,170],L1:120,L2:110,
  reset(){this.k=0;this.prevB=null;this.bmax=null;},
  beta(phi){const P=[this.D[0]+this.rd*Math.cos(phi),this.D[1]+this.rd*Math.sin(phi)],dx=P[0]-this.F[0],dy=P[1]-this.F[1],d=Math.hypot(dx,dy);let b=0.5;/* short arm points left-down at angle PI-b */
    if(d<this.L1&&dx<0){const c=PI-Math.atan2(dy,dx)+Math.asin(Math.min(1,12/d));/* arm angle measured below horizontal */const bb=PI-(Math.atan2(dy,dx)+Math.asin(Math.min(1,12/d)));if(bb<b)b=bb;}return b;},
  update(phi){if(this.bmax===null){let mn=1;for(let i=0;i<360;i++)mn=Math.min(mn,this.beta(i/360*TAU));this.bmin=mn;this.bmax=1;}const b=this.beta(phi);if(this.prevB!==null&&this.prevB<0.5-1e-6&&b>=0.5-1e-6)this.k++;this.prevB=b;
    const lift=(0.5-b)/(0.5-this.bmin||1);this.g={phi,b,s:Math.max(0,Math.min(1,lift)),w:-(this.k+Math.max(0,Math.min(1,lift)))*TAU/this.N};},
  output(){return this.k+this.g.s;},
  draw(){const g=this.g,D=this.D,F=this.F,Wc=[590,250],N=this.N;circ(D[0],D[1],this.rd+18);paint(C['brass-fill'],C.ink);const P=[D[0]+this.rd*Math.cos(g.phi),D[1]+this.rd*Math.sin(g.phi)];circ(P[0],P[1],10);paint(C.part2,C.ink);pivot(D[0],D[1],6);
    sawWheel(Wc[0],Wc[1],g.w,N,62,88,C['steel-fill']);circ(Wc[0],Wc[1],46);paint(C.hi,C.ink);ctx.save();ctx.font='600 28px -apple-system, BlinkMacSystemFont, "SF Pro Display", Inter, Arial, sans-serif';ctx.fillStyle=C.ink;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(String(mod(this.k,100)).padStart(2,'0'),Wc[0],Wc[1]);ctx.restore();pivot(Wc[0],Wc[1]-60,0.1);
    const short=[F[0]-this.L1*Math.cos(g.b),F[1]+this.L1*Math.sin(g.b)],long=[F[0]+this.L2*Math.cos(g.b),F[1]-this.L2*Math.sin(g.b)];bar(short[0],short[1],long[0],long[1],12,C.part);
    const ta=PI+0.35,r=sawR(ta-g.w,N,62,88)+2,T=[Wc[0]+r*Math.cos(ta),Wc[1]+r*Math.sin(ta)];bar(long[0],long[1],T[0],T[1],8,C['brass-fill']);pivot(long[0],long[1],4);pivot(F[0],F[1],6);
    label('STUD LIFTS THE TAPPET ONCE A TURN · its hinged end moves the count wheel one tooth',400,480,'center');},
  reads(){return[['Count',`${this.k}`],['Per turn','one tooth']];}});

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

/* ================= audit pass 191–230 ================= */
/* part-toothed outlines (local, about 0,0): external sector with teeth for local angles a0..a1, root circle elsewhere */
function sectorExt(R,Z,a0,a1,pie){const m=2*R/Z,rr=R-1.25*m,pts=gearPts(0,0,R,Z,0,false,a0,a1);if(pie){const h=TAU/Z/2;pts.unshift([rr*Math.cos(a0-h),rr*Math.sin(a0-h)]);pts.push([rr*Math.cos(a1+h),rr*Math.sin(a1+h)],[0,0]);return pts;}const e=Math.atan2(pts[pts.length-1][1],pts[pts.length-1][0]);let s=Math.atan2(pts[0][1],pts[0][0]);while(s<=e)s+=TAU;
  for(let i=1;i<48;i++){const t=e+(s-e)*i/48;pts.push([rr*Math.cos(t),rr*Math.sin(t)]);}return pts;}
/* internal sector: inner teeth for a0..a1, closed by an outer arc of radius Rout (a C-shaped piece) */
function sectorInt(R,Z,a0,a1,Rout){const pts=gearPts(0,0,R,Z,0,true,a0,a1),m=2*R/Z,b0=a0-0.6*TAU/Z,b1=a1+0.6*TAU/Z,ro=R+1.25*m;
  const out=[[ro*Math.cos(b0),ro*Math.sin(b0)],...pts,[ro*Math.cos(b1),ro*Math.sin(b1)]];for(let i=0;i<=48;i++){const t=b1+(b0-b1)*i/48;out.push([Rout*Math.cos(t),Rout*Math.sin(t)]);}return out;}
function polyAt(pts,cx,cy,a){const c=Math.cos(a),s=Math.sin(a);poly(pts.map(([x,y])=>[cx+x*c-y*s,cy+x*s+y*c]));ctx.closePath();}

/* 191 · scroll gear: teeth along a one-turn spiral (radius 50 → 120). The pinion's carriage slides on a radial guide and a band holds it
   against the scroll, so the pinion follows the growing radius; its centre is solved exactly (pitch point + pinion radius along the normal, on the guide line). */
{const r0=50,k=70/TAU,M=1600,Z=10,O=[300,265];
 const cur=s=>{const r=r0+k*s;return[r*Math.cos(s),-r*Math.sin(s)];},tan=s=>{const r=r0+k*s;return[k*Math.cos(s)-r*Math.sin(s),-k*Math.sin(s)-r*Math.cos(s)];};
 const A=[0];let L=0;for(let i=1;i<=M;i++){const a=cur((i-1)/M*TAU),b=cur(i/M*TAU);L+=Math.hypot(b[0]-a[0],b[1]-a[1]);A.push(L);}
 const nT=Math.round(L/(TAU*25/Z)),p=L/nT,rp=Z*p/TAU,m=p/PI;
 const arcAt=s=>{const x=Math.max(0,Math.min(M-1e-6,s/TAU*M)),i=Math.floor(x);return A[i]+(A[i+1]-A[i])*(x-i);};
 const sAt=a=>{let lo=0,hi=M;while(hi-lo>1){const md=(lo+hi)>>1;if(A[md]<=a)lo=md;else hi=md;}return(lo+(a-A[lo])/((A[lo+1]-A[lo])||1))/M*TAU;};
 /* outline: teeth (centres at arc (j+½)p) along the spiral, then the radial step back to the start */
 const outline=[];{const n=nT*20;for(let i=0;i<=n;i++){const a=i/n*L,s=sAt(a),q=cur(s),t=tan(s),tl=Math.hypot(t[0],t[1]),u=Math.abs(mod(a/p,1)-0.5),h=u<0.15?m:u>0.35?-1.2*m:m+(-2.2*m)*(u-0.15)/0.2;outline.push([q[0]-t[1]/tl*h,q[1]+t[0]/tl*h]);}}
 const nrm=s=>{const t=tan(s),tl=Math.hypot(t[0],t[1]);return[-t[1]/tl,t[0]/tl];};
 reg({num:191,outLabel:'Pinion turns',O,rp,Z,outline,cur,nrm,arcAt,
   update(phi){const th=PI+(PI-0.45)*Math.sin(phi*0.5),c=Math.cos(th),sn=Math.sin(th);
     const f=s=>{const q=cur(s),n=nrm(s);const x=q[0]+rp*n[0],y=q[1]+rp*n[1];return x*sn+y*c;};
     let s=th;for(let it=0;it<20;it++){const v=f(s),d=(f(s+1e-4)-f(s-1e-4))/2e-4;const ds=v/d;s-=ds;if(Math.abs(ds)<1e-9)break;}
     const q=cur(s),n=nrm(s),W=[O[0]+q[0]*c-q[1]*sn,O[1]+q[0]*sn+q[1]*c],nw=[n[0]*c-n[1]*sn,n[0]*sn+n[1]*c],P=[W[0]+rp*nw[0],W[1]+rp*nw[1]];
     const pa=Math.atan2(-nw[1],-nw[0])-arcAt(s)/rp;this.g={phi,th,s,W,P,pa,r:Math.hypot(W[0]-O[0],W[1]-O[1])};},
   output(){return this.g.pa/TAU;},
   draw(){const g=this.g;polyAt(outline,O[0],O[1],g.th);circ(O[0],O[1],8,false);paint(C['brass-fill'],C.ink);pivot(O[0],O[1],6);
     ctx.beginPath();ctx.rect(O[0]+40,O[1]-30,330,8);ctx.rect(O[0]+40,O[1]+22,330,8);paint(C.part,C.ink);
     ctx.beginPath();ctx.rect(g.P[0]-30,O[1]-22,60,44);paint(C.part2,C.ink);drawGear(g.P[0],g.P[1],rp,Z,g.pa,C['steel-fill'],{bore:4});pivot(g.P[0],g.P[1],3);
     rope([[g.P[0]+30,O[1]],[O[0]+380,O[1]]]);circ(O[0]+384,O[1],5);paint(C.part,C.ink);
     label('SCROLL GEAR · the pinion’s carriage slides along the guide as the radius grows',400,470,'center');label('band pulls the carriage toward the scroll',O[0]+300,O[1]+52);},
   reads(){const g=this.g;return[['Driving radius',`${g.r.toFixed(0)} mm`],['Pinion speed',`${(g.r/rp).toFixed(2)} × scroll`],['Teeth on the scroll',`${nT}`]];}});
 aliasObj(414,SIMS_NEW[191],{concept:true});}

/* 196 · pinion B on a fixed axis; the arm swings about the same axis and carries wheel A, which meshes with B.
   A crank pin on A is tied to a fixed point by a rod, so as B turns the arm is pushed to and fro irregularly. */
reg({num:196,outLabel:'Arm angle, degrees',G:[300,300],F:[600,120],rB:40,ZB:16,rA:80,ZA:32,e:46,Lr:300,
  reset(){this.al=null;},
  at(phi,al){const d=this.rB+this.rA,q=this.rB/this.rA,G=this.G,C=[G[0]+d*Math.cos(al),G[1]+d*Math.sin(al)],tA=al-q*(phi-al)+PI-PI/this.ZA,pin=[C[0]+this.e*Math.cos(tA),C[1]+this.e*Math.sin(tA)];return{C,tA,pin};},
  update(phi){const F=this.F,f=al=>{const p=this.at(phi,al).pin;return Math.hypot(p[0]-F[0],p[1]-F[1])-this.Lr;};
    if(this.al===null){let best=null;for(let i=0;i<720;i++){const a=-PI+i/720*TAU,v=Math.abs(f(a));if(best===null||v<best[1])best=[a,v];}this.al=best[0];}
    let al=this.al;for(let it=0;it<30;it++){const v=f(al),d=(f(al+1e-5)-f(al-1e-5))/2e-5;if(Math.abs(d)<1e-9)break;let st=v/d;st=Math.max(-0.1,Math.min(0.1,st));al-=st;if(Math.abs(st)<1e-10)break;}
    this.al=al;const z=this.at(phi,al);this.g={phi,al,...z,ang:al};},
  output(){return this.g.ang*180/PI;},
  draw(){const g=this.g,G=this.G,F=this.F;bar(G[0],G[1],g.C[0],g.C[1],22,C.part);
    drawGear(g.C[0],g.C[1],this.rA,this.ZA,g.tA,C['steel-fill'],{bore:6});drawGear(G[0],G[1],this.rB,this.ZB,g.phi,C['brass-fill'],{bore:5});
    bar(g.pin[0],g.pin[1],F[0],F[1],9,C.part2);pivot(g.pin[0],g.pin[1],4);pivot(g.C[0],g.C[1],5);pivot(G[0],G[1],6);pivot(F[0],F[1],5);ground(F[0],F[1]-10,40,true);
    label('PINION B (fixed axis) · ARM swings about the same axis carrying WHEEL A',400,470,'center');label('rod from A’s crank pin to a fixed point',F[0]-10,F[1]+34,'right');},
  reads(){return[['Arm',`${(this.g.ang*180/PI).toFixed(0)}°`],['Ratio','A turns half as fast as B, relative to the arm']];}});

/* 198 · Brown: a modification of 197. The pinion turns but does not rise and fall. The rack (a row of pins) is jointed to the
   main frame by two parallel rods, so when the pinion comes to the end it lifts the rack by its own movement and follows on the other side. */
reg({num:198,outLabel:'Frame travel, mm',Pc:[400,210],rp:22,Z:9,n:21,Lr:80,yh:70,
  update(phi){const rp=this.rp,p=TAU*rp/this.Z,Ls=(this.n-1)*p,Pp=2*Ls+TAU*rp,s=mod(rp*phi,Pp);let c;
    if(s<Ls)c=[s,-rp];else if(s<Ls+PI*rp){const u=(s-Ls)/rp;c=[Ls+rp*Math.sin(u),-rp*Math.cos(u)];}else if(s<2*Ls+PI*rp)c=[Ls-(s-Ls-PI*rp),rp];else{const u=(s-2*Ls-PI*rp)/rp;c=[-rp*Math.sin(u),rp*Math.cos(u)];}
    const B=[this.Pc[0]-c[0],this.Pc[1]-c[1]],sb=-c[1]/this.Lr,cb=Math.sqrt(1-sb*sb),fx=B[0]-this.Lr*cb;this.g={phi,c,B,p,Ls,fx,sb,cb,a:phi+PI/2-PI/this.Z};},
  output(){return this.g.fx-(this.Pc[0]-this.Lr);},
  draw(){const g=this.g,P=this.Pc,yh=this.yh,yf=P[1]+yh,Lr=this.Lr,B=g.B;
    ctx.beginPath();ctx.rect(g.fx-60,yf+8,g.Ls+120,26);paint(C.part2,C.ink);
    ctx.beginPath();ctx.rect(B[0]-24,B[1]-14,g.Ls+48,yh+22);paint(C['steel-fill'],C.ink);for(let k=0;k<this.n;k++){circ(B[0]+k*g.p,B[1],3.6);paint(C.part,C.ink);}
    for(const x0 of [40,g.Ls-40]){const Bp=[B[0]+x0,B[1]+yh],Fp=[Bp[0]-Lr*g.cb,yf];ctx.beginPath();ctx.rect(Fp[0]-8,yf,16,10);paint(C.part2,C.ink);bar(Fp[0],Fp[1],Bp[0],Bp[1],8,C['brass-fill']);pivot(Fp[0],Fp[1],3);pivot(Bp[0],Bp[1],3);}
    for(const x of [270,340]){ctx.beginPath();ctx.rect(x,yf+36,50,10);paint(C.part,C.ink);}
    drawGear(P[0],P[1],this.rp,this.Z,g.a,C['brass-fill'],{bore:4});pivot(P[0],P[1],4);
    label('PINION TURNS ON A FIXED AXIS · the rack swings up or down on its rods to change sides',400,480,'center');label('FRAME slides in guides',300,yf+64,'center');},
  reads(){const g=this.g;return[['Pinion side',g.c[1]<0?'above the pins':'below the pins'],['Rack lifted',`${(-g.c[1]).toFixed(0)} mm`],['Frame',`${(g.fx-(this.Pc[0]-this.Lr)).toFixed(0)} mm`]];}});

/* 208 · pin wheel with three rings of pins at exactly the pinion's pitch; the slotted pinion slides along its shaft (lying across the wheel face) to any ring */
reg({num:208,outLabel:'Pinion turns',Rk:[72,108,148],rp:24,Zp:6,params:[{id:'k',label:'Pin ring',min:1,max:3,step:1,value:2,fmt:v=>['inner','middle','outer'][v-1]}],
  update(phi){const R=this.Rk[this.P.k-1];this.g={phi,R,pa:-phi*R/this.rp};},output(){return this.g.pa/TAU;},
  draw(){const g=this.g,O=[340,265];circ(O[0],O[1],170);paint(C['brass-fill'],C.ink);for(const R of this.Rk){const n=Math.round(R/4);for(let i=0;i<n;i++){const t=g.phi+i*TAU/n;circ(O[0]+R*Math.cos(t),O[1]+R*Math.sin(t),3.6);paint(R===g.R?C.part2:C.part,C.ink,.8);}}pivot(O[0],O[1],6);
    ctx.beginPath();ctx.rect(O[0]+40,O[1]-8,400,16);paint(C.part,C.ink);ctx.save();ctx.translate(O[0]+g.R,O[1]);ctx.beginPath();ctx.rect(-10,-this.rp-5,20,2*this.rp+10);ctx.fillStyle=C['steel-fill'];ctx.fill();ctx.strokeStyle=C.ink;ctx.lineWidth=1.2;ctx.stroke();
    for(let k=0;k<this.Zp;k++){const a=g.pa+k*TAU/this.Zp;if(Math.cos(a)>0){ctx.globalAlpha=.3+.6*Math.cos(a);ctx.beginPath();ctx.rect(-10,(this.rp+5)*Math.sin(a)-3,20,6);ctx.fillStyle=C.ink;ctx.fill();}}ctx.restore();
    label('SLOTTED PINION ON A SQUARE SHAFT · slide it to another ring of pins',560,O[1]-40);},
  reads(){const R=this.g.R;return[['Pin ring',`${R} mm, ${Math.round(R/4)} pins`],['Pinion speed',`${(R/this.rp).toFixed(2)} × wheel`]];}});

/* 211 · Geneva drive: pin on the driver, four slots, curved locking rim between steps */
lockTooth(211,{N:4});

/* 216 · Brown: slow forward, quick return. The driving wheel carries an outside part-gear (24 teeth of a 40, 216°) and an inside
   part-ring (24 teeth of a 60, 144°). The pinion meets the outside teeth first (slow, reversed) then the inside teeth (fast, same way). */
reg({num:216,outLabel:'Pinion angle, degrees',O:[330,265],R1:96,Z1:40,R2:144,Z2:60,rp:24,Zp:10,
  geo(){if(!this._g){const p1=TAU/this.Z1,p2=TAU/this.Z2,a1=24*p1;this._g={a1,ext:sectorExt(this.R1,this.Z1,TAU-a1+p1*0.5,TAU-p1*0.5),int:sectorInt(this.R2,this.Z2,p2*0.5,TAU-a1-p2*0.5,this.R2+22)};}return this._g;},
  update(phi){const G=this.geo(),u=mod(phi,TAU),k=Math.floor(phi/TAU);let a;const b=PI+PI/this.Zp;
    if(u<G.a1)a=-u*this.Z1/this.Zp+b;else a=-G.a1*this.Z1/this.Zp+b+(u-G.a1)*this.Z2/this.Zp;this.g={phi,a,fwd:u<G.a1};},
  output(){return(this.g.a-PI-PI/this.Zp)*180/PI;},
  draw(){const g=this.g,O=this.O,G=this.geo(),P=[O[0]+this.R1+this.rp,O[1]];circ(O[0],O[1],this.R2+22);paint(C.part,C.ink);
    polyAt(G.int,O[0],O[1],g.phi);paint(C['steel-fill'],C.ink);polyAt(G.ext,O[0],O[1],g.phi);circ(O[0],O[1],8,false);paint(C['brass-fill'],C.ink);pivot(O[0],O[1],6);
    drawGear(P[0],P[1],this.rp,this.Zp,g.a,C.hi,{bore:4});pivot(P[0],P[1],4);const t=g.a;bar(P[0],P[1],P[0]+16*Math.cos(t),P[1]+16*Math.sin(t),3,C.ink);
    label(g.fwd?'SLOW FORWARD · outside teeth turn the pinion backward slowly':'QUICK RETURN · inside teeth turn it the other way, faster',400,470,'center');},
  reads(){return[['Phase',this.g.fwd?'slow forward (216° of the wheel)':'quick return (144°)'],['Pinion swing','2.4 turns each way']];}});

/* 219 · off-centre crown wheel: exact contact radius where the pin circle crosses the pinion's line */
{const m=SIMS_NEW[219];m.update=function(phi){const e=40,r=e*Math.cos(phi)+Math.sqrt(130*130-e*e*Math.sin(phi)**2);if(this.last===null)this.last=phi;this.pa-=(phi-this.last)*r/26;this.last=phi;this.g={phi,r,e};};}

/* 223 · Brown: sectors on three planes; the change of speed follows their diameters. Driver sectors (radii 50, 70, 90, each 120°)
   on one shaft mesh in turn with whole gears (110, 90, 70) on the other; all module 5, centre distance 160. */
reg({num:223,outLabel:'Driven, turns',A:[290,265],B:[450,265],R1:[50,70,90],R2:[110,90,70],
  geo(){if(!this._g){const T=TAU/3,Z1=this.R1.map(r=>r*2/5),Z2=this.R2.map(r=>r*2/5),sec=[],ph=[];
      const a2=th=>this.a2(th);for(let k=0;k<3;k++){const p1=TAU/Z1[k];sec.push(sectorExt(this.R1[k],Z1[k],-(k+1)*T+p1*0.5,-k*T-p1*0.5,true));const ts=Math.ceil(k*T/p1+1e-9)*p1;ph.push(PI+PI/Z2[k]-a2(ts));}
      this._g={T,Z1,Z2,sec,ph};}return this._g;},
  a2(th){const T=TAU/3,r=[0,1,2].map(k=>this.R1[k]/this.R2[k]),per=T*(r[0]+r[1]+r[2]),n=Math.floor(th/TAU),u=th-n*TAU;let a=n*per;for(let k=0;k<3;k++){const d=Math.max(0,Math.min(T,u-k*T));a+=d*r[k];}return -a;},
  update(phi){this.g={phi,a2:this.a2(phi),k:Math.min(2,Math.floor(mod(phi,TAU)/(TAU/3)))};},
  output(){return -this.g.a2/TAU;},
  draw(){const g=this.g,A=this.A,B=this.B,G=this.geo(),cols=[C.part,C['steel-fill'],C['brass-fill']];
    for(let k=0;k<3;k++){drawGear(B[0],B[1],this.R2[k],G.Z2[k],g.a2+G.ph[k],k===g.k?C.hi:C.part2,{bore:6});}
    for(let k=0;k<3;k++){polyAt(G.sec[k],A[0],A[1],g.phi);paint(k===g.k?C.hi:cols[k],C.ink);}
    circ(A[0],A[1],8,false);pivot(A[0],A[1],6);pivot(B[0],B[1],6);label('THREE SECTORS ON THREE PLANES · each meshes for a third of a turn',400,460,'center');label('driven speed steps through 0.45, 0.78, 1.29 × driver',400,480,'center');},
  reads(){const k=this.g.k;return[['Active pair',`${k+1} of 3 (${this.R1[k]} on ${this.R2[k]})`],['Ratio now',`${(this.R1[k]/this.R2[k]).toFixed(2)}`]];}});

/* 195 · worm between two worm wheels: the wheels sit above and below the worm, so they turn opposite ways; feed rolls on the
   same shafts (behind the wheels) are as large as the wheels' centre spacing allows, so they meet and draw the stock through */
reg({num:195,outLabel:'Feed rolls, turns',concept:true,Zw:30,rw:72,rp:18,
  update(phi){this.g={phi,w:phi/this.Zw};},output(){return this.g.w/TAU;},
  draw(){const g=this.g,X=400,y=265,d=this.rw+this.rp,R=d-2;
    for(const s of [-1,1]){circ(X,y+s*d,R);paint(C['brass-fill'],C.ink,1);ctx.save();ctx.setLineDash([4,4]);ctx.strokeStyle=C.muted;circ(X,y+s*d,R-14,false);ctx.stroke();ctx.restore();}
    ctx.beginPath();ctx.rect(120,y-3,560,6);paint(C.hi,C.ink,0.8);dashFlow&&dashFlow([[130,y],[670,y]],-g.w*R,3);
    for(const s of [-1,1]){drawGear(X,y+s*d,this.rw,this.Zw,s*g.w+(s>0?PI/this.Zw:0),C['steel-fill'],{bore:7});pivot(X,y+s*d,6);}
    screwShaft(X-130,X+130,y,this.rp,g.phi,16);
    label('WORM BETWEEN TWO WORM WHEELS',400,30,'center');label('feed rolls (behind) on the wheel shafts grip the stock',400,500,'center');},
  reads(){return[['Ratio',`${this.Zw} : 1 to each roll`],['Rolls','turn opposite ways, so the stock is drawn through']];}});

/* 212 · Geneva stop: the arbor's finger works a five-place star whose fifth slot is left blank, so after four steps the finger
   meets the solid rim and the winding stops; the round rim on the arbor locks the star in a hollow between steps */
{const N=5,d=150,r=d*Math.sin(PI/N),pr=8,RL=r-pr-6;
 const genevaStop=()=>{const w=genevaWheel(N,d,pr,RL),Ro=w.Ro,sl=pr+1.5,rin=w.rin,M=N*96,rim=[];
   for(let i=0;i<M;i++){const t=i/M*TAU;let R=Ro;const jh=Math.round((t-PI-PI/N)/(TAU/N)),ch=PI+PI/N+jh*TAU/N,cx=d*Math.cos(ch),cy=d*Math.sin(ch),ux=Math.cos(t),uy=Math.sin(t);
     if(Math.hypot(R*ux-cx,R*uy-cy)<RL+1){const b=ux*cx+uy*cy,c=cx*cx+cy*cy-(RL+1)**2,disc=b*b-c;if(disc>0)R=Math.min(R,b-Math.sqrt(disc));}rim.push([t,R]);}
   const out=[],hs=Math.asin(sl/Ro),rot=(x,y,a)=>[x*Math.cos(a)-y*Math.sin(a),x*Math.sin(a)+y*Math.cos(a)];
   for(let j=0;j<N;j++){const c=PI+j*TAU/N;if(j<N-1){out.push(rot(Ro,-sl,c),rot(rin,-sl,c));for(let k=1;k<8;k++){const q=-PI/2+k*PI/8;out.push(rot(rin-sl*Math.cos(q),sl*Math.sin(q),c));}out.push(rot(rin,sl,c),rot(Ro,sl,c));}
     const a0=j<N-1?c+hs:c-hs,span=j<N-1?TAU/N-2*hs:TAU/N;const seg=rim.map(([t,R])=>[mod(t-a0,TAU),R]).filter(q=>q[0]>0&&q[0]<span).sort((x,y)=>x[0]-y[0]);for(const [u,R] of seg)out.push([R*Math.cos(a0+u),R*Math.sin(a0+u)]);}
   return{pts:out,Ro};};
 const be=PI/2-PI/N,amin=-TAU+be+0.12,amax=4*TAU-be-0.12;
 const o=reg({num:212,outLabel:'Arbor turns',N,d,r,pr,RL,lock:true,Ro:Math.sqrt(d*d-r*r)+2,D:[320,262],Wc:[320+d,262],
   wheel(){if(!this._w)this._w=genevaStop();return this._w;},
   update(phi){const a=amin+(amax-amin)*(1-Math.cos(phi*0.25))/2,k=genevaKin(a,N);this.g={phi,a,w:k.gam,eng:k.eng,turns:(a-amin)/TAU};},output(){return this.g.turns;},
   draw(){const g=this.g,D=this.D,Wc=this.Wc,w=this.wheel(),c=Math.cos(g.w),s=Math.sin(g.w);poly(w.pts.map(([x,y])=>[Wc[0]+x*c-y*s,Wc[1]+x*s+y*c]));ctx.closePath();circ(Wc[0],Wc[1],7,false);paint(C['steel-fill'],C.ink);pivot(Wc[0],Wc[1],5);
     const t=g.a,ct=Math.cos(t),st=Math.sin(t),T=([x,y])=>[D[0]+x*ct-y*st,D[1]+x*st+y*ct];poly(lockDiskPts(RL,d,w.Ro+4).map(T));ctx.closePath();paint(C['brass-fill'],C.ink);
     poly([[-10,-12],[r-4,-9],[r-4,9],[-10,12]].map(T));ctx.closePath();paint(C['brass-fill'],C.ink);const P=T([r,0]);circ(P[0],P[1],pr);paint(C.part2,C.ink);pivot(D[0],D[1],5);
     const stop=g.a<amin+0.05||g.a>amax-0.05;label(stop?'STOPPED · the finger meets the blank place on the star':g.eng?'FINGER IN A SLOT · star moves one place':'STAR LOCKED by the arbor’s rim',400,470,'center');label('WINDING ARBOR',D[0]-60,D[1]+110,'center');label('STAR (one place blank)',Wc[0]+60,Wc[1]+120,'center');},
   reads(){return[['Arbor turns',`${this.g.turns.toFixed(2)} of ${((amax-amin)/TAU).toFixed(1)}`],['Star places used','4 of 5']];}});
 for(const n of [213,214,215])aliasObj(n,o,{concept:true});}

/* 224 · expanding pulley: six arms slide in radial guides; a plate with six curved slots turns on the hub, and the arms' studs
   in the slots move them out or in together. Clamp the plate and the pulley keeps its new size. */
{const m=SIMS_NEW[224];m.draw=function(){const g=this.g,A=[300,260],B=[620,260],U=0.8,psi=-U*(g.r-60)/45;drawBelt(beltPath(A[0],A[1],g.r+6,B[0],B[1],60,false),g.r*g.phi,6);
   circ(A[0],A[1],96);paint(C.part,C.ink);const c=Math.cos(g.phi+psi),s=Math.sin(g.phi+psi);
   for(let k=0;k<6;k++){const pts=[];for(let i=0;i<=20;i++){const u=i/20*U,rr=25+45*u/U,t=k*PI/3+u;pts.push([rr*Math.cos(t),rr*Math.sin(t)]);}ctx.save();ctx.lineCap='round';ctx.strokeStyle=C.ink;ctx.lineWidth=11;poly(pts.map(([x,y])=>[A[0]+x*c-y*s,A[1]+x*s+y*c]));ctx.stroke();ctx.strokeStyle=C.sheet;ctx.lineWidth=8.5;ctx.stroke();ctx.restore();}
   for(let k=0;k<6;k++){const a=g.phi+k*PI/3,ca=Math.cos(a),sa=Math.sin(a),rs=g.r-35;bar(A[0]+(rs-10)*ca,A[1]+(rs-10)*sa,A[0]+(g.r-8)*ca,A[1]+(g.r-8)*sa,10,C.part2);ctx.save();ctx.translate(A[0]+g.r*ca,A[1]+g.r*sa);ctx.rotate(a);ctx.beginPath();ctx.rect(-4,-20,10,40);paint(C['brass-fill'],C.ink);ctx.restore();circ(A[0]+rs*ca,A[1]+rs*sa,4);paint(C.ink,null);}
   pivot(A[0],A[1],6);pulley(B[0],B[1],60,g.phi*(g.r+6)/60,C['steel-fill']);label('TURN THE SLOTTED PLATE ON THE HUB: the studs ride the curved slots and the arms slide out',330,450,'center');};}

/* 227–229 · chain on pocketed pulleys, drawn on the same layout as the 3D model: pitch 22, eight pockets, centres 14 pitches apart */
for(const n of [227,228,229]){const m=SIMS_NEW[n];if(!m)continue;const alt=n!==229;
 m.draw=function(){const g=this.g,p=22,Np=8,R=p*Np/PI,D=14*p,A=[400-D/2,260],B=[400+D/2,260],Lt=2*D+TAU*R,N=Math.round(Lt/p),step=alt?2:1,pk=step*p/R,cB=-PI/2+(p/2-D)/R,cA=PI/2+(p/2-2*D-PI*R)/R;
   const at=s=>{s=mod(s,Lt);if(s<D)return[A[0]+s,A[1]-R];if(s<D+PI*R){const t=-PI/2+(s-D)/R;return[B[0]+R*Math.cos(t),B[1]+R*Math.sin(t)];}if(s<2*D+PI*R)return[B[0]-(s-D-PI*R),B[1]+R];const t=PI/2+(s-2*D-PI*R)/R;return[A[0]+R*Math.cos(t),A[1]+R*Math.sin(t)];};
   for(const [P,c0,f] of [[A,cA,C['brass-fill']],[B,cB,C.part]]){const pts=[];const M=Np*step*24;for(let i=0;i<M;i++){const t=i/M*TAU,k=Math.round((t-c0)/pk),dt=Math.abs(t-c0-k*pk)*R,r=dt<0.75*p?R-9:R-6;pts.push([r*Math.cos(t),r*Math.sin(t)]);}polyAt(pts,P[0],P[1],g.s/R);circ(P[0],P[1],7,false);paint(f,C.ink);pivot(P[0],P[1],6);}
   ctx.save();ctx.lineCap='round';for(let i=0;i<N;i++){const q0=at(i*p+g.s),q1=at(i*p+p+g.s),c=[(q0[0]+q1[0])/2,(q0[1]+q1[1])/2],a=Math.atan2(q1[1]-q0[1],q1[0]-q0[0]),h=0.7*p;
     ctx.save();ctx.translate(c[0],c[1]);ctx.rotate(a);if(alt&&i%2){ctx.beginPath();ctx.rect(-h,-2.6,2*h,5.2);paint(C['steel-fill'],C.ink,1);}else{ctx.beginPath();ctx.rect(-h,-7.5,2*h,15);ctx.rect(-h+5,-2.5,2*h-10,5);paint(C.steel,C.ink,1);}ctx.restore();}ctx.restore();
   label(alt?'LINKS IN ALTERNATE PLANES · flat links lie in the pockets, upright links ride over the rim':'FLAT-LINK CHAIN · every link lies in a pocket',400,400,'center');};}

/* ================= audit pass 231–270 ================= */
/* 233 · two stops for a lantern wheel (20 staves). (a) a 12-tooth pinion meshing with the staves has one tooth space filled:
   after eleven staves the filled space meets a stave and the wheel stops. (b) a stud on the wheel strikes a fixed finger. */
reg({num:233,outLabel:'Lantern wheel, turns',O:[330,265],R:100,Ns:20,Zp:12,params:[{id:'m',type:'toggle',label:'Stop',options:[[0,'Filled tooth space'],[1,'Stud and finger']],value:0}],
  lim(){const p=TAU/this.Ns;return this.P.m===0?[-0.42*p,10.42*p]:[-PI+0.32,PI-0.32];},
  update(phi){const [a0,a1]=this.lim(),a=a0+(a1-a0)*(1-Math.cos(phi*0.4))/2;this.g={phi,a,a0,a1};},output(){return this.g.a/TAU;},
  draw(){const g=this.g,O=this.O,R=this.R,Ns=this.Ns,Zp=this.Zp,rp=Zp*R/Ns,P=[O[0]+R+rp,O[1]];
    circ(O[0],O[1],R+18);circ(O[0],O[1],R-18,false);paint(C.part,C.ink);for(let i=0;i<Ns;i++){const t=g.a+i*TAU/Ns;circ(O[0]+R*Math.cos(t),O[1]+R*Math.sin(t),5.5);paint(C.part2,C.ink);}
    circ(O[0],O[1],R-18);paint(C['steel-fill'],C.ink);pivot(O[0],O[1],6);
    if(this.P.m===0){const b=PI-PI/Zp-g.a*Ns/Zp;drawGear(P[0],P[1],rp,Zp,b,C['brass-fill'],{bore:5});const tb=b+PI/Zp+TAU/Zp*11;/* the filled space */
      const m=2*rp/Zp;ctx.beginPath();ctx.arc(P[0],P[1],rp+m*0.9,tb-PI/Zp*0.9,tb+PI/Zp*0.9);ctx.arc(P[0],P[1],rp-1.25*m,tb+PI/Zp*0.9,tb-PI/Zp*0.9,true);ctx.closePath();paint(C.brass,C.ink);pivot(P[0],P[1],5);
      label('PINION WITH ONE SPACE FILLED',P[0],P[1]+rp+40,'center');}
    else{const s=[O[0]+(R-40)*Math.cos(g.a),O[1]+(R-40)*Math.sin(g.a)];circ(s[0],s[1],9);paint(C.brass,C.ink);const F=[O[0]-R+10,O[1]];ctx.beginPath();ctx.rect(F[0]-80,F[1]-7,96,14);paint(C['brass-fill'],C.ink);pivot(F[0]-70,F[1],5);ground(F[0]-70,F[1]+10,30);label('FIXED FINGER',F[0]-60,F[1]-20,'center');label('STUD',s[0]+12,s[1]-10);}
    const stop=g.a<g.a0+0.02||g.a>g.a1-0.02;label(stop?'STOPPED':'TURNING',O[0],O[1]+R+50,'center');},
  reads(){const g=this.g;return[['Turns made',`${((g.a-g.a0)/TAU).toFixed(2)}`],['Free travel',`${((g.a1-g.a0)/TAU).toFixed(2)} turn`]];}});

/* 252 · two slanted slots in the slide, kept inside the plate; each roller's rod is guided straight, so both move in or out equally */
{const m=SIMS_NEW[252];m.draw=function(){const g=this.g,X=400+g.x,y=270,k=0.5;ctx.beginPath();ctx.rect(X-160,y-130,320,260);paint(C['steel-fill'],C.ink);
  for(const s of [-1,1]){const p0=[X-130,y+s*(60-k*130*0)],a=s*Math.atan(k);ctx.save();ctx.translate(X,y+s*60);ctx.rotate(-s*Math.atan(k));ctx.beginPath();ctx.rect(-140,-10,280,20);ctx.restore();ctx.fillStyle=C.sheet;ctx.fill();ctx.strokeStyle=C.ink;ctx.lineWidth=1;ctx.stroke();}
  for(const s of [-1,1]){const yy=y+s*(60+(-g.x)*k);circ(400,yy,10);paint(C.hi,C.ink);bar(400,yy,400,y+s*230,10,C.part);ctx.beginPath();ctx.rect(386,y+s*200-10,28,20);paint(C.part2,C.ink);}
  bar(X+160,y,760,y,10,C.part);label('SLANTED SLOTS MOVE BOTH ROLLERS EQUALLY',600,60,'center');};
 m.update=function(phi){const x=80*Math.sin(phi);this.g={phi,x,s:60-x*0.5};};}


/* 260 · Brown: a differential screw worked by two wheels running at slightly different speeds. A countershaft carries two equal
   pinions; one drives a 20-tooth wheel fixed on the screw, the other a 21-tooth wheel on the nut. Screw and nut turn nearly together,
   so the nut creeps along the screw by only 1/21 of a pitch for each turn of the screw. */
reg({num:260,outLabel:'Nut travel, mm',concept:true,p:16,
  update(phi){const ts=phi,tn=phi*20/21,x=this.p*(ts-tn)/TAU;this.g={phi,ts,tn,x};},output(){return this.g.x;},
  draw(){const g=this.g,y=330,x0=140,x1=660,X=380+g.x*6;screwShaft(x0,x1,y,18,g.ts,this.p);ctx.beginPath();ctx.rect(x0-30,y-30,22,60);ctx.rect(x1+8,y-30,22,60);paint(C.part2,C.ink);
    drawGear(x0+40,y,60,20,g.ts,C['brass-fill'],{bore:6});ctx.beginPath();ctx.rect(X-40,y-26,80,52);paint(C['steel-fill'],C.ink);drawGear(X+60,y,60,21,g.tn,C['steel-fill'],{bore:6});
    const yc=y-84;bar(x0,yc,x1,yc,8,C.part);drawGear(x0+40,yc,24,8,-g.ts*20/8+PI/8,C.part,{bore:4});ctx.beginPath();ctx.rect(X-10,yc-24,140,48);paint(C.part,C.ink);drawGear(X+60,yc,24,8,-g.tn*21/8+PI/8,C.part,{bore:4});
    label('TWO EQUAL PINIONS ON THE COUNTERSHAFT',400,60,'center');label('20 teeth on the screw · 21 on the nut',400,80,'center');label('NUT creeps 1/21 pitch per turn',X,y+60,'center');},
  reads(){const g=this.g;return[['Screw turns',`${(g.ts/TAU).toFixed(2)}`],['Nut turns',`${(g.tn/TAU).toFixed(2)}`],['Nut travel',`${g.x.toFixed(2)} mm`]];}});

/* 239 · stops for a spur gear: (a) a stud on the wheel strikes a fixed stop; (b) the pinion has one tooth space filled, so the
   wheel can turn only as far as the pinion's other spaces allow */
reg({num:239,outLabel:'Wheel angle, degrees',A:[300,265],RA:100,ZA:40,rB:40,ZB:16,params:[{id:'m',type:'toggle',label:'Stop',options:[[0,'Stud and fixed stop'],[1,'Filled space in the pinion']],value:0}],
  lim(){const p=TAU/this.ZA;return this.P.m===0?[-PI+0.26,PI-0.26]:[-0.42*p,14.42*p];},
  update(phi){const [a0,a1]=this.lim(),a=a0+(a1-a0)*(1-Math.cos(phi*0.4))/2;this.g={phi,a,a0,a1};},output(){return this.g.a*180/PI;},
  draw(){const g=this.g,A=this.A,RA=this.RA,ZA=this.ZA,rB=this.rB,ZB=this.ZB,B=[A[0]+RA+rB,A[1]],b=PI-PI/ZB-g.a*ZA/ZB;
    drawGear(A[0],A[1],RA,ZA,g.a,C['brass-fill'],{bore:6});drawGear(B[0],B[1],rB,ZB,b,C['steel-fill'],{bore:5});pivot(A[0],A[1],6);pivot(B[0],B[1],5);
    if(this.P.m===0){const s=[A[0]+66*Math.cos(g.a+PI),A[1]+66*Math.sin(g.a+PI)];circ(s[0],s[1],9);paint(C.part2,C.ink);const F=[A[0]+66,A[1]];ctx.beginPath();ctx.rect(F[0]-8,F[1]-8,16,16);paint(C.part,C.ink);label('FIXED STOP',F[0],F[1]-16,'center');}
    else{const tb=b+PI/ZB+TAU/ZB*15,m=2*rB/ZB;ctx.beginPath();ctx.arc(B[0],B[1],rB+m*0.9,tb-PI/ZB*0.9,tb+PI/ZB*0.9);ctx.arc(B[0],B[1],rB-1.25*m,tb+PI/ZB*0.9,tb-PI/ZB*0.9,true);ctx.closePath();paint(C.steel,C.ink);}
    const stop=g.a<g.a0+0.02||g.a>g.a1-0.02;label(stop?'STOPPED':(this.P.m===0?'STUD ON THE WHEEL · fixed stop on the frame':'PINION WITH ONE SPACE FILLED'),400,470,'center');},
  reads(){const g=this.g;return[['Wheel',`${(g.a*180/PI).toFixed(0)}°`],['Free travel',`${((g.a1-g.a0)*180/PI).toFixed(0)}°`]];}});

/* 269 · Brown: continued rectilinear movement of the frame with mutilated racks gives an alternate rotary motion to the spur-gear.
   The frame's racks are cut in short lengths, upper and lower in turn; the frame moves steadily one way and the gear turns back and forth. */
reg({num:269,outLabel:'Gear angle, degrees',concept:true,P0:[400,270],rp:50,m:5,seg:8,nseg:4,
  geo(){const p=PI*this.m,L=this.seg*p;return{p,L,T:this.nseg*L};},
  update(phi){const G=this.geo(),s=G.T*(1-Math.cos(phi*0.25))/2,k=Math.floor(s/G.L),u=s-k*G.L,a=(k%2===0?-u:-(G.L-u))/this.rp;this.g={phi,s,a,top:k%2===0};},
  output(){return this.g.a*180/PI;},
  draw(){const g=this.g,G=this.geo(),P=this.P0,rp=this.rp,m=this.m,H=rp+1.25*m,X0=P[0]-g.s;/* frame-local x=0 at X0 */
    ctx.beginPath();ctx.rect(X0-rp-40,P[1]-H-30,G.T+2*rp+80,2*H+60);ctx.rect(X0-rp-30,P[1]-H,G.T+2*rp+60,2*H);paint(C['steel-fill'],C.ink);
    for(let k=0;k<G.T/G.L;k++){const top=k%2===0,x0=X0+k*G.L-G.L/2+(top?G.L/2:G.L/2),xa=X0+k*G.L,xb=xa+G.L;const y=top?P[1]-H:P[1]+H,dir=top?1:-1,pts=rackTeeth(xa,xb,X0+G.p/2,G.p,y+dir*1.25*m,m,top);poly([[xa,y],...pts,[xb,y]]);ctx.closePath();paint(C['steel-fill'],C.ink,.9);}
    drawGear(P[0],P[1],rp,20,g.a,C['brass-fill'],{bore:6});pivot(P[0],P[1],5);
    label('FRAME MOVES STEADILY ONE WAY · upper and lower part-racks turn the gear back and forth',400,490,'center');label(g.top?'UPPER RACK IN MESH':'LOWER RACK IN MESH',400,40,'center');},
  reads(){return[['In mesh',this.g.top?'upper rack':'lower rack'],['Frame travel',`${this.g.s.toFixed(0)} mm`]];}});

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

/* ================= audit pass 321–360 ================= */
/* parallel rulers: every one keeps its working edge parallel; each is drawn with the parts that really do the guiding */
const RUL={
  dash(y,x0,x1,c){ctx.save();ctx.strokeStyle=c||C.steel;ctx.setLineDash([6,6]);ctx.beginPath();ctx.moveTo(x0,y);ctx.lineTo(x1,y);ctx.stroke();ctx.restore();},
  rule(x,y,w,h,fill,slot){ctx.beginPath();ctx.rect(x,y,w,h);if(slot){const [a,b,yc]=slot,r=6;ctx.moveTo(b,yc-r);ctx.arc(b,yc,r,-PI/2,PI/2);ctx.lineTo(a,yc+r);ctx.arc(a,yc,r,PI/2,3*PI/2);ctx.closePath();}ctx.fillStyle=fill;ctx.fill('evenodd');ctx.strokeStyle=C.ink;ctx.lineWidth=1.2;ctx.stroke();}
};
/* 322 · two right triangles laid hypotenuse to hypotenuse; the lower one is held and the upper slides along the long edge,
   so its top edge moves to a new line but never turns */
reg({num:322,outLabel:"Ruler spacing, mm",X0:110,X1:510,Y0:440,Y1:270,
  update(phi){const s=125*(1-Math.cos(phi*0.5));const L=Math.hypot(this.X1-this.X0,this.Y0-this.Y1),u=[(this.X1-this.X0)/L,(this.Y1-this.Y0)/L];this.g={phi,s,d:[s*u[0],s*u[1]]};},
  output(){return -(this.g.d[1])+0;},
  draw(){const g=this.g,{X0,X1,Y0,Y1}=this,[dx,dy]=g.d;
    poly([[X0,Y0],[X1,Y0],[X1,Y1]]);ctx.closePath();paint(C.part2,C.ink);label('HELD',X1-60,Y0-16,'center');
    poly([[X0+dx,Y0+dy],[X0+dx,Y1+dy],[X1+dx,Y1+dy]]);ctx.closePath();paint(C['brass-fill'],C.ink);
    circ(X0+dx+60,Y1+dy+50,10);paint(C.part,C.ink);/* finger knob */
    RUL.dash(Y1,60,740,C.part);RUL.dash(Y1+dy,60,740);
    ctx.save();ctx.strokeStyle=C.hi;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(X0+dx,Y1+dy);ctx.lineTo(X1+dx,Y1+dy);ctx.stroke();ctx.restore();
    label('UPPER TRIANGLE SLIDES ALONG THE LONG EDGE',400,60,'center');label('its top edge (the ruling edge) stays parallel',400,82,'center');},
  reads(){const g=this.g;return[['Moved up',`${(-g.d[1]).toFixed(0)} mm`],['Moved along',`${g.d[0].toFixed(0)} mm`],['Edge','parallel']];}});

/* 323 · rolling ruler, seen from above: one axle under the rule carries two equal wheels, so both ends roll the same distance
   and the rule moves square to its edge. A side view of one wheel is inset. */
reg({num:323,outLabel:'Ruler travel, mm',r:28,
  update(phi){const y=150*(1-Math.cos(phi*0.5))/2;this.g={phi,y,th:y/this.r};},output(){return this.g.y;},
  draw(){const g=this.g,r=this.r,Y=380-g.y,x0=150,x1=650,W=56;
    RUL.dash(380-W/2,60,740,C.part);
    RUL.rule(x0,Y-W/2,x1-x0,W,C['brass-fill']);
    for(const x of [x0+40,x1-40]){ctx.beginPath();ctx.rect(x-9,Y-r,18,2*r);paint(C['steel-fill'],C.ink);
      for(let k=0;k<12;k++){const t=-g.th+k*PI/6,c=Math.cos(t);if(c<0.05)continue;const yy=Y+r*Math.sin(t);ctx.save();ctx.globalAlpha=0.3+0.7*c;ctx.beginPath();ctx.moveTo(x-9,yy);ctx.lineTo(x+9,yy);paint(null,C.ink,1);ctx.restore();}}
    ctx.save();ctx.setLineDash([3,4]);bar(x0+40,Y,x1-40,Y,6,C.part);ctx.restore();label('AXLE (under the rule)',400,Y+4,'center');
    ctx.save();ctx.strokeStyle=C.hi;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x0,Y-W/2);ctx.lineTo(x1,Y-W/2);ctx.stroke();ctx.restore();
    /* side view inset */
    const I=[690,110];ctx.beginPath();ctx.rect(I[0]-70,I[1]-60,140,120);paint(C.sheet,C.ink,.6);ctx.beginPath();ctx.moveTo(I[0]-65,I[1]+r);ctx.lineTo(I[0]+65,I[1]+r);paint(null,C.ink,1.4);
    const cx=I[0];for(let k=-3;k<=4;k++){const x=I[0]+mod(k*24+g.y,192)-96;if(x<I[0]-64||x>I[0]+64)continue;ctx.beginPath();ctx.moveTo(x,I[1]+r);ctx.lineTo(x-8,I[1]+r+10);paint(null,C.ink,1);}circ(cx,I[1],r);paint(C['steel-fill'],C.ink);for(let k=0;k<4;k++){const t=-g.th+k*PI/2;bar(cx,I[1],cx+(r-4)*Math.cos(t),I[1]+(r-4)*Math.sin(t),3,C.part);}pivot(cx,I[1],3);label('SIDE VIEW',I[0],I[1]-46,'center');
    label('BOTH WHEELS ARE FAST ON ONE AXLE · the rule rolls square to its edge',400,490,'center');},
  reads(){const g=this.g;return[['Travel',`${g.y.toFixed(0)} mm`],['Wheel turns',`${(g.th/TAU).toFixed(2)}`]];}});

/* 324 · two rules joined by two equal arms crossed and pivoted at their middles. Each arm is pinned to one rule at one end and
   slides in a slot of the other rule at the other end, so the upper rule rises straight up, square to the lower one. */
reg({num:324,outLabel:'Ruler spacing, mm',L:250,xa:280,y0:420,
  update(phi){const t=0.28+0.5*(1-Math.cos(phi*0.5))/2;this.g={phi,t,h:this.L*Math.sin(t),c:this.L*Math.cos(t)};},output(){return this.g.h;},
  draw(){const g=this.g,{L,xa,y0}=this,y1=y0-g.h,xs=xa+g.c,H=34,sa=xa+L*Math.cos(0.78)-2,sb=xa+L*Math.cos(0.28)+2;
    RUL.rule(150,y0-H/2,520,H,C.part2,[sa,sb,y0]);RUL.rule(150,y1-H/2,520,H,C['brass-fill'],[sa,sb,y1]);label('HELD',620,y0+4,'center');
    bar(xa,y0,xs,y1,12,C['steel-fill']);bar(xa,y1,xs,y0,12,C['steel-fill']);
    pivot(xa,y0,5);pivot(xa,y1,5);circ(xs,y1,6);paint(C.hi,C.ink);circ(xs,y0,6);paint(C.hi,C.ink);pivot(xa+g.c/2,(y0+y1)/2,5);
    RUL.dash(y0-L*Math.sin(0.28),60,740,C.part);
    ctx.save();ctx.strokeStyle=C.part;ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(xa,y0+40);ctx.lineTo(xa,y0-L-20);ctx.stroke();ctx.restore();
    label('PINNED END',xa-12,y1-26,'right');label('PIN IN SLOT',xs+14,y1-26);
    label('ARMS CROSSED AND PIVOTED AT THE MIDDLE · the upper rule rises straight up',400,490,'center');},
  reads(){const g=this.g;return[['Spacing',`${g.h.toFixed(0)} mm`],['Pin in slot at',`${g.c.toFixed(0)} mm`],['Side shift','none']];}});

/* 349 · jointed arms: each arm is two links with a joint at the middle; the two joints are tied by a middle bar, so each half is
   a parallelogram and the rule can be opened twice as wide while staying parallel */
reg({num:349,outLabel:'Ruler spacing, mm',l:110,
  update(phi){const a1=-PI/2+0.75*Math.sin(phi*0.5),a2=-PI/2+0.75*Math.sin(phi*0.5-0.9);this.g={phi,a1,a2,h:-this.l*(Math.sin(a1)+Math.sin(a2))};},output(){return this.g.h;},
  draw(){const g=this.g,l=this.l,y0=430,P=[260,540],d1=[l*Math.cos(g.a1),l*Math.sin(g.a1)],d2=[l*Math.cos(g.a2),l*Math.sin(g.a2)],H=30;
    RUL.rule(150,y0-H/2,500,H,C.part2);label('HELD',600,y0+4,'center');
    const M=P.map(x=>[x+d1[0],y0+d1[1]]),T=M.map(m=>[m[0]+d2[0],m[1]+d2[1]]);
    RUL.rule(T[0][0]-110,T[0][1]-H/2,500,H,C['brass-fill']);
    bar(M[0][0]-40,M[0][1],M[1][0]+40,M[1][1],10,C.part);
    for(let i=0;i<2;i++){bar(P[i],y0,M[i][0],M[i][1],10,C['steel-fill']);bar(M[i][0],M[i][1],T[i][0],T[i][1],10,C['steel-fill']);pivot(P[i],y0,4);pivot(M[i][0],M[i][1],4);pivot(T[i][0],T[i][1],4);}
    RUL.dash(T[0][1]-H/2,60,740);label('MIDDLE BAR',M[1][0]+50,M[1][1]-12);
    label('JOINTED ARMS · two parallelograms, one above the other',400,490,'center');},
  reads(){const g=this.g;return[['Spacing',`${g.h.toFixed(0)} mm`],['Edges','parallel']];}});

/* 321 · Harrison's maintaining power. The barrel's ratchet drives the going ratchet through a click; the going ratchet drives the
   great wheel through two springs, which are therefore always a little compressed. To wind, the barrel is turned backwards: the click
   slips over the barrel ratchet, the maintaining detent on the frame stops the going ratchet from turning back, and the compressed
   springs keep pushing the great wheel forward until winding is done. */
const RAT={/* ratchet outline, local; dir +1: free to turn + (clockwise) under a fixed pawl, blocked − ; dir −1 the reverse */
  pts(N,r0,R,dir,ph=0){const p=TAU/N,o=[];for(let i=0;i<N;i++){const a=ph+i*p;if(dir>0){o.push([R*Math.cos(a),R*Math.sin(a)]);for(let k=1;k<=4;k++){const t=a+p*k/4*0.97,r=R-(R-r0)*k/4;o.push([r*Math.cos(t),r*Math.sin(t)]);}}
    else{o.push([r0*Math.cos(a),r0*Math.sin(a)]);for(let k=1;k<=4;k++){const t=a+p*0.03+p*0.97*k/4,r=r0+(R-r0)*k/4;o.push([r*Math.cos(t),r*Math.sin(t)]);}}}return o;},
  rho(N,r0,R,dir,ph,t){const p=TAU/N,f=mod(t-ph,p)/p;return dir>0?R-(R-r0)*Math.min(1,f/0.97):(f<0.03?r0:r0+(R-r0)*(f-0.03)/0.97);},
  /* pawl pivoted at D (relative to wheel centre, wheel-frame angles), length l: find the tip angle b in [b0,b1] that rests on the teeth */
  pawl(N,r0,R,dir,ph,D,l,b0,b1){let lo=b0,hi=b1;const f=b=>{const T=[D[0]+l*Math.cos(b),D[1]+l*Math.sin(b)];return Math.hypot(T[0],T[1])-RAT.rho(N,r0,R,dir,ph,Math.atan2(T[1],T[0]));};
    const fl=f(lo);if(fl*f(hi)>0){return Math.abs(fl)<Math.abs(f(hi))?lo:hi;}for(let i=0;i<40;i++){const m=(lo+hi)/2;if(f(m)*fl>0)lo=m;else hi=m;}return(lo+hi)/2;}
};
reg({num:321,RAT,outLabel:'Great wheel, turns',O:[330,262],T:4*PI,k:3*TAU/16/(4*PI),d0:0.5,wa:0.5*PI,wd:3.0,
  NG:40,rg0:96,RG:110,NB:16,rb0:46,RB:58,RW:150,ZW:60,
  update(phi){const T=this.T,k=this.k,c=Math.floor(phi/T),u=phi-c*T,gw=k*phi,pg=TAU/this.NG,wb=3*TAU/16,ws=c*T+this.wa,we=ws+this.wd;
    let ra,ba,wind=false;const raS=k*ws+this.d0,hold=pg*Math.floor(raS/pg+1e-9)+0.004;
    if(phi<ws){ra=gw+this.d0;ba=ra-c*wb;}
    else if(phi<we){wind=true;const s=(phi-ws)/this.wd;ra=raS+(hold-raS)*smooth(Math.min(1,s*8));ba=raS-c*wb-wb*smooth(s);ra=Math.min(ra,raS);}
    else{const r=smooth(Math.min(1,(phi-we)/0.5));ra=hold+(gw+this.d0-hold)*r;ba=ra-(c+1)*wb;}
    this.g={phi,gw,ra,ba,wind,sp:ra-gw};},
  output(){return this.g.gw/TAU;},
  draw(){const g=this.g,O=this.O,{NG,rg0,RG,NB,rb0,RB,RW,ZW}=this;
    /* weight on the barrel cord (the barrel is behind the wheels) */
    const yW=300+40*g.ba;rope([[O[0]-36,O[1]],[O[0]-36,yW]]);weight(O[0]-36,yW,44,54,'');
    drawGear(O[0],O[1],RW,ZW,g.gw,C['steel-fill'],{bore:8,spokes:4});
    const P=[O[0]+RW+28,O[1]];drawGear(P[0],P[1],28,12,-g.gw*ZW/12+PI/12,C.part,{bore:4});pivot(P[0],P[1],4);label('TRAIN',P[0]+40,P[1]-30);
    /* going ratchet: a toothed ring on three spokes; two spokes carry springs that push studs on the great wheel */
    const at=(a,r)=>[O[0]+r*Math.cos(a),O[1]+r*Math.sin(a)];
    polyAt(RAT.pts(NG,rg0,RG,1),O[0],O[1],g.ra);circ(O[0],O[1],88,false);ctx.fillStyle=C['brass-fill'];ctx.fill('evenodd');ctx.strokeStyle=C.ink;ctx.lineWidth=1.2;ctx.stroke();
    for(let k=0;k<3;k++){const a=g.ra-0.9+k*TAU/3;bar(...at(a,20),...at(a,90),12,C['brass-fill']);}circ(O[0],O[1],24);paint(C['brass-fill'],C.ink);
    for(const k of [1,2]){const a1=g.ra-0.9+k*TAU/3,a2=g.gw+this.d0-0.9+k*TAU/3+0.8;/* spring from the spoke to the great-wheel stud */
      ctx.save();ctx.strokeStyle=C.muted;ctx.lineWidth=1.4;ctx.beginPath();const n=2*Math.max(3,Math.round((a2-a1)*72/6));for(let i=0;i<=n;i++){const t=a1+0.08+(a2-a1-0.16)*i/n,r=72+(i%2?5:-5)*(i>0&&i<n?1:0),p=at(t,r);i?ctx.lineTo(...p):ctx.moveTo(...p);}ctx.stroke();ctx.restore();
      circ(...at(a2,72),5);paint(C.part,C.ink);}
    /* barrel ratchet and the click riding on the going ratchet */
    polyAt(RAT.pts(NB,rb0,RB,-1),O[0],O[1],g.ba);paint(C.part2,C.ink);circ(O[0],O[1],14);paint(C['steel-fill'],C.ink);ctx.beginPath();ctx.rect(O[0]-6,O[1]-6,12,12);paint(C.part,C.ink);
    {const Dl=[78*Math.cos(-0.9),78*Math.sin(-0.9)],rel=g.ba-g.ra,b=RAT.pawl(NB,rb0,RB,-1,rel,Dl,30,-PI-0.9,-PI+1.2);
     const D=at(g.ra-0.9,78),bw=b+g.ra,Tp=[D[0]+30*Math.cos(bw),D[1]+30*Math.sin(bw)];bar(...D,...Tp,7,C.part);pivot(...D,3.5);springZ(D[0]+8*Math.cos(g.ra-0.2),D[1]+8*Math.sin(g.ra-0.2),...at(g.ra-0.55,82),4,3);}
    /* maintaining detent on the frame */
    {const Dd=[172*Math.cos(-2.75),172*Math.sin(-2.75)],b=RAT.pawl(NG,rg0,RG,1,g.ra,Dd,95,-0.8,0.5),D=[O[0]+Dd[0],O[1]+Dd[1]],Tp=[D[0]+95*Math.cos(b),D[1]+95*Math.sin(b)];
     bar(...D,...Tp,8,g.wind?C.hi:C.part);pivot(...D,4.5);ground(D[0],D[1]-8,30,true);label('MAINTAINING DETENT',D[0]-10,D[1]-22,'right');}
    pivot(O[0],O[1],5);
    label('GOING RATCHET',O[0]+60,O[1]+RW+26);label('BARREL RATCHET',O[0]-120,O[1]+RW+26,'center');
    label(g.wind?'WINDING · barrel turned back, detent holds the going ratchet, springs drive the great wheel':'GOING · barrel → click → going ratchet → springs → great wheel',400,505,'center');},
  reads(){const g=this.g;return[['State',g.wind?'being wound':'going'],['Spring set',`${((g.sp)*180/PI).toFixed(0)}°`],['Great wheel','never stops']];}});

/* 347 · Bishop's disk engine, seen in section with the crank in plan. The disk piston is fixed on a ball at the centre of a spherical
   chamber whose faces are two shallow cones. A radial partition passes through a slot in the disk, so the disk cannot spin; steam on one
   side and exhaust on the other make it nod round, so its spindle sweeps a cone and turns the crank on the vertical shaft once per nod. */
reg({num:347,outLabel:'Crank turns',concept:true,O:[300,320],R:140,t:0.38,Ls:170,
  geo(phi){const t=this.t,n=[Math.sin(t)*Math.cos(phi),Math.sin(t)*Math.sin(phi),Math.cos(t)],u=[Math.cos(t)*Math.cos(phi),Math.cos(t)*Math.sin(phi),-Math.sin(t)],v=[-Math.sin(phi),Math.cos(phi),0];return{n,u,v};},
  update(phi){this.g={phi,...this.geo(phi)};},output(){return this.g.phi/TAU;},
  draw(){const g=this.g,O=this.O,R=this.R,t=this.t,P=(p)=>[O[0]+p[0],O[1]-p[2]];
    /* casing in section: two cones and the spherical wall */
    ctx.beginPath();ctx.moveTo(O[0]-R-24,O[1]-R*Math.sin(t)-34);ctx.lineTo(O[0]-R*Math.cos(t),O[1]-R*Math.sin(t));ctx.lineTo(O[0],O[1]);ctx.lineTo(O[0]+R*Math.cos(t),O[1]-R*Math.sin(t));ctx.lineTo(O[0]+R+24,O[1]-R*Math.sin(t)-34);ctx.lineTo(O[0]+R+24,O[1]-R*Math.sin(t)-60);ctx.lineTo(O[0]-R-24,O[1]-R*Math.sin(t)-60);ctx.closePath();paint(C.part2,C.ink);
    ctx.beginPath();ctx.moveTo(O[0]-R-24,O[1]+R*Math.sin(t)+34);ctx.lineTo(O[0]-R*Math.cos(t),O[1]+R*Math.sin(t));ctx.lineTo(O[0],O[1]);ctx.lineTo(O[0]+R*Math.cos(t),O[1]+R*Math.sin(t));ctx.lineTo(O[0]+R+24,O[1]+R*Math.sin(t)+34);ctx.lineTo(O[0]+R+24,O[1]+R*Math.sin(t)+60);ctx.lineTo(O[0]-R-24,O[1]+R*Math.sin(t)+60);ctx.closePath();paint(C.part2,C.ink);
    for(const s of [-1,1]){ctx.beginPath();ctx.arc(O[0],O[1],R,s>0?-t-0.02:PI-t-0.02,s>0?t+0.02:PI+t+0.02);ctx.lineTo(O[0]+s*(R+24),O[1]+R*Math.sin(t)+34);ctx.lineTo(O[0]+s*(R+24),O[1]-R*Math.sin(t)-34);ctx.closePath();paint(C.part2,C.ink);}
    ctx.beginPath();ctx.arc(O[0],O[1],R,-t,t);ctx.arc(O[0],O[1],R,PI-t,PI+t);paint(null,C.ink,1.4);
    /* disk piston (projected) */
    const pts=[];for(let i=0;i<64;i++){const s=i/64*TAU,p=[0,1,2].map(k=>R*0.985*(g.u[k]*Math.cos(s)+g.v[k]*Math.sin(s)));pts.push(P(p));}poly(pts);ctx.closePath();paint(C['steel-fill'],C.ink);
    circ(O[0],O[1],26);paint(C['brass-fill'],C.ink);
    /* spindle, crank and vertical shaft */
    const E=P(g.n.map(x=>x*this.Ls)),zE=O[1]-this.Ls*Math.cos(t);bar(O[0],O[1],E[0],E[1],12,C['brass-fill']);
    ctx.beginPath();ctx.rect(O[0]-7,zE-150,14,150+8);paint(C.part,C.ink);bar(O[0],zE,E[0],zE,12,C.part2);circ(E[0],zE,8);paint(C.hi,C.ink);
    ctx.beginPath();ctx.ellipse(O[0],zE-120,70,14,0,0,TAU);paint(C['steel-fill'],C.ink);label('TO THE MACHINE',O[0]+80,zE-120);
    pivot(O[0],O[1],5);label('STEAM',O[0]-R-30,O[1]+4,'right');label('EXHAUST',O[0]+R+30,O[1]+4);
    /* plan of the crank and partition */
    const Q=[640,300],rq=70;circ(Q[0],Q[1],rq+14);paint(C.part2,C.ink);circ(Q[0],Q[1],rq);paint(C.sheet,C.ink);bar(Q[0],Q[1]+12,Q[0],Q[1]+rq+14,8,C.part);
    const cp=[Q[0]+rq*Math.sin(t)/Math.sin(t)*0.75*Math.cos(g.phi),Q[1]+rq*0.75*Math.sin(g.phi)];bar(Q[0],Q[1],cp[0],cp[1],12,C.part2);circ(cp[0],cp[1],7);paint(C.hi,C.ink);pivot(Q[0],Q[1],5);
    label('PLAN',Q[0],Q[1]-rq-26,'center');label('fixed partition',Q[0]+12,Q[1]+rq+30);
    label('THE DISK NODS ROUND WITHOUT SPINNING · its spindle turns the crank once per nod',400,500,'center');},
  reads(){return[['Disk','nods, does not spin'],['Crank turns',`${(this.g.phi/TAU).toFixed(2)}`]];}});

/* 348 · the slide's pin runs in a four-lobed groove (two crossed slots joined round the edge) cut in the turning disk. The groove is the
   curve r = a·cos 2θ, so the pin makes two complete strokes for each turn of the disk. */
reg({num:348,outLabel:'Slide position, mm',concept:true,O:[300,280],a:80,
  groove(){const o=[];for(let i=0;i<=360;i++){const th=i/360*TAU,r=this.a*Math.cos(2*th);o.push([r*Math.cos(th),r*Math.sin(th)]);}return o;},
  update(phi){this.g={phi,x:this.a*Math.cos(2*phi)};},output(){return this.g.x;},
  draw(){const g=this.g,O=this.O,c=Math.cos(g.phi),s=Math.sin(g.phi);circ(O[0],O[1],130);paint(C['brass-fill'],C.ink);
    const W=this.groove().map(([x,y])=>[O[0]+x*c-y*s,O[1]+x*s+y*c]);ctx.save();ctx.lineJoin='round';ctx.lineCap='round';ctx.beginPath();poly(W,false);ctx.strokeStyle=C.ink;ctx.lineWidth=21;ctx.stroke();ctx.strokeStyle=C.sheet;ctx.lineWidth=18;ctx.stroke();ctx.restore();
    pivot(O[0],O[1],6);const px=O[0]+g.x;ctx.beginPath();ctx.rect(470,O[1]-26,290,10);ctx.rect(470,O[1]+16,290,10);paint(C.part2,C.ink);
    bar(px,O[1],760,O[1],14,C['steel-fill']);ctx.beginPath();ctx.rect(px+170,O[1]-16,60,32);paint(C['steel-fill'],C.ink);circ(px,O[1],8);paint(C.hi,C.ink);
    label('GROOVE r = a·cos 2θ: two crossed slots joined at the rim',400,470,'center');label('TWO STROKES EACH TURN',400,492,'center');},
  reads(){return[['Strokes per turn','2'],['Slide',`${this.g.x.toFixed(0)} mm`]];}});

/* 353 · belly-helve (tilt) hammer as a lever of the first order: the wipers on the cam wheel press the tail down behind the pivot,
   raising the head; when a wiper slips off the end of the tail, the head falls on the work. */
reg({num:353,outLabel:'Hammer lift, mm',F:[440,250],Lh:270,Lt:150,W:[555,198],rw:58,
  tipA(phi){const F=this.F,W=this.W;let a=0;for(let k=0;k<3;k++){const t=-phi*1.5+k*TAU/3,T=[W[0]+this.rw*Math.cos(t)-F[0],W[1]+this.rw*Math.sin(t)-F[1]];if(T[0]<20||T[0]>this.Lt)continue;
      /* angle at which the helve's top face (10 above the centre line) passes through the tip */
      const r=Math.hypot(T[0],T[1]),b=Math.atan2(T[1],T[0]),need=b+Math.asin(10/r);if(need>a)a=need;}return Math.min(a,0.3);},
  update(phi){const a=this.tipA(phi);this.g={phi,a,lift:this.Lh*Math.sin(a)};},output(){return this.g.lift;},
  draw(){const g=this.g,F=this.F,W=this.W;ctx.beginPath();ctx.rect(F[0]-330,F[1]+40,90,40);paint(C.part2,C.ink);ctx.beginPath();ctx.rect(F[0]-320,F[1]+30,70,10);paint(C['steel-fill'],C.ink);label('ANVIL',F[0]-285,F[1]+100,'center');
    ctx.save();ctx.translate(F[0],F[1]);ctx.rotate(g.a);ctx.beginPath();ctx.rect(-this.Lh,-10,this.Lh+this.Lt,20);paint(C['brass-fill'],C.ink);ctx.beginPath();ctx.rect(-this.Lh-30,-24,56,54);paint(C['steel-fill'],C.ink);ctx.restore();
    ctx.beginPath();ctx.moveTo(F[0]-16,F[1]+70);ctx.lineTo(F[0],F[1]);ctx.lineTo(F[0]+16,F[1]+70);ctx.closePath();paint(C.part2,C.ink);pivot(F[0],F[1],6);
    circ(W[0],W[1],30);paint(C.part,C.ink);for(let k=0;k<3;k++){const t=-g.phi*1.5+k*TAU/3;bar(W[0],W[1],W[0]+this.rw*Math.cos(t),W[1]+this.rw*Math.sin(t),12,C.part2);}pivot(W[0],W[1],5);
    label('CAM WHEEL',W[0]+40,W[1]-50);label('WIPERS PRESS THE TAIL DOWN BEHIND THE PIVOT · the head rises, then falls',400,490,'center');},
  reads(){return[['Head lift',`${this.g.lift.toFixed(0)} mm`],['Blows per turn','3']];}});

/* 358 · a fusee varies a carriage's traverse: the carriage is drawn along by a cord winding onto a turning fusee. The cord climbs the
   spiral groove from the small end to the large, so although the fusee turns steadily the carriage moves faster and faster. */
reg({num:358,outLabel:'Carriage speed, mm/turn',concept:true,x0:110,x1:270,y:200,r0:12,r1:38,turns:2.5,X0:700,
  sOf(th){const Th=this.turns*TAU;return this.r0*th+(this.r1-this.r0)*th*th/(2*Th);},
  update(phi){const Th=this.turns*TAU,u=mod(phi,2*Th),th=u<Th?u:2*Th-u;const r=this.r0+(this.r1-this.r0)*th/Th;this.g={phi,th,r,X:this.X0-this.sOf(th),v:r*TAU};},output(){return this.g.v;},
  draw(){const g=this.g,{x0,x1,y,r0,r1}=this,Th=this.turns*TAU,xs=th=>x0+(x1-x0)*th/Th,rs=th=>r0+(r1-r0)*th/Th;
    ctx.beginPath();ctx.rect(x0-34,y-60,12,150);ctx.rect(x1+18,y-60,12,150);paint(C.part2,C.ink);bar(x0-50,y,x1+30,y,8,C.part);
    poly([[x0,y-r0],[x1,y-r1],[x1,y+r1],[x0,y+r0]]);ctx.closePath();paint(C['brass-fill'],C.ink);
    ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=0.8;for(let i=0;i<=400;i++){}ctx.beginPath();let pen=false;for(let i=0;i<=600;i++){const th=i/600*Th,a=th-g.th,vis=Math.sin(a)>0;const p=[xs(th),y-rs(th)*Math.cos(a)];if(vis){pen?ctx.lineTo(...p):ctx.moveTo(...p);pen=true;}else pen=false;}ctx.stroke();
    ctx.strokeStyle=C.steel;ctx.lineWidth=2.4;ctx.beginPath();pen=false;for(let i=0;i<=600;i++){const th=i/600*Th;if(th>g.th)break;const a=th-g.th,vis=Math.sin(a)>0;const p=[xs(th),y-rs(th)*Math.cos(a)];if(vis){pen?ctx.lineTo(...p):ctx.moveTo(...p);pen=true;}else pen=false;}ctx.stroke();ctx.restore();
    const C0=[xs(g.th),y-rs(g.th)];rope([C0,[g.X-30,y-rs(g.th)*0+(-30)]]);
    ctx.beginPath();ctx.rect(300,y+44,460,8);paint(C.part2,C.ink);ctx.beginPath();ctx.rect(g.X-30,y-44,80,88);paint(C['steel-fill'],C.ink);circ(g.X-12,y+48,7);circ(g.X+32,y+48,7);paint(C.part,C.ink);
    springZ(g.X+50,y,760,y,14,7);ctx.beginPath();ctx.rect(760,y-40,12,80);paint(C.part2,C.ink);
    ctx.beginPath();ctx.moveTo(x0-50,y);ctx.lineTo(x0-50,y+40);paint(null,C.ink,4);circ(x0-50,y+40,6);paint(C.part,C.ink);label('FUSEE TURNS STEADILY',x1-60,y-70,'center');label('CARRIAGE',g.X+10,y-56,'center');
    label('THE CORD CLIMBS FROM THE SMALL END TO THE LARGE · the carriage speeds up',400,470,'center');label(`cord on radius ${g.r.toFixed(0)} mm`,400,492,'center');},
  reads(){const g=this.g;return[['Cord radius',`${g.r.toFixed(0)} mm`],['Carriage speed',`${g.v.toFixed(0)} mm/turn`],['Carriage',`${(this.X0-g.X).toFixed(0)} mm`]];}});

/* 360 · a rocking beam turns a flywheel shaft. A cord from the beam is wound on a drum loose on the shaft; the drum carries a pawl
   that engages a ratchet fast on the shaft. As the beam end rises it pulls the drum round and the pawl drives the shaft; a weight on
   a second cord turns the drum back on the return, the pawl clicking over the teeth while the flywheel keeps the shaft going. */
reg({num:360,outLabel:'Shaft, turns',concept:true,F:[400,90],Lb:200,S:[560,290],rd:40,N:20,r0:55,R:70,mu:0.16,
  reset(){this.st=null;},
  dOf(phi){return this.Lb*Math.sin(0.35*Math.sin(phi))/this.rd;},
  update(phi){const p=TAU/this.N;if(!this.st||phi<this.st.phi-1e-9)this.st={phi:0,wf:0,v:0,off:0};const st=this.st;const dt=0.02;
    while(st.phi<phi-1e-9){const h=Math.min(dt,phi-st.phi),d0=-this.dOf(st.phi),d1=-this.dOf(st.phi+h);st.phi+=h;st.v=Math.max(0,st.v-this.mu*h);st.wf+=st.v*h;
      if(d1-st.wf>st.off){const nw=d1-st.off;st.v=Math.max(st.v,(nw-st.wf)/h*0.999);st.wf=nw;}while(d1-st.wf<st.off-p)st.off-=p;}
    const d=this.dOf(phi);this.g={phi,a:0.35*Math.sin(phi),d,w:-st.wf,drive:-this.dOf(phi+0.02)+this.dOf(phi)>0&&Math.abs((-d-st.wf)-st.off)<1e-3};},
  output(){return -this.g.w/TAU;},
  draw(){const g=this.g,F=this.F,S=this.S,rd=this.rd,{N,r0,R}=this;
    /* flywheel behind */
    circ(S[0],S[1],150);circ(S[0],S[1],132,false);paint(C.part2,C.ink);for(let k=0;k<6;k++){const t=g.w+k*PI/3;bar(S[0],S[1],S[0]+132*Math.cos(t),S[1]+132*Math.sin(t),10,C.part2);}
    polyAt(RAT.pts(N,r0,R,-1),S[0],S[1],g.w);paint(C['steel-fill'],C.ink);
    /* drum with its pawl arm */
    const at=(a,r)=>[S[0]+r*Math.cos(a),S[1]+r*Math.sin(a)];bar(S[0],S[1],...at(g.d,96),18,C['brass-fill']);circ(S[0],S[1],rd);paint(C['brass-fill'],C.ink);
    {const D=[92,0],b=RAT.pawl(N,r0,R,-1,g.w-g.d,D,48,-3.1,-1.8),Pv=at(g.d,92),bw=b+g.d,T=[Pv[0]+48*Math.cos(bw),Pv[1]+48*Math.sin(bw)];bar(...Pv,...T,8,g.drive?C.hi:C.part);pivot(...Pv,3.5);}
    pivot(S[0],S[1],6);
    /* beam, cords and weight */
    const E=[F[0]+this.Lb*Math.cos(g.a),F[1]+this.Lb*Math.sin(g.a)],H=[F[0]-this.Lb*Math.cos(g.a),F[1]-this.Lb*Math.sin(g.a)];
    rope([[S[0]+rd,S[1]],[S[0]+rd,E[1]]]);const yW=400+rd*g.d;rope([[S[0]+rd+1,S[1]],[S[0]+rd+1,yW]]);weight(S[0]+rd+1,yW,40,46,'');
    ctx.beginPath();ctx.rect(F[0]-14,F[1],28,380);paint(C.part2,C.ink);ctx.save();ctx.translate(F[0],F[1]);ctx.rotate(g.a);ctx.beginPath();ctx.rect(-this.Lb-20,-10,2*this.Lb+20+4,20);paint(C['brass-fill'],C.ink);ctx.restore();pivot(F[0],F[1],6);
    bar(H[0],H[1],H[0],H[1]+60,10,C.part);label('BEAM',F[0]-120,F[1]-24,'center');label('RETURN WEIGHT',S[0]+rd+30,yW+30);label('RATCHET ON THE SHAFT',S[0]-150,S[1]+170);label('DRUM AND PAWL (loose)',S[0]+60,S[1]+170);
    label(g.drive?'BEAM END RISING · pawl drives the shaft':'RETURN · pawl clicks over the teeth, the flywheel carries on',400,30,'center');},
  reads(){const g=this.g;return[['Shaft turns',`${(-g.w/TAU).toFixed(2)}`],['Pawl',g.drive?'driving':'slipping']];}});

/* 340 · beam on a rocking pillar: the pillar rocks on its foot G and carries the middle of the beam; one end of the beam is held by a
   radius bar so that it moves nearly along the level line through G, and then the other end (the piston rod) moves almost straight up
   and down over G (Scott Russell's arrangement, with the radius bar standing in for a slide). */
reg({num:340,outLabel:"Piston-rod sideways error, mm",G:[440,470],a:140,Rf:[570,120],
  reset(){this.trail=[];},
  geo(phi){const G=this.G,a=this.a,th=(60+12*Math.sin(phi))*PI/180,T=[G[0]+a*Math.cos(th),G[1]-a*Math.sin(th)],Lr=Math.hypot(G[0]+2*a*Math.cos(PI/3)-this.Rf[0],G[1]-this.Rf[1]);
    const Cc=cc(T,a,this.Rf,Lr,1),B=[2*T[0]-Cc[0],2*T[1]-Cc[1]];return{th,T,Cc,B};},
  update(phi){const q=this.geo(phi);this.g={phi,...q};this.trail=this.trail||[];this.trail.push(q.B);if(this.trail.length>300)this.trail.shift();},output(){return this.g.B[0]-this.G[0];},
  draw(){const g=this.g,G=this.G,Rf=this.Rf;ctx.beginPath();ctx.rect(G[0]-70,40,140,110);ctx.rect(G[0]-58,50,116,90);paint(C.part2,C.ink);ctx.beginPath();ctx.rect(G[0]-56,g.B[1]-150-28,112,22);paint(C['steel-fill'],C.ink);
    bar(G[0],g.B[1]-160,g.B[0],g.B[1],10,C['steel-fill']);label('CYLINDER',G[0],30,'center');
    ctx.save();ctx.strokeStyle=C.steel;ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(G[0],160);ctx.lineTo(G[0],G[1]);ctx.stroke();ctx.restore();
    if(this.trail.length>1){ctx.save();ctx.strokeStyle=C.hi;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(...this.trail[0]);for(const p of this.trail)ctx.lineTo(...p);ctx.stroke();ctx.restore();}
    bar(G[0],G[1],g.T[0],g.T[1],18,C.part2);bar(Rf[0],Rf[1],g.Cc[0],g.Cc[1],10,C.part);bar(g.B[0],g.B[1],g.Cc[0],g.Cc[1],16,C['brass-fill']);
    for(const p of [g.B,g.T,g.Cc])pivot(p[0],p[1],4.5);pivot(G[0],G[1],6);ground(G[0],G[1]+10,40);pivot(Rf[0],Rf[1],5);ground(Rf[0],Rf[1]-10,30,true);
    label('ROCKING PILLAR',G[0]-20,G[1]-40,'right');label('RADIUS BAR',Rf[0]+14,Rf[1]+60);label('BEAM',(g.B[0]+g.Cc[0])/2+20,(g.B[1]+g.Cc[1])/2-14);
    label('THE PISTON END OF THE BEAM MOVES ALMOST STRAIGHT UP AND DOWN',400,505,'center');},
  reads(){const g=this.g;return[['Sideways error',`${(g.B[0]-this.G[0]).toFixed(1)} mm`],['Pillar',`${(g.th*180/PI).toFixed(0)}°`]];}});

/* 342 · the chains hang from arch heads centred on the beam pivot, so each chain always leaves its arch at the same point and pulls
   straight up and down */
{const m=SIMS_NEW[342];m.draw=function(){const g=this.g,F=[400,140],R=170,xL=F[0]-R,xR=F[0]+R,sa=Math.sin(g.a);
  ctx.beginPath();ctx.rect(F[0]-14,F[1],28,340);paint(C.part2,C.ink);
  ctx.save();ctx.translate(F[0],F[1]);ctx.rotate(g.a);ctx.beginPath();ctx.rect(-R+6,-12,2*R-12,24);paint(C['brass-fill'],C.ink);
  for(const [a0,a1] of [[PI-0.32,PI+0.36],[-0.36,0.32]]){ctx.beginPath();ctx.arc(0,0,R,a0,a1);ctx.arc(0,0,R-16,a1,a0,true);ctx.closePath();paint(C['brass-fill'],C.ink);}ctx.restore();pivot(F[0],F[1],7);
  /* chains: from the top of each arch, round it to the level of the pivot, then straight down */
  const chain=(a0,a1,end)=>{const pts=[];for(let i=0;i<=12;i++){const t=a0+(a1-a0)*i/12;pts.push([F[0]+R*Math.cos(t),F[1]+R*Math.sin(t)]);}pts.push(end);ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=3;ctx.setLineDash([5,3]);ctx.beginPath();ctx.moveTo(...pts[0]);for(const p of pts)ctx.lineTo(...p);ctx.stroke();ctx.restore();};
  const py=300-R*sa,pr=330+R*sa;chain(PI+0.36+g.a,PI,[xL,py]);chain(-0.36+g.a,0,[xR,pr]);
  ctx.beginPath();ctx.rect(xL-60,260,120,220);ctx.rect(xL-50,268,100,204);paint(C.part2,C.ink);steamBox(xL-50,py+20,100,472-py-20,!g.down);ctx.beginPath();ctx.rect(xL-50,py,100,20);paint(C['steel-fill'],C.ink);
  bar(xR,pr,xR,480,8,C.part);label('CYLINDER',xL,500,'center');label('PUMP ROD',xR+14,470);label(g.down?'VACUUM BELOW · air pushes the piston down':'PUMP ROD WEIGHT LIFTS THE PISTON',400,40,'center');};}

/* ================= audit pass 361–400 ================= */
/* 361 · pin clutch: the belt pulley runs loose on the shaft and carries a pin on its face; a collar fixed on the shaft carries another.
   The forked lever slides the pulley along until its pin reaches into the path of the collar's pin: as soon as the pulley pin comes
   round to it, the shaft is picked up and turns with the pulley. Slide it back and the shaft stops. */
reg({num:361,outLabel:'Shaft turns',d:0.35,
  reset(){this.st=null;},
  onAt(phi){return mod(phi,TAU*3)/(TAU*3)<0.55;},
  update(phi){if(!this.st||phi<this.st.phi-1e-9)this.st={phi:0,a:-1.6,eng:false};const st=this.st,h=0.02;
    while(st.phi<phi-1e-9){const s=Math.min(h,phi-st.phi);st.phi+=s;const on=this.onAt(st.phi);
      if(on){if(st.eng)st.a=st.phi-this.d;else{const gap=mod(st.phi-this.d-st.a,TAU);if(gap<0.06){st.eng=true;st.a=st.phi-this.d;}}}else st.eng=false;}
    const on=this.onAt(phi),sl=on?1:0;this.g={phi,a:st.a,on,eng:st.eng,sl};},
  output(){return (this.g.a+1.6)/TAU;},
  draw(){const g=this.g,y=280,X0=150,X1=700,xs=400+30*g.sl,xc=500,rp=44;
    stripeShaft(X0,X1,y,10,g.a,C.part2);for(const x of [180,660]){ctx.beginPath();ctx.rect(x-12,y-14,24,190);paint(C.part2,C.ink);}
    /* loose pulley with its hub groove and face pin */
    drumH(xs-60,y,100,80,g.phi,C['brass-fill']);ctx.beginPath();ctx.rect(xs-150,y-26,40,52);paint(C['brass-fill'],C.ink);ctx.beginPath();ctx.rect(xs-138,y-26,14,52);paint(C.part,C.ink);
    const pinP=(ang,x0,dir,len)=>{const yy=y-rp*Math.cos(ang),front=Math.sin(ang)>-0.2;ctx.save();ctx.globalAlpha=front?1:0.35;ctx.beginPath();ctx.rect(dir>0?x0:x0-len,yy-6,len,12);paint(C.hi,C.ink);ctx.restore();};
    pinP(g.phi,xs-10,1,30);
    /* collar fixed on the shaft, pin toward the pulley */
    drumH(xc+20,y,40,56,g.a,C['steel-fill']);pinP(g.a,xc,-1,30);
    /* belt */
    ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(xs-100,y-80);ctx.lineTo(xs-100,40);ctx.moveTo(xs-20,y-80);ctx.lineTo(xs-20,40);ctx.stroke();ctx.restore();label('BELT',xs-60,34,'center');
    /* forked lever */
    const L=[xs-131,y-26],Pv=[300,120];bar(Pv[0],Pv[1],L[0],L[1]-30,10,C.part);bar(L[0],L[1]-30,L[0],L[1]+6,8,C.part);bar(Pv[0],Pv[1],Pv[0]-90,Pv[1]-70,10,C.part);pivot(Pv[0],Pv[1],5);ground(Pv[0],Pv[1]-10,30,true);label('LEVER',Pv[0]-100,Pv[1]-80,'center');
    /* end view of the two pins */
    const E=[650,110];circ(E[0],E[1],56);paint(C.sheet,C.ink,.8);for(const [ang,f] of [[g.phi,C.hi],[g.a,C['steel-fill']]]){circ(E[0]+rp*Math.sin(ang),E[1]-rp*Math.cos(ang),8);paint(f,C.ink);}pivot(E[0],E[1],4);label('END VIEW OF THE PINS',E[0],E[1]+74,'center');
    label(g.on?(g.eng?'ENGAGED · pulley pin drives the collar pin':'SLID IN · waiting for the pins to meet'):'SLID OUT · pins clear, shaft stands',400,470,'center');label('PULLEY (loose)',xs-60,y+104,'center');label('COLLAR (fast)',xc+20,y+80,'center');},
  reads(){const g=this.g;return[['Pulley',g.on?'slid in':'slid out'],['Shaft',g.eng?'driven':'standing'],['Shaft turns',`${((g.a+1.6)/TAU).toFixed(2)}`]];}});

/* 362 · a drum on a sliding shaft has an endless groove cut slantwise round it; a fixed pin stands in the groove. As the shaft turns
   (driven through a long pulley on a feather key) the slanted groove screws the drum and shaft one way for half a turn and back the
   other way for the next half. */
reg({num:362,outLabel:'Shaft position, mm',A:60,Rd:70,Xp:440,
  update(phi){this.g={phi,x:-this.A*Math.cos(phi)};},output(){return this.g.x;},
  draw(){const g=this.g,y=290,Rd=this.Rd,A=this.A,X=this.Xp+g.x,w=110;
    stripeShaft(60+g.x,740+g.x,y,10,g.phi,C.part2);
    drumH(150,y,90,50,g.phi,C['brass-fill']);label('LONG PULLEY (on a feather key)',150,y+80,'center');for(const x of [90,210,620,740]){ctx.beginPath();ctx.rect(x-8,y-14,16,170);paint(C.part2,C.ink);}
    drumH(X,y,2*A+w,Rd,g.phi,C['steel-fill']);
    /* the slanted groove: axial position A·cos(θ) at drum angle θ; front half drawn solid */
    for(const s of [-1,1]){ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=1.4;ctx.beginPath();let pen=false;for(let i=0;i<=120;i++){const tw=i/120*PI,th=tw-g.phi,xx=X+A*Math.cos(th)+s*9,yy=y-Rd*Math.cos(tw);pen?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy);pen=true;}ctx.stroke();ctx.restore();}
    ctx.beginPath();ctx.rect(this.Xp-14,y-Rd-70,28,60);paint(C.part2,C.ink);ctx.beginPath();ctx.rect(this.Xp-7,y-Rd-14,14,20);paint(C.hi,C.ink);ground(this.Xp,y-Rd-70,60,true);label('FIXED PIN IN THE GROOVE',this.Xp+24,y-Rd-46);
    label('THE SLANTED GROOVE MOVES THE DRUM AND SHAFT BACK AND FORTH ONCE A TURN',400,490,'center');},
  reads(){return[['Shaft',`${this.g.x.toFixed(0)} mm`],['Stroke',`${2*this.A} mm per turn`]];}});

/* 364 and 398 · exact one-pin drives with locking rims (Geneva type) */
lockTooth(364,{N:12});SIMS_NEW[364].concept=true;
lockTooth(398,{N:4});SIMS_NEW[398].concept=true;

/* 372 · White's dynamometer: the driving shaft's bevel wheel and the driven shaft's bevel wheel face each other; bevel pinions between
   them run on arms of a ring (the carrier). The pinions pass the drive across and the two shafts turn opposite ways; the carrier is
   pressed round with twice the torque, and the weight hung on its arm to hold it level measures the power. */
reg({num:372,outLabel:'Balance load, kg',O:[400,250],params:[{id:'p',label:'Power transmitted',min:0,max:100,step:1,value:50,fmt:v=>v+' %'}],
  update(phi){this.g={phi,t:this.P.p/100,tilt:0.015*Math.sin(phi*3)};},output(){return this.g.t*20;},
  draw(){const g=this.g,O=this.O,Rb=70,Rp=40;
    const cone=(x0,dir,R,ang,fill)=>{/* bevel wheel seen from the side, axis horizontal, apex toward the centre */const x1=x0+dir*36;poly([[x0,O[1]-R],[x1,O[1]-R+36],[x1,O[1]+R-36],[x0,O[1]+R]]);ctx.closePath();paint(fill,C.ink);
      ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=1;for(let k=0;k<16;k++){const a=ang+k*PI/8;if(Math.cos(a)<0.1)continue;const s=Math.sin(a);ctx.globalAlpha=.3+.6*Math.cos(a);ctx.beginPath();ctx.moveTo(x0,O[1]+R*s);ctx.lineTo(x1,O[1]+(R-36)*s);ctx.stroke();}ctx.restore();};
    const pin=(dir,ang)=>{/* pinion axis vertical */const y0=O[1]+dir*(Rb+4),y1=O[1]+dir*(Rb-32);poly([[O[0]-Rp,y0],[O[0]+Rp,y0],[O[0]+Rp-30,y1],[O[0]-Rp+30,y1]]);ctx.closePath();paint(C.part,C.ink);
      ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=1;for(let k=0;k<12;k++){const a=ang+k*PI/6;if(Math.cos(a)<0.1)continue;const s=Math.sin(a);ctx.globalAlpha=.3+.6*Math.cos(a);ctx.beginPath();ctx.moveTo(O[0]+Rp*s,y0);ctx.lineTo(O[0]+(Rp-30)*s,y1);ctx.stroke();}ctx.restore();};
    stripeShaft(70,O[0]-70,O[1],12,g.phi,C.part2);stripeShaft(O[0]+70,730,O[1],12,-g.phi,C.part2);
    cone(O[0]-74,1,Rb,g.phi,C['brass-fill']);cone(O[0]+74,-1,Rb,-g.phi,C['steel-fill']);
    /* carrier ring with its arm */
    ctx.save();ctx.translate(O[0],O[1]);ctx.rotate(g.tilt);ctx.beginPath();ctx.rect(-12,-Rb-40,24,2*Rb+80);paint(C.part2,C.ink);ctx.beginPath();ctx.rect(0,-8,250,16);paint(C.part2,C.ink);ctx.restore();
    pin(-1,g.phi*Rb/Rp);pin(1,-g.phi*Rb/Rp);
    const W=[O[0]+240,O[1]+250*Math.sin(g.tilt)];rope([[W[0],W[1]],[W[0],W[1]+60]]);weight(W[0],W[1]+60,26+g.t*40,26+g.t*40,'');
    label('DRIVING SHAFT',120,O[1]-30);label('DRIVEN SHAFT',640,O[1]-30);label('CARRIER',O[0],O[1]-Rb-52,'center');
    label('THE WEIGHT THAT HOLDS THE CARRIER LEVEL MEASURES THE TURNING FORCE',400,480,'center');},
  reads(){return[['Weight needed',`${(this.g.t*20).toFixed(1)} kg`],['Shafts','turn opposite ways, same speed']];}});

/* 384 · volute drawer: a small wheel runs as a nut on a threaded arm pivoted at the centre. Swing the arm and the wheel rolls on the
   paper; each turn of the wheel screws it one thread further out, and it turns faster the further out it is, so the pencil beside it
   draws a widening (logarithmic) volute. */
reg({num:384,outLabel:'Radius, mm',O:[400,265],r0:30,k:0.085,
  reset(){this.trail=[];},
  geo(phi){const t=mod(phi,6*PI);return{t,r:this.r0*Math.exp(this.k*t)};},
  update(phi){const q=this.geo(phi);if(!this.trail||q.t<(this.g?this.g.t:0))this.trail=[];this.g={phi,...q};this.trail.push([this.O[0]+q.r*Math.cos(q.t),this.O[1]+q.r*Math.sin(q.t)]);},
  output(){return this.g.r;},
  draw(){const g=this.g,O=this.O,c=Math.cos(g.t),s=Math.sin(g.t);
    if(this.trail.length>1){ctx.save();ctx.strokeStyle=C.steel;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(...this.trail[0]);for(const p of this.trail)ctx.lineTo(...p);ctx.stroke();ctx.restore();}
    const E=[O[0]+235*c,O[1]+235*s];ctx.save();ctx.translate(O[0],O[1]);ctx.rotate(g.t);ctx.beginPath();ctx.rect(0,-6,235,12);paint(C['steel-fill'],C.ink);ctx.strokeStyle=C.ink;ctx.lineWidth=0.8;for(let x=8;x<230;x+=6){ctx.beginPath();ctx.moveTo(x,-6);ctx.lineTo(x+3,6);ctx.stroke();}
    const wr=g.r;ctx.beginPath();ctx.rect(wr-8,-26,16,52);paint(C['brass-fill'],C.ink);const sp=g.t*g.r/24;for(let k=0;k<6;k++){const a=sp+k*PI/3;if(Math.cos(a)<0)continue;ctx.beginPath();ctx.moveTo(wr-8,26*Math.sin(a));ctx.lineTo(wr+8,26*Math.sin(a));ctx.stroke();}ctx.restore();
    pivot(O[0],O[1],6);circ(O[0]+g.r*c,O[1]+g.r*s,4);paint(C.ink);label('THREADED ARM',E[0],E[1]-14,'center');
    label('THE WHEEL ROLLS ON THE PAPER AND SCREWS ITSELF OUTWARD · a widening volute',400,505,'center');},
  reads(){const g=this.g;return[['Radius',`${g.r.toFixed(0)} mm`],['Arm turns',`${(g.t/TAU).toFixed(2)}`]];}});

/* 390 · a rocking lever turns a flywheel one way through two bands, two drums and two ratchets. Each drum runs loose on the shaft and
   carries a pawl into its own ratchet, which is fast on the shaft. The bands are wound opposite ways, so one drum drives on the down
   stroke and the other on the up stroke; small weights turn each drum back while its pawl slips. Side view, with end views below. */
reg({num:390,outLabel:'Shaft, turns',F:[380,110],La:80,rd:40,N:20,r0:55,R:70,mu:0.12,
  reset(){this.st=null;},
  dA(phi){return this.La*Math.sin(0.35*Math.sin(phi))/this.rd;},
  update(phi){const p=TAU/this.N;if(!this.st||phi<this.st.phi-1e-9)this.st={phi:0,wf:0,v:0,off:[0,0]};const st=this.st,dt=0.02;
    while(st.phi<phi-1e-9){const h=Math.min(dt,phi-st.phi);st.phi+=h;st.v=Math.max(0,st.v-this.mu*h);st.wf+=st.v*h;const ds=[this.dA(st.phi),-this.dA(st.phi)];
      for(let i=0;i<2;i++){if(ds[i]-st.wf>st.off[i]){const nw=ds[i]-st.off[i];st.v=Math.max(st.v,(nw-st.wf)/h*0.999);st.wf=nw;}}
      for(let i=0;i<2;i++)while(ds[i]-st.wf<st.off[i]-p)st.off[i]-=p;}
    const a=0.35*Math.sin(phi),ds=[this.dA(phi),-this.dA(phi)],dr=Math.cos(phi)>0?0:1;this.g={phi,a,w:st.wf,ds,act:dr};},
  output(){return this.g.w/TAU;},
  draw(){const g=this.g,F=this.F,La=this.La,y=280,xs=[300,460],{N,r0,R,rd}=this,RAT=SIMS_NEW[321].RAT;
    stripeShaft(120,720,y,8,g.w,C.part2);for(const x of [140,560,700]){ctx.beginPath();ctx.rect(x-8,y-12,16,150);paint(C.part2,C.ink);}
    drumH(640,y,26,130,g.w,C['steel-fill']);label('FLYWHEEL',640,y+150,'center');
    for(let i=0;i<2;i++){const x=xs[i];drumH(x,y,40,rd,g.ds[i],C['brass-fill']);drumH(x+38,y,18,R,g.w,C['steel-fill']);}
    ctx.save();ctx.translate(F[0],F[1]);ctx.rotate(g.a);ctx.beginPath();ctx.rect(-La-16,-9,2*La+32,18);paint(C['brass-fill'],C.ink);ctx.beginPath();ctx.rect(-6,-9,12,-70);paint(C.part,C.ink);ctx.restore();pivot(F[0],F[1],6);
    for(let i=0;i<2;i++){const s=i?1:-1,E=[F[0]+s*La*Math.cos(g.a),F[1]+s*La*Math.sin(g.a)];rope([E,[xs[i]+(i?-1:1)*0,y-rd]]);
      rope([[xs[i]+12,y+rd],[xs[i]+12,y+rd+40+rd*g.ds[i]*0.5]]);weight(xs[i]+12,y+rd+40+rd*g.ds[i]*0.5,22,22,'');}
    /* end views */
    for(let i=0;i<2;i++){const C0=[i?560:200,450],k=0.5,d=g.ds[i],w=g.w,at=(a,r)=>[C0[0]+k*r*Math.cos(a),C0[1]+k*r*Math.sin(a)];
      poly(RAT.pts(N,r0,R,-1).map(([x,y])=>{const c=Math.cos(w),s=Math.sin(w);return[C0[0]+k*(x*c-y*s),C0[1]+k*(x*s+y*c)];}));ctx.closePath();paint(C['steel-fill'],C.ink);
      bar(C0[0],C0[1],...at(d,96),9,C['brass-fill']);circ(C0[0],C0[1],k*rd);paint(C['brass-fill'],C.ink);
      const b=RAT.pawl(N,r0,R,-1,w-d,[92,0],48,-3.1,-1.8),Pv=at(d,92),T=[Pv[0]+k*48*Math.cos(b+d),Pv[1]+k*48*Math.sin(b+d)];bar(...Pv,...T,5,i===g.act?C.hi:C.part);pivot(...Pv,2.5);
      label(i?'RIGHT DRUM':'LEFT DRUM',C0[0]+60,C0[1]-20);}
    label('BANDS WOUND OPPOSITE WAYS · one drum drives each stroke',400,30,'center');},
  reads(){const g=this.g;return[['Shaft turns',`${(g.w/TAU).toFixed(2)}`],['Driving',g.act?'right drum':'left drum']];}});

/* 391 · two weighted racks take turns: the rack that is falling is swung into mesh and drives the gear by its weight, while the other is
   swung clear and drawn up. Both mesh on the same side, so both drive the gear the same way and it turns continuously. */
reg({num:391,outLabel:'Gear turns',concept:true,Pg:[440,270],Rg:50,S:8*PI*100/18,
  update(phi){const u=mod(phi,TAU)/TAU,cyc=Math.floor(phi/TAU),S=this.S;const fA=u<0.5?u/0.5:1-(u-0.5)/0.5,fB=1-fA;/* fall fractions */
    const sw=x=>smooth(Math.min(1,Math.max(0,x)));const inA=u<0.5?1-sw((u-0.46)/0.04)*0:0,inB=u<0.5?0:1;
    const fall=(cyc*2+(u<0.5?u/0.5:1+(u-0.5)/0.5))*S;this.g={phi,yA:fA*S,yB:fB*S,inA:u<0.5?1:0,w:-fall/this.Rg,u};},
  output(){return -this.g.w/TAU;},
  draw(){const g=this.g,P=this.Pg,Rg=this.Rg,m=2*Rg/18,xm=P[0]-Rg;drawGear(P[0],P[1],Rg,18,g.w,C['brass-fill'],{bore:6});pivot(P[0],P[1],5);
    const rack=(y0,inMesh,front,label_)=>{const x=inMesh?xm:xm-36,top=P[1]-170+y0,pts=[[x-1.25*m-16,top]];const p=PI*m,c0=mod(170-p/2,p)+p;for(let k=0;k<12;k++){const yc=top+c0+k*p,a=p/4,t=Math.tan(20*PI/180);pts.push([x-1.25*m,yc-a-1.25*m*t],[x+m,yc-a+m*t],[x+m,yc+a-m*t],[x-1.25*m,yc+a+1.25*m*t]);}const bot=top+c0+12*p;pts.push([x-1.25*m,bot],[x-1.25*m-16,bot]);
      ctx.save();ctx.globalAlpha=front?1:0.55;poly(pts);ctx.closePath();paint(inMesh?C['steel-fill']:C.part,C.ink);weight(x-1.25*m-8,bot,40,40,'');rope([[x-1.25*m-8,top],[x-1.25*m-8,60]]);ctx.restore();label(label_,x-60,top+20,'right');return bot;};
    rack(g.yA,g.inA===1,true,'FRONT RACK');rack(g.yB,g.inA===0,false,'REAR RACK');
    label(g.inA?'FRONT RACK FALLING IN MESH · rear rack swung clear and drawn up':'REAR RACK FALLING IN MESH · front rack swung clear and drawn up',400,40,'center');label('both racks mesh on the same side, so the gear always turns the same way',400,500,'center');},
  reads(){const g=this.g;return[['Driving',g.inA?'front rack':'rear rack'],['Gear','turns one way']];}});

/* 397 · the crank pin works in a slot that is straight above and below and opens into two arcs, each struck from the crank centre with
   the yoke at one end of its stroke. While the pin runs on an arc the yoke stands still, so the shuttle pauses at each end. */
reg({num:397,outLabel:'Shuttle position, mm',concept:true,O:[200,300],r:90,al:0.6,
  xe(){return this.r*Math.cos(this.al);},
  update(phi){const x=Math.max(-this.xe(),Math.min(this.xe(),this.r*Math.cos(phi)));this.g={phi,x,dwell:Math.abs(this.r*Math.cos(phi))>this.xe()};},output(){return this.g.x;},
  slot(){const r=this.r,al=this.al,xe=this.xe(),o=[];const top=r+24,ya=r*Math.sin(al);/* centre line of the slot, yoke-local */
    o.push([0,-top],[0,-ya]);for(let i=1;i<=20;i++){const t=-al+2*al*i/20;o.push([-xe+r*Math.cos(t),r*Math.sin(t)*-1*-1]);}o.push([0,top]);return o;},
  draw(){const g=this.g,O=this.O,r=this.r,al=this.al,xe=this.xe(),X=O[0]+g.x,pin=[O[0]+r*Math.cos(g.phi),O[1]+r*Math.sin(g.phi)];
    circ(O[0],O[1],r+24);paint(C['brass-fill'],C.ink);bar(O[0],O[1],pin[0],pin[1],14,C.part2);pivot(O[0],O[1],6);
    ctx.beginPath();ctx.rect(X-r-14,O[1]-r-40,2*r+28,2*r+80);paint(C['steel-fill'],C.ink,.9);
    /* slot: straight tails and the two arcs */
    const ya=r*Math.sin(al);ctx.save();ctx.translate(X,O[1]);ctx.lineCap='round';ctx.lineWidth=20;ctx.strokeStyle=C.ink;
    const path=()=>{ctx.beginPath();ctx.moveTo(0,-r-24);ctx.lineTo(0,-ya);ctx.arc(-xe,0,r,-al,al);ctx.lineTo(0,r+24);ctx.moveTo(0,-ya);ctx.arc(xe,0,r,PI+al,PI-al,true);};
    path();ctx.stroke();ctx.lineWidth=17;ctx.strokeStyle=C.sheet;path();ctx.stroke();ctx.restore();
    circ(pin[0],pin[1],8);paint(C.hi,C.ink);
    bar(X+r+14,O[1],X+r+150,O[1],10,C.part);ctx.beginPath();ctx.rect(O[0]+r+60,O[1]-28,330,8);ctx.rect(O[0]+r+60,O[1]+20,330,8);paint(C.part2,C.ink);
    const S=X+r+150;ctx.beginPath();ctx.moveTo(S,O[1]);ctx.quadraticCurveTo(S+40,O[1]-24,S+90,O[1]);ctx.quadraticCurveTo(S+40,O[1]+24,S,O[1]);paint(C['brass-fill'],C.ink);label('SHUTTLE',S+45,O[1]-36,'center');
    label(g.dwell?'PIN ON AN ARC · the shuttle pauses':'PIN IN THE STRAIGHT SLOT · the shuttle moves',400,470,'center');label('arcs are struck from the crank centre',400,492,'center');},
  reads(){const g=this.g;return[['Shuttle',`${g.x.toFixed(0)} mm`],['Phase',g.dwell?'pause':'moving'],['Pause',`${(2*this.al*180/PI).toFixed(0)}° of each turn at each end`]];}});

/* 366 · drill press: the driving shaft's bevel pinion turns a bevel wheel whose bore has a feather; the drill spindle slides through
   it while it turns. A lever pivoted on the frame forks a collar on the spindle; a rod from the treadle pulls its other end, so treading
   lowers the drill into the work and a spring lifts it again. */
reg({num:366,outLabel:'Drill depth, mm',X:360,F:[640,200],
  update(phi){const d=60*(1-Math.cos(phi*0.3))/2;this.g={phi,d,b:Math.atan2(d,this.F[0]-this.X)};},output(){return this.g.d;},
  draw(){const g=this.g,X=this.X,F=this.F,yb=120,Lr=F[0]-X;
    ctx.beginPath();ctx.rect(X-130,60,30,420);ctx.rect(X-130,60,260,18);paint(C.part2,C.ink);ctx.beginPath();ctx.rect(X-100,420,260,24);paint(C.part2,C.ink);label('TABLE',X+150,412);
    /* bevel wheel, axis vertical, and the pinion on the driving shaft */
    poly([[X-70,yb],[X+70,yb],[X+40,yb+30],[X-40,yb+30]]);ctx.closePath();paint(C['brass-fill'],C.ink);ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=1;for(let k=0;k<12;k++){const a=g.phi+k*PI/6;if(Math.cos(a)<0.1)continue;ctx.globalAlpha=.3+.6*Math.cos(a);ctx.beginPath();ctx.moveTo(X+70*Math.sin(a),yb);ctx.lineTo(X+40*Math.sin(a),yb+30);ctx.stroke();}ctx.restore();
    poly([[X+100,yb-34],[X+100,yb+40],[X+72,yb+26],[X+72,yb-20]]);ctx.closePath();paint(C.part,C.ink);stripeShaft(X+100,X+300,yb+3,9,-g.phi*70/37,C.part2);drumH(X+300,yb+3,30,40,-g.phi*70/37,C['steel-fill']);label('DRIVING SHAFT',X+230,yb-40,'center');
    /* spindle sliding through the wheel, collar and drill */
    const ys=yb-40+g.d;ctx.beginPath();ctx.rect(X-8,ys,16,260);paint(C['steel-fill'],C.ink);ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=1;for(let k=0;k<6;k++){const a=g.phi+k*PI/3;if(Math.cos(a)<0)continue;const xx=X+8*Math.sin(a);ctx.beginPath();ctx.moveTo(xx,ys);ctx.lineTo(xx,ys+250);ctx.stroke();}ctx.restore();
    const yc=200+g.d;ctx.beginPath();ctx.rect(X-20,yc-12,40,24);paint(C.part,C.ink);poly([[X-6,ys+260],[X+6,ys+260],[X,ys+290]]);ctx.closePath();paint(C.ink);
    ctx.beginPath();ctx.rect(X-60,404,120,16);paint(C['brass-fill'],C.ink);label('WORK',X,415,'center');
    /* lever, rod and treadle */
    const L=Math.hypot(X-F[0],yc-F[1]),u=[(X-F[0])/L,(yc-F[1])/L],Rm=[F[0]+90*u[0],F[1]+90*u[1]];bar(F[0],F[1],X,yc,12,C.part2);pivot(F[0],F[1],6);ground(F[0],F[1]-12,30,true);pivot(Rm[0],Rm[1],4);
    const T0=[760,470],Tp=[Rm[0],Rm[1]+230];bar(T0[0],T0[1],Tp[0]-30,Tp[1],14,C['brass-fill']);pivot(T0[0],T0[1],6);bar(Rm[0],Rm[1],Tp[0],Tp[1],6,C.part);label('TREADLE',T0[0]-60,T0[1]+26,'center');label('LEVER',F[0]-60,F[1]-16,'center');
    springZ(X+14,yb+40,X+14,yc-12,8,6);
    label('THE SPINDLE SLIDES THROUGH THE TURNING BEVEL WHEEL · treading feeds the drill down',400,505,'center');},
  reads(){return[['Depth',`${this.g.d.toFixed(0)} mm`],['Spindle','turns and slides at once']];}});

/* 379, 380 · cramp drills. The cramp's lower jaw holds the work; the drill spindle runs in the upper arm and is turned by a crank.
   379: the feed screw stands above the spindle, end to end with it, and is screwed down from a nut in the frame to push the drill on.
   380: the feed screw is hollow and threaded in the upper arm; the spindle runs through it and is pushed down by a collar. */
function crampDrill(num,o){return reg({num,outLabel:'Drill feed, mm',X:330,
  update(phi){const d=40*mod(phi,TAU*6)/(TAU*6);this.g={phi,d,s:d/6*TAU};},output(){return this.g.d;},
  draw(){const g=this.g,X=this.X,yA=200,d=g.d;
    ctx.beginPath();ctx.moveTo(180,110);ctx.lineTo(640,110);ctx.lineTo(640,470);ctx.lineTo(180,470);ctx.lineTo(180,420);ctx.lineTo(580,420);ctx.lineTo(580,yA+20);ctx.lineTo(180,yA+20);ctx.closePath();paint(C.part2,C.ink);
    ctx.beginPath();ctx.rect(200,360,300,60);paint(C['brass-fill'],C.ink);label('WORK',350,395,'center');
    const yS=yA-30+d;/* top of the spindle */
    ctx.beginPath();ctx.rect(X-10,yS,20,120);paint(C['steel-fill'],C.ink);ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=1;for(let k=0;k<6;k++){const a=g.phi+k*PI/3;if(Math.cos(a)<0)continue;const xx=X+10*Math.sin(a);ctx.beginPath();ctx.moveTo(xx,yS);ctx.lineTo(xx,yS+115);ctx.stroke();}ctx.restore();
    poly([[X-7,yS+120],[X+7,yS+120],[X,yS+155]]);ctx.closePath();paint(C.ink);
    const crankAt=(y)=>{const c=Math.cos(g.phi);bar(X,y,X+70*c,y,10,C['brass-fill']);bar(X+70*c,y,X+70*c,y-40,10,C['brass-fill']);circ(X,y,9);paint(C.part,C.ink);};
    if(o.through){/* hollow feed screw threaded in the arm, spindle through it; collar under the screw */
      const yF=yA-60+d;screwShaftV(X,yF,yF+80,22,g.s);drumH(X,yF-6,70,10,g.s,C.part);label('HOLLOW FEED SCREW',X+50,yF+20);ctx.beginPath();ctx.rect(X-24,yF+80,48,10);paint(C.hi,C.ink);crankAt(yF-40);
      ctx.beginPath();ctx.rect(X-10,yF-40,20,yS-yF+40);paint(C['steel-fill'],C.ink);}
    else{/* feed screw end to end above the spindle, in a nut on a bracket */
      ctx.beginPath();ctx.rect(X-60,90,120,20);paint(C.part2,C.ink);const yF=yA-110+d;screwShaftV(X,yF-60,yF+50,20,g.s);drumH(X,yF-66,80,10,g.s,C.part);label('FEED SCREW',X+60,yF-60);crankAt(yS+30);}
    label(o.label,400,500,'center');},
  reads(){return[['Feed',`${this.g.d.toFixed(1)} mm`]];}});}
function screwShaftV(x,y0,y1,w,ang){ctx.beginPath();ctx.rect(x-w/2,y0,w,y1-y0);paint(C['steel-fill'],C.ink);ctx.save();ctx.beginPath();ctx.rect(x-w/2,y0,w,y1-y0);ctx.clip();ctx.strokeStyle=C.ink;ctx.lineWidth=1;const p=8;for(let y=y0-p+mod(-ang/TAU*p,p);y<y1+p;y+=p){ctx.beginPath();ctx.moveTo(x-w/2,y);ctx.lineTo(x+w/2,y+3);ctx.stroke();}ctx.restore();}
crampDrill(379,{label:'CRAMP DRILL · the feed screw stands opposite the drill, end to end with the spindle'});
crampDrill(380,{through:true,label:'CRAMP DRILL · the spindle runs through the hollow feed screw'});

/* 381 · joiner's clamp with a wedge: the work lies between a fixed stop and a sliding jaw; driving the wedge down between the jaw and
   the fixed post pushes the jaw against the work (half the wedge's travel, for a 1-in-2 taper). */
reg({num:381,outLabel:'Jaw closure, %',
  update(phi){const c=openClose(phi),d=60*(1-c);this.g={phi,c,d,yT:215+2*d};},output(){return this.g.c*100;},
  draw(){const g=this.g,d=g.d,yT=g.yT;ctx.beginPath();ctx.rect(80,330,460,40);ctx.rect(590,330,130,40);paint(C.part2,C.ink);
    ctx.beginPath();ctx.rect(300,220,30,110);paint(C.part,C.ink);ctx.beginPath();ctx.rect(330,280,140,50);paint(C['brass-fill'],C.ink);label('WORK',400,305,'center');
    ctx.beginPath();ctx.rect(470+d,240,30,90);paint(C['steel-fill'],C.ink);ctx.beginPath();ctx.rect(560,180,30,190);paint(C.part2,C.ink);
    poly([[530,yT],[560,yT],[560,yT+140],[530-70,yT+140]]);ctx.closePath();paint(C['brass-fill'],C.ink);
    label('FIXED STOP',315,205,'center');label('SLIDING JAW',485+d,230,'center');label('WEDGE',545,yT-10,'center');label('POST',575,170,'center');
    label(g.c>0.98?'CLAMPED':g.c<0.02?'OPEN':'DRIVING THE WEDGE / KNOCKING IT BACK',400,420,'center');label("JOINER'S CLAMP · a 1-in-2 wedge drives the jaw half as far as the wedge goes",400,480,'center');},
  reads(){const g=this.g;return[['Jaw gap',`${g.d.toFixed(0)} mm`],['Wedge travel',`${(2*g.d).toFixed(0)} mm`]];}});

/* 385 · door closer, seen from above: a link of fixed length joins the door to a slide; opening the door draws the slide away from the
   pulley, lifting the weight that hangs from the cord; let go and the weight pulls the slide back and the door shut. */
reg({num:385,outLabel:'Door angle, degrees',H:[200,300],Lk:130,T0:290,
  geo(a){const H=this.H,K=[H[0]+80*Math.cos(-a),H[1]+80*Math.sin(-a)],Ty=K[1]+Math.sqrt(this.Lk**2-(this.T0-K[0])**2);return{K,T:[this.T0,Ty]};},
  update(phi){const u=mod(phi*0.5,TAU)/TAU;const f=u<0.3?smooth(u/0.3):u<0.45?1:1-smooth((u-0.45)/0.45);const a=f*1.3;this.g={phi,a,...this.geo(a)};},output(){return this.g.a*180/PI;},
  draw(){const g=this.g,H=this.H,T=g.T,Pu=[this.T0,490],T0=this.geo(0).T;
    ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=12;ctx.beginPath();ctx.moveTo(60,300);ctx.lineTo(H[0]-10,300);ctx.moveTo(H[0]+310,300);ctx.lineTo(760,300);ctx.stroke();ctx.restore();
    ctx.beginPath();ctx.rect(T[0]-30,320,8,150);ctx.rect(T[0]+22,320,8,150);paint(C.part2,C.ink);
    const D=[H[0]+300*Math.cos(-g.a),H[1]+300*Math.sin(-g.a)];bar(H[0],H[1],D[0],D[1],14,C['brass-fill']);pivot(H[0],H[1],6);
    rope([[T[0],T[1]+20],Pu]);circ(Pu[0],Pu[1],10);paint(C.part,C.ink);ctx.beginPath();ctx.rect(Pu[0]+14,Pu[1]-14,28,28);paint(C['steel-fill'],C.ink);label('WEIGHT HANGS HERE',Pu[0]+50,Pu[1]+4);
    ctx.beginPath();ctx.rect(T[0]-20,T[1]-20,40,40);paint(C['steel-fill'],C.ink);bar(g.K[0],g.K[1],T[0],T[1],8,C.part);pivot(g.K[0],g.K[1],4);pivot(T[0],T[1],4);
    label('SLIDE',T[0]-40,T[1],'right');label(`weight raised ${(T0[1]-T[1]).toFixed(0)} mm`,560,420);
    label('SEEN FROM ABOVE · opening the door draws the slide away and lifts the weight, which then pulls the door shut',400,40,'center');},
  reads(){const g=this.g;return[['Door',`${(g.a*180/PI).toFixed(0)}°`],['Weight raised',`${(this.geo(0).T[1]-g.T[1]).toFixed(0)} mm`]];}});

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

const ALL=Object.assign({119:M119,120:M120,121:M121,122:M122,123:M123,124:M124,127:M127},SIMS_NEW);
for(const k in ALL){const m=ALL[k];m.params=m.params||[];m.P={};m.params.forEach(p=>m.P[p.id]=p.value);if(!m.reset)m.reset=function(){};}
window.MB={SIMS:ALL,C,setCtx(c){ctx=c;},setDir(d){DIR=d||1;},W,H,ropeThru,tanLine,cam3,circ3,pitchCurve,toothedCurve,ncPhase,lockDiskPts,sawR,stad};
})();
