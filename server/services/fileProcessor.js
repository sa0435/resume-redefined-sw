import fs from "fs/promises";
import path from "path";
import mammoth from "mammoth";

export async function extractTextFromFile(filePath, originalName) {
  const ext = path.extname(originalName).toLowerCase();
  
  try {
    const buffer = await fs.readFile(filePath);
    
    switch (ext) {
      case '.pdf':
        // Dynamic import to avoid the initialization issue
        const pdfParse = (await import('pdf-parse')).default;
        const pdfData = await pdfParse(buffer);
        return pdfData.text;
        
      case '.doc':
      case '.docx':
        const result = await mammoth.extractRawText({ buffer });
        return result.value;
        
      case '.txt':
        return buffer.toString('utf-8');
        
      default:
        throw new Error(`Unsupported file type: ${ext}`);
    }
  } catch (error) {
    throw new Error(`Failed to process file: ${error.message}`);
  } finally {
    // Clean up uploaded file
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.warn(`Failed to clean up file ${filePath}:`, error);
    }
  }
}