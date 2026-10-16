(function(){
/* ===== 507 Movements · CAD kernel: printable solids, STL and zip (no dependencies) ===== */
const K=(()=>{
const PI=Math.PI,TAU=2*PI;
/* ---------- 2D ---------- */
const area=p=>{let s=0;for(let i=0,n=p.length;i<n;i++){const a=p[i],b=p[(i+1)%n];s+=a[0]*b[1]-b[0]*a[1];}return s/2;};
const ccw=p=>area(p)>0?p:p.slice().reverse(), cw=p=>area(p)<0?p:p.slice().reverse();
const cr=(a,b,p)=>(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]);
const circle=(r,n=64,cx=0,cy=0,a0=0)=>{const p=[];for(let i=0;i<n;i++){const t=a0+i/n*TAU;p.push([cx+r*Math.cos(t),cy+r*Math.sin(t)]);}return p;};
function rrect(w,h,r,n=8,cx=0,cy=0){r=Math.min(r,w/2-0.01,h/2-0.01);const p=[];const C=[[w/2-r,h/2-r,0],[-w/2+r,h/2-r,1],[-w/2+r,-h/2+r,2],[w/2-r,-h/2+r,3]];
  for(const [x,y,q] of C)for(let i=0;i<=n;i++){const t=q*PI/2+i/n*PI/2;p.push([cx+x+r*Math.cos(t),cy+y+r*Math.sin(t)]);}return p;}
function slot(len,w,n=16,cx=0,cy=0,ang=0){const p=[],r=w/2,c=Math.cos(ang),s=Math.sin(ang);for(const [ox,a0] of [[len/2,-PI/2],[-len/2,PI/2]])for(let i=0;i<=n;i++){const t=a0+i/n*PI;const x=ox+r*Math.cos(t),y=r*Math.sin(t);p.push([cx+x*c-y*s,cy+x*s+y*c]);}return p;}
/* hull of circles (for levers): convex hull of sampled points */
function hull(pts){pts=pts.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]);const lo=[],up=[];for(const p of pts){while(lo.length>1&&cr(lo[lo.length-2],lo[lo.length-1],p)<=0)lo.pop();lo.push(p);}for(let i=pts.length-1;i>=0;i--){const p=pts[i];while(up.length>1&&cr(up[up.length-2],up[up.length-1],p)<=0)up.pop();up.push(p);}up.pop();lo.pop();return lo.concat(up);}
const lobes=(list,n=40)=>hull(list.flatMap(([x,y,r])=>circle(r,n,x,y)));

/* ---------- triangulation with holes (hole bridging + ear clipping) ---------- */
function inTriClosed(p,a,b,c){const d1=cr(a,b,p),d2=cr(b,c,p),d3=cr(c,a,p),e=-1e-9;const neg=d1<e||d2<e||d3<e,pos=d1>-e||d2>-e||d3>-e;return !(d1<e||d2<e||d3<e);}
const same=(p,q)=>Math.abs(p[0]-q[0])<1e-9&&Math.abs(p[1]-q[1])<1e-9;
function bridge(poly,hole){let mi=0;for(let i=1;i<hole.length;i++)if(hole[i][0]>hole[mi][0])mi=i;const M=hole[mi];let bx=Infinity,bi=-1;const n=poly.length;
  for(let i=0;i<n;i++){const a=poly[i],b=poly[(i+1)%n];if((a[1]>M[1])!==(b[1]>M[1])){const x=a[0]+(M[1]-a[1])*(b[0]-a[0])/(b[1]-a[1]);if(x>=M[0]&&x<bx){bx=x;bi=a[0]>b[0]?i:(i+1)%n;}}}
  if(bi<0)throw new Error('hole outside polygon');const P=poly[bi],I=[bx,M[1]];let cand=bi,best=Infinity;
  const tri=[M,I,P];const o=cr(M,I,P);
  for(let j=0;j<n;j++){if(j===bi)continue;const v=poly[j];const d1=cr(tri[0],tri[1],v)*Math.sign(o),d2=cr(tri[1],tri[2],v)*Math.sign(o),d3=cr(tri[2],tri[0],v)*Math.sign(o);
    if(d1>=-1e-9&&d2>=-1e-9&&d3>=-1e-9&&v[0]>M[0]){const ang=Math.abs(Math.atan2(v[1]-M[1],v[0]-M[0]));const dd=Math.hypot(v[0]-M[0],v[1]-M[1]);if(ang<best-1e-12||(Math.abs(ang-best)<1e-12&&dd<Math.hypot(poly[cand][0]-M[0],poly[cand][1]-M[1]))){best=ang;cand=j;}}}
  const hp=hole.slice(mi).concat(hole.slice(0,mi));hp.push(hole[mi].slice());
  return poly.slice(0,cand+1).concat(hp,[poly[cand].slice()],poly.slice(cand+1));}
function triangulate(outer,holes=[]){let poly=ccw(outer).map(p=>p.slice());holes=holes.map(h=>cw(h)).sort((a,b)=>Math.max(...b.map(p=>p[0]))-Math.max(...a.map(p=>p[0])));
  for(const h of holes)poly=bridge(poly,h);
  const pts=poly,idx=pts.map((_,i)=>i),out=[];let guard=0;
  while(idx.length>3&&guard++<200000){const n=idx.length;let done=false;
    for(let k=0;k<n&&!done;k++){const ia=idx[(k-1+n)%n],ib=idx[k],ic=idx[(k+1)%n],a=pts[ia],b=pts[ib],c=pts[ic];const z=cr(a,b,c);
      if(Math.abs(z)<1e-10){if(same(a,c))continue;const dot=(b[0]-a[0])*(c[0]-b[0])+(b[1]-a[1])*(c[1]-b[1]);if(dot>0){out.push([ia,ib,ic]);idx.splice(k,1);done=true;}continue;}
      if(z<0)continue;let ok=true;
      for(let j=0;j<n&&ok;j++){const q=idx[j];if(q===ia||q===ib||q===ic)continue;const p=pts[q];if(same(p,a)||same(p,b)||same(p,c))continue;if(inTriClosed(p,a,b,c))ok=false;}
      if(ok){out.push([ia,ib,ic]);idx.splice(k,1);done=true;}}
    if(!done){let bk=-1,bz=-Infinity;for(let k=0;k<n;k++){const z=cr(pts[idx[(k-1+n)%n]],pts[idx[k]],pts[idx[(k+1)%n]]);if(z>bz){bz=z;bk=k;}}const n2=idx.length;out.push([idx[(bk-1+n2)%n2],idx[bk],idx[(bk+1)%n2]]);idx.splice(bk,1);}}
  if(idx.length===3)out.push(idx.slice());return{pts,tris:out};}

/* ---------- 3D meshes: {t:[x,y,z,...] triangles} ---------- */
const mesh=()=>({t:[]});
function tri(m,a,b,c){m.t.push(a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2]);}
function prism(outer,holes,z0,z1){const m=mesh();const o=ccw(outer),hs=(holes||[]).map(h=>cw(h));const T=triangulate(o,hs);
  for(const [a,b,c] of T.tris){const A=T.pts[a],B=T.pts[b],Cc=T.pts[c];tri(m,[A[0],A[1],z1],[B[0],B[1],z1],[Cc[0],Cc[1],z1]);tri(m,[A[0],A[1],z0],[Cc[0],Cc[1],z0],[B[0],B[1],z0]);}
  for(const loop of [o,...hs])for(let i=0;i<loop.length;i++){const a=loop[i],b=loop[(i+1)%loop.length];tri(m,[a[0],a[1],z0],[b[0],b[1],z0],[b[0],b[1],z1]);tri(m,[a[0],a[1],z0],[b[0],b[1],z1],[a[0],a[1],z1]);}
  return m;}
/* revolve a closed (r,z) profile about the z axis */
function lathe(prof,n=72){const m=mesh();for(let i=0;i<n;i++){const t0=i/n*TAU,t1=(i+1)/n*TAU,c0=Math.cos(t0),s0=Math.sin(t0),c1=Math.cos(t1),s1=Math.sin(t1);
  for(let j=0;j<prof.length;j++){const p=prof[j],q=prof[(j+1)%prof.length];const P0=[p[0]*c0,p[0]*s0,p[1]],P1=[p[0]*c1,p[0]*s1,p[1]],Q0=[q[0]*c0,q[0]*s0,q[1]],Q1=[q[0]*c1,q[0]*s1,q[1]];
    if(p[0]<1e-9&&q[0]<1e-9)continue;if(p[0]<1e-9){tri(m,P0,Q0,Q1);}else if(q[0]<1e-9){tri(m,P0,Q0,P1);}else{tri(m,P0,Q0,Q1);tri(m,P0,Q1,P1);}}}
  return orient(m);}
function volume(m){let v=0;const t=m.t;for(let i=0;i<t.length;i+=9){v+=t[i]*(t[i+4]*t[i+8]-t[i+5]*t[i+7])-t[i+1]*(t[i+3]*t[i+8]-t[i+5]*t[i+6])+t[i+2]*(t[i+3]*t[i+7]-t[i+4]*t[i+6]);}return v/6;}
function flip(m){const t=m.t;for(let i=0;i<t.length;i+=9)for(let k=0;k<3;k++){const a=t[i+3+k];t[i+3+k]=t[i+6+k];t[i+6+k]=a;}return m;}
function orient(m){if(volume(m)<0)flip(m);return m;}
function xf(m,M){const o=mesh(),t=m.t;for(let i=0;i<t.length;i+=3){const x=t[i],y=t[i+1],z=t[i+2];o.t.push(M[0]*x+M[4]*y+M[8]*z+M[12],M[1]*x+M[5]*y+M[9]*z+M[13],M[2]*x+M[6]*y+M[10]*z+M[14]);}
  const det=M[0]*(M[5]*M[10]-M[6]*M[9])-M[4]*(M[1]*M[10]-M[2]*M[9])+M[8]*(M[1]*M[6]-M[2]*M[5]);if(det<0)flip(o);return o;}
function merge(...ms){const o=mesh();for(const m of ms)for(const v of m.t)o.t.push(v);return o;}
function bbox(m){const t=m.t;const lo=[1e9,1e9,1e9],hi=[-1e9,-1e9,-1e9];for(let i=0;i<t.length;i+=3)for(let k=0;k<3;k++){if(t[i+k]<lo[k])lo[k]=t[i+k];if(t[i+k]>hi[k])hi[k]=t[i+k];}return{lo,hi};}
/* simple solids */
const cyl=(r,z0,z1,n=48,cx=0,cy=0)=>prism(circle(r,n,cx,cy),[],z0,z1);
const tubeSolid=(ro,ri,z0,z1,n=64,cx=0,cy=0)=>prism(circle(ro,n,cx,cy),[circle(ri,n,cx,cy)],z0,z1);
const box=(w,d,z0,z1,cx=0,cy=0)=>prism([[cx-w/2,cy-d/2],[cx+w/2,cy-d/2],[cx+w/2,cy+d/2],[cx-w/2,cy+d/2]],[],z0,z1);
/* torus-like closed ring for a printed TPU belt */
const ring=(R,r,n=96,m=16)=>lathe(circle(r,m,R,r),n);
/* ---------- 4x4 (column-major) ---------- */
const M4={id:()=>[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],
  mul(a,b){const o=new Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++){let s=0;for(let k=0;k<4;k++)s+=a[k*4+r]*b[c*4+k];o[c*4+r]=s;}return o;},
  T:(x,y,z)=>[1,0,0,0,0,1,0,0,0,0,1,0,x,y,z,1],
  Rz(a){const c=Math.cos(a),s=Math.sin(a);return[c,s,0,0,-s,c,0,0,0,0,1,0,0,0,0,1];},
  Rx(a){const c=Math.cos(a),s=Math.sin(a);return[1,0,0,0,0,c,s,0,0,-s,c,0,0,0,0,1];},
  Ry(a){const c=Math.cos(a),s=Math.sin(a);return[c,0,-s,0,0,1,0,0,s,0,c,0,0,0,0,1];},
  S:(x,y,z)=>[x,0,0,0,0,y,0,0,0,0,z,0,0,0,0,1],
  /* frame whose z axis is n, x axis roughly u */
  frame(o,n,u){const l=Math.hypot(...n);n=n.map(v=>v/l);let x=u||[1,0,0];let d=x[0]*n[0]+x[1]*n[1]+x[2]*n[2];if(Math.abs(d)>0.95){x=[0,1,0];d=x[0]*n[0]+x[1]*n[1]+x[2]*n[2];}x=[x[0]-d*n[0],x[1]-d*n[1],x[2]-d*n[2]];const lx=Math.hypot(...x);x=x.map(v=>v/lx);const y=[n[1]*x[2]-n[2]*x[1],n[2]*x[0]-n[0]*x[2],n[0]*x[1]-n[1]*x[0]];return[x[0],x[1],x[2],0,y[0],y[1],y[2],0,n[0],n[1],n[2],0,o[0],o[1],o[2],1];},
  chain(...ms){return ms.reduce((a,b)=>M4.mul(a,b));},
  apply(M,p){return[M[0]*p[0]+M[4]*p[1]+M[8]*p[2]+M[12],M[1]*p[0]+M[5]*p[1]+M[9]*p[2]+M[13],M[2]*p[0]+M[6]*p[1]+M[10]*p[2]+M[14]];}};
/* ---------- checks ---------- */
function watertight(m){const t=m.t,E=new Map();const key=i=>`${Math.round(t[i]*1e4)},${Math.round(t[i+1]*1e4)},${Math.round(t[i+2]*1e4)}`;
  for(let i=0;i<t.length;i+=9){const v=[key(i),key(i+3),key(i+6)];for(let k=0;k<3;k++){const a=v[k],b=v[(k+1)%3];if(a===b)continue;const f=a<b?a+'|'+b:b+'|'+a,s=a<b?1:-1;const e=E.get(f)||[0,0];e[0]++;e[1]+=s;E.set(f,e);}}
  let bad=0;for(const [,e] of E)if(e[1]!==0)bad++;return{edges:E.size,bad,vol:volume(m)};}
/* ---------- STL + zip ---------- */
function stl(m,name){const t=m.t,n=t.length/9,buf=new ArrayBuffer(84+n*50),dv=new DataView(buf);const hdr=('507 movements · '+name).slice(0,79);for(let i=0;i<hdr.length;i++)dv.setUint8(i,hdr.charCodeAt(i)&127);dv.setUint32(80,n,true);
  let o=84;for(let i=0;i<t.length;i+=9){const ax=t[i+3]-t[i],ay=t[i+4]-t[i+1],az=t[i+5]-t[i+2],bx=t[i+6]-t[i],by=t[i+7]-t[i+1],bz=t[i+8]-t[i+2];let nx=ay*bz-az*by,ny=az*bx-ax*bz,nz=ax*by-ay*bx;const l=Math.hypot(nx,ny,nz)||1;
    dv.setFloat32(o,nx/l,true);dv.setFloat32(o+4,ny/l,true);dv.setFloat32(o+8,nz/l,true);o+=12;for(let k=0;k<9;k++){dv.setFloat32(o,t[i+k],true);o+=4;}dv.setUint16(o,0,true);o+=2;}
  return new Uint8Array(buf);}
const CRC=(()=>{const T=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;T[n]=c>>>0;}return T;})();
function crc32(u){let c=0xFFFFFFFF;for(let i=0;i<u.length;i++)c=CRC[(c^u[i])&255]^(c>>>8);return(c^0xFFFFFFFF)>>>0;}
function zip(files){const enc=new TextEncoder(),parts=[],cen=[];let off=0;
  for(const f of files){const name=enc.encode(f.name),data=typeof f.data==='string'?enc.encode(f.data):f.data,crc=crc32(data);
    const h=new DataView(new ArrayBuffer(30));h.setUint32(0,0x04034b50,true);h.setUint16(4,20,true);h.setUint16(6,0x0800,true);h.setUint16(8,0,true);h.setUint16(10,0,true);h.setUint16(12,0x21,true);h.setUint32(14,crc,true);h.setUint32(18,data.length,true);h.setUint32(22,data.length,true);h.setUint16(26,name.length,true);h.setUint16(28,0,true);
    parts.push(new Uint8Array(h.buffer),name,data);
    const c=new DataView(new ArrayBuffer(46));c.setUint32(0,0x02014b50,true);c.setUint16(4,20,true);c.setUint16(6,20,true);c.setUint16(8,0x0800,true);c.setUint16(10,0,true);c.setUint16(12,0,true);c.setUint16(14,0x21,true);c.setUint32(16,crc,true);c.setUint32(20,data.length,true);c.setUint32(24,data.length,true);c.setUint16(28,name.length,true);c.setUint32(42,off,true);
    cen.push(new Uint8Array(c.buffer),name);off+=30+name.length+data.length;}
  const csz=cen.reduce((s,a)=>s+a.length,0),e=new DataView(new ArrayBuffer(22));e.setUint32(0,0x06054b50,true);e.setUint16(8,files.length,true);e.setUint16(10,files.length,true);e.setUint32(12,csz,true);e.setUint32(16,off,true);
  const all=parts.concat(cen,[new Uint8Array(e.buffer)]),tot=all.reduce((s,a)=>s+a.length,0),out=new Uint8Array(tot);let p=0;for(const a of all){out.set(a,p);p+=a.length;}return out;}
return{PI,TAU,area,ccw,cw,circle,rrect,slot,hull,lobes,triangulate,mesh,tri,prism,lathe,volume,flip,orient,xf,merge,bbox,cyl,tubeSolid,box,ring,M4,watertight,stl,zip,crc32};
})();

/* ===== 507 Movements · 3D viewer, hand operation, print layout and STL zip export ===== */
window.CAD=(()=>{
const {M4}=K,PI=Math.PI,TAU=2*PI;
const MODELS={};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const slug=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
let dlP=null;const downloads=()=>dlP||(dlP=(window.claude&&window.claude.use)?window.claude.use('downloads'):Promise.resolve(null));

/* shared shading */
const VS=`attribute vec3 p;attribute vec3 n;uniform mat4 M,VP;varying vec3 vn;varying vec3 vw;
void main(){vec4 w=M*vec4(p,1.);vw=w.xyz;vn=mat3(M)*n;gl_Position=VP*w;}`;
const FS=`precision mediump float;varying vec3 vn;varying vec3 vw;uniform vec3 col;uniform vec3 eye;uniform float alpha;
void main(){vec3 N=normalize(vn);vec3 V=normalize(eye-vw);if(dot(N,V)<0.)N=-N;
vec3 L1=normalize(vec3(.4,-.5,.8));vec3 L2=normalize(vec3(-.6,.4,.35));
float d=max(dot(N,L1),0.)*.6+max(dot(N,L2),0.)*.22;float hemi=.5+.5*N.z;
vec3 H=normalize(L1+V);float sp=pow(max(dot(N,H),0.),40.)*.22;
vec3 c=col*(.32+.16*hemi+d)+sp;float rim=pow(1.-max(dot(N,V),0.),3.);gl_FragColor=vec4(c+rim*.05,alpha);}`;
function hex(c){c=c.trim();if(c.startsWith('#')){if(c.length===4)c='#'+c[1]+c[1]+c[2]+c[2]+c[3]+c[3];return[1,3,5].map(i=>parseInt(c.slice(i,i+2),16)/255);}const m=c.match(/[\d.]+/g)||[200,200,200];return m.slice(0,3).map(v=>v/255);}
function palette(){const s=getComputedStyle(document.documentElement),g=k=>hex(s.getPropertyValue('--'+k)||'#ccc');const dark=g('sheet')[0]<0.4;
  return dark?{frame:[.42,.46,.44],driver:[.86,.62,.26],driven:[.38,.62,.80],link:[.58,.62,.60],small:[.75,.77,.76],belt:[.16,.17,.17],bed:[.22,.25,.24],tpu:[.25,.27,.27]}
             :{frame:[.80,.83,.80],driver:[.90,.68,.30],driven:[.42,.64,.82],link:[.68,.72,.69],small:[.93,.94,.93],belt:[.18,.19,.19],bed:[.88,.90,.88],tpu:[.28,.30,.30]};}

/* belt tube (display only) */
function tubeTris(pts,r,sides=8,closed=true){const out=[],n=pts.length;if(n<2)return out;const T=[],F=[];
  for(let i=0;i<n;i++){const a=pts[(i-1+n)%n],b=pts[(i+1)%n];let t=closed||(i>0&&i<n-1)?[b[0]-a[0],b[1]-a[1],b[2]-a[2]]:(i===0?[pts[1][0]-pts[0][0],pts[1][1]-pts[0][1],pts[1][2]-pts[0][2]]:[pts[n-1][0]-pts[n-2][0],pts[n-1][1]-pts[n-2][1],pts[n-1][2]-pts[n-2][2]]);const l=Math.hypot(...t)||1;T.push(t.map(v=>v/l));}
  let u=[0,0,1];if(Math.abs(T[0][2])>0.9)u=[1,0,0];
  for(let i=0;i<n;i++){const t=T[i];let d=u[0]*t[0]+u[1]*t[1]+u[2]*t[2];let x=[u[0]-d*t[0],u[1]-d*t[1],u[2]-d*t[2]];let l=Math.hypot(...x);if(l<1e-6){x=Math.abs(t[2])<0.9?[0,0,1]:[1,0,0];d=x[0]*t[0]+x[1]*t[1]+x[2]*t[2];x=[x[0]-d*t[0],x[1]-d*t[1],x[2]-d*t[2]];l=Math.hypot(...x);}x=x.map(v=>v/l);u=x;const y=[t[1]*x[2]-t[2]*x[1],t[2]*x[0]-t[0]*x[2],t[0]*x[1]-t[1]*x[0]];
    const ring=[];for(let k=0;k<sides;k++){const a=k/sides*TAU,c=Math.cos(a)*r,s=Math.sin(a)*r;ring.push([pts[i][0]+x[0]*c+y[0]*s,pts[i][1]+x[1]*c+y[1]*s,pts[i][2]+x[2]*c+y[2]*s]);}F.push(ring);}
  const m=closed?n:n-1;for(let i=0;i<m;i++){const A=F[i],B=F[(i+1)%n];for(let k=0;k<sides;k++){const k2=(k+1)%sides;out.push(...A[k],...B[k],...B[k2],...A[k],...B[k2],...A[k2]);}}return out;}
function along(pts){const L=[0];for(let i=1;i<=pts.length;i++){const a=pts[i-1],b=pts[i%pts.length];L.push(L[i-1]+Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2]));}
  return{len:L[L.length-1],at(s){s=((s%L[L.length-1])+L[L.length-1])%L[L.length-1];let lo=0,hi=L.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(L[m]<=s)lo=m;else hi=m;}const a=pts[lo],b=pts[(lo+1)%pts.length],t=(s-L[lo])/((L[lo+1]-L[lo])||1);return[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];}};}

function readme(n,title,model,parts){const L=[];L.push(`507 MECHANICAL MOVEMENTS · No. ${n} · ${title}`,'3D-printable working model','='.repeat(60),'',model.summary||'','',
  'PRINTED PARTS (each STL is already oriented for printing, flat side down)');
  for(const p of parts)L.push(`  ${p.file}  ×${p.qty}  ${p.mat||'PLA'}  ${p.dims}${p.note?'  · '+p.note:''}`);
  L.push('','SUGGESTED SETTINGS','  0.2 mm layers · 3 walls · 20–30 % infill · no supports needed','  Holes are drawn 0.3–0.6 mm oversize for running clearance; pins and caps are a snug push fit.','  If a cap is loose, add a drop of glue; if a pulley binds, run a 6.5 mm drill through the bore.','');
  if(model.hardware&&model.hardware.length){L.push('YOU WILL ALSO NEED');for(const h of model.hardware)L.push('  • '+h);L.push('');}
  if(model.steps&&model.steps.length){L.push('ASSEMBLY');model.steps.forEach((s,i)=>L.push(`  ${i+1}. ${s}`));L.push('');}
  L.push('Drawings by Henry T. Brown (1868) are public domain; this model is a new design for the interactive edition.');return L.join('\r\n');}

function mount(host,n,title){const model=MODELS[n];if(!model)return null;
  const P={};(model.params||[]).forEach(p=>P[p.id]=p.value);
  host.innerHTML=`<div class="cadhead"><div><div class="eyebrow">3D-printable model</div><h3>Print it, build it, turn it</h3></div><p>${esc(model.summary||'')}</p></div>
  <div class="cadgrid"><div class="cadstage"><canvas class="cadcv" aria-label="3D model of movement ${n}"></canvas><div class="cadread"></div><div class="cadhint">drag to orbit · scroll or pinch to zoom</div></div>
  <aside class="panel">
   <div class="sec"><h3>Operate</h3><div class="row"><button class="btn primary c-play">Pause</button><button class="btn c-hand" aria-pressed="false">Turn by hand</button></div>
     <div class="ctl"><div class="lab"><label>Input angle</label><output class="c-ango">0°</output></div><input type="range" class="c-ang" min="0" max="720" step="1" value="0"></div><div class="c-params" style="display:flex;flex-direction:column;gap:12px"></div></div>
   <div class="sec"><h3>View</h3><div class="seg c-view"><button aria-pressed="true" data-v="asm">Assembled</button><button aria-pressed="false" data-v="bed">Print layout</button></div><button class="btn c-reset" style="align-self:flex-start">Reset camera</button></div>
   <div class="sec"><h3>Download</h3><button class="btn primary c-dl">Download STL files (.zip)</button><div class="c-st" role="status" style="font-size:12.5px;color:var(--muted)"></div></div>
  </aside></div>
  <div class="cadinfo"><div><h4>Printed parts</h4><table class="ptab"><thead><tr><th>Part</th><th>Qty</th><th>Size (mm)</th><th>Notes</th></tr></thead><tbody class="c-parts"></tbody></table></div>
   <div><h4>You will also need</h4><ul class="c-hw"></ul><h4>Assembly</h4><ol class="c-steps"></ol></div></div>`;
  const $=s=>host.querySelector(s),cv=$('.cadcv');
  const gl=cv.getContext('webgl',{antialias:true});
  let parts=[],bufs={},pal=palette(),alive=true;
  function buildParts(){parts=model.parts(P).map(p=>{const bb=K.bbox(p.mesh);const d=[0,1,2].map(k=>bb.hi[k]-bb.lo[k]);return Object.assign({qty:1,mat:'PLA',role:'frame'},p,{bb,dims:d.map(v=>v.toFixed(0)).join(' × '),file:`${String(n).padStart(3,'0')}-${slug(p.name)}.stl`});});
    if(gl){for(const k in bufs){gl.deleteBuffer(bufs[k].pb);gl.deleteBuffer(bufs[k].nb);}bufs={};for(const p of parts)bufs[p.id]=upload(p.mesh.t);}
    $('.c-parts').innerHTML=parts.map(p=>`<tr><td>${esc(p.name)}</td><td>${p.qty}</td><td>${p.dims}</td><td>${esc((p.mat!=='PLA'?p.mat+' · ':'')+(p.note||''))}</td></tr>`).join('');}
  let prog,U={},ap,an;
  function upload(t){const P=new Float32Array(t),N=new Float32Array(t.length);for(let o=0;o<t.length;o+=9){const ax=P[o+3]-P[o],ay=P[o+4]-P[o+1],az=P[o+5]-P[o+2],bx=P[o+6]-P[o],by=P[o+7]-P[o+1],bz=P[o+8]-P[o+2];let nx=ay*bz-az*by,ny=az*bx-ax*bz,nz=ax*by-ay*bx;const l=Math.hypot(nx,ny,nz)||1;for(let v=0;v<3;v++){N[o+v*3]=nx/l;N[o+v*3+1]=ny/l;N[o+v*3+2]=nz/l;}}
    const pb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,pb);gl.bufferData(gl.ARRAY_BUFFER,P,gl.STATIC_DRAW);const nb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,nb);gl.bufferData(gl.ARRAY_BUFFER,N,gl.STATIC_DRAW);return{pb,nb,n:t.length/3};}
  if(gl){const sh=(t,s)=>{const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);return o;};prog=gl.createProgram();gl.attachShader(prog,sh(gl.VERTEX_SHADER,VS));gl.attachShader(prog,sh(gl.FRAGMENT_SHADER,FS));gl.linkProgram(prog);gl.useProgram(prog);
    ['M','VP','col','eye','alpha'].forEach(k=>U[k]=gl.getUniformLocation(prog,k));ap=gl.getAttribLocation(prog,'p');an=gl.getAttribLocation(prog,'n');gl.enable(gl.DEPTH_TEST);}
  else $('.cadhint').textContent='The 3D view needs WebGL, which is turned off in this browser. The STL download still works.';
  const dyn=gl?{pb:gl.createBuffer(),nb:gl.createBuffer(),n:0}:null;
  function draw(b,M,col,alpha=1){gl.uniformMatrix4fv(U.M,false,M);gl.uniform3fv(U.col,col);gl.uniform1f(U.alpha,alpha);gl.bindBuffer(gl.ARRAY_BUFFER,b.pb);gl.enableVertexAttribArray(ap);gl.vertexAttribPointer(ap,3,gl.FLOAT,false,0,0);gl.bindBuffer(gl.ARRAY_BUFFER,b.nb);gl.enableVertexAttribArray(an);gl.vertexAttribPointer(an,3,gl.FLOAT,false,0,0);gl.drawArrays(gl.TRIANGLES,0,b.n);}
  function drawDyn(t,col){if(!t.length)return;const b=upload(t);draw(b,M4.id(),col);gl.deleteBuffer(b.pb);gl.deleteBuffer(b.nb);}
  /* params */
  const pbox=$('.c-params');(model.params||[]).forEach(p=>{const w=document.createElement('div');w.className='ctl';
    if(p.type==='toggle'){w.innerHTML=`<div class="lab"><span>${esc(p.label)}</span></div>`;const seg=document.createElement('div');seg.className='seg';p.options.forEach(([v,l])=>{const b=document.createElement('button');b.textContent=l;b.setAttribute('aria-pressed',P[p.id]===v);b.onclick=()=>{P[p.id]=v;seg.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',x===b));if(p.rebuild)buildParts();};seg.append(b);});w.append(seg);}
    else{w.innerHTML=`<div class="lab"><label>${esc(p.label)}</label><output>${p.fmt(P[p.id])}</output></div><input type="range" min="${p.min}" max="${p.max}" step="${p.step}" value="${P[p.id]}">`;const i=w.querySelector('input'),o=w.querySelector('output');i.oninput=()=>{P[p.id]=+i.value;o.textContent=p.fmt(+i.value);if(p.rebuild)buildParts();};}
    pbox.append(w);});
  buildParts();
  (model.hardware||[]).forEach(h=>{const li=document.createElement('li');li.textContent=h;$('.c-hw').append(li);});if(!(model.hardware||[]).length)$('.c-hw').innerHTML='<li>Nothing else: every part is printed.</li>';
  (model.steps||[]).forEach(h=>{const li=document.createElement('li');li.textContent=h;$('.c-steps').append(li);});
  /* camera */
  const S={};let phi=0,playing=!matchMedia('(prefers-reduced-motion: reduce)').matches,hand=false,view='asm';
  const asm0=model.pose(0,P,S);let lo=[1e9,1e9,1e9],hi=[-1e9,-1e9,-1e9];for(const [id,M] of asm0.inst){const p=parts.find(q=>q.id===id);if(!p)continue;for(const x of [p.bb.lo[0],p.bb.hi[0]])for(const y of [p.bb.lo[1],p.bb.hi[1]])for(const z of [p.bb.lo[2],p.bb.hi[2]]){const q=M4.apply(M,[x,y,z]);for(let k=0;k<3;k++){lo[k]=Math.min(lo[k],q[k]);hi[k]=Math.max(hi[k],q[k]);}}}
  const C0=[(lo[0]+hi[0])/2,(lo[1]+hi[1])/2,(lo[2]+hi[2])/2],R0=Math.max(40,Math.hypot(hi[0]-lo[0],hi[1]-lo[1],hi[2]-lo[2])/2);
  const cam0=Object.assign({yaw:-1.15,pitch:0.62},model.cam||{});let cam={yaw:cam0.yaw,pitch:cam0.pitch,dist:R0*2.7,target:C0.slice()};
  function layout(){const items=[];for(const p of parts)for(let q=0;q<p.qty;q++)items.push(p);items.sort((a,b)=>(b.bb.hi[1]-b.bb.lo[1])-(a.bb.hi[1]-a.bb.lo[1]));const gap=8,maxW=Math.max(230,...items.map(p=>p.bb.hi[0]-p.bb.lo[0]+gap));let x=0,y=0,rowH=0;const out=[];
    for(const p of items){const w=p.bb.hi[0]-p.bb.lo[0],h=p.bb.hi[1]-p.bb.lo[1];if(x+w>maxW&&x>0){x=0;y+=rowH+gap;rowH=0;}out.push([p.id,M4.T(x-p.bb.lo[0],-y-h-p.bb.lo[1],-p.bb.lo[2])]);x+=w+gap;rowH=Math.max(rowH,h);}
    const W=maxW,Hh=y+rowH;return{out:out.map(([id,M])=>[id,M4.mul(M4.T(-W/2,Hh/2,0),M)]),W,H:Hh};}
  let bed=null;const bedBuf=()=>{if(bed)return bed;const L=layout();const m=K.box(L.W+24,L.H+24,-2,0);bed={L,b:upload(m.t)};return bed;};
  /* input */
  const pts=new Map();let grab=null;
  cv.addEventListener('pointerdown',e=>{pts.set(e.pointerId,[e.clientX,e.clientY]);try{cv.setPointerCapture(e.pointerId);}catch(_){}if(hand&&pts.size===1){setPlay(false);grab={x:e.clientX,p0:phi};}});
  cv.addEventListener('pointermove',e=>{if(!pts.has(e.pointerId))return;const [px,py]=pts.get(e.pointerId);
    if(hand&&grab&&pts.size===1){phi=Math.max(0,grab.p0+(e.clientX-grab.x)*0.02);syncAng();}
    else if(pts.size===1){cam.yaw-=(e.clientX-px)*0.008;cam.pitch=Math.max(-0.2,Math.min(1.5,cam.pitch+(e.clientY-py)*0.006));}
    else if(pts.size===2){const o=[...pts.entries()].find(([id])=>id!==e.pointerId)[1];const d0=Math.hypot(px-o[0],py-o[1]),d1=Math.hypot(e.clientX-o[0],e.clientY-o[1]);if(d1>0)cam.dist=Math.max(R0*0.8,Math.min(R0*8,cam.dist*d0/d1));}
    pts.set(e.pointerId,[e.clientX,e.clientY]);});
  const up=e=>{pts.delete(e.pointerId);grab=null;};cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
  cv.addEventListener('wheel',e=>{e.preventDefault();cam.dist=Math.max(R0*0.8,Math.min(R0*8,cam.dist*Math.exp(e.deltaY*0.001)));},{passive:false});
  const playB=$('.c-play'),handB=$('.c-hand'),ang=$('.c-ang');
  function setPlay(v){playing=v;playB.textContent=v?'Pause':'Run';}
  function syncAng(){const d=phi*180/PI;ang.value=String(Math.round(d%720));$('.c-ango').textContent=Math.round(d)+'°';}
  setPlay(playing);playB.onclick=()=>setPlay(!playing);
  handB.onclick=()=>{hand=!hand;handB.setAttribute('aria-pressed',hand);if(hand)setPlay(false);$('.cadhint').textContent=hand?'drag left or right to turn the input':'drag to orbit · scroll or pinch to zoom';cv.style.cursor=hand?'ew-resize':'';};
  ang.oninput=()=>{setPlay(false);phi=ang.value*PI/180;$('.c-ango').textContent=ang.value+'°';};
  $('.c-view').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;view=b.dataset.v;$('.c-view').querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',x===b));bed=null;
    if(view==='bed'){const L=bedBuf().L;cam={yaw:-PI/2,pitch:1.25,dist:Math.max(L.W,L.H)*2.1,target:[0,0,0]};}else cam={yaw:cam0.yaw,pitch:cam0.pitch,dist:R0*2.7,target:C0.slice()};});
  $('.c-reset').onclick=()=>{if(view==='bed'){const L=bedBuf().L;cam={yaw:-PI/2,pitch:1.25,dist:Math.max(L.W,L.H)*2.1,target:[0,0,0]};}else cam={yaw:cam0.yaw,pitch:cam0.pitch,dist:R0*2.7,target:C0.slice()};};
  /* download */
  const st=$('.c-st'),dlB=$('.c-dl');
  dlB.onclick=async()=>{dlB.disabled=true;try{const files=parts.map(p=>{const bb=p.bb,m=K.xf(p.mesh,M4.T(-(bb.lo[0]+bb.hi[0])/2,-(bb.lo[1]+bb.hi[1])/2,-bb.lo[2]));return{name:p.file,data:K.stl(m,p.name)};});
      files.push({name:'README.txt',data:readme(n,title,model,parts)});const z=K.zip(files),fname=`movement-${String(n).padStart(3,'0')}-${slug(title)}-stl.zip`,blob=new Blob([z],{type:'application/zip'});
      const dl=await downloads();
      if(dl){st.textContent='Confirm the download…';await dl.save({filename:fname,data:blob});st.textContent='Saved '+fname;}
      else{const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=fname;document.body.append(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},2000);st.textContent=`${fname} · ${(z.length/1024).toFixed(0)} KB`;}
    }catch(e){const c=e&&e.code;st.textContent=c==='declined'?'Download cancelled.':c==='rate_limited'?'Another download is still open. Finish it, then try again.':(e&&e.message)||'Download failed.';}finally{dlB.disabled=false;}};
  /* loop */
  const ro=$('.cadread');let last=performance.now(),fr=0;
  const mo=new MutationObserver(()=>{pal=palette();});mo.observe(document.documentElement,{attributes:true});
  function resize(){const dpr=Math.min(2,window.devicePixelRatio||1);const w=Math.round(cv.clientWidth*dpr),h=Math.round(cv.clientHeight*dpr);if(w&&(cv.width!==w||cv.height!==h)){cv.width=w;cv.height=h;}}
  function frame(now){if(!alive)return;const dt=Math.min(0.05,(now-last)/1000);last=now;if(playing){phi+=dt*TAU*0.25;if(fr%6===0)syncAng();}fr++;
    const pose=model.pose(phi,P,S);if(fr%4===0)ro.textContent=view==='bed'?`${parts.reduce((s,p)=>s+p.qty,0)} printed pieces · laid out flat, as they print`:(pose.read||'');
    if(gl){resize();gl.viewport(0,0,cv.width,cv.height);const bg=hex(getComputedStyle(cv.parentElement).backgroundColor);gl.clearColor(bg[0],bg[1],bg[2],1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
      const cp=Math.cos(cam.pitch),e=[cam.target[0]+cam.dist*cp*Math.cos(cam.yaw),cam.target[1]+cam.dist*cp*Math.sin(cam.yaw),cam.target[2]+cam.dist*Math.sin(cam.pitch)];
      const VP=M4.mul(persp(0.6,cv.width/Math.max(1,cv.height),cam.dist*0.05,cam.dist*6),look(e,cam.target,[0,0,1]));gl.uniformMatrix4fv(U.VP,false,VP);gl.uniform3fv(U.eye,e);
      if(view==='bed'){const B=bedBuf();draw(B.b,M4.id(),pal.bed);for(const [id,M] of B.L.out){const p=parts.find(q=>q.id===id);draw(bufs[id],M,pal[p.mat==='TPU'?'tpu':p.role]||pal.frame);}}
      else{for(const [id,M] of pose.inst){const p=parts.find(q=>q.id===id);if(!p||p.hidden)continue;draw(bufs[id],M,pal[p.mat==='TPU'?'tpu':p.role]||pal.frame);}
        const bt=[],mk=[];for(const b of (pose.belts||[])){bt.push(...tubeTris(b.pts,b.r||1.6,8,b.closed!==false));if(b.travel!==undefined){const A=along(b.pts);const k=Math.max(4,Math.round(A.len/45));for(let i=0;i<k;i++){const q=A.at(b.travel+i*A.len/k);mk.push(...cube(q,(b.r||1.6)*1.5));}}}
        drawDyn(bt,pal.belt);drawDyn(mk,pal.driver);}}
    requestAnimationFrame(frame);}
  function cube(c,s){const m=K.box(2*s,2*s,c[2]-s,c[2]+s,c[0],c[1]);return m.t;}
  requestAnimationFrame(frame);
  return{destroy(){alive=false;mo.disconnect();try{gl&&gl.getExtension('WEBGL_lose_context')&&gl.getExtension('WEBGL_lose_context').loseContext();}catch(_){}}};}
function persp(f,a,n,fa){const t=1/Math.tan(f/2);return[t/a,0,0,0,0,t,0,0,0,0,(fa+n)/(n-fa),-1,0,0,2*fa*n/(n-fa),0];}
function look(e,c,u){let z=[e[0]-c[0],e[1]-c[1],e[2]-c[2]];let l=Math.hypot(...z);z=z.map(v=>v/l);let x=[u[1]*z[2]-u[2]*z[1],u[2]*z[0]-u[0]*z[2],u[0]*z[1]-u[1]*z[0]];l=Math.hypot(...x);x=x.map(v=>v/l);const y=[z[1]*x[2]-z[2]*x[1],z[2]*x[0]-z[0]*x[2],z[0]*x[1]-z[1]*x[0]];
  return[x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-(x[0]*e[0]+x[1]*e[1]+x[2]*e[2]),-(y[0]*e[0]+y[1]*e[1]+y[2]*e[2]),-(z[0]*e[0]+z[1]*e[1]+z[2]*e[2]),1];}
return{MODELS,mount,K,along};
})();

/* ===== 507 Movements · printable models 1–10 ===== */
(()=>{
const {M4,circle,rrect,prism,lathe,cyl,tubeSolid,box,merge,lobes,hull,ring}=K,PI=Math.PI,TAU=2*PI,MODELS=window.CAD.MODELS;
const mod=(a,n)=>((a%n)+n)%n;
/* ---------- standard hardware dimensions (mm) ---------- */
const BASE=5,PIN=3,BORE=3.3,CAPR=6,CAPH=4,CAPB=2.95,GAP=0.3,PH=12,CORD=1.5;
/* a grooved pulley; Rp = radius at the cord centre */
function pulley(Rp,o={}){const H=o.h||PH,rb=BORE,Ro=Rp+2,g=Rp-1.5;let prof;
  if(o.flat)prof=[[rb,0],[Ro,0],[Ro+0.8,H/2],[Ro,H],[rb+3.2,H],[rb+3.2,H+2],[rb,H+2]];
  else prof=[[rb,0],[Ro,0],[Ro,H/2-3],[g,H/2-0.9],[g,H/2+0.9],[Ro,H/2+3],[Ro,H],[rb+3.2,H],[rb+3.2,H+2],[rb,H+2]];
  const parts=[lathe(prof,96)];if(o.dbore){/* D-bore marker: a key on the inside is not printable without CSG, so the key is a flat tab glued in */}
  parts.push(box(Ro-8,3,H,H+1.2,(Ro+8)/2,0));if(o.knob)parts.push(cyl(3.5,H,H+14,32,Ro*0.62,0));return merge(...parts);}
/* stepped pulley: steps bottom-to-top [{Rp,h}] */
function stepped(steps){const rb=BORE;const prof=[[rb,0]];let z=0;for(const s of steps){const Ro=s.Rp+2,g=s.Rp-1.5;prof.push([Ro,z],[Ro,z+s.h/2-2.6],[g,z+s.h/2-0.9],[g,z+s.h/2+0.9],[Ro,z+s.h/2+2.6],[Ro,z+s.h]);z+=s.h;}
  prof.push([rb+3.2,z],[rb+3.2,z+2],[rb,z+2]);const top=steps[steps.length-1];return merge(lathe(prof,96),box(top.Rp-6,3,z,z+1.2,(top.Rp+2+8)/2,0));}
/* cone / shaped cone, radius r(f) for f in 0..1 over height h, with lips */
function cone(rf,h,o={}){const rb=BORE,n=24,prof=[[rb,0],[rf(0)+3,0],[rf(0)+3,2]];for(let i=0;i<=n;i++){const f=i/n;prof.push([rf(f),2+f*(h-4)]);}prof.push([rf(1)+3,h-2],[rf(1)+3,h],[rb+3.2,h],[rb+3.2,h+2],[rb,h+2]);
  const r1=rf(1);const m=[lathe(prof,96),box(r1-6,3,h+0,h+1.2,(r1+8)/2,0)];if(o.knob)m.push(cyl(3.5,h,h+14,32,(r1+3)*0.62,0));return merge(...m);}
const cap=()=>tubeSolid(CAPR,CAPB,0,CAPH,40);
/* z-levels of a pulley sitting on a boss whose top is at zb */
const lv=(zb,h=PH)=>({z0:zb+GAP,belt:zb+GAP+h/2,capZ:zb+GAP+h+2+GAP,pinTop:zb+GAP+h+2+GAP+CAPH});
/* base plate: outline, extra holes, and pins [{x,y,zb,top}] */
function basePlate(outline,holes,pins){const m=[prism(outline,holes||[],0,BASE)];for(const p of pins){if(p.zb>BASE+0.01)m.push(p.tube?tubeSolid(6,BORE,BASE,p.zb,40,p.x,p.y):cyl(6,BASE,p.zb,40,p.x,p.y));if(p.top)m.push(cyl(PIN,p.zb,p.top,32,p.x,p.y));}return merge(...m);}
/* ---------- 2D belt loops: circles [{c:[x,y],r,s}] travelled in order; s=+1 anticlockwise ---------- */
function tangent(A,B){const dx=B.c[0]-A.c[0],dy=B.c[1]-A.c[1],D=Math.hypot(dx,dy),th=Math.atan2(dy,dx),k=(A.r-A.s*B.s*B.r)/D;if(Math.abs(k)>1)return null;
  for(const sg of [1,-1]){const a=th+sg*Math.acos(k);const p1=[A.c[0]+A.r*Math.cos(a),A.c[1]+A.r*Math.sin(a)],dir=[A.s*-Math.sin(a),A.s*Math.cos(a)];const t=(B.c[0]-p1[0])*dir[0]+(B.c[1]-p1[1])*dir[1];if(t>0)return{a1:a,p1,p2:[p1[0]+t*dir[0],p1[1]+t*dir[1]]};}return null;}
function loop2D(cs,step=2.5){const segs=[];for(let i=0;i<cs.length;i++){segs.push(tangent(cs[i],cs[(i+1)%cs.length]));}const pts=[];
  for(let i=0;i<cs.length;i++){const C=cs[i],inn=segs[(i-1+cs.length)%cs.length],out=segs[i];const ain=Math.atan2(inn.p2[1]-C.c[1],inn.p2[0]-C.c[0]),aout=out.a1;let d=C.s>0?mod(aout-ain,TAU):-mod(ain-aout,TAU);const n=Math.max(2,Math.ceil(Math.abs(d)*C.r/step));
    for(let k=0;k<n;k++){const a=ain+d*k/n;pts.push([C.c[0]+C.r*Math.cos(a),C.c[1]+C.r*Math.sin(a),i,'arc']);}
    const L=Math.hypot(out.p2[0]-out.p1[0],out.p2[1]-out.p1[1]),m=Math.max(1,Math.ceil(L/step));for(let k=0;k<m;k++)pts.push([out.p1[0]+(out.p2[0]-out.p1[0])*k/m,out.p1[1]+(out.p2[1]-out.p1[1])*k/m,i,'line']);}
  return pts;}
const lenOf=pts=>{let s=0;for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];s+=Math.hypot(b[0]-a[0],b[1]-a[1],(b[2]||0)-(a[2]||0));}return s;};
const to3=(pts,z)=>pts.map(p=>[p[0],p[1],typeof z==='function'?z(p):z]);
const PZ=(x,y,zb,a)=>M4.mul(M4.T(x,y,lv(zb).z0),M4.Rz(a));
const CAPM=(x,y,zb)=>M4.T(x,y,lv(zb).capZ);
const cordNote=L=>`A 3 mm rubber O-ring cord about ${Math.round(L)} mm long, glued into a loop (or a rubber band of that size). Or print the TPU belt included in the zip.`;
const beltPart=(L,id='belt')=>({id,name:'Belt (optional, TPU)',mat:'TPU',role:'belt',mesh:ring(L*0.96/TAU,CORD,128,12),note:'print in flexible TPU, or use an O-ring cord instead',hidden:true});
const COMMON=['Push each pulley onto its pin, with the ribbed face up.','Press a cap onto each pin top so the pulley turns freely without lifting off.'];

/* ===== 1 · 2 open and crossed belts ===== */
function beltPair(n,crossed){const A=[-45,0],B=[50,0],RA=30,zb=BASE+1;MODELS[n]={
  summary:crossed?'Two grooved pulleys on a base, joined by a band crossed into a figure of eight. Turn the brass pulley by its knob: the blue one turns the opposite way.':'Two grooved pulleys on a base, joined by a band. Turn the brass pulley by its knob: the blue one follows in the same direction, faster because it is smaller.',
  params:[{id:'rb',label:'Driven pulley size',min:16,max:28,step:2,value:crossed?24:18,fmt:v=>`${v*2} mm across the groove`,rebuild:true}],
  loopOf(P){return loop2D(crossed?[{c:A,r:RA,s:1},{c:B,r:P.rb,s:-1}]:[{c:A,r:RA,s:1},{c:B,r:P.rb,s:1}]);},
  parts(P){const L=lenOf(this.loopOf(P));this.L=L;const l=lv(zb);return[
    {id:'base',name:'Base plate',role:'frame',mesh:basePlate(rrect(180,80,8),[],[{x:A[0],y:A[1],zb,top:l.pinTop},{x:B[0],y:B[1],zb,top:l.pinTop}]),note:'pins are printed in place'},
    {id:'pa',name:'Driving pulley',role:'driver',mesh:pulley(RA,{knob:true}),note:'knob up'},
    {id:'pb',name:'Driven pulley',role:'driven',mesh:pulley(P.rb)},
    {id:'cap',name:'Pin cap',qty:2,role:'small',mesh:cap()},beltPart(L)];},
  pose(phi,P){const l=lv(zb),pts=this.loopOf(P);const z=crossed?(p=>l.belt+(p[3]==='line'?(p[2]===0?1.6:-1.6)*Math.sin(PI*Math.min(1,Math.max(0,(p[0]-A[0])/(B[0]-A[0])))):0)):l.belt;
    const b=(crossed?-1:1)*phi*RA/P.rb;return{inst:[['base',M4.id()],['pa',PZ(A[0],A[1],zb,phi)],['pb',PZ(B[0],B[1],zb,b)],['cap',CAPM(A[0],A[1],zb)],['cap',CAPM(B[0],B[1],zb)]],
      belts:[{pts:to3(pts,z),r:CORD,travel:phi*RA}],read:`driver ${Math.round(phi*180/PI)%360}° · driven ${(crossed?'reverse ':'')}${(RA/P.rb).toFixed(2)}× speed`};},
  get hardware(){return[cordNote(this.L||350)];},
  steps:[...COMMON,crossed?'Twist the band once into a figure of eight and stretch it over both grooves.':'Stretch the band over both grooves.','Turn the knob: the band should drive without slipping. If it slips, use a slightly shorter band.']};}
beltPair(1,false);beltPair(2,true);

/* ---------- brackets for pulleys on tilted or horizontal axles ---------- */
/* plate (printed flat, pin up) glued to a wedge (printed on its side) that drops into a slot in the base */
const PLW=36,PLT=4;
function bracket(Gc,n,yw){/* Gc = groove centre, n = axle unit vector (in XZ plane), yw = y of the bracket */
  const l=Math.hypot(...n);n=n.map(v=>v/l);const off=PLT+1+GAP+PH/2;/* plate bottom to groove */const O=[Gc[0]-n[0]*off,Gc[1]-n[1]*off,Gc[2]-n[2]*off];/* plate origin (bottom face centre) */
  const F=M4.frame(O,n,[0,1,0]);const t=[n[2],0,-n[0]];
  const half=PLW/2,b1=[O[0]+t[0]*half,O[2]+t[2]*half],b2=[O[0]-t[0]*half,O[2]-t[2]*half];
  const away=n[0]>=0?-1:1;const xs=[b1[0],b2[0]];const foot=[(away<0?Math.min(...xs):Math.max(...xs))+away*14,0];
  const prof=hull([b1,b2,[b1[0],0],[b2[0],0],foot]);
  const minx=Math.min(...prof.map(p=>p[0])),maxx=Math.max(...prof.map(p=>p[0]));
  return{F,O,n,prof,slot:[[minx-0.3,Gc[1]-half-0.3],[maxx+0.3,Gc[1]-half-0.3],[maxx+0.3,Gc[1]+half+0.3],[minx-0.3,Gc[1]+half+0.3]],
    wedgeMesh:prism(prof,[],0,PLW),wedgeM:[1,0,0,0, 0,0,1,0, 0,1,0,0, 0,Gc[1]-half,0,1],
    pulleyM:a=>M4.chain(F,M4.T(0,0,PLT+1+GAP),M4.Rz(a)),capM:M4.chain(F,M4.T(0,0,PLT+1+GAP+PH+2+GAP))};}
const plateMesh=()=>merge(box(PLW,PLW,0,PLT),cyl(6,PLT,PLT+1,40),cyl(PIN,PLT,PLT+1+GAP+PH+2+GAP+CAPH,32));
const arc3=(c,e1,e2,r,a0,a1,step=2.5)=>{const n=Math.max(2,Math.ceil(Math.abs(a1-a0)*r/step)),o=[];for(let k=0;k<n;k++){const a=a0+(a1-a0)*k/n;o.push([c[0]+r*(Math.cos(a)*e1[0]+Math.sin(a)*e2[0]),c[1]+r*(Math.cos(a)*e1[1]+Math.sin(a)*e2[1]),c[2]+r*(Math.cos(a)*e1[2]+Math.sin(a)*e2[2])]);}return o;};
const line3=(a,b,step=3)=>{const n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2])/step)),o=[];for(let k=0;k<n;k++)o.push([a[0]+(b[0]-a[0])*k/n,a[1]+(b[1]-a[1])*k/n,a[2]+(b[2]-a[2])*k/n]);return o;};

/* ===== 3 · right-angle belt with guide pulleys ===== */
(()=>{const RA=25.5,RB=20.5,zbA=12,hA=lv(zbA).belt,yB=62,zB=hA+2.7+RB,yG1=112,yG2=150;
  const L1b=[0,yG1,zB-RB],L1a=[RA,yG1,hA],G1c=[(L1a[0]+L1b[0])/2,yG1,(L1a[2]+L1b[2])/2],rG1=Math.hypot(L1a[0]-L1b[0],L1a[2]-L1b[2])/2;
  const L2a=[0,yG2,zB+RB],L2b=[-RA,yG2,hA],G2c=[(L2a[0]+L2b[0])/2,yG2,(L2a[2]+L2b[2])/2],rG2=Math.hypot(L2a[0]-L2b[0],L2a[2]-L2b[2])/2;
  const nOf=(a,b)=>{const v=[b[0]-a[0],0,b[2]-a[2]];const n=[v[2],0,-v[0]];return n[2]<0?n.map(x=>-x):n;};
  const n1=nOf(L1a,L1b),n2=nOf(L2a,L2b);
  const BR={B:bracket([0,yB,zB],[1,0,0],yB),G1:bracket(G1c,n1),G2:bracket(G2c,n2)};
  const path=(()=>{let p=[];p=p.concat(line3([RA,0,hA],L1a));const w1=[(L1a[0]-G1c[0])/rG1,0,(L1a[2]-G1c[2])/rG1];p=p.concat(arc3(G1c,w1,[0,1,0],rG1,0,PI));
    p=p.concat(line3(L1b,[0,yB,zB-RB]));p=p.concat(arc3([0,yB,zB],[0,0,-1],[0,-1,0],RB,0,PI));p=p.concat(line3([0,yB,zB+RB],L2a));
    const w2=[(L2a[0]-G2c[0])/rG2,0,(L2a[2]-G2c[2])/rG2];p=p.concat(arc3(G2c,w2,[0,1,0],rG2,0,PI));p=p.concat(line3(L2b,[-RA,0,hA]));p=p.concat(arc3([0,0,hA],[-1,0,0],[0,-1,0],RA,0,PI));return p;})();
  const L=lenOf(path);
  const slots=[BR.B.slot,BR.G1.slot,BR.G2.slot];
  MODELS[3]={summary:'A flat pulley on the base drives an upright pulley at right angles. Two tilted guide pulleys lead the band round, so each strand always runs into the plane of the pulley it meets.',cam:{yaw:-0.5,pitch:0.5},
    parts(){const lA=lv(zbA);return[
      {id:'base',name:'Base plate',role:'frame',mesh:basePlate(rrect(150,240,8,8,0,62),slots,[{x:0,y:0,zb:zbA,top:lA.pinTop}]),note:'three slots take the bracket wedges'},
      {id:'pa',name:'Driving pulley (flat)',role:'driver',mesh:pulley(RA-0.0,{knob:true})},
      {id:'pb',name:'Upright pulley',role:'driven',mesh:pulley(RB)},
      {id:'g1',name:'Small guide pulley',role:'link',mesh:pulley(rG1)},{id:'g2',name:'Large guide pulley',role:'link',mesh:pulley(rG2)},
      {id:'pl',name:'Bracket plate with pin',qty:3,role:'frame',mesh:plateMesh(),note:'pin up, no supports'},
      {id:'wB',name:'Wedge for the upright pulley',role:'frame',mesh:BR.B.wedgeMesh,note:'print lying on its side'},
      {id:'w1',name:'Wedge for the small guide',role:'frame',mesh:BR.G1.wedgeMesh,note:'print lying on its side'},
      {id:'w2',name:'Wedge for the large guide',role:'frame',mesh:BR.G2.wedgeMesh,note:'print lying on its side'},
      {id:'cap',name:'Pin cap',qty:4,role:'small',mesh:cap()},beltPart(L)];},
    pose(phi){const s=phi*RA;return{inst:[['base',M4.id()],['pa',PZ(0,0,zbA,phi)],['cap',CAPM(0,0,zbA)],
      ['pl',BR.B.F],['wB',BR.B.wedgeM],['pb',BR.B.pulleyM(-s/RB)],['cap',BR.B.capM],
      ['pl',BR.G1.F],['w1',BR.G1.wedgeM],['g1',BR.G1.pulleyM(s/rG1)],['cap',BR.G1.capM],
      ['pl',BR.G2.F],['w2',BR.G2.wedgeM],['g2',BR.G2.pulleyM(-s/rG2)],['cap',BR.G2.capM]],
      belts:[{pts:path,r:CORD,travel:s}],read:`flat pulley ${Math.round(phi*180/PI)%360}° · upright pulley ${(RA/RB).toFixed(2)}× speed, at right angles`};},
    hardware:[cordNote(L),'A few drops of superglue to fix each bracket plate onto its wedge.'],
    steps:['Push each wedge down into its slot in the base; the sloping face looks towards the pulley it carries.','Glue a bracket plate onto each sloping face, pin pointing away from the wedge.',...COMMON,'Lead the band from the flat pulley out to the small guide, back to the bottom of the upright pulley, over its top, out to the large guide and back to the flat pulley.']};
})();

/* ===== 4 · right-angle drive without guides (quarter-turn band) ===== */
(()=>{const RA=25.5,RB=20.5,zbA=8,hA=lv(zbA).belt,yB=72,zB=hA+RB,xB=RA;
  const BRB=bracket([xB,yB,zB],[1,0,0]);
  const path=(()=>{/* strand 1: from A at angle 0 up to B (tangent in B plane, B turns clockwise seen from +x) */
    const P=[0,hA],c=[yB,zB],d=Math.hypot(c[0]-P[0],c[1]-P[1]),th=Math.atan2(P[1]-c[1],P[0]-c[0]),be=Math.acos(RB/d);let T1=null,aT=0;
    for(const sg of [1,-1]){const a=th+sg*be;const q=[c[0]+RB*Math.cos(a),c[1]+RB*Math.sin(a)];const v=[Math.sin(a),-Math.cos(a)];if((q[0]-P[0])*v[0]+(q[1]-P[1])*v[1]>0){T1=q;aT=a;}}
    /* B wraps clockwise from aT down to -90deg */let a1=-PI/2;while(a1>aT)a1-=TAU;
    const Lb=[xB,yB,hA];/* strand 2: from B bottom to A tangent (A anticlockwise) */
    const Q=[xB,yB],D=Math.hypot(Q[0],Q[1]),ph=Math.atan2(Q[1],Q[0]),ga=Math.acos(RA/D);let TA=null,aA=0;for(const sg of [1,-1]){const a=ph+sg*ga;const q=[RA*Math.cos(a),RA*Math.sin(a)];const v=[-Math.sin(a),Math.cos(a)];if((q[0]-Q[0])*v[0]+(q[1]-Q[1])*v[1]>0.01){TA=q;aA=a;}}
    let p=[];p=p.concat(line3([RA,0,hA],[xB,T1[0],T1[1]]));const ab=[];const n=Math.ceil(Math.abs(a1-aT)*RB/2.5);for(let k=0;k<n;k++){const a=aT+(a1-aT)*k/n;ab.push([xB,yB+RB*Math.cos(a),zB+RB*Math.sin(a)]);}p=p.concat(ab);
    p=p.concat(line3(Lb,[TA[0],TA[1],hA]));let e=mod(aA,TAU);const m=Math.ceil((TAU-e)*RA/2.5);for(let k=0;k<m;k++){const a=e+(TAU-e)*k/m;p.push([RA*Math.cos(a),RA*Math.sin(a),hA]);}return p;})();
  const L=lenOf(path);
  MODELS[4]={summary:'The band itself twists a quarter turn between a flat pulley and an upright one, with no guides. It works one way round only: each strand must run into the middle of the pulley it is heading for.',cam:{yaw:-0.4,pitch:0.45},
    parts(){const lA=lv(zbA);return[
      {id:'base',name:'Base plate',role:'frame',mesh:basePlate(rrect(130,150,8,8,10,40),[BRB.slot],[{x:0,y:0,zb:zbA,top:lA.pinTop}]),note:'slot takes the bracket wedge'},
      {id:'pa',name:'Driving pulley (flat)',role:'driver',mesh:pulley(RA,{knob:true})},{id:'pb',name:'Upright pulley',role:'driven',mesh:pulley(RB)},
      {id:'pl',name:'Bracket plate with pin',role:'frame',mesh:plateMesh(),note:'pin up, no supports'},{id:'wB',name:'Bracket wedge',role:'frame',mesh:BRB.wedgeMesh,note:'print lying on its side'},
      {id:'cap',name:'Pin cap',qty:2,role:'small',mesh:cap()},beltPart(L)];},
    pose(phi){const s=phi*RA;return{inst:[['base',M4.id()],['pa',PZ(0,0,zbA,phi)],['cap',CAPM(0,0,zbA)],['pl',BRB.F],['wB',BRB.wedgeM],['pb',BRB.pulleyM(-s/RB)],['cap',BRB.capM]],
      belts:[{pts:path,r:CORD,travel:s}],read:`turn the knob anticlockwise (seen from above) · upright pulley ${(RA/RB).toFixed(2)}× speed`};},
    hardware:[cordNote(L),'Superglue for the bracket plate.'],
    steps:['Push the wedge into the base slot and glue the bracket plate onto its upright face, pin pointing outwards.',...COMMON,'Fit the band so it leaves the flat pulley straight up into the upright pulley, and comes back down off the bottom of the upright pulley.','Turn the knob anticlockwise. Turned the other way the band will run off: that is Brown\'s point.']};
})();

/* ===== 5 · belt tightener clutch ===== */
(()=>{const A=[-55,0],B=[55,0],R=24.5,RT=10.5,zbAB=BASE+7,Pv=[-26,-58],armT=[26,35],zbL=BASE+0.3,LT=5;
  const Tpos=e=>{const a=e?0:-0.55,c=Math.cos(a),s=Math.sin(a);return[Pv[0]+armT[0]*c-armT[1]*s,Pv[1]+armT[0]*s+armT[1]*c];};
  const H=[Pv[0]-34,Pv[1]-28];
  const LZ=zbL+GAP;const leverMesh=()=>{const T=[armT[0],armT[1]],Hh=[H[0]-Pv[0],H[1]-Pv[1]];const out=lobes([[0,0,9],[T[0],T[1],8],[Hh[0],Hh[1],7]]);
    return merge(prism(out,[circle(BORE,32,0,0)],0,LT),cyl(6,LT,zbAB-LZ,40,T[0],T[1]),cyl(PIN,LT,lv(zbAB).pinTop-LZ,32,T[0],T[1]),cyl(4,LT,LT+16,32,Hh[0],Hh[1]));};
  const engagedLoop=()=>loop2D([{c:A,r:R,s:-1},{c:B,r:R,s:-1},{c:Tpos(true),r:RT,s:1}]);
  const L=lenOf(engagedLoop());
  MODELS[5]={summary:'Two pulleys joined by a slightly long band. Swing the lever and its small pulley presses the band tight, so the drive takes up; swing it back and the band goes slack and the driven pulley stops.',
    params:[{id:'e',type:'toggle',label:'Tightener',options:[[1,'Engaged'],[0,'Released']],value:1}],
    parts(){const l=lv(zbAB);return[
      {id:'base',name:'Base plate',role:'frame',mesh:basePlate(rrect(190,130,8,8,0,-20),[],[{x:A[0],y:A[1],zb:zbAB,top:l.pinTop},{x:B[0],y:B[1],zb:zbAB,top:l.pinTop},{x:Pv[0],y:Pv[1],zb:zbL,top:zbL+GAP+LT+GAP+CAPH+1}]),note:'tall bosses lift the pulleys above the lever'},
      {id:'pa',name:'Driving pulley',role:'driver',mesh:pulley(R,{knob:true})},{id:'pb',name:'Driven pulley',role:'driven',mesh:pulley(R)},{id:'pt',name:'Tightener pulley',role:'link',mesh:pulley(RT)},
      {id:'lev',name:'Tightener lever',role:'link',mesh:leverMesh(),note:'pin and handle up'},{id:'cap',name:'Pin cap',qty:4,role:'small',mesh:cap()},beltPart(L)];},
    pose(phi,P,S){if(S.last===undefined){S.last=phi;S.b=0;S.sp=1;}const d=phi-S.last;S.last=phi;S.sp+=((P.e?1:0)-S.sp)*Math.min(1,Math.abs(d)*1.2);S.b+=d*S.sp;
      const ang=P.e?0:-0.55,T=Tpos(P.e),l=lv(zbAB);let pts;
      if(P.e)pts=to3(engagedLoop(),l.belt);else{const base=loop2D([{c:A,r:R,s:-1},{c:B,r:R,s:-1}]);pts=to3(base,l.belt).map((p,i)=>{if(base[i][3]==='line'&&base[i][2]===1){const f=(p[0]-B[0])/(A[0]-B[0]);return[p[0],p[1]-14*Math.sin(PI*Math.max(0,Math.min(1,f))),p[2]];}return p;});}
      return{inst:[['base',M4.id()],['pa',PZ(A[0],A[1],zbAB,-phi)],['pb',PZ(B[0],B[1],zbAB,-S.b)],['cap',CAPM(A[0],A[1],zbAB)],['cap',CAPM(B[0],B[1],zbAB)],
        ['lev',M4.mul(M4.T(Pv[0],Pv[1],zbL+GAP),M4.Rz(ang))],['pt',PZ(T[0],T[1],zbAB,phi*R/RT)],['cap',CAPM(T[0],T[1],zbAB)],['cap',M4.T(Pv[0],Pv[1],zbL+GAP+LT+GAP)]],
        belts:[{pts,r:CORD,travel:P.e?phi*R:phi*R*0.15}],read:P.e?`engaged · driven pulley at ${Math.round(S.sp*100)} % speed`:`released · band slack, driven pulley ${S.sp>0.05?'slowing':'stopped'}`};},
    hardware:[cordNote(L)],
    steps:['Drop the lever over the short pin near the front edge and cap it.',...COMMON,'Fit the band round the two big pulleys, then swing the lever so the small pulley presses up into the lower strand.','Turn the knob, then swing the lever back: the drive stops.']};
})();

/* ===== 6 · lever and segment driving two pulleys ===== */
(()=>{const O=[0,28],RS=50,RP=15,D=75,P1=[O[0]+D*Math.cos(-125*PI/180),O[1]+D*Math.sin(-125*PI/180)],P2=[O[0]+D*Math.cos(-55*PI/180),O[1]+D*Math.sin(-55*PI/180)],zbS=BASE+4,SH=14,AMP=0.25;
  const segMesh=()=>{const rb=BORE,Ro=RS+2,g=RS-1.5;const prof=[[rb,0],[Ro,0],[Ro,1],[g,3],[g,4.6],[Ro,6.6],[Ro,7.4],[g,9.4],[g,11],[Ro,13],[Ro,SH],[rb,SH]];
    const a0=-PI-0.08,a1=0.08,n=60,m=K.mesh();const P3=(p,a)=>[p[0]*Math.cos(a),p[0]*Math.sin(a),p[1]];
    for(let i=0;i<n;i++){const t0=a0+(a1-a0)*i/n,t1=a0+(a1-a0)*(i+1)/n;for(let j=0;j<prof.length;j++){const p=prof[j],q=prof[(j+1)%prof.length];K.tri(m,P3(p,t0),P3(q,t0),P3(q,t1));K.tri(m,P3(p,t0),P3(q,t1),P3(p,t1));}}
    const T=K.triangulate(prof);for(const [a,b,c] of T.tris){K.tri(m,P3(T.pts[a],a0),P3(T.pts[c],a0),P3(T.pts[b],a0));K.tri(m,P3(T.pts[a],a1),P3(T.pts[b],a1),P3(T.pts[c],a1));}
    K.orient(m);const arm=prism(lobes([[0,0,9],[0,78,8]]),[circle(BORE,32,0,0)],0,SH);return merge(m,arm,cyl(4,SH,SH+16,32,0,78));};
  const best=P=>{const x=loop2D([{c:O,r:RS,s:1},{c:P,r:RP,s:-1}]);const rest=x.filter(p=>!(p[2]===0&&p[3]==='arc'));return{rest,aA:Math.atan2(x[0][1]-O[1],x[0][0]-O[0]),aD:Math.atan2(rest[0][1]-O[1],rest[0][0]-O[0]),s:1};};
  const cordPath=(C,a,z)=>{const ends=[a-0.04,a-PI+0.04];const arc=(from,to,s)=>{const d=s>0?mod(to-from,TAU):-mod(from-to,TAU);const n=Math.max(2,Math.ceil(Math.abs(d)*RS/2.5)),o=[];for(let k=0;k<=n;k++){const t=from+d*k/n;o.push([O[0]+RS*Math.cos(t),O[1]+RS*Math.sin(t),z]);}return{o,d};};
    const dep=ends.map(e=>arc(e,C.aD,C.s)).sort((p,q)=>Math.abs(p.d)-Math.abs(q.d))[0].o,arr=ends.map(e=>arc(C.aA,e,C.s)).sort((p,q)=>Math.abs(p.d)-Math.abs(q.d))[0].o;
    return dep.concat(to3(C.rest,z),arr);};
  const loops=()=>[best(P1),best(P2)];
  const [la,lb]=loops(),L1=lenOf(cordPath(la,0,0)),L2=lenOf(cordPath(lb,0,0));const zU=lv(zbS).z0+10.2,zL=lv(zbS).z0+3.8;const zb1=zU-GAP-PH/2,zb2=zL-GAP-PH/2;
  MODELS[6]={summary:'Rock the lever and its grooved segment winds two crossed cords, turning both pulleys back and forth. Each cord is tied to the ends of the segment and wrapped once round its pulley.',
    parts(){const t=Math.max(lv(zbS,SH).pinTop,lv(zb1).pinTop);return[
      {id:'base',name:'Base plate',role:'frame',mesh:basePlate(rrect(170,150,8,8,0,-5),[],[{x:O[0],y:O[1],zb:zbS,top:lv(zbS,SH).pinTop},{x:P1[0],y:P1[1],zb:zb1,top:lv(zb1).pinTop},{x:P2[0],y:P2[1],zb:zb2,top:lv(zb2).pinTop}]),note:'bosses set the two cord levels'},
      {id:'seg',name:'Lever and segment',role:'driver',mesh:segMesh(),note:'two cord grooves; flat side down'},
      {id:'p1',name:'Left pulley',role:'driven',mesh:pulley(RP)},{id:'p2',name:'Right pulley',role:'driven',mesh:pulley(RP)},{id:'cap',name:'Pin cap',qty:3,role:'small',mesh:cap()}];},
    pose(phi){const a=AMP*Math.sin(phi);const pr=-a*RS/RP;const R2=(p,a)=>{const c=Math.cos(a),s=Math.sin(a);return[O[0]+(p[0]-O[0])*c-(p[1]-O[1])*s,O[1]+(p[0]-O[0])*s+(p[1]-O[1])*c];};
      return{inst:[['base',M4.id()],['seg',M4.mul(M4.T(O[0],O[1],lv(zbS).z0),M4.Rz(a))],['p1',PZ(P1[0],P1[1],zb1,pr)],['p2',PZ(P2[0],P2[1],zb2,pr)],['cap',M4.T(O[0],O[1],lv(zbS,SH).capZ)],['cap',CAPM(P1[0],P1[1],zb1)],['cap',CAPM(P2[0],P2[1],zb2)]],
        belts:[{pts:cordPath(la,a,zU),r:1,closed:false},{pts:cordPath(lb,a,zL),r:1,closed:false}],read:`lever ${(a*180/PI).toFixed(0)}° · each pulley ${(-a*RS/RP*180/PI).toFixed(0)}°`};},
    hardware:[`Two lengths of thin cord or fishing line, about ${Math.round(L1+40)} and ${Math.round(L2+40)} mm, including spare for the knots.`],
    steps:['Put the segment on the middle pin, then the two pulleys on theirs, and cap all three.','Tie a cord to one end of the upper groove, run it down and round the left pulley once, cross it over and tie it to the other end of the groove.','Do the same for the right pulley in the lower groove.','Rock the lever by its handle: both pulleys turn back and forth together.']};
})();

/* ===== 7 · fast and loose pulleys ===== */
(()=>{const D=[-55,0],S=[40,0],RD=24,RF=20,HD=26;const zb=BASE+1,l=lv(zb);const zLoose=l.z0,zFast=zLoose+PH+GAP,zTop=zFast+PH+2+GAP;
  const shaft=()=>{const sh=K.circle(PIN-0.15,40);const dsh=sh.map(p=>[Math.min(p[0],PIN-0.15-0.6),p[1]]);return merge(cyl(14,0,3,48),prism(dsh,[],3,3+(zTop-0)+0.0),box(10,2.5,3,4.2,8,0));};
  const FP=[22,-50],EY=28;
  const fork=()=>{const eye=K.xf(prism(rrect(14,16,3,4,EY,8),[circle(3.4,32,EY,9)],-5,5),[0,1,0,0, 0,0,1,0, 1,0,0,0, 0,0,0,1]);return merge(prism(lobes([[0,0,7],[0,EY,6]]),[circle(BORE,32,0,0)],0,4),eye);};
  MODELS[7]={summary:'A wide driving drum and, on the output shaft, a loose pulley under a fast one. Slide the belt fork up and the band moves onto the fast pulley, which is keyed to the shaft; slide it down and the band idles on the loose pulley.',
    params:[{id:'f',type:'toggle',label:'Band on',options:[[1,'Fast pulley'],[0,'Loose pulley']],value:1}],
    parts(){const top=lv(zb,HD).pinTop;return[
      {id:'base',name:'Base plate',role:'frame',mesh:basePlate(rrect(170,90,8,8,-5,-6),[circle(BORE,32,S[0],S[1])],[{x:D[0],y:D[1],zb,top},{x:S[0],y:S[1],zb,top:0,tube:true},{x:FP[0],y:FP[1],zb:BASE,top:BASE+50}]),note:'hole for the output shaft; tall post for the fork'},
      {id:'drum',name:'Driving drum',role:'driver',mesh:pulley(RD,{flat:true,h:HD}),note:'crowned face keeps the band on'},
      {id:'loose',name:'Loose pulley',role:'link',mesh:pulley(RF,{flat:true}),note:'round bore, turns freely'},
      {id:'fast',name:'Fast pulley',role:'driven',mesh:pulley(RF,{flat:true}),note:'glue it to the shaft (or file a flat in the bore)'},
      {id:'shaft',name:'Output shaft with top disk',role:'driven',mesh:shaft(),note:'print disk down; flat side keys the fast pulley'},
      {id:'fork',name:'Belt fork',role:'link',mesh:fork(),note:'slides on the post'},{id:'cap',name:'Pin cap',qty:1,role:'small',mesh:cap()},beltPart(2*95+PI*(RD+RF))];},
    pose(phi,P,St){if(St.last===undefined){St.last=phi;St.o=0;St.sp=1;St.lz=0;}const d=phi-St.last;St.last=phi;St.sp+=((P.f?1:0)-St.sp)*Math.min(1,Math.abs(d)*2);St.o+=d*St.sp*RD/RF;St.lz+=(((P.f?1:0))-St.lz)*0.12;
      const bz=zLoose+PH/2+St.lz*(PH+GAP);const pts=to3(loop2D([{c:D,r:RD,s:1},{c:S,r:RF,s:1}]),bz);
      return{inst:[['base',M4.id()],['drum',PZ(D[0],D[1],zb,phi)],['cap',M4.T(D[0],D[1],lv(zb,HD).capZ)],['loose',M4.mul(M4.T(S[0],S[1],zLoose),M4.Rz(P.f?St.o*0.3:phi*RD/RF))],['fast',M4.mul(M4.T(S[0],S[1],zFast),M4.Rz(St.o))],
        ['shaft',M4.mul(M4.mul(M4.T(S[0],S[1],zTop+3),M4.Rx(PI)),M4.Rz(-St.o))],['fork',M4.T(FP[0],FP[1],bz-9)]],
        belts:[{pts,r:CORD,travel:phi*RD}],read:P.f?`band on the fast pulley · shaft ${Math.round(St.sp*100)} % speed`:`band on the loose pulley · shaft ${St.sp>0.05?'coasting':'stopped'}`};},
    hardware:[cordNote(2*95+PI*(RD+RF)),'A drop of glue to fix the fast pulley to the shaft.'],
    steps:['Slide the loose pulley, then the fast pulley, onto the shaft from below the top disk; glue only the fast pulley.','Drop the shaft into the hole in the base.','Fit the drum on its pin and cap it; slide the fork onto the tall post.','Thread the band through the eye of the fork before joining it, then run it round the drum and the pulleys. Slide the fork up or down the post to shift the band.']};
})();

/* ===== 8 · stepped speed pulleys ===== */
(()=>{const A=[-48,0],B=[48,0],R=[14,20,26],h=9,H=27,zbA=BASE+1,zbB=BASE+3,z0A=zbA+GAP,z0B=zbB+GAP,KT=4;
  const topA=z0A+H+2+1.2+GAP+KT+GAP+CAPH,topB=z0B+H+2+GAP+CAPH;
  const knob=()=>merge(prism(lobes([[0,0,9],[18,0,6]]),[circle(BORE,32,0,0)],0,KT),cyl(3.5,KT,KT+14,32,18,0));
  MODELS[8]={summary:'Two identical stepped pulleys, one turned upside down. Moving the band from step to step gives three speeds; because each pair of radii adds up to the same total, one band fits every step.',
    params:[{id:'s',type:'toggle',label:'Band on step',options:[[0,'Slow'],[1,'Equal'],[2,'Fast']],value:1}],
    parts(){return[
      {id:'base',name:'Base plate',role:'frame',mesh:basePlate(rrect(170,80,8),[],[{x:A[0],y:A[1],zb:zbA,top:topA},{x:B[0],y:B[1],zb:zbB,top:topB}])},
      {id:'sp',name:'Stepped pulley',qty:2,role:'driver',mesh:stepped([26,20,14].map(r=>({Rp:r,h}))),note:'largest step down; the left one is fitted upside down'},
      {id:'knob',name:'Crank arm',role:'small',mesh:knob(),note:'glue onto the left pulley'},{id:'cap',name:'Pin cap',qty:2,role:'small',mesh:cap()},beltPart(2*96+PI*40)];},
    pose(phi,P){const i=P.s,ra=R[i],rb=R[2-i];const bz=z0B+h*i+h/2;const pts=to3(loop2D([{c:A,r:ra,s:1},{c:B,r:rb,s:1}]),bz);const b=phi*ra/rb;const tA=z0A+H+2+1.2;
      return{inst:[['base',M4.id()],['sp',M4.chain(M4.T(A[0],A[1],tA),M4.Rx(PI),M4.Rz(-phi))],['sp',M4.mul(M4.T(B[0],B[1],z0B),M4.Rz(b))],['knob',M4.mul(M4.T(A[0],A[1],tA+GAP*0),M4.Rz(phi))],['cap',M4.T(A[0],A[1],tA+KT+GAP)],['cap',M4.T(B[0],B[1],z0B+H+2+GAP)]],
        belts:[{pts,r:CORD,travel:phi*ra}],read:`step ${i+1} · driven ${(ra/rb).toFixed(2)}× driver speed`};},
    hardware:[cordNote(2*96+PI*40),'A drop of glue to fix the crank arm to the left pulley.'],
    steps:['Fit one stepped pulley largest step down on the right pin.','Fit the other upside down (smallest step down) on the left pin, glue the crank arm onto it, and cap both pins.','Stretch the band round any matching pair of steps and turn the crank. Move the band to change speed.']};
})();

/* ===== 9 · 10 cone pulleys ===== */
function cones(n,shaped){const A=[-50,0],B=[50,0],H=42,C=100,zb=BASE+1,z0=zb+GAP;
  const rA=shaped?(f=>12+20*(1-Math.cos(f*PI/2))):(f=>12+18*f);
  const Lopen=(a,b)=>{const g=Math.asin((a-b)/C);return 2*Math.sqrt(C*C-(a-b)**2)+(PI+2*g)*a+(PI-2*g)*b;};
  const L0=shaped?Lopen(rA(0),rA(1)):null;
  const rB=shaped?(f=>{const a=rA(f);let lo=4,hi=60;for(let k=0;k<60;k++){const m=(lo+hi)/2;if(Lopen(a,m)>L0)hi=m;else lo=m;}return(lo+hi)/2;}):(f=>30-18*f);
  MODELS[n]={summary:shaped?'Two cones with curved sides, shaped so that one band stays equally tight wherever it sits. Slide the band along to change the speed smoothly.':'Two straight cones, one turned the other way. Slide the band along them and the speed changes smoothly. With straight cones the band is a little slacker in the middle.',
    params:[{id:'f',label:'Band position',min:0,max:1,step:0.02,value:0.3,fmt:v=>`${Math.round(v*100)} % up`}],
    parts(){const top=z0+H+2+GAP+CAPH;const ca=cone(rA,H,{knob:true}),cb=cone(rB,H);return[
      {id:'base',name:'Base plate',role:'frame',mesh:basePlate(rrect(180,90,8),[],[{x:A[0],y:A[1],zb,top},{x:B[0],y:B[1],zb,top}])},
      {id:'ca',name:'Driving cone',role:'driver',mesh:ca,note:'narrow end down, knob up'},{id:'cb',name:'Driven cone',role:'driven',mesh:cb,note:shaped?'wide end down; its curve differs from the driving cone':'wide end down'},
      {id:'cap',name:'Pin cap',qty:2,role:'small',mesh:cap()},beltPart(Lopen(rA(0.5),rB(0.5)))];},
    pose(phi,P){const f=P.f,ra=rA(f),rb=rB(f),bz=z0+2+f*(H-4);const pts=to3(loop2D([{c:A,r:ra+CORD,s:1},{c:B,r:rb+CORD,s:1}]),bz);
      return{inst:[['base',M4.id()],['ca',M4.mul(M4.T(A[0],A[1],z0),M4.Rz(phi))],['cb',M4.mul(M4.T(B[0],B[1],z0),M4.Rz(phi*ra/rb))],['cap',M4.T(A[0],A[1],z0+H+2+GAP)],['cap',M4.T(B[0],B[1],z0+H+2+GAP)]],
        belts:[{pts,r:CORD,travel:phi*ra}],read:`band ${Math.round(f*100)} % up · driven ${(ra/rb).toFixed(2)}× driver speed`+(shaped?'':` · band length change ${(Lopen(ra,rb)-Lopen(rA(0),rB(0))).toFixed(1)} mm`)};},
    get hardware(){return[cordNote(Lopen(rA(0.5),rB(0.5)))];},
    steps:['Fit the driving cone narrow end down on the left pin, the driven cone wide end down on the right pin, and cap both.','Stretch the band round both cones and turn the knob; push the band up or down with a fingertip to change speed.']};}
cones(9,false);cones(10,true);
})();

})();
