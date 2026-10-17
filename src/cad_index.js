// lists which mechanism numbers each CAD chunk defines (runs the chunks against a stub window)
const fs=require('fs');const files=process.argv.slice(2);
global.window={};global.document={documentElement:{}};global.matchMedia=()=>({matches:false});
global.getComputedStyle=()=>({getPropertyValue:()=>''});eval(fs.readFileSync('js/mechanisms.js','utf8'));eval(fs.readFileSync('js/data.js','utf8'));eval(fs.readFileSync('js/cad.js','utf8'));
const out={};let prev=new Set();
for(const f of files){eval(fs.readFileSync(f,'utf8'));const now=Object.keys(window.CAD.MODELS).map(Number);out[f.split('/').pop().replace('.js','')]=now.filter(n=>!prev.has(n));prev=new Set(now);}
console.log(JSON.stringify(out));
