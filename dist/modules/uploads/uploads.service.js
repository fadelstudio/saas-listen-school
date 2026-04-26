"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadsService = void 0;
/// <reference types="multer" />
const supabase_1 = require("../../core/database/supabase");
const uuid_1 = require("uuid");
const HttpException_1 = require("../../core/errors/HttpException");
const env_1 = require("../../core/config/env");
exports.uploadsService = {
    async uploadFile(file, folder = 'general', bucket) {
        if (!file) {
            throw new HttpException_1.BadRequestException('No file uploaded');
        }
        const primaryBucket = bucket || env_1.env.SUPABASE_BUCKET || 'attachments';
        const fallbackBuckets = ['schools', 'logos', 'public', 'general', 'files'];
        // Add primary bucket to the start if it's not already in fallbacks
        const bucketsToTry = Array.from(new Set([primaryBucket, ...fallbackBuckets]));
        const fileExt = file.originalname.split('.').pop();
        const fileName = `${(0, uuid_1.v4)()}.${fileExt}`;
        const filePath = `${folder}/${fileName}`;
        let lastError;
        let uploadSuccess = false;
        let actualBucket = primaryBucket;
        for (const b of bucketsToTry) {
            try {
                const { error } = await supabase_1.supabase.storage
                    .from(b)
                    .upload(filePath, file.buffer, {
                    contentType: file.mimetype,
                    upsert: false,
                });
                if (!error) {
                    uploadSuccess = true;
                    actualBucket = b;
                    break;
                }
                lastError = error;
            }
            catch (e) {
                lastError = e;
            }
        }
        if (!uploadSuccess) {
            console.error('❌ Supabase Upload Error (All buckets failed):', lastError);
            const errorMsg = lastError?.message || 'Bucket not found or permission denied';
            throw new HttpException_1.InternalServerException(`Upload failed: ${errorMsg}`);
        }
        const { data, error: signedErr } = await supabase_1.supabase.storage
            .from(actualBucket)
            .createSignedUrl(filePath, env_1.env.SIGNED_URL_EXPIRES_IN);
        if (signedErr || !data?.signedUrl) {
            console.error('❌ Supabase Signed URL Error:', signedErr);
            const msg = signedErr?.message ?? 'unknown error';
            throw new HttpException_1.InternalServerException(`Could not create signed URL: ${msg}`);
        }
        return {
            url: data.signedUrl,
            path: filePath,
            fileName,
            mimetype: file.mimetype,
            size: file.size,
            bucket: actualBucket
        };
    },
    /** URL signée pour affichage (durée `SIGNED_URL_EXPIRES_IN`). */
    async getSignedUrlForPath(path) {
        if (!path?.trim())
            return null;
        const buckets = [env_1.env.SUPABASE_BUCKET || 'attachments', 'schools', 'logos', 'public', 'general'];
        for (const bucket of buckets) {
            try {
                const { data, error } = await supabase_1.supabase.storage
                    .from(bucket)
                    .createSignedUrl(path, env_1.env.SIGNED_URL_EXPIRES_IN);
                if (!error && data?.signedUrl)
                    return data.signedUrl;
            }
            catch (e) {
                // Skip to next bucket
            }
        }
        return null;
    },
    async removeObjectAtPath(path) {
        const buckets = [env_1.env.SUPABASE_BUCKET || 'attachments', 'schools', 'logos', 'public', 'general'];
        for (const bucket of buckets) {
            await supabase_1.supabase.storage.from(bucket).remove([path]).catch(() => { });
        }
    },
    /** Upload image profil (types restreints) — même bucket que `uploadFile`. */
    async uploadProfileImage(file, folder) {
        const allowed = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowed.includes(file.mimetype)) {
            throw new HttpException_1.BadRequestException('Only JPEG, PNG or WebP images are allowed');
        }
        return this.uploadFile(file, folder);
    },
};
//# sourceMappingURL=uploads.service.js.map