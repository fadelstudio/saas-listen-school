/// <reference types="multer" />
import { supabase } from '../../core/database/supabase';
import { v4 as uuidv4 } from 'uuid';
import { BadRequestException, InternalServerException } from '../../core/errors/HttpException';
import { env } from '../../core/config/env';

export const uploadsService = {
  async uploadFile(file: Express.Multer.File, folder: string = 'general', bucket?: string) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const primaryBucket = bucket || env.SUPABASE_BUCKET || 'attachments';
    const fallbackBuckets = ['schools', 'logos', 'public', 'general', 'files'];
    
    // Add primary bucket to the start if it's not already in fallbacks
    const bucketsToTry = Array.from(new Set([primaryBucket, ...fallbackBuckets]));

    const fileExt = file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    let lastError;
    let uploadSuccess = false;
    let actualBucket = primaryBucket;

    for (const b of bucketsToTry) {
      try {
        const { error } = await supabase.storage
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
      } catch (e) {
        lastError = e;
      }
    }

    if (!uploadSuccess) {
      console.error('❌ Supabase Upload Error (All buckets failed):', lastError);
      const errorMsg = (lastError as any)?.message || 'Bucket not found or permission denied';
      throw new InternalServerException(`Upload failed: ${errorMsg}`);
    }

    const { data, error: signedErr } = await supabase.storage
      .from(actualBucket)
      .createSignedUrl(filePath, env.SIGNED_URL_EXPIRES_IN);

    if (signedErr || !data?.signedUrl) {
      console.error('❌ Supabase Signed URL Error:', signedErr);
      const msg = (signedErr as any)?.message ?? 'unknown error';
      throw new InternalServerException(`Could not create signed URL: ${msg}`);
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
  async getSignedUrlForPath(path: string | null | undefined): Promise<string | null> {
    if (!path?.trim()) return null;

    const buckets = [env.SUPABASE_BUCKET || 'attachments', 'schools', 'logos', 'public', 'general'];
    
    for (const bucket of buckets) {
      try {
        const { data, error } = await supabase.storage
          .from(bucket)
          .createSignedUrl(path, env.SIGNED_URL_EXPIRES_IN);
          
        if (!error && data?.signedUrl) return data.signedUrl;
      } catch (e) {
        // Skip to next bucket
      }
    }
    return null;
  },

  async removeObjectAtPath(path: string): Promise<void> {
    const buckets = [env.SUPABASE_BUCKET || 'attachments', 'schools', 'logos', 'public', 'general'];
    for (const bucket of buckets) {
      await supabase.storage.from(bucket).remove([path]).catch(() => {});
    }
  },

  /** Upload image profil (types restreints) — même bucket que `uploadFile`. */
  async uploadProfileImage(file: Express.Multer.File, folder: string) {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.mimetype)) {
      throw new BadRequestException('Only JPEG, PNG or WebP images are allowed');
    }
    return this.uploadFile(file, folder);
  },
};
