import { SMSParser } from '../../services/smsParser';
import { BankProvider, TransactionType } from '@prisma/client';

describe('SMSParser', () => {
  describe('M-Pesa SMS', () => {
    it('should parse a confirmed send SMS', () => {
      const sms =
        'RKH123XYZ1 Confirmed. Ksh5,000.00 sent to John Doe 0722123456 on 17/2/26 at 10:30 AM. New M-PESA balance is Ksh20,000.00';
      const result = SMSParser.parse(sms);

      expect(result).not.toBeNull();
      expect(result!.bankProvider).toBe(BankProvider.MPESA);
      expect(result!.type).toBe(TransactionType.WITHDRAWAL);
      expect(result!.amount).toBe(5000);
      expect(result!.balance).toBe(20000);
      expect(result!.reference).toBe('RKH123XYZ1');
    });

    it('should parse a received from SMS as deposit', () => {
      const sms =
        'RKH456ABC1 Confirmed. You have received Ksh3,000.00 from Jane Doe 0722654321 on 17/2/26 at 2:15 PM. New M-PESA balance is Ksh23,000.00';
      const result = SMSParser.parse(sms);

      expect(result).not.toBeNull();
      expect(result!.bankProvider).toBe(BankProvider.MPESA);
      expect(result!.type).toBe(TransactionType.DEPOSIT);
      expect(result!.amount).toBe(3000);
      expect(result!.balance).toBe(23000);
    });

    it('should parse a deposited SMS as deposit', () => {
      const sms =
        'QK7H2LMNOP Confirmed. Ksh5,000.00 deposited to your M-Pesa account on 15/1/25 at 2:30 PM. New M-Pesa balance is Ksh12,500.00.';
      const result = SMSParser.parse(sms);

      expect(result).not.toBeNull();
      expect(result!.bankProvider).toBe(BankProvider.MPESA);
      expect(result!.type).toBe(TransactionType.DEPOSIT);
      expect(result!.amount).toBe(5000);
      expect(result!.balance).toBe(12500);
    });

    it('should parse a withdrawal SMS', () => {
      const sms =
        'RKH789DEF1 Confirmed. Withdraw Ksh2,000.00 from Agent 12345 on 17/3/15 at 4:00 PM. New M-PESA balance is Ksh18,000.00';
      const result = SMSParser.parse(sms);

      expect(result).not.toBeNull();
      expect(result!.type).toBe(TransactionType.WITHDRAWAL);
      expect(result!.amount).toBe(2000);
      expect(result!.balance).toBe(18000);
    });

    it('should parse a "withdrawn from" SMS as withdrawal', () => {
      const sms =
        'QK7H2LMNOP Confirmed. Ksh2,000.00 withdrawn from your M-Pesa account on 15/1/25 at 3:45 PM. New M-Pesa balance is Ksh10,500.00.';
      const result = SMSParser.parse(sms);

      expect(result).not.toBeNull();
      expect(result!.bankProvider).toBe(BankProvider.MPESA);
      expect(result!.type).toBe(TransactionType.WITHDRAWAL);
      expect(result!.amount).toBe(2000);
      expect(result!.balance).toBe(10500);
      expect(result!.reference).toBe('QK7H2LMNOP');
    });

    it('should return null for non-M-Pesa format', () => {
      const sms = 'This is not an M-PESA message';
      const result = SMSParser.parse(sms);
      expect(result).toBeNull();
    });
  });

  describe('Equity Bank SMS', () => {
    it('should parse a credited SMS', () => {
      const sms =
        'Your Equity a/c XXX1234 has been credited with KES 10,000.00 on 17/02/26. Bal: KES 30,000.00. Ref: FT26048ABC';
      const result = SMSParser.parse(sms);

      expect(result).not.toBeNull();
      expect(result!.bankProvider).toBe(BankProvider.EQUITY);
      expect(result!.type).toBe(TransactionType.DEPOSIT);
      expect(result!.amount).toBe(10000);
      expect(result!.balance).toBe(30000);
      expect(result!.reference).toBe('FT26048ABC');
    });

    it('should parse a debited SMS as withdrawal', () => {
      const sms =
        'Your Equity a/c XXX1234 has been debited with KES 5,000.00 on 17/02/26. Bal: KES 25,000.00. Ref: FT26048DEF';
      const result = SMSParser.parse(sms);

      expect(result).not.toBeNull();
      expect(result!.bankProvider).toBe(BankProvider.EQUITY);
      expect(result!.type).toBe(TransactionType.WITHDRAWAL);
      expect(result!.amount).toBe(5000);
      expect(result!.balance).toBe(25000);
    });
  });

  describe('KCB SMS', () => {
    it('should parse a credited SMS', () => {
      const sms =
        'KCB A/C XXX456 Credited with KShs 8,000.00 on 17-Feb-26. Avail Bal KShs 38,000.00. Ref TXN789DEF';
      const result = SMSParser.parse(sms);

      expect(result).not.toBeNull();
      expect(result!.bankProvider).toBe(BankProvider.KCB);
      expect(result!.type).toBe(TransactionType.DEPOSIT);
      expect(result!.amount).toBe(8000);
      expect(result!.balance).toBe(38000);
      expect(result!.reference).toBe('TXN789DEF');
    });

    it('should parse a debited SMS as withdrawal', () => {
      const sms =
        'KCB A/C XXX456 Debited with KShs 3,000.00 on 17-Feb-26. Avail Bal KShs 35,000.00. Ref TXN321GHI';
      const result = SMSParser.parse(sms);

      expect(result).not.toBeNull();
      expect(result!.bankProvider).toBe(BankProvider.KCB);
      expect(result!.type).toBe(TransactionType.WITHDRAWAL);
      expect(result!.amount).toBe(3000);
      expect(result!.balance).toBe(35000);
    });

    it('should extract the transaction date from the SMS', () => {
      const sms =
        'KCB A/C XXX456 Credited with KShs 8,000.00 on 17-Feb-26. Avail Bal KShs 38,000.00. Ref TXN789DEF';
      const result = SMSParser.parse(sms);

      expect(result).not.toBeNull();
      expect(result!.transactionDate.getFullYear()).toBe(2026);
      expect(result!.transactionDate.getMonth()).toBe(1); // February = 1
      expect(result!.transactionDate.getDate()).toBe(17);
    });

    it('should parse KCB SMS with full year date', () => {
      const sms =
        'KCB A/C XXX456 Credited with KShs 12,000.00 on 5-Jan-2025. Avail Bal KShs 50,000.00. Ref TXN999ABC';
      const result = SMSParser.parse(sms);

      expect(result).not.toBeNull();
      expect(result!.amount).toBe(12000);
      expect(result!.transactionDate.getFullYear()).toBe(2025);
      expect(result!.transactionDate.getMonth()).toBe(0); // January = 0
    });

    it('should parse KCB alternate format with Ksh and DD/MM/YYYY date', () => {
      const sms =
        'KCB: You have received Ksh15,000.00 from John Doe on 15/01/2025. Your new balance is Ksh45,000.00. Ref: TRF2025011500123.';
      const result = SMSParser.parse(sms);

      expect(result).not.toBeNull();
      expect(result!.bankProvider).toBe(BankProvider.KCB);
      expect(result!.type).toBe(TransactionType.DEPOSIT);
      expect(result!.amount).toBe(15000);
      expect(result!.balance).toBe(45000);
      expect(result!.reference).toBe('TRF2025011500123');
      expect(result!.transactionDate.getFullYear()).toBe(2025);
      expect(result!.transactionDate.getMonth()).toBe(0); // January = 0
      expect(result!.transactionDate.getDate()).toBe(15);
    });
  });

  describe('Co-op Bank SMS', () => {
    it('should parse a credit SMS', () => {
      const sms =
        'Co-operative Bank A/C XXX789 CR KES 15,000.00 on 17/02/26. Bal KES 60,000.00. Ref: COOP123456';
      const result = SMSParser.parse(sms);

      expect(result).not.toBeNull();
      expect(result!.bankProvider).toBe(BankProvider.COOP);
      expect(result!.type).toBe(TransactionType.DEPOSIT);
      expect(result!.amount).toBe(15000);
      expect(result!.balance).toBe(60000);
      expect(result!.reference).toBe('COOP123456');
    });

    it('should parse a debit SMS as withdrawal', () => {
      const sms =
        'Co-operative Bank A/C XXX789 DR KES 7,500.00 on 17/02/26. Bal KES 52,500.00. Ref: COOP654321';
      const result = SMSParser.parse(sms);

      expect(result).not.toBeNull();
      expect(result!.bankProvider).toBe(BankProvider.COOP);
      expect(result!.type).toBe(TransactionType.WITHDRAWAL);
      expect(result!.amount).toBe(7500);
      expect(result!.balance).toBe(52500);
    });

    it('should extract the transaction date from the SMS', () => {
      const sms =
        'Co-operative Bank A/C XXX789 CR KES 15,000.00 on 17/02/26. Bal KES 60,000.00. Ref: COOP123456';
      const result = SMSParser.parse(sms);

      expect(result).not.toBeNull();
      expect(result!.transactionDate.getFullYear()).toBe(2026);
      expect(result!.transactionDate.getMonth()).toBe(1); // February = 1
      expect(result!.transactionDate.getDate()).toBe(17);
    });

    it('should parse Co-op SMS with full year date', () => {
      const sms =
        'Co-operative Bank A/C XXX789 CR KES 20,000.00 on 3/06/2025. Bal KES 80,000.00. Ref: COOP999888';
      const result = SMSParser.parse(sms);

      expect(result).not.toBeNull();
      expect(result!.amount).toBe(20000);
      expect(result!.transactionDate.getFullYear()).toBe(2025);
      expect(result!.transactionDate.getMonth()).toBe(5); // June = 5
    });
  });

  describe('Unknown SMS format', () => {
    it('should return null for unrecognized SMS', () => {
      const sms = 'Hello, this is a regular text message';
      const result = SMSParser.parse(sms);
      expect(result).toBeNull();
    });

    it('should return null for empty string', () => {
      const result = SMSParser.parse('');
      expect(result).toBeNull();
    });
  });
});
