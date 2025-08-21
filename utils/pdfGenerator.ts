import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Invoice } from '../types';
import { generateInvoiceHTML } from './pdfTemplate';

export interface PDFGenerationOptions {
  includeQRCode?: boolean;
  qrCodeSize?: number;
  filename?: string;
}

export interface PDFResult {
  success: boolean;
  uri?: string;
  error?: string;
}

// Generate QR code as SVG data URI
export const generateQRCodeDataURI = (paymentUrl: string, size: number = 150): string => {
  // This is a placeholder - in a real implementation, you'd use react-native-qrcode-svg
  // For now, we'll return a placeholder SVG
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="white" stroke="black" stroke-width="2"/>
      <text x="${size/2}" y="${size/2}" text-anchor="middle" dy=".3em" font-family="Arial" font-size="12" fill="black">
        QR Code
      </text>
      <text x="${size/2}" y="${size/2 + 20}" text-anchor="middle" dy=".3em" font-family="Arial" font-size="10" fill="gray">
        ${paymentUrl.substring(0, 20)}...
      </text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

// Generate PDF from invoice data
export const generateInvoicePDF = async (
  invoice: Invoice,
  options: PDFGenerationOptions = {}
): Promise<PDFResult> => {
  try {
    let qrCodeDataUri: string | undefined;
    
    if (options.includeQRCode && invoice.paymentUrl) {
      qrCodeDataUri = generateQRCodeDataURI(invoice.paymentUrl, options.qrCodeSize);
    }

    const htmlContent = generateInvoiceHTML(invoice, qrCodeDataUri);
    
    const { uri } = await Print.printToFileAsync({
      html: htmlContent,
      base64: false,
    });

    // Optionally rename the file
    if (options.filename) {
      const newUri = `${FileSystem.documentDirectory}${options.filename}`;
      await FileSystem.moveAsync({
        from: uri,
        to: newUri,
      });
      return { success: true, uri: newUri };
    }

    return { success: true, uri };
  } catch (error) {
    console.error('Error generating PDF:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};

// Share PDF file
export const sharePDF = async (uri: string, filename?: string): Promise<boolean> => {
  try {
    const isAvailable = await Sharing.isAvailableAsync();
    
    if (!isAvailable) {
      console.warn('Sharing is not available on this platform');
      return false;
    }

    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Share Invoice PDF',
      UTI: 'com.adobe.pdf',
    });

    return true;
  } catch (error) {
    console.error('Error sharing PDF:', error);
    return false;
  }
};

// Print PDF directly
export const printPDF = async (invoice: Invoice): Promise<boolean> => {
  try {
    const htmlContent = generateInvoiceHTML(invoice);
    
    await Print.printAsync({
      html: htmlContent,
    });

    return true;
  } catch (error) {
    console.error('Error printing PDF:', error);
    return false;
  }
};

// Save PDF to device
export const savePDFToDevice = async (
  invoice: Invoice,
  filename?: string
): Promise<PDFResult> => {
  try {
    const pdfFilename = filename || `invoice-${invoice.invoiceNumber}.pdf`;
    
    const result = await generateInvoicePDF(invoice, {
      includeQRCode: true,
      filename: pdfFilename,
    });

    if (result.success && result.uri) {
      // Check if file was saved successfully
      const fileInfo = await FileSystem.getInfoAsync(result.uri);
      
      if (fileInfo.exists) {
        return { success: true, uri: result.uri };
      } else {
        return { success: false, error: 'File was not saved properly' };
      }
    }

    return result;
  } catch (error) {
    console.error('Error saving PDF:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};

// Generate and immediately share PDF
export const generateAndSharePDF = async (
  invoice: Invoice,
  options: PDFGenerationOptions = {}
): Promise<boolean> => {
  try {
    const result = await generateInvoicePDF(invoice, {
      ...options,
      includeQRCode: true,
    });

    if (result.success && result.uri) {
      return await sharePDF(result.uri, options.filename);
    }

    return false;
  } catch (error) {
    console.error('Error generating and sharing PDF:', error);
    return false;
  }
};

// Get PDF file size in bytes
export const getPDFFileSize = async (uri: string): Promise<number | null> => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    return fileInfo.exists && 'size' in fileInfo ? fileInfo.size : null;
  } catch (error) {
    console.error('Error getting file size:', error);
    return null;
  }
};

// Delete PDF file
export const deletePDF = async (uri: string): Promise<boolean> => {
  try {
    await FileSystem.deleteAsync(uri, { idempotent: true });
    return true;
  } catch (error) {
    console.error('Error deleting PDF:', error);
    return false;
  }
};

// Utility to format filename
export const formatPDFFilename = (invoice: Invoice): string => {
  const date = new Date(invoice.createdAt).toISOString().split('T')[0];
  const clientName = invoice.toName.replace(/[^a-zA-Z0-9]/g, '-');
  return `invoice-${invoice.invoiceNumber}-${clientName}-${date}.pdf`;
};
