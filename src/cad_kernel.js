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
