# Invoice AI API

Serverless API functions for the Invoice AI React Native app, deployed on Vercel.

## Endpoints

### POST /api/parse-invoice

Converts natural language transcript into structured invoice data using OpenAI GPT-4.

**Request:**
```json
{
  "transcript": "I need to invoice John Smith for 5 hours of consulting at $100 per hour"
}
```

**Response:**
```json
{
  "from": { "name": "Your Company", "email": "contact@company.com" },
  "to": { "name": "John Smith", "email": "john@example.com" },
  "items": [
    {
      "description": "Consulting services",
      "quantity": 5,
      "unitPrice": 100
    }
  ],
  "currency": "USD",
  "taxPercent": 0,
  "discount": 0,
  "invoiceNumber": "INV-1703123456789",
  "issueDate": "2024-01-15",
  "dueDate": "2024-01-29",
  "notes": "Payment due within 14 days"
}
```

### POST /api/create-payment

Creates a Stripe Checkout session for invoice payment.

**Request:**
```json
{
  "amount": 500.00,
  "currency": "usd",
  "description": "Invoice INV-1703123456789",
  "metadata": {
    "invoiceNumber": "INV-1703123456789"
  }
}
```

**Response:**
```json
{
  "url": "https://checkout.stripe.com/pay/cs_test_...",
  "sessionId": "cs_test_..."
}
```

## Environment Variables

Set these in your Vercel project dashboard:

- `OPENAI_API_KEY`: Your OpenAI API key
- `STRIPE_SECRET_KEY`: Your Stripe secret key (starts with `sk_`)

## Deployment

1. Install Vercel CLI: `npm i -g vercel`
2. Deploy: `vercel --prod`
3. Set environment variables in Vercel dashboard

## Local Development

1. Install dependencies: `cd api && npm install`
2. Create `.env.local` with your API keys
3. Run: `vercel dev`

## Dependencies

- `openai`: OpenAI API client for GPT-4
- `stripe`: Stripe API client for payments
- `@vercel/node`: Vercel serverless runtime
- `typescript`: TypeScript support
