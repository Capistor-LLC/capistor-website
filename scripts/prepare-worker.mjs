import {readFileSync, writeFileSync, rmSync} from 'node:fs';
const config=JSON.parse(readFileSync('vercel.json','utf8'));
const headers=config.routes.find(route=>route.src==='/(.*)' && route.headers).headers;
// These apply to assets served without invoking the Worker.
writeFileSync('dist/_headers','/*\n'+Object.entries(headers).map(([key,value])=>`  ${key}: ${value}`).join('\n')+'\n  X-Robots-Tag: noindex, nofollow\n');

// Legacy SPA redirects conflict with Workers' asset routing.
rmSync('dist/_redirects', {force:true});
