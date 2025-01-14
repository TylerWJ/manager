import * as React from 'react';
import { createStyles, withStyles, WithStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import { Typography } from 'src/components/Typography';
import { displayPrice as _displayPrice } from 'src/components/DisplayPrice/DisplayPrice';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { ExtendedType } from 'src/utilities/extendType';
import { ExtendedLinode } from './types';

type ClassNames = 'root' | 'error';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    error: {
      color: theme.color.red,
      fontSize: 13,
    },
  });

interface Props {
  linodes: ExtendedLinode[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const displayPrice = (price: string | number) => {
  if (typeof price === 'string') {
    return price;
  }
  return _displayPrice(price);
};

const getLabel = (type?: ExtendedType) => type?.formattedLabel ?? 'Unknown';

const getPrice = (type?: ExtendedType) =>
  type?.addons?.backups?.price?.monthly ?? 'Unavailable';

export const BackupLinodes: React.FC<CombinedProps> = (props) => {
  const { classes, linodes } = props;
  return (
    <React.Fragment>
      {linodes &&
        linodes.map((linode: ExtendedLinode, idx: number) => {
          const error = linode.linodeError?.reason ?? '';
          return (
            <React.Fragment key={`backup-linode-${idx}`}>
              <TableRow data-qa-linodes>
                <TableCell data-qa-linode-label parentColumn="Label">
                  <Typography variant="body1">{linode.label}</Typography>
                  {error && (
                    <Typography variant="body1" className={classes.error}>
                      {error}
                    </Typography>
                  )}
                </TableCell>

                <TableCell data-qa-linode-plan parentColumn="Plan">
                  {getLabel(linode.typeInfo)}
                </TableCell>
                <TableCell
                  data-qa-backup-price
                  parentColumn="Price"
                >{`${displayPrice(getPrice(linode.typeInfo))}/mo`}</TableCell>
              </TableRow>
            </React.Fragment>
          );
        })}
    </React.Fragment>
  );
};

BackupLinodes.displayName = 'BackupLinodes';

const styled = withStyles(styles);

export default styled(BackupLinodes);
