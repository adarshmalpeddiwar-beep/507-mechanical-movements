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
