import * as React from 'react';
import Box from '@mui/material/Box';
import { Typography, TypographyProps } from 'src/components/Typography';
import { styled } from '@mui/material/styles';

export interface HeaderProps {
  children?: React.ReactNode;
  isSummaryView?: boolean;
  title?: string | JSX.Element;
  variant?: TypographyProps['variant'];
}

export const EntityHeader = ({
  children,
  isSummaryView,
  title,
  variant = 'h2',
}: HeaderProps) => {
  return (
    <Wrapper>
      {isSummaryView ? (
        <Typography variant={variant} sx={sxTypography}>
          {title}
        </Typography>
      ) : null}
      {children && (
        <Box
          sx={{
            alignItems: 'center',
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          {children}
        </Box>
      )}
    </Wrapper>
  );
};

const Wrapper = styled('div', {
  name: 'EntityHeader',
})(({ theme }) => ({
  alignItems: 'center',
  backgroundColor: theme.bg.bgPaper,
  display: 'flex',
  justifyContent: 'space-between',
  margin: 0,
  width: '100%',
  [theme.breakpoints.down('sm')]: {
    flexWrap: 'wrap',
  },
}));

const sxTypography = {
  whiteSpace: 'nowrap',
  padding: 1,
};
