/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import type { ComponentType } from 'react';
import React, { useCallback } from 'react';
import type { TooltipValue, XYChartSeriesIdentifier } from '@elastic/charts';
import { css } from '@emotion/react';
import { i18n } from '@kbn/i18n';
import type { FormatFactory } from '@kbn/field-formats-plugin/common';
import type { CommonXYDataLayerConfig } from '../../../common';
import type { LayersFieldFormats } from '../../helpers';
import { getMetaFromSeriesId } from '../../helpers';

interface TooltipStackedFooterFactoryArgs {
  dataLayers: CommonXYDataLayerConfig[];
  fieldFormats: LayersFieldFormats;
  formatFactory: FormatFactory;
}

/**
 * Creates a tooltip footer component that shows a total for stacked charts.
 * Returns 'none' if no layers are stacked or if all stacked layers use percentage mode.
 */
export function getTooltipFooterComponent({
  dataLayers,
  fieldFormats,
  formatFactory,
}: TooltipStackedFooterFactoryArgs):
  | 'default'
  | ComponentType<{
      items: TooltipValue<Record<string, string | number>, XYChartSeriesIdentifier>[];
    }> {
  const hasStacked = dataLayers.some((layer) => layer.isStacked && !layer.isPercentage);
  if (!hasStacked) {
    return 'default';
  }

  const TooltipStackedFooter: ComponentType<{
    items: TooltipValue<Record<string, string | number>, XYChartSeriesIdentifier>[];
  }> = ({ items }) => {
    // When Elastic Charts truncates the tooltip (maxTooltipItems), items is
    // replaced with only the highlighted values. Hide the footer wrapper and
    // preceding divider that Elastic Charts always renders around this component.
    const hideParentRef = useCallback((el: HTMLElement | null) => {
      if (!el) return;
      const footerWrapper = el.closest('.echTooltipFooter');
      if (footerWrapper instanceof HTMLElement) {
        footerWrapper.style.display = 'none';
        const prev = footerWrapper.previousElementSibling;
        if (prev instanceof HTMLElement && prev.classList.contains('echTooltipDivider')) {
          prev.style.display = 'none';
        }
      }
    }, []);

    if (items.length < 2) {
      return <span ref={hideParentRef} style={{ display: 'none' }} />;
    }

    let total = 0;
    for (const item of items) {
      const numValue = typeof item.value === 'number' ? item.value : Number(item.value);
      if (isNaN(numValue)) {
        return <span ref={hideParentRef} style={{ display: 'none' }} />;
      }
      total += numValue;
    }

    // Use the formatter from the first item's y-accessor
    const firstItem = items[0];
    const { layerId, yAccessors } = getMetaFromSeriesId(firstItem.seriesIdentifier.specId);
    const layerFormats = fieldFormats[layerId];
    const yAccessor = yAccessors.find(
      (a) => a === (firstItem.seriesIdentifier.yAccessor as string)
    );
    const formatId = yAccessor && layerFormats?.yAccessors?.[yAccessor];
    const formatter = formatId ? formatFactory(formatId) : undefined;
    const formattedTotal = formatter ? formatter.convert(total) : `${total}`;

    const totalLabel = i18n.translate('expressionXY.tooltip.totalLabel', {
      defaultMessage: 'Total',
    });

    return (
      <div
        css={({ euiTheme }) => css`
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          font-weight: ${euiTheme.font.weight.semiBold};
        `}
      >
        <span>{totalLabel}</span>
        <span
          css={css`
            margin-left: 16px;
          `}
        >
          {formattedTotal}
        </span>
      </div>
    );
  };

  return TooltipStackedFooter;
}
