import copy from 'copy-to-clipboard';
import * as React from 'react';
import SSHKeyIcon from 'src/assets/icons/ssh-key.svg';
import { Button } from 'src/components/Button/Button';
import { CircleProgress } from 'src/components/CircleProgress';
import { Box } from 'src/components/Box';
import Paper from 'src/components/core/Paper';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import { Typography } from 'src/components/Typography';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import Grid from '@mui/material/Unstable_Grid2';
import { useManagedSSHKey } from 'src/queries/managed/managed';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';

// @todo: is this URL correct? Are there new docs being written?
const DOC_URL =
  'https://www.linode.com/docs/platform/linode-managed/#adding-the-public-key';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(2.5),
    minHeight: '112px',
  },
  errorState: {
    padding: `calc(${theme.spacing(2)} - 1px)`,
    '& > div': {
      padding: 0,
    },
  },
  loadingState: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    padding: theme.spacing(5),
  },
  icon: {
    marginRight: theme.spacing(1),
    marginBottom: `calc(${theme.spacing(1)} - 2px)`,
    stroke: theme.color.offBlack,
  },
  sshKeyContainer: {
    display: 'flex',
    alignItems: 'center',
    flex: 1,
  },
  sshKey: {
    // NOTE A:
    // I'm not confident about this CSS, but it works on recent versions
    // of Chrome, Firefox, Safari, and Edge. If we run into inconsistencies
    // in other environments, consider removing it and using the fallback
    // provided in the component below.
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    transition: 'all 1s ease-in',
    overflow: 'hidden',
    wordBreak: 'break-all',
    fontFamily: '"Ubuntu Mono", monospace, sans-serif',
    color: theme.color.grey1,
    fontSize: '0.9rem',
    [theme.breakpoints.up('md')]: {
      padding: `0 ${theme.spacing(4)} 0 ${theme.spacing(1)}`,
    },
    [theme.breakpoints.up('lg')]: {
      paddingRight: theme.spacing(6),
    },
    [theme.breakpoints.up('xl')]: {
      paddingRight: theme.spacing(4),
      paddingLeft: theme.spacing(4),
    },
    '&:hover': {
      transition: 'all 1s ease-in',
      WebkitLineClamp: 'unset',
    },
  },
  copyToClipboard: {
    alignItems: 'flex-start',
    display: 'flex',
    justifyContent: 'flex-start',
    [theme.breakpoints.up('sm')]: {
      justifyContent: 'flex-end',
    },
    '& > button': {
      minWidth: 190,
      marginTop: theme.spacing(1),
    },
  },
}));

const LinodePubKey: React.FC<{}> = () => {
  const classes = useStyles();

  const { data, isLoading, error } = useManagedSSHKey();

  const [copied, setCopied] = React.useState<boolean>(false);
  const timeout = React.useRef<NodeJS.Timeout>();

  React.useEffect(() => {
    if (copied) {
      timeout.current = setTimeout(() => {
        setCopied(false);
      }, 1000);
    }

    return () => {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
    };
  }, [copied]);

  const handleCopy = () => {
    if (data) {
      setCopied(true);
      copy(data.ssh_key);
    }
  };

  if (error) {
    const errorMessage = getErrorStringOrDefault(error);
    return (
      <Paper className={classes.errorState}>
        <ErrorState cozy errorText={errorMessage} />
      </Paper>
    );
  }

  if (isLoading) {
    return (
      <Paper className={`${classes.root} ${classes.loadingState}`}>
        <CircleProgress mini className={classes.spinner} />
      </Paper>
    );
  }

  return (
    <Paper className={classes.root}>
      <Grid container justifyContent="space-between" spacing={2}>
        <Grid xs={12} md={3} lg={4}>
          <Box display="flex" flexDirection="row">
            <SSHKeyIcon className={classes.icon} />
            <Typography variant="h3">Linode Public Key</Typography>
          </Box>
          <Typography>
            You must{' '}
            <a
              href={DOC_URL}
              target="_blank"
              aria-describedby="external-site"
              rel="noopener noreferrer"
            >
              install our public SSH key
            </a>{' '}
            on all managed Linodes so we can access them and diagnose issues.
          </Typography>
        </Grid>
        {/* Hide the SSH key on x-small viewports */}
        <Grid xs={12} sm={5} md={6} className={classes.sshKeyContainer}>
          <Typography variant="subtitle1" className={classes.sshKey}>
            {data?.ssh_key || ''}
            {/* See NOTE A. If that CSS is removed, we can use the following instead: */}
            {/* pubKey.slice(0, 160)} . . . */}
          </Typography>
        </Grid>
        <Grid xs={12} sm={4} md={3} lg={2} className={classes.copyToClipboard}>
          <Button buttonType="secondary" onClick={handleCopy}>
            {!copied ? 'Copy to clipboard' : 'Copied!'}
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default LinodePubKey;
