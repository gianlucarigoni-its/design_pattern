import { Module } from '@nestjs/common';
import { AlphaWebhookController } from './alpha-webhook.controller';
import { createPaymentProvider } from './create-payment-provider';
import { PAYMENT_PROVIDER } from './payment-provider';

@Module({
  controllers: [AlphaWebhookController],
  providers: [{ provide: PAYMENT_PROVIDER, useFactory: () => createPaymentProvider() }],
  exports: [PAYMENT_PROVIDER],
})
export class PaymentsModule {}
