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

