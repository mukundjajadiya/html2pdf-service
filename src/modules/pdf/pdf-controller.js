import { PdfService } from './pdf-service.js';
import { StorageService } from '../storage/storage-service.js';
import { AppError } from '../../shared/utils/app-error.js';
import { Logger } from '../../shared/utils/logger.js';

const pdfService = new PdfService();
const storageService = StorageService.getInstance();

export class PdfController {

    static async createPdf(req, res, next) {
        const t0 = performance.now();
        const startCpu = process.cpuUsage();

        try {
            const url = req.body?.url;
            const html = req.body?.html;
            const htmlFile = req.file; // Multer file upload

            // Generate unique filename for the PDF
            const pdfFilename = storageService.generateFilename('.pdf', 'pdf');
            const pdfFilePath = await storageService.getFilePath(pdfFilename);

            // Determine the source and generate PDF accordingly
            if (url) {
                // Method 1: Generate from URL
                Logger.debug('Generating PDF from URL', { url });
                await pdfService.generateFromUrl(url, pdfFilePath);
            } else if (htmlFile) {
                // Method 2: Generate from uploaded HTML file
                Logger.debug('Generating PDF from uploaded HTML file', {
                    filename: htmlFile.originalname,
                    size: htmlFile.size
                });

                const htmlContent = htmlFile.buffer.toString('utf-8');
                await pdfService.generateFromHtml(htmlContent, pdfFilePath);
            } else if (html) {
                // Method 3: Generate from raw HTML string
                Logger.debug('Generating PDF from raw HTML content', {
                    contentLength: html.length
                });
                await pdfService.generateFromHtml(html, pdfFilePath);
            } else {
                // No valid input provided
                throw new AppError(
                    'Please provide one of the following: url, html (raw content), or upload an HTML file',
                    400
                );
            }

            const downloadUrl = `${req.protocol}://${req.get('host')}/api/v1/pdf/download/${pdfFilename}`;

            // Metrics
            const t1 = performance.now();
            const cpuUsage = process.cpuUsage(startCpu);

            Logger.info('PDF Request processed', {
                executionTimeMs: (t1 - t0).toFixed(2),
                cpuUser: (cpuUsage.user / 1000).toFixed(2),
                filename: pdfFilename,
                source: url ? 'url' : htmlFile ? 'file' : 'html'
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

            // Check if file exists using storage service
            const exists = await storageService.fileExists(filename);
            if (!exists) {
                throw new AppError('File not found or expired', 404);
            }

            // Get file path from storage service
            const filePath = await storageService.getFilePath(filename);

            res.download(filePath, filename, async (err) => {
                if (err) {
                    if (!res.headersSent) {
                        next(new AppError('Error downloading file', 500));
                    }
                } else {
                    // Delete after download using storage service
                    try {
                        await storageService.deleteFile(filename);
                        Logger.info('File deleted after download', { filename });
                    } catch (e) {
                        Logger.error('Error deleting file after download', e);
                    }
                }
            });

        } catch (error) {
            next(error);
        }
    }
}
