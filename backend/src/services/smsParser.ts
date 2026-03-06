import { BankProvider, TransactionType } from '@prisma/client';

export interface ParsedSMS {
  bankProvider: BankProvider;
  type: TransactionType;
  amount: number;
  balance: number;
  reference: string;
  description: string;
  transactionDate: Date;
  phoneNumber?: string;
}

/**
 * SMS Parser for Kenyan Banks (M-Pesa, Equity, KCB, Co-op)
 */
export class SMSParser {
  /**
   * Parse M-Pesa SMS
   * Example: "RKH123ABC Confirmed. Ksh5,000.00 sent to John Doe 0722123456 on 17/2/26 at 10:30 AM. New M-PESA balance is Ksh15,000.00"
   */
  private static parseMPesa(smsContent: string): ParsedSMS | null {
    try {
      // Extract reference code
      const refMatch = smsContent.match(/^([A-Z0-9]{10})\s+Confirmed/);
      if (!refMatch) return null;
      const reference = refMatch[1];

      // Extract amount
      const amountMatch = smsContent.match(/Ksh([\d,]+\.?\d*)/);
      if (!amountMatch) return null;
      const amount = parseFloat(amountMatch[1].replace(/,/g, ''));

      // Extract balance
      const balanceMatch = smsContent.match(/balance is Ksh([\d,]+\.?\d*)/i);
      if (!balanceMatch) return null;
      const balance = parseFloat(balanceMatch[1].replace(/,/g, ''));

      // Determine transaction type
      let type: TransactionType = TransactionType.DEPOSIT;
      const lowerContent = smsContent.toLowerCase();
      if (lowerContent.includes('sent to') || lowerContent.includes('paid to') ||
          lowerContent.includes('withdrawn') || lowerContent.includes('withdraw')) {
        type = TransactionType.WITHDRAWAL;
      } else if (lowerContent.includes('received from') || lowerContent.includes('deposited')) {
        type = TransactionType.DEPOSIT;
      }

      // Extract date/time
      const dateMatch = smsContent.match(/on (\d{1,2}\/\d{1,2}\/\d{2,4}) at (\d{1,2}:\d{2}\s?(?:AM|PM))/i);
      let transactionDate = new Date();
      if (dateMatch) {
        const [, date, time] = dateMatch;
        const [day, month, year] = date.split('/');
        const fullYear = year.length === 2 ? `20${year}` : year;
        transactionDate = new Date(`${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')} ${time}`);
      }

      return {
        bankProvider: BankProvider.MPESA,
        type,
        amount,
        balance,
        reference,
        description: smsContent.substring(0, 200),
        transactionDate,
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Parse Equity Bank SMS
   * Example: "Your Equity a/c XXX1234 has been credited with KES 10,000.00 on 17/02/26. Bal: KES 50,000.00. Ref: FT26048RKH"
   */
  private static parseEquity(smsContent: string): ParsedSMS | null {
    try {
      // Extract reference
      const refMatch = smsContent.match(/Ref:?\s*([A-Z0-9]+)/i);
      if (!refMatch) return null;
      const reference = refMatch[1];

      // Extract amount
      const amountMatch = smsContent.match(/KES\s?([\d,]+\.?\d*)/);
      if (!amountMatch) return null;
      const amount = parseFloat(amountMatch[1].replace(/,/g, ''));

      // Extract balance
      const balanceMatch = smsContent.match(/Bal:?\s*KES\s?([\d,]+\.?\d*)/i);
      if (!balanceMatch) return null;
      const balance = parseFloat(balanceMatch[1].replace(/,/g, ''));

      // Determine transaction type
      let type: TransactionType = TransactionType.DEPOSIT;
      if (smsContent.includes('debited') || smsContent.includes('withdrawn')) {
        type = TransactionType.WITHDRAWAL;
      } else if (smsContent.includes('credited') || smsContent.includes('deposited')) {
        type = TransactionType.DEPOSIT;
      }

      // Extract date
      const dateMatch = smsContent.match(/on (\d{1,2}\/\d{2}\/\d{2,4})/);
      let transactionDate = new Date();
      if (dateMatch) {
        const [day, month, year] = dateMatch[1].split('/');
        const fullYear = year.length === 2 ? `20${year}` : year;
        transactionDate = new Date(`${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
      }

      return {
        bankProvider: BankProvider.EQUITY,
        type,
        amount,
        balance,
        reference,
        description: smsContent.substring(0, 200),
        transactionDate,
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Parse KCB SMS
   * Example 1: "KCB A/C XXX456 Credited with KShs 20,000.00 on 17-Feb-26. Avail Bal KShs 70,000.00. Ref TXN123456"
   * Example 2: "KCB: You have received Ksh15,000.00 from John Doe on 15/01/2025. Your new balance is Ksh45,000.00. Ref: TRF2025011500123."
   */
  private static parseKCB(smsContent: string): ParsedSMS | null {
    try {
      // Extract reference
      const refMatch = smsContent.match(/Ref:?\s*([A-Z0-9]+)/i);
      if (!refMatch) return null;
      const reference = refMatch[1];

      // Extract amount - support both KShs and Ksh formats
      const amountMatch = smsContent.match(/(?:KShs?|Ksh)\s?([\d,]+\.?\d*)/);
      if (!amountMatch) return null;
      const amount = parseFloat(amountMatch[1].replace(/,/g, ''));

      // Extract balance - support both "Avail Bal KShs" and "new balance is Ksh" formats
      const balanceMatch = smsContent.match(/(?:(?:Avail\s)?Bal:?\s*(?:KShs?|Ksh)|(?:new|New)\s+balance\s+is\s+(?:KShs?|Ksh))\s?([\d,]+\.?\d*)/i);
      if (!balanceMatch) return null;
      const balance = parseFloat(balanceMatch[1].replace(/,/g, ''));

      // Determine transaction type
      const lowerContent = smsContent.toLowerCase();
      let type: TransactionType = TransactionType.DEPOSIT;
      if (lowerContent.includes('debited') || lowerContent.includes('withdrawn') || lowerContent.includes('sent to')) {
        type = TransactionType.WITHDRAWAL;
      } else if (lowerContent.includes('credited') || lowerContent.includes('deposited') || lowerContent.includes('received')) {
        type = TransactionType.DEPOSIT;
      }

      // Extract date - support "17-Feb-26" and "15/01/2025" formats
      let transactionDate = new Date();
      const dateMatch1 = smsContent.match(/on (\d{1,2})-([A-Za-z]{3})-(\d{2,4})/);
      const dateMatch2 = smsContent.match(/on (\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
      if (dateMatch1) {
        const [, day, monthStr, year] = dateMatch1;
        const fullYear = year.length === 2 ? `20${year}` : year;
        transactionDate = new Date(`${day} ${monthStr} ${fullYear}`);
      } else if (dateMatch2) {
        const [, day, month, year] = dateMatch2;
        const fullYear = year.length === 2 ? `20${year}` : year;
        transactionDate = new Date(`${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
      }

      return {
        bankProvider: BankProvider.KCB,
        type,
        amount,
        balance,
        reference,
        description: smsContent.substring(0, 200),
        transactionDate,
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Parse Co-op Bank SMS
   * Example: "Co-operative Bank A/C XXX789 CR KES 15,000.00 on 17/02/26. Bal KES 60,000.00. Ref: COOP123456"
   */
  private static parseCoop(smsContent: string): ParsedSMS | null {
    try {
      // Extract reference
      const refMatch = smsContent.match(/Ref:?\s*([A-Z0-9]+)/i);
      if (!refMatch) return null;
      const reference = refMatch[1];

      // Extract amount
      const amountMatch = smsContent.match(/(?:CR|DR)\s*KES\s?([\d,]+\.?\d*)/);
      if (!amountMatch) return null;
      const amount = parseFloat(amountMatch[1].replace(/,/g, ''));

      // Extract balance
      const balanceMatch = smsContent.match(/Bal:?\s*KES\s?([\d,]+\.?\d*)/i);
      if (!balanceMatch) return null;
      const balance = parseFloat(balanceMatch[1].replace(/,/g, ''));

      // Determine transaction type
      let type: TransactionType = TransactionType.DEPOSIT;
      if (smsContent.includes('DR ')) {
        type = TransactionType.WITHDRAWAL;
      } else if (smsContent.includes('CR ')) {
        type = TransactionType.DEPOSIT;
      }

      // Extract date (e.g. "17/02/26")
      const dateMatch = smsContent.match(/on (\d{1,2}\/\d{2}\/\d{2,4})/);
      let transactionDate = new Date();
      if (dateMatch) {
        const [day, month, year] = dateMatch[1].split('/');
        const fullYear = year.length === 2 ? `20${year}` : year;
        transactionDate = new Date(`${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
      }

      return {
        bankProvider: BankProvider.COOP,
        type,
        amount,
        balance,
        reference,
        description: smsContent.substring(0, 200),
        transactionDate,
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Main parser - tries all bank formats
   */
  static parse(smsContent: string): ParsedSMS | null {
    // Try M-Pesa format
    if (smsContent.toLowerCase().includes('m-pesa') || /^[A-Z0-9]{10}\s+Confirmed/.test(smsContent)) {
      const result = this.parseMPesa(smsContent);
      if (result) return result;
    }

    // Try Equity format
    if (smsContent.toLowerCase().includes('equity')) {
      const result = this.parseEquity(smsContent);
      if (result) return result;
    }

    // Try KCB format
    if (smsContent.toLowerCase().includes('kcb')) {
      const result = this.parseKCB(smsContent);
      if (result) return result;
    }

    // Try Co-op format
    if (smsContent.toLowerCase().includes('co-operative') || smsContent.toLowerCase().includes('coop')) {
      const result = this.parseCoop(smsContent);
      if (result) return result;
    }

    return null;
  }
}
