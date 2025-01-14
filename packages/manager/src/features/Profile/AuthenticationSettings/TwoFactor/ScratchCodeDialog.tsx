import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import { Button } from 'src/components/Button/Button';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Typography } from 'src/components/Typography';

interface Props {
  open: boolean;
  onClose: () => void;
  scratchCode: string;
}

export const ScratchCodeDialog = (props: Props) => {
  const { open, onClose, scratchCode } = props;

  return (
    <ConfirmationDialog
      open={open}
      title="Scratch Code"
      onClose={onClose}
      actions={
        <ActionsPanel>
          <Button buttonType="secondary" onClick={onClose} data-qa-submit>
            Got it
          </Button>
        </ActionsPanel>
      }
    >
      <Typography>
        {`This scratch code can be used in place of two-factor authentication in the event
          you cannot access your two-factor authentication device. It is limited to a one-time
          use. Be sure to make a note of it and keep it secure, as this is the only time it
          will appear:`}
      </Typography>
      <Typography
        style={{
          marginTop: '16px',
        }}
        variant="h5"
      >
        {scratchCode}
      </Typography>
    </ConfirmationDialog>
  );
};
