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
