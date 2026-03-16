/* ===== CONFIG ===== */
var CACHE_TTL = 10 * 60 * 1000;
var lang = 'fr';
var tab = 'sport';
var deferredPrompt = null;

var FEEDS = {
  sport: {
    fr: {
      main: [
        { url:'https://rmcsport.bfmtv.com/rss/football/', src:'RMC Sport', c:'var(--sport)' },
        { url:'https://www.foot01.com/rss/actu', src:'Foot01', c:'var(--sport)' },
        { url:'https://www.footmercato.net/feed', src:'Foot Mercato', c:'var(--sport)' },
        { url:'https://www.sofoot.com/rss.xml', src:'SoFoot', c:'var(--sport)' },
        { url:'https://www.maxifoot.fr/rss.php', src:'Maxifoot', c:'var(--sport)' }
      ],
      omni: [
        { url:'https://www.lefigaro.fr/rss/figaro_sport.xml', src:'Le Figaro Sport', c:'var(--sport)' },
        { url:'https://www.leparisien.fr/rss/sport.rss', src:'Le Parisien Sport', c:'var(--sport)' }
      ]
    },
    en: {
      main: [
        { url:'https://feeds.bbci.co.uk/sport/football/rss.xml', src:'BBC Football', c:'var(--sport)' },
        { url:'https://www.skysports.com/rss/12040', src:'Sky Sports', c:'var(--sport)' },
        { url:'https://www.goal.com/feeds/en/news', src:'Goal.com', c:'var(--sport)' }
      ],
      omni: [
        { url:'https://sportskeeda.com/feed', src:'Sportskeeda', c:'var(--sport)' }
      ]
    }
  },
  rap: {
    fr: [
      { url:'https://www.booska-p.com/feed/', src:'Booska-P', c:'var(--rap)' },
      { url:'https://www.yard.media/feed/', src:'Yard', c:'var(--rap)' },
      { url:'https://www.abcdr.net/rss.php', src:'Abcdr du Son', c:'var(--rap)' },
      { url:'https://www.mouv.fr/rss/actualites', src:"Mouv'", c:'var(--rap)' },
      { url:'https://www.rap2k.com/feed/', src:'Rap2K', c:'var(--rap)' }
    ],
    en: [
      { url:'https://www.xxlmag.com/feed/', src:'XXL', c:'var(--rap)' },
      { url:'https://hiphopdx.com/rss', src:'HipHopDX', c:'var(--rap)' },
      { url:'https://www.hotnewhiphop.com/rss/news.xml', src:'HotNewHipHop', c:'var(--rap)' }
    ]
  },
  monde: {
    fr: [
      { url:'https://www.france24.com/fr/rss', src:'France 24', c:'var(--monde)' },
      { url:'https://www.courrierinternational.com/feed/all/rss.xml', src:'Courrier Int.', c:'var(--monde)' },
      { url:'https://www.lepoint.fr/monde/rss.xml', src:'Le Point', c:'var(--monde)' },
      { url:'https://www.lefigaro.fr/rss/figaro_international.xml', src:'Le Figaro', c:'var(--monde)' },
      { url:'https://www.rfi.fr/fr/rss', src:'RFI', c:'var(--monde)' }
    ],
    en: [
      { url:'https://www.france24.com/en/rss', src:'France 24 EN', c:'var(--monde)' },
      { url:'https://www.theguardian.com/world/rss', src:'The Guardian', c:'var(--monde)' },
      { url:'https://feeds.npr.org/1004/rss.xml', src:'NPR World', c:'var(--monde)' },
      { url:'https://feeds.bbci.co.uk/news/world/rss.xml', src:'BBC World', c:'var(--monde)' }
    ]
  },
  good: {
    fr: [
      { url:'https://www.lemediapositif.com/feed/', src:'Le Media Positif', c:'var(--good)' },
      { url:'https://positivr.fr/feed/', src:'Positivr', c:'var(--good)' },
      { url:'https://mrmondialisation.org/feed/', src:'Mr Mondialisation', c:'var(--good)' }
    ],
    en: [
      { url:'https://www.goodnewsnetwork.org/feed/', src:'Good News Network', c:'var(--good)' },
      { url:'https://www.positive.news/feed/', src:'Positive News', c:'var(--good)' },
      { url:'https://reasonstobecheerful.world/feed/', src:'Reasons to be Cheerful', c:'var(--good)' }
    ]
  },
  tech: {
    fr: [
      { url:'https://www.lesnumeriques.com/actu_0.rss', src:'Les Numeriques', c:'var(--tech)' },
      { url:'https://www.frandroid.com/feed', src:'Frandroid', c:'var(--tech)' },
      { url:'https://www.numerama.com/feed/', src:'Numerama', c:'var(--tech)' },
      { url:'https://www.01net.com/rss/info/flux-rss-actualite/', src:'01net', c:'var(--tech)' }
    ],
    en: [
      { url:'https://feeds.feedburner.com/TechCrunch', src:'TechCrunch', c:'var(--tech)' },
      { url:'https://www.theverge.com/rss/index.xml', src:'The Verge', c:'var(--tech)' },
      { url:'https://feeds.arstechnica.com/arstechnica/index', src:'Ars Technica', c:'var(--tech)' },
      { url:'https://www.wired.com/feed/rss', src:'Wired', c:'var(--tech)' }
    ]
  }
};

/* ===== UTILITIES ===== */
function timeAgo(s) {
  if (!s) return '';
  var d = new Date(s);
  var m = Math.floor((Date.now() - d) / 60000);
  if (isNaN(m) || m < 0) return '';
  var isFR = lang !== 'en';
  if (m < 2) return isFR ? 'À l\'instant' : 'Just now';
  if (m < 60) return (isFR ? 'Il y a ' : '') + m + 'min' + (isFR ? '' : ' ago');
  var h = Math.floor(m / 60);
  if (h < 24) return (isFR ? 'Il y a ' : '') + h + 'h' + (isFR ? '' : ' ago');
  var j = Math.floor(h / 24);
  return (isFR ? 'Il y a ' : '') + j + (isFR ? 'j' : 'd') + (isFR ? '' : ' ago');
}

function isFresh(s) {
  if (!s) return false;
  var d = new Date(s);
  return (Date.now() - d) < 2 * 60 * 60 * 1000;
}

function clean(h) {
  if (!h) return '';
  var d = document.createElement('div');
  d.innerHTML = h;
  var t = d.textContent || d.innerText || '';
  return t.replace(/\s+/g, ' ').trim().slice(0, 260);
}

function safeLink(url) {
  if (!url) return '#';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return '#';
}

function dedup(articles) {
  var seen = {};
  return articles.filter(function(a) {
    var key = a.title.toLowerCase().replace(/[^a-z0-9àâéèêëïîôùûüç]/g, '').slice(0, 50);
    if (!key || seen[key]) return false;
    seen[key] = true;
    return true;
  });
}

function sortByDate(articles) {
  return articles.sort(function(a, b) {
    var da = new Date(a.rawDate || 0);
    var db = new Date(b.rawDate || 0);
    return db - da;
  });
}

function nowStr() {
  return new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

/* ===== CACHE ===== */
function getCache(key) {
  try {
    var item = localStorage.getItem('bsl_' + key);
    if (!item) return null;
    var parsed = JSON.parse(item);
    if (Date.now() - parsed.ts > CACHE_TTL) { localStorage.removeItem('bsl_' + key); return null; }
    return parsed.data;
  } catch(e) { return null; }
}

function setCache(key, data) {
  try { localStorage.setItem('bsl_' + key, JSON.stringify({ ts: Date.now(), data: data })); }
  catch(e) {}
}

/* ===== FAVORITES ===== */
function getFavs() {
  try { return JSON.parse(localStorage.getItem('bsl_favs') || '[]'); } catch(e) { return []; }
}

function setFavs(favs) {
  try { localStorage.setItem('bsl_favs', JSON.stringify(favs)); } catch(e) {}
}

function toggleFav(article) {
  var favs = getFavs();
  var idx = -1;
  for (var i = 0; i < favs.length; i++) { if (favs[i].link === article.link) { idx = i; break; } }
  if (idx > -1) favs.splice(idx, 1);
  else favs.unshift(article);
  setFavs(favs);
  updateFavBadge();
  return idx === -1;
}

function isFav(link) {
  var favs = getFavs();
  for (var i = 0; i < favs.length; i++) { if (favs[i].link === link) return true; }
  return false;
}

function updateFavBadge() {
  var badge = document.getElementById('fav-badge');
  var n = getFavs().length;
  badge.textContent = n > 0 ? n : '';
}

/* ===== FETCH ===== */
async function fetchFeed(feed, max) {
  if (!max) max = 6;
  var enc = encodeURIComponent(feed.url);
  var urls = [
    '/.netlify/functions/rss?url=' + enc,
    'https://api.rss2json.com/v1/api.json?rss_url=' + enc
  ];
  for (var i = 0; i < urls.length; i++) {
    try {
      var resp = await fetch(urls[i], { signal: AbortSignal.timeout(8000) });
      var data = await resp.json();
      var items = data.items || [];
      if (items.length === 0) continue;
      var result = [];
      for (var j = 0; j < Math.min(items.length, max); j++) {
        var it = items[j];
        var rawDate = it.pubDate || it.published || it.updated || '';
        result.push({
          title: clean(it.title || ''),
          desc: clean(it.description || it.content || it.summary || ''),
          link: safeLink(it.link || it.url),
          rawDate: rawDate,
          age: timeAgo(rawDate),
          fresh: isFresh(rawDate),
          src: feed.src,
          c: feed.c,
          thumb: it.thumbnail || (it.enclosure ? it.enclosure.link : '') || ''
        });
      }
      return result;
    } catch(e) { continue; }
  }
  return [];
}

async function fetchAll(feeds, max) {
  if (!max) max = 5;
  var promises = [];
  for (var i = 0; i < feeds.length; i++) promises.push(fetchFeed(feeds[i], max));
  var results = await Promise.allSettled(promises);
  var all = [];
  for (var j = 0; j < results.length; j++) {
    if (results[j].status === 'fulfilled') all = all.concat(results[j].value);
  }
  return all;
}

/* ===== RENDER ===== */
function makeSkeleton(n) {
  var h = '<div class="skel hero"><div><div class="shimmer" style="width:60px;height:14px;margin-bottom:12px"></div><div class="shimmer" style="width:90%;height:20px;margin-bottom:8px"></div><div class="shimmer" style="width:65%;height:20px"></div></div></div>';
  for (var i = 1; i < n; i++) {
    h += '<div class="skel"><div><div class="shimmer" style="width:50px;height:12px;margin-bottom:12px"></div><div class="shimmer" style="width:80%;height:16px;margin-bottom:6px"></div><div class="shimmer" style="width:55%;height:16px"></div></div><div class="shimmer" style="width:68px;height:54px;border-radius:7px"></div></div>';
  }
  return h;
}

function makeRefreshRow(t) {
  return '<div class="refresh-row">'
    + '<span class="last-upd"><span class="live-dot"></span>Mis à jour ' + nowStr() + '</span>'
    + '<button class="refresh-btn" data-refresh="' + t + '">⟳ Rafraîchir</button>'
    + '</div>';
}

function makeSecLbl(icon, text, n) {
  return '<div class="sec-lbl">'
    + '<span class="sec-lbl-t">' + icon + ' ' + text + '</span>'
    + '<div class="sec-lbl-l"></div>'
    + '<span class="sec-lbl-n">' + n + ' article' + (n > 1 ? 's' : '') + '</span>'
    + '</div>';
}

function makeEnd() {
  return '<div class="end">' + (lang === 'en' ? 'End of feed' : 'Fin du fil') + '</div>';
}

function cardAttrs(a) {
  return ' data-link="' + (a.link || '#') + '"'
    + ' data-title="' + encodeURIComponent(a.title || '') + '"'
    + ' data-src="' + (a.src || '') + '"'
    + ' data-c="' + (a.c || 'var(--sport)') + '"'
    + ' data-age="' + (a.age || '') + '"'
    + ' data-desc="' + encodeURIComponent(a.desc || '') + '"'
    + ' data-thumb="' + (a.thumb || '') + '"'
    + ' data-raw-date="' + (a.rawDate || '') + '"';
}

function makeCard(a, hero, idx) {
  var delay = (idx || 0) * 0.04;
  var imgHtml = '';
  if (hero) {
    imgHtml = '<div class="hero-img">' + (a.thumb ? '<img src="' + a.thumb + '" alt="" loading="lazy" onerror="this.parentNode.style.display=\'none\'">' : '') + '</div>';
  } else {
    imgHtml = '<div class="art-thumb">' + (a.thumb ? '<img src="' + a.thumb + '" alt="" loading="lazy" onerror="this.style.display=\'none\'">' : '') + '</div>';
  }
  var freshBadge = a.fresh ? '<span class="fresh-badge">' + (lang === 'en' ? 'NEW' : 'NOUVEAU') + '</span>' : '';
  var inner = '<div>'
    + '<div class="art-meta">'
    + '<span class="chip" style="color:' + a.c + '">' + a.src + '</span>'
    + freshBadge
    + '<span class="art-age">' + a.age + '</span>'
    + '</div>'
    + '<div class="art-title">' + a.title + '</div>'
    + (hero && a.desc ? '<div class="art-desc">' + a.desc + '</div>' : '')
    + '</div>';
  return '<div class="art' + (hero ? ' hero' : '') + ' fade-in" style="animation-delay:' + delay + 's"'
    + cardAttrs(a) + '>' + inner + imgHtml + '</div>';
}

function makeMini(a, catColor, idx) {
  var delay = (idx || 0) * 0.04;
  return '<div class="mini fade-in" style="animation-delay:' + delay + 's"'
    + cardAttrs(a) + '>'
    + '<div class="mini-dot" style="background:' + (catColor || 'var(--sport)') + '"></div>'
    + '<div class="mini-t">' + a.title + '</div>'
    + '<span class="mini-s">' + a.src + '</span>'
    + '</div>';
}

function buildSport(mains, omnis) {
  var sorted = sortByDate(dedup(mains));
  var sortedOmni = sortByDate(dedup(omnis));
  var h = makeRefreshRow('sport');
  h += makeSecLbl('⚽', 'Football', sorted.length);
  if (sorted.length > 0) {
    h += '<div class="feed-grid">';
    h += makeCard(sorted[0], true, 0);
    for (var i = 1; i < sorted.length; i++) h += makeCard(sorted[i], false, i);
    h += '</div>';
  } else {
    h += '<div class="empty-msg">' + (lang === 'en' ? 'No articles available.' : 'Aucun article disponible.') + '</div>';
  }
  if (sortedOmni.length > 0) {
    h += makeSecLbl('🏅', 'Omnisport', sortedOmni.length);
    for (var j = 0; j < sortedOmni.length; j++) h += makeMini(sortedOmni[j], 'var(--sport)', sorted.length + j);
  }
  h += makeEnd();
  return h;
}

function buildSimple(t, arts) {
  var cfg = {
    rap: { icon:'🎤', label:'Rap & Culture' },
    monde: { icon:'🌍', label: lang === 'en' ? 'World News' : 'Actualité mondiale' },
    good: { icon:'✨', label: lang === 'en' ? 'Good News' : 'Bonnes nouvelles' },
    tech: { icon:'⚡', label:'Tech' }
  };
  var c = cfg[t] || { icon:'', label:t };
  var sorted = sortByDate(dedup(arts));
  var h = makeRefreshRow(t);
  h += makeSecLbl(c.icon, c.label, sorted.length);
  if (sorted.length > 0) {
    h += '<div class="feed-grid">';
    h += makeCard(sorted[0], true, 0);
    for (var i = 1; i < sorted.length; i++) h += makeCard(sorted[i], false, i);
    h += '</div>';
  } else {
    h += '<div class="empty-msg">' + (lang === 'en' ? 'No articles available.' : 'Aucun article disponible.') + '</div>';
  }
  h += makeEnd();
  return h;
}

/* ===== LOAD TAB ===== */
var htmlCache = {};

async function loadTab(t, l, force) {
  var key = t + '|' + l;
  var el = document.getElementById('p-' + t);
  if (!el) return;

  if (htmlCache[key] && !force) { el.innerHTML = htmlCache[key]; return; }

  // Check localStorage cache
  var cached = getCache(key);
  if (cached && !force) {
    var html = t === 'sport' ? buildSport(cached.mains || [], cached.omnis || []) : buildSimple(t, cached.arts || []);
    htmlCache[key] = html;
    el.innerHTML = html;
    return;
  }

  el.innerHTML = makeSkeleton(5);

  var ef = l;
  var html = '';
  try {
    if (t === 'sport') {
      if (l === 'mix') {
        var r = await Promise.all([
          fetchAll(FEEDS.sport.fr.main, 4), fetchAll(FEEDS.sport.fr.omni, 3),
          fetchAll(FEEDS.sport.en.main, 4), fetchAll(FEEDS.sport.en.omni, 3)
        ]);
        var mains = r[0].concat(r[2]);
        var omnis = r[1].concat(r[3]);
        setCache(key, { mains: mains, omnis: omnis });
        html = buildSport(mains, omnis);
      } else {
        var cfg = FEEDS.sport[ef] || FEEDS.sport.fr;
        var r = await Promise.all([fetchAll(cfg.main, 5), fetchAll(cfg.omni, 4)]);
        setCache(key, { mains: r[0], omnis: r[1] });
        html = buildSport(r[0], r[1]);
      }
    } else {
      var arts;
      if (l === 'mix') {
        var frFeeds = (FEEDS[t] && FEEDS[t].fr) || [];
        var enFeeds = (FEEDS[t] && FEEDS[t].en) || [];
        if (Array.isArray(frFeeds)) {
          var r = await Promise.all([fetchAll(frFeeds, 4), fetchAll(enFeeds, 4)]);
          arts = r[0].concat(r[1]);
        } else {
          arts = await fetchAll(frFeeds, 6);
        }
      } else {
        var fds = (FEEDS[t] && (FEEDS[t][ef] || FEEDS[t].fr)) || [];
        arts = await fetchAll(fds, 6);
      }
      setCache(key, { arts: arts });
      html = buildSimple(t, arts);
    }
  } catch(e) {
    html = '<div class="empty-msg">' + (lang === 'en' ? 'Loading error. Check your connection.' : 'Erreur de chargement. Vérifiez votre connexion.') + '</div>';
  }
  htmlCache[key] = html;
  el.innerHTML = html;
}

function doRefresh(t) {
  delete htmlCache[t + '|' + lang];
  try { localStorage.removeItem('bsl_' + t + '|' + lang); } catch(e) {}
  loadTab(t, lang, true);
}

/* ===== READER ===== */
function openReader(el) {
  var title = decodeURIComponent(el.getAttribute('data-title') || '');
  var src = el.getAttribute('data-src') || '';
  var c = el.getAttribute('data-c') || 'var(--sport)';
  var age = el.getAttribute('data-age') || '';
  var desc = decodeURIComponent(el.getAttribute('data-desc') || '');
  var thumb = el.getAttribute('data-thumb') || '';
  var link = el.getAttribute('data-link') || '#';

  document.getElementById('rdr-title').textContent = title;
  var srcEl = document.getElementById('rdr-src');
  srcEl.textContent = src;
  srcEl.style.color = c;
  srcEl.style.borderColor = c;
  document.getElementById('rdr-time').textContent = age;
  document.getElementById('rdr-ext').href = link;
  document.getElementById('rdr-cta').href = link;

  var hero = document.getElementById('rdr-hero');
  if (thumb) { hero.src = thumb; hero.style.display = 'block'; hero.onerror = function() { hero.style.display = 'none'; }; }
  else { hero.style.display = 'none'; }

  document.getElementById('rdr-desc').textContent = desc || '';

  // Update progress bar color
  document.getElementById('rdr-progress').style.background = c;

  // Update fav button
  var favBtn = document.getElementById('rdr-fav');
  favBtn.setAttribute('data-link', link);
  favBtn.textContent = isFav(link) ? '♥' : '♡';
  favBtn.className = 'rdr-action-btn' + (isFav(link) ? ' saved' : '');

  document.getElementById('reader').classList.add('open');
  document.getElementById('reader').scrollTop = 0;
  document.body.style.overflow = 'hidden';
}

function closeReader() {
  document.getElementById('reader').classList.remove('open');
  document.getElementById('rdr-progress').style.width = '0';
  document.body.style.overflow = '';
}

/* ===== FAVORITES PANEL ===== */
function openFavs() {
  renderFavs();
  document.getElementById('favs-panel').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeFavs() {
  document.getElementById('favs-panel').classList.remove('open');
  document.body.style.overflow = '';
}

function renderFavs() {
  var favs = getFavs();
  var el = document.getElementById('favs-list');
  if (favs.length === 0) {
    el.innerHTML = '<div class="favs-empty"><div class="favs-empty-icon">🔖</div><div class="favs-empty-text">'
      + (lang === 'en' ? 'No saved articles yet.<br>Tap ♡ in the reader to save.' : 'Aucun article sauvegardé.<br>Appuie sur ♡ dans le lecteur pour sauvegarder.')
      + '</div></div>';
    return;
  }
  var h = '<div class="sec-lbl"><span class="sec-lbl-t">🔖 ' + (lang === 'en' ? 'Saved' : 'Sauvegardés') + '</span><div class="sec-lbl-l"></div><span class="sec-lbl-n">' + favs.length + ' article' + (favs.length > 1 ? 's' : '') + '</span></div>';
  for (var i = 0; i < favs.length; i++) {
    var a = favs[i];
    a.age = a.age || '';
    a.fresh = false;
    h += makeCard(a, i === 0, i);
  }
  el.innerHTML = h;
}

/* ===== SHARE ===== */
function shareArticle() {
  var title = document.getElementById('rdr-title').textContent;
  var link = document.getElementById('rdr-ext').href;
  if (navigator.share) {
    navigator.share({ title: title, url: link }).catch(function() {});
  } else {
    navigator.clipboard.writeText(link).then(function() {
      var btn = document.getElementById('rdr-share');
      btn.textContent = '✓';
      setTimeout(function() { btn.textContent = '↗'; }, 1500);
    }).catch(function() {});
  }
}

/* ===== TABS & LANG ===== */
function switchTab(t) {
  tab = t;
  var tabs = document.querySelectorAll('.tb');
  for (var i = 0; i < tabs.length; i++) tabs[i].classList.toggle('on', tabs[i].getAttribute('data-tab') === t);
  var panels = document.querySelectorAll('.panel');
  for (var j = 0; j < panels.length; j++) panels[j].classList.toggle('on', panels[j].id === 'p-' + t);
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (!htmlCache[t + '|' + lang]) loadTab(t, lang, false);
}

function switchLang(l) {
  lang = l;
  htmlCache = {};
  var btns = document.querySelectorAll('.lng');
  for (var i = 0; i < btns.length; i++) btns[i].classList.toggle('on', btns[i].getAttribute('data-l') === l);
  loadTab(tab, lang, false);
}

/* ===== EVENT LISTENERS ===== */
document.addEventListener('DOMContentLoaded', function() {
  // Tabs
  var tbBtns = document.querySelectorAll('.tb');
  for (var i = 0; i < tbBtns.length; i++) {
    (function(btn) { btn.addEventListener('click', function() { switchTab(btn.getAttribute('data-tab')); }); })(tbBtns[i]);
  }

  // Lang
  var lngBtns = document.querySelectorAll('.lng');
  for (var i = 0; i < lngBtns.length; i++) {
    (function(btn) { btn.addEventListener('click', function() { switchLang(btn.getAttribute('data-l')); }); })(lngBtns[i]);
  }

  // Event delegation for cards (main + favs-panel)
  document.querySelector('main').addEventListener('click', function(e) {
    var refresh = e.target.closest('.refresh-btn');
    if (refresh) { doRefresh(refresh.getAttribute('data-refresh')); return; }
    var card = e.target.closest('.art, .mini');
    if (card) openReader(card);
  });

  document.getElementById('favs-list').addEventListener('click', function(e) {
    var card = e.target.closest('.art, .mini');
    if (card) openReader(card);
  });

  // Reader
  document.getElementById('rdr-back').addEventListener('click', closeReader);

  // Reader progress bar
  document.getElementById('reader').addEventListener('scroll', function() {
    var el = this;
    var max = el.scrollHeight - el.clientHeight;
    var pct = max > 0 ? (el.scrollTop / max) * 100 : 0;
    document.getElementById('rdr-progress').style.width = pct + '%';
  });

  // Reader swipe to close
  var _ty = 0, _ts = 0;
  document.getElementById('reader').addEventListener('touchstart', function(e) {
    _ty = e.touches[0].clientY;
    _ts = this.scrollTop;
  }, { passive: true });
  document.getElementById('reader').addEventListener('touchmove', function(e) {
    if (_ts === 0 && e.touches[0].clientY - _ty > 70) closeReader();
  }, { passive: true });

  // Reader fav toggle
  document.getElementById('rdr-fav').addEventListener('click', function() {
    var link = this.getAttribute('data-link');
    var title = document.getElementById('rdr-title').textContent;
    var src = document.getElementById('rdr-src').textContent;
    var desc = document.getElementById('rdr-desc').textContent;
    var thumb = document.getElementById('rdr-hero').src || '';
    var article = { title: title, link: link, src: src, desc: desc, thumb: thumb, c: 'var(--sport)' };
    var added = toggleFav(article);
    this.textContent = added ? '♥' : '♡';
    this.className = 'rdr-action-btn' + (added ? ' saved' : '');
  });

  // Share
  document.getElementById('rdr-share').addEventListener('click', shareArticle);

  // Favorites panel
  document.getElementById('fav-btn').addEventListener('click', openFavs);
  document.getElementById('favs-back').addEventListener('click', closeFavs);

  // Keyboard shortcuts
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      if (document.getElementById('favs-panel').classList.contains('open')) closeFavs();
      else if (document.getElementById('reader').classList.contains('open')) closeReader();
    }
  });

  // PWA install banner
  var banner = document.getElementById('install-banner');
  function isIOS() { return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream; }
  function isStandalone() { return navigator.standalone || window.matchMedia('(display-mode: standalone)').matches; }

  if (!isStandalone()) {
    if (isIOS()) {
      setTimeout(function() {
        banner.style.display = 'block';
        document.getElementById('ib-hint').style.display = 'block';
        document.getElementById('ib-inst').style.display = 'none';
      }, 5000);
    }
    window.addEventListener('beforeinstallprompt', function(e) {
      e.preventDefault();
      deferredPrompt = e;
      setTimeout(function() { banner.style.display = 'block'; }, 5000);
    });
  }

  document.getElementById('ib-inst').addEventListener('click', function() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(function() { deferredPrompt = null; banner.style.display = 'none'; });
  });

  document.getElementById('ib-dism').addEventListener('click', function() { banner.style.display = 'none'; });

  // Init
  updateFavBadge();
  loadTab('sport', 'fr', false);
});
