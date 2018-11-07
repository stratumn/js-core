# Stratumn Core Utilities

[![Build Status](https://travis-ci.org/stratumn/js-core.svg?branch=master)](https://travis-ci.org/stratumn/js-core)
[![codecov](https://codecov.io/gh/stratumn/js-core/branch/master/graph/badge.svg)](https://codecov.io/gh/stratumn/js-core)
[![Language Grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/stratumn/js-core.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/stratumn/js-core/context:javascript)

[Stratumn](https://stratumn.com)'s open-source utilities to create
decentralized applications and networks.

To get started, visit our [developer portal](https://developer.stratumn.com).

---

## Build

This project uses [Typescript](https://www.typescriptlang.org),
[Yarn](https://yarnpkg.com) and [Lerna](https://lernajs.io/).

To install dependencies, simply run:

```bash
yarn
```

To link packages locally, run:

```bash
lerna bootstrap
```

To build libraries, run:

```bash
yarn tsc
```

Don't forget to run the linter as well (if you are using VS Code, we recommend
setting `tslint.autoFixOnSave`):

```bash
yarn lint
```

## Publish

We use lerna to publish packages to npm:

```bash
yarn publish:npm
```
