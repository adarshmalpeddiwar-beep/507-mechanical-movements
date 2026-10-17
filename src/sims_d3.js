/* ================= audit pass · shaded 3D canvas renderer (R3) and solid gears ================= */
/* colour helpers */
function rgbOf(c){c=(c||'#999').trim();if(c[0]==='#'){if(c.length===4)c='#'+c[1]+c[1]+c[2]+c[2]+c[3]+c[3];return[1,3,5].map(i=>parseInt(c.slice(i,i+2),16));}const m=c.match(/[\d.]+/g)||[150,150,150];return m.slice(0,3).map(Number);}
function shade(c,k){const [r,g,b]=rgbOf(c);const f=v=>Math.max(0,Math.min(255,Math.round(v*k)));return`rgb(${f(r)},${f(g)},${f(b)})`;}
/* R3: collects polygons in world space, culls back faces, sorts by depth and paints with simple lighting.
   cam = {yaw,pitch,sc,cx,cy} (same convention as cam3). */
function R3(cam){const P0=cam3(cam.yaw,cam.pitch,cam.sc||1,cam.cx,cam.cy),P=p=>{const q=P0(p);return[q[0],q[1],-q[2]];};/* cam3's third value grows toward the viewer; R3 wants depth */const cy_=Math.cos(cam.yaw),sy_=Math.sin(cam.yaw),cp=Math.cos(cam.pitch),sp=Math.sin(cam.pitch);
  const view=[-sy_*cp,-cy_*cp,-sp];/* direction of increasing depth (away from viewer) */
  const Lw=v3.norm([-0.35-0.6*cy_,0.6*sy_-0.5,0.9]);const faces=[],lines=[];
  const R={P,view,
    /* face: pts (3D), fill, opts {out: point the outward normal faces away from, edge: stroke, both: draw even if back-facing} */
    face(pts,fill,o={}){if(pts.length<3)return;let n=[0,0,0];for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];n[0]+=(a[1]-b[1])*(a[2]+b[2]);n[1]+=(a[2]-b[2])*(a[0]+b[0]);n[2]+=(a[0]-b[0])*(a[1]+b[1]);}
      const l=Math.hypot(...n);if(l<1e-9)return;n=n.map(v=>v/l);
      if(v3.dot(n,view)>0)n=n.map(v=>-v);/* two-sided: light the side facing the viewer */
      const sc=pts.map(P);let dep=0;for(const s of sc)dep+=s[2];dep/=sc.length;if(o.bias)dep+=o.bias;
      const lam=Math.max(0,v3.dot(n,Lw));faces.push({sc,dep,fill,k:0.62+0.5*lam,edge:o.edge,lw:o.lw});},
    line(a,b,col,w=1.2,bias=0){const A=P(a),B=P(b);lines.push({A,B,col,w,dep:(A[2]+B[2])/2+bias});},
    /* loft between two loops with equal point counts (a = front, b = back); caps optional */
    loft(a,b,fill,o={}){const n=a.length,ctr=a.concat(b).reduce((s,p)=>[s[0]+p[0],s[1]+p[1],s[2]+p[2]],[0,0,0]).map(v=>v/(2*n));const out=o.center||ctr;
      for(let i=0;i<n;i++){const j=(i+1)%n;if(o.open&&j===0)break;R.face([a[i],a[j],b[j],b[i]],fill,{out:o.sideOut?o.sideOut(i):out});}
      if(o.caps!==false){R.face(a,o.capFill||fill,{out:o.capOutA||out,edge:o.edge??true,bias:o.capBias||0});R.face(b.slice().reverse(),o.capFill||fill,{out:o.capOutB||out,edge:o.edge??true,bias:o.capBias||0});}},
    draw(){if(GL3.ok()&&GL3.draw(faces,lines))return;faces.sort((p,q)=>q.dep-p.dep);const items=faces.concat(lines.map(l=>Object.assign(l,{isLine:1}))).sort((p,q)=>q.dep-p.dep);
      for(const f of items){if(f.isLine){ctx.save();ctx.strokeStyle=f.col||C.ink;ctx.lineWidth=f.w;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(f.A[0],f.A[1]);ctx.lineTo(f.B[0],f.B[1]);ctx.stroke();ctx.restore();continue;}
        ctx.beginPath();ctx.moveTo(f.sc[0][0],f.sc[0][1]);for(let i=1;i<f.sc.length;i++)ctx.lineTo(f.sc[i][0],f.sc[i][1]);ctx.closePath();const col=shade(f.fill,f.k);ctx.fillStyle=col;ctx.fill();
        ctx.strokeStyle=f.edge?C.ink:col;ctx.lineWidth=f.edge?(f.lw||1):0.6;ctx.stroke();}}};
  return R;}
/* GL3: z-buffered WebGL back end for R3 (exact hidden surfaces, antialiased); falls back to the painter if WebGL is missing */
const GL3=(()=>{let cv=null,gl=null,pr=null,bf=null,okv=null;
  function init(){okv=false;try{cv=document.createElement('canvas');gl=cv.getContext('webgl',{antialias:true,alpha:true,premultipliedAlpha:false,preserveDrawingBuffer:true});if(!gl)return;
    const sh=(t,src)=>{const o=gl.createShader(t);gl.shaderSource(o,src);gl.compileShader(o);return o;};pr=gl.createProgram();
    gl.attachShader(pr,sh(gl.VERTEX_SHADER,'attribute vec3 p;attribute vec4 c;varying vec4 v;void main(){gl_Position=vec4(p,1.0);v=c;}'));
    gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,'precision mediump float;varying vec4 v;void main(){gl_FragColor=v;}'));gl.linkProgram(pr);if(!gl.getProgramParameter(pr,gl.LINK_STATUS))return;bf=gl.createBuffer();okv=true;}catch(e){okv=false;}}
  return{ok(){if(okv===null)init();return okv&&ctx&&ctx.canvas&&ctx.getTransform;},
    draw(faces,lines){const T=ctx.getTransform(),Wd=ctx.canvas.width,Hd=ctx.canvas.height;if(!Wd||!Hd)return false;if(cv.width!==Wd)cv.width=Wd;if(cv.height!==Hd)cv.height=Hd;
      let dmin=1e9,dmax=-1e9;for(const f of faces)for(const p of f.sc){if(p[2]<dmin)dmin=p[2];if(p[2]>dmax)dmax=p[2];}for(const l of lines){dmin=Math.min(dmin,l.A[2],l.B[2]);dmax=Math.max(dmax,l.A[2],l.B[2]);}
      if(!(dmax>dmin)){dmax=dmin+1;}const pad=(dmax-dmin)*0.05+1;dmin-=pad;dmax+=pad;const sc=Math.hypot(T.a,T.b);
      const X=p=>(T.a*p[0]+T.c*p[1]+T.e)/Wd*2-1,Y=p=>1-(T.b*p[0]+T.d*p[1]+T.f)/Hd*2,Z=(d,b)=>((d-dmin)/(dmax-dmin))*2-1-(b||0);
      const out=[];const push=(x,y,z,c)=>{out.push(x,y,z,c[0],c[1],c[2],c[3]);};const ink=rgbOf(C.ink).map(v=>v/255).concat([1]);
      for(const f of faces){const [r,g,b]=rgbOf(f.fill),k=f.k;const c=[Math.min(1,r*k/255),Math.min(1,g*k/255),Math.min(1,b*k/255),1];const n=f.sc.length;let cx=0,cy=0,cz=0;for(const p of f.sc){cx+=p[0];cy+=p[1];cz+=p[2];}const ctr=[cx/n,cy/n,cz/n];
        for(let i=0;i<n;i++){const a=f.sc[i],q=f.sc[(i+1)%n];push(X(ctr),Y(ctr),Z(ctr[2]),c);push(X(a),Y(a),Z(a[2]),c);push(X(q),Y(q),Z(q[2]),c);}}
      const seg=(A,B,w,col,bias)=>{const ax=T.a*A[0]+T.c*A[1]+T.e,ay=T.b*A[0]+T.d*A[1]+T.f,bx=T.a*B[0]+T.c*B[1]+T.e,by=T.b*B[0]+T.d*B[1]+T.f;const L=Math.hypot(bx-ax,by-ay)||1e-6,hw=Math.max(0.5,w*sc/2);const nx=-(by-ay)/L*hw,ny=(bx-ax)/L*hw;
        const P=(x,y,d)=>[x/Wd*2-1,1-y/Hd*2,Z(d,bias)];const v=[P(ax+nx,ay+ny,A[2]),P(ax-nx,ay-ny,A[2]),P(bx-nx,by-ny,B[2]),P(bx+nx,by+ny,B[2])];
        for(const i of [0,1,2,0,2,3])push(v[i][0],v[i][1],v[i][2],col);};
      for(const f of faces)if(f.edge){const n=f.sc.length;for(let i=0;i<n;i++)seg(f.sc[i],f.sc[(i+1)%n],(f.lw||1)*0.8,ink,0.004);}
      for(const l of lines){const c=rgbOf(l.col||C.ink).map(v=>v/255).concat([1]);seg(l.A,l.B,l.w,c,0.006);}
      const data=new Float32Array(out);gl.viewport(0,0,Wd,Hd);gl.clearColor(0,0,0,0);gl.clearDepth(1);gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
      gl.useProgram(pr);gl.bindBuffer(gl.ARRAY_BUFFER,bf);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STREAM_DRAW);const ap=gl.getAttribLocation(pr,'p'),ac=gl.getAttribLocation(pr,'c');
      gl.enableVertexAttribArray(ap);gl.vertexAttribPointer(ap,3,gl.FLOAT,false,28,0);gl.enableVertexAttribArray(ac);gl.vertexAttribPointer(ac,4,gl.FLOAT,false,28,12);gl.drawArrays(gl.TRIANGLES,0,data.length/7);
      ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(cv,0,0);ctx.restore();return true;}};})();
/* frame helpers: map local (x,y,z) with axes u,v,n at origin c */
function fr3(c,u,v){const n=v3.cross(u,v);return{c,u,v,n,at(x,y,z=0){return[c[0]+u[0]*x+v[0]*y+n[0]*z,c[1]+u[1]*x+v[1]*y+n[1]*z,c[2]+u[2]*x+v[2]*y+n[2]*z];}};}
function rot2(p,a){const c=Math.cos(a),s=Math.sin(a);return[p[0]*c-p[1]*s,p[0]*s+p[1]*c];}
/* involute outline at origin, angle a (uses the kit's gearPts) */
const gearOutline2=(R,Z,a)=>gearPts(0,0,R,Z,a,false);
/* solid spur / helical gear: F frame (gear plane u,v; axis n), width w, twist = helix twist across the face (rad) */
function gear3(R,F,Rp,Z,w,a,fill,o={}){const tw=o.twist||0,seg=o.seg||(tw?4:1),bore=o.bore??Math.max(4,Rp*0.14);
  const loops=[];for(let k=0;k<=seg;k++){const t=k/seg,z=-w/2+w*t;const ang=a+(o.herring?(t<0.5?t:1-t)*2*tw/2:(t-0.5)*tw);loops.push(gearOutline2(Rp,Z,ang).map(p=>F.at(p[0],p[1],z)));}
  for(let k=0;k<seg;k++)R.loft(loops[k],loops[k+1],fill,{caps:false,center:F.c,sideOut:i=>F.c});
  /* caps with hub and bore */const cap=(z,fl)=>{const pts=loops[z<0?0:seg];R.face(z<0?pts.slice().reverse():pts,fill,{out:F.at(0,0,-z*5),edge:true});
    const hub=[],hb=[];for(let i=0;i<24;i++){const t=i/24*TAU;hub.push(F.at(bore*Math.cos(t),bore*Math.sin(t),z*1.001));}R.face(hub,C.part,{out:F.at(0,0,-z*5),edge:true,bias:-0.5});
    if(o.mark!==false){const m1=F.at((bore+3)*Math.cos(a+(z>0?tw/2:-tw/2)),(bore+3)*Math.sin(a+(z>0?tw/2:-tw/2)),z*1.002),m2=F.at((Rp-2.2*Rp/Z*1.6)*Math.cos(a+(z>0?tw/2:-tw/2)),(Rp-2.2*Rp/Z*1.6)*Math.sin(a+(z>0?tw/2:-tw/2)),z*1.002);R.line(m1,m2,C.ink,1.2,-0.6);}};
  cap(-w/2);cap(w/2);}
/* bevel gear: apex A, axis n (pointing from apex to the gear), u in the gear plane; outer pitch radius Rp, cone half-angle d, face width f (along the cone) */
function bevel3(R,A,n,u,Rp,Z,d,f,a,fill,o={}){n=v3.norm(n);u=v3.norm(v3.sub(u,v3.mul(n,v3.dot(u,n))));const v=v3.cross(n,u);
  const L=Rp/Math.sin(d),k=(L-f)/L;let outer=gearOutline2(Rp,Z,a);if(o.seg){const rr=Rp-1.25*2*Rp/Z;outer=outer.map(p=>{const t=mod(Math.atan2(p[1],p[0])-a-o.seg[0],TAU);if(t<o.seg[1])return p;const r=Math.min(Math.hypot(p[0],p[1]),rr);const q=Math.atan2(p[1],p[0]);return[r*Math.cos(q),r*Math.sin(q)];});}const zO=L*Math.cos(d),zI=(L-f)*Math.cos(d);
  /* teeth stand on the pitch cone: scale radially about the cone, and tilt the tooth height along the back cone */
  const lay=(p,s,z)=>{const r=Math.hypot(p[0],p[1]),dr=(r-Rp)*s,rr=Rp*s+dr*Math.cos(d),zz=z-dr*Math.sin(d);const t=Math.atan2(p[1],p[0]);return v3.add(A,v3.add(v3.mul(n,zz),v3.add(v3.mul(u,rr*Math.cos(t)),v3.mul(v,rr*Math.sin(t)))));};
  const lo=outer.map(p=>lay(p,1,zO)),li=outer.map(p=>lay(p,k,zI));const ctr=v3.add(A,v3.mul(n,(zO+zI)/2));
  R.loft(lo,li,fill,{caps:false,center:ctr,sideOut:()=>v3.add(A,v3.mul(n,zO*0.5))});
  R.face(lo,fill,{out:A,edge:true});R.face(li.slice().reverse(),fill,{out:v3.add(A,v3.mul(n,zO*3)),edge:true});
  /* back boss */const hub=[],hub2=[],rb=Rp*0.42;for(let i=0;i<24;i++){const t=i/24*TAU;hub.push(v3.add(A,v3.add(v3.mul(n,zO+0.5),v3.add(v3.mul(u,rb*Math.cos(t)),v3.mul(v,rb*Math.sin(t))))));hub2.push(v3.add(A,v3.add(v3.mul(n,zO+(o.boss??14)),v3.add(v3.mul(u,rb*0.8*Math.cos(t)),v3.mul(v,rb*0.8*Math.sin(t))))));}
  R.loft(hub,hub2,fill,{center:v3.add(A,v3.mul(n,zO+7))});
  const m1=lay([Rp*0.55*Math.cos(a),Rp*0.55*Math.sin(a)],1,zO-0.1),m2=lay([(Rp-2*Rp/Z*1.4)*Math.cos(a),(Rp-2*Rp/Z*1.4)*Math.sin(a)],1,zO-0.1);R.line(m1,m2,C.ink,1.2,-0.4);}
/* round bar (shaft) from a to b */
function rod3(R,a,b,r,fill,o={}){const ax=v3.norm(v3.sub(b,a));let u=Math.abs(ax[2])<0.9?v3.norm(v3.cross(ax,[0,0,1])):[1,0,0];const v=v3.cross(ax,u);const N=o.n||16;
  const ring=c=>{const o2=[];for(let i=0;i<N;i++){const t=i/N*TAU;o2.push(v3.add(c,v3.add(v3.mul(u,r*Math.cos(t)),v3.mul(v,r*Math.sin(t)))));}return o2;};R.loft(ring(a),ring(b),fill||C.part,{center:v3.mul(v3.add(a,b),0.5),edge:false});}
/* box between two points along an axis, cross-section w x h oriented by up vector */
function block3(R,c,ax,up,L,w,h,fill){ax=v3.norm(ax);up=v3.norm(v3.sub(up,v3.mul(ax,v3.dot(up,ax))));const sd=v3.cross(ax,up);const q=(x,y,z)=>v3.add(c,v3.add(v3.mul(ax,x),v3.add(v3.mul(sd,y),v3.mul(up,z))));
  const a=[q(-L/2,-w/2,-h/2),q(-L/2,w/2,-h/2),q(-L/2,w/2,h/2),q(-L/2,-w/2,h/2)],b=[q(L/2,-w/2,-h/2),q(L/2,w/2,-h/2),q(L/2,w/2,h/2),q(L/2,-w/2,h/2)];R.loft(a,b,fill,{center:c,edge:true});}
/* extruded 2D shape in frame F from z0 to z1 */
function prism3(R,F,pts2,z0,z1,fill,o={}){R.loft(pts2.map(p=>F.at(p[0],p[1],z1)),pts2.map(p=>F.at(p[0],p[1],z0)),fill,Object.assign({center:F.at(0,0,(z0+z1)/2)},o));}
function ringPts(r,n=40,a0=0){const o=[];for(let i=0;i<n;i++){const t=a0+i/n*TAU;o.push([r*Math.cos(t),r*Math.sin(t)]);}return o;}
