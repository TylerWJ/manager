import { UserDefinedField } from '@linode/api-v4/lib/stackscripts';
import { APIError } from '@linode/api-v4/lib/types';
import classnames from 'classnames';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { Box } from 'src/components/Box';
import Paper from 'src/components/core/Paper';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import { Typography } from 'src/components/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import { Divider } from 'src/components/Divider';
import { Notice } from 'src/components/Notice/Notice';
import RenderGuard from 'src/components/RenderGuard';
import ShowMoreExpansion from 'src/components/ShowMoreExpansion';
import AppInfo from '../../Linodes/LinodesCreate/AppInfo';
import UserDefinedMultiSelect from './FieldTypes/UserDefinedMultiSelect';
import { UserDefinedSelect } from './FieldTypes/UserDefinedSelect';
import UserDefinedText from './FieldTypes/UserDefinedText';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
    '& > div:last-child': {
      border: 0,
      marginBottom: 0,
      paddingBottom: 0,
    },
  },
  advDescription: {
    margin: `${theme.spacing(2)} 0`,
  },
  username: {
    color: theme.color.grey1,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    columnGap: theme.spacing(),
    '& > img': {
      width: 60,
      height: 60,
    },
  },
  marketplaceSpacing: {
    paddingTop: theme.spacing(),
    paddingBottom: theme.spacing(),
  },
  clusterNotice: {
    paddingTop: '1rem',
  },
}));

interface Props {
  errors?: APIError[];
  userDefinedFields?: UserDefinedField[];
  handleChange: (key: string, value: any) => void;
  udf_data: any;
  selectedLabel: string;
  selectedUsername: string;
  appLogo?: JSX.Element;
  openDrawer?: (stackScriptLabel: string) => void;
  setNumberOfNodesForAppCluster?: (num: number) => void;
}

type CombinedProps = Props;

const renderField = (
  udf_data: any,
  handleChange: Props['handleChange'],
  field: UserDefinedField,
  error?: string
) => {
  // if the 'default' key is returned from the API, the field is optional
  const isOptional = field.hasOwnProperty('default');

  if (isHeader(field)) {
    return (
      <Grid xs={12} lg={5} key={field.name} style={{ marginTop: 24 }}>
        <Divider />
        <Typography variant="h2">{field.label}</Typography>
      </Grid>
    );
  }

  if (isMultiSelect(field)) {
    return (
      <Grid xs={12} lg={5} key={field.name}>
        <UserDefinedMultiSelect
          key={field.name}
          field={field}
          value={udf_data[field.name] || ''}
          updateFormState={handleChange}
          updateFor={[field.label, udf_data[field.name], error]}
          isOptional={isOptional}
          error={error}
        />
      </Grid>
    );
  }
  if (isOneSelect(field)) {
    return (
      <Grid xs={12} lg={5} key={field.name}>
        <UserDefinedSelect
          field={field}
          updateFormState={handleChange}
          value={udf_data[field.name] || ''}
          isOptional={isOptional}
          key={field.name}
          error={error}
        />{' '}
      </Grid>
    );
  }
  if (isPasswordField(field.name)) {
    const isTokenPassword = field.name === 'token_password';
    return (
      <Grid xs={12} lg={5} key={field.name}>
        <UserDefinedText
          /**
           * we are explicitly passing the value to solve for the situation
           * where you're switching between stackscripts or one-click-apps
           * and the same UDF with the same label appears in both stackscripts.
           *
           * The problem here is that unless we explicitly pass the value,
           * the form state will be reset but because MUI handles the
           * value internally, the pre-inputted value will still exist in the
           * textfield
           *
           * To test the incorrect behavior, try removing the "value" prop here,
           * navigate to the One-Click app creation flow, click on MERN, fill out
           * a DB password, then switch to LAMP. You'll see the value will
           * still be in the form field.
           *
           * This comment is wordy as heck but it's important that we never remove this
           * prop or that bug will return
           */
          value={udf_data[field.name] || ''}
          updateFormState={handleChange}
          isPassword={true}
          field={field}
          updateFor={[field.label, udf_data[field.name], error]}
          isOptional={isOptional}
          placeholder={isTokenPassword ? 'Enter your token' : field.example}
          error={error}
          tooltip={
            isTokenPassword ? (
              <>
                {' '}
                To create an API token, go to{' '}
                <Link to="/profile/tokens">your profile.</Link>
              </>
            ) : undefined
          }
          tooltipInteractive={isTokenPassword}
        />
      </Grid>
    );
  }
  return (
    <Grid xs={12} lg={5} key={field.name}>
      <UserDefinedText
        /** see comment above for why we're passing the value prop */
        value={udf_data[field.name] || ''}
        updateFormState={handleChange}
        field={field}
        updateFor={[field.label, udf_data[field.name], error]}
        isOptional={isOptional}
        placeholder={field.example}
        error={error}
      />
    </Grid>
  );
};

const handleOpenDrawer = (
  openDrawer: CombinedProps['openDrawer'],
  selectedLabel: string
) => () => {
  openDrawer?.(selectedLabel);
};

const UserDefinedFieldsPanel = (props: CombinedProps) => {
  const classes = useStyles();
  const {
    userDefinedFields,
    openDrawer,
    selectedLabel,
    handleChange,
    udf_data,
    errors,
    appLogo,
    setNumberOfNodesForAppCluster,
  } = props;

  const [requiredUDFs, optionalUDFs] = separateUDFsByRequiredStatus(
    userDefinedFields!
  );

  const isCluster = userDefinedFields?.some(
    (udf) => udf.name === 'cluster_size'
  );
  const numberOfNodes =
    udf_data['cluster_size'] !== undefined && udf_data['cluster_size'] !== null
      ? Number(udf_data['cluster_size'])
      : 0;

  React.useEffect(() => {
    if (setNumberOfNodesForAppCluster) {
      setNumberOfNodesForAppCluster(numberOfNodes);
    }
  }, [setNumberOfNodesForAppCluster, numberOfNodes]);

  const isDrawerOpenable = openDrawer !== undefined;

  return (
    <Paper
      className={classnames(classes.root, {
        [`${classes.marketplaceSpacing}`]: isDrawerOpenable,
      })}
    >
      <Box className={classes.header}>
        {appLogo}
        <Typography variant="h2" data-qa-user-defined-field-header>
          <span>{`${selectedLabel} Setup`}</span>
        </Typography>
        {isDrawerOpenable ? (
          <AppInfo onClick={handleOpenDrawer(openDrawer, selectedLabel)} />
        ) : null}
      </Box>

      {isCluster ? (
        <div
          className={classes.clusterNotice}
          data-testid="create-cluster-notice"
        >
          <Notice success>
            <strong>
              You are creating a cluster with {numberOfNodes} nodes.
            </strong>
          </Notice>
        </div>
      ) : null}

      {/* Required Fields */}
      {requiredUDFs.map((field: UserDefinedField) => {
        const error = getError(field, errors);
        return renderField(udf_data, handleChange, field, error);
      })}
      {/* Optional Fields */}
      {optionalUDFs.length !== 0 && (
        <ShowMoreExpansion name="Advanced Options" defaultExpanded={true}>
          <>
            <Typography variant="body1" className={classes.advDescription}>
              These fields are additional configuration options and are not
              required for creation.
            </Typography>
            <div>
              {optionalUDFs.map((field: UserDefinedField) => {
                const error = getError(field, errors);
                return renderField(udf_data, handleChange, field, error);
              })}
            </div>
          </>
        </ShowMoreExpansion>
      )}
    </Paper>
  );
};

const getError = (field: UserDefinedField, errors?: APIError[]) => {
  if (!errors) {
    return;
  }
  const error = errors.find((thisError) => thisError.field === field.name);
  return error ? error.reason.replace('the UDF', '') : undefined;
};

const isPasswordField = (udfName: string) => {
  return udfName.toLowerCase().includes('password');
};

const isOneSelect = (udf: UserDefinedField) => {
  return !!udf.oneof; // if we have a oneof prop, it's a radio button
};

const isMultiSelect = (udf: UserDefinedField) => {
  return !!udf.manyof; // if we have a manyof prop, it's a checkbox
};

const isHeader = (udf: UserDefinedField) => {
  return udf.header?.toLowerCase() === 'yes';
};

/**
 * Used to separate required UDFs from non-required ones
 *
 * @return nested array [[...requiredUDFs], [...nonRequiredUDFs]]
 */
const separateUDFsByRequiredStatus = (udfs: UserDefinedField[] = []) => {
  return udfs.reduce(
    (accum, eachUDF) => {
      /**
       * if the "default" key exists, it's optional
       */
      if (
        eachUDF.hasOwnProperty('default') &&
        !eachUDF.hasOwnProperty('required')
      ) {
        return [[...accum[0]], [...accum[1], eachUDF]];
      } else {
        return [[...accum[0], eachUDF], [...accum[1]]];
      }
    },
    [[], []]
  );
};

export default RenderGuard(UserDefinedFieldsPanel);
