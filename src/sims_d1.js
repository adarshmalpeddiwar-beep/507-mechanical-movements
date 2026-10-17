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
