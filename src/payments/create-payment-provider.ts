import { AlphaPaymentAdapter } from './alpha-payment.adapter';
import { BetaPaymentAdapter } from './beta-payment.adapter';
import type { PaymentProvider } from './payment-provider';

// Sceglie il provider all'avvio con PAYMENT_PROVIDER (alpha o beta).
// Senza variabile si usa alpha; un valore sconosciuto blocca l'avvio.
export function createPaymentProvider(env: NodeJS.ProcessEnv = process.env): PaymentProvider {
  const name = env.PAYMENT_PROVIDER ?? 'alpha';
  switch (name) {
    case 'alpha':
      return new AlphaPaymentAdapter(env.ALPHA_API_KEY ?? 'sk_test_tickethub');
    case 'beta':
      return new BetaPaymentAdapter(env.BETA_MERCHANT_ID ?? 'tickethub');
    default:
      throw new Error(`PAYMENT_PROVIDER non valido: "${name}" (valori ammessi: alpha, beta)`);
  }
}
