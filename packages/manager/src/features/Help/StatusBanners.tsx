import Box from '@mui/material/Box';
import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import { DateTime } from 'luxon';
import * as React from 'react';
import DismissibleBanner from 'src/components/DismissibleBanner';
import { Typography } from 'src/components/Typography';
import { Link } from 'src/components/Link';
import {
  IncidentImpact,
  IncidentStatus,
  useIncidentQuery,
} from 'src/queries/statusPage';
import { capitalize } from 'src/utilities/capitalize';
import { sanitizeHTML } from 'src/utilities/sanitize-html';
import { truncateEnd } from 'src/utilities/truncate';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginBottom: theme.spacing(),
  },
  button: {
    ...theme.applyLinkStyles,
    display: 'flex',
  },
  text: {
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
  },
  header: {
    fontSize: '1rem',
    marginBottom: theme.spacing(),
  },
}));

export const StatusBanners: React.FC<{}> = (_) => {
  const { data: incidentsData } = useIncidentQuery();
  const incidents = incidentsData?.incidents ?? [];

  if (incidents.length === 0) {
    return null;
  }

  return (
    // eslint-disable-next-line
    <>
      {incidents.map((thisIncident) => {
        const mostRecentUpdate = thisIncident.incident_updates.filter(
          (thisUpdate) => thisUpdate.status !== 'postmortem'
        )[0];
        return (
          <IncidentBanner
            key={thisIncident.id}
            title={thisIncident.name}
            message={mostRecentUpdate?.body ?? ''}
            status={thisIncident.status}
            impact={thisIncident.impact}
            href={thisIncident.shortlink}
          />
        );
      })}
    </>
  );
};

export interface IncidentProps {
  message: string;
  title: string;
  // Maintenance events have statuses but we don't need to display them
  status?: IncidentStatus;
  href: string;
  impact: IncidentImpact;
}

export const IncidentBanner: React.FC<IncidentProps> = React.memo((props) => {
  const { message, status: _status, title, impact, href } = props;
  const status = _status ?? '';
  const classes = useStyles();

  const preferenceKey = `${href}-${status}`;

  return (
    <DismissibleBanner
      important
      warning={
        ['major', 'minor', 'none'].includes(impact) ||
        ['monitoring', 'resolved'].includes(status)
      }
      error={
        impact === 'critical' && !['monitoring', 'resolved'].includes(status)
      }
      className={classes.root}
      preferenceKey={preferenceKey}
      options={{
        label: preferenceKey,
        expiry: DateTime.utc().plus({ days: 1 }).toISO(),
      }}
    >
      <Box display="flex" flexDirection="column">
        <Typography data-testid="status-banner" className={classes.header}>
          <Link to={href}>
            <strong data-testid="incident-status">
              {title}
              {status ? `: ${capitalize(status)}` : ''}
            </strong>
          </Link>
        </Typography>
        <Typography
          dangerouslySetInnerHTML={{
            __html: sanitizeHTML(truncateEnd(message, 500)),
          }}
          className={classes.text}
        />
      </Box>
    </DismissibleBanner>
  );
});

export default React.memo(StatusBanners);
