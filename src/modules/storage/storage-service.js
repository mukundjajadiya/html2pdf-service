import { LocalStorageProvider } from './local-storage-provider.js';
import { S3StorageProvider } from './s3-storage-provider.js';
import { config } from '../../shared/config/config.js';
import { Logger } from '../../shared/utils/logger.js';
import crypto from 'crypto';
import path from 'path';

/**
 * Storage Service - Unified interface for file storage
 * Handles both user uploads and generated files
 * Easily extensible to support multiple storage providers
 */
export class StorageService {
    constructor() {
        this.provider = null;
        this.initialized = false;
    }

    static getInstance() {
        if (!StorageService.instance) {
            StorageService.instance = new StorageService();
        }
        return StorageService.instance;
    }

    async init() {
        if (this.initialized) return;

        // Initialize storage provider based on configuration
        const storageType = config.storage?.type || 'local';

        switch (storageType) {
            case 'local':
                this.provider = new LocalStorageProvider(config.storage.localPath);
                break;
            case 's3':
                this.provider = new S3StorageProvider(config.storage.s3);
                break;
            default:
                throw new Error(`Unknown storage type: ${storageType}`);
        }

        await this.provider.init();
        this.initialized = true;

        Logger.info('Storage service initialized', {
            provider: storageType
        });
    }

    /**
     * Generate a unique filename
     * @param {string} extension - File extension (e.g., '.pdf', '.html')
     * @param {string} prefix - Optional prefix
     * @returns {string} - Unique filename
     */
    generateFilename(extension, prefix = '') {
        const uuid = crypto.randomUUID();
        const ext = extension.startsWith('.') ? extension : `.${extension}`;
        return prefix ? `${prefix}-${uuid}${ext}` : `${uuid}${ext}`;
    }

    /**
     * Save a file (works with Buffer, string, or file path)
     * @param {Buffer|string} content - File content or path
     * @param {Object} options - { filename, contentType, metadata, category }
     * @returns {Promise<Object>} - File info
     */
    async saveFile(content, options = {}) {
        await this.init();

        const filename = options.filename || this.generateFilename(
            options.extension || '.pdf',
            options.prefix
        );

        const result = await this.provider.save(content, filename, {
            contentType: options.contentType,
            metadata: {
                category: options.category || 'general',
                uploadedAt: new Date().toISOString(),
                ...options.metadata
            }
        });

        Logger.info('File saved', {
            filename: result.filename,
            size: result.size,
            category: options.category
        });

        return result;
    }

    /**
     * Save uploaded file from Multer
     * @param {Object} multerFile - Multer file object
     * @param {Object} options - Additional options
     * @returns {Promise<Object>} - File info
     */
    async saveUploadedFile(multerFile, options = {}) {
        await this.init();

        const ext = path.extname(multerFile.originalname);
        const filename = options.filename || this.generateFilename(ext, options.prefix);

        const result = await this.provider.save(multerFile.buffer, filename, {
            contentType: multerFile.mimetype,
            metadata: {
                originalName: multerFile.originalname,
                category: options.category || 'upload',
                uploadedAt: new Date().toISOString(),
                ...options.metadata
            }
        });

        Logger.info('Uploaded file saved', {
            filename: result.filename,
            originalName: multerFile.originalname,
            size: result.size
        });

        return result;
    }

    /**
     * Get file content
     * @param {string} filename - File identifier
     * @returns {Promise<Buffer>} - File content
     */
    async getFile(filename) {
        await this.init();
        return await this.provider.get(filename);
    }

    /**
     * Delete a file
     * @param {string} filename - File identifier
     * @returns {Promise<boolean>} - Success status
     */
    async deleteFile(filename) {
        await this.init();
        const result = await this.provider.delete(filename);

        if (result) {
            Logger.info('File deleted', { filename });
        }

        return result;
    }

    /**
     * Check if file exists
     * @param {string} filename - File identifier
     * @returns {Promise<boolean>} - Exists status
     */
    async fileExists(filename) {
        await this.init();
        return await this.provider.exists(filename);
    }

    /**
     * Get file metadata
     * @param {string} filename - File identifier
     * @returns {Promise<Object>} - File metadata
     */
    async getFileMetadata(filename) {
        await this.init();
        return await this.provider.getMetadata(filename);
    }

    /**
     * Get file URL or path
     * @param {string} filename - File identifier
     * @returns {Promise<string>} - URL or path
     */
    async getFileUrl(filename) {
        await this.init();
        return this.provider.getUrl(filename);
    }

    /**
     * Get file path (for local storage)
     * @param {string} filename - File identifier
     * @returns {Promise<string>} - File path
     */
    async getFilePath(filename) {
        await this.init();
        if (this.provider.getPath) {
            return this.provider.getPath(filename);
        }
        return this.provider.getUrl(filename);
    }
}
