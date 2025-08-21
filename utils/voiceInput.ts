import * as Speech from 'expo-speech';
import { Alert } from 'react-native';

export interface VoiceInputOptions {
  language?: string;
  timeout?: number;
  maxDuration?: number;
}

export interface VoiceInputResult {
  success: boolean;
  text?: string;
  error?: string;
}

// Text-to-speech for AI responses
export const speakText = async (
  text: string,
  options: Speech.SpeechOptions = {}
): Promise<void> => {
  try {
    const defaultOptions: Speech.SpeechOptions = {
      language: 'en-US',
      pitch: 1.0,
      rate: 0.9,
      ...options,
    };

    await Speech.speak(text, defaultOptions);
  } catch (error) {
    console.error('Error with text-to-speech:', error);
  }
};

// Stop current speech
export const stopSpeaking = (): void => {
  Speech.stop();
};

// Check if speech is currently playing
export const isSpeaking = async (): Promise<boolean> => {
  return await Speech.isSpeakingAsync();
};

// Mock voice input function (placeholder for actual speech recognition)
export const startVoiceInput = async (
  options: VoiceInputOptions = {}
): Promise<VoiceInputResult> => {
  return new Promise((resolve) => {
    Alert.alert(
      'Voice Input',
      'Voice input is not yet implemented. This would normally start speech recognition.',
      [
        {
          text: 'Cancel',
          onPress: () => resolve({ success: false, error: 'Cancelled by user' }),
        },
        {
          text: 'Mock Input',
          onPress: () => resolve({
            success: true,
            text: 'I need to invoice John Smith for 3 hours of web development at $75 per hour',
          }),
        },
      ]
    );
  });
};

// Speak invoice confirmation
export const speakInvoiceConfirmation = async (invoice: any): Promise<void> => {
  const confirmationText = `Invoice created for ${invoice.toName}. Total amount is ${invoice.total} ${invoice.currency}. Due date is ${new Date(invoice.dueDate).toLocaleDateString()}.`;
  
  await speakText(confirmationText, {
    rate: 0.8,
    pitch: 1.1,
  });
};

// Speak welcome message
export const speakWelcomeMessage = async (): Promise<void> => {
  const welcomeText = "Welcome to TapInvoice AI. Tell me about the invoice you'd like to create.";
  
  await speakText(welcomeText, {
    rate: 0.9,
    pitch: 1.0,
  });
};

// Voice input availability check
export const isVoiceInputAvailable = (): boolean => {
  // This would check for actual speech recognition availability
  // For now, we'll return false since it's not implemented
  return false;
};

// Get available voices
export const getAvailableVoices = async (): Promise<Speech.Voice[]> => {
  try {
    return await Speech.getAvailableVoicesAsync();
  } catch (error) {
    console.error('Error getting available voices:', error);
    return [];
  }
};

// Voice input with retry logic
export const startVoiceInputWithRetry = async (
  maxRetries: number = 3,
  options: VoiceInputOptions = {}
): Promise<VoiceInputResult> => {
  let lastError = '';
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await startVoiceInput(options);
      
      if (result.success) {
        return result;
      }
      
      lastError = result.error || 'Unknown error';
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
      }
    } catch (error) {
      lastError = error instanceof Error ? error.message : 'Unknown error';
    }
  }
  
  return {
    success: false,
    error: `Voice input failed after ${maxRetries} attempts. Last error: ${lastError}`,
  };
};

// Process voice input text for invoice parsing
export const processVoiceInputForInvoice = (text: string): string => {
  // Clean up common speech recognition errors
  let processedText = text
    .toLowerCase()
    .replace(/\bdollar\b/g, '$')
    .replace(/\bdollars\b/g, '$')
    .replace(/\bper hour\b/g, '/hour')
    .replace(/\bhour\b/g, 'hour')
    .replace(/\bhours\b/g, 'hours')
    .replace(/\bone\b/g, '1')
    .replace(/\btwo\b/g, '2')
    .replace(/\bthree\b/g, '3')
    .replace(/\bfour\b/g, '4')
    .replace(/\bfive\b/g, '5')
    .replace(/\bsix\b/g, '6')
    .replace(/\bseven\b/g, '7')
    .replace(/\beight\b/g, '8')
    .replace(/\bnine\b/g, '9')
    .replace(/\bten\b/g, '10');
  
  // Capitalize first letter
  processedText = processedText.charAt(0).toUpperCase() + processedText.slice(1);
  
  return processedText;
};

// Voice feedback for user actions
export const provideVoiceFeedback = async (action: string): Promise<void> => {
  const feedbackMessages: Record<string, string> = {
    'invoice_created': 'Invoice has been created successfully.',
    'pdf_generated': 'PDF has been generated and is ready to share.',
    'payment_link_created': 'Payment link has been created.',
    'invoice_sent': 'Invoice has been sent successfully.',
    'error': 'An error occurred. Please try again.',
    'listening': 'Listening for your input.',
    'processing': 'Processing your request.',
  };
  
  const message = feedbackMessages[action] || 'Action completed.';
  await speakText(message, { rate: 0.9 });
};
