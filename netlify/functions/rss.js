const https = require('https');
const http = require('http');
const { parseStringPromise } = require('xml2js');

exports.handler = async (event) => {
  const url = event.queryStringParameters?.url;
  if (!url) return { statusCode: 400, body: 'Missing url param' };

  try {
    const xml = await fetchUrl(url);
    const parsed = await parseStringPromise(xml, { explicitArray: false, ignoreAttrs: false });

    const channel = parsed?.rss?.channel || parsed?.feed;
    const isAtom = !!parsed?.feed;

    let items = [];

    if (isAtom) {
      const entries = channel?.entry || [];
      const arr = Array.isArray(entries) ? entries : [entries];
      items = arr.map(e => ({
        title: getText(e.title),
        link: getAtomLink(e.link),
        description: getText(e.summary || e.content),
        pubDate: e.updated || e.published || '',
        thumbnail: e['media:thumbnail']?.['$']?.url || e['media:content']?.['$']?.url || '',
      }));
    } else {
      const raw = channel?.item || [];
      const arr = Array.isArray(raw) ? raw : [raw];
      items = arr.map(i => ({
        title: getText(i.title),
        link: getText(i.link) || i.link || '',
        description: getText(i.description),
        pubDate: getText(i.pubDate),
        thumbnail: i['media:thumbnail']?.['$']?.url || i['media:content']?.['$']?.url || i.enclosure?.['$']?.url || '',
      }));
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=300', // 5min cache
      },
      body: JSON.stringify({ items: items.slice(0, 10) }),
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};

function getText(v) {
  if (!v) return '';
  if (typeof v === 'string') return v;
  if (v._) return v._;
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

function getAtomLink(l) {
  if (!l) return '';
  if (typeof l === 'string') return l;
  if (Array.isArray(l)) {
    const alt = l.find(x => x['$']?.rel === 'alternate' || !x['$']?.rel);
    return alt?.['$']?.href || '';
  }
  return l['$']?.href || '';
}

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Boussole/1.0; +https://boussole.app)',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      },
      timeout: 8000,
    }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}
