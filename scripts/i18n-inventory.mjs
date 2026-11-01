import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('src');
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
const inventory=walk(root).filter(f=>f.endsWith('.jsx')).map(file=>{const source=fs.readFileSync(file,'utf8');const candidates=[...source.matchAll(/>\s*([A-Za-z][^<>{}\n]{1,100})\s*</g)].map(m=>m[1].trim()).filter(Boolean);return {file:path.relative(root,file).replaceAll('\\','/'),candidateCount:candidates.length,examples:[...new Set(candidates)].slice(0,6)};}).filter(r=>r.candidateCount);
console.log(JSON.stringify({note:'Heuristic static-text inventory; does not prove translation completeness. Attributes, dynamic labels, errors and business-data boundaries require manual review.',files:inventory},null,2));
