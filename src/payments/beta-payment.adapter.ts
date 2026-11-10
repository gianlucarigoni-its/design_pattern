import { BetaPayments } from '../../vendor/beta-pay';
import { PaymentError } from './payment-provider';
import type { ChargeRequest, ChargeResult, PaymentProvider } from './payment-provider';

export class BetaPaymentAdapter implements PaymentProvider {
  private readonly client: BetaPayments;

  constructor(merchantId: string) {
    this.client = new BetaPayments(merchantId);
  }

  async charge(request: ChargeRequest): Promise<ChargeResult> {
    try {
      console.log(`[beta] addebito ${request.reference} ${request.amount}`);
      const payment = await this.client.createPayment({
        amount: request.amount.toFixed(2),
        currencyCode: 'EUR',
        orderRef: request.reference,
        cardToken: request.card,
      });
      console.log(`[beta] esito ${payment.outcome} ${payment.id}`);
      return { approved: payment.outcome === 'APPROVED', paymentId: payment.id };
    } catch (err) {
      console.log('[beta] errore', err);
      throw new PaymentError('servizio di pagamento non disponibile');
    }
  }

  async refund(paymentId: string, amount: number): Promise<void> {
    try {
      console.log(`[beta] rimborso ${paymentId}`);
      await this.client.reverse(paymentId, { amount: amount.toFixed(2) });
    } catch (err) {
      console.log('[beta] errore rimborso', err);
      throw new PaymentError('rimborso non riuscito');
    }
  }
}
