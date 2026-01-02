import express from 'express';
import { PdfController } from '../controllers/pdf-controller.js';

const router = express.Router();

router.post('/', PdfController.createPdf);
router.get('/download/:filename', PdfController.downloadPdf);

export const pdfRoutes = router;
