import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Configuração do SDK com as credenciais do .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configuração do armazenamento do Multer direcionado para o Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'wa_images',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp']
  },
});

// Deletar imagem do cloudinary
export const deleteImage = async (publicId) => {
  try {
    if (!publicId) return null;
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.log('Erro ao deletar imagem do Cloudinary:', error);
    throw error;
  }
};

// Middleware do Multer
const upload = multer({ storage: storage });

export { upload, cloudinary };
