# Mpl Hydra

Hydra is a wallet of wallets, a fanout wallet if you will. It enables extremely large membership sets that can take part in fund distribution from a central wallet. It works with SOL and any SPL token.

## Programs

This project contains the following programs:

- [Mpl Hydra](./programs/hydra/README.md) `hyDQ4Nz1eYyegS6JfenyKwKzYxRsCWCriYSAjtzP4Vg`

Hydra is an [Anchor](https://www.anchor-lang.com) program. The toolchain versions used by CI are
declared in [`.github/.env`](./.github/.env):

| Tool | Version |
| ---- | ------- |
| Rust | `1.89.0` |
| Solana | `2.3.5` |
| Anchor CLI | `0.32.2` |
| Node.js | `20.x` |
| pnpm | `10.x` |

## Clients

This project contains the following clients:

- [JavaScript](./clients/js/README.md)

## Quick start

```sh
pnpm install         # install the root tooling
pnpm programs:build  # build programs/.bin/mpl_hydra.so + fetch external programs
pnpm programs:test   # run the program tests
pnpm generate        # regenerate idls/hydra.json and the JS client
pnpm validator       # start a local Amman validator preloaded with the programs
```

## Contributing

Check out the [Contributing Guide](./CONTRIBUTING.md) the learn more about how to contribute to this project.
