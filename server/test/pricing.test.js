import test from 'node:test';
import assert from 'node:assert/strict';
import { summarizeCart } from '../src/pricing.js';

test('computes subtotal accurately', () => {
  assert.equal(summarizeCart([{ price: 100, quantity: 2 }, { price: 50, quantity: 1 }]).subtotal, 250);
});

test('percentage coupon SAVE10 applies 10% discount', () => {
  assert.equal(summarizeCart([{ price: 200, quantity: 1 }], 'SAVE10').total, 180);
});

test('FK-103: FLAT100 does not allow negative totals when subtotal < 100', () => {
  const result = summarizeCart([{ price: 40, quantity: 1 }], 'FLAT100');
  assert.equal(result.subtotal, 40);
  assert.equal(result.discount, 40);
  assert.equal(result.total, 0);
  assert.ok(result.total >= 0, 'Total should never be negative');
});

test('FK-109: Malformed or non-string coupons do not crash server', () => {
  assert.doesNotThrow(() => summarizeCart([{ price: 50, quantity: 1 }], null));
  assert.doesNotThrow(() => summarizeCart([{ price: 50, quantity: 1 }], undefined));
  assert.doesNotThrow(() => summarizeCart([{ price: 50, quantity: 1 }], 12345));
  assert.doesNotThrow(() => summarizeCart([{ price: 50, quantity: 1 }], { code: 'SAVE10' }));
});
