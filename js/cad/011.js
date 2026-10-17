(function(){const K=window.CAD.K,PK=window.PK,M4=K.M4,PI=Math.PI,TAU=2*PI;const mod=(a,n)=>((a%n)+n)%n;const ropeThru=(...a)=>window.MB.ropeThru(...a);
/* ===== printable models 11–50 ===== */
const {Sh}=PK;
PK.def(24,{S:0.3,summary:'A 24-tooth driving gear meshes with a 36-tooth driven gear on printed pins. Turn the knob: the blue gear turns the other way at two thirds of the speed.',
  parts:[{id:'a',name:'Driving gear, 24 teeth',role:'driver',layer:0,shape:S=>S.gear(60,24),bosses:[[38,0,14,3.5]]},
         {id:'b',name:'Driven gear, 36 teeth',role:'driven',layer:0,shape:S=>S.gear(90,36)}],
  ground:[[250,270,0,0],[400,270,0,0]],
  pose:g=>({a:[250,270,g.phi],b:[400,270,g.a2+PI+PI/36]}),drive:'Turn the knob on the orange gear.'});

/* ---------- 12–22 pulley systems: an upright board, fixed sheaves on printed pins, movable blocks hanging in real cord ---------- */
function pulleyModel(n,summary){const R=PK.runner(n);if(!R)return;const g0=R.at(0),L0=g0.L;const S=0.3;
  const R1=R.at(PI);const L1=R1.L;R.at(0);
  const keys=Object.keys(L0.sh),fixed=keys.filter(k=>L0.sh[k].fixed),mov=keys.filter(k=>!L0.sh[k].fixed);
  /* group movable sheaves into blocks: same displacement between two poses */
  const disp=k=>[L1.sh[k].c[0]-L0.sh[k].c[0],L1.sh[k].c[1]-L0.sh[k].c[1]];const blocks=[];
  for(const k of mov){const d=disp(k);let b=blocks.find(b=>Math.hypot(b.d[0]-d[0],b.d[1]-d[1])<0.5);if(!b)blocks.push(b={d,ks:[]});b.ks.push(k);}
  const stepped=n===15;const parts=[],ground=[];
  const shKey=k=>stepped?k[0]+'0':k;
  const done=new Set();
  for(const k of fixed){const s=L0.sh[k];const kk=shKey(k);if(done.has(kk))continue;done.add(kk);ground.push([s.c[0],s.c[1],1,2]);
    parts.push({id:'s'+kk,name:stepped?'Upper stepped sheave':'Fixed sheave',role:'link',layer:1,mesh:stepped?PK.Mesh.stepped(['U0','U1','U2'].map(q=>L0.sh[q].r*S),3.2):PK.Mesh.pulley(s.r*S)});}
  blocks.forEach((b,i)=>{const c0=L0.sh[b.ks[0]].c;const circles=b.ks.map(k=>{const c=L0.sh[k].c;return[c[0]-c0[0],c[1]-c0[1],L0.sh[k].r+16];});
    circles.push([0,L0.sh[b.ks[0]].r+30,10]);
    const pins=[...new Set(b.ks.map(shKey))].map(kk=>{const c=L0.sh[kk].c;return[c[0]-c0[0],c[1]-c0[1],2];});
    parts.push({id:'b'+i,name:'Movable block plate',role:'driven',layer:0,shape:Sh=>Sh.lever(circles,[[0,L0.sh[b.ks[0]].r+30,4]]),pins});
    for(const kk of new Set(b.ks.map(shKey)))parts.push({id:'s'+kk,name:stepped?'Lower stepped sheave':'Movable sheave',role:'driven',layer:1,mesh:stepped?PK.Mesh.stepped(['L0','L1','L2'].map(q=>L0.sh[q].r*S),3.2):PK.Mesh.pulley(L0.sh[kk].r*S)});});
  const ld=L0.load;parts.push({id:'load',name:'Load (weight box)',role:'driven',layer:0,mesh:PK.Mesh.box(ld[2]*S,ld[3]*S,14),note:'fill with coins or nuts for weight; tie it to the lowest block'});
  parts.push({id:'grip',name:'Pull grip',role:'driver',layer:1,mesh:K.xf(PK.Mesh.cylZ(5,16),M4.T(0,0,0)),note:'tie to the free end of the cord'});
  const bx=L0.sh[keys[0]]?[]:[];
  PK.def(n,{S,up:true,summary,ground,margin:14,
    fixed:[{shape:Sh=>Sh.rect(Math.max(220,(SIMS_W(n)))*1,14,400,39),l1:1}],
    parts,
    pose(g,sim){const L=g.L,o={};for(const k of keys){const kk=shKey(k);if(o['s'+kk])continue;const s=L.sh[kk];o['s'+kk]=[s.c[0],s.c[1],(sim.rot&&sim.rot[kk])||0];}
      blocks.forEach((b,i)=>{const c=L.sh[b.ks[0]].c;o['b'+i]=[c[0],c[1],0];});
      const l=L.load;o.load=[l[0],l[1]+l[3]/2,0];const gp=L.grip;o.grip=gp[2]?[gp[0]+12,gp[1],0]:[gp[0],gp[1]+12,0];return o;},
    ropes(g){return g.L.ropes.map(rp=>({pts:rp._R.pts,z:PK.zl(1)+3.5,r:1.1}));},
    read(g){return`pulled ${(g.e*S).toFixed(0)} mm · load up ${(g.d*S).toFixed(1)} mm · advantage ${R.sim.reads()[0][1]}`;},
    hardware:['About 2 m of 1.5–2 mm braided cord (kite line works well).','A few coins or nuts to put in the load box.','Two screws or a strip of double-sided tape to hang the board on a wall or shelf edge (optional).'],
    steps:['Print every part flat. The board prints with its pins and top beam in place.','Fit each fixed sheave on its pin and cap it. Fit the movable sheaves on the pins of their block plates and cap them.','Glue the two stands to the back of the board so it stands upright.',
      'Tie the cord where the drawing shows its fixed end, then lead it round the sheaves exactly as in the animation. Tie the load box under the lowest block and the grip to the free end.','Pull the grip: the load rises by the pull divided by the mechanical advantage.']});}
function SIMS_W(){return 260;}
pulleyModel(12,'A single fixed sheave on an upright board. The cord runs from the load, over the sheave, down to the grip: pulling down lifts the load by the same amount.');
pulleyModel(13,'One fixed and one movable sheave. The cord is tied to the top beam, runs under the movable block and over the fixed sheave, so two strands share the load.');
pulleyModel(14,'Two double blocks. The cord runs four times between them, so the lower block rises a quarter as far as you pull, with a quarter of the force.');
pulleyModel(15,'White’s tackle: each block is one stepped sheave whose grooves are graded so that every groove matches the speed of its own strand. Six strands carry the load.');
pulleyModel(16,'A Spanish barton: the second sheave hangs from the first cord, so the two cords together give a power of three.');
pulleyModel(17,'A double Spanish barton: a sheave on the load and a hanging sheave combine to give a power of five.');
pulleyModel(18,'One movable sheave under two fixed ones. The lower fixed sheave turns the pull sideways, so you can haul horizontally.');
pulleyModel(19,'Three movable sheaves, each hanging in its own cord tied to the beam. Every sheave doubles the effect: 2 × 2 × 2 = 8.');
pulleyModel(20,'Two movable sheaves, each in its own cord, pulled straight up: an effect of 4.');
pulleyModel(21,'The same idea mirrored: three movable sheaves, each cord tied to the beam, the last led over a fixed sheave. Effect 8.');
pulleyModel(22,'Four movable sheaves in a staircase, each in its own cord. Effect 2⁴ = 16, so the load rises one sixteenth as far as you pull.');

/* ---------- 3, 4, 11, 243 belts between shafts at right angles (built from the simulation's own 3D layout) ---------- */
const beltGeo=sim=>{sim.update(0);const G=sim.geo;return{A:G.A,belt:G.belt,pulleys:G.pulleys.map((b,i)=>({K:b.K,ang:b.ang,guide:b.f===undefined||(i>0&&G.pulleys.length===4&&(i===1||i===2)),name:i===0?'Driving pulley':((G.pulleys.length===4&&(i===1||i===2))?'Guide pulley':'Driven pulley')}))};};
const beltHW=['A round rubber belt or O-ring cord about 3 mm thick (length shown on the Download readme), or a rubber band.'];
PK.def3(3,{geo:beltGeo,summary:'The driving pulley stands on a level axle; the driven pulley lies flat below and behind it. Two guide pulleys turn each strand from vertical to level, so every strand arrives in the plane of the pulley it runs onto.',hardware:beltHW,
  steps:['Print the base, pulleys, brackets and caps.','Glue each bracket upright on the base where the Assembled view shows it, pin pointing toward its pulley.','Fit every pulley on its pin and press on a cap.','Lead a rubber belt down from the driving pulley, round a guide, onto the flat pulley, back round the other guide and up again. Turn the top pulley.']});
PK.def3(4,{geo:beltGeo,summary:'A quarter-twist belt with no guides: the flat pulley sits level with the top of the upright one, and its edge just touches the upright pulley’s plane, so each strand runs on in the right plane.',hardware:beltHW,
  steps:['Print the base, both pulleys, the bracket and the caps.','Glue the bracket upright on the base. Fit the pulleys and caps.','Put the belt on with a quarter twist and turn the upright pulley in the direction shown. Run backwards, the belt climbs off: this drive only works one way.']});
PK.def3(11,{geo:beltGeo,summary:'Another quarter-twist layout: a larger flat pulley on the far side of the upright one. The same rule holds: each strand must arrive in the plane of the pulley it runs onto.',hardware:beltHW,
  steps:['Print the base, pulleys, bracket and caps; glue the bracket upright.','Fit the pulleys and caps, put on the belt with a quarter twist and turn the upright pulley.']});
PK.def3(243,{geo:beltGeo,summary:'One upright driving pulley on a level shaft drives two flat pulleys on upright shafts with a single belt. Both flat pulleys sit level with the top of the driver; the second one touches the driver’s plane where the belt leaves for home.',hardware:beltHW,
  steps:['Print the base, pulleys, bracket and caps; glue the bracket upright.','Fit the pulleys and caps, lead the belt from the top of the driver round both flat pulleys and back under the driver, then turn it.']});

/* ---------- 23 weighted belt tensioner ---------- */
PK.def(23,{S:0.3,up:true,summary:'Two pulleys on an upright board, the belt pulled down by a jockey pulley on a sliding block. A weight hangs from the block, so the belt tension stays the same however much the belt stretches.',
  parts:[{id:'a',name:'Driving pulley',role:'driver',layer:1,mesh:PK.Mesh.pulley(70*0.3,8)},{id:'b',name:'Driven pulley',role:'driven',layer:1,mesh:PK.Mesh.pulley(70*0.3,8)},
    {id:'blk',name:'Sliding block',role:'link',layer:0,shape:S=>S.rect(44,60,0,20,[]),pins:[[0,0,2]]},{id:'i',name:'Jockey pulley',role:'link',layer:1,mesh:PK.Mesh.pulley(24*0.3,8)},
    {id:'w',name:'Weight box',role:'driven',layer:0,mesh:PK.Mesh.box(60*0.3,40*0.3,14),note:'fill with nuts or coins'}],
  ground:[[230,200,1,2],[570,200,1,2]],
  fixed:[{shape:S=>S.rect(14,170,400-29,345),l1:0},{shape:S=>S.rect(14,170,400+29,345),l1:0}],
  pose(g,sim){const I=[400,330+g.iy];return{a:[230,200,g.phi],b:[570,200,sim.a2],blk:[I[0],I[1],0],i:[I[0],I[1],-g.phi*3],w:[I[0],I[1]+80,0]};},
  ropes(g){const I=[400,330+g.iy];const R=ropeThru([{c:[400,130],r:0},{c:[570,200],r:70,s:1},{c:I,r:24,s:-1},{c:[230,200],r:70,s:1},{c:[400,130],r:0}]);return[{pts:R.pts,z:PK.zl(1)+4,r:1.5,closed:true}];},
  hardware:['A rubber belt or O-ring cord about 3 mm thick.','Nuts or coins for the weight box.'],
  steps:['Print the board (with its two guide rails), the pulleys, the sliding block and the weight box.','Fit the pulleys on the board pins and the jockey pulley on the block pin; cap them all.','Drop the block between the rails, hang the weight box from it and loop the belt over the big pulleys and under the jockey pulley.','Turn the left pulley: the weight keeps the belt taut.']});

})();
