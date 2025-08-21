import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Invoice, LineItem } from '../types';
import { calculateInvoiceTotals, formatCurrency, updateLineItemTotal } from '../utils/invoice';
import { CurrencyPicker } from './CurrencyPicker';

interface InvoiceReviewFormProps {
  invoice: Partial<Invoice>;
  onSave: (invoice: Invoice) => void;
  onCancel: () => void;
}

export const InvoiceReviewForm: React.FC<InvoiceReviewFormProps> = ({
  invoice,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState<Partial<Invoice>>({
    ...invoice,
    lineItems: invoice.lineItems || [],
    currency: invoice.currency || 'USD',
    taxPercentage: invoice.taxPercentage || 0,
    discountAmount: invoice.discountAmount || 0,
  });

  const [totals, setTotals] = useState({
    subtotal: 0,
    taxAmount: 0,
    discountAmount: 0,
    total: 0,
  });

  useEffect(() => {
    const calculated = calculateInvoiceTotals(
      formData.lineItems || [],
      formData.taxPercentage || 0,
      formData.discountAmount || 0
    );
    setTotals(calculated);
  }, [formData.lineItems, formData.taxPercentage, formData.discountAmount]);

  const updateField = (field: keyof Invoice, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: any) => {
    const updatedItems = [...(formData.lineItems || [])];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: field === 'quantity' || field === 'unitPrice' ? parseFloat(value) || 0 : value,
    };
    updatedItems[index] = updateLineItemTotal(updatedItems[index]);
    setFormData(prev => ({ ...prev, lineItems: updatedItems }));
  };

  const addLineItem = () => {
    const newItem: LineItem = {
      id: Math.random().toString(36).substr(2, 9),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
    };
    setFormData(prev => ({
      ...prev,
      lineItems: [...(prev.lineItems || []), newItem],
    }));
  };

  const removeLineItem = (index: number) => {
    const updatedItems = [...(formData.lineItems || [])];
    updatedItems.splice(index, 1);
    setFormData(prev => ({ ...prev, lineItems: updatedItems }));
  };

  const handleSave = () => {
    if (!formData.fromName || !formData.toName || !formData.lineItems?.length) {
      Alert.alert('Missing Information', 'Please fill in all required fields and add at least one line item.');
      return;
    }

    const completeInvoice: Invoice = {
      id: formData.id || Math.random().toString(36).substr(2, 9),
      invoiceNumber: formData.invoiceNumber || `INV-${Date.now()}`,
      fromName: formData.fromName || '',
      fromEmail: formData.fromEmail || '',
      toName: formData.toName || '',
      toEmail: formData.toEmail || '',
      lineItems: formData.lineItems || [],
      currency: formData.currency || 'USD',
      taxPercentage: formData.taxPercentage || 0,
      discountAmount: formData.discountAmount || 0,
      subtotal: totals.subtotal,
      taxAmount: totals.taxAmount,
      total: totals.total,
      dueDate: formData.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      notes: formData.notes,
      createdAt: formData.createdAt || new Date().toISOString(),
    };

    onSave(completeInvoice);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>From</Text>
        <TextInput
          style={styles.input}
          placeholder="Your Name"
          value={formData.fromName || ''}
          onChangeText={(text) => updateField('fromName', text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Your Email"
          value={formData.fromEmail || ''}
          onChangeText={(text) => updateField('fromEmail', text)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>To</Text>
        <TextInput
          style={styles.input}
          placeholder="Client Name"
          value={formData.toName || ''}
          onChangeText={(text) => updateField('toName', text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Client Email"
          value={formData.toEmail || ''}
          onChangeText={(text) => updateField('toEmail', text)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Invoice Details</Text>
        <TextInput
          style={styles.input}
          placeholder="Invoice Number"
          value={formData.invoiceNumber || ''}
          onChangeText={(text) => updateField('invoiceNumber', text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Due Date (YYYY-MM-DD)"
          value={formData.dueDate ? formData.dueDate.split('T')[0] : ''}
          onChangeText={(text) => updateField('dueDate', text + 'T00:00:00.000Z')}
        />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Line Items</Text>
          <TouchableOpacity style={styles.addButton} onPress={addLineItem}>
            <Text style={styles.addButtonText}>+ Add Item</Text>
          </TouchableOpacity>
        </View>
        
        {formData.lineItems?.map((item, index) => (
          <View key={item.id} style={styles.lineItem}>
            <TextInput
              style={[styles.input, styles.lineItemInput]}
              placeholder="Description"
              value={item.description}
              onChangeText={(text) => updateLineItem(index, 'description', text)}
            />
            <View style={styles.lineItemRow}>
              <TextInput
                style={[styles.input, styles.quantityInput]}
                placeholder="Qty"
                value={item.quantity.toString()}
                onChangeText={(text) => updateLineItem(index, 'quantity', text)}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.input, styles.priceInput]}
                placeholder="Unit Price"
                value={item.unitPrice.toString()}
                onChangeText={(text) => updateLineItem(index, 'unitPrice', text)}
                keyboardType="numeric"
              />
              <Text style={styles.totalText}>
                {formatCurrency(item.total, formData.currency)}
              </Text>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeLineItem(index)}
              >
                <Text style={styles.removeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Currency & Totals</Text>
        
        <CurrencyPicker
          selectedCurrency={formData.currency || 'USD'}
          onCurrencyChange={(currency) => updateField('currency', currency)}
        />
        
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Tax %:</Text>
          <TextInput
            style={styles.percentInput}
            value={(formData.taxPercentage || 0).toString()}
            onChangeText={(text) => updateField('taxPercentage', parseFloat(text) || 0)}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Discount:</Text>
          <TextInput
            style={styles.priceInput}
            value={(formData.discountAmount || 0).toString()}
            onChangeText={(text) => updateField('discountAmount', parseFloat(text) || 0)}
            keyboardType="numeric"
          />
        </View>
        
        <View style={styles.totalsDisplay}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>{formatCurrency(totals.subtotal, formData.currency)}</Text>
          </View>
          {totals.taxAmount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax:</Text>
              <Text style={styles.totalValue}>{formatCurrency(totals.taxAmount, formData.currency)}</Text>
            </View>
          )}
          {totals.discountAmount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Discount:</Text>
              <Text style={styles.totalValue}>-{formatCurrency(totals.discountAmount, formData.currency)}</Text>
            </View>
          )}
          <View style={[styles.totalRow, styles.finalTotal]}>
            <Text style={styles.finalTotalLabel}>Total:</Text>
            <Text style={styles.finalTotalValue}>{formatCurrency(totals.total, formData.currency)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notes (Optional)</Text>
        <TextInput
          style={[styles.input, styles.notesInput]}
          placeholder="Additional notes..."
          value={formData.notes || ''}
          onChangeText={(text) => updateField('notes', text)}
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Create Invoice</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  lineItem: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  lineItemInput: {
    marginBottom: 8,
  },
  lineItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityInput: {
    flex: 1,
    marginBottom: 0,
  },
  priceInput: {
    flex: 2,
    marginBottom: 0,
  },
  percentInput: {
    width: 80,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 8,
    textAlign: 'center',
  },
  totalText: {
    flex: 1,
    textAlign: 'right',
    fontWeight: '600',
    fontSize: 16,
  },
  removeButton: {
    backgroundColor: '#ef4444',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  totalLabel: {
    fontSize: 16,
    color: '#374151',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  totalsDisplay: {
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  finalTotal: {
    borderTopWidth: 2,
    borderTopColor: '#d1d5db',
    paddingTop: 8,
    marginTop: 8,
  },
  finalTotalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  finalTotalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 32,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
