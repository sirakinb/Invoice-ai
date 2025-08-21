import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

interface CurrencyPickerProps {
  selectedCurrency: string;
  onCurrencyChange: (currency: string) => void;
  style?: any;
}

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
];

export const CurrencyPicker: React.FC<CurrencyPickerProps> = ({
  selectedCurrency,
  onCurrencyChange,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>Currency</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedCurrency}
          onValueChange={(itemValue) => onCurrencyChange(itemValue)}
          style={styles.picker}
        >
          {CURRENCIES.map((currency) => (
            <Picker.Item
              key={currency.code}
              label={`${currency.symbol} ${currency.code} - ${currency.name}`}
              value={currency.code}
            />
          ))}
        </Picker>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
  },
});
