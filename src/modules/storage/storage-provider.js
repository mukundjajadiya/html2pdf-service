/**
 * Abstract Storage Provider Interface
 * All storage providers must implement these methods
 */
export class StorageProvider {
    /**
     * Save a file to storage
     * @param {Buffer|string} content - File content
     * @param {string} filename - Desired filename
     * @param {Object} options - Additional options (contentType, metadata, etc.)
     * @returns {Promise<Object>} - { path, url, metadata }
     */
    async save(content, filename, options = {}) {
        throw new Error('save() must be implemented by storage provider');
    }

    /**
     * Retrieve a file from storage
     * @param {string} filename - File identifier
     * @returns {Promise<Buffer>} - File content
     */
    async get(filename) {
        throw new Error('get() must be implemented by storage provider');
    }

    /**
     * Delete a file from storage
     * @param {string} filename - File identifier
     * @returns {Promise<boolean>} - Success status
     */
    async delete(filename) {
        throw new Error('delete() must be implemented by storage provider');
    }

    /**
     * Check if file exists
     * @param {string} filename - File identifier
     * @returns {Promise<boolean>} - Exists status
     */
    async exists(filename) {
        throw new Error('exists() must be implemented by storage provider');
    }

    /**
     * Get file metadata
     * @param {string} filename - File identifier
     * @returns {Promise<Object>} - File metadata
     */
    async getMetadata(filename) {
        throw new Error('getMetadata() must be implemented by storage provider');
    }

    /**
     * Get public URL for file (if applicable)
     * @param {string} filename - File identifier
     * @returns {string} - Public URL or local path
     */
    getUrl(filename) {
        throw new Error('getUrl() must be implemented by storage provider');
    }
}
