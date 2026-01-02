import path from 'path';
import crypto from 'crypto';
import fs from 'fs/promises';
import { PdfService } from './pdf-service.js';
import { config } from '../../shared/config/config.js';
import { AppError } from '../../shared/utils/app-error.js';
import { Logger } from '../../shared/utils/logger.js';

const pdfService = new PdfService();

export class PdfController {

    static async createPdf(req, res, next) {
        const t0 = performance.now();
        const startCpu = process.cpuUsage();

        try {
            const { url } = req.body;
            const filename = `${crypto.randomUUID()}.pdf`;
            const filePath = path.join(config.tempDir, filename);

            // Ensure temp dir exists (move to startup ideally, but safe here)
            await fs.mkdir(config.tempDir, { recursive: true });

            if (url) {
                await pdfService.generateFromUrl(url, filePath);
            } else {
                // Fallback to invoice.html logic if no URL provided (from original code)
                // ideally request should contain HTML. 
                // For backwards compatibility/demo, I'll assume req.body.html or read the file.
                // The original code read 'invoice.html'.

                let htmlContent = req.body.html;
                if (!htmlContent) {
                    // Logic from original MVP: read local invoice.html
                    // In a real API, html should be passed in body.
                    // I will support both: body.html or fallback to template
                    const templatePath = path.join(path.dirname(config.tempDir), 'invoice.html');
                    try {
                        htmlContent = await fs.readFile(templatePath, 'utf-8');
                    } catch (err) {
                        throw new AppError('HTML content is required and default template was not found.', 400);
                    }
                }
                await pdfService.generateFromHtml(htmlContent, filePath);
            }

            const downloadUrl = `${req.protocol}://${req.get('host')}/api/v1/pdf/download/${filename}`;

            // Metrics
            const t1 = performance.now();
            const cpuUsage = process.cpuUsage(startCpu);

            Logger.info('PDF Request processed', {
                executionTimeMs: (t1 - t0).toFixed(2),
                cpuUser: (cpuUsage.user / 1000).toFixed(2),
                filename
            });

            res.status(201).json({
                status: 'success',
                data: { url: downloadUrl }
            });

        } catch (error) {
            next(error);
        }
    }

    static async downloadPdf(req, res, next) {
        try {
            const { filename } = req.params;
            // Basic security check to prevent directory traversal
            if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
                throw new AppError('Invalid filename', 400);
            }

            const filePath = path.join(config.tempDir, filename);

            // check if file exists
            try {
                await fs.access(filePath);
            } catch {
                throw new AppError('File not found or expired', 404);
            }

            res.download(filePath, filename, async (err) => {
                if (err) {
                    if (!res.headersSent) {
                        next(new AppError('Error downloading file', 500));
                    }
                } else {
                    // Delete after download
                    try {
                        await fs.unlink(filePath);
                        Logger.info('Temp file deleted', { filename });
                    } catch (e) {
                        Logger.error('Error deleting temp file', e);
                    }
                }
            });

        } catch (error) {
            next(error);
        }
    }
}
