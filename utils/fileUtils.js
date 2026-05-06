import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, '..', 'uploads', 'violations');

/**
 * Saves a base64 image to the server
 * @param {string} base64Data - The base64 string (data:image/png;base64,...)
 * @returns {string|null} - The relative path to the saved image or null
 */
export const saveBase64Image = (base64Data) => {
  if (!base64Data || !base64Data.startsWith('data:image')) {
    return null;
  }

  try {
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Extract file extension and base64 content
    const matches = base64Data.match(/^data:image\/([A-Za-z-+/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return null;
    }

    const extension = matches[1];
    const data = matches[2];
    const buffer = Buffer.from(data, 'base64');
    
    const fileName = `v-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${extension}`;
    const filePath = path.join(uploadDir, fileName);

    fs.writeFileSync(filePath, buffer);

    // Return the public URL path
    return `/uploads/violations/${fileName}`;
  } catch (error) {
    console.error('Error saving base64 image:', error);
    return null;
  }
};
