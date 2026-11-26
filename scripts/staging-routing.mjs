import { readFile, writeFile, mkdir, cp } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const supportedHost = 'engage-stay-staging.vercel.app';

export function stagingRouting(value) {
  let target;
  try { target = new URL(value); }
  catch { throw new Error('Set STAY_STAGING_API_ORIGIN to the dedicated staging API origin'); }
  if (target.origin !== 'https://' + supportedHost || target.href !== target.origin + '/' ||
      target.username || target.password) {
    throw new Error('Only the dedicated Engage Stay staging backend is accepted');
  }
  return { rewrites: [
    { source:'/api/:path*', destination:target.origin+'/api/:path*' },
    { source:'/(.*)', destination:'/index.html' },
  ] };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const routing = stagingRouting(process.env.STAY_STAGING_API_ORIGIN);
  if (!process.argv[2]) throw new Error('Pass a new staging artifact directory');
  const root = fileURLToPath(new URL('../',import.meta.url));
  const source = join(root,'dist');
  const target = resolve(process.argv[2]);
  await readFile(join(source,'index.html'));
  await mkdir(target);
  await writeFile(join(target,'vercel.json'),JSON.stringify({...routing,outputDirectory:'public'},null,2)+'\n',{flag:'wx'});
  await cp(source,join(target,'public'),{recursive:true,errorOnExist:true,force:false});
}
