import * as React from 'react';
import ListItem from 'src/components/core/ListItem';
import { formatPlanTypes } from 'src/utilities/planNotices';
import { getCapabilityFromPlanType } from 'src/utilities/planNotices';
import { Notice } from 'src/components/Notice/Notice';
import type { LinodeTypeClass, Region } from '@linode/api-v4';
import {
  StyledFormattedRegionList,
  StyledNoticeTypography,
  StyledTextTooltip,
} from './PlansAvailabilityNotice.styles';

export interface PlansAvailabilityNoticeProps {
  isSelectedRegionEligibleForPlan: boolean;
  hasSelectedRegion: boolean;
  regionsData: Region[];
  planType: LinodeTypeClass;
}

export const PlansAvailabilityNotice = React.memo(
  (props: PlansAvailabilityNoticeProps) => {
    const {
      hasSelectedRegion,
      isSelectedRegionEligibleForPlan,
      planType,
      regionsData,
    } = props;
    const capability = getCapabilityFromPlanType(planType);

    const getEligibleRegionList = React.useCallback(() => {
      return (
        regionsData?.filter((region: Region) =>
          region.capabilities.includes(capability)
        ) || []
      );
    }, [capability, regionsData]);

    return (
      <PlansAvailabilityNoticeMessage
        hasSelectedRegion={hasSelectedRegion}
        isSelectedRegionEligibleForPlan={isSelectedRegionEligibleForPlan}
        planType={planType}
        regionList={getEligibleRegionList()}
      />
    );
  }
);

interface PlansAvailabilityNoticeMessageProps {
  hasSelectedRegion: boolean;
  isSelectedRegionEligibleForPlan: boolean;
  planType: LinodeTypeClass;
  regionList: Region[];
}

const PlansAvailabilityNoticeMessage = (
  props: PlansAvailabilityNoticeMessageProps
) => {
  const {
    hasSelectedRegion,
    isSelectedRegionEligibleForPlan,
    planType,
    regionList,
  } = props;

  const FormattedRegionList = () => (
    <StyledFormattedRegionList>
      {regionList?.map((region: Region) => {
        return (
          <ListItem
            disablePadding
            key={region.id}
          >{`${region.label} (${region.id})`}</ListItem>
        );
      })}
    </StyledFormattedRegionList>
  );

  const formattedPlanType = formatPlanTypes(planType);

  if (!hasSelectedRegion) {
    return (
      <Notice warning dataTestId={`${planType}-notice-warning`}>
        <StyledNoticeTypography>
          {formattedPlanType} Plans are currently available in&nbsp;
          <StyledTextTooltip
            displayText="select regions"
            tooltipText={<FormattedRegionList />}
          />
          .
        </StyledNoticeTypography>
      </Notice>
    );
  }

  if (hasSelectedRegion && !isSelectedRegionEligibleForPlan) {
    return (
      <Notice error dataTestId={`${planType}-notice-error`}>
        <StyledNoticeTypography>
          {formattedPlanType} Plans are not currently available in this
          region.&nbsp;
          <StyledTextTooltip
            displayText="See global availability"
            tooltipText={<FormattedRegionList />}
          />
          .
        </StyledNoticeTypography>
      </Notice>
    );
  }

  return null;
};
