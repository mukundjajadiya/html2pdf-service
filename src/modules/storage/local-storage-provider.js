import fs from 'fs/promises';
import path from 'path';
import { StorageProvider } from './storage-provider.js';
import { Logger } from '../../shared/utils/logger.js';

/**
 * Local Disk Storage Provider
 * Stores files on the local filesystem
 */
export class LocalStorageProvider extends StorageProvider {
    constructor(baseDir) {
        super();
        this.baseDir = baseDir;
    }

    async init() {
        // Ensure base directory exists
        await fs.mkdir(this.baseDir, { recursive: true });
        Logger.info('Local storage initialized', { baseDir: this.baseDir });
    }

    async save(content, filename, options = {}) {
        try {
            const filePath = path.join(this.baseDir, filename);

            // Ensure directory exists
            await fs.mkdir(path.dirname(filePath), { recursive: true });

            // Write file
            if (Buffer.isBuffer(content)) {
                await fs.writeFile(filePath, content);
            } else if (typeof content === 'string') {
                await fs.writeFile(filePath, content, 'utf-8');
            } else {
                throw new Error('Content must be Buffer or string');
            }

            const stats = await fs.stat(filePath);

            Logger.debug('File saved to local storage', {
                filename,
                size: stats.size,
                path: filePath
            });

            return {
                path: filePath,
                filename,
                size: stats.size,
                provider: 'local',
                metadata: {
                    createdAt: stats.birthtime,
                    ...options.metadata
                }
            };
        } catch (error) {
            Logger.error('Failed to save file to local storage', error);
            throw error;
        }
    }

    async get(filename) {
        try {
            const filePath = path.join(this.baseDir, filename);
            const content = await fs.readFile(filePath);

            Logger.debug('File retrieved from local storage', { filename });
            return content;
        } catch (error) {
            Logger.error('Failed to retrieve file from local storage', error);
            throw error;
        }
    }

    async delete(filename) {
        try {
            const filePath = path.join(this.baseDir, filename);
            await fs.unlink(filePath);

            Logger.debug('File deleted from local storage', { filename });
            return true;
        } catch (error) {
            if (error.code === 'ENOENT') {
                Logger.warn('File not found for deletion', { filename });
                return false;
            }
            Logger.error('Failed to delete file from local storage', error);
            throw error;
        }
    }

    async exists(filename) {
        try {
            const filePath = path.join(this.baseDir, filename);
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }

    async getMetadata(filename) {
        try {
            const filePath = path.join(this.baseDir, filename);
            const stats = await fs.stat(filePath);

            return {
                filename,
                size: stats.size,
                createdAt: stats.birthtime,
                modifiedAt: stats.mtime,
                path: filePath
            };
        } catch (error) {
            Logger.error('Failed to get file metadata', error);
            throw error;
        }
    }

    getUrl(filename) {
        // For local storage, return the file path
        // In production with a web server, this could be a download URL
        return path.join(this.baseDir, filename);
    }

    getPath(filename) {
        return path.join(this.baseDir, filename);
    }
}
