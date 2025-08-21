import { Invoice, LineItem, InvoiceCalculation } from '../types';

export const calculateInvoiceTotals = (
  lineItems: LineItem[],
  taxPercentage: number = 0,
  discountAmount: number = 0
): InvoiceCalculation => {
  const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const taxAmount = (subtotal * taxPercentage) / 100;
  const total = subtotal + taxAmount - discountAmount;

  return {
    subtotal,
    taxAmount,
    discountAmount,
    total: Math.max(0, total) // Ensure total is not negative
  };
};

export const generateInvoiceNumber = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `INV-${year}${month}${day}-${random}`;
};

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const createLineItem = (
  description: string,
  quantity: number,
  unitPrice: number
): LineItem => {
  return {
    id: Math.random().toString(36).substr(2, 9),
    description,
    quantity,
    unitPrice,
    total: quantity * unitPrice
  };
};

export const updateLineItemTotal = (item: LineItem): LineItem => {
  return {
    ...item,
    total: item.quantity * item.unitPrice
  };
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const addDaysToDate = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};
