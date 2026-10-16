import re
kit=open('src/kit_existing.js').read()
import glob
new=open('src/sims_new.js').read()+'\n'+open('src/sims_b2.js').read()+''.join('\n'+open(f).read() for f in sorted(glob.glob('src/sims_[cd]*.js')))
js="""(function(){
const TAU=Math.PI*2,PI=Math.PI,W=800,H=520;const mod=(a,n)=>((a%n)+n)%n;
const C={};let ctx=null;let DIR=1;function speedSign(){return DIR;}
"""+kit+"\n"+new+"""
const ALL=Object.assign({119:M119,120:M120,121:M121,122:M122,123:M123,124:M124,127:M127},SIMS_NEW);
for(const k in ALL){const m=ALL[k];m.params=m.params||[];m.P={};m.params.forEach(p=>m.P[p.id]=p.value);if(!m.reset)m.reset=function(){};}
window.MB={SIMS:ALL,C,setCtx(c){ctx=c;},setDir(d){DIR=d||1;},W,H,ropeThru,tanLine,cam3,circ3,pitchCurve,toothedCurve,ncPhase,lockDiskPts,sawR,stad};
})();
"""
open('js/mechanisms.js','w').write(js)
cad='(function(){\n'+open('src/cad_kernel.js').read()+'\n'+open('src/cad_view.js').read()+'\n'+open('src/cad_pk.js').read()+'\n})();\n'
import os,subprocess,json
os.makedirs('js/cad',exist_ok=True)
for f in glob.glob('js/cad/*.js'):os.remove(f)
PRE='(function(){const K=window.CAD.K,PK=window.PK,M4=K.M4,PI=Math.PI,TAU=2*PI;const mod=(a,n)=>((a%n)+n)%n;const ropeThru=(...a)=>window.MB.ropeThru(...a);\n'
chunks=sorted(glob.glob('src/cad_models_*.js'))
index={}
for i,f in enumerate(chunks):
    name=os.path.basename(f)[11:-3]
    open('js/cad/'+name+'.js','w').write(PRE+open(f).read()+'\n})();\n')
open('js/cad.js','w').write(cad)
nums=json.loads(subprocess.check_output(['node','src/cad_index.js']+['js/cad/'+os.path.basename(f)[11:-3]+'.js' for f in chunks]))
open('js/cad.js','a').write('window.CAD.INDEX='+json.dumps(nums)+';\n')
print('cad models',sum(len(v) for v in nums.values()))
body=open('src/body.html').read()
head_part,rest=body.split('<header class="topbar">',1);rest='<header class="topbar">'+rest
full='<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'+head_part.replace('<meta name="claude:viewport-fit-sides" content="cover">\n','')+'</head>\n<body>\n'+rest+'</body>\n</html>\n'
open('index.html','w').write(full)
pass
print('ok',len(js))
