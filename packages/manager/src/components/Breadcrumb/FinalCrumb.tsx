import classNames from 'classnames';
import * as React from 'react';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import { Typography } from 'src/components/Typography';
import { EditableText } from 'src/components/EditableText/EditableText';
import { H1Header } from 'src/components/H1Header/H1Header';
import { EditableProps, LabelProps } from './types';

const useStyles = makeStyles((theme: Theme) => ({
  editableContainer: {
    marginLeft: `-${theme.spacing()}`,
    '& > div': {
      width: 250,
    },
  },
  labelWrapper: {
    display: 'flex',
    flexDirection: 'column',
  },
  crumb: {
    color: theme.textColors.tableStatic,
    fontSize: '1.125rem',
    textTransform: 'capitalize',
  },
  noCap: {
    textTransform: 'initial',
  },
}));

interface Props {
  crumb: string;
  subtitle?: string;
  labelOptions?: LabelProps;
  onEditHandlers?: EditableProps;
}

export const FinalCrumb = React.memo((props: Props) => {
  const classes = useStyles();
  const { crumb, labelOptions, onEditHandlers } = props;

  if (onEditHandlers) {
    return (
      <EditableText
        text={onEditHandlers.editableTextTitle}
        errorText={onEditHandlers.errorText}
        onEdit={onEditHandlers.onEdit}
        onCancel={onEditHandlers.onCancel}
        labelLink={labelOptions && labelOptions.linkTo}
        data-qa-editable-text
        className={classes.editableContainer}
      />
    );
  }

  return (
    <div className={classes.labelWrapper}>
      <H1Header
        title={crumb}
        className={classNames({
          [classes.crumb]: true,
          [classes.noCap]: labelOptions && labelOptions.noCap,
        })}
        dataQaEl={crumb}
      />
      {labelOptions && labelOptions.subtitle && (
        <Typography variant="body1" data-qa-label-subtitle>
          {labelOptions.subtitle}
        </Typography>
      )}
    </div>
  );
});
