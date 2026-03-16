/* ===== CONFIG ===== */
var CACHE_TTL=10*60*1000, lang='fr', tab='sport', deferredPrompt=null;
var FEEDS={
  sport:{fr:{main:[
    {url:'https://rmcsport.bfmtv.com/rss/football/',src:'RMC Sport',c:'var(--sport)'},
    {url:'https://www.foot01.com/rss/actu',src:'Foot01',c:'var(--sport)'},
    {url:'https://www.footmercato.net/feed',src:'Foot Mercato',c:'var(--sport)'},
    {url:'https://www.sofoot.com/rss.xml',src:'SoFoot',c:'var(--sport)'},
    {url:'https://www.maxifoot.fr/rss.php',src:'Maxifoot',c:'var(--sport)'}
  ],omni:[
    {url:'https://www.lefigaro.fr/rss/figaro_sport.xml',src:'Le Figaro Sport',c:'var(--sport)'},
    {url:'https://www.leparisien.fr/rss/sport.rss',src:'Le Parisien Sport',c:'var(--sport)'}
  ]},en:{main:[
    {url:'https://feeds.bbci.co.uk/sport/football/rss.xml',src:'BBC Football',c:'var(--sport)'},
    {url:'https://www.skysports.com/rss/12040',src:'Sky Sports',c:'var(--sport)'},
    {url:'https://www.goal.com/feeds/en/news',src:'Goal.com',c:'var(--sport)'}
  ],omni:[{url:'https://sportskeeda.com/feed',src:'Sportskeeda',c:'var(--sport)'}]}},
  rap:{fr:[
    {url:'https://www.booska-p.com/feed/',src:'Booska-P',c:'var(--rap)'},
    {url:'https://www.yard.media/feed/',src:'Yard',c:'var(--rap)'},
    {url:'https://www.abcdr.net/rss.php',src:'Abcdr du Son',c:'var(--rap)'},
    {url:'https://www.mouv.fr/rss/actualites',src:"Mouv'",c:'var(--rap)'},
    {url:'https://www.rap2k.com/feed/',src:'Rap2K',c:'var(--rap)'},
    {url:'https://www.rapunchline.com/feed/',src:'Rapunchline',c:'var(--rap)'},
    {url:'https://www.culturesrap.com/feed/',src:'Cultures Rap',c:'var(--rap)'},
    {url:'https://www.lesinrocks.com/musique/feed/',src:'Les Inrocks',c:'var(--rap)'}
  ],en:[
    {url:'https://www.xxlmag.com/feed/',src:'XXL',c:'var(--rap)'},
    {url:'https://hiphopdx.com/rss',src:'HipHopDX',c:'var(--rap)'},
    {url:'https://www.hotnewhiphop.com/rss/news.xml',src:'HotNewHipHop',c:'var(--rap)'}
  ]},
  monde:{fr:[
    {url:'https://www.france24.com/fr/rss',src:'France 24',c:'var(--monde)'},
    {url:'https://www.courrierinternational.com/feed/all/rss.xml',src:'Courrier Int.',c:'var(--monde)'},
    {url:'https://www.lepoint.fr/monde/rss.xml',src:'Le Point',c:'var(--monde)'},
    {url:'https://www.lefigaro.fr/rss/figaro_international.xml',src:'Le Figaro',c:'var(--monde)'},
    {url:'https://www.rfi.fr/fr/rss',src:'RFI',c:'var(--monde)'}
  ],en:[
    {url:'https://www.france24.com/en/rss',src:'France 24 EN',c:'var(--monde)'},
    {url:'https://www.theguardian.com/world/rss',src:'The Guardian',c:'var(--monde)'},
    {url:'https://feeds.npr.org/1004/rss.xml',src:'NPR World',c:'var(--monde)'},
    {url:'https://feeds.bbci.co.uk/news/world/rss.xml',src:'BBC World',c:'var(--monde)'}
  ]},
  good:{fr:[
    {url:'https://www.lemediapositif.com/feed/',src:'Le Media Positif',c:'var(--good)'},
    {url:'https://mrmondialisation.org/feed/',src:'Mr Mondialisation',c:'var(--good)'}
  ],en:[
    {url:'https://www.goodnewsnetwork.org/feed/',src:'Good News Network',c:'var(--good)'},
    {url:'https://www.positive.news/feed/',src:'Positive News',c:'var(--good)'},
    {url:'https://reasonstobecheerful.world/feed/',src:'Reasons to be Cheerful',c:'var(--good)'}
  ]},
  tech:{fr:[
    {url:'https://www.lesnumeriques.com/actu_0.rss',src:'Les Numériques',c:'var(--tech)'},
    {url:'https://www.frandroid.com/feed',src:'Frandroid',c:'var(--tech)'},
    {url:'https://www.numerama.com/feed/',src:'Numerama',c:'var(--tech)'},
    {url:'https://www.01net.com/rss/info/flux-rss-actualite/',src:'01net',c:'var(--tech)'}
  ],en:[
    {url:'https://feeds.feedburner.com/TechCrunch',src:'TechCrunch',c:'var(--tech)'},
    {url:'https://www.theverge.com/rss/index.xml',src:'The Verge',c:'var(--tech)'},
    {url:'https://feeds.arstechnica.com/arstechnica/index',src:'Ars Technica',c:'var(--tech)'},
    {url:'https://www.wired.com/feed/rss',src:'Wired',c:'var(--tech)'}
  ]}
};

/* ===== UTILITIES ===== */
function timeAgo(s){if(!s)return'';var d=new Date(s),m=Math.floor((Date.now()-d)/60000);if(isNaN(m)||m<0)return'';var f=lang!=='en';if(m<2)return f?'À l\'instant':'Just now';if(m<60)return(f?'Il y a ':'')+m+'min'+(f?'':' ago');var h=Math.floor(m/60);if(h<24)return(f?'Il y a ':'')+h+'h'+(f?'':' ago');return(f?'Il y a ':'')+Math.floor(h/24)+(f?'j':'d')+(f?'':' ago')}
function isFresh(s){if(!s)return false;return(Date.now()-new Date(s))<2*3600000}
function clean(h){if(!h)return'';var d=document.createElement('div');d.innerHTML=h;return(d.textContent||d.innerText||'').replace(/\s+/g,' ').trim().slice(0,280)}
function safeLink(u){return u&&(u.startsWith('http://')||u.startsWith('https://'))?u:'#'}
function dedup(a){var s={};return a.filter(function(x){var k=x.title.toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,50);if(!k||s[k])return false;s[k]=true;return true})}
function sortByDate(a){return a.sort(function(x,y){return new Date(y.rawDate||0)-new Date(x.rawDate||0)})}
function nowStr(){return new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}
function getYtId(u){if(!u)return'';var m=u.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);return m?m[1]:''}

/* ===== CACHE ===== */
function getCache(k){try{var i=localStorage.getItem('bsl_'+k);if(!i)return null;var p=JSON.parse(i);if(Date.now()-p.ts>CACHE_TTL){localStorage.removeItem('bsl_'+k);return null}return p.data}catch(e){return null}}
function setCache(k,d){try{localStorage.setItem('bsl_'+k,JSON.stringify({ts:Date.now(),data:d}))}catch(e){}}

/* ===== READING HISTORY ===== */
function getHistory(){try{return JSON.parse(localStorage.getItem('bsl_hist')||'[]')}catch(e){return[]}}
function markRead(link){var h=getHistory();if(h.indexOf(link)===-1){h.push(link);if(h.length>500)h=h.slice(-500);localStorage.setItem('bsl_hist',JSON.stringify(h))}}
function isRead(link){return getHistory().indexOf(link)>-1}

/* ===== FAVORITES ===== */
function getFavs(){try{return JSON.parse(localStorage.getItem('bsl_favs')||'[]')}catch(e){return[]}}
function setFavs(f){try{localStorage.setItem('bsl_favs',JSON.stringify(f))}catch(e){}}
function toggleFav(a){var f=getFavs(),idx=-1;for(var i=0;i<f.length;i++){if(f[i].link===a.link){idx=i;break}}if(idx>-1)f.splice(idx,1);else f.unshift(a);setFavs(f);updateFavBadge();return idx===-1}
function isFav(l){var f=getFavs();for(var i=0;i<f.length;i++)if(f[i].link===l)return true;return false}
function updateFavBadge(){var b=document.getElementById('fav-badge'),n=getFavs().length;b.textContent=n>0?n:''}

/* ===== STATS ===== */
function getStats(){try{return JSON.parse(localStorage.getItem('bsl_stats')||'{}')}catch(e){return{}}}
function trackRead(cat,src){var s=getStats(),d=new Date().toISOString().slice(0,10);if(!s[d])s[d]={total:0,cats:{},srcs:{}};s[d].total++;s[d].cats[cat]=(s[d].cats[cat]||0)+1;s[d].srcs[src]=(s[d].srcs[src]||0)+1;var k=Object.keys(s);if(k.length>30)delete s[k.sort()[0]];localStorage.setItem('bsl_stats',JSON.stringify(s))}

/* ===== FETCH ===== */
async function fetchFeed(feed,max){
  if(!max)max=6;var enc=encodeURIComponent(feed.url);
  var urls=['/.netlify/functions/rss?url='+enc,'https://api.rss2json.com/v1/api.json?rss_url='+enc];
  for(var i=0;i<urls.length;i++){try{
    var r=await fetch(urls[i],{signal:AbortSignal.timeout(8000)});var d=await r.json();var items=d.items||[];
    if(!items.length)continue;var res=[];
    for(var j=0;j<Math.min(items.length,max);j++){var it=items[j];var rd=it.pubDate||it.published||it.updated||'';
      res.push({title:clean(it.title||''),desc:clean(it.description||it.content||it.summary||''),
        content:it.content||'',link:safeLink(it.link||it.url),rawDate:rd,age:timeAgo(rd),fresh:isFresh(rd),
        src:feed.src,c:feed.c,thumb:it.thumbnail||(it.enclosure?it.enclosure.link:'')||'',
        videoId:it.videoId||getYtId(it.link||it.url||'')})}
    return res}catch(e){continue}}
  return[]}
async function fetchAll(feeds,max){if(!max)max=5;var p=[];for(var i=0;i<feeds.length;i++)p.push(fetchFeed(feeds[i],max));var r=await Promise.allSettled(p);var a=[];for(var j=0;j<r.length;j++)if(r[j].status==='fulfilled')a=a.concat(r[j].value);return a}

/* ===== RENDER ===== */
function makeSkeleton(n){var h='<div class="skel hero"><div><div class="shimmer" style="width:60px;height:14px;margin-bottom:12px"></div><div class="shimmer" style="width:90%;height:20px;margin-bottom:8px"></div><div class="shimmer" style="width:65%;height:20px"></div></div></div>';for(var i=1;i<n;i++)h+='<div class="skel"><div><div class="shimmer" style="width:50px;height:12px;margin-bottom:12px"></div><div class="shimmer" style="width:80%;height:16px;margin-bottom:6px"></div><div class="shimmer" style="width:55%;height:16px"></div></div><div class="shimmer" style="width:64px;height:50px;border-radius:6px"></div></div>';return h}
function makeRefreshRow(t){return'<div class="refresh-row"><span class="last-upd"><span class="live-dot"></span>Mis à jour '+nowStr()+'</span><button class="refresh-btn" data-refresh="'+t+'">⟳ Rafraîchir</button></div>'}
function makeSecLbl(i,t,n){return'<div class="sec-lbl"><span class="sec-lbl-t">'+i+' '+t+'</span><div class="sec-lbl-l"></div><span class="sec-lbl-n">'+n+' article'+(n>1?'s':'')+'</span></div>'}
function makeEnd(){return'<div class="end">'+(lang==='en'?'End of feed':'Fin du fil')+'</div>'}
function cA(a){return' data-link="'+(a.link||'#')+'" data-title="'+encodeURIComponent(a.title||'')+'" data-src="'+(a.src||'')+'" data-c="'+(a.c||'var(--sport)')+'" data-age="'+(a.age||'')+'" data-desc="'+encodeURIComponent(a.desc||'')+'" data-thumb="'+(a.thumb||'')+'" data-raw-date="'+(a.rawDate||'')+'" data-content="'+encodeURIComponent(a.content||'')+'" data-video="'+(a.videoId||'')+'"'}
function makeCard(a,hero,idx){
  var d=(idx||0)*0.04,rd=isRead(a.link)?' read':'',vid=a.videoId?'<div class="video-badge">▶</div>':'';
  var img='';if(hero){img='<div class="hero-img">'+(a.thumb?'<img src="'+a.thumb+'" alt="" loading="lazy" onerror="this.parentNode.style.display=\'none\'">':'')+vid+'</div>'}else{img='<div class="art-thumb">'+(a.thumb?'<img src="'+a.thumb+'" alt="" loading="lazy" onerror="this.style.display=\'none\'">':'')+'</div>'}
  var fb=a.fresh?'<span class="fresh-badge">'+(lang==='en'?'NEW':'NOUVEAU')+'</span>':'';
  var inner='<div><div class="art-meta"><span class="chip" style="color:'+a.c+'">'+a.src+'</span>'+fb+'<span class="art-age">'+a.age+'</span></div><div class="art-title">'+a.title+'</div>'+(hero&&a.desc?'<div class="art-desc">'+a.desc+'</div>':'')+'</div>';
  return'<div class="art'+(hero?' hero':'')+rd+' fade-in" style="animation-delay:'+d+'s"'+cA(a)+'>'+inner+img+'</div>'}
function makeMini(a,cc,idx){var d=(idx||0)*0.04,rd=isRead(a.link)?' read':'';return'<div class="mini'+rd+' fade-in" style="animation-delay:'+d+'s"'+cA(a)+'><div class="mini-dot" style="background:'+(cc||'var(--sport)')+'"></div><div class="mini-t">'+a.title+'</div><span class="mini-s">'+a.src+'</span></div>'}

function buildSport(m,o){var s=sortByDate(dedup(m)),so=sortByDate(dedup(o));var h=makeRefreshRow('sport');h+=makeSecLbl('⚽','Football',s.length);if(s.length>0){h+='<div class="feed-grid">';h+=makeCard(s[0],true,0);for(var i=1;i<s.length;i++)h+=makeCard(s[i],false,i);h+='</div>'}else h+='<div class="empty-msg">Aucun article disponible.</div>';if(so.length>0){h+=makeSecLbl('🏅','Omnisport',so.length);for(var j=0;j<so.length;j++)h+=makeMini(so[j],'var(--sport)',s.length+j)}h+=makeEnd();return h}
function buildSimple(t,arts){var cfg={rap:{i:'🎤',l:'Rap & Culture'},monde:{i:'🌍',l:lang==='en'?'World News':'Actualité mondiale'},good:{i:'✨',l:lang==='en'?'Good News':'Bonnes nouvelles'},tech:{i:'⚡',l:'Tech'}};var c=cfg[t]||{i:'',l:t};var s=sortByDate(dedup(arts));var h=makeRefreshRow(t);h+=makeSecLbl(c.i,c.l,s.length);if(s.length>0){h+='<div class="feed-grid">';h+=makeCard(s[0],true,0);for(var i=1;i<s.length;i++)h+=makeCard(s[i],false,i);h+='</div>'}else h+='<div class="empty-msg">Aucun article disponible.</div>';h+=makeEnd();return h}

/* ===== LOAD TAB ===== */
var htmlC={};
async function loadTab(t,l,force){
  var key=t+'|'+l,el=document.getElementById('p-'+t);if(!el)return;
  if(htmlC[key]&&!force){el.innerHTML=htmlC[key];return}
  var cached=getCache(key);
  if(cached&&!force){var html=t==='sport'?buildSport(cached.m||[],cached.o||[]):buildSimple(t,cached.a||[]);htmlC[key]=html;el.innerHTML=html;return}
  el.innerHTML=makeSkeleton(5);var html='';
  try{if(t==='sport'){
    if(l==='mix'){var r=await Promise.all([fetchAll(FEEDS.sport.fr.main,4),fetchAll(FEEDS.sport.fr.omni,3),fetchAll(FEEDS.sport.en.main,4),fetchAll(FEEDS.sport.en.omni,3)]);var ms=r[0].concat(r[2]),os=r[1].concat(r[3]);setCache(key,{m:ms,o:os});html=buildSport(ms,os)}
    else{var cfg=FEEDS.sport[l]||FEEDS.sport.fr;var r=await Promise.all([fetchAll(cfg.main,5),fetchAll(cfg.omni,4)]);setCache(key,{m:r[0],o:r[1]});html=buildSport(r[0],r[1])}}
    else{var arts;if(l==='mix'){var fr=(FEEDS[t]&&FEEDS[t].fr)||[],en=(FEEDS[t]&&FEEDS[t].en)||[];if(Array.isArray(fr)){var r=await Promise.all([fetchAll(fr,4),fetchAll(en,4)]);arts=r[0].concat(r[1])}else arts=await fetchAll(fr,6)}else{var fds=(FEEDS[t]&&(FEEDS[t][l]||FEEDS[t].fr))||[];arts=await fetchAll(fds,6)}setCache(key,{a:arts});html=buildSimple(t,arts)}}
  catch(e){html='<div class="empty-msg">Erreur de chargement.</div>'}
  htmlC[key]=html;el.innerHTML=html;loadTrending()}
function doRefresh(t){delete htmlC[t+'|'+lang];try{localStorage.removeItem('bsl_'+t+'|'+lang)}catch(e){}loadTab(t,lang,true)}

/* ===== SANITIZE HTML ===== */
function sanitizeHtml(h){if(!h)return'';var d=document.createElement('div');d.innerHTML=h;var rm=d.querySelectorAll('script,style,link,meta,noscript');for(var i=rm.length-1;i>=0;i--)rm[i].remove();var ifs=d.querySelectorAll('iframe');for(var j=ifs.length-1;j>=0;j--){var s=ifs[j].getAttribute('src')||'';if(s.indexOf('youtube.com')===-1&&s.indexOf('youtu.be')===-1)ifs[j].remove()}return d.innerHTML}

/* ===== READER ===== */
function openReader(el){
  var title=decodeURIComponent(el.getAttribute('data-title')||''),src=el.getAttribute('data-src')||'',c=el.getAttribute('data-c')||'var(--sport)',age=el.getAttribute('data-age')||'',desc=decodeURIComponent(el.getAttribute('data-desc')||''),thumb=el.getAttribute('data-thumb')||'',link=el.getAttribute('data-link')||'#',content=decodeURIComponent(el.getAttribute('data-content')||''),videoId=el.getAttribute('data-video')||'';
  document.getElementById('rdr-title').textContent=title;
  var srcEl=document.getElementById('rdr-src');srcEl.textContent=src;srcEl.style.color=c;srcEl.style.borderColor=c;
  document.getElementById('rdr-time').textContent=age;document.getElementById('rdr-ext').href=link;document.getElementById('rdr-cta').href=link;
  document.getElementById('rdr-progress').style.background=c;
  // Image
  var hero=document.getElementById('rdr-hero'),vidEl=document.getElementById('rdr-video');
  vidEl.style.display='none';vidEl.innerHTML='';
  if(videoId){hero.style.display='none';vidEl.innerHTML='<iframe src="https://www.youtube.com/embed/'+videoId+'?autoplay=0" allowfullscreen allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture"></iframe>';vidEl.style.display='block'}
  else if(thumb){hero.src=thumb;hero.style.display='block';hero.onerror=function(){hero.style.display='none'}}
  else{hero.style.display='none'}
  // Content
  var contentEl=document.getElementById('rdr-content'),descEl=document.getElementById('rdr-desc');
  if(content&&content.length>100){contentEl.innerHTML=sanitizeHtml(content);contentEl.style.display='block';descEl.style.display='none'}
  else{contentEl.style.display='none';descEl.textContent=desc||'';descEl.style.display='block'}
  // Fav
  var favBtn=document.getElementById('rdr-fav');favBtn.setAttribute('data-link',link);
  favBtn.textContent=isFav(link)?'♥':'♡';favBtn.className='rdr-action-btn'+(isFav(link)?' saved':'');
  // Open
  document.getElementById('reader').classList.add('open');document.getElementById('reader').scrollTop=0;document.body.style.overflow='hidden';
  // Track
  markRead(link);trackRead(tab,src);
  el.classList.add('read')}
function closeReader(){document.getElementById('reader').classList.remove('open');document.getElementById('rdr-progress').style.width='0';document.body.style.overflow='';document.getElementById('rdr-video').innerHTML=''}

/* ===== FAVORITES PANEL ===== */
function openFavs(){renderFavs();document.getElementById('favs-panel').classList.add('open');document.body.style.overflow='hidden'}
function closeFavs(){document.getElementById('favs-panel').classList.remove('open');document.body.style.overflow=''}
function renderFavs(){var f=getFavs(),el=document.getElementById('favs-list');if(!f.length){el.innerHTML='<div class="favs-empty"><div class="favs-empty-icon">🔖</div><div class="favs-empty-text">Aucun article sauvegardé.<br>Appuie sur ♡ pour sauvegarder.</div></div>';return}var h=makeSecLbl('🔖','Sauvegardés',f.length);for(var i=0;i<f.length;i++){f[i].fresh=false;h+=makeCard(f[i],i===0,i)}el.innerHTML=h}

/* ===== STATS PANEL ===== */
function openStats(){renderStats();document.getElementById('stats-panel').classList.add('open');document.body.style.overflow='hidden'}
function closeStats(){document.getElementById('stats-panel').classList.remove('open');document.body.style.overflow=''}
function renderStats(){
  var s=getStats(),el=document.getElementById('stats-content');var today=new Date().toISOString().slice(0,10);
  var td=s[today]||{total:0,cats:{},srcs:{}};var week=0,cats={},srcs={};
  var keys=Object.keys(s).sort().slice(-7);
  for(var i=0;i<keys.length;i++){var d=s[keys[i]];week+=d.total;for(var c in d.cats)cats[c]=(cats[c]||0)+d.cats[c];for(var sr in d.srcs)srcs[sr]=(srcs[sr]||0)+d.srcs[sr]}
  var h='<div class="stats-grid"><div class="stat-card"><div class="stat-num">'+td.total+'</div><div class="stat-lbl">Aujourd\'hui</div></div><div class="stat-card"><div class="stat-num">'+week+'</div><div class="stat-lbl">Cette semaine</div></div><div class="stat-card"><div class="stat-num">'+getFavs().length+'</div><div class="stat-lbl">Favoris</div></div><div class="stat-card"><div class="stat-num">'+getHistory().length+'</div><div class="stat-lbl">Total lus</div></div></div>';
  h+=makeSecLbl('📂','Par catégorie',Object.keys(cats).length);var catNames={sport:'Sport',rap:'Rap',monde:'Monde',good:'Good News',tech:'Tech'};var catColors={sport:'var(--sport)',rap:'var(--rap)',monde:'var(--monde)',good:'var(--good)',tech:'var(--tech)'};var maxC=1;for(var c in cats)if(cats[c]>maxC)maxC=cats[c];
  for(var c in cats)h+='<div class="stat-bar"><span class="stat-bar-label">'+(catNames[c]||c)+'</span><div class="stat-bar-track"><div class="stat-bar-fill" style="width:'+Math.round(cats[c]/maxC*100)+'%;background:'+(catColors[c]||'var(--t2)')+'"></div></div><span class="stat-bar-val">'+cats[c]+'</span></div>';
  h+=makeSecLbl('📰','Top sources',Math.min(Object.keys(srcs).length,5));var srcArr=[];for(var sr in srcs)srcArr.push({n:sr,v:srcs[sr]});srcArr.sort(function(a,b){return b.v-a.v});var maxS=srcArr[0]?srcArr[0].v:1;
  for(var i=0;i<Math.min(srcArr.length,8);i++)h+='<div class="stat-bar"><span class="stat-bar-label">'+srcArr[i].n+'</span><div class="stat-bar-track"><div class="stat-bar-fill" style="width:'+Math.round(srcArr[i].v/maxS*100)+'%;background:var(--sport)"></div></div><span class="stat-bar-val">'+srcArr[i].v+'</span></div>';
  el.innerHTML=h}

/* ===== TRENDING ===== */
function loadTrending(){
  var all=[];var cats=['sport','rap','monde','good','tech'];var catC={sport:'var(--sport)',rap:'var(--rap)',monde:'var(--monde)',good:'var(--good)',tech:'var(--tech)'};
  for(var i=0;i<cats.length;i++){var c=getCache(cats[i]+'|'+lang);if(c){var a=c.a||c.m||[];all=all.concat(a.slice(0,3).map(function(x){x.cat=cats[i];return x}))}}
  var t=sortByDate(dedup(all)).slice(0,8);var el=document.getElementById('trending');
  if(t.length<3){el.innerHTML='';return}
  var h='';for(var j=0;j<t.length;j++){h+='<div class="trend-card fade-in" style="animation-delay:'+(j*0.05)+'s"'+cA(t[j])+'><div class="trend-src" style="color:'+(catC[t[j].cat]||'var(--sport)')+'">'+t[j].src+'</div><div class="trend-title">'+t[j].title+'</div></div>'}
  el.innerHTML=h}

/* ===== FLASH INFO ===== */
var flashArts=[],flashIdx=0,flashTimer=null;
function openFlash(){
  var all=[];var cats=['sport','rap','monde','good','tech'];
  for(var i=0;i<cats.length;i++){var c=getCache(cats[i]+'|'+lang);if(c){var a=c.a||c.m||[];all=all.concat(a.slice(0,2))}}
  flashArts=sortByDate(dedup(all)).slice(0,6);if(!flashArts.length)return;flashIdx=0;
  renderFlash();document.getElementById('flash').classList.add('open');document.body.style.overflow='hidden'}
function closeFlash(){document.getElementById('flash').classList.remove('open');document.body.style.overflow='';clearTimeout(flashTimer)}
function renderFlash(){
  if(!flashArts.length)return;var a=flashArts[flashIdx];
  document.getElementById('flash-chip').textContent=a.src;document.getElementById('flash-chip').style.background=a.c.replace('var(','').replace(')','');document.getElementById('flash-chip').style.color='#080809';
  document.getElementById('flash-title').textContent=a.title;document.getElementById('flash-desc').textContent=a.desc||'';
  document.getElementById('flash-slide').style.background=a.thumb?'linear-gradient(transparent 0%,rgba(0,0,0,.85) 70%),url('+a.thumb+') center/cover':'linear-gradient(135deg,#161619,#080809)';
  var bars='';for(var i=0;i<flashArts.length;i++)bars+='<div class="flash-bar'+(i<flashIdx?' done':'')+'"><div class="flash-bar-fill" style="width:'+(i===flashIdx?'100':'0')+'%"></div></div>';
  document.getElementById('flash-bars').innerHTML=bars;
  clearTimeout(flashTimer);flashTimer=setTimeout(function(){if(flashIdx<flashArts.length-1){flashIdx++;renderFlash()}else closeFlash()},5000)}

/* ===== ZEN MODE ===== */
var zenArts=[],zenIdx=0;
function openZen(){
  var c=getCache(tab+'|'+lang);if(!c)return;var a=c.a||c.m||[];zenArts=sortByDate(dedup(a));if(!zenArts.length)return;zenIdx=0;
  renderZen();document.getElementById('zen').classList.add('open');document.body.style.overflow='hidden'}
function closeZen(){document.getElementById('zen').classList.remove('open');document.body.style.overflow=''}
function renderZen(){
  if(!zenArts.length)return;var a=zenArts[zenIdx];
  document.getElementById('zen-src').textContent=a.src;document.getElementById('zen-src').style.color=a.c;
  document.getElementById('zen-title').textContent=a.title;document.getElementById('zen-desc').textContent=a.desc||'';
  document.getElementById('zen-counter').textContent=(zenIdx+1)+' / '+zenArts.length}

/* ===== SEARCH ===== */
function filterArticles(q){
  var cards=document.querySelectorAll('#p-'+tab+' .art, #p-'+tab+' .mini');q=q.toLowerCase();
  for(var i=0;i<cards.length;i++){var t=decodeURIComponent(cards[i].getAttribute('data-title')||'').toLowerCase();cards[i].style.display=(!q||t.indexOf(q)>-1)?'':' none'}}

/* ===== SHARE ===== */
function shareArticle(){var t=document.getElementById('rdr-title').textContent,l=document.getElementById('rdr-ext').href;if(navigator.share)navigator.share({title:t,url:l}).catch(function(){});else navigator.clipboard.writeText(l).then(function(){var b=document.getElementById('rdr-share');b.textContent='✓';setTimeout(function(){b.textContent='↗'},1500)}).catch(function(){})}

/* ===== THEME ===== */
function toggleTheme(){var c=document.documentElement.getAttribute('data-theme')||'dark';var n=c==='dark'?'light':'dark';document.documentElement.setAttribute('data-theme',n);localStorage.setItem('bsl_theme',n);document.getElementById('theme-btn').textContent=n==='dark'?'🌙':'☀️';document.querySelector('meta[name="theme-color"]').content=n==='dark'?'#080809':'#f4f4f8'}

/* ===== TABS & LANG ===== */
function switchTab(t){tab=t;var tb=document.querySelectorAll('.tb');for(var i=0;i<tb.length;i++)tb[i].classList.toggle('on',tb[i].getAttribute('data-tab')===t);var p=document.querySelectorAll('.panel');for(var j=0;j<p.length;j++)p[j].classList.toggle('on',p[j].id==='p-'+t);window.scrollTo({top:0,behavior:'smooth'});if(!htmlC[t+'|'+lang])loadTab(t,lang,false)}
function switchLang(l){lang=l;htmlC={};var b=document.querySelectorAll('.lng');for(var i=0;i<b.length;i++)b[i].classList.toggle('on',b[i].getAttribute('data-l')===l);loadTab(tab,lang,false)}

/* ===== INIT ===== */
document.addEventListener('DOMContentLoaded',function(){
  // Theme
  var saved=localStorage.getItem('bsl_theme');if(saved){document.documentElement.setAttribute('data-theme',saved);document.getElementById('theme-btn').textContent=saved==='dark'?'🌙':'☀️';if(saved==='light')document.querySelector('meta[name="theme-color"]').content='#f4f4f8'}
  // Tabs
  var tb=document.querySelectorAll('.tb');for(var i=0;i<tb.length;i++)(function(b){b.addEventListener('click',function(){switchTab(b.getAttribute('data-tab'))})})(tb[i]);
  // Lang
  var lb=document.querySelectorAll('.lng');for(var i=0;i<lb.length;i++)(function(b){b.addEventListener('click',function(){switchLang(b.getAttribute('data-l'))})})(lb[i]);
  // Event delegation
  document.querySelector('main').addEventListener('click',function(e){var r=e.target.closest('.refresh-btn');if(r){doRefresh(r.getAttribute('data-refresh'));return}var c=e.target.closest('.art,.mini');if(c)openReader(c)});
  document.getElementById('trending').addEventListener('click',function(e){var c=e.target.closest('.trend-card');if(c)openReader(c)});
  document.getElementById('favs-list').addEventListener('click',function(e){var c=e.target.closest('.art,.mini');if(c)openReader(c)});
  // Reader
  document.getElementById('rdr-back').addEventListener('click',closeReader);
  document.getElementById('reader').addEventListener('scroll',function(){var m=this.scrollHeight-this.clientHeight;document.getElementById('rdr-progress').style.width=(m>0?this.scrollTop/m*100:0)+'%'});
  var _ty=0,_ts=0;document.getElementById('reader').addEventListener('touchstart',function(e){_ty=e.touches[0].clientY;_ts=this.scrollTop},{passive:true});document.getElementById('reader').addEventListener('touchmove',function(e){if(_ts===0&&e.touches[0].clientY-_ty>70)closeReader()},{passive:true});
  document.getElementById('rdr-fav').addEventListener('click',function(){var l=this.getAttribute('data-link'),t=document.getElementById('rdr-title').textContent,s=document.getElementById('rdr-src').textContent,d=document.getElementById('rdr-desc').textContent,th=document.getElementById('rdr-hero').src||'';var added=toggleFav({title:t,link:l,src:s,desc:d,thumb:th,c:'var(--sport)'});this.textContent=added?'♥':'♡';this.className='rdr-action-btn'+(added?' saved':'')});
  document.getElementById('rdr-share').addEventListener('click',shareArticle);
  // Panels
  document.getElementById('fav-btn').addEventListener('click',openFavs);document.getElementById('favs-back').addEventListener('click',closeFavs);
  document.getElementById('stats-btn').addEventListener('click',openStats);document.getElementById('stats-back').addEventListener('click',closeStats);
  document.getElementById('flash-btn').addEventListener('click',openFlash);document.getElementById('flash-close').addEventListener('click',closeFlash);
  document.getElementById('flash-prev').addEventListener('click',function(){if(flashIdx>0){flashIdx--;renderFlash()}});document.getElementById('flash-next').addEventListener('click',function(){if(flashIdx<flashArts.length-1){flashIdx++;renderFlash()}else closeFlash()});
  document.getElementById('zen-btn').addEventListener('click',openZen);document.getElementById('zen-close').addEventListener('click',closeZen);
  document.getElementById('zen-prev').addEventListener('click',function(){if(zenIdx>0){zenIdx--;renderZen()}});document.getElementById('zen-next').addEventListener('click',function(){if(zenIdx<zenArts.length-1){zenIdx++;renderZen();markRead(zenArts[zenIdx].link);trackRead(tab,zenArts[zenIdx].src)}});
  // Search
  document.getElementById('search-btn').addEventListener('click',function(){var r=document.getElementById('search-row');r.classList.toggle('open');if(r.classList.contains('open'))document.getElementById('search-input').focus()});
  document.getElementById('search-input').addEventListener('input',function(){filterArticles(this.value)});
  // Theme
  document.getElementById('theme-btn').addEventListener('click',toggleTheme);
  // Keyboard
  document.addEventListener('keydown',function(e){if(e.key==='Escape'){if(document.getElementById('flash').classList.contains('open'))closeFlash();else if(document.getElementById('zen').classList.contains('open'))closeZen();else if(document.getElementById('stats-panel').classList.contains('open'))closeStats();else if(document.getElementById('favs-panel').classList.contains('open'))closeFavs();else if(document.getElementById('reader').classList.contains('open'))closeReader()}});
  // PWA
  var banner=document.getElementById('install-banner');
  if(!(navigator.standalone||window.matchMedia('(display-mode:standalone)').matches)){
    if(/iPad|iPhone|iPod/.test(navigator.userAgent)&&!window.MSStream)setTimeout(function(){banner.style.display='block';document.getElementById('ib-hint').style.display='block';document.getElementById('ib-inst').style.display='none'},5000);
    window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();deferredPrompt=e;setTimeout(function(){banner.style.display='block'},5000)})}
  document.getElementById('ib-inst').addEventListener('click',function(){if(!deferredPrompt)return;deferredPrompt.prompt();deferredPrompt.userChoice.then(function(){deferredPrompt=null;banner.style.display='none'})});
  document.getElementById('ib-dism').addEventListener('click',function(){banner.style.display='none'});
  // Service Worker
  if('serviceWorker' in navigator)navigator.serviceWorker.register('/sw.js').catch(function(){});
  // Init
  updateFavBadge();loadTab('sport','fr',false)});
