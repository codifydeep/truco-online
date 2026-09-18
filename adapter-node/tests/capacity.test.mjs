import {test} from 'node:test';
import assert from 'node:assert/strict';
import {capacity} from '../src/app.mjs';

test('capacity(1) accepts the sole in-range integer', () => {
  assert.equal(capacity(1), true);
});

test('capacity(2) rejects n outside the open interval (0,2)', () => {
  assert.equal(capacity(2), false);
});

test('capacity(0) rejects a zero capacity', () => {
  assert.equal(capacity(0), false);
});
