import { AlphaPayClient, AlphaTimeoutError } from '../../vendor/alpha-pay';
import { PaymentError } from './payment-provider';
import type { ChargeRequest, ChargeResult, PaymentProvider } from './payment-provider';

const MAX_CHARGE_ATTEMPTS = 3;
const MAX_REFUND_ATTEMPTS = 2;

export class AlphaPaymentAdapter implements PaymentProvider {
  private readonly client: AlphaPayClient;

  constructor(apiKey: string) {
    this.client = new AlphaPayClient(apiKey);
  }

  async charge(request: ChargeRequest): Promise<ChargeResult> {
    for (let attempt = 1; attempt <= MAX_CHARGE_ATTEMPTS; attempt++) {
      try {
        console.log(`[alpha] addebito tentativo ${attempt} ${request.reference} ${request.amount}`);
        const charge = await this.client.charge({
          amountCents: Math.round(request.amount * 100),
          currency: 'EUR',
          reference: request.reference,
          card: request.card,
        });
        console.log(`[alpha] esito ${charge.status} ${charge.chargeId}`);
        return { approved: charge.status === 'succeeded', paymentId: charge.chargeId };
      } catch (err) {
        if (err instanceof AlphaTimeoutError && attempt < MAX_CHARGE_ATTEMPTS) {
          console.log('[alpha] timeout, riprovo');
          continue;
        }
        console.log('[alpha] errore', err);
        throw new PaymentError('servizio di pagamento non disponibile');
      }
    }
    throw new PaymentError('servizio di pagamento non disponibile');
  }

  async refund(paymentId: string, amount: number): Promise<void> {
    for (let attempt = 1; attempt <= MAX_REFUND_ATTEMPTS; attempt++) {
      try {
        console.log(`[alpha] rimborso tentativo ${attempt} ${paymentId}`);
        await this.client.refund(paymentId, Math.round(amount * 100));
        return;
      } catch (err) {
        if (err instanceof AlphaTimeoutError) {
          console.log('[alpha] timeout rimborso');
          continue;
        }
        throw new PaymentError('rimborso non riuscito');
      }
    }
    throw new PaymentError('rimborso non riuscito');
  }
}
