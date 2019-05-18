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
      ? route.title
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

  // Wait for the DOM to be ready before repairing focus.
  navigation.steady().then(() => oafRouter.handleFirstPageLoad(initialRoute));

  // tslint:disable-next-line: no-let
  let previousRoute = initialRoute;

  const subscription = navigation.subscribe(async route => {
    if (route.type === "ready" || route.type === "error") {
      // Wait for the DOM to be ready before repairing focus.
      await navigation.steady();

      oafRouter.handleLocationChanged(
        previousRoute,
        route,
        history.location.key,
        history.action,
      );

      previousRoute = route;
    }
  });

  // TODO history.block's days are numbered.
  // See https://github.com/ReactTraining/history/issues/690
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
