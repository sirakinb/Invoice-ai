# TapInvoice AI

A React Native app built with Expo that transforms natural language input into professional invoices with Stripe payment integration and PDF generation.

## 🚀 Features

- **Chat-style Interface**: Natural language invoice creation
- **Voice Input**: Speak your invoice requirements (coming soon)
- **Smart Parsing**: AI-powered invoice data extraction
- **Invoice Review**: Edit and customize invoice details
- **Stripe Integration**: Automatic payment link generation
- **PDF Generation**: Professional invoice PDFs with QR codes
- **Share & Print**: Easy sharing via email, messages, or print

## 📱 Screenshots

*Screenshots will be available once the app is running*

## 🛠 Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development) or Android Studio (for Android)

### Installation

1. **Fix npm cache permissions** (if you encounter permission errors):
   ```bash
   sudo chown -R $(whoami) ~/.npm
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

4. **Run on your device**:
   - **iOS**: Press `i` in the terminal or scan QR code with Camera app
   - **Android**: Press `a` in the terminal or scan QR code with Expo Go app
   - **Web**: Press `w` in the terminal

## 🔧 Configuration

### API Endpoints
Update the API endpoints in `utils/api.ts`:
- Replace `API_BASE_URL` with your backend URL
- Implement the `/api/parse-invoice` endpoint for GPT integration
- Implement the `/api/create-payment` endpoint for Stripe integration

### Mock Mode
The app currently runs in mock mode with sample data. To enable real API calls:
1. Uncomment the real API calls in `utils/api.ts`
2. Comment out the mock functions in `App.tsx`

## 📁 Project Structure

```
tapinvoice/
├── App.tsx                 # Main app component with chat interface
├── components/
│   ├── ChatBubble.tsx     # Chat message component
│   └── InvoiceReviewForm.tsx # Invoice editing form
├── types/
│   └── index.ts           # TypeScript type definitions
├── utils/
│   ├── api.ts             # API calls and mock functions
│   ├── invoice.ts         # Invoice calculations and utilities
│   └── pdfTemplate.ts     # HTML template for PDF generation
└── assets/                # Static assets
```

## 🎯 Usage

1. **Start a conversation**: Type or speak your invoice requirements
   - Example: "I need to invoice John Smith for 5 hours of consulting at $100/hour"

2. **Review the parsed data**: The AI will extract invoice details and show a summary

3. **Edit if needed**: Tap "Review & Generate Invoice" to edit details

4. **Generate PDF**: The app creates a professional PDF with payment link and QR code

5. **Share**: Use the share button to send via email, messages, or save to files

## 🔮 Upcoming Features

- [ ] Voice input with speech recognition
- [ ] Real-time GPT integration
- [ ] Stripe payment processing
- [ ] Invoice templates
- [ ] Client management
- [ ] Invoice history
- [ ] Recurring invoices

## 🛠 Development

### Adding New Features
1. Create feature branch: `git checkout -b feature/new-feature`
2. Make changes and test thoroughly
3. Update types in `types/index.ts` if needed
4. Add tests for new functionality
5. Submit pull request

### Building for Production
```bash
# Build for iOS
expo build:ios

# Build for Android
expo build:android
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues:
1. Check the [Expo documentation](https://docs.expo.dev/)
2. Search existing GitHub issues
3. Create a new issue with detailed information

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev/)
- UI inspired by modern chat interfaces
- PDF generation powered by expo-print
- QR codes generated with react-native-qrcode-svg
