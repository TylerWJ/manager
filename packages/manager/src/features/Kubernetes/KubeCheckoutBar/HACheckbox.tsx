import * as React from 'react';
import { Checkbox } from 'src/components/Checkbox';
import { Box } from 'src/components/Box';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import { Typography } from 'src/components/Typography';
import { DisplayPrice } from 'src/components/DisplayPrice';
import { Link } from 'src/components/Link';
import { HIGH_AVAILABILITY_PRICE } from 'src/constants';

export const HACopy = () => (
  <Typography>
    A high availability (HA) control plane is replicated on multiple master
    nodes to provide 99.99% uptime, and is recommended for production workloads.{' '}
    <Link to="https://www.linode.com/docs/guides/enable-lke-high-availability/">
      Learn more about the HA control plane
    </Link>
    .
  </Typography>
);

const useStyles = makeStyles((theme: Theme) => ({
  heading: {
    paddingTop: theme.spacing(0.5),
    paddingBottom: theme.spacing(),
    fontSize: '16px',
    fontWeight: 600,
  },
  checkbox: {
    marginTop: -8,
    marginLeft: -8,
  },
  price: {
    marginTop: theme.spacing(),
    '& h3': {
      color: `${theme.palette.text.primary} !important`,
      fontFamily: theme.font.normal,
    },
  },
}));

export interface Props {
  checked: boolean;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => void;
}

const HACheckbox: React.FC<Props> = (props) => {
  const { checked, onChange } = props;
  const classes = useStyles();

  if (HIGH_AVAILABILITY_PRICE === undefined) {
    return null;
  }

  return (
    <Box>
      <Box display="flex" flexDirection="row" alignItems="flex-start">
        <Checkbox
          checked={checked}
          onChange={onChange}
          className={classes.checkbox}
          data-testid="ha-checkbox"
        />
        <Box>
          <Typography className={classes.heading}>
            Enable HA Control Plane
          </Typography>
          <HACopy />
        </Box>
      </Box>
      <Box className={classes.price}>
        <DisplayPrice
          price={HIGH_AVAILABILITY_PRICE}
          fontSize="14px"
          interval="month"
        />
      </Box>
    </Box>
  );
};

export default HACheckbox;
