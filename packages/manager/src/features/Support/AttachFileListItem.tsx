import Close from '@mui/icons-material/Close';
import CloudUpload from '@mui/icons-material/CloudUpload';
import * as React from 'react';
import { compose, withHandlers } from 'recompose';
import InputAdornment from 'src/components/core/InputAdornment';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import { LinearProgress } from 'src/components/LinearProgress';
import { TextField } from 'src/components/TextField';
import { FileAttachment } from './index';

const useStyles = makeStyles((theme: Theme) => ({
  attachmentField: {
    marginTop: 0,
    width: 415,
    [theme.breakpoints.down('sm')]: {
      width: 165,
    },
    '& > div ': {
      backgroundColor: 'transparent',
      border: 0,
    },
    '& svg': {
      color: theme.palette.text.primary,
      width: 24,
      fontSize: 22,
    },
  },
  closeIcon: {
    cursor: 'pointer',
  },
  uploadProgress: {
    maxWidth: 415,
  },
}));

interface HandlerProps {
  onClick: () => void;
}

interface Props {
  file: FileAttachment;
  fileIdx: number;
  removeFile: (fileIdx: number) => void;
}

type CombinedProps = Props & HandlerProps;

export const AttachFileListItem: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

  const { file, onClick } = props;
  if (file.uploaded) {
    return null;
  }
  const err =
    file.errors && file.errors.length ? file.errors[0].reason : undefined;

  return (
    <Grid container spacing={2}>
      <Grid>
        <TextField
          className={classes.attachmentField}
          value={file.name}
          errorText={err}
          InputProps={{
            startAdornment: (
              <InputAdornment position="end">
                <CloudUpload />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment
                onClick={onClick}
                position="end"
                className={classes.closeIcon}
                data-testid="delete-button"
                data-qa-inline-delete
              >
                <Close />
              </InputAdornment>
            ),
          }}
          label="File Attached"
          aria-label="Disabled Text Field"
          hideLabel
          data-testid="attached-file"
        />
      </Grid>
      {file.uploading && (
        <Grid xs={12}>
          <LinearProgress
            className={classes.uploadProgress}
            variant="indeterminate"
          />
        </Grid>
      )}
    </Grid>
  );
};

const enhanced = compose<CombinedProps, Props>(
  withHandlers({
    onClick: (props: Props) => () => {
      props.removeFile(props.fileIdx);
    },
  })
)(AttachFileListItem);
export default enhanced;
