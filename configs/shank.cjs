const path = require("path");
const { spawnSync } = require("child_process");

// Hydra is an Anchor program, so the IDL is produced by the Anchor CLI rather
// than by `@metaplex-foundation/shank-js`. The `anchor` generator of shank-js
// shells out to `anchor build` (a full SBF build) via rustbin and rewrites
// `metadata` with `origin`/`binaryVersion`/`libVersion` keys, which neither
// matches the Anchor 0.32 IDL spec nor reproduces the committed IDL
// byte-for-byte. `anchor idl build` writing the file itself does both.
//
// The Anchor CLI version must match the `anchor-lang` version used by the
// program (`ANCHOR_VERSION` in `.github/.env`).

const rootDir = path.join(__dirname, "..");
const idlDir = path.join(rootDir, "idls");
const programDir = path.join(rootDir, "programs", "hydra");

const programName = "hydra";
const idlPath = path.join(idlDir, `${programName}.json`);

const { status, error } = spawnSync("anchor", ["idl", "build", "-o", idlPath], {
  cwd: programDir,
  stdio: "inherit",
});

if (error) {
  if (error.code === "ENOENT") {
    console.error(
      "Could not find the `anchor` binary. Install the Anchor CLI version " +
        "matching `ANCHOR_VERSION` in `.github/.env`, e.g. " +
        "`cargo install anchor-cli --version 0.32.2 --locked` or `avm use 0.32.2`."
    );
  }
  throw error;
}

if (status !== 0) {
  console.error(`${programName} idl generation failed`);
  process.exit(status ?? 1);
}

console.log(`Wrote IDL to ${idlPath}`);
