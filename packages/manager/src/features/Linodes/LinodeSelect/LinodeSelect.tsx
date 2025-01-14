import { Linode } from '@linode/api-v4/lib/linodes';
import { Region } from '@linode/api-v4/lib/regions';
import { groupBy } from 'ramda';
import * as React from 'react';
import EnhancedSelect, {
  GroupType,
  Item,
} from 'src/components/EnhancedSelect/Select';
import { useAllLinodesQuery } from 'src/queries/linodes/linodes';
import { TextFieldProps } from 'src/components/TextField';
import { useRegionsQuery } from 'src/queries/regions';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';

type Override = keyof Linode | ((linode: Linode) => any);

interface Props {
  generalError?: string;
  linodeError?: string;
  className?: string;
  selectedLinode: number | null;
  disabled?: boolean;
  region?: string;
  handleChange: (linode: Linode | null) => void;
  textFieldProps?: Omit<TextFieldProps, 'label'>;
  groupByRegion?: boolean;
  placeholder?: string;
  valueOverride?: Override;
  labelOverride?: Override;
  filterCondition?: (linode: Linode) => boolean;
  label?: string;
  noOptionsMessage?: string;
  small?: boolean;
  noMarginTop?: boolean;
  value?: Item<any> | null;
  inputId?: string;
  // Formik stuff to be passed down to the inner Select
  onBlur?: (e: any) => void;
  name?: string;
  width?: number;
  isClearable?: boolean;
  required?: boolean;
}

export const LinodeSelect = (props: Props) => {
  const {
    disabled,
    generalError,
    handleChange,
    linodeError,
    region,
    selectedLinode,
    groupByRegion,
    className,
    placeholder,
    valueOverride,
    labelOverride,
    filterCondition,
    value,
    inputId,
    noOptionsMessage,
    width,
    isClearable,
    ...rest
  } = props;

  const { data: allLinodes, isLoading, error } = useAllLinodesQuery();

  const { data: regions } = useRegionsQuery();

  const onChange = React.useCallback(
    (selected: Item<number> | null) => {
      if (selected === null) {
        handleChange(null);
        return;
      }
      return handleChange(selected.data);
    },
    [handleChange]
  );

  const linodesData = allLinodes ?? [];

  const linodes = region
    ? linodesData.filter((thisLinode) => thisLinode.region === region)
    : linodesData;

  const options = groupByRegion
    ? linodesToGroupedItems(
        linodes,
        regions ?? [],
        valueOverride,
        labelOverride,
        filterCondition
      )
    : linodesToItems(linodes, valueOverride, labelOverride, filterCondition);

  const defaultNoOptionsMessage =
    !linodeError && !isLoading && options.length === 0
      ? 'You have no Linodes to choose from'
      : 'No Options';

  return (
    <div style={{ width: width ? width : '100%' }}>
      <EnhancedSelect
        value={
          // Use the `value` prop if provided.
          typeof value === 'undefined'
            ? groupByRegion
              ? linodeFromGroupedItems(
                  options as GroupType<number>[],
                  selectedLinode
                )
              : linodeFromItems(options as Item<number>[], selectedLinode)
            : value
        }
        label={props.label || 'Linode'}
        className={className}
        noMarginTop={props.noMarginTop}
        placeholder={placeholder || 'Select a Linode'}
        options={options}
        disabled={disabled}
        small={props.small}
        isLoading={isLoading}
        inputId={inputId}
        onChange={onChange}
        errorText={getErrorStringOrDefault(
          generalError || linodeError || error || ''
        )}
        isClearable={isClearable}
        textFieldProps={props.textFieldProps}
        noOptionsMessage={() => noOptionsMessage || defaultNoOptionsMessage}
        {...rest}
      />
    </div>
  );
};

/**
 * UTILITIES
 */

export const linodesToItems = (
  linodes: Linode[],
  valueOverride?: Override,
  labelOverride?: Override,
  filterCondition?: (linodes: Linode) => boolean
): Item<any>[] => {
  const maybeFilteredLinodes = filterCondition
    ? linodes.filter(filterCondition)
    : linodes;

  return maybeFilteredLinodes.map((thisLinode) => ({
    value:
      typeof valueOverride === 'function'
        ? valueOverride(thisLinode)
        : !!valueOverride
        ? thisLinode[valueOverride]
        : thisLinode.id,
    label:
      typeof labelOverride === 'function'
        ? labelOverride(thisLinode)
        : !!labelOverride
        ? labelOverride
        : thisLinode.label,
    data: thisLinode,
  }));
};

export const linodeFromItems = (
  linodes: Item<number>[],
  linodeId: number | null
): Item<number> | null => {
  if (!linodeId) {
    return null;
  }

  return (
    linodes.find((thisLinode) => {
      return (thisLinode.data as Linode).id === linodeId;
    }) || null
  );
};

// Grouped by Region
export const linodesToGroupedItems = (
  linodes: Linode[],
  regions: Region[],
  valueOverride?: Override,
  labelOverride?: Override,
  filterCondition?: (linodes: Linode) => boolean
) => {
  // We need to filter Linode BEFORE grouping by region, since some regions
  // may become irrelevant when Linodes are filtered.
  const maybeFilteredLinodes = filterCondition
    ? linodes.filter(filterCondition)
    : linodes;

  const groupedByRegion = groupBy((linode: Linode) => linode.region)(
    maybeFilteredLinodes
  );

  return Object.keys(groupedByRegion).map((region) => {
    return {
      label: regions.find((r) => r.id === region)?.label ?? region,
      options: linodesToItems(
        groupedByRegion[region],
        valueOverride,
        labelOverride
      ),
    };
  });
};

export const linodeFromGroupedItems = (
  groupedOptions: GroupType<number>[],
  linodeId: number | null
) => {
  // I wanted to use Ramda's `flatten()` but the typing is not good.
  const flattenedOptions: Item<number>[] = [];
  groupedOptions.forEach((eachGroup) => {
    flattenedOptions.push(...eachGroup.options);
  });
  return linodeFromItems(flattenedOptions, linodeId);
};
