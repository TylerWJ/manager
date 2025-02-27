import { isEmpty } from 'ramda';
import * as React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { compose } from 'recompose';
import Logo from 'src/assets/logo/akamai-logo.svg';
import { Box } from 'src/components/Box';
import { makeStyles } from 'tss-react/mui';
import { Theme } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import MainContentBanner from 'src/components/MainContentBanner';
import { MaintenanceScreen } from 'src/components/MaintenanceScreen';
import NotFound from 'src/components/NotFound';
import { PreferenceToggle } from 'src/components/PreferenceToggle/PreferenceToggle';
import SideMenu from 'src/components/SideMenu';
import SuspenseLoader from 'src/components/SuspenseLoader';
import withGlobalErrors, {
  Props as GlobalErrorProps,
} from 'src/containers/globalErrors.container';
import { useDialogContext } from 'src/context';
import BackupDrawer from 'src/features/Backups';
import Footer from 'src/features/Footer';
import GlobalNotifications from 'src/features/GlobalNotifications';
import {
  notificationContext,
  useNotificationContext,
} from 'src/features/NotificationCenter/NotificationContext';
import ToastNotifications from 'src/features/ToastNotifications';
import TopMenu from 'src/features/TopMenu';
import VolumeDrawer from 'src/features/Volumes/VolumeDrawer';
import useAccountManagement from 'src/hooks/useAccountManagement';
import useFlags from 'src/hooks/useFlags';
import { usePreferences } from 'src/queries/preferences';
import { isFeatureEnabled } from 'src/utilities/accountCapabilities';
import { complianceUpdateContext } from './context/complianceUpdateContext';
import { FlagSet } from './featureFlags';
import { ManagerPreferences } from 'src/types/ManagerPreferences';
import { ENABLE_MAINTENANCE_MODE } from './constants';
import type { PreferenceToggleProps } from 'src/components/PreferenceToggle/PreferenceToggle';

const useStyles = makeStyles()((theme: Theme) => ({
  appFrame: {
    position: 'relative',
    display: 'flex',
    minHeight: '100vh',
    flexDirection: 'column',
    backgroundColor: theme.bg.app,
    zIndex: 1,
  },
  cmrWrapper: {
    maxWidth: `${theme.breakpoints.values.lg}px !important`,
    padding: `${theme.spacing(3)} 0`,
    paddingTop: 12,
    transition: theme.transitions.create('opacity'),
    [theme.breakpoints.down('md')]: {
      paddingTop: theme.spacing(2),
      paddingLeft: 0,
      paddingRight: 0,
    },
    [theme.breakpoints.between('md', 'xl')]: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
    },
  },
  content: {
    flex: 1,
    transition: 'margin-left .1s linear',
    [theme.breakpoints.up('md')]: {
      marginLeft: 190,
    },
  },
  fullWidthContent: {
    marginLeft: 0,
    [theme.breakpoints.up('md')]: {
      marginLeft: 52,
    },
  },
  hidden: {
    display: 'none',
    overflow: 'hidden',
  },
  grid: {
    marginLeft: 0,
    marginRight: 0,
    width: '100%',
    [theme.breakpoints.up('lg')]: {
      height: '100%',
    },
  },
  switchWrapper: {
    flex: 1,
    maxWidth: '100%',
    position: 'relative',
    '& > .MuiGrid-container': {
      maxWidth: theme.breakpoints.values.lg,
      width: '100%',
    },
    '&.mlMain': {
      [theme.breakpoints.up('lg')]: {
        maxWidth: '78.8%',
      },
    },
    '& .mlSidebar': {
      [theme.breakpoints.up('lg')]: {
        paddingRight: `0 !important`,
      },
    },
  },
  logo: {
    '& > g': {
      fill: theme.color.black,
    },
  },
  activationWrapper: {
    padding: theme.spacing(4),
    [theme.breakpoints.up('xl')]: {
      width: '50%',
      margin: '0 auto',
    },
  },
  bgStyling: {
    backgroundColor: theme.bg.main,
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
  },
}));

interface Props {
  appIsLoading: boolean;
  isLoggedInAsCustomer: boolean;
}

type CombinedProps = Props & GlobalErrorProps;

const Account = React.lazy(() => import('src/features/Account'));
const LinodesRoutes = React.lazy(() => import('src/features/Linodes'));
const Volumes = React.lazy(() => import('src/features/Volumes'));
const Domains = React.lazy(() => import('src/features/Domains'));
const Images = React.lazy(() => import('src/features/Images'));
const Kubernetes = React.lazy(() => import('src/features/Kubernetes'));
const ObjectStorage = React.lazy(() => import('src/features/ObjectStorage'));
const Profile = React.lazy(() => import('src/features/Profile'));
const LoadBalancers = React.lazy(() => import('src/features/LoadBalancers'));
const NodeBalancers = React.lazy(
  () => import('src/features/NodeBalancers/NodeBalancers')
);
const StackScripts = React.lazy(() => import('src/features/StackScripts'));
const SupportTickets = React.lazy(
  () => import('src/features/Support/SupportTickets')
);
const SupportTicketDetail = React.lazy(
  () => import('src/features/Support/SupportTicketDetail')
);
const Longview = React.lazy(() => import('src/features/Longview'));
const Managed = React.lazy(() => import('src/features/Managed'));
const Help = React.lazy(() => import('src/features/Help'));

const SearchLanding = React.lazy(() => import('src/features/Search'));
const EventsLanding = React.lazy(
  () => import('src/features/Events/EventsLanding')
);
const AccountActivationLanding = React.lazy(
  () => import('src/components/AccountActivation/AccountActivationLanding')
);
const Firewalls = React.lazy(() => import('src/features/Firewalls'));
const Databases = React.lazy(() => import('src/features/Databases'));

const MainContent = (props: CombinedProps) => {
  const { classes, cx } = useStyles();
  const flags = useFlags();
  const { data: preferences } = usePreferences();

  const NotificationProvider = notificationContext.Provider;
  const contextValue = useNotificationContext();

  const ComplianceUpdateProvider = complianceUpdateContext.Provider;
  const complianceUpdateContextValue = useDialogContext();

  const [menuIsOpen, toggleMenu] = React.useState<boolean>(false);
  const { account, profile, _isManagedAccount } = useAccountManagement();

  const username = profile?.username || '';

  const [bannerDismissed, setBannerDismissed] = React.useState<boolean>(false);

  const showDatabases = isFeatureEnabled(
    'Managed Databases',
    Boolean(flags.databases),
    account?.capabilities ?? []
  );

  const defaultRoot = _isManagedAccount ? '/managed' : '/linodes';

  const shouldDisplayMainContentBanner =
    !bannerDismissed &&
    checkFlagsForMainContentBanner(flags) &&
    !checkPreferencesForBannerDismissal(
      preferences ?? {},
      flags?.mainContentBanner?.key
    );

  /**
   * this is the case where the user has successfully completed signup
   * but needs a manual review from Customer Support. In this case,
   * the user is going to get 403 errors from almost every single endpoint.
   *
   * So in this case, we'll show something more user-friendly
   */
  if (props.globalErrors.account_unactivated) {
    return (
      <div className={classes.bgStyling}>
        <div className={classes.activationWrapper}>
          <Box
            style={{
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Logo width={215} className={classes.logo} />
          </Box>
          <Switch>
            <Route
              exact
              strict
              path="/support/tickets"
              component={SupportTickets}
            />
            <Route
              path="/support/tickets/:ticketId"
              component={SupportTicketDetail}
              exact
              strict
            />
            <Route exact path="/support" component={Help} />
            <Route component={AccountActivationLanding} />
          </Switch>
        </div>
      </div>
    );
  }

  // If the API is in maintenance mode, return a Maintenance screen
  if (props.globalErrors.api_maintenance_mode || ENABLE_MAINTENANCE_MODE) {
    return <MaintenanceScreen />;
  }

  /**
   * otherwise just show the rest of the app.
   */
  return (
    <div
      className={cx({
        [classes.appFrame]: true,
        /**
         * hidden to prevent some jankiness with the app loading before the splash screen
         */
        [classes.hidden]: props.appIsLoading,
      })}
    >
      <PreferenceToggle<boolean>
        preferenceKey="desktop_sidebar_open"
        preferenceOptions={[true, false]}
      >
        {({
          preference: desktopMenuIsOpen,
          togglePreference: desktopMenuToggle,
        }: PreferenceToggleProps<boolean>) => (
          <ComplianceUpdateProvider value={complianceUpdateContextValue}>
            <NotificationProvider value={contextValue}>
              <>
                {shouldDisplayMainContentBanner ? (
                  <MainContentBanner
                    bannerText={flags.mainContentBanner?.text ?? ''}
                    url={flags.mainContentBanner?.link?.url ?? ''}
                    linkText={flags.mainContentBanner?.link?.text ?? ''}
                    bannerKey={flags.mainContentBanner?.key ?? ''}
                    onClose={() => setBannerDismissed(true)}
                  />
                ) : null}
                <SideMenu
                  open={menuIsOpen}
                  collapse={desktopMenuIsOpen || false}
                  closeMenu={() => toggleMenu(false)}
                />
                <div
                  className={cx(classes.content, {
                    [classes.fullWidthContent]:
                      desktopMenuIsOpen ||
                      (desktopMenuIsOpen && desktopMenuIsOpen === true),
                  })}
                >
                  <TopMenu
                    isSideMenuOpen={!desktopMenuIsOpen}
                    openSideMenu={() => toggleMenu(true)}
                    desktopMenuToggle={desktopMenuToggle}
                    isLoggedInAsCustomer={props.isLoggedInAsCustomer}
                    username={username}
                  />
                  <main
                    className={classes.cmrWrapper}
                    id="main-content"
                    role="main"
                  >
                    <Grid container spacing={0} className={classes.grid}>
                      <Grid className={cx(classes.switchWrapper, 'p0')}>
                        <GlobalNotifications />
                        <React.Suspense fallback={<SuspenseLoader />}>
                          <Switch>
                            <Route path="/linodes" component={LinodesRoutes} />
                            <Route path="/volumes" component={Volumes} />
                            <Redirect path="/volumes*" to="/volumes" />
                            {flags.aglb && (
                              <Route
                                path="/loadbalancer*"
                                component={LoadBalancers}
                              />
                            )}
                            <Route
                              path="/nodebalancers"
                              component={NodeBalancers}
                            />
                            <Route path="/domains" component={Domains} />
                            <Route path="/managed" component={Managed} />
                            <Route path="/longview" component={Longview} />
                            <Route path="/images" component={Images} />
                            <Route
                              path="/stackscripts"
                              component={StackScripts}
                            />
                            <Route
                              path="/object-storage"
                              component={ObjectStorage}
                            />
                            <Route path="/kubernetes" component={Kubernetes} />
                            <Route path="/account" component={Account} />

                            <Route
                              path="/profile"
                              render={(routeProps) => (
                                <Profile {...routeProps} />
                              )}
                            />
                            <Route path="/support" component={Help} />
                            <Route path="/search" component={SearchLanding} />
                            <Route path="/events" component={EventsLanding} />
                            <Route path="/firewalls" component={Firewalls} />
                            {showDatabases ? (
                              <Route path="/databases" component={Databases} />
                            ) : null}
                            <Redirect exact from="/" to={defaultRoot} />
                            {/** We don't want to break any bookmarks. This can probably be removed eventually. */}
                            <Redirect from="/dashboard" to={defaultRoot} />
                            <Route component={NotFound} />
                          </Switch>
                        </React.Suspense>
                      </Grid>
                    </Grid>
                  </main>
                </div>
              </>
            </NotificationProvider>
            <Footer desktopMenuIsOpen={desktopMenuIsOpen} />
            <ToastNotifications />
            <VolumeDrawer />
            <BackupDrawer />
          </ComplianceUpdateProvider>
        )}
      </PreferenceToggle>
    </div>
  );
};

export default compose<CombinedProps, Props>(
  React.memo,
  withGlobalErrors()
)(MainContent);

// =============================================================================
// Utilities
// =============================================================================
export const checkFlagsForMainContentBanner = (flags: FlagSet) => {
  return Boolean(
    flags.mainContentBanner &&
      !isEmpty(flags.mainContentBanner) &&
      flags.mainContentBanner.key
  );
};

export const checkPreferencesForBannerDismissal = (
  preferences: ManagerPreferences,
  key = 'defaultKey'
) => {
  return Boolean(preferences?.main_content_banner_dismissal?.[key]);
};
