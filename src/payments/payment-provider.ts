// Contratto comune a tutti i provider di pagamento (AlphaPay, BetaPayments).
// Gli importi sono in euro, come nel resto dell'applicazione: la conversione
// verso il formato dell'SDK la fa ogni adapter.

export const PAYMENT_PROVIDER = Symbol('PAYMENT_PROVIDER');

export interface ChargeRequest {
  amount: number;
  reference: string;
  card: string;
}

export interface ChargeResult {
  approved: boolean;
  paymentId: string;
}

export interface PaymentProvider {
  charge(request: ChargeRequest): Promise<ChargeResult>;
  refund(paymentId: string, amount: number): Promise<void>;
}

// Il provider non ha risposto o ha dato un errore: non è un rifiuto della carta.
export class PaymentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PaymentError';
  }
}
