import { useSnackbar } from 'notistack';
import * as React from 'react';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import { Typography } from 'src/components/Typography';
import { Notice } from 'src/components/Notice/Notice';
import { TypeToConfirmDialog } from 'src/components/TypeToConfirmDialog/TypeToConfirmDialog';
import { resetEventsPolling } from 'src/eventsPolling';
import {
  useDeleteVolumeMutation,
  useDetachVolumeMutation,
} from 'src/queries/volumes';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { useLinodeQuery } from 'src/queries/linodes/linodes';

const useStyles = makeStyles((theme: Theme) => ({
  warningCopy: {
    color: theme.color.red,
    marginBottom: theme.spacing(2),
  },
}));

interface Props {
  open: boolean;
  mode: 'detach' | 'delete';
  onClose: () => void;
  volumeLabel: string;
  volumeId: number;
  linodeLabel?: string;
  linodeId?: number;
}

export const DestructiveVolumeDialog = (props: Props) => {
  const classes = useStyles();

  const { volumeLabel: label, volumeId, linodeId, mode, open, onClose } = props;

  const { enqueueSnackbar } = useSnackbar();

  const { data: linode } = useLinodeQuery(
    linodeId ?? -1,
    linodeId !== undefined
  );

  const {
    mutateAsync: detachVolume,
    error: detachError,
    isLoading: detachLoading,
  } = useDetachVolumeMutation();

  const {
    mutateAsync: deleteVolume,
    error: deleteError,
    isLoading: deleteLoading,
  } = useDeleteVolumeMutation();

  const onDetach = () => {
    detachVolume({ id: volumeId }).then(() => {
      onClose();
      resetEventsPolling();
      enqueueSnackbar(`Volume detachment started`, {
        variant: 'info',
      });
    });
  };

  const onDelete = () => {
    deleteVolume({ id: volumeId }).then(() => {
      onClose();
      resetEventsPolling();
    });
  };

  const poweredOff = linode?.status === 'offline';

  const method = {
    detach: onDetach,
    delete: onDelete,
  }[props.mode];

  const loading = {
    detach: detachLoading,
    delete: deleteLoading,
  }[props.mode];

  const selectedError = {
    detach: detachError,
    delete: deleteError,
  }[props.mode];

  const error = selectedError
    ? getAPIErrorOrDefault(selectedError, `Unable to ${mode} volume.`)[0].reason
    : undefined;

  const title = {
    detach: `Detach ${label ? `Volume ${label}` : 'Volume'}?`,
    delete: `Delete ${label ? `Volume ${label}` : 'Volume'}?`,
  }[props.mode];

  return (
    <TypeToConfirmDialog
      title={title}
      label={'Volume Label'}
      entity={{
        type: 'Volume',
        action: mode === 'detach' ? 'detachment' : 'deletion',
        name: label,
        primaryBtnText: mode === 'detach' ? 'Detach' : 'Delete',
      }}
      open={open}
      loading={loading}
      onClose={onClose}
      onClick={method}
      typographyStyle={{ marginTop: '10px' }}
    >
      {error && <Notice error text={error} />}
      {mode === 'detach' && !poweredOff && linode !== undefined && (
        <Typography className={classes.warningCopy}>
          <strong>Warning:</strong> This operation could cause data loss. Please
          power off the Linode first or make sure it isn&rsquo;t currently
          writing to the volume before continuing. If this volume is currently
          mounted, detaching it could cause your Linode to restart.
        </Typography>
      )}
    </TypeToConfirmDialog>
  );
};
