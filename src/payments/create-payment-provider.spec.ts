import { AlphaPaymentAdapter } from './alpha-payment.adapter';
import { BetaPaymentAdapter } from './beta-payment.adapter';
import { createPaymentProvider } from './create-payment-provider';

describe('createPaymentProvider', () => {
  it('senza variabile usa Alpha', () => {
    expect(createPaymentProvider({})).toBeInstanceOf(AlphaPaymentAdapter);
  });

  it('con alpha usa Alpha', () => {
    expect(createPaymentProvider({ PAYMENT_PROVIDER: 'alpha' })).toBeInstanceOf(AlphaPaymentAdapter);
  });

  it('con beta usa Beta', () => {
    expect(createPaymentProvider({ PAYMENT_PROVIDER: 'beta' })).toBeInstanceOf(BetaPaymentAdapter);
  });

  it("rifiuta un valore sconosciuto all'avvio", () => {
    expect(() => createPaymentProvider({ PAYMENT_PROVIDER: 'gamma' })).toThrow(/PAYMENT_PROVIDER/);
  });
});
