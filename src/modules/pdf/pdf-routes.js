import express from 'express';
import { PdfController } from './pdf-controller.js';
import { upload } from '../../shared/middlewares/upload.js';

const router = express.Router();

// POST route with optional file upload support
router.post('/', upload.single('htmlFile'), PdfController.createPdf);
router.get('/download/:filename', PdfController.downloadPdf);

export const pdfRoutes = router;
