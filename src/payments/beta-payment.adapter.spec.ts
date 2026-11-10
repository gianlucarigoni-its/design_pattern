import { BetaPaymentAdapter } from './beta-payment.adapter';
import { PaymentError } from './payment-provider';

describe('BetaPaymentAdapter', () => {
  let adapter: BetaPaymentAdapter;

  beforeEach(() => {
    adapter = new BetaPaymentAdapter('tickethub');
  });

  it("addebita con tok_ok e restituisce l'id BP-", async () => {
    const result = await adapter.charge({ amount: 50.4, reference: 'TH-1', card: 'tok_ok' });
    expect(result.approved).toBe(true);
    expect(result.paymentId).toMatch(/^BP-/);
  });

  it('segnala tok_refuse come rifiutato senza lanciare', async () => {
    const result = await adapter.charge({ amount: 10, reference: 'TH-2', card: 'tok_refuse' });
    expect(result.approved).toBe(false);
  });

  it('formatta gli importi con due decimali', async () => {
    await expect(adapter.charge({ amount: 10, reference: 'TH-3', card: 'tok_ok' })).resolves.toMatchObject({
      approved: true,
    });
  });

  it('lancia PaymentError se l\'importo non è valido', async () => {
    await expect(adapter.charge({ amount: Number.NaN, reference: 'TH-4', card: 'tok_ok' })).rejects.toBeInstanceOf(
      PaymentError,
    );
  });

  it('rimborsa un pagamento approvato', async () => {
    const { paymentId } = await adapter.charge({ amount: 20, reference: 'TH-5', card: 'tok_ok' });
    await expect(adapter.refund(paymentId, 20)).resolves.toBeUndefined();
  });

  it('lancia PaymentError se il pagamento non esiste o è rifiutato', async () => {
    await expect(adapter.refund('BP-x-999', 20)).rejects.toBeInstanceOf(PaymentError);
    const { paymentId } = await adapter.charge({ amount: 20, reference: 'TH-6', card: 'tok_refuse' });
    await expect(adapter.refund(paymentId, 20)).rejects.toBeInstanceOf(PaymentError);
  });
});
