import * as React from 'react';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import { Typography } from 'src/components/Typography';
import { Dialog } from 'src/components/Dialog/Dialog';
import EnhancedSelect, { Item } from 'src/components/EnhancedSelect/Select';
import { Notice } from 'src/components/Notice/Notice';
import { HostMaintenanceError } from '../HostMaintenanceError';
import { LinodePermissionsError } from '../LinodePermissionsError';
import RebuildFromImage from './RebuildFromImage';
import RebuildFromStackScript from './RebuildFromStackScript';
import { useLinodeQuery } from 'src/queries/linodes/linodes';
import { useGrants, useProfile } from 'src/queries/profile';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    paddingBottom: theme.spacing(2),
    '& + div': {
      padding: 0,
      '& .MuiPaper-root': {
        padding: 0,
        '& > div': {
          padding: 0,
        },
        '& .MuiTableCell-head': {
          top: theme.spacing(11),
        },
      },
      '& .notice': {
        padding: theme.spacing(2),
      },
    },
  },
  title: {
    marginBottom: theme.spacing(2),
  },
  helperText: {
    paddingBottom: theme.spacing(2),
  },
}));

interface Props {
  linodeId: number | undefined;
  open: boolean;
  onClose: () => void;
}

type MODES =
  | 'fromImage'
  | 'fromCommunityStackScript'
  | 'fromAccountStackScript';

const options = [
  { value: 'fromImage', label: 'From Image' },
  { value: 'fromCommunityStackScript', label: 'From Community StackScript' },
  { value: 'fromAccountStackScript', label: 'From Account StackScript' },
];

const passwordHelperText = 'Set a password for your rebuilt Linode.';

export const LinodeRebuildDialog = (props: Props) => {
  const { linodeId, open, onClose } = props;

  const { data: profile } = useProfile();
  const { data: grants } = useGrants();
  const { data: linode } = useLinodeQuery(
    linodeId ?? -1,
    linodeId !== undefined && open
  );

  const isReadOnly =
    Boolean(profile?.restricted) &&
    grants?.linode.find((grant) => grant.id === linodeId)?.permissions ===
      'read_only';

  const hostMaintenance = linode?.status === 'stopped';
  const unauthorized = isReadOnly;
  const disabled = hostMaintenance || unauthorized;

  const classes = useStyles();

  const [mode, setMode] = React.useState<MODES>('fromImage');
  const [rebuildError, setRebuildError] = React.useState<string>('');

  React.useEffect(() => {
    if (open) {
      setRebuildError('');
    }
  }, [open]);

  const handleRebuildError = (status: string) => {
    setRebuildError(status);
  };

  return (
    <Dialog
      title={`Rebuild Linode ${linode?.label ?? ''}`}
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      fullHeight
    >
      <div className={classes.root}>
        {unauthorized && <LinodePermissionsError />}
        {hostMaintenance && <HostMaintenanceError />}
        {rebuildError && <Notice error>{rebuildError}</Notice>}
        <Typography data-qa-rebuild-desc className={classes.helperText}>
          If you can&rsquo;t rescue an existing disk, it&rsquo;s time to rebuild
          your Linode. There are a couple of different ways you can do this:
          either restore from a backup or start over with a fresh Linux
          distribution.&nbsp;
          <strong>
            Rebuilding will destroy all data on all existing disks on this
            Linode.
          </strong>
        </Typography>
        <EnhancedSelect
          options={options}
          defaultValue={options.find((option) => option.value === mode)}
          onChange={(selected: Item<MODES>) => {
            setMode(selected.value);
            setRebuildError('');
          }}
          isClearable={false}
          disabled={disabled}
          label="From Image"
          hideLabel
        />
      </div>
      {mode === 'fromImage' && (
        <RebuildFromImage
          passwordHelperText={passwordHelperText}
          disabled={disabled}
          linodeId={linodeId ?? -1}
          linodeLabel={linode?.label}
          handleRebuildError={handleRebuildError}
          onClose={onClose}
        />
      )}
      {mode === 'fromCommunityStackScript' && (
        <RebuildFromStackScript
          type="community"
          passwordHelperText={passwordHelperText}
          disabled={disabled}
          linodeId={linodeId ?? -1}
          linodeLabel={linode?.label}
          handleRebuildError={handleRebuildError}
          onClose={onClose}
        />
      )}
      {mode === 'fromAccountStackScript' && (
        <RebuildFromStackScript
          type="account"
          passwordHelperText={passwordHelperText}
          disabled={disabled}
          linodeId={linodeId ?? -1}
          linodeLabel={linode?.label}
          handleRebuildError={handleRebuildError}
          onClose={onClose}
        />
      )}
    </Dialog>
  );
};
