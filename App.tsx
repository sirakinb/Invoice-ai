import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { ChatMessage, Invoice } from './types';
import { ChatBubble } from './components/ChatBubble';
import { InvoiceReviewForm } from './components/InvoiceReviewForm';
import { SoundWaveIcon } from './components/SoundWaveIcon';
import { parseInvoiceFromText, createStripePayment } from './utils/api';
import { generateInvoiceNumber } from './utils/invoice';
import { generateAndSharePDF, printPDF } from './utils/pdfGenerator';
import { startVoiceInput, speakInvoiceConfirmation, processVoiceInputForInvoice } from './utils/voiceInput';

type AppScreen = 'chat' | 'review' | 'preview';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: "Hi! I'm TapInvoice AI. Tell me about the invoice you'd like to create. You can say something like 'I need to invoice John for 5 hours of consulting at $100/hour'.",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState<Partial<Invoice> | null>(null);
  const [generatedPdf, setGeneratedPdf] = useState<string | null>(null);
  
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new messages are added
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const addMessage = (text: string, isUser: boolean) => {
    const newMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      text,
      isUser,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = inputText.trim();
    setInputText('');
    addMessage(userMessage, true);
    setIsLoading(true);

    try {
      // Call the real API
      const response = await parseInvoiceFromText(userMessage);
      
      if (response.success && response.invoice) {
        // Add invoice number if not present
        const invoiceWithNumber = {
          ...response.invoice,
          invoiceNumber: response.invoice.invoiceNumber || generateInvoiceNumber(),
          createdAt: new Date().toISOString(),
        };
        
        setCurrentInvoice(invoiceWithNumber);
        addMessage(response.message, false);
        
        // Add a follow-up message
        setTimeout(() => {
          addMessage("Would you like to review and edit the invoice details, or shall I generate it as is?", false);
        }, 1000);
      } else {
        addMessage(response.message || "Sorry, I couldn't process your request. Please try again.", false);
      }
    } catch (error) {
      console.error('API Error:', error);
      addMessage("Sorry, I encountered an error processing your request. Please try again.", false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateInvoice = () => {
    if (currentInvoice) {
      setCurrentScreen('review');
    } else {
      Alert.alert('No Invoice', 'Please create an invoice first by describing what you need.');
    }
  };

  const handleInvoiceSaved = async (invoice: Invoice) => {
    setIsLoading(true);
    
    try {
      // Create payment link
      const paymentResponse = await createStripePayment(
        invoice.total,
        invoice.currency.toLowerCase(),
        `Invoice ${invoice.invoiceNumber}`,
        { invoiceNumber: invoice.invoiceNumber }
      );
      
      if (paymentResponse.success && paymentResponse.paymentUrl) {
        const invoiceWithPayment = {
          ...invoice,
          paymentUrl: paymentResponse.paymentUrl,
        };
        
        setCurrentInvoice(invoiceWithPayment);
        
        // Generate and share PDF
        const pdfShared = await generateAndSharePDF(invoiceWithPayment, {
          includeQRCode: true,
          filename: `invoice-${invoice.invoiceNumber}.pdf`,
        });
        
        if (pdfShared) {
          addMessage(`Perfect! I've created your invoice #${invoice.invoiceNumber} with a payment link and shared the PDF. The client can scan the QR code or click the payment link to pay.`, false);
          
          // Provide voice confirmation
          await speakInvoiceConfirmation(invoiceWithPayment);
        } else {
          addMessage(`I've created your invoice #${invoice.invoiceNumber} with a payment link. The PDF generation is ready but sharing may not be available on this platform.`, false);
        }
        
        setCurrentScreen('chat');
      } else {
        Alert.alert('Payment Error', 'Failed to create payment link. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to process invoice. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvoiceCanceled = () => {
    setCurrentScreen('chat');
    addMessage("No problem! Feel free to tell me about another invoice you'd like to create.", false);
  };

  // const generatePDF = async (invoice: Invoice) => {
  //   try {
  //     // Generate QR Code (commented out until dependency is installed)
  //     // const qrCodeSvg = <QRCode value={invoice.paymentUrl || ''} size={150} />;
      
  //     const htmlContent = generateInvoiceHTML(invoice);
  //     const { uri } = await Print.printToFileAsync({ html: htmlContent });
  //     setGeneratedPdf(uri);
  //   } catch (error) {
  //     console.error('Error generating PDF:', error);
  //   }
  // };

  const handleSharePDF = async () => {
    if (generatedPdf) {
      try {
        // await Sharing.shareAsync(generatedPdf);
        Alert.alert('Share', 'PDF sharing will be available once dependencies are installed.');
      } catch (error) {
        Alert.alert('Error', 'Failed to share PDF.');
      }
    }
  };

  const handleVoiceInput = async () => {
    setIsLoading(true);
    
    try {
      const result = await startVoiceInput({
        language: 'en-US',
        timeout: 10000,
      });
      
      if (result.success && result.text) {
        const processedText = processVoiceInputForInvoice(result.text);
        setInputText(processedText);
        
        // Optionally auto-send the voice input
        // handleSendMessage();
      } else {
        Alert.alert('Voice Input Failed', result.error || 'Could not process voice input');
      }
    } catch (error) {
      Alert.alert('Voice Input Error', 'An error occurred while processing voice input');
    } finally {
      setIsLoading(false);
    }
  };

  const renderChatScreen = () => (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Invoice AI</Text>
      </View>
      
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => (
          <ChatBubble key={message.id} message={message} />
        ))}
        
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={styles.loadingText}>Processing...</Text>
          </View>
        )}
      </ScrollView>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            placeholder="Describe your invoice..."
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            onSubmitEditing={handleSendMessage}
            blurOnSubmit={true}
          />
          <TouchableOpacity
            style={styles.voiceButton}
            onPress={handleVoiceInput}
          >
            <SoundWaveIcon size={20} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
        
        {currentInvoice && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.generateButton}
              onPress={handleGenerateInvoice}
            >
              <Text style={styles.generateButtonText}>📄 Review & Generate</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.printButton}
              onPress={() => printPDF(currentInvoice as Invoice)}
            >
              <Text style={styles.printButtonText}>🖨️ Print</Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );

  const renderReviewScreen = () => (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Review Invoice</Text>
        <Text style={styles.headerSubtitle}>Edit details before generating</Text>
      </View>
      
      {currentInvoice && (
        <InvoiceReviewForm
          invoice={currentInvoice}
          onSave={handleInvoiceSaved}
          onCancel={handleInvoiceCanceled}
        />
      )}
    </SafeAreaView>
  );

  return (
    <View style={styles.app}>
      <StatusBar style="dark" />
      {currentScreen === 'chat' && renderChatScreen()}
      {currentScreen === 'review' && renderReviewScreen()}
    </View>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  loadingText: {
    marginLeft: 8,
    color: '#6b7280',
    fontSize: 14,
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    backgroundColor: '#f9fafb',
  },
  voiceButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 70,
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  generateButton: {
    flex: 1,
    backgroundColor: '#10b981',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  generateButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  printButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  printButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
