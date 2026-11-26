import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdtemp, readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawn } from 'node:child_process';

// Verify actual production bytes and Chromium decoding, independently of DOM mocks.
const chrome = process.env.ATLAS_UNLOCKED_CHROME ?? process.env.WPA_CHROME;
const probe = process.env.ATLAS_UNLOCKED_FFMPEG ?? process.env.WPA_FFMPEG;
assert.ok(chrome && probe, 'Set ATLAS_UNLOCKED_CHROME and ATLAS_UNLOCKED_FFMPEG executable paths');
const files = ['Where are you from_.mp4', "What's wrong_.mp4", 'make-a-fire.mp4'];
assert.deepEqual((await readdir('dist/video/mission-actions')).filter(f => /\.(mp4|webm)$/.test(f)).sort(), [...files].sort());
const server = createServer(async (req, res) => {
  try {
    if (req.url === '/') { res.setHeader('Content-Type', 'text/html'); res.end('<video controls playsinline></video>'); return; }
    const name = decodeURIComponent(req.url.split('/').at(-1));
    if (!files.includes(name)) { res.writeHead(404); res.end(); return; }
    const bytes = await readFile(join('dist/video/mission-actions', name));
    res.setHeader('Content-Type', name.endsWith('.webm') ? 'video/webm' : 'video/mp4'); res.setHeader('Content-Length', bytes.length); res.end(bytes);
  } catch { res.writeHead(500); res.end(); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const url = `http://127.0.0.1:${server.address().port}`;
const profile = await mkdtemp(join(tmpdir(), 'atlas-unlocked-media-chrome-'));
const browser = spawn(chrome, ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--autoplay-policy=no-user-gesture-required', '--no-first-run', '--no-default-browser-check', 'about:blank'], { windowsHide: true, stdio: 'ignore' });
let socket;
try {
  let port;
  for (let i=0;i<100;i++) { try { port = (await readFile(join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]; break; } catch { await new Promise(r=>setTimeout(r,100)); } }
  assert.ok(port, 'Headless browser started');
  const targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
  const target = targets.find(t=>t.type==='page'); socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((r,j)=>{socket.addEventListener('open',r,{once:true});socket.addEventListener('error',j,{once:true});});
  let sequence=0;const pending=new Map();
  socket.addEventListener('message',event=>{const m=JSON.parse(event.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(new Error(JSON.stringify(m.error))):p.resolve(m.result);}});
  const call=(method,params={})=>new Promise((resolve,reject)=>{const id=++sequence;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));});
  await call('Page.navigate',{url});
  for(let i=0;i<100;i++){const r=await call('Runtime.evaluate',{expression:'!!document.querySelector("video")',returnByValue:true});if(r.result.value)break;await new Promise(r=>setTimeout(r,100));}
  for (const [index,name] of files.entries()) {
    const source=resolve('public/video/mission-actions',name);const output=resolve('dist/video/mission-actions',name);
    assert.deepEqual(await readFile(source),await readFile(output),'Build retains production media bytes');
    const decoded = spawn(probe, ['-nostdin', '-hide_banner', '-i', output, '-map', '0:v:0', '-c:v', 'libx264', '-f', 'null', '-'], {windowsHide:true});
    let metadata=''; decoded.stderr.on('data',bytes=>metadata+=bytes);
    assert.equal(await new Promise(r=>decoded.on('close',r)),0,`${name}: full decode succeeds`);
    assert.match(metadata,/Stream #.*Video:/);
    const audioStreams=(metadata.match(/Stream #.*Audio:/g)??[]).length;
    if(index<2)assert.equal(audioStreams,0,`${name}: permanently no audio stream`);
    const expression=`(async()=>{const v=document.querySelector('video');v.src=${JSON.stringify(url+'/video/mission-actions/'+encodeURIComponent(name))};v.load();await v.play();await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Playback timeout')),10000);const poll=setInterval(()=>{if(v.error){clearTimeout(timer);clearInterval(poll);reject(new Error(v.error.message));}else if(v.currentTime>.15&&v.videoWidth>0){clearTimeout(timer);clearInterval(poll);resolve();}},25);});v.pause();return {time:v.currentTime,width:v.videoWidth,height:v.videoHeight,duration:v.duration,decodedFrames:v.getVideoPlaybackQuality().totalVideoFrames};})()`;
    const result=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});
    assert.ok(!result.exceptionDetails,JSON.stringify(result.exceptionDetails));assert.ok(result.result.value.decodedFrames>0);
    console.log(JSON.stringify({file:name,audioStreams,...result.result.value}));
  }
  console.log('All three production videos loaded, played and decoded; both ASL clips have no audio streams.');
} finally {socket?.close();browser.kill();server.close();}
