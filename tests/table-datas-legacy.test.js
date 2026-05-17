'use strict';

const test = require('node:test');
const assert = require('node:assert');
const { renderTable, assertPdfContains, pdfText } = require('./helpers');

test('legacy Table.datas still works when data is omitted', async () => {
  const buf = await renderTable({
    headers: [{ label: 'SKU', property: 'sku', width: 100 }],
    datas: [{ sku: 'LEGACY-123' }],
  });
  assertPdfContains(buf, 'LEGACY-123');
});

test('Table.data wins over datas when both exist', async () => {
  const buf = await renderTable({
    headers: [{ label: 'X', property: 'x', width: 80 }],
    data: [{ x: 'from-data' }],
    datas: [{ x: 'from-datas' }],
  });
  const text = pdfText(buf);
  assert.ok(text.includes('from-data'));
  assert.ok(!text.includes('from-datas'));
});
