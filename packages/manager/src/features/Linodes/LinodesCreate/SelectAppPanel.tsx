import { UserDefinedField } from '@linode/api-v4/lib/stackscripts';
import * as React from 'react';
import { compose } from 'recompose';
import Paper from 'src/components/core/Paper';
import { createStyles, withStyles, WithStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { LandingLoading } from 'src/components/LandingLoading/LandingLoading';
import { Notice } from 'src/components/Notice/Notice';
import AppPanelSection from 'src/features/Linodes/LinodesCreate/AppPanelSection';
import { getQueryParamFromQueryString } from 'src/utilities/queryParams';
import Panel from './Panel';
import { AppsData } from './types';

type ClassNames = 'panel' | 'loading';

const styles = (theme: Theme) =>
  createStyles({
    panel: {
      marginBottom: theme.spacing(3),
      height: 450,
      overflowY: 'auto',
      boxShadow: `${theme.color.boxShadow} 0px -15px 10px -10px inset`,
    },
    loading: {
      '& >div:first-of-type': {
        height: 450,
      },
    },
  });

interface Props extends AppsData {
  handleClick: (
    id: number,
    label: string,
    username: string,
    stackScriptImages: string[],
    userDefinedFields: UserDefinedField[]
  ) => void;
  openDrawer: (stackScriptLabel: string) => void;
  disabled: boolean;
  selectedStackScriptID?: number;
  error?: string;
  isSearching: boolean;
  isFiltering: boolean;
  searchValue?: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class SelectAppPanel extends React.PureComponent<CombinedProps> {
  clickAppIfQueryParamExists = () => {
    const { handleClick, appInstances } = this.props;
    const appIDFromURL = getQueryParamFromQueryString(location.search, 'appID');
    const matchedApp = appInstances
      ? appInstances.find((eachApp) => eachApp.id === +appIDFromURL)
      : undefined;

    if (appIDFromURL && matchedApp) {
      /**
       * check the query params to see if we have an app ID in there and if
       * so pre-select the app
       */
      handleClick(
        matchedApp.id,
        matchedApp.label,
        /**  username is for display purposes only but we're not showing it */
        '',
        matchedApp.images,
        matchedApp.user_defined_fields
      );

      // Scroll to app when an app id is passed in the query params
      const section = document.querySelector(`#app-${matchedApp.id}`);
      if (section) {
        section.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'start',
        });
      }

      // If the URL also included &showInfo, open the Info drawer as well
      const showInfo = getQueryParamFromQueryString(
        location.search,
        'showInfo'
      );
      if (showInfo) {
        this.props.openDrawer(matchedApp.label);
      }
    }
  };

  componentDidMount() {
    this.clickAppIfQueryParamExists();
  }

  componentDidUpdate(prevProps: CombinedProps) {
    if (
      typeof prevProps.appInstances === 'undefined' &&
      typeof this.props.appInstances !== 'undefined'
    ) {
      this.clickAppIfQueryParamExists();
    }
  }

  render() {
    const {
      disabled,
      selectedStackScriptID,
      classes,
      error,
      appInstances,
      appInstancesError,
      appInstancesLoading,
      handleClick,
      openDrawer,
      isSearching,
      isFiltering,
      searchValue,
    } = this.props;

    if (appInstancesError) {
      return (
        <Panel className={classes.panel} error={error} title="Select App">
          <ErrorState errorText={appInstancesError} />
        </Panel>
      );
    }

    if (appInstancesLoading || !appInstances) {
      return (
        <Panel className={classes.panel} error={error} title="Select App">
          <span className={classes.loading}>
            <LandingLoading />
          </span>
        </Panel>
      );
    }

    if (!appInstances) {
      return null;
    }

    const newApps = appInstances.filter((app) => {
      return ['appwrite', 'illa builder', 'owncloud', 'seatable'].includes(
        app.label.toLowerCase().trim()
      );
    });

    const popularApps = appInstances.slice(0, 10);

    // sort mutates original array so make a copy first
    const allApps = [...appInstances].sort((a, b) =>
      a.label.toLowerCase().localeCompare(b.label.toLowerCase())
    );

    const isFilteringOrSearching = isFiltering || isSearching;

    return (
      <Paper className={classes.panel} data-qa-tp="Select Image">
        {error && <Notice text={error} error />}
        {!isFilteringOrSearching ? (
          <AppPanelSection
            heading="New apps"
            apps={newApps}
            disabled={disabled}
            selectedStackScriptID={selectedStackScriptID}
            handleClick={handleClick}
            openDrawer={openDrawer}
          />
        ) : null}
        {!isFilteringOrSearching ? (
          <AppPanelSection
            heading="Popular apps"
            apps={popularApps}
            disabled={disabled}
            selectedStackScriptID={selectedStackScriptID}
            handleClick={handleClick}
            openDrawer={openDrawer}
          />
        ) : null}
        <AppPanelSection
          heading={isFilteringOrSearching ? '' : 'All apps'}
          apps={allApps}
          disabled={disabled}
          selectedStackScriptID={selectedStackScriptID}
          handleClick={handleClick}
          openDrawer={openDrawer}
          searchValue={searchValue}
        />
      </Paper>
    );
  }
}

const styled = withStyles(styles);

export default compose<CombinedProps, Props>(
  styled,
  React.memo
)(SelectAppPanel);
