/* eslint-disable functional/no-return-void */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable functional/functional-parameters */
/* eslint-disable functional/no-expression-statement */
import { History, LocationKey } from "history";
import { Navigation, Route } from "navi";
import {
  createOafRouter,
  defaultSettings as oafRoutingDefaultSettings,
  RouterSettings,
} from "oaf-routing";

export { RouterSettings } from "oaf-routing";

export const defaultSettings: RouterSettings<Route<unknown>> = {
  ...oafRoutingDefaultSettings,
  documentTitle: (route) =>
    route.title !== undefined && route.title.trim() !== ""
      ? route.title
      : oafRoutingDefaultSettings.documentTitle(route),
};

// HACK we need a way to track where focus and scroll were left on the first loaded page
// but we won't have an entry in history for this initial page, so we just make up a key.
const orInitialKey = (key: LocationKey | undefined): LocationKey =>
  key !== undefined ? key : "initial";

export const wrapNavigation = async <
  LocationState = unknown,
  Data = unknown,
  // eslint-disable-next-line @typescript-eslint/ban-types
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

  const oafRouter = createOafRouter(settings, (route) => route.url.hash);

  const initialRoute = await navigation.getRoute();

  // Wait for the DOM to be ready before repairing focus.
  setTimeout(() => {
    oafRouter.handleFirstPageLoad(initialRoute);
  }, settings.renderTimeout);

  // eslint-disable-next-line functional/no-let
  let previousRoute = initialRoute;

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  const subscription = navigation.subscribe(async (route) => {
    // eslint-disable-next-line functional/no-conditional-statement
    if (route.type === "ready" || route.type === "error") {
      // Wait for the DOM to be ready before repairing focus.
      await navigation.getRoute();

      oafRouter.handleLocationChanged(
        previousRoute,
        route,
        orInitialKey(history.location.key),
        history.action,
      );

      previousRoute = route;
    }
  });

  // TODO history.block's days are numbered.
  // See https://github.com/ReactTraining/history/issues/690
  const unblock = history.block((location, action) => {
    oafRouter.handleLocationWillChange(
      orInitialKey(history.location.key),
      orInitialKey(location.key),
      action,
    );
  });

  return () => {
    oafRouter.resetAutoScrollRestoration();
    subscription.unsubscribe();
    unblock();
  };
};
