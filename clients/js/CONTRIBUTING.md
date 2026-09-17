# Contributing to the JavaScript client

This is a quick guide to help you contribute to the JavaScript client of Mpl Hydra.

## Getting started

[Ensure you have pnpm installed](https://pnpm.io/installation) and run the following command to install the client's dependencies.

```sh
pnpm install
```

You can then run the following commands to build, test and lint the client.

```sh
# Build the client.
pnpm build

# Test the client (requires building first).
pnpm build && pnpm test

# Test a specific file or set of files.
pnpm build && pnpm test test/somefile.test.js
pnpm build && pnpm test test/somePattern*

# Lint and/or format the client.
pnpm lint:fix
pnpm format:fix
```

When something changes in the program(s), make sure to run `pnpm generate` in the root directory, to re-generate the clients accordingly.

## Publishing the JavaScript client

You can publish a new version of the JavaScript client by manually dispatching the "Publish JS Client" workflow — configured in [`.github/workflows/publish-js-client.yml`](../../.github/workflows/publish-js-client.yml) — from the GitHub Actions tab of the repository. It takes a few inputs:

- `git_ref` — Release tag (e.g. `release/hydra@0.4.2`) or commit to publish from. Leave empty to use the default branch.
- `bump` — The version bump to apply (`patch`, `minor`, `major`, or one of the `pre*` variants).
- `tag` — The NPM dist-tag (and preid for pre-releases) to publish under.
- `create_release` — Whether to open a release pull request once the package is built, tested and bumped.

Merging that release pull request into `main` triggers the "Release JS Client" workflow — configured in [`.github/workflows/release-js-client.yml`](../../.github/workflows/release-js-client.yml) — which tags the commit as `js@v<version>` and creates the corresponding GitHub release.

For this to work, some initial setup is required on the repository as explained below.

## Setting up GitHub actions

To publish JavaScript clients using GitHub actions, we first need the following secret variable to be set up on the repository.

- `NPM_TOKEN` — An access token that can publish your packages to NPM.
