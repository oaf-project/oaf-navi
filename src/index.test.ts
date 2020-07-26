/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable functional/immutable-data */
/* eslint-disable functional/no-expression-statement */
/* eslint-disable functional/functional-parameters */

import { mount, route, createBrowserNavigation } from "navi";
import { createBrowserHistory } from "history";
import { wrapNavigation } from ".";

// HACK: wait for router wrapper to update DOM.
const waitForDomUpdate = (): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve));

beforeEach(() => {
  // Clear previous test's DOM.
  window.document.body.innerHTML = "";
  window.document.title = "";
  document.location.hash = "";
});

describe("oaf-vue-router", () => {
  test("doesn't throw when wrapping and unwrapping router", async () => {
    const history = createBrowserHistory();
    const routes = mount({ "/": route({}) });
    const navigation = createBrowserNavigation({ routes, history });
    const unwrap = await wrapNavigation(history, navigation);
    unwrap();
  });

  test("sets the document title after initial render", async () => {
    const history = createBrowserHistory();
    const routes = mount({ "/": route({}) });
    const navigation = createBrowserNavigation({ routes, history });
    const unwrap = await wrapNavigation(history, navigation, {
      setPageTitle: true,
      documentTitle: () => "test title",
    });

    expect(document.title).toBe("");

    await waitForDomUpdate();

    expect(document.title).toBe("test title");

    unwrap();
  });

  // TODO
  // eslint-disable-next-line jest/no-test-prefixes
  xtest("respects Navi title if it exists", async () => {
    const history = createBrowserHistory();
    const routes = mount({ "/": route({ title: "navi title" }) });
    const navigation = createBrowserNavigation({ routes, history });
    const unwrap = await wrapNavigation(history, navigation, {
      setPageTitle: true,
      documentTitle: () => "oaf title",
    });

    expect(document.title).toBe("");

    await waitForDomUpdate();

    expect(document.title).toBe("navi title");

    unwrap();
  });

  test("sets the document title after a navigation", async () => {
    const history = createBrowserHistory();
    const routes = mount({ "/": route({}) });
    const navigation = createBrowserNavigation({ routes, history });
    const unwrap = await wrapNavigation(history, navigation, {
      setPageTitle: true,
      documentTitle: () => "test title",
    });

    expect(document.title).toBe("");

    await navigation.navigate("/foo");

    await waitForDomUpdate();

    expect(document.title).toBe("test title");

    unwrap();
  });

  test("does not set the document title when setPageTitle is false", async () => {
    const history = createBrowserHistory();
    const routes = mount({ "/": route({}) });
    const navigation = createBrowserNavigation({ routes, history });
    const unwrap = await wrapNavigation(history, navigation, {
      setPageTitle: false,
      documentTitle: () => "test title",
    });

    expect(document.title).toBe("");

    await navigation.navigate("/foo");

    await waitForDomUpdate();

    expect(document.title).toBe("");

    unwrap();
  });

  test("leaves focus alone when repairFocus is false", async () => {
    const history = createBrowserHistory();
    const routes = mount({ "/": route({}) });
    const navigation = createBrowserNavigation({ routes, history });
    const unwrap = await wrapNavigation(history, navigation, {
      repairFocus: false,
    });

    const main = document.createElement("main");
    const mainH1 = document.createElement("h1");
    main.append(mainH1);
    const randomButton = document.createElement("button");
    main.append(randomButton);
    document.body.append(main);

    randomButton.focus();
    expect(document.activeElement).toBe(randomButton);

    await navigation.navigate("/foo");

    await waitForDomUpdate();

    expect(document.activeElement).toBe(randomButton);

    unwrap();
  });

  test("moves focus to body when primary focus target cannot be focused", async () => {
    const history = createBrowserHistory();
    const routes = mount({ "/": route({}) });
    const navigation = createBrowserNavigation({ routes, history });
    const unwrap = await wrapNavigation(history, navigation);

    const main = document.createElement("main");
    const mainH1 = document.createElement("h1");
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    mainH1.focus = () => {};
    main.append(mainH1);
    const randomButton = document.createElement("button");
    main.append(randomButton);
    document.body.append(main);

    randomButton.focus();
    expect(document.activeElement).toBe(randomButton);

    await navigation.navigate("/foo");

    await waitForDomUpdate();

    expect([document.body, document.documentElement]).toContain(
      document.activeElement,
    );

    unwrap();
  });

  test("moves focus to the primary focus target", async () => {
    const history = createBrowserHistory();
    const routes = mount({ "/": route({}) });
    const navigation = createBrowserNavigation({ routes, history });
    const unwrap = await wrapNavigation(history, navigation);

    const main = document.createElement("main");
    const mainH1 = document.createElement("h1");
    main.append(mainH1);
    document.body.append(main);

    expect([document.body, document.documentElement]).toContain(
      document.activeElement,
    );

    await navigation.navigate("/foo");

    await waitForDomUpdate();

    expect(document.activeElement).toBe(mainH1);

    unwrap();
  });
});
