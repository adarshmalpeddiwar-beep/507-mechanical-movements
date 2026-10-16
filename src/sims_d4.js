/* ================= audit pass · gears drawn as shaded solids (25, 26, 29, 40–44, 50) ================= */
const CAMG={yaw:-0.62,pitch:0.42,sc:1,cx:400,cy:270};
function solidSim(num,o){return reg(Object.assign({num,params:o.params||[],outLabel:o.outLabel||'Driven gear, turns',
  update(phi){this.g={phi};},output(){return o.out(this.g.phi,this.P);},
  draw(){const R=R3(Object.assign({},CAMG,o.cam||{}));o.scene(R,this.g.phi,this.P,this);R.draw();if(o.note)label(o.note,400,505,'center');if(o.labels)o.labels(R.P,this.g.phi,this.P);}},o.extra||{}));}
/* 25 bevel gears for shafts at right angles */
solidSim(25,{note:'BEVEL GEARS · the pitch cones share one apex where the shafts meet',params:[{id:'z',label:'Driven teeth',min:16,max:40,step:4,value:28,fmt:v=>`${v} (driver 20)`}],
  out:(phi,P)=>-phi*20/P.z/TAU,cam:{cx:380,cy:250,yaw:-0.7,pitch:0.45},
  scene(R,phi,P){const Z1=20,Z2=P.z,m=6,R1=m*Z1/2,R2=m*Z2/2,d1=Math.atan2(Z1,Z2),d2=PI/2-d1,O=[0,0,0];
    bevel3(R,O,[0,0,-1],[1,0,0],R1,Z1,d1,26,phi,C['brass-fill']);bevel3(R,O,[1,0,0],[0,0,-1],R2,Z2,d2,26,-phi*Z1/Z2+PI/Z2,C['steel-fill']);
    const L1=R1/Math.tan(d1),L2=R2/Math.tan(d2);rod3(R,[0,0,-L1-10],[0,0,-L1-170],7,C.part);rod3(R,[L2+10,0,0],[L2+190,0,0],7,C.part);},
  labels(P){const a=P([0,0,-200]),b=P([300,0,0]);label('DRIVER',a[0]+14,a[1]);label('DRIVEN',b[0]-30,b[1]+22);},
  extra:{reads(v){return[['Ratio',`20 : ${this.P.z}`],['Shaft angle','90°'],['Driven',rpmOf(Math.abs(v))]];}}});
/* 26 crown wheel and pinion */
solidSim(26,{note:'CROWN WHEEL · teeth stand on the face of the wheel; the spur pinion meshes with them at the rim',outLabel:'Crown wheel, turns',
  out:phi=>phi*12/48/TAU,cam:{cx:400,cy:300,yaw:-0.5,pitch:0.55},
  scene(R,phi){const Zc=48,Zp=12,Rc=150,m=2*PI*Rc/Zc/PI,Rp=m*Zp/2,ac=phi*Zp/Zc,H=18,th=14;
    const F=fr3([0,0,0],[1,0,0],[0,1,0]);prism3(R,F,ringPts(Rc+22,64),-10,0,C['steel-fill'],{edge:false});prism3(R,F,ringPts(Rc-26,48),-10,0.5,C['steel-fill'],{caps:true});
    for(let k=0;k<Zc;k++){const t=ac+k*TAU/Zc,hw=PI*m/4;/* trapezoid tooth, radial prism */const c=Math.cos(t),s=Math.sin(t),tx=[-s,c,0],rad=[c,s,0];
      const q=(r,x,z)=>[rad[0]*r+tx[0]*x,rad[1]*r+tx[1]*x,z];const prof=[[-hw-0.364*H*0.5,0],[hw+0.364*H*0.5,0],[hw-0.364*H*0.5,H],[-hw+0.364*H*0.5,H]];
      R.loft(prof.map(p=>q(Rc-22,p[0],p[1])),prof.map(p=>q(Rc+20,p[0],p[1])),C['steel-fill'],{edge:false});}
    const Fp=fr3([Rc,0,H/2+Rp],[0,0,-1],[0,1,0]);gear3(R,Fp,Rp,Zp,th*2,phi+PI/Zp,C['brass-fill']);rod3(R,[Rc-th-6,0,H/2+Rp],[Rc-th-200,0,H/2+Rp],6,C.part);rod3(R,[0,0,-12],[0,0,-140],8,C.part);},
  extra:{reads(v){return[['Ratio','12 : 48'],['Shafts','at right angles'],['Crown wheel',rpmOf(Math.abs(v))]];}}});
/* 29 spiral (scroll) on a disk face driving a spur wheel one tooth per turn */
solidSim(29,{note:'SPIRAL ON THE DISK FACE · each turn of the disk pushes the wheel on by one tooth',outLabel:'Wheel, turns',
  out:phi=>phi/18/TAU,cam:{cx:380,cy:300,yaw:-0.45,pitch:0.62},
  scene(R,phi){const Zw=18,p=26,Rw=p*Zw/(2*PI),r0=40,turns=5,Rd=r0+p*turns+14,rc=r0+p*3.5;
    const F=fr3([0,0,0],[1,0,0],[0,1,0]);prism3(R,F,ringPts(Rd,72),-16,0,C['brass-fill']);
    /* raised spiral thread, drawn as short ribbon faces */const N=turns*70,hw=p*0.24,h=9;
    for(let i=0;i<N;i++){const s0=i/N*turns*TAU,s1=(i+1)/N*turns*TAU,P0=s=>{const r=r0+p*s/TAU,t=s+phi;return[r,t];};
      const [ra,ta]=P0(s0),[rb,tb]=P0(s1);const pt=(r,t,z)=>[r*Math.cos(t),r*Math.sin(t),z];
      R.face([pt(ra-hw,ta,h),pt(ra+hw,ta,h),pt(rb+hw,tb,h),pt(rb-hw,tb,h)],C['brass-fill'],{edge:false});R.face([pt(ra+hw,ta,0),pt(rb+hw,tb,0),pt(rb+hw,tb,h),pt(ra+hw,ta,h)],shade(C['brass-fill'],0.85),{});R.face([pt(ra-hw,ta,0),pt(rb-hw,tb,0),pt(rb-hw,tb,h),pt(ra-hw,ta,h)],shade(C['brass-fill'],0.85),{});}
    const Fw=fr3([rc,0,h*0.5+Rw],[0,0,-1],[-1,0,0]);gear3(R,Fw,Rw,Zw,16,phi/Zw,C['steel-fill']);rod3(R,[rc,9,h*0.5+Rw],[rc,170,h*0.5+Rw],6,C.part);rod3(R,[0,0,-16],[0,0,-150],8,C.part);},
  extra:{reads(v){return[['Ratio','18 : 1 (one tooth per turn)'],['Shafts','at right angles'],['Wheel',rpmOf(Math.abs(v))]];}}});
/* 40 oblique (helical) teeth, 41 V-shaped (herringbone) teeth */
function helicalPair(num,herring,note){solidSim(num,{note,cam:{cx:400,cy:260,yaw:-0.35,pitch:0.62},out:phi=>-phi*16/24/TAU,
  scene(R,phi){const m=7,Z1=16,Z2=24,R1=m*Z1/2,R2=m*Z2/2,w=46,beta=0.45,t1=w*Math.tan(beta)/R1,t2=w*Math.tan(beta)/R2;
    const F1=fr3([-R2*0.6,0,0],[1,0,0],[0,1,0]),F2=fr3([-R2*0.6+R1+R2,0,0],[1,0,0],[0,1,0]);
    gear3(R,F1,R1,Z1,w,phi,C['brass-fill'],{twist:herring?t1:t1,herring,seg:herring?6:5});gear3(R,F2,R2,Z2,w,-phi*Z1/Z2+PI+PI/Z2,C['steel-fill'],{twist:herring?-t2:-t2,herring,seg:herring?6:5});
    rod3(R,F1.at(0,0,w/2),F1.at(0,0,w/2+70),6,C.part);rod3(R,F2.at(0,0,w/2),F2.at(0,0,w/2+70),7,C.part);},
  extra:{reads(v){return[['Ratio','16 : 24'],['Teeth',herring?'V-shaped (herringbone): the side thrusts cancel':'oblique (helical): several teeth always in contact'],['Driven',rpmOf(Math.abs(v))]];}}});}
helicalPair(40,false,'OBLIQUE TEETH · each tooth comes into contact gradually, so the drive runs smoothly');
helicalPair(41,true,'V-SHAPED TEETH · smooth like oblique teeth, with no end thrust on the shafts');
/* 42 bevel gears for shafts at an oblique angle */
solidSim(42,{note:'ANGLE BEVELS · shafts meet at 60°; the pitch cones still share one apex',cam:{cx:360,cy:230,yaw:-0.75,pitch:0.4},out:phi=>-phi*18/27/TAU,
  scene(R,phi){const Z1=18,Z2=27,m=6,R1=m*Z1/2,R2=m*Z2/2,S=PI/3,d1=Math.atan2(Math.sin(S),Z2/Z1+Math.cos(S)),d2=S-d1;
    const n1=[0,0,-1],n2=[Math.sin(S),0,-Math.cos(S)];const c1=v3.norm(v3.add(n1,n2));
    bevel3(R,[0,0,0],n1,[1,0,0],R1,Z1,d1,24,phi,C['brass-fill']);bevel3(R,[0,0,0],n2,[-Math.cos(S),0,-Math.sin(S)].map(v=>-v),R2,Z2,d2,24,-phi*Z1/Z2+PI/Z2,C['steel-fill']);
    const L1=R1/Math.tan(d1),L2=R2/Math.tan(d2);rod3(R,v3.mul(n1,L1+12),v3.mul(n1,L1+160),7,C.part);rod3(R,v3.mul(n2,L2+12),v3.mul(n2,L2+170),7,C.part);},
  extra:{reads(v){return[['Shaft angle','60°'],['Ratio','18 : 27'],['Driven',rpmOf(Math.abs(v))]];}}});
/* 43 skew (crossed oblique-toothed) gears for shafts that do not meet */
solidSim(43,{note:'SKEW GEARS · oblique teeth let gears drive between shafts that cross without meeting',cam:{cx:400,cy:270,yaw:-0.55,pitch:0.5},out:phi=>-phi*14/20/TAU,
  scene(R,phi){const m=7,Z1=14,Z2=20,R1=m*Z1/2/Math.cos(PI/4),R2=m*Z2/2/Math.cos(PI/4),w=34;
    const F1=fr3([0,0,0],[1,0,0],[0,1,0]),F2=fr3([0,R1+R2,0],[0,0,1],[0,1,0]);/* second axis along x */
    gear3(R,F1,R1,Z1,w,phi,C['brass-fill'],{twist:w/R1,seg:5});gear3(R,F2,R2,Z2,w,-phi*Z1/Z2+PI/Z2,C['steel-fill'],{twist:w/R2,seg:5});
    rod3(R,F1.at(0,0,w/2),F1.at(0,0,w/2+80),6,C.part);rod3(R,F1.at(0,0,-w/2),F1.at(0,0,-w/2-60),6,C.part);rod3(R,F2.at(0,0,w/2),F2.at(0,0,w/2+90),7,C.part);rod3(R,F2.at(0,0,-w/2),F2.at(0,0,-w/2-90),7,C.part);},
  extra:{reads(v){return[['Shafts','at right angles, not meeting'],['Teeth','set at 45° on both gears'],['Driven',rpmOf(Math.abs(v))]];}}});
/* 44 stepped gears: several thin gears side by side, each set on by part of a tooth */
solidSim(44,{note:'STEPPED GEARS · three layers each set on by a third of a tooth: always one tooth at its best contact',cam:{cx:400,cy:260,yaw:-0.3,pitch:0.6},out:phi=>-phi*16/24/TAU,
  scene(R,phi){const m=7,Z1=16,Z2=24,R1=m*Z1/2,R2=m*Z2/2,w=14,n=3;for(let k=0;k<n;k++){const z=(k-(n-1)/2)*w;
      gear3(R,fr3([-R2*0.6,0,z],[1,0,0],[0,1,0]),R1,Z1,w,phi+k*TAU/Z1/n,C['brass-fill'],{mark:k===n-1});gear3(R,fr3([-R2*0.6+R1+R2,0,z],[1,0,0],[0,1,0]),R2,Z2,w,-(phi+k*TAU/Z1/n)*Z1/Z2+PI+PI/Z2,C['steel-fill'],{mark:k===n-1});}
    rod3(R,[-R2*0.6,0,n*w/2],[-R2*0.6,0,n*w/2+60],6,C.part);rod3(R,[-R2*0.6+R1+R2,0,n*w/2],[-R2*0.6+R1+R2,0,n*w/2+60],7,C.part);},
  extra:{reads(v){return[['Layers','3, each set on by ⅓ tooth'],['Ratio','16 : 24'],['Driven',rpmOf(Math.abs(v))]];}}});
/* 50 universal (Hooke's) joint */
reg({num:50,outLabel:'Output angle − input angle, °',params:[{id:'b',label:'Shaft angle',min:0,max:45,step:5,value:30,fmt:v=>v+'°'}],
  update(phi){const b=this.P.b*PI/180;const a1=phi;/* output angle from the cross geometry */const a2=Math.atan2(Math.sin(a1),Math.cos(a1)*Math.cos(b));const k=Math.round((a1-a2)/TAU);this.g={phi,b,a1,a2:a2+k*TAU};},
  output(){return(this.g.a2-this.g.a1)*180/PI;},
  draw(){const g=this.g,R=R3({yaw:-0.5,pitch:0.32,sc:1,cx:400,cy:270});const ax1=[1,0,0],ax2=[Math.cos(g.b),Math.sin(g.b),0];
    /* input yoke pin axis e1 ⟂ x, turning with a1; cross arm e2 ⟂ e1 and ⟂ output axis */
    const e1=[0,Math.cos(g.a1),Math.sin(g.a1)],e2=v3.norm(v3.cross(ax2,e1));const Rk=46,arm=40;
    rod3(R,[-300,0,0],[-70,0,0],11,C['brass-fill']);rod3(R,v3.mul(ax2,70),v3.mul(ax2,300),11,C['steel-fill']);
    const yoke=(ax,e,fill,sgn)=>{block3(R,v3.mul(ax,sgn*62),e,ax,Rk*2+22,24,16,fill);
      for(const s of [1,-1]){const c=v3.add(v3.mul(e,s*Rk),v3.mul(ax,sgn*30));block3(R,c,ax,e,64,22,12,fill);}};
    yoke(ax1,e1,C['brass-fill'],-1);yoke(ax2,e2,C['steel-fill'],1);
    rod3(R,v3.mul(e1,-arm-6),v3.mul(e1,arm+6),7,C.part2);rod3(R,v3.mul(e2,-arm-6),v3.mul(e2,arm+6),7,C.part2);block3(R,[0,0,0],e1,e2,20,20,20,C.part2);
    /* marks on the shafts so the uneven speed shows */R.line(v3.add([-200,0,0],v3.mul(e1,11)),v3.add([-120,0,0],v3.mul(e1,11)),C.ink,2.2,-20);R.line(v3.add(v3.mul(ax2,140),v3.mul(e2,11)),v3.add(v3.mul(ax2,220),v3.mul(e2,11)),C.ink,2.2,-20);
    R.draw();label('INPUT · steady',150,430);label('OUTPUT · speeds up and slows down twice a turn',470,470);},
  reads(v){const g=this.g,c=Math.cos(g.b),s=Math.sin(g.a1);const k=c/(1-s*s*(1-c*c));return[['Shaft angle',`${this.P.b}°`],['Output speed now',`${k.toFixed(3)} × input`],['Range',`${c.toFixed(3)} – ${(1/c).toFixed(3)} × input`],['Lead / lag',`${((g.a2-g.a1)*180/PI).toFixed(1)}°`]];}});
