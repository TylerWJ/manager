import { ManagedLinodeSetting } from '@linode/api-v4/lib/managed';
import produce from 'immer';
import * as React from 'react';
import { Hidden } from 'src/components/Hidden';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import { TableBody } from 'src/components/TableBody';
import { TableHead } from 'src/components/TableHead';
import OrderBy from 'src/components/OrderBy';
import Paginate from 'src/components/Paginate';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { TableSortCell } from 'src/components/TableSortCell';
import useOpenClose from 'src/hooks/useOpenClose';
import { useAllLinodeSettingsQuery } from 'src/queries/managed/managed';
import { DEFAULTS } from './common';
import EditSSHAccessDrawer from './EditSSHAccessDrawer';
import SSHAccessTableContent from './SSHAccessTableContent';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: theme.spacing(4),
    '&:before': {
      display: 'none',
    },
  },
}));

const SSHAccessTable: React.FC<{}> = () => {
  const classes = useStyles();

  const { data: settings, isLoading, error } = useAllLinodeSettingsQuery();

  const data = settings || [];

  const [selectedLinodeId, setSelectedLinodeId] = React.useState<number | null>(
    null
  );

  const drawer = useOpenClose();

  // For all intents and purposes, the default `user` is "root", and the default `port` is 22.
  // Surprisingly, these are returned as `null` from the API. We want to display the defaults
  // to the user, though, so we normalize the data here by exchanging `null` for the defaults.
  const normalizedData: ManagedLinodeSetting[] = produce(data, (draft) => {
    data.forEach((linodeSetting, idx) => {
      if (linodeSetting.ssh.user === null) {
        draft[idx].ssh.user = DEFAULTS.user;
      }

      if (linodeSetting.ssh.port === null) {
        draft[idx].ssh.port = DEFAULTS.port;
      }
    });
  });

  return (
    <>
      <OrderBy data={normalizedData} orderBy="label" order="asc">
        {({ data: orderedData, handleOrderChange, order, orderBy }) => {
          return (
            <Paginate data={orderedData}>
              {({
                count,
                data: paginatedData,
                handlePageChange,
                handlePageSizeChange,
                page,
                pageSize,
              }) => {
                return (
                  <>
                    <div className={classes.root}>
                      <Table aria-label="List of Your Managed SSH Access Settings">
                        <TableHead>
                          <TableRow>
                            <TableSortCell
                              active={orderBy === 'label'}
                              label={'label'}
                              direction={order}
                              handleClick={handleOrderChange}
                              data-qa-ssh-linode-header
                            >
                              Linode
                            </TableSortCell>
                            <TableSortCell
                              active={orderBy === 'ssh:access'}
                              label={'ssh:access'}
                              direction={order}
                              handleClick={handleOrderChange}
                              data-qa-ssh-access-header
                            >
                              SSH Access
                            </TableSortCell>
                            <Hidden smDown>
                              <TableSortCell
                                active={orderBy === 'ssh:user'}
                                label={'ssh:user'}
                                direction={order}
                                handleClick={handleOrderChange}
                                data-qa-ssh-user-header
                              >
                                User
                              </TableSortCell>
                              <TableSortCell
                                active={orderBy === 'ssh:ip'}
                                label={'ssh:ip'}
                                direction={order}
                                handleClick={handleOrderChange}
                                data-qa-ssh-ip-header
                              >
                                IP
                              </TableSortCell>
                              <TableSortCell
                                active={orderBy === 'ssh:port'}
                                label={'ssh:port'}
                                direction={order}
                                handleClick={handleOrderChange}
                                data-qa-ssh-port-header
                              >
                                Port
                              </TableSortCell>
                            </Hidden>
                            <TableCell />
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <SSHAccessTableContent
                            linodeSettings={paginatedData}
                            loading={isLoading}
                            openDrawer={(linodeId: number) => {
                              setSelectedLinodeId(linodeId);
                              drawer.open();
                            }}
                            error={error}
                          />
                        </TableBody>
                      </Table>
                    </div>
                    <PaginationFooter
                      count={count}
                      handlePageChange={handlePageChange}
                      handleSizeChange={handlePageSizeChange}
                      page={page}
                      pageSize={pageSize}
                      eventCategory="managed ssh access table"
                    />
                  </>
                );
              }}
            </Paginate>
          );
        }}
      </OrderBy>
      <EditSSHAccessDrawer
        isOpen={drawer.isOpen}
        closeDrawer={drawer.close}
        linodeSetting={normalizedData.find((l) => l.id === selectedLinodeId)}
      />
    </>
  );
};

export default SSHAccessTable;
