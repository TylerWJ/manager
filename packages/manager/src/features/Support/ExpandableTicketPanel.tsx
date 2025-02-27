import { SupportReply, SupportTicket } from '@linode/api-v4';
import * as React from 'react';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import { Typography } from 'src/components/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { Hively, shouldRenderHively } from './Hively';
import TicketDetailBody from './TicketDetailText';
import { OFFICIAL_USERNAMES } from './ticketUtils';
import UserIcon from 'src/assets/icons/account.svg';
import Avatar from '@mui/material/Avatar';

const useStyles = makeStyles((theme: Theme) => ({
  '@keyframes fadeIn': {
    from: {
      opacity: 0,
    },
    to: {
      opacity: 1,
    },
  },
  userWrapper: {
    marginTop: theme.spacing(0.5),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    width: 32,
    height: 32,
    position: 'relative',
    top: -2,
    [theme.breakpoints.down('lg')]: {
      marginLeft: theme.spacing(),
    },
    [theme.breakpoints.up('sm')]: {
      marginRight: theme.spacing(1),
      width: 40,
      height: 40,
    },
  },
  leftIcon: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    color: theme.palette.text.primary,
  },
  content: {
    width: '100%',
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(2),
    padding: theme.spacing(1),
    backgroundColor: theme.color.white,
    border: `1px solid ${theme.color.grey2}`,
    borderRadius: theme.shape.borderRadius,
  },
  header: {
    padding: `0 ${theme.spacing(1)}`,
    minHeight: 40,
    backgroundColor: theme.color.grey2,
    borderTopLeftRadius: theme.shape.borderRadius,
    borderTopRightRadius: theme.shape.borderRadius,
  },
  headerInner: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  userName: {
    whiteSpace: 'nowrap',
    fontFamily: 'LatoWebBold', // we keep this bold at all times
    color: theme.color.headline,
    marginRight: 4,
  },
  expert: {
    marginRight: 4,
    whiteSpace: 'nowrap',
  },
}));

interface Props {
  reply?: SupportReply;
  ticket?: SupportTicket;
  open?: boolean;
  isCurrentUser: boolean;
  parentTicket?: number;
  ticketUpdated?: string;
}

interface Data {
  gravatar_id: string;
  date: string;
  description: string;
  username: string;
  friendly_name: string;
  from_linode: boolean;
  ticket_id: string;
  reply_id: string;
  updated: string;
}

export const ExpandableTicketPanel = React.memo((props: Props) => {
  const classes = useStyles();

  const { parentTicket, ticket, open, reply, ticketUpdated } = props;

  const [data, setData] = React.useState<Data | undefined>(undefined);

  React.useEffect(() => {
    if (!ticket && !reply) {
      return;
    }
    if (ticket) {
      return setData({
        ticket_id: String(ticket.id),
        reply_id: '',
        gravatar_id: ticket.gravatar_id,
        date: ticket.opened,
        description: ticket.description,
        username: ticket.opened_by,
        from_linode: false,
        friendly_name: ticket.opened_by,
        updated: ticket.updated,
      });
    } else if (reply) {
      return setData({
        ticket_id: parentTicket ? String(parentTicket) : '',
        reply_id: String(reply.id),
        gravatar_id: reply.gravatar_id,
        date: reply.created,
        description: reply.description,
        username: reply.created_by,
        from_linode: reply.from_linode,
        friendly_name: reply.friendly_name,
        updated: ticketUpdated!,
      });
    }
  }, [parentTicket, reply, ticket, ticketUpdated]);

  const renderAvatar = (id: string) => {
    return (
      <div className={classes.userWrapper}>
        <Avatar
          src={`https://gravatar.com/avatar/${id}?d=404`}
          className={classes.leftIcon}
          alt="Gravatar"
        >
          <UserIcon />
        </Avatar>
      </div>
    );
  };

  /**
   * data.description will be a blank string if it contained ONLY malicious markup
   * because we sanitize it in this.getData()
   */
  if (!data || !data.description) {
    return null;
  }

  return (
    <Grid container wrap="nowrap">
      <Grid>{renderAvatar(data.gravatar_id)}</Grid>
      <Grid className={`${classes.content}`}>
        <Grid container className={classes.header}>
          <Grid className={classes.headerInner}>
            <Typography className={classes.userName} component="span">
              {data.friendly_name}
            </Typography>
            {data.from_linode && !OFFICIAL_USERNAMES.includes(data.username) ? (
              <Typography
                component="span"
                variant="body1"
                className={classes.expert}
              >
                <em>Linode Expert</em>
              </Typography>
            ) : null}
            <Typography variant="body1" component="span">
              commented <DateTimeDisplay value={data.date} />
            </Typography>
          </Grid>
        </Grid>
        <TicketDetailBody open={open} text={data.description} />
        {shouldRenderHively(data.from_linode, data.updated, data.username) && (
          <Hively
            linodeUsername={data.username}
            ticketId={data.ticket_id}
            replyId={data.reply_id}
          />
        )}
      </Grid>
    </Grid>
  );
});
