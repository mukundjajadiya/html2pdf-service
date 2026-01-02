import { Logger } from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    Logger.error(err.message, err);

    // Operational, trusted error: send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    }
    // Programming or other unknown error: don't leak details
    else {
        res.status(500).json({
            status: 'error',
            message: 'Something went very wrong!'
        });
    }
};
