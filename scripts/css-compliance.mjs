import {readdirSync,readFileSync} from 'node:fs';
import {join} from 'node:path';
const root=process.argv[2]||'src';
function walk(p){return readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(p,e.name)):e.name.endsWith('.css')?[join(p,e.name)]:[])}
const files=walk(root), findings=[];
for(const file of files){
 const source=readFileSync(file,'utf8').replace(/\/\*[\s\S]*?\*\//g,m=>m.replace(/[^\n]/g,' '));
 const patterns=[['literal-radius',/border-radius\s*:\s*\d+px\b/g],['literal-shadow',/box-shadow\s*:\s*(?!none\b|var\()[^;}]+/g],['literal-color',/(?:background(?:-color)?|color|border(?:-color)?)\s*:[^;}]*#[0-9a-f]{3,8}\b/gi],['important',/!important\b/g],['shared-token-redefinition',/--engage-[\w-]+\s*:/g],['literal-height',/(?:min-height|height)\s*:\s*(?:3[0-9]|4[0-3])px\b/g]];
 for(const [kind,pattern] of patterns)for(const m of source.matchAll(pattern))findings.push({file,line:source.slice(0,m.index).split('\n').length,kind,value:m[0].trim()});
}
console.log(JSON.stringify({files,findings},null,2));
if(!files.length)process.exitCode=1;
if(findings.some(f=>f.kind==='shared-token-redefinition'))process.exitCode=1;
