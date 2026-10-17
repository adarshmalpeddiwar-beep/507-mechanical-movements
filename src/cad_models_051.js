/* ===== printable models 51–80 ===== */
const U=PK.U,{Sh}=PK;PK._S(0.3);
const pxPoly=(pts,holes=[[0,0]])=>({o:pts,h:holes.map(h=>Sh.hole(h[0],h[1],h[2]))});
const studShape=(rs)=>Sh.disk(rs);
/* ---------- 51 ring universal joint ---------- */
{const Rk=15,zc=U.BT+22,S6=3.2;
 const fork=(()=>{const stem=K.box(2*S6,2*S6,-Rk-58,-Rk-4),bridge=K.box(2*Rk+8,2*S6,-Rk-6,-Rk+0.5);
   const arm=sx=>K.xf(K.prism([[-S6,-Rk-6],[S6,-Rk-6],[S6,3],[0,6],[-S6,3]],[K.circle(U.SHB,24,0,0)],-3,3),[0,1,0,0, 0,0,1,0, 1,0,0,0, sx*Rk,0,0,1]);
   return U.printed(K.merge(stem,bridge,arm(1),arm(-1)),K.M4.Rx(PI/2));})();
 const peg=K.xf(U.shaft(10,1.95),K.M4.T(0,0,-1.95*Math.cos(PI/8)));
 const ring=K.merge(K.prism(K.circle(Rk-4,48),[K.circle(Rk-9,48)],-2.5,2.5),...[0,1,2,3].map(k=>K.xf(peg,K.M4.mul(K.M4.Rz(k*PI/2),K.M4.T(Rk-4+3.5,0,0)))));
 PK.defS(51,{summary:'A universal joint of the second form: each fork is pinned to a ring instead of a cross. The ring’s four pegs are the pins of the joint; the output still runs ahead and falls behind twice a turn when the shafts are at an angle.',cam:{yaw:-0.4,pitch:0.75},
  params:[{id:'b',label:'Shaft angle',min:0,max:45,step:5,value:30,fmt:v=>v+'°'}],
  base:P=>{const b=(P.b??30)*PI/180,c=Math.cos(b),s=Math.sin(b);return[U.plate(-78,-24+Math.min(0,64*s)-10,Math.max(78*c,24)+10,Math.max(24,64*s+24)),U.wall(-42,0,'x',[[0,zc,4.6]]),U.wall(-66,0,'x',[[0,zc,4.6]]),U.wall(42*c,42*s,b,[[0,zc,4.6]]),U.wall(66*c,66*s,b,[[0,zc,4.6]])];},
  parts:[{id:'f1',name:'Input fork with square shaft',role:'driver',mesh:fork.mesh},{id:'f2',name:'Output fork with square shaft',role:'driven',mesh:fork.mesh},{id:'r',name:'Ring with four pegs',role:'link',mesh:ring}],
  pose(phi,g,sim,P){const b=(P.b??30)*PI/180,ax2=[Math.cos(b),Math.sin(b),0],a1=g.a1??phi,a2=g.a2??phi,e1=[0,Math.cos(a1),Math.sin(a1)];const cr=[ax2[1]*e1[2]-ax2[2]*e1[1],ax2[2]*e1[0]-ax2[0]*e1[2],ax2[0]*e1[1]-ax2[1]*e1[0]],l=Math.hypot(...cr),e2=cr.map(v=>v/l),e3=[e1[1]*e2[2]-e1[2]*e2[1],e1[2]*e2[0]-e1[0]*e2[2],e1[0]*e2[1]-e1[1]*e2[0]];
    return{f1:K.M4.mul(U.at([0,0,zc],[1,0,0],a1,[0,1,0]),fork.inv),f2:K.M4.mul(U.at([0,0,zc],[-ax2[0],-ax2[1],0],-a2,[0,0,1]),fork.inv),r:[e1[0],e1[1],e1[2],0, e2[0],e2[1],e2[2],0, e3[0],e3[1],e3[2],0, 0,0,zc,1]};},
  read:(phi,g)=>`output ${(((g.a2??0)-(g.a1??0))*180/PI).toFixed(1)}° ahead of the input`,drive:'Turn the input shaft by its square end and watch the output.'});}
/* ---------- 52 stud clutch, 53 reversing bevel clutch ---------- */
{const zc=U.BT+16;const disk=(holes,studs)=>{let m=K.prism(K.circle(12.5,48),[U.octa(U.SH+0.12),...holes.map(a=>K.circle(2.3,20,8*Math.cos(a),8*Math.sin(a)))],0,6);for(const a of studs)m=K.merge(m,K.cyl(2,6,11,20,8*Math.cos(a),8*Math.sin(a)));return m;};
 const groove=K.loftS([[0,12.5],[2,12.5],[2,8.5],[6,8.5],[6,12.5],[8,12.5]].map(([z,r])=>({o:K.circle(r,48).map(p=>[p[0],p[1],z]),h:[(()=>{const o=U.octa(U.SH+0.12),q=[];for(let i=0;i<8;i++){const a=o[i],b=o[(i+1)%8];for(let k=0;k<6;k++)q.push([a[0]+(b[0]-a[0])*k/6,a[1]+(b[1]-a[1])*k/6]);}return q;})().map(p=>[p[0],p[1],z])]})));
 const lever=K.merge(K.prism(K.hull([...K.circle(5,24),...K.circle(4,24,0,26),...K.circle(4,24,0,-22)]),[K.circle(U.SHB,24)],0,4),K.prism([[-1.6,26],[1.6,26],[1.6,32],[-1.6,32]],[],0,4),K.cyl(3,4,14,20,0,-22));
 PK.defS(52,{summary:'A stud clutch: the disk on the driving shaft carries two studs; the disk that slides on the octagonal driven shaft has two holes. Push the lever and the studs enter the holes, so both shafts turn as one.',cam:{yaw:0.9,pitch:0.5},
  base:()=>[U.plate(-72,-66,72,24),U.wall(-56,0,'x',[[0,zc]]),U.wall(-26,0,'x',[[0,zc]]),U.wall(32,0,'x',[[0,zc]]),U.wall(60,0,'x',[[0,zc]]),U.post(13,-36,zc+2+0.5+3,zc-2.5)],
  parts:[{id:'a',name:'Driving disk with studs',role:'driver',mesh:disk([],[0,PI])},{id:'b',name:'Sliding disk with holes',role:'driven',mesh:K.merge(disk([0,PI],[]),K.xf(groove,K.M4.T(0,0,6)))},{id:'sa',name:'Driving shaft',mesh:U.shaft(66)},{id:'sb',name:'Driven shaft',mesh:U.shaft(70)},
    {id:'lv',name:'Forked lever',role:'link',mesh:lever},{id:'k',name:'Hand crank',role:'driver',mesh:U.crank()},{id:'ind',name:'Pointer disc',role:'driven',mesh:U.collar(9,3)},{id:'col',name:'Collar',role:'small',qty:2,mesh:U.collar()},{id:'cap',name:'Pin cap',role:'small',mesh:U.capMesh()}],
  pose(phi,g,sim){const gap=(g.gap||0)*0.3,xb=1+gap,ab=sim?sim.a:phi,gx=xb+10,th=Math.asin(Math.max(-1,Math.min(1,(gx-13)/30)));
    return{a:U.at([-6,0,zc],[1,0,0],phi),b:K.M4.mul(U.at([xb+14,0,zc],[-1,0,0],-ab),K.M4.id()),sa:U.shaftAt([-33,0,zc],[1,0,0],phi),sb:U.shaftAt([37,0,zc],[1,0,0],ab),lv:K.M4.mul(K.M4.T(13,-36,zc-2),K.M4.Rz(-th)),k:U.at([-66,0,zc],[-1,0,0],-phi),ind:U.at([66,0,zc],[1,0,0],ab),col:[U.at([-24,0,zc],[1,0,0],phi),U.at([62,0,zc],[1,0,0],ab)],cap:K.M4.T(13,-36,zc+2.5)};},
  read:(phi,g)=>g.on?'studs in the holes · driven shaft turns':'thrown out',drive:'Turn the crank and push the lever to engage.'});}
for(const NN of [53,87]){const Z=18,m=2,Rp=18,d=PI/4,f=7,Hc=U.BT+Rp+8,zt=f*Math.cos(d),Lp=Rp/Math.tan(d);
 const side=()=>K.merge(U.bevel(Rp,Z,d,f,{bore:'round'}),K.cyl(1.8,zt,zt+4,16,0,7),K.cyl(1.8,zt,zt+4,16,0,-7));
 const coll=K.merge(K.prism(K.circle(10,40),[U.octa(U.SH+0.12),K.circle(2.2,16,0,7),K.circle(2.2,16,0,-7)],0,9),K.prism(K.circle(12,40),[K.circle(10.2,40)],3,6));
 PK.defS(NN,{summary:NN===87?'Self-reversing gear (shown with the reversing clutch it uses): the upright bevel drives two loose bevels opposite ways and the double clutch locks one or the other to the shaft. In Brown’s machine a weighted lever throws the clutch over at each end of the travel.':'Reversing gear: the upright bevel drives two bevels that run loose on the level shaft, so they turn opposite ways. A double clutch slides on the octagonal shaft between them; push it left or right and its holes catch the studs on one bevel or the other, and the shaft turns forward or backward.',cam:{yaw:0.6,pitch:0.45},
  base:()=>[U.plate(-74,-48,74,22),U.wall(-34,0,'x',[[0,Hc]]),U.wall(-60,0,'x',[[0,Hc]]),U.wall(34,0,'x',[[0,Hc]]),U.wall(60,0,'x',[[0,Hc]]),U.post(0,0,Hc-Lp+zt+0.5+3,Hc-Lp-0.5),U.post(-14,-34,Hc+2+3.5,Hc-2.5)],
  parts:[{id:'bl',name:'Left bevel, loose, with studs',role:'link',mesh:side()},{id:'br',name:'Right bevel, loose, with studs',role:'link',mesh:side()},{id:'bv',name:'Upright driving bevel with knob',role:'driver',mesh:K.merge(U.bevel(Rp,Z,d,f,{bore:'round'}),K.cyl(2.5,0,zt+0.01,8,13,0))},
    {id:'c',name:'Double clutch (holes both faces)',role:'link',mesh:coll},{id:'s',name:'Level shaft (output)',role:'driven',mesh:U.shaft(130)},{id:'lv',name:'Clutch lever',role:'link',mesh:K.merge(K.prism(K.hull([...K.circle(5,24),...K.circle(3.5,24,14,26),...K.circle(4,24,-6,-22)]),[K.circle(U.SHB,24)],0,4),K.cyl(3,4,14,20,-6,-22))},
    {id:'ind',name:'Pointer disc',role:'driven',mesh:U.collar(9,3)},{id:'col',name:'Collar',role:'small',mesh:U.collar()},{id:'cap',name:'Pin cap',role:'small',mesh:U.capMesh()}],
  pose(phi,g,sim){const a=sim?sim.a:0,x=-(g.sel||0)*2.6,bl=phi,br=-phi;return{bl:U.at([-Lp,0,Hc],[1,0,0],bl,[0,0,-1]),br:U.at([Lp,0,Hc],[-1,0,0],-br,[0,0,-1]),bv:U.at([0,0,Hc-Lp],[0,0,1],-phi+PI/Z,[-1,0,0]),c:U.at([x-4.5,0,Hc],[1,0,0],a),s:U.shaftAt([0,0,Hc],[1,0,0],a),
    lv:K.M4.mul(K.M4.T(-14,-34,Hc-2),K.M4.Rz(Math.asin(Math.max(-1,Math.min(1,x/30))))),ind:U.at([64,0,Hc],[1,0,0],a),col:U.at([-64,0,Hc],[-1,0,0],-a),cap:K.M4.T(0,0,Hc-Lp+zt+0.5)};},
  read:(phi,g)=>g.sel>0?'clutch left · forward':g.sel<0?'clutch right · reverse':'neutral',drive:'Turn the upright bevel by its knob and move the lever left or right.'});}
/* ---------- tappet-and-stud steppers (54, 65, 70, 71), straight from the simulation's geometry ---------- */
for(const n of [54,65,70,71]){const sim=window.MB.SIMS[n];if(!sim||!sim.G)continue;const G=sim.G,D=sim.D,Wc=sim.Wc,N=G.N,rd=G.rt-30,star=sim.o.style==='star',rim=sim.o.rim;
  const studs=[];for(let i=0;i<N;i++){const t=i*TAU/N;studs.push([G.rs*Math.cos(t),G.rs*Math.sin(t),PK.TH+PK.GAP,G.ps*0.3]);}
  const wheelShape=star?(()=>{const pts=[];for(let i=0;i<N;i++){const t=i*TAU/N;pts.push([(G.rs+4)*Math.cos(t),(G.rs+4)*Math.sin(t)],[G.rs*0.5*Math.cos(t+PI/N),G.rs*0.5*Math.sin(t+PI/N)]);}return pxPoly(pts);})():{o:Sh.circle(G.rs+G.ps+2,96),h:[Sh.hole(0,0),...Array.from({length:N},(_,i)=>{const t=(i+0.5)*TAU/N;return Sh.circle(G.rs*0.22,24,G.rs*0.6*Math.cos(t),G.rs*0.6*Math.sin(t));})]};
  const restR=Math.hypot(Wc[0]+G.rs*Math.cos(PI+PI/N)-D[0],Wc[1]+G.rs*Math.sin(PI+PI/N)-D[1])-G.ps-1;
  const rimShape=()=>{const o=[],ri=restR-12,ro=restR;for(let i=0;i<=40;i++){const t=0.55+i/40*(TAU-1.1);o.push([ro*Math.cos(t),ro*Math.sin(t)]);}for(let i=40;i>=0;i--){const t=0.55+i/40*(TAU-1.1);o.push([ri*Math.cos(t),ri*Math.sin(t)]);}return{o,h:[]};};
  const parts=[{id:'w',name:star?'Star wheel with pegs':'Stud wheel',role:'driven',layer:0,shape:wheelShape,bosses:studs},
    {id:'d',name:'Driver with tappet',role:'driver',layer:0,shape:S=>S.disk(rd),bosses:[[G.rt,0,PK.TH+PK.GAP,G.pt*0.3],[-rd+14,0,14,3.5]]}];
  if(rim)parts.push({id:'rim',name:'Locking rim',role:'driver',layer:1,shape:rimShape,note:'glue onto the driver, opening over the tappet'});
  PK.def(n,{S:0.3,summary:(rim?'The driver carries a tappet and a rim. ':'The driver carries one tappet. ')+`Each turn the tappet catches one ${star?'point':'stud'} and pushes the wheel on by one ${N}th of a turn${rim?'; between pushes the rim bears against two studs and locks the wheel':''}. The centre distance is calculated so that the push is exactly one ${star?'point':'stud'}.`,
    parts,ground:[[D[0],D[1],0,rim?1:0],[Wc[0],Wc[1],0,0]],
    pose(g,sim){const o={w:[Wc[0],Wc[1],sim.gam],d:[D[0],D[1],g.phi]};if(rim)o.rim=[D[0],D[1],g.phi];return o;},drive:'Turn the driver by its knob.'});}
/* ---------- Geneva-type one-tooth drives 68, 69, 241 ---------- */
for(const n of [68,69,241,211,212,213,214,215,364,398]){const sim=window.MB.SIMS[n];if(!sim||!sim.wheel)continue;const w=sim.wheel(),D=sim.D,Wc=sim.Wc,lk=window.MB.lockDiskPts;
  const parts=[{id:'w',name:n>=212?'Star wheel, four slots and one blank place':`Driven wheel, ${sim.N} slots`,role:'driven',layer:1,shape:pxPoly(w.pts)},{id:'a',name:sim.tooth?'Driving arm with tooth':'Driving arm with pin',role:'driver',layer:0,shape:S=>S.lever([[0,0,18],[sim.r,0,14]],[[0,0]]),bosses:[[sim.r,0,PK.TH+PK.GAP,sim.pr*0.3],[-14,0,16,3.5]]}];
  if(sim.lock)parts.push({id:'l',name:'Locking disk',role:'driver',layer:1,shape:pxPoly(lk(sim.RL,sim.d,sim.Ro+4)),note:'glue onto the arm, cut-out over the tooth'});
  const ext={364:'A small wheel with a roller steps a larger wheel round by its slots: each turn of the small wheel the roller enters a slot and moves the large wheel one twelfth of a turn, and between steps the small wheel’s round rim sits in a hollow of the large wheel and locks it.',398:'A stop-start drive: the pin on the driving arm enters one of four slots and turns the wheel a quarter turn; for the rest of the turn the round rim of the locking cam sits in a hollow of the wheel and holds it still.'};
  PK.def(n,{S:0.3,summary:ext[n]?ext[n]:n>=212?'A Geneva stop, as used to limit the winding of a watch. The finger on the arbor moves the star one place per turn while the arbor’s round rim locks it between steps; the fifth place on the star has no slot, so after four steps the finger meets solid rim and the arbor can turn no further.':n===211?'A Geneva drive: the pin on the arm enters one of four slots and turns the wheel a quarter turn; for the rest of the turn the round rim of the locking disk sits in a hollow of the wheel and holds it still.':sim.lock?`A one-tooth drive with a locking rim. The tooth on the arm enters a slot and turns the wheel one ${sim.N}th of a turn; for the rest of the turn the round rim of the locking disk sits in a hollow of the wheel and holds it still.`:'A single tooth on the arm enters a slot and turns the wheel one sixth of a turn, once per revolution.',
    parts,ground:[[D[0],D[1],0,sim.lock?1:0],[Wc[0],Wc[1],1,1]],pose(g){const ar=g.a??g.phi,o={w:[Wc[0],Wc[1],g.w],a:[D[0],D[1],ar]};if(sim.lock)o.l=[D[0],D[1],ar];return o;},drive:'Turn the arm by its knob.'});}
/* ---------- lever-and-pawl ratchets (73, 75, 79 and later users), from the simulation's own layout ---------- */
function leverPawlModel(n){const sim=window.MB.SIMS[n];if(!sim||!sim.o)return;const o=sim.o;if(o.rack)return;const O=o.O||[380,300],N=o.N||20,rr=90,rt=112,dir=sim.P&&sim.P.dir!==undefined?sim.P.dir:1,L=rt+90,sawR=window.MB.sawR;
  const arms=o.double?[0,PI]:[0];const Cc=[O[0]+260,O[1]-60];const ha=PI*0.9,HQ=[O[0]+(rt+50)*Math.cos(ha-0.4),O[1]+(rt+50)*Math.sin(ha-0.4)];
  const parts=[{id:'w',name:`Ratchet wheel, ${N} teeth`,role:'driven',layer:1,shape:S=>S.ratchet(rt,N,rt-rr,-dir)},
    {id:'lv',name:o.double?'Lever with two arms':'Lever',role:'link',layer:0,shape:S=>S.lever(o.double?[[0,-L,8],[0,rt+40,8],[0,0,16]]:[[0,-L,8],[0,0,16]],[[0,0]]),pins:[[0,-(rt+40),1],...(o.double?[[0,rt+40,1]]:[]),...(o.crank?[[0,-L,1]]:[])]},
    {id:'p',name:'Driving pawl',role:'link',layer:1,qty:arms.length,shape:S=>S.lever([[0,0,7],[44,0,5]],[[0,0]])},{id:'h',name:'Holding pawl',role:'link',layer:1,shape:S=>S.lever([[0,0,7],[50,0,5]],[[0,0]])}];
  const ground=[[O[0],O[1],0,1],[HQ[0],HQ[1],1,1]];
  if(o.crank){parts.push({id:'cd',name:'Crank disk',role:'driver',layer:0,shape:S=>S.disk(50),pins:[[40,0,1]],bosses:[[-30,0,12,3.5]]},{id:'rod',name:'Connecting rod',role:'link',layer:1,shape:S=>S.bar(Math.hypot(Cc[0]-O[0],Cc[1]-O[1]+L),10)});ground.push([Cc[0],Cc[1],0,0]);}
  else parts[1].bosses=[[0,-L+10,14,3.5]];
  PK.def(n,{S:0.3,summary:o.double?'A lever with two arms carries a pawl on each: whichever way it swings, one pawl is pushing, so the ratchet wheel turns on both strokes. A holding pawl stops it running back.':'A lever swinging on the wheel’s own centre carries a pawl that pushes the ratchet round on the forward stroke and slides back over the teeth on the return; a holding pawl stops the wheel running back.'+(o.crank?' A crank and connecting rod rock the lever.':''),
    parts,ground,
    pose(g,s){const out={w:[O[0],O[1],-dir*s.w*-1*-1*-1],lv:[O[0],O[1],g.a+PI/2*0],p:[],h:null};
      const tip=(ta)=>{const r=sawR(ta-dir*s.w,N,rr,rt);return[O[0]+r*Math.cos(ta),O[1]+r*Math.sin(ta)];};
      for(const off of arms){const la=-PI/2+g.a+off,H=[O[0]+(rt+40)*Math.cos(la),O[1]+(rt+40)*Math.sin(la)],T=tip(la+0.32*dir);out.p.push([H[0],H[1],Math.atan2(T[1]-H[1],T[0]-H[0])]);}
      const T=tip(ha);out.h=[HQ[0],HQ[1],Math.atan2(T[1]-HQ[1],T[0]-HQ[0])];
      if(o.crank){const pin=[Cc[0]+40*Math.cos(g.phi),Cc[1]+40*Math.sin(g.phi)],la=-PI/2+g.a,E=[O[0]+L*Math.cos(la),O[1]+L*Math.sin(la)];out.cd=[Cc[0],Cc[1],g.phi];out.rod=[pin[0],pin[1],Math.atan2(E[1]-pin[1],E[0]-pin[0])];}
      return out;},drive:o.crank?'Turn the crank disk by its knob.':'Rock the lever by its knob.'});}
for(const n of [73,75,79,83,155,235,284,415,389])leverPawlModel(n);
/* ---------- double-pawl lever (77, 78) ---------- */
for(const n of [77,78,206,236]){const sim=window.MB.SIMS[n];if(!sim)continue;const C0=sim.Cc,A=sim.A,N=sim.N,sawR=window.MB.sawR;const H0=sim.H(0);const LaH=Math.hypot(H0[0]-A[0],H0[1]-A[1]);
  PK.def(n,{S:0.3,summary:'A lever hung beside the ratchet carries two pawls on one pin. On one stroke the upper pawl pushes the teeth, on the other the lower, hooked pawl pulls them, so the wheel keeps turning the same way on both strokes.',
    parts:[{id:'w',name:`Ratchet wheel, ${N} teeth`,role:'driven',layer:1,t:2,shape:S=>S.ratchet(sim.rt,N,sim.rt-sim.rr,1)},{id:'lv',name:'Rocking lever',role:'driver',layer:0,shape:S=>S.lever([[0,0,14],[LaH*1.25,0,8]],[[0,0]]),pins:[[LaH,0,2]],bosses:[[LaH*1.22,0,14,3.5]]},
      {id:'pu',name:'Upper pawl (pushes)',role:'link',layer:1,shape:S=>S.lever([[0,0,7],[150,0,5]],[[0,0]])},{id:'pl',name:'Lower pawl (hooked, pulls)',role:'link',layer:2,shape:S=>S.lever([[0,0,7],[150,0,5]],[[0,0]])}],
    ground:[[C0[0],C0[1],1,2],[A[0],A[1],0,0]],
    pose(g,s){const H=g.H,o={w:[C0[0],C0[1],-s.W],lv:[A[0],A[1],Math.atan2(H[1]-A[1],H[0]-A[0])]};for(const [id,sg] of [['pu',-1],['pl',1]]){const ta=sg*0.72,r=sawR(ta+s.W,N,sim.rr,sim.rt)+1,T=[C0[0]+r*Math.cos(ta),C0[1]+r*Math.sin(ta)];o[id]=[H[0],H[1],Math.atan2(T[1]-H[1],T[0]-H[0])];}return o;},drive:'Rock the lever by its knob.'});}
/* ---------- 80 hooked pawls drawing a slotted bar ---------- */
{const sim=window.MB.SIMS[80],F=[400,140],y=300,rr=90,tip=s=>[170*Math.cos(PI/2+s*0.25),170*Math.sin(PI/2+s*0.25)];
 PK.def(80,{S:0.3,summary:'A rocking lever carries two hooked pawls that drop alternately into the slots of a bar. Each stroke one of them draws the bar along, so it travels one way while the lever only swings.',
  parts:[{id:'bar',name:'Slotted bar',role:'driven',layer:2,shape:S=>({o:[[-120,y],[400,y],[400,y+30],[-120,y+30]],h:Array.from({length:23},(_,i)=>{const x=-105+i*22;return[[x-5,y+8],[x+5,y+8],[x+5,y+22],[x-5,y+22]];})})},
    {id:'lv',name:'Rocking lever with two hooked pawls',role:'driver',layer:1,shape:S=>S.lever([[0,0,16],[0,-140,8],[...tip(-1),7],[...tip(1),7]],[[0,0]]),bosses:[[0,-130,14,3.5],[...tip(-1),PK.TH+PK.GAP,1.4],[...tip(1),PK.TH+PK.GAP,1.4]]}],
  ground:[[F[0],F[1],1,1]],fixed:[{shape:S=>S.rect(560,8,400,y-6),l1:2},{shape:S=>S.rect(560,8,400,y+36),l1:2}],
  pose(g,s){return{bar:[s.w*rr,0,0],lv:[F[0],F[1],g.a]};},drive:'Rock the lever by its knob; the bar steps along.'});}
/* ---------- 63 drop pawl and star ---------- */
{const sim=window.MB.SIMS[63],Q=sim.Q,D=sim.D,Wc=[175,330],Rw=72,N=sim.N;
 PK.def(63,{S:0.3,summary:'Four pins on the disk lift the tail of a sprung drop. When a pin slips off the end of the tail the spring (a rubber band) snaps the drop back, and the pawl hinged on its other end pulls the star wheel on one tooth: four counts per turn of the disk.',
  parts:[{id:'d',name:'Disk with four pins',role:'driver',layer:0,shape:S=>S.disk(sim.rp+20),bosses:[...[0,1,2,3].map(i=>[sim.rp*Math.cos(i*PI/2),sim.rp*Math.sin(i*PI/2),PK.TH+PK.GAP,2.7]),[-40,40,14,3.5]]},
    {id:'lv',name:'Drop (lever)',role:'link',layer:1,shape:S=>S.bar(sim.La+sim.Lh,12,[sim.Lh]).o?{o:S.bar(sim.La+sim.Lh,12,[sim.Lh]).o.map(([x,y])=>[x-sim.Lh,y]),h:[S.hole(0,0)]}:null,pins:[[-sim.Lh,0,2]]},
    {id:'pw',name:'Pawl',role:'link',layer:2,shape:S=>S.lever([[0,0,7],[110,0,5]],[[0,0]])},
    {id:'s',name:`Star wheel, ${N} points`,role:'driven',layer:2,shape:S=>{const pts=[];for(let i=0;i<N;i++){const t=i*TAU/N-PI/2;pts.push([Rw*Math.cos(t),Rw*Math.sin(t)],[Rw*0.62*Math.cos(t+PI/N),Rw*0.62*Math.sin(t+PI/N)]);}return pxPoly(pts);}}],
  ground:[[D[0],D[1],0,0],[Q[0],Q[1],1,1],[Wc[0],Wc[1],2,2],[Q[0]-60,60,1,1]],
  pose(g){const head=[Q[0]-sim.Lh*Math.cos(g.b),Q[1]-sim.Lh*Math.sin(g.b)],sw=g.k*TAU/N,tip=[Wc[0]+Rw*Math.cos(sw-PI/2+TAU/N)+4,Wc[1]+Rw*Math.sin(sw-PI/2+TAU/N)];
    return{d:[D[0],D[1],g.phi],lv:[Q[0],Q[1],g.b],pw:[head[0],head[1],Math.atan2(tip[1]-head[1],tip[0]-head[0])],s:[Wc[0],Wc[1],sw]};},
  hardware:['A small rubber band from the peg above the drop to its short arm, to snap it back.'],drive:'Turn the disk by its knob.'});}
/* ---------- 76 revolution counter ---------- */
{const sim=window.MB.SIMS[76],D=sim.D,F=sim.F,Wc=[590,250],N=sim.N,sawR=window.MB.sawR;
 PK.def(76,{S:0.3,summary:'A stud on the large wheel lifts a tappet once every turn. The tappet’s hinged pawl pushes the count wheel on by one tooth and then falls back by its own weight, so the count wheel records the turns.',
  parts:[{id:'d',name:'Large wheel with stud',role:'driver',layer:0,shape:S=>S.disk(sim.rd+18),bosses:[[sim.rd,0,PK.TH+PK.GAP,3],[-60,0,14,3.5]]},{id:'t',name:'Tappet',role:'link',layer:1,shape:S=>S.lever([[-sim.L1,0,7],[0,0,14],[sim.L2,0,7]],[[0,0]]),pins:[[sim.L2,0,2]]},
    {id:'pw',name:'Hinged pawl',role:'link',layer:2,shape:S=>S.lever([[0,0,7],[90,0,5]],[[0,0]])},{id:'w',name:`Count wheel, ${N} teeth`,role:'driven',layer:2,shape:S=>S.ratchet(88,N,26,-1)}],
  ground:[[D[0],D[1],0,0],[F[0],F[1],1,1],[Wc[0],Wc[1],2,2]],
  pose(g){const long=[F[0]+sim.L2*Math.cos(g.b),F[1]-sim.L2*Math.sin(g.b)],ta=PI+0.35,r=sawR(ta-g.w,N,62,88)+2,T=[Wc[0]+r*Math.cos(ta),Wc[1]+r*Math.sin(ta)];
    return{d:[D[0],D[1],g.phi],t:[F[0],F[1],-g.b],pw:[long[0],long[1],Math.atan2(T[1]-long[1],T[0]-long[0])],w:[Wc[0],Wc[1],g.w]};},drive:'Turn the large wheel by its knob; each turn moves the count wheel one tooth.'});}
/* ---------- 55 wheel with outer and inner teeth driving two pinions ---------- */
{const O=[400,260];for(const n of [55,200])PK.def(n,{S:0.25,summary:'One wheel carries teeth on its rim and a ring of teeth inside. A pinion on the rim turns five times as fast the opposite way; a pinion inside the ring turns three times as fast the same way, so one wheel gives two different speeds.',
  parts:[{id:'w',name:'Wheel, 60 outer teeth',role:'driver',layer:1,shape:S=>S.gear(150,60,{lighten:false}),bosses:[[120,0,12,3.5]]},{id:'r',name:'Inner ring, 36 teeth (glue under the wheel)',role:'driver',layer:0,shape:S=>({o:S.circle(118,96),h:S.ring(90,36,118).h})},
    {id:'a',name:'Outer pinion, 12 teeth',role:'driven',layer:1,shape:S=>S.gear(30,12)},{id:'b',name:'Inner pinion, 12 teeth',role:'driven',layer:0,shape:S=>S.gear(30,12)}],
  ground:[[O[0],O[1],0,1],[O[0]+180,O[1],1,1],[O[0]-60,O[1],0,0,false]],
  pose(g){return{w:[O[0],O[1],g.phi],r:[O[0],O[1],g.phi+PI/36],a:[O[0]+180,O[1],g.a+PI/12],b:[O[0]-60,O[1],g.b]};},drive:'Turn the big wheel by its knob; watch the two pinions.'});}
/* ---------- 56 back-gear throw-out ---------- */
{PK.def(56,{S:0.3,summary:'A display model of the back-gear throw-out: lifting the lever draws the small gear out of mesh, so the spindle runs direct; dropping it puts the gears back in for slow, strong drive.',
  parts:[{id:'G',name:'Spindle gear, 32 teeth',role:'driven',layer:0,shape:S=>S.gear(80,32)},{id:'p',name:'Back pinion, 12 teeth',role:'driver',layer:0,shape:S=>S.gear(30,12)},{id:'sl',name:'Sliding bearing block',role:'link',layer:1,shape:S=>S.rect(60,30,0,0,[]),pins:[[0,0,1]]},
    {id:'lv',name:'Throw-out lever',role:'driver',layer:1,shape:S=>S.lever([[0,0,14],[90,0,8]],[[0,0]]),bosses:[[84,0,12,3.5]]}],
  ground:[[330,300,0,0],[560,150,1,1]],fixed:[{shape:S=>S.rect(10,120,330-40,150),l1:1},{shape:S=>S.rect(10,120,330+40,150),l1:1}],
  pose(g,s){const y=300-110-g.dy;return{G:[330,300,g.phi*s.sp],p:[330,y,-g.phi*1.0],sl:[330,y,0],lv:[560,150,g.on?0.4:-0.6]};},drive:'Swing the lever to throw the back gear in and out.'});}
/* ---------- 57 sun, planets and ring ---------- */
{const O=[400,265];PK.def(57,{S:0.3,summary:'A sun gear and a ring gear with three planets between them on a carrier. Driving the ring and the sun in opposite directions (Brown used two belts) makes the planets roll round, turning about their own pins and orbiting the centre at the same time.',
  parts:[{id:'r',name:'Ring gear, 48 internal teeth',role:'driven',layer:1,shape:S=>S.ring(120,48,146)},{id:'s',name:'Sun gear, 24 teeth',role:'driver',layer:1,shape:S=>S.gear(60,24),bosses:[[30,0,12,3.5]]},
    {id:'p',name:'Planet gear, 12 teeth',role:'link',layer:1,qty:3,shape:S=>S.gear(30,12)},{id:'c',name:'Carrier',role:'link',layer:0,shape:S=>S.lever([0,1,2].map(k=>[90*Math.cos(k*TAU/3),90*Math.sin(k*TAU/3),14]).concat([[0,0,20]]),[[0,0]]),pins:[0,1,2].map(k=>[90*Math.cos(k*TAU/3),90*Math.sin(k*TAU/3),1])},
    {id:'i',name:'Guide roller',role:'link',layer:1,qty:3,shape:S=>S.disk(14)}],
  ground:[[O[0],O[1],0,1],...[0,1,2].map(k=>{const a=-PI/2+k*TAU/3;return[O[0]+160*Math.cos(a),O[1]+160*Math.sin(a),1,1];})],
  pose(g){const ts=TAU/24,tr=TAU/48;return{r:[O[0],O[1],g.r+tr/2],s:[O[0],O[1],g.s+ts/2],p:[0,1,2].map(k=>{const b=g.c+k*TAU/3;return[O[0]+90*Math.cos(b),O[1]+90*Math.sin(b),g.p+k*TAU/3];}),c:[O[0],O[1],g.c],i:[0,1,2].map(k=>{const a=-PI/2+k*TAU/3;return[O[0]+160*Math.cos(a),O[1]+160*Math.sin(a),-g.r*146/14];})};},
  drive:'Turn the sun by its knob while holding the ring, or turn both; watch the planets.'});}
/* ---------- 58, 59, 60 belt shifting between fast and loose pulleys ---------- */
for(const [n,stops,names] of [[58,[0,1,0.55,0.25],['loose','1st','2nd','3rd']],[59,[0,1,0.4],['loose','quick','slow']],[60,[0,1,0,0.5],['loose','fast','loose','fast 2']]]){const k=stops.length,w=20,x0=-k*w/2,zA=70,zB=22,Rd=12,Rp=11;
  const pul=(fast,r)=>K.merge(K.lathe([[fast?0.01:U.SHB,0],[r,0],[r+1.2,1],[r+1.2,w-3],[r,w-2],[fast?0.01:U.SHB,w-2]],48),...(fast?[K.prism(K.circle(r,48),[U.octa(U.SH+0.12)],0,w-2)]:[]));
  const pulley=(fast,r)=>fast?K.loftS([0,1,w-3,w-2].map((z,i)=>({o:K.circle(i===0||i===3?r:r+1.2,48).map(p=>[p[0],p[1],z]),h:[(()=>{const o=U.octa(U.SH+0.12),q=[];for(let a=0;a<8;a++){const A=o[a],B=o[(a+1)%8];for(let j=0;j<6;j++)q.push([A[0]+(B[0]-A[0])*j/6,A[1]+(B[1]-A[1])*j/6]);}return q;})().map(p=>[p[0],p[1],z])]}))):K.lathe([[U.SHB,0],[r,0],[r+1.2,1],[r+1.2,w-3],[r,w-2],[U.SHB,w-2]],48);
  const parts=[{id:'dr',name:'Driving drum',role:'driver',mesh:K.lathe([[U.SH+0.2,0],[Rd,0],[Rd+1,2],[Rd+1,k*w+6],[Rd,k*w+8],[U.SH+0.2,k*w+8]],64)},{id:'sa',name:'Drum shaft',mesh:U.shaft(k*w+50)},{id:'sb',name:'Driven shaft',role:'driven',mesh:U.shaft(k*w+50)},
    ...stops.map((s,i)=>({id:'p'+i,name:`Pulley ${i+1} (${names[i]}${s===0?', runs loose':', fast to the shaft'})`,role:s===0?'link':'driven',mesh:pulley(s!==0,Rp-(s?(1-s)*3:0))})),{id:'f',name:'Belt fork',role:'link',mesh:K.prism([[-6,-14],[6,-14],[6,14],[-6,14]],[K.rrect(8,22,2,4)],0,4)},
    {id:'k',name:'Hand crank',role:'driver',mesh:U.crank()},{id:'ind',name:'Pointer disc',role:'driven',mesh:U.collar(9,3)}];
  PK.defS(n,{summary:`Belt shifting: a wide drum drives a row of ${k} pulleys on the shaft below. Pulleys marked loose turn freely on the shaft; the others are fast to it. Slide the belt fork along and the belt moves from pulley to pulley, so the driven shaft stops or runs at a different speed.`,cam:{yaw:-0.5,pitch:0.55},
    base:()=>[U.plate(x0-36,-26,-x0+36,40),U.wall(x0-14,0,'x',[[0,zA],[0,zB]],22,5,zA+10),U.wall(-x0+14,0,'x',[[0,zA],[0,zB]],22,5,zA+10),U.wall(x0-14,28,'x',[[0,(zA+zB)/2]],12,5),U.wall(-x0+14,28,'x',[[0,(zA+zB)/2]],12,5)],
    parts:parts.concat([{id:'rod',name:'Fork rod',mesh:U.shaft(k*w+40)}]),
    pose(phi,g,sim){const i=g.i??0,xb=x0+i*w+w/2,a=sim?sim.a:0,o={dr:U.at([x0-4,0,zA],[1,0,0],phi),sa:U.shaftAt([0,0,zA],[1,0,0],phi),sb:U.shaftAt([0,0,zB],[1,0,0],a),f:K.M4.mul(K.M4.T(xb,14,(zA+zB)/2),K.M4.Ry(PI/2)),rod:U.shaftAt([0,28,(zA+zB)/2],[1,0,0],0),k:U.at([x0-24,0,zA],[-1,0,0],-phi),ind:U.at([-x0+20,0,zB],[1,0,0],a)};
      stops.forEach((s,j)=>{o['p'+j]=U.at([x0+j*w+1,0,zB],[1,0,0],s===0?phi*0.6:a);});return o;},
    belts(phi,g){const i=g.i??0,xb=x0+i*w+w/2,pts=[];for(let t=0;t<=48;t++){const u=t/48*TAU;const top=Math.sin(u)>0;}const R=ropeThru([{c:[0,zA],r:Rd+1.2},{c:[-30,zB],r:0},{c:[0,zB],r:Rp+1.2,s:1}]);
      const ring=[];for(let t=0;t<=36;t++){const u=-PI/2+t/36*PI;ring.push([xb,(Rd+1.6)*Math.cos(u),zA+(Rd+1.6)*Math.sin(u)]);}for(let t=0;t<=36;t++){const u=PI/2+t/36*PI;ring.push([xb,(Rp+1.6)*Math.cos(u),zB+(Rp+1.6)*Math.sin(u)]);}return[{pts:ring,r:1.6,closed:true}];},
    read:(phi,g)=>`belt on pulley ${(g.i??0)+1}: ${names[g.i??0]}`,hardware:['A flat rubber band about 15 mm wide as the belt.'],drive:'Turn the drum and slide the fork to move the belt.'});}
/* ---------- 61, 62 bevel differential with a carrier ring ---------- */
for(const n of [61,62,226,495,503,506]){const Z=18,Rp=18,d=PI/4,f=7,Hc=U.BT+Rp+20,zt=f*Math.cos(d),Lp=Rp/Math.tan(d),Rr=Lp+12;
  const carrier=K.merge(K.prism(K.circle(Rr+5,64),[K.circle(Rr-3,64)],-3,3),...[0,PI].map(a=>K.xf(K.prism([[-4,-3],[4,-3],[4,3],[-4,3]],[],Lp-zt-4,Rr),K.M4.mul(K.M4.Rz(a),K.M4.mul(K.M4.Ry(PI/2),K.M4.T(0,0,0))))));
  PK.defS(n,{summary:({226:'Six bevels on a turning frame: one side wheel is held, the frame carries the pinions round it, and the other side wheel runs at twice the frame’s speed.',495:'Bevel epicyclic gearing: one side bevel held, the carrier with its two pinions driven, and the other side bevel turned at twice the carrier speed.',503:'A bevel differential: two side bevels and two pinions on a carrier ring. The carrier always turns at the average of the two side bevels.',506:'The epicyclic train driven from both ends: the carrier runs at the mean of the two side bevels, so the drives add or subtract.'})[n]||(n===61?'A bevel differential: two side bevels on one axis and two pinions on a carrier ring between them. Turn the left shaft with the right one held and the carrier turns at half speed; turn both together and it turns with them. Brown used it for single and double speed.':'The same differential with the second side wheel driven too (Brown by a belt): the carrier runs at the average of the two side wheels, so adding or subtracting the second drive changes the output speed.'),
    cam:{yaw:0.35,pitch:0.35},base:()=>[U.plate(-78,-Rr-14,78,Rr+14),U.wall(-Lp-8,0,'x',[[0,Hc]]),U.wall(-62,0,'x',[[0,Hc]]),U.wall(Lp+8,0,'x',[[0,Hc]]),U.wall(62,0,'x',[[0,Hc]])],
    parts:[{id:'a',name:'Left bevel (input)',role:'driver',mesh:U.bevel(Rp,Z,d,f)},{id:'b',name:'Right bevel',role:'driven',mesh:U.bevel(Rp,Z,d,f)},{id:'p',name:'Pinion (turns on the carrier spoke)',role:'link',qty:2,mesh:U.bevel(Rp,Z,d,f,{bore:'round'})},
      {id:'c',name:'Carrier ring with two spokes',role:'driven',mesh:carrier,note:'print flat; the spokes are the pinion axles'},{id:'sa',name:'Left shaft',mesh:U.shaft(60)},{id:'sb',name:'Right shaft',mesh:U.shaft(60)},{id:'ka',name:'Crank, left',role:'driver',mesh:U.crank()},{id:'kb',name:'Crank, right',role:'driver',mesh:U.crank()}],
    pose(phi,g){const a=g.a||0,b=g.b||0,c=g.c||0,rd=[0,Math.cos(c),Math.sin(c)];return{a:U.at([-Lp,0,Hc],[1,0,0],a,[0,0,1]),b:U.at([Lp,0,Hc],[-1,0,0],-b+PI/Z,[0,0,1]),
      p:[1,-1].map(s=>U.at([rd[0]*s*Lp,rd[1]*s*Lp,Hc+rd[2]*s*Lp],[-rd[0]*s,-rd[1]*s,-rd[2]*s],s*(a-c),[1,0,0])),c:K.M4.mul(K.M4.mul(K.M4.T(0,0,Hc),K.M4.Rx(c)),K.M4.Ry(PI/2)),
      sa:U.shaftAt([-Lp-26,0,Hc],[1,0,0],a),sb:U.shaftAt([Lp+26,0,Hc],[1,0,0],b),ka:U.at([-66,0,Hc],[-1,0,0],-a),kb:U.at([66,0,Hc],[1,0,0],b)};},
    read:(phi,g)=>`left ${((g.a||0)/TAU).toFixed(2)} · right ${((g.b||0)/TAU).toFixed(2)} · carrier ${((g.c||0)/TAU).toFixed(2)} turns`,drive:'Turn one crank, then both, and watch the carrier ring.'});}
/* ---------- 64, 66, 67 worm-released drops ---------- */
for(const [n,kind] of [[64,'spring'],[66,'weight'],[67,'tumbler']]){const m=2,p=PI*m,rp=6,Zw=20,Rw=m*Zw/2,Hw=U.BT+12,Hc=Hw+rp+Rw,al=kind==='spring'?PI*5/3:PI,hw=8;
  const camR=t=>{t=((t%TAU)+TAU)%TAU;return t<al?9+9*t/al:18-9*(t-al)/(TAU-al);};
  const hollow=K.merge(K.prism(K.hull([...K.circle(5,24),...K.circle(3.5,24,0,-26)]),[K.circle(U.SHB,24)],0,4),
    kind==='spring'?K.prism(Array.from({length:120},(_,i)=>{const t=i/120*TAU;return[camR(t)*Math.cos(t-PI/2),camR(t)*Math.sin(t-PI/2)];}),[K.circle(U.SHB,24)],4,9):kind==='weight'?K.merge(K.prism(K.hull([...K.circle(4,24),...K.circle(3,24,38,0)]),[K.circle(U.SHB,24)],4,8),K.box(10,12,4,12,40,0)):K.merge(K.prism(K.hull([...K.circle(4,24),...K.circle(8,32,30,0)]),[K.circle(U.SHB,24)],4,8),K.cyl(8,8,14,32,30,0)));
  const parts=[{id:'wm',name:'Worm (single start)',role:'driver',mesh:U.worm(rp,p,4*p)},{id:'wh',name:'Worm wheel, 20 teeth, with pin',role:'link',mesh:K.merge(U.helical(Rw,Zw,hw,-hw*Math.tan(Math.atan(p/(TAU*rp)))/Rw,{seg:3}),K.cyl(1.8,hw,hw+7,16,0,15))},
    {id:'h',name:kind==='spring'?'Hollow piece: arm and cam':kind==='weight'?'Hollow piece: arm and weight':'Hollow piece: arm and tumbler',role:'driven',mesh:hollow,note:'turns freely on the wheel shaft'},
    {id:'sw',name:'Worm shaft',mesh:U.shaft(4*p+30)},{id:'sh',name:'Wheel shaft',mesh:U.shaft(64)},{id:'k',name:'Hand crank',role:'driver',mesh:U.crank()},{id:'col',name:'Collar',role:'small',qty:2,mesh:U.collar()}];
  if(kind==='spring')parts.push({id:'fl',name:'Follower lever (pull it onto the cam with a rubber band)',role:'link',mesh:K.merge(K.prism(K.hull([...K.circle(5,24),...K.circle(4,24,30,0)]),[K.circle(U.SHB,24)],0,4),K.cyl(3,0,4.01,16,30,0))});
  PK.defS(n,{summary:`A worm slowly turns the worm wheel; a pin on the wheel pushes an arm on a piece that turns freely on the same shaft. ${kind==='spring'?'The piece carries a cam with a follower pulled onto it, so once past its peak the cam is driven forward suddenly':kind==='weight'?'The piece carries a weight on an arm; once lifted past the top it falls over':'The piece carries a heavy tumbler; once lifted past the top it tumbles over'} and runs ahead of the pin, resting until the pin catches up.`,cam:{yaw:-2.4,pitch:0.35},
    base:()=>{const b=[U.plate(-42,-46,42,46),U.wall(-2*p-4,0,'x',[[0,Hw]],18,5,Hw+6),U.wall(2*p+4,0,'x',[[0,Hw]],18,5,Hw+6),U.wall(0,14,'y',[[0,Hc]],18),U.wall(0,38,'y',[[0,Hc]],18)];if(kind==='spring')b.push(U.wall(-30,-22,'y',[[0,Hc+4]],14),U.post(-30,-34,Hc+12,Hc));return b;},
    parts,
    pose(phi,g){const tg=g.tg||0,th=g.th||0,o={wm:U.at([-2*p,0,Hw],[1,0,0],phi,[0,0,1]),wh:U.at([0,-hw/2,Hc],[0,1,0],tg,[0,0,-1]),h:U.at([0,-hw/2-1.5,Hc],[0,-1,0],-th,[0,0,-1]),sw:U.shaftAt([-5,0,Hw],[1,0,0],phi),sh:U.shaftAt([0,14,Hc],[0,1,0],tg),k:U.at([-2*p-14,0,Hw],[-1,0,0],-phi,[0,0,1]),col:[U.at([2*p+8,0,Hw],[1,0,0],phi),U.at([0,42,Hc],[0,1,0],tg)]};
      if(kind==='spring'){const fr=camR(PI-th+PI/2-PI/2);const ang=Math.asin(Math.max(-1,Math.min(1,(fr-12)/30)));o.fl=U.at([-30,-22-4,Hc+4],[0,-1,0],ang,[1,0,0]);}return o;},
    read:(phi,g)=>g.falling?'gone over · running ahead':g.rest?'resting until the pin catches up':'the pin is pushing the arm',drive:'Turn the crank steadily: every so often the piece suddenly jumps ahead.'});}
/* ---------- 72 tilt hammer (upright) ---------- */
{const sim=window.MB.SIMS[72],W=sim.W,H=sim.H;const wiper=()=>{const pts=[];for(let k=0;k<4;k++){const a=k*PI/2;for(let i=0;i<=8;i++){const t=a-1.15+i/8*0.85;pts.push([70*Math.cos(t),70*Math.sin(t)]);}
    for(let i=0;i<=10;i++){const u=i/10,t=a-0.3+0.3*u,r=70+25*Math.sin(u*PI/2);pts.push([r*Math.cos(t),r*Math.sin(t)]);}pts.push([60*Math.cos(a+0.25),60*Math.sin(a+0.25)]);}return pxPoly(pts);};
 PK.def(72,{S:0.22,up:true,summary:'A tilt hammer: four wipers on the turning wheel press down the tail of the helve, lifting the hammer head; as each wiper slips off, the head falls on the anvil. Four blows per turn.',
  parts:[{id:'w',name:'Wiper wheel',role:'driver',layer:0,shape:wiper,bosses:[[40,0,12,3.5]]},{id:'h',name:'Helve with hammer head',role:'driven',layer:0,shape:S=>({o:[[-286,-10],[-234,-10],[-234,-7],[250,-7],[250,7],[-234,7],[-234,60],[-286,60]],h:[S.hole(0,0)]})}],
  ground:[[W[0],W[1],0,0],[H[0],H[1],0,0]],fixed:[{shape:S=>S.rect(28,170,H[0],H[1]+95),l1:0,t:2},{shape:S=>S.rect(60,110,140,415),l1:0},{shape:S=>S.rect(120,30,140,345),l1:0}],
  pose(g){return{w:[W[0],W[1],g.phi],h:[H[0],H[1],g.h]};},drive:'Turn the wiper wheel by its knob.'});}
/* ---------- 74 mutilated bevel ---------- */
{const m=2,Zc=36,Za=18,Rc=m*Zc/2,Ra=m*Za/2,dC=Math.atan2(Zc,Za),dA=PI/2-dC,f=7,Lc=Rc/Math.tan(dC),La=Ra/Math.tan(dA),Hc=U.BT+Lc+10,ztc=f*Math.cos(dC),zta=f*Math.cos(dA);
 PK.defS(74,{summary:'A bevel wheel with teeth on only a third of its rim turns on an upright pin between two bevels on one level axis. The toothed part turns the left bevel, passes a gap, turns the right bevel the opposite way, and passes another gap: uniform motion, by turns, with rests between.',cam:{yaw:0.5,pitch:0.55},
  base:()=>[U.plate(-La-62,-Rc-12,La+62,Rc+12),U.post(0,0,Hc-Lc+ztc+0.5+3,Hc-Lc-0.5),U.wall(-La-8,0,'x',[[0,Hc]]),U.wall(-La-36,0,'x',[[0,Hc]]),U.wall(La+8,0,'x',[[0,Hc]]),U.wall(La+36,0,'x',[[0,Hc]])],
  parts:[{id:'c',name:'Bevel wheel, teeth on a third of the rim',role:'driver',mesh:K.merge(U.bevel(Rc,Zc,dC,f,{bore:'round',seg:[0,TAU/3]}),K.cyl(3,0.01,ztc,16,Rc-8,0))},{id:'l',name:'Left bevel, 18 teeth',role:'driven',mesh:U.bevel(Ra,Za,dA,f)},{id:'r',name:'Right bevel, 18 teeth',role:'driven',mesh:U.bevel(Ra,Za,dA,f)},
    {id:'sl',name:'Left shaft',mesh:U.shaft(50)},{id:'sr',name:'Right shaft',mesh:U.shaft(50)},{id:'il',name:'Pointer disc',role:'driven',qty:2,mesh:U.collar(9,3)},{id:'cap',name:'Pin cap',role:'small',mesh:U.capMesh()}],
  pose(phi,g){return{c:U.at([0,0,Hc-Lc],[0,0,1],phi,[1,0,0]),l:U.at([-La,0,Hc],[1,0,0],g.aL||0,[0,0,-1]),r:U.at([La,0,Hc],[-1,0,0],g.aR||0,[0,0,-1]),sl:U.shaftAt([-La-22,0,Hc],[1,0,0],g.aL||0),sr:U.shaftAt([La+22,0,Hc],[1,0,0],-(g.aR||0)),il:[U.at([-La-42,0,Hc],[-1,0,0],-(g.aL||0)),U.at([La+42,0,Hc],[1,0,0],-(g.aR||0))],cap:K.M4.T(0,0,Hc-Lc+ztc+0.5)};},
  read:(phi,g)=>`left ${((g.aL||0)/TAU).toFixed(2)} · right ${((g.aR||0)/TAU).toFixed(2)} turns`,drive:'Turn the big bevel by its knob.'});}
