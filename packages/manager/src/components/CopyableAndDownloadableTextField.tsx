import * as React from 'react';
import snakeCase from 'lodash/snakeCase';
import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { DownloadTooltip } from 'src/components/DownloadTooltip';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import { TextField, TextFieldProps } from 'src/components/TextField';

const useStyles = makeStyles((theme: Theme) => ({
  removeDisabledStyles: {
    '&.Mui-disabled': {
      borderColor: theme.name === 'light' ? '#ccc' : '#222',
      color: theme.name === 'light' ? 'inherit' : '#fff !important',
      background: theme.bg.main,
      opacity: 1,
    },
  },
  copyIcon: {
    marginRight: theme.spacing(0.5),
    '& svg': {
      height: 14,
      top: 1,
    },
  },
}));

type CombinedProps = TextFieldProps & {
  className?: string;
  hideIcon?: boolean;
  fileName?: string;
};

export const CopyableAndDownloadableTextField: React.FC<CombinedProps> = (
  props
) => {
  const classes = useStyles();
  const { value, className, hideIcon, ...restProps } = props;

  const fileName = props.fileName ?? snakeCase(props.label);

  return (
    <TextField
      value={value}
      {...restProps}
      className={`${className} ${classes.removeDisabledStyles}`}
      disabled
      InputProps={{
        endAdornment: hideIcon ? undefined : (
          <>
            <DownloadTooltip
              text={`${value}`}
              className={classes.copyIcon}
              fileName={fileName}
            />
            <CopyTooltip text={`${value}`} className={classes.copyIcon} />
          </>
        ),
      }}
      data-qa-copy-tooltip
    />
  );
};

export default CopyableAndDownloadableTextField;
