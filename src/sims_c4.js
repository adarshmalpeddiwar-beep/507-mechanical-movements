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
