import React from 'react';
import { default as _Tooltip } from '@mui/material/Tooltip';
import type { TooltipProps } from '@mui/material/Tooltip';

/**
 * Tooltips display informative text when users hover over, focus on, or tap an element.
 */
export const Tooltip = (props: TooltipProps) => {
  return <_Tooltip {...props} />;
};

export type { TooltipProps };
