'use strict';

const test = require('node:test');
const { renderTable, assertPdfContains } = require('./helpers');

test('table with Table.data (object rows) renders PDF', async () => {
  const buf = await renderTable({
    headers: [
      { label: 'Name', property: 'name', width: 120 },
      { label: 'Qty', property: 'qty', width: 60 },
    ],
    data: [
      { name: 'Alpha', qty: 1 },
      { name: 'Beta', qty: 2 },
    ],
  });
  assertPdfContains(buf, 'Alpha');
  assertPdfContains(buf, 'Beta');
});
