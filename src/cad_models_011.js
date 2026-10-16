/* ===== printable models 11–50 ===== */
const {Sh}=PK;
PK.def(24,{S:0.3,summary:'A 24-tooth driving gear meshes with a 36-tooth driven gear on printed pins. Turn the knob: the blue gear turns the other way at two thirds of the speed.',
  parts:[{id:'a',name:'Driving gear, 24 teeth',role:'driver',layer:0,shape:S=>S.gear(60,24),bosses:[[38,0,14,3.5]]},
         {id:'b',name:'Driven gear, 36 teeth',role:'driven',layer:0,shape:S=>S.gear(90,36)}],
  ground:[[250,270,0,0],[400,270,0,0]],
  pose:g=>({a:[250,270,g.phi],b:[400,270,g.a2+PI+PI/36]}),drive:'Turn the knob on the orange gear.'});
