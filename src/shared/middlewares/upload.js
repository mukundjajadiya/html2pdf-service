import multer from 'multer';
import path from 'path';

// Configure multer for memory storage (we'll process files in memory)
const storage = multer.memoryStorage();

// File filter to accept only HTML files
const fileFilter = (req, file, cb) => {
    const allowedExtensions = ['.html', '.htm'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedExtensions.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Only HTML files are allowed'), false);
    }
};

// Configure multer with limits
export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

import { StorageService } from '../../modules/storage/storage-service.js';

export const saveToStorage = (options = {}) => {
    return async (req, res, next) => {
        if (!req.file) return next();

        try {
            const storageService = StorageService.getInstance();
            const result = await storageService.saveUploadedFile(req.file, {
                category: options.category || 'upload',
                prefix: options.prefix || 'file'
            });

            // Attach the storage result to the request for the controller to use
            req.storedFile = result;
            next();
        } catch (error) {
            next(error);
        }
    };
};
