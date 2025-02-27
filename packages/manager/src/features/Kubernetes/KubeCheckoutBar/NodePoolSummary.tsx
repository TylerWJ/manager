import Close from '@mui/icons-material/Close';
import * as React from 'react';
import { Box } from 'src/components/Box';
import { Divider } from 'src/components/Divider';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import { Typography } from 'src/components/Typography';
import { DisplayPrice } from 'src/components/DisplayPrice';
import { EnhancedNumberInput } from 'src/components/EnhancedNumberInput/EnhancedNumberInput';
import { IconButton } from 'src/components/IconButton';
import { ExtendedType } from 'src/utilities/extendType';
import { pluralize } from 'src/utilities/pluralize';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    '& $textField': {
      width: 53,
    },
  },
  typeHeader: {
    fontSize: '16px',
    fontWeight: 600,
    paddingBottom: theme.spacing(0.5),
  },
  typeSubheader: {
    fontSize: '14px',
  },
  button: {
    alignItems: 'flex-start',
    color: '#979797',
    marginTop: -4,
    padding: 0,
    '&:hover': {
      color: '#6e6e6e',
    },
  },
  numberInput: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1.5),
  },
  price: {
    '& h3': {
      color: `${theme.palette.text.primary} !important`,
      fontFamily: '"LatoWebRegular", sans-serif',
    },
  },
}));

export interface Props {
  nodeCount: number;
  poolType: ExtendedType | null;
  price: number;
  updateNodeCount: (count: number) => void;
  onRemove: () => void;
}

export const NodePoolSummary: React.FC<Props> = (props) => {
  const classes = useStyles();
  const { nodeCount, onRemove, poolType, price, updateNodeCount } = props;

  // This should never happen but TS wants us to account for the situation
  // where we fail to match a selected type against our types list.
  if (poolType === null) {
    return null;
  }

  return (
    <>
      <Divider dark spacingTop={24} spacingBottom={12} />
      <Box
        display="flex"
        flexDirection="column"
        data-testid="node-pool-summary"
        className={classes.root}
      >
        <Box display="flex" justifyContent="space-between">
          <div>
            <Typography className={classes.typeHeader}>
              {poolType.formattedLabel} Plan
            </Typography>
            <Typography className={classes.typeSubheader}>
              {pluralize('CPU', 'CPUs', poolType.vcpus)}, {poolType.disk / 1024}{' '}
              GB Storage
            </Typography>
          </div>
          <IconButton
            className={classes.button}
            onClick={onRemove}
            data-testid="remove-pool-button"
            title={`Remove ${poolType.label} Node Pool`}
            size="large"
          >
            <Close />
          </IconButton>
        </Box>
        <div className={classes.numberInput}>
          <EnhancedNumberInput
            value={nodeCount}
            setValue={updateNodeCount}
            min={1}
          />
        </div>
        <div className={classes.price}>
          <DisplayPrice price={price} fontSize="14px" interval="month" />
        </div>
      </Box>
    </>
  );
};

export default React.memo(NodePoolSummary);
