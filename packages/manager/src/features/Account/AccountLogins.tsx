import { AccountLogin } from '@linode/api-v4/lib/account/types';
import { Typography } from 'src/components/Typography';
import * as React from 'react';
import { Hidden } from 'src/components/Hidden';
import { makeStyles } from 'tss-react/mui';
import { Theme } from '@mui/material/styles';
import { TableBody } from 'src/components/TableBody';
import { TableHead } from 'src/components/TableHead';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import { TableSortCell } from 'src/components/TableSortCell';
import { useOrder } from 'src/hooks/useOrder';
import { usePagination } from 'src/hooks/usePagination';
import { useAccountLoginsQuery } from 'src/queries/accountLogins';
import AccountLoginsTableRow from './AccountLoginsTableRow';

const preferenceKey = 'account-logins';

const useStyles = makeStyles()((theme: Theme) => ({
  cell: {
    width: '12%',
  },
  copy: {
    lineHeight: '20px',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      marginLeft: theme.spacing(2),
    },
  },
}));

const AccountLogins = () => {
  const { classes } = useStyles();
  const pagination = usePagination(1, preferenceKey);

  const { order, orderBy, handleOrderChange } = useOrder(
    {
      orderBy: 'datetime',
      order: 'desc',
    },
    `${preferenceKey}-order}`
  );

  const filter = {
    ['+order_by']: orderBy,
    ['+order']: order,
  };

  const { data, isLoading, error } = useAccountLoginsQuery(
    {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
    filter
  );

  const renderTableContent = () => {
    if (isLoading) {
      return (
        <TableRowLoading
          rows={1}
          columns={5}
          responsive={{
            2: { smDown: true },
            3: { mdDown: true },
          }}
        />
      );
    }
    if (error) {
      return <TableRowError colSpan={5} message={error[0].reason} />;
    }
    if (data?.results == 0) {
      return <TableRowEmpty message="No account logins" colSpan={5} />;
    }
    if (data) {
      return data.data.map((item: AccountLogin) => (
        <AccountLoginsTableRow key={item.id} {...item} />
      ));
    }

    return null;
  };

  return (
    <>
      <Typography variant="body1" className={classes.copy}>
        Logins across all users on your account over the last 90 days.
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableSortCell
              active={orderBy === 'datetime'}
              direction={order}
              label="datetime"
              handleClick={handleOrderChange}
              className={classes.cell}
            >
              Date
            </TableSortCell>
            <TableSortCell
              active={orderBy === 'username'}
              direction={order}
              label="username"
              handleClick={handleOrderChange}
              className={classes.cell}
            >
              Username
            </TableSortCell>
            <Hidden smDown>
              <TableSortCell
                active={orderBy === 'ip'}
                direction={order}
                label="ip"
                handleClick={handleOrderChange}
                className={classes.cell}
              >
                IP
              </TableSortCell>
            </Hidden>
            <Hidden mdDown>
              <TableCell className={classes.cell}>Permission Level</TableCell>
            </Hidden>
            <TableSortCell
              active={orderBy === 'status'}
              direction={order}
              label="status"
              handleClick={handleOrderChange}
              className={classes.cell}
            >
              Access
            </TableSortCell>
          </TableRow>
        </TableHead>
        <TableBody>{renderTableContent()}</TableBody>
      </Table>
      <PaginationFooter
        count={data?.results || 0}
        handlePageChange={pagination.handlePageChange}
        handleSizeChange={pagination.handlePageSizeChange}
        page={pagination.page}
        pageSize={pagination.pageSize}
        eventCategory="Account Logins Table"
      />
    </>
  );
};

export default AccountLogins;
