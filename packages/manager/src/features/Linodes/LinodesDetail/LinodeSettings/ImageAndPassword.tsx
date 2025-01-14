import * as React from 'react';
import AccessPanel from 'src/components/AccessPanel/AccessPanel';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import { Item } from 'src/components/EnhancedSelect/Select';
import { ImageSelect } from 'src/features/Images';
import { useAllImagesQuery } from 'src/queries/images';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { LinodePermissionsError } from '../LinodePermissionsError';
import { useGrants } from 'src/queries/profile';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    margin: `${theme.spacing(3)} 0 ${theme.spacing(3)} 0`,
    padding: 0,
  },
}));

interface Props {
  onImageChange: (selected: Item<string>) => void;
  imageFieldError?: string;
  password: string;
  passwordError?: string;
  onPasswordChange: (password: string) => void;
  setAuthorizedUsers: (usernames: string[]) => void;
  authorizedUsers: string[];
  linodeId: number;
}

export const ImageAndPassword = (props: Props) => {
  const {
    imageFieldError,
    onImageChange,
    onPasswordChange,
    password,
    passwordError,
    setAuthorizedUsers,
    authorizedUsers,
    linodeId,
  } = props;

  const { data: grants } = useGrants();

  const classes = useStyles();

  const { data: imagesData, error: imagesError } = useAllImagesQuery();
  const _imagesError = imagesError
    ? getAPIErrorOrDefault(imagesError, 'Unable to load Images')[0].reason
    : undefined;

  const disabled =
    grants !== undefined &&
    grants.linode.find((g) => g.id === linodeId)?.permissions === 'read_only';

  return (
    <React.Fragment>
      {disabled && <LinodePermissionsError />}
      <ImageSelect
        images={imagesData ?? []}
        imageError={_imagesError}
        imageFieldError={imageFieldError}
        onSelect={onImageChange}
        disabled={disabled}
      />
      <AccessPanel
        className={classes.root}
        password={password || ''}
        handleChange={onPasswordChange}
        error={passwordError}
        authorizedUsers={authorizedUsers}
        setAuthorizedUsers={setAuthorizedUsers}
        disabled={disabled}
        disabledReason={
          disabled
            ? "You don't have permissions to modify this Linode"
            : undefined
        }
      />
    </React.Fragment>
  );
};
