/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import type { TooltipSpec } from '@elastic/charts';
import {
  TooltipTableBody,
  TooltipTableCell,
  TooltipTableColorCell,
  TooltipTableRow,
} from '@elastic/charts';
import React from 'react';
import { useEuiTheme } from '@elastic/eui';

const MAX_VISIBLE_ITEMS = 10;

// 11px matches COLOR_STRIP_CHECK_WIDTH used by the default Elastic Charts tooltip grid.
const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '11px 1fr auto',
  width: '100%',
};

export const TooltipCappedBody: TooltipSpec['body'] = ({ items }) => {
  const { euiTheme } = useEuiTheme();

  // When an individual series is highlighted (e.g. legend hover) and there are
  // more items than the cap, show only the highlighted item — matching the
  // default Elastic Charts behaviour for truncated tooltips.
  const highlightedItem =
    items.length > MAX_VISIBLE_ITEMS ? items.find((item) => item.isHighlighted) : undefined;

  const displayItems = highlightedItem ? [highlightedItem] : items;
  const showMore = !highlightedItem && displayItems.length > MAX_VISIBLE_ITEMS;
  const visibleItems = showMore ? displayItems.slice(0, MAX_VISIBLE_ITEMS) : displayItems;
  const remaining = items.length - MAX_VISIBLE_ITEMS;

  return (
    <div style={gridStyle}>
      <TooltipTableBody>
        {visibleItems.map((item) => (
          <TooltipTableRow key={item.seriesIdentifier.key} isHighlighted={item.isHighlighted}>
            <TooltipTableColorCell color={item.color} />
            <TooltipTableCell truncate>{item.label}</TooltipTableCell>
            <TooltipTableCell style={{ textAlign: 'right' }}>
              {item.formattedValue}
            </TooltipTableCell>
          </TooltipTableRow>
        ))}
        {showMore && (
          <TooltipTableRow>
            <TooltipTableColorCell />
            <TooltipTableCell
              style={{ color: euiTheme.colors.textSubdued, fontStyle: 'italic' }}
            >
              … and {remaining} more
            </TooltipTableCell>
            <TooltipTableCell />
          </TooltipTableRow>
        )}
      </TooltipTableBody>
    </div>
  );
};
