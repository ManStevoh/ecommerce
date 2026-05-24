/**
 * Payment gateway test suite — runs adapter unit tests (sandbox mode)
 * and optional HTTP integration tests when services are up.
 *
 * Usage: node scripts/test-payment-gateways.mjs [--http]
 */
import { createRequire } from 'node:module';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = (p) => path.join(root, 'services/payment-service/dist', p);

const { PaymentProvider } = require(path.join(root, 'packages/shared-types/dist/index.js'));

// ── Minimal ConfigService mock ─────────────────────────────────────────────
class MockConfig {
  constructor(values = {}) {
    this.values = values;
  }
  get(key) {
    return this.values[key];
  }
}

// ── Test harness ─────────────────────────────────────────────────────────────
const results = [];

function assert(name, condition, detail = '') {
  results.push({ name, pass: Boolean(condition), detail });
  const icon = condition ? 'PASS' : 'FAIL';
  console.log(`  [${icon}] ${name}${detail ? ` — ${detail}` : ''}`);
}

async function test(name, fn) {
  console.log(`\n▶ ${name}`);
  try {
    await fn();
  } catch (err) {
    assert(name, false, (err instanceof Error ? err.message : String(err)));
  }
}

const TENANT_ID = '11111111-1111-1111-1111-111111111111';
const ORDER_ID = randomUUID();
const BASE_INPUT = {
  tenantId: TENANT_ID,
  orderId: ORDER_ID,
  amount: 1500,
  currency: 'KES',
  metadata: {
    email: 'customer@test.nexora.local',
    phoneNumber: '254712345678',
  },
};

// ── Adapter unit tests (sandbox / unconfigured env) ──────────────────────────
async function runAdapterTests() {
  const { DarajaClient } = require(dist('providers/daraja.client.js'));
  const { StripeClient } = require(dist('providers/stripe.client.js'));
  const { PaystackClient } = require(dist('providers/paystack.client.js'));
  const { FlutterwaveClient } = require(dist('providers/flutterwave.client.js'));
  const { PayPalClient } = require(dist('providers/paypal.client.js'));
  const { MpesaAdapter } = require(dist('providers/adapters/mpesa.adapter.js'));
  const { MpesaB2cAdapter } = require(dist('providers/adapters/mpesa-b2c.adapter.js'));
  const { MpesaC2bAdapter } = require(dist('providers/adapters/mpesa-c2b.adapter.js'));
  const { WiseAdapter } = require(dist('providers/adapters/wise.adapter.js'));
  const { WiseClient } = require(dist('providers/wise.client.js'));
  const { StripeAdapter } = require(dist('providers/adapters/stripe.adapter.js'));
  const { PaystackAdapter } = require(dist('providers/adapters/paystack.adapter.js'));
  const { FlutterwaveAdapter } = require(dist('providers/adapters/flutterwave.adapter.js'));
  const { PayPalAdapter } = require(dist('providers/adapters/paypal.adapter.js'));
  const { BankTransferAdapter } = require(dist('providers/adapters/bank-transfer.adapter.js'));
  const { PaymentProviderRegistry } = require(dist('providers/payment-provider.registry.js'));

  await test('Registry lists all 9 providers', () => {
    const registry = new PaymentProviderRegistry(
      new MpesaAdapter(new DarajaClient(new MockConfig())),
      new MpesaB2cAdapter(new DarajaClient(new MockConfig())),
      new MpesaC2bAdapter(new MockConfig()),
      new StripeAdapter(new StripeClient(new MockConfig())),
      new PaystackAdapter(new PaystackClient(new MockConfig())),
      new FlutterwaveAdapter(new FlutterwaveClient(new MockConfig()), new MockConfig()),
      new PayPalAdapter(new PayPalClient(new MockConfig()), new MockConfig()),
      new WiseAdapter(new WiseClient(new MockConfig())),
      new BankTransferAdapter(new MockConfig()),
    );
    const list = registry.list();
    assert('Has MPESA', list.includes(PaymentProvider.MPESA));
    assert('Has MPESA_B2C', list.includes(PaymentProvider.MPESA_B2C));
    assert('Has MPESA_C2B', list.includes(PaymentProvider.MPESA_C2B));
    assert('Has STRIPE', list.includes(PaymentProvider.STRIPE));
    assert('Has PAYSTACK', list.includes(PaymentProvider.PAYSTACK));
    assert('Has FLUTTERWAVE', list.includes(PaymentProvider.FLUTTERWAVE));
    assert('Has PAYPAL', list.includes(PaymentProvider.PAYPAL));
    assert('Has WISE', list.includes(PaymentProvider.WISE));
    assert('Has BANK_TRANSFER', list.includes(PaymentProvider.BANK_TRANSFER));
    assert('Total count is 9', list.length === 9);
  });

  await test('M-Pesa STK Push (sandbox)', async () => {
    const adapter = new MpesaAdapter(new DarajaClient(new MockConfig()));
    assert('Daraja not configured in dev', !new DarajaClient(new MockConfig()).isConfigured);
    const result = await adapter.initiatePayment(BASE_INPUT);
    assert('Provider is MPESA', result.provider === PaymentProvider.MPESA);
    assert('Status PENDING', result.status === 'PENDING');
    assert('Has external reference', Boolean(result.externalReference));
    assert('Sandbox stub flag', result.raw?.stub === true);
    assert('Includes phone metadata', result.raw?.phoneNumber === '254712345678');
  });

  await test('M-Pesa direct STK adapter path', async () => {
    const adapter = new MpesaAdapter(new DarajaClient(new MockConfig()));
    const result = await adapter.stkPush(
      {
        phoneNumber: '0712345678',
        amount: 500,
        accountReference: ORDER_ID,
        transactionDesc: 'Test',
      },
      TENANT_ID,
    );
    assert('Returns initiate result', result.provider === PaymentProvider.MPESA);
    assert('Status PENDING in sandbox', result.status === 'PENDING');
  });

  await test('Stripe PaymentIntent (sandbox)', async () => {
    const adapter = new StripeAdapter(new StripeClient(new MockConfig()));
    assert('Stripe not configured in dev', !new StripeClient(new MockConfig()).isConfigured);
    const result = await adapter.initiatePayment({ ...BASE_INPUT, currency: 'USD', amount: 49.99 });
    assert('Provider is STRIPE', result.provider === PaymentProvider.STRIPE);
    assert('Status REQUIRES_ACTION', result.status === 'REQUIRES_ACTION');
    assert('Has clientSecret', Boolean(result.clientSecret));
    assert('Sandbox stub', result.raw?.stub === true);
  });

  await test('Stripe webhook handler', async () => {
    const adapter = new StripeAdapter(new StripeClient(new MockConfig()));
    assert('Webhook verify passes when unconfigured', adapter.verifyWebhook({ signature: 'x', rawBody: '{}' }));
    const success = await adapter.handleWebhook(
      { type: 'payment_intent.succeeded', data: { object: { id: 'pi_test_123' } } },
      TENANT_ID,
    );
    assert('Succeeded event maps to COMPLETED', success.paymentStatus === 'COMPLETED');
    assert('Payment ID extracted', success.paymentId === 'pi_test_123');
    const failed = await adapter.handleWebhook(
      { type: 'payment_intent.payment_failed', data: { object: { id: 'pi_fail' } } },
      TENANT_ID,
    );
    assert('Failed event maps to FAILED', failed.paymentStatus === 'FAILED');
  });

  await test('Paystack initialize (sandbox)', async () => {
    const adapter = new PaystackAdapter(new PaystackClient(new MockConfig()));
    const result = await adapter.initiatePayment(BASE_INPUT);
    assert('Provider is PAYSTACK', result.provider === PaymentProvider.PAYSTACK);
    assert('Has redirect URL', Boolean(result.redirectUrl?.includes('paystack')));
    assert('Sandbox stub', result.raw?.stub === true);
  });

  await test('Paystack webhook handler', async () => {
    const adapter = new PaystackAdapter(new PaystackClient(new MockConfig()));
    assert('Verify passes when unconfigured', adapter.verifyWebhook({ signature: 'x', rawBody: '{}' }));
    const success = await adapter.handleWebhook(
      { event: 'charge.success', data: { reference: 'ref_123' } },
      TENANT_ID,
    );
    assert('Success maps to COMPLETED', success.paymentStatus === 'COMPLETED');
    assert('Reference extracted', success.paymentId === 'ref_123');
  });

  await test('Flutterwave payment link (sandbox)', async () => {
    const adapter = new FlutterwaveAdapter(
      new FlutterwaveClient(new MockConfig()),
      new MockConfig(),
    );
    const result = await adapter.initiatePayment(BASE_INPUT);
    assert('Provider is FLUTTERWAVE', result.provider === PaymentProvider.FLUTTERWAVE);
    assert('Has redirect URL', Boolean(result.redirectUrl?.includes('flutterwave')));
    assert('Sandbox stub', result.raw?.stub === true);
  });

  await test('Flutterwave webhook handler', async () => {
    const adapter = new FlutterwaveAdapter(
      new FlutterwaveClient(new MockConfig()),
      new MockConfig(),
    );
    const success = await adapter.handleWebhook(
      { event: 'charge.completed', data: { tx_ref: 'nexora_order_1', status: 'successful' } },
      TENANT_ID,
    );
    assert('Successful charge maps to COMPLETED', success.paymentStatus === 'COMPLETED');
    assert('tx_ref extracted', success.paymentId === 'nexora_order_1');
  });

  await test('PayPal checkout order (sandbox)', async () => {
    const adapter = new PayPalAdapter(
      new PayPalClient(new MockConfig()),
      new MockConfig(),
    );
    const result = await adapter.initiatePayment({ ...BASE_INPUT, currency: 'USD' });
    assert('Provider is PAYPAL', result.provider === PaymentProvider.PAYPAL);
    assert('Status REQUIRES_ACTION', result.status === 'REQUIRES_ACTION');
    assert('Has PayPal redirect', Boolean(result.redirectUrl?.includes('paypal')));
    assert('Sandbox stub', result.raw?.stub === true);
  });

  await test('PayPal webhook handler', async () => {
    const adapter = new PayPalAdapter(
      new PayPalClient(new MockConfig()),
      new MockConfig(),
    );
    const success = await adapter.handleWebhook(
      {
        event_type: 'PAYMENT.CAPTURE.COMPLETED',
        resource: { id: 'CAP-123', supplementary_data: { related_ids: { order_id: 'ORDER-ABC' } } },
      },
      TENANT_ID,
    );
    assert('Capture completed maps to COMPLETED', success.paymentStatus === 'COMPLETED');
    assert('Order id extracted', success.paymentId === 'ORDER-ABC');
  });

  await test('M-Pesa STK callback handler', async () => {
    const adapter = new MpesaAdapter(new DarajaClient(new MockConfig()));
    const success = await adapter.handleWebhook(
      {
        Body: {
          stkCallback: {
            CheckoutRequestID: 'ws_CO_12345678',
            ResultCode: 0,
            ResultDesc: 'Success',
          },
        },
      },
      TENANT_ID,
    );
    assert('ResultCode 0 maps to COMPLETED', success.paymentStatus === 'COMPLETED');
    assert('CheckoutRequestID extracted', success.paymentId === 'ws_CO_12345678');
    const failed = await adapter.handleWebhook(
      {
        Body: {
          stkCallback: {
            CheckoutRequestID: 'ws_CO_fail',
            ResultCode: 1032,
            ResultDesc: 'Cancelled',
          },
        },
      },
      TENANT_ID,
    );
    assert('Non-zero ResultCode maps to FAILED', failed.paymentStatus === 'FAILED');
  });

  await test('Bank transfer instructions', async () => {
    const cfg = new MockConfig({
      BANK_ACCOUNT_NAME: 'Test Merchant',
      BANK_ACCOUNT_NUMBER: '1234567890',
      BANK_NAME: 'KCB Bank',
      BANK_BRANCH_CODE: '100',
    });
    const adapter = new BankTransferAdapter(cfg);
    const result = await adapter.initiatePayment(BASE_INPUT);
    assert('Provider is BANK_TRANSFER', result.provider === PaymentProvider.BANK_TRANSFER);
    assert('Status PENDING', result.status === 'PENDING');
    assert('Has bank details', Boolean(result.raw?.bankDetails?.accountNumber));
    assert('Reference includes order', result.externalReference.includes('BT-'));
    assert('No stub flag (always live)', result.raw?.stub !== true);
    assert('Custom bank name', result.raw?.bankDetails?.bankName === 'KCB Bank');
  });

  await test('Unknown provider throws', () => {
    const registry = new PaymentProviderRegistry(
      new MpesaAdapter(new DarajaClient(new MockConfig())),
      new MpesaB2cAdapter(new DarajaClient(new MockConfig())),
      new MpesaC2bAdapter(new MockConfig()),
      new StripeAdapter(new StripeClient(new MockConfig())),
      new PaystackAdapter(new PaystackClient(new MockConfig())),
      new FlutterwaveAdapter(new FlutterwaveClient(new MockConfig()), new MockConfig()),
      new PayPalAdapter(new PayPalClient(new MockConfig()), new MockConfig()),
      new WiseAdapter(new WiseClient(new MockConfig())),
      new BankTransferAdapter(new MockConfig()),
    );
    let threw = false;
    try {
      registry.get('INVALID');
    } catch {
      threw = true;
    }
    assert('Unregistered provider throws', threw);
  });
}

// ── HTTP integration tests (optional) ───────────────────────────────────────
async function runHttpTests() {
  const gateway = process.env.API_URL ?? 'http://localhost:3000';
  const paymentDirect = process.env.PAYMENT_SERVICE_URL ?? 'http://localhost:3005';
  const tenantId = process.env.TENANT_ID ?? TENANT_ID;

  async function reachable(url) {
    try {
      const res = await fetch(`${url}/health`, { signal: AbortSignal.timeout(3000) });
      return res.ok;
    } catch {
      return false;
    }
  }

  const gatewayUp = await reachable(gateway);
  const paymentUp = await reachable(paymentDirect);

  if (!gatewayUp && !paymentUp) {
    console.log('\n⚠ HTTP tests skipped — start services with: pnpm docker:up && pnpm dev:core');
    return;
  }

  const base = gatewayUp ? `${gateway}/api/v1` : `${paymentDirect}/api/v1`;
  const headers = {
    'Content-Type': 'application/json',
    'x-tenant-id': tenantId,
  };

  await test('GET /providers', async () => {
    const res = await fetch(`${base}/providers`, { headers });
    assert('Status 200', res.status === 200, `got ${res.status}`);
    const data = await res.json();
    assert('Returns providers array', Array.isArray(data.providers));
    assert('Includes MPESA', data.providers.includes('MPESA'));
    assert('Includes STRIPE', data.providers.includes('STRIPE'));
  });

  const providers = ['MPESA', 'STRIPE', 'PAYSTACK', 'FLUTTERWAVE', 'PAYPAL', 'BANK_TRANSFER'];

  for (const provider of providers) {
    await test(`POST /payments — ${provider}`, async () => {
      const orderId = randomUUID();
      const body = {
        provider,
        orderId,
        amount: provider === 'STRIPE' || provider === 'PAYPAL' ? 29.99 : 1500,
        currency: provider === 'STRIPE' || provider === 'PAYPAL' ? 'USD' : 'KES',
        metadata: {
          email: 'test@nexora.local',
          phoneNumber: '254712345678',
        },
      };
      const res = await fetch(`${base}/payments`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });
      assert('Status 201 or 200', res.status === 201 || res.status === 200, `got ${res.status}`);
      if (!res.ok) {
        const err = await res.text();
        assert('Response body', false, err.slice(0, 200));
        return;
      }
      const data = await res.json();
      assert('Has payment record', Boolean(data.payment?.id));
      assert('Provider matches', data.payment?.provider === provider);
      assert('Has providerResult', Boolean(data.providerResult));
    });
  }

  await test('POST /payments/mpesa/stk-push', async () => {
    const res = await fetch(`${base}/payments/mpesa/stk-push`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        phoneNumber: '254712345678',
        amount: 100,
        accountReference: randomUUID(),
        transactionDesc: 'Gateway test',
      }),
    });
    assert('STK endpoint responds', res.status === 201 || res.status === 200, `got ${res.status}`);
  });

  await test('POST /webhooks/STRIPE/:tenantId', async () => {
    const res = await fetch(`${base}/webhooks/STRIPE/${tenantId}`, {
      method: 'POST',
      headers: { ...headers, 'stripe-signature': 'test_sig' },
      body: JSON.stringify({
        type: 'payment_intent.succeeded',
        data: { object: { id: 'pi_gateway_test' } },
      }),
    });
    assert('Webhook accepted', res.status === 201 || res.status === 200, `got ${res.status}`);
    const data = await res.json();
    assert('Webhook received flag', data.received === true);
  });

  const webhookCases = [
    {
      provider: 'PAYSTACK',
      header: { 'x-paystack-signature': 'dev_sig' },
      body: { event: 'charge.success', data: { reference: 'paystack_ref_test' } },
    },
    {
      provider: 'FLUTTERWAVE',
      header: { 'verif-hash': 'dev_hash' },
      body: { event: 'charge.completed', data: { tx_ref: 'flw_ref_test', status: 'successful' } },
    },
    {
      provider: 'PAYPAL',
      header: { 'x-signature': 'dev_sig' },
      body: {
        event_type: 'PAYMENT.CAPTURE.COMPLETED',
        resource: { id: 'CAP-1', supplementary_data: { related_ids: { order_id: 'paypal_order_test' } } },
      },
    },
    {
      provider: 'MPESA',
      header: {},
      body: {
        Body: {
          stkCallback: {
            CheckoutRequestID: 'ws_CO_http_test',
            ResultCode: 0,
            ResultDesc: 'Success',
          },
        },
      },
    },
  ];

  for (const { provider, header, body } of webhookCases) {
    await test(`POST /webhooks/${provider}/:tenantId`, async () => {
      const res = await fetch(`${base}/webhooks/${provider}/${tenantId}`, {
        method: 'POST',
        headers: { ...headers, ...header },
        body: JSON.stringify(body),
      });
      assert('Webhook accepted', res.status === 201 || res.status === 200, `got ${res.status}`);
      const data = await res.json();
      assert('Received flag', data.received === true);
    });
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────
console.log('═══════════════════════════════════════════════════════════');
console.log('  NEXORA COMMERCE — Payment Gateway Test Suite');
console.log('═══════════════════════════════════════════════════════════');

await runAdapterTests();

if (process.argv.includes('--http')) {
  await runHttpTests();
}

const passed = results.filter((r) => r.pass).length;
const failed = results.filter((r) => !r.pass).length;

console.log('\n═══════════════════════════════════════════════════════════');
console.log(`  Results: ${passed} passed, ${failed} failed (${results.length} total)`);
console.log('═══════════════════════════════════════════════════════════');

if (failed > 0) process.exit(1);
