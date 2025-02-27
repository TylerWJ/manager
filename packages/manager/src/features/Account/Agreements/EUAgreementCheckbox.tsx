import * as React from 'react';
import { Checkbox } from 'src/components/Checkbox';
import { Typography } from 'src/components/Typography';
import { Box } from 'src/components/Box';
import { Link } from 'src/components/Link';

interface Props {
  className?: string;
  centerCheckbox?: boolean;
  checked: boolean;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => void;
}

const EUAgreementCheckbox = (props: Props) => {
  const { checked, onChange, className, centerCheckbox } = props;

  const checkboxStyle = centerCheckbox
    ? { marginLeft: -8 }
    : { marginLeft: -8, marginTop: -5 };

  return (
    <Box
      display="flex"
      flexDirection="row"
      alignItems={centerCheckbox ? 'center' : 'flex-start'}
      className={className}
    >
      <Checkbox checked={checked} onChange={onChange} style={checkboxStyle} />
      <Typography style={{ marginLeft: 4 }}>
        I have read and agree to the{' '}
        <Link to="https://www.linode.com/legal-privacy/">
          Linode Privacy Policy
        </Link>{' '}
        and{' '}
        <Link to="https://www.linode.com/eu-model/">
          EU Standard Contractual Clauses
        </Link>
        , which govern the cross-border transfer of data relating to the
        European Economic Area.
      </Typography>
    </Box>
  );
};

export default EUAgreementCheckbox;
