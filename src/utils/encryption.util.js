/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const crypto = require('crypto');

// In production, this must be a 64-character hex string stored in .env (e.g., AI_ENCRYPTION_KEY)
const ENCRYPTION_KEY = process.env.AI_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const IV_LENGTH = 16;

class EncryptionUtil {
    static encrypt(text) {
        if (!text) return text;
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const authTag = cipher.getAuthTag().toString('hex');
        
        // Format: iv:encryptedData:authTag
        return `${iv.toString('hex')}:${encrypted}:${authTag}`;
    }

    static decrypt(text) {
        if (!text) return text;
        try {
            const parts = text.split(':');
            if (parts.length !== 3) return text; // Fallback if not encrypted properly

            const iv = Buffer.from(parts[0], 'hex');
            const encryptedText = parts[1];
            const authTag = Buffer.from(parts[2], 'hex');

            const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
            decipher.setAuthTag(authTag);
            let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            return decrypted;
        } catch (error) {
            console.error('Decryption failed for AI credentials');
            return null;
        }
    }

    // Masks API Key for Admin Panel (e.g., "sk-abcd...1234")
    static maskCredential(text) {
        if (!text || text.length < 8) return '********';
        return text.substring(0, 4) + '*'.repeat(text.length - 8) + text.substring(text.length - 4);
    }
}

module.exports = EncryptionUtil;