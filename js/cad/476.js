(function(){const K=window.CAD.K,PK=window.PK,M4=K.M4,PI=Math.PI,TAU=2*PI;const mod=(a,n)=>((a%n)+n)%n;const ropeThru=(...a)=>window.MB.ropeThru(...a);
/* ===== printable models 476–507 ===== */
const U=PK.U,{Sh}=PK,L=PK.Lib;PK._S(0.3);const pxPoly=L.pxPoly;
const armPts=(A,B,r)=>K.hull([...K.circle(r,20,A[0],A[1]),...K.circle(r,20,B[0],B[1])]);
const rotP=(pts,a,c=[0,0])=>pts.map(([x,y])=>[c[0]+x*Math.cos(a)-y*Math.sin(a),c[1]+x*Math.sin(a)+y*Math.cos(a)]);
const rc=(x0,y0,x1,y1)=>[[x0,y0],[x1,y0],[x1,y1],[x0,y1]];
const R_=(x0,y0,x1,y1,l1=0)=>({shape:{o:rc(x0,y0,x1,y1),h:[]},l1});
const BOSS=[0,0,PK.TH+PK.GAP+PK.TH-0.6,PK.PINR];/* a planet's own axle, standing up into the arm */

/* 476 · steam siphon (a jet pump with the steam blown up a throat) */
{const y=250;
 PK.def(476,{S:0.3,summary:'A steam siphon: steam blown through a nozzle into a narrow throat carries the surrounding water with it, so water is drawn up from below and driven on, with no moving parts at all.',
  parts:[{id:'n',name:'Steam nozzle',role:'driver',layer:0,shape:S=>({o:[[0,-16],[200,-6],[200,6],[0,16]],h:[]})}],
  fixed:[{shape:S=>({o:[[120,y-28],[340,y-28],[420,y-48],[700,y-48],[700,y-40],[420,y-40],[340,y-20],[120,y-20]],h:[]}),l1:0},{shape:S=>({o:[[120,y+20],[340,y+20],[370,y+26],[370,y+240],[362,y+240],[362,y+32],[340,y+28],[120,y+28]],h:[]}),l1:0},{shape:S=>({o:[[410,y+40],[700,y+40],[700,y+48],[418,y+48],[418,y+240],[410,y+240]],h:[]}),l1:0}],plate:{x0:100,y0:180,x1:720,y1:500},
  pose(){return{n:[130,y,0]};},drive:'A section: the jet draws water up the side pipe.'});}

/* 477, 478 · steam traps */
for(const n of [477,478]){const bar_=n===478;
 PK.def(n,{S:0.3,summary:bar_?'An expansion steam trap: a long brass rod lies in the trap and carries the valve at its end. Hot steam lengthens the rod and pushes the valve shut; when cooler condensed water fills the trap the rod shrinks and the valve opens to let the water out, but never the steam.':'A thermostatic steam trap: a sealed capsule holding a volatile liquid sits over the outlet. Steam heats it, the capsule swells and closes the valve; cooler water lets it shrink, opening the valve to drain the condensate while holding back the steam.',
  parts:[{id:'e',name:bar_?'Expansion rod with valve head':'Capsule with valve stem',role:'driver',layer:0,shape:bar_?{o:[[0,-7],[290,-7],[290,-12],[310,-12],[310,12],[290,12],[290,7],[0,7]],h:[]}:{o:[...Array.from({length:24},(_,i)=>{const t=i/24*TAU;return[60*Math.cos(t),25*Math.sin(t)];}),[8,20],[8,70],[-8,70],[-8,20]].slice(0,24).concat([]),h:[]}}],
  fixed:[R_(200,160,600,172),R_(200,348,600,360),R_(200,172,212,348),R_(588,172,600,300),R_(588,340,600,348),R_(100,193,200,207),R_(600,313,720,327),R_(bar_?520:385,bar_?236:330,bar_?532:415,bar_?284:340)],plate:{x0:90,y0:140,x1:730,y1:380},
  pose(g){return bar_?{e:[230+(g.hot?10:-10),260,0]}:{e:[400,g.hot?255:245,0]};},drive:'A section: watch the element close and open the valve.'});}

/* 479, 480 · gasometers */
for(const n of [479,480]){const tele=n===480,X=400;
 PK.def(n,{S:0.3,up:true,summary:tele?'A telescoping gasholder: as gas is pumped in, the inner lift rises first; when its rim is lifted to the top, a water-sealed cup catches the next section and lifts it too, so a tall holder fits a shallow tank.':'A gasholder (gasometer): a bell floating upside down in a tank of water stores the gas under it, the water sealing the rim. A counterweight on a chain over a pulley sets the pressure, and the bell rises and sinks as gas is let in and drawn off.',
  parts:tele?[{id:'o',name:'Outer lift',role:'driven',layer:0,shape:S=>({o:[[-170,0],[170,0],[170,200],[162,200],[162,8],[-162,8],[-162,200],[-170,200]],h:[]})},{id:'i',name:'Inner lift',role:'driver',layer:1,shape:S=>({o:[[-140,0],[140,0],[140,130],[132,130],[132,8],[-132,8],[-132,130],[-140,130]],h:[]})}]
   :[{id:'b',name:'Bell',role:'driver',layer:0,shape:S=>({o:[[-160,0],[160,0],[160,190],[152,190],[152,8],[-152,8],[-152,190],[-160,190]],h:[]})},{id:'w',name:'Counterweight',role:'driven',layer:0,shape:S=>S.rect(60,60,0,30)}],
  fixed:[R_(X-190,260,X-180,460),R_(X+180,260,X+190,460),R_(X-190,450,X+190,460),R_(100,434,X-60,446),R_(X+60,434,700,446)].concat(tele?[]:[R_(X-6,40,X+6,60),R_(614,40,626,60)]),plate:{x0:90,y0:20,x1:720,y1:480},
  pose(g){if(tele){const h1=Math.min(1,g.h*2),h2=Math.max(0,g.h*2-1);return{o:[X,270-h1*130,0],i:[X,270-h1*130-h2*100,0]};}return{b:[X,270-g.h*170,0],w:[620,180+g.h*170,0]};},
  ropes:tele?undefined:(g=>{const z=PK.zl(0)+2,yb=270-g.h*170;return[{pts:[[X,yb,z],[X,70,z],[620,70,z],[620,180+g.h*170,z]],r:0.6}];}),
  hardware:tele?[]:['A thread from the top of the bell over two pins to the counterweight.'],drive:'Raise and lower the bell to see how it floats in the tank.'});}

/* 481 · wet gas meter: a drum with curved partitions half under water */
{const O=[400,260],R=150;
 PK.def(481,{S:0.3,up:true,summary:'A wet gas meter: a drum divided by curved partitions turns half sunk in water. Gas entering at the centre fills one compartment after another above the water, turning the drum; each compartment passes a known volume, so the drum’s turns count the gas.',
  parts:[{id:'d',name:'Drum with four curved partitions',role:'driven',layer:0,mesh:K.merge(PK.ext({o:K.circle(R,96),h:[K.circle(R-8,96)]},0,PK.TH),PK.ext({o:K.circle(24,32),h:[Sh.hole(0,0)]},0,PK.TH),...[0,1,2,3].map(k=>{const c=[];for(let i=0;i<=12;i++){const t=i/12,x=20+(R-28)*t,yy=-30*Math.sin(PI*t)*(1-t*0.3);c.push([x,yy-3]);}for(let i=12;i>=0;i--){const t=i/12,x=20+(R-28)*t,yy=-30*Math.sin(PI*t)*(1-t*0.3);c.push([x,yy+3]);}return PK.ext({o:rotP(c,k*PI/2),h:[]},0,PK.TH);}))}],
  ground:[[O[0],O[1],0,0]],fixed:[{shape:S=>({o:K.circle(R+30,96,O[0],O[1]),h:[K.circle(R+18,96,O[0],O[1])]}),l1:0}],
  pose(g){return{d:[O[0],O[1],g.phi]};},drive:'Turn the drum: each partition passes through the water seal in turn.'});}

/* 482 · gas regulator */
{const X=400;
 PK.def(482,{S:0.3,up:true,summary:'A gas pressure regulator: a light bell floats on the gas in a water-sealed tank and carries a cone valve on its rod. If the supply pressure rises the bell lifts and draws the cone into its seat, throttling the flow; if it falls the bell sinks and opens it, so the outlet pressure stays steady.',params:window.MB.SIMS[482].params,
  parts:[{id:'b',name:'Bell with rod and cone valve',role:'driver',layer:0,mesh:K.merge(PK.ext({o:[[-120,0],[120,0],[120,160],[112,160],[112,8],[-112,8],[-112,160],[-120,160]],h:[]},0,PK.TH),PK.ext({o:rc(-4,160,4,180),h:[]},0,PK.TH),PK.ext({o:[[-30,180],[30,180],[0,220]],h:[]},0,PK.TH))}],
  fixed:[R_(X-160,240,X-150,440),R_(X+150,240,X+160,440),R_(X-160,430,X+160,440),R_(X-40,420,X-12,428),R_(X+12,420,X+40,428),R_(100,463,X-40,477),R_(X+40,463,700,477)],plate:{x0:90,y0:150,x1:710,y1:490},
  pose(g){return{b:[X,200-g.lift*60,0]};},drive:'Lift the bell: the cone closes the gas way.'});}

/* 483 · dry gas meter: two bellows working a crank */
PK.def(483,{S:0.3,summary:'A dry gas meter: two leather bellows fill and empty in turn as the gas passes, their moving plates working a crank through rods, and the crank drives the dial; slide valves worked by the same crank switch the gas from one bellows to the other.',
  parts:[{id:'a',name:'Left bellows plate',role:'driver',layer:0,shape:S=>({o:rc(-4,190,4,330),h:[]})},{id:'b',name:'Right bellows plate',role:'driver',layer:0,shape:S=>({o:rc(-4,190,4,330),h:[]})},{id:'c',name:'Crank',role:'driven',layer:0,shape:S=>S.disk(40),pins:[[30,0,1]]}],
  ground:[[400,90,0,0]],fixed:[R_(120,160,400,166),R_(120,354,400,360),R_(120,166,126,354),R_(400,160,680,166),R_(400,354,680,360),R_(674,166,680,354),R_(394,166,406,354)],plate:{x0:110,y0:40,x1:690,y1:370},
  pose(g){return{a:[260+70+50*g.a,0,0],b:[540+70+50*g.b,0,0],c:[400,90,g.phi]};},drive:'Turn the crank: the two bellows plates move in turn.'});

/* 484 · spiral blade on a cylinder (wind or water turbine) */
{const S=0.25,R=60*S,Lc=480*S,zc=U.BT+R+8;
 PK.defS(484,{summary:'A spiral blade wound round a cylinder lying across the stream: the wind or water pressing on the slanting blade drives it round, like a long screw, and it turns the same way whatever the direction of the flow along it.',cam:{yaw:0.5,pitch:0.35},
  base:()=>[U.plate(-Lc/2-20,-25,Lc/2+20,25),U.wall(-Lc/2-10,0,'x',[[0,zc,U.SHB]],14,5),U.wall(Lc/2+10,0,'x',[[0,zc,U.SHB]],14,5)],
  parts:[{id:'c',name:'Cylinder with spiral blade',role:'driver',mesh:K.xf(K.merge(U.worm(R,30,Lc,{depth:6}),K.prism(U.octa(U.SH),[],-14,Lc+14)),M4.mul(M4.Ry(PI/2),M4.T(0,0,-Lc/2)))}],
  pose(phi){return{c:M4.mul(M4.T(0,0,zc),M4.Rx(phi))};},read:(phi)=>`${(phi/TAU).toFixed(2)} turns`,drive:'Blow across the blade: the cylinder turns.'});}

/* 485 · windmill (post-mill front view) */
{const H=[400,170];
 PK.def(485,{S:0.25,up:true,summary:'A windmill: four sails on a slightly inclined shaft are turned by the wind; their lattice frames carry cloths that can be reefed to suit the strength of the wind. The shaft drives the millstones through gearing inside the body, which is turned to face the wind.',
  parts:[{id:'s',name:'Sails on their hub',role:'driver',layer:1,mesh:K.merge(PK.ext({o:K.circle(16,24),h:[Sh.hole(0,0)]},0,PK.TH),...[0,1,2,3].map(k=>K.merge(PK.ext({o:rotP(rc(0,-4,200,4),k*PI/2),h:[]},0,PK.TH),PK.ext({o:rotP(rc(40,4,200,44),k*PI/2),h:Array.from({length:7},(_,j)=>rotP(rc(46+j*22,10,62+j*22,38),k*PI/2))},0,PK.TH))))}],
  ground:[[H[0],H[1],0,1]],fixed:[{shape:S=>({o:[[340,500],[370,200],[430,200],[460,500]],h:[]}),l1:0}],plate:{x0:180,y0:-50,x1:620,y1:510},
  pose(g){return{s:[H[0],H[1],g.phi]};},drive:'Blow on the sails: they turn on the hub.'});}

/* 486 · vertical-axis windmill with feathering sails (plan view) */
{const sim=window.MB.SIMS[486];
 PK.def(486,{S:0.3,summary:'A horizontal windmill with feathering sails, seen from above: the arms turn on an upright shaft, and each sail is pivoted on its arm and turned by a cam (or vane) so that it faces the wind square on the side moving downwind and edge-on as it comes back against it.',
  parts:[{id:'a',name:'Four arms on the upright shaft',role:'driver',layer:0,mesh:K.merge(PK.ext({o:K.circle(16,24),h:[Sh.hole(0,0)]},0,PK.TH),...[0,1,2,3].map(k=>PK.ext({o:rotP(armPts([10,0],[170,0],8),k*PI/2),h:[]},0,PK.TH))),pins:[[170,0,1],[0,170,1],[-170,0,1],[0,-170,1]]},{id:'s',name:'Feathering sail',role:'link',qty:4,layer:1,shape:S=>({o:rc(-40,-12,40,12),h:[S.hole(0,0)]})}],
  ground:[[420,260,0,0]],plate:{x0:200,y0:50,x1:640,y1:470},
  pose(g){const a=-g.phi;return{a:[420,260,a],s:[0,1,2,3].map(k=>{const t=a+k*PI/2,P=[420+170*Math.cos(t),260+170*Math.sin(t)];return[P[0],P[1],Math.sin(t)>0?PI/2:0];})};},drive:'Turn the arms: each sail turns square to the wind on one side and edge-on on the other.'});}

/* 487, 489 · paddle wheels; 489 keeps its floats upright: each float has a lever, and rods from an eccentric ring (turning about a
   fixed centre set off by the lever's length) hold every lever parallel. The wheel runs round a fixed hub disk that carries that centre. */
for(const n of [487,489]){const feather=n===489,Cc=[450,250],R=150,e=40,rho=24,Rh=60;
 const wheel=()=>{const m=[PK.ext({o:K.circle(R-30,96),h:[K.circle(R-38,96)]},0,PK.TH)];
   if(feather)m.push(PK.ext({o:K.circle(Rh+12,64),h:[K.circle(Rh+0.8,64)]},0,PK.TH));else m.push(PK.ext({o:K.circle(22,32),h:[Sh.hole(0,0)]},0,PK.TH));
   for(let k=0;k<8;k++){const a=k*PI/4,r0=feather?Rh+6:18;m.push(PK.ext({o:armPts([r0*Math.cos(a),r0*Math.sin(a)],[R*Math.cos(a),R*Math.sin(a)],feather?9:6),h:[]},0,PK.TH));if(!feather)m.push(PK.ext({o:rotP(rc(R-30,-6,R+30,6),a),h:[]},0,PK.TH));}return K.merge(...m);};
 const parts=[{id:'w',name:feather?'Paddle wheel frame (runs round the fixed hub)':'Paddle wheel with fixed floats',role:'driver',layer:0,mesh:wheel(),pins:feather?Array.from({length:8},(_,k)=>[R*Math.cos(k*PI/4),R*Math.sin(k*PI/4),1]):undefined}];
 if(feather)parts.push({id:'p',name:'Float with its lever',role:'link',qty:8,layer:1,mesh:K.merge(PK.ext({o:rc(-11,-32,11,32),h:[Sh.hole(0,0)]},0,PK.TH),PK.ext({o:armPts([0,0],[e,0],11),h:[Sh.hole(0,0)]},0,PK.TH)),pins:[[e,0,3]]},
   {id:'x',name:'Eccentric ring',role:'link',layer:2,shape:S=>({o:K.circle(rho+12,48),h:[S.hole(0,0)]}),pins:Array.from({length:8},(_,k)=>[rho*Math.cos(k*PI/4),rho*Math.sin(k*PI/4),3])},{id:'r',name:'Radius rod',role:'link',qty:8,layer:3,shape:S=>S.bar(R-rho,8)});
 PK.def(n,{S:0.3,up:true,summary:feather?'A feathering paddle wheel: each float is pivoted at the rim and has a short lever. Rods from an eccentric ring, which turns about a fixed centre set off by the lever’s length, hold every lever parallel, so the floats stay upright and enter and leave the water edge-on instead of slapping it.':'A paddle wheel: flat floats fixed on the arms push the water aft as the wheel turns, driving the ship ahead; the floats strike and leave the water at an angle, which wastes some of the power.',
  parts,ground:feather?[[Cc[0]+e,Cc[1],2,2]]:[[Cc[0],Cc[1],0,0]],fixed:feather?[{shape:S=>({o:K.circle(Rh,64,Cc[0],Cc[1]),h:[]}),l1:0}]:[],plate:{x0:260,y0:60,x1:640,y1:440},
  pose(g){const o={w:[Cc[0],Cc[1],g.a]};if(feather){o.p=[];o.r=[];for(let k=0;k<8;k++){const a=g.a+k*PI/4,t=[Cc[0]+R*Math.cos(a),Cc[1]+R*Math.sin(a)];o.p.push([t[0],t[1],0]);o.r.push([Cc[0]+e+rho*Math.cos(a),Cc[1]+rho*Math.sin(a),a]);}o.x=[Cc[0]+e,Cc[1],g.a];}return o;},
  drive:'Turn the wheel: '+(feather?'the floats stay upright all the way round.':'the floats sweep through the water.')});}

/* 488 · screw propeller */
{const zc=U.BT+42,R=36;
 const blade=k=>{const secs=[];for(let i=0;i<=8;i++){const r=6+(R-6)*i/8,w=4+10*Math.sin(PI*Math.min(1,i/8*0.95)),tw=0.9-0.5*i/8;const pts=[[-w/2,-0.9],[w/2,-0.9],[w/2,0.9],[-w/2,0.9]].map(([u,v])=>[u*Math.cos(tw)-v*Math.sin(tw),u*Math.sin(tw)+v*Math.cos(tw)]);secs.push({o:pts.map(([u,v])=>[u,v,r]),h:[]});}return K.xf(K.xf(K.loftS(secs),[0,1,0,0, 0,0,1,0, 1,0,0,0, 0,0,0,1]),M4.Rz(k*TAU/3));};
 PK.defS(488,{summary:'A screw propeller: three twisted blades on a hub at the stern. Each blade is a small part of a screw thread, set at a steeper pitch towards the root; turning it drives water aft and the ship ahead, like a screw working in a nut of water.',cam:{yaw:0.8,pitch:0.25},
  base:()=>[U.plate(-60,-30,30,30),K.box(10,10,U.BT,zc,-50,0),K.xf(K.tubeSolid(4,U.SHB,-55,-10,24),M4.mul(M4.T(0,0,zc),M4.Ry(PI/2)))],
  parts:[{id:'p',name:'Three-bladed propeller on its shaft',role:'driver',mesh:K.xf(K.merge(K.lathe([[0.01,-8],[7,-8],[7,6],[3,12],[0.01,12]],32),...[0,1,2].map(k=>K.xf(blade(0),M4.Rz(k*TAU/3))),K.prism(U.octa(U.SH),[],-60,0)),M4.Ry(PI/2))}],
  pose(phi){return{p:M4.mul(M4.T(0,0,zc),M4.Rx(phi))};},read:(phi)=>`${(phi/TAU).toFixed(2)} turns`,drive:'Turn the shaft: the blades screw through the water.'});}

/* 490 · ship's wheel and tiller ropes */
{const P=[400,110],D=[400,430];
 PK.def(490,{S:0.3,up:true,summary:'A ship’s steering wheel and tiller ropes: the wheel turns a barrel, and the rope wound on it is led round sheaves on either side to the end of the tiller, so turning the wheel draws the tiller over one way or the other.',
  parts:[{id:'t',name:'Tiller (rudder head)',role:'driven',layer:0,shape:S=>({o:armPts([0,0],[0,200],13),h:[S.hole(0,0)]})},{id:'b',name:'Barrel and wheel',role:'driver',layer:0,mesh:K.merge(PK.ext({o:K.circle(30,32),h:[Sh.hole(0,0)]},0,PK.TH),...Array.from({length:8},(_,k)=>PK.ext({o:rotP(armPts([24,0],[60,0],4),k*PI/4),h:[]},0,PK.TH)))},...[0,1,2,3].map(i=>({id:'s'+i,name:'Sheave',role:'small',layer:0,shape:S=>S.disk(14)}))],
  ground:[[P[0],P[1],0,0],[D[0],D[1],0,0],[150,150,0,0],[150,430,0,0],[650,150,0,0],[650,430,0,0]],plate:{x0:120,y0:60,x1:680,y1:500},
  pose(g){return{t:[P[0],P[1],-g.t],b:[D[0],D[1],g.w],s0:[150,150,g.w],s1:[150,430,g.w],s2:[650,150,-g.w],s3:[650,430,-g.w]};},
  ropes(g){const z=PK.zl(0)+PK.TH/2,T=[P[0]+200*Math.sin(g.t),P[1]+200*Math.cos(g.t)];return[{pts:[[T[0],T[1],z],[150,150,z],[150,430,z],[D[0]-30,D[1],z]],r:0.6},{pts:[[T[0],T[1],z],[650,150,z],[650,430,z],[D[0]+30,D[1],z]],r:0.6}];},
  hardware:['A cord from the tiller end round the four sheaves, with a few turns round the barrel.'],drive:'Turn the wheel: the tiller swings over.'});}

/* 491 · capstan with pawls and a ratchet ring */
{const sim=window.MB.SIMS[491],O=[400,270],N=sim.N,sawR=window.MB.sawR;
 PK.def(491,{S:0.25,summary:'A capstan with a pawl and ratchet: a ring of ratchet teeth is fixed round the capstan’s foot and pawls hinged on the drum drop into them, so the capstan can be heaved round one way only and cannot run back under the load if the men let go.',
  parts:[{id:'c',name:'Capstan drum with bars',role:'driver',layer:1,mesh:K.merge(PK.ext({o:K.circle(70,64),h:[Sh.hole(0,0)]},0,PK.TH),...Array.from({length:6},(_,k)=>PK.ext({o:rotP(armPts([60,0],[230,0],8),k*PI/3),h:[]},0,PK.TH))),pins:[PI*0.75,PI*0.25].map(pa=>[190*Math.cos(pa),190*Math.sin(pa),2])},{id:'p',name:'Pawl',role:'link',qty:2,layer:2,shape:S=>({o:armPts([0,0],[44,0],13),h:[S.hole(0,0)]})},{id:'r',name:'Ratchet ring (fixed)',role:'frame',layer:0,shape:S=>S.ratchet(168,N,18,-1,{bore:140})}],
  ground:[[O[0],O[1],0,1]],
  pose(g){return{c:[O[0],O[1],g.a],r:[O[0],O[1],0],p:[PI*0.75,PI*0.25].map(pa=>{const q=g.a+pa,pv=[O[0]+190*Math.cos(q),O[1]+190*Math.sin(q)],rr=(sawR?sawR(pa-0.12,N,150,168):160)+2,tip=[O[0]+rr*Math.cos(q-0.12),O[1]+rr*Math.sin(q-0.12)];return[pv[0],pv[1],Math.atan2(tip[1]-pv[1],tip[0]-pv[0])];})};},
  drive:'Heave the bars round: the pawls click over the ratchet ring.'});}

/* 492 · boat-detaching hook */
{const H=[400,180];
 PK.def(492,{S:0.3,up:true,summary:'A boat-detaching hook: the boat’s ring hangs in a hook pivoted at the end of the fall, held closed by a tripping line. Pulling the line tips the hook and the boat drops free at once, even with the falls still taut.',
  parts:[{id:'h',name:'Pivoted hook',role:'driver',layer:0,shape:S=>({o:[[-13,-13],[13,-13],[13,60],[9,82],[-14,92],[-34,86],[-34,70],[-12,72],[-10,60]],h:[S.hole(0,0)]})},{id:'g',name:'Boat ring',role:'driven',layer:1,shape:S=>({o:K.circle(16,32),h:[K.circle(9,24)]})}],
  ground:[[H[0],H[1],0,0]],plate:{x0:300,y0:120,x1:520,y1:470},
  pose(g){return{h:[H[0],H[1],g.a],g:[H[0]-14,H[1]+80+g.y,0]};},
  ropes(g){const z=PK.zl(0)+2;return[{pts:[[H[0],H[1]-60,z],[H[0],H[1],z]],r:0.8},{pts:[[H[0]+8,H[1]+20,z],[520,H[1]+20,z]],r:0.5}];},drive:'Pull the tripping line: the hook tips and the ring falls free.'});}

/* 493 · lewis */
{const X=400;
 PK.def(493,{S:0.3,up:true,summary:'A lewis for lifting stone: a dovetail hole, wider at the bottom, is cut in the block; two tapered side pieces are put in and a straight middle piece driven between them, locking them against the sides. A bolt through all three takes the shackle, and the harder the pull the tighter they grip.',
  parts:[{id:'s',name:'Stone with dovetail hole',role:'driven',layer:0,shape:S=>({o:[[-160,0],[-20,0],[-36,90],[36,90],[20,0],[160,0],[160,180],[-160,180]],h:[]})},{id:'lw',name:'Left side piece',role:'link',layer:0,shape:S=>({o:[[-8,0],[-8,90],[-36,90],[-20,0]],h:[]})},{id:'rw',name:'Right side piece',role:'link',layer:0,shape:S=>({o:[[8,0],[20,0],[36,90],[8,90]],h:[]})},{id:'m',name:'Middle piece with shackle bolt hole',role:'driver',layer:0,shape:S=>({o:rc(-8,-60,8,90),h:[]})}],
  plate:{x0:200,y0:-40,x1:600,y1:500},
  pose(g){const y=300-g.lift,up=(1-g.ins)*100,um=(1-Math.min(1,Math.max(0,(g.ins-0.5)*2)))*130;return{s:[X,y,0],lw:[X,y-up,0],rw:[X,y-up,0],m:[X,y-um,0]};},
  ropes(g){const z=PK.zl(0)+2,y=300-g.lift;return[{pts:[[X,-40,z],[X,y-60,z]],r:0.8}];},drive:'Drop the side pieces into the hole, then the middle piece, and lift.'});}

/* 494 · stone tongs */
{const X=400,arm=s=>({o:K.hull([...K.circle(13,20,0,0),...K.circle(10,20,-s*110,180)]),h:[Sh.hole(0,0)]}),hand=s=>({o:armPts([0,0],[s*90,-80],10),h:[]});
 const armMesh=s=>K.merge(PK.ext(arm(s),0,PK.TH),PK.ext(hand(s),0,PK.TH),PK.ext({o:K.circle(10,20,s*90,-80),h:[Sh.hole(s*90,-80)]},0,PK.TH));
 PK.def(494,{S:0.3,up:true,summary:'Stone tongs: two bent arms crossed and pinned like scissors, their upper ends hung from a chain by short links. The weight of the stone pulls the links apart at the top, which closes the jaws harder: the heavier the stone, the firmer the grip.',
  parts:[{id:'r',name:'Right-hand arm',role:'driver',layer:0,mesh:armMesh(1)},{id:'l',name:'Left-hand arm',role:'driver',layer:1,mesh:armMesh(-1)},{id:'s',name:'Stone',role:'driven',layer:0,t:2,shape:S=>S.rect(220,150,0,75)}],
  plate:{x0:240,y0:0,x1:560,y1:500},
  pose(g){const y=320-g.lift,P=[X,y-120],open=1-g.sq,d=s=>Math.atan2(180,-s*(110+10*open))-Math.atan2(180,-s*110);return{r:[P[0],P[1],d(1)],l:[P[0],P[1],d(-1)],s:[X,y,0]};},
  ropes(g){const z=PK.zl(0)+2,y=320-g.lift;return[{pts:[[X-90,y-200,z],[X,y-260,z],[X+90,y-200,z]],r:0.6},{pts:[[X,0,z],[X,y-260,z]],r:0.8}];},hardware:['A short bolt or pin through the pivot of the two arms.'],drive:'Lift by the chain: the arms close on the stone.'});}

/* 496 · drafting rollers and throstle spindle */
{const y=200,xs=[180,310,440],sp=[1,1.6,3],S0=[600,360];
 PK.def(496,{S:0.3,up:true,summary:'Drafting rollers: the sliver of cotton passes between three pairs of rollers, each pair turning faster than the one before, so it is drawn out finer; it then goes down to the throstle spindle, whose flyer twists it into thread and winds it on the bobbin.',
  parts:[...[0,1,2].flatMap(k=>[{id:'t'+k,name:`Top roller ${k+1}`,role:k?'driven':'driver',layer:0,shape:S=>S.disk(22)},{id:'b'+k,name:`Bottom roller ${k+1} (fluted)`,role:'driven',layer:0,shape:S=>S.gear(22,12,{add:0.4})}]),{id:'f',name:'Spindle with flyer',role:'driven',layer:0,mesh:K.merge(PK.ext({o:rc(-8,-90,8,110),h:[]},0,PK.TH),PK.ext({o:rc(0,-62,40,-58),h:[]},0,PK.TH),PK.ext({o:(()=>{const o=[];for(let i=0;i<24;i++){const t=i/24*TAU;o.push([30*Math.cos(t),40+50*Math.sin(t)]);}return o;})(),h:[]},0,PK.TH))}],
  ground:xs.flatMap(x=>[[x,y-26,0,0],[x,y+26,0,0]]),plate:{x0:40,y0:120,x1:680,y1:490},
  pose(g){const o={};xs.forEach((x,k)=>{o['t'+k]=[x,y-26,g.phi*sp[k]];o['b'+k]=[x,y+26,-g.phi*sp[k]];});o.f=[S0[0],S0[1],0];return o;},
  ropes(){const z=PK.zl(0)+PK.TH/2;return[{pts:[[60,y,z],[440,y,z],[600,280,z]],r:0.8}];},hardware:['A strand of wool as the sliver.'],drive:'Turn the rollers: each pair runs faster than the last.'});}

/* 497 · centrifugal fan */
{const O=[380,280];
 PK.def(497,{S:0.3,summary:'A centrifugal fan: curved blades on the rotor fling the air outward into a spiral (volute) casing which widens towards the outlet, turning the air’s speed into pressure as it is delivered.',
  parts:[{id:'r',name:'Rotor with curved blades',role:'driver',layer:0,mesh:K.merge(PK.ext({o:K.circle(40,40),h:[Sh.hole(0,0)]},0,PK.TH),...Array.from({length:8},(_,k)=>{const c=[];for(let i=0;i<=10;i++){const t=i/10,r=40+75*t,a=0.45*t*t;c.push([r*Math.cos(a),r*Math.sin(a)]);}const o=[...c.map(([x,y])=>[x,y-3]),...c.reverse().map(([x,y])=>[x,y+3])];return PK.ext({o:rotP(o,k*PI/4),h:[]},0,PK.TH);}))}],
  ground:[[O[0],O[1],0,0]],fixed:[{shape:S=>({o:(()=>{const o=[];for(let i=0;i<=100;i++){const t=-PI/2+i/100*TAU,r=138+50*i/100;o.push([O[0]+r*Math.cos(t),O[1]+r*Math.sin(t)]);}const e=o[o.length-1];o.push([e[0]+220,e[1]],[e[0]+220,e[1]-8]);for(let i=100;i>=0;i--){const t=-PI/2+i/100*TAU,r=130+50*i/100;o.push([O[0]+r*Math.cos(t),O[1]+r*Math.sin(t)]);}return o;})(),h:[]}),l1:0}],plate:{x0:170,y0:70,x1:800,y1:490},
  pose(g){return{r:[O[0],O[1],g.phi]};},drive:'Spin the rotor.'});}

/* 498 · mercury U-tube manometer */
{const xl=300,xr=480,yb=420,base=300;
 const tube=()=>{const o=[],w=13,Rb=(xr-xl)/2,cx=(xl+xr)/2;o.push([xl-w,120],[xl-w,yb]);for(let i=0;i<=20;i++){const t=PI-i/20*PI;o.push([cx+(Rb+w)*Math.cos(t),yb+(Rb+w)*Math.sin(t)]);}o.push([xr+w,90],[xr-w,90]);for(let i=20;i>=0;i--){const t=PI-i/20*PI;o.push([cx+(Rb-w)*Math.cos(t),yb+(Rb-w)*Math.sin(t)]);}o.push([xl+w,120]);return o;};
 const inner=()=>{const o=[],w=9,Rb=(xr-xl)/2,cx=(xl+xr)/2;o.push([xl-w,124],[xl-w,yb]);for(let i=0;i<=20;i++){const t=PI-i/20*PI;o.push([cx+(Rb+w)*Math.cos(t),yb+(Rb+w)*Math.sin(t)]);}o.push([xr+w,94],[xr-w,94]);for(let i=20;i>=0;i--){const t=PI-i/20*PI;o.push([cx+(Rb-w)*Math.cos(t),yb+(Rb-w)*Math.sin(t)]);}o.push([xl+w,124]);return o;};
 PK.def(498,{S:0.3,up:true,summary:'A mercury manometer: a U-tube half full of mercury, one end joined to the vessel whose pressure is wanted, the other open to the air. The pressure pushes the mercury down on its side and up on the other; the difference in level measures it.',
  parts:[{id:'l',name:'Level marker (left limb)',role:'driven',layer:1,shape:S=>S.rect(40,6,0,0)},{id:'r',name:'Level marker (right limb)',role:'driven',layer:1,shape:S=>S.rect(40,6,0,0)}],
  fixed:[{shape:S=>({o:tube(),h:[]}),l1:0},{shape:S=>S.rect(100,40,xl-70,100),l1:0}],plate:{x0:200,y0:60,x1:560,y1:520},
  pose(g){return{l:[xl,base+g.h/2,0],r:[xr,base-g.h/2,0]};},drive:'Slide the markers to read the difference of level.'});}

/* 499, 500 · dial gauges: Bourdon tube and diaphragm */
for(const n of [499,500]){const bour=n===499,D=bour?[400,250]:[400,230],R=bour?210:150;
 PK.def(n,{S:0.3,summary:bour?'The Bourdon gauge: a flattened tube bent into a curve, closed at its free end, straightens a little as the pressure inside rises; the movement of its end is magnified by a toothed sector and pinion that turn the needle round the dial.':'A diaphragm pressure gauge: the pressure bows a thin corrugated diaphragm, and its small movement is magnified by a rack and pinion (or a lever) to turn the needle round the dial.',params:window.MB.SIMS[n].params,
  parts:[{id:'n',name:'Needle with pinion',role:'driven',layer:1,mesh:K.merge(PK.ext({o:K.hull([...K.circle(8,20),...K.circle(3,12,R*0.82,0),...K.circle(5,12,-24,0)]),h:[Sh.hole(0,0)]},0,PK.TH),PK.ext({o:Sh.gearOutline(16,10),h:[Sh.hole(0,0)]},-PK.TH-PK.GAP,-PK.GAP))}],
  ground:[[D[0],D[1],1,1]],
  fixed:[{shape:S=>({o:K.circle(R,96,D[0],D[1]),h:[K.circle(R-10,96,D[0],D[1])]}),l1:0},...Array.from({length:11},(_,k)=>{const a=PI*0.75+k*PI*1.5/10;return{shape:S=>({o:rotP(rc(R-30,-2,R-12,2),a,D),h:[]}),l1:0};}),bour?{shape:S=>({o:(()=>{const o=[],c=[D[0]+20,D[1]+150];for(let i=0;i<=30;i++){const t=PI*0.5+i/30*PI*1.35;o.push([D[0]+120*Math.cos(t)*1,D[1]+120*Math.sin(t)]);}for(let i=30;i>=0;i--){const t=PI*0.5+i/30*PI*1.35;o.push([D[0]+108*Math.cos(t),D[1]+108*Math.sin(t)]);}return o;})(),h:[]}),l1:0}:{shape:S=>S.rect(160,20,D[0],D[1]+170),l1:0}],
  pose(g){const f=bour?g.p/10:g.p/100;return{n:[D[0],D[1],PI*0.75+f*PI*1.5]};},drive:'Turn the needle round the dial.'});}

/* 501 · mercury barometer */
{const X=400,yb=440,hy=mm=>yb-(100+(mm-700)*3);
 PK.def(501,{S:0.3,up:true,summary:'A mercury barometer: a glass tube about 80 cm long, sealed at the top, filled with mercury and upended in a cistern. The mercury falls until the weight of the column, about 760 mm, balances the pressure of the air on the cistern, with a vacuum above it; as the air pressure changes, the column rises and falls.',
  parts:[{id:'m',name:'Column marker (vernier)',role:'driven',layer:1,shape:S=>S.rect(60,6,10,0)}],
  fixed:[{shape:S=>({o:rc(X-16,40,X+16,yb),h:[rc(X-10,46,X+10,yb)]}),l1:0},{shape:S=>({o:rc(X-50,yb,X+50,yb+30),h:[]}),l1:0},{shape:S=>({o:rc(X+40,40,X+48,yb),h:[]}),l1:0}],plate:{x0:320,y0:20,x1:500,y1:490},
  pose(g){return{m:[X+44,hy(g.h),0]};},drive:'Set the marker at the top of the column.'});}

/* 502 · epicyclic train: a planet carried round a fixed sun */
{const O=[400,260],Rs=80,rp=40,d=120;
 PK.def(502,{S:0.3,summary:'An epicyclic train: a planet wheel carried round a fixed central wheel by an arm. Rolling round the fixed wheel, the planet turns on its own axle as well as going round; with a wheel half the size of the fixed one it makes three turns for each turn of the arm.',
  parts:[{id:'a',name:'Arm (driver)',role:'driver',layer:1,shape:S=>S.bar(d,16),bosses:[[-30,0,10,3.5]]},{id:'p',name:'Planet wheel, 16 teeth, with axle',role:'driven',layer:0,shape:S=>S.gear(rp,16),bosses:[BOSS]}],
  ground:[[O[0],O[1],0,1]],fixed:[{shape:S=>({o:Sh.gearOutline(Rs,32).map(([x,y])=>{const c=Math.cos(PI/32),s=Math.sin(PI/32);return[O[0]+x*c-y*s,O[1]+x*s+y*c];}),h:[]}),l1:0}],
  pose(g){return{a:[O[0],O[1],g.arm],p:[O[0]+d*Math.cos(g.arm),O[1]+d*Math.sin(g.arm),g.pl+PI]};},drive:'Turn the arm: the planet rolls round the fixed wheel, turning three times per round.'});}

/* 504 · Ferguson's paradox */
{const O=[400,260],m=6,S0=0.3;
 PK.def(504,{S:S0,summary:'Ferguson’s paradox: a fixed wheel of 20 teeth, an idler on the arm, and three thin wheels of 19, 20 and 21 teeth side by side on one axle at the end of the arm, all driven by the same idler. As the arm goes round, the 20-tooth wheel keeps its direction, the 21 turns slowly the same way as the arm and the 19 slowly the other way, though all three are driven alike.',
  parts:[{id:'arm',name:'Arm',role:'driver',layer:3,shape:S=>({o:armPts([0,0],[180,0],16),h:[S.hole(0,0),S.hole(90,0),S.hole(180,0)]}),bosses:[[-20,0,10,3.5]]},
   {id:'i',name:'Idler, 10 teeth, three layers deep',role:'link',layer:0,t:3,mesh:K.merge(PK.ext(Sh.gear(30,10),0,3*PK.TH+2*PK.GAP),K.cyl(PK.PINR,3*PK.TH+2*PK.GAP,3*PK.TH+2*PK.GAP+PK.GAP+PK.TH-0.6,20))},
   {id:'w19',name:'Wheel, 19 teeth (with axle for the others)',role:'driven',layer:0,mesh:K.merge(PK.ext({o:Sh.gearOutline(60,19),h:[]},0,PK.TH),PK.ext({o:armPts([0,0],[0,-44],4),h:[]},PK.TH,PK.TH+0.6),K.cyl(PK.PINR,PK.TH,3*PK.TH+3*PK.GAP+PK.TH-0.6,20))},
   {id:'w20',name:'Wheel, 20 teeth',role:'driven',layer:1,shape:S=>({o:Sh.gearOutline(60,20),h:[S.hole(0,0)]}),bosses:[[0,-44,0.6,3]]},
   {id:'w21',name:'Wheel, 21 teeth',role:'driven',layer:2,shape:S=>({o:Sh.gearOutline(60,21),h:[S.hole(0,0)]}),bosses:[[0,-44,0.6,3]]}],
  ground:[[O[0],O[1],0,3]],fixed:[{shape:S=>({o:Sh.gearOutline(60,20).map(([x,y])=>{const c=Math.cos(PI/20),s=Math.sin(PI/20);return[O[0]+x*c-y*s,O[1]+x*s+y*c];}),h:[]}),l1:0}],
  pose(g){const I=[O[0]+90*Math.cos(g.a),O[1]+90*Math.sin(g.a)],Q=[O[0]+180*Math.cos(g.a),O[1]+180*Math.sin(g.a)];return{arm:[O[0],O[1],g.a],i:[I[0],I[1],-g.a*3],w19:[Q[0],Q[1],g.w19],w20:[Q[0],Q[1],g.w20],w21:[Q[0],Q[1],g.w21]};},
  drive:'Turn the arm and watch the marks on the three wheels: one stays, one creeps forward, one creeps back.'});}

/* 505 · planetary gear with annular wheel: sun 24, planets 12, ring 48 */
{const O=[400,265];
 PK.def(505,{S:0.3,summary:'A planetary gear: a sun wheel, three planets on a carrier, and an annular (internal) ring round them all. Hold any one member and drive another, and the third turns at a fixed ratio: ring held, the carrier turns at a third of the sun’s speed; sun held, at two-thirds of the ring’s; carrier held, the ring turns backwards at half the sun’s speed.',params:window.MB.SIMS[505].params,
  parts:[{id:'s',name:'Sun, 24 teeth',role:'driver',layer:0,shape:S=>S.gear(60,24),bosses:[[0,0,0.01,0.01]].slice(0,0)},{id:'p',name:'Planet, 12 teeth, with axle',role:'link',qty:3,layer:0,shape:S=>S.gear(30,12),bosses:[BOSS]},{id:'r',name:'Annular ring, 48 teeth',role:'driven',layer:0,shape:S=>S.ring(120,48,146)},{id:'c',name:'Carrier',role:'driven',layer:1,shape:S=>({o:K.hull([0,1,2].flatMap(k=>K.circle(16,20,90*Math.cos(k*TAU/3),90*Math.sin(k*TAU/3)))),h:[S.hole(0,0),...[0,1,2].map(k=>S.hole(90*Math.cos(k*TAU/3),90*Math.sin(k*TAU/3)))]})}],
  ground:[[O[0],O[1],0,1]],fixed:[{shape:S=>({o:K.circle(160,96,O[0],O[1]),h:[K.circle(147,96,O[0],O[1])]}),l1:0}],
  pose(g){const ts=TAU/24,tp=TAU/12,tr=TAU/48;return{s:[O[0],O[1],g.s],r:[O[0],O[1],g.r+tr/2],c:[O[0],O[1],g.c],p:[0,1,2].map(k=>{const b=g.c+k*TAU/3;return[O[0]+90*Math.cos(b),O[1]+90*Math.sin(b),g.p+tp/2];})};},
  drive:'Hold one member and turn another: the third follows at a fixed ratio.'});}

/* 507 · slow motion: fixed 41, output 40, planet 39 + 40 */
{const sim=window.MB.SIMS[507],O=[400,265],d=sim.d,ZF=sim.ZF,Za=sim.Za,Zb=sim.Zb,ZW=sim.ZW,m=2*d/(ZF+Za),S0=0.4;
 PK.def(507,{S:S0,summary:'An epicyclic train for very slow motion: a fixed wheel of 41 teeth and an output wheel of 40 lie on one axis, and the arm carries a compound planet of 39 and 40 teeth meshing them both. Because the two pairs differ by a single tooth, each turn of the arm moves the output wheel back by only 2/39 of a turn; with larger wheels differing by one tooth the motion can be made as slow as you like.',
  parts:[{id:'w',name:'Output wheel, 40 teeth, with pointer',role:'driven',layer:1,shape:S=>({o:Sh.gearOutline(m*ZW/2,ZW),h:[S.hole(0,0)]}),bosses:[[0,-50,1,3]]},{id:'p',name:'Compound planet, 39 and 40 teeth (one piece)',role:'link',layer:0,t:2,mesh:K.merge(PK.ext({o:Sh.gearOutline(m*Za/2,Za),h:[]},0,PK.TH),PK.ext({o:Sh.gearOutline(m*Zb/2,Zb),h:[]},PK.TH+PK.GAP,2*PK.TH+PK.GAP),PK.ext({o:K.circle(14,24),h:[]},PK.TH,PK.TH+PK.GAP),K.cyl(PK.PINR,2*PK.TH+PK.GAP,3*PK.TH+2*PK.GAP-0.6+PK.GAP,20))},{id:'a',name:'Arm (driver)',role:'driver',layer:2,shape:S=>S.bar(d,16),bosses:[[-30,0,10,3.5]]}],
  ground:[[O[0],O[1],0,2]],fixed:[{shape:S=>({o:Sh.gearOutline(m*ZF/2,ZF).map(([x,y])=>[O[0]+x,O[1]+y]),h:[]}),l1:0}],
  pose(g){const P=[O[0]+d*Math.cos(g.arm),O[1]+d*Math.sin(g.arm)];return{w:[O[0],O[1],g.slow],p:[P[0],P[1],g.pa],a:[O[0],O[1],g.arm]};},
  drive:'Turn the arm many times: the output wheel’s pointer creeps backwards.'});}

})();
