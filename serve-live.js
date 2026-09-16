/* ==========================================================================
   Play Tower Rush with the platform's live art, before the CORS fix lands.
   --------------------------------------------------------------------------
     node serve-live.js            then open the URL it prints

   The game already knows how to pull its storefronts from the dashboard. The
   only thing stopping it today is that gameasset.panscience.ai does not send
   an Access-Control-Allow-Origin header for any origin but its own, so the
   browser throws the response away.

   This server stands in for that one header. It fetches the real manifest
   server-side, where CORS does not apply, and re-serves it with the header the
   deployment is missing. Nothing else is faked: the asset list is live, and
   the sprites load straight from S3.

   Once ALLOWED_ORIGINS includes the game's origin, this file has no further
   use - the APK will do exactly this on its own.
   ========================================================================== */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const PROD = 'https://gameasset.panscience.ai';
const GAME = path.join(__dirname, 'game', 'tower-rush.remote.html');
const PORT = Number(process.env.PORT) || 8899;

/* the line remote-assets.js declares its endpoint on */
const API_LINE = JSON.stringify(PROD);

if (!fs.existsSync(GAME)) {
  console.error('Cannot find the game at:\n  ' + GAME);
  process.exit(1);
}

const html = fs.readFileSync(GAME, 'utf8');

if (!html.includes(API_LINE)) {
  console.error(
    'This build of tower-rush.html has no remote-asset loader in it.\n' +
    'Re-run the injector before using this server.'
  );
  process.exit(1);
}

const page = html.split(API_LINE).join(JSON.stringify(''));   // same-origin: this server

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost:' + PORT);

  if (url.pathname.startsWith('/api/')) {
    try {
      const upstream = await fetch(PROD + url.pathname + url.search);
      const body = await upstream.text();
      let count = '';
      try {
        const parsed = JSON.parse(body);
        const n = parsed && parsed.data && parsed.data.assets;
        if (Array.isArray(n)) count = '  (' + n.length + ' assets)';
      } catch (e) { /* not the manifest */ }
      console.log('  proxied ' + url.pathname + ' -> ' + upstream.status + count);

      res.writeHead(upstream.status, {
        'Content-Type': 'application/json',
        /* the header the deployment is missing */
        'Access-Control-Allow-Origin': '*'
      });
      return res.end(body);
    } catch (err) {
      console.log('  upstream failed: ' + err.message);
      res.writeHead(502, { 'Access-Control-Allow-Origin': '*' });
      return res.end(JSON.stringify({ success: false, error: err.message }));
    }
  }

  if (url.pathname === '/' || url.pathname === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(page);
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found. The game is at /');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error('Port ' + PORT + ' is already in use. Try:  set PORT=9100 && node serve-live.js');
    process.exit(1);
  }
  throw err;
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('');
  console.log('  Tower Rush, live art from ' + PROD);
  console.log('');
  console.log('    http://localhost:' + PORT);
  console.log('');
  console.log('  Storefronts come from the dashboard. Change one there, reload,');
  console.log('  and it changes here. Ctrl+C to stop.');
  console.log('');
});
