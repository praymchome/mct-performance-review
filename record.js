const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const context = await browser.newContext({
    viewport: { width: 390, height: 690 },
    deviceScaleFactor: 2,
    recordVideo: {
      dir: '/home/user/mct-performance-review/',
      size: { width: 780, height: 1380 }  // 2x for crisp output
    }
  });

  const page = await context.newPage();
  const filePath = 'file://' + path.resolve('/home/user/mct-performance-review/fevereiro-roxo.html');

  await page.goto(filePath, { waitUntil: 'load' });

  // Let CSS animations run to completion (last animation ends at ~4.3s) + hold 1.5s
  await page.waitForTimeout(6000);

  // Get the video path before closing
  const video = page.video();
  await context.close();
  const videoPath = await video.path();
  await browser.close();

  // Rename to a friendly name
  const outPath = '/home/user/mct-performance-review/fevereiro-roxo.webm';
  fs.renameSync(videoPath, outPath);
  const stat = fs.statSync(outPath);
  console.log('Video saved:', outPath, `(${(stat.size/1024).toFixed(0)} KB)`);
})();
