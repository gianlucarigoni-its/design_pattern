import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createApp } from './helpers';

describe('Ordini con BetaPayments', () => {
  let app: INestApplication;

  beforeEach(async () => {
    process.env.PAYMENT_PROVIDER = 'beta';
    app = await createApp();
  });

  afterEach(async () => {
    await app.close();
    delete process.env.PAYMENT_PROVIDER;
  });

  function buy(seatId: string, card: string) {
    return request(app.getHttpServer())
      .post('/orders')
      .send({ eventId: 'e-2', seats: [{ seatId }], card, holderName: 'Giulia Rossi', email: 'giulia@example.com' });
  }

  it('vende un posto in PLATEA a 50,40 € pagato con tok_ok', async () => {
    const res = await buy('PLATEA-2-1', 'tok_ok').expect(201);
    expect(res.body.order.total).toBe(50.4);
    expect(res.body.order.status).toBe('paid');
    expect(res.body.order.paymentId).toMatch(/^BP-/);
  });

  it('risponde 402 con tok_refuse e lascia il posto libero', async () => {
    await buy('PLATEA-2-2', 'tok_refuse').expect(402);
    await buy('PLATEA-2-2', 'tok_ok').expect(201);
  });

  it('annulla un ordine pagato con Beta e lo porta a refunded', async () => {
    const bought = await buy('PLATEA-2-3', 'tok_ok').expect(201);
    const cancelled = await request(app.getHttpServer())
      .post(`/orders/${bought.body.order.id}/cancel`)
      .expect(201);
    expect(cancelled.body.order.status).toBe('refunded');
    await buy('PLATEA-2-3', 'tok_ok').expect(201);
  });
});
