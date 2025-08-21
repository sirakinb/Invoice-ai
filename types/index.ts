export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  fromName: string;
  fromEmail: string;
  toName: string;
  toEmail: string;
  lineItems: LineItem[];
  currency: string;
  taxPercentage: number;
  discountAmount: number;
  subtotal: number;
  taxAmount: number;
  total: number;
  dueDate: string;
  notes?: string;
  paymentUrl?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export interface ParseInvoiceResponse {
  success: boolean;
  invoice?: Partial<Invoice>;
  message: string;
}

export interface CreatePaymentResponse {
  success: boolean;
  paymentUrl?: string;
  error?: string;
}

export interface InvoiceCalculation {
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
}
