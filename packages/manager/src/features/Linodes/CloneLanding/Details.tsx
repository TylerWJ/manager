import { Disk, Linode } from '@linode/api-v4/lib/linodes';
import Close from '@mui/icons-material/Close';
import * as React from 'react';
import { Button } from 'src/components/Button/Button';
import { Divider } from 'src/components/Divider';
import List from 'src/components/core/List';
import ListItem from 'src/components/core/ListItem';
import Paper from 'src/components/core/Paper';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import { Typography } from 'src/components/Typography';
import { Notice } from 'src/components/Notice/Notice';
import { useRegionsQuery } from 'src/queries/regions';
import { LinodeSelect } from '../LinodeSelect/LinodeSelect';
import {
  EstimatedCloneTimeMode,
  ExtendedConfig,
  getAllDisks,
  getEstimatedCloneTime,
} from './utilities';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(2),
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(2),
  },
  clearButton: {
    top: `-${theme.spacing(0.5)}`,
  },
  list: {
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  nestedList: {
    marginLeft: theme.spacing(2),
    flexBasis: '100%',
  },
  closeIcon: {
    cursor: 'pointer',
    paddingTop: 0,
    paddingBottom: 0,
    display: 'flex',
    alignItems: 'center',
    backgroundColor: theme.color.white,
    border: 'none',
    '& path': {
      fill: theme.palette.primary.main,
    },
  },
  submitButton: {
    marginTop: theme.spacing(3),
  },
  labelOuter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  errorText: {
    color: theme.color.red,
    marginTop: theme.spacing(1),
    '& a': {
      textDecoration: 'underline',
      color: theme.color.red,
    },
  },
}));

interface Props {
  selectedConfigs: ExtendedConfig[];
  selectedDisks: Disk[];
  selectedLinodeId: number | null;
  selectedLinodeRegion?: string;
  thisLinodeRegion: string;
  isSubmitting: boolean;
  currentLinodeId: number;
  errorMap: Record<string, string | undefined>;
  handleToggleConfig: (id: number) => void;
  handleToggleDisk: (id: number) => void;
  handleSelectLinode: (linodeId: number) => void;
  handleClone: () => void;
  clearAll: () => void;
}

export const Configs: React.FC<Props> = (props) => {
  const {
    currentLinodeId,
    selectedConfigs,
    selectedDisks,
    selectedLinodeId,
    thisLinodeRegion,
    isSubmitting,
    errorMap,
    handleToggleConfig,
    handleToggleDisk,
    handleSelectLinode,
    selectedLinodeRegion,
    handleClone,
    clearAll,
  } = props;

  const { data: regions } = useRegionsQuery();

  const region = regions?.find((r) => r.id === thisLinodeRegion);

  const classes = useStyles();

  const noneError = errorMap.none;
  // When duplicating a disk on the SAME Linode, if there's not a enough space,
  // we get back an error with a field of "disk_size"
  const diskError = errorMap.disk_size;

  /**
   * When cloning a disk or config to a DIFFERENT Linode, if there's not enough space on the destination Linode,
   * we get an error from the API that looks like this: `[{ "reason": "Not enough free space on <label>." }]`.
   * There's no "field" on this error , but we want this error to appear as a field error on the LinodeSelect.
   *
   * If the API error message ever changes and this regex breaks, the worst that will happen is that
   * the error will appear as a general error (<Notice />) instead of a field error.
   */
  const isNoneErrorActuallyALinodeError = Boolean(
    noneError && noneError.match(/free space/)
  );

  // The Linode field error could either be the none error, or the disk_size error (or nothing).
  let linodeError = isNoneErrorActuallyALinodeError ? noneError : diskError;
  // Ensure there is a period at the end of the error.
  if (linodeError && !linodeError.endsWith('.')) {
    linodeError += '.';
  }

  const errorMessageLinks = {
    shrink: `/linodes/${selectedLinodeId}/advanced`,
    resize: `/linodes/${selectedLinodeId}/resize`,
  };

  /**
   * Don't include the current Linode in the LinodeSelect component if:
   * 1) There is a selected config (because you can't duplicate configs on the same Linode).
   * 2) There's more than one disk selected (because you can't duplicate multiple configs at once on the same Linode).
   */
  const shouldExcludeCurrentLinode =
    selectedConfigs.length > 0 || selectedDisks.length > 1;

  // Disable the "Clone" button if there is no selected Linode,
  // or if there are no selected configs or disks, or if the selected Linode should be excluded.
  const isCloneButtonDisabled =
    (selectedConfigs.length === 0 && selectedDisks.length === 0) ||
    !selectedLinodeId ||
    (shouldExcludeCurrentLinode && selectedLinodeId === currentLinodeId);

  // Estimate the clone time (need to grab all disks first).
  const allDisks = getAllDisks(selectedConfigs, selectedDisks);
  const totalSize = allDisks.reduce((sum, eachDisk) => {
    return sum + eachDisk.size;
  }, 0);

  const mode: EstimatedCloneTimeMode =
    thisLinodeRegion === selectedLinodeRegion
      ? 'sameDatacenter'
      : 'differentDatacenter';
  const estimatedCloneTime = getEstimatedCloneTime(totalSize, mode);

  return (
    <Paper className={classes.root}>
      <header className={classes.header}>
        <Typography variant="h2">Selected</Typography>
        <Button
          className={classes.clearButton}
          onClick={clearAll}
          buttonType="secondary"
          compactX
        >
          Clear
        </Button>
      </header>

      {noneError && !isNoneErrorActuallyALinodeError && (
        <Notice error text={noneError} />
      )}

      <List>
        {selectedConfigs.map((eachConfig) => {
          return (
            <ListItem
              key={eachConfig.id}
              className={classes.list}
              disableGutters
              dense
            >
              <div className={classes.labelOuter}>
                <Typography variant="h3">{eachConfig.label}</Typography>
                <button
                  onClick={() => handleToggleConfig(eachConfig.id)}
                  className={classes.closeIcon}
                  data-qa-inline-delete
                >
                  <Close />
                </button>
              </div>
              <List className={classes.nestedList}>
                {eachConfig.associatedDisks.map((eachDisk) => {
                  return (
                    <ListItem key={eachDisk.label} disableGutters dense>
                      <Typography>{eachDisk.label}</Typography>
                    </ListItem>
                  );
                })}
              </List>
            </ListItem>
          );
        })}
      </List>
      <List>
        {selectedDisks.map((eachDisk) => {
          return (
            <ListItem
              key={eachDisk.id}
              className={classes.list}
              disableGutters
              dense
            >
              <Typography variant="h3">{eachDisk.label}</Typography>
              <button
                onClick={() => handleToggleDisk(eachDisk.id)}
                className={classes.closeIcon}
                data-qa-inline-delete
              >
                <Close />
              </button>
            </ListItem>
          );
        })}
      </List>

      {(selectedConfigs.length > 0 || selectedDisks.length > 0) && (
        <Divider spacingTop={16} spacingBottom={16} />
      )}

      <Typography>
        Current Datacenter: {region?.label ?? thisLinodeRegion}
      </Typography>

      {/* Show the estimated clone time if we're able to submit the form. */}
      {!isCloneButtonDisabled && (
        <Typography>Estimated time: {estimatedCloneTime}</Typography>
      )}

      <LinodeSelect
        label="Destination"
        selectedLinode={selectedLinodeId}
        handleChange={(linode) => {
          if (linode !== null) {
            handleSelectLinode(linode.id);
          }
        }}
        filterCondition={
          shouldExcludeCurrentLinode
            ? (linode: Linode) => linode.id !== currentLinodeId
            : undefined
        }
        textFieldProps={{
          error: !!linodeError,
        }}
        isClearable={false}
      />

      {linodeError && (
        <Typography variant="body1" className={classes.errorText}>
          {linodeError}{' '}
          <a
            href={errorMessageLinks.shrink}
            target="_blank"
            aria-describedby="external-site"
            rel="noopener noreferrer"
          >
            Shrink your existing disks
          </a>{' '}
          or{' '}
          <a
            href={errorMessageLinks.resize}
            target="_blank"
            aria-describedby="external-site"
            rel="noopener noreferrer"
          >
            resize your Linode to a larger plan.
          </a>
        </Typography>
      )}

      <Button
        className={classes.submitButton}
        disabled={isCloneButtonDisabled}
        buttonType="primary"
        onClick={handleClone}
        loading={isSubmitting}
      >
        Clone
      </Button>
    </Paper>
  );
};

export default Configs;
