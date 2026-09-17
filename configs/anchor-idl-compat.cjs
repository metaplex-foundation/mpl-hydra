/**
 * Converts an Anchor 0.30+ IDL (the format `anchor idl build` emits, and the
 * format of `idls/hydra.json`) into the legacy Anchor IDL format that
 * `@metaplex-foundation/kinobi@1.0.0-alpha.2` understands.
 *
 * Kinobi 1.0.0-alpha only ships parsers for the legacy Anchor/Shank IDL shape
 * (`isMut`/`isSigner`, `publicKey`, `defined: "Name"`, account structs inlined
 * under `accounts`). Support for the new Anchor spec only landed in its
 * successor, Codama. Rather than pin the client generator to a different
 * library, we normalise the IDL on the way in.
 *
 * The conversion is purely structural: names are camel-cased exactly the way
 * the pre-0.30 Anchor IDL spelled them, so the Anchor discriminators kinobi
 * derives from those names (sha256("global:<snake_case name>") for
 * instructions, sha256("account:<PascalCase name>") for accounts) stay
 * byte-identical. `assertDiscriminatorsMatch` checks that against the
 * discriminator bytes the new IDL states explicitly.
 */

const { createHash } = require("crypto");

const camelCase = (name) =>
  name.replace(/[_-]+(.)/g, (_, c) => c.toUpperCase()).replace(/^(.)/, (c) => c.toLowerCase());

const snakeCase = (name) =>
  name
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/[\s-]+/g, "_")
    .toLowerCase();

/** Leaf type renames between the new and the legacy spec. */
const LEAF_TYPES = { pubkey: "publicKey" };

function convertType(type) {
  if (typeof type === "string") return LEAF_TYPES[type] ?? type;
  if (Array.isArray(type)) return type.map(convertType);
  if (type === null || typeof type !== "object") return type;

  // `{ defined: { name: "Foo" } }` -> `{ defined: "Foo" }`.
  if ("defined" in type) {
    const defined = type.defined;
    return { defined: typeof defined === "string" ? defined : defined.name };
  }
  if ("option" in type) return { option: convertType(type.option) };
  if ("coption" in type) return { coption: convertType(type.coption) };
  if ("vec" in type) return { vec: convertType(type.vec) };
  if ("array" in type) return { array: [convertType(type.array[0]), type.array[1]] };
  if ("tuple" in type) return { tuple: type.tuple.map(convertType) };
  if (type.kind === "struct") {
    return { kind: "struct", fields: (type.fields ?? []).map(convertField) };
  }
  if (type.kind === "enum") {
    return {
      kind: "enum",
      variants: (type.variants ?? []).map((variant) => {
        if (!variant.fields) return { name: variant.name };
        const fields = variant.fields.map((field) =>
          field && typeof field === "object" && "name" in field
            ? convertField(field)
            : convertType(field)
        );
        return { name: variant.name, fields };
      }),
    };
  }
  throw new Error(`anchor-idl-compat: unsupported type ${JSON.stringify(type)}`);
}

function convertField(field) {
  const converted = { name: camelCase(field.name), type: convertType(field.type) };
  if (field.docs) converted.docs = field.docs;
  return converted;
}

function convertInstructionAccount(account) {
  // Nested account groups keep their shape; kinobi flattens them itself.
  if (account.accounts) {
    return {
      name: camelCase(account.name),
      accounts: account.accounts.map(convertInstructionAccount),
    };
  }
  const converted = {
    name: camelCase(account.name),
    isMut: account.writable === true,
    isSigner: account.signer === true,
  };
  if (account.optional === true) converted.isOptional = true;
  if (account.docs) converted.docs = account.docs;
  return converted;
}

function convertInstruction(instruction) {
  const converted = {
    name: camelCase(instruction.name),
    accounts: instruction.accounts.map(convertInstructionAccount),
    args: (instruction.args ?? []).map(convertField),
  };
  if (instruction.docs) converted.docs = instruction.docs;
  return converted;
}

const anchorDiscriminator = (prefix, name) => [
  ...createHash("sha256").update(`${prefix}:${name}`).digest().subarray(0, 8),
];

/**
 * Fails loudly if the discriminators kinobi will derive from the converted
 * names differ from the ones the Anchor IDL states.
 */
function assertDiscriminatorsMatch(idl, legacyIdl) {
  const check = (kind, stated, derived, name) => {
    if (!stated) return;
    if (stated.join(",") !== derived.join(",")) {
      throw new Error(
        `anchor-idl-compat: ${kind} "${name}" discriminator mismatch: ` +
          `IDL says [${stated}] but kinobi will derive [${derived}]`
      );
    }
  };
  idl.instructions.forEach((instruction, i) => {
    const name = legacyIdl.instructions[i].name;
    check("instruction", instruction.discriminator, anchorDiscriminator("global", snakeCase(name)), name);
  });
  (idl.accounts ?? []).forEach((account) => {
    check("account", account.discriminator, anchorDiscriminator("account", account.name), account.name);
  });
}

/** Converts an Anchor 0.30+ IDL object into the legacy Anchor IDL format. */
function toLegacyIdl(idl) {
  const accountNames = new Set((idl.accounts ?? []).map((account) => account.name));
  const typesByName = new Map((idl.types ?? []).map((type) => [type.name, type]));

  const legacyIdl = {
    version: idl.metadata?.version ?? "0.0.0",
    name: idl.metadata?.name ?? "",
    instructions: idl.instructions.map(convertInstruction),
    accounts: (idl.accounts ?? []).map((account) => {
      const type = typesByName.get(account.name);
      if (!type) {
        throw new Error(`anchor-idl-compat: no type definition for account "${account.name}"`);
      }
      const converted = { name: account.name, type: convertType(type.type) };
      if (type.docs) converted.docs = type.docs;
      return converted;
    }),
    // Legacy IDLs list account structs under `accounts` only.
    types: (idl.types ?? [])
      .filter((type) => !accountNames.has(type.name))
      .map((type) => {
        const converted = { name: type.name, type: convertType(type.type) };
        if (type.docs) converted.docs = type.docs;
        return converted;
      }),
    errors: (idl.errors ?? []).map((error) => ({
      code: error.code,
      name: error.name,
      msg: error.msg,
    })),
    metadata: {
      address: idl.address,
      origin: "anchor",
    },
  };

  assertDiscriminatorsMatch(idl, legacyIdl);
  return legacyIdl;
}

module.exports = { toLegacyIdl };
