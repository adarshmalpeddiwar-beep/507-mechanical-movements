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
vec3 L3=normalize(vec3(.1,-1.,.25));float d=max(dot(N,L1),0.)*.55+max(dot(N,L2),0.)*.2+max(dot(N,L3),0.)*.22;float hemi=.5+.5*N.z;
vec3 H=normalize(L1+V);float sp=pow(max(dot(N,H),0.),40.)*.22;
vec3 c=col*(.32+.16*hemi+d)+sp;float rim=pow(1.-max(dot(N,V),0.),3.);gl_FragColor=vec4(c+rim*.05,alpha);}`;
function hex(c){c=c.trim();if(c.startsWith('#')){if(c.length===4)c='#'+c[1]+c[1]+c[2]+c[2]+c[3]+c[3];return[1,3,5].map(i=>parseInt(c.slice(i,i+2),16)/255);}const m=c.match(/[\d.]+/g)||[200,200,200];return m.slice(0,3).map(v=>v/255);}
function palette(){const s=getComputedStyle(document.documentElement),g=k=>hex(s.getPropertyValue('--'+k)||'#ccc');const dark=g('sheet')[0]<0.4;
  return dark?{frame:[.40,.40,.42],driver:[1.0,.60,.16],driven:[.20,.55,.95],link:[.55,.55,.58],small:[.78,.78,.80],belt:[.10,.10,.11],bed:[.20,.20,.22],tpu:[.22,.22,.24]}
             :{frame:[.86,.86,.88],driver:[1.0,.62,.20],driven:[.18,.52,.92],link:[.70,.70,.73],small:[.96,.96,.97],belt:[.16,.16,.17],bed:[.90,.90,.92],tpu:[.25,.25,.27]};}

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
const loading={};
function chunkOf(n){const I=window.CAD.INDEX||{};for(const k in I)if(I[k].indexOf(n)>=0)return k;return null;}
function has(n){return !!MODELS[n]||!!chunkOf(n);}
function load(n){if(MODELS[n])return Promise.resolve(true);const c=chunkOf(n);if(!c)return Promise.resolve(false);
  return loading[c]||(loading[c]=new Promise((res,rej)=>{const s=document.createElement('script');s.src='js/cad/'+c+'.js';s.onload=()=>res(true);s.onerror=()=>{delete loading[c];rej(new Error('Could not load the 3D model'));};document.head.append(s);}));}
return{MODELS,mount,K,along,has,load};
})();

/* ===== 507 Movements · planar kit: printable models driven by the 2D simulation's own kinematics =====
   A model is described in the simulation's canvas coordinates (px, y down). The kit converts to mm
   (x·S, −y·S), stacks parts in layers above a base plate, adds printed pins, caps and bosses,
   and poses every part from the simulation state, so the 3D model and the 2D drawing always agree. */
const PK=(()=>{
const {M4,circle,prism,cyl,tubeSolid,box,merge,lathe,hull,ccw}=K,PI=Math.PI,TAU=2*PI;
const MODELS=window.CAD.MODELS;
/* print constants (mm) */
const BT=4,TH=4,GAP=0.5,PINR=2,BORER=2.3,CAPR=4.2,CAPH=3,CAPB=1.95,BOSSR=4.6;
let S=0.3;                                  /* mm per px while a model is being built */
const zl=l=>BT+GAP+l*(TH+GAP);               /* bottom of layer l */
const mm=p=>[p[0]*S,-p[1]*S];
/* ---------- 2D shapes in px (canvas-local) ---------- */
const deg=PI/180;
function arcPts(cx,cy,r,a0,a1,n){const o=[];for(let i=0;i<=n;i++){const a=a0+(a1-a0)*i/n;o.push([cx+r*Math.cos(a),cy+r*Math.sin(a)]);}return o;}
/* involute gear outline: pitch radius R (px), Z teeth, tooth centred on angle 0 (matches gearPts phase) */
function gearOutline(R,Z,o={}){const m=2*R/Z,pa=20*deg,rb=R*Math.cos(pa),bl=(o.backlash??0.12)/S;/* px */
  const ra=R+(o.add??1)*m,rr=Math.max(R-1.25*m,1),half=PI/(2*Z)-bl/(2*R),inv=a=>Math.tan(a)-a,ip=inv(pa);
  const fl=[];const r0=Math.max(rb,rr),N=6;for(let i=0;i<=N;i++){const r=r0+(ra-r0)*i/N;const a=Math.acos(Math.min(1,rb/r));fl.push([r,half+ip-inv(a)]);}
  const pts=[];for(let k=0;k<Z;k++){const c=k*TAU/Z;
    const thR=fl[0][1];if(rr<r0-1e-6)pts.push([rr*Math.cos(c-thR-0.0001),rr*Math.sin(c-thR-0.0001)]);
    for(const [r,t] of fl)pts.push([r*Math.cos(c-t),r*Math.sin(c-t)]);
    const tt=fl[N][1];if(tt>0.002)for(const p of arcPts(0,0,ra,c-tt,c+tt,2).slice(1,-1))pts.push(p);
    for(let i=N;i>=0;i--){const [r,t]=fl[i];pts.push([r*Math.cos(c+t),r*Math.sin(c+t)]);}
    if(rr<r0-1e-6)pts.push([rr*Math.cos(c+thR+0.0001),rr*Math.sin(c+thR+0.0001)]);
    const c2=c+TAU/Z,g0=c+thR+0.0002,g1=c2-thR-0.0002;if(g1>g0)for(const p of arcPts(0,0,rr,g0,g1,3).slice(1,-1))pts.push(p);}
  return pts;}
/* internal gear hole: inner tooth tips at R-m, spaces shaped like external teeth reaching out to R+1.25m */
function ringHole(R,Z){const m=2*R/Z,pa=20*deg,rb=R*Math.cos(pa),bl=0.12/S,inv=a=>Math.tan(a)-a,ip=inv(pa),ra=R+1.25*m,rr=R-m,half=PI/(2*Z)+bl/(2*R);
  const r0=Math.max(rb,rr),fl=[];for(let i=0;i<=6;i++){const r=r0+(ra-r0)*i/6;fl.push([r,half+ip-inv(Math.acos(Math.min(1,rb/r)))]);}if(rr<r0-1e-6)fl.unshift([rr,fl[0][1]]);
  const pts=[],tau=TAU/Z;for(let k=0;k<Z;k++){const c=k*tau,sc=c+tau/2;pts.push([rr*Math.cos(c),rr*Math.sin(c)]);
    for(const [r,t] of fl)pts.push([r*Math.cos(sc-t),r*Math.sin(sc-t)]);for(let i=fl.length-1;i>=0;i--){const [r,t]=fl[i];pts.push([r*Math.cos(sc+t),r*Math.sin(sc+t)]);}}
  return pts;}
const hole=(x,y,r)=>circle(r??BORER/S,28,x,y);
const Sh={
  gear(R,Z,o={}){const m=2*R/Z,root=R-1.25*m;const hs=[hole(0,0,o.bore)];if(o.hub===false){}const sp=o.lighten??(root*S>22);
    if(sp){const hub=(o.bore??BORER/S)+6/S,rr=(root+hub)/2,hr=(root-hub)*0.32,n=root*S>40?6:4;for(let i=0;i<n;i++){const a=(i+.5)*TAU/n;hs.push(circle(hr,24,rr*Math.cos(a),rr*Math.sin(a)));}}
    for(const h of o.holes||[])hs.push(hole(h[0],h[1],h[2]));return{o:gearOutline(R,Z,o),h:hs};},
  ring(R,Z,ro,o={}){return{o:circle(ro,96),h:[ringHole(R,Z)]};},
  disk(r,holes=[[0,0]],n=72){return{o:circle(r,n),h:holes.map(h=>hole(h[0],h[1],h[2]))};},
  annulus(ro,ri,n=72){return{o:circle(ro,n),h:[circle(ri,n)]};},
  /* bar from (0,0) to (L,0), width w (px, at least 11 mm), holes at listed x positions */
  bar(L,w,holes=[0,L]){const W=Math.max(w,11/S)/2;const o=hull([...circle(W,24,0,0),...circle(W,24,L,0)]);return{o,h:holes.map(x=>Array.isArray(x)?hole(x[0],x[1],x[2]):hole(x,0))};},
  /* lever: hull of circles [x,y,r] (px), holes [x,y,(r)] */
  lever(cs,holes){const o=hull(cs.flatMap(([x,y,r])=>circle(Math.max(r,5.5/S),24,x,y)));return{o,h:(holes||cs.map(c=>[c[0],c[1]])).map(h=>hole(h[0],h[1],h[2]))};},
  rect(w,h,cx=0,cy=0,holes=[]){return{o:[[cx-w/2,cy-h/2],[cx+w/2,cy-h/2],[cx+w/2,cy+h/2],[cx-w/2,cy+h/2]],h:holes.map(q=>q.length===4?Sh.slotPts(...q):hole(q[0],q[1],q[2]))};},
  poly(pts,holes=[]){return{o:pts,h:holes.map(q=>Array.isArray(q[0])?q:hole(q[0],q[1],q[2]))};},
  /* slot from (x1,y1) to (x2,y2), width w */
  slotPts(x1,y1,x2,y2,w){w=w??(BORER*2+0.4)/S;const a=Math.atan2(y2-y1,x2-x1);return K.slot(Math.hypot(x2-x1,y2-y1),w,14,(x1+x2)/2,(y1+y2)/2,a);},
  /* straight rack: teeth along +x from x0 to x1, pitch line at y=0, teeth point to -y (up in canvas) unless down; m module (px); phase c0 = x of a tooth centre */
  rack(x0,x1,m,depth,o={}){const p=PI*m,down=!!o.down,s=down?1:-1,bl=(o.backlash??0.12)/S,tn=Math.tan(20*deg),a=m,d=1.25*m;const pts=[];const c0=o.c0??0;
    let k=Math.ceil((x0-c0)/p-0.5);const top=[];for(;c0+k*p<=x1;k++){const c=c0+k*p,hw=p/4-bl/2;const tip=hw-a*tn,root=hw+d*tn;
      const q=[[c-root,s*-d],[c-tip,s*a],[c+tip,s*a],[c+root,s*-d]];for(const v of q)if(v[0]>=x0&&v[0]<=x1)top.push(v);}
    pts.push([x0,-s*d]);for(const v of top)pts.push(v);pts.push([x1,-s*d],[x1,-s*(d+depth)],[x0,-s*(d+depth)]);
    if(down)pts.reverse();return{o:pts,h:(o.holes||[]).map(q=>q.length===4?Sh.slotPts(...q):hole(q[0],q[1],q[2]))};},
  /* ratchet / saw wheel: Z teeth, tip radius R, depth d; dir +1 = teeth face anticlockwise in canvas */
  ratchet(R,Z,d,dir=1,o={}){const pts=[];for(let k=0;k<Z;k++){const a0=k*TAU/Z,a1=(k+1)*TAU/Z;const n=5;for(let i=0;i<n;i++){const a=a0+(a1-a0)*i/n,r=R-d+d*i/n;pts.push([r*Math.cos(dir*a),r*Math.sin(dir*a)]);}pts.push([R*Math.cos(dir*a1),R*Math.sin(dir*a1)]);}
    return{o:dir>0?pts:pts.reverse(),h:[hole(0,0,o.bore),...(o.holes||[]).map(h=>hole(h[0],h[1],h[2]))]};},
  /* closed curve from a polar function r(θ) */
  polar(fr,n=180,holes=[[0,0]]){const o=[];for(let i=0;i<n;i++){const t=i/n*TAU;const r=fr(t);o.push([r*Math.cos(t),r*Math.sin(t)]);}return{o,h:holes.map(h=>hole(h[0],h[1],h[2]))};},
  hole,circle,arcPts,gearOutline
};
/* ---------- meshes ---------- */
function ext(sh,z0,z1){const o=sh.o.map(mm),hs=(sh.h||[]).map(h=>h.map(mm));return prism(o,hs,z0,z1);}
const capMesh=()=>tubeSolid(CAPR,CAPB,0,CAPH,32);
/* place a planar part: canvas pose [x,y,a] (px, rad) at height z (mm) */
const place=(x,y,a,z)=>M4.mul(M4.T(x*S,-y*S,z),M4.Rz(-(a||0)));
/* ---------- simulation runner (own copy of the sim state) ---------- */
function runner(n,P){const base=window.MB&&window.MB.SIMS[n];if(!base)return null;const s=Object.create(base);s.P={};(base.params||[]).forEach(p=>s.P[p.id]=p.value);Object.assign(s.P,P||{});
  for(const k of Object.keys(base))if(Array.isArray(base[k])&&k!=='params')s[k]=base[k].slice();
  try{s.reset&&s.reset();}catch(e){}s.update(0);let last=0;
  return{sim:s,at(phi){const d=phi-last;if(Math.abs(d)>40){s.reset&&s.reset();last=0;return this.at(phi);}const k=Math.max(1,Math.ceil(Math.abs(d)/0.02));for(let i=1;i<=k;i++)s.update(last+d*i/k);last=phi;return s.g||s;}};}
/* ---------- define a model ----------
 spec: {S, sim (num), summary, steps, hardware, cam, up (stand the board upright),
   parts:[{id,name,role,layer,t (layers thick),shape | mesh (mm, already placed in own frame), qty, note, pins:[[lx,ly,topLayer]] (printed pins on this part, local px)}],
   ground:[[x,y,l0,l1]]  pins printed on the base: boss up to layer l0, pin through layer l1, capped,
   fixed:[{shape (px, absolute), l0, l1}] walls / guides printed on the base from the plate up through layer l1,
   pose(g,sim,phi) -> {id:[x,y,a] | M4 matrix | [[x,y,a],...] for qty>1},
   ropes(g) -> [{pts:[[x,y],...], layer, closed}], read(g,sim) -> string, plate:{w,h,cx,cy} optional }
*/
function def(n,spec){MODELS[n]={_pk:spec,summary:spec.summary,cam:spec.cam||(spec.up?{yaw:-PI/2+0.35,pitch:0.32}:undefined),
  get hardware(){return spec.hardware||[];},get steps(){return spec.steps||autoSteps(spec);},params:spec.params,
  parts(P){return build(n,spec,P);},pose(phi,P,St){return poseOf(n,spec,phi,P,St);}};}
function autoSteps(spec){const st=['Print every part flat side down, as shown in Print layout. No supports are needed.'];
  st.push('Fit the parts onto the pins in order, starting with the lowest layer, so each one sits on the boss or part below it.');
  if(spec._caps)st.push('Press a cap onto every pin so the parts turn freely without lifting off.');
  st.push(spec.drive||'Turn the orange driving part by hand and watch the motion pass through the model.');return st;}
function bboxPts(pts,lo,hi){for(const p of pts){lo[0]=Math.min(lo[0],p[0]);lo[1]=Math.min(lo[1],p[1]);hi[0]=Math.max(hi[0],p[0]);hi[1]=Math.max(hi[1],p[1]);}}
function build(n,spec,P){S=spec.S||0.3;const R=runner(spec.sim||n,spec.P);spec._R=R;
  const parts=[],caps=[];spec._parts={};
  for(const p of spec.parts){const t=(p.t||1)*(TH+GAP)-GAP,th=p.th||t;let mesh=p.mesh;
    if(!mesh){mesh=ext(typeof p.shape==='function'?p.shape(Sh):p.shape,0,th);
      for(const q of p.pins||[]){const top=zl(q[2])-zl(p.layer||0)+TH+GAP+CAPH;const [x,y]=mm(q);mesh=merge(mesh,cyl(PINR,th,top,28,x,y));caps.push({part:p.id,local:q,z:zl(q[2])+TH+GAP});}
      for(const b of p.bosses||[]){const [x,y]=mm(b);mesh=merge(mesh,cyl(b[3]||BOSSR,th,th+b[2],28,x,y));}}
    const q=Object.assign({},p,{mesh,role:p.role||'link'});delete q.shape;parts.push(q);spec._parts[p.id]=p;}
  /* base plate: from swept extents of every part */
  const lo=[1e9,1e9],hi=[-1e9,-1e9];
  for(let i=0;i<24&&R;i++){const g=R.at(i/24*TAU*(spec.cycle||1));const ps=spec.pose(g,R.sim,i/24*TAU);for(const p of spec.parts){if(p.noPlate)continue;const v=ps[p.id];if(!v)continue;const list=(Array.isArray(v[0])?v:[v]);
      for(const pv of list){if(pv.length===16)continue;let sh=p._bbShape||(p._bbShape=(p.shape?(typeof p.shape==='function'?p.shape(Sh):p.shape):(p.mesh?(()=>{const b=K.bbox(p.mesh);return{o:[[b.lo[0]/S,-b.lo[1]/S],[b.hi[0]/S,-b.lo[1]/S],[b.hi[0]/S,-b.hi[1]/S],[b.lo[0]/S,-b.hi[1]/S]]};})():null)));if(!sh)continue;const c=Math.cos(pv[2]||0),s=Math.sin(pv[2]||0);
        bboxPts(sh.o.filter((_,k)=>sh.o.length<12||k%3===0).map(([x,y])=>[pv[0]+x*c-y*s,pv[1]+x*s+y*c]),lo,hi);}}}
  if(R)R.at(0);
  for(const gp of spec.ground||[])bboxPts([[gp[0]-12,gp[1]-12],[gp[0]+12,gp[1]+12]],lo,hi);
  for(const f of spec.fixed||[])bboxPts((typeof f.shape==='function'?f.shape(Sh):f.shape).o,lo,hi);
  const M=(spec.margin??10)/S;let pl=spec.plate||{x0:lo[0]-M,y0:lo[1]-M,x1:hi[0]+M,y1:hi[1]+M};spec._plate=pl;
  const pw=(pl.x1-pl.x0)*S,ph=(pl.y1-pl.y0)*S;
  const base=[prism(K.rrect(pw,ph,6,6,(pl.x0+pl.x1)/2*S,-(pl.y0+pl.y1)/2*S),[],0,BT)];
  for(const gp of spec.ground||[]){const [x,y]=mm(gp);const zb=zl(gp[2])-GAP;if(zb>BT+0.01)base.push(cyl(BOSSR,BT,zb,28,x,y));base.push(cyl(PINR,zb,zl(gp[3])+TH+GAP+CAPH,28,x,y));caps.push({ground:true,x:gp[0],y:gp[1],z:zl(gp[3])+TH+GAP});}
  for(const f of spec.fixed||[]){const sh=typeof f.shape==='function'?f.shape(Sh):f.shape;base.push(ext(sh,f.z0??BT,zl(f.l1??0)+(f.t??TH)));}
  parts.unshift({id:'base',name:spec.baseName||'Base plate',role:'frame',mesh:merge(...base),note:spec.baseNote||'pins and guides are printed in place'});
  if(spec.up)parts.push({id:'stand',name:'Stand',role:'frame',qty:2,mesh:prism([[0,0],[40,0],[0,40]],[],0,6),note:'glue to the back of the base so it stands upright'});
  if(caps.length)parts.push({id:'cap',name:'Pin cap',role:'small',qty:caps.length,mesh:capMesh(),note:'push-fit; a drop of glue if loose'});
  spec._caps=caps;
  for(const p of parts)if(p.qty===undefined){const v=spec._parts[p.id];if(v&&v.qty)p.qty=v.qty;}
  return parts;}
function poseOf(n,spec,phi,P,St){S=spec.S||0.3;const R=spec._R;const g=R?R.at(phi):{};const ps=spec.pose(g,R&&R.sim,phi);const inst=[];
  const pl=spec._plate,UP=spec.up?M4.mul(M4.Rx(PI/2),M4.T(0,pl.y1*S,0)):null;/* hinge about the plate's bottom edge: board stands in the XZ plane, parts face -y */
  const put=(id,M)=>inst.push([id,UP?M4.mul(UP,M):M]);
  put('base',M4.id());const poseM={};
  for(const p of spec.parts){const v=ps[p.id];if(!v)continue;const list=Array.isArray(v[0])?v:[v];const z=zl(p.layer||0)+(p.dz||0);
    poseM[p.id]=[];for(const pv of list){const Mx=pv.length===16?pv:place(pv[0],pv[1],pv[2],z+(pv[3]||0));poseM[p.id].push(Mx);put(p.id,Mx);}}
  for(const c of spec._caps){if(c.ground){put('cap',place(c.x,c.y,0,c.z));continue;}const Ms=poseM[c.part];if(!Ms)continue;for(const Mp of Ms){const pt=M4.apply(Mp,[c.local[0]*S,-c.local[1]*S,0]);put('cap',M4.T(pt[0],pt[1],c.z));}}
  if(spec.up)for(const x of [pl.x0*S+14,pl.x1*S-20])inst.push(['stand',[0,1,0,0, 0,0,1,0, 1,0,0,0, x,0,0,1]]);
  const belts=[];for(const r of (spec.ropes?spec.ropes(g,R&&R.sim):[])){const z=r.z??(zl(r.layer||0)+TH/2);belts.push({pts:r.pts.map(p=>{const q=[p[0]*S,-p[1]*S,(p[2]!==undefined?p[2]:z)];return UP?M4.apply(UP,q):q;}),r:r.r||1.2,closed:!!r.closed,travel:r.travel});}
  let read='';try{read=spec.read?spec.read(g,R.sim):(R?`${R.sim.outLabel||'output'}: ${(+R.sim.output()).toFixed(2)}`:'');}catch(e){}
  return{inst,belts,read};}
/* ready-made meshes (mm, own frame, z up from 0) */
const Mesh={
  /* grooved pulley for cord: radius at the cord centre R (mm), height H */
  pulley(R,H=7,o={}){const rb=o.bore??BORER,Ro=R+1.6,g=R-1.2,h=H;const prof=[[rb,0],[Ro,0],[Ro,h/2-2.2],[g,h/2-0.7],[g,h/2+0.7],[Ro,h/2+2.2],[Ro,h],[rb,h]];const m=[lathe(prof,72)];
    if(o.spokes!==false&&R>9){/* raised spoke ribs on top for a visible turning cue */for(let i=0;i<3;i++){const a=i*TAU/3;m.push(xfz(box(Math.max(2,g-rb-3),1.6,h,h+1),(g+rb)/2,0,a));}}return merge(...m);},
  /* stepped (multi-groove) pulley: radii bottom→top */
  stepped(Rs,H=6){const rb=BORER,prof=[[rb,0]];let z=0;for(const R of Rs){const Ro=R+1.6,g=R-1.2;prof.push([Ro,z],[Ro,z+H/2-2],[g,z+H/2-0.6],[g,z+H/2+0.6],[Ro,z+H/2+2],[Ro,z+H]);z+=H;}prof.push([rb,z]);return lathe(prof,72);},
  box(w,d,h,cx=0,cy=0){return box(w,d,0,h,cx,cy);},
  cylZ(r,h,n=40){return cyl(r,0,h,n);}
};
function xfz(m,x,y,a){return K.xf(m,M4.mul(M4.Rz(a),M4.T(x,y,0)));}
return{def,Sh,Mesh,zl,place,mm,get S(){return S;},TH,GAP,BT,PINR,BORER,CAPR,ext,runner,gearOutline};
})();
window.PK=PK;
/* ===== 3D layouts: models whose simulation already works in 3D world coordinates (px, z up), e.g. belts between shafts at right angles.
   items: pulleys [{K (circ3), w, ang(phi), role}], belt points. Supports are generated: posts for upright axles, standing brackets for level ones. */
PK.def3=function(n,spec){const MODELS=window.CAD.MODELS;const PI=Math.PI;const {M4,merge,cyl,box,tubeSolid,prism}=K;
  const S=spec.S||0.3,PH=7,G=0.5,PINR=2,CAPR=4.2,CAPH=3;
  MODELS[n]={summary:spec.summary,cam:spec.cam,hardware:spec.hardware||[],steps:spec.steps,
    parts(){const R=PK.runner(n);this._R=R;R.at(0);const sim=R.sim,geo=spec.geo(sim);this._geo=geo;
      let zmin=1e9;for(const b of geo.pulleys){zmin=Math.min(zmin,b.K.c[2]-b.K.r*Math.hypot(b.K.n[0],b.K.n[1]));}
      const zoff=-zmin*S+(spec.lift??12);this._z=zoff;const W=p=>[p[0]*S,p[1]*S,p[2]*S+zoff];
      const out=[],base=[];let lo=[1e9,1e9],hi=[-1e9,-1e9];const ext=(x,y,r)=>{lo=[Math.min(lo[0],x-r),Math.min(lo[1],y-r)];hi=[Math.max(hi[0],x+r),Math.max(hi[1],y+r)];};
      this._sup=[];
      geo.pulleys.forEach((b,i)=>{const c=W(b.K.c),r=b.K.r*S,nz=Math.abs(b.K.n[2]);ext(c[0],c[1],r+6);
        out.push({id:'p'+i,name:b.name||(i===0?'Driving pulley':'Driven pulley'),role:b.role||(i===0?'driver':(b.guide?'link':'driven')),mesh:PK.Mesh.pulley(r,PH)});
        if(nz>0.9){/* upright axle: boss + pin from the base */const zb=c[2]-PH/2-G;base.push(cyl(5,4,zb,32,c[0],c[1]),cyl(PINR,zb,c[2]+PH/2+G+CAPH,24,c[0],c[1]));this._sup.push({cap:[c[0],c[1],c[2]+PH/2+G]});}
        else{/* level axle: a bracket plate behind the pulley, printed flat, glued upright onto the base */const nn=b.K.n;const cz=c[2]-4;
          const h=cz+12,w=Math.max(24,2*r*0.6);const plate=merge(box(w,h,0,3,0,h/2),cyl(5,3,3+G,24,0,cz),cyl(PINR,3,3+G+PH+G+CAPH,24,0,cz));
          out.push({id:'br'+i,name:'Bracket',role:'frame',mesh:plate,note:'glue upright on the base, pin toward the pulley'});
          const back=[c[0]-nn[0]*(PH/2+3+G),c[1]-nn[1]*(PH/2+3+G)];this._sup.push({br:'br'+i,c,n:nn});
          ext(back[0],back[1],w/2+4);}});
      const m=8;const pw=hi[0]-lo[0]+2*m,ph=hi[1]-lo[1]+2*m;base.unshift(prism(K.rrect(pw,ph,6,6,(lo[0]+hi[0])/2,(lo[1]+hi[1])/2),[],0,4));
      out.unshift({id:'base',name:'Base plate',role:'frame',mesh:merge(...base)});
      out.push({id:'cap',name:'Pin cap',role:'small',qty:geo.pulleys.length,mesh:tubeSolid(CAPR,1.95,0,CAPH,32)});
      if(spec.belt!==false){let L=0;const bp=geo.belt;for(let i=1;i<bp.length;i++)L+=Math.hypot(bp[i][0]-bp[i-1][0],bp[i][1]-bp[i-1][1],bp[i][2]-bp[i-1][2]);this._L=L*S;}
      return out;},
    pose(phi){const R=this._R,geo=this._geo;R.at(phi);const W=p=>[p[0]*S,p[1]*S,p[2]*S+this._z];const inst=[['base',M4.id()]];
      geo.pulleys.forEach((b,i)=>{const c=W(b.K.c);const o=[c[0]-b.K.n[0]*PH/2,c[1]-b.K.n[1]*PH/2,c[2]-b.K.n[2]*PH/2];inst.push(['p'+i,M4.mul(M4.frame(o,b.K.n,b.K.u),M4.Rz(b.ang(phi)))]);});
      for(const s of this._sup){if(s.br){const nn=[s.n[0],s.n[1],0],up=[0,0,1],xx=[up[1]*nn[2]-up[2]*nn[1],up[2]*nn[0]-up[0]*nn[2],up[0]*nn[1]-up[1]*nn[0]];
          const bk=[s.c[0]-nn[0]*(PH/2+3+G),s.c[1]-nn[1]*(PH/2+3+G),4];
          inst.push([s.br,[xx[0],xx[1],xx[2],0, up[0],up[1],up[2],0, nn[0],nn[1],nn[2],0, bk[0],bk[1],bk[2],1]]);
          inst.push(['cap',M4.frame([s.c[0]+nn[0]*(PH/2+G),s.c[1]+nn[1]*(PH/2+G),s.c[2]],nn)]);}
        else inst.push(['cap',M4.T(s.cap[0],s.cap[1],s.cap[2])]);}
      return{inst,belts:[{pts:geo.belt.map(W),r:1.6,closed:true,travel:phi*(geo.A?geo.A.r*S:0)}],read:spec.read?spec.read(phi):`driver ${Math.round(phi*180/PI)%360}°`};},
    get _belt(){return this._L;}};};

})();
window.CAD.INDEX={"001": [1, 2, 5, 6, 7, 8, 9, 10], "011": [3, 4, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 243]};
