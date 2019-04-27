import { History, LocationState } from "history";
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
};

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
      history.location.key,
      history.action,
    );
    previousRoute = route;
  });

  const unblock = history.block((location, action) => {
    oafRouter.handleLocationWillChange(
      history.location.key,
      location.key,
      action,
    );
  });

  return () => {
    oafRouter.resetAutoScrollRestoration();
    subscription.unsubscribe();
    unblock();
  };
};
