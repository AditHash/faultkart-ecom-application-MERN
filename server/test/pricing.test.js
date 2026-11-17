import test from 'node:test';
import assert from 'node:assert/strict';
import { summarizeCart } from '../src/pricing.js';
test('computes subtotal', () => {
  assert.equal(summarizeCart([{ price: 100, quantity: 2 }, { price: 50, quantity: 1 }]).subtotal, 250);
});
test('percentage coupon', () => {
  assert.equal(summarizeCart([{ price: 200, quantity: 1 }], 'SAVE10').total, 180);
});
