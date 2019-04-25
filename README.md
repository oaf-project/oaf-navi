[![Build Status](https://travis-ci.org/oaf-project/oaf-navi.svg?branch=master)](https://travis-ci.org/oaf-project/oaf-navi)
[![Known Vulnerabilities](https://snyk.io/test/github/oaf-project/oaf-navi/badge.svg?targetFile=package.json)](https://snyk.io/test/github/oaf-project/oaf-navi?targetFile=package.json)
[![Greenkeeper badge](https://badges.greenkeeper.io/oaf-project/oaf-navi.svg)](https://greenkeeper.io/)
[![npm](https://img.shields.io/npm/v/oaf-navi.svg)](https://www.npmjs.com/package/oaf-navi)

[![dependencies Status](https://david-dm.org/oaf-project/oaf-navi/status.svg)](https://david-dm.org/oaf-project/oaf-navi)
[![devDependencies Status](https://david-dm.org/oaf-project/oaf-navi/dev-status.svg)](https://david-dm.org/oaf-project/oaf-navi?type=dev)
[![peerDependencies Status](https://david-dm.org/oaf-project/oaf-navi/peer-status.svg)](https://david-dm.org/oaf-project/oaf-navi?type=peer)

# Oaf Navi
An accessible wrapper for [Navi](https://github.com/frontarm/navi)'s router.

Documentation at https://oaf-project.github.io/oaf-navi/

## Features

* Reset scroll and focus after PUSH and REPLACE navigation
* Restore scroll and focus after POP navigation
* Set the page title after navigation
* Announce navigation to users of screen readers
* Hash fragment support

In lieu of more details, see [Oaf React Router](https://github.com/oaf-project/oaf-react-router/blob/master/README.md#features) for now. The features are basically the same.

## Installation

```sh
# yarn
yarn add oaf-navi

# npm
npm install oaf-navi
```

## Basic Usage

```diff
import register from "navi-scripts/register";
import routes from "./routes";
import { createBrowserNavigation } from "navi";
+ import { createBrowserHistory } from "history";
+ import { wrapNavigation } from "oaf-navi";

register({
  ...
  async main() {
-    const navigation = createBrowserNavigation({ routes });
+    const history = createBrowserHistory();
+    const navigation = createBrowserNavigation({ routes, history });
+    await wrapNavigation(history, navigation);
    ...
  }
});
```

## Advanced Usage

```typescript
const settings = {
  announcementsDivId: "announcements",
  primaryFocusTarget: "main h1, [role=main] h1",
  // This assumes you're setting the document title via some other means (e.g. React Helmet).
  // If you're not, you should return a unique and descriptive page title for each page
  // from this function and set `setPageTitle` to true.
  documentTitle: (route: Route) => new Promise(resolve => setTimeout(() => resolve(document.title))),
  // BYO localization
  navigationMessage: (title: string, route: Route, action: Action): string => `Navigated to ${title}.`,
  shouldHandleAction: (previousRoute: Route, nextRoute: Route, action: Action) => true,
  disableAutoScrollRestoration: true,
  announcePageNavigation: true,
  setPageTitle: false,
};

const history = createBrowserHistory();
const navigation = createBrowserNavigation({ routes, history });
await wrapNavigation(history, navigation);
...
```

### A note on focus outlines
You may see focus outlines around your `h1` elements (or elsewhere, per `primaryFocusTarget`) when using Oaf Navi.

You might be tempted to remove these focus outlines with something like the following:
```css
[tabindex="-1"]:focus {
  outline: 0 !important;
}
```

Don't do this! Focus outlines are important for accessibility. See for example:

* https://www.w3.org/TR/UNDERSTANDING-WCAG20/navigation-mechanisms-focus-visible.html
* https://www.w3.org/TR/2016/NOTE-WCAG20-TECHS-20161007/F78
* http://www.outlinenone.com/

Note that [Bootstrap 4 unfortunately removes these focus outlines](https://github.com/twbs/bootstrap/issues/28425). If you use Bootstrap, you can restore them with [Oaf Bootstrap 4](https://github.com/oaf-project/oaf-bootstrap-4).

All that said, if you absolutely _must_ remove focus outlines (stubborn client, stubborn boss, stubborn designer, whatever), consider using the [`:focus-visible` polyfill](https://github.com/WICG/focus-visible) so focus outlines are only hidden from mouse users, _not_ keyboard users.

## See also
* [Oaf Routing](https://github.com/oaf-project/oaf-routing)
* [Oaf Side Effects](https://github.com/oaf-project/oaf-side-effects)
