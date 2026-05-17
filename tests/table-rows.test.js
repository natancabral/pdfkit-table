'use strict';

const test = require('node:test');
const { renderTable, assertPdfContains } = require('./helpers');

test('table with headers + rows array renders PDF', async () => {
  const buf = await renderTable(
    {
      headers: ['Country', 'Rate'],
      rows: [
        ['CH', '12%'],
        ['FR', '67%'],
      ],
    },
    {}
  );
  assertPdfContains(buf, 'CH');
});
