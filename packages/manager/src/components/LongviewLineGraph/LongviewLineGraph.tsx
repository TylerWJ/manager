import * as React from 'react';
import { Divider } from 'src/components/Divider';
import { makeStyles } from 'tss-react/mui';
import { Theme } from '@mui/material/styles';
import { Typography } from 'src/components/Typography';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import {
  DataSet,
  LineGraph,
  LineGraphProps,
} from 'src/components/LineGraph/LineGraph';

const useStyles = makeStyles()((theme: Theme) => ({
  title: {
    color: theme.color.headline,
    fontWeight: 'bold',
    fontSize: '1rem',
    '& > span': {
      color: theme.palette.text.primary,
    },
  },
  message: {
    position: 'absolute',
    left: '50%',
    top: '45%',
    transform: 'translate(-50%, -50%)',
  },
}));

export interface LongViewLineGraphProps extends LineGraphProps {
  title: string;
  subtitle?: string;
  error?: string;
  loading?: boolean;
  ariaLabel?: string;
}

export const LongviewLineGraph = React.memo((props: LongViewLineGraphProps) => {
  const { classes } = useStyles();

  const { error, loading, title, subtitle, ariaLabel, ...rest } = props;

  const message = error // Error state is separate, don't want to put text on top of it
    ? undefined
    : loading // Loading takes precedence over empty data
    ? 'Loading data...'
    : isDataEmpty(props.data)
    ? 'No data to display'
    : undefined;

  return (
    <React.Fragment>
      <Typography className={classes.title} variant="body1">
        {title}
        {subtitle && (
          <React.Fragment>
            &nbsp;<span>({subtitle})</span>
          </React.Fragment>
        )}
      </Typography>
      <Divider spacingTop={16} spacingBottom={16} />
      <div style={{ position: 'relative' }}>
        {error ? (
          <div style={{ height: props.chartHeight || '300px' }}>
            <ErrorState errorText={error} />
          </div>
        ) : (
          <LineGraph {...rest} ariaLabel={ariaLabel} />
        )}
        {message && <div className={classes.message}>{message}</div>}
      </div>
    </React.Fragment>
  );
});

export const isDataEmpty = (data: DataSet[]) => {
  return data.every(
    (thisSeries) =>
      thisSeries.data.length === 0 ||
      // If we've padded the data, every y value will be null
      thisSeries.data.every((thisPoint) => thisPoint[1] === null)
  );
};
