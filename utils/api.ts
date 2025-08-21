import { ParseInvoiceResponse, CreatePaymentResponse, Invoice } from '../types';

const API_BASE_URL = 'https://invoice-ai-lemon.vercel.app'; // Your live Vercel API

export const parseInvoiceFromText = async (text: string): Promise<ParseInvoiceResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/parse-invoice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ transcript: text }), // Match the API expectation
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const invoiceData = await response.json();
    
    // Transform the API response to match our app's expected format
    const invoice = {
      fromName: invoiceData.from.name,
      fromEmail: invoiceData.from.email || 'billing@yourcompany.com',
      toName: invoiceData.to.name,
      toEmail: invoiceData.to.email || 'client@example.com',
      lineItems: invoiceData.items.map((item: any, index: number) => ({
        id: (index + 1).toString(),
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.quantity * item.unitPrice,
      })),
      currency: invoiceData.currency,
      taxPercentage: invoiceData.taxPercent || 0,
      discountAmount: invoiceData.discount || 0,
      subtotal: invoiceData.items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0),
      taxAmount: 0, // Will be calculated
      total: 0, // Will be calculated
      dueDate: invoiceData.dueDate,
      notes: invoiceData.notes || 'Payment due within 14 days',
    };
    
    // Calculate totals
    invoice.taxAmount = (invoice.subtotal - invoice.discountAmount) * (invoice.taxPercentage / 100);
    invoice.total = invoice.subtotal - invoice.discountAmount + invoice.taxAmount;

    return {
      success: true,
      invoice,
      message: `Got it! I've created an invoice for ${invoice.toName} with ${invoice.lineItems.length} item(s).`,
    };
  } catch (error) {
    console.error('Error parsing invoice:', error);
    return {
      success: false,
      message: 'Failed to parse invoice. Please try again.',
    };
  }
};

export const createStripePayment = async (
  amount: number,
  currency: string,
  description: string,
  metadata?: Record<string, string>
): Promise<CreatePaymentResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/create-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount, // API handles conversion to cents
        currency: currency.toLowerCase(),
        description,
        metadata,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      paymentUrl: data.url,
    };
  } catch (error) {
    console.error('Error creating payment:', error);
    return {
      success: false,
      error: 'Failed to create payment link. Please try again.',
    };
  }
};

// Mock API functions for development/testing
export const mockParseInvoice = (text: string): ParseInvoiceResponse => {
  // Simple mock parsing logic
  const invoice = {
    fromName: 'Your Company',
    fromEmail: 'billing@yourcompany.com',
    toName: 'Client Name',
    toEmail: 'client@example.com',
    lineItems: [
      {
        id: '1',
        description: 'Service provided',
        quantity: 1,
        unitPrice: 100,
        total: 100,
      },
    ],
    currency: 'USD',
    taxPercentage: 8.25,
    discountAmount: 0,
    subtotal: 100,
    taxAmount: 8.25,
    total: 108.25,
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
    notes: 'Payment due within 10 days',
  };

  return {
    success: true,
    invoice,
    message: `Got it! I've created an invoice for ${invoice.toName} for ${invoice.lineItems[0].description} at $${invoice.lineItems[0].unitPrice}.`,
  };
};

export const mockCreatePayment = (): CreatePaymentResponse => {
  return {
    success: true,
    paymentUrl: 'https://checkout.stripe.com/pay/mock-payment-link',
  };
};
