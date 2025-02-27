import { CreateTransferPayload } from '@linode/api-v4/lib/entity-transfers';
import { curry } from 'ramda';
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from '@mui/material/Unstable_Grid2';
import { Notice } from 'src/components/Notice/Notice';
import { queryKey, useCreateTransfer } from 'src/queries/entityTransfers';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { sendEntityTransferCreateEvent } from 'src/utilities/analytics';
import { countByEntity } from '../utilities';
import LinodeTransferTable from './LinodeTransferTable';
import TransferCheckoutBar from './TransferCheckoutBar';
import TransferHeader from './TransferHeader';
import LandingHeader from 'src/components/LandingHeader';
import {
  curriedTransferReducer,
  defaultTransferState,
  TransferableEntity,
} from './transferReducer';
import { QueryClient, useQueryClient } from 'react-query';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    [theme.breakpoints.down('lg')]: {
      margin: 0,
      justifyContent: 'center',
    },
  },
  sidebar: {
    [theme.breakpoints.down('lg')]: {
      padding: '0px 8px !important',
      '&.MuiGrid-item': {
        paddingLeft: 0,
        paddingRight: 0,
      },
    },
  },
  error: {
    [theme.breakpoints.down('lg')]: {
      marginLeft: theme.spacing(),
    },
  },
}));

export const EntityTransfersCreate: React.FC<{}> = (_) => {
  const { push } = useHistory();
  const { mutateAsync: createTransfer, error, isLoading } = useCreateTransfer();
  const classes = useStyles();
  const queryClient = useQueryClient();

  /**
   * Reducer and helpers for working with the payload/selection process
   */

  const [state, dispatch] = React.useReducer(
    curriedTransferReducer,
    defaultTransferState
  );

  const addEntitiesToTransfer = curry(
    (entityType: TransferableEntity, entitiesToAdd: any[]) => {
      dispatch({ type: 'ADD', entityType, entitiesToAdd });
    }
  );

  const removeEntitiesFromTransfer = curry(
    (entityType: TransferableEntity, entitiesToRemove: any[]) => {
      dispatch({ type: 'REMOVE', entityType, entitiesToRemove });
    }
  );

  const toggleEntity = curry((entityType: TransferableEntity, entity: any) => {
    dispatch({ type: 'TOGGLE', entityType, entity });
  });

  /**
   * Helper functions
   */

  const handleCreateTransfer = (
    payload: CreateTransferPayload,
    queryClient: QueryClient
  ) => {
    createTransfer(payload, {
      onSuccess: (transfer) => {
        // @analytics
        const entityCount = countByEntity(transfer.entities);
        sendEntityTransferCreateEvent(entityCount);

        queryClient.invalidateQueries(queryKey);
        push({ pathname: '/account/service-transfers', state: { transfer } });
      },
    }).catch((_) => null);
  };

  return (
    <>
      <DocumentTitleSegment segment="Make a Service Transfer" />
      <LandingHeader
        title="Make a Service Transfer"
        breadcrumbProps={{
          pathname: location.pathname,
          labelOptions: { noCap: true },
          crumbOverrides: [
            {
              position: 2,
              label: 'Service Transfers',
            },
          ],
        }}
      />
      {error ? (
        <Notice
          error
          text={getAPIErrorOrDefault(error)[0].reason}
          className={classes.error}
        />
      ) : null}
      <Grid
        container
        wrap="wrap"
        direction="row"
        spacing={3}
        className={classes.root}
      >
        <Grid xs={12} md={8} lg={9}>
          <TransferHeader />
          <LinodeTransferTable
            selectedLinodes={state.linodes}
            handleSelect={addEntitiesToTransfer('linodes')}
            handleRemove={removeEntitiesFromTransfer('linodes')}
            handleToggle={toggleEntity('linodes')}
          />
        </Grid>
        <Grid xs={12} md={4} lg={3} className={classes.sidebar}>
          <TransferCheckoutBar
            isCreating={isLoading}
            selectedEntities={state}
            removeEntities={removeEntitiesFromTransfer}
            handleSubmit={(payload) =>
              handleCreateTransfer(payload, queryClient)
            }
          />
        </Grid>
      </Grid>
    </>
  );
};

export default EntityTransfersCreate;
