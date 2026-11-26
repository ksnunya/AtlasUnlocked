// Dependency-free, loopback-only production server. Never serves source or public/.
import { createServer } from 'node:http';
import { createReadStream, statSync, readFileSync, realpathSync, appendFileSync } from 'node:fs';
import { dirname, resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const dist = realpathSync(resolve(root, 'dist'));
const arg = name => { const i = process.argv.indexOf(name); return i < 0 ? undefined : process.argv[i+1]; };
const port = Number(arg('--port') ?? 8080);
if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('Invalid port');
const log = message => { const line = `${new Date().toISOString()} ${message}\n`; if (arg('--log')) appendFileSync(arg('--log'), line); else process.stdout.write(line); };
const index = readFileSync(resolve(dist, 'index.html'));
const indexText = index.toString();
if (!/src=["']\/assets\//.test(indexText)) throw new Error('dist is not a production build');
for (const match of indexText.matchAll(/(?:src|href)=["'](\/assets\/[^"']+)["']/g)) statSync(resolve(dist, '.' + match[1]));
const indexSha256 = createHash('sha256').update(index).digest('hex');
const types = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.json':'application/json', '.mp4':'video/mp4', '.webm':'video/webm', '.png':'image/png', '.svg':'image/svg+xml', '.ico':'image/x-icon', '.txt':'text/plain; charset=utf-8' };
function handle(req, res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'no-store');
  if (!['GET','HEAD'].includes(req.method)) { res.writeHead(405, {Allow:'GET, HEAD'}); res.end(); return; }
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); } catch { res.writeHead(400); res.end(); return; }
  if (pathname === '/__atlas_unlocked_health') {
    res.setHeader('Content-Type','application/json'); res.end(req.method === 'HEAD' ? undefined : JSON.stringify({application:'Atlas Unlocked',mode:'production',root,pid:process.pid,indexSha256})); return;
  }
  if (pathname.includes('\\') || pathname.includes('\0')) { res.writeHead(400); res.end(); return; }
  let file = resolve(dist, '.' + (pathname === '/' ? '/index.html' : pathname));
  if (!file.startsWith(dist + sep)) { res.writeHead(403); res.end(); return; }
  let stat;
  try { file = realpathSync(file); if (!file.startsWith(dist + sep)) throw new Error('Outside dist'); stat = statSync(file); if (!stat.isFile()) throw new Error('Not a file'); }
  catch {
    // Preserve client-side routes without returning HTML for missing assets/source.
    if (!extname(pathname) && !/^\/(assets|video|src|public)(\/|$)/.test(pathname) && req.headers.accept?.includes('text/html')) { file = resolve(dist,'index.html'); stat = statSync(file); }
    else { res.writeHead(404); res.end(); return; }
  }
  res.setHeader('Content-Type', types[extname(file).toLowerCase()] ?? 'application/octet-stream');
  res.setHeader('Accept-Ranges','bytes');
  let start = 0, end = stat.size - 1, status = 200;
  if (req.headers.range) {
    const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
    if (!range || (!range[1] && !range[2])) { res.writeHead(416, {'Content-Range':`bytes */${stat.size}`}); res.end(); return; }
    if (!range[1]) start = Math.max(0,stat.size - Number(range[2]));
    else { start = Number(range[1]); if (range[2]) end = Math.min(end,Number(range[2])); }
    if (start > end || start >= stat.size) { res.writeHead(416, {'Content-Range':`bytes */${stat.size}`}); res.end(); return; }
    status = 206; res.setHeader('Content-Range',`bytes ${start}-${end}/${stat.size}`);
  }
  res.setHeader('Content-Length',end-start+1); res.writeHead(status);
  if (req.method === 'HEAD') { res.end(); return; }
  const stream = createReadStream(file,{start,end}); stream.on('error',()=>res.destroy()); stream.pipe(res);
}
const servers = [];
const stop = () => { for (const server of servers) server.close(); };
process.on('SIGTERM',stop); process.on('SIGINT',stop);
async function listen(host, targetPort) {
  const server = createServer(handle);
  await new Promise((yes,no) => { server.once('error',no); server.listen(targetPort,host,yes); });
  servers.push(server); server.on('error',error=>{log(error.message);stop();process.exitCode=1;});
  return server.address().port;
}
try {
  const actualPort = await listen('127.0.0.1',port);
  try { await listen('::1',actualPort); } catch (error) { if (!['EAFNOSUPPORT','EADDRNOTAVAIL'].includes(error.code)) throw error; }
  log(`Atlas Unlocked production ready at http://localhost:${actualPort}/ pid=${process.pid} root=${root} index=${indexSha256}`);
} catch (error) { log(`Production server failed: ${error.message}`); stop(); process.exitCode=1; }
