import * as React from 'react';
import BarPercent from 'src/components/BarPercent';
import { Box } from 'src/components/Box';
import { Divider } from 'src/components/Divider';
import { Typography } from 'src/components/Typography';
import { Duration } from 'luxon';
import { Event } from '@linode/api-v4/lib/account/types';
import { extendTypesQueryResult } from 'src/utilities/extendType';
import { isNotNullOrUndefined } from 'src/utilities/nullOrUndefined';
import { useSpecificTypes } from 'src/queries/types';
import {
  eventLabelGenerator,
  eventMessageGenerator,
} from 'src/eventMessageGenerator_CMR';
import {
  RenderEventGravatar,
  RenderEventStyledBox,
  useRenderEventStyles,
} from './RenderEvent.styles';
import { useAllLinodesQuery } from 'src/queries/linodes/linodes';

interface Props {
  event: Event;
  onClose: () => void;
}

export const RenderProgressEvent = (props: Props) => {
  const { classes } = useRenderEventStyles();
  const { event } = props;
  const { data: linodes } = useAllLinodesQuery();
  const typesQuery = useSpecificTypes(
    (linodes ?? []).map((linode) => linode.type).filter(isNotNullOrUndefined)
  );
  const types = extendTypesQueryResult(typesQuery);
  const message = eventMessageGenerator(event, linodes, types);

  if (message === null) {
    return null;
  }

  const parsedTimeRemaining = formatTimeRemaining(event.time_remaining);

  const formattedTimeRemaining = parsedTimeRemaining
    ? ` (~${parsedTimeRemaining})`
    : null;

  const eventMessage = (
    <Typography>
      {event.action !== 'volume_migrate' ? eventLabelGenerator(event) : ''}
      {` `}
      {message}
      {formattedTimeRemaining}
    </Typography>
  );

  return (
    <>
      <RenderEventStyledBox display="flex" data-test-id={event.action}>
        <RenderEventGravatar username={event.username} />
        <Box sx={{ marginTop: '-2px' }} data-test-id={event.action}>
          {eventMessage}
          <BarPercent
            className={classes.bar}
            max={100}
            value={event.percent_complete ?? 0}
            rounded
            narrow
          />
        </Box>
      </RenderEventStyledBox>
      <Divider className={classes.bar} />
    </>
  );
};

export const formatTimeRemaining = (time: string | null) => {
  if (!time) {
    return null;
  }

  try {
    const [hours, minutes, seconds] = time.split(':').map(Number);
    if (
      [hours, minutes, seconds].some(
        (thisNumber) => typeof thisNumber === 'undefined'
      ) ||
      [hours, minutes, seconds].some(isNaN)
    ) {
      // Bad input, don't display a duration
      return null;
    }
    const duration = Duration.fromObject({ hours, minutes, seconds });
    return hours > 0
      ? `${Math.round(duration.as('hours'))} hours remaining`
      : `${Math.round(duration.as('minutes'))} minutes remaining`;
  } catch {
    // Broken/unexpected input
    return null;
  }
};

export default React.memo(RenderProgressEvent);
