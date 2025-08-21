import { Invoice } from '../types';
import { formatCurrency, formatDate } from './invoice';

export const generateInvoiceHTML = (invoice: Invoice, qrCodeDataUri?: string): string => {
  const lineItemsHTML = invoice.lineItems
    .map(
      (item) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.description}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatCurrency(item.unitPrice, invoice.currency)}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">${formatCurrency(item.total, invoice.currency)}</td>
        </tr>
      `
    )
    .join('');

  const qrCodeSection = qrCodeDataUri
    ? `
        <div style="margin-top: 30px; text-align: center;">
          <h3 style="color: #374151; margin-bottom: 15px;">Scan to Pay</h3>
          <img src="${qrCodeDataUri}" alt="Payment QR Code" style="width: 150px; height: 150px;" />
        </div>
      `
    : '';

  const paymentLinkSection = invoice.paymentUrl
    ? `
        <div style="margin-top: 20px; text-align: center;">
          <a href="${invoice.paymentUrl}" 
             style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
            Pay Now Online
          </a>
        </div>
      `
    : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice ${invoice.invoiceNumber}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #374151;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          border-bottom: 3px solid #3b82f6;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .invoice-title {
          font-size: 36px;
          font-weight: 700;
          color: #1f2937;
          margin: 0;
        }
        .invoice-number {
          font-size: 18px;
          color: #6b7280;
          margin: 5px 0;
        }
        .parties {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
        }
        .party {
          flex: 1;
        }
        .party h3 {
          color: #374151;
          margin-bottom: 10px;
          font-size: 16px;
          font-weight: 600;
        }
        .party-info {
          background-color: #f9fafb;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #3b82f6;
        }
        .invoice-details {
          background-color: #f3f4f6;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .detail-label {
          font-weight: 600;
          color: #374151;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
          background-color: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .items-table th {
          background-color: #f8fafc;
          padding: 15px 12px;
          text-align: left;
          font-weight: 600;
          color: #374151;
          border-bottom: 2px solid #e5e7eb;
        }
        .totals {
          background-color: #f9fafb;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid #10b981;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .total-row.final {
          border-top: 2px solid #e5e7eb;
          padding-top: 12px;
          margin-top: 12px;
          font-weight: 700;
          font-size: 18px;
          color: #1f2937;
        }
        .notes {
          background-color: #fffbeb;
          border-left: 4px solid #f59e0b;
          padding: 15px;
          border-radius: 8px;
          margin-top: 30px;
        }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 class="invoice-title">INVOICE</h1>
        <div class="invoice-number">Invoice #${invoice.invoiceNumber}</div>
        <div style="color: #6b7280;">Date: ${formatDate(new Date(invoice.createdAt))}</div>
      </div>

      <div class="parties">
        <div class="party">
          <h3>From:</h3>
          <div class="party-info">
            <div style="font-weight: 600; margin-bottom: 5px;">${invoice.fromName}</div>
            <div style="color: #6b7280;">${invoice.fromEmail}</div>
          </div>
        </div>
        <div style="width: 30px;"></div>
        <div class="party">
          <h3>To:</h3>
          <div class="party-info">
            <div style="font-weight: 600; margin-bottom: 5px;">${invoice.toName}</div>
            <div style="color: #6b7280;">${invoice.toEmail}</div>
          </div>
        </div>
      </div>

      <div class="invoice-details">
        <div class="detail-row">
          <span class="detail-label">Due Date:</span>
          <span>${formatDate(new Date(invoice.dueDate))}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Currency:</span>
          <span>${invoice.currency}</span>
        </div>
      </div>

      <table class="items-table">
        <thead>
          <tr>
            <th>Description</th>
            <th style="text-align: center;">Quantity</th>
            <th style="text-align: right;">Unit Price</th>
            <th style="text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${lineItemsHTML}
        </tbody>
      </table>

      <div class="totals">
        <div class="total-row">
          <span>Subtotal:</span>
          <span>${formatCurrency(invoice.subtotal, invoice.currency)}</span>
        </div>
        ${invoice.taxAmount > 0 ? `
          <div class="total-row">
            <span>Tax (${invoice.taxPercentage}%):</span>
            <span>${formatCurrency(invoice.taxAmount, invoice.currency)}</span>
          </div>
        ` : ''}
        ${invoice.discountAmount > 0 ? `
          <div class="total-row">
            <span>Discount:</span>
            <span>-${formatCurrency(invoice.discountAmount, invoice.currency)}</span>
          </div>
        ` : ''}
        <div class="total-row final">
          <span>Total:</span>
          <span>${formatCurrency(invoice.total, invoice.currency)}</span>
        </div>
      </div>

      ${invoice.notes ? `
        <div class="notes">
          <h3 style="margin-top: 0; color: #92400e;">Notes:</h3>
          <p style="margin-bottom: 0;">${invoice.notes}</p>
        </div>
      ` : ''}

      ${paymentLinkSection}
      ${qrCodeSection}

      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
        Generated by TapInvoice AI on ${formatDate(new Date())}
      </div>
    </body>
    </html>
  `;
};
