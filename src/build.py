import re
kit=open('src/kit_existing.js').read()
import glob
new=open('src/sims_new.js').read()+'\n'+open('src/sims_b2.js').read()+''.join('\n'+open(f).read() for f in sorted(glob.glob('src/sims_c*.js')))
js="""(function(){
const TAU=Math.PI*2,PI=Math.PI,W=800,H=520;const mod=(a,n)=>((a%n)+n)%n;
const C={};let ctx=null;let DIR=1;function speedSign(){return DIR;}
"""+kit+"\n"+new+"""
const ALL=Object.assign({119:M119,120:M120,121:M121,122:M122,123:M123,124:M124,127:M127},SIMS_NEW);
for(const k in ALL){const m=ALL[k];m.params=m.params||[];m.P={};m.params.forEach(p=>m.P[p.id]=p.value);if(!m.reset)m.reset=function(){};}
window.MB={SIMS:ALL,C,setCtx(c){ctx=c;},setDir(d){DIR=d||1;},W,H};
})();
"""
open('site/js/mechanisms.js','w').write(js)
cad='(function(){\n'+open('src/cad_kernel.js').read()+'\n'+open('src/cad_view.js').read()+'\n'+''.join(open(f).read()+'\n' for f in sorted(glob.glob('src/cad_models_*.js')))+'})();\n'
open('site/js/cad.js','w').write(cad)
body=open('src/body.html').read()
head_part,rest=body.split('<div class="wrap" id="app"></div>',1)
full='<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'+head_part.replace('<meta name="claude:viewport-fit-sides" content="cover">\n','')+'</head>\n<body>\n<div class="wrap" id="app"></div>\n'+rest+'</body>\n</html>\n'
open('site/index.html','w').write(full)
open('artifact.html','w').write(body)
print('ok',len(js))
