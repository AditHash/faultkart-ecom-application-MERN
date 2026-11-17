import test from 'node:test';
import assert from 'node:assert/strict';
import { demoProducts } from '../src/seed-data.js';

test('marketplace has varied catalog of real merchandise departments', () => {
  assert.ok(demoProducts.length >= 24);
  assert.ok(new Set(demoProducts.map(p => p.category)).size >= 6);
  assert.equal(new Set(demoProducts.map(p => p.sku)).size, demoProducts.length);
});
test('merchandise has image, pricing and brand metadata', () => {
  for (const product of demoProducts) {
    assert.ok(product.name && product.brand && product.description);
    assert.ok(product.price > 0 && product.mrp >= product.price);
    assert.ok(product.image.startsWith('https://images.unsplash.com/'));
    assert.ok(product.rating >= 1 && product.rating <= 5);
    assert.ok(Array.isArray(product.features) && product.features.length >= 2);
  }
});
