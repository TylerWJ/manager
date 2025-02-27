import * as React from 'react';
import { Notice } from 'src/components/Notice/Notice';

export const LinodePermissionsError = () => (
  <Notice
    error
    text="You don't have permission to modify this Linode. Please contact an account administrator for details."
  />
);
