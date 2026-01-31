/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import React from 'react';
import { mount } from 'enzyme';
import type { XYChartSeriesIdentifier } from '@elastic/charts';
import {
  TooltipTableRow,
  TooltipTableCell,
  TooltipTableColorCell,
} from '@elastic/charts';
import { EuiThemeProvider } from '@elastic/eui';
import { TooltipCappedBody } from './tooltip_capped_body';

const makeItem = (index: number, overrides?: Record<string, unknown>) => ({
  value: index,
  formattedValue: `Value ${index}`,
  label: `Series ${index}`,
  color: `#${String(index).padStart(3, '0')}`,
  isHighlighted: false,
  isVisible: true,
  seriesIdentifier: {
    specId: `spec-${index}`,
    xAccessor: 'x',
    yAccessor: 'y',
    splitAccessors: new Map(),
    seriesKeys: [],
    key: `key-${index}`,
  } as XYChartSeriesIdentifier,
  ...overrides,
});

const makeItems = (count: number) => Array.from({ length: count }, (_, i) => makeItem(i + 1));

const renderBody = (items: ReturnType<typeof makeItem>[]) => {
  const Body = TooltipCappedBody;
  return mount(
    <EuiThemeProvider>
      <Body items={items} />
    </EuiThemeProvider>
  );
};

describe('TooltipCappedBody', () => {
  it('renders all items when count is 10 or fewer', () => {
    const wrapper = renderBody(makeItems(10));
    expect(wrapper.find(TooltipTableRow)).toHaveLength(10);
    expect(wrapper.text()).not.toContain('more');
  });

  it('renders 10 items plus "more" row when count exceeds 10', () => {
    const wrapper = renderBody(makeItems(15));
    // 10 visible items + 1 "more" row
    expect(wrapper.find(TooltipTableRow)).toHaveLength(11);
    expect(wrapper.text()).toContain('… and 5 more');
  });

  it('renders exactly 11 items with "more" indicator for 1 remaining', () => {
    const wrapper = renderBody(makeItems(11));
    expect(wrapper.find(TooltipTableRow)).toHaveLength(11);
    expect(wrapper.text()).toContain('… and 1 more');
  });

  it('preserves isHighlighted on visible rows', () => {
    const items = makeItems(5);
    items[2] = makeItem(3, { isHighlighted: true });
    const wrapper = renderBody(items);
    const rows = wrapper.find(TooltipTableRow);
    expect(rows.at(2).prop('isHighlighted')).toBe(true);
    expect(rows.at(0).prop('isHighlighted')).toBe(false);
  });

  it('uses a plain grid div with 11px color column matching default tooltip', () => {
    const wrapper = renderBody(makeItems(3));
    const gridDiv = wrapper.find('div').filterWhere(
      (n) => n.prop('style')?.display === 'grid'
    );
    expect(gridDiv).toHaveLength(1);
    expect(gridDiv.prop('style')).toMatchObject({
      display: 'grid',
      gridTemplateColumns: '11px 1fr auto',
    });
  });

  it('renders color cells with correct colors', () => {
    const wrapper = renderBody(makeItems(3));
    const colorCells = wrapper.find(TooltipTableColorCell);
    expect(colorCells.at(0).prop('color')).toBe('#001');
    expect(colorCells.at(1).prop('color')).toBe('#002');
    expect(colorCells.at(2).prop('color')).toBe('#003');
  });

  it('renders labels and formatted values', () => {
    const wrapper = renderBody(makeItems(2));
    const cells = wrapper.find(TooltipTableCell);
    // Each row has 2 cells (label + value), so 4 total
    expect(cells.at(0).text()).toBe('Series 1');
    expect(cells.at(1).text()).toBe('Value 1');
    expect(cells.at(2).text()).toBe('Series 2');
    expect(cells.at(3).text()).toBe('Value 2');
  });

  it('shows only the highlighted item when count exceeds 10 and one is highlighted', () => {
    const items = makeItems(15);
    items[5] = makeItem(6, { isHighlighted: true });
    const wrapper = renderBody(items);
    const rows = wrapper.find(TooltipTableRow);
    expect(rows).toHaveLength(1);
    expect(wrapper.text()).toContain('Series 6');
    expect(wrapper.text()).toContain('Value 6');
    expect(wrapper.text()).not.toContain('more');
  });

  it('shows capped list when count exceeds 10 and none is highlighted', () => {
    const wrapper = renderBody(makeItems(13));
    const rows = wrapper.find(TooltipTableRow);
    // 10 visible + 1 "more" row
    expect(rows).toHaveLength(11);
    expect(wrapper.text()).toContain('… and 3 more');
  });

  it('does not collapse to highlighted item when count is 10 or fewer', () => {
    const items = makeItems(10);
    items[3] = makeItem(4, { isHighlighted: true });
    const wrapper = renderBody(items);
    const rows = wrapper.find(TooltipTableRow);
    expect(rows).toHaveLength(10);
  });
});
