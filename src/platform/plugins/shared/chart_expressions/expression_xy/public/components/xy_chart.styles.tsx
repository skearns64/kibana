/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import React from 'react';
import { css, Global } from '@emotion/react';

export const GlobalXYChartStyles = () => {
  return (
    <Global
      styles={css`
        .echAnnotation {
          max-width: 500px !important;
        }

        /* Override Elastic Charts tooltip table max-height which miscalculates
           row heights, causing the last visible row to be partially clipped.
           The maxTooltipItems setting already collapses the tooltip when there
           are too many items, so this height constraint is unnecessary. */
        .echTooltip__tableWrapper {
          max-height: none !important;
        }
      `}
    />
  );
};
