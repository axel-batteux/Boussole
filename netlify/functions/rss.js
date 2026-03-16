const https = require('https');
const http = require('http');

exports.handler = async (event) => {
  const url = event.queryStringParameters && event.queryStringParameters.url;
  if (!url) return { statusCode: 400, body: 'Missing url' };
  try {
    const xml = await fetchUrl(url);
    const items = parseRSS(xml);
    return {
      statusCode: 200,
      headers: { 'Content-Type':'application/json', 'Access-Control-Allow-Origin':'*', 'Cache-Control':'public, max-age=300' },
      body: JSON.stringify({ items: items.slice(0, 12) })
    };
  } catch(e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message, items: [] }) };
  }
};

function fetchUrl(url, redirects) {
  if (!redirects) redirects = 0;
  if (redirects > 5) return Promise.reject(new Error('Too many redirects'));
  return new Promise(function(resolve, reject) {
    var lib = url.startsWith('https') ? https : http;
    var req = lib.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/rss+xml, application/xml, application/atom+xml, text/xml, */*',
        'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache'
      },
      timeout: 10000
    }, function(res) {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        var loc = res.headers.location;
        if (loc.startsWith('/')) { var p = new URL(url); loc = p.protocol + '//' + p.host + loc; }
        return fetchUrl(loc, redirects + 1).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) return reject(new Error('HTTP ' + res.statusCode));
      var chunks = [];
      res.on('data', function(c) { chunks.push(c); });
      res.on('end', function() { resolve(Buffer.concat(chunks).toString('utf8')); });
    });
    req.on('error', reject);
    req.on('timeout', function() { req.destroy(); reject(new Error('Timeout')); });
  });
}

function parseRSS(xml) {
  var items = [];
  var itemMatches = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) || [];
  if (itemMatches.length === 0) itemMatches = xml.match(/<entry[\s>][\s\S]*?<\/entry>/gi) || [];
  for (var i = 0; i < itemMatches.length; i++) {
    var block = itemMatches[i];
    var fullContent = getTag(block, 'content:encoded') || getTag(block, 'content') || '';
    var item = {
      title: getTag(block, 'title'),
      link: getLink(block),
      description: stripHtml(getTag(block, 'description') || getTag(block, 'summary') || ''),
      content: fullContent,
      pubDate: getTag(block, 'pubDate') || getTag(block, 'published') || getTag(block, 'updated'),
      thumbnail: getAttr(block, 'media:thumbnail', 'url') || getAttr(block, 'media:content', 'url') || getEnclosure(block),
      videoId: getYoutubeId(getLink(block))
    };
    if (item.title) items.push(item);
  }
  return items;
}

function getTag(xml, tag) {
  var re = new RegExp('<' + tag + '[^>]*>([\\s\\S]*?)<\\/' + tag + '>', 'i');
  var m = xml.match(re);
  if (!m) return '';
  var val = m[1].trim();
  var cdata = val.match(/<!\[CDATA\[([\s\S]*?)\]\]>/i);
  if (cdata) return cdata[1].trim();
  return val;
}

function getLink(xml) {
  var atom = xml.match(/<link[^>]+href=["']([^"']+)["'][^>]*rel=["']alternate["']/i)
    || xml.match(/<link[^>]+rel=["']alternate["'][^>]+href=["']([^"']+)["']/i)
    || xml.match(/<link[^>]+href=["']([^"']+)["']/i);
  if (atom) return atom[1];
  var rss = xml.match(/<link[^>]*>(https?:\/\/[^<]+)<\/link>/i);
  if (rss) return rss[1].trim();
  return '';
}

function getAttr(xml, tag, attr) {
  var re = new RegExp('<' + tag + '[^>]+' + attr + '=["\\'](.*?)["\']', 'i');
  var m = xml.match(re);
  return m ? m[1] : '';
}

function getEnclosure(xml) {
  var m = xml.match(/<enclosure[^>]+url=["']([^"']+)["'][^>]+type=["']image/i)
    || xml.match(/<enclosure[^>]+type=["']image[^"']*["'][^>]+url=["']([^"']+)["']/i);
  return m ? m[1] : '';
}

function getYoutubeId(url) {
  if (!url) return '';
  var m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : '';
}

function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 400);
}
