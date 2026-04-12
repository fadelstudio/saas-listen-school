import { supabase } from '../../core/database/supabase';
import { v4 as uuidv4 } from 'uuid';
import { BadRequestException, InternalServerException } from '../../core/errors/HttpException';

export const uploadsService = {
  async uploadFile(file: Express.Multer.File, folder: string = 'general') {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const fileExt = file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error } = await supabase.storage
      .from('afi-listen')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      console.error('❌ Supabase Upload Error:', error);
      throw new InternalServerException(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('afi-listen')
      .getPublicUrl(filePath);

    return {
      url: publicUrl,
      path: filePath,
      fileName,
      mimetype: file.mimetype,
      size: file.size,
    };
  }
};
