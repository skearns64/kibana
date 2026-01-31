/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import React from 'react';
import { shallow } from 'enzyme';
import type { XYChartSeriesIdentifier } from '@elastic/charts';
import type { FieldFormat, FormatFactory } from '@kbn/field-formats-plugin/common';
import type { LayersFieldFormats } from '../../helpers';
import { generateSeriesId } from '../../helpers';
import { sampleLayer } from '../../../common/test_utils';
import { getTooltipFooterComponent } from './tooltip_stacked_footer';

const layerId = 'first';
const xAccessor = 'c';
const yAccessor = 'a';

const makeSeriesIdentifier = (overrides?: Partial<XYChartSeriesIdentifier>): XYChartSeriesIdentifier => ({
  specId: generateSeriesId({ layerId }, [], yAccessor, xAccessor),
  xAccessor,
  yAccessor,
  splitAccessors: new Map(),
  seriesKeys: [],
  key: '1',
  ...overrides,
});

const makeItem = (value: number, overrides?: Record<string, unknown>) => ({
  value,
  formattedValue: `${value}`,
  label: `Series ${value}`,
  color: '#000',
  isHighlighted: false,
  isVisible: true,
  seriesIdentifier: makeSeriesIdentifier(),
  ...overrides,
});

const fieldFormats: LayersFieldFormats = {
  [layerId]: {
    xAccessors: { [xAccessor]: { id: 'number' } },
    yAccessors: { [yAccessor]: { id: 'number' } },
    splitSeriesAccessors: {},
  },
};

const formatFactory: FormatFactory = (format) =>
  ({
    convert: (value: unknown) => `formatted-${format?.id}-${value}`,
  } as FieldFormat);

describe('getTooltipFooterComponent', () => {
  it('returns "default" when no layers are stacked', () => {
    const result = getTooltipFooterComponent({
      dataLayers: [sampleLayer],
      fieldFormats,
      formatFactory,
    });
    expect(result).toBe('default');
  });

  it('returns "default" when stacked layers are percentage mode', () => {
    const result = getTooltipFooterComponent({
      dataLayers: [{ ...sampleLayer, isStacked: true, isPercentage: true }],
      fieldFormats,
      formatFactory,
    });
    expect(result).toBe('default');
  });

  it('returns a component when a layer is stacked and not percentage', () => {
    const result = getTooltipFooterComponent({
      dataLayers: [{ ...sampleLayer, isStacked: true, isPercentage: false }],
      fieldFormats,
      formatFactory,
    });
    expect(typeof result).toBe('function');
  });

  describe('TooltipStackedFooter component', () => {
    const stackedLayer = { ...sampleLayer, isStacked: true, isPercentage: false };

    const getFooter = () =>
      getTooltipFooterComponent({
        dataLayers: [stackedLayer],
        fieldFormats,
        formatFactory,
      });

    it('renders hidden span when fewer than 2 items', () => {
      const Footer = getFooter();
      if (typeof Footer === 'string') throw new Error('Expected component');
      const wrapper = shallow(<Footer items={[makeItem(10)]} header={null} />);
      expect(wrapper.find('span[style]').exists()).toBe(true);
      expect(wrapper.text()).not.toContain('Total');
    });

    it('renders total for multiple items', () => {
      const Footer = getFooter();
      if (typeof Footer === 'string') throw new Error('Expected component');
      const wrapper = shallow(
        <Footer items={[makeItem(10), makeItem(20), makeItem(30)]} header={null} />
      );
      expect(wrapper.text()).toContain('Total');
      expect(wrapper.text()).toContain('formatted-number-60');
    });

    it('includes non-visible items in total', () => {
      const Footer = getFooter();
      if (typeof Footer === 'string') throw new Error('Expected component');
      const wrapper = shallow(
        <Footer
          items={[makeItem(10), makeItem(20), makeItem(100, { isVisible: false })]}
          header={null}
        />
      );
      expect(wrapper.text()).toContain('formatted-number-130');
    });

    it('renders hidden span when values are not numeric', () => {
      const Footer = getFooter();
      if (typeof Footer === 'string') throw new Error('Expected component');
      const wrapper = shallow(
        <Footer
          items={[makeItem(10), { ...makeItem(0), value: 'not-a-number' as any }]}
          header={null}
        />
      );
      expect(wrapper.find('span[style]').exists()).toBe(true);
      expect(wrapper.text()).not.toContain('Total');
    });
  });
});
