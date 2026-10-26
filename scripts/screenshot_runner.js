import puppeteer from 'puppeteer';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 4173;
const DIST_DIR = path.resolve(__dirname, '../dist');
const SCREENSHOT_DIR = path.resolve(__dirname, '../docs/screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// Simple static file server for dist
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.mp4': 'video/mp4',
  '.pcd': 'application/octet-stream'
};

const server = http.createServer((req, res) => {
  let filePath = path.join(DIST_DIR, req.url.split('?')[0]);
  if (req.url === '/' || !path.extname(filePath)) {
    filePath = path.join(DIST_DIR, 'index.html');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, async () => {
  console.log(`Preview server running at http://127.0.0.1:${PORT}`);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', (err) => console.log('PAGE ERROR:', err.message));
  await page.setViewport({ width: 1440, height: 900 });

  // 1. Dashboard Overview
  console.log('Capturing 01-dashboard-overview.png...');
  await page.goto(`http://127.0.0.1:${PORT}`, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-dashboard-overview.png') });

  // 2. Camera Primary View (click PiP card)
  console.log('Capturing 02-camera-primary.png...');
  const pipCard = await page.$('.pip-window-card');
  if (pipCard) {
    await pipCard.click();
    await new Promise((r) => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-camera-primary.png') });
    // Switch back
    const toggleBtn = await page.$('.view-mode-pill');
    if (toggleBtn) await toggleBtn.click();
    await new Promise((r) => setTimeout(r, 1000));
  }

  // 3. 3D Point Cloud View (click "Switch to 3D Point Cloud View")
  console.log('Capturing 03-3d-pointcloud.png...');
  const mapModeBtn = await page.$('.map-mode-btn');
  if (mapModeBtn) {
    await mapModeBtn.click();
    await new Promise((r) => setTimeout(r, 2500));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-3d-pointcloud.png') });
  }

  // 4. Quick Goal Modal
  console.log('Capturing 04-quick-goal-modal.png...');
  const quickGoalBtn = await page.$('.quick-goal-btn');
  if (quickGoalBtn) {
    await quickGoalBtn.click();
    await new Promise((r) => setTimeout(r, 800));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04-quick-goal-modal.png') });
    const closeBtn = await page.$('.modal-close-btn');
    if (closeBtn) await closeBtn.click();
    await new Promise((r) => setTimeout(r, 500));
  }

  // 5. Telemetry Analytics Drawer
  console.log('Capturing 05-telemetry-drawer.png...');
  const telemetryNavBtn = await page.$('button[title="Telemetry Analytics"]');
  if (telemetryNavBtn) {
    await telemetryNavBtn.click();
    await new Promise((r) => setTimeout(r, 800));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05-telemetry-drawer.png') });
    const closeBtn = await page.$('.modal-close-btn');
    if (closeBtn) await closeBtn.click();
    await new Promise((r) => setTimeout(r, 500));
  }

  // 6. ROS Bridge Modal
  console.log('Capturing 06-ros-bridge-modal.png...');
  const rosNavBtn = await page.$('.ros-button');
  if (rosNavBtn) {
    await rosNavBtn.click();
    await new Promise((r) => setTimeout(r, 800));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06-ros-bridge-modal.png') });
    const closeBtn = await page.$('.modal-close-btn');
    if (closeBtn) await closeBtn.click();
    await new Promise((r) => setTimeout(r, 500));
  }

  // 7. Mobile Viewport (iPhone 14 / Pixel 7 size)
  console.log('Capturing 07-responsive-mobile.png...');
  await page.setViewport({ width: 390, height: 844 });
  await page.goto(`http://127.0.0.1:${PORT}`, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07-responsive-mobile.png') });

  console.log('All screenshots captured successfully!');
  await browser.close();
  server.close();
  process.exit(0);
});
