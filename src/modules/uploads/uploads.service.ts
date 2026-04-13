import { supabase } from '../../core/database/supabase';
import { v4 as uuidv4 } from 'uuid';
import { BadRequestException, InternalServerException } from '../../core/errors/HttpException';
import { env } from '../../core/config/env';

export const uploadsService = {
  async uploadFile(file: Express.Multer.File, folder: string = 'general') {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const fileExt = file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error } = await supabase.storage
      .from('attachments')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      console.error('❌ Supabase Upload Error:', error);
      throw new InternalServerException(`Upload failed: ${error.message}`);
    }

    const { data, error: signedErr } = await supabase.storage
      .from('attachments')
      .createSignedUrl(filePath, env.SIGNED_URL_EXPIRES_IN);

    if (signedErr || !data?.signedUrl) {
      console.error('❌ Supabase Signed URL Error:', signedErr);
      throw new InternalServerException(`Could not create signed URL: ${signedErr?.message ?? 'unknown error'}`);
    }

    return {
      url: data.signedUrl,
      path: filePath,
      fileName,
      mimetype: file.mimetype,
      size: file.size,
    };
  }
};
