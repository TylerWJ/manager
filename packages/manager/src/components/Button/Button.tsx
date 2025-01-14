import * as React from 'react';
import Reload from 'src/assets/icons/reload.svg';
import _Button, { ButtonProps as _ButtonProps } from '@mui/material/Button';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { useTheme, styled, Theme } from '@mui/material/styles';
import { SxProps } from '@mui/system';
import { isPropValid } from '../../utilities/isPropValid';
import { rotate360 } from '../../styles/keyframes';

export type ButtonType = 'primary' | 'secondary' | 'outlined';

export interface ButtonProps extends _ButtonProps {
  /**
   * The button variant to render
   * * @default 'secondary'
   * */
  buttonType?: ButtonType;
  /** Additional css class to pass to the component */
  className?: string;
  /** The `sx` prop can be either object or function */
  sx?: SxProps<Theme>;
  /**
   * Reduce the padding on the x-axis
   * @default false
   */
  compactX?: boolean;
  /**
   * Reduce the padding on the y-axis
   * @default false
   */
  compactY?: boolean;
  /**
   * Show a loading indicator
   * @default false
   */
  loading?: boolean;
  /** Tooltip text */
  tooltipText?: string;
  /** Tooltip analytics event */
  tooltipAnalyticsEvent?: () => void;
}

const StyledButton = styled(_Button, {
  shouldForwardProp: (prop) =>
    isPropValid(['compactX', 'compactY', 'loading', 'buttonType'], prop),
})<ButtonProps>(({ theme, ...props }) => ({
  ...(props.buttonType === 'secondary' && {
    color: theme.textColors.linkActiveLight,
  }),
  ...(props.compactX && {
    minWidth: 50,
    paddingRight: 0,
    paddingLeft: 0,
  }),
  ...(props.compactY && {
    minHeight: 20,
    paddingTop: 0,
    paddingBottom: 0,
  }),
  ...(props.loading && {
    '& svg': {
      animation: `${rotate360} 2s linear infinite`,
      margin: '0 auto',
      height: `${theme.spacing(2)}`,
      width: `${theme.spacing(2)}`,
    },
    '&:disabled': {
      backgroundColor:
        props.buttonType === 'primary' && theme.palette.text.primary,
    },
  }),
}));

const Span = styled('span')({
  display: 'flex',
  alignItems: 'center',
  '@supports (-moz-appearance: none)': {
    /* Fix text alignment for Firefox */
    marginTop: 2,
  },
});

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      // default to secondary as some components never define a buttonType (usually buttons with icons)
      // and we end up with the wrong styles (purple color, see #6455)
      // It would be nice to remove this default and require the prop but this fixes the issue for now.
      buttonType = 'secondary',
      children,
      className,
      compactX,
      compactY,
      disabled,
      loading,
      sx,
      tooltipText,
      tooltipAnalyticsEvent,
      ...rest
    },
    ref
  ) => {
    const theme = useTheme();
    const color = buttonType === 'primary' ? 'primary' : 'secondary';
    const sxTooltipIcon = { marginLeft: `-${theme.spacing()}` };

    const variant =
      buttonType === 'primary' || buttonType === 'secondary'
        ? 'contained'
        : buttonType === 'outlined'
        ? 'outlined'
        : 'text';

    return (
      <React.Fragment>
        <StyledButton
          {...rest}
          buttonType={buttonType}
          className={className}
          color={color}
          compactX={compactX}
          compactY={compactY}
          disabled={disabled || loading}
          loading={loading}
          sx={sx}
          variant={variant}
          ref={ref}
        >
          <Span data-testid="loadingIcon">
            {loading ? <Reload /> : children}
          </Span>
        </StyledButton>
        {tooltipText && (
          <TooltipIcon
            sxTooltipIcon={sxTooltipIcon}
            text={tooltipText}
            tooltipAnalyticsEvent={tooltipAnalyticsEvent}
            status="help"
          />
        )}
      </React.Fragment>
    );
  }
);
