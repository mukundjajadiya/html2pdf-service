import express from 'express';
import { pdfRoutes } from './modules/pdf/pdf-routes.js';
import { errorHandler } from './shared/middlewares/error-handler.js';
import { config } from './shared/config/config.js';

const app = express();

// Global Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
// Mounting at /api/v1/pdf to version the API
app.use('/api/v1/pdf', pdfRoutes);

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// 404 handler
// 404 handler
app.all(/(.*)/, (req, res) => {
    res.status(404).json({
        status: 'fail',
        message: `Can't find ${req.originalUrl} on this server!`
    });
});

// Global Error Handler
app.use(errorHandler);

export default app;
