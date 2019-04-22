import {
  Action,
  History,
  Location,
  LocationKey,
  LocationState,
  UnregisterCallback,
} from "history";
import { Navigation, Route } from "navi";
import {
  createPageStateMemory,
  defaultSettings,
  disableAutoScrollRestoration,
  getPageState,
  RouterSettings,
  setPageState,
} from "oaf-routing";
import { announce, elementFromHash, resetFocus } from "oaf-side-effects";

// tslint:disable: no-if-statement
// tslint:disable: no-object-mutation
// tslint:disable: no-expression-statement

export { defaultSettings, RouterSettings } from "oaf-routing";

// TODO handleFirstPageLoad

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
  settingsOverrides?: Partial<RouterSettings<Route<Data>, Action>>,
): Promise<UnregisterCallback> => {
  const settings = {
    ...defaultSettings,
    ...settingsOverrides,
  };

  const resetAutoScrollRestoration = disableAutoScrollRestoration(
    settings.disableAutoScrollRestoration,
  );

  const pageStateMemory = createPageStateMemory();
  // tslint:disable-next-line: no-let
  let previousRoute = await navigation.getRoute();

  const subscription = navigation.subscribe(async route => {
    const action = history.action;

    const title = await settings.documentTitle(route);

    if (settings.setPageTitle) {
      document.title = title;
    }

    const shouldHandleAction = settings.shouldHandleAction(
      previousRoute,
      route,
      action,
    );

    if (shouldHandleAction && route.type === "ready") {
      if (settings.announcePageNavigation) {
        announce(
          settings.navigationMessage(title, route, action),
          settings.announcementsDivId,
        );
      }

      // HACK: We use setTimeout to give React a chance to render before we repair focus.
      // This may or may not be future proof. Revisit when React 17 is released.
      // We may have to tap into componentDidMount() on the individual react-router Route
      // components to know when we can safely repair focus.
      if (action === "POP") {
        const previousPageState = pageStateMemory.pageState(
          keyFromLocation(history.location),
        );
        const pageStateToSet = {
          ...settings.defaultPageState,
          ...previousPageState,
        };

        setTimeout(
          () => setPageState(pageStateToSet, settings.primaryFocusTarget),
          settings.renderTimeout,
        );
      } else {
        setTimeout(() => {
          resetFocus(
            settings.primaryFocusTarget,
            elementFromHash(location.hash),
            settings.focusOptions,
            settings.scrollIntoViewOptions,
          );
        }, settings.renderTimeout);
      }
    }

    previousRoute = route;
  });

  const unblock = history.block((location, action) => {
    const previousLocation = history.location;
    const nextLocation = location;
    const previousLocationKey = keyFromLocation(previousLocation);
    const nextLocationKey = keyFromLocation(nextLocation);
    const previousPageState = getPageState();

    pageStateMemory.update(
      action,
      previousLocationKey,
      nextLocationKey,
      previousPageState,
    );
  });

  return () => {
    resetAutoScrollRestoration();
    subscription.unsubscribe();
    unblock();
  };
};
