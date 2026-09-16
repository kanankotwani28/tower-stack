const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const GAME = 'file:///' + path.resolve(__dirname, '..', 'game', 'tower-rush.html').replace(/\\/g, '/');
const OUT  = __dirname;
const W = 1080, H = 2340;                      // 19.5:9, a common Play listing size

const wait = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const CHROME = 'C:/Users/BITPATNA/.cache/puppeteer/chrome/win64-149.0.7827.22/chrome-win64/chrome.exe';
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--allow-file-access-from-files', '--force-device-scale-factor=1', '--hide-scrollbars']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
  page.on('pageerror', e => console.log('  PAGE ERROR:', e.message));

  await page.goto(GAME, { waitUntil: 'networkidle0', timeout: 90000 });
  await page.evaluate(() => document.fonts.ready);
  await wait(1200);                            // let art decode + first frames settle

  const shot = async (name) => {
    await wait(700);
    const p = path.join(OUT, name + '.png');
    await page.screenshot({ path: p });
    console.log('  saved', name + '.png', (fs.statSync(p).size / 1024).toFixed(0) + ' KB');
  };

  // seed a believable record so the UI isn't all zeroes
  await page.evaluate(() => { store.best = 34; refreshBest(); toMenu(); });
  await wait(600);
  await shot('01-home');

  // a real run: drop a few blocks so the tower is genuine, not faked
  await page.evaluate(async () => {
    startGame();
    for (let i = 0; i < 7; i++){
      S.cur.x = S.blocks[S.blocks.length - 1].x + (i % 2 ? 8 : -8);   // slight offcuts
      drop();
    }
  });
  await wait(900);
  await shot('02-gameplay');

  await page.evaluate(() => pauseGame());
  await shot('03-pause');

  await page.evaluate(() => { resumeGame(); });
  await wait(2200);                            // let the 3-2-1 countdown finish
  await page.evaluate(() => { S.score = 41; store.best = 34; gameOver(); });
  await wait(1400);                            // panel slides in after the camera pull-back
  await shot('04-gameover');

  await page.evaluate(() => { store.best = 180; toMenu(); openSkins(); });
  await wait(700);
  await shot('05-skins');

  await page.evaluate(() => { closeSheets(); openSettings(); });
  await shot('06-settings');

  await browser.close();
  console.log('done');
})().catch(e => { console.error('FAILED:', e.message); process.exit(1); });
