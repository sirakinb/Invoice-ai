import { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface Invoice {
  from: { name: string; email?: string };
  to: { name: string; email?: string };
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
  currency: string;
  taxPercent?: number;
  discount?: number;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  notes?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { transcript } = req.body;

    if (!transcript || typeof transcript !== 'string') {
      return res.status(400).json({ error: 'transcript is required and must be a string' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    // Generate default values
    const today = new Date();
    const dueDate = new Date(today);
    dueDate.setDate(today.getDate() + 14);
    
    const defaultInvoiceNumber = `INV-${Date.now()}`;
    const defaultIssueDate = today.toISOString().split('T')[0];
    const defaultDueDate = dueDate.toISOString().split('T')[0];

    // Create the prompt for GPT-4
    const prompt = `
You are an AI assistant that converts natural language transcripts into structured invoice data.

Convert the following transcript into a JSON object with this exact structure:
{
  "from": { "name": "string", "email": "string (optional)" },
  "to": { "name": "string", "email": "string (optional)" },
  "items": [
    {
      "description": "string",
      "quantity": number,
      "unitPrice": number
    }
  ],
  "currency": "USD",
  "taxPercent": number (default 0),
  "discount": number (default 0),
  "invoiceNumber": "${defaultInvoiceNumber}",
  "issueDate": "${defaultIssueDate}",
  "dueDate": "${defaultDueDate}",
  "notes": "string (optional)"
}

Rules:
1. Extract sender (from) and recipient (to) information
2. Parse all line items with descriptions, quantities, and unit prices
3. Use currency "USD" unless explicitly mentioned
4. Set taxPercent to 0 unless tax is mentioned
5. Set discount to 0 unless discount is mentioned
6. Use the provided default dates and invoice number
7. Include any additional notes or special instructions
8. If information is missing, make reasonable assumptions based on context
9. Return ONLY the JSON object, no other text

Transcript: "${transcript}"
`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a precise invoice data extractor. Return only valid JSON with no additional text or formatting.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 1000,
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      return res.status(500).json({ error: 'No response from OpenAI' });
    }

    // Parse the JSON response
    let parsedInvoice: Invoice;
    try {
      parsedInvoice = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', responseText);
      return res.status(500).json({ error: 'Invalid JSON response from AI' });
    }

    // Validate required fields and apply defaults
    if (!parsedInvoice.from?.name || !parsedInvoice.to?.name || !parsedInvoice.items?.length) {
      return res.status(400).json({ 
        error: 'Incomplete invoice data: missing sender, recipient, or items' 
      });
    }

    // Ensure defaults are applied
    const finalInvoice: Invoice = {
      ...parsedInvoice,
      currency: parsedInvoice.currency || 'USD',
      taxPercent: parsedInvoice.taxPercent || 0,
      discount: parsedInvoice.discount || 0,
      invoiceNumber: parsedInvoice.invoiceNumber || defaultInvoiceNumber,
      issueDate: parsedInvoice.issueDate || defaultIssueDate,
      dueDate: parsedInvoice.dueDate || defaultDueDate,
    };

    return res.status(200).json(finalInvoice);

  } catch (error) {
    console.error('Error in parse-invoice:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
