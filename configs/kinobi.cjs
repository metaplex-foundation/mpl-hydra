const path = require("path");
const {
  Kinobi,
  RenderJavaScriptVisitor,
  UpdateProgramsVisitor,
  TransformNodesVisitor,
  UpdateAccountsVisitor,
  InstructionNode,
  assertInstructionNode,
  UpdateInstructionsVisitor,
  TypeStructNode,
  UnwrapDefinedTypesVisitor,
  FlattenInstructionArgsStructVisitor,
  TypePublicKeyNode,
  TypeStringNode,
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

// Remove "process" prefix from instructions.
kinobi.update(
  new TransformNodesVisitor([
    {
      selector: { type: "InstructionNode" },
      transformer: (node) => {
        assertInstructionNode(node);
        if (!node.name.startsWith("process")) return node;
        const newName = node.name.replace(/^process/, "");
        return new InstructionNode(
          { ...node.metadata, name: newName },
          node.accounts,
          new TypeStructNode(newName + "InstructionArgs", node.args.fields),
          node.subInstructions
        );
      },
    },
  ])
);

// Update Accounts.
kinobi.update(
  new UpdateAccountsVisitor({
    fanout: {
      size: 300,
      seeds: [
        { kind: "literal", value: "fanout-config" },
        {
          kind: "variable",
          name: "name",
          description: "The name of the fanout account",
          type: new TypeStringNode({ size: { kind: "variable" } }),
        },
      ],
    },
    fanoutMembershipVoucher: {
      size: 153,
      seeds: [
        { kind: "literal", value: "fanout-membership" },
        {
          kind: "variable",
          name: "fanout",
          description: "The address of the fanout account",
          type: new TypePublicKeyNode(),
        },
        {
          kind: "variable",
          name: "member",
          description: "The member's public key",
          type: new TypePublicKeyNode(),
        },
      ],
    },
    fanoutMint: {
      size: 200,
      seeds: [
        { kind: "literal", value: "fanout-config" },
        {
          kind: "variable",
          name: "fanout",
          description: "The address of the fanout account",
          type: new TypePublicKeyNode(),
        },
        {
          kind: "variable",
          name: "mint",
          description: "The address of the mint account",
          type: new TypePublicKeyNode(),
        },
      ],
    },
    fanoutMembershipMintVoucher: {
      size: 105,
      seeds: [
        { kind: "literal", value: "fanout-membership" },
        {
          kind: "variable",
          name: "fanout",
          description: "The address of the fanout account",
          type: new TypePublicKeyNode(),
        },
        {
          kind: "variable",
          name: "membership",
          description: "The address of the membership account",
          type: new TypePublicKeyNode(),
        },
        {
          kind: "variable",
          name: "mint",
          description: "The address of the mint account",
          type: new TypePublicKeyNode(),
        },
      ],
    },
  })
);

// Update Instructions.
const holdingAccountPdaDefaults = {
  kind: "pda",
  pdaAccount: "fanoutNativeAccount",
  dependency: "hooked",
  seeds: { fanout: { kind: "account", name: "fanout" } },
};
kinobi.update(
  new UpdateInstructionsVisitor({
    init: {
      bytesCreatedOnChain: {
        kind: "number",
        includeHeader: false,
        value:
          300 + // Fanout account.
          1 + // Holding account.
          128 * 2, // 2 account headers.
      },
      accounts: {
        fanout: {
          defaultsTo: { kind: "pda" },
          pdaBumpArg: "bumpSeed",
        },
        holdingAccount: {
          defaultsTo: holdingAccountPdaDefaults,
          pdaBumpArg: "nativeAccountBumpSeed",
        },
        membershipMint: {
          defaultsTo: {
            kind: "publicKey",
            publicKey: "So11111111111111111111111111111111111111112",
          },
        },
      },
    },
    addMemberWallet: {
      bytesCreatedOnChain: { kind: "account", name: "fanoutMembershipVoucher" },
      accounts: {
        membershipAccount: {
          defaultsTo: { kind: "pda", pdaAccount: "fanoutMembershipVoucher" },
        },
      },
    },
  })
);

// Unwrap addMemberArgs type.
kinobi.update(new UnwrapDefinedTypesVisitor(["addMemberArgs"]));
kinobi.update(new FlattenInstructionArgsStructVisitor());

// Render JavaScript.
const jsDir = path.join(clientDir, "js", "src", "generated");
const prettier = require(path.join(clientDir, "js", ".prettierrc.json"));
kinobi.accept(new RenderJavaScriptVisitor(jsDir, { prettier }));
