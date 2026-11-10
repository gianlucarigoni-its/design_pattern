import { Module } from '@nestjs/common';
import { AlphaPaymentAdapter } from './alpha-payment.adapter';
import { AlphaWebhookController } from './alpha-webhook.controller';
import { PAYMENT_PROVIDER } from './payment-provider';

@Module({
  controllers: [AlphaWebhookController],
  providers: [
    {
      provide: PAYMENT_PROVIDER,
      useFactory: () => new AlphaPaymentAdapter(process.env.ALPHA_API_KEY ?? 'sk_test_tickethub'),
    },
  ],
  exports: [PAYMENT_PROVIDER],
})
export class PaymentsModule {}
