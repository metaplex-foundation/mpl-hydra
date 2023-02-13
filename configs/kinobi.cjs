const path = require("path");
const {
  Kinobi,
  RenderJavaScriptVisitor,
  SetAccountDiscriminatorFromFieldVisitor,
  SetInstructionAccountDefaultValuesVisitor,
  SetLeafWrappersVisitor,
  SetStructDefaultValuesVisitor,
  UpdateProgramsVisitor,
  UpdateAccountsVisitor,
  UpdateDefinedTypesVisitor,
  UpdateInstructionsVisitor,
  vEnum,
} = require("@metaplex-foundation/kinobi");

// Paths.
const clientDir = path.join(__dirname, "..", "clients");
const idlDir = path.join(__dirname, "..", "idls");

// Instanciate Kinobi.
const kinobi = new Kinobi([path.join(idlDir, "hydra.json")]);

// Update Programs.
kinobi.update(
  new UpdateProgramsVisitor({
    hydra: { name: "mplHydra" },
  })
);

// Update Accounts.
kinobi.update(
  new UpdateAccountsVisitor({
    //
  })
);

// Update Instructions.
kinobi.update(
  new UpdateInstructionsVisitor({
    //
  })
);

// Update Types.
kinobi.update(
  new UpdateDefinedTypesVisitor({
    //
  })
);

// Set account discriminators.
const tmKey = (name) => ({
  field: "key",
  value: vEnum("TokenMetadataKey", name),
});
kinobi.update(
  new SetAccountDiscriminatorFromFieldVisitor({
    "mplTokenMetadata.Edition": tmKey("EditionV1"),
  })
);

// Set default values for instruction accounts.
kinobi.update(
  new SetInstructionAccountDefaultValuesVisitor([
    //
  ])
);

// Wrap leaves.
kinobi.update(
  new SetLeafWrappersVisitor({
    //
  })
);

// Set struct default values.
kinobi.update(
  new SetStructDefaultValuesVisitor({
    //
  })
);

// Render JavaScript.
const jsDir = path.join(clientDir, "js", "src", "generated");
const prettier = require(path.join(clientDir, "js", ".prettierrc.json"));
kinobi.accept(new RenderJavaScriptVisitor(jsDir, { prettier }));
