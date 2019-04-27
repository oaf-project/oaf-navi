import { History, Location, LocationKey, LocationState } from "history";
import { Navigation, Route } from "navi";
import {
  createOafRouter,
  defaultSettings as oafRoutingDefaultSettings,
  RouterSettings,
} from "oaf-routing";

// tslint:disable: no-expression-statement

export { RouterSettings } from "oaf-routing";

export const defaultSettings = {
  ...oafRoutingDefaultSettings,
  // TODO
};

// HACK we need a way to track where focus and scroll were left on the first loaded page
// but we won't have an entry in history for this initial page, so we just make up a key.
const keyFromLocation = (location: Location): LocationKey =>
  location.key !== undefined ? location.key : "initial";

export const wrapNavigation = async <
  HistoryLocationState = LocationState,
  Data = any,
  Context extends object = any
>(
  history: History<HistoryLocationState>,
  navigation: Navigation<Context>,
  settingsOverrides?: Partial<RouterSettings<Route<Data>>>,
): Promise<() => void> => {
  const settings = {
    ...defaultSettings,
    ...settingsOverrides,
  };

  const oafRouter = createOafRouter(
    settings,
    // TODO get hash from the route param
    () => history.location.hash,
  );

  const initialRoute = await navigation.getRoute();
  oafRouter.handleFirstPageLoad(initialRoute);

  // tslint:disable-next-line: no-let
  let previousRoute = initialRoute;

  const subscription = navigation.subscribe(async route => {
    oafRouter.handleLocationChanged(
      previousRoute,
      route,
      keyFromLocation(history.location),
      history.action,
    );
    previousRoute = route;
  });

  const unblock = history.block((location, action) => {
    oafRouter.handleLocationWillChange(
      keyFromLocation(history.location),
      keyFromLocation(location),
      action,
    );
  });

  return () => {
    oafRouter.resetAutoScrollRestoration();
    subscription.unsubscribe();
    unblock();
  };
};
