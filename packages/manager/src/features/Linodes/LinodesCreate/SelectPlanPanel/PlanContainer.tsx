import * as React from 'react';
import { LinodeTypeClass } from '@linode/api-v4/lib/linodes';
import Grid from '@mui/material/Unstable_Grid2';
import { TableBody } from 'src/components/TableBody';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { Hidden } from 'src/components/Hidden';
import { ExtendedType } from 'src/utilities/extendType';
import { PlanSelection, PlanSelectionType } from './PlanSelection';
import { StyledTableCell, StyledTable } from './PlanContainer.styles';

const tableCells = [
  { cellName: '', testId: '', center: false, noWrap: false },
  { cellName: 'Plan', testId: 'plan', center: false, noWrap: false },
  { cellName: 'Monthly', testId: 'monthly', center: false, noWrap: false },
  { cellName: 'Hourly', testId: 'hourly', center: false, noWrap: false },
  { cellName: 'RAM', testId: 'ram', center: true, noWrap: false },
  { cellName: 'CPUs', testId: 'cpu', center: true, noWrap: false },
  { cellName: 'Storage', testId: 'storage', center: true, noWrap: false },
  { cellName: 'Transfer', testId: 'transfer', center: true, noWrap: false },
  {
    cellName: 'Network In / Out',
    testId: 'network',
    center: true,
    noWrap: true,
  },
];

export interface Props {
  currentPlanHeading?: string;
  disabled?: boolean;
  disabledClasses?: LinodeTypeClass[];
  isCreate?: boolean;
  linodeID?: number | undefined;
  onSelect: (key: string) => void;
  plans: PlanSelectionType[];
  selectedDiskSize?: number;
  selectedID?: string;
  showTransfer?: boolean;
}

export const PlanContainer = ({
  currentPlanHeading,
  disabled,
  disabledClasses,
  isCreate,
  linodeID,
  onSelect,
  plans,
  selectedDiskSize,
  selectedID,
  showTransfer,
}: Props) => {
  // Show the Transfer column if, for any plan, the api returned data and we're not in the Database Create flow
  const shouldShowTransfer =
    showTransfer && plans.some((plan: ExtendedType) => plan.transfer);

  // Show the Network throughput column if, for any plan, the api returned data (currently Bare Metal does not)
  const shouldShowNetwork =
    showTransfer && plans.some((plan: ExtendedType) => plan.network_out);

  return (
    <Grid container spacing={2}>
      <Hidden lgUp={isCreate} mdUp={!isCreate}>
        {plans.map((plan, id) => (
          <PlanSelection
            currentPlanHeading={currentPlanHeading}
            disabled={disabled}
            disabledClasses={disabledClasses}
            idx={id}
            isCreate={isCreate}
            key={id}
            linodeID={linodeID}
            onSelect={onSelect}
            selectedDiskSize={selectedDiskSize}
            selectedID={selectedID}
            showTransfer={showTransfer}
            type={plan}
          />
        ))}
      </Hidden>
      <Hidden lgDown={isCreate} mdDown={!isCreate}>
        <Grid xs={12}>
          <StyledTable
            aria-label="List of Linode Plans"
            spacingBottom={16}
            isDisabled={disabled}
          >
            <TableHead>
              <TableRow>
                {tableCells.map(({ cellName, testId, center, noWrap }) => {
                  const attributeValue = `${testId}-header`;
                  if (
                    (!shouldShowTransfer && testId === 'transfer') ||
                    (!shouldShowNetwork && testId === 'network')
                  ) {
                    return null;
                  }
                  return (
                    <StyledTableCell
                      center={center}
                      data-qa={attributeValue}
                      isPlanCell={cellName === 'Plan'}
                      key={testId}
                      noWrap={noWrap}
                    >
                      {cellName}
                    </StyledTableCell>
                  );
                })}
              </TableRow>
            </TableHead>
            <TableBody role="radiogroup">
              {plans.map((plan, id) => (
                <PlanSelection
                  currentPlanHeading={currentPlanHeading}
                  disabled={disabled}
                  disabledClasses={disabledClasses}
                  idx={id}
                  isCreate={isCreate}
                  key={id}
                  linodeID={linodeID}
                  onSelect={onSelect}
                  selectedDiskSize={selectedDiskSize}
                  selectedID={selectedID}
                  showTransfer={showTransfer}
                  type={plan}
                />
              ))}
            </TableBody>
          </StyledTable>
        </Grid>
      </Hidden>
    </Grid>
  );
};
