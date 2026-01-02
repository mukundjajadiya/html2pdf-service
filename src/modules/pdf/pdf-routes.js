import express from 'express';
import { PdfController } from './pdf-controller.js';
import { upload, saveToStorage } from '../../shared/middlewares/upload.js';

const router = express.Router();

// POST route with optional file upload support and automated storage
router.post(
    '/',
    upload.single('htmlFile'),
    saveToStorage({ category: 'html-archive', prefix: 'html' }),
    PdfController.createPdf
);
router.get('/download/:filename', PdfController.downloadPdf);

export const pdfRoutes = router;
