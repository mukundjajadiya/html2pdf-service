import express from 'express';
import crypto from 'crypto';
import { htmlToPdf, urlToPdf } from './service.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const tempDir = path.join(__dirname, 'temp');

// Ensure temp directory exists
await fs.mkdir(tempDir, { recursive: true });

app.use(express.json({ limit: '10mb' }));

app.post('/pdf', async (req, res) => {
  const t0 = performance.now();
  const startCpu = process.cpuUsage();
  const startMem = process.memoryUsage();

  try {
    const { url } = req.body;

    // Generate filename and path upfront
    const filename = `${crypto.randomUUID()}.pdf`;
    const filePath = path.join(tempDir, filename);

    if (url) {
      await urlToPdf(url, filePath);
    } else {
      const htmlPath = path.join(__dirname, 'invoice.html');
      const html = await fs.readFile(htmlPath, 'utf-8');
      await htmlToPdf(html, filePath);
    }

    const downloadUrl = `${req.protocol}://${req.get('host')}/download/${filename}`;

    res.json({ url: downloadUrl });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'PDF generation failed' });
  } finally {
    // Metrics Calculation
    const t1 = performance.now();
    const cpuUsage = process.cpuUsage(startCpu);
    const endMem = process.memoryUsage();

    console.log('--- Request Performance Metrics ---');
    console.log(`Execution Time: ${(t1 - t0).toFixed(2)}ms`);
    console.log(`CPU Usage: User ${(cpuUsage.user / 1000).toFixed(2)}ms, System ${(cpuUsage.system / 1000).toFixed(2)}ms`);
    console.log(`Memory RSS Delta: ${((endMem.rss - startMem.rss) / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Heap Used Delta: ${((endMem.heapUsed - startMem.heapUsed) / 1024 / 1024).toFixed(2)} MB`);
    console.log('-----------------------------------');
  }
});

app.get('/download/:filename', (req, res) => {
  const filePath = path.join(tempDir, req.params.filename);
  const downloadName = req.params.filename;

  res.download(filePath, downloadName, async (err) => {
    if (err) {
      if (!res.headersSent) {
        res.status(404).json({ error: 'File not found or expired' });
      }
    } else {
      try {
        await fs.unlink(filePath);
      } catch (e) {
        console.error('Error deleting temp file:', e);
      }
    }
  });
});

app.listen(3000, () => {
  console.log('PDF service running on port 3000');
});
