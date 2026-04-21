"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadsService = void 0;
const supabase_1 = require("../../core/database/supabase");
const uuid_1 = require("uuid");
const HttpException_1 = require("../../core/errors/HttpException");
const env_1 = require("../../core/config/env");
exports.uploadsService = {
    async uploadFile(file, folder = 'general') {
        if (!file) {
            throw new HttpException_1.BadRequestException('No file uploaded');
        }
        const fileExt = file.originalname.split('.').pop();
        const fileName = `${(0, uuid_1.v4)()}.${fileExt}`;
        const filePath = `${folder}/${fileName}`;
        const { error } = await supabase_1.supabase.storage
            .from('attachments')
            .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            upsert: false,
        });
        if (error) {
            console.error('❌ Supabase Upload Error:', error);
            throw new HttpException_1.InternalServerException(`Upload failed: ${error.message}`);
        }
        const { data, error: signedErr } = await supabase_1.supabase.storage
            .from('attachments')
            .createSignedUrl(filePath, env_1.env.SIGNED_URL_EXPIRES_IN);
        if (signedErr || !data?.signedUrl) {
            console.error('❌ Supabase Signed URL Error:', signedErr);
            throw new HttpException_1.InternalServerException(`Could not create signed URL: ${signedErr?.message ?? 'unknown error'}`);
        }
        return {
            url: data.signedUrl,
            path: filePath,
            fileName,
            mimetype: file.mimetype,
            size: file.size,
        };
    },
    /** URL signée pour affichage (durée `SIGNED_URL_EXPIRES_IN`). */
    async getSignedUrlForPath(path) {
        if (!path?.trim())
            return null;
        const { data, error } = await supabase_1.supabase.storage
            .from('attachments')
            .createSignedUrl(path, env_1.env.SIGNED_URL_EXPIRES_IN);
        if (error || !data?.signedUrl)
            return null;
        return data.signedUrl;
    },
    async removeObjectAtPath(path) {
        const { error } = await supabase_1.supabase.storage.from('attachments').remove([path]);
        if (error) {
            console.error('Supabase storage remove:', error.message);
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