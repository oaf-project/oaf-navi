[![Build Status](https://travis-ci.org/oaf-project/oaf-navi.svg?branch=master)](https://travis-ci.org/oaf-project/oaf-navi)
[![Known Vulnerabilities](https://snyk.io/test/github/oaf-project/oaf-navi/badge.svg?targetFile=package.json)](https://snyk.io/test/github/oaf-project/oaf-navi?targetFile=package.json)
[![Greenkeeper badge](https://badges.greenkeeper.io/oaf-project/oaf-navi.svg)](https://greenkeeper.io/)
[![npm](https://img.shields.io/npm/v/oaf-navi.svg)](https://www.npmjs.com/package/oaf-navi)

[![dependencies Status](https://david-dm.org/oaf-project/oaf-navi/status.svg)](https://david-dm.org/oaf-project/oaf-navi)
[![devDependencies Status](https://david-dm.org/oaf-project/oaf-navi/dev-status.svg)](https://david-dm.org/oaf-project/oaf-navi?type=dev)
[![peerDependencies Status](https://david-dm.org/oaf-project/oaf-navi/peer-status.svg)](https://david-dm.org/oaf-project/oaf-navi?type=peer)

# Oaf Navi
An accessible wrapper for [Navi](https://github.com/frontarm/navi)'s router.

## Installation

```sh
# yarn
yarn add oaf-navi

# npm
npm install oaf-navi
```

## Usage

```typescript
import { createBrowserNavigation } from "navi";
import { createBrowserHistory } from "history";
import { wrapNavigation } from "oaf-navi";

const history = createBrowserHistory();
const navigation = createBrowserNavigation({ routes, history });
await wrapNavigation(history, navigation);

...
```