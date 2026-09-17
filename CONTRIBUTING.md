# Contributing to Mpl Hydra

This is a quick guide to help you contribute to Mpl Hydra.

## Getting started

The root folder has a private `package.json` containing a few scripts and JavaScript dependencies that help generate IDLs; clients and start a local validator. First, [ensure you have pnpm installed](https://pnpm.io/installation) and run the following command to install the dependencies.

```sh
pnpm install
```

You will then have access to the following commands.

- `pnpm programs:build` - Build all programs and fetch all dependant programs.
- `pnpm programs:test` - Test all programs.
- `pnpm programs:debug` - Test all programs with logs enabled.
- `pnpm programs:clean` - Clean all built and fetched programs.
- `pnpm clients:js:test` - Run the JS client tests.
- `pnpm generate` - Shortcut for `pnpm generate:idls && pnpm generate:clients`.
- `pnpm generate:idls` - Generate IDLs for all programs, as configured in the `configs/shank.cjs` file.
- `pnpm generate:clients` - Generate clients using Kinobi, as configured in the `configs/kinobi.cjs` file.
- `pnpm validator` - Start a local validator using Amman, as configured in the `configs/validator.cjs` file.
- `pnpm validator:debug` - Start a local validator using Amman with logs enabled, as configured in the `configs/validator.cjs` file.
- `pnpm validator:stop` - Stop the local validator.
- `pnpm validator:logs` - Show the logs of the local validator.
- `pnpm lint` - Check the formatting of the JS client and of the program.
- `pnpm lint:fix` / `pnpm format:fix` - Fix the formatting of the JS client and of the program.

## Toolchain

Hydra is an [Anchor](https://www.anchor-lang.com) program. The versions used by CI live in
[`.github/.env`](./.github/.env) and should be mirrored locally:

| Tool | Version |
| ---- | ------- |
| Rust | `1.89.0` (also pinned in `rust-toolchain.toml`) |
| Solana | `2.3.5` |
| Anchor CLI | `0.32.2` |
| Node.js | `20.x` |
| pnpm | `10.x` (see `packageManager` in `package.json`) |

Install the Anchor CLI with either:

```sh
avm install 0.32.2 && avm use 0.32.2
# or
cargo install anchor-cli --version 0.32.2 --locked
```

## Building the program

```sh
pnpm programs:build
```

This fetches the external programs the local validator needs (Token Metadata, System Extras and
Token Extras) into `programs/.bin` and builds `programs/.bin/mpl_hydra.so` with `cargo build-sbf`.

## Generating the IDL and clients

```sh
pnpm generate
```

`pnpm generate:idls` runs `anchor idl build` inside `programs/hydra` — the root `Anchor.toml`
declares the workspace it needs — and writes `idls/hydra.json`. `pnpm generate:clients` then feeds
that IDL to Kinobi to render `clients/js/src/generated`.

Both are expected to be reproducible: CI runs `pnpm generate` and fails if the working directory is
not clean afterwards. Re-run `pnpm generate` whenever something changes in the program.

## Managing clients

Each client has its own README with instructions on how to get started. You can find them in the `clients` folder.

- [JavaScript client](./clients/js/README.md)

## Setting up CI/CD using GitHub actions

Most of the CI/CD should already be set up for you and the `.github/.env` file can be used to tweak the variables of the workflows.

However, the "Publish JS Client" workflow — configured in `.github/workflows/publish-js-client.yml` — requires a few more steps to work. See the [CONTRIBUTING.md file of the JavaScript client](./clients/js/CONTRIBUTING.md#setting-up-github-actions) for more information.
