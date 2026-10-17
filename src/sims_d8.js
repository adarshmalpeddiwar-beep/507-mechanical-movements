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
