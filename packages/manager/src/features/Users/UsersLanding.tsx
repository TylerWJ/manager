import { deleteUser, User } from '@linode/api-v4/lib/account';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import AddNewLink from 'src/components/AddNewLink';
import { makeStyles, useTheme } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { TableBody } from 'src/components/TableBody';
import { TableHead } from 'src/components/TableHead';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from '@mui/material/Unstable_Grid2';
import { Notice } from 'src/components/Notice/Notice';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import { usePagination } from 'src/hooks/usePagination';
import { useAccountUsers } from 'src/queries/accountUsers';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import { GravatarByEmail } from '../../components/GravatarByEmail';
import CreateUserDrawer from './CreateUserDrawer';
import { UserDeleteConfirmationDialog } from './UserDeleteConfirmationDialog';
import ActionMenu from './UsersActionMenu';
import { useProfile } from 'src/queries/profile';

const useStyles = makeStyles((theme: Theme) => ({
  userLandingHeader: {
    margin: 0,
    width: '100%',
  },
  headline: {
    marginTop: 8,
    marginBottom: 8,
    marginLeft: 15,
    lineHeight: '1.5rem',
  },
  addNewWrapper: {
    '&.MuiGrid-item': {
      paddingTop: 0,
      paddingRight: 0,
    },
    [theme.breakpoints.down('md')]: {
      marginRight: theme.spacing(),
    },
  },
  '@keyframes fadeIn': {
    from: {
      opacity: 0,
    },
    to: {
      opacity: 1,
    },
  },
  title: {
    marginBottom: theme.spacing(2),
  },
  avatar: {
    borderRadius: '50%',
    width: 30,
    height: 30,
    marginRight: theme.spacing(2),
    animation: '$fadeIn 150ms linear forwards',
  },
  emptyImage: {
    display: 'inline',
    width: 30,
    height: 30,
    marginRight: theme.spacing(2),
    [theme.breakpoints.up('md')]: {
      width: 40,
      height: 40,
    },
  },
}));

const UsersLanding = () => {
  const { data: profile } = useProfile();
  const pagination = usePagination(1, 'account-users');
  const { data: users, isLoading, error, refetch } = useAccountUsers({
    page: pagination.page,
    page_size: pagination.pageSize,
  });
  const isRestrictedUser = profile?.restricted;
  const { enqueueSnackbar } = useSnackbar();
  const [createDrawerOpen, setCreateDrawerOpen] = React.useState<boolean>(
    false
  );
  const [
    deleteConfirmDialogOpen,
    setDeleteConfirmDialogOpen,
  ] = React.useState<boolean>(false);
  const [newUsername, setNewUsername] = React.useState<string | undefined>(
    undefined
  );
  const [userDeleteError, setUserDeleteError] = React.useState<
    boolean | undefined
  >(false);
  const [toDeleteUsername, setToDeleteUsername] = React.useState<
    string | undefined
  >('');

  const classes = useStyles();
  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('md'));

  const openForCreate = () => {
    setCreateDrawerOpen(true);
  };

  const userCreateOnClose = () => {
    setCreateDrawerOpen(false);
  };

  const onDeleteConfirm = (username: string) => {
    setNewUsername(undefined);
    setUserDeleteError(false);
    setDeleteConfirmDialogOpen(false);

    deleteUser(username)
      .then(() => {
        refetch();
        enqueueSnackbar(`User ${username} has been deleted successfully.`, {
          variant: 'success',
        });
      })
      .catch(() => {
        setUserDeleteError(true);
        setToDeleteUsername('');

        scrollErrorIntoView();
      });
  };

  const onDeleteCancel = () => {
    setDeleteConfirmDialogOpen(false);
  };

  const onUsernameDelete = (username: string) => {
    setDeleteConfirmDialogOpen(true);
    setToDeleteUsername(username);
  };

  const renderUserRow = (user: User) => {
    return (
      <TableRow
        key={user.username}
        data-qa-user-row
        ariaLabel={`User ${user.username}`}
      >
        <TableCell data-qa-username>
          <Grid container alignItems="center" spacing={2}>
            <Grid style={{ display: 'flex' }}>
              <GravatarByEmail email={user.email} />
            </Grid>
            <Grid className="px0">{user.username}</Grid>
          </Grid>
        </TableCell>
        {!matchesSmDown && (
          <TableCell data-qa-user-email>{user.email}</TableCell>
        )}
        <TableCell data-qa-user-restriction>
          {user.restricted ? 'Limited' : 'Full'}
        </TableCell>
        <TableCell actionCell>
          <ActionMenu username={user.username} onDelete={onUsernameDelete} />
        </TableCell>
      </TableRow>
    );
  };

  const renderTableContent = () => {
    if (isLoading) {
      return (
        <TableRowLoading
          columns={4}
          rows={1}
          responsive={{ 1: { smDown: true } }}
        />
      );
    }

    if (error) {
      return <TableRowError colSpan={4} message={error[0].reason} />;
    }

    if (!users || users.results === 0) {
      return <TableRowEmpty colSpan={4} />;
    }

    return users.data.map((user) => renderUserRow(user));
  };

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="Users & Grants" />
      {newUsername && (
        <Notice success text={`User ${newUsername} created successfully`} />
      )}
      {userDeleteError && (
        <Notice
          style={{ marginTop: newUsername ? 16 : 0 }}
          error
          text={`Error when deleting user, please try again later`}
        />
      )}
      <Grid
        container
        alignItems="flex-end"
        justifyContent="flex-end"
        className={classes.userLandingHeader}
        spacing={2}
      >
        <Grid className={classes.addNewWrapper}>
          <AddNewLink
            disabled={isRestrictedUser}
            disabledReason={
              isRestrictedUser
                ? 'You cannot create other users as a restricted user.'
                : undefined
            }
            onClick={openForCreate}
            label="Add a User"
          />
        </Grid>
      </Grid>
      <Table aria-label="List of Users">
        <TableHead>
          <TableRow>
            <TableCell data-qa-username-column>Username</TableCell>
            {!matchesSmDown && (
              <TableCell data-qa-email-column>Email Address</TableCell>
            )}
            <TableCell data-qa-restriction-column>Account Access</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>{renderTableContent()}</TableBody>
      </Table>
      <PaginationFooter
        count={users?.results || 0}
        page={pagination.page}
        pageSize={pagination.pageSize}
        handlePageChange={pagination.handlePageChange}
        handleSizeChange={pagination.handlePageSizeChange}
        eventCategory="users landing"
      />
      <CreateUserDrawer
        open={createDrawerOpen}
        onClose={userCreateOnClose}
        refetch={refetch}
      />
      <UserDeleteConfirmationDialog
        username={toDeleteUsername || ''}
        open={deleteConfirmDialogOpen}
        onDelete={() => onDeleteConfirm(toDeleteUsername ?? '')}
        onCancel={onDeleteCancel}
      />
    </React.Fragment>
  );
};

export default UsersLanding;
