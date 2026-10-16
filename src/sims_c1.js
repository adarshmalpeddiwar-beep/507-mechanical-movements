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
