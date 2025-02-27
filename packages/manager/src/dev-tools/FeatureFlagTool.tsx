import * as React from 'react';
import { useDispatch } from 'react-redux';
import { Flags, FlagSet } from 'src/featureFlags';
import { Dispatch } from 'src/hooks/types';
import useFlags from 'src/hooks/useFlags';
import { setMockFeatureFlags } from 'src/store/mockFeatureFlags';
import Grid from '@mui/material/Unstable_Grid2';

const options: { label: string; flag: keyof Flags }[] = [
  { label: 'Metadata', flag: 'metadata' },
  { label: 'Database Beta', flag: 'databaseBeta' },
  { label: 'VPC', flag: 'vpc' },
  { label: 'AGLB', flag: 'aglb' },
];

const FeatureFlagTool: React.FC<{}> = () => {
  const dispatch: Dispatch = useDispatch();
  const flags = useFlags();

  const handleCheck = (
    e: React.ChangeEvent<HTMLInputElement>,
    flag: keyof FlagSet
  ) => {
    dispatch(setMockFeatureFlags({ [flag]: e.target.checked }));
  };

  return (
    <Grid container>
      <Grid xs={12}>
        <h4 style={{ marginTop: 0, marginBottom: 8 }}>Feature Flags</h4>
      </Grid>
      <Grid xs={12}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {options.map((thisOption) => {
            return (
              <div
                key={thisOption.flag}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexDirection: 'row',
                }}
              >
                <span>{thisOption.label} </span>
                <input
                  type="checkbox"
                  checked={Boolean(flags[thisOption.flag])}
                  onChange={(e) => handleCheck(e, thisOption.flag)}
                />
              </div>
            );
          })}
        </div>
      </Grid>
    </Grid>
  );
};

export default FeatureFlagTool;
