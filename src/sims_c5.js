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
