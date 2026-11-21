var CACHE='mawakibati-portal-v1';
var SHELL=['./','index.html','logo.png','jsqr.js','manifest.webmanifest','icon-192.png','icon-512.png'];
function key(u){var k=new URL(u);k.search='';return k.href}
function put(req,res){if(!res||!res.ok)return res;var cp=res.clone();caches.open(CACHE).then(function(c){c.put(key(req),cp)}).catch(function(){});return res}
function netFirst(req,shell){return fetch(req).then(function(res){return put(req.url,res)}).catch(function(){return caches.match(key(req.url)).then(function(hit){if(hit)return hit;if(shell)return caches.match('index.html');return new Response('{"ok":false,"offline":true}',{status:503,headers:{'Content-Type':'application/json'}})})})}
function cacheFirst(req){return caches.match(key(req.url)).then(function(hit){return hit||fetch(req).then(function(res){return put(req.url,res)})})}
self.addEventListener('install',function(e){self.skipWaiting();e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(SHELL)}).catch(function(){}))});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==CACHE}).map(function(k){return caches.delete(k)}))}).then(function(){return self.clients.claim()}))});
self.addEventListener('fetch',function(e){
  var req=e.request;
  if(req.method!=='GET')return;
  var url=new URL(req.url);
  if(url.origin!==self.location.origin)return;
  if(req.mode==='navigate'){e.respondWith(netFirst(req.url,true));return}
  if(url.pathname.indexOf('/d/')>=0||/(ping|src)\.json$/.test(url.pathname)){e.respondWith(netFirst(req.url,false));return}
  e.respondWith(cacheFirst(req));
});
