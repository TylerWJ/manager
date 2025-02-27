import { compose } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import Community from 'src/assets/icons/community.svg';
import Support from 'src/assets/icons/support.svg';
import { createStyles, withStyles, WithStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import { Typography } from 'src/components/Typography';
import { Tile } from 'src/components/Tile/Tile';
import Grid from '@mui/material/Unstable_Grid2';
import { AttachmentError } from 'src/features/Support/SupportTicketDetail/SupportTicketDetail';
import { SupportTicketDialog } from 'src/features/Support/SupportTickets/SupportTicketDialog';

type ClassNames =
  | 'root'
  | 'wrapper'
  | 'heading'
  | 'card'
  | 'tileTitle'
  | 'icon';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    wrapper: {
      marginTop: theme.spacing(4),
    },
    heading: {
      textAlign: 'center',
      marginBottom: theme.spacing(1),
    },
    card: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      backgroundColor: theme.color.white,
      padding: theme.spacing(4),
      border: `1px solid ${theme.color.grey2}`,
      height: '100%',
    },
    tileTitle: {
      fontSize: '1.2rem',
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
    },
    icon: {
      margin: '0 auto 16px',
      display: 'block',
      padding: 16,
      borderRadius: '50%',
      border: `2px solid ${theme.palette.divider}`,
      width: 66,
      height: 66,
      color: theme.palette.primary.main,
    },
  });

interface State {
  error?: string;
  drawerOpen: boolean;
}

type CombinedProps = RouteComponentProps<{}> & WithStyles<ClassNames>;

export class OtherWays extends React.Component<CombinedProps, State> {
  state: State = {
    drawerOpen: false,
  };

  openTicketDrawer = () => {
    this.setState({ drawerOpen: true });
  };

  closeTicketDrawer = () => {
    this.setState({ drawerOpen: false });
  };

  onTicketCreated = (
    ticketId: number,
    attachmentErrors: AttachmentError[] = []
  ) => {
    const { history } = this.props;
    history.push({
      pathname: `/support/tickets/${ticketId}`,
      state: { attachmentErrors },
    });
    this.setState({
      drawerOpen: false,
    });
  };

  render() {
    const { classes } = this.props;
    const { drawerOpen } = this.state;

    return (
      <>
        <Grid container className={classes.wrapper} spacing={2}>
          <Grid xs={12}>
            <Typography variant="h2" className={classes.heading}>
              Didn&rsquo;t find what you need? Get help.
            </Typography>
          </Grid>
          <Grid
            container
            sx={{
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Grid xs={12} sm={6} md={4}>
              <Tile
                title="Create a Community Post"
                description="Find help from other Linode users in the Community Find help from other Linode "
                icon={<Community />}
                link="https://linode.com/community/"
              />
            </Grid>
            <Grid xs={12} sm={6} md={4}>
              <Tile
                title="Open a ticket"
                description="If you are not able to solve an issue with the resources listed above,
                you can contact Linode Support"
                icon={<Support />}
                link={this.openTicketDrawer}
              />
            </Grid>
          </Grid>
        </Grid>
        <SupportTicketDialog
          open={drawerOpen}
          onClose={this.closeTicketDrawer}
          onSuccess={this.onTicketCreated}
        />
      </>
    );
  }
}

const styled = withStyles(styles);

export default compose<any, any, any>(styled, withRouter)(OtherWays);
