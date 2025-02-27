import { ManagedServiceMonitor } from '@linode/api-v4/lib/managed';
import * as React from 'react';
import { Link } from 'react-router-dom';
import TicketIcon from 'src/assets/icons/ticket.svg';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import { Tooltip } from 'src/components/Tooltip';
import { Typography } from 'src/components/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { ExtendedIssue } from 'src/queries/managed/types';
import ActionMenu from './MonitorActionMenu';
import { statusIconMap, statusTextMap } from './monitorMaps';

const useStyles = makeStyles((theme: Theme) => ({
  label: {
    fontFamily: theme.font.bold,
    width: '30%',
  },
  icon: {
    alignItems: 'center',
    transition: 'color 225ms ease-in-out',
    '&:hover': {
      color: theme.color.red,
    },
  },
  monitorDescription: {
    paddingTop: theme.spacing(0.5),
  },
  monitorRow: {
    '&:before': {
      display: 'none',
    },
  },
  errorStatus: {
    color: theme.color.red,
  },
}));

interface Props {
  monitor: ManagedServiceMonitor;
  issues: ExtendedIssue[];
  openDialog: (id: number, label: string) => void;
  openMonitorDrawer: (id: number, mode: string) => void;
  openHistoryDrawer: (id: number, label: string) => void;
}

export const MonitorRow: React.FC<Props> = (props) => {
  const classes = useStyles();

  const {
    monitor,
    issues,
    openDialog,
    openHistoryDrawer,
    openMonitorDrawer,
  } = props;

  const Icon = statusIconMap[monitor.status];

  // For now, only include a ticket icon in this view if the ticket is still open (per Jay).
  const openIssues = issues.filter((thisIssue) => !thisIssue.dateClosed);

  return (
    <TableRow
      key={monitor.id}
      data-qa-monitor-cell={monitor.id}
      data-testid={'monitor-row'}
      className={classes.monitorRow}
      ariaLabel={`Monitor ${monitor.label}`}
    >
      <TableCell className={classes.label} data-qa-monitor-label>
        <Grid container wrap="nowrap" alignItems="center" spacing={2}>
          <Grid className={classes.icon} style={{ display: 'flex' }}>
            <Icon height={30} width={30} />
          </Grid>
          <Grid>{monitor.label}</Grid>
        </Grid>
      </TableCell>
      <TableCell data-qa-monitor-status>
        <Grid container direction="row" alignItems="center" spacing={1}>
          <Grid>
            <Typography
              className={
                monitor.status === 'problem' ? classes.errorStatus : ''
              }
            >
              {statusTextMap[monitor.status]}
            </Typography>
          </Grid>
          <Grid>
            {openIssues.length > 0 && (
              <Tooltip
                data-qa-open-ticket-tooltip
                enterTouchDelay={0}
                leaveTouchDelay={5000}
                placement={'top'}
                title={'See the open ticket associated with this incident'}
              >
                <Link
                  to={`/support/tickets/${issues[0].entity.id}`}
                  className={classes.icon}
                >
                  <TicketIcon />
                </Link>
              </Tooltip>
            )}
          </Grid>
        </Grid>
      </TableCell>
      <TableCell data-qa-monitor-resource>
        <Typography>{monitor.address}</Typography>
      </TableCell>
      <TableCell actionCell>
        <ActionMenu
          status={monitor.status}
          monitorID={monitor.id}
          openDialog={openDialog}
          openMonitorDrawer={openMonitorDrawer}
          openHistoryDrawer={openHistoryDrawer}
          label={monitor.label}
        />
      </TableCell>
    </TableRow>
  );
};

export default MonitorRow;
