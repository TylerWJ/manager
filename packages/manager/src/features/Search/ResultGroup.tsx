import { isEmpty, splitAt } from 'ramda';
import * as React from 'react';
import { compose, withStateHandlers } from 'recompose';
import { Hidden } from 'src/components/Hidden';
import { Button } from 'src/components/Button/Button';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import { TableBody } from 'src/components/TableBody';
import { TableHead } from 'src/components/TableHead';
import { Typography } from 'src/components/Typography';
import { Item } from 'src/components/EnhancedSelect/Select';
import Grid from '@mui/material/Unstable_Grid2';
import { Table } from 'src/components/Table';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { capitalize } from 'src/utilities/capitalize';
import ResultRow from './ResultRow';

const useStyles = makeStyles((theme: Theme) => ({
  entityHeading: {
    marginBottom: theme.spacing(),
    [theme.breakpoints.down('md')]: {
      marginLeft: theme.spacing(),
    },
  },
  button: {
    marginTop: theme.spacing(),
    width: '10%',
  },
}));

interface Props {
  entity: string;
  results: Item[];
  groupSize: number;
}
interface HandlerProps {
  showMore: boolean;
  toggle: () => void;
}

type CombinedProps = Props & HandlerProps;

export const ResultGroup: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

  const { entity, groupSize, results, toggle, showMore } = props;

  if (isEmpty(results)) {
    return null;
  }

  const [initial, hidden] =
    results.length > groupSize ? splitAt(groupSize, results) : [results, []];

  return (
    <Grid>
      <Typography
        variant="h2"
        data-qa-entity-header={entity}
        className={classes.entityHeading}
      >
        {capitalize(entity)}
      </Typography>
      <Table aria-label="Search Results">
        <TableHead>
          <TableRow>
            <TableCell>Label</TableCell>
            <TableCell>Region</TableCell>
            <Hidden mdDown>
              <TableCell>Created</TableCell>
              <TableCell>Tags</TableCell>
            </Hidden>
          </TableRow>
        </TableHead>
        <TableBody>
          {initial.map((result, idx: number) => (
            <ResultRow key={idx} result={result} data-qa-result-row-component />
          ))}
          {showMore &&
            hidden.map((result, idx: number) => (
              <ResultRow
                key={idx}
                result={result}
                data-qa-result-row-component
              />
            ))}
        </TableBody>
      </Table>
      {!isEmpty(hidden) && (
        <Button
          buttonType="primary"
          onClick={toggle}
          className={classes.button}
          data-qa-show-more-toggle
        >
          {showMore ? 'Show Less' : 'Show All'}
        </Button>
      )}
    </Grid>
  );
};

const handlers = withStateHandlers(
  { showMore: false },
  {
    toggle: ({ showMore }) => () => ({ showMore: !showMore }),
  }
);

const enhanced = compose<CombinedProps, Props>(handlers)(ResultGroup);

export default enhanced;
