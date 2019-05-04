import { History } from "history";
import { Navigation, Route } from "navi";
import {
  createOafRouter,
  defaultSettings as oafRoutingDefaultSettings,
  RouterSettings,
} from "oaf-routing";

// tslint:disable: no-expression-statement
// tslint:disable: no-if-statement

export { RouterSettings } from "oaf-routing";

export const defaultSettings: RouterSettings<Route<unknown>> = {
  ...oafRoutingDefaultSettings,
  documentTitle: route =>
    route.title !== undefined && route.title.trim() !== ""
      ? Promise.resolve(route.title)
      : oafRoutingDefaultSettings.documentTitle(route),
};

export const wrapNavigation = async <
  LocationState = unknown,
  Data = unknown,
  Context extends object = any
>(
  history: History<LocationState>,
  navigation: Navigation<Context>,
  settingsOverrides?: Partial<RouterSettings<Route<Data>>>,
): Promise<() => void> => {
  const settings: RouterSettings<Route<Data>> = {
    ...defaultSettings,
    ...settingsOverrides,
  };

  const oafRouter = createOafRouter(settings, route => route.url.hash);

  const initialRoute = await navigation.getRoute();
  oafRouter.handleFirstPageLoad(initialRoute);

  // tslint:disable-next-line: no-let
  let previousRoute = initialRoute;

  const subscription = navigation.subscribe(route => {
    if (route.type === "ready" || route.type === "error") {
      oafRouter.handleLocationChanged(
        previousRoute,
        route,
        history.location.key,
        history.action,
      );
      previousRoute = route;
    }
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
