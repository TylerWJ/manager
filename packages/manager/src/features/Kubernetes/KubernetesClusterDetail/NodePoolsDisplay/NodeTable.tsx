import { PoolNodeResponse } from '@linode/api-v4/lib/kubernetes';
import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import { TableBody } from 'src/components/TableBody';
import TableFooter from 'src/components/core/TableFooter';
import { TableHead } from 'src/components/TableHead';
import { Typography } from 'src/components/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import OrderBy from 'src/components/OrderBy';
import Paginate from 'src/components/Paginate';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { Table } from 'src/components/Table';
import { TableCell } from 'src/components/TableCell';
import { TableContentWrapper } from 'src/components/TableContentWrapper/TableContentWrapper';
import { TableRow } from 'src/components/TableRow';
import { TableSortCell } from 'src/components/TableSortCell';
import { transitionText } from 'src/features/Linodes/transitions';
import { LinodeWithMaintenanceAndDisplayStatus } from 'src/store/linodes/types';
import { useRecentEventForLinode } from 'src/store/selectors/recentEventForLinode';
import NodeActionMenu from './NodeActionMenu';
import { useAllLinodesQuery } from 'src/queries/linodes/linodes';

const useStyles = makeStyles((theme: Theme) => ({
  table: {
    borderLeft: `1px solid ${theme.borderColors.borderTable}`,
    borderRight: `1px solid ${theme.borderColors.borderTable}`,
  },
  labelCell: {
    ...theme.applyTableHeaderStyles,
    width: '35%',
  },
  statusCell: {
    ...theme.applyTableHeaderStyles,
    width: '15%',
  },
  ipCell: {
    ...theme.applyTableHeaderStyles,
    width: '35%',
  },
  row: {
    '&:hover': {
      backgroundColor: theme.bg.lightBlue1,
    },
    '&:hover $copy > svg, & $copy:focus > svg': {
      opacity: 1,
    },
  },
  copy: {
    top: 1,
    marginLeft: 4,
    '& svg': {
      height: `12px`,
      width: `12px`,
      opacity: 0,
    },
  },
  error: {
    color: theme.color.red,
  },
}));

// =============================================================================
// NodeTable
// =============================================================================
export interface Props {
  poolId: number;
  nodes: PoolNodeResponse[];
  typeLabel: string;
  openRecycleNodeDialog: (nodeID: string, linodeLabel: string) => void;
}

export const NodeTable: React.FC<Props> = (props) => {
  const { nodes, poolId, typeLabel, openRecycleNodeDialog } = props;

  const classes = useStyles();

  const { data: linodes, isLoading, error } = useAllLinodesQuery();

  const rowData = nodes.map((thisNode) => nodeToRow(thisNode, linodes ?? []));

  return (
    <OrderBy data={rowData} orderBy={'label'} order={'asc'}>
      {({ data: orderedData, handleOrderChange, order, orderBy }) => (
        <Paginate data={orderedData}>
          {({
            data: paginatedAndOrderedData,
            count,
            handlePageChange,
            handlePageSizeChange,
            page,
            pageSize,
          }) => (
            <>
              <Table
                aria-label="List of Your Cluster Nodes"
                className={classes.table}
              >
                <TableHead>
                  <TableRow>
                    <TableSortCell
                      active={orderBy === 'label'}
                      label={'label'}
                      direction={order}
                      handleClick={handleOrderChange}
                      className={classes.labelCell}
                    >
                      Linode
                    </TableSortCell>
                    <TableSortCell
                      active={orderBy === 'instanceStatus'}
                      label={'instanceStatus'}
                      direction={order}
                      handleClick={handleOrderChange}
                      className={classes.statusCell}
                    >
                      Status
                    </TableSortCell>
                    <TableSortCell
                      active={orderBy === 'ip'}
                      label={'ip'}
                      direction={order}
                      handleClick={handleOrderChange}
                      className={classes.ipCell}
                    >
                      IP Address
                    </TableSortCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableContentWrapper
                    loadingProps={{ columns: 4 }}
                    loading={isLoading}
                    length={paginatedAndOrderedData.length}
                  >
                    {paginatedAndOrderedData.map((eachRow) => {
                      return (
                        <NodeRow
                          key={`node-row-${eachRow.nodeId}`}
                          nodeId={eachRow.nodeId}
                          instanceId={eachRow.instanceId}
                          label={eachRow.label}
                          instanceStatus={eachRow.instanceStatus}
                          ip={eachRow.ip}
                          nodeStatus={eachRow.nodeStatus}
                          typeLabel={typeLabel}
                          linodeError={error ?? undefined}
                          openRecycleNodeDialog={openRecycleNodeDialog}
                        />
                      );
                    })}
                  </TableContentWrapper>
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={4}>
                      <Typography>Pool ID {poolId}</Typography>
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
              <PaginationFooter
                count={count}
                handlePageChange={handlePageChange}
                handleSizeChange={handlePageSizeChange}
                page={page}
                pageSize={pageSize}
                eventCategory="Node Table"
              />
            </>
          )}
        </Paginate>
      )}
    </OrderBy>
  );
};

export default React.memo(NodeTable);

// =============================================================================
// NodeRow
// =============================================================================
interface NodeRow {
  nodeId: string;
  instanceId?: number;
  label?: string;
  instanceStatus?: string;
  ip?: string;
  nodeStatus: string;
}

interface NodeRowProps extends NodeRow {
  typeLabel: string;
  linodeError?: APIError[];
  openRecycleNodeDialog: (nodeID: string, linodeLabel: string) => void;
}

export const NodeRow: React.FC<NodeRowProps> = React.memo((props) => {
  const {
    nodeId,
    instanceId,
    label,
    instanceStatus,
    ip,
    typeLabel,
    nodeStatus,
    linodeError,
    openRecycleNodeDialog,
  } = props;

  const classes = useStyles();

  const recentEvent = useRecentEventForLinode(instanceId ?? -1);

  const linodeLink = instanceId ? `/linodes/${instanceId}` : undefined;

  const nodeReadyAndInstanceRunning =
    nodeStatus === 'ready' && instanceStatus === 'running';
  const iconStatus = nodeReadyAndInstanceRunning ? 'active' : 'inactive';

  const displayLabel = label ?? typeLabel;
  const displayStatus =
    nodeStatus === 'not_ready'
      ? 'Provisioning'
      : transitionText(instanceStatus ?? '', instanceId ?? -1, recentEvent);

  const displayIP = ip ?? '';

  return (
    <TableRow
      ariaLabel={label}
      className={classes.row}
      data-qa-node-row={nodeId}
    >
      <TableCell>
        <Grid container wrap="nowrap" alignItems="center">
          <Grid>
            <Typography>
              {linodeLink ? (
                <Link to={linodeLink}>{displayLabel}</Link>
              ) : (
                displayLabel
              )}
            </Typography>
          </Grid>
        </Grid>
      </TableCell>
      <TableCell statusCell={!linodeError}>
        {linodeError ? (
          <Typography className={classes.error}>
            Error retrieving status
          </Typography>
        ) : (
          <>
            <StatusIcon status={iconStatus} />
            {displayStatus}
          </>
        )}
      </TableCell>
      <TableCell>
        {linodeError ? (
          <Typography className={classes.error}>Error retrieving IP</Typography>
        ) : displayIP.length > 0 ? (
          <>
            <CopyTooltip text={displayIP} copyableText />
            <CopyTooltip className={classes.copy} text={displayIP} />
          </>
        ) : null}
      </TableCell>
      <TableCell>
        <NodeActionMenu
          nodeId={nodeId}
          instanceLabel={label}
          openRecycleNodeDialog={openRecycleNodeDialog}
        />
      </TableCell>
    </TableRow>
  );
});

// =============================================================================
// Utilities
// =============================================================================

/**
 * Transforms an LKE Pool Node to a NodeRow.
 */
export const nodeToRow = (
  node: PoolNodeResponse,
  linodes: LinodeWithMaintenanceAndDisplayStatus[]
): NodeRow => {
  const foundLinode = linodes.find(
    (thisLinode) => thisLinode.id === node.instance_id
  );

  return {
    nodeId: node.id,
    instanceId: node.instance_id || undefined,
    label: foundLinode?.label,
    instanceStatus: foundLinode?.status,
    ip: foundLinode?.ipv4[0],
    nodeStatus: node.status,
  };
};
