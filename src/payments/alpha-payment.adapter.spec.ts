import { AlphaPaymentAdapter } from './alpha-payment.adapter';
import { PaymentError } from './payment-provider';

const GOOD_CARD = '4242424242424242';
const DECLINED_CARD = '4000000000000002';
const SLOW_CARD = '4000000000000119';

describe('AlphaPaymentAdapter', () => {
  let adapter: AlphaPaymentAdapter;

  beforeEach(() => {
    adapter = new AlphaPaymentAdapter('sk_test_tickethub');
  });

  it('addebita e restituisce l\'id del pagamento', async () => {
    const result = await adapter.charge({ amount: 62.63, reference: 'TH-1', card: GOOD_CARD });
    expect(result.approved).toBe(true);
    expect(result.paymentId).toMatch(/^ch_\d{6}$/);
  });

  it('segnala un pagamento rifiutato senza lanciare', async () => {
    const result = await adapter.charge({ amount: 10, reference: 'TH-2', card: DECLINED_CARD });
    expect(result.approved).toBe(false);
  });

  it('riprova se il primo tentativo va in timeout', async () => {
    const result = await adapter.charge({ amount: 10, reference: 'TH-3', card: SLOW_CARD });
    expect(result.approved).toBe(true);
  });

  it('lancia PaymentError se Alpha dà un errore', async () => {
    await expect(adapter.charge({ amount: 0, reference: 'TH-4', card: GOOD_CARD })).rejects.toBeInstanceOf(
      PaymentError,
    );
  });

  it('rimborsa un pagamento riuscito', async () => {
    const { paymentId } = await adapter.charge({ amount: 20, reference: 'TH-5', card: GOOD_CARD });
    await expect(adapter.refund(paymentId, 20)).resolves.toBeUndefined();
  });

  it('lancia PaymentError se il rimborso non è possibile', async () => {
    await expect(adapter.refund('ch_999999', 20)).rejects.toBeInstanceOf(PaymentError);
  });
});
