# Hydra

Collective account pooling, fan out wallet, dao treasury, all the things you need to FAN OUT

## Development

This program is built, tested and generated from the root of the repository with pnpm and Anchor.
See the [root README](../../README.md) and [Contributing Guide](../../CONTRIBUTING.md) for full
details; the short version, run from the repository root:

```sh
pnpm install         # install the root tooling
pnpm programs:build   # build programs/.bin/mpl_hydra.so + fetch external programs
pnpm programs:test    # run the program tests
pnpm generate         # regenerate idls/hydra.json and the JS client
pnpm validator        # start a local Amman validator preloaded with the programs
pnpm clients:js:test  # run the JS client tests
```

Hydra is an Anchor `0.32.2` program built against Rust `1.89.0` (pinned in
[`rust-toolchain.toml`](../../rust-toolchain.toml)). Install the matching Anchor CLI with
[avm](https://www.anchor-lang.com/docs/installation):

```sh
avm install 0.32.2 && avm use 0.32.2
```
