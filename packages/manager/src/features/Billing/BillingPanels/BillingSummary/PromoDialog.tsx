import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import { Button } from 'src/components/Button/Button';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { makeStyles } from 'tss-react/mui';
import { Typography } from 'src/components/Typography';
import { Notice } from 'src/components/Notice/Notice';
import { TextField } from 'src/components/TextField';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { addPromotion } from '@linode/api-v4/lib';
import { queryKey } from 'src/queries/account';
import { useSnackbar } from 'notistack';
import { APIError } from '@linode/api-v4/lib/types';
import { useQueryClient } from 'react-query';

const useStyles = makeStyles()(() => ({
  input: {
    maxWidth: 'unset',
    width: '100%',
  },
}));

interface Props {
  open: boolean;
  onClose: () => void;
}

const PromoDialog = (props: Props) => {
  const { open, onClose } = props;
  const { classes } = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [promoCode, setPromoCode] = React.useState<string>('');
  const [error, setError] = React.useState<string>();
  const [loading, setLoading] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (open) {
      setPromoCode('');
      setLoading(false);
      setError(undefined);
    }
  }, [open]);

  const addPromo = () => {
    setLoading(true);
    setError(undefined);
    addPromotion(promoCode)
      .then(() => {
        setLoading(false);
        enqueueSnackbar('Successfully applied promo to your account.', {
          variant: 'success',
        });
        queryClient.invalidateQueries(queryKey);
        onClose();
      })
      .catch((error: APIError[]) => {
        setLoading(false);
        setError(
          getAPIErrorOrDefault(error, 'Unable to add promo code')[0].reason
        );
      });
  };

  const actions = (
    <ActionsPanel>
      <Button buttonType="secondary" onClick={onClose}>
        Cancel
      </Button>
      <Button
        buttonType="primary"
        onClick={addPromo}
        loading={loading}
        disabled={!promoCode}
      >
        Apply Promo Code
      </Button>
    </ActionsPanel>
  );

  return (
    <ConfirmationDialog
      title="Add promo code"
      open={open}
      onClose={onClose}
      actions={actions}
    >
      {error && <Notice error text={error} />}
      <Typography>
        Enter the promo code in the field below. You will see promo details in
        the Promotions panel on the Billing Info tab.
      </Typography>
      <TextField
        label="Promo code"
        value={promoCode}
        className={classes.input}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setPromoCode(e.target.value)
        }
      />
    </ConfirmationDialog>
  );
};

export default PromoDialog;
