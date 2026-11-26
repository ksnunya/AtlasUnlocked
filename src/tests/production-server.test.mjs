import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, mkdir, copyFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

await test('Production server serves only dist with correct video ranges and no dependencies', async()=>{
 const root=await mkdtemp(join(tmpdir(),'atlas-unlocked-production-server-'));
 await mkdir(join(root,'src/windows'),{recursive:true});await mkdir(join(root,'dist/assets'),{recursive:true});await mkdir(join(root,'dist/video'),{recursive:true});
 await copyFile('src/windows/AtlasUnlockedServer.mjs',join(root,'src/windows/AtlasUnlockedServer.mjs'));
 await writeFile(join(root,'dist/index.html'),'<script type="module" src="/assets/game.js"></script>');await writeFile(join(root,'dist/assets/game.js'),'console.log("production")');await writeFile(join(root,'dist/video/clip.mp4'),'0123456789');
 await writeFile(join(root,'src/main.tsx'),'must never be served');
 const child=spawn(process.execPath,[join(root,'src/windows/AtlasUnlockedServer.mjs'),'--port','0'],{windowsHide:true});
 let output='';child.stdout.on('data',b=>output+=b);child.stderr.on('data',b=>output+=b);
 try {
  let url;for(let i=0;i<100;i++){url=/http:\/\/localhost:\d+/.exec(output)?.[0];if(url)break;await new Promise(r=>setTimeout(r,50));}assert.ok(url,output);
  const health=await(await fetch(url+'/__atlas_unlocked_health')).json();assert.equal(health.application,'Atlas Unlocked');assert.equal(health.mode,'production');assert.equal(health.root,root);assert.ok(health.indexSha256);
  assert.match(await(await fetch(url)).text(),/assets\/game.js/);
  assert.equal((await fetch(url+'/src/main.tsx')).status,404);assert.equal((await fetch(url+'/public/clip.mp4')).status,404);assert.equal((await fetch(url+'/assets/missing.js')).status,404);
  assert.equal((await fetch(url+'/mission/route',{headers:{Accept:'text/html'}})).status,200);
  const range=await fetch(url+'/video/clip.mp4',{headers:{Range:'bytes=2-5'}});assert.equal(range.status,206);assert.equal(range.headers.get('content-range'),'bytes 2-5/10');assert.equal(range.headers.get('content-type'),'video/mp4');assert.equal(await range.text(),'2345');
  assert.equal((await fetch(url+'/video/clip.mp4',{headers:{Range:'bytes=50-'}})).status,416);
  const head=await fetch(url+'/video/clip.mp4',{method:'HEAD'});assert.equal(head.headers.get('content-length'),'10');assert.equal(await head.text(),'');
  assert.equal((await fetch(url,{method:'POST'})).status,405);
 } finally {child.kill();}
});
