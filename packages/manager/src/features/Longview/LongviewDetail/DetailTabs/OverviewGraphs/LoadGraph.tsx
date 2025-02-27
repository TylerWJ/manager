import * as React from 'react';
import { withTheme, WithTheme } from '@mui/styles';
import { LongviewLineGraph } from 'src/components/LongviewLineGraph/LongviewLineGraph';
import { convertData } from '../../../shared/formatters';
import { GraphProps } from './types';
import { useGraphs } from './useGraphs';

export type CombinedProps = GraphProps & WithTheme;

export const LoadGraph: React.FC<CombinedProps> = (props) => {
  const {
    clientAPIKey,
    lastUpdated,
    lastUpdatedError,
    end,
    isToday,
    start,
    theme,
    timezone,
  } = props;

  const { data, loading, error, request } = useGraphs(
    ['load'],
    clientAPIKey,
    start,
    end
  );

  React.useEffect(() => {
    request();
  }, [start, end, clientAPIKey, lastUpdated, lastUpdatedError]);

  const _convertData = React.useCallback(convertData, [data, start, end]);

  return (
    <LongviewLineGraph
      title="Load"
      subtitle="Target < 1.00"
      ariaLabel="Load Graph"
      error={error}
      loading={loading}
      showToday={isToday}
      timezone={timezone}
      nativeLegend
      data={[
        {
          label: 'Load',
          borderColor: 'transparent',
          backgroundColor: theme.graphs.load,
          data: _convertData(data.Load || [], start, end),
        },
      ]}
    />
  );
};

export default withTheme(LoadGraph);
